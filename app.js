(() => {
'use strict';
const WEAPONS = Array.isArray(window.MW4_WEAPONS) ? window.MW4_WEAPONS : [];
const PATCHES = Array.isArray(window.MW4_PATCHES) ? window.MW4_PATCHES : [];
const UPDATE = window.MW4_UPDATE_STATUS || {};
const SEEDS = Array.isArray(window.MW4_SEED_BUILDS) ? window.MW4_SEED_BUILDS : [];
const GUNSMITH = window.MW4_ATTACHMENTS || {specs:{},items:[],maxStandard:5};
const INTEL = window.MW4_INTEL_V15 || {verifiedWeaponStats:{},globalFacts:[],options:{}};
const STORE_KEY = 'mw4camo-io-v1';
const app = document.getElementById('app');
const nav = document.getElementById('nav');
const toastBox = document.getElementById('toast');
const categories = [...new Set(WEAPONS.map(w => w.category))];
const baseWeapons = WEAPONS.filter(w => w.season === 'Launch');
const CAMOS = [
  ...Array.from({length: 8}, (_, i) => ({ id: 'military-'+(i+1), name: 'Military '+(i+1), type: 'Military' })),
  ...Array.from({length: 3}, (_, i) => ({ id: 'special-'+(i+1), name: 'Special '+(i+1), type: 'Special' })),
  { id: 'gold', name: 'Gold', type: 'Completionist' },
  { id: 'platinum', name: 'Platinum', type: 'Completionist' },
  { id: 'harmonic-break', name: 'Harmonic Break', type: 'Completionist' },
  { id: 'pyroclast', name: 'Pyroclast', type: 'Prestige' },
  { id: 'pyroclast-terminus', name: 'Pyroclast Terminus', type: 'Prestige' },
  { id: 'pyroclast-scatter', name: 'Pyroclast Scatter', type: 'Prestige' },
  { id: 'pyroclast-cascade', name: 'Pyroclast Cascade', type: 'Prestige' }
];
const ACCOUNT = [
  {id:'divergence',name:'Divergence',mode:'Universal',desc:'Complete 33 Harmonic Break challenges on launch weapons.'},
  {id:'mercurial-drift',name:'Mercurial Drift',mode:'MW4',desc:'After Divergence: earn 10 kills in a match 250 times.'},
  {id:'polyatomic-reforged',name:'Polyatomic Reforged',mode:'MW4',desc:'After Mercurial Drift: three kills without taking damage 300 times.'},
  {id:'orion-reforged',name:'Orion Reforged',mode:'MW4',desc:'After Polyatomic: five kills without dying 500 times.'},
  {id:'chiral',name:'Chiral',mode:'DMZ',desc:'After Divergence: defeat 2,500 Tier 3+ enemies.'},
  {id:'ripple-tide',name:'Ripple Tide',mode:'DMZ',desc:'After Chiral: exfil with two LT dog tags in one deployment 50 times.'},
  {id:'helio',name:'Helio',mode:'DMZ',desc:'After Ripple Tide: defeat 25,000 enemies with Legendary weapons on a max-level Operator.'},
  {id:'parallax',name:'Parallax',mode:'Warzone',desc:'Warzone mastery challenge — exact official requirement not verified in this v1 dataset.'},
  {id:'damascus-reforged',name:'Damascus Reforged',mode:'Warzone',desc:'Warzone mastery challenge — exact official requirement not verified in this v1 dataset.'},
  {id:'empyros',name:'Empyros',mode:'Warzone',desc:'Warzone mastery challenge — exact official requirement not verified in this v1 dataset.'}
];
const CLASS_GOALS = {
  'Assault Rifles': ['Headshots', 'Double kills'], 'Submachine Guns': ['Kills from behind', 'Hipfire kills'],
  'Shotguns':['Hipfire kills','Kills without reloading'], 'Light Machine Guns':['Kills without dying','Kills without releasing trigger'],
  'Marksman Rifles':['Prone kills','One-shot kills'], 'Sniper Rifles':['Prone kills','One-shot kills'],
  'Pistols':['Kills from behind','Hipfire kills'], 'Launchers':['Kills without taking damage','Player kills'],
  'Melee':['Kills without dying','Kills from behind']
};
const TEMPLATES = {
  'Balanced': 'Versatile control, handling and effective range with minimal tradeoffs.',
  'Fast TTK': 'Optimize hit consistency, effective damage range and aim response; actual TTK depends on weapon balance, armor, hit location and connection.',
  'Low Recoil': 'Prioritize recoil stabilization and firing stability. “Zero recoil” is a build goal, not a verified promise.',
  'Aggressive': 'Prioritize sprint-to-fire, ADS handling, movement and close-range consistency.',
  'Long Range': 'Aim for bullet velocity, recoil stabilization, optics and effective damage range.',
  'Hipfire': 'Prioritize hipfire spread, sprint-to-fire and mobility for close fights.',
  'Stealth': 'Favor a suppressed muzzle, quiet positioning, fast handling and mobility.',
  'Quickscope': 'Optimize ADS speed, aiming stability and quick follow-up shots for precision weapons.',
  'Squad Support': 'Prioritize ammunition capacity, sustained accuracy and reliable ranged cover.'
};
const GOAL_METRICS = {
  'Balanced':[3,3,3,3,3], 'Fast TTK':[5,3,3,4,2], 'Low Recoil':[3,5,4,2,3],
  'Aggressive':[4,2,2,5,3], 'Long Range':[4,5,5,2,2], 'Hipfire':[3,2,1,5,4],
  'Stealth':[3,3,3,4,5], 'Quickscope':[4,2,4,5,2], 'Squad Support':[3,4,5,2,3]
};
const GOAL_LABELS = ['Kill potential','Recoil priority','Effective range','Mobility priority','Utility / stealth'];
const GOAL_HINTS = {
  'Balanced':{Muzzle:'Balanced recoil management',Barrel:'Consistent effective range',Magazine:'Reliable ammo capacity',Optic:'Clear sight picture',Stock:'Stability without excessive weight','Rear Grip':'Handling and recoil balance',Underbarrel:'Vertical and horizontal recoil',Laser:'Handling / aiming speed',Ammunition:'Consistent ballistics'},
  'Fast TTK':{Muzzle:'Shot-to-shot control so more bullets connect',Barrel:'Damage range and bullet velocity',Magazine:'Capacity without severe ADS penalty',Optic:'Sight picture for rapid target acquisition',Stock:'ADS and firing stability','Rear Grip':'Sprint-to-fire and ADS speed',Underbarrel:'Manage first-shot recoil',Laser:'Fast target acquisition',Ammunition:'Velocity / range where supported'},
  'Low Recoil':{Muzzle:'Prioritize vertical + horizontal recoil',Barrel:'Recoil stabilization over handling',Magazine:'Maintain control with adequate capacity',Optic:'Low obstruction, manageable visual kick',Stock:'Firing stability and sway control','Rear Grip':'Recoil control / stabilization',Underbarrel:'Recoil mitigation, especially horizontal',Laser:'Firing stability if offered',Ammunition:'Avoid ammunition with added recoil'},
  'Aggressive':{Muzzle:'Preserve fast handling',Barrel:'Lightweight option to retain mobility',Magazine:'Enough rounds for multiple close targets',Optic:'Fast acquisition or clean iron sights',Stock:'Sprint / strafe speed','Rear Grip':'Sprint-to-fire and ADS speed',Underbarrel:'Lightweight control',Laser:'Hipfire to ADS transition',Ammunition:'Consistent close-range hit registration'},
  'Long Range':{Muzzle:'Steady tracking and controlled bursts',Barrel:'Bullet velocity and damage range',Magazine:'Stable magazine with adequate reserve',Optic:'Clean longer-range magnification',Stock:'Aim stability under sustained fire','Rear Grip':'Recoil stabilization',Underbarrel:'Horizontal + vertical stabilization',Laser:'Aiming steadiness',Ammunition:'Faster projectile when available'},
  'Hipfire':{Muzzle:'Close-range controllability',Barrel:'Hipfire spread where available',Magazine:'Capacity for back-to-back engagements',Optic:'Optional: prioritize hipfire slots instead',Stock:'Mobility and strafe speed','Rear Grip':'Sprint-to-fire speed',Underbarrel:'Hipfire spread / stability',Laser:'Hipfire accuracy + sprint-to-fire',Ammunition:'Consistency in very close quarters'},
  'Stealth':{Muzzle:'Suppressor with manageable range tradeoff',Barrel:'Range without excessive visibility',Magazine:'Reliable mag for disengaging',Optic:'Uncluttered low-profile sight',Stock:'Quiet repositioning mobility','Rear Grip':'Fast ADS / sprint-to-fire',Underbarrel:'Low-penalty control',Laser:'Prefer no visible beam when possible',Ammunition:'Preserve effective range'},
  'Quickscope':{Muzzle:'Handling without excessive sway',Barrel:'ADS speed vs one-shot range',Magazine:'Fast re-chamber / reload if relevant',Optic:'Quick sight acquisition',Stock:'ADS speed and steadiness','Rear Grip':'ADS transition speed',Underbarrel:'Aiming stability if supported',Laser:'Fast ADS speed',Ammunition:'Velocity for predictable shots'},
  'Squad Support':{Muzzle:'Sustained recoil control',Barrel:'Effective ranged suppression',Magazine:'Larger capacity for squad fights',Optic:'Readable sight at mid range',Stock:'Low sway under sustained fire','Rear Grip':'Firing stability',Underbarrel:'Horizontal recoil control',Laser:'Stability over sprint speed',Ammunition:'Bullet velocity / penetration where supported'}
};
const ROLE = {
  'Assault Rifles':'Flexible short-to-long range rifle. Build recoil control first, then range, velocity and mobility.',
  'Submachine Guns':'Close-range weapon. Focus on sprint-to-fire, ADS handling, recoil and magazine capacity.',
  'Shotguns':'Close-quarters power. Improve handling, pellet consistency and reload time where possible.',
  'Light Machine Guns':'Sustained fire support. Prioritize recoil stability and range while managing ADS speed.',
  'Marksman Rifles':'Precision mid-range fire. Aim for handling, aim stability and accurate follow-up shots.',
  'Sniper Rifles':'Precision long-range eliminations. Favor velocity, sway reduction, an appropriate optic and ADS speed.',
  'Pistols':'Fast backup weapon. Favor quick draw, accuracy, handling and magazine options.',
  'Launchers':'Equipment counter. Track camos here; most launchers have no traditional five-part Gunsmith build.',
  'Melee':'Close-range equipment. Track camos here; traditional Gunsmith attachment builds do not apply.'
};
const SLOT_DEFAULTS = {
  'Assault Rifles':['Muzzle','Barrel','Underbarrel','Stock','Rear Grip'],
  'Submachine Guns':['Muzzle','Barrel','Magazine','Stock','Rear Grip'],
  'Shotguns':['Muzzle','Barrel','Laser','Stock','Rear Grip'],
  'Light Machine Guns':['Muzzle','Barrel','Underbarrel','Optic','Stock'],
  'Marksman Rifles':['Muzzle','Barrel','Optic','Stock','Rear Grip'],
  'Sniper Rifles':['Muzzle','Barrel','Optic','Stock','Rear Grip'],
  'Pistols':['Barrel','Optic','Magazine','Rear Grip','Trigger Action'],
  'Launchers':[], 'Melee':[]
};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = value => String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const pct = (done, total) => total ? Math.round(done*100/total) : 0;
const fmtDate = value => new Date(value+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric',year:'numeric'});
const defaultState = () => ({version:1,mode:'Warzone',completed:{},accounts:{},levels:{},favorites:[],builds:{},activeGoals:{},counters:{},focusWeapon:null,classConfigs:{},reviewedPatches:{},weaponMeasurements:{}});
function loadState(){try{let raw=JSON.parse(localStorage.getItem(STORE_KEY));return raw && raw.version===1 ? {...defaultState(),...raw,completed:raw.completed||{},accounts:raw.accounts||{},levels:raw.levels||{},favorites:Array.isArray(raw.favorites)?raw.favorites:[],builds:raw.builds||{},activeGoals:raw.activeGoals||{},counters:raw.counters&&typeof raw.counters==='object'&&!Array.isArray(raw.counters)?raw.counters:{},focusWeapon:WEAPONS.some(w=>w.id===raw.focusWeapon)?raw.focusWeapon:null,classConfigs:raw.classConfigs&&typeof raw.classConfigs==='object'&&!Array.isArray(raw.classConfigs)?raw.classConfigs:{},reviewedPatches:raw.reviewedPatches&&typeof raw.reviewedPatches==='object'&&!Array.isArray(raw.reviewedPatches)?raw.reviewedPatches:{},weaponMeasurements:raw.weaponMeasurements&&typeof raw.weaponMeasurements==='object'&&!Array.isArray(raw.weaponMeasurements)?raw.weaponMeasurements:{}} : defaultState();}catch{return defaultState();}}
let state = loadState();
let filter={search:'',category:'All',status:'All',fav:false};
let patchFilter='All';
let patchQuery='';
let missionFilter='Recommended';
let comparisonGoal='Low Recoil';
let compareIds=['han-86','rezi-12'];
let assistantSize=3;
const builderDrafts = Object.create(null);
let template='Balanced';
let toastTimer;
let lastRenderedPath = null;
function notifyUndo(message, callback){
  clearTimeout(toastTimer);
  toastBox.replaceChildren();
  const label=document.createElement('span');label.textContent=message;
  const button=document.createElement('button');button.type='button';button.className='toast-undo';button.textContent='UNDO';
  button.setAttribute('aria-label','Undo the last progress change');
  button.addEventListener('click',()=>{callback();notify('Last change undone');},{once:true});
  toastBox.append(label,button);toastBox.classList.add('show');
  toastTimer=setTimeout(()=>toastBox.classList.remove('show'),6500);
}
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));return true;}catch{notify('Could not write local storage. Export your progress instead.');return false;}}
function notify(msg){toastBox.textContent=msg;toastBox.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastBox.classList.remove('show'),3500);}
function link(path){return '#/'+path;}
function currentPath(){try{return decodeURIComponent((location.hash||'#/dashboard').replace(/^#\/?/,''));}catch{return 'dashboard';}}
function countWeapon(w){return CAMOS.filter(c=>!!state.completed[w.id+'|'+c.id]).length;}
function has(w,key){return !!state.completed[w.id+'|'+key];}
function allCount(){return WEAPONS.reduce((n,w)=>n+countWeapon(w),0)+ACCOUNT.reduce((n,c)=>n+Number(!!state.accounts[c.id]),0);}
function totalCount(){return WEAPONS.length*CAMOS.length+ACCOUNT.length;}
function countTier(id){return WEAPONS.filter(w=>has(w,id)).length;}
function categoryPct(cat){let ws=WEAPONS.filter(w=>w.category===cat);return pct(ws.reduce((n,w)=>n+countWeapon(w),0),ws.length*CAMOS.length);}
function favorite(w){return state.favorites.includes(w.id);}
function counter(w,c){const item=state.counters?.[w.id+'|'+c]||{};return {value:Math.max(0,Math.min(100000,Number(item.value)||0)),target:Math.max(0,Math.min(100000,Number(item.target)||0))};}
function baseDone(w){return CAMOS.filter(c=>(c.type==='Military'||c.type==='Special')&&has(w,c.id)).length;}
function nextObjective(w){let next=CAMOS.find(c=>(c.type==='Military'||c.type==='Special'||c.id==='gold')&&!has(w,c.id));if(!next)next=CAMOS.find(c=>!has(w,c.id));return next?{camo:next,label:camoDetails(w,next).name,detail:camoDetails(w,next).meta}:null;}
function rankedWeapons(){return WEAPONS.map(w=>({w,done:baseDone(w),objective:nextObjective(w)})).filter(x=>x.objective).sort((a,b)=>Number(b.w.id===state.focusWeapon)-Number(a.w.id===state.focusWeapon)||Number(favorite(b.w))-Number(favorite(a.w))||b.done-a.done||a.w.name.localeCompare(b.w.name));}
function progressBar(value){return `<div class="bar"><span style="width:${Math.min(Math.max(value,0),100)}%"></span></div>`;}
function tag(text,cls='subtle'){return `<span class="tag ${cls}">${esc(text)}</span>`;}
function intro(kicker,title,description){return `<div class="eyebrow">${kicker}</div><h1 class="page-title">${title}</h1><p class="lede">${description}</p>`;}
function lastNews(){return [...PATCHES].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);}
function renderDashboard(){
const done=allCount(), gold=countTier('gold'),hb=baseWeapons.filter(w=>has(w,'harmonic-break')).length;
return `<section class="hero"><div class="eyebrow">◉ LIVE OPERATIONS / SEASON ONE</div><h1 class="page-title">OWN THE <em>GRIND.</em><br>TRACK THE WIN.</h1><p class="lede">Every MW4 weapon. Every camo milestone. Your Warzone and Multiplayer builds, selectable Gunsmith attachments, and official patch intelligence in one tactical command center.</p><div class="hero-bottom"><a class="btn btn-primary" href="#/weapons">⌖ CONTINUE CAMO GRIND</a><a class="btn btn-outline" href="#/loadouts">⚒ ENTER LOADOUT LAB</a></div></section>
${renderFocusBrief()}
<div class="stats"><div class="stat"><div class="stat-label">TOTAL CAMO PROGRESS</div><div class="stat-value">${pct(done,totalCount())}%</div><div class="stat-foot">${done} / ${totalCount()} tracked rewards</div></div><div class="stat"><div class="stat-label">GOLD WEAPONS</div><div class="stat-value">${gold}<span class="micro"> / ${WEAPONS.length}</span></div><div class="stat-foot">Finish all 11 base camos first</div></div><div class="stat"><div class="stat-label">HARMONIC BREAK</div><div class="stat-value">${hb}<span class="micro"> / 33</span></div><div class="stat-foot">Launch arsenal mastery gate</div></div><div class="stat"><div class="stat-label">WEAPONS AVAILABLE</div><div class="stat-value">${WEAPONS.length}</div><div class="stat-foot">33 launch + 2 Season 1</div></div></div>
<div class="command-banner"><div><div class="eyebrow">INTELLIGENCE / LIVE FEED</div><h2>TACTICAL BRIEFING · ${PATCHES.length} PATCH RECORDS</h2><p>Official MW4 and Warzone updates, with a separate report for each patch. Your tracked camos remain private on this device.</p></div><a href="#/patches" class="btn btn-primary">OPEN PATCH INTEL ↗</a></div><div class="section grid-2"><div class="card"><div class="section-head"><div><h2 class="section-title">Arsenal completion</h2><span class="section-sub">Progress across all nine weapon classes</span></div><a class="text-link" href="#/weapons">View all ↗</a></div>${categories.map(cat=>`<div class="class-progress"><div class="progress-label"><b>${esc(cat)}</b><span>${categoryPct(cat)}% · ${WEAPONS.filter(w=>w.category===cat).length} weapons</span></div>${progressBar(categoryPct(cat))}</div>`).join('')}</div>
<div class="card"><div class="section-head"><div><h2 class="section-title">Latest Intel</h2><span class="section-sub">Official MW4 & Warzone patches</span></div><a class="text-link" href="#/patches">All patches ↗</a></div><div class="item-list">${lastNews().map(p=>`<a href="#/patch/${p.id}" class="news-item"><span>${tag(p.game,p.game==='Warzone'?'blue':'lime')}<strong>${esc(p.title)}</strong><small>${fmtDate(p.date)}</small></span><span style="color:var(--lime)">↗</span></a>`).join('')}</div><div class="tips" style="margin-top:18px"><span style="font-size:22px">◎</span><span><b>Daily patch monitoring:</b> ${UPDATE.lastSuccessfulAt?'Last completed check '+esc(new Date(UPDATE.lastSuccessfulAt).toLocaleString()):'Configured for GitHub Actions; activates after the workflow is enabled.'}</span></div></div></div>
<div class="section"><div class="section-head"><div><h2 class="section-title">Quick Access</h2><span class="section-sub">Your highest-impact actions</span></div></div><div class="milestone-grid"><a class="milestone" href="#/mastery"><div class="eyebrow">01 / OBJECTIVE</div><h3>DIVERGENCE ROADMAP</h3><p>See what you need for Gold, Platinum and Harmonic Break.</p><span class="text-link">Track mastery ↗</span></a><a class="milestone" href="#/loadouts"><div class="eyebrow">02 / GUNSMITH</div><h3>BUILD YOUR LOADOUT</h3><p>Verified category menus, 5-slot limit, Apex rules, and mode-specific saves.</p><span class="text-link">Open builder ↗</span></a><a class="milestone" href="#/settings"><div class="eyebrow">03 / BACKUP</div><h3>SAVE YOUR PROGRESS</h3><p>Export your local camo checklist, challenge counters, focus weapon and loadouts as a JSON file.</p><span class="text-link">Manage data ↗</span></a></div></div>`;
}
function renderFocusBrief(){let x=rankedWeapons()[0],w=WEAPONS.find(t=>t.id===state.focusWeapon)||(x&&x.w);if(!w)return '';let o=nextObjective(w);return `<section class="focus-brief" aria-label="Current grind objective"><div class="focus-beacon"><span class="focus-dot"></span> ACTIVE OBJECTIVE</div><div class="focus-copy"><div class="eyebrow">FOCUS WEAPON / YOUR NEXT OPERATION</div><h2>${esc(w.name)}</h2><p>${o?`NEXT: ${esc(o.label)} · ${esc(o.detail)}`:'All tracked rewards completed for this weapon.'}</p></div><div class="focus-actions"><a class="btn btn-primary" href="#/weapon/${w.id}">CONTINUE GRIND ↗</a><a class="btn btn-outline" href="#/planner">OPEN GRIND PLANNER</a></div></section>`;}
function renderPlanner(){let all=rankedWeapons();let picks=all.filter(x=>missionFilter==='Favorites'?favorite(x.w):missionFilter==='Near Gold'?x.done>=6&&x.done<11:missionFilter==='Not Started'?x.done===0:true);if(missionFilter==='Recommended')picks=picks.slice(0,9);let gold=WEAPONS.filter(w=>has(w,'gold')).length;return `${intro('OPERATIONS / PERSONAL GRIND ROUTE','GRIND <em>PLANNER.</em>','A practical next-action board calculated from your locally saved camo checkmarks. Pin a focus weapon, work toward Gold, and pick up right where you left off.')}<div class="stats planner-stats"><div class="stat"><div class="stat-label">BASE CAMOS COMPLETE</div><div class="stat-value">${WEAPONS.reduce((n,w)=>n+baseDone(w),0)}<span class="micro"> / ${WEAPONS.length*11}</span></div></div><div class="stat"><div class="stat-label">GOLD UNLOCKS</div><div class="stat-value">${gold}<span class="micro"> / ${WEAPONS.length}</span></div></div><div class="stat"><div class="stat-label">WEAPONS IN PROGRESS</div><div class="stat-value">${WEAPONS.filter(w=>baseDone(w)>0&&baseDone(w)<11).length}</div></div><div class="stat"><div class="stat-label">FOCUS TARGET</div><div class="stat-value small-number">${esc(WEAPONS.find(w=>w.id===state.focusWeapon)?.name||'NONE')}</div></div></div><div class="planner-toolbar"><div class="section-head"><div><h2 class="section-title">MISSION QUEUE</h2><p class="section-sub">Closest to Gold and your pinned weapon appear first</p></div><span class="tag lime">${picks.length} MISSIONS ${missionFilter==='Recommended'?'/ TOP PICKS':''}</span></div><div class="filter-chips">${['Recommended','All','Favorites','Near Gold','Not Started'].map(f=>`<button type="button" class="chip ${missionFilter===f?'active':''}" data-action="mission-filter" data-filter="${f}" aria-pressed="${missionFilter===f}">${f}</button>`).join('')}</div></div><div class="mission-grid">${picks.length?picks.map(({w,done,objective})=>`<article class="mission-card ${state.focusWeapon===w.id?'focused':''}"><div class="mission-top">${tag(w.category,w.season==='Season 1'?'blue':'subtle')} ${state.focusWeapon===w.id?tag('PINNED','lime'):''}</div><h3>${esc(w.name)}</h3><div class="progress-label"><b>BASE CAMOS</b><b>${done} / 11</b></div>${progressBar(pct(done,11))}<div class="mission-next"><span>UP NEXT</span><strong>${esc(objective.label)}</strong><p>${esc(objective.detail)}</p></div><div class="mission-actions"><button class="btn small ${state.focusWeapon===w.id?'btn-primary':'btn-outline'}" data-action="focus" data-weapon="${w.id}">${state.focusWeapon===w.id?'✓ FOCUSED':'⌖ FOCUS'}</button><a class="btn small" href="#/weapon/${w.id}">TRACK ↗</a><a class="btn small btn-quiet" href="#/build/${w.id}">BUILD ↗</a></div></article>`).join(''):'<div class="empty">Nothing matches this filter. Pick another mission category or mark more camo progress.</div>'}</div><div class="note">Recommendations use your own checklist, not real-time Activision account data. Military weapon levels indicate when challenges become available; only manually checked camos count as completed. Unverified challenge requirements are labelled on each weapon page.</div>`;}
function weaponCard(w){let n=countWeapon(w),value=pct(n,CAMOS.length);return `<article class="weapon-card"><div class="weapon-top">${tag(w.category==='Submachine Guns'?'SMG':w.category==='Assault Rifles'?'ASSAULT RIFLE':w.category.replace(/s$/,''),w.season==='Season 1'?'blue':'subtle')}<button class="favorite ${favorite(w)?'active':''}" data-action="favorite" data-weapon="${w.id}" aria-label="${favorite(w)?'Remove favorite':'Add favorite'}">${favorite(w)?'★':'☆'}</button><button class="favorite focus-toggle ${state.focusWeapon===w.id?'active':''}" data-action="focus" data-weapon="${w.id}" aria-label="${state.focusWeapon===w.id?'Unpin focus weapon':'Pin focus weapon'}" title="Focus weapon">⌖</button></div><h3 class="weapon-name">${esc(w.name)}</h3><div class="weapon-info"><span>${w.season==='Season 1'?'SEASON 01 · NEW':'LAUNCH WEAPON'}</span><span>${n} / ${CAMOS.length} CAMOS</span></div>${progressBar(value)}<div class="weapon-bottom"><a class="btn small" href="#/weapon/${w.id}">◫ CAMOS</a><a class="btn small btn-quiet" href="#/build/${w.id}">⚒ BUILD</a></div></article>`;}
function filteredWeapons(){let q=filter.search.trim().toLowerCase();return WEAPONS.filter(w=>(filter.category==='All'||w.category===filter.category)&&(!filter.fav||favorite(w))&&(filter.status==='All'||(filter.status==='Completed'?countWeapon(w)===CAMOS.length:filter.status==='In progress'?countWeapon(w)>0&&countWeapon(w)<CAMOS.length:countWeapon(w)===0))&&(!q||w.name.toLowerCase().includes(q)||w.category.toLowerCase().includes(q))).sort((a,b)=>Number(favorite(b))-Number(favorite(a))||a.name.localeCompare(b.name));}
function weaponFilters(){return `<div class="filters"><input id="weaponSearch" class="search" placeholder="Search all 35 weapons…" value="${esc(filter.search)}" aria-label="Search weapons"><select class="select" id="categoryFilter"><option value="All">All weapon classes</option>${categories.map(c=>`<option value="${esc(c)}" ${filter.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select><select class="select" id="statusFilter">${['All','Not started','In progress','Completed'].map(c=>`<option value="${c}" ${filter.status===c?'selected':''}>${c}</option>`).join('')}</select><button class="btn ${filter.fav?'btn-primary':''}" data-action="favorites">★ ${filter.fav?'FAVORITES':'FAVORITES ONLY'}</button></div><div class="filter-chips">${['All',...categories].map(c=>`<button class="chip ${filter.category===c?'active':''}" data-action="category" data-category="${esc(c)}">${c==='All'?'All 35':esc(c)}</button>`).join('')}</div>`;}
function renderWeapons(){return `${intro('ARSENAL DATABASE / 35 WEAPONS','YOUR <em>ARSENAL.</em>','Browse 33 launch weapons and both current Season 1 additions. Tick individual camo milestones, follow challenge requirements, or create a build for any weapon.')}${weaponFilters()}<div class="section-head"><h2 class="section-title">Weapons <span id="weaponResultsCount" class="micro"></span></h2><span class="micro">★ Favorites are sorted first</span></div><div class="weapon-grid" id="weaponGrid">${filteredWeapons().map(weaponCard).join('')}</div><div class="note warn" style="margin-top:18px">Challenge labels reflect source quality: six official Special challenges, 93 community-reported launch challenges, and unpublished Season 1 entries. Confirm reported requirements in-game.</div>`;}
function camoDetails(w,c){
if(c.type==='Military'){let i=Number(c.id.split('-')[1])-1;let lev=w.military[i];return {name:c.name,meta:lev?`Weapon level ${lev}`:'Level not verified',hint:'Military progression · community-reported level',confidence:lev?'community':'not-published'};}
if(c.type==='Special'){let i=Number(c.id.split('-')[1])-1,s=w.specials[i];let r=state.mode==='Warzone'?s.warzone:state.mode==='DMZ'?s.dmz:s.mp;let fallback=state.mode==='Warzone'?'Warzone requirement not verified':'Requirement not published';return {name:s.name,meta:r||fallback,hint:s.level?'Challenge opens near weapon level '+s.level:'Challenge level unconfirmed',confidence:s.confidence};}
if(c.id==='gold')return {name:'Gold',meta:state.mode==='DMZ'?'100 eliminations in one DMZ deployment':state.mode==='MW4'?'15 eliminations in one Multiplayer match':'Warzone requirement: consult in-game challenge',hint:'Unlock after all eight Military + three Special camos',confidence:'official'};
if(c.id==='platinum')return {name:'Platinum',meta:CLASS_GOALS[w.category][0]+' · check your mode for the required count',hint:'Requires Gold for all required weapons in this class',confidence:'official'};
if(c.id==='harmonic-break')return {name:'Harmonic Break',meta:CLASS_GOALS[w.category][1]+' · check your mode for the required count',hint:'Requires Platinum on all 33 launch weapons',confidence:'official'};
return {name:c.name,meta:'Weapon Prestige reward',hint:'Earned through weapon max-level and prestige progression',confidence:'official'};
}
function camoTile(w,c){const d=camoDetails(w,c),checked=has(w,c.id),trackable=c.type==='Special'||c.type==='Completionist',v=counter(w,c.id),amount=v.target?Math.min(100,Math.round(100*v.value/v.target)):0;return `<div class="camo-block"><button type="button" class="camo-tile ${checked?'done':''}" data-action="camo" data-weapon="${w.id}" data-camo="${c.id}" aria-pressed="${checked}" title="${esc(d.hint)}"><span class="check">${checked?'✓':''}</span><span class="camo-title">${esc(d.name)}</span><span class="camo-meta">${esc(d.meta)}</span><span class="camo-meta provenance">${d.confidence==='official'?'● OFFICIAL':d.confidence==='community'?'◐ COMMUNITY DATA':'○ UNPUBLISHED'}</span></button>${trackable?`<div class="camo-counter"><label>DONE<input type="number" min="0" max="100000" inputmode="numeric" value="${v.value}" data-counter="value" data-weapon="${w.id}" data-camo="${c.id}" aria-label="${esc(d.name)} progress"></label><span class="counter-separator">/</span><label>TARGET<input type="number" min="0" max="100000" inputmode="numeric" value="${v.target||''}" placeholder="—" data-counter="target" data-weapon="${w.id}" data-camo="${c.id}" aria-label="${esc(d.name)} target"></label><div class="counter-bar" role="progressbar" aria-valuenow="${amount}" aria-valuemin="0" aria-valuemax="100" aria-label="Challenge progress"><span style="width:${amount}%"></span></div></div>`:''}</div>`;}
function weaponTabs(w,active){return `<div class="panel-tabs"><a href="#/weapon/${w.id}" class="${active==='camo'?'active':''}">◫ CAMO TRACKER</a><a href="#/build/${w.id}" class="${active==='build'?'active':''}">⚒ LOADOUT BUILDER</a><a href="#/patches">▤ PATCH HISTORY</a></div>`;}
function weaponHeading(w,active){let count=countWeapon(w);return `<a class="back" href="#/weapons">← BACK TO ARSENAL</a><div class="detail-header"><div><div class="eyebrow">WEAPON INTEL / ${esc(w.category.toUpperCase())}</div><h1 class="page-title">${esc(w.name)}</h1><div class="summary-mini">${tag(w.season==='Launch'?'LAUNCH':'SEASON 1',w.season==='Launch'?'subtle':'blue')}${tag(w.maxLevel?'MAX LVL '+w.maxLevel:'MAX LVL UNVERIFIED')}${tag(count+' / '+CAMOS.length+' CAMOS',count===CAMOS.length?'lime':'subtle')}</div></div><div style="min-width:200px;width:min(100%,290px);align-self:center"><div class="progress-label"><b>COMPLETION</b><b>${pct(count,CAMOS.length)}%</b></div>${progressBar(pct(count,CAMOS.length))}</div></div>${weaponTabs(w,active)}`;}
function renderWeapon(w){if(!w)return renderNotFound();let n=Number(state.levels[w.id]||0);return `${weaponHeading(w,'camo')}<div class="grid-2 detail-grid" style="margin-bottom:15px"><div class="card"><h2 class="card-title">YOUR WEAPON PROGRESS</h2><p class="lede">Tick a camo only after unlocking it in-game. For Special and Completionist challenges, set a manual target and update your count as you play.</p><div class="summary-mini">${tag(state.mode+' CHALLENGES','lime')}${tag('8 MILITARY · 3 SPECIAL · 3 COMPLETIONIST · 4 PRESTIGE')}</div></div><div class="card"><h2 class="card-title">WEAPON LEVEL</h2><div style="display:flex;gap:7px"><input class="field" id="weaponLevel" type="number" min="0" max="999" value="${n}" aria-label="Weapon level"><button class="btn small btn-primary" data-action="sync-level" data-weapon="${w.id}">SAVE LEVEL</button></div><div class="micro" style="margin-top:9px">Save your level for planning. Level thresholds never auto-complete camo challenges.</div></div></div>
<div class="note warn">The camo grind is shared across modes, but required kill counts can differ. ${state.mode==='Warzone'?'Warzone-specific Special challenge counts have not been verified in this starter dataset; check in-game before planning.':'Unverified rows come from community reports, not Activision.'} Platinum and Harmonic Break gates are indicative and may change for seasonal weapons.</div>
${[['Military','MILITARY CAMOS','Eight levels tied to weapon progression'],['Special','SPECIAL CAMOS','Unique challenge requirements per weapon'],['Completionist','COMPLETIONIST CAMOS','Gold, Platinum and Harmonic Break'],['Prestige','WEAPON PRESTIGE','Four Pyroclast rewards']].map(([type,title,subtitle])=>`<section class="camo-group"><div class="camo-group-head"><div><h3>${title}</h3><div class="micro">${subtitle}</div></div><span class="micro">${CAMOS.filter(c=>c.type===type&&has(w,c.id)).length} / ${CAMOS.filter(c=>c.type===type).length}</span></div><div class="camo-grid">${CAMOS.filter(c=>c.type===type).map(c=>camoTile(w,c)).join('')}</div></section>`).join('')}
<div class="card"><h3 class="card-title">Challenge data sources</h3><p class="lede">Official rules: <a class="source-link" target="_blank" rel="noopener" href="https://www.callofduty.com/blog/2026/10/call-of-duty-modern-warfare-4-ready-for-launch-progression-prestige">Call of Duty Progression & Prestige ↗</a>. Community-reported challenge names and levels: <a class="source-link" target="_blank" rel="noopener" href="https://mw4camotracker.com/guides/special-camo-challenges">MW4 Camo Tracker ↗</a>. Missing counts stay unpublished rather than estimated.</p></div>`;}
function renderMastery(){let gold=countTier('gold'),plat=baseWeapons.filter(w=>has(w,'platinum')).length,hb=baseWeapons.filter(w=>has(w,'harmonic-break')).length;
return `${intro('ENDGAME PROGRESSION','THE <em>MASTERY</em> ROADMAP.','Finish the launch arsenal to move from Gold to Platinum, Harmonic Break, and Divergence. Track separate mastery camos in Multiplayer, DMZ, and Warzone.')}
<div class="stats"><div class="stat"><div class="stat-label">GOLD / ALL WEAPONS</div><div class="stat-value">${gold}<span class="micro"> / ${WEAPONS.length}</span></div></div><div class="stat"><div class="stat-label">PLATINUM / LAUNCH</div><div class="stat-value">${plat}<span class="micro"> / 33</span></div></div><div class="stat"><div class="stat-label">HARMONIC / LAUNCH</div><div class="stat-value">${hb}<span class="micro"> / 33</span></div></div><div class="stat"><div class="stat-label">DIVERGENCE ELIGIBLE</div><div class="stat-value">${hb>=33?'YES':'NO'}</div><div class="stat-foot">${Math.max(0,33-hb)} more launch weapons</div></div></div>
<div class="section"><div class="section-head"><div><h2 class="section-title">CLASS CHALLENGE GATES</h2><span class="section-sub">Gold in each weapon class unlocks its Platinum grind</span></div></div><div class="weapon-grid">${categories.map(cat=>{let ws=baseWeapons.filter(w=>w.category===cat),done=ws.filter(w=>has(w,'gold')).length;return `<div class="class-card"><div class="class-title">${esc(cat)} <span style="font-size:13px;color:var(--lime)">${done} / ${ws.length}</span></div>${progressBar(pct(done,ws.length))}<div class="class-hint">Platinum challenge: ${esc(CLASS_GOALS[cat][0])}<br>Harmonic Break: ${esc(CLASS_GOALS[cat][1])}</div><button class="btn small" data-action="set-class" data-category="${esc(cat)}">VIEW CLASS WEAPONS ↗</button></div>`;}).join('')}</div></div>
<div class="section"><div class="section-head"><div><h2 class="section-title">ACCOUNT-WIDE CAMOS</h2><span class="section-sub">Check once per account, not once per weapon</span></div></div><div class="milestone-grid">${ACCOUNT.map(c=>{let done=!!state.accounts[c.id];return `<div class="milestone ${done?'complete':''}"><div style="display:flex;justify-content:space-between;align-items:center">${tag(c.mode,c.mode==='Warzone'?'blue':c.mode==='MW4'?'lime':c.mode==='DMZ'?'gold':'subtle')}<span class="smallcaps">${done?'COMPLETED':'UNLOCKED? TRACK BELOW'}</span></div><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><button class="btn small ${done?'btn-primary':'btn-outline'}" data-action="account" data-camo="${c.id}">${done?'✓ COMPLETED':'MARK COMPLETE'}</button></div>`;}).join('')}</div><div class="note">The Divergence requirement is 33 Harmonic Break completions from the 33 launch weapons. Seasonal additions remain independently trackable. An unlocked account camo is never checked automatically: confirm it in-game first.</div></div>`;}
function renderLoadouts(){
  const saved = Object.keys(state.builds).filter(k=>k.split('|').length>=2).length;
  return `${intro('GUNSMITH / WEAPON ENGINE','THE <em>LOADOUT</em> LAB.','Build for low recoil, fast TTK, long-range control, mobility, stealth and more. Select any of the 35 MW4 weapons; save each goal separately for Warzone, MW4 or DMZ.')}
  <div class="v15-quick-links"><a href="#/class-builder" class="btn btn-primary">▣ COMPLETE LOADOUT</a><a href="#/compare" class="btn btn-outline">≍ WEAPON COMPARISON</a><a href="#/doctor" class="btn btn-outline">✦ PATCH LOADOUT DOCTOR</a></div><div class="intel-grid"><div class="intel-mini"><div class="smallcaps">BUILD MODES</div><div class="number">09</div><small>Nine goals with one-click compatible suggestions</small></div><div class="intel-mini"><div class="smallcaps">COMPATIBLE WEAPONS</div><div class="number">${WEAPONS.length}</div><small>Weapon-specific categories and Apex slots</small></div><div class="intel-mini"><div class="smallcaps">YOUR SAVED BUILDS</div><div class="number">${saved}</div><small>Preserved locally. Export in Data & Settings.</small></div></div>
  <div class="command-banner"><div><div class="eyebrow">WEAPON LAB / START A BUILD</div><h2>SELECT YOUR WEAPON</h2><p>Select a weapon and one of nine build goals, then choose from its listed attachment categories and named options. No typing attachment names.</p></div><select class="select" id="loadoutWeaponSelect" aria-label="Select weapon"><option value="">Choose any weapon...</option>${WEAPONS.map(w=>`<option value="${w.id}">${esc(w.name)} · ${esc(w.category)}</option>`).join('')}</select></div>
  <div class="section"><div class="section-head"><h2 class="section-title">GOALS / TUNING PROFILES</h2><span class="section-sub">35 weapons · 30 configurable · 5 without Gunsmith</span></div><div class="templates">${Object.keys(TEMPLATES).map(g=>`<div class="template-card"><strong>${esc(g)}</strong><span>${esc(TEMPLATES[g])}</span></div>`).join('')}</div></div>
  <div class="section-head section"><h2 class="section-title">SOURCED STARTER BUILDS</h2><span class="section-sub">Named attachments only where independently published</span></div><div class="weapon-grid">${SEEDS.filter(s=>s.mode===state.mode).map(s=>{let w=WEAPONS.find(w=>w.id===s.weapon);if(!w)return '';return `<article class="weapon-card"><div class="weapon-top">${tag(w.category,'blue')}${tag('SOURCED EXAMPLE')}</div><h3 class="weapon-name">${esc(w.name)}</h3><p class="lede">${esc(s.name)}</p><div class="micro">${Object.keys(s.slots).length} named attachments · ${fmtDate(s.updated)}</div><div class="weapon-bottom"><a class="btn small btn-primary" href="#/build/${w.id}">OPEN GUNSMITH ↗</a></div></article>`;}).join('')||'<div class="empty">No verified named examples for this mode. All weapons still have strategy-driven builders.</div>'}</div>
  <div class="note warn">Strategy priorities are not measured recoil, damage or TTK data. “Low recoil” does not guarantee zero recoil, and Fast TTK does not claim a mathematically fastest attachment combination.</div>`;
}
function goalId(w){return w.id+'|'+state.mode;}
function activeGoal(w){let g=state.activeGoals[goalId(w)]||'Balanced';return Object.hasOwn(TEMPLATES,g)?g:'Balanced';}
function buildKey(w){return goalId(w)+'|'+activeGoal(w);}
function getBuild(w){return state.builds[buildKey(w)]||(activeGoal(w)==='Balanced'?state.builds[goalId(w)]:null)||null;}
function getSeed(w,mode){return SEEDS.find(s=>s.weapon===w.id&&s.mode===mode)||null;}
function gunSpec(w){return GUNSMITH.specs[w.id]||{types:[],source:'unknown',apex:null,blocked:[]};}
function availableTypes(w,apex=false){const spec=gunSpec(w);return spec.types.filter(t=>!apex||!spec.blocked.includes(t));}
function namedOptions(w,type){return (GUNSMITH.items||[]).filter(item=>item.type===type&&item.weapons.includes(w.id));}
function validRows(w,slots,apex=false){const out={};for(const [type,value] of Object.entries(slots||{})){if(!availableTypes(w,apex).includes(type)||Object.keys(out).length>=5||Object.hasOwn(out,type))continue;const raw=String(value||'').slice(0,100);const match=namedOptions(w,type).find(x=>x.name.toLowerCase()===raw.toLowerCase());out[type]=match?match.name:raw;}return out;}
const GOAL_SLOT_ORDER = {
  'Balanced':['Muzzle','Underbarrel','Barrel','Magazine','Optic','Stock','Rear Grip','Laser','Ammunition','Comb','Bolt','Trigger Action','Guard','Fire Mods','Cylinder'],
  'Fast TTK':['Barrel','Ammunition','Muzzle','Underbarrel','Rear Grip','Laser','Magazine','Optic','Stock','Bolt','Trigger Action','Comb'],
  'Low Recoil':['Muzzle','Underbarrel','Stock','Rear Grip','Barrel','Optic','Laser','Ammunition','Magazine','Comb','Bolt'],
  'Aggressive':['Rear Grip','Stock','Laser','Barrel','Magazine','Muzzle','Underbarrel','Optic','Trigger Action','Bolt','Comb'],
  'Long Range':['Barrel','Optic','Muzzle','Ammunition','Underbarrel','Stock','Rear Grip','Comb','Bolt','Magazine'],
  'Hipfire':['Laser','Stock','Rear Grip','Underbarrel','Magazine','Muzzle','Barrel','Ammunition','Trigger Action'],
  'Stealth':['Muzzle','Laser','Stock','Barrel','Rear Grip','Ammunition','Optic','Magazine'],
  'Quickscope':['Optic','Laser','Rear Grip','Stock','Bolt','Barrel','Muzzle','Comb','Trigger Action'],
  'Squad Support':['Magazine','Underbarrel','Muzzle','Barrel','Ammunition','Stock','Optic','Rear Grip']
};
function generateSlots(w,goal,apex=false){let types=availableTypes(w,apex),chosen={};let order=GOAL_SLOT_ORDER[goal]||GOAL_SLOT_ORDER.Balanced;
  for(const type of order){if(Object.keys(chosen).length>=5)break;if(!types.includes(type))continue;let options=namedOptions(w,type);if(!options.length)continue;options=[...options].sort((a,b)=>Number(b.goals.includes(goal))-Number(a.goals.includes(goal))||Number(b.sourceType==='official')-Number(a.sourceType==='official')||a.name.localeCompare(b.name));chosen[type]=options[0].name;}
  return chosen;
}
function defaultSlots(w){let seed=getSeed(w,state.mode),goal=activeGoal(w);if(goal==='Balanced'&&seed){return validRows(w,seed.slots,false);}return generateSlots(w,goal,false);}
function currentBuild(w){const stored=builderDrafts[buildKey(w)]||getBuild(w);return stored?{...stored,slots:validRows(w,stored.slots,!!stored.apex)}:{name:w.name+' · '+activeGoal(w)+' / '+state.mode,template:activeGoal(w),slots:defaultSlots(w),apex:false,perks:'',tactical:'',lethal:'',notes:'',userSaved:false};}
function stashDraft(w,changes={}){const b=collectBuild(w);builderDrafts[buildKey(w)]={...b,...changes,userSaved:false};}
function rerenderBuilderPreservePosition(){const scroll=window.scrollY;render();window.scrollTo({top:scroll,behavior:'instant'});}
function optionStatus(item){return item.sourceType==='official'?'Official name · reported compatibility':'Community-reported';}
function renderSlotRows(w,b){let spec=gunSpec(w),slots=Object.entries(validRows(w,b.slots,b.apex)),allowed=availableTypes(w,b.apex),used=slots.map(([type])=>type);
  if(!allowed.length)return `<div class="gs-empty"><strong>NO TRADITIONAL GUNSMITH</strong><p>Launchers and melee weapons do not support standard attachments. You can still track their camouflages.</p></div>`;
  return `<div class="gs-slot-list" id="gsSlotList">${slots.map(([type,value],index)=>{
    let opts=namedOptions(w,type),legacy=value&&!opts.some(x=>x.name===value),item=opts.find(x=>x.name===value),remaining=allowed.filter(x=>x===type||!used.includes(x));
    return `<div class="gs-slot-row" data-slot-row="${index}"><div class="gs-slot-number">${String(index+1).padStart(2,'0')}</div><div class="gs-slot-fields"><label class="gs-mini-label">ATTACHMENT CATEGORY<select class="select gs-type" data-gs-index="${index}" aria-label="Attachment category ${index+1}">${remaining.map(t=>`<option value="${esc(t)}" ${type===t?'selected':''}>${esc(t)}</option>`).join('')}</select></label><label class="gs-mini-label">COMPATIBLE ATTACHMENT<select class="select gs-item" data-gs-index="${index}" aria-label="Attachment choice for ${esc(type)}"><option value="">— Choose attachment —</option>${legacy?`<option selected value="${esc(value)}">${esc(value)} (legacy · unverified)</option>`:''}${opts.map(item=>`<option value="${esc(item.name)}" ${item.name===value?'selected':''}>${esc(item.name)}</option>`).join('')}</select></label><div class="gs-item-context">${item?`<span class="gs-proof ${item.sourceType==='official'?'is-official':''}">${optionStatus(item)}</span><span>${esc(item.goals.join(' · '))}</span><a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">Source ↗</a>`:legacy?'<span class="gs-proof">Legacy selection • not confirmed in this catalog</span>':opts.length?`<span>${opts.length} reported compatible options for ${esc(w.name)}</span>`:'<span>Names for this category are not yet confirmed for this weapon</span>'}</div></div><button type="button" class="gs-remove" data-action="gs-remove" data-weapon="${w.id}" data-index="${index}" aria-label="Remove ${esc(type)} attachment" title="Remove attachment">×</button></div>`;}).join('')}</div><div class="gs-slot-actions"><button class="btn btn-outline small" data-action="gs-add" data-weapon="${w.id}" ${slots.length>=5||allowed.every(type=>used.includes(type))?'disabled':''}>+ ADD ATTACHMENT</button><button class="btn btn-outline small" data-action="gs-generate" data-weapon="${w.id}">✦ BUILD FOR ${esc(activeGoal(w).toUpperCase())}</button><button class="btn btn-quiet small" data-action="gs-clear" data-weapon="${w.id}" ${slots.length===0?'disabled':''}>CLEAR ALL</button></div><div class="gs-slot-footer"><strong>${slots.filter(x=>x[1]).length}<span> / 5</span></strong> named attachments equipped <span class="gs-slot-footnote">${slots.length} standard categories used · one item per category</span></div>`;
}
function weaponPatchMentions(w){let name=w.name.toLowerCase(),patterns=[name,name.replaceAll('-',' ')];return PATCHES.filter(p=>(p.sections||[]).some(s=>(s.points||[]).some(t=>patterns.some(pattern=>t.toLowerCase().includes(pattern))))).slice(0,3);}

function activeModeOptions(){return INTEL.options?.[state.mode]||{perks:[[],[],[]],tactical:[],lethal:[],field:[]};}
function safeDateTime(text){let date=Date.parse(text||'');return Number.isFinite(date)?date:0;}
function patchesForWeapon(w,since=''){
 const name=w.name.toLowerCase(), alternatives=[name,name.replaceAll('-',' ')];
 const sinceDate=safeDateTime(since);
 return PATCHES.filter(p=>{
   if(sinceDate&&safeDateTime(p.date+'T23:59:59Z')<sinceDate)return false;
   return (p.sections||[]).some(section=>(section.points||[]).some(point=>{
     const line=String(point).toLowerCase();
     return alternatives.some(n=>line.includes(n))||(/all (ballistic|bullet) weapons/.test(line));
   }));
 }).sort((a,b)=>b.date.localeCompare(a.date));
}
function reviewKey(buildKeyValue,patch){return buildKeyValue+'|'+patch.id;}
function pendingReviews(buildKeyValue,w,build){return patchesForWeapon(w,build.savedAt).filter(p=>!state.reviewedPatches[reviewKey(buildKeyValue,p)]);}
function doctorSummary(buildKeyValue,w,build){
 const matches=pendingReviews(buildKeyValue,w,build);
 return matches.length?tag(matches.length+' PATCH'+(matches.length===1?'':'ES')+' TO REVIEW','gold'):tag('NO PENDING MATCHES','subtle');
}
function renderDoctor(){
 const entries=Object.entries(state.builds).map(([key,build])=>({key,build,w:WEAPONS.find(w=>w.id===key.split('|')[0]),mode:key.split('|')[1]})).filter(x=>x.w);
 const pending=entries.reduce((sum,x)=>sum+pendingReviews(x.key,x.w,x.build).length,0);
 return `${intro('ARMORY INTELLIGENCE / PATCH REVIEW','THE <em>LOADOUT DOCTOR.</em>','Review official weapon changes affecting your saved builds. We flag matching patch text; we do not automatically claim a build is nerfed or broken.')}
 <div class="intel-grid"><div class="intel-mini"><div class="smallcaps">SAVED BLUEPRINTS</div><div class="number">${entries.length}</div><small>Across MW4, Warzone and DMZ</small></div><div class="intel-mini"><div class="smallcaps">UNREVIEWED NOTICES</div><div class="number">${pending}</div><small>Matching patch records since each save</small></div><div class="intel-mini"><div class="smallcaps">SOURCE</div><div class="number">COD</div><small>Publisher changelog summaries with original links</small></div></div>
 <div class="note warn">A match is a review reminder, not proof of a buff, nerf, or invalid attachment. Global ballistic changes can affect all weapons. The daily updater discovers new patch records; it does not recalculate unverified weapon statistics.</div>
 <div class="v15-stack">${entries.length?entries.map(({key,build,w,mode})=>{
   const matches=pendingReviews(key,w,build),archived=patchesForWeapon(w,build.savedAt).length-matches.length;
   return `<section class="card v15-doctor-card"><div class="v15-flex"><div><div class="eyebrow">${esc(mode)} · ${esc(build.template||'Balanced')}</div><h2 class="card-title">${esc(w.name)} · ${esc(build.name||'Blueprint')}</h2><div class="micro">Saved ${build.savedAt?esc(new Date(build.savedAt).toLocaleDateString()):'on an unknown date'} · ${archived} reviewed</div></div>${doctorSummary(key,w,build)}</div>
   ${matches.length?`<div class="v15-stack">${matches.slice(0,6).map(p=>{
     const lines=(p.sections||[]).flatMap(section=>section.points||[]).filter(point=>{let text=String(point).toLowerCase();return text.includes(w.name.toLowerCase())||text.includes(w.name.toLowerCase().replaceAll('-',' '))||/all (ballistic|bullet) weapons/.test(text)});
     return `<div class="v15-patch-row"><div><strong>${esc(p.title)}</strong> ${tag(p.game,'blue')}<div class="micro">${esc(p.date)} · ${esc((lines[0]||'Weapon change — check source').slice(0,220))}</div><a href="#/patch/${encodeURIComponent(p.id)}" class="source-link">Patch details ↗</a></div><button class="btn btn-outline small" data-action="review-patch" data-key="${esc(key)}" data-patch="${esc(p.id)}">MARK REVIEWED</button></div>`;
   }).join('')}</div>`:'<p class="micro">No unreviewed matching updates found. New patches can appear after the next daily sync.</p>'}
   <a class="btn btn-outline small" href="#/build/${esc(w.id)}">OPEN GUNSMITH ↗</a></section>`;
 }).join(''):'<div class="empty">Save a weapon blueprint in the Loadout Lab to start tracking patch impact.</div>'}</div>`;
}
function renderBuildAdvisor(w,b){
 const key=buildKey(w),pending=pendingReviews(key,w,b);
 const ranked=Object.entries(b.slots||{}).filter(([t,n])=>Boolean(n)).map(([type,name])=>({type,name,item:namedOptions(w,type).find(x=>x.name===name)}));
 return `<div class="gs-info-panel v15-brief"><div class="eyebrow">SMART GUNSMITH · LOADOUT DOCTOR</div><h3>WHY THESE ATTACHMENTS?</h3><p>Recommendations prioritize <b>${esc(activeGoal(w))}</b>. Results are editorial preferences, not measured TTK or recoil.</p>
 <div class="v15-stack">${ranked.length?ranked.map(row=>`<div class="v15-why"><b>${esc(row.type)}</b><span>${esc(row.name)}</span><small>${row.item?`${row.item.goals.includes(activeGoal(w))?'Matches current tuning goal':'Compatible reported choice'} · ${esc(row.item.sourceType==='official'?'official name':'community report')}`:'Legacy or unverified entry'}</small></div>`).join(''):'<span class="micro">No attachments selected yet.</span>'}</div>
 <div class="v15-flex">${tag(pending.length+' PATCH REVIEWS','gold')}<a href="#/doctor" class="source-link">Review updates ↗</a></div></div>`;
}
function renderCamoAssistant(){
 const focus=WEAPONS.find(w=>w.id===state.focusWeapon),order=rankedWeapons(),target=focus||order[0]?.w;
 const recommended=order.slice(0,assistantSize),remaining=target?CAMOS.filter(c=>!has(target,c.id)):[];
 const tasks=target?[...remaining.filter(c=>c.type==='Military').slice(0,1),...remaining.filter(c=>c.type==='Special'),...remaining.filter(c=>c.type==='Completionist'),...remaining.filter(c=>c.type==='Prestige')].slice(0,assistantSize):[];
 return `${intro('MISSION CONTROL / PERSONAL ASSISTANT','YOUR <em>CAMO ASSISTANT.</em>','Prioritizes incomplete weapon challenges based on saved progress. Challenge counts remain manual and only you confirm unlocks.')}
 <div class="v15-flex"><span class="smallcaps">YOUR NEXT SESSION</span><label class="field-label">SHOW TASKS <select id="assistantSize" class="select">${[2,3,5].map(n=>`<option value="${n}" ${assistantSize===n?'selected':''}>${n} objectives</option>`).join('')}</select></label></div>
 ${target?`<section class="card v15-focus"><div class="eyebrow">FOCUSED WEAPON</div><h2>${esc(target.name)}</h2><p class="lede">${esc(target.category)} · ${countWeapon(target)} / ${CAMOS.length} camouflages unlocked</p><a class="btn btn-outline small" href="#/weapon/${esc(target.id)}">FULL CAMO TRACKER ↗</a><div class="v15-stack">${tasks.map(c=>{
   const d=camoDetails(target,c),v=counter(target,c.id);
   return `<div class="v15-task"><div><strong>${esc(d.name)}</strong><div class="micro">${esc(d.meta)} · ${d.confidence==='official'?'Official source':d.confidence==='community'?'Community report':'Unverified'}</div>${v.target?`<div class="micro">Counter: ${v.value}/${v.target}</div>`:''}</div><div class="v15-task-actions">${c.type!=='Military'?`<button class="btn btn-outline small" data-action="quick-count" data-weapon="${esc(target.id)}" data-camo="${esc(c.id)}" title="Increase your manual progress by one">+1 COUNT</button>`:''}<button class="btn btn-primary small" data-action="assistant-complete" data-weapon="${esc(target.id)}" data-camo="${esc(c.id)}">MARK UNLOCKED</button></div></div>`;
 }).join('')}</div></section>`:'<div class="empty">All tracked weapon objectives are completed.</div>'}
 <div class="section"><div class="section-head"><h2 class="section-title">RECOMMENDED WEAPONS</h2><span class="micro">Favorites and near-Gold progress rise to the top</span></div><div class="v15-stack">${recommended.map(({w,objective})=>`<article class="v15-recommend"><div><strong>${esc(w.name)}</strong><div class="micro">${esc(objective.label)} · ${baseDone(w)} / 11 base camos</div></div><button class="btn small btn-outline" data-action="focus" data-weapon="${esc(w.id)}">${w.id===state.focusWeapon?'UNPIN':'PIN FOCUS'}</button><a class="btn small" href="#/weapon/${esc(w.id)}">VIEW ↗</a></article>`).join('')}</div></div>
 <div class="note">The +1 button changes a manual counter only. It never assumes an unlock or imports gameplay data. Enter target counts on the weapon’s camo page first for accurate progress percentages.</div>`;
}
function gearSelect(id,label,values,current,field=''){
 const items=[...new Set((values||[]).filter(Boolean))];
 if(current&&!items.includes(current))items.unshift(current);
 return `<label class="field-label">${esc(label)}<select id="${id}" class="select"><option value="">Not selected</option>${items.map(text=>`<option value="${esc(text)}" ${current===text?'selected':''}>${esc(text)}</option>`).join('')}</select>${items.length===0?'<span class="micro">No verified named options available for this mode</span>':''}</label>`;
}
function classByMode(){return state.classConfigs[state.mode]||{};}
function renderClassBuilder(){
 const load=classByMode(),sets=activeModeOptions(),ids=WEAPONS.filter(w=>w.id!==load.primary),perks=sets.perks||[[],[],[]];
 const savedCount=Object.values(state.classConfigs).filter(x=>x&&x.savedAt).length;
 return `${intro('COMPLETE CLASS / WARZONE + MW4','FULL <em>LOADOUT CREATOR.</em>','Pair primary and secondary weapons with class equipment. Switch game modes to keep a separate class for each game.')}
 <div class="v15-flex"><div>${tag(state.mode,'lime')}${tag(savedCount+' MODE PRESETS SAVED','subtle')}</div><div class="filter-chips">${['Warzone','MW4','DMZ'].map(mode=>`<button data-action="mode" data-mode="${mode}" class="chip ${state.mode===mode?'active':''}">${mode}</button>`).join('')}</div></div>
 <section class="v15-class-grid"><div class="card v15-stack"><h2 class="card-title">WEAPON SLOTS</h2><label class="field-label">CLASS NAME<input id="className" class="field" maxlength="80" value="${esc(load.name||state.mode+' Operator Class')}" aria-label="Class name"></label>
 <label class="field-label">PRIMARY WEAPON<select id="classPrimary" class="select"><option value="">Choose primary</option>${WEAPONS.filter(w=>!['Pistols','Launchers','Melee'].includes(w.category)).map(w=>`<option value="${esc(w.id)}" ${w.id===load.primary?'selected':''}>${esc(w.name)} · ${esc(w.category)}</option>`).join('')}</select></label>
 <label class="field-label">SECONDARY WEAPON<select id="classSecondary" class="select"><option value="">Choose secondary</option>${WEAPONS.filter(w=>w.id!==load.primary).map(w=>`<option value="${esc(w.id)}" ${w.id===load.secondary?'selected':''}>${esc(w.name)} · ${esc(w.category)}</option>`).join('')}</select></label>
 <div class="note">Weapon choices are limited to the MW4 catalog; the legacy Warzone arsenal isn't yet included. Per-weapon Gunsmith builds remain saved independently by mode and goal.</div>
 <div class="v15-flex"><a class="btn btn-outline small" href="${load.primary?'#/build/'+encodeURIComponent(load.primary):'#/loadouts'}">EDIT PRIMARY ATTACHMENTS ↗</a>${load.secondary?`<a class="btn btn-outline small" href="#/build/${esc(load.secondary)}">EDIT SECONDARY ↗</a>`:''}</div></div>
 <div class="card v15-stack"><h2 class="card-title">PERKS & EQUIPMENT</h2>${state.mode==='Warzone'?`<div class="v15-presets"><span class="smallcaps">ONE-CLICK PLAYSTYLE PRESETS</span><div class="v15-flex">${['Aggressive','Stealth','Squad Support'].map(name=>`<button class="btn btn-outline small" type="button" data-action="class-preset" data-preset="${esc(name)}">✦ ${esc(name)}</button>`).join('')}</div></div>`:''}<div class="v15-gear-grid">${perks.slice(0,3).map((items,i)=>gearSelect('classPerk'+(i+1),'PERK SLOT '+(i+1),items,load['perk'+(i+1)]||'')).join('')}${gearSelect('classTactical','TACTICAL',sets.tactical,load.tactical||'')}${gearSelect('classLethal','LETHAL',sets.lethal,load.lethal||'')}${gearSelect('classField','FIELD UPGRADE',sets.field,load.field||'')}</div>
 <div class="note warn">Only a limited set of equipment names is sourced so far, not the complete in-game pool. Slots without confirmed options stay empty rather than showing invented choices. Warzone perk slots shown here follow the official Season 1 categories. Verify unlocks and playlists in-game before equipping.</div>
 <a class="source-link" href="${esc(INTEL.optionSource?.[state.mode]||'https://www.callofduty.com/patchnotes')}" target="_blank" rel="noopener noreferrer">Read official ${esc(state.mode)} equipment notes ↗</a></div></section>
 <div class="v15-flex section"><button class="btn btn-primary" data-action="save-class">✓ SAVE FULL LOADOUT</button><button class="btn btn-outline" data-action="copy-class">COPY CLASS</button><button class="btn btn-danger" data-action="clear-class">CLEAR CLASS</button></div>`;
}
function measurement(w){const record=state.weaponMeasurements[w.id+'|'+state.mode]||{};return Object.fromEntries(['ttkMs','adsMs','recoil','rangeM'].map(key=>[key,Number.isFinite(Number(record[key]))&&record[key]!==''&&record[key]!==undefined?Number(record[key]):null]));}
function renderMeasureCard(w){const m=measurement(w),base=INTEL.verifiedWeaponStats?.[w.id];return `<div class="card v15-stat-card"><div class="eyebrow">${esc(w.category)}</div><h2 class="card-title">${esc(w.name)}</h2><div class="v15-fact-grid"><span>MAX LEVEL</span><b>${w.maxLevel||'Unverified'}</b><span>NAMED ATTACHMENTS</span><b>${namedOptionsForWeapon(w)}</b><span>MEASURED TTK</span><b>${m.ttkMs===null?'—':m.ttkMs+' ms'}</b><span>ADS TIME</span><b>${m.adsMs===null?'—':m.adsMs+' ms'}</b><span>YOUR RECOIL SCORE</span><b>${m.recoil===null?'—':m.recoil+' / 10'}</b><span>YOUR EFFECTIVE RANGE</span><b>${m.rangeM===null?'—':m.rangeM+' m'}</b></div>
 <div class="v15-data-source"><b>OFFICIAL PATCH-PUBLISHED VALUES</b>${base?`<div class="v15-fact-grid">${base.facts.map(f=>`<span>${esc(f.label)}</span><b>${f.value} ${esc(f.unit)}</b>`).join('')}</div><a class="source-link" href="${esc(base.source)}" target="_blank" rel="noopener noreferrer">Publisher data (${esc(base.date)}) ↗</a>`:'<p class="micro">No weapon-specific numeric stats available in the verified dataset. Missing data is not estimated.</p>'}</div>
 <div class="v15-gear-grid">${[['ttkMs','YOUR TESTED TTK (MS)'],['adsMs','YOUR TESTED ADS (MS)'],['recoil','YOUR RECOIL SCORE (0–10)'],['rangeM','YOUR EFFECTIVE RANGE (M)']].map(([key,label])=>`<label class="field-label">${label}<input class="field" type="number" min="0" max="${key==='recoil'?10:100000}" step="${key==='recoil'?'0.1':'1'}" data-measure="${key}" data-weapon="${esc(w.id)}" value="${m[key]===null?'':m[key]}" placeholder="Not measured"></label>`).join('')}</div></div>`;}
function renderCompare(){const a=WEAPONS.find(w=>w.id===compareIds[0])||WEAPONS[0],b=WEAPONS.find(w=>w.id===compareIds[1])||WEAPONS[1];
 const picker=(id,value)=>`<select id="${id}" class="select">${WEAPONS.map(w=>`<option value="${esc(w.id)}" ${value===w.id?'selected':''}>${esc(w.name)} · ${esc(w.category)}</option>`).join('')}</select>`;
 return `${intro('SOURCE-AWARE / WEAPON LAB','WEAPON <em>COMPARISON.</em>','Compare two weapons using publisher-confirmed specifications and your own optional in-game tests. No invented damage, recoil or TTK metrics.')}
 <div class="v15-compare-pickers"><label class="field-label">FIRST WEAPON${picker('compareA',a.id)}</label><label class="field-label">SECOND WEAPON${picker('compareB',b.id)}</label></div>
 <div class="v15-class-grid">${renderMeasureCard(a)}${renderMeasureCard(b)}</div>
 <div class="v15-flex section"><button class="btn btn-primary" data-action="save-measures">SAVE YOUR TEST RESULTS</button><button class="btn btn-outline" data-action="swap-compare">⇄ SWAP WEAPONS</button></div>
 <div class="note">All user-entered numbers are personal measurements, not official stats. TTK varies by mode, armor, range, hit location and patch. For complete verified numerical comparison more official or carefully tested data is needed.</div>`;
}
function renderMyBuilds(){
  let items=Object.entries(state.builds).map(([key,b])=>{let [id,mode,goal='Balanced']=key.split('|');return {key,b,w:WEAPONS.find(x=>x.id===id),mode,goal};}).filter(x=>x.w);
  return `${intro('VAULT / USER BLUEPRINTS','MY <em>BLUEPRINTS.</em>','Your saved blueprints live in this browser. Edit compatible attachments using dropdowns; previous manual entries are preserved as legacy selections.')}
  <div class="command-banner"><div><h2>${items.length} SAVED CONFIGURATIONS</h2><p>MW4 and Warzone builds are stored separately, including each performance goal.</p></div><a class="btn btn-primary" href="#/loadouts">+ CREATE NEW BUILD</a></div>
  ${items.length?`<div class="build-archive">${items.map(x=>`<article class="build-preset"><div>${tag(x.mode,'blue')} ${tag(x.goal,'lime')}<strong>${esc(x.w.name)} / ${esc(x.b.name)}</strong><small>${Object.values(x.b.slots||{}).filter(Boolean).length} filled attachment slots · ${x.b.savedAt?esc(new Date(x.b.savedAt).toLocaleDateString()):'Imported build'}</small></div><div class="build-actions"><button class="btn btn-outline small" data-action="open-saved" data-key="${esc(x.key)}">EDIT ↗</button><button class="btn btn-danger small" data-action="delete-build" data-key="${esc(x.key)}">DELETE</button></div></article>`).join('')}</div>`:'<div class="empty section">You have not saved a blueprint yet. Pick a weapon in the Loadout Lab and select a performance goal.</div>'}`;
}
function renderGoalComparison(goal,other){const a=GOAL_METRICS[goal],b=GOAL_METRICS[other];return `<div class="compare-columns"><div><span class="smallcaps">CURRENT PROFILE</span><h3>${esc(goal)}</h3></div><div><span class="smallcaps">COMPARE WITH</span><h3>${esc(other)}</h3></div></div><div class="compare-metrics">${GOAL_LABELS.map((label,i)=>`<div class="compare-row"><span>${esc(label)}</span><div class="compare-duo"><span class="compare-bar primary"><i style="width:${a[i]*20}%"></i></span><b>${a[i]}</b><span class="compare-bar secondary"><i style="width:${b[i]*20}%"></i></span><b>${b[i]}</b></div></div>`).join('')}</div><p class="micro">Priority estimates are editorial strategy weights (1–5), not measured in-game weapon stats. Your actual recoil and damage depend on the selected attachments and current patch.</p>`;}
function renderBuild(w){
 if(!w)return renderNotFound();
 const goal=activeGoal(w),b=currentBuild(w),spec=gunSpec(w),seed=getSeed(w,state.mode),custom=b.userSaved===true,mentions=weaponPatchMentions(w),count=Object.values(b.slots||{}).filter(Boolean).length,provisional=spec.source!=='official';
 return `${weaponHeading(w,'build')}
 <section class="gs-command" aria-label="Build goal selection"><div class="gs-command-heading"><div><div class="eyebrow">GUNSMITH / ${esc(w.name.toUpperCase())} / ${esc(state.mode.toUpperCase())}</div><h2>BUILD TO YOUR <em>PLAYSTYLE.</em></h2><p>Choose one of nine goals. Attachment categories, Apex restrictions and named options update for your weapon.</p></div><span class="gs-command-index">09<span> PROFILES</span></span></div><div class="gs-goal-picker" id="goalPicker">${Object.keys(TEMPLATES).map(t=>`<button class="gs-goal ${goal===t?'is-active':''}" data-action="goal" data-weapon="${w.id}" data-goal="${esc(t)}" aria-pressed="${goal===t}"><strong>${esc(t)}</strong><small>${t==='Low Recoil'?'CONTROL':t==='Fast TTK'?'HIT CONSISTENCY':t==='Quickscope'?'ADS + PRECISION':t==='Stealth'?'SUPPRESSION':t==='Squad Support'?'CAPACITY':t==='Hipfire'?'CLOSE RANGE':t==='Aggressive'?'MOVEMENT':t==='Long Range'?'RANGE + VELOCITY':'VERSATILITY'}</small></button>`).join('')}</div></section>
 <section class="gs-workspace"><div class="gs-main"><div class="gs-card-head"><div><div class="eyebrow">01 / CONFIGURE</div><h2>ATTACHMENT <span>WORKBENCH</span></h2></div>${tag(custom?'SAVED BLUEPRINT':provisional?'PROVISIONAL SLOTS':'OFFICIAL SLOT MAP',custom?'lime':'blue')}</div><p class="gs-intro">${esc(TEMPLATES[goal])} ${esc(ROLE[w.category])}</p>
 ${provisional?'<div class="gs-alert">Season 1 slot types are provisional. Compatible attachment names have not yet been verified for this weapon; the site will not offer invented parts.</div>':''}
 <div class="gs-field"><label for="buildName">BLUEPRINT NAME</label><input class="field" id="buildName" maxlength="100" value="${esc(b.name||w.name)}" placeholder="Your loadout name"></div>
 <div class="gs-apex-box"><div><div class="gs-apex-label">APEX ATTACHMENT <span>EXTRA SLOT</span></div><strong>${esc(spec.apex||'Not available / not verified')}</strong><p>${spec.apex?`Unlocks when ${esc(w.name)} reaches its maximum level. ${spec.blocked.length?`Blocks: ${esc(spec.blocked.join(', '))}.`:'No reported slot conflicts.'}`:'There is no compatible Apex item recorded for this weapon.'}</p></div><label class="gs-switch"><input type="checkbox" id="gsApex" ${b.apex?'checked':''} ${!spec.apex?'disabled':''} aria-label="Equip Apex attachment"><span></span></label></div>
 <div class="gs-list-head"><div><div class="eyebrow">STANDARD ATTACHMENTS</div><h3>CHOOSE FROM COMPATIBLE OPTIONS</h3></div><span class="gs-slot-counter">${count}/5 SELECTED</span></div>${renderSlotRows(w,b)}
 <div class="gs-class-head"><div class="eyebrow">02 / CLASS DETAILS</div><h3>YOUR EQUIPMENT</h3></div><div class="form-grid gs-form"><label class="field-label">PERKS<input class="field" id="buildPerks" maxlength="300" value="${esc(b.perks||'')}" placeholder="Perks"></label><label class="field-label">TACTICAL<input class="field" id="buildTactical" maxlength="150" value="${esc(b.tactical||'')}" placeholder="Tactical equipment"></label><label class="field-label">LETHAL<input class="field" id="buildLethal" maxlength="150" value="${esc(b.lethal||'')}" placeholder="Lethal equipment"></label></div><label class="field-label gs-notes">FIELD NOTES<textarea class="text-area" id="buildNotes" maxlength="5000" placeholder="Record how this build performs in game, including recoil and damage-range testing">${esc(b.notes||'')}</textarea></label>
 <div class="gs-save-actions"><button class="btn btn-primary" data-action="save-build" data-weapon="${w.id}">✓ SAVE BLUEPRINT</button><button class="btn btn-outline" data-action="copy-build" data-weapon="${w.id}">COPY SETUP</button>${seed?`<button class="btn btn-quiet" data-action="restore-seed" data-weapon="${w.id}">RESTORE PUBLISHED EXAMPLE</button>`:''}</div><p class="gs-terms">Up to five standard attachments, each from a different category. Apex sits outside those five; incompatible categories are removed when Apex is enabled.</p></div>
 <aside class="gs-aside"><div class="gs-status-panel"><div class="eyebrow">BLUEPRINT TELEMETRY</div><h3>${esc(goal.toUpperCase())}</h3><p>${esc(TEMPLATES[goal])}</p><div class="gs-priorities">${GOAL_LABELS.map((label,i)=>`<div><div><span>${esc(label)}</span><b>${GOAL_METRICS[goal][i]} / 5</b></div><span class="gs-hbar"><i style="width:${GOAL_METRICS[goal][i]*20}%"></i></span></div>`).join('')}</div><p class="gs-status-foot">Editorial priority scores, not measured weapon stats or guaranteed kill time.</p></div>
 <div class="gs-info-panel"><div class="eyebrow">WEAPON DATA / SOURCE</div><h3>${esc(w.name)}</h3><div class="gs-info-metrics"><span>${spec.types.length} available attachment categories</span><span>${namedOptionsForWeapon(w)} community/official named choices</span><span>${spec.apex?'1 weapon-specific Apex':'Apex not verified'}</span></div><a href="${esc(GUNSMITH.officialSource)}" target="_blank" rel="noopener noreferrer" class="source-link">Official MW4 Gunsmith rules ↗</a><a href="${esc(GUNSMITH.communitySource)}" target="_blank" rel="noopener noreferrer" class="source-link">Reported attachment catalog ↗</a><p>Named attachments from community reports are not a complete, publisher-verified inventory. Availability can change with patches and unlocks.</p></div>
 ${renderBuildAdvisor(w,b)}
 <div class="gs-info-panel"><div class="eyebrow">PATCH CONTEXT</div>${mentions.length?mentions.map(p=>`<a class="gs-patch-link" href="#/patch/${p.id}">${esc(p.title)} ↗</a>`).join(''):'<p>No weapon-specific patch summary matches found in the local archive.</p>'}<a class="btn btn-outline gs-camo-link" href="#/weapon/${w.id}">VIEW CAMO CHALLENGES</a></div></aside></section>
 <section class="compare-panel gs-compare"><div class="compare-title"><div><div class="eyebrow">03 / TRADEOFF PLANNING</div><h2 class="section-title">COMPARE TWO BUILD GOALS</h2></div><label>COMPARE AGAINST<select class="select" id="compareGoal">${Object.keys(TEMPLATES).map(t=>`<option value="${esc(t)}" ${comparisonGoal===t?'selected':''}>${esc(t)}</option>`).join('')}</select></label></div><div id="comparisonBody">${renderGoalComparison(goal,comparisonGoal)}</div></section>`;
}
function namedOptionsForWeapon(w){return (GUNSMITH.items||[]).filter(x=>x.weapons.includes(w.id)).length;}
function filteredPatches(){let q=patchQuery.trim().toLowerCase();return [...PATCHES].filter(p=>(patchFilter==='All'||p.game===patchFilter)&&(!q||[p.title,p.date,p.game,...(p.sections||[]).flatMap(s=>[s.title,...(s.points||[])])].join(' ').toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));}
function patchCard(p){return `<a href="#/patch/${p.id}" class="patch-card"><div class="patch-date">${fmtDate(p.date).replace(', 2026','')}<small>${p.date}</small></div><div>${tag(p.game,p.game==='Warzone'?'blue':'lime')}${p.auto?tag('AUTO-DETECTED','gold'):''}<h3>${esc(p.title)}</h3><p>${(p.sections||[]).length} categorized update sections · official source</p></div><span class="text-link">READ ↗</span></a>`;}
function updatePatchGrid(){let list=document.getElementById('patchList'),count=document.getElementById('patchResultsCount');if(!list)return;let rows=filteredPatches();list.innerHTML=rows.length?rows.map(patchCard).join(''):'<div class="empty">No patch notes match that search. Try a different weapon or category.</div>';if(count)count.textContent=rows.length+' RESULTS';}
function renderPatches(){return `${intro('INTELLIGENCE / OFFICIAL SOURCES','PATCH <em>INTELLIGENCE.</em>','Dedicated MW4 and Warzone patch pages with categorized changes, source links and source check metadata. GitHub Actions can discover new revisions daily.')}
<div class="stats"><div class="stat"><div class="stat-label">TRACKED UPDATES</div><div class="stat-value">${PATCHES.length}</div><div class="stat-foot">MW4 + Warzone</div></div><div class="stat"><div class="stat-label">MW4 CHANGELOGS</div><div class="stat-value">${PATCHES.filter(p=>p.game==='MW4').length}</div></div><div class="stat"><div class="stat-label">WARZONE CHANGELOGS</div><div class="stat-value">${PATCHES.filter(p=>p.game==='Warzone').length}</div></div><div class="stat"><div class="stat-label">LATEST VERIFIED</div><div class="stat-value" style="font-size:28px">${fmtDate(PATCHES.reduce((v,p)=>p.date>v?p.date:v,''))}</div></div></div>
<div class="command-banner"><div><div class="eyebrow">AUTOMATED DAILY INTEL</div><h2>OFFICIAL PATCH SIGNAL</h2><p>${UPDATE.lastSuccessfulAt?'Last successful check: '+esc(new Date(UPDATE.lastSuccessfulAt).toLocaleString()):'Workflow configured. Awaiting first successful GitHub Actions run.'} · ${Number(UPDATE.discoveredSources||2)} official source pages monitored.</p></div><a class="btn btn-outline" href="https://www.callofduty.com/patchnotes" target="_blank" rel="noopener">CHECK OFFICIAL HUB ↗</a></div><div class="patch-toolbar"><div class="filter-chips">${['All','MW4','Warzone'].map(p=>`<button data-action="patch-filter" data-filter="${p}" class="chip ${patchFilter===p?'active':''}">${p==='All'?'All updates':p}</button>`).join('')}</div><label class="patch-search-label"><span>SEARCH PATCH NOTES</span><input id="patchSearch" class="search" value="${esc(patchQuery)}" placeholder="Search weapon, fix, date or update…" aria-label="Search patch notes"></label><span id="patchResultsCount" class="micro">${filteredPatches().length} RESULTS</span></div><div class="patch-layout"><div class="patch-list" id="patchList">${filteredPatches().map(patchCard).join('')}</div><div class="patch-sidebar"><div class="card"><h3 class="card-title">OFFICIAL SOURCES</h3><p class="lede">Source pages from Call of Duty. Our summaries are independently maintained, and the official links contain the full patch notes.</p><div class="divider"></div><a class="source-link" target="_blank" rel="noopener" href="https://www.callofduty.com/patchnotes">CALL OF DUTY PATCH HUB ↗</a><div class="divider"></div><div class="eyebrow">AUTOMATED WATCH</div><p class="lede" style="margin-top:8px">GitHub Actions checks the official MW4 and Warzone patch hub plus tracked article pages daily, discovers eligible new article links and records dated change sections.</p></div></div></div>`;}
function renderPatch(p){if(!p)return renderNotFound();return `<a class="back" href="#/patches">← ALL PATCH INTELLIGENCE</a><div class="eyebrow">${esc(p.game.toUpperCase())} / PATCH NOTES / ${fmtDate(p.date).toUpperCase()}</div><h1 class="page-title">${esc(p.title)}</h1><div class="summary-mini" style="margin-bottom:20px">${tag(p.game,p.game==='Warzone'?'blue':'lime')}${tag(p.auto?'AUTO-DETECTED OFFICIAL REVISION':'EDITORIAL SUMMARY','subtle')}${tag(fmtDate(p.date))}</div><div class="patch-layout"><article class="patch-article"><h2 class="section-title" style="margin-bottom:20px">PATCH BREAKDOWN</h2>${(p.sections||[]).map(s=>`<section><h3>${esc(s.title)}</h3><ul>${(s.points||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`).join('')}<div class="patch-summary"><b>Full release notes:</b> this page is a categorized summary and change-detection record, not a complete reproduction of the official document. For every numerical adjustment, mode-specific clarification and complete fix list, use the original official notes.</div><a class="btn btn-primary" href="${esc(p.source)}" target="_blank" rel="noopener">↗ READ COMPLETE OFFICIAL PATCH NOTES</a></article><aside class="patch-sidebar"><div class="card"><h3 class="card-title">PATCH METADATA</h3><div class="smallcaps">DEVELOPER</div><p class="lede">${p.game==='Warzone'?'Raven Software':'Infinity Ward'}</p><div class="divider"></div><div class="smallcaps">DATE</div><p class="lede">${fmtDate(p.date)}</p><div class="divider"></div><div class="smallcaps">CATEGORIES</div><p class="lede">${(p.sections||[]).map(s=>esc(s.title)).join(' · ')}</p><div class="divider"></div><div class="smallcaps">SOURCE</div><a class="source-link" href="${esc(p.source)}" target="_blank" rel="noopener">View full official patch ↗</a></div><a href="#/patches" class="btn btn-outline" style="width:100%">← BACK TO ALL UPDATES</a></aside></div>`;}
function renderSettings(){return `${intro('LOCAL VAULT / OWN YOUR DATA','DATA & <em>SETTINGS.</em>','Your camo progression and custom loadouts live in your browser. Export a backup to move them between devices or keep a permanent copy.')}
<div class="section settings-grid"><section class="card"><h2 class="card-title">EXPORT YOUR PROGRESS</h2><p>Download a JSON backup containing every checked camo, challenge counter, focus weapon, account mastery item, weapon level, favorite, game mode, and custom loadout.</p><button class="btn btn-primary" data-action="export">↓ DOWNLOAD BACKUP</button><button class="btn" data-action="copy-json" style="margin:7px 0 0">▢ COPY JSON</button><div class="note">Exports include your saved data but no Activision login, game account or credentials. Data is not synced with official Call of Duty servers.</div></section>
<section class="card"><h2 class="card-title">IMPORT A BACKUP</h2><p>Load a previous MW4Camo.io v1 backup. This replaces progress on the current device. Export your current save first.</p><label class="btn upload">↑ SELECT JSON FILE <input id="importFile" type="file" accept=".json,application/json"></label><div class="divider"></div><h3 class="card-title">RESET EVERYTHING</h3><p>Remove local progress and custom loadouts from this browser. This cannot be undone without a backup.</p><button class="btn btn-danger" data-action="clear">RESET LOCAL DATA</button></section>
<section class="card"><h2 class="card-title">GAME MODE</h2><p>Mode changes which published requirements are shown on weapon pages and which loadout is edited. Completed camos remain shared across games.</p><div class="filter-chips">${['Warzone','MW4','DMZ'].map(m=>`<button class="chip ${state.mode===m?'active':''}" data-action="mode" data-mode="${m}">${m}</button>`).join('')}</div><div class="smallcaps">LOCAL STORAGE KEY</div><code class="setting-code">${STORE_KEY}</code></section>
<section class="card"><h2 class="card-title">DATA TRANSPARENCY</h2><p>Roster and camo progression rules are based on official Call of Duty publications. Community-sourced Special camo challenges are explicitly labelled and may change. Season 1 camo requirements that have not been verified remain blank.</p><a class="source-link" target="_blank" rel="noopener" href="https://www.callofduty.com/blog/2026/10/call-of-duty-modern-warfare-4-ready-for-launch-progression-prestige">Official camo guide ↗</a><br><a class="source-link" target="_blank" rel="noopener" href="https://mw4camotracker.com/data">Community camo data (CC BY 4.0) ↗</a><p class="micro">v1.3.0 · selectable Gunsmith upgrade · Offline support after first HTTP(S) visit</p></section></div>`;}
function renderNotFound(){return `<div class="empty"><h2 class="section-title">PAGE NOT FOUND</h2><p>That weapon or update is not in this version of MW4Camo.io.</p><a class="btn btn-primary" href="#/dashboard">RETURN TO DASHBOARD</a></div>`;}
function render(){let path=currentPath(),[route,param]=path.split('/');let heading=route==='weapon'?'WEAPON / CAMOS':route==='build'?'WEAPON / GUNSMITH':route==='patch'?'PATCH / DETAIL':(route||'dashboard').toUpperCase();document.getElementById('breadcrumb').innerHTML='MW4CAMO <span>/</span> '+esc(heading);document.getElementById('modeText').textContent=state.mode.toUpperCase();document.querySelectorAll('[data-route]').forEach(x=>x.classList.toggle('active',x.dataset.route===route || (route==='weapon'&&x.dataset.route==='weapons')||(route==='build'&&x.dataset.route==='loadouts')||(route==='patch'&&x.dataset.route==='patches')));
let w=WEAPONS.find(w=>w.id===param),p=PATCHES.find(p=>p.id===param);
app.innerHTML=route==='dashboard'||!route?renderDashboard():route==='weapons'?renderWeapons():route==='weapon'?renderWeapon(w):route==='mastery'?renderMastery():route==='planner'?renderPlanner():route==='loadouts'?renderLoadouts():route==='class-builder'?renderClassBuilder():route==='compare'?renderCompare():route==='assistant'?renderCamoAssistant():route==='doctor'?renderDoctor():route==='my-builds'?renderMyBuilds():route==='build'?renderBuild(w):route==='patches'?renderPatches():route==='patch'?renderPatch(p):route==='settings'?renderSettings():renderNotFound();
if(route==='weapons')updateWeaponGrid();if(route==='patches')updatePatchGrid();
const isNewRoute=path!==lastRenderedPath;lastRenderedPath=path;
app.classList.remove('page-enter');
if(isNewRoute){void app.offsetWidth;app.classList.add('page-enter');}
closeSidebar();
window.dispatchEvent(new CustomEvent('mw4:render',{detail:{path,route,isNewRoute}}));}
function updateWeaponGrid(){let grid=document.getElementById('weaponGrid');let results=document.getElementById('weaponResultsCount');if(!grid)return;let rows=filteredWeapons();grid.innerHTML=rows.length?rows.map(weaponCard).join(''):'<div class="empty">No weapons match. Try clearing filters.</div>';if(results)results.textContent='('+rows.length+' FOUND)';}
function setMode(mode){
 if(!['Warzone','MW4','DMZ'].includes(mode)||state.mode===mode)return;
 const path=currentPath().split('/');
 if(path[0]==='build'){const w=WEAPONS.find(w=>w.id===path[1]);if(w)stashDraft(w);}
 state.mode=mode;persist();render();notify('Mode changed to '+mode);
}
function valueById(id){let el=document.getElementById(id);return el?el.value.trim():'';}
function collectBuild(w){const slots={};app.querySelectorAll('[data-slot-row]').forEach(row=>{const type=row.querySelector('.gs-type')?.value,value=row.querySelector('.gs-item')?.value||'';if(type&&availableTypes(w,document.getElementById('gsApex')?.checked).includes(type)&&!Object.hasOwn(slots,type)&&Object.keys(slots).length<5)slots[type]=value;});return {name:valueById('buildName')||w.name+' custom',template:activeGoal(w),slots,apex:!!document.getElementById('gsApex')?.checked,perks:valueById('buildPerks'),tactical:valueById('buildTactical'),lethal:valueById('buildLethal'),notes:valueById('buildNotes'),userSaved:true,savedAt:new Date().toISOString()};}
async function copyText(text){try{await navigator.clipboard.writeText(text);notify('Copied to clipboard');}catch{let el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);el.select();let ok=document.execCommand('copy');el.remove();notify(ok?'Copied to clipboard':'Clipboard unavailable; use Export instead');}}
function download(name,text){let blob=new Blob([text],{type:'application/json;charset=utf-8'});let url=URL.createObjectURL(blob);let a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function validatedImport(data){if(!data || data.version!==1 || typeof data.completed!=='object'||Array.isArray(data.completed)||typeof data.accounts!=='object'||Array.isArray(data.accounts)||typeof data.levels!=='object'||Array.isArray(data.levels)||!Array.isArray(data.favorites)||typeof data.builds!=='object'||Array.isArray(data.builds))throw Error('Not a MW4Camo v1 backup');let validKeys=new Set(WEAPONS.flatMap(w=>CAMOS.map(c=>w.id+'|'+c.id)));let validAcc=new Set(ACCOUNT.map(c=>c.id));let validIds=new Set(WEAPONS.map(w=>w.id));let completed=Object.fromEntries(Object.entries(data.completed).filter(([k])=>validKeys.has(k)).map(([k,v])=>[k,v===true]));let accounts=Object.fromEntries(Object.entries(data.accounts).filter(([k])=>validAcc.has(k)).map(([k,v])=>[k,v===true]));let levels=Object.fromEntries(Object.entries(data.levels).filter(([k,v])=>validIds.has(k)&&Number.isFinite(Number(v))).map(([k,v])=>[k,Math.min(999,Math.max(0,Number(v)))]));let builds=Object.fromEntries(Object.entries(data.builds).filter(([k,v])=>validIds.has(k.split('|')[0])&&['MW4','Warzone','DMZ'].includes(k.split('|')[1])&&v&&typeof v==='object'&&v.slots&&typeof v.slots==='object').map(([k,v])=>[k,{name:String(v.name||'Custom').slice(0,100),template:Object.hasOwn(TEMPLATES,String(v.template))?String(v.template):'Balanced',slots:Object.fromEntries(Object.entries(v.slots).slice(0,10).map(([key,val])=>[String(key).slice(0,50),String(val||'').slice(0,90)])),perks:String(v.perks||'').slice(0,300),tactical:String(v.tactical||'').slice(0,150),lethal:String(v.lethal||'').slice(0,150),notes:String(v.notes||'').slice(0,5000),apex:v.apex===true,userSaved:true,savedAt:Number.isFinite(Date.parse(v.savedAt))?String(v.savedAt).slice(0,40):''}]));let activeGoals=Object.fromEntries(Object.entries(data.activeGoals||{}).filter(([k,v])=>validIds.has(k.split('|')[0])&&['MW4','Warzone','DMZ'].includes(k.split('|')[1])&&Object.hasOwn(TEMPLATES,v)));let counters=Object.fromEntries(Object.entries(data.counters||{}).filter(([k,v])=>validKeys.has(k)&&v&&typeof v==='object').map(([k,v])=>[k,{value:Math.min(100000,Math.max(0,Math.floor(Number(v.value)||0))),target:Math.min(100000,Math.max(0,Math.floor(Number(v.target)||0)))}]));return {...defaultState(),completed,accounts,levels,builds,activeGoals,counters,focusWeapon:validIds.has(data.focusWeapon)?data.focusWeapon:null,favorites:data.favorites.filter(k=>validIds.has(k)),mode:['MW4','Warzone','DMZ'].includes(data.mode)?data.mode:'Warzone',classConfigs:Object.fromEntries(Object.entries(data.classConfigs||{}).filter(([k,v])=>['MW4','Warzone','DMZ'].includes(k)&&v&&typeof v==='object').map(([k,v])=>[k,Object.fromEntries(['name','primary','secondary','perk1','perk2','perk3','tactical','lethal','field','savedAt'].map(f=>[f,String(v[f]||'').slice(0,150)]))])),reviewedPatches:Object.fromEntries(Object.entries(data.reviewedPatches||{}).slice(0,1500).filter(([k,v])=>typeof k==='string'&&k.length<200&&v===true)),weaponMeasurements:Object.fromEntries(Object.entries(data.weaponMeasurements||{}).filter(([k,v])=>validIds.has(k.split('|')[0])&&['MW4','Warzone','DMZ'].includes(k.split('|')[1])&&v&&typeof v==='object').map(([k,v])=>[k,Object.fromEntries(['ttkMs','adsMs','recoil','rangeM'].map(f=>[f,Number.isFinite(Number(v[f]))&&v[f]!==null&&v[f]!==''?Math.min(f==='recoil'?10:100000,Math.max(0,Number(v[f]))):null]))]))};}
app.addEventListener('click',event=>{let btn=event.target.closest('[data-action]');if(!btn)return;let action=btn.dataset.action,w=WEAPONS.find(w=>w.id===btn.dataset.weapon);if(action==='review-patch'){
 const key=btn.dataset.key,patch=PATCHES.find(p=>p.id===btn.dataset.patch);
 if(!Object.hasOwn(state.builds,key)||!patch)return;
 state.reviewedPatches[reviewKey(key,patch)]=true;persist();render();notify('Patch note marked reviewed');return;
}
if(action==='quick-count'&&w){
 const camo=CAMOS.find(c=>c.id===btn.dataset.camo);if(!camo||camo.type==='Military')return;
 const key=w.id+'|'+camo.id,prior=counter(w,camo.id);
 state.counters[key]={...prior,value:Math.min(100000,prior.value+1)};persist();render();
 notifyUndo('Recorded one '+camo.name+' progress event',()=>{state.counters[key]=prior;persist();render();});return;
}
if(action==='assistant-complete'&&w){
 const camo=CAMOS.find(c=>c.id===btn.dataset.camo);if(!camo)return;
 const key=w.id+'|'+camo.id,prior=Boolean(state.completed[key]);state.completed[key]=true;persist();render();
 notifyUndo('Camo marked unlocked',()=>{state.completed[key]=prior;persist();render();});return;
}
if(action==='class-preset'){
 if(state.mode!=='Warzone')return;
 const presets={
  Aggressive:['Hunter','Adaptive','Quick Fix','Stim','Semtex'],
  Stealth:['Incognito','Mountaineer','Survivor','Smoke Grenade','Throwing Knife'],
  'Squad Support':['Stocked','Scavenger','Wingman','Screamer Mine','Claymore']
 };
 const record=presets[btn.dataset.preset];if(!record)return;
 for(const [i,id] of ['classPerk1','classPerk2','classPerk3','classTactical','classLethal'].entries()){
  const field=document.getElementById(id);if(field&&[...field.options].some(x=>x.value===record[i]))field.value=record[i];
 }
 notify('Suggested '+btn.dataset.preset+' class equipped — save to keep it');return;
}
if(action==='save-class'||action==='copy-class'){
 const get=(id)=>valueById(id),primary=get('classPrimary'),secondary=get('classSecondary');
 if(primary&&secondary&&primary===secondary){notify('Primary and secondary must be different weapons');return;}
 const primaryW=WEAPONS.find(w=>w.id===primary),secondaryW=WEAPONS.find(w=>w.id===secondary);
 if(!primaryW){notify('Choose a primary weapon');return;}
 const load={name:get('className').slice(0,80)||state.mode+' Class',primary,secondary,perk1:get('classPerk1'),perk2:get('classPerk2'),perk3:get('classPerk3'),tactical:get('classTactical'),lethal:get('classLethal'),field:get('classField'),savedAt:new Date().toISOString()};
 if(action==='save-class'){state.classConfigs[state.mode]=load;persist();render();notify('Full '+state.mode+' loadout saved');}
 else copyText([load.name,'Mode: '+state.mode,'Primary: '+primaryW.name,'Secondary: '+(secondaryW?.name||'None'),'Perks: '+[load.perk1,load.perk2,load.perk3].filter(Boolean).join(', '),'Tactical: '+(load.tactical||'None'),'Lethal: '+(load.lethal||'None'),'Field: '+(load.field||'None')].join('\n'));
 return;
}
if(action==='clear-class'){
 if(!confirm('Clear the full loadout for '+state.mode+'?'))return;
 delete state.classConfigs[state.mode];persist();render();notify('Full loadout cleared');return;
}
if(action==='save-measures'){
 const a=[...app.querySelectorAll('[data-measure]')];
 for(const w of WEAPONS.filter(w=>compareIds.includes(w.id))){
  const values={};for(const input of a.filter(el=>el.dataset.weapon===w.id)){
   if(input.value.trim()===''){values[input.dataset.measure]=null;continue;}
   const n=Number(input.value),cap=input.dataset.measure==='recoil'?10:100000;
   if(!Number.isFinite(n)||n<0||n>cap){notify('Measurements must be between 0 and '+cap);input.focus();return;}
   values[input.dataset.measure]=n;
  }
  state.weaponMeasurements[w.id+'|'+state.mode]=values;
 }
 persist();render();notify('Personal measurements saved for '+state.mode);return;
}
if(action==='swap-compare'){compareIds=[compareIds[1],compareIds[0]];render();return;}
if(action==='focus'&&w){state.focusWeapon=state.focusWeapon===w.id?null:w.id;persist();render();notify(state.focusWeapon?'Focus set to '+w.name:'Focus cleared');return;}
if(action==='mission-filter'){missionFilter=btn.dataset.filter;render();return;}
if(action==='favorite'&&w){state.favorites=favorite(w)?state.favorites.filter(x=>x!==w.id):[...state.favorites,w.id];persist();if(currentPath()==='weapons')updateWeaponGrid();else render();return;}
if(action==='camo'&&w){
 let key=w.id+'|'+btn.dataset.camo,previous=Boolean(state.completed[key]);
 state.completed[key]=!previous;persist();render();
 notifyUndo((previous?'Unchecked ':'Completed ')+w.name+' camo',()=>{state.completed[key]=previous;persist();render();});return;
}
if(action==='account'){
 let key=btn.dataset.camo,previous=Boolean(state.accounts[key]);
 state.accounts[key]=!previous;persist();render();
 notifyUndo(previous?'Mastery unmarked':'Mastery marked complete',()=>{state.accounts[key]=previous;persist();render();});return;
}
if(action==='favorites'){filter.fav=!filter.fav;render();return;}
if(action==='category'){filter.category=btn.dataset.category;render();return;}
if(action==='set-class'){filter.category=btn.dataset.category;filter.search='';filter.status='All';filter.fav=false;location.hash='#/weapons';return;}
if(action==='sync-level'&&w){let level=Math.min(w.maxLevel||999,Math.max(0,Number(valueById('weaponLevel'))||0));state.levels[w.id]=level;persist();render();notify('Weapon level saved. Only mark camo challenges once earned in-game.');return;}
if(action==='goal'&&w){const goal=btn.dataset.goal;if(!Object.hasOwn(TEMPLATES,goal))return;if(currentPath().startsWith('build/')&&activeGoal(w)!==goal)stashDraft(w);state.activeGoals[goalId(w)]=goal;persist();render();notify('Tactical profile: '+goal);return;}
if(action==='save-build'&&w){const b=collectBuild(w);if(Object.keys(b.slots).length>5){notify('Maximum five standard attachments');return;}state.builds[buildKey(w)]=b;for(const key of Object.keys(state.reviewedPatches))if(key.startsWith(buildKey(w)+'|'))delete state.reviewedPatches[key];if(activeGoal(w)==='Balanced')delete state.builds[goalId(w)];delete builderDrafts[buildKey(w)];if(persist()){render();notify(w.name+' loadout saved for '+state.mode);}return;}
if(action==='restore-seed'&&w){const seed=getSeed(w,state.mode);if(!seed)return;if(getBuild(w)&&!confirm('Replace your saved custom build with the published example?'))return;delete state.builds[buildKey(w)];delete state.builds[goalId(w)];delete builderDrafts[buildKey(w)];state.activeGoals[goalId(w)]='Balanced';persist();render();notify('Published example restored');return;}
if(action==='gs-add'&&w){const b=collectBuild(w),free=availableTypes(w,b.apex).filter(t=>!Object.hasOwn(b.slots,t));if(Object.keys(b.slots).length>=5||!free.length){notify('Maximum five standard attachments');return;}b.slots[free[0]]='';builderDrafts[buildKey(w)]={...b,userSaved:false};rerenderBuilderPreservePosition();return;}
if(action==='gs-remove'&&w){const b=collectBuild(w),index=Number(btn.dataset.index),type=Object.keys(b.slots)[index];if(type)delete b.slots[type];builderDrafts[buildKey(w)]={...b,userSaved:false};rerenderBuilderPreservePosition();return;}
if(action==='gs-clear'&&w){const b=collectBuild(w);b.slots={};builderDrafts[buildKey(w)]={...b,userSaved:false};rerenderBuilderPreservePosition();notify('Standard attachment slots cleared');return;}
if(action==='gs-generate'&&w){const b=collectBuild(w);b.slots=generateSlots(w,activeGoal(w),b.apex);builderDrafts[buildKey(w)]={...b,userSaved:false};rerenderBuilderPreservePosition();notify(Object.keys(b.slots).length?'Generated '+activeGoal(w)+' suggestions — review before saving':'No verified attachment choices yet for this weapon');return;}
if(action==='copy-build'&&w){const b=collectBuild(w);const data=[b.name,w.name+' ('+state.mode+' · '+activeGoal(w)+')',b.apex?'Apex: '+gunSpec(w).apex:'',...Object.entries(b.slots).filter(x=>x[1]).map(([k,v])=>k+': '+v),b.perks?'Perks: '+b.perks:'',b.tactical?'Tactical: '+b.tactical:'',b.lethal?'Lethal: '+b.lethal:'',b.notes?'Notes: '+b.notes:''].filter(Boolean).join('\n');copyText(data);return;}
if(action==='open-saved'){let [weapon,mode,goal='Balanced']=String(btn.dataset.key||'').split('|');if(!WEAPONS.some(x=>x.id===weapon)||!['MW4','Warzone','DMZ'].includes(mode)||!Object.hasOwn(TEMPLATES,goal))return;state.mode=mode;state.activeGoals[weapon+'|'+mode]=goal;persist();location.hash='#/build/'+weapon;render();return;}
if(action==='delete-build'){let key=btn.dataset.key;if(!Object.hasOwn(state.builds,key))return;if(confirm('Delete this saved blueprint?')){delete state.builds[key];persist();render();notify('Blueprint deleted');}return;}
if(action==='patch-filter'){patchFilter=btn.dataset.filter;render();return;}
if(action==='mode'){setMode(btn.dataset.mode);return;}
if(action==='export'){download('mw4camo-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(state,null,2));notify('Backup exported');return;}
if(action==='copy-json'){copyText(JSON.stringify(state));return;}
if(action==='clear'){if(confirm('Delete ALL local MW4Camo progress and saved loadouts? Export a backup first.')){state=defaultState();persist();render();notify('Local progress reset');}return;}
});
app.addEventListener('input',event=>{if(event.target.id==='weaponSearch'){filter.search=event.target.value;updateWeaponGrid();}if(event.target.id==='patchSearch'){patchQuery=event.target.value;updatePatchGrid();}});
app.addEventListener('change',async event=>{
if(event.target.id==='assistantSize'){assistantSize=[2,3,5].includes(Number(event.target.value))?Number(event.target.value):3;render();return;}
if(event.target.id==='compareA'||event.target.id==='compareB'){const idx=event.target.id==='compareA'?0:1;const other=compareIds[1-idx];if(event.target.value===other){notify('Choose two different weapons to compare');event.target.value=compareIds[idx];return;}compareIds[idx]=event.target.value;render();return;}
if(event.target.id==='classPrimary'){const secondary=document.getElementById('classSecondary');if(secondary&&secondary.value===event.target.value)secondary.value='';return;}if(event.target.matches('.gs-type,.gs-item')||event.target.id==='gsApex'){
 const w=WEAPONS.find(x=>x.id===currentPath().split('/')[1]);if(!w)return;
 const b=collectBuild(w);if(event.target.id==='gsApex'){
  b.apex=event.target.checked;const removed=Object.keys(b.slots).filter(type=>!availableTypes(w,b.apex).includes(type));for(const type of removed)delete b.slots[type];if(removed.length)notify('Apex equipped — removed blocked slots: '+removed.join(', '));
 }else if(event.target.matches('.gs-type')){
  // Collect current controls after the type changes; the previously selected name cannot carry to the new category.
  const row=event.target.closest('[data-slot-row]');const idx=Number(row?.dataset.slotRow);const name=event.target.value;
  const list=[...app.querySelectorAll('[data-slot-row]')].map(x=>({type:x.querySelector('.gs-type')?.value,name:x.querySelector('.gs-item')?.value||''}));
  b.slots={};list.forEach((entry,i)=>{if(entry.type&&!Object.hasOwn(b.slots,entry.type)&&Object.keys(b.slots).length<5)b.slots[entry.type]=i===idx?'':entry.name;});
 }
 builderDrafts[buildKey(w)]={...b,userSaved:false};rerenderBuilderPreservePosition();return;
}
if(event.target.id==='compareGoal'){comparisonGoal=Object.hasOwn(TEMPLATES,event.target.value)?event.target.value:'Balanced';let w=WEAPONS.find(w=>w.id===currentPath().split('/')[1]);if(w){let el=document.getElementById('comparisonBody');if(el)el.innerHTML=renderGoalComparison(activeGoal(w),comparisonGoal);}return;}
if(event.target.dataset.counter){let w=WEAPONS.find(w=>w.id===event.target.dataset.weapon);let camo=CAMOS.find(c=>c.id===event.target.dataset.camo);if(!w||!camo)return;let key=w.id+'|'+camo.id,previous=counter(w,camo.id),part=event.target.dataset.counter;previous[part]=Math.min(100000,Math.max(0,Math.floor(Number(event.target.value)||0)));state.counters[key]=previous;persist();render();notify('Challenge progress saved');return;}if(event.target.id==='categoryFilter'){filter.category=event.target.value;render();return;}
if(event.target.id==='statusFilter'){filter.status=event.target.value;render();return;}
if(event.target.id==='loadoutWeaponSelect'){if(event.target.value)location.hash='#/build/'+event.target.value;return;}
if(event.target.id==='weaponLevel'){let w=WEAPONS.find(w=>w.id===currentPath().split('/')[1]);if(w){state.levels[w.id]=Math.min(999,Math.max(0,Number(event.target.value)||0));persist();}return;}
if(event.target.id==='importFile'){let file=event.target.files[0];if(!file)return;if(file.size>2*1024*1024){notify('Backup too large (2 MB maximum)');return;}try{let data=validatedImport(JSON.parse(await file.text()));if(confirm('Replace your local tracker with the selected backup?')){state=data;persist();render();notify('Backup imported successfully');}}catch(e){notify('Import failed: '+e.message);}return;}
});
document.getElementById('modeButton').addEventListener('click',()=>{let modes=['Warzone','MW4','DMZ'];setMode(modes[(modes.indexOf(state.mode)+1)%modes.length]);});
const sidebar=document.getElementById('sidebar');
const sidebarBackdrop=document.getElementById('sidebarBackdrop');
const menuToggle=document.getElementById('menuToggle');
const menuClose=document.getElementById('menuClose');
const mobileNavigation=window.matchMedia('(max-width:900px)');
function setSidebarOpen(open,restoreFocus=false){
  const visible=Boolean(open&&mobileNavigation.matches);
  sidebar.classList.toggle('open',visible);
  sidebarBackdrop.classList.toggle('active',visible);
  document.body.classList.toggle('nav-open',visible);
  menuToggle.setAttribute('aria-expanded',String(visible));
  menuToggle.setAttribute('aria-label',visible?'Close navigation menu':'Open navigation menu');
  if(visible){sidebar.inert=false;menuClose.focus({preventScroll:true});}
  else{if(restoreFocus&&mobileNavigation.matches)menuToggle.focus({preventScroll:true});sidebar.inert=mobileNavigation.matches;}
}
function closeSidebar(restoreFocus=false){setSidebarOpen(false,restoreFocus);}
menuToggle.addEventListener('click',()=>setSidebarOpen(!sidebar.classList.contains('open'),true));
menuClose.addEventListener('click',()=>closeSidebar(true));
sidebarBackdrop.addEventListener('click',()=>closeSidebar(true));
sidebar.addEventListener('click',event=>{if(event.target.closest('a[href^="#/"]'))closeSidebar();});
mobileNavigation.addEventListener('change',()=>closeSidebar());
document.getElementById('skipLink')?.addEventListener('click',()=>document.getElementById('app').focus());
window.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&sidebar.classList.contains('open')){event.preventDefault();closeSidebar(true);}
  if(event.key!=='Tab'||!sidebar.classList.contains('open'))return;
  const links=[...sidebar.querySelectorAll('a,button')].filter(el=>!el.inert&&el.getClientRects().length);
  if(!links.length)return;
  const first=links[0],last=links[links.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
closeSidebar();
window.addEventListener('hashchange',()=>{render();window.scrollTo({top:0,behavior:'instant'});});
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
if(UPDATE.lastSuccessfulAt){let status=document.getElementById('refreshStatus');if(status){let days=(Date.now()-Date.parse(UPDATE.lastSuccessfulAt))/86400000;status.classList.toggle('stale',days>2);status.lastChild.nodeType===3&&status.lastChild.remove();status.append(document.createTextNode(' PATCH SYNC '+(days>2?'STALE':'CURRENT')));status.title='Last successful check '+UPDATE.lastSuccessfulAt;}}
window.addEventListener('storage',event=>{if(event.key===STORE_KEY){state=loadState();render();notify('Progress updated from another tab');}});
render();
})();
