---
layout:     post
title:      CrackGAN A Labor-Light Crack Detection Approach Using Industrial Pavement Images Based on Generative Adversarial Learning
subtitle:   论文阅读
date:       2020-04-11
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - paper
---

#### 1、简介

- 问题提出：

  **”All black“ phenomenon：**网络很容易地“收敛”到将所有像素视为背景（BG）的状态，并且实现很小的损失

  > **原因：**数据不平衡，Ground Truths（GT）精度差

- 解决方案：

  > 为end-to-end训练引入crack-patch-only(CPO)监督和生成对抗学习，使网络始终能够产生有裂痕的图像(crack-GT)

  > 同时通过将更大尺寸的裂痕图像输入一个非对称的U型生成器，保留裂缝和Background图像的平移性来克服”“All Black”问题



#### 2、相关工作

- 一些方法在裂痕很细并很难获得精确的像素级Ground Trusts的工业路面图像上，很容易failed
- 由于深度学习是一种数据驱动的方法，非常依赖于精确的Ground Trusts数据。当有新的数据(不同路段或不同时段）时，训练好的网络性能可能降低，需要手工标记新的数据集重新训练模型
- 大多数裂痕非常细且边界模糊，像素级Ground Truth的标注成本高）
- 裂痕在整个图像中占据非常小的区域，像素级裂痕检测模型的训练数据集严重失衡



#### 3、模型介绍

> 本文提出了CrackGAN模型用于路面裂痕检测，解决了深度学习裂痕检测方法中存在的“All black”问题，提出了crack-patch-only(CPO) 监督和生成对抗学习来处理数据失衡，同时网络能够使用labor-light Ground Trusts图像(裂缝标记为1像素曲线)进行训练，减少人工标注的工作量

![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/CrackGAN.png)

- **Loss定义**

  > $$
  > L_{\text {final}}=L_{a d v}+\lambda L_{\text {pixel}}
  > $$
  > $$
  > L_ {a d v} =  -  E_ {x \in I} [\ log D(G(x))]
  > $$
  >
  > $$
  > L_{p i x e l}=-E_{x \in I, y}\left[\|y-G(x)\|_{1}\right]
  > $$
  >
  > 
  >
  > $I$是仅包含裂痕patch的训练集
  >
  > $L_{pixel}$: pixel-level loss基于优化L1距离，保证生成裂痕图案与输入patch的裂痕图案相同
  >
  > $L_{adv}$：由预训练的鉴别器产生的对抗损失



- **生成对抗模型的引入**

  > 引入生成对抗模型，增加了生成对抗损失，使得网络始终能够产生Crack-GT的检测结果
  >
  > - 生成对抗模型训练数据仅使用有裂痕的patch（CPO supervision)预训练DCGAN获得one-class是鉴别器
  >
  > $$
  > \begin{aligned} \max _{D} V(D, G) &=E_{x \sim p_{d}(x)}[\log D(x)] +E_{z \sim p_{d}(z)}[\log (1-D(G(z)))] \\ \max _{G} V(D, G) &=E_{z \sim p_{d}(z)}[\log (D(G(z)))] \end{aligned}
  > $$
  > ​	*其中$x$是来自真实数据的图像（crack-GT patch)，分布为$p_d(x)$;$z$是从高斯分布$p_d(z)$的噪声中随机生成的向量；D是判别器，G是用卷积和反卷积kernels建立的生成器。*
  >
  > - 训练好的判别器D能够将crack-GT patch判定为真，All black patch判定为假
  
  ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/CrackGAN3.png)
  
- **非对称U-net引入**

  > 由于网络仅采用裂痕patch进行训练，因此引入非对称U型结构，以实现裂痕和非裂痕图像的平移能力
  >
  > 
  >
  > 训练好的DCGAN中鉴别器被连接到不对称U-net发生器的末端，以提供端对端训练的对抗性损失
  > $$
  > L_{a d v}=-E_{x \in I}[\log D(G(x))]
  > $$
  > *其中$I$是仅包含裂痕patch的训练集*

	> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/CrackGAN1.png)

	> **Receptive field analysis under larger field of view**
	>
	> - 尺寸大于判别器的输入尺寸的裂缝图像，输入到非对称U-Net。并通过网络时，网络将生成一个下采样图像patch，它与判别器的输入大小完全匹配。
	>
	> - U-net生成的图像将输入训练好的one-class判别器（具有保持COP监督的工作机制。
	> - 由于网络被训练以将较大的裂缝图像转换为下采样的裂缝图像，因此其包括固有地裂缝和非裂缝图像样本的平移。**通过这种方式，可以训练网络以处理裂缝和BG图像。**
	
	

- **L1 loss with dilated GTs**

  > 用半径为3的disk structure将1像素宽度的GT扩张3次以产生扩张的GT
  >
  > 引入扩张的GT来指定相对较大的裂缝区域，以确保其覆盖实际的裂痕位置
  > $$
  > L_{p i x e l}=-E_{x \in I, y}\left[\|y-G(x)\|_{1}\right]
  > $$
  > *其中x是输入裂痕，y是扩张的GT*



- **Working on full-size images**

  > 网络中使用的是小图像patch进行训练，然而在实际中，图像的尺寸要大得多
  >
  > **传统的做法**是将输入的图片分成小的图像patches，然后patch-by-patch的处理（滑窗策略）——效率低
  >
  > 
  >
  > 本文采用非对称的U-net作为全卷积网络，因为它的输入模式对尺寸不敏感，因此可以无缝地处理任意大小的图像，且这种全卷积处理机制非常有效，不涉及冗余卷积的问题。



![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/CrackGAN2.png)



