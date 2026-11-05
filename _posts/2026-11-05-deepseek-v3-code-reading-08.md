---
layout:     post
title:      DeepSeek-V3 源码精读（8）：8 个专家的 token 没有拼成一批
subtitle:   MoE.forward 的 25 行里没有 grouped GEMM，也没有 all-to-all——重排被拆成 16 次 gather，通信换成一次稠密 all_reduce
date:       2026-11-05
author:     WY
header-img: img/post-bg-ios9-web.jpg
catalog:    true
description: 拆开 MoE.forward 的 25 行：token 怎么被 16 次 gather 重排、为什么没有 capacity factor、共享专家为什么自带一次 all_reduce，以及装箱、启动、通信三笔账的交叉点为什么落在 N=9。
math:       true
series:     deepseek-source
chapter:    8
source:     deepseek-ai/DeepSeek-V3@9b4e9788e4a3
tags:
    - 人工智能
    - 深度学习
    - 大语言模型
    - 神经网络
---

## 开篇：上一期那句预告，得先改一个字

第 7 期的结尾我写：这个串行循环「在真实服务里必须换成 grouped GEMM」。写完回头把 `MoE.forward` 从头读了一遍，这句话得改——不是改结论，是改对象。

这份代码里没有 grouped GEMM。全文件 `grouped` 命中 0 次，`all_to_all` 命中 0 次，`permute` 命中 0 次，`capacity` 命中 0 次。25 行 forward 干的事很朴素：对本地那 16 个专家，一个 Python 循环，一个专家一次矩阵乘法。

所以这期只回答一个问题：**8 个专家各自分到的 token 数量不一样，不拼批是怎么算完的？**

这个问题有一个诱人的标准答案——把变长的 token 段拼成一条连续 buffer，用一次 grouped kernel 算完；还有一个更诱人的配套答案——用 all-to-all 把 token 发到专家所在的那张卡上。两个答案都对，两个都不在这里。

把「不拼」的代价算清楚，比背下标准答案有用。因为它记在三本不同的账上，而三本的盈亏方向并不一致：装箱账赢了，启动账输了，通信账要看你用几张卡。

## 一、shape 流水线：只有一维会变

先定 T。它是这次前向的 token 总数：预填充时 T = batch × prompt 长度，解码时 `generate.py` 每步只喂一个 token，T = batch（`max_batch_size` 默认 8）。同一段代码，T 从 1 到 131072 都走。

| 步 | 表达式 | 形状 | 说明 |
|---|---|---|---|
| 1 | `x` 进入 MoE | `[B, S, 7168]` | bf16 |
| 2 | `x.view(-1, self.dim)` | `[T, 7168]` | T = B×S，要求连续 |
| 3 | `gate(x)` | `[T, 8]` + `[T, 8]` | 权重 bf16，专家号 int64 |
| 4 | `bincount(...).tolist()` | 长度 256 的 list | 从 GPU 搬回 CPU |
| 5 | `torch.where(indices == i)` | `[n_i]` + `[n_i]` | 行号 / 该 token 的第几个槽 |
| 6 | `x[idx]` | `[n_i, 7168]` | gather，产生新拷贝 |
| 7 | `w1(x)` / `w3(x)` | `[n_i, 2048]` | 各 14.68M 参数 |
| 8 | `silu(w1)·w3` | `[n_i, 2048]` | |
| 9 | `w2(...)` | `[n_i, 7168]` | |
| 10 | `× weights[idx, top, None]` | `[n_i, 1]` 广播 | |
| 11 | `y[idx] +=` | `[T, 7168]` | scatter-add |
| 12 | `z = shared_experts(x)` | `[T, 7168]` | 不过 gate，自带一次 all_reduce |
| 13 | `(y + z).view(shape)` | `[B, S, 7168]` | |

整条流水线里只有一维是变的：$n_i$，第 $i$ 个专家分到的 token 数。它随 T 变、随路由结果变、随卡数变，而在同一次前向里，256 个 $n_i$ 彼此也不相等。

所有工程选择都是围绕这一维展开的。要么把它补齐成定长 $\max_i n_i$，让 256 个专家共享一个 batch 维（于是有了 padding，有了 capacity factor）；要么让它变长，每次形状都不同（于是有了一次 shape 一个 kernel）。这份代码选的是后者，而且是**逐专家**选，不是逐层选。

