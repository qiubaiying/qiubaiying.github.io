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

### HashCode

- 独一无二的代表了一个对象，并且可以根据哈希编码找到一个对象所在的位置

### Equals方法

- `public Boolean equals(Object obj)`：提供定义对象是否相等的逻辑
- Object的equals方法定义为：`x.equals(y)`，当x和y是同一个对象的引用时返回true，否则返回false
- JDK提供的一些类，如String、Date等，重写了Object类的equals方法，调用这些类 的equals方法时，当x和y所引用的对象是同一类是对象且属性相同时（并不一定是相同对象），返回true，否则返回false。(也就是说不需要重写方法，直接比较即可)
- 可以根据用户需要在用户自定义类型中重写equals方法。
- 引用之间比较的是内存地址，不是数值（x==y比较的是x和y在内存中的地址以及数值，不能只看数值)
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
- obj instanceof cat:判断obj是否是cat的一个引用
- equals为空值，则返回的值为false
```java
public class Test{
    public static void main(String[] args){
        Cat c1=new Cat(1,2,3);
        Cat c2=new Cat(1,2,6);
        System.out.println(c1==c2);
        System.out.println(c1.equals(c2));
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
    public boolean equals(Object obj){
        if(obj==null)return false;
        else{
            if(obj instanceof Cat){
                Cat c=(Cat)obj;
                if(c.color=this.color && c.height=this.height && c.weight=this.weight){
                    return true;
                }
            }
        }
    }
}
```
### 对象转型（casting）

- 一个基类的引用类型变量可以“指向”其子类的对象（A要求传过来一只猫，B传过来一只狗，这是可以的，猫属于动物，狗从动物继承就可以了）
- 一个基类的引用不可以访问其子类对象新增的成员（属性和方法）（要求传过来一只动物，结果传过来一只狗，这时候不能把这只狗当作狗看待，他只是一只动物，狗所新增加的方法动物就不能够访问了）——在你眼中只能看见子类对象中的父类对象
- 可以使用引用变量instanceof类名来判断该引用类型变量所“指向”的对象是否属于该类或该类的子类
- 子类的对象可以当作基类的对象来使用称为向上转型（upcasting），反之称为向下转型（downcasting）——父类对象或基类对象引用指向子类对象叫做向上转型，反之叫做向下转型
```java
public class Test{
    public static void main(String[] args){
        Animal a=new Animal("name");
        Cat c=new Cat("catname","blue");
        Dog d=new Dog("dogname","black");
        System.out.println(a instanceof Animal);
        System.out.println(c instanceof Animal);
        System.out.println(d instanceof Animal);
        System.out.println(a instanceof c);
        a=new Dog("bigyellow","yellow");
        System.out.println(a.name);
        System.out.println(a.furname);
        System.out.println(a instanceof Animal);
        System.out.println(a instanceof dog);
        Dog d1=Dog(a);
        System.out.println(d1.furcolor);
    }
}
```

### 多态（动态绑定）

- 多态指的是在执行期间（而非在编译期间）判断所引用对象的实际类型，根据其实际的类型调用相应的方法
- 实际当中引用的是哪一种对象，就调用哪一类对象的方法，只有在运行时才会进行，所以叫做动态绑定（new的是谁就调用谁的方法）
- 多态的三大条件：要有继承、要有重写、要有父类引用指向子类对象

### 抽象类

- 用abstract关键字修饰一个类时，这个类就叫做抽象类；用abstract关键字修饰一个方法时，这个方法叫做抽象方法
- 含有抽象方法的类必须声明为抽象类，抽象类必须被继承，抽象方法必须被重写
- 抽象类不能被实例化
- 抽象方法只需声明，而不需实现

### final关键字

- final的变量的值不能够被改变
- final的方法不能被重写
- final的类不能被继承