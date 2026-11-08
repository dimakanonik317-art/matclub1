import data from './lexa-grant-data.mjs';
export const GRANT='owner-request-lexa-2026-11-08';
export const AWARDS=['first','ten','fifty','math','physics','python','cpp','research'];
const parse=(value,fallback)=>{try{return JSON.parse(value)||fallback}catch{return fallback}};
export async function applyGrant(db){
 await db.prepare('CREATE TABLE IF NOT EXISTS account_grants (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, complete INTEGER NOT NULL DEFAULT 0, title TEXT NOT NULL, awards TEXT NOT NULL)').run();
 let row=await db.prepare('SELECT * FROM account_grants WHERE id=?').bind(GRANT).first();
 if(!row){const target=await db.prepare('SELECT id FROM users WHERE login=?').bind('lexa').first();await db.prepare('INSERT OR IGNORE INTO account_grants (id,user_id,complete,title,awards) VALUES (?,?,?, ?,?)').bind(GRANT,target?.id||'',target?0:1,'CEO',JSON.stringify(AWARDS)).run();row=await db.prepare('SELECT * FROM account_grants WHERE id=?').bind(GRANT).first()}
 if(row.complete)return;
 for(let attempt=0;attempt<4;attempt++){
  const progress=await db.prepare('SELECT revision,document FROM progress WHERE user_id=?').bind(row.user_id).first();
  if(!progress){await db.prepare('UPDATE account_grants SET complete=1 WHERE id=?').bind(GRANT).run();return}
  const doc=parse(progress.document,{}),school=parse(doc['matclub-solved'],[]),py=parse(doc['matclub-python-v1'],{}),cpp=parse(doc['matclub-cpp-v1'],{});
  doc['matclub-solved']=JSON.stringify([...new Set([...(Array.isArray(school)?school:[]),...data.school])]);
  py.done=[...new Set([...(Array.isArray(py.done)?py.done:[]),...data.python])];cpp.done=[...new Set([...(Array.isArray(cpp.done)?cpp.done:[]),...data.cpp])];
  doc['matclub-python-v1']=JSON.stringify(py);doc['matclub-cpp-v1']=JSON.stringify(cpp);
  const result=await db.prepare('UPDATE progress SET document=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=?').bind(JSON.stringify(doc),Math.floor(Date.now()/1000),row.user_id,progress.revision).run();
  if(result.meta.changes){await db.prepare('UPDATE account_grants SET complete=1 WHERE id=?').bind(GRANT).run();return}
 }
 throw Error('Concurrent grant update');
}
export async function mark(db,id){const row=await db.prepare('SELECT title,awards FROM account_grants WHERE id=? AND user_id=? AND complete=1').bind(GRANT,id).first();return row?{title:row.title,awardedAchievements:parse(row.awards,[])}:{}}
