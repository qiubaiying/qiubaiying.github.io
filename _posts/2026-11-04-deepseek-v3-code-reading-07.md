---
layout:     post
title:      DeepSeek-V3 源码精读（7）：256 选 8，怎么不旱涝不均
subtitle:   分组路由压的是最坏 fan-out，bias 修正压的是负载——两件事各三行代码，却常被说成一件
date:       2026-11-04
author:     WY
header-img: img/post-bg-map.jpg
catalog:    true
description: 拆开 Gate.forward 的 23 行：候选池怎么从 256 变成 128、为什么分组路由只改尾部不改均值、bias 凭什么完全不进梯度、route_scale 为什么不是温度、以及一个真的会写穿 original_scores 的别名。
math:       true
series:     deepseek-source
chapter:    7
source:     deepseek-ai/DeepSeek-V3@9b4e9788e4a3
tags:
    - 人工智能
    - 深度学习
    - 大语言模型
    - 神经网络
---

## 开篇：256 个坑位，8 个人

61 层里有 58 层是 MoE。每层 256 个路由专家，每个 token 只走 8 个。

这个设计最容易被讲错的地方在于：大家关心「怎么选出最合适的 8 个」，但真正难的是「怎么保证剩下 248 个不被永久荒废」。选得准不准，影响一两个 token 的质量；负载塌了，影响的是训练能不能收敛——少数专家被反复训练、其余专家拿不到梯度，等于用 671B 的显存跑了一个 50B 的模型，而且再也回不来。

V3 的训练里没有任何辅助损失（auxiliary loss）。`Gate` 的 23 行里没有一项惩罚，只有一个长 256 的 `bias`，用三行规则悄悄改分数。

这期只解决一个问题：**在没有 aux loss 的情况下，256 个专家的负载靠什么拉平？**

先把结论放在前面，因为它和多数讲解相反：**拉平负载的不是分组路由，是那个 bias。分组路由做的是另一件事——把每个 token 最多要访问的节点数从 8 压到 4。** 两件事在代码里只隔了十行，于是一直被混成一件。

## 第 7 期：256 选 8，选完还剩什么

### 1. 先算账：8/256 换来的不是「算得少」

`Gate` 是整个 MoE 层最不起眼的模块。`weight` 是 `[256, 7168]`，1,835,008 个参数，占一层 MoE 的 0.016%。

| 项 | 形状 | 参数量 | 占一层 MoE |
|---|---|---|---|
| gate | 256 × 7168 | 1,835,008 | 0.016% |
| 单个路由专家 | 3 × (7168 × 2048) | 44,040,192 | — |
| 256 个路由专家 | 256 × 44.04M | 11,274,289,152 | 97.98% |
| 共享专家（1 个，宽 2048） | 3 × (7168 × 2048) | 44,040,192 | 0.383% |
| MLA 注意力 | 见第 5 期 | 187,107,328 | 1.626% |
| 一层合计 | | 11,507,271,680 | 100% |

× 58 层 = 667.42B，加上 3 个稠密层的 1.75B 和嵌入输出头的 1.85B，就是 671B。gate 在整本账里可以忽略——**一个负责给 99.98% 的参数分配工作的模块，自己只有 183 万个参数。**

再看激活侧。每 token 每层激活 8 × 44.04M + 44.04M + 1.835M + 187.1M = 585.3M。

这里藏着一个不是巧合的等式：**9 × 2048 = 18432 = `inter_dim`**。8 个路由专家加 1 个共享专家，每个宽 2048，拼起来正好等于稠密层 FFN 的 18432。所以 MoE 层每 token 的 FFN 乘加是 3 × 7168 × 18432 = 396,361,728 次，和稠密层**一模一样，一次不多一次不少**。

于是「256 选 8」买到的东西可以精确说清楚：不是「算得更少」，而是**同样的算力装下 58 倍的参数**。671B 总量、37.4B 激活，激活率 5.6%；但按每 token 的计算量算，它就是一个 16B 级别的稠密模型。省下的部分，是相对「671B 稠密模型」省的（约 1/18），不是相对 16B 省的——后者它一分都没省。

