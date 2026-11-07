/* Runs Python off the main thread. The UI can terminate this worker at any time. */
const PYODIDE_URL='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
let runtimePromise,runNumber=0,busy=false;
const LIMIT=40000;
function send(type,details={}){self.postMessage({type,...details})}
function runtime(){
  if(!runtimePromise)runtimePromise=(async()=>{
    send('phase',{phase:'loading'});
    importScripts(PYODIDE_URL+'pyodide.js');
    const py=await loadPyodide({indexURL:PYODIDE_URL});
    py.runPython('import sys, types');
    return py;
  })().catch(error=>{runtimePromise=null;throw error});
  return runtimePromise;
}
function removeTree(fs,path){
  for(const name of fs.readdir(path)){
    if(name==='.'||name==='..')continue;
    const child=path+'/'+name;
    if(fs.isDir(fs.lstat(child).mode))removeTree(fs,child);else fs.unlink(child);
  }
  fs.rmdir(path);
}
async function execute(py,code,stdin,check,report){
  const directory='/home/pyodide/matclub-run-'+(++runNumber);
  py.FS.mkdir(directory);py.FS.chdir(directory);
  let output='',truncated=false,stderrLength=0,scope;
  const decoder=new TextDecoder();
  const lines=String(stdin||'').replace(/\r\n/g,'\n').split('\n');
  if(String(stdin||'').endsWith('\n'))lines.pop();
  let index=0;
  py.setStdin({stdin:()=>index<lines.length?lines[index++]:undefined});
  py.setStdout({write:buffer=>{
    const text=decoder.decode(buffer,{stream:true}),remaining=LIMIT-output.length;
    if(remaining>0){const part=text.slice(0,remaining);output+=part;if(report)send('output',{text:part,stream:'stdout'})}
    if(text.length>remaining)truncated=true;
    return buffer.length;
  }});
  py.setStderr({write:buffer=>{
    const text=new TextDecoder().decode(buffer);
    if(report&&text&&stderrLength<LIMIT)send('output',{text:text.slice(0,Math.min(4000,LIMIT-stderrLength)),stream:'stderr'});
    stderrLength+=text.length;
    return buffer.length;
  }});
  try{
    scope=py.runPython('_matclub_old_main = sys.modules.get("__main__")\n_matclub_student = types.ModuleType("__main__")\nsys.modules["__main__"] = _matclub_student\n_matclub_student.__dict__');
    await py.runPythonAsync(code,{globals:scope,filename:'solution.py'});
    py.runPython('import sys\nsys.stdout.flush()\nsys.stderr.flush()', {globals:scope});
    if(check!==undefined){
      scope.set('__output__',output.endsWith('\n')?output.slice(0,-1):output);
      await py.runPythonAsync(check,{globals:scope,filename:'checks.py'});
    }
    return {truncated};
  }finally{
    py.runPython('sys.modules["__main__"] = _matclub_old_main');
    scope?.destroy();
    py.FS.chdir('/home/pyodide');
    try{removeTree(py.FS,directory)}catch{/* Runtime reset also releases temporary files. */}
  }
}
self.onmessage=async event=>{
  if(event.data?.type!=='run'||busy)return;
  busy=true;
  try{
    const {code,stdin='',tests=[],mode='run'}=event.data;
    if(typeof code!=='string'||code.length>100000)throw Error('Код слишком большой');
    const py=await runtime();send('phase',{phase:'running'});
    if(mode==='check'){
      const results=[];
      for(let i=0;i<tests.length;i++){
        const test=tests[i];
        try{
          await execute(py,code,test.stdin===undefined?stdin:test.stdin,test.code,i===0);
          results.push({name:test.name,ok:true});
        }catch(error){results.push({name:test.name,ok:false,error:String(error.message||error).slice(-4000)})}
        send('case',{index:i+1,total:tests.length});
      }
      send('done',{mode,results});
    }else{
      const result=await execute(py,code,stdin,undefined,true);
      send('done',{mode,...result});
    }
  }catch(error){send('error',{message:String(error.message||error).slice(-4000)})}
  finally{busy=false}
};
