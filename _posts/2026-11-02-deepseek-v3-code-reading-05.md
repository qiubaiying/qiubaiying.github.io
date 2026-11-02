---
layout:     post
title:      DeepSeek-V3 源码精读（5）：1536 与 512 这两个数在压什么
subtitle:   512 压的是缓存，1536 压的是权重——而且 16 卡并行下，1536 那一路单独算账是亏的
date:       2026-11-02
author:     WY
header-img: img/post-bg-keybord.jpg
catalog:    true
description: 从 MLA.__init__ 的 21 行读到两个低秩维度：为什么 kv_lora_rank 必须存在而 q_lora_rank 可以关掉、单层 0.187B 参数怎么被 wo 一个人吃掉 63%、以及低秩到底让哪些输入方向对注意力彻底不可见。
math:       true
series:     deepseek-source
chapter:    5
source:     deepseek-ai/DeepSeek-V3@9b4e9788e4a3
tags:
    - 人工智能
    - 深度学习
    - 大语言模型
    - 神经网络
---

## 开篇：两个数字，两个完全不同的问题

上一篇结尾留了两个数：`q_lora_rank=1536`、`kv_lora_rank=512`。它们长得像一对——都是低秩维度，都在 `MLA.__init__` 里，都让矩阵先降维再升维。但它们压的根本不是同一样东西。

先把结论摆出来，因为它和"低秩就是为了省显存"这条直觉相反：

- **512 压的是缓存。** 它是唯一被架构钉死的一处，代码里没有"关掉它"的分支。
- **1536 压的不是缓存。** Q 从来不进 cache。它压的是权重矩阵；而且在 16 卡张量并行下，这一路单独算账是**亏的**——每卡比直接投影多花 21%。

这两句话后面都有账可查，不是修辞。三条前置，缺一条会卡住：

1. 注意力有四个投影（Q、K、V、O），只有 K 和 V 需要按 token 缓存。**Q 是当前 token 的查询，算完就扔。**
2. 低秩分解 = 先降维再升维，两个矩阵乘起来的秩，不超过中间那层的维度。
3. 这个仓库的配置是 `n_heads=128`、`qk_nope_head_dim=128`、`qk_rope_head_dim=64`、`v_head_dim=128`，所以每个头的 K 是 192 维（128 内容 + 64 位置），V 是 128 维。

## 第 5 期：1536 压权重，512 压缓存

### 1. 三种砍法，位置只换过一次

MHA → MQA → GQA → MLA 常被画成一条"越来越省"的直线。省是真的，但**砍的位置只换过一次**：MQA 和 GQA 砍的都是头数，只有 MLA 换到了宽度上。位置一换，丢的东西也跟着换了。按本仓库的形状算，每 token 每层的缓存元素数是这样：

| 机制 | 缓存内容 | 元素数 | 相对 MHA | 砍的是什么 | 丢了什么 |
|---|---|---|---|---|---|
| MHA | 128 个头各自的 K、V | 40960 | 1 倍 | 不砍 | 不丢，但最贵 |
| GQA 16 组 | 16 组 K、V | 5120 | 8 倍 | 头数 128 → 16 | 16 个之外的头共用 |
| GQA 8 组 | 8 组 K、V | 2560 | 16 倍 | 头数 128 → 8 | 共用得更狠 |
| MLA | 512 潜向量 + 64 位置键 | 576 | **71 倍** | **存的宽度**，头数仍是 128 | 低秩瓶颈（第 5 节） |
| MQA | 1 份 K、V | 320 | 128 倍 | 头数 128 → 1 | 所有头共用同一份 |

除 MHA 和 MLA 之外的三行砍的都是**头数**：K 和 V 的份数直接变少，128 个查询头去抢更少的键值。这条路一定掉分，而且掉得很干净——DeepSeek-V2 论文附录 D 在 7B 稠密模型上做过一次只改注意力机制的消融，MMLU 是 MHA 45.2、GQA 8 组 41.2、MQA 37.9。压缩越狠，分数越低，一条单调的线。

MLA 那一行是另一种砍法：**头数一个没动，128 个查询头仍然各自拥有 128 维的 `k_nope` 和 128 维的 `v`**；变窄的是"这些 K/V 是从哪儿长出来的"——128 个头共用同一个 512 维的入口。压缩发生在输入端，不在输出端。

所以它能绕开那条单调线。同一个附录 D 里，250B 级别的 MoE 只改注意力机制：MHA 缓存 860.2K 元素、MMLU 57.5、BBH 46.6；MLA 缓存 34.6K（4%）、MMLU 59.0、BBH 50.7。**缓存砍到 4%，四项指标全涨。** 论文只给了测量，没给解释——这一点第 5 节还会回来说。