8 个专家占 256 个的 3.125%，却承担了这个 token FFN 计算的 88.5%（352.3M / 398.2M）。剩下 11.5% 由共享专家和 gate 分掉。

### 2. 一条 shape 流水线

读路由代码卡住的地方从来不是逻辑，是形状。`x` 进 `Gate` 时是三维，出来是两个二维张量，中间还要经历一次「二维 → 三维 → 二维」的折叠。

```
x                       [B, S, 7168]
view(-1, 7168)          [T, 7168]              T = B*S，一个 token 一行
linear(x, W_gate)       [T, 256]               每 token 256 个分数
sigmoid                 [T, 256]               逐元素，(0,1)，互不归一
+ bias                  [T, 256]               fp32，只给排序用
view(T, 8, 32)          [T, 8, 32]             8 组 × 每组 32 个专家
topk(2).sum(-1)         [T, 8]                 每组前 2 名之和
topk(4)[1]              [T, 4]                 选中的 4 个组号
scatter_(1, idx, False) [T, 8]                 布尔 mask，True = 屏蔽
masked_fill(-inf)       [T, 8, 32] → [T, 256]  未选中的 4 组共 128 个专家置 -inf
topk(8)[1]              [T, 8]                 专家编号，取值 0..255
original.gather(1,·)    [T, 8]                 每个坑位的权重
* 2.5                   [T, 8]                 权重和恒为 2.5
```

两个输出：`indices` 是 `[T, 8]` 的专家编号，`weights` 是 `[T, 8]` 的权重。注意它们不是一一对应的「第 k 个专家配第 k 个权重」——`indices[t, j]` 是第 t 个 token 第 j 个坑位坐的专家，`weights[t, j]` 是它拿到的份额。第 8 期那个 `torch.where(indices == i)` 之所以返回两个坐标，就是为了把「第几个 token」和「第几个坑位」一起拿回来。

再往下走一步，`MoE.forward` 把它们变成输出：

```
y = zeros               [T, 7168]
where(indices == i)     [n_i], [n_i]           n_i = 第 i 个专家分到的 token 数
expert(x[idx])          [n_i, 7168]            只算属于自己的那些行
* weights[idx, top]     [n_i, 1]               按坑位取权重
y[idx] += ...           [T, 7168]              8 个专家累加进同一个张量
+ shared_experts(x)     [T, 7168]              共享专家走另一条路
view(shape)             [B, S, 7168]
```

### 3. 23 行里的三次分叉

`forward` 的全部内容就是下面这些（{% include src.html path="inference/model.py" lines="576-598" %}），加上 `__init__` 里创建参数的 2 行（{% include src.html path="inference/model.py" lines="563-564" %}）。

```python
# inference/model.py:563-564, 576-598
        self.weight = nn.Parameter(torch.empty(args.n_routed_experts, args.dim))
        self.bias = nn.Parameter(torch.empty(args.n_routed_experts, dtype=torch.float32)) if self.dim == 7168 else None
        scores = linear(x, self.weight)
        if self.score_func == "softmax":
            scores = scores.softmax(dim=-1, dtype=torch.float32)
        else:
            scores = scores.sigmoid()
        original_scores = scores
        if self.bias is not None:
            scores = scores + self.bias
        if self.n_groups > 1:
            scores = scores.view(x.size(0), self.n_groups, -1)
            if self.bias is None:
                group_scores = scores.amax(dim=-1)
            else:
                group_scores = scores.topk(2, dim=-1)[0].sum(dim=-1)
            indices = group_scores.topk(self.topk_groups, dim=-1)[1]
            mask = scores.new_ones(x.size(0), self.n_groups, dtype=bool).scatter_(1, indices, False)
            scores = scores.masked_fill_(mask.unsqueeze(-1), float("-inf")).flatten(1)
        indices = torch.topk(scores, self.topk, dim=-1)[1]
        weights = original_scores.gather(1, indices)
        if self.score_func == "sigmoid":
            weights /= weights.sum(dim=-1, keepdim=True)
        weights *= self.route_scale
        return weights.type_as(x), indices
```

