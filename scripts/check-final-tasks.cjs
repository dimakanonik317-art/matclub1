/* Content checks use alternate models, enumerations and numerical integration. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),context=vm.createContext({});
for(const file of ['data','lessons','challenges','expansion','deepening','physics','depth','advanced','grade10','strong','final-tasks']) vm.runInContext(fs.readFileSync(path.join(root,file+'.js'),'utf8'),context);
const {tasks,curriculum,lessons,topicSubjects}=vm.runInContext('({tasks,curriculum,lessons,topicSubjects})',context);
const count=(a,p)=>a.filter(p).length;
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const codes=range(0,80).map(n=>n.toString(3).padStart(4,'0'));
const vec=(a,b)=>b.map((v,i)=>v-a[i]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const AB=vec([1,2,-1],[5,-2,3]),AC=vec([1,2,-1],[3,4,1]);
const cp=cross(AB,AC);
function integral(f,a,b,n=10000){const h=(b-a)/n;let total=0;for(let i=0;i<n;i++)total+=f(a+(i+.5)*h)*h;return total}
const minCubic=Math.min(...range(-2000,4000).map(k=>{const x=k/1000;return x**3-3*x*x-9*x+5}));
const expected={
  'math-6':[1320/(.8*1.1),(1-(-7-5*2))/3,6*36+4*4,count(codes,s=>s[0]!=='0'&&s.includes('0')&&[1,2,3].every(i=>s[i]!==s[i-1])),1/(1/6+1/12-1/24),8*6/2],
  'math-7':[(450/3-15)/2,(240-120)/(18-12),180/2,(.5*12-.35*12)/(.5-.2),count(range(1,11),a=>24-2*a>0&&24-2*a<2*a),2**3+5**3],
  'math-8':[2,9*12/15,3*12/4+4,0,(10+26)/2*Math.sqrt(17**2-8**2),count(range(-20,20),x=>3*(2*x-1)>x+12&&(x-1)/2<=4)],
  'math-9':[(140-2*45)/10,5*3/(8*7/2),7**2+8**2-2*7*8*Math.cos(Math.PI/3),12*(15/6)**2,2,3*4],
  'math-10':[5,5,6*8*Math.sqrt(26**2-6**2-8**2),3,190/(1-(2/3)**3),dot(cp,cp)/dot(AB,AB),[-2+9*2/3,1-6*2/3,4-3*2/3],(-4/6)*(-3)],
  'math-11':[Math.sqrt(9),Math.sqrt(10**2-(216/360*10)**2),3*.8**2*.2,minCubic,integral(x=>Math.abs(x*x-3*x),0,4),Math.PI*(25-16)*8/(4/3*Math.PI*125)],
  'physics-7':[(72/(36/12+36/18))/3.6,(300-540/2.7)*1e-6,1000*10*.2+800*10*.3,(1000-600)*.01,(3*10*.4-2*10*.1)/.6,1.2*10*(1/100+1/150)],
  'physics-8':[2*4200*30/(500*.8),(12/(4+1/(1/6+1/3))*2)/3,3*2**2,(.5*4200*40-.1*336000)/(.6*4200),(.5*4200*80+.1*2.3e6)/(1000*.84),6*(.5*120+.2*180)],
  'physics-9':[.5*(20/5)*2**2,10*(.6-.25*.8),18/(3*(20/10)),Math.sqrt((.2*6)**2/((.2+.4)*150)),.8*(2+.5),(80/2-80/8)*1e-6],
  'physics-10':[Math.hypot(15,Math.sqrt(2*10*20)),.002/(400/300-1),2*9e9*2e-9/.3**2,2*(10-(2*10-.2*4*10)/6),1-(1.5*(900-300)+2.5*(300-100))/(1.5*(300-100)+2.5*(900-300)),.5*2e-6*12**2-(24e-6)**2/(2*6e-6)],
  'physics-11':[6,(1/(1/20-1/30))/30,6-2.5,Math.sqrt(2*4e-6*100/(2e-6*2**2)),(.8*.5*4)**2/2,1/Math.sqrt(4/9)]
};
assert.equal(tasks.length,448);
assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
const added=tasks.filter(t=>t.id.startsWith('final-'));
assert.equal(added.length,68);
for(const [group,answers] of Object.entries(expected)) {
  answers.forEach((answer,i)=>{
    const id=`final-${group}-${i+1}`,task=tasks.find(t=>t.id===id);
    assert.ok(task,id);
    const a=Array.isArray(answer)?answer:[answer],b=Array.isArray(task.answer)?task.answer:[task.answer];
    assert.equal(a.length,b.length,id);
    a.forEach((v,j)=>assert.ok(Number.isFinite(b[j])&&Math.abs(v-b[j])<=1e-7*Math.max(1,Math.abs(v)),`${id}: ${b[j]} vs ${v}`));
    assert.ok(curriculum[task.grade][task.topic],id);
    assert.ok(lessons[`${task.grade}-${task.topic}`],id);
    assert.equal(Boolean(lessons[`${task.grade}-${task.topic}`].physics),task.domain==='physics',id);
    assert.equal(task.subject,task.domain==='physics'?'physics':topicSubjects[`${task.grade}-${task.topic}`],id);
    assert.ok(task.steps.length>=3&&task.hints.length>=2,id);
    assert.ok(task.review.plan&&task.review.verify&&task.review.trap,id);
    if(task.domain==='physics')assert.ok(task.unit,id);
  });
}
// Physical restrictions and root counts checked against the original equations.
assert.equal(28/(12+2)+20/(12-2),4);
assert.equal(Math.log2(5-1)+Math.log2(9-5),4);
assert.equal(2*5-4-6,0);
assert.equal(count([Math.PI/6,Math.PI/2,5*Math.PI/6],x=>Math.abs(2*Math.sin(x)**2-3*Math.sin(x)+1)<1e-10),3);
assert.ok(added.every(t=>!t.id.startsWith('final-math-6')||t.grade===6));
console.log('PASS: 448 total tasks; 68 new answers, alternate calculations, topic/subject mapping, solution completeness and stable IDs.');
