// Reference calculations for MCQ statistics; run: node tests/mcq.test.js
"use strict";
const assert=require("node:assert/strict");
function analyze(rows,key){
const n=rows.length,k=key.length,score=rows.map(r=>r.map((x,j)=>+(x===key[j]))),total=score.map(r=>r.reduce((a,b)=>a+b,0));
const variance=x=>{let m=x.reduce((a,b)=>a+b,0)/x.length;return x.reduce((a,b)=>a+(b-m)**2,0)/x.length};
const corr=(x,y)=>{let mx=x.reduce((a,b)=>a+b,0)/x.length,my=y.reduce((a,b)=>a+b,0)/y.length,a=0,b=0,c=0;for(let i=0;i<x.length;i++){let dx=x[i]-mx,dy=y[i]-my;a+=dx*dy;b+=dx*dx;c+=dy*dy}return b&&c?a/Math.sqrt(b*c):null};
let pq=0;let items=key.map((_,j)=>{let x=score.map(r=>r[j]),p=x.reduce((a,b)=>a+b,0)/n;pq+=p*(1-p);return {p,corrected:corr(x,total.map((t,i)=>t-x[i]))}});
return {items,kr20:variance(total)?k/(k-1)*(1-pq/variance(total)):null};
}
function near(actual,expected){assert.ok(Math.abs(actual-expected)<1e-10,`expected ${expected}, got ${actual}`)}
// All students identical: undefined corrected r and KR-20.
let x=analyze([["A","B"],["A","B"],["A","B"]],["A","B"]);
near(x.items[0].p,1);assert.equal(x.items[0].corrected,null);assert.equal(x.kr20,null);
// Perfectly parallel items: KR-20=1 and corrected r=1.
x=analyze([["A","B"],["A","B"],["X","Y"],["X","Y"]],["A","B"]);
near(x.kr20,1);near(x.items[0].corrected,1);near(x.items[1].p,.5);
// Two perfectly anticorrelated items: constant total => undefined KR-20; corrected r=-1.
x=analyze([["A","Y"],["X","B"],["A","Y"],["X","B"]],["A","B"]);
assert.equal(x.kr20,null);near(x.items[0].corrected,-1);
// Independent balanced 2-item patterns: corrected r=0, KR-20=0.
x=analyze([["A","B"],["A","Y"],["X","B"],["X","Y"]],["A","B"]);
near(x.kr20,0);near(x.items[0].corrected,0);
console.log("MCQ reference tests: 4 cases passed");
