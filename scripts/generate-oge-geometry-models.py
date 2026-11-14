"""Build 100 original grade-nine OGE coordinate-geometry exercises."""
import json
import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'dist' / 'oge-geometry-models.js'
bank=[]


def plot(points, outline=None, vectors=None, caption='Координатная плоскость. Схема.'):
    all_xy=[(p['x'],p['y']) for p in points]
    if outline:
        all_xy.extend((x,y) for x,y in outline)
    if vectors:
        for v in vectors:
            all_xy.extend([tuple(v['from']),tuple(v['to'])])
    bound=max(6,math.ceil(max((abs(v) for pair in all_xy for v in pair),default=5))+1)
    step=1 if bound<=10 else 2
    return {'range':[-bound,bound,-bound,bound],'xStep':step,'yStep':step,'curves':[],
            'points':points,'outline':outline or [],'vectors':vectors or [],'caption':caption}


def pt(name,x,y):
    return {'x':x,'y':y,'label':name}


def coord(x,y):
    return f'({x}; {y})'


def add(title,question,answer,hints,steps,plan,verify,trap,figure):
    n=len(bank)+1
    bank.append({'id':f'oge-geometry-models-{n}','exam':'oge','domain':'math','grade':9,
                 'subject':'geometry','topicName':'Координаты и геометрические модели','topic':15,
                 'examTopic':'geometry-models','level':0,'challenge':False,
                 'goal':'ОГЭ · координаты и геометрические модели','title':title,
                 'question':question,'answer':float(answer),'hints':hints,'steps':steps,
                 'review':{'plan':plan,'verify':verify,'trap':trap},'figure':figure})


# 1–10. Horizontal distance on a coordinate plane.
for i in range(10):
    x1=-6+i
    y=-3+i%5
    delta=2+i%6
    x2=x1+delta
    add('Расстояние между точками на горизонтали',
        f'Точки A{coord(x1,y)} и B{coord(x2,y)} лежат на одной горизонтали. Найди длину AB.',delta,
        ['У точек одинаковая ордината.','На горизонтальном отрезке длина равна модулю разности абсцисс.'],
        [f'AB = |xB − xA|.',f'AB = |{x2} − ({x1})| = {delta}.'],
        'Вычесть абсциссы и взять модуль разности.',
        f'Отрезок занимает от x = {x1} до x = {x2}, его длина {delta}.',
        'Координаты могут быть отрицательными, но длина всегда неотрицательна.',
        plot([pt('A',x1,y),pt('B',x2,y)],[[x1,y],[x2,y]],caption='Обе точки имеют одинаковую ординату.'))

# 11–20. Euclidean distance using integer Pythagorean triples.
legs=[(3,4),(4,3),(6,8),(8,6),(5,12),(12,5),(9,12),(12,9),(8,15),(15,8)]
for i,(dx,dy) in enumerate(legs):
    x1,y1=-5,-5
    x2,y2=x1+dx,y1+dy
    hyp=math.isqrt(dx*dx+dy*dy)
    add('Расстояние между точками по теореме Пифагора',
        f'Найди расстояние между точками A{coord(x1,y1)} и B{coord(x2,y2)}.',hyp,
        ['Разности абсцисс и ординат — катеты прямоугольного треугольника.','Примени формулу расстояния между точками.'],
        [f'Δx = {x2} − ({x1}) = {dx}, Δy = {y2} − ({y1}) = {dy}.',
         f'AB = √(Δx² + Δy²) = √({dx}² + {dy}²) = √{dx*dx+dy*dy} = {hyp}.'],
        'Возвести в квадрат обе разности координат, сложить и извлечь корень.',
        f'{dx}² + {dy}² = {hyp}².',
        'Нельзя складывать длины катетов напрямую: расстояние — гипотенуза.',
        plot([pt('A',x1,y1),pt('B',x2,y2)],[[x1,y1],[x2,y2]],caption='Координаты концов отрезка показаны на сетке.'))

