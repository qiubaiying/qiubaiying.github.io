---
layout:     post
title:      Magic Number
date:       2021-02-12
author:     Yukun SHANG
catalog: 	 true
tags:
    - C/C++

---

## Fast Inverse Square Root

```c
float InvSqrt(float x)
{
    float xhalf = 0.5f * x;
    int i = *(int *)&x;
    i = 0x5f3759df - (i>>1);
    x = *(float *)&i;
    x = x * (1.5f - xhalf * x * x);
    return x;
}


```

## Reference:

https://blog.csdn.net/lz0499/article/details/78238597

