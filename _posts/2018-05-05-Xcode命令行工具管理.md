---
layout:     post
title:      Xcode命令行工具管理
subtitle:   如何切换Xcode命令行工具
date:       2018-05-05
author:     BY
header-img: img/post-bg-kuaidi.jpg
catalog: true
tags:
    - Xcode
    - iOS
---

## 安装

	xcode-select --install

![](https://upload-images.jianshu.io/upload_images/545662-f9031dfcce085f8f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/459)

## Xcode版本切换

### 显示当前使用的xocde版本

	$ xcode-select --print-path
	
### 选择Xcode中的默认版本

	$ sudo xcode-select -switch /Applications/Xcode.app