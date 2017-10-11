---
layout:     post
title:      Centos7 MariaDB安装
subtitle:   Centos7 MariaDB安装及使用
date:       2017-10-11
author:     Shuaiqijun
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - Centos
    - MariaDB
---

Centos7 MariaDB安装
===========================
MariaDB 是 MySQL 数据库的自由开源分支，与 MySQL 在设计思想上同出一源，在未来仍将是自由且开源的。Red Hat Enterprise Linux/CentOS 7.0 发行版已将默认的数据库从 MySQL 切换到 MariaDB.
****
Author:Shuaiqijun
E-mail:42687880@qq.com
****
## 安装MariaDB-server

yum -y update  
yum -y install mysql  
yum -y install mariadb-server mariadb-client  
systemctl enable mariadb  
systemctl start mariadb  
systemctl status mariadb  

[root@centos-rpi2 ~]# systemctl status mariadb  
● mariadb.service - MariaDB database server  
   Loaded: loaded (/usr/lib/systemd/system/mariadb.service; enabled; vendor preset: disabled)  
   Active: active (running) since Wed 2017-10-11 09:46:50 HKT; 4h 12min ago  
 Main PID: 1425 (mysqld_safe)  
   CGroup: /system.slice/mariadb.service  
           ├─1425 /bin/sh /usr/bin/mysqld_safe --basedir=/usr  
           └─1587 /usr/libexec/mysqld --basedir=/usr --datadir=/var/lib/mysql...  
  
Oct 11 09:46:36 centos-rpi2 mariadb-prepare-db-dir[1346]: Initializing MariaD...  
Oct 11 09:46:37 centos-rpi2 mariadb-prepare-db-dir[1346]: 171011  9:46:37 [No...  
Oct 11 09:46:38 centos-rpi2 mariadb-prepare-db-dir[1346]: 171011  9:46:38 [No...  
Oct 11 09:46:39 centos-rpi2 mariadb-prepare-db-dir[1346]: PLEASE REMEMBER TO ...  
Oct 11 09:46:39 centos-rpi2 mariadb-prepare-db-dir[1346]: To do so, start the...  
Oct 11 09:46:39 centos-rpi2 mariadb-prepare-db-dir[1346]: '/usr/bin/mysqladmi...  
Oct 11 09:46:39 centos-rpi2 mariadb-prepare-db-dir[1346]: '/usr/bin/mysqladmi...  
Oct 11 09:46:40 centos-rpi2 mysqld_safe[1425]: 171011 09:46:40 mysqld_safe L....  
Oct 11 09:46:40 centos-rpi2 mysqld_safe[1425]: 171011 09:46:40 mysqld_safe S...l  
Oct 11 09:46:50 centos-rpi2 systemd[1]: Started MariaDB database server.  
Hint: Some lines were ellipsized, use -l to show in full.  


### 配置root账户
-----------
mysql -u root -p  
直接回车   
[root@centos-rpi2 ~]# mysql -u root -p  
Enter password:   
Welcome to the MariaDB monitor.  Commands end with ; or \g.  
Your MariaDB connection id is 5  
Server version: 5.5.56-MariaDB MariaDB Server  
  
Copyright (c) 2000, 2017, Oracle, MariaDB Corporation Ab and others.    
  
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.  
  
MariaDB [(none)]>   
  
use mysql;  
update user set password=password('Shuai_sqj') where user='root';  
grant all privileges on *.* to 'root'@'%' identified by 'Shuai_sqj' with grant option;   //创建root远程管理  
flush privileges;  
exit  
  
  
  
`[网站建设](http://www.rsson.cn "中立信网络科技")`|[网站建设](http://www.rsson.cn "中立信网络科技")|
--------------------------------
[csdn]:http://blog.csdn.net/shuaiqijun "我的博客"
[zhihu]:https://www.zhihu.com/people/jellywong "我的知乎，欢迎关注"
[weibo]:http://weibo.com/linpiaochen
[baidu-logo]:http://www.baidu.com/img/bdlogo.gif "百度logo"
[weibo-logo]:/img/weibo.png "点击图片进入我的微博"
[csdn-logo]:/img/csdn.png "我的CSDN博客"
[foryou]:https://github.com/shuaiqijun/ImageCache/raw/master/Logo/foryou.gif
