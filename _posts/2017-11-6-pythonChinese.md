---
layout:     post
title:      python filepath including Chinese character error
subtitle:   python
date:       2017-11-2
author:     Shine
header-img: img/home-bg-art.jpg
catalog: true
tags:
    
- python 


---

add following to the top:

```
#!/usr/bin/python
#-*-coding:utf-8 -*-

```
 
or use like following:
```
filepath=unicode('E:\课题\深度学习\codemeterial\代码与素材\代码与素材(1)\DTree\AllElectronics.csv','utf8')

allElectronicsData=open(filepath,'rb')

```
    

