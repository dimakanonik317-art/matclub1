/* MatКлуб · навигация издания и интерактивные научные иллюстрации. */
(()=>{
 document.body.classList.add('workbench-shell');
 const svg=(body,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${body}</svg>`;
 const mark=svg('<path d="M2 19 8.5 4 15 19H2Zm7-2L15.5 3 22 19h-5M5 15h8"/>','wb-mark');
 const brand=document.querySelector('.brand');if(brand)brand.innerHTML=mark+'<span class="wb-wordmark">МатКлуб<span></span></span>';
 const crumb=document.querySelector('.crumb');if(crumb)crumb.innerHTML='<span class="wb-workspace-dot" aria-hidden="true"></span>Учебная среда <span>/</span><b id="breadcrumb">Каталог тем</b>';
 const search=document.querySelector('#search');if(search)search.placeholder='Поиск по каталогу';
 const kbd=document.querySelector('.search kbd');if(kbd)kbd.textContent='/';
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!document.querySelector('dialog[open]')&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)&&!document.activeElement?.isContentEditable){e.preventDefault();search?.focus();}});
 const assistant = document.querySelector('#aiLaunch');
 if (assistant) {
   assistant.innerHTML = svg('<path d="M4.5 6.5 12 3l7.5 3.5v9L12 19l-4 2v-4l-3.5-1.5z"/><path d="m8 9 4 2 4-2m-4 2v4"/>', 'assistant-glyph')
     + '<span class="assistant-label">ИИ-помощник</span>';
   assistant.setAttribute('aria-keyshortcuts','Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight Alt+Home');
 }
  const hero = document.querySelector('.hero');
  const art = hero.querySelector('.hero-art');
  const header = document.querySelector('.main > header');
  const domainNav = document.querySelector('.domain-switch');
  const domainHome = document.createComment('subject navigation');
  domainNav.before(domainHome);
  const wide = matchMedia('(min-width: 1080px)');
  function placeSubjects() {
    if (wide.matches) header.insertBefore(domainNav, header.querySelector('.search'));
    else domainHome.after(domainNav);
  }
  wide.addEventListener('change', placeSubjects);
  placeSubjects();

  const note = document.querySelector('.curriculum-note');
  const syllabus = document.createElement('details');
  syllabus.className = 'syllabus-note';
  const summary = document.createElement('summary');
  summary.textContent = 'О программе';
  note.before(syllabus);
  syllabus.append(summary, note);

  const pointOnWave = degree => {
    const angle = degree * Math.PI / 180;
    return [189 + degree * 330 / 360, 101 - 61 * Math.sin(angle)];
  };
  const wave = Array.from({length: 181}, (_, i) => pointOnWave(i * 2).join(',')).join(' ');
  art.innerHTML = `
    <figure class="phase-plate" aria-labelledby="phase-title">
      <figcaption>
        <div><small>Тригонометрия</small><strong id="phase-title">Как строится синусоида</strong></div>
        <span class="phase-formula">y = sin θ</span>
      </figcaption>
      <div class="drawing-field">
      <svg class="phase-chart" viewBox="0 0 556 218" role="img" aria-label="Высота вращающейся точки равна значению синуса для выбранного угла">
        <defs><pattern id="phase-grid" width="20.625" height="15.25" x="189" y="101" patternUnits="userSpaceOnUse"><path d="M20.625 0H0V15.25" fill="none" stroke="currentColor" opacity=".10"/></pattern><clipPath id="phase-window"><rect x="189" y="10" width="0" height="170"/></clipPath></defs>
        <rect x="2" y="8" width="552" height="176" fill="url(#phase-grid)"/>
        <g fill="none" stroke="currentColor" opacity=".46" stroke-width="1"><path d="M12 101H158 M85 174V23 M178 101H535 M189 173V23"/></g>
        <path class="axis-ticks" d="M189 98v6m82.5-6v6m82.5-6v6m82.5-6v6m82.5-6v6M186 40h6m-6 122h6"/>
        <g class="phase-labels"><text x="149" y="118">x</text><text x="94" y="32">y</text><text x="180" y="121">0</text><text x="165" y="44">1</text><text x="156" y="166">−1</text><text text-anchor="middle" x="271.5" y="124">π/2</text><text text-anchor="middle" x="354" y="124">π</text><text text-anchor="middle" x="436.5" y="124">3π/2</text><text text-anchor="middle" x="519" y="124">2π</text><text x="536" y="105">θ</text></g>
        <g class="phase-labels phase-legend"><text x="85" y="207" text-anchor="middle">(cos θ, sin θ)</text><text x="354" y="207" text-anchor="middle">График y = sin θ</text></g>
        <circle class="phase-ring" cx="85" cy="101" r="61" pathLength="1"/>
        <polyline class="phase-wave" pathLength="1" points="${wave}"/>
        <polyline class="phase-trace" clip-path="url(#phase-window)" points="${wave}"/>
        <path class="angle-sector"/><path class="phase-radius"/><path class="phase-guide"/>
        <circle id="wbOrbitPoint" class="phase-pin" r="4.5"/><circle id="wbSignalPoint" class="phase-sample" r="4.5"/>
      </svg>
      <svg class="optics-chart" viewBox="0 0 556 218" role="img" aria-label="Два луча от вершины предмета пересекаются в действительном перевёрнутом изображении за собирающей линзой" hidden>
        <defs><pattern id="lens-grid" width="27.5" height="18" x="286" y="109" patternUnits="userSpaceOnUse"><path d="M27.5 0H0V18" fill="none" stroke="currentColor" opacity=".1"/></pattern></defs>
        <rect x="2" y="8" width="552" height="176" fill="url(#lens-grid)"/>
        <path class="optics-axis" d="M8 109H546M176 104v10m55-10v10m110-10v10m55-10v10"/>
        <path class="optics-lens" d="M286 21Q303 109 286 186Q269 109 286 21Z"/>
        <g class="phase-labels" text-anchor="middle"><text x="176" y="136">2F</text><text x="231" y="136">F</text><text x="341" y="136">F</text><text x="396" y="136">2F</text></g>
        <path class="optics-ray parallel"/><path class="optics-ray central"/>
        <path class="optics-object"/><path class="optics-image"/>
        <g class="phase-labels phase-legend" text-anchor="middle"><text x="126" y="207">Предмет</text><text x="286" y="207">Линза</text><text x="422" y="207">Изображение</text></g>
      </svg>
      </div><div class="phase-controls">
        <button type="button" id="wbPlay" aria-pressed="false" aria-label="Запустить модель"><span aria-hidden="true">▶</span></button>
        <label for="wbAngle">Угол θ</label>
        <input id="wbAngle" type="range" min="0" max="360" step="1" value="45">
        <output id="wbDegree" for="wbAngle" aria-live="off">45°</output>
      </div>
      <div class="phase-values"><span><b id="measure-a">cos θ</b> <output id="wbCos" aria-live="off">0,707</output></span><span><b id="measure-b">sin θ</b> <output id="wbSin" aria-live="off">0,707</output></span></div>
    </figure>`;

  const range = art.querySelector('#wbAngle');
  const play = art.querySelector('#wbPlay');
  const radius = art.querySelector('.phase-radius');
  const guide = art.querySelector('.phase-guide');
  const trace = art.querySelector('#phase-window rect');
  const pin = art.querySelector('.phase-pin');
  const sample = art.querySelector('.phase-sample');
  const degrees = art.querySelector('#wbDegree');
  const cos = art.querySelector('#wbCos');
  const sin = art.querySelector('#wbSin');
  const format = new Intl.NumberFormat('ru', {maximumFractionDigits: 3, minimumFractionDigits: 3});
  const sector = art.querySelector('.angle-sector');
  const rays = art.querySelector('.optics-chart');
  const parallel = rays.querySelector('.parallel');
  const central = rays.querySelector('.central');
  const objectArrow = rays.querySelector('.optics-object');
  const imageArrow = rays.querySelector('.optics-image');
  let optics = false;
  let angle = 135;
  function drawLens(distance) {
    // The optical axis uses 5.5 SVG units per cm. Focal length is 10 cm.
    const imageDistance = 10 * distance / (distance - 10);
    const objectX = 286 - 5.5 * distance, imageX = 286 + 5.5 * imageDistance;
    const imageY = 109 + 27 * imageDistance / distance;
    parallel.setAttribute('d', `M${objectX} 82H286L${imageX} ${imageY}`);
    central.setAttribute('d', `M${objectX} 82L${imageX} ${imageY}`);
    objectArrow.setAttribute('d', `M${objectX} 109V82m-4 6 4-6 4 6`);
    imageArrow.setAttribute('d', `M${imageX} 109V${imageY}m-4-6 4 6 4-6`);
    degrees.textContent = distance.toFixed(1).replace('.',',') + ' см';
    cos.textContent = '10 см';
    sin.textContent = imageDistance.toFixed(1).replace('.',',') + ' см';
  }
  let frame = 0;
  let last = 0, transition;
  function draw(value) {
    angle = value;
    range.value = value;
    if (optics) {drawLens(value); return;}
    const a = angle * Math.PI / 180;
    sector.setAttribute('d', `M85 101L105 101A20 20 0 ${value > 180 ? 1 : 0} 0 ${85+20*Math.cos(a)} ${101-20*Math.sin(a)}Z`);
    const x = 85 + 61 * Math.cos(a);
    const [waveX, y] = pointOnWave(angle);
    radius.setAttribute('d', `M85 101L${x} ${y}`);
    guide.setAttribute('d', `M${x} ${y}H${waveX}V101`);
    trace.setAttribute('width', waveX - 189);
    pin.setAttribute('cx', x);
    sample.setAttribute('cx', waveX);
    pin.setAttribute('cy', y);
    sample.setAttribute('cy', y);
    range.value = Math.round(angle);
    degrees.textContent = range.value + '°';
    cos.textContent = format.format(Math.round(Math.cos(a)*1000)/1000 || 0);
    sin.textContent = format.format(Math.round(Math.sin(a)*1000)/1000 || 0);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = last = 0;
    play.setAttribute('aria-pressed','false');
    play.setAttribute('aria-label','Запустить модель');
    play.firstElementChild.textContent = '▶';
  }
  function tick(now) {
    if (last) {
      draw(Math.min(Number(range.max), angle + Math.min(now-last, 64)*(optics ? .005 : .065)));
      if (angle >= Number(range.max)) return stop();
    }
    last = now;
    frame = requestAnimationFrame(tick);
  }
  play.addEventListener('click', () => {
    if (frame) return stop();
    if (!motionAllowed()) return;
    if (angle >= Number(range.max)) draw(Number(range.min));
    play.setAttribute('aria-pressed','true');
    play.setAttribute('aria-label','Приостановить модель');
    play.firstElementChild.textContent = 'Ⅱ';
    frame = requestAnimationFrame(tick);
  });
  range.addEventListener('input', () => {stop(); draw(Number(range.value));});
  document.addEventListener('visibilitychange', () => {if(document.hidden) stop();});
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  function applyMotion() {
    play.disabled = !motionAllowed();
    play.title = play.disabled ? 'Движение отключено. Значение можно менять ползунком.' : '';
    if (play.disabled) {stop(); transition?.cancel();}
  }
  preference.addEventListener('change', applyMotion);
  new MutationObserver(applyMotion).observe(document.documentElement,{attributes:true, attributeFilter:['data-motion']});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {if (!entry.isIntersecting) stop();}).observe(hero);
  }
  draw(angle);
  applyMotion();

  const start = hero.querySelector('#start');
  start.innerHTML = 'Выбрать тему <span aria-hidden="true">↓</span>';
  let section;
  function sync() {
    const {domain, page} = document.documentElement.dataset;
    const physics = domain === 'physics';
    hero.querySelector('h1').textContent = physics ? 'Физика' : 'Математика';
    if (optics !== physics) {
      stop();
      optics = physics;
      art.querySelector('.phase-chart').toggleAttribute('hidden', physics);
      rays.toggleAttribute('hidden', !physics);
      range.min = physics ? 15 : 0;
      range.max = physics ? 40 : 360;
      range.step = physics ? .1 : 1;
      art.querySelector('label[for=wbAngle]').textContent = physics ? 'До линзы' : 'Угол θ';
      art.querySelector('.phase-formula').textContent = physics ? '1/F = 1/d + 1/b' : 'y = sin θ';
      art.querySelector('figcaption small').textContent = physics ? 'Геометрическая оптика' : 'Тригонометрия';
      art.querySelector('#measure-a').textContent = physics ? 'Фокус F' : 'cos θ';
      art.querySelector('#measure-b').textContent = physics ? 'Изображение b' : 'sin θ';
      draw(physics ? 18 : 135);
    }
    art.querySelector('#phase-title').textContent = physics ? 'Собирающая линза' : 'Как строится синусоида';
    hero.querySelector('.eyebrow').textContent = physics ? 'Учебный атлас   /   7–11 классы' : 'Учебный атлас   /   6–11 классы';
    hero.querySelector('.hero-copy>p').textContent = physics
      ? 'От наблюдения к закону. Исследуй явления в лаборатории и проверяй расчёты в задачах.'
      : 'Числа, фигуры и функции. Изучай теорию, строй графики и решай задачи с пошаговыми разборами.';
    if (page === 'catalog') {
      document.querySelector('#sectionTitle').textContent = 'Каталог тем';
    } else stop();
    const next = domain + '/' + page;
    if (section !== next && motionAllowed()) {
      const panel = [...document.querySelectorAll('main > section')].find(el => !el.hidden && el.getBoundingClientRect().height > 0);
      transition?.cancel();
      if (panel?.animate) transition = panel.animate([{opacity:.4,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{duration:330,easing:'cubic-bezier(.2,.75,.3,1)'});
    }
    section = next;
  }
  const previousRender = render;
  render = function(...args) {
    const result = previousRender.apply(this,args);
    sync();
    return result;
  };
  sync();
  // A single short sweep introduces the parameter. Manual input takes priority.
  if (motionAllowed() && !hero.hidden && !document.hidden) {
    const introOptics = optics;
    let intro = 0, startTime;
    function sweep(now) {
      if (optics !== introOptics || !motionAllowed() || frame || hero.hidden || document.hidden) return;
      startTime ??= now;
      const t = Math.min(1, (now - startTime)/1050);
      draw(optics ? 15 + 3*(1-(1-t)**3) : 135*(1-(1-t)**3));
      if (t < 1) intro = requestAnimationFrame(sweep);
    }
    art.addEventListener('pointerdown', () => cancelAnimationFrame(intro), {once:true});
    art.addEventListener('keydown', () => cancelAnimationFrame(intro), {once:true});
    intro = requestAnimationFrame(sweep);
  }
})();