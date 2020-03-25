---
title: openstack镜像的制作
date: 2017-05-02 05:20:10
tags: openstack
---
# Openstack中有一个叫Glance核心组件，提供Image Service。这种Image的方式比传统的装机方式更加的灵活快速，一些基本的重复性的的工作可以集成到镜像中。
  1，手工安装好一个虚机
  2，然后对虚机执行snapshot，这样就得到一个image
  3，使用这个image启动一个instance就可以了

# 理解Image Service
## Image Service 的功能是管理Image，让用户能够发现，获取，保存Image。在Openstack中，提供Image Service的是Glance，具体功能是：
1. 提供REST API让用户能够查询和获取Image的元数据和image本身
2. 支持多种方式存储image，包括A directory on a local file system 、Swift（Object Storage）、Cinder（Block Storage）、AWS S3、Ceph等
3. 对Instance 执行Snapshot 创建新的image（这个我在生产环境中遇到了一些问题，通过Instance制作image，再将这个image running时发现是双ip的）

# Glance架构
![Glance.png](openstack私有云镜像制作/Glance.png)
## glance-api 是系统后台运行的服务进程。对外提供REST API，响应Image查询、注册、上传、获取、删除、访问权限管理、存储的调用。glance-api不会处理真正的请求，如果操作是对image metedata相关，举个栗子如查询，glance-api会把请求转发给glance-registry，如果操作与image自身的存取有关，glance-api会把请求转发给这个image的storebackend。
![galance-api.png](openstack私有云镜像制作/galance-api.png)
### glance-registry
glance-registry是系统后台运行的服务进程，负责处理和获取image的metadata，例如image的大小和类型。
![openstack-img.png](openstack私有云镜像制作/openstack-img.png)
### DataBase
image的metedata会保持到 DataBase中，默认是MySQL。在控制节点上可以查看glance的database信息。
### Store backend
Glance 自己并不存储image。真正的image存放在backend中，Glance支持多种backend
1. A directory on a local file system （默认配置）
2. GridFS
3. Ceph RBD
4. Amazon S3
5. Sheepdog
6. OpenStack Block Storage（Cinder）
7. OpenStack Object Storage（Swift）
8. VMware ESX
具体使用过那种backend，实在/etc/glance/glance-api.conf中配置的，backend配置可参考http://docs.openstack.org/liberty/config-reference/content/configuring-image-service-backends.html

# 接下来我们来使用一台物理机，在命令行，利用KVM创建虚拟机，然后利用虚拟机的镜像文件上传至Openstack平台，并用镜像开出虚拟机。
## 安装虚拟化管理工具，KVM虚拟机，tigervnc等工具并启动libvirtd服务
yum -y install libvirt tigervnc  virt-install  qemu-kvm  libguestfs-tools && systemctl start libvirtd.service
## 创建虚拟磁盘文件
qemu-img create -f raw  ./centos.img  10G
1. -f 指定镜像的格式
2. ./centos.img 指定生成的虚拟磁盘文件的名称
3. 指定镜像文件的大小，我在这里写的是10G


附一些常用的qemu-img的命令
1. qemu-img info filename  显示filename镜像文件的信息
2. qemu-img convert -f raw input.img -O qcow2 output.qcow2 将现有镜像转换成另外一种格式，转换选项是将可识别格式转换为另一种镜像格式。
3. qemu-img resize filename [+/-]size 改变镜像文件的大小，+/-分别表示增加或者减小镜像文件的大小，size支持K、M、G、T等单位的使用，qcow2格式文件不支持缩小镜像    的操作，在增加镜像文件的大小后，也需启动客户机到里面应用，fdisk parted等分区工具才能使用增加后的空间。举个栗子，quemu-img resize centos.img +2G
## 启动虚拟机
virt-install --virt-type qemu --name centos7.2 --ram 1024 --disk ./centos.img,format=raw --network network=default --graphics vnc,listen=0.0.0.0 --noautoconsole --os-type=linux --os-variant=rhel7 --location=./CentOS-7-x86_64-DVD-1611.iso
1. --virt-type Hypervisor name to use (kvm, qemu, xen, ...)
2. --name 生成的虚拟机的名称
3. --ram 虚拟机的虚拟内存的大小
4. --disk 使用的第一步创建的虚拟磁盘文件
5. --network 使用的网络类型
6. --graphics Configure guest display settings
7. --noautoconsole Do not  automatically try to connect to the guest
8. --os-type 针对一类操作系统优化虚拟机配置（例如：linux windows）
9. --os-variant 针对待定操作系统的变体（例如：rhel7 winxp win2k12）进一步优化虚拟机的配置
10. --localtion 指定安装源，有本地，nfs，http，ftp多用于ks网络安装

