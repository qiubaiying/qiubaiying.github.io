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
![mark](data:image/png;base64,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 "mark")

重量级锁,synchronized的对象锁，锁标识位为10，其中指针指向的是monitor对象（也称为管程或监视器锁）的起始地址。每个对象都存在着一个 monitor 与之关联，对象与其 monitor 之间的关系有存在多种实现方式，如monitor可以与对象一起创建销毁或当线程试图获取对象锁时自动生成，但当一个 monitor 被某个线程持有后，它便处于锁定状态。在Java虚拟机(HotSpot)中，monitor是由ObjectMonitor实现的，其主要数据结构如下（位于HotSpot虚拟机源码ObjectMonitor.hpp文件，C++实现的）
```
ObjectMonitor() {
    _header       = NULL;
    _count        = 0; //记录个数
    _waiters      = 0,
    _recursions   = 0;
    _object       = NULL;
    _owner        = NULL;
    _WaitSet      = NULL; //处于wait状态的线程，会被加入到_WaitSet
    _WaitSetLock  = 0 ;
    _Responsible  = NULL ;
    _succ         = NULL ;
    _cxq          = NULL ;
    FreeNext      = NULL ;
    _EntryList    = NULL ; //处于等待锁block状态的线程，会被加入到该列表
    _SpinFreq     = 0 ;
    _SpinClock    = 0 ;
    OwnerIsThread = 0 ;
  }
```
ObjectMonitor中有两个队列，_WaitSet 和 _EntryList，用来保存ObjectWaiter对象列表( 每个等待锁的线程都会被封装成ObjectWaiter对象)，_owner指向持有ObjectMonitor对象的线程，当多个线程同时访问一段同步代码时，首先会进入 _EntryList 集合，当线程获取到对象的monitor 后进入 _Owner 区域并把monitor中的owner变量设置为当前线程同时monitor中的计数器count加1，若线程调用 wait() 方法，将释放当前持有的monitor，owner变量恢复为null，count自减1，同时该线程进入 WaitSe t集合中等待被唤醒。若当前线程执行完毕也将释放monitor(锁)并复位变量的值，以便其他线程进入获取monitor(锁)。

**synchronized代码块底层原理**
重新定义一个synchronized修饰的同步代码块，在代码块中操作共享变量i，如下
```
public class SyncCodeBlock {

   public int i;

   public void syncTask(){
       //同步代码库
       synchronized (this){
           i++;
       }
   }
}
```
编译上述代码并使用javap反编译后得到字节码如下(这里我们省略一部分没有必要的信息)：
```
Classfile /Users/zejian/Downloads/Java8_Action/src/main/java/com/zejian/concurrencys/SyncCodeBlock.class
  Last modified 2017-6-2; size 426 bytes
  MD5 checksum c80bc322c87b312de760942820b4fed5
  Compiled from "SyncCodeBlock.java"
public class com.zejian.concurrencys.SyncCodeBlock
  minor version: 0
  major version: 52
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
  //........省略常量池中数据
  //构造函数
  public com.zejian.concurrencys.SyncCodeBlock();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 7: 0
  //===========主要看看syncTask方法实现================
  public void syncTask();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=3, locals=3, args_size=1
         0: aload_0
         1: dup
         2: astore_1
         3: monitorenter  //注意此处，进入同步方法
         4: aload_0
         5: dup
         6: getfield      #2             // Field i:I
         9: iconst_1
        10: iadd
        11: putfield      #2            // Field i:I
        14: aload_1
        15: monitorexit   //注意此处，退出同步方法
        16: goto          24
        19: astore_2
        20: aload_1
        21: monitorexit //注意此处，退出同步方法
        22: aload_2
        23: athrow
        24: return
      Exception table:
      //省略其他字节码.......
}
SourceFile: "SyncCodeBlock.java"
```
我们主要关注字节码中的如下代码
```
3: monitorenter  //进入同步方法
//..........省略其他  
15: monitorexit   //退出同步方法
16: goto          24
//省略其他.......
21: monitorexit //退出同步方法
```
从字节码中可知同步语句块的实现使用的是monitorenter 和 monitorexit 指令，其中monitorenter指令指向同步代码块的开始位置，monitorexit指令则指明同步代码块的结束位置，当执行monitorenter指令时，当前线程将试图获取 objectref(即对象锁) 所对应的 monitor 的持有权，当 objectref 的 monitor 的进入计数器为 0，那线程可以成功取得 monitor，并将计数器值设置为 1，取锁成功。
如果当前线程已经拥有 objectref 的 monitor 的持有权，那它可以重入这个 monitor (关于重入性稍后会分析)，重入时计数器的值也会加 1。
倘若其他线程已经拥有 objectref 的 monitor 的所有权，那当前线程将被阻塞，直到正在执行线程执行完毕，即monitorexit指令被执行，执行线程将释放 monitor(锁)并设置计数器值为0 ，其他线程将有机会持有 monitor 。
值得注意的是编译器将会确保无论方法通过何种方式完成，方法中调用过的每条 monitorenter 指令都有执行其对应 monitorexit 指令，而无论这个方法是正常结束还是异常结束。为了保证在方法异常完成时 monitorenter 和 monitorexit 指令依然可以正确配对执行，编译器会自动产生一个异常处理器，这个异常处理器声明可处理所有的异常，它的目的就是用来执行 monitorexit 指令。从字节码中也可以看出多了一个monitorexit指令，它就是异常结束时被执行的释放monitor 的指
  