顺带一个数字，它能解释 576 这个数为什么长这样：

$$
\text{cache}_{MLA} = d_c + d_h^{R} = 512 + 64 = 576 = 4.5\,d_h = 2.25 \times (2 d_h)
$$

$2.25 \times (2d_h)$ 正好是"GQA 只用 2.25 组"的缓存量。V2 论文表 1 就是这么写的：MLA 的缓存等于 2.25 组的 GQA，效果却强于 MHA。而 V3 把这个比例原封不动继承了下来——$d_c = 4 d_h = 4 \times 128 = 512$，$d_h^{R} = d_h / 2 = 64$。**两个数不是调出来的，是从 V2 抄下来的比例。**

### 2. 21 行里有七个形状和四个 buffer

`MLA.__init__` 从 396 行开始，真正建层的部分在 424 到 444 行（{% include src.html path="inference/model.py" lines="424-444" %}）：

```python
# inference/model.py:424-444
        if self.q_lora_rank == 0:
            self.wq = ColumnParallelLinear(self.dim, self.n_heads * self.qk_head_dim)
        else:
            self.wq_a = Linear(self.dim, self.q_lora_rank)
            self.q_norm = RMSNorm(self.q_lora_rank)
            self.wq_b = ColumnParallelLinear(self.q_lora_rank, self.n_heads * self.qk_head_dim)
        self.wkv_a = Linear(self.dim, self.kv_lora_rank + self.qk_rope_head_dim)
        self.kv_norm = RMSNorm(self.kv_lora_rank)
        self.wkv_b = ColumnParallelLinear(self.kv_lora_rank, self.n_heads * (self.qk_nope_head_dim + self.v_head_dim))
        self.wo = RowParallelLinear(self.n_heads * self.v_head_dim, self.dim)
        self.softmax_scale = self.qk_head_dim ** -0.5
        if args.max_seq_len > args.original_seq_len:
            mscale = 0.1 * args.mscale * math.log(args.rope_factor) + 1.0
            self.softmax_scale = self.softmax_scale * mscale * mscale

        if attn_impl == "naive":
            self.register_buffer("k_cache", torch.zeros(args.max_batch_size, args.max_seq_len, self.n_local_heads, self.qk_head_dim), persistent=False)
            self.register_buffer("v_cache", torch.zeros(args.max_batch_size, args.max_seq_len, self.n_local_heads, self.v_head_dim), persistent=False)
        else:
            self.register_buffer("kv_cache", torch.zeros(args.max_batch_size, args.max_seq_len, self.kv_lora_rank), persistent=False)
            self.register_buffer("pe_cache", torch.zeros(args.max_batch_size, args.max_seq_len, self.qk_rope_head_dim), persistent=False)
```

第一行就值得停一下。`if self.q_lora_rank == 0` 有一条 else，意思很明确：**查询的低秩压缩可以关掉**，关掉之后就是一个朴素的 `ColumnParallelLinear(dim, n_heads * qk_head_dim)`，也就是不压缩的 Q 投影。而往下看 `wkv_a` 和 `wkv_b`——**没有这个开关**。KV 低秩不是可选项，它就是这一层的注意力本身。

这个不对称是本期最重要的一条线索，第 4 节会把账算完。

七个形状，逐个对：

| 模块 | 类 | 形状 `[out, in]` | 说明 |
|---|---|---|---|
| `wq_a` | `Linear` | `[1536, 7168]` | 下投影，输出 1536 |
| `q_norm` | `RMSNorm` | `[1536]` | 只盖 1536，不盖 24576 |
| `wq_b` | `ColumnParallelLinear` | `[24576, 1536]` | 上投影，24576 = 128 × 192 |
| `wkv_a` | `Linear` | `[576, 7168]` | 一个矩阵，两个出口 |
| `kv_norm` | `RMSNorm` | `[512]` | 只盖 512，不盖 576 |
| `wkv_b` | `ColumnParallelLinear` | `[32768, 512]` | 32768 = 128 × (128 + 128) |
| `wo` | `RowParallelLinear` | `[7168, 16384]` | 16384 = 128 × 128，**没被压** |

三处细节，读代码时最容易滑过去。

**第一，`wkv_a` 是一个矩阵两个出口。** 它的输出是 576 维，但不是一个 576 维的整体——`forward` 里第一件事就是按 `[512, 64]` 切开（{% include src.html path="inference/model.py" lines="468-470" text="468-470 行" %}）：前 512 是内容潜向量 $c_t^{KV}$，后 64 是位置键 $k_t^{R}$。这两个东西的用途、缓存方式、是否共享，全都不一样。把 576 当成一个整体看，后面全乱。

