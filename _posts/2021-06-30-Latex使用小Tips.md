---
layout:     post
title:      Latex，使用Tips
subtitle:    论文提交的latex解决方案
date:       2021-06-30
author:     Xuan
header-img: img/post-bg-1.jpg
catalog: true
tags:
    - Latex 
---

# Latex 使用 Tips

## 审稿阶段

1.改动标红 
- 高亮 
```
\sethlcolor{red} 
\hl{需要标红的文字}
```
- 字体红色 
```
\usepackage{color} 
\textcolor{red}{需要标红的文字}
```

2.显示行号
```
\usepackage{lineno}
\linenumbers
```


## 论文准备阶段
### 制作表格
1.[表格代码生成器](https://www.tablesgenerator.com/)

2.让文字竖排
```
\rotatebox[origin=c]{90}{文字}
```

3.让表格翻转
```
\begin{sidewaystable}
\end{sidewaystable}
```
4.表格居中
```
\begin{center}
\begin{tabular}
... ...
\end{tabular}
\begin{center}
```

5.表格位置

!htbp应该是这样的：

- **!**: 表示无视美学规则按下面的要求放置；
- h(here):放置在当前位置；
- t(top): 放在该页顶端；
- b(bottom): 放在该页底部；
- p(page): 另起一页单独放；

你也可以自己定优先级, [htbp]分别代表4中放置方式优先级依次递减.

6.表格字体设置

由小到大依次为：

- \tiny
- \scriptsize
- \footnotesize
- \small
- \normalsize
- \large
- \Large
- \LARGE
- \huge
- \Huge


# Reference



TIME：27-Jul-2021

情绪警报 (😫😫😫)

1. 梳理相识时间线分歧，虽然我是追求方，但期间你也有不止一次主动靠近过我。？？这有什么好不承认的？？有靠近过我是多让你难为情？？？ （1 am）

2. 最后的交流： 意识到你也情绪不对，问你。跟我说后悔了？？？？！！！ （1:30 am）

3. 冷漠，自己睡了。（失眠到 3:30 am）

4. 持续冷漠，没有问候，关心。（3 pm）

害，本来觉得纪录会帮助自己平静，释怀；结果反而更难过，觉得自己可悲。

之前还一度觉得自己改变了，成熟了。不再那么没耐心，更愿意先自己冷静的想一想，独自解决自己的负面情绪。
忽然发现，这样的改变更多的别无选择的选择。 
他根本不会关注到你的情绪，你的感受; 即使意识到了也不会想管你，给自己徒增烦恼。

Anyway，张璇，你活该，你忘了你要始终提醒自己的事情了！问问自己，还能平静的接受之前的设定么？
你要问问自己 你就是喜欢人家比人家喜欢你多，你就该受着，他就是不在乎你的难过，你OK？

不能平静接受，会愤怒💢，会调节不好情绪，会很影响我根本干不好自己的事情。


上次同样的情况，跟我说下次不会了，还是一样冷漠。


