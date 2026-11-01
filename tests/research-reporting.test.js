"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const ctx={};ctx.window=ctx;
for(const script of ["competency.js","research-reporting.js"])vm.runInNewContext(fs.readFileSync(script,"utf8"),ctx,{filename:script});
const R=ctx.ResearchReports;
const close=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,"expected "+b+" got "+a);
const perfect=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>i===j?5:0));
const k=R.analyzeKappa(perfect);
close(k.unweighted.kappa,1);close(k.linear.kappa,1);close(k.quadratic.kappa,1);
const independent=Array.from({length:4},()=>[1,1,1,1]);
close(R.analyzeKappa(independent).unweighted.kappa,0);
const m=R.analyzeMCQ("Q1,Q2\nA,B\nA,B\nB,B","A,B");
assert.equal(m.n,3);assert.equal(m.k,2);
assert.match(R.mcq(m.n,m.k,m.avg,m.kr,m.items,m.labels,m.keys),/ตารางที่ 1/);
assert.match(R.kappa(perfect),/Weighted/);
const passing=Array.from({length:23},()=>[4,4,4,4,4]);
assert.match(R.hybrid(passing,["C1","C2","C3","C4","C5"]),/ผ่านครบตาม Hybrid Rule/);
assert.match(R.table(1,"Test",["A"],[[2]],"sample note","sample interpretation"),/sample interpretation/);
const spec=[
 ["lab01.html",["lab01-app.js","id=\"stat-menu\"","id=\"mcq-apa\""]],
 ["lab02.html",["lab02-app.js","id=\"lab02-stat-menu\"","id=\"apa-output\""]],
 ["lab03.html",["function selectTest(requested)","id=\"apa\"","wilcoxon-criterion"]],
 ["lab04.html",["lab04-views.js","id=\"lab04-stat-menu\"","id=\"apaKpa\"","id=\"apaRubric\""]],
 ["lab05.html",["chapter4-single.js","id=\"chapter-stat-menu\"","id=\"c-apa\""]]
];
for(const [file,markers] of spec){
 const html=fs.readFileSync(file,"utf8");
 markers.forEach(marker=>assert.ok(html.includes(marker),file+": missing "+marker));
 const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 for(const x of inline)new vm.Script(x[1],{filename:file});
}
for(const path of ["lab01-app.js","lab02-app.js","lab04-views.js","chapter4-single.js","project-tracking.js","rubric-reliability.js"])
 new vm.Script(fs.readFileSync(path,"utf8"),{filename:path});
const lab01=fs.readFileSync("lab01.html","utf8");
const lab02=fs.readFileSync("lab02.html","utf8");
const lab03=fs.readFileSync("lab03.html","utf8");
const lab04=fs.readFileSync("lab04.html","utf8");
const lab05=fs.readFileSync("lab05.html","utf8");
assert.equal((lab01.match(/data-stat="/g)||[]).length,5);
assert.equal((lab02.match(/data-metric="/g)||[]).length,4);
assert.equal((lab03.match(/<button\b[^>]*data-test="/g)||[]).length,0);
assert.equal((lab04.match(/data-stat="/g)||[]).length,4);
assert.equal((lab05.match(/data-stat="/g)||[]).length,16);
assert.doesNotMatch(lab05,/chapter4-builder\.js/);
assert.match(fs.readFileSync("shared-nav.js","utf8"),/lab05\.html\?stat=project/);
console.log("APA calculations and five isolated statistical lab view structures: passed");
