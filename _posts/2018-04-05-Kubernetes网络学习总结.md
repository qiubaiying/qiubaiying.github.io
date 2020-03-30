---
title: Kubernetes网络学习总结
subtitle:   记录Docker & Kubernetes的网络学习知识，记录持续更新
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

###### bridge网络
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
详细信息可以参考Docker官方文档：https://docs.docker.com/network/bridge/

###### overlay网络
俗称隧道网络，它是基于VxLAN协议来将二层数据包封装到UDP中进行传输的，目的是扩展二层网段，因为 VLAN 使用12bit标记VLANID，最多支持4094个 这对于大型云网络会成为瓶颈，而VxLANID使用24bit来标记，支持16777216个二层网段，所以VxLAN是扩展了的VLAN，也叫做大二层网络。

在早期的docker版本中，是不支持跨主机通信网络驱动的，也就是说如果容器部署在不同的节点上面，只能通过暴露端口到宿主机上，再通过宿主机之间进行通信。随着docker swarm集群的推广，docker也有了自家的跨主机通信网络驱动，名叫overlay，overlay网络模型是swarm集群容器间通信的载体，将服务加入到同一个网段上的Overlay网络上，服务与服务之间就能够通信。官方文档里使用Docker Swarm来完成Docker跨主机网络的搭建。Docker Swarm并不是必须的，只要有key-value存储服务器（比如consul、etcd、zookeeper）和运行了Docker的主机就能完成搭建。

需要kv数据库是因为overlay网络需要一个全局的“上帝”来记录它网络中的信息，比如主机地址，子网等，这个上帝在Docker中是由服务发现协议来完成的，服务发现本质上是一个key-value 数据库，要使用它，首先需要向它告知（注册）一些必要的信息（如网络中需要通信的主机），然后它就会自动去收集、同步网络的信息，同时，还会维护一个 IP 地址池，分配给主机中的容器使用。

###### Host网络（主机网络）

如果使用host网络模式，则该容器的网络堆栈不会与Docker主机隔离（该容器共享主机的网络命名空间），并且该容器不会分配自己的IP地址。例如，如果运行一个绑定到端口80的host 网络模式的容器，则可以直接使用宿主机的IP上的80端口。由于使用host网络时容器没有自己的IP地址 所以端口映射也是不生效的，-p，--publish，-P，和--publish-all选项都将被忽略。如果加上-p 参数会有一个WARNING: Published ports are discarded when using host network mode 的报警。
Host网络对于优化性能以及在容器需要处理大量端口的情况下很有用，它不需要网络地址转换（NAT），并且不会为每个端口创建proxy策略。


###### Macvlan网络

macvlan是一种网卡虚拟化技术，它能够将一个物理网卡虚拟出多个接口，每个接口都可以配置MAC地址，每个接口也可以配自己的IP，每个接口就像交换机的端口一样，可以为它划分 VLAN。macvlan 这种技术听起来有点像 VLAN，但它们的实现机制是完全不一样的。macvlan 子接口和原来的主接口是完全独立的，可以单独配置MAC地址和IP地址，而VLAN 子接口和主接口共用相同的MAC地址。VLAN用来划分广播域，而macvlan共享同一个广播域。
macvlan的做法其实就是将这些虚拟出来的接口与容器直连来达到通信的目的。一个macvlan网络对应一个接口，不同的macvlan网络分配不同的子网，因此，相同的 macvlan之间可以互相通信，不同的macvlan网络之间在二层上不能通信，需要借助三层的路由器才能完成通信。

![dockermacvlan3.jpeg](http://q7mj5531m.bkt.clouddn.com/dockermacvlan3.jpeg)

###### none网络
none网络是Docker Engine启动即默认创建的网络之一。none网络的网络驱动器为none，即-d=none。
none网络是一个完全隔离的自治网络，甚至与Docker宿主机的网络都不通，必须手工配置网卡后才能够使用。
加入到该网络的容器实例，往往要在后续设置中加入到其他的第三方网络。


#### 四、Kubernetes的网络
在Kubernetes网络中存在两种IP（Pod IP和Service Cluster IP），Pod IP 地址是实际存在于某个网卡(可以是虚拟设备)上的，Service Cluster IP它是一个虚拟IP，是由kube-proxy使用Iptables规则重新定向到其本地端口，再均衡到后端Pod的。
* 基本原则：每个pod都有自己的独立的IP地址，而且pod的网络在一个扁平的可以直连的网络空间中。
* 设计理念：用户创建pod后不需要关心如何建立pod之间的连接，也不需要考虑通过什么样的方式把容器的端口映射到宿主机上。
* 网络要求：互通，pod和pod之间，pod和node之间，不同node上的不同pod，Pod与Service之间的网络，Internet与Service之间的网络



























