(()=>{'use strict';const S=window.matclubAccountStore;if(!S)return;
const dialog=document.getElementById('accountDialog'),button=document.getElementById('accountButton'),content=document.getElementById('accountContent'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let retryDelay=2000;
let user=S.boot.user||(!S.boot.ready?S.cache.user:null),mode='login',busy=false,syncing=false,timer=null,conflict=!!S.cache.conflict,paused=false,message='';
const $=s=>dialog.querySelector(s),stateMessage=()=>!S.boot.ready?'Связь с кабинетом недоступна. Локальный прогресс сохраняется.':conflict?'На другом устройстве есть новая версия. Выбери данные ниже.':paused?'Синхронизация приостановлена.':S.cache.pending?'Есть изменения для отправки в облако.':S.cache.updatedAt?'Сохранено в облаке: '+new Date(S.cache.updatedAt*1000).toLocaleString('ru-RU'):'Прогресс сохраняется в облаке.';
function status(text){message=text;const el=$('#accountStatus');if(el)el.textContent=text}
function updateBadge(){button.querySelector('span:last-child').textContent=user?(user.name||user.login):'Войти';button.setAttribute('aria-label',user?'Личный кабинет '+(user.name||user.login):'Войти в личный кабинет');button.dataset.signedIn=String(!!user);const el=$('#accountSyncStatus');if(el)el.textContent=stateMessage()}
async function request(path,data,method='POST'){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{const r=await fetch('/api/'+path,{method,credentials:'same-origin',signal:controller.signal,headers:{'content-type':'application/json'},...(document.hidden && path==='progress' && data && new Blob([JSON.stringify(data)]).size<60000 ? {keepalive:true}:{}),...(data===undefined?{}:{body:JSON.stringify(data)})});let body;try{body=await r.json()}catch{throw Error('Сервер кабинета ещё не подключён. Обнови страницу чуть позже.')}if(!r.ok){const error=Error(body.error||'Не удалось выполнить запрос.');error.status=r.status;error.retryAfter=Number(r.headers?.get?.('retry-after'))||0;throw error}return body}finally{clearTimeout(timeout)}}
function parsed(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value??fallback}catch{return fallback}}
function stats(){const solved=parsed('matclub-solved',[]),valid=Array.isArray(solved)?new Set(solved):new Set(),collection=typeof tasks!=='undefined'?tasks:[];const math=collection.filter(t=>t.domain==='math'&&valid.has(t.id)).length,physics=collection.filter(t=>t.domain==='physics'&&valid.has(t.id)).length,py=parsed('matclub-python-v1',{}),cpp=parsed('matclub-cpp-v1',{}),lab=parsed('matclub-laboratory-v1',{});const pyIds=new Set(window.matclubPythonCourse?.lessons.flatMap(l=>l.exercises.map(e=>e.id))||[]),cppIds=new Set(window.matclubCppCourse?.lessons.map(l=>l.id)||[]);const python=Array.isArray(py.done)?new Set(py.done.filter(x=>pyIds.has(x))).size:0,C=Array.isArray(cpp.done)?new Set(cpp.done.filter(x=>cppIds.has(x))).size:0,experiments=Object.values(lab.journal||{}).filter(rows=>Array.isArray(rows)&&rows.length).length;return{math,physics,python,cpp:C,experiments,total:math+physics}}
function achievements(v){return[['Первое решение','Реши одну школьную задачу',v.total>=1],['В ритме науки','Реши 10 школьных задач',v.total>=10],['Полсотни открытий','Реши 50 школьных задач',v.total>=50],['Математик','Реши 20 задач по математике',v.math>=20],['Физик','Реши 20 задач по физике',v.physics>=20],['Python на практике','Пройди проверку 10 заданий Python',v.python>=10],['Путь C++','Отметь пройденными 10 тем C++',v.cpp>=10],['Исследователь','Запиши измерения в 5 разных опытах',v.experiments>=5]]}
function render(){updateBadge();if(!user){content.innerHTML=`<p class="account-intro">Один аккаунт для задач, курсов и лаборатории. Вход нужен для ИИ-помощника и сохранения прогресса между устройствами.</p>${!S.boot.ready?'<p class="account-notice">Сервер кабинета пока недоступен. Учиться можно без входа.</p>':''}<div class="account-tabs"><button data-account-mode="login" aria-pressed="${mode==='login'}">Вход</button><button data-account-mode="register" aria-pressed="${mode==='register'}">Регистрация</button></div><form id="accountAuth"><label for="accountLogin">Логин</label><input id="accountLogin" name="username" autocomplete="username" minlength="3" maxlength="24" pattern="[A-Za-z0-9_]{3,24}" placeholder="Например, math_student" required autocapitalize="none" spellcheck="false"><small>3–24 латинских буквы, цифры или _. Регистр не важен.</small><label for="accountPassword">Пароль</label><input id="accountPassword" type="password" name="password" autocomplete="${mode==='login'?'current-password':'new-password'}" minlength="10" maxlength="128" required><small>От 10 символов. Пароль не сохраняется в браузере сайтом.</small>${mode==='register'?'<label for="accountRepeat">Повтори пароль</label><input id="accountRepeat" type="password" autocomplete="new-password" minlength="10" maxlength="128" required><label for="accountName">Как тебя называть? <small>Необязательно</small></label><input id="accountName" autocomplete="nickname" maxlength="60"><label for="accountGrade">Класс</label>'+grades('accountGrade',7)+'<label class="account-check"><input id="accountImport" type="checkbox" checked>Перенести текущий прогресс в новый аккаунт</label>':''}<button class="primary account-submit" ${S.boot.ready?'':'disabled'}>${mode==='login'?'Войти':'Создать аккаунт'}</button><p class="account-small">Почта и телефон не нужны. Восстановление забытого пароля пока недоступно — сохрани его в менеджере паролей.</p></form><p id="accountStatus" role="status">${esc(message)}</p>`;return}
const v=stats(),awardKeys=['first','ten','fifty','math','physics','python','cpp','research'],a=achievements(v).map((a,i)=>[a[0],a[1],a[2]||user.awardedAchievements?.includes(awardKeys[i])]);content.innerHTML=`<div class="account-user"><div class="account-avatar" aria-hidden="true">${esc((user.name||user.login)[0]?.toUpperCase())}</div><div><h3>${esc(user.name||user.login)}${user.title?` <span class="account-title">${esc(user.title)}</span>`:''}</h3><p>@${esc(user.login)} · ${user.grade} класс</p></div></div><p id="accountSyncStatus" role="status">${esc(stateMessage())}</p>${conflict?'<div class="account-notice"><b>Прогресс обновлён на другом устройстве</b><p>Текущие данные не перезаписаны. Скачай резервную копию и выбери версию.</p><button class="account-action" id="accountUseCloud">Загрузить из облака</button><button class="account-action" id="accountUseLocal">Сохранить версию этого устройства</button></div>':''}<div class="account-stats"><div><b>${v.total}</b><span>школьных задач</span></div><div><b>${v.python}</b><span>заданий Python</span></div><div><b>${v.cpp}</b><span>тем C++ отмечено</span></div><div><b>${v.experiments}</b><span>опытов с измерениями</span></div></div><h3 class="account-section-title">Достижения · ${a.filter(x=>x[2]).length} / ${a.length}</h3><div class="account-achievements">${a.map(([title,text,done])=>`<article class="${done?'earned':''}"><span aria-hidden="true">${done?'★':'☆'}</span><div><b>${title}</b><p>${text}</p><small>${done?(user.awardedAchievements?.includes(awardKeys[a.findIndex(x=>x[0]===title)])?'Выдано владельцем':'Получено'):'Впереди'}</small></div></article>`).join('')}</div><p class="account-small">Отметки C++ ставишь самостоятельно. Измерения лаборатории и достижения сохраняются вместе с прогрессом.</p><details class="account-details"><summary>Профиль ученика</summary><form id="accountProfile"><label for="profileName">Имя или псевдоним</label><input id="profileName" maxlength="60" autocomplete="nickname" value="${esc(user.name)}"><label for="profileGrade">Класс</label>${grades('profileGrade',user.grade)}<button class="account-action">Сохранить профиль</button></form></details><details class="account-details"><summary>Сменить пароль</summary><form id="accountPasswordForm"><label for="oldPassword">Текущий пароль</label><input id="oldPassword" type="password" autocomplete="current-password" maxlength="128" required><label for="newPassword">Новый пароль</label><input id="newPassword" type="password" autocomplete="new-password" minlength="10" maxlength="128" required><label for="repeatNewPassword">Повторить новый пароль</label><input id="repeatNewPassword" type="password" autocomplete="new-password" minlength="10" maxlength="128" required><button class="account-action">Сменить пароль</button><small>После смены пароля остальные устройства выйдут из аккаунта.</small></form></details><div class="account-actions"><button id="accountSync" class="account-action">Синхронизировать</button><button id="accountBackup" class="account-action">↓ Резервная копия</button><button id="accountLogout" class="account-action">Выйти</button></div><p class="account-small">При выходе данные аккаунта убираются с этого устройства. Если сеть недоступна, сначала скачай резервную копию.</p><p id="accountStatus" role="status">${esc(message)}</p>`;}
function grades(id,current){return`<select id="${id}">${[6,7,8,9,10,11].map(g=>`<option value="${g}" ${g===current?'selected':''}>${g} класс</option>`).join('')}</select>`}
function backupFile(extra={}){const payload={format:'matclub-backup-v1',...extra,at:new Date().toISOString(),user:user?{login:user.login,name:user.name,grade:user.grade}:null,data:S.snapshot()};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='matclub-progress.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function activeOwner(id){
 return user?.id===id && localStorage.getItem('matclub-account-owner')===id;
}
function retryLater(after=0){
 clearTimeout(timer);
 timer=setTimeout(sync,Math.max(retryDelay,after*1000));
 retryDelay=Math.min(60000,retryDelay*2);
}
async function sync(){
 if(!user)return false;
 if(navigator.locks?.request)return navigator.locks.request('matclub-progress-'+user.id,sendPending);
 return sendPending();
}
async function sendPending(){
 S.refreshCache();
 conflict=!!S.cache.conflict;
 if(!user||syncing||conflict||paused||!activeOwner(user.id))return false;
 syncing=true;
 const id=user.id;
 try{
  if(!S.boot.ready){
   const me=await request('me',undefined,'GET');
   if(me.user?.id!==id||!activeOwner(id)){paused=true;status('Войди в тот же аккаунт, чтобы отправить сохранённые изменения.');return false}
   S.boot.ready=true;S.boot.user=me.user;
  }
  while(S.cache.pending){
   if(paused||!activeOwner(id))return false;
   const data=S.snapshot(), version=S.cache.revision;
   const changed=S.cache.hashes && Array.isArray(S.cache.dirty) ? [...S.cache.dirty] : null;
   const payload={userId:id,revision:version};
   if(changed){
    payload.changes=Object.fromEntries(changed.map(k=>[k,{base:S.cache.hashes[k]??null,value:data[k]??null}]));
   }else{
    payload.format=2;payload.data=data;
   }
   const result=await request('progress',payload,'PUT');
   if(paused||!activeOwner(id))return false;
   S.refreshCache();
   if(S.cache.revision>result.revision)continue;
   const current=S.snapshot();
   if(changed){
    const acknowledged=new Set(changed.filter(k=>current[k]===data[k]));
    const dirty=(S.cache.dirty||[]).filter(k=>!acknowledged.has(k));
    S.replaceCache({...S.cache,revision:result.revision,updatedAt:result.updatedAt,
     hashes:{...S.cache.hashes,...result.hashes},dirty,pending:dirty.length>0});
   }else{
    S.replaceCache({...S.cache,revision:result.revision,updatedAt:result.updatedAt,pending:JSON.stringify(current)!==JSON.stringify(data)});
   }
   updateBadge();
  }
  retryDelay=2000;status('Прогресс сохранён в облаке.');return true;
 }catch(e){
  if(!activeOwner(id)||paused)return false;
  if(e.status===409){conflict=true;S.replaceCache({...S.cache,conflict:true});if(dialog.open)render()}
  else if(e.status===401){paused=true;status('Сессия завершилась. Сохранённые на устройстве изменения ожидают входа.')}
  else{
   const transient=!e.status||e.status===429||e.status>=500;
   status(transient?'Изменения на устройстве. Отправка в облако повторится автоматически.':e.message);
   if(transient && S.cache.pending && navigator.onLine!==false)retryLater(e.retryAfter);
  }
  return false;
 }finally{syncing=false;updateBadge()}
}
async function adopt(u,{importGuest=false}={}){
 // On sign-in the server-rendered bootstrap restores any pending work for this account.
 if(importGuest){
  const remote=await request('progress',undefined,'GET');
  if((remote.userId&&remote.userId!==u.id)||localStorage.getItem('matclub-account-owner'))
   throw Error('Аккаунт изменился. Обнови страницу.');
  const guest=S.snapshot(), dirty=Object.keys(guest);
  S.backup('Прогресс до входа');
  S.apply({...remote.data,...guest});
  S.setOwner(u.id);S.boot.user=u;S.boot.ready=true;user=u;
  S.replaceCache({user:u,revision:remote.revision,updatedAt:remote.updatedAt,hashes:remote.hashes,dirty,pending:dirty.length>0});
  if(dirty.length)await sync();
 }
 location.reload();
}
async function action(fn){if(busy)return;busy=true;dialog.setAttribute('aria-busy','true');try{await fn()}catch(e){status(e.name==='AbortError'?'Сервер не ответил. Попробуй ещё раз.':e.message)}finally{busy=false;dialog.removeAttribute('aria-busy')}}
button.addEventListener('click',()=>{render();dialog.showModal()});$('#accountClose').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.accountMode){mode=b.dataset.accountMode;message='';render();return}if(b.id==='accountBackup'){backupFile();return}if(b.id==='accountSync'){action(async()=>{
 if(!await sync())return;
 const remote=await request('progress',undefined,'GET');
 if(!activeOwner(user.id)||S.refreshCache().pending||paused)return;
 if(remote.userId && remote.userId!==user.id)throw Error('Аккаунт изменился. Обнови страницу.');
 const local=S.snapshot();if(S.keys.some(k=>remote.data[k]!==local[k]))location.reload();
 });return}if(b.id==='accountLogout'){action(async()=>{if(!activeOwner(user.id)||paused){location.reload();return}if(S.refreshCache().pending&&!(await sync()))throw Error('Сначала синхронизируй изменения или скачай копию. Выход отменён, чтобы сохранить прогресс.');await request('logout',{});location.reload()});return}if(b.id==='accountUseCloud'||b.id==='accountUseLocal'){action(async()=>{const remote=await request('progress',undefined,'GET');if(!activeOwner(user.id)||(remote.userId&&remote.userId!==user.id))throw Error('Аккаунт изменился. Обнови страницу.');S.backup('Данные перед разрешением конфликта');backupFile({cloudVersion:remote});S.refreshCache();
 if(b.id==='accountUseCloud'){
  const local=S.snapshot(), next={...remote.data}, keep=[];
  if(remote.hashes && S.cache.hashes)for(const key of S.cache.dirty||[]){
   if(local[key]===next[key] || (S.cache.hashes[key]??null)!==(remote.hashes[key]??null))continue;
   keep.push(key);
   if(local[key]===undefined)delete next[key];else next[key]=local[key];
  }
  S.apply(next);
  S.replaceCache({user,revision:remote.revision,updatedAt:remote.updatedAt,pending:keep.length>0,hashes:remote.hashes,dirty:keep});
  location.reload()
 }else{const latest=S.snapshot();
 if(remote.hashes && S.cache.hashes && Array.isArray(S.cache.dirty)){
  const dirty=S.cache.dirty;
  const changes=Object.fromEntries(dirty.map(k=>[k,{base:remote.hashes[k]??null,value:latest[k]??null}]));
  const r=await request('progress',{userId:user.id,revision:remote.revision,changes},'PUT');
  if(!activeOwner(user.id)||paused)return;
  S.refreshCache();const current=S.snapshot(),remaining=S.cache.dirty.filter(k=>latest[k]!==current[k]||!dirty.includes(k));
  S.replaceCache({...S.cache,revision:r.revision,updatedAt:r.updatedAt,hashes:{...S.cache.hashes,...r.hashes},dirty:remaining,pending:remaining.length>0,conflict:false});
 }else{
  const r=await request('progress',{userId:user.id,format:2,revision:remote.revision,data:latest},'PUT');
  if(!activeOwner(user.id)||paused)return;
  S.replaceCache({...S.cache,revision:r.revision,updatedAt:r.updatedAt,pending:JSON.stringify(latest)!==JSON.stringify(S.snapshot()),conflict:false});
 }
 conflict=false;if(S.cache.pending)retryLater();render();status('Версия этого устройства сохранена. Резервная копия скачана.')}})}});
