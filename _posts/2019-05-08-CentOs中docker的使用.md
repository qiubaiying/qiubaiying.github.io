---
layout: post
title: 入门docker的各种实践
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


# CentOS7环境docker相关安装

### docker-compose安装
```shell
curl -L https://github.com/docker/compose/releases/download/1.23.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```
or
```shell
使用python的pip来pip install docker-compose
前提是使用yum安装python-pip
```



# docker普通命令

### docker查看日志
```shell
docker logs -f -t --since=“2019-05-10” --tail=50 huazai-software
```

**参数介绍**：

```shell
–since : 此参数指定了输出日志开始日期，即只输出指定日期之后的日志。

-f : 查看实时日志

-t : 查看日志产生的日期

-tail=10 : 查看最后的10条日志。

huazai-software : 容器名称
```

### docker拉取镜像
```shell
docker pull 镜像名称:版本
```

### docker删除镜像
```shell
docker rmi image_id #image_id镜像id
```

### docker查看本地容器
```shell
docker ps #查看本地运行的容器
docker ps -a #查看本地所有的容器
```

### docker通过镜像开启一个容器
```shell
docker run -d --name container_name --publish 2181:2181  -d image_name
```

### docker进入正在运行中的容器
```shell
docker exec -it container_name /bin/bash #container_name:容器名称
```

### docker删除容器
```shell
docker rm container_id #container_id:容器id
```

### docker开启/关闭容器
```shell
docker start container_id
docker stop container_id
```


# docker实践安装软件

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



### docker中安装kafka

1. 拉取zookeeper和kafka镜像

```shell
docker pull wurstmeister/zookeeper
docker pull wurstmeister/kafka
```

2. 创建并启动zookeeper、kafka容器
```shell
docker run -d --name huazai-zookeeper -p 2181:2181 -t wurstmeister/zookeeper
docker run -d --name kafka --publish 9092:9092 --link huazai-zookeeper --env KAFKA_ZOOKEEPER_CONNECT=huazai-zookeeper:2181 --env KAFKA_ADVERTISED_HOST_NAME=192.168.66.202 --env KAFKA_ADVERTISED_PORT=9092 --volume /etc/localtime:/etc/localtime wurstmeister/kafka:latest

其中KAFKA_ADVERTISED_HOST_NAME改成宿主句ip（docker所在的主机的ip）
```


