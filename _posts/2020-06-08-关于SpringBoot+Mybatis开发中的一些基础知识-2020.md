---
layout:     post                        # 使用的布局（不需要改）
title:      关于SpringBoot+Mybatis开发中的一些基础知识 # 标题
subtitle:   开发学习中的记录   # 副标题
date:       2020-06-08                  # 时间
author:     AhogeK                      # 作者
header-img:  https://i.ytimg.com/vi/ZP8Um12Z_mk/maxresdefault.jpg    # 这篇文章标题背景图片
catalog: true                           # 是否归档
tags:                                   # 标签
    - SpringBoot
    - Mybatis
---
#### 数据库中带'_'字段在实体类中用Mybatis接收数据的解决
只需在配置文件中添加
```yml
mybatis:
  configuration:
    map-underscore-to-camel-case: true
```

#### 让系统知道Mapper XML文件的位置
同样只需要配置就可以轻松完成
```yml
mybatis:
  mapper-locations: classpath:mappers/*.xml
```

#### 下日志文件配置中的含义
```yml
logging:
  pattern:
    console: "[%thread] %-5level %logger{36} - %msg%n"
```

* **[%thread]**
  * 输出日志的进程名字，这在Web应用以及异步任务处理中很有用
* **%-5level**
  * 日志级别，并且使用5个字符靠左对齐
* **%logger{36}**
  * 日志输出者的名字
* **%msg%n**
  * %msg:日志消息 | %n:平台的换行符

#### MyBatis Generator 使用注意
##### 添加MyBatis Generator Maven 插件
```xml
<plugin>
	<groupId>org.mybatis.generator</groupId>
	<artifactId>mybatis-generator-maven-plugin</artifactId>
	<version>1.4.0</version>
	<configuration>
		<overwrite>true</overwrite>
	</configuration>
</plugin>
```
*``orverwrite``用于每次执行如有相同就覆写*

##### MyBatis Generator Maven 执行方式
``mvn mybatis-generator:generate``

##### MyBatis Generator Configuration 配置注意
Linux 系统在配置路径要使用``/``

在配置JDBC中的URL里，不能直接使用特殊符号``&``，要将其替换成``&amp;``

``connectionURL="jdbc:mysql://127.0.0.1:3306/imooc_mall?characterEncoding=utf-8&amp;useSSL=false"``

---
【参考阅读】
1. [Spring Boot 日志配置(超详细)](https://blog.csdn.net/inke88/article/details/75007649)