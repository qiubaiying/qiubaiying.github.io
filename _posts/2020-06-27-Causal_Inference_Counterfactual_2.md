---

layout:     post
title:      因果推断｜反事实（二）
subtitle:   
date:       2020-06-27
author:     Derek
header-img: img/post-sta.jpg
catalog: true
tags:
    - 因果推断
    
---

# 非确定性的反事实

## 1. 反事实的概率
***

假设模型

<body>
<p>
$$\begin{aligned}
X&=aU
\\ Y&=bX+U
\end{aligned}$$
</p>
</body>

为了研究非确定性如何反映在反事实的计算中，我们给模型中$U$的值赋予概率，假设$U=\lbrace 1, 2, 3 \rbrace$代表总体中的三种类型的个体，发生的概率为$$P(U=1)=\frac{1}{2}, P(U=2)=\frac{1}{3}, P(U=3)=\frac{1}{6}$$

一个总体类型内的所有个体都具有相同的反事实值，如表1.1所示。

<center>
<div style="display: inline-block; color: #000; padding: 0px;"><b>Table 1.1</b> The values attained by $X(u), Y(u), Y_x(u),$ and $X_y(u)$ in the linear model</div>
<table frame="void">
  <tbody>
    <tr>
      <td align="center"><b>$u$</b></td>
      <td align="center"><b>$X(u)$</b></td>
      <td align="center"><b>$Y(u)$</b></td>
      <td align="center"><b>$Y_1(u)$</b></td>
      <td align="center"><b>$Y_2(u)$</b></td>
      <td align="center"><b>$Y_3(u)$</b></td>
      <td align="center"><b>$X_1(u)$</b></td>
      <td align="center"><b>$X_2(u)$</b></td>
      <td align="center"><b>$X_3(u)$</b></td>
    </tr>
    <tr>
      <td align="center">$1$</td>
      <td align="center">$1$</td>
      <td align="center">$2$</td>
      <td align="center">$2$</td>
      <td align="center">$3$</td>
      <td align="center">$4$</td>
      <td align="center">$1$</td>
      <td align="center">$1$</td>
      <td align="center">$1$</td>
    </tr>
    <tr>
      <td align="center">$2$</td>
      <td align="center">$2$</td>
      <td align="center">$4$</td>
      <td align="center">$3$</td>
      <td align="center">$4$</td>
      <td align="center">$5$</td>
      <td align="center">$2$</td>
      <td align="center">$2$</td>
      <td align="center">$2$</td>
    </tr>
    <tr>
      <td align="center">$3$</td>
      <td align="center">$3$</td>
      <td align="center">$6$</td>
      <td align="center">$4$</td>
      <td align="center">$5$</td>
      <td align="center">$6$</td>
      <td align="center">$3$</td>
      <td align="center">$3$</td>
      <td align="center">$3$</td>
    </tr>
   </tbody>
</table>
</center>

有了这些值，我们就可以计算出反事实满足指定条件的概率。例如，我们可以计算出如果$X=2, Y=3$的概率，或者$Y_2(u)=3.$ 由于它是$U=1$的属性，所以它将以$\frac{1}{2}$的概率出现，得到$P(Y_2=3)=\frac{1}{2}.$ 我们同样可以计算任何反事实陈述的概率。例如，$P(Y_1=4)=\frac{1}{6}, P(Y_1=3)=\frac{1}{3}, P(Y_2>3)=\frac{1}{2}$等等。我们还可以计算反事实和可观测事件的每一个组合的联合概率。例如，$P(Y_2>3, Y_1<4)=\frac{1}{3}, P(Y_1<Y_2)=1$等等。再比如，$P(Y_3>Y|Y>2)=\frac{1/3}{1/2}=\frac{2}{3}.$ 或者说我们可以验证$Y_{x+1}-Y_x$独立于$x,$ 这意味着$X$对$Y$的因果效应在不同的总体类型中没有变化 - 这是所有线性模型共有的属性。

然而它们不能用$do$算子来表示，因为这只提供了每个干预$X=x$的一个概率。为了了解这种限制的后果，让我们改写一下这个模型，而$Z$是作为$X$和$Y$之间的中介模型

