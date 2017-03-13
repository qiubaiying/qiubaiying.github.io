---
layout:     post
title:      mac在jupyter notebook里显示中文的方法
subtitle:   show chinese in mac jupyter notebook
date:       2016-11-11
author:     Nico
header-img: img/post_bg_4.jpg
catalog: 	 true
tags:
    - jupyter
    - mac
    - python
    - chinese
---

笔者今天折腾在jupyter notebook里显示中文的问题折腾了3个小时以上。。。

所以虽然好久没有更新博客了，这次一定要把方法记录下来！

一共三步：

1. 下载一个微软雅黑的中文字体包，要ttf格式，双击安装

下载地址：http://www.pc6.com/mac/116742.html

2. 清空matplot字体缓存目录

```shell
rm ~/.matplotlib/fontList.cache
```

3. 打开jupyter notebook，如果已经打开了就restart一遍，载入matplot，用plt.rc自定义字体

![](https://nicozheng.files.wordpress.com/2016/11/screen-shot-2016-11-11-at-4-46-03-am.png)

然后就好了 >____<

![](https://nicozheng.files.wordpress.com/2016/11/screen-shot-2016-11-11-at-4-47-16-am.png)

__Note__

如果还不行，到finder里面shift+command+g， 输入缓存文件的目录

~/.matplotlib/fontList.cache

然后用记事本打开 fontList.cache 文件看一下里面有没有雅黑的字体，比如我的：

![](https://nicozheng.files.wordpress.com/2016/11/screen-shot-2016-11-11-at-4-50-03-am.png)

没有就肯定是哪里出了问题， 自己google吧。。。
