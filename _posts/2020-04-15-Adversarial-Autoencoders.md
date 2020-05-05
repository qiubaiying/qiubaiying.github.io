---
layout:     post
title:      Adversarial Autoencoders 
subtitle:   论文阅读
date:       2020-04-15
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - paper
---

### Adversarial Autoencoders

#### 1. Introduction

> - 提出了对抗自编码器，其本质上是自动编码器和GAN架构的合体，通过将AE隐藏层编码向量的聚合后验与任意先验分布进行匹配完成变分推论（variational inference）
>
> - 将聚合后验与先验匹配确保**从该先验任何部分都能够生成有意义的样本**
> - AAE的编码器将数据分布转换成特定先验分布；解码器可以看作一个深度生成网络，将先验分布映射到数据分布



#### 2. Method

介绍了AAE的几种应用

```
p(z) 任意的先验分布
q(z) 聚合后验分布
q(z|x) encoding分布
p(x|z) decoding分布
pd(x) 真实数据分布
p(x) 模型分布
```



 - Basic AAE

   > $$
   > q({z})=\int_{{x}} q({z} | {x}) p_{d}({x}) d {x}
   > $$
   >
   > 在实现重构的同时，让q(z)去匹配p(z)
   >
   > <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/AAE.png" alt="img" style="zoom:40%;" />

 - Incorporating Label Information in the Adversarial Regularization

   > 将标签信息融入对抗性训练阶段，将标签与分布模式相关联
   >
   > 将标签与分布模式相关联，one-hot vector起到开关的作用，选择判别网络的响应决策表姐
   >
   > <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/AAE1.png" alt="img" style="zoom:80%;" />

 - Supervised AAE 

   > 解码器利用标签和隐变量z来重建图像，这种架构使网络在潜变量z中保留与标签无关的所有信息
   >
   > <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/AAE2.png" alt="img" style="zoom:40%;" />

 - Semi-supervised AAE  

   > - 两个对抗网络，第一个对抗网络用于约束标签类别分布$p(y)$，第二个对抗网络用于约束潜变量z的先验分布$$p(z)$$
   >
   > - 自编码器的编码层$$\begin{equation}
   >   q(z, y | x)
   >   \end{equation}$$用于预测标签y、潜变量z，解码器输$$\begin{equation}
   >   p(x|y,z)
   >   \end{equation}$$入预测标签y,z用于重构样本
   >
   > - 训练分为三个阶段
   >
   >   > 无监督重构阶段：更新自编码层$$\begin{equation}
   >   > q(z, y | x)
   >   > \end{equation}$$和解码层$$\begin{equation}
   >   > p(x|y,z)
   >   > \end{equation}$$
   >   >
   >   > 对抗正则化阶段：首先分别更新标签判别网络和潜变量判别网络参数，然后更新生成网络参数（自编码器编码层）
   >   >
   >   > 半监督分类阶段：更新$$\begin{equation}
   >   > q(y|x)
   >   > \end{equation}$$以此最小化有标签数据交叉熵损失
   >
   > <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/AAE3.png" alt="img" style="zoom:30%;" />
   >
   > 

 - Unsupervised Clustering with AAE  

   > 无监督聚类的架构与半监督的相似，但删除了半监督中的分类阶段，推理网络$$\begin{equation}
   > q(y|x)
   > \end{equation}$$预测一个单矢量，其维数指定的聚类数

 - Dimensionality Reduction with AAE 

   > 通过将m维的one-hot vector乘以$m\times n$的矩阵$W_C$得到cluster head
   >
   > 通过将cluster head 的n维分布与n维类型表示相加得到最终表示
   >
   > 在损失函数中加入了两两cluster head间的欧拉距离作为punishment
   >
   > <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/AAE4.png" alt="img" style="zoom:30%;" />

