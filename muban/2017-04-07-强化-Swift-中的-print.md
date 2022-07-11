---
layout:     post
title:      强化 swift 中的 print
subtitle:   强化 swift 中的 print 输出函数
date:       2017-04-07
author:     BY
header-img: img/post-bg-universe.jpg
catalog: true
tags:
    - iOS
    - Swift
    - Xcode
    - Debug
---

在 Swift 中，最简单的输出方法就是使用 `print()`，在我们关心的地方输出字符串和值。

当程序变得非常复杂的时候，我们可能会输出很多内容，而想在其中寻找到我们希望的输出其实并不容易。我们往往需要更好更精确的输出，这包括输出这个 log 的文件，调用的行号以及所处的方法名字等等。

在 Swift 中，编译器为我们准备了几个很有用的编译符号，它们分别是：

<table><thead>
<tr>
<th>符号</th>
<th>类型</th>
<th>描述</th>
</tr>
</thead><tbody>
<tr>
<td>#file</td>
<td>String</td>
<td>包含这个符号的文件的路径</td>
</tr>
<tr>
<td>#line</td>
<td>Int</td>
<td>符号出现处的行号</td>
</tr>
<tr>
<td>#column</td>
<td>Int</td>
<td>符号出现处的列</td>
</tr>
<tr>
<td>#function</td>
<td>String</td>
<td>包含这个符号的方法名字</td>
</tr>
</tbody></table>


有了上面的这些编译符号，我们就可以自定义一个输出函数：`printm`

```swift
public func printm(items: Any..., filename: String = #file, function: String = #function, line: Int = #line) {
    print("[\((filename as NSString).lastPathComponent) \(line) \(function)]\n",items)
}
```

因为输出是一个很消耗性能的操作，所以在releass环境下需要将输出函数去掉，将上面的函数换成：

```swift
#if DEBUG

public func printm(items: Any..., filename: String = #file, function: String = #function, line: Int = #line) {
    print("[\((filename as NSString).lastPathComponent) \(line) \(function)]\n",items)
}

#else

public func printm(items: Any..., filename: String = #file, function: String = #function, line: Int = #line) { }

#endif
```

#### 参考:

- [《LOG 输出》](http://swifter.tips/log/) - 王巍 (@ONEVCAT)


> 本文首次发布于 [BY Blog](http://qiubaiying.github.io), 作者 [@柏荧(BY)](http://github.com/qiubaiying) ,转载请保留原文链接.