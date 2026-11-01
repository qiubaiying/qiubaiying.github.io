---
layout:     post
title:      DeepSeek-V3 源码精读（4）：checkpoint 里的 fp8 怎么变成能算的数
subtitle:   97 行里没有一次量化：448 是 e4m3 的上界，128 是块的边长，两个数配成一对才让 671B 只占 625 GiB
date:       2026-11-01
author:     WY
header-img: img/post-bg-hacker.jpg
catalog:    true
description: 从 convert.py 的改名切片读到 kernel.py 的 weight_dequant：e4m3 为什么是 448 而不是 57344、128×128 的块为什么省不掉、weight_scale_inv 为什么不能取倒数，以及 fp8 GEMM 里那三个必须同时等于 128 的地方。
math:       true
series:     deepseek-source
chapter:    4
source:     deepseek-ai/DeepSeek-V3@9b4e9788e4a3
tags:
    - 人工智能
    - 深度学习
    - 大语言模型
    - 神经网络
---

## 开篇：97 行里没有一次量化

上一篇结尾说这期去看 checkpoint。`inference/convert.py` 一共 97 行，我翻了两遍，想找一件事：**它在哪儿做量化？**

答案是：没有。整个文件没有一次乘除，没有一次求最大值，没有一次 `.float()`。它只做三件事——改名、切片、拷贝文件。真正的 fp8 到 bf16 的换算在 `kernel.py` 的 `weight_dequant` 里，而且**不一定被调用**。

这就解释了"671B 的权重只占一半显存"这个说法为什么既对又容易被误读：省一半不是因为推理时压了，是因为 checkpoint 交到你手上时**本来就是 fp8 的**。DeepSeek-V3 是 fp8 混合精度训出来的，发布的就是 fp8 权重加一组 fp32 的 scale。推理代码里没有"量化"这一步，只有"要不要还原、什么时候还原"这一步。

所以这期只回答一个问题：**checkpoint 里那个 24576×1536 的、每元素一字节的张量，怎么变成能参与计算的数；以及顺带回答，那个 128 是从哪来的。**

三条前置，缺一条会卡：

1. fp8 有两种常见格式，e4m3 和 e5m2。这里用的是 e4m3，上界是 **448**——不是 255，也不是 127。
2. 权重和激活的量化块**不一样大**：权重是 128×128，激活是 1×128。混着记，读 `fp8_gemm_kernel` 时一定卡住。
3. `convert.py` 不决定数值，只决定布局。布局错了会加载失败并报错；数值错了会静默变傻，什么都不报。

## 第 4 期：448 和 128 是一对

### 1. 448 这个数：e4m3 的上界，不是随便挑的

fp8 只有 8 位。e4m3 是 1 位符号、4 位指数、3 位尾数；e5m2 是 1 位符号、5 位指数、2 位尾数。位分配一换，两个数就全变了：

| 格式 | 尾数位 | 最大正规数 | 最小正规数 | 最小次正规数 | 每倍频格数 |
|---|---|---|---|---|---|
| e4m3 | 3 | 448 | $2^{-6}$ | $2^{-9}$ | 8（步长 6.25%） |
| e5m2 | 2 | 57344 | $2^{-14}$ | $2^{-16}$ | 4（步长 12.5%） |

448 是这么来的：指数最大取 8，尾数最大取 1.75，$1.75 \times 2^{8} = 448$。它不是"接近 2 的幂"的巧合，是 4 位指数和 3 位尾数乘出来的固定值。

把两行对比着看：e4m3 的精度好一倍（6.25% 对 12.5%），范围窄 128 倍（448 对 57344）。于是"为什么不用 e5m2"这个问题，常规答法是"e5m2 精度不够"，但真正的答案更准确一点：

> **e5m2 多出来的那个指数位，被块归一化吃掉了；剩下能兑现的只有尾数，而尾数 e4m3 多一位。**

因为权重在量化前会先除以自己那一块的 scale，把整块压进 $[-448, 448]$。块内需要覆盖的相对动态范围只有 $448 / 2^{-9} = 229376$，约 5.4 个数量级、17.8 位指数跨度。这个范围足够装下一整块权重；至于"整张矩阵的最大值可能有 10 倍差异"，那不是块内的问题——每块自己归一化，块与块之间互不相干。

所以块划分和 e4m3 是**配对设计**：没有块归一化，e4m3 的窄范围是硬伤；有了块归一化，窄范围就不再是约束。反过来，如果只抄了 e4m3 而没抄分块，就会得到一个动不动就溢出的量化器。

