---
title: CentOS安装docker-ce
date: 2017-09-04
header-img: img/123.jpg
catalog: true
tags: Docker
---
### 一、卸载原装的docker
```
yum remove docker*
```

### 二、按照yum配置管理工具并配置docker-ce的yum源
```
yum install -y yum-utils && yum-config-manager  --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

### 三、查找自己需要的docker-ce的版本
* 不建议直接就用最新版，选择适合自己的稳定版本即可，且统一整个生产环境的版本，尤其是K8s集群中docker-ce的版本
```
yum list docker-ce --showduplicates | sort -r
```

### 三、安装docker-ce 

```
yum -y install docker-ce
```

![install-docker.png](http://q7mj5531m.bkt.clouddn.com/install-docker.png)