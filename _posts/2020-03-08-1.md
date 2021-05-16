---

layout:     post
title:      随机过程｜你要等多久？
subtitle:   
date:       2020-03-08
author:     Derek
header-img: img/post-sp.jpg
catalog: true
tags:
    - 随机过程
    
---
# 1. 一个栗子
***

假设我们在抛一枚公平硬币（Fair Coin, 抛到每一面的概率均为0.5），正面记为$H$，反面记为$T.$ 令$\tau_1$表示第一次抛到$HTH$的时间，我们想知道这个时间的均值是多少，也即$\mathbb{E}[\tau_1].$ 如果$\tau_2$表示第一次抛到$THH$的时间，那么$\mathbb{E}[\tau_1]=\mathbb{E}[\tau_2]$吗？

尽管抛到$HTH$和$THH$的概率是一样的，但是$\mathbb{E}[\tau_1] \neq \mathbb{E}[\tau_2].$ 我们将从两个方面来理解这个栗子。

# 2. 平均返回时间（Mean Recurrence Time）
***

事实上，我们可以将这个问题转换为一个马尔可夫链（Markov Chain）的问题。令$X_n$代表该马尔可夫链在抛第$n$次时实现的所需序列数量，比如我们抛了一串硬币，得到$HHTTHTH,$ 那么$X_1=1,$ $X_2=1,$ $X_3=2,$ $X_4=0,$ $X_5=1,$ $X_6=2,$ 和$X_7=3.$ 在这个例子中，$\tau=7.$ 不难得到，$X_\tau=3$因为我们到达状态$3$就获得了我们想要的$HTH$。

<body>
<p>
假设我们一旦获得$HTH$就重新开始这个游戏，那么在这个例子中（与$X_1$类似），$$X_{\tau+1}=\begin{cases}
1, &\text{if flip is head} \\
0, &\text{otherwise}
\end{cases}.$$ 令$X_0=0,$ 也即在最开始的时候，我们还没有得到我们想要的东西。但这也等价于$X_0=3,$ 因为在状态$3$（获得$HTH$）后我们重新开始这个游戏。所以，求第一次抛到$HTH$的平均时间等价于求状态$3$的平均返回时间。
</p>
</body>

## 2.1 相关定义与定理
***

<body>
<p>
<b>定义 2.1</b>&nbsp;&nbsp;&nbsp; 定义状态$i$的<b>平均返回时间</b>为$m_i=\mathbb{E}_i[T_i], T_i=\inf\lbrace n \geq 1: X_n=i \rbrace.$
<br>
<br>
<b>定理 2.2</b>&nbsp;&nbsp;&nbsp; 一个在有限状态空间$S$上的，不可约的马尔可夫链总是有$m_i<\infty, \forall i \in S$和一个唯一的平稳分布$\pi_i=\frac{1}{m_i}.$
</p>
</body>

## 2.2 解题思路
***

<body>
<p>
根据之前的构造，$\{X_n\}$是一条在状态空间$S=\{0, 1, 2, 3\}$上的马尔可夫链。我们需要找到其转移概率。
<br>
<br>
不难得到，$p_{01}=p_{12}=p_{23}=\frac{1}{2}.$
<br>
<br>
并且，$p_{00}=p_{20}=\frac{1}{2}.$ 以$p_{20}$为例，我们现在已经得到了$HT,$ 在第三次抛掷中，如果我们得到了$T,$ 那么整个游戏就必须从零开始（回到状态$0$）。
<br>
<br>
一个需要思考稍微久一点的转移概率是$p_{10}.$ 我们现在已经得到了$H,$ 在第二次抛掷中，如果我们得到了$T,$ 显然这个游戏继续，也即$p_{12}=\frac{1}{2}.$ 但如果我们得到了$H,$ 我们并不是从零开始。在这里，尽管我们的游戏无法进行下去，但我们幸运地直接回到了状态$1$，可以从状态$1$开始继续游戏，因此$p_{11}=\frac{1}{2}$但$p_{10}=0.$
<br>
<br>
经过一些简单地分析，我们可以得到一个完整的转移矩阵：$$P=\left(\begin{matrix}
\frac{1}{2} & \frac{1}{2} & 0 & 0 \\
0 & \frac{1}{2} & \frac{1}{2} & 0 \\
\frac{1}{2} & 0 & 0 & \frac{1}{2} \\
\frac{1}{2} & \frac{1}{2} & 0 & 0
\end{matrix}\right).$$ 根据$\pi P=\pi,$ 我们可以算出平稳分布为$\pi=(0.3, 0.4, 0.2, 0.1).$
<br>
<br>
根据定理2.2，$\pi_3=\frac{1}{m_3}=0.1,$ 也即$m_3=10.$ 因此，第一次抛到$HTH$的平均时间是10（次）。
</p>
</body>

## 2.3 一个练习
***

根据相同的思考方式，我们可以得到第一次抛到$THH$的平均时间是8（次）。

尽管这个答案有点违反直觉，但是不严谨地说，在抛到$THH$的过程中，我们可能总是因为抛到$T$而重新开始，但尽管抛到了$T$我们并不是从$0$开始。相反，在抛到$HTH$的过程中，如果我们抛错了，可能从$0$开始的概率更大一些。

## 2.4 计算机模拟
***

