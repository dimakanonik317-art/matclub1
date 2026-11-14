"""Build 100 original grade-nine OGE exercises on triangles and similarity."""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'dist' / 'oge-triangles.js'
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


def paired_figure(small, large, caption):
    points = [point('A', 65, 222, -12, 4), point('B', 226, 222, 0, 22),
              point('C', 143, 67, -1, -12), point('D', 352, 222, -10, 4),
              point('E', 574, 222, 0, 22), point('F', 462, 67, 0, -12)]
    segments = [segment('A', 'B', small['AB'], 0, 17),
                segment('B', 'C', small['BC'], 0, 0),
                segment('C', 'A', small['CA'], -4, 0),
                segment('D', 'E', large['DE'], 0, 17),
                segment('E', 'F', large['EF'], 0, 0),
                segment('F', 'D', large['FD'], -4, 0)]
    return figure(points, segments, caption)


def thales_figure(ad, db, ae, ec, fraction, caption):
    ax, ay, bx, by, cx, cy = 300, 42, 82, 270, 520, 270
    dx, dy = ax + fraction * (bx - ax), ay + fraction * (by - ay)
    ex, ey = ax + fraction * (cx - ax), ay + fraction * (cy - ay)
    points = [point('A', ax, ay, 0, -12), point('B', bx, by, -10, 18),
              point('C', cx, cy, 10, 18), point('D', dx, dy, -18, 2),
              point('E', ex, ey, 14, 0)]
    segments = [segment('A', 'B', str(ad), -18, 0), segment('D', 'B', str(db), 18, 0),
                segment('A', 'E', str(ae), 17, 0), segment('E', 'C', str(ec), -16, 0),
                segment('B', 'C', None), segment('D', 'E', None, style='parallel')]
    return figure(points, segments, caption)


def thales_parallel_figure(ad, db, bc, de, fraction, caption):
    ax, ay, bx, by, cx, cy = 300, 42, 82, 270, 520, 270
    dx, dy = ax + fraction * (bx - ax), ay + fraction * (by - ay)
    ex, ey = ax + fraction * (cx - ax), ay + fraction * (cy - ay)
    points = [point('A', ax, ay, 0, -12), point('B', bx, by, -10, 18),
              point('C', cx, cy, 10, 18), point('D', dx, dy, -18, 2),
              point('E', ex, ey, 14, 0)]
    segments = [segment('A', 'B', str(ad), -18, 0), segment('D', 'B', str(db), 18, 0),
                segment('B', 'C', str(bc), 0, 18), segment('D', 'E', str(de), 0, -9, 'parallel'),
                segment('A', 'C', None)]
    return figure(points, segments, caption)


def add(title, question, answer, hints, steps, plan, verify, trap, diagram):
    n = len(bank) + 1
    bank.append({
        'id': f'oge-triangles-{n}', 'exam': 'oge', 'domain': 'math', 'grade': 9,
        'subject': 'geometry', 'topicName': 'Треугольники и подобие', 'topic': 11,
        'examTopic': 'triangles', 'level': 0, 'challenge': False,
        'goal': 'ОГЭ · треугольники и подобие', 'title': title, 'question': question,
        'answer': float(answer), 'hints': hints, 'steps': steps,
        'review': {'plan': plan, 'verify': verify, 'trap': trap}, 'figure': diagram
    })


# 1–10. Scale corresponding sides in a pair of similar triangles.
for i in range(10):
    s = 1 + i % 5
    k = 2 + i % 3
    small = {'AB': 3*s, 'BC': 4*s, 'CA': 5*s}
    large = {name: k*value for name, value in zip(('DE', 'EF', 'FD'), small.values())}
    answer = large['EF']
    add('Стороны подобных треугольников',
        f'Треугольники ABC и DEF подобны: A↔D, B↔E, C↔F. Коэффициент подобия от ABC к DEF равен {k}. Если BC = {small["BC"]}, найди EF.',
        answer, ['Сопоставь вершины в записи подобия.', 'При переходе от малого треугольника к большому умножай соответствующие стороны на коэффициент.'],
        [f'По соответствию B↔E и C↔F сторона BC соответствует EF.',
         f'EF = BC·{k} = {small["BC"]}·{k} = {answer}.'],
        'Запиши соответствие вершин, затем примени коэффициент подобия к нужной стороне.',
        f'Отношение EF/BC = {answer}/{small["BC"]} = {k}.',
        'Не перепутай соответствующие стороны: порядок букв в записи подобия задаёт пары вершин.',
        paired_figure(small, large, 'Соответствие вершин: A↔D, B↔E, C↔F. Схема не в масштабе.'))

