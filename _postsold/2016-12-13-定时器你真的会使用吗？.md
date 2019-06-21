---
layout:     post
title:      定时器 你真的会使用吗？
subtitle:   iOS定时器详解
date:       2016-12-13
author:     BY
header-img: img/post-bg-ios10.jpg
catalog: 	 true
tags:
    - iOS
    - 定时器
---


# 前言

定时器的使用是软件开发基础技能，用于延时执行或重复执行某些方法。

我相信大部分人接触iOS的定时器都是从这段代码开始的:

```objc
[NSTimer scheduledTimerWithTimeInterval:1.0 target:self selector:@selector(action:) userInfo:nil repeats:YES]
```

但是你真的会用吗？

# 正文

## iOS定时器

首先来介绍iOS中的定时器

iOS中的定时器大致分为这几类：

- **NSTimer**
- **CADisplayLink**
- **GCD定时器**

### NSTimer

#### 使用方法

**NSTime**定时器是我们比较常使用的定时器，比较常使用的方法有两种：

```objc
+ (NSTimer *)timerWithTimeInterval:(NSTimeInterval)ti target:(id)aTarget selector:(SEL)aSelector userInfo:(nullable id)userInfo repeats:(BOOL)yesOrNo;

+ (NSTimer *)scheduledTimerWithTimeInterval:(NSTimeInterval)ti target:(id)aTarget selector:(SEL)aSelector userInfo:(nullable id)userInfo repeats:(BOOL)yesOrNo;
```
这两种方法都是创建一个定时器，区别是用`timerWithTimeInterval:`方法创建的定时器需要手动加入RunLoop中。

```
// 创建NSTimer对象
NSTimer *timer = [NSTimer timerWithTimeInterval:3 target:self selector:@selector(timerAction) userInfo:nil repeats:YES];
// 加入RunLoop中
[[NSRunLoop mainRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
```

