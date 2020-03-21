---
title: jenkins+gitlab+k8s+Harbor自动化发布
date: 2019-01-03 23:38:50
tags: k8s
---
### 写在前面的话
搞一个CI/CD，手动更新docker image实在是太麻烦了，想了想通过什么来做呢，之前通过drone做过，但是学习成本有点高，也没有jenkins的技术更加的成熟，所以根据现在公司的环境决定还是使用jenkins来做。一是为了统一环境，都是jenkins的话，大家都比较熟悉用起来比较快速，二是因为jenkins配置简单，plugins也非常的丰富，jenkins的plugins这个东西确实很强大，对接ldap，接钉钉机器人发信息，针对不同用户对不同的视图job做租户之间的隔离等等，有很多可以玩的东西。
### 先找台服务器搭个jenkins。
我最开始采用了两种方式启动jenkins，一是使用jenkins on k8s 和jenkins on docker，但是坑有点多我又着急用所以暂时绕过，和裸机上直接安装jenkins相比在build image和deploy image的过程中container中启动的jenkins耗费的时间更长效率更低，之后有时间的话也会再看看这个问题，个人感觉其实很多东西都可以使用docker的方式去启动，没必要采用传统的方式去安装。
#### 一，安装java环境并安装git命令
##### 1.找到需要的jdk的tar包并下载下来，我这里采用的是jdk-8u181-linux-x64.tar.gz（http://www.oracle.com/technetwork/java/javase/downloads）
##### 2.解压tar包并看心情放到哪里，我放到了/usr/local/java目录下，大家随意。
```
tar xf jdk-8u181-linux-x64.tar.gz -C /usr/local/java
```
##### 3.修改全局环境变量vim /etc/profile 在最后添加以下内容。（为什么配置mvn和node是为了方便jenkins打jar包war包编译nodejs代码等，安装这些的方法我就不一一赘述了，google查一下一堆）。
```
JAVA_HOME=/usr/local/java/jdk1.8.0_181
JRE_HOME=/usr/local/java/jdk1.8.0_181/jre
PATH=$PATH:$JAVA_HOME/bin:$JRE_HOME/bin:$NODE_HOME/bin
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$JRE_HOME/lib
export JAVA_HOME JRE_HOME PATH CLASSPATH NODE_HOME
MAVEN_HOME=/application/apache-maven-3.5.3/
export PATH=$PATH:$MAVEN_HOME/bin/
```
然后source /etc/profile && java -version && yum -y install git 看一下java的版本就ok了！

#### 二. 安装jenkins
##### 1.配置jenkins的yum源并使用yum安装jenkins，我使用的是2.138-1.1，大家可以直接yum install 最新的jenkins没有什么太大的区别。
```
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
sudo yum -y install jenkins
```
##### 2.编辑jenkins配置文件并启动jenkins，我改的地方就是三行
```
vim /etc/sysconfig/jenkins

JENKINS_HOME="/data/jenkins" #定义jenkins的工作路径
JENKINS_USER="root"          #定义启动jenkins的用户，为了避免权限问题我直接使用了root用户
JENKINS_PORT="8080"          #定义jenkins的启动端口为8080
```
##### 3.启动jenkins，可以使用systemctl restart jenkins，如有报错可以通过journalctl -xe | grep jenkins，我遇到了一个报错
```
Apr 23 14:41:08 bj-idc-k8s-master-003 jenkins[22316]: Starting Jenkins bash: /usr/bin/java: No such file or directory
```
这个是说在没有找到/usr/bin/java，因为我们安装的java路径并不在这里，通过ln -snf /usr/local/java/jdk1.8.0_181/bin/java /usr/bin/java 把java link到jenkins默认识别的java路径即可。

##### 4.打开浏览器访问机器访问的url为，ip:8080，并根据jenkins的提示查看 cat /var/lib/jenkins/secrets/initialAdminPassword jenkins的初始化admin密码。然后按照web界面的提示一步一步操作即可。
![1.png](jenkins+gitlab+k8s+Harbor自动化发布/1.png)
![2.png](jenkins+gitlab+k8s+Harbor自动化发布/2.png)
![3.png](jenkins+gitlab+k8s+Harbor自动化发布/3.png)
![4.png](jenkins+gitlab+k8s+Harbor自动化发布/4.png)
![5.png](jenkins+gitlab+k8s+Harbor自动化发布/5.png)

##### 5.安装插件，gitlab，gitlab hook（jenkins与gitlab连接的钩子），Publish Over SSH（通过SSH将文件传到远程服务器），Maven Integration（Maven的编译操作流程），Kubernetes Continuous Deploy（将项目部署在K8S上我暂时未使用），Dingding[钉钉] Plugin（用来发送钉钉通知），Configuration Slicing plugin（快速查看修改配置）















