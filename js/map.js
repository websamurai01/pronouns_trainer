function switchTab(tab){
  currentTab=tab;
  if(tab==='phrases'){phraseAnswered=false;phraseHintShown=false;}
  stopTimers();
  document.querySelectorAll('.tab').forEach(function(el){el.classList.toggle('active',el.dataset.tab===tab);});
  document.querySelectorAll('.screen').forEach(function(el){el.classList.toggle('active',el.id==='screen-'+tab);});
  renderCurrent();
  syncKeyboard();
}
function renderCurrent(){
  if(currentTab==='map') renderMap();
  else if(currentTab==='path') renderPath();
  else if(currentTab==='train') renderTrain();
  else if(currentTab==='phrases') renderPhrases();
  else if(currentTab==='prefix') renderPrefix();
  else renderPhrases();
}

function mapRolesHTML(){
  let html='<div class="section-title">'+t('rolesTitle')+'</div><div class="section-intro">'+t('rolesIntro')+'</div><div class="role-grid">';
  ROLE_IDS.forEach(function(role){
    const pr=PRON_BY_ROLE[role];
    const nikud=settings.nikud!=='off'?pr.p:pr.u;
    const tr=settings.translit?(currentLang==='en'?pr.tEn:pr.t):'';
    html+='<div class="role-card '+personClass(role)+'">';
    html+='<div class="role-icon">'+roleIcon(role,48)+'</div>';
    html+='<div class="role-pron he" lang="he" dir="rtl">'+nikud+'</div>';
    if(tr) html+='<div class="role-translit">'+tr+'</div>';
    html+='<div class="role-label">'+roleLabel(role)+'</div>';
    html+=speakBtn(pr.u);
    html+='</div>';
  });
  html+='</div>';
  return html;
}
function mapKeyHTML(){
  let html='<div class="section-title">'+t('keyTitle')+'</div><div class="section-intro">'+t('keyIntro')+'</div><div class="key-table">';
  ROLE_IDS.forEach(function(role){
    html+='<div class="key-row '+personClass(role)+'"><div class="key-role">'+roleIcon(role,26)+'<span>'+roleLabel(role)+'</span></div><div class="key-end he" lang="he" dir="rtl">'+KEY_ENDINGS[role].join(' / ')+'</div></div>';
  });
  html+='</div>';
  html+='<div class="rule-card"><div class="rule-title">'+t('keyRuleTitle')+'</div>'+t('keyRuleText')+'</div>';
  html+='<div class="section-title">'+t('familiesTitle')+'</div><div class="families">';
  html+='<div class="family-card"><div class="family-title">'+t('familySimple')+'</div><div class="family-list he" lang="he" dir="rtl">ל · ב · של</div></div>';
  html+='<div class="family-card"><div class="family-title">'+t('familyYod')+'</div><div class="family-list he" lang="he" dir="rtl">על · אל</div></div>';
  html+='<div class="family-card"><div class="family-title">'+t('familyConsonant')+'</div><div class="family-list he" lang="he" dir="rtl">את · עם · אצל · בשביל</div></div>';
  html+='<div class="family-card"><div class="family-title">'+t('familyIrregular')+'</div><div class="family-list he" lang="he" dir="rtl">מ</div></div>';
  html+='</div>';
  html+='<div class="section-title">'+t('examplesTitle')+'</div><div class="example-scroll"><table class="example-table"><thead><tr><th>'+t('roleLabel')+'</th><th class="he" lang="he">ל</th><th class="he" lang="he">על</th><th class="he" lang="he">אצל</th></tr></thead><tbody>';
  ROLE_IDS.forEach(function(role){
    html+='<tr><td class="'+personClass(role)+'" style="font-weight:800;">'+roleLabel(role)+'</td>';
    ['l','al','etsel'].forEach(function(pid){
      html+='<td class="he" lang="he" dir="rtl">'+heFormHTML(pid,role,settings.nikud!=='off')+'</td>';
    });
    html+='</tr>';
  });
  html+='</tbody></table></div>';
  return html;
}
function mapPrepsHTML(){
  let html='<div class="section-title">'+t('prepsTitle')+'</div><div class="section-intro">'+t('prepsIntro')+'</div>';
  PREP_DATA.forEach(function(p){
    html+='<div class="prep-card"><div class="prep-head"><div class="prep-icon">'+prepIcon(p.id)+'</div><div style="min-width:0;"><div class="prep-name he" lang="he" dir="rtl">'+p.he+'</div><div class="prep-meaning">'+prepMeaning(p)+'</div><div class="prep-family">'+(p.family==='simple'?t('familySimple'):p.family==='yod'?t('familyYod'):p.family==='irregular'?t('familyIrregular'):t('familyConsonant'))+'</div></div></div><div class="form-table">';
    ROLE_IDS.forEach(function(role){
      const f=FORMS[p.id][role];
      const tr=settings.translit?translitOf(f):'';
      html+='<div class="form-row"><div class="form-role '+personClass(role)+'">'+roleLabel(role)+'</div><div class="form-he">'+heFormHTML(p.id,role,settings.nikud!=='off')+'</div><div style="text-align:right;">'+speakBtn(f.u)+(tr?'<div class="form-translit">'+tr+'</div>':'')+'</div><div class="form-gloss">'+glossOf(p.id,role)+'</div></div>';
    });
    html+='</div></div>';
  });
  return html;
}
function mapHeatHTML(){
  let html='<div class="section-title">'+t('heatTitle')+'</div><div class="section-intro">'+t('heatIntro')+'</div><div class="heat-scroll"><table class="heat-table"><thead><tr><th></th>';
  PREP_DATA.forEach(function(p){html+='<th class="he" lang="he" title="'+escAttr(prepMeaning(p))+'">'+p.he+'</th>';});
  html+='</tr></thead><tbody>';
  ROLE_IDS.forEach(function(role){
    html+='<tr><th class="heat-role"><span class="heat-role-inner '+personClass(role)+'">'+roleIcon(role,22)+'<span>'+roleLabel(role)+'</span></span></th>';
    PREP_DATA.forEach(function(p){
      const key=p.id+':'+role;
      const rate=statRate(key);
      const bg=rate===null?'var(--track)':rate>=80?'var(--olive)':rate>=50?'var(--accent2)':'var(--danger)';
      const label=rate===null?'':rate+'%';
      html+='<td><button class="heat-cell" type="button" data-heat="'+p.id+'|'+role+'" style="background:'+bg+'">'+label+'</button></td>';
    });
    html+='</tr>';
  });
  html+='</tbody></table></div>';
  html+='<div class="heat-legend"><span><span class="legend-dot" style="background:var(--olive)"></span>≥80%</span><span><span class="legend-dot" style="background:var(--accent2)"></span>50–79%</span><span><span class="legend-dot" style="background:var(--danger)"></span><50%</span><span><span class="legend-dot" style="background:var(--track)"></span>'+t('heatNoData')+'</span></div>';
  return html;
}
function mapTrapsHTML(){
  let html='<div class="section-title">'+t('trapsTitle')+'</div><div class="section-intro">'+t('trapsIntro')+'</div>';
  TRAPS.forEach(function(tr){
    html+='<div class="trap-card"><div class="trap-title">'+t('trapCard')+'</div><div class="trap-text">'+(currentLang==='en'?tr.en:tr.ru)+'</div></div>';
  });
  return html;
}
function renderMap(){
  const body=document.getElementById('map-body');
  if(!body) return;
  if(currentMapSub==='roles') body.innerHTML=mapRolesHTML();
  else if(currentMapSub==='key') body.innerHTML=mapKeyHTML();
  else if(currentMapSub==='preps') body.innerHTML=mapPrepsHTML();
  else if(currentMapSub==='heat') body.innerHTML=mapHeatHTML();
  else body.innerHTML=mapTrapsHTML();
}
function openHeat(prepId,role){
  const f=FORMS[prepId][role];
  const key=prepId+':'+role;
  const s=stats[key];
  const rate=statRate(key);
  const attempts=s?s.r+s.w:0;
  let conf='';
  if(s&&s.conf){
    const entries=Object.keys(s.conf).map(function(k){return k+' ×'+s.conf[k];}).slice(0,5);
    if(entries.length) conf='<div class="conf-list">'+entries.join(' · ')+'</div>';
  }
  const html='<div class="modal-title">'+roleLabel(role)+' · <span class="he" lang="he">'+PREPS[prepId].he+'</span></div>'+
    '<div class="modal-form">'+heFormHTML(prepId,role,true)+'</div>'+
    trDiv(f,'modal-translit')+
    '<div class="modal-gloss">'+glossOf(prepId,role)+'</div>'+
    '<div style="text-align:center;">'+speakBtn(f.u)+'</div>'+
    '<div class="modal-stats">'+
      '<div>'+t('attempts')+': <b>'+attempts+'</b></div>'+
      '<div>'+t('accuracy')+': <b>'+(rate===null?t('noData'):rate+'%')+'</b></div>'+
      '<div>'+t('avgTime')+': <b>'+(s&&s.ms?Math.round(s.ms)+' ms':t('noData'))+'</b></div>'+
      '<div>'+t('fastStreak')+': <b>'+(s?s.fs:0)+'</b></div>'+
      '<div>'+t('prepLabel')+': <b class="he" lang="he">'+PREPS[prepId].he+'</b> · '+(PREPS[prepId].family==='simple'?t('familySimple'):PREPS[prepId].family==='yod'?t('familyYod'):PREPS[prepId].family==='irregular'?t('familyIrregular'):t('familyConsonant'))+'</div>'+
      conf+
    '</div>';
  openModal(html);
}

