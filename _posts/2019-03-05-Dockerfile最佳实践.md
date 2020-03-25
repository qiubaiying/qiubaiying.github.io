---
layout:     post
title:      Dockerfile实践中体会
subtitle:   其实还有很多这个就是简单写写记录一下
date:       2019-03-05
author:     zhangzhaorui
header-img: img/123.jpg
catalog: true
tags:
    - Docker
---

### Dockerfile中常见指令
- FROM指定一个基础镜像，一般情况下一个可用的Dockerfile FROM是第一个指令。image可以是任何合理存在的image镜像。FROM可以在一个Dockerfile中出现多次，如果没有指定镜像tag，将会使用latest镜像版本。
- RUN 在当前image中执行任意合法命令并提交执行结果。命令执行提交后，就会自动执行Dockerfile中的下一个指令。通过RUN指令可以对image镜像进行定制化构建。
- ENV 指令可以用于为docker容器设置环境变量
- USER 用来切换运行属主身份的。Docker默认是使用root，但若不需要，建议切换使用者身分，毕竟root权限太大了，使用上有安全的风险。
- WORKDIR 用来切换工作目录的。Docker默认的工作目录是/，只有RUN能执行cd命令切换目录，而且还只作用在当下的RUN，也就是说每一个RUN都是独立进行的。如果想让其他指令在指定的目录下执行就得靠WORKDIR。使用WORKDIR进行的目录改变是持久的，不用每个指令前都使用一次WORKDIR。
- COPY 将文件从路径 <src> 复制添加到容器内部路径 <dest>。<src> 必须是想对于源文件夹的一个文件或目录。<dest> 是目标容器中的绝对路径。
- ADD 将文件从路径 <src> 复制添加到容器内部路径 <dest>。与COPY的不同在于ADD可以自动解压文件。
- VOLUME 指定需要持久化的目录
- EXPOSE 指定需要暴露的端口
- CMD Dockerfile中只能有一个CMD指令。如果指定了多个，那么只有最后个CMD指令是生效的。
- ENTRYPOINT image运行成instance(container)时，要执行的命令或者文件。


### 我们的目标是星辰大海
* 更快的构建速度
* 更小的镜像大小
* 更少的镜像分层
* 充分利用镜像缓存
* 增加Dockerfile可读性
* 让Docker容器使用起来更简单

### 该怎样实现
* 编写.dockerignore文件
* 容器只运行单个应用
* 将多个RUN指令合并为一个
* 基础镜像的标签不要用latest
* 每个RUN指令后删除多余文件
* 选择合适的基础镜像(alpine版本最好)
* 设置WORKDIR和CMD
* COPY与ADD优先使用前者
* 合理调整COPY与RUN的顺序
* 设置默认的环境变量，映射端口和数据卷
* 使用LABEL设置镜像元数据


### 违反所有最佳实践的一个Dockerfile的例子，逐渐改造他
```
FROM ubuntu
ADD . /app
RUN apt-get update  
RUN apt-get upgrade -y  
RUN apt-get install -y nodejs ssh mysql  
RUN cd /app && npm install
CMD mysql & sshd & npm start
```

#### 1.编写.dockerignore文件
构建镜像时，Docker需要先准备context ，将所有需要的文件收集到进程中。默认的context包含Dockerfile目录中的所有文件，但是实际上并不需要.git目录和node_modules目录等内容。.dockerignore的作用和语法类似于.gitignore可以忽略一些不需要的文件，这样可以有效加快镜像构建时间，同时减少Docker镜像的大小。
#### 2.容器只运行单个应用
从技术上来说，可以在Docker容器中运行多个进程。你可以将数据库，前端，后端，supervisor都运行在同一个Docker容器中。比如说laputa和pangu-master的那套代码。
- 非常长的构建时间(修改前端之后，整个后端也需要重新构建)
- 非常大的镜像size
- 多个应用的日志难以处理(不能直接使用stdout，否则多个应用的日志会混合到一起)
- 横向扩展时非常浪费资源(不同的应用需要运行的容器数并不相同)
#### 3.将多个RUN指令合并为一个
Docker镜像是分层的,类似于一个洋葱，想要吃到最里边的葱心，就需要将外边的葱皮一层一层的都剥掉。
- Dockerfile中的每个指令都会创建一个新的镜像层。
- 镜像层将被缓存和复用
- 当Dockerfile的指令修改了，复制的文件变化了，或者构建镜像时指定的变量不同了，对应的镜像层缓存就会失效
- 某一层的镜像缓存失效之后，它之后的镜像层缓存都会失效
- 将变化频率一样的指令合并在一起。
通过两个例子对比，如果将node.js安装与npm模块安装放在一起的话，则每次修改源代码，都需要重新安装node.js，这显然不合适。Docker镜像的分层理解一定要深刻，变动少一定要放到前边。

