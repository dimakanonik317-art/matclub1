const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('dist/answer-set.js','utf8'),ctx);
const parse=s=>ctx.parseRealSet(s),eq=(s,e)=>ctx.equalRealSets(parse(s),e);
assert.ok(eq('{1} U (1;2] U [0;1)',[[0,2,true,true]]));
assert.ok(eq('a ∈ {0,25}',[[.25,.25,true,true]]));
assert.ok(eq('(-∞;0) ∪ (0;∞)',[[null,0,false,false],[0,null,false,false]]));
assert.equal(eq('(-inf;inf)',[[null,0,false,false],[0,null,false,false]]),false);
assert.equal(eq('[0;1]',[[0,1,false,true]]),false);
assert.ok(eq('(1;2) U {1} U {2}',[[1,2,true,true]]));
assert.ok(eq('{1/4}',[[.25,.25,true,true]]));
for(const bad of ['','[1;0]','[inf;inf]','[-inf;1]','[0;inf]','(1;1)','{1/0}','alert(1)','[0;1] garbage','[0;1] U','[0,1]','(0;1);(2;3)'])assert.equal(parse(bad),null,bad);
const c=vm.createContext({});for(const f of ['data','lessons','challenges','expansion','deepening','physics','depth','advanced','grade10','strong','final-tasks','intensive','olympiad','intensive-next','ege','ege-expansion'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),c);
const bank=vm.runInContext('tasks.filter(t=>t.examTopic==="parameters")',c);
const contains=(t,a)=>t.answerSet.some(([lo,hi,lc,hc])=>(lo===null||a>lo||lc&&a===lo)&&(hi===null||a<hi||hc&&a===hi));
const unique=xs=>xs.filter((x,i)=>!xs.slice(0,i).some(y=>Math.abs(x-y)<1e-7));
const quadratic=(b,c)=>{const d=b*b-4*c;return d< -1e-8?[]:Math.abs(d)<1e-8?[-b/2]:[(-b-Math.sqrt(d))/2,(-b+Math.sqrt(d))/2]};
const byId=Object.fromEntries(bank.map(t=>[t.sourceId,t]));
// Compare answers to independent root/intersection counts, including every exceptional endpoint.
const values=[-20,-10,-5,-3,-1.25,-1,-.5,0,.25,.5,1,1.5,2,3,3.5,4,9.25,10,17];
for(let a=-12;a<=12;a+=.125)values.push(a);
for(const a of values){
 const q=2*a-a*a,roots=unique([-1,1,...(q<0?[]:q===0?[0]:[-Math.sqrt(q),Math.sqrt(q)])]);assert.equal(contains(byId[701655],a),roots.length===2,'701655 '+a);
 const roots2=quadratic(-4,a).filter(x=>Math.abs((5*x-a)*(x-a))>1e-7);assert.equal(contains(byId[526294],a),roots2.length===2,'526294 '+a);
 const sols=4*a-1<0?0:4*a-1===0?2:4;assert.equal(contains(byId[484630],a),sols===2,'484630 '+a);
 const logs=quadratic(-1,-1-a).filter(x=>x>=-1-1e-8&&x<1-1e-8&&Math.abs(x)>1e-8);assert.equal(contains(byId[505039],a),logs.length>0,'505039 '+a);
 const xs=[];if(a!==0&&3/a>2)xs.push(3/a);if(a!==-1&&4/(a+1)>2)xs.push(4/(a+1));assert.equal(contains(byId[484645],a),unique(xs).length===1,'484645 '+a);
 const ps=quadratic(-1,a-9).filter(x=>x>=-3-1e-8);if(a+7>=-3)ps.push(a+7);assert.equal(contains(byId[513111],a),unique(ps).length===2,'513111 '+a);
}
const least=Array.from({length:30},(_,i)=>i+1).find(a=>{const roots=quadratic(-a,4*a-17);roots.push(a-4);return Math.max(...roots)-Math.min(...roots)>=9});assert.equal(least,byId[519686].answer);
// Independent calculations for the 20 geometry answers.
const answers=[4.8/(24/25),2/4,4/.5,Math.sqrt(16+33),8*.5,3*21*6/7/3,1/2,6,2*(3+6),14,Math.sqrt(25**2-7**2)/25,15/(5/7),34-2*14*3/7,22*5/11,23+2*39*8/13,8*12*.5/2,4/4,9*4/6,102-40,180*2/9];
const plan=vm.runInContext('tasks.filter(t=>t.examTopic==="planimetry")',c);assert.equal(plan.length,20);plan.forEach((t,i)=>assert.ok(Math.abs(t.answer-answers[i])<1e-8,t.id));
console.log('PASS: safe set parser, equivalent unions, excluded boundaries, independent root counts for all seven parameter problems and 20 geometry calculations.');
