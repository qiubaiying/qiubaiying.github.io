---
layout:     post
title:      基于Github的博客搭建
subtitle:   新手如何通过Github建立网站
date:       2024-04-05
author:     WL
header-img: img/post-bg-markdown.jpg
catalog: true
tags:
    - Tools

---

## Github page建立

[非常好的Github博客建立文章](https://qiubaiying.github.io/2017/02/06/%E5%BF%AB%E9%80%9F%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2/)

## 阿里云OSS PicGo 配置图床教程

[Github图床太慢用阿里云OSS资源包建立](https://zhuanlan.zhihu.com/p/104152479)

通过oss browser管理oss资源包，安装后配置如下，Endpoint默认就行不填（以下为错误示范）

![Ossbrowser配置](https://nibilu.oss-cn-beijing.aliyuncs.com/img/aliyunOssbrowserSet.png)

## Gitalk评论日系统插入

- 注册OAuth Application

- 到 https://github.com/settings/applications/new 注册一个OAuth Application, 其中 Home page URL 填自己的博客地址, 如我的https://zzqcn.github.io/, Authorization callback URL 也填自己的博客地址.填好后提交, 得到client ID和client secret,记录好填入Blog的Gitalk 参数中。

- 在github仓库中开启issues

  ![](https://nibilu.oss-cn-beijing.aliyuncs.com/img/github%E5%BC%80%E5%90%AFissues.jpg)

- 我们需要关心的就是配置下面几个参数：

```js
clientID: `Github Application clientID`,
clientSecret: `Github Application clientSecret`,
repo: `Github 仓库名`,//存储你评论 issue 的 Github 仓库名（建议直接用 GitHub Page 的仓库名）
owner: 'Github 用户名',
admin: ['Github 用户名'], //这个仓库的管理员，可以有多个，用数组表示，一般写自己,
id: 'window.location.pathname', //页面的唯一标识，gitalk 会根据这个标识自动创建的issue的标签,我们使用页面的相对路径作为标识
```

- Gitalk 需要你点开每篇文章的页面才会创建对应的 issue


## PicGo 传图工具 配合 Typora工具（Markdown编辑神器）

- typora安装，将下载的app.asar.txt 文件中的后缀.txt去掉，并拷贝到typora安装路径下替换，C:\Typora\resources 根据自己的安装路径进行替换

- 输入序列号激活，点击“输入序列号，邮箱一栏中任意填写（但须保证邮箱地址格式正确）

- 输入序列号(在key.txt文件中，任选一条)，点击“激活”。

[Markdown语法速查](https://markdown.com.cn/)

[Typora完全使用详解](https://sspai.com/post/54912) 

## 图片插入实例

要添加图像，请使用感叹号 (!), 然后在方括号增加替代文本，图片链接放在圆括号里，括号里的链接后可以增加一个可选的图片标题文本。

插入图片Markdown语法代码：` ![图片alt](图片链接 "图片title") `

给图片增加链接，请将图像的Markdown 括在方括号中，然后将链接添加在圆括号中。

`[![沙漠中的岩石图片](/assets/img/shiprock.jpg "Shiprock")](https://markdown.com.cn)`

`![美妇人](https://nibilu.oss-cn-beijing.aliyuncs.com/img/lady001.jpg)`

![美妇人](https://nibilu.oss-cn-beijing.aliyuncs.com/img/lady001.jpg)

## Bilibili视频插入实力

以下示例可以直接手机全屏并且高清，视频分享链接替换下图中部分

`<iframe src="//player.bilibili.com/player.html?aid=1152671127&bvid=BV19Z421v735&cid=1493743377&p=1" scrolling="no" width="800px" height="600px" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`

[详细讲解看](https://www.bilibili.com/read/cv6775208/)

<div style="position: relative; padding: 30% 45%;">
<iframe style="position: absolute; width: 100%; height: 100%; left: 0; top: 0;" src="https://player.bilibili.com/player.html?aid=1152671127&bvid=BV19Z421v735&cid=1493743377&page=1&as_wide=1&high_quality=1&danmaku=0" frameborder="no" scrolling="no"> </iframe>
</div> 

