---

layout:     post
title:      因果推断｜干预影响（二）
subtitle:   
date:       2020-06-01
author:     Derek
header-img: img/post-sta.jpg
catalog: true
tags:
    - 因果推断
    
---

# 1. 后门准则（The Backdoor Criterion）
***

事实上，有很多变量的父母变量是难以测量的，因此我们需要找到另一组变量来调整。这个问题为我们揭开了另一个更深层次的统计问题：在怎样的条件下，我们可以在没有干预的情况下，从被动观察获得的数据中计算出一个变量对另一个变量的因果效应。或者说在什么条件下，因果图的结构足以计算出一个给定数据集的因果效应。

其中一个最重要的工具叫做后门准则，对于DAG所代表的因果关系模型中的任意两个变量$X$和$Y,$ 我们可以利用它确定在寻找$X$和$Y$的因果关系时，模型中的哪一组变量$Z$应该作为条件。

**定义**（后门准则）&nbsp;&nbsp;&nbsp; 给定一个有向非循环图中的一对有序变量$(X, Y),$ 如果$Z$中没有一个节点是$X$的后代变量，并且$Z$阻塞了$X$和$Y$之间的每一条包含箭头指向$X$的路径，那么一组变量$Z$相对于$(X, Y)$满足后门准则。

如果一组变量$Z$满足了$X$和$Y$的后门标准，那么就像我们调整$PA(X)$一样（注：$PA(X)$总是符合后门准则），$X$对$Y$的因果效应为$$P(Y=y|do(X=x))=\sum_z P(Y=y|X=x, Z=z)P(Z=z)$$

一般来说，我们希望条件于一组节点$Z$满足：

1. 我们堵塞了所有$X$和$Y$之间的伪路径（Spurious Path）。
1. 我们不对从$X$到$Y$所有定向路径进行干扰。
1. 我们不生成新的伪路径。

当我们试图寻找$X$对$Y$的因果效应时，我们希望条件节点能阻塞所有一端箭头指向$X$的后门路径因为这些路径会使$X$和$Y$相互不独立，但显然是不传递来自$X$的因果影响。如果我们不阻塞它们，就会混淆$X$对$Y$的影响。我们条件于后门路径以满足我们的第一点要求。

但是，我们不希望条件于任何是$X$的后代变量。$X$的后代变量会受到对$X$干预的影响，并且可能会影响到$Y,$ 条件于它们会阻塞这些路径。因此，我们不条件于$X$的后来变量以满足我们的第二点要求。

最后，为了满足第三点条件，我们应该避免条件于collider，以免在$X$和$Y$开辟出一条新的路径。排除$X$的后代变量的要求也避免了条件于$X$和$Y$的中间节点的子女变量（比如图1.1中的$W.$）如果条件于这些变量，与条件于它们的父母变量类似，会扭曲$X$和$Y$之间因果关系的传递。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gfbflil0iqj30fu0fst9b.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 1.1</b> A graphical model<sup><a href="#footnote-1">1</a></sup></div>
</center>

现在我们来看一个具体的例子，如图1.2所示。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gfbgtdmuiwj30i00e2js1.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 1.2</b> A graphical model<sup><a href="#footnote-2">2</a></sup></div>
</center>

这里我们试图衡量$X$（药物）对$Y$（康复）的影响。我们同样测量会对康复有影响的变量$W$（体重）。此外，我们还知道$Z$（社会经济地位）会影响$X$和$W,$ 但在此研究中，我们没有记录$Z$的信息。

我们寻找一个从$X$到$Y$的符合后门准则的观测变量。不难发现，$W$不是$X$的后代变量，并且阻塞后门路径$X \leftarrow Z \rightarrow W \rightarrow Y.$ 因此$W$符合后门准则。只要因果关系符合图1.2，对$W$进行调整就可以得到$X$对$Y$的因果关系。利用调整公式，我们有$$P(Y=y|do(X=x))=\sum_wP(Y=y|X=x, W=w)P(W=w)$$ 只要我们能观测到$W,$ 这个值就可以从数据中估算。

