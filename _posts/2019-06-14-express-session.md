---
layout:     post
title:      Nodejs 保存登录状态
subtitle:   
date:       2019-6-14
author:     xinxin
header-img: img/tag-bg-o.jpg
catalog: true
tags:
    - nodejs
    
--- 


```javascript
var express = require('express')
var app = express()
var session = require('express-session')

app.use(session({
  // 配置加密字符串，它会在原有加密基础之上和这个字符串拼起来去加密
  // 目的是为了增加安全性，防止客户端恶意伪造
  secret: 'itcast',
  resave: false,
  saveUninitialized: false // 无论你是否使用 Session ，我都默认直接给你分配一把钥匙
}))
//使用
req.ression.uers=user
```

