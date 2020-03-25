---
title: PCIE SSD fio性能评测脚本
date: 2018-07-19 17:09:44
tags: 服务器硬件
---
# 写在前面的话
## 为什么要测PCIE？因为读写性能强啊，因为IOPS高啊，因为FusionIO黄了啊！只能测试新的PCIE卡了，测过intel 宝存 威固 FusionIO的 3D和2D的颗粒还不同，场景实在时序型数据库上使用的，scylladb。硬件的架构不同的，Intel的我目前测试的是P4500，颗粒3D，架构NVME的。FusionIO 宝存 威固这些的盘都是私有协议host_based都需要安装驱动，目前在scylladb遇到的问题是，无论什么架构nvme或者host_based只要是3D的颗粒，就有问题，2D颗粒相比于3D颗粒确实在IOPS上表现会差很多，但是很稳定，写入过程中不会报错。现在寄希望于Intel的P4800X了，因为这个卡对外称是在scylladb上已经落地使用了。当然这个测试脚本比起一些大厂来说，写的过于简陋了，大厂在测试PCIE或U.2的SSD或者普通的SATA盘的时候，测试的会更加详细，有时候测试过的PCIE都磨损的很严重无法使用了，这个脚本和测试的方式我会请教更多的硬盘厂商的朋友继续完善。
# 一些参数的解释
1.filename=/dev/sdb1    #测试文件名称，通常选择需要测试的盘的data目录
2.direct=1              #测试过程绕过机器自带的buffer。使测试结果更真实
3.rw=randwrite          #测试随机写的I/O
4.rw=randrw             #测试随机写和读的I/O
5.bs=16k                #单次io的块文件大小为16k
6.bsrange=512-2048      #同上，提定数据块的大小范围
7.size=5G               #本次的测试文件大小为5g，以每次4k的io进行测试
8.numjobs=30            #本次的测试线程为30个
9.runtime=1000          #测试时间1000秒，如果不写则一直将5g文件分4k每次写完为止
10.ioengine=psync       #io引擎使用psync方式
11.rwmixwrite=30        #在混合读写的模式下，写占30%
12.group_reporting      #关于显示结果的，汇总每个进程的信息
13.lockmem=1G           #只使用1g内存进行测试
14.zero_buffers         #用0初始化系统buffer
15.nrfiles=8            #每个进程生成文件的数量

# 我写的测试脚本，复制过去就能用，执行时间会跟进你的pcie卡的容量大小不同，时间上也会有所查别。最后会生成一堆log文件，有几个汇总的大家看一下就行了。

#!/bin/bash

# Script of precondition:4K IOPS 把PCIE进行多次写满操作，使PCIE的性能趋于稳定
fio --ioengine=libaio --direct=1 --thread --norandommap --filename=/dev/dfa --name=init_rand --output=init_rand.log --rw=randwrite --bs=4k --numjobs=4 --iodepth=64 --ramp_time=60 

# 4k Random Write 4K随机写
fio --ioengine=libaio --randrepeat=0 --norandommap --thread --direct=1 --group_reporting --name=randwrite --ramp_time=300 --runtime=3600 --time_based --numjobs=4 --iodepth=64 --filename=/dev/dfa --rw=randwrite --bs=4k --output=4K_randW.log --log_avg_msec=1000 --write_iops_log=4K_randW_iops.log --write_lat_log=4K_randW_lat.log

# 4k Random Read 4K随机读
fio --ioengine=libaio --randrepeat=0 --norandommap --thread --direct=1 --group_reporting --name=randread --ramp_time=300 --runtime=3600 --time_based --numjobs=4 --iodepth=64 --filename=/dev/dfa --rw=randread --bs=4k --output=4K_randR.log --log_avg_msec=1000 --write_iops_log=4K_randR_iops.log --write_lat_log=4K_randR_lat.log

# Script of precondition:Bandwidth 重新写入数据测试带宽
fio --ioengine=libaio --direct=1 --thread --norandommap --filename=/dev/dfa --name=init_seq --output=init_seq.log --rw=write --bs=128k --numjobs=1 --iodepth=128 --loops=2

# 128k Seq Write 顺序写128K
fio --ioengine=libaio --randrepeat=0 --norandommap --thread --direct=1 --group_reporting --name=seq_write --ramp_time=300 --runtime=3600 --time_based --numjobs=1 --iodepth=32 --filename=/dev/dfa --rw=write --bs=128k --output=128K_seqW.log --log_avg_msec=1000 --write_iops_log=128K_seqW_iops.log --write_lat_log=128K_seqW_lat.log

# 128k Seq Read 顺序读128K
fio --ioengine=libaio --randrepeat=0 --norandommap --thread --direct=1 --group_reporting --name=seq_read --ramp_time=300 --runtime=3600 --time_based --numjobs=1 --iodepth=128 --filename=/dev/dfa --rw=read --bs=128k --output=128K_seqR.log --log_avg_msec=1000 --write_iops_log=128K_seqR_iops.log --write_lat_log=128K_seqR_lat.log

# 这几个文件比较重要128K_seqR.log  128K_seqW.log  4K_randR.log  4K_randW.log 性能指标看这几个参数就行了
