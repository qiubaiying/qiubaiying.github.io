---
layout:     post
title:      java中的VM Options,Program Arguments和Environment Variables
subtitle:   
author:     大暴马
catalog: 	 true
tags:
    - java
---

想给java程序设置或读取一些参数，不知道从哪里设置/读取？比如使用 intellj idea 打开一个spring工程时，
会有如图所示的三种设置参数的地方：**VM Options**,**Program Arguments**和**Environment Variables**
![](https://yabaowang.github.io/img/tech/java_variable.jpg)

看完这个文章就稳了

### VM Options + System.getProperties + -D参数
VM Options表示JVM参数，**设置**使用 java -D参数，**读取**使用System.getProperties()方法。
经常看到 -Xmx 等等-X 或者-XX开始的参数，这样的参数和-D的使命是一样的。有一种说法是-D表示稳定的参数，-X/-XX不稳定，不一定哪天就去掉了。
但设置堆内存大小等常见参数都是使用-X的，说法有待商榷。
### Program Arguments + Autowire(spring) + --test.data=any
更多表示java程序相关的参数，其实就是设置了main(String[] args)方法的args参数

### Environment Variables + System.getenv() + 系统export变量
操作系统/docker 级别的环境变量设置。比如在linux系统中，可以使用export 变量 来设置系统环境变量。



