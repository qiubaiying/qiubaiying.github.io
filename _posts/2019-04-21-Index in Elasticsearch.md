---
layout:     post
title:      Elasticsearch中的Index(索引)解释
subtitle:   
author:     大暴马
catalog: 	 true
description: Elasticsearch中的Index(索引)解释
tags:
    - ES
    - 开发
---

### ES中提到索引时的三种含义
ES中提到索引/Index这个词的时候，根据不同语境，有三种解释：
#### 表示数据库
一个 Elasticsearch 集群可以 包含多个 索引 ，相应的每个索引可以包含多个 类型 。 这些不同的类型存储着多个 文档 ，每个文档又有 多个 属性 。
一个 索引 类似于传统关系数据库中的一个 数据库 ，是一个存储关系型文档的地方。 
#### 表示insert动作
索引一个文档 就是存储一个文档到一个 索引 （名词）中以便它可以被检索和查询到。这非常类似于 SQL 语句中的 INSERT 关键词。
如果文档已存在，新文档会替换旧文档情况，此时类似update。
#### 真正的"索引--ES中的"倒排索引"
关系型数据库通过增加一个 索引 比如一个 B树（B-tree）索引 到指定的列上，以便提升数据检索速度。Elasticsearch 和 Lucene 使用了一个叫做 倒排索引 的结构来达到相同的目的。
默认的，一个文档中的每一个属性都是 被索引 的（有一个倒排索引）和可搜索的。一个没有倒排索引的属性是不能被搜索到的。

### 用雇员的例子表述这三种含义
1. 每个雇员都是一个document(文档)，该文档包含雇员的所有信息；
2. 每个文档都是employee类型；
3. employee类型位于megacorp这个索引(第一种含义)内；
4. magacorp这个索引保存在Elasticsearch集群中。

下面我们'索引'一个新文档:通过索引(第二种含义)API，新增一个员工ID为1的新员工
```shell
PUT /megacorp/employee/1
{
    "first_name" : "John",
    "last_name" :  "Smith",
    "age" :        25,
    "about" :      "I love to go rock climbing",
    "interests": [ "sports", "music" ]
}
//路径 /megacorp/employee/1 包含了三部分的信息：
//megacorp -- 索引名称
//employee -- 类型名称
//1 -- 特定雇员的ID
```
而员工的属性，比如first_name，本身存在一个倒排索引，才能根据first_name被搜索到

### 微信扫一下，最新最全最好看的电影都有，谢谢了~
 ![](https://open.weixin.qq.com/qr/code?username=zhihuishangye)