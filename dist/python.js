(() => {
  const course=window.matclubPythonCourse,mount=document.getElementById('pythonCourse');
  if(!course||!mount)return;
  const key='matclub-python-v1',exercises=course.lessons.flatMap(l=>l.exercises),valid=new Set(exercises.map(e=>e.id));
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let saved={};try{saved=JSON.parse(localStorage.getItem(key))||{}}catch{}
  const data={done:Array.isArray(saved.done)?saved.done.filter(id=>valid.has(id)):[],drafts:{},inputs:{},lesson:typeof saved.lesson==='string'?saved.lesson:'hello'};
  for(const e of exercises){
    if(typeof saved.drafts?.[e.id]==='string')data.drafts[e.id]=saved.drafts[e.id].slice(0,100000);
    if(typeof saved.inputs?.[e.id]==='string')data.inputs[e.id]=saved.inputs[e.id].slice(0,20000);
  }
  let lesson=course.lessons.find(l=>l.id===data.lesson)||course.lessons[0],exerciseIndex=0,worker=null,busy=false,timer,saveTimer,freeTab=false;
  const current=()=>lesson.exercises[exerciseIndex];
  const $=selector=>mount.querySelector(selector);
  function persist(){try{localStorage.setItem(key,JSON.stringify(data));if($('#pySave'))$('#pySave').textContent='Черновик сохранён'}catch{if($('#pySave'))$('#pySave').textContent='Не удалось сохранить в браузере'}}
  function saveDraft(){
    clearTimeout(saveTimer);
    if($('#pyCode')){data.drafts[current().id]=$('#pyCode').value;data.inputs[current().id]=$('#pyInput').value}
    data.lesson=lesson.id;persist();
  }
  function status(text){if($('#pyStatus'))$('#pyStatus').textContent=text}
  function setBusy(value){busy=value;for(const id of ['#pyRun','#pyCheck'])if($(id))$(id).disabled=value;if($('#pyStop'))$('#pyStop').disabled=!value}
  function stop(message='Выполнение остановлено. Код сохранён.',dispose=false){
    clearTimeout(timer);
    if(worker&&(busy||dispose)){worker.terminate();worker=null}
    if(busy){setBusy(false);if(message)status(message)}
  }
  function progress(){
    const done=new Set(data.done);
    $('#pyProgress').value=done.size;$('#pyProgressText').textContent=`Решено ${done.size} из ${exercises.length} задач`;
    $('#pyLessonList').innerHTML=course.lessons.filter(l=>l.stage===lesson.stage).map(l=>{
      const n=l.exercises.filter(e=>done.has(e.id)).length;
      return `<button type="button" data-python-lesson="${l.id}" ${l.id===lesson.id?'aria-current="step"':''}><span class="py-lesson-mark" aria-hidden="true">${n===l.exercises.length?'✓':String(course.lessons.indexOf(l)+1).padStart(2,'0')}</span><span>${esc(l.title)}<small>${n}/${l.exercises.length} задач</small></span></button>`;
    }).join('');
    mount.querySelectorAll('[data-python-stage]').forEach(button=>{button.setAttribute('aria-pressed',String(Number(button.dataset.pythonStage)===lesson.stage))});
    mount.querySelectorAll('[data-python-exercise]').forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===exerciseIndex));button.classList.toggle('py-solved',done.has(lesson.exercises[i].id))});
  }
  mount.innerHTML=`<div class="py-course-head"><div><span class="alpha-badge">Python 3 · Курс открыт</span><h3>От первой строки к своим проектам.</h3><p>24 урока · 4 проекта · 52 задачи с проверкой кода. Все ступени доступны сразу.</p></div><div class="py-progress-box"><span id="pyProgressText"></span><progress id="pyProgress" max="52" value="0" aria-label="Решённые задачи Python"></progress><small>Прогресс сохраняется в этом браузере</small></div></div><div class="py-stages" aria-label="Ступени курса">${course.stages.map(s=>`<button type="button" data-python-stage="${s.id}" aria-pressed="false"><span>${String(s.id).padStart(2,'0')}</span>${esc(s.title)}</button>`).join('')}</div><div class="py-course-grid"><aside class="py-outline"><h4 id="pyStageTitle"></h4><p id="pyStageDescription"></p><nav id="pyLessonList" aria-label="Уроки текущей ступени"></nav><a class="py-reading-link" href="/python/">Текстовая версия всех уроков ↗</a></aside><div id="pyReader" class="py-reader"></div></div>`;
  function renderExercise(){
    stop('');const e=current();freeTab=false;
    $('#pyWorkspace').innerHTML=`<div class="py-exercise-head"><span class="eyebrow">ПРАКТИКА · ПИШИ И ПРОВЕРЯЙ</span><div class="py-exercise-tabs">${lesson.exercises.map((item,i)=>`<button type="button" data-python-exercise="${i}" aria-pressed="${i===exerciseIndex}">${i+1}. ${esc(item.title)}</button>`).join('')}</div><h4>${esc(e.title)}</h4><p>${esc(e.prompt)}</p></div><details class="py-check-contract"><summary>Что проверяем: ${e.tests.length} ${e.tests.length===1?'проверка':'проверки'}</summary><ul>${e.tests.map(t=>`<li>${esc(t.name)}</li>`).join('')}</ul></details><div class="py-editor-heading"><label for="pyCode">Твоё решение · Python</label><button id="pyReset" type="button">Вернуть шаблон</button></div><textarea id="pyCode" class="py-code-editor" rows="13" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" maxlength="100000" aria-describedby="pyEditorHelp">${esc(data.drafts[e.id]??e.starter)}</textarea><p id="pyEditorHelp" class="py-editor-help">Tab — отступ · Shift+Tab — назад · Esc, затем Tab — выйти из редактора · Ctrl / ⌘ + Enter — запуск</p><details class="py-input"><summary>Входные данные для input()</summary><label for="pyInput">Каждый ответ input() — на отдельной строке</label><textarea id="pyInput" rows="3" maxlength="20000" spellcheck="false">${esc(data.inputs[e.id]??e.stdin)}</textarea></details><div class="py-run-bar"><button id="pyRun" class="primary" type="button">▶ Запустить</button><button id="pyCheck" type="button">Проверить решение ✓</button><button id="pyStop" type="button" disabled>■ Остановить</button><span id="pySave">Черновик сохраняется автоматически</span></div><p id="pyStatus" role="status" class="py-status">Первый запуск загрузит Python из интернета. Затем можно запускать код без повторной загрузки интерпретатора в этой вкладке.</p><div class="py-output-heading">Вывод программы</div><pre id="pyOutput" class="py-output" tabindex="0" aria-label="Вывод программы"></pre><div id="pyResults" class="py-results" aria-live="polite"></div><p class="py-runtime-note">Выполнение ограничено 10 секундами. Файлы песочницы временные; код и прогресс сохраняются в браузере. Проверка запускает код отдельно для каждого теста; вывод показан для первого.</p><details class="py-solution"><summary>Подсказки и разбор решения</summary><ol>${e.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><details><summary>Показать эталонный код</summary><pre><code>${esc(e.solution)}</code></pre></details></details>`;
    progress();
  }
  function renderLesson(focus=false){
    stop('');
    const stage=course.stages.find(s=>s.id===lesson.stage),index=course.lessons.indexOf(lesson);
    $('#pyStageTitle').textContent=stage.title;$('#pyStageDescription').textContent=stage.description;
    $('#pyReader').innerHTML=`<article class="py-theory"><div class="py-lesson-heading"><span class="alpha-badge">${lesson.stage===7?'Проект':'Урок'} ${lesson.stage===7?index-23:index+1}</span><h3 id="pyLessonTitle" tabindex="-1">${esc(lesson.title)}</h3><p>${esc(lesson.summary)}</p></div>${lesson.theory.map(t=>`<p>${esc(t)}</p>`).join('')}<div class="py-example"><div class="py-example-title">Разобранный пример</div><pre><code>${esc(lesson.example)}</code></pre>${lesson.exampleInput?`<p>Входные данные: <code>${esc(lesson.exampleInput)}</code></p>`:''}<div class="py-example-result"><span>Результат</span><pre>${esc(lesson.output)}</pre></div></div><aside class="py-pitfall"><b>На что обратить внимание</b><p>${esc(lesson.pitfall)}</p></aside></article><section id="pyWorkspace" class="py-workspace" aria-label="Практика Python"></section><div class="py-lesson-navigation"><button type="button" data-python-previous ${index===0?'disabled':''}>← Предыдущая тема</button><button type="button" data-python-next ${index===course.lessons.length-1?'disabled':''}>Следующая тема →</button></div>`;
    renderExercise();
    if(focus){$('#pyLessonTitle').focus({preventScroll:true});$('#pyReader').scrollIntoView({block:'start',behavior:window.matclubSettings?.motionAllowed()?'smooth':'auto'})}
  }
  function openLesson(id,focus=true){
    const next=course.lessons.find(l=>l.id===id);if(!next)return;
    saveDraft();lesson=next;exerciseIndex=0;data.lesson=id;persist();renderLesson(focus);
  }
  function appendOutput(text){const out=$('#pyOutput');if(out)out.textContent=(out.textContent+text).slice(0,50000)}
  function run(mode){
    if(busy)return;
    saveDraft();const e=current(),code=$('#pyCode').value;
    if(!code.trim()){status('Напиши решение перед запуском.');return}
    if(typeof Worker!=='function'){status('Этот браузер не поддерживает запуск Python. Можно читать уроки и перенести код в локальный Python 3.');return}
    $('#pyOutput').textContent='';$('#pyResults').textContent='';setBusy(true);status('Подготовка Python…');
    const first=!worker;
    try{if(!worker)worker=new Worker('python-worker.js')}catch(error){setBusy(false);status('Не удалось запустить среду Python: '+error.message);return}
    const target=worker;
    clearTimeout(timer);timer=setTimeout(()=>stop('Загрузка заняла слишком много времени. Проверь интернет и повтори запуск.'),60000);
    target.onmessage=event=>{
      if(worker!==target)return;const message=event.data;
      if(message.type==='phase'){
        clearTimeout(timer);
        if(message.phase==='loading'){status('Первый запуск: загружается Python 3.12. Это может занять некоторое время.');timer=setTimeout(()=>stop('Python не загрузился. Проверь интернет и повтори запуск.'),60000)}
        else{status(mode==='check'?'Проверяю решение…':'Программа выполняется…');timer=setTimeout(()=>stop('Превышено 10 секунд. Выполнение остановлено; проверь условие цикла или объём вычислений.'),10000)}
      }else if(message.type==='output')appendOutput(message.text);
      else if(message.type==='case')status(`Проверка ${message.index} из ${message.total}…`);
      else if(message.type==='done'){
        clearTimeout(timer);setBusy(false);
        if(mode==='check'){
          const results=message.results||[],passed=results.length===e.tests.length&&results.every(t=>t.ok);
          $('#pyResults').innerHTML=results.map(t=>`<div class="py-test ${t.ok?'py-test-pass':'py-test-fail'}"><b>${t.ok?'✓':'!'} ${esc(t.name)}</b>${t.ok?'':`<pre>${esc(t.error||'Проверка не пройдена')}</pre>`}</div>`).join('');
          if(passed){if(!data.done.includes(e.id))data.done.push(e.id);persist();progress();status('Все проверки пройдены. Решение сохранено в прогрессе ✓')}
          else status('Есть непройденные проверки. Сравни ошибку с контрактом задачи и попробуй снова.');
        }else status(message.truncated?'Программа завершена. Слишком длинный вывод сокращён.':'Программа завершена. Для зачёта задачи нажми «Проверить решение».');
      }else if(message.type==='error'){clearTimeout(timer);setBusy(false);appendOutput('\n'+message.message);status(first?'Не удалось выполнить код. Если Python не загрузился, проверь доступ к интернету и повтори.':'Ошибка Python. Посмотри сообщение в выводе и исправь код.')}
    };
    target.onerror=event=>{if(worker!==target)return;stop('Среда Python не загрузилась или завершилась с ошибкой. Повтори запуск.');appendOutput(event.message||'Ошибка загрузки интерпретатора.')};
    target.postMessage({type:'run',mode,code,stdin:$('#pyInput').value,tests:mode==='check'?e.tests:[]});
  }
  mount.addEventListener('input',event=>{if(event.target.matches('#pyCode,#pyInput')){if($('#pySave'))$('#pySave').textContent='Сохраняю…';clearTimeout(saveTimer);saveTimer=setTimeout(saveDraft,250)}});
  mount.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.pythonStage){const next=course.lessons.find(l=>l.stage===Number(button.dataset.pythonStage));openLesson(next.id)}
    else if(button.dataset.pythonLesson)openLesson(button.dataset.pythonLesson);
    else if(button.dataset.pythonExercise!==undefined){saveDraft();exerciseIndex=Number(button.dataset.pythonExercise);renderExercise()}
    else if(button.hasAttribute('data-python-next'))openLesson(course.lessons[course.lessons.indexOf(lesson)+1]?.id);
    else if(button.hasAttribute('data-python-previous'))openLesson(course.lessons[course.lessons.indexOf(lesson)-1]?.id);
    else if(button.id==='pyRun')run('run');
    else if(button.id==='pyCheck')run('check');
    else if(button.id==='pyStop')stop();
    else if(button.id==='pyReset'){stop('');$('#pyCode').value=current().starter;$('#pyInput').value=current().stdin;saveDraft();status('Шаблон восстановлен.');}
  });
  mount.addEventListener('keydown',event=>{
    if(event.target.id!=='pyCode')return;
    if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();run(event.shiftKey?'check':'run')}
    else if(event.key==='Escape'){freeTab=true;status('Следующий Tab переведёт фокус из редактора.')}
    else if(event.key==='Tab'&&!event.shiftKey){if(freeTab){freeTab=false;return}event.preventDefault();const editor=event.target;editor.setRangeText('    ',editor.selectionStart,editor.selectionEnd,'end');saveDraft()}
  });
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(busy&&button&&(button.dataset.domain||(button.dataset.view&&button.dataset.view!=='computing')||(button.dataset.language&&button.dataset.language!=='python')))stop()});
  window.addEventListener('pagehide',()=>{saveDraft();stop('',true)});
  window.matclubPython={openLesson:id=>{document.getElementById('computingNav').click();document.getElementById('pythonTab').click();openLesson(id)},getProgress:()=>({done:[...data.done],total:exercises.length})};
  renderLesson();
  const linked=new URLSearchParams(location.search).get('python');
  if(linked&&course.lessons.some(l=>l.id===linked))window.matclubPython.openLesson(linked);
})();
