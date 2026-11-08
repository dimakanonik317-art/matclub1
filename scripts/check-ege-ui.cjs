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

const t=setup(),{w,d,click}=t;
assert.equal(w.eval('tasks.length'),874);
assert.equal(d.querySelector('[data-subject="ege"]').hidden,true);
click('[data-grade="11"]');assert.equal(d.querySelector('[data-subject="ege"]').hidden,false);
click('[data-subject="ege"]');assert.equal(d.querySelector('#egeIntro').hidden,false);
assert.equal(w.eval('pool().length'),6);assert.equal(d.querySelectorAll('#topics .topic').length,3);
assert.equal(d.querySelector('[data-level="3"]').hidden,true);
const bank=w.eval('tasks.filter(t=>t.exam==="ege")');
for(const task of bank){
 assert.equal(task.grade,11);assert.equal(task.domain,'math');
 assert.equal(task.source.url,'https://math-ege.sdamgia.ru/problem?id='+task.source.id);
 assert.ok(w.eval('pool()').some(t=>t.id===task.id));
 w.eval(`openTask(${JSON.stringify(task.id)})`);
 const link=d.querySelector('.task-source a');assert.equal(link.href,task.source.url);assert.equal(link.rel,'noopener noreferrer');
 d.querySelector('#answer').value='999999';d.querySelector('#answerForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.ok(d.querySelector('#feedback').classList.contains('error'));
 d.querySelector('#answer').value=String(task.answer).replace('.',',');d.querySelector('#answerForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.ok(w.eval('solved').includes(task.id));
 click('#revealAllSteps');assert.equal(d.querySelectorAll('[data-solution-step][hidden]').length,0);click('#nextTask');assert.ok(w.eval('activeTask.exam')==='ege');d.querySelector('#taskDialog').close();
}
click('[data-topic="5"]');assert.equal(w.eval('pool().length'),3);click('[data-topic="5"]');
click('[data-level="1"]');assert.equal(w.eval('pool().length'),2);
click('[data-subject="algebra"]');assert.ok(w.eval('pool()').every(t=>!t.exam));assert.equal(d.querySelector('#egeIntro').hidden,true);assert.equal(d.querySelector('[data-level="3"]').hidden,false);
click('[data-subject="ege"]');click('[data-grade="10"]');assert.equal(w.eval('state.subject'),'algebra');assert.equal(d.querySelector('[data-subject="ege"]').hidden,true);assert.ok(w.eval('pool().length')>0);
click('[data-grade="11"]');click('[data-subject="ege"]');click('[data-domain="physics"]');assert.equal(d.querySelector('#egeIntro').hidden,true);assert.ok(w.eval('pool()').every(t=>t.domain==='physics'));
const solved=w.localStorage.getItem('matclub-solved');assert.equal(JSON.parse(solved).filter(id=>id.startsWith('ege-')).length,6);
assert.equal(t.errors.length,0,t.errors.map(e=>e.stack).join('\n'));t.dom.window.close();
const restored=setup({'matclub-solved':solved},'https://test.local/?exam=ege');assert.equal(restored.w.eval('state.subject'),'ege');assert.equal(restored.w.eval('pool().length'),6);assert.equal(restored.d.querySelectorAll('.task-card .solved-label').length,6);assert.equal(restored.d.querySelectorAll('.new-label').length,0);assert.equal(restored.errors.length,0);restored.dom.window.close();
// Independently evaluate representative formulas used in the explanations.
assert.equal(6/3,2);assert.equal(21/7,3);assert.equal(12*(1/2)**2*3,9);assert.equal(8/20,.4);
let count=0;for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)if(a+b===5)count++;assert.equal(count,4);
const derivative=x=>3*x*x+4*x+1;assert.equal(derivative(-1),0);assert.ok(derivative(-1.01)>0&&derivative(-.99)<0);
console.log('PASS: EGE tab visibility, six workspaces, answers, sources, filters, next-task isolation, saved progress and deep link.');
