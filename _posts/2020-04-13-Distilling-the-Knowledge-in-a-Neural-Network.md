---
layout:     post
title:      Distilling the Knowledge in a Neural Network
subtitle:   论文阅读
date:       2020-04-13
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - paper
---



#### 1、Introduction

- 机器学习算法中一种简单的提高性能的方法是使用同样的数据集训练多个不同的模型，测试时取各自预测值的加权平均作为整个算法的最终输出结果。然而多个模型的集合体积庞大，且运算需求极大，难以部署在大量用户的机器上。

> - 提出了一种**知识蒸馏（Knowledge Distillation）**方法，从大模型所学习到的知识中学习有用信息来训练小模型，并保证性能差不多的情况下实现模型压缩
> - 提出一种新的 **集成模型（Ensembles of Models）**方法，包括一个通用模型（Generalist Model）和多个专用模型（Specialist Models），其中，专用模型用来对那些通用模型无法区分的细粒度（Fine-grained）类别的图像进行区分

#### 2、Methods

> - 设计思想：将大模型学习出来的知识作为先验，将先验知识传递到小规模的神经网络中，之后实际应用中部署小规模的神经网络
> - 即用soft target来辅助hard target一起训练，而soft target来自于大模型的预测输出

> - hard target 包含的信息量（信息熵）很低，soft target包含的信息量大，拥有不同类之间关系的信息
>   - 在softmax层$\frac{\exp \left(z_{i}\right)}{\sum_{j} \exp \left(z_{j}\right)}$中引入了一个“温度”参数T，softmax函数随着温度变量的升高分布更加均匀。
>   $$
>   q_{i}=\frac{\exp \left(z_{i} / T\right)}{\sum_{j} \exp \left(z_{j} / T\right)}
>   $$

> - Loss是soft target和hard target的结合，并且第一个目标函数的权重要大一些
>   $$
>   L=\lambda L^{(s o f t)}+(1-\lambda) L^{(h a r d)}
>   $$

> 算法示意图如下：
>
> > $\lambda$表示 hard target和 soft target的权重
>
>   1. 训练大模型：先用hard target，即正常的label训练大模型
>     2. 计算soft target:利用训练好的大模型来计算soft target，即大模型soft后在经过softmax的output
>   3. 训练在小模型的基础上再加一个额外的soft target的loss function，通过$\lambda$来调节两个loss functions的比重。
>   4. 预测时，将训练好的小模型按常规方式使用
>
> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/KD.jpg)
> 



