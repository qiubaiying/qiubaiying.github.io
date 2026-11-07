---
layout:     post
title:      DeepSeek-V4.1 源码精读（10）：稀疏注意力先选块，再选 token
subtitle:   index_topk 选的是压缩后的 token，candidate_topk_blocks 选的是块；一层付全宽的账，其余层只付六十四分之一
date:       2026-11-07
author:     WY
header-img: img/post-bg-os-metro.jpg
catalog:    true
description: 拆开 index_attn.py 的 575 行：索引器本身是一次 32 头 MQA，Q/K 压到 FP4，分数是 relu 加权和而不是 softmax；top-k 分块级与 token 级两层，块选择跨层共享。附纯 Python 复现，量出召回、logits 宽度与 36 倍加速上限。
math:       true
series:     deepseek-source
chapter:    10
source:     deepseek-ai/DeepInfer@553741557a57
tags:
    - 人工智能
    - 深度学习
    - 大语言模型
    - 神经网络
---

## 开篇：只算 top-k，那 top-k 是谁算的

第 9 期在结尾留了一句话：24 个文件里最值得先钻的是 `index_attn.py`，575 行，牵着压缩、候选块、共享 K 三条线。这一期只走其中最硬的一段：**选择**。

“稀疏注意力”这个名字很容易让人以为它做的是减法——不算全部，只算一部分。但任何“只算一部分”都要先回答一个前置问题：凭什么知道哪一部分值得算？在 V4.1 里，这个“凭什么”是一套独立的打分器。它自己要跑一次注意力，自己要有 Q、有 K、有每头的权重、有单独的 KV cache。省下来的算力是先花出去一笔才换来的。

所以这一期只解决一个问题：

> **在 65,536 个压缩键里，那 2,048 个下标是怎么被挑出来的，挑这件事本身又要花多少钱？**

先给三个结论，后文逐条验证：

1. 索引器不是“一个打分函数”，而是一次 **MQA**：32 个 query 头共享 1 个 key 头，头宽 128，Q 和 K 都压到 FP4。分数是 $\sum_h w_h \cdot \mathrm{relu}(q_h\cdot k)$，**没有 softmax**。
2. top-k 是**两层**：先按块选（`candidate_topk_blocks`），再在候选块里按 token 选（`index_topk`）。块选择跨层共享，token 选择每层各做。
3. 省下的不是“把 $O(L^2)$ 变成 $O(LK)$”这么一句话。每一组层里至少有一层要扫完全部压缩键，这笔固定成本决定了加速**有上限**，而上限只跟几个维度比有关，跟上下文多长几乎无关。

## 一、shape 流水线：从 1536 维到 2,048 个下标

先把符号定下来，免得后面每个形状都要解释一遍：

- `B`：本次前向打包后的 **query 总数**（prefill 时是所有 prompt token，不是 batch size）。
- `L`：原始键长；`L_c = L / r`，压缩后的键长，`r = kv_compress_ratio ∈ {1, 2}`。
- `n_i = 32`、`d_i = 128`：索引器的头数与头宽。代码只保证 `n_head <= 32` 且 `head_dim == 128`（{% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="103-104" %}），取 32 是因为下面 32 这个数反复出现在对齐与权重投影里。
- `K = index_topk`：最终保留的**压缩后 token** 数。
- `C = candidate_topk_blocks`、`b ∈ {8, 16}`：候选块数与每块 token 数。

