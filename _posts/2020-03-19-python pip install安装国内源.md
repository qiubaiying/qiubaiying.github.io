---
layout:     post                    # 使用的布局（不需要改）
title:      python pip               # 标题 
subtitle:   pip install使用国内源 #副标题
date:       2020-03-19              # 时间
author:     GF                      # 作者
#header-img: img/post-bg-2015.jpg    #这篇文章标题背景图片
catalog: true                       # 是否归档
tags:                               #标签
    - 开发技巧
---

用pip安装一些包时，下载速度慢还有可能失败，所以用国内源

阿里云 http://mirrors.aliyun.com/pypi/simple/

豆瓣(douban) http://pypi.douban.com/simple/ 

清华大学 https://pypi.tuna.tsinghua.edu.cn/simple/

中国科学技术大学 http://pypi.mirrors.ustc.edu.cn/simple/

使用方法：直接加 -i url就可，如

pip install pandas -i http://mirrors.aliyun.com/pypi/simple/

如果有报错说网站不可信任，根据提示加上 --trusted-host xxx即可

pip install pandas -i http://mirrors.aliyun.com/pypi/simple/   --trusted-host mirrors.aliyun.com

如果想配置成默认的源，方法如下：

需要创建或修改配置文件（一般都是创建），linux的文件在~/.pip/pip.conf（windows在%HOMEPATH%\pip\pip.ini）

修改内容为：

[global]

index-url = http://mirrors.aliyun.com/pypi/simple/

[install]

trusted-host=mirrors.aliyun.com