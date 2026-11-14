"""Build 100 original grade-nine OGE equation and system exercises."""
import json
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "oge-equations.js"

SRC_LINEAR = [311589,311586,311594,311595,311769,316330,338053,338054,338069,338080,338087,338100,338101,338146,338170,338204,338257,338282,338324,338397,338400,338401,338403,338407,338430,338463,338881,356980,356981,356982,356983,356985,392934,392960,392986,352390,352463,352627,352649,353048,353448,403787,404012,404249,404273]
SRC_QUADRATIC = [111,137,311405,311447,311462,311470,314499,314512,314554,314556,314564,314569,314572,314583,314597]
SRC_RATIONAL = [338483,311381,341402,311393,338482,338541,338591,338605,338683,338688]
SRC_SYSTEMS = [338545,338594,338734,341282,424946,424980,425005,425031,461002,357267,357269,357270,357271,357273,357274,357275,401899,402671,402909,403182,403346,403550,403719,403906,403967,404194,480468,480499,480555,338577]

def F(value):
    return value if isinstance(value, Fraction) else Fraction(value)

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

def affine(constant):
    return "x" + signed(constant)

def scaled(coefficient, expression):
    coefficient = F(coefficient)
    sign = "−" if coefficient < 0 else ""
    magnitude = abs(coefficient)
    prefix = "" if magnitude == 1 else fmt(magnitude)
    return sign + prefix + "(" + expression + ")"

def combine_terms(first, second):
    if second.startswith("−"):
        return first + " − " + second[1:]
    return first + " + " + second

def linear(coefficient, constant):
    coefficient, constant = F(coefficient), F(constant)
    if coefficient == 0:
        return fmt(constant)
    if coefficient.denominator != 1:
        xpart = "(" + fmt(coefficient) + ")x"
    else:
        xpart = ("" if coefficient == 1 else "−" if coefficient == -1 else fmt(coefficient)) + "x"
    return xpart + signed(constant) if constant else xpart

def value_at(coefficient, constant, x):
    return F(coefficient) * F(x) + F(constant)

bank = []

def add(task, source_id, source_category, source_type, group):
    task.update({
        "sourceId": source_id,
        "sourceCategory": source_category,
        "sourceType": source_type,
        "examTopic": "equations",
        "topic": 3,
        "level": 0,
    })
    task["id"] = "oge-" + group + "-" + str(source_id)
    task.update({
        "exam": "oge",
        "domain": "math",
        "grade": 9,
        "subject": "algebra",
        "topicName": "Уравнения и системы",
        "unit": None,
        "challenge": False,
        "goal": "ОГЭ · уравнения и системы",
        "source": {
            "name": "Решу ОГЭ",
            "id": source_id,
            "type": source_type,
            "url": "https://math-oge.sdamgia.ru/problem?id=" + str(source_id),
            "note": "Авторская задача Матклуба по теме из каталога «Решу ОГЭ»; ссылка ведёт к заданию соответствующей категории.",
        },
    })
    bank.append(task)

