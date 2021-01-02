---
layout:     post
title:     Prototypical Networks for Few-shot Learning
subtitle:   论文阅读
date:       2020-03-25
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - paper
---

#### 1. Introduction

- 本文提出了一种可以用于few-shot learning 的原型网络（prototypical networks），该网络能识别出在训练过程中从未见过的新类别，并且对于每个类别只需要很少的样例数据。

  

#### 2. Methods

##### (1) Notation

> 在few-shot分类任务中，$$S=\left\{\left(\mathbf{x}_{1}, y_{1}\right), \dots,\left(\mathbf{x}_{N}, y_{N}\right)\right\}$$为一组小规模的N标签的训练数据集
>
> （x是D维的原始数据的向量化表示，y为其对应的类别，$S_k$代表类别为k的数据集合）



##### (2) **Few-shot learning**

>  Train

- 原型网络通过一个embedding函数$$ f_{\phi}: \mathbb{R}^{D} \rightarrow \mathbb{R}^{M}$$，将每个类别中D维的样例数据映射到一个M维度量空间（metric space）中。

- 类别的原型Prototype通过对训练集中所有的向量化样例数据取均值得到：
  $$
  \mathbf{c}_{k}=\frac{1}{\left|S_{k}\right|} \sum_{\left(\mathbf{x}_{i}, y_{i}\right) \in S_{k}} f_{\phi}\left(\mathbf{x}_{i}\right)
  $$
  

- 使用欧几里得距离作为距离度量，训练过程是通过随机梯度下降法最小化目标函数：
  $$
  J(\boldsymbol{\phi})=-\log p_{\phi}(y=k | \mathbf{x})=-log(\frac{\exp \left(-d\left(f_{\phi}(\mathbf{x}), \mathbf{c}_{k}\right)\right)}{\sum_{k^{\prime}} \exp \left(-d\left(f_{\phi}(\mathbf{x}), \mathbf{c}_{k^{\prime}}\right)\right)})
  $$
  

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/PN2.png" alt="img" style="zoom:50%;" />

> Test

- 在测试时，原型网络使用softmax作用在embedding后的测试向量点$f_\phi(x)$到$c_k$的距离
- 分类问题转化为在embedding空间中的最近邻，即将测试样本embedding后，与三个原型进行距离计算，并经过softmax得到$$\begin{equation}
  p_{\phi}(y=k | x )=\frac{\exp \left(-d\left(f_{\phi}( x ), c _{k}\right)\right)}{\sum_{k^{\prime}} \exp \left(-d\left(f_{\phi}( x ), c _{k^{\prime}}\right)\right)}
  \end{equation}$$，从而获得测试样本的类别概率



<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/PN.png" alt="img" style="zoom:50%;" />



##### (3) **Zero-shot learning**

- 零样本学习不同于少样本学习，其meta-data向量$v_k$不是由训练集中的样本生成的，而是根据每个类的属性描述、原始数据等学习得到的。

  $$\mathbf{c}_{k}=g_{\vartheta}\left(\mathbf{v}_{k}\right)$$

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/PN1.png" alt="img" style="zoom:30%;" />

> 通过embedding zero-shot中的meta-data，即$v_k$（对类别特点的描述性内容等）来获得类别的embedding向量$c_k$作为原型的另一种形式，之后步骤与few-shot learning类似。

