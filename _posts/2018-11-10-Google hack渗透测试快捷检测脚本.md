---
layout:     post
title:      Web渗透测试：Google hack语法快捷检测脚本
subtitle:   web渗透测试
date:       2018-11-10
author:     黄秋豪
header-img: img\post-bg-ios9-web.jpg
catalog: true
tags:  

---

之前在公众号发布过一篇关于利用谷歌语法批量搜索漏洞的文章（[巧妙利用：Google Hacking引擎快速进行批量站点渗透](https://mp.weixin.qq.com/s/a8kaj8jPZ06pJ5vnMup4RQ)），内容有点多，现在提取结果常用的。废话不多说了，直接上语法。谷歌梯子请自行解决了。

1、查看目录遍历漏洞  

`语法为: site:www.baidu.com  intitle:index.of`

2、查看配置文件泄露  

`语法为: site:www.baidu.com ext:xml | ext:conf | ext:cnf | ext:reg | ext:inf | ext:rdp | ext:cfg | ext:txt | ext:ora | ext:ini`


3、查看数据库文件泄露

`site:www.baidu.com ext:sql | ext:dbf | ext:mdb`


4、查看日志文件泄露

`site:www.baidu.com ext:log`

5、查看备份和历史文件

`site:www.baidu.com ext:bkf | ext:bkp | ext:bak | ext:old | ext:backup`

6、查看SQL错误  

`site:www.baidu.com intext:”sql syntax near” | intext:”syntax error has occurred” | intext:”incorrect syntax near” | intext:”unexpected end of SQL command” | intext:”Warning: mysql_connect()” | intext:”Warning: mysql_query()” | intext:”Warning: pg_connect()”`

7、查看公开文件信息是否泄露  

`site:www.baidu.com ext:doc | ext:docx | ext:odt | ext:pdf | ext:rtf | ext:sxw | ext:psw | ext:ppt | ext:pptx | ext:pps | ext:csv`

8、查看phpinfo()文件泄露

`site:www.baidu.com ext:php intitle:phpinfo “published by the PHP Group”`

