第 680 行的 `x.view(-1, self.dim)` 也不是白写的。进 MoE 的那个张量是 `self.ffn_norm(x)` 的输出（`Block.forward`，{% include src.html path="inference/model.py" lines="734" text="第 734 行" %}），RMSNorm 逐元素算出来的新张量必然连续，所以这个 view 不拷贝、不报错。换成 `transpose` 之后的非连续张量进来，这一行会直接抛异常。

## 二、25 行代码：重排拆成了 16 份

{% include src.html path="inference/model.py" lines="669-693" %}

```python
# inference/model.py:669-693
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass for the MoE module.

        Args:
            x (torch.Tensor): Input tensor.

        Returns:
            torch.Tensor: Output tensor after expert routing and computation.
        """
        shape = x.size()
        x = x.view(-1, self.dim)
        weights, indices = self.gate(x)
        y = torch.zeros_like(x)
        counts = torch.bincount(indices.flatten(), minlength=self.n_routed_experts).tolist()
        for i in range(self.experts_start_idx, self.experts_end_idx):
            if counts[i] == 0:
                continue
            expert = self.experts[i]
            idx, top = torch.where(indices == i)
            y[idx] += expert(x[idx]) * weights[idx, top, None]
        z = self.shared_experts(x)
        if world_size > 1:
            dist.all_reduce(y)
        return (y + z).view(shape)
```

### 1. 逐行

**679-680**：把 `[B, S, 7168]` 拍平成 `[T, 7168]`，`shape` 留着最后还原。MoE 只认 token，不认句子边界，这点和注意力层相反。

**681**：`gate` 返回的权重是 bf16。这一点值得停一下：`linear()` 在 bf16 权重下走 `F.linear`，输出 bf16；`sigmoid` 分支不升精度，而 `softmax` 分支里有一句显式的 `dtype=torch.float32`。V3 的配置是 `"score_func": "sigmoid"`，所以归一化、乘 `route_scale`、以及 689 行的 8 项加权求和，全程在 bf16 里做。两条分支的数值行为不一样，配置一换就换了一条路。

**682**：每层新分配一个 `[T, 7168]` 的零张量。T=4096 时 56 MiB，58 个 MoE 层各分配一次（不是同时存在），分配器的压力比显存占用更值得注意。

**683**：`bincount` 在 GPU 上算，`.tolist()` 把它搬回 CPU。这一行的代价不是算力，是**一次设备同步**——CPU 必须等 gate 的 topk 出结果，才能决定下面循环里哪个专家要启动。58 层就是 58 次这样的同步点。

**684-686**：只遍历本 rank 拥有的那段专家；`counts[i] == 0` 就跳过。这是整段代码里唯一的「负载处理」：空专家不启动 kernel。没有容量上限，没有丢弃，没有补齐。

**687**：`self.experts[i]` 是一个 256 槽的 `nn.ModuleList`，非本地位置是 `None`。因为 `range` 已经被 `experts_start_idx` 和 `experts_end_idx` 卡住，这里永远取不到 `None`。

**688**：`torch.where(indices == i)` 返回两个一维索引：`idx` 是 token 号，`top` 是这条 token 的第几个专家槽（0 到 7），后面取权重时要用。**这就是全部的 permute**：没有全局排序，没有连续 buffer，16 个专家各扫一遍 `[T, 8]` 的索引矩阵，各捞自己那一份。

**689**：一行里至少 8 个 kernel——`x[idx]` gather、w1、w3、silu、mul、w2、`weights[idx, top, None]` 的两次索引、一次乘、`y[idx]` 的 gather、一次加、一次 scatter。这是「重排」的真实成本：它不在一个 `permute` 函数里，它散在 16 次 gather 和 16 次 scatter-add 里。

**690**：共享专家拿的是完整的 `x`，没过 gate，也没乘权重。它和路由专家是两条并行的路，最后在第 693 行相加。

**691-692**：只有多卡才 all_reduce。这是全文件 4 处集合通信之一（另外三处是 127 行的嵌入求和、264 行的 `RowParallelLinear`、796 行的输出头 all_gather）。

**693**：`y + z` 之后再 view 回 `[B, S, 7168]`。

### 2. 为什么要 256 个槽、240 个 None

`indices` 里存的是全局专家号（0 到 255），循环变量 `i` 也是全局号。要让 `self.experts[i]` 直接可用，列表长度就必须是 256，不能是 16。

