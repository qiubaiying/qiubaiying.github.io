---
layout:     post
title:      2019-03-14-以macOS原生docker创建k8s集群(上)
subtitle:   k8s初探
date:       2019-03-14
author:     秋酱
header-img: img/post-bg-map.jpg
catalog: true
tags:
    - docker
    - kubernetes
---

# 以macOS原生docker创建k8s集群(上)

## 1
容器已经成为软件开发者的热门讨论，许多开发者也热衷于研究容器及其编排工具的应用。而docker已然成为容器的翘首，而kubernetes将成为docker编排工具的首选，这篇文章将在macOS环境下，用原生的docker（edge版）环境来演示如何在本机创建容器集群。本文以实际操作为主，对其中许多名词不太懂的新同学请查询资料学习。本文也是一篇总结，是上学期我和我小组的同学在高级操作系统课上做的研究报告和展示。

## 2 
首先准备docker环境，Mac安装docker非常方便，不再赘述，然后在偏好设置中：

![](https://ws3.sinaimg.cn/large/006tKfTcgy1g12jqlqq0fj30eg0fw75w.jpg)


修改守护进程的镜像地址，以便拉取镜像，
然后在kubernetes的选项下勾选这个：


![](https://ws1.sinaimg.cn/large/006tKfTcgy1g12jrq9bwcj30eg0ayabn.jpg)

点击apply后docker会自动的拉取k8s需要的镜像，但我卡在这个地方了，网上插了拉取镜像卡主的解决办法可以参考：
`https://www.jianshu.com/p/7c35fefdf1b4`

到这里docker原生的k8s就已经安装好了。

## 3
先来创建基础镜像，基于`node` 给出的官方镜像，运行一个简单的hello world服务。
### 创建server.js:
```
mdkir k8s
touch server.js
```

```
var http = require('http');

var handleRequest = function(request, response) {
  console.log('Received request for URL: ' + request.url);
  response.writeHead(200);
  response.end('Hello World!\n');
};
var www = http.createServer(handleRequest);
www.listen(8080);
```
若运行这个程序，你在浏览器访问：`localhost:8000`,就能看到输出了一个hello world
或者在命令行中：`curl http://127.0.0.1:8080 ` 也能得到一样的结果。
### 创建DockerFile
```
FROM node:6.14.2
EXPOSE 8080
COPY server.js .
CMD node server.js
```
此时我的工作目录下是：

![](https://ws1.sinaimg.cn/large/006tKfTcgy1g12kc9uva4j30es01dweu.jpg)

这样我们就能根据Dockerfile中给出的基础镜像： node:6.14.2来创建我们自己的镜像：
`docker build -t hello-node:v1 .` 别打漏了后面那一个 .
### 构建镜像hello-node:v1
```
<!--运行容器-->
docker run -d -p 8080:8080 -it --rm hello-node:v1
<!--查看效果-->
curl http://127.0.0.1:8080
<!--查看运行中的容器，最前面的就是容器的id-->
docker container ls -l
<!--关闭容器-->
docker stop <CONTAINER ID>
```
### 构建镜像hello-node:v2
创建两个版本的镜像是为了后面集群部署的时候做自动更新与回滚。
修改server.js中的输出语句：
`response.end('Hello World Again!\n');`
后面的步骤与创建v1完全一致：
```
<!--创建镜像-->
docker build -t hello-node:v2 .
<!--运行镜像-->
docker run -d -p 8080:8080 -it --rm hello-node:v2
curl http://127.0.0.1:8080
<!--关闭镜像-->
docker container ls -l
docker stop <!--CONTAINER ID-->
```
### 准备创建kubernetes集群
到此我们构建了两个版本的镜像，并且在容器中运行了他们。下一篇文章将讲解如何基于现有的镜像创建Kubernetes集群，并对集群
中的容积进行容量的伸缩，版本的更新与回滚（v1->v2->v1)。