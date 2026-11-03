---
layout:     post
title:      DeepSeek-V3 源码精读（6）：576 维的 cache 里没有 K，也没有 V
subtitle:   吸收只是把同一个矩阵乘法从 K 的左边搬到 Q 的右边——换来 71 倍字节，赔上 3.4 倍乘加
date:       2026-11-03
author:     WY
header-img: img/post-bg-debug.png
catalog:    true
description: 拆开 MLA.forward 的 39 行：40960 是怎么变成 576 的、W_UK 凭什么能被折进 Q、为什么 RoPE 必须被隔离到 64 维、以及吸收在 decode 里省的是带宽而不是算力。
math:       true
series:     deepseek-source
chapter:    6
source:     deepseek-ai/DeepSeek-V3@9b4e9788e4a3
tags:
    - 人工智能
    - 深度学习
    - 大语言模型
    - 神经网络
---

## 开篇：cache 里没有 K，也没有 V

上一篇结束在 `MLA.__init__` 的最后六行：两个 buffer，`kv_cache` 是 `[max_batch_size, max_seq_len, 512]`，`pe_cache` 是 `[max_batch_size, max_seq_len, 64]`。两个都没有头维，加起来每 token 每层 576 个数。

这期只回答一个问题：**注意力要算 q 和 k 的点积，可 cache 里一个 k 都没有，这个点积是怎么算出来的？**

答案不是"从 512 里解压出 k"。没有解码器，没有重建误差，也没有任何近似。答案是：$W^{UK}$ 被折进了 Q 里，**K 从头到尾没有被算出来过一次**。

这句话听起来像优化技巧，其实是一个代数恒等式的直接后果。理解了它，576 这个数字就不再是"论文里的魔法比例"，而是一条能被追到具体维度的账。

## 第 6 期：576 存的是原料，不是成品

### 1. 71 倍不是压出来的，是三项分别消失的

先把 40960 和 576 摆在一起，然后拆开。同形状 MHA 的 cache 是"每头 192 维的 K + 每头 128 维的 V"，MLA 是"512 维内容 + 64 维位置"。

| 存什么 | 同形状 MHA | MLA | 倍数 | 这一项发生了什么 |
|---|---|---|---|---|
| K 的内容部分 | 128 × 128 = 16384 | 512 | 32 | 真低秩：16384 压成 4 个头宽 |
| K 的位置部分 | 128 × 64 = 8192 | 64 | 128 | 不是压缩，是停止复制 |
| V | 128 × 128 = 16384 | 0 | 不存 | 不是压缩，是取消 |
| 合计 | 40960 | 576 | 71.11 | |

三行的倍数彼此不成比例（32、128、干脆不存），因为它们来自三件完全不同的事。把它们混成一句「MLA 把 KV cache 压了 71 倍」，会漏掉最关键的部分。

**V 那一行是 0。** V 根本没有被提前算出来，也没有被存下来。但它并没有丢：它由同一个 $c_t$ 经 $W^{UV}$ 生成（{% include src.html path="inference/model.py" lines="495" text="第 495 行" %}），而 $W^{UV}$ 是确定的、与位置无关的线性映射。所以「存 $c_t$、读的时候再算 V」和「算好 V 再存」携带的信息完全一样，差别只是乘法被推迟了。这是 71 倍里最大的一块，占省下总量的 41%，而它跟低秩一点关系都没有。

**位置那一行是 128 倍。** 也不是压缩。{% include src.html path="inference/model.py" lines="476" %} 那行 `k_pe.expand(-1, -1, self.n_local_heads, -1)` 是证据：naive 分支把同一个 64 维向量复制给 128 个头，再和 `k_nope` 拼成 192 维的 k 存进去。8192 个数里 8128 个是副本，只有 64 个是原始信息。MLA 做的只是**停止复制**——因为它的 rope 键本来就与头无关。

**只有第一行是真低秩。** 16384 = 128 头 × 128 维，压成 512 = 4 个头宽。这一压的代价上一篇算过：$\mathrm{rank}(W^{UK}W^{DKV}) \le 512$，6656 个输入方向对 K/V 的内容通路永久不可见。它只占省下总量的 39%。

换算成字节更直观：每 token 每层从 81920 B 变成 1152 B，61 层合计 70272 B。一条 8K 的序列，MHA 形状要 38.1 GiB，MLA 只要 0.54 GiB。**mp=16 时权重已经占掉每卡 39.2 GiB（第 4 期算过），一张 80GB 的卡剩下约 40 GiB——8K 上下文的 MHA cache 一条序列就要 38.1 GiB，刚够一条，多一条就爆。**

