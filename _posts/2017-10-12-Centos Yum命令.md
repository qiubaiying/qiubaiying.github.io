---
layout:     post
title:      yum 命令详解
subtitle:   Centos yum 命令详解
date:       2017-10-12
author:     Shuaiqijun
header-img: img/blog1.jpg
catalog: true
tags:
    - Centos
    - yum
---
yum 简介
===========================
yum，是Yellow dog Updater, Modified 的简称，是杜克大学为了提高RPM 软件包安装性而开发的一种软件包管理器。起初是由yellow dog 这一发行版的开发者Terra Soft 研发，用python 写成，那时还叫做yup(yellow dog updater)，后经杜克大学的Linux@Duke 开发团队进行改进，遂有此名。yum 的宗旨是自动化地升级，安装/移除rpm 包，收集rpm 包的相关信息，检查依赖性并自动提示用户解决。yum 的关键之处是要有可靠的repository，顾名思义，这是软件的仓库，它可以是http 或ftp 站点，也可以是本地软件池，但必须包含rpm 的header，header 包括了rpm 包的各种信息，包括描述，功能，提供的文件，依赖性等。正是收集了这些header 并加以分析，才能自动化地完成余下的任务。
　　yum 的理念是使用一个中心仓库(repository)管理一部分甚至一个distribution 的应用程序相互关系，根据计算出来的软件依赖关系进行相关的升级、安装、删除等等操作，减少了Linux 用户一直头痛的dependencies 的问题。这一点上，yum 和apt 相同。apt 原为debian 的deb 类型软件管理所使用，但是现在也能用到RedHat 门下的rpm 了。
　　yum 主要功能是更方便的添加/删除/更新RPM 包，自动解决包的倚赖性问题，便于管理大量系统的更新问题。
　　yum 可以同时配置多个资源库(Repository)，简洁的配置文件（/etc/yum.conf），自动解决增加或删除rpm 包时遇到的依赖性问题，保持与RPM 数据库的一致性。  
******  
Author:Shuaiqijun  
E-mail:42687880@qq.com  
******  
## 安装yum
CentOS 默认已经安装了yum，不需要另外安装，这里为了实验目的，先将yum 卸载再重新安装。
1、查看系统默认安装的yum
```
rpm -qa|grep yum
```
2
```
rpm -e yum-fastestmirror-1.1.16-14.el5.centos.1 yum-metadata-parser-1.1.2-3.el5.centos yum-3.2.22-33.el5.centos
```     
3、重新安装yum
这里可以通过wget 从网上下载相关包安装，也可以挂载系统安装光盘进行安装，这里选择挂载系统安装光盘进行
```
mount /dev/cdrom /mnt/cdrom/
```
```
rpm -ivh yum-3.2.22-33.el5.centos.noarch.rpm yum-fastestmirror-1.1.16-14.el5.centos.1.noarch.rpm yum-metadata-parser-1.1.2-3.el5.centos.i386.rpm
```
```
yum -v
```
yum 的基础安装包包括：
yum　　//RPM installer/updater  
yum-fastestmirror　　//Yum plugin which chooses fastest repository from a mirrorlist  
yum-metadata-parser　　//A fast metadata parser for yum  
其他安装包根据自己需要安装。  
### yum配置
yum 的配置文件分为两部分：main 和repository
main 部分定义了全局配置选项，整个yum 配置文件应该只有一个main。常位于/etc/yum.conf 中。
repository 部分定义了每个源/服务器的具体配置，可以有一到多个。常位于/etc/yum.repo.d 目录下的各文件中。
yum.conf 文件一般位于/etc目录下，一般其中只包含main部分的配置选项。
```
cat /etc/yum.conf
```
[root@centos-rpi2 ~]# `cat /etc/yum.conf`  
[main]  
cachedir=/var/cache/yum/$basearch/$releasever  
`//yum缓存目录,yum 在此存储下载的rpm 包和数据库`  
keepcache=0        
`//安装完成后是否保留软件包，0为不保留（默认为0）`  
debuglevel=2  
`//Debug 信息输出等级，范围为0-10，缺省为2`         
logfile=/var/log/yum.log  
`//yum 日志文件位置。用户可以到/var/log/yum.log 文件去查询过去所做的更新`  
exactarch=1  
`//有1和0两个选项，设置为1，则yum 只会安装和系统架构匹配的软件包，例如，yum 不会将i686的软件包安装在适合i386的系统中。默认为1。retries=6`  
obsoletes=1  
`/这是一个update 的参数，具体请参阅yum(8)，简单的说就是相当于upgrade，允许更新陈旧的RPM包。`  
gpgcheck=1  
plugins=1  
`//是否启用插件，默认1为允许，0表示不允许,我们一般会用yum-fastestmirror这个插件`  
installonly_limit=5  
`//允许保留多少个内核包`  
bugtracker_url=http://bugs.centos.org/set_project.php?project_id=23&ref=http://bugs.centos.org/bug_report_page.php?category=yum  
distroverpkg=centos-release  
`//指定一个软件包，yum 会根据这个包判断你的发行版本，默认是redhat-release，也可以是安装的任何针对自己发行版的rpm包`  

