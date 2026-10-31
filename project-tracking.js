/* Lab 04 project evidence for hours 13–16 (simulated, editable). */
(function(){"use strict";
const $=id=>document.getElementById(id);
const host=$("projectSection")?.closest(".panel");if(!host)return;
host.insertAdjacentHTML("beforeend",'<div class="research-section"><h3>จำลองผลโครงงาน ชั่วโมงที่ 13–16</h3><div class="research-inputs"><div><label for="pj-student">รหัสนักเรียน</label><select id="pj-student"></select></div><div><label for="pj-hour">ชั่วโมงโครงงาน</label><select id="pj-hour"><option value="0">13</option><option value="1">14</option><option value="2">15</option><option value="3">16</option></select></div><div><label for="pj-score">คะแนนหลักฐาน (%)</label><input id="pj-score" type="number" min="0" max="100" step=".1" value="75"></div></div><button type="button" class="btn" id="pj-save">อัปเดตคะแนนโครงงาน</button><p id="pj-message" class="hint" role="status"></p><div class="tablewrap"><table><thead><tr><th>ชั่วโมง</th><th>ค่าเฉลี่ย (%)</th><th>ผู้มีหลักฐาน</th></tr></thead><tbody id="pj-summary"></tbody></table></div></div>');
$("pj-student").innerHTML=students.map(s=>'<option value="'+s.id+'">'+s.id+'</option>').join("");
host.insertAdjacentHTML("beforeend",'<div id="apaProject" class="lab04-apa"></div>');
const ensure=()=>students.forEach((s,i)=>{if(!s.project)s.project=Array.from({length:4},(_,h)=>Math.min(100,58+h*5+(i*7+h*3)%21))});
const round=x=>Number(x).toFixed(2);
function renderProject(){ensure();const n=students.length;const stats=Array.from({length:4},(_,h)=>{const all=students.map(s=>s.project[h]).filter(Number.isFinite);return {h:h+13,count:all.length,mean:all.reduce((a,b)=>a+b,0)/all.length}});
$("pj-summary").innerHTML=stats.map(v=>'<tr><td>'+v.h+'</td><td>'+round(v.mean)+'</td><td>'+v.count+'/'+n+'</td></tr>').join("");
$("apaProject").innerHTML=apaTable(3,"ค่าเฉลี่ยหลักฐานโครงงานรายบุคคล ชั่วโมงที่ 13–16",["ชั่วโมง","n","M (%)"],stats.map(x=>[x.h,x.count,round(x.mean)]),"ข้อมูลจำลองเท่านั้น; เป็นค่าร้อยละของหลักฐานโครงงานแต่ละชั่วโมง ไม่ใช่การประเมินสมรรถนะ Rubric หรือการทดสอบนัยสำคัญ","ข้อมูลจำลองจากนักเรียน "+n+" คน พบค่าเฉลี่ยหลักฐานโครงงานชั่วโมงที่ 13 ถึง 16 เท่ากับ "+stats.map(x=>round(x.mean)).join(", ")+" ตามลำดับ การอธิบายพัฒนาการต้องพิจารณาความเทียบเคียงของภาระงานและเกณฑ์ประเมินด้วย");
}
const old=drawAPA;drawAPA=function(){old();renderProject()};
$("pj-save").onclick=()=>{const student=students.find(s=>s.id===$("pj-student").value),h=Number($("pj-hour").value),txt=$("pj-score").value,val=Number(txt);if(!student||!Number.isInteger(h)||h<0||h>3||txt.trim()===""||!Number.isFinite(val)||val<0||val>100){$("pj-message").textContent="กรอกคะแนน 0–100 และเลือกนักเรียนกับชั่วโมงให้ถูกต้อง";return}ensure();student.project[h]=val;renderProject();$("pj-message").textContent="อัปเดตข้อมูลจำลอง "+student.id+" ชั่วโมง "+(h+13)+" = "+val+"% แล้ว"};
$("copyAPA").onclick=()=>{const text=["apaKpa","apaRubric","apaProject"].map(id=>$(id).innerText).join("\n\n");if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>$("copyMessage").textContent="คัดลอกตาราง APA ทั้ง 3 ตารางแล้ว").catch(()=>$("copyMessage").textContent="ไม่สามารถคัดลอกอัตโนมัติ");else $("copyMessage").textContent="กรุณาเลือกตารางเพื่อคัดลอก"};
renderProject();
})();
