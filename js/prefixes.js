function pfxTagLabel(tag){return t('pfxTag'+tag.charAt(0).toUpperCase()+tag.slice(1));}
function pfxPrefix(id){return PREFIXES.find(function(p){return p.id===id;})||null;}
function pfxRuleText(tag){
  const r=PFX_RULES.find(function(x){return x.tag===tag;});
  return r?(currentLang==='en'?r.en:r.ru):pfxTagLabel(tag);
}
function pfxExamplesHTML(tag,count){
  const items=PFX_ITEMS.filter(function(it){return it.tag===tag;}).slice(0,count||2);
  if(!items.length) return '';
  let html='<div class="pfx-examples">';
  items.forEach(function(it){
    html+='<div class="pfx-example"><span class="he" lang="he" dir="rtl">'+it.p+'</span><span>'+pfxTranslitOf(it)+'</span><span>'+(currentLang==='en'?it.glossEn:it.glossRu)+'</span>'+speakBtn(it.p)+'</div>';
  });
  html+='</div>';
  return html;
}
function renderPrefix(){
  const scr=document.getElementById('screen-prefix');
  if(!scr) return;
  let html='<div class="subtabs" id="prefix-subtabs">';
  html+='<div class="subtab '+(currentPrefixSub==='ref'?'active':'')+'" data-psub="ref">'+t('pfxSubRef')+'</div>';
  html+='<div class="subtab '+(currentPrefixSub==='train'?'active':'')+'" data-psub="train">'+t('pfxSubTrain')+'</div>';
  html+='<div class="subtab '+(currentPrefixSub==='map'?'active':'')+'" data-psub="map">'+t('pfxSubMap')+'</div>';
  html+='</div><div id="prefix-body"></div>';
  scr.innerHTML=html;
  const body=document.getElementById('prefix-body');
  if(currentPrefixSub==='ref') body.innerHTML=prefixRefHTML();
  else if(currentPrefixSub==='train') renderPrefixTrain(body);
  else body.innerHTML=prefixMapHTML();
}
function prefixRefHTML(){
  let html='<div class="pfx-mnemonic"><div class="pfx-mnemonic-title">'+t('pfxMnemonicTitle')+'</div><div class="pfx-mnemonic-intro">'+t('pfxMnemonicIntro')+'</div><div class="pfx-tiles">';
  PREFIXES.forEach(function(p){
    html+='<button class="pfx-tile" type="button" data-pfxletter="'+p.id+'"><span class="pfx-tile-letter he" lang="he" dir="rtl">'+p.id+'</span><span class="pfx-tile-name">'+(currentLang==='en'?p.nameEn:p.nameRu)+'</span></button>';
  });
  html+='</div></div>';
  html+='<div class="section-title">'+t('pfxRulesTitle')+'</div>';
  ['plain','article','sheva','yod','guttural','u'].forEach(function(tag){
    html+='<div class="pfx-rule-card"><div class="pfx-rule-title">'+pfxTagLabel(tag)+'</div><div class="pfx-rule-text">'+pfxRuleText(tag)+'</div>'+pfxExamplesHTML(tag,2)+'</div>';
  });
  html+='<div class="section-title">'+t('pfxTrapsTitle')+'</div>';
  PFX_TRAPS.forEach(function(tr){
    html+='<div class="pfx-trap">'+(currentLang==='en'?tr.en:tr.ru)+'</div>';
  });
  return html;
}
function openPrefixModal(id){
  const p=pfxPrefix(id);
  if(!p) return;
  let html='<div class="modal-title"><span class="he" lang="he" dir="rtl" style="font-size:30px;">'+p.id+'</span> · '+(currentLang==='en'?p.nameEn:p.nameRu)+'</div>';
  html+='<div class="pfx-rule-text">'+(currentLang==='en'?p.meaningEn:p.meaningRu)+'</div>';
  html+='<div class="pfx-examples" style="margin-top:8px;">';
  p.forms.forEach(function(f){
    html+='<div class="pfx-example"><span class="he" lang="he" dir="rtl" style="font-size:22px;">'+f.p+'</span><span>'+pfxTranslitOf(f)+'</span><span>'+(currentLang==='en'?f.ruleEn:f.ruleRu)+'</span>'+speakBtn(f.p)+'</div>';
  });
  html+='</div>';
  const examples=PFX_ITEMS.filter(function(it){return it.prefix===id;}).slice(0,2);
  if(examples.length){
    html+='<div class="section-title" style="margin-top:10px;">'+t('pfxExamples')+'</div>';
    examples.forEach(function(it){
      html+='<div class="pfx-example"><span class="he" lang="he" dir="rtl">'+it.p+'</span><span>'+pfxTranslitOf(it)+'</span><span>'+(currentLang==='en'?it.glossEn:it.glossRu)+'</span>'+speakBtn(it.p)+'</div>';
    });
  }
  openModal(html,true);
}
function renderPrefixTrain(body){
  body.innerHTML='<div class="section-title">'+t('pfxTrainTitle')+'</div>'+practiceTogglesHTML(false)+'<div class="filter-wrap" id="pfx-filters"></div><div class="mode-pills" id="pfx-modes"></div><div id="pfx-area"></div>';
  renderPfxFilters();
  renderPfxModes();
  renderPfxArea();
}
function renderPfxFilters(){
  const box=document.getElementById('pfx-filters');
  if(!box) return;
  const f=settings.pfxFilter;
  let html='<div class="filter-row"><span class="filter-label">'+t('pfxFilterPrefixes')+'</span>';
  PREFIXES.forEach(function(p){
    html+='<button class="chip'+(f.prefixes.indexOf(p.id)>=0?' active':'')+'" type="button" data-pfxpref="'+p.id+'"><span class="he" lang="he" dir="rtl">'+p.id+'</span></button>';
  });
  html+='</div>';
  html+='<div class="filter-row"><span class="filter-label">'+t('pfxFilterTags')+'</span>';
  ['plain','article','sheva','yod','guttural','u','combo','pron'].forEach(function(tag){
    html+='<button class="chip'+(f.tags.indexOf(tag)>=0?' active':'')+'" type="button" data-pfxtag="'+tag+'">'+pfxTagLabel(tag)+'</button>';
  });
  html+='</div>';
  html+='<div class="filter-row"><span class="filter-label">'+t('pfxFilterForms')+'</span>';
  PREFIXES.forEach(function(p){
    p.forms.forEach(function(form){
      if(form.noQuiz) return;
      html+='<button class="chip'+(f.forms.indexOf(form.p)>=0?' active':'')+'" type="button" data-pfxformfilter="'+escAttr(form.p)+'"><span class="he" lang="he" dir="rtl">'+form.p+'</span></button>';
    });
  });
  html+='</div>';
  html+='<div class="filter-row"><button class="chip'+(f.weak?' active':'')+'" type="button" data-pfxweak="1">'+t('pfxFilterWeak')+'</button><button class="chip'+(f.notAuto?' active':'')+'" type="button" data-pfxnotauto="1">'+t('pfxFilterNotAuto')+'</button><button class="chip" type="button" data-pfxreset="1">↺ '+t('pfxFilterReset')+'</button></div>';
  box.innerHTML=html;
}
function pfxFilteredItems(){
  const f=settings.pfxFilter;
  return PFX_ITEMS.filter(function(it){
    if(f.prefixes.length&&f.prefixes.indexOf(it.prefix)<0) return false;
    if(f.tags.length&&f.tags.indexOf(it.tag)<0) return false;
    if(f.forms.length&&f.forms.indexOf(it.pfxForm)<0) return false;
    if(f.weak&&isMastered(it.key)) return false;
    if(f.notAuto&&isAuto(it.key)) return false;
    return true;
  });
}
function pfxBuildPool(){return pfxFilteredItems();}
function pfxWordPool(){return pfxFilteredItems().filter(function(it){return it.tag!=='combo'&&it.tag!=='pron';});}
function pfxLetterPool(){
  const f=settings.pfxFilter;
  return PREFIXES.filter(function(p){return !f.prefixes.length||f.prefixes.indexOf(p.id)>=0;});
}
const PFX_MODES=[{id:'letter',key:'pfxModeLetter'},{id:'build',key:'pfxModeBuild'},{id:'form',key:'pfxModeForm'},{id:'parse',key:'pfxModeParse'},{id:'speed',key:'pfxModeSpeed'},{id:'phrases',key:'pfxModePhrases'}];
function renderPfxModes(){
  const box=document.getElementById('pfx-modes');
  if(!box) return;
  let html='';
  PFX_MODES.forEach(function(m){html+='<button class="mode-pill'+(pfxMode===m.id?' active':'')+'" type="button" data-pfxmode="'+m.id+'">'+t(m.key)+'</button>';});
  box.innerHTML=html;
}
function renderPfxArea(){
  const area=document.getElementById('pfx-area');
  if(!area) return;
  activeInput=null;
  if(pfxMode==='letter') renderPfxLetter();
  else if(pfxMode==='build') renderPfxBuild();
  else if(pfxMode==='form') renderPfxForm();
  else if(pfxMode==='parse') renderPfxParse();
  else if(pfxMode==='speed') renderPfxSpeed();
  else renderPfxPhrases();
  syncKeyboard();
}
function pfxPick(pool){
  if(!pool||!pool.length) return null;
  let best=null;
  for(let attempt=0;attempt<6;attempt++){
    const cand=weightedPick(pool);
    const l1=pfxHistory[pfxHistory.length-1],l2=pfxHistory[pfxHistory.length-2];
    if(l1&&l2&&l1.prefix===cand.prefix&&l2.prefix===cand.prefix) continue;
    best=cand;break;
  }
  if(!best) best=weightedPick(pool);
  pfxHistory.push(best);
  if(pfxHistory.length>6) pfxHistory.shift();
  return best;
}
function pfxRecord(key,correct,elapsed,given,mode){recordAnswer(key,correct,elapsed,given,mode);}
function schedulePfxNext(delay){
  if(advanceTimer) clearTimeout(advanceTimer);
  advanceTimer=setTimeout(function(){advanceTimer=null;pfxQ=null;pfxAnswered=false;renderPfxArea();},delay);
}
function pfxLetterOptions(id){
  const all=PREFIXES.filter(function(p){return p.id!==id;});
  shuffle(all);
  return shuffle([pfxPrefix(id)].concat(all.slice(0,3)));
}
function pfxResultHTML(p,correct){
  let html='<div class="result-box '+(correct?'ok':'bad')+'"><div class="result-title">'+(correct?'✅ '+t('correct'):'❌ '+t('wrong'))+'</div>';
  html+='<div class="result-he he" lang="he" dir="rtl">'+p.id+'</div><div class="result-gloss">'+(currentLang==='en'?p.meaningEn:p.meaningRu)+'</div>';
  html+=speakBtn(p.id);
  html+='</div>';
  return html;
}
function renderPfxLetter(){
  const area=document.getElementById('pfx-area');
  if(!area) return;
  if(!pfxQ){
    const pool=pfxLetterPool().map(function(p){return {id:p.id,prefix:p.id,key:'pfxm:'+p.id};});
    pfxQ=pfxPick(pool);
  }
  const q=pfxQ;
  if(!q){area.innerHTML='<div class="empty-train">'+t('pfxEmpty')+'</div>';return;}
  pfxAnswered=false;pfxStart=performance.now();
  const p=pfxPrefix(q.id);
  const opts=pfxLetterOptions(q.id);
  let html='<div class="pfx-card"><div class="filter-row" style="justify-content:center;"><button class="chip'+(pfxLetterDir==='letter2meaning'?' active':'')+'" type="button" data-pfxdir="letter2meaning">'+t('pfxLetterQuestion')+'</button><button class="chip'+(pfxLetterDir==='meaning2letter'?' active':'')+'" type="button" data-pfxdir="meaning2letter">'+t('pfxMeaningQuestion')+'</button></div>';
  html+='<div class="pfx-prompt">'+(pfxLetterDir==='letter2meaning'?t('pfxLetterQuestion'):t('pfxMeaningQuestion'))+'</div>';
  if(pfxLetterDir==='letter2meaning'){
    html+='<div class="pfx-letter-big he" lang="he" dir="rtl">'+p.id+'</div><div class="pfx-letter-name">'+(currentLang==='en'?p.nameEn:p.nameRu)+'</div>';
  }else{
    html+='<div class="pfx-word-big">'+(currentLang==='en'?p.meaningEn:p.meaningRu)+'</div>';
  }
  html+='<div class="pfx-options" id="pfx-options">';
  opts.forEach(function(o){
    if(pfxLetterDir==='letter2meaning') html+='<button class="pfx-option" type="button" data-pfxopt="'+escAttr(o.id)+'">'+(currentLang==='en'?o.meaningEn:o.meaningRu)+'</button>';
    else html+='<button class="pfx-option" type="button" data-pfxopt="'+escAttr(o.id)+'"><span class="he" lang="he" dir="rtl">'+o.id+'</span></button>';
  });
  html+='</div><div id="pfx-result"></div></div>';
  area.innerHTML=html;
  document.getElementById('pfx-options').querySelectorAll('[data-pfxopt]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(pfxAnswered) return;
      pfxAnswered=true;
      const correct=btn.dataset.pfxopt===q.id;
      pfxRecord(q.key,correct,performance.now()-pfxStart,btn.dataset.pfxopt,'choice');
      document.getElementById('pfx-options').querySelectorAll('[data-pfxopt]').forEach(function(b){
        if(b.dataset.pfxopt===q.id) b.classList.add('correct');
        else if(b===btn) b.classList.add('wrong');
        b.disabled=true;
      });
      const res=document.getElementById('pfx-result');
      if(res) res.innerHTML=pfxResultHTML(p,correct);
      schedulePfxNext(correct?1000:2200);
    });
  });
}
function pfxItemResultHTML(q,correct,extra){
  let html='<div class="result-box '+(correct?'ok':'bad')+'"><div class="result-title">'+(correct?'✅ '+t('correct'):'❌ '+t('wrong'))+'</div>';
  html+='<div class="result-he he" lang="he" dir="rtl">'+q.p+'</div>';
  if(settings.translit) html+='<div class="result-translit">'+pfxTranslitOf(q)+'</div>';
  html+='<div class="result-gloss">'+(currentLang==='en'?q.glossEn:q.glossRu)+'</div>';
  html+='<div class="result-gloss">'+t('pfxRuleLabel')+': '+pfxTagLabel(q.tag)+'</div>';
  html+=speakBtn(q.p);
  html+=extra||'';
  html+='</div>';
  return html;
}
function renderPfxBuild(){
  const area=document.getElementById('pfx-area');
  if(!area) return;
  if(!pfxQ) pfxQ=pfxPick(pfxBuildPool());
  const q=pfxQ;
  if(!q){area.innerHTML='<div class="empty-train">'+t('pfxEmpty')+'</div>';return;}
  pfxAnswered=false;pfxHintShown=false;pfxStart=performance.now();
  let html='<div class="pfx-card"><div class="pfx-prompt">'+t('pfxBuildQuestion')+'</div><div class="pfx-build-tiles">';
  q.prefixes.forEach(function(letter,idx){
    if(idx>0) html+='<span class="pfx-build-plus">+</span>';
    html+='<span class="pfx-build-tile he" lang="he" dir="rtl">'+letter+'</span>';
  });
  if(q.art&&q.prefixes.indexOf('ה')<0) html+='<span class="pfx-build-plus">+</span><span class="pfx-build-tile he" lang="he" dir="rtl">ה</span>';
  html+='<span class="pfx-build-plus">+</span><span class="pfx-build-tile he" lang="he" dir="rtl">'+q.wordP+'</span>';
  html+='</div><div class="pfx-note">'+t('pfxBuildNote')+'</div><div id="pfx-hint-box" style="display:none;"></div>';
  html+='<input class="he-input" id="pfx-input" lang="he" dir="rtl" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="…">';
  html+='<div class="nikud-notice" id="nikud-notice"></div>';
  html+='<div class="action-row"><button class="btn-secondary" id="pfx-hint" type="button">💡 '+t('hint')+'</button><button class="btn-primary" id="pfx-check" type="button">'+t('check')+'</button></div><div id="pfx-result"></div></div>';
  area.innerHTML=html;
  const input=document.getElementById('pfx-input');
  activeInput=input;
  const groupPool=PFX_ITEMS.filter(function(it){return it.group===q.group&&it.id!==q.id;}).map(function(it){return {u:it.u,p:it.p,pm:null,label:(currentLang==='en'?it.glossEn:it.glossRu)};});
  const acc=[{u:q.u,p:q.p,pm:null,label:(currentLang==='en'?q.glossEn:q.glossRu)}];
  function doCheck(show){
    if(pfxAnswered) return;
    const res=show?{status:'wrong',reason:'',readings:[]}:checkTyped(groupPool,acc,input.value,'smart');
    if(res.status==='ambiguous'){showNikudNotice(res);return;}
    pfxAnswered=true;
    const correct=res.status==='correct';
    pfxRecord(q.key,correct,performance.now()-pfxStart,input.value,'type');
    input.readOnly=true;
    const resBox=document.getElementById('pfx-result');
    let extra='';
    if(!correct){
      extra='<div class="result-wrong-note">'+t('answerWas')+' <span class="he" lang="he" dir="rtl">'+q.p+'</span></div>';
      if(input.value) extra+='<div class="result-wrong-note">'+t('youTyped')+' <span class="he" lang="he" dir="rtl">'+escHtml(input.value)+'</span></div>';
      if(res.reason==='nikud') extra+='<div class="colloq-note">'+t('nikudWrong')+'</div>';
      if(res.reason==='needNikud') extra+='<div class="colloq-note">'+t('nikudNeed')+'</div>';
    }
    if(resBox) resBox.innerHTML=pfxItemResultHTML(q,correct,extra);
    schedulePfxNext(correct?1100:2400);
  }
  document.getElementById('pfx-check').addEventListener('click',function(){doCheck(false);});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doCheck(false);}});
  input.addEventListener('input',function(){
    if(pfxAnswered) return;
    const res=checkTyped(groupPool,acc,input.value,'smart');
    if(res.status==='correct') doCheck(false);
    else if(res.status==='ambiguous') showNikudNotice(res);
    else hideNikudNotice();
  });
  document.getElementById('pfx-hint').addEventListener('click',function(){
    pfxHintShown=true;
    const box=document.getElementById('pfx-hint-box');
    box.style.display='block';box.className='hint-box';
    box.innerHTML='<div class="hint-gloss">'+(currentLang==='en'?q.glossEn:q.glossRu)+'</div>';
  });
}
function pfxFormOptions(q){
  const p=pfxPrefix(q.prefix);
  const opts=[q.pfxForm];
  if(p) p.forms.forEach(function(f){if(!f.noQuiz&&opts.indexOf(f.p)<0)opts.push(f.p);});
  const all=[];
  PREFIXES.forEach(function(pp){pp.forms.forEach(function(f){if(!f.noQuiz&&all.indexOf(f.p)<0)all.push(f.p);});});
  shuffle(all);
  all.forEach(function(f){if(opts.length<4&&opts.indexOf(f)<0)opts.push(f);});
  return shuffle(opts);
}
function renderPfxForm(){
  const area=document.getElementById('pfx-area');
  if(!area) return;
  if(!pfxQ) pfxQ=pfxPick(pfxWordPool());
  const q=pfxQ;
  if(!q){area.innerHTML='<div class="empty-train">'+t('pfxEmpty')+'</div>';return;}
  pfxAnswered=false;pfxStart=performance.now();
  const opts=pfxFormOptions(q);
  let html='<div class="pfx-card"><div class="pfx-prompt">'+t('pfxFormQuestion')+'</div><div class="pfx-prompt"><span class="he" lang="he" dir="rtl" style="font-size:28px;">'+q.prefix+'</span> + <span class="he" lang="he" dir="rtl" style="font-size:24px;">'+q.wordP+'</span>'+(q.art?'<span class="pfx-badge">'+t('pfxArticle')+'</span>':'')+'</div>';
  html+='<div class="pfx-options" id="pfx-options">';
  opts.forEach(function(p){html+='<button class="pfx-option" type="button" data-pfxform="'+escAttr(p)+'"><span class="he" lang="he" dir="rtl">'+p+'</span></button>';});
  html+='</div><div id="pfx-result"></div></div>';
  area.innerHTML=html;
  document.getElementById('pfx-options').querySelectorAll('[data-pfxform]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(pfxAnswered) return;
      pfxAnswered=true;
      const correct=btn.dataset.pfxform===q.pfxForm;
      pfxRecord(q.key,correct,performance.now()-pfxStart,btn.dataset.pfxform,'choice');
      document.getElementById('pfx-options').querySelectorAll('[data-pfxform]').forEach(function(b){
        if(b.dataset.pfxform===q.pfxForm) b.classList.add('correct');
        else if(b===btn) b.classList.add('wrong');
        b.disabled=true;
      });
      const res=document.getElementById('pfx-result');
      if(res) res.innerHTML=pfxItemResultHTML(q,correct,'');
      schedulePfxNext(correct?1100:2400);
    });
  });
}
function pfxDecompParts(q){
  const parts=q.prefixes.slice();
  // The article is a prefix of its own in the ה entries, so it is already in
  // parts there; adding it again gave ה + ה + word.
  if(q.art&&parts.indexOf('ה')<0) parts.push('ה');
  parts.push(q.word);
  return parts;
}
function pfxDecomp(q){
  const parts=pfxDecompParts(q);
  return {key:parts.join('|'),html:parts.map(function(x){return '<span class="he" lang="he" dir="rtl">'+x+'</span>';}).join(' + ')};
}
function pfxParseOptions(q){
  const correct=pfxDecomp(q);
  const opts=[correct];
  const prefixes=PREFIXES.map(function(p){return p.id;});
  function add(parts){
    const key=parts.join('|');
    if(opts.some(function(o){return o.key===key;})) return;
    opts.push({key:key,html:parts.map(function(x){return '<span class="he" lang="he" dir="rtl">'+x+'</span>';}).join(' + ')});
  }
  const base=pfxDecompParts(q);
  add(base.filter(function(x){return x!=='ה';}));
  const withArt=base.slice();
  if(withArt.indexOf('ה')<0) withArt.splice(withArt.length-1,0,'ה');
  add(withArt);
  const other=prefixes.filter(function(x){return x!==q.prefix;});
  shuffle(other);
  for(let i=0;i<other.length&&opts.length<4;i++){
    const parts=q.prefixes.slice();parts[0]=other[i];if(q.art)parts.push('ה');parts.push(q.word);add(parts);
  }
  return shuffle(opts);
}
function renderPfxParse(){
  const area=document.getElementById('pfx-area');
  if(!area) return;
  if(!pfxQ) pfxQ=pfxPick(pfxWordPool());
  const q=pfxQ;
  if(!q){area.innerHTML='<div class="empty-train">'+t('pfxEmpty')+'</div>';return;}
  pfxAnswered=false;pfxStart=performance.now();
  const opts=pfxParseOptions(q);
  const correct=pfxDecomp(q);
  let html='<div class="pfx-card"><div class="pfx-prompt">'+t('pfxParseQuestion')+'</div><div class="pfx-word-big he" lang="he" dir="rtl">'+q.p+'</div><div class="pfx-options" id="pfx-options">';
  opts.forEach(function(o){html+='<button class="pfx-option pfx-decomp" type="button" data-pfxdecomp="'+escAttr(o.key)+'">'+o.html+'</button>';});
  html+='</div><div id="pfx-result"></div></div>';
  area.innerHTML=html;
  document.getElementById('pfx-options').querySelectorAll('[data-pfxdecomp]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(pfxAnswered) return;
      pfxAnswered=true;
      const ok=btn.dataset.pfxdecomp===correct.key;
      pfxRecord(q.key,ok,performance.now()-pfxStart,btn.dataset.pfxdecomp,'choice');
      document.getElementById('pfx-options').querySelectorAll('[data-pfxdecomp]').forEach(function(b){
        if(b.dataset.pfxdecomp===correct.key) b.classList.add('correct');
        else if(b===btn) b.classList.add('wrong');
        b.disabled=true;
      });
      const res=document.getElementById('pfx-result');
      if(res) res.innerHTML=pfxItemResultHTML(q,ok,'<div class="result-gloss">'+t('pfxCorrectAnswer')+' '+correct.html+'</div>');
      schedulePfxNext(ok?1100:2400);
    });
  });
}
function makePfxSpeedQuestion(){
  const types=['letter','form','parse'];
  const type=types[Math.floor(Math.random()*types.length)];
  if(type==='letter'){
    const pool=pfxLetterPool();
    if(!pool.length) return null;
    const p=pool[Math.floor(Math.random()*pool.length)];
    return {type:'letter',id:p.id,prefix:p.id,key:'pfxm:'+p.id,options:pfxLetterOptions(p.id)};
  }
  const pool=pfxWordPool();
  if(!pool.length) return null;
  const it=pool[Math.floor(Math.random()*pool.length)];
  if(type==='form') return {type:'form',item:it,key:it.key,options:pfxFormOptions(it)};
  return {type:'parse',item:it,key:it.key,options:pfxParseOptions(it)};
}
function pfxSpeedQuestionHTML(q){
  if(q.type==='letter'){
    const p=pfxPrefix(q.id);
    let html='<div class="pfx-prompt">'+t('pfxLetterQuestion')+'</div><div class="pfx-letter-big he" lang="he" dir="rtl">'+p.id+'</div><div class="pfx-options" id="pfx-speed-options">';
    q.options.forEach(function(o){html+='<button class="pfx-option" type="button" data-pfxspeed="'+escAttr(o.id)+'">'+(currentLang==='en'?o.meaningEn:o.meaningRu)+'</button>';});
    html+='</div>';
    return html;
  }
  const it=q.item;
  if(q.type==='form'){
    let html='<div class="pfx-prompt">'+t('pfxFormQuestion')+'</div><div class="pfx-prompt"><span class="he" lang="he" dir="rtl" style="font-size:28px;">'+it.prefix+'</span> + <span class="he" lang="he" dir="rtl" style="font-size:24px;">'+it.wordP+'</span>'+(it.art?'<span class="pfx-badge">'+t('pfxArticle')+'</span>':'')+'</div><div class="pfx-options" id="pfx-speed-options">';
    q.options.forEach(function(p){html+='<button class="pfx-option" type="button" data-pfxspeed="'+escAttr(p)+'"><span class="he" lang="he" dir="rtl">'+p+'</span></button>';});
    html+='</div>';
    return html;
  }
  let html='<div class="pfx-prompt">'+t('pfxParseQuestion')+'</div><div class="pfx-word-big he" lang="he" dir="rtl">'+it.p+'</div><div class="pfx-options" id="pfx-speed-options">';
  q.options.forEach(function(o){html+='<button class="pfx-option pfx-decomp" type="button" data-pfxspeed="'+escAttr(o.key)+'">'+o.html+'</button>';});
  html+='</div>';
  return html;
}
function attachPfxSpeedHandlers(q){
  const opts=document.getElementById('pfx-speed-options');
  if(!opts) return;
  opts.querySelectorAll('[data-pfxspeed]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(!pfxSpeedState||!pfxSpeedState.running) return;
      let correct=false;
      if(q.type==='letter') correct=btn.dataset.pfxspeed===q.id;
      else if(q.type==='form') correct=btn.dataset.pfxspeed===q.item.pfxForm;
      else correct=btn.dataset.pfxspeed===pfxDecomp(q.item).key;
      pfxRecord(q.key,correct,performance.now()-pfxSpeedState.qStart,btn.dataset.pfxspeed,'choice');
      if(correct) pfxSpeedState.correct++;
      else noteWrong(q.key);
      pfxSpeedState.q=makePfxSpeedQuestion();
      pfxSpeedState.qStart=performance.now();
      if(!pfxSpeedState.q){finishPfxSpeed();return;}
      renderPfxSpeed();
    });
  });
}
function renderPfxSpeed(){
  const area=document.getElementById('pfx-area');
  if(!area) return;
  if(!pfxSpeedState||!pfxSpeedState.running){
    if(!pfxSpeedState) pfxSpeedState={running:false,correct:0};
    const best=bestTimes.pfxSpeed||0;
    let html='<div class="pfx-card"><div class="section-title">'+t('pfxModeSpeed')+'</div><div class="section-intro">'+t('pfxSpeedStart')+'</div>';
    if(best) html+='<div class="stat-pill" style="margin-bottom:10px;">'+t('pfxSpeedBest')+': <b>'+best+'</b></div>';
    html+='<button class="btn-primary" id="pfx-speed-start" type="button">'+t('pfxSpeedStart')+'</button></div>';
    area.innerHTML=html;
    document.getElementById('pfx-speed-start').addEventListener('click',startPfxSpeed);
    return;
  }
  const q=pfxSpeedState.q;
  if(!q){finishPfxSpeed();return;}
  const left=Math.max(0,Math.ceil((pfxSpeedState.duration-(performance.now()-pfxSpeedState.start))/1000));
  let html='<div class="pfx-card"><div class="speed-stats"><span>⏱ <b id="pfx-speed-left">'+left+'</b>s</span><span>✅ <b id="pfx-speed-correct">'+pfxSpeedState.correct+'</b></span></div>';
  html+='<div class="speed-bar"><div class="speed-fill" id="pfx-speed-fill" style="width:'+Math.max(0,Math.min(100,(pfxSpeedState.duration-(performance.now()-pfxSpeedState.start))/pfxSpeedState.duration*100))+'%"></div></div>';
  html+=pfxSpeedQuestionHTML(q);
  html+='</div>';
  area.innerHTML=html;
  attachPfxSpeedHandlers(q);
}
function startPfxSpeed(){
  if(!pfxSpeedState) pfxSpeedState={};
  pfxSpeedState.running=true;pfxSpeedState.correct=0;pfxSpeedState.duration=60000;pfxSpeedState.start=performance.now();
  pfxSpeedState.q=makePfxSpeedQuestion();
  pfxSpeedState.qStart=performance.now();
  if(pfxSpeedState.interval) clearInterval(pfxSpeedState.interval);
  pfxSpeedState.interval=setInterval(function(){
    if(!pfxSpeedState||!pfxSpeedState.running) return;
    const remain=pfxSpeedState.duration-(performance.now()-pfxSpeedState.start);
    const l=document.getElementById('pfx-speed-left');if(l)l.textContent=Math.max(0,Math.ceil(remain/1000));
    const f=document.getElementById('pfx-speed-fill');if(f)f.style.width=Math.max(0,Math.min(100,remain/pfxSpeedState.duration*100))+'%';
    if(remain<=0) finishPfxSpeed();
  },100);
  renderPfxSpeed();
}
function finishPfxSpeed(){
  if(!pfxSpeedState) return;
  if(pfxSpeedState.interval){clearInterval(pfxSpeedState.interval);pfxSpeedState.interval=null;}
  pfxSpeedState.running=false;
  const score=pfxSpeedState.correct;
  const best=bestTimes.pfxSpeed||0;
  const isNew=score>best;
  if(isNew){bestTimes.pfxSpeed=score;saveBest();}
  const area=document.getElementById('pfx-area');
  if(area) area.innerHTML='<div class="pfx-card"><div class="section-title">'+t('pfxSpeedDone')+'</div><div class="modal-stats"><div>'+t('pfxSpeedCorrect')+': <b>'+score+'</b></div><div>'+t('pfxSpeedBest')+': <b>'+bestTimes.pfxSpeed+'</b></div></div>'+(isNew?'<div class="colloq-note" style="text-align:center;">🏆 '+t('pfxSpeedNewRecord')+'</div>':'')+'<div class="action-row"><button class="btn-primary" id="pfx-speed-again" type="button">'+t('again')+'</button></div></div>';
  const again=document.getElementById('pfx-speed-again');
  if(again) again.addEventListener('click',function(){pfxSpeedState=null;renderPfxArea();});
  activeInput=null;
}
function findPfxItem(p){
  let it=PFX_ITEMS.find(function(x){return x.p===p;});
  if(it) return it;
  const n=N(p);
  return PFX_ITEMS.find(function(x){return N(x.p)===n;})||null;
}
function pfxPhraseOptions(s){
  const item=findPfxItem(s.answer);
  const correct=item?item.p:s.answer;
  const opts=[correct];
  const pool=PFX_ITEMS.map(function(it){return it.p;});
  shuffle(pool);
  pool.forEach(function(p){if(opts.length<4&&!opts.some(function(o){return N(o)===N(p);}))opts.push(p);});
  return shuffle(opts);
}
function renderPfxPhrases(){
  const area=document.getElementById('pfx-area');
  if(!area) return;
  if(!pfxPhraseQueue.length){pfxPhraseQueue=PFX_PHRASES.map(function(s,i){return i;});shuffle(pfxPhraseQueue);pfxPhrasePos=0;}
  const s=PFX_PHRASES[pfxPhraseQueue[pfxPhrasePos%pfxPhraseQueue.length]];
  pfxStart=performance.now();
  const item=findPfxItem(s.answer);
  const p=item?item.p:s.answer;
  const tr=item?pfxTranslitOf(item):'';
  const glossRu=item?item.glossRu:s.ru;
  const glossEn=item?item.glossEn:s.en;
  const prefix=item?item.prefix:s.answer.charAt(0);
  const key=item?item.key:'pfx:'+prefix+':'+s.tag;
  const q={p:p,u:stripNikud(p),tr:tr,glossRu:glossRu,glossEn:glossEn,tag:s.tag,key:key};
  const parts=s.he.split('___');
  let html='<div class="section-title">'+t('pfxPhrasesTitle')+'</div>';
  html+='<div class="subtabs" style="margin-bottom:12px;"><div class="subtab '+(pfxPhraseMode==='choice'?'active':'')+'" data-pfxpmode="choice">'+t('pfxPhraseChoice')+'</div><div class="subtab '+(pfxPhraseMode==='type'?'active':'')+'" data-pfxpmode="type">'+t('pfxPhraseType')+'</div></div>';
  html+='<div class="pfx-card"><div class="phrase-he he" lang="he" dir="rtl">'+parts[0]+'<span class="phrase-blank" id="pfx-phrase-blank">____</span>'+(parts[1]||'')+'</div>';
  html+='<div class="action-row" style="margin-top:0;margin-bottom:10px;"><button class="btn-secondary" id="pfx-phrase-hint" type="button">💡 '+t('pfxPhraseHint')+'</button>'+(speechAvailable()?'<button class="btn-secondary" id="pfx-phrase-read" type="button">🔊 '+t('phraseRead')+'</button>':'')+'</div>';
  html+='<div id="pfx-phrase-hint-box" style="display:none;"></div>';
  if(pfxPhraseMode==='choice'){
    const opts=pfxPhraseOptions(s);
    html+='<div class="pfx-options" id="pfx-phrase-options">';
    opts.forEach(function(o){html+='<button class="pfx-option" type="button" data-pfxphraseopt="'+escAttr(o)+'"><span class="he" lang="he" dir="rtl">'+o+'</span></button>';});
    html+='</div>';
  }else{
    html+='<input class="he-input" id="pfx-phrase-input" lang="he" dir="rtl" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="…">';
    html+='<div class="nikud-notice" id="nikud-notice"></div>';
    html+='<div class="action-row"><button class="btn-primary" id="pfx-phrase-check" type="button">'+t('check')+'</button></div>';
  }
  html+='<div id="pfx-phrase-result"></div>';
  html+='<div class="action-row"><button class="btn-ghost" id="pfx-phrase-next" type="button" style="display:none;">'+t('pfxPhraseNext')+' →</button></div></div>';
  area.innerHTML=html;
  const hintBox=document.getElementById('pfx-phrase-hint-box');
  document.getElementById('pfx-phrase-hint').addEventListener('click',function(){
    pfxPhraseHintShown=true;
    hintBox.style.display='block';hintBox.className='hint-box';
    hintBox.innerHTML='<div class="hint-gloss">'+(currentLang==='en'?s.en:s.ru)+'</div>';
  });
  const readBtn=document.getElementById('pfx-phrase-read');
  if(readBtn) readBtn.addEventListener('click',function(){speakHebrew(s.he.replace('___',p));});
  if(pfxPhraseMode==='choice'){
    document.getElementById('pfx-phrase-options').querySelectorAll('[data-pfxphraseopt]').forEach(function(btn){
      btn.addEventListener('click',function(){
        if(pfxPhraseAnswered) return;
        pfxPhraseAnswered=true;
        const ok=N(btn.dataset.pfxphraseopt)===N(p);
        pfxRecord(key,ok,performance.now()-pfxStart,btn.dataset.pfxphraseopt,'choice');
        document.getElementById('pfx-phrase-options').querySelectorAll('[data-pfxphraseopt]').forEach(function(b){
          if(N(b.dataset.pfxphraseopt)===N(p)) b.classList.add('correct');
          else if(b===btn) b.classList.add('wrong');
          b.disabled=true;
        });
        const blank=document.getElementById('pfx-phrase-blank');if(blank)blank.textContent=p;
        const res=document.getElementById('pfx-phrase-result');
        if(res) res.innerHTML=pfxItemResultHTML(q,ok,'<div style="text-align:center;margin-top:6px;">'+speakBtn(s.he.replace('___',p))+'</div>');
        document.getElementById('pfx-phrase-next').style.display='inline-block';
      });
    });
  }else{
    const input=document.getElementById('pfx-phrase-input');
    activeInput=input;
    pfxStart=performance.now();
    const groupPool=item?PFX_ITEMS.filter(function(it){return it.group===item.group&&it.id!==item.id;}).map(function(it){return {u:it.u,p:it.p,pm:null,label:(currentLang==='en'?it.glossEn:it.glossRu)};}):[];
    const acc=[{u:q.u,p:q.p,pm:null,label:(currentLang==='en'?q.glossEn:q.glossRu)}];
    function doPhraseCheck(){
      if(pfxPhraseAnswered) return;
      const res=checkTyped(groupPool,acc,input.value,'smart');
      if(res.status==='ambiguous'){showNikudNotice(res);return;}
      pfxPhraseAnswered=true;
      const ok=res.status==='correct';
      pfxRecord(key,ok,performance.now()-pfxStart,input.value,'type');
      input.readOnly=true;
      const blank=document.getElementById('pfx-phrase-blank');if(blank)blank.textContent=p;
      let extra='';
      if(!ok){
        extra='<div class="result-wrong-note">'+t('answerWas')+' <span class="he" lang="he" dir="rtl">'+p+'</span></div>';
        if(input.value) extra+='<div class="result-wrong-note">'+t('youTyped')+' <span class="he" lang="he" dir="rtl">'+escHtml(input.value)+'</span></div>';
        if(res.reason==='nikud') extra+='<div class="colloq-note">'+t('nikudWrong')+'</div>';
        if(res.reason==='needNikud') extra+='<div class="colloq-note">'+t('nikudNeed')+'</div>';
      }
      const resBox=document.getElementById('pfx-phrase-result');
      if(resBox) resBox.innerHTML=pfxItemResultHTML(q,ok,extra+'<div style="text-align:center;margin-top:6px;">'+speakBtn(s.he.replace('___',p))+'</div>');
      document.getElementById('pfx-phrase-next').style.display='inline-block';
    }
    document.getElementById('pfx-phrase-check').addEventListener('click',doPhraseCheck);
    input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doPhraseCheck();}});
    input.addEventListener('input',function(){
      if(pfxPhraseAnswered) return;
      const res=checkTyped(groupPool,acc,input.value,'smart');
      if(res.status==='correct') doPhraseCheck();
      else if(res.status==='ambiguous') showNikudNotice(res);
      else hideNikudNotice();
    });
  }
  document.getElementById('pfx-phrase-next').addEventListener('click',function(){
    pfxPhrasePos=(pfxPhrasePos+1)%pfxPhraseQueue.length;
    pfxPhraseAnswered=false;pfxPhraseHintShown=false;
    renderPfxArea();
  });
  syncKeyboard();
}
function prefixMapHTML(){
  const tags=['plain','article','sheva','yod','guttural','u','combo','pron'];
  let html='<div class="section-title">'+t('pfxHeatTitle')+'</div><div class="section-intro">'+t('pfxHeatIntro')+'</div>';
  html+='<div class="pfx-heat-scroll"><table class="pfx-heat-table"><thead><tr><th></th>';
  tags.forEach(function(tag){html+='<th>'+pfxTagLabel(tag)+'</th>';});
  html+='</tr></thead><tbody>';
  PREFIXES.forEach(function(p){
    html+='<tr><th class="pfx-heat-role"><span class="he" lang="he" dir="rtl">'+p.id+'</span></th>';
    tags.forEach(function(tag){
      const key='pfx:'+p.id+':'+tag;
      const rate=statRate(key);
      const bg=rate===null?'var(--track)':rate>=80?'var(--olive)':rate>=50?'var(--accent2)':'var(--danger)';
      html+='<td><button class="pfx-heat-cell" type="button" data-pfxheat="'+p.id+'|'+tag+'" style="background:'+bg+'">'+(rate===null?'':rate+'%')+'</button></td>';
    });
    html+='</tr>';
  });
  html+='</tbody></table></div>';
  const keys=Array.from(new Set(PFX_ITEMS.map(function(it){return it.key;})));
  let done=0;keys.forEach(function(k){if(isMastered(k))done++;});
  const pct=keys.length?Math.round(done/keys.length*100):0;
  html+='<div class="pfx-progress"><span>'+t('pfxProgress')+': '+done+' '+t('of')+' '+keys.length+'</span><div class="pfx-progress-bar"><div class="pfx-progress-fill" style="width:'+pct+'%"></div></div></div>';
  return html;
}
function openPfxHeat(prefix,tag){
  const key='pfx:'+prefix+':'+tag;
  const s=stats[key];
  const rate=statRate(key);
  const attempts=s?s.r+s.w:0;
  const examples=PFX_ITEMS.filter(function(it){return it.prefix===prefix&&it.tag===tag;}).slice(0,4);
  let html='<div class="modal-title"><span class="he" lang="he" dir="rtl" style="font-size:24px;">'+prefix+'</span> · '+pfxTagLabel(tag)+'</div>';
  html+='<div class="modal-stats"><div>'+t('attempts')+': <b>'+attempts+'</b></div><div>'+t('accuracy')+': <b>'+(rate===null?t('noData'):rate+'%')+'</b></div><div>'+t('avgTime')+': <b>'+(s&&s.ms?Math.round(s.ms)+' ms':t('noData'))+'</b></div><div>'+t('fastStreak')+': <b>'+(s?s.fs:0)+'</b></div></div>';
  if(examples.length){
    html+='<div class="pfx-examples">';
    examples.forEach(function(it){
      html+='<div class="pfx-example"><span class="he" lang="he" dir="rtl" style="font-size:20px;">'+it.p+'</span><span>'+pfxTranslitOf(it)+'</span><span>'+(currentLang==='en'?it.glossEn:it.glossRu)+'</span>'+speakBtn(it.p)+'</div>';
    });
    html+='</div>';
  }else{
    html+='<div class="section-intro">'+t('noData')+'</div>';
  }
  openModal(html,true);
}
const HE_KEYS=['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ך','ל','מ','ם','נ','ן','ס','ע','פ','ף','צ','ץ','ק','ר','ש','ת'];
