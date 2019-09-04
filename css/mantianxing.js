<!doctype html>
<html lang="en">
 <head>
 <meta charset="UTF-8">
 <style>
body {
 background-color: #000;
 /* 防止出现左右的滚动条 */
 overflow: hidden;
 margin: 0;
 padding: 0;
}
.wrapper {
 width: 100%;
 height: 100px;
}
.wrapper .nav {
 list-style: none;
 width: 800px;
 height: 100px;
 padding: 0;
 margin: 0 auto;
}
.wrapper .nav li {
 width: 25%;
 height: 50px;
 float: left;
 margin-top: 25px;
}
.wrapper .nav li a {
 text-decoration: none;
 color: #fff;
 text-align: center;
 line-height: 50px;
 display: block;
 font-size: 20px;
 font-family: "KaiTi";
}
 
/* 闪烁的星星 的基本样式 */
.star {
 width: 5px;
 height: 5px;
 background: #fff;
 position: absolute;
 z-index: -1;
}
 
/* 闪烁动画，改变透明度 */
@keyframes blink {
 from {
 opacity: 0.2;
 }
 to {
 opacity: 1;
 }
}
</style>
 </head>
 <body>
 <div class="wrapper">
  <ul class="nav">
  <li><a href="#" rel="external nofollow" rel="external nofollow" rel="external nofollow" rel="external nofollow" >home</a></li>
  <li><a href="#" rel="external nofollow" rel="external nofollow" rel="external nofollow" rel="external nofollow" >about</a></li>
  <li><a href="#" rel="external nofollow" rel="external nofollow" rel="external nofollow" rel="external nofollow" >tags</a></li>
  </ul>
 </div>
<script>
 
// 定义一个 starrySky 对象
var starrySky = {
 // 星星的数量
 starNum: 100,
 
 // 星星的大小，返回一个 2 ~ 12 的随机数
 starSize () { return 2 + Math.trunc(Math.random() * 10) },
 
 // 星星的颜色 
 starColor: "#fff",
 
 // 线的颜色，鼠标进入导航区域，星星会连成一条线
 lineColor: "#fff",
 
 // 线的高度
 lineHeight: "3px",
 
 // 星星连成线的时间
 changeTime: "1s",
 
 // 初始化方法，生成需要的星星，并调用需要的方法
 init () {
 var html = "";
 // 循环生成星星
 for (var i = 0; i < this.starNum; i++) {
 html += "<div class='star' id='star" + i + "'></div>";
 }
 // 拼接到 元素wrapper 中
 document.querySelector(".wrapper").innerHTML += html;
 
 // 调用 星星分散 的方法
 this.disperse();
 
 // 调用 星星聚合连成线 的方法 
 this.combine();
 },
 disperse () {
 // 这个that 保存的是 starrySky 对象
 var that = this;
 
 // 获取 元素wrapper 的宽度
 var width = document.querySelector('.wrapper').offsetWidth;
 // 获取 元素wrapper 的高度
 var height = document.querySelector('.wrapper').offsetHeight;
 // 循环，开始在元素wrapper 区域内，生成规定数量的 星星，
 for (var i = 0; i < that.starNum; i++) {
 // 星星的 top值，0 ~ 元素wrapper 高度的随机数
 var top = Math.trunc(height * Math.random());
 // 星星的 left值，0 ~ 元素wrapper 宽度的随机数
 var left = Math.trunc(width * Math.random());
 // 星星的大小，调用 starrySky对象的starSize()方法
 var size = that.starSize();
 // 设置分散时每个星星样式
 document.querySelector("#star" + i).style.cssText += `
   top:${top}px;
   left:${left}px;
   width:${size}px;
   height:${size}px;
   background:${that.starColor};
   opacity:${Math.random()};
   border-radius:50%;
   animation:blink 1s ${Math.random() * 2}s infinite alternate;
   `;
 }
 },
 combine () {
 // 这个that 保存的是 starrySky 对象
 var that = this;
 // 查找导航栏 里所有的 a元素，遍历他们，每个都绑定上 鼠标进入 和 鼠标移出 事件
 document.querySelectorAll(".nav li a").forEach(function (item) {
 item.addEventListener("mouseover", function (e) {
 // 这里的this 是触发事件的当前节点对象，就是鼠标进入时候的 a元素
 // 当前a元素的宽度 / 星星数 = 最后连成线时，星星的宽度
 var width = this.offsetWidth / that.starNum;
 // 遍历，为每个星星修改样式，开始连成线
 for (var i = 0; i < that.starNum; i++) {
  // 星星的top 值就是，当前a元素的距离顶部的值 + 当前a元素的高度
  var top = this.offsetTop + this.offsetHeight;
  // 星星的left 值就是，当前a元素的距离左边界的值 + 第i个星星 * 星星的宽度
  var left = this.offsetLeft + i * width
  // 设置每个星星连成线时的样式
  document.querySelector("#star" + i).style.cssText += `
     width:${width}px;
     top:${top}px;
     left:${left}px;
     height:${that.lineHeight};
     background:${that.lineColor};
     opacity:1;
     border-radius:0;
     transition:${that.changeTime};
     animation:blink 1s infinite alternate;
    `;
 }
 });
 // 鼠标移出 调用 星星分散 的方法
 item.addEventListener("mouseout", function () {
 that.disperse();
 });
 }
 );
 },
 
}
// 调用 starrySky对象的 init方法，实现满天星效果
starrySky.init();
</script>
 </body>
</html>