<body>
<p>
$$\begin{aligned}
X&=U_1
\\ Z&=aX+U_2
\\ Y&=bZ
\end{aligned}$$
</p>
</body>

其结构如图1.1所示。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gg1oipfxlmj30gg09cwf0.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 1.1</b> A graphical model<sup><a href="#footnote-1">1</a></sup></div>
</center>

假如我们想计算$\mathbb{E}[Y_{X=1}|Z=1],$ 代表在技能水平$Z=1$的情况下，如果接受过大学教育，个人的预期工资会是多少。这个量不能用$do$算子计算，因为条件$Z=1$和前提$X=1$指的是两个不同的“世界”，前者代表当前的技能，而后者代表未实现的过去的假想教育水平。试图使用$\mathbb{E}[Y|do(X=1), Z=1]$来计算假设工资将无法解释所需的信息。$do$算子代表的是那些全部完成大学学业并在此后获得技能水平$Z=1$的个体的预期工资。如图所示，这些人的工资***只***取决于他们的技能，而不受他们是通过大学还是通过工作经验获得技能的影响。在这种情况下，以$Z=1$为条件，切断了我们感兴趣的干预效果。相反，目前$Z=1$的人中，有些人可能没有上过大学，如果他们接受了大学教育，会获得更高的技能（和薪水）。我们对他们的工资感兴趣，但他们没有被包含在$do$算子中。因此在一般情况下，$do$算子不会帮我们抓住反事实问题$$\mathbb{E}[Y|do(X=1), Z=1] \neq \mathbb{E}[Y_{X=1}|Z=1]$$

注意到在这个模型中，虽然$\mathbb{E}[Y|do(X=1), Z=1]=\mathbb{E}[Y|do(X=0), Z=1],$ 但$\mathbb{E}[Y_{X=1}|Z=1]\neq\mathbb{E}[Y_{X=0}|Z=1].$ 前者将$Z=1$视为干预后的条件，该条件在两个前提下对两组不同的单位都有效，而后者则将其视为定义了当前“世界”中的一组单位，这些单位在两个前提下会有不同的反应，而$do$算子无法捕捉到后者，因为$\mathbb{E}[Y_{X=1}|Z=1]$中的事件$X=1$和$Z=1$分别指干预前和干预后两个不同的“世界”。而$\mathbb{E}[Y|do(X=1), Z=1]$则指干预后的事件。

然而，由于反事实符号的灵活性，它既可以捕捉单一“世界”的概率，也可以捕捉非单一“世界”的概率。$\mathbb{E}[Y|do(X=1), Z=1]$可以写成$\mathbb{E}[Y_{X=1}|Z_{X=1}=1],$ 它明确地将事件$Z=1$指定为干预后。变量$Z_{X=1}$代表的是如果$X=1, Z$将达到的值，这正是我们按照贝叶斯定理得到的$$P(Y=y|do(X=1), Z=z)=\frac{P(Y=y, Z=z|do(X=1))}{P(Z=z|do(X=1))}$$

这就明确地表明了应该如何处理$Z$对$X$的非独立性。在$Z$是干预前变量的特殊情况下，我们有$Z_{X=1}=Z.$

表1.2描述了与模型相关的反事实，所有的下标都表示$X$的状态。它的构造方法与我们构造表1.1的方法相同：用常数代替$X=u,$ 然后求解$Y$和$Z.$

