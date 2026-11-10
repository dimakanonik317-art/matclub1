// Node 24, Chromium CDP on port 9223; serve dist on port 8767.
// Only the AI HTTP response is mocked; touch/mouse events use real Chromium.
import fs from 'node:fs/promises';
const targets=await(await fetch((process.env.CDP_URL||'http://127.0.0.1:9223')+'/json')).json();
const ws=new WebSocket(targets.find(x=>x.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let id=0;const waiting=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=waiting.get(m.id);waiting.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;waiting.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
const viewport=async(width,height)=>send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
const navigate=async(url)=>{await send('Page.navigate',{url});await new Promise(r=>setTimeout(r,900))};
const screenshot=async path=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path,Buffer.from(r.data,'base64'))};
const close=()=>ws.close();

import assert from 'node:assert/strict';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function rect(){return evaluate('(()=>{const r=document.querySelector("#aiLaunch").getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()')}
async function drag(dx,dy,touch=false){const r=await rect(),x=r.x+r.w/2,y=r.y+r.h/2;if(touch){await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}else{await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+dx,y:y+dy,button:'left',buttons:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+dx,y:y+dy,button:'left',clickCount:1})}await wait(80)}
try{
for(const[w,h]of [[393,852],[1440,900]]){await viewport(w,h);await navigate(process.env.SITE_URL||'http://127.0.0.1:8767/');await evaluate('localStorage.removeItem("matclub-ai-position-v1")');await navigate(process.env.SITE_URL||'http://127.0.0.1:8767/');const old=await rect();await drag(-120,-150,w<768);let r=await rect();assert.ok(Math.abs(r.x-old.x)>60&&Math.abs(r.y-old.y)>60,JSON.stringify({old,r}));assert.equal(await evaluate('document.querySelector("#aiDialog").open'),false);const saved=await evaluate('localStorage.getItem("matclub-ai-position-v1")');assert.ok(saved);await navigate(process.env.SITE_URL||'http://127.0.0.1:8767/');r=await rect();assert.ok(Math.abs(r.x-(old.x-120))<2);await evaluate('document.querySelector("#aiLaunch").click()');assert.equal(await evaluate('document.querySelector("#aiDialog").open'),true);await evaluate('window.fetch=async()=>new Response(JSON.stringify({answer:"Привет! Чем помочь?"}),{status:200,headers:{"content-type":"application/json"}});document.querySelector("#aiInput").value="привет";document.querySelector("#aiForm").requestSubmit()');await wait(100);const message=await evaluate('(()=>{const e=document.querySelector(".ai-user"),r=e.getBoundingClientRect();return{h:r.height,w:r.width,font:getComputedStyle(e).fontSize}})()');if(w<768){assert.ok(message.h<75&&message.w<180,JSON.stringify(message));await screenshot('/tmp/ai-compact-chat.png')}await evaluate('document.querySelector("#aiDialog").close()');await drag(-2000,-2000,w<768);r=await rect();assert.ok(r.x>=0&&r.y>=0);console.log('PASS drag, no accidental chat, persistence, clamp, normal click, compact greeting',w,message)}
await viewport(320,568);await wait(80);const r=await rect();assert.ok(r.x>=0&&r.x+r.w<=321&&r.y+r.h<=569);await evaluate('document.querySelector("#aiLaunch").dispatchEvent(new KeyboardEvent("keydown",{key:"Home",altKey:true,bubbles:true}))');assert.equal(await evaluate('localStorage.getItem("matclub-ai-position-v1")'),null);console.log('PASS resize clamping and keyboard reset');
}finally{close()}
