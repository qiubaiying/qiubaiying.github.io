---
layout:     post
title:      jupyter notebook导出pdf的解决方法
subtitle:   不装2.8G的latex就能完美导出pdf
date:       2016-09-16
author:     Nico
header-img: img/post_bg_7.jpg
catalog:      true
tags:
    - jupyter
    - mac
    - latex
    - pdf
---

## 为什么会有这个问题

由于这两天开始上课了，笔者忙于用jupyter notebook写各种作业，（这里推荐一下jupyter乃写作业真！神！器！也），
它很好的支持markdown语法

![](https://nicozheng.files.wordpress.com/2016/09/e5b18fe5b995e5bfabe785a7-2016-09-16-e4b88ae58d881-49-22.png)

它能很好的处理图片

![](https://nicozheng.files.wordpress.com/2016/09/e5b18fe5b995e5bfabe785a7-2016-09-16-e4b88ae58d881-49-41.png)

能很好的处理公式

![](https://nicozheng.files.wordpress.com/2016/09/e5b18fe5b995e5bfabe785a7-2016-09-16-e4b88ae58d881-50-17.png?w=2720)

还能直接展示代码和运行结果

![](https://nicozheng.files.wordpress.com/2016/09/e5b18fe5b995e5bfabe785a7-2016-09-16-e4b88ae58d881-50-49.png)

综上，笔者就用jupyter写完了作业，然而学校的交作业系统只支持doc或者pdf上传，然后jupyter导出pdf花式报错，所以就花了几个小时研究了一下这个问题。。。（虽然chrome的打印功能可以很方便的转化网页成pdf，但是所有的代码都变成黑白的了，强迫症患者表示不能忍。。。）

## 如何解决这个问题
先来看一下jupyter的报错：

![](https://nicozheng.files.wordpress.com/2016/09/e5b18fe5b995e5bfabe785a7-2016-09-16-e4b88ae58d881-51-38.png?w=2720)

然后笔者就到了mac上最流行的latex环境maxtex官网，然而发现这个完整的安装包竟然要2.8G？？？？只是为了让代码有颜色而已，还不打算给我的电脑装那么大的包，所以我就用了pdfkit+wkhtmltopdf+自定义脚本来完成这个工作了。

基本思路是先把jupyter notebook文件转换成支持很好的html，然后用pdfkit把html转成pdf，会在同目录下生产对应的pdf。

1. 安装pdfkit
pdfkit github: https://github.com/pdfkit/pdfkit.git

```shell
pip install pdfkit
```

2. 安装wkhtmltopdf-binary
去官网下载一个24M的wkhtmltopdf安装程序：http://wkhtmltopdf.org/

3. 写一个python脚本

```python
import sys
import subprocess
import pdfkit

inputfile = sys.argv[1].replace(" ","\ ")

temp_html = inputfile[0:inputfile.rfind('.')]+'.html'
command = 'ipython nbconvert --to html ' + inputfile
subprocess.call(command,shell=True)
print '============success==========='
output_file = inputfile[0:inputfile.rfind('.')]+'.pdf'
pdfkit.from_file(temp_html,output_file)
subprocess.call('rm '+temp_html,shell=True)
```

4. 使用方法
然后每次要转换文件都到terminal中输入以下命令：

```shell
python script.py yourfile.ipynb
```

大功告成！
