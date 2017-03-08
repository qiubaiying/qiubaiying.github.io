---
layout:     post
title:      CocoaPods公有仓库的创建
subtitle:   手把手教你创建 CocoaPods 公有仓库
date:       2017-03-08
author:     BY
header-img: img/post-bg-ios10.jpg
catalog: true
tags:
    - iOS
    - CocoaPods
    - Git
---

> 手把手教你创建 CocoaPods 公有仓库

当你有一个CocoaPods的公有仓库时，别人要使用你的框架时只需要在 `Podflie` 添加一句 `pod BYPhoneNumTF` 就能轻松的导入，是不是非常棒呢。

下面我们将一步步把我封装的这个简单的textFiled控件 [BYPhoneNumTF](https://github.com/qiubaiying/BYPhoneNumTF) 上传到Cocoapods 公有仓库。

#### 注册 CocoaPods 账号
想创建开源的Pod库，就要注册一个CocoaPods账号，我们使用终端注册, `email` 用你的 `GitHub` 邮箱

	$ pod trunk register GitHub_email 'user_name' --verbose

等终端出现下面文字，CocoaPods 会发一个`确认邮件`到你的邮箱上，登录你的邮箱进行确认。

	[!] Please verify the session by clicking the link in the verification email that has been sent to you_email@163.com
	
![](https://ww3.sinaimg.cn/large/006tNbRwgy1fdeco0ndc9j30r10h3wgt.jpg)

注册成功！
	
确认后再终端输入

	pod trunk me
	
可以看到你的注册信息
	
![](https://ww4.sinaimg.cn/large/006tNbRwgy1fdecs0z72oj30n004q3z2.jpg)

#### 创建Git仓库

在 [GitHub](https://github.com) 上创建一个公开项目，项目中必须包含这几个文件

- `LICENSE`:开源许可证
- `README.md`:仓库说明
- 你的代码
- `BYPhoneNumTF.podspec`: CocoaPods 的描述文件，这个文件**非常重要**

如下图：

![](https://ww2.sinaimg.cn/large/006tNbRwgy1fdfhvy3c19j31iq0dqn03.jpg)

`BYPhoneNumTF` 文件夹下是我存放代码的地方

`BYPhoneNumTF_Demo` 是代码使用样例（不是必须的）


#### 创建`.podspec`
`.podspec` 是用 Ruby 的配置文件，描述你项目的信息。

在你的仓库目录下，使用终端命令创建

	$ pod spec create BYPhoneNumTF
	
这时就会在你的仓库下生成 `BYPhoneNumTF.podspec` 文件

![](https://ww4.sinaimg.cn/large/006tNbRwgy1fdfioo1c4zj31bq0s20zn.jpg)

修改里面的配置就可以发布了~当然，没这么简单。

配置文件中的注释很多，而且很多配置都不是必须的，写多了等下验证还不让过~

so~**强烈建议**，直接拷贝下面的主要配置进行修改

```ruby
Pod::Spec.new do |s|
  s.name         = "BYPhoneNumTF" # 项目名称
  s.version      = "1.0.0"        # 版本号 与 你仓库的 标签号 对应
  s.license      = "MIT"          # 开源证书
  s.summary      = "A delightful TextField of PhoneNumber" # 项目简介

  s.homepage     = "https://github.com/qiubaiying/BYPhoneNumTF" # 你的主页
  s.source       = { :git => "https://github.com/qiubaiying/BYPhoneNumTF.git", :tag => "#{s.version}" }#你的仓库地址，不能用SSH地址
  s.source_files = "BYPhoneNumTF/*.{h,m}" # 你代码的位置， BYPhoneNumTF/*.{h,m} 表示 BYPhoneNumTF 文件夹下所有的.h和.m文件
  s.requires_arc = true # 是否启用ARC
  s.platform     = :ios, "7.0" #平台及支持的最低版本
  s.frameworks   = "UIKit", "Foundation" #支持的框架
  # s.dependency   = "AFNetworking" # 依赖库
  
  # User
  s.author             = { "BY" => "qiubaiyingios@163.com" } # 作者信息
  s.social_media_url   = "http://qiubaiying.github.io" # 个人主页

end
```
最最关键的步骤的到了，验证 `.podspec` 文件的格式是否正确，

	$ pod lib lint

验证会出现成功出现

	 -> BYPhoneNumTF (1.0.0)

	BYPhoneNumTF passed validation.	

但是很多情况没这么顺利，比如:

	 -> BYPhoneNumTF (1.0.0)
	    - WARN  | url: There was a problem validating the URL http://qiubaiying.github.io.
	
	[!] BYPhoneNumTF did not pass validation, due to 1 warning (but you can use `--allow-warnings` to ignore it) and all results apply only to public specs, but you can use `--private` to ignore them if linting the specification for a private pod.
	[!] The validator for Swift projects uses Swift 3.0 by default, if you are using a different version of swift you can use a `.swift-version` file to set the version for your Pod. For example to use Swift 2.3, run: 
	    `echo "2.3" > .swift-version`.
	You can use the `--no-clean` option to inspect any issue.
	
提示我们需要加`--allow-warnings`这么一句话，命令改为

	$ pod lib lint --allow-warnings

若还是提示什么`'echo "2.3" > .swift-version'`的，就加这么一个东西。

	$ echo "2.3" > .swift-version
然后在进行验证，这是应该就可以了。若还是不行，回到配置文件中检查有没有写错配置信息~

#### 给仓库打标签

验证成功后，将仓库提交到远程，然后给仓库打上标签并将标签也推送到远程。

标签相当于将你的仓库的一个压缩包，用于稳定存储当前版本。标签号与你在 `s.version = "1.0.0"`的版本号一致 `1.0.0`

	创建标签
	$ git tag -a 1.0.0 -m '标签说明' 
	推送到远程
	$ git push origin --tags
	
#### 发布`.podspec`

最后一步，发布项目的描述的文件 `BYPhoneNumTF.podspec` 

在仓库目录下执行
	
	pod trunk push BYPhoneNumTF.podspec
	
将你的 `BYPhoneNumTF.podspec` 发布到公有的speecs上,这一步其实做了很多操作,包括 

1. 更新本地 pods 库 `~/.cocoaPods.repo/master`
- 验证`.podspec`格式是否正确
- 将 `.podspec` 文件转成 JSON 格式
- 对 `master` 仓库 进行合并、提交.[master仓库地址](https://github.com/CocoaPods/Specs) 


成功后将会出现下列信息：

	Updating spec repo `master`
	Validating podspec
	 -> BYPhoneNumTF (1.0.0)
	
	Updating spec repo `master`
	
	--------------------------------------------------------------------------------
	 🎉  Congrats
	
	 🚀  BYPhoneNumTF (1.0.0) successfully published
	 📅  March 7th, 01:39
	 🌎  https://cocoapods.org/pods/BYPhoneNumTF
	 👍  Tell your friends!
	 
说明发布成功，你就可以通过上面的URL: <https://cocoapods.org/pods/BYPhoneNumTF> 进入的Pods查看自己的仓库信息了.

![](https://ww3.sinaimg.cn/large/006tNbRwgy1fded7yh8ugj31kw19djyk.jpg)

#### 使用仓库

发布到Cocoapods后，在终端更新本地pods仓库信息

	$ pod setup

查询仓库
	
	$ pod search BYPhoneNumTF
---
	-> BYPhoneNumTF (1.0.0)
	   A delightful TextField of PhoneNumber
	   pod 'BYPhoneNumTF', '~> 1.0.0'
	   - Homepage: https://github.com/qiubaiying/BYPhoneNumTF
	   - Source:   https://github.com/qiubaiying/BYPhoneNumTF.git
	   - Versions: 1.0.0, 0.0.1 [BYPhoneNumTF repo]
	(END)

若出现仓库信息说明已经成功了，这时候你就可以在 `Podfile` 添加、使用自己的仓库了 `pod 'BYPhoneNumTF', '~> 1.0.0'`

![](https://ww1.sinaimg.cn/large/006tNbRwgy1fdedvficvaj30fu0loaex.jpg)

#### 更新维护

当你的代码更新维护后，就需要重写发布，流程是：

- 更新`BYPhoneNumTF.podspec`中的版本号
- 打上标签推送远程
- `pod trunk push BYPhoneNumTF.podspec` 推送到pods仓库

更新后你就可以在 [CocoaPods Master Repo](https://github.com/CocoaPods/Specs) 仓库上看到自己的提交记录了。

![](https://ww4.sinaimg.cn/large/006tNbRwgy1fdfkr2l7omj31kw0d7446.jpg)





