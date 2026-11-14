"""Build 100 original grade-nine OGE exercises on quadrilaterals."""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'dist' / 'oge-quadrilaterals.js'
bank = []


def point(name, x, y, dx=0, dy=-12):
    return {'id': name, 'x': x, 'y': y, 'label': name, 'labelDx': dx, 'labelDy': dy}


def segment(a, b, label=None, dx=0, dy=0, style=''):
    item = {'from': a, 'to': b}
    if label is not None:
        item.update({'label': str(label), 'labelDx': dx, 'labelDy': dy})
    if style:
        item['style'] = style
    return item


def figure(points, segments, caption):
    return {'geometry': {'points': points, 'segments': segments, 'caption': caption}}


def parallelogram(labels=None, diagonals=False, height=None, caption='Параллелограмм ABCD. Схема не в масштабе.'):
    labels = labels or {}
    points = [point('A', 90, 245, -12, 8), point('B', 490, 245, 0, 20),
              point('C', 550, 75, 12, -4), point('D', 150, 75, -12, -4)]
    segments = [segment('A','B',labels.get('AB'),0,17), segment('B','C',labels.get('BC'),18,0),
                segment('C','D',labels.get('CD'),0,-14), segment('D','A',labels.get('DA'),-16,0)]
    if diagonals:
        points.append(point('O', 320, 160, 10, -3))
        segments.extend([segment('A','C'), segment('B','D')])
    if height is not None:
        points.append(point('H', 150, 245, -2, 18))
        segments.append(segment('D','H',height,-18,0,'height'))
    return figure(points, segments, caption)


def rectangle(labels=None, diagonals=False, caption='Прямоугольник ABCD. Схема не в масштабе.'):
    labels = labels or {}
    points = [point('A', 100, 250, -12, 8), point('B', 500, 250, 0, 20),
              point('C', 500, 75, 12, -4), point('D', 100, 75, -12, -4)]
    segments = [segment('A','B',labels.get('AB'),0,17), segment('B','C',labels.get('BC'),18,0),
                segment('C','D',labels.get('CD'),0,-14), segment('D','A',labels.get('DA'),-16,0)]
    if diagonals:
        points.append(point('O', 300, 162, 10, -4))
        segments.extend([segment('A','C',labels.get('AC'),10,-10), segment('B','D',labels.get('BD'))])
    return figure(points, segments, caption)


def rhombus(labels=None, diagonals=False, caption='Ромб ABCD. Схема не в масштабе.'):
    labels = labels or {}
    points = [point('A', 320, 45, 0, -12), point('B', 520, 160, 12, 0),
              point('C', 320, 275, 0, 18), point('D', 120, 160, -12, 0)]
    segments = [segment('A','B',labels.get('AB'),12,-8), segment('B','C',labels.get('BC'),12,8),
                segment('C','D',labels.get('CD'),-12,8), segment('D','A',labels.get('DA'),-12,-8)]
    if diagonals:
        segments.extend([segment('A','C',labels.get('AC'),16,0), segment('B','D',labels.get('BD'),0,-12)])
    return figure(points, segments, caption)


def square(labels=None, diagonal=False, caption='Квадрат ABCD. Схема не в масштабе.'):
    labels = labels or {}
    points = [point('A',150,250,-12,8),point('B',390,250,0,20),
              point('C',390,10,12,-4),point('D',150,10,-12,-4)]
    segments = [segment('A','B',labels.get('AB'),0,17),segment('B','C',labels.get('BC'),18,0),
                segment('C','D'),segment('D','A')]
    if diagonal:
        segments.append(segment('A','C',labels.get('AC'),10,-10))
    return figure(points, segments, caption)


def trapezoid(labels=None, height=None, midline=False, caption='Трапеция ABCD. Схема не в масштабе.'):
    labels = labels or {}
    points = [point('A', 80, 255, -12, 10), point('B', 560, 255, 0, 18),
              point('C', 465, 82, 12, -4), point('D', 175, 82, -12, -4)]
    segments = [segment('A','B',labels.get('AB'),0,17), segment('B','C',labels.get('BC'),20,0),
                segment('C','D',labels.get('CD'),0,-14), segment('D','A',labels.get('DA'),-18,0)]
    if height is not None:
        points.append(point('H', 175, 255, -2, 18))
        segments.append(segment('D','H',height,-18,0,'height'))
    if midline:
        points.extend([point('E',320,255,0,0),point('F',320,82,0,-8)])
        segments.append(segment('E','F',None,0,0,'parallel'))
    return figure(points, segments, caption)


