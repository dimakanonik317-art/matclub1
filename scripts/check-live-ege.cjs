/* Run after deployment: node scripts/check-live-ege.cjs.
   Fails until public HTML, versioned scripts and reading page match this checkout. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../dist'),origin=(process.env.SITE_URL||'https://matclub1.dimakanonik317.workers.dev').replace(/\/$/,'');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8'),assets=[...home.matchAll(/(?:src|href)="((?:ege(?:-[a-z-]+)?|answer-set|app)\.(?:js|css)\?v=[a-f0-9]+)"/g)].map(m=>m[1]);assert.equal(assets.length,12);
const get=url=>execFileSync('curl',['-fsSL','--max-time','15',origin+url],{maxBuffer:4*1024*1024});
const publicHome=get('/?exam=ege&verify='+assets.find(s=>s.startsWith('ege-expansion')).split('=')[1]).toString('utf8');
for(const asset of assets){assert.ok(publicHome.includes('="'+asset+'"'),'deployment not current: '+asset);assert.deepEqual(get('/'+asset),fs.readFileSync(path.join(root,asset.split('?')[0])),'public asset differs: '+asset)}
assert.deepEqual(get('/ege/'),fs.readFileSync(path.join(root,'ege/index.html')),'public exam reading page differs');
console.log('PASS: published homepage, all versioned exam scripts and styles and exam reading page match tested source.');
