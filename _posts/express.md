---
layout:     post
title:      Nodejs之express框架
subtitle:   
date:       2019-6-14
author:     xinxin
header-img: img/tag-bg-o.jpg
catalog: true
tags:
    - nodejs
    - express.js
--- 

```javascript
var express = require('express')
var app=express()
app.get('/',function(req,res){
    res.send(`

    你好

    `)
})
app.listen(3000,function(){
console.log("sever running at 3000")
})
```







Apache









 

```javascript
//使用nodejs中的
app.use('public',express.static('public'))
```









**加载模板引擎**

第一个参数表示渲染易.art为结尾文件,使用art-template引擎

express-art-template是专门来在express中把art-templat整合到art-template中









 

```javascript
app.engine('art',require('express-art-template'))
```







reder默认回去views目录下中找文件









 

```javascript
app.get('/',function(req,res){
    res.render('404.html')
})
```







修改默认的路径









 

```javascript
app.set('views',目录路径)
```









重定向









 

```javascript
res.statusCode=302
res.setHeader('Location','/')
```





使用express的重定向









 

```javascript
res.redirect('/')
```









**路由**

app.js









 

```javascript
var express = require('express')
var router = require('./router')
var app = express()
app.use(router)
```





app.use() 中间件的概念

不仅仅是用来处理静态资源

配置body-parse也是通过app.use来配置



router.js











 

```javascript
var express=require('express')
var router = express.Router()
router.get('/',function(req,res){
})
```