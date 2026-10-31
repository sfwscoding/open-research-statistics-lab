"use strict";
const assert=require("node:assert/strict"),{oneSample}=require("../outcomes.js");
let r=oneSample([1,2,3,4,5],3);assert.equal(r.n,5);assert.equal(r.mean,3);assert.equal(r.t,0);assert.equal(r.p,1);assert.equal(r.wilcoxonP,1);
r=oneSample([2,3,4,5,6],0);assert.ok(r.t>0);assert.ok(r.p<0.05);assert.equal(r.wilcoxonP,0.0625);
assert.throws(()=>oneSample([1],0));assert.throws(()=>oneSample([1,NaN],0));
console.log("One-sample t and exact signed-rank tests passed");