一条直线读下来，只有三个分叉，每个分叉对应一种模型配置。

**分叉一（577-580）是打分函数。** 16B 和 236B 的配置里根本没写 `score_func`，走 `ModelArgs` 的默认值 `"softmax"`；只有 671B 显式写了 `"sigmoid"`。差别不是「归一化方式」，是**专家之间有没有竞争**：softmax 的分母是 256 个专家共用的，一个涨、其余全跌；sigmoid 是逐个算的，谁也不知道谁。后果在第 595 行：sigmoid 必须手工归一化，softmax 不用——它的 top-8 权重和远小于 1，剩下的质量被直接丢掉。

**分叉二（584-592）是分组路由。** 671B 是 8 组选 4 组，236B 是 8 组选 3 组，16B 没有这个字段（默认 1），整段跳过。

**分叉三（582-583）是 bias。** 只在 `self.dim == 7168` 时创建，也就是只有 671B 有。第 564 行那个 `self.dim == 7168` 是一句硬编码的「是不是 671B」——拿这套代码跑一个 dim 不是 7168 的自定义配置，你会得到一个没有 bias 的 Gate，而 `load_model` 默认 strict 加载，checkpoint 里多出来的 `gate.bias` 会直接报 unexpected key。

三个分叉不是 8 种组合，实际只有三种：16B（softmax、无组、无 bias）、236B（softmax、8 选 3、无 bias）、671B（sigmoid、8 选 4、有 bias）。**代码里所有「A 还是 B」的判断，落到配置上都是「哪个模型」。**

### 4. 分组路由砍的是尾巴，不是均值

先对齐一个事实：这里的分组不是抽象的「一类专家」。技术报告 4.2 节写明，256 个路由专家均匀部署在 8 个节点的 64 张卡上——每节点 32 个专家，正好一组。所以 `n_expert_groups=8` 对应的就是 8 个节点，`n_limited_groups=4` 对应「每个 token 最多发往 4 个节点」。

这就解释了为什么必须**先选组，再选专家**。约束是集合级的（选中的 8 个专家最多分布在 4 个组里）。如果先做专家级 top-8 再检查约束，违反时就得重选；把候选池先砍到 4 组 × 32 = 128 个，约束就自动成立了——在 128 个候选里选 8 个，最多只能跨 4 组。

它买到了什么？我把 8000 条带偏斜的分数灌进去，统计每个 token 的 8 个专家跨越了几个组：

| 跨度 | 1 组 | 2 组 | 3 组 | 4 组 | 5 组 | 6 组 | 均值 | 最大 |
|---|---|---|---|---|---|---|---|---|
| 不分组 | 0.4% | 18.4% | 50.9% | 26.9% | 3.4% | 0.1% | 3.145 | 6 |
| 分组后 | 0.4% | 18.4% | 50.9% | 30.3% | 0 | 0 | 3.111 | 4 |

均值从 3.145 掉到 3.111，几乎没动；**变的只有尾部**：3.5% 的 token 本来会跨 5 到 6 个节点，现在被硬按在 4 个以内。

换算成通信：fp8 下一个 token 的隐状态是 7168 字节，每多一个目的节点就要多一份跨节点的拷贝。一批 4096 个 token、一层 MoE，4 个节点是 112 MiB，8 个节点是 224 MiB；乘 58 层，6.34 GiB 对 12.69 GiB。**分组路由省的是这个上界，不是平均值。** 平均值本来就只有 3.1。

代价呢？被分组挡掉的候选里，可能有本该入选的专家。实测结果是：分组后的 8 个专家与「全局 top-8」的平均重合率 0.9952，96.59% 的 token 一个都没换。用 0.5% 的坑位换一个有保证的 fan-out 上界，这笔买卖很划算。

这里还有一个值得盯一眼的字面量：第 589 行的 `topk(2)`。这个 2 不是超参，是 $K_r / M = 8 / 4$——论文写的是「取该节点上分数最高的 $K_r/M$ 个专家求和」。两个已发布配置的 $K_r/M$ 恰好都等于 2（671B 是 8/4，236B 是 6/3），所以这个硬编码一直没被撞破。把 `n_limited_groups` 改成 2 而 `topk` 还是 8，需要的是 top-4 之和，代码仍然只取 2 个，而且不会报错。

