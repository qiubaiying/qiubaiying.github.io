---
title: docker基本知识
date: 2018-11-13 10:00:10
tags: docker
---

张念申有四把刀，叨逼叨叨逼叨
### 一，Docker的优势是什么
- 更高效的利用系统资源
由于容器不需要进行硬件虚拟以及运行完整操作系统等额外开销，Docker对系统资源的利用率更高。无论是应用执行速度、内存损耗或者文件存储速度，都要比传统虚拟机技术更高效。因此，相比虚拟机技术，一个相同配置的主机往往可以运行更多数量的应用。
- 更快速的启动时间
传统的虚拟机技术从开机器到部署安装依赖到启动应用服务往往需要数分钟，而Docker容器应用，由于直接运行于宿主内核，无需启动完整的操作系统，因此可以做到秒级、甚至毫秒级的启动时间。大大的节约了开发、测试、部署的时间。
- 一致的运行环境
开发过程中一个常见的问题是环境一致性问题。由于开发环境、测试环境、生产环境不一致，导致有些bug并未在开发过程中被发现。而 Docker的镜像提供了除内核外完整的运行时环境，确保了应用运行环境一致性，从源头杜绝因环境不一致而出现的运维开发测试撕逼问题。
- 持续交付和部署
对开发和运维人员来说，最希望的就是一次创建或配置，可以在任意地方正常运行。使用Docker可以通过定制应用镜像来实现持续集成、持续交付、部署。开发人员可以通过Dockerfile来进行镜像构建，并结合持续集成系统进行集成测试，而运维人员则可以直接在生产环境中快速部署该镜像，甚至结合持续部署系统进行自动部署。而且使用Dockerfile使镜像构建透明化，不仅仅开发团队可以理解应用运行环境，也方便运维团队理解应用运行所需条件，帮助更好的生产环境中部署该镜像。
-  更轻松的迁移
由于 Docker 确保了执行环境的一致性，使得应用的迁移更加容易。Docker可以在很多平台上运行，无论是物理机、虚拟机、公有云、私有云，个人pc，其运行结果是一致的。因此用户可以很轻易的将在一个平台上运行的应用，迁移到另一个平台上，而不用担心运行环境的变化导致应用无法正常运行的情况。
-  更轻松的维护和扩展
Docker使用的分层存储以及镜像的技术，使得应用重复部分的复用更为容易，也使得应用的维护更新更加简单，基于基础镜像进一步扩展镜像也变得非常简单，因为在build的过程中有cache，所以速度也很快。Docker官方团队同各个开源项目团队一起维护了一大批高质量的官方镜像（Dockerhub），既可以直接在生产环境使用，又可以作为基础进一步定制，大大的降低了应用服务的镜像制作成本。

&nbsp;
### 二，只存在理论中的对比
| 特性         | 容器                 | 虚拟机              |
| -------------|--------------------- |---------------------|
| 启动时间     |秒级                  |分钟级               |
| 硬盘使用     |一般为MB              |一般为GB             |
| 性能         |接近原生              |弱于                 |
| 系统支持量   |单机支持上千个容器    |一般几十个           |

&nbsp;
### 三，大图镇楼
![8.png](docker基本知识/8.png)

### 四，容器是什么
容器其实是一种沙盒技术。顾名思义，沙盒就是能够像一个集装箱一样，把你的应用“装”起来的技术。这样，应用与应用之间，就因为有了边界而不至于相互干扰；而被装进集装箱的应用，也可以方便地搬来搬去。

