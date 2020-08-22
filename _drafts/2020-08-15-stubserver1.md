---
layout:     post
title:      什么是打桩服务
subtitle:   mountebank系列(1)
date:       2020-08-15
author:     Bruce Wong
header-img: img/joshua-hibbert-eqpZgUYGLJE-unsplash.jpg  
catalog: true
tags:
    - 敏捷
    - Agile
    - 技术
---
## 前言  
经常听到Team抱怨一些第三方服务在集成的时候因为各种原因不工作而导致整个开发工作被迫延迟甚至停止。也会听到编写接口测试的员工抱怨所测试的功能必须要关联真正的服务(SharePoint, Microsoft 365等)，速度慢，效率低，环境搭建慢。这里的第三方不只是第三方服务，同产品/项目的不同服务之间也会有类似的情况。这种测试一般针对服务测试中的接口测试，但是往往用起来的时候就变成了和UI测试一样的端到端测试。沉重而且低效。
在TDD领域针对code级别的解耦测试有mock这一概念，那么在接口测试这个层面是否也有类似的工具呢？答案是肯定的：有。那就是打桩服务。近年来随着微服务的普及，接口测试、集成测试更多要考虑服务之间的解耦，从而达到测试的聚焦——只关注测试服务的业务部份。
## 什么是打桩服务  
打桩服务呢？顾名思义用一种非侵入性的方式，让被测试服务或接口中调用的第三方服务被模拟，这样当测试到使用第三方服务的时候能够快速反馈指定内容，而无需真正调用到第三方服务。这个模拟器就是打桩服务。
## 他和mock服务的区别  
一些熟悉TDD的工程师看到这里肯定觉得这就是Mock嘛！是的，他和TDD中的mock的主要区别在于mock是code级别的，而打桩服务属于应用层面的，level更高一些，力度更大一些。 


## mountebank介绍  
[mountebank](http://www.mbtest.org/)是ThoughtWorks 工程师Brandon Byars为了解决微服务测试中反复创建打桩服务而开发的一个基于Node.js开发的一个大壮服务平台。基于这个平台，测试工程师可以很方便的对待测试应用配置打桩服务，解耦服务间依赖，定制服务行为，设定相应条件等工作。它本身还是开源的，可以在github上找到源代码。  
![overview](/img/data/mountebank.gif)  
有人可能说，如果只是作为一个模拟响应的工具，Fiddler也有类似的功能，但是fiddler更多的是一个stand alone的tool，作为单机开发工具来说还不错，通过一些简单的条件对应一些自动响应的action来实现最简单的打桩。  
![autoresponder](/img/data/fiddler.jpg)  
如果要应付一定压力的请求，支持横向扩展的场景，打桩服务就有了用武之地。针对mountebank总结如下：  
1. 



## 参考引用  
- [Home page of mountebank](http://www.mbtest.org/)