/* Chapter 4 Builder — recomputes APA tables from edited inputs, no hard-coded findings. */
(function(g){"use strict";
const R=g.ResearchReports;
function init(body){
 body.innerHTML='<p>สร้างรายงานบทที่ 4 จากข้อมูลที่แก้ไขได้ ตัวอย่างเริ่มต้นเป็น <strong>ข้อมูลจำลอง</strong> ทุกครั้งที่กดสร้างรายงานจะคำนวณใหม่ภายในเบราว์เซอร์</p>'+
 '<section class="research-section"><h3>1. คุณภาพข้อสอบ MCQ</h3><label for="r-mcq">คำตอบรายคน CSV (แถวแรกเป็นชื่อข้อ)</label><textarea id="r-mcq" rows="6"></textarea><label for="r-key">เฉลยคั่นด้วยจุลภาค</label><input id="r-key" value="A,B,C,D,A"></section>'+
 '<section class="research-section"><h3>2. Cohen / Weighted Kappa</h3><label for="r-kappa">ตารางไขว้ 4 × 4 (จำนวนครั้งต่อช่อง ไม่มีหัวตาราง)</label><textarea id="r-kappa" rows="4"></textarea></section>'+
 '<section class="research-section"><h3>3. การเรียนรู้ก่อน–หลัง และ Exact Binomial</h3><div class="research-inputs"><div><label for="r-pre">คะแนนก่อนเรียนตามลำดับนักเรียน</label><textarea id="r-pre"></textarea></div><div><label for="r-post">คะแนนหลังเรียนตามลำดับนักเรียนเดียวกัน</label><textarea id="r-post"></textarea></div></div><div class="research-inputs"><div><label for="r-n">จำนวนนักเรียน n</label><input id="r-n" type="number" min="1" max="200" value="23"></div><div><label for="r-k">จำนวนผู้ผ่านเกณฑ์ k</label><input id="r-k" type="number" min="0" value="19"></div><div><label for="r-p0">เป้าหมาย p₀ (0–1)</label><input id="r-p0" type="number" min="0" max="1" step=".01" value=".70"></div><div><label for="r-alpha">α</label><input id="r-alpha" type="number" min=".001" max=".5" step=".001" value=".05"></div></div></section>'+
 '<section class="research-section"><h3>4. Rubric 5 เกณฑ์ · Hybrid Rule</h3><label for="r-rubric">ระดับ 1–4: 5 คอลัมน์ / นักเรียนหนึ่งคนต่อแถว พร้อมหัวตาราง</label><textarea id="r-rubric" rows="6"></textarea></section>'+
 '<section class="research-section"><h3>5. หลักฐาน KPA 12 ชั่วโมง</h3><label for="r-kpa">CSV 36 คอลัมน์ K1,P1,A1,...,K12,P12,A12 ร้อยละ 0–100</label><textarea id="r-kpa" rows="6"></textarea><p class="research-note">ข้อมูล KPA รายชั่วโมงเป็นหลักฐานระหว่างเรียน ไม่ใช่คะแนนสมรรถนะ Rubric และยังไม่มีคะแนนโครงงานจริง 4 ชั่วโมง</p></section>'+
 '<div class="research-actions"><button id="r-build" class="btn">คำนวณและสร้างรายงานใหม่</button><button id="r-copy" class="btn" type="button">คัดลอกรายงานและตาราง</button></div><p id="r-message" class="research-note" role="status" aria-live="polite"></p><div id="research-output"></div>';
 const $=id=>document.getElementById(id),f=R.f,mean=R.mean,parse=R.csv,num=R.numeric;
 const mcq=["Q1,Q2,Q3,Q4,Q5"],keys=["A","B","C","D","A"];
 for(let i=0;i<23;i++)mcq.push(keys.map((v,j)=>((i*7+j*11)%23<(18-j*2))?v:["A","B","C","D"][(i+j+1)%4]).join(","));
 $("r-mcq").value=mcq.join("\n");
 $("r-kappa").value="4,1,0,0\n1,5,1,0\n0,1,5,1\n0,0,1,3";
 $("r-pre").value=Array.from({length:23},(_,i)=>String(8+i%7)).join("\n");
 $("r-post").value=Array.from({length:23},(_,i)=>String(10+i%7+(i%5===0?0:1))).join("\n");
 const rub=["C1,C2,C3,C4,C5"];for(let i=0;i<23;i++)rub.push(Array.from({length:5},(_,j)=>String(1+((i*3+j*7+i*j)%4))).join(","));$("r-rubric").value=rub.join("\n");
 const header=Array.from({length:12},(_,h)=>["K","P","A"].map(d=>d+(h+1))).flat(),kpa=[header.join(",")];
 for(let i=0;i<23;i++)kpa.push(Array.from({length:36},(_,j)=>Math.min(100,Math.max(0,Math.round(46+Math.floor(j/3)*2.2+(j%3)*3+(i*7+j*3)%19)))).join(","));$("r-kpa").value=kpa.join("\n");
 const numbers=s=>s.trim().split(/[\s,;]+/).filter(Boolean).map(num);
 const calc=()=>{try{
 const x=R.analyzeMCQ($("r-mcq").value,$("r-key").value);
 const matrix=parse($("r-kappa").value).map(row=>row.map(num)),kap=R.analyzeKappa(matrix);
 const pre=numbers($("r-pre").value),post=numbers($("r-post").value);
 if(pre.length<2||pre.length!==post.length)throw Error("คะแนนก่อน–หลังต้องจับคู่เท่ากันอย่างน้อย 2 คน");
 const t=g.Outcomes.paired(pre,post),w=g.Outcomes.wilcoxon(pre,post),diff=post.map((v,i)=>v-pre[i]);
 const n=num($("r-n").value),k=num($("r-k").value),p0=num($("r-p0").value),alpha=num($("r-alpha").value);
 if(!Number.isSafeInteger(n)||n<1||n>200||!Number.isSafeInteger(k)||k<0||k>n||p0<0||p0>1||alpha<=0||alpha>=1)throw Error("ค่า n, k, p₀ หรือ α ไม่อยู่ในช่วงที่กำหนด");
 const bin=g.Outcomes.binomial(n,k,p0);
 const rubric=parse($("r-rubric").value);if(rubric.length<2||rubric.some(row=>row.length!==5))throw Error("Rubric ต้องมีหัวตาราง 5 เกณฑ์และข้อมูลอย่างน้อยหนึ่งคน");
 const rubrows=rubric.slice(1).map(row=>row.map(num));
 const kpaRows=parse($("r-kpa").value);if(kpaRows.length<2||kpaRows.some(row=>row.length!==36))throw Error("KPA ต้องมี 36 คอลัมน์และข้อมูลอย่างน้อยหนึ่งคน");
 const kp=g.KPATracker.analyze(kpaRows.slice(1).map(row=>row.map(num)));
 const sd=diff.length>1?Math.sqrt(diff.reduce((s,v)=>s+(v-mean(diff))**2,0)/(diff.length-1)):NaN;
 const pLabel=p=>p<.001?"< .001":"= "+p.toFixed(3);
 const tText="ข้อมูลจับคู่ "+pre.length+" คน พบค่าเฉลี่ยผลต่าง (หลัง−ก่อน) = "+f(t.mean)+" คะแนน, t("+t.df+") = "+f(t.t)+", p "+pLabel(t.p)+", Cohen's dz = "+f(t.dz)+". Wilcoxon signed-rank: W⁺ = "+f(w.wPlus,1)+", W⁻ = "+f(w.wMinus,1)+", p "+pLabel(w.p)+". ควรตรวจข้อสมมติของแต่ละการทดสอบก่อนใช้รายงานผลจริง";
 let html='<h3>บทที่ 4 · ตารางและคำบรรยายที่คำนวณจากข้อมูลล่าสุด</h3><p class="research-note">ข้อมูลเริ่มต้นเป็นข้อมูลจำลอง; ไม่ควรคัดลอกเป็นผลวิจัยจริงจนกว่าจะป้อนข้อมูลจริงและตรวจทานกับซอฟต์แวร์อิสระ</p>';
 html+=R.mcq(x.n,x.k,x.avg,x.kr,x.items,x.labels,x.keys);
 html+=R.kappa(matrix).replace("ตารางที่ 1","ตารางที่ 2");
 html+=R.table(3,"ผลการเปรียบเทียบคะแนนก่อนและหลังเรียน",["n","M ก่อน","M หลัง","M ผลต่าง","SD ผลต่าง","t(df)","p (t)","W⁺","p (Wilcoxon)"],[[pre.length,f(mean(pre),2),f(mean(post),2),f(t.mean,2),f(sd,2),f(t.t)+" ("+t.df+")",f(t.p,4),f(w.wPlus,1),f(w.p,4)]],"Paired t แบบสองทาง; Wilcoxon เป็น exact sign-permutation แบบสองทางสำหรับคู่ที่ผลต่างไม่เป็นศูนย์; ไม่ได้ทดสอบสมมติฐานเดียวกัน",tText);
 html+=R.table(4,"ผลการทดสอบ Exact Binomial เทียบสัดส่วนเป้าหมาย",["n","ผ่าน (k)","สัดส่วน","p₀","p (exact)","α"],[[n,k,f(k/n),f(p0),f(bin,4),f(alpha,3)]],"สมมติฐานทางเลือก H₁: p > p₀; เป็นการทดสอบทางเดียว; ต้องตรวจความเป็นอิสระของข้อมูล","พบผู้ผ่านเกณฑ์ "+k+" จาก "+n+" คน ("+f(k/n*100,1)+"%) เทียบกับสัดส่วนอ้างอิง "+f(p0*100,1)+"% ได้ exact p "+pLabel(bin)+" จึง"+(bin<alpha?"ปฏิเสธ":"ไม่ปฏิเสธ")+" H₀ เมื่อ α = "+alpha);
 html+=R.hybrid(rubrows,rubric[0],5);
 html+=R.table(6,"หลักฐาน KPA รายชั่วโมงระหว่างการจัดการเรียนรู้",["ชั่วโมง","K (%)","P (%)","A (%)"],kp.hours.map(row=>[row.hour,f(row.K,1),f(row.P,1),f(row.A,1)]),"จำนวนผู้เรียน = "+kp.n+"; ค่าร้อยละเป็นการบรรยายหลักฐาน KPA ไม่ใช่การทดสอบนัยสำคัญ","ค่าเฉลี่ยหลักฐานรวมคือ K = "+f(kp.overall.K,1)+"%, P = "+f(kp.overall.P,1)+"% และ A = "+f(kp.overall.A,1)+"%. การเพิ่มขึ้นรายชั่วโมงต้องพิจารณาความเทียบเคียงของ Micro Task ก่อนตีความความก้าวหน้า");
 html+='<p class="research-note">ส่วนโครงงาน 4 ชั่วโมง (ชั่วโมง 13–16) และช่วงความเชื่อมั่นของ Kappa ยังไม่ถูกรายงานในตารางนี้ เพราะไม่มีข้อมูลผลโครงงานหรือวิธีประมาณ CI ที่ผ่านการตรวจสอบในระบบนี้</p>';
 $("research-output").innerHTML=html;$("r-message").textContent="สร้างรายงานใหม่แล้ว: ตารางที่ 1–6 (ข้อมูลที่กรอกปัจจุบัน)";
 }catch(err){$("research-output").innerHTML="";$("r-message").textContent="ตรวจสอบข้อมูล: "+err.message}};
 $("r-build").onclick=calc;
 $("r-copy").onclick=()=>{const text=$("research-output").innerText;if(!text){$("r-message").textContent="กรุณาสร้างรายงานก่อนคัดลอก";return}if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>$("r-message").textContent="คัดลอกรายงานแล้ว").catch(()=>$("r-message").textContent="ไม่สามารถคัดลอกอัตโนมัติ");else $("r-message").textContent="กรุณาเลือกข้อความและคัดลอกด้วยตนเอง"};
 calc();
}
g.ResearchChapter4={init};
})(window);
