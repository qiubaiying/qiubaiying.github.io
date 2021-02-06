---
layout:     post
title:      MySQL MyBatis 
subtitle:   MySQL MyBatis selecting key or setting result to parameter object
date:       2019-11-11
author:     YuLe
header-img: img/post-bg-re-vs-ng2.jpg
catalog: true
tags:
    - mysql
    - mybatis
    - selecting key or setting result to parameter object
---



[TOC]



## Mybatis 实体出现异常信息  

------

Error selecting key or setting result to parameter object
原因是你的实体类型,XML映射文件里的类型不一致导致报错

## 实体类型:

```java
public class Entity{
  // 表记录自增id
	private long id;
	// 创建时间
	private Date createTime;
	// 修改时间
	private Date updateTime;
	// 创建人
	private String createPin;
	// 修改人
	private String updatePin;
	// 0：默认值，有效；1：
	private Boolean yn;
}
```

## Mybatis.xml文件配置

```mysql
<insert id="insertEntity" parameterType="Entity">
  <selectKey resultType="java.lang.Integer" keyProperty="id">
    select LAST_INSERT_ID()
  </selectKey>
  insert into Entity(id,order_id,create_time,update_time,create_user,update_user,yn
  ) values (
   #{id,jdbcType=BIGINT},#{orderId,jdbcType=BIGINT},
    1,now(),now(),#{createUser,jdbcType=VARCHAR},#{updateUser,jdbcType=VARCHAR},0
  )
</insert>
```

* 将实体中id属性 Long类型改为Integer
* 或者将映射文件返回类型改为resultType="java.lang.Long"



## Mapper 类型映射错误日志

Error selecting key or setting result to parameter object. Cause: 
com.mysql.jdbc.exceptions.jdbc4.MySQLDataException: '2.14780149E9' in column '1' is outside valid range for the datatype INTEGER.\n; SQL []; '2.14780149E9' in column '1' is outside valid range for the datatype INTEGER.; nested exception is com.mysql.jdbc.exceptions.jdbc4.MySQLDataException: '2.14780149E9' in column '1' is outside valid range for the datatype INTEGER.

 当主键自增Id值达到Integer类型最大值的时候 ，就会报类型转换错误，如果是生产系统问题严重性就不说了。所以在使用mybatis 自定sql 时，一定要注意表字段属性和Mapper 类型转换的匹配以及长度问题。



## Mysql 表属性

| Field    | Type       | Null | Key  | Default | Extra          |
| -------- | ---------- | ---- | ---- | ------- | :------------- |
| id       | bigint(20) | NO   | PRI  | null    | auto_increment |
| order_id | bigint(20) | NO   | MUL  | null    |                |
| **       | **         | **   | **   | **      |                |