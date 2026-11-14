"""Build 100 original grade-nine OGE exercises on area and measurement."""
import json
from math import ceil
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'dist' / 'oge-areas.js'
bank = []


def point(name, x, y, dx=0, dy=-12):
    return {'id':name,'x':x,'y':y,'label':name,'labelDx':dx,'labelDy':dy}


def segment(a,b,label=None,dx=0,dy=0,style=''):
    item={'from':a,'to':b}
    if label is not None:
        item.update({'label':str(label),'labelDx':dx,'labelDy':dy})
    if style:
        item['style']=style
    return item


def diagram(points,segments,caption):
    return {'geometry':{'points':points,'segments':segments,'caption':caption}}


def rectangle(a_label=None,b_label=None,caption='Прямоугольник ABCD. Схема не в масштабе.'):
    points=[point('A',90,250,-12,8),point('B',510,250,0,20),point('C',510,70,12,-4),point('D',90,70,-12,-4)]
    segments=[segment('A','B',a_label,0,18),segment('B','C',b_label,18,0),segment('C','D'),segment('D','A')]
    return diagram(points,segments,caption)


def square(side_label=None,caption='Квадрат ABCD. Схема не в масштабе.'):
    points=[point('A',180,255,-12,8),point('B',420,255,0,18),point('C',420,15,12,-4),point('D',180,15,-12,-4)]
    return diagram(points,[segment('A','B',side_label,0,18),segment('B','C'),segment('C','D'),segment('D','A')],caption)


def triangle(base_label=None,height_label=None,caption='Треугольник ABC. Схема не в масштабе.'):
    points=[point('A',85,255,-12,10),point('B',555,255,0,18),point('C',285,55,0,-12),point('H',285,255,8,18)]
    segments=[segment('A','B',base_label,0,18),segment('B','C'),segment('C','A'),segment('C','H',height_label,18,0,'height')]
    return diagram(points,segments,caption)


def parallelogram(base_label=None,height_label=None,caption='Параллелограмм ABCD. Схема не в масштабе.'):
    points=[point('A',90,250,-12,8),point('B',510,250,0,18),point('C',570,70,12,-4),point('D',150,70,-12,-4),point('H',150,250,-2,18)]
    segments=[segment('A','B',base_label,0,18),segment('B','C'),segment('C','D'),segment('D','A'),segment('D','H',height_label,-18,0,'height')]
    return diagram(points,segments,caption)


def trapezoid(a_label=None,b_label=None,height_label=None,caption='Трапеция ABCD. Схема не в масштабе.'):
    points=[point('A',70,255,-12,10),point('B',570,255,0,18),point('C',455,80,12,-4),point('D',185,80,-12,-4),point('H',185,255,-2,18)]
    segments=[segment('A','B',a_label,0,18),segment('B','C'),segment('C','D',b_label,0,-14),segment('D','A'),segment('D','H',height_label,-18,0,'height')]
    return diagram(points,segments,caption)


def diamond(d1,d2,caption='Диагонали ромба перпендикулярны. Схема не в масштабе.'):
    points=[point('A',320,35,0,-12),point('B',530,160,12,0),point('C',320,285,0,18),point('D',110,160,-12,0),point('O',320,160,10,-4)]
    segments=[segment('A','B'),segment('B','C'),segment('C','D'),segment('D','A'),
              segment('A','C',d1,16,0),segment('B','D',d2,0,-12)]
    return diagram(points,segments,caption)


def add(title,question,answer,hints,steps,plan,verify,trap,figure):
    n=len(bank)+1
    bank.append({'id':f'oge-areas-{n}','exam':'oge','domain':'math','grade':9,
                 'subject':'geometry','topicName':'Площади и измерения','topic':14,
                 'examTopic':'areas','level':0,'challenge':False,'goal':'ОГЭ · площади и измерения',
                 'title':title,'question':question,'answer':float(answer),'hints':hints,'steps':steps,
                 'review':{'plan':plan,'verify':verify,'trap':trap},'figure':figure})