顺带一个容易忽略的后果：e4m3 没有 inf 编码（8 位全用完，只留了一个 NaN）。所以"算出 500，饱和到 448"这条路不存在，归一化必须严格对。这就是 `act_quant_kernel` 里那句 `amax = tl.maximum(amax, 1e-4)` 存在的理由（{% include src.html path="inference/kernel.py" lines="26-28" text="26-28 行" %}），也是后面每一处 scale 计算都不能含糊的理由。

量化的三步，写成公式只有三行：

$$
s = \frac{\max(\mathrm{amax},\ 10^{-4})}{448}, \qquad q = \mathrm{round}_{\mathrm{e4m3}}\!\left(\frac{x}{s}\right), \qquad \hat{x} = q \cdot s
$$

第一步定标尺，第二步落到 8 位格点上，第三步乘回去。**没有一步涉及"压缩"，只是把连续值换成格点值。** 671B 省下的那一半显存，全部来自第二步的位宽，跟第三步无关。

### 2. 128：一个块里 16384 个权重共用一个 float

权重的量化块是 128×128，一个块一个 fp32 的 scale。矩阵 `[N, K]` 对应的 scale 形状是 `[N/128, K/128]`。`wq_b` 是 `[24576, 1536]`，scale 就是 `[192, 12]`，2304 个 float，9 KB。

存储开销算一下就知道这个设计有多克制：一个块 16384 个权重，额外占 4 字节，也就是 **0.0244%**。整模型 6710 亿个参数，scale 表一共 163.8 MB——不到权重总量的万分之三。如果块缩到 16×16，开销涨到 1.5625%，六十四倍。

激活那边是另一套：`[batch, seq, 7168]` 按最后一维切，**每 128 个通道一个 scale，一个 token 一段，块是 1×128**。`act_quant` 里那句 `x.new_empty(*x.size()[:-1], x.size(-1) // block_size)` 就是它的形状（{% include src.html path="inference/kernel.py" lines="54" text="第 54 行" %}）。7168 维被切成 56 段，一个 token 56 个 scale。

为什么激活是 1×128 而权重是 128×128？不是随手写的。权重是静态的，落盘、切分、加载，块怎么划都不影响运行时；激活是流式的，按行切意味着**每个 token 独立量化**，不需要等一整批到齐，也不跨 token 共享统计量——这一点在第 5 节会变成一句"不需要全局 amax"的关键论据。

到这里一个自然的疑问是：既然块越大越省，为什么不干脆 per-tensor？既然块越小越准，为什么不切到 16？

我把这件事量了（脚本在第 8 节）。取一个 1024×128 的矩阵，八个 128 行的块幅度依次是 $2^{0}$ 到 $2^{-7}$，也就是块与块之间差 128 倍，然后分别用 per-tensor、128 块、64 块、32 块、16 块量化再反量化：

| 量化粒度 | 平均相对误差 | 清零率 | scale 开销 |
|---|---|---|---|
| per-tensor | 2.3105% | 0.04% | 0 |
| 128×128 | 2.2545% | 0.00% | 0.0244% |
| 64×64 | 2.2473% | 0.00% | 0.0977% |
| 32×32 | 2.2451% | 0.00% | 0.3906% |
| 16×16 | 2.2486% | 0.00% | 1.5625% |

**几乎完全一样。** 块与块差 128 倍，per-tensor 也只比 128 块差 0.06 个百分点。原因不难想：e4m3 的每个倍频有 8 个格点，一个数只要还落在正规区，它的相对误差就永远是 3% 上下，跟块多大没关系。真正会把误差拉开的不是"块间幅度差"，而是**离群值**——同一张矩阵里塞一个 $3\times10^{4}$ 倍的离群值，per-tensor 的平均误差从 2.31% 跳到 15.83%，10.38% 的权重被压成 0；128 块只有离群值所在的那一块变差（15.83%），隔壁干净的块仍是 2.26%、清零 0.00%。

一句话：**块划分的作用是隔离，不是适配。** 它挡的是"少数几个数特别大"，不是"这一片数普遍偏小"。

那 128 这个数字到底被什么钉住的？不是精度。往下切到 16 也只是把开销从 0.024% 抬到 1.56%，精度一分没赚。答案在第 5 节的 GEMM 里。

### 3. 97 行里的 11 行：改名、切片、拷贝

`convert.py` 的主体就是这 11 行（{% include src.html path="inference/convert.py" lines="66-76" text="66-76 行" %}）：

