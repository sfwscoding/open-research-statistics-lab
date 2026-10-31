/* Shared navigation: every statistical menu points to one isolated analysis view. */
(()=>{
const items=[
 {name:"Lab 01",href:"lab01.html",groups:[
  ["1. วิเคราะห์คุณภาพข้อสอบ",[
   ["1.1.1 ความยาก (p)","lab01.html?stat=difficulty"],
   ["1.1.2 Corrected item-total r","lab01.html?stat=corrected"],
   ["1.1.3 อำนาจจำแนก D","lab01.html?stat=discrimination"],
   ["1.1.4 วิเคราะห์ตัวลวง","lab01.html?stat=distractor"],
   ["1.2 ความสอดคล้องภายใน KR-20","lab01.html?stat=kr20"]]]
 ]},
 {name:"Lab 02",href:"lab02.html",groups:[
  ["2. Reliability · ผู้ประเมินสองคน",[
   ["2.1.1 Cohen's Kappa","lab02.html?stat=unweighted"],
   ["2.1.2 Weighted Kappa · Linear","lab02.html?stat=linear"],
   ["2.1.3 Weighted Kappa · Quadratic","lab02.html?stat=quadratic"],
   ["2.2 Exact Agreement (%)","lab02.html?stat=agreement"]]]
 ]},
 {name:"Lab 03",href:"lab03.html",groups:[
  ["3.1 เทียบกับเกณฑ์",[
   ["3.1.1 One-Sample t-test","lab03.html?test=ttest"],
   ["3.1.2 One-Sample Wilcoxon","lab03.html?test=wilcoxon-criterion"]]],
  ["3.2 ก่อน–หลัง",[
   ["3.2.1 Paired t-test","lab03.html?test=paired"],
   ["3.2.2 Paired Wilcoxon","lab03.html?test=wilcoxon-paired"]]],
  ["3.3 สัดส่วนเทียบเกณฑ์",[
   ["3.3.1 Exact Binomial Test","lab03.html?test=binomial"]]]
 ]},
 {name:"Lab 04",href:"lab04.html",groups:[
  ["4. Competency Tracking",[
   ["4.1.1 Stackable KPA","lab04.html?stat=kpa"],
   ["4.1.2 Micro Task","lab04.html?stat=micro"],
   ["4.2 Rubric / Hybrid Rule","lab04.html?stat=hybrid"],
   ["4.3 โครงงาน 4 ชั่วโมง","lab04.html?stat=project"]]]
 ]},
 {name:"Lab 05",href:"lab05.html",groups:[
  ["5. รายงานคุณภาพข้อสอบ",[
   ["ความยาก (p)","lab05.html?stat=difficulty"],
   ["Corrected item-total r","lab05.html?stat=corrected"],
   ["อำนาจจำแนก D","lab05.html?stat=discrimination"],
   ["ตัวลวง","lab05.html?stat=distractor"],
   ["KR-20","lab05.html?stat=kr20"]]],
  ["5. รายงานความเที่ยงผู้ประเมิน",[
   ["Cohen's Kappa","lab05.html?stat=cohen"],
   ["Weighted Linear","lab05.html?stat=linear"],
   ["Weighted Quadratic","lab05.html?stat=quadratic"]]],
  ["5. รายงานผลการเรียนรู้",[
   ["One-Sample t-test","lab05.html?stat=one-t"],
   ["One-Sample Wilcoxon","lab05.html?stat=one-w"],
   ["Paired t-test","lab05.html?stat=paired-t"],
   ["Paired Wilcoxon","lab05.html?stat=paired-w"],
   ["Exact Binomial","lab05.html?stat=binomial"]]],
  ["5. รายงานสมรรถนะและหลักฐาน",[
   ["Hybrid Rule","lab05.html?stat=hybrid"],
   ["KPA 12 ชั่วโมง","lab05.html?stat=kpa"],
   ["โครงงาน 4 ชั่วโมง","lab05.html?stat=project"]]]
 ]}
];
const current=location.pathname.split("/").pop()||"index.html";
const nav=document.createElement("nav");
nav.className="unified-nav";
nav.setAttribute("aria-label","เมนูหลัก Open Research Statistics Lab");
nav.innerHTML='<a class="unified-brand" href="index.html">◉ Open Research Statistics Lab</a><div class="unified-items">'+
 items.map(item=>'<details'+(current===item.href?' class="current"':'')+'><summary>'+item.name+
 ' <span aria-hidden="true">⌄</span></summary><div class="unified-dropdown"><a class="unified-overview" href="'+item.href+'">เปิด '+item.name+
 '</a>'+item.groups.map(group=>'<div class="unified-group">'+group[0]+'</div>'+group[1].map(link=>
 '<a href="'+link[1]+'">'+link[0]+'</a>').join("")).join("")+'</div></details>').join("")+"</div>";
document.body.insertBefore(nav,document.body.firstChild);
nav.querySelectorAll("details").forEach(d=>d.addEventListener("toggle",()=>{
 if(d.open)nav.querySelectorAll("details").forEach(other=>{if(other!==d)other.open=false});
}));
document.addEventListener("click",event=>{
 if(!nav.contains(event.target))nav.querySelectorAll("details").forEach(d=>d.open=false);
});
document.addEventListener("keydown",event=>{
 if(event.key==="Escape")nav.querySelectorAll("details").forEach(d=>d.open=false);
});
})();