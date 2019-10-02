---
layout:     post 
title:      JavaScript基础
subtitle:   JavaScript
date:       2019-10-02
author:     张鹏
header-img: img/home-bg.jpg
catalog: true   
tags:                         
    - JavaScript
---

#### 强制类型转换

- 指将一个数据类型强制转换为其他的数据类型
- 类型转换主要指，将其他数据类型转换为String、Number、Boolean
- 转换方法
   - 1. 调用被转换数据类型的toString()方法，该方法不会改变原变量，它会将转换的结果返回。但是null和undefined这两个值没有toString()方法
   - 2. 调用String()函数，并将被转换的数据作为参数传递给函数。使用String()函数做强制类型转换时，对于Number和Boolean实际上就是调用toString()方法。但是对于null和undefined，就不会调用toString()方法，它会将null直接转换为"null"，将undefined转换为"undefined"。

```JavaScript
var a=123;
var b=a.toString()
console.log(typeof a);
console.log(a);
console.log(typeof b);
console.log(b);

var a=123;
var b=String(a);
console.log(b);
console.log(typeof b);
```

#### 运算符

- 通过运算符可以对一个或多个值进行计算，并获取运算结果
- 任何值和字符串做加法运算，都会先转换为字符串，然后再和字符串做拼串的操作。我们可以利用这一点，来将任意的数据类型转换为String，只需要为任意的数据类型+一个""即可转换为String。这是一个隐式的转换，由浏览器自动完成，实际上他也是调用String()函数