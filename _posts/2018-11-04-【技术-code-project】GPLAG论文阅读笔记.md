---
layout:     post                    # 使用的布局（不需要改）
title:      GPLAG论文阅读笔记               # 标题 
subtitle:   数据挖掘视角 #副标题
date:       2018-11-04              # 时间
author:     Helena Wang                      # 作者
header-img: img/post-bg-2015.jpg    #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - 程序设计语言
    - codenet
---
# GPLAG论文阅读笔记

注：这篇是第一遍读这篇论文时的笔记的整理，挖了很多坑，还没有填满。后续再读一读，会更新这篇的。

GPlag的论文。居然分类也是数据挖掘。韩家炜老师的团队嘛，理所当然了。

## 数据挖掘视角

首先，看看作者是如何用数据挖掘的观点来剖析抄袭检测问题的。
> From a knowledge discovery point of view, the detection of core-part plagiarism is actually an interesting data mining problem. In the first place, plagiarism detetion is in essence to find from source code interesting patterns that uncover disguised code changes. These patterns should be an intrinsic representation of programs such that they are hardly overhauled in plagiarism. In the second place, because the plagiarized core parts only account for a small portion of the entire program, ifnding these real plagiarized parts is like anomaly detection. Finally, ... should scale to large programs in both accuracy and efficiency. ... These three factors altogether make core-part plagiarism detectiona challenging, as well as interesting, data mining problem.

> Intuitively, PDGs encode the program logic, and in turn reflect developers' thinking when code is written. Code changes regardless of dependencies are prone to errors, and a plagiarist who wants to alter PDGs through code chagnes should understand the program first. Thus, a plagiarist can freely modify the code, but as long as the program correctness is preserved, the dependence graph is hardly overhauled.

这里表示，只要保持程序语义不变，那么PDG是不会有太大改动的。

> Although an extraordinarily creative and diligent plagiarist may correctly overhaul the PDGs, the cost is likely higher than rewriting her own code（不明白这里为什么用her而不是his）, which contradicts with incentive of plagiarism.

它这里把一份代码变成一个PDG集合，注意是集合。

> Most PDGs pairs can be excluded from detailedisomorphism testing because they are dissimilar even witha high-level examination. 

原来在这里也是分级处理的。看来这个做法已经非常普遍了，我又有什么理由不用呢。它这里是设计了一个过滤算法，statistical lossy filter，significantly prunes the search space.

忽然觉得，和sensitive对应的词应该就是robust了，敏感 -- 鲁棒。一个易受影响，一个岿然不动。
> Because PDGs are robust to the disguises that confuse current state-of-the-art tools, GPlag is more effective, and hence more suitable for industrial use.

我觉得这个在反病毒上会不会应用更大？

## 形式化定义

看一看它对PDG的形式化定义
> def1. control dependency edge
> There is a control dependency edge from a "control" vertex to a second program vertex if the truth of the condition controls whether second vertex will be executed.
>
> def2. data dependency edge
>There is a data dependency edge from program vertex v1 to v2 if there is some variable var such that:
> v1 may be assigned to var, either directly or indirectly through pointers;
> v2 may use the value in var, either directly or indirectly through pointers;
> There is an execution path in the program from the code corresponding to v1 to the code corresponding to v2 along which there is no assignment to var.
> 
> def3. program dependence graph
>The program dependence graph 注意这里用的是dependence而不是dependency
G for a procesure P is a 4-tuple element G = (V, E, mu, delta) 喜闻乐见的四元组， where
V is the se of program vertices in P
E belongs to V x V is the set of dependency edges, and |G| = |V|
mu: V --> S is a function assigning types to program vertices
delta: E --> T is a function assigning dependency types, either data or control, to edges.
>Therefore, a program dependence graph is a directed, labelled graph, which represents the data and control dependencies within one procedure. It depicts how the data flows between statements, and how statements control or are controlled by other statements.

我觉得这找的其实是关系。关系信息通常是不容易改变的。

