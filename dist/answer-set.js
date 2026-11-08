/* Parse real sets without evaluating input as JavaScript. Boundaries are compared
   numerically; interval inclusion and omitted singleton points remain significant. */
function setBound(raw){
 const s=raw.trim().replace(/\s+/g,'').replace(',','.');
 if(/^[+]?inf$/.test(s))return Infinity;if(s==='-inf')return -Infinity;
 const m=s.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\/([+-]?(?:\d+(?:\.\d*)?|\.\d+)))?$/);
 if(!m||m[2]!==undefined&&Number(m[2])===0)return NaN;
 const n=Number(m[1])/(m[2]===undefined?1:Number(m[2]));return Number.isFinite(n)?n:NaN;
}
function normalizeRealSet(parts){
 const sorted=parts.map(p=>p.slice()).sort((a,b)=>a[0]-b[0]||Number(b[2])-Number(a[2])||a[1]-b[1]),out=[];
 for(const p of sorted){const last=out.at(-1);if(!last||p[0]>last[1]||p[0]===last[1]&&!p[2]&&!last[3]){out.push(p);continue}if(p[0]===last[0])last[2]=last[2]||p[2];if(p[1]>last[1]){last[1]=p[1];last[3]=p[3]}else if(p[1]===last[1])last[3]=last[3]||p[3];}
 return out;
}
function parseRealSet(raw){
 if(typeof raw!=='string'||raw.length>2000)return null;
 const s=raw.trim().toLowerCase().replaceAll('−','-').replaceAll('∞','inf').replace(/^a\s*(?:∈|=)\s*/,'');
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
