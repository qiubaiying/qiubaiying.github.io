---
layout:     post
title:      MSFVENOM SHELLCODE生成
subtitle:   MSFVENOM 生成 SHELLCODE
date:       2019-04-26
author:     BugMan
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - msf
    - 渗透测试
---
# WinRM服务
    WinRM全称是Windows Remote Management，是微软服务器硬件管理功能的一部分，能够对本地或远程的服务器进行管理。WinRM服务能够让管理员远程登录Windows操作系统，获得一个类似Telnet的交互式命令行shell，而底层通讯协议使用的是HTTP。
# 开启WinRM服务
在Windows 2012以上的服务器操作系统中，WinRM服务默认启动并监听了5985端口，可以省略这一步。
对于Windows 2008来说，需要使用命令来启动WinRM服务，快速配置和启动的命令是

`winrm quickconfig -q`这条命令运行后会自动添加防火墙例外规则，放行5985端口。

    新增80端口Listener对于原本就开放了WinRM服务的机器来讲，需要保留原本的5985端口listener，同时需要新增一个80端口的listener，这样既能保证原来的5985端口管理员可以使用，我们也能通过80端口连接WinRM。
## 使用下面这条命令即可新增一个80端口的listener
`winrm set winrm/config/service @{EnableCompatibilityHttpListener="true"}`
对于安装Windows 2012及以上版本操作系统的服务器来讲，只需要这一条命令即可实现端口复用。
本地配置
本地需要连接WinRM服务时，首先也需要配置启动WinRM服务，然后需要设置信任连接的主机，执行以下两条命令即可。
`winrm quickconfig -q`
`winrm set winrm/config/Client @{TrustedHosts="*"}`
### 连接使用
使用winrs命令即可连接远程WinRM服务执行命令，并返回结果
`winrs -r:http://www.baidu.com -u:administrator -p:Passw0rd whoami`
上述命令会在远程机器上执行whoami命令，获取结果后直接退出。
### Hash登录
  系统自带的winrs命令登录时需要使用明文账号密码，那很多场景下尤其是windows 2012以后，经常只能抓取到本地用户的hash，无法轻易获得明文密码。因此需要实现一款支持使用NTLM hash登录的客户端，使用python来实现不难。
### 参考资料
https://github.com/diyan/pywinrm
https://github.com/zenoss/txwinrm
