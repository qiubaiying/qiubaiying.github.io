---
layout:     post
title:      Centos7下ShadowSocks-server的安装配置
subtitle:   Centos7 ShadowSocks-server
date:       2017-10-11
author:     Shuaiqijun
header-img: img/blog1.jpg
catalog: true
tags:
    - Centos
    - ShadowSocks
---

ShadowSocks
===========================
CentOS7 开始默认使用Systemd作为开启启动脚本的管理工具，Shadowsocks则是当前比较受欢迎的科学上网工具，本文将介绍如何在 CentOS 下安装和配置 Shadowsocks 服务。  
******  
Author:Shuaiqijun  
E-mail:42687880@qq.com  
******  
## 安装pip
pip是 python 的包管理工具。在本文中将使用 python 版本的 shadowsocks，此版本的 shadowsocks 已发布到 pip 上，因此我们需要通过 pip 命令来安装。  

在控制台执行以下命令安装 pip:  
```
curl "https://bootstrap.pypa.io/get-pip.py" -o "get-pip.py"$ python get-pip.py
```

[root@centos-rpi2 ~]# `curl "https://bootstrap.pypa.io/get-pip.py" -o "get-pip.py"$ python get-pip.py`     
### 安装shadowsocks
```
pip install --upgrade pip$ pip install shadowsocks
```  
### 配置shadowsocks
安装完成后，需要创建配置文件/etc/shadowsocks.json，内容如下：  
```json
{ 
	"server":"0.0.0.0", 
	"server_port":8388, 
	"password":"uzon57jd0v869t7w", 
	"method":"aes-256-cfb"
}
```  
说明：  
	`method` 为加密方法，可选aes-128-cfb, aes-192-cfb, aes-256-cfb, bf-cfb, cast5-cfb, des-cfb, rc4-md5, chacha20, salsa20, rc4, table  
	`server_port` 为服务监听端口  
	`password` 为密码，可使用密码生成工具生成一个随机密码  
	以上三项信息在配置 shadowsocks 客户端时需要配置一致，具体说明可查看 shadowsocks 的帮助文档。
### 配置shadowsocks-server自启动
新建启动脚本文件/etc/systemd/system/shadowsocks.service，内容如下：  
```bash
[Unit]Description=Shadowsocks  
[Service]TimeoutStartSec=0  
ExecStart=/usr/bin/ssserver -c /etc/shadowsocks.json  
[Install]WantedBy=multi-user.target
```   
执行以下命令启动 shadowsocks 服务：
```  
systemctl enable shadowsocks$ systemctl start shadowsocks 
``` 
为了检查 shadowsocks 服务是否已成功启动，可以执行以下命令查看服务的状态：
```  
systemctl status shadowsocks -l 
``` 
如果服务启动成功，则控制台显示的信息可能类似这样：  

shuaiqijundeMacBook-Pro:~ shuaiqijun$ ssh root@150.95.132.191  
root@150.95.132.191's password:   
Last failed login: Wed Oct 11 17:47:45 JST 2017 from 123.207.119.252 on ssh:notty  
There were 160309 failed login attempts since the last successful login.  
Last login: Fri Oct  6 11:49:26 2017 from 61.184.141.16  
[root@150-95-132-191 ~]# systemctl status shadowsocks -l  
● shadowsocks.service - Shadowsocks  
   Loaded: loaded (/etc/systemd/system/shadowsocks.service; enabled; vendor preset: disabled)  
   Active: active (running) since Sat 2017-08-26 23:45:13 JST; 1 months 15 days ago  
 Main PID: 1016 (ssserver)  
   CGroup: /system.slice/shadowsocks.service  
           └─1016 /usr/bin/python /usr/bin/ssserver -c /etc/shadowsocks.json  

Oct 11 17:42:48 150-95-132-191 ssserver[1016]: 2017-10-11 17:42:48 INFO       
connecting www.baidu.com:80 from 122.190.174.243:55488  
Oct 11 17:42:49 150-95-132-191 ssserver[1016]: 2017-10-11 17:42:49 INFO       
connecting www.google.com.hk:80 from 122.190.174.243:55552  
Oct 11 17:43:58 150-95-132-191 ssserver[1016]: 2017-10-11 17:43:58 INFO       
connecting www.baidu.com:80 from 122.190.174.243:56448  
Oct 11 17:43:59 150-95-132-191 ssserver[1016]: 2017-10-11 17:43:59 INFO       
connecting www.google.com.hk:80 from 122.190.174.243:56512  
Oct 11 17:45:08 150-95-132-191 ssserver[1016]: 2017-10-11 17:45:08 INFO       
connecting www.baidu.com:80 from 122.190.174.243:49792
Oct 11 17:45:08 150-95-132-191 ssserver[1016]: 2017-10-11 17:45:08 INFO       
connecting www.google.com.hk:80 from 122.190.174.243:49856  
Oct 11 17:46:17 150-95-132-191 ssserver[1016]: 2017-10-11 17:46:17 INFO       
connecting www.baidu.com:80 from 122.190.174.243:49856  
Oct 11 17:46:18 150-95-132-191 ssserver[1016]: 2017-10-11 17:46:18 INFO       
connecting www.google.com.hk:80 from 122.190.174.243:50050  
Oct 11 17:47:27 150-95-132-191 ssserver[1016]: 2017-10-11 17:47:27 INFO      
connecting www.baidu.com:80 from 122.190.174.243:53568  
Oct 11 17:47:29 150-95-132-191 ssserver[1016]: 2017-10-11 17:47:29 INFO       
connecting www.google.com.hk:80 from 122.190.174.243:53825   



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
