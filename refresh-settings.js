/* Per-device refresh controls. GitHub Actions publishes shared source snapshots independently. */
(() => {
'use strict';
const KEY = 'mw4camo-refresh-interval-v1';
const INTERVALS = [0,5,15,30,60,180,360,720,1440];
const DEFAULT_MINUTES = 60;
const MAX_WAIT = 15000;
const root = document.getElementById('app');
let minutes = readInterval();
let timer = null;
let checking = false;
let lastChecked = 0;
let outcome = 'not-checked';
let detail = 'No browser check yet this visit.';
function readInterval(){
  try {
    const saved = localStorage.getItem(KEY);
    if(saved === null)return DEFAULT_MINUTES;
    const selected = Number(saved);
    return INTERVALS.includes(selected) ? selected : DEFAULT_MINUTES;
  } catch { return DEFAULT_MINUTES; }
}
function readableTime(value){
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : 'Not available';
}
function setText(id,value){
  const node = document.getElementById(id);
  if(node)node.textContent = value;
}
function syncHeader(){
  const status = document.getElementById('refreshStatus');
  if(!status)return;
  const last = window.MW4CamoFeed?.current()?.status?.lastSuccessfulAt;
  const age = Date.now() - Date.parse(last || '');
  const stale = !Number.isFinite(age) || age > 3*3600000;
  status.classList.toggle('stale',stale);
  const label = stale ? 'PATCH FEED STALE' : 'PATCH FEED CURRENT';
  for(const textNode of [...status.childNodes])if(textNode.nodeType === 3)textNode.remove();
  status.append(document.createTextNode(' '+label));
  status.title = 'Last publisher sync: '+readableTime(last)+'; your browser checks: '+(minutes ? 'every '+minutes+' minutes' : 'manual');
}
function updateView(){
  const selected = document.getElementById('refreshInterval');
  if(selected)selected.value = String(minutes);
  setText('refreshLastBrowser',lastChecked ? readableTime(lastChecked) : 'Not checked this visit');
  setText('refreshLastPublisher',readableTime(window.MW4CamoFeed?.current()?.status?.lastSuccessfulAt));
  const next = minutes === 0 ? 'Manual only' : readableTime((lastChecked || Date.now()) + minutes*60000);
  setText('refreshNext',next);
  setText('refreshMessage',checking ? 'Checking published snapshots…' : detail);
  const btn = document.getElementById('refreshNow');
  if(btn){btn.disabled=checking;btn.textContent=checking?'CHECKING…':'↻ CHECK FOR UPDATES';}
  syncHeader();
}
async function freshJson(path){
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),MAX_WAIT);
  try {
    const url = new URL(path,document.baseURI);
    url.searchParams.set('_fresh',String(Date.now()));
    const response = await fetch(url,{cache:'no-store',signal:controller.signal,headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('HTTP '+response.status);
    return await response.json();
  } finally { clearTimeout(timeout); }
}
async function checkNow(manual=false){
  if(checking)return;
  checking=true;updateView();
  let success=0, failures=0, added=0, changes=false;
  try {
    const results = await Promise.allSettled([
      freshJson('./data/patches.json'),
      freshJson('./data/update-status.json'),
      freshJson('./data/attachments-community.json')
    ]);
    const validPatch = results[0].status==='fulfilled' && Array.isArray(results[0].value) && results[0].value.length > 0 && results[0].value.every(item=>item && typeof item.id==='string' && typeof item.date==='string' && Array.isArray(item.sections) && (item.game==='MW4'||item.game==='Warzone'));
    const validStatus = results[1].status==='fulfilled' && results[1].value && typeof results[1].value.lastCheckedAt==='string' && typeof results[1].value.lastSuccessfulAt==='string';
    if(validPatch && validStatus && window.MW4CamoFeed){
      const existing = window.MW4CamoFeed.current();
      const oldTime = Date.parse(existing.status?.lastCheckedAt || '') || 0;
      const freshTime = Date.parse(results[1].value.lastCheckedAt) || 0;
      if(freshTime>=oldTime){
        added = results[0].value.filter(item=>!new Set(existing.patches.map(old=>old.id)).has(item.id)).length;
        changes = window.MW4CamoFeed.apply(results[0].value,results[1].value);
        success++;
      } else {
        // A delayed CDN response must not roll the current session backward.
        failures++;
      }
    }else failures++;
    if(results[2].status==='fulfilled' && typeof window.MW4_ApplyCommunityCatalog==='function' && window.MW4_ApplyCommunityCatalog(results[2].value)){
      success++;
    }else failures++;
    lastChecked=Date.now();
    outcome=success===2?'ok':success===1?'partial':'error';
    detail=outcome==='ok'?(changes ? (added?added+' new patch record(s) loaded.':'Revised patch information loaded.') : 'Up to date with the published sources.') : outcome==='partial'?'One source could not be refreshed. Existing saved data was kept.':'Could not contact the published sources. Existing saved data was kept.';
    if(manual && root && typeof window.MW4CamoFeed?.message==='function')window.MW4CamoFeed.message(detail);
  } catch {
    lastChecked=Date.now();outcome='error';
    detail='Update check failed. Existing saved data was kept.';
  } finally {
    checking=false; schedule();updateView();
  }
}
function schedule(){
  if(timer!==null){clearTimeout(timer);timer=null;}
  if(minutes===0 || document.hidden || checking)return;
  const elapsed=lastChecked ? Math.max(0,Date.now()-lastChecked) : 0;
  const delay=Math.max(1000,minutes*60000-elapsed);
  timer=setTimeout(()=>{timer=null;void checkNow(false);},delay);
}
function changeInterval(value){
  const selected=Number(value);
  if(!INTERVALS.includes(selected))return;
  minutes=selected;
  try{localStorage.setItem(KEY,String(minutes));detail='Refresh preference saved on this device.';}
  catch{detail='Preference active for this visit; browser storage is unavailable.';}
  schedule();updateView();
}
function mount(){
  if(!location.hash.startsWith('#/settings'))return;
  const grid = root?.querySelector('.settings-grid');
  if(!grid || document.getElementById('refreshSettings'))return;
  const card = document.createElement('section');
  card.id='refreshSettings';card.className='card';card.setAttribute('aria-label','Update refresh settings');
  card.innerHTML=`<h2 class="card-title">UPDATE REFRESH SETTINGS</h2>
  <p class="lede">Choose how often this device checks published MW4 and Warzone patch notes and community-reported attachment updates. Your choice is private to this browser.</p>
  <label class="field-label" for="refreshInterval">AUTOMATIC CHECK FREQUENCY</label>
  <select class="select" id="refreshInterval">
    <option value="0">Manual only</option>
    <option value="5">Every 5 minutes</option>
    <option value="15">Every 15 minutes</option>
    <option value="30">Every 30 minutes</option>
    <option value="60">Every hour (recommended)</option>
    <option value="180">Every 3 hours</option>
    <option value="360">Every 6 hours</option>
    <option value="720">Every 12 hours</option>
    <option value="1440">Every 24 hours</option>
  </select>
  <p class="micro">Checks run while this website is open. Returning to an inactive tab resumes overdue checks. The shared publisher-data sync runs hourly; choosing a shorter interval cannot create new publisher updates.</p>
  <button class="btn btn-primary" type="button" id="refreshNow">↻ CHECK FOR UPDATES</button>
  <div class="divider"></div>
  <p class="micro">Last browser check: <strong id="refreshLastBrowser">—</strong></p>
  <p class="micro">Last successful publisher sync: <strong id="refreshLastPublisher">—</strong></p>
  <p class="micro">Next browser check: <strong id="refreshNext">—</strong></p>
  <p class="micro" id="refreshMessage" role="status" aria-live="polite"></p>`;
  grid.prepend(card);
  card.querySelector('#refreshInterval').addEventListener('change',event=>changeInterval(event.target.value));
  card.querySelector('#refreshNow').addEventListener('click',()=>void checkNow(true));
  updateView();
}
window.addEventListener('mw4:render',mount);
window.addEventListener('storage',event=>{
  if(event.key!==KEY)return;
  minutes=readInterval();detail='Refresh preference updated from another tab.';
  schedule();updateView();
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(timer!==null){clearTimeout(timer);timer=null;}return;}
  if(minutes && lastChecked && Date.now()-lastChecked>=minutes*60000)void checkNow(false);
  else schedule();
  updateView();
});
window.addEventListener('online',()=>{
  if(minutes && lastChecked && Date.now()-lastChecked>=minutes*60000)void checkNow(false);
});
mount();schedule();updateView();
})();
