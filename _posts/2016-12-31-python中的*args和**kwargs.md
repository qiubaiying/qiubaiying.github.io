---
layout:     post
title:      python中的*args和**kwargs
subtitle:   what is *args and **kwargs?
date:       2016-12-31
author:     Nico
header-img: img/post_bg_3.jpg
catalog: true
tags:
    - python
    - module
    - arguments
---

## 什么是*args和**kwargs

- *args: positional arguments;
- **kwargs: keyword arguments.

### default

```python
def test_defargs(one, two = 2):
    print 'Required argument: ', one
    print 'Optional argument: ', two

test_defargs(1)
# result:
# Required argument: 1
# Optional argument: 2

test_defargs(1, 3)
# result:
# Required argument: 1
# Optional argument: 3
```

### positional arguments

<code>*args</code>就是positional arguments；
positional arguments 必须位于 keyword arguments之前

```python
def f1(one, *args):
    print 'Required argument: ', one
    for i in args:
        print 'Optional argument: ', i

f1(1,2,3)
# result:
# Required argument: 1
# Optional argument: 2
# Optional argument: 3
```

### keyword arguments

对应的 <code>**kwargs</code> 就是 keyword arguments.

```python
def f1(one, *args, **kwargs):
    print 'Required argument: ', one
for i in args:
print 'Optional argument: ', i
for m, n in kwargs.items():
print 'Optional %s argument: %s' %(m, n)

f1(1,2,3,k1 = 5, k2 = 7)
# result:
# Required argument: 1
# Optional argument: 2
# Optional argument: 3
# Optional k2 argument: 7
# Optional k1 argument: 5
```

### 区别和混用

```python
def test_args(first, second, third, fourth, fifth):
    print 'First argument: ', first
    print 'Second argument: ', second
    print 'Third argument: ', third
    print 'Fourth argument: ', fourth
    print 'Fifth argument: ', fifth

# Use *args
args = [1, 2, 3, 4, 5]

test_args(*args)
# results:
# First argument: 1
# Second argument: 2
# Third argument: 3
# Fourth argument: 4
# Fifth argument: 5

# Use **kwargs
kwargs = {
'first': 1,
'second': 2,
'third': 3,
'fourth': 4,
'fifth': 5
}

test_args(**kwargs)
# results:
# First argument: 1
# Second argument: 2
# Third argument: 3
# Fourth argument: 4
# Fifth argument: 5
```
