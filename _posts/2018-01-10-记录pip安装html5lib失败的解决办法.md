---
layout:     post
title:      记录pip安装html5lib失败的解决办法
subtitle:   下载的依赖没法用[pip install 依赖名]的方法安装，一番折腾，折腾出这个解决办法
date:       2018-01-10
author:     某清
header-img: img/post-bg-py.jpg
catalog: true
tags:
    - Blog
    - python
---
# 前言

网上看到的html5lib安装方法基本都是从
>[https://www.lfd.uci.edu/~gohlke/pythonlibs/](https://www.lfd.uci.edu/~gohlke/pythonlibs/)
这里下载的依赖，然后命令行输入
>pip install 依赖名

的方法安装的，亲测几遍都失败，于是查了查找到了html5lib的依赖库，下载下来
>[https://github.com/html5lib/html5lib-python](https://github.com/html5lib/html5lib-python)

解压，进入解压后的目录，按住[shift][鼠标右键]，选择[在这里打开命令行]  
输入
>X:\Python27\python.exe setup.py install

回车，完成.  (X:\Python27\python.exe这个是电脑的python的安装路径)
操作下如图，跑一堆代码之后，就安装成功了
[![](https://github.com/shiqingk/shiqingk.github.io/blob/master/img/blog-py-01.png?raw=true)](http://shiqingk.github.io/)
