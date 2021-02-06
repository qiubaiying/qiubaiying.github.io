---
layout:     post
title:      anaconda tips
date:       2019-11-18
author:     Yukun SHANG
catalog: 	 true
tags:
    - Tools

---

# anaconda tips

```python
#查看conda版本
conda -V
#查看环境信息
conda info --envs
#建立环境
conda create -n [name] python=3.7
#删除环境
conda remove -n [name] --all
#激活环境
conda activate nesa
#离开环境
conda deactivate
#在环境中安装pytorch
pip install torch torchvision
```

