/* Independent invariants, edge cases and numerical derivatives. Node only. */
const assert=require('node:assert/strict');
const M=require('../dist/lab-models.js');let checks=0;
function near(a,b,tol=1e-8){checks++;assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`)}
function get(id,override={}){const e=M.labs.find(e=>e.id===id);return[e,{...M.defaults(e),...override}]}
function check(id,over,fn){const[e,p]=get(id,over);fn(e,p,e.calc(p,0))}
assert.equal(M.labs.length,20);assert.equal(new Set(M.labs.map(e=>e.id)).size,20);
for(const e of M.labs){
 assert.equal(e.steps.length,3);assert.ok(e.explain.length>90&&e.limits.length>65);assert.ok(e.metrics.length>=3);
 const defaults=M.defaults(e),scenarios=[defaults,...e.params.filter(p=>!p.options).flatMap(p=>[{...defaults,[p.key]:p.min},{...defaults,[p.key]:p.max}]),...e.presets.map(([,p])=>({...defaults,...p}))];
 // Seeded random sweeps exercise combinations as well as individual bounds.
 let seed=319;for(let n=0;n<30;n++){const p={...defaults};for(const q of e.params){seed=(seed*1664525+1013904223)>>>0;if(!q.options)p[q.key]=q.min+(q.max-q.min)*seed/2**32;if(q.key==='n'&&e.id==='standing')p.n=Math.round(p.n)}scenarios.push(p)}
 for(const p of scenarios){const domain=M.domain(e,p);assert.ok(domain.max>domain.min);for(let i=0;i<=10;i++){const x=domain.min+(domain.max-domain.min)*i/10,r=M.sample(e,p,x);for(const metric of e.metrics){const v=r[metric.key];assert.ok(Number.isFinite(v)||v===null,`${e.id}/${metric.key}: ${v}`);checks++}assert.ok(Number.isFinite(e.answer(p,e.calc(p,0))));}}
}
check('projectile',{v:20,angle:45,g:10},(e,p,r)=>{near(r.range,40);near(r.H,10);near(e.calc(p,r.T).y,0);near(e.calc(p,r.T/2).vy,0);const other=e.calc({...p,angle:30},0),complement=e.calc({...p,angle:60},0);near(other.range,complement.range)});
check('incline',{angle:20,mu:.5},(e,p,r)=>{near(r.a,0);near(r.friction,p.mass*9.81*Math.sin(Math.PI/9))});
check('incline',{angle:35,mu:.2},(e,p)=>{const r=e.calc(p,e.duration(p));near(r.s,p.length);near(p.mass*9.81*r.s*Math.sin(p.angle*Math.PI/180),p.mass*r.v*r.v/2+r.work);near(r.a,e.calc({...p,mass:p.mass*4},0).a)});
for(const restitution of[0,.3,.7,1])check('collision',{e:restitution},(e,p,r)=>{const after=e.calc(p,e.duration(p)),beforeE=(p.m1*p.u1**2+p.m2*p.u2**2)/2;near(after.P,p.m1*p.u1+p.m2*p.u2);near(after.v2-after.v1,restitution*(p.u1-p.u2));near(beforeE-after.E,r.loss);assert.ok(after.E<=beforeE+1e-8);if(restitution===0)near(after.v1,after.v2)});
check('collision',{m1:1,m2:1,e:1},(e,p)=>{const r=e.calc(p,e.duration(p));near(r.v1,p.u2);near(r.v2,p.u1)});
for(const id of['spring','pendulum'])check(id,{},(e,p,r)=>{for(let i=0;i<20;i++){const v=e.calc(p,e.duration(p)*i/20);near(v.K+v.U,v.E)}const duration=e.duration(p),start=e.calc(p,0),end=e.calc(p,duration);near(start[id==='spring'?'x':'theta'],end[id==='spring'?'x':'theta'])});
check('pendulum',{},(e,p,r)=>near(e.calc({...p,length:p.length*4},0).T,2*r.T));
check('buoyancy',{part:80,body:800,rho:1000,volume:2},(e,p,r)=>{near(r.hold,0);near(r.F,15.696);near(r.net,0)});
check('hydrostatic',{rho:1000,depth:10,area:10},(e,p,r)=>{near(r.gauge,98.1);near(r.absolute,199.425);near(r.force,98.1)});
check('gas',{},(e,p,r)=>{near(r.pressure*p.V,p.n*8.314462618*p.T);near(e.calc({...p,V:p.V/2}).pressure,2*r.pressure);near(e.calc({...p,V:p.V/2}).energy,r.energy)});
check('heating',{},(e,p,r)=>{near(e.calc(p,e.duration(p)).T,90);near(e.calc(p,e.duration(p)).Q,p.mass*4.2*(90-p.initial));near(e.duration({...p,mass:2*p.mass}),2*e.duration(p))});
check('mixing',{hotMass:2,coldMass:1,hot:80,cold:20},(e,p,r)=>{near(r.T,60);near(r.Q,r.received)});
check('ohm',{U:12,resistance:60},(e,p,r)=>{near(r.I,.2);near(r.P,2.4);near(e.calc({...p,U:24}).P,4*r.P)});
for(const mode of[1,2])check('circuits',{mode},(e,p,r)=>{near(r.I*p.U,r.I1*r.U1+r.I2*r.U2);if(mode===1){near(r.U1+r.U2,p.U);near(r.I1,r.I2)}else{near(r.I1+r.I2,r.I);near(r.U1,r.U2)}});
check('capacitor',{},(e,p,r)=>{near(r.Uc,0);near(r.I,p.U/p.resistance);near(r.tau,p.resistance*p.C/1000);const s=e.calc(p,r.tau);near(s.Uc/p.U,1-Math.exp(-1));const dt=1e-5,left=e.calc(p,r.tau-dt),right=e.calc(p,r.tau+dt);near((right.Q-left.Q)/(2*dt),s.I,1e-5)});
check('induction',{},(e,p)=>{for(const t of[.1,.23,.47]){const dt=1e-6,l=e.calc(p,t-dt),r=e.calc(p,t+dt);near(e.calc(p,t).emf,-p.N*(r.flux-l.flux)/1000/(2*dt),1e-6)}});
check('wave',{},(e,p,r)=>{near(r.lambda,p.speed/p.f);near(e.calc(p,.12).y,e.calc({...p,probe:p.probe+r.lambda},.12).y);near(e.calc(p,.12).y,e.calc(p,.12+r.T).y)});
check('standing',{},(e,p,r)=>{near(r.f,p.n/(2*p.length)*Math.sqrt(p.tension/(p.density/1000)));near(e.calc({...p,tension:p.tension*4},0).f,2*r.f);near(e.calc({...p,n:1},0).f,r.f/p.n)});
check('refraction',{n1:1,n2:1.5,angle:45},(e,p,r)=>near(Math.sin(Math.PI/4),1.5*Math.sin(r.angle2*Math.PI/180)));
check('refraction',{n1:1.5,n2:1,angle:55},(e,p,r)=>{assert.equal(r.tir,true);assert.equal(r.angle2,null);near(r.critical,41.810314895778596)});
check('refraction',{n1:1.5,n2:1,angle:Math.asin(1/1.5)*180/Math.PI},(e,p,r)=>{assert.equal(r.tir,false);near(r.angle2,90)});
check('lens',{f:10,d:20},(e,p,r)=>{near(r.q,20);near(r.M,-1)});
check('lens',{f:10,d:5},(e,p,r)=>{near(r.q,-10);near(r.M,2);near(1/p.f,1/p.d+1/r.q)});
check('lens',{f:10,d:10},(e,p,r)=>{assert.equal(r.q,null);assert.equal(r.M,null);near(r.power,10)});
check('photoelectric',{frequency:400,work:2.3},(e,p,r)=>{assert.equal(r.emits,false);assert.equal(r.stop,null);near(r.K,0)});
check('photoelectric',{frequency:1000,work:2.3},(e,p,r)=>{near(r.K,1.835667696);near(r.stop,r.K);assert.equal(r.emits,true)});
check('decay',{N:8000,half:5},(e,p,r)=>{near(e.calc(p,15).N,1000);near(e.calc(p,5).activity,r.activity/2);near(r.activity,Math.LN2*8000/(5*86400))});
console.log(`PASS: ${M.labs.length} experiments; ${checks} finite-value and invariant checks, conservation laws, units, optical boundaries and derivatives.`);
