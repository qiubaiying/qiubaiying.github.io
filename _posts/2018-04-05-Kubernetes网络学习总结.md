---
title: Kubernetes网络学习总结
subtitle:   网络是重中之重，排错就看这一哆嗦
date: 2018-04-05
header-img: img/123.jpg
catalog: true
tags: k8s
---
## 一、整体上需要涉及到的知识
1. Linux的网络
2. Docker的网络
3. Kubernetes的网络

### Linux的网络的几个概念
1. 网络命名空间:Linux在网络栈中引入网络命名空间，将独立的网络协议栈隔离到不同的命名空间中，彼此间无法通信。docker利用这一特性，实现不同容器间的网络隔离。
2. 网桥:网桥是一个二层网络设备,通过网桥可以将linux支持的不同的端口连接起来,并实现类似交换机那样的多对多的通信。
3. Veth设备对:实现在不同网络命名空间的通信。
4. 路由: IP层处理数据发送或转发的时候，会使用路由表来决定发往哪里。








## 一、Kubernetes网络模型
在Kubernetes网络中存在两种IP（Pod IP和Service Cluster IP），Pod IP 地址是实际存在于某个网卡(可以是虚拟设备)上的，Service Cluster IP它是一个虚拟IP，是由kube-proxy使用Iptables规则重新定向到其本地端口，再均衡到后端Pod的。
* 基本原则：每个pod都有自己的独立的IP地址，而且pod的网络在一个扁平的可以直连的网络空间中。
* 设计理念：用户创建pod后不需要关心如何建立pod之间的连接，也不需要考虑通过什么样的方式把容器的端口映射到宿主机上。
* 网络要求：互通，pod和pod之间，pod和node之间，不同node上的不同pod。

## 二、Docker网络初探
### 1.安装完docker之后，宿主机上会创建三个网络，分别是bridge网络，host网络，none网络，可以使用docker network ls查看
![network.png](K8S网络学习/network.png)
### 2.
