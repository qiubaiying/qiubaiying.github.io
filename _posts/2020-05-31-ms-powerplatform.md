---
layout:     post
title:      Microsoft Power Platform 介绍
subtitle:   
date:       2020-05-31
author:     Bruce Wong
header-img: img/power_brandon-morgan-unsplash.jpg
catalog: true
tags:
    - Microsoft
---

## 前言  
微软从去年开始大力推Power Platform系列产品系列，尤其今年的COVID-19疫情，在家办公让很多传统工作方式必须做出改变。Power Platform作为适应这一转变的工具被推到了前面。能称之为Platform那么肯定有两下子，基于我最近的了解做一个入门级别的介绍，希望对你了解它有所帮助。  

## 正文  
Power Platform顾名思义是一个平台，这个平台包括几个具体的服务用于给企业客户提供强有力的(Power)的支持，使其能够产生足够高的生产力，助力企业业务活动。下图描述了这个平台的组成：  
![power platform](../../../../img/microsoft/platform1.png)  
企业用户的核心价值是数据和业务流程。Power Platform重点关注的就是这两个领域，用No/Low code方式结合微软已有的云计算服务能力，提供企业业务人员高效自定义工具的能力来提高其自身生产力。我猜微软的想法是：业务人员是最懂自己业务的人，如果他们能够设计符合自己业务的软件，肯定是最高效的，这中间减少了业务和开发之间传递的消耗，甚至都无需在雇佣第三方开发团队为企业做定制开发。企业的每个人都是开发人员。(很好的想法，不过有点太恨了，不给第三方ISV一点机会的感觉)。从图中可以看到Power系列一共有四个产品：Power Apps，Power Automate，PowerBI，Power virtual Agents。其他分别为数据服务，connectors相关产品。

### Power Apps
![power apps](../../../../img/microsoft/powerapps.png)  
给用户提供无需编码就能自行定制的GUI服务，设计的App包括Web page，Mobile，Tablet三中设备尺寸。可以基于实际设备情况自动适配。用户只需要关注对应控件的布局，由于数据是从Common data service或者微软默认data connectors返回，数据类型和控件自动匹配，几乎不需要额外设置。这让用户只关心App的业务功能和交互就可以。其实所谓的横跨多个设备适配后台依然是web技术，只不过微软在App Store中发布了一个叫做Power Apps
的应用，他作为Host App可以控制从Power Apps获取回来的布局是匹配当前设备的。如下图：
![mobile power app](../../../../img/microsoft/powerapp.jpg)  
当你进入这个App内部，你将能看到你所登陆的Tenant下你可以使用的所有Power Apps列表如下：  
![mobile app list](../../../../img/microsoft/powerapplist.jpg)  
当点击某一个App进入后你可以进行创建，修改，删除等操作，同时后台会触发对应的关联的Power Automate(下一节将介绍Power Automate)。如下图：
![one power app](../../../../img/microsoft/onepowerapp.png)

