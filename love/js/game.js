Math.TAU = Math.PI*2;

///// LOAD IMAGES /////

var assetsCallback;
var onLoadAssets = function(callback){
	assetsCallback = callback;
	if(assetsLeft==0) assetsCallback();
};
var assetsLeft = 0;
var onAssetLoaded = function(){
	assetsLeft--;
	if(assetsLeft==0) assetsCallback();
};
var images = {};
function addAsset(name,src){
	assetsLeft++;
	images[name] = new Image();
	images[name].onload = onAssetLoaded;
	images[name].src = src;
}
function addSound(name,src){
	assetsLeft++;
	createjs.Sound.addEventListener("fileload", onAssetLoaded);
	createjs.Sound.registerSound({src:src, id:name});
}

//////////////

function Level(config,isIntro){

	var self = this;
	self.isIntro = isIntro;

	self.circles = config.circles;
	self.semisemicles = config.semisemicles;
	self.rects = config.rects;
	self.player = new Peep(config.player,self);
	self.key = new DoorKey(config.key, self);
	self.door = new Door(config.door, self);
	self.clock = new Clock(config.countdown, self);

	self.canvas = config.canvas;
	self.ctx = self.canvas.getContext('2d');
	self.width = self.canvas.width;

	if(self.isIntro){
		self.height = self.canvas.height;
	}else{
		self.height = self.canvas.height - 80;
	}

	self.pathCanvas = document.createElement("canvas");
	self.pathCanvas.width = self.width;
	self.pathCanvas.height = self.height;
	self.pathContext = self.pathCanvas.getContext('2d');
	self.DRAW_PATH = false;

	self.keyCollected = false;
	self.update = function(){
		
		self.player.update();
		self.key.update();

		var output = self.door.update();
		if(self.isIntro){
			STAGE = 1;
		}else{
			if(output=="END_LEVEL"){
				self.ctx.clearRect(0,self.height,self.canvas.width,80);
			}else{
				self.clock.update();
			}
			self.recordFrame();
		}

	};

	self.drawPathLastPoint = null;
	self.draw = function(){

		var ctx = self.ctx;

		// BIGGER EVERYTHING
		if(self.isIntro){
			ctx.save();
			var introScale = 1.5;
			ctx.scale(introScale,introScale);
			ctx.translate(-self.width/2,-self.height/2);
			ctx.translate((self.width/2)/introScale,(self.height/2)/introScale);
		}

		// Clear
		if(self.isIntro){
			ctx.clearRect(self.player.x-100,self.player.y-100,200,200);
			ctx.clearRect(self.key.x-100,self.key.y-100,200,200);
			ctx.clearRect(self.door.x-100,self.door.y-100,200,200);
		}else{
			ctx.fillStyle = "#fff";
			ctx.fillRect(0,0,self.width,self.height);
		}

		// Draw shadows
		var objects = [self.player,self.key,self.door];
		for(var i=0;i<objects.length;i++){
			objects[i].drawShadow(ctx);
		}

		// Draw circles
		ctx.fillStyle = '#333';
		for(var i=0;i<self.circles.length;i++){
			var c = self.circles[i];
			if(c.invisible) continue;
			ctx.beginPath();
			ctx.arc(c.x, c.y, c.radius, 0, Math.TAU, false);
			ctx.fill();
		}
		for(var i=0;i<self.semisemicles.length;i++){
			var c = self.semisemicles[i];
			ctx.beginPath();
			ctx.arc(c.x, c.y, c.radius, c.start*Math.TAU, c.end*Math.TAU, false);
			ctx.fill();
		}
		for(var i=0;i<self.rects.length;i++){
			var c = self.rects[i];
			ctx.fillRect(c.x, c.y, c.w, c.h);
		}

		// Draw Peep, Key, Door in depth
		objects.sort(function(a,b){ return a.y - b.y; });
		for(var i=0;i<objects.length;i++){
			objects[i].draw(ctx);
		}

		// Draw path?
		if(self.DRAW_PATH){
			ctx.drawImage(self.pathCanvas,0,0);

			if(!self.drawPathLastPoint){
				self.drawPathLastPoint = {
					x: self.player.x-0.1,
					y: self.player.y
				};
			}

			var pctx = self.pathContext;
			pctx.beginPath();
			pctx.strokeStyle = "#cc2727";
			pctx.lineWidth = 10;
			pctx.lineCap = "round";
			pctx.lineJoin = "round";
			pctx.moveTo(self.drawPathLastPoint.x, self.drawPathLastPoint.y);
			pctx.lineTo(self.player.x, self.player.y);
			pctx.stroke();
	
			self.drawPathLastPoint = {
				x: self.player.x,
				y: self.player.y
			};

		}

		// CLOCK
		if(self.isIntro){
		}else{
			ctx.clearRect(0,self.height,self.canvas.width,80);
			if(!self.NO_CLOCK) self.clock.draw(ctx);
		}

		// BIGGER EVERYTHING
		if(self.isIntro){
			ctx.restore();
		}

	};

	self.frames = [];
	self.recordFrame = function(){
		
		var frame = {
			player:{
				x: self.player.x,
				y: self.player.y,
				sway: self.player.sway,
				bounce: self.player.bounce,
				frame: self.player.frame,
				direction: self.player.direction
			},
			key:{
				hover: self.key.hover
			},
			door:{
				frame: self.door.frame
			},
			keyCollected: self.keyCollected
		};

		self.frames.push(frame);
	}

	var lastCollected = false;
	self.playbackFrame = function(frameIndex){

		var frame = self.frames[frameIndex];

		self.player.x = frame.player.x;
		self.player.y = frame.player.y;
		self.player.sway = frame.player.sway;
		self.player.bounce = frame.player.bounce;
		self.player.frame = frame.player.frame;
		self.player.direction = frame.player.direction;

		self.key.hover = frame.key.hover;
		self.door.frame = frame.door.frame;

		self.keyCollected = frame.keyCollected;
		if(self.keyCollected && !lastCollected && STAGE==3){
			createjs.Sound.play("unlock");
		}
		lastCollected = self.keyCollected;

		self.NO_CLOCK = true;
		self.draw();

	}

	self.clear = function(){
		var ctx = self.ctx;
		ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
	}

	self.onlyPath = function(){
		self.clear();
		self.ctx.drawImage(self.pathCanvas,0,0);
	}

}

