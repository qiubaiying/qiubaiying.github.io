---
layout:     post
title:      iOS噪音计
subtitle:   一个iOS噪音计模型、以及测量原理及分贝计算
date:       2016-11-15
author:     BY
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - iOS
    - Demo
---


# 前言

最近在办公室觉得有点吵，然后忽然想做一个噪音计测试一下噪音，在App Store下载了几款测噪音软件，使用原来都大同小异。于是决定自己实现测噪音的原理。

## 分贝dB
首先要测量噪音，必须知道噪音的大小的参考的单位为分贝（dB），分贝的定义如下：

```
SPL = 20lg[p(e)/p(ref)]
```
`p(e)`为待测的有效声压，`p(ref)`为参考声压，一般取2*10E-5帕，这是人耳能分辨的最小声压（1KHz）。

就是说噪音每增加20dB，声压增强了10倍。

## iOS测噪音原理

iOS设备测量噪音原理非常简单：调用系统麦克风，根据麦克风输入强度计算转化为对应的dB值。但是，实现的过程可是坑满满。

找到了一篇博客介绍iOS硬件的调用:[iOS开发系列--音频播放、录音、视频播放、拍照、视频录制](http://www.cnblogs.com/kenshincui/p/4186022.html)

iOS的`AVFoundation`框架中有一个`AVAudioRecorder`类专门处理录音操作，详见[Apple文档](https://developer.apple.com/reference/avfoundation/1668872-av_foundation_audio_settings_con)

在`AVAudioRecorder.h`中找到下列方法

```
- (void)updateMeters; /* call to refresh meter values */ 更新麦克风测量值
- (float)peakPowerForChannel:(NSUInteger)channelNumber; /* returns peak power in decibels for a given channel */ 获取峰值
- (float)averagePowerForChannel:(NSUInteger)channelNumber; /* returns average power in decibels for a given channel */ 获取平局值
```

`- (float)averagePowerForChannel:(NSUInteger)channelNumber;`文档中描述：

>Return Value

>The current average power, in decibels, for the sound being recorded. A return value of 0 dB indicates full scale, or maximum power; a return value of -160 dB indicates minimum power (that is, near silence).

>If the signal provided to the audio recorder exceeds ±full scale, then the return value may exceed 0 (that is, it may enter the positive range).

>Discussion

>To obtain a current average power value, you must call the updateMeters method before calling this method.

也就是说获取的麦克风测量值返回值范围为 `-160dB ~ 0dB`,并且注意最后那句话返回值可能超过0。

## 转化公式

获取的的测量值为 `-160 ~ 0dB` ，如何转化为我们所要的噪音值呢？在网上找了很多资料都没有结果，于是就自己摸索转化公式。

刚开始想到的是利用分贝计算公式`SPL = 20lg[p(e)/p(ref)]`进行计算，后来直接放弃这个方案，因为这是一个对数运算，获取到的值非常稳定，几乎不会波动，与其他的测噪软件所得的分贝值出入太大。

然后发现有个App在麦克风没有输入时显示-55dB

![](http://ww2.sinaimg.cn/large/7853084cgw1f9u0nu3xv3j205n0a0glq.jpg)

于是思路就有了。

其他测噪音软件的量程均为`0~110dB`,而我们获取的的测量值为 `-160 ~ 0dB`，两者之间差了`50dB`，也就是说以麦克风的测量值的`-160dB+50dB = -110dB`作为起点，`0dB`作为Max值,恰好量程为`0~110dB`.

问题看似结束，但是直接以`50dB`作为补偿测量结果会偏大。最后选择了分段进行处理，代码如下

```

-(void)audioPowerChange{
    
    [self.audioRecorder updateMeters];//更新测量值
    float power = [self.audioRecorder averagePowerForChannel:0];// 均值
    float powerMax = [self.audioRecorder peakPowerForChannel:0];// 峰值
    NSLog(@"power = %f, powerMax = %f",power, powerMax);
    
    CGFloat progress = (1.0 / 160.0) * (power + 160.0);
    
    // 关键代码
    power = power + 160  - 50;
    
    int dB = 0;
    if (power < 0.f) {
        dB = 0;
    } else if (power < 40.f) {
        dB = (int)(power * 0.875);
    } else if (power < 100.f) {
        dB = (int)(power - 15);
    } else if (power < 110.f) {
        dB = (int)(power * 2.5 - 165);
    } else {
        dB = 110;
    }
    
    NSLog(@"progress = %f, dB = %d", progress, dB);
    self.powerLabel.text = [NSString stringWithFormat:@"%ddB", dB];
    [self.audioPowerProgress setProgress:progress];

}

```

# 效果

效果如下：

![](http://ww4.sinaimg.cn/large/7853084cgw1f9u1gqgqieg20k00zk7d8.gif)

# 下载地址

Demo下载地址：[Noise-meter-Demo](https://github.com/qiubaiying/Noise-meter-Demo)
