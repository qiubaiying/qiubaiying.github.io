---
layout:     post
title:      tinyHTTP
subtitle:   Network assignment
date:       2017-10-010
author:     Shine
header-img: img/home-bg-art.jpg
catalog: true
tags:
    - linux
    - Network
    - c
---
tutorial
[http://blog.csdn.net/jcjc918/article/details/42129311](http://blog.csdn.net/jcjc918/article/details/42129311)

debug procedure:

1.remove -lsocket from the Makefile,remember using the administer account.

2.replace the first line of the cgi which included in the htdocs by follow line:

>>   #!/usr/bin/perl -Tw

3.compile:
on the terminal,enter the following command:
>>make httpd

remember in the directory of httpd.c and then run httpd by entering:

>>./httpd

4.open browser type
>> 127.0.0.1:port number

you will see this webpage

![](https://github.com/ShineMelody/shineMelody.github.io/blob/master/img/tinyhttp.png?raw=true)

and enter blue in the blank you will see:
![](https://github.com/ShineMelody/shineMelody.github.io/blob/master/img/tinyhtttp2.png?raw=true)

if you can't see this page,check:

1.Did you install perl?

2.check if CGI.pm is actually installed

Depending on your system,one way to install it is

>> perl -e shell -MCPAN

then type 

install CGI

3.modify the configuration files

/usr/local/apache2/conf httpd.conf

search the line 

ScriptAlias /cgi-bin/ "/usr/local/apache2/cgi-bin/"

<Directory "/usr/local/apache2/cgi-bin">

    AllowOverride None

    Options ExecCGI

    Order allow,deny

    Allow from all

</Directory>