"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const html=fs.readFileSync("lab03.html","utf8");
const js=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const ext=fs.readFileSync("stat-extensions.js","utf8");
function run(search){
 const els={},tabs={test:[],mode:[]};
 const get=id=>els[id]||(els[id]={id,value:"",innerHTML:"",textContent:"",style:{},classList:{toggle(){},add(){},remove(){}},addEventListener(){}});
 for(const m of html.matchAll(/<(input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>/gi)){
  const el=get(m[2]);el.value=(m[0].match(/\bvalue="([^"]*)"/)||[])[1]??el.value;
  if(m[1]==="select"){const o=html.slice(m.index+m[0].length).match(/<option[^>]*value="([^"]+)"/);if(o)el.value=o[1]}
 }
 for(const m of html.matchAll(/<button\b[^>]*data-(test|mode)="([^"]+)"[^>]*>/g)){
  const b={dataset:{[m[1]]:m[2]},classList:{toggle(){}},onclick:null,click(){this.onclick?.()}};
  tabs[m[1]].push(b);
 }
 const document={
  getElementById:get,
  querySelectorAll(selector){return selector==="[data-test]"?tabs.test:selector==="[data-mode]"?tabs.mode:[]},
  querySelector(selector){const m=selector.match(/^\[data-test="([^"]+)"\]$/);return m?tabs.test.find(b=>b.dataset.test===m[1]):null}
 };
 const ctx={document,location:{search},URLSearchParams};
 ctx.window=ctx;
 vm.createContext(ctx);
 vm.runInContext(ext,ctx,{filename:"stat-extensions.js"});
 vm.runInContext(js,ctx,{filename:"lab03-inline.js"});
 return {get,tabs};
}
for(const link of ["?test=wilcoxon-criterion","?test=wilcoxon"]){
 const x=run(link);
 assert.match(x.get("chartTitle").textContent,/3\.1\.2.*Wilcoxon/);
 assert.doesNotMatch(x.get("chartTitle").textContent,/Binomial/);
 assert.match(x.get("apa").innerHTML,/W⁺/);
 assert.match(x.get("apa").innerHTML,/W⁻/);
 assert.match(x.get("apa").innerHTML,/p<\/th>/);
 const raw=x.tabs.mode.find(t=>t.dataset.mode==="raw");
 raw.click();x.get("raw").value="6,8,9,10,12";x.get("rawTarget").value="7";
 x.get("recalc").onclick();
 assert.match(x.get("apa").innerHTML,/3\.1\.2.*Wilcoxon/);
 assert.match(x.get("apa").innerHTML,/เทียบค่าเกณฑ์ 7/);
 assert.doesNotMatch(x.get("apa").innerHTML,/Binomial/);
}
const bin=run("?test=binomial");assert.match(bin.get("chartTitle").textContent,/Exact Binomial/);
const t=run("?test=ttest");assert.match(t.get("chartTitle").textContent,/One-Sample t/);
console.log("Lab 03 routing: 3.1.2 correctly opens criterion Wilcoxon, not Binomial (simulation and raw modes).");
