"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const pages=["index.html","lab01.html","lab02.html","lab03.html","lab04.html","lab05.html"];
const theme=fs.readFileSync("kpa-window-theme.css","utf8");
const behavior=fs.readFileSync("kpa-window-theme.js","utf8");
assert.match(theme,/--bg:#eaf1ff/);
assert.match(theme,/--card:#ffffff/);
assert.match(theme,/--ink:#0f1b3d/);
assert.match(theme,/--k:#1e4fd6/);
assert.match(theme,/--p:#16a34a/);
assert.match(theme,/--a:#f58220/);
assert.match(theme,/:root\[data-theme="dark"\]/);
assert.match(theme,/@media\s*\(prefers-color-scheme:dark\)/);
assert.match(theme,/\.research-apa thead/);
assert.match(theme,/\.research-apa tbody/);
assert.equal((theme.match(/\{/g)||[]).length,(theme.match(/\}/g)||[]).length);
for(const file of pages){
 const html=fs.readFileSync(file,"utf8");
 assert.match(html,/kpa-window-theme\.css\?v=\d+\w*/);
 assert.match(html,/kpa-window-theme\.js\?v=\d+\w*/);
 assert.match(html,/fonts\.googleapis\.com\/css2\?family=Prompt/);
 assert.ok(html.lastIndexOf("kpa-window-theme.css")<html.indexOf("</head>"));
 assert.ok(html.indexOf("kpa-window-theme.js")>html.indexOf("shared-nav.js"));
 if(html.includes("semantic-theme.css"))
  assert.ok(html.indexOf("kpa-window-theme.css")>html.indexOf("semantic-theme.css"));
}
const KEY="open-research-statistics-lab-theme-v1";
function simulate(saved){
 const attrs={},store={};if(saved)store[KEY]=saved;
 const buttons=[];
 const nav={
  children:[],
  querySelectorAll(q){return q===".theme-control button"?buttons:[]},
  appendChild(node){this.children.push(node);buttons.push(...node.children)}
 };
 const root={
  setAttribute(k,v){attrs[k]=v},
  removeAttribute(k){delete attrs[k]}
 };
 const document={
  documentElement:root,
  querySelector(q){return q===".unified-nav"?nav:null},
  createElement(tag){
   return {
    tag,dataset:{},children:[],
    setAttribute(k,v){this[k]=v},
    addEventListener(k,fn){this[k]=fn},
    appendChild(el){this.children.push(el)}
   };
  }
 };
 const localStorage={getItem(k){return store[k]||null},setItem(k,v){store[k]=v}};
 vm.runInNewContext(behavior,{document,localStorage});
 return {attrs,store,buttons};
}
const clean=simulate(null);
assert.equal(clean.buttons.length,3);
assert.equal(clean.buttons.find(b=>b.dataset.theme==="system")["aria-pressed"],"true");
clean.buttons.find(b=>b.dataset.theme==="dark").click();
assert.equal(clean.attrs["data-theme"],"dark");
assert.equal(clean.store[KEY],"dark");
clean.buttons.find(b=>b.dataset.theme==="light").click();
assert.equal(clean.attrs["data-theme"],"light");
clean.buttons.find(b=>b.dataset.theme==="system").click();
assert.equal(clean.attrs["data-theme"],undefined);
const saved=simulate("dark");
assert.equal(saved.attrs["data-theme"],"dark");
assert.equal(saved.buttons.find(b=>b.dataset.theme==="dark")["aria-pressed"],"true");
console.log("KPA reference theme: six pages, color tokens, dark/light/system preference and APA table rules passed");
