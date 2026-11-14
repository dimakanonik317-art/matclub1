"""Build 100 original grade-nine OGE exercises on circles and disks."""
import json
import math
from fractions import Fraction
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'dist' / 'oge-circle.js'
bank = []


def point(name, x, y, dx=0, dy=-12):
    return {'id': name, 'x': round(x, 3), 'y': round(y, 3), 'label': name, 'labelDx': dx, 'labelDy': dy}


def segment(a, b, label=None, dx=0, dy=0, style=''):
    item = {'from': a, 'to': b}
    if label is not None:
        item.update({'label': str(label), 'labelDx': dx, 'labelDy': dy})
    if style:
        item['style'] = style
    return item


def figure(points, segments, caption, circles=None, arcs=None):
    geo = {'points': points, 'segments': segments, 'caption': caption}
    if circles:
        geo['circles'] = circles
    if arcs:
        geo['arcs'] = arcs
    return {'geometry': geo}


def circle_point(name, angle, cx=320, cy=160, radius=110, dx=0, dy=-12):
    rad = math.radians(angle)
    return point(name, cx+radius*math.cos(rad), cy-radius*math.sin(rad), dx, dy)


def circle_only(radius_label=None, caption='Окружность с центром O. Схема не в масштабе.'):
    points = [point('O',320,160,10,17), point('A',430,160,5,-10)]
    return figure(points,[segment('O','A',radius_label,0,-12)],caption,[{'cx':320,'cy':160,'r':110}])


def add(title, question, answer, hints, steps, plan, verify, trap, diagram):
    n = len(bank)+1
    bank.append({
        'id':f'oge-circle-{n}', 'exam':'oge', 'domain':'math', 'grade':9,
        'subject':'geometry', 'topicName':'Окружность и круг', 'topic':13,
        'examTopic':'circle', 'level':0, 'challenge':False,
        'goal':'ОГЭ · окружность и круг', 'title':title, 'question':question,
        'answer':float(answer), 'hints':hints, 'steps':steps,
        'review':{'plan':plan,'verify':verify,'trap':trap}, 'figure':diagram
    })


# 1–10. Circumference from a radius; the answer is the coefficient of π.
for i in range(10):
    r = i+1
    coeff = 2*r
    add('Длина окружности через радиус',
        f'Радиус окружности равен {r}. Запиши длину окружности в виде kπ и найди коэффициент k.',
        coeff, ['Длина окружности вычисляется по формуле C = 2πr.', 'Коэффициент k — это множитель перед π.'],
        [f'C = 2πr = 2·π·{r} = {coeff}π.', f'Значит, k = {coeff}.'],
        'Подставь радиус в формулу длины окружности и выдели множитель при π.',
        f'C/π = 2·{r} = {coeff}.',
        'Не путай радиус с диаметром: формула через диаметр имеет вид C = πd.',
        circle_only(f'r = {r}',f'Радиус OA = {r}.'))

# 11–20. Area of a disk from its radius; answer is the coefficient of π.
for i in range(10):
    r = i+2
    coeff = r*r
    add('Площадь круга через радиус',
        f'Радиус круга равен {r}. Площадь имеет вид S = kπ. Найди коэффициент k.',
        coeff, ['Площадь круга равна πr².', 'Коэффициент перед π — это квадрат радиуса.'],
        [f'S = πr² = π·{r}² = {coeff}π.', f'Следовательно, k = {coeff}.'],
        'Возведи радиус в квадрат; π остаётся множителем.',
        f'S/π = {r}² = {coeff}.',
        'В формуле площади радиус возводится в квадрат, а не удваивается.',
        circle_only(f'r = {r}',f'Радиус OA = {r}; требуется коэффициент при π в площади круга.'))