**synchronized方法底层原理**
方法级的同步是隐式，即无需通过字节码指令来控制的，它实现在方法调用和返回操作之中。JVM可以从方法常量池中的方法表结构(method_info Structure) 中的 ACC_SYNCHRONIZED 访问标志区分一个方法是否同步方法。当方法调用时，调用指令将会 检查方法的 ACC_SYNCHRONIZED 访问标志是否被设置，如果设置了，执行线程将先持有monitor（虚拟机规范中用的是管程一词）， 然后再执行方法，最后再方法完成(无论是正常完成还是非正常完成)时释放monitor。在方法执行期间，执行线程持有了monitor，其他任何线程都无法再获得同一个monitor。如果一个同步方法执行期间抛 出了异常，并且在方法内部无法处理此异常，那这个同步方法所持有的monitor将在异常抛到同步方法之外时自动释放。下面我们看看字节码层面如何实现：
```
public class SyncMethod {

   public int i;

   public synchronized void syncTask(){
           i++;
   }
}
```
使用javap反编译后的字节码如下：
```
Classfile /Users/zejian/Downloads/Java8_Action/src/main/java/com/zejian/concurrencys/SyncMethod.class
  Last modified 2017-6-2; size 308 bytes
  MD5 checksum f34075a8c059ea65e4cc2fa610e0cd94
  Compiled from "SyncMethod.java"
public class com.zejian.concurrencys.SyncMethod
  minor version: 0
  major version: 52
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool;

   //省略没必要的字节码
  //==================syncTask方法======================
  public synchronized void syncTask();
    descriptor: ()V
    //方法标识ACC_PUBLIC代表public修饰，ACC_SYNCHRONIZED指明该方法为同步方法
    flags: ACC_PUBLIC, ACC_SYNCHRONIZED
    Code:
      stack=3, locals=1, args_size=1
         0: aload_0
         1: dup
         2: getfield      #2                  // Field i:I
         5: iconst_1
         6: iadd
         7: putfield      #2                  // Field i:I
        10: return
      LineNumberTable:
        line 12: 0
        line 13: 10
}
SourceFile: "SyncMethod.java"
```

synchronized修饰的方法并没有monitorenter指令和monitorexit指令，取得代之的确实是ACC_SYNCHRONIZED标识，该标识指明了该方法是一个同步方法，JVM通过该ACC_SYNCHRONIZED访问标志来辨别一个方法是否声明为同步方法，从而执行相应的同步调用。这便是synchronized锁在同步代码块和同步方法上实现的基本原理。同时我们还必须注意到的是在Java早期版本中，synchronized属于重量级锁，效率低下，因为监视器锁（monitor）是依赖于底层的操作系统的Mutex Lock来实现的，而操作系统实现线程之间的切换时需要从用户态转换到核心态，这个状态之间的转换需要相对比较长的时间，时间成本相对较高，这也是为什么早期的synchronized效率低的原因。庆幸的是在Java 6之后Java官方对从JVM层面对synchronized较大优化，所以现在的synchronized锁效率也优化得很不错了，Java 6之后，为了减少获得锁和释放锁所带来的性能消耗，引入了轻量级锁和偏向锁

**Java虚拟机对synchronized的优化**
锁的状态总共有四种，无锁状态、偏向锁、轻量级锁和重量级锁。随着锁的竞争，锁可以从偏向锁升级到轻量级锁，再升级的重量级锁，但是锁的升级是单向的，也就是说只能从低到高升级，不会出现锁的降级，关于重量级锁，前面我们已详细分析过，下面我们将介绍偏向锁和轻量级锁以及JVM的其他优化手段，这里并不打算深入到每个锁的实现和转换过程更多地是阐述Java虚拟机所提供的每个锁的核心优化思想，毕竟涉及到具体过程比较繁琐，如需了解详细过程可以查阅《深入理解Java虚拟机原理》

