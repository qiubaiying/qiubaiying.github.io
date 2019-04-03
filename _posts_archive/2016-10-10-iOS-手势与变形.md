---
layout:     post
title:      iOS手势与变形
subtitle:   手势与变形基础知识笔记
date:       2016-10-10
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - iOS
    - iOS开发基础
---

>手势在用户交互中有着举足轻重的作用，这篇文字简单的介绍了iOS中的手势，并通过手势对控件进行变形处理。

# 手势

iOS手势分为下面这几种：

- UITapGestureRecognizer（点按）
- UIPanGestureRecognizer（拖动）
- UIScreenEdgePanGestureRecognizer (边缘拖动)
- UIPinchGestureRecognizer（捏合）
- UIRotationGestureRecognizer（旋转）
- UILongPressGestureRecognizer（长按）
- ​UISwipeGestureRecognizer（轻扫）



这些手势大都继承于**UIGestureRecognizer**类，（`UIScreenEdgePanGestureRecognizer`继承于`UIPanGestureRecognizer`类）,

需要说明的是这些手势只有一个是**离散型手势**，那就是`UITapGestureRecognizer`，一旦识别就无法取消，而且只会调用一次手势操作事件。

换句话说其他手势是**连续型手势**，而连续型手势的特点就是：会多次调用手势操作事件，而且在连续手势识别后可以取消手势。

从下图可以看出两者调用操作事件的次数是不同的：

