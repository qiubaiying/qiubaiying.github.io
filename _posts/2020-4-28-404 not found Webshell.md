---
layout:     post
title:      404 not found Webshell
subtitle:   骚思路
date:       2020-04-26
author:     BugMan
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - Webshell
    - PHP
---
# 404 not found Webshell

克隆或下载项目：

```
git clone https://github.com/CosasDePuma/SecurityNotFound.git SecurityNotFound
cd SecurityNotFound
```

## 安装

src/404.php文件应位于目标服务器上。
该服务器必须具有执行.php文件的能力。
这是服务器所在的一些最常见路由的示例：

# Windows (Xampp)

```
C:\Xampp\htdocs\
```

# Linux

```
/var/www/html/
```

现在，您可以通过浏览器访问它：

```
https://www.target.com/404.php
```

您可以替换服务器404错误模板以从任何无效的URL访问。
要访问控制面板，请TAB按键或使用浏览器的工具搜索密码字段。

默认密码是：cosasdepuma。
您可以将$passphrase 变量在脚本中保留为空字符串，以直接访问控制面板。
要设置自定义值，请$passphrase在MD5连续三次后将密码插入变量。
控制面板
