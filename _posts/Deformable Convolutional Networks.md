---
layout:     post
title:      Deformable Convolutional Networks
subtitle:   论文阅读
date:       2020-04-12
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - paper
---

#### 

#### 1、Introduction

- 提出了一种可以变形的卷积核和池化核，将原始的固定形状的正方形的卷积核转变为能适应物体形状的可变的卷积核，从而使卷积结构适应物体形变的能力更强，

- 传统的CNN靠池化等方法来适应物体的形变，如果物体形状及其复杂，往往效果很差

- 本文提出的可形变的卷积结构（Deformable Convolution Networks）,它对感受野上的每个点加了一个偏移量，偏移大小通过学习得到，偏移后感受野不再是个正方形，而是与物体实际形状相匹配

- 可形变卷积的优势：无论物体怎么形变，卷积区域始终覆盖在物体形状的周围，如下图所示，叠加偏移量的过程可以模拟出目标移动、尺寸缩放、旋转等各种形变。

  <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/DCN.png" alt="img" style="zoom:50%;" />

#### 2、Method

本文把可变形的结构应用到基本的卷积结构和ROI Pooling中，提出了两种全新的结构

- 可变形卷积（Deformable Convolution）

  > - 传统的卷积结构可以定义为以下公式，其中$p_n$是卷积输出每一个点相对感受野上每一个点的偏移量，取**整数**。**($3\times3$卷积核为例，对于每个输出$y(p_0)$，都要从x上采样9个位置，这九个位置在中心位置$x(p_0)$向四周扩散得到的grid形状上，$\mathcal{R}=\{(-1,-1),(-1,0), \ldots,(0,1),(1,1)\}$)**
  >
  > 
  >
  > $$
	> \mathbf{y}\left(\mathbf{p}_{0}\right)=\sum_{\mathbf{p}_{n} \in \mathcal{R}} \mathbf{w}\left(\mathbf{p}_{n}\right) \cdot \mathbf{x}\left(\mathbf{p}_{0}+\mathbf{p}_{n}\right)
  > $$
  > - 全新的可变形卷积在上述公式的基础上，给每个点增加了一个偏移量$\Delta p_{n}$，这个新的偏移量是由另一个卷积的出的，一般是**小数**。
  >   $$
  >   \mathbf{y}\left(\mathbf{p}_{0}\right)=\sum_{\mathbf{p}_{n} \in \mathcal{R}} \mathbf{w}\left(\mathbf{p}_{n}\right) \cdot \mathbf{x}\left(\mathbf{p}_{0}+\mathbf{p}_{n}+\Delta p_{n}\right)
  >   $$
  >   
  >
  >   - **由于**$\Delta p_{n}$很有可能是小数，而feature map x上都是整数位置，需要**双线性插值**。
  >
  > ```markdown
  > 双线性插值：
  > x的浮点坐标为(i+u,j+v),其中i，j为浮点坐标的整数部分，u，v为浮点坐标的小数部分，这个点的可由x(q1):(i,j)、x(q2):(i+1,j)、x(q3):(i,j+1)、x(q4):(i+1,j+1)四个点表示
  > ```
  > $$
  > \begin{array}{l}{x(\mathrm{p})=\sum_{q} G(\mathrm{q}, \mathrm{p}) \cdot x(\mathrm{q})} \\ {=\sum_{q} \mathrm{g}\left(\mathrm{q}_{\mathrm{x}}, \mathrm{p} \mathrm{x}\right) \cdot g\left(\mathrm{q}_{\mathrm{y}}, \mathrm{p}_{\mathrm{y}}\right) \cdot x(\mathrm{q})} \\ {=\sum_{q} \max \left(0,1-\left|\mathrm{q}_{\mathrm{x}}-\mathrm{p}_{\mathrm{x}}\right|\right) \cdot \max \left(0,1-\left|\mathrm{q}_{\mathrm{y}}-\mathrm{p}_{\mathrm{y}}\right|\right) \cdot x(\mathrm{q})}\end{array}
  > $$
  >
  > <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/DCN4.png" alt="img" style="zoom:50%;" />
  >
  > - 完整的可变形卷积的结构如下图所示，上方的卷积用于输出偏移量，该输出的长宽和输入特征图的长宽一致，维度是输入的两倍（因为同时输出 x方向和 y方向的偏移量，用两个维度分开存储）
  >
  > <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/DCN1.png" alt="img" style="zoom:50%;" />
  