| 步 | 张量 | 形状 | 代码位置 |
|---|---|---|---|
| 1 | `q_a` 归一化后 | `[B, q_lora_rank]`（V3 是 1536） | {% include src.html path="deepinfer/model_executor/models/v4_modules/attn.py" lines="457" %} |
| 2 | `q_b_proj` 输出（主 Q 与索引 Q 拼在一起） | `[B, n_h·d_qk + 32·128]` | {% include src.html path="deepinfer/model_executor/models/v4_modules/attn.py" lines="298-307" %} |
| 3 | `index_q_b` 切出来 | `[B, 4096]` | {% include src.html path="deepinfer/model_executor/models/v4_modules/attn.py" lines="459-461" %} |
| 4 | unflatten 成头 | `[B, 32, 128]` | {% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="166" %} |
| 5 | RoPE + Hadamard + FP4 | 同形状，4 bit | {% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="167-177" %} |
| 6 | `pre_rope_kv`（压缩后、norm 后、rope 前） | `[B, 576]` | {% include src.html path="deepinfer/model_executor/models/v4_modules/compress.py" lines="145" %} |
| 7 | `k_proj` 投成索引 K | `[B, 128]` | {% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="144" %} |
| 8 | `p_sum`：每 query 对每键一个分数 | `[B, L_c]` 或 `[B, C·b]` | {% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="299-317" %} |
| 9 | 块分 → 块 topk | `[B, ⌈L_c/b⌉]` → `[B, C]` | {% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="215-226" %} |
| 10 | token topk（紧凑下标） | `[B, K]` int32 | {% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="346-372" %} |
| 11 | 还原成序列下标 / cache 槽位 | `[B, K]` int32 | {% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="373-374" %} |
| 12 | 主注意力 | `q [B, n_h, d_qk]` × `k [B, K + 滑窗, 576]` | {% include src.html path="deepinfer/model_executor/models/v4_modules/attn.py" lines="617" %} |

这张表里有三处值得停一下。

**第 2 步：索引 Q 不是从 hidden 投出来的。** 它和主 Q 共用同一条低秩通路 `hidden → q_a → 1536 → q_b_proj`，只是在 `q_b_proj` 的输出维上多接了一段 4096 维，然后 `split` 切开。也就是说，索引器没有自己的 Q 输入层，它搭的是 MLA 的便车。如果独立建，这一步要一次 `[B, h] × [h, 4096]`（V3 的 `h` 是 7168）；搭便车之后只剩 `[B, 1536] × [1536, 4096]`，输入维小了 4.7 倍。代价是索引头的维度和主注意力绑在同一个 `q_lora_rank` 上，想单独放大索引器，得先动 MLA 的秩。

**第 6 步：索引 K 的输入是压缩后的 576 维 latent，不是原始 hidden。** `Wkv` 先产出 `[B, 576]`（512 的 latent + 64 的 rope），主 KV cache 存的是它，`k_proj` 再把同一个 latent 投成 128 维的索引 K。这一条决定了索引器的粒度：它看到的不是 131,072 个原始 token，而是 65,536 个压缩 token。`max_kv_len` 就是这么算出来的（{% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="95" %}）。

**第 8 步：`p_sum` 有两种宽度。** 这是整篇文章的支点。走“全量”那条路时它是 `[B, 65536]`；走“候选”那条路时它只有 `[B, 1024]`。同一份代码、同一个 kernel，宽度差 64 倍，取决于这一层是候选源还是候选消费者。

## 二、37 行代码：块怎么选，token 怎么选

块选择只有 23 行，函数叫 `_topk_candidate_block`：

```python
# deepinfer/model_executor/models/v4_modules/index_attn.py:204-226
    def _topk_candidate_block(
        self,
        p_sum: torch.Tensor,
        k_len: torch.Tensor,  # the valid range of each row, to avoid being polluted by dirty data
        offset: int,
        cross_layer_runtime: CrossLayerRuntime,
    ) -> None:
        topk_blocks = self.candidate_topk_cfg.topk_block
        block_size = self.candidate_topk_cfg.block_size
        assert 0 < topk_blocks <= (p_sum.shape[1] + block_size - 1) // block_size
        output = cross_layer_runtime.block_candidate_idxs[offset : offset + p_sum.size(0)]
        block_scores, valid_blocks = candidate_block_max(p_sum, k_len, block_size)
        topk(
            block_scores,
            topk_blocks,
            sorted=False,
            end=valid_blocks,
            indices_type=torch.int32,
            sorted_index=True,
            output_idx=output,
            idx_oob_fill_value=-1,
            return_value=False,
        )
```

三个细节。

**一是 `output` 是切片，不是新张量。** `block_candidate_idxs` 在 `forward` 里一次性分配好（`[B, C]`，填 −1），这里按 chunk 往里写。所以块选择没有返回值，它写的是 `cross_layer_runtime` 上的共享 buffer——后面的消费层读的就是这块内存。

