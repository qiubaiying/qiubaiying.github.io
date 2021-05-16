---

layout:     post
title:      微观经济学｜博弈论入门
subtitle:   
date:       2019-03-10
author:     Derek
header-img: img/post-eco.jpg
catalog: true
tags:
    - 微观经济学
    
---

# 0. 前言
***
也是很久没有更新微观经济学的入门笔记了，经过上一次在公众号上将一堆公式转图片再重新调整后，我更新笔记的动力就下降了许多。好在，折腾了一下博客，就打算在这里更新了。关于之前的笔记，可以去公众号上查阅，或者我有时间会慢慢将它们迁移过来的。

# 1. 博弈论与博弈
***
前一段时间，沉迷游戏。这个游戏让我想到了博弈论（Game Theory）与寡头垄断（Oligopoly）的知识，于是打算整理一下这一块的笔记。这也许是微观经济学入门笔记的倒数第二篇，关于企业生产部分，<s>如果有时间会再整理吧</s>（不存在的）。

博弈论，简单的说，是一个帮助我们分析策略互动行为的一个工具。我们先来定义一些符号：假设，有$N$个同质的<s>菊</s>局中人（Players），每一个局中人都有自己的策略集（Strategies Set）$S_i,$ 每一个局中人会选择其中一个策略$s_i \in S_i.$ 每一个局中人有一个收益函数（Payoff Function）$u_i(s_1, ..., s_n) \in \mathbb{R}.$ 此外，局中人$i$的竞争者策略（Competitors' Strategies）$S_{-i}=(s_1, ..., s_{i-1}, s_{i+1}, ..., s_n).$

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://i.loli.net/2019/05/12/5cd787431c1a0.jpg" alt>
    <div style="display: inline-block; color: #999; padding: 0px;">局中人</div>
</center>

我们先假设在博弈中，局中人是具有完全信息（Complete Information）的，并且必须采取单一策略（Pure Strategy）的特点的，也就是说每一个局中人的收益函数和策略集是所有人都知道的，并且每一个局中人只能选择一个策略。

我们定义，相比于$s_i'$而言，$s_i$是严格占优策略需满足以下条件：$$u_i(s_1, ..., s_i, ..., s_N)>u_i(s_1, ..., s_i', ..., s_N), \forall S_{-i}.\tag{1}$$
也就是说无论其他局中人如何选择自己的策略，$s_i$的报酬总是高于$s_i'$的报酬。如果式(1)中的$>$改写为$\geq,$ 那么我们则称其为弱占优策略。


并且，我们定义对竞争者策略的最佳反应（Best Responses）是指，给定竞争者的策略，在自己的所有策略中能达到最高报酬的策略。

我们举一个经典的例子（却偏偏不是囚徒困境），有一个很出名的电视游戏叫做Split or Steal（下饭综艺），大约规则是共有100150刀的奖金，如果两个人都选了Split, 那么每个人可以分到50075刀。如果一个人选择Split而另一个人选择Steal, 那么选择Steal的人可以把100150刀全部拿回家。但是，如果两个人都选择了Steal, 那么两个人啥也没有。这个电视游戏可以说是见证了戏精的诞生、窥探了人性的丑恶，多少人跟对方发誓我一定会跟你分钱的，说得那个感人，甚至还挤出了几滴泪珠，然而结局总是令人唏嘘不已。抛开人性的这一面，我们把这个游戏看成一个博弈：

<center>
<table frame="void">
  <tbody>
      <tr>
      <td align="center"></td>
      <td align="center"><b>The Other Splits</b></td>
      <td align="center"><b>The Other Steals</b></td>
    </tr>
    <tr>
      <td align="center"><b>One Splits</b></td>
      <td align="center">$50075, 50075$</td>
      <td align="center">$0, 100150$</td>
    </tr>
    <tr>
      <td align="center"><b>One Steals</b></td>
      <td align="center">$100150, 0$</td>
      <td align="center">$0, 0$</td>
    </tr>
  </tbody>
</table>
</center>

那么对于两个玩家而言，选择Steal都是弱占优策略，也难怪大家都会选择Steal. 如果已知玩家1选择Split, 那么玩家2的最佳反应是选择Steal.  如果已知玩家2选择Steal, 那么选择Split或Steal都是玩家2的最佳反应。

# 2. 纳什均衡
***
第一次听纳什均衡（Nash Equilibrium）这个名词是在电影《美丽心灵》中，它是指一个策略组合（Strategy Profile）$(s_1, ..., s_N)$满足：每一个局中人的策略都是他们的最佳反应，在纳什均衡下，已知其他人的动态，没有人有动机去更改他们的策略。那么在上一个例子中，一共有三个纳什均衡，分别是$(\mathrm{Steal, Split}), (\mathrm{Steal, Steal}), (\mathrm{Split, Steal}).$

我们再回到那个经典的囚徒困境<sup><a href="#footnote-1">1</a></sup>：

> 警方逮捕甲、乙两名嫌疑犯，但没有足够证据指控二人有罪。于是警方分开囚禁嫌疑犯，分别和二人见面，并向双方提供以下相同的选择：
>
* 若一人认罪并作证检控对方，而对方保持沉默，此人将即时获释，沉默者将判监10年。
>
* 若两人都保持沉默，则二人同样判监半年。
>
* 若二人都互相检举，则二人同样判监5年。

简化成表格是：