另一种写法是只建 16 个专家，把 `indices` 减掉 `experts_start_idx` 之后再取。省一次减法，但代价是 gate 的输出语义从「全局号」变成「本地号」——而 `Gate` 只接收 `args`，它根本不知道自己在第几个 rank 上，改不了。

这个选择在权重加载那一侧留下了痕迹。`convert.py` {% include src.html path="inference/convert.py" lines="66-71" text="第 66-71 行" %} 按 `name.split(".")[-3]` 取出专家号，只把落在本 rank 区间内的张量写进 `model{i}-mp{mp}.safetensors`，键名里的专家号保留全局值。所以每个 rank 的 checkpoint 里，路由专家的键是 `layers.3.ffn.experts.128.w1.weight` 这种带 128 的，而不是从 0 开始。

顺带一提，{% include src.html path="inference/convert.py" lines="68" text="第 68 行" %} 那个条件是 `"experts" in name and "shared_experts" not in name`。共享专家不走专家分片，走的是下面的 TP 切分分支——这一点在第 4 节还会回来。

### 3. 分片切法和路由分组是对齐的

{% include src.html path="inference/model.py" lines="658-663" %} 这几行决定了一个 rank 拥有哪些专家：连续块，`rank * n_local_experts` 到 `(rank + 1) * n_local_experts`。

而 `Gate` 里的分组是 `scores.view(x.size(0), self.n_groups, -1)`（配置里 `n_groups = 8`），也就是把 0 到 255 切成 8 段、每段 32 个。256 / 8 = 32，256 / 16 = 16：**mp=8 时一个 rank 正好拥有一整个组，mp=16 时两个 rank 拼一个组。**

于是一个 token 命中 4 个组，等价于命中 4 个 rank（mp=8）或 4 到 8 个 rank（mp=16）。这个对齐在代码里没有被任何地方利用——692 行的 all_reduce 是稠密的，不管命中谁都要发全量。但它解释了为什么 mp=8 的通信模式看起来更「整齐」：每个 rank 收到的专家贡献，恰好来自一个完整的组。

## 三、三笔账

### 1. 装箱账：不拼省下了什么

要用一次 kernel 算完 256 个专家，就得把它们的 token 排成 `[256, max_n, 7168]` 的定长张量，`max_n` 取最长那个桶。槽位利用率是

$$
\eta = \frac{\sum_i n_i}{E \cdot \max_i n_i}, \qquad \text{waste} = 1 - \eta
$$

其中 $\sum_i n_i = T \times 8$，$E = 256$。跑一遍（脚本在第 5 节）：

```
      T      每专家行数     最长桶      浪费
      8       0.25       2   87.5%
    512      16.00      29   44.8%
   4096     128.00     170   24.7%
 131072    4096.00    4301    4.8%
```

三处读数。T=8 时 87.5% 的槽位是填充——不是因为路由不均，而是因为 64 个 (token, 专家) 对撒在 256 个专家上，绝大多数专家只拿到 0 或 1 个 token，而 `max_n` 已经是 2。T=4096 时降到 24.7%，128K 预填充时只剩 4.8%。

这就是变长列表的全部好处：浪费恒为 0。代价是下一节。

### 2. 启动账：解码时一层要发多少个 kernel

变长意味着每个专家一次 kernel。T=8、world_size=1 时，64 个 (token, 专家) 对会命中

$$
256 \times \left(1 - \left(\frac{255}{256}\right)^{64}\right) \approx 56.7
$$

个不同的专家，也就是一层 56.7 × 3 ≈ 170 次 GEMM，加共享专家的 3 次，58 层下来约 1 万次。每个命中专家身上还要再发八到十个 elementwise kernel（`==`、`where`、两次 gather、一次乘、一次 scatter），一层四五百个，58 层两三万次启动——只为了算 8 个 token。

卡多一点会好一些：mp=16 时每卡 16 个专家，期望命中 3.55 个，一层 13.6 次 GEMM，58 层 791 次。切得越细，单卡要发的 kernel 越少——这是专家并行一个不太被提及的好处。

但这仍然不是最大的那笔账。真正压死人的是算术强度。单 token 解码时，MoE 部分要读

$$
58 \times 9 \times 44{,}040{,}192 \approx 2.30 \times 10^{10} \text{ 个权重}
$$