# 11–20. Use the perimeter ratio as the similarity coefficient.
for i in range(10):
    s = 2 + i % 7
    k = 2 + (i*2) % 3
    perimeter_small = 12*s
    perimeter_large = k*perimeter_small
    small = {'AB': 3*s, 'BC': 4*s, 'CA': 5*s}
    large = {name: k*value for name, value in zip(('DE', 'EF', 'FD'), small.values())}
    answer = large['DE']
    add('Периметр и коэффициент подобия',
        f'Треугольники ABC и DEF подобны. Их периметры равны {perimeter_small} и {perimeter_large} соответственно. Если AB = {small["AB"]}, найди соответствующую сторону DE.',
        answer, ['У подобных треугольников отношение периметров равно отношению соответствующих сторон.', 'Сначала найди коэффициент подобия по периметрам.'],
        [f'Коэффициент подобия k = {perimeter_large}/{perimeter_small} = {k}.',
         f'DE = AB·k = {small["AB"]}·{k} = {answer}.'],
        'Найди отношение периметров большего и меньшего треугольников, затем умножь соответствующую сторону.',
        f'Периметр увеличился в {k} раза, и сторона DE/AB = {answer}/{small["AB"]} = {k}.',
        'Не возводи отношение периметров в квадрат: квадрат относится к площадям.',
        paired_figure(small, large, 'Периметры указаны в условии. Схема не в масштабе.'))

# 21–30. Areas scale as the square of the side coefficient.
for i in range(10):
    s = 1 + i % 5
    k = 2 + (i+1) % 3
    area_small = 6*s*s
    area_large = area_small*k*k
    small = {'AB': 3*s, 'BC': 4*s, 'CA': 5*s}
    large = {name: k*value for name, value in zip(('DE', 'EF', 'FD'), small.values())}
    add('Площади подобных треугольников',
        f'Треугольники ABC и DEF подобны с коэффициентом {k} от ABC к DEF. Площадь ABC равна {area_small}. Найди площадь DEF.',
        area_large, ['Отношение площадей подобных фигур равно квадрату коэффициента подобия.', 'Сначала возведи коэффициент в квадрат.'],
        [f'S(DEF)/S(ABC) = {k}² = {k*k}.',
         f'S(DEF) = {area_small}·{k*k} = {area_large}.'],
        'Для площадей используй квадрат коэффициента подобия.',
        f'Отношение площадей {area_large}/{area_small} = {k*k} = {k}².',
        'Не умножай площадь только на k: площадь меняется в k² раз.',
        paired_figure(small, large, 'Данные о площади приведены в условии. Схема не в масштабе.'))

# 31–40. Recover the side coefficient from an area ratio, then find a side.
for i in range(10):
    s = 1 + i % 5
    k = 2 + i % 3
    area_small = 6*s*s
    area_large = area_small*k*k
    small = {'AB': 3*s, 'BC': 4*s, 'CA': 5*s}
    large = {name: k*value for name, value in zip(('DE', 'EF', 'FD'), small.values())}
    answer = large['DE']
    add('Найди сторону по отношению площадей',
        f'Треугольники ABC и DEF подобны, причём S(ABC) = {area_small}, S(DEF) = {area_large}, AB = {small["AB"]}. Найди DE.',
        answer, ['Отношение площадей равно квадрату коэффициента подобия.', 'Извлеки квадратный корень из отношения большей площади к меньшей.'],
        [f'k² = {area_large}/{area_small} = {k*k}, значит коэффициент подобия k = √{k*k} = {k}.',
         f'Стороны соответствуют в том же порядке, поэтому DE = AB·k = {small["AB"]}·{k} = {answer}.'],
        'Сначала восстанови линейный коэффициент по площадям, затем примени его к стороне.',
        f'Проверка: отношение площадей {area_large}/{area_small} = {k*k}, а DE/AB = {answer}/{small["AB"]} = {k}.',
        'Коэффициент подобия положителен; выбирай положительный квадратный корень.',
        paired_figure(small, large, 'Соответствие вершин: A↔D, B↔E, C↔F. Схема не в масштабе.'))

