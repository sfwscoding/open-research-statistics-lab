"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const html=fs.readFileSync("index.html","utf8");
for(const file of ["outcomes.js","competency.js","kpa.js","evidence.js"])assert.ok(html.includes('<script src="'+file+'"></script>\n<script'),"Missing properly separated script: "+file);
assert.match(html,/Paired t-test/);
assert.match(html,/Paired Samples t-test/);
assert.match(html,/Soft|--lav/);
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];scripts.forEach((m,i)=>new vm.Script(m[1],{filename:"inline-"+i}));
console.log("UI smoke tests passed");