**第二，`kv_norm` 只吃前 512。** 它是 `RMSNorm(self.kv_lora_rank)`，不是 `RMSNorm(576)`。因为归一化在线性层之后、切分之后：先切出 512 的内容部分，归一化，再进 `wkv_b`；64 的位置部分不归一化，直接去过 RoPE。这不是随手写的——RoPE 是逐维旋转，一个逐维的增益向量夹在旋转前面就再也折不进任何相邻矩阵了。而 512 那一路的增益 $\gamma$ 是可以精确折进 $W^{UK}$ 的（这是下一期"吸收"的代数前提之一）。

**第三，归一化放在窄的那一侧。** `q_norm` 在 1536 上做，不是在 24576 上；`kv_norm` 在 512 上做，不是在 32768 上。每 token 要处理的数从 24576 降到 1536，省的比例和参数一样是 16 倍。更实际的理由是形状：如果放在上投影之后，$\gamma$ 就是 24576 维，吸收的时候要乘的是一个 24576 维的对角阵。

最后六行是 buffer 声明，这是下一期的主菜。这里只记一件事：`naive` 分支的两个 cache 带着 `n_local_heads`，**按头切**；MLA 分支的两个 cache 没有头维，**每张卡都存一份完整的**。这个差别在 mp=16 下会把"71 倍"这个数字改写成另一个数，第 6 节末尾留了一句。另外，{% include src.html path="inference/model.py" lines="17" text="第 17 行" %}把 `attn_impl` 写成了 `"absorb"`——默认走的就是 MLA 这条路，`naive` 只是留给对照的实现。这一点和 `gemm_impl` 恰好相反（那个默认 `"bf16"`，等于默认不开 fp8），两个模块级开关，一个默认开、一个默认关，读的时候容易想当然。

### 3. 0.187B 怎么拆：`wo` 一个人占 63%

七个模块加起来，单层 MLA 是 187,107,328 个参数（0.1871B）。拆开看：

| 模块 | 形状 | 参数 | 占比 |
|---|---|---|---|
| `wq_a` | `[1536, 7168]` | 11,010,048 | 5.88% |
| `q_norm` | `[1536]` | 1,536 | 0.00% |
| `wq_b` | `[24576, 1536]` | 37,748,736 | 20.17% |
| `wkv_a` | `[576, 7168]` | 4,128,768 | 2.21% |
| `kv_norm` | `[512]` | 512 | 0.00% |
| `wkv_b` | `[32768, 512]` | 16,777,216 | 8.97% |
| `wo` | `[16384, 7168]` | 117,440,512 | **62.77%** |
| 合计 | | 187,107,328 | 100% |

两个 norm 加起来 2048 个数，占 0.001%——**归一化是免费的**，后面所有关于"低秩省了什么"的讨论都不该把它算进去。

真正反直觉的是最后一行：两条低秩路吭哧压了半天，`wo` 一动不动，结果它一个人占了 62.77%。也就是说，MLA 的单层参数里，**六成以上是那个没有参与压缩的输出投影**。

这给了压缩一个下限。不管你把 `q_lora_rank` 调到多小、`kv_lora_rank` 调到多小，$W^{O}$ 的 $16384 \times 7168$ 都在那儿——它是 128 个头 × 128 维的 V 拼回 7168 维残差流，形状由 `n_heads × v_head_dim → dim` 决定，跟低秩无关。

那压下来了多少？拿同样形状的 MHA 对比（$W^Q$ 和 $W^K$ 都是 $24576 \times 7168$，$W^V$ 和 $W^O$ 都是 $16384 \times 7168$）：

| | 参数 | 相对 |
|---|---|---|
| MLA 单层 | 187,107,328 | 1.00 |
| 同形状 MHA 单层 | 587,202,560 | 3.14 |

再乘 61 层：MLA 的注意力总共 11.41B，MHA 版本是 35.82B。**差 24.4B，占 671B 总量的 3.64%。** 这就是"低秩"在参数上的全部兑现——不到四个百分点。所以如果有人告诉你 MLA 的价值是"大幅减少参数量"，数字会反驳他。

真正被它改掉的，是每 token 每层的缓存：40960 → 576。这两个数字的收益完全不在一个量级上，也完全不在同一个地方。

### 4. 1536 到底在压什么：不是缓存，是权重

