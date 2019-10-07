---
layout:     post 
title:      JavaScript基础
subtitle:   JavaScript
date:       2019-10-07
author:     张鹏
header-img: img/post-bg-js-version.jpg
catalog: true   
tags:                         
    - JavaScript
---

#### `==、===`关系运算符

```JavaScript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JS特殊关系运算符</title>
    <!--
    等值运算符：==
            先判断类型，类型一致则直接比较。类型不一致，则先使用Number()进行强转后再进行比较
    等同运算符：===
            先判断类型，类型一致再比较内容，内容也一致则返回true。类型不一致则直接false，内容不一致则返回false

    注意：
            null和undefined在做==判断时返回true
    -->
    <script type="text/javascript">
        /*声明变量*/
        var a=1;
        var a1="1";
        var a2=true;
        var a3="true";
        var a4="a";
        var a5="a";
        /*alert(a==a1);//true
        alert(a==a2);//true
        alert(a==a3);//false
        alert(a1==a2);//true
        alert(a1==a3);//false
        alert(a2==a3);//false*/

        alert(a===a1);//false
        alert(a===a2);//false
        alert(a===a3);//false
        alert(a1===a2);//false
        alert(a1===a3);//false
        alert(a2===a3);//false
        alert(a4===a5);//true

        alert(null==undefined);//true
    </script>
</head>
<body>

</body>
</html>
```

#### JS的逻辑结构和循环结构

```JavaScript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JS的逻辑结构和循环结构</title>
    <!--
    JS逻辑结构：
            if结构：
                单分支结构：
                    if（判断条件）{执行体}
                双分支结构：
                    if（判断条件）{执行体1}else{执行体2}
                多分支结构：
                    if（判断条件1）{执行体1}else if（判断条件2）{执行体2}...else{执行体n}
            switch结构：
                var a=1;
                switch (a) {
                    case 1:
                        alert("第一项选择");
                        break;
                    case 2:
                        alert("第二项选择");
                        break;
                    default:
                        alert("没有对应的选项");
                        break;
                    }
              注意：
              判断的变量可以是Number类型，也可以是String类型，但不能够混用

    JS循环结构：
            for循环：
                    for(变量;条件;迭代条件){循环体}
            while循环：
                    while(循环条件){循环体}
            do{}while()循环：
                    do{循环体}while(循环条件)
    -->
    <script type="text/javascript">
        /*
        声明变量
         */
        var a=123;
        var b=45;
        if (a>10){
            alert(a+b);
        }

        /*声明变量：switch结构*/
        var a=1;
        switch (a) {
            case 1:
                alert("第一项选择");
                break;
            case 2:
                alert("第二项选择");
                break;
            default:
                alert("没有对应的选项");
                break;

        }
        /*------------------------------------------------------------------*/
    //    循环结构学习
        for (var a=0;a<3;a++){
            alert("a="+a);
        }

        /*演示99乘法表*/
        for (var i=1;i<=9;i++){
            for (j=1;j<=i;j++){
                document.write(i+"*"+j+"="+i*j+"&nbsp;&nbsp;&nbsp;");
            }
            document.write("<br/>")
        }
    </script>
</head>
<body>

</body>
</html>
```