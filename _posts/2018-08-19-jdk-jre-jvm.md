---
layout:       post
title:        "浅出JDK、JRE和JVM三者概念"
subtitle:     "一个极方便创建略缩图的工具包"
date:         2018-08-19 10:42:05
author:       "Hyuga"
header-img:   "img/2018-08-19/head-top-1.jpg"
header-mask:  0.3
catalog:      true
multilingual: false
tags:
    - jvm
---

## 什么是JDK

JDK(Java Development Kit) 是 Java 语言的软件开发工具包(SDK)，是整个java开发的核心，它包含了JAVA的运行环境（JVM+Java系统类库）和JAVA工具。

## 什么是JVM
在JDK的安装目录下有一个jre目录，里面有两个文件夹bin和lib，在这里可以认为bin里的就是jvm，lib中则是jvm工作所需要的类库

## 什么是JRE
jvm和 lib合起来就称为jre
* 包含JVM标准实现及Java核心类库
* JRE是Java运行环境，并不是一个开发环境，所以没有包含任何开发工具（如编译器和调试器）

---
百度百科：
> JVM是Java Virtual Machine（Java虚拟机）的缩写，JVM是一种用于计算设备的规范，它是一个`虚构出来的计算机`，是通过在实际的计算机上仿真模拟各种计算机功能来实现的。

### 三者关系
![](/img/2018-08-19/jdk_jvm_jre.png)

- JDK：就是平时下载的jdk安装包，安装目录包含了jre包和很多基础类库，以及编译调试等工具。是整个Java的核心，包括了Java运行环境JRE、Java工具和Java基础类库。
- JVM：java跨平台的基础，位于安装目录jre/bin。只要针对不同系统开发不同的jvm（可浅显理解为更换/jre/bin），则同一份class源码无需再编译即可在不同的平台上运行。
- JRE：java的运行环境，包含JVM标准实现及Java核心类库。
