---
layout:     post
title:      解决Failed to load response data
subtitle:   
author:     大暴马
catalog: 	true
date:       2019-03-24
tags:
    - 开发
    - 浏览器技巧
---

### Failed to load 原因
开发者(前后端)经常需要打开浏览器的开发者工具(F12功能窗口)，来查看浏览器发送的请求和对应的响应结果。
但如果response中返回的数据过大，比如笔者从事开发的系统，一个接口的返回值经常几十兆，chrome的开发者窗口中的response区域，
就会显示 
```
Failed to load response data
```
![](https://yabaowang.github.io/img/failed_to_load_response_data.png)

尝试使用其它浏览器，也有类似的问题，比如 firefox，只能看到部分不完整的数据(比如不完整JSON)，不能解决问题。

### 解决办法
浏览器之所以显示不完全或者干脆不显示，是因为浏览器不能擅自把超大的响应结果放到磁盘文件，在可用的有限空间展示大量数据，
就变得困难。因此我想，可以使用HTTP抓包工具，拦截请求和响应，存储到本地文件中，而能够打开大文件的软件工具就非常多了，比如UltraEdit，
TXT文本文件，NotePad++ 都可以。抓包工具我用过Fiddler和Charles，前者重在"抓"，后者强在mock API，对应到这个场景，我倾向使用Fiddler来完成抓包任务。


#### 使用Fiddler存储请求

**Fiddler介绍**  

不知道这个工具的自学一下
<https://baike.baidu.com/item/Fiddler/2868968?fr=aladdin>

**Fiddler下载及安装**
<https://www.telerik.com/fiddler>
下载后双击安装即可。

安装完毕再配置一个HTTPS证书，你可以简单理解为，这样配置了以后Fiddler的权利就大了，就能查看HTTPS的数据了。
因为现在大部分系统都可以使用HTTPS。

 > 生成证书文件FiddlerRoot.cer
 > 在菜单栏中依次选择 【Tools】->【Options】->【HTTPS】，勾上如下图的选项
 ![](https://yabaowang.github.io/img/fiddler1.png)
 
**定制Fiddler功能**

注意，我们的目标是保存你需要保存的场景(比如我的场景是数据量过大，浏览器不能显示)，而非全部请求。
因此，存储哪些 请求/响应， 需要咱们自己定制一下。
Fiddler像很多其它"流程管控"软件(比如版本管理、文件协同、生产流水线)一样，Fiddler也提供了hook(钩子程序)，
它提供了发送请求、接收响应的拦截器函数，可以利用这些函数在正式把数据交给浏览器之前，做一些"手脚"。

  > 原理：使用 OnBeforeRequest()，OnBeforeResponse()方法
  > 操作方法: 选择菜单【rules 】--- >【customs rules】选项
  > 弹出框就是可以定制化钩子函数的地方。这就是一个js文件，相信能实操到这个步骤的人，都应该能看懂这个文件写的是什么。
    它不难读懂，就几个简单的函数，注释也写的很清楚，猜猜看就知道是什么作用。

如果想保存请求参数，可以在OnBeforeRequest()函数中，平行添加这样一个判断，咱们以微信API为例：

```
if (oSession.fullUrl.Contains("mp.weixin.qq.com")) {
     var fso;
     var file;
     fso = new ActiveXObject("Scripting.FileSystemObject");
     //文件保存路径，可自定义
     file = fso.OpenTextFile("D:\\fiddler\\request\\weixin.txt",8 ,true, true);
     file.writeLine("Request url: " + oSession.url);
     file.writeLine("Request header:" + "\n" + oSession.oRequest.headers);
     file.writeLine("Request body: " + oSession.GetRequestBodyAsString());
     file.writeLine("\n");
     file.close();
 }
```
如果想保存你的超大的response，可以在OnBeforeResponse()函数中，平行添加这样一个判断，以我的大response结果为例：

```
if(oSession.fullUrl.Contains("/cfxml_import"))
{
    oSession.utilDecodeResponse();//消除保存的请求可能存在乱码的情况
    var fso;
    var file;
    fso=new ActiveXObject("Scripting.FileSystemObject");
    //文件保存路径，可自定义

    file=fso.OpenTextFile("d:\\fiddler\\response\\cfxml_import.txt",8,true,true);
    //file.writeLine("Response code: "+oSession.responseCode);
    //file.writeLine("Response body: "+oSession.GetResponseBodyAsString());
    file.writeLine(oSession.GetResponseBodyAsString());
    file.writeLine("\n\n");
    file.close();
}
```

上面两个方法就能把你关注的请求、响应 HTTP(S)请求保存到本地目录。具体里面的常用方法，比如oSession的可用方法，简单百度一下就可以了。

### 疑难杂症

1, 遇到乱码?
试试oSession.utilDecodeRequest(); oSession.utilDecodeResponse();
2, 弹窗提醒脚本错误？
具体问题具体分析。注意，咱们是为了拿到数据。如果你的数据已经拿到了，有些错误可以忽略，有空可以自己改改脚本、调试一下。

右面有空我再调整下格式。

### 关注一下，啥看好的影视都有，谢谢了~
 ![](https://open.weixin.qq.com/qr/code?username=zhihuishangye)