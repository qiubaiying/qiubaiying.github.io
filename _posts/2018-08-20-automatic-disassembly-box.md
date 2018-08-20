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
* WHAT : 什么是自动拆装箱。
* WHY : 为什么需要自动拆装箱。
* HOW : 自动拆装箱是如何实现的。
* WHEN : 什么时候会用到自动拆装箱
* WHERE : 什么地方可能会自动进行自动拆装箱，如三目运算符
* OTHER : 自动拆装箱可能会带来那些问题？

## 什么是自动拆装箱
* Java拆装箱就是Java相应的基本数据类型和引用类型的互相转化。
* Java拆装箱是java1.5的新特性。1.5之前Integer i = 1；会编译错误

##### 装箱
装箱就是把byte ，int ，short， long ，double，float，boolean，char 这些Java的基本数据类型在定义数据类型时不声明为相对应的引用类型，在编译器的处理下自动转化为引用类型的动作就叫做装箱。
自动装箱：编译器调用valueOf将原始类型转换成对象。

如下：

{% highlight java %}
Integer i = 1; 编译后 Integer i = Integer.valueOf(1);
Boolean b = true; 编译后 Boolean b = Boolean.valueOf(true);
{% endhighlight %}

##### 拆箱
拆箱就是把Long，Integer，Double，Float 等将基本数据类型的首字母大写的相应的引用类型转化为基本数据类型的动作就叫拆箱。
自动拆箱：编译器通过调用类似intValue(),doubleValue()这类的方法将对象转换成原始数据类型值。

如下：
{% highlight java %}
Integer i = 1;//装箱  编号后 Integer i = Integer.valueOf(1);
int j = i;//拆箱  编译后 int j = Integer.valueOf(1).intValue();
{% endhighlight %}

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
> 自动拆装箱是在编译期间完成的，原理是调用包装类型的静态方法valueOf、intValue等对原始类型和包装类型进行转换
观看源码可知，Integer采用了享元模式，设计了一个内部类IntegerCache，有一个Integer的静态常量数组，类加载初始化静态常量数组cache【-128~127】，存放于jvm方法区中
为什么要如此设计？
java将程序中预见常用的数字采用缓存策略，是为了防止每次自动装箱都创建一个对象的实例。

* 其他基本类型大致也同Integer一样采用了享元模式，但Boolean、Float、Double不同，并没有采用cache策略。
** Boolean其实采用的也是缓存策略，但不同于Integer等缓存方式，而是用静态常量将实例对象放入方法区，而不是用内部类缓存静态数组的方式。
** Float、Double：浮点型和双精度没有热点数值，即无法预见常用值，缓存没太大意义和效率。

以下是Integer的自动封箱源码：
{% highlight java %}
//自动封箱入口，调用valueOf，判断i是否在静态常量数组中（-128~127），是则从IntegerCache中获取包装类的实例，否则new Integer()
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}


//使用亨元模式，来减少对象的创建
private static class IntegerCache {
    static final int low = -128;
    static final int high;
    static final Integer cache[];

    //静态方法，类加载的时候进行初始化cache[],静态变量存放在常量池中
    static {
        // high value may be configured by property
        int h = 127;
        String integerCacheHighPropValue =
            sun.misc.VM.getSavedProperty("java.lang.Integer.IntegerCache.high");
        if (integerCacheHighPropValue != null) {
            try {
                int i = parseInt(integerCacheHighPropValue);
                i = Math.max(i, 127);
                // Maximum array size is Integer.MAX_VALUE
                h = Math.min(i, Integer.MAX_VALUE - (-low) -1);
            } catch( NumberFormatException nfe) {
                // If the property cannot be parsed into an int, ignore it.
            }
        }
        high = h;

        cache = new Integer[(high - low) + 1];
        int j = low;
        for(int k = 0; k < cache.length; k++)
            cache[k] = new Integer(j++);

        // range [-128, 127] must be interned (JLS7 5.1.7)
        assert IntegerCache.high >= 127;
    }

    private IntegerCache() {}
}
{% endhighlight %}

八种基本类型自动装箱源码：
{% highlight java %}
//boolean原生类型自动装箱成Boolean
public static Boolean valueOf(boolean b) {
    return (b ? TRUE : FALSE);
}

//byte原生类型自动装箱成Byte
public static Byte valueOf(byte b) {
    final int offset = 128;
    return ByteCache.cache[(int)b + offset];
}

//byte原生类型自动装箱成Byte
public static Short valueOf(short s) {
    final int offset = 128;
    int sAsInt = s;
    if (sAsInt >= -128 && sAsInt <= 127) { // must cache
        return ShortCache.cache[sAsInt + offset];
    }
    return new Short(s);
}

//char原生类型自动装箱成Character
public static Character valueOf(char c) {
    if (c <= 127) { // must cache
        return CharacterCache.cache[(int)c];
    }
    return new Character(c);
}

//int原生类型自动装箱成Integer
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}

//int原生类型自动装箱成Long
public static Long valueOf(long l) {
    final int offset = 128;
    if (l >= -128 && l <= 127) { // will cache
        return LongCache.cache[(int)l + offset];
    }
    return new Long(l);
}

//double原生类型自动装箱成Double
public static Double valueOf(double d) {
    return new Double(d);
}

//float原生类型自动装箱成Float
public static Float valueOf(float f) {
    return new Float(f);
}
{% endhighlight %}


## 什么时候会用到自动拆装箱
> 当赋值符号或者运算符号两边的类型一个为基本数据类型一个为其包装类时，就会发生自动装箱或者自动拆箱。

## 什么地方可能会自动进行自动拆装箱，如三目运算符
上面说到当赋值符号两边类型符合基本类型对应包装类型时，就会自动进行拆装箱
然而，在三目运算符中，也有可能会自动进行拆装箱
{% highlight java %}
Double d1 = null;
//double d2 = true ? d1 : 0d;
Double d2 = true ? d1 : 0d;
System.out.println(d2);
{% endhighlight %}

d1是包装类型，0d是基础类型，编译时会自动拆装箱：
{% highlight java %}
double d2 = true ? d1.doubleValue() : 0d;
Double d2 = Double.valueOf(true ? d1.doubleValue() : 0d);
{% endhighlight %}

## 自动拆装箱可能会带来那些问题？

自动拆装箱可能会导致类型拆箱过程中类型转换报错，如上会报空指针异常。

<span color='red'>Exception in thread "main" java.lang.NullPointerException</span>

以上也是三目运算中关于拆装箱的一个坑，实际编程中需注意，解决思路：
* 保持类型一致，不要采用基础类型和包装类一起使用
* 非要使用基础类型和包装类的话，就不要使用三目运算
* 非要使用基础类型和包装类，又要用三目，则先对封装类进行判空处理

---
### 参考资料

链接：[Autoboxing and Unboxing (The Java Tutorials > Lea...](https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html)

链接：[深入剖析Java中的装箱和拆箱 - 海 子 - 博客园](https://www.cnblogs.com/dolphin0520/p/3780005.html)

链接：[Java 自动装箱与拆箱的实现原理 - 简书](https://www.jianshu.com/p/0ce2279c5691)