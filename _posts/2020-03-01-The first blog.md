---
layout:     post
title:      第一篇博客
subtitle:   尝试
date:       2020-03-01
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: 	 true
tags:
    - iOS
    - 定时器
---

#2020-03-01 The first blog

# 0-100天随笔 #

语法糖（Syntactic sugar）是由英国计算机科学家彼得·蘭丁发明的一个术语，指计算机语言中添加的某种语法，这种语法对语言的功能没有影响，但是更方便程序员使用。 语法糖让程序更加简洁，有更高的可读性。

		a, b = 5, 10
		print('%d * %d = %d' % (a, b, a * b))

		a, b = 5, 10
		print('{0} * {1} = {2}'.format(a, b, a * b))

Python 3.6以后，格式化字符串还有更为简洁的书写方式，就是在字符串前加上字母f，我们可以使用下面的语法糖来简化上面的代码。

		a, b = 5, 10
		print(f'{a} * {b} = {a * b}')

**生成式和生成器**
我们还可以使用列表的生成式语法来创建列表，代码如下所示。

		f = [x for x in range(1, 10)]
		print(f)
		f = [x + y for x in 'ABCDE' for y in '1234567']
		print(f)
		# 用列表的生成表达式语法创建列表容器
		# 用这种语法创建列表之后元素已经准备就绪所以需要耗费较多的内存空间
		f = [x ** 2 for x in range(1, 1000)]
		print(sys.getsizeof(f))  # 查看对象占用内存的字节数
		print(f)
		# 请注意下面的代码创建的不是一个列表而是一个生成器对象
		# 通过生成器可以获取到数据但它不占用额外的空间存储数据
		# 每次需要数据的时候就通过内部的运算得到数据(需要花费额外的时间)
		f = (x ** 2 for x in range(1, 1000))
		print(sys.getsizeof(f))  # 相比生成式生成器不占用存储数据的空间
		print(f)
		for val in f:
		    print(val)
