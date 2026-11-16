/* Published data integrity checks: never substitute arbitrary JSON for the verified archive. */
(() => {
'use strict';
function patchArchive(items) {
  if(!Array.isArray(items)||!items.length||items.length>5000)return false;
  const ids=new Set();
  return items.every(item=>{
    if(!item||typeof item!=='object'||Array.isArray(item))return false;
    if(typeof item.id!=='string'||!item.id||item.id.length>160||ids.has(item.id))return false;
    ids.add(item.id);
    if(!['MW4','Warzone'].includes(item.game)||typeof item.title!=='string'||!item.title.trim()||item.title.length>600)return false;
    if(typeof item.date!=='string'||!/^(20\d{2})-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(item.date)||!Number.isFinite(Date.parse(item.date+'T12:00:00Z')))return false;
    if(typeof item.source!=='string'||!/^https:\/\/www\.callofduty\.com\/patchnotes(?:\/|$)/.test(item.source))return false;
    if(!Array.isArray(item.sections)||!item.sections.length||item.sections.length>200)return false;
    return item.sections.every(section=>section&&typeof section.title==='string'&&section.title.length<=700&&Array.isArray(section.points)&&section.points.length<=1000&&section.points.every(point=>typeof point==='string'&&point.length<=15000));
  });
}
function status(value,items){
  if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(items))return false;
  if(typeof value.lastCheckedAt!=='string'||typeof value.lastSuccessfulAt!=='string')return false;
  const checked=Date.parse(value.lastCheckedAt),published=Date.parse(value.lastSuccessfulAt);
  if(!Number.isFinite(checked)||!Number.isFinite(published)||checked>Date.now()+600000||published>checked+60000)return false;
  return Number.isInteger(value.patchCount)&&value.patchCount===items.length;
}
function preservesArchive(previous,incoming){
  if(!Array.isArray(previous)||!Array.isArray(incoming))return false;
  const nextIds=new Set(incoming.map(item=>item.id));
  return previous.every(item=>nextIds.has(item.id));
}
window.MW4_FEED_GUARD=Object.freeze({patchArchive,status,preservesArchive});
})();
