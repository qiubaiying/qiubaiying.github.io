---
layout:     post
title:      为博客添加 Gitalk 评论插件
subtitle:   BY Blog 添加 Gitalk 的评论插件了
date:       2017-12-19
author:     BY
header-img: img/post-bg-universe.jpg
catalog: true
tags:
    - Blog
---


## 前言

由于 **Disqus** 对于国内网路的支持十分糟糕，很多人反映 Disqus 评论插件一直加载不出来。而我一直是处于翻墙状态的~（话说你们做程序员的都不翻墙用Google的吗😅，哈哈，吐嘈下）

针对这个问题，我添加了[Gitalk](https://github.com/gitalk/gitalk) 评论插件。在此，非常感谢 [@FeDemo](https://github.com/FeDemo) 的推荐 。

## 正文

### Gitalk 评论插件

首先来看看 Gitalk 的界面和功能：

[![](https://ws4.sinaimg.cn/large/006tKfTcgy1fmm4u3j0lmj30nk0kl40i.jpg)](https://gitalk.github.io/)

gitalk 使用 Github 帐号登录，界面干净整洁，最喜欢的一点是支持 `MarkDown语法`。

### 原理

Gitalk 是一个利用 Github API,基于 Github issue 和 Preact 开发的评论插件，在 Gitalk 之前还有一个 [gitment](https://github.com/imsun/gitment) 插件也是基于这个原理开发的,不过 gitment 已经很久没人维护了。

可以看到在 gitalk 的评论框进行评论时，其实就是在对应的 issue 上提问题。

![gitalk评论框](https://ws4.sinaimg.cn/large/006tKfTcgy1fmm5916av1j30i209rab7.jpg)

![Github issue](https://ws4.sinaimg.cn/large/006tKfTcgy1fmm596ggkfj30mx0gfjuk.jpg)


### 集成 Gitalk

到这里，你应该对 Gitalk 有个大致的了解了，现在，开始集成 gitalk 插件吧。


将这段代码插入到你的网站：


```js
<!-- Gitalk 评论 start  -->
{% if site.gitalk.enable %}
<!-- Link Gitalk 的支持文件  -->
<link rel="stylesheet" href="https://unpkg.com/gitalk/dist/gitalk.css">
<script src="https://unpkg.com/gitalk@latest/dist/gitalk.min.js"></script>

<div id="gitalk-container"></div>
    <script type="text/javascript">
    var gitalk = new Gitalk({

    // gitalk的主要参数
		clientID: `Github Application clientID`,
		clientSecret: `Github Application clientSecret`,
		repo: `存储你评论 issue 的 Github 仓库名`,
		owner: 'Github 用户名',
		admin: ['Github 用户名'],
		id: '页面的唯一标识，gitalk会根据这个标识自动创建的issue的标签',
    
    });
    gitalk.render('gitalk-container');
</script>
{% endif %}
<!-- Gitalk end -->
```

我们需要关心的就是配置下面几个参数：

```js
clientID: `Github Application clientID`,
clientSecret: `Github Application clientSecret`,
repo: `Github 仓库名`,//存储你评论 issue 的 Github 仓库名（建议直接用 GitHub Page 的仓库名）
owner: 'Github 用户名',
admin: ['Github 用户名'], //这个仓库的管理员，可以有多个，用数组表示，一般写自己,
id: 'window.location.pathname', //页面的唯一标识，gitalk 会根据这个标识自动创建的issue的标签,我们使用页面的相对路径作为标识
```
当然，还有其他很多参数，有兴趣的话可以 [ 点这里](https://github.com/gitalk/gitalk#options)。

比如我就增加了这个全屏遮罩的参数。

```
distractionFreeMode: true,
```

### 创建 Github Application

Gitalk 需要一个 **Github Application**，[点击这里申请](https://github.com/settings/applications/new)。

填写下面参数：

![](https://ws1.sinaimg.cn/large/006tKfTcgy1fmm7jaib6fj30jo0gaacs.jpg)

点击创建

获取 `Client ID` 和 `Client Secret` 填入你的我们 Gitalk 参数中

![](https://ws1.sinaimg.cn/large/006tKfTcgy1fmm7jrzff6j30lc0budhp.jpg)

当你参数都设置好，将代码推送到 Github 仓库后，没什么问题的话，当你点击进入你的博客页面后就会出现评论框了。

当你用 github 帐号登录（管理员），并且第一次加载该会比较慢，因为第一次加载会自动在你 `repo` 的仓库下创建对应 issue。

比如说这样：

![](https://ws2.sinaimg.cn/large/006tKfTcgy1fmm867n88cj30l809mjse.jpg)

![](https://ws4.sinaimg.cn/large/006tKfTcgy1fmm8a0i0jkj30rr0ct42t.jpg)

当然，你也可以手动创建issue作为 gitalk评论容器。只要有 `Gitalk` 标签 和 `id` 对应标签就可以。比我我自己创建的 [About issue](https://github.com/qiubaiying/qiubaiying.github.io/issues/38) 。

# 结语

最后说几句吐嘈几句， Gitalk 需要你点开每篇文章的页面才会创建对应的 issue,对我来说真是个糟糕的体验（文章有点多~）。

当然，也有解决办法，这篇 [自动初始化 Gitalk 和 Gitment 评论](https://draveness.me/git-comments-initialize)，就解决了这个问题。

最后，[给个 star 吧](https://github.com/qiubaiying/qiubaiying.github.io)~