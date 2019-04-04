---
layout:     post
title:      Python for Absolute Newbies
subtitle:   Python installation, pip, and some basic functionality
date:       2019-04-03
author:     Zhejian Peng
header-img: img/python-tutorial-for-beginners.jpg
catalog: true
tags:
    - Python
    - Data Science
---
这篇文章的初衷是为了给我亲爱的女朋友学习 Python 的动力。她没接触过编程也 Python，我会安装 Python3.7 开始讲起。
接下来的主题会渐渐集中讲一些 Data Science 的一些应用和建模方法。
使用 macOS Mojave.

# Zen of Python

Python was designed as a successor to the [ABC language](https://en.wikipedia.org/wiki/ABC_(programming_language)) by
[Guido van Rossum](https://en.wikipedia.org/wiki/Guido_van_Rossum). 
Python was initially developed as a "hobby" project that would keep him occuiped during the Christmas break! I mean who would spend their Christmas writing an [interpreter](https://en.wikipedia.org/wiki/Interpreter_(computing))!

Eventually, Python become one of the top used programming language today. Python can be used for all kinds of projects from small personal project to large application, and from web development to scientific computation. Here are some famous projects used Python, according to this [article](https://www.hartmannsoftware.com/Blog/Articles_from_Software_Fans/Most-Famous-Software-Programs-Written-in-Python)

- YouTube
- Google search engine also used Python for its mainframe
- Instagram
- Reddit

Let's start this tutorial with the Zen of Python:

Type this into the Mac terminal.

```bash
python
>>> import this
```

# Install Python3.7

Let's see how to install Python3.6. Mac come with default python2.7 installed. We want to use Python3.7 here.

I found the easiest way here is to install through [Anaconda Distribution](https://repo.anaconda.com/archive/Anaconda3-2018.12-MacOSX-x86_64.pkg) (Click this link to download directly!)

You can also install through [python.org](https://www.python.org/). 

Please also install VS Code come with Anaconda. I will talk about Visual Studio Code later.
If you installed through python.org, please also install Visual Studio Code separately.

Once you have Python3.7 installed, you should be able to see this in terminal
```bash
~ » python3.7
Python 3.7.0 (v3.7.0:1bf9cc5093, Jun 26 2018, 23:26:24)
[Clang 6.0 (clang-600.0.57)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
```

Congrats! You know have the latest version of Python ready!

# Virtual Environment

Do use a virtual environment, PLEASE!!!

I want you to have the best programming habit from the beginning. I learned this the hard way.

