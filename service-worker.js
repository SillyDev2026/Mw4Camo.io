const CACHE = 'mw4camo-v1.8-ui';
const ASSETS = ['./','./index.html','./styles.css','./ui-v2.css','./ui-v3.css','./ui-v4.css','./ui-v5.css','./ui-v6.css','./ui-v7.css','./ui-v8.css','./ui-v9.css','./share-codes.js','./app.js','./refresh-settings.js','./ui-experience.js','./data/intel-v15.js','./data/weapons.js','./data/patches.js','./data/attachments.js','./data/attachment-expansion.js','./data/update-status.js','./manifest.webmanifest','./assets/favicon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mw4camo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  const requestUrl = new URL(event.request.url);
  if(requestUrl.searchParams.has('_fresh')){event.respondWith(fetch(event.request));return;}
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){let copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}
    return response;
  }).catch(()=>caches.match(event.request).then(hit=>hit||((event.request.mode==='navigate')?caches.match('./index.html'):Response.error()))));
});
