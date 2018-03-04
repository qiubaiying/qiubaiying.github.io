---
layout:     post
title:      Android O中Notification的适配
subtitle:   Notification知识笔记
date:       2017-10-08
author:     yourzeromax
header-img: img/post-bg-ios9-web.jpg
catalog: true
tags:
    - Android
---

>手势在用户交互中有着举足轻重的作用，这篇文字简单的介绍了iOS中的手势，并通过手势对控件进行变形处理。

## 绪论 ##

Android O已经发布了一段时间，虽然搭载Android O的手机还没有上市，实际软件还不用考虑O的版本兼容性问题，但是O对Api的一些修改仍然会导致未来App软件兼容性的问题，今天我就和大家谈一谈我遇到的关于传统Notification不能正常使用的问题，首先请看下述的两个warning：
		

> W/Notification: Use of stream types is deprecated for operations other than volume control
		W/Notification: See the documentation of setSound() for what to use instead with android.media.AudioAttributes to qualify your playback use case

大概意思就是说，你的方法过时了！如果在Android O的模拟器中使用传统的Notification，伴随这两个warning的结果是：![这里写图片描述](http://img.blog.csdn.net/20171007114524652?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvcXFfMzQ3NzM5ODE=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
显然，你所设置的Notification是不能正常出现的，下面我就来分析下具体情况。


----------


## 传统的Notification的使用 ##

Notification的使用主要用到两个东西：NotificationManager、Notification。
其中，Notification是具体我们需要显示的通知，它的api可以经过一系列的属性修改来达到我们想要的内容。而NotificationManager我们可以理解为一个管理者，它能够控制对象们的更新等等操作，当然，这里对象指的是我们的Notification，具体的操作看代码，不解释：

```
NotificationManager mNotificationManager =(NotificationManager) getSystemService(NOTIFICATION_SERVICE);／／得到一个manager对象
Notification notification = new NotificationCompat.Builder(this)
		          .setSmallIcon(R.mipmap.ic_launcher)          .setLargeIcon(BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher))
                 .setContentTitle("您有一条新通知")
                 .setContentText("这是一条逗你玩的消息")
                 .build();／／以上采用Builder模式，获得notification
mNotificationManager.notify(1, notification);／／将其显示出来，这个1主要是指notification的ID
```
使用以上的代码是能够正常显示一条通知的，但是一般为了保证用户体验，该通知应该是能够点击，并且在点击后，该通知消失，弹出另外一个界面，为了实现这样的功能，我们还需要了解另外一个类型：PendingIntent,既然包含了“Intent”这个字眼，相信大家也能猜到它的用途了，但是与Intent不同的是，它代表一种“延时的意图”，直接上代码：

```
Intent intent = new Intent(MainActivity.this, SecondActivity.class);
PendingIntent pintent = PendingIntent.getActivity(this, 0, intent, 0);//其中的“this”指的是当前的context，两个0代表优先级的设置，一般不用管，intent就是正常的Intent跳转的类型
```
在有了一个PendingIntent对象后，我们应该在Builder添加以下几句简单的代码：

```
.setAutoCancel(true)//控制点击消失
.setContentIntent(pintent)//设置跳转Activity
```
是不是很简单？Notification一般还需要设置LED灯闪烁、震动等等功能，在传统的（API26以前）Notification中，这些设置都是在Builder中通过setXXX来设置的，这个很简单，直接看代码和注释：

```
.setVibrate(new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400})//设置震动
.setLights(Color.RED,1000,1000)//设置LED灯光，参数分别为：颜色、亮时间、暗时间
```
ok，其他用法（比如设置长文本全显示、设置显示图片、自定义视图）等等我就不再讲了，因为我觉得了解这部分功能，大家应该更深入的去看RemoteView的内容。
以上就是关于传统Notification的用法，对其进行一个简单总结：

 1. 通过getSystemService获得NotificationManager对象
 2. 用Builder模式创建一个Notification 对象
 3. 在Builder串行set标题、文本、图标等等属性（SmallIcon是必须添加的哦！）
 4. 在Builder串行set震动、LED闪烁等属性
 5. 调用NotificationManager对象的notify（）方法，刷新显示


----------

API26以上的改动
----------
大家看到上面的总结，有没有思考过，既然都是在Builder中set属性，那么我为什么会把设置标题文本和设置震动LED分开列出来呢？其实我是想告诉大家，Android O对Notification的最大改动就在这里！也就是说，新的API把这两个设置是分开进行的，我们来回顾一下，之所以出现绪论中提到的情况，就是因为我们没有讲这两种设置分开，所以到底怎么去分开呢？
Android O新增了一个类型来对震动和LED等属性进行管理：NotificationChannel。这是一个新的API，我们直接上代码看看：

```
            String id = "channel_1";
            String description = "123";
            int importance = NotificationManager.IMPORTANCE_LOW;
            NotificationChannel mChannel = new NotificationChannel(id, "123", importance);
            //  mChannel.setDescription(description);
            //  mChannel.enableLights(true);
            //  mChannel.setLightColor(Color.RED);
            //  mChannel.enableVibration(true);
            //  mChannel.setVibrationPattern(new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400});
            mNotificationManager.createNotificationChannel(mChannel);
```
没错，就是这么简单！它就是通过NotificationChannel把两种设置分开而已，并且通过NotificationManager.createNotificationChannel(mChannel)将Channel传入。


----------
## 如何进行版本适配 ##
由于NotificationChannel是在API26中新增的，所以就算你把minSdkVersion设置为25也是不行的，这就牵扯到最为头疼的版本适配问题，怎么进行适配呢？用到Build.VERSION.SDK_INT进行判断：

```
        if (Build.VERSION.SDK_INT >= 26) {
            sendNotification_26();
        } else {
            sendNotification_24();
        }
```
以上我只是提供一个思路，在实际的应用之中其实是有很多优化的地方，大家也不必在意我所列出来代码的复杂性。


----------
## 完整代码 ##
这里写下完整的代码供大家参考：

布局文件：

```
<?xml version="1.0" encoding="utf-8"?>
<android.support.constraint.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context="com.yourzeromax.test_notification.MainActivity">

    <Button
        android:id="@+id/btn_send"
        android:text="发送通知"
        android:onClick="myClick"
        android:layout_width="match_parent"
        android:layout_height="wrap_content" />

</android.support.constraint.ConstraintLayout>
```
MainActivity.class代码：

```
package com.yourzeromax.test_notification;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationChannelGroup;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.app.NotificationCompat;
import android.view.View;
import android.widget.Button;

public class MainActivity extends AppCompatActivity {
    Button btnSend;
    Intent intent;
    NotificationManager mNotificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        btnSend = (Button) findViewById(R.id.btn_send);
        mNotificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

    }

    public void myClick(View v) {
            sendNotification();
    }

    private void sendNotification() {
        if (Build.VERSION.SDK_INT >= 26) {
            intent = new Intent(MainActivity.this, SecondActivity.class);
            PendingIntent pintent = PendingIntent.getActivity(this, 0, intent, 0);
            String id = "channel_1";
            String description = "123";
            int importance = NotificationManager.IMPORTANCE_LOW;
            NotificationChannel mChannel = new NotificationChannel(id, "123", importance);
            //  mChannel.setDescription(description);
            //  mChannel.enableLights(true);
            //  mChannel.setLightColor(Color.RED);
            //  mChannel.enableVibration(true);
            //  mChannel.setVibrationPattern(new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400});
            mNotificationManager.createNotificationChannel(mChannel);
            Notification notification = new Notification.Builder(MainActivity.this, id).setContentTitle("Title")
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setLargeIcon(BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher))
                    .setContentTitle("您有一条新通知")
                    .setContentText("这是一条逗你玩的消息")
                    .setAutoCancel(true)
                    .setContentIntent(pintent)
                    .build();
            mNotificationManager.notify(1, notification);
        }else{
            sendNotification_24();
        }
    }

    private void sendNotification_24() {
        Notification notification = new NotificationCompat.Builder(this)
                .setSmallIcon(R.mipmap.ic_launcher)             //一定要设置
                .setLargeIcon(BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher))
                .setContentTitle("您有一条新通知")
                .setContentText("这是一条逗你玩的消息")
                .setAutoCancel(true)
                .setVibrate(new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400})
                .setLights(Color.RED,1000,1000)
                .build();
        mNotificationManager.notify(1, notification);
    }
}

```


----------

## 大结局 ##
本文是我的第一篇技术型文章的探讨，我也是一名Andorid学习者，文中的不足之处还请各位读者多多包涵！如果大家觉得有帮助的话，麻烦帮我多转发转发，共同学习！