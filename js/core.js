let currentLang='ru';
let currentTheme='light';
let currentTab='map';
let currentMapSub='roles';
let currentMode='role2form';
let currentPhraseMode='choice';
let keyboardOpen=false;
let settings=null;
let stats={};
let bestTimes={};
let toastTimer=null;
let advanceTimer=null;
let voices=[];
let heVoice=null;
let voiceToastShown=false;
let activeInput=null;
let currentQ=null;
let qStart=0;
let answered=false;
let hintShown=false;
let recentWrong=[];
let history=[];
let trainFilter=null;
let runState=null;
let speedState=null;
let keyMiniQ=null;
let perspState={speaker:null,listener:null,count:0};
let phraseQueue=[];
let phrasePos=0;
let phraseAnswered=false;
let phraseHintShown=false;
let currentPrefixSub='ref';
let pfxMode='letter';
let pfxLetterDir='letter2meaning';
let pfxPhraseMode='choice';
let pfxQ=null;
let pfxAnswered=false;
let pfxHintShown=false;
let pfxStart=0;
let pfxHistory=[];
let pfxSpeedState=null;
let pfxPhraseQueue=[];
let pfxPhrasePos=0;
let pfxPhraseAnswered=false;
let pfxPhraseHintShown=false;

function t(key,vars){
  const dict=I18N[currentLang]||I18N.ru;
  let out=dict[key]!==undefined?dict[key]:I18N.ru[key];
  if(out===undefined) out=key;
  if(vars){Object.keys(vars).forEach(function(k){out=out.split('{'+k+'}').join(String(vars[k]));});}
  return out;
}
function roleLabel(role){return currentLang==='en'?ROLE_LABEL_EN[role]:ROLE_LABEL_RU[role];}
function translitOf(f){return currentLang==='en'?f.tEn:f.t;}
function trText(f){return settings.translit?translitOf(f):'';}
function trDiv(f,cls){const s=trText(f);return s?'<div class="'+cls+'">'+s+'</div>':'';}
function prepMeaning(p){return currentLang==='en'?p.meaningEn:p.meaningRu;}
function glossOf(prepId,role){const f=FORMS[prepId][role];return currentLang==='en'?f.en:f.ru;}
function personClass(role){return 'role-'+ROLE_META[role].p;}

function loadLang(){try{return localStorage.getItem(LS_LANG)==='en'?'en':'ru';}catch(e){return 'ru';}}
function saveLang(){try{localStorage.setItem(LS_LANG,currentLang);}catch(e){}}
function loadStats(){try{const raw=localStorage.getItem(LS_STATS);if(!raw)return {};const o=JSON.parse(raw);return o&&typeof o==='object'?o:{};}catch(e){return {};}}
function saveStats(){try{localStorage.setItem(LS_STATS,JSON.stringify(stats));}catch(e){}}
function loadSettings(){
  const def={nikud:'hint',translit:true,register:'colloquial',sound:true,strictPath:false,score:0,streak:0,bestStreak:0,endColors:true,nikudCheck:'auto',pfxFilter:{prefixes:[],tags:[],forms:[],weak:false,notAuto:false}};
  try{
    const raw=localStorage.getItem(LS_SETTINGS);
    if(!raw)return def;
    const o=JSON.parse(raw);
    const merged=Object.assign(def,o&&typeof o==='object'?o:{});
    if(['always','hint','off'].indexOf(merged.nikud)<0) merged.nikud='hint';
    if(['colloquial','strict'].indexOf(merged.register)<0) merged.register='colloquial';
    if(typeof merged.endColors!=='boolean') merged.endColors=true;
    if(['auto','off','smart','full'].indexOf(merged.nikudCheck)<0) merged.nikudCheck='auto';
    if(!merged.pfxFilter||typeof merged.pfxFilter!=='object') merged.pfxFilter={prefixes:[],tags:[],forms:[],weak:false,notAuto:false};
    if(!Array.isArray(merged.pfxFilter.prefixes)) merged.pfxFilter.prefixes=[];
    if(!Array.isArray(merged.pfxFilter.tags)) merged.pfxFilter.tags=[];
    if(!Array.isArray(merged.pfxFilter.forms)) merged.pfxFilter.forms=[];
    if(typeof merged.pfxFilter.weak!=='boolean') merged.pfxFilter.weak=false;
    if(typeof merged.pfxFilter.notAuto!=='boolean') merged.pfxFilter.notAuto=false;
    return merged;
  }catch(e){return def;}
}
function saveSettings(){try{localStorage.setItem(LS_SETTINGS,JSON.stringify(settings));}catch(e){}}
function loadBest(){try{const raw=localStorage.getItem(LS_BEST);if(!raw)return {};const o=JSON.parse(raw);return o&&typeof o==='object'?o:{};}catch(e){return {};}}
function saveBest(){try{localStorage.setItem(LS_BEST,JSON.stringify(bestTimes));}catch(e){}}
function loadKeyboard(){try{const raw=localStorage.getItem(LS_KB);if(raw==='1')return true;if(raw==='0')return false;}catch(e){}return !!(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches);}
function saveKeyboard(){try{localStorage.setItem(LS_KB,keyboardOpen?'1':'0');}catch(e){}}

