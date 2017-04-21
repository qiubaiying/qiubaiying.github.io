---
layout:     post
title:      ReactiveCocoa 进阶
subtitle:   函数式编程框架 ReactiveCocoa 进阶
date:       2017-01-06
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - iOS
    - ReactiveCocoa
    - 函数式编程
    - 开源框架
---
# 前言

>在[上篇文章](http://qiubaiying.github.io/2016/12/26/ReactiveCocoa-基础/)中介绍了**ReactiveCocoa**的基础知识,接下来我们来深入介绍**ReactiveCocoa**及其在**MVVM**中的用法。


![ReactiveCocoa进阶思维导图](https://ww3.sinaimg.cn/large/006y8lVagw1fbgye3re5xj30je0iomz8.jpg)
# 常见操作方法介绍


#### 操作须知

所有的信号（RACSignal）都可以进行操作处理，因为所有操作方法都定义在RACStream.h中，因此只要继承RACStream就有了操作处理方法。
#### 操作思想

运用的是Hook（钩子）思想，Hook是一种用于改变API(应用程序编程接口：方法)执行结果的技术.

Hook用处：截获API调用的技术。

有关Hook的知识可以看我的这篇博客[《Objective-C Runtime 的一些基本使用》](http://www.jianshu.com/p/ff114e69cc0a)中的 *更换代码的实现方法* 一节,

Hook原理：在每次调用一个API返回结果之前，先执行你自己的方法，改变结果的输出。

#### 操作方法

#### **bind**（绑定）- ReactiveCocoa核心方法

**ReactiveCocoa** 操作的核心方法是 **bind**（绑定）,而且也是RAC中核心开发方式。之前的开发方式是赋值，而用RAC开发，应该把重心放在绑定，也就是可以在创建一个对象的时候，就绑定好以后想要做的事情，而不是等赋值之后在去做事情。

列如，把数据展示到控件上，之前都是重写控件的 `setModel` 方法，用RAC就可以在一开始创建控件的时候，就绑定好数据。

- **作用**

	RAC底层都是调用**bind**， 在开发中很少直接使用 **bind** 方法，**bind**属于RAC中的底层方法，我们只需要调用封装好的方法，**bind**用作了解即可.

- **bind方法使用步骤**
     1. 传入一个返回值 `RACStreamBindBlock` 的 block。
     2. 描述一个 `RACStreamBindBlock` 类型的 `bindBlock`作为block的返回值。
     3. 描述一个返回结果的信号，作为 `bindBlock` 的返回值。
     
     注意：在bindBlock中做信号结果的处理。
- 	**bind方法参数**
	
	**RACStreamBindBlock**:
`typedef RACStream * (^RACStreamBindBlock)(id value, BOOL *stop);`

     `参数一(value)`:表示接收到信号的原始值，还没做处理
     
     `参数二(*stop)`:用来控制绑定Block，如果*stop = yes,那么就会结束绑定。
     
     `返回值`：信号，做好处理，在通过这个信号返回出去，一般使用 `RACReturnSignal`,需要手动导入头文件`RACReturnSignal.h`

- **使用**

	假设想监听文本框的内容，并且在每次输出结果的时候，都在文本框的内容拼接一段文字“输出：”

	- 使用封装好的方法：在返回结果后，拼接。

		```
		[_textField.rac_textSignal subscribeNext:^(id x) {
		
			// 在返回结果后，拼接 输出：
			NSLog(@"输出:%@",x);
		
		}];
		```


	- 方式二:，使用RAC中 `bind` 方法做处理，在返回结果前，拼接。
	  
		这里需要手动导入`#import <ReactiveCocoa/RACReturnSignal.h>`，才能使用`RACReturnSignal`

		```	
		[[_textField.rac_textSignal bind:^RACStreamBindBlock{
		   // 什么时候调用:
		   // block作用:表示绑定了一个信号.
		
		   return ^RACStream *(id value, BOOL *stop){
		
		       // 什么时候调用block:当信号有新的值发出，就会来到这个block。
		
		       // block作用:做返回值的处理
		
		       // 做好处理，在返回结果前，拼接 输出:
		       return [RACReturnSignal return:[NSString stringWithFormat:@"输出:%@",value]];
		   };
		
		}] subscribeNext:^(id x) {
		
		   NSLog(@"%@",x);
		
		}];

		```

- **底层实现**
     1. 源信号调用bind,会重新创建一个绑定信号。
     2. 当绑定信号被订阅，就会调用绑定信号中的 `didSubscribe` ，生成一个 `bindingBlock` 。
     3. 当源信号有内容发出，就会把内容传递到 `bindingBlock` 处理，调用`bindingBlock(value,stop)`
     4. 调用`bindingBlock(value,stop)`，会返回一个内容处理完成的信号`RACReturnSignal`。
     5. 订阅`RACReturnSignal`，就会拿到绑定信号的订阅者，把处理完成的信号内容发送出来。
    
     注意:不同订阅者，保存不同的nextBlock，看源码的时候，一定要看清楚订阅者是哪个。

#### 映射

映射主要用这两个方法实现：**flattenMap**,**Map**,用于把源信号内容映射成新的内容。

###### flattenMap

- **作用**

	把源信号的内容映射成一个新的信号，信号可以是任意类型

- **使用步骤**

     1. 传入一个block，block类型是返回值`RACStream`，参数value
     2. 参数value就是源信号的内容，拿到源信号的内容做处理
     3. 包装成`RACReturnSignal`信号，返回出去。



- **使用**

	监听文本框的内容改变，把结构重新映射成一个新值.
	
	```
	[[_textField.rac_textSignal flattenMap:^RACStream *(id value) {
        
        // block调用时机：信号源发出的时候
        
        // block作用：改变信号的内容
        
        // 返回RACReturnSignal
        return [RACReturnSignal return:[NSString stringWithFormat:@"信号内容：%@", value]];
        
    }] subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
    ```
- **底层实现**

     0. **flattenMap**内部调用 `bind` 方法实现的,**flattenMap**中block的返回值，会作为bind中bindBlock的返回值。
     1. 当订阅绑定信号，就会生成 `bindBlock`。
     2. 当源信号发送内容，就会调用` bindBlock(value, *stop)`
     3. 调用`bindBlock`，内部就会调用 **flattenMap** 的 bloc k，**flattenMap** 的block作用：就是把处理好的数据包装成信号。
     4. 返回的信号最终会作为 `bindBlock` 中的返回信号，当做 `bindBlock` 的返回信号。
     5. 订阅 `bindBlock` 的返回信号，就会拿到绑定信号的订阅者，把处理完成的信号内容发送出来。
	
###### Map

- **作用**
 
	把源信号的值映射成一个新的值

	
- **使用步骤**
     1. 传入一个block,类型是返回对象，参数是 `value`
     2. `value`就是源信号的内容，直接拿到源信号的内容做处理
     3. 把处理好的内容，直接返回就好了，不用包装成信号，返回的值，就是映射的值。
    
- **使用**

	监听文本框的内容改变，把结构重新映射成一个新值.
     
    ```
	[[_textField.rac_textSignal map:^id(id value) {
       
       // 拼接完后，返回对象
        return [NSString stringWithFormat:@"信号内容: %@", value];
        
    }] subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
	```
- **底层实现**:
     0. Map底层其实是调用 `flatternMa`p,`Map` 中block中的返回的值会作为 `flatternMap` 中block中的值
     1. 当订阅绑定信号，就会生成 `bindBlock` 
     3. 当源信号发送内容，就会调用 `bindBlock(value, *stop)`
     4. 调用 `bindBlock` ，内部就会调用 `flattenMap的block`
     5. `flattenMap的block` 内部会调用 `Map` 中的block，把 `Map` 中的block返回的内容包装成返回的信号
     5. 返回的信号最终会作为 `bindBlock` 中的返回信号，当做 `bindBlock` 的返回信号
     6. 订阅 `bindBlock` 的返回信号，就会拿到绑定信号的订阅者，把处理完成的信号内容发送出来。

###### FlatternMap 和 Map 的区别
-  **FlatternMap** 中的Block **返回信号**。 
2. **Map** 中的Block **返回对象**。
3. 开发中，如果信号发出的值 **不是信号** ，映射一般使用 `Map`
4. 如果信号发出的值 **是信号**，映射一般使用 `FlatternMap`。



- `signalOfsignals`用 **FlatternMap**

	```
    // 创建信号中的信号
    RACSubject *signalOfsignals = [RACSubject subject];
    RACSubject *signal = [RACSubject subject];

    [[signalOfsignals flattenMap:^RACStream *(id value) {

     // 当signalOfsignals的signals发出信号才会调用

        return value;

    }] subscribeNext:^(id x) {

        // 只有signalOfsignals的signal发出信号才会调用，因为内部订阅了bindBlock中返回的信号，也就是flattenMap返回的信号。
        // 也就是flattenMap返回的信号发出内容，才会调用。

        NSLog(@"signalOfsignals：%@",x);
    }];

    // 信号的信号发送信号
    [signalOfsignals sendNext:signal];

    // 信号发送内容
    [signal sendNext:@"hi"];
	
	```
	
#### 组合

组合就是将多个信号按照某种规则进行拼接，合成新的信号。

###### concat

- **作用** 

	按**顺序拼接**信号，当多个信号发出的时候，有顺序的接收信号。
- **底层实现**
     1. 当拼接信号被订阅，就会调用拼接信号的didSubscribe
     2. didSubscribe中，会先订阅第一个源信号（signalA）
     3. 会执行第一个源信号（signalA）的didSubscribe
     4. 第一个源信号（signalA）didSubscribe中发送值，就会调用第一个源信号（signalA）订阅者的nextBlock,通过拼接信号的订阅者把值发送出来.
     5. 第一个源信号（signalA）didSubscribe中发送完成，就会调用第一个源信号（signalA）订阅者的completedBlock,订阅第二个源信号（signalB）这时候才激活（signalB）。
     6. 订阅第二个源信号（signalB）,执行第二个源信号（signalB）的didSubscribe
     7. 第二个源信号（signalA）didSubscribe中发送值,就会通过拼接信号的订阅者把值发送出来.
- **使用步骤**

	1. 使用`concat:`拼接信号
	2. 订阅拼接信号，内部会自动按拼接顺序订阅信号
- **使用**

	拼接信号 `signalA`、 `signalB`、 `signalC`
	
	```
	RACSignal *signalA = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"Hello"];
        
        [subscriber sendCompleted];
        
        return nil;
    }];
    
    RACSignal *signalB = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"World"];
        
        [subscriber sendCompleted];
        
        return nil;
    }];
    
    RACSignal *signalC = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"!"];
        
        [subscriber sendCompleted];
        
        return nil;
    }];
    
    // 拼接 A B, 把signalA拼接到signalB后，signalA发送完成，signalB才会被激活。
    RACSignal *concatSignalAB = [signalA concat:signalB];
    
    // A B + C
    RACSignal *concatSignalABC = [concatSignalAB concat:signalC];
    
    
    // 订阅拼接的信号, 内部会按顺序订阅 A->B->C
    // 注意：第一个信号必须发送完成，第二个信号才会被激活...
    [concatSignalABC subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
	```

######  then
- **作用** 

	用于连接两个信号，当第一个信号完成，才会连接then返回的信号。
- **底层实现**
	
	1. 先过滤掉之前的信号发出的值
	2. 使用concat连接then返回的信号
	
- **使用**

	```
   [[[RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
      
      [subscriber sendNext:@1];
      
      [subscriber sendCompleted];
      
      return nil;
      
    }] then:^RACSignal *{
      
      	return [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
          
          [subscriber sendNext:@2];
          
          return nil;
      }];
      
    }] subscribeNext:^(id x) {
      
      // 只能接收到第二个信号的值，也就是then返回信号的值
      NSLog(@"%@", x);
      
    }];
    
    ///
    输出：2
	```
- **注意**

	注意使用`then`，之前信号的值会被忽略掉.

###### merge
- **作用** 
	
	合并信号,任何一个信号发送数据，都能监听到.
- **底层实现**

     1. 合并信号被订阅的时候，就会遍历所有信号，并且发出这些信号。
     2. 每发出一个信号，这个信号就会被订阅
     3. 也就是合并信号一被订阅，就会订阅里面所有的信号。
     4. 只要有一个信号被发出就会被监听。
- **使用**

	```
	RACSignal *signalA = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"A"];
        
        return nil;
    }];

    RACSignal *signalB = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"B"];
        
        return nil;
    }];

    // 合并信号, 任何一个信号发送数据，都能监听到
    RACSignal *mergeSianl = [signalA merge:signalB];

    [mergeSianl subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
    
    // 输出
	2017-01-03 13:29:08.013 ReactiveCocoa进阶[3627:718315] A
	2017-01-03 13:29:08.014 ReactiveCocoa进阶[3627:718315] B

    
	```

###### zip

- **作用** 
	
	把两个信号压缩成一个信号，只有当两个信号 **同时** 发出信号内容时，并且把两个信号的内容合并成一个元组，才会触发压缩流的next事件。
- **底层实现**
	
	1. 定义压缩信号，内部就会自动订阅signalA，signalB
	2. 每当signalA或者signalB发出信号，就会判断signalA，signalB有没有发出个信号，有就会把每个信号 第一次 发出的值包装成元组发出
	     
- **使用**

	```
	RACSignal *signalA = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"A1"];
        [subscriber sendNext:@"A2"];
        
        return nil;
    }];
    
    RACSignal *signalB = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"B1"];
        [subscriber sendNext:@"B2"];
        [subscriber sendNext:@"B3"];
        
        return nil;
    }];
    
    RACSignal *zipSignal = [signalA zipWith:signalB];
    
    [zipSignal subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
	
	// 输出
	2017-01-03 13:48:09.234 ReactiveCocoa进阶[3997:789720] zipWith: <RACTuple: 0x600000004df0> (
    A1,
    B1
	)
	2017-01-03 13:48:09.234 ReactiveCocoa进阶[3997:789720] zipWith: <RACTuple: 0x608000003410> (
    A2,
    B2
	)
	```
	
	
###### combineLatest
- **作用** 
	
	将多个信号合并起来，并且拿到各个信号最后一个值,必须每个合并的signal至少都有过一次sendNext，才会触发合并的信号。

- **底层实现**
	
 	1. 当组合信号被订阅，内部会自动订阅signalA，signalB,必须两个信号都发出内容，才会被触发。
 	2. 并且把两个信号的 最后一次 发送的值组合成元组发出。
	     
- **使用**

	```
	RACSignal *signalA = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"A1"];
        [subscriber sendNext:@"A2"];
        
        return nil;
    }];
    
    RACSignal *signalB = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"B1"];
        [subscriber sendNext:@"B2"];
        [subscriber sendNext:@"B3"];
        
        return nil;
    }];
    
    RACSignal *combineSianal = [signalA combineLatestWith:signalB];
    
    [combineSianal subscribeNext:^(id x) {
        
        NSLog(@"combineLatest:%@", x);
    }];
	
	// 输出
	2017-01-03 13:48:09.235 ReactiveCocoa进阶[3997:789720] combineLatest:<RACTuple: 0x60800000e150> (
    A2,
    B1
	)
	2017-01-03 13:48:09.235 ReactiveCocoa进阶[3997:789720] combineLatest:<RACTuple: 0x600000004db0> (
    A2,
    B2
	)
	2017-01-03 13:48:09.236 ReactiveCocoa进阶[3997:789720] combineLatest:<RACTuple: 0x60800000e180> (
    A2,
    B3
	)
	```
	
- **注意**

	**combineLatest**与**zip**用法相似，必须每个合并的signal至少都有过一次sendNext，才会触发合并的信号。
	
	区别看下图：
	
	![](https://ww2.sinaimg.cn/large/006y8lVagw1fbdf6cyez6j30id0kkabf.jpg)


###### reduce   

- **作用** 
	
	把信号发出元组的值聚合成一个值
- **底层实现**
	
 	1. 订阅聚合信号，
 	2. 每次有内容发出，就会执行reduceblcok，把信号内容转换成reduceblcok返回的值。
	     
- **使用**

     常见的用法，（先组合在聚合）`combineLatest:(id<NSFastEnumeration>)signals reduce:(id (^)())reduceBlock`
     
     reduce中的block简介:
     
     reduceblcok中的参数，有多少信号组合，reduceblcok就有多少参数，每个参数就是之前信号发出的内容
     reduceblcok的返回值：聚合信号之后的内容。



	```
	    RACSignal *signalA = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"A1"];
        [subscriber sendNext:@"A2"];
        
        return nil;
    }];
    
    RACSignal *signalB = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"B1"];
        [subscriber sendNext:@"B2"];
        [subscriber sendNext:@"B3"];
        
        return nil;
    }];
    
    
    RACSignal *reduceSignal = [RACSignal combineLatest:@[signalA, signalB] reduce:^id(NSString *str1, NSString *str2){
        
        return [NSString stringWithFormat:@"%@ %@", str1, str2];
    }];
    
    [reduceSignal subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
    
    // 输出
    2017-01-03 15:42:41.803 ReactiveCocoa进阶[4248:1264674] A2 B1
	2017-01-03 15:42:41.803 ReactiveCocoa进阶[4248:1264674] A2 B2
	2017-01-03 15:42:41.803 ReactiveCocoa进阶[4248:1264674] A2 B3
    
	```
	
#### 过滤

过滤就是过滤信号中的 特定值 ，或者过滤指定 发送次数 的信号。

###### filter

- **作用**

	过滤信号，使用它可以获取满足条件的信号.
	
	block的返回值是Bool值，返回`NO`则过滤该信号
	
- **使用**

	```
	// 过滤:
	// 每次信号发出，会先执行过滤条件判断.
	[[_textField.rac_textSignal filter:^BOOL(NSString *value) {
        
        NSLog(@"原信号: %@", value);

        // 过滤 长度 <= 3 的信号
        return value.length > 3;
        
    }] subscribeNext:^(id x) {
        
        NSLog(@"长度大于3的信号：%@", x);
    }];
    
    // 在_textField中输出12345
	// 输出
	2017-01-03 16:36:54.938 ReactiveCocoa进阶[4714:1552910] 原信号: 1
	2017-01-03 16:36:55.383 ReactiveCocoa进阶[4714:1552910] 原信号: 12
	2017-01-03 16:36:55.706 ReactiveCocoa进阶[4714:1552910] 原信号: 123
	2017-01-03 16:36:56.842 ReactiveCocoa进阶[4714:1552910] 原信号: 1234
	2017-01-03 16:36:56.842 ReactiveCocoa进阶[4714:1552910] 长度大于3的信号：1234
	2017-01-03 16:36:58.350 ReactiveCocoa进阶[4714:1552910] 原信号: 12345
	2017-01-03 16:36:58.351 ReactiveCocoa进阶[4714:1552910] 长度大于3的信号：12345
	```
	
###### ignore

- **作用**

	忽略某些信号.
	
- **使用**

- **作用**

	忽略某些值的信号.
	
	底层调用了 `filter` 与 过滤值进行比较，若相等返回则 `NO`
	
- **使用**

	```
  	// 内部调用filter过滤，忽略掉字符为 @“1”的值
[[_textField.rac_textSignal ignore:@"1"] subscribeNext:^(id x) {

 	 NSLog(@"%@",x);
}];


	```

###### distinctUntilChanged

- **作用**

	当上一次的值和当前的值有明显的变化就会发出信号，否则会被忽略掉。
	
- **使用**

	```
	[[_textField.rac_textSignal distinctUntilChanged] subscribeNext:^(id x) {
        
        NSLog(@"%@",x);
    }];
	```
	
###### skip	

- **作用**

	跳过 **第N次** 的发送的信号.
	
- **使用**
	
	```
// 表示输入第一次，不会被监听到，跳过第一次发出的信号
[[_textField.rac_textSignal skip:1] subscribeNext:^(id x) {

   NSLog(@"%@",x);
}];
	```



##### take
- **作用**

	取 **前N次** 的发送的信号.
- **使用**

	```
	RACSubject *subject = [RACSubject subject] ;
    
    // 取 前两次 发送的信号
    [[subject take:2] subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
    
    [subject sendNext:@1];
    [subject sendNext:@2];
    [subject sendNext:@3];
    
    // 输出
	2017-01-03 17:35:54.566 ReactiveCocoa进阶[4969:1677908] 1
	2017-01-03 17:35:54.567 ReactiveCocoa进阶[4969:1677908] 2
	```

###### takeLast

- **作用**

	取 **最后N次** 的发送的信号
	
	前提条件，订阅者必须调用完成 `sendCompleted`，因为只有完成，就知道总共有多少信号.
	
- **使用**	

	```
	RACSubject *subject = [RACSubject subject] ;
    
    // 取 后两次 发送的信号
    [[subject takeLast:2] subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
    
    [subject sendNext:@1];
    [subject sendNext:@2];
    [subject sendNext:@3];
    
    // 必须 跳用完成
    [subject sendCompleted];
	```

###### takeUntil

- **作用**

	获取信号直到某个信号执行完成
- **使用**	

	```
	// 监听文本框的改变直到当前对象被销毁
[_textField.rac_textSignal takeUntil:self.rac_willDeallocSignal];
	```
	
###### switchToLatest
- **作用**

	用于signalOfSignals（信号的信号），有时候信号也会发出信号，会在signalOfSignals中，获取signalOfSignals发送的最新信号。
	
- **注意**

	switchToLatest：只能用于信号中的信号

- **使用**	

	```
	RACSubject *signalOfSignals = [RACSubject subject];
    RACSubject *signal = [RACSubject subject];
    
    // 获取信号中信号最近发出信号，订阅最近发出的信号。
    [signalOfSignals.switchToLatest subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
    
    [signalOfSignals sendNext:signal];
    [signal sendNext:@1];
	```

#### 秩序

秩序包括 `doNext` 和 `doCompleted` 这两个方法，主要是在 执行`sendNext` 或者 `sendCompleted`之前，先执行这些方法中Block。

###### doNext 
	
执行`sendNext`之前，会先执行这个`doNext`的 Block

###### doCompleted

执行`sendCompleted`之前，会先执行这`doCompleted`的`Block`

```
[[[[RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
    
    [subscriber sendNext:@"hi"];
    
    [subscriber sendCompleted];
    
    return nil;
    
}] doNext:^(id x) {
    
    // 执行 [subscriber sendNext:@"hi"] 之前会调用这个 Block
    NSLog(@"doNext");
    
}] doCompleted:^{
    
    // 执行 [subscriber sendCompleted] 之前会调用这 Block
    NSLog(@"doCompleted");
}] subscribeNext:^(id x) {
    
    NSLog(@"%@", x);
}];
    

```

#### 线程

**ReactiveCocoa** 中的线程操作 包括 `deliverOn` 和 `subscribeOn`这两种，将 *传递的内容* 或 创建信号时 *block中的代码* 切换到指定的线程中执行。

###### deliverOn

- **作用**

	内容传递切换到制定线程中，副作用在原来线程中,把在创建信号时block中的代码称之为副作用。
- **使用**

	```
	// 在子线程中执行
	dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        
        [[[RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
            NSLog(@"%@", [NSThread currentThread]);
            
            [subscriber sendNext:@123];
            
            [subscriber sendCompleted];
            
            return nil;
        }]
          deliverOn:[RACScheduler mainThreadScheduler]]
          
         subscribeNext:^(id x) {
         
             NSLog(@"%@", x);
             
             NSLog(@"%@", [NSThread currentThread]);
         }];
    });
    
    // 输出
2017-01-04 10:35:55.415 ReactiveCocoa进阶[1183:224535] <NSThread: 0x608000270f00>{number = 3, name = (null)}
2017-01-04 10:35:55.415 ReactiveCocoa进阶[1183:224482] 123
2017-01-04 10:35:55.415 ReactiveCocoa进阶[1183:224482] <NSThread: 0x600000079bc0>{number = 1, name = main}
	```
	
	可以看到`副作用`在 *子线程* 中执行，而 `传递的内容` 在 *主线程* 中接收


###### subscribeOn
- **作用**

	**subscribeOn**则是将 `内容传递` 和 `副作用` 都会切换到指定线程中
- **使用**

	```
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        
        [[[RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
            NSLog(@"%@", [NSThread currentThread]);
            
            [subscriber sendNext:@123];
            
            [subscriber sendCompleted];
            
            return nil;
        }]
          subscribeOn:[RACScheduler mainThreadScheduler]] //传递的内容到主线程中
         subscribeNext:^(id x) {
         
             NSLog(@"%@", x);
             
             NSLog(@"%@", [NSThread currentThread]);
         }];
    });	
	//
2017-01-04 10:44:47.558 ReactiveCocoa进阶[1243:275126] <NSThread: 0x608000077640>{number = 1, name = main}
2017-01-04 10:44:47.558 ReactiveCocoa进阶[1243:275126] 123
2017-01-04 10:44:47.558 ReactiveCocoa进阶[1243:275126] <NSThread: 0x608000077640>{number = 1, name = main}
	```
	
	`内容传递` 和 `副作用` 都切换到了 *主线程* 执行
	
#### 时间

时间操作就会设置信号超时，定时和延时。

###### interval 定时
- **作用**

	定时：每隔一段时间发出信号
	
	```
	// 每隔1秒发送信号，指定当前线程执行
	[[RACSignal interval:1 onScheduler:[RACScheduler currentScheduler]] subscribeNext:^(id x) {
        
        NSLog(@"定时:%@", x);
    }];
    
	// 输出
	2017-01-04 13:48:55.196 ReactiveCocoa进阶[1980:492724] 定时:2017-01-04 05:48:55 +0000
	2017-01-04 13:48:56.195 ReactiveCocoa进阶[1980:492724] 定时:2017-01-04 05:48:56 +0000
	2017-01-04 13:48:57.196 ReactiveCocoa进阶[1980:492724] 定时:2017-01-04 05:48:57 +0000
	```


###### timeout 超时

- **作用**

	超时，可以让一个信号在一定的时间后，自动报错。
	
	```
	RACSignal *signal = [[RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        // 不发送信号，模拟超时状态
        // [subscriber sendNext:@"hello"];
        //[subscriber sendCompleted];
        
        return nil;
    }] timeout:1 onScheduler:[RACScheduler currentScheduler]];// 设置1秒超时
    
    [signal subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    } error:^(NSError *error) {
        
        NSLog(@"%@", error);
    }];
    
    // 执行代码 1秒后 输出：
    2017-01-04 13:48:55.195 ReactiveCocoa进阶[1980:492724] Error Domain=RACSignalErrorDomain Code=1 "(null)"
	```

###### delay 延时
- **作用**

	延时，延迟一段时间后发送信号
	
	```
	RACSignal *signal2 = [[[RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@"延迟输出"];
        
        return nil;
    }] delay:2] subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
    
    // 执行代码 2秒后 输出
    2017-01-04 13:55:23.751 ReactiveCocoa进阶[2030:525038] 延迟输出
	```


#### 重复

###### retry

- **作用**

	重试：只要 发送错误 `sendError:`,就会 重新执行 创建信号的Block 直到成功
	
	```
	__block int i = 0;
    
    [[[RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        if (i == 5) {
            
            [subscriber sendNext:@"Hello"];
            
        } else {
            
            // 发送错误
            NSLog(@"收到错误:%d", i);
            [subscriber sendError:nil];
        }
        
        i++;
        
        return nil;
        
    }] retry] subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
        
    } error:^(NSError *error) {
        
        NSLog(@"%@", error);
        
    }];

	// 输出
2017-01-04 14:36:51.594 ReactiveCocoa进阶[2443:667226] 收到错误信息:0
2017-01-04 14:36:51.595 ReactiveCocoa进阶[2443:667226] 收到错误信息:1
2017-01-04 14:36:51.595 ReactiveCocoa进阶[2443:667226] 收到错误信息:2
2017-01-04 14:36:51.596 ReactiveCocoa进阶[2443:667226] 收到错误信息:3
2017-01-04 14:36:51.596 ReactiveCocoa进阶[2443:667226] 收到错误信息:4
2017-01-04 14:36:51.596 ReactiveCocoa进阶[2443:667226] Hello

	```

###### replay

- **作用**

	重放：当一个信号被多次订阅,反复播放内容
	
	```
	RACSignal *signal = [[RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        
        [subscriber sendNext:@1];
        [subscriber sendNext:@2];
        
        return nil;
    }] replay];
    
    [signal subscribeNext:^(id x) {
        NSLog(@"%@", x);
    }];
    
    [signal subscribeNext:^(id x) {
        NSLog(@"%@", x);
    }];
    
    // 输出
2017-01-04 14:51:01.934 ReactiveCocoa进阶[2544:706740] 1
2017-01-04 14:51:01.934 ReactiveCocoa进阶[2544:706740] 2
2017-01-04 14:51:01.934 ReactiveCocoa进阶[2544:706740] 1
2017-01-04 14:51:01.935 ReactiveCocoa进阶[2544:706740] 2
	```


###### throttle

- **作用**

	节流:当某个信号发送比较频繁时，可以使用节流，在某一段时间不发送信号内容，过了一段时间获取信号的最新内容发出。
	
	```
	RACSubject *subject = [RACSubject subject];
    
    // 节流1秒，1秒后接收最后一个发送的信号
    [[subject throttle:1] subscribeNext:^(id x) {
        
        NSLog(@"%@", x);
    }];
    
    [subject sendNext:@1];
    [subject sendNext:@2];
    [subject sendNext:@3];
    
    // 输出
    2017-01-04 15:02:37.543 ReactiveCocoa进阶[2731:758193] 3
	```

# MVVM架构思想
---
程序为什么要有架构？便于程序开发与维护.

#### 常见的架构
- **MVC**

	M:模型 V:视图 C:控制器

- **MVVM**

	M:模型 V:视图+控制器 VM:视图模型

- **MVCS**

	 M:模型 V:视图 C:控制器 C:服务类

- [**VIPER**](http://www.cocoachina.com/ios/20140703/9016.html)

	V:视图 I:交互器 P:展示器 E:实体 R:路由

#### MVVM介绍

- 模型(M):保存视图数据。

- 视图+控制器(V):展示内容 + 如何展示

- 视图模型(VM):处理展示的业务逻辑，包括按钮的点击，数据的请求和解析等等。

# 实战一：登录界面

#### 需求
1. 监听两个文本框的内容
2. 有内容登录按键才允许按钮点击
3. 返回登录结果

#### 分析
1. 界面的所有业务逻辑都交给控制器做处理
2. 在MVVM架构中把控制器的业务全部搬去VM模型，也就是每个控制器对应一个VM模型.

#### 步骤
1. 创建LoginViewModel类，处理登录界面业务逻辑.
2. 这个类里面应该保存着账号的信息，创建一个账号Account模型
3. LoginViewModel应该保存着账号信息Account模型。
4. 需要时刻监听Account模型中的账号和密码的改变，怎么监听？
5. 在非RAC开发中，都是习惯赋值，在RAC开发中，需要改变开发思维，由赋值转变为绑定，可以在一开始初始化的时候，就给Account模型中的属性绑定，并不需要重写set方法。
6. 每次Account模型的值改变，就需要判断按钮能否点击，在VM模型中做处理，给外界提供一个能否点击按钮的信号.
7. 这个登录信号需要判断Account中账号和密码是否有值，用KVO监听这两个值的改变，把他们聚合成登录信号.
8. 监听按钮的点击，由VM处理，应该给VM声明一个RACCommand，专门处理登录业务逻辑.
9. 执行命令，把数据包装成信号传递出去
10. 监听命令中信号的数据传递
11. 监听命令的执行时刻



#### 运行效果

![登录界面](https://ww3.sinaimg.cn/large/006y8lVagw1fbgvoh8yu6j30bj0l43yz.jpg)

#### 代码

`MyViewController.m`

```
#import "MyViewController.h"
#import "LoginViewModel.h"

@interface MyViewController ()

@property (nonatomic, strong) LoginViewModel *loginViewModel;

@property (weak, nonatomic) IBOutlet UITextField *accountField;

@property (weak, nonatomic) IBOutlet UITextField *pwdField;

@property (weak, nonatomic) IBOutlet UIButton *loginBtn;

@end

@implementation MyViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    [self bindModel];
    
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}



// 视图模型绑定
- (void)bindModel {

    // 给模型的属性绑定信号
    //
    RAC(self.loginViewModel.account, account) = _accountField.rac_textSignal;
    RAC(self.loginViewModel.account, pwd) = _pwdField.rac_textSignal;
    
    RAC(self.loginBtn, enabled) = self.loginViewModel.enableLoginSignal;
    
    // 监听登录点击
    [[_loginBtn rac_signalForControlEvents:UIControlEventTouchUpInside] subscribeNext:^(id x) {
        
        [self.loginViewModel.LoginCommand execute:nil];
    }];
    
}
- (IBAction)btnTap:(id)sender {
    
    
}

#pragma mark - lazyLoad

- (LoginViewModel *)loginViewModel {
    
    if (nil == _loginViewModel) {
        _loginViewModel = [[LoginViewModel alloc] init];
    }
    
    return _loginViewModel;
}
```	
		
`LoginViewModel.h`

```
#import <UIKit/UIKit.h>

@interface Account : NSObject

@property (nonatomic, strong) NSString *account;
@property (nonatomic, strong) NSString *pwd;

@end


@interface LoginViewModel : UIViewController

@property (nonatomic, strong) Account *account;

// 是否允许登录的信号
@property (nonatomic, strong, readonly) RACSignal *enableLoginSignal;

@property (nonatomic, strong, readonly) RACCommand *LoginCommand;

@end

```

`LoginViewModel.m`

```
#import "LoginViewModel.h"

@implementation Account

@end


@interface LoginViewModel ()

@end

@implementation LoginViewModel

- (instancetype)init {
    
    if (self = [super init]) {
        [self initialBind];
    }
    return self;
}

- (void)initialBind {

    // 监听账号属性改变， 把他们合成一个信号
    _enableLoginSignal = [RACSubject combineLatest:@[RACObserve(self.account, account), RACObserve(self.account, pwd)] reduce:^id(NSString *accout, NSString *pwd){
        
        return @(accout.length && pwd.length);
    }];
    
    // 处理业务逻辑
    _LoginCommand = [[RACCommand alloc] initWithSignalBlock:^RACSignal *(id input) {
        
        NSLog(@"点击了登录");
        return [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
            
            // 模仿网络延迟

            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                
                // 返回登录成功 发送成功信号
                [subscriber sendNext:@"登录成功"];
            });
            
            return nil;
        }];
    }];
    
    
    // 监听登录产生的数据
    [_LoginCommand.executionSignals.switchToLatest subscribeNext:^(id x) {
       
        if ([x isEqualToString:@"登录成功"]) {
            NSLog(@"登录成功");
        }
        
    }];
    
    [[_LoginCommand.executing skip:1] subscribeNext:^(id x) {
        
        if ([x isEqualToNumber:@(YES)]) {
            
            NSLog(@"正在登陆...");
        } else {
            
        // 登录成功
        NSLog(@"登陆成功");
        
        }
        
    }];
}

#pragma mark - lazyLoad

- (Account *)account
{
    if (_account == nil) {
        _account = [[Account alloc] init];
    }
    return _account;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
}

@end

```

# 实战二：网络请求数据

#### 需求
1. 请求一段网络数据，将请求到的数据在`tableView`上展示
2. 该数据为豆瓣图书的搜索返回结果，URL：url:https://api.douban.com/v2/book/search?q=悟空传

#### 分析
1. 界面的所有业务逻辑都交给**控制器**做处理
2. 网络请求交给**MV**模型处理

#### 步骤

1. 控制器提供一个视图模型（requesViewModel），处理界面的业务逻辑
2. VM提供一个命令，处理请求业务逻辑
3. 在创建命令的block中，会把请求包装成一个信号，等请求成功的时候，就会把数据传递出去。
4. 请求数据成功，应该把字典转换成模型，保存到视图模型中，控制器想用就直接从视图模型中获取。

#### 其他

网络请求与图片缓存用到了[AFNetworking](https://github.com/AFNetworking/AFNetworking) 和 [SDWebImage](https://github.com/rs/SDWebImage),自行在Pods中导入。

```
platform :ios, '8.0'

target 'ReactiveCocoa进阶' do

use_frameworks!
pod 'ReactiveCocoa', '~> 2.5'
pod 'AFNetworking'
pod 'SDWebImage'
end
```

#### 运行效果

![](https://ww3.sinaimg.cn/large/006y8lVagw1fbgw1xnz74j30bj0l4408.jpg)


#### 代码

`SearchViewController.m`

```
#import "SearchViewController.h"
#import "RequestViewModel.h"

@interface SearchViewController ()<UITableViewDataSource>

@property (nonatomic, strong) UITableView *tableView;

@property (nonatomic, strong) RequestViewModel *requesViewModel;

@end

@implementation SearchViewController

- (RequestViewModel *)requesViewModel
{
    if (_requesViewModel == nil) {
        _requesViewModel = [[RequestViewModel alloc] init];
    }
    return _requesViewModel;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    
    self.tableView = [[UITableView alloc] initWithFrame:self.view.frame];
    
    self.tableView.dataSource = self;
    
    [self.view addSubview:self.tableView];
    
    //
    RACSignal *requesSiganl = [self.requesViewModel.reuqesCommand execute:nil];
    
    [requesSiganl subscribeNext:^(NSArray *x) {
        
        self.requesViewModel.models = x;
        
        [self.tableView reloadData];
    }];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return self.requesViewModel.models.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *ID = @"cell";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:ID];
    if (cell == nil) {
        
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:ID];
    }
    
    Book *book = self.requesViewModel.models[indexPath.row];
    cell.detailTextLabel.text = book.subtitle;
    cell.textLabel.text = book.title;
    
    [cell.imageView sd_setImageWithURL:[NSURL URLWithString:book.image] placeholderImage:[UIImage imageNamed:@"cellImage"]];
    
    
    return cell;
}
@end
```

`RequestViewModel.h`

```
#import <Foundation/Foundation.h>

@interface Book : NSObject

@property (nonatomic, copy) NSString *subtitle;
@property (nonatomic, copy) NSString *title;
@property (nonatomic, copy) NSString *image;

@end

@interface RequestViewModel : NSObject

// 请求命令
@property (nonatomic, strong, readonly) RACCommand *reuqesCommand;

//模型数组
@property (nonatomic, strong) NSArray *models;


@end
```

`RequestViewModel.m`

```
#import "RequestViewModel.h"

@implementation Book

- (instancetype)initWithValue:(NSDictionary *)value {
    
    if (self = [super init]) {
        
        self.title = value[@"title"];
        self.subtitle = value[@"subtitle"];
        self.image = value[@"image"];
    }
    return self;
}

+ (Book *)bookWithDict:(NSDictionary *)value {
    
    return [[self alloc] initWithValue:value];
}



@end

@implementation RequestViewModel

- (instancetype)init
{
    if (self = [super init]) {
        
        [self initialBind];
    }
    return self;
}


- (void)initialBind
{
    _reuqesCommand = [[RACCommand alloc] initWithSignalBlock:^RACSignal *(id input) {
        
      RACSignal *requestSiganl = [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
          
          NSMutableDictionary *parameters = [NSMutableDictionary dictionary];
          parameters[@"q"] = @"悟空传";
          
          //
          [[AFHTTPSessionManager manager] GET:@"https://api.douban.com/v2/book/search" parameters:parameters progress:^(NSProgress * _Nonnull downloadProgress) {
              
              NSLog(@"downloadProgress: %@", downloadProgress);
          } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
              
              // 数据请求成功就讲数据发送出去
              NSLog(@"responseObject:%@", responseObject);
              
              [subscriber sendNext:responseObject];
              
              [subscriber sendCompleted];
              
          } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
              
              NSLog(@"error: %@", error);
          }];
          
          
         return nil;
      }];
        
        // 在返回数据信号时，把数据中的字典映射成模型信号，传递出去
        return [requestSiganl map:^id(NSDictionary *value) {
            
            NSMutableArray *dictArr = value[@"books"];
            
            NSArray *modelArr = [[dictArr.rac_sequence map:^id(id value) {
                
                return [Book bookWithDict:value];
                
            }] array];
            
            return modelArr;
            
        }];
        
    }];
}


@end

```

>最后附上GitHub：<https://github.com/qiubaiying/ReactiveCocoa_Demo>