//////////////

function Clock(countdown,level){

	var self = this;
	self.level = level;
	self.framePerTick = 30/countdown;

	var enterSide = null;
	var exitSide = null;

	self.update = function(){

		// THIS IS TOTALLY A HACK, JUST FOR LEVEL 2
		// SUBTLY CHEAT - IT'S IMPOSSIBLE TO SOLVE IT THE WRONG WAY

		if(CURRENT_LEVEL==1){
			if(level.keyCollected){
				if(!exitSide && Math.abs(level.player.x-150)>30){
					exitSide = (level.player.x<150) ? "left" : "right";
				}
			}else{
				if(!enterSide && level.player.y<150){
					enterSide = (level.player.x<150) ? "left" : "right";
				}
			}
			if(exitSide && enterSide){
				if(exitSide == enterSide){
					self.frame += self.framePerTick*1.8;
				}
			}
		}

		// Normal update

		self.frame += self.framePerTick;
		if(self.frame>=30){
			createjs.Sound.play("error");
			reset();
		}

	};

	self.frame = 0;
	self.draw = function(ctx){

		ctx.save();
		ctx.translate(level.width/2,level.height+40);

		var f = Math.floor(self.frame);
		var sw = 82;
		var sh = 82;
		var sx = (f*sw) % images.clock.width;
		var sy = sh*Math.floor((f*sw)/images.clock.width);
		ctx.drawImage(images.clock, sx,sy,sw,sh, -30,-30,60,60);
		ctx.restore();

	};

}

function DoorKey(config,level){

	var self = this;
	self.level = level;

	self.x = config.x;
	self.y = config.y;

	self.hover = 0;
	self.update = function(){

		if(level.keyCollected) return;

		self.hover += 0.07;

		var dx = self.x-level.player.x;
		var dy = self.y-level.player.y;
		var distance = Math.sqrt(dx*dx/4 + dy*dy);
		if(distance<5){
			level.keyCollected = true;

			createjs.Sound.play("unlock");

		}

	};

	self.draw = function(ctx){

		if(level.keyCollected) return;

		ctx.save();
		ctx.translate(self.x, self.y-20-Math.sin(self.hover)*5);
		ctx.scale(0.7,0.7);
		ctx.drawImage(images.key,-23,-14,47,28);
		ctx.restore();

	};
	self.drawShadow = function(ctx){

		if(level.keyCollected) return;

		ctx.save();
		ctx.translate(self.x,self.y);
		ctx.scale(0.7,0.7);

		var scale = 1-Math.sin(self.hover)*0.5;
		ctx.scale(1*scale,0.3*scale);
		ctx.beginPath();
		ctx.arc(0, 0, 15, 0, Math.TAU, false);
		ctx.fillStyle = 'rgba(100,100,100,0.4)';
		ctx.fill();
		ctx.restore();

	};

}