def kite(diagonals=True, caption='Четырёхугольник с перпендикулярными диагоналями. Схема не в масштабе.'):
    points = [point('A', 320, 45, 0, -12), point('B', 520, 160, 12, 0),
              point('C', 320, 275, 0, 18), point('D', 120, 160, -12, 0),
              point('O', 320, 160, 10, -4)]
    segments = [segment('A','B'),segment('B','C'),segment('C','D'),segment('D','A')]
    if diagonals:
        segments.extend([segment('A','C'),segment('B','D')])
    return figure(points, segments, caption)


def add(title, question, answer, hints, steps, plan, verify, trap, diagram):
    n = len(bank) + 1
    bank.append({
        'id': f'oge-quadrilaterals-{n}', 'exam': 'oge', 'domain': 'math', 'grade': 9,
        'subject': 'geometry', 'topicName': 'Четырёхугольники', 'topic': 12,
        'examTopic': 'quadrilaterals', 'level': 0, 'challenge': False,
        'goal': 'ОГЭ · четырёхугольники', 'title': title, 'question': question,
        'answer': float(answer), 'hints': hints, 'steps': steps,
        'review': {'plan': plan, 'verify': verify, 'trap': trap}, 'figure': diagram
    })


# 1–10. Opposite sides of a parallelogram and its perimeter.
for i in range(10):
    a, b = 8 + 2*i, 5 + i
    perimeter = 2*(a+b)
    add('Стороны параллелограмма и периметр',
        f'Периметр параллелограмма ABCD равен {perimeter}, AB = {a}. Найди AD.',
        b, ['У параллелограмма противоположные стороны равны.', 'Периметр равен удвоенной сумме двух соседних сторон.'],
        [f'P = 2(AB + AD), значит AB + AD = {perimeter}/2 = {perimeter//2}.',
         f'AD = {perimeter//2} − {a} = {b}.'],
        'Раздели периметр пополам и вычти известную сторону.',
        f'2({a}+{b}) = {perimeter}.',
        'Не вычитай известную сторону из всего периметра: каждая сторона входит дважды.',
        parallelogram({'AB':a}, caption='Даны периметр и сторона AB.'))

# 11–20. Adjacent angles in a parallelogram are supplementary.
for i in range(10):
    angle_a = 35 + 6*i
    answer = 180 - angle_a
    add('Углы параллелограмма',
        f'В параллелограмме ABCD угол A равен {angle_a}°. Найди угол B.',
        answer, ['Соседние углы параллелограмма в сумме дают 180°.', 'Вычти известный угол из 180°.'],
        [f'Углы A и B соседние, поэтому ∠A + ∠B = 180°.',
         f'∠B = 180° − {angle_a}° = {answer}°.'],
        'Используй сумму соседних углов параллелограмма.',
        f'{angle_a}° + {answer}° = 180°.',
        'Противоположные углы равны, а до 180° в сумме равны именно соседние.',
        parallelogram(caption=f'Параллелограмм ABCD; ∠A = {angle_a}°; ∠A и ∠B — соседние углы.'))

