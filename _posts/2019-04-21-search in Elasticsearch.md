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

### 使用查询表达式搜索
Elasticsearch 提供一个丰富灵活的查询语言叫做 查询表达式 ， 它支持构建更加复杂和健壮的查询。
领域特定语言 （DSL）， 指定了使用一个 JSON 请求。此时不再使用 query-string 参数，而是一个请求体替代
我们可以像这样重写之前的查询所有 Smith 的搜索。这个请求使用 JSON 构造，并使用了一个 match 查询
```shell
GET /megacorp/employee/_search
{
    "query" : {
        "match" : {
            "last_name" : "Smith"
        }
    }
}
```

### 再复杂一些的查询
同样搜索姓氏为 Smith 的雇员，但这次我们只需要年龄大于 30 的。
查询需要稍作调整，使用过滤器 filter ，它支持高效地执行一个结构化查询。
```shell
GET /megacorp/employee/_search
{
    "query" : {
        "bool": {
            "must": {
                "match" : {
                    "last_name" : "smith" 
                }
            },
            "filter": {
                "range" : {
                    "age" : { "gt" : 30 } 
                }
            }
        }
    }
}
```
上面，其中match部分与我们之前使用的 match 查询 一样；range 过滤器部分 ， 它能找到年龄大于 30 的文档，其中 gt 表示_大于(_great than)。
                                 
返回结果是：
```json
{
   ...
   "hits": {
      "total":      1,
      "max_score":  0.30685282,
      "hits": [
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
### 全文搜索
截止目前的搜索相对都很简单：单个姓名，通过年龄过滤。现在尝试下稍微高级点儿的全文搜索——一项 传统数据库确实很难搞定的任务。

搜索所有喜欢攀岩（rock climbing）的雇员：
```shell
GET /megacorp/employee/_search
{
    "query" : {
        "match" : {
            "about" : "rock climbing"
        }
    }
}
```
我们依旧使用之前的 match 查询在about 属性上搜索 “rock climbing” 。需要注意到的是：得到两个匹配的文档！

```
{
   ...
   "hits": {
      "total":      2,
      "max_score":  0.16273327,
      "hits": [
         {
            ...
            "_score":         0.16273327, 
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
            "_score":         0.016878016, 
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
为什么Jane也会被搜索出来呢？ 她的about信息是 'rock albums'，而并非'ock climbing'.
这就要说起ES中的'相关性'概念了。
Elasticsearch 在 全文属性上搜索并返回相关性最强的结果。
在传统关系型数据库，一条记录要么匹配要么不匹配；而ES中却引入了相关性概念，并且按照相关性高低对结果进行排序。

### 短语搜索
针对上面这个例子，如果只想搜索'rock climbing'，而不是 rock 或者 climbing呢？
为此对 match 查询稍作调整，使用一个叫做 match_phrase 的查询：
```shell
GET /megacorp/employee/_search
{
    "query" : {
        "match_phrase" : {
            "about" : "rock climbing"
        }
    }
}
```
那么此时，返回的结果将是仅仅包含 John Smith的文档了。

### 高亮搜索
再次执行前面的查询，并增加一个新的 highlight 参数：
```shell
GET /megacorp/employee/_search
{
    "query" : {
        "match_phrase" : {
            "about" : "rock climbing"
        }
    },
    "highlight": {
        "fields" : {
            "about" : {}
        }
    }
}
```
当执行该查询时,结果中还多了一个叫做 highlight 的部分。
这个部分包含了 about 属性匹配的文本片段，并以 HTML 标签 <em></em> 封装：
```
{
   ...
   "hits": {
      "total":      1,
      "max_score":  0.23013961,
      "hits": [
         {
            ...
            "_score":         0.23013961,
            "_source": {
               "first_name":  "John",
               "last_name":   "Smith",
               "age":         25,
               "about":       "I love to go rock climbing",
               "interests": [ "sports", "music" ]
            },
            "highlight": {
               "about": [
                  "I love to go <em>rock</em> <em>climbing</em>" 
               ]
            }
         }
      ]
   }
}
```
关于高亮搜索片段，可以在 [highlighting reference documentation](https://www.elastic.co/guide/en/elasticsearch/reference/master/search-request-highlighting.html) 了解更多信息。

### 微信扫一下，最新最全最好看的电影都有，谢谢了~
 ![](https://open.weixin.qq.com/qr/code?username=zhihuishangye)