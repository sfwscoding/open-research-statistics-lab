/* Dynamic research reports. All calculations stay client-side. */
(function(g){"use strict";
const R={},e=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const f=(v,d=3)=>Number.isFinite(Number(v))&&v!==null?Number(v).toFixed(d):"N/A";
const m=a=>a.reduce((x,y)=>x+y,0)/a.length;
const csv=s=>s.trim().split(/\r?\n/).filter(Boolean).map(x=>x.split(",").map(v=>v.trim()));
const numeric=x=>{if(String(x).trim()===""||!Number.isFinite(Number(x)))throw Error("ค่าที่กรอกต้องเป็นตัวเลขและไม่เว้นว่าง");return Number(x)};
R.table=(i,title,heads,rows,note,summary)=>'<section class="research-table"><div class="apa-label">ตารางที่ '+i+'</div><div class="apa-title">'+e(title)+'</div><div class="research-scroll"><table class="research-apa"><thead><tr>'+heads.map(v=>'<th>'+e(v)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+e(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div><p class="research-note"><em>หมายเหตุ.</em> '+e(note)+'</p><p class="research-interpret"><strong>คำบรรยายผล.</strong> '+e(summary)+'</p></section>';
R.mcq=(n,k,avg,kr,items,labels,keys)=>{
 const rows=items.map((v,i)=>[labels[i]||("Q"+(i+1)),keys[i],f(v.p),f(v.corrected),f(v.discrimination)]);
 return R.table(1,"การวิเคราะห์คุณภาพข้อสอบรายข้อ",["ข้อ","เฉลย","ความยาก p","Corrected r","D สูง–ต่ำ"],rows,"n = "+n+"; คะแนนรวมมีข้อสอบ "+k+" ข้อ; KR-20 = "+f(kr)+"; D = สัดส่วนตอบถูกกลุ่มสูงลบกลุ่มต่ำ","ผู้เรียน "+n+" คน มีคะแนนเฉลี่ย "+f(avg,2)+" จาก "+k+" คะแนน และค่า KR-20 = "+f(kr)+". ค่าความยาก อำนาจจำแนก และความสัมพันธ์รายข้อแสดงในตาราง ข้อสอบควรได้รับการพิจารณาเนื้อหาและตัวลวงร่วมด้วย");
};
R.analyzeMCQ=(raw,rawKey)=>{
 const lines=csv(raw),keys=rawKey.split(",").map(x=>x.trim().toUpperCase()),k=keys.length,n=lines.length-1;
 if(k<2||n<3||lines.some(x=>x.length!==k)||keys.some(x=>!x)||lines.slice(1).some(x=>x.some(v=>!v)))throw Error("รูปแบบ CSV ข้อสอบหรือเฉลยไม่ถูกต้อง (อย่างน้อย 2 ข้อ และ 3 คน)");
 const scores=lines.slice(1).map(row=>row.map((x,j)=>Number(x.toUpperCase()===keys[j]))),totals=scores.map(v=>v.reduce((a,b)=>a+b,0));
 const variance=a=>a.reduce((s,x)=>s+(x-m(a))**2,0)/a.length,correlation=(a,b)=>{let ma=m(a),mb=m(b),ab=0,aa=0,bb=0;for(let i=0;i<a.length;i++){ab+=(a[i]-ma)*(b[i]-mb);aa+=(a[i]-ma)**2;bb+=(b[i]-mb)**2}return aa>0&&bb>0?ab/Math.sqrt(aa*bb):NaN};
 const count=Math.max(1,Math.floor(.27*n)),ordered=totals.map((v,i)=>({v,i})).sort((a,b)=>b.v-a.v||a.i-b.i),high=ordered.slice(0,count),low=ordered.slice(-count);
 let pq=0;const items=keys.map((key,j)=>{const col=scores.map(row=>row[j]),p=m(col);pq+=p*(1-p);return {p,corrected:correlation(col,totals.map((t,i)=>t-col[i])),discrimination:m(high.map(x=>col[x.i]))-m(low.map(x=>col[x.i]))}});
 const vt=variance(totals);return {n,k,avg:m(totals),kr:vt>0?k/(k-1)*(1-pq/vt):NaN,items,labels:lines[0],keys};
};
R.analyzeKappa=matrix=>{
 const a=matrix.map(row=>row.map(numeric));if(a.length!==4||a.some(row=>row.length!==4)||a.flat().some(x=>!Number.isSafeInteger(x)||x<0))throw Error("ตาราง Kappa ต้องเป็นจำนวนเต็มไม่ติดลบ ขนาด 4 × 4");
 const n=a.flat().reduce((x,y)=>x+y,0);if(!n)throw Error("ต้องมีการประเมินอย่างน้อยหนึ่งคู่");
 const rs=a.map(row=>row.reduce((x,y)=>x+y,0)),cs=[0,1,2,3].map(j=>a.reduce((x,row)=>x+row[j],0));
 const calc=w=>{let po=0,pe=0;for(let i=0;i<4;i++)for(let j=0;j<4;j++){const weight=w(i,j);po+=a[i][j]*weight/n;pe+=rs[i]*cs[j]*weight/(n*n)}return {po,pe,kappa:Math.abs(1-pe)<1e-12?NaN:(po-pe)/(1-pe)}};
 return {n,unweighted:calc((i,j)=>i===j?1:0),linear:calc((i,j)=>1-Math.abs(i-j)/3),quadratic:calc((i,j)=>1-((i-j)/3)**2)};
};
R.kappa=(matrix)=>{
 const z=R.analyzeKappa(matrix);return R.table(1,"ความสอดคล้องของผู้ประเมินสองคนจาก Rubric 4 ระดับ",["วิธี","n คู่","สังเกต Pₒ","คาดหมาย Pₑ","κ"],[["Cohen's Kappa",z.n,f(z.unweighted.po),f(z.unweighted.pe),f(z.unweighted.kappa)],["Weighted (Linear)",z.n,f(z.linear.po),f(z.linear.pe),f(z.linear.kappa)],["Weighted (Quadratic)",z.n,f(z.quadratic.po),f(z.quadratic.pe),f(z.quadratic.kappa)]],"Weighted ใช้ agreement weights 1 − |i−j|/3 หรือ 1 − ((i−j)/3)²; N/A หมายถึงค่าที่นิยามไม่ได้; ช่วงความเชื่อมั่นยังไม่คำนวณ","จำนวนการประเมินร่วม "+z.n+" คู่ มีสัดส่วนตรงกัน "+f(z.unweighted.po*100,1)+"% ค่า Cohen's κ = "+f(z.unweighted.kappa)+", Weighted κ แบบ Linear = "+f(z.linear.kappa)+" และ Quadratic = "+f(z.quadratic.kappa)+". ต้องเลือกวิธีถ่วงน้ำหนักตามระดับรูบริกที่กำหนดไว้ก่อนวิเคราะห์จริง");
};
R.hybrid=(raw,names,number=5)=>{const z=g.Competency.evaluate(raw),n=z.n,l=[Math.ceil(.8*n),Math.ceil(.5*n),Math.ceil(.2*n)];return R.table(number,"ผลการบรรลุสมรรถนะ Rubric 5 เกณฑ์ตาม Hybrid Rule",["เกณฑ์","≥2 (80%)","≥3 (50%)","=4 (20%)","M ระดับ"],z.criteria.map((x,j)=>[names[j]||("เกณฑ์ "+(j+1)),...x.reached.map((v,i)=>v+" ("+f(v/n*100,1)+"%) "+(x.passed[i]?"ผ่าน":"ไม่ผ่าน")),f(x.mean,2)]),"n = "+n+"; จำนวนขั้นต่ำแต่ละเกณฑ์คือ "+l.join(", ")+" คน; 15 เงื่อนไข เป็นเกณฑ์ปฏิบัติการของผู้วิจัย ไม่ใช่เกณฑ์สากล","พบว่าผ่านเกณฑ์ "+z.passedConditions+" จาก 15 เงื่อนไข จึง"+(z.passed?"ผ่านครบตาม Hybrid Rule":"ยังไม่ผ่านครบตาม Hybrid Rule")+" เป็นผลประเมินตามเกณฑ์ ไม่ใช่การทดสอบนัยสำคัญทางสถิติ");};
R.csv=csv;R.numeric=numeric;R.f=f;R.mean=m;
g.ResearchReports=R;
})(window);
