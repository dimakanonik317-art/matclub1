"""Build 100 original grade-nine OGE inequality and interval exercises."""
import json
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "oge-inequalities.js"

# Problem IDs are drawn from the matching public Resolver OGE topic catalogs.
SRC_NUMBER = [311418,311421,317025,317026,317027,317028,317029,317030,317031,317032,317033,317034,317035,317036,317037]
SRC_LINEAR = [311409,311417,341139,424909,424973,424998,425024,314567,107,314612,339291,339297,348564,384408,339300,339311,338590,370472,392116,392666,392692,449686,338595,338673,338695,338767,338769,338764]
SRC_GENERAL = [314563,151,314576,314578,314594,338512,338596,338600,338648,338681,338703,338849,357255,357256,357257,480078,480427,480556,338566,338573,338614,338661,338829,338835,338850,338966,340850,355299,355424,369508,369540,369686,369716,351947,352891,472395,472396,472397,479717,479729,479735,479764,479783,479860,479934,479952,480145,480277,480294,472398,472399,472400,479744,479914,479942,480143,480231,480271]
SRC_QUADRATIC = [185,314596,314604,333004,314571,333083,341520,392928,392954,392980,463027,319773,319774,319775,319776,319777,319778,319779,319780,319860]
SRC_SYSTEMS = [311672,311905,320003,320008,340832,340858,340884,340913,349402,350864,351413,351635,352280,352329,355411]

bank = []

def F(value, denominator=None):
    if isinstance(value, Fraction):
        return value
    return Fraction(value, denominator) if denominator is not None else Fraction(value)

def fmt(value):
    value = F(value)
    sign = "−" if value < 0 else ""
    value = abs(value)
    if value.denominator == 1:
        return sign + str(value.numerator)
    return sign + str(value.numerator) + "/" + str(value.denominator)

def signed(value):
    value = F(value)
    return (" + " if value >= 0 else " − ") + fmt(abs(value))

def linear(a, b):
    a, b = F(a), F(b)
    if a == 0:
        return fmt(b)
    if a == 1:
        xpart = "x"
    elif a == -1:
        xpart = "−x"
    else:
        xpart = fmt(a) + "x"
    return xpart + signed(b) if b else xpart

def times(expression, factor):
    factor = F(factor)
    if factor == 1:
        return expression
    if factor == -1:
        return "−(" + expression + ")"
    return fmt(factor) + "(" + expression + ")"

def flip(op):
    return {"<":">", "≤":"≥", ">":"<", "≥":"≤"}[op]

def condition_holds(value, op):
    return {"<":value < 0, "≤":value <= 0, ">":value > 0, "≥":value >= 0}[op]

def interval(lo, hi, lo_in=False, hi_in=False):
    return [lo, hi, lo_in, hi_in]

def answer_bound(value):
    if value == float("-inf"):
        return None
    if value == float("inf"):
        return None
    return float(value)

def answer_set(parts):
    return [[answer_bound(lo), answer_bound(hi), bool(li), bool(hi_i)] for lo,hi,li,hi_i in parts]

def bound_label(value, left=False):
    if value == float("-inf"):
        return "−∞" if left else "−∞"
    if value == float("inf"):
        return "+∞"
    return fmt(value)

def interval_text(part):
    lo, hi, li, hii = part
    return ("[" if li else "(") + bound_label(lo, True) + "; " + bound_label(hi) + ("]" if hii else ")")

def interval_union(parts):
    parts = sorted((list(p) for p in parts), key=lambda p: (p[0], not p[2], p[1]))
    out = []
    for p in parts:
        if not out or p[0] > out[-1][1] or (p[0] == out[-1][1] and not (p[2] or out[-1][3])):
            out.append(p)
            continue
        last = out[-1]
        if p[1] > last[1]:
            last[1], last[3] = p[1], p[3]
        elif p[1] == last[1]:
            last[3] = last[3] or p[3]
        if p[0] == last[0]:
            last[2] = last[2] or p[2]
    return out