先确认一件小事：Q 不进 cache。576 里没有一个数是 Q。这一点从 `register_buffer` 那四行就能看出来——`kv_cache` 是 `kv_lora_rank` 宽，`pe_cache` 是 `qk_rope_head_dim` 宽，没有 Q 的位置。

那压 Q 图什么？三个答案，一个比一个实。

**答案一：代码自己说了它是可选的。** 前面那行 `if self.q_lora_rank == 0` 就是开关。这个分支不是摆设——它是一条完整的实现路径，走的是不带低秩的 `ColumnParallelLinear`，而不是留个 `raise NotImplementedError` 占位。一个"关掉也照样能跑"的压缩，显然不是为了解决架构级瓶颈。

**答案二：论文自己说了它的目的是训练。** V2 论文在给出查询压缩的两个公式之后写得很直白：做这件事是为了减少训练时的激活显存，**即便它并不能减少 KV cache**。也就是说，1536 这个数是在训练侧被定下来的，推理侧只是继承。

**答案三，也是最有意思的：在 16 卡并行下，这一路单独算账是亏的。** 这需要把"参数"换成"每卡占用"来算，因为 `wq_a` 是 `Linear`，不是并行层。

`Linear` 不做任何切分。第 2 期讲过，`ColumnParallelLinear` 在构造时就把 `out_features` 除以 `world_size` 再建权重（{% include src.html path="inference/model.py" lines="219" text="第 219 行" %}），而 `Linear` 老老实实建全量。`wq_a` 用的是后者，所以**16 张卡每张都存一份完整的 `[1536, 7168]`**。`convert.py` 里也印证了这一点：`q_a_proj` 和 `kv_a_proj_with_mqa` 落进"两个分支都不进"的第三组，被 16 份字典同时引用（{% include src.html path="inference/convert.py" lines="66-76" %}）。

为什么不切？因为紧跟着的 `q_norm` 要在完整的 1536 维上算 RMS。切开就得先 all-gather 再归一化，一次通信换 11M 参数的复制，不划算。

于是每卡的账变成这样：

| 并行度 | MLA 每卡 | 同形状 MHA 每卡 | MLA 省 | 其中 Q 路每卡 |
|---|---|---|---|---|
| mp=1 | 187.11M | 587.20M | 68.1% | 48.76M |
| mp=2 | 101.12M | 293.60M | 65.6% | 29.88M |
| mp=4 | 58.13M | 146.80M | 60.4% | 20.45M |
| mp=8 | 36.64M | 73.40M | 50.1% | 15.73M |
| mp=16 | 25.89M | 36.70M | **29.5%** | **13.37M** |

看最后一列。直接投影的 `wq` 在 mp=16 下被切成 `[1536, 7168]`，每卡 11.01M；低秩版本是 `wq_a` 全量 11.01M 加上 `wq_b` 切片 2.36M，合计 **13.37M**——**比不压缩多 21.4%**。

把整层的差额拆开看更清楚（mp=16）：

- 直接投影每卡 36.70M。
- 低秩每卡 25.89M，净省 10.81M。
- 其中 KV 那一路从 18.35M 降到 5.18M，省了 13.17M；Q 那一路从 11.01M 涨到 13.37M，多花 2.36M。
- 13.17 − 2.36 = 10.81。

**省下的 29.5% 全部来自 KV，Q 那一路是净支出。** 这就是"1536 和 512 压的不是同一样东西"的算术版本：512 压的是每卡显存，1536 压的是全局参数和算子数；前者在并行下不打折，后者会随着 `world_size` 一起被稀释。

一个自然的追问：既然 `wq_a` 复制是亏的，为什么不让它跟着 `q_lora_rank` 一起切？因为 `q_norm` 的存在把这条路堵死了——除非你接受"每卡归一化自己那 96 维"，那就不再是 RMSNorm(1536)，而是 16 个 RMSNorm(96)，语义全变。

### 5. 低秩的代价：6656 个方向对 K/V 不可见

到这里都是账。但低秩是有代价的，而且这个代价可以用一行线性代数写清楚。

先看 KV 那条路。$c_t^{KV} = W^{DKV} x_t$，其中 $W^{DKV}$ 是 $512 \times 7168$。然后 128 个头的 $k_{nope}$ 和 $v$ 都由 $c_t^{KV}$ 上投影得到。把两个矩阵乘起来：

$$
\mathrm{rank}\left(W^{UK} W^{DKV}\right) \le \min(16384,\ 512,\ 7168) = 512
$$

**不管训练多久，这个复合映射的秩永远不会超过 512。** 而 MHA 里 K 和 V 是两个互不相干的矩阵（$24576 \times 7168$ 和 $16384 \times 7168$），每一个的秩都可以到 7168。差的不是"一点点"，是 14 倍。