This is the default, if you make this bigger yum won't see if the metadata  
is newer on the remote and so you'll "gain" the bandwidth of not having to  
download the new metadata and "pay" for it by yum not having correct  
information.  
It is esp. important, to have correct metadata, for distributions like  
Fedora which don't keep old packages around. If you don't like this checking  
interupting your command line usage, it's much better to have something  
manually check the metadata once an hour (yum-updatesd will do this).  
metadata_expire=90m  

PUT YOUR REPOS HERE OR IN separate files named file.repo  
in /etc/yum.repos.d  

### 配置本地yum源
1、挂载系统安装光盘  
```
mount /dev/cdrom /mnt/cdrom/
```  
2、配置本地yum源
```
cd /etc/yum.repos.d/
```
```
ls
```
会看到四个repo文件  
CentOS-Base.repo 是yum 网络源的配置文件  
CentOS-Media.repo 是yum 本地源的配置文件  
修改CentOS-Media.repo
```
cat CentOS-Media.repo
```
在baseurl 中修改第2个路径为`/mnt/cdrom`（即为光盘挂载点）  
将enabled=0改为1  
3、禁用默认的yum网络源  
将yum 网络源配置文件改名为CentOS-Base.repo.bak，否则会先在网络源中寻找适合的包，改名之后直接从本地源读取。  
4、执行yum 命令
```
yum install postgresql
```
### 配置国内yum源
系统默认的yum 源速度往往不尽人意，为了达到快速安装的目的，在这里修改yum源为国内源。  
修改/etc/yum.repos.d/CentOS-Base.repo为：
```bash
# CentOS-Base.repo  
#  
# The mirror system uses the connecting IP address of the client and the  
# update status of each mirror to pick mirrors that are updated to and  
# geographically close to the client.  You should use this for CentOS updates  
# unless you are manually picking other mirrors.  
#  
# If the mirrorlist= does not work for you, as a fall back you can try the  
# remarked out baseurl= line instead.  
#  
#  
[base]  
name=CentOS-$releasever - Base - 163.com  
baseurl=http://mirrors.163.com/centos/$releasever/os/$basearch/  
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os  
gpgcheck=1  
gpgkey=http://mirror.centos.org/centos/RPM-GPG-KEY-CentOS-6  
#released updates  
[updates]  
name=CentOS-$releasever - Updates - 163.com  
baseurl=http://mirrors.163.com/centos/$releasever/updates/$basearch/  
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=updates  
gpgcheck=1  
gpgkey=http://mirror.centos.org/centos/RPM-GPG-KEY-CentOS-6  
#additional packages that may be useful  
[extras]  
name=CentOS-$releasever - Extras - 163.com  
baseurl=http://mirrors.163.com/centos/$releasever/extras/$basearch/  
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=extras  
gpgcheck=1  
gpgkey=http://mirror.centos.org/centos/RPM-GPG-KEY-CentOS-6  
#additional packages that extend functionality of existing packages  
[centosplus]  
name=CentOS-$releasever - Plus - 163.com  
baseurl=http://mirrors.163.com/centos/$releasever/centosplus/$basearch/  
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=centosplus  
gpgcheck=1  
enabled=0  
gpgkey=http://mirror.centos.org/centos/RPM-GPG-KEY-CentOS-6  
#contrib - packages by Centos Users  
[contrib]  
name=CentOS-$releasever - Contrib - 163.com  
baseurl=http://mirrors.163.com/centos/$releasever/contrib/$basearch/  
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=contrib  
gpgcheck=1  
enabled=0  
gpgkey=http://mirror.centos.org/centos/RPM-GPG-KEY-CentOS-6 
```
关于变量
$releasever：代表发行版的版本，从[main]部分的distroverpkg获取，如果没有，则根据redhat-release包进行判断。  
$arch：cpu体系，如i686,athlon等  
$basearch：cpu的基本体系组，如i686和athlon同属i386，alpha和alphaev6同属alpha。  
导入GPG KEY  
yum 可以使用gpg 对包进行校验，确保下载包的完整性，所以我们先要到各个repository站点找到gpg key,  
一般都会放在首页的醒目位置，一些名字诸如RPM-GPG-KEY-CentOS-5 之类的纯文本文件,  
把它们下载下来，然后用rpm --import RPM-GPG-KEY-CentOS-5 命令将key 导入。
执行yum 命令
### 国内其他yum源列表
其他国内yum源列表如下：

