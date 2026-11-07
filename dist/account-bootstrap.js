/* Runs before settings and course scripts so they read the correct student's data. */
(()=>{'use strict';
const keys=['matclub-saved','matclub-solved','matclub-workbook','matclub-python-v1','matclub-cpp-v1','matclub-laboratory-v1','matclub-settings-v1','matclub-graphs-v1'];
const rawSet=Storage.prototype.setItem,rawRemove=Storage.prototype.removeItem;
let muted=false,cache={};const boot=window.matclubBoot||{ready:false,user:null};
function read(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}}
function snapshot(){const out={};for(const k of keys){const value=localStorage.getItem(k);if(value!==null)out[k]=value}return out}
function put(k,v){try{rawSet.call(localStorage,k,JSON.stringify(v));return true}catch{return false}}
function apply(data){muted=true;try{for(const k of keys){if(typeof data?.[k]==='string')rawSet.call(localStorage,k,data[k]);else rawRemove.call(localStorage,k)}}finally{muted=false}}
function checkpoint(){return put('matclub-account-cache',cache)}
function backup(label){put('matclub-account-backup',{label,at:Date.now(),data:snapshot()})}
try{cache=read('matclub-account-cache')||{};const owner=localStorage.getItem('matclub-account-owner');
 if(boot.user&&boot.progress){
  if(owner&&owner!==boot.user.id&&cache.pending)put('matclub-account-offline-'+owner,{data:snapshot(),cache});
  const offline=read('matclub-account-offline-'+boot.user.id);
  if(offline?.cache?.pending&&offline.cache.user?.id===boot.user.id){apply(offline.data);cache=offline.cache;rawSet.call(localStorage,'matclub-account-owner',boot.user.id);rawRemove.call(localStorage,'matclub-account-offline-'+boot.user.id)}

  if(localStorage.getItem('matclub-account-owner')===boot.user.id&&cache.user?.id===boot.user.id&&cache.pending){cache.conflict=cache.revision!==boot.progress.revision;cache.remote=boot.progress;}
  else{if(owner!==boot.user.id&&Object.keys(snapshot()).length)backup(owner?'Предыдущий аккаунт':'Гостевой прогресс');apply(boot.progress.data);cache={user:boot.user,revision:boot.progress.revision,pending:false,updatedAt:boot.progress.updatedAt}}
  cache.user=boot.user;rawSet.call(localStorage,'matclub-account-owner',boot.user.id);checkpoint();
 }else if(boot.ready&&!boot.user&&owner){if(cache.pending)put('matclub-account-offline-'+owner,{data:snapshot(),cache});backup('Локальная копия после завершения сессии');apply({});rawRemove.call(localStorage,'matclub-account-owner');cache={};checkpoint()}
}catch{boot.storageError=true}
const api={keys,boot,get cache(){return cache},snapshot,apply,backup,checkpoint,replaceCache(next){cache=next;checkpoint()},setOwner(id){if(id)rawSet.call(localStorage,'matclub-account-owner',id);else rawRemove.call(localStorage,'matclub-account-owner')},read,put};
Storage.prototype.setItem=function(k,v){rawSet.call(this,k,v);if(this===localStorage&&!muted&&keys.includes(k))changed()};
Storage.prototype.removeItem=function(k){rawRemove.call(this,k);if(this===localStorage&&!muted&&keys.includes(k))changed()};
function changed(){const currentUser=boot.user||(!boot.ready?cache.user:null);if(currentUser&&localStorage.getItem('matclub-account-owner')===currentUser.id){cache.pending=true;cache.user=currentUser;checkpoint()}window.dispatchEvent(new Event('matclub-progress-changed'))}
window.matclubAccountStore=api;
})();
