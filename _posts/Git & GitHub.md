layout	title	subtitle	date	author	header-img	catalog	tags
post
Git&GitHub
协同合作
2018-05-1
shmilymdt
img/post-bg-2015.jpg
true
机器学习
# **Git&GitHub**

[TOC]



## 1. 我们为什么需要版本控制

 *  协同合作

    如果没有版本控制系统，如果需要处理某些需要共享的文件时，同一个办公室的人必须避免操作相同的文件，这是不现实的。而有了版本控制系统之后，团队中的每个人可以无所顾忌地做各自的修改，然后版本控制系统可以把所有的改动合成一个共同的版本。

 *  版本存储

    经常性保存改动的项目是重要的习惯。如果没有版本控制的话就非常困难了。你到底改动了什么如果没有版本控制系统将会很难看清。并且版本的命名也是一个问题，有了版本控制系统之后我们就不会操心这些问题。

 *  恢复之前的版本
    如果发生了某些严重的错误需要恢复之前的版本，有了版本控制可以轻松的回滚。

 *  了解发生了什么

    有了版本控制以后每一次提交的改动都有相应的描述，并且可以看到改动前后的对照。这样有利于了解版本之间的发展关系。

 *  备份

    实际上版本控制系统提供了一个非常好的备份功能，每个团队程序都在本地存有一个完整项目的副本，包括项目的记录，如果服务器宕机或者你的存储硬盘坏了，所有的文件仍然可以从其他团队成员那里的仓库中得到。

## 2.版本控制工具有哪些

在项目源代码版本控制工具中，比较常用的有CVS、SVN、Git和Mercurial。下图是这几个版本控制工具的受欢迎度随时间的变化图。我们可以看出，Git越来越受欢迎。

![Image](D:\Markdown笔记\img\Image.png)

<center>图一</center>

## 3.Git特性

* 免费开源
* 速度快
* 时刻保持数据的完整性
* 近乎所有的操作都在本地执行，不需要联网

##4.Git&GitHub

Git和GitHub是不同的Git是一个版本控制工具，而GitHub是一个托管平台。也可以说git是一个客户端，而服务端是一个可以保存用户提交代码和版本信息的仓库，GitHub是一个远程的git仓库，允许用户把本地的仓库代码提交到GitHub上的远程仓库中去。下图二中左部分很好的描述了git和GitHub之间的关系，而右部分很好的描述了git的主要命令的作用对象。![git&gitHub](D:\Markdown笔记\img\git&gitHub.png)

<center>图二</center>



下图以git命令为中心，描述了主要命令的工作过程和工作步骤。



![git](D:\Markdown笔记\img\git.png)

<center>图三</center>



下图为主要工作命令工作流程及其对仓库的影响。



![git Introduction](D:\Markdown笔记\img\git Introduction.png)

<center>图四</center>



- workspace 即工作区，逻辑上是本地计算机，还没添加到repository的状态；
- staging 即版本库中的stage，是暂存区。修改已经添加进repository，但还没有作为commit提交，类似于缓存；
- Local repository 即版本库中master那个地方。到这一步才算是成功生成一个新版本；
- Remote repository 则是远程仓库。用来将本地仓库上传到网络，可以用于备份、共享、合作。本文将使用Github作为远程仓库的例子。

## 5.主要的git命令详解

![bg2015120901](D:\Markdown笔记\img\bg2015120901.png)

- 新建代码库

  ```
  # 在当前目录新建一个Git代码库
  $ git init

  # 新建一个目录，将其初始化为Git代码库
  $ git init [project-name]

  # 下载一个项目和它的整个代码历史
  $ git clone [url]
  ```

- 配置

  Git的设置文件为`.gitconfig`，它可以在用户主目录下（全局配置），也可以在项目目录下（项目配置）。

  ```
  # 显示当前的Git配置
  $ git config --list

  # 编辑Git配置文件
  $ git config -e [--global]

  # 设置提交代码时的用户信息
  $ git config [--global] user.name "[name]"
  $ git config [--global] user.email "[email address]"
  ```

- 增加/删除文件

  ```g
  # 添加指定文件到暂存区
  $ git add [file1] [file2] ...

  # 添加指定目录到暂存区，包括子目录
  $ git add [dir]

  # 添加当前目录的所有文件到暂存区
  $ git add .

  # 添加每个变化前，都会要求确认
  # 对于同一个文件的多处变化，可以实现分次提交
  $ git add -p

  # 删除工作区文件，并且将这次删除放入暂存区
  $ git rm [file1] [file2] ...

  # 停止追踪指定文件，但该文件会保留在工作区
  $ git rm --cached [file]

  # 改名文件，并且将这个改名放入暂存区
  $ git mv [file-original] [file-renamed]
  ```

- 代码提交

  ```
  # 提交暂存区到仓库区
  $ git commit -m [message]

  # 提交暂存区的指定文件到仓库区
  $ git commit [file1] [file2] ... -m [message]

  # 提交工作区自上次commit之后的变化，直接到仓库区
  $ git commit -a

  # 提交时显示所有diff信息
  $ git commit -v

  # 使用一次新的commit，替代上一次提交
  # 如果代码没有任何新变化，则用来改写上一次commit的提交信息
  $ git commit --amend -m [message]

  # 重做上一次commit，并包括指定文件的新变化
  $ git commit --amend [file1] [file2] ...

  ```