**偏向锁**  

偏向锁是Java 6之后加入的新锁，它是一种针对加锁操作的优化手段，经过研究发现，在大多数情况下，锁不仅不存在多线程竞争，而且总是由同一线程多次获得，因此为了减少同一线程获取锁(会涉及到一些CAS操作,耗时)的代价而引入偏向锁。偏向锁的核心思想是，如果一个线程获得了锁，那么锁就进入偏向模式，此时Mark Word 的结构也变为偏向锁结构，当这个线程再次请求锁时，无需再做任何同步操作，即获取锁的过程，这样就省去了大量有关锁申请的操作，从而也就提供程序的性能。所以，对于没有锁竞争的场合，偏向锁有很好的优化效果，毕竟极有可能连续多次是同一个线程申请相同的锁。但是对于锁竞争比较激烈的场合，偏向锁就失效了，因为这样场合极有可能每次申请锁的线程都是不相同的，因此这种场合下不应该使用偏向锁，否则会得不偿失，需要注意的是，偏向锁失败后，并不会立即膨胀为重量级锁，而是先升级为轻量级锁
**轻量级锁**

倘若偏向锁失败，虚拟机并不会立即升级为重量级锁，它还会尝试使用一种称为轻量级锁的优化手段(1.6之后加入的)，此时Mark Word 的结构也变为轻量级锁的结构。轻量级锁能够提升程序性能的依据是“对绝大部分的锁，在整个同步周期内都不存在竞争”，注意这是经验数据。需要了解的是，轻量级锁所适应的场景是线程交替执行同步块的场合，如果存在同一时间访问同一锁的场合，就会导致轻量级锁膨胀为重量级锁

**自旋锁**

轻量级锁失败后，虚拟机为了避免线程真实地在操作系统层面挂起，还会进行一项称为自旋锁的优化手段。这是基于在大多数情况下，线程持有锁的时间都不会太长，如果直接挂起操作系统层面的线程可能会得不偿失，毕竟操作系统实现线程之间的切换时需要从用户态转换到核心态，这个状态之间的转换需要相对比较长的时间，时间成本相对较高，因此自旋锁会假设在不久将来，当前的线程可以获得锁，因此虚拟机会让当前想要获取锁的线程做几个空循环(这也是称为自旋的原因)，一般不会太久，可能是50个循环或100循环，在经过若干次循环后，如果得到锁，就顺利进入临界区。如果还不能获得锁，那就会将线程在操作系统层面挂起，这就是自旋锁的优化方式，这种方式确实也是可以提升效率的。最后没办法也就只能升级为重量级锁了

**锁消除**

消除锁是虚拟机另外一种锁的优化，这种优化更彻底，Java虚拟机在JIT编译时(可以简单理解为当某段代码即将第一次被执行时进行编译，又称即时编译)，通过对运行上下文的扫描，去除不可能存在共享资源竞争的锁，通过这种方式消除没有必要的锁，可以节省毫无意义的请求锁时间，如下StringBuffer的append是一个同步方法，但是在add方法中的StringBuffer属于一个局部变量，并且不会被其他线程所使用，因此StringBuffer不可能存在共享资源竞争的情景，JVM会自动将其锁消除。
```
/**
 * Created by zejian on 2017/6/4.
 * Blog : http://blog.csdn.net/javazejian [原文地址,请尊重原创]
 * 消除StringBuffer同步锁
 */
public class StringBufferRemoveSync {

    public void add(String str1, String str2) {
        //StringBuffer是线程安全,由于sb只会在append方法中使用,不可能被其他线程引用
        //因此sb属于不可能共享的资源,JVM会自动消除内部的锁
        StringBuffer sb = new StringBuffer();
        sb.append(str1).append(str2);
    }

    public static void main(String[] args) {
        StringBufferRemoveSync rmsync = new StringBufferRemoveSync();
        for (int i = 0; i < 10000000; i++) {
            rmsync.add("abc", "123");
        }
    }

}
```
**synchronized的可重入性**

