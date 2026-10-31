"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const html=fs.readFileSync("lab04.html","utf8"),src=fs.readFileSync("lab04-views.js","utf8");
assert.match(html,/id="lab04-stat-menu"/);
assert.match(html,/project-tracking\.js/);
assert.match(html,/lab04-views\.js/);
new vm.Script(src,{filename:"lab04-views.js"});
const panels={},nodes={},maps={
 kpaSection:"kpa",hourStats:"kpa",microSection:"micro",hourBars:"micro",
 rubricSection:"hybrid",rubricBody:"hybrid",projectSection:"project",
 save:"editKpa",saveRub:"editRubric",sideK:"overview",
 conditionCount:"hybridSummary",interpret:"hybridInterpret"
};
function panel(name){
 return panels[name]||(panels[name]={name,hidden:false,
  appendChild(child){child.parentPanel=name},
  insertAdjacentElement(where,child){child.near=name}
 });
}
function make(initial=""){
 let name=initial;
 const e={value:"",textContent:"",hidden:false,style:{},className:"",
  classList:{add(){},remove(){},toggle(){}},
  addEventListener(event,fn){this["on"+event]=fn},
  setAttribute(key,value){this[key]=value},
  closest(sel){return sel===".panel"?panel(maps[this.id]||"other"):panel("table-"+this.id)},
  insertAdjacentElement(where,other){other.near=this.id},
  append(){}};
 Object.defineProperty(e,"id",{get(){return name},set(v){name=v;nodes[v]=e}});
 Object.defineProperty(e,"innerHTML",{get(){return e.html||""},set(v){
  e.html=String(v);
  for(const m of e.html.matchAll(/id="([^"]+)"/g))get(m[1]);
 }});
 if(initial)nodes[initial]=e;
 return e;
}
function get(id){return nodes[id]||make(id)}
["lab04-stat-menu","apaKpa","apaRubric","apaProject","apaResults","hour","editHour",
 "hourStats","hourBars","rubricBody","pj-summary","sideK","conditionCount","interpret",
 "kpaSection","microSection","rubricSection","projectSection","save","saveRub"]
 .forEach(get);
get("hour").value="12";get("apaKpa").innerHTML="ตารางที่ 1";get("apaRubric").innerHTML="ตารางที่ 2";get("apaProject").innerHTML="ตารางที่ 3";
const buttons=["kpa","micro","hybrid","project"].map(stat=>({
 dataset:{stat},setAttribute(key,val){this[key]=val},addEventListener(event,fn){this["on"+event]=fn}
}));
const doc={getElementById:get,querySelector(q){return q===".layout > main.stack"?panel("main"):null},
 querySelectorAll(q){return q==="#lab04-stat-menu [data-stat]"?buttons:[]},
 createElement(){return make()}};
const win={location:{pathname:"/lab04.html",search:"?stat=micro",hash:""},history:{replaceState(){}}};
const hourly=()=>Array.from({length:12},(_,i)=>({K:40+i,P:45+i,A:50+i}));
const rows=()=>Array(23).fill(null),apaTable=(i,name)=>"ตารางที่ "+i+" "+name;
let drawn=0;const drawKPA=()=>drawn++;
new Function("document","window","navigator","URLSearchParams","hourly","rows","apaTable","drawKPA",src)(
 doc,win,{clipboard:{writeText:async()=>{}}},URLSearchParams,hourly,rows,apaTable,drawKPA
);
assert.equal(buttons.find(b=>b["aria-current"]==="true").dataset.stat,"micro");
assert.match(get("apaMicro").innerHTML,/ตารางที่ 2/);
assert.equal(panel("project").parentPanel,"main");
assert.equal(get("apaResults").hidden,true);
for(const button of buttons){
 button.onclick();
 assert.deepEqual(["kpa","micro","hybrid","project"].filter(k=>!panels[k].hidden),[button.dataset.stat]);
}
buttons.find(b=>b.dataset.stat==="micro").onclick();
get("microHour").value="6";get("microHour").oninput();
assert.equal(get("hour").value,"6");
assert.equal(get("editHour").value,"6");
assert.equal(get("microHourText").textContent,"6");
assert.match(get("apaMicro").innerHTML,/ชั่วโมงที่ 6/);
console.log("Lab 04 isolated routes, per-topic APA and independent Micro Task hour selector passed");
