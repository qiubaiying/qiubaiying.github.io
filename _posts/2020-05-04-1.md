---

layout:     post
title:      因果推断｜初识
subtitle:   
date:       2020-05-04
author:     Derek
header-img: img/post-sta.jpg
catalog: true
tags:
    - 因果推断
    
---
# 1. 前言
***

我最近在做关于因果推断（Causal Inference）的阅读，所以想着记一点笔记，能为未来提供思路。由于原文都是英文，我尝试用中文进行总结，并给重要的名词标注英文。如果有任何错误，欢迎指正。

# 2. 结构因果模型（Structural Causal Model）
***

我们假定读者已经掌握了基础的概率论与统计知识，并对图论有基础的认识，因此我们将直接介绍模型的假设以及统计学中的链式法则。

## 2.1 模型介绍
***

一个结构因果模型（SCM）包含两组变量$U$和$V,$ 和一组基于模型中其它变量的值，给$V$中的变量赋值的函数$f.$ 我们称所有在$U$中的变量为外生变量（Exogenous Variable），所有在$V$中的变量为内生变量（Endogenous Variable）。

模型中的所有内生变量都至少是一个外生变量的后代（Descendant，图论概念）。所有外生变量都不可以是任何其它变量的后代，也即外生变量没有祖先（Ancestor，图论概念），在图中是一个根结点（Root Node，图论概念）。如果我们知道所有外生变量的值，那么利用函数$f,$

关于因果关系，我们定义：如果$X$出现在赋值$Y$的函数中，那么变量$X$是变量$Y$的直接原因（Direct Cause）。如果$X$是$Y$的直接原因或任何关于$Y$的原因，那么$X$是$Y$的原因（Cause）。

**例**&nbsp;&nbsp;&nbsp; 假设我们想研究关于疗法$X$和有哮喘的患者的肺功能$Y$的因果关系，并假设$Y$取决于空气污染程度$Z.$ 在这个例子中，我们称$X$和$Y$是内生的，$Z$是外生的，因为我们假设空气污染是一个外部因素，它不能由疗法或者肺功能引起。

SCM与因果图模型（Graphical Causal Model）相关联。图模型包括一组代表$U$和$V$的节点（Node），和一组代表函数$f$的连结节点的边（Edge）。如果$X$取决于$Y$的值，那么在图模型中会有一条从$Y$到$X$的有向边（Directed Edge）。我们主要讨论的结构因果模型都是有向非循环图（Directed Acyclic Graph，DAG）的模型。根据SCM与图模型的关系，我们可以给因果关系一个新的定义：如果$X$是$Y$的子女（Child），那么$Y$是$X$的直接原因。如果$X$是$Y$的后代，那么$Y$是$X$的潜在原因（Potential Cause），之后我们也会讨论在极少数情况下，$Y$不是$X$的原因的情况。

**例**&nbsp;&nbsp;&nbsp; 现在我们来看一个计量经济学中的常见例子。假设$U=\lbrace X, Y \rbrace, V=\lbrace Z \rbrace, F=\lbrace f_Z \rbrace, f_Z: Z=2X+3Y.$ 其中，$Z$代表员工薪水，$X$代表受教育年限，$Y$代表从业年限。$X$和$Y$都出现在$f_Z$中，所以$X$和$Y$都是$Z$的直接原因。如果$X$和$Y$有任何祖先变量，那么这些变量将是$Z$的潜在原因。我们可以画出相应的图模型。

**例**&nbsp;&nbsp;&nbsp; 假设$V=\lbrace \text{Height, Sex, Performance} \rbrace, U=\lbrace U_1, U_2, U_3 \rbrace, F=\lbrace f_1, f_2 \rbrace,$ 并且$\text{Sex}=U_1, \text{Height}=f_1(\text{Sex}, U_2), \text{Performance}=f_2(\text{Height, Sex}, U_3).$ 其中，$U$代表那些对可测量因素$V$产生影响的不可测量因素，有时我们也会称之为误差项（Error Term）或忽略因素（Omitted Factor），这些代表了我们所观察到的额外的未知或随机的外因。

## 2.2 乘积分解（Product Decomposition）
***

乘积分解也可理解为在概率论中的链式法则（Chain Rule）。这一块内容在学机器学习的过程中已经掌握了，在此做一个总结。

**定理**&nbsp;&nbsp;&nbsp; 对于任何非循环图模型，变量的联合分布可以写成条件分布$P(\text{Child}|\text{Parents})$的乘积，也即$$P(x_1, \cdots, x_n)=\prod_i P(x_i|pa_i),$$ 其中$pa_i$代表$X_i$的父母（Parents，图论概念）变量的值。

**例**&nbsp;&nbsp;&nbsp; 在一个简单的链图$X \to Y \to Z,$ 我们有$$P(X=x, Y=y, Z=z)=P(X=x)P(Y=y|X=x)P(Z=z|Y=y).$$

# 3. 补充
***

关于DAG和乘积分解，也欢迎查询<a href="https://github.com/bayerndd/U-of-T-Notes/blob/master/Statistics/STA414.pdf" target="_blank">这一篇笔记</a>的6至10页。