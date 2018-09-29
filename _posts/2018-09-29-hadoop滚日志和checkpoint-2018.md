---
layout:     post
title:      hadoop滚日志以及checkpoint
subtitle:   了解hadoop机制
date:       2018-09-29
author:     政
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - hadoop
---

1.主机： 

- 通过editsRoll来将上次创建的edits_inprogress_seq文件rename-》edits_seq1-seqn.(一分钟滚动一次) 
- 通过editsRoll来创建新的edits_inprogress_seq文件，并创建新的流，之后的操作可以通过logEdit函数将数据通过这个流把op写入文件，并通过logSync来将流中的数据同步到磁盘上(每次更改操作都会刷到磁盘，不过刷盘的动作在操作之后) 
- editsTailer线程去通过获取新的edits，然后更新内存中的fsimage. 

2.备机： 

- 拉取主机edits，并同步到内存中的fsimage. 