<center>
<div style="display: inline-block; color: #000; padding: 0px;"><b>Table 1.2</b> The values attained by $X(u), Y(u), Z(u), Y_0(u), Y_1(u), Z_0(u)$ and $Z_1(u)$ in the linear model</div>
<table frame="void">
  <tbody>
    <tr>
      <td colspan="9"><center>$X=u_1, Z=aX+u_2, Y=bZ$</center>
      </td>
    </tr>
    <tr>
      <td align="center"><b>$u_1$</b></td>
      <td align="center"><b>$u_2$</b></td>
      <td align="center"><b>$X(u)$</b></td>
      <td align="center"><b>$Z(u)$</b></td>
      <td align="center"><b>$Y(u)$</b></td>
      <td align="center"><b>$Y_0(u)$</b></td>
      <td align="center"><b>$Y_1(u)$</b></td>
      <td align="center"><b>$Z_0(u)$</b></td>
      <td align="center"><b>$Z_1(u)$</b></td>
    </tr>
    <tr>
      <td align="center">$0$</td>
      <td align="center">$0$</td>
      <td align="center">$0$</td>
      <td align="center">$0$</td>
      <td align="center">$0$</td>
      <td align="center">$0$</td>
      <td align="center">$ab$</td>
      <td align="center">$0$</td>
      <td align="center">$a$</td>
    </tr>
    <tr>
      <td align="center">$0$</td>
      <td align="center">$1$</td>
      <td align="center">$0$</td>
      <td align="center">$1$</td>
      <td align="center">$b$</td>
      <td align="center">$b$</td>
      <td align="center">$(a+1)b$</td>
      <td align="center">$1$</td>
      <td align="center">$a+1$</td>
    </tr>
    <tr>
      <td align="center">$1$</td>
      <td align="center">$0$</td>
      <td align="center">$1$</td>
      <td align="center">$a$</td>
      <td align="center">$ab$</td>
      <td align="center">$0$</td>
      <td align="center">$ab$</td>
      <td align="center">$0$</td>
      <td align="center">$a$</td>
    </tr>
    <tr>
      <td align="center">$1$</td>
      <td align="center">$1$</td>
      <td align="center">$1$</td>
      <td align="center">$a+1$</td>
      <td align="center">$(a+1)b$</td>
      <td align="center">$b$</td>
      <td align="center">$(a+1)b$</td>
      <td align="center">$1$</td>
      <td align="center">$a+1$</td>
    </tr>
   </tbody>
</table>
</center>

我们容易得到$\mathbb{E}[Y_1|Z=1]=(a+1)b, \mathbb{E}[Y_0|Z=1]=b, \mathbb{E}[Y|do(X=1), Z=1]=b,$ 以及$\mathbb{E}[Y|do(X=0), Z=1]=b.$ 这些为$\mathbb{E}[Y|do(X=1), Z=1] \neq \mathbb{E}[Y_{X=1}|Z=1]$提供了数值上的确认。它们还说明了我们之前注意到的反事实条件的一个特殊条件：尽管在图1.1中$Z$将$X$与$Y$分开，但对于那些$Z=1$的单位，$X$对$Y$有影响：$$\mathbb{E}[Y_1-Y_0|Z=1]=ab\neq0$$

用工资例子来解释就是：虽然已经获得技能水平$Z=1$的人的工资只取决于他们的技能而非$X,$ 但如果他们有不同的过去，目前处于$Z=1$的人的工资就会不同。

到目前为止，概率$P(u_1)$和$P(u_2)$还没有发挥作用，因为只有在$u_1=0$和$u_2=1$的情况下，才会出现$Z=1$的条件（假设$a\neq0, a\neq1$），在这些条件下，$Y, Y_1$和$Y_0$都有一个确定的值。然而如果我们在模型中假设$a=1,$ 这些概率就会发挥作用，因为$Z=1$现在可以在两个条件下发生：$(u_1=0, u_2=1)$和$(u_1=1, u_2=0).$ 第一种情况发生的概率为$P(u_1=0)P(u_2=1),$ 第二种情况发生的概率为$P(u_1=1)P(u_2=0).$ 我们有$$\mathbb{E}[Y_{X=1}|Z=1]=b\left(1+\frac{P(u_1=0)P(u_2=1)}{P(u_1=0)P(u_2=1)+P(u_1=1)P(u_2=0)}\right)$$以及$$\mathbb{E}[Y_{X=0}|Z=1]=b\left(\frac{P(u_1=0)P(u_2=1)}{P(u_1=0)P(u_2=1)+P(u_1=1)P(u_2=0)}\right)$$

第一个式子大于第二个式子的事实再次表明，尽管工资只由技能而不是由教育决定，但教育对工资的因果效应（技能一定的情况下）是非零的。因为在技能水平$Z=1$的工人中，有一部分人没有接受过大学教育，如果他们接受了大学教育，他们的技能就会增加到$Z_1=2,$ 而他们的工资也会增加到$2b.$

## 2. 反事实的图示化
***

