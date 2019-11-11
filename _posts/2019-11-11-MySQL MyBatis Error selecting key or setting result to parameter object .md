---
layout:     post
title:      MySQL MyBatis selecting key or setting result to parameter object
subtitle:   MySQL MyBatis selecting key or setting result to parameter object
date:       2019-11-11
author:     BY
header-img: img/post-bg-re-vs-ng2.jpg
catalog: true
tags:
    - mysql
    - mybatis
    - selecting key or setting result to parameter object
---



Mybatis 新增单个实体出现异常信息  
Error selecting key or setting result to parameter object
原因是你的实体类型,XML映射文件里的类型不一致导致报错
实体类型:

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

Mybatis.xml文件配置

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
将实体中id属性 Long类型改为Integer
或者将映射文件返回类型改为resultType="java.lang.Long"
```



------

Error selecting key or setting result to parameter object. Cause: 
com.mysql.jdbc.exceptions.jdbc4.MySQLDataException: '2.14780149E9' in column '1' is outside valid range for the datatype INTEGER.\n; SQL []; '2.14780149E9' in column '1' is outside valid range for the datatype INTEGER.; nested exception is com.mysql.jdbc.exceptions.jdbc4.MySQLDataException: '2.14780149E9' in column '1' is outside valid range for the datatype INTEGER.


