import {messages,answer} from './assistant.mjs';
const COOKIE='__Host-matclub_session',TTL=30*86400,ITERATIONS=100000,LIMIT=1024*1024;
export const KEYS=['matclub-saved','matclub-solved','matclub-workbook','matclub-python-v1','matclub-cpp-v1','matclub-laboratory-v1','matclub-settings-v1','matclub-graphs-v1'];
const schema=[
`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, login TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', grade INTEGER NOT NULL DEFAULT 7, created_at INTEGER NOT NULL)`,
`CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL)`,
`CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
`CREATE TABLE IF NOT EXISTS progress (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, revision INTEGER NOT NULL DEFAULT 0, document TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL)`,
`CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL)`];
const initialized=new WeakMap();
async function init(db){let promise=initialized.get(db);if(!promise){promise=db.batch(schema.map(sql=>db.prepare(sql)));initialized.set(db,promise);promise.catch(()=>initialized.delete(db))}await promise}
const now=()=>Math.floor(Date.now()/1000),enc=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const unhex=s=>Uint8Array.from(s.match(/../g)||[],b=>parseInt(b,16));
const random=(n=32)=>hex(crypto.getRandomValues(new Uint8Array(n)));
async function digest(s){return hex(await crypto.subtle.digest('SHA-256',enc.encode(s)))}
async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(salt),iterations:ITERATIONS,hash:'SHA-256'},key,256))}
function equal(a,b){let mismatch=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)mismatch|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return mismatch===0}
class ApiError extends Error{constructor(status,message){super(message);this.status=status}}
function fail(status,message){throw new ApiError(status,message)}
function json(value,status=200,headers={}){return new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...headers}})}
function cookie(token,maxAge=TTL){return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
async function body(request){if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))fail(415,'Ожидается JSON.');if(Number(request.headers.get('content-length'))>LIMIT+4096)fail(413,'Данные превышают 1 МБ. Скачай часть черновиков и сократи их объём.');const reader=request.body?.getReader();if(!reader)fail(400,'Пустой запрос.');let size=0,parts=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>LIMIT+4096){await reader.cancel();fail(413,'Данные превышают 1 МБ.')}parts.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length}try{const data=JSON.parse(new TextDecoder().decode(bytes));if(!data||typeof data!=='object'||Array.isArray(data))fail(400,'Неверный формат запроса.');return data}catch(e){if(e instanceof ApiError)throw e;fail(400,'Неверный JSON.')}}
function credentials(data){const login=typeof data.login==='string'?data.login.trim().toLowerCase():'';if(!/^[a-z0-9_]{3,24}$/.test(login))fail(400,'Логин: 3–24 латинских буквы, цифры или _.');const password=data.password;if(typeof password!=='string'||password.length<10||password.length>128)fail(400,'Пароль: от 10 до 128 символов.');return{login,password}}
function profile(data){const name=typeof data.name==='string'?data.name.trim():'';if(name.length>60||/[\u0000-\u001f]/.test(name))fail(400,'Имя: до 60 символов.');const grade=Number(data.grade??7);if(!Number.isInteger(grade)||grade<6||grade>11)fail(400,'Выбери класс с 6 по 11.');return{name,grade}}
function userView(row){return{id:row.id,login:row.login,name:row.name,grade:row.grade,createdAt:row.created_at}}
async function rate(db,kind,identity,max,period){const bucket=Math.floor(now()/period),key=await digest(`${kind}:${identity}:${bucket}`);const r=await db.prepare('INSERT INTO limits (key,hits,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits').bind(key,(bucket+2)*period).first();if(r.hits>max)fail(429,'Слишком много попыток. Подожди несколько минут и попробуй снова.')}
async function session(request,db){const token=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;return db.prepare('SELECT users.*,sessions.token_hash FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>?').bind(await digest(token),now()).first()}
async function requireUser(request,db){const u=await session(request,db);if(!u)fail(401,'Войди в аккаунт.');return u}
async function createSession(db,id){const token=random();await db.prepare('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').bind(await digest(token),id,now()+TTL).run();return token}
function validateDocument(value){if(!value||typeof value!=='object'||Array.isArray(value))fail(400,'Неверный формат прогресса.');const out={};for(const [key,text]of Object.entries(value)){if(!KEYS.includes(key)||typeof text!=='string')fail(400,'Неизвестные данные прогресса.');try{JSON.parse(text,(key,value)=>{if(['__proto__','prototype','constructor'].includes(key))throw Error();return value})}catch{fail(400,'Повреждённые данные прогресса.')}out[key]=text}const document=JSON.stringify(out);if(enc.encode(document).length>LIMIT)fail(413,'Прогресс превышает 1 МБ. Скачай и сократи большие черновики.');return document}
async function api(request,env,ctx){
 const path=new URL(request.url).pathname,method=request.method;
 if(!env.DB)return json({error:'Личный кабинет готовится: база данных ещё не подключена.',ready:false},503);
 if(!['GET','HEAD'].includes(method)){const origin=request.headers.get('origin');if(origin!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')fail(403,'Запрос с другого сайта отклонён.')}
 await init(env.DB);const db=env.DB,ip=request.headers.get('CF-Connecting-IP')||'unknown';
 if(path==='/api/assistant'&&method==='GET')return json({ready:!!env.AI,model:'llama-3.1-fast'});
 if(path==='/api/assistant'&&method==='POST'){
  if(!env.AI)fail(503,'ИИ-помощник пока не подключён.');
  const data=await body(request);let input;try{input=messages(data)}catch(e){fail(400,e.message)}
  const u=await session(request,db);await rate(db,'ai-burst',ip,6,600);await rate(db,'ai-daily',u?.id||ip,u?40:15,86400);await rate(db,'ai-total','site',100,86400);
  try{return json({answer:await answer(env.AI,input)})}catch(e){const message=String(e.message).toLowerCase();if(/terms|agreement|not enabled|activation/.test(message))fail(503,'Нужно активировать Workers AI в панели Cloudflare владельца сайта.');if(/quota|limit|neurons/.test(message))fail(429,'Лимит ИИ-сервиса исчерпан. Попробуй позже.');fail(503,'ИИ-сервис временно недоступен. Попробуй позже.')}
 }
 if(path==='/api/me'&&method==='GET'){const u=await session(request,db);return json({ready:true,user:u?userView(u):null})}
 if(path==='/api/register'&&method==='POST'){
  await rate(db,'register',ip,5,3600);const data=await body(request),{login,password}=credentials(data),p=profile(data),salt=random(16),id=crypto.randomUUID(),hash=await passwordHash(password,salt);
  // batch is atomic: a duplicate login cannot leave an orphan progress row.
  try{await db.batch([db.prepare('INSERT INTO users (id,login,password_hash,salt,name,grade,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,login,hash,salt,p.name,p.grade,now()),db.prepare('INSERT INTO progress (user_id,updated_at) VALUES (?,?)').bind(id,now())])}catch(e){if(String(e).includes('UNIQUE'))fail(409,'Этот логин уже занят.');throw e}
  const token=await createSession(db,id);return json({user:{id,login,...p,createdAt:now()}},201,{'set-cookie':cookie(token)})
 }
 if(path==='/api/login'&&method==='POST'){
  await rate(db,'login-ip',ip,30,600);const data=await body(request),{login,password}=credentials(data);await rate(db,'login-name',login,20,600);const u=await db.prepare('SELECT * FROM users WHERE login=?').bind(login).first();const hash=await passwordHash(password,u?.salt||'00000000000000000000000000000000');if(!u||!equal(hash,u.password_hash))fail(401,'Неверный логин или пароль.');const token=await createSession(db,u.id);return json({user:userView(u)},200,{'set-cookie':cookie(token)})
 }
 if(path==='/api/logout'&&method==='POST'){const u=await session(request,db);if(u)await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(u.token_hash).run();return json({ok:true},200,{'set-cookie':cookie('',0)})}
 if(path==='/api/profile'&&method==='PUT'){const u=await requireUser(request,db),p=profile(await body(request));await db.prepare('UPDATE users SET name=?,grade=? WHERE id=?').bind(p.name,p.grade,u.id).run();return json({user:userView({...u,...p})})}
 if(path==='/api/password'&&method==='POST'){const u=await requireUser(request,db);await rate(db,'password',u.id,5,600);const data=await body(request);if(typeof data.currentPassword!=='string'||data.currentPassword.length>128||!equal(await passwordHash(data.currentPassword,u.salt),u.password_hash))fail(401,'Текущий пароль неверен.');const {password}=credentials({login:u.login,password:data.password}),salt=random(16),hash=await passwordHash(password,salt);await db.batch([db.prepare('UPDATE users SET password_hash=?,salt=? WHERE id=?').bind(hash,salt,u.id),db.prepare('DELETE FROM sessions WHERE user_id=?').bind(u.id)]);const token=await createSession(db,u.id);return json({ok:true},200,{'set-cookie':cookie(token)})}
 if(path==='/api/account'&&method==='DELETE'){const u=await requireUser(request,db);await rate(db,'delete',u.id,5,600);const data=await body(request);if(typeof data.password!=='string'||data.password.length>128||!equal(await passwordHash(data.password,u.salt),u.password_hash))fail(401,'Пароль неверен.');await db.batch([db.prepare('DELETE FROM sessions WHERE user_id=?').bind(u.id),db.prepare('DELETE FROM progress WHERE user_id=?').bind(u.id),db.prepare('DELETE FROM users WHERE id=?').bind(u.id)]);return json({ok:true},200,{'set-cookie':cookie('',0)})}
 if(path==='/api/progress'&&method==='GET'){const u=await requireUser(request,db),p=await db.prepare('SELECT revision,document,updated_at FROM progress WHERE user_id=?').bind(u.id).first();return json({revision:p.revision,data:JSON.parse(p.document),updatedAt:p.updated_at})}
 if(path==='/api/progress'&&method==='PUT'){const u=await requireUser(request,db);await rate(db,'sync',u.id,120,600);const data=await body(request);if(!Number.isSafeInteger(data.revision)||data.revision<0)fail(400,'Неверная версия прогресса.');const document=validateDocument(data.data),result=await db.prepare('UPDATE progress SET revision=revision+1,document=?,updated_at=? WHERE user_id=? AND revision=?').bind(document,now(),u.id,data.revision).run();if(!result.meta.changes)return json({error:'Прогресс изменён на другом устройстве. Выбери версию в кабинете.',conflict:true},409);return json({revision:data.revision+1,updatedAt:now()})}
 fail(404,'Метод API не найден.');
}
async function page(request,env){
 const response=await env.ASSETS.fetch(request),path=new URL(request.url).pathname;
 if(!['/','/index.html'].includes(path)||!response.headers.get('content-type')?.includes('text/html'))return response;
 let boot={ready:false,user:null};try{if(env.DB){await init(env.DB);const u=await session(request,env.DB);boot={ready:true,user:u?userView(u):null};if(u){const p=await env.DB.prepare('SELECT revision,document,updated_at FROM progress WHERE user_id=?').bind(u.id).first();boot.progress={revision:p.revision,data:JSON.parse(p.document),updatedAt:p.updated_at}}}}catch{}
 const payload=JSON.stringify(boot).replace(/</g,'\\u003c'),html=(await response.text()).replace('<head>','<head><script>window.matclubBoot='+payload+';</script>');const headers=new Headers(response.headers);headers.set('cache-control','private, no-store');headers.set('vary','Cookie');headers.delete('etag');headers.delete('content-length');return new Response(html,{status:response.status,headers});
}
export default {async fetch(request,env,ctx){if(!new URL(request.url).pathname.startsWith('/api/'))return page(request,env);try{const response=await api(request,env,ctx);if(env.DB&&ctx?.waitUntil&&Math.random()<.02)ctx.waitUntil(env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE expires_at<?').bind(now()),env.DB.prepare('DELETE FROM limits WHERE expires_at<?').bind(now())]).catch(()=>{}));return response}catch(e){if(e instanceof ApiError)return json({error:e.message},e.status);return json({error:'Сервер временно недоступен. Прогресс на устройстве сохранён.'},503)}}};
