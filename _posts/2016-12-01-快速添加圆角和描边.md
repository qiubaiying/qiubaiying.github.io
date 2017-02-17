---
layout:     post
title:      快速添加圆角和描边
subtitle:   iOS 为图片添加圆角和描边的几种方式
date:       2016-12-01
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - iOS
    - 开发技巧
---

# 前言

对于习惯使用Storyboard的人来说，设置圆角、描边是一件比较蛋疼的事，因为苹果没有在xcode的Interface Builder上直接提供修改控件的圆角，边框设置。

我们来说说如何对某个控件进行圆角、描边处理：
# 初级
对于一个初学者来说，如果要进行某个控件的圆角、描边设置，就要从Storyboard关联出属性，然后再对属性进行代码处理。

如下代码：

```
self.myButton.layer.cornerRadius = 20;
self.myButton.layer.masksToBounds = YES;
self.myButton.layer.borderWidth = 2;
self.myButton.layer.borderColor = [UIColor blackColor].CGColor;
```
这样不仅需要Storyboard关联出属性，还要写一堆代码对属性进行设置，不得不说实在麻烦~

# 中级
更聪明的做法是使用Storyboard提供的Runtime Attributes为控件添加圆角描边。

选中控件，然后在Runtime Attributes框中输入对应的`Key`与`Type`与`Value`,这样程序在运行时就会通过KVC为你的控件属性进行赋值。(不仅仅是圆角、描边~)

如下图

![](http://ww4.sinaimg.cn/large/7853084cgw1fabg89aeqkj207b08j74y.jpg)

设置圆角、描边的Key为：

```
layer.borderWidth
layer.borderColorFromUIColor
layer.cornerRadius
clipsToBounds
```
我这次在测试时，

这样做不用关联出属性，但是需要输入大串字符串，也是不够方便。

# 高级

创建UIView的分类，使用`IBInspectable`+ `IB_DESIGNABLE`关键字：

```
#import <UIKit/UIKit.h>

IB_DESIGNABLE

@interface UIView (Inspectable)

@property(nonatomic,assign) IBInspectable CGFloat cornerRadius;
@property(nonatomic,assign) IBInspectable CGFloat borderWidth;
@property(nonatomic,assign) IBInspectable UIColor *borderColor;

@end
```

```
#import "UIView+Inspectable.h"

@implementation UIView (Inspectable)

-(void)setCornerRadius:(CGFloat)cornerRadius{
    self.layer.masksToBounds = YES;
    self.layer.cornerRadius = cornerRadius;
}
-(void)setBorderColor:(UIColor *)borderColor{
    self.layer.borderColor = borderColor.CGColor;
}
-(void)setBorderWidth:(CGFloat)borderWidth{
    self.layer.borderWidth = borderWidth;
}

- (CGFloat)cornerRadius{
    return self.layer.cornerRadius;
}
- (CGFloat)borderWidth{
    return self.layer.borderWidth;
}
- (UIColor *)borderColor{
    return [UIColor colorWithCGColor:self.layer.borderColor];
}

@end
```

附上：[GitHub地址](https://github.com/qiubaiying/CircularAndStroke.git)


#### 直接使用

直接将这两个文件拖入项目中即可使用，在右边栏将会显示圆角和描边的属性设置

如图：

![](http://ww4.sinaimg.cn/large/7853084cgw1facfqugjtbj20mp07v401.jpg)

#### 动态显示设置效果

直接使用的话只有在运行时才能看到效果，

例如要实时显示一个`UIBUtton`圆角、描边效果，需要创建一个类继承`UIButton`

```
#import <UIKit/UIKit.h>
#import "UIView+Inspectable.h"

@interface myButton : UIButton

@end
```

```
#import "myButton.h"

@implementation myButton

@end
```

只要将button的Class选择该空白类即可

关于`IBInspectable`与`IB_DESIGNABLE`的使用详情可以参考这篇文章[《谈不完美的IBDesignable/IBInspectable可视化效果编程》](http://www.jianshu.com/p/a90e44ba1f2b)