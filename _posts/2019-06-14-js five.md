 

---
layout:     post
title:      JavaScript 第五天学习
subtitle:   JavaScript快速学习及与其他语言对比
date:       2019-6-14
author:     xinxin
header-img: img/tag-bg-o.jpg
catalog: true
tags:
    - JavaScript
---




```
<input type="text">    用于输入文本
<input type="password" > 用于输入口令
<input type="radio">    用于选则一项
<input type="checkbox">  用于选择多项
<select>
<option>1111</option> 
<option>2222</option>
</select>  复选框
<input type="hidden">
<input type="date" name="" id="" value="2019-04-01">
<input type="datetime-local">
<input type="color" value="#ff0000">
```







用<input  type="hidden"  >

不使用name属性的游览器是不会上传表单的

```

```











 





```
<input type="text" id="username" name="username">
<input type="password" id="input-password">
<input type="hidden" id="md5-password" name="password">
pad.value=toMD5(pad.value)//把输入的明文变为MD5

```













利用JavaScript检查用户注册信息是否正确，在以下情况不满足时报错并阻止提交表单：

- 用户名必须是3-10位英文字母或数字；
- 口令必须是6-20位；
- 两次输入口令必须一致。









 





```
<form id="test-register" action="#" target="_blank" onsubmit="return checkRegisterForm()">
    <p id="test-error" style="color:red"></p>
    <p>
        用户名: <input type="text" id="username" name="username">
    </p>
    <p>
        口令: <input type="password" id="password" name="password">
    </p>
    <p>
        重复口令: <input type="password" id="password-2">
    </p>
    <p>
        <button type="submit">提交</button> <button type="reset">重置</button>
    </p>
</form>
```













 





```
var checkRegisterForm = function () {
    // TODO:
    user=document.getElementById("username");
    onespassword=document.getElementById("password");
    twopassword=document.getElementById("password-2");
var iuser=/\w{3,8}/;
var ipass=/^.{6,20}$/;
console.log(iuser.test(user.value))  ;
console.log(ipass.test(onespassword.value));
console.log(onespassword.value==twopassword.value);
if(iuser.test(user.value)&&ipass.test(onespassword.value)&&onespassword.value==twopassword.value){
console.log("true")     
return true;}
else return false;
}
```













选择上传文件时









 





```
<form action="" enctype="multipart/form-data" method="POST">
    <input type="file" >
</form>
```













表单中一般使用   value来获取文件的路径



1.判断上传文件的类型

f.value:file.naem=endwith(".jpg")









 





```
file.naem=endwith(".jpg")

var file = fileInput.files[0];
file.type!='image/jpeg' ;
```













图像











 





```
var
    fileInput = document.getElementById('test-image-file'),
    info = document.getElementById('test-file-info'),
    preview = document.getElementById('test-image-preview');
// 监听change事件:
fileInput.addEventListener('change', function () {
    // 清除背景图片:
    preview.style.backgroundImage = '';
    // 检查文件是否选择:
    if (!fileInput.value) {
        info.innerHTML = '没有选择文件';
        return;
    }
    // 获取File引用:
    var file = fileInput.files[0];
    // 获取File信息:
    info.innerHTML = '文件: ' + file.name + '<br>' +
                     '大小: ' + file.size + '<br>' +
                     '修改: ' + file.lastModifiedDate;
    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
        alert('不是有效的图片文件!');
        return;
    }
    // 读取文件:
    var reader = new FileReader();
    reader.onload = function(e) {
        var
            data = e.target.result; // 'data:image/jpeg;base64,/9j/4AAQSk...(base64编码)...'            
        preview.style.backgroundImage = 'url(' + data + ')';
    };
    // 以DataURL的形式读取文件:
    reader.readAsDataURL(file);
});
```





addEventListener(type,listener)  

事件清单

<https://developer.mozilla.org/zh-CN/docs/Web/Events>











 





```
当 FileReader 读取文件的方式为  readAsArrayBuffer, readAsBinaryString, readAsDataURL 或者 readAsText 的时候，会触发一个 load 事件。从而可以使用  FileReader.onload 属性对该事件进行处理
```





JavaScript  的回调操作


当执行完

readAsDataURL()

回调

load事件

 

 preview.style.backgroundImage = 'url(' + data + ')';







文件结构图











 





```
<!DOCTYPE html>
<html>

<head>

</head>

<body>
<form action="" enctype="multipart/form-data" method="POST">
    <input type="file" id="input">
</form>
</body>

</html>
```















 





```
var selectedFile = document.getElementById('input')
```





文件信息都在   selectedFile.file[0]内

![img](file:///tmp/WizNote/bd8dde8b-3cf1-41c9-8a09-e0215bac49bb/index_files/61686417.png)



ajax

一种不用刷新整个页面就可以与服务器发生通讯的办法



一般使用xmlhttprequest











 





```
function success(text){
    var textarea =cument.getElementById("test-response-text");
    textarea.value=text;
}
function fail(code){
     var textare=cument.getElementById("test-response-text"); 
    textarea.value="Error code"+code;
}
var request= new XMLHttpRequest();
request.onreadystatechange=function(){
    if(request.readyState===4){
        if(request.status===200){
            return success(request.responseText);
        }else{
        return fail(request.status);
        }
    }else{

    //http请求继续
}

request.open("GET","/api/categories";)
request.send();

    
```





低版本的IE浏览器









 





```
function success(text) {
    var textarea = document.getElementById('test-ie-response-text');
    textarea.value = text;
}

function fail(code) {
    var textarea = document.getElementById('test-ie-response-text');
    textarea.value = 'Error code: ' + code;
}

var request = new ActiveXObject('Microsoft.XMLHTTP'); // 新建Microsoft.XMLHTTP对象

request.onreadystatechange = function () { // 状态发生变化时，函数被回调
    if (request.readyState === 4) { // 成功完成
        // 判断响应结果:
        if (request.status === 200) {
            // 成功，通过responseText拿到响应的文本:
            return success(request.responseText);
        } else {
            // 失败，根据响应码判断失败原因:
            return fail(request.status);
        }
    } else {
        // HTTP请求还在继续...
    }
}

// 发送请求:
request.open('GET', '/api/categories');
request.send();

alert('请求已发送，请等待响应...');

```









![img](file:///tmp/WizNote/bd8dde8b-3cf1-41c9-8a09-e0215bac49bb/index_files/73370032.png)







见状态码[readystate 和status 的状态码](wiz://open_document?guid=900d85fd-5e06-41b0-9717-b330505a58fc&kbguid=&private_kbguid=48919690-f2ea-11e8-a45b-ebea4b4ac72b)

值为4表示数据解析完毕，可以通过XMLHttpRequest对象的相应属性取得数据。





xmlhttprequest的open()方法只有3 个参数

第一个参数  GET 或者POST 

第二个参数是  URL地址

第三个参数指定是否使用异步   默认值为  true



send()方法发送请求