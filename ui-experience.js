/* MW4Camo v1.4 navigation, animations, quality LOD and quality-of-life controls. */
(() => {
'use strict';
const root=document.documentElement;
const QUALITY_KEY='mw4camo-visual-quality-v1';
const RECENT_KEY='mw4camo-recent-weapons-v1';
const qualityModes=['auto','full','lite'];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const qualityButton=document.getElementById('qualityButton');
const qualityText=document.getElementById('qualityText');
const quickOpen=document.getElementById('quickOpen');
const quickClose=document.getElementById('quickClose');
const quickOverlay=document.getElementById('quickOverlay');
const quickSearch=document.getElementById('quickSearch');
const quickResults=document.getElementById('quickResults');
const backTop=document.getElementById('backTop');
if(!qualityButton||!quickOpen||!quickOverlay||!backTop)return;
const pages=[
 ['Overview','dashboard','Command center and progress'],
 ['Weapons & Camos','weapons','Search your weapons'],
 ['Grind Planner','planner','Choose your next objective'],
 ['Mastery Roadmap','mastery','Mastery camo progress'],
 ['Loadout Lab','loadouts','Gunsmith weapon select'],
 ['Saved Blueprints','my-builds','Your custom loadouts'],
 ['Patch Intelligence','patches','MW4 and Warzone changelog'],
 ['Data & Settings','settings','Backup, detail and animation options']
];
const weapons=Array.isArray(window.MW4_WEAPONS)?window.MW4_WEAPONS:[];
const patches=Array.isArray(window.MW4_PATCHES)?window.MW4_PATCHES:[];
let preference='auto',recent=[],selected=0,results=[],priorFocus=null;
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
function currentQuality(){
 if(preference!=='auto')return preference;
 const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const slow=['slow-2g','2g'].includes(connection?.effectiveType);
 const lowMemory=Number(navigator.deviceMemory)>0&&Number(navigator.deviceMemory)<=2;
 const lowCores=Number(navigator.hardwareConcurrency)>0&&Number(navigator.hardwareConcurrency)<=2;
 return connection?.saveData||slow||lowMemory||lowCores?'lite':'full';
}
function qualityChanged(){
 const mode=currentQuality();
 root.dataset.quality=mode;
 root.dataset.motion=reduced.matches?'reduce':'normal';
 qualityText.textContent=preference.toUpperCase();
 qualityButton.title='Visual quality: '+preference+' (currently '+mode+')';
 qualityButton.setAttribute('aria-label','Visual quality '+preference+', currently '+mode+'. Click to change');
 const select=document.getElementById('qualitySelect');
 if(select)select.value=preference;
 const status=document.getElementById('visualStatus');
 if(status)status.textContent='Active rendering: '+mode.toUpperCase()+(reduced.matches?' · System reduced motion enabled.':' · Animations '+(mode==='full'?'enabled.':'minimized.'));
}
function setQuality(value){if(!qualityModes.includes(value))return;preference=value;write(QUALITY_KEY,preference);qualityChanged();}
function injectSettings(){
 if(!location.hash.startsWith('#/settings')||document.getElementById('qualitySettings'))return;
 const grid=document.querySelector('#app .settings-grid');if(!grid)return;
 const card=document.createElement('section');
 card.className='card visual-settings';card.id='qualitySettings';
 card.innerHTML='<h2 class="card-title">VISUALS & PERFORMANCE</h2>'+
 '<p class="lede">Choose full animation or lightweight visuals. Auto adapts to device capability and data saving. Reduced-motion preferences take priority.</p>'+
 '<label class="field-label" for="qualitySelect">DISPLAY DETAIL</label>'+
 '<select class="select" id="qualitySelect"><option value="auto">Auto (recommended)</option><option value="full">Full motion & effects</option><option value="lite">Lite (fewer effects)</option></select>'+
 '<p id="visualStatus" class="micro visual-status" role="status"></p>'+
 '<p class="micro">Keyboard: Ctrl K to find any weapon or page. Press / outside a text field to search.</p>';
 grid.prepend(card);
 card.querySelector('select').addEventListener('change',event=>setQuality(event.target.value));
 qualityChanged();
}
preference=read(QUALITY_KEY,'auto');if(!qualityModes.includes(preference))preference='auto';
recent=read(RECENT_KEY,[]);if(!Array.isArray(recent))recent=[];
qualityButton.addEventListener('click',()=>setQuality(qualityModes[(qualityModes.indexOf(preference)+1)%qualityModes.length]));
reduced.addEventListener?.('change',qualityChanged);
window.addEventListener('storage',event=>{
 if(event.key===QUALITY_KEY){preference=read(QUALITY_KEY,'auto');if(!qualityModes.includes(preference))preference='auto';qualityChanged();}
});
qualityChanged();
function rememberWeapon(){
 const match=location.hash.match(/^#\/(?:weapon|build)\/([a-z0-9-]+)/);
 if(!match||!weapons.some(w=>w.id===match[1]))return;
 recent=[match[1],...recent.filter(id=>id!==match[1])].slice(0,5);write(RECENT_KEY,recent);
}
function searchItems(query){
 const q=query.trim().toLowerCase();
 let choices=pages.map(([title,path,subtitle])=>({title,path,subtitle,kind:'PAGE'}));
 if(!q)choices.push(...recent.map(id=>weapons.find(w=>w.id===id)).filter(Boolean).map(w=>({title:w.name,path:'weapon/'+w.id,subtitle:'Continue camo progress',kind:'RECENT'})));
 choices.push(...weapons.map(w=>({title:w.name,path:'weapon/'+w.id,subtitle:w.category+' · Camo tracker',kind:'WEAPON'})));
 choices.push(...patches.slice(0,25).map(p=>({title:p.title,path:'patch/'+p.id,subtitle:p.game+' · '+p.date,kind:'PATCH'})));
 const filtered=choices.filter(item=>!q||[item.title,item.kind,item.subtitle].join(' ').toLowerCase().includes(q));
 return filtered.filter((item,i)=>filtered.findIndex(other=>other.path===item.path)===i).slice(0,q?14:12);
}
function choose(index){
 const item=results[index];if(!item)return;
 closeQuick();location.hash='#/'+item.path;
}
function draw(){
 results=searchItems(quickSearch.value);selected=Math.min(selected,Math.max(0,results.length-1));
 quickResults.replaceChildren();
 if(!results.length){const p=document.createElement('p');p.className='quick-empty';p.textContent='No matches. Try a weapon, page or patch keyword.';quickResults.append(p);return;}
 results.forEach((item,index)=>{
  const button=document.createElement('button');
  button.type='button';button.role='option';button.className='quick-result';
  button.setAttribute('aria-selected',String(index===selected));
  if(index===selected)button.classList.add('selected');
  const copy=document.createElement('span'),name=document.createElement('strong'),description=document.createElement('small'),kind=document.createElement('b');
  name.textContent=item.title;description.textContent=item.subtitle;kind.textContent=item.kind;copy.append(name,description);button.append(copy,kind);
  button.addEventListener('click',()=>choose(index));quickResults.append(button);
 });
}
function openQuick(){
 if(!quickOverlay.hidden)return;
 priorFocus=document.activeElement;quickOverlay.hidden=false;document.body.classList.add('quick-open');
 quickSearch.value='';selected=0;draw();quickSearch.focus();
}
function closeQuick(){
 if(quickOverlay.hidden)return;
 quickOverlay.hidden=true;document.body.classList.remove('quick-open');
 if(priorFocus?.isConnected)priorFocus.focus({preventScroll:true});
}
quickOpen.addEventListener('click',openQuick);
quickClose.addEventListener('click',closeQuick);
quickOverlay.addEventListener('mousedown',event=>{if(event.target===quickOverlay)closeQuick();});
quickSearch.addEventListener('input',()=>{selected=0;draw();});
quickSearch.addEventListener('keydown',event=>{
 if(event.key==='ArrowDown'||event.key==='ArrowUp'){
  event.preventDefault();selected=(selected+(event.key==='ArrowDown'?1:-1)+results.length)%Math.max(1,results.length);draw();
  quickResults.querySelector('.selected')?.scrollIntoView({block:'nearest'});
 }
 if(event.key==='Enter'){event.preventDefault();choose(selected);}
});
document.addEventListener('keydown',event=>{
 const typing=event.target.matches?.('input, textarea, select, [contenteditable="true"]');
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
  event.preventDefault();quickOverlay.hidden?openQuick():closeQuick();return;
 }
 if(event.key==='/'&&!typing&&!event.altKey&&!event.ctrlKey&&!event.metaKey){event.preventDefault();openQuick();return;}
 if(event.key==='Escape'&&!quickOverlay.hidden){event.preventDefault();event.stopImmediatePropagation();closeQuick();return;}
 if(event.key==='Tab'&&!quickOverlay.hidden){
  const focus=[quickSearch,quickClose,...quickResults.querySelectorAll('button')].filter(el=>el.getClientRects().length);
  if(!focus.length)return;const first=focus[0],last=focus[focus.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }
},true);
function syncTop(){backTop.hidden=window.scrollY<540;}
backTop.addEventListener('click',()=>scrollTo({top:0,behavior:reduced.matches||currentQuality()==='lite'?'instant':'smooth'}));
window.addEventListener('scroll',syncTop,{passive:true});
function afterRender(){rememberWeapon();injectSettings();syncTop();if(!quickOverlay.hidden)closeQuick();}
window.addEventListener('mw4:render',afterRender);
window.addEventListener('hashchange',()=>{if(!quickOverlay.hidden)closeQuick();});
afterRender();
})();