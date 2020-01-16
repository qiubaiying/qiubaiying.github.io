---
layout:     post
title:      Decision Tree
subtitle:     决策树
date:       2020-01-14
author:     Young
header-img: img/1*ff6FquwFWnrFeZJWfvsiag.png
catalog: true
tags:
    - machine learning
    - python
---

1. 相关概念（无监督学习、聚类的定义）  
2. 性能度量(外部指标、内部指标)  
3. 距离计算  
4. 原型聚类  
    K均值  
    LVQ  
    高斯混合聚类  
5. 层次聚类  
    AGNES  
    自顶而下  
6. 密度聚类  
    DBSCAN  
    其他密度聚类算法  
7. 优缺点  
8. sklearn参数详解  





### 相关概念

- **Clustering**: the process of grouping a set of objects into classes of similar objects
  - **high intra-class similarity** 
  - **low inter-class similarity** 
  - the commonest form of **unsupervised learning**
- **Unsupervised learning** 
  - learning from **raw (unlabeled, unannotated, etc) data**, as opposed to supervised data where a classification of examples is given

### Distance Measures

<p align="center">
  <img src="https://github.com/Julian-young/Julian-young.github.io/raw/dev-jiale/img/WX20200115-224253@2x.png" style="zoom:40%" />
</p>

- Minkowski metric
  <p align="center">
  $$
  d(x, y)=\sqrt[r]{\sum_{i=1}^{p}\left|x_{i}-y_{i}\right|^{r}}
  $$
  </p>
  
- Euclidean distance($r=2$)
  <p align="center">
  $$
  d(x, y)=\sqrt[2]{\sum_{i=1}^{p}\left|x_{i}-y_{i}\right|^{2}}
  $$
  </p>
  
- Manhattan distance($r=1$)
  <p align="center">
  $$
  d(x, y)=\sum_{i=1}^{p}\left|x_{i}-y_{i}\right|
  $$
  </p>
  
- Chebyshev distance($r=+\infty$)
  <p align="center">
  $$
  d(x, y)=\max _{1 \leq i \leq p}\left|x_{i}-y_{i}\right|
  $$
  </p>
  
- Hamming distance
  <br>
  Manhattan distance is called Hamming distance when all features are binary.
  <p align="center">
    <img src="https://github.com/Julian-young/Julian-young.github.io/raw/dev-jiale/img/WX20200115-225620@2x.png" style="zoom:40%" />
  </p>

- Pearson correlation coefficient
  <p align="center">
  $$
  s(x, y)=\frac{\sum_{i=1}^{p}\left(x_{i}-\bar{x}\right)\left(y_{i}-\bar{y}\right)}{\sqrt{\sum_{i=1}^{p}\left(x_{i}-\bar{x}\right)^{2} \times \sum_{i=1}^{p}\left(y_{i}-\bar{y}\right)^{2}}}
  $$
  $$
\text { where } \bar{x}=\frac{1}{p} \sum_{i=1}^{p} x_{i} \text { and } \bar{y}=\frac{1}{p} \sum_{i=1}^{p} y_{i}
  $$
  </p>
  
- cosine distance(Special case)
  <p align="center">
  $$
  s(x, y)=\frac{\vec{x} \cdot \vec{y}}{|\vec{x}| \cdot|\vec{y}|}
  $$
  </p>
  
- Edit Distance
  <br>
  To measure the similarity between two objects, transform one of the objects into the other, and measure how much effort it took. The measure of effort becomes the distance measure.