从反事实的基本定律$Y_x(u)=Y_{M_x}(u)$中得知，如果我们修改模型$M$得到子模型$M_x,$ 那么结果变量$Y$在修改后的模型是原模型的反事实$Y_x.$ 由于修改要求去掉所有指向$X$的箭头，如图2.1所示，我们得出结论，与$Y$相关联的节点作为$Y_x$的代理变量，我们可以这么理解：替代只在修改下有效。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://tva1.sinaimg.cn/large/007S8ZIlgy1gg38foh7tcj30ss0bsmyp.jpg" alt>
    <div style="display: inline-block; color: #000; padding: 0px;"><b>Figure 2.1</b> (a) The original model. (b) The modified model $M_x$ in which the node labeled $Y_x$ represents the potential outcome $Y$ predicated on $X=x.$<sup><a href="#footnote-2">2</a></sup></div>
</center>

我们需要研究是什么原因导致$Y_x$发生变化。根据其结构定义，$Y_x$代表了在$X=x$保持不变的条件下$Y$的值，因此$Y_x$的统计变化受所有能够影响$Y$的外生变量支配（当$X$保持不变时），也就是如图2.1(b)所示的去掉了指向$X$的箭头。在这样的条件下，能够向$Y$传递变化的变量集是$Y$的父母变量（观测到的和未观测到的）以及$X$和$Y$之间路径上节点的父母变量。例如在图2.1(b)中，这些父母变量是$\lbrace Z_3, W_2, U_3, U_Y \rbrace,$ 其中$U_Y$和$U_3$分别是$Y$和$W_3$的误差项（图中没有显示）。任何一组变量如果阻塞了这些通向父母变量的路径，也就阻塞了通向$Y_x$的路径，因此将导致$Y_x$是条件独立的。特别地，如果我们有一个在$M$中满足后门准则的协变量集$Z,$ 该集也阻塞了$X$和这些父母变量之间的所有路径，因此它使$X$和$Y_x$在每个$Z=z$中是独立的。我们有如下定理：

**定理**（后门准则的反事实解释）&nbsp;&nbsp;&nbsp; 如果一个变量集$Z$相对于$(X, Y)$满足后门准则，那么在给定$Z$的情况下，对于所有$x,$ 反事实$Y_x$条件独立于$X$ $$P(Y_x|X, Z)=P(Y_x|Z)$$

特别地，这个定理意味着$P(Y_x=y)$可由调整公式$P(Y=y|do(X=x))=\sum\limits_z P(Y=y|X=x, Z=z)P(Z=z)$识别。为了证明这一点，我们条件于$Z$

<body>
<p>
$$\begin{aligned}
P(Y_x=y)&=\sum_z P(Y_x=y|Z=z)P(z)
\\&=\sum_z P(Y_x=y|Z=z, X=x)P(z)
\\&=\sum_z P(Y=y|Z=z, X=x)P(z)
\end{aligned}$$
</p>
</body>

其中第二行是由定理得到的，而第三行由一致性规则得到。我们得到了熟悉的调整公式，但我们其实之前已经推导过了，因为$P(Y_x=y)$只是$P(Y=y|do(x))$的另一种写法。

我们现在可以以图形的方式解决图1.1的问题，解释为什么更好的教育（$X$）会对目前处于技能水平$Z=z$的人的工资（$Y$）产生影响，尽管在模型中工资只能由技能决定。为了确定教育对工资的影响（$Y_x$）在统计上是否与教育水平独立，我们需要在图中定位$Y_x,$ 并在给定$Z$的情况下看它是否与$X$有向分离。回到图1.1，我们可以看到$Y_x$可以被$U_2$识别，它是从$X$到$Y$的因果路径上唯一的节点的父母变量，也因此在$X$保持不变的情况下，产生$Y_x$变化的唯一变量。并且$Z$是$X$和$U_2$之间的collider，也因此$X$和$U_2$（同样地$X$和$Y_x$）在给定$Z$的情况下不是有向分离的。因此尽管$\mathbb{E}[Y|X, Z]=\mathbb{E}[Y|Z],$ 我们有$$\mathbb{E}[Y_x|X, Z] \neq \mathbb{E}[Y_x|Z]$$

## 3. 实验环境中的反事实
***

