---
layout:     post
title:      胶囊网络&&异常检测
subtitle:   应用第一代胶囊网络做异常检测
date:       2020-05-11
author:     小周同学
header-img: img/post-bg.jpg
catalog: true
tags:
    - Overview
---

------

### 第一代胶囊网络

论文地址：https://arxiv.org/abs/1710.09829

#### 什么是胶囊网络？为什么要有胶囊网络？

​		卷积神经网络CNN具有平移不变性（Invariance），但是其不能很好地反映各个组件的关系以及当图像旋转（视角发生变化）时其不能对其进行检测，即不具有等价性（Equivariance）。CNN在进行检测时是根据像素进行判断的，没有考虑到各个组件之间的关系，这样会导致CNN判断汽车时，这辆汽车有没有四个轮子也不重要。当给一幅图像加上噪声其也不能很好地检测出来。

<img src="..\img\2020-05-10-Exploring-Deep-Anomaly-Detection-Methods-Based-On-Capsule-Net\fig.png" alt="fig" style="zoom:80%;" />

​       为了解决这个问题，hinton提出了胶囊网络（CapsuleNet），可以将Capsule其理解为一个向量版的神经元，向量的长度表征实体存在的概率，向量方向表示实例化参数。

<img src="..\img\2020-05-10-Exploring-Deep-Anomaly-Detection-Methods-Based-On-Capsule-Net\fig2.png" alt="fig" style="zoom:80%;" />

​	上图中$u_i$为输入，输出为$v_j$，胶囊与CNN不同的地方在于，ui和vj在CNN中是一个标量，而在胶囊网络中是一个向量，同时增加了一个仿射变换（Affine Transformation）将ui变换为$\widehat{u_{j|i}}$，从上图看得很清楚，就不详细说了，根据上图的公式即可进行胶囊的变换。论文中的动态路由（Dynamic Routing）体现在上图中的红线部分，即对$b_{ij}$的更新不是通过反向传播实现的，可以一定程度上减少损失函数设计不好对模型的影响。$b_{ij}$初始化为0，随着网络的迭代更新，模型中可训练的参数仅为$W_{ij}$。更新过程如下图所示。

<img src="..\img\2020-05-10-Exploring-Deep-Anomaly-Detection-Methods-Based-On-Capsule-Net\fig3.png" alt="fig" style="zoom:80%;" /> 

​		损失函数对最后的输出取模长得到其存在的概率值，然后与真实的相比较，具体为：

<img src="..\img\2020-05-10-Exploring-Deep-Anomaly-Detection-Methods-Based-On-Capsule-Net\loss.png" alt="fig" style="zoom:80%;" />

​         论文将胶囊网络用到了MNIST分类上，整体结构如下图所示。

<img src="..\img\2020-05-10-Exploring-Deep-Anomaly-Detection-Methods-Based-On-Capsule-Net\fig4.png" alt="fig" style="zoom:80%;" />

​		conv1为普通的卷积操作，得到了$20*20*256$的特征图。之后又经过一个卷积操作得到了PrimaryCaps，其更直观的过程如下图所示。

#### <img src="..\img\2020-05-10-Exploring-Deep-Anomaly-Detection-Methods-Based-On-Capsule-Net\fig5.png" alt="fig" style="zoom:80%;" />

​     即先通过普通卷积操作得到$6*6*256$的特征图，经过reshape操作将每8个通道合并得到PrimaryCaps。在输入前经过squashing操作，将向量的大小固定为0到1之间且方向不变，再reshape展开为1152*8D的输入向量。然后就和前面说的胶囊变换一模一样了，即输入神经元不是一个标量而是一个8维的向量！输出为DigitCaps，输出总共有10个胶囊，每个胶囊胶囊为16维的向量，代表一个0-9的数字。对每个向量取模长即可得到每个数字存在的概率值从而进行分类。

