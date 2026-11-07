const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const c=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../dist/python-data.js'),'utf8'),c);
const course=c.window.matclubPythonCourse;
assert.equal(course.lessons.length,28);
assert.equal(course.stages.length,7);
for(let stage=1;stage<=7;stage++)assert.equal(course.lessons.filter(l=>l.stage===stage).length,4);
const exercises=course.lessons.flatMap(l=>l.exercises);
assert.equal(exercises.length,52);
assert.equal(new Set(exercises.map(e=>e.id)).size,52);
assert.equal(new Set(course.lessons.map(l=>l.id)).size,28);
for(const l of course.lessons){
  assert.equal(l.theory.length,3,l.id);
  assert.ok(l.example&&l.pitfall&&l.summary,l.id);
  for(const e of l.exercises)assert.ok(e.tests.length&&e.solution&&e.starter&&e.steps.length>=2,e.id);
}
const run=spawnSync('python3',[path.join(__dirname,'check-python.py')],{input:JSON.stringify(course),encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
if(run.status!==0)throw new Error(run.stderr||run.error?.message||'Python checks failed');
process.stdout.write(run.stdout);
console.log('PASS: 24 lessons, 4 projects, 52 exercises, seven stages and stable unique IDs.');
