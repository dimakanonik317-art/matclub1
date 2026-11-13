const fs=require('node:fs');
const bank=[];
const mod=(x,n)=>((x%n)+n)%n;
const fmt=(x,d=4)=>Number(x.toFixed(d)).toFixed(d).replace(/\.?0+$/,'');
const add=(sourceId,sourceType,title,question,answer,steps,plan,trap)=>{
  bank.push({id:'ege-numbers-extra-'+String(bank.length+1).padStart(3,'0'),sourceId,sourceType,examTopic:'numbers',topic:8,level:1,title:title+' · вариант '+(bank.length%10+1),question,answer,hints:[plan,'Проверь, что найденный вариант удовлетворяет условию, и объясни, почему других нет.'],steps,review:{plan,verify:steps[steps.length-1],trap}});
};
const gcd=(a,b)=>b?gcd(b,a%b):a;
const lcm=(a,b)=>a/gcd(a,b)*b;
// 1–10: Chinese remainder reasoning with small, pairwise-coprime moduli.
const residueMods=[[7,11],[5,13],[8,9],[11,13],[7,12],[5,14],[9,10],[8,11],[13,15],[7,16]];
for(let k=0;k<10;k++){
  const m=residueMods[k][0],n=residueMods[k][1],seed=200+37*k,r=seed%m,s=seed%n;
  let inverse=1;while(mod(m*inverse,n)!==1)inverse++;
  const t=mod((s-r)*inverse,n),raw=r+m*t,answer=raw===0?m*n:raw;
  add(507579,'сравнение остатков','Наименьшее число по остаткам','Найди наименьшее положительное целое число N, для которого при делении на '+m+' остаток равен '+r+', а при делении на '+n+' остаток равен '+s+'.',answer,[
    'Положим N = '+r+' + '+m+'t. Тогда из второго условия '+m+'t ≡ '+s+' − '+r+' (mod '+n+').',
    'Обратное к '+m+' по модулю '+n+' число равно '+inverse+': поэтому t ≡ '+t+' (mod '+n+').',
    'Наименьшее решение: N = '+r+' + '+m+'·'+t+' = '+raw+(raw===0?'; нулевое решение заменяем на наименьшее положительное N = '+answer+'.':'.')
  ],'Сведи первое сравнение к N = r + mt, затем реши сравнение для t.','Если получился ноль, ищи наименьшее положительное решение, а не нулевое.');
}
// 11–20: recover two integers from their gcd and lcm.
const primePairs=[[2,11],[3,13],[5,17],[7,11],[2,19],[3,17],[5,13],[7,13],[11,13],[3,23]];
for(let k=0;k<10;k++){
  const g=2+k,p=primePairs[k][0],q=primePairs[k][1],L=g*p*q,answer=g*(p+q);
  add(511111,'НОД и НОК','Два числа по НОД и НОК','Натуральные числа x<y удовлетворяют НОД(x,y) = '+g+' и НОК(x,y) = '+L+'. Известно, что x>'+g+' и y>'+g+'. Найди x+y.',answer,[
    'Запишем x = '+g+'a, y = '+g+'b, где НОД(a,b)=1. Из формулы НОК получаем ab = '+L+'/'+g+' = '+(p*q)+'.',
    'Так как '+p+' и '+q+' — различные простые числа, взаимно простые пары множителей: (1, '+(p*q)+') и ('+p+', '+q+'). Условие x>'+g+' исключает множитель 1.',
    'Значит, {a,b} = {'+p+', '+q+'}. Поэтому x+y = '+g+'·('+p+'+'+q+') = '+answer+'.'
  ],'Вынеси НОД из обоих чисел и используй НОК = НОД·a·b для взаимно простых a,b.','Пара множителей (1, pq) даёт одно число, равное НОД, и не подходит.');
}
// 21–30: tournament point invariants.
for(let k=0;k<10;k++){
  const n=6+k,total=n*(n-1);
  add(505570,'очки в круговом турнире','Сколько участников было в турнире?','В шахматном турнире каждый из участников сыграл с каждым дважды. За победу начисляют 1 очко, за ничью — по 0,5 очка каждому. Все участники вместе набрали '+total+' очков. Сколько было участников?',n,[
    'В каждой партии участники в сумме получают ровно 1 очко: 1+0 или 0,5+0,5.',
    'При n участниках сыграно 2·C(n,2) = n(n−1) партий, значит суммарно начислено n(n−1) очков.',
    'Решаем n(n−1) = '+total+'. Получаем n²−n−'+total+' = 0, откуда положительный корень n = '+n+'.'
  ],'Сначала посчитай, сколько очков распределяется в одной партии и сколько партий всего.','Ничья делит одно очко, а не добавляет половину очка к общему числу.');
}
// 31–40: maximize the number of distinct terms in a positive-integer arithmetic progression with bounded sum.
for(let k=0;k<10;k++){
  const n=8+k,S=n*(n+1)/2+1;
  add(501512,'сумма арифметической прогрессии','Сколько членов может быть в прогрессии?','Различные натуральные числа образуют возрастающую арифметическую прогрессию. Их сумма меньше '+S+'. Какое наибольшее число членов может иметь такая прогрессия?',n,[
    'У возрастающей прогрессии с натуральными членами первый член не меньше 1, а разность — не меньше 1. Поэтому сумма n членов не меньше 1+2+…+n = n(n+1)/2.',
    'Для n = '+n+' минимальная сумма равна '+(n*(n+1)/2)+', что меньше '+S+'. Такой минимум достигается на прогрессии 1,2,…,'+n+'.',
    'Для '+(n+1)+' членов даже минимальная сумма равна '+((n+1)*(n+2)/2)+', а это уже не меньше '+S+'. Следовательно, максимум — '+n+'.'
  ],'Оцени снизу сумму n различных натуральных чисел; равномерно растущая прогрессия начинается с 1.','Для верхней границы нужно проверить и достижимость предыдущего числа членов.');
}
// 41–50: intersections of two finite arithmetic progressions.
const apSteps=[[4,7],[5,8],[7,9],[8,11],[9,13],[11,17],[13,19],[17,23],[19,25],[23,29]];
for(let k=0;k<10;k++){
  const d1=apSteps[k][0],d2=apSteps[k][1],a=2+2*k,b=5+3*k,period=lcm(d1,d2),floor=Math.max(a,b);
  let first=floor;while(first%d1!==a%d1||first%d2!==b%d2)first++;
  const jumps=3+(k%4),last=first+period*jumps,count=jumps+1,sum=count*(first+last)/2;
  add(507808,'общие члены прогрессий','Общие члены двух прогрессий','Даны конечные арифметические прогрессии '+a+', '+(a+d1)+', …, '+last+' и '+b+', '+(b+d2)+', …, '+last+'. Найди сумму их общих членов, считая каждый общий член один раз.',sum,[
    'Общий член x должен удовлетворять x ≡ '+a+' (mod '+d1+') и x ≡ '+b+' (mod '+d2+'). Наименьший общий член не меньше '+floor+' и равен '+first+'.',
    'Дальше общие члены повторяются через НОК('+d1+', '+d2+') = '+period+'. До общего последнего члена '+last+' получаем: '+Array.from({length:count},(_,i)=>first+i*period).join(', ')+'.',
    'Это арифметическая прогрессия из '+count+' чисел. Их сумма равна '+count+'·('+first+'+'+last+')/2 = '+sum+'.'
  ],'Реши систему сравнений по модулю шагов, затем используй период НОК шагов.','Не суммируй члены каждой исходной прогрессии: нужны только совпадающие.');
}
// 51–60: repeated doubling of the sum of decimal digits.
const digitSeeds=[12000,13579,23456,33333,45678,98765,11119,20246,76432,88888];
const digitSum=n=>String(n).split('').reduce((s,d)=>s+Number(d),0);
for(let k=0;k<10;k++){
  let current=digitSeeds[k];const trace=[current];while(current>=10){current=2*digitSum(current);trace.push(current);if(trace.length>20)throw Error('digit transform did not terminate');}
  add(505723,'преобразование суммы цифр','Цепочка цифровых преобразований','На каждом шаге число заменяют удвоенной суммой его десятичных цифр. Начинают с '+digitSeeds[k]+'. Через сколько шагов впервые получится однозначное число?',trace.length-1,[
    'Вычисляем сумму цифр и удваиваем: '+trace.slice(0,-1).map((x,i)=>x+' → '+(2*digitSum(x))).join('; ')+'.',
    'Цепочка целиком: '+trace.join(' → ')+'.',
    'Первое однозначное число получено на шаге '+(trace.length-1)+'.'
  ],'На каждом шаге суммируй именно десятичные цифры текущего числа, а не исходного.','Проверь, что однозначное число впервые появилось в конце цепочки.');
}
// 61–70: maximize a signed sum when exactly k products receive a minus sign.
for(let k=0;k<10;k++){
  const aMax=3+(k%4),bStart=9+k,bCount=3+(k%3),A=Array.from({length:aMax-1},(_,i)=>i+2),B=Array.from({length:bCount},(_,i)=>bStart+i),products=A.flatMap(a=>B.map(b=>a*b)).sort((x,y)=>x-y),negativeCount=1+(k%4),small=products.slice(0,negativeCount),total=A.reduce((x,y)=>x+y,0)*B.reduce((x,y)=>x+y,0),answer=total-2*small.reduce((x,y)=>x+y,0);
  add(507495,'знаки у произведений','Знаки у попарных произведений','Каждое число из набора {'+A.join(', ')+'} умножили на каждое число из набора {'+B.join(', ')+'}. Перед '+negativeCount+' из полученных произведений ставят знак минус, перед остальными — плюс. Какое наибольшее значение суммы можно получить?',answer,[
    'Сумма всех произведений до смены знаков: ('+A.join('+')+')·('+B.join('+')+') = '+total+'.',
    'Чтобы уменьшить эту сумму как можно меньше, отрицательными делаем '+negativeCount+' наименьших произведений: '+small.join(', ')+'. Их сумма равна '+small.reduce((x,y)=>x+y,0)+'.',
    'Меняем знак этих слагаемых: '+total+' − 2·'+small.reduce((x,y)=>x+y,0)+' = '+answer+'.'
  ],'Суммируй все произведения, затем выбери самые маленькие из тех, которым можно поставить минус.','Каждое отрицательное слагаемое уменьшает исходную сумму на удвоенное значение этого произведения.');
}
// 71–80: least n for which n! has a target number of trailing zeroes.
const zeros=n=>{let z=0;for(let p=5;p<=n;p*=5)z+=Math.floor(n/p);return z;};
for(let k=0;k<10;k++){
  const target=10+k;let n=0;while(zeros(n)<target)n++;
  const terms=n=>{const a=[];for(let p=5;p<=n;p*=5)a.push(Math.floor(n/p));return a;};
  add(507501,'факториал и нули','Нули в конце факториала','Найди наименьшее натуральное n, для которого запись числа n! оканчивается не менее чем '+target+' нулями.',n,[
    'Каждая конечная ноль требует множителя 10=2·5; двоек в n! больше, поэтому считаем множители 5.',
    'Для n = '+n+': ⌊n/5⌋+⌊n/25⌋+… = '+terms(n).join(' + ')+' = '+zeros(n)+'.',
    'Для n = '+(n-1)+': ⌊n/5⌋+⌊n/25⌋+… = '+terms(n-1).join(' + ')+' = '+zeros(n-1)+' < '+target+'. Значит, минимальное n равно '+n+'.'
  ],'Число нулей в n! равно сумме ⌊n/5⌋+⌊n/25⌋+⌊n/125⌋+… .','Нужно проверить и n−1: это доказывает, что найденное n минимально.');
}
// 81–90: bounded integer solutions to differences of powers.
const powerCases=[[2,3,1],[2,3,5],[2,3,13],[2,3,7],[3,2,7],[3,2,5],[3,2,1],[3,2,25],[3,2,23],[2,5,11]];
for(let k=0;k<10;k++){
  const a=powerCases[k][0],b=powerCases[k][1],C=powerCases[k][2],maxM=6,maxN=5,pa=Array.from({length:maxM},(_,i)=>a**(i+1)),solutions=[];
  for(let m=1;m<=maxM;m++)for(let n=1;n<=maxN;n++)if(a**m-b**n===C)solutions.push([m,n]);
  const checks=Array.from({length:maxN},(_,i)=>{const n=i+1,v=b**n+C,m=pa.indexOf(v)+1;return n+': '+b+'^'+n+' + '+C+' = '+v+(m?' = '+a+'^'+m:' — не входит в список степеней основания '+a);});
  add(507574,'разность степеней','Ограниченный поиск пар степеней','Натуральные числа m≤'+maxM+' и n≤'+maxN+' удовлетворяют уравнению '+a+'^m − '+b+'^n = '+C+'. Сколько существует упорядоченных пар (m,n)?',solutions.length,[
    'Перенесём вторую степень: '+a+'^m = '+b+'^n + '+C+'. Проверим все значения n от 1 до '+maxN+': '+checks.join('; ')+'.',
    'Степени '+a+'^m при 1≤m≤'+maxM+': '+pa.join(', ')+'. Сопоставление с вычисленными значениями даёт пары '+(solutions.length?solutions.map(p=>'('+p.join(', ')+')').join(', '):'нет')+'.',
    'Других пар нет: все допустимые n проверены, а для каждого совпавшего значения найден показатель m в указанном диапазоне. Число пар равно '+solutions.length+'.'
  ],'Перебери степень меньшего основания, затем проверяй, является ли полученное число степенью второго основания.','Не пропусти случай, когда одному уравнению удовлетворяет больше одной пары показателей.');
}
// 91–100: count real roots of floor equations by integer intervals.
const floorCases=[[5,0],[5,2],[6,4],[7,6],[8,9],[9,12],[10,16],[11,18],[12,23],[13,30]];
for(let k=0;k<10;k++){
  const D=floorCases[k][0],C=floorCases[k][1],ks=[];
  for(let t=0;t<=D+1;t++){const v=D*t-C;if(v>=0&&t*t<=v&&v<(t+1)*(t+1))ks.push(t);}
  const roots=ks.map(t=>'√'+(D*t-C)).join(', ');
  add(507493,'целая часть и квадрат','Уравнение с целой частью','Найди количество действительных корней уравнения ⌊x⌋ = (x² + '+C+')/'+D+'.',ks.length,[
    'Пусть k = ⌊x⌋. Тогда x² = '+D+'k − '+C+'. Поскольку правая часть неотрицательна, k≥0.',
    'Условие k≤x<k+1 равносильно k²≤'+D+'k−'+C+'<(k+1)². Целые k, удовлетворяющие обеим границам: '+ks.join(', ')+'.',
    'Для каждого такого k существует ровно один корень x=√('+D+'k−'+C+'): '+roots+'. Всего корней '+ks.length+'.'
  ],'Обозначь целую часть через целое k и используй отрезок k≤x<k+1.','Проверяй обе границы интервала; верхняя граница строгая.');
}
if(bank.length!==100)throw Error('Expected 100 tasks; generated '+bank.length);
const out='/* 100 original number-theory and logic variations linked to relevant Reshu EGE problems. */\n(()=>{const bank='+JSON.stringify(bank)+';for(const item of bank)tasks.push({...item,exam:\'ege\',domain:\'math\',grade:11,subject:\'algebra\',topicName:egeTopics.find(t=>t.id===item.examTopic).name,unit:null,challenge:true,goal:\'ЕГЭ · числа и логика\',source:{name:\'Решу ЕГЭ\',id:item.sourceId,type:item.sourceType,url:\'https://math-ege.sdamgia.ru/problem?id=\'+item.sourceId,note:\'Авторский вариант по тематике задания «Решу ЕГЭ». Полное решение — Матклуб.\',checked:\'2026-11-13\'}})})();\n';
fs.writeFileSync('dist/ege-numbers-expansion.js',out);
console.log('Generated '+bank.length+' number and logic tasks.');
