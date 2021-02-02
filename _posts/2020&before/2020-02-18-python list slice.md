---
layout:     post
title:      python list slice
date:       2020-10-26
author:     Yukun SHANG
catalog: 	 true
tags:
    - python
---

# python list slice

### Case:

As for 2-d list, such as matrix:

```
import numpy as np
a=np.arange(9).reshape(3,3)
```

a :
```
array([[0, 1, 2],
       [3, 4, 5],
       [6, 7, 8]])
```

a[1]:
```
array([3, 4, 5])
```
a[1,:]:
```
array([3, 4, 5])
```


a[1,2]:
```
5
```
a[:,1]:
```
array([1, 4, 7])
```
a[1:,1]:
```
array([4, 7])
```
a[:2,1]:
```
array([1, 4])
```
a[:,0:2];
```
array([[0, 1],
       [3, 4],
       [6, 7]])
```