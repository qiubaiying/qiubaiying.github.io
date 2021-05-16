---

layout:     post
title:      因果推断｜干预影响（一）
subtitle:   
date:       2020-05-24
author:     Derek
header-img: img/post-sta.jpg
catalog: true
tags:
    - 因果推断
    
---

# 1. 干预（Intervention）
***

在统计课上，我们反复强调相关性不能等同于因果性，仅仅是两个变量之间的联系并不一定意味着其中一个变量导致另一个变量。一个经典的例子是冰淇淋的销量与犯罪率成正相关，但不是因为冰淇淋导致犯罪，而是因为在夏天里，冰淇淋和犯罪都更常见。也因此，随机对照试验（Randomized Controlled Experiment）被认为是统计学中的黄金准则。然而很多问题还是无法使用随机对照试验，比如我们无法控制天气等等。所以研究者转而进行观察性研究（Observational Study），他们只是记录数据，而不是控制数据。但是，我们就无法区分相关性和因果性。

下面我们将举一个干预的例子。

**例**&nbsp;&nbsp;&nbsp; 考虑以下模型：
<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gesp3xv8zfj30e60e4q3c.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 1.1</b> A graphical model<sup><a href="#footnote-1">1</a></sup></div>
</center>

其中我们可以假设$X$是冰淇淋的销量，$Y$是犯罪率，$Z$是温度。当我们进行干预以确定变量的值时，我们需要减少该变量随其他自然变量变化的自然趋势，这就相当于我们要将图模型中所有指向这一变量的边删除。假如我们要干预冰淇淋的销量，也即让冰淇淋的销量非常低，我们将会得到：

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gesplhqc8aj30e60e474l.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 1.2</b> A graphical model<sup><a href="#footnote-1">1</a></sup></div>
</center>

当我们在新模型中检验相关性时，我们发现犯罪率与冰淇淋的销量是独立的（不相关的），因为冰淇淋的销量与温度再也不相关了。换言之，即使我们改变了保持$X$不变的水平，这个变化也不会传递到$Y.$

在这里我们要做一些区分。如果我们写$P(Y=y|X=x),$ 那么这是一个条件于$X$的关于$Y$的概率，如果我们写$P(Y=y|do(X=x)),$ 那么在干预了$X$以后关于$Y$的概率。用分布的术语来说，$P(Y=y|X=x)$反映了$Y$在$X=x$时的个体之间的总体分布。另一方面$P(Y=y|do(X=x))$表示如果所有人的$X$都固定在$x$时$Y$的总体分布。同理，如果我们写$P(Y=y|do(X=x), Z=z),$ 那么这是一个条件于$Z$和干预了$X$以后关于$Y$的概率。

接下来，我们将会归纳可以从观察数据中梳理出因果信息的方法。

# 2. 调整公式（Adjustment Formula）
***

现在我们来看一个更复杂但更具有现实意义的图模型：

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gesqaqsl79j30e40e60t4.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 2.1</b> A graphical model<sup><a href="#footnote-2">2</a></sup></div>
</center>

其中我们可以假设$X$是是否使用药物，$Y$是是否康复，$Z$是性别。如果我们要探究$X$对$Y$的影响，也即药物的效果，我们可以设想一个干预措施，让所有人使用药物，并将康复率与补充干预措施（阻止所有人使用药物）下的康复率进行比较。我们的任务是估算$$P(Y=1|do(X=1))-P(Y=1|do(X=0)),$$ 这一式子又叫做因果效应差（Causal Effect Difference）或平均因果效应（Average Causal Effect, ACE）。然而在一般情况下，$X$和$Y$可以取更多的值，我们希望能预测一般情况下的因果效应$P(Y=y|do(X=x)).$

我们在学习Simpson's paradox的时候知道，数据本身不足以确定因果关系。但是有了图模型的帮助，我们可以根据这些数据计算出因果效应的大小。因果效应$P(Y=y|do(X=x))$等于被操纵模型中的条件概率$P_m(Y=y|X=x).$ 

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1geu18ca57rj30fi0fkmxl.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 2.2</b> A graphical model<sup><a href="#footnote-3">3</a></sup></div>
</center>

计算因果效应的关键在于观察到被操纵的概率$P_m$，与在被干预之前的原始概率$P$有两个共同的特点。第一，边际分布$P(Z=z)$在干预下仍旧不变，这是因为确定$Z$的过程不受去掉$Z$到$X$的箭头影响。在这个例子中，意味着男女性别比例在干预前后不变。第二，条件概率$P(Y=y|Z=z, X=x)$仍旧不变，这是因为不管$X$是自发改变或是被干预的，$Y$对$X$和$Z$作出反应的过程保持不变。因此我们有$$P_m(Y=y|Z=z, X=x)=P(Y=y|Z=z, X=x), P_m(Z=z)=P(Z=z).$$ 在被干预模型中，我们又可以得到$Z$和$X$是d-separated的，因此$P_m(Z=z|X=x)=P_m(Z=z)=P(Z=z).$ 所以，我们有
<body>
<p>
$$\begin{aligned}
P(Y=y|do(X=x))&=P_m(Y=y|X=x)
\\&=\sum_zP_m(Y=y|X=x, Z=z)P_m(Z=z|X=x)
\\&=\sum_zP_m(Y=y|X=x, Z=z)P_m(Z=z)
\\&=\sum_zP(Y=y|X=x, Z=z)P(Z=z)
\end{aligned}$$
</p>
</body>

