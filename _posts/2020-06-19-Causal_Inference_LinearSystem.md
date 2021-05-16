---

layout:     post
title:      因果推断｜线性系统中的因果推断
subtitle:   
date:       2020-06-19
author:     Derek
header-img: img/post-sta.jpg
catalog: true
tags:
    - 因果推断
    
---

# 1. 介绍
***

这一篇主要介绍线性方程系统中的因果假设。在这一篇使用的所有模型里，我们使用强假设 - 变量之间的关系是线性的并且所有误差项都服从高斯/正态分布（在某些情况下，我们只需要假设对称分布），这一假设极大地简化了因果分析。正态分布的假设产生了四个特性，这些特性在处理线性系统时非常有用：

1. 有效的代表（Efficient Representation）
1. 期望值可替代概率
1. 预期的线性
1. 回归系数的不变性

在这里，我们需要重新复习一下更高维度的正态分布。当我们考虑一组$N$个正态分布的变量$X_1, \cdots, X_N$时，我们只需要关注$\frac{N(N-1)}{2}$对变量$(X_i, X_j).$ $(X_1, \cdots, X_N)$的联合密度会被完全确定，只要我们确定了$(X_i, X_j)$的双变量密度，$i$和$j$的范围在$1$到$N$之间且$i \neq j.$ 这是一个非常有用的性质，因为它提供了一个极其简便的方式来确定$N$个变量的联合分布。此外，由于每对联合分布由五个参数指定，所以确定联合分布最多需要$\frac{5N(N-1)}{2}$个参数，每个参数由期望值定义。事实上，参数的总数甚至还要更少，即$2N+\frac{N(N-1)}{2},$ 第一项给出了均值和方差参数的数量，第二项给出了相关性的数量。

这给我们带来多变量正态分布的另一个有用特征：它们完全由期望值定义。条件概率可以表示为条件期望，条件独立性等定义图模型结构的概念可以用条件期望之间的等式来表示。比如要表达$Y$和$X$的条件独立性（条件于一组变量$Z$）为$P(Y|X, Z)=P(Y|Z)$就可以写成$\mathbb{E}[Y|X, Z]=\mathbb{E}[Y|Z].$

用期望着替代概率使我们可以用回归来确定因果信息。正态分布的下一个有用的性质是线性 - 每个条件期望$\mathbb{E}[Y|X_1, \cdots, X_n]$是由条件变量的线性组合给出的$$\mathbb{E}[Y|X_1=x_1, \cdots, X_n=x_n]=r_0+r_1x_1+\cdots+r_nx_n$$

这些斜率的大小（或者$Y$对测量$X_i=x_i$的敏感性）并不取决于条件的值$x_1, \cdots, x_n,$ 称自变量，它们只取决于选择哪些变量作为自变量。值得注意的是，路径系数$\beta_1, \cdots, \beta_n$与我们讨论的回归系数$t_1, \cdots, r_n$有着本质的区别。前者是结果性或因果性，后者是统计性的。

# 2. 结构系数与回归系数
***

回归方程是描述性的，它不对因果关系做任何假设。当我们把$y=r_1x+r_2z+\varepsilon$写成一个回归方程的时候，我们并不是说$X$和$Z$引起了$Y,$ 我们只是说我们需要知道怎样的$r_1$和$r_2$会使方程$y=r_1x+r_2z$成为数据的最佳线性近似，或者$\mathbb{E}[y|x, z]$的最佳线性近似。

此外，我们对随机误差项进行区分。回归方程中的误差项用$\varepsilon_1, \varepsilon_2$等表示，结构方程中的误差项用$U_1, U_2$等表示。前者表示对数据拟合方程$y=r_1x+r_2z$后观察的残差误差，而后者表示影响$Y$而本身不受$X$影响的潜在（Latent）因素（有时称为干扰（Disturbance）或遗漏变量（Omitted Variable））。前者是人为的（由于不完全拟合）而后者是自然的。


# 3. 结构系数的因果解释
***

在一个线性系统中，每一个路径系数都代表着自变量$X$对因变量$Y$的直接影响。我们参考直接影响的干预定义，它要求计算当$X$增加一个单位而$Y$的所有其他父母变量保持不变时$Y$的变化。当我们将这一定义应用于任何线性系统时，无论干扰是否相关，结果都将是$X \rightarrow Y$箭头上的路径系数。

例如考虑图3.1中的模型，我们希望估计$Z$对$Y$的直接影响。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gfwpydiaerj30dc0dcwf2.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 3.1</b> A graphical model<sup><a href="#footnote-1">1</a></sup></div>
</center>

结构方程为：

