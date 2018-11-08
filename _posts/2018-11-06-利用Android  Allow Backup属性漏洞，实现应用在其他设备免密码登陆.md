---
layout:     post
title:      利用Android  Allow Backup属性漏洞，实现应用在其他设备免密码登陆。
subtitle:   Android渗透测试
date:       2018-11-06
author:     黄秋豪
header-img: img\post-bg-ios9-web.jpg
catalog: true
tags:
    - Allow Backup
    - Android 

---
好几个月没有写文章了，因为确实比较忙，最近一直不断研究APP渗透测试（Andriod软件测试，IOS软件测试还在学习），也学习了许多知识，当然知识固然重要，如何成为自己知识体系中的一部分还是自己要不断学习思考的，很多学习安全的同学在做渗透测试的时候不知道如何开始，个人认为一定先要学会一个大致体系，依据体系来学习，但是时间不能过长，因为学是学不完的，一定要在不断的实践中总结各种知识和方法，成为自己的经验，才能做到学有所获，学有所长。扯远了，因为老是有人催我学习，所以今天我们主要来学习APP渗透测试中的一点，我们将通过实验来学习并了解Allow Backup属性在APP中的利用方法和危害以及解决方法。

1、allowBackup  概念

Android 的属性 allowBackup 安全漏洞来自 adb backup 允许任何一个能够打开 USB 调试开关的设备都能从Android 手机中复制整体的的应用数据到其他设备，应用数据被备份之后，所有应用数据都可被读取。既然可被备份，那么就可以被读取，adb restore 容许用户指定一个恢复的数据来恢复应用程序数据的创建。所以，当任何一个应用数据被备份之后，用户即可在另外一个Android 手设备上安装同一个应用，并通过恢复该备份的应用数据到该设备上，该应用即可恢复到被备份的应用程序的状态。实现账号免登陆的目的。

2、ADB命令

Android软件开发工具包。被软件开发工程师用于为特定的软件包、软件框架、硬件平台、操作系统等建立应用软件的开发工具的集合里的一个工具, 用这个工具可以直接操作管理android模拟器或者真实的andriod设备。

3、allowBackup 影响范围

Android API Level 8 以及以上系统。

4、allowBackup 安全漏洞识别

allowBackup 风险触发前提条件：未将 AndroidMannifest.xml 文件中的 android:allowBackup 属性值设为 false 

allowBackup 风险位置：AndroidMannifest.xml 文件中的代码：android:allowBackup=true

5、实验环境

apktool 
测试的APP（由于各种原因，不公开测试APP）
andriod 模拟器

6、首先对测试APP进行反编译，查看AndroidMannifest.xml中的allowBackup是否为true，使用apktool进行反编译。
![1.jpg](https://github.com/huangqiuhao/huangqiuhao.github.io/blob/master/img/1.jpg?raw=true)

反编译完成，得到测试APP的目录结构。

![2.png](https://github.com/huangqiuhao/huangqiuhao.github.io/blob/master/img/2.png?raw=true)

7、编辑查看AndroidMannifest.xml，定位漏洞代码（标红处为true）

![3.jpg](https://github.com/huangqiuhao/huangqiuhao.github.io/blob/master/img/3.jpg?raw=true)

8、进入模拟器执行adb命令:首先检查设备是否在线：adb devices  第一个红框为Android studio模拟器默认目录。第二个为有一个设备在线。如果设备为offline，使用命令：adb  kill-server接着执行adb  start-server即可。
![4.jpg](https://github.com/huangqiuhao/huangqiuhao.github.io/blob/master/img/4.jpg?raw=true)

随后执行adb  shell进入设备，可以看到我们已经进入模拟器

![5.jpg](https://github.com/huangqiuhao/huangqiuhao.github.io/blob/master/img/5.jpg?raw=true)

7、开始备份Apk，执行命令adb backup -nosystem -apk -f com.heoll.ha.ab com.heoll.ha这是出现备份密码，不设置点击BACK MY  DATA即可。
![9.jpg](https://github.com/huangqiuhao/huangqiuhao.github.io/blob/master/img/9.jpg?raw=true)

开始备份
![12.png](https://github.com/huangqiuhao/huangqiuhao.github.io/blob/master/img/12.png?raw=true)

备份完成
![11.jpg](https://github.com/huangqiuhao/huangqiuhao.github.io/blob/master/img/11.jpg?raw=true)

8、恢复备份的数据，执行命令：adb  restore  com.xxxx.xxxx.ab  点击:RESTORE  MY DATA即可。
![13.png](https://github.com/huangqiuhao/huangqiuhao.github.io/blob/master/img/13.png?raw=true)
开始恢复
![14.png](https://github.com/huangqiuhao/huangqiuhao.github.io/blob/master/img/14.png?raw=true)

等一会后，设备上会自动出现之前备份的APP，打开后直接就是账号密码（自己练习时可以注册登录）登陆过后的状态。这样的属性设置是十分危险的，而且对于用户来说，会直接造成危险。这个漏洞现在并不太常见，但是在一些没有做过安全防护的APP和没有安全开发流程的软件厂商中，这个漏洞依然会存在，是我们关注的重要的一个问题点。
由于隐私和法律问题，APP不公开，需要请联系邮箱。
原创文章，转载请联系：whuangqiuhao@outlook.com






