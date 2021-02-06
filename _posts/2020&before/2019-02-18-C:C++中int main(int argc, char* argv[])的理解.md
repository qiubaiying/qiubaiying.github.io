---
layout:     post
title:      C/C++中main的参数的理解
date:       2019-01-18
author:     Yukun SHANG
catalog: 	 true
tags:
    - c
---

# C/C++中main的参数的理解

## int main(int argc, char* argv[])  

argc表示terminal输入参数的个数，包括文件名（自动获取数值）
argv是字符串指针，存放所有输入的命令字符
例如：
```cpp
#include <iostream>
using namespace std;
 int main(int argc, char* argv[])  
 {  
   int i;  
   for (i=0; i<argc; i++)  
   {
   		cout <<"argc = " << argc << endl;
   		cout<< "argv[" << i << "] = " <<argv[i]<<endl;  
   }
   return 0;  
 }

```


## vs 下的命令参数的设置

（突然图片不能插入了？？）配置属性->调试->命令参数，可以在里面进行设置。
需要注意的是，一般第一个是argv[0],但是vs会自动处理，所以如果输入1 2 3，那么main函数里面，argc是4， argv[1]是1
测试代码：

```cpp
#include<iostream>
using namespace std;
int main(int argc, char* argv[])
{
 cout << argc << endl;
 cout << argv[1];
}
```





## JAVA 和C的比较

* C中第0个参数是filename

* Java中第0个参数就是最开始的那个参数