<body>
<p>
$$\begin{aligned}
X&=U_X
\\ Z&=aX+U_Z
\\ W&=bX+cZ+U_W
\\ Y&=dZ+eW+U_Y
\end{aligned}$$
</p>
</body>

我们可以写成期望值的形式$$\text{DE}=\mathbb{E}[Y|do(Z=z+1), do(W=w)]-\mathbb{E}[Y|do(Z=z), do(W=w)]$$

因为$W$是$Y$在图中唯一的非$Z$的父母变量。应用$do$算子从模型中删除相应的方程，$\text{DE}$中的增量后项变为$d(z+1)+ew$，增量前项变为$dz+ew.$ 两者之间的差值为$d,$ 即$Z$和$Y$之间的路径系数。其它直接效应也是如此，无论误差项如何分布，每个结构系数都代表着一个直接效应。此外，变量$X$以及系数$a, b, c$没有在这个计算中，因为$do$算子将它们从模型中删除了。

现在假设我们想计算的是$Z$对$Y$的总影响。

在线性系统中，$X$对$Y$的总影响就只是从$X$到$Y$的每一条非后门路径的系数乘积之和。这个等式的原因在于SCM的性质。我们考虑图3.1的模型，由于我们要找到$Z$对$Y$的总影响，我们应该对$Z$进行干预，去掉所有指向$Z$的箭头，然后在剩下的模型中用$Z$来表示$Y$

<body>
<p>
$$\begin{aligned}
Y&=dZ+eW+U_Y
\\&=dZ+e(bX+cZ+U_W)+U_Y
\\&=(d+ec)Z+ebX+U_Y+eU_W
\end{aligned}$$
</p>
</body>

我们简化为$Y=\tau Z+U,$ 其中$\tau=d+ec, U$只包含修正模型中不依赖于$Z$的项。因此$Z$增加一个单位，将使$Y$增加$\tau$ - 总效应的定义。不难发现，$\tau$是$Z$到$Y$的两条非后门路径上的系数的乘积之和。此外无论$U$的分布如何，也不管它们是因变量还是自变量，积和规则都是有效的。

# 4. 识别结构系数和因果效应
***

我们现在需要解决一个更难的问题：从非实验数据中估计总效应和直接效应，这个问题被称为“可识别性”（Identifiability）。从数学的角度说，它相当于用协方差$\sigma_{XY}$或回归系数$R_{YX \cdot Z}$来表示与总效应和直接效应相关的路径系数，其中$X$和$Y$是模型中的任意两个变量，$Z$是模型中的一组变量。

事实证明在很多情况下，为了确定总效应和直接效应，我们不需要去识别模型中的每一个结构参数。我们先用总效应$\tau$来说明。后门准则为我们提供了为了确定$X$对$Y$的因果效应，我们需要调整的变量集$Z.$ 原则上，一旦我们得到了集合$Z,$ 我们就可以估计给定$X$和$Z$的关于$Y$的条件期望，然后对$Z$进行平均，我们就可以利用$Y$和$X$之间的结果依赖性来测量$X$对$Y$的影响。我们只需要把这个过程转换成回归。首先，我们找到一组在模型中从$X$到$Y$满足后门准则的协变量$Z.$ 然后我们将$Y$对$X$和$Z$进行回归。$X$的系数代表了$X$对$Y$的真实因果效应。这样做的理由与我们当初证明后门准则的理由类似，对$Z$进行回归，将这些变量加入方程，阻断了所有来自$X$和$Y$的后门路径，从而防止$X$的系数包含虚假信息。

例如考虑图4.1中的模型，我们想找出$X$对$Y$的总因果效应。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gfwxbaofpnj30b80eqjs0.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 4.1</b> A graphical model<sup><a href="#footnote-2">2</a></sup></div>
</center>

首先利用后门准则确定我们必须对$T$进行调整，于是我们将$Y$对$X$和$T$进行回归：$y=r_XX+r_TT+\varepsilon.$ 系数$r_X$代表$X$对$Y$的总影响。注意，这种识别是可以在不识别任何模型参数、不测量变量$W$的情况下进行的。

假如我们现在要找到$X$对$Y$的直接影响。在线性系统中，这种直接效应就是函数$y=\alpha x+\beta z+\cdots+U_Y$中定义了系统中的$Y$的结构系数$\alpha.$ 从图4.1中我们知道，$\alpha=0,$ 因为没有直接从$X$到$Y$的箭头，所以在这种情况下直接效应为零。

在更一般的情况下，我们可以阻塞后门路径以及从$X$到$Y$的间接路径。首先，我们删除从$X$到$Y$的边，称之为$G_\alpha.$ 如果在$G_\alpha$中，有一组变量$Z$能有向分离（D-Separate）$X$和$Y,$ 那么我们可以简单地将$Y$对$X$和$Z$进行回归，所得方程中$X$地系数将等于结构系数$\alpha.$ 这一过程，我们称之为“识别的回归规则”，它为我们提供了一个快速判断任何给定参数是否可以通过普通最小二乘法（OLS）回归确定。

