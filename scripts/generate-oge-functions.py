import json
from pathlib import Path
bank=[]
for i in range(100):
    if i<50:
        k=[-2,-1,1,2,3][i%5]; b=(i//5)%5-2; x=[-2,-1,0,1,2][(i//25+ i//5)%5]
        y=k*x+b
        if i%2==0:
            title='Значение линейной функции'; question=f'На рисунке изображена прямая y = {k}x + ({b}). Найди значение функции при x = {x}.'; answer=y
            steps=[f'Подставляем x = {x} в формулу: y = {k} · ({x}) + ({b}).',f'Получаем y = {y}. На графике это ордината точки с абсциссой {x}.']
        else:
            title='Аргумент линейной функции'; question=f'На рисунке изображена прямая y = {k}x + ({b}). Найди x, при котором значение функции равно {y}.'; answer=x
            steps=[f'Приравниваем формулу к заданному значению: {k}x + ({b}) = {y}.',f'Получаем {k}x = {y-b}, откуда x = {x}.']
        curve={'kind':'line','parameters':[k,b]}; points=[{'x':x,'y':y,'label':'A'}]; rng=[-5,5,-10,10]
    else:
        j=i-50; a=[1,-1,2,-2,3][j%5]; h=(j//5)%5-2; c=(j//25)*2-1; dx=[-2,-1,1,2,0][(j//5)%5]; x=h+dx; y=a*dx*dx+c
        title='График квадратичной функции'; question=f'На рисунке изображена парабола y = {a}(x − ({h}))² + ({c}). Найди значение функции при x = {x}.'; answer=y
        steps=[f'Разность x − ({h}) при x = {x} равна {dx}.',f'Подставляем: y = {a} · ({dx})² + ({c}) = {y}.']
        curve={'kind':'quadratic','parameters':[a,-2*a*h,a*h*h+c]}; points=[{'x':h,'y':c,'label':'Вершина'},{'x':x,'y':y,'label':'A'}] if dx else [{'x':h,'y':c,'label':'Вершина'}]; rng=[-6,6,-16,16]
    bank.append({'id':f'oge-functions-illustrated-{i+1}','exam':'oge','domain':'math','grade':9,'subject':'algebra','topicName':'Функции и графики','topic':5,'examTopic':'functions','level':0,'challenge':False,'goal':'ОГЭ · функции и графики','title':title,'question':question,'answer':answer,'hints':['Найди на графике нужную точку и различай её абсциссу и ординату.','Подставь известное значение в формулу и выполни вычисления.'],'steps':steps,'review':{'plan':'Свяжи координаты точки графика с формулой функции.','verify':f'Полученное значение: {answer}.','trap':'Не перепутай аргумент x и значение функции y.'},'figure':{'range':rng,'curves':[curve],'points':points,'yStep':2 if i<50 else 4}})
out=Path('dist/oge-functions.js');out.write_text('/* 100 авторских задач ОГЭ с графиками. */\n(()=>{const bank='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+';for(const item of bank)tasks.push(item)})();\n')
