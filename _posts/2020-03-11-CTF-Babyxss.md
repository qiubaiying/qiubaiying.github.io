---
layout:     post   				    # 使用的布局（不需要改）
title:      BabyXSS 				# 标题 
#subtitle:   脚本，xss #副标题
date:       2020-03-11 				# 时间
author:     s-seven 						# 作者
header-img: img/post-bg-2015.jpg 	#这篇文章标题背景图片
catalog: true 						# 是否归档
tags:								#标签
    - 学习
---

# Baby Xss

## 什么是XSS

XSS攻击(Cross Site Scripting)通常指的是通过利用网页开发时留下的漏洞，通过巧妙的方法注入恶意指令代码到网页，使用户加载并执行攻击者恶意制造的网页程序。这些恶意网页程序通常是JavaScript，但实际上也可以包括Java、 VBScript、ActiveX、 Flash 或者甚至是普通的HTML。攻击成功后，攻击者可能得到包括但不限于更高的权限（如执行一些操作）、私密网页内容、会话和cookie等各种内容。

跨站脚本攻击是最普遍的Web应用安全漏洞，XSS的攻击方式就是想办法“教唆”用户的浏览器去执行一些这个网页中原本不存在的前端代码。

本题是通过盗用cookie来实现的。在网页浏览中我们常常涉及到用户登录，登录完毕之后服务端会返回一个cookie值。这个cookie值相当于一个令牌，拿着这张令牌就等同于证明了你是某个用户。

如果你的cookie值被窃取，那么攻击者很可能能够直接利用你的这张令牌不用密码就登录你的账户。如果想要通过script脚本获得当前页面的cookie值，通常会用到document.cookie。

> https://zhuanlan.zhihu.com/p/26177815>(浅谈XSS攻击的那些事)

这篇文章讲了很多，但是我没看懂多少，以后再回来看看

##Baby XSS（原来这就是注入呀）

打开题目链接，题目给了XSS平台，可以在这里得到cookie，还有一个proofofwork（说来惭愧我安装失败了）

substr((md5(‘proof of work’),0,6) === ‘4b3392’)
 这一行代码的意思是截取经过MD5编码的工作量的前6个数字，然后从网上找了个实现md5验证的代码

import hashlib
from itertools import count
mes = 'admin'
for i in count():
    md = hashlib.md5()
    str1 = str(i)
    md.update(str1.encode('utf-8'))
    hashid = md.hexdigest()
    if hashid.startswith('8644b4'):
        print(str1)
        break

> proof of work(感觉在这里充当了一个验证码的作用，对了才行)
>
> 工作量证明(Proof Of Work，简称POW)，简单理解就是一份证明，用来确认你做过一定量的工作。监测工作的整个过程通常是极为低效的，而通过对工作的结果进行认证来证明完成了相应的工作量，则是一种非常高效的方式。
>
> 工作量证明系统（或者说协议、函数），是一种应对拒绝服务攻击和其他服务滥用的经济对策。它要求发起者进行一定量的运算，也就意味着需要消耗计算机一定的时间。

题目告诉我们要通过admin来登陆，所以我们要获取token,代表管理员身份的令牌。

开始我尝试用burp来获取数据，后来发现cookie里面只有phpsessid,然后转向XSS平台

在平台注册后，创建一个项目，会给出植入代码

![q.jpg](http://ww1.sinaimg.cn/large/005KQQDely1gcq08w69iyj30s90jn76p.jpg)

随便复制一个，粘贴到解题界面的leave your message处

然后将md5验证码输入，跳转

![2.jpg](http://ww1.sinaimg.cn/large/005KQQDely1gcq0ahjvqxj30q809jjrq.jpg)

发现我的信息在admin里了，现在去XSS找cookie![屏幕截图.jpg](http://ww1.sinaimg.cn/large/005KQQDely1gcq0blq2bsj30ru094gmn.jpg)

复制token，打开burp准备修改cookie，点击admin.php页面跳转，在burp中将cookie修改为刚刚复制的值，即用管理员身份登陆，成功拿到flag

![ok.jpg](http://ww1.sinaimg.cn/large/005KQQDely1gcq0djfjctj30o90880sy.jpg)



## 关于token

token的意思是“令牌”，是服务端生成的一串字符串，作为客户端进行请求的一个标识。
当用户第一次登录后，服务器生成一个token并将此token返回给客户端，以后客户端只需带上这个token前来请求数据即可，无需再次带上用户名和密码。
简单token的组成；uid(用户唯一的身份标识)、time(当前时间的时间戳)、sign（签名，token的前几位以哈希算法压缩成的一定长度的十六进制字符串。为防止token泄露）。

关于web身份认证机制：
由于HTTP是一种没有状态的协议，它并不知道是谁访问了我们的应用。这里把用户看成是客户端，客户端使用用户名还有密码通过了身份验证，不过下次这个客户端再发送请求时候，还得再验证一下。
通用的解决方法就是，当用户请求登录的时候，如果没有问题，在服务端生成一条记录，在这个记录里可以说明登录的用户是谁，然后把这条记录的id发送给客户端，客户端收到以后把这个id存储在cookie里，下次该用户再次向服务端发送请求的时候，可以带上这个cookie，这样服务端会验证一下cookie里的信息，看能不能在服务端这里找到对应的记录，如果可以，说明用户已经通过了身份验证，就把用户请求的数据返回给客户端。



