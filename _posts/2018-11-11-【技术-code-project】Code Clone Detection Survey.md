---
layout:     post                    # 使用的布局（不需要改）
title:      Code Clone Detection Survey               # 标题 
subtitle:   一篇高水平胜过100篇低水平 #副标题
date:       2018-11-11              # 时间
author:     Terry Wang                      # 作者
header-img: img/post-bg-2015.jpg    #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - 程序设计语言
    - codenet
---

# Code Clone Detection Survey

## 缘起

之前搜关键字code similarity 或 plagirism detection，搜到的高水平的论文（CCF推荐列表[1]中的）很少，偶然换了个关键词，搜clone detection后，简直是打开了新世界的大门，这才是正在一直活跃着的领域，顶会论文不断。而且论文[2]认为plagiarism detection是clone detection的一个应用。所以，下一步的调研转向clone detection，并且想强调一下，看论文一定要先看层次，读一篇高水平的胜过读100篇低水平的。

读过几篇近年顶会（ICSE为主）的论文，我才发现自己之前做的调研（国内论文为主）简直是落后于国际水平十年。十多年前的论文总说这个领域“缺乏benchmark”，对“type”缺乏统一的定义。结果在2014年，数据量很大的人工标注的benchmark开始被提出，而且被广泛用在后续的顶会paper上。而且，对"clone type"的分类也在2007年开始慢慢形成了如今公认的分类。下面我会一一介绍。

## Clone Type

对于克隆类型的分类体系，比较权威的定义是2016发表在ICSE上的SourcererCC工具的论文[3]总结的四大类，分别是：

Type-1(T1): 完全一致或只修改了空白符、布局和注释。
>Identical code fragments, except for diﬀer-ences in white-space, layout and comments.

Type-2(T2): 修改了标识符名、字面值
>Identical code fragments, except for diﬀer-ences in identiﬁer names and literal values, in addition toType-1 clone diﬀerences.

Type-3(T3): 对语句进行了增加、删除、改动。
>Syntactically similar code fragments thatdiﬀer at the statement level. The fragments have statements added, modiﬁed and/or removed with respect to each other,in addition to Type-1 and Type-2 clone diﬀerences.

Type-4(T4): 语法结构上不相似，实现的功能一致。
>Syntactically dissimilar code fragments that implement the same functionality

## Benchmark

2014年提出的BigCloneBench[4]是目前使用比较广泛的clone detection的benchmark。数据集为Java语言，看名字就能想到数据集的规模会不小。这个数据集是由算法+人工标注的，方法就是给定一些功能，搜索它的实现代码，然后人工校正。

目前他们还配合这个数据集开发了一个clone detector评测工具BigCloneEval，地址为[https://github.com/jeffsvajlenko/BigCloneEval](https://github.com/jeffsvajlenko/BigCloneEval)
鉴于这个数据集比较权威，我也会尽量用它来做实验的。

另外，我发现这个团队真是clone detection这个研究课题的顶会论文大户，从2014年起，年年能在顶会上看到他们的新作品，而且都是在以往工作的基础上做的后续工作，传承的感觉很强。

## State-of-the-art tools

近些年（2015至今）顶会上的clone detection通常会和以下几个工具做对比实验，我把它们总结成下面的表格：
|工具|发表时间|原理|能支持的clone type|
|----|----|----|----|
|CCFinderX[5]|2002|token-based|Type-1|
|Deckard[6]|2007|tree-based, vector-based|Type-4|
|NiCad[7]|2008|code normalization, line-based|near-miss clone|
|iClones[8]|2009|token-based|Type-1,2|
|SourcererCC[3]|2016|tokens-based, information search methodology|Type-3|

## 参考资料

[1] CCF推荐国际学术刊物与会议(软件工程/系统软件/程序设计语言) [https://www.ccf.org.cn/xspj/rjgc/xtrj/cxsjyy/](https://www.ccf.org.cn/xspj/rjgc/xtrj/cxsjyy/)
[2] Roy, Chanchal Kumar and James R. Cordy. “A Survey on Software Clone Detection Research ∗.” (2007).
[3] Sajnani, Hitesh, et al. "SourcererCC: scaling code clone detection to big-code." Software Engineering (ICSE), 2016 IEEE/ACM 38th International Conference on. IEEE, 2016.
[4] Svajlenko, Jeffrey, et al. "Towards a big data curated benchmark of inter-project code clones." 2014 IEEE International Conference on Software Maintenance and Evolution (ICSME). IEEE, 2014.
[5] Kamiya T, Kusumoto S, Inoue K (2002) CCFInder: a multilinguistic token-based code clone detection systemfor large scale source code. Trans Softw Eng 28(7):654–670
[6] Jiang L, Misherghi G, Su Z, Glondu S (2007a) DECKARD: scalable And accurate tree-based detection ofcode clones. In: ICSE’07, pp 96–105
[7] C. K. Roy and J. R. Cordy, "NICAD: Accurate Detection of Near-Miss Intentional Clones Using Flexible Pretty-Printing and Code Normalization," 2008 16th IEEE International Conference on Program Comprehension, Amsterdam, 2008, pp. 172-181.
[8] G¨ode N, Koschke R (2009) Incremental clone detection. In: CSMR’09, pp 219–228
