(function(root){"use strict";
function evaluate(rows){
if(!Array.isArray(rows)||rows.length<1||rows.length>200)throw Error("ต้องมีนักเรียน 1–200 คน");
if(rows.some(row=>!Array.isArray(row)||row.length!==5||row.some(v=>!Number.isInteger(v)||v<1||v>4)))throw Error("คะแนนต้องเป็นจำนวนเต็ม 1–4 ครบ 5 เกณฑ์ทุกคน");
const n=rows.length,thresholds=[Math.ceil(.8*n),Math.ceil(.5*n),Math.ceil(.2*n)];
const criteria=Array.from({length:5},(_,j)=>{let values=rows.map(r=>r[j]),counts=[1,2,3,4].map(level=>values.filter(v=>v===level).length),reached=[counts[1]+counts[2]+counts[3],counts[2]+counts[3],counts[3]],passed=reached.map((v,i)=>v>=thresholds[i]);return {criterion:j+1,counts,reached,passed,mean:values.reduce((a,b)=>a+b,0)/n}});
return {n,thresholds,criteria,passed:criteria.every(c=>c.passed.every(Boolean)),passedConditions:criteria.reduce((a,c)=>a+c.passed.filter(Boolean).length,0)};
}
root.Competency={evaluate};
})(typeof module!=="undefined"&&module.exports?module.exports:window);