从互斥锁的设计上来说，当一个线程试图操作一个由其他线程持有的对象锁的临界资源时，将会处于阻塞状态，但当一个线程再次请求自己持有对象锁的临界资源时，这种情况属于重入锁，请求将会成功，在java中synchronized是基于原子性的内部锁机制，是可重入的，因此在一个线程调用synchronized方法的同时在其方法体内部调用该对象另一个synchronized方法，也就是说一个线程得到一个对象锁后再次请求该对象锁，是允许的，这就是synchronized的可重入性
```
public class AccountingSync implements Runnable{
    static AccountingSync instance=new AccountingSync();
    static int i=0;
    static int j=0;
    @Override
    public void run() {
        for(int j=0;j<1000000;j++){

            //this,当前实例对象锁
            synchronized(this){
                i++;
                increase();//synchronized的可重入性
            }
        }
    }

    public synchronized void increase(){
        j++;
    }


    public static void main(String[] args) throws InterruptedException {
        Thread t1=new Thread(instance);
        Thread t2=new Thread(instance);
        t1.start();t2.start();
        t1.join();t2.join();
        System.out.println(i);
    }
}
```
正如代码所演示的，在获取当前实例对象锁后进入synchronized代码块执行同步代码，并在代码块中调用了当前实例对象的另外一个synchronized方法，再次请求当前实例锁时，将被允许，进而执行方法体代码，这就是重入锁最直接的体现，需要特别注意另外一种情况，当子类继承父类时，子类也是可以通过可重入锁调用父类的同步方法。注意由于synchronized是基于monitor实现的，因此每次重入，monitor中的计数器仍会加1

**线程中断与synchronized**
**线程中断**
在线程运行(run方法)中间打断它，在Java中，提供了以下3个有关线程中断的方法
```
//中断线程（实例方法）
public void Thread.interrupt();

//判断线程是否被中断（实例方法）
public boolean Thread.isInterrupted();

//判断是否被中断并清除当前中断状态（静态方法）
public static boolean Thread.interrupted();

```
当一个线程处于被阻塞状态或者试图执行一个阻塞操作时，使用Thread.interrupt()方式中断该线程，注意此时将会抛出一个InterruptedException的异常，同时中断状态将会被复位(由中断状态改为非中断状态)
```
public class InterruputSleepThread3 {
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread() {
            @Override
            public void run() {
                //while在try中，通过异常中断就可以退出run循环
                try {
                    while (true) {
                        //当前线程处于阻塞状态，异常必须捕捉处理，无法往外抛出
                        TimeUnit.SECONDS.sleep(2);
                    }
                } catch (InterruptedException e) {
                    System.out.println("Interruted When Sleep");
                    boolean interrupt = this.isInterrupted();
                    //中断状态被复位
                    System.out.println("interrupt:"+interrupt);
                }
            }
        };
        t1.start();
        TimeUnit.SECONDS.sleep(2);
        //中断处于阻塞状态的线程
        t1.interrupt();

        /**
         * 输出结果:
           Interruted When Sleep
           interrupt:false
         */
    }
}
```
我们创建一个线程，并在线程中调用了sleep方法从而使用线程进入阻塞状态，启动线程后，调用线程实例对象的interrupt方法中断阻塞异常，并抛出InterruptedException异常，此时中断状态也将被复位。这里有些人可能会诧异，为什么不用Thread.sleep(2000);而是用TimeUnit.SECONDS.sleep(2);其实原因很简单，前者使用时并没有明确的单位说明，而后者非常明确表达秒的单位，事实上后者的内部实现最终还是调用了Thread.sleep(2000);，但为了编写的代码语义更清晰，建议使用TimeUnit.SECONDS.sleep(2);的方式，注意TimeUnit是个枚举类型。ok~，除了阻塞中断的情景，我们还可能会遇到处于运行期且非阻塞的状态的线程，这种情况下，直接调用Thread.interrupt()中断线程是不会得到任响应的，如下代码，将无法中断非阻塞状态下的线程：
```
public class InterruputThread {
    public static void main(String[] args) throws InterruptedException {
        Thread t1=new Thread(){
            @Override
            public void run(){
                while(true){
                    System.out.println("未被中断");
                }
            }
        };
        t1.start();
        TimeUnit.SECONDS.sleep(2);
        t1.interrupt();

        /**
         * 输出结果(无限执行):
             未被中断
             未被中断
             未被中断
             ......
         */
    }
}
```
虽然我们调用了interrupt方法，但线程t1并未被中断，因为处于非阻塞状态的线程需要我们手动进行中断检测并结束程序，改进后代码如下：
```
public class InterruputThread {
    public static void main(String[] args) throws InterruptedException {
        Thread t1=new Thread(){
            @Override
            public void run(){
                while(true){
                    //判断当前线程是否被中断
                    if (this.isInterrupted()){
                        System.out.println("线程中断");
                        break;
                    }
                }

                System.out.println("已跳出循环,线程中断!");
            }
        };
        t1.start();
        TimeUnit.SECONDS.sleep(2);
        t1.interrupt();

        /**
         * 输出结果:
            线程中断
            已跳出循环,线程中断!
         */
    }
}
```
是的，我们在代码中使用了实例方法isInterrupted判断线程是否已被中断，如果被中断将跳出循环以此结束线程,注意非阻塞状态调用interrupt()并不会导致中断状态重置。综合所述，可以简单总结一下中断两种情况，一种是当线程处于阻塞状态或者试图执行一个阻塞操作时，我们可以使用实例方法interrupt()进行线程中断，执行中断操作后将会抛出interruptException异常(该异常必须捕捉无法向外抛出)并将中断状态复位，另外一种是当线程处于运行状态时，我们也可调用实例方法interrupt()进行线程中断，但同时必须手动判断中断状态，并编写中断线程的代码(其实就是结束run方法体的代码)。有时我们在编码时可能需要兼顾以上两种情况，那么就可以如下编写：
```
public void run(){
    try {
    //判断当前线程是否已中断,注意interrupted方法是静态的,执行后会对中断状态进行复位
    while (!Thread.interrupted()) {
        TimeUnit.SECONDS.sleep(2);
    }
    } catch (InterruptedException e) {

    }
}
```
**中断与synchronized**

