---
layout:     post
title:      用本地浏览器打开远程服务器上的Jupyter Notebook
subtitle:   Jupyter Notebook的一个小技巧
date:       2020-04-15
author:     YM
header-img: img/4.jpg
catalog: true
tags:
    - 服务器
	- Jupyter Notebook
---

网络上有好多好多的相关解答，但是都太繁琐，我也没有尝试成功。

最后在李沐学长的《动手学深度学习》里面提供的方案的帮助下，成功解决了这个件事😉。

#### 第一步 在服务器的命令行输入 jupyter notebook

<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200415084326316.png" alt="image-20200415084326316" style="zoom:50%;" />

然后记下最后输出的token

#### 第二步 在本地命令行输入

对于上面的情况，他在服务器上显示的地址是8888（被我涂了。。。）

```
ssh -i "/path/to/key.pem" username@ip -L 8889:localhost:8888
```

然后输入上面这段代码，把username和ip位置填入服务器上的相关信息
可能会让你输入一下服务器的密码
这样就映射到本地的8889

#### 第三步 在本地输入地址

打开chrome，输入http://localhost:8889/

然后再输入你刚才保存的token，就可以正常访问你服务器的Jupyter Notebook啦！

<img src="https://testxiaoming.oss-cn-shanghai.aliyuncs.com/img/image-20200415092215858.png" alt="image-20200415092215858" style="zoom:50%;" />
