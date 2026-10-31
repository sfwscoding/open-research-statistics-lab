"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const index=fs.readFileSync("index.html","utf8");
assert.match(index,/Open Research Statistics Lab/);
assert.match(index,/shared-nav\.js/);
for(let i=1;i<=5;i++){
 const name="lab0"+i+".html";
 assert.match(index,new RegExp('href="'+name+'"'),"Homepage must link to "+name);
 const html=fs.readFileSync(name,"utf8");
 assert.match(html,/shared-nav\.js/,"Missing shared navigation in "+name);
 const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 for(const [j,script] of inline.entries())new vm.Script(script[1],{filename:name+"-inline-"+j});
 if(i===2){
   for(const asset of ["rubric-reliability.js","lab02-app.js","lab02.css","research-reporting.css"])
     assert.ok(html.includes(asset),"Lab 02 missing "+asset);
   assert.match(html,/id="csv-data"/);
   assert.match(html,/id="matrix-panel"/);
   assert.match(html,/id="apa-output"/);
 }else assert.ok(inline.length>0,"Expected inline controller in "+name);
}
console.log("Five-Lab portal, shared navigation, current JavaScript syntax and Lab 02 controls: passed.");