事实上线程的中断操作对于正在等待获取的锁对象的synchronized方法或者代码块并不起作用，也就是对于synchronized来说，如果一个线程在等待锁，那么结果只有两种，要么它获得这把锁继续执行，要么它就保存等待，即使调用中断线程的方法，也不会生效。演示代码如下
```
/**
 * Created by zejian on 2017/6/2.
 * Blog : http://blog.csdn.net/javazejian [原文地址,请尊重原创]
 */
public class SynchronizedBlocked implements Runnable{

    public synchronized void f() {
        System.out.println("Trying to call f()");
        while(true) // Never releases lock
            Thread.yield();
    }

    /**
     * 在构造器中创建新线程并启动获取对象锁
     */
    public SynchronizedBlocked() {
        //该线程已持有当前实例锁
        new Thread() {
            public void run() {
                f(); // Lock acquired by this thread
            }
        }.start();
    }
    public void run() {
        //中断判断
        while (true) {
            if (Thread.interrupted()) {
                System.out.println("中断线程!!");
                break;
            } else {
                f();
            }
        }
    }


    public static void main(String[] args) throws InterruptedException {
        SynchronizedBlocked sync = new SynchronizedBlocked();
        Thread t = new Thread(sync);
        //启动后调用f()方法,无法获取当前实例锁处于等待状态
        t.start();
        TimeUnit.SECONDS.sleep(1);
        //中断线程,无法生效
        t.interrupt();
    }
}
```
我们在SynchronizedBlocked构造函数中创建一个新线程并启动获取调用f()获取到当前实例锁，由于SynchronizedBlocked自身也是线程，启动后在其run方法中也调用了f()，但由于对象锁被其他线程占用，导致t线程只能等到锁，此时我们调用了t.interrupt();但并不能中断线程。

**等待唤醒机制与synchronized**

所谓等待唤醒机制本篇主要指的是notify/notifyAll和wait方法，在使用这3个方法时，必须处于synchronized代码块或者synchronized方法中，否则就会抛出IllegalMonitorStateException异常，这是因为调用这几个方法前必须拿到当前对象的监视器monitor对象，也就是说notify/notifyAll和wait方法依赖于monitor对象，在前面的分析中，我们知道monitor 存在于对象头的Mark Word 中(存储monitor引用指针)，而synchronized关键字可以获取 monitor ，这也就是为什么notify/notifyAll和wait方法必须在synchronized代码块或者synchronized方法调用的原因。
```
synchronized (obj) {
       obj.wait();
       obj.notify();
       obj.notifyAll();
 }
```


需要特别理解的一点是，与sleep方法不同的是wait方法调用完成后，线程将被暂停，但wait方法将会释放当前持有的监视器锁(monitor)，直到有线程调用notify/notifyAll方法后方能继续执行，而sleep方法只让线程休眠并不释放锁。同时notify/notifyAll方法调用后，并不会马上释放监视器锁，而是在相应的synchronized(){}/synchronized方法执行结束后才自动释放锁。

