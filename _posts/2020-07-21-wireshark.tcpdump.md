---
layout: post
title: wireshark和tcpdump的使用方法
subtitle: wireshark、nmap和tcpdump
date: 2020-07-20
author: mr_king
header-img: img/background.jpg
catalog: true
tags: 
    -wireshark和tcpdump
    -web
    -学习笔记
---
# tcpdump
1.tcpdump -c 10
指定要抓的数据包的数量，指定"-c 10"将获取 10 个包，但可能已经处理了 100 个包，只不过只有 10 个包是满足条件的包

2.tcpdump -D
查看哪些端口可以抓包

3.tcpdump -i eth0 -c 10
指定接口

4.-n 和-nn
-n: 对地址以数字方式显式，否则显式为主机名，也就是说-n 选项不做主机名解析
-nn: 把端口显示为数值，否则显示端口服务名
对比下上图```tcpdump -i eth0 -c 10```红色方框的部分
```tcpdump -i eth0 -c 10 -n```
```tcpdump -i eth0 -c 10 -nn```

5.-x 和-xx；-X 和-XX，最常用的是-XX
-x：以 16 进制打印出每个包的数据(不包括连接层的头部)-xx：以 16 进制打印出每个包的数据-X：输出包头部的数据，以 16 进制和 ASCII 两种方式同时输出（不包括连接层的头部）-XX：输出包头部的数据，会以 16 进制和 ASCII 两种方式同时输出。

6.-v，-vv 答应详细输出，一个比一个详细

7.包保存到指定文件-w，从指定文件读取包答应到屏幕-r

8. 过滤指定主机 tcpdump host qiyun

9.tcpdump -i eth0 -c 10 -nn src host qiyun tcpdump -i eth0 -c 10 -nn dst host qiyun
 源与目的，src 与 dst

10.协议过滤 tcpdump -i eth0 -c 10 -nn ud
tcpdump -i eth0 -c 10 -nn icmp 

11.  过滤网段
tcpdump -i eth0 -c 10 -nn net 192.168

12.  过滤端口
tcpdump udp port 53

13.协议字段过滤
表达式单元之间可以使用操作符" and / && / or / || / not / ! "进行连接

14. 过滤 syn 包和 fin 包
tcpdump -i eth0 -c 10 -nn 'tcp[tcpflags] & (tcp-syn|tcp-fin) != 0'

15.过滤 tcp 80 端口，ip 包长度大于 1000 的包（ip[2:2]表示整个 ip 数据包的长度）
tcpdump -i eth0 -c 10 -nn 'tcp port 80 and ip[2:2] > 1000'

16.过滤 icmp 的 reply 包
tcpdump -i eth0 -c 10 -nn 'icmp[icmptype] == icmp-echoreply'


nmap

1.常见参数
-sS/sT/sA/sW/sM:指定使用 TCP SYN/Connect()/ACK/Window/Maimon scans 的方式来对目
标主机进行扫描。
-sU: 指定使用 UDP 扫描方式确定目标主机的 UDP 端口状况。
-sN/sF/sX: 指定使用 TCP Null, FIN, and Xmas scans 秘密扫描方式来协助探测对方的 TCP 端口
状态。
--scanflags <flags>: 定制 TCP 包的 flags。
-sI <zombiehost[:probeport]>: 指定使用 idle scan 方式来扫描目标主机（前提需要找到合适的
zombie host）
-sY/sZ: 使用 SCTP INIT/COOKIE-ECHO 来扫描 SCTP 协议端口的开放的情况。
-sO: 使用 IP protocol 扫描确定目标机支持的协议类型。
-b <FTP relay host>: 使用 FTP bounce scan 扫描方式

2.端口参数与扫描顺序
-p <port ranges>: 扫描指定的端口
实例: -p22; -p1-65535; -p U:53,111,137,T:21-25,80,139,8080,S:9
（其中 T 代表 TCP 协议、U 代表 UDP 协议、S 代表 SCTP 协议）
-F: Fast mode – 快速模式，仅扫描 TOP 100 的端口
-r: 不进行端口随机打乱的操作 （如无该参数，nmap 会将要扫描的端口以随机顺序方式扫描，以
让 nmap 的扫描不易被对方防火墙检测到）。
--top-ports <number>:扫描开放概率最高的 number 个端口 （nmap 的作者曾经做过大规模地互
联网扫描，以此统计出网络上各种端口可能开放的概率。
以此排列出最有可能开放端口的列表，具体可以参见文件：nmap-services。
默认情况下，nmap 会扫描最有可能的 1000 个 TCP 端口）
--port-ratio <ratio>: 扫描指定频率以上的端口。 与上述--top-ports 类似，这里以概率作为参
数，让概率大于--port-ratio 的端口才被扫描。
显然参数必须在在 0 到 1 之间，具体范围概率情况可以查看 nmap-services 文件。


3.版本探测常用参数
-sV: 指定让 Nmap 进行版本侦测
--version-intensity <level>: 指定版本侦测强度（0-9），默认为 7。数值越高，探测出的服务越
准确，但是运行时间会比较长。
--version-light: 指定使用轻量侦测方式 (intensity 2)
--version-all: 尝试使用所有的 probes 进行侦测 (intensity 9)
--version-trace: 显示出详细的版本侦测过程信息。


4.操作系统探测常用参数
-O: 指定 Nmap 进行 OS 侦测。
--osscan-limit: 限制 Nmap 只对确定的主机的进行 OS 探测（至少需确知该主机分别有一个 open
和 closed 的端口）。
--osscan-guess: 大胆猜测对方的主机的系统类型。由此准确性会下降不少，但会尽可能多为用户
提供潜在的操作系统。

5.NSE 脚本用法
-sC: 等价于 --script=default，使用默认类别的脚本进行扫描。
--script=<Lua scripts>: <Lua scripts>使用某个或某类脚本进行扫描，支持通配符描述
--script-args=<n1=v1,[n2=v2,...]>: 为脚本提供默认参数
--script-args-file=filename: 使用文件来为脚本提供参数
--script-trace: 显示脚本执行过程中发送与接收的数据
--script-updatedb: 更新脚本数据库
--script-help=<Lua scripts>: 显示脚本的帮助信息，其中<Luascripts>部分可以逗号分隔的文件
或脚本类别。```
- 举例如下：- 使用`nmap -vv -p3306 --script=mysql-brute 192.168.2.12`破解 mysql 登录密码


# wrieshark
1.wireshark 过滤规则
过滤源 ip，语法： 源 ip：ip.src == IP 或 ip.src eq IP
目的 ip：```ip.dst == IP``` 或 ```ip.dst eq IP```
指定主机 ip，源或目的: ```ip.host == IP``` 或 ```ip.host eq IP```，或者用```ip.addr```
指定的源 ip 或指定的目的 ip: ```ip.src == IP or ip.dst == IP```
指定的源 ip 并且指定的目的 ip: ```ip.src == IP and ip.dst == IP```

2.2 端口过滤
端口过滤非常常用，要指明协议是```tcp```还是```udp```，可以用```srcport```，```dstport```，```port```，端口可以用比较符合```>```，```>=```，```<```，```<=```，```==```，```eq```，例子如下：
过滤目的端口是 80 端口的```tcp```报文
tcp.dstport == 80

过滤端口是 80 的```tcp```报文 或者端口是 53 的```udp```报文
udp.port == 53 or tcp.port == 80

过滤源端口号大于 1024 的```tcp```报文
tcp.dstport >1024






