/* Общая логика математических пробников и задачи профильного ЕГЭ-2027. */
window.mountMathExam = function({key, templates, shortCount, sharedCount=0, renderShared}) {
  const button = document.getElementById('open'+key[0].toUpperCase()+key.slice(1)+'Variant');
  const dialog = document.getElementById(key+'VariantDialog');
  const clock = document.getElementById(key+'VariantClock');
  const short = document.getElementById(key+'VariantShort');
  const long = document.getElementById(key+'VariantLong');
  const form = document.getElementById(key+'VariantForm');
  const finish = document.getElementById(key+'VariantFinish');
  const restart = document.getElementById(key+'VariantRestart');
  const result = document.getElementById(key+'VariantResult');
  const storageKey = 'matclub-'+key+'-practice-2027-v1';
  const duration = 235 * 60_000;
  let attempt;
  let timer;

  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.seeds) && saved.seeds.length === templates.length &&
        saved.seeds.every(n => Number.isInteger(n) && n >= 2 && n <= 24) &&
        Array.isArray(saved.answers) && saved.answers.length === templates.length &&
        saved.answers.every(a=>typeof a === 'string') && Number.isFinite(saved.deadline)) attempt = saved;
  } catch {}

  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify(attempt)); } catch {}
  }

  function buildTask(index) {
    const [title, generate] = templates[index];
    const [question, answer, explanation, figure] = generate(attempt.seeds[index]);
    return {id: key+'-practice-'+(index+1), title, question, answer, explanation, figure};
  }

  function matches(expected, input) {
    if (!input.trim()) return false;
    const parsed = parseAnswer(input);
    return Number.isFinite(parsed) && Math.abs(parsed-expected) <= 1e-10;
  }

  function buildRow(index) {
    const task = buildTask(index);
    const row = document.createElement('li');
    const heading = document.createElement('strong');
    heading.textContent = task.title;
    const question = document.createElement('p');
    question.textContent = task.question;
    row.append(heading, question);
    if (task.figure) row.insertAdjacentHTML('beforeend', egeFigure(task));

    const input = document.createElement(index < shortCount ? 'input' : 'textarea');
    input.id = task.id + '-answer';
    input.dataset.taskIndex = index;
    input.autocomplete = 'off';
    input.maxLength = index < shortCount ? 40 : 8000;
    if (index < shortCount) input.inputMode = 'decimal';
    else input.rows = 3;
    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = (index < shortCount ? 'Ответ' : 'Решение') + ' № ' + (index+1);
    input.value = attempt.answers[index];
    input.disabled = attempt.finished;
    row.append(label,input);
    if (attempt.finished) {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = index < shortCount
        ? (matches(task.answer, input.value) ? 'Верно · разбор' : 'Ответ и разбор')
        : 'Разбор для самопроверки';
      const explanation = document.createElement('p');
      explanation.textContent = task.explanation;
      details.append(summary,explanation);
      row.append(details);
    }
    return row;
  }

  function render() {
    if (renderShared) renderShared(attempt.seeds[0]);
    const rows = templates.map((_,index)=>buildRow(index));
    short.replaceChildren(...rows.slice(0,shortCount));
    long.replaceChildren(...rows.slice(shortCount));
    finish.hidden = attempt.finished;
    restart.hidden = !attempt.finished;
    result.hidden = !attempt.finished;
    if (attempt.finished) {
      const correct = templates.slice(0,shortCount).filter((_,index)=>matches(buildTask(index).answer,attempt.answers[index])).length;
      result.textContent = 'Часть 1: '+correct+' из '+shortCount+'. Часть 2: сравни свои решения с разборами.';
    }
  }

  function updateTime() {
    const seconds = Math.max(0, Math.ceil((attempt.deadline-Date.now())/1000));
    if (attempt.finished) {
      clock.textContent = 'Завершено';
      return;
    }
    const segments = [Math.floor(seconds/3600), Math.floor(seconds/60)%60, seconds%60];
    clock.textContent = segments.map(value=>String(value).padStart(2,'0')).join(':');
    if (!seconds) complete();
  }

  function complete() {
    attempt.finished = true;
    save();
    clearInterval(timer);
    button.textContent = 'Открыть результат';
    updateTime();
    render();
    result.focus();
  }

  function start() {
    const draws = crypto.getRandomValues(new Uint32Array(templates.length));
    const seeds = templates.map(([, generate],index)=>{
      const before = attempt && generate(attempt.seeds[index]);
      const choices = Array.from({length:23},(_,i)=>i+2).filter(n=>{
        if (!before) return true;
        const next = generate(n);
        return next[0] !== before[0] || next[1] !== before[1] || n !== attempt.seeds[index] && (index < sharedCount || JSON.stringify(next[3]) !== JSON.stringify(before[3]));
      });
      return choices[draws[index]%choices.length];
    });
    if (sharedCount) seeds.fill(seeds[0],0,sharedCount);
    attempt = {seeds, answers:Array(templates.length).fill(''), deadline:Date.now()+duration, finished:false};
    save();
  }

  function show() {
    render();
    clearInterval(timer);
    updateTime();
    if (!attempt.finished) timer = setInterval(updateTime,1000);
    button.textContent = attempt.finished ? 'Открыть результат' : 'Продолжить вариант';
  }

  if (attempt) button.textContent = attempt.finished ? 'Открыть результат' : 'Продолжить вариант';
  button.addEventListener('click',()=>{
    if (!attempt) start();
    dialog.showModal();
    show();
  });
  form.addEventListener('input',event=>{
    if (attempt.finished || !event.target.matches('[data-task-index]')) return;
    if (Date.now() >= attempt.deadline) {
      updateTime();
      return;
    }
    attempt.answers[Number(event.target.dataset.taskIndex)] = event.target.value;
    save();
  });
  form.addEventListener('submit',event=>event.preventDefault());
  finish.addEventListener('click',()=>{
    if (!attempt.finished) complete();
  });
  restart.addEventListener('click',()=>{
    start();
    show();
    dialog.scrollTop = 0;
  });
  dialog.addEventListener('close',()=>clearInterval(timer));
};

