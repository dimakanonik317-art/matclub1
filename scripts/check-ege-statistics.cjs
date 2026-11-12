const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const c=vm.createContext({});for(const f of ['data','lessons','challenges','expansion','deepening','physics','depth','advanced','grade10','strong','final-tasks','intensive','olympiad','intensive-next','ege','ege-expansion','ege-probability'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),c);const bank=vm.runInContext('tasks.filter(t=>t.exam==="ege")',c);assert.equal(new Set(bank.map(t=>t.id)).size,bank.length);assert.equal(bank.filter(t=>t.examTopic==='probability').length,112);assert.equal(bank.filter(t=>t.examTopic==='statistics').length,15);
const expected=new Map([[320208,1/4],[1001,57/60],[283579,1-7/1400],[282857,1-8/100],[282856,18/(2982+18)],[320751,(.3-.15)/(.3-.05)],[509352,25/100],[319355,.52*.3],[320197,1-.81],[1002,34/40]]);
const mean=(xs,ps)=>xs.reduce((s,x,i)=>s+x*ps[i],0);const variance=(xs,ps)=>{const m=mean(xs,ps);return xs.reduce((s,x,i)=>s+ps[i]*(x-m)**2,0)};
expected.set(509353,50-mean([10,50,100,5000],[990/1000,6/1000,3/1000,1/1000]));expected.set(509373,mean([-4,0,1,3],[.2,.1,.4,.3]));
// Enumerate the joint distribution of two independent indicator variables.
function indicatorMean(p,q,remaining=false){let sum=0;for(let a=0;a<2;a++)for(let b=0;b<2;b++)sum+=(remaining?2-a-b:a+b)*(a?p:1-p)*(b?q:1-q);return sum}
expected.set(638979,indicatorMean(.2,.6));expected.set(638980,indicatorMean(.8,.3,true));
// Enumerate all 2^8 equally likely coin sequences.
let heads=0;for(let mask=0;mask<256;mask++){let bits=mask;while(bits){heads+=bits&1;bits>>=1}}expected.set(509400,heads/256);
const sample=[1.4,1.2,1.3,1.4,1.2],m=sample.reduce((a,b)=>a+b)/sample.length;expected.set(509479,sample.reduce((s,x)=>s+(x-m)**2,0)/(sample.length-1));
function bound(yes,n,sign){const p=yes/n;return Math.round((p+sign*2*Math.sqrt(p*(1-p)/n))*10)/10}
expected.set(663479,bound(6,12,-1));expected.set(663484,bound(24,36,1));expected.set(704651,variance([20,30,70],[.4,.5,.1]));expected.set(704652,(.36+.2**2)/.2);
for(const [id,sigma,epsilon] of [[509452,Math.sqrt(10),5],[509454,.004,.008],[509456,30,50],[509458,40,100],[509460,.6,.75]])expected.set(id,(sigma/epsilon)**2);
assert.equal(expected.size,25);for(const[id,value]of expected){const t=bank.find(t=>t.sourceId===id);assert.ok(t,'missing '+id);assert.ok(Math.abs(t.answer-value)<1e-10,id+' independent answer');assert.ok(t.hints.length>=2&&t.steps.length>=3);assert.ok(t.review.verify&&t.review.trap);assert.equal(t.source.url,'https://math-ege.sdamgia.ru/problem?id='+id)}
console.log('PASS: 25 new unique tasks, exact topic counts, independent probability, expectation, variance, interval and Chebyshev calculations.');
