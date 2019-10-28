---
layout:     post 
title:      Springboot
subtitle:   Spring boot项目
date:       2019-10-28
author:     张鹏
header-img: img/home-bg.jpg
catalog: true   
tags:                         
    - Springboot
---

- ***利用SSM框架构建项目是毕业设计的主要方法，但是有一个很头疼的问题：各种配置文件和jar包的兼容问题。所以就出现了Maven，但是Maven还是需要你去配置各种SSM框架的配置文件，也是很麻烦。所以就出现了SpringBoot。我学习SpringBoot的原因主要是原本想要利用SSM框架+Shiro完成一个购物网站项目，但是在项目的构建过程中，Shiro和SSM的jar包之间总存在各种不兼容或者是框架的问题，所以就转向了SpringBoot，而且这样以后也方便进行Redis和Nginx的整合。***

- 这是一篇Springboot的中级讲解博文，有些基础知识不再涉及，和SSM有关的不再举例和讲解。
- 代码本就是意见枯燥无味的事情，只有静下心研究才能学到东西。全靠别人教你是不存在的。但是如果你有SSM框架基础，并且可以利用SSM框架打出一个完整的项目，那么这篇文章对你来说就没有什么压力了。

#### 本篇博客较长，所以在头部先声明一下会讲到的内容
1. Springboot项目的搭建
2. Springboot的文件结构
3. Springboot和Mybatis的整合
4. Springboot、Mybatis、Shiro的整合
5. 一些遇到的错误信息总结

#### 1.搭建一个简单的Springboot项目

- 1.需要的工具
   - Idea 2018.3
   - JDK 8
   - Maven 3.6.0
- 2.搭建步骤：
   - 1.打开Idea，选择create a new project
   - 2.左侧边栏选择Spring Initializr，右侧边栏保持默认，点击next
   - 3.自定义Group、Artifact、Package（当你输入group和artifact之后，package栏会自动出现两者的组合，但是我更倾向于把package定义成com.sc），完成后点击next
   - ![new project](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20133355.png)
   - 4.因为不涉及到整合Mybaits，所以先创建一个web项目即可。弹出的窗口选择如下图所示，之后一路next、finish即可
   - ![img1](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20133847.png)
   - ![img2](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20133909.png)
   - 5.完成后项目目录如图所示
   - ![final](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20134313.png)
   - 6.在resources目录下的static文件夹下创建一个index.html，并输入一段随意的内容，用来验证springboot是否启动成功
   - 7.运行BlogApplication.java。成功后打开浏览器，地址栏输入http://localhost:8080/index.html。若成功显示html网页，则说明Springboot框架搭建成功
   - ![run](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20134555.png)
   - ![result](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20135545.png)

#### 2.Springboot的文件结构

![projectstructer](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20134313.png)

- 1.Java：存放Java源代码
- 2.resources：资源文件目录
- 3.static：静态资源文件
- 4.templates：视图模板文件
- 5.application.properties(后面会更改为application.yml)：核心配置文件
- 6.pom.xml：和maven相同，用来存放相关依赖

#### 3.Springboot和Mybatis的整合

- Springboot与Mybaits的整合不同于利用maven创建SSM框架，因为Springboot已经集成了Spring、不需要去配置一系列复杂的文件。
- **步骤**
   - 1.创建一个新项目，前几步是一样的，直到选择依赖的一步，需要做出一些改变，需要选择的依赖有如下图所示：
   - ![project](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20140926.png)
   - 2.创建成功之后，把application.properties更改为application.yml。在yml文件中配置Mybatis（直接用已经建好的项目来演示了，懒得新建项目了）
   - ![yml](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20141308.png)
   - 代码如下（application.yml）：

```xml
spring:
  datasource:
    url: jdbc:mysql:///market?useUnicode=true&characterEncoding=utf8&useSSL=false  //设置数据库地址
    driver-class-name: com.mysql.jdbc.Driver   //设置数据库驱动
    username: root   //数据库用户名
    password: root   //数据库密码

server:
  port: 8080   //项目监听端口


mybatis:
  mapper-locations: classpath:mapper/*.xml   //配置mybatis扫描xml文件的路径，在这里是resources目录下的mapper文件夹里面所有的xml文件
  type-aliases-package: com.sc.entity    //设置别名
```