顺带一提，第 586-587 行那条 `amax` 分支：`bias is None` 时用组内最大值，而不是 top-2 之和。236B 的配置正好走这条（dim=5120，没有 bias），而它的 $K_r/M$ 也是 2——所以它和论文写的不是一回事。这是 V2 时代的遗留还是有意为之，代码本身给不出答案。

### 5. bias：一个故意不拿梯度的参数

现在说真正管负载的那三行。

技术报告的原话是：bias **只用于路由**，用于乘 FFN 输出的门控值仍然来自原始亲和度分数。代码把这句话拆成了三个动作：

- 第 581 行 `original_scores = scores`：在加 bias **之前**留一个引用；
- 第 583 行 `scores = scores + self.bias`：排序用的分数；
- 第 594 行 `weights = original_scores.gather(1, indices)`：加权用的分数，从**没有 bias 的那份**里取。

三行的效果是：bias 能决定谁入选，但决定不了入选者拿多少。这个参数在 checkpoint 里其实不叫 `bias`——{% include src.html path="inference/convert.py" lines="61" text="convert.py 第 61 行" %} 把 `e_score_correction_bias` 改名成了 `bias`。名字里的 correction 说的正是这件事：**它修正的是选择，不是数值。**

所以门控权重可以写成

$$g_{i,t}=\frac{\mathrm{sigmoid}\left(s_{i,t}\right)}{\sum_{j\in S_t}\mathrm{sigmoid}\left(s_{j,t}\right)}\cdot 2.5$$

式子里根本没有 $b_i$。$b_i$ 只出现在 top-k 的比较里：$s_{i,t}+b_i$ 排进前 8，专家才被选中。

这个设计的直接后果是：**bias 拿不到梯度。** 它只参与 `topk` 的 key，而 argmax 的导数是零。它是一个 `nn.Parameter`，却在反向传播里永远收不到信号——它的更新是手写的：

$$b_i\leftarrow b_i-\gamma\quad(\text{overloaded}),\qquad b_i\leftarrow b_i+\gamma\quad(\text{underloaded})$$

每个训练步结束，统计整个 batch 上每个专家分到多少 token，过载的减 $\gamma$、欠载的加 $\gamma$。技术报告给的 $\gamma$ 是 0.001，前 14.3T token 用它，最后 500B token 直接归零——**训练末期不再调，让路由稳定下来**。

这也解释了第 564 行为什么非要 `dtype=torch.float32`。$\gamma$ 是 0.001，bias 的累加要在小数点后第三位上稳定地走；bf16 的尾数只有 7 位，累加到 0.5 附近时一个 ulp 就是 0.0039，再加 0.001 会被直接舍掉。我把这个累加跑了一遍：连加 1000 次 0.001，fp32 得到 1.0000，bf16 停在 **0.5000**——一半的修正被吞了。

还有一处容易漏的耦合：bias 加在组分数**之前**。第 583 行加完，第 585 行才 `view(T, 8, 32)`，所以组分数用的是带 bias 的分数。这意味着一个专家的 bias 不只改自己在组内的排名，还能把整个组顶进或顶出 top-4——那是一次 32 个专家同时开关的集体动作。这也是后面复现里 $\gamma$ 一大就开始振荡的原因：被控对象不是连续函数，是一个带阶跃的开关。

### 6. 一个真的会写穿的别名

第 581 行那句 `original_scores = scores` 是**绑定**，不是拷贝。这一点在 671B 的路径上无害，因为第 583 行的 `scores = scores + self.bias` 是重新绑定，别名当场就断了，后面第 592 行的就地 `masked_fill_` 改的是新张量。

但 236B 的配置走的是另一条路：`bias is None`，第 583 行不执行，`scores` 和 `original_scores` 仍然是同一个张量。接着第 585 行 `view` 出三维视图（共享存储），第 592 行 `masked_fill_` 就地写入 `-inf`——**这一刀是真的写进了 `original_scores`**。