# 1–25. Linear equations with brackets, negative coefficients, and rational roots.
linear_specs = [
    (1,5,2,3,5,1),(1,-4,2,1,-3,1),(1,6,2,-5,4,1),(1,-2,2,4,-5,1),(1,3,2,-2,7,1),
    (1,-7,2,5,2,1),(1,4,2,1,-6,1),(1,-3,2,-4,8,1),(1,8,2,3,-2,1),(1,-5,2,6,3,1),
    (2,3,1,4,5,1),(2,-6,1,-3,-4,1),(2,5,1,2,7,1),(2,-4,1,7,3,1),(2,2,1,-5,-8,1),
    (2,-3,1,4,9,1),(2,6,1,-2,-1,1),(2,-7,1,3,6,1),(2,4,1,-6,-5,1),(2,-2,1,5,4,1),
    (3,2,2,-4,3,1),(3,-5,2,7,-2,1),(3,6,2,3,5,1),(3,-4,2,-6,1,1),(3,5,2,-3,-3,1),
]
for i, (a,p,b,q,x_num,x_den) in enumerate(linear_specs):
    source_id = SRC_LINEAR[i]
    x = Fraction(x_num, x_den)
    # a(x+p) - b(x-q) = constant; the intended root determines the right side.
    left_a, left_c = Fraction(a-b), Fraction(a*p+b*q)
    right = left_a*x + left_c
    question = "Реши уравнение " + scaled(a,affine(p)) + " = " + scaled(b,affine(-q)) + signed(right) + "."
    moved = right-left_c
    lhs_value = value_at(left_a,left_c,x)
    task = {
        "title": "Уравнение со скобками и переменной по обе стороны",
        "question": question,
        "answer": float(x),
        "hints": ["Раскрой скобки, внимательно сохранив минус перед второй.", "Собери члены с x отдельно от чисел и раздели на коэффициент при x."],
        "steps": [
            "Раскрываем скобки: " + linear(a,a*p) + " = " + linear(b,right-b*q) + ".",
            "Переносим свободное число: " + linear(left_a,0) + " = " + fmt(moved) + ".",
            "Делим на коэффициент при x: x = " + fmt(moved) + " / " + fmt(left_a) + " = " + fmt(x) + ".",
        ],
        "review": {
            "plan": "Раскрой скобки до переноса слагаемых.",
            "verify": "При x = " + fmt(x) + " левая часть исходного уравнения равна " + fmt(lhs_value) + ", как и правая.",
            "trap": "Минус перед скобками меняет знак каждого слагаемого внутри них.",
        },
    }
    add(task,source_id,74,"Уравнения","equations")

# 26–40. Equations with ordinary fractions; coefficients are chosen so every answer is integral.
fraction_specs = [
    (3,4,2,1,5,1),(2,5,-3,4,-2,-1),(4,3,5,-2,7,1),(5,2,-4,3,3,-1),(3,7,1,6,-4,1),
    (6,5,2,-3,8,-1),(4,7,-1,5,-6,1),(5,3,3,2,2,-1),(7,4,-2,1,9,1),(3,5,4,-6,-3,-1),
    (8,3,1,2,4,1),(5,6,-3,-2,6,-1),(4,9,2,7,-5,1),(7,5,3,-4,1,-1),(6,7,-5,3,10,1),
]
for i,(m,n,p,q,x_num,sign) in enumerate(fraction_specs):
    source_id = SRC_LINEAR[25+i]
    x = Fraction(x_num)
    # (x+p)/m + sign*(x-q)/n = rhs.
    rhs = (x+p)/m + sign*(x-q)/n
    lcm = m*n
    coef = n + sign*m
    const = n*p - sign*m*q
    reduced_rhs = rhs*lcm-const
    sign_text = " + " if sign == 1 else " − "
    question = "Реши уравнение (" + affine(p) + ")/" + str(m) + sign_text + "(" + affine(-q) + ")/" + str(n) + " = " + fmt(rhs) + "."
    task = {
        "title": "Уравнение с дробными коэффициентами",
        "question": question,
        "answer": float(x),
        "hints": ["Умножь обе части на общий знаменатель " + str(lcm) + ".", "После раскрытия скобок собери коэффициенты при x."],
        "steps": [
            "Умножаем обе части на " + str(lcm) + ": " + str(n) + "(" + affine(p) + ")" + sign_text + str(m) + "(" + affine(-q) + ") = " + fmt(rhs*lcm) + ".",
            "Раскрываем скобки и приводим подобные: " + linear(coef,const) + " = " + fmt(rhs*lcm) + ".",
            "Переносим число: " + linear(coef,0) + " = " + fmt(reduced_rhs) + ", поэтому x = " + fmt(reduced_rhs) + "/" + fmt(coef) + " = " + fmt(x) + ".",
        ],
        "review": {
            "plan": "Сначала избавься от знаменателей, умножив всё уравнение на их общий кратный.",
            "verify": "Подстановка x = " + fmt(x) + " в левую часть даёт " + fmt(rhs) + ".",
            "trap": "Общий знаменатель должен умножать каждое слагаемое обеих частей уравнения.",
        },
    }
    add(task,source_id,74,"Уравнения","equations")

