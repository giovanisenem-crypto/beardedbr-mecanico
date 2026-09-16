(function(){
"use strict";
var C=window.EmpilhaCore,clamp=C.clamp,len=C.length;
var $=function(id){return document.getElementById(id);};
var canvas=$("world"),ctx=canvas.getContext("2d"),W=900,H=500,DPR=1,zoom=1;
var WORLD={w:1280,h:840},SAVE_KEY="empilha_turbo_save_v1";
var saved;try{saved=C.cleanSave(JSON.parse(localStorage.getItem(SAVE_KEY)||"null"));}catch(e){saved=C.cleanSave(null);}var drivers=window.EmpilhaDrivers||[],driver=drivers[0];
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(saved));}catch(e){}}
var shelves=[
 {x:360,y:245,w:225,h:85},{x:695,y:245,w:225,h:85},
 {x:360,y:490,w:225,h:85},{x:695,y:490,w:225,h:85},
 {x:80,y:300,w:74,h:245},{x:1118,y:310,w:74,h:245},
 {x:430,y:50,w:130,h:43},{x:705,y:50,w:130,h:43}
];
var selectedPhase=1;\nvar routesStock=[{pick:{x:230,y:690},drop:{x:1080,y:155},letter:"A",color:"#fbc95a"},{pick:{x:1040,y:690},drop:{x:215,y:150},letter:"B",color:"#70ded4"},{pick:{x:650,y:165},drop:{x:650,y:700},letter:"C",color:"#a8a2ff"},{pick:{x:1020,y:630},drop:{x:260,y:690},letter:"D",color:"#ed9687"}];\nvar routes=[
 {pick:{x:270,y:690},drop:{x:1080,y:155},letter:"A",color:"#fbc95a"},
 {pick:{x:1040,y:690},drop:{x:215,y:150},letter:"B",color:"#70ded4"},
 {pick:{x:650,y:165},drop:{x:650,y:700},letter:"C",color:"#a8a2ff"}
];
var state={phase:"menu",time:150,deliveries:0,integritySum:0,elapsed:0,score:0,cargo:null,energy:1,damageCooldown:0,shake:0};
var player={x:165,y:690,vx:0,vy:0,angle:0,radius:22};
var cam={x:600,y:430},keys={},stick={x:0,y:0,id:null},heldTurbo=false,clock=0,last=0,toastTimer=0,uiTimer=0,particles=[],tireMarks=[];
var traffic=[{x:0,y:391,angle:0,color:"#80b5c2"},{x:0,y:449,angle:Math.PI,color:"#be827b"}];
var audio=null,engineOsc=null,engineGain=null;
function initAudio(){
 if(!saved.sound)return;
 try{
  if(!audio){audio=new(window.AudioContext||window.webkitAudioContext)();engineOsc=audio.createOscillator();engineGain=audio.createGain();engineOsc.type="triangle";engineOsc.frequency.value=60;engineGain.gain.value=0;engineOsc.connect(engineGain).connect(audio.destination);engineOsc.start();}
  if(audio.state==="suspended")audio.resume().catch(function(){});
 }catch(e){}
}
function tone(freq,duration,type,volume,delay){
 if(!saved.sound||!audio||audio.state!=="running")return;
 try{var o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+(delay||0);o.type=type||"sine";o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(volume||.04,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+duration+.02);}catch(e){}
}
function pickupSound(){tone(390,.12,"sine",.05);tone(590,.16,"sine",.05,.09);}
function deliverySound(){[440,554,659,880].forEach(function(f,i){tone(f,.2,"triangle",.055,i*.09);});}
function stopInputs(){keys={};stick.x=stick.y=0;stick.id=null;heldTurbo=false;$("knob").style.transform="";$("turbo").classList.remove("held");}
function showToast(text,duration){$("toast").textContent=text;$("toast").classList.add("show");toastTimer=duration||2;}
function overlays(which){["menu","paused","result","workshop"].forEach(function(id){$(id).hidden=id!==which;});}
function menuInfo(){
 var pick=$("driver-pick");if(!pick){pick=document.createElement("div");pick.id="driver-pick";document.querySelector("#menu .menu-card").insertBefore(pick,$("start"));}pick.innerHTML=drivers.map(function(d){return '<button class="driver-card '+(driver&&driver.id===d.id?"chosen":"")+'" data-driver="'+d.id+'"><b>'+d.name+'</b><small>'+d.role+' · '+d.skill+'</small></button>';}).join("");Array.prototype.forEach.call(pick.querySelectorAll("button"),function(b){b.onclick=function(){driver=drivers.filter(function(d){return d.id===b.dataset.driver;})[0];menuInfo();};});
 $("credits-menu").textContent=saved.credits+" CR";
 $("best").textContent=saved.best?"RECORDE: "+saved.best+" PTS"+(saved.bestTime?" · "+formatTime(saved.bestTime):""):"Seu primeiro turno começa aqui.";
 $("sound").textContent=saved.sound?"SOM LIGADO":"SOM DESLIGADO";$("sound").setAttribute("aria-pressed",String(saved.sound));
}
function formatTime(t){var s=Math.max(0,Math.ceil(t));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
function start(){
 initAudio();stopInputs();state.phase="playing";state.time=150;state.deliveries=0;state.integritySum=0;state.elapsed=0;state.score=0;state.cargo=null;state.energy=1;state.damageCooldown=0;state.shake=0;
 player.x=165;player.y=690;player.vx=player.vy=0;player.angle=0;cam.x=player.x;cam.y=player.y;particles=[];tireMarks=[];
 overlays(null);$("hud").hidden=false;$("controls").hidden=false;$("objective").hidden=false;uiTimer=1;
 showToast((driver?driver.name+" — "+driver.skill+". ":"")+"Busque o pallet amarelo. Pare perto e toque em PEGAR.",3.4);updateUI();
}
function pause(){
 if(state.phase!=="playing")return;state.phase="paused";stopInputs();overlays("paused");$("controls").hidden=true;
 if(engineGain&&audio)engineGain.gain.setTargetAtTime(0,audio.currentTime,.02);
}
function resume(){if(state.phase!=="paused")return;initAudio();state.phase="playing";overlays(null);$("controls").hidden=false;last=performance.now();}
function goMenu(){state.phase="menu";stopInputs();overlays("menu");$("hud").hidden=true;$("controls").hidden=true;$("objective").hidden=true;$("toast").classList.remove("show");menuInfo();}
function finish(won){
 if(state.phase!=="playing")return;
 state.phase="result";stopInputs();
 var score=C.score(state.deliveries,state.integritySum,state.time,won),credit=C.credits(state.deliveries,state.integritySum,won),record=score>saved.best;
 saved.credits+=credit;saved.best=Math.max(saved.best,score);
 if(won&&(saved.bestTime===null||state.elapsed<saved.bestTime))saved.bestTime=state.elapsed;
 persist();state.score=score;
 $("result-eyebrow").textContent=record?"NOVO RECORDE DA OFICINA":"FIM DO TURNO";
 $("result-title").textContent=won?"TURNO CONCLUÍDO!":"O APITO TOCOU!";
 $("result-joke").textContent=won?"O chefe disse que foi sorte. O pallet discorda.":"A empilhadeira estava pronta. O relógio é que correu demais.";
 $("result-score").textContent=score;$("result-credits").textContent="+"+credit+" CR";
 $("result-detail").textContent=state.deliveries+" de "+phaseData().deliveries+" entregas · Integridade média: "+(state.deliveries?Math.round(state.integritySum/state.deliveries):0)+"%";
 $("controls").hidden=true;overlays("result");won?deliverySound():tone(135,.4,"triangle",.055);
}
function phaseData(){return (window.EmpilhaPhases||[])[selectedPhase-1]||{deliveries:3,time:150};}function activeRoutes(){return selectedPhase===2?routesStock:routes;}function route(){var list=activeRoutes();return list[Math.min(state.deliveries,list.length-1)];}
function objectivePoint(){var r=route();return state.cargo?r.drop:r.pick;}
function canAction(){var t=objectivePoint();return len(player.x-t.x,player.y-t.y)<(state.cargo?90:76)&&len(player.vx,player.vy)<95;}
function action(){
 if(state.phase!=="playing")return;initAudio();var r=route(),t=objectivePoint(),d=len(player.x-t.x,player.y-t.y);
 if(d> (state.cargo?90:76)){showToast(state.cargo?"Leve a carga até a doca "+r.letter+".":"Aproxime-se do pallet indicado.",1.5);return;}
 if(len(player.vx,player.vy)>=95){showToast("Solte o direcional para parar e manusear a carga.",1.7);return;}
 if(!state.cargo){state.cargo={integrity:100};pickupSound();burst(player.x,player.y,r.color,12);showToast("Carga presa! Agora siga para a doca "+r.letter+".",2.1);}
 else{
  state.integritySum+=state.cargo.integrity;state.deliveries++;state.cargo=null;burst(player.x,player.y,"#95f2c6",28);deliverySound();
  if(state.deliveries===phaseData().deliveries){finish(true);return;}
  showToast("ENTREGA FEITA! Busque o próximo pallet.",2);
 }
 uiTimer=1;updateUI();
}
function impact(speed){
 if(state.damageCooldown>0||speed<45)return;
 state.damageCooldown=1.0;state.shake=Math.min(5,speed/65);tone(85,.13,"sawtooth",.035);burst(player.x,player.y,"#f5c877",7);
 if(state.cargo){
  var damage=clamp(speed*.065,4,24)*(1-saved.upgrades.forks*.18)*(driver&&driver.id==="vitorino"?0.65:1);
  state.cargo.integrity=Math.max(0,state.cargo.integrity-damage);
  if(state.cargo.integrity<=0){state.cargo=null;showToast("Carga danificada! Pegue outro pallet no ponto de coleta.",3);}
  else showToast("CUIDADO COM A CARGA! "+Math.ceil(state.cargo.integrity)+"% de integridade",1.1);
 }
}
function updateUI(){
 $("time").textContent=formatTime(state.time);$("time").parentElement.classList.toggle("danger",state.time<25);
 $("deliveries").textContent=state.deliveries+" / "+phaseData().deliveries;$("cargo-label").textContent=state.cargo?"INTEGRIDADE DA CARGA":"SEM CARGA";
 $("integrity").textContent=state.cargo?Math.ceil(state.cargo.integrity)+"%":"BUSQUE O PALLET";
 $("integrity").style.color=state.cargo&&state.cargo.integrity<40?"#ff8f78":"";
 $("action-label").textContent=state.cargo?"ENTREGAR":"PEGAR";$("action").classList.toggle("ready",canAction());
 $("energy").style.width=Math.round(state.energy*100)+"%";
 $("objective").querySelector("span").textContent=state.cargo?"Entregue na doca "+route().letter:"Busque o pallet "+(state.deliveries+1);
}
function update(dt){
 clock+=dt;
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$("toast").classList.remove("show");}
 if(state.phase!=="playing"){if(engineGain&&audio)engineGain.gain.setTargetAtTime(0,audio.currentTime,.05);return;}
 state.time-=dt;state.elapsed+=dt;if(state.time<=0){state.time=0;finish(false);return;}
 state.damageCooldown=Math.max(0,state.damageCooldown-dt);state.shake*=Math.exp(-10*dt);
 var ix=stick.x,iy=stick.y;
 if(keys.a||keys.arrowleft)ix-=1;if(keys.d||keys.arrowright)ix+=1;if(keys.w||keys.arrowup)iy-=1;if(keys.s||keys.arrowdown)iy+=1;
 var n=len(ix,iy);if(n>1){ix/=n;iy/=n;n=1;}
 var turbo=(heldTurbo||keys.shift)&&n>.1&&state.energy>.02;
 state.energy=clamp(state.energy+(turbo?-.34:.18)*dt,0,1);
 var maximum=(235+saved.upgrades.engine*22)*(driver?driver.speed:1)*(state.cargo ? .88 : 1)*(turbo?(driver&&driver.id==="andre"?1.62:1.48):1);
 var grip=(n>.1?5.6+saved.upgrades.tires*.8:8.5+saved.upgrades.tires)*dt,blend=1-Math.exp(-grip);
 player.vx+=(ix*maximum-player.vx)*blend;player.vy+=(iy*maximum-player.vy)*blend;
 if(n>.15){var target=Math.atan2(iy,ix);player.angle+=C.normalAngle(target-player.angle)*Math.min(1,dt*(9+saved.upgrades.tires));}
 var speed=len(player.vx,player.vy),result=C.moveCircle(player,player.vx*dt,player.vy*dt,player.radius,shelves,WORLD);
 if(result.hitX||result.hitY){impact(speed);if(result.hitX)player.vx=0;if(result.hitY)player.vy=0;}
 traffic.forEach(function(bot,i){
  var phase=(clock*(i?58:72)+(i?615:0))%1800,forward=phase<900;
  bot.x=180+(forward?phase:1800-phase);bot.angle=forward?0:Math.PI;
  var dx=player.x-bot.x,dy=player.y-bot.y,d=len(dx,dy);
  if(d<47){var nx=d>.01?dx/d:0,ny=d>.01?dy/d:1;C.moveCircle(player,nx*(47-d),ny*(47-d),player.radius,shelves,WORLD);player.vx*=.35;player.vy*=.35;impact(speed+95);}
 });
 if(speed>45&&Math.floor(clock*16)!==Math.floor((clock-dt)*16)){
  tireMarks.push({x:player.x,y:player.y,angle:player.angle});if(tireMarks.length>160)tireMarks.shift();
 }
 if(turbo&&Math.random()<dt*22)burst(player.x-Math.cos(player.angle)*30,player.y-Math.sin(player.angle)*30,"#acc8c4",1);
 particles.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.vx*=Math.exp(-dt*2);p.vy*=Math.exp(-dt*2);});
 particles=particles.filter(function(p){return p.life>0;});
 var follow=1-Math.exp(-6*dt);cam.x+=(player.x+player.vx*.15-cam.x)*follow;cam.y+=(player.y+player.vy*.12-cam.y)*follow;
 if(engineGain&&audio){engineGain.gain.setTargetAtTime(saved.sound?(.008+speed*.000045):0,audio.currentTime,.08);engineOsc.frequency.setTargetAtTime(55+speed*.3,audio.currentTime,.06);}
 uiTimer+=dt;if(uiTimer>.1){uiTimer=0;updateUI();}
}
function burst(x,y,color,count){
 for(var i=0;i<count;i++){var a=Math.random()*Math.PI*2,v=25+Math.random()*90;particles.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3+Math.random()*.7,max:1,color:color,size:2+Math.random()*3});}
 if(particles.length>120)particles.splice(0,particles.length-120);
}
function rr(g,x,y,w,h,r,fill,stroke){
 g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=1;g.stroke();}
}
function label(g,text,x,y,size,color,align){
 g.font="800 "+size+"px system-ui,sans-serif";g.fillStyle=color||"#dae8df";g.textAlign=align||"center";g.textBaseline="middle";g.fillText(text,x,y);
}
function pallet(g,x,y,letter,color,scale){
 g.save();g.translate(x,y);g.scale(scale||1,scale||1);
 g.fillStyle="#0005";g.fillRect(-23,-19,50,45);
 rr(g,-22,-21,44,42,2,"#6a4529","#d19b58");
 g.fillStyle="#c29555";[-15,-3,9].forEach(function(a){g.fillRect(-20,a,40,5);});
 rr(g,-17,-19,34,34,2,"#b99458","#e0c48b");g.fillStyle="#dcc897";g.fillRect(-3,-19,6,34);
 rr(g,-12,-12,24,22,2,color);label(g,letter,0,0,17,"#152a2e");
 g.fillStyle="#fff4";g.fillRect(-15,-18,29,2);g.restore();
}
function forklift(g,x,y,angle,color,cargo,isPlayer){
 g.save();g.translate(x,y);g.rotate(angle);
 g.fillStyle="#0006";g.beginPath();g.ellipse(1,5,36,23,0,0,Math.PI*2);g.fill();
 g.fillStyle="#101a20";[[-20,-24],[-20,16],[15,-24],[15,16]].forEach(function(w){rr(g,w[0],w[1],12,8,2,"#11191f","#546169");g.fillStyle="#79827f";g.fillRect(w[0]+3,w[1]+2,6,1);});
 rr(g,-29,-17,53,34,6,color,"#ffdfa355");g.fillStyle="#ffffff24";g.fillRect(-24,-15,33,4);
 rr(g,-23,-10,13,20,3,"#473e2b");g.fillStyle="#161f23";for(var i=0;i<4;i++)g.fillRect(-20+i*3,-7,1,14);
 rr(g,-6,-14,20,28,3,"#172930","#8ba6a0");rr(g,-2,-10,12,20,3,"#526570");
 g.fillStyle="#1c3036";g.beginPath();g.arc(4,0,7,0,Math.PI*2);g.fill();g.fillStyle="#f0ba74";g.beginPath();g.arc(5,0,4,0,Math.PI*2);g.fill();
 g.strokeStyle="#bed6d080";g.lineWidth=3;g.strokeRect(-5,-13,19,26);
 rr(g,20,-19,8,38,2,"#6b7d80","#e4e8d755");
 g.fillStyle="#a8b9b7";g.fillRect(27,-14,24,5);g.fillRect(27,9,24,5);g.fillStyle="#dce4d5";g.fillRect(46,-14,5,5);g.fillRect(46,9,5,5);
 g.fillStyle="#d9ffff";g.fillRect(18,-17,5,4);g.fillRect(18,13,5,4);
 g.fillStyle="#ffbc42";g.beginPath();g.arc(-7,-1,3,0,Math.PI*2);g.fill();
 if(Math.sin(clock*8+(isPlayer?0:2))>.3){g.fillStyle="#ffbf4366";g.beginPath();g.arc(-7,-1,8,0,Math.PI*2);g.fill();}
 if(cargo)pallet(g,43,0,route().letter,route().color,.72);
 if(isPlayer){g.fillStyle="#94f2e3";g.fillRect(-29,-7,3,5);g.fillRect(-29,3,3,5);}
 g.restore();
}
var terrain=document.createElement("canvas");terrain.width=WORLD.w;terrain.height=WORLD.h;
function makeTerrain(){
 var g=terrain.getContext("2d");g.fillStyle="#465654";g.fillRect(0,0,WORLD.w,WORLD.h);
 var seed=871;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 for(var y=0;y<WORLD.h;y+=64)for(var x=0;x<WORLD.w;x+=64){g.fillStyle=((x+y)/64)%2?"#4d5a56":"#495854";g.fillRect(x+1,y+1,62,62);g.fillStyle="#091f1820";g.fillRect(x,y,1,64);}
 for(var i=0;i<1500;i++){g.fillStyle=i%2?"#c6d0b20b":"#091a1814";g.fillRect(rand()*WORLD.w,rand()*WORLD.h,1+rand()*9,1+rand()*2);}
 g.strokeStyle="#cbbb7660";g.lineWidth=3;g.setLineDash([25,20]);[365,467].forEach(function(y){g.beginPath();g.moveTo(155,y);g.lineTo(1125,y);g.stroke();});g.setLineDash([]);
 [270,990].forEach(function(x){for(var i=0;i<5;i++){g.fillStyle="#e7d29849";g.fillRect(x-32+i*14,363,8,107);}});
 label(g,"CORREDOR DE CIRCULAÇÃO",650,415,13,"#d1ce9980");
 g.fillStyle="#1a3338";g.fillRect(0,0,1280,23);g.fillRect(0,817,1280,23);g.fillRect(0,0,23,840);g.fillRect(1257,0,23,840);
 g.fillStyle="#90a8a0";g.fillRect(22,22,1236,3);g.fillRect(22,814,1236,3);
 for(var j=40;j<1250;j+=50){g.fillStyle="#bfab5d";g.fillRect(j,8,23,5);g.fillRect(j,829,23,5);}
 routes.forEach(function(r,i){
  var d=r.drop;rr(g,d.x-76,d.y-59,152,118,7,"#122d343f",r.color+"b0");
  g.fillStyle=r.color+"45";g.fillRect(d.x-69,d.y-50,138,5);g.fillRect(d.x-69,d.y+46,138,5);
  label(g,"DOCA "+r.letter,d.x,d.y-27,16,r.color);label(g,"ENTREGAS",d.x,d.y+4,10,r.color+"aa");
  g.strokeStyle=r.color+"70";g.lineWidth=3;g.beginPath();g.moveTo(d.x-15,d.y+25);g.lineTo(d.x,d.y+36);g.lineTo(d.x+15,d.y+25);g.stroke();
  label(g,"COLETA "+(i+1),r.pick.x,r.pick.y+48,11,"#e5dab6b0");
 });
 shelves.forEach(function(s,index){
  g.fillStyle="#0b161b66";g.fillRect(s.x+10,s.y+13,s.w,s.h);rr(g,s.x,s.y,s.w,s.h,3,"#263e48","#6e999f");
  var vertical=s.h>s.w,columns=Math.max(1,Math.floor(s.w/48)),rows=Math.max(1,Math.floor(s.h/46));
  for(var a=0;a<columns;a++)for(var b=0;b<rows;b++){
   var bx=s.x+9+a*(s.w-14)/columns,by=s.y+9+b*(s.h-14)/rows,bw=(s.w-22)/columns,bh=(s.h-24)/rows;
   rr(g,bx,by,bw,bh,2,index%3===0?"#8b7851":"#a28a60","#d3b88766");g.fillStyle="#dfc59488";g.fillRect(bx+bw*.42,by,5,bh);g.fillStyle="#403c2c77";g.fillRect(bx+5,by+bh-8,Math.min(16,bw-10),3);
  }
  g.fillStyle="#76b5b688";g.fillRect(s.x,s.y,s.w,5);g.fillRect(s.x,s.y+s.h-7,s.w,7);
  for(var k=s.x+4;k<s.x+s.w;k+=48){g.fillStyle="#152c33";g.fillRect(k,s.y-3,6,s.h+8);g.fillStyle="#91b5b7";g.fillRect(k,s.y-3,6,3);}
 });
 [[215,258],[1060,275],[280,605],[990,602]].forEach(function(p){
  g.fillStyle="#0004";g.beginPath();g.ellipse(p[0]+3,p[1]+5,13,10,0,0,Math.PI*2);g.fill();rr(g,p[0]-13,p[1]-10,26,20,3,"#293a3b");g.fillStyle="#f19432";g.beginPath();g.moveTo(p[0],p[1]-18);g.lineTo(p[0]+9,p[1]+6);g.lineTo(p[0]-9,p[1]+6);g.fill();g.fillStyle="#eee7c3";g.fillRect(p[0]-5,p[1]-6,10,4);
 });
 label(g,"EMPILHA TURBO",1050,790,21,"#b9c4a644");label(g,"FÁBRICA BEARDEDBR",244,785,12,"#b9c4a688");
}
function render(){
 ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle="#172b31";ctx.fillRect(0,0,W,H);
 zoom=clamp(Math.min(W/760,H/430),.66,1.5);
 var vw=W/zoom,vh=H/zoom,cx=vw>=WORLD.w?WORLD.w/2:clamp(cam.x,vw/2,WORLD.w-vw/2),cy=vh>=WORLD.h?WORLD.h/2:clamp(cam.y,vh/2,WORLD.h-vh/2);
 var shake=state.phase==="playing"?state.shake:0;
 ctx.save();ctx.translate(W/2+(Math.random()-.5)*shake,H/2+(Math.random()-.5)*shake);ctx.scale(zoom,zoom);ctx.translate(-cx,-cy);
 ctx.drawImage(terrain,0,0);
 tireMarks.forEach(function(m){ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.angle);ctx.fillStyle="#12211e14";ctx.fillRect(-6,-21,12,4);ctx.fillRect(-6,17,12,4);ctx.restore();});
 if(state.phase==="playing"||state.phase==="paused"||state.phase==="result"){
  var r=route(),t=objectivePoint();
  if(state.deliveries<phaseData().deliveries){
   var pulse=.5+.5*Math.sin(clock*4);ctx.strokeStyle=state.cargo?"#8bf4bb":r.color;ctx.lineWidth=2;ctx.globalAlpha=.55+pulse*.3;
   ctx.beginPath();ctx.ellipse(t.x,t.y,54+pulse*5,40+pulse*4,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
   if(!state.cargo)pallet(ctx,t.x,t.y,r.letter,r.color,1);
   label(ctx,state.cargo?"ENTREGAR":"PEGAR",t.x,t.y-53-Math.sin(clock*3)*3,12,state.cargo?"#a7ffd0":"#ffebaa");
  }
  traffic.forEach(function(b){forklift(ctx,b.x,b.y,b.angle,b.color,false,false);});
 }
 if(state.phase==="menu"||state.phase==="workshop"){routes.forEach(function(r){pallet(ctx,r.pick.x,r.pick.y,r.letter,r.color,1);});forklift(ctx,865,670,-.25,"#ffb52e",false,true);}
 else forklift(ctx,player.x,player.y,player.angle,state.damageCooldown>.8?"#ffe6a0":"#f4b337",!!state.cargo,true);
 particles.forEach(function(p){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);});ctx.globalAlpha=1;
 ctx.restore();
 if(state.phase==="playing"&&state.deliveries<phaseData().deliveries){
  var p=objectivePoint(),sx=(p.x-cx)*zoom+W/2,sy=(p.y-cy)*zoom+H/2;
  if(sx<50||sx>W-50||sy<130||sy>H-110){
   var dx=sx-W/2,dy=sy-H/2,a=Math.atan2(dy,dx),arx=clamp(sx,49,W-49),ary=clamp(sy,135,H-125);
   ctx.save();ctx.translate(arx,ary);ctx.rotate(a);ctx.fillStyle=state.cargo?"#9bf0bc":"#ffd166";ctx.strokeStyle="#18343a";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(-10,-10);ctx.lineTo(-5,0);ctx.lineTo(-10,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
   label(ctx,state.cargo?"DOCA "+route().letter:"PALLET",arx,ary+22,10,"#fff0cb");
  }
  drawMinimap();
 }
}
function drawMinimap(){
 if(W<600)return;
 var mw=118,mh=77,x=W-138,y=73,s=mw/WORLD.w;
 rr(ctx,x,y,mw,mh,5,"#0b2427c9","#9cbdb34a");ctx.save();ctx.beginPath();ctx.rect(x+2,y+2,mw-4,mh-4);ctx.clip();
 ctx.fillStyle="#668485";shelves.forEach(function(r){ctx.fillRect(x+r.x*s,y+r.y*(mh/WORLD.h),r.w*s,r.h*(mh/WORLD.h));});
 var t=objectivePoint();ctx.fillStyle=state.cargo?"#9bf0bc":"#ffd166";ctx.beginPath();ctx.arc(x+t.x*s,y+t.y*(mh/WORLD.h),3.5,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x+player.x*s,y+player.y*(mh/WORLD.h),3,0,Math.PI*2);ctx.fill();ctx.restore();
}
function resize(){W=window.innerWidth;H=window.innerHeight;DPR=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);}
var upgrades=[
 {id:"engine",name:"MOTOR PREPARADO",desc:"Mais velocidade e força nas retas."},
 {id:"tires",name:"PNEUS DE ADERÊNCIA",desc:"Direção mais ágil e frenagem mais rápida."},
 {id:"forks",name:"GARFOS REFORÇADOS",desc:"A carga sofre menos dano nas batidas."}
];
function workshop(){
 state.phase="workshop";overlays("workshop");$("bank").textContent="SEU SALDO: "+saved.credits+" CRÉDITOS";$("upgrade-list").textContent="";
 upgrades.forEach(function(u){
  var level=saved.upgrades[u.id],cost=[80,140,220][level],row=document.createElement("div");row.className="upgrade";
  var text=document.createElement("div"),title=document.createElement("b"),detail=document.createElement("small");
  title.textContent=u.name+" · "+level+"/3";detail.textContent=u.desc;text.append(title,detail);
  var button=document.createElement("button");button.textContent=level===3?"MÁXIMO":cost+" CR";button.disabled=level===3||saved.credits<cost;
  button.addEventListener("click",function(){var lv=saved.upgrades[u.id],price=[80,140,220][lv];if(lv>=3||saved.credits<price)return;saved.credits-=price;saved.upgrades[u.id]++;persist();pickupSound();workshop();});
  row.append(text,button);$("upgrade-list").append(row);
 });
}
$("start").addEventListener("click",start);$("again").addEventListener("click",start);$("pause").addEventListener("click",pause);$("resume").addEventListener("click",resume);
$("quit").addEventListener("click",goMenu);$("result-menu").addEventListener("click",goMenu);$("workshop-button").addEventListener("click",workshop);$("close-workshop").addEventListener("click",goMenu);
$("sound").addEventListener("click",function(){saved.sound=!saved.sound;persist();if(saved.sound){initAudio();tone(440,.1,"sine",.025);}menuInfo();});
$("action").addEventListener("pointerdown",function(e){e.preventDefault();action();});
$("turbo").addEventListener("pointerdown",function(e){e.preventDefault();heldTurbo=true;this.setPointerCapture(e.pointerId);this.classList.add("held");initAudio();});
["pointerup","pointercancel","lostpointercapture"].forEach(function(event){$("turbo").addEventListener(event,function(){heldTurbo=false;this.classList.remove("held");});});
function moveStick(e){
 var r=$("joystick").getBoundingClientRect(),max=r.width*.33,dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,n=len(dx,dy);
 if(n>max){dx=dx/n*max;dy=dy/n*max;}stick.x=dx/max;stick.y=dy/max;
 if(len(stick.x,stick.y)<.09){stick.x=stick.y=0;dx=dy=0;}
 $("knob").style.transform="translate("+dx+"px,"+dy+"px)";
}
$("joystick").addEventListener("pointerdown",function(e){e.preventDefault();if(stick.id!==null)return;stick.id=e.pointerId;this.setPointerCapture(e.pointerId);moveStick(e);initAudio();});
$("joystick").addEventListener("pointermove",function(e){if(e.pointerId===stick.id){e.preventDefault();moveStick(e);}});
["pointerup","pointercancel","lostpointercapture"].forEach(function(event){$("joystick").addEventListener(event,function(e){if(e.pointerId===stick.id){stick.id=null;stick.x=stick.y=0;$("knob").style.transform="";}});});
window.addEventListener("keydown",function(e){
 var k=e.key.toLowerCase();if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift","e","escape"].indexOf(k)>=0)e.preventDefault();
 keys[k]=true;if(k==="e"&&!e.repeat)action();if(k==="escape"&&!e.repeat){if(state.phase==="playing")pause();else if(state.phase==="paused")resume();}
});
window.addEventListener("keyup",function(e){keys[e.key.toLowerCase()]=false;});
window.addEventListener("blur",function(){stopInputs();pause();});
document.addEventListener("visibilitychange",function(){if(document.hidden){stopInputs();pause();}});
window.addEventListener("resize",resize);window.addEventListener("contextmenu",function(e){e.preventDefault();});
window.EmpilhaGame={
 pause:pause,
 snapshot:function(){return {phase:state.phase,x:player.x,y:player.y,speed:len(player.vx,player.vy),time:state.time,deliveries:state.deliveries,cargo:state.cargo?Math.ceil(state.cargo.integrity):null,energy:state.energy,credits:saved.credits,score:state.score};}
};
function frame(now){var dt=last?Math.min(.05,(now-last)/1000):0;last=now;update(dt);render();requestAnimationFrame(frame);}
makeTerrain();resize();menuInfo();requestAnimationFrame(frame);
})();
