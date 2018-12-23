---
layout:     post
title:      CocoaPods 安装和使用
subtitle:   安装时间 2018/12/20, 环境macOS 10.14.2, cocoapod版本 1.5.3
date:       2018-12-20
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - iOS
    - Xcode
    - Cocopods
---

# 前言
之前一直在做Android原生开发，最近学习React Native，没法 react-native run-ios
cocoapod 是Mac上开发 Object-C 需要的依赖管理工具


## 安装


#### 安装CocoaPods

1. 安装
	
    sudo gem install cocoapods

2. 升级版本库

    pod setup

	这里需要下载版本库（非常庞大），需要等很久
	
		Receiving objects:  72% (865815/1197150), 150.07 MiB | 190.00 KiB/s

	或者直接从其他装有cocoapod的电脑中拷贝`~/.cocoapods`到你的用户目录，然后再`pod setup`会节省不少时间

# 使用

#### 加载代码库

使用下面的命令，直接在本地版本库中查找对应的代码库信息，不升级版本库，节省时间

	pod install --verbose --no-repo-update

若找不到库，再使用下面的命令

	pod install

    // 或在 RN 工程下的 ios 目录下执行
    cd project/RnProject/untitled/ios
    pod install

#### 版本号
    查看 安装的版本
    pod --version

# 结语

关于**CocoaPods**的安装和使用就这样简单的介绍完了，至于更多使用的方法（平时也用不到~）你可以用下面命令查看
	
	$ pod
	
若对 CocoaPods 的**个人仓库**感兴趣，也可以看看这两篇博客

- [CocoaPods公有仓库的创建](http://qiubaiying.top/2017/03/08/CocoaPods%E5%85%AC%E6%9C%89%E4%BB%93%E5%BA%93%E7%9A%84%E5%88%9B%E5%BB%BA/)
- [CocoaPods私有仓库的创建](http://qiubaiying.top/2017/03/10/CocoaPods%E7%A7%81%E6%9C%89%E4%BB%93%E5%BA%93%E7%9A%84%E5%88%9B%E5%BB%BA/)
 
 > 本文首次发布于 [TL Blog](http://tanliner.github.io), 作者 [@谭林(Ltan)](http://github.com/tanliner) ,转载请保留原文链接.