function Door(config,level){

	var self = this;
	self.level = level;

	self.x = config.x;
	self.y = config.y;

	self.update = function(){

		if(level.keyCollected && self.frame<10){
			self.frame += 0.5;
		}

		if(level.keyCollected){
			var dx = self.x-level.player.x;
			var dy = self.y-level.player.y;
			var distance = Math.sqrt(dx*dx/25 + dy*dy);
			if(distance<6){
				if(level.isIntro){
					
					document.getElementById("whole_container").style.top = "-100%";

					createjs.Sound.play("ding");

					CURRENT_LEVEL = 0;
					var lvl = new Level(LEVEL_CONFIG[CURRENT_LEVEL]);
					levelObjects[CURRENT_LEVEL] = lvl;
					window.level = null;
					setTimeout(function(){
						window.level = lvl;
					},1200);

					return "END_LEVEL";
				}else{
					next();
					return "END_LEVEL";
				}
			}
		}

	};

	self.frame = 0;
	self.draw = function(ctx){

		ctx.save();
		ctx.translate(self.x,self.y);
		ctx.scale(0.7,0.7);

		var f = Math.floor(self.frame);
		var sw = 68;
		var sh = 96;
		var sx = (f*sw) % images.door.width;
		var sy = sh*Math.floor((f*sw)/images.door.width);
		var dx = -34;
		var dy = -91;
		ctx.drawImage(images.door, sx,sy,sw,sh, dx,dy,sw,sh);
		ctx.restore();

	};
	self.drawShadow = function(ctx){

		ctx.save();
		ctx.translate(self.x,self.y);
		ctx.scale(0.7,0.7);
		ctx.scale(1,0.2);
		ctx.beginPath();
		ctx.arc(0, 0, 30, 0, Math.TAU, false);
		ctx.fillStyle = 'rgba(100,100,100,0.4)';
		ctx.fill();
		ctx.restore();

	};

}

//////////////