### 五，实现的机制
![jiagou.png](docker基本知识/jiagou.png)
- 在这个对比图里，我们应该把Docker画在跟应用同级别并且靠边的位置。这意味着，用户运行在容器里的应用进程，跟宿主机里的其他进程是一样的，都是由宿主机的操作系统统一管理，只不过是这些被隔离的进程拥有额外设置过的Namespace参数，Docker在这里扮演的觉得更多是旁路式的辅助和管理工作。
- 这样的架构其实就能解释说为什么Docker比虚拟机更受欢迎，使用虚拟化技术作为应用沙盒，就必须要由 Hypervisor来负责创建虚拟机，这个虚拟机是真实存在的，并且它里面必须运行一个完整的Guest OS才能执行用户的应用进程，不可避免的带来了额外资源的开销。根据实验，一个运行着 CentOS 的 KVM 虚拟机启动后，不做任何优化的情况下，虚拟机自己占用的内存就在100M~200M之间，此外，用户的应用进程运行在虚拟机里边，它对宿主机操作系统的调用就不可避免要经过虚拟化软件的拦截 （http://www.voidcn.com/article/p-ptdsqwxt-bbb.html） 这本身又是一层消耗，相比之下，容器化后的用户应用，却依然还是一个宿主机上的普通进程，这就意味着因为虚拟化带来的性能损耗是不存在的，另一方面，使用Namespace做隔离意味着容器不需要单独的Guest OS，这就使得容器在OS的性能损耗可以忽略不计。
- 容器技术的核心功能就是通过约束和修改进程的动态表现，从而为其创造出一个边界。Cgroups技术是用来制造约束的主要手段，Namespace技术是用来修改进程视图的主要方法。
- Namespace技术实际上修改了应用进程看待整个计算机的视图，这种机制其实就是对被隔离应用的进程空间做了手脚，使了个”障眼法“，使得这些进程只能看到重新计算过的进程编号，比如PID=1。可实际上，他们在宿主机的操作系统里，还是原来的第100号进程。
- 为什么会引入Cgroup的概念，因为单纯靠namespace隔离的不彻底，虽然容器内的PID=1进程在“障眼法”的干扰下只能看到容器里的情况，但是宿主机上，它作为PID=100的进程与其他所有进程之间依然平等的竞争关系，这就意味着，虽然PID=100进程表面上被隔离了起来，但是它跟其他的进程依然是平等的竞争关系，它所能够使用到的资源（比如 CPU、内存），可以随时被其他进程占用，PID=100的进程同样可以把所有资源吃光，这显然不符合一个“沙盒”应有的气质。Cgroup正是为了解决这个问题出现的。
- 综上所述，一个正在运行的Docker容器，其实就是一个启用了多个Linux Namaspace的应用进程，而这个进程能够使用的资源量，则受 Cgroups 配置的限制。

### 六，用通俗易懂的说法来解释
首先你有一个100平方的一厅的房子（服务器），已知你（PHP 应用）需要吃喝拉撒睡，所以整个房子划分了卧室、厨房、卫生间等，然后供你一个人享用，但其实挺浪费的，你一个人并不需要100平方这么大，可能需要20平方（服务器占用 20%）就好了。后来又来了个别人（Java 应用）也被安排到了这个房子里生活，他也需要吃喝拉撒睡，所以你们挤在了一个床上用一个卫生间（http服务）。如果你改了你的习惯（例如 http 服务配置项）同样会影响别人的生活。后来又来了人（Node 应用），这时候房东发现房子不够大了，所以搬家（迁移、升级服务器）到另一个 150 平的房子，但是搬家成本好高。由于户型不同（系统版本、环境等）需要装修好久，此外还要把住户（应用代码）搬过来，还需要把住户自定义的习惯都带过来简直麻烦死了。这时候，房东了解到了一个叫 Docker 的产品。Docker 是一个可自由伸缩的集装箱房屋，这个集装箱房屋虽小但是五脏俱全，而且可以满足一切用户需求，并支持高度自定义，比如 Node 这位住户不需要厨房，那么他的集装箱房子就小一点，当然房租（硬件资源开销）也便宜一些。房东用了 Docker 这个产品之后，发现租房这个事情变简单了（让租房变得简单快乐）：
* 房东不需要划分卫生间、厨房、卧室并进行装修了，一切由用户自己定制集装箱。房东只需要把集装箱放到房间里即可。
* 住户也不需要打架了，以前一起付房租（消耗服务器资源），现在按照自己集装箱大小付费。而且你可以在你集装箱里面随便折腾，爱怎么改配置就怎么改，也不会影响到别人。
* 集装箱对于空间的使用，更加直观，房东可以更轻松了解到当前房间的空间使用率等，以便升级房间。
* 房东搬新家的时候也开心了，只要把一面墙炸开，把里面一个个集装箱直接移过去新房子就好了，啥也不需要配置，都在集装箱里面呢。
* 你就是房东，做运维的。房间是服务器，空间大小表示服务器硬件配置。
* 住户就是你的业务、应用，提供服务的。
* 伸缩集装箱房屋，就是Docker 容器，里面是完全分离、独立、自由的环境和业务代码。你可以在里面装一个 Ubuntu（消耗大）或者简版的、可以跑业务代码的环境（消耗低）。
* Docker抹平系统差异，相当于把你多个房间都砸成长方形方便存放集装箱。这样你可以快速把独立容器丢到各个配置了Docker的不同系统、硬件配置的服务器上面。因此也可以得到很高的伸缩性，可以瞬间部署很多服务器很多容器，然后负载均衡来提供大促服务等。


