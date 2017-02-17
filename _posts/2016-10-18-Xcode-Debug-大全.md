---
layout:     post
title:      Xcode Debug 大全
subtitle:   iOS开发中利用 Xcode 各种调试Bug方法
date:       2016-10-18
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - iOS
    - 开发技巧
    - Debug
---


# 前言

>BUG,简单来说就是程序运行结果与预期的不同，下面来说说Xcode中的DEBUG方法
>
>[参考博文](http://www.cnblogs.com/daiweilai/p/4421340.html#quanjuduandian)



# 断点调试

- 普通断点
- 全局断点
- 条件断点

#### 1.普通断点
看图

![](http://ww4.sinaimg.cn/large/65e4f1e6gw1f8rti38wlxj20ke0d3n0h.jpg)

当程序运行到断点处时会停下，然后进行单步调试
![](http://images.cnitblog.com/blog2015/680363/201504/131002381048966.png)


#### 2.全局断点

当程序运行出现崩溃时，就会自动断点到出现crash的代码行

![](http://images.cnitblog.com/blog2015/680363/201504/130933043392329.png)

#### 3.条件断点


我们如果在一个循环里面使用了断点，如果这个循环执行了100万次，那你的断点要执行那么多次，你不觉得蛋蛋都凉了的忧伤么？所以我们这么做：

编辑断点

![](http://ww1.sinaimg.cn/large/65e4f1e6gw1f8rw64yys0j207i03laah.jpg)

添加条件Condition

![](http://ww2.sinaimg.cn/large/65e4f1e6gw1f8rw52q1tjj20ct04lmxo.jpg)


![](http://ww3.sinaimg.cn/large/65e4f1e6gw1f8rw44p4ykj20ln0g10vg.jpg)

还可以Action中在条件断点触发时执行事件

![](http://ww3.sinaimg.cn/large/65e4f1e6gw1f8rwq16872j20cv07amyg.jpg)

如：输出信息

![](http://ww2.sinaimg.cn/large/65e4f1e6gw1f8rwms50t3j20dj07bjso.jpg)

#### 4.方法断点

# 打印调试（NSLog）

尽管ARC已经让内存管理变得简单、省时和高效，但是在object的life-cycles中跟踪一些重要事件依然十分重要。毕竟ARC并没有完全排除内存泄露的可能性，或者试图访问一个被release的对象。

- NSLog

强化NSLog

```
//A better version of NSLog
#define NSLog(format, ...) do { \
fprintf(stderr, "<%s : %d> %s\n", \
[[[NSString stringWithUTF8String:__FILE__] lastPathComponent] UTF8String], \
__LINE__, __func__); \
(NSLog)((format), ##__VA_ARGS__); \
fprintf(stderr, "-------\n"); \
} while (0)
```
控制台输出

```
<ViewController.m : 32> -[ViewController viewDidLoad]
2016-10-14 17:33:31.022 DEUBG[12852:1238167] Hello World！
-------
```

利用NSString输出多种类型

![](http://ww4.sinaimg.cn/large/65e4f1e6gw1f8rxvn6fqlj20nc05cgoh.jpg)

- 开启僵尸对象

Xcode可以把那些已经release掉得对象，变成“僵尸”，当我们访问一个Zombie对象时，Xcode可以告诉我们正在访问的对象是一个不应该存在的对象了。因为Xcode知道这个对象是什么，所以可以让我们知道这个对象在哪里，以及这是什么时候发生的。
所以Zombies是你的好基友！他可以让你输出的信息更具体！

具体这样做：(僵尸只能用在模拟器和OC语言)

![](http://images.cnitblog.com/blog2015/680363/201504/130941016986159.png)

# 控制台(lldb 命令)



LLDB 是一个有着 REPL 的特性和 C++ ,Python 插件的开源调试器。LLDB 绑定在 Xcode 内部，存在于主窗口底部的控制台中。调试器允许你在程序运行的特定时暂停它，你可以查看变量的值，执行自定的指令，并且按照你所认为合适的步骤来操作程序的进展。(这里有一个关于调试器如何工作的总体的解释。)

你以前有可能已经使用过调试器，即使只是在 Xcode 的界面上加一些断点。但是通过一些小的技巧，你就可以做一些非常酷的事情。GDB to LLDB 参考是一个非常好的调试器可用命令的总览。你也可以安装 Chisel，它是一个开源的 LLDB 插件合辑，这会使调试变得更加有趣。

参考：

[与调试器共舞 - LLDB 的华尔兹](http://objccn.io/issue-19-2/)

[LLDB调试命令初探](http://www.starfelix.com/blog/2014/03/17/lldbdiao-shi-ming-ling-chu-tan/)

[About LLDB and Xcode](https://developer.apple.com/library/content/documentation/IDEs/Conceptual/gdb_to_lldb_transition_guide/document/Introduction.html)

[The LLDB Debugger](http://lldb.llvm.org/tutorial.html)

#### 基础
###### *help*
在控制台输入`help`，显示控制台支持的lldb命令

###### *print*
打印值

缩写`p` 

print是 `expression --` 的缩写


![](http://ww4.sinaimg.cn/large/006y8lVagw1f8vakv88vuj30b204s74x.jpg)

printk可以指定格式打印
如
`默认 p`

`十六进制 p/x`、

`二进制 p/t`

```
(lldb) p 16
16

(lldb) p/x 16
0x10

(lldb) p/t 16
0b00000000000000000000000000010000

(lldb) p/t (char)16
0b00010000

```
你也可以使用 p/c 打印字符，或者 p/s 打印以空终止的字符串  p/d打印ACRSII(译者注：以 '\0' 结尾的字符串)。

完整清单[点击查看](https://sourceware.org/gdb/onlinedocs/gdb/Output-Formats.html)


###### *po*

打印对象，是 `e -o --`的缩写

###### *expression*

#### 流程控制

当你通过 Xcode 的源码编辑器的侧边槽 (或者通过下面的方法) 插入一个断点，程序到达断点时会就会停止运行。

调试条上会出现四个你可以用来控制程序的执行流程的按钮。

![](https://objccn.io/images/issues/issue-19/Image_2014-11-22_at_10.37.45_AM.png)

从左到右，四个按钮分别是：continue，step over，step into，step out。

第一个，continue 按钮，会取消程序的暂停，允许程序正常执行 (要么一直执行下去，要么到达下一个断点)。在 LLDB 中，你可以使用 process continue 命令来达到同样的效果，它的别名为 continue，或者也可以缩写为 c。

第二个，step over 按钮，会以黑盒的方式执行一行代码。如果所在这行代码是一个函数调用，那么就不会跳进这个函数，而是会执行这个函数，然后继续。LLDB 则可以使用 thread step-over，next，或者 n 命令。

如果你确实想跳进一个函数调用来调试或者检查程序的执行情况，那就用第三个按钮，step in，或者在LLDB中使用 thread step in，step，或者 s 命令。注意，当前行不是函数调用时，next 和 step 效果是一样的。

大多数人知道 c，n 和 s，但是其实还有第四个按钮，step out。如果你曾经不小心跳进一个函数，但实际上你想跳过它，常见的反应是重复的运行 n 直到函数返回。其实这种情况，step out 按钮是你的救世主。它会继续执行到下一个返回语句 (直到一个堆栈帧结束) 然后再次停止。

###### frame info

会告诉你当前的行数和源码文件

```
(lldb) frame info
frame #0: 0x000000010a53bcd4 DebuggerDance`main + 68 at main.m:17

```

###### Thread Return 
调试时，还有一个很棒的函数可以用来控制程序流程：thread return 。它有一个可选参数，在执行时它会把可选参数加载进返回寄存器里，然后立刻执行返回命令，跳出当前栈帧。这意味这函数剩余的部分不会被执行。这会给 ARC 的引用计数造成一些问题，或者会使函数内的清理部分失效。但是在函数的开头执行这个命令，是个非常好的隔离这个函数，伪造返回值的方式 。

`(lldb) thread return NO`

#### 不用断点调试

在程序运行时，点击暂停按钮,即可进入调试状态，能对全局变量做操作

![](http://ww4.sinaimg.cn/large/006y8lVagw1f8vd4vy66ej307300xjr8.jpg)


# 工具调试(instruments)
instruments Xcode自带许多工具供大家使用，打开方式如下图：

![](http://ww1.sinaimg.cn/large/006y8lVagw1f8ve05g45cj30qd0f276o.jpg)

**leaks**内存泄漏检查工具

![](http://ww4.sinaimg.cn/large/006y8lVagw1f8ve5wnnr6j30li0c1wgd.jpg)

运行后查看

![](http://ww4.sinaimg.cn/large/006y8lVagw1f8vebiu6r5j30se0kdqcr.jpg)

# 视图调试

启用视图调试:运行app过程中，按下底部的Debug View Hierarchy 按钮，或者从菜单中选择Debug > View Debugging > Capture View Hierarchy 来启动视图调试。

![](http://ww1.sinaimg.cn/large/006y8lVagw1f8vejy3rmgj30by01kmx8.jpg)

启动视图调试后，Xcode会对应用程序的视图层次拍一个快照并展示三维原型视图来探究用户界面的层级。该三维视图除了展示app的视图层次外，还展示每个视图的位置、顺序和视图尺寸，以及视图间的交互方式。

# 模拟器调试

编译并运行应用程序，选中模拟器，从 Debug菜单中选择Color Blended Layers选项。

![](http://ww2.sinaimg.cn/large/006y8lVagw1f8vezdqlh1j3092075dgz.jpg)

然后会看到app的用户界面被红色和绿色覆盖，显示了哪些图层可以被叠加覆盖，以及哪些图层是透明的。混合层属于计算密集型视图，所以推荐尽可能地使用不透明的图层。

![](http://ww3.sinaimg.cn/large/006y8lVagw1f8vf07u522j30ag0j1q36.jpg)

# 结语
目前所知道的调试方法大概就是上面这几种了，若有什么有趣的方法，请和我分享哈！