function Peep(config,level){

	var self = this;
	self.level = level;

	self.x = config.x;
	self.y = config.y;
	self.vel = {x:0,y:0};
	self.frame = 0;
	self.direction = 1;

	self.update = function(){

		// Keyboard

		var dx = 0;
		var dy = 0;

		if(Key.left) dx-=1;
		if(Key.right) dx+=1;
		if(Key.up) dy-=1;
		if(Key.down) dy+=1;

		var dd = Math.sqrt(dx*dx+dy*dy);
		if(dd>0){
			self.vel.x += (dx/dd) * 2;
			self.vel.y += (dy/dd) * 2;
		}

		if(Key.left) self.direction=-1;
		if(Key.right) self.direction=1;

		if(Key.left || Key.right || Key.up || Key.down){
			//if(self.frame==0) bounce=0.8;
			self.frame++;
			if(self.frame>9) self.frame=1;
		}else{
			if(self.frame>0) self.bounce=0.8;
			self.frame = 0;
		}

		// Velocity

		self.x += self.vel.x;
		self.y += self.vel.y;
		self.vel.x *= 0.7;
		self.vel.y *= 0.7;

		// Dealing with colliding into border
		if(self.x<0) self.x=0;
		if(self.y<0) self.y=0;
		if(self.x>level.width) self.x=level.width;
		if(self.y>level.height) self.y=level.height;

		// Dealing with collision of circles
		// Hit a circle? Figure out how deep, then add that vector away from the circle.

		for(var i=0;i<level.circles.length;i++){
			var circle = level.circles[i];
			// Hit circle?
			var dx = self.x-circle.x;
			var dy = self.y-circle.y;
			var distance = Math.sqrt(dx*dx + dy*dy);
			var overlap = (circle.radius+5) - distance;
			if(overlap>0){
				// Yes, I've been hit, by "overlap" pixels.
				// Push me back
				var ux = dx/distance;
				var uy = dy/distance;
				var pushX = ux*overlap;
				var pushY = uy*overlap;
				self.x += pushX;
				self.y += pushY;
			}
		}

		for(var i=0;i<level.semisemicles.length;i++){
			var semi = level.semisemicles[i];
			// Hit circle?
			var dx = self.x-semi.x;
			var dy = self.y-semi.y;
			var distance = Math.sqrt(dx*dx + dy*dy);
			var overlap = (semi.radius+5) - distance;
			if(overlap>0&&((i==0&&dy>5)||(i==1&&dy<-5))){
				// Yes, I've been hit, by "overlap" pixels.
				// Push me back
				var ux = dx/distance;
				var uy = dy/distance;
				var pushX = ux*overlap;
				var pushY = uy*overlap;
				self.x += pushX;
				self.y += pushY;
			}
			else if(i==0&&dy>-5&&dy<5&&self.x<semi.radius)
				self.y -= dy + 5;
			else if(i==1&&dy>-5&&dy<5&&self.x>300-semi.radius)
				self.y += 5 - dy;
		}

		for(var i=0;i<level.rects.length;i++){
			var rect = level.rects[i];
			// Hit circle?
			var is_within_x = self.x>rect.x&&self.x<rect.x+rect.w;
			var is_within_y = self.y>rect.y&&self.y<rect.y+rect.h
			var is_within = is_within_x&&is_within_y;
			if(is_within){
				if(i==0){
					if(self.x<rect.x+rect.w&&rect.x+rect.w-self.x<5)
						self.x += rect.x+rect.w-self.x+5
					else if(self.y>rect.y&&self.y-rect.y<5)
						self.y -= self.y-rect.y+5
					else if(rect.y+rect.h>self.y&&rect.y+rect.h-self.y<5)
						self.y += rect.y+rect.h-self.y+5;
				}
				else if(i==1){
					if(self.y>rect.y&&self.y-rect.y<5)
						self.y-=self.y-rect.y+5;
					if(self.x>rect.x&&self.x-rect.x<5)
						self.x-=self.x-rect.x+5;
					if(rect.y+rect.h>self.y&&rect.y+rect.h-self.y<5)
						self.y+=rect.y+rect.h-self.y+5;
				}
			}
		}

		// Bouncy & Sway
		self.sway += swayVel;
		swayVel += ((-self.vel.x*0.08)-self.sway)*0.2;
		swayVel *= 0.9;
		self.bounce += bounceVel;
		bounceVel += (1-self.bounce)*0.2;
		bounceVel *= 0.9;

	};

	self.bounce = 1;
	var bounceVel = 0;
	self.sway = 0;
	var swayVel = 0;
	var bouncy = [0.00, 0.25, 1.00, 0.90, 0.00, 0.00, 0.25, 1.00, 0.90, 0.00];
	self.draw = function(ctx){
		
		var x = self.x;
		var y = self.y;

		// DRAW GOOFY BOUNCY DUDE //
		
		y += -6*bouncy[self.frame];

		if(self.frame==4 || self.frame==9){
			createjs.Sound.play("step",{volume:0.5});
		}

		ctx.save();
		ctx.translate(x,y);
		ctx.scale(0.5,0.5);

		ctx.rotate(self.sway);
		ctx.scale(self.direction,1);///anim.stretch, anim.stretch);
		ctx.scale(1/self.bounce, self.bounce);
		//ctx.rotate(anim.rotate*0.15);
		ctx.drawImage(images.peep,-25,-100,50,100);
		ctx.restore();

	};

	self.drawShadow = function(ctx){

		var x = self.x;
		var y = self.y;

		ctx.save();
		ctx.translate(x,y);
		ctx.scale(0.5,0.5);

		var scale = (3-bouncy[self.frame])/3;
		ctx.scale(1*scale,0.3*scale);
		ctx.beginPath();
		ctx.arc(0, 0, 20, 0, Math.TAU, false);
		ctx.fillStyle = 'rgba(100,100,100,0.4)';
		ctx.fill();
		ctx.restore();

	};

}

//// UPDATE & RENDER ////

