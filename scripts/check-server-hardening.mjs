import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import worker,{KEYS} from '../server/worker.mjs';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
class Statement{constructor(query,args=[]){this.query=query;this.args=args}bind(...args){return new Statement(this.query,args)}async first(){return sql.prepare(this.query).get(...this.args)||null}async run(){if(beforeRun)beforeRun(this);const result=sql.prepare(this.query).run(...this.args);return{success:true,meta:{changes:result.changes}}}}
let beforeRun=null;
const DB={prepare(query){return new Statement(query)},async batch(statements){sql.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sql.exec('COMMIT');return results}catch(e){sql.exec('ROLLBACK');throw e}}};
const env={DB,ASSETS:{fetch(){return new Response('<!DOCTYPE html><html><head></head><body>School</body></html>',{headers:{'content-type':'text/html','etag':'old'}})}}};
let checks=0;const pending=[];const ctx={waitUntil(p){pending.push(p)}};
async function call(path,{method='GET',data,token,origin='https://school.test',ip='192.0.2.10'}={}){const headers={'CF-Connecting-IP':ip};if(method!=='GET'){headers.origin=origin;headers['content-type']='application/json'}if(token)headers.cookie='__Host-matclub_session='+token;const r=await worker.fetch(new Request('https://school.test'+path,{method,headers,...(data===undefined?{}:{body:JSON.stringify(data)})}),env,ctx);let body;try{body=await r.json()}catch{}checks++;return{r,body,token:r.headers.get('set-cookie')?.match(/session=([a-f0-9]+)/)?.[1]}}
function status(result,n){assert.equal(result.r.status,n,JSON.stringify(result.body))}
const logs=[],oldLog=console.error;console.error=(line)=>logs.push(JSON.parse(line));
try{
 // Liveness and guest rendering remain available without touching an unhealthy DB.
 let touched=0;const dead={prepare(){touched++;throw Error('private-db-details')},batch(){touched++;throw Error('private-db-details')}};
 const guest=await worker.fetch(new Request('https://school.test/'),{DB:dead,ASSETS:env.ASSETS},ctx);assert.equal(guest.status,200);assert.ok((await guest.text()).includes('"ready":true'));assert.equal(touched,0);
 const head=await worker.fetch(new Request('https://school.test/',{method:'HEAD'}),{DB:dead,ASSETS:env.ASSETS},ctx);assert.equal(await head.text(),'');assert.equal(touched,0);
 const health=await worker.fetch(new Request('https://school.test/api/health'),{DB:dead},ctx);assert.equal(health.status,200);assert.equal((await health.json()).scope,'worker');assert.equal(touched,0);
 const broken=await worker.fetch(new Request('https://school.test/api/me'),{DB:dead},ctx);assert.equal(broken.status,503);assert.equal(broken.headers.get('retry-after'),'15');assert.ok(!JSON.stringify(await broken.json()).includes('private-db-details'));assert.match(broken.headers.get('x-request-id'),/^[a-f0-9-]{36}$/);assert.equal(logs.at(-1).requestId,broken.headers.get('x-request-id'));
 status(await call('/api/me'),200);
 // Failure of the third registration statement must roll back the whole account.
 beforeRun=s=>{if(s.query.startsWith('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES'))throw Error('session insert failure')};
 status(await call('/api/register',{method:'POST',ip:'atomic-register',data:{login:'rollback',password:'correct-password-42'}}),503);beforeRun=null;
 assert.equal(sql.prepare('SELECT count(*) n FROM users').get().n,0);assert.equal(sql.prepare('SELECT count(*) n FROM progress').get().n,0);
 const r=await call('/api/register',{method:'POST',ip:'register',data:{login:'atomicuser',password:'correct-password-42',name:'<name>& "имя"'}});status(r,201);const id=r.body.user.id,token=r.token;
 const old=sql.prepare('SELECT * FROM users WHERE id=?').get(id);const count=()=>sql.prepare('SELECT count(*) n FROM sessions WHERE user_id=?').get(id).n;
 const page=await worker.fetch(new Request('https://school.test/',{headers:{cookie:'__Host-matclub_session='+token}}),env,ctx);const html=await page.text();const boot=JSON.parse(html.match(/window.matclubBoot=(.*?);<\/script>/)[1]);assert.equal(boot.user.name,r.body.user.name);assert.ok(!html.includes('<name>'));assert.equal(page.headers.get('cache-control'),'private, no-store');
 // A failed password transaction preserves both the old password and its sessions.
 beforeRun=s=>{if(s.query.startsWith('INSERT INTO sessions')&&s.query.includes('SELECT'))throw Error('password session failure')};
 status(await call('/api/password',{method:'POST',token,data:{currentPassword:'correct-password-42',password:'replacement-password-42'}}),503);beforeRun=null;
 assert.equal(sql.prepare('SELECT password_hash FROM users WHERE id=?').get(id).password_hash,old.password_hash);assert.equal(count(),1);assert.equal((await call('/api/me',{token})).body.user.id,id);
 // Another password update between reading credentials and inserting a session rejects the stale login.
 beforeRun=s=>{if(s.query.startsWith('INSERT INTO sessions')&&s.query.includes('SELECT')){beforeRun=null;sql.prepare('UPDATE users SET password_hash=? WHERE id=?').run('changed-by-another-request',id)}};
 status(await call('/api/login',{method:'POST',ip:'stale-login',data:{login:'atomicuser',password:'correct-password-42'}}),401);assert.equal(count(),1);sql.prepare('UPDATE users SET password_hash=? WHERE id=?').run(old.password_hash,id);
 // Compare-and-swap prevents an older password change from overwriting the newer one.
 beforeRun=s=>{if(s.query.startsWith('UPDATE users SET password_hash=')){beforeRun=null;sql.prepare('UPDATE users SET password_hash=? WHERE id=?').run('newer-password',id)}};
 status(await call('/api/password',{method:'POST',token,data:{currentPassword:'correct-password-42',password:'replacement-password-42'}}),409);assert.equal(sql.prepare('SELECT password_hash FROM users WHERE id=?').get(id).password_hash,'newer-password');assert.equal(count(),1);sql.prepare('UPDATE users SET password_hash=? WHERE id=?').run(old.password_hash,id);
 // Failed deletion rolls sessions/progress back too.
 beforeRun=s=>{if(s.query.startsWith('DELETE FROM users'))throw Error('delete failure')};
 status(await call('/api/account',{method:'DELETE',token,data:{password:'correct-password-42'}}),503);beforeRun=null;assert.equal(count(),1);status(await call('/api/progress',{token}),200);
 // Concurrent progress saves accept one revision and reject the stale overwrite.
 const writes=await Promise.all([1,2].map(n=>call('/api/progress',{method:'PUT',token,data:{revision:0,data:{'matclub-solved':JSON.stringify(['task-'+n])}}})));assert.deepEqual(writes.map(r=>r.r.status).sort(),[200,409]);assert.equal((await call('/api/progress',{token})).body.revision,1);
 const gone=await call('/api/account',{method:'DELETE',token,data:{password:'correct-password-42'}});status(gone,200);assert.equal(count(),0);assert.equal(sql.prepare('SELECT count(*) n FROM progress WHERE user_id=?').get(id).n,0);
 const ids=[guest,head,health,broken].map(r=>r.headers.get('x-request-id'));assert.equal(new Set(ids).size,4);for(const response of [guest,head,health,broken]){assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(response.headers.get('referrer-policy'),'strict-origin-when-cross-origin')}
 assert.ok(logs.length>=4);for(const line of logs){assert.deepEqual(Object.keys(line).sort(),['event','requestId','method','errorType'].sort());assert.equal(line.event,'server_error')}
 await Promise.all(pending);console.log('PASS: atomic registration/password/deletion rollback, stale credential guards, concurrent progress CAS, guest/HEAD DB isolation, liveness and private diagnostics.');
}finally{beforeRun=null;console.error=oldLog;sql.close()}
