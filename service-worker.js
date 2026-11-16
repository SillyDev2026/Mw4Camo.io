/* MW4Camo v2.0.0: bounded offline shell; live publisher snapshots bypass cache. */
const CACHE = 'mw4camo-v2.3.0-offline';
const ASSETS = ['./','./index.html','./styles.css','./ui-v2.css','./ui-v3.css','./ui-v4.css','./ui-v5.css','./ui-v6.css','./ui-v7.css','./ui-v8.css','./ui-v9.css','./ui-v10.css','./share-codes.js','./app.js','./refresh-settings.js','./feed-guard.js','./ui-experience.js','./data/intel-v15.js','./data/weapons.js','./data/patches.js','./data/attachments.js','./data/attachment-expansion.js','./data/update-status.js','./manifest.webmanifest','./assets/favicon.svg'];
const STATIC_PATHS = new Set(ASSETS.map(path=>new URL(path,self.registration.scope).pathname));
const SCOPE_PATH = new URL('./',self.registration.scope).pathname;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('mw4camo-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const requestUrl = new URL(event.request.url);
  if(requestUrl.origin!==self.location.origin)return;
  if(requestUrl.searchParams.has('_fresh')){event.respondWith(fetch(event.request));return;}
  const navigation=event.request.mode==='navigate';
  const inShell=STATIC_PATHS.has(requestUrl.pathname);
  if(!inShell)return;
  if(requestUrl.search && !navigation)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok && response.type!=='opaque' && !requestUrl.search){
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{}));
    }
    return response;
  }).catch(()=>caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||(navigation&&requestUrl.pathname===SCOPE_PATH?caches.match('./index.html'):Response.error()))));
});
