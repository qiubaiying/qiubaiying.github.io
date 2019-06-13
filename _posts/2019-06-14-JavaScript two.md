
---
layout:     post
title:      JavaScript 第二天学习
subtitle:   JavaScript快速学习及与其他语言对比
date:       2019-6-14
author:     xinxin
header-img: img/tag-bg-o.jpg
catalog: true
tags:
    - JavaScript
---


对象中



this始终指向当前对象

在重构函数中应当注意

要保存一下this变量









 

```
var xiaoming={
    name:'小明',
    birth:1980,
    
    age:function(){
        var that=this;
        function getage(){
            var y= new Date().getFullYear();
            return  y-that.birth;
        }
        return getage();
    }

}
```





可以使用apply指定this的指向

第一个参数为需要绑定的函数本身的参数

第二个参数是array,表示函数本身的参数









 

```
function getAge(){
    var y= new Date().getFullYear();
    return y-this.birth;
}
var xioaming={
    name:"小明",
    birth:1990,
    age:getAge
}
getAge.apply(xiaoming,[]);
```





call()把参数按顺序传入

apply将参数打包成数组数组传入



使用apply可以改变函数的行为







可以使用对调用函数的次数进行统计(装饰器)









 

```
       var count=0;
        var ordparsenInt =parseInt;
        window.parseInt=function(){
            count++;
            return ordparsenInt(null,arguments);
        }

```







和Python不同的map\reduce函数的条用方法不同

arr.map(string)

arr.reduce(function)







sort函数与Python不同

sort函数先将数字转化为字符串之后再进行比较

所以









 

```
[1,2,10,20].sort();//1,10,2,20
```





但sort是高阶函数可以传比较函数



Python的sorted与sort函数不同

Python生成新的对象

sort函数对当前的进行操作





**闭包**

函数不会立即执行直到调用了f()才执行

因此不要在函数闭包中使用**循环体**











 

```
function count() {
    var arr = [];
    for (var i=1; i<=3; i++) {
        arr.push(function () {
            return i * i;
        });
    }
    return arr;
}

var results = count();
var f1 = results[0];
var f2 = results[1];
var f3 = results[2];

f1(); // 16
f2(); // 16
f3(); // 16

//等到三个函数都返回 此时的i已经变为 4   在调用是f()为6
```









立即执行3*3的函数语句









 

```
(function(x){
return x*x;
})(3);

```





把push后的语句变为立即执行语句  保存数组的值




正则表达式
```javascript
\d 
//匹配一个数字
\w
//匹配一个字母或数字
.
//任意匹配
*
//表示任意个字符(包括零个)
\d{3}
//匹配3个数字
\s
//匹配一个空格     \s+表示至少有一个空格
\d{3,8}   
//匹配3-8个数字

^表示行开头
$表示行末尾
```