### 七，为什么docker image这么小？
Linux操作系统由内核空间和用户空间组成。如下图所示：
![rootfs.png](docker基本知识/rootfs.png)
* 内核空间是kernel，Linux 刚启动时会加载bootfs文件系统，之后bootfs会被卸载掉。
* 用户空间的文件系统是 rootfs，包含我们熟悉的 /dev, /proc, /bin 等目录。对于base镜像而言，底层直接用Host kernel，自己只需提供rootfs，一个精简的OS，rootfs可以很小，只需要包括最基本的命令、工具和程序库就可以。CentOS镜像的Dockerfile文件内容
如下，不同Linux发行版的区别主要就是rootfs。比如Ubuntu14.04使用upstart管理服务，apt管理软件包；而CentOS7使用systemd和yum。这些都是用户空间上的区别，Linux kernel差别不大。
```
FROM scratch
ADD centos-7-docker.tar.xz /
CMD ["/bin/bash"]
```
第二行 ADD 指令添加到镜像的 tar 包就是 CentOS 7 的 rootfs。在制作镜像时，这个 tar 包会自动解压到 / 目录下，生成 /dev, /porc, /bin 等目录。

### 八，牛刀小试
- 从第一个HelloWorld开始

```
docker run ubuntu:15.10 /bin/echo "Hello world"
```
![hello.png](docker基本知识/hello.png)

- 运行交互式的容器

```
docker run -i -t ubuntu:15.10 /bin/bash
```
* -t:在新容器内指定一个伪终端或终端。
* -i:允许你对容器内的标准输入 (STDIN) 进行交互。
此时我们已进入一个 ubuntu15.10系统的容器中。
![it.png](docker基本知识/it.png)

- 后台模式启动容器

```
docker run -d ubuntu:15.10 /bin/sh -c "while true; do echo hello world; sleep 1; done"
```
![d.png](docker基本知识/d.png)

* 这这个长字符串叫做容器ID，对每个容器来说都是唯一的，我们可以通过容器ID来查看对应的容器发生了什么
* docker ps来查看容器是否运行，CONTAINER ID是容器ID，NAMES:自动分配的容器名称。
* 在容器内使用docker logs命令，查看容器内的标准输出

### 九，从四个角度来理解学习docker命令
* 容器生命周期管理（run start stop restart kill rm create exec）
* 容器操作（ps inspect top events logs export port）
* 容器rootfs命令（commit cp）
* 镜像仓库（login logout pull push search）
* 本地镜像管理（images rmi tag build history save import）



### 十，docker基础命令