我数了一下：单个 token 过一次 `Gate`，`original_scores` 里就多出 128 个 `-inf`（= 未选中的 4 组 × 32 个专家），一个不多一个不少。

那为什么结果还是对的？因为 `mask` 只标未选中的组，而第 593 行的 top-8 是从**被屏蔽后**的分数里选的，选出来的 8 个必然落在未屏蔽区。第 594 行的 `gather` 只碰这 8 个位置，永远取不到 `-inf`。写坏的地方，恰好是永远不会被读的地方。

这是「碰巧正确」的典型形态：两层保护叠在一起，第一层（671B 的 rebind）让别名断掉，第二层（gather 的可达性）让别名即使不断也无害。任何一层被改动，另一层还能兜住——所以它至今没出事。

但它是脆的。现在 `inference/` 里没有任何代码在 `forward` 之后读 `original_scores`，所以没人被咬。哪天想加一个路由可视化、一个 per-expert 的监控指标、或者一个真正需要原始分数的辅助损失，读到的就是一片 `-inf`。这不是 bug，是一个埋着的约束：**`Gate.forward` 之后，传进去的那个张量已经被污染了。**

### 7. 复现：20 步能不能把 5.6 倍拉平

下面这段只用标准库，单核 CPU，十秒内跑完。它把 `Gate.forward` 逐行搬到纯 Python，跑六个实验：route_scale 改不改排序、分组路由改了跨度还是改了均值、bias 进不进权重、别名有没有写穿、20 步预算下 $\gamma$ 的作用、以及 bias 为什么必须是 fp32。

