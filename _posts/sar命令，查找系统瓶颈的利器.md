---
title: sar命令学习使用，定义系统瓶颈的利器
date: 2018-07-19 17:09:44
tags: 服务器硬件
---
# 写在前面的话
sar是System Activity Reporter（系统活动情况报告）的缩写。sar工具将对系统当前的状态进行取样，然后通过计算数据和比例来表达系统的当前运行状态。它的特点是可以连续对系统取样，获得大量的取样数据；取样数据和分析的结果都可以存入文件，所需的负载很小。sar是目前Linux上最为全面的系统性能分析工具之一，可以从14个大方面对系统的活动进行报告，包括文件的读写情况、系统调用的使用情况、串口、CPU效率、内存使用状况、进程活动及IPC有关的活动等，使用也是较为复杂。实际生产环境中，我们经常会用到sar命令去定位系统的瓶颈，对相关的业务的cpu mem disk等做调整，它可以看到我们服务器的瓶颈所在。
# 查看CPU使用率
## sar -u : 默认情况下显示的cpu使用率等信息就是sar -u
### 命令：sar -u 1 5
![sar-cpu.png](sar命令，查找系统瓶颈的利器/sar-cpu.png)
- %user 用户模式下消耗的CPU时间的比例；
- %nice 通过nice改变了进程调度优先级的进程，在用户模式下消耗的CPU时间的比例
- %system 系统模式下消耗的CPU时间的比例；
- %iowait CPU等待磁盘I/O导致空闲状态消耗的时间比例；
- %steal 利用Xen等操作系统虚拟化技术，等待其它虚拟CPU计算占用的时间比例；
- %idle CPU空闲时间比例；

## sar -q: 查看平均负载
### 命令：sar -q 1 10
![sar-load.png](sar命令，查找系统瓶颈的利器/sar-load.png)
- runq-sz：运行队列的长度（等待运行的进程数）
- plist-sz：进程列表中进程（processes）和线程（threads）的数量
- ldavg-1：最后1分钟的系统平均负载 
- ldavg-5：过去5分钟的系统平均负载
- ldavg-15：过去15分钟的系统平均负载

## sar -r：查看物理内存使用状况
### 命令：sar -r 1 3
![sar-mem.png](sar命令，查找系统瓶颈的利器/sar-mem.png)
- kbmemfree：这个值和free命令中的free值基本一致,所以它不包括buffer和cache的空间.
- kbmemused：这个值和free命令中的used值基本一致,所以它包括buffer和cache的空间.
- %memused：物理内存使用率，这个值是kbmemused和内存总量(不包括swap)的一个百分比.
- kbbuffers和kbcached：这两个值就是free命令中的buffer和cache.
- kbcommit：保证当前系统所需要的内存,即为了确保不溢出而需要的内存(RAM+swap).
- %commit：这个值是kbcommit与内存总量(包括swap)的一个百分比.
