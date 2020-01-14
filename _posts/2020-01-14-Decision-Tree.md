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

### 信息论基础
<p align="center">
  <img src="https://miro.medium.com/max/2040/1*S6zcbdAzUvIOKBaWBKp9MA.png" style="zoom:50%" />
</p>


- **Entropy**
  <br>
  In the most layman terms, Entropy is nothing but **the measure of disorder(Purity)**.
  
  <p align="center">
    <img src="https://miro.medium.com/max/1130/1*M15RZMSk8nGEyOnD8haF-A.png" style="zoom:80%" />
  </p>
  
- **Information gain (IG): $I G(Y, X)=E(Y)-E(Y \mid X)$** 
  
  <p align="center">
    <img src="https://miro.medium.com/max/4000/1*bVGWGETTor7bSnhr7sXEVw.png" style="zoom:80%" />
  </p>
  
  Information gain (IG) **measures how much “information” a feature gives us about the class.**
  
  - **Why it matter ?**
    - Information gain is **the main key** that is used by Decision Tree Algorithms to construct a Decision Tree.
    - **Decision Trees algorithm will always tries to maximize Information gain**.
    - **An attribute with highest Information gain will tested/split first**.



### What is Decision Tree

  - **Decision trees, as the name implies, are trees of decisions.**
  - A decision tree is a tree where **each node represents a feature(attribute)**, **each link(branch) represents a decision(rule)** and **each leaf represents an outcome(categorical or continues value)**. 

<p align="center">
  <img src="https://miro.medium.com/max/2000/1*DUYbuD8el6Pkkj8-sw5LYw.png" style="zoom:60%" />
</p>

### Decision Tree algorithms

<p align="center">
  <img src="https://upload-images.jianshu.io/upload_images/3777066-960dcf8c1b4541ce.png" style="zoom:60%" />
</p>

```ruby
Input:  训练集D={(x1, y1), (x2, y2), ..., (xm, ym)};
        属性集A={a1, a2, ..., ad}.
Output: 以node为根节点的一个决策树

Process:
## 通过给定样本集D和属性集A构建决策树
TreeGenerate(D, A){
    1: 生成结点node;
    2: if D 中样本全属于同一类别C then
    3:      将node标记为 C类 叶节点; return
    4: end if
    5: if A = ∅ OR D中样本在A上取值相同 then
    6:      将node标记为叶节点，其类别标记为D中样本数最多的类; return 
    7: end if
    8: 从 A 中选择最优化分属性 a*
    9: for a* 的每一值a[i] do
   10:      为node生成一个分支; 令Dv表示D中在 a* 上取值为 a[i] 的样本子集;
   11:      if Dv is empty then
   12:          将分支结点标记为叶节点，其类别为D中样本最多的类; return
   13:      else
   14:          以 TreeGenerate(Dv, A\{a*}) 为分支结点;
   15:      end if
   16: end for
}
```

- **划分选择**
  <br>
  从伪代码中可以看到，**决策树的关键在于伪代码第8行**，即**选择能产生最优划分的属性a***。那么我们应该以什么准则来度量“划分最优”？
  
  - **信息熵 Ent(D)**
  <br>
  设随机标量X是一个离散随机变量，其概率分布为：$P(X=x_i)=p_i, i=1,2,...,n$，则随机变量X的熵定义为：$Ent(D)=-\sum_{i=1}^{n}p_ilog{p_i}$。**Ent(D)值越小，则D的纯度越高**。
  
  - **信息增益 Gain(D,a)**
    <br>
    假定离散属性 a 有 V 个可能取值 $\lbrace a^1,a^2,a^3,...,a^V \rbrace$，若使用 a 对样本 D 进行划分，则会产生 V 个分支节点，其中第 v 个分支结点包含了 D 中所有在属性 a 上取值为 $a^v$ 的样本，记为 $D^v$ 。信息增益就是**通过度量不同分支结点所包含的样本数不同，给分支结点赋予权重|$D^v$|/|$D$|，即样本数越多的分支结点影响越大**。
    
    <p align="center">
    $$
    Gain(D, a)=Ent(D)-\sum_{v=1}^{V} \frac{\left|D^{v}\right|}{|D|} Ent\left(D^{v}\right)
    $$
    </p>
    
    <br>
    一般来说，**信息增益越大说明使用属性 a 进行划分所获得的“纯度提升”越大**，因此我们可以用信息增益作为一种属性划分的选择。(选择属性 a 进行划分后，将不再作为候选的划分属性，即每个属性参与划分后就将其从候选集中移除)。
  
  - **增益率 Gain_ratio(D,a)**
    <br>
    为减少信息增益准则的偏好影响，因此提出了使用“增益率”来选择最优化分。Gain_ratio $(\mathrm{D}, \mathrm{a})=\frac{Gain(D, a)}{I V(a)}$，其中 IV 称为属性 a 的“固有值”，$I V(a)=-\sum_{v=1}^{V} \frac{\left|D^{v}\right|}{|D|} \log_{2} \frac{\left|D^{v}\right|}{|D|}$。属性a的可能取值数目越多，则IV(a)的值越大，这样通过引入约束项，可以从一定程度上削弱“对取值多的属性”的偏好。
  - **基尼指数 Gini_index(D,a)**
    <br>
    CART决策树使用“基尼指数”(Gini index)来选择划分属性，数据集D的纯度可以用基尼值来度量：$Gini(D)=\sum_{k=1}^{|y|} \sum_{k^{\prime} \neq k} p_{k} p_{k^{\prime}}=1-\sum_{k=1}^{|y|} p_{k}^{2}$。直观上的理解为，Gini(D)反映了从数据集D中随机抽取两个样本，其类别标记不一致的概率。因此，Gini(D)越小，则数据集D纯度越高。于是产生了基尼指数(Gini index)：Gini $index(\mathrm{D}, \mathrm{a})=\sum_{v=1}^{V} \frac{\left|D^{v}\right|}{|D|} Gini\left(D^{v}\right)$。于是可以选择使得基尼指数最小的属性作为最优化分属性。