def intersection(a, b):
    lo = max(a[0], b[0])
    hi = min(a[1], b[1])
    li = (a[2] if lo == a[0] else True) and (b[2] if lo == b[0] else True)
    hii = (a[3] if hi == a[1] else True) and (b[3] if hi == b[1] else True)
    if lo < hi or lo == hi and li and hii:
        return [lo, hi, li, hii]
    return None

def subtract_one(a, b):
    hit = intersection(a, b)
    if hit is None:
        return [a]
    out = []
    left_in = (a[2] if hit[0] == a[0] else True) and not hit[2]
    if a[0] < hit[0] or a[0] == hit[0] and left_in:
        out.append([a[0], hit[0], a[2], left_in])
    right_in = (a[3] if hit[1] == a[1] else True) and not hit[3]
    if hit[1] < a[1] or hit[1] == a[1] and right_in:
        out.append([hit[1], a[1], right_in, a[3]])
    return out

def subtract_many(a_parts, b_parts):
    remaining = list(a_parts)
    for b in b_parts:
        remaining = [piece for a in remaining for piece in subtract_one(a,b)]
    return interval_union(remaining)

def add(task, source_id, category, source_type, group, ordinal):
    task.update({
        "id": "oge-inequalities-" + str(ordinal),
        "exam": "oge", "domain": "math", "grade": 9, "subject": "algebra",
        "topicName": "Неравенства и промежутки", "topic": 4, "level": 0,
        "examTopic": "inequalities", "challenge": False,
        "goal": "ОГЭ · неравенства и промежутки",
        "source": {
            "name": "Решу ОГЭ", "id": source_id, "type": source_type,
            "url": "https://math-oge.sdamgia.ru/problem?id=" + str(source_id),
            "note": "Авторская задача Матклуба. Ссылка ведёт к заданию из соответствующего раздела каталога «Решу ОГЭ».",
        },
    })
    bank.append(task)

def make_set_task(title, question, result, hints, steps, review):
    return {
        "title": title, "question": question, "answerType": "set",
        "answerSet": answer_set(result), "hints": hints, "steps": steps,
        "review": review,
    }

# 1–20. Linear inequalities with fractions, negative coefficients, and rational endpoints.
linear_specs = [
    (3,-5,4,F(7,3),"<"), (-4,7,5,F(-2,3),"≥"), (5,2,6,F(11,4),"≤"),
    (-3,-4,7,F(5,2),">"), (2,-7,3,F(1,2),"≥"), (-5,3,8,F(-3,4),"<"),
    (7,-2,9,F(4,3),"≤"), (-2,9,5,F(7,2),">"), (4,1,7,F(-5,6),"<"),
    (-7,-3,6,F(5,4),"≥"), (3,8,5,F(2,7),">"), (-6,5,11,F(-1,3),"≤"),
    (8,-9,10,F(7,5),"<"), (-3,11,8,F(1,6),"≥"), (5,-4,9,F(-2,5),">"),
    (-8,1,7,F(3,4),"<"), (4,-11,6,F(5,8),"≥"), (-5,12,13,F(-4,7),"≤"),
    (9,-7,12,F(1,8),">"), (-4,-9,10,F(2,3),"≥"),
]
for i,(a,b,m,rhs,op) in enumerate(linear_specs):
    root = (m*rhs-b)/a
    final_op = op if a > 0 else flip(op)
    if final_op in (">", "≥"):
        result = [interval(root,float("inf"),final_op=="≥",False)]
    else:
        result = [interval(float("-inf"),root,False,final_op=="≤")]
    left = "(" + linear(a,b) + ")/" + str(m)
    question = "Реши неравенство " + left + " " + op + " " + fmt(rhs) + ". Запиши ответ числовым промежутком."
    scaled_rhs = m*rhs
    moved = scaled_rhs-b
    divided = moved/a
    op_after_division = op if a > 0 else flip(op)
    steps = [
        "Умножаем обе части на положительное число "+str(m)+": "+linear(a,b)+" "+op+" "+fmt(scaled_rhs)+".",
        "Переносим свободное слагаемое: "+linear(a,0)+" "+op+" "+fmt(moved)+".",
        ("Делим на положительный коэффициент "+str(a)+": " if a>0 else "Делим на отрицательный коэффициент "+str(a)+" и меняем знак: ")+"x "+op_after_division+" "+fmt(divided)+".",
        "Ответ: "+"; ".join(interval_text(p) for p in result)+".",
    ]
    task = make_set_task(
        ["Линейное неравенство с дробью","Неравенство с отрицательным коэффициентом","Граница решения — рациональное число"][i%3],
        question,result,
        ["Сначала умножь на знаменатель: он положительный, знак неравенства сохранится.","При делении на отрицательное число знак неравенства меняется."],
        steps,
        {"plan":"Сначала избавься от знаменателя, затем изолируй x и внимательно отследи знак.","verify":"На границе x = "+fmt(root)+" обе части равны. Направление луча задаёт знак коэффициента при x.","trap":"Знаменатель положителен, а коэффициент при x может быть отрицательным: знак меняется только при делении на него."},
    )
    add(task,SRC_LINEAR[i],55,"Линейные неравенства","linear",i+1)