window.requestAnimFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function(callback){ window.setTimeout(callback, 1000/60); };

window.onload = function(){

	addAsset("peep","assets/peep.png");
	addAsset("key","assets/key.png");
	addAsset("door","assets/door.png");
	addAsset("clock","assets/clock.png");

	createjs.Sound.alternateExtensions = ["ogg"];
	addSound("ding","audio/ding.mp3");
	addSound("rewind","audio/rewind.mp3");
	addSound("jazz","audio/jazz.mp3");
	addSound("step","audio/step.mp3");
	addSound("unlock","audio/unlock.mp3");
	addSound("error","audio/error.mp3");

	onLoadAssets(function(){

		window.setTimeout(function(){
			document.getElementById("loading").style.display = "none";
		},300);
		window.level = new Level(window.INTRO_LEVEL,true);
		//////////

		var frameDirty = false;
		function update(){

			if(STAGE==0 || STAGE==1){
				if(level){
					level.update();
					frameDirty = true;
				}
			}else if(STAGE==2||STAGE==3){
				frameDirty = true;
			}

			if(STAGE==3 && !window.HAS_PLAYED_JAZZ){

				if(STAGE==3 && CURRENT_LEVEL==LEVEL_CONFIG.length - 2){
					var framesLeft = (rewindLevel.frames.length-rewindFrame) + levelObjects[LEVEL_CONFIG.length - 1].frames.length;
					if(framesLeft<135){
						window.HAS_PLAYED_JAZZ = true;
						createjs.Sound.play("jazz");
					}
				}

			}

		}
		function render(){

			if(STAGE==0 || STAGE==1){

				if(level){
					level.draw();
				}

				frameDirty = false;

			}else if(STAGE==2){

				rewindLevel.playbackFrame(rewindFrame);
				rewindFrame--;
				if(rewindFrame<0){
					CURRENT_LEVEL--;
					if(CURRENT_LEVEL>=0){
						startRewind();
					}else{
						STAGE = 3;
						CURRENT_LEVEL = 0;
						startPlayback();

						document.getElementById("rewind_text").style.display = 'none';
						document.getElementById("replay_text").style.display = "block";

					}
				}

			}else if(STAGE==3){

				rewindLevel.playbackFrame(rewindFrame);
				rewindFrame++;
				if(rewindFrame>=rewindLevel.frames.length){
					CURRENT_LEVEL++;
					if(CURRENT_LEVEL<LEVEL_CONFIG.length){
						startPlayback();
					}else{

						document.getElementById("replay_text").style.display = "none";
						iHeartYou();
						STAGE = 4;

					}
				}

				frameDirty = false;

			}

		}

		setInterval(update,1000/30);
		(function animloop(){
			requestAnimFrame(animloop);
			if(frameDirty) render();
		})();

	});

};

var STAGE = 0;
// 0 - Intro
// 1 - Play levels in order
// 2 - Rewind levels
// 3 - Replay levels with path
// 4 - I HEART YOU
// 5 - End screen

function next(){
	CURRENT_LEVEL++;
	if(CURRENT_LEVEL<LEVEL_CONFIG.length){

		createjs.Sound.play("ding");

		var lvl = new Level(LEVEL_CONFIG[CURRENT_LEVEL]);
		levelObjects[CURRENT_LEVEL] = lvl;
		window.level = null;
		setTimeout(function(){
			window.level = lvl;
		},500);

	}else{
		level = null;
		STAGE = 2;
		CURRENT_LEVEL = LEVEL_CONFIG.length - 1;
		startRewind();
		var totalFrames;
		for (var i=0;i<LEVEL_CONFIG.length;i++)
			totalFrames += levelObjects[i].frames.length;
		
		var totalRewindTime = totalFrames/60;
		var extraTime = 6600 - totalRewindTime*1000;
		if(extraTime<0){
			createjs.Sound.play("rewind");
		}else{
			createjs.Sound.play("rewind","none",0,extraTime);
		}

		document.getElementById("rewind_text").style.display = 'block';
	}
}

