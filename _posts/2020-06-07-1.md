---

layout:     post
title:      因果推断｜干预影响（三）
subtitle:   
date:       2020-06-07
author:     Derek
header-img: img/post-sta.jpg
catalog: true
tags:
    - 因果推断
    
---

# 1. 条件干预（Conditional Intervention）与具体的协变量效应（Covariate-Specific Effect）
***

在此之前，我们考虑的干预只限于赋于特定值$x$的变量$X.$ 一般来说，干预会涉及动态政策，在这些政策中$X$以特定的方式对其它变量$Z$作出反应，例如通过函数关系$x=g(z)$或通过随机关系，其中$X$被赋值$x,$ 其概率为$P^*(x|z).$ 例如，假设一个医生决定只给体温$Z$超过一定水平$Z=z$的病人用药。在这种情况下，行动讲以$Z$的值为条件，可以写成$do(X=g(Z)),$ 其中当$Z>z$时，$g(Z)=1,$ 否则为$0.$ 由于$Z$是一个随机变量，所以$X$同样是一个跟踪$Z$变化的随机变量。我们可以写成$P(Y=y|do(X=g(Z))),$ 它只取决于函数$g$和驱动$X$的变量$Z.$

为了估计这种政策的效果，我们再来看另外一个概念，关于$X$的具体$z$效应（$z$-Specific Effect of $X$）。这个效应写作$P(Y=y|do(X=x), Z=z),$ 衡量$Z$在干预后达到$z$的值后，$Y$在总体子集中的分布。例如，我们可能感兴趣治疗对特定年龄组$Z=z$或者具有特定特征的人$Z=z$的影响，而这些特征可能在治疗后被测量。

$Z$的具体效应可以通过类似后门调整的过程来确定。当我们的目标是估计$P(Y=y|do(X=x))$时，如果$S$阻塞了从$X$到$Y$的所有后门路径，那么对$S$的调整是合理的。现在，我们希望确定$P(Y=y|do(X=x), Z=z),$ 我们需要确保当我们添加新变量$Z$到条件集中时，这些路径仍然被阻塞。

**定理**&nbsp;&nbsp;&nbsp; 只要我们可以测量一组变量$S$使$S \cup Z$满足后门准则，$z$的具体效应$P(Y=y|do(X=x), Z=z)$就可以被确定。$z$的具体效应可以由调整公式给出$$P(Y=y|do(X=x), Z=z)=\sum_s P(Y=y|X=x, S=s, Z=z)P(S=s|Z=z)$$ 

这一公式与$P(Y=y|do(X=x))=\sum\limits_z P(Y=y|X=x, Z=z)P(Z=z)$很类似，除了两点。一是，调整集是$S \cup Z,$ 而非$S.$ 二是，公式以$S$求和，而不包括$Z.$ 另外如果$Z \subseteq S,$ 那么$S \cup Z=S,$ 而根据定理$S$需要满足后门准则。

注意，特定$z$的效应的可识别性标准比非特定效应的标准要更严格一点。在条件集中添加$Z$可能会造成非独立性，从而使后门路径无法阻塞。比如说当$Z$是一个collider时，条件于$Z$会导致$Z$的父母变量失去独立性，从而违反了后门准则。

现在我们可以处理如何估计条件干预的问题。假设一个政策制定者考虑了一个与年龄相关的政策：根据患者的年龄$Z$向患者施用一定量的药物$x,$ 写成$do(X=g(Z)).$ 为了找出这个政策所产生的结果$Y$的分布，我们试图估计$P(Y=y|do(X=x), Z=z).$ 为了计算$P(Y=y|do(X=g(Z))),$ 我们条件于$Z=z,$ 并得到

<body>
<p>
$$\begin{aligned}
&\ \ \ \ \ \ P(Y=y|do(X=g(Z)))
\\&=\sum_z P(Y=y|do(X=g(Z)), Z=z)P(Z=z|do(X=g(Z)))
\\&=\sum_z P(Y=y|do(X=g(z)), Z=z)P(Z=z)
\end{aligned}$$
</p>
</body>

其中$P(Z=z|do(X=g(Z)))=P(Z=z)$是因为$Z$在$X$之前发生，因此对$X$施加任何控制都不会对$Z$的分布产生影响。我们也可以写成$$\sum_z P(Y=y|do(X=g(z)), Z=z)P(Z=z)=\sum_z P(Y=y|do(X=x), Z=z)|_{x=g(x)}P(Z=z)$$等式右侧告诉我们条件政策的因果效应$do(X=g(Z))$可以直接从$P(Y=y|do(X=x), Z=z)$中估算，只需要将$g(z)$代入$x$并利用观察到的分布$P(Z=z)$取$Z$的期望值。