现在来考虑一个之前提到的例子。我们依旧是希望探讨$X$对$Y$的因果关系。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1geriiox8boj30hg0hgwfg.jpg
" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 1.3</b> A graphical model<sup><a href="#footnote-3">3</a></sup></div>
</center>

这个看似复杂的例子反而是简单的。因为在这个例子中，在$X$到$Y$之间不存在后门路径，所以我们不需要做任何调整也因此$$P(y|do(x))=P(y|x)$$

但假设我们要对$W$进行调整，因为$W$是一个collider，所以条件于$W$会打开伪路径$X \rightarrow W \leftarrow Z \leftarrow T \rightarrow Y.$ 计算$W$的每一个值的$X$和$Y$之间的关系，将不能得到$X$对$Y$的正确影响，甚至可能对$W$的每个值都会产生错误的影响。

那么对于$W=w,$ 我们应该如何计算$X$对$Y$的因果效应呢？比如说，$W$可能代表患者治疗后的疼痛程度，我们可能只对评估那些没有遭受任何疼痛的患者中$X$对$Y$的影响感兴趣。指定$W$的值相当于给定条件$W=w,$ 而这正如我们前面分的一样，由于$W$是一个collider，我们生成了一条新的伪路径。

答案是，我们仍然可以选择使用其它变量来阻塞这条路径。比如说，我们以$T$为条件，就会堵住伪路径$X \rightarrow W \leftarrow Z \leftarrow T \rightarrow Y.$ 因此为了计算具体的$w$下的因果效应，$P(y|do(x), w),$ 我们可以调整$T$得到$$P(Y=y|do(X=x), W=w)=\sum_t P(Y=y|X=x, W=w, T=t)P(T=t|X=x, W=w)$$

计算这种具体$W$下的因果效应是考察效应修正（Effect Modification）或调节（Moderation）的重要步骤，即$X$对$Y$的因果效应在多大程度上被不同的$W$值所修正。

我们回到图1.2的例子。假设我们想测试在$W=w$下的因果效应是否等于在$W=w'$下的因果效应（$W$可以代表任何预处理变量（Pretreatment Variable），如年龄、形变、种族等）。也即比较$$P(y|do(x), w)\ \text{and}\ P(y|do(x), w')$$