我们可以通过计算机模拟（R）验证这个令人怀疑的答案。

{% highlight bash%}
exptime = function(seq, N=10000) {
  s = nchar(seq)
  intseq = rep(0, s)
  for (i in 1:s)
    if (substr(seq, i, i) == "H")
      intseq[i] = 1

  # Sum of waiting time.
  sumtime = 0
  for (j in 1:N) {
    # Simulation.
    flipssofar = NULL
    numflips = 0
    match = FALSE
    while(match == FALSE) {
      # Do another flip.
      flipssofar = c(flipssofar, sample(c(0, 1), 1))
      numflips = numflips + 1

      # Check for a match.
      if (numflips >= s) {
        match = TRUE
        for (b in 1:s) {
          if (flipssofar[numflips-s+b] != intseq[b])
        match = FALSE
        }
      }
    }
    sumtime = sumtime + numflips
  }
  return(sumtime/N)
}
> exptime("HTH")
[1] 9.9792
> exptime("THH")
[1] 8.0642
{% endhighlight %}

# 3. 鞅（Martingale）
***

我们还可以利用鞅来解决这个问题（$HTH$）。现在假设在每个时间点$n$都会出现一个新玩家并且下注一颗糖果给$H,$ 如果他们赢了，将下注两颗糖果给$T,$ 如果他们又赢了，将下注四颗糖果给$H.$

**注意**：请勿赌钱！

<body>
<p>
每一个玩家一旦输了一次就会立马停止（因此最多损失一颗糖果），或者连赢三次也会停止（因此最多可获得七颗糖果）。令$X_n$代表直到时间点$n,$ 所有玩家总共获得的糖果。因为这是一个公平游戏，所以$\{X_n\}$是鞅。并且$\tau$是关于$\{X_n\}$的停止时间（Stopping Time）。
</p>
</body>

## 3.1 相关定义与定理
***

鞅原指一类于18世纪流行于法国的投注策略，称为加倍赌注法。这类策略中最简单的一种策略是为博弈设计的。在博弈中，赌徒会掷硬币，若硬币正面向上，赌徒会赢得赌本，若硬币反面向上，赌徒会输掉赌本。这一策略使赌徒在输钱后加倍赌金投注，为的是在初次赢钱时赢回之前输掉的所有钱，同时又能另外赢得与最初赌本等值的收益。当赌徒的财产和可用时间同时接近无穷时，他掷硬币后硬币正面向上的概率会接近$1.$

<body>
<p>
<b>定义3.1</b>&nbsp;&nbsp;&nbsp; 一个序列$\{X_n\}_{n=0}^\infty$是一个鞅如果$$\mathbb{E}[X_{n+1}|X_0, \cdots, X_n]=X_n, n=0, 1, \cdots.$$
<b>定义3.2</b>&nbsp;&nbsp;&nbsp; 一个非负整值的随机变量$T$被称作关于$\{X_n\}$的停止时间如果事件$\{T=n\}$只受到$X_0, \cdots, X_n$的影响，也即具有某种与将来无关性质的随机时刻。
<br>
<br>
<b>定理 3.3</b>（可选停止引理）&nbsp;&nbsp;&nbsp; 如果$\{X_n\}$是鞅，$T$是有界的停止时间，也即存在$M>0$满足$P(T \leq M)=1,$ 那么$\mathbb{E}[X_T]=\mathbb{E}[X_0].$
<br>
<br>
<b>定理 3.4</b>（控制收敛定理）&nbsp;&nbsp;&nbsp; 如果$X_n \to X\ \text{w.p.}\ 1,$ 并且存在随机变量$Y$满足$\mathbb{E}[|Y|]<\infty$和对于所有$n$有$|X_n| \leq Y,$ 那么$\lim\limits_{n \to \infty} \mathbb{E}[X_n]=\mathbb{E}[X].$
</p>
</body>

## 3.2 解题思路
***

<body>
<p>
不难得到，对于前$\tau-3$个玩家（也即除了最后三个的所有玩家），每个人都将损失一颗糖果（无论下注了一次、两次还是三次）。第$\tau-2$个玩家连赢三次，得到了七颗糖果。第$\tau-1$个玩家下注一颗糖果给$T$并且输了，损失一颗糖果。第$\tau$个玩家下注一颗糖果给$H$但整个游戏结束了（因为第$\tau-2$个玩家在此时获得了整个游戏的胜利），因此还能得到一颗糖果。因此，$$X_\tau=(\tau-3)(-1)+7+(-1)+1=-\tau+10.$$ 我们可以令$T_m=\min(\tau, m),$ 那么根据定理3.3，$\mathbb{E}[X_{T_m}]=0.$ 并且因为$|X_n-X_{n-1}| \leq 7,$ 我们可以找到$Y=7\tau, \mathbb{E}[\tau]<\infty$满足定理3.4，那么$\lim\limits_{m \to \infty} \mathbb{E}[X_{T_m}]=\mathbb{E}[X_\tau].$ 因此，$\mathbb{E}[X_\tau]=\mathbb{E}[X_0]=0.$
<br>
<br>
所以，$0=\mathbb{E}[X_\tau]=\mathbb{E}[-\tau+10],$ 也即$\mathbb{E}[\tau]=10.$ 这一结论与上一个方法一致，并且省略了寻找平稳分布的过程。
</p>
</body>