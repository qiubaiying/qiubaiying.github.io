---
layout:     post
title:      吴恩达Deep Learn
subtitle:   
date:       2023-03-22
author:     Joey
header-img: img/post-bg-ai.jpeg
catalog: true
tags:
    - 人工智能
    - 机器学习
---

## AI
- supervised
- unsupervised

### supervised
- classification: Breast cancer detection
    1. malignant
    2. benign

- regression

### unsupervised
- cluster algorithm
- clustering: DNA microarrayu

## linear regression model
- training: Data used to train the model called training dataset
- linear regression with one variable.
- univariate  = one variable

## classification model / predicts categories

1. training set
2. learning algorithm
3. input hypothesis, through the funcition(f) to out put the estimate or prediction for y（y-hat）
-----------------------
1. how to represent? f w,b(x) = wx + b, abbreviation the function f(x) = wx + b

gradient algorithm

### simplified loss function(损失函数):
    损失函数是指用于衡量模型预测结果与真实值之间的差异的函数。在机器学习中，模型的目标是尽可能准确地预测给定输入的输出。因此，我们需要一种方法来衡量模型的预测结果与真实值之间的误差，以便能够调整模型的参数，使其预测结果更加准确。
    损失函数通常采用数学公式来表示，它接受模型的预测结果和真实值作为输入，并返回一个数值，表示它们之间的差异。在训练过程中，模型试图最小化损失函数，这意味着它试图使预测结果与真实值之间的差异尽可能小。
    在深度学习中，常用的损失函数包括均方误差（Mean Squared Error，MSE）、交叉熵（Cross-Entropy）等。选择适合的损失函数通常取决于所解决的问题类型和数据集的特征。

### cost function (成本函数):
    成本函数是指用于衡量模型参数的好坏的函数。在机器学习中，我们通常使用成本函数来评估模型的预测能力，然后通过最小化成本函数来调整模型的参数，以使模型的预测结果更准确。
    成本函数通常采用数学公式来表示，它接受模型的参数和训练数据作为输入，并返回一个数值，表示模型的预测结果与真实值之间的差异。在训练过程中，模型试图最小化成本函数，这意味着它试图调整模型的参数，使其预测结果与真实值之间的差异尽可能小。
    在深度学习中，常用的成本函数包括均方误差（Mean Squared Error，MSE）、交叉熵（Cross-Entropy）等。选择适合的成本函数通常取决于所解决的问题类型和数据集的特征。和损失函数类似，成本函数也是一种衡量模型性能的指标，但是两者在具体应用上有所不同。通常情况下，损失函数是针对单个样本的，而成本函数是针对整个训练集的。

### Logistic regression(逻辑回归):
    逻辑回归是一种用于`二分类问题`的机器学习算法，其公式为：
        hθ(x) = g(θ^T x)
    其中，hθ(x) 是预测值，g(z) 是逻辑函数（也称为 sigmoid 函数），其定义如下：
        g(z) = 1 / (1 + e^-z)
    θ 是模型参数，x 是输入特征向量。在训练过程中，我们使用最大似然估计来估计模型参数。在预测过程中，我们将 hθ(x) 与一个阈值比较，通常为 0.5，如果 hθ(x) 大于该阈值，则预测为正例，否则预测为负例。

### Overfitting (过度拟合):
    1. fits the training set extremelly well

### Underfitting (欠拟合):
    1. Does not fit the training set well
    2. high bias

### select feature to include / exclude
    fix the overfitting or underfitting just not use so many polynomial features.  

### addressing overfitting
    options
    1. collect more data
    2. try selecting and using only a subset of the features
    3. reduce size of parameters —— regularization

### Regularized linear regression (正则化线性回归):
    look at nootbook please

（be continued...）

> 本文首次发布于 [Joey Blog](http://qiaoyu113.github.io), 作者 [@乔宇(Joey)](http://github.com/qiaoyu113) ,转载请保留原文链接..