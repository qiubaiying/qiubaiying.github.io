---
layout:     post
title:      Python-json处理
subtitle:   处理json数据
date:       2019-04-26
author:     BugMan
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - msf
    - 渗透测试
---
首先放一段代码



```
import requestsimport jsonpathimport jsonf=open('ip.txt','r',encoding='utf-8')for my_ip in f.readlines():    my_ip=str(my_ip[:-1])    respons=requests.get('http://ip-api.com/json/{ip}?lang=zh-CN'.format(ip=my_ip)).json()    countr=jsonpath.jsonpath(respons,"$..country")    sheng=jsonpath.jsonpath(respons,"$..regionName")    cit=jsonpath.jsonpath(respons,"$..city")    ipip=jsonpath.jsonpath(respons,"$..query")    print(respons)    print(countr+sheng+cit+ipip)
```

# Json 定义



```
JSON: JavaScript Object Notation(JavaScript 对象表示法)JSON 是存储和交换文本信息的语法。类似 XML。JSON 比 XML 更小、更快，更易解析。
```

# 1.json moudle使用

**Python与JSON数据类型对应表：**

| Python      | JSON   | 说明         |
| ----------- | ------ | ------------ |
| dict        | object | 字典         |
| list, tuple | array  | 序列         |
| str         | string | 字符串       |
| int, float  | number | 数字类型     |
| True        | true   | 布尔值True   |
| False       | false  | 布尔值 False |
| None        | null   | 空值         |

既然知道了为什么要转换，就来了解怎么转换，这就需要用到Python的内置模块json，内置模块，在代码中直接引用即可：



```
import json
```

json模块中主要用到的就4个函数：

> **json.dumps():** 将Python数据编码（转换）为JSON数据； **json.loads():** 将JSON数据转换（解码）为Python数据; **json.dump():** 将Python数据编码并写入JSON文件； **json.load():** 从JSON文件中读取数据并解码。

# 2.jsonpath的运用

### JsonPath与XPath语法对比：

Json结构清晰，可读性高，复杂度低，非常容易匹配，下表中对应了XPath的用法。

| Xpath | JSONPath | 描述                                                         |
| ----- | -------- | ------------------------------------------------------------ |
| /     | $        | 跟节点                                                       |
| .     | @        | 现行节点                                                     |
| /     | . or []  | 取子节点                                                     |
| ..    | n/a      | 就是不管位置，选择所有符合条件的条件                         |
| *     | *        | 匹配所有元素节点                                             |
| []    | []       | 迭代器标示(可以在里面做简单的迭代操作，如数组下标，根据内容选值等) |
| \|    | [,]      | 支持迭代器中做多选                                           |
| []    | ?()      | 支持过滤操作                                                 |
| n/a   | ()       | 支持表达式计算                                               |
| ()    | n/a      | 分组，JsonPath不支持                                         |

## **注意事项：**

json.loads()是把Json格式字符串解码转换成Python对象，如果在json.loads的时候出错，要注意被解码的Json字符的编码。

# 字符串编码转换

```
任何平台的任何编码，都能和Unicode互相转换。
```

UTF-8与GBK互相转换，那就先把UTF-8转换成Unicode，再从Unicode转换成GBK，反之同理。



```
# 这是一个 UTF-8 编码的字符串utf8Str = "你好地球"
# 1. 将 UTF-8 编码的字符串 转换成 Unicode 编码unicodeStr = utf8Str.decode("UTF-8")
# 2. 再将 Unicode 编码格式字符串 转换成 GBK 编码gbkData = unicodeStr.encode("GBK")
# 1. 再将 GBK 编码格式字符串 转化成 UnicodeunicodeStr = gbkData.decode("gbk")
# 2. 再将 Unicode 编码格式字符串转换成 UTF-8utf8Str = unicodeStr.encode("UTF-8")
```