零空间更直白：

$$
\dim \ker W^{DKV} = 7168 - 512 = 6656
$$

这 6656 个方向（占输入空间的 **92.9%**）对 $c_t^{KV}$ 的贡献恒等于零，因此对**所有** 128 个头的 $k_{nope}$ 和 $v$ 的贡献也恒等于零。而 $k_{nope}$ 和 $v$ 用的是同一个 $W^{DKV}$，所以它们**共享同一个盲区**——不是各有各的 6656 维盲区，是同一片。这一点比秩本身更值得注意：MHA 里 K 和 V 是两个独立的矩阵，可以各自挑各自关心的方向；MLA 里它们只能挑同一批。

Q 那一路同理，只是没那么狠：$\dim \ker W^{DQ} = 7168 - 1536 = 5632$，占 78.6%。

换成"头"来数更直观：512 = 4 × 128，1536 = 12 × 128。也就是说，

> **128 个头的 K/V 内容，被压在 4 个头的信息量里；128 个头的 Q，被压在 12 个头的信息量里。**

注意这里说的不是"每个头变窄了"——每个头的 $k_{nope}$ 仍然是实打实的 128 维，`wkv_b` 的 32768 行一行没少。变的是**每个头那 128 行权重张成的行空间**：它们全部住在同一个 512 维潜空间里，而 128 个 128 维子空间的直和最多只能塞进去 4 个（4 × 128 = 512），剩下 124 个必须和邻居共享方向。

那为什么还能不掉分？论文没解释，只给了测量。能确定的是两件事：一是 512 这个数不是算出来的，是训出来的——没有任何先验说 4 个头宽够用；二是这个盲区只对**注意力内容通路**成立，残差流本身没有变窄，那 6656 个方向照样进 MLP。所以准确的说法不是"信息被丢了"，而是"注意力读不到这些方向了，得靠 MLP 兜"。

这个说法有个可检验的推论：如果 MLA 真的把内容通路压得很紧，那 MoE 那几层的负担可能更重。这只是个猜测，第 7 期读到 `Gate` 时再看它站不站得住。

### 6. 一条 shape 流水线（mp=16，bsz=1，seqlen=4）

跟着一个 token 走完两条低秩路。第三列是全局形状，第四列是单卡。

| 步骤 | 代码位置 | 全局形状 | 单卡形状 |
|---|---|---|---|
| 输入 `x` | 上一层输出 | `[1, 4, 7168]` bf16 | 同（复制） |
| `wq_a`（`Linear`，不切） | {% include src.html path="inference/model.py" lines="427" text="第 427 行" %} | `[1, 4, 1536]` | 同，11.01M 参数每卡一份 |
| `q_norm` | {% include src.html path="inference/model.py" lines="428" text="第 428 行" %} | `[1, 4, 1536]` | 同 |
| `wq_b`（切 0 维） | {% include src.html path="inference/model.py" lines="429" text="第 429 行" %} | `[1, 4, 24576]` | `[1, 4, 1536]` |
| `view` | {% include src.html path="inference/model.py" lines="465" text="第 465 行" %} | `[1, 4, 128, 192]` | `[1, 4, 8, 192]` |
| `split` → `q_nope` / `q_pe` | {% include src.html path="inference/model.py" lines="466" text="第 466 行" %} | `[1,4,128,128]` / `[1,4,128,64]` | `[1,4,8,128]` / `[1,4,8,64]` |
| `wkv_a`（`Linear`，不切） | {% include src.html path="inference/model.py" lines="430" text="第 430 行" %} | `[1, 4, 576]` | 同 |
| `split` → `c_KV` / `k_pe` | {% include src.html path="inference/model.py" lines="469" text="第 469 行" %} | `[1,4,512]` / `[1,4,64]` | 同 |
| `k_pe.unsqueeze(2)` | {% include src.html path="inference/model.py" lines="470" text="第 470 行" %} | `[1, 4, 1, 64]` | 同，**头维是 1** |
| `kv_norm` | {% include src.html path="inference/model.py" lines="431" text="第 431 行" %} | `[1, 4, 512]` | 同 |
| `wkv_b`（切 0 维） | {% include src.html path="inference/model.py" lines="432" text="第 432 行" %} | `[1, 4, 32768]` | `[1, 4, 2048]` → `[1,4,8,256]` |
| `wo`（切 1 维 + all-reduce） | {% include src.html path="inference/model.py" lines="433" text="第 433 行" %} | `[1, 4, 7168]` | `[1,4,1024] × [7168,1024]` |

