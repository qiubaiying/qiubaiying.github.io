---
layout:     post 
title:      JavaScript基础
subtitle:   JavaScript
date:       2019-09-23
author:     张鹏
header-img: img/home-bg.jpg
catalog: true   
tags:                         
    - JavaScript
---

#### JavaScript

- ECMAScript是JavaScript的标准，所以一般情况下这两个词我们认为是一个意思
- 一个完整的JavaScript实现应该有：**ECMAScript、DOM（文件对象模型）、BOM（浏览器对象模型）**三部分组成

#### JS特点

- 解释性语言
- 类似于C和Java的语言结构
- 动态语言
- 基于原型的面向对象

#### JS编写的位置

1. 可以将JS代码写到标签的onclick属性中

```html
<button onclick="alert('hello World');">按钮</button>
```

2. 可以将JS代码写到超链接的href属性中，当点击超链接时，会执行JS代码

```html
<a href="javascript:alert('hello world');">超链接</a>
```

3. 可以将JS写到script标签中
4. 可以将JS写到js文件中，通过script标签的src属性引入

#### 字面量和变量

- JS中使用var定义一个变量

```js
var a=10;
```