```python
# gate_lab.py
import heapq, math, random, struct
import statistics as st

E, NG, K, KG = 256, 8, 8, 4        # 专家数 / 组数 / topk / 选几组
PER = E // NG                      # 每组 32 个
RS = 2.5

def sigmoid(v):
    return 1.0 / (1.0 + math.exp(-v))

def gate(logits, bias=None, route_scale=RS):
    scores = [sigmoid(v) for v in logits]                  # 576-580
    original = scores                                      # 581 别名
    if bias is not None:
        scores = [s + b for s, b in zip(scores, bias)]     # 583 rebind
    if NG > 1:
        gs = [sum(heapq.nlargest(2, scores[g*PER:(g+1)*PER]))
              if bias is not None else max(scores[g*PER:(g+1)*PER])
              for g in range(NG)]
        keep = set(heapq.nlargest(KG, range(NG), key=gs.__getitem__))
        for i in range(E):                                 # 592 masked_fill_
            if i // PER not in keep:
                scores[i] = -math.inf
    idx = heapq.nlargest(K, range(E), key=scores.__getitem__)   # 593
    w = [original[i] for i in idx]                         # 594
    tot = sum(w)
    return [x / tot * route_scale for x in w], idx, original

def skewed(ramp=1.5, sigma=1.0):
    return [ramp - 2*ramp*i/(E-1) + random.gauss(0, sigma) for i in range(E)]

# E1 route_scale 改不改排序？
random.seed(1)
same = sum(gate(z := [random.gauss(0, 1) for _ in range(E)], route_scale=1.0)[1]
           == gate(z, route_scale=100.0)[1] for _ in range(500))
sums = [sum(gate([random.gauss(0, 1) for _ in range(E)])[0]) for _ in range(500)]
print(f"E1 route_scale 1 vs 100，索引相同 {same}/500；Σw ∈ [{min(sums):.6f}, {max(sums):.6f}]")

# E2 分组路由改变的是跨度，不是均值
random.seed(2)
raw, lim, ov = [], [], []
for _ in range(8000):
    z = skewed()
    top = set(heapq.nlargest(K, range(E), key=z.__getitem__))
    raw.append(len({i//PER for i in top}))
    keep = {g for g in heapq.nlargest(KG, range(NG), key=lambda g: max(z[g*PER:(g+1)*PER]))}
    capped = set(heapq.nlargest(K, [i for i in range(E) if i//PER in keep], key=z.__getitem__))
    lim.append(len({i//PER for i in capped}))
    ov.append(len(top & capped) / K)
h = lambda xs: {v: f"{xs.count(v)/len(xs):.1%}" for v in range(1, 9) if xs.count(v)}
print(f"E2 跨度 无限制 {h(raw)} 均值 {st.mean(raw):.3f} 最大 {max(raw)}")
print(f"E2 跨度 分组后 {h(lim)} 均值 {st.mean(lim):.3f} 最大 {max(lim)}")
print(f"E2 与全局 top-8 重合率 {st.mean(ov):.4f}，完全一致 {ov.count(1.0)/len(ov):.2%}")

# E3 bias 只改排序，不改权重
random.seed(3)
worst = 0.0
for _ in range(200):
    z = skewed()
    b = [random.uniform(-3, 3) for _ in range(E)]
    w, idx, orig = gate(z, bias=b)
    hand = [orig[i] for i in idx]
    tot = sum(hand)
    worst = max(worst, max(abs(x - y) for x, y in zip(w, [t/tot*RS for t in hand])))
print(f"E3 weights 与「pre-bias 分数手算」的最大差 {worst:.1e}")

# E4 bias=None 时 masked_fill_ 会写穿 original_scores
random.seed(4)
w, idx, orig = gate(skewed(), bias=None)
print(f"E4 前向之后 original_scores 里 -inf 的个数 {sum(1 for v in orig if v == -math.inf)}"
      f"（应为 {E - KG*PER} = 未选中的 {NG-KG} 组）")
print(f"E4 但 weights 仍正确：和 {sum(w):.4f}，最小 {min(w):.4f}")

# E5 20 步预算下扫 γ，在 512 条固定 token 上评估
def run(gamma, steps=20, T=512, ramp=1.5, sigma=1.0, seed=5, check=(0, 5, 10, 20)):
    random.seed(seed)
    evalz = [[ramp - 2*ramp*i/(E-1) + random.gauss(0, sigma) for i in range(E)] for _ in range(T)]
    bias, out = [0.0]*E, {}
    for step in range(steps + 1):
        if step in check:
            load = [0]*E
            for z in evalz:
                for i in gate(z, bias=bias)[1]:
                    load[i] += 1
            mean = T * K / E
            out[step] = (max(load)/mean, sum(1 for v in load if v == 0))
        if step == steps:
            break
        tl = [0]*E
        for _ in range(T):
            for i in gate(skewed(ramp, sigma), bias=bias)[1]:
                tl[i] += 1
        for i in range(E):
            bias[i] += gamma if tl[i] < T*K/E else (-gamma if tl[i] > T*K/E else 0)
    return out, bias

for g in (0.001, 0.005, 0.02, 0.1):
    c, b = run(g)
    print(f"E5 γ={g:<5} max/mean {[round(c[i][0], 2) for i in (0, 5, 10, 20)]}  "
          f"饿死 {[c[i][1] for i in (0, 10, 20)]}  bias[{min(b):+.2f},{max(b):+.2f}]")

random.seed(5)
load = [0]*E
for z in [[random.gauss(0, 1) for _ in range(E)] for _ in range(512)]:
    for i in gate(z, bias=[0.0]*E)[1]:
        load[i] += 1
print(f"E5 对照（无偏斜、bias=0）max/mean {max(load)/(512*K/E):.2f}  饿死 {sum(1 for v in load if v == 0)}")

# E6 bias 为什么必须是 float32
def bf16(x):
    i = struct.unpack("<I", struct.pack("<f", x))[0]
    return struct.unpack("<f", struct.pack("<I", (i + 0x8000) & 0xFFFF0000))[0]

acc32 = acc16 = 0.0
for _ in range(1000):
    acc32 += 0.001
    acc16 = bf16(bf16(acc16) + bf16(0.001))
print(f"E6 累加 1000 次 0.001：fp32 → {acc32:.4f}   bf16 → {acc16:.4f}")
```

输出（本机 CPython 3.13，单核，约 10 秒）：

