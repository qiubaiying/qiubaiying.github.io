---
layout:     post
title:      Spring Boot获取前端页面参数的几种方式总结
subtitle:   
date:       2020-08-08
author:     Joey
header-img: img/post-bg-hacker.jpg
tags:
    - Web
    - JavaScript
    - 前端
    - Spring Boot
---

## 前言

`Spring Boot`的一个好处就是通过注解可以轻松获取前端页面的参数，之后可以将参数经过一系列处理传送到后台数据库，前段时间正好用到，但是忘得差不多了，获得的方式有很多种，这种东西不写下来一段时间不用就忘得差不多了，感觉记性越来越差了呢，这里稍微总结一下，大致分为以下几种：
　　
1. 指定前端url请求参数名称与方法名一致，见下图，这种方式简单来说就是url请求格式中的参数需要与方法的参数名称对应上，举个例子，这么一个url请求http://localhost:8080/0919/test1?name=xxx&pwd=yyy，在指定的控制器类上加上`Controller`注解，同时指定RequestMapping注解即可，当请求路径参数与方法参数匹配上时会自动注入

![如图](https://img-blog.csdnimg.cn/img_convert/e56a36d8c64b0b5f2fddc98bfc5705c4.png)

启动主程序，访问浏览器出现下图，表明注入参数成功，这种方式一般是get请求

![如图](https://img-blog.csdnimg.cn/img_convert/3622e8e89af376f7e42fd8ef1dce2ecb.png)

2. 第二种方式是通过HttpServletRequest来获取前端页面参数，代码见下图 ，简单来说就是通过调用request的getParameter方法来获取参数，比如访问路径类似这样http://localhost:8080/0919/test2?firstName=zhang&lastName=san

![如图](https://img-blog.csdnimg.cn/img_convert/0b408ef229233888f0b02c43c64c97ed.png)

启动主程序，访问浏览器出现下图，表明注入参数成功，这种方式也可以获取表单参数，一般get和post请求都可以

![如图](https://img-blog.csdnimg.cn/img_convert/c5af1278060458183f9c1de344e945f0.png)

3. 第三种方式是通过创建一个JavaBean对象来封装表单参数或者是请求url路径中的参数，具体代码见下图)

![如图](https://img-blog.csdnimg.cn/img_convert/4d2fd05091ca0321753aeccaaa1e6f86.png)

对应的JavaBean对象是下面这个

![如图](https://img-blog.csdnimg.cn/img_convert/1100e0302c7ea1e3a41e21a075eb558d.png)

简单来说就是将表单参数作为一个JavaBean类的属性，通过设置方法参数为一个JavaBean对象，之后在方法中通过调用对象的get方法来获取表单传过来的参数，比如访问路径是这个http://localhost:8080/0919/test3?firstName=zhang&lastName=san 启动主程序，在浏览器访问见下图，表明注入参数成功，这种方式如果请求的表单参数很多可以考虑使用这种方式

4. 第四种方式是通过PathVariable注解来绑定请求路径的参数，参考代码见下
![如图](https://img-blog.csdnimg.cn/img_convert/6bb03da3fa7cc78bd0b3921a2239660d.png)

这种情况简单来说就是url中采用动态绑定的形式表示，之后在方法中指定的参数通过PathVariable来将请求的url中的参数绑定到方法参数，这里在不指定PathVariable注解的具体值时按照请求路径中的动态变量顺序与注解顺序一致即可注入 ，如果想指定注入，那么指定PathVariable注解的值与动态变量的名一致即可特定注入。比如请求路径是这个http://localhost:8080/0919/test4/111/222

启动主程序，在浏览器访问，出现下图表明注入参数成功

![如图](https://img-blog.csdnimg.cn/img_convert/197b1cbb6845213cb8cc8413c6b8219b.png)

5. 第五种方式是通过RequestParam注解来获取，具体代码见下

![如图](https://img-blog.csdnimg.cn/img_convert/f09e506df3535168d84212e5e4eaf403.png)

这种方式是通过url路径的形式将请求路径上的参数绑定到方法的参数上，简单来说就是实参值赋给相应的形参，与上面那种方式的区别是前者是动态url模板注入，这里是个普通的url请求注入·，比如访问路径是这个http://localhost:8080/0919/test5?aaa=111&bbb=4444

启动主程序，访问该请求，浏览器出现下面这个表明注入参数成功，这里可以通过指定RequestParam的value值来指定url请求路径参数指定注入到哪个具体方法参数，不过一般两者名字一致比较方便

![如图](https://img-blog.csdnimg.cn/img_convert/4b6e12b2b2b8e3029f137b486c2cdb04.png)

6. 第六种方式是通过ModelAttribute方式来注入参数，具体代码见下
![如图](https://img-blog.csdnimg.cn/img_convert/73cfa96471c5beac5a89d4a402d634d3.png)

这种方式一般是通过在页面展示，所以这里创建两个页面做测试test2.jsp和test3.jsp进行测试

![如图](https://img-blog.csdnimg.cn/img_convert/1ffd489d70faad3ffabb06e1ebafba98.png)

![如图](https://img-blog.csdnimg.cn/img_convert/4d39d39fec3f1b96354cfe24bff3e6e6.png)

简单来说就是通过ModelAttribute注解将请求参数封装到指定的JavaBean对象，同时通过value值将这个接受了表单参数的对象赋给value，这里就是将s赋给了一个变量名为kkk的存在，之后就可以在jsp页面通过这个变量名使用el表达式来获取从表单传过来的参数，这里测试路径是http://localhost:8080/0919/kkk，访问在浏览器进行测试，见下图

![如图](https://img-blog.csdnimg.cn/img_convert/87aed8edde726fff55d6067da5aa626a.png)

点击提交，出现下图，表明表单参数成功被后台接受并在前台页面输出，这种方式一般是需要在前台页面输出的时候使用

![如图](https://img-blog.csdnimg.cn/img_convert/bf93b71966ee0e56d0ab12fb2f86f5ca.png)

#### 总结

总的来说Spring Boot获取前端页面参数的方式大致就上面这几种，可以根据自己的实际情况来选择其中的任意一种方式，个人一般推荐前三种方式，当然具体选哪种还是因人而异。这里简单写了一点简单demo做下测试记录防止长时间不用又忘了，毕竟博客的作用就是这样嘛，同时供有需要的同僚们拿过来参考，那么这篇就这样了到此结束

End

> 本文首次发布于 [Joey Blog](http://qiaoyu113.github.io), 作者 [@乔宇(Joey)](http://github.com/qiaoyu113) ,转载请保留原文链接..