---
layout:     post
title:      End-to-End Object Detection with Transformers (TODO)
subtitle:   目标检测算法
date:       2020-05-30
author:     JY
header-img: img/post-bg-git.jpg
catalog: true
tags:
    - paper
---



### 1. Introduction

> - 近年来，Transformer 成为了深度学习领域非常受欢迎的一种架构，它依赖注意力机制，使得 AI 模型有选择地聚焦于输入的某些部分，因此推理更加高效。Transformer 已经广泛应用于序列数据的处理，尤其是在语言建模、机器翻译等自然语言处理领域。此外，它在语音识别、符号数学、强化学习等多个领域也有应用。（Transformer的介绍详见：https://zju-cvs.github.io/2020/05/14/Transformer/）
> -  Facebook AI 提出了Transformer 的视觉版本Detection Transformer（DETR），用于目标检测和全景分割。与之前的目标检测系统相比，DETR 的架构进行了根本上的改变。这是第一个将 Transformer 成功整合为检测 pipeline 中心构建块的目标检测框架
> - 在性能上，DETR 可以媲美当前的 SOTA 方法，且架构得到了极大简化。研究者在 COCO 目标检测数据集上将 DETR 与 Faster R-CNN 基线方法进行了对比，结果发现 DETR 在大型目标上的检测性能要优于 Faster R-CNN，**但在小目标的检测上性能不如后者**



### 2. Method

#### **总体架构**

> ![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/End-to-End-Object-Detection-with-Transformers/1.png)
>
> 给定图像，先用CNN抽取其特征，然后用transformer结构来直接预测得到BBox的结果（Backbone -> Transformer -> Detect Header）
>
> 所提DETR包括两部分：
>
> - a set prediction loss, 用于计算预测和真值之间的差异
> - an architecture, 用于预测一组objects并且建模它们之间的关系

#### Object detection set prediction loss

> DETR在single pass的decoder过程中推断出固定大小的N个预测集，其中N的设置显著大于图像中典型对象的数量

#### DETR architecture

![img](https://github.com/ZJU-CVs/zju-cvs.github.io/raw/master/img/End-to-End-Object-Detection-with-Transformers/4.png)



### 3.