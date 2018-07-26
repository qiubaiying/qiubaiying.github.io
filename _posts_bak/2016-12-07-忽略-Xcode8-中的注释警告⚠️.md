---
layout:     post
title:      忽略 Xcode 8 中的注释警告
subtitle:    Bulid Settings -> Documentation Comments -> NO
date:       2016-12-07
author:     BY
header-img: img/post_bg_debug.png
catalog: true
tags:
    - iOS
    - Xcode
---

#### 原因

从Xcode8.0开始，引入了文档注释警告，虽然是件好事，可是各种三方库爆出了一大堆警告：


![](http://ww2.sinaimg.cn/large/7853084cgw1fai8d9fu90j20ko0kpk21.jpg)

#### 解决方法：

`Bulid Settings` -> `Documentation Comments` -> **`NO`**

![](http://ww1.sinaimg.cn/large/7853084cgw1fai8e613e5j20kk03cdga.jpg)