function iHeartYou(){
	
	for(var i=0; i<levelObjects.length; i++) {
		levelObjects[i].onlyPath();
	}

	document.getElementById("canvas_container").style.backgroundImage = "url('css/final_bg.png')";
	document.getElementById("screen_two").style.background = "#000";
	
	var can_cont_text = document.getElementById("canvas_container_text");

	var vtext = document.getElementById("valentines_text");
	vtext.style.display = "block";
	vtext.textContent = "I love u forever and ever <3";

	setTimeout(function(){
		vtext.style.letterSpacing = "3px";
	},10);

	// After 9 seconds, swipe down to CREDITS.
	// No replay. Fuck it.
	setTimeout(function(){
		window.location.href="https://avatarganymede.github.io/love/";
	}, 9000)
}

var rewindFrame = 0;
var rewindLevel = null;
function startRewind(){
	rewindLevel = levelObjects[CURRENT_LEVEL];
	rewindFrame = rewindLevel.frames.length-1;
}
function startPlayback(){
	rewindLevel = levelObjects[CURRENT_LEVEL];
	rewindLevel.DRAW_PATH = true;
	rewindFrame = 0;
}

var levelObjects = [];
var CURRENT_LEVEL = 0;
function reset(){
	var lvl = new Level(LEVEL_CONFIG[CURRENT_LEVEL]);
	levelObjects[CURRENT_LEVEL] = lvl;
	if(window.level) window.level.clear();
	window.level = null;
	setTimeout(function(){
		window.level = lvl;
	},500);
}

///////////////////////////////////////////////////////////////////


var introCanvas = document.getElementById("canvas_intro");
introCanvas.width = window.innerWidth;
introCanvas.height = window.innerHeight;
var cx = window.innerWidth/2;
var cy = window.innerHeight/2;

window.INTRO_LEVEL = {

	canvas:document.getElementById("canvas_intro"),
	player:{ x:cx-150, y:cy-30 },
	door:{ x:cx+150, y:cy-30 },
	key:{ x:cx, y:cy+125 },
	circles: [
		{x:cx,y:cy,radius:120,invisible:true}
	],
	semisemicles: [],
	rects: []
};

window.LEVEL_CONFIG = [
	// C
	{
		canvas:document.getElementById("canvas_1"),
		player:{ x:150, y:50 },
		door:{ x:227, y:270 },
		key:{ x:38, y:170 },
		circles: [
			{x:150,y:150,radius:100}
		],
		semisemicles: [],
		rects: [],
		countdown:90
	},
	// Z
	{
		canvas:document.getElementById("canvas_2"),
		player:{ x:35, y:70 },
		door:{ x:249, y:286 },
		key:{ x:130, y:175 },
		circles: [],
		semisemicles: [
			{x:0,y:75,radius:142,start:0,end:0.5},
			{x:300,y:220,radius:142,start:0.5,end:1}
		],
		rects: [],
		countdown:150
	},
	// Z
	{
		canvas:document.getElementById("canvas_3"),
		player:{ x:150, y:172 },
		door:{ x:260, y:287 },
		key:{ x:40, y:77 },
		circles: [],
		semisemicles: [],
		rects: [
			{x:0,y:80,w:115,h:150},
			{x:185,y:80,w:115,h:150}
		],
		countdown:120
	},
	// I
	{
		canvas:document.getElementById("canvas_4"),
		player:{ x:150, y:175 },
		door:{ x:150, y:75 },
		key:{ x:150, y:275 },
		circles: [
			{x:0,y:150,radius:100},
			{x:300,y:150,radius:100}
		],
		semisemicles: [],
		rects: [],
		countdown:90
	},

	// HEART
	{
		canvas:document.getElementById("canvas_5"),
		player:{ x:150, y:250 },
		door:{ x:150, y:249 },
		key:{ x:150, y:75 },
		circles: [
			{x:100,y:100,radius:50},
			{x:200,y:100,radius:50},
			{x:150,y:100,radius:10,invisible:true},
			{x:0,y:300,radius:145},
			{x:300,y:300,radius:145}
		],
		semisemicles: [],
		rects: [],
		// SUPER HACK - for level 2, change timer so it's impossible to beat if you go BACKWARDS.
		countdown: 200
	},

	// U
	{
		canvas:document.getElementById("canvas_6"),
		player:{ x:30, y:75 },
		door:{ x:270, y:75 },
		key:{ x:150, y:270 },
		circles: [
			{x:150,y:150,radius:115}
		],
		semisemicles: [],
		rects: [],
		countdown: 130
	}

];

