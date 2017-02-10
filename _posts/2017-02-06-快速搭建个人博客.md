---
layout:     post
title:      快速搭建个人博客
subtitle:   手把手教你在半小时内搭建自己的个人博客(如果不踩坑的话🙈🙊🙉)
date:       2017-02-06
author:     BY
header-img: img/post-bg-re-vs-ng2.jpg
catalog: true
tags:
    - Blog
---
> 正所谓前人栽树，后人乘凉。
> 
> 感谢[Huxpro](https://github.com/huxpro)提供的博客模板
> 
> [我的的博客](http://qiubaiying.top)

# 前言
从 Jekyll 到 GitHub Pages 中间踩了许多坑，终于把我的个人博客[BY Blog](http://qiubaiying.top)搭建出来了。。。


废话不多说了，开始进入正文。

# 快速开始

### 从注册一个Github账号开始

我采用的搭建博客的方式是使用 [GitHub Pages](https://pages.github.com/) + [jekyll](http://jekyll.com.cn/) 的方式。

要使用 GitHub Pages，首先你要注册一个[Github](https://github.com/)账号

![](https://ww4.sinaimg.cn/large/006tKfTcgy1fch0a9kz7aj31kw0z7npd.jpg)

### 拉取我的博客模板

注册完成后搜索 `qiubaiying.github.io` 进入[我的仓库](https://github.com/qiubaiying/qiubaiying.github.io)


![](https://ww3.sinaimg.cn/large/006tNbRwgy1fcgqjugzkpj30yy0p1mzc.jpg)

点击右上角的 **Fork** 将我的仓库拉倒你的账号下

稍等一下，点击刷新，你会看到**Fork**了成功的页面

![](https://ww3.sinaimg.cn/large/006tKfTcgy1fch1i297pjj31kw0z7thk.jpg)


### 修改仓库名

点击**settings**进入设置

![](https://ww3.sinaimg.cn/large/006tNbRwgy1fcgqms2auij30yy0p1tau.jpg)

<p id = "Rename"></p>
修改仓库名为 `你的Github账号名.github.io`，然后 Rename

![](https://ww4.sinaimg.cn/large/006tNbRwgy1fcgqfwtk1rj30yy0p1wg6.jpg)

这时你在在浏览器中输入 `你的Github账号名.github.io` 例如:`baiyingqiu.github.io`

你将会看到如下界面

![](https://ww2.sinaimg.cn/large/006tNbRwgy1fcgquoqasqj30we0n8q4n.jpg)

说明已经成功一半了😀。。。当然，还需要修改博客的配置才能变成你的博客。

若是出现

![](https://ww3.sinaimg.cn/large/006tNbRwgy1fcgqz6dyxmj30we0n83yy.jpg)

则需要 [检查一下你的仓库名是否正确](#Rename)

### 整个网站结构

修改Blog前我们来看看Jekyll 网站的基础结构，当然我们的网站比这个复杂。

```
├── _config.yml
├── _drafts
|   ├── begin-with-the-crazy-ideas.textile
|   └── on-simplicity-in-technology.markdown
├── _includes
|   ├── footer.html
|   └── header.html
├── _layouts
|   ├── default.html
|   └── post.html
├── _posts
|   ├── 2007-10-29-why-every-programmer-should-play-nethack.textile
|   └── 2009-04-26-barcamp-boston-4-roundup.textile
├── _data
|   └── members.yml
├── _site
├── img
└── index.html
```

很复杂看不懂是不是，不要紧，你只要记住其中几个OK了

- `_config.yml` 全局配置文件
- `_posts`	放置博客文章的文件夹
- `img`	存放图片的文件夹

其他的想继续深究可以[看这里](http://jekyll.com.cn/docs/structure/)



### 修改博客配置

来到你的仓库，找到`_config.yml`文件,这是网站的全局配置文件。

![](https://ww1.sinaimg.cn/large/006tNbRwgy1fcgrcxz8nqj30v90ulwh7.jpg)

点击修改

![](https://ww3.sinaimg.cn/large/006tNbRwgy1fcgrjzc232j30uz0nijt6.jpg)

然后编辑`_config.yml`的内容

![](https://ww2.sinaimg.cn/large/006tNbRwgy1fcgrnp4ihqj30uy0okwg9.jpg)

接下来我们来详细说说以下配置文件的内容：

#### 基础设置

```
# Site settings
title: You Blog    				  	#你博客的标题
SEOTitle: 你的博客 | You Blog    	 #显示在浏览器上搜索的时候显示的标题
header-img: img/post-bg-rwd.jpg  	#显示在首页的背景图片
email: You@gmail.com	
description: "You Blog"  			 #网站介绍
keyword: "BY, BY Blog, 柏荧的博客, qiubaiying, 邱柏荧, iOS, Apple, iPhone" #关键词
url: "https://qiubaiying.github.io"          # 这个就是填写你的博客地址
baseurl: ""      # 这个我们不用填写

```
#### 侧边栏

```
# Sidebar settings
sidebar: true                           # 是否开启侧边栏.
sidebar-about-description: "说点装逼的话。。。"
sidebar-avatar: img/avatar-by.JPG      # 你的个人头像 这里你可以改成我在img文件夹中的两张备用照片 img/avatar-m 或 avatar-g
```

#### 社交账号
若想链接其他社交平台

![](https://ww3.sinaimg.cn/large/006tNbRwgy1fcgsm4plpdj307i03nt8i.jpg)

在下面你的社交账号的用户名就可以了，若没有可不用填

```
# SNS settings
RSS: false
weibo_username:     qiubaiying
zhihu_username:     qiubaiying
github_username:    qiubaiying
facebook_username:  baiying.qiu.7
```

#### 评论

集成了多说社会化评论，到多说注册账号，然后将`duoshuo_username`换成你的账号即可。

```
# Duoshuo settings
duoshuo_username: YouName   # 换成你的多说账号
# Share component is depend on Comment so we can NOT use share only.
duoshuo_share: true                     # set to false if you want to use Comment without Sharing
```

#### 网站统计

集成了 [Baidu Analytics](http://tongji.baidu.com/web/welcome/login) 和 [Google Analytics](http://www.google.cn/analytics/)，到各个网站注册拿到track_id替换下面的就可以了

这是我的 Google Analytics

![](https://ww1.sinaimg.cn/large/006tNc79gy1fcgtqc5wf0j310i0nbt9j.jpg)

**不要使用我的track_id**😂。。。

若不想启用统计，直接删除或注释掉就可以了

```
# Analytics settings
# Baidu Analytics
ba_track_id: 83e259f69b37d02a4633a2b7d960139c

# Google Analytics
ga_track_id: 'UA-90855596-1'            # Format: UA-xxxxxx-xx
ga_domain: auto
```

#### 好友

```
friends: [
    {
        title: "简书·BY",
        href: "http://www.jianshu.com/u/e71990ada2fd"
    },{
        title: "Apple",
        href: "https://apple.com"
    },{
        title: "Apple Developer",
        href: "https://developer.apple.com/"
    }
]
```

#### 保存
讲网页拉倒底部，点击 `Commit changes` 提交保存

![](https://ww2.sinaimg.cn/large/006tKfTcgy1fch1mpktilj31kw0z7n34.jpg)

再次进入你的主页，

![](https://ww2.sinaimg.cn/large/006tNc79gy1fcgtqheu38j30uy0kc3zs.jpg)

恭喜你，你的个人博客搭建完成了😀。

# 写文章

利用 Github网站 ，我们可以不用学习[git](https://git-scm.com/)，就可以轻松管理自己的博客

对于轻车熟路的程序猿来说，使用git管理会更加方便。。。

## 创建
文章统一放在网站根目录下的 `_posts` 的文件夹中。

![](https://ww3.sinaimg.cn/large/006tNc79gy1fchoc1tz03j30vi0k978h.jpg)

创建一个文件

![](https://ww2.sinaimg.cn/large/006tNc79gy1fchoduzebyj30vn0eg0v7.jpg)

在下面写文章，和标题，还能实时预览，最后提交保存就能看到自己的新文章了。

![](https://ww2.sinaimg.cn/large/006y8lVagy1fcgweml8hjj30vd0m775r.jpg)


## 格式
每一篇文章文件命名采用的是`2017-02-04-Hello-2017.md`时间+标题的形式，空格用`-`替换连接。

文件的格式是 `.md` 的 [**MarkDown**](http://sspai.com/25137/) 文件。

我们的博客文章格式采用是 **MarkDown**+ **YAML** 的方式。

[**YAML**](http://www.ruanyifeng.com/blog/2016/07/yaml.html?f=tt) 就是我们配置 `_config`文件用的语言。

[**MarkDown**](http://sspai.com/25137/) 是一种轻量级的「标记语言」，很简单。[花半个小时看一下](http://sspai.com/25137)就能熟练使用了

大概就是这么一个结构。

```
---
layout:     post   				    # 使用的布局（不需要改）
title:      My First Post 				# 标题 
subtitle:   Hello World, Hello Blog #副标题
date:       2017-02-06 				# 时间
author:     BY 						# 作者
header-img: img/post-bg-2015.jpg 	#这篇文章标题背景图片
catalog: true 						# 是否归档
tags:								#标签
    - 生活
---

## Hey
>这是我的第一篇博客。

进入你的博客主页，新的文章将会出现在你的主页上.
```

按格式创建文章后，提交保存。进入你的博客主页，新的文章将会出现在你的主页上.

![](https://ww4.sinaimg.cn/large/006tKfTcgy1fch26elve4j31kw13qhdt.jpg)

到这里，恭喜你！

你已经成功搭建了自己的个人博客以及学会在博客上撰写文字的技能了（是不是有点小兴奋🙈）。


# 自定义域名

搭建好博客之后 你可能不想直接使用 [baiyingqiu.github.io](http://baiyingqiu.github.io) 这么长的博客域名吧, 想换成想 [qiubaiying.top](http://qiubaiying.top) 这样简短的域名。那我们开始吧！

## 购买域名
首先，你必须购买一个自己的域名。

我是在[阿里云](https://wanwang.aliyun.com/domain/?spm=5176.8006371.1007.dnetcndomain.q1ys4x)购买的域名

![](https://ww4.sinaimg.cn/large/006tKfTcgy1fci89zv06yj31kw11p1kx.jpg)

用**阿里云** app也可以注册域名，域名的价格根据后缀的不同和域名的长度而分，比如我这个 `qiubaiying.top` 的域名第一年才只要4元~

域名尽量选择短一点比较好记住，注意，不能选择中文域名，比如 `张三.top` ,GitHub Pages **无法处理中文域名**，会导致你的域名在你的主页上使用。

注册的步骤就不在介绍了

## 解析域名

注册好域名后，需要将域名解析到你的博客上

管理控制台 → 域名与网站（万网） → 域名

![](https://ww1.sinaimg.cn/large/006tKfTcgy1fci8phk5z9j30nk0q0goy.jpg)

选择你注册好的域名，点击解析

![](https://ww4.sinaimg.cn/large/006tKfTcgy1fci8sg27bfj31kw0s0qdt.jpg)

添加解析

分别添加两个`A` 记录类型,

一个主机记录为 `www`,代表可以解析 `www.qiubaiying.top`的域名

另一个为 `@`, 代表 `qiubaiying.top`

记录值就是我们博客的IP地址，是 GitHub Pagas 在美国的服务器的地址 `151.101.100.133`

![](https://ww3.sinaimg.cn/large/006tKfTcgy1fci8x9412oj31kw0o4n5o.jpg)


可以通过 [这个网站](http://ip.chinaz.com/)  或者直接在终端输入`ping 你的地址`，查看博客的IP

	ping qiubaiying.github.io

细心地你会发现所有人的博客都解析到 `151.101.100.133` 这个IP。

然后 GitHub Pages 再通过 CNAME记录 跳转到你的主页上。


## 修改CNAME

最后一步，只需要修改 我们github仓库下的 **CNAME** 文件。

选择 **CNAME** 文件

![](https://ww2.sinaimg.cn/large/006tKfTcgy1fci9q9ne6qj31kw0uuajm.jpg)

使用的注册的域名进行替换,然后提交保存

![](https://ww2.sinaimg.cn/large/006tKfTcgy1fci9rzk0naj316s0n841s.jpg)


这时，输入你自己的域名，就可以解析到你的主页了。

大功告成！

# 进阶

若你对博客模板进行修改，你就要看看 Jekyll 的[开发文档](http://jekyll.com.cn),是中文文档哦，对英语不好的朋友简直是福利啊（比如说我😀）。

还要学习 **Git** 和 **GitHub** 的工作机制了及使用。

你可以先看看这个[git教程](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/)，对git有个初步的了解后，那么相信你就能将自己图片传到GitHub仓库上，或者可以说掌握了 **使用git管理自己的GitHub仓库** 的技能呢。

相信很很多人看蒙了呢，这部分教程后面再补上。那就先这样吧。

对于轻车熟路的程序猿来说，呵~
