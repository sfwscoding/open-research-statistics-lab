/* Lab 04: one analysis per view, with the relevant APA table directly under its result. */
(function(){"use strict";
const $=id=>document.getElementById(id);
const locate=id=>$(id).closest(".panel");
const main=document.querySelector(".layout > main.stack");
if(!main||!$("lab04-stat-menu"))return;
const panels={
 kpa:locate("kpaSection"),
 micro:locate("microSection"),
 hybrid:locate("rubricSection"),
 project:locate("projectSection")
};
const editKpa=locate("save"),editRubric=locate("saveRub");
const sharedOverview=locate("sideK"),hybridSummary=locate("conditionCount"),hybridInterpret=locate("interpret");
const legacyAPA=$("apaResults");
main.appendChild(panels.project);
legacyAPA.hidden=true;
function attach(tableId,anchor){
 const target=$(tableId);
 target.classList.add("lab04-apa");
 anchor.insertAdjacentElement("afterend",target);
 const actions=document.createElement("div");
 actions.className="lab04-copy";
 const button=document.createElement("button");
 button.className="btn alt";
 button.type="button";
 button.textContent="คัดลอกตาราง APA และคำบรรยายของหัวข้อนี้";
 const status=document.createElement("p");
 status.className="lab04-copy-status";
 status.setAttribute("role","status");
 button.onclick=async()=>{
  try{
   await navigator.clipboard.writeText(target.innerText);
   status.textContent="คัดลอกตารางและคำบรรยายของหัวข้อนี้แล้ว";
  }catch(e){status.textContent="กรุณาเลือกข้อความในตารางแล้วคัดลอกด้วยตนเอง"}
 };
 actions.append(button,status);
 target.insertAdjacentElement("afterend",actions);
 return target;
}
attach("apaKpa",$("hourStats"));
attach("apaRubric",$("rubricBody").closest(".tablewrap"));
attach("apaProject",$("pj-summary").closest(".tablewrap"));
const microTable=document.createElement("div");
microTable.id="apaMicro";
microTable.className="lab04-apa";
$("hourBars").insertAdjacentElement("afterend",microTable);
attach("apaMicro",$("hourBars"));
function renderMicro(){
 const h=Number($("hour").value),index=h-1,data=hourly()[index],n=rows().length;
 if(!data)return;
 const table=apaTable(2,"หลักฐาน Micro Task ในชั่วโมงที่ "+h,
  ["มิติหลักฐาน","คะแนนเฉลี่ย (%)","ผู้เรียน (n)"],
  [["Knowledge (K)",data.K.toFixed(2),n],["Practice (P)",data.P.toFixed(2),n],
   ["Attitude (A)",data.A.toFixed(2),n]],
  "คะแนนจากหลักฐานรายชั่วโมงในช่วง 0–100; n = "+n+"; ใช้ข้อมูลจำลอง คะแนนต่างภาระงานอาจไม่เทียบเคียงกัน",
  "จากหลักฐาน Micro Task ชั่วโมงที่ "+h+" พบค่าเฉลี่ยความรู้ "+data.K.toFixed(2)+
  "% ทักษะปฏิบัติ "+data.P.toFixed(2)+"% และเจตคติ "+data.A.toFixed(2)+
  "% ตามลำดับ ผลนี้เป็นการบรรยายหลักฐาน ไม่ใช่การทดสอบนัยสำคัญ");
 microTable.innerHTML=table;
}
const drawKPAOriginal=drawKPA;
drawKPA=function(){drawKPAOriginal();renderMicro()};
renderMicro();
const routes=["kpa","micro","hybrid","project"];
const menu=[...document.querySelectorAll("#lab04-stat-menu [data-stat]")];
function show(which,updateURL=true){
 if(!routes.includes(which))which="kpa";
 for(const [name,panel] of Object.entries(panels))panel.hidden=name!==which;
 editKpa.hidden=which!=="kpa"&&which!=="micro";
 editRubric.hidden=which!=="hybrid";
 sharedOverview.hidden=which!=="kpa"&&which!=="micro";
 hybridSummary.hidden=which!=="hybrid";
 hybridInterpret.hidden=which!=="hybrid";
 menu.forEach(button=>button.setAttribute("aria-current",String(button.dataset.stat===which)));
 if(which==="micro")renderMicro();
 if(updateURL&&window.history?.replaceState)
   window.history.replaceState(null,"",window.location.pathname+"?stat="+encodeURIComponent(which));
}
menu.forEach(button=>button.addEventListener("click",()=>show(button.dataset.stat)));
const raw=new URLSearchParams(window.location.search).get("stat");
const fromHash={"#kpaSection":"kpa","#microSection":"micro","#rubricSection":"hybrid","#projectSection":"project"};
show(routes.includes(raw)?raw:(fromHash[window.location.hash]||"kpa"),false);
})();