# 21–30. Central and inscribed angles subtending the same arc.
for i in range(10):
    theta = 30 + 10*i
    inscribed = theta//2
    cx,cy,R = 320,160,105
    points = [point('O',cx,cy,9,18),circle_point('A',0,cx,cy,R,5,-10),
              circle_point('B',theta,cx,cy,R,0,-12),circle_point('C',theta+180,cx,cy,R,0,18)]
    diagram = figure(points,[segment('O','A'),segment('O','B'),segment('A','B'),segment('C','A'),segment('C','B')],
                     f'∠AOB = {theta}°; центральный и вписанный углы опираются на дугу AB.',
                     [{'cx':cx,'cy':cy,'r':R}],[{'cx':cx,'cy':cy,'r':R,'startAngle':0,'endAngle':theta}])
    add('Центральный и вписанный углы',
        f'Центральный угол AOB, опирающийся на дугу AB, равен {theta}°. Найди вписанный угол ACB, опирающийся на ту же дугу.',
        inscribed, ['Вписанный угол равен половине центрального угла, опирающегося на ту же дугу.', f'Раздели {theta}° пополам.'],
        [f'∠ACB = ∠AOB/2.', f'∠ACB = {theta}°/2 = {inscribed}°.'],
        'Проверь, что оба угла опираются именно на одну и ту же дугу AB.',
        f'2·{inscribed}° = {theta}°.',
        'Половина относится к вписанному углу, не к центральному.', diagram)

# 31–40. Opposite angles of a cyclic quadrilateral are supplementary.
for i in range(10):
    angle_a = 40 + 8*i
    answer = 180-angle_a
    cx,cy,R = 320,160,110
    angles = [0,60,60+angle_a,60+2*angle_a]
    names = ['A','B','C','D']
    points = [circle_point(name,ang,cx,cy,R,10 if name in ('B','C') else -10,
                          -12 if name in ('A','B') else 18) for name,ang in zip(names,angles)]
    segments = [segment('A','B'),segment('B','C'),segment('C','D'),segment('D','A')]
    diagram = figure(points,segments,f'Четырёхугольник ABCD вписан в окружность; ∠A = {angle_a}°.',
                     [{'cx':cx,'cy':cy,'r':R}])
    add('Угол вписанного четырёхугольника',
        f'Четырёхугольник ABCD вписан в окружность. Угол A равен {angle_a}°. Найди противоположный угол C.',
        answer, ['Сумма противоположных углов вписанного четырёхугольника равна 180°.', 'Вычти угол A из 180°.'],
        [f'∠A + ∠C = 180°.', f'∠C = 180° − {angle_a}° = {answer}°.'],
        'Для вписанного четырёхугольника противоположные углы являются дополнительными.',
        f'{angle_a}° + {answer}° = 180°.',
        'Не применяй сумму 360° ко всем четырём углам: здесь спрашивается один угол, противоположный данному.', diagram)

# 41–50. A perpendicular from the center to a chord bisects it.
for i in range(10):
    scale = i+1
    radius, distance, half_chord = 5*scale, 3*scale, 4*scale
    cx,cy,R = 320,160,115
    mx = cx-0.6*R
    points = [point('O',cx,cy,10,18),point('M',mx,cy,-2,18),
              point('A',mx,cy-0.8*R,-12,-5),point('B',mx,cy+0.8*R,-12,18)]
    diagram = figure(points,[segment('O','A',radius,-8,-8),segment('O','M',distance,0,-12),
                             segment('A','B'),segment('O','B')],
                     'OM перпендикулярен хорде AB, поэтому M — её середина.',[{'cx':cx,'cy':cy,'r':R}])
    add('Хорда и расстояние от центра',
        f'Радиус окружности равен {radius}. Расстояние от центра до хорды AB равно {distance}. Найди длину хорды AB.',
        2*half_chord, ['Перпендикуляр из центра окружности к хорде делит хорду пополам.', 'В прямоугольном треугольнике OMA найди AM по теореме Пифагора.'],
        [f'OM ⟂ AB, значит AM = AB/2.',
         f'AM² = OA² − OM² = ({radius})² − ({distance})² = {half_chord*half_chord}.',
         f'AM = {half_chord}, поэтому AB = 2·{half_chord} = {2*half_chord}.'],
        'Рассмотри прямоугольный треугольник OMA, где OA — гипотенуза.',
        f'({distance})² + ({half_chord})² = ({radius})².',
        'Сначала найден только половина хорды; длина всей хорды вдвое больше.', diagram)