### 2. 39 行里的两个分支，差别只在括号位置

`forward` 的全部内容在 39 行里。两个分支都在，因为它们算的是同一个函数。

```python
# inference/model.py:459-497
        bsz, seqlen, _ = x.size()
        end_pos = start_pos + seqlen
        if self.q_lora_rank == 0:
            q = self.wq(x)
        else:
            q = self.wq_b(self.q_norm(self.wq_a(x)))
        q = q.view(bsz, seqlen, self.n_local_heads, self.qk_head_dim)
        q_nope, q_pe = torch.split(q, [self.qk_nope_head_dim, self.qk_rope_head_dim], dim=-1)
        q_pe = apply_rotary_emb(q_pe, freqs_cis)
        kv = self.wkv_a(x)
        kv, k_pe = torch.split(kv, [self.kv_lora_rank, self.qk_rope_head_dim], dim=-1)
        k_pe = apply_rotary_emb(k_pe.unsqueeze(2), freqs_cis)
        if attn_impl == "naive":
            q = torch.cat([q_nope, q_pe], dim=-1)
            kv = self.wkv_b(self.kv_norm(kv))
            kv = kv.view(bsz, seqlen, self.n_local_heads, self.qk_nope_head_dim + self.v_head_dim)
            k_nope, v = torch.split(kv, [self.qk_nope_head_dim, self.v_head_dim], dim=-1)
            k = torch.cat([k_nope, k_pe.expand(-1, -1, self.n_local_heads, -1)], dim=-1)
            self.k_cache[:bsz, start_pos:end_pos] = k
            self.v_cache[:bsz, start_pos:end_pos] = v
            scores = torch.einsum("bshd,bthd->bsht", q, self.k_cache[:bsz, :end_pos]) * self.softmax_scale
        else:
            wkv_b = self.wkv_b.weight if self.wkv_b.scale is None else weight_dequant(self.wkv_b.weight, self.wkv_b.scale, block_size)
            wkv_b = wkv_b.view(self.n_local_heads, -1, self.kv_lora_rank)
            q_nope = torch.einsum("bshd,hdc->bshc", q_nope, wkv_b[:, :self.qk_nope_head_dim])
            self.kv_cache[:bsz, start_pos:end_pos] = self.kv_norm(kv)
            self.pe_cache[:bsz, start_pos:end_pos] = k_pe.squeeze(2)
            scores = (torch.einsum("bshc,btc->bsht", q_nope, self.kv_cache[:bsz, :end_pos]) +
                      torch.einsum("bshr,btr->bsht", q_pe, self.pe_cache[:bsz, :end_pos])) * self.softmax_scale
        if mask is not None:
            scores += mask.unsqueeze(1)
        scores = scores.softmax(dim=-1, dtype=torch.float32).type_as(x)
        if attn_impl == "naive":
            x = torch.einsum("bsht,bthd->bshd", scores, self.v_cache[:bsz, :end_pos])
        else:
            x = torch.einsum("bsht,btc->bshc", scores, self.kv_cache[:bsz, :end_pos])
            x = torch.einsum("bshc,hdc->bshd", x, wkv_b[:, -self.v_head_dim:])
        x = self.wo(x.flatten(2))
        return x
```

读这段只要盯住三件事：两个分支算的是同一个函数；差别只在乘法的括号位置；有一行代码把 q 从 128 维变成了 512 维。

`naive` 分支的路径很清楚：512 维的 `kv` 先过 `kv_norm`，再整个过 `wkv_b` 展开成 128 头 × 256 维，切成 `k_nope` 和 `v`，把 `k_pe` 按 `n_local_heads` 复制后拼上去，写两个 cache。这里 `k_cache` 的形状是 `[b, s, n_local_heads, 192]`——**带着头维**。

`absorb` 分支完全不生成 K。`wkv_b` 从"要过一遍的层"变成了"一本字典"：`view(n_local_heads, -1, kv_lora_rank)` 把它切成 `n_local_heads` 个 `[256, 512]` 的小块，前 128 行是 $W^{UK}_h$，后 128 行是 $W^{UV}_h$。然后真正的动作只有一行——{% include src.html path="inference/model.py" lines="483" text="483 行" %} 把 `q_nope` 从 128 维乘成了 512 维。这一行就是"吸收"的全部。

三处细节容易滑过去。

