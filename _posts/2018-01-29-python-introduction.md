---
layout:     post
title:      python简介
subtitle:   python概述
date:       2018-01-29
author:     Hansi
header-img: img/post-bg-python
catalog: true
tags:
    - python 简介
---

## 简介
Python是一种解释型、面向对象、攻台数据类型的高级程序设计语言。是由Guido valn Rossum在1989年发明的。目前python分化为两个版本，2.x和3.x，并且根据官方所属，2.x的版本将在2020年之后不再提供bugfix。
**Being the last of the 2.x series, 2.7 will have an extended period of maintenance. The current plan is to support it for at least 10 years from the initial 2.7 release. This means there will be bugfix releases until `2020`.**

不过我们无需担心这个，一是2转换成3，很简单，二是XP退出历史舞台也好久了，现在它的份额也还是占了[5.18](http://tech.sina.com.cn/roll/2018-01-02/doc-ifyqcsft9369284.shtml) 左右。


目前，根据2018-01月的TIOBE排行榜，Python使用的人数是处于中上游的。

![](https://huhansi.github.io/huhansi/img/2018-01-tiobe-python.png)

上面的几款编程语言，各有千秋，如果追求代码执行速度和效率，首选C/C++，它们是比较贴近硬件的语言，著名的*Unix系统就是用C写的；如果需要编写大型的企业级应用，那么可以考虑下Java。

Python给我们提供了非常丰富的库，覆盖了网络、文件、GUI、数据库、文本等大量内容。

## 安装
首先，从python[官网](https://www.python.org/)上下载最新的2.x版本，这边是2.7.14。

下载完成之后，双击msi安装包，一直点击next，只需注意勾选安装pip和将python添加的环境变量中。如下图所示
![](https://huhansi.github.io/huhansi/img/180129-before-enable-pip.png)


将Add python.exe选中，next。


![](https://huhansi.github.io/huhansi/img/180129-after-enable-pip.png)

安装完毕时候，打开控制台，输入python，出现以下类似场景则证明安装成功。

![](https://huhansi.github.io/huhansi/img/180129-install-python-success.png)


至此，python安装完成。