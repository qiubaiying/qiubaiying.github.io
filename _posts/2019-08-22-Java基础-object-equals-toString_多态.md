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
```java
public class Person{
    ......
}
等价于
public class Person extends Object{
    ......
}
```
### toString()方法

- object类中定义有`public String toString()`方法，其返回值是String类型，描述当前对象的有关信息。
- 在进行String与其他类型数据的连接操作时（如`System.out.println("info"+person)`），将自动调用该对象的类的toString()方法。
- 可以根据用户需要在用户自定义类型中重写toString()方法
```
public class Test{
    public static void main(String[] args){
        Dog d=new Dog();
        System.out.println("d="+d.toString());
    }
}
class Dog{
    public String toString(){
        return "I'm a cool dog!";
    }
}
```
![Test](img/Test_0822_1.png "测试1")