#### docker run
```
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```
常用参数说明
* -a stdin: 指定标准输入输出内容类型，可选 STDIN/STDOUT/STDERR 三项
* -d 后台运行容器，并返回容器ID
* -i 以交互模式运行容器，通常与 -t 同时使用
* -t 为容器重新分配一个伪输入终端，通常与 -i 同时使用
* --name="名字" 为容器指定一个名称
* --dns 8.8.8.8 指定容器使用的DNS服务器，默认和宿主一致
* --dns-search example.com 指定容器DNS搜索域名，默认和宿主一致
* -h "主机名" 指定容器的hostname
* -e key="value" 设置环境变量，一般用于传递设置或者密码
```
如：-e MYSQL_ROOT_PASSWORD=root
```
* --env-file=[] 从指定文件读入环境变量
* --entrypoint="" 忽略Dockerfile的ENTRYPOINT设置，强制设置为其他值。
* --expose=[] 仅连接容器的端口与主机，并不暴露在外
* --cpuset="0-2" 或者 --cpuset="0,1,2" 绑定容器到指定CPU运行
```
若设置--cpuset="0,1" 则使用第一与第二个cup
若这是--cupset="0-2" 则使用从第一到第三个cup
```
* -m Memory limit设置容器使用内存最大值，格式为<数字><单位>，单位可以使用b,k,m,g
```
--memory="512m"
```
* --expose=[] 开放一个端口或一组端口
* --health-cmd 运行一个健康状态检查的命令
* -v, --volume=[] 指定挂载一个持久化卷 -v 宿主机目录：容器内目录
* -p 将容器内的端口映射到宿主机的指定端口上 宿主机端口：容器内端口
* -P 将容器内的端口映射到宿主机上的随机端口
* --rm=false 若容器内的进程终止，则自动删除容器，此选项不能与-d选项一起使用
* --add-host=[] 向容器的/etc/hosts添加主机名与IP地址
```
--add-host=hello:192.168.0.233
```
* --device=[] 添加主机设备到容器，格式为<主机设备>:<容器设备>
```
若设置为 --device="/dev/sda1:/dev/sda1",则在容器中也可以使用主机的/dev/sda1块设备
```
* -w、--workdir="" 设置容器内部要运行进程的目录
* -u、--user="" 设置容器运行时要使用的Linux用户账户与UID
* --restart="" 设置容器内部进程终止时重启策略
```
--restart=no 即使进程终止也不重启
--restart="on-failure" 仅当进程的Exit Code 不为0时执行重启。也可以设置重置次数。若不设置重试次数，这不断重启。如 --restart="no-failure:10"
--restart="always" 不受Exit Code的影响，总是重启
```
* --net="bridge" 设置容器的网络模式（选项可以是：bridge,none,container,host）

* 举个小栗子
```
docker run -d --name mongodb-single -p 27017:27017 -v /mongo/db:/data/db  nianshenlovelily/mongodb:3.2
```

#### Docker start/stop/restart启动/停止/重启一个或多个容器
```
docker start   [OPTIONS] CONTAINER [CONTAINER...]
docker stop    [OPTIONS] CONTAINER [CONTAINER...]
docker restart [OPTIONS] CONTAINER [CONTAINER...]
```
* 举个栗子
```
docker stop mongodb-single
```
#### docker kill杀掉一个运行中的容器。
```
docker kill [OPTIONS] CONTAINER [CONTAINER...]
```
* kill和stop的区别
kill是不管容器同不同意，我直接执行kill -9，强行终止；stop的话，首先给容器发送一个TERM信号，让容器做一些退出前必须的保护性、安全性操作，然后让容器自动停止运行，如果在一段时间内，容器还是没有停止，再进行kill -9，强行终止。

#### docker rm [OPTIONS] CONTAINER [CONTAINER...]删除容器
OPTIONS说明
* -f 通过SIGKILL信号强制删除一个运行中的容器
* -l 移除容器间的网络连接，而非容器本身
* -v 删除与容器关联的卷
```
docker rm -f mongodb-single
常用的一条命令，删除Exit状态的container
docker rm -f $(docker ps -a | grep Exit | awk '{ print $1 }')
```
#### docker create 创建一个新的容器但不启动它，语法同docker run 
#### docker exec在运行的容器中执行命令
```
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```
* -i即使没有附加也保持STDIN打开
* -t分配一个伪终端
* 举个栗子
```
docker exec -it  mynginx /bin/bash
```

