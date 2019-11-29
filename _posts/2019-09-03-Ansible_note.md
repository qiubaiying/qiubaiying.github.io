---
layout:     post
title:      Ansible
subtitle:   Ansible
date:       2019-09-03
author:     zxll
catalog: true
tags:
    - linux 
---


### Ansible 笔记

[[Ansible中文权威指南](https://ansible-tran.readthedocs.io/en/latest/#)]

特性：幂等性【执行多次，结果一样】

ansible 核心组件：

- ansible core
- host iventory
- core modules
- Custom modules
- playbook (yaml,jinjia2)
- connect plugin

ansible 特性

- 基于python语言实现，由paramiko实现ssh连接，支持并行，PyYAML模块和Jinjia2  三个模块

- 部署简单，agentless类型

- 默认使用ssh协议：①基于秘钥文件认证②在inventery文件中指定账号和密码

- 主从模式

  master：ansible  ，ssh clinet

  slave：ssh server

- 支持自定义模块：支持各种编程语言

- 支持playbook

- 基于【模块】来完成各种任务 task

#### ansible的安装

##### 配置文件

- /etc/ansible/ansible.cfg      #主配置文件
- /etc/ansible/hosts                #管理主机文件

```
[root@node1 ~]# yum list all *ansible*  ##获取yum仓库中所有的包信息  若显示@则表示该软件已经通过仓库安装，若无@或不是install，则表示尚未安装。如base，表示未安装，包位于base仓库中
Loaded plugins: fastestmirror, langpacks
Repodata is over 2 weeks old. Install yum-cron? Or run: yum makecache fast
Determining fastest mirrors
 * base: mirrors.163.com
 * extras: mirrors.163.com
 * updates: mirrors.cqu.edu.cn
Available Packages
ansible.noarch                                                        2.4.2.0-2.el7                                         extras
ansible-doc.noarch                                                    2.4.2.0-2.el7                                         extras
centos-release-ansible26.noarch                                       1-3.el7.centos                                        extras

[root@node1 ~]# yum info ansible  ##类似于rpm -qi 包名 ,前者显示的详细，可显示安装状态（Installed，Available）
Loaded plugins: fastestmirror, langpacks
Repodata is over 2 weeks old. Install yum-cron? Or run: yum makecache fast
Loading mirror speeds from cached hostfile
 * base: mirrors.163.com
 * extras: mirrors.163.com
 * updates: mirrors.cqu.edu.cn
Available Packages
Name        : ansible
Arch        : noarch
Version     : 2.4.2.0
Release     : 2.el7
Size        : 7.6 M
Repo        : extras/7/x86_64
Summary     : SSH-based configuration management, deployment, and task execution system
URL         : http://ansible.com
License     : GPLv3+
Description :
            : Ansible is a radically simple model-driven configuration management,
            : multi-node deployment, and remote task execution system. Ansible works
            : over SSH and does not require any software or daemons to be installed
            : on remote nodes. Extension modules can be written in any language and
            : are transferred to managed machines automatically.
[root@node1 ~]# rpm -qi ansible
package ansible is not installed     

[root@node1 ~]# yum -y install ansible
.....
Installed:
  ansible.noarch 0:2.4.2.0-2.el7

Dependency Installed:
  python-babel.noarch 0:0.9.6-8.el7                                        python-backports.x86_64 0:1.0-8.el7
  python-backports-ssl_match_hostname.noarch 0:3.5.0.1-1.el7               python-cffi.x86_64 0:1.6.0-5.el7
  python-enum34.noarch 0:1.0.4-1.el7                                       python-httplib2.noarch 0:0.9.2-1.el7
  python-idna.noarch 0:2.4-1.el7                                           python-ipaddress.noarch 0:1.0.16-2.el7
  python-jinja2.noarch 0:2.7.2-3.el7_6                                     python-markupsafe.x86_64 0:0.11-10.el7
  python-paramiko.noarch 0:2.1.1-9.el7                                     python-passlib.noarch 0:1.6.5-2.el7
  python-ply.noarch 0:3.4-11.el7                                           python-pycparser.noarch 0:2.14-1.el7
  python-setuptools.noarch 0:0.9.8-7.el7                                   python2-cryptography.x86_64 0:1.7.2-2.el7
  python2-jmespath.noarch 0:0.9.0-3.el7                                    python2-pyasn1.noarch 0:0.1.9-7.el7
  sshpass.x86_64 0:1.06-2.el7

Complete!
[root@node1 ~]#


[root@node1 ~]# rpm -ql ansible
/etc/ansible
/etc/ansible/ansible.cfg
/etc/ansible/hosts
/etc/ansible/roles
....
```

##### 配置免密登录

```
[root@node1 ~]# ll -a
total 36
dr-xr-x---.  4 root root  180 Sep  1 16:32 .
dr-xr-xr-x. 17 root root  224 May 15 20:42 ..
-rw-------.  1 root root 1560 May 15 20:43 anaconda-ks.cfg
-rw-------.  1 root root  888 Jun  5 23:03 .bash_history
-rw-r--r--.  1 root root   18 Dec 29  2013 .bash_logout
-rw-r--r--.  1 root root  176 Dec 29  2013 .bash_profile
-rw-r--r--.  1 root root  176 Dec 29  2013 .bashrc
drwxr-xr-x.  3 root root   18 May 15 20:44 .cache
drwxr-xr-x.  3 root root   18 May 15 20:44 .config
-rw-r--r--.  1 root root  100 Dec 29  2013 .cshrc
-rw-r--r--.  1 root root  129 Dec 29  2013 .tcshrc
-rw-------.  1 root root 8033 Sep  1 16:32 .viminfo
[root@node1 ~]# ssh-keygen -t rsa
....
[root@node1 ~]# ll -a /root/.ssh/
total 8
drwx------. 2 root root   38 Sep  1 16:36 .
dr-xr-x---. 5 root root  192 Sep  1 16:36 ..
-rw-------. 1 root root 1679 Sep  1 16:36 id_rsa
-rw-r--r--. 1 root root  392 Sep  1 16:36 id_rsa.pub

[root@node2 ~]# ll /root/.ssh
ls: cannot access /root/.ssh: No such file or directo

[root@node1 ~]# ssh-copy-id -i /root/.ssh/id_rsa.pub 192.168.1.201
[root@node1 ~]# ssh-copy-id -i /root/.ssh/id_rsa.pub 192.168.1.172

[root@node2 ~]# ll /root/.ssh
total 4
-rw-------. 1 root root 392 Sep  1 16:53 authorized_keys

[root@node1 ~]# ssh 192.168.1.201 "date"
Sun Sep  1 16:55:12 CST 2019
[root@node1 ~]# date
Sun Sep  1 16:55:13 CST 2019
[root@node1 ~]# ssh 192.168.1.172 "date"
Thu Jun  6 07:45:05 CST 2019

同步时间
[root@node1 ~]# ssh 192.168.1.172 "rpm -qa |grep ntp"
[root@node1 ~]# ssh 192.168.1.172 "yum -y install ntp"
[root@node1 ~]# ssh 192.168.1.172 "rpm -qa |grep ntp"
ntpdate-4.2.6p5-28.el7.centos.x86_64
ntp-4.2.6p5-28.el7.centos.x86_64
[root@node1 ~]# ssh 192.168.1.172 "ntpdate us.pool.ntp.org"
[root@node1 ~]# ssh 192.168.1.172 "date"
Sun Sep  1 17:05:32 CST 2019

```

##### 编辑配置文件

```
vim /etc/ansible/hosts
↓
[websers]
192.168.1.202
192.168.1.203

[dbsers]
192.168.1.201
192.168.1.203

如何查看模块帮助

[root@node1 ansible]# man ansible-doc
[root@node1 ansible]# ansible-doc -l |wc -l   ## 总共1378个模块
1378

ansible-doc -s MODULE_NAME

ansible 命令应用基础
语法：ansible <host-pattern> [options]
-f FORKS, --forks FORKS  并行几个
-m MODULE_NAME, --module-name MODULE_NAME
   module name to execute (default=command)

ansible中的Host-pattern
all 表示所有Inventory中的所有主机
*   支持通配符  # ansible all -m ping
逻辑或			# ansible "websers:dbsers" -m ping
逻辑与			# ansible "websers:&dbsers" -m ping
逻辑非			# ansible 'websers:!dbsers' -m ping  ##注意只能是单引号
正则表达式	   # ansible '~(web|db).*' -m ping  ## ~ 必须要有

ansible all -m ping -v/-vv/-vvv  #输出一个比一个详细，v是verbose的缩写，rysnc很多类似的vvv
```

```
通配符结果
[root@node1 ansible]# ansible *sers -m ping
192.168.1.203 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
192.168.1.202 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
192.168.1.201 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
逻辑或
[root@node1 ansible]# ansible "websers:dbsers" -m ping
192.168.1.203 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
192.168.1.202 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
192.168.1.201 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
逻辑与
[root@node1 ansible]# ansible "websers:&dbsers" -m ping
192.168.1.203 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
逻辑非
[root@node1 ansible]# ansible "websers:!dbsers" -m ping
-bash: !dbsers": event not found
[root@node1 ansible]# ansible 'websers:!dbsers' -m ping
192.168.1.202 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
正则表达式：
[root@node1 ansible]# ansible '~(web|db).*' -m ping
192.168.1.203 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
192.168.1.202 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
192.168.1.201 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}

[root@node1 ansible]# ansible all -m ping -v
Using /etc/ansible/ansible.cfg as config file
192.168.1.203 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
192.168.1.202 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
192.168.1.201 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
[root@node1 ansible]# ansible all -m ping -vv
ansible 2.4.2.0
  config file = /etc/ansible/ansible.cfg
  configured module search path = [u'/root/.ansible/plugins/modules', u'/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python2.7/site-packages/ansible
  executable location = /usr/bin/ansible
  python version = 2.7.5 (default, Jun 17 2014, 18:11:42) [GCC 4.8.2 20140120 (Red Hat 4.8.2-16)]
Using /etc/ansible/ansible.cfg as config file
META: ran handlers
192.168.1.203 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
192.168.1.202 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
192.168.1.201 | SUCCESS => {
    "changed": false, 
    "ping": "pong"
}
META: ran handlers
META: ran handlers
[root@node1 ansible]#
```

##### 结果颜色说明

| 颜色 | 意义               |
| ---- | ------------------ |
| 绿色 | 执行成功，未做修改 |
| 黄色 | 执行成功，并修改   |
| 红色 | 执行失败           |

在配置文件中有说明

```
[root@node1 ansible]# vim /etc/ansible/ansible.cfg
[colors]
#highlight = white
#verbose = blue
#warn = bright purple
#error = red
#debug = dark gray
#deprecate = purple
#skip = cyan
#unreachable = red
#ok = green
#changed = yellow
#diff_add = green
#diff_remove = red
#diff_lines = cyan
```

##### 帮助命令

| 命令                   | 意义                              |
| ---------------------- | --------------------------------- |
| ansible-doc command    | 相当于linux的man命令,会有剧本例子 |
| ansible-doc -s command | 相当于linux的--help命令           |



#### 常见模块

##### command模块

- command：在远程主机执行命令，默认模块，可忽略-m选项

  > chdir : Change into this directory before running the command.
  >
  > creates : A filename or (since 2.0) glob pattern, when it already exists, this step will *not* be run.

  ```
  [root@node1 ansible]# ansible db* -m command -a "hostname"
  192.168.1.203 | SUCCESS | rc=0 >>
  node2-clone
  192.168.1.201 | SUCCESS | rc=0 >>
  node1
  
  [root@node1 ~]# ansible db* -m command -a "creates=/etc/fs cat /etc/fstab"
  192.168.1.203 | SUCCESS | rc=0 >>
  #
  # /etc/fstab
  # Created by anaconda on Mon Mar 11 01:13:35 2019
  #
  # Accessible filesystems, by reference, are maintained under '/dev/disk'
  # See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
  #
  /dev/mapper/centos-root /                       xfs     defaults        0 0
  UUID=6b72ee06-fca8-4b93-a442-c8560b12a7a4 /boot                   xfs     defaults        0 0
  /dev/mapper/centos-swap swap                    swap    defaults        0 0
  
  192.168.1.201 | SUCCESS | rc=0 >>
  #
  # /etc/fstab
  # Created by anaconda on Sun Mar 10 16:32:53 2019
  #
  # Accessible filesystems, by reference, are maintained under '/dev/disk'
  # See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
  #
  /dev/mapper/centos_node1-root /                       xfs     defaults        1 1
  UUID=545a4184-0435-4427-92fd-299e55c571d8 /boot                   xfs     defaults        1 2
  /dev/mapper/centos_node1-swap swap                    swap    defaults        0 0
  
  [root@node1 ~]# 
  
  [root@node1 ~]# ansible db* -m command -a "chdir=/boot ls"
  192.168.1.203 | SUCCESS | rc=0 >>
  config-3.10.0-327.el7.x86_64
  grub
  grub2
  initramfs-0-rescue-3a64c4697d6141eb8fb66c1d18b30eac.img
  initramfs-3.10.0-327.el7.x86_64.img
  initramfs-3.10.0-327.el7.x86_64kdump.img
  initrd-plymouth.img
  symvers-3.10.0-327.el7.x86_64.gz
  System.map-3.10.0-327.el7.x86_64
  vmlinuz-0-rescue-3a64c4697d6141eb8fb66c1d18b30eac
  vmlinuz-3.10.0-327.el7.x86_64
  
  192.168.1.201 | SUCCESS | rc=0 >>
  config-3.10.0-123.el7.x86_64
  grub
  grub2
  initramfs-0-rescue-93d7be9aecfc4e3e8bec810711fafd01.img
  initramfs-3.10.0-123.el7.x86_64.img
  initramfs-3.10.0-123.el7.x86_64kdump.img
  initrd-plymouth.img
  symvers-3.10.0-123.el7.x86_64.gz
  System.map-3.10.0-123.el7.x86_64
  vmlinuz-0-rescue-93d7be9aecfc4e3e8bec810711fafd01
  vmlinuz-3.10.0-123.el7.x86_64
  
  ```

  - 注意点：$HOME，`"<"', `">"', `"|"', `";"' and `"&"'在command下不会执行，请用shell模块，详见ansible-doc  command

    ```
    [root@node1 ansible]# ansible all -m command -a "cat /etc/passwd|grep root"
    192.168.1.202 | FAILED | rc=1 >>
    cat: /etc/passwd|grep: 没有那个文件或目录
    cat: root: 没有那个文件或目录non-zero return code
    
    192.168.1.203 | FAILED | rc=1 >>
    cat: /etc/passwd|grep: 没有那个文件或目录
    cat: root: 没有那个文件或目录non-zero return code
    
    192.168.1.201 | FAILED | rc=1 >>
    cat: /etc/passwd|grep: 没有那个文件或目录
    cat: root: 没有那个文件或目录non-zero return code
    [root@node1 ansible]# ansible all -m shell -a "cat /etc/passwd|grep root"
    192.168.1.203 | SUCCESS | rc=0 >>
    root:x:0:0:root:/root:/bin/bash
    operator:x:11:0:operator:/root:/sbin/nologin
    
    192.168.1.202 | SUCCESS | rc=0 >>
    root:x:0:0:root:/root:/bin/bash
    operator:x:11:0:operator:/root:/sbin/nologin
    proot:x:1002:1002::/home/proot:/bin/bash
    
    192.168.1.201 | SUCCESS | rc=0 >>
    root:x:0:0:root:/root:/bin/bash
    operator:x:11:0:operator:/root:/sbin/nologin
    
    ```

##### shell 模块

- shell模块：和command类似，用shell执行命令

  `ansible-doc shell   ansible-doc -s shell`

  > chdir : cd into this directory before running the command
  >
  > creates :  a filename, when it already exists, this step will *not* be run.
  >
  > removes : a filename, when it does not exist, this step will *not* be run.

  ```
  [root@node1 ~]# ansible db* -m shell -a "ls /home"
  192.168.1.203 | SUCCESS | rc=0 >>
  postgres
  proto
  
  192.168.1.201 | SUCCESS | rc=0 >>
  aa
  aaa
  apple
  proto
  sdx
  tana
  tank
  ```

  >从上面的例子可以看出来，shell可以干command的活

##### script 模块

- script 模块：运行脚本

  > chdir : cd into this directory on the remote node before running the scrip
  >
  > creates : a filename, when it already exists, this step will *not* be run.
  >
  > removes : a filename, when it does not exist, this step will *not* be run.

  ```
  [root@node1 ~]# cat /root/host.sh 
  #!/bin/bash
  echo $HOSTNAME
  [root@node1 ~]# chmod +x /root/host.sh
  [root@node1 ~]# ansible db* -m script -a '/root/host.sh'
  192.168.1.203 | SUCCESS => {
      "changed": true, 
      "rc": 0, 
      "stderr": "Shared connection to 192.168.1.203 closed.\r\n", 
      "stdout": "node2-clone\r\n", 
      "stdout_lines": [
          "node2-clone"
      ]
  }
  192.168.1.201 | SUCCESS => {
      "changed": true, 
      "rc": 0, 
      "stderr": "Shared connection to 192.168.1.201 closed.\r\n", 
      "stdout": "node1\r\n", 
      "stdout_lines": [
          "node1"
      ]
  }
  ```

##### copy 模块

- copy模块：从服务端copy到目标服务器

  `ansible-doc copy   ansible-doc -s copy`

  > dest : Remote absolute path where the file should be copied to
  >
  > src : Local path to a file to copy to the remote server
  >
  > group : Name of the group that should own the file/directory, as would be fed to `chown'.
  >
  > mode : Mode the file or directory should be. For those used to `/usr/bin/chmod' remember that                                           			  modes are  actually octal numbers (like 0644)
  >
  > owner : Name of the user that should own the file/directory, as would be fed to `chown'.

  ```
  [root@node1 ~]# ansible db* -m copy -a "src=/root/host.sh dest=/tmp/"
  192.168.1.203 | SUCCESS => {
      "changed": true, 
      "checksum": "25a5e82036293f48d4a117c91855a16c2d36e0de", 
      "dest": "/tmp/host.sh", 
      "gid": 0, 
      "group": "root", 
      "md5sum": "2b9854338cd858ad0f86eb55423c3f03", 
      "mode": "0644", 
      "owner": "root", 
      "size": 27, 
      "src": "/root/.ansible/tmp/ansible-tmp-1552351094.09-53594671689952/source", 
      "state": "file", 
      "uid": 0
  }
  192.168.1.201 | SUCCESS => {
      "changed": true, 
      "checksum": "25a5e82036293f48d4a117c91855a16c2d36e0de", 
      "dest": "/tmp/host.sh", 
      "gid": 0, 
      "group": "root", 
      "md5sum": "2b9854338cd858ad0f86eb55423c3f03", 
      "mode": "0644", 
      "owner": "root", 
      "secontext": "unconfined_u:object_r:admin_home_t:s0", 
      "size": 27, 
      "src": "/root/.ansible/tmp/ansible-tmp-1552351093.97-161523572204567/source", 
      "state": "file", 
      "uid": 0
  }
  
  [root@node1 ~]# ansible db* -m shell -a "ls -l /tmp/host.sh"
  192.168.1.203 | SUCCESS | rc=0 >>
  -rw-r--r-- 1 root root 27 9月   2 15:51 /tmp/host.sh
  192.168.1.201 | SUCCESS | rc=0 >>
  -rw-r--r--. 1 root root 27 3月  12 08:38 /tmp/host.sh
  
  
  [root@node1 ansible]# ansible web* -m copy -a "src=/etc/shadow dest=/tmp/ mode=644 owner=proto"
  [root@node1 ansible]# ansible web* -m shell -a "ls -l /tmp/shadow"
  192.168.1.203 | SUCCESS | rc=0 >>
  -rw-r--r-- 1 proto root 1344 9月   2 16:15 /tmp/shadow
  192.168.1.202 | SUCCESS | rc=0 >>
  -rw-r--r--. 1 proto root 1344 9月   2 16:15 /tmp/shadow
  ```

##### Fetch模块

- fetch模块：从客户端取文件到服务端，与copy相反，要是目录的话，可以先进行tar压缩

  `ansible-doc fetch  |  ansible-doc -s fetch`

  > dest : A directory to save the file into. For example, if the 'dest' directory is '/backup' a 'src' file
  >         named  '/etc/profile' on host 'host.example.com', would be saved into
  >         `/backup/host.example.com/etc/profile'

  ```
  [root@node1 ansible]# ansible web* -m fetch -a "src=/var/log/messages dest=/tmp/"
  [root@node1 ansible]# ll /tmp/192.168.1.203/var/log/messages
  -rw-------. 1 root root 382938 9月   2 16:26 /tmp/192.168.1.203/var/log/messages
  [root@node1 ansible]# ll /tmp/192.168.1.202/var/log/messages
  -rw-------. 1 root root 13956 9月   2 16:26 /tmp/192.168.1.202/var/log/messages
  
  ```

> src:                   # (required) The file on the remote system to fetch. This `must' be a file, not a directory.

所以如何想要将/var/log/*.log全部拿下来，可以考虑先压缩，如果命令用的不规范会提示，如unarchive，压缩包如果不写路径的话，默认是root家目录

```
[root@node1 ansible]# ansible web* -m shell -a "tar -zcvf log.tar.gz /var/log/*.log"
 [WARNING]: Consider using unarchive module rather than running tar
192.168.1.203 | SUCCESS | rc=0 >>
/var/log/boot.log
/var/log/wpa_supplicant.log
/var/log/yum.logtar: 从成员名中删除开头的“/”
192.168.1.202 | SUCCESS | rc=0 >>
/var/log/boot.log
/var/log/wpa_supplicant.log
/var/log/yum.logtar: 从成员名中删除开头的“/”
[root@node1 ansible]# ansible web* -m shell -a "ls -l /root/log.tar.gz"
192.168.1.203 | SUCCESS | rc=0 >>
-rw-r--r-- 1 root root 4846 9月   2 16:42 /root/log.tar.gz
192.168.1.202 | SUCCESS | rc=0 >>
-rw-r--r--. 1 root root 3956 9月   2 16:42 /root/log.tar.gz
[root@node1 ansible]# ansible all -m fetch -a "src=/root/log.tar.gz dest=/tmp/"
[root@node1 ansible]# tree /tmp/
/tmp/
├── 192.168.1.202
│   ├── root
│   │   └── log.tar.gz
│   └── var
│       └── log
│           └── messages
├── 192.168.1.203
│   ├── root
│   │   └── log.tar.gz
│   └── var
│       └── log
│           └── messages

```

##### unarchive 解压模块

##### archive 压缩模块

##### File 模块

- file  设置文件属性

` ansible-doc file | ansible-doc -s file`

>path:                  # (required) path to the file being managed.  Aliases: `dest', `name'  #别名关系
>
>state : touch  创建

```
[root@node1 ansible]# ansible web* -m file -a "path=/root/fs state=touch"
[root@node1 ansible]# ansible web* -m shell -a "ls -l /root/fs"
192.168.1.203 | SUCCESS | rc=0 >>
-rw-r--r-- 1 root root 0 9月   2 17:02 /root/fs
192.168.1.202 | SUCCESS | rc=0 >>
-rw-r--r--. 1 root root 0 9月   2 17:02 /root/fs
```

> state : absent 删除文件

```
[root@node1 ansible]# ansible web* -m file -a "path=/root/fs state=absent"
[root@node1 ansible]# ansible web* -m shell -a "ls -l /root/fs"
192.168.1.203 | FAILED | rc=2 >>
ls: 无法访问/root/fs: 没有那个文件或目录non-zero return code
192.168.1.202 | FAILED | rc=2 >>
ls: 无法访问/root/fs: 没有那个文件或目录non-zero return code
```

> state : directory  创建文件夹

```
[root@node1 ansible]# ansible all -m file -a "name=/data/dir1 state=directory" 
[root@node1 ansible]# ansible web* -m shell -a "ls -ld /data/dir1"
192.168.1.203 | SUCCESS | rc=0 >>
drwxr-xr-x 2 root root 6 9月   2 17:14 /data/dir1
192.168.1.202 | SUCCESS | rc=0 >>
drwxr-xr-x. 2 root root 6 9月   2 17:14 /data/dir1

[root@node1 ansible]# ansible all -m file -a "name=/data/dir1 state=absent"
[root@node1 ansible]# ansible web* -m shell -a "ls -ld /data/dir1"
192.168.1.203 | FAILED | rc=2 >>
ls: 无法访问/data/dir1: 没有那个文件或目录non-zero return code
192.168.1.202 | FAILED | rc=2 >>
ls: 无法访问/data/dir1: 没有那个文件或目录non-zero return code
```

> state : link 创建软连接

```
[root@node1 ansible]# ansible all -m file -a "src=/etc/fstab dest=/data/dir state=link"
[root@node1 ansible]# ansible all -m shell -a "ls -l /data/dir"
192.168.1.203 | SUCCESS | rc=0 >>
lrwxrwxrwx 1 root root 10 9月   2 17:19 /data/dir -> /etc/fstab
192.168.1.202 | SUCCESS | rc=0 >>
lrwxrwxrwx. 1 root root 10 9月   2 17:19 /data/dir -> /etc/fstab

[root@node1 ansible]# ansible all -m file -a "dest=/data/dir state=absent"
[root@node1 ansible]# ansible all -m shell -a "ls -l /data/dir"
192.168.1.203 | FAILED | rc=2 >>
ls: 无法访问/data/dir: 没有那个文件或目录non-zero return code
192.168.1.202 | FAILED | rc=2 >>
ls: 无法访问/data/dir: 没有那个文件或目录non-zero return code
```

##### Hostname模块

- hostname模块：更改主机名

> name : Name of the host

```
[root@node1 ansible]# ansible 192.168.1.202 -m hostname -a "name=node22"  #/etc/hostname已改，/etc/hosts没改
```

##### Cron 模块

- cron 模块：定时任务

`ansible-doc cron | ansible-doc -s cron`

> minute : Minute when the job should run ( 0-59, *, */2, etc )  [Default: *]
>
> jobs:The command to execute 
>
> disabled:If the job should be disabled (commented out) in the crontab. Only has effect if state=present
>                 [Default: False]    {true和yes等价，false和no等价}

```
[root@node1 ~]# ansible all -m cron -a 'minute=* job="/usr/bin/wall FBI warning" name="warning"'
[root@node1 ~]# ansible all -m shell -a "crontab -l"
192.168.1.203 | SUCCESS | rc=0 >>
*/10 * * * * /usr/sbin/ntpdate us.pool.ntp.org | logger -t NTP
#Ansible: warning
* * * * * /usr/bin/wall FBI warning
192.168.1.202 | SUCCESS | rc=0 >>
*/10 * * * * /usr/sbin/ntpdate us.pool.ntp.org | logger -t NTP
#Ansible: warning
* * * * * /usr/bin/wall FBI warning
```

> name:   # Description of a crontab entry or, if env is set, the name of environment variable. Required if
>          state=absent.     #当要删除crontab的时候，必须制定name,如果不加name会新创建一个注释的cron

```
[root@node1 ~]# ansible all -m cron -a "disabled=yes job='/usr/bin/wall FBI warning'" 
[root@node1 ~]# ansible all -m shell -a "crontab -l"
192.168.1.203 | SUCCESS | rc=0 >>
*/10 * * * * /usr/sbin/ntpdate us.pool.ntp.org | logger -t NTP
#Ansible: warning
* * * * * /usr/bin/wall FBI warning
#Ansible: None
#* * * * * /usr/bin/wall FBI warning

192.168.1.202 | SUCCESS | rc=0 >>
*/10 * * * * /usr/sbin/ntpdate us.pool.ntp.org | logger -t NTP
#Ansible: warning
* * * * * /usr/bin/wall FBI warning
#Ansible: None
#* * * * * /usr/bin/wall FBI warning

[root@node1 ~]# ansible all -m cron -a "disabled=true job='/usr/bin/wall FBI warning' name=warning"
[root@node1 ~]# ansible all -m shell -a "crontab -l"
```

> 完全删除cron

```
[root@node1 ~]# ansible all -m cron -a "job='/usr/bin/wall FBI warning' name=warning state=absent"
```

##### Yum 模块

- yum模块

`ansible-doc yum  |  ansible-doc -s yum`

> state :(Choices: present, installed, latest, absent, removed)[Default: present]
>
> name:Package name , ou can also pass a url or a local path to a rpm file (using state=present). To   			operate on several packages this can accept a comma separated list of packages
>
> ​			可以接受多个参数，以逗号分隔即可
>
> list:Package name to run the equivalent of yum list <package> against.    [Default: None]
>
> disable_gpg_check : Whether to disable the GPG checking of signatures of packages being installed. 								Has an effect only, if state is `present' or `latest'.(Choices: yes, no)[Default: no]
>
> update_cache : Force yum to check if cache is out of date and redownload if needed. Has an effect only  							if state is 'present' or `latest'.[Default: no]

> 查看是否安装vsftpd

```
[root@node1 ansible]# ansible all -m shell -a "rpm -qa |grep vsftp"
```

> yum安装

```
[root@node1 ansible]# ansible all -m yum -a "name=vsftpd state=present"
```

> yum查看指定安装包是否安装

```
[root@node1 ansible]# ansible all -m yum -a "list=vsftpd"
```

> yum卸载安装包

```
[root@node1 ansible]# ansible all -m yum -a "name=vsftpd state=absent"
```

> 安装多个pkgs

```
[root@node1 ~]# ansible all -m yum -a "name=httpd,vsftpd"
[root@node1 ~]# ansible all -m shell -a "rpm -qa |grep -E 'vsftp|http'"
```

> 如何安装本地的rpm包

```
[root@node1 ~]# yum install --downloadonly --downloaddir=./ tree
[root@node1 ~]# ansible all -m copy -a "src=/root/tree-1.6.0-10.el7.x86_64.rpm dest=/root/"
[root@node1 ~]# ansible all -m shell -a "ls -l /root/tree-1.6.0-10.el7.x86_64.rpm"
[root@node1 ~]# ansible all -m yum -a "name=/root/tree-1.6.0-10.el7.x86_64.rpm"
```

> 忽略gpg检查

```
[root@node1 ~]# ansible all -m yum -a "name=rsync disable_gpg_check=yes"
[root@node1 ~]# ansible all -m shell -a "rpm -qa |grep rsync"
```

> 更新缓存， 相当于yum clean all，yum makecache

```
[root@node1 ~]# ansible all -m yum -a "name=dstat update_cache=yes"
```

##### Service 模块

- service模块：管理服务

`ansible-doc  service | ansible-doc -s service`

> name : (required) Name of the service
>
> state : 'started'/'stopped' are idempotent actions that will not run commands unless necessary.  			    	         'restarted'  will always bounce the service.  'reloaded' will always reload
>
> enabled : Whether the service should start on boot. *At least one of state and enabled are required
>
> state 和 enabled 在ansible中至少要有一个

```
[root@node1 ~]# ansible all -m service -a "name=vsftpd state=started enabled=yes"
[root@node1 ~]# ansible all -m shell  -a "systemctl is-enabled vsftpd"
192.168.1.203 | SUCCESS | rc=0 >>
enabled
192.168.1.202 | SUCCESS | rc=0 >>
enabled
[root@node1 ~]# ansible all -m shell  -a "ps -ef|grep  vsftpd"
192.168.1.203 | SUCCESS | rc=0 >>
root      6811     1  0 18:56 ?        00:00:00 /usr/sbin/vsftpd /etc/vsftpd/vsftpd.conf
root      6928  6927  0 18:59 pts/1    00:00:00 /bin/sh -c ps -ef|grep vsftpd
root      6930  6928  0 18:59 pts/1    00:00:00 grep vsftpd
192.168.1.202 | SUCCESS | rc=0 >>
root      8609     1  0 18:56 ?        00:00:00 /usr/sbin/vsftpd /etc/vsftpd/vsftpd.conf
root      8731  8730  0 18:59 pts/1    00:00:00 /bin/sh -c ps -ef|grep vsftpd
root      8733  8731  0 18:59 pts/1    00:00:00 grep vsftpd
```

##### User 模块

- user模块 ： 管理用户

`ansible-doc user | ansible-doc -s user`

> comment : Optionally sets the description (aka `GECOS') of user account
>
> createhome : Unless set to `no', a home directory will be made for the user when the account is 			created or if the home directory does not exist.(Choices: yes, no)[Default: yes]
>
> group :  Optionally sets the user's primary group (takes a group name).
>
> groups : Puts the user in  list of groups. When set to the empty string ('groups='), the user is removed
>       	  from all groups except the primary group.
>
> home : Optionally set the user's home directory.
>
> name : Name of the user to create, remove or modify.
>
> remove : When used with `state=absent', behavior is as with `userdel --remove'.[Default: no]
>
> shell : Optionally set the user's shell.
>
> system : When creating an account, setting this to `yes' makes the user a system account.  This setting
>         	cannot be changed on existing users . (Choices: yes, no)[Default: no]
>
> uid : Optionally sets the `UID' of the user.

```
[root@node1 ~]# ansible all -m shell -a "getent passwd nginx"
[root@node1 ~]# ansible all -m user -a "name=nginx shell=/sbin/nologin  system=yes home=/var/nginx groups=root,bin uid=80 comment='nginx system user'"
[root@node1 ~]# ansible all -m shell -a "getent passwd nginx"
192.168.1.203 | SUCCESS | rc=0 >>
nginx:x:80:80:nginx system user:/var/nginx:/sbin/nologin

192.168.1.202 | SUCCESS | rc=0 >>
nginx:x:80:80:nginx system user:/var/nginx:/sbin/nologin
[root@node1 ~]# ansible all -m shell -a "getent group |grep nginx"
192.168.1.203 | SUCCESS | rc=0 >>
root:x:0:nginx
bin:x:1:nginx
nginx:x:80:

192.168.1.202 | SUCCESS | rc=0 >>
root:x:0:nginx
bin:x:1:nginx
nginx:x:80:
```

##### Group 模块

- group 模块：管理组

`ansible-doc group  |  ansible-doc -s group`

> gid : Optional `GID' to set for the group.
>
> name : Name of the group to manage.
>
> state : Whether the group should be present or not on the remote host.(Choices: present, absent)			[Default: present]
>
> system :  If `yes', indicates that the group created is a system group. (Choices: yes, no)[Default: no]

```
[root@node1 ~]# ansible all -m group -a "name=nginx1 system=yes gid=800"
[root@node1 ~]# ansible all -m shell -a "getent group |grep 800"
192.168.1.203 | SUCCESS | rc=0 >>
nginx1:x:800:
192.168.1.202 | SUCCESS | rc=0 >>
nginx1:x:800:

[root@node1 ~]# ansible all -m group -a "name=nginx1 system=yes gid=808"
[root@node1 ~]# ansible all -m shell -a "getent group |grep nginx1"
192.168.1.203 | SUCCESS | rc=0 >>
nginx1:x:808:
192.168.1.202 | SUCCESS | rc=0 >>
nginx1:x:808:
```

---

#### 实现ansible企业级用法playbook

##### ansible-galaxy

- ansible + tab ,会找到ansible-galaxy

- > 官网地址：[https://galaxy.ansible.com](https://galaxy.ansible.com/)

- 列出所有安装的galaxy：

  ```
  ansible-galaxy list	
  ```

- 安装galaxy  【https://galaxy.ansible.com/geerlingguy/nginx】

  ```
  [root@node1 ~]# ansible-galaxy install geerlingguy.nginx
  - downloading role 'nginx', owned by geerlingguy
  - downloading role from https://github.com/geerlingguy/ansible-role-nginx/archive/2.7.0.tar.gz
  - extracting geerlingguy.nginx to /etc/ansible/roles/geerlingguy.nginx
  - geerlingguy.nginx (2.7.0) was installed successfully
  
  [root@node1 ~]# ansible-galaxy list
  - geerlingguy.nginx, 2.7.0
  
  [root@node1 geerlingguy.nginx]# tree /etc/ansible/roles/geerlingguy.nginx
  /etc/ansible/roles/geerlingguy.nginx
  ├── defaults
  │   └── main.yml
  ├── handlers
  │   └── main.yml
  ├── LICENSE
  ├── meta
  │   └── main.yml
  ├── molecule
  │   └── default
  │       ├── molecule.yml
  ├── playbook.yml
  │       └── yaml-lint.yml
  ├── README.md
  ├── tasks
  │   ├── main.yml
  │   ├── setup-Archlinux.yml
  │   ├── setup-Debian.yml
  │   ├── setup-FreeBSD.yml
  │   ├── setup-OpenBSD.yml
  │   ├── setup-RedHat.yml
  │   ├── setup-Ubuntu.yml
  │   └── vhosts.yml
  ├── templates
  │   ├── nginx.conf.j2
  │   ├── nginx.repo.j2
  │   └── vhost.j2
  └── vars
      ├── Archlinux.yml
      ├── Debian.yml
      ├── FreeBSD.yml
      ├── OpenBSD.yml
      └── RedHat.yml
  ```

  ---

- ansible-galaxy 删除

  ```
  [root@node1 roles]# ansible-galaxy remove geerlingguy.nginx 
  - successfully removed geerlingguy.nginx
  ```

##### playbook 介绍

- 由一个或多个play组成，play相当于剧本中的剧情

- playbook采用YAML语言编写

- play主要功能在于将事先归并为一组的主机装扮成事先通过ansible中的task定义好的角色进行操作，从根本上讲，所谓task无非就是调用ansible的一个module，将多个play组成在一个playbook中，即可以让他们联通起来，按照事先编排的机制同唱一出大戏

- 变量

  - 变量命名

    变量名仅能由字母、数字和下划线组成，且只能以字母开头。

  - facts

    facts是由正在通信的远程目标主机发回的信息，这些信息被保存在ansible变量中。要获取指定的远程主机所支持的所有facts，可使用如下命令进行：

    `ansible hostname -m setup`

  - register

  把任务的输出定义为变量，然后用于其他任务，示例如下:

    ```
  tasks:
       - shell: /usr/bin/foo
         register: foo_result
         ignore_errors: True
    ```

  

  - 通过命令行传递变量

  在运行playbook的时候也可以传递一些变量供playbook使用，示例如下：

  	ansible-playbook test.yml --extra-vars "hosts=www user=mageedu"

  - 通过roles传递变量

  当给一个主机应用角色的时候可以传递变量，然后在角色内使用这些变量，示例如下：

  	- hosts: webservers
  	  roles:
  	    - common
  	    - { role: foo_app_instance, dir: '/web/htdocs/a.com',  port: 8080 }

- Inventory

  ansible的主要功用在于批量主机操作，为了便捷地使用其中的部分主机，可以在inventory file中将其分组命名。默认的inventory file为/etc/ansible/hosts。

  inventory file可以有多个，且也可以通过Dynamic Inventory来动态生成。

  - inventory文件格式

    inventory文件遵循INI文件风格，中括号中的字符为组名。可以将同一个主机同时归并到多个不同的组中；此外，当如若目标主机使用了非默认的SSH端口，还可以在主机名称之后使用冒号加端口号来标明。

  	ntp.magedu.com
  	
  	[webservers]
  	www1.magedu.com:2222
  	www2.magedu.com
  	
  	[dbservers]
  	db1.magedu.com
  	db2.magedu.com
  	db3.magedu.com

  如果主机名称遵循相似的命名模式，还可以使用列表的方式标识各主机，例如：

  ```
  [webservers]
  www[01:50].example.com
  
  [databases]
  db-[a:f].example.com
  ```

  

  - 主机变量

  可以在inventory中定义主机时为其添加主机变量以便于在playbook中使用。例如：

  ```
  [webservers]
  www1.magedu.com http_port=80 maxRequestsPerChild=808
  www2.magedu.com http_port=8080 maxRequestsPerChild=909
  ```

  

  - 组变量

  组变量是指赋予给指定组内所有主机上的在playboo中可用的变量。例如：

  ```
  [webservers]
  www1.magedu.com
  www2.magedu.com
  
  [webservers:vars]
  ntp_server=ntp.magedu.com
  nfs_server=nfs.magedu.com
  ```

  

  - 组嵌套

  inventory中，组还可以包含其它的组，并且也可以向组中的主机指定变量。不过，这些变量只能在ansible-playbook中使用，而ansible不支持。例如：

  ```
  [apache]
  httpd1.magedu.com
  httpd2.magedu.com
  
  [nginx]
  ngx1.magedu.com
  ngx2.magedu.com
  
  [webservers:children]
  apache
  nginx
  
  [webservers:vars]
  ntp_server=ntp.magedu.com
  ```

  

  - inventory参数

  ansible基于ssh连接inventory中指定的远程主机时，还可以通过参数指定其交互方式；这些参数如下所示：

  ```
  ansible_ssh_host
    The name of the host to connect to, if different from the alias you wish to give to it.
  ansible_ssh_port
    The ssh port number, if not 22
  ansible_ssh_user
    The default ssh user name to use.
  ansible_ssh_pass
    The ssh password to use (this is insecure, we strongly recommend using --ask-pass or SSH keys)
  ansible_sudo_pass
    The sudo password to use (this is insecure, we strongly recommend using --ask-sudo-pass)
  ansible_connection
    Connection type of the host. Candidates are local, ssh or paramiko.  The default is paramiko before Ansible 1.2, and 'smart' afterwards which detects whether usage of 'ssh' would be feasible based on whether ControlPersist is supported.
  ansible_ssh_private_key_file
    Private key file used by ssh.  Useful if using multiple keys and you don't want to use SSH agent.
  ansible_shell_type
    The shell type of the target system. By default commands are formatted using 'sh'-style syntax by default. Setting this to 'csh' or 'fish' will cause commands executed on target systems to follow those shell's syntax instead.
  ansible_python_interpreter
    The target host python path. This is useful for systems with more
    than one Python or not located at "/usr/bin/python" such as \*BSD, or where /usr/bin/python
    is not a 2.X series Python.  We do not use the "/usr/bin/env" mechanism as that requires the remote user's
    path to be set right and also assumes the "python" executable is named python, where the executable might
    be named something like "python26".
  ansible\_\*\_interpreter
    Works for anything such as ruby or perl and works just like ansible_python_interpreter.
    This replaces shebang of modules which will run on that host.
  ```

  

##### ansible-playbook

>playbook是由一个或多个“play”组成的列表。play的主要功能在于将事先归并为一组的主机装扮成事先通过ansible中的task定义好的角色。从根本上来讲，所谓task无非是调用ansible的一个module。将多个play组织在一个playbook中，即可以让它们联同起来按事先编排的机制同唱一台大戏。下面是一个简单示例。

`man ansible-playbook | ansible-playbook --help`

```
[root@node1 ~]# ansible-playbook hello.yml 
```

```
---                               #首行三个横线
- hosts: websers                  # -和： 后面有空格
  remote_user: root
  tasks:                          #tasks
    - name: hello                 #name只是说明接下里要干什么事
      command: ps -ef             #ansible all -m command -a "hostname",剧本中要想左边这样写
      ##几个空格没关系，关键是对齐
```

```
	- hosts: webnodes
	  vars:
	    http_port: 80
	    max_clients: 256
	  remote_user: root
	  tasks:
	  - name: ensure apache is at the latest version
	    yum: name=httpd state=latest
	  - name: ensure apache is running
	    service: name=httpd state=started
	  handlers:
	    - name: restart apache
	      service: name=httpd state=restarted
```

###### playbook基础组件

- Hosts和Users

  > playbook中的每一个play的目的都是为了让某个或某些主机以某个指定的用户身份执行任务。hosts用于指定要执行指定任务的主机，其可以是一个或多个由冒号分隔主机组；remote_user则用于指定远程主机上的执行任务的用户。如上面示例中的
  > 		-hosts: webnodes
  > 		 remote_user: root
  >
  > 	不过，remote_user也可用于各task中。也可以通过指定其通过sudo的方式在远程主机上执行任务，其可用于play全局或某任务；此外，甚至可以在sudo时使用sudo_user指定sudo时切换的用户。
  > 	
  > 		- hosts: webnodes
  > 		  remote_user: mageedu
  > 		  tasks:
  > 		    - name: test connection
  > 		      ping:
  > 		      remote_user: mageedu
  > 		      sudo: yes

- 任务列表和action

  > play的主体部分是task list。task list中的各任务按次序逐个在hosts中指定的所有主机上执行，即在所有主机上完成第一个任务后再开始第二个。在运行自下而下某playbook时，如果中途发生错误，所有已执行任务都将回滚，因此，在更正playbook后重新执行一次即可。
  >
  > 	task的目的是使用指定的参数执行模块，而在模块参数中可以使用变量。模块执行是幂等的，这意味着多次执行是安全的，因为其结果均一致。
  > 	
  > 	每个task都应该有其name，用于playbook的执行结果输出，建议其内容尽可能清晰地描述任务执行步骤。如果未提供name，则action的结果将用于输出。
  > 	
  > 	定义task的可以使用“action: module options”【新版本中支持】或“module: options”的格式，推荐使用后者以实现向后兼容。如果action一行的内容过多，也中使用在行首使用几个空白字符进行换行。
  > 		tasks:
  > 		  - name: make sure apache is running
  > 		    service: name=httpd state=running
  > 	
  > 		在众多模块中，只有command和shell模块仅需要给定一个列表而无需使用“key=value”格式，例如：
  > 			tasks:
  > 			  - name: disable selinux
  > 			    command: /sbin/setenforce 0
  > 	
  > 		如果命令或脚本的退出码不为零，可以使用如下方式替代：
  > 			tasks:
  > 			  - name: run this command and ignore the result
  > 			    shell: /usr/bin/somecommand || /bin/true		
  > 	
  > 		或者使用ignore_errors来忽略错误信息：
  > 			tasks:
  > 			  - name: run this command and ignore the result
  > 			    shell: /usr/bin/somecommand
  > 			    ignore_errors: True		

- handlers

  > 用于当关注的资源发生变化时采取一定的操作。
  >
  > 	“notify”这个action可用于在每个play的最后被触发，这样可以避免多次有改变发生时每次都执行指定的操作，取而代之，仅在所有的变化发生完成后一次性地执行指定操作。在notify中列出的操作称为handler，也即notify中调用handler中定义的操作。
  > 		- name: template configuration file
  > 		  template: src=template.j2 dest=/etc/foo.conf
  > 		  notify:
  > 		     - restart memcached
  > 		     - restart apache	
  > 	
  > 	handler是task列表，与它同列哦，这些task与前述的task并没有本质上的不同。
  > 		handlers:
  > 		    - name: restart memcached
  > 		      service:  name=memcached state=restarted
  > 		    - name: restart apache
  > 		      service: name=apache state=restarted

- when语句

  > 在task后添加when子句即可使用条件测试；when语句支持Jinja2表达式语法。例如：
  >
  > tasks:
  >   - name: "shutdown Debian flavored systems"
  >     command: /sbin/shutdown -h now
  >     when: ansible_os_family == "Debian"
  >
  > when语句中还可以使用Jinja2的大多“filter”，例如要忽略此前某语句的错误并基于其结果（failed或者sucess）运行后面指定的语句，可使用类似如下形式：
  >
  > tasks:
  >   - command: /bin/false
  >     register: result
  >     ignore_errors: True
  >   - command: /bin/something
  >     when: result|failed
  >   - command: /bin/something_else
  >     when: result|success
  >   - command: /bin/still/something_else
  >     when: result|skipped
  >
  > 此外，when语句中还可以使用facts或playbook中定义的变量。

- 迭代

  > 当有需要重复性执行的任务时，可以使用迭代机制。其使用格式为将需要迭代的内容定义为item变量引用，并通过with_items语句来指明迭代的元素列表即可。例如：
  >
  > - name: add several users
  >   user: name={{ item }} state=present groups=wheel
  >   with_items:
  >      - testuser1
  >      - testuser2
  >
  > 上面语句的功能等同于下面的语句：
  >
  > - name: add user testuser1
  >   user: name=testuser1 state=present groups=wheel
  > - name: add user testuser2
  >   user: name=testuser2 state=present groups=wheel
  >
  > 事实上，with_items中可以使用元素还可为hashes，例如：
  >
  > - name: add several users
  >   user: name={{ item.name }} state=present groups={{ item.groups }}
  >   with_items:
  >     - { name: 'testuser1', groups: 'wheel' }
  >     - { name: 'testuser2', groups: 'root' }
  >
  > ansible的循环机制还有更多的高级功能，具体请参见官方文档（http://docs.ansible.com/playbooks_loops.html）。

- tags

  > tags用于让用户选择运行playbook中的部分代码。ansible具有幂等性，因此会自动跳过没有变化的部分，即便如此，有些代码为测试其确实没有发生变化的时间依然会非常地长。此时，如果确信其没有变化，就可以通过tags跳过此些代码片断。
  > always

- Jinjia2

  > 字面量

  ```
   表达式最简单的形式就是字面量。字面量表示诸如字符串和数值的 Python 对象。下面 的字面量是可用的:
  
  	“Hello World”:
  	双引号或单引号中间的一切都是字符串。无论何时你需要在模板中使用一个字 符串（比如函数调用、过滤器或只是包含或继承一个模板的参数），它们都是 有用的。
  
  	42 / 42.23:
  	直接写下数值就可以创建整数和浮点数。如果有小数点，则为浮点数，否则为 整数。记住在 Python 里， 42 和 42.0 是不一样的。
  
  	[‘list’, ‘of’, ‘objects’]:
  	一对中括号括起来的东西是一个列表。列表用于存储和迭代序列化的数据。例如 你可以容易地在 'for' 循环中用列表和元组创建一个链接的列表:
  
  	<ul>
  	{% for href, caption in [('index.html', 'Index'), ('about.html', 'About'),
  	                         ('downloads.html', 'Downloads')] %}
  	    <li><a href="{{ href }}">{{ caption }}</a></li>
  	{% endfor %}
  	</ul>
  
  	(‘tuple’, ‘of’, ‘values’):
  	元组与列表类似，只是你不能修改元组。如果元组中只有一个项，你需要以逗号 结尾它。元组通常用于表示两个或更多元素的项。更多细节见上面的例子。
  
  	{‘dict’: ‘of’, ‘key’: ‘and’, ‘value’: ‘pairs’}:
  	Python 中的字典是一种关联键和值的结构。键必须是唯一的，并且键必须只有一个 值。字典在模板中很少使用，罕用于诸如 xmlattr() 过滤器之类。
  
  	true / false:
  	true 永远是 true ，而 false 始终是 false 。
  ```

  > 算术运算

  	Jinja 允许你用计算值。这在模板中很少用到，但是为了完整性允许其存在。支持下面的 运算符:
  	
  		+
  			把两个对象加到一起。通常对象是素质，但是如果两者是字符串或列表，你可以用这 种方式来衔接它们。无论如何这不是首选的连接字符串的方式！连接字符串见 ~ 运算符。 {{ 1 + 1 }} 等于 2 。
  		-
  			用第一个数减去第二个数。 {{ 3 - 2 }} 等于 1 。
  		/
  			对两个数做除法。返回值会是一个浮点数。 {{ 1 / 2 }} 等于 {{ 0.5 }} 。
  		//
  			对两个数做除法，返回整数商。 {{ 20 // 7 }} 等于 2 。
  		%
  			计算整数除法的余数。 {{ 11 % 7 }} 等于 4 。
  		*
  			用右边的数乘左边的操作数。 {{ 2 * 2 }} 会返回 4 。也可以用于重 复一个字符串多次。 {{ ‘=’ * 80 }} 会打印 80 个等号的横条。
  		**
  			取左操作数的右操作数次幂。 {{ 2**3 }} 会返回 8 。
  > 比较操作符

  	==
  		比较两个对象是否相等。
  	!=
  		比较两个对象是否不等。
  	>
  		如果左边大于右边，返回 true 。
  	>=
  		如果左边大于等于右边，返回 true 。
  	<
  		如果左边小于右边，返回 true 。
  	<=
  		如果左边小于等于右边，返回 true 。
  >  逻辑运算符

   对于if 语句，在 "for"  过滤或 if 表达式中，它可以用于联合多个表达式:

  	and
  		如果左操作数和右操作数同为真，返回 true 。
  	or
  		如果左操作数和右操作数有一个为真，返回 true 。
  	not
  		对一个表达式取反（见下）。
  	(expr)
  		表达式组。

##### YAML介绍

```
是一个可读性高的用来表达资料序列的格式、YAML参考了多种语言，包括XML、C、Python、Perl
官网：https://yaml.org/
```

- 在单一文件中，用三个连续的（-）区分多个档案、例如hello.yml , 还有选择性的连续三个点表示档案的结尾

- 次行一般建议写明playbook的功能，使用#表示注释

- 缩进必须统一，不能空格和tab混用，缩进级别必须一致，同样缩进代表同样的级别，程序判别配置的级别通过缩进结合换行来实现

- 区分大小写，key/value大小写敏感，k/v可以同行也可以换行，同行使用：分割，v可以是字符串也可是列表

- 一个完整的代码块功能最少元素需包括name和task，一个name只能包括一个task

- YAML文件扩展名通常为yml或者yaml

- LIST列表，其所有元素均使用“-” 打头，后面有一个空格，例：

  ```
  # A list of fruit
  - Apple
  - Orange
  ```

- Dictionary字典：通常由多个k/v组成

  ```
  # An employee record
  name: aaa
  job: developer
  ```

  - 也可以将k/v放于{}中，用逗号区分多个k/v

    ```
    {name: aaa,job: developer}
    ```

##### 多实例

- 创建用户，组，copy文件

```
[root@node1 playbook]# cat test.yml 
- hosts: websers
  remote_user: root
  tasks:
  - name: add group
    group: system=yes name=nginx gid=2018
  - name: add user
    user: system=yes name=nginx group=nginx uid=2018
- hosts: dbsers
  remote_user: root
  tasks:
  - name: copy file
    copy: src=/etc/passwd dest=/tmp/
```

- handlers：触发器

```
- hosts: websers
  remote_user: root
  tasks:
  - name: install httpd
    yum: name=httpd state=latest
  - name: copy httpd.conf to service
    copy: src=/root/httpd.conf dest=/etc/httpd/conf/httpd.conf
    notify:  ##通知
    - restart httpd
  - name: start service
    service : name=httpd enabled=yes state=started
  handlers:  ##处理
  - name: restart httpd
    service: name=httpd state=restarted
```

- var 变量

```
- hosts: websers
  remote_user: root
  tasks:
  - name: copy
    copy: content="{{ ansible_all_ipv4_addresses }} {{ test }}" dest=/tmp/var.log
```

- when 

```
- hosts: all
  remote_user: root
  vars:
  - users: hello
  tasks:
  - name: add user {{ users }}
    user: name={{ users }}
    when: ansible_fqdn == "node2-clone"
```

- template:模板

```

- hosts: websers
  remote_user: root
  vars:
  - pkgs: httpd
  - sers: httpd
  tasks:
  - name: install httpd
    yum: name={{ pkgs }} state=latest
  - name: copy httpd.conf to service
    template: src=/root/template/httpd.conf.j2 dest=/etc/httpd/conf/httpd.conf
    notify:
    - restart httpd
  - name: start service
    service : name={{ sers }} enabled=yes state=started
  handlers:
  - name: restart httpd
    service: name=httpd state=restarted
```

- tags标签

```
- hosts: websers
  remote_user: root
  vars:
  - pkgs: httpd
  - sers: httpd
  tasks:
  - name: install httpd
    yum: name={{ pkgs }} state=latest
  - name: copy httpd.conf to service
    template: src=/root/template/httpd.conf.j2 dest=/etc/httpd/conf/httpd.conf
    tags:
    - tags1
    notify:
    - restart httpd
  - name: start service
    service : name={{ sers }} enabled=yes state=started
  handlers:
  - name: restart httpd
    service: name=httpd state=restarted
    
[root@node1 playbook]# ansible-playbook apache.tags.yml --tags="tags1"
```



#### Roles

> ansilbe自1.2版本引入的新特性，用于层次性、结构化地组织playbook。roles能够根据层次型结构自动装载变量文件、tasks以及handlers等。要使用roles只需要在playbook中使用include指令即可。简单来讲，roles就是通过分别将变量、文件、任务、模板及处理器放置于单独的目录中，并可以便捷地include它们的一种机制。角色一般用于基于主机构建服务的场景中，但也可以是用于构建守护进程等场景中。

- 一个roles的案例如下所示：

```
		site.yml
		webservers.yml
		dbservers.yml
		roles/
		   common/
		     files/
		     templates/
		     tasks/
		     handlers/
		     vars/
		     meta/
		   webservers/
		     files/
		     templates/
		     tasks/
		     handlers/
		     vars/
		     meta/
```

- 而在playbook中，可以这样使用roles：

```
	---
	- hosts: webservers
	  roles:
	     - common
	     - webservers
```

- 也可以向roles传递参数，例如：

```
	---

	- hosts: webservers
	  roles:
	    - common
	    - { role: foo_app_instance, dir: '/opt/a',  port: 5000 }
	    - { role: foo_app_instance, dir: '/opt/b',  port: 5001 }
```

- 甚至也可以条件式地使用roles，例如：

```
	---

	- hosts: webservers
	  roles:
	    - { role: some_role, when: "ansible_os_family == 'RedHat'" }
```

##### 创建role的步骤

- 创建以roles命名的目录；
- 在roles目录中分别创建以各角色名称命名的目录，如webservers等；
- 在每个角色命名的目录中分别创建files、handlers、meta、tasks、templates和vars目录；用不到的目录可以创建为空目录，也可以不创建；
- 在playbook文件中，调用各角色；

##### role内各目录中可用的文件

> tasks目录：至少应该包含一个名为main.yml的文件，其定义了此角色的任务列表；此文件可以使用include包含其它的位于此目录中的task文件；

> files目录：存放由copy或script等模块调用的文件；

> templates目录：template模块会自动在此目录中寻找Jinja2模板文件；

> handlers目录：此目录中应当包含一个main.yml文件，用于定义此角色用到的各handler；在handler中使用include包含的其它的handler文件也应该位于此目录中；

> vars目录：应当包含一个main.yml文件，用于定义此角色用到的变量；

> meta目录：应当包含一个main.yml文件，用于定义此角色的特殊设定及其依赖关系；ansible 1.3及其以后的版本才支持；

> default目录：为当前角色设定默认变量时使用此目录；应当包含一个main.yml文件；

```
[root@node1 ~]# mkdir -pv ansible_playbook/roles/{web,db}/{tasks,files,templates,meta,handlers,vars}
[root@node1 ansible_playbook]# tree ./
./
├── roles
│   ├── db
│   │   ├── files
│   │   │   └── client.cnf
│   │   ├── handlers
│   │   ├── meta
│   │   ├── tasks
│   │   │   └── main.yml
│   │   ├── templates
│   │   └── vars
│   └── web
│       ├── files
│       │   └── httpd.conf
│       ├── handlers
│       │   └── main.yml
│       ├── meta
│       ├── tasks
│       │   └── main.yml
│       ├── templates
│       └── vars
├── site.retry
└── site.yml
[root@node1 ansible_playbook]# ansible-playbook site.yml 
```



