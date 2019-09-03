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
    console.log(data.toString())
})
```