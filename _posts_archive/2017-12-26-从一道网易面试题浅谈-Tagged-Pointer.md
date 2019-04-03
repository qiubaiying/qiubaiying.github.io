---
layout:     post
title:      从一道网易面试题浅谈 Tagged Pointer
subtitle:   浅谈 Tagged Pointer
date:       2017-12-26
author:     BY
header-img: img/post-bg-universe.jpg
catalog: true
tags:
    - iOS
---


## 前言

这篇博客九月就想写了，因为赶项目拖了到现在，抓住17年尾巴写吧~


## 正文

上次看了一篇 [《从一道网易面试题浅谈OC线程安全》](https://www.jianshu.com/p/cec2a41aa0e7) 的博客，主要内容是：

作者去网易面试，面试官出了一道面试题：下面代码会发生什么问题？

```objc
@property (nonatomic, strong) NSString *target;
//....
dispatch_queue_t queue = dispatch_queue_create("parallel", DISPATCH_QUEUE_CONCURRENT);
for (int i = 0; i < 1000000 ; i++) {
    dispatch_async(queue, ^{
        self.target = [NSString stringWithFormat:@"ksddkjalkjd%d",i];
    });
}
```

答案是：会 crash。

我们来看看对`target`属性（`strong`修饰）进行赋值，相当与 MRC 中的

```
- (void)setTarget:(NSString *)target {
    if (target == _target) return;
    id pre = _target;
    [target retain];//1.先保留新值
    _target = target;//2.再进行赋值
    [pre release];//3.释放旧值
}
```

因为在 *并行队列* `DISPATCH_QUEUE_CONCURRENT` 中*异步* `dispatch_async` 对 `target`属性进行赋值，就会导致 target 已经被 `release`了，还会执行 `release`。这就是向已释放内存对象发送消息而发生 crash 。


### 但是

我敲了这段代码，执行的时候发现并不会 crash~

```objc
@property (nonatomic, strong) NSString *target;
dispatch_queue_t queue = dispatch_queue_create("parallel", DISPATCH_QUEUE_CONCURRENT);
for (int i = 0; i < 1000000 ; i++) {
    dispatch_async(queue, ^{
    	// ‘ksddkjalkjd’删除了
        self.target = [NSString stringWithFormat:@"%d",i];
    });
}
```

原因就出在对 `self.target` 赋值的字符串上。博客的最后也提到了 - *‘上述代码的字符串改短一些，就不会崩溃’*，还有 `Tagged Pointer` 这个东西。

我们将上面的代码修改下：


```objc
NSString *str = [NSString stringWithFormat:@"%d", i];
NSLog(@"%d, %s, %p", i, object_getClassName(str), str);
self.target = str;
```

输出：

```
0, NSTaggedPointerString, 0x3015
```

发现这个字符串类型是 `NSTaggedPointerString`，那我们来看看 Tagged Pointer 是什么？

### Tagged Pointer

Tagged Pointer 详细的内容可以看这里 [深入理解Tagged Pointer](http://www.infoq.com/cn/articles/deep-understanding-of-tagged-pointer)。

Tagged Pointer 是一个能够提升性能、节省内存的有趣的技术。

- Tagged Pointer 专门用来存储小的对象，例如 **NSNumber** 和 **NSDate**（后来可以存储小字符串）
- Tagged Pointer 指针的值不再是地址了，而是真正的值。所以，实际上它不再是一个对象了，它只是一个披着对象皮的普通变量而已。
- 它的内存并不存储在堆中，也不需要 malloc 和 free，所以拥有极快的读取和创建速度。




### 参考：

- [从一道网易面试题浅谈OC线程安全](https://www.jianshu.com/p/cec2a41aa0e7)

- [深入理解Tagged Pointer](http://www.infoq.com/cn/articles/deep-understanding-of-tagged-pointer)

- [【译】采用Tagged Pointer的字符串](http://www.cocoachina.com/ios/20150918/13449.html)