# 41–50. Thales theorem: find the second segment on a side.
for i in range(10):
    m, n = 2 + i % 4, 3 + (i*2) % 5
    t = 2 + i % 4
    ad, db, ae, ec = m*t, n*t, m*(t+1), n*(t+1)
    fraction = m/(m+n)
    add('Теорема Фалеса и параллельные отрезки',
        f'В треугольнике ABC точки D∈AB и E∈AC, DE ∥ BC. Известно: AD = {ad}, DB = {db}, AE = {ae}. Найди EC.',
        ec, ['Параллельный отрезок делит стороны треугольника пропорционально.', 'Запиши равенство AD/DB = AE/EC и вырази EC.'],
        [f'По теореме Фалеса AD/DB = AE/EC.',
         f'{ad}/{db} = {ae}/EC, поэтому EC = {ae}·{db}/{ad} = {ec}.'],
        'Составь пропорцию из отрезков, лежащих на одной и той же стороне.',
        f'AD/DB = {ad}/{db} = {m}/{n}; AE/EC = {ae}/{ec} = {m}/{n}.',
        'Сопоставляй отрезки по их положению относительно параллельных прямых.',
        thales_figure(ad, db, ae, ec, fraction, 'DE параллелен BC. Подписи отрезков даны в условии.'))

# 51–60. Thales theorem: find a parallel segment from a side ratio.
for i in range(10):
    m, n = 2 + (i*3) % 5, 3 + i % 4
    t = 2 + i % 4
    ad, db = m*t, n*t
    ab, bc = ad+db, 3*(m+n)*t
    de = bc*ad//ab
    fraction = ad/ab
    add('Длина отрезка, параллельного стороне',
        f'В треугольнике ABC точки D∈AB и E∈AC, DE ∥ BC. Дано: AD = {ad}, DB = {db}, BC = {bc}. Найди DE.',
        de, ['Треугольники ADE и ABC подобны.', 'Их коэффициент равен отношению AD к AB.'],
        [f'AB = AD + DB = {ad} + {db} = {ab}.',
         f'DE/BC = AD/AB, поэтому DE = {bc}·{ad}/{ab} = {de}.'],
        'Сначала найди всю сторону AB, затем используй подобие ADE и ABC.',
        f'DE/BC = {de}/{bc} = {ad}/{ab} = AD/AB.',
        'В знаменателе пропорции нужна вся сторона AB, а не только DB.',
        thales_parallel_figure(ad, db, bc, de, fraction, 'DE ∥ BC, поэтому △ADE ∼ △ABC. Схема не в масштабе.'))

# 61–70. Midline theorem.
for i in range(10):
    value = 8 + 2*i
    if i % 2 == 0:
        de, bc, answer = value, 2*value, 2*value
        known, ask = f'DE = {de}', 'BC'
        steps = [f'D и E — середины двух сторон, значит DE — средняя линия треугольника.',
                 f'Средняя линия равна половине третьей стороны: BC = 2·DE = 2·{de} = {answer}.']
        verify = f'Проверка: DE = BC/2 = {answer}/2 = {de}.'
    else:
        bc, de, answer = value, value//2, value//2
        known, ask = f'BC = {bc}', 'DE'
        steps = [f'D и E — середины двух сторон, поэтому DE — средняя линия.',
                 f'DE = BC/2 = {bc}/2 = {answer}.']
        verify = f'Проверка: 2·DE = 2·{answer} = {bc} = BC.'
    points = [point('A', 300, 40, 0, -12), point('B', 82, 270, -12, 10),
              point('C', 520, 270, 10, 10), point('D', 191, 155, -18, 0),
              point('E', 410, 155, 14, 0)]
    diagram = figure(points, [segment('A','B'), segment('A','C'), segment('B','C', bc, 0, 18),
                              segment('D','E', de, 0, -9, 'parallel')],
                     'D и E — середины сторон AB и AC; DE ∥ BC.')
    add('Средняя линия треугольника',
        f'В треугольнике ABC точки D и E — середины сторон AB и AC. {known}. Найди {ask}.',
        answer, ['Средняя линия треугольника параллельна третьей стороне.', 'Её длина равна половине третьей стороны.'],
        steps, 'Примени свойство средней линии: DE = BC/2.', verify,
        'Не забудь, что равенство относится к длине: средняя линия вдвое короче третьей стороны.', diagram)

