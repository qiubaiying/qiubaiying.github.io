---
layout:     post 
title:      Springboot
subtitle:   Thymeleaf模板中在当前html中引入另一个html页面
date:       2019-11-26
author:     张鹏
header-img: img/home-bg.jpg
catalog: true   
tags:                         
    - Springboot
    - Thymeleaf
---

#### 在一个Html页面中引入另一个Html页面，通常来说会利用iFrame框架来进行构建，但是iFrame框架不够灵活而且样式很老旧，而且Thymeleaf对iFrame的支持程度也不高，所以来使用Thymeleaf自带的include方式来引入页面
----------------------------
#### 先说一下这样做的原因，在构建上一个项目的时候，在每次更改导航栏或者侧边栏的时候，都要同步更改剩余20多个html页面的导航栏或者侧边栏，相当令人头疼。而且在不小心改错的时候，一个一个找也非常令人头疼。所以就需要创建一个header.html，在其他页面直接引入，需要更改的时候直接更改header.html即可。

----------------------------

#### 首先效果图如下

![](https://vi0.xiu123.cn/live/2019/11/26/20/1003v1574771902221343467.jpg)
![](https://vi0.xiu123.cn/live/2019/11/26/20/1003v1574771863963824631.jpg)

#### 实现步骤

- 1.创建头部文件header.html
   - 创建一个公共的头部文件，不需要引入CSS,JS等，在需要引入头部文件的页面导入CSS等即可

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<!-- navbar-->
<header class="header" th:fragment="adminheader">
    <nav class="navbar navbar-expand-lg px-4 py-2 bg-white shadow">
        <a href="#" class="sidebar-toggler text-gray-500 mr-4 mr-lg-5 lead">
            <i class="fas fa-align-left"></i>
        </a>
        <a href="index.html" class="navbar-brand font-weight-bold text-uppercase text-base">
            小鹏租车后台管理系统—By Jokerboozp
        </a>
        <ul class="ml-auto d-flex align-items-center list-unstyled mb-0">
            <li class="nav-item dropdown mr-3"><a id="notifications" href="http://example.com" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="nav-link dropdown-toggle text-gray-400 px-1"><i class="fa fa-bell"></i><span class="notification-icon"></span></a>
                <div aria-labelledby="notifications" class="dropdown-menu"><a href="#" class="dropdown-item">
                    <div class="d-flex align-items-center">
                        <div class="icon icon-sm bg-violet text-white"><i class="fab fa-twitter"></i></div>
                        <div class="text ml-2">
                            <p class="mb-0">You have 2 followers</p>
                        </div>
                    </div></a><a href="#" class="dropdown-item">
                    <div class="d-flex align-items-center">
                        <div class="icon icon-sm bg-green text-white"><i class="fas fa-envelope"></i></div>
                        <div class="text ml-2">
                            <p class="mb-0">You have 6 new messages</p>
                        </div>
                    </div></a><a href="#" class="dropdown-item">
                    <div class="d-flex align-items-center">
                        <div class="icon icon-sm bg-blue text-white"><i class="fas fa-upload"></i></div>
                        <div class="text ml-2">
                            <p class="mb-0">Server rebooted</p>
                        </div>
                    </div></a><a href="#" class="dropdown-item">
                    <div class="d-flex align-items-center">
                        <div class="icon icon-sm bg-violet text-white"><i class="fab fa-twitter"></i></div>
                        <div class="text ml-2">
                            <p class="mb-0">You have 2 followers</p>
                        </div>
                    </div></a>
                    <div class="dropdown-divider"></div><a href="#" class="dropdown-item text-center"><small class="font-weight-bold headings-font-family text-uppercase">View all notifications</small></a>
                </div>
            </li>
            <li class="nav-item dropdown ml-auto">
                <a id="userInfo" href="http://example.com" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="nav-link dropdown-toggle">
                    <img th:src="@{/statics/adminback/img/avatar-6.jpg}" alt="Jason Doe" style="max-width: 2.5rem;" class="img-fluid rounded-circle shadow">
                </a>
                <div aria-labelledby="userInfo" class="dropdown-menu">
                    <a href="#" class="dropdown-item">
                        <strong class="d-block text-uppercase headings-font-family">Mark Stephen</strong>
                        <small>管理员</small>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item">个人信息设置</a>
                    <div class="dropdown-divider"></div>
                    <a th:href="@{/logout}" class="dropdown-item">退出登录</a>
                </div>
            </li>
        </ul>
    </nav>
</header>
</html>
```

- 2.在需要引入的页面引入header.html

```html
<div th:include="header :: adminheader"></div>

//这里的“include=head” 其中head为你引用的页面的名字**
//“::” 这个符号前后要有空格才可以
```

#### 注意：引入页面存在include和replace两种方式

- th:include：引入子模块的children，依然保留父模块的tag。
   - 加载模板的内容： 读取加载节点的内容（不含节点名称），替换div内容。
- th:replace：引入子模块的所有，不保留父模块的tag。
   - 替换当前标签为模板中的标签，加载的节点会整个替换掉加载他的div。

#### Stay Hungry.Stay Foolish.