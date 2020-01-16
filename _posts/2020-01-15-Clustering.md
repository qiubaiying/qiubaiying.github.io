---
layout:     post
title:      Clustering
subtitle:     聚类
date:       2020-01-15
author:     Young
header-img: img/1*ff6FquwFWnrFeZJWfvsiag.png
catalog: true
tags:
    - machine learning
    - python
---

 

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
  <img src="https://github.com/Julian-young/Julian-young.github.io/raw/dev-jiale/img/WX20200115-224253@2x.png" style="zoom:30%" />
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
    <img src="https://github.com/Julian-young/Julian-young.github.io/raw/dev-jiale/img/WX20200115-225620@2x.png" style="zoom:30%" />
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



### K-Means

<p align="center">
  <img src="https://stanford.edu/~cpiech/cs221/img/kmeansMath.png" style="zoom:100%" />
</p>

- 随机选取k个聚类质心点（cluster centroids）
- 重复下面过程直到收敛
  - 对于每一个样例 i ，计算其应该属于的类
  - 对于每一个类 j ，重新计算该类的质心
- **[simple implementation of kmeans here to just illustrate some concepts](https://towardsdatascience.com/k-means-clustering-algorithm-applications-evaluation-methods-and-drawbacks-aa03e644b48a)**

```python
import numpy as np
from numpy.linalg import norm


class Kmeans:
    '''Implementing Kmeans algorithm.'''

    def __init__(self, n_clusters, max_iter=100, random_state=123):
        self.n_clusters = n_clusters
        self.max_iter = max_iter
        self.random_state = random_state

    def initializ_centroids(self, X):
        np.random.RandomState(self.random_state)
        random_idx = np.random.permutation(X.shape[0])
        centroids = X[random_idx[:self.n_clusters]]
        return centroids

    def compute_centroids(self, X, labels):
        centroids = np.zeros((self.n_clusters, X.shape[1]))
        for k in range(self.n_clusters):
            centroids[k, :] = np.mean(X[labels == k, :], axis=0)
        return centroids

    def compute_distance(self, X, centroids):
        distance = np.zeros((X.shape[0], self.n_clusters))
        for k in range(self.n_clusters):
            row_norm = norm(X - centroids[k, :], axis=1)
            distance[:, k] = np.square(row_norm)
        return distance

    def find_closest_cluster(self, distance):
        return np.argmin(distance, axis=1)

    def compute_sse(self, X, labels, centroids):
        distance = np.zeros(X.shape[0])
        for k in range(self.n_clusters):
            distance[labels == k] = norm(X[labels == k] - centroids[k], axis=1)
        return np.sum(np.square(distance))
    
    def fit(self, X):
        self.centroids = self.initializ_centroids(X)
        for i in range(self.max_iter):
            old_centroids = self.centroids
            distance = self.compute_distance(X, old_centroids)
            self.labels = self.find_closest_cluster(distance)
            self.centroids = self.compute_centroids(X, self.labels)
            if np.all(old_centroids == self.centroids):
                break
        self.error = self.compute_sse(X, self.labels, self.centroids)
    
    def predict(self, X):
        distance = self.compute_distance(X, old_centroids)
        return self.find_closest_cluster(distance)
```