fp8 一字节，就是 23 GB。这是全系统的合计流量：mp=16 时每卡 1.44 GB，按单卡 3.35 TB/s 算是 0.43 ms；16 张卡的合计带宽 53.6 TB/s，算出来同样是 0.43 ms。同一批权重只被用一次，乘加 7.66 G 次、15.3 GFLOP。

算术强度 0.33 MAC/byte，这个数与卡数无关（分子分母同时除以 N），而 H100 的拐点是 295 MAC/byte——差 890 倍。换句话说，理论上限是每 0.43 ms 出一个 token，约 2300 tok/s；实际能拿到多少，取决于 kernel 效率和那 58 次同步，但天花板就在这里。

这也解释了一个反直觉的事实：**batch 从 1 加到 8，对 MoE 几乎没有帮助**。64 个 (token, 专家) 对撒在 256 个专家上，每个专家还是 0 或 1 行，M 维不变，算术强度不变。要让每个专家稳定拿到 8 行，得让

$$
\frac{T \times 8}{256} = 8 \quad\Longrightarrow\quad T = 256
$$

也就是说 batch 得到 256 量级，MoE 才从「搬权重」变成「算矩阵」。这才是 MoE 推理的吞吐拐点出现在几十到几百、而不是 8 的原因。

还有一层比 kernel 次数更硬的障碍：这段代码进不了 CUDA Graph。683 行的 `.tolist()` 把 GPU 上的计数搬回主机，是一次同步；684 行的 `if counts[i] == 0` 是主机端分支，取决于数据；688 行的 `torch.where` 输出形状随路由变化。三者任一条都足以让 graph capture 失败。而 decode 恰恰是最需要 graph 的场景——每步只算一个 token，启动开销占比最高，却偏偏没法把启动摊销进一次 capture。这不是实现者的疏忽，是「变长 + 数据依赖 + 主机决策」这套算法形状和 graph 的静态假设天然冲突。

### 3. 通信账：交叉点在 N=9

每个 MoE 层有两次 `[T, 7168]` 的 all_reduce：一次在 692 行，一次藏在共享专家的 `w2` 里（`RowParallelLinear.forward`，第 264 行）。加上注意力的 `wo`，58 个 MoE 层每层 3 次，3 个稠密层每层 2 次，合计 180 次——第 2 期算过这个数，这里只关心字节。

记一份 `[T, 7168]` bf16 为 $S$，T=4096 时 $S = 56$ MiB。ring all_reduce 的每卡发送量是 $2(N-1)/N \cdot S$；而真正的专家并行要两步 all-to-all（dispatch 一次、combine 一次），每卡发送 $16S/N$。两者之比

$$
\frac{B_{\text{ar}}}{B_{\text{a2a}}} = \frac{2(N-1)/N \cdot S}{16S/N} = \frac{N-1}{8}
$$

```
   N   all_reduce   all-to-all      比值
   4         84.0        224.0    0.38
   8         98.0        112.0    0.88
  16        105.0         56.0    1.88
  32        108.5         28.0    3.88
```

「EP 比 TP 更吃网络」这句话，只在 $N \le 8$ 时成立。N=4 时 all_reduce 只要 all-to-all 的 38%，N=16 时反过来要 1.88 倍。交叉点解 $2(N-1)/N = 16/N$，正好 $N = 9$。

所以真正的区别不在字节数，在**通信域**。all_reduce 要求所有 rank 在同一个低延迟域里（NVLink，几十 GB/s 到几百 GB/s），all-to-all 天生就是跨节点的、可以走 RDMA。这份代码选了前者，等于把专家并行锁进了 TP 组：`world_size` 同时是 TP 度和 EP 度，256 个专家最多切到 256 份，而这 256 份必须是一个 all_reduce 组。

还有一层更根本的：这里根本没有 token 分片。每个 rank 都持有全部 token（这是 TP 的产物），所以 all-to-all 连前提都不成立——没有什么可以「发出去」的东西，每个 rank 已经有一份了。all_reduce 反而是这个前提下的最优解：它把「谁算了哪些专家」这件事，简化成「大家各算各的，最后加起来」。

## 四、四个误解

**误解一：MoE 推理就是 grouped GEMM 加 all-to-all。**

