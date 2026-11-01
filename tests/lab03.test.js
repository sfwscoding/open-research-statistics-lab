"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const html=fs.readFileSync("lab03.html","utf8");
const nav=fs.readFileSync("shared-nav.js","utf8");
for(const id of ["modes","simulationInputs","rawInputs","chart","stats","apa","alternative","alpha","rawTarget"])
 assert.ok(html.includes('id="'+id+'"'),"Missing Lab 03 input or output "+id);
assert.doesNotMatch(html,/id="tests"/);
assert.doesNotMatch(html,/data-test="/);
assert.doesNotMatch(html,/เลือกสถิติที่ต้องการศึกษา/);
assert.match(html,/function selectTest\(requested\)/);
for(const [id,title] of [
 ["ttest","One-Sample t"],["wilcoxon-criterion","Wilcoxon"],
 ["paired","Paired t"],["wilcoxon-paired","Wilcoxon"],["binomial","Binomial"]])
 assert.ok(nav.includes("lab03.html?test="+id),"Global menu missing "+id);
assert.match(html,/data-mode="simulation"/);
assert.match(html,/data-mode="raw"/);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length,1);
new vm.Script(scripts[0][1]);
console.log("Lab 03 uses only top navigation; simulation/raw and APA outputs remain available");