function N(s){
  if(s===null||s===undefined) return '';
  let out='';
  for(const ch of String(s)){
    const cp=ch.codePointAt(0);
    if(cp>=0x0591&&cp<=0x05C7) continue;
    out+=ch;
  }
  const map={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
  out=Array.from(out).map(function(c){return map[c]||c;}).join('');
  out=out.replace(/יי/g,'י');
  out=out.replace(/\s+/g,'');
  return out;
}

function formParts(prepId,role){
  const p=PREPS[prepId];
  const f=FORMS[prepId][role];
  if(p.irregularRoles.indexOf(role)>=0) return {stem:f.u,end:'',irregular:true};
  if(f.u.indexOf(p.stem)===0) return {stem:p.stem,end:f.u.slice(p.stem.length),irregular:false};
  return {stem:f.u,end:'',irregular:true};
}
function splitNikud(prepId,role){
  const p=PREPS[prepId];
  const f=FORMS[prepId][role];
  if(p.irregularRoles.indexOf(role)>=0) return {stemP:'',endP:f.p};
  const parts=formParts(prepId,role);
  if(!parts.end) return {stemP:'',endP:f.p};
  const idx=f.p.indexOf(parts.end.charAt(0));
  if(idx<0) return {stemP:'',endP:f.p};
  return {stemP:f.p.slice(0,idx),endP:f.p.slice(idx)};
}
function acceptedForms(prepId,role){
  const f=FORMS[prepId][role];
  let arr=[{u:f.u,p:f.p,pm:f.pm||null,label:roleLabel(role)}];
  if(prepId==='min'&&role==='1p') arr.push({u:'ממנו',p:FORMS['min']['3ms'].p,pm:null,label:roleLabel(role)});
  if(settings&&settings.register==='colloquial'){
    if(role==='2fp') arr=arr.concat(acceptedForms(prepId,'2mp'));
    if(role==='3fp') arr=arr.concat(acceptedForms(prepId,'3mp'));
  }
  return arr;
}
function acceptedNorm(prepId,role){
  const arr=[];
  acceptedForms(prepId,role).forEach(function(f){
    arr.push(N(f.u));
    if(f.p) arr.push(N(f.p));
    if(f.pm) arr.push(N(f.pm));
  });
  return arr;
}
function matchesRole(prepId,role,input){return acceptedNorm(prepId,role).indexOf(N(input))>=0;}
function matchingRoles(prepId,input){
  const n=N(input);
  return ROLE_IDS.filter(function(r){return acceptedNorm(prepId,r).indexOf(n)>=0;});
}
// Spelling only: acceptedForms() also folds 2fp/3fp onto the masculine form,
// which would make one pointed form match two roles. Do not use it here.
function matchingRolesExact(prepId,displayedP){
  const T=parseClusters(displayedP);
  return ROLE_IDS.filter(function(r){
    const f=FORMS[prepId][r];
    return (f.p&&exact(T,parseClusters(f.p)))||(f.pm&&exact(T,parseClusters(f.pm)));
  });
}
function prepPoolForms(prepId,targetRole){
  const exclude=new Set([targetRole]);
  if(prepId==='min'&&targetRole==='1p') exclude.add('3ms');
  if(settings&&settings.register==='colloquial'){
    if(targetRole==='2fp') exclude.add('2mp');
    if(targetRole==='3fp') exclude.add('3mp');
  }
  return ROLE_IDS.filter(function(r){return !exclude.has(r);}).map(function(r){
    const f=FORMS[prepId][r];
    return {u:f.u,p:f.p,pm:f.pm||null,label:roleLabel(r)};
  });
}
function pronAccepted(role){
  let arr=[PRON_BY_ROLE[role].u];
  if(settings&&settings.register==='colloquial'){
    if(role==='2fp') arr.push(PRON_BY_ROLE['2mp'].u);
    if(role==='3fp') arr.push(PRON_BY_ROLE['3mp'].u);
  }
  return arr;
}
function effNikudCheck(){
  const v=(settings&&settings.nikudCheck)||'auto';
  if(v==='auto') return (settings&&settings.nikud==='always')?'smart':'off';
  return v;
}
function effectiveNikudMode(minMode){
  const eff=effNikudCheck();
  if(!minMode) return eff;
  const rank={off:0,smart:1,full:2};
  return (rank[minMode]||0)>rank[eff]?minMode:eff;
}
function parseClusters(s){
  if(!s) return [];
  const finalMap={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
  const arr=[];
  for(const ch of String(s)){
    const cp=ch.codePointAt(0);
    if(cp===0x20||cp===0x09||cp===0x0A||cp===0x0D) continue;
    if(cp>=0x0591&&cp<=0x05AF) continue;
    if(cp===0x05BD||cp===0x05BF||cp===0x05C1||cp===0x05C2) continue;
    if(cp===0x05BE||cp===0x05C0||(cp>=0x05C3&&cp<=0x05C6)) continue;
    if(cp>=0x05B0&&cp<=0x05BB){
      if(arr.length){
        let mark=cp;
        if(cp===0x05BA) mark=0x05B9;
        arr[arr.length-1].m.add(mark);
      }
      continue;
    }
    if(cp===0x05BC){
      if(arr.length&&arr[arr.length-1].c==='ו') arr[arr.length-1].m.add(0x05BC);
      continue;
    }
    if(cp===0x05C7){
      if(arr.length) arr[arr.length-1].m.add(0x05B8);
      continue;
    }
    if(cp>=0x05D0&&cp<=0x05EA){
      const base=finalMap[ch]||ch;
      arr.push({c:base,m:new Set()});
      continue;
    }
  }
  const out=[];
  for(let i=0;i<arr.length;i++){
    if(arr[i].c==='י'&&arr[i].m.size===0&&i+1<arr.length&&arr[i+1].c==='י'&&arr[i+1].m.size===0){
      out.push({c:'י',m:new Set()});i++;
    }else{
      out.push(arr[i]);
    }
  }
  return out;
}
function skeletonOf(clusters){return clusters.map(function(c){return c.c;}).join('');}
function setsEqual(a,b){
  if(a.size!==b.size) return false;
  let ok=true;
  a.forEach(function(x){if(!b.has(x))ok=false;});
  return ok;
}
function consistent(T,P){
  if(T.length!==P.length) return false;
  for(let i=0;i<T.length;i++){
    if(T[i].c!==P[i].c) return false;
    if(T[i].m.size>0&&!setsEqual(T[i].m,P[i].m)) return false;
  }
  return true;
}
function exact(T,P){
  if(T.length!==P.length) return false;
  for(let i=0;i<T.length;i++){
    if(T[i].c!==P[i].c) return false;
    if(!setsEqual(T[i].m,P[i].m)) return false;
  }
  return true;
}
function checkTyped(poolForms,accForms,input,minMode){
  const mode=effectiveNikudMode(minMode);
  if(mode==='off'){
    const n=N(input);
    const ok=accForms.some(function(f){return N(f.u)===n||(f.p&&N(f.p)===n)||(f.pm&&N(f.pm)===n);});
    return {status:ok?'correct':'wrong',reason:ok?'':'consonants',readings:[]};
  }
  const T=parseClusters(input);
  if(!T.length) return {status:'wrong',reason:'consonants',readings:[]};
  const skel=skeletonOf(T);
  const targetVariants=[];
  accForms.forEach(function(f){
    if(f.p) targetVariants.push({form:f,text:f.p,clusters:parseClusters(f.p)});
    if(f.pm) targetVariants.push({form:f,text:f.pm,clusters:parseClusters(f.pm)});
  });
  const matchingVariants=targetVariants.filter(function(v){return skeletonOf(v.clusters)===skel;});
  if(!matchingVariants.length) return {status:'wrong',reason:'consonants',readings:[]};
  const hasMarks=T.some(function(c){return c.m.size>0;});
  if(mode==='full'){
    if(!hasMarks) return {status:'wrong',reason:'needNikud',readings:[]};
    const ok=matchingVariants.some(function(v){return exact(T,v.clusters);});
    if(ok) return {status:'correct',reason:'',readings:[]};
    return {status:'wrong',reason:'nikud',readings:[]};
  }
  const targetOk=matchingVariants.some(function(v){return consistent(T,v.clusters);});
  if(!targetOk) return {status:'wrong',reason:hasMarks?'nikud':'consonants',readings:[]};
  const competitorMatches=[];
  (poolForms||[]).forEach(function(f){
    const variants=[];
    if(f.p) variants.push({text:f.p,clusters:parseClusters(f.p)});
    if(f.pm) variants.push({text:f.pm,clusters:parseClusters(f.pm)});
    const hit=variants.find(function(v){return skeletonOf(v.clusters)===skel&&consistent(T,v.clusters);});
    if(hit) competitorMatches.push({form:f,text:hit.text});
  });
  if(competitorMatches.length){
    const readings=[];
    matchingVariants.forEach(function(v){readings.push({text:v.text,label:v.form.label||''});});
    competitorMatches.forEach(function(c){readings.push({text:c.text,label:c.form.label||''});});
    return {status:'ambiguous',reason:'',readings:readings};
  }
  return {status:'correct',reason:'',readings:[]};
}

function getStat(key){
  if(!stats[key]) stats[key]={r:0,w:0,ms:0,fs:0,conf:{},last:0};
  return stats[key];
}
function statRate(key){
  const s=stats[key];
  if(!s) return null;
  const tot=s.r+s.w;
  return tot>0?Math.round(s.r/tot*100):null;
}
function isMastered(key){
  const s=stats[key];
  if(!s) return false;
  const tot=s.r+s.w;
  return tot>=3&&s.r/tot>=0.7;
}
function isAuto(key){const s=stats[key];return !!s&&s.fs>=3;}
function recordAnswer(key,correct,elapsed,given,mode){
  const s=getStat(key);
  const fastLimit=mode==='choice'?2500:7000;
  const fast=correct&&elapsed<=fastLimit;
  if(correct) s.r++; else s.w++;
  s.ms=s.ms?Math.round(s.ms*0.7+elapsed*0.3):Math.round(elapsed);
  if(fast) s.fs++; else s.fs=0;
  if(!correct&&given){const g=String(given).trim()||String(given);s.conf[g]=(s.conf[g]||0)+1;}
  s.last=Date.now();
  settings.score+=(correct?10:0)+(fast?5:0);
  if(correct){settings.streak++;if(settings.streak>settings.bestStreak)settings.bestStreak=settings.streak;}
  else settings.streak=0;
  saveStats();saveSettings();updateProgress();
  return {fast:fast,stat:s};
}
function progressKeys(){
  const keys=[];
  PREP_DATA.forEach(function(p){ROLE_IDS.forEach(function(r){keys.push(p.id+':'+r);});});
  ROLE_IDS.forEach(function(r){keys.push('pron:'+r);});
  return keys;
}
function updateProgress(){
  const keys=progressKeys();
  let done=0,auto=0;
  keys.forEach(function(k){if(isMastered(k))done++;if(isAuto(k))auto++;});
  const total=keys.length;
  const fill=document.getElementById('progress-fill');
  const text=document.getElementById('progress-text');
  const badge=document.getElementById('auto-badge');
  if(fill) fill.style.width=(done/total*100)+'%';
  if(text) text.textContent=done+' / '+total;
  if(badge){badge.textContent='⚡ '+auto;badge.title=t('auto')+': '+auto;}
}

function refreshVoices(){
  if(!('speechSynthesis' in window)) return;
  try{voices=speechSynthesis.getVoices()||[];}catch(e){voices=[];}
  heVoice=voices.find(function(v){return /^he([-_]|$)/i.test(v.lang||'');})||voices.find(function(v){return /hebrew/i.test(v.name||'');})||null;
  if(!heVoice&&voices.length&&!voiceToastShown&&document.getElementById('toast')){
    voiceToastShown=true;
    showToast(t('ttsNoVoice'));
  }
  if(settings){
    if(currentTab==='map') renderMap();
    else if(currentTab==='train') renderModePills();
  }
}
if('speechSynthesis' in window){
  refreshVoices();
  if(typeof speechSynthesis.addEventListener==='function') speechSynthesis.addEventListener('voiceschanged',refreshVoices);
  else speechSynthesis.onvoiceschanged=refreshVoices;
  const unlock=function(){try{speechSynthesis.resume();}catch(e){}refreshVoices();document.removeEventListener('pointerdown',unlock);document.removeEventListener('touchstart',unlock);document.removeEventListener('keydown',unlock);};
  document.addEventListener('pointerdown',unlock,{passive:true});
  document.addEventListener('touchstart',unlock,{passive:true});
  document.addEventListener('keydown',unlock);
}
function speechAvailable(){return !!heVoice;}
function speakHebrew(text){
  if(!settings||!settings.sound||!text) return;
  if(!('speechSynthesis' in window)||!heVoice){
    if(!voiceToastShown){voiceToastShown=true;showToast(t('ttsNoVoice'));}
    return;
  }
  try{
    speechSynthesis.cancel();
    if(speechSynthesis.paused) speechSynthesis.resume();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='he-IL';u.voice=heVoice;u.rate=.9;u.pitch=1;
    speechSynthesis.speak(u);
  }catch(e){}
}

function showToast(text){
  const el=document.getElementById('toast');
  if(!el) return;
  el.textContent=text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){el.classList.remove('show');},1900);
}
function openModal(html,wide){
  const card=document.getElementById('modal-card');
  const body=document.getElementById('modal-body');
  if(!card||!body) return;
  card.classList.toggle('wide',!!wide);
  body.innerHTML=html;
  document.getElementById('modal').classList.add('show');
}
function closeModal(){const m=document.getElementById('modal');if(m)m.classList.remove('show');}

function escAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function speakBtn(text){if(!speechAvailable())return '';return '<button class="speak-btn" type="button" data-say="'+escAttr(text)+'" aria-label="🔊">🔊</button>';}

function roleIcon(role,size){
  const meta=ROLE_META[role];
  const color=meta.p===1?'var(--accent)':meta.p===2?'var(--accent2)':'var(--olive)';
  const female=meta.g==='f';
  const plural=meta.n==='p';
  const self=role==='1s'||role==='1p';
  const s=size||48;
  function figure(f){
    const head='<circle cx="16" cy="9" r="4.8" fill="currentColor"/>';
    const body=f?'<path d="M16 13.5 L25.5 41 L6.5 41 Z" fill="currentColor"/>':'<path d="M10.5 15.5 Q16 11.8 21.5 15.5 L23 41 L9 41 Z" fill="currentColor"/>';
    return head+body;
  }
  let inner='';
  if(plural){
    inner='<g transform="translate(1,15) scale(.62)">'+figure(female)+'</g><g transform="translate(27,15) scale(.62)">'+figure(female)+'</g><g transform="translate(14,8) scale(.72)">'+figure(female)+'</g>';
  }else{
    inner='<g transform="translate(8,1)">'+figure(female)+'</g>';
  }
  let bubble='';
  if(self){
    bubble='<g><rect x="30" y="1" width="16" height="11" rx="4" fill="currentColor" opacity=".9"/><path d="M34 12 L33 16 L38 12 Z" fill="currentColor" opacity=".9"/><circle cx="34" cy="6.5" r="1.1" fill="var(--card)"/><circle cx="38" cy="6.5" r="1.1" fill="var(--card)"/><circle cx="42" cy="6.5" r="1.1" fill="var(--card)"/></g>';
  }
  return '<svg class="role-svg" width="'+s+'" height="'+s+'" viewBox="0 0 48 48" fill="none" style="color:'+color+'" aria-hidden="true">'+inner+bubble+'</svg>';
}
function prepIcon(id){
  const common='viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  const map={
    l:'<path d="M8 24 H33"/><path d="M26 17 L35 24 L26 31"/><circle cx="40" cy="24" r="3" fill="currentColor" stroke="none"/>',
    b:'<circle cx="24" cy="24" r="15"/><circle cx="24" cy="24" r="4" fill="currentColor" stroke="none"/>',
    shel:'<circle cx="24" cy="25" r="5" fill="currentColor" stroke="none"/><path d="M24 20 V11"/><circle cx="24" cy="8.5" r="2.3" fill="currentColor" stroke="none"/><path d="M28.5 23 L36 16.5"/><circle cx="38" cy="15" r="2.3" fill="currentColor" stroke="none"/><path d="M19.5 23 L12 16.5"/><circle cx="10" cy="15" r="2.3" fill="currentColor" stroke="none"/>',
    et:'<path d="M7 31 H29"/><path d="M23 24 L32 31 L23 38"/><circle cx="38" cy="31" r="4" fill="currentColor" stroke="none"/><path d="M38 20 V14"/><path d="M33 14 H43"/>',
    im:'<circle cx="15" cy="24" r="5.5" fill="currentColor" stroke="none"/><circle cx="33" cy="24" r="5.5" fill="currentColor" stroke="none"/><path d="M21 24 H27"/>',
    al:'<path d="M5 35 H43"/><circle cx="24" cy="26" r="6" fill="currentColor" stroke="none"/><path d="M24 32 V37"/>',
    el:'<path d="M5 24 H23"/><path d="M18 19 L24 24 L18 29"/><circle cx="34" cy="16" r="4.2" fill="currentColor" stroke="none"/><path d="M27 37 Q34 27 41 37"/>',
    min:'<circle cx="11" cy="24" r="4.5" fill="currentColor" stroke="none"/><path d="M16 24 H41"/><path d="M35 18 L43 24 L35 30"/><path d="M11 17 V13"/><path d="M11 31 V35"/>',
    etsel:'<path d="M26 22 L34 15 L42 22 V37 H26 Z"/><path d="M31 37 V29 H37 V37"/><circle cx="15" cy="30" r="4.5" fill="currentColor" stroke="none"/><path d="M20 30 H24"/>',
    bishvil:'<rect x="12" y="20" width="24" height="18" rx="2"/><path d="M12 26 H36"/><path d="M24 20 V38"/><path d="M24 20 Q16 12 20 10 Q24 8 24 20"/><path d="M24 20 Q32 12 28 10 Q24 8 24 20"/>'
  };
  return '<svg class="prep-svg" width="48" height="48" '+common+'>'+map[id]+'</svg>';
}
function heFormHTML(prepId,role,nikud,context){
  const p=PREPS[prepId];
  const f=FORMS[prepId][role];
  const cls=personClass(role);
  const roleNum=ROLE_META[role].p;
  const ctx=context||'ref';
  const plain=ctx==='practice'&&settings&&settings.endColors===false;
  if(plain){
    if(p.irregularRoles.indexOf(role)>=0){
      return '<span class="he end-plain" data-endrole="'+roleNum+'" lang="he" dir="rtl">'+(nikud?f.p:f.u)+'</span><span class="irreg-mark" title="нерегулярная форма">•</span>';
    }
    if(nikud){
      const sp=splitNikud(prepId,role);
      return '<span class="he" lang="he" dir="rtl"><span class="stem">'+sp.stemP+'</span><span class="end-plain" data-endrole="'+roleNum+'">'+sp.endP+'</span></span>';
    }
    const parts=formParts(prepId,role);
    return '<span class="he" lang="he" dir="rtl"><span class="stem">'+parts.stem+'</span><span class="end-plain" data-endrole="'+roleNum+'">'+parts.end+'</span></span>';
  }
  if(p.irregularRoles.indexOf(role)>=0){
    return '<span class="he he-end '+cls+'" data-endrole="'+roleNum+'" lang="he" dir="rtl">'+(nikud?f.p:f.u)+'</span><span class="irreg-mark" title="нерегулярная форма">•</span>';
  }
  if(nikud){
    const sp=splitNikud(prepId,role);
    return '<span class="he" lang="he" dir="rtl"><span class="stem">'+sp.stemP+'</span><span class="he-end '+cls+'" data-endrole="'+roleNum+'">'+sp.endP+'</span></span>';
  }
  const parts=formParts(prepId,role);
  return '<span class="he" lang="he" dir="rtl"><span class="stem">'+parts.stem+'</span><span class="he-end '+cls+'" data-endrole="'+roleNum+'">'+parts.end+'</span></span>';
}
function frameBlankHTML(he){
  const parts=he.split('___');
  return parts[0]+'<span class="frame-blank"></span>'+(parts[1]||'');
}