原来在这个PDG中，边是有两种类型的，数据依赖和控制依赖。
它的每个vertex又包括一些属性：
vertext id, vertex type, source code 但还是没有解释vertex的属性是怎么确定的。

原来图同构有这么严格的定义。其实是四元组中的四个元素都要满足一定规则下的“同构”。这个已经有点烧脑了。

这里有个gamma-同构，表示的应该是同构子图的节点数大于一个阈值的同构

## 抄袭伪装手段

3.1 plagiarism disguises 抄袭伪装
它这里用Linux发行版代码中的一个工具join做例子，这个例子是一个667行的C语言源程序。其中，make_blank is one of the entire 17 procedures（这里就把procedure子过程 当做函数）。然后自己做了一个抄袭代码，

其中包含了如下伪装手段：

1. format alteration (FA):
   insert and remove blanks and comments
2. identifier renaming (IR):
   identifier names can be consistently changed without violating program correctness. Identifier renaming can confuse human beings, but is almost futile to detection tools.
3. statement reordering (SR):
   some statements can be reordered without causing program errors.

4. control replacement (CR):
   a for loop can be equivalently replaced by a while loop, or by an infinite while loop with a break statement, and vice versa.

5. code insertion (CI):
   immaterial code can be inserted to disguise plagiarism, provided the inserted code does not interfere with the original program logic.

接下来给出了一个review of plagiarism detection，这个可以我在之前的博客里有列出，这里就不写了。
string-based techniques: 注意这里是把一个语句（statement）作为一个string，不是你想象的把一个字符作为一个string。
下面是作者给出的对比

才理解，原来子图同构就是可以找局部相似的。
>A detailed examination of the five kinds of disguises in section 3.1 reveals that while the disguises can significantly alter the source code and the induced token strings, they only insubstantially affect the PDGs.... these disguises will result in a PDG to which the original PDG is subgraph isomorphic.

我觉得，这个像是：文本层面已经面目全非，但PDG变化很微小（未变的部分能检测出子图同构），所以可以从PDG检测出改变。
下面具体分析上述5类disguise对PDG有什么影响

1. format alteration and
2. identifier renaming do not alter the PDG.
   我觉得节点还是有差异的，不知道它这个同构怎么算  
3. statement reordering also leaves the PDG untouched.

two or more statements can be reordered only when they are not bounded by dependencies. 这么说，PDG其实不表达statement之间的顺序执行关系了。

1. control replacement generally leaves g' identical to g.

2. code insertion introduces new program vertices and/or dependencies into g', dependign on what the inserted code does.

下面这段分析的思路值得借鉴
>Therefore, the five kinds of disguises do not hamper the essential part of the original PDG, although they can significantly alter the code appearance and the induced token strings. In fact, the subgraph isomorphism just uncovers what disguises are applied. For example, ... In comparison, we feed the two segments of code into both MOSS and JPlag, and neither of them recognized the similarity. This indicates that PDG-based analysis can detect tricky plagiarism that confuses the staet-of-the-art tools.

我的FCP可以用来做的（和PDG互补的）

1. 系统层面粗略比较
2. 顺序执行关系的比较

对于一些tricky的伪装手段，作者对图同构做了松弛操作，放宽了同构条件，新的同构称为gamma-isomorphic, gamma叫mature rate

对gamma值的设定，作者根据经验设为0.9，这个数字是假定PDG的变化超过10%就基本上需要重写代码了。

## 搜索空间剪枝的策略

4.3 Pruning plagiarism search space
4.3.1 lossless filter

1. smaller than size K
2. |g'| < gamma|g|

