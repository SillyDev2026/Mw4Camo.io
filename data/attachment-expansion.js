(() => {
'use strict';
const catalog = window.MW4_ATTACHMENTS;
if (!catalog || !catalog.specs || !Array.isArray(catalog.items)) return;
const remote = 'https://codloadout.gitlab.io/data/mw4-community-attachments.json';
const typeNames = ['Optic','Muzzle','Barrel','Underbarrel','Magazine','Rear Grip','Stock','Laser','Ammunition','Comb','Bolt','Trigger Action','Guard','Cylinder','Fire Mods'];
const types = Object.fromEntries(typeNames.map(name => [name.toLowerCase().replace(/[^a-z0-9]/g,''),name]));
const norm = value => String(value || '').normalize('NFKC').trim().toLowerCase();
function merge(data) {
  if (!data || data.meta?.status !== 'community-reported' || !Array.isArray(data.attachments) || data.attachments.length < 500) return false;
  const entries = new Map();
  for (const item of catalog.items) {
    if (!item || typeof item.name !== 'string' || typeof item.type !== 'string') continue;
    const weapons = (Array.isArray(item.weapons) ? item.weapons : []).filter(id => catalog.specs[id]?.types?.includes(item.type));
    if (weapons.length) entries.set(item.type + '|' + norm(item.name),{...item,weapons,goals:Array.isArray(item.goals)?item.goals:[]});
  }
  let accepted = 0;
  for (const item of data.attachments) {
    if (!item || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120 || !Array.isArray(item.weapons)) continue;
    const type = types[String(item.type || '').toLowerCase().replace(/[^a-z0-9]/g,'')];
    if (!type) continue;
    const weapons = [...new Set(item.weapons)].filter(id => typeof id === 'string' && catalog.specs[id]?.types?.includes(type));
    if (!weapons.length) continue;
    const name = item.name.trim(), key = type + '|' + norm(name);
    if (entries.has(key)) {
      const existing = entries.get(key);
      existing.weapons = [...new Set([...existing.weapons,...weapons])];
    } else {
      entries.set(key,{type,name,weapons,goals:[],sourceType:'community',source:'https://codloadout.gitlab.io/mw4/attachments/'});
    }
    accepted++;
  }
  if (accepted < 500) return false;
  const merged = [...entries.values()].sort((a,b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
  catalog.items.splice(0,catalog.items.length,...merged);
  catalog.arsenalSynced = true;
  catalog.communityReportedCount = accepted;
  catalog.communityUpdated = String(data.meta.updated || '2026-10-28');
  window.dispatchEvent(new Event('mw4:arsenal-ready'));
  return true;
}
async function load(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(),6000);
  try {
    const response = await fetch(url,{cache:'no-store',signal:controller.signal});
    return response.ok ? await response.json() : null;
  } catch { return null; }
  finally { clearTimeout(timer); }
}
(async () => {
  for (const url of ['./data/attachments-community.json',remote]) {
    const data = await load(url);
    if (data && merge(data)) return;
  }
  catalog.arsenalSynced = false;
})();
})();
