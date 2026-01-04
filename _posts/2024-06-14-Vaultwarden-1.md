---
layout:     post
title:      Vaultwarden功能完善与数据安全
subtitle:   安全很重要！
date:       2024-06-14
author:     Pockies
header-img: img/cx9xMiM2MJ2NNm97qUxAfk-1200-80.png
catalog: true
tags:
    - 安全
---

转载 . 留档 . 自用：https://post.smzdm.com/p/am3w69q4/


Vaultwarden是一款开源的密码管理器，是使用Rust 编写的非官方Bitwarden [服务器](https://www.smzdm.com/fenlei/fuwuqi/)实现，它提供了强大的密码管理功能，并支持多种客户端和浏览器插件。

由于其强大的功能及方便的部署，在zdm上有大量的搭建教程，是NAS玩家密码管理器的不二选择。作为在什么值得买较早发布bitwarden-rs(现vaultwarden)自建服务的五年资深玩家。也想在此分享一些使用经验来完善我们的使用体验和加强数据安全。

# 数据实时同步功能

作为多客户端的密码管理软件，你肯定也遇到过这样的问题。在[电脑](https://www.smzdm.com/ju/sp4x11p/)上刚新建完成的账号在[手机](https://www.smzdm.com/fenlei/zhinengshouji/)上没有更新出来，需要手动点击立即同步按钮或者下拉刷新一下密码库。那么如何让我们的密码数据在多客户端上实时更新呢

## **启用 WebSocket 通知（桌面和浏览器扩展客户端）**

对于桌面和浏览器扩展客户端，可以开启Websocket功能确保客户端之间的实时同步。以下是官方关于WebSocket的简介：

> WebSocket 通知用于将发生的一些相关事件通告给浏览器、Bitwarden 的桌面和浏览器扩展客户端，例如密码数据库中有条目被修改了或被删除了。收到通知后，客户端可以采取适当的操作，例如刷新已修改的条目，或从其本地缓存中移除已删除的条目。在此通知方案中，Bitwarden 客户端与 Bitwarden 服务器（在本案例中为 Vaultwarden）建立持久的 WebSocket 连接。每当服务器有需要报告的事件时，它都会通过此持久连接将其发送给客户端。

一些仔细的朋友会发现在启动Vaultwarden的镜像时会发现默认会有80和3012两个端口需要映射，其中3012端口就是websocket端口。对于老版本，我们需要设置WEBSOCKET\_ENABLED=true来开启websocket功能。而自Vaultwarden v1.29.0版本起，websocket默认为开启状态，并且已经集成到80端口中（为保证兼容性3012端口仍能使用）。

除了开启功能外，对于反向代理的用户，我们需要正确配置反向代理以传递 WebSocket `Upgrade` 和 `Connection` 标头。以[群晖](https://pinpai.smzdm.com/2315/)的反向代理为例子，在编辑反向代理规则时需要切换到自定义标题处，点击新增，WebSocket按钮后点击保存即可。

![](/img/6611357ebed0487.jpg)

其他反代可以参考[这里](https://rs.ppgg.in/deployment/proxy-examples "这里")。

## **启用[移动](https://www.smzdm.com/ju/s99xlkk/)客户端推送通知（安卓和iOS）**

从Vaultwarden 1.29.0版本开始，可以启用移动客户端的推送通知，在移动应用程序、网页扩展程序和网页密码库之间自动同步您的个人密码库，而无需手动同步。

+   访问 [https://bitwarden.com/host/](https://bitwarden.com/host/ "https://bitwarden.com/host/")，输入您的电子邮件地址，数据地区选择美国，然后您将获得一个INSTALLATION ID和KEY。
    
+   在你的docker-compose.yaml中添加以下环境变量
    

> environment:
> 
> \- PUSH\_ENABLED=true
> 
> \- PUSH\_INSTALLATION\_ID=获得的id
> 
> \- PUSH\_INSTALLATION\_KEY=获得的key

如果在上一步中请求了 `bitwarden.eu（欧盟）`，还必须设置

> \- PUSH\_RELAY\_URI=[https://push.bitwarden.eu](https://push.bitwarden.eu/ "https://push.bitwarden.eu")
> 
> \- PUSH\_IDENTITY\_URI=[https://identity.bitwarden.eu](https://identity.bitwarden.eu/ "https://identity.bitwarden.eu")

+   添加完成后重启容器即可。
    
+   测试时可以使用多客户端进行验证。
    

# 浏览器插件使用移动设备登陆

浏览器插件每次登陆Vaultwarden还在使用长长的主密码？其实通过设置完全可以实现用移动设备登陆。

+   打开手机客户端->设置->账户安全->打开使用此设备批准来自其他设备的登陆请求
    

![](/img/661160ce1aa5783.jpg)

+   打开浏览器插件，设置，将密码库超时动作设置为注销。
    

![](/img/6611622a553ea8365.jpg)

+   关闭浏览器，重新登陆，此时你将看到登陆时多了使用设备登陆的选项。点击后手机客户端会弹出相关的登陆请求页面，在确认指纹短语一致后点击确认登陆即可。
    

![](/img/66116477317c0605.jpg)

# 关于数据安全

+   设置`SIGNUPS\_ALLOWED=false`，在完成新用户注册后第一时间设置禁止新用户注册。
    
+   设置`INVITATIONS\_ALLOWED=false`，禁用邀请。
    
+   设置`WEB\_VAULT\_ENABLED=false`，禁用web页面，减小暴露面。禁用后访问web页面会报404，不影响客户端使用但是影响send功能。
    
+   有条件的话接入cloudflare。开启小黄云代理模式，并自定义一些规则比如禁止国外ip访问。
    
+   养成定期备份数据习惯，要有异地备份。不要本身跑在nas上还备份在nas上，nas一挂直接火葬场。
    
+   备份不要套娃，备份在云端，密码保存在vaultwarden。挂了连云端的密码都不知道，如何取回备份。
