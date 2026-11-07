/* Independent numeric/geometry/combinatorial checks for the 200-task release. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),c=vm.createContext({});
for(const f of ['data','lessons','challenges','expansion','deepening','physics','depth','advanced','grade10','strong','final-tasks','intensive'])vm.runInContext(fs.readFileSync(path.join(root,f+'.js'),'utf8'),c);
const {tasks,lessons,topicSubjects}=vm.runInContext('({tasks,lessons,topicSubjects})',c);
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const count=(a,p)=>a.filter(p).length;
const choose=(n,k)=>{let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return v};
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function integral(f,a,b,n=100000){const h=(b-a)/n;let s=0;for(let i=0;i<n;i++)s+=f(a+(i+.5)*h)*h;return s}
const dice=[];for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)dice.push(a+b);
const knownSix=[];for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)if(a===6||b===6)knownSix.push([a,b]);
const expected={
  'math-6':[
    45/.3-45,-3/4+5/6,1.8/12*30,(-4+5)/2,18e3/(40*25),1440/(.9*.8)-1440,
    choose(9,2),3.14*4**2-3.14*3**2,(6*500/100)*(4*500/100),(-2/3+5/6)/2,
    2*5*3,20*(1-.8)/(1-.2),choose(3,1)*choose(4,2),5+(6*15-6*5)/10,
    2198/(3.14*.7),8*(2+4)/2,12*(4-2)
  ],
  'math-7':[
    (11+15+2)/(6-2),((-2)**5*(-2)**3)/((-2)**6),125-48,12/3,180-137,
    (1100*3-900*2)/(3*3-2*2),101**2-99**2,2*3-1,13+12+10/2,31,
    count(range(1,20),x=>x+4>9&&4+9>x),12,2**2+7**2,(30+6)/2,2*(180-20)/4,
    count(range(1,30),a=>31-2*a>0&&2*a>31-2*a),range(1,9).map(n=>(n+3)**2-(n-3)**2).reduce(gcd)
  ],
  'math-8':[
    Math.hypot(12,5)-9,1/2+1/7,Math.hypot(5,34/2-5),(180-40)/2,4*(5*12/2),
    (25-4)/(5-2)-(5+1),count(range(-10,10),x=>-7<2*x+1&&2*x+1<=9),3*((-7-1)/(3-5))+1,
    2*(8+12),10/2,-3,Math.abs(-7+2)-7,2*Math.sqrt(13**2-5**2),36/(1/2),36/4,
    Math.sqrt(100-36)-Math.sqrt(100-64),range(-30,30).filter(x=>x!==-2&&Number.isInteger((x*x+5*x+10)/(x+2))).reduce((a,b)=>a+b,0)
  ],
  'math-9':[
    21-4**2,11+7*(31-11)/5,count(dice,x=>x===9)/36,8/Math.hypot(8,15),146/2,
    Math.sqrt(6*54),12*1.5/2,(3+7)/2+(3-7)/2,count(range(-5,10),x=>x*x-5*x+6<=0),
    2*6**2*(1-Math.cos(2*Math.PI/3)),Math.sqrt(2*58-10**2),count(knownSix,([a,b])=>a+b>=10)/knownSix.length,
    Math.log2(189/3+1),90/2/3,25+64-80*Math.cos(2*Math.PI/3),2*38,Math.sqrt(7+4*Math.sqrt(3))-Math.sqrt(7-4*Math.sqrt(3))
  ],
  'math-10':[
    -Math.sqrt(1-(-3/5)**2),Math.log(81/3)/Math.log(3),Math.sqrt(Math.sqrt(16**3)),[-3-1,4-(-2),8-3],
    360/(6*10),Math.sqrt(13**2-5**2),6*6*Math.sqrt(5**2-3**2)/3,
    count(range(-5,5).map(k=>Math.PI/4+k*Math.PI),x=>x>=0&&x<=2*Math.PI),
    (1*2+2*1+2*(-2))/(3*3),1+2*.3,2+Math.pow(2,1.5),[2*12/9,12/9,2*12/9],
    5/Math.hypot(3,4),216-216/8,Math.log2(4),3
  ],
  'math-11':[
    2*2*(2-3)+2**2,integral(x=>3*x*x+2*x,0,2),3**2*7,Math.sqrt(13**2-12**2),4*Math.cbrt(36*3/4)**2,
    (4+6)/2,5+integral(x=>6*x-4,1,3),7*choose(6,2),2*2*5+2**2,
    count(range(-10,10),x=>2**x>=1/8&&2**x<16),Math.max(-8+6,-1+3,1-3),
    integral(x=>2*x-2*x*x,0,1),integral(t=>Math.abs(2*t-4),0,5),
    (.5*.75)/(.5*.75+.5*.25),10**2-6**2,2*(5**2+5**2)
  ],
  'physics-7':[
    1.2/1000,(160+440)/30,7.8*250/1000,3/.06,60/2e-4,1000*10*3,
    .01*(1-600/1000),2*10*.3/.2,12*10*5/20,4*120/(120+30),
    (1000*100e-6+800*200e-6)/(300e-6),(3+5)*10/.02,.78*10-1000*10*(.78/7800),
    3*10/(100+200),1000*.16/800,(400*.2)/(250*.4),.002*(1000-200),
    120/((72-54)/3.6),(.75*400*60)/(1000*10*9),(20*10)/(10*5)
  ],
  'physics-8':[
    .4*4200*25,.2*336000,180/(3*60),12/.4,6*25,2*40,(2*20+1*80)/3,
    840000/(.4*42e6),12*(1/4+1/12),16/(4**2),2**2*10*30,(.2*4200+.1*900)*(60-20),
    2*7,.1-.2*4200*20/336000,(1*4200*(40-20))/(2.3e6+4200*(100-40)),
    (18-12)/(6/12),20+.8*(200**2/20)*105/4200,(.3*4200*5)/(.2*75),
    (2)/(1/2),12/(20*30/80)
  ],
  'physics-9':[
    (17-5)/4,.5*2*5**2,Math.sqrt(2*45/10),.2*15,.5*200*.1**2,40/20,
    10**2/(2*.25*10),(3-2)*10/(3+2),(.01*400/(.01+1.99))**2/(2*10),
    340*.6/2,2*Math.sqrt(2*80/10),5*5**2-5*4**2,1.5*Math.sqrt(4),-1,
    20/(1+3/1),10**2/(10*50),2*1*10/100,100/(2*10*(.6+.25*.8)),
    (15*3600)/Math.log2(96/3),2/(1/340-1/5100)
  ],
  'physics-10':[
    8*Math.sqrt(2*45/10),20*.6/2,18/3**2,.3*500**2/3,2*8.31*300/.05,500-150,
    9e9*2e-6*3e-6/.3**2,2e-6*(100-(-50)),Math.hypot(4,2e-6*1000/.002*3),
    (2*3*5*10)/(3+5),Math.sqrt(10*6.4e6),300e3*.5*300/400,200/(1.5*2*8.31),
    12*(10+Math.sqrt(100+2*10*5))/10,2*((20-.2*5*10)/5)+.2*2*10,
    -4e14*100/(2*2e7),50e3*1.2**2,1-(3+2.5)/(1.5+5),-.3,
    .5*(3-1)*2e-6*100**2
  ],
  'physics-11':[
    12/(5+1),.4*3*.2,.5*.02*Math.cos(Math.PI/3),2*3.14*Math.sqrt(.1*10e-6),
    1/(1/.1-1/.3),6.6e-34*5e14,(12/(5+1))**2*5,1.6e-27*1e6/(1.6e-19*.1),
    100*.02*.3/.2,1.2e-6/600e-9,500e-9/2e-6,2/4e-15,.01*931.5e6*1.6e-19,
    12**2/(4*2),3*2*3.14*.01/.5,.4*.03/2,Math.sqrt((4e-6)**2/(2e-6*.5)),
    (1**2-.6**2)/(4*1),.75*4-1.5,92-2*2+3
  ]
};
assert.equal(tasks.length,648);
assert.equal(new Set(tasks.map(t=>t.id)).size,648);
const added=tasks.filter(t=>t.id.startsWith('intensive-'));
assert.equal(added.length,200);
assert.equal(count(added,t=>t.domain==='math'),100);
assert.equal(count(added,t=>t.domain==='physics'),100);
assert.equal(new Set(added.map(t=>t.question)).size,200);
let checks=0;
for(const [group,answers] of Object.entries(expected)){
  const cohort=added.filter(t=>`${t.domain}-${t.grade}`===group);
  assert.equal(cohort.length,answers.length,group+' count');
  assert.ok([0,1,2].every(level=>cohort.some(t=>t.level===level)),group+' levels');
  answers.forEach((answer,i)=>{
    const id=`intensive-${group}-${i+1}`,t=tasks.find(t=>t.id===id);assert.ok(t,id);
    const want=Array.isArray(answer)?answer:[answer],got=Array.isArray(t.answer)?t.answer:[t.answer];
    assert.equal(want.length,got.length,id);
    want.forEach((n,j)=>assert.ok(Number.isFinite(got[j])&&Math.abs(n-got[j])<=(n===0?1e-12:Math.abs(n)*1e-9),`${id}: ${got[j]} != ${n}`));
    const key=`${t.grade}-${t.topic}`;assert.ok(lessons[key],id+' lesson');
    assert.equal(Boolean(lessons[key].physics),t.domain==='physics',id+' domain');
    assert.equal(t.subject,t.domain==='physics'?'physics':topicSubjects[key],id+' subject');
    assert.equal(t.steps.length,3,id+' three steps');assert.equal(t.hints.length,2,id+' hints');
    assert.ok(t.review.verify.trim()&&t.review.trap.trim(),id+' review');
    assert.equal(t.challenge,t.level===2,id+' challenge flag');
    if(t.domain==='physics')assert.ok(t.unit,id+' unit');
    checks++;
  });
}
// Cross-check roots against the original equations and geometric orthogonality.
assert.equal(3*(2*7-5)-2*(7+1),11);
assert.equal(6/(-3-1),3/(-3+1));
assert.ok(Math.abs(Math.log2(2+Math.sqrt(8)-2)-1.5)<1e-12);
assert.ok(Math.abs(2*(3-8/3)+(0-4/3)+2*(3-8/3))<1e-12);
assert.equal(1/.8+1/.2,1/.16);
const hist=Object.fromEntries(Object.keys(expected).map(group=>[group,count(added,t=>`${t.domain}-${t.grade}`===group)]));
console.log(`PASS: ${checks} independently calculated new answers; 648 total tasks; unique IDs, grade/domain/subject mapping, all three levels, units and worked solutions.`);
console.log(JSON.stringify(hist));
