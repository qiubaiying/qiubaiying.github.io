---
layout:     post
title:      Elasticsearch中的聚合
subtitle:   
author:     大暴马
catalog: 	 true
tags:
    - ES
    - 开发
---
 
Elasticsearch 有一个功能叫聚合（aggregations），允许我们基于数据生成一些精细的分析结果。
聚合与 SQL 中的 GROUP BY 类似但更强大。

### 举个例子：说明聚合查询
挖掘出雇员中最受欢迎的兴趣爱好：
```
GET /megacorp/employee/_search
{
  "aggs": {
    "all_interests": {
      "terms": { "field": "interests" }
    }
  }
}
```
结果为：
```
{
   ...
   "hits": { ... },
   "aggregations": {
      "all_interests": {
         "buckets": [
            {
               "key":       "music",
               "doc_count": 2
            },
            {
               "key":       "forestry",
               "doc_count": 1
            },
            {
               "key":       "sports",
               "doc_count": 1
            }
         ]
      }
   }
}
```
这些聚合并非预先统计，而是从匹配当前查询的文档中即时生成。
如果想知道叫 Smith 的雇员中最受欢迎的兴趣爱好，可以直接添加适当的查询来组合查询：
```
GET /megacorp/employee/_search
{
  "query": {
    "match": {
      "last_name": "smith"
    }
  },
  "aggs": {
    "all_interests": {
      "terms": {
        "field": "interests"
      }
    }
  }
}
```
### 分级汇总：聚合以后的结果展示相关结果
```
GET /megacorp/employee/_search
{
    "aggs" : {
        "all_interests" : {
            "terms" : { "field" : "interests" },
            "aggs" : {
                "avg_age" : {
                    "avg" : { "field" : "age" }
                }
            }
        }
    }
}
```
得到的聚合结果如下：
```
...
  "all_interests": {
     "buckets": [
        {
           "key": "music",
           "doc_count": 2,
           "avg_age": {
              "value": 28.5
           }
        },
        {
           "key": "forestry",
           "doc_count": 1,
           "avg_age": {
              "value": 35
           }
        },
        {
           "key": "sports",
           "doc_count": 1,
           "avg_age": {
              "value": 25
           }
        }
     ]
  }
```
输出基本是第一次聚合的加强版。依然有一个兴趣及数量的列表，只不过每个兴趣都有了一个附加的 avg_age 属性，代表有这个兴趣爱好的所有员工的平均年龄。

### ES更多功能
suggestions、geolocation、percolation、fuzzy 与 partial matching 等特性均被省略，后面添加。
作为基础，掌握了ES的kibana view、index、search、aggregation就可以了。

### 微信扫一下
 ![](https://open.weixin.qq.com/qr/code?username=zhihuishangye)
