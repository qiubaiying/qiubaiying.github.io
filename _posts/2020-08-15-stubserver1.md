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
Martine Fowler写过一篇关于mock和stub去别的文章，感兴趣的可以看一下：[Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)。总结以下几个主要的不同如下：
1. Mock 侧重于行为验证(behavior verification)
    行为验证更多的是根据测试对象的被测试业务逻辑，设计被模拟对象的反馈行为，从而达到验证业务逻辑的结果。例如一个邮件服务，如果使用Mock方式模拟它，那么当验证使用这个邮件服务的业务逻辑时候，例如当发送附件大于限制时候，Mock对象会返回错误，而使用方要如何处理这种响应？当邮件标题为空时，邮件服务会返回错误提示，调用方业务逻辑是否能够处理这个情况？
2. Stub 侧重于状态验证(state verification)  
    状态验证侧重让被模拟的对象配合测试单元，返回主要支持的所有状态，例如一个邮件服务，如果他的状态只是成功，失败，那么Stub支持在接到某几类请求可以分别返回这两个状态的即可。

## mountebank介绍  
[mountebank](http://www.mbtest.org/)是ThoughtWorks 工程师Brandon Byars为了解决微服务测试中反复创建打桩服务而开发的一个基于Node.js开发的一个大壮服务平台。基于这个平台，测试工程师可以很方便的对待测试应用配置打桩服务，解耦服务间依赖，定制服务行为，设定相应条件等工作。它本身还是开源的，可以在github上找到源代码。  
![overview](/img/data/mountebank.gif)  
有人可能说，如果只是作为一个模拟响应的工具，Fiddler也有类似的功能，但是fiddler更多的是一个stand alone的tool，作为单机开发工具来说还不错，通过一些简单的条件对应一些自动响应的action来实现最简单的打桩。  
![autoresponder](/img/data/fiddler.jpg)  
如果要应付一定压力的请求，支持横向扩展的场景，打桩服务就有了用武之地。针对mountebank几个主要优势总结如下：  
1. 条件响应  
    支持设置响应条件，针对请求参数的不同设定对应的响应，例如http header或者query parameters的不同。这个功能方便设定对不同场景的支持，让验证适应更多情况。
2. 代理响应  
    控制Stub的后端请求是否真的调用所模拟的真实服务。他的Mode分为三类：
    - proxyOnce：只有第一次请求调用真实服务，之后所有请求讲返回第一次调用的结果。
    - proxyAlways：每次都调用真实服务，并记录到mountebank数据库，之后可以设置重放来模拟复杂请求。
    - proxyTransparent：每次都调用真是服务，并且不记录到mountebank数据库。
3. 响应行为设定  
    可以设定响应的行为，mountebank根据测试场景支持如下集中行为：
    > wait: 网络延迟，设定延迟响应的毫秒数。  
    > repeat：重复当前响应。  
    > copy：从request中提取字段填写到响应中。  
    > lookup: 和copy类似，从request中选定key那会对应的值。  
    > decorate：在响应回复之前，使用注入Javascript的方法修改响应内容。  
    > shellTransfor：和decorate方法类似，不同的是他不需要写javascript，而是通过参数化发送到另外一个程序进行处理，返回处理后的响应内容。  
    
4. 脚本注入  
    注入功能是允许使用JavaScript脚本加强build-in功能以外的能力。有如下两类场景能够使用该脚本注入功能：
    - 条件谓词：  
        编写一个JavaScript函数用于处理Request object对象并返回Boolean值供条件判断使用。  
        
    - 响应注入：  
        对response内容通过脚本进行修改之后响应。该方法一般会配合代理响应一起使用，代理返回的内容，用脚本进行格式化后返回给使用Stub的应用使用。

    Note：默认mountebank处于安全考虑关闭脚本注入功能，你可以使用命令行打开：mb --allowInjection  

5. 多通讯协议  
    mountebank默认支持4中协议：http,https,tcp,smtp。同时通过社区插件还支持Idap,grpc,当然你也可以创建你自己特定协议。  
    
6. 多客户端类库支持  
    除了支持REST API形式，mountebank支持多种原生编程语言类库，当然他们也都是个人开发者贡献的。目前支持的语言有以下13种：C#,Clojure,Delphi,F#	,Go,Java,JavaScript,Perl,PHP,Python,Ruby,Shell,TypeScript. 感兴趣的小伙伴可以查看下面的链接 [client libraries](http://www.mbtest.org/docs/clientLibraries)。  
    
## 参考引用  
- [Home page of mountebank](http://www.mbtest.org/)