在实验环境中，模型是不可用的，实验者必须根据有限的观察个体样本来回答干预问题。我们回到之前提到的补习模型（反事实（一）图2.1），在这个模型中我们分析了一个个体行为，假设实验者观察了一组10个人，而这个个体是参与者1。

<center>
<div style="display: inline-block; color: #000; padding: 0px;"><b>Table 3.1</b> Potential and observed outcomes predicted by the structural model (units were selected at random, with each $U_i \sim \text{Unif}[0, 1]$)</div>
<table frame="void">
  <tbody>
    <tr>
      <td align="center"></td>
      <td colspan="3"><center><b>Participant characteristics</b></center></td>
      <td colspan="3"><center><b>Observed behavior</b></center></td>
      <td colspan="5"><center><b>Predicted potential outcomes</b></center></td>
    </tr>
    <tr>
      <td align="center"><b>Participant</b></td>
      <td align="center"><b>$U_X$</b></td>
      <td align="center"><b>$U_H$</b></td>
      <td align="center"><b>$U_Y$</b></td>
      <td align="center"><b>$X$</b></td>
      <td align="center"><b>$Y$</b></td>
      <td align="center"><b>$H$</b></td>
      <td align="center"><b>$Y_0$</b></td>
      <td align="center"><b>$Y_1$</b></td>
      <td align="center"><b>$H_0$</b></td>
      <td align="center"><b>$H_1$</b></td>
      <td align="center"><b>$Y_{00}\cdots$</b></td>
    </tr>
    <tr>
      <td align="center">$1$</td>
      <td align="center">$0.5$</td>
      <td align="center">$0.75$</td>
      <td align="center">$0.75$</td>
      <td align="center">$0.5$</td>
      <td align="center">$1.50$</td>
      <td align="center">$1.0$</td>
      <td align="center">$1.05$</td>
      <td align="center">$1.95$</td>
      <td align="center">$0.75$</td>
      <td align="center">$1.25$</td>
      <td align="center">$0.75$</td>
    </tr>
    <tr>
      <td align="center">$2$</td>
      <td align="center">$0.3$</td>
      <td align="center">$0.1$</td>
      <td align="center">$0.4$</td>
      <td align="center">$0.3$</td>
      <td align="center">$0.71$</td>
      <td align="center">$0.25$</td>
      <td align="center">$0.44$</td>
      <td align="center">$1.34$</td>
      <td align="center">$0.1$</td>
      <td align="center">$0.6$</td>
      <td align="center">$0.4$</td>
    </tr>
    <tr>
      <td align="center">$3$</td>
      <td align="center">$0.5$</td>
      <td align="center">$0.9$</td>
      <td align="center">$0.2$</td>
      <td align="center">$0.5$</td>
      <td align="center">$1.01$</td>
      <td align="center">$1.15$</td>
      <td align="center">$0.56$</td>
      <td align="center">$1.46$</td>
      <td align="center">$0.9$</td>
      <td align="center">$1.4$</td>
      <td align="center">$0.2$</td>
    </tr>
    <tr>
      <td align="center">$4$</td>
      <td align="center">$0.6$</td>
      <td align="center">$0.5$</td>
      <td align="center">$0.3$</td>
      <td align="center">$0.6$</td>
      <td align="center">$1.04$</td>
      <td align="center">$0.8$</td>
      <td align="center">$0.50$</td>
      <td align="center">$1.40$</td>
      <td align="center">$0.5$</td>
      <td align="center">$1.0$</td>
      <td align="center">$0.3$</td>
    </tr>
    <tr>
      <td align="center">$5$</td>
      <td align="center">$0.5$</td>
      <td align="center">$0.8$</td>
      <td align="center">$0.9$</td>
      <td align="center">$0.5$</td>
      <td align="center">$1.67$</td>
      <td align="center">$1.05$</td>
      <td align="center">$1.22$</td>
      <td align="center">$2.12$</td>
      <td align="center">$0.8$</td>
      <td align="center">$1.3$</td>
      <td align="center">$0.9$</td>
    </tr>
    <tr>
      <td align="center">$6$</td>
      <td align="center">$0.7$</td>
      <td align="center">$0.9$</td>
      <td align="center">$0.3$</td>
      <td align="center">$0.7$</td>
      <td align="center">$1.29$</td>
      <td align="center">$1.25$</td>
      <td align="center">$0.66$</td>
      <td align="center">$1.56$</td>
      <td align="center">$0.9$</td>
      <td align="center">$1.4$</td>
      <td align="center">$0.3$</td>
    </tr>
    <tr>
      <td align="center">$7$</td>
      <td align="center">$0.2$</td>
      <td align="center">$0.3$</td>
      <td align="center">$0.8$</td>
      <td align="center">$0.2$</td>
      <td align="center">$1.10$</td>
      <td align="center">$0.4$</td>
      <td align="center">$0.92$</td>
      <td align="center">$1.82$</td>
      <td align="center">$0.3$</td>
      <td align="center">$0.8$</td>
      <td align="center">$0.8$</td>
    </tr>
    <tr>
      <td align="center">$8$</td>
      <td align="center">$0.4$</td>
      <td align="center">$0.6$</td>
      <td align="center">$0.2$</td>
      <td align="center">$0.4$</td>
      <td align="center">$0.80$</td>
      <td align="center">$0.8$</td>
      <td align="center">$0.44$</td>
      <td align="center">$1.34$</td>
      <td align="center">$0.6$</td>
      <td align="center">$1.1$</td>
      <td align="center">$0.2$</td>
    </tr>
    <tr>
      <td align="center">$9$</td>
      <td align="center">$0.6$</td>
      <td align="center">$0.4$</td>
      <td align="center">$0.3$</td>
      <td align="center">$0.6$</td>
      <td align="center">$1.00$</td>
      <td align="center">$0.7$</td>
      <td align="center">$0.46$</td>
      <td align="center">$1.36$</td>
      <td align="center">$0.4$</td>
      <td align="center">$0.9$</td>
      <td align="center">$0.3$</td>
    </tr>
    <tr>
      <td align="center">$10$</td>
      <td align="center">$0.3$</td>
      <td align="center">$0.8$</td>
      <td align="center">$0.3$</td>
      <td align="center">$0.3$</td>
      <td align="center">$0.89$</td>
      <td align="center">$0.95$</td>
      <td align="center">$0.62$</td>
      <td align="center">$1.52$</td>
      <td align="center">$0.8$</td>
      <td align="center">$1.3$</td>
      <td align="center">$0.3$</td>
    </tr>
   </tbody>