# 21–35. Chained inequalities: both endpoint openness and division by a negative matter.
compound_specs = [
    (3,-2,5,F(-1,2),F(7,3),False,True),(-4,5,7,F(-3,2),F(2,5),True,False),
    (5,1,8,F(-2,3),F(3,2),True,True),(-3,-7,4,F(1,4),F(11,4),False,False),
    (2,-5,9,F(-4,3),F(5,6),True,False),(7,4,10,F(-1,2),F(9,4),False,True),
    (-5,3,6,F(-7,4),F(2,3),True,True),(4,-9,11,F(-2,5),F(3,7),False,False),
    (3,8,7,F(-5,6),F(4,3),True,False),(-2,-1,5,F(1,3),F(13,6),False,True),
    (6,-7,13,F(-3,5),F(7,4),True,True),(-7,9,12,F(-1,4),F(5,3),False,False),
    (5,-11,14,F(-2,7),F(9,5),True,False),(-3,2,8,F(-4,3),F(3,8),False,True),
    (4,13,15,F(-7,6),F(11,4),True,True),
]
for i,(a,b,m,lo,hi,lo_closed,hi_closed) in enumerate(compound_specs):
    xlo=(m*lo-b)/a; xhi=(m*hi-b)/a
    if a>0:
        left,right=xlo,xhi; li,ri=lo_closed,hi_closed
    else:
        left,right=xhi,xlo; li,ri=hi_closed,lo_closed
    result=[interval(left,right,li,ri)]
    glyph_lo="≤" if lo_closed else "<"; glyph_hi="≤" if hi_closed else "<"
    expr="("+linear(a,b)+")/"+str(m)
    question="Реши двойное неравенство "+fmt(lo)+" "+glyph_lo+" "+expr+" "+glyph_hi+" "+fmt(hi)+". Ответ запиши промежутком."
    low_scaled=m*lo; high_scaled=m*hi
    first_lo=(low_scaled-b)/a; first_hi=(high_scaled-b)/a
    first_flags=(lo_closed,hi_closed)
    if a<0:
        first_lo,first_hi=first_hi,first_lo; first_flags=(hi_closed,lo_closed)
    final_l="≤" if first_flags[0] else "<"; final_r="≤" if first_flags[1] else "<"
    divide_note="Делим на отрицательное число "+str(a)+" и меняем направление обеих частей." if a<0 else "Делим на положительное число "+str(a)+"."
    steps=[
        "Умножаем все три части на "+str(m)+": "+fmt(low_scaled)+" "+glyph_lo+" "+linear(a,b)+" "+glyph_hi+" "+fmt(high_scaled)+".",
        "Вычитаем "+fmt(b)+" из каждой части: "+fmt(low_scaled-b)+" "+glyph_lo+" "+linear(a,0)+" "+glyph_hi+" "+fmt(high_scaled-b)+".",
        divide_note+" Получаем "+fmt(first_lo)+" "+final_l+" x "+final_r+" "+fmt(first_hi)+".",
        "Ответ: "+interval_text(result[0])+".",
    ]
    task=make_set_task("Двойное неравенство с дробными границами",question,result,
        ["Умножь все три части на знаменатель — знак неравенства не изменится.","Если коэффициент при x отрицателен, поменяй направление обоих знаков."],steps,
        {"plan":"Сохраняй обе границы одновременно; при делении на отрицательное число переворачивай оба знака.","verify":"Подстановка граничных значений возвращает соответственно "+fmt(lo)+" и "+fmt(hi)+".","trap":"При отрицательном коэффициенте меняется порядок границ и направление каждого знака."})
    source_id=SRC_LINEAR[20+i] if 20+i<len(SRC_LINEAR) else SRC_GENERAL[i-(len(SRC_LINEAR)-20)]
    category=55 if 20+i<len(SRC_LINEAR) else 72
    add(task,source_id,category,"Линейные неравенства","compound",21+i)

