---
layout:     post
title:      End-to-End Object Detection with Transformers
subtitle:   目标检测算法
date:       2020-05-31
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - paper
---



### 1. Introduction

> - 近年来，Transformer 成为了深度学习领域非常受欢迎的一种架构，它依赖注意力机制，使得 AI 模型有选择地聚焦于输入的某些部分，因此推理更加高效。Transformer 已经广泛应用于序列数据的处理，尤其是在语言建模、机器翻译等自然语言处理领域。此外，它在语音识别、符号数学、强化学习等多个领域也有应用。（Transformer的介绍详见：https://zju-cvs.github.io/2020/05/14/Transformer/）
> -  Facebook AI 提出了Transformer 的视觉版本Detection Transformer（DETR），用于目标检测和全景分割。与之前的目标检测系统相比，DETR 的架构进行了根本上的改变。这是第一个将 Transformer 成功整合为检测 pipeline 中心构建块的目标检测框架
> - 在性能上，DETR 可以媲美当前的 SOTA 方法，且架构得到了极大简化。研究者在 COCO 目标检测数据集上将 DETR 与 Faster R-CNN 基线方法进行了对比，结果发现 DETR 在大型目标上的检测性能要优于 Faster R-CNN，**但在小目标的检测上性能不如后者**



### 2. Method

#### **总体架构**

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/End-to-End-Object-Detection-with-Transformers/1.png)
>
> 给定图像，先用CNN抽取其特征，然后用transformer结构来直接预测得到BBox的结果（Backbone -> Transformer -> Detect Header）
>
> 所提DETR包括两部分：
>
> - **a set prediction loss**, 用于计算预测和真值之间的差异
> - **an architecture**, 用于预测一组objects并且建模它们之间的关系

#### Object detection set prediction loss

> DETR在single pass的decoder过程中推断出固定大小的N个预测集，其中N的设置显著大于图像中常见对象的数量。
>
> - 训练的主要困难之一是根据ground truth对预测的对象（类，位置，大小）进行评分。
>
>   
>
> - Optimal assignment
>
>   > 损失会在预测的和真实的对象之间产生最佳的二分匹配，然后优化特定与对象的（bounding box） 的损失：
>   > $$
>   > \hat{\sigma}=\underset{\sigma \in \mathfrak{S}_{N}}{\arg \min } \sum_{i}^{N} \mathcal{L}_{\mathrm{match}}\left(y_{i}, \hat{y}_{\sigma(i)}\right)
>   > $$
>   >
>   > - 用$y$表示对象的ground truth set，而$\hat{y}=\{\hat{y}_i\}^N_{i=1}$ 表示$N$个预测的集合，$N$大于图像中的对象数量
>   > - $y$ 也可以视为大小$N$的集合，并用$\varnothing$表示 no object
>   > - 为了找到这两个集合之间的二分匹配，通过搜索的到$N$个元素的最小损失置换，其中$L_{match}$是一个**pair-wise matching cost**，最优值利用Hungarian algorithm计算
>
> 
>
> - matching cost
>   
>   > 考虑了class prediction 和 similarity
>   
> $$
>   \mathcal{L}_{\text {match }}\left(y_{i}, \hat{y}_{\sigma(i)}\right)=-\mathbb{1}_\left\{c_{i} \neq \varnothing\right\} \hat{p}_{\sigma(i)}\left(c_{i}\right)+\mathbb{1}_{\left\{c_{i} \neq \varnothing\right\}} \mathcal{L}_{\mathrm{box}}\left(b_{i}, \hat{b}_{\sigma(i)}\right)
> $$
>   
> > 其中，$c_i$是目标类别标签，$b_i$是向量代表真值BBox中心点坐标及其宽高
>   
> > 寻找 matching 的过程类似于匹配 proposal 或者 anchors 机制，主要区别是需要找一个one to one matching，而不需要重复
>   
>   
>   
> - Hungarian loss
>
>   > $$
>   > \mathcal{L}_{\text {Hungarian }}(y, \hat{y})=\sum_{i=1}^{N}\left[-\log \hat{p}_{\hat{\sigma}(i)}\left(c_{i}\right)+\mathbb{1}_{\left\{c_{i} \neq \varnothing\right\}} \mathcal{L}_{\mathrm{box}}\left(b_{i}, \hat{b}_{\hat{\sigma}}(i)\right)\right]
>   > $$
>
>   
>   
>   $\hat{\sigma}$是optimal assignment，matching cost和Hungarian loss对BBox进行打分处理，
>   
>   box loss采用了L1 loss和generalized IoU loss
>   
>   > $$
>   > \mathcal{L}_{\mathrm{box}}\left(b_{i}, \hat{b}_{\sigma(i)}\right)=\lambda_{\mathrm{iou}} \mathcal{L}_{\mathrm{iou}}\left(b_{i}, \hat{b}_{\sigma(i)}\right)+\lambda_{\mathrm{L} 1}\left\|b_{i}-\hat{b}_{\sigma(i)}\right\|_{1}
>   > $$





