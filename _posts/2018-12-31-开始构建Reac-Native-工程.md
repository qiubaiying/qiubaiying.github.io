---
layout:     post
title:      构建 RN 项目
subtitle:   Hello React Native
date:       2018-12-31
header-img: img/post-bg-blog.jpg
catalog: true
tags:
    - React Native
---

# 开发环境

### node & watchman
Mac上 Homebrew 类似Linux上的apt-get，便于安装软件
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
brew install node
brew install watchman

如果没有外网，需要设置镜像源，便于项目构建
npm config set registry https://registry.npm.taobao.org --global
npm config set disturl https://npm.taobao.org/dist --global
```

### Yarn、React Native 的命令行工具
`npm install -g yarn react-native-cli`
```
// 设置镜像源（没有外网的同学）
yarn config set registry https://registry.npm.taobao.org --global
yarn config set disturl https://npm.taobao.org/dist --global
```
安装完 yarn 之后就可以用 yarn 代替 npm 了，例如用yarn代替npm install命令，用yarn add 某第三方库名代替npm install 某第三方库名。

### 目标平台 Android
React Native 需要 Java Development Kit [JDK] 1.8，暂不支持1.9
##### Jdk
查看当前 jdk 版本`javac -version` [JDK-1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

#####  [下载 Android Studio](https://developer.android.com/studio/)

安装的时候请确保勾选以下必须项
```
Android SDK
Android SDK Platform
Performance (Intel ® HAXM)
Android Virtual Device
```
##### 环境变量
配置文件默认: `~/.bash_profile`，如果使用了[zsh](https://ohmyz.sh/) 的话，配置文件则是 `~/.zshrc`，文件末尾添加如下
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```
然后 `source ~/.bash_profile` 或 `source ~/.zshrc` 使环境变量生效。

创建项目并运行
```bash
react-native init project-name

emulator -avd Nexus_5X_API_27 > /dev/null

cd ~/projects/tmpPro/TestProject
react-native run-android
```

### 目标平台 IOS

##### xCode
去[Apple开发者官网](https://developer.apple.com/xcode/downloads/)下载 xCode 或者在 AppStore 上搜索并下载

##### pods
参考这篇博客[CocoaPods-安装和使用](https://tanliner.github.io/2018/12/20/CocoaPods-%E5%AE%89%E8%A3%85%E5%92%8C%E4%BD%BF%E7%94%A8/)

##### run IOS
```bash
cd ~/projects/tmpPro/TestProject
react-native run-android
```

### 总结

主要介绍了如何从零构建 RN 项目，为后续的 RN 开发做好准备

![](https://raw.githubusercontent.com/tanliner/ImageHolder/master/img/20181231-RN-introduction-init.jpg)
![](https://raw.githubusercontent.com/tanliner/ImageHolder/master/img/20181231-RN-introduction-init-done.jpg)
![](https://raw.githubusercontent.com/tanliner/ImageHolder/master/img/20181231-RN-run-android.jpg)
![](https://raw.githubusercontent.com/tanliner/ImageHolder/master/img/20181231-RN-run-android-preview.jpg)