**第一，{% include src.html path="inference/model.py" lines="481" text="481 行" %} 在 fp8 权重下每次前向都要反量化整个 `wkv_b`。** `config_671B.json` 里 `dtype` 是 `fp8`，所以 `self.wkv_b.scale` 不为 `None`，这一行每步都在执行：32768 × 512 个元素当场变成 bf16（tp=1 时一块 32 MiB 的临时量），61 层走完就是 1952 MiB / token；tp=16 每卡 2 MiB，合计 122 MiB / token。它不改结果，只改每次前向要搬多少字节——这就是上一篇结尾说的"赔了什么"的第一笔账，也解释了为什么它和 `gemm_impl` 无关（第 4 期确认过，那个开关在 `inference/` 里没有任何地方赋值）。

**第二，{% include src.html path="inference/model.py" lines="482" text="482 行" %} 的 `view` 定义了行布局。** 每头 256 行，前 128 是 K、后 128 是 V。483 行取 `[:, :128]`，495 行取 `[:, -128:]`，两处正好对齐。所以 `wkv_b` 一次矩阵乘法同时生产 K 和 V，它们在同一个矩阵的不同行段里——这也解释了为什么 V 能不单独存：它从来就不是独立的东西。

**第三，484 和 485 两个"之后"不一样。** 484 行写的是 `kv_norm(kv)` 之后的值，485 行写的是 `apply_rotary_emb` 之后的值。前者只归一化，后者已经转过位置。这个差别决定了什么能跨位置复用、什么不能，第 4 节会说。

### 3. 吸收的代数：只用了结合律

把两个分支写成式子，差别立刻现形。记 $c_t \in \mathbb{R}^{512}$ 为归一化后的缓存潜向量，$k^{R}_t \in \mathbb{R}^{64}$ 为缓存的位置键，$W^{UK}_h, W^{UV}_h \in \mathbb{R}^{128 \times 512}$。

$$
s_{h,s,t}=\kappa\left(q^{N\top}_{h,s}W^{UK}_hc_t+q^{R\top}_{h,s}k^{R}_t\right)
=\kappa\left(\tilde q^{\top}_{h,s}c_t+q^{R\top}_{h,s}k^{R}_t\right),
\quad \tilde q_{h,s}=W^{UK\top}_hq^{N}_{h,s}
$$

左边是 `naive`：先把 $W^{UK}_hc_t$ 算成 $k^{N}_{h,t}$，再和 $q^N$ 做点积。右边是 `absorb`：先把 $W^{UK}_h$ 折进 $q^N$ 得到 512 维的 $\tilde q$，再直接和 $c_t$ 做点积。同一个数，括号换了位置。

$\kappa$ 就是 `softmax_scale`。它不是 $192^{-0.5}$：默认配置里 `max_seq_len=16384` 大于 `original_seq_len=4096`，{% include src.html path="inference/model.py" lines="435-437" text="435-437 行" %} 会再乘一次 mscale 的平方（$\mu=0.1\ln 40+1\approx1.369$），第 3 期算过结果是 0.13523 而不是 0.07217。这个常数两个分支共用，与吸收无关，写出来只是为了式子完整。

输出侧同理：

$$
o_{h,s}=W^{UV}_h\sum_t p_{h,s,t}c_t=\sum_t p_{h,s,t}W^{UV}_hc_t
$$

这两个等式里没有一个近似符号。它们只用了两件事：$W$ 与 $t$ 无关，以及 $c \mapsto k$ 是线性的。

但真正让第二个等式成立的**不是线性，是维度的正交**。softmax 的非线性作用在 $t$ 这一维上，$W^{UV}$ 作用在 $c$ 这一维上。$p_{h,s,t}$ 是标量，$\sum_t p_t c_t$ 是在 $t$ 上加权；$W^{UV}$ 则根本不碰 $t$，它的每一列只跟 $c$ 的一个坐标有关。两个算子作用在不同的轴上，所以可以交换顺序。

这句话划出了边界：**只要 V 的通路上出现任何沿着 $t$ 的非线性——对 v 做 norm、做 softmax、按范数选 top-k——交换立刻失效。** 反过来，任何只作用在 $c$ 这一维上的东西都可以随便加，包括一个 512 维的对角缩放（`kv_norm` 的 $\gamma$ 就是这么折进 $W^{UK}$ 和 $W^{UV}$ 的）。

复现里量了误差：fp64 下分数差 5.3e-15、输出差 1.1e-15，是恒等。换成 bf16 逐算子舍入，相对误差到 1.7e-2。所以"吸收是恒等变换"这句话只在实数域成立；浮点域里它改的是结合顺序，结果不再逐位相同。真实 kernel 用 bf16 输入加 fp32 累加，误差比这个模拟小一到两个量级，但"逐位相等"这件事从一开始就不成立——拿两个实现的输出做逐位比较（而不是带容差的 allclose），很容易误判成有 bug。

