/* Chapter 4 Single-Statistic Builder: one route, one test, one APA table + narrative. */
(function(){"use strict";
const $=id=>document.getElementById(id),R=window.ResearchReports,O=window.Outcomes;
const S=window.StatExtensions,C=window.Competency,KPA=window.KPATracker,RR=window.RubricReliability;
const names={
 difficulty:["1.1 ความยากรายข้อ (p)","mcq"],corrected:["1.2 Corrected item–total r","mcq"],
 discrimination:["1.3 อำนาจจำแนกกลุ่มสูง–ต่ำ (D)","mcq"],distractor:["1.4 วิเคราะห์ตัวลวง","mcq"],
 kr20:["1.5 ความสอดคล้องภายใน KR-20","mcq"],
 cohen:["2.1 Cohen's Kappa","kappa"],linear:["2.2 Weighted Kappa (Linear)","kappa"],
 quadratic:["2.3 Weighted Kappa (Quadratic)","kappa"],
 "one-t":["3.1 One-Sample t-test เทียบเกณฑ์","one"],
 "one-w":["3.2 Wilcoxon Signed-Rank เทียบเกณฑ์","one"],
 "paired-t":["3.3 Paired t-test ก่อน–หลัง","paired"],
 "paired-w":["3.4 Wilcoxon Signed-Rank ก่อน–หลัง","paired"],
 binomial:["3.5 Exact Binomial Test","binomial"],
 hybrid:["4.1 Rubric · Hybrid Rule","hybrid"],
 kpa:["4.2 หลักฐาน Stackable KPA · 12 ชั่วโมง","kpa"],
 project:["4.3 หลักฐานโครงงาน · 4 ชั่วโมง","project"]
};
const keys=Object.keys(names),fmt=(v,d=3)=>Number.isFinite(v)?v.toFixed(d):"N/A";
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const sd=a=>a.length<2?NaN:Math.sqrt(a.reduce((s,v)=>s+(v-mean(a))**2,0)/(a.length-1));
const pct=(v,n)=>fmt(100*v/n,1)+"%";
const pText=p=>!Number.isFinite(p)?"N/A":p<.001?"< .001":"= "+p.toFixed(3).replace(/^0/,"");
const pCell=p=>!Number.isFinite(p)?"N/A":p<.001?"< .001":p.toFixed(3).replace(/^0/,"");
const nval=id=>{const v=$(id).value;if(v.trim()===""||!Number.isFinite(Number(v)))throw Error("กรุณากรอกค่าตัวเลข "+id+" ให้ถูกต้อง");return Number(v)};
const ints=(id)=>{$(id).value.split("\n");};
const csv=(id,numCols)=>{const lines=$(id).value.trim().split(/\r?\n/).filter(Boolean).map(line=>line.split(",").map(v=>v.trim()));
 if(lines.length<2||lines.some(row=>row.length!==numCols))throw Error("ข้อมูล "+id+" ต้องมีหัวตารางและ "+numCols+" คอลัมน์ครบทุกแถว");
 return {heads:lines[0],rows:lines.slice(1).map(row=>row.map(x=>{if(x==="")throw Error("ห้ามมีคะแนนว่าง");const v=Number(x);if(!Number.isFinite(v))throw Error("คะแนนต้องเป็นตัวเลข");return v}))};
};
const numbers=id=>{const raw=$(id).value.trim();if(!raw)throw Error("กรุณากรอกคะแนน");const items=raw.split(/[\s,;]+/);const a=items.map(Number);
 if(a.some(v=>!Number.isFinite(v)))throw Error("คะแนนต้องเป็นตัวเลขทุกค่า");return a};
const ci=(mu,spread,n)=>{if(!Number.isFinite(mu)||!Number.isFinite(spread)||n<2)return "N/A";
 let lo=0,hi=18;for(let i=0;i<65;i++){const t=(lo+hi)/2;if(S.tP(t,n-1,"greater")>.025)lo=t;else hi=t}
 const delta=(lo+hi)/2*spread/Math.sqrt(n);return "["+fmt(mu-delta,2)+", "+fmt(mu+delta,2)+"]"};
const cards=items=>items;
const table=(stat,title,h,r,note,interpret)=>R.table(keys.indexOf(stat)+1,title,h,r,note,interpret);
let stat="difficulty",ready=false;
function mcqData(){
 const data=R.analyzeMCQ($("c-mcq").value,$("c-key").value);
 const raw=$("c-mcq").value.trim().split(/\r?\n/).slice(1).map(x=>x.split(",").map(y=>y.trim().toUpperCase()));
 const scores=raw.map(row=>row.map((answer,j)=>Number(answer===data.keys[j])));
 const totals=scores.map(row=>row.reduce((x,y)=>x+y,0));
 const rank=totals.map((score,i)=>({score,i})).sort((a,b)=>b.score-a.score||a.i-b.i);
 const grp=Math.max(1,Math.floor(data.n*.27)),hi=rank.slice(0,grp).map(v=>v.i),lo=rank.slice(-grp).map(v=>v.i);
 return {...data,raw,scores,totals,grp,hi,lo};
}
function result(stat){
 if(["difficulty","corrected","discrimination","distractor","kr20"].includes(stat)){
  const d=mcqData(),items=d.items,labels=d.labels,k=d.k,n=d.n;
  if(stat==="difficulty"){
   const pa=mean(items.map(x=>x.p));
   return {cards:cards([["ข้อสอบ",k,"ข้อ"],["ผู้เรียน",n,"คน"],["p เฉลี่ย",fmt(pa),"สัดส่วนตอบถูก"]]),
    apa:table(stat,"ความยากของข้อสอบปรนัยรายข้อ",["ข้อ","เฉลย","ความยาก p","ตอบถูก (%)"],
      items.map((x,j)=>[labels[j],d.keys[j],fmt(x.p),pct(x.p,1)]),"p = สัดส่วนตอบถูกในแต่ละข้อ มิใช่ p-value",
      "จากผู้เรียน "+n+" คน ข้อสอบ "+k+" ข้อ มีค่าเฉลี่ยความยาก p = "+fmt(pa)+" ค่ารายข้ออยู่ในตารางและต้องตีความตามเนื้อหาวิชา")};
  }
  if(stat==="corrected"){
   const valid=items.filter(x=>Number.isFinite(x.corrected));
   return {cards:[["ข้อสอบ",k,"ข้อ"],["ค่า r เฉลี่ย",valid.length?fmt(mean(valid.map(x=>x.corrected))):"N/A","เฉพาะข้อที่คำนวณได้"],["r นิยามไม่ได้",k-valid.length,"ข้อ"]],
    apa:table(stat,"Corrected item–total correlation รายข้อ",["ข้อ","Corrected r","หมายเหตุ"],
      items.map((x,j)=>[labels[j],fmt(x.corrected),Number.isFinite(x.corrected)?x.corrected<0?"ติดลบ":"ไม่ติดลบ":"ความแปรปรวนเป็นศูนย์"]),
      "r เป็นสหสัมพันธ์คะแนนข้อกับคะแนนรวมที่ตัดข้อนั้นออก; N/A เมื่อไม่มีความแปรปรวน",
      "พบความสัมพันธ์รายข้อที่คำนวณได้ "+valid.length+" จาก "+k+" ข้อ ค่าติดลบควรตรวจเนื้อหา เฉลย และการกระจายคะแนน ไม่ควรใช้ตัดสินจากค่านี้เพียงอย่างเดียว")};
  }
  if(stat==="discrimination"){
   return {cards:[["กลุ่มสูง",d.grp,"คน"],["กลุ่มต่ำ",d.grp,"คน"],["D เฉลี่ย",fmt(mean(items.map(x=>x.discrimination))),"สัดส่วนต่าง"]],
    apa:table(stat,"อำนาจจำแนกข้อสอบจากกลุ่มสูง–ต่ำ",["ข้อ","D","ผลต่าง (จุดร้อยละ)"],
      items.map((x,j)=>[labels[j],fmt(x.discrimination),fmt(x.discrimination*100,1)]),
      "จัดกลุ่มสูงและต่ำกลุ่มละ floor(0.27n) = "+d.grp+" คน; คะแนนเสมอใช้ลำดับแถวช่วยแบ่งกลุ่ม",
      "ค่า D เฉลี่ยเท่ากับ "+fmt(mean(items.map(x=>x.discrimination)))+". ค่าติดลบอาจสะท้อนความไม่สอดคล้องของข้อสอบ จึงต้องวิเคราะห์ข้อและเนื้อหาร่วมด้วย")};
  }
  if(stat==="distractor"){
   const rows=labels.flatMap((label,j)=>[...new Set(["A","B","C","D",...d.raw.map(v=>v[j])])].sort().map(opt=>{
    const count=d.raw.filter(r=>r[j]===opt).length;
    return [label,opt,opt===d.keys[j]?"เฉลย":"ตัวลวง",count,pct(count,n),d.hi.filter(i=>d.raw[i][j]===opt).length,d.lo.filter(i=>d.raw[i][j]===opt).length];
   }));
   const zero=rows.filter(x=>x[2]==="ตัวลวง"&&x[3]===0).length;
   return {cards:[["ข้อสอบ",k,"ข้อ"],["ผู้เรียน",n,"คน"],["ตัวลวงไม่มีผู้เลือก",zero,"ตัวเลือก"]],
    apa:table(stat,"จำนวนผู้เลือกคำตอบและตัวลวงของข้อสอบ",["ข้อ","ตัวเลือก","ประเภท","n","ร้อยละ","กลุ่มสูง n","กลุ่มต่ำ n"],rows,
      "ตัวลวงคือคำตอบที่ไม่ใช่เฉลย; สูง/ต่ำกลุ่มละ "+d.grp+" คน; รวมผู้ตอบทุกคน = "+n,
      "พบตัวลวงที่ไม่มีผู้เลือก "+zero+" ตัวเลือก ข้อมูลการตอบจำแนกกลุ่มสูง/ต่ำช่วยตรวจคุณภาพตัวลวง แต่ควรใช้หลักฐานเนื้อหาประกอบ")};
  }
  const variance=d.totals.reduce((a,v)=>a+(v-d.avg)**2,0)/n;
  return {cards:[["KR-20",fmt(d.kr,4),"ความสอดคล้องภายใน"],["ข้อสอบ",k,"ข้อ"],["ผู้เรียน",n,"คน"]],
   apa:table(stat,"ความสอดคล้องภายในของข้อสอบตามสูตร KR-20",["ผู้เรียน (n)","ข้อ (k)","M","Var","KR-20"],
     [[n,k,fmt(d.avg,2),fmt(variance,3),fmt(d.kr,4)]],
     "คะแนนข้อถูก = 1 ผิด = 0; ใช้ความแปรปรวนคะแนนรวมแบบตัวหาร n; N/A เมื่อไม่มีความแปรปรวน",
     "ข้อสอบ "+k+" ข้อ มีค่าเฉลี่ยรวม "+fmt(d.avg,2)+" คะแนนและ KR-20 = "+fmt(d.kr,4)+" ซึ่งสะท้อนความสอดคล้องภายใน ไม่ใช่ความตรงเชิงเนื้อหา")};
 }
 if(["cohen","linear","quadratic"].includes(stat)){
  const cross=csv("c-kappa",4).rows;
  if(cross.length!==4)throw Error("ตาราง Kappa ต้องมีคะแนน 4 แถว (ไม่รวมแถวหัวตาราง)");
  const z=RR.analyzeMatrix(cross),kind=stat==="cohen"?"unweighted":stat;
  const x=z.methods[kind],ci=z.bootstrap.methods[kind],label=names[stat][0],confidence=ci.low===null?"N/A":"["+fmt(ci.low)+", "+fmt(ci.high)+"]";
  return {cards:[[label,fmt(x.kappa),"κ ที่ปรับจากความเห็นตรงกันโดยบังเอิญ"],["จำนวนคู่คะแนน",z.n,"คู่"],["95% CI",confidence,"Paired percentile bootstrap"]],
   apa:table(stat,"ผล"+label+" ระหว่างผู้ประเมินสองคน",["จำนวนคู่ (n)","Pₒ","Pₑ","κ","95% CI"],
     [[z.n,fmt(x.po),fmt(x.pe),fmt(x.kappa),confidence]],
     "κ = (Pₒ−Pₑ)/(1−Pₑ); "+(kind==="unweighted"?"ไม่ถ่วงน้ำหนัก":kind==="linear"?"น้ำหนัก 1−|i−j|/3":"น้ำหนัก 1−((i−j)/3)²")+"; Bootstrap 1,500 ครั้ง; ตารางไขว้ 4 ระดับจากข้อมูลปัจจุบัน",
     "ผู้ประเมินให้คะแนน "+z.n+" คู่ ได้ "+label+" = "+fmt(x.kappa)+" (95% CI "+confidence+") ความหมายต้องพิจารณาการกระจายคะแนนและความกว้างช่วงความเชื่อมั่นประกอบ")};
 }
 if(stat==="one-t"||stat==="one-w"){
  const values=numbers("c-one"),target=nval("c-target");
  if(values.length<2)throw Error("ต้องมีคะแนนอย่างน้อย 2 ค่า");
  if(stat==="one-t"){
   const test=O.paired(values.map(()=>target),values),diff=values.map(v=>v-target),p=S.tP(test.t,test.df,"greater");
   return {cards:[["ค่าเฉลี่ยคะแนน",fmt(mean(values),2),"คะแนน"],["t",fmt(test.t,3),"df = "+test.df],["p-value",pText(p),"ทางเดียว H₁: M > μ₀"]],
    apa:table(stat,"One-Sample t-test เทียบค่าเป้าหมาย",["n","M","SD","μ₀","t(df)","95% CI ของ M−μ₀","p (ทางเดียว)"],
      [[values.length,fmt(mean(values),2),fmt(sd(values),2),fmt(target,2),fmt(test.t,3)+" ("+test.df+")",ci(test.mean,test.sd,test.n),pCell(p)]],
      "สมมติฐาน H₁: M > μ₀; CI 95% แบบสองทางสำหรับ M−μ₀; ต้องตรวจการแจกแจงและ outliers",
      "ผู้เรียน "+values.length+" คน มีค่าเฉลี่ย "+fmt(mean(values),2)+" เทียบเกณฑ์ "+fmt(target,2)+" ได้ t("+test.df+") = "+fmt(test.t,3)+", p "+pText(p)+"; ช่วงความเชื่อมั่นของผลต่างเฉลี่ย "+ci(test.mean,test.sd,test.n))};
  }
  const x=O.oneSampleAlternative(values,target,"greater");
  return {cards:[["W⁺",fmt(x.wPlus,1),"ผลรวมอันดับบวก"],["คู่ไม่เป็นศูนย์",x.wilcoxonN,"คน"],["Exact p",pText(x.wilcoxonP),"H₁: สูงกว่าเกณฑ์"]],
   apa:table(stat,"Wilcoxon Signed-Rank Test แบบเทียบกับเกณฑ์",["จำนวนทั้งหมด","ไม่เป็นศูนย์","W⁺","W⁻","p (exact)"],
     [[x.n,x.wilcoxonN,fmt(x.wPlus,1),fmt(x.wMinus,1),pCell(x.wilcoxonP)]],
     "ผลต่าง = คะแนน−"+fmt(target,2)+"; ตัดผลต่างศูนย์; exact sign-permutation; สมมติฐานทางเลือก H₁: สูงกว่าเกณฑ์; ตรวจความสมมาตรของผลต่าง",
     "ข้อมูล "+x.n+" คน ใช้ผลต่างที่ไม่เป็นศูนย์ "+x.wilcoxonN+" คู่ ได้ W⁺ = "+fmt(x.wPlus,1)+" และ exact p "+pText(x.wilcoxonP)+". ไม่ใช่การทดสอบค่าเฉลี่ย")};
 }
 if(stat==="paired-t"||stat==="paired-w"){
  const pre=numbers("c-pre"),post=numbers("c-post");
  if(pre.length!==post.length||pre.length<2)throw Error("คะแนนก่อน–หลังต้องมีจำนวนคู่เท่ากันอย่างน้อย 2");
  if(stat==="paired-t"){
   const test=O.paired(pre,post);
   return {cards:[["M ผลต่าง",fmt(test.mean,2),"หลัง−ก่อน"],["t",fmt(test.t,3),"df = "+test.df],["p-value",pText(test.p),"สองทาง"]],
    apa:table(stat,"ผล Paired-Samples t-test ก่อนเรียน–หลังเรียน",["n","M ก่อน","M หลัง","M ผลต่าง","SD ผลต่าง","t(df)","95% CI ผลต่าง","p"],
     [[pre.length,fmt(mean(pre),2),fmt(mean(post),2),fmt(test.mean,2),fmt(test.sd,2),fmt(test.t,3)+" ("+test.df+")",ci(test.mean,test.sd,test.n),pCell(test.p)]],
     "กำหนดผลต่าง = หลัง−ก่อน; t-test แบบสองทาง; CI 95% แบบสองทางสำหรับค่าเฉลี่ยผลต่าง",
     "คะแนนก่อน–หลัง "+pre.length+" คู่ มีผลต่างเฉลี่ย "+fmt(test.mean,2)+" คะแนน ได้ t("+test.df+") = "+fmt(test.t,3)+", p "+pText(test.p)+" และ 95% CI "+ci(test.mean,test.sd,test.n))};
  }
  const x=O.wilcoxon(pre,post);
  return {cards:[["W⁺",fmt(x.wPlus,1),"อันดับผลต่างบวก"],["W⁻",fmt(x.wMinus,1),"อันดับผลต่างลบ"],["p-value",pText(x.p),"Exact สองทาง"]],
   apa:table(stat,"ผล Wilcoxon Signed-Rank Test แบบจับคู่ก่อน–หลัง",["จำนวนคู่ทั้งหมด","ไม่เป็นศูนย์","W⁺","W⁻","p (exact)"],
     [[pre.length,x.n,fmt(x.wPlus,1),fmt(x.wMinus,1),pCell(x.p)]],
     "ผลต่าง = หลัง−ก่อน; ตัดผลต่างศูนย์ด้วย Wilcox method; จัดอันดับเฉลี่ยเมื่อผูกอันดับ; exact sign-permutation สองทาง",
     "การทดสอบคะแนนจับคู่ "+pre.length+" คน พบผลต่างไม่เป็นศูนย์ "+x.n+" คู่ ค่า W⁺ = "+fmt(x.wPlus,1)+", W⁻ = "+fmt(x.wMinus,1)+", p "+pText(x.p)+" ไม่ได้ทดสอบความต่างของค่าเฉลี่ยโดยตรง")};
 }
 if(stat==="binomial"){
  const n=nval("c-n"),k=nval("c-k"),p0=nval("c-p0"),alpha=nval("c-alpha");
  if(!Number.isSafeInteger(n)||n<1||n>200||!Number.isSafeInteger(k)||k<0||k>n||p0<0||p0>1||alpha<=0||alpha>=1)
    throw Error("ตรวจสอบ n, k, p₀ และ α ให้ถูกต้อง");
  const p=O.binomial(n,k,p0);
  return {cards:[["จำนวนผู้ผ่าน",k+"/"+n,pct(k,n)],["Exact p-value",pText(p),"H₁: p > p₀"],["ผลตัดสิน",p<alpha?"มีนัยสำคัญ":"ไม่มีนัยสำคัญ","ที่ α = "+alpha]],
   apa:table(stat,"ผลการทดสอบ Exact Binomial เทียบสัดส่วนอ้างอิง",["n","ผู้ผ่าน (k)","Observed p","H₀: p₀","Exact p","α"],
     [[n,k,fmt(k/n),fmt(p0),pCell(p),fmt(alpha,3)]],
     "Exact Binomial ทางเดียว H₁: p > p₀; ผลเป็นสองกลุ่ม (ผ่าน/ไม่ผ่าน); การสังเกตต้องเป็นอิสระ",
     "ผู้ผ่านเกณฑ์ "+k+" จาก "+n+" คน ("+pct(k,n)+") เทียบสัดส่วนเป้าหมาย "+pct(p0*100,100)+" ได้ exact p "+pText(p)+" จึง"+(p<alpha?"ปฏิเสธ":"ไม่ปฏิเสธ")+" H₀ ที่ α = "+alpha)};
 }
 if(stat==="hybrid"){
  const data=csv("c-rubric",5);const rows=data.rows,z=C.evaluate(rows);
  return {cards:[["นักเรียน",z.n,"คน"],["เงื่อนไขที่ผ่าน",z.passedConditions+"/15","ทั้งหมด"],["Hybrid Rule",z.passed?"ผ่าน":"ยังไม่ผ่าน","ทุกเกณฑ์ต้องผ่าน 3 เงื่อนไข"]],
   apa:table(stat,"การประเมินสมรรถนะตาม Hybrid Rule จากรูบริก 5 เกณฑ์",
     ["เกณฑ์","≥2 (80%)","≥3 (50%)","=4 (20%)","M ระดับ"],
     z.criteria.map((v,j)=>[data.heads[j],...v.reached.map((n,i)=>n+"/"+z.n+(v.passed[i]?" ผ่าน":" ไม่ผ่าน")),fmt(v.mean,2)]),
     "จำนวนขั้นต่ำคือ "+z.thresholds.join(", ")+" คนในแต่ละเกณฑ์; เกณฑ์ Hybrid Rule เป็นกฎที่ผู้วิจัยกำหนด ไม่ใช่การทดสอบสมมติฐาน",
     "จากนักเรียน "+z.n+" คน ผ่าน "+z.passedConditions+" ใน 15 เงื่อนไข จึง"+(z.passed?"ผ่านครบ":"ยังไม่ผ่านครบ")+" Hybrid Rule ตามเกณฑ์ที่ผู้วิจัยกำหนด")};
 }
 if(stat==="kpa"){
  const data=csv("c-kpa",36),z=KPA.analyze(data.rows);
  return {cards:[["นักเรียน",z.n,"คน"],["Knowledge (K)",fmt(z.overall.K,1)+"%","เฉลี่ยรวม"],["Practice (P)",fmt(z.overall.P,1)+"%","เฉลี่ยรวม"],["Attitude (A)",fmt(z.overall.A,1)+"%","เฉลี่ยรวม"]],
   apa:table(stat,"ค่าเฉลี่ยหลักฐาน Stackable KPA รายชั่วโมง 1–12",["ชั่วโมง","K (%)","P (%)","A (%)"],
     z.hours.map(v=>[v.hour,fmt(v.K,1),fmt(v.P,1),fmt(v.A,1)]),
     "ค่าเฉลี่ยร้อยละของหลักฐาน K/P/A ตามข้อมูล "+z.n+" คน; ไม่ใช่การทดสอบนัยสำคัญหรือผล Rubric",
     "ข้อมูลหลักฐาน "+z.n+" คน พบค่าเฉลี่ยรวม K = "+fmt(z.overall.K,1)+"%, P = "+fmt(z.overall.P,1)+"%, A = "+fmt(z.overall.A,1)+"%. การเปรียบเทียบข้ามชั่วโมงต้องตรวจความเทียบเคียงของภาระงาน")};
 }
 const data=csv("c-project",4);
 if(data.rows.some(row=>row.some(v=>v<0||v>100)))throw Error("คะแนนโครงงานต้องอยู่ในช่วง 0–100");
 const rows=[0,1,2,3].map(h=>[h+13,data.rows.length,fmt(mean(data.rows.map(row=>row[h])),2)]);
 const initial=mean(data.rows.map(row=>row[0])),final=mean(data.rows.map(row=>row[3]));
 return {cards:[["นักเรียน",data.rows.length,"คน"],["ชั่วโมง 13",fmt(initial,1)+"%","ค่าเฉลี่ย"],["ชั่วโมง 16",fmt(final,1)+"%","ค่าเฉลี่ย"]],
  apa:table(stat,"ผลหลักฐานโครงงานรายบุคคล ชั่วโมง 13–16",["ชั่วโมง","ผู้เรียน (n)","M หลักฐาน (%)"],rows,
   "ผลเป็นร้อยละเชิงพรรณนา; ห้ามถือว่าเป็นผลการประเมินรูบริกหรือการทดสอบนัยสำคัญโดยอัตโนมัติ",
   "จากข้อมูลโครงงาน "+data.rows.length+" คน พบค่าเฉลี่ยหลักฐานชั่วโมงที่ 13 เท่ากับ "+fmt(initial,2)+"% และชั่วโมงที่ 16 เท่ากับ "+fmt(final,2)+"% ต้องตรวจความเทียบเคียงของภาระงานก่อนตีความแนวโน้ม")};
}
function createDemo(){
 const key=["A","B","C","D","A"],mcq=["Q1,Q2,Q3,Q4,Q5"];
 for(let i=0;i<23;i++)mcq.push(key.map((v,j)=>(i*7+j*11)%23<(18-j*2)?v:["A","B","C","D"][(i+j+1)%4]).join(","));
 $("c-mcq").value=mcq.join("\n");$("c-key").value=key.join(",");
 $("c-kappa").value="1,2,3,4\n4,1,0,0\n1,5,1,0\n0,1,5,1\n0,0,1,3"; // first row: column names
 $("c-one").value=Array.from({length:23},(_,i)=>String(10+(i*7)%9)).join("\n");$("c-target").value="12";
 $("c-pre").value=Array.from({length:23},(_,i)=>String(8+i%7)).join("\n");
 $("c-post").value=Array.from({length:23},(_,i)=>String(10+i%7+(i%5===0?0:1))).join("\n");
 $("c-n").value="23";$("c-k").value="19";$("c-p0").value=".7";$("c-alpha").value=".05";
 const rub=["C1,C2,C3,C4,C5"];for(let i=0;i<23;i++)rub.push(Array.from({length:5},(_,j)=>String(1+((i*3+j*7+i*j)%4))).join(","));
 $("c-rubric").value=rub.join("\n");
 const kpa=[Array.from({length:12},(_,h)=>["K","P","A"].map(v=>v+(h+1))).flat().join(",")];
 for(let i=0;i<23;i++)kpa.push(Array.from({length:36},(_,j)=>String(Math.min(100,Math.round(46+Math.floor(j/3)*2.2+(j%3)*3+(i*7+j*3)%19)))).join(","));
 $("c-kpa").value=kpa.join("\n");
 const project=["H13,H14,H15,H16"];for(let i=0;i<23;i++)project.push(Array.from({length:4},(_,h)=>String(Math.min(100,58+h*5+(i*7+h*3)%21))).join(","));
 $("c-project").value=project.join("\n");
}
function report(){
 try{
  const x=result(stat);ready=true;
  $("c-title").textContent="ผลการวิเคราะห์ · "+names[stat][0];
  $("c-description").textContent="รายงานเฉพาะค่าสถิติที่เลือก ด้านล่างเป็นตาราง APA 7 และคำบรรยายผลจากข้อมูลปัจจุบันโดยตรง";
  $("c-error").hidden=true;$("c-results").hidden=false;
  $("c-cards").innerHTML=x.cards.map(([title,value,note])=>'<div class="result-card"><small>'+escapeHTML(title)+'</small><strong>'+escapeHTML(value)+'</strong><div class="caption">'+escapeHTML(note)+'</div></div>').join("");
  $("c-figure").hidden=true;
  $("c-apa").innerHTML=x.apa;
  $("c-source").textContent="คำนวณข้อมูลปัจจุบันของ "+names[stat][0]+" แล้ว";
 }catch(e){
  ready=false;$("c-error").textContent=e.message;$("c-error").hidden=false;
  $("c-results").hidden=true;$("c-source").textContent="ตรวจสอบข้อมูล: "+e.message;
 }
}
function escapeHTML(t){return String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function select(which,updateURL=true){
 if(!names[which])which="difficulty";stat=which;
 document.querySelectorAll("#chapter-stat-menu [data-stat]").forEach(button=>button.setAttribute("aria-current",String(button.dataset.stat===stat)));
 document.querySelectorAll(".chapter-input-section").forEach(section=>section.hidden=section.dataset.source!==names[stat][1]);
 $("chapter-input-desc").textContent="กลุ่มข้อมูลสำหรับ "+names[stat][0]+" · การเปลี่ยนค่าไม่ส่งผลต่อชุดข้อมูลของสถิติอื่น";
 if(updateURL&&window.history?.replaceState)window.history.replaceState(null,"",window.location.pathname+"?stat="+encodeURIComponent(which));
 report();
}
createDemo();
document.querySelectorAll("#chapter-stat-menu [data-stat]").forEach(button=>button.onclick=()=>select(button.dataset.stat));
$("c-run").onclick=report;
$("c-reset").onclick=()=>{
 const current=names[stat][1],saved={};
 for(const section of document.querySelectorAll(".chapter-input-section"))
  if(section.dataset.source!==current)for(const field of section.querySelectorAll("textarea,input"))saved[field.id]=field.value;
 createDemo();
 for(const [id,value] of Object.entries(saved))$(id).value=value;
 report();
};
document.querySelectorAll(".chapter-input-section textarea, .chapter-input-section input").forEach(field=>field.addEventListener("input",()=>{
 ready=false;$("c-results").hidden=true;$("c-source").textContent="ข้อมูลเปลี่ยนแล้ว กรุณากดสร้างรายงานใหม่";
}));
$("c-copy").onclick=async()=>{if(!ready)return;try{await navigator.clipboard.writeText($("c-apa").innerText);$("c-copy-status").textContent="คัดลอกตารางและคำบรรยายเฉพาะ "+names[stat][0]+" แล้ว"}catch(e){$("c-copy-status").textContent="กรุณาเลือกข้อความแล้วคัดลอกด้วยตนเอง"}};
$("c-download").onclick=()=>{if(!ready)return;
 const content=names[stat][0]+"\n\n"+$("c-apa").innerText+"\n\nOpen Research Statistics Lab · ข้อมูลจำลองหรือข้อมูลที่กรอก";
 const blob=new Blob([content],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="chapter4-"+stat+"-apa.txt";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
select(new URLSearchParams(window.location.search).get("stat"),false);
})();