</table>
</center>

每个个体的特征由一个独特的变量$U_i=(U_X, U_H, U_Y)$来描述，如表3.1的前三列所示。利用这些信息，我们可以创建一个符合模型的完整数据集。对于每一个$(U_X, U_H, U_Y),$ 模型使我们能够完成表格的一整行，包括$Y_0$和$Y_1,$ 它们分别代表处理（$X=1$）和控制（$X=0$）条件下的可能结果。我们看到，结构模型实际上编码了一个由个体合成的总体以及他们在观察和实验条件下的预测行为。标注为$X, Y, H$的列预测了观察研究的结果，标注为$Y_0, Y_1, H_0, H_1$的列预测了$X=0, X=1$两种条件下的假设结果。我们可以预测无穷多个的潜在结果。从这个合成总体中，我们可以估计出变量$X, Y, H$的每一个反事实概率（假设我们知道表的所有内容）。

毋庸置疑，表3.1传达的信息是我们在观察或实验研究中无法获得的。这些信息是从一个参数模型中推到出来的，从这个模型中我们可以给定观测值$\lbrace X, H ,Y \rbrace$推断出每个参与者的定义特征$\lbrace U_X, U_H, U_Y \rbrace.$ 一般来说，在没有参数模型的情况下，当我们所拥有的只是个体参与者的观察行为$\lbrace X, H, Y \rbrace$时，我们对他们的潜在结果$Y_1$和$Y_0$能了解的非常少。从理论上说，我们在反事实$\lbrace Y_1, Y_0 \rbrace$和可观测到的$\lbrace X, H, Y \rbrace$之间的唯一联系是一致性规则：在$X=1$的情况下$Y_1=Y,$ 在$X=0$的情况下$Y_0=Y.$ 除此之外，大多数与个体参与者相关的反事实仍然没有被观测到。

幸运的是，我们可以在总体层面了解这些反事实，比如估计他们的概率或预期。假设我们没有任何关于模型的信息，我们所拥有的只是在实验研究中对$Y$的测量，其中$X$是随机分配到$X=0$和$X=1$的。