- 可变形的ROI Pooling

  > - 传统的ROI Pooling可以定义为以下公式，整个ROI被分为$k*k$个bin，每个bin左上角的坐标是$p_0$，p是bin中每个点相对于$p_0$的坐标偏移量，$n_{ij}$是第ij个bin中的点数。
  > $$
  > \mathbf{y}(i, j)=\sum_{\mathbf{p} \in \operatorname{bin}(i, j)} \mathbf{x}\left(\mathbf{p}_{0}+\mathbf{p}\right) / n_{i j}
  > $$
  > ```
  > ROI Pooling:
  > 是池化的一种方式，其目的是将不同大小的ROI（Regions of Interest）调整到固定的尺寸
  > ```
  >
  > 
  >
  > - 可形变的卷积可以定义为以下公式，其中$\Delta p_{n_{ij}}$是每个bin的偏移量，这个偏移量是针对整个bin的，一个bin中的每一个点该值都相同
  > $$
  > \mathbf{y}(i, j)=\sum_{\mathbf{p} \in \operatorname{bin}(i, j)} \mathbf{x}\left(\mathbf{p}_{0}+\mathbf{p}+\Delta p_{n_{ij}}\right) / n_{i j}
  > $$
  > - 需要做ROI Pooling处理的区域首先完成没有偏移下的pooling过程，输出$k*k*channel$个数据，再用一个全连接层 full connect layer输出$k*k*channel*2$个点表示在 x和 y方向上的偏移$\Delta{\hat{p}_{ij}}$，再按$\Delta \mathbf{p}_{i j}=\gamma \cdot \Delta \widehat{\mathbf{p}}_{i j} \circ(w, h)$获得真正的偏移量$\Delta \mathbf{p}_{i j}$，其中 $\gamma$是一个增益，与(w,h)进行点乘是**为了让偏移量的调整幅度能适配 ROI的尺寸**。（$\Delta{\hat{p}_{ij}}$也是一个小数，需要通过双线性插值来得到真正的值）
  >   <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/DCN2.png" alt="img" style="zoom:67%;" />
  
- Position-Sensitive(PS) ROI Pooling 

  >- PS ROI Pooling 不同于ROI Pooling，通过一个卷积层，所有的输入特征映射首先被转换为每个目标类的$k^2$个分数映射（对于 C个目标类，总共 C+1个），分数映射被表示为{$x_{i,j}$}，其中(i, j)枚举所有的组块，池化是在这些分数映射上进行的。第(i,j)个组块的输出值是通过对分数映射$x_{i,j}$对应的组块求和得到的。
  >
  >  ```markdown
  >  PS ROI Pooling:
  >  · 由R-FCN提出，引入位置敏感得分图。每个候选区域(ROI)被平均分割成k^2个矩形单元，先通过一层1*1的卷积核生成通道数为k^2*(C+1)的特征图，其中k^2代表一个ROI里所有矩形单元的数量，C+1代表所有的类别数加上背景，k^2*(C+1)张特征图每C+1张组成一组，共包含k^2组，每组负责向对应的矩形单元进行响应。
  >  
  >  · 池化每个ROI时，各个点（共k^2个）均由上一层中对应分组的对应位置区域通过平均池化获得，由此得到一组C+1张特征图，这些特征图经过全局平均池化，得到C+1维的向量，计算分类损失函数。
  >  ```
  >
  >  <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/DCN5.png" alt="img" style="zoom:100%;" />
  >
  >- 与ROI Pooling相比，通用特征映射x被特定的位置敏感的分数映射$x_{i,j}$所取代。
  > $$
  >  \mathbf{y}(i, j)=\sum_{\mathbf{p} \in \operatorname{bin}(i, j)} \mathbf{x_{i,j}}\left(\mathbf{p}_{0}+\mathbf{p}+\Delta p_{n_{ij}}\right) / n_{i j}
  > $$
  > 
  >
  ><img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/DCN3.png" alt="img" style="zoom:50%;" />

#### 3、Application

- 可变形卷积在Faster R-CNN和R-FCN中使用得到了较好的效果
- 可形变卷积是空洞卷积的推广