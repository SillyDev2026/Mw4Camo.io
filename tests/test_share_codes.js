'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {TextEncoder,TextDecoder} = require('node:util');
const root = path.resolve(__dirname,'..');
const context = vm.createContext({
  window:{},
  TextEncoder,
  TextDecoder,
  URL,
  btoa:text => Buffer.from(text,'binary').toString('base64'),
  atob:text => Buffer.from(text,'base64').toString('binary')
});
for(const name of ['data/weapons.js','data/attachments.js','share-codes.js']){
  vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name});
}
const share = context.window.MW4_SHARE;
const catalog = context.window.MW4_ATTACHMENTS;
const spec = catalog.specs.m4;
const options = catalog.items.filter(item => item.weapons.includes('m4'));
const slots = Object.create(null);
for(const item of options){if(!slots[item.type]&&Object.keys(slots).length<4)slots[item.type]=item.name;}
assert.equal(Object.keys(slots).length,4,'Fixture must cover four attachment types');
const build = {weapon:'m4',mode:'MW4',goal:'Balanced',apex:false,slots};
function mustReject(name,fn){assert.throws(fn,undefined,name);}
const code = share.encode(build);
assert.match(code,/^MW4C1-[0-9A-F]{8}-[A-Za-z0-9_-]+$/);
const decoded = share.decode(code);
assert.deepEqual(JSON.parse(JSON.stringify(decoded.slots)),JSON.parse(JSON.stringify(share.normalize(build).slots)));
assert.equal(share.encode({...build,slots:Object.fromEntries(Object.entries(slots).reverse())}),code,'Canonical attachment order');
assert.notEqual(share.encode({...build,goal:'Stealth'}),code,'Goal changes website share code');
assert.notEqual(share.encode({...build,mode:'Warzone'}),code,'Mode changes website share code');
assert.equal(share.extract(code),code);
assert.equal(share.extract('https://mw4camo.example/?share='+encodeURIComponent(code)+'#/loadouts'),code);
assert.equal(share.fingerprint({...build,goal:'Stealth',mode:'Warzone'}),share.fingerprint(build),'Game attachment fingerprint ignores editorial goal');
assert.ok(share.gameCodeLooksPlausible('A03-B176X-GJUQ1-1'));
assert.ok(share.gameCodeLooksPlausible('S03-694TN-2MJ11'));
assert.ok(!share.gameCodeLooksPlausible('MW4C1-AAA-BBB'));
mustReject('Unknown weapon',()=>share.encode({...build,weapon:'made-up'}));
mustReject('Unknown attachment',()=>share.encode({...build,slots:{Optic:'Invented attachment'}}));
mustReject('Blank attachment',()=>share.encode({...build,slots:{Optic:''}}));
mustReject('Too many types',()=>share.encode({...build,slots:{Optic:'a',Muzzle:'b',Barrel:'c',Underbarrel:'d',Magazine:'e',Stock:'f'}}));
mustReject('Bad mode',()=>share.encode({...build,mode:'Unknown'}));
mustReject('Bad Apex',()=>share.encode({...build,apex:'yes'}));
const blocked = spec.blocked.find(type=>options.some(item=>item.type===type));
assert.ok(blocked,'Fixture needs blocked Apex category');
mustReject('Apex conflict',()=>share.encode({...build,apex:true,slots:{[blocked]:options.find(item=>item.type===blocked).name}}));
mustReject('Wrong checksum',()=>share.decode(code.replace(/^MW4C1-[A-F0-9]{8}-/,'MW4C1-00000000-')));
mustReject('Wrong namespace',()=>share.decode(code.replace(/^MW4C1/,'MW4')));
mustReject('Truncated code',()=>share.decode(code.slice(0,-8)));
assert.equal(typeof share.encode,'function');
for(const name of ['index.html','app.js','service-worker.js']){
  assert.ok(fs.readFileSync(path.join(root,name),'utf8').length>0,name+' should exist');
}
assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/share-codes\.js/);
assert.match(fs.readFileSync(path.join(root,'service-worker.js'),'utf8'),/share-codes\.js/);
new vm.Script(fs.readFileSync(path.join(root,'app.js'),'utf8'),{filename:'app.js'});
console.log('MW4Camo share-code tests passed: strict encode/decode, links, fingerprints, game-code separation, source validation, and syntax.');
