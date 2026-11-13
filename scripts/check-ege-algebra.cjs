const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const c=vm.createContext({});for(const f of ['data','lessons','challenges','expansion','deepening','physics','depth','advanced','grade10','strong','final-tasks','intensive','olympiad','intensive-next','ege','ege-expansion','ege-algebra','ege-equations','ege-inequalities','answer-set'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),c);const bank=vm.runInContext('tasks.filter(t=>t.exam==="ege")',c);assert.equal(bank.length,306);assert.equal(new Set(bank.map(t=>t.id)).size,306);assert.equal(bank.filter(t=>t.examTopic==='equations').length,121);assert.equal(bank.filter(t=>t.examTopic==='inequalities').length,120);
const close=(a,b)=>Math.abs(a-b)<1e-8;
for(const [s,n] of [['sqrt(2)',Math.sqrt(2)],['5-5sqrt(2)',5-5*Math.sqrt(2)],['log2(6)',Math.log2(6)],['log_2(5)',Math.log2(5)],['2^(-1/8)',2**(-1/8)],['1/4',.25],['(-3+sqrt(33))/2',(-3+Math.sqrt(33))/2],['-2^2',-4],['2^3^2',512],['5√2',5*Math.sqrt(2)],['2π',2*Math.PI]])assert.ok(close(c.setBound(s),n),s);
for(const bad of ['sqrt(-1)','log1(2)','log2(-2)','1/0','0^(-1)','Math.random()','constructor.constructor(1)','process.exit()','(()=>1)()','[1,2]','1e1000','2^999','log2(5','(2','sin(1)','1.2.3','1,2,3'])assert.ok(Number.isNaN(c.setBound(bad)),bad);
assert.ok(c.equalRealSets(c.parseRealSet('x ∈ [0;log2(6)]'),[[0,Math.log2(6),true,true]]));
const added=vm.runInContext('tasks.filter(t=>["equations","inequalities"].includes(t.examTopic)&&t.sourceId!==2645)',c);assert.equal(added.length,240);
for(const t of added){assert.ok(t.hints.length>=2&&t.steps.length>=3&&t.review.trap);assert.equal(t.source.url,'https://math-ege.sdamgia.ru/problem?id='+t.sourceId);if(t.answerType==='set'){assert.ok(c.equalRealSets(c.parseRealSet(t.answer),t.answerSet),t.id+' canonical answer')}if(t.sourceNote)assert.ok(t.question.startsWith('Пункт а оригинала.'))}
const ln=Math.log,L=(b,x)=>ln(x)/ln(b),sq=x=>x*x;
// Independent evaluations of each original inequality; domains are explicit.
const originals={
 507658:{ok:x=>x!==-2&&x!==3,g:x=>sq(2*x*x-x+5)/(2*sq(x+2)*sq(x-3))-sq(x-1)/sq(x+2)-sq(x+1)/sq(x-3)},
 508440:{ok:x=>![1,2,3].includes(x),g:x=>1/(x-1)+2/(x-2)-6/(x-3)},
 508518:{ok:x=>x!==7&&x!==9,g:x=>1-x-(8*x-45)/(x-7)-(x*x+15*x-132)/(x*x-16*x+63)},
 508524:{ok:x=>x!==-2&&!close(x,-1/3),g:x=>-(20*x*x-32*x+3)/(3*x*x+7*x+2)},
 511560:{ok:x=>x!==-3&&x!==-5,g:x=>2*x-1-(x*x+2*x-4)/(x+3)-(x*x+5*x+3)/(x+5)},
 508296:{ok:()=>true,g:x=>6**x+(1/6)**x-2,strict:true},
 508297:{ok:()=>true,g:x=>4*2**x-2**(x*x)},
 508359:{ok:()=>true,g:x=>7-2**x-6*2**(-x)},
 508366:{ok:()=>true,g:x=>-(2**(2*x-1)-7*2**(x-1)+5)},
 508436:{ok:()=>true,g:x=>-(2**(2*x+4)-16*2**(x+3)-2**(x+1)+16)},
 507254:{ok:x=>x>0&&x*x+3*x-9>0&&x*x+3*x+1/x-10>0,g:x=>L(3,x*x+3*x+1/x-10)-L(3,1/x)-L(3,x*x+3*x-9)},
 507741:{ok:x=>x*x-x-3>0&&2*x*x+x-3>0&&!close(x*x,2),g:x=>L(3,x*x-x-3)+L(3,2*x*x+x-3)-L(3,sq(x*x-2))-2-L(1/3,4)},
 508459:{ok:x=>x>0,g:x=>sq(L(2,x))+6-5*L(2,x),strict:true},
 508469:{ok:x=>x>0&&x<1,g:x=>3-sq(L(2,-L(2,x)))-L(2,sq(L(2,x)))},
 508478:{ok:x=>3*x*x+4*x+1>1e-10,g:x=>2*L(9,4*x*x+1)-L(3,3*x*x+4*x+1)},
 507667:{ok:x=>x!==-1&&x!==-6,g:x=>Math.abs(x*x-10*x)/sq(x*x+7*x+6)-sq(1/(x+1)-1/(x+6))},
 507670:{ok:x=>x!==1&&x!==4,g:x=>Math.abs(x*x+6*x)/sq(x*x-5*x+4)-sq(1/(1-x)-1/(4-x))},
 508380:{ok:()=>true,g:x=>14-Math.abs(2-x)-3*Math.abs(x+3)+3*x},
 508405:{ok:()=>true,g:x=>30*x-9-25*x*x+3*Math.abs(3-5*x),strict:true},
 508407:{ok:()=>true,g:x=>80*x-64-25*x*x+4*Math.abs(8-5*x),strict:true}
};
const member=(t,x)=>t.answerSet.some(([a,b,ac,bc])=>(a===null||x>a||ac&&close(x,a))&&(b===null||x<b||bc&&close(x,b)));
let checked=0;
const legacyInequalities=added.filter(t=>t.examTopic==='inequalities'&&originals[t.sourceId]);assert.equal(legacyInequalities.length,20);for(const t of legacyInequalities){const p=originals[t.sourceId];assert.ok(p);const samples=Array.from({length:321},(_,i)=>-20+i/8);for(const part of t.answerSet)for(const b of part.slice(0,2))if(b!==null)samples.push(b,b-.01,b+.01);for(const x of samples){const actual=p.ok(x)&&(p.strict?p.g(x)>1e-9:p.g(x)>=-1e-9);assert.equal(member(t,x),actual,t.sourceId+' membership at '+x);checked++}}
// Numeric equation answers, including the requested extremal root.
const eqChecks={77368:x=>sq(2*x+7)-sq(2*x-1),77369:x=>sq(x-6)+24*x,77366:x=>9/(x*x-16)-1,77367:x=>13*x/(2*x*x-7)-1,26668:x=>Math.sqrt(-72-17*x)+x,26660:x=>Math.sqrt(6/(4*x-54))-1/7,26654:x=>16**(x-9)-.5,26653:x=>(.5)**(6-2*x)-4,26657:x=>L(4,x+3)-L(4,4*x-15),26648:x=>L(5,5-x)-L(5,3)};
for(const [id,fn]of Object.entries(eqChecks)){const t=added.find(t=>t.sourceId===Number(id));assert.ok(close(fn(t.answer),0),id)}assert.equal(added.find(t=>t.sourceId===77366).answer,Math.max(5,-5));assert.equal(added.find(t=>t.sourceId===77367).answer,Math.min(-.5,7));assert.equal(added.find(t=>t.sourceId===26668).answer,Math.min(-8,-9));
const advanced={503127:x=>4**(x*x-2*x+1)+4**(x*x-2*x)-20,520994:x=>x-3*Math.sqrt(x-1)+1,519658:x=>Math.sqrt(x*x*x-4*x*x-10*x+29)-(3-x),521850:x=>Math.sqrt(x**4+8*x**3+2*x*x-1)-Math.sqrt(x**4+2*x*x),507572:x=>Math.sqrt(x+4*Math.sqrt(x-4))+Math.sqrt(x-4*Math.sqrt(x-4))-4,549170:x=>Math.sqrt(x**3+4*x*x+9)-3-x,514082:x=>L(5,2-x)-L(25,x**4),517739:x=>L(2,x*x-14*x)-5,514623:x=>6*sq(L(8,x))-5*L(8,x)+1,525377:x=>L(7,x+2)-L(49,x**4)};
for(const [id,fn]of Object.entries(advanced)){const t=added.find(t=>t.sourceId===Number(id));for(const[a,b]of t.answerSet){assert.ok(close(fn(a),0),id+' left root');assert.ok(close(fn(b),0),id+' right root');if(a!==b)for(const f of [.1,.5,.9])assert.ok(close(fn(a+f*(b-a)),0),id+' interval')}}
console.log('PASS: 240 sourced EGE algebra tasks, including 100 new inequalities; safe radical/log/power parsing; '+checked+' domain and boundary comparisons for 20 inequalities; direct checks of all equation answers.');
