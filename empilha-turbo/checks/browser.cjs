const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),http=require("node:http");
const base=path.resolve(__dirname,"../app/src/main/assets");
const out=path.resolve(__dirname,"../../empilha-output");fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,"http://localhost").pathname;
 const file=path.resolve(base,"."+ (pathname==="/"?"/index.html":pathname));
 if(!file.startsWith(base+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}
 const ext=path.extname(file);res.setHeader("Content-Type",ext===".js"?"text/javascript":ext===".css"?"text/css":"text/html; charset=utf-8");res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:1,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(error.message));
 const snap=()=>page.evaluate(()=>window.EmpilhaGame.snapshot());
 try{
  await page.goto("http://127.0.0.1:"+server.address().port,{waitUntil:"load"});
  await page.waitForFunction(()=>!!window.EmpilhaGame);
  await page.screenshot({path:path.join(out,"Empilha_Turbo_Menu.png")});
  for(const id of ["start","sound","workshop-button"]){
   const box=await page.locator("#"+id).boundingBox();assert(box&&box.x>=0&&box.y>=0&&box.x+box.width<=915&&box.y+box.height<=412,id+" fits landscape viewport");
  }
  await page.locator("#start").click();await page.waitForTimeout(150);assert.equal((await snap()).phase,"playing");
  async function drive(key,axis,target){
   const before=await snap(),direction=target>before[axis]?1:-1,started=Date.now();
   await page.keyboard.down(key);
   while(true){const s=await snap();if(direction*(target-s[axis])<15)break;if(Date.now()-started>15000)throw Error("Drive timeout "+key+" "+JSON.stringify(s));await page.waitForTimeout(80);}
   await page.keyboard.up(key);await page.waitForTimeout(550);
  }
  await drive("d","x",248);await page.keyboard.press("e");await page.waitForTimeout(120);assert.equal((await snap()).cargo,100,"pallet pickup");
  await page.keyboard.down("Shift");await page.keyboard.down("d");await page.waitForTimeout(450);await page.keyboard.up("Shift");await page.keyboard.up("d");await page.waitForTimeout(350);assert((await snap()).energy<1,"turbo consumes energy");
  await drive("d","x",1070);await drive("w","y",169);await page.keyboard.press("e");await page.waitForTimeout(150);
  assert.equal((await snap()).deliveries,1,"complete a real driven delivery");
  await page.screenshot({path:path.join(out,"Empilha_Turbo_Partida.png")});
  await page.locator("#pause").click();const paused=await snap();assert.equal(paused.phase,"paused");await page.waitForTimeout(600);assert.equal((await snap()).time,paused.time,"pause freezes timer");
  await page.locator("#resume").click();assert.equal((await snap()).phase,"playing");await page.keyboard.press("Escape");await page.locator("#quit").click();
  await page.evaluate(()=>localStorage.setItem("empilha_turbo_save_v1",JSON.stringify({credits:160,upgrades:{engine:0,tires:0,forks:0},best:0,sound:false})));
  await page.reload();await page.locator("#workshop-button").click();await page.locator(".upgrade").first().locator("button").click();assert.equal((await snap()).credits,80,"upgrade price");
  await page.reload();await page.locator("#workshop-button").click();assert((await page.locator(".upgrade").first().innerText()).includes("1/3"),"upgrade persists");
  await page.locator("#close-workshop").click();
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,"Empilha_Turbo_Vertical.png")});
  assert(await page.locator("#start").isVisible());
  await page.locator("#start").click();await page.waitForTimeout(100);
  for(const id of ["joystick","action","turbo"]){const b=await page.locator("#"+id).boundingBox();assert(b&&b.x>=0&&b.y>=0&&b.x+b.width<=390&&b.y+b.height<=844,id+" fits portrait");}
  assert.deepEqual(errors,[],"no browser runtime errors");
  const portable=await browser.newPage({viewport:{width:915,height:412}});portable.on("pageerror",e=>errors.push(e.message));
  await portable.goto("file://"+path.join(out,"Empilha_Turbo_TESTE.html"));
  await portable.locator("#start").click();await portable.waitForTimeout(200);
  assert.equal(await portable.evaluate(()=>window.EmpilhaGame.snapshot().phase),"playing","self-contained HTML runs offline");
  assert.deepEqual(errors,[]);
  const summary={passed:true,checks:["landscape layout","keyboard movement","pickup","turbo energy","real route delivery","pause timer","upgrade purchase and persistence","portrait controls","offline HTML","no JS errors"]};
  fs.writeFileSync(path.join(out,"validacao.json"),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
 }catch(e){await page.screenshot({path:path.join(out,"Empilha_Turbo_Erro.png")}).catch(()=>{});throw e;}
 finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