**二是 `candidate_block_max` 的分数是块内 max，而且最后一个有效块被强制置成 `+inf`。** 它的参考实现 `candidate_block_max_ref` 只有 24 行，最后三行是关键：

```python
# deepinfer/model_executor/layers/tilelang_ops/candidate_blocks.py:69-72
    last_blocks = (valid_blocks - 1).clamp_min(0).unsqueeze(1).to(torch.int64)
    last_scores = block_scores.gather(1, last_blocks)
    last_scores = torch.where(valid_blocks.unsqueeze(1) > 0, torch.full_like(last_scores, torch.inf), last_scores)
    block_scores.scatter_(1, last_blocks, last_scores)
```

这不是调参，是正确性。最后一个压缩块里装着当前 query 自己（以及最近几个位置），如果它因为分数低被挤出候选集，这个 query 就看不见自己了。用 `+inf` 保证它一定入选，比在 kernel 外面写一句「记得把自己加回去」可靠得多——因为它是在同一张分数表上做的，不会破坏排序，也不需要额外的分支。

**三是 `end=valid_blocks` 必须传。** `topk` 的输入 `block_scores` 是按 `L_c` 分配的，超出 `valid_blocks` 的列是脏数据；不传 `end`，脏列里的 `inf` 或大数会挤掉真正的块。decode 那边有一句注释把这层意思说得更直白：`We must pass end to the topk kernel since OOB p_sum is not cleaned.`（{% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="498" text="第 498 行" %}）

token 级的选择是另外 14 行，夹在 prefill 的 chunk 循环里：

```python
# deepinfer/model_executor/models/v4_modules/index_attn.py:359-372
                if self.is_candidate_topk_source:
                    self._topk_candidate_block(p_sum, klen[chunk], start_q, cross_layer_runtime)
                topk(
                    p_sum,
                    self.topk_tokens,
                    sorted=False,
                    end=topk_lens[chunk],
                    indices_type=torch.int32,
                    sorted_index=True,
                    output_idx=topk_index[chunk],
                    output_idx_offset=ks[chunk] if candidate_blocks is None else None,
                    idx_oob_fill_value=-1,
                    return_value=False,
                )
```

这里的 `output_idx_offset` 是全文最容易看错的一行。全量路径下，`p_sum` 的列号就是序列内的绝对位置，所以直接把 `ks[chunk]`（这条序列在拼接后的大张量里的起点）加进 kernel；候选路径下不能加，因为此刻的下标还是「候选区间里的紧凑下标」，得等 `restore_candidate_indices_inplace` 把它映射回块号 × 块大小 + 块内偏移，再加 `ks`。同一笔偏移，两条路径加在了两个地方，**加起来且只加一次**，这是这段代码的正确性不变量。

还原本身只有四行，是「紧凑下标」这个词的全部含义：

```python
# deepinfer/model_executor/layers/tilelang_ops/candidate_blocks.py:165-168
    candidate_slots = torch.div(safe_indices, block_size, rounding_mode="floor")
    block_offsets = safe_indices.remainder(block_size)
    block_ids = candidate_blocks.gather(1, candidate_slots.to(torch.int64))
    restored = block_ids * block_size + block_offsets
```

紧凑下标是「第几个候选块 + 块内偏移」，不是真实位置。先在候选表里查到真实块号，再乘回块大小加偏移，就回到了序列坐标；`candidate_blocks` 里值为 −1 的无效块，最后会被一句 `torch.where` 统一打成 `-1`。这套设计的收益是 token 级 topk 只需要认识 `[0, C·b)` 这个小区间，不需要知道块是怎么挑出来的——两层因此可以独立实现、独立测试。

顺带一句：这里的 `topk` 不是 `torch.topk`，是从 `deep_select.interface` 引入的定制 kernel（{% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="12" %}）。它多出来的三个参数正好对应三个需求：写进已有 buffer（`output_idx`）、每行给不同的有效长度（`end`）、选不满的位置填 −1（`idx_oob_fill_value`）。`torch.topk` 一个都不支持。

## 三、两层筛选省下的到底是什么

先看宽度。以 `B = 8192`、`L = 131,072`、`r = 2`、`C = 64`、`b = 16` 为例：

