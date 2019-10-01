---
layout:     post 
title:      JavaScript基础
subtitle:   JavaScript
date:       2019-10-01
author:     张鹏
header-img: img/home-bg.jpg
catalog: true   
tags:                         
    - JavaScript
---

#### JavaScript标识符

- 在JS中所有的可以由我们自主命名的都可以称为是标识符
- 在命名一个标识符时需要遵循如下的规则
   - 标识符中可以含有字母、数字、`_`、$
   - 标识符不能以数字开头
   - 标识符不能是ES中的关键字或保留字

#### JS数据类型

- 在JS中一共有六种数据类型

1. String 字符串
2. Number 数值
3. Boolean 布尔值
4. Null 空值
5. Undefined 未定义
6. Object 对象

- 其中String、Number、Boolean、Null、Undefined属于基本数据类型，Object属于引用数据类型

#### 字符串 String

- 在JS中使用字符串需要使用引号(双引号和单引号均可)引起来
- 引号不能嵌套（双引号中不能放双引号，单引号中不能用单引号）
- 在字符串中，当使用一些特殊符号时可以使用`\`进行转义
   - \" 表示 "
   - \' 表示 '
   - \t 表示 制表符
   - \\ 表示 \

```JavaScript
var str="hello";
console.log(str);
```

#### Boolean 布尔值

- 使用`typeof`检查一个布尔值时，会返回一个Boolean

```JavaScript
var bool=true;
console.log(typeof bool);
```

#### Null

- Null这个类型只有一个值，就是null
- null这个值专门用来表示一个为空的对象
- 使用typeof检查一个Null值时，会返回一个Object

```JavaScript
var a =null;
console.log(typeof a);
```

#### Undefined

- 当声明一个变量但是并不给变量赋值时，它的值就是undefined
- 用typeof检查一个undefined时也会返回一个Undefined

```JavaScript
var a=undefined;
console.log(typeof a);
```