# 21–30. Find an endpoint from a midpoint and the other endpoint.
for i in range(10):
    if i%2==0:
        xa=-6+i//2
        xb=2+i//2
        xm=(xa+xb)//2
        ya,yb=-2,4
        ask='абсциссу xB'
        answer=xb
        known=f'A{coord(xa,ya)} и середина M с абсциссой {xm}'
        steps=[f'Для середины отрезка xM = (xA+xB)/2.',
               f'{xm} = ({xa}+xB)/2, значит xB = 2·{xm} − ({xa}) = {xb}.']
        caption=f'A имеет абсциссу {xa}; M имеет абсциссу {xm}. Искомая точка B не отмечена.'
        points=[pt('A',xa,ya),pt('M',xm,(ya+yb)//2)]
        outline=[[xa,ya],[xm,(ya+yb)//2]]
        verify=f'({xa}+{xb})/2 = {xm}.'
    else:
        ya=-6+i//2
        yb=2+i//2
        ym=(ya+yb)//2
        xa,xb=-3,5
        ask='ординату yB'
        answer=yb
        known=f'A{coord(xa,ya)} и середина M с ординатой {ym}'
        steps=[f'Для середины отрезка yM = (yA+yB)/2.',
               f'{ym} = ({ya}+yB)/2, значит yB = 2·{ym} − ({ya}) = {yb}.']
        caption=f'A имеет ординату {ya}; M имеет ординату {ym}. Искомая точка B не отмечена.'
        points=[pt('A',xa,ya),pt('M',(xa+xb)//2,ym)]
        outline=[[xa,ya],[(xa+xb)//2,ym]]
        verify=f'({ya}+{yb})/2 = {ym}.'
    add('Координаты середины отрезка',
        f'Даны {known}. Найди {ask} точки B.',answer,
        ['Координата середины равна полусумме координат концов.','Умножь координату середины на 2 и вычти известную координату точки A.'],
        steps,'Выразить неизвестную координату конца из формулы середины отрезка.',verify,
        'Формула середины применяется отдельно к абсциссам и ординатам.',
        plot(points,outline,caption=caption))

# 31–40. A component of a vector from its endpoints.
for i in range(10):
    xa=-5+i%5
    ya=-3+i//5*3
    xb=3+i%4
    yb=ya+1+i%3
    dx=xb-xa
    add('Координата вектора по двум точкам',
        f'Точки A{coord(xa,ya)} и B{coord(xb,yb)} задают вектор AB. Найди его абсциссу.',dx,
        ['Координаты вектора AB получают вычитанием координат A из координат B.','Абсцисса вектора равна xB − xA.'],
        [f'AB = (xB−xA; yB−yA).',f'Абсцисса AB: {xb} − ({xa}) = {dx}.'],
        'Вычесть абсциссу начала вектора из абсциссы его конца.',
        f'Перемещение по горизонтали от A к B составляет {dx}.',
        'Порядок важен: AB и BA имеют противоположные координаты.',
        plot([pt('A',xa,ya),pt('B',xb,yb)],vectors=[{'from':[xa,ya],'to':[xb,yb],'label':'AB'}],caption='Стрелка направлена из A в B.'))

# 41–50. Addition and subtraction of coordinate vectors.
for i in range(10):
    u=(i%5-2, 2+i%3)
    v=(3-i%4, i%4-1)
    if i%2==0:
        result=(u[0]+v[0],u[1]+v[1])
        component=0 if i%4==0 else 1
        operation='u + v'
        expr=f'{u[component]} + ({v[component]})'
        answer=result[component]
        rule='При сложении векторов складывай отдельно их абсциссы и отдельно ординаты.'
    else:
        result=(u[0]-v[0],u[1]-v[1])
        component=1 if i%4==1 else 0
        operation='u − v'
        expr=f'{u[component]} − ({v[component]})'
        answer=result[component]
        rule='При вычитании векторов вычитай соответствующие координаты.'
    points=[pt('O',0,0),pt('U',u[0],u[1]),pt('V',v[0],v[1])]
    vectors=[{'from':[0,0],'to':[u[0],u[1]],'label':'u'},
             {'from':[0,0],'to':[v[0],v[1]],'label':'v'}]
    add('Сложение и вычитание векторов',
        f'Даны векторы u = ({u[0]}; {u[1]}) и v = ({v[0]}; {v[1]}). Найди {"абсциссу" if component==0 else "ординату"} вектора {operation}.',answer,
        ['Действия выполняются покоординатно.','Выбери компоненту, которую спрашивают, и выполни указанное действие.'],
        [rule,f'Искомая координата: {expr} = {answer}.'],
        'Выполнить действие отдельно над нужными компонентами векторов.',
        f'Координата результата по выбранной оси равна {answer}.',
        'Не смешивай абсциссы с ординатами и соблюдай знак вычитания.',
        plot(points,vectors=vectors,caption='Векторы u и v отложены от начала координат.'))

# 51–60. Find a vector component from perpendicular or parallel conditions.
for i in range(10):
    if i<5:
        k=i+1
        u=(None,k)
        v=(1,2)
        x=-2*k
        title='Перпендикулярные векторы'
        question=f'Векторы u = (x; {k}) и v = (1; 2) перпендикулярны. Найди x.'
        steps=[f'Перпендикулярные векторы имеют нулевое скалярное произведение: u·v = 0.',
               f'x·1 + {k}·2 = 0, поэтому x = {x}.']
        plan='Приравнять скалярное произведение векторов к нулю.'
        verify=f'{x}·1 + {k}·2 = 0.'
        trap='Для перпендикулярности скалярное произведение равно нулю.'
        hints=['Для перпендикулярных векторов u₁v₁ + u₂v₂ = 0.',
               'Подставь известные координаты и реши линейное уравнение относительно x.']
        caption=f'Известен вектор v = (1; 2); u перпендикулярен v, его абсцисса неизвестна.'
    else:
        k=i-4
        u=(None,2*k)
        v=(3,2)
        x=3*k
        title='Параллельные векторы'
        question=f'Векторы u = (x; {2*k}) и v = (3; 2) параллельны и сонаправлены. Найди x.'
        steps=[f'У параллельных векторов соответствующие координаты пропорциональны.',
               f'x/3 = {2*k}/2 = {k}, поэтому x = 3·{k} = {x}.']
        plan='Найти коэффициент пропорциональности по ординатам и применить его к абсциссам.'
        verify=f'({x}; {2*k}) = {k}·(3; 2).'
        trap='Один и тот же коэффициент должен связывать обе координаты.'
        hints=['У параллельных векторов отношение соответствующих координат одинаково.',
               'Сначала найди коэффициент по известным ординатам.']
        caption=f'Дан вектор v = (3; 2); вектор u ему параллелен, его абсцисса неизвестна.'
    points=[pt('O',0,0),pt('V',v[0],v[1])]
    add(title,question,x,
        hints,
        steps,plan,verify,trap,
        plot(points,vectors=[{'from':[0,0],'to':[v[0],v[1]],'label':'v'}],caption=caption))

# 61–70. Reflections and translations of points.
for i in range(10):
    x=-5+i%6
    y=4-i%5
    mode=i%5
    if mode==0:
        transform='отразили относительно оси x'
        answer=-y
        ask='ординату образа A′'
        steps=[f'При отражении относительно оси x абсцисса сохраняется, а ордината меняет знак.',
               f'y′ = −({y}) = {answer}.']
        verify=f'Точки A и A′ имеют одну абсциссу {x} и противоположные ординаты.'
    elif mode==1:
        transform='отразили относительно оси y'
        answer=-x
        ask='абсциссу образа A′'
        steps=[f'При отражении относительно оси y ордината сохраняется, а абсцисса меняет знак.',
               f'x′ = −({x}) = {answer}.']
        verify=f'Абсциссы {x} и {answer} противоположны.'
    elif mode==2:
        transform='отразили относительно начала координат'
        answer=-x
        ask='абсциссу образа A′'
        steps=[f'При отражении относительно начала координат меняют знак обе координаты.',
               f'x′ = −({x}) = {answer}.']
        verify=f'Образ имеет координаты ({-x}; {-y}).'
    elif mode==3:
        tx,ty=2,-3
        transform=f'перенесли на вектор ({tx}; {ty})'
        answer=x+tx
        ask='абсциссу образа A′'
        steps=[f'При переносе на вектор ({tx}; {ty}) к абсциссе прибавляется {tx}.',
               f'x′ = {x} + ({tx}) = {answer}.']
        verify=f'Абсцисса сместилась на {tx}.'
    else:
        tx,ty=-1,2
        transform=f'перенесли на вектор ({tx}; {ty})'
        answer=y+ty
        ask='ординату образа A′'
        steps=[f'При переносе на вектор ({tx}; {ty}) к ординате прибавляется {ty}.',
               f'y′ = {y} + {ty} = {answer}.']
        verify=f'Ордината сместилась на {ty}.'
    add('Преобразования точек на координатной плоскости',
        f'Точка A{coord(x,y)}: её {transform}. Найди {ask}.',answer,
        ['Вспомни, какая координата сохраняется, меняет знак или изменяется при переносе.',
         'Применяй преобразование отдельно к абсциссе и ординате.'],
        steps,'Применить правило отражения или прибавить координаты вектора переноса.',verify,
        'При отражении относительно оси меняется знак только одной координаты; относительно начала координат — обеих.',
        plot([pt('A',x,y)],caption=f'Исходная точка A{coord(x,y)}; выполняется указанное преобразование.'))

# 71–80. Area of a rectangle from its vertices.
for i in range(10):
    x1=-5+i%4
    y1=-4+i%3
    width=3+i%5
    height=2+(2*i)%5
    x2,y2=x1+width,y1+height
    area=width*height
    coords={'A':(x1,y1),'B':(x2,y1),'C':(x2,y2),'D':(x1,y2)}
    outline=[[x1,y1],[x2,y1],[x2,y2],[x1,y2],[x1,y1]]
    add('Площадь прямоугольника по координатам вершин',
        f'Вершины прямоугольника ABCD: A{coord(x1,y1)}, B{coord(x2,y1)}, C{coord(x2,y2)}, D{coord(x1,y2)}. Найди площадь.',area,
        ['Стороны, параллельные оси x, имеют длину по разности абсцисс.', 'Стороны, параллельные оси y, имеют длину по разности ординат.'],
        [f'AB = {x2} − ({x1}) = {width}.',f'BC = {y2} − ({y1}) = {height}.',f'S = AB·BC = {width}·{height} = {area}.'],
        'Найти ширину и высоту по координатам соседних вершин и перемножить их.',
        f'{area}/{width} = {height}, что совпадает с разностью ординат.',
        'Для длины отрезка бери модуль разности координат, независимо от их знаков.',
        plot([pt(k,*v) for k,v in coords.items()],outline,caption='Прямоугольник с вершинами на координатной сетке.'))

# 81–90. Triangle area from its coordinates on the grid.
for i in range(10):
    x1=-6+i%5
    y=-4+i%4
    base=4+2*(i%3)
    height=2+i%5
    x2=x1+base
    xp=x1+1+(i%4)
    yp=y+height
    area=base*height//2
    coords={'A':(x1,y),'B':(x2,y),'C':(xp,yp)}
    outline=[[x1,y],[x2,y],[xp,yp],[x1,y]]
    add('Площадь треугольника по координатам вершин',
        f'Треугольник имеет вершины A{coord(x1,y)}, B{coord(x2,y)}, C{coord(xp,yp)}. Найди его площадь.',area,
        ['AB горизонтальна, поэтому её длина находится по разности абсцисс.', 'Высота к AB равна разности ординат точки C и прямой AB.'],
        [f'AB = {x2} − ({x1}) = {base}.',f'h = ({y+height}) − ({y}) = {height}.',
         f'S = AB·h/2 = {base}·{height}/2 = {area}.'],
        'Взять горизонтальную сторону за основание и найти перпендикулярную высоту.',
        f'2·{area} = {base}·{height}.',
        'Высота — вертикальное расстояние до прямой основания, а не наклонная сторона.',
        plot([pt(k,*v) for k,v in coords.items()],outline,caption='К основанию AB проведена вертикальная высота; схема не в масштабе.'))

# 91–100. Area of a parallelogram from its coordinate model.
for i in range(10):
    x,y=-4+i%3,-3+i%4
    base=3+i%5
    shift=-2+i%5
    height=2+(3*i)%5
    a=(x,y); b=(x+base,y); d=(x+shift,y+height); c=(x+base+shift,y+height)
    area=base*height
    coords={'A':a,'B':b,'C':c,'D':d}
    outline=[a,b,c,d,a]
    add('Площадь параллелограмма по координатам',
        f'Вершины параллелограмма ABCD: A{coord(*a)}, B{coord(*b)}, C{coord(*c)}, D{coord(*d)}. Найди площадь.',area,
        ['Возьми AB за основание: оно параллельно оси x.', 'Высота равна вертикальному расстоянию между прямыми AB и CD.'],
        [f'AB = {b[0]} − ({a[0]}) = {base}.',f'h = {d[1]} − ({a[1]}) = {height}.',
         f'S = AB·h = {base}·{height} = {area}.'],
        'Найти длину горизонтального основания и вертикальную высоту между параллельными сторонами.',
        f'Сдвиг стороны по горизонтали не меняет высоту; площадь равна {base}·{height} = {area}.',
        'Для площади нельзя умножать основание на наклонную боковую сторону.',
        plot([pt(k,*v) for k,v in coords.items()],outline,caption='Сдвиг AD наклонный; высота параллелограмма — вертикальная.'))


assert len(bank)==100
assert len({t['id'] for t in bank})==100
assert len({t['question'] for t in bank})==100
assert all(t['examTopic']=='geometry-models' and t['grade']==9 and t['figure'].get('range') for t in bank)
OUT.write_text('/* 100 авторских задач ОГЭ по теме «Координаты и геометрические модели». */\n'+
               '(()=>{const bank='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+
               ';for(const item of bank)tasks.push(item)})();\n',encoding='utf-8')
