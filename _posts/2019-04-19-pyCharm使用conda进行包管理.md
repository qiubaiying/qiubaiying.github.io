---
layout:     post
title: PyCharm 使用 conda 进行包管理
subtitle: 
date: 2019-04-19
author: Bend
header-img: img/post-bg-pycharm.jpg
catalog: true
tags:
    - PyCharm
    - conda
    - Anaconda
---
>写在开头:最简单的方法在文章最末尾,[点击这里](#jump)

关于使用conda进行包管理的优点不进行展开,本文直接对步骤进行说明

## 使用 conda 创建虚拟环境

这里我们介绍两种创建虚拟环境的方法,建议采用图形化方式创建,简单明了.

### 图形化创建虚拟环境

打开 Anaconda Navigator 后, 点击Environments
![img](https://i.loli.net/2019/04/19/5cb9742b757f4.png)
选择 creat
![img](https://i.loli.net/2019/04/19/5cb9747655e7d.png)
在弹出的窗口中选择 Python 版本及名称,再点击 Creat ,等待一段时间,名为 test 的环境就创建好了.
![img](https://i.loli.net/2019/04/19/5cb975026dc6b.png)

### 命令行创建虚拟环境

打开 Anaconda Prompt ,输入命令

```cmd
conda create -n learn python=3
```

这里我们创建了名称为 learn 的虚拟环境, 并指定 Python 的版本为3.
![img](https://i.loli.net/2019/04/19/5cb97839ab7bb.png)
随后输入 y 回车,环境就创建好了.

## PyCharm 创建工程

### 创建工程

>我的 PyCharm 有些汉化,若有出入,请自行鉴别

![img](https://i.loli.net/2019/04/19/5cb97a3d62690.png)
![img](https://i.loli.net/2019/04/19/5cb97b63b252f.png)
![img](https://i.loli.net/2019/04/19/5cb97ba75c988.png)
![img](https://i.loli.net/2019/04/19/5cb97caf11f2b.png)
![img](https://i.loli.net/2019/04/19/5cb97ccf0666b.png)

选择 python 位置:创建的虚拟环境中的python路径为安装 Anaconda3的目录中envs文件夹下,名为test的文件夹中的python.exe文件.

以下为我的路径,仅供参考
E:\Anaconda3\envs\test\python.exe

确定之后,一个新的工程就建好了.

至此,关于 PyCharm 使用 conda 虚拟环境的部分就结束了.
使用 conda 来进行包管理将在后续更新.

<span id="jump"> **简易方法**</span>
>写完本文后发现了更简单的方法
![img](https://i.loli.net/2019/04/19/5cb98170107cb.png)
创建新工程时选用 conda ,并且将项目名改好后,就可以直接创建啦!


注意:**创建的工程名不能和旧有的虚拟环境名相同**

***Enjoy!***