```python
# inference/convert.py:66-76
for i in range(mp):
    new_param = param
    if "experts" in name and "shared_experts" not in name:
        idx = int(name.split(".")[-3])
        if idx < i * n_local_experts or idx >= (i + 1) * n_local_experts:
            continue
    elif dim is not None:
        assert param.size(dim) % mp == 0, f"Dimension {dim} must be divisible by {mp}"
        shard_size = param.size(dim) // mp
        new_param = param.narrow(dim, i * shard_size, shard_size).contiguous()
    state_dicts[i][name] = new_param
```

外层的 `for i in range(mp)` 是"给每一张卡准备一份字典"，不是"把张量切成 mp 份然后分发"。这个循环里没有任何通信，纯本机内存操作。

三条分支对应三种参数：

**A 组，专家。** 名字里含 `experts` 走连续区间切：256 个专家、mp=16，每卡 16 个。这里有个必须注意的细节——`shared_experts` 里也含 `experts` 这个子串，所以判断写成 `"experts" in name and "shared_experts" not in name`。少写后半句，共享专家会被按专家索引切碎，而且切完形状照样能存盘，要到前向算到一半才炸。

**B 组，线性层权重。** `dim is not None` 时按 `narrow` 切。`dim=0` 是列并行（切输出维），`dim=1` 是行并行（切输入维）。这正是第 2 期讲的那套配对：`q_b_proj`、`kv_b_proj`、`gate_proj`、`up_proj` 切 0 维，`o_proj`、`down_proj` 切 1 维。

**C 组，其余。** 两个分支都不进，`new_param` 还是原来那个张量对象，被 16 份字典同时引用，`save_file` 各写一遍。磁盘上复制 16 份，显存里也是 16 份。所有 norm 的 weight、`gate`（路由打分矩阵）、`q_a_proj`、`kv_a_proj_with_mqa` 都在这一组。

值得单独看一眼的是 `q_a_proj` 和 `kv_a_proj_with_mqa`——它们明明可以切，却被归进 C 组。`wq_a` 是 `[1536, 7168]`，1536 是 12 个 128，`dim=0` 切得动。不切的原因是：低秩投影的输出紧接着要被 `q_norm` 按 1536 维整体归一化，切开就得先 all-gather 再 norm，一次通信换 11.0M 参数的复制。而 `wkv_a` 的 576 维（512 latent + 64 rope）根本不是 128 的整数倍，切了块的网格就对不上——**它连被切的权利都没有**。

这个 576 不是巧合，是第 06 期要算的那笔账的分子。

另一处只在 `convert.py` 里能看见的东西：

```python
# inference/convert.py:53-54
if "model.layers.61" in name:
    continue
```

61 层，下标是 0 到 60。第 61 号是训练期的多 token 预测模块（MTP），`model.py` 里没有对应的类，所以这里直接跳过。论文写了 61 层加一个多预测头，推理代码只实现前 61 层——**"论文有、代码里没有"这件事，在这个文件里就只有这两行痕迹。**

最后是改名链：`model.layers.3.self_attn.q_proj.weight_scale_inv` 先被剥掉 `model.` 前缀，`self_attn` 换成 `attn`，`weight_scale_inv` 换成 `scale`，此时名字是 `layers.3.attn.q_proj.scale`；再取倒数第二个分量当查表键（{% include src.html path="inference/convert.py" lines="62" text="第 62 行" %}），命中 `q_proj` → `wq`，整串替换后落到 `layers.3.attn.wq.scale`。注意 `weight_scale_inv` 是在查表**之前**就被换掉的，所以 `split(".")[-2]` 取到的永远是模块名（`q_proj`），不会变成 `scale`；scale 张量和 weight 张量因此走的是同一条 `q_proj → wq` 的路，也就自动继承了同一个 `dim`。**权重的 scale 和权重本身必须沿同一维切**，否则块网格会错位——这一点靠的是流程而不是断言，读的时候容易漏。

### 4. 十行反量化：乘，不是除

真正把 fp8 变成可算的数的，是这十行（{% include src.html path="inference/kernel.py" lines="76-86" text="76-86 行" %}）：

```python
# inference/kernel.py:76-86
pid_m = tl.program_id(axis=0)
pid_n = tl.program_id(axis=1)
n = tl.cdiv(N, BLOCK_SIZE)
offs_m = pid_m * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)
offs_n = pid_n * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)
offs = offs_m[:, None] * N + offs_n[None, :]
mask = (offs_m[:, None] < M) & (offs_n[None, :] < N)
x = tl.load(x_ptr + offs, mask=mask).to(tl.float32)
s = tl.load(s_ptr + pid_m * n + pid_n)
y = x * s
```

