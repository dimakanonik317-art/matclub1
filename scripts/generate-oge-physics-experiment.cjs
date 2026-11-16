/* 100 original OGE physics tasks on measurements and experimental methods. */
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve(__dirname, '../dist/oge-physics-experiment.js');
const bank = [];
const sources = [12429,14257,14282,14307,14332,14564,14590,25100,25865,26344,26345,29629,29705,33078,29750,25101];
const fmt = n => String(Number(n.toFixed(3))).replace('.', ',');
const base = (i, title, question, answer, unit, steps, exp, sourceIndex = i % sources.length, type = '15') => {
  const id = sources[sourceIndex % sources.length];
  bank.push({
    id:`oge-physics-experiment-${i}`, exam:'oge', domain:'physics', grade:9, subject:'physics', topic:0,
    topicName:'Измерения и эксперимент', examTopic:'physics-experiment', level:0, challenge:false, olympiad:false,
    experimentSection:Math.ceil(i/10), goal:'ОГЭ · измерения и эксперимент', title, question, answer:Number(answer), unit,
    figure:{geometry:{points:[],segments:[],circles:[],arcs:[],caption:`Иллюстрация к задаче: ${title}`,experiment:exp}},
    hints:['Определи измеряемую величину и найди подходящую шкалу, таблицу или пару установок.','Проверь единицы измерения и соотнеси результат с рисунком.'],
    steps, review:{plan:'Выдели показания прибора или сравни условия опытов.',verify:'Повтори вычисление и проверь физический смысл результата.',trap:'При сравнении опытов меняй только исследуемую величину, сохраняя остальные условия одинаковыми.'},
    sourceId:id, sourceCategory:215, sourceType:type,
    source:{name:'Решу ОГЭ',id,type,url:`https://phys-oge.sdamgia.ru/problem?id=${id}`,note:'Авторская задача Матклуба по теме измерений и экспериментальных заданий ОГЭ; ссылка ведёт на тематический прототип «Решу ОГЭ».'}
  });
};

// 1. Read a graduated instrument scale.
const scales = [
  ['длину рейки','линейки',0,10,20,7,'см'],['температуру воды','термометра',-10,40,25,18,'°C'],
  ['силу тяги','динамометра',0,5,10,7,'Н'],['силу тока','амперметра',0,3,15,9,'А'],
  ['напряжение','вольтметра',0,6,30,14,'В'],['объём воды','мензурки',0,100,20,9,'мл'],
  ['атмосферное давление','барометра',90,110,20,12,'кПа'],['время опыта','секундомера',0,12,24,15,'с'],
  ['длину проволоки','линейки',0,4,16,11,'см'],['силу упругости','динамометра',0,4,20,13,'Н']
];
scales.forEach((s,j)=>{const [what,device,min,max,divisions,pointer,unit]=s,step=(max-min)/divisions,value=min+step*pointer;
  base(j+1,'Показание прибора',`Ученик измеряет ${what} с помощью ${device}. По шкале на рисунке определите показание прибора. Запишите только число.`,value,unit,
    [`Шкала разделена на ${divisions} равных промежутков от ${fmt(min)} до ${fmt(max)} ${unit}.`,`Цена деления равна (${fmt(max)} − (${fmt(min)})) / ${divisions} = ${fmt(step)} ${unit}.`,`Стрелка стоит на ${pointer}-м делении от начала шкалы: показание равно ${fmt(min)} + ${pointer} · ${fmt(step)} = ${fmt(value)} ${unit}.`],
    {kind:'scale',label:device,min,max,divisions,pointer,unit,reading:value},j,'15');
});

