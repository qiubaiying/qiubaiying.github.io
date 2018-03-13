---
layout:     post
title:      Linux环境升级Python版本以及setuptools、pip
subtitle:   Linux环境升级Python版本以及setuptools、pip
date:       2018-03-13
author:     陈宇轩
header-img: img/app.ico
catalog: Python

---

# 前言

>开发环境搭建之初只升级了Python版本从2.6到2.7.10，但是包的管理工具却没有相应的做出修改，导致安装python包时各种无法预知的错误出现，痛苦不堪，这次因为虚拟机空间满了不得不重新搭建一个环境，因此这次一次性解决这个问题。

# 正文
#### 1.下载python新版本，解压安装 


可能会用到的命令wget yum tar,资源包可以直接去Python官网找


#### 2.修改python命令执行路径


mv /usr/bin/python /usr/bin/python2.6 //修改原2.6脚本

ln -s /usr/local/bin/python2.7 /usr/bin/python   //简历软连接，注意第一个路径是新安装的python版本路径，而第二个路径是系统默认路径

修改完成，此时输入python -V或者python就看看到版本号已经修改到了新安装的版本

####3.按照同样的方法修改easy_install (如果存在的话)，pip

####4.安装pymssql

这里需要注意，pymssql需要一些基础类库。
安装基础类库：
pip install Cpython
yum install freetds-devel.x86_64

最后
pip install pymssql

####股票


今天，在大盘一片绿的情况下，三六零(601360)跌到48.8,买了100股，中午一觉醒来从跌2个点到了涨3个点，随后一路狂涨，直接涨停，收盘的时候小赚500块钱。

理一下买360的逻辑，最近互联网等概念炒的特别火，360股价一直在50上下震荡，跌到48块钱的时候基本上可以买入了，但是后来一路狂涨，倒是预料之外，晚上看一下复盘，做一下记录。

**交易的时候尽量做到理智，心情不好的时候要忍住不交易。

