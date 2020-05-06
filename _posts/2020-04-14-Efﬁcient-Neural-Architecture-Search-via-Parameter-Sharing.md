---
layout:     post
title:      Efﬁcient Neural Architecture Search via Parameter Sharing
subtitle:   论文阅读
date:       2020-04-14
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - paper
---

#### 1. Introduction

> 提出了一种高效的神经网络架构搜索方法（a fast and inexpensive approach ）

> 控制器通过在大型计算图内搜索最佳子图来发现最佳神经网络架构



#### 2. Method

- ENAS的核心概念：神经网络架构的搜索空间可以表示成有向无环图（DAG）

  > - 一个神经网络架构可以表示成DAG的一个子图，下图为节点数为5的搜索空间，红色箭头连接的子图表示一个神经网络架构。图中节点表示计算类型，边表示信息流
  >
  > - ENAS使用RNN(称为controller)决定每个节点的计算类型和选择激活哪些边
  >
  > - 若ENAS使用节点数为12的搜索空间，计算类型为tanh，relu，identity和sigmoid四种激活函数，则搜索空间有$4^N\times N!$
  >
  >   <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Nas6.png" alt="img" style="zoom:50%;" />
  >
  >   

---

##### Designing Recurrent Cells

- controller工作流程（以节点数为4的搜索空间为例）：

  > ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Nas7.png)
  >
  > - controller选择节点1的计算类型为tanh（节点1的前置节点是输入）；选择节点2的前置节点为1，计算类型为ReLU；选择节点3的前置节点为2，计算类型为ReLU；选择节点4的前置节点为1，计算类型为tanh
  > - 可得RNN神经网络架构：节点3和节点4是叶子节点，他们输出的平均值作为RNN神经网络架构的输出。该神经网络架构的参数由$w^{1,2},w^{2,4},w^{2,3},w^{3,4}$组成（$w^{i,j}$是节点i和节点j之间的参数）

  

- 在NAS中，$w^{1,2},w^{2,4},w^{2,3},w^{3,4}$都是随机初始化的，并在每个神经网络架构中从头开始训练；而在ENAS中，$w^{1,2},w^{2,4},w^{2,3},w^{3,4}$等参数是所有神经网络架构共享的（**通过参数共享，解决了NAS算力成本巨大的缺陷**）

---

##### Training ENAS and Deriving Architectures

- 训练ENAS

  > ENAS有2个可训练参数：controller参数$\theta$和子模型共享参数$w$
  >
  > 训练分为两个**交叉过程**：
  >
  > （1）固定参数$\theta$，采样一个神经网络架构，通过训练集训练共享参数$w$
  >
  > - 执行随机梯度下降(SGD)以最小化期望损失函数
  >   $$
  >   \nabla_{\omega} \mathbb{E}_{\mathbf{m} \sim \pi(\mathbf{m} ; \theta)}[\mathcal{L}(\mathbf{m} ; \omega)] \approx \frac{1}{M} \sum_{i=1}^{M} \nabla_{\omega} \mathcal{L}\left(\mathbf{m}_{i}, \omega\right)
  >   $$
  >
  >   > $\mathcal{L}(\mathbf{m} ; \omega)$是标准的交叉熵损失
  >   >
  >   > 根据一个minibatch的训练数据计算，模型$m_i$从$\pi(m;\theta)$采样
  >   >
  >   > 梯度用蒙特卡罗估计来计算
  >
  > （2）固定参数$w$并更新参数$\theta$，以最大化预期reward: $\mathbb{E}_{\mathbf{m} \sim \pi(\mathbf{m} ; \theta)}[\mathcal{R}(\mathbf{m}, \omega)]$
  >
  > - $R(m,w)$是在验证集上计算得到的，encourage ENAS选择泛化性好的模型，而不是过拟合训练集的模型

- 从trained ENAS模型中得到新的体系结构

  > - 首先从训练后的策略$\pi(m;\theta)$中采样几个模型
  >
  > - 对于每个采样模型，从验证集中采样的单个mini-batch计算reward
  > - 采用reward最高的模型，从头开始训练

  

---

##### Designing Convolutional Networks 

```
参考《Learning Transferable Architectures for Scalable Image Recognition》
```

> 与之前recurrent cell的类似，在卷积模型的搜索空间中，控制器RNN对每个决策块上的两组决策进行采样，构成卷积模型的一层：
>
> 1）连接到之前的哪些节点
>
> 2）使用什么计算操作

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Nas8.png" alt="img" style="zoom:80%;" />

![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Nas1.gif)

---

##### Designing Convolutional Cells

> 与其设计整个卷积网络，不如设计更小的模块，然后将它们连接在一起形成网络

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Nas9.png" alt="img" style="zoom:80%;" />

> 利用带有B个节点的ENAS计算DAG来表示cell中局部发生的计算。在这个DAG中，前两个node1和node2被视为cell的输入，对于剩余的B-2节点中的每一个，要求RNN controller作出两组决策：
>
> - 将两个之前的节点当作当前节点的输入
> - 将两个操作应用于两个采样节点（可用的操作包括 identity、$3\times 3$和 $5\times5$可分离卷积、$3\times3$平均池化和最大池化），在对先前节点及其对应的操作进行采样之后，将这些操作应用于先前的节点，并将其结果加起来



Convolutional Cells（以B=4为例）：

> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Nas10.png" alt="img" style="zoom:80%;" />
>- 节点1、2是输入节点，因此不需要对它们进行决策，$h_1,h_2$为这些节点的输出
> 
> - 在节点3：控制器采样两个之前的节点和两个操作。它采样node 2、node 2、separable_conv_5x5和identity（虚线箭头表示skip）
>
>   $$h 3=\operatorname{sep}_{-} \operatorname{con} v_{ 5 \times 5}\left(h_{2}\right)+i d\left(h_{2}\right)$$
>
> - 在节点4：控制器采样node 3、node 1、avg_pool_3x3和sep_conv_3x3。这意味着
>  $$h 4=\operatorname{avg}_{-} \operatorname{pool}_{-} 3 \times 3\left(h_{3}\right)+sep\_conv_{3\times 3}(h1)$$
> 
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Nas11.png)
>
> - 由于除了$h_4$的所有节点都被用作至少另一个节点的输入，因此唯一的松散端$h_4$被视为单元的输出。如果有多个松散的端点，它们将沿着深度维度concat起来，以形成cell的输出。
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Nas2.gif)



Reduction Cells

> - 从搜索空间采样计算图
> - 以步长为2应用所有操作，将输入空间的维度减少2倍

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Nas17.png" alt="img" style="zoom:50%;" /> <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Nas18.png" alt="img" style="zoom:50%;" />