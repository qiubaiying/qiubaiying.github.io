---
layout:     post
title:      使用 .gitignore 忽略 Git 仓库中的文件
subtitle:   .gitignore 文件在Git中的使用
date:       2017-02-22
author:     BY
header-img: img/post-bg-debug.png
catalog: true
tags:
    - Mac
    - 终端
    - Git
    - Github
---


> 使用 `.gitignore` 文件忽略指定文件

## .gitignore

在Git中，很多时候你只想将代码提交到仓库，而不是将当前文件目录下的文件全部提交到Git仓库中，例如在MacOS系统下面的`.DS_Store`文件，或者是Xocde的操作记录，又或者是pod库的中一大串的源代码。这种情况下使用`.gitignore`就能够在Git提交时自动忽略掉这些文件。

 
 
## 忽略的格式
 
- `#` :此为注释 – 将被 Git 忽略
- `*.a` :忽略所有 `.a` 结尾的文件
- `!lib.a` : 不忽略 `lib.a` 文件
- `/TODO` :仅仅忽略项目根目录下的 `TODO` 文件,不包括 `subdir/TODO`
- `build/` : 忽略 `build/` 目录下的所有文件
- `doc/*.txt` : 会忽略 `doc/notes.txt` 但不包括 `doc/server/arch.txt`

## 创建方法

#### 从 [github](https://github.com/github/gitignore.git) 上获取

github上整理了一些常用需要的项目中需要忽略的文件配置，根据需要进行获取

	https://github.com/github/gitignore.git
	
与 Xcode 相关的三个文件

- Xcode.gitignore
- Objective-C.gitignore
- Swift.gitignore

`Xcode.gitignore`忽略 `Xcode` 配置信息，如操作记录，默认打开窗口等

其他两个在 `Xcode.gitignore` 基础上针对不同的语言进行忽略

将这些文件重写命名为 `.gittignore`

	$ mv Swift.gitignore .gittignore

#### 通过 [gitignore.io](https://www.gitignore.io/) 创建（推荐）

###### 先自定义终端命令：

macOS下默认是`\#!/bin/bash`：

	$ echo "function gi() { curl -L -s https://www.gitignore.io/api/\$@ ;}" >> ~/.bash_profile && source ~/.bash_profile
	
如果是 `#!/bin/zsh`

	$ echo "function gi() { curl -L -s https://www.gitignore.io/api/\$@ ;}" >> ~/.zshrc && source ~/.zshrc

###### 使用
	
在当前终端目录下

	$ gi swift > .gitignore
	

就会针对 Swifit 类型的工程创建 `.gitignore` 文件。
