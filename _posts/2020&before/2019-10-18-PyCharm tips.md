---
layout:     post
title:      PyCharm tips
date:       2020-10-18
author:     Yukun SHANG
catalog: 	 true
tags:
    - Tools

---

# PyCharm tips

* PyCharm能够很好的使用anaconda等环境，而且在里面就可以下载相应的packages。
* 经过测试，package下载速度很快，anaconda的package是通过清华镜像下载的。而且不同环境之间不受影响。
* 如果发现Pycharm的输出与terminal对应环境的不一致，需要去检查一下configure里面的环境是否一致：
![在这里插入图片描述](2020-10-18-PyCharm tips.assets/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzA4NTY5NA==,size_16,color_FFFFFF,t_70-20201018163709515.png)
* PyCharm 中的环境并**不是独立于**系统中的anaconda，而且连在一起的，对应起来的。如果用terminal在anaconda中建立了一个新的环境，那么PyCharm里面也会出现这个新的环境（不过得想办法刷新）
* 目前MacOS不支持Python2了，同理，PyCharm也会不支持，不建议用Python2