四处值得停一下。

**第一，"切"与"不切"有明确的判据。** `wq_a`、`wkv_a` 是 `Linear` → 每卡一份全量；`wq_b`、`wkv_b`、`wo` 是并行层 → 按 `world_size` 切。第 4 节那个 +21.4%，就是从 `Linear` 和 `ColumnParallelLinear` 这一字之差里出来的。

**第二，`q_pe` 有头维，`k_pe` 没有。** 表里 `k_pe` 是 `[1,4,1,64]`——头维是 1，128 个头共用同一个位置键。这就是 MLA 里唯一一处真正的 MQA：位置那一路。内容那一路（512）是每头独立重建的，位置那一路（64）是全头共享的。**576 是"低秩"和"MQA"两种压缩加起来的，不是一种。**

**第三，`wkv_b` 在默认分支里根本不出现。** 这张表是构造期的形状；跑到 `forward` 时，`attn_impl` 不是 `naive` 就走{% include src.html path="inference/model.py" lines="483" text="第 483 行" %}那条路——`wkv_b` 被折进 `q_nope` 和输出投影，KV 永远不会被真正展开。所以上表最后两行只在 naive 分支成立。这件事是下一期的全部内容，这里只标注边界。

**第四，`k_pe` 的 64 维来自 `qk_rope_head_dim`，不是 `v_head_dim`。** 所以 MLA 的 $d_h^R$ 是 64 而 $d_h$ 是 128，比例正好 1:2——V2 论文里 $d_h^R = d_h/2$ 的那个设定，在 V3 的配置里原样保留。

顺便把第 2 节留的那句话说完。同样是 mp=16：

- naive 分支的 `k_cache` 是 `[b, s, 8, 192]`、`v_cache` 是 `[b, s, 8, 128]`，每卡 2560 个元素——**按头切了**。
- MLA 分支的 `kv_cache` 是 `[b, s, 512]`、`pe_cache` 是 `[b, s, 64]`，每卡 576 个元素——**一个头维都没有，16 张卡各存一份完整的**。

全局账是 40960 → 576（71 倍），单卡账是 2560 → 576（4.4 倍）。两个数都对，但只有后一个决定你要几张卡。**这是这个系列里第一个"全局数字好看、单卡数字打折"的地方**，第 6 期会把 8K / 32K / 128K 三条曲线都按每卡算一遍。

### 7. 三个常见误解

**误解一：MLA 就是 MQA 加了一次上投影。**

差得有点远。MQA 让所有头共用同一份 K 和 V，128 个头看到的是**完全相同**的 192 维键和 128 维值。MLA 里 128 个头看到的是**各不相同**的 $k_{nope}$ 和 $v$：每个头有自己那 128 行 $W^{UK}$、自己那 128 行 $W^{UV}$，输出的 32768 行一行没少。共用的只是**输入端**那个 512 维潜向量。

真正像 MQA 的只有位置那一路：$k_t^{R}$ 是 64 维、头维为 1、128 个头共享。所以准确的说法是"内容低秩 + 位置 MQA"，而不是"MLA ≈ MQA"。

**误解二：`q_lora_rank` 也在省 KV cache。**

Q 不进 cache，576 里没有它的位置。这句话不是推测，是四行 `register_buffer` 直接写出来的：`kv_cache` 的宽度是 `kv_lora_rank`，`pe_cache` 的宽度是 `qk_rope_head_dim`，没有第三个 buffer。

更能说明问题的是代码结构：`q_lora_rank == 0` 有一条完整的 else 分支，说明这个压缩**可以关掉**；而 `wkv_a`、`wkv_b` 没有任何开关——关掉它这一层就不是 MLA 了。一个可关，一个不可关，它们解决的问题本来就不在一个层级上。

**误解三：低秩一定是省显存的。**

这是本期最想推翻的一条。mp=16 时，Q 那一路每卡 13.37M，比不压缩的 11.01M **多 21.4%**——因为 `wq_a` 是 `Linear`，16 张卡各存一份全量。整层还能省 29.5%，靠的是 KV 那一路省下的 13.17M 抵掉了 Q 多花的 2.36M。

换句话说：**1536 兑现的是"全局参数少 3.64%、Q 这一路的算子降到 1/3.6"，不是"每卡显存少一半"。** 前者随 `world_size` 增大而稀释（mp=1 时整层省 68.1%，mp=16 时只剩 29.5%），后者压根不存在。把这两件事混在一起讲，就会得出"低秩在推理时省显存"这种在 mp=16 下站不住的结论。

### 8. 在 CPU 上把秩和每卡占用各量一遍

