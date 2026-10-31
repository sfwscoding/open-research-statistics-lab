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
  mode:"records", source:"ข้อมูลจำลอง", recordSource:"ข้อมูลจำลอง", matrixSource:"ตารางไขว้ตัวอย่างจำลอง", records:Engine.demoData(23),
  matrix:initialMatrix.map(row=>row.slice()), summary:null, matrixSummary:null
};
const getSelected = () => Number($("criterion").value);
const weight = () => $("weight").value;
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
  const colors={unweighted:"#2563eb",linear:"#15803d",quadratic:"#c2410c"};
  const x=i=>90+i*139;
  const y=v=>236-(v+1)*97;
  let svg='<rect width="740" height="300" fill="#fff"/>';
  for(const tick of [-1,-.5,0,.5,1]){
    const yy=y(tick);
    svg+='<line x1="62" y1="'+yy+'" x2="691" y2="'+yy+'" stroke="'+
      (tick===0?"#94a3b8":"#e2e8f0")+'" stroke-width="'+(tick===0?1.5:1)+'"/>'+
      '<text x="52" y="'+(yy+4)+'" text-anchor="end" fill="#64748b" font-size="12">'+tick+'</text>';
  }
  for(let i=0;i<criteria.length;i++)
    svg+='<text x="'+x(i)+'" y="277" text-anchor="middle" font-size="13" fill="#334155">เกณฑ์ '+(i+1)+'</text>';
  for(const method of Engine.MODES){
    const stroke=colors[method],points=criteria.map((r,i)=>({x:x(i),v:r.methods[method].kappa}));
    let path="",started=false;
    for(const p of points){if(Number.isFinite(p.v)){path+=(started?" L":"M")+p.x+","+y(p.v);started=true}else started=false}
    if(path)svg+='<path d="'+path+'" fill="none" stroke="'+stroke+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    for(const p of points)if(Number.isFinite(p.v)){
      svg+='<circle cx="'+p.x+'" cy="'+y(p.v)+'" r="5" fill="'+stroke+'" stroke="#fff" stroke-width="2"/>';
    }
  }
  $("kappa-chart").innerHTML=svg;
}
function summaryCards(stats, criterionText) {
  const selected=stats.methods[weight()];
  const CI=stats.bootstrap.methods[weight()];
  const cards=[
    ["จำนวนคู่คะแนน",String(stats.n),criterionText],
    ["เห็นตรงกัน",fmt(stats.exactPercent,1)+"%",stats.exact+"/"+stats.n+" คู่"],
    ["Cohen's κ",fmt(stats.methods.unweighted.kappa),"ไม่ถ่วงน้ำหนัก"],
    [modeLabel[weight()],fmt(selected.kappa),"วิธีที่เลือก"],
    ["95% CI",ciText(CI),"Bootstrap percentile · B = "+stats.bootstrap.iterations],
    ["MAD",fmt(stats.meanAbsoluteDifference,2),"ค่าเฉลี่ยระยะห่างระดับคะแนน"]
  ];
  $("result-cards").innerHTML=cards.map(([name,val,note])=>
    '<div class="result-card"><small>'+esc(name)+'</small><strong>'+esc(val)+
    '</strong><div class="caption">'+esc(note)+'</div></div>').join("");
}
function methodsTable(number, stats, criterionText) {
  const rows=Engine.MODES.map(method=>{
    const value=stats.methods[method],interval=stats.bootstrap.methods[method];
    return [modeLabel[method],stats.n,fmt(value.po),fmt(value.pe),fmt(value.kappa),ciText(interval)];
  });
  return Reporting.table(number,
    "ความสอดคล้องของผู้ประเมินสองคน — "+criterionText,
    ["วิธีคำนวณ","n","Pₒ","Pₑ","κ","95% CI"],
    rows,
    "κ = (Pₒ − Pₑ)/(1 − Pₑ); Weighted แบบ Linear ใช้น้ำหนัก 1 − |i−j|/3 และ Quadratic ใช้น้ำหนัก 1 − ((i−j)/3)²; 95% CI ใช้ paired percentile bootstrap 1,500 ครั้งจากคู่คะแนน; N/A คือค่าที่นิยามหรือประมาณไม่ได้",
    "การประเมิน "+stats.n+" คู่ มีผู้ประเมินให้คะแนนตรงกัน "+fmt(stats.exactPercent,1)+
    "% (จำนวน "+stats.exact+" คู่) พบ Cohen's κ = "+fmt(stats.methods.unweighted.kappa)+
    ", Linear Weighted κ = "+fmt(stats.methods.linear.kappa)+
    " และ Quadratic Weighted κ = "+fmt(stats.methods.quadratic.kappa)+
    " โดยช่วงความเชื่อมั่น 95% ของวิธี "+(weight()==="linear"?"Linear":"Quadratic")+
    " คือ "+ciText(stats.bootstrap.methods[weight()])+
    ". ควรตรวจการกระจายระดับคะแนน ความไม่สมดุล และความกว้างของช่วงความเชื่อมั่นก่อนตีความ");
}
function matrixTable(number,stats,criterionText) {
  const rows=stats.matrix.map((row,i)=>[
    "ระดับ "+(i+1),...row,stats.r1[i]
  ]);
  rows.push(["รวมผู้ประเมิน 2",...stats.r2,stats.n]);
  return Reporting.table(number,
    "ตารางไขว้การให้คะแนนระดับ 1–4 — "+criterionText,
    ["ผู้ประเมิน 1 \\ 2","ระดับ 1","ระดับ 2","ระดับ 3","ระดับ 4","รวม"],
    rows,
    "ช่องแนวทแยงคือคะแนนตรงกัน; รวมคู่ตรงกัน "+stats.exact+"/"+stats.n+
    " คู่; ตารางแสดงจำนวน (n) ไม่ใช่ร้อยละ",
    "การให้คะแนนมีคู่ตรงกัน "+stats.exact+" คู่ จากทั้งหมด "+stats.n+
    " คู่ ("+fmt(stats.exactPercent,1)+
    "%) จึงควรดูรูปแบบการไม่ตรงกันในระดับคะแนนที่อยู่ห่างกันประกอบกับค่า Weighted Kappa");
}
function distributionTable(number,stats,criterionText) {
  return Reporting.table(number,
    "การกระจายระดับรูบริกแยกตามผู้ประเมิน — "+criterionText,
    ["ระดับรูบริก","ผู้ประเมิน 1 n (%)","ผู้ประเมิน 2 n (%)"],
    Array.from({length:4},(_,i)=>[
      "ระดับ "+(i+1),
      stats.r1[i]+" ("+fmt(100*stats.r1[i]/stats.n,1)+"%)",
      stats.r2[i]+" ("+fmt(100*stats.r2[i]/stats.n,1)+"%)"]),
    "n = "+stats.n+" คู่; ร้อยละเป็นสัดส่วนภายในผู้ประเมินแต่ละคน",
    "การกระจายการให้คะแนนระดับ 1–4 อาจไม่สมดุลระหว่างผู้ประเมิน ซึ่งมีผลต่อค่า Pₑ และ κ จึงไม่ควรพิจารณาค่า κ โดยละเลยตารางแจกแจงนี้");
}
function criteriaTable(summary) {
  const chosen=weight(),criteria=summary.criteria;
  const rows=criteria.map(r=>[
    "เกณฑ์ "+r.criterion,r.n,fmt(r.exactPercent,1)+"%",
    fmt(r.methods.unweighted.kappa),fmt(r.methods.linear.kappa),
    fmt(r.methods.quadratic.kappa),ciText(r.bootstrap.methods[chosen]),
    fmt(r.meanAbsoluteDifference,2)
  ]);
  const focus=criteria[getSelected()];
  return Reporting.table(1,
    "ความสอดคล้องของผู้ประเมินสองคน แยกตามเกณฑ์รูบริกทั้ง 5 ด้าน",
    ["เกณฑ์","n คู่","ตรงกัน (%)","Cohen κ","Linear κ","Quadratic κ","95% CI (วิธีที่เลือก)","MAD"],
    rows,
    "คะแนนระดับ 1–4; 95% CI ของ "+modeLabel[chosen]+
    " คำนวณด้วย paired percentile bootstrap 1,500 ครั้งต่อเกณฑ์; MAD คือค่าเฉลี่ยระยะห่างของระดับคะแนน; ไม่รวมค่าทั้งห้าเป็น κ ค่าเดียว",
    "การประเมิน "+summary.n+" คน ครบ 5 เกณฑ์ พบว่าเกณฑ์ที่ "+focus.criterion+
    " มีร้อยละการให้คะแนนตรงกัน "+fmt(focus.exactPercent,1)+"% และ "+
    modeLabel[chosen]+" = "+fmt(focus.methods[chosen].kappa)+
    " (95% CI "+ciText(focus.bootstrap.methods[chosen])+
    ") ทั้งนี้ค่าสัมประสิทธิ์ต้องพิจารณาแยกตามเกณฑ์ ไม่ใช้ค่าเฉลี่ย κ เพื่ออ้างความเที่ยงของคะแนนรูบริกรวมโดยตรง");
}
function reportRecords(summary) {
  const stats=summary.criteria[getSelected()];
  return criteriaTable(summary)+methodsTable(2,stats,"เกณฑ์ "+stats.criterion)+
    matrixTable(3,stats,"เกณฑ์ "+stats.criterion)+
    distributionTable(4,stats,"เกณฑ์ "+stats.criterion);
}
function reportMatrix(stats) {
  return methodsTable(1,stats,"ตารางไขว้ 4×4")+
    matrixTable(2,stats,"ตารางไขว้ 4×4")+
    distributionTable(3,stats,"ตารางไขว้ 4×4");
}
function render() {
  try {
    clearError();
    $("data-source").textContent=state.source;
    const recordsMode=state.mode==="records";
    const stats=recordsMode?state.summary.criteria[getSelected()]:state.matrixSummary;
    summaryCards(stats,recordsMode?"เกณฑ์ "+(getSelected()+1):"เกณฑ์เดียว (4×4)");
    $("analysis-context").textContent=recordsMode?
      "รูปแบบรายคน · ผู้ประเมิน 2 คน · นักเรียน "+state.summary.n+
      " คน · 5 เกณฑ์ · กำลังดูรายละเอียดเกณฑ์ "+(getSelected()+1)+
      " · เน้น "+modeLabel[weight()]:
      "รูปแบบตารางไขว้ · ผู้ประเมิน 2 คน · "+stats.n+
      " คู่คะแนน · เกณฑ์เดียว · เน้น "+modeLabel[weight()];
    $("chart-block").hidden=!recordsMode;
    if(recordsMode)plot(state.summary.criteria);
    $("apa-output").innerHTML=recordsMode?reportRecords(state.summary):reportMatrix(stats);
  } catch(err) { showError(err); }
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
$("weight").onchange=render;
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
analyze();
})();