# 36–55. Quadratics with rational roots; solve by signs, preserving strict endpoints.
root_pairs=[
    (F(-5,2),F(3)),(F(-4),F(1,3)),(F(-7,3),F(2,5)),(F(-1,2),F(5,2)),
    (F(-3),F(4,3)),(F(-5,4),F(7,2)),(F(-2,3),F(4)),(F(1,2),F(7,3)),
    (F(-7,2),F(-1,3)),(F(-4,5),F(9,4)),(F(-6),F(2,3)),(F(-3,2),F(5)),
    (F(-8,3),F(1,4)),(F(-1),F(7,4)),(F(-5,3),F(3,2)),(F(-9,4),F(2)),
    (F(-2),F(5,3)),(F(-7,5),F(4)),(F(-3,4),F(11,3)),(F(-5),F(1,2)),
]
quad_ops=["≥","<","≤",">","≥","≤","<",">","≤","≥",">","<","≤",">","≥","<","≤",">","≥","<"]
quad_scale=[1,-1,2,-2,3,-1,1,2,-3,1,-2,3,1,-1,2,-2,1,3,-1,2]
for i,((r1,r2),op,scale) in enumerate(zip(root_pairs,quad_ops,quad_scale)):
    assert r1<r2
    den1,den2=r1.denominator,r2.denominator
    a=scale*den1*den2
    b=scale*(-r1.numerator*den2-den1*r2.numerator)
    c=scale*r1.numerator*r2.numerator
    # Integer coefficients by construction.
    def poly(a,b,c):
        text=("x²" if a==1 else "−x²" if a==-1 else ("−" if a<0 else "")+str(abs(a))+"x²")
        if b:
            text+=(" + " if b>0 else " − ")+ ("x" if abs(b)==1 else str(abs(b))+"x")
        if c:
            text+=(" + " if c>0 else " − ")+str(abs(c))
        return text
    def root_factor(root):
        if root == 0:
            return "(x)"
        return "(x + "+fmt(abs(root))+")" if root < 0 else "(x − "+fmt(root)+")"
    qtext=poly(a,b,c)
    outer="" if scale==1 else "−" if scale==-1 else str(scale)
    factored=outer+root_factor(r1)+root_factor(r2)
    includes=op in ("≤","≥")
    sign_a=1 if a>0 else -1
    selected=[]
    for lo,hi,sgn in [(float("-inf"),r1,sign_a),(r1,r2,-sign_a),(r2,float("inf"),sign_a)]:
        if condition_holds(F(sgn),op):
            selected.append(interval(lo,hi,False if lo==float("-inf") else includes,False if hi==float("inf") else includes))
    result=interval_union(selected)
    question="Реши неравенство "+qtext+" "+op+" 0 методом интервалов. Запиши ответ как промежуток или их объединение."
    relation="вне корней" if condition_holds(F(sign_a),op) else "между корнями"
    rejected="между корнями" if relation=="вне корней" else "вне корней"
    steps=[
        "Разложение на множители: "+qtext+" = "+factored+".",
        "Нули выражения: x₁ = "+fmt(r1)+", x₂ = "+fmt(r2)+". На промежутках знак постоянен.",
        "Старший коэффициент "+str(a)+" "+("положительный" if a>0 else "отрицательный")+": для выражения "+op+" 0 подходят участки "+relation+"; на участках "+rejected+" знак не подходит.",
        ("Нули включаем, так как стоит нестрогий знак." if includes else "Нули не включаем, так как неравенство строгое.")+" Ответ: "+(" ∪ ".join(interval_text(p) for p in result) if result else "∅")+".",
    ]
    task=make_set_task("Квадратное неравенство: метод интервалов",question,result,
        ["Найди оба корня соответствующего квадратного уравнения.","Определи знак на крайних промежутках по старшему коэффициенту; между простыми корнями знак противоположен."],steps,
        {"plan":"Отметь оба корня на числовой прямой, определи знаки на промежутках и отдельно реши, включать ли корни.","verify":"В корнях многочлен равен нулю; между соседними корнями знак меняется.","trap":"При отрицательном старшем коэффициенте знаки на крайних промежутках отрицательные. Строгое неравенство исключает корни."})
    add(task,SRC_QUADRATIC[i],5,"Квадратные неравенства","quadratic",36+i)