下面这段只需要 numpy，五十来行，做三件事：用一个缩小版的矩阵验证"复合映射的秩等于中间维度"、把 671B 这一层的参数和每卡占用算出来、把五种机制的 cache 并排放。

```python
import numpy as np

# ---------- 实验一：低秩复合的秩与零空间（缩小版） ----------
rng = np.random.default_rng(7)
d, r, H, hd = 64, 12, 8, 8               # 缩小版：dim=64, rank=12, 8 头 x 8 维
W_QA = rng.normal(size=(r, d))           # 下投影 [12, 64]
W_QB = rng.normal(size=(H * hd, r))      # 上投影 [64, 12]
W_direct = rng.normal(size=(H * hd, d))  # 直接投影 [64, 64]

comp = W_QB @ W_QA
s = np.linalg.svd(comp, compute_uv=False)
print("复合 W_QB@W_QA 形状", comp.shape, "秩", np.linalg.matrix_rank(comp))
print("直接投影        形状", W_direct.shape, "秩", np.linalg.matrix_rank(W_direct))
print("复合矩阵奇异值：第 12 个 %.3f，第 13 个 %.2e，断崖 %.1f 个数量级"
      % (s[11], s[12], np.log10(s[11] / s[12])))

_, _, Vt = np.linalg.svd(W_QA)
v = Vt[-1]                               # 落在 W_QA 零空间里的一个方向
print("W_QA@v 模 %.2e   复合@v 模 %.2e   直接@v 模 %.2e"
      % (np.linalg.norm(W_QA @ v), np.linalg.norm(comp @ v), np.linalg.norm(W_direct @ v)))

# ---------- 实验二：671B 这一层的参数与每卡占用 ----------
dim, nh, qr, kvr = 7168, 128, 1536, 512
dn, dr, dv = 128, 64, 128
qk = dn + dr
mla = [("wq_a", [qr, dim]), ("q_norm", [qr]), ("wq_b", [nh * qk, qr]),
       ("wkv_a", [kvr + dr, dim]), ("kv_norm", [kvr]),
       ("wkv_b", [nh * (dn + dv), kvr]), ("wo", [nh * dv, dim])]
total = sum(int(np.prod(sh)) for _, sh in mla)
print()
for name, sh in mla:
    p = int(np.prod(sh))
    print("  %-7s %-16s %12d  %5.2f%%" % (name, str(sh), p, 100 * p / total))
print("MLA 单层合计 %d = %.4fB" % (total, total / 1e9))
mha = 2 * dim * nh * qk + 2 * nh * dv * dim
print("同形状 MHA 合计 %d = %.4fB，比值 %.2f" % (mha, mha / 1e9, mha / total))

# wq_a / wkv_a 是 Linear（每卡各存一份），其余按 mp 切
rep = qr * dim + qr + (kvr + dr) * dim + kvr
split = nh * qk * qr + nh * (dn + dv) * kvr + nh * dv * dim
print("\nmp   MLA 每卡(M)   MHA 每卡(M)   MLA 省   其中 Q 路每卡(M)")
for mp in (1, 2, 4, 8, 16):
    q_path = qr * dim + (nh * qk * qr) // mp
    per = rep + split // mp
    per_mha = mha // mp
    print("%3d  %12.2f  %12.2f  %6.1f%%  %14.2f"
          % (mp, per / 1e6, per_mha / 1e6, 100 * (1 - per / per_mha), q_path / 1e6))

# ---------- 实验三：每 token 每层的 cache ----------
print("\n每 token 每层 cache（本仓库形状：n_h=128, k 192 维, v 128 维）")
base = nh * qk + nh * dv
for name, n in (("MHA", base), ("GQA 16 组", 16 * qk + 16 * dv),
                ("GQA 8 组", 8 * qk + 8 * dv), ("MLA", kvr + dr), ("MQA", qk + dv)):
    print("  %-9s %6d 元素  %.0f 倍" % (name, n, base / n))
print("  576 = %.2f 个头宽 = %.2f 组 GQA" % ((kvr + dr) / dv, (kvr + dr) / (2 * dv)))
```

实际输出：