# 21–30. The diagonals of a parallelogram bisect one another.
for i in range(10):
    half = 6 + 3*i
    if i % 2 == 0:
        given, answer, ask = f'AO = {half}', 2*half, 'AC'
        segment_name = 'AO'
        steps = [f'Диагонали параллелограмма точкой пересечения делятся пополам, значит AO = OC.',
                 f'AC = AO + OC = 2·{half} = {answer}.']
        verify = f'Половины диагонали равны: {answer}/2 = {half} = AO.'
    else:
        given, answer, ask = f'BO = {half}', 2*half, 'BD'
        segment_name = 'BO'
        steps = [f'Диагонали параллелограмма точкой O делятся пополам, значит BO = OD.',
                 f'BD = BO + OD = 2·{half} = {answer}.']
        verify = f'Половины диагонали равны: {answer}/2 = {half} = BO.'
    points = [point('A',90,245,-12,8),point('B',490,245,0,20),point('C',550,75,12,-4),
              point('D',150,75,-12,-4),point('O',320,160,10,-4)]
    diagram = figure(points,[segment('A','B'),segment('B','C'),segment('C','D'),segment('D','A'),
                             segment('A','C'),segment('B','D'),segment(segment_name[0],'O',half,0,-12)],
                     'Диагонали параллелограмма пересекаются в точке O.')
    add('Диагонали параллелограмма',
        f'Диагонали параллелограмма ABCD пересекаются в точке O. Если {given}, найди {ask}.',
        answer, ['Вспомни, как точка пересечения диагоналей делит каждую диагональ.', 'Вся диагональ состоит из двух равных половин.'],
        steps, 'Удвоить известную половину диагонали.', verify,
        'Длина диагонали вдвое больше одного из равных отрезков.', diagram)

# 31–40. Pythagorean theorem in a rectangle.
for i in range(10):
    scale = 1 + i
    if i % 2 == 0:
        known_side, diagonal, answer = 5*scale, 13*scale, 12*scale
        side_name = 'AB'
        steps = [f'Диагональ и две стороны прямоугольника образуют прямоугольный треугольник.',
                 f'BC² = AC² − AB² = ({diagonal})² − ({known_side})² = {answer*answer}.',
                 f'BC = √{answer*answer} = {answer}.']
    else:
        known_side, diagonal, answer = 12*scale, 13*scale, 5*scale
        side_name = 'AB'
        steps = [f'По теореме Пифагора AC² = AB² + BC².',
                 f'BC² = ({diagonal})² − ({known_side})² = {answer*answer}.',
                 f'BC = √{answer*answer} = {answer}.']
    add('Диагональ прямоугольника',
        f'Диагональ AC прямоугольника ABCD равна {diagonal}, сторона {side_name} равна {known_side}. Найди BC.',
        answer, ['Диагональ прямоугольника — гипотенуза прямоугольного треугольника.', 'Примени теорему Пифагора и извлеки положительный корень.'],
        steps, 'Вычесть квадрат известной стороны из квадрата диагонали.',
        f'{known_side}² + {answer}² = {diagonal}².',
        'Диагональ — гипотенуза, поэтому её квадрат больше квадрата каждой стороны.',
        rectangle({'AB':known_side,'AC':diagonal}, diagonals=True,
                  caption='AC — диагональ прямоугольника; длины указаны в условии.'))

# 41–50. Perpendicular diagonals bisect each other in a rhombus.
for i in range(10):
    scale = 1 + i
    d1, d2, side = 6*scale, 8*scale, 5*scale
    add('Сторона ромба по диагоналям',
        f'Диагонали ромба ABCD равны {d1} и {d2}. Найди сторону ромба.',
        side, ['Диагонали ромба перпендикулярны и делятся точкой пересечения пополам.', 'Половины диагоналей и сторона образуют прямоугольный треугольник.'],
        [f'Половины диагоналей: {d1}/2 = {3*scale} и {d2}/2 = {4*scale}.',
         f'Сторона — гипотенуза: a² = ({3*scale})² + ({4*scale})² = {side*side}.',
         f'a = √{side*side} = {side}.'],
        'Найди половины диагоналей и используй теорему Пифагора.',
        f'({3*scale})² + ({4*scale})² = {side}².',
        'В прямоугольном треугольнике сторона ромба является гипотенузой.',
        rhombus({'AC':d1,'BD':d2}, diagonals=True, caption='Диагонали ромба перпендикулярны и делятся пополам.'))

