---
layout:     post
title:      Swift 代理模式
subtitle:   Swift中如何使用代理模式
date:       2017-03-06
author:     BY
header-img: img/post-bg-ios10.jpg
catalog: true
tags:
    - iOS
    - Swift
    - 设计模式
---

> Xcode 8.2 | Swift 3.0

在iOS开发中，无论是 **Objective-C** 还是 **Swift** ，**Delegate** 有着具足轻重的位置，如`TabelViewDelegate` 与 `TableViewDataSource`。

**Swift** 中的代理模式 和 **Objective-C** 除了语法外，几乎一样。

## Objective-C 代理模式

在介绍 Swift 代理模式前，先来看回顾一下 Objective-C 中的代理模式如何实现

Objective-C 中用代理实现反向传值：

![](https://ww4.sinaimg.cn/large/006tKfTcgy1fdd51zf5cwg307i0dck3f.gif)

#### 委托方（子控制器）

委托方需要实现

- 创建协议 、声明协议方法

		@protocol SubViewDelegate <NSObject>
		
		- (void)backWithStr:(NSString *) str;

		@end
- 创建一个代理属性

		// weak声明
		@property (nonatomic, weak) id<SubViewDelegate> delegate;
- 执行协议方法

		// 判断代理是实现该方法，避免carsh
    	if ([self.delegate respondsToSelector:@selector(backWithStr:)]) {
         	[self.delegate backWithStr:self.textField.text];
         }


#### 代理方（主控制器）
代理方需要实现

- 遵守（继承）协议

		@interface ViewController () <SubViewDelegate>
- 将代理设为自己

		subVC.delegate = self;
- 实现代理方法

		- (void)backWithStr:(NSString *)str {
	    	self.label.text = str;
		}

## Swift 代理模式

Swift 代理模式 与 Objective-C 一样，只是语法不同。

Swift 中用代理实现反向传值：

![](https://ww1.sinaimg.cn/large/006tKfTcgy1fdd5oi9048g307i0dc7co.gif)

#### 委托方（子控制器）

- 创建协议 、声明协议方法

		protocol SubViewDelegate {
	    func backStr(str: String)
		}	
- 创建一个代理属性

		var delegate: SubViewDelegate?
- 执行协议方法

		/// 执行代理方法，将值回传
        delegate?.backStr(str: textField.text ?? "")
        
#### 代理方(主控制器)
- 继承协议

		class ViewController: UIViewController, SubViewDelegate
- 将代理设为自己

		subVC.delegate = self
		
- 实现代理方法

	```swift
	func backStr(str: String) {
        self.textF.text = str
    }
    ```
    
    
## 总结

对比可以方法 Swift 代理模式 与 Objective-C 用法完全相同，只是语法发生了变化。

值得一提的是Swift 的扩展 `extension`可以用来继承协议,实现代码隔离，便于维护。

```swift
/// 使用扩展继承协议 实现协议方法 可以分离代码
extension ViewController: SubViewDelegate{
    /// 实现代理方法
    func backStr(str: String) {
        self.textF.text = str
    }
}
```


## Demo源码

最后附上[Demo源码](https://github.com/qiubaiying/iOS-Delegate_Demo)

如果对你有帮助的话，**Star**✨下一吧！