# 2. 逆概率加权（Inverse Probability Weighing）
***

后门和前门准则告诉我们是否可以从观察性研究中获得的数据来预测干预措施的效果。此外，它们还告诉我们可以在不模拟甚至不考虑干预措施的情况下进行预测。我们需要做的就是确定一组满足其中一个标准的协变量$Z,$ 将这组变量插入调整公式中。得到的表达式可以保证提供一个关于干预如何影响结果的有效预测。

但在实践中，对$Z$的调整可能会有问题。它需要分别观察$Z$的每个值或值的组合，估计在该层中$Y$条件于$X$的概率，然后对结果进行平均。随着层数的增加，对$Z$的调整将遇到计算和估计上的困难。由于集合$Z$可以由几十个变量构成，每个变量都有几十个离散值，因此调整公式所需要的求和可能是巨大的，而且落在每个$Z=z$单元内的数据样本量可能太少，而无法提供有关条件概率的可靠估计。

我们将讨论一种可以规避这个问题的方法，前提是我们可以得到每个$x$和$z$的函数$g(x, z)=P(X=x|Z=z)$（通常称为倾向得分）的可靠估计，这种估计值可以通过拟合弹性函数$g(x, z)$的参数得到，所用的方法取决于随机变量$X$的性质，比如它是连续的、离散的或者二进制的。

假设我们可以得到函数$P(X=x|Z=z),$ 我们可以用它来生成人工样本，就像是从干预后的概率$P_m$中抽取的，而不是$P(x, y, z).$ 一旦我们获得了这个人工样本，我们就可以通过计算样本中每层$X=x$的事件$Y=y$的频率来估计$P(Y=y|do(x)).$ 通过这种方式，我们跳过了对$Z=z$进行相加。

我们将条件描述为一个过滤的过程，即忽略了所有条件$X=x$不成立的情况，并将剩余情况归一化，使它们的总概率加起来为$1.$ 这个操作的结果是每个剩余情况的概率被提升一个系数$\frac{1}{P(X=x)},$ 这可以直接从贝叶斯定理中得出$$P(Y=y, Z=z|X=x)=\frac{P(Y=y, Z=z, X=x)}{P(X=x)}$$

现在我们研究由$do(X=x)$算子所创造的总体。调整公式为$$P(y|do(x))=\sum_z P(Y=y|X=x, Z=z)P(Z=z)$$ 将和里面的表达式乘以再除以倾向性得分$P(X=x|Z=z),$ 我们有$$P(y|do(x))=\sum_z\frac{P(Y=y|X=x, Z=z)P(X=x|Z=z)P(Z=z)}{P(X=x|Z=z)}$$ 而分子正是$(X, Y, Z)$的预处理分布，因此$$P(y|do(x))=\sum_z\frac{P(Y=y, X=x, Z=z)}{P(X=x|Z=z)}$$ 因此总体中的每一种情况$(Y=y, X=x, Z=z)$都应该将其概率提高一个系数$\frac{1}{P(X=x|Z=z)},$ 所以也叫做逆概率加权。

当我们有有限的样本时，我们有了一个简单的方法去估计$P(Y=y|do(X=x)).$ 如果我们对每一个可用的样本进行一个系数$\frac{1}{P(X=x|Z=z)}$的加权，那么我们可以把重新加权后的样本当作是由$P_m$而不是$P$产生的，并据此继续估计$P(Y=y|do(x)).$

现在我们来考虑一个例子（表2.1），其中$X$表示患者是否服药，$Y$表示患者是否痊愈，$Z$表示患者的性别。

