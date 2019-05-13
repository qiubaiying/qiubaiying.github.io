---
layout:     post   				    # 使用的布局（不需要改）
title:      错误解决 				# 标题
subtitle:   ImportError: No module named extern #副标题
date:       2019-05-13 				# 时间
author:     Liu 						# 作者
header-img: img/post-bg-2015.jpg 	#这篇文章标题背景图片
catalog: true 						# 是否归档
tags:								#标签
    - python
    - bug report
    - ImportError
    - extern
---
# 错误解决：ImportError: No module named extern

## 解决方法：

sudo apt-get install --reinstall python-setuptools

## 问题分析

```
> easy_install iso-639
Traceback (most recent call last):
  File "/usr/local/bin/easy_install", line 6, in <module>
    from setuptools.command.easy_install import main
  File "/usr/local/lib/python2.7/dist-packages/setuptools/__init__.py", line 10, in <module>
    from setuptools.extern.six.moves import filter, map
  File "/usr/local/lib/python2.7/dist-packages/setuptools/extern/__init__.py", line 1, in <module>
    from pkg_resources.extern import VendorImporter
ImportError: No module named extern
```

之前一直在试着不断地解决依赖问题，然后发现陷入了循环中，安装extern本身就需要extern，这不是一个死循环吗？然后我就放弃解决这个问题。

今天又仔细看了一下错误信息，发现extern的错误是由setuptools这个包引起的，那么重装setuptools这个包能不能解决问题呢？之前反而可能是我陷入思维误区了。

在网上搜索了一下果然有人是这样子解决问题的。
[原文](https://stackoverflow.com/questions/35446765/importerror-no-module-named-extern)