// 2. Find the scale division or the stated measurement uncertainty.
const resolutions = [
  ['термометра',0,50,10,false,'°C'],['линейки',0,10,20,true,'см'],['динамометра',0,8,16,false,'Н'],
  ['мензурки',0,200,20,true,'мл'],['амперметра',0,2,20,false,'А'],['вольтметра',0,12,24,true,'В'],
  ['барометра',90,110,40,false,'кПа'],['секундомера',0,30,60,true,'с'],['линейки',0,5,25,false,'мм'],['термометра',-20,30,25,true,'°C']
];
resolutions.forEach((s,j)=>{const [device,min,max,divisions,half,unit]=s,price=(max-min)/divisions,answer=half?price/2:price,label=half?'погрешность':'цену деления';
  base(11+j,'Цена деления и погрешность',`На рисунке дана шкала ${device}. Между отметками ${fmt(min)} и ${fmt(max)} нанесено ${divisions} равных промежутков. Найдите ${label}${half?' (она равна половине цены деления)':''}. Ответ запишите числом в ${unit}.`,answer,unit,
    [`Цена деления шкалы: (${fmt(max)} − (${fmt(min)})) / ${divisions} = ${fmt(price)} ${unit}.`,half?`Погрешность равна половине цены деления: ${fmt(price)} / 2 = ${fmt(answer)} ${unit}.`:`В условии требуется цена деления, поэтому ответ равен ${fmt(price)} ${unit}.`],
    {kind:'scale',label:device,min,max,divisions,unit,reading:null,halfUncertainty:half},j,'15');
});

// 3. Determine a length when the ruler's zero is shifted.
const rulerData = [[1,6.5],[2,8],[0.5,7],[1.5,9],[2,5.5],[0,6],[3,9.5],[1,4],[0.5,5],[2.5,8.5]];
rulerData.forEach((r,j)=>{const [start,end]=r,len=end-start;
  base(21+j,'Линейка приложена не от нуля',`Края бруска совпадают с отметками ${fmt(start)} см и ${fmt(end)} см линейки (см. рисунок). Найдите длину бруска.`,len,'см',
    [`Нулевое деление линейки не совпадает с началом бруска, поэтому длину находят как разность отметок.`,`l = ${fmt(end)} − ${fmt(start)} = ${fmt(len)} см.`],
    {kind:'ruler',start,end,min:0,max:10,unit:'см',label:'линейка'},0,'15');
});

// 4. Measure an object's volume by liquid displacement.
const volumes = [[30,45],[40,65],[25,55],[50,80],[35,60],[20,50],[45,70],[60,90],[15,40],[55,85]];
volumes.forEach((v,j)=>{const [initial,final]=v,vol=final-initial;
  base(31+j,'Объём тела вытеснением воды',`В мензурке было ${initial} мл воды. После погружения тела уровень поднялся до ${final} мл (см. рисунок). Чему равен объём тела?`,vol,'см³',
    [`Объём тела равен увеличению объёма воды в мензурке.`,`V = ${final} − ${initial} = ${vol} мл.`,`Так как 1 мл = 1 см³, объём тела равен ${vol} см³.`],
    {kind:'displacement',initial,final,min:0,max:100,unit:'мл',label:'мензурка'},14,'15');
});

// 5. Calculate density from measured mass and volume.
const densities = [[120,40],[180,60],[240,80],[150,50],[270,90],[96,32],[210,70],[360,120],[225,75],[420,140]];
densities.forEach((d,j)=>{const [mass,volume]=d,rho=mass/volume;
  base(41+j,'Плотность по результатам опыта',`Массу тела измерили весами, а его объём — методом вытеснения воды. Получили m = ${mass} г и V = ${volume} см³ (см. рисунок). Найдите плотность тела.`,rho,'г/см³',
    [`Плотность вычисляют по формуле ρ = m / V.`,`ρ = ${mass} г / ${volume} см³ = ${fmt(rho)} г/см³.`],
    {kind:'density',mass,volume,massUnit:'г',volumeUnit:'см³',label:'результат измерений'},7,'15');
});

// 6. Average repeated direct measurements.
const repeats = [
  ['длины, см',[12.1,12.3,12.2]],['времени, с',[4.8,5.0,5.2]],['силы, Н',[2.4,2.5,2.6]],['температуры, °C',[21,22,23]],
  ['объёма, мл',[48,50,52]],['длины, мм',[35,36,37]],['времени, с',[1.9,2.0,2.1]],['силы тока, А',[0.38,0.40,0.42]],
  ['напряжения, В',[5.8,6.0,6.2]],['температуры, °C',[18.5,19,19.5]]
];
repeats.forEach((r,j)=>{const [quantity,values]=r,mean=values.reduce((a,b)=>a+b,0)/values.length,unit=quantity.split(', ')[1];
  base(51+j,'Среднее значение измерения',`Три раза измерили ${quantity} одного и того же тела. Показания: ${values.map(fmt).join('; ')}. Найдите среднее арифметическое показаний.`,mean,unit,
    [`Среднее значение равно сумме результатов, делённой на число измерений.`,`(${values.map(fmt).join(' + ')}) / 3 = ${fmt(mean)} ${unit}.`],
    {kind:'measurements',label:'Повторные измерения',headers:['Опыт','Показание'],rows:values.map((x,k)=>[String(k+1),fmt(x)]),unit},1,'15');
});