在这个仓库里，两个词各命中 0 次。`fp8_gemm` 是存在的，但它是**单专家**的 GEMM（`kernel.py` {% include src.html path="inference/kernel.py" lines="175" text="第 175 行" %}），没有分段、没有变长 M、没有 `grouped` 的调度逻辑；`Expert` 调的是 `Linear`，一路走到 `linear()`，跟 grouped 没有任何关系。grouped GEMM 是服务框架的事，不是这份教学实现的事。想找真实调度，得等第 9 期换仓库之后。

**误解二：MoE 推理要设 capacity factor 丢 token。**

不用，因为这里没有定长 buffer 可溢出。`counts[i]` 的唯一用途是第 685 行的 `continue`——判断这个专家有没有活干，不是判断它超没超容量。丢弃率恒为 0。代价换了个形式出现：负载不均不再变成「丢 token」，而是变成「这一层的延迟由最忙的那个专家决定」，抖动直接传导到端到端。

顺带说，训练框架要 capacity factor，也不是为了「治某个专家太热」，而是因为定长 buffer 必须有上限。这两件事经常被讲成一件。

**误解三：共享专家也是一个专家，要过 gate 加权。**

`z = self.shared_experts(x)`，完整输入，不加权，直接和 `y` 相加。

更值得注意的是它的并行方式：`Expert` 用的是 `Linear`（{% include src.html path="inference/model.py" lines="619-621" text="第 619-621 行" %}），整块矩阵待在一个 rank 上，靠专家分片摊开；`shared_experts` 是 `MLP`（{% include src.html path="inference/model.py" lines="667" text="第 667 行" %}），里面是 `ColumnParallelLinear` 和 `RowParallelLinear`（{% include src.html path="inference/model.py" lines="518-520" text="第 518-520 行" %}），靠 TP 切开。这个不对称是有道理的：路由专家一人一卡，不需要再切；共享专家每张卡都要算，不切就每张卡存一份完整副本。

代价是集合通信次数。共享专家的 `w2` 是 `RowParallelLinear`，自己带一次 all_reduce（{% include src.html path="inference/model.py" lines="264" text="第 264 行" %}），加上 692 行那次，一个 MoE 层是**两次** `[T, 7168]` 的 all_reduce，不是一次。稠密层只有一次。

**误解四：`y[idx] +=` 是原子累加。**

它是 gather → add → scatter 三步：先按 `idx` 把 `y` 的行取出来，加上新值，再按 `idx` 写回去。如果 `idx` 里有重复下标，后写的那次会覆盖前一次，更新就丢了。脚本第 4 段给了反例：下标 `[0, 0]`、值 `[5, 7]`，结果是 `[7, 0, 0]` 而不是 `[12, 0, 0]`；换成 `index_add_` 语义才是 12。

这里安全，是因为 `topk` 保证一条 token 的 8 个专家互不相同，而每个专家在一个 token 里最多出现一次。但这个安全性是**上游给的**，不是这一行给的。哪天上游换成一个会产生重复的实现（比如某种带 top-k 重叠的变体），这里不会报错，只会静默丢梯度。

## 五、复现：纯 Python 把三笔账算一遍

不需要 GPU，不需要 torch，一个文件跑完。

```python
# repro8.py —— 第 08 期的三笔账，纯 Python，CPU 可跑，无第三方依赖
import random

E, K, D, INTER = 256, 8, 7168, 2048          # 专家数 / top-k / 隐藏维 / 专家中间维


def route(T, seed=1):
    """模拟一次路由：T 个 token 各选 K 个专家，返回每个专家分到的 token 数。"""
    rng = random.Random(seed)
    cnt = [0] * E
    for _ in range(T * K):
        cnt[rng.randrange(E)] += 1
    return cnt


print("[1] 装箱账：定长 buffer 里有多少槽位是填充")
print(f"{'T':>7} {'每专家行数':>10} {'最长桶':>7} {'浪费':>7}")
for T in (8, 512, 4096, 131072):
    c = route(T)
    print(f"{T:>7} {sum(c)/E:>10.2f} {max(c):>7} {1 - sum(c)/(E*max(c)):>7.1%}")

print("\n[2] 通信账：一次 [4096,7168] bf16 的发送量（MiB/卡）")
S = 4096 * D * 2
print(f"{'N':>4} {'all_reduce':>12} {'all-to-all':>12} {'比值':>7}")
for N in (4, 8, 16, 32):
    ar, a2a = 2 * (N - 1) / N * S, 16 * S / N
    print(f"{N:>4} {ar/2**20:>12.1f} {a2a/2**20:>12.1f} {ar/a2a:>7.2f}")
print("两者相等：2(N-1)/N = 16/N  =>  N = 9")

print("\n[3] 算术强度：单个专家 GEMM 的 M 就是它分到的行数")
print(f"{'M':>4} {'MAC/字节':>9} {'占峰值':>8}")
for M in (1, 8, 128):
    mac = M * D * INTER
    inten = mac / (D * INTER + M * D)
    print(f"{M:>4} {inten:>9.0f} {inten/295:>8.2%}")

print("\n[4] y[idx] += 不是原子累加：下标重复就丢更新")
y, idx, v = [0, 0, 0], [0, 0], [5, 7]
tmp = [y[i] for i in idx]                    # gather
tmp = [a + b for a, b in zip(tmp, v)]        # add
for k, i in enumerate(idx):
    y[i] = tmp[k]                            # scatter
print("gather-then-scatter:", y, " index_add 语义:", [12, 0, 0])
```