- 配置完毕之后就完成了Springboot与Mybatis的整合
- 测试请自行完成。。。如果SSM框架都不会的话，看这个可能会压力山大

#### 4.Springboot、Mybaits、Shiro的整合

- 利用Shiro可以完成登陆以及拦截器功能，也可以实现更加复杂的动态权限加载，但是目前来说用不到，所以只进行拦截器和登录功能的讲解
- **首先先说一下Shiro认证的过程**：
   - 创建SecurityManager安全管理器 > 主体Subject提交认证信息 > SecurityManager安全管理器认证 > SecurityManager调用Authenticator认证器认证 >Realm验证
   - 其中
      - Subject：主体，代表了当前“用户”；所有Subject都绑定到SecurityManager，与Subject的所有交互都会委托给SecurityManager；可以把Subject认为是一个门面；SecurityManager才是实际的执行者；
      - SecurityManager安全管理器：所有与安全有关的操作都会与SecurityManager交互；且它管理着所有Subject；负责与后边介绍的其他组件进行交互。（类似于SpringMVC中的DispatcherServlet控制器）
      - Realm：域，Shiro从从Realm获取安全数据（如用户、角色、权限），就是说SecurityManager要验证用户身份，那么它需要从Realm获取相应的用户进行比较以确定用户身份是否合法；也需要从Realm得到用户相应的角色/权限进行验证用户是否能进行操作；可以把Realm看成DataSource，即安全数据源。
- **步骤**
   - **注意：以下所有操作是在完成了Springboot与Mybatis的集成的基础上进行的**
   - 1.首先在数据库中创建一个user表，内容包含username、password。这里不再演示
   - 2.添加pom依赖

```xml
<dependency>
            <groupId>org.apache.shiro</groupId>
            <artifactId>shiro-spring</artifactId>
            <version>1.3.2</version>
        </dependency>
```

   - 3.对于未认证的用户请求进行拦截，跳转到认证界面（这里我让他直接跳转到了首页）

```java
package com.sc.config;

import com.sc.shiro.CustomRealm;
import org.apache.shiro.mgt.DefaultSecurityManager;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class ShiroConfig {

    /*
    配置Shiro的web过滤器，拦截浏览器请求并交给SecurityManager处理
     */
    @Bean
    public ShiroFilterFactoryBean webFilter(){
        ShiroFilterFactoryBean filterFactoryBean = new ShiroFilterFactoryBean();

        //配置拦截链，使用LinkedHashMap，因为LinkedHashMap是有序的，Shiro会根据添加的顺序进行拦截
        //Map<K,V>：K指的是拦截的URL，V指的是该URL是否拦截
        Map<String,String> filterChainMap = new LinkedHashMap<>(16);

        filterChainMap.put("/static/**","anon");
        filterChainMap.put("/logout","logout");
        filterChainMap.put("/login","anon");
        filterChainMap.put("/to_login","anon");
        filterChainMap.put("/**","authc");

        //设置拦截请求后跳转的URL
        filterFactoryBean.setLoginUrl("/index.html");
        filterFactoryBean.setFilterChainDefinitionMap(filterChainMap);
        return  filterFactoryBean;
    }
}

```

   - 4.在ShiroConfig配置类中创建SecurityManager安全管理器。

```java
@Bean
    public SecurityManager securityManager(){
        DefaultSecurityManager securityManager = new DefaultWebSecurityManager();
        return securityManager;
    }
```

   - 5.创建自定义Realm：CustomRealm

```java
public class CustomRealm extends AuthorizingRealm {
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principalCollection) {
        return null;
    }

    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        return null;
    }
}
```

   - 6.重写AuthorizingRealm中的认证方法doGetAuthenticationInfo

