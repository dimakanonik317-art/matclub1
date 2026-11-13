const fs=require('node:fs');
const bank=[];
const round=(n,d=2)=>Number(n.toFixed(d));
const fmt=(n,d=2)=>round(n,d).toFixed(d).replace(/\.?0+$/,'');
const add=(group,k,sourceId,sourceType,title,question,answer,steps,plan,trap)=>{
  bank.push({id:`ege-economics-extra-${String(bank.length+1).padStart(3,'0')}`,sourceId,sourceType,examTopic:'economics',topic:8,level:1,title:`${title} · вариант ${k+1}`,question,answer:round(answer,6),hints:[plan,'Запиши денежные потоки по порядку и проверь, что проценты начислены за нужный период.'],steps,review:{plan,verify:steps.at(-1),trap}});
};
// 1–10: yearly deposits with regular additions at the beginning of the year.
for(let k=0;k<10;k++){
  const principal=100+20*k,topup=10+2*k,q=1.1,b1=principal*q,b2=(b1+topup)*q,b3=(b2+topup)*q;
  add(1,k,704682,'вклад с пополнением','Пополняемый вклад',`Вклад ${principal} тыс. рублей открыт на 3 года под 10% годовых. В начале второго и третьего годов на него вносят ещё по ${topup} тыс. рублей. Сколько тысяч рублей будет на счёте в конце третьего года? Округли до сотых тысячи.`,round(b3,2),[`После первого года: ${principal}·1,1 = ${fmt(b1)} тыс. рублей.`,`После пополнения и второго начисления: (${fmt(b1)} + ${topup})·1,1 = ${fmt(b2)} тыс. рублей.`,`После второго пополнения: (${fmt(b2)} + ${topup})·1,1 = ${fmt(b3)} тыс. рублей.`],'Сначала внеси пополнение в начале нужного года, затем начисли проценты.','Пополнение в начале года получает проценты за весь этот год.');
}
// 11–20: withdraw after year 1, restore that sum after year 2, compare the final balance.
for(let k=0;k<10;k++){
  const principal=80+8*k,amount=2+k,q=1.1,b1=principal*q-amount,b2=b1*q+amount,b3=b2*q;
  add(2,k,508585,'вклад: снятие и возврат','Снятие и возврат со вклада',`На вклад внесли ${principal} тыс. рублей под 10% годовых на 3 года. Сразу после начисления процентов за первый год сняли ${amount} тыс. рублей, а сразу после начисления за второй год внесли эту сумму обратно. Найди остаток в конце третьего года, в тысячах рублей. Округли до сотых тысячи.`,round(b3,2),[`После первого года и снятия: ${principal}·1,1 − ${amount} = ${fmt(b1)} тыс. рублей.`,`После второго начисления и возврата: ${fmt(b1)}·1,1 + ${amount} = ${fmt(b2)} тыс. рублей.`,`Ещё одно начисление: ${fmt(b2)}·1,1 = ${fmt(b3)} тыс. рублей.`],'Проценты начисляются до операции, описанной «сразу после начисления».','Снятие и возврат происходят в разные годы, поэтому на снятую сумму теряются проценты.');
}
// 21–30: compare a fixed 15% rate with rates symmetric around 15%.
for(let k=0;k<10;k++){
  const principal=1000000+500000*k,d=3+k,flat=principal*1.15**3,varying=principal*(1.15-d/100)*1.15*(1.15+d/100),difference=Math.abs(flat-varying),winner=flat>varying?'постоянный':'изменяющийся';
  add(3,k,704686,'сравнение ставок по вкладу','Сравнение двух ставок',`На ${principal} рублей открывают два вклада на 3 года с капитализацией процентов. Первый всё время даёт 15% годовых. Во втором ставки по годам равны ${15-d}%, 15% и ${15+d}%. Какой вклад даст большую сумму и на сколько рублей?`,difference,[`Для постоянной ставки итоговый множитель: 1,15³ = ${fmt(flat/principal,6)}.`,`Для меняющейся ставки множитель: 1,${String(15-d).padStart(2,'0')}·1,15·1,${String(15+d).padStart(2,'0')} = ${fmt(varying/principal,6)}.`,`Разность итогов равна ${fmt(difference)} рубля; больше даст ${winner} вклад.`],'Перемножай годовые множители, а не складывай ставки.','Среднее арифметическое ставок не определяет итог при капитализации.');
}
// 31–40: recover an annual rate from principal, term and final balance.
for(let k=0;k<10;k++){
  const principal=1000000+100000*k,rate=[5,10,15,20,25][k%5],years=2+(k%2),final=principal*(1+rate/100)**years;
  add(4,k,704685,'определение ставки вклада','Определение ставки по вкладу',`Вклад ${principal} рублей без пополнений лежал ${years} года с ежегодной капитализацией. К концу срока на счёте стало ${final.toFixed(2)} рубля. Найди годовую ставку в процентах.`,rate,[`Обозначь годовой множитель через q. Тогда ${principal}·q^${years} = ${final.toFixed(2)}.`,`Раздели конечную сумму на первоначальную: q^${years} = ${fmt(final/principal,8)}; извлеки корень степени ${years}.`,`q = ${fmt(1+rate/100,4)}, поэтому годовая ставка равна ${rate}%.`],'Сначала найди годовой множитель, затем вычти 1 и переведи в проценты.','Не дели общий процентный прирост на число лет: проценты капитализируются.');
}
// 41–50: equal annual principal repayments; interest is charged on the remaining principal.
for(let k=0;k<10;k++){
  const principal=1.2+0.2*k,years=3+(k%4),rate=6+2*(k%4),interest=principal*(rate/100)*(years+1)/2,total=principal+interest,share=principal/years;
  add(5,k,517480,'кредит с равными долями долга','Кредит с равными долями основного долга',`Кредит ${fmt(principal,3)} млн рублей погашают за ${years} лет равными долями основного долга. В начале каждого года на остаток начисляют ${rate}% годовых, затем вносят платёж. Найди сумму всех платежей в миллионах рублей, округлив до тысячной.`,round(total,3),[`Ежегодно гасят ${fmt(share,5)} млн основного долга. Остатки перед начислением процентов: ${Array.from({length:years},(_,i)=>fmt(principal*(years-i)/years,5)).join(', ')} млн.`,`Сумма этих остатков равна ${fmt(principal*(years+1)/2,5)} млн. Проценты за весь срок: ${fmt(principal*(years+1)/2,5)}·${rate}/100 = ${fmt(interest,5)} млн.`,`Всего выплачено ${fmt(principal,5)} + ${fmt(interest,5)} = ${fmt(total,5)} млн рублей.`],'Сложи проценты по каждому периоду: остаток каждый год уменьшается на равную долю.','Нельзя начислять ставку каждый год на первоначальный долг.');
}
// 51–60: monthly equal-principal repayment.
for(let k=0;k<10;k++){
  const principal=120000+10000*k,months=3+(k%4),rate=2+(k%4),interest=principal*(rate/100)*(months+1)/2,total=principal+interest,share=principal/months;
  add(6,k,506958,'месячный кредит с равными долями','Ежемесячное погашение кредита',`Кредит ${principal} рублей погашают за ${months} месяцев равными долями основного долга. Перед каждым платежом банк начисляет ${rate}% в месяц на остаток. Сколько рублей выплатят всего?`,total,[`Основной долг уменьшается каждый месяц на ${fmt(share,2)} рубля. Остатки до платежей: ${Array.from({length:months},(_,i)=>fmt(principal*(months-i)/months,2)).join(', ')}.`,`Сумма остатков равна ${fmt(principal*(months+1)/2,2)} рубля. Проценты: ${fmt(principal*(months+1)/2,2)}·${rate}/100 = ${fmt(interest,2)} рубля.`,`Общая выплата: ${principal} + ${fmt(interest,2)} = ${fmt(total,2)} рубля.`],'Процент начисляется на долг перед каждым платежом.','Первый платёж тоже включает проценты за первый месяц.');
}
// 61–70: recover the initial principal from fixed annuity payments.
for(let k=0;k<10;k++){
  const years=k%2===0?2:3,multiplier=1+Math.floor(k/2),payment=(years===2?121000:133100)*multiplier,principal=years===2?210000*multiplier:331000*multiplier;
  add(7,k,548482,'аннуитетный кредит','Первоначальный долг по аннуитету',`Кредит погашают за ${years} года ${years===2?'двумя':'тремя'} равными ежегодными платежами по ${payment} рублей. Перед каждым платежом долг увеличивается на 10%. Найди первоначальную сумму кредита.`,principal,[`Перенеси каждый платёж к моменту выдачи кредита, деля его на 1,1 в степени номера года.`,`Для ${years} лет: P = ${payment}/1,1 + ${payment}/1,1²${years===3?` + ${payment}/1,1³`:''} = ${principal} рублей.`,`Проверка: после начисления процентов и равного платежа остаток обнуляется к концу ${years}-го года.`],'Будущий платёж приведи к текущему моменту делением на накопленный множитель.','Не складывай платежи без учёта процентов.');
}
// 71–80: compare reducing-balance repayments with a single balloon payment at maturity.
for(let k=0;k<10;k++){
  const principal=100000+50000*k,months=2+(k%4),rate=5+(k%6),q=1+rate/100,interestEqual=principal*(rate/100)*(months+1)/2,interestBalloon=principal*(q**months-1),saving=interestBalloon-interestEqual;
  add(8,k,512462,'сравнение схем погашения','Сравнение двух схем кредита',`Кредит ${principal} рублей выдан на ${months} месяцев под ${rate}% в месяц. Схема A: основной долг гасят равными долями каждый месяц. Схема B: весь долг возвращают одним платежом в конце срока. На сколько рублей переплата по схеме A меньше? Округли до копеек.`,round(saving,2),[`По схеме A сумма остатков до платежей равна ${principal}·(${months}+1)/2 = ${fmt(principal*(months+1)/2,2)} рублей. Проценты: ${fmt(interestEqual,2)} рубля.`,`По схеме B проценты начисляются на всю сумму: ${principal}·(1,${String(rate).padStart(2,'0')})^${months} − ${principal} = ${fmt(interestBalloon,2)} рубля.`,`Разность переплат: ${fmt(interestBalloon,2)} − ${fmt(interestEqual,2)} = ${fmt(saving,2)} рубля.`],'Сравни только переплаты, не общую сумму возврата.','При равных долях основной долг уменьшается после каждого платежа.');
}
// 81–90: sequential percentage changes in prices.
for(let k=0;k<10;k++){
  const initial=10000+2500*k,up=4+2*k,down=3+k%6,final=initial*(1+up/100)*(1-down/100);
  add(9,k,99566,'последовательное изменение цены','Цена после двух изменений',`Цена товара была ${initial} рублей. Сначала её повысили на ${up}%, затем новую цену снизили на ${down}%. Найди итоговую цену в рублях, округлив до копеек.`,round(final,2),[`После повышения цена стала ${initial}·(1 + ${up}/100) = ${fmt(initial*(1+up/100),2)} рубля.`,`Снижение считают от новой цены: умножь её на 1 − ${down}/100.`,`Итог: ${initial}·1,${String(100+up).slice(1)}·0,${String(100-down).padStart(2,'0')} = ${fmt(final,2)} рубля.`],'Последовательно применяй множители к текущей цене.','Проценты повышения и снижения считаются от разных баз.');
}
// 91–100: production break-even with fixed and variable costs.
for(let k=0;k<10;k++){
  const margin=100+25*(k%7),price=1000+50*k,cost=price-margin,fixed=margin*(4+k),target=margin*(3+k%3),units=(fixed+target)/margin;
  add(10,k,99567,'цена, себестоимость и прибыль','План производства и прибыль',`Предприятие продаёт единицу товара за ${price} рублей. Переменные затраты на неё — ${cost} рублей, постоянные затраты — ${fixed} рублей. Сколько единиц нужно продать, чтобы прибыль составила не менее ${target} рублей?`,units,[`Вклад одной проданной единицы в покрытие постоянных затрат: ${price} − ${cost} = ${margin} рублей.`,`Чтобы получить заданную прибыль, нужно покрыть постоянные затраты и заработать цель: (${fixed} + ${target})/${margin}.`,`Минимальный объём продаж — ${units} единиц.`],'Прибыль равна выручке минус постоянные и переменные затраты.','Не сравнивай выручку с целью прибыли, пока не вычтены затраты.');
}
if(bank.length!==100)throw Error(`Expected 100 tasks, generated ${bank.length}`);
const lines=bank.map(t=>JSON.stringify(t,null,2)).join(',\n');
const out=`/* 100 original EGE-style economics variants linked to relevant Reshu EGE examples. */\n(()=>{const bank=[\n${lines}\n];for(const item of bank)tasks.push({...item,exam:'ege',domain:'math',grade:11,subject:'algebra',topicName:egeTopics.find(t=>t.id==='economics').name,unit:null,challenge:true,goal:'ЕГЭ · экономические задачи',source:{name:'Решу ЕГЭ',id:item.sourceId,type:item.sourceType,url:'https://math-ege.sdamgia.ru/problem?id='+item.sourceId,note:'Авторский вариант по тематике задания «Решу ЕГЭ». Полное решение — Матклуб.',checked:'2026-11-13'}})})();\n`;
fs.writeFileSync('dist/ege-economics-expansion.js',out);
console.log(`Generated ${bank.length} economics tasks.`);
