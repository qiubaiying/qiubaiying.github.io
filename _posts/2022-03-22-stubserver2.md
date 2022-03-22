---
layout:     post
title:      配置Mountebank环境
subtitle:   mountebank系列(2)
date:       2022-03-22
author:     Bruce Wong
header-img: img/joshua-hibbert-eqpZgUYGLJE-unsplash.jpg  
catalog: true
tags:
    - 敏捷
    - Agile
    - 技术
---
  
如果想了解Mountebank是一个什么工具，作用有哪些，可以参考我这个系列的第一篇文章[《什么是打桩服务》](https://brucetalk.com/2020/08/15/stubserver1/)，从这篇文章开始，将开始介绍Mountebank的各个具体功能的使用和作用。本文说明的是如何快速搭建服务环境。毕竟如何搭建这个工具，能快速使用起来是尝试的第一步。  

### 本机安装方法  
本机安装mountebank server有几种方式：   
+ npm 安装  
就是直接在本机的环境通过npm安装。如下是脚本。 
```javascript 
npm install -g mountebank 
```
+ docker安装  
如果你想保持本机环境的清洁，那也可以使用容器。通过docker来运行。mountebank的作者提供了docker镜像，可以通过docker hub下载并运行。下面是脚本。
```javascript
docker pull bbyars/mountebank 
```
### 启动服务  
安装完成后，最简单的方式就是启动一下，看是否打出正确的日志。针对安装方式有如下几种启动方式：  
+ npx 启动  
    ```javascript 
    npx mb start 
    ``` 
+ 容器启动  
    ```javascript
    docker run --rm bbyars/mountebank mb start
    ```
正常启动后都会在屏幕打印一条记录：  
```log
info: [mb:2525] mountebank v2.6.0 now taking orders - point your browser to http://localhost:2525/ for help
```
2525是mountebank默认服务管理界面和API的端口。如果和你的机器有冲突，或者你希望用一个更喜欢的端口号，你可以通过启动命令修改：
``` javascript
mb start --port 3333  
```
### 退出服务  
当然最简单的是关闭容器，不过可以通过命令来操作关闭那咱们就用优雅的方式吧。命令都是：mb stop
+ 如果是npm方式那么可以
``` javascript
npx mb stop
```
+ docker容器  
``` javascript
docker exec -it [containerID] /bin/sh  
/app $ mb stop
``` 
当屏幕提示如下记录时，说明已经推出了。
```log
info: [mb:2525] Adios - see you soon?
```
好了，很简单的一个单机环境搭建好了，下一篇我们将开始使用最简单的打桩服务来提供API测试使用。

## 参考引用  
- [Home page of mountebank](http://www.mbtest.org/)