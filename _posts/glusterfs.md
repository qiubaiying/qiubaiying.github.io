---
title: GlusterFS简介&搭建&在Kubernetes中的使用
date: 2018-09-22 12:38:50
tags: k8s
---
<font color=#0000FF  face="黑体">-------我------是-------分-------割-------线</font>
&nbsp;
### 一，分布式文件系统
分布式文件系统（Distributed File System）是指文件系统管理的物理存储资源并不直接与本地节点相连，而是分布于计算网络中的一个或者多个节点的计算机上。目前意义上的分布式文件系统大多都是由多个节点计算机构成，结构上是典型的C/S模式。当客户机需要存储数据时，服务器指引其将数据分散存储到多个存储节点上，以提供更快的速度，更大的容量及更好的冗余特性。
&nbsp;
### 二，GlusterFS概述
GlusterFS是一个可扩展的网络文件系统，相比其他分布式文件系统，GlusterFS具有高扩展性、高可用性、高性能、可横向扩展等特点，并且其没有元数据服务器的设计，让整个服务没有单点故障的隐患。这是其最大的设计这点，对于提升整个系统的性能、可靠性和稳定性都有着决定性的意义。GlusterFS 总体架构与组成部分如图1所示，它主要由存储服务器（Brick Server）、客户端以及 NFS/Samba 存储网关组成.
![gluster.png](gluster/gluster.png)
&nbsp;
几个基本概念及术语：
* GlusterFS 支持 TCP/IP 和 InfiniBand RDMA 高速网络互联。
* 客户端可通过原生 GlusterFS 协议访问数据，其他没有运行 GlusterFS 客户端的终端可通过 NFS/CIFS 标准协议通过存储网关访问数据（存储网关提供弹性卷管理和访问代理功能）。
* 存储服务器主要提供基本的数据存储功能，客户端弥补了没有元数据服务器的问题，承担了更多的功能，包括数据卷管理、I/O 调度、文件定位、数据缓存等功能，利用 FUSE（File system in User Space）模块  将 GlusterFS 挂载到本地文件系统之上，实现 POSIX 兼容的方式来访问系统数据。
* Brick: GFS中的存储单元，通过是一个受信存储池中的服务器的一个导出目录。可以通过主机名和目录名来标识，如'SERVER:EXPORT'
* Client: 挂载了GFS卷的设备
* Extended Attributes: xattr是一个文件系统的特性，其支持用户或程序关联文件/目录和元数据。
* FUSE: Filesystem Userspace是一个可加载的内核模块，它支持非特权用户创建自己的文件系统而不需要修改内核代码。通过在用户空间运行文件系统的代码，FUSE代码与内核进行桥接。
* GFID: GFS volume中的每个文件或目录都有一个唯一的128位的数据和其相关联，用于模拟inode。
* Namespace: 每个Gluster卷都导出单个ns作为POSIX的挂载点。（请区别与k8s的namespace）
* Node: 一个拥有若干brick的设备，我这里理解就是GFS Cluster中的某一个节点。
* RDMA: 远程直接内存访问，支持不通过双方的OS层，直接通过内存访问。
* Self-heal: 用于后台运行检测复本卷中文件和目录的不一致性并解决这些不一致。
* Volume: 一组bricks的逻辑集合
* Split-brain: 脑裂



