---
layout:     post
title:      Mac 文件的隐藏与显示
subtitle:   使用终端 显示/隐藏 文件
date:       2017-02-22
author:     BY
header-img: img/post-bg-debug.png
catalog: true
tags:
    - Mac
    - 终端
---

> 让 Finder 显示隐藏文件和文件夹

# 基本

#### 显示

	$ defaults write com.apple.finder AppleShowAllFiles -boolean true ; killall Finder

#### 隐藏

	$ defaults write com.apple.finder AppleShowAllFiles -boolean false ; killall Finder
	
# 进阶

创建终端快捷命令

在 **zsh** shell 下，创建快捷命令

#### 创建显示命令 fd （fileDisplay）
	$ echo "alias fd='defaults write com.apple.finder AppleShowAllFiles -boolean true ; killall Finder'">> ~/.zshrc && source ~/.zshrc
	
#### 创建隐藏命令 fh（fileHide）

	$ echo "alias fd='defaults write com.apple.finder AppleShowAllFiles -boolean false ; killall Finder'">> ~/.zshrc && source ~/.zshrc

使用方法

显示隐藏文件
	
	$ fd
隐藏文件

	$ fh
	
	