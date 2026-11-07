const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
module.exports=function buildPython({root,origin,shell}){
  const context=vm.createContext({window:{}});
  vm.runInContext(fs.readFileSync(path.join(root,'python-data.js'),'utf8'),context);
  const {lessons,stages}=context.window.matclubPythonCourse;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const folder=path.join(root,'python');fs.mkdirSync(folder,{recursive:true});
  const indexBody=`<nav><a href="/">Главная</a> / Python</nav><p class="section-kicker">ИНФОРМАТИКА · PYTHON 3 · АЛЬФА</p><h1>Python: от первой строки к своим проектам</h1><p class="lead">24 урока, 4 проекта и 52 задачи с разборами. В интерактивной версии можно писать и запускать Python, проверять решения и сохранять прогресс в браузере.</p><a class="primary" href="/?python=hello">Открыть редактор и начать →</a>${stages.map(stage=>`<section><h2>${esc(stage.title)}</h2><p>${esc(stage.description)}</p><ul>${lessons.filter(l=>l.stage===stage.id).map(l=>`<li><a href="/python/${l.id}/">${esc(l.title)}</a> — ${esc(l.summary)}</li>`).join('')}</ul></section>`).join('')}`;
  fs.writeFileSync(path.join(folder,'index.html'),shell('Python с нуля: уроки, задачи и проекты | Матклуб','Курс Python: от переменных и циклов до классов, тестов, асинхронности и проектов. 24 урока, 4 проекта и практика с проверкой кода.',origin+'/python/',indexBody,{'@context':'https://schema.org','@type':'Course',name:'Python: от первой строки к своим проектам',description:'24 урока, 4 проекта и 52 задачи',inLanguage:'ru',isAccessibleForFree:true,url:origin+'/python/'}));
  const entries=[{url:origin+'/python/'}];
  for(const lesson of lessons){
    const url=`${origin}/python/${lesson.id}/`,stage=stages.find(s=>s.id===lesson.stage);
    const description=`${lesson.title}: объяснение, пример Python, задачи и разборы. ${lesson.summary}`;
    const body=`<nav><a href="/">Главная</a> / <a href="/python/">Python</a> / ${esc(stage.title)}</nav><p class="section-kicker">PYTHON 3 · ${esc(stage.title.toUpperCase())}</p><h1>${esc(lesson.title)}</h1><p class="lead">${esc(lesson.summary)}</p><section><h2>Разбираемся в теме</h2>${lesson.theory.map(t=>`<p>${esc(t)}</p>`).join('')}</section><section><h2>Пример</h2><pre><code>${esc(lesson.example)}</code></pre>${lesson.exampleInput?`<p>Входные данные: <code>${esc(lesson.exampleInput)}</code></p>`:''}<h3>Результат</h3><pre>${esc(lesson.output)}</pre></section><aside class="mistake-box"><h3>На что обратить внимание</h3><p>${esc(lesson.pitfall)}</p></aside><section><h2>Практика</h2>${lesson.exercises.map(e=>`<article><h3>${esc(e.title)}</h3><p>${esc(e.prompt)}</p><h4>Шаблон</h4><pre><code>${esc(e.starter)}</code></pre><details><summary>Подсказки и эталонный код</summary><ol>${e.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><pre><code>${esc(e.solution)}</code></pre></details></article>`).join('')}<a class="primary" href="/?python=${lesson.id}">Писать и проверять код →</a></section><p><a href="/python/">← Все уроки Python</a></p>`;
    const dir=path.join(folder,lesson.id);fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,'index.html'),shell(`Python: ${lesson.title} | Матклуб`,description,url,body,{'@context':'https://schema.org','@type':'LearningResource',name:lesson.title,description,inLanguage:'ru',educationalLevel:stage.title,learningResourceType:'Урок Python с практикой',isAccessibleForFree:true,url}));
    entries.push({url});
  }
  console.log(`Built ${lessons.length} Python lessons/projects and a course index`);
  return entries;
};