// 7. Choose a pair of setups that changes one independent variable.
const designs = [
 ['длины нити маятника','период колебаний маятника','масса груза','см','г',0.20,0.40,50,5,8,10],
 ['массы подвешенного груза','удлинение пружины','жёсткость пружины','г','Н/м',100,200,80,40,60,100],
 ['длины проволоки','сопротивление проволоки','площадь сечения проволоки','см','мм²',20,40,1,2,3,4],
 ['глубины погружения датчика','гидростатическое давление','плотность жидкости','см','г/см³',10,20,1,0.8,1.1,1.3],
 ['угла наклона плоскости','ускорение тележки','масса тележки','°','кг',10,20,0.5,1,1.5,2],
 ['силы растяжения пружины','удлинение пружины','начальная длина пружины','Н','см',1,2,20,10,15,25],
 ['площади поверхности тела','скорость охлаждения тела','начальная температура воды','см²','°C',40,80,80,60,70,90],
 ['площади соприкосновения бруска с поверхностью','сила трения скольжения','масса бруска','см²','кг',10,20,1,2,3,4],
 ['напряжения на резисторе','сила тока через резистор','сопротивление резистора','В','Ом',2,4,20,10,15,25],
 ['времени нагревания воды','температура воды','мощность нагревателя','мин','Вт',2,4,100,60,80,120]
];
const pairs=[['А','Б'],['А','В'],['Б','Г'],['В','Г']];
designs.forEach((d,j)=>{const [ind,dep,hold,xu,yu,x1,x2,y1,y2,y3,y4]=d,correct=((j*3)%4)+1,valid=pairs[0];
  const setups=[{x:x1,y:y1},{x:x2,y:y1},{x:x1,y:y2},{x:x1,y:y3}];
  const pool=[pairs[0],pairs[1],pairs[2],pairs[3]],ordered=[],distractors=pool.filter(p=>p!==valid);let distractorIndex=0;
  for(let k=0;k<4;k++)ordered[k]=k===correct-1?valid:distractors[distractorIndex++];
  const answerTexts=ordered.map((p,k)=>`${k+1}) ${p[0]} и ${p[1]}`).join('; ');
  base(61+j,'Выбор условий эксперимента',`Ученики изучают, как ${dep} меняется при изменении ${ind}. На рисунке x — измеряемая величина, а y — ${hold}. Какую пару установок нужно сравнить, чтобы изменить x, сохранив y и остальные условия? ${answerTexts}.`,correct,'номер пары',
    [`Чтобы проверить влияние ${ind}, нужно сравнить установки с разными значениями этой величины.`,`При этом ${hold} должны иметь одинаковые значения.`,`Этим условиям соответствует пара ${valid[0]} и ${valid[1]} (вариант ${correct}).`],
    {kind:'design',label:'Условия опыта',xLabel:ind,yLabel:hold,xUnit:xu,yUnit:yu,setups},15,'16');
});

