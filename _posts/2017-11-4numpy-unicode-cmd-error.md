---
layout:     post
title:      import numpy error and UnicodeDecodeError 'ascii' codec can't ...
subtitle:   python
date:       2017-11-4
author:     Shine
header-img: img/home-bg-art.jpg
catalog: true
tags:
    
- python 

based on windows 10 python2.7 anaconda
---ImportError: numpy.core.multiarray failed to import
or 
ImportError: cannot import name bincount

this error can be fixed by:
`$ conda update scikit-learn`

but when you run this command on the cmd, you might have another problem:

`UnicodeDecodeError: 'ascii' codec can't decode byte 0xce in position 9: ordinal not in range(128)`

it is caused by Chinese file directory.

you need to creat a new file:sitecustomize.py 
in the directory:
D:\ProgramData\Anaconda2\Lib\site-packages

write in :
```
import sys
reload(sys)
sys.setdefaultencoding('gb2312')
```
 

