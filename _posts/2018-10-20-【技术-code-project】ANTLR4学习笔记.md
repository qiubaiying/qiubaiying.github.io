---
layout:     post                    # 使用的布局（不需要改）
title:      ANTLR4学习笔记               # 标题 
subtitle:   "Why program by hand in five days what you can spend twenty-five years of your life automating?" #副标题
date:       2018-10-20              # 时间
author:     Helena Wang                      # 作者
header-img: img/post-bg-2015.jpg    #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - 程序设计语言
    - codenet
---
# ANTLR4学习笔记

## 缘起

最近尝试实现自己的代码相似度计算程序，发现几篇论文中都用到了ANTLR4[1-3]这个工具，于是找来学习一下。下面对这一周学到的东西做个整理。

## ANTLR4是什么

ANTLR 是 "Another Tool for Language Recognition" 的缩写（这个名字，很有程序员界的特色），由Terence Parr 1989年开始开发，官方网站是[http://www.antlr.org/](http://www.antlr.org/). Terence Parr 大神在他写的书《The Definite ANTLR Reference》中这样描述ANTLR的诞生：

> ANTLR v4 is the result of a minor detour (twenty-five years) I took in graduate school. I guess I'm going to have to change my motto slightly.
> "Why program by hand in five days what you can spend twenty-five years of your life automating?"

大概是说自己花了25年把硕士期间写的程序给自动生成了吧。（这是我的一点理解，有不同见解欢迎指正。）

ANTLR 的定位是“解析器的生成器(parser generator)”，输入语法，即可获得对应的词法分析、语法分析器，并且可以自行为语法添加语义动作。已有论文用ANTLR4生成语法树[1,2]、控制流图[3]。  

ANTLR4 和同类的其他生成器（如Lex, Yacc, JavaCC）相比的一个优势是提供了一套通用的语言解析框架，我觉得基本上就是编译的前端部分：
> 词法分析 -> 语法分析 -> 语义动作执行和中间代码生成

其中，词法分析和语法分析器是可以通过输入语法分析然后由ANTLR自动生成的，而语义动作需要自行嵌入。在作者的书[4]中，给出了一个language recognizer的data flow，如下图：
![data flow of language recognizer](https://imgchr.com/i/iBmd7F)

## 我要用ANTLR4做什么

我要做的是从源代码中提取函数调用的信息，来助力我的代码相似度计算。我设计的新图比控制流图更精简，因此可以沿用在parse的过程中生成控制流图的思路，利用ANTLR的listener API实现在parse的过程中监听各种规则进入事件和退出事件，记录感兴趣的信息。  

具体地，ANTLR4 可以为语法分析器生成监听器接口(Listener)以及监听器的基类(BaseListener)实现，用户可以通过继承基类，重写一些监听方法，来嵌入语义动作以提取信息。

参考书[4]给出了一个生成函数调用图（Call Graph）的例子，面向的是Cymbol语言（C语言的一个简化版）。而我要提取的函数调用信息和这个例子的不同之处在于：

1. 面向的语言不同（C++ vs. Cymbol），所以语义动作的嵌入有变动。
2. 有向图中边的含义不同：例子所定义的图中边表示的是函数间的嵌套调用关系，而我希望提取的是执行路径。
3. 是否考虑控制流：例子未考虑控制流，为每个函数定义分配一个节点；而我需要把控制流的信息加进来，所以目前打算为每个函数调用实例分配一个节点。

我参考这个例子以及论文[3]的思路为每类控制节点维护一个栈，通过栈顶与当前节点的连接实现执行路径的静态提取。目前基本支持if-else这样的分支结构，对于循环结构会在后续加入支持，写好后会发布一个在线体验的工具，欢迎关注。

## 参考资料

[1]张刘毅. 基于抽象语法树和改进粒子群算法的代码同源性分析[D]: 东南大学, 2017.  
[2]李彦臣. 基于后缀语法树的代码抄袭检测研究[D]: 内蒙古师范大学, 2011.  
[3]任浩. 基于C程序的控制流图生成器的设计和实现[J] 电脑编程技巧与维护, 2013.  
[4]Terence Parr. The Definitive ANTLR 4 Reference. 2013