grid 是二维的，每个 program 负责一个 128×128 的块，一次 `tl.load` 拿一整个块。`n = cdiv(N, BLOCK_SIZE)` 是 scale 的列数，`pid_m * n + pid_n` 就是 `[N/128, K/128]` 这张表里的下标。

这里有个容易看反的地方：kernel 里的 `M` 是权重的输出维、`N` 是输入维，`pid_m` 走输出、`pid_n` 走输入；而 GEMM 里 `M` 是 token 数、`N` 是输出通道。**两个 kernel 的 m/n 不是一回事**，只在这一个文件里就换了含义。

`offs = offs_m[:, None] * N + offs_n[None, :]` 是手写行主序寻址，因为权重是按 `[M, N]` 连续存的。最后一个块不满 128 时靠 `mask` 兜住——这也是为什么 `weight_dequant` 只要求 `x.is_contiguous()` 和二维，不要求整除（{% include src.html path="inference/kernel.py" lines="104-105" text="104-105 行" %}）。

然后是最关键的一行：`y = x * s`。**乘。**

checkpoint 里这个字段叫 `weight_scale_inv`，名字里带 `inv`，看起来像"需要取倒数的 scale"。`convert.py` 第 60 行把它改名为 `scale`，`weight_dequant` 直接乘上去。所以 `_inv` 的意思是"量化时那个除数的倒数"——量化是 `q = x / s`，反量化自然就是 `x = q * s`，这个 `s` 恰好是"除数的倒数"，所以叫 `_inv`。看到 `inv` 就写一次 `1.0 / s`，等于把还原做成了二次量化：数值全错，形状全对，误差大到能看出来，但报错一处都没有。

### 5. 128 真正被谁钉住：GEMM 的 K tile

现在回到第 2 节留下的问题。`fp8_gemm_kernel` 里有四个指针，前两个寻址数据，后两个寻址 scale（{% include src.html path="inference/kernel.py" lines="151-154" text="151-154 行" %}）：

```python
# inference/kernel.py:151-154，156-162（去掉四条 load）
a_ptrs = a_ptr + offs_m[:, None] * K + offs_k[None, :]
b_ptrs = b_ptr + offs_n[None, :] * K + offs_k[:, None]
a_s_ptrs = a_s_ptr + offs_m * k
b_s_ptrs = b_s_ptr + (offs_n // BLOCK_SIZE_K) * k
...
accumulator += tl.dot(a, b) * a_s[:, None] * b_s[None, :]
```

`k = cdiv(K, BLOCK_SIZE_K)`，也就是 K 方向有几个 scale 块。看这两行 scale 寻址：

- `a_s_ptrs = a_s_ptr + offs_m * k`：激活的 scale 按**行**索引，一行一组，正是 `act_quant` 出来的 `[M, K/128]`。
- `b_s_ptrs = b_s_ptr + (offs_n // BLOCK_SIZE_K) * k`：权重的 scale 按 `offs_n // 128` 索引——**输出的第几个 128 行块**。

第二行就是答案。它用 `BLOCK_SIZE_K` 去除以输出通道下标，可是 `BLOCK_SIZE_K` 是 K 方向的 tile 宽度。这两个东西能对上，只有一个前提：**权重量化块的边长、激活量化块的边长、GEMM 的 K tile，三者都是 128。**

而 `BLOCK_SIZE_K` 在自动调优的候选表里是写死的（{% include src.html path="inference/kernel.py" lines="113-116" text="113-116 行" %}）：`block_m` 取 16/32/64，`block_n` 取 32/64/128，`num_stages` 取 3/4/5/6，一共 36 组，`BLOCK_SIZE_K` 恒等于 128。**这不是偷懒，是不能调。** 把 64 加进候选表，`k` 会变成 `K/64`，scale 指针按双倍步长往前走，读到的是别的行的 scale——Triton 的裸指针不做边界检查，不报错，不越界崩，只是每一块的输出都乘了一个错的比例。

所以"块边长为什么是 128"有三层答案，一层比一层实：

1. **精度上不是它。** 第 2 节的表已经说明：128、64、32、16 的误差在 2.25% 附近，差不到 0.01 个百分点。块大小在这件事上几乎是平的。
2. **开销上也不急。** 128 块的开销 0.0244%，切到 16 才 1.56%，两头都不是瓶颈。
3. **硬件上是它。** K 向 tile 取 128，一个块正好一个 tile，scale 用寄存器里的一个标量就够，不用为每个元素单独取。块边长必须等于 tile 宽，否则就要在 K 循环里做二次索引。

这也解释了那个副作用——乘 scale 为什么必须写在循环里：

