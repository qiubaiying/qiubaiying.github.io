---
layout:     post
title:      llvm in MacOS
date:       2019-10-18
author:     Yukun SHANG
catalog: 	 true
tags:
    - MacBook

---



安装过程笔记波折，做下记录：

## 安装
安装的话直接brew来安装：
```
brew install llvm
```

可以通过
```
brew info llvm 
```
来查看llvm的情况

## 测试
测试用例可以参考
[https://blog.csdn.net/qq_31157999/article/details/78906982](https://blog.csdn.net/qq_31157999/article/details/78906982)
这个文章
注意其中clang -03 -emit-llvm test.c -c -o test.bc命令
* -03的这个参数不同电脑是不一样的，目前最新的clang应该是到-10了
* clang和-03中间是没有空格的