### 4. RoPE 为什么被赶出 512：64 是这条约束的价格

现在回答 576 里那个 64。为什么不把 RoPE 也加到那 128 维内容部分上，让整个 K 都能折？

假设可以。设 $k_t = R_tW^{UK}c_t$，$R_t$ 是位置 $t$ 的旋转矩阵，那么

$$
q^{\top}k_t=q^{\top}R_tW^{UK}c_t=\left(W^{UK\top}R^{\top}_tq\right)^{\top}c_t
$$

括号里那一项依赖 $t$。要把它算出来，就得为每个位置准备一个不同的 512 维 query；每头算这 $T$ 个 query 的成本是 $T \times 128 \times 512$，**与直接把所有 $k_t$ 算出来的成本一模一样**。折 Q 的收益精确归零。

复现里把这个错误实现跑了一遍：忽略 $R_t$ 硬折，分数最大差 13.00，而分数本身的量级只有 5.00——完全算错。有意思的是逐位置误差：

```text
硬把带 RoPE 的 K 折进 Q：最大差 13.00，分数量级 5.00
  逐位置误差 [0.0, 1.44, 1.1, 4.13, 13.0, 10.45]
```

第一个位置是 0.00。$R_0$ 是单位矩阵，所以 $t=0$ 处两个算法给出同一个数。**一个错误的实现会在序列的第一个位置上通过测试**——如果你只拿长度为 1 的输入做对齐验证，会得出"吸收对带 RoPE 的 K 也成立"的结论，然后在真实推理里全线崩掉。

所以架构把 128 维的 k 切成两段：128 维不带位置，可以折；64 维带位置，必须落盘。64 = 头宽的一半，也就是 32 个复平面、32 个频率——这是 RoPE 表达位置所需的最小维度，不是拍出来的余量。

于是有 {% include src.html path="inference/model.py" lines="486-487" text="486-487 行" %} 那两行相加。它们不是"两个近似项拼起来"，而是同一个点积在维度上的分区：$q^{\top}k = q^{N\top}k^{N} + q^{R\top}k^{R}$，两段互不重叠，所以相加是精确的。

还有两个副作用值得记住。

**其一，归一化发生在写 cache 之前。** {% include src.html path="inference/model.py" lines="484" text="484 行" %} 存进去的是 `kv_norm(kv)`，即模长被 RMSNorm 定死之后的 512 个数。token 的"强度"信息在写 cache 那一刻就已经不在里面了。两个分支都是这样（naive 在 473 行也是先 norm 再展开），所以不是偏差；但这也说明「cache 是压缩后的 KV」这个说法不准确——它是归一化后的原料，压缩发生在更早的 $W^{DKV}$ 上。

**其二，512 与位置无关，64 与位置绑定。** 485 行存的是已经转过位置的 $k^{R}$，它的数值依赖 $t$；484 行存的 $c_t$ 只依赖 token 本身。做 prefix cache 或跨请求复用时，这两半的复用条件不一样：512 那半搬到任何位置都成立，64 那半只能原位复用。

### 5. 三个常见误解

**误解一：576 是"有损压缩的 KV"，所以再压一点还能更省。**

不是。cache 里的 512 是精确的投影输入，写进去什么读出来什么，MLA 的 cache 本身不引入任何近似（bf16 存储除外）。损失发生在 $W^{DKV}$ 的秩上——而且发生在写 cache 之前，是架构层面的信息瓶颈，不是存储层面的量化。这也意味着 576 不能再少一个数：512 是 $W^{UK}$/$W^{UV}$ 的输入维，64 是 RoPE 的维度，两个都有下界。真要再压，只能动 $W^{DKV}$ 的秩，那是换模型，不是换实现。

**误解二：吸收是为了省算力。**

恰恰相反。先看投影部分：naive 走一次 32768 × 512 的矩阵乘法（16.78M 乘加），absorb 走两次 128 × 128 × 512（8.39M + 8.39M）——**是同一个矩阵被切成两半，一半挪到注意力之前、一半挪到之后，合计一分不差**。

变贵的是 $O(T)$ 那两项：qk 的点积从 192 维涨到 576 维，pv 的加权从 128 维涨到 512 维，合计 320 → 1088，3.4 倍。