我们称$$P(Y=y|do(X=x))=\sum_zP(Y=y|X=x, Z=z)P(Z=z)$$为调整公式（Adjustment Formula），它计算了每一个$Z$值下的$X$和$Y$的关系，并求它们的均值，这一过程又叫做对$Z$进行调整或者对$Z$进行控制。公式的右边可以直接从数据中估计，因为它只由条件概率组成。另外，在随机对照做实验中，我们不需要进行任何调整，因为数据是由已经具备了图2.2的结构，因此不考虑任何影响$Y$的因素$Z,$ 我们有$P_m=P.$ 在实践中，研究者在随机实验中也会使用调整，目的是最大限度地减少抽样差异（Sampling Variation）。

我们考虑以下数据，并让$X=1$表示患者服药，$Z=1$表示患者为男性，$Y=1$表示患者痊愈。

<center>
<table frame="void">
  <tbody>
    <tr>
      <td align="center"></td>
      <td align="center"><b>Drug</b></td>
      <td align="center"><b>No drug</b></td>
    </tr>
    <tr>
      <td align="center"><b>Men</b></td>
      <td align="center">$81$ out of $87$ recovered ($93\%$)</td>
      <td align="center">$234$ out of $270$ recovered ($87\%$)</td>
    </tr>
    <tr>
      <td align="center"><b>Women</b></td>
      <td align="center">$192$ out of $263$ recovered ($73\%$)</td>
      <td align="center">$55$ out of $80$ recovered ($69\%$)</td>
    </tr>
    <tr>
      <td align="center"><b>Combined data</b></td>
      <td align="center">$273$ out of $350$ recovered ($78\%$)</td>
      <td align="center">$289$ out of $350$ recovered ($83\%$)</td>
    </tr>
  </tbody>
</table>
</center>

我们有
<body>
<p>
$$\begin{aligned}P(Y=1|do(X=1))&=P(Y=1|X=1, Z=1)P(Z=1)+P(Y=1|X=1, Z=0)P(Z=0)
\\&=0.93 \times \frac{87+270}{700}+0.73 \times \frac{263+80}{700}=0.832
\end{aligned}$$
</p>
</body>以及$$P(Y=1|do(X=0))=0.7818$$ 因此$$\text{ACE}=0.0502$$ 也意味着服药是有好处的。

我们再来看一个模型，并估算因果关系$P(Y=1|do(X=1)).$

<center>
    <img style="rgba(34,36,38,.08)"
    src="
https://tva1.sinaimg.cn/large/007S8ZIlgy1gexbilevhtj30da08yaa8.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 2.3</b> A graphical model<sup><a href="#footnote-3">3</a></sup></div>
</center>

我们容易得到$$P(Y=y|do(X=x))=P(Y=y|X=x)$$因为当我们对模型进行干预时，没有变量指向$X,$ 也即我们不需要对原模型进行任何修改。

## 2.1 调整还是不调整，这是一个问题
***
根据上述的两个例子，我们需要更一般的公式来概括调整公式。

**定理**（因果效应规则）&nbsp;&nbsp;&nbsp; 令$X$的父母变量为$PA(X),$ $X$对$Y$的因果效应为
<body>
<p>
$$\begin{aligned}
P(Y=y|do(X=x))=P(y|do(x))&=\sum_zP(Y=y|X=x, PA=z)P(PA=z)
\\&=\sum_z\frac{P(X=x, Y=y, PA=z)}{P(X=x|PA=z)}
\end{aligned}$$
</p>
</body>
其中$z$的范围包括了$PA$中的变量可以取的所有值的组合，我们称$P(X=x|PA=z)$为倾向评分（Propensity Score）。

## 2.2 多重干预和截断乘积法则
***

根据链式法则，干预前分布（图2.1）为$$P(x, y, z)=P(z)P(x|z)P(y|x, z)$$而干预后分布（图2.2）则为$$P(z, y|do(x))=P_m(z)P_m(y|x, z)=P(z)P(y|x, z)$$结合这两个式子，我们可以得到一个关于干预前后分布的简单关系$$P(z, y|do(x))=\frac{P(x, y, z)}{P(x|z)}$$

更一般的，我们如果需要干预一组变量$X,$ 则$$P(x_1, x_2, \cdots, x_n|do(x))=\prod_i P(x_i|pa_i)\ \text{for all}\ i\ \text{with}\ X_i\ \text{not in}\ X$$这一公式又被称为截断乘积法则（Truncated Product Formula）。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gf48vj5ac0j30ds0aagm4.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 2.4</b> A graphical model<sup><a href="#footnote-4">4</a></sup></div>
</center>

如图2.4所示，假设我们要干预$X$和$Z_3,$ 那么干预后分布则为$$P(z_1, z_2, w, y|do(x, z_3))=P(z_1)P(z_2)P(w|x)P(y|w, z_2, z_3)$$

# Reference
***
<p id="footnote-1">1. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 54.
<p id="footnote-2">2. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 55.
<p id="footnote-3">3. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 58.
<p id="footnote-4">4. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 49.