"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),vm=require("node:vm");
const html=fs.readFileSync("lab04.html","utf8");
for(const id of ["linechart","student","hour","editStudent","editDim","editHour","editValue","save","rubricBody","rubStudent","rubCriterion","rubLevel","saveRub","reset"])assert.ok(html.includes('id="'+id+'"'),"Missing control "+id);
assert.match(html,/Hybrid Rule/);assert.match(html,/makeData/);assert.match(html,/drawKPA/);
const js=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.equal(js.length,1);new vm.Script(js[0][1]);
console.log("Lab 04 dashboard structure and JavaScript syntax passed");