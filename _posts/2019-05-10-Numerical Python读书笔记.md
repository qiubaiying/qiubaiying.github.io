---
layout:     post
title:      Numerical Python读书笔记
subtitle:   A Practical Techniques Approach for Industry
date:       2019-05-10
author:     JP
header-img: img/post-bg-iWatch.jpg
catalog: true
tags:
    - Python
    - Numerical
    
---
<head>
    <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
    <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
            tex2jax: {
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
            inlineMath: [['$','$']]
            }
        });
    </script>
</head>

> The purpose of computing is insight, not numbers

### 参考

 [Numerical Python](http://jrjohansson.github.io/numericalpython.html)

![](https://ww3.sinaimg.cn/large/006tKfTcgy1fdgexnidglj30yq0eqn0r.jpg)

代码和版本描述居然混在了一起，简直太糟糕~

虽然也能用，但是和CocoaPods本身的结构设计就不相符。

在上一篇[《CocoaPods公有仓库的创建》](http://qiubaiying.top/2017/03/08/CocoaPods公有仓库的创建/)中我们了解到，`master` 目录中只存放 代码库 的描述文件，而不是存放代码。就像这样

![](https://ww4.sinaimg.cn/large/006tKfTcgy1fdgf4l54rxj30ya09ujst.jpg)

代码我们另外存放在代码仓库中

![](https://ww4.sinaimg.cn/large/006tKfTcgy1fdgf9t7vcgj30n206s0u8.jpg)

很多人不了解CocoaPods的工作原理就复制粘贴别人的教程来做教程~

吐槽结束，进入正文

# 正文

#### 创建版本库(**repo**)

首先，创建一个像 `master` 一样的存放版本描述文件的git仓库，因为是私人git仓库，我们选择 [oschina](http://git.oschina.net/) 创建远程私有仓库（因为是免费的）或者也可以在GitHub上创建（**$7/month**）。

下面以 [oschina](http://git.oschina.net/) 为例

创建版本描述仓库

![](https://ww1.sinaimg.cn/large/006tKfTcgy1fdgfqdqyy1j31kw1c2th0.jpg)


回到终端，将这个远程的私有版本仓库添加到本地，`repo` 就是 repository 储存库的缩写。

	$ pod repo add MyRepo https://git.oschina.net/baiyingqiu/MyRepo.git
	
查看在 Finder 目录 `~/.cocoapods/repos`， 可以发现增加了一个 MyRepo 的储存库

![](https://ww2.sinaimg.cn/large/006tKfTcgy1fdgfyfl6v6j316y0piwhz.jpg)

#### 创建代码库

回到 [oschina](http://git.oschina.net/) 创建私人代码库

创建时添加 `MIT License` 和 `README`



![](https://ww2.sinaimg.cn/large/006tKfTcgy1fdgjfu7n96j31kw17y7cq.jpg)

将仓库克隆到本地，添加`你的代码文件`、`仓库名.podspec` 描述文件，还有`.swift-version`.

如下

![](https://ww2.sinaimg.cn/large/006tKfTcgy1fdgmyefutej311a0kegqh.jpg)

`.swift-version`文件用来知道swift版本，用命令行创建

	$ echo "3.0" > .swift-version

**`.podspec`** 文件是你这个代码库的pod描述文件,可以通过pod指令创建空白模板：

	$ pod spec create MyAdditions

或者 **强烈建议** 直接拷贝下面的模板进行修改

```ruby
Pod::Spec.new do |s|
  s.name         = "MyAdditions" # 项目名称
  s.version      = "0.0.1"        # 版本号 与 你仓库的 标签号 对应
  s.license      = "MIT"          # 开源证书
  s.summary      = "私人pod代码" # 项目简介

  s.homepage     = "https://git.oschina.net/baiyingqiu/MyAdditions" # 仓库的主页
  s.source       = { :git => "https://git.oschina.net/baiyingqiu/MyAdditions.git", :tag => "#{s.version}" }#你的仓库地址，不能用SSH地址
  s.source_files = "MyAdditions/*.{h,m}" # 你代码的位置， BYPhoneNumTF/*.{h,m} 表示 BYPhoneNumTF 文件夹下所有的.h和.m文件
  s.requires_arc = true # 是否启用ARC
  s.platform     = :ios, "7.0" #平台及支持的最低版本
  # s.frameworks   = "UIKit", "Foundation" #支持的框架
  # s.dependency   = "AFNetworking" # 依赖库
  
  # User
  s.author             = { "BY" => "qiubaiyingios@163.com" } # 作者信息
  s.social_media_url   = "http://qiubaiying.github.io" # 个人主页

end
```
这里我要说一下一个坑，用 [oschina](http://git.oschina.net/) 创建私人仓库时, 在验证时可能会找不到 `MIT LICENSE`证书,将其中的

	s.license      = "MIT"
	修改为，指定文件
	s.license      = { :type => "MIT", :file => "LICENSE" }

然后开始验证我们的仓库配置是否正确，并按照要求进行修改

	$ pod lib lint
	
一般出现错误警告，需要添加 `--private` 或者 `--allow-warnings`，就可以通过验证

	$ pod lib lint --private

验证成功后出现

	 -> MyAdditions (0.0.1)
	 
	MyAdditions passed validation.
	
#### 将描述文件推送到版本库
	
将项目打上标签推到远程仓库，标签号 和 版本号对应 都是`0.0.1`

最后将我们的代码仓库的描述信息，push 到我们的版本仓库中

	$ pod repo push MyRepo MyAdditions.podspec

这时会对远程仓库进行验证，成功的话就会在 `~/.cocoapods/repos/MyRep`中发现新增的仓库描述信息了

![](https://ww3.sinaimg.cn/large/006tKfTcgy1fdgo62knrwj31ko0s8784.jpg)
	
若是出现错误信息

	[!] The repo `MyRepo` at `../.cocoapods/repos/MyRepo` is not clean
	
更新下我们的版本库，

	$ pod repo update MyRepo
	

再继续上传即可。

`pod repo push MyRepo MyAdditions.podspec` 的过程就是

1. 验证 `MyAdditions.podspec` 文件
- 拉取远程版本库 `MyRepo`
- 添加 `MyAdditions.podspec` 到版本库中
- push 到远程

添加完成后我们就可以在pod中搜索

	$ pod search MyAdditions
---
	-> MyAdditions (0.0.1)
	   Some category of the framework and UIKit
	   pod 'MyAdditions', '~> 0.0.1'
	   - Homepage: https://git.oschina.net/baiyingqiu/MyAdditions
	   - Source:   https://git.oschina.net/baiyingqiu/MyAdditions.git
	   - Versions: 0.0.1 [MyRepo repo]
	(END)
	
### 私人pod库的使用

使用私人pod库的需要在`Podflie`中添加这句话，指明你的版本库地址。

	source ‘https://git.oschina.net/baiyingqiu/MyRepo.git’
**注意**是版本库的地址，而不是代码库的地址，很多教程都把我搞晕了~

	
若有还使用了公有的pod库，需要把公有库地址也带上

	source ‘https://github.com/CocoaPods/Specs.git’

最后的`Podflie`文件变成这个样子

	source ‘https://github.com/CocoaPods/Specs.git’
	source ‘https://git.oschina.net/baiyingqiu/MyRepo.git’
	
	platform :ios, '8.0'
	
	target ‘MyPodTest’ do
	use_frameworks!
	
	pod “BYPhoneNumTF” #公有库
	pod ‘MyAdditions’ #我们的私有库
	pod ‘BYAdditions’ #这是我又添加到版本库中的另一个代码库
	
	end

测试：

	$ pod install

加载完成可以看到代码已经整合到我们的项目中了

**perfect！**

<img src="https://ww4.sinaimg.cn/large/006tKfTcgy1fdhkgtfn98j30ee0hwq6y.jpg" width="250">

回到Fender中 `~/.cocoapods/repos`,会发现 repos 中增加了一个pod版本库。 

![](https://ww2.sinaimg.cn/large/006tKfTcgy1fdhlc59rl9j30ya08y0ub.jpg)

执行 `pod install` 命令时

- 会拉取远程 `Podflie` 中 `source` 标记 版本库 到本地的 repos 文件夹中

- 在 版本库 中搜索我们`pod ‘MyAdditions’` 的 `MyAdditions.podspec` 文件。
- 根据 `MyAdditions.podspec` 文件中描述的源码地址下载并整合到项目中



# 结语

通过 [《CocoaPods私有仓库的创建》](http://qiubaiying.top/2017-03-10-CocoaPods私有仓库的创建/) 和 [《CocoaPods公有仓库的创建](http://qiubaiying.top/2017/03/08/CocoaPods公有仓库的创建/)》这两篇文章，相信大家对CocoaPods的工作原理都有了更深层次的了解。

在写博客和和创建的过程中，踩了不少的坑（😀前人教程留下的），很多的东西只有自己操作完才能真正的领会。

最后，如果本文有什么错误或者有什么不同的观点欢迎提出交流。😉

