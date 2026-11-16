/* Run after changing lesson content. SITE_URL must be the public canonical origin. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../dist'),origin=(process.env.SITE_URL||'https://matclub1.dimakanonik317.workers.dev').replace(/\/$/,'');const c=vm.createContext({});
for(const f of ['data','lessons','challenges','expansion','deepening','physics','physics-grade7-expansion','physics-grade8-expansion','physics-grade9-expansion','depth','advanced','grade10','strong','final-tasks','intensive','olympiad','olympiad-fifty','intensive-next','grade6-practice','grade6-expansion','grade7-practice','grade7-expansion','grade8-practice','grade8-expansion','grade9-practice','grade9-rational-fractions','grade9-expansion','grade10-practice','grade10-expansion','grade11-practice','ege','ege-expansion','ege-probability','ege-statistics','ege-algebra','ege-equations','ege-inequalities','ege-functions','ege-graph-variants','ege-derivatives','ege-derivative-expansion','ege-word','ege-applied-expansion','ege-economics','ege-economics-expansion','ege-numbers','ege-numbers-expansion','ege-vectors','ege-stereo','ege-stereo-extra','ege-solid-figures','oge-numbers','oge-ratios','oge-expressions','oge-equations','oge-inequalities','oge-functions','oge-sequences','oge-word-problems','oge-tables','oge-statistics','oge-probability','oge-triangles','oge-quadrilaterals','oge-circle','oge-areas','oge-geometry-models','oge-physics-mechanics','oge-physics-thermal','oge-physics-electricity','oge-physics-magnetism','oge-physics-optics','oge-physics-atomic','oge-physics-experiment','ege-source-expansion','ege-figures','ege-expression-expansion'])vm.runInContext(fs.readFileSync(path.join(root,f+'.js'),'utf8'),c);
const grade6Expansion=vm.runInContext('tasks.filter(t=>t.id.startsWith("grade6-expansion-"))',c);
if(grade6Expansion.length!==400)throw new Error(`Expected 400 grade 6 expansion tasks, found ${grade6Expansion.length}`);
if(grade6Expansion.some(t=>t.grade!==6||t.level<0||t.level>2||!Number.isFinite(t.answer)||t.steps?.length<2))throw new Error('Grade 6 expansion tasks must be solved, non-olympiad tasks for grade 6 only');
for(let topic=0;topic<7;topic++)for(let level=0;level<3;level++){
 const count=grade6Expansion.filter(t=>t.topic===topic&&t.level===level).length;
 const expected=topic===0&&level===0?20:19;
 if(count!==expected)throw new Error(`Grade 6 topic ${topic}, level ${level}: expected ${expected} tasks, found ${count}`);
}
if(new Set(grade6Expansion.map(t=>t.id)).size!==400||new Set(grade6Expansion.map(t=>t.question)).size!==400)throw new Error('Grade 6 expansion task IDs and prompts must be unique');
const grade7Expansion=vm.runInContext('tasks.filter(t=>t.id.startsWith("grade7-expansion-"))',c);
if(grade7Expansion.length!==400)throw new Error(`Expected 400 grade 7 expansion tasks, found ${grade7Expansion.length}`);
if(grade7Expansion.some(t=>t.grade!==7||t.topic<0||t.topic>17||!Number.isInteger(t.level)||t.level<0||t.level>2||!Number.isFinite(t.answer)||!t.steps?.length||t.steps.some(s=>!String(s).trim())||t.isNew||t.exam||t.olympiad||t.domain!==(t.topic>=10?'physics':'math')||(t.domain==='physics'&&!t.unit)))throw new Error('Grade 7 expansion tasks must be complete non-olympiad tasks without new badges and must match their curriculum domains');
const grade7PhysicsExpansion=vm.runInContext('tasks.filter(t=>t.id.startsWith("physics-grade7-expansion-"))',c),physicsCellCounts=[[17,17,16],[17,16,17],[16,17,17],[17,17,16],[17,16,17],[17,16,17],[16,17,17],[16,17,17]];
if(grade7PhysicsExpansion.length!==400)throw new Error(`Expected 400 grade 7 physics tasks, found ${grade7PhysicsExpansion.length}`);
if(grade7PhysicsExpansion.some(t=>t.grade!==7||t.topic<10||t.topic>17||t.domain!=='physics'||!Number.isInteger(t.level)||t.level<0||t.level>2||!Number.isFinite(t.answer)||!t.unit||!t.steps?.length||t.steps.some(s=>!String(s).trim())||t.isNew||t.exam||t.olympiad))throw new Error('Grade 7 physics additions must be complete regular tasks on levels 0–2 only');
for(let topic=10;topic<=17;topic++)for(let level=0;level<3;level++){const count=grade7PhysicsExpansion.filter(t=>t.topic===topic&&t.level===level).length,expected=physicsCellCounts[topic-10][level];if(count!==expected)throw new Error(`Grade 7 physics topic ${topic}, level ${level}: expected ${expected} tasks, found ${count}`)}
const existingGrade7PhysicsQuestions=new Set(vm.runInContext('tasks.filter(t=>t.grade===7&&t.domain==="physics"&&!t.id.startsWith("physics-grade7-expansion-")).map(t=>t.question)',c));
if(new Set(grade7PhysicsExpansion.map(t=>t.id)).size!==400||new Set(grade7PhysicsExpansion.map(t=>t.question)).size!==400||grade7PhysicsExpansion.some(t=>existingGrade7PhysicsQuestions.has(t.question)))throw new Error('Grade 7 physics additions must have unique IDs and questions without duplicating existing physics tasks');
const extraGrade7Topics=new Set([0,5,10,15]),grade7Levels=grade7Expansion.reduce((a,t)=>(a[t.level]++,a),[0,0,0]);
for(let topic=0;topic<18;topic++){
 const count=grade7Expansion.filter(t=>t.topic===topic).length;
 if(count!==(extraGrade7Topics.has(topic)?23:22))throw new Error(`Grade 7 topic ${topic}: unexpected task count ${count}`);
 for(let level=0;level<3;level++){
  const expected=7+(topic%3===level||((topic===0&&level===1)||(topic===5&&level===0)||(topic===10&&level===0)||(topic===15&&level===2))?1:0);
  const cell=grade7Expansion.filter(t=>t.topic===topic&&t.level===level).length;
  if(cell!==expected)throw new Error(`Grade 7 topic ${topic}, level ${level}: expected ${expected}, found ${cell}`);
 }
}
if(grade7Levels[0]!==134||grade7Levels[1]!==133||grade7Levels[2]!==133)throw new Error(`Grade 7 level totals are not even: ${grade7Levels.join(', ')}`);
if(grade7Expansion.filter(t=>t.domain==='math').length!==222||grade7Expansion.filter(t=>t.domain==='physics').length!==178)throw new Error('Grade 7 math and physics task totals do not match the 18-topic balance');
if(new Set(grade7Expansion.map(t=>t.id)).size!==400||new Set(grade7Expansion.map(t=>t.question)).size!==400)throw new Error('Grade 7 expansion task IDs and prompts must be unique');
const grade8Expansion=vm.runInContext('tasks.filter(t=>t.id.startsWith("grade8-expansion-"))',c);
if(grade8Expansion.length!==400)throw new Error(`Expected 400 grade 8 expansion tasks, found ${grade8Expansion.length}`);
if(grade8Expansion.some(t=>t.grade!==8||t.domain!=='math'||t.topic<0||t.topic>8||!Number.isInteger(t.level)||t.level<0||t.level>2||!Number.isFinite(t.answer)||!t.steps?.length||t.steps.some(s=>!String(s).trim())||t.isNew||t.exam||t.olympiad))throw new Error('Grade 8 expansion tasks must be complete math tasks for levels 0–2 only');
const grade8Extras=[new Set([1,2,4,5,7]),new Set([0,2,3,8]),new Set([0,1,3,6])],grade8Levels=grade8Expansion.reduce((a,t)=>(a[t.level]++,a),[0,0,0]);
for(let topic=0;topic<9;topic++){
 const topicCount=grade8Expansion.filter(t=>t.topic===topic).length;
 if(topicCount!==(topic<4?45:44))throw new Error(`Grade 8 topic ${topic}: expected ${topic<4?45:44} tasks, found ${topicCount}`);
 for(let level=0;level<3;level++){
  const expected=14+(topic%3===level||grade8Extras[level].has(topic)?1:0);
  const cell=grade8Expansion.filter(t=>t.topic===topic&&t.level===level).length;
  if(cell!==expected)throw new Error(`Grade 8 topic ${topic}, level ${level}: expected ${expected}, found ${cell}`);
 }
}
if(grade8Levels[0]!==134||grade8Levels[1]!==133||grade8Levels[2]!==133)throw new Error(`Grade 8 level totals are not even: ${grade8Levels.join(', ')}`);
if(new Set(grade8Expansion.map(t=>t.id)).size!==400||new Set(grade8Expansion.map(t=>t.question)).size!==400)throw new Error('Grade 8 expansion task IDs and prompts must be unique');
const grade9Expansion=vm.runInContext('tasks.filter(t=>t.id.startsWith("grade9-expansion-"))',c);
if(grade9Expansion.length!==400)throw new Error(`Expected 400 grade 9 expansion tasks, found ${grade9Expansion.length}`);
const grade9MathTopics=[0,1,2,3,4,5,6,7,8,9,10,19],grade9Extras=new Set(['0-0','1-1','2-2','3-0']),grade9Levels=grade9Expansion.reduce((a,t)=>(a[t.level]++,a),[0,0,0]);
if(grade9Expansion.some(t=>t.grade!==9||t.domain!=='math'||!grade9MathTopics.includes(t.topic)||!Number.isInteger(t.level)||t.level<0||t.level>2||!Number.isFinite(t.answer)||!t.steps?.length||t.steps.some(s=>!String(s).trim())||t.isNew||t.exam||t.olympiad))throw new Error('Grade 9 expansion tasks must be complete regular math tasks on levels 0–2 only');
for(const topic of grade9MathTopics){
 const topicCount=grade9Expansion.filter(t=>t.topic===topic).length;
 const topicExpected=topic<4?34:33;
 if(topicCount!==topicExpected)throw new Error(`Grade 9 topic ${topic}: expected ${topicExpected} tasks, found ${topicCount}`);
 for(let level=0;level<3;level++){
  const expected=11+Number(grade9Extras.has(`${topic}-${level}`));
  const cell=grade9Expansion.filter(t=>t.topic===topic&&t.level===level).length;
  if(cell!==expected)throw new Error(`Grade 9 topic ${topic}, level ${level}: expected ${expected}, found ${cell}`);
 }
}
if(grade9Levels[0]!==134||grade9Levels[1]!==133||grade9Levels[2]!==133)throw new Error(`Grade 9 level totals are not even: ${grade9Levels.join(', ')}`);
const oldGrade9MathQuestions=new Set(vm.runInContext('tasks.filter(t=>t.grade===9&&t.domain==="math"&&!t.id.startsWith("grade9-expansion-")).map(t=>t.question)',c));
if(new Set(grade9Expansion.map(t=>t.id)).size!==400||new Set(grade9Expansion.map(t=>t.question)).size!==400||grade9Expansion.some(t=>oldGrade9MathQuestions.has(t.question)))throw new Error('Grade 9 expansion task IDs and prompts must be unique and not repeat existing grade 9 math tasks');
const grade10Expansion=vm.runInContext('tasks.filter(t=>t.id.startsWith("grade10-expansion-"))',c);
if(grade10Expansion.length!==400)throw new Error(`Expected 400 grade 10 expansion tasks, found ${grade10Expansion.length}`);
const grade10Extras=new Set(['0-0','1-0','2-0','3-0','4-1','5-1','6-1','7-2','8-2','9-2']),grade10Levels=grade10Expansion.reduce((a,t)=>(a[t.level]++,a),[0,0,0]),grade10Subjects=vm.runInContext('topicSubjects',c);
if(grade10Expansion.some(t=>t.grade!==10||t.domain!=='math'||t.topic<0||t.topic>9||t.subject!==grade10Subjects[`10-${t.topic}`]||!Number.isInteger(t.level)||t.level<0||t.level>2||!Number.isFinite(t.answer)||!t.steps?.length||t.steps.some(s=>!String(s).trim())||t.isNew||t.exam||t.olympiad||([2,4,5,6,7].includes(t.topic)&&!t.figure)|| (t.topic===4&&!t.figure?.vectors?.length)))throw new Error('Grade 10 expansion must contain complete non-Olympiad math tasks and figures for geometry topics');
for(let topic=0;topic<10;topic++){
 const topicCount=grade10Expansion.filter(t=>t.topic===topic).length;
 if(topicCount!==40)throw new Error(`Grade 10 topic ${topic}: expected 40 tasks, found ${topicCount}`);
 for(let level=0;level<3;level++){
  const expected=13+Number(grade10Extras.has(`${topic}-${level}`));
  const cell=grade10Expansion.filter(t=>t.topic===topic&&t.level===level).length;
  if(cell!==expected)throw new Error(`Grade 10 topic ${topic}, level ${level}: expected ${expected}, found ${cell}`);
 }
}
if(grade10Levels[0]!==134||grade10Levels[1]!==133||grade10Levels[2]!==133)throw new Error(`Grade 10 level totals are not even: ${grade10Levels.join(', ')}`);
const oldGrade10MathQuestions=new Set(vm.runInContext('tasks.filter(t=>t.grade===10&&t.domain==="math"&&!t.id.startsWith("grade10-expansion-")).map(t=>t.question)',c));
if(new Set(grade10Expansion.map(t=>t.id)).size!==400||new Set(grade10Expansion.map(t=>t.question)).size!==400||grade10Expansion.some(t=>oldGrade10MathQuestions.has(t.question)))throw new Error('Grade 10 task IDs and prompts must be unique and avoid existing math questions');
for(const t of vm.runInContext('tasks',c).filter(t=>t.examTopic==='vectors'))if(!t.figure?.vectors?.length)throw new Error('Vector task requires a diagram: '+t.id);
for(const t of vm.runInContext('tasks',c).filter(t=>t.examTopic==='functions'))if(!t.figure?.curves?.length)throw new Error('Function task requires a graph: '+t.id);
for(const t of vm.runInContext('tasks',c).filter(t=>t.examTopic==='stereometry'))if(!t.figure)throw new Error('Stereo task requires a diagram: '+t.id);
const ogeInequalities=vm.runInContext('tasks.filter(t=>t.examTopic==="inequalities"&&t.exam==="oge")',c);
if(ogeInequalities.length!==100)throw new Error('Expected 100 OGE inequality tasks, found '+ogeInequalities.length);
for(const t of ogeInequalities)if(t.answerType!=='set'||!Array.isArray(t.answerSet)||!t.source?.url)throw new Error('OGE inequality task needs a checked interval answer and source: '+t.id);
const ogeSequences=vm.runInContext('tasks.filter(t=>t.examTopic==="sequences"&&t.exam==="oge")',c);
if(ogeSequences.length!==100)throw new Error('Expected 100 OGE sequence tasks, found '+ogeSequences.length);
for(const t of ogeSequences)if(!Number.isFinite(t.answer)||!t.steps?.length||!t.source?.url)throw new Error('OGE sequence task needs a numeric answer, solution, and source: '+t.id);
const ogeWordProblems=vm.runInContext('tasks.filter(t=>t.examTopic==="word-problems"&&t.exam==="oge")',c);
if(ogeWordProblems.length!==100)throw new Error('Expected 100 OGE word problems, found '+ogeWordProblems.length);
for(const t of ogeWordProblems)if(!Number.isFinite(t.answer)||!t.steps?.length||!t.source?.url)throw new Error('OGE word problem needs a numeric answer, solution, and source: '+t.id);
const ogeTriangles=vm.runInContext('tasks.filter(t=>t.examTopic==="triangles"&&t.exam==="oge")',c);
if(ogeTriangles.length!==100)throw new Error('Expected 100 OGE triangle tasks, found '+ogeTriangles.length);
for(const t of ogeTriangles)if(!Number.isFinite(t.answer)||t.answer<=0||!t.steps?.length||!t.figure?.geometry)throw new Error('OGE triangle task needs a positive answer, solution, and diagram: '+t.id);
const ogeQuadrilaterals=vm.runInContext('tasks.filter(t=>t.examTopic==="quadrilaterals"&&t.exam==="oge")',c);
if(ogeQuadrilaterals.length!==100)throw new Error('Expected 100 OGE quadrilateral tasks, found '+ogeQuadrilaterals.length);
for(const t of ogeQuadrilaterals)if(!Number.isFinite(t.answer)||t.answer<=0||!t.steps?.length||!t.figure?.geometry)throw new Error('OGE quadrilateral task needs a positive answer, solution, and diagram: '+t.id);
const ogeCircle=vm.runInContext('tasks.filter(t=>t.examTopic==="circle"&&t.exam==="oge")',c);
if(ogeCircle.length!==100)throw new Error('Expected 100 OGE circle tasks, found '+ogeCircle.length);
for(const t of ogeCircle)if(!Number.isFinite(t.answer)||t.answer<=0||!t.steps?.length||!t.figure?.geometry?.circles?.length)throw new Error('OGE circle task needs a positive answer, solution, and circle diagram: '+t.id);
const ogeAreas=vm.runInContext('tasks.filter(t=>t.examTopic==="areas"&&t.exam==="oge")',c);
if(ogeAreas.length!==100)throw new Error('Expected 100 OGE area tasks, found '+ogeAreas.length);
for(const t of ogeAreas)if(!Number.isFinite(t.answer)||t.answer<=0||!t.steps?.length||!t.figure?.geometry)throw new Error('OGE area task needs a positive answer, solution, and diagram: '+t.id);
const ogeGeometryModels=vm.runInContext('tasks.filter(t=>t.examTopic==="geometry-models"&&t.exam==="oge")',c);
if(ogeGeometryModels.length!==100)throw new Error('Expected 100 OGE coordinate geometry tasks, found '+ogeGeometryModels.length);
for(const t of ogeGeometryModels)if(!Number.isFinite(t.answer)||!t.steps?.length||!Array.isArray(t.figure?.range)||!t.figure?.points)throw new Error('OGE coordinate task needs a numeric answer, solution, and coordinate diagram: '+t.id);
const ogePhysicsMechanics=vm.runInContext('tasks.filter(t=>t.examTopic==="physics-mechanics"&&t.exam==="oge")',c);
if(ogePhysicsMechanics.length!==100)throw new Error(`Expected 100 OGE physics mechanics tasks, found ${ogePhysicsMechanics.length}`);
if(ogePhysicsMechanics.some(t=>t.grade!==9||t.domain!=="physics"||t.subject!=="physics"||t.topicName!=="Механические явления"||t.challenge||t.olympiad||!Number.isFinite(t.answer)||!t.unit||!t.steps?.length||!t.source?.url||!t.figure))throw new Error('OGE mechanics tasks must be complete grade-nine physics tasks with sources and diagrams');
if(new Set(ogePhysicsMechanics.map(t=>t.id)).size!==100||new Set(ogePhysicsMechanics.map(t=>t.question)).size!==100)throw new Error('OGE mechanics task IDs and prompts must be unique');const ogePhysicsThermal=vm.runInContext('tasks.filter(t=>t.examTopic==="physics-thermal"&&t.exam==="oge")',c);
if(ogePhysicsThermal.length!==100)throw new Error(`Expected 100 OGE thermal physics tasks, found ${ogePhysicsThermal.length}`);
if(ogePhysicsThermal.some(t=>t.grade!==9||t.domain!=="physics"||t.subject!=="physics"||t.topicName!=="Тепловые явления"||t.challenge||t.olympiad||!Number.isFinite(t.answer)||!t.unit||!t.steps?.length||!t.source?.url||!t.figure||(t.sourceCategory<162||t.sourceCategory>172)||t.source.id!==t.sourceId||t.source.type!==t.sourceType||t.source.url!==`https://phys-oge.sdamgia.ru/problem?id=${t.sourceId}`))throw new Error('OGE thermal tasks must be complete grade-nine physics tasks with sources and diagrams');
const thermalCounts=[7,7,6,8,8,14,12,8,7,12,11];
for(let topic=1;topic<=11;topic++)if(ogePhysicsThermal.filter(t=>t.sourceCategory===161+topic).length!==thermalCounts[topic-1])throw new Error(`OGE thermal topic 2.${topic}: unexpected task count`);
if(new Set(ogePhysicsThermal.map(t=>t.id)).size!==100||new Set(ogePhysicsThermal.map(t=>t.question)).size!==100)throw new Error('OGE thermal task IDs and prompts must be unique');const ogePhysicsElectricity=vm.runInContext('tasks.filter(t=>t.examTopic==="physics-electricity"&&t.exam==="oge")',c);
if(ogePhysicsElectricity.length!==100)throw new Error(`Expected 100 OGE electricity tasks, found ${ogePhysicsElectricity.length}`);
if(ogePhysicsElectricity.some(t=>t.grade!==9||t.domain!=="physics"||t.subject!=="physics"||t.topicName!=="Электрические явления и цепи"||t.challenge||t.olympiad||!Number.isFinite(t.answer)||!t.unit||!t.steps?.length||!t.source?.url||!t.figure||(t.figure.geometry&&!t.figure.geometry.symbols?.length&&!t.figure.dataChart)||t.sourceCategory!==14||t.source.id!==t.sourceId||t.source.type!==t.sourceType||t.source.url!==`https://phys-oge.sdamgia.ru/problem?id=${t.sourceId}`))throw new Error('OGE electricity tasks must be complete grade-nine physics tasks with diagrams and sources');
if(new Set(ogePhysicsElectricity.map(t=>t.id)).size!==100||new Set(ogePhysicsElectricity.map(t=>t.question)).size!==100)throw new Error('OGE electricity task IDs and prompts must be unique');const ogePhysicsMagnetism=vm.runInContext('tasks.filter(t=>t.examTopic==="physics-magnetism"&&t.exam==="oge")',c);
if(ogePhysicsMagnetism.length!==100)throw new Error(`Expected 100 OGE magnetism tasks, found ${ogePhysicsMagnetism.length}`);
if(ogePhysicsMagnetism.some(t=>t.grade!==9||t.domain!=="physics"||t.subject!=="physics"||t.topicName!=="Магнитные явления"||t.challenge||t.olympiad||!Number.isFinite(t.answer)||!t.unit||!t.steps?.length||!t.source?.url||!t.figure?.geometry?.magnetic||t.sourceCategory!==71||t.source.id!==t.sourceId||t.source.type!==t.sourceType||t.source.url!==`https://phys-oge.sdamgia.ru/problem?id=${t.sourceId}`))throw new Error('OGE magnetism tasks must be complete grade-nine physics tasks with magnetic diagrams and sources');
if(new Set(ogePhysicsMagnetism.map(t=>t.id)).size!==100||new Set(ogePhysicsMagnetism.map(t=>t.question)).size!==100)throw new Error('OGE magnetism task IDs and prompts must be unique');
const ogePhysicsOptics=vm.runInContext('tasks.filter(t=>t.examTopic==="physics-optics"&&t.exam==="oge")',c);
if(ogePhysicsOptics.length!==100)throw new Error(`Expected 100 OGE optics tasks, found ${ogePhysicsOptics.length}`);
if(ogePhysicsOptics.some(t=>t.grade!==9||t.domain!=="physics"||t.subject!=="physics"||t.topicName!=="Оптические явления"||t.challenge||t.olympiad||!Number.isFinite(t.answer)||!t.unit||!t.steps?.length||!t.source?.url||!t.figure?.geometry?.optics||(t.sourceCategory<187||t.sourceCategory>192)||t.source.id!==t.sourceId||t.source.type!==t.sourceType||t.source.url!==`https://phys-oge.sdamgia.ru/problem?id=${t.sourceId}`))throw new Error('OGE optics tasks must be complete grade-nine physics tasks with optical illustrations and sources');
const opticsCounts=[15,17,17,16,19,16];
for(let section=1;section<=6;section++)if(ogePhysicsOptics.filter(t=>t.sourceCategory===186+section).length!==opticsCounts[section-1])throw new Error(`OGE optics section 3.${section+14}: unexpected task count`);
if(ogePhysicsOptics.some(t=>!t.figure.geometry.optics.kind||(!t.figure.geometry.optics.rays?.length&&!t.figure.geometry.optics.lenses?.length&&!t.figure.geometry.optics.mirrors?.length&&!t.figure.geometry.optics.eyes?.length)))throw new Error('Every OGE optics task must include an optical ray or apparatus diagram');
if(new Set(ogePhysicsOptics.map(t=>t.id)).size!==100||new Set(ogePhysicsOptics.map(t=>t.question)).size!==100)throw new Error('OGE optics task IDs and prompts must be unique');
const ogePhysicsAtomic=vm.runInContext('tasks.filter(t=>t.examTopic==="physics-atomic"&&t.exam==="oge")',c);
if(ogePhysicsAtomic.length!==100)throw new Error(`Expected 100 OGE atomic physics tasks, found ${ogePhysicsAtomic.length}`);
if(ogePhysicsAtomic.some(t=>t.grade!==9||t.domain!=="physics"||t.subject!=="physics"||t.topicName!=="Атомная и ядерная физика"||t.challenge||t.olympiad||!Number.isFinite(t.answer)||!t.unit||!t.steps?.length||!t.source?.url||!t.figure?.geometry?.atomic||(t.sourceCategory<193||t.sourceCategory>196)||t.source.id!==t.sourceId||t.source.type!==t.sourceType||t.source.url!==`https://phys-oge.sdamgia.ru/problem?id=${t.sourceId}`))throw new Error('OGE atomic physics tasks need complete solutions, Reshu OGE sources, and diagrams');
const atomicCounts=[25,25,25,25];
for(let section=1;section<=4;section++)if(ogePhysicsAtomic.filter(t=>t.sourceCategory===192+section).length!==atomicCounts[section-1])throw new Error(`OGE atomic physics section 4.${section}: unexpected task count`);
if(ogePhysicsAtomic.some(t=>!t.figure.geometry.atomic.kind))throw new Error('Every OGE atomic physics task must have an atomic diagram');
if(new Set(ogePhysicsAtomic.map(t=>t.id)).size!==100||new Set(ogePhysicsAtomic.map(t=>t.question)).size!==100)throw new Error('OGE atomic physics IDs and prompts must be unique');const ogePhysicsExperiment=vm.runInContext('tasks.filter(t=>t.examTopic==="physics-experiment"&&t.exam==="oge")',c);
if(ogePhysicsExperiment.length!==100)throw new Error(`Expected 100 OGE measurement and experiment tasks, found ${ogePhysicsExperiment.length}`);
if(ogePhysicsExperiment.some(t=>t.grade!==9||t.domain!=="physics"||t.subject!=="physics"||t.topicName!=="Измерения и эксперимент"||t.challenge||t.olympiad||!Number.isFinite(t.answer)||!t.unit||!t.steps?.length||!t.source?.url||!t.figure?.geometry?.experiment||t.sourceCategory!==215||t.source.id!==t.sourceId||t.source.type!==t.sourceType||t.source.url!==`https://phys-oge.sdamgia.ru/problem?id=${t.sourceId}`))throw new Error('OGE measurement and experiment tasks need complete solutions, Reshu OGE sources, and diagrams');
for(let section=1;section<=10;section++)if(ogePhysicsExperiment.filter(t=>t.experimentSection===section).length!==10)throw new Error(`OGE experiment section ${section}: expected 10 tasks`);
if(new Set(ogePhysicsExperiment.map(t=>t.id)).size!==100||new Set(ogePhysicsExperiment.map(t=>t.question)).size!==100)throw new Error('OGE experiment task IDs and prompts must be unique');// Content-based asset URLs prevent a previous exam bank from surviving an update.
const crypto=require('node:crypto');
const homeFile=path.join(root,'index.html');
let home=fs.readFileSync(homeFile,'utf8');
for(const asset of ['olympiad-fifty.js','app.css','physics-grade7-expansion.js','physics-grade8-expansion.js','physics-grade9-expansion.js','account.js','desk.js','editorial.css','grade6-practice.js','grade6-expansion.js','grade7-practice.js','grade7-expansion.js','grade8-practice.js','grade8-expansion.js','grade9-practice.js','grade9-rational-fractions.js','grade9-expansion.js','grade10-practice.js','grade10-expansion.js','grade11-practice.js','ege.js','ege-expansion.js','ege-probability.js','ege-statistics.js','ege-algebra.js','ege-equations.js','ege-inequalities.js','ege-functions.js','ege-graph-variants.js','ege-derivatives.js','ege-derivative-expansion.js','ege-word.js','ege-applied-expansion.js','ege-economics.js','ege-economics-expansion.js','ege-numbers.js','ege-numbers-expansion.js','ege-vectors.js','ege-stereo.js','ege-stereo-extra.js','ege-solid-figures.js','oge-numbers.js','oge-ratios.js','oge-expressions.js','oge-equations.js','oge-inequalities.js','oge-functions.js','oge-sequences.js','oge-word-problems.js','oge-tables.js','oge-statistics.js','oge-probability.js','oge-triangles.js','oge-quadrilaterals.js','oge-circle.js','oge-areas.js','oge-geometry-models.js','oge-physics-mechanics.js','oge-physics-thermal.js','oge-physics-electricity.js','oge-physics-magnetism.js','oge-physics-optics.js','oge-physics-atomic.js','oge-physics-experiment.js','ege-source-expansion.js','ege-figures.js','ege-expression-expansion.js','answer-set.js','app.js','assistant.js','experience.js','experience.css','fractions.js','fractions.css','ege.css']){
 const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,asset))).digest('hex').slice(0,12);
 const attr=asset.endsWith('.css')?'href':'src';
 const pattern=new RegExp(attr+'="'+asset.replace('.', '\\.')+'(?:\\?[^" ]*)?"','g');
 home=home.replace(pattern,attr+'="'+asset+'?v='+hash+'"');
}
fs.writeFileSync(homeFile,home);
const data=vm.runInContext('({curriculum,lessons,topicSubjects,topicDepth,tasks,egeTopics})',c),esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));const taskLabel=n=>{const last100=n%100,last=n%10;return n+' '+(last100>=11&&last100<=14?'задач':last===1?'задача':last>=2&&last<=4?'задачи':'задач')};
const fractionCssVersion=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'fractions.css'))).digest('hex').slice(0,12),fractionJsVersion=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'fractions.js'))).digest('hex').slice(0,12);
const shell=(title,description,url,body,structured)=>`<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${url}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><link rel="stylesheet" href="/app.css"><link rel="stylesheet" href="/search.css"><link rel="stylesheet" href="/fractions.css?v=${fractionCssVersion}"><script defer src="/fractions.js?v=${fractionJsVersion}"></script><link rel="icon" href="/icon.svg"><script type="application/ld+json">${JSON.stringify(structured).replace(/</g,'\\u003c')}</script></head><body class="search-page"><header><a class="search-brand" href="/">матклуб.</a><a href="/topics/">Все темы</a><span>Открытый бета-тест</span></header><main>${body}</main><footer><a href="/">Матклуб · математика и физика</a><a href="/about/">by ddima_dev</a></footer></body></html>`;
const entries=[];
for(const [key,l]of Object.entries(data.lessons)){const [g,i]=key.split('-').map(Number),name=data.curriculum[g][i][0],domain=l.physics?'physics':'math',subject=l.physics?'Физика':data.topicSubjects[key]==='geometry'?'Геометрия':'Математика',url=`${origin}/topics/${domain}-${key}/`,title=`${name} — ${g} класс | ${subject} | Матклуб`,description=`${name}, ${g} класс: объяснение темы, формулы, пример решения и задачи с разбором. ${subject} в Матклубе.`,d=data.topicDepth[key],tasks=data.tasks.filter(t=>t.grade===g&&t.topic===i&&!t.exam);
const body=`<nav aria-label="Хлебные крошки"><a href="/">Главная</a> / <a href="/topics/">Темы</a> / ${subject}, ${g} класс</nav><p class="section-kicker">${subject.toUpperCase()} · ${g} КЛАСС</p><h1>${esc(name)}</h1><p class="lead">${esc(l.intro)}</p><section><h2>Почему это работает</h2><p>${esc(d.why)}</p><h3>Как решать задачи</h3><p>${esc(d.method)}</p></section><section class="rule-box"><h2>Формулы и правила</h2><ul>${l.rules.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section><h2>Пример с решением</h2><h3>${esc(l.example)}</h3><ol>${l.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section><aside class="mistake-box"><h3>Частая ошибка</h3><p>${esc(l.mistake)}</p></aside><section><h2>Вопрос на понимание</h2><h3>${esc(d.question)}</h3><details><summary>Показать объяснение</summary><p>${esc(d.answer)}</p></details></section><section><h2>Задачи по теме</h2>${tasks.map(t=>`<article><h3>${esc(t.title)}</h3><p>${esc(t.question)}</p>${vm.runInContext('egeFigure',c)(t)}${t.source?`<p><a href="${esc(t.source.url)}" target="_blank" rel="noopener noreferrer">${esc(t.source.name)} № ${t.source.id}</a> · тип ${esc(t.source.type)}. ${esc(t.source.note)}</p>`:''}<details><summary>Разбор по шагам</summary><ol>${t.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${t.review?.verify?`<p><b>Проверка:</b> ${esc(t.review.verify)}</p>`:''}</details></article>`).join('')}<a class="primary" href="/?topic=${key}">Решать в мастерской →</a></section><p><a href="/topics/">← Все темы математики и физики</a></p>`;
const dir=path.join(root,'topics',`${domain}-${key}`);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),shell(title,description,url,body,{'@context':'https://schema.org','@type':'LearningResource',name,description,inLanguage:'ru',educationalLevel:`${g} класс`,learningResourceType:'Урок с задачами',url,isAccessibleForFree:true}));entries.push({url,name,g,subject});}
const indexBody='<h1>Темы математики и физики</h1><p class="lead">Математика 6–11 классов и физика 7–11 классов: объяснения, формулы и задачи с решениями.</p>'+[6,7,8,9,10,11].map(g=>`<section><h2>${g} класс</h2><ul>${entries.filter(e=>e.g===g).map(e=>`<li><a href="${e.url}">${esc(e.name)}</a> — ${e.subject}</li>`).join('')}</ul></section>`).join('');
fs.writeFileSync(path.join(root,'topics/index.html'),shell('Математика и физика 6–11 классов — все темы | Матклуб','Каталог школьных тем: алгебра, геометрия и физика с объяснениями и задачами.',origin+'/topics/',indexBody,{'@context':'https://schema.org','@type':'CollectionPage',name:'Темы математики и физики',url:origin+'/topics/'}));
fs.writeFileSync(path.join(root,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
// Exam reading page uses the same curated data and links as the interactive bank.
const examTasks=data.tasks.filter(t=>t.exam==='ege');
const examUrl=origin+'/ege/';
const aboutUrl=origin+'/about/';
const examBody=`<nav><a href="/">Главная</a> / Математика / 11 класс / ЕГЭ</nav><h1>ЕГЭ по математике · 11 класс</h1><p class="lead">Профильная математика: в подборке — ${taskLabel(examTasks.length)}. У каждой задачи есть ссылка на соответствующий источник и авторский разбор Матклуба. Условия изложены кратко. Это тренировка отдельных тем, а не полный экзаменационный вариант.</p><a class="primary" href="/?exam=ege">Решать в мастерской →</a><section><h2>Как заниматься</h2><p>Сначала реши самостоятельно, затем проверь ответ: число или множество значений параметра. Подсказки и разбор открываются постепенно. Избранное, черновики и верные ответы сохраняются в браузере; после входа доступна синхронизация в кабинете. Уровней сложности в этом разделе нет: навигация устроена по темам. Архивная маркировка задания не обозначает его позицию в современном варианте.</p></section><section><h2>Темы ЕГЭ</h2><ul>${data.egeTopics.map(topic=>`<li><a href="/?exam=ege&amp;egeTopic=${topic.id}">${esc(topic.name)}</a> — ${taskLabel(examTasks.filter(t=>t.examTopic===topic.id).length)} в Матклубе. <a href="${esc(topic.url)}" target="_blank" rel="noopener noreferrer">Каталог «Решу ЕГЭ» ↗</a></li>`).join('')}</ul></section><section><h2>Задания и источники</h2>${data.egeTopics.filter(topic=>examTasks.some(t=>t.examTopic===topic.id)).map(topic=>`<h3>${esc(topic.name)}</h3>${examTasks.filter(t=>t.examTopic===topic.id).map(t=>`<article><h3>${esc(t.title)}</h3><p>${esc(t.question)}</p>${vm.runInContext('egeFigure',c)(t)}<p><a href="${esc(t.source.url)}" target="_blank" rel="noopener noreferrer">Решу ЕГЭ № ${t.source.id}</a> · тип ${esc(t.source.type)}</p><details><summary>Показать разбор Матклуба</summary><ol>${t.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p><b>Проверка:</b> ${esc(t.review.verify)}</p><p><b>Частая ошибка:</b> ${esc(t.review.trap)}</p></details></article>`).join('')}`).join('')}</section><p><a href="https://math-ege.sdamgia.ru/prob_catalog" target="_blank" rel="noopener noreferrer">Полный каталог профильной математики на «Решу ЕГЭ» ↗</a></p>`;
const aboutBody='<p class="section-kicker">МАТКЛУБ · О ПРОЕКТЕ</p><h1>Точные науки — ближе и понятнее.</h1><p class="lead">Матклуб разработан двумя энтузиастами из Беларуси. Мы стремимся популяризировать точные науки и технические дисциплины.</p><section><h2>Кто помогает проекту</h2><p>Огромная благодарность тестировщику <strong>@golodniy_ae</strong> за внимательную проверку сайта и помощь в его развитии.</p></section><section><h2>Открытый бета-тест</h2><p>Наш проект останется бесплатным, за исключением некоторых дополнительных функций.</p></section><p><strong>Ваш разработчик и CEO — ddima_dev.</strong></p><p><a href="/">Вернуться в Матклуб →</a></p>';
fs.mkdirSync(path.join(root,'about'),{recursive:true});
fs.writeFileSync(path.join(root,'about/index.html'),shell('О проекте и создателях | Матклуб','Кто создаёт Матклуб, зачем проект развивает точные науки и как он будет оставаться доступным.',aboutUrl,aboutBody,{'@context':'https://schema.org','@type':'AboutPage',name:'О проекте Матклуб',url:aboutUrl,inLanguage:'ru'}));
fs.mkdirSync(path.join(root,'ege'),{recursive:true});
const examHTML=shell('ЕГЭ по математике — 11 класс | Матклуб','Задачи профильного ЕГЭ со ссылками на Решу ЕГЭ и разборами Матклуба.',examUrl,examBody,{'@context':'https://schema.org','@type':'CollectionPage',name:'ЕГЭ по математике · 11 класс',url:examUrl});
const examStyleVersion=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'ege.css'))).digest('hex').slice(0,12);
fs.writeFileSync(path.join(root,'ege/index.html'),examHTML.replace('</head>',`<link rel="stylesheet" href="/ege.css?v=${examStyleVersion}"></head>`));
const pythonEntries=require('./build-python.cjs')({root,origin,shell});
const labEntries=require('./build-laboratory.cjs')({root,origin,shell});
const cppEntries=require('./build-cpp.cjs')({root,origin,shell});
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[origin+'/',origin+'/topics/',examUrl,aboutUrl,...entries.map(e=>e.url),...pythonEntries.map(e=>e.url),...labEntries.map(e=>e.url),...cppEntries.map(e=>e.url)].map(url=>`<url><loc>${url}</loc></url>`).join('')+'</urlset>');
console.log(`Built ${entries.length} school lesson pages and ${entries.length+4+pythonEntries.length+labEntries.length+cppEntries.length} sitemap URLs`);


