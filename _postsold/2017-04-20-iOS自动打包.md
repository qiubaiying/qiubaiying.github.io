---
layout:     post
title:      iOS自动打包
subtitle:   利用 xcdeobulid 打包项目、上传
date:       2017-04-20
author:     BY
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - iOS
    - Xcode
    - shell
    - ruby
---



> 利用xcode的命令行工具 `xcdeobulid` 进行项目的编译打包，生成ipa包，并上传到fir

# 前言
现在网上的自动打包教程几乎都还是`xcodebuild + xcrun`的方式先生成`.app`包 再生成`.ipa`包,结果弄了一整天硬是没成功~

后来发现`PackageApplication is deprecated`，悲剧。然后手动压缩的 `.ipa`包因为签名问题无法装到手机上。

后来用了`archive + -exportArchive`终于可以了~

# 正文

## Xcodebuild

**xcodebuild** 的使用可以用 `man xcodebuild`查看。

查看项目详情

	# cd 项目主目录
	xcodebuild -list
	
输出项目的信息

	Information about project "StackGameSceneKit":
	    Targets:
	        StackGameSceneKit
	        StackGameSceneKitTests
	
	    Build Configurations:
	        Debug
	        Release
	
	    If no build configuration is specified and -scheme is not passed then "Release" is used.
	
	    Schemes:
	        StackGameSceneKit

要留意 `Configurations`，`Schemes`这两个属性。

## 自动打包流程

### 生成 archive

生成archive的命令是 `xcodebuild archive` 

	xcodebuild archive -workspace ${project_name}.xcworkspace \
                   -scheme ${scheme_name} \
                   -configuration ${build_configuration} \
                   -archivePath ${export_archive_path}

- 参数一：项目类型，，如果是混合项目 workspace 就用 `-workspace`，如果是 project 就用 `-project`

- `-scheme`：项目名，上面`xcodebuild -list`中的 `Schemes`

- `-configuration `：编译类型，在`configuration`选择, `Debug` 或者 `Release`

- `-archivePath`：生成 archive 包的路径，需要精确到 `xx/xx.archive`

首先需要创建一个`AdHocExportOptions.plist`文件


### 导出ipa包

导出`.ipa`包经常会出现错误，~~在ruby2.4.0版本中会报错，所以请使用其他版本的ruby~~,最初的原因是使用了 ruby2.4.0 进行编译时出现的错误。

解决方法是低版本的 ruby 进行编译，如使用系统版本：`rvm use system`。后面升级macOS系统（10.12.5）后发现 ruby2.4.0 能成功 导出ipa包了。

导出ipa包使用命令：`xcodebuild  -exportArchive`

	xcodebuild  -exportArchive \
	            -archivePath ${export_archive_path} \
	            -exportPath ${export_ipa_path} \
	            -exportOptionsPlist ${ExportOptionsPlistPath}


- `archivePath`：上面生成 archive 的路径
- `-exportPath`：导出 ipa包 的路径
- `exportOptionsPlist`：导出 ipa包 类型，需要指定格式的`plist`文件，分别是`AppStroe`、`AdHoc`、`Enterprise`,如下图

![](https://ww3.sinaimg.cn/large/006tNc79gy1ff1bcz534ij30g609uq48.jpg)

选择这三个类别需要分别创建三个`plist`文件：

- `AdHocExportOptionsPlist.plist`
	
	![](https://ww3.sinaimg.cn/large/006tNc79gy1ff1bhmwvxfj30ax01pdfu.jpg)
- `AppStoreExportOptionsPlist.plist`

	![](https://ww3.sinaimg.cn/large/006tNc79gy1ff1bijdlsgj30bh01st8q.jpg)
- `EnterpriseExportOptionsPlist.plist`

	![](https://ww4.sinaimg.cn/large/006tNc79gy1ff1bishpk8j30be01sglm.jpg)


### 上传到 Fir

将项目上传到 [Fir](https://fir.im)

下载 [fir 命令行工具](https://github.com/FIRHQ/fir-cli/blob/master/doc/install.md) 

	gem install fir-cli

获取 fir 的 API Token（右上角）

![](https://ww3.sinaimg.cn/large/006tNc79gy1ff28ccsqhyj304t07bwei.jpg)

上传

	fir publish "ipa_Path" -T "firApiToken"
	


## 自动打包脚本

~~再次提醒，请不要使用 ruby 2.4.0 运行该脚本！~~，若在 ruby 2.4.0 下编译失败，请切换低版本的ruby。

切换完毕记得重新安装 fir 命令行工具。

脚本我fork了 [jkpang](https://github.com/jkpang/PPAutoPackageScript) 的脚本进行修改，添加了自动上传到 fir 的功能。

使用方法在Github上有详细介绍。

GitHub：<https://github.com/qiubaiying/iOSAutoArchiveScript>


### 利用 自定义终端指令 简化打包过程

以zsh为例:

	open ~/.zshrc
添加自定义命令 cd + sh

	alias mybuild='cd 项目地址/iOSAutoArchiveScript/ &&  sh 项目地址/iOSAutoArchiveScript/iOSAutoArchiveScript.sh'
这样打开终端输入`mybuild`，就可以轻松实现一键打包上传了

> 本文首次发布于 [BY Blog](http://qiubaiying.github.io), 作者 [@柏荧(BY)](http://github.com/qiubaiying) ,转载请保留原文链接.