4.3.2 lossy filter
这里用了属性计数的方法来做有损过滤（即有可能是FN，会降低召回率），这里的属性向量用的是各类vertex的计数值。
后面说用到了假设检验的方法，比传统的基于距离度量的方法有一些优势。这个假设检验的介绍如下：
>The majoridea is that we first estimate a k-dimensional multinomial distribution Pg(θ1, θ2, · · · , θk) from h(g), and then consider whether h(g') is likely to be an observation from Pg.

没想到曾经怎么都学不懂的假设检验，这会儿真要用了。要是我能穿越，告诉那时的自己就好了。
significance level 是显著性水平
假设检验这一部分我没看懂，再看一看之后补上。

4.3.3 alternatives
讲了为什么不用基于距离的度量，而是用假设检验；为什么不用某个检验方法；以及为什么只用了属性计数而没用fingerprint。注意这里不用fingerprint是因为计算代价高。

4.4 computational feasibility 计算上的可行性
真的是贫穷限制了我的想象力。子图同构虽然是NP-complete问题，但近几十年也有比较好的方法能解决大部分问题了。
>Although subgraph isomorphism is NP-complete in general, research in the past three decades has shown that some algorithms are reasonably fast on average and become computationally intractable only in a few cases. For example, algorithms based on backtracking and look-ahead, e.g., Ullmann's algorithm and VF are comfortable with graphs of hundreds or thousands of vertices.

>We wrote a Scheme program to derive and simplifythe PDGs from CodeSurfer1via its provided APIs.

>control dependencies are excluded from consideration

具体实现上居然没加控制流

它这里的PDG提取直接用的商业软件 CodeSonar https://www.grammatech.com/products/codesonar 
这个产品现在还活着，活得挺好。已经有很多customers，我发现都是嵌入式软件相关的企业或机构，比如西门子、GE、NASA，没有互联网企业。

实验数据，就是linux下的几个工具：join, bc, less, tar 没想到一个less，源代码都上万行了。
>The join program is mainly used for eﬀectiveness evalu-ation. We spent two hours plagiarizing it such that bothMoss and JPlag were confused. 

花了两个小时伪装一个抄袭版本，达到让MOSS和JPlag都糊涂的水平。
注意它这个实验设计的是一套实验，分了三个小实验，分别为了验证方法的有效性、效率。我也可以借鉴。

>Because all the three tools are ro-bust to format alteration and identiﬁer renaming, these twokinds of disguises were skipped.

对比工具能解决的，就不做了。只做他们解决不了的
它的抄袭版本的生成，策略如上。但是，是纯手工做的吗
还用德摩根律改变表达式了。

>The above plagiarism took us about two hours, which sug-gested that nontrivial work is needed to confuse token-baseddetections manually. 

还真是手工做的，不过只处理了600多行的那个程序

>However, we notice that the above pla-giarism is mechanical to apply, and with some eﬀorts, theplagiarism can be (at least partially) automated. In con-sequence, confusing token-based algorithms is not laboriousany more.

唉，说能自动化，你为啥没自动化呢

单纯讲效率的实验中，其实并没有做抄袭版本，只是把原版当抄袭版了。
整个实验分析还需要再看一遍，第一遍好多地方没看懂。

## Discussions部分

>7.1 related work
the program dependence graph, first proposed by Ferrante et al., has previously been used in the identification of duplicated code for the purpose of software maintenance.
There are studies on detection ofother kinds of plagiarism, such as plagiarized research pa-pers, homework answers, and Web pages [3]. The natureof such plagiarism is rather diﬀerent from that of softwareplagiarism which often requires more sophisticated analysis. 

讲了非代码的抄袭检测方法为什么不适用与代码的。就冲这句式和逻辑，这篇文章值得再读

>7.2 implications to software industry
Software plagiarism has been an important issue in soft-ware industry for intellectual property and software licenseprotection, especially for open source projects.

但是对下面这句，我有疑问
>Even inpractice when software of millions of lines of code is encoun-tered, GPlag may be still applicable because one compo-nent only needs to be compared with its counterpart.

如何recognize the counterpart？

## 参考资料

[1] Chao Liu, Chen Chen, Jiawei Han, and Philip S. Yu. 2006. GPLAG: detection of software plagiarism by program dependence graph analysis. In Proceedings of the 12th ACM SIGKDD international conference on Knowledge discovery and data mining (KDD '06). ACM, New York, NY, USA, 872-881. DOI=http://dx.doi.org/10.1145/1150402.1150522