- 分支

  ```
  # 列出所有本地分支
  $ git branch

  # 列出所有远程分支
  $ git branch -r

  # 列出所有本地分支和远程分支
  $ git branch -a

  # 新建一个分支，但依然停留在当前分支
  $ git branch [branch-name]

  # 新建一个分支，并切换到该分支
  $ git checkout -b [branch]

  # 新建一个分支，指向指定commit
  $ git branch [branch] [commit]

  # 新建一个分支，与指定的远程分支建立追踪关系
  $ git branch --track [branch] [remote-branch]

  # 切换到指定分支，并更新工作区
  $ git checkout [branch-name]

  # 切换到上一个分支
  $ git checkout -

  # 建立追踪关系，在现有分支与指定的远程分支之间
  $ git branch --set-upstream [branch] [remote-branch]

  # 合并指定分支到当前分支
  $ git merge [branch]

  # 选择一个commit，合并进当前分支
  $ git cherry-pick [commit]

  # 删除分支
  $ git branch -d [branch-name]

  # 删除远程分支
  $ git push origin --delete [branch-name]
  $ git branch -dr [remote/branch]
  ```



* 标签

  ```
  # 列出所有tag
  $ git tag

  # 新建一个tag在当前commit
  $ git tag [tag]

  # 新建一个tag在指定commit
  $ git tag [tag] [commit]

  # 删除本地tag
  $ git tag -d [tag]

  # 删除远程tag
  $ git push origin :refs/tags/[tagName]

  # 查看tag信息
  $ git show [tag]

  # 提交指定tag
  $ git push [remote] [tag]

  # 提交所有tag
  $ git push [remote] --tags

  # 新建一个分支，指向某个tag
  $ git checkout -b [branch] [tag]
  ```

* 查看信息

  ```
  # 显示有变更的文件
  $ git status

  # 显示当前分支的版本历史
  $ git log

  # 显示commit历史，以及每次commit发生变更的文件
  $ git log --stat

  # 搜索提交历史，根据关键词
  $ git log -S [keyword]

  # 显示某个commit之后的所有变动，每个commit占据一行
  $ git log [tag] HEAD --pretty=format:%s

  # 显示某个commit之后的所有变动，其"提交说明"必须符合搜索条件
  $ git log [tag] HEAD --grep feature

  # 显示某个文件的版本历史，包括文件改名
  $ git log --follow [file]
  $ git whatchanged [file]

  # 显示指定文件相关的每一次diff
  $ git log -p [file]

  # 显示过去5次提交
  $ git log -5 --pretty --oneline

  # 显示所有提交过的用户，按提交次数排序
  $ git shortlog -sn

  # 显示指定文件是什么人在什么时间修改过
  $ git blame [file]

  # 显示暂存区和工作区的差异
  $ git diff

  # 显示暂存区和上一个commit的差异
  $ git diff --cached [file]

  # 显示工作区与当前分支最新commit之间的差异
  $ git diff HEAD

  # 显示两次提交之间的差异
  $ git diff [first-branch]...[second-branch]

  # 显示今天你写了多少行代码
  $ git diff --shortstat "@{0 day ago}"

  # 显示某次提交的元数据和内容变化
  $ git show [commit]

  # 显示某次提交发生变化的文件
  $ git show --name-only [commit]

  # 显示某次提交时，某个文件的内容
  $ git show [commit]:[filename]

  # 显示当前分支的最近几次提交
  $ git reflog
  ```


* 远程同步

  ```
  # 下载远程仓库的所有变动
  $ git fetch [remote]

  # 显示所有远程仓库
  $ git remote -v

  # 显示某个远程仓库的信息
  $ git remote show [remote]

  # 增加一个新的远程仓库，并命名
  $ git remote add [shortname] [url]

  # 取回远程仓库的变化，并与本地分支合并
  $ git pull [remote] [branch]

  # 上传本地指定分支到远程仓库
  $ git push [remote] [branch]

  # 强行推送当前分支到远程仓库，即使有冲突
  $ git push [remote] --force

  # 推送所有分支到远程仓库
  $ git push [remote] --all

  ```

* 撤销

  ```
  # 恢复暂存区的指定文件到工作区
  $ git checkout [file]

  # 恢复某个commit的指定文件到暂存区和工作区
  $ git checkout [commit] [file]

  # 恢复暂存区的所有文件到工作区
  $ git checkout .

  # 重置暂存区的指定文件，与上一次commit保持一致，但工作区不变
  $ git reset [file]

  # 重置暂存区与工作区，与上一次commit保持一致
  $ git reset --hard

  # 重置当前分支的指针为指定commit，同时重置暂存区，但工作区不变
  $ git reset [commit]

  # 重置当前分支的HEAD为指定commit，同时重置暂存区和工作区，与指定commit一致
  $ git reset --hard [commit]

  # 重置当前HEAD为指定commit，但保持暂存区和工作区不变
  $ git reset --keep [commit]

  # 新建一个commit，用来撤销指定commit
  # 后者的所有变化都将被前者抵消，并且应用到当前分支
  $ git revert [commit]

  # 暂时将未提交的变化移除，稍后再移入
  $ git stash
  $ git stash pop

  ```

* 其他

  ```
  # 生成一个可供发布的压缩包
  $ git archive
  ```

## 参考文献

[常用 Git 命令清单](http://www.ruanyifeng.com/blog/2015/12/git-cheat-sheet.html)

[Git的特点](https://www.jianshu.com/p/62baffe4fa15)

[Git和GitHub简单教程](http://www.cnblogs.com/schaepher/p/5561193.html)
