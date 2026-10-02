import test from 'node:test';
import assert from 'node:assert/strict';
import { initialQuotes, calculateQuotes, quoteCsv } from '../src/quote-model.js';
test('missing interface costs stay out of the complete-price ranking', () => {
  const result=calculateQuotes(initialQuotes); assert.equal(result.rows[0].total,15.8); assert.equal(result.rows[2].total,null); assert.deepEqual(result.winners,['B']);
});
test('an edited fee changes the total and ranking',()=> {
  const result=calculateQuotes(initialQuotes.map(row=>row.id==='C'?{...row,extra:'0.5'}:row)); assert.equal(result.rows[2].total,10); assert.deepEqual(result.winners,['C']);
});
test('invalid and empty inputs are never represented as complete',()=> {
  assert.equal(calculateQuotes([{id:'A',base:'',extra:'0'}]).rows[0].complete,false);
  assert.equal(calculateQuotes([{id:'A',base:'-1',extra:'0'}]).rows[0].invalid,true);
  assert.equal(calculateQuotes([{id:'A',base:'999999',extra:'0'}]).lowest,null);
});
test('equal totals retain all lowest quotes and CSV matches current input',()=> {
  const rows=initialQuotes.map(row=>row.id==='A'?{...row,extra:'1.4'}:row); assert.deepEqual(calculateQuotes(rows).winners,['A','B']); assert.match(quoteCsv(rows),/A,8.8,1.4,10.2/); assert.match(quoteCsv(rows),/C,9.5,,,费用待补齐/);
});
test('boundary values preserve zero and the maximum complete total',()=> {
  const result=calculateQuotes([{id:'A',base:'0',extra:'0'},{id:'B',base:'10000',extra:'10000'}]);
  assert.equal(result.rows[0].total,0);
  assert.equal(result.rows[1].total,20000);
  assert.deepEqual(result.winners,['A']);
  assert.match(quoteCsv([{id:'B',base:'10000',extra:'10000'}]),/B,10000,10000,20000,费用已完整/);
});
