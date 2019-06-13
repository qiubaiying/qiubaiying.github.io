---
layout:     post
title:      JavaScript 第一天学习
subtitle:   JavaScript快速学习及与其他语言对比
date:       2019-6-14
author:     xinxin
header-img: img/tag-bg-o.jpg
catalog: true
tags:
    - JavaScript
---




JavaScript做逻辑运算时

==

运算符会强制转化类型

0==false  返回的true

所以一般使用三个等号运算符

Python作比较时不会强制转化了类型





javascprit 的字典  键都是字符串类型的

而Python可以是任意的类型



javascprit 更改字符串中的一个字符是无效操作

而c语言可以改变

Python会出现错误









indexOf返回第一出现某字符串/数组的位置









 

```
var s='hello world';
s.indexOf('world');//返回6
s="hello world world";
s.indexOf("world");
s.indexOf("world")

```





toLowerCase()将字符串转化为大写

toUpperCase()将字符串转化为小写

substring(0,5)返回制定索引区间的子串(不包括第五个)

在数组中slice()相当与字符串中subustring()

substring\slice如果只有一个参数,返回从这个参数开始到最后一个字符\列表





  





Python  列表不存在    length方法

JavaScript中的

a.length可更改大小使得数组剩余的empty









 

```
var arr=[1,2,3];
arr.length;//返回3
arr.length=6
arr//返回[1, 2, 3, empty × 3]
```











数组的操作









 

```
unshift()//在头部加元素
shift()//把头部元素删去
sort()//对数组进行排序
reverse()//反转数组

```







用splice()修改数组第一个参数是删除的位置

第二个参数是删除的元素个数

后面的参数是插入的元素









 

```
var arr = ['Microsoft', 'Apple', 'Yahoo', 'AOL', 'Excite', 'Oracle'];
// 从索引2开始删除3个元素,然后再添加两个元素:
arr.splice(2, 3, 'Google', 'Facebook'); // 返回删除的元素 ['Yahoo', 'AOL', 'Excite']
arr; // ['Microsoft', 'Apple', 'Google', 'Facebook', 'Oracle']
// 只删除,不添加:
arr.splice(2, 2); // ['Google', 'Facebook']
arr; // ['Microsoft', 'Apple', 'Oracle']
// 只添加,不删除:
arr.splice(2, 0, 'Google', 'Facebook'); // 返回[],因为没有删除任何元素
arr; // ['Microsoft', 'Apple', 'Google', 'Facebook', 'Oracle']
```







concat()

把一个数组和另个数组链接在一起

arr.join()返回字符串在数组加入字符默认逗号







字典类型





键的名称是字符类型

引用时使用









 

```
a.name
a["name"]
```





删除        delete xiaoming.age

添加操作   xiaoming.age=18

用   in来判断一个属性是否存在





和c语言一样拥有for(;;) 语句,与c语言不同的是作用域不同,一般使用let语句









 

```
for(var i=0;i<10;i++){
    
}
i+=10;//不报错
```















 

```
for(let i=0;i<10;i++){
    
}
i+=10;//报错
```









和Python一致拥有for ... in 语句  不一致的是遍历的是元素的下标





for(var .. of ..)语法与Python一致

存在while()

和do....while()语句













由于javascript

对象的键只能为字符串

在es6标准中引入

Map和Set









 

```
var m= new Map([["Michael",95],["Bob",75],["Tracy",85]]);
m.get("Michael");


var m = new Map(); // 空Map
m.set('Adam', 67); // 添加新的key-value
m.set('Bob', 59);
m.has('Adam'); // 是否存在key 'Adam': true
m.get('Adam'); // 67
m.delete('Adam'); // 删除key 'Adam'
m.get('Adam'); // undefined


var s1 = new Set(); // 空Set
var s2 = new Set([1, 2, 3]); // 含1, 2, 3

```









遍历Map











 

```
var m=new Map([[1,"x"],[2,"y"],[3,["z"]]])
for(var x of m){
    console.log(x[0]+":"+x[1]);
}
    
```









javascpript允许穿任意的参数,可以用argument获取所有的参数

参数被整合为一个列表









 

```
function foo(x){
       console.log("x"+x);
       for(var i=0;i<arguments.length;i++){
           console.log(arguments[i])
       }
   }
foo([1,3,3],1,2,3)

```





可以用...c(任意)获取剩余的参数









 

```
 function foo(a,b,...c){
                console.log(c);
             }   
            foo(1,2,3,4,5,6,7);
//3,4,5,6,7
```











JavaScript在行末自动加分号

小心return语句





变量提升

JavaScript会先扫描整个函数体后  把所有申明的语句提升到函数顶部,所以下面的函数不报错









 

```
'use strict';

function foo() {
    var x = 'Hello, ' + y;
    console.log(x);
    var y = 'Bob';
}

foo();
```













和c语言一样都存在const语句

定义一个不可修改的变量







解析赋值









 

```
let [x, [y, z]] = ['hello', ['JavaScript', 'ES6']];
//忽略某些元素
let [, , z] = ['hello', 'JavaScript', 'ES6'];
//制定某些元素
var person = {
    name: '小明',
    age: 20,
    gender: 'male',
    passport: 'G-12345678',
    school: 'No.4 middle school'
};
var {name, age, passport} = person;
```