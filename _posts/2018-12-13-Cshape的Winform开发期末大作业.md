---
layout:     post
title:      C#和学生管理系统
subtitle:   程序设计
date:       2018-12-13
author:     XHT
header-img: img/post-bg-universe.jpg
catalog: true
tags:
    - C#开发
---

## 任务摘要


用户表进行后台登陆验证实现学生，教师不同界面的打开

数据库的增删改查在教师界面进行实现，并进行调试确保成功运行

通过MysqlConn类进行数据库操作功能函数实现，方便功能的直接调用

通过ClassforMysql统一类进行List<>返回,方便返回结果，以及界面显示
使用技术落后，所使用的是字符串拼接拉进行数据库语句操作

## 程序的设计

除去界面类

还有另外的MysqlConn类进行数据库操作功能函数实现，方便功能的直接调用

MysqlConn类进行数据库操作功能函数实现，方便功能的直接调用

![](https://github.com/xht19980305/xht19980305.github.io/raw/master/img/form1.png)

登陆界面

登陆界面通过user用户表进行查找,通过flag标记确定登陆者权限

若登陆用户为学生，则打开学生成绩信息界面

在学生成绩信息界面，只可以查询自己的成绩信息

通过combox控件选择学期和课程来改变查询结果

![](https://github.com/xht19980305/xht19980305.github.io/raw/master/img/form2.png)

若登陆界面为老师,则打开功能更全面的学生管理界面

我们可以查找所有学生的信息，所有学生的成绩

学生成绩通过usc,ustudet,ucourse 三表进行查询

也可以通过textbox控件进行按姓名和班级的模糊查询

![](https://github.com/xht19980305/xht19980305.github.io/raw/master/img/form3.png)

我们将所有请求通过Myconn进行处理并返回lis内容到界面
![](https://github.com/xht19980305/xht19980305.github.io/raw/master/img/MysqlConn1.png)

将界面的datagridview的数据源绑定为查询结果返回的list容器

打开增加button则打开一个新界面，我们可以手动添加新学生的学号，姓名，性别，班级，以及出生日期(性别通过radiobutton分组进行二选一)到ustudent表里
![](https://github.com/xht19980305/xht19980305.github.io/raw/master/img/form4.png)

修改button则会以学号为基准进行 姓名，性别，班级，出生日期等信息的修改

删除也是以学号为基准进行删除

增加成绩按钮则会打开一个新界面
里面有学生学号，姓名，学期，课程，期中考试成绩，期末考试成绩的信息栏填写和选择
确认所有信息后则可以进行成绩信息增加到usc表里

![](https://github.com/xht19980305/xht19980305.github.io/raw/master/img/form5.png)

## 作业分析和展望：

  通过MysqlConn类进行功能函数实现，减少了代码重复量

  通过ClassforMysql类进行统一的变量管理，方便今后功能和信息的增加

  不同的界面通过登陆以及各种按钮进行关联

  不足之处是在使用较老的拼接字符串方式进行sql语句查询

  造成了大部分时间查错

  可以进一步通过linq语句方便功能实现

  通过这次大作业更好练习了C#的winform开发技术
