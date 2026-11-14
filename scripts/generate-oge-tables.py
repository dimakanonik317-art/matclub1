import json
from pathlib import Path
bank=[]
labels=['Пн','Вт','Ср','Чт','Пт']
for i in range(100):
    base=8+(i%10); vals=[base+((i*7+j*j*3+j*(i%4+1))%13) for j in range(5)]; a=i%5; b=(a+2)%5
    kind=['table','bars','line'][i%3]; mode=(i//3)%4
    if mode==0:
        question=f'На рисунке показано число посетителей библиотеки по дням недели. Сколько посетителей было в день «{labels[a]}»?'; answer=vals[a]; steps=[f'Находим столбец или точку «{labels[a]}».',f'Считываем значение: {answer} посетителей.']
    elif mode==1:
        question=f'На рисунке показано число посетителей библиотеки по дням недели. На сколько различается число посетителей в дни «{labels[a]}» и «{labels[b]}»?'; answer=abs(vals[a]-vals[b]); steps=[f'Считываем значения: {labels[a]} — {vals[a]}, {labels[b]} — {vals[b]}.',f'Разность большего и меньшего значения равна {answer}.']
    elif mode==2:
        question='На рисунке показано число посетителей библиотеки по дням недели. Сколько посетителей было за все пять дней?'; answer=sum(vals); steps=[f'Считываем значения: {", ".join(map(str,vals))}.',f'Складываем: {" + ".join(map(str,vals))} = {answer}.']
    else:
        question='На рисунке показано число посетителей библиотеки по дням недели. Найди размах этих данных.'; answer=max(vals)-min(vals); steps=[f'Наибольшее значение равно {max(vals)}, наименьшее — {min(vals)}.',f'Размах: {max(vals)} − {min(vals)} = {answer}.']
    bank.append({'id':f'oge-tables-{i+1}','exam':'oge','domain':'math','grade':9,'subject':'algebra','topicName':'Таблицы, диаграммы и графики','topic':8,'examTopic':'tables','level':0,'challenge':False,'goal':'ОГЭ · таблицы и диаграммы','title':['Чтение таблицы','Столбчатая диаграмма','График данных'][i%3],'question':question,'answer':answer,'hints':['Найди нужные подписи и считай значения с рисунка.','Для разности вычти меньшее из большего; для размаха сравни максимум и минимум.'],'steps':steps,'review':{'plan':'Считай данные по подписям, затем выполни действие из условия.','verify':f'По данным рисунка получается {answer}.','trap':'Следи за подписями дней и единицами шкалы.'},'figure':{'dataChart':{'kind':kind,'labels':labels,'values':vals,'caption':'Число посетителей библиотеки'}}})
assert len(bank)==100
Path('dist/oge-tables.js').write_text('/* 100 авторских задач ОГЭ на чтение данных. */\n(()=>{const bank='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+';for(const item of bank)tasks.push(item)})();\n',encoding='utf-8')
