/* Lab 02: interactive agreement analysis for five ordinal rubric criteria.
   Calculation logic lives in rubric-reliability.js; this file only handles UI. */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const Engine = window.RubricReliability, Reporting = window.ResearchReports;
if (!Engine || !Reporting) throw Error("ไม่พบโมดูลวิเคราะห์ความสอดคล้องของผู้ประเมิน");
const fmt = (n, digits = 3) => Number.isFinite(n) ? n.toFixed(digits) : "N/A";
const ciText = ci => ci && Number.isFinite(ci.low) && Number.isFinite(ci.high) ?
  "[" + fmt(ci.low) + ", " + fmt(ci.high) + "]" : "N/A";
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const modeLabel = {unweighted:"Cohen's Kappa",linear:"Weighted Kappa (Linear)",
  quadratic:"Weighted Kappa (Quadratic)"};
const initialMatrix = [[4,1,0,0],[1,5,1,0],[0,1,5,1],[0,0,1,3]];
const state = {
  view:"quadratic",mode:"records", source:"ข้อมูลจำลอง", recordSource:"ข้อมูลจำลอง", matrixSource:"ตารางไขว้ตัวอย่างจำลอง", records:Engine.demoData(23),
  matrix:initialMatrix.map(row=>row.slice()), summary:null, matrixSummary:null
};
const getSelected = () => Number($("criterion").value);
const weight = () => state.view==="agreement"?"unweighted":state.view;
const metricLabels={unweighted:"2.1.1 Cohen’s Kappa",linear:"2.1.2 Weighted Kappa (Linear)",quadratic:"2.1.3 Weighted Kappa (Quadratic)",agreement:"2.2 Exact Agreement (%)"};
function announce(message) { $("copy-status").textContent = message; }
function markDirty() {
  $("record-status").textContent="ข้อมูลมีการเปลี่ยนแปลง กด 'วิเคราะห์คะแนนใหม่' เพื่ออัปเดตผลลัพธ์";
  $("data-source").textContent="กำลังแก้ข้อมูล";
  $("result-body").hidden=true;
  $("analysis-context").textContent="ข้อมูลเปลี่ยนแปลงแล้ว ผลลัพธ์เดิมถูกซ่อนจนกว่าจะคำนวณใหม่";
}
function showError(err) {
  $("errors").textContent=err.message || String(err);
  $("errors").hidden=false;
  $("result-body").hidden=true;
  $("analysis-context").textContent="การวิเคราะห์หยุดชั่วคราวเพื่อป้องกันรายงานผลที่ไม่ตรงกับข้อมูล";
  announce("โปรดแก้ข้อผิดพลาดก่อนคัดลอกรายงาน");
}
function clearError() {
  $("errors").hidden=true;
  $("errors").textContent="";
  $("result-body").hidden=false;
}
function buildMatrixInputs() {
  $("matrix-input-body").innerHTML = state.matrix.map((row, i) =>
    '<tr><th scope="row">ระดับ '+(i+1)+'</th>'+
    row.map((value, j) => '<td><input id="m-'+i+'-'+j+'" type="number" min="0" max="500" step="1" value="'+value+
      '" aria-label="ผู้ประเมิน 1 ระดับ '+(i+1)+' ผู้ประเมิน 2 ระดับ '+(j+1)+'"></td>').join("")+'</tr>').join("");
  for(let i=0;i<4;i++)for(let j=0;j<4;j++)$("m-"+i+"-"+j).addEventListener("change", ()=>{state.matrixSource=state.source="ตารางไขว้ที่ผู้ใช้กรอก";analyze()});
}
function readMatrixInputs() {
  return Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>{
    const field=$("m-"+i+"-"+j),value=field.value.trim();
    if(value===""||!Number.isSafeInteger(Number(value))||Number(value)<0||Number(value)>500)
      throw Error("ช่องตารางไขว้ "+(i+1)+"–"+(j+1)+" ต้องเป็นจำนวนเต็ม 0–500");
    return Number(value);
  }));
}
function fillStudentDropdown() {
  const select=$("student"),prior=select.value;
  select.innerHTML=state.records.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.id)+'</option>').join("");
  select.value=state.records.some(s=>s.id===prior)?prior:state.records[0].id;
  syncEditor();
}
function syncEditor() {
  try {
    const records=Engine.readCSV($("csv-data").value);
    const id=$("student").value,j=Number($("edit-criterion").value);
    const rec=records.find(r=>r.id===id);
    if(rec)$("level").value=String(rec[$("rater").value][j]);
  } catch (_) { /* The CSV error is displayed on explicit recalculation. */ }
}
function plot(criteria) {
  const method=weight(),stroke={unweighted:"#2563eb",linear:"#15803d",quadratic:"#c2410c"}[method];
  const x=i=>90+i*139,y=v=>236-(v+1)*97;
  let svg='<rect width="740" height="300" fill="#fff"/>';
  for(const tick of [-1,-.5,0,.5,1]){
    const yy=y(tick);
    svg+='<line x1="62" y1="'+yy+'" x2="691" y2="'+yy+'" stroke="#e2e8f0"/>'+
      '<text x="52" y="'+(yy+4)+'" text-anchor="end" fill="#64748b" font-size="12">'+tick+'</text>';
  }
  let path="",started=false;
  criteria.forEach((v,i)=>{
    svg+='<text x="'+x(i)+'" y="277" text-anchor="middle" font-size="13" fill="#334155">เกณฑ์ '+(i+1)+'</text>';
    const stat=v.methods[method].kappa;
    if(Number.isFinite(stat)){
      path+=(started?" L":"M")+x(i)+","+y(stat);started=true;
      svg+='<circle cx="'+x(i)+'" cy="'+y(stat)+'" r="5" fill="'+stroke+'"/>';
    }else started=false;
  });
  if(path)svg+='<path d="'+path+'" stroke="'+stroke+'" stroke-width="3" fill="none"/>';
  $("kappa-chart").innerHTML=svg;
}
function summaryCards(stats,criterionText){
  const mode=state.view,method=weight(),chosen=stats.methods[method],interval=stats.bootstrap.methods[method];
  const cards=mode==="agreement"?
    [["จำนวนคู่",stats.n,criterionText],["ความเห็นตรงกัน",fmt(stats.exactPercent,1)+"%",stats.exact+"/"+stats.n+" คู่"],["MAD",fmt(stats.meanAbsoluteDifference,2),"ระยะห่างของระดับคะแนน"]]:
    [["จำนวนคู่",stats.n,criterionText],[metricLabels[mode],fmt(chosen.kappa),"ค่าความเห็นพ้องที่ปรับโอกาสโดยบังเอิญ"],
     ["95% CI",ciText(interval),"Bootstrap percentile, "+stats.bootstrap.iterations+" รอบ"],
     ["Pₒ",fmt(chosen.po),"ความเห็นพ้องสังเกต (ถ่วงน้ำหนักตามวิธี)"],
     ["Pₑ",fmt(chosen.pe),"ความเห็นพ้องคาดหมายจากโอกาส"]];
  $("result-cards").innerHTML=cards.map(([name,val,note])=>
    '<div class="result-card"><small>'+esc(name)+'</small><strong>'+esc(val)+
    '</strong><div class="caption">'+esc(note)+'</div></div>').join("");
}
function reportOne(statsList,recordMode){
  const mode=state.view,focused=statsList[recordMode?getSelected():0],n=recordMode?statsList.length:1;
  if(mode==="agreement"){
    const rows=statsList.map((stat,i)=>[recordMode?"เกณฑ์ "+(i+1):"ตารางไขว้",stat.n,stat.exact,
      fmt(stat.exactPercent,1)+"%",fmt(stat.meanAbsoluteDifference,2)]);
    const main=Reporting.table(1,"ร้อยละความเห็นตรงกันของผู้ประเมิน (Exact Agreement)",
      ["เกณฑ์","n คู่","ตรงกัน (คู่)","ตรงกัน (%)","MAD"],rows,
      "ค่า agreement = จำนวนคู่ที่ได้ระดับเดียวกัน / n; MAD = ระยะห่างเฉลี่ยของระดับคะแนน ไม่ใช่ Cohen’s κ",
      "จากการประเมิน "+focused.n+" คู่ ใน"+(recordMode?"เกณฑ์ "+(getSelected()+1):"ตารางไขว้ 4×4")+
      " พบผู้ประเมินให้ระดับตรงกัน "+focused.exact+" คู่ ("+fmt(focused.exactPercent,1)+
      "%) ค่า MAD = "+fmt(focused.meanAbsoluteDifference,2)+" ระดับ");
    const cross=Reporting.table(2,"ตารางไขว้ระดับคะแนนประกอบความเห็นตรงกัน — "+(recordMode?"เกณฑ์ "+(getSelected()+1):"ตารางไขว้"),
      ["ผู้ประเมิน 1 \\ 2","ระดับ 1","ระดับ 2","ระดับ 3","ระดับ 4","รวม"],
      [...focused.matrix.map((row,i)=>["ระดับ "+(i+1),...row,focused.r1[i]]),
       ["รวม",...focused.r2,focused.n]],
      "แนวทแยงคือคู่ให้ระดับตรงกัน; ตารางแจกแจงเป็นข้อมูลประกอบ Exact Agreement เท่านั้น",
      "ช่องแนวทแยงรวม "+focused.exact+" คู่ จากทั้งหมด "+focused.n+" คู่ ข้อมูลนี้ช่วยตรวจว่าความไม่ตรงกันเกิดที่ระดับใด");
    return main+cross;
  }
  const label=metricLabels[mode];
  const rows=statsList.map((stat,i)=>{
    const x=stat.methods[mode],interval=stat.bootstrap.methods[mode];
    return [recordMode?"เกณฑ์ "+(i+1):"ตารางไขว้",stat.n,fmt(x.po),fmt(x.pe),fmt(x.kappa),ciText(interval)];
  });
  const chosen=focused.methods[mode],ci=focused.bootstrap.methods[mode];
  return Reporting.table(1,"ผล"+label+" ของผู้ประเมินสองคน",
    ["เกณฑ์","n คู่","Pₒ","Pₑ","κ","95% CI"],rows,
    "κ = (Pₒ − Pₑ)/(1 − Pₑ); "+(mode==="linear"?"น้ำหนัก = 1 − |i−j|/3":
    mode==="quadratic"?"น้ำหนัก = 1 − ((i−j)/3)²":"น้ำหนัก = 1 เมื่อคะแนนตรงกัน และ 0 เมื่อไม่ตรงกัน")+
    "; 95% CI = paired percentile bootstrap 1,500 ครั้ง; N/A คือค่าไม่สามารถกำหนดได้",
    "สำหรับ"+(recordMode?"เกณฑ์ "+(getSelected()+1):"ตารางไขว้")+
    " จำนวน "+focused.n+" คู่ พบ "+label+" = "+fmt(chosen.kappa)+
    " (95% CI "+ciText(ci)+") มี Pₒ = "+fmt(chosen.po)+" และ Pₑ = "+fmt(chosen.pe)+
    ". ควรตรวจการกระจายระดับคะแนนและสมมติฐานก่อนตีความค่าความสอดคล้อง");
}
function render(){
  try{
    clearError();
    $("data-source").textContent=state.source;
    const recordsMode=state.mode==="records";
    const stats=recordsMode?state.summary.criteria[getSelected()]:state.matrixSummary;
    summaryCards(stats,recordsMode?"เกณฑ์ "+(getSelected()+1):"เกณฑ์เดียว (4×4)");
    $("analysis-context").textContent=metricLabels[state.view]+" · "+(recordsMode?
      "ข้อมูลรายคน "+state.summary.n+" คน × 5 เกณฑ์ · เลือกเกณฑ์ "+(getSelected()+1):
      "ตารางไขว้ 4×4 · "+stats.n+" คู่");
    $("chart-block").hidden=!recordsMode||state.view==="agreement";
    if(recordsMode&&state.view!=="agreement")plot(state.summary.criteria);
    $("apa-output").innerHTML=reportOne(recordsMode?state.summary.criteria:[stats],recordsMode);
    $("stat-chart-title").textContent="กราฟ "+metricLabels[state.view]+" แยก 5 เกณฑ์";
    document.querySelectorAll("[data-metric]").forEach(button=>{
      button.setAttribute("aria-current",String(button.dataset.metric===state.view));
    });
  }catch(err){showError(err);}
}
function analyze() {
  try {
    if(state.mode==="records"){
      state.records=Engine.readCSV($("csv-data").value);
      state.summary=Engine.analyzeRecords(state.records);
      fillStudentDropdown();
      $("record-status").textContent="วิเคราะห์ข้อมูล "+state.records.length+" คน × 5 เกณฑ์เรียบร้อย";
    }else{
      state.matrix=readMatrixInputs();
      state.matrixSummary=Engine.analyzeMatrix(state.matrix);
    }
    render();
  }catch(err){showError(err);}
}
function switchMode(mode) {
  state.mode=mode;
  $("mode-records").setAttribute("aria-pressed",String(mode==="records"));
  $("mode-matrix").setAttribute("aria-pressed",String(mode==="matrix"));
  $("record-panel").hidden=mode!=="records";
  $("matrix-panel").hidden=mode!=="matrix";
  $("criterion-control").hidden=mode!=="records";
  state.source=mode==="records"?state.recordSource:state.matrixSource;
  analyze();
}
async function copy(text, message) {
  if(!text){announce("ยังไม่มีผลลัพธ์สำหรับคัดลอก");return}
  try{
    if(!navigator.clipboard || !navigator.clipboard.writeText) throw Error("clipboard unavailable");
    await navigator.clipboard.writeText(text);
    announce(message);
  }catch(_){announce("เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ กรุณาเลือกข้อความจากตารางแล้วคัดลอกเอง");}
}
function restoreMatrix() {
  state.matrix=initialMatrix.map(row=>row.slice());
  buildMatrixInputs();state.matrixSource=state.source="ตารางไขว้ตัวอย่างจำลอง";analyze();
}
$("csv-data").value=Engine.toCSV(state.records);
buildMatrixInputs();
fillStudentDropdown();
$("mode-records").onclick=()=>switchMode("records");
$("mode-matrix").onclick=()=>switchMode("matrix");
$("weight").onchange=()=>{state.view=$("weight").value;render()};
document.querySelectorAll("[data-metric]").forEach(button=>button.onclick=()=>{
  state.view=button.dataset.metric;
  $("weight").value=weight();
  if(history&&history.replaceState)history.replaceState(null,"",location.pathname+"?stat="+state.view);
  render();
});
$("criterion").onchange=()=>{$("edit-criterion").value=$("criterion").value;syncEditor();render()};
$("calculate").onclick=()=>{state.recordSource=state.source="ข้อมูลที่ผู้ใช้กรอกหรือแก้ไข";analyze()};
$("csv-data").addEventListener("input",markDirty);
$("csv-data").addEventListener("change",()=>{state.recordSource=state.source="ข้อมูลที่ผู้ใช้กรอกหรือแก้ไข";analyze()});
$("student").onchange=syncEditor;
$("edit-criterion").onchange=syncEditor;
$("rater").onchange=syncEditor;
$("apply-edit").onclick=()=>{
  try{
    const records=Engine.readCSV($("csv-data").value);
    const record=records.find(rec=>rec.id===$("student").value);
    if(!record)throw Error("กรุณาเลือกนักเรียนที่มีอยู่จริง");
    const j=Number($("edit-criterion").value),value=Number($("level").value),rater=$("rater").value;
    if(!Number.isInteger(j)||j<0||j>4||![1,2,3,4].includes(value)||!["r1","r2"].includes(rater))
      throw Error("เกณฑ์ ผู้ประเมิน หรือระดับคะแนนไม่ถูกต้อง");
    record[rater][j]=value;
    state.recordSource=state.source="ข้อมูลที่ผู้ใช้แก้ไข";
    $("csv-data").value=Engine.toCSV(records);
    $("criterion").value=String(j);
    analyze();
    $("record-status").textContent="แก้คะแนน "+record.id+" · ผู้ประเมิน "+(rater==="r1"?"1":"2")+
      " · เกณฑ์ "+(j+1)+" เป็นระดับ "+value+" และคำนวณใหม่แล้ว";
  }catch(err){showError(err);}
};
$("restore").onclick=()=>{
  const n=Number($("sample-n").value);
  try{
    state.records=Engine.demoData(n);
    state.recordSource=state.source="ข้อมูลจำลอง";
    $("csv-data").value=Engine.toCSV(state.records);
    $("record-status").textContent="คืนค่าข้อมูลจำลอง "+n+" คนแล้ว";
    analyze();
  }catch(err){showError(err);}
};
$("matrix-calc").onclick=()=>{state.matrixSource=state.source="ตารางไขว้ที่ผู้ใช้กรอก";analyze()};
$("matrix-restore").onclick=restoreMatrix;
$("template").onclick=()=>copy(Engine.HEAD.join(",")+
  "\n"+Engine.toCSV(Engine.demoData(3)).split("\n").slice(1).join("\n"),"คัดลอกแม่แบบ CSV แล้ว");