## 安装虚拟机
通过vnc-client连接到该机器使用tigervnc连接宿主机的ip地址，进行Minimal Install系统安装，分区时注意手动分区否则不能调整/分区大小，IP地址使用DHCP获得并记录IP地址，调整时区为Asia/shanghai，设置root密码，安装完成reboot。
### Note.1: 如果忘记了自己的DHCP的ip地址可以使用一下的步骤进行查看
1、virsh --list(查看有哪些服务器)
2、virsh dumpxml 虚拟机名称 查看服务器对应的mac地址
3、然后再宿主机上arp -a 查看对应的mac地址对应的ip
### Note.2: 查看default网络使用virsh net-list，if the network is not active ，start it by doing：virsh net-start default。cat /etc/libvirt/qemu/networks/default.xml 可以查看default网络的IP地址段。

## yum安装acpi cloud-init 分区工具cloud-utils-growpart gdisk 不安装可能导致使用镜像在openstack平台开启一台虚拟机时/分区大小不能扩展。
yum -y install acpid cloud-init cloud-utils-growpart gdisk && systemctl enable acpid && systemctl enable cloud-init.service && systemctl enable cloud-init-local.service && systemctl enable cloud-final.service
### 我的cloud.cfg的配置，注意再配置好镜像之后需要执行cloud-init init --local && rm -rf /var/lib/cloud

users:
 \- default

disable_root: 0 #如果希望 root 能够直接登录 instance（默认不允许root登录）
ssh_pwauth:   1 #如果希望能passwod方式登录（默认只能通过private key登录）

locale_configfile: /etc/sysconfig/i18n
mount_default_fields: [~, ~, 'auto', 'defaults,nofail', '0', '2']
resize_rootfs_tmp: /dev
ssh_deletekeys:   0
ssh_genkeytypes:  ~
syslog_fix_perms: ~

cloud_init_modules:
 \- migrator
 \- bootcmd
 \- write-files
 \- growpart
 \- resizefs
 \- set_hostname    #如果需要修改instance的hostname，可以将set_hostname和update_hostname两项删除或注释掉(默认重启instance会恢复到初始值)
 \- update_hostname
 \- update_etc_hosts
 \- rsyslog
 \- users-groups
 \- ssh

cloud_config_modules:
 \- mounts
 \- locale
 \- set-passwords
 \- yum-add-repo
 \- package-update-upgrade-install
 \- timezone
 \- puppet
 \- chef
 \- salt-minion
 \- mcollective
 \- disable-ec2-metadata
 \- runcmd

cloud_final_modules:
 \- rightscale_userdata
 \- scripts-per-once
 \- scripts-per-boot
 \- scripts-per-instance
 \- scripts-user
 \- ssh-authkey-fingerprints
 \- keys-to-console
 \- phone-home
 \- final-message

## ssh登陆到启动的虚拟机中（之前已经知道了ip地址username和password）对镜像做一些基本的调整比如sysctl.conf limits.conf 关闭firewal和selinux等
## 配置zeroconf 
echo "NOZEROCONF=yes" >> /etc/sysconfig/network
## 配置console
vim /etc/default/grub
修改GRUB_CMDLINE_LINUX 选项：删除rhgb quiet，然后添加：console=tty0 console=ttyS0,115200n8
grub2-mkconfig -o /boot/grub2/grub.cfg
## 关机 shutdown -h now
## 在宿主机上清除网卡信息virt-sysprep -d 镜像名称
## 上传至openstack平台glance image-create --disk-format raw --visibility public --container-format bare --name 镜像名称 --file 镜像文件 --progress