表3.2描述了与表3.1同样的10名参与者对实验的反应，其中参与者1、5、6、8和10被分配到$X=0,$ 其余为$X=1.$ 前两列给出了真正的潜在结果，而后两列描述了实验者可获得的信息，其中斜杆表示没有观察到反应。显然$Y_0$只对分配到$X=0$的参与者进行观察而$Y_1$只对分配到$X=1$的参与者进行观察。随机化能够保证尽管有一半的潜在结果无法观察，但治疗组和对照组中观察到的均值之间的差异将趋近于总体均值的差异，$\mathbb{E}[Y_1-Y_0]=0.9,$ 这是因为随机化将“/”沿表3.2最右侧两列随机分布，与$Y_0$和$Y_1$的实际值无关，所以随着样本数量的增加，样本均值会收敛于总体均值。

<center>
<div style="display: inline-block; color: #000; padding: 0px;"><b>Table 3.2</b> Potential and observed outcomes in a randomized clinical trial with $X$ randomized over $X=0$ and $X=1$</div>
<table frame="void">
  <tbody>
    <tr>
      <td align="center"></td>
      <td colspan="2"><center><b>Predicted potential outcomes</b></center></td>
      <td colspan="2"><center><b>Observed outcomes</b></center></td>
    </tr>
    <tr>
      <td align="center"><b>Participant</b></td>
      <td align="center"><b>$Y_0$</b></td>
      <td align="center"><b>$Y_1$</b></td>
      <td align="center"><b>$Y_0$</b></td>
      <td align="center"><b>$Y_1$</b></td>
    </tr>
    <tr>
      <td align="center">$1$</td>
      <td align="center">$1.05$</td>
      <td align="center">$1.95$</td>
      <td align="center">$1.05$</td>
      <td align="center">$/$</td>
    </tr>
    <tr>
      <td align="center">$2$</td>
      <td align="center">$0.44$</td>
      <td align="center">$1.34$</td>
      <td align="center">$/$</td>
      <td align="center">$1.34$</td>
    </tr>
    <tr>
      <td align="center">$3$</td>
      <td align="center">$0.56$</td>
      <td align="center">$1.46$</td>
      <td align="center">$/$</td>
      <td align="center">$1.46$</td>
    </tr>
    <tr>
      <td align="center">$4$</td>
      <td align="center">$0.50$</td>
      <td align="center">$1.40$</td>
      <td align="center">$/$</td>
      <td align="center">$1.40$</td>
    </tr>
    <tr>
      <td align="center">$5$</td>
      <td align="center">$1.22$</td>
      <td align="center">$2.12$</td>
      <td align="center">$1.22$</td>
      <td align="center">$/$</td>
    </tr>
    <tr>
      <td align="center">$6$</td>
      <td align="center">$0.66$</td>
      <td align="center">$1.56$</td>
      <td align="center">$0.66$</td>
      <td align="center">$/$</td>
    </tr>
    <tr>
      <td align="center">$7$</td>
      <td align="center">$0.92$</td>
      <td align="center">$1.82$</td>
      <td align="center">$/$</td>
      <td align="center">$1.82$</td>
    </tr>
    <tr>
      <td align="center">$8$</td>
      <td align="center">$0.44$</td>
      <td align="center">$1.34$</td>
      <td align="center">$0.44$</td>
      <td align="center">$/$</td>
    </tr>
    <tr>
      <td align="center">$9$</td>
      <td align="center">$0.46$</td>
      <td align="center">$1.36$</td>
      <td align="center">$/$</td>
      <td align="center">$1.36$</td>
    </tr>
    <tr>
      <td align="center">$10$</td>
      <td align="center">$0.62$</td>
      <td align="center">$1.52$</td>
      <td align="center">$0.62$</td>
      <td align="center">$/$</td>
    </tr>
    <tr>
      <td align="center"></td>
      <td colspan="2"><center><b>True average treatment effect: $0.90$</b></center></td>
      <td colspan="2"><center><b>Study average treatment effect: $0.68$</b></center></td>
    </tr>
   </tbody>
</table>
</center>