需要**注意**的是： `UIScrollView` 滑动时执行的是 `UITrackingRunLoopMode`，`NSDefaultRunLoopMode`被挂起，会导致定时器失效，等恢复为**滑动结束**时才恢复定时器。其原因可以查看我这篇[《Objective-C RunLoop 详解》](http://www.jianshu.com/p/c4f552ceda63)中的 “RunLoop 的 Mode“章节，有详细的介绍。

举个例子：

```
- (void)startTimer{
    NSTimer *UIScrollView = [NSTimer timerWithTimeInterval:0.5 target:self selector:@selector(action:) userInfo:nil repeats:YES];
    [[NSRunLoop mainRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
}

- (void)action:(NSTimer *)sender {
    static int i = 0;
    NSLog(@"NSTimer: %d",i);
    i++;
}
```

将`timer`添加到**NSDefaultRunLoopMode**中，没0.5秒打印一次，然后滑动`UIScrollView`.

打印台输出：

![](http://upload-images.jianshu.io/upload_images/2178672-9de097ecc618b498.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看出在滑动`UIScrollView`时，定时器被暂停了。

所以如果需要定时器在 `UIScrollView` 拖动时也不影响的话，有两种解决方法


1. **timer**分别添加到 `UITrackingRunLoopMode` 和 `NSDefaultRunLoopMode`中

```objc
[[NSRunLoop mainRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
[[NSRunLoop mainRunLoop] addTimer:timer forMode: UITrackingRunLoopMode]; 
```

2. 直接将**timer**添加到`NSRunLoopCommonModes` 中：

```objc
[[NSRunLoop mainRunLoop] addTimer:timer forMode: NSRunLoopCommonModes]; 
```

但并不是都**timer**所有的需要在滑动`UIScrollView`时继续执行，比如使用**NSTimer**完成的帧动画，滑动`UIScrollView`时就可以停止帧动画，保证滑动的流程性。

若没有特殊要求的话，一般使用第二种方法创建完**timer**，会自动添加到`NSDefaultRunLoopMode`中去执行，也是平时最常用的方法。

```
NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:1.0 target:self selector:@selector(action:) userInfo:nil repeats:YES];
```
参数：

`TimeInterval`：延时时间

`target`:目标对象，一般就是`self`本身

`selector`:执行方法

`userInfo`:传入信息

`repeats`:是否重复执行

以上创建的定时器，若`repeats`参数设为`NO`，执行一次后就会被释放掉;

若`repeats`参数设为`YES`重复执行时，必须手动关闭，否则定时器不会释放(停止）。

释放方法：

```
// 停止定时器
[timer invalidate];
```

实际开发中，我们会将`NSTimer`对象设置为属性，这样方便释放。

**iOS10.0** 推出了两个新的API，与上面的方法相比，`selector`换成Block回调以、减少传入的参数(那几个参数真是鸡肋)。不过开发中一般需要适配低版本，还是尽量使用上面的方法吧。

```
+ (NSTimer *)timerWithTimeInterval:(NSTimeInterval)interval repeats:(BOOL)repeats block:(void (^)(NSTimer *timer))block API_AVAILABLE(macosx(10.12), ios(10.0), watchos(3.0), tvos(10.0));

+ (NSTimer *)scheduledTimerWithTimeInterval:(NSTimeInterval)interval repeats:(BOOL)repeats block:(void (^)(NSTimer *timer))block API_AVAILABLE(macosx(10.12), ios(10.0), watchos(3.0), tvos(10.0));
```

###特点

- **必须加入Runloop**

	上面不管使用哪种方法，实际最后都会加入RunLoop中执行，区别就在于是否手动加入而已。
- **存在延迟**

	不管是一次性的还是周期性的timer的实际触发事件的时间，都会与所加入的RunLoop和RunLoop Mode有关，如果此RunLoop正在执行一个连续性的运算，timer就会被延时出发。重复性的timer遇到这种情况，如果延迟超过了一个周期，则会在延时结束后立刻执行，并按照之前指定的周期继续执行，这个延迟时间大概为50-100毫秒.
	
	所以NSTimer不是绝对准确的,而且中间耗时或阻塞错过下一个点,那么下一个点就pass过去了.
	
- **UIScrollView滑动会暂停计时**
	
	添加到`NSDefaultRunLoopMode`的 `timer` 在 `UIScrollView`滑动时会暂停，若不想被`UIScrollView`滑动影响，需要将 `timer` 添加再到 `UITrackingRunLoopMode` 或 直接添加到`NSRunLoopCommonModes` 中



##CADisplayLink


CADisplayLink官方介绍：
>A CADisplayLink object is a timer object that allows your application to synchronize its drawing to the refresh rate of the display

**CADisplayLink**对象是一个和屏幕刷新率同步的定时器对象。每当屏幕显示内容刷新结束的时候，runloop就会向CADisplayLink指定的`target`发送一次指定的`selector`消息， CADisplayLink类对应的 `selector` 就会被调用一次。

从原理上可以看出，CADisplayLink适合做界面的不停重绘，比如视频播放的时候需要不停地获取下一帧用于界面渲染，或者做动画。
###使用方法

创建：

```
@property (nonatomic, strong) CADisplayLink *displayLink;

self.displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(handleDisplayLink:)];  

// 每隔1帧调用一次
self.displayLink.frameInterval = 1;  

[self.displayLink addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
```
释放方法：

```
[self.displayLink invalidate];  

self.displayLink = nil;
```      
当把**CADisplayLink**对象添加到runloop中后，`selector`就能被周期性调用，类似于重复的NSTimer被启动了；执行`invalidate`操作时，CADisplayLink对象就会从runloop中移除，`selector`调用也随即停止，类似于NSTimer的`invalidate`方法。

**CADisplayLink**中有两个重要的属性：

- **frameInterval**

	NSInteger类型的值，用来设置间隔多少帧调用一次`selector`方法，默认值是1，即每帧都调用一次。
    
- **duration**

	`CFTimeInterval`值为`readOnly`，表示两次屏幕刷新之间的时间间隔。需要注意的是，该属性在`targe`t的`selector`被首次调用以后才会被赋值。`selector`的调用间隔时间计算方式是：**调用间隔时间 = duration × frameInterval**。
 

###特点

- **刷新频率固定**
	
	正常情况iOS设备的屏幕刷新频率是固定**60Hz**,如果CPU过于繁忙，无法保证屏幕60次/秒的刷新率，就会导致跳过若干次调用回调方法的机会，跳过次数取决CPU的忙碌程度。
- **屏幕刷新时调用**

	CADisplayLink在正常情况下会在每次刷新结束都被调用，精确度相当高。但如果调用的方法比较耗时，超过了屏幕刷新周期，就会导致跳过若干次回调调用机会	

- **适合做界面渲染**

	CADisplayLink可以确保系统渲染每一帧的时候我们的方法都被调用，从而保证了动画的流畅性。

##GCD定时器

**GCD定时器**和NSTimer是不一样的，NSTimer受RunLoop影响，但是GCD的定时器不受影响，因为通过源码可知RunLoop也是基于GCD的实现的，所以GCD定时器有非常高的精度。关于GCD的使用可一看看[这篇博客](http://www.cnblogs.com/pure/archive/2013/03/31/2977420.html)。

###使用方法
创建GCD定时器定时器的方法稍微比较复杂，看下面的代码：

####单次的延时调用
NSObject中的`performSelector:withObject:afterDelay:`以及 `performSelector:withObject:afterDelay:inModes:` 这两个方法在调用的时候会设置当前 runloop 中 `timer` ，前者设置的 `timer` 在 `NSDefaultRunLoopMode` 运行，后者则可以指定 **NSRunLoop** 的 `mode` 来执行。我们上面介绍过 runloop 中 `timer` 在 `UITrackingRunLoopMode` 被挂起，就导致了代码就会一直等待 `timer` 的调度,解决办法在上面也有说明。

不过我们可以用另一套方案来解决这个问题，就是使用GCD中的 `dispatch_after` 来实现单次的延时调用：

```
double delayInSeconds = 2.0;
    dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
    dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
        [self someMethod];
    });
```

####循环调用
```
// 创建GCD定时器
dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);

dispatch_source_t _timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);

dispatch_source_set_timer(_timer, dispatch_walltime(NULL, 0), 1.0 * NSEC_PER_SEC, 0); //每秒执行

// 事件回调
dispatch_source_set_event_handler(_timer, ^{
        
    dispatch_async(dispatch_get_main_queue(), ^{
        // 在主线程中实现需要的功能
        
	}
}
    
});

// 开启定时器
dispatch_resume(_timer);

// 挂起定时器（dispatch_suspend 之后的 Timer，是不能被释放的！会引起崩溃）
dispatch_suspend(_timer);

// 关闭定时器
dispatch_source_cancel(_timer);
    
```

上面代码中要注意的是：

1. `dispatch_source_set_event_handler()`中的任务实在子线程中执行的，若需要回到主线程，要调用`dispatch_async(dispatch_get_main_queue(), ^{}`.
- `dispatch_source_set_timer` 中第二个参数，当我们使用 `dispatch_time` 或者 `DISPATCH_TIME_NOW` 时，系统会使用默认时钟来进行计时。然而当系统休眠的时候，默认时钟是不走的，也就会导致计时器停止。使用 `dispatch_walltime ` 可以让计时器按照真实时间间隔进行计时.
- 第三个参数， ` 1.0 * NSEC_PER_SEC` 为每秒执行一次，对应的还有毫秒，分秒，纳秒可以选择.


- `dispatch_source_set_event_handler` 这个函数在执行完之后，block 会立马执行一遍，后面隔一定时间间隔再执行一次。而 `NSTimer` 第一次执行是到计时器触发之后。这也是和 `NSTimer` 之间的一个显著区别。
- 挂起（暂停）定时器, `dispatch_suspend` 之后的 `Timer`，不能被释放的,会引起崩溃.
- 创建的`timer`一定要有`dispatch_suspend(_timer)`或`dispatch_source_cancel(_timer)`这两句话来指定出口，否则定时器将不执行，若我们想无限循环可将 `dispatch_source_cancel(_timer)` 写在一句永不执行的`if`判断语句中。


##使用场景

介绍完iOS中的各种定时器，接下来我们来说说这几种定时器在开发中的几种用法。
###短信重发倒计时

短信倒计时使我们登录注册常用的功能，一般设置为60s，实现方法如下：

```
// 计时时间
@property (nonatomic, assign) int timeout;

/** 开启倒计时 */
- (void)startCountdown {
    
    if (_timeout > 0) {
        return;
    }
    
    _timeout = 60;
    
    // GCD定时器
    dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    
    dispatch_source_t _timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);
    
    dispatch_source_set_timer(_timer, dispatch_walltime(NULL, 0), 1.0 * NSEC_PER_SEC, 0); //每秒执行
    
    dispatch_source_set_event_handler(_timer, ^{
        
        if(_timeout <= 0 ){// 倒计时结束
            
            // 关闭定时器
            dispatch_source_cancel(_timer);
            
            dispatch_async(dispatch_get_main_queue(), ^{
                
                //设置界面的按钮显示 根据自己需求设置
                [self.sendMsgBtn setTitle:@"发送" forState:UIControlStateNormal];
                
                self.sendMsgBtn.enabled = YES;
                
            });
            
        }else{// 倒计时中
            
            // 显示倒计时结果
            
            NSString *strTime = [NSString stringWithFormat:@"重发(%.2d)", _timeout];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                
                //设置界面的按钮显示 根据自己需求设置
                
                [self.sendMsgBtn setTitle:[NSString stringWithFormat:@"%@",strTime] forState:UIControlStateNormal];
                
                self.sendMsgBtn.enabled = NO;
                
            });
            
            _timeout--;
        }
    });
    
    // 开启定时器
    dispatch_resume(_timer);
    
}
```

在上面代码中，我们设置了一个60s循环倒计时，当我们向服务器获取短信验证码成功时 调用该方法开始倒计时。每秒刷新按钮的倒计时数，倒计时结束时再将按钮 `Title` 恢复为“发送”.

有一点需要注意的是，按钮的样式要设置为 **UIButtonTypeCustom**,否则会出现刷新 `Title` 时闪烁.

我们可以把这个方法封装一下，方便调用，否则在控制器中写这么一大段代码确实也不优雅。

效果如下：

![](http://upload-images.jianshu.io/upload_images/2178672-3d4d1353bcc36026.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### [代码链接](https://github.com/qiubaiying/BYTimer)


###每个几分钟向服务器发送数据

在有定位服务的APP中，我们需要每个一段时间将定位数据发送到服务器，比如每5s定位一次每隔5分钟将再统一将数据发送服务器，这样会处理比较省电。
一般程序进入后台时，定时器会停止，但是在定位APP中，需要持续进行定位，APP在后台时依旧可以运行，所以在后台定时器也是可以运行的。

注：关于iOS后台常驻,可以查看[这篇博客](http://waitingyuan.blog.163.com/blog/static/2155781652014111133150534/)

在使用GCD定时的时候发现GCD定时器也可以在后代运行，创建方法同上面的短信倒计时.

这里我们使用**NSTimer**来创建一个每个5分钟执行一次的定时器.

```
#import <Foundation/Foundation.h>

typedef void(^TimerBlock)();

@interface BYTimer : NSObject

- (void)startTimerWithBlock:(TimerBlock)timerBlock;

- (void)stopTimer;

@end

```

```
#import "BYTimer.h"

@interface BYTimer ()

@property (nonatomic, strong) NSTimer *timer;
@property (nonatomic, strong) TimerBlock timerBlock;

@end

@implementation BYTimer

- (void)startTimerWithBlock:(TimerBlock)timerBlock {

	 self.timer = [NSTimer timerWithTimeInterval:300 target:self selector:@selector(_timerAction) userInfo:nil repeats:YES];
	 
    [[NSRunLoop mainRunLoop] addTimer:self.timer forMode:NSRunLoopCommonModes];
    _timerBlock = timerBlock;
    
}

- (void)_timerAction {
    if (self.timerBlock) {
        self.timerBlock();
    }
}

- (void)stopTimer {
    [self.timer invalidate];
}

@end
```

该接口的实现很简单，就是 **NSTimer** 创建了一个300s执行一次的定时器，但是要注意定时器需要加入`NSRunLoopCommonModes`中。

要使定时器在后台能运行，app 就需要在 [后台常驻](http://waitingyuan.blog.163.com/blog/static/2155781652014111133150534/)。

# 结语

最后总结一下：

NSTimer 使用简单方便，但是应用条件有限。

CADisplayLink 刷新频率与屏幕帧数相同，用于绘制动画。具体使用可看我封装好的一个 [水波纹动画](https://github.com/qiubaiying/WaterRippleView)。

GCD定时器 精度高，可控性强，使用稍复杂。