const LEVELS=[
  {id:0,titleRu:'Роли и ключ',titleEn:'Roles & key',descRu:'Самостоятельные местоимения ↔ роль, окончание ↔ роль.',descEn:'Independent pronouns ↔ role, ending ↔ role.',mode:'keymini',preps:[],frames:[]},
  {id:1,titleRu:'ל, ב, של',titleEn:'ל, ב, של',descRu:'Простые предлоги: дательный, контейнер, принадлежность.',descEn:'Simple prepositions: dative, container, belonging.',mode:'role2form',preps:['l','b','shel'],frames:[]},
  {id:2,titleRu:'יש/אין и «мне»-состояния',titleEn:'יש/אין and “to me” states',descRu:'Есть/нет у…, холодно, жарко, трудно, хочется.',descEn:'Have/no, cold, hot, hard, feel like.',mode:'role2form',preps:[],frames:['yesh','eyn','kar','cham','kashe','hashuv','ba','ichpat','nimas','koev']},
  {id:3,titleRu:'את, עם',titleEn:'את, עם',descRu:'Маркер объекта и «с кем».',descEn:'Object marker and “with whom”.',mode:'role2form',preps:['et','im'],frames:[]},
  {id:4,titleRu:'על, אל, מ',titleEn:'על, אל, מ',descRu:'Поверхность/тема, стрелка к человеку, источник.',descEn:'Surface/topic, arrow to a person, source.',mode:'role2form',preps:['al','el','min'],frames:[]},
  {id:5,titleRu:'אצל, בשביל',titleEn:'אצל, בשביל',descRu:'«У кого-то» и «для кого-то».',descEn:'“At someone’s place” and “for someone”.',mode:'role2form',preps:['etsel','bishvil'],frames:[]},
  {id:6,titleRu:'Глагол + предлог',titleEn:'Verb + preposition',descRu:'Кадры-глаголы: ждать, бояться, скучать, думать…',descEn:'Verb frames: wait, fear, miss, think…',mode:'role2form',preps:[],frames:['mechake','medaber','choshev','mitgaagea','mefached','somech','ohev','shoel','ozer','maamin','mistakel','nifgash','makshiv','mode','mevakesh','maskim','cholem','doeg']},
  {id:7,titleRu:'Микс и скорость',titleEn:'Mix and speed',descRu:'Все предлоги и кадры на время.',descEn:'All prepositions and frames against the clock.',mode:'speed',preps:['l','b','shel','et','im','al','el','min','etsel','bishvil'],frames:['yesh','eyn','kar','cham','kashe','hashuv','ba','ichpat','nimas','koev','mechake','medaber','choshev','mitgaagea','mefached','somech','ohev','shoel','ozer','maamin','mistakel','nifgash','makshiv','mode','mevakesh','maskim','cholem','doeg']}
];
function levelKeys(level){
  const keys=[];
  if(level.id===0){
    ROLE_IDS.forEach(function(r){keys.push('pron:'+r);keys.push('end:'+r);});
    return keys;
  }
  level.preps.forEach(function(pid){ROLE_IDS.forEach(function(r){keys.push(pid+':'+r);});});
  level.frames.forEach(function(fid){ROLE_IDS.forEach(function(r){keys.push('frame:'+fid+':'+r);});});
  return keys;
}
function levelProgress(level){
  const keys=levelKeys(level);
  let done=0;
  keys.forEach(function(k){if(isMastered(k))done++;});
  return {done:done,total:keys.length,pct:keys.length?Math.round(done/keys.length*100):0};
}
function levelUnlocked(index){
  if(!settings.strictPath) return true;
  if(index===0) return true;
  return levelProgress(LEVELS[index-1]).pct>=70;
}
function renderPath(){
  const scr=document.getElementById('screen-path');
  if(!scr) return;
  let html='<div class="section-title">'+t('pathTitle')+'</div><div class="section-intro">'+t('pathIntro')+'</div><div class="path-list">';
  LEVELS.forEach(function(lv,idx){
    const pr=levelProgress(lv);
    const locked=!levelUnlocked(idx);
    html+='<button class="path-card'+(locked?' locked':'')+'" type="button" data-level="'+lv.id+'"'+(locked?' disabled':'')+'>';
    html+='<div class="ring" style="--pct:'+pr.pct+'"><div class="ring-inner">'+pr.pct+'%</div></div>';
    html+='<div class="path-info"><div class="path-title">'+lv.id+'. '+(currentLang==='en'?lv.titleEn:lv.titleRu)+'</div>';
    html+='<div class="path-desc">'+(currentLang==='en'?lv.descEn:lv.descRu)+'</div>';
    html+='<div class="path-meta">'+t('mastered')+' '+pr.done+' '+t('of')+' '+pr.total+(locked?' · 🔒 '+t('levelLocked'):'')+'</div></div>';
    html+='</button>';
  });
  html+='</div>';
  scr.innerHTML=html;
}
function startLevel(id){
  const lv=LEVELS[id];
  if(!lv) return;
  stopTimers();
  trainFilter.preps=new Set(lv.preps||[]);
  trainFilter.frames=new Set(lv.frames||[]);
  trainFilter.persons=new Set([1,2,3]);
  trainFilter.nums=new Set(['s','p']);
  trainFilter.gens=new Set(['m','f']);
  trainFilter.weak=false;
  trainFilter.notAuto=false;
  currentMode=lv.mode||'role2form';
  currentQ=null;keyMiniQ=null;runState=null;speedState=null;
  currentTab='train';
  document.querySelectorAll('.tab').forEach(function(el){el.classList.toggle('active',el.dataset.tab==='train');});
  document.querySelectorAll('.screen').forEach(function(el){el.classList.toggle('active',el.id==='screen-train');});
  renderTrain();
  syncKeyboard();
}

