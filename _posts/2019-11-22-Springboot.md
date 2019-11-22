---
layout:     post 
title:      Springboot
subtitle:   Spring boot在线租车项目
date:       2019-11-22
author:     张鹏
header-img: img/home-bg.jpg
catalog: true   
tags:                         
    - Springboot
---

- ***因为已经利用SpringBoot构建了一个简单的网上商城项目，所以接下来就是完善相关细节，然后实现另一个项目的过程***

- 这是一篇Springboot的中高级讲解博文，有些基础知识不再涉及，和SSM、Springboot、Shiro、Redis有关的基础知识不再举例和讲解。
- 网上的教程有许多，但是基本每一个都会出现这样那样的错误，所以这里做一个自己的步骤来供学习的人参考。
- 因为是在项目已经构建完毕之后才进行文档的编写，所以可能有些改动后会影响项目运行的地方会省去，当出现问题后可使用Bing或者Google进行搜索解决。

#### 本篇博客较长，所以在头部先声明一下会讲到的内容
1. Springboot项目中Shiro的详细的权限认证
2. Springboot引入前端的shiro标签
3. Springboot项目中Shiro基于yml来动态配置权限
4. Springboot项目中使用shiro-redis缓存
5. Springboot项目中使用Shiro实现RememberMe（记住我）功能
6. Springboot项目中使用Shiro来集成Kaptcha验证码
7. 项目构建过程中遇到的错误

#### 首先把使用的工具的版本信息列出

- 1.Idea 2018.3
- 2.JDK 1.8
- 3.Maven 3.6.0
- 4.redis-64.3.0.503
- 6.MySql 5.7