<center>
<div style="display: inline-block; color: #000; padding: 0px;"><b>Table 2.1</b> Joint probability distribution $P(X, Y, Z)$ for the drug-gender-recovery<sup><a href="#footnote-1">1</a></sup></div>
<table frame="void">
  <tbody>
    <tr>
      <td align="center">$X$</td>
      <td align="center"><b>$Y$</b></td>
      <td align="center"><b>$Z$</b></td>
      <td align="center"><b>% of population</b></td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">Yes</td>
      <td align="center">Male</td>
      <td align="center">0.116</td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">Yes</td>
      <td align="center">Female</td>
      <td align="center">0.274</td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">No</td>
      <td align="center">Male</td>
      <td align="center">0.009</td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">No</td>
      <td align="center">Female</td>
      <td align="center">0.101</td>
    </tr>
    <tr>
      <td align="center">No</td>
      <td align="center">Yes</td>
      <td align="center">Male</td>
      <td align="center">0.334</td>
    </tr>
    <tr>
      <td align="center">No</td>
      <td align="center">Yes</td>
      <td align="center">Female</td>
      <td align="center">0.079</td>
    </tr>
    <tr>
      <td align="center">No</td>
      <td align="center">No</td>
      <td align="center">Male</td>
      <td align="center">0.051</td>
    </tr>
    <tr>
      <td align="center">No</td>
      <td align="center">No</td>
      <td align="center">Female</td>
      <td align="center">0.036</td>
    </tr>
   </tbody>
</table>
</center>

如果我们设置条件$X=\text{Yes},$ 我们可以得到表2.2。根据贝叶斯定理，我们需要乘以系数$\frac{1}{P(X=\text{Yes})},$ 并且$$P(X=\text{Yes})=0.116+0.274+0.009+0.101=0.5$$

<center>
<div style="display: inline-block; color: #000; padding: 0px;"><b>Table 2.2</b> Conditional probability distribution $P(Y, Z|X)$ for drug users in the population</div>
<table frame="void">
  <tbody>
    <tr>
      <td align="center">$X$</td>
      <td align="center"><b>$Y$</b></td>
      <td align="center"><b>$Z$</b></td>
      <td align="center"><b>% of population</b></td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">Yes</td>
      <td align="center">Male</td>
      <td align="center">0.232</td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">Yes</td>
      <td align="center">Female</td>
      <td align="center">0.548</td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">No</td>
      <td align="center">Male</td>
      <td align="center">0.018</td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">No</td>
      <td align="center">Female</td>
      <td align="center">0.202</td>
    </tr>
   </tbody>
</table>
</center>

现在我们研究$do(X=\text{Yes})$算子所创造的总体，代表对相同的总体施用药物。为了计算这个总体的权重分布，我们需要计算每个$z$的系数$P(X=\text{Yes}|Z=z):$

<body>
<p>
$$
\begin{aligned}
P(X=\text{Yes}|Z=\text{Male})&=\frac{0.116+0.009}{0.116+0.009+0.334+0.051} \approx 0.245
\\ P(X=\text{Yes}|Z=\text{Female})&=\frac{0.274+0.101}{0.274+0.101+0.079+0.036} \approx 0.765
\end{aligned}
$$
</p>
</body>

乘以相应的系数，我们得到表2.3（代表干预后的总体分布情况）

<center>
<div style="display: inline-block; color: #000; padding: 0px;"><b>Table 2.3</b> Probability distribution for the population of Table 2.1 under the <br>intervention $do(X=\text{Yes}),$ determined via the inverse probability method</div>
<table frame="void">
  <tbody>
    <tr>
      <td align="center">$X$</td>
      <td align="center"><b>$Y$</b></td>
      <td align="center"><b>$Z$</b></td>
      <td align="center"><b>% of population</b></td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">Yes</td>
      <td align="center">Male</td>
      <td align="center">0.473</td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">Yes</td>
      <td align="center">Female</td>
      <td align="center">0.358</td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">No</td>
      <td align="center">Male</td>
      <td align="center">0.037</td>
    </tr>
    <tr>
      <td align="center">Yes</td>
      <td align="center">No</td>
      <td align="center">Female</td>
      <td align="center">0.132</td>
    </tr>
   </tbody>
</table>
</center>

现在我们可以直接从数据中计算出这个分布下康复的概率$$P(Y=\text{Yes}|do(X=\text{Yes}))=0.473+0.358=0.831$$

在这个过程中我们要注意三点。首先，权重的重新分配不再是按比例分配，而是具有判别性。比如第一行的权重从0.116提升至0.473，系数为4.1，而第二行的权重从0.274提升到0.358，系数为1.3。这种重新分布使$X$与$Z$独立，就像随机实验一样。

第二，这个例子没有体现计算量的节省。为了估计$P(Y=\text{Yes}|do(X=\text{Yes})),$ 我们仍然需要对$Z$的所有值（男性与女性）进行求和。事实上，当$Z$的值的数量是几千或几百万，而样本量是几百个时，计算量的节省将会变得显著。

第三，只有当进入因子$\frac{1}{P(X=x|Z=z)}$的集合$Z$满足后门准则时，逆概率加权法才是有效的。



# Reference
***

<p id="footnote-1">1. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 73.