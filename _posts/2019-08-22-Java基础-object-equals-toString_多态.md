---
layout:     post 
title:      Java基础0822
subtitle:   Object、equals、toString、多态
date:       2019-08-22
author:     张鹏
header-img: img/post-bg-coffee.jpeg
catalog: true   
tags:                         
    - Java
---

# Java基础

### Object类

- object类是所有Java类的根基类
- 如果在类的声明中未使用extends关键字指明其基类，则默认基类为object类。
```
public class Person{
    ......
}
等价于
public class Person extends Object{
    ......
}
```

