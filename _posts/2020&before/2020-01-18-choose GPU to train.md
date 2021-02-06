---
layout:     post
title:      指定某块GPU去训练
date:       2020-01-18
author:     Yukun SHANG
catalog: 	 true
tags:
    - GPU
---

# 指定某块GPU去训练

查看GPU

```
nvidia-smi -L
```

查看1号GPU情况

```
nvidia-smi -q -i 1
```

指定2号GPU运行

```
CUDA_VISIBLE_DEVICES=2 python test.py
```