$$
C_{m,n} = \sum_{t=0}^{K/128-1} s^{A}_{m,t}\, s^{B}_{n,t} \left( \sum_{j} A_{m,\,128t+j}\, B_{128t+j,\,n} \right)
$$

per-tensor 量化时，两个 scale 都是常数，可以提到求和外面，`A@B` 算完再乘一次就完了。块级量化不行：每个 K tile 有自己的 $s^A$ 和 $s^B$，只能在循环里逐块乘。代价按运算次数算不大——每个 K tile 每个输出元素多 2 次乘，相对 128 次 MAC 是 0.78%——但这 2 次乘落在 CUDA core 上，不是 tensor core，实际的时间代价比 0.78% 高。**块内共享 scale 换来的不是精度，是局部性：不需要全局 amax、不需要跨卡 all-reduce、不需要维护历史校准状态。** 在 16 卡张量并行里，"全局 amax"这四个字本身就意味着一轮通信，而块内的 amax 在寄存器里 reduce 完就没了。

顺带说一句 `model.py` 第 15 行的 `block_size = 128`。这一个全局变量同时决定了三处：`act_quant` 的块、`weight_dequant` 的 tile、`Linear.__init__` 里建的 scale 形状（{% include src.html path="inference/model.py" lines="184-187" text="184-187 行" %}）。但**它决定不了第四处**——GEMM 的 `BLOCK_SIZE_K` 在 `kernel.py` 里是字面量 128。把这行改成 64，前三处会跟着变，第四处不会，于是 scale 指针整体错位，前向照样跑完，输出全是噪声。这是我在这个文件里找到的最脆的一处耦合。

### 6. 一条 shape 流水线（mp=16，wq_b，bsz=1，seqlen=4）

把上面四段接起来，跟着一个权重从磁盘走到计算结果。第四列是单卡形状。

| 步骤 | 代码位置 | 全局形状 / 类型 | 单卡形状 / 类型 |
|---|---|---|---|
| checkpoint 里的 `wq_b.weight` | safetensors | `[24576, 1536]` fp8 | — |
| 同一块的 scale | `q_b_proj.weight_scale_inv` | `[192, 12]` fp32 | — |
| 按 dim 0 切 16 份 | {% include src.html path="inference/convert.py" lines="72-75" text="72-75 行" %} | — | `[1536, 1536]` fp8，2.36 MB |
| scale 同步切 | 同上（`dim=0`） | — | `[12, 12]` fp32，576 B |
| 建模型时开空壳 | {% include src.html path="inference/model.py" lines="183-187" text="183-187 行" %} | — | 同上，`scale` 是 Parameter |
| 拷入权重 | {% include src.html path="inference/generate.py" lines="119" text="第 119 行" %} | — | 逐字节拷，不做 dtype 转换 |
| 输入 `x` | 上一层的输出 | `[1, 4, 7168]` bf16 | 同（复制） |
| `act_quant(x)` | {% include src.html path="inference/kernel.py" lines="38-57" text="38-57 行" %} | — | `[1, 4, 7168]` fp8 + `[1, 4, 56]` fp32 |
| `fp8_gemm` | {% include src.html path="inference/kernel.py" lines="175-196" text="175-196 行" %} | — | `[1, 4, 1536]` bf16 |

三个地方值得停一下。

**第一，dtype 是在建模型时定的，不是加载时定的。** `Transformer.__init__` 的第 760 行先写 `Linear.dtype = torch.float8_e4m3fn if args.dtype == "fp8" else torch.bfloat16`，然后才开始建层（{% include src.html path="inference/model.py" lines="760-761" text="760-761 行" %}）。`Linear.__init__` 里 `self.weight.element_size() == 1` 这个判断，判的正是它。所以是"先按 fp8 开空壳、顺带开一个 scale 空壳，再把 checkpoint 拷进去"；如果配置写的是 bf16，空壳就没有 scale 这个键，而 fp8 checkpoint 里带着一整套 `.scale`，strict 加载当场报多余键。

**第二，`head` 和 `embed` 不是 fp8。** 第 769 行给 `self.head` 显式传了 `dtype=torch.get_default_dtype()`（bf16），`ParallelEmbedding` 用的是默认 dtype。词表 129280 × 7168，两个矩阵各 926.7M 参数，加起来 1.853B——这部分按 2 字节存，是整个模型里唯一的双倍宽度。也正因为它们不是 fp8，`linear()` 对它们走的是第一条分支，压根不碰 scale。

