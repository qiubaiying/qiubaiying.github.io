---
layout:     post   				    # 使用的布局（不需要改）
title:       pwn的安装及基础知识			# 标题 
#subtitle:   脚本，xss #副标题
date:       2020-03-18 				# 时间
author:     s-seven 						# 作者
header-img: img/post-bg-2015.jpg 	#这篇文章标题背景图片
catalog: true 						# 是否归档
tags:								#标签
    - 基础知识
---

今天没做出题来，本来想做一下pwn的题，发现要配环境，无奈在安装pwntools的时候碰到了各种error，到现在也没安装好，中途Ubuntu升级还黑屏了，还好我有快照恢复了一下。于是今天就看了一些关于pwn的基础知识。

关于pwn，i春秋有一系列文章写得很好：[Linux pwn入门教程系列](https://bbs.ichunqiu.com/forum.php?mod=collection&action=view&ctid=157)

我没来得及看完，只看了前两篇文章。

睡前更新--------

害 原来安装pwn这么简单的事呀，之前我遇到的问题归根结底应该是同一个原因，就是下载源的问题。

ReadTimeoutError: HTTPSConnectionPool(host='files.pythonhosted.org', port=443): Read

在我报这个错误的时候有个帖子说这个容易被墙，所以要更改pip源，直接指定下载源

`pip install -i https://pypi.douban.com/simple <需要安装的包>`

所以我就是

`pip install -i https://pypi.douban.com/simple pwntools`

 然后。飞一般的感觉，就安好了！

在终端输入python进入其交互模式后，输入import pwn回车后没报错

这时候再尝试pwntools的asm功能

`pwn.asm("xor eax,eax")`
`'1\xc0'`

OKK!

##补课！

要想学pwn，需要一些前置基础，比如堆栈，比如在函数调用的时候，栈中的数据是怎么放的，比如各种寄存器，比如返回地址，还有汇编指令如ret,call

这是我需要补的东西

如寄存器

EIP寄存器保存的是下一条将要执行的指令，

ESP寄存器保存的是栈顶地址，始终指向栈顶，栈向低地址生长

EBP寄存器保存的是栈底地址

## 要解决什么问题

1、哪里有漏洞也就是我们能把自己的代码或者字符放到函数里并影响执行。

2、我们要让它执行什么。

漏洞一般是

1、gets函数这种对输入没有限制导致溢出。

2、格式化字符串漏洞。

3、数据类型转换的时候产生了溢出。

总的来说就是对输入的值限制的不够让用户的输入影响了执行流

 那么如何利用漏洞呢？      

 在linux中有一个system函数system("/bin/bash")这条语句就可以调出shell。让程序执行这个函数就能实现对shell的调用了。