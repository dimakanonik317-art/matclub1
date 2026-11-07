"""Compile authored C++17 programs; run examples and boundary cases in temp directories."""
import pathlib,json,tempfile,subprocess
root=pathlib.Path(__file__).resolve().parents[1]
course=json.loads((root/'dist/cpp-data.js').read_text().split('=',1)[1].rstrip(';\n'))
n=0
with tempfile.TemporaryDirectory() as directory:
 p=pathlib.Path(directory)
 for lesson in course['lessons']:
  for kind,tests in [('example',[{'input':'','output':lesson['output']}]),('solution',lesson['cases'])]:
   (p/'main.cpp').write_text(lesson[kind])
   r=subprocess.run(['g++','-std=c++17','-Wall','-Wextra','-Wpedantic','-Werror',str(p/'main.cpp'),'-o',str(p/'main')],capture_output=True,text=True,timeout=30)
   assert r.returncode==0,lesson['id']+': '+r.stderr
   for test in tests:
    r=subprocess.run([str(p/'main')],input=test['input'],capture_output=True,text=True,timeout=3,cwd=p)
    assert r.returncode==0 and r.stdout==test['output'],(lesson['id'],kind,test,r.stdout,r.stderr)
    n+=1
print(f'PASS: {len(course["lessons"])} C++17 examples and solutions compiled with warnings as errors; {n} execution cases passed.')
