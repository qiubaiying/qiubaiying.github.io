---
layout:     post 
title:      Shiro权限URL配置的细节以及认证流程
subtitle:   Shiro权限URL配置的细节以及认证流程
date:       2019-09-14
author:     张鹏
header-img: img/post-bg-YesOrNo.jpg
catalog: true   
tags:                         
    - Shiro
---

### Shiro权限URL配置的细节以及认证流程

```xml
 <!--  
    6. 配置 ShiroFilter. 
    6.1 id 必须和 web.xml 文件中配置的 DelegatingFilterProxy 的 <filter-name> 一致.
                      若不一致, 则会抛出: NoSuchBeanDefinitionException. 因为 Shiro 会来 IOC 容器中查找和 <filter-name> 名字对应的 filter bean.
    -->     
    <bean id="shiroFilter" class="org.apache.shiro.spring.web.ShiroFilterFactoryBean">
        <property name="securityManager" ref="securityManager"/>
        <property name="loginUrl" value="/login.jsp"/>
        <property name="successUrl" value="/list.jsp"/>
        <property name="unauthorizedUrl" value="/unauthorized.jsp"/>
        <!--  
        	配置哪些页面需要受保护. 
        	以及访问这些页面需要的权限. 
        	1). anon 可以被匿名访问
        	2). authc 必须认证(即登录)后才可能访问的页面. 
        	3). logout 登出.
        	4). roles 角色过滤器
        -->
        <property name="filterChainDefinitions">
            <value>
                /login.jsp = anon
                
                # everything else requires authentication:
                /** = authc
            </value>
        </property>
    </bean>
```

- `[urls]`部分的配置，其格式是：“url=拦截器[参数],拦截器[参数]”
- 如果当前请求的url匹配[urls]部分的某个url部分，将会执行其配置的拦截器
- anon（anonymous）拦截器表示匿名访问（即不需要登陆即可访问）
- authc（authentication）拦截器表示需要身份认证通过后才能访问

#### URL匹配模式

- url模式使用Ant风格模式
- Ant路径通配符支持`?、*、**`，注意通配符匹配不包括目录分隔符`/`；
   - `?`：匹配一个字符，如`/admin?`将匹配`/admin1`，但不匹配`/admin或/admin/`
   - `*`：匹配零个或多个字符串，如`/admin`将匹配`/admin、/admin123`，但不匹配`/admin/1`
   - `**`：匹配路径中的零个或多个路径，如`/admin/**`将匹配`/admin/a或/admin/a/b`

#### URL匹配顺序

- URL权限采取一次匹配优先的方式，即从头开始使用第一个匹配的url模式对应的拦截器链，如：

```xml
-/bb/**=filter1
-/bb/aa=filter2
-/**=filter3
```
- 如果请求的是`/bb/aa`，因为按照声明顺序进行匹配，那么将使用filter1进行拦截

#### shiro的认证

- shiro认证的步骤
   - 获取当前的Subject，调用SecurityUtils.getSubject();
   - 测试当前的用户是否已经被认证（即是否已经登陆），调用Subject的isAuthenticated()方法
   - 若没有被认证，则把用户名和密码封装为UsernamePasswordToken对象
      - 创建一个表单页面
      - 把请求提交到SpringMVC的Handler
      - 获取用户名和密码
   - 执行登陆：调用Subject的login(AuthenticationToken)方法
   - 自定义Realm的方法，从数据库中获取对应的记录，返回给Shiro
      - 继承org.apache.shiro.realm.AuthenticatingRealm类
      - 实现doGetAuthenticationInfo(AuthenticationToken)方法
   - 用Shiro完成密码比对