'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','service-worker.js'),'utf8');
const handlers={};const writes=[];
const scope='https://example.test/project/';
const cache={addAll:async()=>{},put:async(req)=>{writes.push(req.url);}};
const self={location:{origin:'https://example.test'},registration:{scope},addEventListener:(key,fn)=>handlers[key]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
const caches={open:async()=>cache,keys:async()=>[],delete:async()=>true,match:async()=>null};
const result={ok:true,type:'basic',clone(){return this;}};
let network=0;
vm.runInNewContext(source,{self,caches,URL,Set,fetch:async()=>{network++;return result;},Response:{error:()=>({offline:true})}});
assert.match(source,/mw4camo-v2\.2\.0/);
assert.match(source,/ui-v10\.css/);
function request(url,{mode='same-origin',method='GET'}={}){
  let response;const tasks=[];
  const event={request:{url,mode,method},respondWith:p=>response=p,waitUntil:p=>tasks.push(Promise.resolve(p))};
  handlers.fetch(event);return {response,tasks};
}
(async()=>{
  let x=request('https://unrelated.test/file.js');assert.equal(x.response,undefined);
  x=request(scope+'unknown.json');assert.equal(x.response,undefined);
  x=request(scope+'app.js',{method:'POST'});assert.equal(x.response,undefined);
  x=request(scope+'data/patches.json?_fresh=999');assert.ok(x.response);await x.response;assert.equal(writes.length,0,'live snapshot is never cached');
  x=request(scope+'app.js');await x.response;await Promise.all(x.tasks);assert.equal(writes.length,1,'known shell script may be cached');
  x=request(scope+'app.js?cachebust=1');assert.equal(x.response,undefined,'arbitrary query URLs do not expand cache');
  x=request(scope+'?share=MW4C2-EXAMPLE',{mode:'navigate'});assert.ok(x.response,'offline share link navigation remains intercepted');await x.response;await Promise.all(x.tasks);
  assert.equal(writes.length,1,'share URL never creates a new cache entry');
  assert.equal(network,3);
  console.log('Service worker verified: bounded caching, same-origin guard, fresh publisher bypass and offline share navigation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
