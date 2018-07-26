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

本教程针对的是不懂技术又想搭建个人博客的小白，操作简单暴力且快速。当然懂技术那就更好了。

看看看博客的主页样式：

[![](http://upload-images.jianshu.io/upload_images/2178672-51a2fe6fbe24d1cd.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](http://qiubaiying.github.io/)

在手机上的布局：

[![](http://upload-images.jianshu.io/upload_images/2178672-d58bb45f9faedb70.jpg)](http://qiubaiying.github.io/)

废话不多说了，开始进入正文。

# 快速开始

### 从注册一个Github账号开始

我采用的搭建博客的方式是使用 [GitHub Pages](https://pages.github.com/) + [jekyll](http://jekyll.com.cn/) 的方式。

要使用 GitHub Pages，首先你要注册一个[GitHub](https://github.com/)账号，GitHub 是全球最大的同性交友网站(吐槽下程序员~)，你值得拥有。

![](http://upload-images.jianshu.io/upload_images/2178672-e65e5cda50f38cef.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 拉取我的博客模板

注册完成后搜索 `qiubaiying.github.io` 进入[我的仓库](https://github.com/qiubaiying/qiubaiying.github.io)


![](http://upload-images.jianshu.io/upload_images/2178672-1b234fb8549e58aa.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击右上角的 **Fork** 将我的仓库拉倒你的账号下

稍等一下，点击刷新，你会看到**Fork**了成功的页面

![](http://upload-images.jianshu.io/upload_images/2178672-b2347768a1f2d993.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 修改仓库名

点击**settings**进入设置

![](http://upload-images.jianshu.io/upload_images/2178672-f47b7e4802de6a34.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

<p id = "Rename"></p>
修改仓库名为 `你的Github账号名.github.io`，然后 Rename

![](http://upload-images.jianshu.io/upload_images/2178672-ca3d843e526cdd5b.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这时你在在浏览器中输入 `你的Github账号名.github.io` 例如:`baiyingqiu.github.io`

你将会看到如下界面

![](http://upload-images.jianshu.io/upload_images/2178672-96b5db55df9db422.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

说明已经成功一半了😀。。。当然，还需要修改博客的配置才能变成你的博客。

若是出现

![](http://upload-images.jianshu.io/upload_images/2178672-cfd55a22902a9d2c.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

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

![](http://upload-images.jianshu.io/upload_images/2178672-c23d4a5d67c88084.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击修改

![](http://upload-images.jianshu.io/upload_images/2178672-b37268df7a7852ca.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后编辑`_config.yml`的内容

![](http://upload-images.jianshu.io/upload_images/2178672-0c8750f5a18dbe03.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

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
sidebar-avatar:/img/avatar-by.JPG      # 你的个人头像 这里你可以改成我在img文件夹中的两张备用照片 img/avatar-m 或 avatar-g
```
#### 社交账号
展示你的其他社交平台

![](http://upload-images.jianshu.io/upload_images/2178672-ec775a22f76e2f40.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在下面你的社交账号的用户名就可以了，若没有可不用填

```
# SNS settings
RSS: false
weibo_username:     username
zhihu_username:     username
github_username:    username
facebook_username:  username
jianshu_username:	jianshu_id
```

新加入了**简书**，`jianshu_id` 在你打开你的简书主页后的地址如：`http://www.jianshu.com/u/e71990ada2fd`中，后面这一串数字：`e71990ada2fd `

#### 评论系统


博客中使用的是 [Disqus](https://disqus.com/) 评论系统，在 [官网](https://disqus.com/) 注册帐号后，按下面的步骤简单的配置即可：

进入 [设置页面](https://disqus.com/home/settings/profile/) 配置个人信息

![配置 Disqus 个人信息](http://upload-images.jianshu.io/upload_images/2178672-904ecb30c536c73b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

找到 **Username**

![Disqus Account](http://upload-images.jianshu.io/upload_images/2178672-19d1b9e7d2624bfb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个 **Username**  就是我们 `_config.yml` 中 `disqus_username`

```
# Disqus settings（https://disqus.com/）
disqus_username: qiubaiying
```

> 很对人反映 Disqus 评论插件加载不出来，因为 Disqus 在国内加载缓慢，所以我新集成了 Gitalk 评论插件（感谢[@FeDemo](https://github.com/FeDemo)的推荐），喜欢折腾的朋友可以看这篇：[《为博客添加 Gitalk 评论插件》](http://qiubaiying.top/2017/12/19/%E4%B8%BA%E5%8D%9A%E5%AE%A2%E6%B7%BB%E5%8A%A0-Gitalk-%E8%AF%84%E8%AE%BA%E6%8F%92%E4%BB%B6/)。 我已经在`_config.yml` 配置就好了，只需要填写参数可以了。

#### 网站统计

集成了 [Baidu Analytics](http://tongji.baidu.com/web/welcome/login) 和 [Google Analytics](http://www.google.cn/analytics/)，到各个网站注册拿到track_id替换下面的就可以了

这是我的 Google Analytics

![](http://upload-images.jianshu.io/upload_images/2178672-c36b895c53196fdb.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

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

![](http://upload-images.jianshu.io/upload_images/2178672-0781006b5d15d149.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

再次进入你的主页，

![](http://upload-images.jianshu.io/upload_images/2178672-a49ee2975d524c93.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

恭喜你，你的个人博客搭建完成了😀。

# 写文章

利用 Github网站 ，我们可以不用学习[git](https://git-scm.com/)，就可以轻松管理自己的博客

对于轻车熟路的程序猿来说，使用git管理会更加方便。。。

## 创建
文章统一放在网站根目录下的 `_posts` 的文件夹中。

![](http://upload-images.jianshu.io/upload_images/2178672-fb74cdc11a950bd4.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

创建一个文件

![](http://upload-images.jianshu.io/upload_images/2178672-9a47b2074362e570.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在下面写文章，和标题，还能实时预览，最后提交保存就能看到自己的新文章了。

![](http://upload-images.jianshu.io/upload_images/2178672-88acd9e29fa3ae8a.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


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

![](http://upload-images.jianshu.io/upload_images/2178672-f4d5bb65ae3abd00.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

到这里，恭喜你！

你已经成功搭建了自己的个人博客以及学会在博客上撰写文字的技能了（是不是有点小兴奋🙈）。


#### 首页标签

在首页可以看到这些特色标签，当你的文章出现相同标签（默认相同的**标签数量大于1**），才会自动生成。

所以当你只放一篇文章的时候是不会出现标签的。



![](http://upload-images.jianshu.io/upload_images/2178672-9281b7176c456f92.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


建站的初期，博客比较少，若你想直接在首页生成比较多的标签。你可以在 `_congfig.yml`中找到这段：

```
# Featured Tags
featured-tags: true                     # 是否使用首页标签
featured-condition-size: 1              # 相同标签数量大于这个数，才会出现在首页
```

将其修改为`featured-condition-size: 0`, 这样只有一个标签时也会出现在首页了。

相反，当你博客比较多，标签也很多时，这时你就需要改回 `1` 甚至是 `2` 了。


# 自定义域名

搭建好博客之后 你可能不想直接使用 [baiyingqiu.github.io](http://baiyingqiu.github.io) 这么长的博客域名吧, 想换成想 [qiubaiying.top](http://qiubaiying.top) 这样简短的域名。那我们开始吧！

#### 购买域名
首先，你必须购买一个自己的域名。

我是在[阿里云](https://wanwang.aliyun.com/domain/?spm=5176.8006371.1007.dnetcndomain.q1ys4x)购买的域名

![](http://upload-images.jianshu.io/upload_images/2178672-ef3844cab15e35ff.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

用**阿里云** app也可以注册域名，域名的价格根据后缀的不同和域名的长度而分，比如我这个 `qiubaiying.top` 的域名第一年才只要4元~

域名尽量选择短一点比较好记住，注意，不能选择中文域名，比如 `张三.top` ,GitHub Pages **无法处理中文域名**，会导致你的域名在你的主页上使用。

注册的步骤就不在介绍了

#### 解析域名

注册好域名后，需要将域名解析到你的博客上

管理控制台 → 域名与网站（万网） → 域名

![](http://upload-images.jianshu.io/upload_images/2178672-9a75bba50d1b14d7.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

选择你注册好的域名，点击解析

![](http://upload-images.jianshu.io/upload_images/2178672-0968a8dd2045f4fd.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

添加解析

分别添加两个`A` 记录类型,

一个主机记录为 `www`,代表可以解析 `www.qiubaiying.top`的域名

另一个为 `@`, 代表 `qiubaiying.top`

记录值就是我们博客的IP地址，是 GitHub Pagas 在美国的服务器的地址 `151.101.100.133`

![](http://upload-images.jianshu.io/upload_images/2178672-0769a93bc487e9d8.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


可以通过 [这个网站](http://ip.chinaz.com/)  或者直接在终端输入`ping 你的地址`，查看博客的IP

	ping qiubaiying.github.io

细心地你会发现所有人的博客都解析到 `151.101.100.133` 这个IP。

然后 GitHub Pages 再通过 CNAME记录 跳转到你的主页上。


#### 修改CNAME

最后一步，只需要修改 我们github仓库下的 **CNAME** 文件。

选择 **CNAME** 文件

![](http://upload-images.jianshu.io/upload_images/2178672-a422f3dab436dfb7.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

使用的注册的域名进行替换,然后提交保存

![](http://upload-images.jianshu.io/upload_images/2178672-6e613004fb410b44.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


这时，输入你自己的域名，就可以解析到你的主页了。

大功告成！

# 进阶

若你对博客模板进行修改，你就要看看 Jekyll 的[开发文档](http://jekyll.com.cn),是中文文档哦，对英语一般的朋友简直是福利啊（比如说我😀）。

还要学习 **Git** 和 **GitHub** 的工作机制了及使用。

你可以先看看这个[git教程](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/)，对git有个初步的了解后，那么相信你就能将自己图片传到GitHub仓库上，或者可以说掌握了 **使用git管理自己的GitHub仓库** 的技能呢。

对于轻车熟路的程序猿来说，这篇教程就算就结束了，因为下面的内容对于你们来说 so eazy~

但相信很多小白都一脸懵逼，那我们继续👇。

# 利用GithHub Desktop管理GitHub仓库

[GithHub Desktop](https://desktop.github.com/) 是 **GithHub** 推出的一款管理GitHub仓库的桌面软件，换句话说就是将你在**Github**上的文件同步到本地电脑上，并将修改后的文件同步到**Github**远程仓库。

#### 下载

点击图片进入下载页面，选择对应的平台进行下载

[![](http://upload-images.jianshu.io/upload_images/2178672-6022ba3938b3088e.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](https://desktop.github.com/)

下面以**Mac**平台为例：

#### 安装

将下载好的文件解压，将这只小猫拖到应用程序文件夹中

![](http://upload-images.jianshu.io/upload_images/2178672-8f8c27f4e5c72276.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

就可以在**Launchpad**找到这只小猫咪~

![](http://upload-images.jianshu.io/upload_images/2178672-0f2da4717361459c.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 登录

点开应用,会弹出**登录**框，

![](http://upload-images.jianshu.io/upload_images/2178672-adb7d6824e471ef5.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

输入你的**GitHub**账号和密码进行登录

![](http://upload-images.jianshu.io/upload_images/2178672-2d7c407ebddbb44f.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

登录后关闭窗口

![](http://upload-images.jianshu.io/upload_images/2178672-93cdccc42024914b.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后返回引导窗，一直按 **Continue** 继续

![](http://upload-images.jianshu.io/upload_images/2178672-450ccef6b1ab7b0a.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**Continue**

![](http://upload-images.jianshu.io/upload_images/2178672-06b6e6792472ecae.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

还是**Continue**~
![](http://upload-images.jianshu.io/upload_images/2178672-681a6c455f6b512f.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

进入主界面，先 **右键Remve** 删除这个用户指导，贼烦~

![](http://upload-images.jianshu.io/upload_images/2178672-604f6f23b8fab6f3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 克隆仓库

选择你的仓库克隆到本地

![](http://upload-images.jianshu.io/upload_images/2178672-45ddcd27e2f858a1.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/2178672-625be1220fea36b6.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 管理仓库

现在文件夹中打开

![](http://upload-images.jianshu.io/upload_images/2178672-92c1616af56b501a.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

打开后你会的发现文件结构和你在Github上的一模一样~

![](http://upload-images.jianshu.io/upload_images/2178672-bf3580ae1cd9a29e.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

你最先关心的可能是你的头像~在**img**文件夹中把替换我的头像就好了。

![](http://upload-images.jianshu.io/upload_images/2178672-c9421d64538c3ba6.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

不仅是图片，所有在Github上的的操作都可以进行。

#### 保存修改

当你对仓库文件夹的文件下进行修改、添加或删除时，都可以在 **GitHub Desktop** 中看到

例如我在 `img` 中添加了一张图片 `avatar-demo.png` 添加了一张图片

就可以在看到**GitHub Desktop**显示了我的修改

保存修改只要按 **Commit to master**，然后可以写上你的修改说明

![](http://upload-images.jianshu.io/upload_images/2178672-4bfbfec37cbb8eb6.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 同步

将修改同步到 **GitHub** 远程仓库上只需要一步：点击右上角的**同步按钮**

![](http://upload-images.jianshu.io/upload_images/2178672-3c2ee8234a7f1832.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 完成

打开你的GitHub上的仓库，你就可以看到已经和本地同步了

可以看到你提交的详情： `add img` 

![](http://upload-images.jianshu.io/upload_images/2178672-293bdd4cbee0e9e3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这样，你已经能轻松管理自己的博客了。

想上传头像，背景，或者是删掉你不要的图片（我的头像😏）已经是 so eazy了吧~

#### 注意
你在 **GitHub** 网站上进行 **Commit** 操作后，需要在**GitHub Desktop**上按一下 **同步按键** 才能同步网站上的修改到你的本地。


# 修改个人介绍


![](https://ws4.sinaimg.cn/large/006tNc79gy1fme0poz7gqj30vq0l8whh.jpg)

修改个人介绍需要修改根目录下的 `about.html` 文件

![](https://ws2.sinaimg.cn/large/006tNc79gy1fme0rna33tj30bw0bntah.jpg)

看不懂 HTML 标签？没关系，对照着修改就好了~ 还有注意这个有中英介绍

![](https://ws1.sinaimg.cn/large/006tNc79gy1fme0sbvmmcj30zp0os7ap.jpg)

# 常见问题

最近有很多人给我提问题，我这边总结一下

#### 配置文件修改后没有效果
刷新几遍浏览器就好了~

不行的话，先清除浏览器缓存再试试。

#### 404错误

1. 检查你的仓库名是否有按照要求填写
2. 确定 **Fork** 的是不是我的仓库~

#### 修改CNAME文件，域名还是不变

清除浏览器缓存就OK~

#### 其他问题

直接在评论中提出来或私信我，我会一一替大家解决的😀


# 其他

最近有人往我的远程仓库不停的 **push**，一天连收几十封邮件！例如像这样的

![](http://upload-images.jianshu.io/upload_images/2178672-1347f2cc9a4a8dc8.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

原因大多是直接Clone了我的仓库到本地，**没有删除我的远程仓库地址**，添加完自己的仓库地址后，一口气推送到所有远程仓库（包括我的😂）~

打扰了我的工作和生活~

所以，**请不要往我的仓库上推送分支**！

我发现一个问题是，很多人每次修改博客的内容都commit一次到远程仓库，然后再查看修改结果，这样效率非常低！

#### 来，上车！

## 在本地调试博客

> 注：下面的操作是在 **Mac** 终端进行的。
> **Windows** 环境下的配置请参考 [@梦幻之云](http://www.jianshu.com/u/a13e7484dc21) 提供的 [这篇文章](https://agcaiyun.cn/2017/09/10/%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2/)。

有心的同学在 [jekyll官网](http://jekyllcn.com/) 就会发现 `jekyll` 的 提供的实例代码。

```
~ $ gem install jekyll bundler
~ $ jekyll new my-awesome-site
~ $ cd my-awesome-site
~/my-awesome-site $ bundle install
~/my-awesome-site $ bundle exec jekyll serve
# => 打开浏览器 http://localhost:4000
```


这段命令创建了一个默认的 `jekll` 网站，然后在本机的 4000 窗口展示。聪明的你应该发现怎么做了吧~

安装 `jekyll`和 `jekyll bundler`

```
$ gem install jekyll
$ gem install jekyll bundler
```

进入你的 **Blog 所在目录**，然后创建本地服务器

```
$ jekyll s

```

然后会显示 

```
 Auto-regeneration: enabled for '/Users/baiying/Blog'
Configuration file: /Users/baiying/Blog/_config.yml
    Server address: http://127.0.0.1:4000/
  Server running... press ctrl-c to stop.
```

你就可以在 <http://127.0.0.1:4000/> 看到你的博客，你对本地博客的修改都会在这个地址进行显示，这大大提高了对博客的配置效率。

使用`ctrl+c`就可以停止 **serve**

# Star

若本教程顺利帮你搭建了自己的个人博客，请不要 **害羞**，给我的 [github仓库](https://github.com/qiubaiying/qiubaiying.github.io) 点个 **star** 吧！

因为最近发现 Fork 将近破百，加上直接 Clone 仓库的，保守估计已经帮助上百人成功的搭建了自己的博客，~~可是 Star 却仅仅只有 **12**！可能还是做的不够好吧！~~现在已经破百了，感谢大家的Star！

### **别无他求，点个 [Star](https://github.com/qiubaiying/qiubaiying.github.io) 吧**！

![](http://upload-images.jianshu.io/upload_images/2178672-768a38ee9fb0df28.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**心满意足！**

# 补充

#### 修改网站的 **icon**

![](https://ws2.sinaimg.cn/large/006tNc79gy1flgh6k23ppj30ad00uq2t.jpg)

要修改如图所示的网站 **icon**：

在博客 `img` 目录下找到并替换 `favicon.ico` 这个图标即可，图标尺寸为`32x32`。


![](https://ws2.sinaimg.cn/large/006tNc79gy1flghahch1oj30gu09y419.jpg)


#### 修改主页的座右铭

最近有不少小伙伴私信我：**如何修改主页的座右铭？**

就是这个：

![](http://upload-images.jianshu.io/upload_images/2178672-31dc0068f256aca3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

很简单，找到博客目录下的 **index.html** 文件，修改这句话就可以了。

![](http://upload-images.jianshu.io/upload_images/2178672-9e4785654523bf07.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 如何在博客文章中上插入图片

博客的文章用的是 MarkDown 格式，如果没用过 MarkDown 真的 强烈推荐 [花半个小时学习一下](http://sspai.com/25137)。

MarkDown 中添加图片的形式是 :`![](图片的URL)`

例如：

`![MarkDown示例图片](http://upload-images.jianshu.io/upload_images/2178672-eb2effd6b942a500.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)`就会显示下面这张图片

![MarkDown示例图片](http://upload-images.jianshu.io/upload_images/2178672-98965f66db8f5856.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`https://ws3.sinaimg.cn/large/006tNc79gy1fj9xhjzobbj30yg0my75z.jpg`就是这张图片的URL，我们可以在浏览器输入这个URL找到或下载这张图片。

所以，要在 MacDown 中插入图片，这张图片就需要上传到图床（网上），然后在引
用这张图片的URL。

##### 将图片上传到图床

Mac 上的图床神器：iPic  

直接在App Store上下载，谁用谁知道！

使用方法很简单，直接拖动图片到 P 图标上，或者选中图片按快捷键 `⌘+U`，就能请示上传。

上传成功就能直接粘贴图片的URL。

![iPic](http://upload-images.jianshu.io/upload_images/2178672-7399aeaced6f1e29.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

用 iPic 上传图片后，获取URL插入文章中就可以了。

![iPic上传图片](http://upload-images.jianshu.io/upload_images/2178672-4be76fb02708de5e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 推荐几个好用软件

##### MarkDown编辑器

[MacDown](https://macdown.uranusjr.com/)：可能是Mac上最好的MacDown编辑器了  

![](http://upload-images.jianshu.io/upload_images/2178672-2226239a63278302.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### 图片压缩工具

[ImageOptim](https://imageoptim.com/)

对于我们的博客来说，图片越大，加载速度越慢。

不信你用手机打开你的博客试试~

所以有必要对我们上传到博客网站中的图片：指的是你的头像，首页背景图片，文章背景图片等。对于博客文章中插入的图片，其实也可以压缩了再上传。

对博客中的所有图片进行压缩：

看看压缩结果，最高的一张压缩了78.7%，这简直是太可怕了！

![ImageOptim压缩图片](http://upload-images.jianshu.io/upload_images/2178672-0f8e643fa1da8674.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

好了，现在个人博客的加载速度估计要起飞了~

# 最后要说个事情

我在博客中的文章，你们可以保留，让更多需要帮助人的看到，当然也可以删除。

但是，我发现居然有人把文章的作者改成了自己，然后当成自己的文章放在自己的博客上，这就令人感到气愤了。

比如说向我请教问题的这位：

![](http://upload-images.jianshu.io/upload_images/2178672-ed45ebafec7f5d34.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


我在博客中的每篇文章都是我一字一句敲出来的，转载的文章我也注明了出处，表示对原作者的尊重。同时也希望大家都能尊重我的付出。

谢谢~