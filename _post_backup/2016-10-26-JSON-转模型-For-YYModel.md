---
layout:     post
title:      JSON转模型 For YYModel
subtitle:   使用 YYModel库 快速完成 JSON 转模型
date:       2016-10-26
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - iOS
    - 开发技巧
---

>JSON转模型是我们做iOS开发的基础技能，本文将通过[YYModel](https://github.com/ibireme/YYModel)这个框架安全快速的完成JSON到模型的转换，其中还会介绍到一款好用的插件[ESJsonFormat](https://github.com/EnjoySR/ESJsonFormat-Xcode)。

# 1、首先创建模型类
创建模型类我们可以通过[ESJsonFormat](https://github.com/EnjoySR/ESJsonFormat-Xcode)这款插件快速完成。

使用方法：

将光标移动到代码行中 如下图的13行

然后点击`Window`->`ESJsonFormat`->`Input JSON Window`调出窗口


![](http://ww1.sinaimg.cn/large/006y8lVagw1f95tr49ed7j30no0csdir.jpg)

在窗口中输入你要解析的JSON文本，如下图：

![](http://ww4.sinaimg.cn/large/006y8lVagw1f97s13l4b9j30jv0e8dhp.jpg)

按`Enter`继续，然后神奇的一幕发生了

![](http://ww3.sinaimg.cn/large/006y8lVagw1f97s46k95tj30k30dydj9.jpg)

![](http://ww1.sinaimg.cn/large/006y8lVagw1f97s6yp9hmj30iw0b840m.jpg)

看到在.h中 所有的属性自动为你填上，而且帮你选好了类型

.m 也为你声明了`list`中成员的类型，不过这里需要稍作修改，因为我们需要用到YYModel进行解析，所以方法名改成`modelContainerPropertyGenericClass`

```
+ (NSDictionary *)modelContainerPropertyGenericClass {
    return @{@"list" : [List class]};
}

```

还有问题就是属性中出现关键字`id`，我们需要将id改为`teacherId`

然后在.m的`implementation`中声明,将字典的的`id`

```
+ (NSDictionary *)modelCustomPropertyMapper {
    return @{@"teacherId" : @"id"};
}
```

这样，模型的创建就完成了，剩下的就是用YYModel进行解析了

# 2、使用YYModel进行解析

解析很简单，就只需要一句话

```
// 将 JSON (NSData,NSString,NSDictionary) 转换为 Model:
Model *model = [Model yy_modelWithJSON:json];

// 或者
Model *model = [[Model alloc] init];
[model yy_modelSetWithDictionary:json];

```

到此，简便快速的完成了JSON到模型的转换。


最后，[这里附上一篇YYModel的使用](http://www.jianshu.com/p/25e678fa43d3)