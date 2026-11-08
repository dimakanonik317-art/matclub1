/* Run with jsdom available (Node's NODE_PATH may point to an existing QA install). */
const {JSDOM,VirtualConsole}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),raw=fs.readFileSync(path.join(root,'index.html'),'utf8'),scripts=[...raw.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);
function setup(stored={},url='https://test.local/'){
 const errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(raw.replace(/<script[^>]*src=[^>]+><\/script>/g,'').replace(/<link[^>]*>/g,''),{url,runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window,d=w.document;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.HTMLCanvasElement.prototype.getContext=()=>({scale(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}});w.ResizeObserver=class{observe(){}};w.URL.createObjectURL=b=>{downloads.push(b);return'blob:test'};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
 const frames=new Map();let counter=0;w.requestAnimationFrame=fn=>{frames.set(++counter,fn);return counter};w.cancelAnimationFrame=id=>frames.delete(id);
 for(const[k,v]of Object.entries(stored))w.localStorage.setItem(k,v);
 for(const f of scripts){const el=d.createElement('script');el.textContent=fs.readFileSync(path.join(root,f),'utf8');d.body.append(el)}
 const click=s=>{const el=d.querySelector(s);assert.ok(el,'missing '+s);el.click();return el};
 const change=(s,value,event='change')=>{const el=d.querySelector(s);assert.ok(el);el.value=String(value);el.dispatchEvent(new w.Event(event,{bubbles:true}));return el};
 return{dom,w,d,errors,downloads,click,change,advance(ms){const f=[...frames.values()];frames.clear();for(const fn of f)fn(ms)}};
}

const t=setup(),{w,d,click}=t;for(const file of ['app.css','customization.css']){const style=d.createElement('style');style.textContent=fs.readFileSync(path.join(root,file),'utf8');d.head.append(style)}for(const preset of ['classic','night','paper','focus']){click(`[data-setting-preset="${preset}"]`);assert.equal(d.querySelector('.hero').hidden,false);assert.notEqual(w.getComputedStyle(d.querySelector('.hero')).display,'none',preset);}w.matclubSettings.set({focus:true});assert.notEqual(w.getComputedStyle(d.querySelector('.hero')).display,'none');click('[data-view=graphs]');assert.equal(d.querySelector('.hero').hidden,true);click('[data-domain=physics]');assert.equal(d.querySelector('.hero').hidden,false);assert.notEqual(w.getComputedStyle(d.querySelector('.hero')).display,'none');assert.equal(t.errors.length,0,t.errors.map(e=>e.message).join('\n'));t.dom.window.close();console.log('PASS: hero visible in all four presets and concentration mode; hidden correctly in graphs; physics catalogue preserved.');
