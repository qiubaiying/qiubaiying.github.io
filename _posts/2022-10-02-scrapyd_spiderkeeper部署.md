---
layout:     post
title:      scrapyd 和 spiderkeeper 的部署和使用
subtitle:   windows下的安装、部署、以及使用方法
date:       2022-10-02
author:     BY Magicsmx
header-img: img/spider.jpg
catalog: true
tags:
    - scrapy
    - 爬虫
---

## 前言

scrapy和scrapy-redis项目可以部署在scrapyd服务器中，我们可以通过scrapyd提供的接口访问web主页。
而spiderkeeper和scrapyd-web可以实现操作的可视化以及实现一键部署，定时任务，多主机统一管理等功能。
下面分别介绍scrapyd和spiderkeeper的安装和使用方法。



## 一、scrapyd

#### 1. 安装scrapyd以及scrapyd-client

- pip方式安装

```	objc
- pip install scrapyd;
```

```	objc
- pip install scrapyd-client;
```

#### 2. 启动

- 在项目目录命令行下输入scrapyd即可，然后访问浏览器url https://localhost:6800
```	objc
- scrapyd;
```

#### 3. 将项目上传到scrapyd服务器

- 修改项目下的scrapy.cfg文件，解开url的注释，设置项目名称

- 在scrapy.cfg文件所在路径执行如下命令，若返回ok状态则表示成功上传。
```	objc
- scrapyd-deploy;
```

#### 4. scrapyd中常用的api
总结

```	objc
- 
1、获取状态
curl http://127.0.0.1:6800/daemonstatus.json
2、获取项目列表
curl http://127.0.0.1:6800/listprojects.json
3、获取项目下已发布的爬虫列表
curl http://127.0.0.1:6800/listspiders.json?project=myproject（项目名）
4、获取项目下已发布的爬虫版本列表
curl http://127.0.0.1:6800/listversions.json?project=myproject（项目名）
5、获取爬虫运行状态
curl http://127.0.0.1:6800/listjobs.json?project=myproject（项目名）
 6、启动服务器上某一爬虫（必须是已发布到服务器的爬虫）
curl http://localhost:6800/schedule.json -d project=项目名称 -d spider=爬虫名称
7、删除某一版本爬虫
curl http://127.0.0.1:6800/delversion.json  （post方式，data={ " project " :myproject, " version " :myversion}）
8、删除某一工程，包括该工程下的各版本爬虫    
curl http://127.0.0.1:6800/delproject.json （post方式，data={ " project " :myproject }）

```


## 一、spiderkeeper

#### 1. 安装和启动spiderkeeper

- pip方式安装
```	objc
- pip install spiderkeeper;
```

- 命令行直接输入下列命令启动，然后访问浏览器的 https://127.0.0.1:5000
```	objc
- spiderkeeper;
```

#### 1. spiderkeeper的使用

按照上文scrapyd的使用方法，将生成的egg文件直接上传到spiderkeeper的网页可视化界面中，然后便可部署、停止和查看后续的爬虫任务。


### 参考
- [Scrapyd监控系统之SpiderKeeper和Scrapydweb详解
](https://zhuanlan.zhihu.com/p/60776649)
- [scrapyd支持的API 介绍和Scrapyd-client
](https://blog.csdn.net/manmanpa/article/details/78833329)