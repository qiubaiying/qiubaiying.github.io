---
layout:     post 
title:      Springboot的Shiro加密
subtitle:   MD5盐值加密
date:       2020-01-07
author:     张鹏
header-img: img/home-bg.jpg
catalog: true   
tags:                         
    - Springboot
---

#### 本文档算是Spring boot文档的完结版本，讲述剩下的一个功能，密码盐值加密。

#### 1.盐值加密

- 盐值加密是一种加密方式。MD5加密是对用户的密码进行取哈希操作，如果凑巧，用户的密码设置的相同，那么加密之后的密码也就相同，所以可以在用户密码加密的时候添加一些掩饰，从而保证加密的安全。
- 例：

```java
输入：盐值 salt 、密码字符串passWord
输出：密码密文passWordHash
函数：加密hash函数
```

#### 2.Shiro的MD5盐值加密功能

- **首先，效果图如下**
- ![l6CmkD.gif](https://s2.ax1x.com/2020/01/07/l6CmkD.gif)
- 以下所有代码均是在已经实现前面所说的功能后添加的。
- **具体实现步骤(我是把用户名当作盐值，所以没有在数据库中定义salt)**
   - 1.ShiroConfig.java配置中增加

```java
 /**
     * 注入自定义的Ream
     * @return
     */
    @Bean
    public CustomRealm customRealm(){
        CustomRealm customRealm = new CustomRealm();
        //注入密码加密
        customRealm.setCredentialsMatcher(hashedCredentialsMatcher());
        return customRealm;
    }

    /**
     * 密码加密算法设置
     * @return
     */
    @Bean
    public HashedCredentialsMatcher hashedCredentialsMatcher(){
        HashedCredentialsMatcher hashedCredentialsMatcher = new HashedCredentialsMatcher();
        hashedCredentialsMatcher.setHashAlgorithmName("md5");
        //散列的次数
        hashedCredentialsMatcher.setHashIterations(2);
        return hashedCredentialsMatcher;
    }
```

   - 2.Realm注入到SecurityManager中

```java
 @Bean
    public SecurityManager securityManager(){
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        //将自定义的realm交给SecurityManager管理
        securityManager.setRealm(customRealm());
        // 自定义缓存实现 使用redis
        securityManager.setCacheManager(cacheManager());
        // 自定义session管理 使用redis
        securityManager.setSessionManager(SessionManager());
        // 使用记住我
        securityManager.setRememberMeManager(rememberMeManager());
        return securityManager;
    }
```

   - 3.修改CustomRealm中的doGetAuthenticationInfo方法

```java
        SimpleAuthenticationInfo simpleAuthenticationInfo = new SimpleAuthenticationInfo(user, user.getPassword(), ByteSource.Util.bytes(userName),getName());
```

   - 4.编写加密工具类，用来实现注册时密码加密

```java
package com.sc.utils;

import org.apache.shiro.crypto.hash.Md5Hash;

public class PasswordGenerateUtil {

    public static String getPassword(String userName,String password,String salt,int hashTimes){
        Md5Hash md5Hash = new Md5Hash(password,userName,hashTimes);
        return md5Hash.toString();
    }
}
```

   - 5.修改注册方法

```java
//进行注册操作
    @RequestMapping("/register")
    public String Register(User user, Map map,HttpServletRequest request){
        user.setRoleId(3);
        String userName = request.getParameter("userName");
        String password = request.getParameter("password");
        String password1 = PasswordGenerateUtil.getPassword(userName, password, userName, 2);
        user.setPassword(password1);
        userService.addUser(user);
        System.out.println("加密后的密码为==============>"+password1);
        map.put("msg","成功注册，请登录");
        return "login";
    }
```

#### 总结

- 经过三篇总结之后，关于Spring boot的有关知识已经学习完毕。利用这些知识可以完成相当完整的项目。没有什么难点，大部分只需要静下心研究就能理解。