# 56–70. Rational inequalities: zeros belong only for non-strict signs; poles never do.
rational_specs=[
    ([-3,2],[1],1,"<"),([-4,1],[3],1,"≥"),([-2,5],[1],-1,"≤"),
    ([-5,2],[0],1,">"),([-1,4],[2],-1,"<"),([-3,1],[2,5],1,"≤"),
    ([-4,3],[-1],-1,"≥"),([-2,6],[1],1,"<"),([-5,2],[0,3],-1,">"),
    ([-1,4],[-3],1,"≤"),([-4,1],[2,5],1,"≥"),([-3,5],[1],-1,"<"),
    ([-2,4],[0,3],1,"≤"),([-5,2],[-1],-1,">"),([-4,3],[1,5],1,"<"),
]
def factor(root):
    if root==0:return "x"
    return "(x "+("−" if root>0 else "+")+" "+str(abs(root))+")"

for i,(zeros,poles,scale,op) in enumerate(rational_specs):
    zeros=[F(x) for x in zeros]; poles=[F(x) for x in poles]
    points=sorted(set(zeros+poles))
    if len(points)<2:
        continue
    numer="".join(factor(z) for z in zeros)
    if len(zeros)==1: numer=factor(zeros[0])
    denom="".join(factor(p) for p in poles)
    if len(poles)==1: denom=factor(poles[0])
    sign_text="−" if scale<0 else ""
    expression=sign_text+"("+numer+")/("+denom+")"
    def eval_sign(x):
        value=F(scale)
        for z in zeros:value*=x-z
        for p in poles:value/=x-p
        return value
    boundaries=[float("-inf")]+points+[float("inf")]
    result=[]
    for lo,hi in zip(boundaries,boundaries[1:]):
        sample=hi-1 if lo==float("-inf") else lo+1 if hi==float("inf") else (lo+hi)/2
        if condition_holds(eval_sign(sample),op):
            lo_closed=lo in zeros and op in ("≤","≥")
            hi_closed=hi in zeros and op in ("≤","≥")
            result.append(interval(lo,hi,lo_closed,hi_closed))
    result=interval_union(result)
    question="Реши рациональное неравенство "+expression+" "+op+" 0. Учти область допустимых значений и запиши ответ промежутками."
    sign_changes=[]
    for p in points:
        sign_changes.append(fmt(p)+(" — нуль числителя" if p in zeros else " — нуль знаменателя, точка исключается"))
    steps=[
        "Область допустимых значений: x не равен "+", ".join(fmt(p) for p in poles)+".",
        "Критические точки: "+"; ".join(sign_changes)+".",
        "Расставляем знаки множителей на числовой прямой; знак дроби меняется при переходе через простой нуль или полюс.",
        "Выбираем промежутки, где дробь имеет знак "+op+" 0. "+("Нули числителя включаем, полюса исключаем." if op in ("≤","≥") else "Все нули и полюса исключаем.")+" Ответ: "+(" ∪ ".join(interval_text(p) for p in result) if result else "∅")+".",
    ]
    task=make_set_task("Дробно-рациональное неравенство",question,result,
        ["Сначала выпиши ОДЗ: знаменатель не должен обращаться в ноль.","Нули числителя и знаменателя разделяют прямую на промежутки постоянного знака."],steps,
        {"plan":"Отдельно отметь нули числителя и запрещённые точки знаменателя; затем составь таблицу знаков.","verify":"Подставь по одной контрольной точке с каждого промежутка и проверь знак исходной дроби.","trap":"Точка, обращающая знаменатель в ноль, не входит в ответ даже при нестрогом знаке."})
    source_id=SRC_GENERAL[i]
    add(task,source_id,72,"Неравенства и их системы","rational",56+i)