# 51–60. The area of a square from its diagonal.
for i in range(10):
    coefficient = 2 + i
    diagonal_text = f'{coefficient}√2'
    area = coefficient*coefficient
    add('Площадь квадрата по диагонали',
        f'Диагональ квадрата равна {diagonal_text}. Найди площадь квадрата.',
        area, ['В квадрате диагональ d = a√2.', 'Из равенства d² = 2a² сразу вырази площадь a².'],
        [f'd² = 2S, поэтому S = d²/2.',
         f'S = ({diagonal_text})²/2 = {2*area}/2 = {area}.'],
        'Используй связь диагонали квадрата со стороной; площадь равна квадрату стороны.',
        f'Диагональ² = {2*area}, а площадь равна половине квадрата диагонали: {area}.',
        'Не принимай диагональ за сторону и не забывай разделить её квадрат на 2.',
        square({'AC':diagonal_text}, diagonal=True, caption=f'Квадрат; его диагональ AC = {diagonal_text}.'))

# 61–70. Midline of a trapezoid.
for i in range(10):
    short_base, long_base = 7 + 2*i, 15 + 2*i
    midline = (short_base + long_base)//2
    add('Средняя линия трапеции',
        f'Основания трапеции равны {short_base} и {long_base}. Найди длину её средней линии.',
        midline, ['Средняя линия трапеции параллельна основаниям.', 'Она равна полусумме оснований.'],
        [f'm = ({short_base} + {long_base})/2.',
         f'm = {short_base+long_base}/2 = {midline}.'],
        'Сложить основания и разделить результат на 2.',
        f'2·{midline} = {short_base} + {long_base} = {short_base+long_base}.',
        'Не дели на 2 только одно основание: нужно взять полусумму обоих.',
        trapezoid({'AB':long_base,'CD':short_base}, midline=True, caption='EF — средняя линия трапеции, EF ∥ AB ∥ CD.'))

# 71–80. Isosceles trapezoid: Pythagorean theorem on a side triangle.
triples = [(3,4,5),(5,12,13),(8,15,17),(7,24,25),(20,21,29),
           (12,35,37),(9,40,41),(28,45,53),(11,60,61),(16,63,65)]
for i, (offset, height, leg) in enumerate(triples):
    short_base = 12 + 2*i
    long_base = short_base + 2*offset
    perimeter = short_base + long_base + 2*leg
    add('Периметр равнобедренной трапеции',
        f'В равнобедренной трапеции основания равны {short_base} и {long_base}, высота равна {height}. Найди периметр.',
        perimeter, ['Опусти высоты из концов меньшего основания.', 'Разность оснований делится поровну; боковая сторона находится по теореме Пифагора.'],
        [f'Горизонтальный катет каждого бокового прямоугольного треугольника равен ({long_base} − {short_base})/2 = {offset}.',
         f'Боковая сторона l = √({offset}² + {height}²) = √{offset*offset+height*height} = {leg}.',
         f'P = {short_base} + {long_base} + 2·{leg} = {perimeter}.'],
        'Найди половину разности оснований, затем боковую сторону и периметр.',
        f'{offset}² + {height}² = {leg}²; периметр равен сумме четырёх сторон: {perimeter}.',
        'В равнобедренной трапеции вычитается разность оснований, а в один прямоугольный треугольник попадает её половина.',
        trapezoid({'AB':long_base,'CD':short_base}, height=height,
                  caption='Равнобедренная трапеция; пунктир — высота.'))

# 81–90. Interior angles of a quadrilateral sum to 360°.
for i in range(10):
    a, b, c = 55+i, 80+2*i, 95+i
    answer = 360 - a - b - c
    add('Сумма углов четырёхугольника',
        f'Три угла четырёхугольника равны {a}°, {b}° и {c}°. Найди четвёртый угол.',
        answer, ['Сумма внутренних углов любого четырёхугольника равна 360°.', 'Сложи три известных угла и вычти сумму из 360°.'],
        [f'Сумма трёх известных углов: {a}° + {b}° + {c}° = {a+b+c}°.',
         f'Четвёртый угол равен 360° − {a+b+c}° = {answer}°.'],
        'Вычесть сумму известных углов из 360°.',
        f'{a}° + {b}° + {c}° + {answer}° = 360°.',
        'Здесь нужна сумма углов четырёхугольника, а не треугольника.',
        figure([point('A',90,245,-12,8),point('B',500,245,0,20),point('C',455,75,12,-4),point('D',160,100,-12,-4)],
               [segment('A','B'),segment('B','C'),segment('C','D'),segment('D','A')],
               f'Углы A, B и C равны {a}°, {b}° и {c}° соответственно.'))

