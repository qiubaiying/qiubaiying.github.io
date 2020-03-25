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
不建议直接就用最新版，选择适合自己的稳定版本即可，且统一整个生产环境的版本，尤其是K8s集群中docker-ce的版本
```
yum list docker-ce --showduplicates | sort -r
```

### 三、安装docker-ce 

```
yum -y install docker-ce
```

![install-docker.png](http://q7mj5531m.bkt.clouddn.com/install-docker.png)

### 四、存储优化
默认Docker官方已经不再建议使用devicemapper，推荐使用overlay2，所以docker的存储驱动我选择使用overlay2，这就要求我们操作系统本身的filesystem是ext4或者是xfs的，且做好docker的存储目录和操作系统的根目录是区分开的。

![11.png](http://q7mj5531m.bkt.clouddn.com/11.png)

![docker-overlay.png](http://q7mj5531m.bkt.clouddn.com/docker-overlay.png)

#### 创建数据盘并格式化成ext4格式或者xfs格式。（需要注意格式化为xfs格式时需要添加ftype=1）

```
mkfs.xfs -n ftype=1 /dev/sdb
mkfs.ext4 /dev/sdb
```

#### 修改docker默认存储目录

```
vim /usr/lib/systemd/system/docker.service

在ExecStart此行添加--graph 目录名称 指定docker存储挂载目录
```

#### 添加daemon.json（我的这个内容包括镜像加速，存储驱动，日志格式，日志轮转等还可以添加的有很多）

```
mkdir /etc/docker && vim /etc/docker/daemon.json

{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "registry-mirrors": ["https://fz5yth0r.mirror.aliyuncs.com"],
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
```

#### 重启docker

```
systemctl daemon-reload && systemctl  restart docker
```

### 五、后续优化动作

#### docker及docker-compose命令补全

```
yum install -y bash-completion zip unzip gcc gcc-c++ python-devel && pip install docker-compose

curl -L https://raw.githubusercontent.com/docker/docker/v$(docker version -f "{{.Client.Version}}")/contrib/completion/bash/docker -o /etc/bash_completion.d/docker

curl -L https://raw.githubusercontent.com/docker/compose/$(docker-compose version --short)/contrib/completion/bash/docker-compose -o /etc/bash_completion.d/docker-compose

source /etc/bash_completion.d/docker-compose

重新登陆shell生效

```









