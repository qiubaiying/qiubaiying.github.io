---
layout:     post
title:      HBASECON Asia 2019
subtitle:   Community Over Code！
date:       2019-07-22
author:     HH
header-img: img/post-bg-hbase.png
catalog: true
tags:
    - Big Data
    - HBase
---

>这次HBase Conference Asia 2019主要分为两个部分，一部分是Key Note,另一部分是HBase Internal
>
>下面我为大家主要介绍一下这次会议的亮点和未来的趋势。

# HBase的现状及发展趋势

HBase目前的稳定版本还是在1.4.x。2.x版本优化了很多的新特性，比如offheap的读，region状态合理化，procedure v2架构，减少对hdfs和zk的依赖，等等等等。

#### 发展方向

HBase项目目前由小米公司主导了2.x版本，没错就是小米。HBCK2这个非常重要的运维工具由Cloudera开发。所以对于HBase这个产品在出现一些故障时是通过procedure v2架构自恢复还是使用HBCK2由人工界定来恢复一直处于拉锯状态。目前来看是小米占了上风（刚诞生一个主席，更加有话语权）。

#### 云原生HBase

对于HBase云原生和最佳迁移方案，阿里云走在前面。相关的详细资料和产品走[传送门](https://cn.aliyun.com/product/hbase)可以了解。腾讯云提供云主机给客户来搭建和运维，与我们自建差异不大。

#### SQL的支持

HBase是KV存储，不支持SQL和创建二级索引。社区有Pheonix提供支持，性能不好。对此各场有了自己研发的建立索引和搜索引擎。快手的BitBase和华为的Lemon SQL都是通过BitMap来实现的，BitBase近期应该会开源，可以期待一下。

#### 硬件方法面的进展

来自Intel的工程师，主要集中在两个地方，一个是FPGA，一个是Persistent memory，一个侧重性能优化，一个侧重降低成本。

#### 最后

下面是HBase Conference Asia 2019我参与了的部分PPT原文，从拍的照片手打出来的，后续社区应该会放出原版，我会在这里贴下载链接。

HBase拥抱云原生，逐渐脱离HDFS和zk在当时的现场是有些担忧和怀疑的，通过后面的深入了解这或许就是趋势。最后引一下全场最让我感动的地方“Community Over Code”。一个健康的社区比好的代码更重要，代码不好可以重构，脱离社区一个产品也将走向尽头。

# Key Note

## The current status of HBase BY Duo Zhang

#### The stable pointer

- Currently still on 1.4.x
- AM-v2 is still not stable enough
- AM-v1 is not stable either

#### HBCK2

- Can fix basic region assignment problems
- A bit different from HBCK1
- Still not powerful enough compare to HBCK1
- Cluster status report

#### New projects

- HBase Connectors
  - Kafka Proxy
  - Spark
  - 1.0.0

- HBase Filesystem
  - HBOSS,HBase OSS(S3) Adaptor

- HBase Operator Tools
  - HBCK2

- HBase Native Client
  - HBase-14850

#### HBase 3.0.0

- Plan to cut branch-3 by the last quarter
- Need to have a 'stable' 2.X release line first
- 'New' features
  - Fold namespace table into meta table(HBASE-21154)
  - Synchronous replication(HBASE-19064)
  - Off-Heap read starting from DFSClient(HBASE-21879)
  - Proc-v2 based ACL(HBASE-21602)
  - Reimplement sync client on top of async client(HBASE-21512)

#### Delayed

- SQL Engine
  - Like CQL
  - Phoenix
  - Upstream of in-house solution

- Splitable meta
  - Scalability
  - Optimistic to have this in 4.0.0

- WAL abstraction
  - Remove the last unavoidable HDFS dependency
  - Cloud Native
  - HBASE-20952

#### Github PR is now available

- Still need a jira account to file an issue...
- The commit message for the PR should start with the issue number, for example"HBASE-12345 Test Github PR"
- All other things can be done on Github

#### The Apache Way

- Independency
  - Only PMC can control the direction of the project
  - Diversity

- Community Over Code
  - A healthy community is a higher priority than good code

## The advantages and technology trend of HBase on the cloud BY Chunhui Shen

#### Ali-HBase Core Scenarios

- Message,Orders,Feeds
- Monitor,Log,Tracking,IoT Data
- AI Storage
- Recommendation Search, BI Report

#### Use Scale

- 10000+ Nodes
- 100+ Clusters
- 300+ Million OPS
- 200+ PB Data
- 9000+ Users

#### Evolution of deployment

- Physical machine, One HBase per APP,Exclusive ZK&HDFS per HBase
- Multi-APP on Shared HBase,Use RSGroup for isolation,HBase on shared ZK&HDFS
- Exclusive zk&hdfs per hbase
- Relay on cloud infrastructure

#### Key points in deployment

- Stability
- Elasticity
- Cost
- Efficiency

#### When HBase runs on the cloud

- How to unleash the energy of Cloud
- The technology challenge and trend of HBase

#### Need elasticity

- Expansion for shopping day
- Burst traffic
- Anomaly isolatic (Hot Key)

#### Measurement of elasticity Before Cloud Native

$$
Time Of Capacity Expansion=Resource Preparation+Enviroment Preparation+Node Join In+Node In Service
$$

$$
Resource Preparation+Enviroment Preparation=Traditional Datacenter:Hours To Days
$$

$$
Node Join In+Node In Service=HBase:1To5 Hours
$$

#### Create instance on the cloud

- Virtualization Resource pool
- Quickly create an instance

![cloud native](http://lemonhh.com/img/2019-07-22/1.png)

#### Measurement of elasticity Aefore Cloud Native

$$
Time Of Capacity Expansion=Resource Preparation+Enviroment Preparation+Node Join In+Node In Service
$$

$$
Resource Preparation+Enviroment Preparation=Cloud Platform:1To5Hours
$$

$$
Node Join In+Node In Service=HBase:1To5 Hours
$$

#### The value of elasticity - Cost

$$
Waste Of Resource=Actual System Capacity-Actual Resource Requirement
$$

#### The value of elasticity-Stability

- Abnormal request to table t4
- Add new node RS4
- Move Table to the new group

#### Common situation when deploy on physical machines

| Cluster A   | Cluster B   | Cluster C   |
| ----------- | ----------- | ----------- |
| CPU 5%      | CPU 40%     | CPU 20%     |
| Storage 80% | Storage 30% | Storage 70% |

Different clusters (workload) have servers with the same hardware configuration.

#### After deploy on the cloud

- Flexible ratio between storage and computation
- Different clusters could have servers with the different hardware configuration
- Separation of storage and computation
- The same hardware configuration in one cluster, keep the maintenance be easy

#### HDFS heterogeneous storage

| Table A                                         | Table B                        |
| ----------------------------------------------- | ------------------------------ |
| One_SSD<br />1 Replica on SSD<br/>others on HDD | All_HDD<br/>All Replica on HDD |

#### Stability characters of Alibaba Cloud's ECS

- Not aware of machine replacement(99.95% Availability SLA)
- Not aware of datacenter migration(Never Retired)
- The very low proability of machine downtime

#### Other common problems

- Long compaction Queue
- Replication Delay Too Much
- Failover Too Slow

#### Multiple active masters at global scale with HBASE

> No problem that can't be solved by increasing capacity and rebooting.On the cloud,problem handling becomes easier.

HBase Replication + Globally Distributed Datacenters=Multiple active masters at global scale with HBASE

#### Sepatate Storage of Log and File

| Storage             | Write Performance | Read Performance |
| ------------------- | ----------------- | ---------------- |
| Cloud SSD Disk      | 1                 | 7                |
| Cloud HDD Disk      | 1                 | 3.5              |
| Object Storage(OSS) | 1                 | 1                |

#### Make use fo shared block storage

- Shared block storage supports concurrent access from multiple ECS instances
- SFS-A: Cloud Native Distribute File System Based On Cloud Shared bLOCK

#### Compaction On FPGA

# HBase Internal

## HBCK2: Concepts, trends and recipes for fixing issues within HBase 2 BY Cloudera

#### HBCK2 in a nutshell

- Simpler tool
  - less fix commands
  - No diagnosis command
  - Requires deeper HBase internal working from operators

- Shipped independently from hbase
  - packaged with hbase-operators project
  - Can evolve on its own pace
  - New versions can be run without needing whole hbase upgrade

- Master oriented(more later)

#### HBCK2 Usage trends

- Master not completing initialisation
  - Meta/Namespace table "Not Online" issues

- Table RIT issues
- Procedures stuck
- Table in wrong state
- Missing regions in META
  - User induced via imcompatible OfflineMetaRepair tool

#### HBCK2 For Operators: How do I get and run it?

http://github.com/apache/hbase-operator-tools

## Further GC optimization: Reading HFileBlock into offheap directly 

## BDS: A data synchronization platform for HBase 

## The Procedure v2 implementation of WAL splitting and acl 

## Distributed Bitmap Index Solution And Lightweight SQL Engine