不合理Dockerfile
```
FROM ubuntu

ADD . /app

RUN apt-get update \  
    && apt-get install -y nodejs \
    && cd /app \
    && npm install

CMD npm start
```
合理Dockerfile
```
FROM ubuntu

RUN apt-get update && apt-get install -y nodejs  
ADD . /app  
RUN cd /app && npm install

CMD npm start
```

#### 4.基础镜像的标签不要用latest
当base镜像没有指定tag时，将默认使用latest tag。FROM ubuntu指令等同于FROM ubuntu:latest 当base镜像更新后，latest tag会指向不同的镜像（操作系统版本升级了）这时构建镜像有可能失败。如果确定需要使用最新版的base image，可以使用latest tag，否则最好指定确定的image tag。

#### 5.每个RUN指令后删除多余文件
假设我们执行了apt-get update，下载解压安装了一些软件包，它们都保存在/var/lib/apt/lists/目录中。问题在于，runtime的Docker镜像中并不需要这些文件。最好将它们删除，因为它会使Docker镜像变大。
```
FROM ubuntu:16.04

RUN apt-get update \  
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

ADD . /app  
RUN cd /app && npm install

CMD npm start
```

#### 6.选择合适的基础镜像(alpine版本最好)
除非我们有深层定制化镜像的强烈需求，否则最好用alpine版本的镜像，实例选择了ubuntu作为基础镜像，但是我们只需要运行node程序，没有必要使用一个通用的基础镜像，node镜像应该是更好的选择。
```
FROM node

ADD . /app  
RUN cd /app && npm install

CMD npm start
```
更好的选择是alpine版本的node镜像。alpine是一个极小化的Linux发行版，只有4MB，非常适合作为基础镜像。apk是Alpine的包管理工具,与apt-get有些不同，另外它还有一些非常有用的特性，比如no-cache，可以有效减少镜像的大小。
```
FROM node:7-alpine

ADD . /app  
RUN cd /app && npm install

CMD npm start
```
#### 7.设置WORKDIR和CMD
WORKDIR指令可以设置默认目录，也就是运行RUN / CMD / ENTRYPOINT指令的地方。
CMD指令可以设置容器创建是执行的默认命令。命令应该写在一个数组中，数组中每个元素为命令的每个单词。
```
FROM node:7-alpine

WORKDIR /app  
ADD . /app  
RUN npm install

CMD ["npm", "start"]

```
#### 8.COPY与ADD命令优先使用COPY
COPY指令非常简单，仅用于将文件拷贝到镜像中。ADD相对来讲复杂一些，可以用于下载远程文件以及解压压缩包。
#### 9.合理调整COPY与RUN的顺序
把变化最少的部分放在Dockerfile的前面，这样可以充分利用image cache。示例中，源代码会经常变化，则每次构建镜像时都需要重新安装NPM模块，因此我们可以先拷贝package.json，然后安装NPM模块，最后才拷贝其余的源代码。这样的话，即使源代码变化，也不需要重新安装NPM模块。
```
FROM node:7-alpine

WORKDIR /app

COPY package.json /app  
RUN npm install  
COPY . /app

ENTRYPOINT ["./entrypoint.sh"]  
CMD ["start"]
```
#### 10.设置默认的环境变量，映射端口和数据卷
运行Docker容器时很可能需要一些环境变量。在Dockerfile设置默认的环境变量是一种很好的方式。我们应该在Dockerfile中设置映射端口和数据卷。
```
FROM node:7-alpine

ENV PROJECT_DIR=/app

WORKDIR $PROJECT_DIR

COPY package.json $PROJECT_DIR  
RUN npm install  
COPY . $PROJECT_DIR

ENV MEDIA_DIR=/media \  
    NODE_ENV=production \
    APP_PORT=3000

VOLUME $MEDIA_DIR  
EXPOSE $APP_PORT

ENTRYPOINT ["./entrypoint.sh"]  
CMD ["start"]
```

#### 11.使用LABEL设置镜像元数据
使用LABEL指令，可以为镜像设置元数据，例如镜像创建者或者镜像说明。旧版的Dockerfile语法使用MAINTAINER指令指定镜像创建者，现已被弃用。
```
FROM node:7-alpine  
LABEL maintainer "nianshenlovelily@gmail.com"  
...
```