输出：

```
[1] 装箱账：定长 buffer 里有多少槽位是填充
      T      每专家行数     最长桶      浪费
      8       0.25       2   87.5%
    512      16.00      29   44.8%
   4096     128.00     170   24.7%
 131072    4096.00    4301    4.8%

[2] 通信账：一次 [4096,7168] bf16 的发送量（MiB/卡）
   N   all_reduce   all-to-all      比值
   4         84.0        224.0    0.38
   8         98.0        112.0    0.88
  16        105.0         56.0    1.88
  32        108.5         28.0    3.88
两者相等：2(N-1)/N = 16/N  =>  N = 9

[3] 算术强度：单个专家 GEMM 的 M 就是它分到的行数
   M    MAC/字节      占峰值
   1         1    0.34%
   8         8    2.70%
 128       120   40.84%

[4] y[idx] += 不是原子累加：下标重复就丢更新
gather-then-scatter: [7, 0, 0]  index_add 语义: [12, 0, 0]
```

第 3 段里 `M=128` 对应的是 T=4096、mp=1 的预填充：每专家 128 行，算术强度 120，能跑到峰值的 40%。mp=16 时每卡 16 个专家、每专家 2048 行，强度还要再高一个量级。反过来，解码时 M=1，占峰值的 0.34%——这就是前面那 890 倍差距的出处。

第 4 段是个反面教材，别照抄成实现，照抄的是那个 `index_add_` 的语义。

## 六、小结

- **这段代码不拼批。** 8 个专家各自成批，一个 Python 循环跑 16 次小 GEMM，重排散在 16 次 `torch.where` + gather 里，没有全局 permute，没有 grouped kernel。
- **装箱账赢了，启动账输了。** 变长列表的 padding 浪费恒为 0（定长要 24.7% 到 87.5%），代价是单卡一层几十到几百次 kernel 启动，以及 683 行那次强制同步——它让整段代码无法被 CUDA Graph 捕获。
- **算术强度才是天花板。** 单 token 解码 0.33 MAC/byte，比 H100 拐点低 890 倍；每专家的行数是 $T/32$，所以 batch 要到 256 量级才谈得上「算矩阵」。
- **通信账的交叉点在 N=9。** 小于 9 张卡时 all_reduce 更省，大于 9 时 all-to-all 更省；真正的分水岭不是字节，是 all_reduce 必须留在 NVLink 域。
- **共享专家不是「第 9 个专家」。** 不过 gate、不加权、走 TP 切分，而且自带一次 all_reduce，所以 MoE 层是两次集合通信。
- **`y[idx] +=` 的安全性是上游给的。** 它靠 `topk` 保证下标唯一，自己不提供任何保护。

第一季到这里结束。8 期、809 行、一个 671B 的推理实现读完了：从参数怎么数出来，到一刀切下去为什么要 all-reduce，到 576 维的 cache 里没有 K 也没有 V，最后到这批长短不一的 token 怎么被算完。

> 下一篇：《V4.1 比 V3 多了什么》。第 9 期换仓库、换 commit：`deepinfer/model_executor/models/v4_modules/`，24 个文件、`attn.py` 单文件 1009 行。`engram.py`、`yoco.py`、`index_attn.py` 这三个名字在 V3 里一个都没有——先看它们各自替 Transformer 记住了什么，再看 builder 怎么把它们拼成一个模型。