```
复合 W_QB@W_QA 形状 (64, 64) 秩 12
直接投影        形状 (64, 64) 秩 64
复合矩阵奇异值：第 12 个 28.103，第 13 个 1.31e-14，断崖 15.3 个数量级
W_QA@v 模 1.07e-15   复合@v 模 7.92e-15   直接@v 模 8.46e+00

  wq_a    [1536, 7168]         11010048   5.88%
  q_norm  [1536]                   1536   0.00%
  wq_b    [24576, 1536]        37748736  20.17%
  wkv_a   [576, 7168]           4128768   2.21%
  kv_norm [512]                     512   0.00%
  wkv_b   [32768, 512]         16777216   8.97%
  wo      [16384, 7168]       117440512  62.77%
MLA 单层合计 187107328 = 0.1871B
同形状 MHA 合计 587202560 = 0.5872B，比值 3.14

mp   MLA 每卡(M)   MHA 每卡(M)   MLA 省   其中 Q 路每卡(M)
  1        187.11        587.20    68.1%           48.76
  2        101.12        293.60    65.6%           29.88
  4         58.13        146.80    60.4%           20.45
  8         36.64         73.40    50.1%           15.73
 16         25.89         36.70    29.5%           13.37

每 token 每层 cache（本仓库形状：n_h=128, k 192 维, v 128 维）
  MHA        40960 元素  1 倍
  GQA 16 组    5120 元素  8 倍
  GQA 8 组     2560 元素  16 倍
  MLA          576 元素  71 倍
  MQA          320 元素  128 倍
  576 = 4.50 个头宽 = 2.25 组 GQA
```

第一段最能说明"秩"是什么。缩小版里 `dim=64`、`rank=12`，复合矩阵的形状是 64×64，和直接投影**一模一样**——但秩是 12 对 64。奇异值序列在第 12 个之后有一个 15.3 个数量级的断崖：28.103 掉到 1.31e-14，后者纯粹是浮点噪声。**形状相同、秩不同，这就是低秩分解的全部含义**，也是为什么"把它俩当成同一个东西"会在数学上出错。

第二段第三行是那个反例：`W_QA @ v` 的模是 1.07e-15，`comp @ v` 是 7.92e-15——这个方向被吃得干干净净；同一个 `v` 喂给直接投影，模是 8.46。**一个 52 维的零空间，在复合映射里是死的，在直接投影里是活的。**

第二段后半是第 4 节那张表，第三段是第 1 节那张表。把 mp 从 1 拉到 16，MLA 的"省"从 68.1% 掉到 29.5%，而 MHA 每卡的 587.20M 除以 16 就是 36.70M——**MHA 的账随并行度线性缩小，MLA 的账不会，因为 `wq_a` 和 `wkv_a` 是复制的。** 这条曲线是后面所有"并行度怎么选"的讨论的起点。

### 9. 下期预告

下一期进 `MLA.forward`。576 已经站在 cache 里了，问题是它怎么被读出来：$W^{UK}$ 凭什么能被折进 $W^{Q}$、折进去之后每个头还能不能算出自己那份注意力、以及每次前向都要重做一遍的那笔 `wkv_b` 反量化到底赔了什么。

一句话钩子：**吸收不是优化，是把一次矩阵乘法挪到了另一个位置——换来的是 K 永远不必被算出来，赔掉的是 K 再也不能被事后加工：任何想加在 K 上的东西都得先折进 $W^{UK}$，折不进去就只能另开一路。那 64 维的 RoPE 就是被这条约束逼出来的。**

---

## 小结

- 512 压缓存，1536 压权重。前者被架构钉死（`wkv_a`/`wkv_b` 没有关闭分支），后者是可选项（`q_lora_rank == 0` 有一条完整的 else）。
- 576 = 512 + 64 = 4.5 个头宽 = 2.25 组 GQA，和 V2 论文表 1 的说法一致；$d_c = 4d_h$、$d_h^R = d_h/2$ 这两个比例 V3 原样继承。
- 单层 MLA 187,107,328 参数，其中 `wo` 一个人占 62.77%。同形状 MHA 是 587,202,560，差 3.14 倍；乘 61 层是 11.41B 对 35.82B，差 24.4B，占 671B 的 3.64%。**低秩在参数上只兑现了不到四个百分点。**
- mp=16 时 Q 那一路每卡 13.37M，比不压缩的 11.01M 多 21.4%——因为 `wq_a` 是 `Linear`，16 卡各存一份。整层省下的 29.5% 全部来自 KV（13.17M），Q 是净支出（2.36M）。
- 代价是秩：$\mathrm{rank}(W^{UK}W^{DKV}) \le 512$，$\dim\ker W^{DKV} = 6656$，92.9% 的输入方向对 K/V 内容通路恒为零，而且 K 和 V 共享同一片盲区。128 个头的 K/V 只有 4 个头宽的自由度，Q 只有 12 个。
- 最容易踩的坑是把"全局参数"和"每卡显存"混为一谈。前者随 `world_size` 稀释，后者压根不存在——这一期的所有表格都在区分这两件事。
