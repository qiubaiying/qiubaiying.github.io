---
title: docker run single zookeeper
date: 2018-11-09 1:20:50
tags: Docker
---

### 使用docker启动一个单点带数据持久化的zk （https://hub.docker.com/_/zookeeper/）
#### pull image（Dockerfile可见 https://github.com/31z4/zookeeper-docker/tree/c6ef4c1ada3c59dc3c1aaef43619b6e048d3c9e8）
```
docker pull zookeeper:3.4.13
或
docker pull 172.18.130.36/library/zookeeper:3.4.13
```

#### run image
```
创建几个数据持久化的目录 
mkdir ./datalog && mkdir ./logs && mkdir ./data 
启动zk的镜像并持久化卷映射端口
docker run -d --name my-single-zookeeper --restart always -p 2181:2181    -v  $(pwd)/datalog:/datalog  -v $(pwd)/logs:/logs -v $(pwd)/data:/data  172.18.130.36/library/zookeeper:3.4.13
如果想把zoo.cfg配置文件也挂载出来可以添加-v $(pwd)/zoo.cfg:/conf/zoo.cfg 参数在run时
```
