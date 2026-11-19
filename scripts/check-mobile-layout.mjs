// Real Chromium layout check, Node 24; no npm dependencies.
// Start a local static server and Chromium with --remote-debugging-port=9223.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const targets=await(await fetch((process.env.CDP_URL||'http://127.0.0.1:9223')+'/json')).json();
const ws=new WebSocket(targets.find(x=>x.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let id=0;const waiting=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=waiting.get(m.id);waiting.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;waiting.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
const viewport=async(width,height)=>send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
const navigate=async(url)=>{await send('Page.navigate',{url});await new Promise(r=>setTimeout(r,900))};
const screenshot=async filename=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(process.env.PREVIEW_DIR || os.tmpdir(),filename),Buffer.from(r.data,'base64'))};
const close=()=>ws.close();

import assert from 'node:assert/strict';

const click=async s=>{await evaluate(`document.querySelector(${JSON.stringify(s)}).click()`);await new Promise(r=>setTimeout(r,350))};
const layout=()=>evaluate(`(()=>{const rect=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {width:r.width,height:r.height,x:r.x,y:r.y,display:getComputedStyle(e).display}};return {width:innerWidth,scroll:document.documentElement.scrollWidth,hero:rect('.hero'),art:rect('.hero-art'),title:rect('.hero h1'),start:rect('#start'),controls:rect('.phase-controls'),support:rect('#supportProject'),account:rect('#accountButton'),columns:getComputedStyle(document.querySelector('.topics')).gridTemplateColumns}})()`);
try{
for(const [w,h]of [[320,568],[360,800],[375,667],[390,844],[393,852],[414,896],[430,932],[540,720],[600,960],[767,1000],[844,390],[1024,768],[1440,900]]){
 await viewport(w,h);await navigate(process.env.SITE_URL||'http://127.0.0.1:8765/');
 for(const domain of ['math','physics']){
  await click(`button[data-domain=${domain}]`);const l=await layout();assert.ok(l.scroll<=w+1,`overflow ${w} ${domain}: ${JSON.stringify(l)}`);assert.ok(l.art.width>60&&l.art.height>50&&l.art.display!=='none',`missing art ${w}`);
  for(const key of (w<768||(w<1024&&h<500)?['support','account']:[]))assert.ok(l[key].width>=44&&l[key].height>=44,`button ${w} ${key}`);
  assert.ok(l.title.x >= l.hero.x && l.title.x+l.title.width <= l.hero.x+l.hero.width+1, `clipped cover title at ${w}`);
  assert.ok(l.controls.y+l.controls.height <= l.hero.y+l.hero.height+1, `clipped controls at ${w}`);
  if(w<768)assert.ok(l.start.y+l.start.height <= h, `course action below first viewport at ${w}`);
 }
 for(const view of ['graphs','laboratory','computing']){
  await click(`[data-view=${view}]`);await new Promise(r=>setTimeout(r,70));
  const over=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})');assert.ok(over.scroll<=w+1,`${view} overflow at ${w}: ${over.scroll}`);
 }
 console.log('PASS width',w,h);
}
await viewport(393,852);await navigate(process.env.SITE_URL||'http://127.0.0.1:8765/');
await click('button[data-domain=physics]');await screenshot('matclub-physics-phone.png');
await click('button[data-domain=math]');await evaluate('document.querySelector(".topics").scrollIntoView()');await new Promise(r=>setTimeout(r,500));await screenshot('matclub-topics-phone.png');
for(const id of ['accountButton','supportProject']){await click('#'+id);assert.ok(await evaluate('!!document.querySelector("dialog[open]")'));await evaluate('document.querySelector("dialog[open]").close()')}
await evaluate('document.documentElement.dataset.theme="dark";document.documentElement.dataset.focus="on";scrollTo(0,0)');assert.ok((await layout()).art.width>60);await screenshot('matclub-dark-phone.png');
}finally{close()}
