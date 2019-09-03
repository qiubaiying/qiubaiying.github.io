---
layout:     post 
title:      Node.js
subtitle:   Node.js简单操作
date:       2019-09-03
author:     张鹏
header-img: img/post-bg-js-version.jpg
catalog: true   
tags:                         
    - Node.js
---

# Node.js


### 查看Node.js版本

- 命令行窗口输入`node --version`

### 利用node.js运行js文件

1.创建编写JavaScript脚本文件
2.打开终端，定位到脚本文件所属目录
3.输入：node 文件名 执行对应的文件（文件名不要使用node.js来命名，最好也不要使用中文）

### 利用node.js读取文件

- 浏览器中的JavaScript是没有文件操作能力的，但是node.js中的JavaScript是具有文件操作能力的
- fs是file-system的缩写，就是文件系统的意思，在Node中如果想要进行文件操作，就必须引入fs这个核心模块
- 在fs这个核心模块中，就提供了所有的文件操作相关的API

```javascript
//1.使用require方法加载fs核心模块
//2.读取文件
//   第一个参数是要读取的文件路径
//   第二个参数是一个回调函数
//   成功
//     data 数据
//     error null
//   失败
//     data null
//     error 错误对象
var fs=require('fs')
fs.readFile('./A.txt',function(error,data){
//因为会把文件中的数据转成16进制，所以用toString方法来转换
    if(error){
        console.log('文件不存在')
    }else{
        console.log(data.toString())
    }
})
```
### 利用node.js写入文件

```javascript
//第一个参数：文件路径
//第二个参数：文件内容
//第三个参数：回调函数
//error
//成功：
//文件写入成功
//error null
//失败
//文件写入失败
//error是错误对象
var fs=require('fs')
fs.writeFile('./readme.md','大家好，我是Node.js'，function(error){
    if(error){
        console.log('文件创建失败')
    }else{
        console.log('文件创建成功')
    }
})
```
### 简单的http服务

- 使用node构建一个简单的web服务器
- 在node中专门提供了一个核心模块：http

```javascript
var http=require(http)//加载http核心模块
var server=http.createServer()//使用http.createServer()方法创建一个web服务器
server.on('request',function(){
	console.log('收到客户端的请求了')
})//接收请求(注册request请求事件，当客户端请求过来，就会自动触发服务器的request请求时间，然后执行第二个参数，回调处理函数)
server.listen(3000,function(){
	console.log('服务器启动成功了，可以通过http://127.0.0.1:3000来进行访问')
})//绑定端口号，启动服务器
```