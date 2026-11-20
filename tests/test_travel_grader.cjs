const assert=require('node:assert/strict');
const {grade}=require('../shared/travel-grader-core.js');

const basic={duration:90,width:1920,height:1080,size:20_000_000,motion:25,goodLight:1};
const full=grade(basic);
assert.equal(full.score,100);
assert.equal(full.passed,true);
assert.equal(full.categories.reduce((n,c)=>n+c.max,0),100);
assert.equal(grade({...basic,duration:70,motion:0,goodLight:0}).passed,false);
const at85=grade({...basic,motion:6,goodLight:.7});
assert.equal(at85.score,85);
assert.equal(at85.passed,true);
const at84=grade({...basic,duration:86,motion:12,goodLight:.7,size:180_000_000});
assert.equal(at84.score,84);
assert.equal(at84.passed,false);
assert.equal(grade({...basic,motion:null,goodLight:null}).categories.find(c=>c.key==='motion').score,0);
assert.throws(()=>grade({...basic,duration:0}));
console.log('travel grader tests passed: 84/85 boundary, 100 max, missing frames, invalid video');