(() => {
  const shape = (caption, coords, edges) => ({geometry:{
    caption,
    points:coords.map(([id,x,y,label])=>({id,x,y,label:label ?? id})),
    segments:edges.map(([from,to,style])=>({from,to,style}))
  }});
  const triangle = shape('Прямоугольный треугольник ABC, прямой угол при C.', [
    ['A',110,250],['B',430,10],['C',430,250]
  ], [['A','C'],['C','B'],['A','B']]);
  const prism = shape('Прямоугольный параллелепипед. Схема без масштаба.', [
    ['A',95,255],['B',380,255],['C',500,205],['D',215,205],
    ['E',95,105,'A₁'],['F',380,105,'B₁'],['G',500,55,'C₁'],['H',215,55,'D₁']
  ], [['A','B'],['B','C'],['C','D','parallel'],['D','A','parallel'],['E','F'],['F','G'],
    ['G','H'],['H','E'],['A','E'],['B','F'],['C','G'],['D','H','parallel'],['A','G','parallel']]);
  const trapezoid = shape('E и F — середины боковых сторон. Схема без масштаба.', [
    ['A',100,245],['B',220,85],['C',400,85],['D',520,245],['E',160,165],['F',460,165]
  ], [['A','B'],['B','C'],['C','D'],['D','A'],['E','F']]);
  const templates = [
    ['Планиметрия', n=>[
      `В прямоугольном треугольнике ABC катеты AC и BC равны ${4*n} и ${3*n}. Найди радиус описанной окружности.`,
      2.5*n,`По теореме Пифагора AB = ${5*n}. Центр окружности — середина гипотенузы, поэтому R = AB/2 = ${2.5*n}.`,triangle]],
    ['Векторы', n=>[
      `Даны векторы a = (${n}; −2) и b = (3; ${n+1}). Найди их скалярное произведение.`,n-2,
      `Складываем произведения соответствующих координат: a·b = 3·${n} − 2·${n+1} = ${n-2}.`]],
    ['Стереометрия', n=>[
      `Рёбра прямоугольного параллелепипеда, выходящие из одной вершины, равны ${n}, ${n+1} и 6. Найди объём.`,
      6*n*(n+1),`Объём равен произведению трёх измерений: V = ${n}·${n+1}·6 = ${6*n*(n+1)}.`,prism]],
    ['Простая вероятность', n=>[
      `Из 25 одинаковых с виду карточек ${n} отмечены буквой A. Какова вероятность вытащить карточку с A при случайном выборе одной карточки?`,
      n/25,`Все 25 исходов равновероятны, благоприятных ${n}. Вероятность равна ${n}/25 = ${n/25}.`]],
    ['Сложные события', n=>[
      `Вероятность попадания при одном выстреле равна ${(n+25)/50}. Стрелок делает два независимых выстрела. Найди вероятность ровно одного попадания.`,
      2*((n+25)/50)*(1-(n+25)/50),`Возможны попадание и промах либо промах и попадание. Сложи их вероятности: 2p(1 − p) = ${Number((2*((n+25)/50)*(1-(n+25)/50)).toFixed(4))}.`]],
    ['Уравнение', n=>[
      `Реши уравнение log₂(x + ${n}) = ${2+n%4}.`,2**(2+n%4)-n,
      `Переходим к степени: x + ${n} = 2^${2+n%4} = ${2**(2+n%4)}. Отсюда x = ${2**(2+n%4)-n}, и аргумент логарифма положителен.`]],
    ['Вычисления и преобразования', n=>[
      `Найди значение выражения (√${9*n*n} − √${4*n*n})²/${n}.`,n,
      `Корни равны ${3*n} и ${2*n}. Разность равна ${n}, поэтому значение выражения равно ${n}²/${n} = ${n}.`]],
    ['Производная', n=>[
      `Функция f(x) = x³ − ${n}x² + 7. Найди значение производной f′ в точке x = 2.`,12-4*n,
      `f′(x) = 3x² − ${2*n}x. Подставляем x = 2 и получаем 12 − ${4*n} = ${12-4*n}.`]],
    ['Прикладная задача', n=>[
      `Количество воды в баке описывается формулой V = ${5*n+40} − 5t, где V выражено в литрах, а t — в минутах. Через сколько минут в баке останется 40 л?`,
      n,`Подставляем остаток в формулу: 40 = ${5*n+40} − 5t. Отсюда t = ${5*n}/5 = ${n} мин.`]],
    ['Текстовая задача', n=>[
      `Турист прошёл ${6*n} км. Первую половину пути он шёл со скоростью 3 км/ч, вторую — со скоростью 6 км/ч. Сколько часов заняла дорога?`,1.5*n,
      `Каждая половина равна ${3*n} км. Время t = ${3*n}/3 + ${3*n}/6 = ${1.5*n} ч.`]],
    ['Графики функций', n=>[
      `На рисунке показана прямая y = kx + b. Отмеченные точки имеют координаты A(0; ${n-2}) и B(2; ${n-2+2*(n%4+1)}). Найди k.`,
      n%4+1,`Раздели приращение y на приращение x: k = ${2*(n%4+1)}/2 = ${n%4+1}.`,
      {range:[-2,3,-8,37], xStep:1,yStep:5,curves:[{kind:'line',parameters:[n%4+1,n-2]}],
        points:[{x:0,y:n-2,label:'A'},{x:2,y:n-2+2*(n%4+1),label:'B'}]}]],
    ['Наибольшее значение функции', n=>[
      `Найди наибольшее значение f(x) = ${n*n+4} − (x − ${n})² на отрезке [0; ${n+2}].`,n*n+4,
      `Квадрат неотрицателен и равен нулю при x = ${n}, который входит в отрезок. Максимум равен ${n*n+4}.`]],
    ['Уравнение с отбором корней', n=>[
      `а) Реши 2cos² x − cos x − 1 = 0. б) Отбери корни на отрезке [${2*n}π; ${2*n+1}π].`,null,
      `Пусть z = cos x. Тогда (2z + 1)(z − 1) = 0. Отсюда x = 2πk или x = ±2π/3 + 2πk, k ∈ ℤ. На заданном отрезке подходят ${2*n}π и ${6*n+2}π/3.`]],
    ['Стереометрия с обоснованием', n=>[
      `В прямоугольном параллелепипеде ABCDA₁B₁C₁D₁ рёбра AB = ${3*n}, BC = ${4*n}, CC₁ = ${5*n}. а) Докажи, что проекция AC₁ на плоскость основания — AC. б) Найди угол между AC₁ и основанием.`,null,
      `A лежит в основании, а CC₁ перпендикулярно основанию, поэтому проекция C₁ — C. Искомый угол — ∠CAC₁. Диагональ AC = √(AB² + BC²) = ${5*n}. В прямоугольном треугольнике ACC₁ катеты равны, значит ∠CAC₁ = 45°.`,prism]],
    ['Неравенство', n=>[
      `Реши неравенство (x − ${n})(x + 2)/(x − ${n+2}) ≥ 0.`,null,
      `Критические точки −2, ${n} и ${n+2}. Последняя исключается из ОДЗ. Знаки дроби слева направо: минус, плюс, минус, плюс. Нули числителя входят в ответ: [−2; ${n}] ∪ (${n+2}; +∞).`]],
    ['Экономическая задача', n=>[
      `Кредит ${10*n} тыс. рублей берут на два года под 10% годовых. В конце каждого года банк сначала начисляет проценты на остаток долга, затем заёмщик вносит платёж. После первого платежа долг составляет половину начальной суммы. Найди общую сумму платежей в тысячах рублей и обоснуй ответ.`,null,
      `После первого начисления долг равен ${11*n} тыс., после выплаты остаётся ${5*n} тыс. Первый платёж составляет ${6*n} тыс. Второй закрывает остаток с процентами: ${5*n}·1,1 = ${5.5*n} тыс. Итого ${11.5*n} тыс. рублей.`]],
    ['Планиметрия с доказательством', n=>[
      `В равнобедренной трапеции ABCD основания AD и BC равны ${7*n} и ${3*n}, боковые стороны равны ${3*n}. E и F — середины AB и CD. а) Докажи, что EF параллельна основаниям. б) Найди площадь трапеции.`,null,
      `Прямая через E, параллельная основаниям, делит CD пополам по теореме Фалеса, значит проходит через F. Проекция боковой стороны на большее основание равна (${7*n} − ${3*n})/2 = ${2*n}. Высота равна ${n}√5. Площадь — полусумма оснований, умноженная на высоту: ${5*n*n}√5.`,trapezoid]],
    ['Параметр', n=>[
      `Найди все a, при которых уравнение |x² − ${n*n}| = a имеет ровно три различных действительных корня.`,null,
      `При a < 0 решений нет, при a = 0 их два: ±${n}. При a > 0 первая ветвь x² = ${n*n} + a даёт два корня, а вторая x² = ${n*n} − a даёт два, один или ноль корней. Ровно один дополнительный корень появляется только при a = ${n*n}.`]],
    ['Числа и их свойства', n=>[
      `Записано ${2*n+1} различных натуральных чисел. Любые два из них дают разные остатки при делении на ${2*n+1}. а) Может ли их сумма делиться на ${2*n+1}? б) Может ли сумма давать остаток 1? в) Найди наименьшую возможную сумму.`,null,
      `Присутствуют все остатки от 0 до ${2*n}. Их сумма равна ${n}·${2*n+1}, то есть делится на ${2*n+1}. Поэтому а) да, б) нет. Минимальный положительный представитель нулевого класса — ${2*n+1}, а остальных классов — их остатки. Набор 1, …, ${2*n+1} даёт минимум ${(2*n+1)*(n+1)}.`]]
  ];

  window.mountMathExam({key:'ege', templates, shortCount:12});
})();
