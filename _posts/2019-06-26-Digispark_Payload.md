---
layout:     post
title:      翻译ducky_payload
subtitle:   关于如何翻译ducky的payload
date:       2019-06-26
author:     HY
header-img: img/ducky_payload.png
music-id:   28405261
catalog: true
tags:
    - Blog
    - Digispark
---


# 前言
###### _**~~新人写blog,见笑了~~**_
>**上一篇关于[Digispark](https://mhycdh.github.io/2019/06/25/Digispark)的使用中讲述了Digispark的开篇,下面是使用一些已有的有效payload**

## 将Ducky上使用的语言转换为DigiSpark使用
- **当我们把上期的Digispark弄好之后,我们就可以开始自己编写了**
- **但是相对于ducky的语法而言,在Arduino上编写的要麻烦一点,但是现在可以用这个方法将ducky编写的payload翻译过来,所以我们只要懂得编写ducky的脚本就好了**
- **看回咱们上一期打开的ArduinoIDE界面**
![ArduinoIDE](https://raw.githubusercontent.com/MHYCDH/MHYCDH.github.io/master/img/digispard/Arduinoide.png "ArduinoIDE")
>依旧是简洁的界面,但是暂时还用不到

>我们可以在GitHub上找到duckyUSB的paload->[传送门](https://github.com/hak5darren/USB-Rubber-Ducky/wiki/Payloads)<-

**关于烧写的步骤我在上一篇已经有写过教程了,下面咱们开始讲解如何将duckyUSB平台的语言翻译为ArduinoIDE识别的语言**
## 步骤一:
#### 搭建python环境
**进入到下载Python的[官网](https://www.python.org/downloads/)选择你电脑对应的系统版本(Windows/mac OS/Linux等等),您可以跳转到[python安装教学](http://www.runoob.com/python/python-install.html)里查找你要安装的系统和方法,下面就不细说安装方法了(,,•́ . •̀,,)**
## 步骤二:
#### 下载DuckySpark
**第一个步骤的python环境搭建好后,在终端(Terminal)或cmd当中输入python就可以看到python的版本并且可以使用python了**
![python3](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispark2/Python3.png?raw=true "python3")
>![pikaqiu](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispark2/pikaqiu.png?raw=true)
- 来打印一只皮卡丘看看效果 

**咳咳,扯远了,python可以使用之后,咱们进入到Duckyspark的[GitHub页面](https://github.com/MHYCDH/MHYCDH.github.io/tree/master/img/digispark2)**
![duckyspark](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispark2/duckyspark.png?raw=true "duckyspark")
>*点击绿色框的**clone or download**之后,点击**Download Zip**,它就会下载到电脑里.当然,我这里也提供了*->[下载链接](https://github.com/toxydose/Duckyspark/archive/master.zip)<-
>>当然还有另一种,如果您的电脑上安装了git bash,或者您使用的是Linux系统,可以采用命令行的型式下载

`git clone https://github.com/toxydose/Duckyspark.git`

`unzip Duckyspark-master.zip`(解开压缩包)

>当我们下载并解压完成之后,就可以开始使用了(..•˘_˘•..)

## 步骤三:
#### 使用方法

>**我把解压的文件夹放在了这个目录里**
>![目录](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispark2/mulu.jpeg?raw=true)
>此时我们把在ducky上现有的[payload](https://github.com/hak5darren/USB-Rubber-Ducky/wiki/Payloads)随便找一个然后复制下来,在Duckyspark-master文件夹当中新建一个txt文件用来保存复制的指令

>我复制了一份然后保存到crack.txt文件当中
>![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispark2/mulu2.jpeg?raw=true)


>**打开命令行界面(Windows下是输入Win+R之后输入cmd,在Linux下是CTRL+SHIFT+T),下面就用windows来演示**

>我的cmd
![mycmd](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispark2/webwxgetmsgimg.jpeg?raw=true "mycmd")

**从我解压的目录中可以看出,该目录的文件路径应该为
F:\Duckyspark-master**
>接下来我们用**python**来转换它(**crack.txt**),根据duckyspark的使用方法, 我在cmd或者Terminal终端当中这样输入
![terminal](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispark2/terminal.jpeg?raw=true)
(每个方框之间用空格隔开)

>按回车显示 success !之后,咱们再来看看文件目录
![mulu](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispark2/mulu3.jpeg?raw=true)
**文件生成成功!**

**这时您可以右键点击它,选择用ArduinoIDE打开,就可以使用翻译完成的代码啦( •̀ .̫ •́ )✧**

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/hardwork/gif/tenor%20(5).gif?raw=true)