# 51–60. Tangent and radius are perpendicular; use a 5–12–13 triangle.
for i in range(10):
    scale = i+1
    radius, tangent, op = 5*scale, 12*scale, 13*scale
    points = [point('O',200,190,-15,18),point('T',200,70,-15,-10),point('P',488,70,10,-10)]
    diagram = figure(points,[segment('O','T',radius,-18,0),segment('O','P',op,0,-15),segment('T','P')],
                     'PT — касательная в точке T; OT ⟂ PT.')
    diagram['geometry']['circles'] = [{'cx':200,'cy':190,'r':120}]
    add('Касательная к окружности',
        f'Из точки P проведена касательная PT к окружности с центром O. Радиус OT равен {radius}, OP = {op}. Найди PT.',
        tangent, ['Радиус, проведённый в точку касания, перпендикулярен касательной.', 'Треугольник OTP прямоугольный, OP — гипотенуза.'],
        [f'OT ⟂ PT, поэтому PT² = OP² − OT².',
         f'PT² = ({op})² − ({radius})² = {tangent*tangent}.',
         f'PT = {tangent}.'],
        'Используй теорему Пифагора в прямоугольном треугольнике OTP.',
        f'({radius})² + ({tangent})² = ({op})².',
        'Гипотенуза — OP; из её квадрата вычитается квадрат радиуса.', diagram)

# 61–70. Intersecting chords inside a circle.
for i in range(10):
    scale = i+1
    ap, pb, cp = 2*scale, 3*scale, 3*scale
    pd = ap*pb//cp
    radius = math.hypot((pb-ap)/2,(pd-cp)/2)
    unit = 112/radius
    ox,oy = 320,160
    px,py = ox-unit*(pb-ap)/2,oy-unit*(pd-cp)/2
    coords = {'A':(px-ap*unit,py),'P':(px,py),'B':(px+pb*unit,py),
              'C':(px,py-cp*unit),'D':(px,py+pd*unit)}
    points = [point(k,*v,10 if k in ('P','B') else -12,18 if k in ('D','B') else -10) for k,v in coords.items()]
    diagram = figure(points,[segment('A','P',ap,0,-12),segment('P','B',pb,0,-12),
                             segment('C','P',cp,16,0),segment('P','D'),
                             segment('A','B'),segment('C','D')],
                     'Хорды AB и CD пересекаются внутри окружности в точке P; схема не в масштабе.',
                     [{'cx':ox,'cy':oy,'r':112}])
    add('Пересекающиеся хорды',
        f'Хорды AB и CD пересекаются в точке P. Известно: AP = {ap}, PB = {pb}, CP = {cp}. Найди PD.',
        pd, ['Для пересекающихся хорд произведения отрезков одной хорды равны.', 'Запиши AP·PB = CP·PD и вырази PD.'],
        [f'AP·PB = CP·PD.', f'{ap}·{pb} = {cp}·PD.', f'PD = {ap*pb}/{cp} = {pd}.'],
        'Перемножь части первой хорды и раздели на известную часть второй.',
        f'{ap}·{pb} = {cp}·{pd} = {ap*pb}.',
        'Используй пары отрезков, лежащих на одной хорде.', diagram)

# 71–80. Secant-secant power theorem from an exterior point.
secants = [(2,4,2,4),(2,4,3,1),(3,5,2,10),(3,5,3,5),(3,5,4,2),
           (4,5,3,9),(4,5,4,5),(5,7,3,17),(5,7,4,11),(5,7,5,7)]
for i,(pa,ab,pc,cd) in enumerate(secants):
    pb, pd = pa+ab, pc+cd
    angle = math.radians(-60)
    u1=(1,0); u2=(math.cos(angle),math.sin(angle))
    # The circle center's projections onto the secants are their chord midpoints.
    cx_rel = pa+ab/2
    cy_rel = (pc+cd/2-cx_rel*u2[0])/u2[1]
    radius = math.hypot(cx_rel-pa,cy_rel)
    unit = 98/radius
    ox,oy = 320,160
    px,py = ox-unit*cx_rel,oy-unit*cy_rel
    coords = {
        'P':(px,py), 'A':(px+pa*unit,py), 'B':(px+pb*unit,py),
        'C':(px+pc*unit*u2[0],py+pc*unit*u2[1]),
        'D':(px+pd*unit*u2[0],py+pd*unit*u2[1])
    }
    points=[point(k,*v,10 if k in ('P','B','D') else -12,18 if k in ('B','D') else -10) for k,v in coords.items()]
    diagram=figure(points,[segment('P','A',pa,0,-12),segment('A','B',ab,0,-12),
                           segment('P','C',pc,-12,12),segment('C','D'),
                           segment('P','B'),segment('P','D')],
                   'Две секущие проведены из внешней точки P; схема не в масштабе.',
                   [{'cx':ox,'cy':oy,'r':98}])
    add('Секущие из одной точки',
        f'Из внешней точки P проведены две секущие PAB и PCD. PA = {pa}, AB = {ab}, PC = {pc}. Найди CD.',
        cd, ['Для двух секущих произведение внешнего отрезка на всю секущую одинаково.', 'Запиши PA·PB = PC·PD, где PB = PA+AB.'],
        [f'PB = PA + AB = {pa} + {ab} = {pb}.',
         f'PA·PB = PC·PD, значит {pa}·{pb} = {pc}·PD.',
         f'PD = {pa*pb}/{pc} = {pd}, поэтому CD = PD − PC = {pd} − {pc} = {cd}.'],
        'Сначала найди полные длины секущих PB и PD, затем вычти внешний отрезок PC.',
        f'{pa}·{pb} = {pc}·{pd} = {pa*pb}.',
        'В формуле участвует вся секущая, а искомый CD — только её внутренняя часть.', diagram)