1. 企业贡献：  
搜狐开源镜像站：http://mirrors.sohu.com/  
网易开源镜像站：http://mirrors.163.com/  

2. 大学教学：  
北京理工大学：  
http://mirror.bit.edu.cn (IPv4 only)  
http://mirror.bit6.edu.cn (IPv6 only)  
北京交通大学：  
http://mirror.bjtu.edu.cn (IPv4 only)  
http://mirror6.bjtu.edu.cn (IPv6 only)  
http://debian.bjtu.edu.cn (IPv4+IPv6)  
兰州大学：http://mirror.lzu.edu.cn/  
厦门大学：http://mirrors.xmu.edu.cn/  
清华大学：  
http://mirrors.tuna.tsinghua.edu.cn/ (IPv4+IPv6)  
http://mirrors.6.tuna.tsinghua.edu.cn/ (IPv6 only)  
http://mirrors.4.tuna.tsinghua.edu.cn/ (IPv4 only)  
天津大学：http://mirror.tju.edu.cn/  
中国科学技术大学：  
http://mirrors.ustc.edu.cn/ (IPv4+IPv6)  
http://mirrors4.ustc.edu.cn/  
http://mirrors6.ustc.edu.cn/  
东北大学：  
http://mirror.neu.edu.cn/ (IPv4 only)  
http://mirror.neu6.edu.cn/ (IPv6 only)  
电子科技大学：http://ubuntu.uestc.edu.cn/  

