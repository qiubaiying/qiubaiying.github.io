---
layout:     post                        # 使用的布局（不需要改）
title:      在切面类中获取request，response              # 标题
subtitle:   HttpServletRequest/HttpServletResponse
date:       2019-12-16                # 时间
author:     AhogeK                      # 作者
header-img: img/post-bg-coffee.jpeg     # 这篇文章标题背景图片
catalog: true                           # 是否归档
tags:                                   # 标签
    - 学习笔记
    - AOP
---
### 在AOP切面类中获取请求响应对象

```java
// 获取 request
HttpServletRequest request = ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder.getRequestAttributes())).getRequest();
// 获取 response
HttpServletResponse response = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getResponse();
```