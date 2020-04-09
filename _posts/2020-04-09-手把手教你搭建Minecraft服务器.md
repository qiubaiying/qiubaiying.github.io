---
layout:     post
title:      手把手教你搭建Minecraft服务器
subtitle:   23333
date:       2020-04-09
author:     Cyorage凌曦
header-img: 
catalog: true
tags:
    - 技术
    - Minecraft
---

1.需要的材料  
服务器*1(硬盘建议10G以上，内存2GB或以上，带宽2M或以上)  
一台电脑(用于配置与玩)  
一颗敢于为此折腾的心  
没了  
2.需要的文件  
PaperSpigot Minecraft 1.12.2的服务端内核 下载链接:[点我下载](https://www.lanzous.com/ib470cj)  
eula.txt(可下可不下，主要是用来同意协议，可以自己创建) :[点我下载](https://www.lanzous.com/ib46zij)  
Filezilla(用于管理远程服务器的文件):[点我下载](https://www.lanzous.com/ib497lc)  
没了  
3.服务器的配置  
这个教程以CentOS 7.2为例。   
通过ssh连接到服务器，就像下图。
![我是图片](https://s1.ax1x.com/2020/04/08/GWn27j.png)  
登录到root账户，安装Java与Screen.  
在终端输入`yum install java`,稍微等待。  
在询问是否确认时，输入y，按下回车。  
安装Screen时，输入`yum install screen`，安装过程同上。  
因为我的服务器都已安装这些东西，就不上图了。  


现在，我们需要通过sftp上传核心文件。  
安装Filezilla，打开它。就像下图。  
![我是图](https://s1.ax1x.com/2020/04/08/GWQOsK.png)  
我一般习惯把核心丢到home目录里，并且给它们设置一个文件夹。  
打开Filezilla，链接到服务器。  
![我是图](https://s1.ax1x.com/2020/04/08/GW197F.png)  
上图中的主机填入你的服务器的IP或域名，账号一般为root，密码为当前账户的密码，端口一般为ssh的端口22.  
在/home新建一个名为mc的文件夹，将内核与eula放入其中。  
可以直接从资源管理器拖拽进去。  
一切就绪之后，就可以把FileZilla关掉了。  
PS：另一种同意eula的方式：新建一个eula.txt文件，在里面输入`eula=true`，保存，搞定。  

4.开始  
打开一个新的screen窗口，在终端中输入`Screen`。  
![我是图](https://s1.ax1x.com/2020/04/09/G4fpT0.png)  
切换到存放MC服务端的目录(命令为`cd 路径`)，输入以下命令。  
`java -Xms1G -Xmx1G -jar PaperSpigot-1.12.2-b1581.jar nogui`  
其中的Xms代表java虚拟机堆区内存初始内存分配的大小，Xmx代表java虚拟机堆区内存可被分配的最大上限，一般两个都为1G即可。  
-jar后面空格代表文件名，命令后面的nogui代表不显示Gui界面，这样会省下一些内存空间。  
敲下回车，没有问题的话就会正常开始加载。像下图一样。  
![我是图](https://s1.ax1x.com/2020/04/09/G4oQQU.png)
打开游戏，点击多人游戏，点击直接连接，输入`端口号:25565`，没有意外情况即可链接。  
PS:若要修改端口号等配置，请详见[https://minecraft-zh.gamepedia.com/Server.properties](https://minecraft-zh.gamepedia.com/Server.properties)  
PS2:在Linux的一个shell下，如果直接关闭当前shell，那么当前shell所运行的程序将会被杀死。  
所以，这就是我们为什么需要screen来搭建的原因。  
在前面，我们已经把MC服务端运行在了screen中，所以只要按下Ctrl+a d(即为一直按住Ctrl，随后按下a后快速松手并按下d)即可退出shell，就可以放心的关闭ssh窗口了.  

大功告成！
