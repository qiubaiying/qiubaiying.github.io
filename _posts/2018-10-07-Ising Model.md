---
layout:     post
title:      Ising Model
subtitle:   统计中的“最”模型
date:       2018-10-07
author:     JPZhuang
header-img: img/post-bg-debug.png
catalog: true
tags:
    - model
    - 磁性
  
---
<head>
    <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
    <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
            tex2jax: {
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
            inlineMath: [['$','$']]
            }
        });
    </script>
</head>

> 千年之前就发现的磁性现象，用经典力学是无法解释的(Bohr–van Leeuwen theorem)。直到相对论性的量子力学出现。

![](https://ww4.sinaimg.cn/large/006tKfTcgy1fdhotefcb5j315s0ugjwk.jpg)

### Heisenberg model
海森堡首先提出自旋与自旋之间可能存在交互作用
$$ 
\hat{H}=-\sum_{i j} J_{i j} \vec{S}_{i} \cdot \vec{S}_{j}-h \sum_{i=1}^{N} \vec{S}_{i} \cdot \vec{B}
$$
- 其中自旋角动量可以用泡利矩阵来描述$\left[\sigma_{a}, \sigma_{b}\right]=2 i \varepsilon_{a b c} \sigma_{c}$
- 我们只考虑最近邻的相互作用$\langle i, j\rangle$
- 磁场只有沿着z-轴，因为泡利矩阵$\sigma^{z}$很特殊，$\sigma^{z}$的本征值就是对角线上的值，我们可以把矩阵运算化简成标量${-1,+1}$
$$ 
\begin{eqnarray*}
\hat{H}&=&-J \sum_{j=1}^{N} \sigma_{j} \sigma_{j+1}-h \sum_{j=1}^{N} \sigma_{j}\\
&=&-\frac{1}{2} \sum_{j=1}^{N}\left(J_{x} \sigma_{j}^{\tau} \sigma_{j+1}^{x}+J_{y} \sigma_{j}^{y} \sigma_{j+1}^{y}+J_{z} \sigma_{j}^{z} \sigma_{j+1}^{z}+h \sigma_{j}^{z}\right)
\end{eqnarray*}
$$
丢掉很难算的自旋翻转项$J_{x} \sigma_{j}^{x}\sigma_{j+1}^{x}+J_{y}\sigma_{j}^{y} \sigma_{j+1}^{y}$，我们就得到了Ising模型
$$ 
H(\sigma)=-\sum_{<i j>} J_{i j} \sigma_{i} \sigma_{j}-\mu \sum_{j} h_{j} \sigma_{j}
$$

## Ising Model
即使我们已经做了这么多化简，但是还是解不出来，继续化简了。先算一维的情况	
$$ 
E_{\left\{s_{i}\right\}}=-J \sum_{<i, j \rangle} s_{i} s_{j}-H \sum_{i}^{N} s_{i}
$$
每个位置的自选状态有两种
$$ 
s_{i}=\left\{\begin{array}{l}{+1} \\ {-1}\end{array}\right.
$$
- 如果相邻位置的状态$s_{i}=s_{j}$方向相同，总能量就会减少$J$
- 如果某个小磁针的方向与外场一致，则总能量减少一个单位$h$。
	
#### Mean field in 1d   
用`> 文件名.格式` 的形式导出

	$ tree -L 1 > tree.md
