---
title: kernel的简单调优
date: 2017-12-19 03:00:10
tags: 系统调优
---
# 经过3年生产环境检验的sysctl.conf文件
## 可以看了一下服务器的TCP状态：netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
返回结果如下：
ESTABLISHED 1423
FIN_WAIT1 1
FIN_WAIT2 262
SYN_SENT 1
TIME_WAIT 962

###sysctl.conf文件

#开启重用。允许将TIME-WAIT sockets重新用于新的TCP连接，默认为0，表示关闭；
net.ipv4.tcp_tw_reuse = 1
#开启TCP连接中TIME-WAIT sockets的快速回收，默认为0，表示关闭。
net.ipv4.tcp_tw_recycle = 0
#调低端口释放后的等待时间， 默认为60s， 修改为15~30s
net.ipv4.tcp_fin_timeout = 15
#表示当keepalive起用的时候，TCP发送keepalive消息的频度。缺省是2小时，改为30s。
net.ipv4.tcp_keepalive_time = 30
#开启SYN Cookies。当出现SYN等待队列溢出时，启用cookies来处理，可防范少量SYN***，默认为0，表示关闭；
net.ipv4.tcp_syncookies = 1
#避免放大攻击
net.ipv4.icmp_echo_ignore_broadcasts = 1
#开启恶意icmp错误消息保护
net.ipv4.icmp_ignore_bogus_error_responses = 1
#开启并记录欺骗，源路由和重定向包
net.ipv4.conf.default.log_martians = 1
net.ipv4.conf.all.log_martians = 1
#表示SYN队列的长度，默认为1024，加大队列长度为8192，可以容纳更多等待连接的网络连接数。
net.ipv4.tcp_max_syn_backlog = 4096
#表示系统同时保持TIME_WAIT的最大数量，如果超过这个数字，TIME_WAIT将立刻被清除并打印警告信息。默认为180000，对于Apache、Nginx等服务器，上几行的参数可以很好地减少TIME_WAIT套接字数量，但是对于 Squid，效果却不大。此项参数可以控制TIME_WAIT的最大数量，避免Squid服务器被大量的TIME_WAIT拖死。
net.ipv4.tcp_max_tw_buckets = 1440000
#系统最大能打开的文件数,系统级的限制：/proc/sys/fs/file-max中设定了系统最大能打开的文件数。PS: 用户级别的限制ulimit 
fs.file-max = 655350
#swappiness=0的时候表示最大限度使用物理内存，然后才是 swap空间，swappiness＝100的时候表示积极的使用swap分区，并且把内存上的数据及时的搬运到swap空间里面。
vm.swappiness = 0
#默认操作系统对mmap计数的限制太低，可能引发内存不足的异常，在es安装过程中最常见
vm.max_map_count = 655350
#### 这三个参数当时加的情况，发生在几千台hadoop集群的服务器的namenode节点上，具体表现是nn来回切换，物理网络无问题时，ping时通时不通，报错ping:sendmsg: Invalid argument，加入一下三个参数后恢复正常。nn不再切换。
#存在于ARP高速缓存中的最少层数，如果少于这个数，垃圾收集器将不会运行。缺省值是128
net.ipv4.neigh.default.gc_thresh1 = 8192
#保存在 ARP 高速缓存中的最多的记录软限制。垃圾收集器在开始收集前，允许记录数超过这个数字 5 秒。缺省值是 51
net.ipv4.neigh.default.gc_thresh2 = 32768
保存在 ARP 高速缓存中的最多记录的硬限制，一旦高速缓存中的数目高于此，垃圾收集器将马上运行。缺省值是1024。
net.ipv4.neigh.default.gc_thresh3 = 65536
#net.core.somaxconn表示socket监听（listen）的backlog上限。backlog是socket的监听队列，当一个请求（request）尚未被处理或建立时，他会进入backlog。而socket server可以一次性处理backlog中的所有请求，处理后的请求不再位于监听队列中。当server处理请求较慢，以至于监听队列被填满后，新来的请求会被拒绝。在Hadoop 1.0中，参数ipc.server.listen.queue.size控制了服务端socket的监听队列长度，即backlog长度，默认值是128。而Linux的参数net.core.somaxconn默认值同样为128。当服务端繁忙时，如NameNode或JobTracker，128是远远不够的。这样就需要增大backlog，例如我们的3000台集群就将ipc.server.listen.queue.size设成了32768，为了使得整个参数达到预期效果，同样需要将kernel参数net.core.somaxconn设成一个大于等于32768的值
net.core.somaxconn = 4096
#注意！！！执行sysctl -p的时候nf_conntrack还没被加载。所以执行时报错no such file 所以你需要在/etc/modules-load.d/目录下建立一个conf结尾的文件里面是模块名称，例如我建立一个netfilter.conf，内容是：nf_conntrack，reboot测试生效。
1.内核参数 net.nf_conntrack_max 系统默认值为”65536”，当nf_conntrack模块被装置且服务器上连接超过这个设定的值时，系统会主动丢掉新连接包，直到连接小于此设置值才会恢复。同时内核参数“net.netfilter.nf_conntrack_tcp_timeout_established”系统默认值为”432000”，代表nf_conntrack的TCP连接记录时间默认是5天，致使nf_conntrack的值减不下来，丢包持续时间长。
2.nf_conntrack模块在首次装载或重新装载时，内核参数net.nf_conntrack_max会重新设置为默认值“65536”，并且不会调用sysctl设置为我们的预设值。
3.触发nf_conntrack模块首次装载比较隐蔽，任何调用IPtable NAT功能的操作都会触发。当系统没有挂载nf_conntrack模块时，iptables 相关命令（iptables -L -t nat）就成触发nf_conntrack模块装置，致使net.nf_conntrack_max 重设为65536。
4.触发nf_conntrack模块重新装载的操作很多，CentOS6 中“service iptables restart”，CentOS7中“systemctl restart firewalld”都会触发设置重置，致使net.nf_conntrack_max 重设为65536。
net.nf_conntrack_max = 99999999
net.netfilter.nf_conntrack_tcp_timeout_established = 300
net.netfilter.nf_conntrack_tcp_timeout_time_wait = 12
net.netfilter.nf_conntrack_tcp_timeout_close_wait = 60
net.netfilter.nf_conntrack_tcp_timeout_fin_wait = 120
#指定消息队列标识的最大数目，即系统范围内最大多少个消息队列。
kernel.msgmni = 16384
#控制内核信号量，信号量是System VIPC用于进程间通讯的方法。第一列，表示每个信号集中的最大信号量数目。第二列，表示系统范围内的最大信号量总数目。第三列，表示每个信号发生时的最大系统操作数目。第四列，表示系统范围内的最大信号集总数目。所以，（第一列）*（第四列）=（第二列）
kernel.sem = 250 32000 100 1024
#禁用IPV6
net.ipv6.conf.all.disable_ipv6=1
net.ipv6.conf.default.disable_ipv6 =1

net.core.rmem_default = 262144
net.core.wmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
#增加TCP最大缓冲区大小
net.ipv4.tcp_rmem = 10240 4194304 16777216
net.ipv4.tcp_wmem = 10240 4194304 16777216
net.ipv4.tcp_window_scaling=1
net.ipv4.tcp_keepalive_intvl = 2
net.ipv4.tcp_keepalive_probes = 2
net.ipv4.tcp_retries2 = 5