```
E1 route_scale 1 vs 100，索引相同 500/500；Σw ∈ [2.500000, 2.500000]
E2 跨度 无限制 {1: '0.4%', 2: '18.4%', 3: '50.9%', 4: '26.9%', 5: '3.4%', 6: '0.1%'} 均值 3.145 最大 6
E2 跨度 分组后 {1: '0.4%', 2: '18.4%', 3: '50.9%', 4: '30.3%'} 均值 3.111 最大 4
E2 与全局 top-8 重合率 0.9952，完全一致 96.59%
E3 weights 与「pre-bias 分数手算」的最大差 0.0e+00
E4 前向之后 original_scores 里 -inf 的个数 128（应为 128 = 未选中的 4 组）
E4 但 weights 仍正确：和 2.5000，最小 0.3032
E5 γ=0.001 max/mean [5.62, 5.5, 5.25, 5.12]  饿死 [86, 79, 72]  bias[-0.02,+0.02]
E5 γ=0.005 max/mean [5.62, 4.81, 4.06, 2.25]  饿死 [86, 44, 12]  bias[-0.10,+0.10]
E5 γ=0.02  max/mean [5.62, 3.38, 2.62, 3.81]  饿死 [86, 0, 0]  bias[-0.12,+0.32]
E5 γ=0.1   max/mean [5.62, 5.25, 4.0, 7.56]  饿死 [86, 22, 47]  bias[+0.40,+0.90]
E5 对照（无偏斜、bias=0）max/mean 1.75  饿死 0
E6 累加 1000 次 0.001：fp32 → 1.0000   bf16 → 0.5000
```

三行结论。

**第一，$\gamma$ 的作用是「每步挪多少」，20 步能挪的总量就是 $20\gamma$。** $\gamma=0.001$ 时 20 步只挪 0.02，相对 3.0 的分数跨度等于没动：max/mean 从 5.62 降到 5.12，仍有一批专家一个 token 都拿不到（86 → 72）。$\gamma=0.005$ 挪 0.10，降到 2.25、饿死数掉到 12；$\gamma=0.02$ 的上限是 0.4，把饿死数压到 **0**。

不过 $\gamma=0.02$ 那一行还有半句要说：第 10 步到第 20 步，max/mean 从 2.62 回升到 3.81。饿死清零了，最大负载却开始来回摆——这是振荡的前兆，也是下面第二条的引子。

这意味着收敛时间和分数跨度成正比：$N\approx\Delta/\gamma$。跨度 3.0、$\gamma=0.001$，需要约 3000 步——**20 步只走了 0.7%**。论文里 0.001 够用，是因为它有十万级以上的训练步数；把 0.001 拿到 20 步的窗口里看，必然像是「这机制没用」。这不是它失效，是量纲不对。

**第二，$\gamma$ 太大反而更糟。** $\gamma=0.1$ 时 max/mean 在第 20 步反弹到 7.56，比初始的 5.62 还差，饿死数从 22 回升到 47，bias 整体漂到 +0.40 到 +0.90。原因就是上一节说的阶跃：bias 一动，整组进出 top-4，被控对象不是连续函数，步子大了必然越过平衡点来回振荡。对照组（无偏斜、bias 全零）的 max/mean 是 1.75——纯抽样噪声的下限。2.25 已经贴着这个地板了，再往下压没有空间。

**第三，bias 从来没有出现在 weights 里。** E3 用任意大的 bias（±3）跑 200 次，把 `weights` 和「用加 bias 之前的分数手工算出来的权重」逐位相减，最大差是 **0.0**——不是「很小」，是同一个浮点数的两次相同运算。

### 8. 三个常见误解

**误解一：`route_scale=2.5` 是温度，用来让路由更尖锐。**

第 593 行已经把 `indices` 定死了，第 597 行才乘 `route_scale`。改它不可能改选中谁——E1 里把 1.0 和 100.0 对拉，500 次索引全部相同。而且第 595-596 行归一化之后，权重和恒等于 1，乘 2.5 只是把每个权重等比例放大，相对比例一点没变：分布形状不变，只有幅度变。