| 路径 | `p_sum` 列数 | 每行字节 | 8192 行合计 |
|---|---|---|---|
| 全量 | 65,536 | 128 KiB | 1024 MiB |
| 候选 | 1,024 | 2 KiB | 16 MiB |

窄 64 倍。这个 64 不是巧合，是 `L_c / (C·b) = 65536 / 1024`。改 `C` 就是改这个倍数。`C = 64` 时一次前向的 logits 从 1 GiB 掉到 16 MiB——省的是读写这些字节的带宽，不是省显存容量，因为这块 buffer 是逐 chunk 复用、不是逐层常驻的。

但这里有个容易漏掉的分工：**不是所有层都付窄的账。**

| 层角色 | `use_candidate_topk` | `p_sum` 宽度 | 它做什么 |
|---|---|---|---|
| 候选源层 | `False` | 65,536 | 算全量 logits，选 C 个块，再选 K 个 token |
| 消费层 | `True` | 1,024 | 只算候选块内的 logits，自己选 K 个 token |

这张表解释了两件事。第一，为什么要分两层：块级选择是**跨层共享**的，一个源层算一次，同一组里的其他层直接读 `cross_layer_runtime.block_candidate_idxs`；token 级选择是**每层各做**的，因为每层的注意力头关注的东西不一样。第二，为什么 `candidate_topk_blocks` 和 `index_topk` 是两个独立参数：前者决定“哪些块值得细看”，后者决定“细看时留几个”。

于是“省了什么”的答案要分三层说：

1. **主注意力**：从每 query 对 `L_c` 个键，降到对 `K` 个键（滑窗那一路另算，第四节讲）。
2. **logits 带宽**：同一层走全量要 1 GiB，走候选只要 16 MiB；源层不省，消费层省。
3. **top-k 的规模**：从 `L_c` 列降到 `C·b` 列，比较次数同步下降。

代价是召回。候选层不是无损压缩，它赌的是「相关性成块出现」。这一点第五节的复现会量出来：分数成簇时召回 1.000，分数均匀随机时只有 0.445。

## 四、五个常见误解

**误解一：`index_topk` 选的是原始 token。** 它选的是压缩后的 token。`r = 2` 时，2,048 个压缩 token 覆盖 4,096 个原始位置。代码里 `topk_tokens = cfg.index_topk`（{% include src.html path="deepinfer/model_executor/models/v4_modules/mla_attn.py" lines="111" %}），而 `p_sum` 的列是压缩键，两者口径一致。这也是为什么 `max_kv_len = runtime_max_model_len // kv_compress_ratio`——长度单位从头到尾都是压缩后的。

**误解二：`index_topk` 就是 logits 的宽度。** 源码里专门写了一行注释否掉它：`topk_tokens is the count after filtering, not the logits width`（{% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="112" text="第 112 行" %}）。宽度是 `L_c`（全量）或 `C·b`（候选），`K` 只是筛完留下几个。把这两个数混在一起，就会得出「候选宽度必须等于 K」这种不存在的约束——实际上代码里**没有**任何断言保证 `C·b ≥ K`。配置写反了不会报错，只会静默少选，剩下的位置由 `-1` 填满。

**误解三：索引器是 softmax 注意力，分数要归一化。** 它是 $\sum_h w_h \cdot \mathrm{relu}(q_h \cdot k)$，ReLU 之后按学出来的每头权重求和，没有分母。`MQA.__init__` 里倒是老老实实算了 `self.softmax_scale = self.head_dim ** -0.5`（{% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="79" %}），但这个文件里没有任何一处读它。不是漏了，是**不需要**：整个索引器的输出只喂给 `topk(..., return_value=False)`，值被丢掉，只留下序。任何正的全局缩放都不改变序，缩放因子可以整个折进 `w_h`。理解这一点，后面 FP4 压 Q/K 也就不用再问「4 bit 怎么够算注意力」——它不做注意力，它只做排序。