// 8. Read a table and calculate average speed over the measured interval.
const motion = [
 [[0,1,2,3],[0,2,5,9]],[[0,2,4,6],[0,4,10,18]],[[0,1,2,4],[0,3,6,12]],[[0,2,4,8],[0,5,10,20]],
 [[0,1,3,5],[0,2,8,14]],[[0,2,3,6],[0,6,9,18]],[[0,1,2,5],[0,1.5,3,7.5]],[[0,2,5,8],[0,3,7.5,12]],
 [[0,1,4,7],[0,2,8,14]],[[0,3,6,9],[0,4.5,9,13.5]]
];
motion.forEach((m,j)=>{const [t,x]=m,last=t.length-1,v=(x[last]-x[0])/(t[last]-t[0]);
  base(71+j,'Средняя скорость по данным опыта',`Измерили путь движущегося тела в моменты времени: ${t.map((tv,k)=>`${fmt(tv)} с — ${fmt(x[k])} м`).join('; ')}. Найдите среднюю скорость за весь опыт.`,v,'м/с',
    [`За весь опыт тело прошло ${fmt(x[last])} − ${fmt(x[0])} = ${fmt(x[last]-x[0])} м за ${fmt(t[last])} − ${fmt(t[0])} = ${fmt(t[last]-t[0])} с.`,`Средняя скорость v = Δs / Δt = ${fmt(x[last]-x[0])} / ${fmt(t[last]-t[0])} = ${fmt(v)} м/с.`],
    {kind:'measurements',label:'Путь тела во время опыта',headers:['Время, с','Путь, м'],rows:t.map((xv,k)=>[fmt(xv),fmt(x[k])]),unit:'м/с'},15,'16');
});

// 9. Identify the range over which the measured spring obeys Hooke's law.
const hooke = [
 [[2,4,6,8,10],[1,2,3,5,7],6],[[3,6,9,12,15],[1,2,3,5,8],9],[[1,2,3,4,5],[0.5,1,1.5,2.5,4],3],
 [[4,8,12,16,20],[2,4,6,9,12],12],[[2,4,6,8,10],[2,4,6,8,11],8],[[5,10,15,20,25],[1,2,3,5,7],15],
 [[1,2,3,4,5],[1,2,3,5,6],3],[[3,6,9,12,15],[2,4,6,9,11],9],[[2,4,6,8,10],[1,2,3,4,6],8],[[4,8,12,16,20],[1,2,3,5,7],12]
];
hooke.forEach((h,j)=>{const [force,extension,maxForce]=h,valid=force.findIndex((f,k)=>f>maxForce),end=valid<0?force.length:valid+1;
  base(81+j,'Проверка закона Гука по таблице',`При растяжении одной и той же пружины измеряли силу F и удлинение Δl: ${force.map((f,k)=>`(${fmt(f)} Н; ${fmt(extension[k])} см)`).join(', ')}. Определите наибольшее значение силы, до которого удлинение прямо пропорционально силе. Ответ дайте в ньютонах.`,maxForce,'Н',
    [`Для прямой пропорциональности отношение F / Δl должно быть одинаковым.`,`Для первых ${end} измерений это отношение постоянно: ${force.slice(0,end).map((f,k)=>`${fmt(f)}/${fmt(extension[k])}`).join(' = ')}.`,`Следующее значение уже не сохраняет это отношение, поэтому максимальная сила в линейной области равна ${fmt(maxForce)} Н.`],
    {kind:'measurements',label:'Сила и удлинение пружины',headers:['F, Н','Δl, см'],rows:force.map((f,k)=>[fmt(f),fmt(extension[k])]),unit:'Н'},15,'16');
});

// 10. Determine the period from timing several pendulum oscillations.
const pendulums = [[10,18],[12,24],[15,30],[20,36],[8,12],[25,50],[16,24],[30,45],[18,27],[24,36]];
pendulums.forEach((p,j)=>{const [count,total]=p,period=total/count;
  base(91+j,'Период маятника по серии колебаний',`Для уменьшения погрешности ученик измерил время ${count} полных колебаний маятника. Вся серия заняла ${total} с (см. рисунок). Найдите период одного колебания.`,period,'с',
    [`Период равен полному времени серии, делённому на количество колебаний.`,`T = ${total} с / ${count} = ${fmt(period)} с.`],
    {kind:'pendulum',count,total,label:'Измерение периода'},15,'16');
});

if (bank.length !== 100) throw new Error(`Expected 100 tasks, generated ${bank.length}`);
fs.writeFileSync(out, `/* 100 авторских задач ОГЭ по измерениям и эксперименту с иллюстрациями приборов и установок. */\n(()=>{const bank=${JSON.stringify(bank)};tasks.push(...bank)})();\n`);
console.log(`Generated ${bank.length} OGE physics experiment tasks at ${out}`);