# 1–10. Rectangle area.
for i in range(10):
    a,b=5+i,8+2*i
    area=a*b
    add('Площадь прямоугольника',
        f'Стороны прямоугольника равны {a} см и {b} см. Найди его площадь.',area,
        ['Площадь прямоугольника — произведение длины на ширину.','Площадь выражается в квадратных сантиметрах.'],
        [f'S = a·b.',f'S = {a}·{b} = {area} см².'],
        'Перемножить длины соседних сторон.',f'{area}/{a} = {b} см.',
        'Не складывай стороны: сумма относится к периметру, а не к площади.',
        rectangle(a,b,caption=f'Стороны прямоугольника: {a} см и {b} см.'))

# 11–20. Triangle area from base and altitude.
for i in range(10):
    base,height=8+2*i,3+i
    area=base*height//2
    add('Площадь треугольника',
        f'Основание треугольника равно {base} см, высота к нему — {height} см. Найди площадь.',area,
        ['Площадь треугольника равна половине произведения основания на высоту.','Высота должна быть проведена к указанному основанию.'],
        [f'S = a·h/2.',f'S = {base}·{height}/2 = {area} см².'],
        'Умножить основание на соответствующую высоту и разделить на 2.',
        f'2·{area} = {base}·{height} = {base*height}.',
        'Не забудь разделить произведение на 2.',
        triangle(base,height,caption=f'Основание AB = {base} см, высота CH = {height} см.'))

# 21–30. Recover a parallelogram height from its area and base.
for i in range(10):
    base=6+2*i
    height=4+i
    area=base*height
    add('Высота параллелограмма по площади',
        f'Площадь параллелограмма равна {area} см², основание — {base} см. Найди высоту, проведённую к этому основанию.',height,
        ['Площадь параллелограмма S = a·h.','Чтобы найти высоту, раздели площадь на длину основания.'],
        [f'h = S/a.',f'h = {area}/{base} = {height} см.'],
        'Разделить площадь на основание.',f'{base}·{height} = {area} см².',
        'Используй именно высоту, проведённую к данному основанию.',
        parallelogram(base,caption=f'Площадь S = {area} см², основание AB = {base} см; пунктир — искомая высота.'))

# 31–40. Recover a trapezoid height from its area and bases.
for i in range(10):
    a,b=6+2*i,10+2*i
    height=3+i
    area=(a+b)*height//2
    add('Высота трапеции по площади',
        f'Основания трапеции равны {a} см и {b} см, её площадь — {area} см². Найди высоту.',height,
        ['Площадь трапеции равна произведению полусуммы оснований на высоту.','Вырази высоту из формулы площади.'],
        [f'S = (a+b)·h/2, поэтому h = 2S/(a+b).',
         f'h = 2·{area}/({a}+{b}) = {2*area}/{a+b} = {height} см.'],
        'Удвоить площадь и разделить на сумму оснований.',
        f'({a}+{b})·{height}/2 = {area} см².',
        'В знаменателе стоит сумма двух оснований, не их разность.',
        trapezoid(a,b,caption=f'Основания трапеции: {a} см и {b} см; высота показана пунктиром.'))

# 41–50. Rhombus area from its diagonals.
for i in range(10):
    d1,d2=6+2*i,8+2*i
    area=d1*d2//2
    add('Площадь ромба по диагоналям',
        f'Диагонали ромба равны {d1} см и {d2} см. Найди его площадь.',area,
        ['Площадь ромба равна половине произведения диагоналей.','Подставь обе диагонали в формулу.'],
        [f'S = d₁·d₂/2.',f'S = {d1}·{d2}/2 = {area} см².'],
        'Перемножить диагонали и разделить произведение на 2.',
        f'2·{area} = {d1}·{d2} = {d1*d2}.',
        'Не дели на 2 только одну диагональ; пополам делится всё произведение.',
        diamond(d1,d2,caption=f'Диагонали ромба равны {d1} см и {d2} см.'))

# 51–60. Square area from perimeter.
for i in range(10):
    side=3+i
    perimeter=4*side
    area=side*side
    add('Площадь квадрата по периметру',
        f'Периметр квадрата равен {perimeter} см. Найди его площадь.',area,
        ['У квадрата четыре равные стороны.','Сначала найди сторону, разделив периметр на 4.'],
        [f'a = P/4 = {perimeter}/4 = {side} см.',f'S = a² = {side}² = {area} см².'],
        'Найти сторону квадрата, затем возвести её в квадрат.',
        f'4·{side} = {perimeter} см, а {side}·{side} = {area} см².',
        'Периметр — линейная величина; площадь получается после возведения стороны в квадрат.',
        square(caption=f'Квадрат ABCD; его периметр равен {perimeter} см.'))