# 91–100. Area formulas for common quadrilaterals.
for i in range(10):
    kind, variant = i % 5, i // 5
    if kind == 0:
        base, height = 8 + 4*variant, 3 + 2*variant
        answer = base*height
        diagram = parallelogram({'AB':base}, height=height, caption=f'Основание AB = {base}; пунктиром показана высота h = {height}.')
        question = f'Основание параллелограмма равно {base}, высота, опущенная на это основание, равна {height}. Найди площадь.'
        steps = [f'S = a·h.', f'S = {base}·{height} = {answer}.']
        formula = 'Площадь параллелограмма равна произведению основания на высоту.'
        verify = f'{answer}/{base} = {height} — указанная высота.'
    elif kind == 1:
        a, b, h = 6 + 2*variant, 10 + 4*variant, 5 + 2*variant
        answer = (a+b)*h//2
        diagram = trapezoid({'AB':b,'CD':a}, height=h, caption='Пунктиром показана высота трапеции.')
        question = f'Основания трапеции равны {a} и {b}, высота равна {h}. Найди площадь трапеции.'
        steps = [f'S = (a+b)·h/2.', f'S = ({a}+{b})·{h}/2 = {answer}.']
        formula = 'Площадь трапеции — произведение полусуммы оснований на высоту.'
        verify = f'2·{answer} = ({a}+{b})·{h} = {(a+b)*h}.'
    elif kind == 2:
        d1, d2 = 6 + 4*variant, 8 + 4*variant
        answer = d1*d2//2
        diagram = rhombus({'AC':d1,'BD':d2}, diagonals=True, caption='Диагонали ромба перпендикулярны.')
        question = f'Диагонали ромба равны {d1} и {d2}. Найди его площадь.'
        steps = [f'S = d₁·d₂/2.', f'S = {d1}·{d2}/2 = {answer}.']
        formula = 'Площадь ромба равна половине произведения диагоналей.'
        verify = f'2·{answer} = {d1}·{d2} = {d1*d2}.'
    elif kind == 3:
        d1, d2 = 8 + 4*variant, 6 + 2*variant
        answer = d1*d2//2
        diagram = kite(caption='Диагонали четырёхугольника перпендикулярны.')
        question = f'Диагонали выпуклого четырёхугольника взаимно перпендикулярны и равны {d1} и {d2}. Найди площадь четырёхугольника.'
        steps = [f'Перпендикулярные диагонали разбивают фигуру на четыре прямоугольных треугольника; их площади вместе дают d₁·d₂/2.',
                 f'S = {d1}·{d2}/2 = {answer}.']
        formula = 'Для выпуклого четырёхугольника с перпендикулярными диагоналями S = d₁d₂/2.'
        verify = f'Половина произведения диагоналей: {d1*d2}/2 = {answer}.'
    else:
        side = 4 + 3*variant
        answer = side*side
        diagram = square({'AB':side}, caption=f'Квадрат со стороной {side}.')
        question = f'Найди площадь квадрата со стороной {side}.'
        steps = [f'Площадь квадрата S = a².', f'S = {side}² = {answer}.']
        formula = 'Площадь квадрата равна квадрату его стороны.'
        verify = f'√{answer} = {side}, что совпадает с длиной стороны.'
    add('Площадь четырёхугольника', question, answer,
        ['Определи вид четырёхугольника и выбери формулу его площади.', formula],
        steps, formula, verify, 'Проверь, что в формуле использованы именно те величины, которые даны в условии.', diagram)


assert len(bank) == 100
assert len({item['id'] for item in bank}) == 100
assert len({item['question'] for item in bank}) == 100
assert all(item['examTopic'] == 'quadrilaterals' and item['grade'] == 9 and item['figure'] for item in bank)
OUT.write_text('/* 100 авторских задач ОГЭ по теме «Четырёхугольники». */\n' +
               '(()=>{const bank=' + json.dumps(bank, ensure_ascii=False, separators=(',', ':')) +
               ';for(const item of bank)tasks.push(item)})();\n', encoding='utf-8')
