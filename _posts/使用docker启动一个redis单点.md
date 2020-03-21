---
title: docker run single redis
date: 2018-11-08 12:25:50
tags: Docker
---

1.use Dockerfile build redis image(or docker pull nianshenlovelily/redis:5.0)
```
git clone https://github.com/zhangzhaorui/docker-redis-single.git
docker build -t nianshenlovelily/redis:5.0 .
```
or
```
docker pull nianshenlovelily/redis:5.0
```
2.use image deploy redis
* Create the redis data persistence directory and mount the data directory
```
mkdir -p /opt/data
```
* run image
```
docker run -d --name redis-single -p 6379:6379 -v /opt/data:/data  nianshenlovelily/redis:5.0 redis-server --appendonly yes
```