# 61–70. Area of a rectangular shape with a notch removed.
for i in range(10):
    width,height=12+2*i,8+i
    notch_w,notch_h=3+i%4,2+i%3
    area=width*height-notch_w*notch_h
    pts=[point('A',70,260,-12,10),point('B',570,260,0,18),point('C',570,65,12,-4),
         point('D',390,65,0,-12),point('E',390,125,8,18),point('F',250,125,0,18),
         point('G',250,65,0,-12),point('H',70,65,-12,-4)]
    fig=diagram(pts,[segment('A','B'),segment('B','C'),segment('C','D'),segment('D','E'),segment('E','F'),
                     segment('F','G'),segment('G','H'),segment('H','A')],
                f'Вырез прямоугольный: {notch_w} см × {notch_h} см; внешний прямоугольник {width} см × {height} см. Схема не в масштабе.')
    add('Площадь фигуры с прямоугольным вырезом',
        f'Из прямоугольной пластины размером {width} см × {height} см вырезали прямоугольник размером {notch_w} см × {notch_h} см. Найди площадь оставшейся части.',area,
        ['Найди площадь всей пластины и площадь вырезанной части.','Площадь оставшейся фигуры равна разности.'],
        [f'Sвнеш = {width}·{height} = {width*height} см².',
         f'Sвырез = {notch_w}·{notch_h} = {notch_w*notch_h} см².',
         f'S = {width*height} − {notch_w*notch_h} = {area} см².'],
        'Вычесть площадь вырезанного прямоугольника из площади исходного.',
        f'{area} + {notch_w*notch_h} = {width*height} см².',
        'Не включай пустую область выреза в площадь оставшейся фигуры.',fig)

# 71–80. Area-unit conversions.
for i in range(10):
    mode=i%5
    variant=i//5
    if mode==0:
        source=(12+2*variant)*100
        answer=source*100
        question=f'Переведи {source} см² в мм².'
        steps=[f'1 см² = 100 мм².',f'{source} см² = {source}·100 = {answer} мм².']
        review=f'{answer}/100 = {source} см².'
        caption=f'Площадь {source} см²; требуется выразить её в мм².'
    elif mode==1:
        answer=2+variant
        source=answer*10000
        question=f'Переведи {source} см² в м².'
        steps=[f'1 м² = 10 000 см².',f'{source} см² = {source}/10 000 = {answer} м².']
        review=f'{answer}·10 000 = {source} см².'
        caption=f'Площадь {source} см²; требуется выразить её в м².'
    elif mode==2:
        answer=3+variant
        source=answer
        result=source*10000
        question=f'Сколько квадратных сантиметров содержится в {source} м²?'
        answer=result
        steps=[f'1 м² = 10 000 см².',f'{source} м² = {source}·10 000 = {result} см².']
        review=f'{result}/10 000 = {source} м².'
        caption=f'Площадь {source} м²; требуется выразить её в см².'
    elif mode==3:
        source=4+variant
        answer=source*100
        question=f'Переведи {source} аров в квадратные метры.'
        steps=[f'1 ар = 100 м².',f'{source} а = {source}·100 = {answer} м².']
        review=f'{answer}/100 = {source} а.'
        caption=f'Площадь {source} а; требуется выразить её в м².'
    else:
        source=1+variant
        answer=source*10000
        question=f'Переведи {source} га в квадратные метры.'
        steps=[f'1 га = 10 000 м².',f'{source} га = {source}·10 000 = {answer} м².']
        review=f'{answer}/10 000 = {source} га.'
        caption=f'Площадь {source} га; требуется выразить её в м².'
    add('Перевод единиц площади',question,answer,
        ['При переходе к меньшей единице числовое значение площади увеличивается.','Запомни: 1 м² = 10 000 см²; 1 а = 100 м²; 1 га = 10 000 м².'],
        steps,'Использовать коэффициент пересчёта для квадратных единиц.',review,
        'Для площади коэффициент длины нужно возводить в квадрат: 1 м² — это не 100 см².',
        rectangle(caption=caption))