#### docker ps列出容器
* -a显示所有的容器，包括未运行的
* -f根据条件过滤显示的内容
* --format指定返回值的模板文件
* -l显示最近创建的容器
* -n列出最近创建的n个容器
* --no-trunc :不截断输出
* -q静默模式，只显示容器编号，一般在删除多个容器时可以使用docker rm -f $(docker ps -a -q)
* -s显示总的文件大小

#### docker inspect获取容器/镜像的元数据
* -f指定返回值的模板文件
* -s显示总的文件大小
* --type为指定类型返回JSON
举个栗子
```
[root@kubectl-test-001 ~]# docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' myrabbitmq
172.17.0.2

```

#### docker top查看容器中运行的进程
* 容器运行时不一定有/bin/bash终端来交互执行top命令，而且容器还不一定有top命令，可以使用docker top来实现查看container中正在运行的进程。
#### docker events从服务器获取实时事件，“事件“分为镜像的和容器的两种：
* 容器可以报告的事件有attach, commit, copy, create, destroy, die, exec_create, exec_start, export, kill, oom, pause, rename, resize, restart, start, stop, top, unpause
* 镜像可以报告的事件有delete, import, pull, push, tag, untag
* -f根据条件过滤事件
* --since从指定的时间戳后显示所有事件，值可以是UNIX时间戳，RFC3399定义的日期或者Golang的时间间隔
* --until流水时间显示到指定的时间为止
```
docker events  --since="1542459190"
```
#### docker logs获取容器的日志
```
docker logs [OPTIONS] CONTAINER
```
* -f跟踪日志输出
* --since显示某个开始时间的所有日志
* -t显示时间戳
* --tail仅列出最新N条容器日志
举个栗子
查看容器mongodb-single从2018年11月10日后的最新10条日志。
```
docker logs --since="2018-11-10" --tail=10  mongodb-single
```
#### docker export将文件系统作为一个tar归档文件导出到STDOUT。
```
docker export [OPTIONS] CONTAINER
```
* -o将输入内容写到文件
举个栗子
```
docker export -o mymongo-`date +%Y%m%d`.tar mongodb-single
```
#### docker port列出指定的容器的端口映射

```
[root@kubectl-test-001 avc]# docker port mongodb-single 
27017/tcp -> 0.0.0.0:27017
```
#### docker commit从容器创建一个新的镜像
举个栗子
```
docker commit -a "zhangzhaorui" -m "my mongodb" mongodb-single
```
* -a提交的镜像作者
* -m提交时的说明文字
* -p在commit时，将容器暂停

#### docker cp容器与主机之间的数据拷贝
```
docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH
docker cp [OPTIONS] SRC_PATH CONTAINER:DEST_PATH
```
举个栗子
```
将宿主机的envbak文件拷贝到容器的/目录下
docker cp envbak mongodb-single:/
将容器中的js-yaml.js文件拷贝到宿主机的当前目录下
docker cp mongodb-single:/js-yaml.js ./

需要注意的点
将主机/root/test/mnesia目录拷贝到容器mongodb-single的/data目录下。
docker cp /root/test/mnesia  mongodb-single:/data/
将主机机/root/test/mnesia目录拷贝到容器mongodb-single中，目录重命名/abc
docker cp /root/test/mnesia  mongodb-single:/data
```

#### docker login/logout
* docker login登陆到一个Docker镜像仓库，如果未指定镜像仓库地址，默认为官方仓库DockerHub
* docker logout登出一个Docker镜像仓库，如果未指定镜像仓库地址，默认为官方仓库DockerHub
语法
```
docker login [OPTIONS] [SERVER]
docker logout [OPTIONS] [SERVER]
```
OPTIONS说明
* -u登陆的用户名
* -p登陆的密码
* SERVER为你需要登陆的仓库地址

