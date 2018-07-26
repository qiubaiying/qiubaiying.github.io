---
layout:     post
title:      GCD 在 Swift 中的用法
subtitle:   
date:       2017-10-04
author:     BY
header-img: img/home-bg-art.jpg
catalog: true
tags:
    - iOS
    - Swift
    - GCD
---


## DispatchQueue

Swift 中，对 GCD 语法进行了彻底改写。引入了 `DispatchQueue` 这个类。

先来看看在一个异步队列中读取数据， 然后再返回主线程更新 UI， 这种操作在新的 Swift 语法中是这样的：

```swift
DispatchQueue.global().async {

    DispatchQueue.main.async {

		// 更新UI操作

    }

}

```

`DispatchQueue.global().async` 相当于使用全局队列进行异步操作。然后在调用 `DispatchQueue.main.async` 使用主线程更新相应的 UI 内容。

## 优先级

新的 GCD 引入了 QoS (Quality of Service) 的概念。

先看看下面的代码：

```swift
DispatchQueue.global(qos: .userInitiated).async {

}

```


QoS 对应的就是 `Global Queue` 中的优先级。 其优先级由最低的 `background` 到最高的 `userInteractive` 共五个，还有一个未定义的 `unspecified`。

```swift
public static let background: DispatchQoS

public static let utility: DispatchQoS

public static let `default`: DispatchQoS

public static let userInitiated: DispatchQoS

public static let userInteractive: DispatchQoS

public static let unspecified: DispatchQoS
```

## 自定义 Queue

除了直接使用 `DispatchQueue.global().async` 这种封装好的代码外，还可以通过`DispatchWorkItem` 自定义队列的优先级，特性：

```swift
let queue = DispatchQueue(label: "swift_queue")
let dispatchworkItem = DispatchWorkItem(qos: .userInitiated, flags: .inheritQoS) {
    
}
queue.async(execute: dispatchworkItem)

```
## GCD定时器

Swift 中 `dispatch_time`的用法改成了：

```swift
let delay = DispatchTime.now() + .seconds(60)
DispatchQueue.main.asyncAfter(deadline: delay) { 
    
}
```

相较与OC来说更易读了：

```objc
let dispatch_time = dispatch_time(DISPATCH_TIME_NOW, Int64(60 * NSEC_PER_SEC))
```

- 参考 [GCD 在 Swift 3 中的玩儿法](https://www.swiftcafe.io/2016/10/16/swift-gcd/)