​	此外，文章还使用额外的重构损失（reconstruction loss）来促进数字 capsule 对输入数字的实例化参数进行编码。

<img src="..\img\2020-05-10-Exploring-Deep-Anomaly-Detection-Methods-Based-On-Capsule-Net\fig6.png" alt="fig" style="zoom:80%;" />

​       在训练期间，蒙住所有向量，除了正确的数字 capsule 的活动向量外，其他向量置为0。然后，使用该活动向量来重构数字，capsule的输出被馈送至包含 3个全连接层的解码器，按0.0005 的比例缩小重构损失，以使它不会主导训练过程中的边际损失。有点像自编码器的结构。

​		实验表明这个胶囊网络对于MNIST效果还不错，但是对于更复杂一点的图像如CIFA10等效果就不如意了，其训练过程也十分缓慢。

#### 胶囊网络&&异常检测

​	既然胶囊网络是一个类似于自编码器的结构，那当然也可以用来做异常检测，Exploring Deep Anomaly Detection Methods Based on Capsule Net（https://arxiv.org/abs/1907.06312） 这篇文章就直接将胶囊网络用作手写数字的无监督异常检测。大体思路也是将某一类数字当做异常类，将其他数字加起来作为训练集进行训练。其采用两种异常判定的方式，一种是传统的重构图像间的像素误差不过他用的不是MSE而是normalized squared error (NSE)，不过也差不多；另一种是他提出了Prediction-Probability-Based Normality Score，将上文提到的胶囊网络最终的每个数字存在的概率值当做异常的判别标准：

<img src="..\img\2020-05-10-Exploring-Deep-Anomaly-Detection-Methods-Based-On-Capsule-Net\fig7.png" alt="fig" style="zoom:80%;" />

​	当输入的是正常图像时，将会有一个概率值十分接近于1；当输入的是异常图像时，所有的值都将会十分低。

​	其实就是胶囊网络一个很简单的应用。



### 第二代胶囊网络

论文地址：https://openreview.net/pdf?id=HJWLfGWRb

相比于第一代胶囊网络：（来自https://www.zhihu.com/question/67427994/answer/260904935）

1. 改变了capsule的表示形式。在上一篇论文Dynamic Routing Between Capsules中，capsule的表示形式为n维的vector，每个维度表示一种特征，向量的总长度表示capsule(所检测出的entity)的显著程度。而在本篇论文中，capsule的形式变成了n*n的matrix，再另加一个scalar表示其activation。

2. 改变了第L层capsule和第L+1层capsule互动的方式。在Dynamic Routing Between Capsules中，上一层和下一层capsule之间的相关系数(agreement)是由vector的内积计算的，也就是余弦相似度。而这种计算方法不能很好地区分“quite good”和“very good”的areement。于是，这篇论文中改用了Gaussian cluster的log variance做为相似度。由于高斯混合模型是一个含有隐变量的生成模型，所以迭代过程由EM算法完成。

   

整体来说结构为部件—整体的关系，这部分涉及到很多数学公式，先不看。。

### 第三代胶囊网络

论文地址：https://arxiv.org/abs/1906.06818

这个就更复杂了，关键资料也很少，而且hinton说这个第三代胶囊网络才是对的，以前的胶囊网络都有问题。。目前尝试看了一下，其结构为整体—部件—整体的关系，真正地定义了两个自编码器的结构Part Capsule Autoencoder (PCAE)和Object Capsule Autoencoder (OCAE)，PCAE将原图拆分为一个个部件（part），OCAE将部件（part）重新组合为一个物体（object）

<img src="..\img\2020-05-10-Exploring-Deep-Anomaly-Detection-Methods-Based-On-Capsule-Net\figc.png" alt="fig" style="zoom:80%;" />

论文将其应用到了MNIST无监督的分类中，达到了98.5%准确度，这种无监督的分类方式以及胶囊网络本身仅需要较少的训练样本，或许可以解决工业领域样本较少的问题。

有待进一步研究！



