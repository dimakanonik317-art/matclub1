import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import worker,{KEYS} from '../server/worker.mjs';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
class Statement{constructor(query,args=[]){this.query=query;this.args=args}bind(...args){return new Statement(this.query,args)}async first(){return sql.prepare(this.query).get(...this.args)||null}async run(){const result=sql.prepare(this.query).run(...this.args);return{success:true,meta:{changes:result.changes}}}}
const DB={prepare(query){return new Statement(query)},async batch(statements){sql.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sql.exec('COMMIT');return results}catch(e){sql.exec('ROLLBACK');throw e}}};
const env={DB,ASSETS:{fetch(){return new Response('<!DOCTYPE html><html><head></head><body>School</body></html>',{headers:{'content-type':'text/html','etag':'old'}})}}};
let checks=0;const pending=[];const ctx={waitUntil(p){pending.push(p)}};
async function call(path,{method='GET',data,token,origin='https://school.test',ip='192.0.2.10'}={}){const headers={'CF-Connecting-IP':ip};if(method!=='GET'){headers.origin=origin;headers['content-type']='application/json'}if(token)headers.cookie='__Host-matclub_session='+token;const r=await worker.fetch(new Request('https://school.test'+path,{method,headers,...(data===undefined?{}:{body:JSON.stringify(data)})}),env,ctx);let body;try{body=await r.json()}catch{}checks++;return{r,body,token:r.headers.get('set-cookie')?.match(/session=([a-f0-9]+)/)?.[1]}}
function status(result,n){assert.equal(result.r.status,n,JSON.stringify(result.body))}
const originalNow=Date.now;let stamp=Date.UTC(2026,10,8,12);Date.now=()=>stamp;
try{
 let invocations=0;env.AI={run:async()=>{invocations++;return{choices:[{message:{content:'Ответ'}}]}}};
 const info=await call('/api/assistant');status(info,200);assert.equal(info.body.limits.accountDaily,120);assert.ok(info.body.model.includes('gemma-4'));
 for(let i=0;i<12;i++)status(await call('/api/assistant',{method:'POST',data:{message:'Вопрос'},ip:'burst'}),200);
 let hit=await call('/api/assistant',{method:'POST',data:{message:'Вопрос'},ip:'burst'});status(hit,429);assert.ok(+hit.r.headers.get('retry-after')>0);assert.equal(invocations,12);
 sql.exec('DELETE FROM limits');
 for(let i=0;i<30;i++){if(i%12===0)stamp+=601000;status(await call('/api/assistant',{method:'POST',data:{message:'Вопрос'},ip:'guest'}),200)}
 hit=await call('/api/assistant',{method:'POST',data:{message:'Вопрос'},ip:'guest'});status(hit,429);assert.ok(hit.body.error.includes('гостя'));
 sql.exec('DELETE FROM limits');
 const registered=await call('/api/register',{method:'POST',data:{login:'aitester',password:'testPassword123'}});status(registered,201);
 for(let i=0;i<120;i++){if(i%12===0)stamp+=601000;status(await call('/api/assistant',{method:'POST',data:{message:'Вопрос'},token:registered.token,ip:'account'}),200)}
 stamp+=601000;hit=await call('/api/assistant',{method:'POST',data:{message:'Вопрос'},token:registered.token,ip:'another-ip'});status(hit,429);assert.ok(hit.body.error.includes('аккаунта'));
 sql.exec('DELETE FROM limits');
 for(let i=0;i<300;i++)status(await call('/api/assistant',{method:'POST',data:{message:'Вопрос'},ip:'site-'+i}),200);
 hit=await call('/api/assistant',{method:'POST',data:{message:'Вопрос'},ip:'site-extra'});status(hit,429);assert.ok(hit.body.error.includes('сайта'));
 sql.exec('DELETE FROM limits');let attempts=0;env.AI={run:async()=>{attempts++;throw Error('daily neurons quota exceeded')}};
 hit=await call('/api/assistant',{method:'POST',data:{message:'Вопрос'},ip:'provider'});status(hit,429);assert.ok(hit.body.error.includes('Cloudflare'));assert.ok(+hit.r.headers.get('retry-after')>0);assert.equal(attempts,1);
 env.AI={run:async()=>{throw Error('429 rate limit')}};hit=await call('/api/assistant',{method:'POST',data:{message:'Вопрос'},ip:'busy'});status(hit,429);assert.equal(hit.r.headers.get('retry-after'),'60');
 await Promise.all(pending);console.log('PASS: model metadata, 12/10min, guest30, account120 across IPs, site300, provider quota vs overload and Retry-After.');
}finally{Date.now=originalNow;sql.close()}
