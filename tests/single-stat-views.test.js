"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const read=x=>fs.readFileSync(x,"utf8");
function modules(){
 const w={location:{pathname:"/demo.html",search:""},history:{replaceState(){}}};
 for(const path of ["outcomes.js","stat-extensions.js","competency.js","kpa.js","rubric-reliability.js","research-reporting.js"])
  new Function("window",read(path))(w);
 return w;
}
function fake(html,kind){
 const nodes={},buttons=[...html.matchAll(new RegExp('data-'+(kind==="mcq"?"stat":"stat")+'="([^"]+)"','g'))]
   .map(m=>({dataset:{stat:m[1]},setAttribute(key,value){this[key]=value}}));
 const sections=[...html.matchAll(/<section data-source="([^"]+)"/g)].map(m=>({dataset:{source:m[1]},hidden:false,querySelectorAll(){return []}}));
 function get(id){if(nodes[id])return nodes[id];return nodes[id]={id,value:"",hidden:false,
  textContent:"",innerText:"",innerHTML:"",addEventListener(k,fn){this["on"+k]=fn},setAttribute(k,v){this[k]=v}};}
 for(const m of html.matchAll(/<input\b[^>]*id="([^"]+)"[^>]*>/g))
  get(m[1]).value=(m[0].match(/\bvalue="([^"]+)"/)||[])[1]||"";
 const doc={getElementById:get,querySelectorAll(sel){
  if(kind==="mcq"&&sel==="[data-stat]")return buttons;
  if(kind==="chapter"&&sel==="#chapter-stat-menu [data-stat]")return buttons;
  if(kind==="chapter"&&sel===".chapter-input-section")return sections;
  return [];
 }};
 return {doc,get,buttons,sections};
}
const URLP=URLSearchParams;
{
 const html=read("lab01.html"),app=read("lab01-app.js"),w=modules(),d=fake(html,"mcq");
 w.location={pathname:"/lab01.html",search:"?stat=kr20"};
 new Function("window","document","navigator","history","location","URLSearchParams",app)(
 w,d.doc,{clipboard:{writeText:async()=>{}}},w.history,w.location,URLP);
 assert.match(d.get("metric-title").textContent,/KR-20/);
 assert.equal((d.get("mcq-apa").innerHTML.match(/ตารางที่ \d/g)||[]).length,1);
 for(const b of d.buttons){
  b.onclick();
  assert.equal((d.get("mcq-apa").innerHTML.match(/ตารางที่ \d/g)||[]).length,1,"Lab 01 "+b.dataset.stat);
  assert.equal(d.get("mcq-results").hidden,false);
 }
 assert.equal(d.buttons.length,5);
 d.get("mcq-answers").value="Q1,Q2\nA,B\nA,B\nB,A\nB,B";
 d.get("mcq-key").value="A,B";
 d.get("mcq-run").onclick();
 assert.equal(d.get("mcq-error").hidden,true);
}
{
 const html=read("lab05.html"),app=read("chapter4-single.js"),w=modules(),d=fake(html,"chapter");
 w.location={pathname:"/lab05.html",search:"?stat=one-w"};
 new Function("window","document","navigator","URLSearchParams","Blob","URL","setTimeout",app)(
 w,d.doc,{clipboard:{writeText:async()=>{}}},URLP,()=>{}, {},()=>{});
 assert.match(d.get("c-title").textContent,/Wilcoxon/);
 assert.equal(d.buttons.length,16);
 for(const b of d.buttons){
  b.onclick();
  assert.equal(d.get("c-results").hidden,false,"Lab 05 "+b.dataset.stat+": "+d.get("c-error").textContent);
  assert.equal((d.get("c-apa").innerHTML.match(/ตารางที่ \d/g)||[]).length,1,"Lab 05 "+b.dataset.stat);
  assert.equal(d.sections.filter(s=>!s.hidden).length,1,"Only one input group: "+b.dataset.stat);
 }
 d.buttons.find(x=>x.dataset.stat==="binomial").onclick();
 const first=d.get("c-apa").innerHTML;
 d.get("c-k").value="9";d.get("c-run").onclick();
 assert.notEqual(d.get("c-apa").innerHTML,first,"Binomial should update with new k");
 d.get("c-pre").value="1\n2";
 d.buttons.find(x=>x.dataset.stat==="paired-t").onclick();
 assert.match(d.get("c-error").textContent,/จำนวนคู่เท่ากัน/);
 assert.equal(d.get("c-results").hidden,true);
}
const lab03=read("lab03.html");
assert.equal((lab03.match(/<button\b[^>]*data-test="/g)||[]).length,0);
assert.ok(lab03.indexOf("APA 7 · ตารางและคำบรรยาย")<lab03.indexOf("<h2>หลักการและการตีความ</h2>"));
const lab04=read("lab04.html");
assert.equal((lab04.match(/data-stat="/g)||[]).length,4);
assert.match(lab04,/lab04-views\.js/);
assert.match(read("project-tracking.js"),/host\.insertAdjacentHTML\("beforeend",'<div id="apaProject"/);
console.log("Lab 01 and Lab 05: every statistic isolated with an adjacent APA table; Lab 03 and Lab 04 layout checks passed");