# 41–55. Quadratics: two roots, a repeated root, and an empty real solution set.
quadratic_roots = [(-8,3),(-7,2),(-5,-2),(4,4),(-3,6),(-2,5),(-1,7),(0,6),(1,8),(2,9),(3,10),(-6,1),(-2,-7),(4,7),(None,None)]
for i,pair in enumerate(quadratic_roots):
    source_id = SRC_QUADRATIC[i]
    if pair == (None,None):
        b,c = 2,5
        roots = []
    else:
        r1,r2 = pair
        b,c = -(r1+r2),r1*r2
        roots = sorted(set([r1,r2]))
    polynomial = "x²" + ("" if b == 0 else (" + " if b>0 else " − ")+ ("x" if abs(b)==1 else str(abs(b))+"x")) + (" + "+str(c) if c>0 else " − "+str(abs(c)) if c<0 else "")
    discriminant = b*b-4*c
    if discriminant < 0:
        steps = ["Вычисляем дискриминант: D = ("+str(b)+")² − 4·1·("+str(c)+") = "+str(discriminant)+".","Так как D < 0, квадратное уравнение не имеет действительных корней.","Ответ: действительных решений нет."]
        answer_set = []
        verify = "Дискриминант отрицателен, поэтому действительных корней нет."
    else:
        root_text = "; ".join(fmt(r) for r in roots)
        steps = ["Вычисляем дискриминант: D = ("+str(b)+")² − 4·1·("+str(c)+") = "+str(discriminant)+"."]
        if discriminant == 0:
            steps += ["Корень один: x = −b/2 = "+fmt(roots[0])+".","Подстановка в исходное уравнение даёт ноль."]
        else:
            steps += ["По формуле корней x = (−b ± √D)/2 = "+root_text+".","Проверка разложением: "+polynomial+" = (x − ("+fmt(r1)+"))(x − ("+fmt(r2)+"))."]
        answer_set = [[r,r,True,True] for r in roots]
        verify = "Подстановка каждого из корней "+root_text+" в исходное уравнение даёт ноль."
    task = {
        "title": "Квадратное уравнение и проверка корней",
        "question": "Реши уравнение " + polynomial + " = 0. Запиши все действительные корни.",
        "answerType": "set",
        "answerSet": answer_set,
        "hints": ["Приведи уравнение к виду x² + bx + c = 0 и найди дискриминант.","Если дискриминант неотрицателен, найди оба значения по формуле и проверь подстановкой."],
        "steps": steps,
        "review": {"plan":"Сравни дискриминант с нулём до вычисления корней.","verify":verify,"trap":"При D = 0 корень один; при D < 0 действительных корней нет."},
    }
    add(task,source_id,43,"Квадратные уравнения","equations")

# 56–65. Rational equations; every excluded denominator value is checked explicitly.
rational_specs = [(3,1,4),(-2,5,1),(5,-3,6),(1,4,-2),(-4,2,7),(6,3,-1),(2,-5,4),(-3,6,2),(4,-2,9),(-5,3,-4)]
for i,(p,d,x_value) in enumerate(rational_specs):
    source_id = SRC_RATIONAL[i]
    x = Fraction(x_value)
    multiplier = Fraction(x+p,x-d)
    # Avoid a degenerate equation whose variable terms cancel.
    assert multiplier != 1 and x != d
    denominator = affine(-d)
    question = "Реши уравнение (" + affine(p) + ")/(" + denominator + ") = " + fmt(multiplier) + "."
    value = Fraction(x+p,x-d)
    coeff = 1-multiplier
    constant = -multiplier*d-p
    task = {
        "title": "Дробно-рациональное уравнение и ОДЗ",
        "question": question,
        "answer": float(x),
        "hints": ["Сначала найди запрещённое значение знаменателя.","После умножения на знаменатель реши линейное уравнение и проверь, что корень допустим."],
        "steps": [
            "Область допустимых значений: x ≠ " + fmt(d) + ".",
            "Умножаем обе части на (" + denominator + "): " + affine(p) + " = " + fmt(multiplier) + "(" + denominator + ").",
            "Собираем x: " + linear(coeff,0) + " = " + fmt(constant) + ". Делим на коэффициент при x и получаем x = " + fmt(x) + ". Корень не запрещён.",
        ],
        "review": {"plan":"До преобразований запиши ОДЗ, затем подставь корень в исходное уравнение.","verify":"Знаменатель при x = "+fmt(x)+" не равен нулю; левая часть равна "+fmt(value)+".","trap":"Корень, обращающий знаменатель в ноль, не является решением исходного уравнения."},
    }
    add(task,source_id,45,"Рациональные уравнения","equations")

