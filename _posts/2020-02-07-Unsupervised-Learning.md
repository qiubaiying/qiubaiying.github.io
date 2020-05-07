---
layout:     post
title:      Unsupervised Learning  
subtitle:   无监督学习介绍
date:       2020-02-07
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - Introduction
---

### 1. Introduction 介绍
(1). Supervised Learning VS Unsupervised Learning     

|      | Supervised Learning | Unsupervised Learning |
| ---- | ---- | ---- |
| Data |(x,y) `x is data, y is label`      | x  `just data, no labels`    |
| Goal |Learning a function to map x${\to}$y | Learning some underlying hidden structure of the data|
| Example | Classification, Regression, Object Detection, Semantic Segmentation, image caption, etc     | Clustering, Dimensionality Reduction, Feature Learning, Density Estimation, etc     |

- 在深度学习中，监督学习往往通过**深度判别模型**体现，非监督学习往往通过**深度生成模型**体现。    
  

(2). Challenge
- 无监督学习的最基本挑战是**任务未被定义**  
      

(3) Advantage
- 在无监督学习中，数据不被特别表示，而是通过学习模型推断出数据的一些内在结构。适用于具有数据集但无标签的应用场景。    
  



### 2. Methods 方法

#### (1). *自回归模型 Autoregressive model*
> [PixelCNN](https://github.com/jyniki/Learn2019/blob/master/research/Image-Generation.md#1-%E8%87%AA%E5%9B%9E%E5%BD%92%E6%A8%A1%E5%9E%8Bautoregressive-model)       
> [PixelRNN](https://github.com/jyniki/Learn2019/blob/master/research/Image-Generation.md#1-%E8%87%AA%E5%9B%9E%E5%BD%92%E6%A8%A1%E5%9E%8Bautoregressive-model)           



#### (2). *特征学习 Representation Learning*   
> **I. 自编码器 AutoEncoder**
> - [变分自编码器 VAE](https://github.com/jyniki/Learn2019/blob/master/research/Image-Generation.md#2-%E5%8F%98%E5%88%86%E8%87%AA%E7%BC%96%E7%A0%81%E5%99%A8vae)  
> 
> - 降噪自编码器 DAE
>   - 降噪自编码器的训练过程中，输入的数据有一部分是“损坏”的。其核心思想是：一个能有从中恢复原始信号的神经网络表达未必是最好的，能够对“损坏”的原始数据编码、解码，然后还能恢复到真正的原始数据，这样的特征才是好的。 
>   - 具体操作过程：对于输入的数据$x$按照$q_D$分布加入随机噪声，加噪过程其本质是按照一定的概率将输入层的某些节点清0，然后将$\hat{x}$作为自编码器的输入进行训练。
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/DAE.png)   
> 
> - 栈式自编码器 SAE
>   - 在介绍SAE之前，需要先介绍Spase AutoEncoder(稀疏自编码器)：
>       - 稀疏自编码器输入层节点数（不包括bias节点）和输出层节点数相同，并在自动编码的基础上加上稀疏性限制（使得神经元大部分的时间都是被抑制的限制则被称作稀疏性限制），使隐藏层节点数少于输入层和输出层节点的个数。
>       - 损失函数定义： 
>           - 用$a_{j}^{(2)}$表示输入向量对隐藏层单元$j$的激活值，则$j$的平均激活值为：$\hat{\rho}_{j}=\frac{1}{m} \sum_{i=1}^{m}\left[a_{j}^{(2)}\left(x^{(i)}\right)\right]$。为了达到稀疏性（用最少的隐藏单元来表示输入层的特征），希望$\hat{\rho}_{j}$接近于0。因此应用KL散度：$\sum_{j=1}^{s_{2}} \rho \log \frac{\rho}{\hat{\rho}_{j}}+(1-\rho) \log \frac{1-\rho}{1-\hat{\rho}_{j}}$，其中$\rho$为稀疏参数，一般选很小的数。
>           - 整体损失函数为：$J_{\text { sparse }}(W, b)=J(W, b)+\beta \sum_{j=1}^{s_{2}} \mathrm{KL}\left(\rho \| \hat{\rho}_{j}\right)$，其中$J(W, b)$用于恒量输入数据和输出数据的差异性。      
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Sparse-Autoencoder.png)
>   - Stacked Autoencoder(SAE)模型是由多层**Sparse AutoEncoder(稀疏自编码器)** 组成的深度神经网络模型。
>       - 其前一层自编码器的输出作为其后一层自编码器的输入，最后一层是一个分类器（logistic分类器或softmax分类器，其中logistic回归模型适用于二分类，softmax回归模型适用于多分类）
>       - 栈式自编码器网络参数是通过逐层**贪婪训练**获得的。  
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/SAE.png)  
---
> **II. 深度置信网络 DBN**
> - 从非监督学习来讲，其目的是尽可能保留原始特征的特点，同时降低特征的维度。从监督学习来讲，其目的在于使得分类错误率尽可能地小。DBN的本质是特征学习的过程，既可以用于非监督学习，类似于一个自编码器，也可以用于监督学习，作为分类器来使用。
> 
> - DBN的组成元件是**受限玻尔兹曼机（RBM）**，下面先对RBM进行详细介绍：
>>   - RBM包含一个由随机的隐单元构成的隐藏层（一般是伯努利分布）和一个由随机的可见（观测）单元构成的可见（观测）层（一般是伯努利分布或高斯分布）。
>>   - 所有可见单元和隐单元之间存在连接，而隐单元两两之间和可见单元两两之间不存在连接（即层间全连接，层内无连接）。
>>   - 每个可见层节点和隐藏层节点都有两种状态：激活状态1和未激活状态0。节点的激活概率由可见层和隐藏层节点的分布函数计算。 
>>   - 在一个RBM中，v表示所有可见单元，h表示所有隐单元，若想确定该RBM模型，只要能够得到三个参数$\theta=\{\mathrm{W}, \mathrm{A}, \mathrm{B}\}$,分布表示权重矩阵W，可见层的单元偏置A，隐藏层单元偏置B。       
>>   ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/RBM.jpg)             
>>       - 假设一个RBM有n个可见单元和m个隐单元，用$v_i$表示第i个可见单元，$h_j$表示第j个隐单元，其参数形式为：
>>           -  $\mathrm{W}=\{w_{i, j}\} \in R^{n \times m}$：$w_{i, j}$表示第i个可见单元和第j个隐单元之间的权值。     
>>           -  $\mathrm{A}=\{a_{i}\} \in R^{m}$：$a_i$表示第i个可见单元的偏置阈值
>>           -  $\mathrm{B}=\{b_{j}\} \in R^{n}$: $b_j$表示第j个隐单元的偏置阈值
>>       - 对于一组给定状态下的(v,h)值，假设可见层单元和隐藏层单元均服从伯努利分布，则RBM的能量公式为： $\mathrm{E}(\mathrm{v}, \mathrm{h} | \theta)=-\sum_{i=1}^{n} a_{i} v_{i}-\sum_{j=1}^{m} b_{j} h_{j}-\sum_{i=1}^{n} \sum_{j=1}^{m} v_{i} W_{i j} h_{j} h_{j}$     
>>       - 对该能量函数指数化和正则化后可以得到可见层节点集合和隐藏层节点集合分别处于某一种状态下(v,h)联合概率分布公式：$\mathrm{P}(\mathrm{v}, \mathrm{h} | \theta)=\frac{e^{-E(v, h | \theta)}}{Z(\theta)}$，其中$Z({\theta})$为归一化因子或分配函数（partition function），表示对可见层和隐藏层节点集合的所有可能状态的（能量指数）求和:$\mathrm{Z}(\theta)=\sum_{v, h} e^{-E(v, h | \theta)}$
>>       - 对于参数的求解往往采用似然函数求导的方法，已知联合概率分布$\mathrm{P}(\mathrm{v}, \mathrm{h} | \theta)$，通过对隐藏层节点集合的所有状态求和，可以得到可见层节点集合的边缘分布(边缘分布表示的是可见层节点集合处于某一种状态分布下的概率)：$\mathrm{P}(\mathrm{v} | \theta)=\frac{1}{Z(\theta)} \sum_{h} e^{-E(v, h | \theta)}$
>>   - 由于RBM模型特殊的层间连接、层内无连接的结构，在给定可见单元的状态时，各隐藏层单元的激活状态之间是条件独立的，此时第j个隐单元的激活概率为：$\mathrm{P}\left(h_{j}=1 | \mathrm{v}\right)=\sigma\left(b_{j}+\sum_{i} v_{i} W_{i j}\right)$;相应的，当给定隐单元的状态时，可见单元的激活概率同样是条件独立的：$\mathrm{P}\left(v_{i}=1 | \mathrm{h}\right)=\sigma\left(a_{i}+\sum_{j} W_{i j} h_{j}\right)$，其中$\sigma(x)$是sigmoid函数。有了激活函数，可以从可见层和参数推导出隐藏层神经元的取值概率，也可以从隐藏层和参数推导出可见层神经元的取值概率。  
>>    - 在给定一个训练样本后，训练一个RBM的意义在于调整模型的参数，以拟定给定的训练样本，使得在该参数下RBM表示的可见层节点概率分布**尽可能与训练数据相符**（求出一个最能产生训练样本的概率分布）
>>       - 首先，要确定可见层和隐藏层节点的个数，其中可见层节点个数即为输入数据维度，而隐藏层节点个数需要**根据使用而定或者在参数一定的情况下，使得模型能量最小时的隐藏层节点个数**   
>>       - 其次，求解三个参数$\theta=\{\mathrm{W_{ij}}, \mathrm{a_i}, \mathrm{b_j}\}$
>>          - 最大化似然对数：$L(W, a, b)=\sum_{i=1}^{m} \ln \left(P\left(v|{\theta}\right)\right)$，$m$为训练样本数目。最大化常常采用梯度上升法，通过迭代求出$\mathrm{W}, \mathrm{a}, \mathrm{b}$。但该方法由于涉及到归一化因子$Z$，计算复杂度高，因此需要采用近似方法来评估。
>>          - Gibbs采样：Gibbs采用可以从一个复杂的概率分布下生成数据，因此只要知道每一个分量相对其他分量的条件概率，即可对其进行采样。利用RBM中的条件概率公式，通过输入训练样本（$v_0$）可以计算得到隐含层的条件概率h，进行一次Gibbs采样得到$\mathbf{h}_{0} \sim P\left(\mathbf{h} | \mathbf{v}_{0}\right)$。同理，根据得到的$h_0$,得到$\mathbf{v}_{1} \sim P\left(\mathbf{v} | \mathbf{h}_{0}\right)$，迭代足够多次后，就可以得到满足联合概率分布$P(v,h)$下的样本$(v,h)$，其中样本v可以近似认为是$P(v)$下的样本，从而求出梯度$\left(\frac{\partial L_{S}}{\partial w_{i j}}, \frac{\partial L_{S}}{\partial a_{i}}, \frac{\partial L_{S}}{\partial b_{i}}\right)$，实现参数更新。**但由于通常需要多步采样才可以采集到符合真实分布的样本，因此训练速度非常慢。**         
>> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/Gibbs.png)   
>>          - CD-K算法：使用训练样本（$v_0$），执行$k$步（一般$k=1$）Gibbs采样。利用$k$步Gibbs采样后得到的$v_k$来近似估计梯度$\left(\frac{\partial L_{S}}{\partial w_{i j}}, \frac{\partial L_{S}}{\partial a_{i}}, \frac{\partial L_{S}}{\partial b_{i}}\right)$，实现参数更新。
>> $\frac{\partial \ln P(\mathbf{v})}{\partial w_{i, j}} \approx P\left(h_{i}=1 | \mathbf{v}^{(0)}\right) v_{j}^{(0)}-P\left(h_{i}=1 | \mathbf{v}^{(k)}\right) v_{j}^{(k)}$
>> $\frac{\partial \ln P(\mathbf{v})}{\partial a_{i}} \approx v_{i}^{(0)}-v_{i}^{(k)}$   
>> $\frac{\partial \ln P(\mathbf{v})}{\partial b_{i}} \approx P\left(h_{i}=1 | \mathbf{v}^{(0)}\right)-P\left(h_{i}=1 | \mathbf{v}^{(k)}\right)$    
>> **CD-K目前已成为训练RBM的标准算法**
>
> - 一定数量的RBM堆叠成一个DBN，然后从底向上逐层预训练(充分训练一个RBM后，将隐单元的激活概率作为下一层RBM的输入数据,各层以此类推），**该学习过程是无监督的，不需要标签信息**
> - 在此预训练模型的基础上，可以通过BP算法自顶而下对DBN网络所有层进行fine-tune     
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/DBN.png)
---

#### (3). *对抗学习 Adversarial Learning*   
> [生成对抗网络 GAN](https://github.com/jyniki/Learn2019/blob/master/research/Image-Generation.md#4-%E7%94%9F%E6%88%90%E5%AF%B9%E6%8A%97%E7%BD%91%E7%BB%9Cgan)      
> 
> [基于GAN的衍生模型](https://github.com/jyniki/Learn2019/blob/master/research/Image-Generation.md#5-gan%E7%9A%84%E6%94%B9%E8%BF%9B%E5%92%8C%E4%BC%98%E5%8C%96)      




### 3.Application 应用
(1). Object detection
> Ref:[Towards Human-Machine Cooperation: Self-supervised Sample Mining for Object Detection](https://github.com/jyniki/Learn2019/blob/master/research/reference/Towards%20Human-Machine%20Cooperation-Self-supervised%20Sample%20Mining%20for%20Object%20Detection.pdf)  

(2). Segmentation    
> Ref:[Unsupervised Object Segmentation by Redrawing](https://github.com/jyniki/Learn2019/blob/master/research/reference/Unsupervised%20Object%20Segmentation%20by%20Redrawing.pdf)