我们来考虑图4.2中的模型。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gfxec1wai5j30bi0ge3z6.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 4.2</b> A graphical model<sup><a href="#footnote-3">3</a></sup></div>
</center>

我们可以通过这种方法找到$X$对$Y$的直接影响。首先，我们去掉$X$和$Y$之间的边，得到了图4.3中的模型$G_\alpha.$ 在这个新模型中，$W$有向分离$X$和$Y,$ 于是我们将$Y$对$X$和$W$进行回归$Y=r_XX+r_WW+\varepsilon.$ 系数$r_X$是$X$对$Y$的直接效影响。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gfxeggwaobj30a80ekmxo.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 4.3</b> A graphical model<sup><a href="#footnote-4">4</a></sup></div>
</center>

目前为止，我们发现了两个有趣的特点。首先，在线性系统中，回归是识别和估计因果效应的主要工具。为了估计一个给定的效应，我们只需要写下一个回归方程，并指定方程中应该包括哪些变量，以及方程中的哪个系数代表了我们关心的效应。剩下的就是对样本数据进行常规的最小二乘法分析，而各种高效的软件包为这种分析提供了便利。其次，只要$U$是相互独立的，而且图中所有的变量都被测量，每一个结构参数都可以用这种方式来识别，即至少有一个识别回归方程的其中一个系数对应于我们试图估计的参数。其中一个方程显然是结构方程本身，以$Y$的父母变量作为回归变量。但可能还有其它几个识别方程具有更好的估计特征，图形分析可以揭示所有这些方程。此外，当一些变量没有被测量，或者一些误差项有相关性时，从结构方程本身寻找识别回归是困难的，这时$G_\alpha$过程则是必要的了。

现在我们假设在$G_\alpha$中没有一组变量可以有向分离$X$和$Y.$ 比如我们看到图4.4中的模型，$X$和$Y$有一个未被观察到的共同原因（虚线表示的双箭头弧线）。因为没有测量，所以我们无法对其进行条件显著。在这种情况下，我们可以使用一个工具变量（Instrumental Variable）来确定直接效应。如果一个变量在$G_\alpha$中与$Y$是有向分离的，并且它与$X$是有向连接的，那么这个变量就被称为工具。

在图4.4中，$Z$是关于$X$影响$Y$的一个工具变量，因为它在在$G_\alpha$中是与$X$有向连接，并与$Y$有向分离。我们将$X$和$Y$分别对$Z$进行回归，得到回归方程$y=r_1z+\varepsilon$和$x=r_2z+\varepsilon.$ 由于$Z$没有后门，$r_2$等于$\beta, r_1$等于$Z$对$Y$的总影响$\beta\alpha.$ 因此，$\frac{r_1}{r_2}$提供了所需的系数$\alpha.$ 这个例子说明了如何从总效应中找出直接效应。图形模型可以为我们提供一个寻找系统中所有工具变量的过程。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gfxg6hjyrjj30760f874o.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 4.4</b> A graphical model<sup><a href="#footnote-4">4</a></sup></div>
</center>

# 5. 线性系统中的中介作用
***

当我们可以假设变量之间的线性关系时，中介作用的分析比在非线性或非参数系统中进行的分析要简单得多。例如，我们估计$X$对$Y$的直接影响，相当于估计两个变量之间的路径系数，而我们可以利用估计相关系数完成。间接效应同样可以通过差值$\text{IE}=\tau-\text{DE}$得到，其中$\tau$是总效应。

而在非线性系统中，直接效应则通过$$\text{DE}=P(Y=y|do(X=x), do(Z=z))-P(Y=y|do(X=x'), do(Z=z))$$或者$$\text{DE}=\mathbb{E}[Y|do(x, z)]-\mathbb{E}[Y|do(x', z)]$$定义，其中$Z=z$代表$Y$的所有除了$X$的父母变量。即使满足识别条件，并且我们能够将$do$算子通过调整还原为普通的条件期望，结果仍将取决于$x, x'$和$z$的具体数字。此外，间接效应不能通过$do$算子给出定义，因为我们不能通过保持变量不变来阻止$Y$对$X$的反应。间接效应也不能定义为总效应和直接效应的差值，而正如我们之前提到的一样，我们会在接下来利用反事实定义间接效应。

# Reference
***

<p id="footnote-1">1. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 82.
<p id="footnote-2">2. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 83.
<p id="footnote-3">3. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 84.
<p id="footnote-4">4. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 85.