dialog.addEventListener('submit',e=>{e.preventDefault();const form=e.target;if(!form.reportValidity())return;action(async()=>{if(form.id==='accountAuth'){const password=$('#accountPassword').value;if(mode==='register'&&password!==$('#accountRepeat').value)throw Error('Пароли не совпадают.');const importGuest=mode==='register'&&$('#accountImport').checked,data={login:$('#accountLogin').value,password,...(mode==='register'?{name:$('#accountName').value,grade:Number($('#accountGrade').value)}:{})};const result=await request(mode,data);await adopt(result.user,{importGuest})}if(form.id==='accountProfile'){const r=await request('profile',{name:$('#profileName').value,grade:Number($('#profileGrade').value)},'PUT');user=r.user;S.boot.user=user;S.replaceCache({...S.cache,user});render();status('Профиль сохранён.')}if(form.id==='accountPasswordForm'){if($('#newPassword').value!==$('#repeatNewPassword').value)throw Error('Новые пароли не совпадают.');await request('password',{currentPassword:$('#oldPassword').value,password:$('#newPassword').value});form.reset();status('Пароль изменён. Остальные устройства вышли из аккаунта.')}})});
window.addEventListener('matclub-progress-changed',()=>{updateBadge();clearTimeout(timer);timer=setTimeout(sync,1200)});window.addEventListener('online',()=>sync());window.addEventListener('pagehide',()=>{if(S.cache.pending)sync()});document.addEventListener('visibilitychange',()=>{if(document.hidden)sync()});window.addEventListener('storage',event=>{
 if(!['matclub-account-owner','matclub-account-cache'].includes(event.key))return;
 if(localStorage.getItem('matclub-account-owner')!==(user?.id||null)){
  paused=true;clearTimeout(timer);status('Аккаунт изменился в другой вкладке. Обнови страницу.');updateBadge();return;
 }
 if(user && !paused){
  S.refreshCache();conflict=!!S.cache.conflict;updateBadge();
  if(S.cache.pending&&!conflict){clearTimeout(timer);timer=setTimeout(sync,1250)}
 }
});

updateBadge();if(user&&S.cache.pending&&!conflict)setTimeout(sync,500);window.matclubAccount={open(options={}){if(['login','register'].includes(options.mode))mode=options.mode;if(typeof options.message==='string')message=options.message;render();if(!dialog.open)dialog.showModal()},sync,get state(){return{user,pending:!!S.cache.pending,conflict,paused}}};
})();
