/* Runs before settings and course scripts so they read the correct student's data. */
(()=>{'use strict';
const preferences=['matclub-domain','matclub-sidebar-hidden','matclub-ai-position-v1'];
const keys=['matclub-saved','matclub-solved','matclub-workbook','matclub-python-v1','matclub-cpp-v1','matclub-laboratory-v1','matclub-settings-v1','matclub-graphs-v1',...preferences];
const rawSet=Storage.prototype.setItem,rawRemove=Storage.prototype.removeItem;
let muted=false,cache={},observed={};const boot=window.matclubBoot||{ready:false,user:null};
function read(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}}
function snapshot(){const out={};for(const k of keys){const value=localStorage.getItem(k);if(value!==null)out[k]=value}return out}
function put(k,v){try{rawSet.call(localStorage,k,JSON.stringify(v));return true}catch{return false}}
function apply(data){muted=true;try{for(const k of keys){if(typeof data?.[k]==='string')rawSet.call(localStorage,k,data[k]);else rawRemove.call(localStorage,k)}}finally{muted=false;observed=snapshot()}}
function checkpoint(){return put('matclub-account-cache',cache)}
function backup(label){put('matclub-account-backup',{label,at:Date.now(),data:snapshot()})}
try{cache=read('matclub-account-cache')||{};const owner=localStorage.getItem('matclub-account-owner');
 if(boot.user&&boot.progress){
  if(owner&&owner!==boot.user.id&&cache.pending)put('matclub-account-offline-'+owner,{data:snapshot(),cache});
  const offline=read('matclub-account-offline-'+boot.user.id);
  if(offline?.cache?.pending&&offline.cache.user?.id===boot.user.id){apply(offline.data);cache=offline.cache;rawSet.call(localStorage,'matclub-account-owner',boot.user.id);rawRemove.call(localStorage,'matclub-account-offline-'+boot.user.id)}

  const remote=boot.progress, sameOwner=localStorage.getItem('matclub-account-owner')===boot.user.id && cache.user?.id===boot.user.id;
  const local=snapshot();
  if(sameOwner && cache.pending && (!remote.hashes || (!cache.hashes && cache.revision!==remote.revision))){
    // A pending snapshot from an older client has no per-section baseline.
    cache.conflict=cache.revision!==remote.revision;
  }else{
    if(!sameOwner && Object.keys(local).length)backup(owner?'Предыдущий аккаунт':'Гостевой прогресс');
    const dirty=new Set(sameOwner && cache.pending
      ? (cache.hashes && Array.isArray(cache.dirty) ? cache.dirty : keys.filter(k=>local[k]!==remote.data[k])) : []);
    if(sameOwner && remote.hashes && !cache.hashes)
      for(const k of preferences)if(local[k]!==undefined && remote.data[k]===undefined)dirty.add(k);
    const next={...remote.data},hashes={...remote.hashes};
    let conflict=false;
    for(const k of dirty){
      if(local[k]===remote.data[k]){dirty.delete(k);continue}
      if(cache.hashes && (cache.hashes[k]??null)!==(remote.hashes?.[k]??null))conflict=true;
      if(local[k]===undefined)delete next[k];else next[k]=local[k];
      if(cache.hashes)hashes[k]=cache.hashes[k]??null;
    }
    apply(next);
    cache={user:boot.user,revision:remote.revision,updatedAt:remote.updatedAt,pending:dirty.size>0,conflict,dirty:[...dirty]};
    if(remote.hashes)cache.hashes=hashes;
  }
  cache.user=boot.user;rawSet.call(localStorage,'matclub-account-owner',boot.user.id);checkpoint();
 }else if(boot.ready&&!boot.user&&owner){if(cache.pending)put('matclub-account-offline-'+owner,{data:snapshot(),cache});backup('Локальная копия после завершения сессии');apply({});rawRemove.call(localStorage,'matclub-account-owner');cache={};checkpoint()}
}catch{boot.storageError=true}
observed=snapshot();
function refreshCache(){
  const shared=read('matclub-account-cache');
  if(shared?.user?.id && shared.user.id===cache.user?.id)cache=shared;
  return cache;
}
const api={keys,refreshCache,boot,get cache(){return cache},snapshot,apply,backup,checkpoint,replaceCache(next){cache=next;checkpoint()},setOwner(id){if(id)rawSet.call(localStorage,'matclub-account-owner',id);else rawRemove.call(localStorage,'matclub-account-owner')},read,put};
function canWrite(k){
  if(muted || !keys.includes(k))return;
  const expected=(boot.user||(!boot.ready?cache.user:null))?.id||null;
  if(expected && (observed[k]??null)!==localStorage.getItem(k))throw Error('Этот раздел изменился в другой вкладке. Обнови страницу.');
  if(localStorage.getItem('matclub-account-owner')!==expected)
    throw Error('Аккаунт изменился в другой вкладке. Обнови страницу.');
}
function markPending(k){
  const currentUser=boot.user||(!boot.ready?cache.user:null);
  if(!currentUser)return;
  refreshCache();
  const next={...cache,pending:true,user:currentUser};
  if(cache.hashes)next.dirty=[...new Set([...(cache.dirty||[]),k])];
  if(!put('matclub-account-cache',next))throw Error('Браузеру не хватило места для сохранения изменений.');
  cache=next;
}
Storage.prototype.setItem=function(k,v){
  if(this!==localStorage||muted||!keys.includes(k))return rawSet.call(this,k,v);
  canWrite(k);
  if(this.getItem(k)===String(v))return;
  markPending(k);
  rawSet.call(this,k,v);observed[k]=String(v);
  window.dispatchEvent(new Event('matclub-progress-changed'));
};
Storage.prototype.removeItem=function(k){
  if(this!==localStorage||muted||!keys.includes(k))return rawRemove.call(this,k);
  canWrite(k);
  if(this.getItem(k)===null)return;
  markPending(k);
  rawRemove.call(this,k);delete observed[k];
  window.dispatchEvent(new Event('matclub-progress-changed'));
};
window.matclubAccountStore=api;
})();
