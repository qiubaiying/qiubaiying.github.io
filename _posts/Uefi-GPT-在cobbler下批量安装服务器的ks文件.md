---
title: 使用Uefi+GPT+cobbler批量安装服务器的
date: 2018-07-19 17:18:37
tags: cobbler装机
---

# cobbler的搭建过程不详细描述了，很简单。
## 与BIOS不同的地方就是ks文件和dhcpd.conf文件
### 这个是我的ks文件
logging --level=info
auth  --useshadow  --passalgo=md5
text
firewall --disabled
firstboot --disable
ignoredisk --only-use=sda
keyboard us
lang en_US
url --url=$tree
reboot
rootpw --iscrypted $default_password_crypted
network --bootproto=dhcp --device=em1 --onboot=on --noipv6
selinux --disabled
skipx
timezone  --utc Asia/Shanghai
install
bootloader --append=" crashkernel=auto" --location=mbr --boot-drive=sda
zerombr
#clearpart --none --initlabel
clearpart --all --initlabel --drives=sda
part /boot --fstype="xfs"  --size=4096
part /boot/efi --fstype=efi --size=2048 --ondisk=sda --fsoptions="defaults,uid=0,gid=0,umask=0077,shortname=winnt"
part swap --fstype="swap"  --size=64000
part / --fstype="xfs" --ondisk=sda  --grow --size=1
%pre
#!/bin/sh
drives=""
for drv in `ls -1 /sys/block | grep "sd\|hd\|vd\|cciss"`; do
    if (grep -q 0 /sys/block/${drv}/removable); then
        d=`echo ${drv} | sed -e 's/!/\//'`
        drives="${drives} ${d}"
    fi
done
drive=`echo $drives | awk '{print $1}'`
echo "/usr/sbin/parted --script /dev/sd${d} mklabel gpt"
/usr/sbin/parted -s /dev/sda mklabel gpt
%end
%packages
@base
@core
@development
@system-admin-tools
sgpio
device-mapper-persistent-data
systemtap-client
gcc-gnat
gcc-objc
gcc-objc++
gdb-gdbserver
libXmu
libXp
libstdc++-docs
lm_sensors
net-snmp
net-snmp-devel
ncurses-devel
expect
rsh
rsh-server
lrzsz
sysstat
urlview
tokyocabinet
telnet
urlview
mrtg
python-devel
openwsman-client
tree
libstdc++
libxml2
libxslt
openwsman
openwsman-server
sblim-sfcb 
sblim-sfcc
screen
ftp
ipmitool
ntp
%end

%post
wget http://172.29.72.1/td-configuration/deploy/OS_install/TD_sysinit.sh
bash TD_sysinit.sh 172.29.72.1
%end

# 这个是dhcpd.conf的配置文件,主要就是每个dhcp地址段里边多了我高亮的那一段。
ddns-update-style interim;

allow booting;
allow bootp;

ignore client-updates;
set vendorclass = option vendor-class-identifier;

option pxe-system-type code 93 = unsigned integer 16;

subnet 172.29.72.0 netmask 255.255.248.0 {
     option routers             172.29.79.254;
     option domain-name-servers 172.25.0.1, 172.31.0.1;
     option subnet-mask         255.255.248.0;
     range dynamic-bootp        172.29.79.2 172.29.79.200;
     default-lease-time         345600;
     max-lease-time             432000;
     next-server                172.29.72.1;
     class "pxeclients" {
          match if substring (option vendor-class-identifier, 0, 9) = "PXEClient";
          if option pxe-system-type = 00:02 {
                  filename "ia64/elilo.efi";
          } else if option pxe-system-type = 00:06 {
                  filename "grub/grub-x86.efi";
          } else if option pxe-system-type = 00:07 {
                  filename "grub/grub-x86_64.efi";
          } else if option pxe-system-type = 00:09 {
                 filename "grub/grub-x86_64.efi";
          } else {
                  filename "pxelinux.0";
          }
     }

    class "pxeclients" { 
          match if substring (option vendor-class-identifier, 0, 9) = "PXEClient"; 
          next-server 172.29.72.1; 
          filename "BOOTX64.EFI"; 
    }
}
subnet 172.31.246.0 netmask 255.255.255.0 {
     option routers             172.31.246.1;
     option domain-name-servers 172.25.0.1, 172.31.0.1;
     option subnet-mask         255.255.155.0;
     range dynamic-bootp        172.31.246.2 172.31.246.250;
     default-lease-time         345600;
     max-lease-time             432000;
     next-server                172.29.72.1;
     class "pxeclients" {
          match if substring (option vendor-class-identifier, 0, 9) = "PXEClient";
          if option pxe-system-type = 00:02 {
                  filename "ia64/elilo.efi";
          } else if option pxe-system-type = 00:06 {
                  filename "grub/grub-x86.efi";
          } else if option pxe-system-type = 00:07 {
                  filename "grub/grub-x86_64.efi";
          } else {
                  filename "pxelinux.0";
          }
     }
}


group {
}

> 技术改变命运