# 71–85. Intersections of fractional linear inequalities, including empty and singleton cases.
system_bounds=[
    (F(-5),F(4),True,True),(F(-3,2),F(7,3),False,True),(F(2,5),F(9,4),True,False),
    (F(5),F(-2),True,True),(F(-4),F(-4),True,True),(F(-4),F(-4),False,True),
    (F(-7,3),F(1,2),False,False),(F(3,2),F(4),True,True),(F(-6),F(0),True,False),
    (F(2),F(7),True,False),(F(1),F(1),False,False),(F(-2,3),F(8,5),True,True),
    (F(0),F(5,2),False,False),(F(6),F(-1),False,False),(F(-8),F(0),True,True),
]
for i,(lo,hi,li,hi_i) in enumerate(system_bounds):
    parts=[]
    if lo<hi or lo==hi and li and hi_i: parts=[interval(lo,hi,li,hi_i)]
    def inequality_for(bound, is_lower, closed, a, b, m):
        # Keep a positive, so the requested direction remains transparent.
        rhs=(a*bound+b)/m
        op=("≥" if closed else ">") if is_lower else ("≤" if closed else "<")
        return "("+linear(a,b)+")/"+str(m)+" "+op+" "+fmt(rhs), rhs
    a1,b1,m1=[(3,2,5),(4,-3,7),(5,1,8),(2,5,9),(7,-4,11)][i%5]
    a2,b2,m2=[(2,-5,6),(3,4,7),(4,-1,9),(5,2,13),(6,-7,10)][i%5]
    first,rhs1=inequality_for(lo,True,li,a1,b1,m1)
    second,rhs2=inequality_for(hi,False,hi_i,a2,b2,m2)
    question="Реши систему неравенств: { "+first+"; "+second+" }. Найди пересечение решений и запиши его промежутком."
    steps=[
        "Умножаем первое неравенство на "+str(m1)+": "+linear(a1,b1)+" "+("≥ " if li else "> ")+fmt(rhs1*m1)+". После вычитания "+fmt(b1)+": "+linear(a1,0)+" "+("≥ " if li else "> ")+fmt(rhs1*m1-b1)+", значит x "+("≥ " if li else "> ")+fmt(lo)+".",
        "Умножаем второе неравенство на "+str(m2)+": "+linear(a2,b2)+" "+("≤ " if hi_i else "< ")+fmt(rhs2*m2)+". После вычитания "+fmt(b2)+": "+linear(a2,0)+" "+("≤ " if hi_i else "< ")+fmt(rhs2*m2-b2)+", значит x "+("≤ " if hi_i else "< ")+fmt(hi)+".",
        ("Пересекаем лучи: "+interval_text(parts[0])+"." if parts else ("Границы совпали, но хотя бы одна из них не включена; решений нет." if lo==hi else "Левый конец "+fmt(lo)+" правее правого "+fmt(hi)+"; решений нет.")),
        "Ответ: "+(" ∩ ".join([]) if False else (interval_text(parts[0]) if parts else "∅"))+".",
    ]
    task=make_set_task("Система линейных неравенств с дробями",question,parts,
        ["Реши каждое неравенство отдельно: знаменатели здесь положительные.","Общее решение системы — пересечение двух полученных лучей."],steps,
        {"plan":"Сначала найди два луча, затем сравни их границы и аккуратно проверь открытые и закрытые концы.","verify":"Проверь, что выбранное значение удовлетворяет обоим неравенствам; при пустом ответе границы несовместимы.","trap":"Система требует выполнения обоих условий сразу, то есть пересечения, а не объединения."})
    add(task,SRC_SYSTEMS[i],3,"Системы неравенств","systems",71+i)

