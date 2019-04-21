---
layout:     post
title:      Elasticsearch中的Search操作
subtitle:   
author:     大暴马
catalog: 	 true
tags:
    - ES
    - 开发
---
### 检索文档
在 Elasticsearch 中，简单地执行 一个 HTTP GET 请求并指定文档的地址——索引库、类型和ID。 
```shell
GET /megacorp/employee/1
```

使用这三个信息可以返回原始的 JSON 文档,返回结果包含了文档的一些元数据，以及 _source 属性，内容是 John Smith 雇员的原始 JSON 文档：
                       
```json
{
  "_index" :   "megacorp",
  "_type" :    "employee",
  "_id" :      "1",
  "_version" : 1,
  "found" :    true,
  "_source" :  {
      "first_name" :  "John",
      "last_name" :   "Smith",
      "age" :         25,
      "about" :       "I love to go rock climbing",
      "interests":  [ "sports", "music" ]
  }
}
```

#### delete、head、put、get
1. PUT insert或者update
2. GET 可以用来检索文档，
3. DELETE 命令来删除文档，
4. HEAD 指令来检查文档是否存在。

### 轻量搜索
第一个尝试的几乎是最简单的搜索了。我们使用下列请求来搜索所有雇员：
```shell
GET /megacorp/employee/_search
```
一个搜索默认返回十条结果:
```json
{
   "took":      6,
   "timed_out": false,
   "_shards": { ... },
   "hits": {
      "total":      3,
      "max_score":  1,
      "hits": [
         {
            "_index":         "megacorp",
            "_type":          "employee",
            "_id":            "3",
            "_score":         1,
            "_source": {
               "first_name":  "Douglas",
               "last_name":   "Fir",
               "age":         35,
               "about":       "I like to build cabinets",
               "interests": [ "forestry" ]
            }
         },
         {
            "_index":         "megacorp",
            "_type":          "employee",
            "_id":            "1",
            "_score":         1,
            "_source": {
               "first_name":  "John",
               "last_name":   "Smith",
               "age":         25,
               "about":       "I love to go rock climbing",
               "interests": [ "sports", "music" ]
            }
         },
         {
            "_index":         "megacorp",
            "_type":          "employee",
            "_id":            "2",
            "_score":         1,
            "_source": {
               "first_name":  "Jane",
               "last_name":   "Smith",
               "age":         32,
               "about":       "I like to collect rock albums",
               "interests": [ "music" ]
            }
         }
      ]
   }
}
```
接下来，尝试下搜索姓氏为 `Smith` 的雇员
```shell
GET /megacorp/employee/_search?q=last_name:Smith
```
搜索结果是：
```json
{
   ...
   "hits": {
      "total":      2,
      "max_score":  0.30685282,
      "hits": [
         {
            ...
            "_source": {
               "first_name":  "John",
               "last_name":   "Smith",
               "age":         25,
               "about":       "I love to go rock climbing",
               "interests": [ "sports", "music" ]
            }
         },
         {
            ...
            "_source": {
               "first_name":  "Jane",
               "last_name":   "Smith",
               "age":         32,
               "about":       "I like to collect rock albums",
               "interests": [ "music" ]
            }
         }
      ]
   }
}
```
### 微信扫一下，最新最全最好看的电影都有，谢谢了~
 ![](https://open.weixin.qq.com/qr/code?username=zhihuishangye)