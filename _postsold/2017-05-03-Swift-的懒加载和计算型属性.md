---
layout:     post
title:      Swift 的懒加载和计算型属性
subtitle:   比较水的个人笔记
date:       2017-05-03
author:     BY
header-img: img/post-bg-swift.jpg
catalog: true
tags:
    - iOS
    - Swift
    - Swift语法
---


> 本文首次发布于 [BY Blog](http://qiubaiying.github.io), 作者 [@柏荧(BY)](http://github.com/qiubaiying) ,转载请保留原文链接.

### 懒加载

常规（简化）写法

懒加载的属性用 `var` 声明

```
lazy var name: String = {
	return "BY"
}()
```

完整写法

```
lazy var name: String = { () -> String i
	return "BY"
}()
```

本质是一个创建一个闭包 `{}` 并且在调用该属性时执行闭包 `()`。

如OC的懒加载不同的是 swift 懒加载闭包只调用一次，再次调用该属性时因为属性已经创建，不再执行闭包。

### 计算型属性

常规写法

```
var name: string {
	return "BY"
}
```

完整写法 

```
var name: string {
	get {
		return "BY"
	}
}
```

计算型属性本质是重写了 `get` 方法，其类似一个无参有返回值函数，每次调用该属性都会执行 `return`

通常这样使用

```
struct Cuboid {
    var width = 0.0, height = 0.0, depth = 0.0
    var volume: Double {
        return width * height * depth
    }
}
let fourByFiveByTwo = Cuboid(width: 4.0, height: 5.0, depth: 2.0)
print("the volume of fourByFiveByTwo is \(fourByFiveByTwo.volume)")
// Prints "the volume of fourByFiveByTwo is 40.0"
```

### 两者对比

相同点

- 使用方法完全一致
- 都是用 `var` 声明

不同点

- 实现原理不同

	懒加载是第一次调用属性时执行闭包进行赋值

	计算型属性是重写 `get` 方法

- 调用 `{}`的次数不同

	懒加载的闭包只在属性第一次调用时执行
	计算型属性每次调用都要进入 `{}` 中，`return` 新的值