# 66–70. Radicals: isolate the root, square, and reject extraneous roots.
radical_specs = [
    (2,7,5,"sqrt-linear"),(3,-2,5,"sqrt-linear"),(4,1,3,"sqrt-linear"),(1,10,2,"sqrt-shift"),(2,7,1,"sqrt-both-sides"),
]
for i,(a,b,c,kind) in enumerate(radical_specs):
    source_id = SRC_LINEAR[40+i]
    if kind == "sqrt-linear":
        x = Fraction(c*c-b,a)
        question = "Реши уравнение √("+str(a)+"x "+("+ " if b>=0 else "− ")+str(abs(b))+ ") = "+str(c)+"."
        steps = ["Подкоренное выражение должно быть неотрицательным.","Возводим обе части в квадрат: "+str(a)+"x "+("+ " if b>=0 else "− ")+str(abs(b))+" = "+str(c*c)+".","Получаем x = "+fmt(x)+". Проверка: подстановка даёт √("+str(c*c)+") = "+str(c)+"."]
        verify = "При x = "+fmt(x)+" подкоренное выражение равно "+str(c*c)+", поэтому левая часть равна "+str(c)+"."
    elif kind == "sqrt-shift":
        x = Fraction((c+b)**2-10)
        # Equation is sqrt(x+10)+b=c; this chosen row yields an integer root.
        question = "Реши уравнение √(x + 10) + "+str(b)+" = "+str(c+ b)+"."
        # Keep the intended equation √(x+10)+2=8.
        x = Fraction((6)**2-10)
        question = "Реши уравнение √(x + 10) + 2 = 8."
        steps = ["Область допустимых значений: x ≥ −10.","Изолируем корень: √(x + 10) = 6.","Возводим в квадрат: x + 10 = 36, поэтому x = 26.","Проверка: √36 + 2 = 8."]
        verify = "При x = 26 левая часть равна √36 + 2 = 8."
    else:
        # sqrt(2x+7)=x+2 gives roots -3 and 1 after squaring; only 1 survives.
        x = Fraction(1)
        question = "Реши уравнение √(2x + 7) = x + 2."
        steps = ["ОДЗ включает x + 2 ≥ 0 и 2x + 7 ≥ 0, значит x ≥ −2.","После возведения в квадрат: 2x + 7 = (x + 2)², то есть x² + 2x − 3 = 0.","Квадратное уравнение даёт x = 1 и x = −3.","Число −3 нарушает условие x ≥ −2. Проверка x = 1: √9 = 3."]
        verify = "x = 1 удовлетворяет исходному уравнению; корень −3 возник после возведения в квадрат и не подходит."
    task = {
        "title": "Иррациональное уравнение с обязательной проверкой",
        "question": question,
        "answer": float(x),
        "hints": ["Запиши область допустимых значений до возведения в квадрат.","После возведения в квадрат подставь найденные корни в исходное уравнение."],
        "steps": steps,
        "review": {"plan":"Сохраняй условие неотрицательности и проверяй полученные корни в исходном уравнении.","verify":verify,"trap":"Возведение в квадрат может добавить посторонний корень."},
    }
    add(task,source_id,74,"Уравнения","equations")

