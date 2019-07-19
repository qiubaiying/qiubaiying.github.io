function drop(x, y, damping, shading, refraction, ctx, screenWidth, screenHeight){ 
this.x = x; 
this.y = y; 
this.shading = shading; 
this.refraction = refraction; 
this.bufferSize = this.x * this.y; 
this.damping = damping; 
this.background = ctx.getImageData(0, 0, screenWidth, screenHeight).data; 
this.imageData = ctx.getImageData(0, 0, screenWidth, screenHeight); 
this.buffer1 = []; 
this.buffer2 = []; 
for (var i = 0; i < this.bufferSize; i++){ 
this.buffer1.push(0); 
this.buffer2.push(0); 
} 
this.update = function(){ 
for (var i = this.x + 1, x = 1; i < this.bufferSize - this.x; i++, x++){ 
if ((x < this.x)){ 
this.buffer2[i] = ((this.buffer1[i - 1] + this.buffer1[i + 1] + this.buffer1[i - this.x] + this.buffer1[i + this.x]) / 2) - this.buffer2[i]; 
this.buffer2[i] *= this.damping; 
} else x = 0; 
} 
var temp = this.buffer1; 
this.buffer1 = this.buffer2; 
this.buffer2 = temp; 
} 
this.draw = function(ctx){ 
var imageDataArray = this.imageData.data; 
for (var i = this.x + 1, index = (this.x + 1) * 4; i < this.bufferSize - (1 + this.x); i++, index += 4){ 
var xOffset = ~~(this.buffer1[i - 1] - this.buffer1[i + 1]); 
var yOffset = ~~(this.buffer1[i - this.x] - this.buffer1[i + this.x]); 
var shade = xOffset * this.shading; 
var texture = index + (xOffset * this.refraction + yOffset * this.refraction * this.x) * 4; 
imageDataArray[index] = this.background[texture] + shade; 
imageDataArray[index + 1] = this.background[texture + 1] + shade; 
imageDataArray[index + 2] = 50 + this.background[texture + 2] + shade; 
} 
ctx.putImageData(this.imageData, 0, 0); 
} 
} 
var fps = 0; 
var watereff = { 
// variables 
timeStep : 20, 
refractions : 2, 
shading : 3, 
damping : 0.99, 
screenWidth : 500, 
screenHeight : 400, 
pond : null, 
textureImg : null, 
interval : null, 
backgroundURL : 'data_images/underwater1.jpg', 
// initialization 
init : function() { 
var canvas = document.getElementById('water'); 
if (canvas.getContext){ 
// fps countrt 
fps = 0; 
setInterval(function() { 
document.getElementById('fps').innerHTML = fps / 2 + ' FPS'; 
fps = 0; 
}, 2000); 
canvas.onmousedown = function(e) { 
var mouse = watereff.getMousePosition(e).sub(new vector2d(canvas.offsetLeft, canvas.offsetTop)); 
watereff.pond.buffer1[mouse.y * watereff.pond.x + mouse.x ] += 200; 
} 
canvas.onmouseup = function(e) { 
canvas.onmousemove = null; 
} 
canvas.width = this.screenWidth; 
canvas.height = this.screenHeight; 
this.textureImg = new Image(256, 256); 
this.textureImg.src = this.backgroundURL; 
canvas.getContext('2d').drawImage(this.textureImg, 0, 0); 
this.pond = new drop( 
this.screenWidth, 
this.screenHeight, 
this.damping, 
this.shading, 
this.refractions, 
canvas.getContext('2d'), 
this.screenWidth, this.screenHeight 
); 
if (this.interval != null){ 
clearInterval(this.interval); 
} 
this.interval = setInterval(watereff.run, this.timeStep); 
} 
}, 
// change image func 
changePicture : function(url){ 
this.backgroundURL = url; 
this.init(); 
}, 
// get mouse position func 
getMousePosition : function(e){ 
if (!e){ 
var e = window.event; 
} 
if (e.pageX || e.pageY){ 
return new vector2d(e.pageX, e.pageY); 
} else if (e.clientX || e.clientY){ 
return new vector2d(e.clientX, e.clientY); 
} 
}, 
// loop drawing 
run : function(){ 
var ctx = document.getElementById('water').getContext('2d'); 
watereff.pond.update(); 
watereff.pond.draw(ctx); 
fps++; 
} 
} 
window.onload = function(){ 
watereff.init(); 
} 
文章转载链接：PC教程网 http://www.pclic.com/article/a120180321161176.html
