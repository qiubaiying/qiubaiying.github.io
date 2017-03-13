---
layout:     post
title:      wordpress大搬家
subtitle:   move my blog to github
date:       2017-03-13
author:     Nico
header-img: img/post_bg_6.jpg
catalog:      true
tags:
    - blog
    - front end
    - github
    - jekyll
---

### 博客搬家

首先庆祝博客大搬家成功！撒花！

早就想脱离wordpress换一个“时髦”一点的前端框架，最近春假终于有时间好好折腾，于是顺利摆脱wordpress搭上github+jekyll顺风车，在此记录一下。

jekyll是Tom Preston-Werner在2008年开发的静态网页生成器，最大的优点有两个：
1. 不需要管理数据库
2. 完美支持markdown语法

最近（好像也不是最近），GitHub推出了Pages的服务，允许用户依托github云设立自己的博客(一个博客站点就是一个github repository，管理方法和传统的repo一模一样)，jekyll就是Github Pages默认的网页引擎，所以当然是无条件转投jekyll啦！

### 填坑

其实并没有特别多的坑好填，直接fork了[Hux](https://github.com/Huxpro/huxpro.github.io)博客的repository，然后按照[教程](https://github.com/Huxpro/huxpro.github.io/blob/master/README.zh.md)改改参数，把wordpress的旧帖子改成markdown格式放到_post文件夹下面，又优化了一下atom snippets让我更方便的写post，然后基本就搭好了。

装本地jekyll的时候报了个permission deny的错，这里稍微记录一下：

因为jekyll是ruby写的，所以安装jekyll的第一步就是更新一下mac自带的gem

```shell
# check version
gem -v
# update
sudo gem update --system
```

然后用gem安装jekyll
```shell
sudo gem install jekyll
```
然而即使用了sudo，也遇到了问题
<code>ERROR: While executing gem ... (Errno::EPERM) Operation not permitted - /usr/bin/sass</code>

这是由于系统不让jekyll安装它依赖的sass包到/usr/bin/系统目录下，这种情况其实只要稍微改一下参数：
```shell
# install jekyll to /usr/local/bin
sudo gem install -n /usr/local/bin jekyll

```
就可以安装jekyll到 /usr/local/bin 的目录下了，但是安装完后shell默认不识别jekyll，这时候就要稍微修改一下 ~/.bash_profile 文件
```shell
vi ~/.bash_profile

# add this line in the bash file
alias jekyll="/usr/local/bin/jekyll"

# save file then
source ~/.bash_profile
```
jekyll安装完成，cd到博客的文件夹，然后输入<code>jekyll server</code>，就可以在<code>http://127.0.0.1:4000/</code>见到自己的博客预览了！

然后调调格式，git push，一切搞定！

另外推荐一个mac端一键批量修改图片格式和加滤镜的好用软件[Fotor Photo Editor](http://www.fotor.com/mac/index.html)。~~本来已经在写python+skimage的改图片脚本了，无奈实在不知道靠谱的图像调暗卷积核，转而搜一下有没有免费又好用的软件，然后就发现了fotor新大陆！~~

### 下一步

现在是无脑改jekyll参数，下一步准备稍微学习一下jekyll的语法。

### 感谢

在此致谢原作者[Hux](https://huangxuan.me/)的漂亮模板！