**第三，scale 挂在权重上。** `self.weight.scale = self.scale = nn.Parameter(...)` 这一行同时做了两件事：挂到权重对象上，让 `linear(x, weight, bias)` 只传一个张量也能拿到 scale；注册成 Parameter，让 scale 进 state_dict、跟着 `.to(device)` 一起搬。不这么写，`linear()` 的签名就得多一个参数，而 `linear()` 是被 `ColumnParallelLinear.forward` 和 `RowParallelLinear.forward` 共用的。

顺便把显存的账结掉：671.0B 参数按 1 字节是 624.9 GiB，把 1.853B 个 bf16 的嵌入与输出头换回双倍宽度，合计约 626 GiB；按 README 的 `--model-parallel 16` 摊到 16 张卡，每卡 39.2 GiB。80GB 的卡剩下一半给 KV cache——61 层 × 576 维 × 2 字节 = 70.3 KB/token，16K 上下文一条序列 1.07 GiB。**这也解释了 README 为什么要求两台 8 卡机器而不是一台：mp=8 时每卡 78.3 GiB，KV cache 一格都放不下。**

### 7. 三个常见误解

**误解一：`convert.py` 负责把权重压成 fp8。**

它一行算术都没有。fp8 是训练时就定下的，checkpoint 落盘就是 1 字节一个权重，`convert.py` 只改名、切片、拷贝。这意味着两件事：第一，你没法用它"把 bf16 模型量化成 fp8"，反向的工具是 `fp8_cast_bf16.py`，方向恰好相反；第二，scale 也不是它算的，是 checkpoint 里带过来的——**推理阶段的量化参数完全继承训练，没有一次重新校准**。想让模型换个量化粒度，得重新训练或者做 PTQ，不是改个参数的事。

**误解二：分块量化是因为权重各处的幅度差得太多。**

这是流传最广的解释，也是我这轮实测里被推翻得最干脆的一条。块间幅度差 128 倍的矩阵，per-tensor 和 128 块的平均相对误差是 2.3105% 和 2.2545%，差 0.06 个百分点。幅度差异本身不构成问题，因为 e4m3 的相对精度是**按倍频均分**的：一个数只要还在正规区，不管它跟块最大值差 8 倍还是 64 倍，误差都是 3% 上下。

真正需要分块的是离群值。同一张矩阵里放一个 $3\times10^{4}$ 倍的离群值，per-tensor 的全局误差从 2.31% 涨到 15.83%，10.38% 的权重被压成 0——而且**离群值所在块之外的那些块也被一起拖下水**，因为它们被迫共用一个被离群值撑大的 scale。128 块把污染限制在一个块里，隔壁块还是 2.26%、清零 0.00%。要造成这种破坏，离群值至少得是主体幅度的 $448 \times 2^{9} \approx 2.3\times10^{5}$ 倍才会把数压到 0，$3\times10^{4}$ 倍已经足够把大片权重推进次正规区。激活里这种量级的离群值是真实存在的，权重里罕见——所以分块在激活上是刚需，在权重上更多是"训练时就是这么训的，推理照抄"。

**误解三：config 里写了 `"dtype": "fp8"`，前向就走 fp8 GEMM。**

不是。`linear()` 有三条路（{% include src.html path="inference/model.py" lines="153-163" text="153-163 行" %}）：权重不是 1 字节就走 `F.linear`；是 1 字节但 `gemm_impl == "bf16"` 就先 `weight_dequant` 再 `F.linear`；只有 `gemm_impl == "fp8"` 才走 `act_quant` + `fp8_gemm`。

而 `gemm_impl` 是 `model.py` 第 16 行的模块级变量，默认 `"bf16"`，`generate.py` 的命令行参数里没有它，整个 `inference/` 目录也没有第二处给它赋值。也就是说，**照 README 直接跑，走的是中间那条：每次前向都把用到的权重重新反量化一遍。** 一个权重元素在一次前向里被搬 5 遍——读 1 字节 fp8、写 2 字节 bf16、再按 bf16 读 2 字节，而 fp8 GEMM 只读 1 遍。README 把这条路称作 "example only"，不是谦虚。

还有一处更隐蔽的：`MLA.forward` 第 481 行对 `wkv_b` 单独做了一次 `weight_dequant`，因为吸收技巧要求它先变成 bf16 才能和 `q_nope` 相乘（{% include src.html path="inference/model.py" lines="481" text="第 481 行" %}）。这一次反量化跟 `gemm_impl` 无关，**fp8 GEMM 模式下也照做**，每生成一个 token、每一层都要重做一遍：61 层 × 12.58M 元素，写出 1.5 GB 的临时量。这笔账留给第 06 期，那里要算的正是"吸收"到底省了什么、又赔了什么。

### 8. 在 CPU 上把 448 和 128 各验一遍