# 71–80. Angle-bisector theorem.
for i in range(10):
    m, n = 2 + i % 5, 3 + (i*2) % 4
    t = 2 + i % 4
    ab, ac, bd, dc = m*3, n*3, m*t, n*t
    bc = bd + dc
    x = 82 + (438 * m // (m+n))
    points = [point('A', 300, 38, 0, -12), point('B', 82, 270, -12, 12),
              point('C', 520, 270, 12, 12), point('D', x, 270, 0, 20)]
    diagram = figure(points, [segment('A','B', ab, -20, -2), segment('A','C', ac, 20, -2),
                              segment('B','D', bd, 0, 18), segment('D','C', dc, 0, 18),
                              segment('A','D', None)],
                     'AD — биссектриса угла A. Схема не в масштабе.')
    add('Биссектриса и пропорциональные отрезки',
        f'В треугольнике ABC биссектриса AD пересекает BC в точке D. AB = {ab}, AC = {ac}, BD = {bd}. Найди DC.',
        dc, ['Биссектриса делит противоположную сторону в отношении прилежащих сторон.', 'Используй BD/DC = AB/AC.'],
        [f'По теореме о биссектрисе BD/DC = AB/AC = {ab}/{ac} = {m}/{n}.',
         f'{bd}/DC = {m}/{n}, откуда DC = {bd}·{n}/{m} = {dc}.'],
        'Сравни отрезки BD и DC с прилежащими сторонами AB и AC.',
        f'BD/DC = {bd}/{dc} = {m}/{n} = AB/AC.',
        'В отношении отрезков не меняй местами соответствующие прилежащие стороны.', diagram)

# 81–90. The altitude to a hypotenuse is the geometric mean of its projections.
for i in range(10):
    p = 1 + i
    q, h = 4*p, 2*p
    bx, dx, cx = 100, 100+6*p, 100+30*p
    points = [point('A', dx, 220-12*p, 0, -12), point('B', bx, 220, -12, 15),
              point('C', cx, 220, 12, 15), point('D', dx, 220, 0, 18)]
    diagram = figure(points, [segment('B','C', p+q, 0, 18), segment('B','D', p, 0, -10),
                              segment('D','C', q, 0, -10), segment('A','D', h, 16, 0),
                              segment('A','B'), segment('A','C')],
                     'AD — высота к гипотенузе BC; BD и DC — её проекции.')
    add('Высота к гипотенузе',
        f'В прямоугольном треугольнике ABC высота AD проведена к гипотенузе BC. Она делит гипотенузу на отрезки BD = {p} и DC = {q}. Найди AD.',
        h, ['Треугольники ABD и ADC подобны исходному треугольнику.', 'Для высоты и её проекций выполняется AD² = BD·DC.'],
        [f'AD² = BD·DC = {p}·{q} = {p*q}.',
         f'AD = √{p*q} = {h}, так как длина высоты положительна.'],
        'Используй геометрическое среднее проекций на гипотенузе.',
        f'{h}² = {p*q} = {p}·{q}.',
        'Высота равна квадратному корню из произведения проекций, а не их сумме.', diagram)

# 91–100. Area ratio for triangles with equal altitudes.
for i in range(10):
    s = 1 + i
    base1, base2, height = 3*s, 5*s, 4*s
    area1, area2 = base1*height//2, base2*height//2
    points = [point('A', 68, 255, -10, 14), point('B', 245, 255, 0, 18),
              point('C', 156, 70, 0, -12), point('D', 358, 255, -10, 14),
              point('E', 574, 255, 0, 18), point('F', 466, 70, 0, -12),
              point('H', 156, 255, 12, 0), point('K', 466, 255, 12, 0)]
    diagram = figure(points, [segment('A','B', base1, 0, 18), segment('A','C'), segment('C','B'),
                              segment('D','E', base2, 0, 18), segment('D','F'), segment('F','E'),
                              segment('C','H', None, style='height'), segment('F','K', None, style='height')],
                     'Высоты CH и FK равны. Схема не в масштабе.')
    add('Площади при равных высотах',
        f'У треугольников ABC и DEF высоты CH и FK равны. Основания AB = {base1} и DE = {base2}; площадь ABC равна {area1}. Найди площадь DEF.',
        area2, ['При одинаковых высотах отношение площадей равно отношению оснований.', 'Можно сначала восстановить общую высоту из площади ABC.'],
        [f'S(ABC) = AB·CH/2, поэтому CH = 2·{area1}/{base1} = {height}.',
         f'Высоты равны, значит FK = {height}. Тогда S(DEF) = DE·FK/2 = {base2}·{height}/2 = {area2}.'],
        'Используй формулу площади и равенство высот.',
        f'S(DEF)/S(ABC) = DE/AB = {base2}/{base1} = {area2}/{area1}.',
        'Отношение площадей равно отношению оснований только при равных высотах.', diagram)


assert len(bank) == 100
assert len({item['id'] for item in bank}) == 100
assert len({item['question'] for item in bank}) == 100
assert all(item['examTopic'] == 'triangles' and item['grade'] == 9 and item['figure'] for item in bank)
OUT.write_text('/* 100 авторских задач ОГЭ по теме «Треугольники и подобие». */\n' +
               '(()=>{const bank=' + json.dumps(bank, ensure_ascii=False, separators=(',', ':')) +
               ';for(const item of bank)tasks.push(item)})();\n', encoding='utf-8')