| 缓存长度 T | naive 乘加 | absorb 乘加 | 倍数 | naive 读 | absorb 读 |
|---|---|---|---|---|---|
| 1024 | 58.7M | 159.4M | 2.71 | 80.0 MB | 1.1 MB |
| 8192 | 352.3M | 1157.6M | 3.29 | 640.0 MB | 9.0 MB |
| 131072 | 5385.5M | 18270.4M | 3.39 | 10240.0 MB | 144.0 MB |

T=8192 时，naive 每读 1 字节做 0.525 次乘加，absorb 做 122.67 次——**234 倍**。这才是吸收的真实形状：它把一次访存密集的计算换成了计算密集的计算。decode 的瓶颈在带宽，所以这笔交易划算；prefill 没有 cache 可读，省不到那 71 倍字节，却要多付 3.4 倍的注意力乘加，所以 prefill 是这笔交易不划算的那一侧。

**误解三：71 倍在每张卡上也是 71 倍。**

这是第 5 期那条教训的续集。`kv_cache` 的声明里没有头维，它不跟着 `world_size` 切，**每张卡都存一份完整的 576**；而 naive 分支的 `k_cache` 带着 `n_local_heads`，是按头切的。于是：

| tp | naive 每卡 | MLA 每卡 | 比值 |
|---|---|---|---|
| 1 | 40960 | 576 | 71.11 |
| 8 | 5120 | 576 | 8.89 |
| 16 | 2560 | 576 | 4.44 |
| 32 | 1280 | 576 | 2.22 |
| 64 | 640 | 576 | 1.11 |
| 128 | 320 | 576 | **0.56** |

交叉点在 `world_size = 71.1`。超过它，naive 的每卡 cache 反而比 MLA 更小。这不是说 MLA 不好，而是说"71 倍"这个数字有适用域：它是全局账，不是每卡账，而且随并行度线性衰减。

### 6. 一条 shape 流水线（mp=16，bsz=1，seqlen=1，start_pos=4096）

取一步 decode，走 `absorb` 分支，`n_local_heads = 128/16 = 8`。

```text
x                        [1, 1, 7168]      attn_norm 之后
wq_a   Linear 7168->1536 [1, 1, 1536]
q_norm                   [1, 1, 1536]
wq_b   Column ->24576    [1, 1, 1536]      每卡 1536 = 8 头 x 192
view                     [1, 1, 8, 192]
split(128, 64)           q_nope [1,1,8,128]   q_pe [1,1,8,64]
apply_rotary_emb(q_pe)   [1, 1, 8, 64]
wkv_a  Linear 7168->576  [1, 1, 576]       不切，每卡一份
split(512, 64)           kv [1,1,512]        k_pe [1,1,64]
k_pe.unsqueeze(2)        [1, 1, 1, 64]      头维是 1，不是 8
apply_rotary_emb         [1, 1, 1, 64]
kv_norm(512)             [1, 1, 512]
kv_cache[:, 4096:4097]   [1, 1, 512]        写入 512 个数
pe_cache[:, 4096:4097]   [1, 1, 64]         写入 64 个数
wkv_b (fp8) 每卡 [2048, 512] -> 反量化 -> view(8, 256, 512)
einsum(bshd,hdc->bshc)   q_nope [1, 1, 8, 512]   <- 吸收发生在这里
einsum(bshc,btc->bsht)   [1, 1, 8, 4097]
einsum(bshr,btr->bsht)   [1, 1, 8, 4097]
相加再乘 softmax_scale  [1, 1, 8, 4097]
softmax(dtype=float32)   [1, 1, 8, 4097]
einsum(bsht,btc->bshc)   [1, 1, 8, 512]
einsum(bshc,hdc->bshd)   [1, 1, 8, 128]
flatten(2)               [1, 1, 1024]
wo     Row 1024->7168    [1, 1, 7168]       + all_reduce
```

三个形状值得停一下。

`k_pe.unsqueeze(2)` 把 [1,1,64] 变成 [1,1,1,64]——**头维是 1**。这就是"128 个头共享同一个位置键"在代码里的形态，也是第 1 节说"rope 那一项不是压缩而是停止复制"的依据。

`wkv_b` 每卡 `[2048, 512]`，`view(8, 256, 512)`。2048 = 32768/16 行，8 头 × 256 行 × 512。所以每个头拿到的是 256 行，前 128 行做 $W^{UK}$、后 128 行做 $W^{UV}$，两处切片都在同一个张量上。

