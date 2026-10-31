"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const E = require("../rubric-reliability.js").RubricReliability;
const near = (actual,expected,tol=1e-9) => assert.ok(Math.abs(actual-expected)<tol,
  "Expected "+expected+"; got "+actual);
const perfect = [[5,0,0,0],[0,5,0,0],[0,0,5,0],[0,0,0,5]];
const p = E.statistics(perfect);
assert.equal(p.n,20);near(p.exactPercent,100);
for(const kind of E.MODES)near(p.methods[kind].kappa,1);
const chance = Array.from({length:4},()=>[1,1,1,1]);
const c=E.statistics(chance);
for(const kind of E.MODES)near(c.methods[kind].kappa,0);
assert.equal(E.statistics([[10,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]).methods.quadratic.kappa,null);
const disagreement = E.statistics([[0,0,0,3],[0,0,3,0],[0,3,0,0],[3,0,0,0]]);
assert.ok(disagreement.methods.unweighted.kappa<0);
assert.throws(()=>E.statistics([[1]]),/4 แถว/);
assert.throws(()=>E.statistics([[1,-1,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]),/จำนวนเต็ม/);
const records=E.demoData(23);
const csv=E.toCSV(records);
const parsed=E.readCSV(csv);
assert.equal(parsed.length,23);
assert.equal(parsed[0].id,"S001");
assert.equal(parsed[0].r1.length,5);
assert.equal(parsed[0].r2.length,5);
const data=E.analyzeRecords(parsed,{iterations:300});
assert.equal(data.criteria.length,5);
assert.ok(data.criteria.every(row=>row.n===23));
const intervals=E.bootstrapCI(parsed.map(row=>[row.r1[0],row.r2[0]]),{iterations:300,seed:42});
const intervals2=E.bootstrapCI(parsed.map(row=>[row.r1[0],row.r2[0]]),{iterations:300,seed:42});
assert.deepEqual(intervals,intervals2);
assert.ok(intervals.methods.quadratic.low<=data.criteria[0].methods.quadratic.kappa);
assert.ok(intervals.methods.quadratic.high>=data.criteria[0].methods.quadratic.kappa);
const errorCsv=csv.replace("S002,","S001,");
assert.throws(()=>E.readCSV(errorCsv),/ซ้ำ/);
assert.throws(()=>E.readCSV(csv.replace("r2_c5","r2_x5")) ,/หัวตาราง/);
assert.throws(()=>E.readCSV(csv.replace(/S001,([1-4]),/,"S001,5,")),/1–4/);
assert.throws(()=>E.readCSV(csv.replace(/S001,([1-4]),/,"S001,,")),/1–4/);
const tabbed=csv.replace(/,/g,"\t");
assert.equal(E.readCSV(tabbed).length,23);
const ctx={};ctx.window=ctx;
vm.runInNewContext(fs.readFileSync("research-reporting.js","utf8"),ctx);
for(const row of data.criteria){
 const old=ctx.ResearchReports.analyzeKappa(row.matrix);
 near(row.methods.unweighted.kappa,old.unweighted.kappa);
 near(row.methods.linear.kappa,old.linear.kappa);
 near(row.methods.quadratic.kappa,old.quadratic.kappa);
}
const html=fs.readFileSync("lab02.html","utf8"),app=fs.readFileSync("lab02-app.js","utf8");
const elements={};
function get(id){
 if(elements[id])return elements[id];
 const x={id,value:"",textContent:"",innerText:"",hidden:false,style:{}};
 x.setAttribute=(key,value)=>{x[key]=value};
 x.addEventListener=(event,fn)=>{x["on"+event]=fn};
 Object.defineProperty(x,"innerHTML",{
  get(){return x.html||""},
  set(value){
   x.html=String(value);x.innerText=x.html.replace(/<[^>]+>/g," ");
   for(const match of x.html.matchAll(/<input\b[^>]*id="([^"]+)"[^>]*>/g)){
    const child=get(match[1]);child.value=(match[0].match(/value="([^"]*)"/)||[])[1]||"";
   }
  }
 });
 return elements[id]=x;
}
for(const m of html.matchAll(/\bid="([^"]+)"/g))get(m[1]);
for(const [id,value] of Object.entries({
 weight:"quadratic",criterion:"0","edit-criterion":"0",rater:"r1",level:"1","sample-n":"23"
}))get(id).value=value;
const buttons=[...html.matchAll(/data-metric="([^"]+)"/g)].map(m=>({
 dataset:{metric:m[1]},setAttribute(key,value){this[key]=value}
}));
const dom={getElementById:get,querySelectorAll(q){return q==="[data-metric]"?buttons:[]}};
const navigator={clipboard:{writeText:async()=>{}}};
const loc={pathname:"/lab02.html",search:"?stat=quadratic"};
const hist={replaceState(){}};
new Function("window","document","navigator","history","location","URLSearchParams","Blob","URL","setTimeout",app)(
 {RubricReliability:E,ResearchReports:ctx.ResearchReports,location:loc,history:hist},
 dom,navigator,hist,loc,URLSearchParams,()=>{}, {},()=>{}
);
assert.match(get("analysis-context").textContent,/ข้อมูลรายคน 23 คน/);
assert.equal((get("apa-output").innerHTML.match(/ตารางที่ \d/g)||[]).length,1);
assert.match(get("apa-output").innerHTML,/Quadratic/);
assert.ok(get("kappa-chart").innerHTML.includes("path"));
for(const button of buttons){
 button.onclick();
 const count=(get("apa-output").innerHTML.match(/ตารางที่ \d/g)||[]).length;
 assert.equal(count,button.dataset.metric==="agreement"?2:1,button.dataset.metric);
 const label={unweighted:"Cohen",linear:"Linear",quadratic:"Quadratic",agreement:"Exact Agreement"}[button.dataset.metric];
 assert.ok(get("apa-output").innerHTML.includes(label),"APA belongs to selected method "+label);
}
get("student").value="S001";get("edit-criterion").value="2";get("rater").value="r2";
const original=E.readCSV(get("csv-data").value)[0].r2[2];get("level").value=String(original===4?1:4);
get("apply-edit").onclick();
const changed=E.readCSV(get("csv-data").value)[0].r2[2];assert.notEqual(changed,original);
get("mode-matrix").onclick();
assert.match(get("analysis-context").textContent,/ตารางไขว้/);
assert.equal((get("apa-output").innerHTML.match(/ตารางที่ \d/g)||[]).length,2);
get("m-0-0").value="6";get("matrix-calc").onclick();
assert.match(get("analysis-context").textContent,/25 คู่/);
get("mode-records").onclick();
get("csv-data").value="bad";get("calculate").onclick();
assert.match(get("errors").textContent,/หัวตารางและนักเรียน/);
assert.equal(get("result-body").hidden,true);
assert.match(html,/rubric-reliability.js/);
assert.match(html,/lab02-app.js/);
new vm.Script(app);
console.log("Lab 02: isolated Kappa views, agreement, bootstrap, APA, matrix and editable scoring passed");