随机化像干预一样，使$X$独立于任何可能影响$Y$的变量（如图2.1(b)所示）。在这种情况下，调整公式$P(Y_x=y)=\sum\limits_z P(Y=y|Z=z, X=x)P(z)$适用于$Z=\lbrace\rbrace,$ 得到$\mathbb{E}[Y_x]=\mathbb{E}[Y|X=x],$ 其中$x=1$代表处理过的单位，$x=0$代表未处理过的。表3.2有助于我们理解当我们在实验环境中取样本平均数时，实际计算的结果是什么，以及这些平均数与基本反事实$Y_1$和$Y_0$的关系。

## 4. 线性模型中的反事实
***

在非参数模型中，反事实量的形式$\mathbb{E}[Y_{X=x}|Z=z]$可能无法识别，即使我们利用实验。但在完全线性模型中，只要确定了模型参数，任何反事实量都是可以确定的，这是因为参数完全定义了模型的函数，一旦函数给定，反事实就可以利用$Y_x(u)=Y_{M_x}(u)$来计算。由于每一个模型都可以从干预研究中用直接效应的干预定义来识别，所以在线性模型中，每一个反事实都可以通过实验来识别。那么，当部分模型参数无法识别时，是否可以在观察研究中识别反事实呢？事实上，只要$\mathbb{E}[Y|do(X=x)]$被识别，$\mathbb{E}[Y_{X=x}|Z=e]$形式的反事实就会被识别。以下定理总结了二者的关系：

**定理**&nbsp;&nbsp;&nbsp; 令$\tau$为$X$对$Y$的总效应的斜率$$\tau=\mathbb{E}[Y|do(x+1)]-\mathbb{E}[Y|do(x)]$$ 那么对于任何证据$Z=e,$ 我们有$$\mathbb{E}[Y_{X=x}|Z=e]=\mathbb{E}[Y|Z=e]+\tau(x-\mathbb{E}[X|Z=e])$$

定理为线性模型中的反事实提供了直观的解释。$\mathbb{E}[Y_{X=x}|Z=e]$的计算方法是：首先计算$Y$在证据$e$的条件下的最佳估计值$\mathbb{E}[Y|e],$ 然后再加上当$X$从当前的最佳估计值$\mathbb{E}[X|Z=e]$移到其假设值$x$时$Y$的预期变化。这一定理的重要性在于可以使研究者能够回答从总体数据中提出关于个体（或个体集）的假设问题。

在之前提到的补习模型例子中，我们计算了$e=\lbrace X=0.5, H=1, Y=1.5 \rbrace$下的反事实$Y_{H=2}.$ 现在我们将定理应用于这个模型，计算治疗对被治疗者的影响（Effect of Treatment on the Treated）$$\text{ETT}=\mathbb{E}[Y_1-Y_0|X=1]$$ 将证据$e=\lbrace X=1 \rbrace$代入$\mathbb{E}[Y_{X=x}|Z=e]=\mathbb{E}[Y|Z=e]+\tau(x-\mathbb{E}[X|Z=e])$中，我们有

<body>
<p>
$$\begin{aligned}
\text{ETT}&=\mathbb{E}[Y_1|X=1]-\mathbb{E}[Y_0|X=1]
\\&=\mathbb{E}[Y|X=1]-\mathbb{E}[Y|X=1]+\tau(1-\mathbb{E}[X|X=1])-\tau(0-\mathbb{E}[X|X=1])
\\&=\tau
\\&=b+ac=0.9
\end{aligned}$$
</p>
</body>

换句话说，治疗对被治疗者的影响等于治疗对总体的影响。我们得到线性系统中的普遍结果（可以从定理公式中看出），$\mathbb{E}[Y_{x+1}-Y_x|e]=\tau,$ 与$e$的证据无关。当输出方程中加入一个乘法（即非线性）相互作用相时，情况就不同了。例如将$X \rightarrow H$的箭头反过来，方程为$$Y=bX+cH+\delta XH+U_Y$$ 而$\tau$将与$\text{ETT}$不同。

# Reference
***

<p id="footnote-1">1. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 99.
<p id="footnote-2">2. Pearl, J., Glymour, M., & Jewell, N. P. (2016). <i>Causal inference in statistics: A primer.</i> John Wiley & Sons, 102.