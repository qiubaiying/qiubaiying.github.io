---
layout:     post
title:      ReactiveCocoa 基础
subtitle:   函数式编程框架 ReactiveCocoa 基础入门
date:       2016-12-26
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - iOS
    - ReactiveCocoa
    - 函数式编程
    - 开源框架
---

# ReactiveCocoa基础
>本文修改自[最快让你上手ReactiveCocoa之基础篇](http://www.jianshu.com/p/87ef6720a096)
>
>有关对 **ReactiveCocoa** 的看法可以看一下唐巧的这篇[ReactiveCocoa 讨论会](https://gold.xitu.io/entry/568bd2ae60b2e57ba2cd2c7b)



![ReactiveCocoa思维导图](http://ww2.sinaimg.cn/large/006y8lVagw1fb7g0gukk8j30m90rl78j.jpg)


# ReactiveCocoa简介

[![](http://ww1.sinaimg.cn/large/006y8lVagw1fb7g6on3iwj30c2029q2z.jpg)](https://github.com/ReactiveCocoa/ReactiveCocoa)

ReactiveCocoa（简称为RAC）,是由Github开源的一个应用于iOS和OS开发的新框架,Cocoa是苹果整套框架的简称，因此很多苹果框架喜欢以Cocoa结尾。

在我们iOS开发过程中，当某些事件响应的时候，需要处理某些业务逻辑,这些事件都用不同的方式来处理。

比如按钮的点击使用action，ScrollView滚动使用delegate，属性值改变使用KVO等系统提供的方式。其实这些事件，都可以通过RAC处理

ReactiveCocoa为事件提供了很多处理方法，而且利用RAC处理事件很方便，可以把要处理的事情，和监听的事情的代码放在一起，这样非常方便我们管理，就不需要跳到对应的方法里。

非常符合我们开发中高聚合，低耦合的思想。


# ReactiveCocoa编程思想

在开发中我们也不能太依赖于某个框架，否则这个框架不更新了，导致项目后期没办法维护，比如之前Facebook提供的 `Three20` 框架，在当时也是神器，但是后来不更新了，也就没什么人用了。因此我感觉学习一个框架，还是有必要了解它的编程思想。

先简单介绍下目前咱们已知的编程思想:

#### 响应式编程思想

**响应式编程思想**：不需要考虑调用顺序，只需要知道考虑结果，类似于蝴蝶效应，产生一个事件，会影响很多东西，这些事件像流一样的传播出去，然后影响结果，借用面向对象的一句话，万物皆是流。

`代表`：KVO

#### 链式编程思想

**链式编程** 是将多个操作（多行代码）通过点号(.)链接在一起成为一句代码,使代码可读性好。如:

```
make.add(1).add(2).sub(5).muilt(-4).divide(4);
```

`特点`：方法的返回值是block,block必须有返回值（本身对象），block参数（需要操作的值）

`代表`：masonry框架。

`实现`：模仿masonry，写一个加法计算器，练习链式编程思想。

NSObject+Caculator.h

```
# import <Foundation/Foundation.h>

@class CaculatorMaker;

@interface NSObject (Caculator)

// 计算
+ (int)makeCaculators:(void (^)(CaculatorMaker *))block;
                       
@end
```

NSObject+Caculator.m

```
@implementation NSObject (Caculator)

+ (int)makeCaculators:(void (^)(CaculatorMaker *))block {
    
    CaculatorMaker *mgr = [[CaculatorMaker alloc] init];
    
    block(mgr);
    
    return (mgr.result);
}

@end
```

CaculatorMaker.h

```
# import <Foundation/Foundation.h>

@class CaculatorMaker;

typedef CaculatorMaker *(^CasulatorBlock)(int);

@interface CaculatorMaker : NSObject

@property (nonatomic, assign) int result;

// 算数方法
- (CaculatorMaker *(^)(int))add;
- (CasulatorBlock)sub;
- (CasulatorBlock)muilt;
- (CasulatorBlock)divide;


@end
```

CaculatorMaker.m

```
# import "CaculatorMaker.h"

@implementation CaculatorMaker

- (CaculatorMaker *(^)(int))add {

    return ^CaculatorMaker *(int value) {
        
        _result += value;
        
        return self;
    };
}

- (CasulatorBlock)sub {
    
    return ^CaculatorMaker *(int value) {
        
        _result -= value;
        
        return self;
    };
}

- (CasulatorBlock)muilt {

    return ^CaculatorMaker *(int value) {
        
        _result *= value;
        
        return self;
    };
}

- (CasulatorBlock)divide {
    
    return ^CaculatorMaker *(int value) {
        
        _result /= value;
        
        return self;
    };
}

@end
```

使用：

```
int result = [NSObject makeCaculators:^(CaculatorMaker *make) {
        
        // ( 1 + 2 - 5 ) * (-4) / 4
        make.add(1).add(2).sub(5).muilt(-4).divide(4);

    }];
    
    NSLog(@"%d", result);
```




#### 函数式编程思想

**函数式编程思想**：是把操作尽量写成一系列嵌套的函数或者方法调用。

`特点`：每个方法必须有返回值（本身对象）,把函数或者Block当做参数,block参数（需要操作的值）block返回值（操作结果）

`代表`：**ReactiveCocoa**

`实现`：用函数式编程实现，写一个加法计算器,并且加法计算器自带判断是否等于某个值.

```
    Calculator *caculator = [[Calculator alloc] init];
    
    BOOL isqule = [[[caculator caculator:^int(int result) {
        
        result += 2;
        result *= 5;
        return result;
        
    }] equle:^BOOL(int result) {
        
        return result == 10;
        
    }] isEqule];
    
    NSLog(@"%d", isqule);
```

Calculator.h

```
#import <Foundation/Foundation.h>

@interface Calculator : NSObject

@property (nonatomic, assign) BOOL isEqule;

@property (nonatomic, assign) int result;

- (Calculator *)caculator:(int (^)(int result))caculator;

- (Calculator *)equle:(BOOL (^)(int result))operation;

@end
```

Calculator.m

```
#import "Calculator.h"

@implementation Calculator

- (Calculator *)caculator:(int (^)(int))caculator {

    _result = caculator(_result);
    
    return self;
    
}


- (Calculator *)equle:(BOOL (^)(int))operation {

    _isEqule = operation(_result);
    
    return self;
}

@end
```
**ReactiveCocoa** 结合了这两种种编程风格：

- **函数式编程**（Functional Programming）

- **响应式编程**（Reactive Programming）

所以，你可能听说过 **ReactiveCocoa** 被描述为函数响应式编程（FRP）框架。

以后使用RAC解决问题，就不需要考虑调用顺序，直接考虑结果，把每一次操作都写成一系列嵌套的方法中，使代码高聚合，方便管理。

# 导入ReactiveCocoa
---


>ReactiveCocoa的[GitHub地址](https://github.com/ReactiveCocoa/ReactiveCocoa)

#### Objective-C 

**ReactiveCocoa 2.5**版本以后改用了**Swift**，所以**Objective-C**项目需要导入**2.5版本**

`CocoaPods`集成：

```
platform :ios, '8.0'

target 'YouProjectName' do

use_frameworks!
pod 'ReactiveCocoa', '~> 2.5'

end
```
PS:新版本的`CocoaPods`需要加入

```
target 'YouProjectName' do 
... 
end
```
这句话来限定项目，否则导入失败。

#### Swift

**Swift**项目导入2.5后的版本

```
platform :ios, '8.0'

target 'YouProjectName' do

use_frameworks!
pod 'ReactiveCocoa'

end

```
使用时在[全局头文件](http://www.jianshu.com/p/587b83b6665c)导入头文件即可

`PrefixHeader.pch`

```
#ifndef PrefixHeader_pch
#define PrefixHeader_pch

#import <ReactiveCocoa/ReactiveCocoa.h>

#endif
```

# ReactiveCocoa常见类

#### RACSiganl 信号类

>信号类,一般表示将来有数据传递，只要有数据改变，信号内部接收到数据，就会马上发出数据。

注意：

- 信号类(RACSiganl)，只是表示当数据改变时，信号内部会发出数据，它本身不具备发送信号的能力，而是交给内部一个订阅者去发出。
- 默认一个信号都是冷信号，也就是值改变了，也不会触发，只有订阅了这个信号，这个信号才会变为热信号，值改变了才会触发。
- 如何订阅信号：调用信号RACSignal的subscribeNext就能订阅

使用：

```
// RACSignal使用步骤：
    // 1.创建信号 + (RACSignal *)createSignal:(RACDisposable * (^)(id<RACSubscriber> subscriber))didSubscribe
    // 2.订阅信号,才会激活信号. - (RACDisposable *)subscribeNext:(void (^)(id x))nextBlock
    // 3.发送信号 - (void)sendNext:(id)value


    // RACSignal底层实现：
    // 1.创建信号，首先把didSubscribe保存到信号中，还不会触发。
    // 2.当信号被订阅，也就是调用signal的subscribeNext:nextBlock
    // 2.2 subscribeNext内部会创建订阅者subscriber，并且把nextBlock保存到subscriber中。
    // 2.1 subscribeNext内部会调用siganl的didSubscribe
    // 3.siganl的didSubscribe中调用[subscriber sendNext:@1];
    // 3.1 sendNext底层其实就是执行subscriber的nextBlock

    // 1.创建信号
    RACSignal *siganl = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {

        // block调用时刻：每当有订阅者订阅信号，就会调用block。

        // 2.发送信号
        [subscriber sendNext:@1];

        // 如果不在发送数据，最好发送信号完成，内部会自动调用[RACDisposable disposable]取消订阅信号。
        [subscriber sendCompleted];

        return [RACDisposable disposableWithBlock:^{

            // block调用时刻：当信号发送完成或者发送错误，就会自动执行这个block,取消订阅信号。

            // 执行完Block后，当前信号就不在被订阅了。

            NSLog(@"信号被销毁");

        }];
    }];

    // 3.订阅信号,才会激活信号.
    [siganl subscribeNext:^(id x) {
        // block调用时刻：每当有信号发出数据，就会调用block.
        NSLog(@"接收到数据:%@",x);
    }];
```

#### RACSubscriber
>表示订阅者的意思，用于发送信号，这是一个协议，不是一个类，只要遵守这个协议，并且实现方法才能成为订阅者。通过create创建的信号，都有一个订阅者，帮助他发送数据。

#### RACDisposable

>用于取消订阅或者清理资源，当信号发送完成或者发送错误的时候，就会自动触发它。

**使用场景**：不想监听某个信号时，可以通过它主动取消订阅信号。

#### RACSubject
>RACSubject:信号提供者，自己可以充当信号，又能发送信号。

**使用场景**:通常用来代替代理，有了它，就不必要定义代理了。

#### **RACReplaySubject**

>重复提供信号类，RACSubject的子类。

`RACReplaySubject`与`RACSubject`区别:

 `RACReplaySubject`可以先发送信号，在订阅信号，`RACSubject`就不可以。

 **使用场景一**:如果一个信号每被订阅一次，就需要把之前的值重复发送一遍，使用重复提供信号类。
 
 **使用场景二**:可以设置capacity数量来限制缓存的value的数量,即只缓充最新的几个值。
 
 **ACSubject** 和 **RACReplaySubject** 简单使用：
 
 **ACSubject**
 
 ```
     // RACSubject使用步骤
    // 1.创建信号 [RACSubject subject]，跟RACSiganl不一样，创建信号时没有block。
    // 2.订阅信号 - (RACDisposable *)subscribeNext:(void (^)(id x))nextBlock
    // 3.发送信号 sendNext:(id)value
    
    // RACSubject:底层实现和RACSignal不一样。
    // 1.调用subscribeNext订阅信号，只是把订阅者保存起来，并且订阅者的nextBlock已经赋值了。
    // 2.调用sendNext发送信号，遍历刚刚保存的所有订阅者，一个一个调用订阅者的nextBlock。
    
    
    // 1. 创建信号
    RACSubject *subject = [RACSubject subject];
    
    // 2.订阅信号
    [subject subscribeNext:^(id x) {
       
        // block调用时机：当信号发出新值，就会调用
        NSLog(@"收到信号");
        
    }];
    
    // 3.发送信号
    NSLog(@"发送信号");
    [subject sendNext:@"1"];
 ```
 
 ```
     // RACReplaySubject使用步骤:
    // 1.创建信号 [RACSubject subject]，跟RACSiganl不一样，创建信号时没有block。
    // 2.可以先订阅信号，也可以先发送信号。
    // 2.1 订阅信号 - (RACDisposable *)subscribeNext:(void (^)(id x))nextBlock
    // 2.2 发送信号 sendNext:(id)value
    
    // RACReplaySubject:底层实现和RACSubject不一样。
    // 1.调用sendNext发送信号，把值保存起来，然后遍历刚刚保存的所有订阅者，一个一个调用订阅者的nextBlock。
    // 2.调用subscribeNext订阅信号，遍历保存的所有值，一个一个调用订阅者的nextBlock
    
    // 如果想当一个信号被订阅，就重复播放之前所有值，需要先发送信号，在订阅信号。
    // 也就是先保存值，在订阅值。
    
    
    // 1.创建信号
    RACReplaySubject *replaySubject = [RACReplaySubject subject];
    

    
    // 3.先订阅信号
    [replaySubject subscribeNext:^(id x) {
        
        NSLog(@"第一个订阅者接受到的数据%@", x);
    }];
    
    // 2.发送信号
    [replaySubject sendNext:@1];
    [replaySubject sendNext:@2];
    
    // 后订阅信号
    [replaySubject subscribeNext:^(id x) {
        
        NSLog(@"第二个订阅者接收到的数据%@",x);
    }];
 ```

**RACSubject**替换代理（与block类似）

```
// 需求:
    // 1.给当前控制器添加一个按钮，modal到另一个控制器界面
    // 2.另一个控制器view中有个按钮，点击按钮，通知当前控制器

步骤一：在第二个控制器.h，添加一个RACSubject代替代理。
@interface TwoViewController : UIViewController

@property (nonatomic, strong) RACSubject *delegateSignal;

@end

步骤二：监听第二个控制器按钮点击
@implementation TwoViewController
- (IBAction)notice:(id)sender {
    // 通知第一个控制器，告诉它，按钮被点了

     // 通知代理
     // 判断代理信号是否有值
    if (self.delegateSignal) {
        // 有值，才需要通知
        [self.delegateSignal sendNext:nil];
    }
}
@end

步骤三：在第一个控制器中，监听跳转按钮，给第二个控制器的代理信号赋值，并且监听.
@implementation OneViewController 
- (IBAction)btnClick:(id)sender {

    // 创建第二个控制器
    TwoViewController *twoVc = [[TwoViewController alloc] init];

    // 设置代理信号
    twoVc.delegateSignal = [RACSubject subject];

    // 订阅代理信号
    [twoVc.delegateSignal subscribeNext:^(id x) {

        NSLog(@"点击了通知按钮 %@", x);
    }];

    // 跳转到第二个控制器
    [self presentViewController:twoVc animated:YES completion:@"hi"];

}
@end
```

#### RACTuple

>元组类,类似NSArray,用来包装值.(`@[key, value]`)


#### RACSequence

>RAC中的集合类，用于代替NSArray,NSDictionary,可以使用它来快速遍历数组和字典。

使用场景：字典转模型

```
    // 1.遍历数组
    NSArray *numbers = @[@1,@2,@3,@4];
    
    // 这里其实是三步
    // 第一步: 把数组转换成集合RACSequence numbers.rac_sequence
    // 第二步: 把集合RACSequence转换RACSignal信号类,numbers.rac_sequence.signal
    // 第三步: 订阅信号，激活信号，会自动把集合中的所有值，遍历出来。
    
    [numbers.rac_sequence.signal subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
    
    
    
    // 2.遍历字典,遍历出来的键值对 都会包装成 RACTuple(元组对象) @[key, value]
    NSDictionary *dic = @{@"name": @"BYqiu", @"age": @18};
    
    [dic.rac_sequence.signal subscribeNext:^(RACTuple *x) {
        
        // 解元组包，会把元组的值，按顺序给参数里的变量赋值
        // 写法相当与
        // NSString *key = x[0];
        // NSString *value = x[1];
        RACTupleUnpack(NSString *key, NSString *value) = x;
        
        NSLog(@"key:%@, value:%@", key, value);
        
    }];
    
    // 3.字典转模型
    
    NSString *filePath = [[NSBundle mainBundle] pathForResource:@"flags.plist" ofType:nil];
    
    NSArray *dicArray = [NSArray arrayWithContentsOfFile:filePath];
    
    NSMutableArray *items = [NSMutableArray array];
    
    // OC写法
    for (NSDictionary *dic in dicArray) {
        
        //FlagItem *item = [FlagItem flagWithDict:dict];
        //[items addObject:item];
    }
    
    
    // RAC写法
    [dicArray.rac_sequence.signal subscribeNext:^(id x) {
        // 利用RAC遍历， x：字典
        
        //FlagItem *item = [FlagItem flagWithDict:x];
        //[items addObject:item];
    }];
    
    // RAC高级用法（函数式编程）
    NSArray *flags = [[dicArray.rac_sequence map:^id(id value) {
        
        return  [FlagItem flagWithDict:value];
        
    }] array];

```

#### RACCommand

>RAC中用于处理事件的类，可以把事件如何处理,事件中的数据如何传递，包装到这个类中，他可以很方便的监控事件的执行过程。

 一、RACCommand使用步骤:
 
 1. 创建命令 initWithSignalBlock:(RACSignal * (^)(id input))signalBlock
 2. 在signalBlock中，创建RACSignal，并且作为signalBlock的返回值
 3. 执行命令 - (RACSignal *)execute:(id)input

 二、RACCommand使用注意:
 
 1. signalBlock必须要返回一个信号，不能传nil.
 2. 如果不想要传递信号，直接创建空的信号[RACSignal empty];
 3. RACCommand中信号如果数据传递完，必须调用[subscriber sendCompleted]，这时命令才会执行完毕，否则永远处于执行中。
 4. RACCommand需要被强引用，否则接收不到RACCommand中的信号，因此RACCommand中的信号是延迟发送的。

 三、RACCommand设计思想：
 
 内部signalBlock为什么要返回一个信号，这个信号有什么用。
 
 1. 在RAC开发中，通常会把网络请求封装到RACCommand，直接执行某个RACCommand就能发送请求。
 2. 当RACCommand内部请求到数据的时候，需要把请求的数据传递给外界，这时候就需要通过signalBlock返回的信号传递了。

 四、如何拿到RACCommand中返回信号发出的数据。
 
 1. RACCommand有个执行信号源executionSignals，这个是signal of signals(信号的信号),意思是信号发出的数据是信号，不是普通的类型。
 2. 订阅executionSignals就能拿到RACCommand中返回的信号，然后订阅signalBlock返回的信号，就能获取发出的值。

 五、监听当前命令是否正在执行executing

 六、使用场景,监听按钮点击，网络请求

使用:

```
// 1.创建命令
    RACCommand *command = [[RACCommand alloc] initWithSignalBlock:^RACSignal *(id input) {
        NSLog(@"执行命令");
        
        // 返回空信号
        //return [RACSignal empty];
        
        // 2.创建信号 传递数据
        return [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
            
            [subscriber sendNext:@"请求数据"];
            
            // 注意：数据传递完，最好调用sendCompleted,这时命令才执行完毕
            [subscriber sendCompleted];
            
            return nil;
        }];
    }];
    
    // 强引用命令，不要被销毁，否则接收不到数据
    _command = command;
    
    // 3.订阅RACCommand的信号
    [command.executionSignals subscribeNext:^(id x) {
        [x subscribeNext:^(id x) {
            
            NSLog(@"订阅RACCommand的信号: %@", x);
        }];
    }];

    // RAC高级用法
    // switchToLatest:用于signal of signals，获取signal of signals发出的最新信号,也就是可以直接拿到RACCommand中的信号
    [command.executionSignals.switchToLatest subscribeNext:^(id x) {
       
        NSLog(@"RAC高级用法: %@", x);
    }];
    
    // 4.监听命令是否执行完毕,默认会来一次，可以直接跳过，skip表示跳过第一次信号。
    [[command.executing skip:1] subscribeNext:^(id x) {
       
        if ([x boolValue] == YES) {
            
            // 正在执行
            NSLog(@"正在执行");
            
        } else {
            
            // 执行完毕
            NSLog(@"执行完成");
        }
    }];
    
    // 5.执行命名
    [self.command execute:@1];
```

#### RACMulticastConnection
>用于当一个信号，被多次订阅时，为了保证创建信号时，避免多次调用创建信号中的block，造成副作用，可以使用这个类处理。

注意：RACMulticastConnection通过RACSignal的-publish或者-muticast:方法创建.



RACMulticastConnection使用步骤:

1. 创建信号 + (RACSignal *)createSignal:(RACDisposable * (^)(id<RACSubscriber> subscriber))didSubscribe
2. 创建连接 RACMulticastConnection *connect = [signal publish];
3. 订阅信号,注意：订阅的不在是之前的信号，而是连接的信号。 [connect.signal subscribeNext:nextBlock]
4. 连接 [connect connect]

RACMulticastConnection底层原理:

1. 创建connect，connect.sourceSignal -> RACSignal(原始信号)  connect.signal -> RACSubject
2. 订阅connect.signal，会调用RACSubject的subscribeNext，创建订阅者，而且把订阅者保存起来，不会执行block。
3. [connect connect]内部会订阅RACSignal(原始信号)，并且订阅者是RACSubject
	1. 订阅原始信号，就会调用原始信号中的didSubscribe
	2. didSubscribe，拿到订阅者调用sendNext，其实是调用RACSubject的sendNext
4. RACSubject的sendNext,会遍历RACSubject所有订阅者发送信号。
	- 因为刚刚第二步，都是在订阅RACSubject，因此会拿到第二步所有的订阅者，调用他们的nextBlock


需求：假设在一个信号中发送请求，每次订阅一次都会发送请求，这样就会导致多次请求。

解决：使用RACMulticastConnection就能解决.


问题：每次订阅一次都会发送请求

```
// 创建请求信号
RACSignal *signal = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
    
    NSLog(@"发送请求");
    [subscriber sendNext:@1];
    
    return nil;
}];

// 订阅信号
[signal subscribeNext:^(id x) {
    
    NSLog(@"接受数据: %@", x);
}];

// 再次订阅信号，会再次执行发送请求，也就是每次订阅都会发送一次请求
[signal subscribeNext:^(id x) {
    
    NSLog(@"接受数据: %@", x);
}];
```

输出：

```
2016-12-28 11:37:04.397 ReactiveCacoa[1505:340573] 发送请求
2016-12-28 11:37:04.398 ReactiveCacoa[1505:340573] 接受数据: 1
2016-12-28 11:37:04.398 ReactiveCacoa[1505:340573] 发送请求
2016-12-28 11:37:04.398 ReactiveCacoa[1505:340573] 接受数据: 1
```
可以发现每次订阅都会重新发送请求.

下面我们使用RACMulticastConnection：

```
RACSignal *signal = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
    
    NSLog(@"发送请求");
    [subscriber sendNext:@1];
    
    return nil;
}];

// 创建连接
RACMulticastConnection *connect = [signal publish];

// 订阅信号
// 注意：订阅信号，也不能激活信号，只是保存订阅者到数组，必须通过连接，当调用连接，就会一次性调用所有订阅者的SendNext
[connect.signal subscribeNext:^(id x) {
    
    NSLog(@"订阅者1信号: %@", x);
}];

[connect.signal subscribeNext:^(id x) {
    
    NSLog(@"订阅者2信号: %@", x);
}];

// 连接、激活信号
[connect connect];

```

输出：

```
2016-12-28 11:37:04.399 ReactiveCacoa[1505:340573] 发送请求
2016-12-28 11:37:04.399 ReactiveCacoa[1505:340573] 订阅者1信号: 1
2016-12-28 11:37:04.399 ReactiveCacoa[1505:340573] 订阅者2信号: 1
```
#### RACScheduler
>RAC中的队列，用GCD封装的。

#### RACUnit
>表⽰stream不包含有意义的值,也就是看到这个，可以直接理解为nil.

#### RACEven
>把数据包装成信号事件(signal event)。它主要通过RACSignal的-materialize来使用，然并卵。


# ReactiveCocoa开发中常见用法

1. 替换代理			
2. 替换KVO
3. 监听事件
4. 替换通知
5. 监听文本框文字改变
6. 统一处理多个网络请求



#### 替换代理：

**rac_signalForSelector:**

`rac_signalForSelector:` 直接监听 `Selector` 事件的调用

应用场景：监听 `RedViewController` 中按钮的点击事件 `btnTap:`

跳转到`RedViewController`前，先使用`rac_signalForSelector`订阅rvc中的 btnTap: 点击事件

```
// 使用segue跳转
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
- 
    if ([segue.identifier isEqualToString:@"goRedVC"]) {
        
        RedViewController *rvc = segue.destinationViewController;
        
        // 订阅rvc中的 btnTap: 点击事件
        [[rvc rac_signalForSelector:@selector(btnTap:)] subscribeNext:^(id x) {
        
            NSLog(@"RedVC btnTap！");
        }];
    }
}
```

`RedViewController.m` 中的按钮事件

```
- (IBAction)btnTap:(id)sender {
    
    NSLog(@"!");
}
```

#### 替换KVO

**rac_valuesForKeyPath:**

```
// KVO
// 监听 slider 的 value 变化
[[self.slider rac_valuesForKeyPath:@"value" observer:nil] subscribeNext:^(id x) {

    NSLog(@"slider value Change：%@", x);
}];
```

#### 监听事件

**rac_signalForControlEvents:**

```
// 监听 btn 的 UIControlEventTouchUpInside 点击事件
[[self.btn rac_signalForControlEvents:UIControlEventTouchUpInside] subscribeNext:^(id x) {
    
    NSLog(@"btnTap");
}];
```


#### 监听 textField 文字变化

**rac_textSignal**

```
[[self.textField rac_textSignal] subscribeNext:^(id x) {
        
	NSLog(@"textField change: %@", x);
}];
```

#### 统一处理多个网络请求

**rac_liftSelector:**

```
- (void)viewDidLoad {
    [super viewDidLoad];
    
	// 处理多个请求都返回结果的时候，统一处理
    // 如同时进行多个网络请求，每个请求都正确返回时，再去刷新页面
    
    RACSignal *signalOne = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        // 网络请求1
        // ...
        
        // 返回成功
        [subscriber sendNext:@"网络请求1 data"];
        
        return nil;
    }];
    
    RACSignal *signalTwo = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        // 网络请求2
        // ...
        
        // 返回成功
        [subscriber sendNext:@"网络请求2 data"];
        
        return nil;
    }];
    
    [self rac_liftSelector:@selector(updateWithR1:R2:) withSignalsFromArray:@[signalOne, signalTwo]];
    
}

// 更新界面
- (void)updateWithR1:(id)r1 R2:(id)r2 {

    NSLog(@"R1:%@, R2：%@ 完成！", r1, r2);
    
}
```


#### **注意**：

- `替换KVO`和 `监听文本框文字改变` 方法在创建监听方法时就会执行一次。
	
	```
2016-12-28 16:53:50.746 ReactiveCacoa[4956:1246592] slider value Change：0.5
2016-12-28 16:53:50.748 ReactiveCacoa[4956:1246592] textField change:
```

- 使用`rac_liftSelector`时 `@selector(updateWithR1:R2:) `中的方 **参数个数** 要与 **signal个数** 相同，否则会被断言Crash！

