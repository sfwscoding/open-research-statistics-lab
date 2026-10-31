(function(root){"use strict";
function analyze(rows){
if(!Array.isArray(rows)||rows.length<1||rows.length>200)throw Error("ต้องมีข้อมูลนักเรียน 1–200 คน");
const hours=Array.from({length:12},(_,i)=>({hour:i+1,K:[],P:[],A:[],complete:0}));
const students=[];
for(const row of rows){
if(!Array.isArray(row)||row.length!==36||row.some(v=>!Number.isFinite(v)||v<0||v>100))throw Error("แต่ละคนต้องมี K,P,A ครบ 12 ชั่วโมง เป็นคะแนนร้อยละ 0–100");
let perHour=[];for(let h=0;h<12;h++){const vals=row.slice(h*3,h*3+3);perHour.push({hour:h+1,K:vals[0],P:vals[1],A:vals[2]});["K","P","A"].forEach((v,i)=>hours[h][v].push(vals[i]));hours[h].complete++}students.push(perHour)}
const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
return {n:rows.length,hours:hours.map(h=>({hour:h.hour,K:avg(h.K),P:avg(h.P),A:avg(h.A),complete:h.complete})),students,overall:{K:avg(hours.flatMap(h=>h.K)),P:avg(hours.flatMap(h=>h.P)),A:avg(hours.flatMap(h=>h.A))}};
}
root.KPATracker={analyze};
})(typeof module!=="undefined"&&module.exports?module.exports:window);
