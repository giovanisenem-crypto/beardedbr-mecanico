(function(root,factory){var api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.EmpilhaCore=api;})(typeof window!=="undefined"?window:globalThis,function(){
"use strict";
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function length(x,y){return Math.sqrt(x*x+y*y);}
function normalAngle(a){return Math.atan2(Math.sin(a),Math.cos(a));}
function moveCircle(body,dx,dy,radius,rects,bounds){
 var count=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/8)),sx=dx/count,sy=dy/count;
 var hitX=false,hitY=false;
 for(var k=0;k<count;k++){
  body.x+=sx;
  for(var i=0;i<rects.length;i++){var q=rects[i];if(body.y+radius>q.y&&body.y-radius<q.y+q.h&&body.x+radius>q.x&&body.x-radius<q.x+q.w){body.x=sx>0?q.x-radius:q.x+q.w+radius;hitX=true;}}
  var cx=clamp(body.x,radius,bounds.w-radius);if(cx!==body.x)hitX=true;body.x=cx;
  body.y+=sy;
  for(var j=0;j<rects.length;j++){var t=rects[j];if(body.x+radius>t.x&&body.x-radius<t.x+t.w&&body.y+radius>t.y&&body.y-radius<t.y+t.h){body.y=sy>0?t.y-radius:t.y+t.h+radius;hitY=true;}}
  var cy=clamp(body.y,radius,bounds.h-radius);if(cy!==body.y)hitY=true;body.y=cy;
 }
 return {hitX:hitX,hitY:hitY};
}
function score(deliveries,integritySum,timeLeft,won){return Math.max(0,Math.round(deliveries*400+integritySum*3+(won?Math.max(0,timeLeft)*12:0)));}
function credits(deliveries,integritySum,won){return Math.max(0,Math.round(deliveries*22+integritySum*.16+(won?35:0)));}
function cleanSave(raw){
 var out={credits:0,best:0,bestTime:null,upgrades:{engine:0,tires:0,forks:0},sound:true};
 if(!raw||typeof raw!=="object")return out;
 ["credits","best"].forEach(function(k){if(Number.isFinite(raw[k]))out[k]=clamp(Math.floor(raw[k]),0,10000000);});
 if(Number.isFinite(raw.bestTime)&&raw.bestTime>0)out.bestTime=raw.bestTime;
 if(raw.upgrades&&typeof raw.upgrades==="object")["engine","tires","forks"].forEach(function(k){if(Number.isFinite(raw.upgrades[k]))out.upgrades[k]=clamp(Math.floor(raw.upgrades[k]),0,3);});
 if(Array.isArray(raw.stars)){out.stars=[0,0,0];for(var z=0;z<3;z++)if(Number.isFinite(raw.stars[z]))out.stars[z]=clamp(Math.floor(raw.stars[z]),0,3);}if(typeof raw.sound==="boolean")out.sound=raw.sound;return out;
}
return {clamp:clamp,length:length,normalAngle:normalAngle,moveCircle:moveCircle,score:score,credits:credits,cleanSave:cleanSave};
});
