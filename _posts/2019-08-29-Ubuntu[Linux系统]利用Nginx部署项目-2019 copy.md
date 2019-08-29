---
layout:     post                    # 使用的布局（不需要改）
title:      Ubuntu[Linux系统]利用Nginx部署项目               # 标题 
subtitle:   不通过公司给员工的.exe一键运行软件配置Nginx #副标题
date:       2019-08-29              # 时间
author:     AhogeK                      # 作者
header-img: img/nginx.png   #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - Ubuntu
    - Nginx
---

## Step 1 - 安装 Nginx
首先第一步就是先确认以下自己的Ubuntu[Linux系统]是否安装了 Nginx
> sudo apt install nginx

安装完成后，可以通过 `` systemctl status nginx `` 确认Nginx服务状态
并且可以通过在浏览器输入 `` http://localhost | 127.0.0.1 ``看到如下页面：<br>
![page](/img/default_page.png)
这样你就完成第一步啦！<br>
*注：可能会出现因防火墙或Proxy代理的原因无法看到此页面，可以通过[Step 2 - Adjusting the Firewall](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04-quickstart)该网站第二步解决*

## Step 2 - 拷贝文件
这一步，首先你要知道，当你完成第一步时，在你Ubuntu[Linux系统]中有 /etc/nginx 这样一个文件夹，而在这个文件夹中就有*nginx.conf*文件。但如何详细配置该文件不是我们今天主题。如果想 *不通过公司给员工的.exe一键运行软件配置Nginx* 当你下载下公司前端项目时，伴随着.exe文件还会有一个配置文件夹，里面就会有在/etc/nginx中也有的文件<br>
![page](/img/Screenshot&#32;from&#32;2019-08-29&#32;20-39-34.png)
你就可以右键在终端中打开通过键入
> sudo cp -rf * /etc/nginx

将此文件夹中的所有文件转至 /etc/nginx
**强烈建议先将/etc/nginx中的所有文件备份一份**

## Step 3 - 修改nginx.conf文件
那么就迎来了最后一步，大家可以通过 vim gedit 之类的文本编辑文件打开nginx.conf文件，首先你会看到：
![page](/img/Screenshot&#32;from&#32;2019-08-29&#32;20-46-18.png)
在 ``server{}``包裹中 一个是 listen 主要是最后进入前端页面的监听端口；而 server_name 是端口号前的域名地址，此处就是本地地址。
而我们要修改的地方即是
![page](/img/Screenshot&#32;from&#32;2019-08-29&#32;20-52-38.png)
在```location / {}``中，其中 *root* 代表网站根目录，而 *index* 指根目录下首页的地址
在公司下载下的项目中，这里一般填的是相对路径，因为.exe文件就会在项目中，我这边就直接将root根目录修改成*绝对路径*即可

**最后即可在浏览器中输入 ``http://server_name:listen/targetPage``访问了！**
