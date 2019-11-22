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
2. Springboot项目中Shiro基于yml来动态配置权限
3. Springboot项目中使用shiro-redis缓存
4. Springboot项目中使用Shiro实现RememberMe（记住我）功能
5. Springboot项目中使用Shiro来集成Kaptcha验证码
6. Springboot项目中使用项目自带的测试类进行测试
7. 项目构建过程中遇到的错误

#### 首先把使用的工具的版本信息列出

- 1.Idea 2018.3
- 2.JDK 1.8
- 3.Maven 3.6.0
- 4.redis-64.3.0.503
- 6.MySql 5.7

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

- 7.然后在Controller使用注解@RequiresRoles("xxx")和@RequiresPermissions("xxx")进行角色和权限的校检。（本处省略代码，因为已经采用了基于yml的动态配置权限，不再需要在后台配置无法更改的权限controller）

