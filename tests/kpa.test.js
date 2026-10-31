"use strict";
const assert=require("node:assert/strict");
const {KPATracker}=require("../kpa.js");
let rows=[Array(36).fill(60),Array(36).fill(80)],r=KPATracker.analyze(rows);
assert.equal(r.n,2);assert.equal(r.hours.length,12);assert.equal(r.hours[0].K,70);assert.equal(r.overall.P,70);
assert.throws(()=>KPATracker.analyze([Array(35).fill(50)]));
assert.throws(()=>KPATracker.analyze([Array(36).fill(101)]));
assert.throws(()=>KPATracker.analyze([Array(36).fill(NaN)]));
console.log("KPA 12-hour evidence tests passed");
