---
layout:     post
title:      Attention Models
subtitle:   基于注意力机制的模型总结
date:       2020-04-10
author:     JY
header-img: img/post-bg.jpg
catalog: true
tags:
    - Overview
---

`Attention Model在Image Caption、Machine Translation、Speech Recognition等领域有着不错的结果。`

### 一、简介
##### (1). 本质思想

- 将Source中的构成元素想象成是由一系列的<Key,Value>数据对构成，此时给定Target中的某个元素Query，通过计算Query和各个Key的相似性或者相关性，得到每个Key对应Value的权重系数，然后对Value进行加权求和，即得到了最终的Attention数值。
  ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/attention2.png)
- 本质上Attention机制是对Source中元素的Value值进行加权求和，而Query和Key用来计算对应Value的权重系数
- 本质思想改写为如下公式：
$Attention (Query, Source) =\sum_{i=1}^{L_{x}}Similarity (Query,Key_{i} )*Value_i$
其中$L_x=||Source||$代表Source的长度

##### (2). 具体实现过程

- 第一个阶段根据Query和Key计算两者的相似性或者相关性；第二个阶段对第一阶段的原始分值进行归一化处理；第三个阶段根据权重系数对Value进行加权求和。
![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/attention1.jpg)


### 二、 分类

##### 1、注意力分类

- Hard-attention： 
  - 0/1问题，哪些区域是被 attentioned，哪些区域不关注。
  - 硬注意力（强注意力）与软注意力不同点在于，首先强注意力是更加关注点，也就是图像中的每个点都有可能延伸出注意力，同时强注意力是一个随机的预测过程，更强调动态变化。
  - 强注意力是一个不可微的注意力，训练过程往往是通过增强学习(reinforcement learning)来完成的
- Soft-attention:
  - [0,1]间连续分布问题，每个区域被关注的程度高低，用0~1的score表示。
  - 软注意力的关键点在于，这种注意力更关注区域或者通道，而且软注意力是确定性的注意力，学习完成后直接可以通过网络生成
  - 软注意力是可微的，这是一个非常重要的地方。可以微分的注意力就可以通过神经网络算出梯度并且前向传播和后向反馈来学习得到注意力的权重。
  

##### 2、Soft-attention 研究    

  ref: <https://blog.csdn.net/paper_reader/article/details/81082351>

- 从注意力域（attention domain）的角度来分析注意力的实现方法。注意力域主要分为:
   - 空间域(spatial domain)
   - 通道域(channel domain)
   - 层域(layer domain)
   - 混合域(mixed domain)
   - 时间域(time domain)
   
   (1) 空间域  
   Spatial Transformer Networks(STN)   
   ref: Spatial transformer networks
   
   (2) 通道域   
   SeNet  
   ref: Squeeze-and-excitation networks

![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/picture/SEnet1.png)

   	(3) 混合域   
		Residual Attention Network   
		ref:  Residual attentionnetwork for image classification



##### 3、self-attention

https://mp.weixin.qq.com/s/7ETHeN2xV_hEwkDxrhJyNg

###### TODO



### 三、模型

##### 1、Unet-Attention

ref: [Attention U-Net:Learning Where to Look for the Pancreas](reference/Attention U-Net-Learning Where to Look for the Pancreas.pdf)
detail：<https://github.com/jyniki/reference-read/blob/master/read/Attention%20U-Net%20Learning%20Where%20to%20Look%20for%20the%20Pancreas.md>

2、

> TODO