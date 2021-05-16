---

layout:     post
title:      因果推断｜图模型及其应用（一）
subtitle:   
date:       2020-05-10
author:     Derek
header-img: img/post-sta.jpg
catalog: true
tags:
    - 因果推断
    
---
# 1. Chains
***

由于部分名词的翻译不是十分确定，因此我选择全部使用英文，也非常欢迎朋友们提供信达雅的翻译。

尽管变量间的关系函数可能是不一样的，我们可以利用图模型来抽象一类变量之间的关系。一个简单的模型是chain：

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1genu2m4734j30go0gmaak.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 1.1</b> The graphical model: chain<sup><a href="#footnote-1">1</a></sup></div>
</center>

我们主要希望通过图模型分析独立性，图1.1中存在的独立性情况有

1. $Z$和$Y$<i>可能</i>是不独立的（dependent）：<i>可能</i>存在$z, y$使$P(Z=z|Y=y) \neq P(Z=z).$
1. $Y$和$X$<i>可能</i>是不独立的：<i>可能</i>存在$y, x$使$P(Y=y|X=x) \neq P(Y=y).$
1. $Z$和$X$<i>可能</i>是不独立的：<i>可能</i>存在$z, x$使$P(Z=z|X=x) \neq P(Z=z).$
1. 如果$Y$是条件（Conditional on $Y$），$Z$和$X$是独立的：对于所有的$x, y, z, P(Z=z|X=x, Y=y)=P(Z=z|Y=y).$

首先任何两个被边相连的变量<i>可能</i>不独立，因为箭头已经说明了一个变量是另一个变量的起因，对应到数学模型中将会更好理解，因此前两点成立。其次，$Z$和$X$<i>可能</i>不独立。因为$Y$影响$Z,$ $X$影响$Y,$ 所以$X$很可能影响$Z.$ 但我们也可以构造模型满足$Z$和$X$独立。比如
<body><p>$$
V=\lbrace X, Y, Z \rbrace, U=\lbrace U_X, U_Y, U_Z \rbrace, F=\lbrace f_X, f_Y, f_Z \rbrace$$ $$\begin{aligned}
&f_X: X=U_X \\
&f_Y: Y=\begin{cases}
a, &\text{if}\ X=1\ \text{and}\ U_Y=1 \\
b, &\text{if}\ X=2\ \text{and}\ U_Y=1 \\
c, &\text{if}\ U_Y=2
\end{cases} \\
&f_Z: Z=\begin{cases}
i, &\text{if}\ Y=c\ \text{or}\ U_Z=1 \\
j, &\text{if}\ U_Z=2
\end{cases}
\end{aligned}$$</p></body>
最后关于第四点，我们在学习贝叶斯球（Bayes ball）时已经证明过这个问题，在这里我们可以用另外一个角度来思考这个问题。因为已知条件$Y,$ 我们不妨假设$Y=c.$ 如果我们要改变$X$的值，为了保持$Y=c,$ 我们只能改变$U_Y$的值，但又因为$Z$只受$Y$和$U_Z$的影响而不受$U_Y$的影响，所以$Z$的值不变。因此，$X$和$Z$是独立的。

**定理**（Chain中的条件独立）&nbsp;&nbsp;&nbsp; 如果在$X$和$Y$之间只有一条单向路径（Unidirectional Path）且$Z$是任何一组在这路径上的变量，那么$X$和$Y$是条件独立于$Z$（conditionally independent given $Z$）。

**注**&nbsp;&nbsp;&nbsp; 只有当误差项$U_X, U_Y$和$U_Z$相互独立时，这一定理才成立。

# 2. Forks
***
现在我们看另外一个模型fork：

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1geo7613r4fj30a00a0t8w.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 2.1</b> The graphical model: fork<sup><a href="#footnote-2">2</a></sup></div>
</center>

如果我们假设误差项$U_X, U_Y$和$U_Z$相互独立，那么图2.1中的独立性情况有：

1. $X$和$Y$<i>可能</i>是不独立的：<i>可能</i>存在$x, y$使$P(X=x|Y=y) \neq P(X=x).$
1. $X$和$Z$<i>可能</i>是不独立的：<i>可能</i>存在$x, z$使$P(X=x|Z=z) \neq P(X=x).$
1. $Z$和$Y$<i>可能</i>是不独立的：<i>可能</i>存在$z, y$使$P(Z=z|Y=y) \neq P(Z=z).$
1. 如果$X$是条件（Conditional on $X$），$Y$和$Z$是独立的：对于所有的$x, y, z, P(Y=y|Z=z, X=x)=P(Y=y|X=x).$

类似的分析在此不再赘述。

**定理**（Fork中的条件独立）&nbsp;&nbsp;&nbsp; 如果$X$是$Y$和$Z$的共同起因，并且在$Y$和$Z$之间只有一条路径，那么$Y$和$Z$是条件独立于$X$（conditionally independent given $X$）。

# 3. Colliders
***

下一个模型是collider：
<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1geo7kjfx3rj30dw0du0t4.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 3.1</b> The graphical model: collider<sup><a href="#footnote-3">3</a></sup></div>
</center>

如果我们假设误差项$U_X, U_Y$和$U_Z$相互独立，那么图3.1中的独立性情况有：

1. $X$和$Z$<i>可能</i>是不独立的：<i>可能</i>存在$x, z$使$P(X=x|Z=z) \neq P(X=x).$
1. $Y$和$Z$<i>可能</i>是不独立的：<i>可能</i>存在$y, z$使$P(Y=y|Z=z) \neq P(Y=y).$
1. $X$和$Y$是独立的：对于所有的$x, y, P(X=x|Y=y)=P(X=x).$
1. 如果$Z$是条件（Conditional on $Z$），$X$和$Y$<i>可能</i>是不独立的：<i>可能</i>存在$x, y, z$使$P(X=x|Y=y, Z=z) \neq P(X=x|Z=z).$

关于第四点的理解，我们不妨假设$Z=c.$ 因为$Z$同时受到$X$和$Y$的影响，因此如果$X$改变了而为了保持$Z$不变，我们只能改变$Y.$

**定理**（Collider中的条件独立）&nbsp;&nbsp;&nbsp; 如果$Z$是$X$和$Y$之间的碰撞节点（Collision Node），并且在$X$和$Y$之间只有一条路径，那么$X$和$Y$是绝对独立的，但条件不独立于$Z$和$Z$的任何后代变量（dependent conditional on $Z$ and any descendants of $Z$）。

**注**&nbsp;&nbsp;&nbsp; 这一定理对于因果关系的研究非常重要。我们也许曾经会错误地假设没有因果关系就没有相关性，而这一定理则告诉我们是错误的。

而下一篇我们将介绍更为复杂的模型及其相关应用。

# Reference
***
<p id="footnote-1">1. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 37.
<p id="footnote-2">2. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 39.
<p id="footnote-3">3. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 41.