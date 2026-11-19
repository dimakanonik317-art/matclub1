const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const build=fs.readFileSync(path.join(__dirname,'build-search.cjs'),'utf8');
const ctx=vm.createContext({});vm.runInContext(build.slice(build.indexOf('for(const f'),build.indexOf('const grade6Expansion')).replaceAll('fs.readFileSync','READ').replaceAll("path.join(root,f+'.js')","f"),vm.createContext({READ:f=>fs.readFileSync(path.join(dist,f+'.js'),'utf8'),vm,c:ctx}));
const data=vm.runInContext('({tasks,lessons,curriculum,topicSubjects,topicDepth,egeTopics})',ctx);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const files={};function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(!/\.(css|html)$/.test(e.name))files[path.relative(root,p).replaceAll('\\','/')]=hash(fs.readFileSync(p));}}walk(dist);walk(path.join(root,'server'));
const snapshot={tasks:data.tasks.length,solutions:data.tasks.filter(t=>t.steps?.length).length,steps:data.tasks.reduce((a,t)=>a+(t.steps?.length||0),0),taskContent:hash(JSON.stringify(data)),ids:data.tasks.map(t=>t.id),files};
const dest=process.argv[2]||'design-baseline.json';fs.writeFileSync(dest,JSON.stringify(snapshot,null,2));console.log(JSON.stringify({tasks:snapshot.tasks,solutions:snapshot.solutions,steps:snapshot.steps,taskContent:snapshot.taskContent,files:Object.keys(files).length,dest}));
if(process.argv[3]){const old=JSON.parse(fs.readFileSync(process.argv[3]));if(old.taskContent!==snapshot.taskContent)throw Error('Educational content differs');const changed=Object.keys(old.files).filter(f=>old.files[f]!==files[f]);console.log('Changed non-style assets: '+JSON.stringify(changed));}
