---
layout:     post
title:      Digispark的用法
subtitle:   关于BadUSB的一些用法
date:       2019-06-25
author:     MHYCDH
header-img: img/585932.png
catalog: true
music-id:   28405261
tags:
    - Blog
    - Digispark
---

# 前言
>第一篇blog我就从我最近开始做的事情开始写吧，效果能展示出来就尽量展示出来
>如果出来的效果还有一些需要解释的东西说得不太清楚还希望大佬们原谅我哈         (๑• . •๑)

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/hardwork/en.gif?raw=true)

>好，咱们现在正式进入话题

#### 我们从市面上买得到的BadUSB有这几款：
![Arduino_Pro_Micro](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/Arduino_Pro_Micro.jpg?raw=true "Arduino_Pro_Micro $10")
>Arduino_Pro_Micro

![Digispark](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/digispark.jpeg?raw=true "Digispark $1~2")
>Digispark

![matduino](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/matduino.png?raw=true "matduino $17~31")
>matduino

![ducky](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/ducky.png?raw=true "ducky $49.99")
>大名鼎鼎的ducky

**~~看了价钱之后，果断选择了Digispark~~**

**不是因为价格问题就不提供教学了，是因为我真没有啊╮(￣▽￣)╭**
#### 拥有了Digispark之后，需注意些啥？
**咱们再来看看Digispark的样子**

![Digispark](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/Digispark2.png?raw=true "Digispark")

**可以看出，能够使用的是引脚和金手指**

**因为他是金手指，所以要插入的电脑USB串口要比较紧才能够使用 ~~(弹射起步)~~**

**如果你是有一定的单片机或电子器件的基础，可以引出引脚接上USB接口来使用(´-ι_-｀)**

**当然也可以不用这么麻烦啦，你可以去某宝购买个比较紧的[USB hub](https://s.taobao.com/search?q=usb+hub&type=p&tmhkh5=&spm=a21wu.241046-us.a2227oh.d100&from=sea_1_searchbutton&catId=100) 或者是[双母头的USB线](https://s.taobao.com/search?q=%E5%8F%8C%E6%AF%8D%E5%A4%B4USB%E7%BA%BF&imgfile=&js=1&stats_click=search_radio_all%3A1&initiative_id=staobaoz_20190625&ie=utf8) ，接上PC之后能够识别得了就能够使用**
### 下载ArduinoIDE
>当我们将到手的Digispark插入pc之后，打开设备管理器可以看到这个画面
![设备管理器](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/digispark-1.jpg?raw=true "设备管理器")

**图片中的设备管理器检测到有一个未知设备，这个就是我们的Digispark**

**识别到Digispark之后，我们就可以给他烧写程序或者编程了。这时，我们需要到Arduino的官网上[Arduino官网](https://www.arduino.cc/en/Main/Software)下载ArduinoIDE**
>![ArduinoIDE](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/ArduinoIDE.png?raw=true "ArduinoIDE")

**根据你的系统选择你要下载的版本哦**

**这里暂且跳过安装教程，你也可以跳入到[Arduino安装与烧写教程](https://blog.csdn.net/qq_23937195/article/details/68944217)来查询安装方法**

### 第一个程序：
**当我们安装好ArduinoIDE之后，我们看看主页面**
>![Arduino](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/Arduinoide.png?raw=true)

**点击文件（file）之后选择首选项(setting)(快捷键：Ctrl+逗号）**
**然后就会弹出这个画面**
>![ArduinoIDE_setting](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/ArduinoIDE_setting.png?raw=true "ArduinoIDE_setting")

**接着，我们在“附加开发板管理器网址”这一栏加入这个网址：**

`http://digistump.com/package_digistump_index.json（复制粘贴过去就行）`

**咱们弄好之后点击确定,然后回到主页面，这次点击工具->开发板->开发板管理器（第一个）**

**进入后等待它下载平台索引之后，我们将左上角的类选选择为“贡献（contrib"）然后我们就会进入到这个画面**
>![ArduinoIDE_setting2](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/arduinoIDE_setting2.png?raw=true)

**然后选择第三个（Digistump AVR Boards...)选好之后点击安装**，

**如果你没有开代理的话，这个安装过程可能有点久(￣ε(#￣)，等待一会，等它安装完成后，在开发板的这个选项里就会出现这个**
>![ArduinoIDE_setting3](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/arduinoIDE_setting3.jpg?raw=true)

**如图，我们可以选择我们对应的Digispark版本进行编程和烧写，这里我选择Deafult-16.5mhz.**

**选好之后，此时咱们把这段代码写进去**
```c
#include "DigiKeyboard.h"

void setup() {
  // don't need to set anything up to use DigiKeyboard
}

void loop() {
  // this is generally not necessary but with some older systems it seems to
  // prevent missing the first character after a delay:
  
  DigiKeyboard.sendKeyStroke(0);
  
  // Type out this string letter by letter on the computer (assumes US-style
  // keyboard)
  
  DigiKeyboard.println("Hello Digispark!");
  
  // It's better to use DigiKeyboard.delay() over the regular Arduino delay()
  // if doing keyboard stuff because it keeps talking to the computer to make
  // sure the computer knows the keyboard is alive and connected
  
  DigiKeyboard.delay(5000);
}
```
**写好之后，咱们点击‘上传’（Ctrl+u）此时，ArduinoIDE会等待一分钟的时间，我们把Digispark插进电脑后，Digispark会亮灯**
>![Digispark-light](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/Digispark-light.jpg?raw=true)

**此时表示它正在烧录，当ArduinoIDE显示**
>![complite](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/digispard/complite.png?raw=true)

**就表示Digispark已经OK了**

**此时你可以将Digispark拔出来，然后在PC端新建一个txt文件，光标移动到txt，然后再将Digispark插进电脑，就可以看到神奇的效果了**

![](https://github.com/MHYCDH/MHYCDH.github.io/blob/master/img/hardwork/gif/tenor.gif?raw=true)
