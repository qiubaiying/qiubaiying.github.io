---

layout:     post
title:      因果推断｜图模型及其应用（二）
subtitle:   
date:       2020-05-13
author:     Derek
header-img: img/post-sta.jpg
catalog: true
tags:
    - 因果推断
    
---

# 1. 有向分离（Directional Separation）
***

事实上，我们遇到的因果模型会比这些基础模型更加复杂。

**定义**&nbsp;&nbsp;&nbsp; 路径$p$被一组节点$Z$阻塞（Blocked）当且仅当$p$包括chain：$A \rightarrow B \rightarrow C$或fork：$A \leftarrow B \rightarrow C,$ 并且中间节点$B$属于$Z$（也即$B$是条件）；或者$p$包含collider：$A \rightarrow B \leftarrow C,$ 并且碰撞节点$B$及其后代变量都不属于$Z.$ 如果$Z$阻塞每一条在$X$和$Y$之间的道路，那么$X$和$Y$被称作条件$Z$下的d-separated，也因此$X$和$Y$条件独立于$Z.$

**例**&nbsp;&nbsp;&nbsp; 考虑以下模型：
<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1geri1q5hcuj30i60byq3j.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 1.1</b> A graphical model<sup><a href="#footnote-1">1</a></sup></div>
</center>

我们考虑$Z$和$Y$之间的关系。如果条件集为$\emptyset,$ 那么$Z \perp Y,$ 因为$Z$和$Y$之间只有一条路径，并且碰撞节点$W$不是条件，所以$Z$和$Y$被阻塞，也即$Z$和$Y$是独立的。

如果条件集为$\lbrace W \rbrace,$ 那么碰撞节点$W$属于条件集，且路径$W \leftarrow X \rightarrow Y$的中间节点$X$不属于条件集，因此路径没有被阻塞，也即$Z \not\perp Y|W.$ 如果条件集为$\lbrace U \rbrace,$ 也同理（碰撞节点的后代变量属于条件集），所以$Z \not\perp Y|U.$

如果条件集为$\lbrace W, X \rbrace,$ 尽管碰撞节点$W$属于条件集，但中间节点$X$也属于条件集，因此路径被阻塞，所以$Z \perp Y|W, X.$

**例**&nbsp;&nbsp;&nbsp; 考虑以下模型：
<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1geriiox8boj30hg0hgwfg.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 1.2</b> A graphical model<sup><a href="#footnote-2">2</a></sup></div>
</center>

我们考虑$Z$和$Y$之间的关系。如果条件集为$\emptyset,$ 那么$Z \not\perp Y,$ 因为路径$Z \leftarrow T \rightarrow Y$没有被阻塞。如果条件集为$\lbrace T \rbrace,$ 那么路径$Z \leftarrow T \rightarrow Y$就被阻塞了，加上之前的分析，我们有$Z \perp Y|T.$

如果条件集为$\lbrace T, W \rbrace,$ 那么尽管路径$Z \leftarrow T \rightarrow Y$被阻塞了，但是碰撞节点$W$属于条件集，且路径$W \leftarrow X \rightarrow Y$的中间节点$X$不属于条件集，因此路径$Z \rightarrow W \leftarrow X \rightarrow Y$没有被阻塞，所以$Z \not\perp Y|T, W.$

# 2. 模型检验
***

我们可以检验因果模型。比如在模型$G$中，我们利用d-separation分析出$W \perp Z_1|X,$ 但如果根据数据，我们发现$W \not\perp Z_1|X,$ 那么我们可以拒绝$G$是关于这组数据的因果模型。我们可以建立回归模型$$w=r_Xx+r_1z_1.$$ 如果$r_1 \neq 0,$ 那么$W \not\perp Z_1|X,$ 因此这个模型就是错误的。（注意，条件相关可以推出条件不独立。）如果模型中的每个d-separation条件都匹配数据中的条件独立，那么我们就不能拒绝这一模型。

我们还有其它方法可以测试模型，比如对整个模型进行统计假设检验，也就是说我们可以评估观察到的样本由假设模型生成的可能性。然而，我们需要在评估可能性之前先估计模型的参数。当我们假设模型是线性和高斯（Gaussian）时，估计参数是可行的。但这一过程也有很多问题，比如在误差项是相关的或者一些变量是不可观察的时候，参数就不可以被估计，联合分布（Joint Distribution）就不能被估计，那么模型就不可以被检验。又比如当我们检测出模型是不适用于数据的时候，我们也很难找出具体的问题，因为这是对整个模型进行的检验。

所以d-separation能解决部分问题。首先，这是非参数的，因此它不需要具体的函数。其次，它是逐一检测的，因此能帮助我们找出模型中具体出问题的部分并修正。

# Reference
***
<p id="footnote-1">1. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 47.
<p id="footnote-2">2. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 48.