# 81–90. Arc length as a coefficient of π.
for i in range(10):
    radius, theta = 3+i, 30+30*(i%6)
    coeff = Fraction(radius*theta,180)
    cx,cy,R = 320,160,110
    points = [point('O',cx,cy,10,18),circle_point('A',0,cx,cy,R,8,-10),
              circle_point('B',theta,cx,cy,R,0,-12)]
    diagram = figure(points,[segment('O','A',f'r={radius}',0,-12),segment('O','B'),segment('A','B')],
                     f'Центральный угол AOB = {theta}°; дуга AB выделена.',
                     [{'cx':cx,'cy':cy,'r':R}],[{'cx':cx,'cy':cy,'r':R,'startAngle':0,'endAngle':theta}])
    add('Длина дуги окружности',
        f'Радиус окружности равен {radius}, центральный угол AOB равен {theta}°. Длина дуги AB равна kπ. Найди k.',
        float(coeff), ['Длина всей окружности равна 2πr.', 'Дуга составляет θ/360 всей окружности.'],
        [f'Длина дуги = ({theta}/360)·2π·{radius}.',
         f'Коэффициент k = {theta}·{radius}/180 = {coeff.numerator}/{coeff.denominator} = {float(coeff):g}.'],
        'Найди долю полного оборота и умножь её на длину окружности.',
        f'Доля окружности {theta}/360, поэтому длина дуги составляет {coeff}π.',
        'Не используй θ/360 без умножения на длину всей окружности.', diagram)

# 91–100. Sector area as a coefficient of π.
for i in range(10):
    radius, theta = 2+i, 45*(1+i%7)
    coeff = Fraction(theta*radius*radius,360)
    cx,cy,R = 320,160,110
    points = [point('O',cx,cy,10,18),circle_point('A',0,cx,cy,R,8,-10),
              circle_point('B',theta,cx,cy,R,0,-12)]
    diagram = figure(points,[segment('O','A',f'r={radius}',0,-12),segment('O','B')],
                     f'Центральный угол сектора AOB = {theta}°.',
                     [{'cx':cx,'cy':cy,'r':R}],[{'cx':cx,'cy':cy,'r':R,'startAngle':0,'endAngle':theta}])
    add('Площадь сектора круга',
        f'Радиус круга равен {radius}, центральный угол сектора AOB равен {theta}°. Площадь сектора имеет вид kπ. Найди k.',
        float(coeff), ['Площадь всего круга равна πr².', 'Сектор занимает θ/360 площади круга.'],
        [f'Sсектора = ({theta}/360)·π·{radius}².',
         f'Коэффициент k = {theta}·{radius}²/360 = {coeff.numerator}/{coeff.denominator} = {float(coeff):g}.'],
        'Умножь площадь круга на долю полного угла, соответствующую сектору.',
        f'Доля круга равна {theta}/360; k = ({theta}/360)·{radius}² = {coeff}.',
        'При вычислении площади сектора радиус нужно возвести в квадрат.', diagram)


assert len(bank)==100
assert len({t['id'] for t in bank})==100
assert len({t['question'] for t in bank})==100
assert all(t['examTopic']=='circle' and t['grade']==9 and t['figure']['geometry'].get('circles') for t in bank)
OUT.write_text('/* 100 авторских задач ОГЭ по теме «Окружность и круг». */\n'+
               '(()=>{const bank='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+
               ';for(const item of bank)tasks.push(item)})();\n',encoding='utf-8')
