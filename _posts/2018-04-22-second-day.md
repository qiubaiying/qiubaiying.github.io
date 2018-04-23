---
layout:     post
title:      磁盘的相关概念
subtitle:   一只小白喵的初步探爪~
date:       2018-04-22
author:     Rebecca.Wu
header-img: img/post-bg-swift.jpg
catalog: true
tags:
    - WMX
---

    各位看官~来了解一下硬件方面的‘姿势’啊~

### 目录

[TOC]
-------------




## 磁盘的相关概念
### 硬盘的技术指标

主轴转速
平均寻道时间
数据传输率
高速缓存
单碟容量

### 硬盘接口方式
FC-Al
SCSI
SAS
PATA

### 主引导记录（Main Boot Record）MBR
1. MBR位于硬盘的0磁道0柱面1扇区
    * 装在操作系统的硬盘引导程序
    * 硬盘分区表
        * （Disk Partition Table）DPT
2. MBR是由分区程序（如fdisk）所产生的
    * 如鬼影病毒

### MBR的分区类型
1. 主分区Primary partitions
    * 活动分区
    * 系统分区
    * 系统需要装在主分区里 
2. 扩展分区Extended partitions
    * 拓展分区类似于主分区，但是他可以继续分成一块一块，存的是固定的数据
3. 逻辑分区

### 两种硬盘存储方式
1. 基本硬盘存储
    * 
2. 动态硬盘存储
    * 允许在硬盘上执行各种逻辑上的操作
    * 【图片】
    
### 磁盘分区工具
1. fdisk
    * 进入fdisk交互操作
    > brw-rw----. 1 root disk 8, 0 Apr 22 10:03 sda

2. sfdisk
3. partprobe

### 磁盘分区实验步骤
1. 为linux添加一块硬盘
2. 为添加的磁盘进行分区
3. 'fdisk -l /dev/ad*' #查看新添加的硬盘
4. fdisk /dev/sdb # 进如分区的交互模式

    - p查看分区状态
    - n新建一个分区
    - p(primary)选择创建主分区，或者用e(extended)创建拓展分区
    - 选择分区起始位置或者大小
            +2G #选择添加2G大小的分区
9. p再次查看分区状态
10. t改变分区类型
    - L 可选步骤，查看有哪些磁盘类型可选
    - 82将磁盘改为linux类型
    - w 保存分区类型后退出
14. 格式化分区
    - mkfs.[tab][tab] # 查看更多可选分区类型 
        ```
        > mkfs.xfs /dev/sdb1
        ```
16. 挂载分区
        ```
        mount /dev/sdb1 /mnt/learn/ #将分区挂载到挂载点
    
    
        ```
  