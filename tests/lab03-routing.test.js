"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const html=fs.readFileSync("lab03.html","utf8");
const js=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
const ext=fs.readFileSync("stat-extensions.js","utf8");
const nav=fs.readFileSync("shared-nav.js","utf8");
assert.doesNotMatch(html,/id="tests"|data-test="/);
assert.match(nav,/lab03\.html\?test=wilcoxon-criterion/);
function run(search) {
  const els={},modes=[];
  const get=id=>els[id]||(els[id]={
    id,value:"",innerHTML:"",textContent:"",style:{},
    classList:{toggle(){},add(){},remove(){}},addEventListener(){}
  });
  for(const m of html.matchAll(/<(input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>/gi)){
    const el=get(m[2]);
    el.value=(m[0].match(/\bvalue="([^"]*)"/)||[])[1]??el.value;
    if(m[1]==="select"){
      const choice=html.slice(m.index+m[0].length).match(/<option[^>]*value="([^"]+)"/);
      if(choice)el.value=choice[1];
    }
  }
  for(const m of html.matchAll(/<button\b[^>]*data-mode="([^"]+)"[^>]*>/g)){
    const button={dataset:{mode:m[1]},classList:{toggle(){}},onclick:null,click(){this.onclick?.()}};
    modes.push(button);
  }
  const document={
    getElementById:get,
    querySelectorAll(selector){return selector==="[data-mode]"?modes:[]}
  };
  const ctx={document,location:{search},URLSearchParams};ctx.window=ctx;
  vm.createContext(ctx);
  vm.runInContext(ext,ctx,{filename:"stat-extensions.js"});
  vm.runInContext(js,ctx,{filename:"lab03-inline.js"});
  return {get,modes};
}
const checked=[
 ["?test=ttest",/3\.1\.1.*One-Sample t/],
 ["?test=wilcoxon-criterion",/3\.1\.2.*Wilcoxon/],
 ["?test=paired",/3\.2\.1.*Paired t/],
 ["?test=wilcoxon-paired",/3\.2\.2.*Wilcoxon/],
 ["?test=binomial",/3\.3\.1.*Binomial/],
 ["?test=wilcoxon",/3\.1\.2.*Wilcoxon/],
 ["?test=unknown",/3\.1\.1.*One-Sample t/],
 ["",/3\.1\.1.*One-Sample t/]
];
for(const [search,title] of checked){
  const x=run(search);
  assert.match(x.get("chartTitle").textContent,title,search);
  assert.match(x.get("apa").innerHTML,/ตารางที่ 1/);
}
const wilcox=run("?test=wilcoxon-criterion");
assert.doesNotMatch(wilcox.get("chartTitle").textContent,/Binomial/);
assert.match(wilcox.get("apa").innerHTML,/W⁺/);
assert.match(wilcox.get("apa").innerHTML,/W⁻/);
const raw=wilcox.modes.find(button=>button.dataset.mode==="raw");
raw.click();
wilcox.get("raw").value="6,8,9,10,12";
wilcox.get("rawTarget").value="7";
wilcox.get("recalc").onclick();
assert.match(wilcox.get("apa").innerHTML,/เทียบค่าเกณฑ์ 7/);
assert.doesNotMatch(wilcox.get("apa").innerHTML,/Binomial/);
console.log("Lab 03: global navigation supports five statistical tests, legacy Wilcoxon URL and raw-data modes without duplicate menu");
