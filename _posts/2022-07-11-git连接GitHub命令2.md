---
layout:     post
title:      git连接GIthub命令操作
subtitle:   add, commit, pull, push等命令。
date:       2022-07-11
author:     BY Magicsmx
header-img: img/git.jpg
catalog: true
tags:
    - git
---

## 前言

git bash的初始配置与 Github 连接的完整一系列命令




### 具体命令


```	objc
- git config --global user.name  "XXXX";    #用户名
- git config --global user.email  "XXXX@xxx.com";   #邮箱标识
```
- 用户名和邮箱配置

```objc
- ssh-keygen -t rsa  #创建秘钥;
```
- 在本地创建密钥，windows下一般存放在[c盘->用户->自己的用户名->.ssh]。

```objc
- 将密钥加到github的setting中SSH Keys中;
```
- 打开Github网页->Settings->SSH and GPG keys->New SSH key, title随便填，key中粘贴id_rsa.pub中的内容。



```objc
- 命令行中执行 ssh -T git@github.com;
```
- 出现success字样说明成功




```objc
- git clone git@github.com:XXX/xxx.git;
```
- 从远端clone一个项目到本地。

```objc
- 在做了修改之后使用git add . 命令将工作区的修改提交到暂存区;
```
- 在做了修改之后使用git add . 命令将工作区的修改提交到暂存区。



```objc
- git commit -m " 修改说明";
```
- 提交。此时可以用git status命令查看状态。

```objc
- git pull origin main;
```
- 在push之前一定要有一个pull的操作，防止冲突。

```objc
- git push origin main;
```
- 成功push到远端。

### 参考
- [https://blog.csdn.net/qq_37808895/article/details/90733824
](https://blog.csdn.net/qq_37808895/article/details/90733824)
- [https://www.jianshu.com/p/2e1d551b8261
](https://www.jianshu.com/p/2e1d551b8261)