---
layout:     post
title:      map的find和count的分析
date:       2021-02-25
author:     Yukun SHANG
catalog: 	 true
tags:
    - C/C++
---

# map的find和count的分析



### 用法

* count，返回的是被查找元素的个数。因为map中不存在相同元素，所以返回值只能是1或0。

```c++
if(m.count(tmp) > 0){ // found
	// to do 
}
```

* find，返回的是被查找元素的位置，没有找到则返回map.end()。

```c++
if(m.find(tmp) != m.end()){ // found
	// to do 
}
```



### 复杂度分析

find 和count的时间复杂度都是O(logN)级别的

但是在其他方面find 的效率比count更高一点（猜测是除了map等，其他可能会有重复的元素，那么count就需要继续检索）





### 内容拓展

其实count 和find 是C++ STL里面的方法，set也可以用。

map和set都是通过红黑树实现





[stl容器中count与find的区别](https://blog.csdn.net/wxn704414736/article/details/79044099?utm_source=blogxgwz9&utm_medium=distribute.pc_relevant.none-task-blog-baidujs_title-3&spm=1001.2101.3001.4242)

[C++ STL各容器的实现，时间复杂度，适用情况分析](https://www.cnblogs.com/yinbiao/p/11636405.html)



# 