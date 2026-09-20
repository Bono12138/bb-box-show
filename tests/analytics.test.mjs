import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {createStore,normalizeEvent,authorized} from '../server/events.mjs';import {createApp} from '../server/index.mjs';
const event=()=>({id:randomUUID(),session:randomUUID(),event:'page_view',path:'/',source:'unknown'});
test('accepts only the limited event contract',()=>{const paths=new Set(['/']);assert(normalizeEvent(event(),paths));for(const patch of [{email:'private@example.invalid'},{path:'/?contact=private'},{event:'application_success'},{source:'private text'},{session:'fingerprint'}])assert.equal(normalizeEvent({...event(),...patch},paths),null)});
test('requires a management secret and compares exact tokens',()=>{assert(!authorized('Bearer undefined'));assert(!authorized('Bearer test','short'));const secret='a'.repeat(32);assert(authorized('Bearer '+secret,secret));assert(!authorized('Bearer '+secret+'x',secret))});
test('deduplicates, uses Shanghai date, separates sessions, retains only bounded data',()=>{const s=createStore();const e=normalizeEvent(event(),new Set(['/']));const now=Date.parse('2026-09-20T17:00:00Z');assert(s.record(e,now));assert(!s.record(e,now));assert.equal(s.stats(now).daily[0].day,'2026-09-21');assert.equal(s.stats(now).daily[0].count,1);assert.equal(s.stats(now).sessions30d,1);assert.equal(s.stats(now+31*864e5).sessions30d,0);assert.equal(s.stats(now+31*864e5).daily.length,1);assert.equal(s.stats(now+400*864e5).daily.length,0);s.close()});
test('HTTP endpoint enforces auth, origin, privacy and duplicate transport handling',async()=>{const s=createStore();const secret='b'.repeat(32);const app=createApp({store:s,secret,origin:'https://bb.example',enabled:true});await new Promise(r=>app.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${app.address().port}`;try{assert.equal((await fetch(url+'/api/admin/stats')).status,401);assert.equal((await fetch(url+'/api/events',{method:'POST',body:'{}'})).status,403);const body=JSON.stringify(event());const send=()=>fetch(url+'/api/events',{method:'POST',headers:{origin:'https://bb.example','content-type':'application/json'},body});assert.equal((await send()).status,202);await send();const data=await(await fetch(url+'/api/admin/stats',{headers:{authorization:'Bearer '+secret}})).json();assert.equal(data.daily[0].count,1);assert.equal(data.sessions30d,1);assert.equal((await fetch(url+'/api/events',{method:'POST',headers:{origin:'https://bb.example','content-type':'application/json'},body:'x'.repeat(5000)})).status,413)}finally{await new Promise(r=>app.close(r));s.close()}});
test('disabled collection has no start time or accepted events', async () => {
  const store=createStore(); const app=createApp({store,enabled:false});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));
  try {
    const r=await fetch(`http://127.0.0.1:${app.address().port}/api/events`, {method:'POST'});
    assert.equal(r.status,503); assert.equal(store.stats().collectionStartedAt,null); assert.equal(store.stats().daily.length,0);
  } finally {await new Promise(r=>app.close(r));store.close();}
});
test('invalid payloads and robots never create events', async () => {
  const store=createStore();const app=createApp({store,enabled:true,origin:'https://bb.example'});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));
  const url=`http://127.0.0.1:${app.address().port}`;
  const send=(body,headers={})=>fetch(url+'/api/events',{method:'POST',headers:{origin:'https://bb.example','content-type':'application/json',...headers},body});
  try {
    assert(store.stats().collectionStartedAt);
    assert.equal((await send('{')).status,400);
    assert.equal((await send(JSON.stringify({...event(),contact:'private'}))).status,400);
    assert.equal((await send(JSON.stringify({...event(),path:'/admin/'}))).status,400);
    assert.equal((await send('{}',{'content-type':'text/plain'})).status,415);
    assert.equal((await send(JSON.stringify(event()),{'user-agent':'TestBot'})).status,202);
    assert.equal(store.stats().daily.length,0);
    assert.equal((await fetch(url+'/api/unknown')).status,404);
    assert.equal((await fetch(url+'/api/admin/stats',{method:'POST'})).status,405);
    assert.equal((await fetch(url+'/%00')).status,400);
    assert.equal((await fetch(url+'/definitely-missing')).status,404);
  } finally {await new Promise(r=>app.close(r));store.close();}
});
