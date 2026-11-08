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
(async()=>{
const t=setup(),{w,d,click,change}=t;assert.equal(w.eval('tasks.length'),868);assert.equal(d.querySelector('#labWorkspace'),null,'lazy mount');click('[data-view=laboratory]');assert.equal(d.querySelector('#labSection').hidden,false);assert.equal(d.querySelector('#catalog').hidden,true);assert.equal(d.querySelectorAll('.lab-card').length,20);assert.equal(d.querySelector('#breadcrumb').textContent,'Физическая лаборатория');assert.ok(!d.querySelector('#labSection').textContent.includes('Бета'));
for(const e of w.matclubLabModels.labs){
 w.matclubLab.open(e.id);assert.equal(d.querySelector('#labExperimentTitle').textContent,e.title);assert.ok(d.querySelector('#labScene svg'));
 const ids=[...d.querySelectorAll('#labSection [id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length,'unique DOM IDs');
 assert.ok(!/NaN|Infinity/.test(d.querySelector('#labScene').innerHTML+d.querySelector('#labChart').innerHTML),e.id);
 click('#labPin');assert.equal(w.matclubLab.state.baseline!==null,true);
 const first=e.params.find(p=>!p.options);change(`[data-lab-range=${first.key}]`,first.max,'input');assert.equal(w.matclubLab.state.params[first.key],first.max);assert.equal(d.querySelector('#labBaselineLegend').hidden,false);
 for(const preset of[0,1])click(`[data-lab-preset="${preset}"]`);
 if(!e.sweep){change('#labTime',1000,'input');assert.ok(w.matclubLab.state.time>0);assert.ok(!/NaN|Infinity/.test(d.querySelector('#labScene').innerHTML));click('#labRestart');assert.equal(w.matclubLab.state.time,0);click('#labStep');assert.ok(w.matclubLab.state.time>0)}
 click('#labRecord');assert.equal(w.matclubLab.state.measurements,1);assert.ok(d.querySelector('tbody tr'));click('#labExport');click('#labDownloadPlot');assert.equal(t.downloads.length>0,true);
 const p=w.matclubLab.state.params,r=e.calc(p,w.matclubLab.state.time),answer=e.answer(p,r);change('#labAnswer',answer);d.querySelector('#labAnswerForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(d.querySelector('#labAnswerResult').dataset.correct,'true');change('#labAnswer','999999999');d.querySelector('#labAnswerForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(d.querySelector('#labAnswerResult').dataset.correct,'false');
 const text=fs.readFileSync(path.join(root,`laboratory/${e.id}/index.html`),'utf8');assert.ok(text.includes(e.title));assert.ok(text.includes(`/?lab=${e.id}`));
}
w.matclubLab.open('projectile');click('#labReset');change('#labHypothesis','<script>alert(1)</script>','input');change('#labConclusion','=SUM(A1:A3)','input');assert.ok(w.matclubLab.csv().includes("'=SUM(A1:A3)"),'spreadsheet formula escaped');assert.ok(d.querySelector('#labHypothesis').value.includes('<script>'));
change('[data-lab-param=v]','');assert.equal(w.matclubLab.state.params.v,20);assert.ok(d.querySelector('[data-lab-param=v]').validationMessage);
change('[data-lab-param=v]',10000);assert.equal(w.matclubLab.state.params.v,40);click('#labReset');assert.equal(w.matclubLab.state.params.v,20);assert.equal(w.matclubLab.state.measurements,1,'reset keeps journal');
click('#labPlay');t.advance(100);t.advance(180);assert.ok(w.matclubLab.state.time>0);assert.equal(w.matclubLab.state.playing,true);click('[data-view=graphs]');await Promise.resolve();assert.equal(w.matclubLab.state.playing,false,'stop on navigation');assert.equal(d.querySelector('#graphSection').hidden,false);assert.equal(d.querySelector('#labSection').hidden,true);
click('[data-domain=physics]');assert.equal(d.querySelector('#catalog').hidden,false);click('#computingNav');assert.equal(d.querySelector('#computingSection').hidden,false);click('[data-view=laboratory]');
change('#labGroup','Тепло');assert.equal(d.querySelectorAll('.lab-card').length,3);change('#labGroup','all');change('#labSearch','линза','input');assert.equal(d.querySelectorAll('.lab-card').length,1);change('#labSearch','неттакого','input');assert.equal(d.querySelectorAll('.lab-card').length,0);change('#labSearch','','input');change('#labGrade','7');assert.equal(d.querySelectorAll('.lab-card').length,2);change('#labGrade','all');
const storage=w.localStorage.getItem('matclub-laboratory-v1');assert.equal(t.errors.length,0,t.errors.map(e=>e.stack).join('\n'));t.dom.window.close();
const re=setup({'matclub-laboratory-v1':storage},'https://test.local/?lab=lens');assert.equal(re.d.querySelector('#labSection').hidden,false);assert.equal(re.w.matclubLab.state.id,'lens');re.w.matclubLab.open('projectile');assert.ok(re.d.querySelector('#labHypothesis').value.includes('<script>'));assert.equal(re.d.querySelector('#labHypothesis script'),null);assert.equal(re.w.matclubLab.state.measurements,1);assert.equal(re.errors.length,0);re.dom.window.close();
const invalid=setup({'matclub-laboratory-v1':'{not json'},'https://test.local/?lab=bad');invalid.click('[data-view=laboratory]');assert.equal(invalid.errors.length,0);invalid.dom.window.close();
const css=new JSDOM('<html><head></head><body></body></html>');for(const f of['app.css','experience.css','python.css','lab.css']){const style=css.window.document.createElement('style');style.textContent=fs.readFileSync(path.join(root,f),'utf8');css.window.document.head.append(style);assert.ok(style.sheet?.cssRules.length>0)}css.window.close();
console.log('PASS: 20 interactive views, presets, graphs, answer checks, CSV/SVG exports, persistence, escaped notes, invalid input, filters, frame stepping, pause on navigation, deep links, CSS parsing and 868 preserved school tasks.');
})();
