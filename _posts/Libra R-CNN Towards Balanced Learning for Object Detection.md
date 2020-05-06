---
layout:     post
title:      Libra R-CNN: Towards Balanced Learning for Object Detection
subtitle:   论文阅读
date:       2020-04-14
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - paper
---

#### 1. Introduction

- 检测性能主要受限于训练时sample level, feature level, objective level 的不平衡问题

  > - 所选的 region samples是否 representative
  > - 提取的 visual feature 是否充分利用
  > - 设计的目标函数是否最优

  <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/oc7.png" alt="img" style="zoom:67%;" />

  

- 解决方法：

  > (a) sample level imbalance: 
  >
  > - IoU-balanced sampling:根据assigned ground truth进行mine hard samples
  >
  > (b) feature level imbalance: 
  >
  > - balanced feature pyramid:利用相同深度融合的平衡后的语义特征增强多层次的特征
  >
  > (c) objective level imbalance
  >
  > - balanced L1 loss: 增强重要的梯度，进而对分类，粗定位，细定位进行再平衡



#### 2. Method

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/oc6.png" alt="img" style="zoom:70%;" />

##### IoU-balanced

> 提出了一个问题：训练样本及对应ground truth的重叠度IoU是否与样本的difficulty相关？
>
> 实验发现：实际超过60%的hard negatives的IoU超过0.05，但基于随机采样只得到30%左右的训练样本(70%的随机采样样本都在IoU的0～0.05区间。因为目标物体的区域只占很小一部分，背景占了绝大多数的位置，所以大部分样本都挤在IoU的0～0.05区间，极度的不平衡导致许多hard samples被淹没在数以万计的easy样本中。
>
> 随机采样选中的概率$p=\frac{N}{M}$，其中N为所选的hard negative（错误分类的样本），M为候选框个数

> 提出了新的采样公式 $p_{k}=\frac{N}{K} * \frac{1}{M_{k}}, \quad k \in[0, K)$，通过IoU值划分为K个区间，每个区间的候选采样数为$M_k$。这种采样方式使hard negative 在IoU上均匀分布



##### balanced feature pyramid

> - FPN、PANet、ZigZagNet都利用了特征融合技术，但这些方法都是top-bottom,bottom-top等方式，更多的关注相邻分辨率，且非相邻层所包含的语义信息在信息融合过程中会被稀释
>
> - 思想：以 FPN为基础，对四个level的特征进行四个步骤：rescaling、integrating、refining和 strengthening
>
>   > **rescaling &integrating**：假设$C_l$表示第 $l$ 层特征，越高层分辨率越低，若有${C_2,C_3,C_4,C_5}$的多层特征，$C_2$分辨率最高，低层特诊分辨率高往往学习到的是细节特征，高层特征分辨率低学习到语义特征，把四层特征resize到中间层次的$C_4$的size，然后再做简单的相加取平均操作：$C=\frac{1}{L} \sum_{l=l_{\min }}^{l_{\max }} C_{l}$
>
>   > **refining & strengthening**：rescaling对平均提取到的特征使用non-local进一步定义为更具区分性（discriminative）
>   >
>   > - non-local借鉴传统图像去噪算法，整合了全局信息，计算量少，并且输入输出维度相同
>   >
>   > <img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/oc8.png" alt="img" style="zoom:50%;" />

<img src="https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/oc5.png" alt="img" style="zoom:70%;" />



##### balanced L1 loss

> 目标检测实质是多任务学习（cls & reg），往往需要手动调整权重平衡分类和回归任务
>
> 回归任务unbounded的特性，直接增大回归loss常导致对outliers更加敏感（对于梯度的贡献度，outliers贡献了70%，而大量的inliers只有30%的贡献）

> 思路：从损失函数的角度增大了inliers 对梯度的贡献，实现平衡训练
>
> - Fast R-CNN损失函数为例：
>   $$
>   L_{p, u, t^{u}, v}=L_{c l s}(p, u)+\lambda[u \geq 1] L_{l o c}\left(t^{u}, v\right)
>   $$
>
>   $$
>   L_{\mathrm{cls}}(p, u)=-\log p_{u}
>   $$
>
>   $$
>   L_{\mathrm{loc}}\left(t^{u}, v\right)=\sum_{i \in\{\mathrm{x}, \mathrm{y}, \mathrm{w}, \mathrm{h}\}} \operatorname{smooth}_{L_{1}}\left(t_{i}^{u}-v_{i}\right)
>   $$
>
>   > 其中 p为预测类别，u为真实类别，$t^u$为类别 u的回归结果，v为实际回归目标，$\lambda$用于调整多任务学习下的损失权重，其中 $[u\geq1]$为 Iverson bracket indicator function（$u\geq1$时为1，否则为0），因为一般背景的class 标记为 u=0
>
> 将原来的smooth L1 loss：
> $$
> \operatorname{smooth}_{L_{1}}(x)=\left\{\begin{array}{ll}
> 0.5 x^{2} & \text { if }|x|<1 \\
> |x|-0.5 & \text { otherwise }
> \end{array}\right.
> $$
> **替换为balanced L1 loss**：
>
> > localization loss $L_{loc}$定义为	$L_{l o c}=\sum_{i \in\{x, y, w, h\}} L_{b}\left(t_{i}^{u}-v_{i}\right)$
> >
> > 设计一个promoted gradient formulation as:
> > $$
> > L_{b}(x)=\left\{\begin{array}{ll}
> > \frac{\alpha}{b}(b|x|+1) \ln (b|x|+1)-\alpha|x| & \text { if }|x|<1 \\
> > \gamma|x|+C & \text { otherwise }
> > \end{array}\right.
> > $$
> > 其中$\alpha ln(b+1)=\gamma$，$\gamma$用于调整梯度上界，随着$\alpha$的减小，inliers的梯度能够很好的增强