**误解四：`sparse_stage` 是稀疏强度的旋钮。** 它只有两个合法值，`0` 和 `2`（{% include src.html path="deepinfer/model_executor/models/v4_modules/mla_attn.py" lines="250" %}），而 `MQAIndexer` 里还有一句更硬的断言 `assert self.sparse_stage == 2`（{% include src.html path="deepinfer/model_executor/models/v4_modules/mla_attn.py" lines="122" %}）。`mla_attn.py` 里这个词一共出现 5 次：2 次赋值、2 次断言、1 次分支判断，**没有任何一处判断它等于 1**。换句话说，`1` 不是「还没实现」，是被断言挡在门外的一个不存在的中间态。真正决定这一层走不走稀疏的是 `index_topk` 有没有值：`attn.py` 里 `self.is_sparse = bool(self.layer_cfg.get("index_topk"))`（{% include src.html path="deepinfer/model_executor/models/v4_modules/attn.py" lines="85" %}）。而 `is_sparse` 为真时紧接着强制要求 `use_swa`（{% include src.html path="deepinfer/model_executor/models/v4_modules/attn.py" lines="95-96" %}）——所以这里的「稀疏」从来不是「只留 top-k」，是**滑窗 + top-k 压缩块**两路拼起来。滑窗那一路负责最近的、精确的局部；top-k 那一路负责远处的、压缩后的全局。

**误解五：`topk` 返回的是 KV cache 里的物理槽位。** 只有 decode 是。prefill 返回的是 `gather_kv` 拼接后的全局序列下标（`ks` 偏移已经加过），docstring 写得很清楚（{% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="541-544" %}）。decode 才多一步 `convert_kv_index`，用 `block_tables` 把逻辑位置换成物理槽位，`-1` 原样保留（{% include src.html path="deepinfer/model_executor/models/v4_modules/index_attn.py" lines="506-513" %}）。这两个东西混用，表现是「偶尔读到别人的 KV」——不报错，只是答案慢慢变得不对劲。

还有半个误解值得单独提：**`p_sum` 没清零不是 bug。** 越界列里是脏数据，所以每个 `topk` 调用都必须带 `end`；这是拿一次 memset 换来的性能，代价是调用方要自己守规矩。守不住的地方，脏列里的 `inf` 会稳定地排在真 token 前面。

## 五、复现：三个数字，一段纯 Python

这段脚本不需要 numpy、torch 或 GPU，只要有 Python 3。它做三件事：按 `candidate_block_max` 的参考语义实现块打分（含最后一块的 `+inf`），复现「块 → token」两层筛选并在两种分数分布下量召回，最后把成本模型算成一张表。

成本模型里的 `n_h = 128`、`d_attn = 576` 用的是 V3 的公开配置——V4.1 的 hidden 与头数在 HF 的 `config.json` 里，仓库代码里读不到；`n_i = 32`、`d_i = 128`、`r = 2` 则来自本期代码的断言。换成别的值，下面的结论按公式重算即可，公式本身不依赖这几个数。

