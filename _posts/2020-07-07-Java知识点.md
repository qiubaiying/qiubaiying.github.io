---
layout:     post                   
title:      StringBuilder常见用法              
subtitle:   Javase
date:       2020-07-04             
author:     丠                 
header-img: img/post-bg-desk.jpg    
catalog: true                       
tags:                             
    - Javase
    - 技术总结
---



# StringBuilder的常用方法 

在编程时，常碰到字符串连接的情况，最头铁的方式是通过"+"符号来实现，这种方式效率较低且每执行一次都会创建一个String对象浪费空间。

使用StringBuilder类避免这种问题的发生，下面就Stringbuilder的使用做个简要的总结：

## 创建Stringbuilder对象

`StringBuilder strA = new StringBuilder();`

#### 1、append(String str)/append(Char c)：字符串连接

`System.out.println("StringBuilder:"+strA.append("Z").append("B").append('Y'));`

//return "StringBuilder:ZBY"

#### 2、toString()：返回一个与构建起或缓冲器内容相同的字符串

`System.out.println("String:"+strA.toString());`

//return "String:ZBY"

#### 3、insert(int offset, String str)/insert(int offset, Char c)：在指定位置之前插入字符(串)
 
`System.out.println("StringBuilder.insertString:"+ strA.insert(2, "JK"));`

//return "StringBuilder.insertString:ZBJKY"

`System.out.println("StringBuilder.insertChar:"+ strA.insert(2, 'O'));`

//return "StringBuilder.insertChar:ZBOJKY"

#### 4、delete(int startIndex,int endIndex)：删除起始位置（含）到结尾位置（不含）之间的字符串

`System.out.println("StringBuilder.delete:"+ strB.delete(2, 4));`

//return "StringBuilder.delete:ZBKY"
