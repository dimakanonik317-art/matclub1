/* Educational diagrams rebuilt from the cited tasks. No remote images or eval. */
function egeCurveValue(curve,x){const p=curve.parameters;switch(curve.kind){case'line':return p[0]*x+p[1];case'quadratic':return p[0]*x*x+p[1]*x+p[2];case'hyperbola':return p[0]/(x+p[1])+p[2];case'log':return x+p[1]>0?Math.log(x+p[1])/Math.log(p[0])+p[2]:NaN;case'exp':return p[0]**x+p[1];case'sqrt':return x>=0?p[0]*Math.sqrt(x):NaN;case'cos':return p[0]*Math.cos(x)+p[1];case'sin':return p[0]*Math.sin(x)+p[1];case'tan':return p[0]*Math.tan(x)+p[1];default:return NaN}}
function egeFigure(task){
 const g=task.figure;if(!g)return'';const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));if(g.textCard){const p=g.textCard;return '<figure class="ege-task-figure ege-source-figure"><div class="ege-source-statement"><strong>'+safe(p.heading||'Фрагмент физического текста')+'</strong><p>'+safe(p.body)+'</p></div><figcaption>Фрагмент дан для извлечения и применения физических сведений.</figcaption></figure>'};if(g.geometry){const q=g.geometry,byId=Object.fromEntries(q.points.map(p=>[p.id,p])),circles=(q.circles||[]).map(c=>'<circle cx="'+c.cx+'" cy="'+c.cy+'" r="'+c.r+'" fill="none" stroke="#526e68" stroke-width="3"/>').join(''),lines=q.segments.map(s=>{const a=byId[s.from],b=byId[s.to],dash=s.style==='parallel'?' stroke-dasharray="8 5"':s.style==='height'?' stroke-dasharray="5 5"':'';return '<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="#526e68" stroke-width="3" stroke-linecap="round"'+dash+'/>'+(s.label?'<text x="'+((a.x+b.x)/2+(s.labelDx||0))+'" y="'+((a.y+b.y)/2+(s.labelDy||0))+'" text-anchor="middle" dominant-baseline="middle" class="geometry-length">'+safe(s.label)+'</text>':'')}).join(''),arcs=(q.arcs||[]).map(a=>{const r=a.r,cx=a.cx,cy=a.cy,start=a.startAngle*Math.PI/180,end=a.endAngle*Math.PI/180,delta=((a.endAngle-a.startAngle)%360+360)%360,large=delta>180?1:0,x1=cx+r*Math.cos(start),y1=cy-r*Math.sin(start),x2=cx+r*Math.cos(end),y2=cy-r*Math.sin(end);return '<path d="M'+x1+' '+y1+' A'+r+' '+r+' 0 '+large+' 0 '+x2+' '+y2+'" fill="none" stroke="#9b4c32" stroke-width="4" stroke-linecap="round"/>'}).join(''),nodes=q.points.map(p=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="4" fill="#9b4c32"/><text x="'+(p.x+(p.labelDx||0))+'" y="'+(p.y+(p.labelDy||-12))+'" class="geometry-point">'+safe(p.label||p.id)+'</text>').join(''),id='figure-'+String(task.id).replace(/[^a-z0-9-]/gi,'');return '<figure class="ege-task-figure triangle-figure"><div class="ege-figure-scroll" tabindex="0" role="region" aria-label="Схема к задаче; при необходимости прокручивается по горизонтали"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320" role="img" aria-labelledby="'+id+'-title '+id+'-desc"><title id="'+id+'-title">'+safe(task.title)+'</title><desc id="'+id+'-desc">'+safe(task.question)+'</desc><rect width="640" height="320" rx="12" fill="#fff"/><g font-family="Arial,sans-serif" fill="#263633">'+circles+lines+arcs+nodes+'</g></svg></div><figcaption>'+safe(q.caption||'Схема к задаче')+' Все числовые данные продублированы в условии.</figcaption></figure>';}if(g.dataChart){const c=g.dataChart,esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));const vals=c.values, labels=c.labels, max=Math.max(...vals,1),points=vals.map((v,i)=>[70+i*100,210-v/max*150]);let visual;if(c.kind==='table'){if(Array.isArray(c.columns)&&Array.isArray(c.rows)){const cell='border:1px solid #94a3b8;padding:8px';visual='<table style="border-collapse:collapse;text-align:center;width:100%;min-width:300px"><caption>'+esc(c.caption)+'</caption><thead><tr>'+c.columns.map(x=>'<th scope="col" style="'+cell+'">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+c.rows.map(row=>'<tr>'+row.map((v,i)=>i===0?'<th scope="row" style="'+cell+'">'+esc(v)+'</th>':'<td style="'+cell+'">'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'}else{visual='<table style="border-collapse:collapse;text-align:center;width:100%;min-width:300px"><caption>'+esc(c.caption)+'</caption><thead><tr><th scope="col">День</th>'+labels.map(x=>'<th scope="col" style="border:1px solid #94a3b8;padding:8px">'+esc(x)+'</th>').join('')+'</tr></thead><tbody><tr><th scope="row">Посетители</th>'+vals.map(v=>'<td style="border:1px solid #94a3b8;padding:8px">'+esc(v)+'</td>').join('')+'</tr></tbody></table>'}}else{const shapes=c.kind==='bars'?points.map(([x,y],i)=>`<rect x="${x-22}" y="${y}" width="44" height="${210-y}" fill="#2563eb"/><text x="${x}" y="${y-8}" text-anchor="middle">${vals[i]}</text>`).join(''):`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#2563eb" stroke-width="3"/>`+points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="5" fill="#2563eb"/><text x="${x}" y="${y-10}" text-anchor="middle">${vals[i]}</text>`).join('');visual=`<svg viewBox="0 0 560 260" role="img" aria-label="${esc(c.caption)}: ${labels.map((x,i)=>esc(x)+' '+vals[i]).join(', ')}"><rect width="560" height="260" fill="white"/><path d="M40 35V210H530" fill="none" stroke="#334155"/> <g font-family="Arial,sans-serif" font-size="15" fill="#334155">${shapes}${labels.map((x,i)=>`<text x="${points[i][0]}" y="235" text-anchor="middle">${esc(x)}</text>`).join('')}</g></svg>`}return `<figure class="ege-task-figure"><div class="ege-figure-scroll">${visual}</div><figcaption>${esc(c.caption)}. Значения указаны на рисунке.</figcaption></figure>`;}if(g.importedStatement)return `<figure class="ege-task-figure ege-source-figure"><div class="ege-source-statement">${g.importedStatement}</div><figcaption>Исходное условие «Решу ЕГЭ». Формулы и рисунки сохранены на сервере Матклуба.</figcaption></figure>`;if(g.solid)return egeSolidFigure(task);
 let [xmin,xmax,ymin,ymax]=g.range;const W=600,H=400,L=52,R=24,T=24,B=46,pw=W-L-R,ph=H-T-B;
 if(g.vectors){const cx=(xmin+xmax)/2,cy=(ymin+ymax)/2,unit=Math.max((xmax-xmin)/pw,(ymax-ymin)/ph);xmin=cx-unit*pw/2;xmax=cx+unit*pw/2;ymin=cy-unit*ph/2;ymax=cy+unit*ph/2;}
 const X=x=>L+(x-xmin)/(xmax-xmin)*pw,Y=y=>T+(ymax-y)/(ymax-ymin)*ph,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const id='ege-figure-'+String(task.id).replace(/[^a-z0-9-]/gi,''),colors=['#2563eb','#c45f13'];let grid='',labels='',curves='',points='',asymptotes='';
 const number=n=>Math.abs(n)<1e-9?'0':String(Number(n.toFixed(4))).replace('-', '−');
 const tickX=x=>{if(!g.piAxis)return number(x);const k=Math.round(x/(Math.PI/2));if(!k)return'0';const sign=k<0?'−':'',n=Math.abs(k);return sign+(n%2===0?(n===2?'':n/2)+'π':(n===1?'':n)+'π/2')};
 const xs=g.xStep||1,ys=g.yStep||1,x0=clamp(X(0),L,L+pw),y0=clamp(Y(0),T,T+ph);
 for(let k=Math.ceil(xmin/xs);k<=Math.floor(xmax/xs)&&k-Math.ceil(xmin/xs)<60;k++){const x=k*xs,px=X(x);grid+=`<path d="M${px} ${T}V${T+ph}"/>`;labels+=`<text x="${px}" y="${clamp(y0+23,T+18,T+ph+28)}" text-anchor="middle">${safe(tickX(x))}</text>`}
 for(let k=Math.ceil(ymin/ys);k<=Math.floor(ymax/ys)&&k-Math.ceil(ymin/ys)<60;k++){const y=k*ys,py=Y(y);grid+=`<path d="M${L} ${py}H${L+pw}"/>`;if(Math.abs(y)>1e-9)labels+=`<text x="${clamp(x0-10,L-6,L+pw-10)}" y="${py+6}" text-anchor="end">${safe(number(y))}</text>`}
 for(const a of g.asymptotes||[]){const at=a.axis==='x'?X(a.value):Y(a.value);asymptotes+=a.axis==='x'?`<path d="M${at} ${T}V${T+ph}"/>`:`<path d="M${L} ${at}H${L+pw}"/>`}
 g.curves.forEach((curve,index)=>{let d='',last=null;for(let i=0;i<=420;i++){const x=xmin+(xmax-xmin)*i/420,y=egeCurveValue(curve,x);if(!Number.isFinite(y)||y<ymin-(ymax-ymin)*.2||y>ymax+(ymax-ymin)*.2){last=null;continue}const px=X(x),py=Y(y);d+=(last&&Math.abs(py-last[1])<ph*.65?'L':'M')+px.toFixed(2)+' '+py.toFixed(2);last=[px,py]}curves+=`<path data-ege-curve="${index}" d="${d}" stroke="${colors[index%2]}"/>`});
 for(const p of g.points||[]){points+=`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="5" fill="${colors[(p.curve||0)%2]}"/><text x="${X(p.x)+9}" y="${Y(p.y)-10}" fill="#0f172a">${safe(p.label||'')}</text>`}
 let arrows='';
 if(g.outline?.length)arrows+=`<path d="${g.outline.map((p,i)=>(i?'L':'M')+X(p[0])+' '+Y(p[1])).join('')}" fill="none" stroke="#94a3b8" stroke-width="2"/>`;
 for(const [i,v] of (g.vectors||[]).entries()){const a=v.from,b=v.to,dx=X(b[0])-X(a[0]),dy=Y(b[1])-Y(a[1]),len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,tx=X(b[0]),ty=Y(b[1]),color=colors[i%colors.length];arrows+=`<path data-ege-vector="${i}" d="M${X(a[0])} ${Y(a[1])}L${tx} ${ty}" stroke="${color}" stroke-width="3" fill="none"/><path d="M${tx} ${ty}L${tx-12*ux+5*uy} ${ty-12*uy-5*ux}L${tx-12*ux-5*uy} ${ty-12*uy+5*ux}Z" fill="${color}"/><text x="${(X(a[0])+tx)/2+9}" y="${(Y(a[1])+ty)/2-12}" fill="${color}" font-family="Arial,sans-serif" font-size="20">${safe(v.label)}</text>`;}
 const legend=g.vectors?'<span>Стрелки показывают направление; масштаб по осям одинаковый.</span>':g.curves.length>1?'<span>f — синяя линия; g — оранжевая.</span>':'';
 return `<figure class="ege-task-figure"><div class="ege-figure-scroll" tabindex="0" role="region" aria-label="Рисунок к задаче; при необходимости прокручивается по горизонтали"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${safe(task.title)}</title><desc id="${id}-desc">${safe(task.question)} Точные данные графика продублированы в условии.</desc><rect width="600" height="400" rx="12" fill="#ffffff"/><defs><clipPath id="${id}-clip"><rect x="${L}" y="${T}" width="${pw}" height="${ph}"/></clipPath></defs><g stroke="#dde5ee" stroke-width="1" fill="none">${grid}</g><g stroke="#334155" stroke-width="1.5" fill="none"><path d="M${L} ${y0}H${L+pw}M${x0} ${T}V${T+ph}"/></g><g font-family="Arial,sans-serif" font-size="18" fill="#334155">${labels}<text x="${L+pw-8}" y="${clamp(y0-10,T+18,T+ph-8)}">x</text><text x="${clamp(x0+12,L+8,L+pw-16)}" y="${T+16}">y</text></g><g clip-path="url(#${id}-clip)"><g stroke="#7c8798" stroke-width="1.4" stroke-dasharray="6 5" fill="none">${asymptotes}</g><g fill="none" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${curves}</g>${arrows}<g font-family="Arial,sans-serif" font-size="20">${points}</g></g></svg></div><figcaption>${legend} Рисунок восстановлен или адаптирован по данным задачи; ключевые координаты указаны в тексте.<span class="ege-scroll-hint">На узком экране рисунок можно прокрутить по горизонтали.</span></figcaption></figure>`;
}

/* Circuit symbols for original OGE electricity diagrams. */
const egeFigureWithoutCircuitSymbols=egeFigure;
egeFigure=function(task){
  const symbols=task&&task.figure&&task.figure.geometry&&task.figure.geometry.symbols;
  if(!symbols||!symbols.length)return egeFigureWithoutCircuitSymbols(task);
  const html=egeFigureWithoutCircuitSymbols(task);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const symbolSvg=s=>{
    const x=Number(s.x)||0,y=Number(s.y)||0,vertical=s.orientation==='vertical';
    const transform='translate('+x+' '+y+')'+(vertical?' rotate(90)':'');
    const stroke='#526e68';
    let body='';
    switch(s.type){
      case 'resistor': case 'heater':
        body='<rect x="-30" y="-12" width="60" height="24" rx="2" fill="#fff" stroke="'+stroke+'" stroke-width="3"/>';
        break;
      case 'rheostat':
        body='<rect x="-30" y="-12" width="60" height="24" rx="2" fill="#fff" stroke="'+stroke+'" stroke-width="3"/><path d="M-17 20 L18 -20 M8 -20 L18 -20 L18 -10" fill="none" stroke="'+stroke+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
        break;
      case 'lamp':
        body='<circle r="20" fill="#fff" stroke="'+stroke+'" stroke-width="3"/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="'+stroke+'" stroke-width="3"/>';
        break;
      case 'ammeter': case 'voltmeter':
        body='<circle r="20" fill="#fff" stroke="'+stroke+'" stroke-width="3"/><text x="0" y="1" text-anchor="middle" dominant-baseline="middle" fill="#263633" stroke="none" font-size="18" font-weight="700">'+(s.type==='ammeter'?'A':'V')+'</text>';
        break;
      case 'battery':
        body='<rect x="-20" y="-30" width="40" height="60" fill="#fff"/><path d="M-9 -24 V24 M9 -14 V14" stroke="'+stroke+'" stroke-width="4"/><text x="-18" y="-27" fill="#263633" stroke="none" font-size="14">+</text><text x="13" y="-12" fill="#263633" stroke="none" font-size="14">−</text>';
        break;
      case 'switch':
        body='<rect x="-34" y="-20" width="68" height="40" fill="#fff"/><path d="M-30 0 H-8 M8 0 H30" stroke="'+stroke+'" stroke-width="3"/><circle cx="-8" cy="0" r="4" fill="#fff" stroke="'+stroke+'" stroke-width="3"/><circle cx="8" cy="0" r="4" fill="#fff" stroke="'+stroke+'" stroke-width="3"/>'+(s.closed?'<path d="M-8 0 H8" stroke="'+stroke+'" stroke-width="3"/>':'<path d="M-8 0 L10 -14" stroke="'+stroke+'" stroke-width="3"/>');
        break;
      case 'fuse':
        body='<rect x="-30" y="-12" width="60" height="24" rx="2" fill="#fff" stroke="'+stroke+'" stroke-width="3"/><path d="M-20 0 L-10 -6 L0 6 L10 -6 L20 0" fill="none" stroke="'+stroke+'" stroke-width="2"/>';
        break;
      case 'motor':
        body='<circle r="20" fill="#fff" stroke="'+stroke+'" stroke-width="3"/><text x="0" y="1" text-anchor="middle" dominant-baseline="middle" fill="#263633" stroke="none" font-size="17" font-weight="700">M</text>';
        break;
      default:
        body='<circle r="5" fill="'+stroke+'"/>';
    }
    const label=s.label?'<text x="'+(x+(Number(s.labelDx)||(vertical?36:0)))+'" y="'+(y+(Number(s.labelDy)||(vertical?5:38)))+'" text-anchor="middle" dominant-baseline="middle" fill="#263633" stroke="none" font-family="Arial,sans-serif" font-size="15">'+esc(s.label)+'</text>':'';
    return '<g transform="'+transform+'" stroke-linecap="round" stroke-linejoin="round">'+body+'</g>'+label;
  };
  return html.replace('</g></svg>',symbols.map(symbolSvg).join('')+'</g></svg>');
};


/* Magnetic-field diagrams for original OGE physics tasks. */
const egeFigureMagneticBase=egeFigure;
egeFigure=function(task){
  const magnetic=task&&task.figure&&task.figure.geometry&&task.figure.geometry.magnetic;
  const html=egeFigureMagneticBase(task);
  if(!magnetic)return html;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=(v,d)=>Number.isFinite(Number(v))?Number(v):d;
  const arrowId='mag-arrow-'+String(task.id||'figure').replace(/[^a-z0-9-]/gi,'');
  const defs='<defs><marker id="'+arrowId+'" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#b65143"/></marker></defs>';
  const paths=(magnetic.fieldPaths||[]).map(p=>'<path d="'+esc(p.d||'')+'" fill="none" stroke="#89784f" stroke-width="2.4"'+(p.arrow?' marker-end="url(#'+arrowId+')"':'')+'/>').join('');
  const magnets=(magnetic.magnets||[]).map(m=>{
    const x=num(m.x,320),y=num(m.y,160),w=num(m.w,140),h=num(m.h,50),leftN=m.north!=='right',tf='translate('+x+' '+y+')'+(m.orientation==='vertical'?' rotate(90)':'');
    return '<g transform="'+tf+'" font-family="Arial,sans-serif" font-weight="700" text-anchor="middle"><rect x="'+(-w/2)+'" y="'+(-h/2)+'" width="'+(w/2)+'" height="'+h+'" rx="5" fill="'+(leftN?'#d85a4b':'#537eb3')+'" stroke="#394b5e" stroke-width="2"/><rect x="0" y="'+(-h/2)+'" width="'+(w/2)+'" height="'+h+'" rx="5" fill="'+(leftN?'#537eb3':'#d85a4b')+'" stroke="#394b5e" stroke-width="2"/><text x="'+(-w/4)+'" y="6" fill="#fff" font-size="20">'+(leftN?'N':'S')+'</text><text x="'+(w/4)+'" y="6" fill="#fff" font-size="20">'+(leftN?'S':'N')+'</text></g>';
  }).join('');
  const poles=(magnetic.poles||[]).map(p=>{
    const x=num(p.x,180),y=num(p.y,160),w=num(p.w,76),h=num(p.h,118),north=p.label==='N';
    return '<g font-family="Arial,sans-serif" font-weight="700" text-anchor="middle"><rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="7" fill="'+(north?'#d85a4b':'#537eb3')+'" stroke="#394b5e" stroke-width="2"/><text x="'+x+'" y="'+(y+7)+'" fill="#fff" font-size="22">'+esc(p.label||'N')+'</text></g>';
  }).join('');
  const coils=(magnetic.coils||[]).map(c=>{
    const x=num(c.x,360),y=num(c.y,160),w=num(c.w,190),h=num(c.h,86),turns=Math.max(3,Math.min(12,Math.round(num(c.turns,7)))),start=x-w/2,step=w/(turns-1);
    let loops='';for(let i=0;i<turns;i++)loops+='<ellipse cx="'+(start+i*step)+'" cy="'+y+'" rx="9" ry="'+(h/2)+'" fill="#f7f8f8" stroke="#bd703e" stroke-width="3"/>';
    return '<g><rect x="'+(x-w/2+4)+'" y="'+(y-h/4)+'" width="'+(w-8)+'" height="'+(h/2)+'" rx="4" fill="#aeb7bc" stroke="#687980" stroke-width="2"/>'+loops+'<path d="M'+(x-w/2-26)+' '+y+' H'+(x-w/2)+' M'+(x+w/2)+' '+y+' H'+(x+w/2+26)+'" fill="none" stroke="#bd703e" stroke-width="3"/><text x="'+(x-w/2-8)+'" y="'+(y-h/2-10)+'" text-anchor="middle" fill="#d85a4b" font-family="Arial,sans-serif" font-weight="700" font-size="18">'+(c.north==='right'?'S':'N')+'</text><text x="'+(x+w/2+8)+'" y="'+(y-h/2-10)+'" text-anchor="middle" fill="#537eb3" font-family="Arial,sans-serif" font-weight="700" font-size="18">'+(c.north==='right'?'N':'S')+'</text></g>';
  }).join('');
  const compasses=(magnetic.compasses||[]).map(c=>{
    const x=num(c.x,150),y=num(c.y,150),a=num(c.angle,0)*Math.PI/180,r=num(c.r,22),dx=Math.cos(a)*r,dy=Math.sin(a)*r;
    const label=c.label?'<text x="'+x+'" y="'+(y+r+23)+'" text-anchor="middle" fill="#263633" font-family="Arial,sans-serif" font-size="13">'+esc(c.label)+'</text>':'';
    return '<g><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#fff" stroke="#526e68" stroke-width="2"/><path d="M'+x+' '+y+' L'+(x+dx)+' '+(y+dy)+'" stroke="#d34f45" stroke-width="4" marker-end="url(#'+arrowId+')"/><path d="M'+x+' '+y+' L'+(x-dx)+' '+(y-dy)+'" stroke="#537eb3" stroke-width="4"/><circle cx="'+x+'" cy="'+y+'" r="3" fill="#394b5e"/></g>'+label;
  }).join('');
  const current=(magnetic.currentSymbols||[]).map(c=>{
    const x=num(c.x,320),y=num(c.y,160),r=num(c.r,19),mark=c.direction==='out'?'<circle cx="'+x+'" cy="'+y+'" r="5" fill="#263633"/>':'<path d="M'+(x-8)+' '+(y-8)+' L'+(x+8)+' '+(y+8)+' M'+(x+8)+' '+(y-8)+' L'+(x-8)+' '+(y+8)+'" stroke="#263633" stroke-width="3"/>';
    const label=c.label?'<text x="'+x+'" y="'+(y+r+20)+'" text-anchor="middle" fill="#263633" font-family="Arial,sans-serif" font-size="14">'+esc(c.label)+'</text>':'';
    return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#fff" stroke="#526e68" stroke-width="2"/>'+mark+label;
  }).join('');
  const conductors=(magnetic.conductors||[]).map(c=>{
    const x1=num(c.x1,180),y1=num(c.y1,160),x2=num(c.x2,460),y2=num(c.y2,160),label=c.label?'<text x="'+((x1+x2)/2)+'" y="'+(((y1+y2)/2)-12)+'" text-anchor="middle" fill="#263633" font-family="Arial,sans-serif" font-size="15">'+esc(c.label)+'</text>':'';
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#344d59" stroke-width="5" stroke-linecap="round" marker-end="url(#'+arrowId+')"/>'+label;
  }).join('');
  const arrows=(magnetic.arrows||[]).map(a=>{
    const x1=num(a.x1,120),y1=num(a.y1,160),x2=num(a.x2,520),y2=num(a.y2,160),label=a.label?'<text x="'+((x1+x2)/2)+'" y="'+(((y1+y2)/2)-10)+'" text-anchor="middle" fill="#263633" font-family="Arial,sans-serif" font-size="14">'+esc(a.label)+'</text>':'';
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#344d59" stroke-width="3" stroke-linecap="round" marker-end="url(#'+arrowId+')"/>'+label;
  }).join('');
  const galvanometers=(magnetic.galvanometers||[]).map(g=>{
    const x=num(g.x,555),y=num(g.y,160),angle=num(g.deflection,0),letter=esc(g.letter||'G');
    return '<g><circle cx="'+x+'" cy="'+y+'" r="27" fill="#fff" stroke="#526e68" stroke-width="3"/><path d="M'+(x-18)+' '+(y+9)+' Q'+x+' '+(y-12)+' '+(x+18)+' '+(y+9)+'" fill="none" stroke="#526e68" stroke-width="2"/><path d="M'+x+' '+(y+7)+' L'+(x+Math.sin(angle*Math.PI/180)*18)+' '+(y-Math.cos(angle*Math.PI/180)*18)+'" stroke="#d85a4b" stroke-width="3"/><circle cx="'+x+'" cy="'+y+'" r="4" fill="#d85a4b"/><text x="'+x+'" y="'+(y+45)+'" text-anchor="middle" fill="#263633" font-family="Arial,sans-serif" font-size="14">'+letter+'</text></g>';
  }).join('');
  const armatures=(magnetic.armatures||[]).map(a=>{
    const x=num(a.x,320),y=num(a.y,160),w=num(a.w,70),h=num(a.h,24),angle=num(a.angle,0);
    return '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="4" transform="rotate('+angle+' '+x+' '+y+')" fill="none" stroke="#526e68" stroke-width="4"/>';
  }).join('');
  const labels=(magnetic.labels||[]).map(l=>'<text x="'+num(l.x,320)+'" y="'+num(l.y,40)+'" text-anchor="middle" fill="#263633" font-family="Arial,sans-serif" font-size="16">'+esc(l.text||'')+'</text>').join('');
  const overlay=defs+paths+poles+magnets+coils+conductors+current+compasses+galvanometers+armatures+arrows+labels;
  return html.replace('</g></svg>',overlay+'</g></svg>');
};


/* Ray diagrams for original OGE physics optics tasks. */
const egeFigureOpticsBase=egeFigure;
egeFigure=function(task){
  const optics=task&&task.figure&&task.figure.geometry&&task.figure.geometry.optics;
  const html=egeFigureOpticsBase(task);
  if(!optics)return html;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=(v,d)=>Number.isFinite(Number(v))?Number(v):d;
  const id='opt-ray-'+String(task.id||'figure').replace(/[^a-z0-9-]/gi,'');
  const defs='<defs><marker id="'+id+'" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#2583b7"/></marker></defs>';
  const lines=(optics.lines||[]).map(l=>{
    const x1=num(l.x1,0),y1=num(l.y1,0),x2=num(l.x2,0),y2=num(l.y2,0),style=l.style||'guide';
    const color=style==='axis'?'#7d8794':style==='normal'?'#8a6ca8':style==='interface'?'#536c78':'#708090';
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="'+(style==='interface'?3:1.8)+'"'+(style==='normal'||style==='dashed'?' stroke-dasharray="7 6"':'')+'/>';
  }).join('');
  const rays=(optics.rays||[]).map(r=>{
    const color=r.color||'#2583b7',dash=r.style==='dashed'?' stroke-dasharray="7 6"':'';
    const marker=r.arrow===false?'':' marker-end="url(#'+id+')"';
    if(r.d)return '<path d="'+esc(r.d)+'" fill="none" stroke="'+color+'" stroke-width="2.7"'+dash+marker+'/>';
    return '<line x1="'+num(r.x1,0)+'" y1="'+num(r.y1,0)+'" x2="'+num(r.x2,0)+'" y2="'+num(r.y2,0)+'" fill="none" stroke="'+color+'" stroke-width="2.7"'+dash+marker+'/>';
  }).join('');
  const objects=(optics.objects||[]).map(o=>{
    const x=num(o.x,160),y=num(o.y,160),h=num(o.h,48),color=o.virtual?'#a267b5':'#334d5d',dash=o.virtual?' stroke-dasharray="6 5"':'';
    return '<line x1="'+x+'" y1="'+y+'" x2="'+x+'" y2="'+(y-h)+'" stroke="'+color+'" stroke-width="4"'+dash+' marker-end="url(#'+id+')"/><line x1="'+(x-10)+'" y1="'+y+'" x2="'+(x+10)+'" y2="'+y+'" stroke="#334d5d" stroke-width="2"/><text x="'+(x+8)+'" y="'+(y-h-8)+'" fill="#263633" font-family="Arial,sans-serif" font-size="14">'+esc(o.label||'предмет')+'</text>';
  }).join('');
  const sources=(optics.sources||[]).map(p=>'<circle cx="'+num(p.x,80)+'" cy="'+num(p.y,160)+'" r="8" fill="#e9a83b" stroke="#76571b" stroke-width="2"/><text x="'+num(p.x,80)+'" y="'+(num(p.y,160)-15)+'" text-anchor="middle" fill="#263633" font-family="Arial,sans-serif" font-weight="700" font-size="15">'+esc(p.label||'S')+'</text>').join('');
  const mirrors=(optics.mirrors||[]).map(m=>{
    const x=num(m.x,420),y=num(m.y,160),h=num(m.h,150),ang=num(m.tilt,0),rot=ang?' transform="rotate('+ang+' '+x+' '+y+')"':'';
    let hatch='';for(let k=-2;k<=2;k++)hatch+='<path d="M'+(x-6)+' '+(y+k*18+7)+' L'+(x+5)+' '+(y+k*18-4)+'" stroke="#89949d" stroke-width="1.5"/>';
    return '<g'+rot+'><line x1="'+x+'" y1="'+(y-h/2)+'" x2="'+x+'" y2="'+(y+h/2)+'" stroke="#354f60" stroke-width="6" stroke-linecap="round"/>'+hatch+'</g>';
  }).join('');
  const lenses=(optics.lenses||[]).map(l=>{
    const x=num(l.x,320),y=num(l.y,160),h=num(l.h,130),top=y-h/2,bottom=y+h/2;
    const d=l.type==='diverging'
      ?'M '+(x-10)+' '+top+' Q '+(x+14)+' '+y+' '+(x-10)+' '+bottom+' Q '+(x+10)+' '+y+' '+(x+10)+' '+top+' Q '+(x-14)+' '+y+' '+(x-10)+' '+top+' Z'
      :'M '+x+' '+top+' Q '+(x-28)+' '+y+' '+x+' '+bottom+' Q '+(x+28)+' '+y+' '+x+' '+top+' Z';
    return '<path d="'+d+'" fill="#d9eff2" fill-opacity="0.78" stroke="#39778b" stroke-width="3"/><line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+bottom+'" stroke="#39778b" stroke-width="1" stroke-dasharray="3 5"/>';
  }).join('');
  const screens=(optics.screens||[]).map(p=>{
    const x=num(p.x,520),y=num(p.y,160),h=num(p.h,120);let hatch='';for(let k=-3;k<=3;k++)hatch+='<path d="M'+(x+3)+' '+(y+k*14)+' l10 8" stroke="#9aa4aa" stroke-width="1.5"/>';
    return '<line x1="'+x+'" y1="'+(y-h/2)+'" x2="'+x+'" y2="'+(y+h/2)+'" stroke="#394e58" stroke-width="5"/>'+hatch+(p.label?'<text x="'+(x+18)+'" y="'+(y+h/2+16)+'" fill="#263633" font-family="Arial,sans-serif" font-size="13">'+esc(p.label)+'</text>':'');
  }).join('');
  const prisms=(optics.prisms||[]).map(p=>{const x=num(p.x,320),y=num(p.y,160),z=num(p.size,90);return '<path d="M'+(x-z/2)+' '+(y-z/2)+' L'+(x+z/2)+' '+y+' L'+(x-z/2)+' '+(y+z/2)+' Z" fill="#dcecf3" fill-opacity="0.8" stroke="#557d91" stroke-width="3"/>';}).join('');
  const eyes=(optics.eyes||[]).map(e=>{
    const x=num(e.x,435),y=num(e.y,160),w=num(e.w,170),h=num(e.h,116),retina=x+w/2-20;
    return '<g><ellipse cx="'+x+'" cy="'+y+'" rx="'+(w/2)+'" ry="'+(h/2)+'" fill="#f5f0e8" stroke="#667984" stroke-width="3"/><path d="M'+(x-w/2+24)+' '+(y-h/2+10)+' Q '+(x-w/2+52)+' '+y+' '+(x-w/2+24)+' '+(y+h/2-10)+'" fill="#dcecf3" stroke="#39778b" stroke-width="3"/><line x1="'+retina+'" y1="'+(y-h/2+16)+'" x2="'+retina+'" y2="'+(y+h/2-16)+'" stroke="#c55b5b" stroke-width="5"/><circle cx="'+(x-w/2+28)+'" cy="'+y+'" r="5" fill="#263633"/></g>';
  }).join('');
  const blocks=(optics.blocks||[]).map(b=>{
    const x=num(b.x,300),y=num(b.y,160),w=num(b.w,20),h=num(b.h,70);
    if(b.gap)return '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+((h-16)/2)+'" fill="#7b858d"/><rect x="'+(x-w/2)+'" y="'+(y+8)+'" width="'+w+'" height="'+((h-16)/2)+'" fill="#7b858d"/><circle cx="'+x+'" cy="'+y+'" r="4" fill="#e9a83b" stroke="#76571b"/><text x="'+x+'" y="'+(y-h/2-8)+'" text-anchor="middle" fill="#263633" font-family="Arial,sans-serif" font-size="13">'+esc(b.label||'отверстие')+'</text>';
    if(b.circle)return '<circle cx="'+x+'" cy="'+y+'" r="'+(h/2)+'" fill="#78838a" stroke="#394e58" stroke-width="2"/>';
    return '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="3" fill="#78838a" stroke="#394e58" stroke-width="2"/>';
  }).join('');
  const markers=(optics.markers||[]).map(m=>'<circle cx="'+num(m.x,320)+'" cy="'+num(m.y,160)+'" r="5" fill="#b95045"/><text x="'+num(m.x,320)+'" y="'+(num(m.y,160)+22)+'" text-anchor="middle" fill="#263633" font-family="Arial,sans-serif" font-size="14">'+esc(m.label||'F')+'</text>').join('');
  const labels=(optics.labels||[]).map(l=>'<text x="'+num(l.x,320)+'" y="'+num(l.y,40)+'" text-anchor="'+(l.anchor||'middle')+'" fill="#263633" font-family="Arial,sans-serif" font-size="14">'+esc(l.text||'')+'</text>').join('');
  const overlay=defs+lines+rays+objects+sources+mirrors+lenses+screens+prisms+eyes+blocks+markers+labels;
  return html.replace('</g></svg>',overlay+'</g></svg>');
};

/* Diagrams for OGE atomic and nuclear physics tasks. */
const egeFigureAtomicBase=egeFigure;
egeFigure=function(task){
 const a=task&&task.figure&&task.figure.geometry&&task.figure.geometry.atomic,html=egeFigureAtomicBase(task);if(!a)return html;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const id='atom-'+String(task.id||'figure').replace(/[^a-z0-9-]/gi,''),blue='#527ca4',red='#cf5a4f',dark='#354b5a',gold='#d8a33a';
 const defs='<defs><marker id="'+id+'-arr" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="'+blue+'"/></marker></defs>';
 const text=(x,y,s,size=14,color='#263633',anchor='middle',weight='normal')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+color+'" font-family="Arial,sans-serif" font-size="'+size+'" font-weight="'+weight+'">'+esc(s)+'</text>';
 const arrow=(x1,y1,x2,y2,label,color=blue)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="3" marker-end="url(#'+id+'-arr)"/>'+text((x1+x2)/2,(y1+y2)/2-9,label,13,color,'middle','700');
 const ball=(x,y,type,label)=>{const fill=type==='proton'?red:type==='neutron'?blue:type==='electron'?'#4d9b78':type==='alpha'?gold:type==='nucleus'?'#bd6b42':'#d9a33a';return '<circle cx="'+x+'" cy="'+y+'" r="'+(type==='nucleus'?26:12)+'" fill="'+fill+'" stroke="#354b5a" stroke-width="2"/>'+text(x,y+5,label||({proton:'p+',neutron:'n',electron:'e−',alpha:'α',nucleus:'+'}[type]||'S'),12,'#fff','middle','700');};
 const kind=a.kind,i=Number(a.index)||1;let art='';
 if(kind==='radiation'){
  art+=ball(82,160,'source','Ra');art+='<path d="M105 140 L570 82 M105 160 H570 M105 180 L570 238" fill="none" stroke-width="3" stroke-dasharray="'+''+'"/>';
  art+='<path d="M105 140 L570 82" stroke="#667d94" stroke-width="3" marker-end="url(#'+id+'-arr)"/><path d="M105 160 H570" stroke="#cf5a4f" stroke-width="3" marker-end="url(#'+id+'-arr)"/><path d="M105 180 L570 238" stroke="#4786b2" stroke-width="3" marker-end="url(#'+id+'-arr)"/>';
  art+=text(555,67,'γ',16,'#667d94','end','700')+text(555,153,'α',16,red,'end','700')+text(555,257,'β⁻',16,'#4786b2','end','700');
  for(const [x,l] of [[245,'бумага'],[365,'Al'],[485,'Pb']])art+='<rect x="'+(x-8)+'" y="102" width="16" height="116" rx="2" fill="#adb7bd" stroke="'+dark+'" stroke-width="2"/>'+text(x,92,l,13);
 }else if(kind==='half'){
  const vals=[16,8,4,2],labels=['начало','T½','2T½','3T½'];
  for(let k=0;k<4;k++){const x=95+k*150;art+=text(x,72,labels[k],13,'#263633','middle','700');for(let j=0;j<vals[k];j++){const col=j%4,row=Math.floor(j/4);art+='<circle cx="'+(x-22+col*15)+'" cy="'+(104+row*14)+'" r="5" fill="'+(k%2?blue:red)+'"/>'}art+=text(x,200,`${vals[k]} условных ядер`,12,'#536572');if(k<3)art+=arrow(x+38,150,x+95,150,'деление на 2')}
 }else if(kind==='scattering'){
  art+='<rect x="390" y="58" width="18" height="205" fill="#d7c4a3" stroke="#715e42" stroke-width="2"/>'+text(400,282,'фольга',13);
  art+='<circle cx="400" cy="160" r="15" fill="'+red+'" stroke="#743a35" stroke-width="2"/>'+text(400,165,'+',15,'#fff','middle','700');
  art+='<path d="M55 93 H585 M55 150 H362 Q390 150 420 119 M55 220 H108 Q145 205 114 174" fill="none" stroke="'+gold+'" stroke-width="3" marker-end="url(#'+id+'-arr)"/>';
  art+=text(180,80,'большинство проходит прямо',13)+text(236,139,'часть отклоняется',13)+text(92,246,'редкие частицы отскакивают',13);
  art+=arrow(82,160,275,160,'пучок α');
 }else if(kind==='decay'){
  art+='<circle cx="160" cy="160" r="54" fill="#e6edf1" stroke="'+dark+'" stroke-width="3"/><circle cx="480" cy="160" r="54" fill="#e6edf1" stroke="'+dark+'" stroke-width="3"/>';
  for(let k=0;k<5;k++){art+=ball(138+(k%3)*20,145+Math.floor(k/3)*25,k%2?'neutron':'proton',k%2?'n':'p+')}
  for(let k=0;k<4;k++)art+=ball(460+(k%2)*22,148+Math.floor(k/2)*24,k%2?'neutron':'proton',k%2?'n':'p+');
  art+=text(160,91,'исходное ядро',14)+text(480,91,'дочернее ядро',14)+arrow(225,160,403,160,i%2?'β⁻-распад':'α-распад')+ball(322,i%2?94:226,i%2?'electron':'alpha',i%2?'β⁻':'α');
 }else if(kind==='atom'||kind==='nucleus'||kind==='isotopes'){
  if(kind==='isotopes'){
   for(const [cx,count,label] of [[185,5,'X-A'],[450,7,'X-B']]){art+='<circle cx="'+cx+'" cy="155" r="65" fill="none" stroke="#9ba8b0" stroke-dasharray="5 5"/>';for(let k=0;k<count;k++)art+=ball(cx-22+(k%4)*15,137+Math.floor(k/4)*18,k%2?'neutron':'proton',k%2?'n':'p+');art+=text(cx,246,label,14,'#263633','middle','700')}
   art+=text(320,78,'одинаковое Z, разное A',15,'#354b5a','middle','700');
  }else if(kind==='atom'){
   art+='<circle cx="320" cy="158" r="65" fill="none" stroke="#9ba8b0" stroke-dasharray="5 5"/><circle cx="320" cy="158" r="112" fill="none" stroke="#9ba8b0" stroke-dasharray="5 5"/>';
   for(let k=0;k<8;k++)art+=ball(305+(k%4)*10,145+Math.floor(k/4)*15,k%2?'neutron':'proton',k%2?'n':'p+');
   for(const [x,y] of [[320,46],[432,158],[208,158],[320,270]])art+=ball(x,y,'electron','e−');
   art+=text(320,303,'нейтральный атом',14);
  }else{
   for(let k=0;k<12;k++)art+=ball(275+(k%4)*31,108+Math.floor(k/4)*31,k%2?'neutron':'proton',k%2?'n⁰':'p⁺');
   art+=text(320,70,'ядро состоит из нуклонов',15,'#354b5a','middle','700');art+=text(320,255,'A = Z + N',18,'#263633','middle','700');
  }
 }else if(kind==='reaction'||kind==='decay'){
  art+=text(105,141,'исходное ядро',15)+text(262,141,'частица',15)+text(462,141,'продукты',15);
  art+='<circle cx="105" cy="175" r="38" fill="#f2e2d6" stroke="'+dark+'" stroke-width="2"/><circle cx="262" cy="175" r="30" fill="#f7edcf" stroke="'+dark+'" stroke-width="2"/><circle cx="490" cy="175" r="43" fill="#e3edf3" stroke="'+dark+'" stroke-width="2"/>';
  art+=text(105,181,'A, Z',18,'#263633','middle','700')+text(262,181,'X',18,'#263633','middle','700')+text(490,181,'A, Z',18,'#263633','middle','700');
  art+=arrow(153,175,218,175,'+')+arrow(302,175,436,175,'→')+text(320,252,'сохраняются сумма A и сумма Z',15,'#354b5a','middle','700');
 }else if(kind==='fission'){
  art+=ball(235,160,'nucleus','U-235');art+=arrow(60,160,178,160,'n');
  art+='<path d="M272 151 Q350 95 460 83 M272 169 Q350 225 460 237" fill="none" stroke="'+blue+'" stroke-width="3" marker-end="url(#'+id+'-arr)"/>';
  art+=text(500,87,'осколок',14)+text(500,243,'осколок',14)+arrow(450,155,580,125,'нейтроны');
 }else if(kind==='reactor'){
  art+='<rect x="170" y="70" width="300" height="190" rx="28" fill="#e5eef2" stroke="'+dark+'" stroke-width="4"/><rect x="225" y="113" width="190" height="104" rx="14" fill="#f3dfb7" stroke="#846b3e" stroke-width="2"/>';
  for(let k=0;k<5;k++)art+='<rect x="'+(245+k*34)+'" y="78" width="10" height="90" fill="'+(k===2?'#b8524b':'#697f8f')+'"/>';
  art+=text(320,197,'активная зона',15,'#263633','middle','700')+arrow(470,135,565,135,'пар')+text(320,288,'управляющие стержни поглощают нейтроны',14);
 }else if(kind==='fusion'){
  for(const [x,t,l] of [[130,'proton','²H'],[220,'neutron',''],[280,'proton','³H'],[370,'neutron',''],[465,'nucleus','⁴He']])art+=ball(x,160,t,l||undefined);
  art+=arrow(310,160,420,160,'синтез')+text(320,68,'лёгкие ядра → более тяжёлое ядро + энергия',15,'#354b5a','middle','700');
 }
 const overlay=defs+art;
 return html.replace('</g></svg>',overlay+'</g></svg>');
};

/* Measuring instruments and experimental setups for original OGE physics tasks. */
const egeFigureExperimentBase=egeFigure;
egeFigure=function(task){
 const e=task&&task.figure&&task.figure.geometry&&task.figure.geometry.experiment,html=egeFigureExperimentBase(task);if(!e)return html;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
 const f=v=>String(Number(Number(v).toFixed(3))).replace('.',',');
 const txt=(x,y,s,size=14,color='#263633',anchor='middle',weight='normal')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+color+'" font-family="Arial,sans-serif" font-size="'+size+'" font-weight="'+weight+'">'+esc(s)+'</text>';
 let art='',kind=e.kind;
 if(kind==='scale'){
  const x1=82,x2=558,y=164,min=n(e.min),max=n(e.max,10),divisions=Math.max(1,n(e.divisions,10)),step=(max-min)/divisions,dx=(x2-x1)/divisions;
  art+='<rect x="62" y="82" width="516" height="138" rx="12" fill="#f8fafc" stroke="#aab8c3" stroke-width="2"/><path d="M'+x1+' '+y+'H'+x2+'" stroke="#435968" stroke-width="3"/>';
  for(let i=0;i<=divisions;i++){const x=x1+i*dx,major=i===0||i===divisions||i%Math.max(1,Math.round(divisions/5))===0,h=major?30:14;art+='<path d="M'+x+' '+y+'v'+h+'" stroke="#435968" stroke-width="'+(major?2:1.4)+'"/>';if(major)art+=txt(x,y+h+19,f(min+i*step),12);}
  art+=txt(320,112,e.label||'шкала',16,'#354b5a','middle','700')+txt(320,207,'Цена деления: '+f(step)+' '+(e.unit||''),13,'#526777');
  if(e.pointer!==null&&e.pointer!==undefined){const x=x1+n(e.pointer)*dx;art+='<path d="M'+(x-10)+' 128 L'+(x+10)+' 128 L'+x+' 150 Z" fill="#cb5149" stroke="#8d3733" stroke-width="1.5"/>';}
  art+=txt(546,103,e.unit||'',13,'#526777','end','700');
 }else if(kind==='ruler'){
  const x1=70,x2=570,y=178,min=n(e.min),max=n(e.max,10),scale=(x2-x1)/(max-min),start=n(e.start),end=n(e.end);
  art+='<rect x="'+(x1+(start-min)*scale)+'" y="119" width="'+((end-start)*scale)+'" height="44" rx="4" fill="#d9e3e8" stroke="#435968" stroke-width="2"/><path d="M'+x1+' '+y+'H'+x2+'" stroke="#435968" stroke-width="3"/>';
  for(let i=0;i<=50;i++){const x=x1+i*(x2-x1)/50,major=i%5===0,h=major?28:12;art+='<path d="M'+x+' '+y+'v'+h+'" stroke="#435968" stroke-width="'+(major?2:1)+'"/>';if(major)art+=txt(x,y+h+18,f(min+(max-min)*i/50),12);}
  art+=txt(320,75,'Края предмета на шкале, см',15,'#354b5a','middle','700')+txt(x1+(start-min)*scale,112,f(start),13,'#b44840','middle','700')+txt(x1+(end-min)*scale,112,f(end),13,'#b44840','middle','700');
 }else if(kind==='displacement'){
  const x=244,y=58,w=132,h=212,bottom=y+h,min=n(e.min),max=n(e.max,100),sy=v=>bottom-(v-min)/(max-min)*(h-12),yi=sy(n(e.initial)),yf=sy(n(e.final));
  art+='<path d="M'+(x+15)+' '+y+'V'+(bottom-14)+' Q'+(x+15)+' '+bottom+' '+(x+29)+' '+bottom+' H'+(x+w-29)+' Q'+(x+w-15)+' '+bottom+' '+(x+w-15)+' '+(bottom-14)+' V'+y+'" fill="#fff" stroke="#526b79" stroke-width="4"/><rect x="'+(x+20)+'" y="'+yf+'" width="'+(w-40)+'" height="'+(bottom-yf)+'" fill="#bddde8" opacity="0.82"/><path d="M'+(x+18)+' '+yi+'H'+(x+w-18)+'" stroke="#577c99" stroke-width="3" stroke-dasharray="7 5"/><path d="M'+(x+18)+' '+yf+'H'+(x+w-18)+'" stroke="#277c9b" stroke-width="3"/>';
  for(let k=0;k<=10;k++){const val=min+(max-min)*k/10,yy=bottom-k*h/10;art+='<path d="M'+(x+w-12)+' '+yy+'h18" stroke="#526b79" stroke-width="1.5"/>';if(k%2===0)art+=txt(x+w+32,yy+4,f(val),11,'#526777','start');}
  art+=txt(310,43,'Объём, '+(e.unit||'мл'),14,'#354b5a','middle','700')+txt(138,yi-6,'До: '+f(e.initial),13,'#526777','middle','700')+txt(138,yf-6,'После: '+f(e.final),13,'#277c9b','middle','700');
 }else if(kind==='density'){
  art+='<path d="M80 115H235 M102 115L126 187 M213 115L189 187 M115 187H200" fill="none" stroke="#526b79" stroke-width="4"/><path d="M125 188 Q157 212 190 188 L181 216H134Z" fill="#e7edf1" stroke="#526b79" stroke-width="2"/>'+txt(158,241,'m = '+f(e.mass)+' '+e.massUnit,14,'#354b5a','middle','700');
  const vmax=Math.ceil(n(e.volume)/40)*40,level=240-n(e.volume)/vmax*160;
  art+='<path d="M365 70V240 Q365 258 383 258H495 Q513 258 513 240V70" fill="#fff" stroke="#526b79" stroke-width="4"/><path d="M369 '+level+'H509V240Q509 254 493 254H385Q369 254 369 240Z" fill="#bddde8" opacity="0.82"/>';
  for(let k=0;k<=8;k++){const yy=240-k*20;art+='<path d="M493 '+yy+'h20" stroke="#526b79" stroke-width="1.5"/>';if(k%2===0)art+=txt(522,yy+4,String(k*vmax/8),11,'#526777','start');}
  art+=txt(438,53,'Измерение объёма',14,'#354b5a','middle','700')+txt(438,281,'V = '+f(e.volume)+' '+e.volumeUnit,14,'#354b5a','middle','700');
 }else if(kind==='measurements'){
  const rows=e.rows||[],headers=e.headers||['№','Значение'],x0=86,y0=91,w=468,rowH=Math.min(35,145/(rows.length+1)),colW=w/headers.length;
  art+='<rect x="'+x0+'" y="'+y0+'" width="'+w+'" height="'+(rowH*(rows.length+1))+'" rx="5" fill="#fff" stroke="#8095a2" stroke-width="2"/>';
  for(let r=0;r<=rows.length+1;r++)art+='<path d="M'+x0+' '+(y0+r*rowH)+'H'+(x0+w)+'" stroke="#aab8c3" stroke-width="1"/>';
  for(let c=1;c<headers.length;c++)art+='<path d="M'+(x0+c*colW)+' '+y0+'V'+(y0+rowH*(rows.length+1))+'" stroke="#aab8c3" stroke-width="1"/>';
  headers.forEach((h,c)=>art+=txt(x0+(c+.5)*colW,y0+rowH*.67,h,13,'#354b5a','middle','700'));
  rows.forEach((row,r)=>row.forEach((v,c)=>art+=txt(x0+(c+.5)*colW,y0+(r+1.5)*rowH,String(v),13)));
  art+=txt(320,66,e.label||'Результаты опыта',15,'#354b5a','middle','700')+txt(320,282,e.unit?'Единицы: '+e.unit:'',12,'#526777');
 }else if(kind==='design'){
  const setups=e.setups||[],x0=45,w=132,gap=17,y=87,h=170;
  art+=txt(320,57,'Сравните значения x и контрольной величины y',15,'#354b5a','middle','700');
  setups.forEach((s,i)=>{const x=x0+i*(w+gap);art+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="10" fill="#f8fafc" stroke="#9aabb6" stroke-width="2"/>'+txt(x+w/2,y+28,['А','Б','В','Г'][i],17,'#354b5a','middle','700')+'<path d="M'+(x+12)+' '+(y+41)+'H'+(x+w-12)+'" stroke="#c2cbd1"/>'+txt(x+w/2,y+78,'x = '+f(s.x)+' '+e.xUnit,14,'#277c9b','middle','700')+txt(x+w/2,y+121,'y = '+f(s.y)+' '+e.yUnit,13,'#526777')+txt(x+w/2,y+151,'установка '+['А','Б','В','Г'][i],11,'#84919a');});
 }else if(kind==='pendulum'){
  art+='<path d="M72 82H265 M168 82V106" stroke="#526b79" stroke-width="5"/><path d="M168 106L220 224" stroke="#526b79" stroke-width="3"/><circle cx="220" cy="224" r="22" fill="#d9e4ea" stroke="#435968" stroke-width="3"/><path d="M142 122A74 74 0 0 0 209 249" fill="none" stroke="#a8b6bf" stroke-width="2" stroke-dasharray="6 5"/>';
  art+='<rect x="355" y="100" width="190" height="112" rx="14" fill="#f8fafc" stroke="#9aabb6" stroke-width="2"/>'+txt(450,138,'Колебаний: '+f(e.count),17,'#354b5a','middle','700')+txt(450,176,'Общее время: '+f(e.total)+' с',15,'#526777')+txt(320,277,'Время серии делят на число колебаний',14,'#526777');
 }
 const overlay='<g font-family="Arial,sans-serif" fill="#263633">'+art+'</g>';
 return html.replace('</g></svg>',overlay+'</g></svg>').replace('Все числовые данные продублированы в условии.','Шкалы и результаты опыта показаны на рисунке.');
};
