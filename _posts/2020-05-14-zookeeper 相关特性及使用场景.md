---
layout:     post
title:      zookeeper 相关特性及使用场景
subtitle:   Zookeeper数据类型、节点类型、角色、watcher监听机制
date:       2020-05-14
author:     YuLe
header-img: img/post-bg-re-vs-ng2.jpg
catalog: true
tags:
    - zookeeper
---

# zookeeper 相关特性及使用场景





## zookeeper 介绍

​		了解微服务的小伙伴都应该知道Zookeeper，Zookeeper是一个分布式的,开源的分布式应用程序协调服务。Zookeeper是Googel的Chubby的一个开源实现，是Hadoop的分布式协调服务，它包好了一个简单的原语，分布式应用程序可以基于它实现同步服务，配置维护和命名服务等。

​		现在比较流行的微服务框架Dubbo、Spring Cloud都可以使用Zookeeper作为服务发现与组册中心。但是，为什么Zookeeper就能实现服务发现与组册呢？



## Zookeeper节点类型

### 1.树状目录结构

Zookeeper是一个树状的文件目录结构，有点想应用系统中的文件系统的概念。每个子目录被称为znode，我们可以对每个znode进行增删改查。

### 2.持久节点(Persistent)

Zookeeper服务端断开连接后，该节点仍然存在。

### 3.持久有序节点(Persistent_sequential)

在持久节点基础上，由zookeeper给该节点名称进行有序编号，如0000001，0000002。

### 4.临时节点(Ephemeral)

Zookeeper服务端断开连接后，该节点被删除。临时节点下，不存在子节点。

### 5.临时有序节点(Ephemeral_sequential)

在临时节点基础上，由Zookeeper给该节点名称进行有序编号，如0000001，0000002。

### 6.节点监听(Wacher)

![image](https://yqfile.alicdn.com/0e5725f5f4446a525b13219286843bc48cbc8f44.png)



客户端2注册监听它关心的临时节点SubApp1的变化，当临时节点SubApp1发生变化时（如图中被删除的时候），zookeeper会通知客户端2。

该机制是zookeeper实现分布式协调的重要特性。我们可以通过get，exists，getchildren三种方式对某个节点进行监听。但是该事件只会通知一次。



## Zookeeper角色

**leader：**负责投票的发起和决议，更新系统状态，处理事务请求。

**follower跟随者**：参与投票，接收客户端请求，处理非事务请求并返回结果，转发事务请求给leader。

**observer观察者**：不参与投票过程，只同步leader状态，为了扩展系统，提高读写速度。也接收客户端请求，处理非事务请求并返回结果，转发事务请求给leader。

**client客户端**：请求发起方。



## Watcher监听机制

（1）监控目录节点数据变化

（2）监控子目录变化

（3）一旦这些节点发生变化，服务器就会通知所有设置在这个目录节点上的Watcher，使得每个客户端都很快知道其关注的目录节点的状态发生变化，从而做出相应反应。



## zookeeper微服务中应用场景

### 1.分布式锁

分布式锁主要解决不同进程中的资源同步问题。大家可以联想一下单进程中的多线程共享资源的情况，线程需要访问共享资源，首先要获得锁，操作完共享资源后便释放锁。Zookeeper怎么实现分布式锁？这篇推荐大家阅读。

分布式中，上述的锁就变成了分布式锁了。那这个分布式锁又是如何实现呢？



![image](https://yqfile.alicdn.com/2b3dc8c1338946ad2ad2f7f5970ea1413a5d935a.png)

步骤1: 如图，根据Zookeeper有序临时节点的特性，每个进程对应连接一个有序临时节点（进程1对应节点/znode/00000001，进程2对应节点/znode/00000002…如此类推）。

每个进程监听对应的上一个节点的变化。编号最小的节点对应的进程获得锁，可以操作资源。



![image](https://yqfile.alicdn.com/0ba381c7c26e86370c33acccdf45408b5e426e12.png)

步骤2: 当进程1完成业务后，删除对应的子节点/znode/00000001，释放锁。此时，编号最小的锁便获得锁（即/znode/00000002对应进程）。

重复以上步骤，保证了多个进程获取的是同一个锁，且只有一个进程能获得锁，就是Zookeeper分布式锁的实现原理。

### 2.服务注册与发现

**2.1 背景**



![image](https://yqfile.alicdn.com/bd5f36579710f69fbaebcff3638f6a93d5612964.png)

在微服务中，服务提供方把服务注册到Zookeeper中心去如图中的Member服务，但是每个应用可能拆分成多个服务对应不同的Ip地址，Zookeeper注册中心可以动态感知到服务节点的变化。
服务消费方（Order 服务）需要调用提供方（Member 服务）提供的服务时，从Zookeeper中获取提供方的调用地址列表，然后进行调用。这个过程称为服务的订阅。

**2.2服务注册原理**



![image](https://yqfile.alicdn.com/13eddd481b5f28fea18cb46a3103d58b4c1e32c7.png)

rpc框架会在Zookeeper的注册目录下，为每个应用创建一个持久节点，如order应用创建order持久节点，member应用创建member持久节点。

然后在对应的持久节点下，为每个微服务创建一个临时节点，记录每个服务的URL等信息。

**2.3服务动态发现原理**



![image](https://yqfile.alicdn.com/e2bd67df549306b076f18c6f9a0bb9ddd2adb0dc.png)

方向Zookeeper订阅了（监听）服务提供方，一旦服务提供方有变动的时候（增加服务或者减少服务），Zookeeper就会把最新的服务提供方列表（member list）推送给服务消费方，这就是服务动态发现的原理。

