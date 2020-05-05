---
layout:     post
title:      Adversarial Latent Autoencoders 
subtitle:   论文阅读
date:       2020-05-05
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - ALAE
---

### Adversarial Latent Autoencoders

#### 1. Introduction

> 提出了对抗潜在自编码器（ALAE），ALAE具备与GAN相当的生成能力，同时能够学习解耦表征
>
> 利用ALAE通用架构，设计了两种自编码器，分别基于MLP编码器和StyleGAN生成器（StyleALAE）



#### 2. Model

**(1) Inspiration**

> 在由编码器网络和解码器(生成器)网络组成的AAE体系结构中：
>
> <img src="picture/AAE.png" alt="img" style="zoom:50%;" />
>
> - 编码器的任务是将输入数据映射到具有潜在分布特征的空间(先验概率分布)
> - 生成器的任务是将潜在编码分布映射到由数据分布描述的空间



> 由StyleGAN中的论文提到，**中间的潜在空间距离输入的数据空间足够远时，往往具有解耦性质**（an intermediate latent space, far enough from the imposed input space, tends to have improved disentanglement properties）
>
> - 解耦性的优势：因为GAN生成图像的随机性在于latent code的随机性，latent code 的不同维度对应了图像中的不同特性，改变图像特征时，只需要找到对应的维度调整latent code即可。



**(2) Architecture Design**

> - 把原生GAN中的G分解为**F与G的映射**，D分解为**E与D的映射**：$\mathrm{G}=G \circ F, \quad \text { and } \quad \mathrm{D}=D \circ E$
>
>   - F将噪声z编码成隐变量w
>
>   - G生成图像，同时取决于隐变量w和噪声$\eta$ 的输入
>     $$
>     q(x)=\int_{w} \int_{\eta} q_{G}(x | w, \eta) q_{F}(w) p_{\eta}(\eta) \mathrm{d} \eta \mathrm{d} w
>     $$
>
>   - E将生成的图像进行编码，$q_{E}(w)=\int_{x} q_{E}(w | x) q(x) \mathrm{d} x$
>
>   - **约束为使F生成的分布与由E生成的分布尽可能相近**
>
>   $$
>   q_{F}(w)=q_{E}(w)
>   $$
>
>   
>
> - 优化目标
> $$
> \min _{E, G} \Delta(F \| E \circ G \circ F)
> $$
>
> $$
> \min _{F, G} \max _{E, D} V(G \circ F, D \circ E)
> $$
>
> 
>
> ![img](picture/ALAE.png)



训练步骤（交替更新）：

> Step I：更新判别器（网络E和D）
>
> Step II：更新生成器（网络F和G）
>
> Step III：更新潜在空间自编码器（网络G和E）

<img src="picture/ALAE3.png" alt="img" style="zoom:50%;" />

优势：

> - ALAE约束的是隐变量空间w的相似性，而非约束原生AE中图像（数据空间）相似性
>
> - 给定输入x就可以编码w，给定w就可以生成图像，即在推理时就可以实现重构



#### 3. Application

使用ALAE构建一个基于StyleGAN生成器的自动编码器（StyleALAE）

**StyleGAN**

> <img src="picture/StyleGAN.png" alt="img" style="zoom:50%;" />

**StyleALAE**

> <img src="picture/StyleALAE.png" alt="img" style="zoom:50%;" />







