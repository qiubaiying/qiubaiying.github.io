---
title: docker run single RabbitMQ
date: 2018-11-09 23:25:50
tags: Docker
---

### 为了更好的扩展rabbitmq并安装plugin，根据原生rabbitmq镜像自行做了定制

#### 一，原生rabbitmq镜像可从Dockerhub下载或通过官方Dockerfile自行build
- Dockerhub地址：https://hub.docker.com/_/rabbitmq/
- Dockerfile地址：https://github.com/docker-library/rabbitmq/tree/master/3.7/debian
- 从Dockerhub上直接pull镜像：docker pull rabbitmq:rabbitmq:3.7.8-management-alpine

#### 二，定制镜像
- 在跟Dockerfile同级的目录下创建名为plugins的文件夹，并将与rabbitmq版本相对应的插件安装包放入，注意插件版本要与rabbitmq-server的版本一致。rabbitmq插件下载地址 https://www.rabbitmq.com/community-plugins.html
![plugins.png](使用docker启动一个RabbitMQ单点/plugins.png)

- 编写Dockerfile
```
FROM rabbitmq:3.7.8-management-alpine

MAINTAINER zhangzhaorui

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \ #换国内源
    apk update && apk add ca-certificates && \
    apk add tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \ #更换时区
    echo "Asia/Shanghai" > /etc/timezone

ADD plugins/*.ez /plugins/  #添加插件的安装包
RUN rabbitmq-plugins enable --offline  rabbitmq_delayed_message_exchange #开启插件

```

#### 三，build镜像

```
docker build -t 172.18.130.36/library/rabbitmq:3.7.8-management-alpine-danke .
```
- 其中172.18.130.36 为私有harbor仓库，如不需要可以去掉
```
docker build -t rabbitmq:3.7.8-management-alpine-danke .
```

#### 四，run镜像
- -p映射宿主机端口到容器端口
- -v映射宿主机目录到容器目录
- -e设置环境变量更多的环境变量设置可以查询 https://www.rabbitmq.com/configure.html 默认username/passwd都是guest
```
docker run -d --name my-rabbitmq-single  -p 5672:5672 -p 15672:15672 -v /root/docker-rabbitmq-single/rabbitmq:/var/lib/rabbitmq  -e RABBITMQ_DEFAULT_USER=username -e RABBITMQ_DEFAULT_PASS=password  172.18.130.36/library/rabbitmq:3.7.8-management-alpine-danke
```

#### 五，使用
- 通过宿主机ip:5672 可以通过命令行使用rabbitmq，通过宿主机ip:15672 可以访问rabbitmq的UI界面





















