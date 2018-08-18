---
layout:       post
title:        "google Thumbnails使用简介"
subtitle:     "一个极方便创建略缩图的工具包"
date:         2018-08-17 17:42:05
author:       "Hyuga"
header-img:   "img/2018-08-17/head-top-1.jpg"
header-mask:  0.3
catalog:      true
multilingual: false
tags:
    - hyuga
---

# 前言
平时对图片处理得很少，最近刚好需要对博客插图进行压缩、缩放等处理，所以把以前用到的google开源项目thumbnails找出来回顾下，顺带整理出来。

# 官方介绍
    提供了一个连贯接口创建缩略图

# maven依赖
```
<dependency>
    <groupId>net.coobird</groupId>
    <artifactId>thumbnailator</artifactId>
    <version>0.4.8</version>
</dependency>
```

## DEMO
读取目录下的所有文件，将其大小调整为最大200像素乘200像素，同时保留原始的宽高比，然后保存生成的缩略图
```
Thumbnails.of(directory.listFiles())
    .size(200, 200)
    .outputFormat("jpeg")
    .asFiles(Rename.PREFIX_DOT_THUMBNAIL);
```


# 例子

![](/img/2018-08-17/471FB23F-E3FE-4B10-9DAB-8F012E18046E.png)

**加载图片支持：**
* URL数组
* File数组
* String文件全路径数组
* BufferedImage数组
* InputStream数组

# 比例缩放图片，非裁剪
```
Thumbnails.of(image)
    .scale(0.5)
    .toFile(thumbnail);

scale(double)：缩略图的缩放系数[0-1]
图像缩小50% = scale(0.5)

该方法不能与下面几种方法共同使用，否则将抛异常:IllegalStateException
size（int，int)、scale(double, double)、keepAspectRatio（boolean）
调用此方法后，调用{@link #）} *方法或{@link #scale（double，double）

```

# 图片质量压缩，质量越低代表图片越模糊和size变小
```
Thumbnails.of(image)
    .outputQuality(0.5)
    .toFile(thumbnail);

outputQuality(double)：图片质量0.0f-1.0f
```

# 剪裁功能
![](/img/2018-08-17/6C887AFE-1B0F-4F6E-BE8A-FB79DAAB2EED.png)
Thumbnails支持多方裁剪定义
```
Thumbnails.of(image)
    .sourceRegion(Positions.CENTER, 200, 200)
    .toFile(thumbnail);

Thumbnails.of(image)
    .sourceRegion(100, 100, 300, 300)
    .toFile(thumbnail);
```

# 根据宽度来缩放
```
Thumbnails.of(image)
    .height(500)
    .toFile(thumbnail);
因为默认keepAspectRatio为true，即长宽比例不变，设置了高度，所以根据高度和原先的比例进行调整略缩图的width
```

# 保持长宽比例缩小图片
keepAspectRatio(true);  //默认为true，当设置为false，则输出略缩图不按比例自动调控，而是强制输出，图片可能变形
```
Thumbnails.of(image)
    .size(160, 160)
    .toFile(thumbnail);
默认keepAspectRatio为true，如果原图是正方形，则输出图片正常为160x160

Thumbnails.of(image)
    .size(160, 160)
    .keepAspectRatio(false)
    .toFile(thumbnail);
keepAspectRatio为false，如果原图不是正方形，则输出依旧为160x160，但是图片会变形

```

# 加水印
![](/img/2018-08-17/DA2EA278-8555-4A19-9B9A-ABC0BFC37DCC.png)
```
File watermark = new File("water.png");
BufferedImage watermarkBufferedImage = Thumbnails.of(watermark).scale(1.0).outputQuality(1.0).asBufferedImage();
Thumbnails.of("pic.jpg")
    .scale(1)
    .watermark(Positions.TOP_RIGHT, watermarkBufferedImage, 1.0f)
    .toFile("pic2.jpg");
```

# 图片旋转90度[顺时针]
```
Thumbnails.of("pic.jpg")
    .rotate(90)
    .toFile("pic2.jpg");
```

# 处理完的略缩图转输出流
```
OutputStream os = null;
Thumbnails.of("pic.jpg")
    .outputFormat("png")
    .toOutputStream(os);
```

# 定义略缩图格式
```
OutputStream os = null;
Thumbnails.of("pic.jpg")
    .outputFormat("png")
    .toOutputStream(os);
```

> 每个thumbnails链式中，必须包含以下三个方法其中之一：

> scale、width|height、size

> 并且只能包含一个

---
# 实例Demo
遍历某个文件夹下所有图片，每张缩小50%，图片质量为原有的0.1，略缩图后缀为png，加水印，水印居中，略缩图顺时针旋转90度，略缩图命名规则为thumbnail-原文件名.png
```
Thumbnails.of(new File("...").listFiles())
    .scale(0.5)
    .outputQuality(0.1)
    .outputFormat("png")
    .rotate(90)
    .watermark(ImageIO.read(watermark))
    .toFiles(Rename.PREFIX_HYPHEN_THUMBNAIL);
```
注意：略缩图虽然经过比例质量压缩，但是经常没法一步到位，压缩后图片并没有变小，甚至反而变大了，最好还是写个循环压缩吧，用得不多，有机会再完善下！！！