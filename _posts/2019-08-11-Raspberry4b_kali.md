---
layout:     post
title:      树莓派4b安装kali及配置
subtitle:   终于能在树莓派上体验一把啦
date:       2019-08-11
author:     MHYCDH
header-img: img/19-08-11/title.png
catalog: true
tags:
    - Raspberry pi
    - kali-linux
---

#前言
>这个月初,我的树莓派4到手了,本来还以为它性能很一般(**!真香警告!**),这次我就直接拿它上手"kali-linux"了

**废话少说,给朕上图!**

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/1.jpg?raw=true)

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/2.jpg?raw=true)

>不要问为什么用胶布缠着,有块亚克力坏了...

## 刷系统

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/18.jpg?raw=true)

事先准备好**读卡器**和**SD卡(内存卡)**.树莓派支持读取内存卡中的系统(相当于硬盘),所以我去下载了[kali-linux树莓派版本](https://www.offensive-security.com/kali-linux-arm-images/).这里我选择了树莓派4的32位系统,64位的估计后续会出.

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/3.PNG?raw=true)

下载好之后,是一个后缀名位img.xz的文件,这个其实是个[镜像文件](https://baike.baidu.com/item/%E7%B3%BB%E7%BB%9F%E9%95%9C%E5%83%8F%E6%96%87%E4%BB%B6/9553925)的压缩包,需要将它解压出来,才是个完整的镜像文件.

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/4.PNG?raw=true)
>正确解压出来之后应该是酱紫


准备好镜像文件后,将SD卡插入读卡器,读卡器插入PC的USB串口,开始读卡.

PC端我们也要准备好工具,就是这款[**win32diskimager**](https://sourceforge.net/projects/win32diskimager/)的磁盘镜像工具

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/5.jpg?raw=true)
>长这样,也有中文版的

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/6.PNG?raw=true)


我以中文版为例,我们的映像文件选择我们解压出来的镜像文件.(对,就是那个4.6G的).设备选择我们正在读的SD卡(这个你可以根据容量的大小判断,只不过一般都可以看得出.)这时,我们选择**写入(write)**.等待进度条到100%.系统就写入成功了.

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/7.gif?raw=true)

**注意事项(踩坑记录)**:我用的是闪迪的SD卡,16G,也有32G的,只不过没关系,容量都是够的.但是刷系统嘛,有时候也会出现一些"**惊喜**".

就比如开机失败了
![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/8.jpg?raw=true)

又或者更麻烦的一点:你刷错系统了
![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/9.jpg?raw=true)

这时,你可能就有点难受了,也不清楚该怎么办,你很可能想把SD卡重新清掉,再刷一遍,但是如果**你不知道怎么把它(系统)干掉**.

这时候你就需要另一个工具**DiskGenius**

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/10.png?raw=true)

选择你的SD卡,注意不要选错哦,选错的后果很严重

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/11.PNG?raw=true)
>清除扇区数据,这个会彻底把SD卡清干净,所以如果有重要的资料,还是备份出来才好

清除完毕后,就可以重新再刷一遍了.

## 配置

开机出现了这个画面,表示我的kali-linux已经成功刷进去了.

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/12.jpg?raw=true)

因为树莓派4采用了千兆网卡,连接wifi能够更加稳当.(开始香了???)

然后看了看屏幕,看来没有支持**1366x768**分辨率嘛(有点难受)
![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/13.jpg?raw=true)


结果看了一下display,分辨率只有**1184x624**(更加奇葩的分辨率???)刷新率居然是**0.0Hz**,实在搞不明白...

算了,这个再看看怎么调,这个从官网下载的树莓派4kali系统默认是英文,也就是说,它的位置锁定在了**US**,所以不管是网页,设置还是终端等等,也一律全是English.另外,用的是XFCE桌面,作为Gnome的老用户,怎么会接受呢?我们先做这件事先->[kali配置中文以及中文输入法](https://www.jianshu.com/p/933625646dc8)

#### 更换源

在终端输入
```
root@kali:~# vim /etc/apt/sources.list

deb http://http.kali.org/kali kali-rolling main non-free contrib
deb-src http://http.kali.org/kali kali-rolling main non-free contrib

#中科大
deb http://mirrors.ustc.edu.cn/kali kali-rolling main non-free contrib
deb-src http://mirrors.ustc.edu.cn/kali kali-rolling main non-free contrib
 
#aliyun
deb http://mirrors.aliyun.com/kali kali-rolling main non-free contrib
deb-src http://mirrors.aliyun.com/kali kali-rolling main non-free contrib
 
#清华
deb http://mirrors.tuna.tsinghua.edu.cn/kali kali-rolling main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/kali kali-rolling main contrib non-free
 
#浙大
deb http://mirrors.zju.edu.cn/kali kali-rolling main contrib non-free
deb-src http://mirrors.zju.edu.cn/kali kali-rolling main contrib non-free
```
最好先查询下**Vim**的用法才更好的食用哦.

#### 更新源
```
apt-get update
apt-get upgrade
```

这个是用来安装kali的所有工具包的命令,建议**空间充足**的同学装.

`apt-get install kali-linux-full`

然后是安装**字体**

`apt-get install ttf-wqy-zenhei`

**配置区域**

`dpkg-reconfigure locales`

在选项中寻找以下几样
```
[*] en_US.UTF-8 UTF-8 
[*] zh_CN.GBK GBK
[*] zh_CN.UTF-8 UTF-8
```

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/15.jpg?raw=true)

用空格选择,选择完成后,按`TAB`键切换到`选择(select)`键.

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/14.jpg?raw=true)

这里我们选择`zh_CN.UTF-8`

#### 安装输入法

`apt-get install fcitx fcitx-googlepinyin fcitx-module-cloudpinyin fcitx-sunpinyin`

重启后就能看到汉化的桌面了
```
reboot
或者
init 6
```
![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/16.jpg?raw=true)

关于xfce更多的主题,可以到 xfce-look.org 查找.

## 结语

初步配置已经完成,如果条件允许,你也可以看看NullByte在Youtube发布的视频 <<[The Top 10 Things to Do After Installing Kali Linux on Your Computer](https://www.youtube.com/watch?v=8VL0K0rFgxw&t=410s)>>

**最后**

~~别拦我,我要用树莓派超频!!!~~
![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/19-08-11/17.gif?raw=true)