$("copy-report").onclick=async()=>{
  if($("result-body").hidden){announce("ข้อมูลยังไม่ผ่านการตรวจสอบ กรุณาคำนวณใหม่ก่อน");return}
  const text=$("analysis-context").innerText+"\n\n"+$("apa-output").innerText;
  if(typeof ClipboardItem!=="undefined" && navigator.clipboard && navigator.clipboard.write){
    try{
      const contents=$("apa-output").innerHTML
        .replace(/<table class="research-apa">/g,'<table style="width:100%;border-collapse:collapse">')
        .replace(/<thead>/g,'<thead style="border-top:2px solid #334155;border-bottom:1px solid #334155">')
        .replace(/<tbody>/g,'<tbody style="border-bottom:2px solid #334155">')
        .replace(/<th>/g,'<th style="padding:8px;text-align:left">')
        .replace(/<td>/g,'<td style="padding:8px;text-align:left">');
      const item=new ClipboardItem({"text/html":new Blob([contents],{type:"text/html"}),
        "text/plain":new Blob([text],{type:"text/plain"})});
      await navigator.clipboard.write([item]);
      announce("คัดลอกตาราง APA 7 พร้อมคำบรรยายและโครงสร้างตารางแล้ว");
      return;
    }catch(_) {/* Fall back to plain-text copy. */}
  }
  copy(text,"คัดลอกตารางและคำบรรยาย APA แล้ว");
};
$("copy-matrix").onclick=()=>{
  if($("result-body").hidden){announce("กรุณาคำนวณให้ถูกต้องก่อน");return}
  const stats=state.mode==="records"?state.summary.criteria[getSelected()]:state.matrixSummary;
  copy(stats.matrix.map(row=>row.join(",")).join("\n"),"คัดลอกเมทริกซ์ 4×4 แล้ว สามารถวางลง Lab 05 ได้");
};
function saveFile(filename,text,mime){
  const blob=new Blob([text],{type:mime});
  const url=URL.createObjectURL(blob),link=document.createElement("a");
  link.href=url;link.download=filename;
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$("download-csv").onclick=()=>{
  try{
    const records=Engine.readCSV($("csv-data").value);
    saveFile("lab02-two-rater-five-criteria.csv",Engine.toCSV(records),"text/csv;charset=utf-8");
    announce("เตรียมบันทึกคะแนน CSV แล้ว · เก็บไฟล์ไว้ในเครื่องของคุณ");
  }catch(err){showError(err);}
};
$("download-report").onclick=()=>{
  if($("result-body").hidden){announce("กรุณาคำนวณให้ถูกต้องก่อน");return}
  const text="Open Research Statistics Lab · Lab 02\n"+
    $("analysis-context").innerText+"\n\n"+$("apa-output").innerText+
    "\n\nข้อมูลเริ่มต้นเป็นข้อมูลจำลอง; ตรวจผลกับซอฟต์แวร์สถิติอิสระก่อนใช้จริง";
  saveFile("lab02-rubric-reliability-apa.txt",text,"text/plain;charset=utf-8");
  announce("เตรียมบันทึกไฟล์รายงาน .txt แล้ว");
};
const initialView=new URLSearchParams(location.search).get("stat");
if(metricLabels[initialView])state.view=initialView;
$("weight").value=weight();
analyze();
})();
