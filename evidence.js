(function(root){"use strict";
const TYPES=["classroom","quiz","artifact","observation","other"];
function validate(records){
if(!Array.isArray(records)||records.length<1||records.length>5000)throw Error("จำนวนรายการหลักฐานต้องอยู่ระหว่าง 1–5000");
const seen=new Set(),students=new Map(),hourCounts=Array(16).fill(0);
for(const r of records){
if(!r||!/^S[0-9]{3,6}$/.test(r.studentId)||!Number.isInteger(r.hour)||r.hour<1||r.hour>16||!["K","P","A","PROJECT"].includes(r.dimension)||!TYPES.includes(r.type)||!Number.isFinite(r.percent)||r.percent<0||r.percent>100||typeof r.reference!=="string"||r.reference.length>160)throw Error("รูปแบบหลักฐานไม่ถูกต้อง: ใช้รหัส S001, ชั่วโมง 1–16, มิติ K/P/A/PROJECT และร้อยละ 0–100");
if(r.hour<=12&&r.dimension==="PROJECT"||r.hour>=13&&r.dimension!=="PROJECT")throw Error("ชั่วโมง 1–12 ใช้ K/P/A; ชั่วโมง 13–16 ใช้ PROJECT");
const id=[r.studentId,r.hour,r.dimension,r.type,r.reference].join("|");if(seen.has(id))throw Error("พบรายการหลักฐานซ้ำ: "+id);seen.add(id);
if(!students.has(r.studentId))students.set(r.studentId,{id:r.studentId,learning:0,project:0});const s=students.get(r.studentId);if(r.hour<=12)s.learning++;else s.project++;hourCounts[r.hour-1]++;
}
return {recordCount:records.length,studentCount:students.size,hourCounts,students:[...students.values()].sort((a,b)=>a.id.localeCompare(b.id)),typeCounts:Object.fromEntries(TYPES.map(type=>[type,records.filter(r=>r.type===type).length]))};
}
root.Evidence={validate,TYPES};
})(typeof module!=="undefined"&&module.exports?module.exports:window);
