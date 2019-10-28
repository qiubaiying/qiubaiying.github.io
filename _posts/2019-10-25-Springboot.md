---
layout:     post 
title:      Springboot
subtitle:   Spring boot项目
date:       2019-10-28
author:     张鹏
header-img: img/home-bg.jpg
catalog: true   
tags:                         
    - Springboot
---

- ***利用SSM框架构建项目是毕业设计的主要方法，但是有一个很头疼的问题：各种配置文件和jar包的兼容问题。所以就出现了Maven，但是Maven还是需要你去配置各种SSM框架的配置文件，也是很麻烦。所以就出现了SpringBoot。我学习SpringBoot的原因主要是原本想要利用SSM框架+Shiro完成一个购物网站项目，但是在项目的构建过程中，Shiro和SSM的jar包之间总存在各种不兼容或者是框架的问题，所以就转向了SpringBoot，而且这样以后也方便进行Redis和Nginx的整合。***

#### 本篇博客较长，所以在头部先声明一下会讲到的内容
1. Springboot项目的搭建
2. Springboot的文件结构
3. Springboot和Mybatis的整合
4. Springboot、Mybatis、Shiro的整合
5. 一些遇到的错误信息总结

#### 1.搭建一个简单的Springboot项目

- 1.需要的工具
   - Idea 2018.3
   - JDK 8
   - Maven 3.6.0
- 2.搭建步骤：
   - 1.打开Idea，选择create a new project
   - 2.左侧边栏选择Spring Initializr，右侧边栏保持默认，点击next
   - 3.自定义Group、Artifact、Package（当你输入group和artifact之后，package栏会自动出现两者的组合，但是我更倾向于把package定义成com.sc），完成后点击next
   - ![new project](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20133355.png)
   - 4.因为不涉及到整合Mybaits，所以先创建一个web项目即可。弹出的窗口选择如下图所示，之后一路next、finish即可
   - ![img1](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20133847.png)
   - ![img2](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20133909.png)
   - 5.完成后项目目录如图所示
   - ![final](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20134313.png)
   - 6.在resources目录下的static文件夹下创建一个index.html，并输入一段随意的内容，用来验证springboot是否启动成功
   - 7.运行BlogApplication.java。成功后打开浏览器，地址栏输入http://localhost:8080/index.html。若成功显示html网页，则说明Springboot框架搭建成功
   - ![run](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20134555.png)
   - ![result](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20135545.png)

#### 2.Springboot的文件结构

![projectstructer](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20134313.png)

- 1.Java：存放Java源代码
- 2.resources：资源文件目录
- 3.static：静态资源文件
- 4.templates：视图模板文件
- 5.application.properties(后面会更改为application.yml)：核心配置文件
- 6.pom.xml：和maven相同，用来存放相关依赖

#### 3.Springboot和Mybatis的整合

- Springboot与Mybaits的整合不同于利用maven创建SSM框架，因为Springboot已经集成了Spring、不需要去配置一系列复杂的文件。
- **步骤**
   - 1.创建一个新项目，前几步是一样的，直到选择依赖的一步，需要做出一些改变，需要选择的依赖有如下图所示：
   - ![project](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20140926.png)
   - 2.创建成功之后，把application.properties更改为application.yml。在yml文件中配置Mybatis（直接用已经建好的项目来演示了，懒得新建项目了）
   - ![yml](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20141308.png)
   - 代码如下（application.yml）：

```xml
spring:
  datasource:
    url: jdbc:mysql:///market?useUnicode=true&characterEncoding=utf8&useSSL=false  //设置数据库地址
    driver-class-name: com.mysql.jdbc.Driver   //设置数据库驱动
    username: root   //数据库用户名
    password: root   //数据库密码

server:
  port: 8080   //项目监听端口


mybatis:
  mapper-locations: classpath:mapper/*.xml   //配置mybatis扫描xml文件的路径，在这里是resources目录下的mapper文件夹里面所有的xml文件
  type-aliases-package: com.sc.entity    //设置别名
```

- 配置完毕之后就完成了Springboot与Mybatis的整合
- 测试请自行完成。。。如果SSM框架都不会的话，看这个可能会压力山大

#### 4.Springboot、Mybaits、Shiro的整合

- 利用Shiro可以完成登陆以及拦截器功能，也可以实现更加复杂的动态权限加载，但是目前来说用不到，所以只进行拦截器和登录功能的讲解
- **步骤**
   - 1.