### 使用第三方库件
Centos/RHEL默认的yum软件仓库非常有限，仅仅限于发行版本那几张盘里面的常规包和一些软件包的更新，利用RpmForge，可以增加非常多的第三方rpm软件包。RpmForge库现在已经拥有超过10000种的CentOS的软件包，被CentOS社区认为是最安全也是最稳定的一个第三方软件库。
1、安装yum-priorities插件
这个插件是用来设置yum在调用软件源时的顺序的。因为官方提供的软件源，都是比较稳定和被推荐使用的。因此，官方源的顺序要高于第三方源的顺序。如何保证这个顺序，就需要安装yum-priorities这插件了。
```
yum -y install yum-priorities
```
2、安装完yum-priorities插件后需要设置/etc/yum.repos.d/ 目录下的.repo相关文件（如CentOS-Base.repo），在这些文件中插入顺序指令：priority=N （N为1到99的正整数，数值越小越优先）
一般配置[base], [addons], [updates], [extras] 的priority=1，[CentOSplus], [contrib] 的priority=2，其他第三的软件源为：priority=N （推荐N>10）
以CentOS-Base.repo 为例：
```bash
[base]name=CentOS-$releasever - Base#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=osbaseurl=http://ftp.sjtu.edu.cn/centos/$releasever/os/$basearch/gpgcheck=1gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-5priority=1
```
3、下载与安装相应rpmforge的rpm文件包
```
wget http://pkgs.repoforge.org/rpmforge-release/rpmforge-release-0.5.2-2.el5.rf.i386.rpm

```
4、安装DAG的PGP Key
```
rpm --import http://apt.sw.be/RPM-GPG-KEY.dag.txt
```
5、验证rpmforge的rpm文件包
```
rpm -K rpmforge-release-0.5.2-2.el5.rf.*.rpm
```
6、安装rpmforge的rpm文件包
```
rpm -i rpmforge-release-0.5.2-2.el5.rf.i386.rpm
```
7、设置/etc/yum.repos.d/rpmforge.repo文件中源的级别
```
cat rpmforge.repo 
```
8、测试安装
```
yum install htop
```
参考:http://wiki.centos.org/AdditionalResources/Repositories/RPMForge#head-5aabf02717d5b6b12d47edbc5811404998926a1b

### yum参数说明
安装软件(以foo-x.x.x.rpm为例）：yum install foo-x.x.x.rpm  
yum常用命令  
删除软件：yum remove foo-x.x.x.rpm或者yum erase foo-x.x.x.rpm  
升级软件：yum upgrade foo或者yum update foo  
查询信息：yum info foo  
搜索软件（以包含foo字段为例）：yum search foo  
显示软件包依赖关系：yum deplist foo  

　　-e 静默执行   
　　-t 忽略错误  
　　-R[分钟] 设置等待时间  
　　-y 自动应答yes  
　　--skip-broken 忽略依赖问题  
　　--nogpgcheck 忽略GPG验证  
　　check-update 检查可更新的包  
　　clearn 清除全部  
　　clean packages 清除临时包文件（/var/cache/yum 下文件）  
　　clearn headers 清除rpm头文件  
　　clean oldheaders 清除旧的rpm头文件  
　　deplist 列出包的依赖  
　　list 可安装和可更新的RPM包  
　　list installed 已安装的包  
　　list extras 已安装且不在资源库的包  
　　info 可安装和可更新的RPM包 信息  
　　info installed 已安装包的信息(-qa 参数相似)  
　　install[RPM包] 安装包  
　　localinstall 安装本地的RPM包  
　　update[RPM包] 更新包  
　　upgrade 升级系统  
　　search[关键词] 搜索包  
　　provides[关键词] 搜索特定包文件名  
　　reinstall[RPM包] 重新安装包  
　　repolist 显示资源库的配置  
　　resolvedep 指定依赖  
　　remove[RPM包] 卸载包  


网站建设：[www.rsson.cn](http://www.rsson.cn "中立信网络科技")  
![中立信网络科技][rsson-logo]  

--------------------------------
[CSDN]:[http://blog.csdn.net/shuaiqijun](http://blog.csdn.net/shuaiqijun "我的博客")  
[zhihu]:[https://www.zhihu.com/people/qijun-shuai](https://www.zhihu.com/people/qijun-shuai "我的知乎，欢迎关注")  
[weibo]:[http://weibo.com/shuaiqijun](http://weibo.com/shuaiqijun "我的微博")  
 

[rsson-logo]:http://www.rsson.cn/Templates/duomi/images/logo-1.png "中立信logo"
[baidu-logo]:http://www.baidu.com/img/bdlogo.gif "百度logo"  
[weibo-logo]:/img/weibo.png "点击图片进入我的微博"  
[csdn-logo]:/img/csdn.png "我的CSDN博客"  
[foryou]:https://github.com/shuaiqijun/ImageCache/raw/master/Logo/foryou.gif 
