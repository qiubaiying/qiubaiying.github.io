---
layout:     post
title:      在 Swift 中使用 IBInspectable
subtitle:   IBInspectable 在 Swift 中的实际应用
date:       2017-05-05
author:     BY
header-img: img/post-bg-swift.jpg
catalog: true
tags:
    - iOS
    - Swift
    - IBInspectable
---


> 本文首次发布于 [BY Blog](http://qiubaiying.github.io), 作者 [@柏荧(BY)](http://github.com/qiubaiying) ,转载请保留原文链接.

# 前言

通过 IB 设置 控件 的属性非常的方便。

![](https://ww3.sinaimg.cn/large/006tNc79gy1ff9fpog0vrj30ho084t9m.jpg)

但是缺点也很明显，那就是有一些属性没有暴露在 IB 的设置面板中。这时候就要使用 `@IBInspectable` 在 IB 面板中添加这些没有的属性。

关于在 OC 中使用 `IBInspectable` 可以看一下我的 [这篇文章](http://qiubaiying.top/2016/12/01/%E5%BF%AB%E9%80%9F%E6%B7%BB%E5%8A%A0%E5%9C%86%E8%A7%92%E5%92%8C%E6%8F%8F%E8%BE%B9/#高级)

# 正文

在项目中最常遇到的情况是为 view 设置圆角、描边，以及为 文本控件 添加本地化字符串。

## 圆角、描边

先来看看设置圆角、描边

```swift
extension UIView {
    @IBInspectable var cornerRadius: CGFloat {
        get {
            return layer.cornerRadius
        }
        
        set {
            layer.cornerRadius = newValue
            layer.masksToBounds = newValue > 0
        }
    }
    
    @IBInspectable var borderWidth: CGFloat {
        get {
            return layer.borderWidth
        }
        set {
            layer.borderWidth = newValue > 0 ? newValue : 0
        }
    }
    
    @IBInspectable var borderColor: UIColor {
        get {
            return UIColor(cgColor: layer.borderColor!)
        }
        set {
            layer.borderColor = newValue.cgColor
        }
    }
    
}
```

添加完成就可以在 IB 中设置 view 的这些属性了

![](https://ww4.sinaimg.cn/large/006tNc79gy1ff9h5afhv2j30f803ajri.jpg)

运行效果

![](https://ww3.sinaimg.cn/large/006tNc79gy1ff9h70z922j30ag061wf7.jpg)

## 利用 @IBDesignable 在 IB 中实时显示 @IBInspectable 的样式

创建一个新的 class 继承 `UIView` ，并且使用 `@IBDesignable` 声明

```swift
import UIKit

@IBDesignable class IBDesignableView: UIView {

}
```

在 IB 中，选择 view 的 class 为 我们新建的 `IBDesignableView`



![](https://ww1.sinaimg.cn/large/006tNc79gy1ff9hs6z5q1j30fr03vweu.jpg)

这样在 IB 调整属性时，这些属性的变化就会实时显示在 IB 中。


## 本地化字符串

本地化字符串的解决方法和上面的添加圆角一样

```swift
extension UILabel {
    @IBInspectable var localizedKey: String? {
        set {
            guard let newValue = newValue else { return }
            text = NSLocalizedString(newValue, comment: "")
        }
        get { return text }
    }
}

extension UIButton {
    @IBInspectable var localizedKey: String? {
        set {
            guard let newValue = newValue else { return }
            setTitle(NSLocalizedString(newValue, comment: ""), for: .normal)
        }
        get { return titleLabel?.text }
    }
}

extension UITextField {
    @IBInspectable var localizedKey: String? {
        set {
            guard let newValue = newValue else { return }
            placeholder = NSLocalizedString(newValue, comment: "")
        }
        get { return placeholder }
    }
}
```

这样，在 IB 中我们就可以利用对应类型的 Localized Key 来直接设置本地化字符串了：

![](https://ww1.sinaimg.cn/large/006tNc79gy1ff9h94um01j30aj01vjre.jpg)



# 结语

`IBInspectable` 可以使用这些的类型

- `Int`
- `CGFloat`
- `Double`
- `String`
- `Bool`
- `CGPoint`
- `CGSize`
- `CGRect`
- `UIColor`
- `UIImage`

合理的使用`@IBInspectable` 能减少很多的模板代码，提高我们的开发效率。

> 参考
> 
> -  [《再看关于 Storyboard 的一些争论》](https://onevcat.com/2017/04/storyboard-argue/)
> - [《@IBDesignable and @IBInspectable in Swift 3》](https://medium.com/@Anantha1992/ibdesignable-and-ibinspectable-in-swift-3-702d7dd00ca)