`einsum(bshc,btc->bsht)` 的第二个操作数是 `kv_cache[:bsz, :end_pos]`，形状 `[1, 4097, 512]`——**没有 `h` 维**。这正是 71 倍在代码里的落点：同一个 `c_t` 被 8 个本地头各读一次，但只存了一份。

### 7. 在 CPU 上把 71 倍和恒等式各验一遍

下面这段纯标准库，不需要 numpy、torch 或多卡，做五件事：把 40960 拆成三项、算每卡的比值、算一步 decode 的乘加与字节、用一个缩小版的注意力验证吸收是不是恒等，最后把 RoPE 折进去看它怎么崩。

```python
"""第 6 期复现。纯标准库，CPU 可跑，不需要 GPU / numpy / torch。"""
import math, random, struct

H, DN, DR, DV, DC, L = 128, 128, 64, 128, 512, 61
naive_tok, mla_tok = H * (DN + DR) + H * DV, DC + DR

# ---------- 1. 40960 是怎么变成 576 的 ----------
print("每 token 每层的 cache 元素数")
for name, n, k in [("K 的内容", H * DN, DC), ("K 的位置", H * DR, DR), ("V       ", H * DV, 0)]:
    print(f"  {name} {n:>6} -> {k:>4}")
print(f"  合计 {naive_tok} -> {mla_tok}, 比值 {naive_tok/mla_tok:.2f}")
print(f"  576 元素 = {mla_tok*2} B, x{L} 层 = {mla_tok*2*L} B/token")

# ---------- 2. 每卡 cache：kv_cache 没有头维，不跟着切 ----------
print("\n每卡 cache（tp = world_size）")
for w in (1, 8, 16, 32, 64, 128):
    print(f"  tp={w:>3}  naive {naive_tok/w:>7.1f}  MLA {mla_tok:>4}  {naive_tok/w/mla_tok:>6.2f}x")

# ---------- 3. 一步 decode：算力和字节往反方向走 ----------
print("\n一步 decode（每层，T = 已缓存的长度）")
print(f"{'T':>7}{'naive MAC':>12}{'absorb MAC':>12}{'倍数':>7}{'naive 读':>11}{'absorb 读':>11}")
for T in (1024, 8192, 131072):
    n = 32768 * 512 + H * (DN + DR) * T + H * DV * T
    a = 2 * H * DN * DC + H * (DC + DR) * T + H * DC * T
    print(f"{T:>7}{n/1e6:>10.1f}M{a/1e6:>10.1f}M{a/n:>6.2f}x"
          f"{naive_tok*T*2/2**20:>9.1f}MB{mla_tok*T*2/2**20:>9.1f}MB")
print(f"  每读 1 字节的乘加数（T=8192）: naive "
      f"{(32768*512+H*192*8192+H*128*8192)/(naive_tok*8192*2):.3f}, "
      f"absorb {(2*H*DN*DC+H*576*8192+H*DC*8192)/(mla_tok*8192*2):.2f}")

# ---------- 4. 吸收是不是恒等式 ----------
def bf16(x):
    i = struct.unpack('<I', struct.pack('<f', x))[0]
    return struct.unpack('<f', struct.pack('<I', (i + 0x7FFF + ((i >> 16) & 1)) & 0xFFFF0000))[0]

def dot(a, b, r=None):
    s = 0.0
    for x, y in zip(a, b):
        s = r(s + r(x * y)) if r else s + x * y
    return s

def mv(M, v, r=None):
    return [dot(row, v, r) for row in M]

def softmax(v):
    m = max(v)
    e = [math.exp(x - m) for x in v]
    return [x / sum(e) for x in e]

rng = random.Random(20261103)
h, dn, dr, dv, dc, Tn = 4, 8, 4, 8, 16, 6
W_UK = [[[rng.gauss(0, .3) for _ in range(dc)] for _ in range(dn)] for _ in range(h)]
W_UV = [[[rng.gauss(0, .3) for _ in range(dc)] for _ in range(dv)] for _ in range(h)]
c = [[rng.gauss(0, 1) for _ in range(dc)] for _ in range(Tn)]
pe = [[rng.gauss(0, 1) for _ in range(dr)] for _ in range(Tn)]
qn = [[[rng.gauss(0, 1) for _ in range(dn)] for _ in range(h)]]
qp = [[[rng.gauss(0, 1) for _ in range(dr)] for _ in range(h)]]

def trial(r=None):
    dsc, dout, mag = 0.0, 0.0, 0.0
    for hh in range(h):
        k = [mv(W_UK[hh], c[t], r) for t in range(Tn)]
        v = [mv(W_UV[hh], c[t], r) for t in range(Tn)]
        q = qn[0][hh]
        sc = [dot(q, k[t], r) + dot(qp[0][hh], pe[t], r) for t in range(Tn)]
        p = softmax(sc)
        o1 = [sum(p[t] * v[t][j] for t in range(Tn)) for j in range(dv)]
        qa = [dot(q, [W_UK[hh][d][cc] for d in range(dn)], r) for cc in range(dc)]
        sc2 = [dot(qa, c[t], r) + dot(qp[0][hh], pe[t], r) for t in range(Tn)]
        p2 = softmax(sc2)
        o2 = mv(W_UV[hh], [sum(p2[t] * c[t][cc] for t in range(Tn)) for cc in range(dc)], r)
        dsc = max(dsc, max(abs(x - y) for x, y in zip(sc, sc2)))
        dout = max(dout, max(abs(x - y) for x, y in zip(o1, o2)))
        mag = max(mag, max(abs(x) for x in o1))
    return dsc, dout, mag

a, b, m = trial()
print(f"\n吸收等价性（h=4, dc=16, T=6）")
print(f"  fp64：分数差 {a:.1e}，输出差 {b:.1e}（量级 {m:.3f}）")
a, b, m = trial(bf16)
print(f"  bf16 逐算子舍入：分数差 {a:.1e}，输出差 {b:.1e}，相对 {b/m:.1e}")

# ---------- 5. 反例：RoPE 加在整条 K 上就折不进去了 ----------
def rot(v, t, th=0.35):
    out = list(v)
    for i in range(0, len(v) - 1, 2):
        a = t * th * (i // 2 + 1)
        ca, sa = math.cos(a), math.sin(a)
        out[i], out[i + 1] = v[i] * ca - v[i + 1] * sa, v[i] * sa + v[i + 1] * ca
    return out

q = qn[0][0]
right = [dot(q, rot(mv(W_UK[0], c[t]), t)) for t in range(Tn)]
qa = [dot(q, [W_UK[0][d][cc] for d in range(dn)]) for cc in range(dc)]
wrong = [dot(qa, c[t]) for t in range(Tn)]
d = [abs(x - y) for x, y in zip(right, wrong)]
print(f"\n硬把带 RoPE 的 K 折进 Q：最大差 {max(d):.2f}，分数量级 {sum(abs(x) for x in right)/Tn:.2f}")
print(f"  逐位置误差 {[round(x, 2) for x in d]}")
```

