---
layout:     post
title:      memset & memcpy
date:       2021-01-10
author:     Yukun SHANG
catalog: 	 true
tags:
    - Research
---

# memset & memcpy

## memset

**void \*memset(void \*str, int c, size_t n)** 复制字符 **c**（一个无符号字符）到参数 **str** 所指向的字符串的前 **n** 个字符。

memset的头文件：

```c++
#include<memory.h>
// or
#include<string.h>
```

memset可以用于赋值和初始化数组

因为char是**1字节**，memset是按照字节赋值的，所以，相当于把每个字节都设为输入的那个数。例如：

```c++
memset(dp,0,sizeof(dp));  
```

int类型的变量一般占用4个字节，对每一个字节赋值0的话就变成了`00000000 00000000 000000000 00000000`

```c++
memset(dp,-1,sizeof(dp));  
```

赋值为-1的话，放的是`11111111 11111111 11111111 11111111 `

```c++
memset(dp,1,sizeof(dp));  
```

以上代码执行后，dp数组的内容为 00000001 00000001 00000001 00000001 转化为十进制后不为1

### 常用的memset操作

```c++
memset(a,127,sizeof(a))
```

将数组的全部元素,初始化为一个很大的数

```c++
memset(a,128,sizeof(a))
```

将数组的全部元素,初始化为一个很小的数



## memcpy

 **void \*memcpy(void \*str1, const void \*str2, size_t n)** 从存储区 **str2** 复制 **n** 个字节到存储区 **str1**。

例子（来自菜鸟教程）

```c++
#include <stdio.h>
#include<string.h>
 
int main()
 
{
  char *s="http://www.runoob.com";
  char d[20];
  memcpy(d, s+11, 6);// 从第 11 个字符(r)开始复制，连续复制 6 个字符(runoob)
  // 或者 memcpy(d, s+11*sizeof(char), 6*sizeof(char));
  d[6]='\0';
  printf("%s", d);
  return 0;
}
```

结果：

```
runoob
```





## Reference

[C++中memset()函数的用法详解](https://blog.csdn.net/lyj2014211626/article/details/65481630)

