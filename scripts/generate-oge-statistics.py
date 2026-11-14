"""Generate original OGE-style statistics practice."""
import json
from pathlib import Path
from fractions import Fraction
bank=[]
def fmt(x):
 x=Fraction(x);return str(x.numerator) if x.denominator==1 else f'{x.numerator}/{x.denominator}'
def add(title,question,answer,steps,hints,trap):
 n=len(bank)+1
 bank.append({'id':f'oge-statistics-{n}','exam':'oge','domain':'math','grade':9,'subject':'algebra','topicName':'Статистика','topic':9,'examTopic':'statistics','level':0,'challenge':False,'goal':'ОГЭ · статистика','title':title,'question':question,'answer':float(answer),'hints':hints,'steps':steps,'review':{'plan':'Выпиши данные и выбери подходящее статистическое понятие.','verify':f'По приведённым данным получается {fmt(answer)}.','trap':trap}})
for i in range(100):
 mode=i%8; k=i//8; a=3+k; b=5+(k%7)
 if mode==0:
  vals=[a,a+2,a+4,a+6,a+8]; ans=Fraction(sum(vals),len(vals));title='Среднее арифметическое';question=f'За пять дней прочитали соответственно {", ".join(map(str,vals))} страниц. Найди среднее число страниц за день.';steps=[f'Сумма страниц: {" + ".join(map(str,vals))} = {sum(vals)}.',f'Делим на число дней: {sum(vals)}/{len(vals)} = {fmt(ans)}.'];trap='Дели сумму на количество наблюдений, а не на размах.'
 elif mode==1:
  vals=[a+6,a,a+4,a+2,a+8]; ordered=sorted(vals);ans=ordered[2];title='Медиана пяти чисел';question=f'Найди медиану ряда: {", ".join(map(str,vals))}.';steps=[f'Упорядочиваем ряд: {", ".join(map(str,ordered))}.',f'В ряду из пяти чисел центральное — третье: {ans}.'];trap='Перед поиском медианы обязательно упорядочь значения.'
 elif mode==2:
  vals=[a+4,a,a+2,a+6];ordered=sorted(vals);ans=Fraction(ordered[1]+ordered[2],2);title='Медиана чётного числа значений';question=f'Найди медиану ряда: {", ".join(map(str,vals))}.';steps=[f'Упорядочиваем: {", ".join(map(str,ordered))}.',f'Медиана — среднее двух центральных: ({ordered[1]} + {ordered[2]})/2 = {fmt(ans)}.'];trap='Для чётного числа наблюдений медиана — среднее двух центральных значений.'
 elif mode==3:
  vals=[a,a+1,a+2,a+1,a+3,a+1,a+2];ans=a+1;title='Мода набора данных';question=f'Найди моду ряда: {", ".join(map(str,vals))}.';steps=[f'Число {ans} встречается 3 раза; другие значения встречаются реже.',f'Следовательно, единственная мода равна {ans}.'];trap='Мода — наиболее частое значение, а не число его повторений.'
 elif mode==4:
  vals=[a+8,a+1,a+4,a+11,a+3];ans=max(vals)-min(vals);title='Размах ряда';question=f'Измерили температуру: {", ".join(map(str,vals))} °C. Найди размах значений в градусах.';steps=[f'Наибольшее значение {max(vals)}, наименьшее {min(vals)}.',f'Размах: {max(vals)} − {min(vals)} = {ans}.'];trap='Размах — разность максимума и минимума.'
 elif mode==5:
  vals=[a,a+2,a+4,a+6]; missing=a+8; mean=Fraction(sum(vals)+missing,5);ans=missing;title='Неизвестное значение по среднему';question=f'Среднее пяти чисел равно {fmt(mean)}. Четыре из них: {", ".join(map(str,vals))}. Найди пятое число.';steps=[f'Сумма пяти чисел равна 5·{fmt(mean)} = {sum(vals)+missing}.',f'Сумма известных чисел {sum(vals)}, поэтому неизвестное равно {sum(vals)+missing} − {sum(vals)} = {ans}.'];trap='Среднее нужно сначала умножить на общее число наблюдений.'
 elif mode==6:
  c1=2+k%3;c2=3+k%4;v1=a;v2=a+4;ans=Fraction(v1*c1+v2*c2,c1+c2);title='Среднее по частотам';question=f'Получено значение {v1} — {c1} раз, значение {v2} — {c2} раз. Найди среднее всех наблюдений.';steps=[f'Сумма всех значений: {v1}·{c1} + {v2}·{c2} = {v1*c1+v2*c2}.',f'Всего наблюдений {c1}+{c2} = {c1+c2}; среднее равно {v1*c1+v2*c2}/{c1+c2} = {fmt(ans)}.'];trap='Учитывай, сколько раз встретилось каждое значение.'
 else:
  vals=[a,a+1,a+3,a+5,a+8];cut=a+3;ans=sum(x>cut for x in vals);title='Подсчёт по условию';question=f'Результаты измерений: {", ".join(map(str,vals))}. Сколько результатов строго больше {cut}?';steps=[f'Сравниваем каждое значение с {cut}.',f'Подходят {", ".join(str(x) for x in vals if x>cut)}; их количество равно {ans}.'];trap='Строгое неравенство не включает значение, равное границе.'
 add(title,question,ans,steps,['Внимательно выпиши все данные и количество наблюдений.','Применяй определение указанного в задаче статистического показателя.'],trap)
assert len(bank)==100 and len({x['id'] for x in bank})==100
Path('dist/oge-statistics.js').write_text('/* 100 авторских задач по статистике ОГЭ. */\n(()=>{const bank='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+';for(const item of bank)tasks.push(item)})();\n',encoding='utf-8')