```python
# index_select_demo.py：纯 Python，无第三方依赖
import math
import random


def block_scores(scores, valid, b):
    """candidate_block_max 的参考语义：块内取 max，最后一个有效块强制 +inf"""
    nb = (valid + b - 1) // b
    out = [max(scores[i * b:(i + 1) * b]) for i in range(nb)]
    out[-1] = math.inf
    return out


def topk(xs, k, end=None):
    end = len(xs) if end is None else end
    return sorted(range(end), key=lambda i: (-xs[i], i))[:k]


def two_level(scores, b, c, k):
    blocks = topk(block_scores(scores, len(scores), b), c)      # 第一层：块
    cand = [i * b + j for i in blocks for j in range(b) if i * b + j < len(scores)]
    picked = topk([scores[i] for i in cand], k)                 # 第二层：紧凑空间里的 token
    return {cand[i] for i in picked}, blocks


def report(name, scores, b, c, k):
    dense = set(topk(scores, k))
    got, blocks = two_level(scores, b, c, k)
    need = len({i // b for i in dense})
    print(f"{name:10s} dense top-{k} 落在 {need:3d} 个块里；候选 {c} 块 -> 召回 {len(dense & got)/k:.3f}；"
          f"最后一块入选 {'是' if (len(scores) - 1) // b in blocks else '否'}")


def clustered(n, anchors, sigma, amp, noise=0.02):
    random.seed(7)
    return [max(amp * math.exp(-((i - a) ** 2) / (2 * sigma ** 2)) for a in anchors)
            + noise * random.random() for i in range(n)]


B, L_c, BLK, C, K = 8192, 65536, 16, 64, 256
print(f"配置：batch={B} 压缩键长={L_c} 块={BLK} 候选块={C} topk={K}\n")

random.seed(0)
report("均匀随机", [random.random() for _ in range(4096)], 16, 64, 256)
report("成簇相关", clustered(4096, [200, 900, 1700, 2600, 3300, 3900], 30, 1.0), 16, 64, 256)

flat = [0.0] * 4096
print(f"\n平坦分数：不加 +inf 时最后一块(255) 入选？"
      f"{255 in topk([max(flat[i*16:(i+1)*16]) for i in range(256)], C)}")
print(f"          加 +inf 后，最后一块入选？{255 in topk(block_scores(flat, 4096, 16), C)}")

dense_b, cand_b = B * L_c * 2, B * (C * BLK) * 2
print(f"\nlogits 宽度：dense {L_c} 列 = {dense_b/2**20:.0f} MiB；"
      f"候选 {C*BLK} 列 = {cand_b/2**20:.0f} MiB；窄 {dense_b/cand_b:.0f} 倍")

n_h, d_attn, ratio, n_i, d_i = 128, 576, 2, 32, 128
print(f"\n每 query 每层乘加（n_h={n_h} d={d_attn} ratio={ratio} n_i={n_i} d_i={d_i}）")
print(f"{'L':>7} {'topk':>6} {'indexer':>11} {'attn':>11} {'合计':>11} {'vs dense':>9}")
for L, k in [(8192, 2048), (32768, 2048), (131072, 2048), (131072, 512), (131072, 3641)]:
    idx, att = n_i * d_i * (L // ratio), n_h * d_attn * k
    den = n_h * d_attn * L
    print(f"{L:7d} {k:6d} {idx/1e6:10.1f}M {att/1e6:10.1f}M {(idx+att)/1e6:10.1f}M {den/(idx+att):8.1f}x")
print(f"\n加速上限 = dense / indexer = {n_h*d_attn*ratio/(n_i*d_i):.1f}x（与 L 无关）")
print(f"盈亏线：K < {1-1/(n_h*d_attn*ratio/(n_i*d_i)):.3f} L")
print(f"索引 K 每压缩 token：{d_i} 个 FP4 = {d_i//2} B；主 KV 576 B -> +{100*d_i/2/576:.1f}%")
```

实际输出：

```text
配置：batch=8192 压缩键长=65536 块=16 候选块=64 topk=256

均匀随机       dense top-256 落在 165 个块里；候选 64 块 -> 召回 0.445；最后一块入选 是
成簇相关       dense top-256 落在  22 个块里；候选 64 块 -> 召回 1.000；最后一块入选 是

平坦分数：不加 +inf 时最后一块(255) 入选？False
          加 +inf 后，最后一块入选？True

logits 宽度：dense 65536 列 = 1024 MiB；候选 1024 列 = 16 MiB；窄 64 倍

每 query 每层乘加（n_h=128 d=576 ratio=2 n_i=32 d_i=128）
      L   topk     indexer        attn          合计  vs dense
   8192   2048       16.8M      151.0M      167.8M      3.6x
  32768   2048       67.1M      151.0M      218.1M     11.1x
 131072   2048      268.4M      151.0M      419.4M     23.0x
 131072    512      268.4M       37.7M      306.2M     31.6x
 131072   3641      268.4M      268.4M      536.9M     18.0x

加速上限 = dense / indexer = 36.0x（与 L 无关）
盈亏线：K < 0.972 L
索引 K 每压缩 token：128 个 FP4 = 64 B；主 KV 576 B -> +11.1%
```

三段读数。

**第一段：候选块不是无损的，它赌相关性成块。** 分数均匀随机时，dense top-256 散落在 165 个块里，64 个候选块最多覆盖一部分，召回 0.445。分数成簇时，top-256 只落在 22 个块里，64 个块装得下，召回 1.000。真实注意力分数的分布介于两者之间——这解释了为什么 `C` 不能拍脑袋往小里取，也解释了为什么块分要用 `max` 而不是平均：一个块里只要有一个真正相关的 token，这个块就该被捞起来；用平均分，15 个垃圾 token 会把 1 个热点稀释掉。

