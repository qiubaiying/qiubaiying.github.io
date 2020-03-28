---
title: Kubernetes网络学习总结
subtitle:   记录Docker & Kubernetes的网络学习知识
date: 2018-04-05
header-img: img/123.jpg
catalog: true
tags: k8s
---
#### 一、想要学习的
* Linux的网络
* Docker的网络
* Kubernetes的网络

#### 二、Linux的网络的几个概念
* 网络命名空间：Linux在网络栈中引入网络命名空间，将独立的网络协议栈隔离到不同的命名空间中，彼此间无法通信。docker利用这一特性，实现不同容器间的网络隔离。
* 网桥：网桥是一个二层网络设备,通过网桥可以将linux支持的不同的端口连接起来,并实现类似交换机那样的多对多的通信。
* Veth设备对：实现在不同网络命名空间的通信。
* 路由：IP层处理数据发送或转发的时候，会使用路由表来决定发往哪里。

#### 三、Docker的网络驱动

###### 1.bridge网络
在网络方面，桥接网络是在网段之间转发流量的链路层设备。桥可以是在主机内核中运行的硬件设备或软件设备。
就Docker而言，bridge网络使用软件网桥，该软件网桥允许连接到同一网桥网络的容器进行通信，同时与未连接到该网桥网络的容器隔离。Docker网桥驱动程序会自动在主机中安装规则，以使不同网桥网络上的容器无法直接相互通信。桥接网络适用于在同一Docker守护程序主机上运行的容器。不适用于跨Docker宿主机上的通信。
当Docker进程启动时，会在主机上创建一个名为docker0的虚拟网桥，此主机上启动的Docker容器会连接到这个虚拟网桥上，所以有默认地址172.17.0.0/16的地址。虚拟网桥的工作方式和物理交换机类似，这样主机上的所有容器就通过交换机连在了一个二层网络中。从docker0子网中分配一个IP给容器使用，并设置docker0的IP地址为容器的默认网关。在主机上创建一对虚拟网卡veth pair设备，Docker将veth pair设备的一端放在新创建的容器中，并命名为eth0（容器的网卡），另一端放在主机中，以vethxxx这样类似的名字命名，并将这个网络设备加入到docker0网桥中。可以通过brctl show命令查看。
![brctl.png](http://q7mj5531m.bkt.clouddn.com/brctl.png)

bridge模式是docker的默认网络模式，不写--net参数，就是bridge模式。使用docker run -p时，docker实际是在iptables做了DNAT规则，实现端口转发功能。可以使用iptables -t nat -vnL查看。
![dnat.png](http://q7mj5531m.bkt.clouddn.com/dnat.png)

bridge模式如下图：
![docker-netework-bridge.jpeg](http://q7mj5531m.bkt.clouddn.com/docker-netework-bridge.jpeg)

用户自定义bridge网络和默认bridge网络（推荐使用用户自定义的bridge网络）：
* 用户定义的网桥可在容器之间提供自动DNS解析。默认桥接网络上的容器只能通过IP地址互相访问，除非使用--link选项（官方已弃用）。在用户定义的网桥网络上，容器可以通过名称或别名相互解析。添加hosts的方式一旦container的数量增多或者container的IP地址的变化就会变得异常复杂和不可控。
* 用户定义的桥可提供更好的隔离。使用默认网桥的所有容器之间都可以通信，自定义网桥可以隔离不同业务场景的容器。
* 容器可以随时随地从用户定义的网络连接和分离。在容器的生命周期内，可以随时将其与用户定义的网络连接或断开。要从默认网桥网络中删除容器，需要停止容器并使用其他网络选项重新创建它。
* 每个用户定义的网络都会创建一个可配置的网桥。默认网桥和自定义网桥都可以进行配置，但是如果使用默认网桥，并修改了一些配置参数是全局生效的，也就是说所有在此宿主机上的容器都会使用相同的网络配置，且配置完默认网桥后需要重启docker本身。
* 默认网桥网络上的链接容器共享环境变量。



#### 四、Kubernetes的网络
在Kubernetes网络中存在两种IP（Pod IP和Service Cluster IP），Pod IP 地址是实际存在于某个网卡(可以是虚拟设备)上的，Service Cluster IP它是一个虚拟IP，是由kube-proxy使用Iptables规则重新定向到其本地端口，再均衡到后端Pod的。
* 基本原则：每个pod都有自己的独立的IP地址，而且pod的网络在一个扁平的可以直连的网络空间中。
* 设计理念：用户创建pod后不需要关心如何建立pod之间的连接，也不需要考虑通过什么样的方式把容器的端口映射到宿主机上。
* 网络要求：互通，pod和pod之间，pod和node之间，不同node上的不同pod。