输出（Python 3.13，未安装任何第三方包）：

```text
每 token 每层的 cache 元素数
  K 的内容  16384 ->  512
  K 的位置   8192 ->   64
  V         16384 ->    0
  合计 40960 -> 576, 比值 71.11
  576 元素 = 1152 B, x61 层 = 70272 B/token

每卡 cache（tp = world_size）
  tp=  1  naive 40960.0  MLA  576   71.11x
  tp=  8  naive  5120.0  MLA  576    8.89x
  tp= 16  naive  2560.0  MLA  576    4.44x
  tp= 32  naive  1280.0  MLA  576    2.22x
  tp= 64  naive   640.0  MLA  576    1.11x
  tp=128  naive   320.0  MLA  576    0.56x

一步 decode（每层，T = 已缓存的长度）
      T   naive MAC  absorb MAC     倍数    naive 读   absorb 读
   1024      58.7M     159.4M  2.71x     80.0MB      1.1MB
   8192     352.3M    1157.6M  3.29x    640.0MB      9.0MB
 131072    5385.5M   18270.4M  3.39x  10240.0MB    144.0MB
  每读 1 字节的乘加数（T=8192）: naive 0.525, absorb 122.67

吸收等价性（h=4, dc=16, T=6）
  fp64：分数差 5.3e-15，输出差 1.1e-15（量级 2.496）
  bf16 逐算子舍入：分数差 6.2e-02，输出差 4.3e-02，相对 1.7e-02

硬把带 RoPE 的 K 折进 Q：最大差 13.00，分数量级 5.00
  逐位置误差 [0.0, 1.44, 1.1, 4.13, 13.0, 10.45]
```

四段输出各对应一个结论。

第一段：只有一项是真低秩。另外两项一个被取消、一个被停止复制，把它们算进"压缩比"会让人误以为还能再压。

第二段：71.11 只在 tp=1 成立。tp=16 是 4.44，tp=128 是 0.56——`kv_cache` 缺一个头维，代价就是它不参与张量并行。

第三段：算力和字节朝相反方向走。乘加涨 3.3 倍，字节降 71 倍，最后每字节承载的计算量涨了 234 倍。这是 decode 的胜负手，也是 prefill 的负担。