#### docker pull从镜像仓库中拉取镜像
语法
```
docker pull [OPTIONS] NAME[:TAG]
```
OPTIONS说明：
* -a拉取所有tagged镜像
* --disable-content-trust忽略镜像的校验,默认开启

#### docker push将本地的镜像上传到镜像仓库,要先登陆到镜像仓库
语法
```
docker push [OPTIONS] NAME[:TAG]
```
OPTIONS说明：
* --disable-content-trust忽略镜像的校验,默认开启
* 私有registry在push或pull镜像时（非https的），需要修改daemon.json，将私有镜像库加到insecure-registryes，附一份我的daemon.json
```
{
  "bip": "192.168.200.1/24",
  "insecure-registries": ["私有registry的地址"],
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}
```
#### docker search从DockerHub查找镜像
举个栗子
```
docker search -s 10 mongo
```
* -s列出收藏数不小于指定值的镜像
* --no-trunc显示完整的镜像描述

#### docker images列出本地镜像
常用命令
```
列出本地所有的镜像（含中间映像层，默认情况下，过滤掉中间映像层）
docker images -a
删除未使用的镜像
docker rmi $(docker images --quiet --filter dangling=true)
删除所有没有标签的镜像
docker rmi $(docker images | grep "^" | awk "{print $3}")
```

#### docker rmi删除本地一个或多少镜像
```
docker rmi [OPTIONS] IMAGE [IMAGE...]
```
* -f强制删除
* --no-prune :不移除该镜像的过程镜像，默认移除

#### docker tag标记本地镜像，将其归入某一仓库
* tag是docker做版本控制的关键，一定要认真打且要有意义能体现到版本迭代，之后在k8s中做版本控制，回滚或者更新都是通过tag来做的，切记切记！！！
举个栗子
```
docker tag nianshenlovelily/mongodb:3.2 172.18.130.36/library/mongodb:3.2
```

#### docker build使用Dockerfile创建镜像
用几个常用栗子来说明docker build
```
docker build -t 172.18.130.36/php/172.18.130.36/php/laravel-service-provider:vtest -f docker/multi-stage.dockerfile . 

-f 指定要使用的Dockerfile路径\
-t 直接给要build的镜像打一个tag
--no-cache创建镜像的过程不使用缓存
```

#### docker save/import将指定镜像保存成tar归档文件/从归档文件中创建镜像。一般用于需要科学上网的才能pull的镜像。。。
* -o 输出到文件

```
将镜像172.18.130.36/library/mongodb:3.2生成mymongo.tar文档
docker save -o mymongo.tar 172.18.130.36/library/mongodb:3.2
从镜像归档文件mymongo.tar创建镜像，命名为172.18.130.36/library/mongodb:3.2
docker import mymongo.tar 172.18.130.36/library/mongodb:3.2
```
#### 使用.dockerignore文件
Docker Client会默认发送Dockerfile同级目录下的所有文件到Dockerdaemon中，当前我的所在dockerfile的目录中有一个.git目录大小为100MB，这个.git目录对build镜像是没有任何用途的，但是docker build时会将当前所有的目录都加载一遍，这样就非常影响我docker build的速度，这时我就需要一个.dockerignore文件了，echo .git >> .dockerignore 再次执行docker build发现，加载文件变小了。
* 看2张图就全都明白了
![a.png](docker基本知识/a.png)
![b.png](docker基本知识/b.png)


### 一款go写的好用的查看容器资源开销的小工具
wget https://github.com/bcicen/ctop/releases/download/v0.7.1/ctop-0.7.1-linux-amd64 -O /usr/bin/ctop && chmod +x /usr/bin/ctop
ctop的功能很强大，也很直观。可以通过ctop看到container的很多东西。

