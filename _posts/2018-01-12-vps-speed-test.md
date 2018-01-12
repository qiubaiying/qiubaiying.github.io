---
layout:     post
title:      自己用过的vps速度测试
subtitle:   既然折腾，那就挑最好的折腾吧，争取把各种折腾过的vps都记录一遍
date:       2018-01-12
author:     某清
header-img: img/post-bg-py.jpg
catalog: true
tags:
    - Blog
    - ssr
---

## 准备
**脚本** 统一标准，都用的[这个](>http://www.vpsdx.com/3499.html)测速脚本  
**软件** [putty](http://183.91.33.52/sw.bos.baidu.com/sw-search-sp/software/473c4b8568792/PuTTY_0.67.0.0.exe)  
**环境** nwu百兆校园网  

## 开始  
putty登录vps，执行以下脚本链接，选择全网测速  
>wget https://raw.githubusercontent.com/oooldking/script/master/superspeed.sh
chmod +x superspeed.sh
./superspeed.sh

## 结果  
vps服务商       价格       地点       ping值       备注
vultr          2.5$/m     迈阿密     v4.272/v6.452           
瓦工           19.5$/y    洛杉矶     v4.213/v6.424  
截图
[![vultr迈阿密2.5刀/月](https://github.com/shiqingk/shiqingk.github.io/blob/master/img/blog-tw-speed-01.png?raw=true)](http://shiqingk.github.io/)
[![瓦工19.5刀/年](https://github.com/shiqingk/shiqingk.github.io/blob/master/img/blog-tw-speed-02.png?raw=true)](http://shiqingk.github.io/)

## 总结
运营商       套餐       评价       
vultr      2.5$/m        电信太差  
瓦工        19.5$/y        移动较好
