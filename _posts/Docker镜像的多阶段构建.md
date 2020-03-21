---
title: Docker多阶段构建
date: 2018-11-21 9:20:50
tags: docker
---
<font face="黑体">-------划船没有浆-------全靠浪-------</font>

![test.jpg](Docker镜像的多阶段构建/test.jpg)
### Docker镜像的多阶段构建
#### 遇到的问题和场景
* 做镜像构建时的一个常见的场景就是：应用在开发者自己的开发机或服务器上直接编译，编译出的二进制程序再打入镜像。这种情况一般要求编译环境与镜像所使用的base image是兼容的，比如说：我在Ubuntu 14.04上编译应用，并将应用打入基于ubuntu系列base image的镜像。这种构建我称之为“同构的镜像构建”，因为应用的编译环境与其部署运行的环境是兼容的：我在Ubuntu 14.04下编译出来的应用，可以基本无缝地在基于ubuntu:14.04及以后版本base image镜像(比如：16.04、16.10、17.10等)中运行；但在不完全兼容的baseimage中，比如centos中就可能会运行失败。
*  Docker的口号是Build, Ship, and Run Any App, Anywhere.但是我在应用过程中遇到一个问题，build image的时候，把源码也build进去了。然后就继续把源码Ship出去，所有的编译型语言都面临这个困扰。即使是脚本型语言，build 的时候也会使用很多上线时用不到的构建工具，而我希望减小生产镜像的体积，加快build  pull push deploy到k8s的速度。
&nbsp;
#### 曾经的做法
1. 忽略对镜像大小的控制，build run的时间，将所有的构建过程编包含在一个Dockerfile中，包括项目及其依赖库的编译、打包等流程。问题：Dockerfile特别长，可维护性降低，镜像层次多，镜像体积较大，build pull push deploy时间变长，源代码存在泄露的风险。优点：统一编译打包的环境，一定可以build 并启动起来
2. 事先在一个Dockerfile将项目及其依赖库编译测试打包好后，再将其拷贝到运行环境中，这种方式需要我们编写两个或以上Dockerfile和一些编译脚本才能将其两个阶段自动整合起来，这种方式虽然可以很好地规避第一种方式存在的风险，但明显部署过程复杂。CI/CD不好做，维护起来成本过高。

&nbsp;
#### 用一个例子来说明
##### 一，最简单粗暴的办法

###### 1.编写app.go文件，该程序输出Hello World!
```
package main  

import "fmt"  

func main(){  
    fmt.Printf("Hello World!");
}
```
###### 2. 编写Dockerfile.one文件
```
FROM golang:1.9-alpine

RUN apk --no-cache add git ca-certificates

WORKDIR /go/src/github.com/go/helloworld/

COPY app.go .

RUN go get -d -v github.com/go-sql-driver/mysql \
  && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app . \
  && cp /go/src/github.com/go/helloworld/app /root

WORKDIR /root/

CMD ["./app"]
```

###### 3.构建镜像
```
docker build -t go/helloworld:1 -f Dockerfile.one .
```
&nbsp;
##### 二，分散到多个 Dockerfile
另一种方式，首先在一个Dockerfile将项目及其依赖库编译测试打包好后，再将其拷贝到运行环境中，这种方式需要编写两个Dockerfile和一些脚本才能将其两个阶段自动整合起来，这种方式虽然可以很好地规避第一种方式存在的风险，但部署过程较复杂。
###### 1.编写Dockerfile.build文件
```
FROM golang:1.9-alpine

RUN apk --no-cache add git

WORKDIR /go/src/github.com/go/helloworld

COPY app.go .

RUN go get -d -v github.com/go-sql-driver/mysql \
  && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .
```

###### 2.编写Dockerfile.copy文件
```
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY app .

CMD ["./app"]
```

###### 3.build.sh脚本
```
#!/bin/sh

echo "Building go/helloworld:build"

docker build -t go/helloworld:build . -f Dockerfile.build

docker create --name extract go/helloworld:build
docker cp extract:/go/src/github.com/go/helloworld/app ./app
docker rm -f extract

echo "Building go/helloworld:2"

docker build --no-cache -t go/helloworld:2 . -f Dockerfile.copy
rm ./app
```

###### 4.执行build.sh脚本
```
chmod +x build.sh

./build.sh
```

&nbsp;
##### 三，多阶段构建
###### 1.使用Docker-v17.05多阶段构建 (multistage builds)新特性，只需要编写一个Dockerfile。

```
FROM golang:1.9-alpine as builder

RUN apk --no-cache add git

WORKDIR /go/src/github.com/go/helloworld/

RUN go get -d -v github.com/go-sql-driver/mysql

COPY app.go .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest as prod

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /go/src/github.com/go/helloworld/app .

CMD ["./app"]

```

###### 2.只构建某一阶段的镜像可以使用 as 来为某一阶段命名，例如：
```
FROM golang:1.9-alpine as builder
```
###### 3.只想构建 builder 阶段的镜像时，可以在使用 docker build 命令时加上 --target 参数
```
 docker build --target builder -t nianshenlovelily/go-test:v1.0 .
```
###### 4.构建时从其他镜像复制文件
上面例子中我们使用 COPY \-\-from=builder /go/src/github.com/go/helloworld/app . 从上一阶段的镜像中复制文件，也可以复制任意镜像中的文件。
```
COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf
```