# 81–90. Real area from a scaled plan.
for i in range(10):
    n=100*(i+1)
    a,b=2+i%4,3+i%5
    metres_per_cm=n/100
    area=a*b*metres_per_cm*metres_per_cm
    add('Площадь участка по плану',
        f'Масштаб плана 1:{n}. Прямоугольный участок изображён на плане сторонами {a} см и {b} см. Найди настоящую площадь участка в м².',area,
        ['В масштабе 1:n каждый сантиметр на плане соответствует n сантиметрам на местности.','Переведи реальные длины в метры, затем найди площадь прямоугольника.'],
        [f'Настоящие стороны: {a}·{n} = {a*n} см = {a*metres_per_cm:g} м и {b}·{n} = {b*n} см = {b*metres_per_cm:g} м.',
         f'S = {a*metres_per_cm:g}·{b*metres_per_cm:g} = {area:g} м².'],
        'Сначала увеличить каждую длину в n раз, затем перевести сантиметры в метры.',
        f'Увеличение площади равно n²; площадь плана {a*b} см² соответствует {area:g} м².',
        'Масштаб длины нельзя применять к площади только один раз: обе стороны увеличиваются в n раз.',
        rectangle(a,b,caption=f'Размеры на плане: {a} см × {b} см; масштаб 1:{n}.'))