# 86–100. Set operations on intervals, including rational boundaries and excluded points.
inf=float("inf")
interval_specs=[
    ("∩",[interval(F(-5),F(2),True,True)],[interval(F(-1,2),F(4),True,False)]),
    ("∩",[interval(F(-3),F(1),True,False)],[interval(F(1),F(5),False,True)]),
    ("∪",[interval(-inf,F(1,3),False,True)],[interval(F(1,3),inf,True,False)]),
    ("∪",[interval(F(-4),F(0),True,False)],[interval(F(1,2),F(3),True,True)]),
    ("\\",[interval(F(-5),F(4),True,True)],[interval(F(-2),F(1),False,True)]),
    ("\\",[interval(-inf,F(3,2),False,False)],[interval(F(-2),F(1,2),True,False)]),
    ("∩",[interval(F(-3,2),F(5,2),True,False)],[interval(F(0),F(2),False,True)]),
    ("∪",[interval(F(-7,3),F(-1,2),True,False)],[interval(F(-1,2),F(5,4),True,True)]),
    ("\\",[interval(F(-2),F(5,3),True,True)],[interval(F(-4),F(-1),True,True)]),
    ("∩",[interval(-inf,F(3),False,True)],[interval(F(-2),inf,False,False)]),
    ("\\",[interval(F(0),F(6),True,True)],[interval(F(2),F(4),False,False)]),
    ("∪",[interval(-inf,F(-1),False,False)],[interval(F(2),inf,True,False)]),
    ("∩",[interval(F(1,4),F(7,2),True,True)],[interval(F(1,2),F(5),False,False)]),
    ("\\",[interval(F(-3),F(3),False,True)],[interval(F(-2),F(2),False,True)]),
    ("∪",[interval(F(-5,2),F(1,3),True,True)],[interval(F(1,3),F(3,2),False,False)]),
]
def set_display(parts):
    return " ∪ ".join(interval_text(p) for p in parts) if parts else "∅"

for i,(op,A,B) in enumerate(interval_specs):
    if op=="∩":
        raw=[intersection(a,b) for a in A for b in B]
        result=interval_union([p for p in raw if p])
        verb="пересечение"; expression="A ∩ B"
    elif op=="∪":
        result=interval_union(A+B)
        verb="объединение"; expression="A ∪ B"
    else:
        result=subtract_many(A,B)
        verb="разность"; expression="A \\ B"
    question="Даны промежутки A = "+set_display(A)+" и B = "+set_display(B)+". Найди "+verb+" "+expression+" и запиши результат промежутками."
    if op=="∩":
        plan="Для пересечения оставь только общую часть; граничная точка входит, лишь если её включают оба промежутка."
        why="Пересечение общей части: "+set_display(result)+"."
    elif op=="∪":
        plan="Для объединения собери все точки обоих промежутков и проверь, сливаются ли соседние части на общей включённой границе."
        why="Объединение покрывает все точки A или B: "+set_display(result)+"."
    else:
        plan="В разности A \\ B вычти из A все точки B; граничная точка, не входящая в B, может остаться."
        why="После удаления точек B из A остаётся: "+set_display(result)+"."
    task=make_set_task("Операции с числовыми промежутками",question,result,
        [plan,"Отдельно проверь каждый конец: круглая скобка означает исключённую точку, квадратная — включённую."],
        ["Отметь границы обоих промежутков на числовой прямой.",why,"Ответ: "+set_display(result)+"."],
        {"plan":plan,"verify":"Проверь граничные числа подстановкой в условия принадлежности исходным промежуткам.","trap":"При совпадающих границах один закрытый конец соединяет промежутки, а две открытые скобки оставляют точку-пробел."})
    add(task,SRC_NUMBER[i],51,"Числовые неравенства и координатная прямая","intervals",86+i)

assert len(bank) == 100, len(bank)
assert len({task["id"] for task in bank}) == 100
payload = "/* 100 авторских задач ОГЭ по неравенствам и промежуткам; все дроби записаны математически и отображаются вертикально. */\n(()=>{const bank=" + json.dumps(bank,ensure_ascii=False,separators=(",",":")) + ";for(const item of bank)tasks.push(item)})();\n"
OUT.write_text(payload,encoding="utf-8")
print("Wrote 100 OGE inequality and interval tasks to " + str(OUT))
