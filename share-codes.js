(() => {
'use strict';
const PREFIX = 'MW4C1';
const MODES = ['MW4','Warzone','DMZ'];
const MAX_CODE_LENGTH = 4096;
const cleanName = value => String(value ?? '').normalize('NFKC').trim().toLowerCase();

function normalize(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid weapon build');
  const catalog = window.MW4_ATTACHMENTS;
  const weapons = window.MW4_WEAPONS || [];
  const weapon = String(input.weapon || '');
  const w = weapons.find(item => item.id === weapon);
  const spec = catalog?.specs?.[weapon];
  if (!w || !spec || !Array.isArray(spec.types) || !spec.types.length) throw Error('This weapon does not support verified Gunsmith slots');
  const mode = String(input.mode || 'MW4');
  if (!MODES.includes(mode)) throw Error('Unknown game mode');
  const goal = String(input.goal || 'Balanced');
  if (!['Balanced','Fast TTK','Low Recoil','Aggressive','Long Range','Hipfire','Stealth','Quickscope','Squad Support'].includes(goal)) throw Error('Unknown loadout goal');
  if (typeof input.apex !== 'boolean') throw Error('Invalid Apex selection');
  if (input.apex && !spec.apex) throw Error('Apex is not available for this weapon');
  const raw = input.slots;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('Invalid attachment selections');
  const entries = Array.isArray(raw) ? [] : Object.entries(raw);
  if (entries.length > 5) throw Error('Maximum five attachment categories');
  const selected = new Map();
  for (const [type, value] of entries) {
    if (!spec.types.includes(type) || (input.apex && spec.blocked.includes(type))) throw Error('Incompatible attachment category: ' + type);
    if (selected.has(type)) throw Error('Duplicate attachment category: ' + type);
    if (typeof value !== 'string' || !value.trim() || value.length > 120) throw Error('Select a named attachment for ' + type);
    const match = (catalog.items || []).find(item => item.type === type && Array.isArray(item.weapons) && item.weapons.includes(weapon) && cleanName(item.name) === cleanName(value));
    if (!match) throw Error('Unverified attachment: ' + type + ' / ' + String(value).slice(0,65));
    selected.set(type, match.name);
  }
  const slots = Object.fromEntries(spec.types.filter(type => selected.has(type)).map(type => [type,selected.get(type)]));
  return {weapon,mode,goal,apex:input.apex,slots};
}

function checksum(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) { hash ^= value.charCodeAt(i); hash = Math.imul(hash,16777619); }
  return (hash >>> 0).toString(16).padStart(8,'0').toUpperCase();
}

function base64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i,i + 8192));
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function base64Decode(encoded) {
  if (!/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length > MAX_CODE_LENGTH) throw Error('Malformed share code');
  const padded = encoded.replace(/-/g,'+').replace(/_/g,'/');
  const binary = atob(padded + '='.repeat((4 - padded.length % 4) % 4));
  return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,char => char.charCodeAt(0)));
}

function encode(input) {
  const build = normalize(input);
  const payload = JSON.stringify([build.weapon,build.mode,build.goal,Number(build.apex),Object.entries(build.slots)]);
  const output = PREFIX + '-' + checksum(payload) + '-' + base64Encode(payload);
  if (output.length > MAX_CODE_LENGTH) throw Error('Share code exceeds size limit');
  return output;
}

function decode(input) {
  const code = String(input || '').trim();
  if (code.length > MAX_CODE_LENGTH) throw Error('Share code exceeds size limit');
  const parts = code.match(/^MW4C1-([A-F0-9]{8})-([A-Za-z0-9_-]+)$/);
  if (!parts) throw Error('This is not an MW4Camo share code');
  const payload = base64Decode(parts[2]);
  if (checksum(payload) !== parts[1]) throw Error('Share code checksum mismatch');
  const fields = JSON.parse(payload);
  if (!Array.isArray(fields) || fields.length !== 5 || !Array.isArray(fields[4]) || fields[4].length > 5) throw Error('Invalid share code structure');
  const slots = Object.create(null);
  for (const pair of fields[4]) {
    if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || Object.hasOwn(slots,pair[0])) throw Error('Invalid attachment in share code');
    slots[pair[0]] = pair[1];
  }
  if (fields[3] !== 0 && fields[3] !== 1) throw Error('Invalid Apex flag');
  return normalize({weapon:fields[0],mode:fields[1],goal:fields[2],apex:fields[3] === 1,slots});
}

function fingerprint(input) {
  const build = normalize({...input,mode:'MW4',goal:'Balanced'});
  return checksum(JSON.stringify([build.weapon,Number(build.apex),Object.entries(build.slots)]));
}

function extract(input) {
  const text = String(input || '').trim();
  if (text.startsWith(PREFIX + '-')) return text;
  if (text.length > 8192) throw Error('Share link is too long');
  let url;
  try { url = new URL(text); } catch { throw Error('Paste an MW4Camo code or share URL'); }
  if (!/^https?:$/.test(url.protocol)) throw Error('Unsupported share link');
  return url.searchParams.get('share') || '';
}

function gameCodeLooksPlausible(value) {
  return /^[A-Z][0-9]{2}(?:-[A-Z0-9]{1,10}){1,4}$/.test(String(value || '').trim().toUpperCase());
}

window.MW4_SHARE = Object.freeze({encode,decode,normalize,fingerprint,extract,gameCodeLooksPlausible});
})();
