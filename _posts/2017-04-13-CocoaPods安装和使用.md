---
layout:     post
title:      CocoaPods 安装和使用 2017.04
subtitle:   安装时间 2017/04/13, 环境macOS 12.10.1， cocoapod版本 1.2.1
date:       2017-04-13
author:     BY
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - iOS
    - Xcode
    - Cocopods
    - ruby
---

# 前言

最近换了新机器，重新搭建了开发环境，其中当然包括 **CocoaPods**。

装完顺便更新下 **CocoaPods** 安装文档。


# 正文

CocoaPods是用Ruby实现的，要想使用它首先需要有Ruby的环境。

## 升级ruby

	查看ruby版本 
	$ ruby -v
	
	ruby 2.0.0p648 (2015-12-16 revision 53162) [universal.x86_64-darwin16]

CocoaPods需要**2.2.2**版本及以上的，我们先升级ruby。

使用**rvm**安装ruby
	
	curl -L get.rvm.io | bash -s stable 
	source ~/.bashrc
	source ~/.bash_profile

Ruby的软件源使用亚马逊的云服务被墙了，切换国内的 **ruby-china源** （<https://ruby.taobao.org/>已经停止维护，详情[查看公告](https://ruby.taobao.org/)）：

	$ gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
	$ gem sources -l
	*** CURRENT SOURCES ***
	
	https://gems.ruby-china.org
到此ruby升级完毕

## 安装CocoaPods

1. 安装
	
		sudo gem install -n /usr/local/bin cocoapods
2. 升级版本库

		pod setup
		
	这里需要下载版本库（非常庞大），需要等很久
	
		Receiving objects:  72% (865815/1197150), 150.07 MiB | 190.00 KiB/s
	
	或者直接从其他装有cocoapod的电脑中拷贝`~/.cocoapods`到你的用户目录，然后再 `pod setup`会节省不少时间
	

