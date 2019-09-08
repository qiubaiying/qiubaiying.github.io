---
layout:     post 
title:      Shiro基础
subtitle:   Shiro简介
date:       2019-09-03
author:     张鹏
header-img: img/post-bg-js-version.jpg
catalog: true   
tags:                         
    - Shiro
---

# Shiro

- Shiro是一个安全（权限）框架
- Shiro可以完成：认证、授权、加密、会话管理、与Web集成、缓存等
- shiro是一个有许多特性的全面的安全框架，下面这幅图可以了解shiro的特性

![shiro特性](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/shiro-1.png)

#### shiro架构

- 从大的角度来看，shiro主要有三个概念：subject、SecirityManager、Realms，下面这幅图可以看到这些原件之间的交互、

![shiro架构](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/shiro-2.png)

- subject：翻译为主角，当前参与应用安全部份的主角。可以是用户，可以是第三方服务，可以是cron任务，或者任何东西。主要指一个正在与当前软件交互的东西。所有subject都需要SecurityManager，当你与subject进行交互，这些交互行为实际上被转换为与SecurityManager的交互
- SecurityManager：安全管理员，Shiro架构的核心，他就像Shiro内部所有原件的保护伞。然而一旦配置了SecurityManager，SecurityManager就用到的比较少，大部分时间都花在Subject上面。
- Realms：Realms作为Shrio和你的应用程序的连接桥，当需要与安全数据交互的时候，像用户账户，或者访问控制，shiro就从一个或者多个Realms中查找。shiro提供了一些可以直接使用的Realms，如果默认的Realms不能满足你的要求，你也可以定制自己的Realms。

![shiro架构](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/shiro-3.png)

#### 搭建Shiro环境（与Spring集成）

1.加入Spring和Shiro的jar包
2.配置Spring和SpringMVC