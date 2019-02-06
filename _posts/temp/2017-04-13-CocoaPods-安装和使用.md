---
layout:     post
title:      CocoaPods 安装和使用
subtitle:   安装时间 2017/04/13, 环境macOS 12.10.1， cocoapod版本 1.2.1
date:       2017-04-13
author:     BY
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - iOS
    - Xcode
    - Cocopods
    - ruby
---

# 前言

最近换了新机器，重新搭建了开发环境，其中当然包括 **CocoaPods**。

装完顺便更新下 **CocoaPods** 安装文档。


# 正文


## 安装

**CocoaPods** 是用 ruby 实现的，要想使用它首先需要有 ruby 的环境。

#### 升级ruby

	查看ruby版本 
	$ ruby -v
	
	ruby 2.0.0p648 (2015-12-16 revision 53162) [universal.x86_64-darwin16]

CocoaPods需要**2.2.2**版本及以上的，我们先升级ruby。

使用 **rvm** 安装 ruby
	
	curl -L get.rvm.io | bash -s stable 
	source ~/.bashrc
	source ~/.bash_profile

切换 ruby 源

ruby 下载源使用亚马逊的云服务被墙了，切换国内的 **ruby-china源** （<https://ruby.taobao.org/>已经停止维护，详情[查看公告](https://ruby.taobao.org/)）：

	$ gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
	$ gem sources -l
	*** CURRENT SOURCES ***
	
	https://gems.ruby-china.org
	
安装并切换 ruby

> 这里不建议安装最新的 2.4.0 版本，因为次版本的 ruby，在xcodebuild 自动打包时，会出现问题！ 所以退一步，安装 2.3.3版本~

	rvm install 2.3.3 --disable-binary
	rvm use 2.3.3 --default
	
到此ruby升级完毕.

有关RVM的使用可以看这篇 [RVM 使用指南](http://qiubaiying.github.io/2017/04/28/RVM-使用指南/)

#### 安装CocoaPods

1. 安装
	
		sudo gem install -n /usr/local/bin cocoapods
2. 升级版本库

		pod setup
		
	这里需要下载版本库（非常庞大），需要等很久
	
		Receiving objects:  72% (865815/1197150), 150.07 MiB | 190.00 KiB/s
	
	或者直接从其他装有cocoapod的电脑中拷贝`~/.cocoapods`到你的用户目录，然后再 `pod setup`会节省不少时间
	
# 使用

#### 创建 `podfile` 文件

绝大多数人创建`podfile`都是用 `vim Podfile` 命令

其实pod 已经提供了创建 `podfile` 文件的命令，在工程目录下

	pod init
	
将会自动生成 `podfile` 文件，并且为你写好了格式，稍做修改就能使用

```
# Uncomment the next line to define a global platform for your project
# platform :ios, '9.0'

target 'projectName' do
  # Comment the next line if you're not using Swift and don't want to use dynamic frameworks
  use_frameworks!

  # Pods for projectName

  target 'projectNameTests' do
    inherit! :search_paths
    # Pods for testing
  end

  target 'projectNameUITests' do
    inherit! :search_paths
    # Pods for testing
  end

end
```

其中的

```
target 'projectNameTests' do
    inherit! :search_paths
    # Pods for testing
  end

  target 'projectNameUITests' do
    inherit! :search_paths
    # Pods for testing
  end
```

是指定在单元测试和UI测试时导入的测试框架，若没有使用测试框架可以删除。

修改iOS版本，添加`Alamofire`库

```
# Uncomment the next line to define a global platform for your project
# platform :ios, '8.0'

target 'projectName' do
  # Comment the next line if you're not using Swift and don't want to use dynamic frameworks
  use_frameworks!

  # Pods for projectName
  
  pod 'Alamofire', '~> 4.4'

end
```

#### 加载代码库

使用下面的命令，直接在本地版本库中查找对应的代码库信息，不升级版本库，节省时间

	pod install --verbose --no-repo-update

若找不到库，再使用下面的命令

	pod install

#### 版本号

对版本号的操作除了指定与不指定，你还可以做其他操作：

-  `\>0.1`  高于0.1的任何版本
- `\>=0.1`  版本0.1和任何更高版本
- `<0.1`  低于0.1的任何版本
- `<=0.1`  版本0.1和任何较低的版本
- `〜>0.1.2`  版本 0.1.2的版本到0.2 ，不包括0.2。
这个基于你指定的版本号的最后一个部分。这个例子等效于>= 0.1.2并且 <0.2.0，并且始终是你指定范围内的最新版本

# 结语

关于**CocoaPods**的安装和使用就这样简单的介绍完了，至于更多使用的方法（平时也用不到~）你可以用下面命令查看
	
	$ pod
	
若对 CocoaPods 的**个人仓库**感兴趣，也可以看看我的这两篇博客

- [CocoaPods公有仓库的创建](http://qiubaiying.top/2017/03/08/CocoaPods%E5%85%AC%E6%9C%89%E4%BB%93%E5%BA%93%E7%9A%84%E5%88%9B%E5%BB%BA/)
- [CocoaPods私有仓库的创建](http://qiubaiying.top/2017/03/10/CocoaPods%E7%A7%81%E6%9C%89%E4%BB%93%E5%BA%93%E7%9A%84%E5%88%9B%E5%BB%BA/)
 
 > 本文首次发布于 [BY Blog](http://qiubaiying.github.io), 作者 [@柏荧(BY)](http://github.com/qiubaiying) ,转载请保留原文链接.
