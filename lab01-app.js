/* Lab 01 standalone statistical views. Shared input, single result and APA table per selected statistic. */
(function(){"use strict";
const $=id=>document.getElementById(id),R=window.ResearchReports;
const configs={
 difficulty:["1.1.1 ความยากรายข้อ (Item Difficulty, p)","สัดส่วนผู้เรียนที่ตอบถูกในแต่ละข้อ ค่า p สูงหมายถึงข้อสอบง่ายขึ้น ไม่ใช่ค่านัยสำคัญทางสถิติ"],
 corrected:["1.1.2 Corrected Item–Total Correlation (r)","ความสัมพันธ์ระหว่างคะแนนข้อนั้นกับคะแนนรวมที่ตัดข้อนั้นออก เพื่อหลีกเลี่ยงความสัมพันธ์จากการรวมข้อเดียวกัน"],
 discrimination:["1.1.3 อำนาจจำแนกกลุ่มสูง–ต่ำ (D)","ส่วนต่างสัดส่วนตอบถูกของกลุ่มคะแนนรวมสูงกับกลุ่มต่ำ โดยคัดเลือกกลุ่มละประมาณ 27%"],
 distractor:["1.1.4 การวิเคราะห์ตัวลวง (Distractor Analysis)","ตรวจจำนวนและร้อยละผู้เลือกแต่ละตัวเลือก รวมถึงการเลือกในกลุ่มคะแนนสูงและกลุ่มต่ำ"],
 kr20:["1.2 ความสอดคล้องภายในข้อสอบ (KR-20)","ประเมินความสอดคล้องภายในชุดข้อสอบที่ให้คะแนนถูก/ผิดแบบ 0–1 โดยใช้ความแปรปรวนของคะแนนรวม"]
};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=(n,d=3)=>Number.isFinite(n)?n.toFixed(d):"N/A";
const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
let view="difficulty";
let last=null;
function defaultCSV(){
 const lines=["Q1,Q2,Q3,Q4,Q5"],keys=["A","B","C","D","A"];
 for(let i=0;i<23;i++)lines.push(keys.map((v,j)=>(i*7+j*11)%23<(18-j*2)?v:["A","B","C","D"][(i+j+1)%4]).join(","));
 return lines.join("\n");
}
function cards(items){return items.map(([a,b,c])=>'<article class="result-card"><small>'+esc(a)+'</small><strong>'+esc(b)+'</strong><div class="caption">'+esc(c)+'</div></article>').join("")}
function figure(rows,denominator=1){
 const subset=rows.slice(0,20);
 let content='<h3>ภาพประกอบสถิติที่เลือก</h3>';
 for(const [label,v] of subset){
  const width=Math.min(100,Math.abs(Number(v))*100/denominator);
  const good=Number(v)>=0;
  content+='<div class="item-bar"><span>'+esc(label)+'</span><div class="item-track"><div class="item-fill" style="width:'+
    width.toFixed(1)+'%;background:'+(good?"#15803d":"#dc2626")+'"></div></div><strong>'+fmt(Number(v),3)+'</strong></div>';
 }
 if(rows.length>subset.length)content+='<p class="hint">กราฟแสดง 20 ข้อแรก ส่วนตาราง APA แสดงครบทุกข้อ</p>';
 return content;
}
function details(data){
 const lines=$("mcq-answers").value.trim().split(/\r?\n/).map(line=>line.split(",").map(v=>v.trim().toUpperCase()));
 const answers=lines.slice(1),n=answers.length,k=data.k,totals=answers.map(row=>row.reduce((sum,v,j)=>sum+Number(v===data.keys[j]),0));
 const nGroup=Math.max(1,Math.floor(n*.27));
 const ordered=totals.map((score,i)=>({score,i})).sort((a,b)=>b.score-a.score||a.i-b.i);
 const high=ordered.slice(0,nGroup).map(v=>v.i),low=ordered.slice(-nGroup).map(v=>v.i);
 const rows=[];
 for(let j=0;j<k;j++){
  const options=[...new Set(["A","B","C","D",...answers.map(row=>row[j])])].sort();
  const freq=options.map(opt=>{
   const count=answers.filter(row=>row[j]===opt).length;
   return {opt,count,hi:high.filter(i=>answers[i][j]===opt).length,
    lo:low.filter(i=>answers[i][j]===opt).length};
  });
  rows.push({name:data.labels[j],key:data.keys[j],freq});
 }
 return {n,nGroup,rows,totals};
}
function report(data){
 const d=details(data),n=data.n,k=data.k,Rt=R.table,values=data.items;
 if(view==="difficulty"){
  const rows=values.map((v,j)=>[data.labels[j],data.keys[j],fmt(v.p),fmt(v.p*100,1)+"%"]);
  const p=avg(values.map(v=>v.p));
  return {cards:[["ผู้เรียน",n,"คน"],["ข้อสอบ",k,"ข้อ"],["ค่า p เฉลี่ย",fmt(p),"สัดส่วนตอบถูกเฉลี่ย"]],
   bars:values.map((v,j)=>[data.labels[j],v.p]),title:configs[view][0],
   apa:Rt(1,"ความยากของข้อสอบปรนัยรายข้อ",["ข้อ","เฉลย","p","ตอบถูก (%)"],rows,"p = จำนวนผู้ตอบถูก / n; ค่า p มิใช่ค่านัยสำคัญ; ข้อมูลจำลองหรือข้อมูลที่กรอก","จากการวิเคราะห์ข้อสอบ "+k+" ข้อ โดยผู้เรียน "+n+" คน พบความยากเฉลี่ย p = "+fmt(p)+". รายละเอียดแต่ละข้อแสดงในตาราง การตัดสินปรับข้อสอบต้องพิจารณาเนื้อหาและกลุ่มผู้สอบร่วมด้วย")};
 }
 if(view==="corrected"){
  const rows=values.map((v,j)=>[data.labels[j],fmt(v.corrected),Number.isFinite(v.corrected)?(v.corrected>=0?"ไม่ติดลบ":"ติดลบ"):"นิยามไม่ได้"]);
  return {cards:[["จำนวนข้อ",k,"ข้อ"],["ค่า r เฉลี่ยของข้อที่คำนวณได้",fmt(avgOrNan(values.map(v=>v.corrected))),"ไม่ใช่ค่าความเที่ยงรวม"],["r ที่คำนวณไม่ได้",values.filter(v=>!Number.isFinite(v.corrected)).length,"ข้อ"]],
   bars:values.map((v,j)=>[data.labels[j],v.corrected]),title:configs[view][0],
   apa:Rt(1,"ความสัมพันธ์คะแนนรายข้อกับคะแนนรวมที่ตัดข้อนั้น",["ข้อ","Corrected r","ทิศทาง"],rows,"ค่า r เป็น Pearson point-biserial correlation ระหว่างคะแนนข้อ 0/1 และคะแนนรวมที่ตัดข้อนั้นออก; N/A เมื่อความแปรปรวนเป็นศูนย์","จากการวิเคราะห์ข้อสอบ "+k+" ข้อ พบค่า corrected item–total correlation ที่นิยามได้ "+rows.filter(x=>x[1]!=="N/A").length+" ข้อ ค่า r ติดลบเป็นสัญญาณให้ตรวจเนื้อหา เฉลย และคุณภาพของข้อสอบร่วมกับหลักฐานอื่น ไม่ใช่เกณฑ์ตัดสินโดยลำพัง")};
 }
 if(view==="discrimination"){
  const rows=values.map((v,j)=>[data.labels[j],fmt(v.discrimination),fmt(v.discrimination*100,1)+" จุดร้อยละ"]);
  return {cards:[["กลุ่มสูง",d.nGroup,"คน"],["กลุ่มต่ำ",d.nGroup,"คน"],["D เฉลี่ย",fmt(avg(values.map(v=>v.discrimination))),"สัดส่วนสูง−ต่ำ"]],
   bars:values.map((v,j)=>[data.labels[j],v.discrimination]),title:configs[view][0],
   apa:Rt(1,"อำนาจจำแนกข้อสอบจากกลุ่มสูงและกลุ่มต่ำ",["ข้อ","D","ผลต่าง (%)"],rows,"คัดเลือกกลุ่มละ floor(0.27n) = "+d.nGroup+" คน โดยเรียงคะแนนรวม; เมื่อคะแนนเสมอกันใช้ลำดับแถวช่วยเลือกกลุ่ม","อำนาจจำแนก D ของข้อสอบ "+k+" ข้อมีค่าเฉลี่ย "+fmt(avg(values.map(v=>v.discrimination)))+". ค่า D ติดลบบ่งชี้ว่ากลุ่มคะแนนต่ำตอบถูกมากกว่ากลุ่มสูงในข้อนั้น จึงควรตรวจความเหมาะสมของข้อสอบและวิธีแบ่งกลุ่ม")};
 }
 if(view==="distractor"){
  const rows=d.rows.flatMap(item=>item.freq.map(v=>[item.name,v.opt,v.opt===item.key?"เฉลย":"ตัวลวง",v.count,fmt(v.count/n*100,1)+"%",v.hi,v.lo]));
  const unused=d.rows.flatMap(item=>item.freq.filter(v=>v.opt!==item.key&&v.count===0));
  return {cards:[["ข้อสอบ",k,"ข้อ"],["ผู้เรียน",n,"คน"],["ตัวลวงไม่มีผู้เลือก",unused.length,"ตัวเลือก"]],
   bars:d.rows.map(item=>[item.name,item.freq.filter(v=>v.opt!==item.key).reduce((sum,v)=>sum+v.count,0)/n]),title:configs[view][0],
   apa:Rt(1,"ความถี่การเลือกคำตอบและตัวลวงรายข้อ",["ข้อ","ตัวเลือก","ชนิด","รวม (n)","รวม (%)","สูง (n)","ต่ำ (n)"],rows,"กลุ่มสูง/ต่ำกลุ่มละ "+d.nGroup+" คน จากคะแนนรวม; แสดงตัวเลือก A–D และตัวเลือกอื่นหากมี; ตัวลวงคือคำตอบที่ไม่ใช่เฉลย","จากการวิเคราะห์ข้อสอบ "+k+" ข้อ พบตัวลวงที่ไม่มีผู้เรียนเลือก "+unused.length+" ตัวเลือก ควรพิจารณาการทำงานของตัวลวงร่วมกับคุณภาพเนื้อหา จำนวนผู้สอบ และรูปแบบการตอบผิด")};
 }
 const kr=data.kr;
 const variance=d.totals.reduce((sum,t)=>sum+(t-data.avg)**2,0)/n;
 return {cards:[["จำนวนข้อ",k,"ข้อ"],["ค่า KR-20",fmt(kr,4),Number.isFinite(kr)?"ความสอดคล้องภายใน":"คะแนนรวมไม่มีความแปรปรวน"],["ความแปรปรวนคะแนนรวม",fmt(variance,3),"ตัวหาร n"]],
  bars:[],title:configs[view][0],
  apa:Rt(1,"ค่าสัมประสิทธิ์ความสอดคล้องภายในแบบ KR-20",["n ผู้เรียน","k ข้อ","M คะแนนรวม","Var(คะแนนรวม)","KR-20"],[[n,k,fmt(data.avg,2),fmt(variance,3),fmt(kr,4)]],"คะแนนรายข้อเป็นแบบทวิภาค 0/1; ใช้ความแปรปรวนคะแนนรวมแบบตัวหาร n; N/A เมื่อความแปรปรวนเป็นศูนย์","จากการวิเคราะห์ข้อสอบ "+k+" ข้อ ในกลุ่มผู้เรียน "+n+" คน ได้ KR-20 = "+fmt(kr,4)+" ซึ่งใช้พิจารณาความสอดคล้องภายในของข้อสอบ ไม่ใช่หลักฐานความตรงของข้อสอบโดยลำพัง")};
}
function avgOrNan(values){const ok=values.filter(Number.isFinite);return ok.length?avg(ok):NaN}
function calculate(){
 try{
  const data=R.analyzeMCQ($("mcq-answers").value,$("mcq-key").value);
  const output=report(data);last=output;
  $("mcq-error").hidden=true;$("mcq-results").hidden=false;
  $("mcq-cards").innerHTML=cards(output.cards);
  $("mcq-visual").hidden=!output.bars.length;
  $("mcq-visual").innerHTML=output.bars.length?figure(output.bars):"";
  $("mcq-apa").innerHTML=output.apa;
  $("metric-title").textContent=output.title;
  $("metric-description").textContent=configs[view][1];
  $("mcq-source").textContent="วิเคราะห์ข้อมูล "+data.n+" คน × "+data.k+" ข้อ ตามข้อมูลปัจจุบัน";
 }catch(e){
  last=null;$("mcq-error").hidden=false;$("mcq-error").textContent=e.message;
  $("mcq-results").hidden=true;
 }
}
function activate(next,updateUrl=true){
 if(!configs[next])next="difficulty";
 view=next;
 document.querySelectorAll("[data-stat]").forEach(b=>b.setAttribute("aria-current",String(b.dataset.stat===view)));
 if(updateUrl&&history.replaceState)history.replaceState(null,"",location.pathname+"?stat="+encodeURIComponent(view));
 calculate();
}
$("mcq-answers").value=defaultCSV();
$("mcq-answers").addEventListener("input",()=>{$("mcq-results").hidden=true;$("mcq-source").textContent="ข้อมูลเปลี่ยนแล้ว กรุณากดคำนวณใหม่";last=null});
$("mcq-key").addEventListener("input",()=>{$("mcq-results").hidden=true;last=null});
$("mcq-run").onclick=calculate;
$("mcq-reset").onclick=()=>{$("mcq-answers").value=defaultCSV();$("mcq-key").value="A,B,C,D,A";calculate()};
document.querySelectorAll("[data-stat]").forEach(button=>button.onclick=()=>activate(button.dataset.stat));
$("mcq-copy").onclick=async()=>{if(!last)return;
 try{await navigator.clipboard.writeText($("mcq-apa").innerText);$("mcq-copy-status").textContent="คัดลอกตารางของสถิติ "+configs[view][0]+" แล้ว"}
 catch(e){$("mcq-copy-status").textContent="กรุณาเลือกและคัดลอกตารางด้วยตนเอง"}};
activate(new URLSearchParams(location.search).get("stat"),false);
})();