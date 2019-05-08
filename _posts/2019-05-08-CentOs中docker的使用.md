---
layout: post
title: CentOS7中docker的各种实践
subtitle: 😝新电脑没有小表情了...😝
date: 2019-05-08
author: 华仔
header-img: img/post-bg-debug.png
catalog: true
tags:
    - Java
    - Docker
---

> 首先介绍一下版本信息:
>
> CentOS7.3
>
> docker18.09.5


### docker中安装mysql

1. 拉取MySql镜像
```shell
docker pull mysql
```

2. 拉取成功后确认一下
```shell
docker images
```

3. 创建并启动一个mysql容器
```shell
docker run --name huazai-mysql -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 -d mysql
```

- –name：给新创建的容器命名，此处命名为`huazai-mysql`
- -e：配置信息，此处配置mysql的root用户的登陆密码
- -p：端口映射，此处映射`主机3306端口`到容器`huazai-mysql`的3306端口
- -d：成功启动容器后输出容器的完整ID，例如上图 `...`
- 最后一个`mysql`指的是`mysql镜像名字`

4. 确认容器运行状态
```shell
docker ps
```

![docker安装mysql效果图](http://blog-ipic.yananhuazai.cn/FoeDoyxAo2MKvPqSu3LB67w_itkk)



### docker中安装zookeeper

1. 拉取zookeeper镜像
```shell
docker pull zookeeper
```

2. 拉取成功后确认一下
```shell
docker images
```

3. 创建并启动一个zookeeper容器
```shell
docker run --privileged=true -d --name huazai-zookeeper --publish 2181:2181  -d zookeeper
```

4. 确认容器运行状态
```shell
docker ps
```

![docker安装zookeeper](http://blog-ipic.yananhuazai.cn/Fi1vuHkzxAI-G-OnTG3X97K32h6w)