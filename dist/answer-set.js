/* Parse real sets without evaluating input as JavaScript. Boundaries are compared
   numerically; interval inclusion and omitted singleton points remain significant. */
// Small arithmetic grammar for exact-looking boundaries; never eval/Function.
function setBound(raw){
 const source=raw.trim().toLowerCase().replace(/\s+/g,'').replaceAll('−','-').replaceAll('∞','inf').replaceAll('π','pi').replaceAll(',','.').replace(/log_(\d+)/g,'log$1').replace(/√(\d+(?:\.\d+)?)/g,'sqrt($1)').replaceAll('√(','sqrt(');
 if(/^[+]?inf$/.test(source))return Infinity;if(source==='-inf')return -Infinity;
 if(!source||source.length>160)return NaN;
 const tokens=source.match(/\d+(?:\.\d*)?|\.\d+|[a-z]+\d*|[+*/^()-]/g)||[];
 if(tokens.length>128||tokens.join('')!==source)return NaN;
 let i=0,depth=0;
 function primary(){if(++depth>40)throw Error();let result;const token=tokens[i++];if(token==='('){result=sum();if(tokens[i++]!==')')throw Error()}else if(token==='pi')result=Math.PI;else if(token&&/^\d|^\.\d/.test(token))result=Number(token);else if(token==='sqrt'||token==='ln'||/^log\d+$/.test(token||'')){if(tokens[i++]!=='(')throw Error();const arg=sum();if(tokens[i++]!==')')throw Error();if(token==='sqrt')result=arg>=0?Math.sqrt(arg):NaN;else if(token==='ln')result=arg>0?Math.log(arg):NaN;else{const base=Number(token.slice(3));result=base>0&&base!==1&&arg>0?Math.log(arg)/Math.log(base):NaN}}else throw Error();depth--;if(!Number.isFinite(result))throw Error();return result}
 function power(){let n=primary();if(tokens[i]==='^'){i++;const exponent=unary();if(Math.abs(exponent)>128||n===0&&exponent<=0)throw Error();n=n**exponent}return n}
 function unary(){if(tokens[i]==='+'){i++;return unary()}if(tokens[i]==='-'){i++;return-unary()}return power()}
 function product(){let n=unary();while(i<tokens.length){const op=tokens[i];if(op==='*'||op==='/'){i++;const right=unary();if(op==='/'&&right===0)throw Error();n=op==='*'?n*right:n/right}else if(op==='('||/^[a-z]/.test(op)){n*=unary()}else break}return n}
 function sum(){let n=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],right=product();n=op==='+'?n+right:n-right}return n}
 try{const value=sum();return i===tokens.length&&Number.isFinite(value)?value:NaN}catch{return NaN}
}
function normalizeRealSet(parts){
 const sorted=parts.map(p=>p.slice()).sort((a,b)=>a[0]-b[0]||Number(b[2])-Number(a[2])||a[1]-b[1]),out=[];
 for(const p of sorted){const last=out.at(-1);if(!last||p[0]>last[1]||p[0]===last[1]&&!p[2]&&!last[3]){out.push(p);continue}if(p[0]===last[0])last[2]=last[2]||p[2];if(p[1]>last[1]){last[1]=p[1];last[3]=p[3]}else if(p[1]===last[1])last[3]=last[3]||p[3];}
 return out;
}
function parseRealSet(raw){
 if(typeof raw!=='string'||raw.length>2000)return null;
 const s=raw.trim().toLowerCase().replaceAll('−','-').replaceAll('∞','inf').replace(/^[ax]\s*(?:∈|=)\s*/,'');
 if(/^(?:∅|пусто|нет решений)$/.test(s))return [];
 if(!s)return null;const parts=[];
 for(const token of s.split(/\s*(?:∪|\\cup|\bu\b|или)\s*/)){
  let m=token.trim().match(/^([[(])([^;]+);([^;]+)([\])])$/);
  if(m){const lo=setBound(m[2]),hi=setBound(m[3]),lc=m[1]==='[',hc=m[4]===']';if(Number.isNaN(lo)||Number.isNaN(hi)||lo>hi||lo===hi&&(!lc||!hc)||!Number.isFinite(lo)&&lc||!Number.isFinite(hi)&&hc||lo===Infinity||hi===-Infinity)return null;parts.push([lo,hi,lc,hc]);continue}
  let point=token.trim();if(point.startsWith('{')&&point.endsWith('}'))point=point.slice(1,-1);
  for(const value of point.split(';')){const n=setBound(value);if(!Number.isFinite(n))return null;parts.push([n,n,true,true])}
 }
 return normalizeRealSet(parts);
}
function equalRealSets(actual,expected){
 if(!actual||!expected)return false;const norm=normalizeRealSet(expected.map(([lo,hi,lc,hc])=>[lo===null?-Infinity:lo,hi===null?Infinity:hi,lc,hc]));
 const close=(a,b)=>a===b||Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-9;
 return actual.length===norm.length&&actual.every((p,i)=>close(p[0],norm[i][0])&&close(p[1],norm[i][1])&&p[2]===norm[i][2]&&p[3]===norm[i][3]);
}