#### DETR architecture

![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/End-to-End-Object-Detection-with-Transformers/2.png)

> 架构包含三个组件，实现最终的检测预测：
>
> - CNN backbone：用于提取紧凑特征表示
> - encoder-decoder transformer
> - feed forward network（FFN）



**Backbone**

> 输入的初始图像$x_{img}\in \mathcal{R}^{3\times\H_0\times W_0}$，常规的CNNbackbone生成较低分辨率的激活图$f\in\mathcal{R}^{C\times H\times W}$，设$C=2048，W,H=H_0/32,W_0/32$

**Transformer encoder**

> - 首先使用$1\times1$将high-level 激活图$f$的通道维度从$C$减少到$d$
> - 创建一个新的特征图$z_0\in \mathcal{R}^{d\times\H\times W}$，编码器期望一个序列作为输入，因此需要将$z_0$折叠为1维，即生成$d\times HW$特征图
> - 每个编码器均具有标准体系结构，并包括一个多头自注意力模块（self-attention）和一个前馈网络（FFN）
> - 由于transformer结构是permutation-invariant，因此用固定位置编码（fixed positional encodings）进行补充，该位置编码被添加到每个attention layer



**Transformer decoder**

> - decoder遵循标准的transformer结构，使用多头自编码和编码器-解码器自注意力机制转换大小为d的N个嵌入
> - 不同的是，DETR模型在每个解码器层并行解码N个对象，由于解码器也是置换不变性，因此N个输入嵌入必须不同才能产生不同的结果
> - 输入嵌入是学习的位置编码，称为object query，并与编码器相似，将它添加到每个关注层的输入中。N个object queries由解码器转换为嵌入的输出，然后通过前馈网络被独立的解码为框坐标和类标签，从而得到最终的N个预测

**Prediction feed-forward network（FFNs）**

> 最终预测由具有ReLU激活功能且具有隐藏层的3层感知器和线性层计算
>
> FFN预测框的标准化中心坐标，高度和宽度，然后线性化层使用softmax函数预测类标签
>
> 此外，由于N常常大于图像中实际感兴趣对象的数量，因此利用$\varnothing$标签来表示未检测到任何对象



**Auxiliary decoding losses**

> 在训练过程中在解码器中使用辅助损耗auxiliary losses很有帮助，特别是有助于模型输出正确数量的每个类的对象。因此DETR在每个解码器层之后添加预测FFN和Hungarian loss，所有预测FFN共享其参数。 使用附加的共享层范数来标准化来自不同解码器层的预测FFN的输入



**Detailed architecture**

![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/End-to-End-Object-Detection-with-Transformers/5.png)



### 3. Comparison

![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/End-to-End-Object-Detection-with-Transformers/4.png)



 