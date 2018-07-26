---
layout:     post
title:      Hello 2017
subtitle:    "\"Hello World, Hello Blog\""
date:       2017-02-04
author:     BY
header-img: img/post-bg-2015.jpg
catalog: true
tags:
    - 生活
---

> “🙉🙉🙉 ”


## 前言

BY 的 Blog 就这么开通了。

本来打算在年前完成 Blog 的搭建，不曾料想踩了很多坑。。。

[跳过废话，直接看技术实现 ](#build) 

2017 年，BY Blog 总算是搭建好了。

最开始写博客是在[简书](www.jianshu.com)这个平台上，简书确实不错，支持markdown在线编辑。

在一次偶然间，听到我的好基友 **阳阳** 想搭建个人主页，觉得作为一个程序员，是应该倒腾倒腾自己的Blog，于是乎就开始了撸起袖子干了。

<p id = "build"></p>
---

## 正文

接下来说说搭建这个博客的技术细节。  

正好之前就有关注过 [GitHub Pages](https://pages.github.com/) + [Jekyll](http://jekyllrb.com/) 快速 Building Blog 的技术方案，非常轻松时尚。

其优点非常明显：

* **Markdown** 带来的优雅写作体验
* 非常熟悉的 Git workflow ，**Git Commit 即 Blog Post**
* 利用 GitHub Pages 的域名和免费无限空间，不用自己折腾主机
	* 如果需要自定义域名，也只需要简单改改 DNS 加个 CNAME 就好了 
* Jekyll 的自定制非常容易，基本就是个模版引擎



---


主题我直接 Downlosd 了 [Hux的博客主题](https://huangxuan.me/) 的进行修改，简单粗暴，不过遇到了很多坑😂，好在都填完了。。。

本地调试环境需要 `gem install jekyll`，结果 rubygem 的源居然被墙了，~~后来手动改成了我大淘宝的镜像源才成功~~，淘宝的源已经[停止维护](https://gems.ruby-china.org/)，换成了OSChina的源 `https://gems.ruby-china.org/`。


## 后记

最后，感谢 Hux 提供的的 [Blog 主题](https://github.com/Huxpro/huxpro.github.io)

如果你恰好逛到了这里，希望你也能喜欢这个博客主题，感兴趣的话可以自己动手搭建一个。

—— BY 后记于 2017.2