因为$W$满足后门准则，所以我们只需要比较$P(y|x, w)$和$P(y|x, w').$ 在更一般的情况下，当$W$本身不满足后门准则，但一个更大集$T \cup W$满足时，我们需要对$T$进行调整，而公式也同样是$$P(y|do(x), w)=\sum_t P(y|x, w, t)P(t|w)$$

但有的时候，我们不得不对collider进行调整。我们来考虑一个模型：

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gfdgaz4w3zj30nw0bygm9.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 1.4</b> A graphical model<sup><a href="#footnote-4">4</a></sup></div>
</center>

从$X$到$Y$一共有四条后门路径，并且都经过$Z.$ 条件于$Z$将解除对该路径的封锁，并且违背后门准则。为了阻塞所有后门路径，我们需要条件于其中一个集$\lbrace E, Z \rbrace, \lbrace A, Z \rbrace$或$\lbrace E, Z, A \rbrace.$ 因此，我们必须要调整collider $Z.$

后门准则还有一些可能的好处。考虑$P(y|do(x))$是一个经验性的事实，我们调整任何合适的变量，无论是$PA(X)$还是符合后门准则的任何其它集，都必须返回与$P(y|do(x))$一样的结果。回到图1.2的例子，我们有$$\sum_w P(y|x, w)P(w)=\sum_z P(y|x, z)P(z)$$

这一等式有两个好处。第一，在我们有多组适合调整的观测变量的情况下，它为我们提供变量调整的选择。第二，当所有调整变量被观测到时，等式组成了对数据的可检验约束，这与d-separation的规则很像。如果我们在数据中拟合数据时违反了这一等式，那么我们可以放弃这个模型。

# 2. 前门准则（The Front-Door Criterion）
***

在1960年代后期，烟草业为了阻止反吸烟立法，宣扬一种理论：他们认为吸烟与肺癌之间的关系可能是由某种致癌基因型引起的，而这种基因型也会诱发对尼古丁的自然渴望，这个模型如图2.1(a)所示。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gfdinqvop9j31a80ce0u6.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 2.1</b> A graphical model<sup><a href="#footnote-5">5</a></sup></div>
</center>

这个模型不满足后门准则，因为$U$是未观测的也因此不能用来阻塞从$X$到$Y$的后门路径。在这个模型中，吸烟对肺炎的因果效应无法确定，人们永远无法确定观察到的$X$和$Y$之间的相关性中，哪一部分是虚假的，可归因于它们的共同效应$U,$ 哪一部分是真正的因果关系。

然而我们可以进一步考虑图2.1(b)中的模型，这里有一个额外的测量：患者肺部的焦油沉积量。这个模型仍然不满足后门准则，因为仍然没有一个变量能够阻塞伪路径$X \leftarrow U \rightarrow Y.$ 然而我们看到，通过连续两次应用后门准则，这个模型中的因果效应$P(y|do(x))$还是可以识别的。

首先，我们注意到$X$对$Z$的影响是可识别的，因为从$X$到$Z$不存在后门路径，因此我们有$$P(z|do(x))=P(z|x)$$

其次，我们注意到$Z$对$Y$的影响也是可识别的，因为从$Z$到$Y$的后门路径$Z \leftarrow X \leftarrow U \rightarrow Y$可以被条件于$X$时阻塞，因此<sup><a href="#footnote-6">[1]</a></sup>$$P(y|do(z))=\sum_x P(y|z, x)P(x)$$

现在我们将两个局部效应串联起来，得到$X$对$Y$的整体效应。如果自然选择给$Z$赋值$z,$ 那么$Y$的概率为$P(y|do(z)).$ 考虑到我们选择将$X$设为$x,$ 那么自然将选择这样做的概率是$P(z|do(x)).$ 因此将$Z$的所有状态$z$相加，我们有$$P(y|do(x))=\sum_z P(y|do(z))P(z|do(x))$$

综合上述式子，我们有$$P(y|do(x))=\sum_z\sum_{x'} P(y|z, x')P(x')p(z|x)$$又称作前门公式（Front-Door Formula）。

**定义**（前门准则）&nbsp;&nbsp;&nbsp; 一组变量$Z$相对于一对有序变量$(X, Y)$而言，如果有以下情况，则称其满足前门标准：

1. $Z$切断了从$X$到$Y$的所有定向路径。
1. $X$到$Z$没有后门路径。
1. 所有从$Z$到$Y$的后门路径都被$X$阻塞。

**定理**（前门调整）&nbsp;&nbsp;&nbsp; 如果$Z$相对于$(X, Y)$满足前门准则，且$P(x, z)>0,$ 那么$X$对$Y$的因果效应是可识别的$$P(y|do(x))=\sum_z P(z|x)\sum_{x'}P(y|x', z)P(x')$$

在定义中叙述的条件过于保守，实际上，被条件2与3所排除的一些后门路径只要能被一些变量阻塞，是被允许的。

最后，我们再回到吸烟与肺癌的问题。我们关心吸烟$X$和肺癌$Y$之间的因果关系，由于一个潜在的不可观测的基因$U$存在，$X$和$Y$之间有一条后门路径。因此不借助其它条件，我们无法识别吸烟与肺癌的因果关系。如果我们知道：$X$仅仅通过肺部焦油沉积量$Z$来影响$Y,$ 那么$X$对$Y$的因果关系就可以估计出来了。但这里需要两个条件：一是$X$与$Z$没有后门路径，二是$X$对$Y$的作用仅仅来源于$X$对$Z$的作用，或者说$X$对$Y$没有直接作用。


# Notes
***

<p id="footnote-6">[1] 原文应有笔误。</p>

# Reference
***

<p id="footnote-1">1. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 44.
<p id="footnote-2">2. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 62.
<p id="footnote-3">3. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 48.
<p id="footnote-4">4. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 63.
<p id="footnote-5">5. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 66.