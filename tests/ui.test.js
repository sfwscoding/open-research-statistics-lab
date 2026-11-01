"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const index=fs.readFileSync("index.html","utf8"),nav=fs.readFileSync("shared-nav.js","utf8");
assert.match(index,/Open Research Statistics Lab/);
for(let i=1;i<=5;i++){
 const path="lab0"+i+".html",html=fs.readFileSync(path,"utf8");
 assert.ok(index.includes('href="'+path+'"'),"missing homepage link "+path);
 assert.match(html,/shared-nav\.js/);
 const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 inline.forEach((x,j)=>new vm.Script(x[1],{filename:path+"-inline"+j}));
 const required={
  1:["lab01-app.js",'id="stat-menu"'],
  2:["lab02-app.js",'id="lab02-stat-menu"'],
  3:['function selectTest(requested)','id="apa"'],
  4:["lab04-views.js",'id="lab04-stat-menu"'],
  5:["chapter4-single.js",'id="chapter-stat-menu"']
 }[i];
 required.forEach(s=>assert.ok(html.includes(s),path+" missing "+s));
}
for(const link of [
 "lab01.html?stat=difficulty","lab01.html?stat=kr20",
 "lab02.html?stat=unweighted","lab02.html?stat=linear","lab02.html?stat=quadratic",
 "lab03.html?test=wilcoxon-criterion","lab03.html?test=binomial",
 "lab04.html?stat=kpa","lab04.html?stat=project",
 "lab05.html?stat=one-w","lab05.html?stat=project"])
 assert.ok(nav.includes(link),"Missing menu deep link: "+link);
new vm.Script(nav,{filename:"shared-nav.js"});
console.log("Homepage, 5 isolated Lab menus and JavaScript syntax: passed");