# 91–100. Practical area and measurement problems.
for i in range(10):
    mode=i%5
    variant=i//5
    if mode==0:
        length,width=4+variant,3+variant
        area=length*width
        boxes=ceil(area/2)
        q=f'Пол комнаты имеет размеры {length} м × {width} м. Одна упаковка покрытия рассчитана на 2 м². Сколько упаковок нужно купить, чтобы покрыть весь пол?'
        answer=boxes
        steps=[f'Площадь пола: {length}·{width} = {area} м².',f'Число упаковок: {area}/2 = {area/2:g}. Нужны {boxes}, так как упаковки покупают целыми.']
        verify=f'{boxes} упаковок покрывают не менее {2*boxes} м², а {boxes-1} упаковок — только {2*(boxes-1)} м².'
        caption=f'Пол прямоугольной комнаты: {length} м × {width} м.'
        fig=rectangle(caption=caption)
        title='Покрытие пола'
        plan='Найти площадь комнаты и разделить её на площадь, покрываемую одной упаковкой; округлить вверх.'
        trap='Если упаковок получается нецелое число, округляй вверх, а не до ближайшего целого.'
    elif mode==1:
        width=6+variant
        difference=2+variant
        length=width+difference
        perimeter=2*(length+width)
        area=length*width
        q=f'Прямоугольный участок имеет периметр {perimeter} м. Его длина на {difference} м больше ширины. Найди площадь участка.'
        answer=area
        steps=[f'Пусть ширина равна x м, тогда длина x + {difference} м.',
               f'2(x+x+{difference}) = {perimeter}, откуда 4x = {perimeter-2*difference} и x = {width}.',
               f'Длина равна {length} м, площадь S = {width}·{length} = {area} м².']
        verify=f'2({width}+{length}) = {perimeter} м и {width}+{difference} = {length} м.'
        caption=f'Прямоугольный участок; P = {perimeter} м, длина больше ширины на {difference} м.'
        fig=rectangle(caption=caption)
        title='Площадь участка по периметру'
        plan='Выразить длину через ширину, подставить в формулу периметра и найти обе стороны.'
        trap='Периметр содержит две длины и две ширины, поэтому уравнение начинается с 2(x + x + разность).'
    elif mode==2:
        tiles=20+10*variant
        tile_w,tile_h=30,40
        area=tiles*(tile_w/100)*(tile_h/100)
        q=f'Уложили {tiles} одинаковых прямоугольных плиток размером {tile_w} см × {tile_h} см. Какую площадь они закрыли? Ответ дай в м².'
        answer=area
        steps=[f'Площадь одной плитки: {tile_w}·{tile_h} = {tile_w*tile_h} см² = {tile_w*tile_h/10000:g} м².',
               f'Площадь {tiles} плиток: {tiles}·{tile_w*tile_h/10000:g} = {area:g} м².']
        verify=f'{area:g} м² = {area*10000:g} см².'
        caption=f'{tiles} прямоугольных плиток; размеры каждой {tile_w} см × {tile_h} см.'
        fig=rectangle(caption=caption)
        title='Площадь, покрытая плиткой'
        plan='Найти площадь одной плитки, перевести в квадратные метры и умножить на количество.'
        trap='Перед умножением на число плиток переведи см² в м²: 10 000 см² = 1 м².'
    elif mode==3:
        base,height=10+2*variant,6+2*variant
        rect_w,rect_h=base,height
        tri_h=height//2
        area=rect_w*rect_h + base*tri_h//2
        q=f'Фасад состоит из прямоугольника шириной {rect_w} м и высотой {rect_h} м и расположенного над ним треугольного фронтона с основанием {base} м и высотой {tri_h} м. Найди общую площадь фасада.'
        answer=area
        pts=[point('A',80,250,-12,10),point('B',560,250,0,18),point('C',560,110,12,-4),
             point('D',80,110,-12,-4),point('E',320,40,0,-12)]
        fig=diagram(pts,[segment('A','B'),segment('B','C'),segment('C','E'),segment('E','D'),segment('D','A'),segment('D','C')],
                   f'Прямоугольное основание {rect_w}×{rect_h} м и треугольный фронтон {base}×{tri_h} м. Схема не в масштабе.')
        steps=[f'Sпрямоугольника = {rect_w}·{rect_h} = {rect_w*rect_h} м².',
               f'Sфронтона = {base}·{tri_h}/2 = {base*tri_h//2} м².',
               f'Sобщ = {rect_w*rect_h} + {base*tri_h//2} = {area} м².']
        verify=f'{area} − {rect_w*rect_h} = {base*tri_h//2} м² — площадь фронтона.'
        caption='Весь фасад — объединение прямоугольника и треугольника.'
        title='Площадь составного фасада'
        plan='Разбить фигуру на прямоугольник и треугольник, найти обе площади и сложить.'
        trap='Не дели площадь прямоугольной части на 2; деление на 2 нужно только для треугольника.'
    else:
        side=8+2*variant
        margin=2+variant
        outer=side+2*margin
        area=outer*outer-side*side
        q=f'Квадратная клумба со стороной {side} м окружена дорожкой одинаковой ширины {margin} м. Найди площадь дорожки.'
        answer=area
        pts=[point('A',70,280,-12,8),point('B',310,280,0,18),point('C',310,40,12,-4),point('D',70,40,-12,-4),
             point('E',130,220,-12,12),point('F',250,220,0,18),point('G',250,100,12,-4),point('H',130,100,-12,-4)]
        fig=diagram(pts,[segment('A','B'),segment('B','C'),segment('C','D'),segment('D','A'),
                         segment('E','F'),segment('F','G'),segment('G','H'),segment('H','E')],
                   f'Внутренняя клумба {side}×{side} м; дорожка шириной {margin} м со всех сторон. Схема не в масштабе.')
        steps=[f'Внешняя сторона квадрата: {side} + 2·{margin} = {outer} м.',
               f'Площадь всей внешней области: {outer}² = {outer*outer} м².',
               f'Площадь клумбы: {side}² = {side*side} м².',
               f'Площадь дорожки: {outer*outer} − {side*side} = {area} м².']
        verify=f'{area} + {side*side} = {outer*outer} м².'
        caption='Площадь дорожки — разность площадей двух квадратов.'
        title='Площадь дорожки вокруг клумбы'
        plan='Найти сторону внешнего квадрата, затем вычесть площадь клумбы из площади всей области.'
        trap='Ширина дорожки прибавляется с двух сторон каждой стороны клумбы.'
    add(title,q,answer,
        ['Сначала переведи условие на чертёж и выбери формулу площади нужной фигуры.',plan],
        steps,plan,verify,trap,fig)


assert len(bank)==100
assert len({t['id'] for t in bank})==100
assert len({t['question'] for t in bank})==100
assert all(t['examTopic']=='areas' and t['grade']==9 and t['figure']['geometry'] for t in bank)
OUT.write_text('/* 100 авторских задач ОГЭ по теме «Площади и измерения». */\n'+
               '(()=>{const bank='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+
               ';for(const item of bank)tasks.push(item)})();\n',encoding='utf-8')
