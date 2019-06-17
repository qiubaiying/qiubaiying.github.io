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

