---
layout:     post                    # 使用的布局（不需要改）
title:      如何快速了解Spring系列?          # 标题 
subtitle:   Spring，springMVC,SpringBoot  #副标题
date:       2018-12-2              # 时间
author:     MasterJen                # 作者
header-img: img/mdsource/post-bg-a-25.jpg   #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - Spring
---

## Hey  Spring And SpringMVC And SpringBoot

>What makes life dreary is the want of motive.--没有了目的,生活便郁闷无光.

最近闲来无事,逛逛论坛,发现许多帖子都是关于框架的问题,因此专门写了这么一篇博客,用来介绍Spring框架 以及SpringMVC和SpringBoot微服务,希望可以帮助到大家.

一 Spring  

1 Spring 简单介绍
      
    Spring是一个开源框架,Spring是于2003 年兴起的一个轻量级的Java 开发框架,由Rod Johnson 在其著作Expert One-On-One J2EE Development and Design中阐述的部分理念和原型衍生而来.
    
    它是为了解决企业应用开发的复杂性而创建的.框架的主要优势之一就是其分层架构,分层架构允许使用者选择使用哪一个组件,同时为 J2EE 应用程序开发提供集成的框架.
    
    Spring使用基本的JavaBean来完成以前只可能由EJB完成的事情.然而,Spring的用途不仅限于服务器端的开发.
    
    从简单性、可测试性和松耦合的角度而言,任何Java应用都可以从Spring中受益.Spring的核心是控制反转（IoC）和面向切面（AOP）.
    
    简单来说,Spring是一个分层的JavaSE/EE full-stack(一站式) 轻量级开源框架.
       
2 Spring 优点

      * 方便解耦,简化开发 （高内聚低耦合） 
       
            Spring就是一个大工厂（容器）,可以将所有对象创建和依赖关系维护,交给Spring管理 
       
            spring工厂是用于生成bean
       
      * AOP编程的支持 
       
            Spring提供面向切面编程,可以方便的实现对程序进行权限拦截、运行监控等功能
       
      * 声明式事务的支持 
       
            只需要通过配置就可以完成对事务的管理,而无需手动编程
       
      * 方便程序的测试 
       
            Spring对Junit4支持,可以通过注解方便的测试Spring程序
       
      * 方便集成各种优秀框架 
       
            Spring不排斥各种优秀的开源框架,其内部提供了对各种优秀框架（如:Struts、Hibernate、MyBatis、Quartz等）的直接支持
       
      * 降低JavaEE API的使用难度 
       
             Spring 对JavaEE开发中非常难用的一些API（JDBC、JavaMail、远程调用等）,都提供了封装,使这些API应用难度大大降低

3 Spring 体系结构

