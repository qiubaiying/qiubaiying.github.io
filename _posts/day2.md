---
layout:     post
title:      Nodejs第二天
subtitle:   
date:       2019-6-14
author:     xinxin
header-img: img/tag-bg-o.jpg
catalog: true
tags:
    - nodejs
---


当 采用无分好的代码风格的时候至于要注意以

(  [   `开头的 之前必须加分号





Apache   域名与www的文件名相同

根据文件目录来















 

```javascript
var http = require("http")
var fs=require("fs")
server = http.createServer()
//创建server
server.on("request",function(rec,res){
    var url=rec.url
    // if(url==="/"){
    //     res.end("hello word")
    // }else{
    //     res.end("404 Not Found")
    // }
if(url==='/'){
    fs.readFile('./index.html',function(err,data){
        if(err){
            return res.end('404 Not Found1')
            //return 有两个作用
            // 1.方法返回值
            // 2.阻止代码继续往后执行
        }
        res.end(data)
    })
}else if(url==='/a.txt'){
    fss.readFile('./a.txt',function(err,data){
        if(err){
            return res.end('404 Not Found1')
        }
        res.end(data)
    })
}else if(url==='/apple/login.html'){
    fs.readFile('./apple/login.html',function(err,data){
        if(err){
            return res.end('404 Not Found')
        }
            res.end(data)
        
    })
}



})
//监听server 的request请求事件
// 设置处理函数
// 请求-->处理-->响应,如果已经结束响应,则不能重复发送响应
// 
server.listen(3000,function(){
    console.log("running")
})


```















 

```javascript
var http = require("http")
var fs=require("fs")
server = http.createServer()
var wwwDir="."
server.on("request",function(rec,res){
    var url=rec.url
var filePath=wwwDir+'/index.html'
if(url!=="/"){
    filePath=wwwDir+url
}
console.log(filePath)
fs.readFile(filePath,function(err,data){
    if(err){
        return res.end("404 Not Fount")
    }
    res.end(data)
})
})
server.listen(3000,function(){
    console.log("running")
})
```





模板引擎

在html中预留需要替换的位置

根据file生成需要替换的内容

如果不适用模板引擎 

在es6中的${}来引用变量













 

```javascript
<script src="node_modules/art-template/lib/template-web.js"></script>
<script type="text/template" id="tpl">

</script>
```















 

```javascript
readdir()
```













 

```javascript
//在nodejs中使用模板引擎
// 1.安装 在需要的文件模块中
// 2.使用require方法使用
// 3.查文档
//fs默认读到的是二进制数据
//而模板引擎的render方法需要接受的是字符串
var wwwDir='.'
var http=require('http')
var fs=require('fs')
var template=require('art-template')


server=http.createServer()
server.on('request',function(rec,res){

// var url=rec.url
var pathfile='./index.html'
// if(url!=='/'){
// pathfile=wwwDir+url
// }
console.log(pathfile)
fs.readFile(pathfile,function(err,data){
if(err){
res.end("404")
}
// data=data.toString()
var ret=template.render(data.toString(),{
name:"jack"
})

res.end(ret)
})
// var ret=template.render(,{
// name:'jack'
// })
// res.end(ret)
})
server.listen(3000,function(){

console.log("runing")
})


```





服务端渲染--->在服务端使用模板引擎     不利于seo优化

客户端渲染











 

```javascript
//在nodejs中使用模板引擎
// 1.安装 在需要的文件模块中
// 2.使用require方法使用
// 3.查文档
//fs默认读到的是二进制数据
//而模板引擎的render方法需要接受的是字符串
var wwwDir='.'
var http=require('http')
var fs=require('fs')
var template=require('art-template')


server=http.createServer()
server.on('request',function(rec,res){

    // var url=rec.url
    var pathfile='./index.html'
    // if(url!=='/'){
    //     pathfile=wwwDir+url
    // }
    console.log(pathfile)
    fs.readFile(pathfile,function(err,data){
        if(err){
            res.end("404")
        }
        // data=data.toString()
        var ret=template.render(data.toString(),{
            name:"jack"
        })

        res.end(ret)
    })

})
server.listen(3000,function(){

    console.log("runing")
})


```