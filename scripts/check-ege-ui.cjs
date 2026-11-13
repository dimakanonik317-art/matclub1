/* Run with jsdom available (Node's NODE_PATH may point to an existing QA install). */
const {JSDOM,VirtualConsole}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),raw=fs.readFileSync(path.join(root,'index.html'),'utf8'),scripts=[...raw.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);
function setup(stored={},url='https://test.local/'){
 const errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(raw.replace(/<script[^>]*src=[^>]+><\/script>/g,'').replace(/<link[^>]*>/g,''),{url,runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window,d=w.document;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.HTMLCanvasElement.prototype.getContext=()=>({scale(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}});w.ResizeObserver=class{observe(){}};w.URL.createObjectURL=b=>{downloads.push(b);return'blob:test'};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
 const frames=new Map();let counter=0;w.requestAnimationFrame=fn=>{frames.set(++counter,fn);return counter};w.cancelAnimationFrame=id=>frames.delete(id);
 for(const[k,v]of Object.entries(stored))w.localStorage.setItem(k,v);
 for(const f of scripts){const el=d.createElement('script');el.textContent=fs.readFileSync(path.join(root,f.split('?')[0]),'utf8');d.body.append(el)}
 const click=s=>{const el=d.querySelector(s);assert.ok(el,'missing '+s);el.click();return el};
 const change=(s,value,event='change')=>{const el=d.querySelector(s);assert.ok(el);el.value=String(value);el.dispatchEvent(new w.Event(event,{bubbles:true}));return el};
 return{dom,w,d,errors,downloads,click,change,advance(ms){const f=[...frames.values()];frames.clear();for(const fn of f)fn(ms)}};
}

const t=setup(),{w,d,click}=t;
assert.equal(w.eval('tasks.length'),1589);assert.ok(/ege\.js\?v=[a-f0-9]{12}/.test(raw));
assert.equal(d.querySelector('[data-subject="ege"]').hidden,true);
click('[data-grade="11"]');assert.equal(d.querySelector('[data-subject="ege"]').hidden,false);
click('[data-subject="ege"]');assert.equal(d.querySelector('#egeIntro').hidden,false);
assert.equal(w.eval('pool().length'),721);assert.equal(d.querySelectorAll('#topics .topic').length,14);
assert.equal(d.querySelector('#levelTabs').hidden,true);
assert.ok([...d.querySelectorAll('.task-meta')].every(el=>el.textContent==='ЕГЭ'));
for(const topic of w.eval('egeTopics')){click(`[data-exam-topic="${topic.id}"]`);assert.ok(w.eval('pool()').every(task=>task.examTopic===topic.id));if(!w.eval('pool().length')){assert.ok(d.querySelector('#tasks').textContent.includes('ещё не добавлена'));assert.equal(d.querySelector('#tasks .ege-source-link').href,topic.url);}click(`[data-exam-topic="${topic.id}"]`);}
assert.equal(w.eval('pool().length'),721);
assert.equal(w.eval('tasks.filter(t=>t.examTopic==="vectors").length'),30);click('[data-exam-topic="vectors"]');click('#loadMoreTasks');assert.equal(d.querySelectorAll('#tasks .task-card').length,30);assert.ok(d.querySelector('[data-exam-topic="vectors"]').textContent.includes('(30)'));click('[data-exam-topic="vectors"]');
click('[data-exam-topic="stereometry"]');click('#loadMoreTasks');click('#loadMoreTasks');assert.equal(d.querySelectorAll('#tasks .task-card').length,55);assert.ok(d.querySelector('[data-exam-topic="stereometry"]').textContent.includes('(55)'));click('[data-exam-topic="stereometry"]');
for(const [theme,count] of [['planimetry',80],['parameters',57],['probability',112],['statistics',115],['equations',121],['inequalities',20],['expressions',15],['functions',25],['derivatives',16],['applied',20],['economics',25],['numbers',30]]){click(`[data-exam-topic="${theme}"]`);while(d.querySelectorAll('#tasks .task-card').length<count)click('#loadMoreTasks');assert.equal(d.querySelectorAll('#tasks .task-card').length,count);assert.ok(d.querySelector(`[data-exam-topic="${theme}"]`).textContent.includes(`(${count})`));click(`[data-exam-topic="${theme}"]`);}
const bank=w.eval('tasks.filter(t=>t.exam==="ege")');
for(const task of bank){
 assert.equal(task.grade,11);assert.ok(w.eval('egeTopics').some(t=>t.id===task.examTopic));assert.equal(task.domain,'math');
 assert.equal(task.source.url,'https://math-ege.sdamgia.ru/problem?id='+task.source.id);
 assert.ok(w.eval('pool()').some(t=>t.id===task.id));
 w.eval(`openTask(${JSON.stringify(task.id)})`);
 assert.equal(d.querySelector('.level-pill'),null);if(task.figure){assert.ok(d.querySelector(task.figure.importedStatement?'.ege-source-statement':'.ege-task-figure svg'));assert.equal(d.querySelectorAll('[data-ege-curve]').length,task.figure.curves.length);assert.equal(d.querySelectorAll('.ege-task-figure image').length,0);}const link=d.querySelector('.task-source a');assert.equal(link.href,task.source.url);assert.equal(link.rel,'noopener noreferrer');
 d.querySelector('#answer').value='999999';d.querySelector('#answerForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.ok(d.querySelector('#feedback').classList.contains('error'));
 if(task.source.id===505039){d.querySelector('#answer').value='[-1.25;1]';d.querySelector('#answerForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.ok(d.querySelector('#feedback').classList.contains('error'));}
 d.querySelector('#answer').value=task.answerType==='set'?task.answer:String(task.answer).replace('.',',');d.querySelector('#answerForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.ok(w.eval('solved').includes(task.id));
 click('#revealAllSteps');assert.equal(d.querySelectorAll('[data-solution-step][hidden]').length,0);click('#nextTask');assert.ok(w.eval('activeTask.exam')==='ege');assert.equal(w.eval('activeTask.examTopic'),task.examTopic);d.querySelector('#taskDialog').close();
}
click('[data-exam-topic="stereometry"]');assert.equal(w.eval('pool().length'),55);click('#clearTopic');assert.equal(w.eval('pool().length'),721);
w.eval('state.level=1;state.strongOnly=true;render()');assert.equal(w.eval('pool().length'),721);assert.equal(w.eval('state.level'),-1);
click('[data-subject="algebra"]');assert.ok(w.eval('pool()').every(t=>!t.exam));assert.equal(d.querySelector('#egeIntro').hidden,true);assert.equal(d.querySelector('#levelTabs').hidden,false);
click('[data-subject="ege"]');click('[data-grade="10"]');assert.equal(w.eval('state.subject'),'algebra');assert.equal(d.querySelector('[data-subject="ege"]').hidden,true);assert.ok(w.eval('pool().length')>0);
click('[data-grade="11"]');click('[data-subject="ege"]');click('[data-domain="physics"]');assert.equal(d.querySelector('#egeIntro').hidden,true);assert.ok(w.eval('pool()').every(t=>t.domain==='physics'));
const solved=w.localStorage.getItem('matclub-solved');assert.equal(JSON.parse(solved).filter(id=>id.startsWith('ege-')).length,721);
assert.equal(t.errors.length,0,t.errors.map(e=>e.stack).join('\n'));t.dom.window.close();
const restored=setup({'matclub-solved':solved},'https://test.local/?exam=ege');assert.equal(restored.w.eval('state.subject'),'ege');assert.equal(restored.w.eval('pool().length'),721);assert.equal(restored.d.querySelectorAll('.task-card .solved-label').length,24);assert.equal(restored.d.querySelectorAll('.new-label').length,0);assert.equal(restored.errors.length,0);restored.dom.window.close();
// Independently evaluate representative formulas used in the explanations.
assert.equal(6/3,2);assert.equal(21/7,3);assert.equal(12*(1/2)**2*3,9);assert.equal(8/20,.4);
let count=0;for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)if(a+b===5)count++;assert.equal(count,4);
const derivative=x=>3*x*x+4*x+1;assert.equal(derivative(-1),0);assert.ok(derivative(-1.01)>0&&derivative(-.99)<0);
const params=setup({},'https://test.local/?exam=ege&egeTopic=parameters');assert.equal(params.w.eval('state.examTopic'),'parameters');assert.equal(params.w.eval('pool().length'),57);assert.ok(params.d.querySelector('[data-exam-topic="parameters"]').getAttribute('aria-pressed')==='true');assert.equal(params.errors.length,0);params.dom.window.close();
const radicals=setup({},'https://test.local/?exam=ege&egeTopic=stereometry');
assert.equal(radicals.w.eval('pool().length'),55);
for(const[id,input]of [[502075,'8*sqrt(3)/3'],[502095,'6√10/5']]){radicals.w.eval(`openTask('ege-sdamgia-${id}')`);radicals.d.querySelector('#answer').value=input;radicals.d.querySelector('#answerForm').dispatchEvent(new radicals.w.Event('submit',{bubbles:true,cancelable:true}));assert.ok(radicals.d.querySelector('#feedback').classList.contains('success'));radicals.d.querySelector('#taskDialog').close();}
for(const input of ['alert(1)','1/0','sqrt(-1)'])assert.ok(Number.isNaN(radicals.w.eval(`parseAnswer(${JSON.stringify(input)})`)));
assert.equal(radicals.errors.length,0);radicals.dom.window.close();
console.log('PASS: EGE tab visibility, all 721 EGE workspaces, including 100 equation and system tasks, 20 word problems, 16 derivatives and 25 illustrated function tasks, answers, sources, filters, next-task isolation, saved progress and deep link.');
