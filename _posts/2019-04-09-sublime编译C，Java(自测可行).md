---
layout:     post
title:      sublime编译C，java（自测可行）
subtitle:   sublime轻巧方便
date:       2019-04-08
author:     Hrain
header-img: about-me
catalog: true
tags:
    - 技术文章
---

之前编译C语言一直用的是vc6.0或者是vs系列。但是不如sublime来的小巧，方便快捷，最主要的是好看。
上网查看了好多关于这方面的教程，花费了我好长的时间，但是都是行不通。好气。
解决方法，我就不那么细致的来说了，有点基础的人应该会明白，其实说多了会更加的晕。
<hr><hr>
<p><font color = "red">1:C语言编译我用的是gcc，gcc我直接用的是dev Cpp这个软件里边的。</font></p>
<hr><hr>
<p><font color = "blue">PS:有需要的就直接上网下载dev cpp就行了，但是有一点要说明的是：不推荐用dev cpp来进行编程，咱要的是里边的gcc,就行</font></p>
我dev Cpp安装的路径是这里，找到bin目录:
C:\Program Files (x86)\Dev-Cpp\MinGW64\bin<br>环境变量也是这个路径，设置环境变量，和配置java的没什么区别。若是不会的，直接上网搜索，配置java环境变量的过程，教程有很多。
<p><br>
<b>最主要的是这一部分：</b><br>
打开sunlime-->tools-->build system -->
粘贴这段代码：


```
{
	"cmd": ["gcc","${file}","-o", "${file_path}/${file_base_name}"],
  "file_regex":"^(..[^:]*):([0-9]+):?([0-9]+)?:? (.*)$",
  "working_dir":"${file_path}",
  "encoding":"cp936",
  "selector": "source.c",
 
  "variants":
  [
  {
    "name": "Run",
    "cmd": ["cmd","/C", "start", "cmd","/c","${file_path}/${file_base_name}.exe & pause"]
    }
  ]
}

```
<hr>
<br>
ctrl+s,命名ccc(你自己看懂，明白什么意思就行)
<hr>
<font color ="green">
随后(java同理，后边就不说了)，tools-->build-->选择ccc<br>
开始写代码，最后开始编译的时候，一定要ctrl+s,保存下你的代码。
1：ctrl+shift+b ：选择ccc--->这一步是为了进行编译
2：ctrl+shift+b：选择ccc run --->这一步是执行
</font></p>
<br>
<hr>
<hr><font color = "red">2:Java语言编译首先安装java环境</font><hr>
1：配置环境变量<br>
2：如上方法：写代码：

```
{
    "cmd": ["javac", "$file_name", "&&", "java", "$file_base_name"],
    "file_regex": "^[ ]*File \"(...*?)\", line ([0-9]*)",
    "path": "C:\\Program Files\\Java\\jdk1.8.0_121\\bin\\",
    "selector": "source.java",
    "shell": true
}

```
<hr>
<font color = "blue" size = 4>注意：代码中path环境变量那个位置写的是<b>自己的环境变量配的位置<font><hr>

接着的步骤就是和上边的一样了，熟能生巧，多尝试，多练就是可以的。<br>
但是java直接ctrl+b就执行了。

<p><-----本文首次发布于 [BY Hrain](http://www.gaoxinya.xyz), 作者 [@Hrain(BY)](http://www.gaoxinya.xyz) ,转载请保留原文链接.-----></p>