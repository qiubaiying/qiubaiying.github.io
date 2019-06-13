---
layout:     post
title:      Nodejs之处理post请求
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
var bodyParser = require('body-parser')
var app = express()
//配置body-parser
//加入这个配置,在req请求中会多出一个body属性
//通过req.body就可以获取post的请求了

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.write('you posted:\n')
  res.end(JSON.stringify(req.body, null, 2))
})
```

```javascript
.post('/post',function(req,res){
// console.log(req.body)//
    //{ name: 'asfsdafasd', message: 'asdfasdfasdfasd' }

var conmen=req.body
conmen.dateTime='2018-07-08'
conment.unshift(conmen)
res.redirect('/')
})
```