### Power Automate
![power automate](../../../../img/microsoft/powerautomate.png)  
上面提到企业的核心价值除了数据就是他的业务流程，Power Automate 前身就是Azure Flow，Flow主要是指定一些流程，提供可视化工具设计，他是基于[Azure Logic Apps service](https://azure.microsoft.com/en-us/services/logic-apps/)提供的一款No Code 服务。如果需要定制复杂的工作流逻辑，需要写code，那么就需要使用Logic Apps来做了。Web端可视化定制流程如下：  
![work flow designer](../../../../img/microsoft/create-complete.png)  
Power Automate(Flow)提供了众多的模板，几乎覆盖了工作中的大多数场景：
1. 几分钟后推送提醒给我做什么事情。
2. 直属领导发送Email给我时我的手机端要收到推送提醒，这样我可以第一时间进行响应。
3. 当带有附件的Email发送到我的邮箱后，自动复制其中的附件到我的onedrive进行备份。
4. 当有用户发送指定#Hashtag#到Twitter/Facebook后搜集内容转发到指定Teams进行后续处理。

### Power BI  
一个功能强大的数据分析服务，PowerBI提供在线服务和免费的desktop版本，丰富的图表工具和强大的数据查询引擎数据使得数据分析工作者可以根据需要设置数据关系并从中得到洞察。这里就不对Power BI进行详细介绍，他的内容可以写出一个系列，以后有机会单独写一波。推荐一个同事写的入门级别书，感兴趣的可以看一下。
[Power BI 数据分析从零开始](https://item.jd.com/12642549.html)

### Power Virtual Agents  
名字直译强大的虚拟代理，哈哈。实际来看呢确实不简单，结合微软AI技术的智能机器人，可以作为入门级别的企业在线客服等服务，No code定制逻辑，支持语音和文字语义识别。智能机器人可以提供7*24小时服务，成本低廉，对于希望快速上线一款人工智能客服的企业来说是非常不错的选择了。
![power virtual agents](../../../../img/microsoft/powervirtualagents.jpg)  

### Data Service &  Connectors  
上面介绍Power系列，他们都是消耗数据的，而这些数据是从那里提供的呢，企业数据众多，存储方式、类型也不尽相同，如果不能提供一个统一的数据结构那Power系列也是没有用武之地的，No code几乎不可能。微软很清楚的看到了这一点，所以他默认提供了几十种connectors，例如：Office 365，Dynamic 365, Facebook,Twitter,Salesfors,Box,Dropbox等。方便你直接将对应的数据提取到Power Platform平台进行消费。当然支持自定义connector来提供定制化。
另一方面业务数据集中处理微软提供了一个轻量级解决办法——Common data service，允许你将不同结构的数据汇聚到这一个数据服务中，重新制定业务关系和数据实体定义(有没有点biztalk的意思？)。
![CDS](../../../../img/microsoft/platform.png)

## 感到似曾相识吗——InfoPath？

看到上面的Power系列，你有没有和我一样想到了多年前微软推出的另一个企业级No Code/Low Code工具——InfoPath？哈哈。没错，都是几乎不需要写code，让企业员工自己就可以设计，内建很多out of box的控件。可以和SharePoint workflow结合用于企业数据搜集和处理工作。
> InfoPath是微软Office 2003家族中引入的成员，最终的正式版本为InfoPath2013，该版本支持在线填写表单。InfoPath是企业级搜集信息和制作表单的工具，将很多的界面控件集成在该工具中，为企业开发表单搜集系统提供了极大的方便。InfoPath文件的后缀名是.xml，可见InfoPath是基于XML技术的。作为一个数据存储中间层技术，InfoPath提供大量常用控件，如：Date Picker、文本框、可选节、重复节等，同时提供很多表格页面设计工具。开发人员可以为每个控件设置相应的数据有效性规则或数学公式。
2014年1月31日，微软office官方博客宣布，InfoPath2013为最后的桌面客户端版本，InfoPath桌面软件和服务器产品的Lifecycle支持都会到2023年4月。  

## 结束语

不得不承认，微软在产品洞见，生命周期把控，市场敏锐度方面确实很厉害。云优先，移动优先的战略贯彻的很彻底。Power Platform很巧妙的把Microsoft 356 服务，Dynamic 365，移动终端App，甚至On-Prmemise Service无缝的结合起来，打通了企业数据筒仓，交付了企业客户的端到端价值流动。我相信在不久的将来在这个平台上越来越多的知识工作者将可以用自己的智慧结合微软的技术创造出更多高生产力的工具。每个人都是开发人员，每个人都是创造者，每个人都可以让工作变得乐趣无穷。简单易用的Power Platform后面支撑的是强大但是配置复杂的Azure多个服务，微软巧妙地使用Power Platform作为中间层降低了使用Azure服务的门槛，让用户更加无感的使用和依赖Azure服务，不得不承认这是一个赚了吆喝又赚钱的高招。

## 参考链接

- [Microsoft Power Platform](https://powerplatform.microsoft.com/en-us/)
- [Lern Path Power Automate]](https://docs.microsoft.com/en-us/learn/modules/get-started-flows/)
- [Learn Path Power Apps](https://docs.microsoft.com/en-us/learn/modules/get-started-with-powerapps/)
- [Learn Path Common Data Service](https://docs.microsoft.com/en-us/learn/modules/get-started-with-powerapps-common-data-service/)
- [Power Virtual Agents](https://powervirtualagents.microsoft.com/en-us/)
- [InfoPath百度百科](https://baike.baidu.com/item/infopath)



