
---
layout:     post
title:      JavaScript 第四天学习
subtitle:   JavaScript快速学习及与其他语言对比
date:       2019-6-14
author:     xinxin
header-img: img/tag-bg-o.jpg
catalog: true
tags:
    - JavaScript
---


**游览器对象**



windows









 





```
windows.innerWidth    //游览器视窗宽度
windows.innerHeight   //游览器视窗高度
windows.outerWidth    //整个浏览器宽度
wondows.outerHeight   //整个浏览器高度
```







navigator









 





```
navigator.appName   //游览器名称
navigator.appVersion  //浏览器版本
navigator.language   //浏览器设置语言
navigator.platform     //操作系统类型
navigator.userAgent    //浏览器设定的usera-Agent字符串
getIevVrsion(navigator.userAgent)//获取ie的版本
```





screen对象表示屏幕信息









 





```
screen.width           //屏幕宽度，以像素为单位；
screen.height          //屏幕高度，以像素为单位；
screen.colorDepth      //返回颜色位数，如8、16、24。
```





confirm







document

访问整个html以dom  形式表示的树形结构,document对象就是整个dom树的根节点











 





```
document.title//访问<title></title>标签
document.getElementById  //按照id访问
document.getElementsByTagname  //按标签名
document.getElementsByClassName()   //按类名

```





cookie中的  httpOnly  来组着JavaScript读取cookie

