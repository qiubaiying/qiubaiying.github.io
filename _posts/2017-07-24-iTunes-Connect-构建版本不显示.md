---
layout:     post
title:      iTunes Connect 构建版本不显示
subtitle:   App打包上传到 App Store, iTunes Connect 构建版本不显示
date:       2017-07-24
author:     BY
header-img: img/post-bg-ios10.jpg
catalog: true
tags:
    - iOS
    - Xcode
---


## 前言

今天新项目上架，在Xcode打包上传到App Store后，在iTunes Connect构建版本中居然找不到上传的App...

## 解决

从iOS10开始,苹果更加注重对用于隐私的保护,App 里边如果需要访问用户隐私,必须要做描述,所以要在 plist 文件中添加描述。

而这三个基础描述是必须添加的：

- **麦克风权限**：`Privacy - Microphone Usage Description` 是否允许此App使用你的麦克风？

- **相机权限**：`Privacy - Camera Usage Description` 是否允许此App使用你的相机？

- **相册权限**：`Privacy - Photo Library Usage Description` 是否允许此App访问你的媒体资料库？


其他的权限可以根据自己 APP 的情况来添加。

添加完权限之后然后继续提交 App 就可以了。

若还是找不到，返回 plist 文件中，删除之前的权限，重新添加一下，有可能你哪不小心添加的权限末尾有空格，或者字段不对。

End