![](http://ww3.sinaimg.cn/large/006tNc79gw1fb0neee6mlj30dw0aldgf.jpg)

这些手势类有着以下共同的方法:


创建方法：

```
- (instancetype)initWithTarget:(nullable id)target action:(nullable SEL)action;
```

移除方法：

```
- (void)removeTarget:(nullable id)target action:(nullable SEL)action;
```

添加事件：

```
- (void)addTarget:(id)target action:(SEL)action;
```

还有下面这些属性等：

```
@property(nonatomic,readonly) UIGestureRecognizerState state;// 手势状态

typedef NS_ENUM(NSInteger, UIGestureRecognizerState) {
     UIGestureRecognizerStatePossible,   // 尚未识别是何种手势操作（但可能已经触发了触摸事件），默认状态
     UIGestureRecognizerStateBegan,      // 手势已经开始，此时已经被识别，但是这个过程中可能发生变化，手势操作尚未完成
     UIGestureRecognizerStateChanged,    // 手势状态发生转变
     UIGestureRecognizerStateEnded,      // 手势识别操作完成（此时已经松开手指）
     UIGestureRecognizerStateCancelled,  // 手势被取消，恢复到默认状态
     UIGestureRecognizerStateFailed,     // 手势识别失败，恢复到默认状态
     UIGestureRecognizerStateRecognized = UIGestureRecognizerStateEnded // 手势识别完成，同UIGestureRecognizerStateEnded
 };

@property(nullable,nonatomic,weak) id <UIGestureRecognizerDelegate> delegate; // 代理

@property(nonatomic, getter=isEnabled) BOOL enabled; 
```

当然我们也可以自定义手势来实现特殊的需求，关于自定义手势可以看[这篇博客](http://blog.csdn.net/mmoaay/article/details/47355709).

接下来我们来看看这些常用手势的用法.

#### UITapGestureRecognizer（点按）

Tap手势有两个属性，

- numberOfTapsRequired
- numberOfTouchesRequired：

`numberOfTapsRequired`为触发事件需要点击的次数，默认是1；

`numberOfTouchesRequired`为触发事件需要的几个手指点按，默认是1；

若都设置为2，就需要`两个`手指同时点按`2次`才会触发事件。

Tap手势也是我们最常用的手势之一, 比如点击ImageView跳转到其他界面，或者双击图片放大缩小等。

创建：

```
	UITapGestureRecognizer *tap = [[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(tap:)];
    tap.numberOfTapsRequired = 2;
    tap.numberOfTouchesRequired = 1;
    [self.imageView addGestureRecognizer:tap];
```

#### UIPanGestureRecognizer（拖动）

Pan手势的属性和方法：

- @property (nonatomic)          NSUInteger minimumNumberOfTouches __TVOS_PROHIBITED;
- @property (nonatomic)          NSUInteger minimumNumberOfTouches __TVOS_PROHIBITED;
- \-(CGPoint)translationInView:(nullable UIView *)view;
- \-(void)setTranslation:(CGPoint)translation inView:(nullable UIView *)view;
- \-(CGPoint)velocityInView:(nullable UIView *)view; 

`translationInView:`方法获取`View`的偏移量；

`setTranslation:`方法设置手势的偏移量；

`velocityInView:`方法获取速度；

所以手势的创建方法都类似，这里就不在一一列举了。


#### UIScreenEdgePanGestureRecognizer (边缘拖动)

ScreenEdgePan继承于`UIPanGestureRecognizer`，在屏幕边缘滑动才会触发

- @property (readwrite, nonatomic, assign) UIRectEdge edges;

`edges`为指定边缘拖动触发的边，是一个枚举：

```
typedef NS_OPTIONS(NSUInteger, UIRectEdge) {
    UIRectEdgeNone   = 0,
    UIRectEdgeTop    = 1 << 0,
    UIRectEdgeLeft   = 1 << 1,
    UIRectEdgeBottom = 1 << 2,
    UIRectEdgeRight  = 1 << 3,
    UIRectEdgeAll    = UIRectEdgeTop | UIRectEdgeLeft | UIRectEdgeBottom | UIRectEdgeRight
} NS_ENUM_AVAILABLE_IOS(7_0);
```
其他方法和Tap手势一致，主要用于像左右抽屉视图的变换等处理。


#### UIPinchGestureRecognizer（捏合）
Pinch手势有两个属性：

- @property (nonatomic)          CGFloat scale;              
- @property (nonatomic,readonly) CGFloat velocity; 

`scale`：捏合比例

`velocity`:捏合速度 = `scale/second`

#### UIRotationGestureRecognizer（旋转）
Rotation手势和Pinch手势类似，同样有两个手势：

- @property (nonatomic)          CGFloat rotation;            
- @property (nonatomic,readonly) CGFloat velocity;

`rotation`:旋转弧度，注意，这里的单位是**弧度**

`velocity`:旋转速度

#### UILongPressGestureRecognizer（长按）

LongPress的属性：

- @property (nonatomic) NSUInteger numberOfTapsRequired;      // Default is 0. 
- @property (nonatomic) NSUInteger numberOfTouchesRequired __TVOS_PROHIBITED;   // Default is 1. 
- @property (nonatomic) CFTimeInterval minimumPressDuration; 
-  @property (nonatomic) CGFloat allowableMovement;

`numberOfTapsRequired`和`numberOfTouchesRequired`和Tap手势类似，都是指定触发需要的点击次数和手指数量，但是LongPress手势的`numberOfTapsRequired`是指定长按前需要点击的次数。

`minimumPressDuration`:触发时间

`allowableMovement`:允许长按时间触发前允许手指滑动的范围。若是你在长按时手指移动，该长按手势将会失败，`allowableMovement`设置你能容忍的滑动范围，默认是10.

# 变形
---
iOS的变形指的是图片的旋转、平移和缩放。这些变形可以和上面介绍的手势结合，完成许多变形操作。

说变形前我们来看看**CGAffineTransform**，**CGAffineTransform**为一个结构体：

```
struct CGAffineTransform {
    CGFloat a, b, c, d;
    CGFloat tx, ty;
};
```
我们输出一个控件的`transform`看看

```
NSLog(@"%@", NSStringFromCGAffineTransform(self.label.transform));
```

输出

```
2016-12-22 17:01:19.211 手势[6489:1481987] [1, 0, 0, 1, 0, 0]
```

我们可以看到输出了一个长度为6的数组：`[1, 0, 0, 1, 0, 0]`，并且我们可以猜测对应结构体中的`[a, b, c, d, tx, ty]`，并且默认的`transform`值就是`[1, 0, 0, 1, 0, 0]`。

想进一步了解可以看这篇[《iOS CGAffineTransform详解》](http://blog.csdn.net/ashiyanshi/article/details/48160429)

对iOS控件进行变形实际就是对控件`transform`属性进行操作。

但是我们使用中，使用已经封装好的的API对控件进行变形处理。分别是：


- CGAffineTransformScale()
- CGAffineTransformTranslate()
- CGAffineTransformRotate()

和：

- CGAffineTransformMakeScale（）
- CGAffineTransformMakeTranslate()
- CGAffineTransformMakeRotate()

这些API都是对设置`CGAffineTransform`的一个封装，针对`[a, b, c, d, tx, ty]`中不同的位置进行操作。


下面我们在ViewController创建一个`UILabel`控件。然后对它进行变形操作。

![](http://ww4.sinaimg.cn/large/006tNc79jw1fazplz4mvmj306x0cbt8m.jpg)

#### 缩放

首先来看一个缩放操作

```
// 缩放到90%（相对）
self.label.transform = CGAffineTransformScale(self.label.transform, 0.9, 0.9);
    
NSLog(@"%@", NSStringFromCGAffineTransform( self.label.transform));

```

输出：

```
2016-12-22 17:26:25.074 手势[6526:1564064] [0.90000000000000002, 0, 0, 0.90000000000000002, 0, 0]
2016-12-22 17:26:26.096 手势[6526:1564064] [0.81000000000000005, 0, 0, 0.81000000000000005, 0, 0]
2016-12-22 17:26:26.963 手势[6526:1564064] [0.72900000000000009, 0, 0, 0.72900000000000009, 0, 0]
2016-12-22 17:26:28.830 手势[6526:1564064] [0.65610000000000013, 0, 0, 0.65610000000000013, 0, 0]
```

我们再看看另一个缩放：

```
self.label.transform = CGAffineTransformMakeScale(0.9, 0.9);

NSLog(@"%@", NSStringFromCGAffineTransform( self.label.transform));
```

输出

```
2016-12-22 17:32:32.972 手势[6581:1600236] [0.90000000000000002, 0, 0, 0.90000000000000002, 0, 0]
2016-12-22 17:32:34.164 手势[6581:1600236] [0.90000000000000002, 0, 0, 0.90000000000000002, 0, 0]
2016-12-22 17:32:35.246 手势[6581:1600236] [0.90000000000000002, 0, 0, 0.90000000000000002, 0, 0]
```

对比可以发现`CGAffineTransformScale()`与`CGAffineTransformMakeScale()`的区别在于，`CGAffineTransformScale()`实在原理的基础上在进行缩放操作，而`CGAffineTransformMakeScale()`直接将缩放值设定为0.9不变了。

缩放操作变动的是构体中`[a, b, c, d, tx, ty]`的`a`和`d`，值和变形系数`Scale`是相对应的，大于1是放大，小于1是缩小。。

`a`是横向缩放， `d`是纵向缩放。

#### 平移

先来看一个平移操作：

```
self.label.transform = CGAffineTransformTranslate(self.label.transform, 10, 10);
    NSLog(@"%@", NSStringFromCGAffineTransform( self.label.transform));
```
输出

```
2016-12-22 17:40:38.568 手势[6608:1631232] [1, 0, 0, 1, 10, 10]
2016-12-22 17:40:40.833 手势[6608:1631232] [1, 0, 0, 1, 20, 20]
2016-12-22 17:40:41.834 手势[6608:1631232] [1, 0, 0, 1, 30, 30]
2016-12-22 17:40:42.532 手势[6608:1631232] [1, 0, 0, 1, 40, 40]
2016-12-22 17:40:43.162 手势[6608:1631232] [1, 0, 0, 1, 50, 50]
```

我们可以看到label往右下角移动

![](http://ww1.sinaimg.cn/large/006tNc79jw1fazply7kkpj306v0ca0sp.jpg)

对应xy的正向坐标为右下角。

#### 旋转

```
self.label.transform = CGAffineTransformRotate(self.label.transform, M_PI_2);
NSLog(@"%@", NSStringFromCGAffineTransform( self.label.transform));
```
输出：

```
2016-12-22 17:59:43.680 手势[6667:1717130] [6.123233995736766e-17, 1, -1, 6.123233995736766e-17, 0, 0]
```

![](http://ww2.sinaimg.cn/large/006tNc79gw1fazq3j2ud5j306z0cfdft.jpg)

可以看到`label`顺时针旋转了`π/2`弧度（90°）。

# 手势结合变形
---
手势结合变形就是通过手势对控件变形处理。

上代码：

```
#import "ViewController.h"

@interface ViewController ()<UIGestureRecognizerDelegate>
@property (weak, nonatomic) IBOutlet UIImageView *imageView;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
//    CGAffineTransform *mytransform = self.imageView.transform;
    self.imageView.userInteractionEnabled = YES;
    //1双击 恢复
    UITapGestureRecognizer *tap = [[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(tap:)];
    tap.numberOfTapsRequired = 2;
    tap.numberOfTouchesRequired = 1;
    [self.imageView addGestureRecognizer:tap];
    
    //2拖拽
    UIPanGestureRecognizer *pan = [[UIPanGestureRecognizer alloc]initWithTarget:self action:@selector(pan:)];
//    pan.delegate = self;
    [self.imageView addGestureRecognizer:pan];
    
    //3捏合
    UIPinchGestureRecognizer *pinch = [[UIPinchGestureRecognizer alloc]initWithTarget:self action:@selector(pinch:)];
    pinch.delegate = self;
    [self.imageView addGestureRecognizer:pinch];
    
    //4旋转
    UIRotationGestureRecognizer *rotaion = [[UIRotationGestureRecognizer alloc]initWithTarget:self action:@selector(rotaion:)];
//    pinch.delegate = self;
    [self.imageView addGestureRecognizer:rotaion];
    
    // 长按
    UILongPressGestureRecognizer *longPress = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(longPress:)];
    longPress.numberOfTapsRequired = 0;
    longPress.minimumPressDuration = 1;
//    longPress.allowableMovement = 3;
    [self.imageView addGestureRecognizer:longPress];
    
}
- (void)tap:(UITapGestureRecognizer *)sender{
    
    NSLog(@"tap！");
    
    //恢复
    self.imageView.transform = CGAffineTransformIdentity;
    
}
- (void)pan:(UIPanGestureRecognizer *)sender{
//    CGPoint center = self.imageView.center;
//    if (center.x < 0){
//        center.x = 0;
//    }else{
//        center.x += [sender translationInView:self.view].x;
//    }
//    
//    center.y += [sender translationInView:self.view].y;
//    self.imageView.center = center;
    //将相对偏移量清零
//    [sender setTranslation:CGPointMake(0, 0) inView:self.view];
    
    self.imageView.transform = CGAffineTransformTranslate(self.imageView.transform, [sender translationInView:self.imageView].x, [sender translationInView:self.imageView].y);
    [sender setTranslation:CGPointZero inView:self.view];
    
}

- (void)pinch:(UIPinchGestureRecognizer *)sender{
    
    CGFloat  scale = sender.scale;
    self.imageView.transform = CGAffineTransformScale(self.imageView.transform, scale, scale);
    [sender setScale:1];
   
}

- (void)rotaion:(UIRotationGestureRecognizer *)sender{
    //获取旋转弧度
    CGFloat rotation = sender.rotation;
    self.imageView.transform = CGAffineTransformRotate(self.imageView.transform, rotation);
    sender.rotation = 0;
    
//    self.imageView.transform = CGAffineTransformMakeRotation(sender.rotation);
    
}

- (void)longPress:(UILongPressGestureRecognizer *)sender {
    
    NSLog(@"longPress:%@", sender);
    
    // 判断长按事件触发
    if (sender.state == UIGestureRecognizerStateBegan) {
        self.imageView.transform = CGAffineTransformMake(1, 0, 0, 1, 0, 0);
    }
    
}


//希望两个手势共存
//遵守 UIGestureRecognizerDelegate 协议
//实现方法 -(BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
//将要同时实现的手势设置代理 pinch.delegate = self; pinch.delegate = self;

-(BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer{
    return YES;
}

```

有几点需要注意：

- 给本身没有交互功能的控件（）imagView, UIlabel, View等）添加手势，要设置`userInteractionEnabled`为**YES**，否则识别不了手势
- 想要手势共存需要：
	- 遵守 `UIGestureRecognizerDelegate` 协议
	- 实现`-(BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer`方法，返回`YES`
	- 将要同时实现的手势设置代理 `pinch.delegate = self`; `pinch.delegate = self`
	
# 在storyboard中添加手势

在`storyboard`的控件栏中我们可以看到这些手势控件：

![storyboard中的手势控件](http://ww1.sinaimg.cn/large/006tNc79gw1fb0j188yh1j30780evwfq.jpg)

#### 使用方法：

1. 直接将手势控件拖到要添加的视图上

	![](http://ww3.sinaimg.cn/large/006tNc79gw1fb0ja1f8fnj30f206nwev.jpg)
	
2. 关联手势事件

	![](http://ww2.sinaimg.cn/large/006tNc79gw1fb0jaxllv6j30ol0be77b.jpg)

3. 设置手势属性

	![](http://ww2.sinaimg.cn/large/006tNc79gw1fb0jc5mon3j307c06ydgd.jpg)
	
注意：若想同时识别多个手势，方法和上面相同，遵循协议，实现方法，设置代理，不过代理可以手动关联。

![](http://ww4.sinaimg.cn/large/006tNc79gw1fb0jokip2vj30ej0aq3zz.jpg)



