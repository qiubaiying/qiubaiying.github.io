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



# Reference


