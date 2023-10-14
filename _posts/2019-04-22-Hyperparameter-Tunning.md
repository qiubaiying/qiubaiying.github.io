---
layout:     post
title:      调整超参数
subtitle:   Fast Tuning with Hyperopt 
date:       2019-04-22
author:     Zhejian Peng
header-img: 
catalog: true
tags:
    - Deep Learning
    - Hyperparameter Tuning
---

<script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML' async></script>

# 从Goodfellow, Bengio和Courville的Deep Learning课本开始

三位大佬在书中提到了三种自动调参的思路 (喜欢手动调参的请跳过):

1. Grid Search
2. Random Search
3. Model-Based Hyperparameter Optimization

## Grid Search
**Grid Search** 其实就是一个暴力解法。列出所有你想测试的超参数，然后找出所有可能的组合，最后从 validation loss 里面找出最好的一组超参数。这是一个非常消耗资源的方法。如果有 m 个超参数，每个超参数选最多 n 个可能值，那么该算法的时间复杂度是 ${O(n^m)}$. 

书中还指出，要想通过 Grid Search 找到比较优的超参组，一次 Grid Search 是不够的。只能通过反复使用 Grid Search，在每次遍历缩小上一次 Grid Search 的范围以此达到较优结果。Grid Search 很容易做到平行计算，因为不同超参数组之间几乎没有干扰。然而因为指数时间复杂度，及时使用平行计算依然无法满足某些模型的调参需求。

在我看来 Grid Search 是无法满足自动调参的需求的。它只能作为手动调参的辅助工具，在人的经验之上选择可靠的区间和备选数值，并且认为的在过程中调整区间从而找到较优参数组。如果相信超参数之间是独立的话，那这个 Grid Search 的时间复杂度是可以从 ${O(n^m)}$ 下降到 ${O(nm)}$ 的。唯一需要注意的是，超参之间的独立性并不是绝对成立的，目前我没找到理论证明这一点。(*"Usually most of these hyperparameters are independent from each other"* - Bengio-2016)

推荐 Grid Search Package: 
```python
from sklearn.model_selection import GridSearchCV
# Please refer to scikit-learn website for example
```

## Random Search
相比 Grid Search, **Random Search** 一样简单，更加方便，最重要的是收敛更快(Bergstra and Bengio, 2012)。
给每个超参数定义一个边缘分布 (marginal distribution)。不要给超参数固定的几个数值。这要做的优势是在不增加算力的前提下，Random Search 可以有更多选择。
- 二项值超参：伯努利分布
- 离散值超参：多项分布
- 连续值超参：对数比例上的均匀分布 （Uniform on log-scale）
  - e.g. log_lr ~ u(-1, -5) ; lr = ${10^{log\_lr}}$

同样 Random Search 也重复跑，通过上一次结果来一步一步优化。

## Model-Based Hyperparameter Optimization
调整超参数也可以被看做一个优化问题。模型如下:



## Grid Search VS. Random Search
![](https://raw.githubusercontent.com/JazzikPeng/jazzikpeng.github.io/master/_posts/img/Grid_Random.png)


# Fast Hyperparameters Tuning with Hyperopt
hyperopt is an optimization package. 

## 1. Defining a Function to Minimize
```python
def objective():
    return loss
```
The disadvantages of this protocol are (1) that this kind of function cannot return extra information about each evaluation into the trials database, and (2) that this kind of function cannot interact with the search algorithm or other concurrent function evaluations.

![](https://raw.githubusercontent.com/JazzikPeng/jazzikpeng.github.io/master/_posts/img/hyperband_rank_chart.png)