![Spring结构图](https://raw.githubusercontent.com/CorsairMaster/img-store/master/boke/spring.png)
    
* Spring 中的每个模块都可以单独存在


    * 核心容器:核心容器提供 Spring 框架的基本功能.核心容器的主要组件是 BeanFactory,它是工厂模式的实现.BeanFactory 使用控制反转 （IOC） 模式将应用程序的配置和依赖性规范与实际的应用程序代码分开.

    * Spring 上下文:Spring 上下文是一个配置文件,向 Spring 框架提供上下文信息.Spring 上下文包括企业服务,例如 JNDI、EJB、电子邮件、国际化、校验和调度功能.
    
    * Spring AOP:通过配置管理特性,Spring AOP 模块直接将面向方面的编程功能集成到了 Spring 框架中.所以,可以很容易地使 Spring 框架管理的任何对象支持 AOP.Spring AOP 模块为基于 Spring 的应用程序中的对象提供了事务管理服务.通过使用 Spring AOP,不用依赖 EJB 组件,就可以将声明性事务管理集成到应用程序中.
    
    * Spring DAO:JDBC DAO 抽象层提供了有意义的异常层次结构,可用该结构来管理异常处理和不同数据库供应商抛出的错误消息.异常层次结构简化了错误处理,并且极大地降低了需要编写的异常代码数量（例如打开和关闭连接）.Spring DAO 的面向 JDBC 的异常遵从通用的 DAO 异常层次结构.
    
    * Spring ORM:Spring 框架插入了若干个 ORM 框架,从而提供了 ORM 的对象关系工具,其中包括 JDO、Hibernate 和 iBatis SQL Map.所有这些都遵从 Spring 的通用事务和 DAO 异常层次结构.
    
    * Spring Web 模块:Web 上下文模块建立在应用程序上下文模块之上,为基于 Web 的应用程序提供了上下文.所以,Spring 框架支持与 Jakarta Struts 的集成.Web 模块还简化了处理多部分请求以及将请求参数绑定到域对象的工作.
    
    * Spring MVC 框架:MVC 框架是一个全功能的构建 Web 应用程序的 MVC 实现.通过策略接口,MVC 框架变成为高度可配置的,MVC 容纳了大量视图技术,其中包括 JSP、Velocity、Tiles、iText 和 POI.3
5 Spring 中的Aop 切面编程 实现原理

    aop底层将采用代理机制进行实现.

    接口 + 实现类 :spring采用 jdk 的动态代理Proxy.

    实现类:spring 采用 cglib字节码增强. 
    
6 Spring Aop 基本术语

    1.target:目标类,需要被代理的类.例如:UserService 
    
    2.Joinpoint(连接点):所谓连接点是指那些可能被拦截到的方法.例如:所有的方法 
    
    3.PointCut 切入点:已经被增强的连接点.例如:addUser() 
    
    4.advice 通知/增强,增强代码.例如:after、before 
    
    5. Weaving(织入):是指把增强advice应用到目标对象target来创建新的代理对象proxy的过程. 
    
    6.proxy 代理类 
    
    7. Aspect(切面): 是切入点pointcut和通知advice的结合 
       
        一个线是一个特殊的面. 
       
        一个切入点和一个通知,组成成一个特殊的面. 
        
7 Spring 中的 IOC  容器

       Spring 设计的核心是 org.springframework.beans 包,它的设计目标是与 JavaBean 组件一起使用.
       
       这个包通常不是由用户直接使用,而是由服务器将其用作其他多数功能的底层中介.
       
       下一个最高级抽象是 BeanFactory 接口,它是工厂设计模式的实现,允许通过名称创建和检索对象.BeanFactory 也可以管理对象之间的关系.              
   
8 BeanFactory 支持两个对象模型.
   
    * 单态 模型提供了具有特定名称的对象的共享实例,可以在查询时对其进行检索.Singleton 是默认的也是最常用的对象模型.对于无状态服务对象很理想.
   
    * 原型 模型确保每次检索都会创建单独的对象.在每个用户都需要自己的对象时,原型模型最适合.
   
Spring就这样简单的介绍完成了.

二 Spring MVC 是什么东东呢?

         SpringMVC是一种基于Java,实现了Web MVC设计模式,请求驱动类型的轻量级Web框架,即使用了MVC架构模式的思想,将Web层进行职责解耦.基于请求驱动指的就是使用请求-响应模型,框架的目的就是帮助我们简化开发,SpringMVC也是要简化我们日常Web开发.
         
1 SpringMVC架构 

![SpringMVC](https://raw.githubusercontent.com/CorsairMaster/img-store/master/boke/SpringMVC.png)    

2 Spring MVC具体的操作流程 如下:
    
        （1）首先用户发送请求——>DispatcherServlet,前端控制器收到请求后自己不进行处理,而是委托给其他的解析器进行处理,作为统一访问点,进行全局的流程控制；
        
        （2）DispatcherServlet——>HandlerMapping,映射处理器将会把请求映射为HandlerExecutionChain对象（包含一个Handler处理器（页面控制器）对象、多个HandlerInterceptor拦截器）对象；
        
        （3）DispatcherServlet——>HandlerAdapter,处理器适配器将会把处理器包装为适配器,从而支持多种类型的处理器,即适配器设计模式的应用,从而很容易支持很多类型的处理器；
        
        （4）HandlerAdapter——>调用处理器相应功能处理方法,并返回一个ModelAndView对象（包含模型数据、逻辑视图名）；
        
        （5）ModelAndView对象（Model部分是业务对象返回的模型数据,View部分为逻辑视图名）——> ViewResolver, 视图解析器将把逻辑视图名解析为具体的View；
        
        （6）View——>渲染,View会根据传进来的Model模型数据进行渲染,此处的Model实际是一个Map数据结构；
        
        （7）返回控制权给DispatcherServlet,由DispatcherServlet返回响应给用户,到此一个流程结束.
      
3 那么 HandlerMapping 映射处理器是怎么实现功能的呢?
 
    HandlerMapping 将会把请求映射为 HandlerExecutionChain 对象（包含一个 Handler 处理器（页面控制器）对象、多个 HandlerInterceptor 拦截器）对象,通过这种策略模式,很容易添加新的映射策略.
    
    映射处理器有三种,三种可以共存,相互不影响,分别是BeanNameUrlHandlerMapping、SimpleUrlHandlerMapping和ControllerClassNameHandlerMapping；
    
4 HandlerMapping 架构图如下:

![HandlerMapping](https://raw.githubusercontent.com/CorsairMaster/img-store/master/boke/Handlermapping.png) 
    
5 处理器适配器 HandlerAdapter
   
    处理器适配器有两种,可以共存,分别是SimpleControllerHandlerAdapter和HttpRequestHandlerAdapter.
    
    SimpleControllerHandlerAdapter 
    
        SimpleControllerHandlerAdapter是默认的适配器,表示所有实现了org.springframework.web.servlet.mvc.Controller 接口的Bean 可以作为SpringMVC 中的处理器.
    
    HttpRequestHandlerAdapter 
    
        HTTP请求处理器适配器将http请求封装成HttpServletResquest 和HttpServletResponse对象,和servlet接口类似.
        
经历过处理器之后就会返回一个ModelAndView 对象了 .这样就完成了一次请求.      

三 Spring Boot  又是什么呢?

    Spring Boot是由Pivotal团队提供的全新框架,其设计目的是用来简化新Spring应用的初始搭建以及开发过程.该框架使用了特定的方式来进行配置,从而使开发人员不再需要定义样板化的配置.用我的话来理解,就是spring boot其实不是什么新的框架,它默认配置了很多框架的使用方式,就像maven整合了所有的jar包,spring boot整合了所有的框架（不知道这样比喻是否合适）.
    
1 那么 使用 Spring Boot 有什么好处呢?
  
         1.去除了大量的xml配置文件
    
       2.简化复杂的依赖管理
    
       3.配合各种starter使用,基本上可以做到自动化配置
    
       4.快速启动容器
    
       5. 配合Maven或Gradle等构件工具打成Jar包后,Java -jar 进行部署运行还是蛮简单的
    
       6、创建独立Spring应用程序,嵌入式Tomcat,Jetty容器,无需部署WAR包,简化Maven及Gradle配置,尽可能的自动化配置Spring,直接植入产品环境下的实用功能,比如度量指标、健康检查及扩展配置等,无需代码生成及XML配置.
      
至于详细的 SpringBoot微服务介绍 ,可以欣赏此[博客](https://blog.csdn.net/fly_zhyu/article/details/76407830),这位博主对Springboot 微服务 进行了详细的介绍,自我感觉还是总结的很棒的,相信对大家会有帮助的.

四 了解完这些,相信大家对 上面的三个东东也已经有了 详细的认知了,那么接下来,我就对其进行一个总结吧

    1 spring boot就是一个大框架里面包含了许许多多的东西,其中spring就是最核心的内容之一,当然就包含spring mvc.
      
      spring mvc 是只是spring 处理web层请求的一个模块.
      
    2 Spring 是一个“引擎” 
     
      Spring MVC 是基于 Spring 的一个 MVC 框架 
     
      Spring Boot 是基于 Spring4 的条件注册的一套快速开发整合包    
      
或者说 

    1. Spring 框架就像一个家族,有众多衍生产品例如 boot、security、jpa等等.但他们的基础都是Spring的ioc、aop等. ioc 提供了依赖注入的容器, aop解决了面向横切面编程,然后在此两者的基础上实现了其他延伸产品的高级功能；
    
    2. springMvc是基于Servlet 的一个MVC框架主要解决WEB开发的问题,因为Spring的配置非常复杂,各种XML、JavaConfig、servlet处理起来比较繁琐；
    
    3. 为了简化开发者的使用,从而创造性地推出了springBoot框架,默认优于配置,简化了springMvc的配置流程；
    
    但区别于springMvc的是,springBoot专注于微服务方面的接口开发,和前端解耦,虽然springBoot也可以做成springMvc前后台一起开发,但是这就有点不符合springBoot框架的初衷了；
    
以上就是三者的区别,如果大家还有什么疑问的话,可以留言哦.              