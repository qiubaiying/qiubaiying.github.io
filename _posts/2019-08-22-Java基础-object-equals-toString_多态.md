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
```java
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
![Test](/img/Test_0822_1.png)

### HashCode

- 独一无二的代表了一个对象，并且可以根据哈希编码找到一个对象所在的位置

### Equals方法

- `public Boolean equals(Object obj)`：提供定义对象是否相等的逻辑
- Object的equals方法定义为：`x.equals(y)`，当x和y是同一个对象的引用时返回true，否则返回false
- JDK提供的一些类，如String、Date等，重写了Object类的equals方法，调用这些类 的equals方法时，当x和y所引用的对象是同一类是对象且属性相同时（并不一定是相同对象），返回true，否则返回false。
- 可以根据用户需要在用户自定义类型中重写equals方法。
- 引用之间比较的是内存地址，不是数值（`x==y`比较的是x和y在内存中的地址以及数值，不能只看数值）
```java
public class Test{
	public static void main(String[] args){
		Cat c1=new Cat(1,2,3);
		Cat c2=new Cat(1,2,3);
		System.out.println(c1==c2);
	}
}

class Cat{
	int color;
	int height,weight;
	
	public Cat(int color,int height,int weight){
		this.color=color;
		this.height=height;
		this.weight=weight;
	}
}
```
内存示意图
![Test](/img/javaTest_0822_2.png)