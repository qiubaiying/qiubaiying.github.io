---
layout:     post
title:      Synchronized简介
subtitle:   手势与变形基础知识笔记
date:       2019-06-15
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - Java
    - 并发编程
---  

> 记录的都是我自己通过视频,博客学习后自己总结出来的,不一定完全正确,但是肯定是自己这样理解的,如果有理解错误的地方,需要及时更正  

# Synchronized简介
Java关键字,为共享资源加锁.可用于变量,方法,类上,代码块,根据使用方式的不同又称为类锁和对象锁.在并发编程中属于重量级锁,开销大,占用资源多,但是也是最安全,使用最方便的一种锁.
# 类锁和对象锁的区别
## 类锁:
```
class ClassName {
   public void method() {
      synchronized(ClassName.class) {
         // todo
      }
   }
}
public synchronized static void method() {
   // todo
}
// Java中万物皆对象,所以本质上类也是一个对象,如果是类锁,那么我通过其它方式实例化了这个类,new了一个对象,当这个对象访问被synchronized修饰的代码块或者方法的时候,是不会被阻塞的.
```
## 对象锁
```
class A implements Runable{
	public synchronized void method()
	{
	   // todo
	}

	public void method2(){
		 synchronized(this) {
				 // todo
		 }
	}
	public void run(){
		method2();
	}
}
class Test{
	public static void main(String[] args){
		A a = new A();
		Thread t1 = new Thread(a);
		Thread t2 = new Thread(a);
		t1.start();
		t2.start();
		// 这种是会被阻塞的
		A b = new A();
		Thread t3 = new Thread(b);
		t1.start();
		t3.start();
		// 这种是不会被阻塞
	}

}
```
> 总结:同一个锁对象会阻塞,不同锁对象之间无影响.

# synchronized底层语义原理
Java 虚拟机中的同步(Synchronization)基于进入和退出管程(Monitor)对象实现,同步方法 并不是由 monitorenter 和 monitorexit 指令来实现同步的，而是由方法调用指令读取运行时常量池中方法的 ACC_SYNCHRONIZED 标志来隐式实现的
## 理解Java对象头与Monitor
**在JVM中，对象在内存中的布局分为三块区域：对象头、实例数据和对齐填充**

- 实例变量：存放类的属性数据信息，包括父类的属性信息，如果是数组的实例部分还包括数组的长度，这部分内存按4字节对齐。
- 填充数据：由于虚拟机要求对象起始地址必须是8字节的整数倍。填充数据不是必须存在的，仅仅是为了字节对齐
- Java头对象: synchronized使用的锁对象是存储在Java对象头里的，jvm中采用2个字来存储对象头(如果对象是数组则会分配3个字，多出来的1个字记录的是数组长度)，其主要结构是由Mark Word 和 Class Metadata Address 组成

| 虚拟机位数  |  头对象结构 |说明
| ------------ | ------------ |
|32/64bit   |  Mark Word |存储对象的hashCode、锁信息或分代年龄或GC标志等信息
|  32/64bit | Class Metadata Address  |类型指针指向对象的类元数据，JVM通过这个指针确定该对象是哪个类的实例。
**Mark Word在默认情况下存储着对象的HashCode、分代年龄、锁标记位等以下是32位JVM的Mark Word默认存储结构**

|   锁状态| 25bit  |4bit|1bit|是否是偏向锁|2bit 锁标志位
| ------------ | ------------ |------------ |------------ |
|  无锁状态 |对象HashCode | 对象分代年龄| 对象分代年龄 |0|01

**由于对象头的信息是与对象自身定义的数据没有关系的额外存储成本，因此考虑到JVM的空间效率，Mark Word 被设计成为一个非固定的数据结构，以便存储更多有效的数据，它会根据对象本身的状态复用自己的存储空间，如32位JVM下，除了上述列出的Mark Word默认存储结构外，还有如下可能变化的结构：**
![Mark Word](https://img-blog.csdn.net/20170603172215966?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvamF2YXplamlhbg==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast) 