所以 $\sum_i g_{i,t}=2.5$ 是一个**与 token 无关的常数**，E1 的 500 次采样里最小值最大值都是 2.500000。它不是「让模型更自信」，它是给 MoE 分支定一个固定增益。这个增益完全可以折进每个专家的 `w2`——两者在数学上完全等价。

它唯一真正的作用是把「改 topk」和「改增益」解耦：归一化让权重和恒为 1，8 选还是 6 选都不变，所以改 `n_activated_experts` 不会顺带改变分支的输出量级。softmax 那条路没有这个性质——它的 top-8 权重和由数据决定，换 topk 就换增益。

**误解二：分组路由是为了负载均衡。**

不。它把候选池从 256 砍到 128，跨度均值只从 3.145 降到 3.111，与全局 top-8 的重合率 99.52%——它对「谁被选中」几乎没有影响，对「选中的人分布在几个节点」有决定性影响。它是通信拓扑的约束，不是负载工具。指望它治旱涝不均，会得到一个既不均衡、又白白丢掉 0.5% 路由精度的系统。

**误解三：256 选 8 意味着计算量只有 1/32。**

参数量确实只激活 3.125% 的专家，但计算费的账要拿另一个基准来算：9 × 2048 = 18432 = `inter_dim`，每 token 每层 FFN 的乘加和稠密层完全相等。MoE 省的是「相对 671B 稠密模型」的算力，不是「相对同激活量的稠密模型」的算力。把 671B 的 MoE 说成「只算 37B」，只在跟 671B 稠密模型比的时候成立。

### 9. 下期预告

这期只讲了 token 怎么被分派出去。分派完，8 个专家手上的 token 数量各不相同——{% include src.html path="inference/model.py" lines="683" text="第 683 行" %} 那个 `torch.bincount` 就是证据，{% include src.html path="inference/model.py" lines="688" text="第 688 行" %} 的 `torch.where(indices == i)` 会把每个专家分到的行号捞出来。

下一期看这堆长短不一的 token 怎么拼成一个 batch：`for i in range(self.experts_start_idx, self.experts_end_idx)` 这个串行循环在真实服务里为什么必须换成 grouped GEMM，以及一次 all-to-all 到底要搬多少字节。

---

## 小结

- **256 选 8 换的是容量，不是算力。** 9 × 2048 = 18432 = `inter_dim`，MoE 层每 token 的 FFN 乘加与稠密层严格相等；671B 的参数、16B 级的计算。
- **分组路由和负载均衡是两件事。** 前者把每个 token 的跨节点数从「最多 8」压到「最多 4」，均值几乎不动（3.145 → 3.111），代价是 0.5% 的坑位；后者靠 bias。
- **bias 是一个拿不到梯度的 `nn.Parameter`。** 它只进 `topk` 的 key，不进 `weights`；三行手写规则（过载减 $\gamma$、欠载加 $\gamma$）取代了整个 aux loss。
- **$\gamma$ 的收敛时间是 $\Delta/\gamma$。** 0.001 配十万级步数才有意义；20 步的窗口里它必然看起来无效。$\gamma$ 过大则会因为「整组进出 top-4」的阶跃而振荡，$\gamma=0.1$ 时比不修还差。
- **`route_scale` 不是温度。** 它排在 topk 之后，改不了选中谁；归一化后乘常数只改幅度。$\sum_i g_{i,t}=2.5$ 是一个与 token 无关的常数，可以完整折进 `w2`。
- **别名是真的，但被两层保护兜住了。** 671B 路上 `+ bias` 的 rebind 断了别名；236B 路上别名活着，`masked_fill_` 写进 128 个 `-inf`，但 `gather` 只取未屏蔽的位置。别在 `forward` 之后读那个张量。
- 最容易踩的坑：把 `topk(2)` 当成超参。它是 $K_r/M$，改 `n_limited_groups` 时不会跟着变，而且不会报错。

> 下一篇：《MoE 下：8 个专家的 token 怎么拼成一批》，从 `bincount` 和 `torch.where` 继续往下走，算清 grouped GEMM 与 all-to-all 的账。
