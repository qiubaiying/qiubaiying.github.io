---
layout:     post 
title:      JavaScript基础
subtitle:   JavaScript
date:       2019-10-08
author:     张鹏
header-img: img/post-bg-js-version.jpg
catalog: true   
tags:                         
    - JavaScript
---

#### JavaScript的数组

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JavaScript数组</title>
    <!--js的数组
    1.数组的声明
        var arr=new Array();//声明一个空数组对象、
        var arr=new Array(5);//声明一个长度为5的数组
        var arr=[1,2,3,4,5];//声明数组（最常用的）
        注意：
        js中的数组声明不用指定长度，js的数组长度是不固定的，会随着元素数量改变而改变
    2.数组的赋值和取值
        js中的数组可以存储任意类型的数据
            数组名[角标]=值;//角标可以是任意的正整数或者是0
        数组的取值：数组名[角标]//返回当前角标对应存储的值
            如果角标不存在，返回undefined
    3.数组的length属性
        作用1：数组名.length：返回当前数组的长度
        作用2：数组名.length=新的值：动态的改变数组的长度
            如果length>原有长度，则使用空进行填充
            length<原有长度，则从后面进行截取，最后的数据会被删除
    4.数组的遍历
        普通的for循环
            for (var i=0;i<arr.length;i++){
            alert(arr[i]);
        }
        for-in
            for (var i in arr){
            alert(i);//获取的是角标
        }
    -->
    <!--<script type="text/javascript">
        //1.数组的声明
        var arr1=new Array();//第一种声明方式
        arr1[0]="abc";
        alert(arr1);
        var arr2=new Array(5);//第二种声明方式为声明一个长度为5的数组
        alert(arr2.length);
        var arr3=[1,2,3,4,5];
        alert(arr3);
        var arr4=new Array([5,6]);//把一个数组当作第一个元素存进了另一个数组arr4
        alert(arr4.length);
    </script>-->

    <!--数组的赋值和取值-->
    <!--<script type="text/javascript">
        //声明数组
        var arr=[];
        arr[0]="1";
        arr[1]="abc";
        arr[2]=true;
        arr[3]=new Date();
        arr[10]="哈哈哈";
        alert(arr);
        alert(arr[10]);//数组的取值
        alert(arr[14]);
    </script>-->
    <!--数组的length属性-->
    <!--<script type="text/javascript">
        var arr=[1,2,3,4,5,6];
        alert(arr.length);
        arr.length=8;
        alert(arr.length);
        arr[2]="abc";
        alert(arr);
        arr.length=3;
        alert(arr);
    </script>-->
    <!--数组的遍历-->
    <script type="text/javascript">
        //数组的遍历
        var arr=[1,"zxx",3,"a",4];
        alert(arr);
        //遍历1
        /*for (var i=0;i<arr.length;i++){
            alert(arr[i]);
        }*/
        //遍历2
        for (var i in arr){
            alert(i);
        }
    </script>
</head>
<body>
<h3>js的数组</h3>
</body>
</html>
```

#### JS的计算器练习

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>计算器</title>
    <!--声明css代码域-->
    <style type="text/css">
        #showdiv{
            border: solid 1px;
            border-radius: 10px;
            width: 320px;
            height: 400px;
            text-align: center;
            margin: 50px auto;
            background-color: cadetblue;
        }
        input[type=text]{
            margin-top: 10px;
            border-radius: 10px;
            width: 290px;
            height: 40px;
            font-size: 20px;
        }
        input[type=button]{
            border-radius: 10px;
            font-size: 20px;
            font-weight: bold;
            width: 60px;
            height: 60px;
            margin-top: 20px;
            margin-left: 5px;
            margin-right: 5px;
        }
    </style>
    <!--声明js代码域-->
    <script type="text/javascript">
        //声明函数
        function test(btn) {
            //获取button按钮对象的value值
            var num=btn.value;
            //根据用户点击动作执行对应的业务逻辑
           switch (num) {
               case "=":
                   document.getElementById("inp").value=eval(document.getElementById("inp").value)
                   break;
               case "c":
                   document.getElementById("inp").value="";
                   break;
               default:
                   //将按钮的值赋值给input输入框
                   document.getElementById("inp").value=document.getElementById("inp").value+num;
                   break;
           }
        }
    </script>
</head>
<body>
<div id="showdiv">
<input type="text" id="inp" readonly="readonly"><br>
    <input type="button" value="0" id="btn" onclick="test(this)">
    <input type="button" value="1" onclick="test(this)">
    <input type="button" value="2" onclick="test(this)">
    <input type="button" value="3" onclick="test(this)"><br>
    <input type="button" value="4" onclick="test(this)">
    <input type="button" value="5" onclick="test(this)">
    <input type="button" value="6" onclick="test(this)">
    <input type="button" value="7" onclick="test(this)"><br>
    <input type="button" value="8" onclick="test(this)">
    <input type="button" value="9" onclick="test(this)">
    <input type="button" value="+" onclick="test(this)">
    <input type="button" value="-" onclick="test(this)"><br>
    <input type="button" value="*" onclick="test(this)">
    <input type="button" value="/" onclick="test(this)">
    <input type="button" value="=" onclick="test(this)">
    <input type="button" value="c" onclick="test(this)">
</div>
</body>
</html>
```