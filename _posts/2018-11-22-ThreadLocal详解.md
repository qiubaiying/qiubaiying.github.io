---
layout:     post                    # 使用的布局（不需要改）
title:      你真的了解ThreadLocal吗           # 标题 
subtitle:   根据ThreadLocal进行源码追溯 #副标题
date:       2018-11-22              # 时间
author:     MasterJen                # 作者
header-img: img/mdsource/post-bg-a-17.jpg   #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - 多线程
---

## Hey ThreadLocal

>One today is worth two tomorrows.--一个今天胜似两个明天.

最近做项目的时候,有个业务需求,就是有个业务本身可以被多个线程共享使用,而且又可以达到线程安全的目的,且绝对线程安全.然后就想过了许多实现方法,最终经过最终考虑,我们决定使用了ThreadLocal,那么为什么选择ThreadLocal呢 接下来先看一个测试类

       public class TestThreadLocal {
             public static void main(String[] args) {
       //      创建两个 ThreadLocal
                 ThreadLocal<String> t1 = new ThreadLocal<String>();
                 ThreadLocal<Integer> t2 = new ThreadLocal<Integer>();
                   ThreadLocal<String> t3 = new ThreadLocal<String>();
       //          分别赋值
                   t1.set("hello");
                   t2.set(100);
                   t3.set("world");
                 String s = t1.get();
                 Integer integer = t2.get();
                 String s2 = t3.get();
                 System.out.println(s);
                 System.out.println(integer);
                 System.out.println(s2);
       //          打印 主线程 以及两个ThreadLocal 的hashCode();
                 System.out.println("主线程 hashcode is "+Thread.currentThread().hashCode());
                 System.out.println("ThreadLoacl t1 hashcode is :" + t1.hashCode());
                 System.out.println("ThreadLoacl t1 hashcode is :" + t2.hashCode());
       //        把 t3 进行remove
                 t3.remove();
       //          看是否能重新获得 t3的值
                 System.out.println(t3.get()+"---");
                 System.out.println(t2.get()+"---");
       
             }
       }
    
由此我们不由得进行了反问,创建了两个ThreadLocal<String> ,并且都重新赋值了,那么get的时候,不会覆盖吗？经过测试,结果如下:

      100
      world
      主线程 hashcode is 1706234378
      ThreadLoacl t1 hashcode is :1867750575
      ThreadLoacl t1 hashcode is :2046562095
      null---
      100---

由此可知,并没有进行覆盖,那么ThreadLocal里面到底有个神圣呢?接下来,就随我进行追溯源码吧.

首先 ThreadLoca的构造方法是个泛型类 

    public class ThreadLocal<T> {
        /**
         * ThreadLocals rely on per-thread linear-probe hash maps attached
         * to each thread (Thread.threadLocals and
         * inheritableThreadLocals).  The ThreadLocal objects act as keys,
         * searched via threadLocalHashCode.  This is a custom hash code
         * (useful only within ThreadLocalMaps) that eliminates collisions
         * in the common case where consecutively constructed ThreadLocals
         * are used by the same threads, while remaining well-behaved in
         * less common cases.
         */
        private final int threadLocalHashCode = nextHashCode();

当执行其 set 方法时 ,源码如下
    
        // T 表示 泛型 就构造方法里面的泛型
      public void set(T value) {
            // Thread 就是当前执行 ThreadLocal的线程  然后通过getMap 得到一个 ThreadLocalMap   getMap 方法如下
            Thread t = Thread.currentThread();
            // 根据 当前线程 得到 map  如果为空那么进行创建 （由源代码可以发现 创建的时候,用的是this 创建的 ）
            ThreadLocalMap map = getMap(t);
            if (map != null)
                map.set(this, value);
            else
                createMap(t, value);
        }
        
            // getMap 方法返回一个 threadLocals  那么 threadLocals 是什么呢？
            
            ThreadLocalMap getMap(Thread t) {
                return t.threadLocals;
            }   
            
            
                // 源码中 threadLocal 开始时  就是一个null  他表示的就是 ThreadLocalMap的属性 
                
              /* ThreadLocal values pertaining to this thread. This map is maintained
                 * by the ThreadLocal class. */
                ThreadLocal.ThreadLocalMap threadLocals = null;
                
                // 创建 ThreadLocalMap   注意 参数是 线程T 但是创建 该ThreadLocalMap时 用的参数是 this 那么this代表的就是 ThreadLocal 所以说 每个new ThreadLocal 就会有其特有的ThreadLocalMap 用来存储信息.
                
                 void createMap(Thread t, T firstValue) {
                 //  对 ThreadLcoalMap 中的 threadLocals 进行了赋值  每个ThreadLocal 的hashCode 不同,所以每个ThreadLocal 实例对象都有其 ThreadLocalMap
                        t.threadLocals = new ThreadLocalMap(this, firstValue);
                    }
                    
                   // 移出方法  
                        public void remove() {
                            ThreadLocalMap m = getMap(Thread.currentThread());
                            if (m != null)
                                m.remove(this);
                        }
                        
根据测试结果可以看到  remove 也就是移出的t3的值,但是t2 的值还是照样能够得到.所以通过源码我们知道了 ThreadLocal 的ThreadLocalMap 的key 是 ThreadLocal本身,因为每个ThreadLocal的hashCode都不同,因此不会产生覆盖问题.             

            
        
