---
layout:     post
title:      Clustering
subtitle:     聚类
date:       2020-01-15
author:     Young
header-img: img/1*yBo4pYGr873BWW_90giprg.png
catalog: true
tags:
    - machine learning
    - python
---


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

- Issues with K means: 
  - K-means often doesn’t work **when clusters are not round shaped** because of it uses some kind of distance function and distance is measured from cluster center. 	
  - Another major problem with K-Means clustering is that Data point is deterministically assigned to one and only one cluster, but in reality there may be **overlapping between the cluster** for example picture shown below
  <p align="center">
    <img src="https://miro.medium.com/max/1826/0*uQTamSp8hAcnJPl0." style="zoom:100%" />
  </p>

### **[Gaussian Mixture Models(GMM)](https://home.deib.polimi.it/matteucc/Clustering/tutorial_html/mixture.html)**

- In practice, **each cluster can be mathematically represented by a parametric distribution**, like a Gaussian (continuous) or a Poisson (discrete). The entire data set is therefore modelled by **a mixture of these distributions**. An individual distribution used to model a specific cluster is often referred to as a component distribution.

- In this approach we describe each cluster by its **centroid (mean), covariance , and the size of the cluster(Weight)**.

<p align="center">
  <img src="https://miro.medium.com/max/1864/0*W7QWSZOJm-l-_m96." style="zoom:100%" />
</p>

- 相对于k均值聚类算法使用 k 个原型向量来表达聚类结构，高斯混合聚类使用 k 个高斯概率密度函数混合来表达聚类结构
  <p align="center">
  $$
  P(x_{i}|y_{k}) = \frac{1}{\sqrt{2\pi\sigma_{y_{k}}^{2}}}exp( -\frac{(x_{i}-\mu_{y_{k}})^2}  {2\sigma_{y_{k}}^{2}})
  $$
  </p>

- 于是迭代更新 k 个簇原型向量的工作转换为了迭代更新 k 个高斯概率密度函数的任务。每个高斯概率密度函数代表一个簇，当一个新的样本进来时，我们可以通过这 k 的函数的值来为新样本分类
  ```python
  高斯混合模型聚类算法EM步骤如下：
  
  1. 猜测有几个类别，既有几个高斯分布。
  2. 针对每一个高斯分布，随机给其均值和方差进行赋值。
  3. 针对每一个样本，计算其在各个高斯分布下的概率。
  4. 针对每一个高斯分布，每一个样本对该高斯分布的贡献可以由其下的概率表示，如概率大则表示贡献大，反之亦然。这样把样本对该高斯分布的贡献作为权重来计算加权的均值和方差。之后替代其原本的均值和方差。
  5. 重复3~4直到每一个高斯分布的均值和方差收敛。
  ```

### [Hierarchical Clustering](https://home.deib.polimi.it/matteucc/Clustering/tutorial_html/hierarchical.html)

```
1. Compute the proximity matrix
2. Let each data point be a cluster
3. Repeat: Merge the two closest clusters and update the proximity matrix
4. Until only a single cluster remains
```

- *single-linkage*
  - 最小距离：$d_{min}(C_i,C_j)=\min_{p\in C_i,q\in C_j}\mid p-q \mid .$  
- *complete-linkage*
  - 最大距离：$d_{max}(C_i,C_j)=\max_{p\in C_i,q\in C_j}\mid p-q \mid .$  
- *average-linkage*
  - 平均距离：$d_{avg}(C_i,C_j)=\frac{1}{\mid C_i \mid \mid C_j \mid }\sum_{p\in C_i}\sum_{q\in C_j}\mid p-q \mid .$  

- 自顶向下、自底向上


### [A comparison of the clustering algorithms in scikit-learn](https://scikit-learn.org/stable/modules/clustering.html#k-means)

<p align="center">
  <img src="https://github.com/Julian-young/Julian-young.github.io/raw/dev-jiale/img/WX20200117-211658@2x.png" style="zoom:100%" />
</p>
