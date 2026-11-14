"""Original probability exercises for OGE practice."""
import json
from fractions import Fraction
from math import comb
from pathlib import Path
bank=[]
def fmt(x):
 x=Fraction(x);return str(x.numerator) if x.denominator==1 else f'{x.numerator}/{x.denominator}'
def add(title,question,answer,steps,hints,trap):
 n=len(bank)+1
 bank.append({'id':f'oge-probability-{n}','exam':'oge','domain':'math','grade':9,'subject':'algebra','topicName':'Теория вероятностей','topic':10,'examTopic':'probability','level':0,'challenge':False,'goal':'ОГЭ · теория вероятностей','title':title,'question':question,'answer':float(answer),'hints':hints,'steps':steps,'review':{'plan':'Определи все равновозможные исходы и посчитай благоприятные.','verify':f'Вероятность равна {fmt(answer)} и находится от 0 до 1.','trap':trap}})
for i in range(100):
 mode=i%8;k=i//8
 if mode==0:
  red=3+k;blue=5+(k%7);ans=Fraction(red,red+blue);title='Выбор шара';question=f'В мешке {red} красных и {blue} синих одинаковых на ощупь шаров. Наугад достают один шар. Найди вероятность того, что он красный.';steps=[f'Всего шаров {red}+{blue} = {red+blue}.',f'Красных шаров {red}; вероятность {red}/{red+blue} = {fmt(ans)}.'];trap='Дели число подходящих шаров на общее число шаров.'
 elif mode==1:
  marked=2+k%9;total=12+k;ans=Fraction(total-marked,total);title='Дополнительное событие';question=f'Среди {total} билетов {marked} выигрышных. Наугад выбирают один билет. Найди вероятность того, что билет окажется невыигрышным.';steps=[f'Невыигрышных билетов {total}−{marked} = {total-marked}.',f'Вероятность равна ({total-marked})/{total} = {fmt(ans)}.'];trap='Событие «невыигрышный» противоположно событию «выигрышный».'
 elif mode==2:
  n=2+k%5; good=k%n+1;ans=Fraction(good,n);title='Равновероятный выбор';question=f'На карточках записаны числа от 1 до {n}. Одну карточку выбирают наугад. Найди вероятность того, что число на ней не больше {good}.';steps=[f'Всего карточек {n}.',f'Подходят числа от 1 до {good}, их {good}.',f'Искомая вероятность: {good}/{n} = {fmt(ans)}.'];trap='Условие «не больше» включает граничное число.'
 elif mode==3:
  threshold=2+k%5;good=7-threshold;ans=Fraction(good,6);title='Бросок кубика';question=f'Бросают правильный шестигранный кубик. Найди вероятность того, что выпадет число не меньше {threshold}.';steps=[f'Всего равновозможных результатов 6.',f'Подходят числа от {threshold} до 6: их {good}.',f'Вероятность {good}/6 = {fmt(ans)}.'];trap='Условие «не меньше» включает указанное число.'
 elif mode==4:
  n=2+k%4; heads=k%(n+1);good=comb(n,heads);total=2**n;ans=Fraction(good,total);title='Несколько бросков монеты';question=f'Правильную монету бросают {n} раза. Найди вероятность того, что орёл выпадет ровно {heads} раз.';steps=[f'Всего последовательностей результатов: 2^{n} = {total}.',f'Выбрать места для {heads} орлов можно {good} способами.',f'Вероятность равна {good}/{total} = {fmt(ans)}.'];trap='Учитывай все возможные порядки выпадения орлов и решек.'
 elif mode==5:
  red=2+k%6;blue=3+k%7;total=red+blue;ans=Fraction(red*(red-1),total*(total-1));title='Два шара без возвращения';question=f'В коробке {red} красных и {blue} синих шаров. Два шара достают подряд без возвращения. Найди вероятность того, что оба красные.';steps=[f'Вероятность первого красного шара: {red}/{total}.',f'После этого осталось {red-1} красных и всего {total-1} шаров.',f'Перемножаем: ({red}/{total})·({red-1}/{total-1}) = {fmt(ans)}.'];trap='После первого извлечения состав и общее число шаров меняются.'
 elif mode==6:
  n=2+k%5;total=2**n;ans=Fraction(total-1,total);title='Хотя бы один орёл';question=f'Правильную монету бросают {n} раза. Найди вероятность того, что орёл выпадет хотя бы один раз.';steps=[f'Противоположное событие — все {n} раз выпала решка.',f'Его вероятность 1/{total}.',f'Искомая вероятность: 1 − 1/{total} = {fmt(ans)}.'];trap='«Хотя бы один» включает случаи с несколькими орлами.'
 else:
  red=2+k%7;blue=3+k%6;total=red+blue;ans=Fraction(2*red*blue,total*(total-1));title='Шары разных цветов';question=f'В мешке {red} красных и {blue} синих шаров. Два шара достают подряд без возвращения. Найди вероятность того, что они разных цветов.';steps=[f'Порядок красный–синий имеет вероятность ({red}/{total})·({blue}/{total-1}).',f'Порядок синий–красный имеет вероятность ({blue}/{total})·({red}/{total-1}).',f'Складываем вероятности несовместных порядков: {fmt(ans)}.'];trap='Учитывай оба возможных порядка цветов.'
 add(title,question,ans,steps,['Определи, какие исходы подходят условию.','Учитывай, возвращается ли выбранный предмет перед следующим выбором.'],trap)
assert len(bank)==100 and len({x['id'] for x in bank})==100
Path('dist/oge-probability.js').write_text('/* 100 авторских задач ОГЭ по вероятности. */\n(()=>{const bank='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+';for(const item of bank)tasks.push(item)})();\n',encoding='utf-8')
