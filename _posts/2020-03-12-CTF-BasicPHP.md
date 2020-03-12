---
layout:     post   				    # 使用的布局（不需要改）
title:       	BasicPHP			# 标题 
#subtitle:   脚本，xss #副标题
date:       2020-03-12 				# 时间
author:     s-seven 						# 作者
header-img: img/post-bg-2015.jpg 	#这篇文章标题背景图片
catalog: true 						# 是否归档
tags:								#标签
    - 学习
---

# Basic PHP1

这一道题是要通过页面给的代码推得参数的值，并通过url传参得到flag

`if (isset($_GET['name']) and isset($_GET['password']) && isset($_GET['test']))`

这句话保证了三个参数都不为空，要有值

```php
$test=$_GET['test']; 
$test=md5($test); 
if($test=='0')
```

同前面一道题，test是一个md5后以0开头的数

```php
 if ($_GET['name'] == $_GET['password'])
else if (sha1($_GET['name']) === sha1($_GET['password']))
```

这两句保证了name和password不相等，通过数组绕过sha1的验证，则name[]=1&password[]=2即可

## SHA

安全哈希算法（Secure Hash Algorithm）的思想是接收一段明文，然后以一种不可逆的方式将它转换成一段（通常更小）密文，也可以简单的理解为取一串输入码（称为预映射或信息），并把它们转化为长度较短、位数固定的输出序列即散列值（也称为信息摘要或信息认证代码）的过程。散列函数值可以说是对明文的一种“指纹”或是“摘要”所以对散列值的数字签名就可以视为对此明文的数字签名。

SHA-1是一种数据加密算法，该算法的思想是接收一段明文，然后以一种不可逆的方式将它转换成一段（通常更小）密文，也可以简单的理解为取一串输入码（称为预映射或信息），并把它们转化为长度较短、位数固定的输出序列即散列值（也称为信息摘要或信息认证代码）的过程。

# Basic PHP2

![1.jpg](http://ww1.sinaimg.cn/large/005KQQDely1gcr2r1oy2gj30mh070wev.jpg)

题目中说要写一个webshell，那么什么是webshell?

web指的是在web服务器上，而shell是用脚本语言编写的脚本程序，webshell就是就是web的一个管理工具，可以对web服务器进行操作的权限，也叫webadmin。web指的是在web服务器上，而shell是用脚本语言编写的脚本程序，webshell就是就是web的一个管理工具，可以对web服务器进行操作的权限，也叫webadmin

常见攻击方式有：直接上传获取webshell、SQL注入、远程文件包含(RFI)、FTP，甚至使用跨站点脚本(XSS)作为攻击的一部分

然后我们随便输入一点东西进入PHP页面

```php
<?php
if(isset($_GET['content'])){
    $filename = 'config.php';
    $content = $_GET['content'];

    if(is_int(stripos($content, 'php')) || is_int(stripos($content, '<'))) {
        echo 'Invalid input';
    } else {
        file_put_contents($filename, $content);
        echo 'Success';
    }
}
```

根据php代码看出，通过URL需要传递一个GET参数content。

条件是is_int(stripos($content, ‘php’)) || is_int(stripos($content, ‘<’))都是否，才能进入else分支，即过滤掉’php’和’<’字符。

> stripos函数是查找字符串在另一字符串中第一次出现的位置（不区分大小写）

即在content文件中查找php第一次出现的位置和’<’第一次出现的位置，有则返回位置，没有则返回false。字符串位置从 0 开始，不是从 1 开始。

> file_put_contents() 函数把一个字符串写入文件中。

把content参数的值写入config.php文件中。

方法：数组绕过
绕过stripos()函数，就不用执行if分支。可以使用数组绕过，即让content为数组形式。

然后我给conten[]随便赋值，发现提示成功，但是点开config.php发现。文件里面是我赋值的内容，并不符合我的预期，然后我把if的条件也就是php和<赋值给conten[]，发现PHP中给出了flag，虽然感觉有点稀里糊涂的，但是还是拿到了flag。