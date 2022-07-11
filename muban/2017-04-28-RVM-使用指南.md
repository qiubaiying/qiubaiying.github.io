---
layout:     post
title:      RVM 使用指南
subtitle:   RVM 常用的命令整理
date:       2017-04-28
author:     BY
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - iOS
    - RVM
    - shell
    - ruby
---

> RVM 常用的命令整理

RVM 是一个命令行工具，可以提供一个便捷的多版本 Ruby 环境的管理和切换。<https://rvm.io/>

我相信做为iOS开发者，对ruby的使用都是从安装 **CocoaPods** 开始的吧~

>**Note**：这里所有的命令都是再用户权限下操作的，任何命令最好都不要用 sudo.

## RVM 安装

	$ gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
	$ \curl -sSL https://get.rvm.io | bash -s stable
	$ source ~/.bashrc
	$ source ~/.bash_profile
	
修改 RVM 的 Ruby 安装源到 [Ruby China](https://ruby-china.org/) 的 Ruby 镜像服务器，这样能提高安装速度

	$ echo "ruby_url=https://cache.ruby-china.org/pub/ruby" > ~/.rvm/user/db
	
## Ruby版本的安装与切换

列出已知的 Ruby 版本

	rvm list known
	
安装一个 Ruby 版本

	rvm install 2.2.0 --disable-binary
	
切换 Ruby 版本

	rvm use 2.2.0
	
如果想设置为默认版本，这样一来以后新打开的控制台默认的 Ruby 就是这个版本

	rvm use 2.2.0 --default 
	
查询已经安装的ruby
	
	rvm list
	
卸载一个已安装版本

	rvm remove 1.8.7
	
	
>参考：<https://ruby-china.org/wiki/rvm-guide>