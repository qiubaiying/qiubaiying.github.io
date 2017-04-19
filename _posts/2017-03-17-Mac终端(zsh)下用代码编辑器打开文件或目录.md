---
layout:     post
title:      

subtitle:   更改 zsh 配置文件，在终端使用sublime、vscode、atom快速打开文件或目录
date:       2017-03-17
author:     BY
header-img: img/post-bg-debug.png
catalog: true
tags:
    - Mac
    - 效率
    - 终端
    - zsh
---

# 前言

 最近在喵神 onevcat 的直播中发现喵神直接在终端就能用 vsCode 打开当前代码目录，非常方便。
 
 在`zsh`终端中 使用 `code .`，在 **vcCode** 打开当前文件目录

![](https://ww2.sinaimg.cn/large/006tKfTcgy1fdpxob9m7sj31000rkam7.jpg)
 

# 正文

## 配置终端环境

终端环境为：[iTerm2](https://www.iterm2.com/) + [zsh](https://wiki.archlinux.org/index.php/Zsh_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))

zsh 使用 [oh_my_zsh](http://ohmyz.sh/) 配置


## 安装zsh

#### 查看你的系统有几种shell

	cat /etc/shells

显示

	/bin/bash
	/bin/csh
	/bin/ksh
	/bin/sh
	/bin/tcsh
	/bin/zsh
	
#### 安装 oh my zsh

	git clone git://github.com/robbyrussell/oh-my-zsh.git ~/.oh-my-zsh
	cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc

重新打开终端，输入 
	
	zsh

即可切换终端，并且发现 oh my zsh 已经帮我们配置好 zsh 了

#### 修改主题

	open ~/.zshrc 
	
修改 `ZSH_THEME=”robbyrussell”`，主题在 ~/.oh-my-zsh/themes 目录下。
修改为

	ZSH_THEME="kolo"

可以[参照这里](https://github.com/robbyrussell/oh-my-zsh/wiki/themes)进行选择.

#### 设置为默认shell

	chsh -s /bin/zsh

## 修改 `zsh` 配置文件

	$ open ~/.zshrc
	
在文件中加上这几行代码

对应 atom、SublimeText、与 vcCode。

	alias atom='/Applications/Atom.app/Contents/MacOS/Atom'
	alias subl='/Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl'
	alias code='/Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code'

#### 测试
使用 vcCode 打开
	
	$ code .
	
> 本文首次发布于 [BY Blog](http://qiubaiying.github.io), 作者 [@柏荧(BY)](http://github.com/qiubaiying) ,转载请保留原文链接.