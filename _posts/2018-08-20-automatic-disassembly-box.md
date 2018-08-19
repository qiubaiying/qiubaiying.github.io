---
layout:       post
title:        "Java的自动拆装箱"
subtitle:     "归纳自动拆装箱知识点"
date:         2018-08-20 22:42:05
author:       "Hyuga"
header-img:   "img/2018-08-20/head-top.jpeg"
header-mask:  0.3
catalog:      true
multilingual: false
tags:
    - god road
---

自动拆装箱相关知识点归纳：
* WHAT:什么是自动拆装箱。
* WHY:为什么需要自动拆装箱。
* HOW:自动拆装箱是如何实现的。
* WHEN:什么时候会用到自动拆装箱
* WHERE:什么地方可能会自动进行自动拆装箱，如三目运算符
* OTHER:自动拆装箱可能会带来那些问题？

## 什么是自动拆装箱
* Java拆装箱就是Java相应的基本数据类型和引用类型的互相转化。
* Java拆装箱是java1.5的新特性。1.5之前Integer i = 1；会编译错误

##### 装箱
装箱就是把byte ，int ，short， long ，double，float，boolean，char 这些Java的基本数据类型在定义数据类型时不声明为相对应的引用类型，在编译器的处理下自动转化为引用类型的动作就叫做装箱。

如下：
```
Integer i = 1; 等同 Integer i = new Integer(1);
Boolean b = true; 等同 Boolean b = new Boolean(true);
```

##### 拆箱
拆箱就是把Long，Integer，Double，Float 等将基本数据类型的首字母大写的相应的引用类型转化为基本数据类型的动作就叫拆箱。

如下：
```
Integer i = 1;//装箱
int j = i;//拆箱
```

##### 总结
> 装箱 基本数据类型自动转换为包装器类型
>
> 拆箱 包装器类型自动转换为基本数据类型

##### 八种基本数据类型对比包装器类型
![](/img/2018-08-20/基本数据类型对应包装器类型.png)

---
## 为什么需要自动拆装箱
##### 为什么java有基础数据类型
java是面向对象语言，照理应该不需要基础数据类型。但是如果诸如int等一系列简单的小的变量，全都new到堆里，是否更费时费力。
所以java采取了C++类似的做法，对于这些类型不是用new关键字来创建，而是直接将变量的值存储在栈中，因此更加高效。
##### 为什么需要基础类型的包装器
基本类型并不具有对象的性质，为了让基本类型也具有对象的特征，就出现了包装类型，比如操作集合时需要使用基础类型封装器，它相当于将基本类型“包装起来”，使得它具有了对象的性质，并且为其添加了属性和方法，丰富了基本类型的操作。

另外，当需要往ArrayList，HashMap中放东西时，像int，double这种基本类型是放不进去的，因为容器都是装object的，这是就需要这些基本类型的包装器类了。

##### 二者区别
<table>
<tr>
<td></td>
<td>基础类型</td>
<td>包装类型</td>
</tr>
<tr>
<td>声明方式不同</td>
<td>基础类型不需要new</td>
<td>包装类型需要new一个对象</td>
</tr>
<tr>
<td>存储不同</td>
<td>基础类型直接将变量存在于栈中</td>
<td>包装类型是在堆中创建对象，通过引用调用</td>
</tr>
<tr>
<td>初始值不同</td>
<td>int 0</td>
<td>Integer null</td>
</tr>
<tr>
<td>使用方式不同</td>
<td>基础类型可直接赋值使用</td>
<td>而集合操作却只能使用包装类</td>
</tr>
</table>

##### 总结
java中有基础类型存在的理由，但java是面向对象语言，诸多规范皆以对象为本，自动拆装箱也就成了八大基础类型与java语言间的一个衔接桥梁。

---

## 自动拆装箱是如何实现的

## 什么时候会用到自动拆装箱
## 什么地方可能会自动进行自动拆装箱，如三目运算符
## 自动拆装箱可能会带来那些问题？


---

## 未完待续！！！

---
### 参考资料

链接：[Autoboxing and Unboxing (The Java Tutorials > Lea...](https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html)

链接：[深入剖析Java中的装箱和拆箱 - 海 子 - 博客园](https://www.cnblogs.com/dolphin0520/p/3780005.html)

链接：[Java 自动装箱与拆箱的实现原理 - 简书](https://www.jianshu.com/p/0ce2279c5691)