function updateThemeButton(){
  const btn=document.getElementById('btn-theme');
  if(!btn) return;
  const dark=currentTheme==='dark';
  btn.textContent=dark?'☀️':'🌙';
  const label=t(dark?'themeLight':'themeDark');
  btn.title=label;btn.setAttribute('aria-label',label);
}
function applyTheme(theme,persist){
  currentTheme=theme==='dark'?'dark':'light';
  document.documentElement.setAttribute('data-theme',currentTheme);
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content',currentTheme==='dark'?'#16120f':'#f5ede0');
  if(persist){try{localStorage.setItem(LS_THEME,currentTheme);}catch(e){}}
  updateThemeButton();
}
function toggleTheme(){applyTheme(currentTheme==='dark'?'light':'dark',true);}
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function endColorsText(){return '🎨 '+t('endColorsLabel')+': '+(settings.endColors?t('endColorsOn'):t('endColorsOff'));}
function applyEndColorsSetting(){
  const on=!!(settings&&settings.endColors);
  document.body.classList.toggle('end-colors-off',!on);
  if(on){
    document.querySelectorAll('.end-plain[data-endrole]').forEach(function(el){
      el.classList.remove('end-plain');
      el.classList.add('he-end','role-'+el.getAttribute('data-endrole'));
    });
  }
  document.querySelectorAll('[data-endcolors-chip]').forEach(function(b){
    b.classList.toggle('active',on);
    b.setAttribute('aria-pressed',on?'true':'false');
    b.textContent=endColorsText();
  });
  const cb=document.getElementById('set-endcolors');
  if(cb) cb.checked=on;
}
function toggleEndColors(){settings.endColors=!settings.endColors;saveSettings();applyEndColorsSetting();}
function nikudEffectiveLabel(){
  const eff=effNikudCheck();
  if(settings.nikudCheck==='auto') return t('nikudCheckAuto')+' → '+(eff==='smart'?t('nikudCheckSmart'):eff==='full'?t('nikudCheckFull'):t('nikudCheckOff'));
  if(eff==='smart') return t('nikudCheckSmart');
  if(eff==='full') return t('nikudCheckFull');
  return t('nikudCheckOff');
}
function nikudChipText(){return 'ָ '+t('nikudCheckLabel')+': '+nikudEffectiveLabel();}
function applyNikudCheckSetting(){
  document.querySelectorAll('[data-nikudchip]').forEach(function(b){
    b.textContent=nikudChipText();
    b.classList.toggle('active',effNikudCheck()!=='off');
    b.setAttribute('aria-pressed',effNikudCheck()!=='off'?'true':'false');
  });
  const sel=document.getElementById('set-nikudcheck');
  if(sel) sel.value=settings.nikudCheck;
  buildNikudRow();
  syncKeyboard();
}
function cycleNikudCheck(){
  const vals=['auto','off','smart','full'];
  const i=vals.indexOf(settings.nikudCheck);
  settings.nikudCheck=vals[(i+1)%vals.length];
  saveSettings();applyNikudCheckSetting();
}
function practiceTogglesHTML(showEndColors){
  let html='<div class="practice-toggles">';
  if(showEndColors) html+='<button class="toggle-chip'+(settings.endColors?' active':'')+'" type="button" data-endcolors-chip="1" aria-pressed="'+(settings.endColors?'true':'false')+'">'+endColorsText()+'</button>';
  html+='<button class="toggle-chip'+(effNikudCheck()!=='off'?' active':'')+'" type="button" data-nikudchip="1" aria-pressed="'+(effNikudCheck()!=='off'?'true':'false')+'">'+nikudChipText()+'</button>';
  html+='</div><div class="toggle-note">'+t('nikudCheckAutoNote')+'</div>';
  return html;
}
function showNikudNotice(res){
  const box=document.getElementById('nikud-notice');
  if(!box) return;
  const readings=(res.readings||[]).map(function(r){
    return '<span class="he" lang="he" dir="rtl">'+escHtml(r.text)+'</span>'+(r.label?' <span class="nikud-role">('+escHtml(r.label)+')</span>':'');
  }).join(' · ');
  box.innerHTML='<div class="nikud-notice-title">'+t('nikudNoticeTitle')+'</div><div class="nikud-readings">'+readings+'</div><div class="nikud-notice-hint">'+t('addNikud')+'</div>';
  box.style.display='block';
}
function hideNikudNotice(){const box=document.getElementById('nikud-notice');if(box){box.style.display='none';box.innerHTML='';}}
function updateFlags(){
  document.querySelectorAll('.flag-btn').forEach(function(b){
    const active=b.dataset.lang===currentLang;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',active?'true':'false');
  });
}
function applyLanguage(){
  document.documentElement.lang=currentLang;
  document.title=t('appTitle');
  document.querySelectorAll('[data-i18n]').forEach(function(el){el.textContent=t(el.dataset.i18n);});
  updateFlags();
  updateThemeButton();
  const kbBtn=document.getElementById('btn-keyboard');
  if(kbBtn){kbBtn.title=t('keyboardTitle');kbBtn.setAttribute('aria-label',t('keyboardTitle'));}
  const kbClose=document.getElementById('btn-keyboard-close');
  if(kbClose) kbClose.setAttribute('aria-label',t('keyboardHide'));
  const setBtn=document.getElementById('btn-settings');
  if(setBtn) setBtn.setAttribute('aria-label',t('settingsTitle'));
  phraseAnswered=false;phraseHintShown=false;
  renderCurrent();
  applyEndColorsSetting();
  applyNikudCheckSetting();
}
function setLang(code){
  if(currentLang===code) return;
  currentLang=code;saveLang();closeModal();applyLanguage();
}