下面这段不需要 torch、不需要 numpy、不需要 Triton，纯标准库，五十来行。它做三件事：把 e4m3 的格点数出来、把第 2 节那两组测量重跑一遍、把全零块的除零问题摆出来。

```python
import math
import random


def to_e4m3(y):
    """把实数舍到 e4m3 的格点上：3 位尾数，正规区每倍频 8 格。"""
    if y == 0.0:
        return 0.0
    a = abs(y)
    if a < 2 ** -9:                       # 半分度以下直接归零
        return 0.0
    if a < 2 ** -6:                       # 次正规区，步长固定 2^-9
        q = round(a / 2 ** -9) * 2 ** -9
    else:
        step = 2.0 ** (math.floor(math.log2(a)) - 3)
        q = round(a / step) * step
    return math.copysign(min(q, 448.0), y)


grid = sorted({to_e4m3(i * 2 ** -12) for i in range(1, 448 * 4096)})
print("e4m3 正格点 %d 个，max=%.0f, 最小正规=%.6f, 最小次正规=%.9f"
      % (len(grid), max(grid), 2 ** -6, 2 ** -9))
print("块内可覆盖的相对范围 %.0f 倍 = %.1f 个数量级"
      % (448 / 2 ** -9, math.log10(448 / 2 ** -9)))


def quant(mat, bs):
    """bs=None 表示 per-tensor；否则按 bs x bs 分块。返回反量化后的矩阵。"""
    M, N = len(mat), len(mat[0])
    out = [[0.0] * N for _ in range(M)]
    step = max(M, N) if bs is None else bs
    for bi in range(0, M, step):
        for bj in range(0, N, step):
            amax = max(abs(mat[i][j])
                       for i in range(bi, min(bi + step, M))
                       for j in range(bj, min(bj + step, N)))
            s = max(amax, 1e-4) / 448.0
            for i in range(bi, min(bi + step, M)):
                for j in range(bj, min(bj + step, N)):
                    out[i][j] = to_e4m3(mat[i][j] / s) * s
    return out


def stats(mat, deq, lo, hi):
    errs = [abs(mat[i][j] - deq[i][j]) / abs(mat[i][j])
            for i in range(lo, hi) for j in range(len(mat[0])) if mat[i][j]]
    zero = sum(1 for i in range(lo, hi) for j in range(len(mat[0]))
               if mat[i][j] and deq[i][j] == 0.0)
    return sum(errs) / len(errs) * 100, zero / len(errs) * 100


# 实验一：块间幅度差 128 倍，看块大小敏不敏感
random.seed(7)
W = [[random.gauss(0, 2.0 ** -k) for _ in range(128)] for k in range(8) for _ in range(128)]
print("\n实验一（块间差 128 倍）")
for bs in (None, 128, 64, 32, 16):
    e, z = stats(W, quant(W, bs), 0, len(W))
    print("  粒度 %-10s 平均误差 %7.4f%%  清零 %5.2f%%  开销 %6.4f%%"
          % ("per-tensor" if bs is None else "%dx%d" % (bs, bs), e, z,
             0.0 if bs is None else 4.0 / (bs * bs) * 100))

# 实验二：塞一个 3e4 倍的离群值
W2 = [[random.gauss(0, 1) for _ in range(128)] for _ in range(256)]
W2[3][7] = 3.0e4
print("\n实验二（一个 3e4 倍离群值，落在第 0 块）")
for bs in (None, 128):
    deq = quant(W2, bs)
    tag = "per-tensor" if bs is None else "128x128"
    for name, lo in (("含离群值的块", 0), ("隔壁干净的块", 128)):
        e, z = stats(W2, deq, lo, lo + 128)
        print("  %-11s %-14s 平均误差 %7.4f%%  清零 %6.2f%%" % (tag, name, e, z))

# 实验三：全零块，kernel.py 第 27 行那个 1e-4 在挡什么
blk = [[0.0] * 128 for _ in range(128)]
amax = max(abs(v) for r in blk for v in r)
print("\n实验三：全零块 amax=%.1f，不设下限时 s=%.1f，x/s 是 0/0" % (amax, amax / 448))
s = max(amax, 1e-4) / 448.0
print("设下限后 s=%.6e，最小可表示的非零值 %.3e" % (s, s * 2 ** -9))
```

实际输出：