#### 最终项目目录
![](https://cdn.u1.huluxia.com/g3/M00/51/8B/wKgBOV3XcFuAG6RnAANng6slxmI869.png)

#### 最终结果展示
![](https://cdn.u1.huluxia.com/g3/M00/51/C2/wKgBOV3Xj6iAGsCIAAH8etVgxOc596.png)

#### 1.Springboot项目中利用Shiro实现详细的权限认证

- 实现这个功能的原因：在完成网上商城项目的时候，需要根据每个用户的权限不同来设计不同的后台界面，而且需要把每个用户的角色ID在每一层传一遍，相当的麻烦，又因为Thymeleaf的语法要求比较奇葩，直接导致每一个a标签的链接超乎想象的长。如下

```html
<a th:href="@{/updateToastAsRead/{roleid}/{userid}/{toastid}(roleid=${roleid},userid=${userid},toastid=${toast.toastid})}">
```

- 所以在这个项目里面我决定只设计一套后台，当用户点击没有权限打开的链接的时候，直接跳转到403无权限网页，提示用户没有权限，虽然对于后台来说并不美观，但是可以减少一大部分工作量，而且在实习过程中我发现基本所有的后台也是这么设计的，只不过他们设计的是网页弹窗。

- **实现步骤**

- 1.创建User(用户)、Role(角色)、Permission(权限)三个表，三个表相互关联，这里不再演示
- 2.spring boot简单的集成Shiro。这里不再介绍，有需求请去查看上一篇文档
- 3.对CustomRealm中的授权方法`doGetAuthorizationInfo`进行重写

```java
@Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principal) {
        User user = (User) principal.getPrimaryPrincipal();
        //通过SimpleAuthorizationInfo做授权
        SimpleAuthorizationInfo simpleAuthorizationInfo = new SimpleAuthorizationInfo();
        //获取角色ID
        int roleId = user.getRoleId();
        //根据角色ID查询到角色信息
        Role role = roleService.getRoleById(roleId);
        //设置角色
        simpleAuthorizationInfo.addRole(role.getRoleName());
        //根据角色ID查询到该角色具有的权限列表
        List<String> permissionList = permissionService.getPermissionByRoleId(roleId);
        if (permissionList==null){
            return null;
        }
        //设置权限列表
        simpleAuthorizationInfo.addStringPermissions(permissionList);
        return simpleAuthorizationInfo;
    }
```
- 上面主要通过SimpleAuthorizationInfo中的addRole和addStringPermissions添加当前用户拥有的角色和权限，与主体的授权信息进行比对。
- 4.详细的权限配置分为注解式和编程式，这里我们采用注解式进行下面的编写。
- 5.首先开启AOP注解，在ShiroConfig类中新增如下方法

```java
//开启AOP注解
    @Bean
    public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(SecurityManager securityManager){
        AuthorizationAttributeSourceAdvisor attributeSourceAdvisor = new AuthorizationAttributeSourceAdvisor();
        //设置安全管理器
        attributeSourceAdvisor.setSecurityManager(securityManager);
        return attributeSourceAdvisor;
    }

    @Bean
    @ConditionalOnMissingBean
    public DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator() {
        DefaultAdvisorAutoProxyCreator defaultAAP = new DefaultAdvisorAutoProxyCreator();
        defaultAAP.setProxyTargetClass(true);
        return defaultAAP;
    }
```

- 6.对于为授权的用户，需要进行友好的提示，所以在ShiroConfig中新增如下方法设置未授权用户跳转到的地址。（需要自己新建403.html）

```java
@Bean
    public SimpleMappingExceptionResolver simpleMappingExceptionResolver() {
        SimpleMappingExceptionResolver resolver = new SimpleMappingExceptionResolver();
        Properties properties = new Properties();
        /*未授权处理页*/
        properties.setProperty("UnauthorizedException", "403.html");
        resolver.setExceptionMappings(properties);
        return resolver;
    }
```

- 7.然后在Controller使用注解@RequiresRoles("xxx")和@RequiresPermissions("xxx")进行角色和权限的校检。（本处直接用网上的示例代码展示，因为已经采用了基于yml的动态配置权限，不再需要在后台配置无法更改的权限controller。）

```java
 @GetMapping("/sing")
    @RequiresRoles("cat")
    public String sing(){
        return "sing";
    }
    @GetMapping("/jump")
    @RequiresPermissions("jump")
    public String jump(){
        return "jump";
    }
```

#### 2.Springboot引入前端的shiro标签

- 通常前端页面展示需要与用户的权限对等，即只给用户看到他们权限内的内容。
通常解决方式有两种：
其一：登录后通过读取数据库中角色和权限，获取需要展示的菜单内容，动态的在前端渲染；
其二：所有内容都在前端写好，通过前端的shiro标签控制对应权限内容部分的渲染

- 这里用第二种方式演示

```html
Shiro标签说明：
guest标签：`<shiro:guest></shiro:guest>`，用户没有身份验证时显示相应信息，即游客访问信息。
user标签：`<shiro:user></shiro:user>`，用户已经身份验证/记住我登录后显示相应的信息。
authenticated标签:`<shiro:authenticated></shiro:authenticated>`，用户已经身份验证通过，即Subject.login登录成功，不是记住我登录的。
notAuthenticated标签:`<shiro:notAuthenticated></shiro:notAuthenticated>`，用户已经身份验证通过，即没有调用Subject.login进行登录，包括记住我自动登录的也属于未进行身份验证。
principal标签:`<shiro: principal/><shiro:principal property="username"/>`，相当`((User)Subject.getPrincipals()).getUsername()`。
lacksPermission标签：`<shiro:lacksPermission name="org:create"></shiro:lacksPermission>`，如果当前Subject没有权限将显示body体内容。
hasRole标签：`<shiro:hasRole name="admin"></shiro:hasRole>`，如果当前Subject有角色将显示body体内容。
hasAnyRoles标签：`<shiro:hasAnyRoles name="admin,user"></shiro:hasAnyRoles>`，如果当前Subject有任意一个角色（或的关系）将显示body体内容。
lacksRole标签：`<shiro:lacksRole name="abc"></shiro:lacksRole>`，如果当前Subject没有角色将显示body体内容。
hasPermission标签：`<shiro:hasPermission name="user:create"></shiro:hasPermission>`，如果当前Subject有权限将显示body体内容
```

- **步骤**
- 1.添加pom依赖

```xml
<dependency>
            <groupId>com.github.theborakompanioni</groupId>
            <artifactId>thymeleaf-extras-shiro</artifactId>
            <version>2.0.0</version>
        </dependency>
```

- 2.ShiroConfig中添加配置

```java
 @Bean
    public ShiroDialect shiroDialect() {
        return new ShiroDialect();
    }
```

- 3.前端页面使用shiro标签

```html
<shiro:hasRole name="dog"><a href="/dog">Dog</a></shiro:hasRole>
<shiro:hasRole name="cat"><a href="/cat">Cat</a></shiro:hasRole>
<hr>
<shiro:hasPermission name="sing"><a href="/sing">Sing</a></shiro:hasPermission>
<shiro:hasPermission name="jump"><a href="/jump">Jump</a></shiro:hasPermission>
<shiro:hasPermission name="rap"><a href="/rap">Rap</a></shiro:hasPermission>
<shiro:hasPermission name="basketball"><a href="/basketball">Basketball</a></shiro:hasPermission>


注意：使用前现在html标签内引入shiro标签，即<html lang="en" xmlns:th="http://www.thymeleaf.org" xmlns:shiro="http://www.pollix.at/thymeleaf/shiro">

```

- 这种方式用一种问题就是必须在后台绑定当前用户的角色，不是很灵活，所以直接采用yml动态配置权限更加方便。

#### 3.Springboot项目中Shiro基于yml来动态配置权限

- 编程式和注解式进行授权在使用的时候都必须是写死在后台的，如果后期需要更改权限，就必须要进行后台代码的修改。这时候动态配置权限就很有必要了，我们通过读取数据库或者权限的配置文件将权限注入，如果需要修改，我们只需要修改数据库或者修改相关的配置文件即可。
- **步骤**
- 1.在application.yml文件中添加需要用到的权限

```xml
permission-config:
  perms:
    - url: /cat
      permission: roles[admin]
    - url: /dog
      permission: roles[customer]
    - url: /sing
      permission: perms[3]
    - url: /jump
      permission: perms[4]
    - url: /rap
      permission: perms[5]
    - url: /basketball
      permission: perms[6]
```

- 2.将配置信息的内容转化为`List<Map<String,String>>`注入到ShiroConfig中。新建PermsMap类

```java
package com.sc.config;


import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "permission-config")
public class PermsMap {

    public List<Map<String,String>> perms;

    public List<Map<String,String>> getPerms(){
        return perms;
    }

    public void setPerms(List<Map<String,String>> perms){
        this.perms=perms;
    }
}
```

- 3.修改ShiroConfig：先使用@Autowired注入PermsMap，然后更改过滤链

```java
@Autowired
    PermsMap permsMap;
    
/*配置Shiro的web过滤器，拦截浏览器请求并交给SecurityManager处理**/
    @Bean
    public ShiroFilterFactoryBean webFilter(){
        ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();
        shiroFilterFactoryBean.setSecurityManager(securityManager());
        Map<String, String> filterChainMap  = new LinkedHashMap<>(16);
        filterChainMap.put("/login","anon");
        filterChainMap.put("/to_login","anon");
        filterChainMap.put("/getCode","anon");
        filterChainMap.put("/logout","logout");
        filterChainMap.put("/login/**","anon");
        filterChainMap.put("/img/**","anon");
        filterChainMap.put("/statics/**","anon");
        shiroFilterFactoryBean.setUnauthorizedUrl("/403");

        //动态权限注入
        List<Map<String, String>> perms = permsMap.getPerms();
        perms.forEach(perm->filterChainMap.put(perm.get("url"),perm.get("permission")));
        filterChainMap.put("/","user");

        shiroFilterFactoryBean.setLoginUrl("/login");
        shiroFilterFactoryBean.setFilterChainDefinitionMap(filterChainMap);
        return shiroFilterFactoryBean;
    }
```

- 更改AuthorizationController

```java
package com.sc.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthorizationController {

    @GetMapping("/cat")
    public String cat(){
        return "cat";
    }
    @GetMapping("/dog")
    public String dog(){
        return "dog";
    }
    @GetMapping("/sing")
    public String sing(){
        return "sing";
    }
    @GetMapping("/jump")
    public String jump(){
        return "jump";
    }
    @GetMapping("/rap")
    public String rap(){
        return "rap";
    }
    @GetMapping("/basketball")
    public String basketball(){
        return "basketball";
    }
    @GetMapping("/403")
    public String page_403(){
        return "403";
    }
}
```

#### 4.Springboot项目中使用shiro-redis缓存

- 已经配置过详细的权限配置的情况下，如果我们想要验证用户是否有权限访问某一个链接，我们需要在后台直接查询数据库，才能确认当前用户是否有权限，这样会大大增加数据库的压力。这时候就需要使用Shiro-Redis缓存。
- **步骤**
- 1.安装Redis（步骤请网上搜索，下载解压即可正常使用）
- 2.引入shiro-redis依赖(暂时只知道在Spring2.2.1的版本下只能够使用3.2.3版本的shiro-redis依赖，3.1.0以下的版本不建议使用，否则会报异常，在下面会介绍异常种类。在任何spring版本下都建议使用3.2.3版本)

```xml
<dependency>
            <groupId>org.crazycake</groupId>
            <artifactId>shiro-redis</artifactId>
            <version>3.2.3</version>
        </dependency>
```

- 3.在application.yml中配置redis的相关参数（参数的具体含义请参考redis官方文档）

```xml
redis:
    host: localhost
    port: 6379
    jedis:
      pool:
        max-idle: 8
        min-idle: 0
        max-active: 8
        max-wait: -1
    timeout: 0
```

- 3.可以在ShiroConfig中添加redis相应的配置或者新建一个RedisConfig

```java
/*
   redisManager
    */
    @Bean
    public RedisManager redisManager(){
        RedisManager redisManager = new RedisManager();
        redisManager.setHost(host + ":" + port);
        redisManager.setTimeout(timeout);
        redisManager.setDatabase(database);
        return redisManager;
    }

    /*
    CacheManager
     */
    public RedisCacheManager redisCacheManager(){
        RedisCacheManager redisCacheManager = new RedisCacheManager();
        redisCacheManager.setRedisManager(redisManager());
        redisCacheManager.setPrincipalIdFieldName("userId");
        return redisCacheManager;
    }

    /*
    redisSessionDao
     */
    @Bean
    public RedisSessionDAO redisSessionDAO(){
        RedisSessionDAO redisSessionDAO = new RedisSessionDAO();
        redisSessionDAO.setRedisManager(redisManager());
        return redisSessionDAO;
    }

    /*
    sessionManager
     */
    @Bean
    public DefaultWebSessionManager sessionManager(){
        DefaultWebSessionManager sessionManager = new DefaultWebSessionManager();
        sessionManager.setSessionDAO(redisSessionDAO());
        return sessionManager;
    }
```

- 4.将session管理器和cache管理器注入到SecurityManager中

```java
 @Bean(name = "securityManager")
    public SecurityManager securityManager(){
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setRealm(customRealm());
        securityManager.setSessionManager(sessionManager());
        securityManager.setCacheManager(redisCacheManager());
        return securityManager;
    }
```

- 5.启动Redis，然后启动项目，如果有RedisDesktopManager的话，也可以打开RDM。运行项目并登录后，进行权限操作，会在RDM中看到数据被写入到Redis缓存中。并且不会调用后台方法进行验证。
![](https://cdn.u1.huluxia.com/g3/M03/51/BD/wKgBOV3XjHeAIGurAALQ5eKQs8g099.png)

#### 5.Springboot项目中使用Shiro实现RememberMe（记住我）功能

- 在实现用户登录后，关闭浏览器，再次打开浏览器无需重新登录的功能RememberMe。
- **步骤**
- 1.ShiroConfig.java中添加rememberMeManager的配置

```java
/*
    cokkie对象
     */
    @Bean
    public SimpleCookie rememberMeCookie(){
        //这个参数是cookie的名称，对应前端的checkbox的name=remember
        SimpleCookie simpleCookie = new SimpleCookie("remember");
        //cookie生效时间，单位为秒
        simpleCookie.setMaxAge(600);
        return simpleCookie;
    }

    /*
    cookie管理对象，记住我功能
     */
    @Bean
    public CookieRememberMeManager rememberMeManager(){
        CookieRememberMeManager cookieRememberMeManager = new CookieRememberMeManager();
        cookieRememberMeManager.setCookie(rememberMeCookie());
        //cookieRememberMeManager.setCipherKey用来设置加密的Key,参数类型byte[],字节数组长度要求16
        cookieRememberMeManager.setCipherKey("jokerboozpspring".getBytes());
        return cookieRememberMeManager;
    }
```

- 2.注入到SecurityManager

```java
 @Bean(name = "securityManager")
    public SecurityManager securityManager(){
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setRealm(customRealm());
        securityManager.setSessionManager(sessionManager());
        securityManager.setCacheManager(redisCacheManager());
        securityManager.setRememberMeManager(rememberMeManager());
        return securityManager;
    }
```

- 3.修改登录界面（在登陆操作的form表单中加入checkbox）

```html
<input type="checkbox" name="rememberMe">记住我
```

- 4.修改LoginController

```java
 @GetMapping({"/","/success"})
    public String success(Model model){
        Subject currentUser = SecurityUtils.getSubject();
        User user = (User) currentUser.getPrincipal();
        model.addAttribute("username", user.getUsername());
        return "success";
    }

 @PostMapping("/login")
    public String login(String username, String password, boolean rememberMe, Model model){

        UsernamePasswordToken token = new UsernamePasswordToken(username,password);
        Subject currentUser = SecurityUtils.getSubject();

        try {
            //主体提交登录请求到SecurityManager
            token.setRememberMe(rememberMe);
            currentUser.login(token);
        }catch (IncorrectCredentialsException ice){
            model.addAttribute("msg","密码不正确");
        }catch(UnknownAccountException uae){
            model.addAttribute("msg","账号不存在");
        }catch(AuthenticationException ae){
            model.addAttribute("msg","状态不正常");
        }
        if(currentUser.isAuthenticated()){
            System.out.println("认证成功");
            model.addAttribute("currentUser",currentUser);
            return "/success";
        }else{
            token.clear();
            return "login";
        }
    }
```

#### 6.Springboot项目中使用Shiro来集成Kaptcha验证码

- 通过引入Kaptcha来实现图片验证码功能
- **步骤**
- 1.引入pom依赖

```xml
<dependency>
            <groupId>com.github.penggle</groupId>
            <artifactId>kaptcha</artifactId>
            <version>2.3.2</version>
        </dependency>
```

- 2.创建KaptchaConfig.java配置类

```java
package com.sc.config;

import com.google.code.kaptcha.impl.DefaultKaptcha;
import com.google.code.kaptcha.util.Config;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.Properties;

@Component
public class KaptchaConfig {

    private final static String CODE_LENGTH="4";
    private final static String SESSION_KEY = "verification_session_key";

    @Bean
    public DefaultKaptcha defaultKaptcha() {
        DefaultKaptcha defaultKaptcha = new DefaultKaptcha();
        Properties properties = new Properties();
        // 设置边框
        properties.setProperty("kaptcha.border", "no");
        // 设置边框颜色
        properties.setProperty("kaptcha.border.color", "105,179,90");
        // 设置字体颜色
        properties.setProperty("kaptcha.textproducer.font.color", "blue");
        // 设置图片宽度
        properties.setProperty("kaptcha.image.width", "173");
        // 设置图片高度
        properties.setProperty("kaptcha.image.height", "40");
        // 设置字体尺寸
        properties.setProperty("kaptcha.textproducer.font.size", "32");
        // 设置图片样式
        properties.setProperty("kaptcha.obscurificator.impl","com.google.code.kaptcha.impl.ShadowGimpy");
        // 设置session key
        properties.setProperty("kaptcha.session.key", SESSION_KEY);
        // 设置验证码长度
        properties.setProperty("kaptcha.textproducer.char.length", CODE_LENGTH);
        // 设置字体
        properties.setProperty("kaptcha.textproducer.font.names", "宋体,楷体,黑体");
        Config config = new Config(properties);
        defaultKaptcha.setConfig(config);
        return defaultKaptcha;
    }
}
```

- 3.LoginController添加获取验证码的方法(直接附上完整的controller代码，不想再找了)

```java
package com.sc.controller;

import com.google.code.kaptcha.impl.DefaultKaptcha;
import com.sc.entity.User;
import com.sc.service.UserService;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Controller
public class LoginController {

    /**
     * session中的验证码
     */
    private String SHIRO_VERIFY_SESSION = "verifySessionCode";
    /**
     * 错误后的跳转地址
     */
    private String ERROR_CODE_URL = "login";
    /**
     * 成功后的跳转地址
     */
    private String SUCCESS_CODE_URL = "/success";
    /**
     * 验证失败提示
     */
    private String ERROR_PASSWORD = "密码不正确";
    private String ERROR_ACCOUNT = "账户不存在";
    private String ERROR_STATUS = "状态不正常";
    private String ERROR_KAPTCHA = "验证码不正确";

    @Autowired
    private DefaultKaptcha defaultKaptcha;


    @Autowired
    private UserService userService;

    @GetMapping({"/","/success"})
    public String success(Model model){
        Subject currentUser = SecurityUtils.getSubject();
        User user = (User) currentUser.getPrincipal();
        model.addAttribute("userName",user.getUserName());
        return "success";
    }

    @GetMapping("/login")
    public String login() {
        return ERROR_CODE_URL;
    }

    @RequestMapping("/to_login")
    public String toLogin(){
        return "login";
    }

    @RequestMapping("/login")
    public String login(String userName,String verifyCode, String password,boolean rememberMe, Model model){

        UsernamePasswordToken token = new UsernamePasswordToken(userName,password,rememberMe);
        Subject currentUser = SecurityUtils.getSubject();

        //获取session中的验证码
        String verCode = (String) currentUser.getSession().getAttribute(SHIRO_VERIFY_SESSION);
        if("".equals(verifyCode)||(!verCode.equals(verifyCode))){
            model.addAttribute("msg",ERROR_KAPTCHA);
            return ERROR_CODE_URL;
        }
        try {
            token.setRememberMe(rememberMe);
            //主体提交登录请求到SecurityManager
            currentUser.login(token);
        }catch (IncorrectCredentialsException ice){
            model.addAttribute("msg",ERROR_PASSWORD);
        }catch(UnknownAccountException uae){
            model.addAttribute("msg",ERROR_ACCOUNT);
        }catch(AuthenticationException ae){
            model.addAttribute("msg",ERROR_STATUS);
        }
        if(currentUser.isAuthenticated()){
            model.addAttribute("userName",userName);
            return SUCCESS_CODE_URL;
        }else{
            token.clear();
            return ERROR_CODE_URL;
        }
    }

    /*
    获取验证码
     */
    @GetMapping("/getCode")
    public void getGifCode(HttpServletResponse response, HttpServletRequest request) throws IOException {
        byte[] verByte = null;
        ByteArrayOutputStream jpegOutputStream = new ByteArrayOutputStream();
        try {
            //生产验证码字符串并保存到session中
            String createText = defaultKaptcha.createText();
            request.getSession().setAttribute(SHIRO_VERIFY_SESSION,createText);
            //使用生产的验证码字符串返回一个BufferedImage对象并转为byte写入到byte数组中
            BufferedImage challenge = defaultKaptcha.createImage(createText);
            ImageIO.write(challenge,"jpg",jpegOutputStream);
        } catch (IllegalArgumentException e){
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        } catch (IOException e){
            e.printStackTrace();
        }
        //定义response输出类型为image/jpeg类型，使用response输出流输出图片的byte数组
        verByte = jpegOutputStream.toByteArray();
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        response.setContentType("image/jpeg");
        ServletOutputStream responseOutputStream = response.getOutputStream();
        responseOutputStream.write(verByte);
        responseOutputStream.flush();
        responseOutputStream.close();
    }

}
```

- 4.更改login.html

```html
<input type="text" name="verifyCode" placeholder="请输入验证码" class="form-control border-0 shadow form-control-lg text-violet"><br>
                        <a href="#" style="text-decoration: none;color: black;" onclick="refreshCode()">换一个</a>
                        <img id="verifyCode" th:src="@{/getCode}" style="margin-left: 16px"><br>


<script>
    function refreshCode() {
        document.getElementById("verifyCode").setAttribute("src","/getCode");
    }
</script>
```

- 5.在ShiroConfig中配置/getCode可以游客方式访问

```java
 filterChainMap.put("/getCode","anon");
```

- 6.修改登录方法（具体代码见上面LoginControlller代码）
- 最终效果（目前我项目的效果，但是大体框架一样，只是添加了样式）

![](https://cdn.u1.huluxia.com/g3/M00/51/C2/wKgBOV3Xj6iAGsCIAAH8etVgxOc596.png)

#### 7.项目构建过程中遇到的错误

- **用来展示自己在配置过程中遇到的错误信息，不包括全部，因为有的问题比较简单，就不再显示，有的单纯是我忘了。。。**
- 1.shiro无法进入授权的方法(这是困扰我最久的一个问题，卡在这里了两天。有两个原因导致这个错误)。报错信息如下：

```java
2019-11-21 13:12:18.743 ERROR 12736 --- [nio-8090-exec-2] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed; nested exception is org.thymeleaf.exceptions.TemplateInputException: An error happened during template parsing (template: "class path resource [templates/success.html]")] with root cause

org.crazycake.shiro.exception.PrincipalInstanceException: class com.sc.entity.User must has getter for field: authCacheKey or id
We need a field to identify this Cache Object in Redis. So you need to defined an id field which you can get unique id to identify this principal. For example, if you use UserInfo as Principal class, the id field maybe userId, userName, email, etc. For example, getUserId(), getUserName(), getEmail(), etc.
Default value is authCacheKey or id, that means your principal object has a method called "getAuthCacheKey()" or "getId()"
	at org.crazycake.shiro.RedisCache.getRedisKeyFromPrincipalIdField(RedisCache.java:150) ~[shiro-redis-3.1.0.jar:na]
	at org.crazycake.shiro.RedisCache.getStringRedisKey(RedisCache.java:126) ~[shiro-redis-3.1.0.jar:na]
	at org.crazycake.shiro.RedisCache.getRedisCacheKey(RedisCache.java:118) ~[shiro-redis-3.1.0.jar:na]
	at org.crazycake.shiro.RedisCache.get(RedisCache.java:68) ~[shiro-redis-3.1.0.jar:na]
	at org.apache.shiro.realm.AuthorizingRealm.getAuthorizationInfo(AuthorizingRealm.java:328) ~[shiro-core-1.3.2.jar:1.3.2]
	at org.apache.shiro.realm.AuthorizingRealm.hasRole(AuthorizingRealm.java:573) ~[shiro-core-1.3.2.jar:1.3.2]
	at org.apache.shiro.authz.ModularRealmAuthorizer.hasRole(ModularRealmAuthorizer.java:374) ~[shiro-core-1.3.2.jar:1.3.2]
	at org.apache.shiro.mgt.AuthorizingSecurityManager.hasRole(AuthorizingSecurityManager.java:153) ~[shiro-core-1.3.2.jar:1.3.2]
	at org.apache.shiro.subject.support.DelegatingSubject.hasRole(DelegatingSubject.java:224) ~[shiro-core-1.3.2.jar:1.3.2]
	at at.pollux.thymeleaf.shiro.processor.ShiroFacade.hasAllRoles(ShiroFacade.java:115) ~[thymeleaf-extras-shiro-2.0.0.jar:na]
	at at.pollux.thymeleaf.shiro.processor.element.HasRoleElementProcessor.doProcess(HasRoleElementProcessor.java:39) ~[thymeleaf-extras-shiro-2.0.0.jar:na]
	at org.thymeleaf.processor.element.AbstractElementTagProcessor.process(AbstractElementTagProcessor.java:95) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.util.ProcessorConfigurationUtils$ElementTagProcessorWrapper.process(ProcessorConfigurationUtils.java:633) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.engine.ProcessorTemplateHandler.handleOpenElement(ProcessorTemplateHandler.java:1314) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.engine.TemplateHandlerAdapterMarkupHandler.handleOpenElementEnd(TemplateHandlerAdapterMarkupHandler.java:304) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.templateparser.markup.InlinedOutputExpressionMarkupHandler$InlineMarkupAdapterPreProcessorHandler.handleOpenElementEnd(InlinedOutputExpressionMarkupHandler.java:278) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.standard.inline.OutputExpressionInlinePreProcessorHandler.handleOpenElementEnd(OutputExpressionInlinePreProcessorHandler.java:186) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.templateparser.markup.InlinedOutputExpressionMarkupHandler.handleOpenElementEnd(InlinedOutputExpressionMarkupHandler.java:124) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.attoparser.HtmlElement.handleOpenElementEnd(HtmlElement.java:109) ~[attoparser-2.0.5.RELEASE.jar:2.0.5.RELEASE]
	at org.attoparser.HtmlMarkupHandler.handleOpenElementEnd(HtmlMarkupHandler.java:297) ~[attoparser-2.0.5.RELEASE.jar:2.0.5.RELEASE]
	at org.attoparser.MarkupEventProcessorHandler.handleOpenElementEnd(MarkupEventProcessorHandler.java:402) ~[attoparser-2.0.5.RELEASE.jar:2.0.5.RELEASE]
	at org.attoparser.ParsingElementMarkupUtil.parseOpenElement(ParsingElementMarkupUtil.java:159) ~[attoparser-2.0.5.RELEASE.jar:2.0.5.RELEASE]
	at org.attoparser.MarkupParser.parseBuffer(MarkupParser.java:710) ~[attoparser-2.0.5.RELEASE.jar:2.0.5.RELEASE]
	at org.attoparser.MarkupParser.parseDocument(MarkupParser.java:301) ~[attoparser-2.0.5.RELEASE.jar:2.0.5.RELEASE]
	at org.attoparser.MarkupParser.parse(MarkupParser.java:257) ~[attoparser-2.0.5.RELEASE.jar:2.0.5.RELEASE]
	at org.thymeleaf.templateparser.markup.AbstractMarkupTemplateParser.parse(AbstractMarkupTemplateParser.java:230) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.templateparser.markup.AbstractMarkupTemplateParser.parseStandalone(AbstractMarkupTemplateParser.java:100) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.engine.TemplateManager.parseAndProcess(TemplateManager.java:666) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.TemplateEngine.process(TemplateEngine.java:1098) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.TemplateEngine.process(TemplateEngine.java:1072) ~[thymeleaf-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.spring5.view.ThymeleafView.renderFragment(ThymeleafView.java:362) ~[thymeleaf-spring5-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.thymeleaf.spring5.view.ThymeleafView.render(ThymeleafView.java:189) ~[thymeleaf-spring5-3.0.11.RELEASE.jar:3.0.11.RELEASE]
	at org.springframework.web.servlet.DispatcherServlet.render(DispatcherServlet.java:1373) ~[spring-webmvc-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.springframework.web.servlet.DispatcherServlet.processDispatchResult(DispatcherServlet.java:1118) ~[spring-webmvc-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1057) ~[spring-webmvc-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:943) ~[spring-webmvc-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1006) ~[spring-webmvc-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:909) ~[spring-webmvc-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:660) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:883) ~[spring-webmvc-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:741) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:231) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:53) ~[tomcat-embed-websocket-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.shiro.web.servlet.ProxiedFilterChain.doFilter(ProxiedFilterChain.java:61) ~[shiro-web-1.3.2.jar:1.3.2]
	at org.apache.shiro.web.servlet.AdviceFilter.executeChain(AdviceFilter.java:108) ~[shiro-web-1.3.2.jar:1.3.2]
	at org.apache.shiro.web.servlet.AdviceFilter.doFilterInternal(AdviceFilter.java:137) ~[shiro-web-1.3.2.jar:1.3.2]
	at org.apache.shiro.web.servlet.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:125) ~[shiro-web-1.3.2.jar:1.3.2]
	at org.apache.shiro.web.servlet.ProxiedFilterChain.doFilter(ProxiedFilterChain.java:66) ~[shiro-web-1.3.2.jar:1.3.2]
	at org.apache.shiro.web.servlet.AbstractShiroFilter.executeChain(AbstractShiroFilter.java:449) ~[shiro-web-1.3.2.jar:1.3.2]
	at org.apache.shiro.web.servlet.AbstractShiroFilter$1.call(AbstractShiroFilter.java:365) ~[shiro-web-1.3.2.jar:1.3.2]
	at org.apache.shiro.subject.support.SubjectCallable.doCall(SubjectCallable.java:90) ~[shiro-core-1.3.2.jar:1.3.2]
	at org.apache.shiro.subject.support.SubjectCallable.call(SubjectCallable.java:83) ~[shiro-core-1.3.2.jar:1.3.2]
	at org.apache.shiro.subject.support.DelegatingSubject.execute(DelegatingSubject.java:383) ~[shiro-core-1.3.2.jar:1.3.2]
	at org.apache.shiro.web.servlet.AbstractShiroFilter.doFilterInternal(AbstractShiroFilter.java:362) ~[shiro-web-1.3.2.jar:1.3.2]
	at org.apache.shiro.web.servlet.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:125) ~[shiro-web-1.3.2.jar:1.3.2]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:119) ~[spring-web-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:119) ~[spring-web-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:119) ~[spring-web-5.2.1.RELEASE.jar:5.2.1.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:202) ~[tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:96) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:526) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:139) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:92) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:343) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:408) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:66) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:861) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1579) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) [na:1.8.0_181]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) [na:1.8.0_181]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61) [tomcat-embed-core-9.0.27.jar:9.0.27]
	at java.lang.Thread.run(Thread.java:748) [na:1.8.0_181]

```

- **错误原因1**：
   - shiro-redis依赖的版本过低，一般都是3.1.0，因为网上的教程全都是3.1.0版本的，在现在的Springboot版本下会报这样的错误。
   - **解决方法**：
   - 将版本更换为3.2.3版本即可
- **错误原因2**：
   - 将版本更换完之后依旧无法解决错误，是因为信息认证的实体中需要id的getter信息，但是如果你使用了mybatis来连接数据库，而不是像网上一样直接在后台造数据，它并不能取到相应的id，所以要在redisCacheManager中设置取到的id

```java
/*
    CacheManager
     */
    public RedisCacheManager redisCacheManager(){
        RedisCacheManager redisCacheManager = new RedisCacheManager();
        redisCacheManager.setRedisManager(redisManager());
        redisCacheManager.setPrincipalIdFieldName("userId");
        return redisCacheManager;
    }
```

- 2.设置RedisManager时无法设置相应的redis数据库信息
   - **解决方法**
   - 没有在配置类之前引入yml配置文件中的相关信息，引入即可

```java
@Value("${spring.redis.host}")
    private String host;
    @Value("${spring.redis.port}")
    private int port;
    @Value("${spring.redis.password:}")
    private String password;
    @Value("${spring.redis.timeout}")
    private int timeout;
    @Value("${spring.redis.database:0}")
    private int database;
```

- 3.redis缓存没有加载进redis数据库
   - **解决方法**
   - 在启动类上加上注解@EnableCaching