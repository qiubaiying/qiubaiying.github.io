---
layout:     post
title:      Attention中的Mask
subtitle:   query mask, key mask, future mask
date:       2019-07-27
author:     ZhangWenXiang
header-img: img/bg-ai-dark1.jpeg
catalog: true
tags:
    - 机器学习
    - Attention
    - mask
    - query mask
    - key mask
    - future mask
---

# Attention简介

Attention是2015年被提出来的，在NLP领域大放光彩。Attention具有在繁多信息中自动focus到重点的能力，而且Attention可以实现并行，一定程度上可以替代LSTM等循环神经网络，提高模型效率。Attention的具体介绍可以参考[Attention总结](https://blog.csdn.net/weixin_40901056/article/details/88357187)。

根据上面的[Attention总结](https://blog.csdn.net/weixin_40901056/article/details/88357187)，Attention可以看作是 QKV 模型，假设输入为 q，（k，v）表示上下文信息。例如在 Q&A 任务中：k 是 question，v 是 answer，q 是新来的 question，看看历史 中 q 和哪个 k 更相似，根据相似 k 对应的 v，合成当前 question 的 answer。

Attention可以分为三个主要步骤：
- score function：度量环境向量与当前输入向量的相似性；找到当前环境下，应该 focus 哪些输入信息。如果按照QKV的模式来看的score的计算分方式有很多种，一般根据Q和K计算获得，具体如下：

<p align="center">
 <img src="https://github.com/Demmon-tju/Demmon-tju.github.io/blob/master/img/attention_mask_score_func_20190727.png?raw=ture" alt="attention_mask_score_func_20190727"  width="550" height="350">
</p>

- alignment function ：计算 attention weight，通常都使用 softmax 函数，对上一步的score进行归一化
- context vector function ：根据 attention weight，得到输出向量，一般直接加权就可以

# Mask操作

>关于Attention的介绍很多，但是关于其中的Mask操作一直搞不清，这里整理一下Mask的思路和tensorflow代码。

Mask大致分为两种
- Padding Mask：在NLP任务中，由于句子长度不一致，经常会进行padding操作，在sequence中加入零向量。这部分padding不应该起作用，但是在Attention的计算中用到了softmax等操作，即便0向量也会参与计算(e^0=1)，因此需要手动将这部分信息mask才行。padding mask主要包含两种：
- - key mask：在计算score之后，且softmax之前进行，将值设为很小的数字(如-e^12)，这样经过的softmax之后值几乎为0
- - query mask：在softmax之后进行，因此对应元素设置为0即可。
- Future(blinding) Mask：例如在翻译的任务中(“我喜欢机器学习”)，在翻译喜欢的时候，我们只知道“我喜欢”，而后面的“机器学习”并不知道，也就是不能提前利用Future的信息，因此需要将Future的信息Mask掉。Future Mask主要用在Decoder中，只有Decoder中才会有future 信息。Future Mask的实现也比较简单，首先建立一个对应的下三角形矩阵，之后根据这个矩阵过滤即可，因为下三角对应的之前的信息。

下面参考[大神的代码](https://github.com/Kyubyong/transformer/blob/master/modules.py)，来看Attention的三种Mask是怎样实现的：

```python

def mask(inputs, queries=None, keys=None, type=None):
    """Masks paddings on keys or queries to inputs
    inputs: 3d tensor. (N, T_q, T_k)
    queries: 3d tensor. (N, T_q, d)
    keys: 3d tensor. (N, T_k, d)
    e.g.,
    >> queries = tf.constant([[[1.],
                        [2.],
                        [0.]]], tf.float32) # (1, 3, 1)
    >> keys = tf.constant([[[4.],
                     [0.]]], tf.float32)  # (1, 2, 1)
    >> inputs = tf.constant([[[4., 0.],
                               [8., 0.],
                               [0., 0.]]], tf.float32)
    >> mask(inputs, queries, keys, "key")
    array([[[ 4.0000000e+00, -4.2949673e+09],
        [ 8.0000000e+00, -4.2949673e+09],
        [ 0.0000000e+00, -4.2949673e+09]]], dtype=float32)
    >> inputs = tf.constant([[[1., 0.],
                             [1., 0.],
                              [1., 0.]]], tf.float32)
    >> mask(inputs, queries, keys, "query")
    array([[[1., 0.],
        [1., 0.],
        [0., 0.]]], dtype=float32)
    """
    # 很小的负数，在softmax之前mask
    padding_num = -2 ** 32 + 1
    if type in ("k", "key", "keys"):
        # Generate masks:判断是否是0向量，只针对0向量进行mask
        masks = tf.sign(tf.reduce_sum(tf.abs(keys), axis=-1))  # (N, T_k)
        masks = tf.expand_dims(masks, 1) # (N, 1, T_k)
        masks = tf.tile(masks, [1, tf.shape(queries)[1], 1])  # (N, T_q, T_k)

        # Apply masks to inputs
        paddings = tf.ones_like(inputs) * padding_num
        outputs = tf.where(tf.equal(masks, 0), paddings, inputs)  # (N, T_q, T_k)
    elif type in ("q", "query", "queries"):
        # Generate masks:判断是否是0向量，只针对0向量进行mask
        masks = tf.sign(tf.reduce_sum(tf.abs(queries), axis=-1))  # (N, T_q)
        masks = tf.expand_dims(masks, -1)  # (N, T_q, 1)
        masks = tf.tile(masks, [1, 1, tf.shape(keys)[1]])  # (N, T_q, T_k)

        # Apply masks to inputs
        outputs = inputs*masks
    elif type in ("f", "future", "right"):
        # 下三角形矩阵，上三角元素都是0
        diag_vals = tf.ones_like(inputs[0, :, :])  # (T_q, T_k)
        tril = tf.linalg.LinearOperatorLowerTriangular(diag_vals).to_dense()  # (T_q, T_k)
        masks = tf.tile(tf.expand_dims(tril, 0), [tf.shape(inputs)[0], 1, 1])  # (N, T_q, T_k)

        paddings = tf.ones_like(masks) * padding_num
        outputs = tf.where(tf.equal(masks, 0), paddings, inputs)
    else:
        print("Check if you entered type correctly!")


    return outputs


```

