---
layout:     post
title:      JavaScript 第三天学习
subtitle:   JavaScript快速学习及与其他语言对比
date:       2019-6-14
author:     xinxin
header-img: img/tag-bg-o.jpg
catalog: true
tags:
    - JavaScript
 ---
 
 
 generator生成器

javascript中的生成器与Python的生成器语法相似







用classed方法定义









 

```
var fib={
    a:0,
    b:1,
    n:0,
    max:10,
    next:function(){
        var   
            t=this.a,
            r=this.b;
            if(this.n<this.max){
                this.n++;
                [this.a,this.b]=[r,t+r];
                return t;
            }
           
    }

}

console.log(fib.next())//0
console.log(fib.next())//1
console.log(fib.next())//1
console.log(fib.next())//2
console.log(fib.next())//3
console.log(fib.next())//5
console.log(fib.next())//8



```





用生成器的方式定义









 

```
function* fib(max){
    var
    t,
    a=0,
    b=1,
    n=0;
    while(n<max){
        yield a;
        [a,b]=[b,a+b];
        n++;
    }
    return ;
}
var f=fib(5);
// console.log(f.next());
// console.log(f.next());
// console.log(f.next());
// console.log(f.next());
// console.log(f.next());
// console.log(f.next());
for(var x of fib(10))
{
console.log(x);
}

```











生成器把异步回调变为同步代码



---
layout:     post
title:      JavaScript第三天学习
subtitle:   JavaScript快速学习及与其他语言对比
date:       2019-6-14
author:     xinxin
header-img: img/tag-bg-o.jpg
catalog: true
tags:
    - JavaScript
---






**包装对象**

java  int 和 Integer







- 不要使用`new Number()`、`new Boolean()`、`new String()`创建包装对象；
- 用`parseInt()`或`parseFloat()`来转换任意类型到`number`；
- 用`String()`来转换任意类型到`string`，或者直接调用某个对象的`toString()`方法；
- 通常不必把任意类型转换为`boolean`再判断，因为可以直接写`if (myVar) {...}`；
- `typeof`操作符可以判断出`number`、`boolean`、`string`、`function`和`undefined`；
- 判断`Array`要使用`Array.isArray(arr)`；
- 判断`null`请使用`myVar === null`；
- 判断某个全局变量是否存在用`typeof window.myVar === 'undefined'`；
- 函数内部判断某个变量是否存在用`typeof myVar === 'undefined'`。

更细心的同学指出，`number`对象调用`toString()`报SyntaxError：

```
123.toString(); // SyntaxError
```

遇到这种情况，要特殊处理一下：

```
123..toString(); // '123', 注意是两个点！
(123).toString(); // '123'
```