**第二段：宽度的账是 64 倍，但不是每层都付。** 1,024 MiB 对 16 MiB，看起来像免费的午餐，实际是源层付全款、消费层付零头。如果一组 4 层（1 个源 + 3 个消费），平均每层 268 MiB，整体省 3.8 倍而不是 64 倍。这个「平均」才是端到端能拿到的数字。

**第三段：加速有上限，而且上限跟上下文长度无关。** 索引器每 query 要扫完 `L_c` 个键，成本是 `n_i · d_i · L_c`；主注意力每 query 只扫 `K` 个键，成本是 `n_h · d_attn · K`；dense 是 `n_h · d_attn · L`。三者都是 `L` 的一次函数，所以上限

$$
S_{\max} = \frac{n_h \, d_{\text{attn}} \, r}{n_i \, d_i} = \frac{128 \times 576 \times 2}{32 \times 128} = 36
$$

是一个纯维度比，`L` 被约掉了。这组参数下，`topk = 2048` 在 128K 上下文能拿到 23.0 倍，已经是上限的 64%；把 `topk` 砍到 512，也只从 23.0 抬到 31.6，仍没摸到 36——**再往下砍，省的是本来就不多的那部分**。反过来，8K 上下文只有 3.6 倍：`topk = 2048` 相当于全长的四分之一，稀疏几乎没稀。盈亏线是 $K < 0.972L$，`K` 逼近 `L` 时稀疏就是负收益。同一套代码，短上下文开稀疏是纯亏——这条比任何“稀疏注意力更快”的说法都有用。

顺带把 `r` 的影响也算清楚：`r = 1`（C1，不压 token）时上限是 18 倍，直接减半。压缩比对上限是乘性的，不是加性的。

最后一行是缓存开销。索引 K 每压缩 token 存 128 个 FP4，净占 64 字节（块缩放另算，量级在几个字节），相对 576 字节的主 KV 是 +11.1%；折到原始 token（`r = 2`）是 +5.6%。这是稀疏注意力在显存上真正付出的代价——比想象中小，因为它压到了 4 bit，而且只存一份 K，没有 V。

## 六、小结：索引器把成本挪到了哪里

- **索引器是一次 MQA，不是打分函数。** 32 个 query 头、1 个 key 头、头宽 128，K 从压缩后的 576 维 latent 投出来，Q 搭 MLA 低秩通路的便车。分数是 `relu(q·k)` 的按头加权和，没有 softmax，因为下游只要序。
- **top-k 是两层。** 块级用 `candidate_topk_blocks`，块分取块内 max，最后一个有效块强制 `+inf`（正确性，不是调参）；token 级用 `index_topk`，在紧凑下标空间里选，再 `restore` 回块号 × 块大小 + 偏移。
- **一层付全宽，其余层付 1/64。** 源层扫完 `L_c`，消费层只看 `C·b`。跨层共享的是块，不共享的是 token。
- **加速上限是维度比，不是长度比。** 这组参数下 36 倍；`topk` 越接近序列长度，收益越接近 0，盈亏线在 `0.972L`。
- **候选层赌相关性成块。** 成簇 1.000、均匀 0.445；`C` 取小了不是“稍微差一点”，是断崖。
- **索引缓存 +11.1%（压缩 token）或 +5.6%（原始 token）**，因为它只要 4 bit、只存 K。

第 9 期说 `index_attn.py` 牵着三条线，这一期只走完了「选择」这一条。剩下两条里更硬的那条是：这套索引器不是每层都建，`k_proj` 和 `kv_cache` 在跨层拓扑里被复用——`builder.py` 里那句 `index_attn.k_proj = src.k_proj` 换的是引用，不是权重。但复用的边界在哪、什么条件下不能复用，得先看懂 `cross_layer.py` 的层映射，那是第 12 期 YOCO 的前置。

> 下一篇：《Engram：一个新的记忆结构》。它不改善注意力，也不改善 MoE，它给模型加了一张按 n-gram 哈希查的表——一个 220 行的文件，回答的是「Transformer 记不住的东西，能不能不靠参数记」。
