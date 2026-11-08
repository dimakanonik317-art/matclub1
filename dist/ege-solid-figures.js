/* Self-contained schematic solid diagrams. Section vertices are exact construction data. */
function egeSolidFigure(task){
 const g=task.figure.solid,safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let drawing='';
 const blue='#2563eb',edge='#334155',orange='#c45f13';
 if(g.kind==='sphere')drawing=`<circle cx="300" cy="190" r="135" fill="#edf5ff" stroke="${edge}" stroke-width="2"/><path d="M165 190A135 38 0 0 0 435 190" fill="none" stroke="${edge}" stroke-width="2"/><path d="M165 190A135 38 0 0 1 435 190" fill="none" stroke="${edge}" stroke-width="2" stroke-dasharray="6 5"/><path d="M300 190L435 190" stroke="${blue}" stroke-width="3"/><circle cx="300" cy="190" r="4" fill="${edge}"/><text x="280" y="180">O</text><text x="360" y="180">R</text>`;
 else{
 let points=g.points||{},edges=g.edges||[],section=g.section||[],aux=g.aux||[],curves=[];
 if(g.kind==='cone'||g.kind==='cylinder'){
 const R=g.radius||3,h=g.height||5;points={O:[0,0,0]};edges=[];section=[];aux=[];
 const ring=z=>Array.from({length:81},(_,i)=>[R*Math.cos(i*Math.PI/40),R*Math.sin(i*Math.PI/40),z]);curves=[ring(0)];
 if(g.kind==='cone'){points.S=[0,0,h];edges=[['S',[-R,0,0]],['S',[R,0,0]]];aux=[['S','O',true],['O',[R,0,0],true]];if(g.chord){const d=Math.sqrt(R*R-g.chord*g.chord/4);points.A=[-g.chord/2,-d,0];points.B=[g.chord/2,-d,0];points.M=[0,-d,0];section=['S','A','B'];aux.push(['O','M',true],['S','M',false]);}}
 else{points['O₁']=[0,0,h];curves.push(ring(h));edges=[ [[-R,0,0],[-R,0,h]],[[R,0,0],[R,0,h]] ];aux=[['O','O₁',true],['O',[R,0,0],true]];if(g.offset!==undefined){const half=Math.sqrt(R*R-g.offset*g.offset);points.A=[-half,-g.offset,0];points.B=[half,-g.offset,0];points.C=[half,-g.offset,h];points.D=[-half,-g.offset,h];section=['A','B','C','D'];}}
 }
 const point=v=>typeof v==='string'?points[v]:v,project=p=>[p[0]+.48*p[1],-p[2]+.30*p[1]];
 const all=[...Object.values(points),...edges.flatMap(e=>[point(e[0]),point(e[1])]),...aux.flatMap(e=>[point(e[0]),point(e[1])]),...curves.flat()];const ps=all.map(project),xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]),loX=Math.min(...xs),hiX=Math.max(...xs),loY=Math.min(...ys),hiY=Math.max(...ys),scale=Math.min(440/Math.max(hiX-loX,1),285/Math.max(hiY-loY,1)),cx=(hiX+loX)/2,cy=(hiY+loY)/2;
 const pos=v=>{const p=project(point(v));return[300+(p[0]-cx)*scale,195+(p[1]-cy)*scale]},str=v=>pos(v).map(x=>x.toFixed(3)).join(' '),path=(a,b,color,dash=false,width=2)=>`<path d="M${str(a)}L${str(b)}" stroke="${color}" stroke-width="${width}" fill="none"${dash?' stroke-dasharray="6 5"':''}/>`;
 for(const line of curves)drawing+=`<path d="${line.map((p,i)=>(i?'L':'M')+str(p)).join('')}" fill="none" stroke="${edge}" stroke-width="2"/>`;
 for(const e of edges)drawing+=path(e[0],e[1],edge,!!e[2]);
 for(const e of aux)drawing+=path(e[0],e[1],blue,e[2]!==false,1.5);
 if(section.length)drawing+=`<path data-solid-section="true" d="${section.map((p,i)=>(i?'L':'M')+str(p)).join('')}Z" fill="#f5b56b" fill-opacity=".28" stroke="${orange}" stroke-width="3"/>`;
 for(const [name,p]of Object.entries(points)){const[x,y]=pos(p);drawing+=`<circle cx="${x}" cy="${y}" r="3" fill="${edge}"/><text x="${x+9}" y="${y-9}">${safe(name)}</text>`;}
 }
 const id='solid-'+task.id.replace(/[^a-z0-9-]/gi,'');return `<figure class="ege-task-figure"><div class="ege-figure-scroll" tabindex="0" role="region" aria-label="Чертёж к задаче по стереометрии"><svg data-ege-solid="${safe(g.kind)}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${safe(task.title)}</title><desc id="${id}-desc">${safe(task.question)} ${g.section?.length||g.chord||g.offset!==undefined?'Искомое сечение выделено цветом.':''}</desc><rect width="600" height="400" rx="12" fill="white"/><g font-family="Arial,sans-serif" font-size="20" fill="#0f172a">${drawing}</g></svg></div><figcaption>Схематический чертёж: пропорции в проекции условные, точные размеры указаны в тексте. Пунктир — вспомогательные или невидимые линии; цветная область — сечение.</figcaption></figure>`;
}
