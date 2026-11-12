/* MW4Camo v1.4 visual performance and navigation layer. No game data writes. */
(() => {
'use strict';
const root=document.documentElement;
const QUALITY_KEY='mw4camo-visual-quality-v1';
const RECENT_KEY='mw4camo-recent-weapons-v1';
const qualities=['auto','full','lite'];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const qualityButton=document.getElementById('qualityButton');
const qualityText=document.getElementById('qualityText');
const quickOpen=document.getElementById('quickOpen');
const quickClose=document.getElementById('quickClose');
const quickOverlay=document.getElementById('quickOverlay');
const quickSearch=document.getElementById('quickSearch');
const quickResults=document.getElementById('quickResults');
const backTop=document.getElementById('backTop');
const pageLinks=[
  ['Overview','dashboard','Command center and progress'],
  ['Weapons & Camos','weapons','Search your weapons'],
  ['Grind Planner','planner','Choose your next objective'],
  ['Mastery Roadmap','mastery','Mastery camo progress'],
  ['Loadout Lab','loadouts','Gunsmith weapon select'],
  ['Operator Hub','hub','Your patch, camo, comparison and class tools'],
  ['Complete Loadouts','class-builder','Primary, secondary, perks and equipment'],
  ['Weapon Compare','compare','Verified and personal weapon statistics'],
  ['Camo Assistant','assistant','Next unlock goals and counters'],
  ['Patch Loadout Doctor','doctor','Review updates affecting saved builds'],
  ['Saved Blueprints','my-builds','Your custom loadouts'],
  ['Patch Intelligence','patches','MW4 and Warzone changelog'],
  ['Data & Settings','settings','Backups, detail and animation options']
];
const weapons=Array.isArray(window.MW4_WEAPONS)?window.MW4_WEAPONS:[];
const patches=Array.isArray(window.MW4_PATCHES)?window.MW4_PATCHES:[];
let preference='auto', recent=[], selection=0, items=[], priorFocus=null;
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Private mode may disallow storage. */}}
function effectiveQuality(){
  if(preference!=='auto')return preference;
  const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  const saveData=Boolean(connection?.saveData);
  const slowNetwork=['slow-2g','2g'].includes(connection?.effectiveType);
  const lowMemory=Number(navigator.deviceMemory)>0&&Number(navigator.deviceMemory)<=2;
  const lowCores=Number(navigator.hardwareConcurrency)>0&&Number(navigator.hardwareConcurrency)<=2;
  return saveData||slowNetwork||lowMemory||lowCores?'lite':'full';
}
function settingsControl(){
  if(!location.hash.startsWith('#/settings'))return;
  if(document.getElementById('qualitySettings'))return;
  const grid=document.querySelector('#app .settings-grid');
  if(!grid)return;
  const card=document.createElement('section');
  card.className='card visual-settings';card.id='qualitySettings';
  card.innerHTML=`<h2 class="card-title">VISUALS & PERFORMANCE</h2>
    <p class="lede">Choose full animations or a faster lightweight interface. Auto adapts to device capability and data-saving mode. Reduced-motion preferences always override animations.</p>
    <label class="field-label" for="qualitySelect">DISPLAY DETAIL</label>
    <select class="select" id="qualitySelect"><option value="auto">Auto (recommended)</option><option value="full">Full motion & effects</option><option value="lite">Lite (fewer effects)</option></select>
    <p class="micro visual-status" id="visualStatus" role="status"></p>
    <p class="micro">Shortcut: <kbd>Ctrl K</kbd> to jump to a weapon or section. Press <kbd>/</kbd> outside a text field to search.</p>`;
  grid.prepend(card);
  card.querySelector('#qualitySelect').addEventListener('change',e=>setQuality(e.target.value));
  updateQualityLabel();
}
function updateQualityLabel(){
  const mode=effectiveQuality();root.dataset.quality=mode;root.dataset.motion=reduced.matches?'reduce':'normal';
  qualityText.textContent=preference.toUpperCase();
  qualityButton.title='Visuals: '+preference.toUpperCase()+' (currently '+mode.toUpperCase()+'); click to change';
  qualityButton.setAttribute('aria-label','Visual quality '+preference+', currently '+mode+'. Click to change');
  const select=document.getElementById('qualitySelect');if(select)select.value=preference;
  const status=document.getElementById('visualStatus');if(status)status.textContent='Active rendering mode: '+mode.toUpperCase()+(reduced.matches?' · System reduced-motion setting is enabled.':' · Page transitions and button feedback '+(mode==='full'?'enabled.':'minimized.'));
}
function setQuality(value){if(!qualities.includes(value))return;preference=value;write(QUALITY_KEY,preference);updateQualityLabel();}
preference=read(QUALITY_KEY,'auto');if(!qualities.includes(preference))preference='auto';
recent=read(RECENT_KEY,[]);if(!Array.isArray(recent))recent=[];
qualityButton.addEventListener('click',()=>setQuality(qualities[(qualities.indexOf(preference)+1)%qualities.length]));
reduced.addEventListener?.('change',updateQualityLabel);
window.addEventListener('storage',event=>{if(event.key===QUALITY_KEY){preference=read(QUALITY_KEY,'auto');if(!qualities.includes(preference))preference='auto';updateQualityLabel();}});
updateQualityLabel();
function rememberRoute(){
  const m=location.hash.match(/^#\/(?:weapon|build)\/([a-z0-9-]+)/);
  if(!m||!weapons.some(w=>w.id===m[1]))return;
  recent=[m[1],...recent.filter(v=>v!==m[1])].slice(0,5);write(RECENT_KEY,recent);
}
function makeItems(term){
  const termLC=term.toLowerCase().trim();
  let candidates=[...pageLinks.map(([title,path,subtitle])=>({title,path,subtitle,kind:'PAGE'}))];
  if(!termLC){
    candidates.push(...recent.map(id=>weapons.find(w=>w.id===id)).filter(Boolean).map(w=>({title:w.name,path:'weapon/'+w.id,subtitle:'Continue camo progress',kind:'RECENT WEAPON'})));
  }
  candidates.push(...weapons.map(w=>({title:w.name,path:'weapon/'+w.id,subtitle:w.category+' · Open camo tracker',kind:'WEAPON'})));
  candidates.push(...patches.map(p=>({title:p.title,path:'patch/'+p.id,subtitle:p.game+' · '+p.date,kind:'PATCH'})));
  const matches=candidates.filter(item=>!termLC||[item.title,item.kind,item.subtitle].join(' ').toLowerCase().includes(termLC));
  return matches.filter((item,index)=>matches.findIndex(prev=>prev.path===item.path)===index).slice(0,termLC?14:12);
}
function drawResults(){
  items=makeItems(quickSearch.value);selection=Math.min(selection,Math.max(0,items.length-1));quickResults.replaceChildren();
  if(!items.length){const empty=document.createElement('p');empty.className='quick-empty';empty.textContent='No matches. Try a weapon name, camo page, or patch keyword.';quickResults.append(empty);return;}
  for(const [i,item] of items.entries()){
    const btn=document.createElement('button');btn.type='button';btn.role='option';btn.className='quick-result';btn.dataset.index=String(i);btn.setAttribute('aria-selected',String(i===selection));
    const copy=document.createElement('span');const name=document.createElement('strong');name.textContent=item.title;
    const subtitle=document.createElement('small');subtitle.textContent=item.subtitle;copy.append(name,subtitle);
    const kind=document.createElement('b');kind.textContent=item.kind;btn.append(copy,kind);
    if(i===selection)btn.classList.add('selected');
    btn.addEventListener('click',()=>choose(i));quickResults.append(btn);
  }
}
function openQuick(){if(!quickOverlay.hidden)return;priorFocus=document.activeElement;quickOverlay.hidden=false;document.body.classList.add('quick-open');selection=0;quickSearch.value='';drawResults();quickSearch.focus();}
function closeQuick(){if(quickOverlay.hidden)return;quickOverlay.hidden=true;document.body.classList.remove('quick-open');priorFocus?.isConnected&&priorFocus.focus({preventScroll:true});}
function choose(i){const item=items[i];if(!item)return;closeQuick();location.hash='#/'+item.path;}
quickOpen.addEventListener('click',openQuick);
quickClose.addEventListener('click',closeQuick);
quickOverlay.addEventListener('mousedown',event=>{if(event.target===quickOverlay)closeQuick();});
quickSearch.addEventListener('input',()=>{selection=0;drawResults();});
quickSearch.addEventListener('keydown',event=>{
 if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();selection=(selection+(event.key==='ArrowDown'?1:-1)+items.length)%Math.max(1,items.length);drawResults();quickResults.querySelector('.selected')?.scrollIntoView({block:'nearest'});}
 if(event.key==='Enter'){event.preventDefault();choose(selection);}
});
document.addEventListener('keydown',event=>{
 const isTyping=event.target.matches?.('input, textarea, select, [contenteditable="true"]');
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();quickOverlay.hidden?openQuick():closeQuick();return;}
 if(event.key==='/'&&!isTyping&&!event.altKey&&!event.metaKey&&!event.ctrlKey){event.preventDefault();openQuick();return;}
 if(event.key==='Escape'&&!quickOverlay.hidden){event.preventDefault();event.stopImmediatePropagation();closeQuick();return;}
 if(event.key==='Tab'&&!quickOverlay.hidden){
   const focus=[quickSearch,quickClose,...quickResults.querySelectorAll('button')].filter(el=>el.getClientRects().length);
   if(!focus.length)return;
   const first=focus[0],last=focus[focus.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }
},true);
function syncScroll(){backTop.hidden=window.scrollY<540;}
backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced.matches||effectiveQuality()==='lite'?'instant':'smooth'}));
window.addEventListener('scroll',syncScroll,{passive:true});
function onRender(){rememberRoute();settingsControl();syncScroll();if(!quickOverlay.hidden)closeQuick();}
window.addEventListener('mw4:render',onRender);
window.addEventListener('hashchange',()=>{if(!quickOverlay.hidden)closeQuick();});
onRender();
})();