# 71–100. Linear systems with varied coefficient signs and exact integer solutions.
system_matrices = [(2,3,1,-1),(3,-2,2,1),(4,1,-1,3),(1,-4,3,2),(5,2,1,-3),(2,-5,4,1),(3,4,-2,1),(4,-3,1,2),(5,-1,2,3),(1,5,-3,2)]
system_solutions = [(2,3),(-1,4),(5,-2),(-3,-2),(4,1),(2,-5),(-4,3),(1,6),(3,-4),(-2,5),(6,2),(-5,1),(2,7),(4,-3),(-6,-2),(3,5),(-2,-6),(7,1),(1,-7),(-4,-5),(5,4),(-7,2),(6,-3),(2,-8),(-3,7),(8,2),(-5,-4),(4,6),(-8,1),(7,-2)]
for i,((a,b,c,d),(x,y)) in enumerate(zip([system_matrices[j%len(system_matrices)] for j in range(30)],system_solutions)):
    source_id = SRC_SYSTEMS[i]
    first,second = a*x+b*y,c*x+d*y
    det = a*d-b*c
    assert det != 0
    y_num = a*second-c*first
    y_den = det
    x_num = first-b*y
    question = "Реши систему уравнений: { " + linear(a*x if False else a,0) + " + " + ("" if b==1 else "−" if b==-1 else str(abs(b))) + "y = " + str(first) + "; " + linear(c,0) + " + " + ("" if d==1 else "−" if d==-1 else str(abs(d))) + "y = " + str(second) + ". Запиши пару (x; y)."
    # Build signed coefficient text without ambiguous '+ -'.
    def term_y(k):
        if k == 0: return ""
        mag = "" if abs(k)==1 else str(abs(k))
        return (" + " if k>0 else " − ")+mag+"y"
    first_eq = linear(a,0)+term_y(b)+" = "+str(first)
    second_eq = linear(c,0)+term_y(d)+" = "+str(second)
    question = "Реши систему уравнений: { " + first_eq + "; " + second_eq + " }. Запиши пару (x; y)."
    # Eliminate x by multiplying the first equation by c and the second by a.
    combined_y = det
    combined_rhs = a*second-c*first
    task = {
        "title": "Система линейных уравнений: исключение переменной",
        "question": question,
        "answer": [float(x),float(y)],
        "hints": ["Умножь уравнения так, чтобы коэффициенты при x стали одинаковыми.","Вычти уравнения, найди y и подставь его в более простое уравнение."],
        "steps": [
            "Умножаем первое уравнение на "+str(c)+", второе — на "+str(a)+", затем вычитаем первое из второго.",
            "Получаем "+str(combined_y)+"y = "+str(combined_rhs)+", поэтому y = "+fmt(y)+".",
            "Подставляем в первое уравнение: "+linear(a,0)+(" + " if b*y>=0 else " − ")+fmt(abs(b*y))+" = "+str(first)+", поэтому x = "+fmt(x)+".",
            "Ответ: ("+fmt(x)+"; "+fmt(y)+"). Подстановка в оба уравнения подтверждает пару.",
        ],
        "review": {"plan":"Сделай коэффициенты при одной переменной противоположными и сложи уравнения.","verify":"Подстановка ("+fmt(x)+"; "+fmt(y)+") даёт соответственно "+str(first)+" и "+str(second)+".","trap":"Умножая уравнение на число, умножай на него каждый член, включая правую часть."},
    }
    add(task,source_id,21,"Системы уравнений","systems")

assert len(bank) == 100
payload = "/* 100 авторских задач ОГЭ: уравнения, дробно-рациональные уравнения и системы. */\n(()=>{const bank=" + json.dumps(bank,ensure_ascii=False,separators=(",",":")) + ";for(const item of bank)tasks.push(item)})();\n"
OUT.write_text(payload,encoding="utf-8")
print("Wrote 100 OGE equation and system tasks to " + str(OUT))