```java
package com.sc.shiro;

import com.sc.entity.User;
import com.sc.service.UserService;
import org.apache.shiro.authc.*;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.springframework.beans.factory.annotation.Autowired;

public class CustomRealm extends AuthorizingRealm {

    @Autowired
    private UserService userService;

    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principal) {
       return null;
    }

    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        //获取输入的账号
        String userName = (String) token.getPrincipal();
        //通过username从数据库中查到user实体
        User user = userService.getUserByUserName(userName);
        if (user==null){
            throw new UnknownAccountException();
        }
        //通过SimpleAuthenticationInfo做身份处理
        SimpleAuthenticationInfo simpleAuthenticationInfo = new SimpleAuthenticationInfo(user, user.getPassword(), getName());
        //返回身份处理对象
        return simpleAuthenticationInfo;
    }
}
```

   - 7.将自定义Realm注入到SecurityManager中。注意：**注入的时候只能使用下面所示的方法，不能直接new CustomRealm，否则自定义Realm中的@AutoWired注解无法生效，也就是不能引入Service中的方法来进行查找user实体**

```java
@Bean
    public SecurityManager securityManager(){
        DefaultSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setRealm(customRealm());
        return securityManager;
    }
    @Bean
    public CustomRealm customRealm(){
        return new CustomRealm();
    }
```

   - 8.Shiro配置类的过滤器中启用安全管理器SecurityManager,即filterFactoryBean中配置SecurityManager

```java
filterFactoryBean.setSecurityManager(securityManager());
```

   - 9.创建LoginController，并实现登陆功能

```java
@RequestMapping("/login")
    public String Login(String userName,String password,Map map){
        UsernamePasswordToken token = new UsernamePasswordToken(userName, password);
        Subject currentUser = SecurityUtils.getSubject();
        try {
            //主体提交登录请求到SecurityManager
            currentUser.login(token);
        }catch (IncorrectCredentialsException ice){
            map.put("msg","密码不正确");
        }catch (UnknownAccountException uae){
            map.put("msg","账号不存在");
        }catch (AuthenticationException ae){
            map.put("msg","状态异常");
        }
        if (currentUser.isAuthenticated()){
            map.put("userName",userName);
            return "success";
        }else {
            token.clear();
            return "login";
        }
    }
```

   - 10.项目目录：
   - ![img](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/%E6%89%B9%E6%B3%A8%202019-10-28%20144102.png)
   - 11.**注意！！**：这里省略了利用前端页面输入的username查找数据库中的user实体的方法，也就是Mapper层和Service层，这两个是SSM的基础，感觉不需要讲解；也木有前端模板，因为就一个form表单提交，没必要单独写出来。
   - 12.最后实现的效果：成功登陆则跳转到success.html；验证未通过则显示密码错误或用户不存在；如果后台抛出AuthenticationException，则提示状态异常，这时候后台一般都是显示500错误

#### 5.一些遇到的错误信息总结

- 这里记录一些我遇到的错误信息，提供一些参考
- 1.**shiro配置异常-org.springframework.beans.factory.BeanInitializationException: The security manager does not implement the WebSecurityManager interface.**
   - ![error1](https://github.com/Jokerboozp/Jokerboozp.github.io/raw/master/img/1709597-20190706113831052-317869678.png)
   - 错误原因：securitymanager应该使用的是DefaultWebSecurityManager。很容易就写成了DefaultSecurityManager
   - 代码：

```java
@Bean
    public SecurityManager securityManager(){
        DefaultSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setRealm(customRealm());
        return securityManager;
    }
```

- 2.**MYSQL:WARN: Establishing SSL connection without server's identity verification is not recommended.**
   - 错误原因：在MYSQL5.5.45+, 5.6.26+ 和 5.7.6+版本中才有这个问题，提示警告不建议使用没有带服务器身份验证的SSL连接
   - 解决办法：在application.yml中配置数据库连接的时候在后面加上useSSL=false

- 3.**Spring Boot：Consider defining a bean of type '*.*.*' *in your configuration**
   - 解决链接：https://www.cnblogs.com/JealousGirl/p/bean.html

- 4.@AutoWired注解无法生效
   - 生成原因以及解决方法已在上面说过，这里不再说明