```
e4m3 正格点 127 个，max=448, 最小正规=0.015625, 最小次正规=0.001953125
块内可覆盖的相对范围 229376 倍 = 5.4 个数量级

实验一（块间差 128 倍）
  粒度 per-tensor 平均误差  2.3105%  清零  0.04%  开销 0.0000%
  粒度 128x128    平均误差  2.2545%  清零  0.00%  开销 0.0244%
  粒度 64x64      平均误差  2.2473%  清零  0.00%  开销 0.0977%
  粒度 32x32      平均误差  2.2451%  清零  0.00%  开销 0.3906%
  粒度 16x16      平均误差  2.2486%  清零  0.00%  开销 1.5625%

实验二（一个 3e4 倍离群值，落在第 0 块）
  per-tensor  含离群值的块         平均误差 15.8318%  清零  10.38%
  per-tensor  隔壁干净的块         平均误差 15.3155%  清零   9.78%
  128x128     含离群值的块         平均误差 15.8318%  清零  10.38%
  128x128     隔壁干净的块         平均误差  2.2555%  清零   0.00%

实验三：全零块 amax=0.0，不设下限时 s=0.0，x/s 是 0/0
设下限后 s=2.232143e-07，最小可表示的非零值 4.360e-10
```

第一段把 448 和 2^-9 都验了一遍：正格点 127 个，加 0 正好 128 个编码，8 位不多不少。第二段是第 2 节那张表的来源，也能看出**块大小在这个数据上根本不是变量**。第三段最能说明问题：同一个 3e4 倍的离群值，per-tensor 下"隔壁干净的块"是 15.32%、清零 9.78%——它跟含离群值那一块几乎一模一样，说明污染是无差别的；换成 128 块，同一块立刻回到 2.26%、清零 0。**分块量化的全部意义就在这两行的差距里。**

第四段是个提醒：全零块（padding、死专家、被 mask 掉的 token）的 amax 是 0，`s = 0`，然后 `x / s`。CPU 上这是 `ZeroDivisionError`，GPU 上是 inf 和 NaN 往下传。`tl.maximum(amax, 1e-4)` 就是为这个存在的。它的副作用也值得记：下限一旦生效，块内所有小于 $1.04\times10^{-7}$ 的数都会被压成 0——这个值由 `1e-4 / 448 × 2^-9` 决定，是三个常数相乘的结果。

改一个数就能看对照：把 `448.0` 换成 `57344.0`（也就是换成 e5m2 的格式），实验一的误差会从 2.25% 涨到 4.5% 上下，形状完全不变；把 `128` 换成 `8`，开销从 0.0244% 涨到 6.25%，误差仍然是 2.25%。**两个数里只有一个真正影响精度，另一个影响的是显存和通信。**

### 9. 下期预告

下一期进 `MLA.__init__`：从 396 行开始的那五十几行，问三个数字——`q_lora_rank=1536`、`kv_lora_rank=512`、`qk_nope_head_dim=128`。

问题会很具体：**1536 和 512 这两个数在压什么？** 单层 MLA 的参数 0.187B 是怎么被这两个低秩维度拆开的，以及——紧接这一期的话题——为什么 576 这个不能被 128 整除的数，恰好是整个 KV cache 的全部内容。

---

## 小结

- `convert.py` 97 行里没有一次量化：它只改名、切片、拷贝。fp8 是训练时定下的，scale 也是 checkpoint 带过来的，推理不重新校准。唯一一行"删功能"的代码是跳过 `model.layers.61`——训练期的 MTP 模块。
- e4m3 的上界 448 是 $1.75 \times 2^{8}$，最小正规数 $2^{-6}$，块内可覆盖 5.4 个数量级。e5m2 多出的指数位被块归一化吃掉了，能兑现的只剩尾数，而 e4m3 的尾数多一位。**分块是 e4m3 可用的前提，两者是配对的。**
- 128×128 的块让 scale 开销只有 0.0244%，整模型 163.8 MB。但块边长在精度上几乎不敏感：128/64/32/16 的误差都在 2.25% 附近。它被钉住是因为 GEMM 的 K tile 恒等于 128，而 `fp8_gemm_kernel` 用 `BLOCK_SIZE_K` 去索引权重的 scale 块。
- 分块量化挡的是离群值，不是幅度差。一个 $3\times10^{4}$ 倍的离群值能让 per-tensor 的全局误差从 2.31% 涨到 15.83%、清零 10.38%，而且污染所有块；128 块只坏一块。
- `weight_scale_inv` 直接乘，不取倒数。`y = x * s` 是唯一的还原公式。
- 最容易踩的坑不是数值，是路径：`gemm_impl` 默认 `"bf16"`，config 写 `"dtype": "fp8"` 也不会改它。看不出问题，只会慢——每个权重元素在一次前向里被搬 5 遍而不是 1 遍。