<center>
<table frame="void">
  <tbody>
    <tr>
      <td align="center"></td>
      <td align="center"><b>乙沉默</b></td>
      <td align="center"><b>乙背叛</b></td>
    </tr>
    <tr>
      <td align="center"><b>甲沉默</b></td>
      <td align="center">$0.5, 0.5$</td>
      <td align="center">$10, 0$</td>
    </tr>
    <tr>
      <td align="center"><b>甲背叛</b></td>
      <td align="center">$0, 10$</td>
      <td align="center">$5, 5$</td>
    </tr>
  </tbody>
</table>
</center>

根据定义可知纳什均衡是两人都背叛。一个寻找纳什均衡的方法是：

（1）假设已知乙沉默，那么甲一定会背叛；

（2）已知乙背叛，那么甲一定会背叛；

（3）已知甲沉默，那么乙一定会背叛；

（4）已知甲背叛，那么乙一定会背叛。

可知，无论是谁选择沉默，另一个人会选择背叛，那么这个人只好选择背叛来降低自己的损失。

# 3. 动态博弈
***
动态博弈（Dynamic Game）的关键在于动，局中人不需要在同时期内行动。

## 3.1 扩展形式的博弈
***
扩展形式的博弈（Extensive Form Game）通过树来描述博弈。每个决策节点表示博弈进行中的每一个可能的状态。博弈从唯一的初始节点开始，通过由局中人决定的路径到达终端节点，博弈结束，局中人获得相应的收益——为了更好的说明这个概念，我引用了Nicholson在他的著作中的例子<sup><a href="#footnote-2">2</a></sup>：

> 假设有两个学生$A$与$B,$ 他们要决定自己在宿舍里练习乐器的声音大小。每个人可能采取较高（$L$）或较低（$S$）的声音。在一个博弈树中，每个结点代表所标的个人的决策。在这个博弈中是$A$先做决策，选择他的音量$L$或$S.$ 并假设$B$知道$A$的选择后再做选择。如下图所示，如果$A$选择较低的声音，在已知这个策略下，$B$可以选择$L$或者$S,$ 并获得对应的支付。

<center>
    <img style="rgba(34,36,38,.08)"
    src="https://i.loli.net/2019/05/12/5cd7874325c77.jpg">
    <div style="display: inline-block; color: #999; padding: 0px;">博弈树<sup><a href="#footnote-2">3</a></sup></div>
</center>

如果我们将这个博弈树转换成表格形式，我们得到：

<center>
<table frame="void">
  <tbody>
    <tr>
      <td align="center"></td>
      <td align="center">$L, L$</td>
      <td align="center">$L, S$</td>
      <td align="center">$S, L$</td>
      <td align="center">$S, S$</td>
    </tr>
    <tr>
      <td align="center">$L$</td>
      <td align="center">$7, 5$</td>
      <td align="center">$7, 5$</td>
      <td align="center">$5, 4$</td>
      <td align="center">$5, 4$</td>
    </tr>
    <tr>
      <td align="center">$S$</td>
      <td align="center">$6, 4$</td>
      <td align="center">$6, 3$</td>
      <td align="center">$6, 4$</td>
      <td align="center">$6, 3$</td>
    </tr>
  </tbody>
</table>
</center>

特别注意，在这里表达$B$的策略时，我们都表示为一对行动，这代表依靠已有信息，$B$将如何行动。比如说$(L, L)$代表如果$A$选择$L,$ 那么$B$会选择$L,$ 并且当$A$选择$S$时，$B$会选择$L.$ 类似地，$(L, S)$代表如果$A$选择$L,$ 那么$B$选择$L,$ 且如果$A$选择$S$时，$B$选择$S.$ 这种表示方法只是为了便于我们更好地了解序贯博弈（Sequential Game）的均衡概念。

读者可自行练习找出这一个博弈的纳什均衡，不难发现在这个博弈中有三个纳什均衡，分别是：$(L, (L, L)), (L, (L, S)), (S, (S, L)).$

然而我们在这三个纳什均衡中能找出不合理的组合。例如$(S, (S, L)).$ 在这一纳什均衡下，$B$威胁（Threat）如果$A$选择策略$L,$ 那么$B$会选择策略$S.$ 可是这种威胁是不可信的，因为如果$A$选择策略$L,$ 而$B$选择策略$S$的效用是$4$，但如果选择$L$的效用则是$5$，所以在$(S, L)$中的威胁根本不可信，即便这是一个纳什均衡，$A$也不必理会$B$的威胁。读者可以通过这个思路，找出另一个不合理的策略组合。

## 3.2 子博弈精炼纳什均衡
***
通过排除含有不可信威胁的策略组合，我们能找到一个子博弈精炼纳什均衡（Subgame-Perfect Nash Equilibrium）。在上面的例子中，我们站在$A$的角度思考，可以发现，对于$B$而言，采取$(L, L)$是他唯一有利的策略，在意识到这一点后，$A$只需要采取策略$L$就可以使其自身效用最大化。

当我们掌握了基本的博弈论的知识后，就可以分析简单的寡头垄断模型了。

# Reference
***
<p id="footnote-1">1. <a href="https://zh.wikipedia.org/wiki/%E5%9B%9A%E5%BE%92%E5%9B%B0%E5%A2%83">囚徒困境</a>
<p id="footnote-2">2. Nicholson, W. and Snyder, C. (2001). <i>Microeconomic Theory</i>. 8th ed. Nashville, TN: South-Western College Pub, 249.
<p id="footnote-3">3. Nicholson, W. and Snyder, C. (2001). <i>Microeconomic Theory</i>. 8th ed. Nashville, TN: South-Western College Pub, 256.