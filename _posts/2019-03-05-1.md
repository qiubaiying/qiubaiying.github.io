---

layout:     post
title:      关于Fubini's Theorem证明的一些讨论
subtitle:   
date:       2019-03-05
author:     Derek
header-img: img/post-math.jpg
catalog: true
tags:
    - 数学分析
    
---

# 1. Fubini's Theorem是啥
***
其实，这个定理是应用在双重积分的计算的，数学家Guido Fubini提出使用逐次积分的方法计算双重积分的条件。在这些条件下，不仅能够用逐次积分计算双重积分，而且交换逐次积分的顺序时，积分结果不变，也即

> **Theorem.** Assume that $R=[a, b] \times [c,d]$ is a rectangle in the $xy$ plane. Let $f$ be a function on $R$ and assume that 
>
> (i) $f$ is integrable on $R$. 
>
> (ii) $\forall y \in [c, d],$ the function $f_y: [a, b] \to \mathbb{R}$ defined by $f_y(x)=f(x, y)$ integrable on $[a, b].$
>
> (iii) The function $g: [c, d] \to \mathbb{R}$ defined by $g(y)=\int_a^bf(x, y)\ \mathrm{d}x$ is integrable on $[c, d].$
>
> Then $$\iint_Rf\ \mathrm{d}A=\int_c^d\left(\int_a^bf(x, y)\ \mathrm{d}x\right)\ \mathrm{d}y.$$

# 2. 进一步强化定理与证明
***
我们在证明了Fubini's Theorem后又进一步强化了这个定理。事实上，在满足条件(i)与条件(ii)的情况下，条件(iii)是自动满足的，也就是说在实际应用中，我们不需要再去验证$g(y)=\int_a^bf(x, y)\ \mathrm{d}x$在$[c, d]$上可积了，也即

> **Theorem.** Assume that $R=[a, b] \times [c,d]$ is a rectangle in the $xy$ plane. Let $f$ be a function on $R$ and assume that 
>
> (i) $f$ is integrable on $R$. 
>
> (ii) $\forall y \in [c, d],$ the function $f_y: [a, b] \to \mathbb{R}$ defined by $f_y(x)=f(x, y)$ integrable on $[a, b].$
>
> Then $$\iint_Rf\ \mathrm{d}A=\int_c^d\left(\int_a^bf(x, y)\ \mathrm{d}x\right)\ \mathrm{d}y.$$

我们现在的目标就是要先证明函数$g(y)=\int_a^bf(x, y)\ \mathrm{d}x$在$[c, d]$上可积。其实证明思路是简单的，只需要利用定积分的定义证明。

在这里，很多人都用了$S_Pg-s_Pg<\varepsilon$去证明，事实是虽然这的确可以证出来，但是一部分人在符号的定义和使用上出了问题，导致证明过程有些混乱，甚至出现错误。事实上，我们可以用定积分的另一个定义去证明这个命题，在这个定义下，符号的定义较少，过程也更为简便易读，不易自相混乱。

下面我将给出我的一种证法：

*Proof.* Take a partition $P=\lbrace x_0, ..., x_J; y_0, ..., y_K\rbrace,$ where $x_0=a, x_J=b, y_0=c, y_K=d.$ Define $m_{jk}, M_{jk}, \Delta x_j, \Delta y_k$ as usual, where $j\in\lbrace0, ..., J\rbrace, k\in\lbrace0, ..., K\rbrace.$

Since $\forall y\in[c, d],\ f(x, y)$ is integrable on $[a, b],$ then let $g(\xi_k)=\int_a^bf(x, \xi_k)\ \mathrm{d}x,$ where $\xi_k\in[y_{k-1}, y_k].$ Then we have  $$\sum\limits_{j=1}^Jm_{jk}\Delta x_j \leq g(\xi_k)=\int_a^bf(x, \xi_k)\ \mathrm{d}x \leq \sum\limits_{j=1}^JM_{jk}\Delta x_j.\tag{1}$$
Therefore, $$\sum\limits_{j=1}^J\sum\limits_{k=1}^Km_{jk}\Delta x_j \Delta y_k \leq \sum\limits_{k=1}^Kg(\xi_k) \Delta y_k \leq \sum\limits_{j=1}^J\sum\limits_{k=1}^KM_{jk}\Delta x_j \Delta y_k.$$
Let $\lambda=\max\lbrace\Delta x_i, \Delta y_k\rbrace.$ Since $f$ is integral on $R$, then we have $$\lim\limits_{\lambda\to0}\sum\limits_{j=1}^J\sum\limits_{k=1}^Km_{jk}\Delta x_j \Delta y_k=\lim\limits_{\lambda\to0}\sum\limits_{j=1}^J\sum\limits_{k=1}^KM_{jk}\Delta x_j \Delta y_k=\iint_Rf\ \mathrm{d}A.$$
By Squeeze Theorem, we have $$\lim\limits_{\lambda\to0}\sum\limits_{k=1}^Kg(\xi_k) \Delta y_k=\iint_Rf\ \mathrm{d}A.$$ 
By the definition of integral, we know since $\lim\limits_{\lambda\to0}\sum\limits_{k=1}^Kg(\xi_k) \Delta y_k$ exits, then $g(y)$ is integrable on $[c, d].$

Since $g(y):=\int_a^bf(x, y)dx$ is integrable on $[c, d],$ then by Fubini's Theorem, $$\iint_Rf\ \mathrm{d}A=\int_c^dg(y)\ \mathrm{d}y=\int_c^d\left(\int_a^bf(x, y)\ \mathrm{d}x\right)\ \mathrm{d}y,$$
<p align="right">$\square$</p>

## 2.1 一些说明
***
关于式(1)，其实是在证明Fubini's Theorem的过程中得到的一个小结论，同样我们给出证明。为了简便起见，我们只证明不等式的一边，另一边可由读者自行练习。

*Proof.* Take the same notations.

Since $f(x, y)$ is integrable on $[a, b], \forall y\in[c, d],$ then $f(x, y)$ is also integrable on $[x_{j-1}, x_j], \forall y\in[y_{k-1}, y_k].$ Therefore, $$m_{jk}(x_j-x_{j-1})\leq\int_{x_{j-1}}^{x_j}f(x, y)\ \mathrm{d}x.$$
Since $[a, b]=\bigcup\limits^J_{j=1}[x_{j-1}, x_j], $ and each $x_j$ is distinct, then any intersection of two adjacent intervals has zero content. Thus, $$\int_a^bf(x, y)\ \mathrm{d}x=\sum\limits_{j=1}^J\int_{x_{j-1}}^{x_j}f(x, y)\ \mathrm{d}x.$$
Hence, we have $$\sum\limits_{j=1}^Jm_{jk}(x_j-x_{j-1})\leq\sum\limits_{j=1}^J\int_{x_{j-1}}^{x_j}f(x, y)dx=\int_a^bf(x, y)\ \mathrm{d}x, \forall y\in[y_{k-1}, y_k].$$
<p align="right">$\square$</p>