第四段：吸收在 fp64 下是恒等式（1e-15 是浮点噪声），在 bf16 下不是逐位相等；而把 RoPE 硬折进去会在第一个位置蒙对、在第四个位置错到 13（分数本身才 5）。

### 8. 什么时候不能吸收

恒等式的成立条件只有两条，但每一条都会在某些设计上失效。

**条件一：$W^{UK}$ 与位置无关。** 任何要加在 K 上、且依赖 $t$ 的线性算子，都不能折进 $W^{UK}$。RoPE 是唯一被允许留在 K 上的位置算子，代价就是它必须被隔离到 64 维、单独落盘。如果换成 ALiBi 那种加性的位置偏置，倒是可以留在 scores 上（它作用在 $t$ 这一维，和 softmax 同侧），这也是为什么加性位置编码对 MLA 更友好。

**条件二：$c \mapsto k$ 与 $c \mapsto v$ 都是线性的，且非线性只出现在 $t$ 维。** `kv_norm` 之所以不破坏吸收，是因为它作用在 $c$ 上、且在分叉之前——两个分支都先归一化再分走，所以它压根不需要"折"。反过来说，如果哪天想给 K 和 V 各加一个逐头的 RMSNorm（QK-norm 的常见做法），那就必须先把 $c$ 展开成 128 头的 K 和 V，吸收当场失效。

**第三条是工程性的，不是数学性的：需要读出显式 K 的算子用不了吸收。** 比如按 K 的范数做稀疏选择（先算每块 K 的范数再挑 top-k）、按头给 KV 做不同 scale 的量化、或者做注意力权重的可视化——这些都要 materialize K。第二季讲 V4.1 的稀疏注意力时会撞上这个问题，到时候再看它怎么绕。

代码里 `naive` 分支被完整保留，本身就是"什么时候不能吸收"的答案：它是那个可以随时退回去的参照实现。`attn_impl` 在 {% include src.html path="inference/model.py" lines="17" text="第 17 行" %} 默认写成 `"absorb"`，改一个字符就能切换——这也是验证两条路是否等价的最快方式。

### 9. 下期预告

第 5、6 两期算的是同一件事：一个 token 怎么被压成 512 个数。下一期换个方向——一个 token 该被送到哪里。61 层里有 58 层是 MoE，每层 256 个专家选 8 个，而代码里没有 aux loss，只有三行 bias 在悄悄改分数。

一句话钩子：**这套路由不靠惩罚来实现均衡，它靠的是一个只进不退的计数器——分数被改了，梯度却不知道。而那个 `original_scores` 与原地 `masked_fill_` 共享存储的别名问题，会让第一次读的人以为代码写错了。**

---

## 小结

- 576 里没有 K 也没有 V，只有"原料"：512 维归一化后的内容潜向量 + 64 维转过位置的位置键。K 和 V 都是读的时候现算的。
- 71.11 这个数字拆开是三件事：V 不存（41%）、rope 不复制（20%）、nope 低秩（39%）。**只有第三项跟"压缩"有关。**
- 吸收的代数只是一次结合律：$q^{\top}(Wc)=(W^{\top}q)^{\top}c$ 与 $W\sum_t p_tc_t=\sum_t p_tWc_t$。成立的关键不是线性，是 softmax 作用在 $t$ 维、$W$ 作用在 $c$ 维，两个轴正交。
- 代价是 K 永远不能被"事后加工"。凡是想加在 K 上的东西都得折进 $W^{UK}$，折不进去就只能另开一路——那 64 维 RoPE 就是被这条约束逼出来的，而 64 = 头宽的一半，是表达位置的最小维度。
- 吸收不改总投影乘加（同一个矩阵切成两半），改的是 $O(T)$ 项的系数：320 → 1088。字节降 71 倍，乘加涨 3.4 倍，每字节承载的计算量涨 234 倍。**decode 里划算，prefill 里不划算。**
- 71 倍是全局账。tp=16 时每卡只有 4.44 倍，交叉点在 71.1，超过它 naive 的每卡 cache 反而更小——因为 `kv_cache` 没有头维，不参与张量并行。
- 最容易踩的坑是把"吸收"当成近似，或者把 RoPE 一起折进去。后者的错误实现会在 $t=0$ 处通过测试，然后从第二个位置开始全错。

> 下一篇：《MoE 上：256 选 8，怎么不旱涝不均》，从 `Gate` 的 sigmoid 打分和三行 bias 修正继续往下走。
