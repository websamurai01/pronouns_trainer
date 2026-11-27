function initTrainFilter(){
  trainFilter={preps:new Set(PREP_DATA.map(function(p){return p.id;})),frames:new Set(),persons:new Set([1,2,3]),nums:new Set(['s','p']),gens:new Set(['m','f']),weak:false,notAuto:false};
}
function roleAllowed(role){
  const m=ROLE_META[role];
  return trainFilter.persons.has(m.p)&&trainFilter.nums.has(m.n)&&trainFilter.gens.has(m.g);
}
function buildPool(){
  const pool=[];
  trainFilter.preps.forEach(function(pid){
    ROLE_IDS.forEach(function(role){
      if(!roleAllowed(role)) return;
      pool.push({type:'prep',prep:pid,role:role,key:pid+':'+role});
    });
  });
  trainFilter.frames.forEach(function(fid){
    const fr=FRAMES_BY_ID[fid];
    ROLE_IDS.forEach(function(role){
      if(!roleAllowed(role)) return;
      pool.push({type:'frame',frame:fid,prep:fr.prep,role:role,key:'frame:'+fid+':'+role});
    });
  });
  let out=pool;
  if(trainFilter.weak){
    out=out.filter(function(q){const s=stats[q.key];const rate=statRate(q.key);return !s||(s.r+s.w)<3||(rate!==null&&rate<70);});
  }
  if(trainFilter.notAuto){
    out=out.filter(function(q){return !isAuto(q.key);});
  }
  return out;
}
function weightFor(q){
  const rate=statRate(q.key);
  const acc=rate===null?1:1-rate/100;
  let w=1+3*acc;
  if(!isMastered(q.key)) w+=2;
  if(!isAuto(q.key)) w+=1;
  if(recentWrong.indexOf(q.key)>=0) w*=2;
  return w;
}
function weightedPick(pool){
  let total=0;
  pool.forEach(function(q){total+=weightFor(q);});
  let r=Math.random()*total;
  for(let i=0;i<pool.length;i++){
    r-=weightFor(pool[i]);
    if(r<=0) return pool[i];
  }
  return pool[pool.length-1];
}
function pickQuestion(pool){
  if(!pool||!pool.length) return null;
  let best=null;
  for(let attempt=0;attempt<6;attempt++){
    const cand=weightedPick(pool);
    const l1=history[history.length-1],l2=history[history.length-2];
    if(l1&&l2&&l1.prep===cand.prep&&l2.prep===cand.prep) continue;
    if(l1&&l2&&l1.role===cand.role&&l2.role===cand.role) continue;
    best=cand;break;
  }
  if(!best) best=weightedPick(pool);
  history.push(best);
  if(history.length>6) history.shift();
  return best;
}
function noteWrong(key){
  recentWrong.push(key);
  if(recentWrong.length>8) recentWrong.shift();
}
function stopTimers(){
  if(advanceTimer){clearTimeout(advanceTimer);advanceTimer=null;}
  if(runState&&runState.interval){clearInterval(runState.interval);runState.interval=null;}
  if(speedState&&speedState.interval){clearInterval(speedState.interval);speedState.interval=null;}
  if(pfxSpeedState&&pfxSpeedState.interval){clearInterval(pfxSpeedState.interval);pfxSpeedState.interval=null;}
  if(runState) runState.running=false;
  if(speedState) speedState.running=false;
  if(pfxSpeedState) pfxSpeedState.running=false;
}
function scheduleNext(delay){
  if(advanceTimer) clearTimeout(advanceTimer);
  advanceTimer=setTimeout(function(){
    advanceTimer=null;
    if(currentMode==='perspective'){
      currentQ=nextPerspectiveQuestion();
      qStart=performance.now();answered=false;hintShown=false;
      renderTrainArea();
    }else if(currentMode==='listen'){
      currentQ=null;answered=false;hintShown=false;
      renderTrainArea();
    }else{
      currentQ=null;answered=false;hintShown=false;
      renderTrainArea();
    }
  },delay);
}
function updateTrainStats(){
  const el=document.getElementById('train-stats');
  if(!el) return;
  el.innerHTML='<div class="stat-pill">'+t('score')+': <b>'+settings.score+'</b></div><div class="stat-pill">'+t('streak')+': <b>'+settings.streak+'</b></div><div class="stat-pill">'+t('best')+': <b>'+settings.bestStreak+'</b></div>';
}
function renderTrain(){
  const scr=document.getElementById('screen-train');
  if(!scr) return;
  scr.innerHTML='<div class="train-stats" id="train-stats"></div>'+practiceTogglesHTML(true)+'<div class="filter-wrap" id="train-filters"></div><div class="mode-pills" id="mode-pills"></div><div id="train-area"></div>';
  renderFilters();
  renderModePills();
  currentQ=null;keyMiniQ=null;
  renderTrainArea();
}
const MODES=[
  {id:'build',key:'modeBuild'},{id:'role2form',key:'modeRole2Form'},{id:'form2role',key:'modeForm2Role'},
  {id:'perspective',key:'modePerspective'},{id:'run',key:'modeRun'},{id:'speed',key:'modeSpeed'},
  {id:'keymini',key:'modeKeyMini'},{id:'listen',key:'modeListen'}
];
function renderModePills(){
  const box=document.getElementById('mode-pills');
  if(!box) return;
  let html='';
  MODES.forEach(function(m){
    if(m.id==='listen'&&!speechAvailable()) return;
    html+='<button class="mode-pill'+(currentMode===m.id?' active':'')+'" type="button" data-mode="'+m.id+'">'+t(m.key)+'</button>';
  });
  box.innerHTML=html;
}
function frameGroupIds(group){
  const groups=group==='exist'?['exist','state']:[group];
  return FRAMES.filter(function(f){return groups.indexOf(f.group)>=0;}).map(function(f){return f.id;});
}
function frameGroupActive(group){
  const ids=frameGroupIds(group);
  if(!ids.length) return false;
  return ids.every(function(id){return trainFilter.frames.has(id);});
}
function toggleFrameGroup(group){
  const ids=frameGroupIds(group);
  const all=ids.every(function(id){return trainFilter.frames.has(id);});
  ids.forEach(function(id){if(all)trainFilter.frames.delete(id);else trainFilter.frames.add(id);});
}
function toggleSetValue(set,val){
  if(set.has(val)){if(set.size>1)set.delete(val);}
  else set.add(val);
}
function renderFilters(){
  const box=document.getElementById('train-filters');
  if(!box) return;
  let html='<div class="filter-row"><span class="filter-label">'+t('filterPreps')+'</span>';
  PREP_DATA.forEach(function(p){
    html+='<button class="chip'+(trainFilter.preps.has(p.id)?' active':'')+'" type="button" data-fprep="'+p.id+'"><span class="he" lang="he">'+p.he+'</span></button>';
  });
  html+='</div>';
  html+='<div class="filter-row"><span class="filter-label">'+t('filterFrames')+'</span>';
  html+='<button class="chip'+(frameGroupActive('exist')||frameGroupActive('state')?' active':'')+'" type="button" data-fgroup="exist">'+t('framesExist')+'</button>';
  html+='<button class="chip'+(frameGroupActive('verb')?' active':'')+'" type="button" data-fgroup="verb">'+t('framesVerbs')+'</button>';
  html+='</div>';
  html+='<div class="filter-row"><span class="filter-label">'+t('filterRoles')+'</span>';
  [1,2,3].forEach(function(p){html+='<button class="chip'+(trainFilter.persons.has(p)?' active':'')+'" type="button" data-fperson="'+p+'">'+t('person'+p)+'</button>';});
  html+='</div>';
  html+='<div class="filter-row">';
  html+='<button class="chip'+(trainFilter.nums.has('s')?' active':'')+'" type="button" data-fnum="s">'+t('numS')+'</button>';
  html+='<button class="chip'+(trainFilter.nums.has('p')?' active':'')+'" type="button" data-fnum="p">'+t('numP')+'</button>';
  html+='<button class="chip'+(trainFilter.gens.has('m')?' active':'')+'" type="button" data-fgen="m">'+t('genM')+'</button>';
  html+='<button class="chip'+(trainFilter.gens.has('f')?' active':'')+'" type="button" data-fgen="f">'+t('genF')+'</button>';
  html+='</div>';
  html+='<div class="filter-row">';
  html+='<button class="chip'+(trainFilter.weak?' active':'')+'" type="button" data-fweak="1">'+t('filterWeak')+'</button>';
  html+='<button class="chip'+(trainFilter.notAuto?' active':'')+'" type="button" data-fnotauto="1">'+t('filterNotAuto')+'</button>';
  html+='<button class="chip" type="button" data-freset="1">↺ '+t('filterReset')+'</button>';
  html+='</div>';
  box.innerHTML=html;
}
function onFilterChange(){
  currentQ=null;keyMiniQ=null;
  renderFilters();
  renderTrainArea();
}
function renderTrainArea(){
  updateTrainStats();
  const area=document.getElementById('train-area');
  if(!area) return;
  activeInput=null;
  if(currentMode==='build') renderBuild();
  else if(currentMode==='role2form') renderRole2Form();
  else if(currentMode==='form2role') renderForm2Role();
  else if(currentMode==='perspective') renderPerspective();
  else if(currentMode==='run') renderRun();
  else if(currentMode==='speed') renderSpeed();
  else if(currentMode==='keymini') renderKeyMini();
  else renderListen();
  syncKeyboard();
}
function emptyTrainHTML(){return '<div class="empty-train">'+t('weakEmpty')+'</div>';}

function hintHTML(q){
  const f=FORMS[q.prep][q.role];
  let html='<div class="hint-gloss">'+glossOf(q.prep,q.role)+'</div>';
  if(settings.nikud==='hint'){
    const tr=trText(f);
    html+='<div class="hint-form">'+heFormHTML(q.prep,q.role,true,'practice')+(tr?' <span class="hint-translit">'+tr+'</span>':'')+'</div>';
  }
  return html;
}
function colloquialNote(prepId,role){
  if(!settings||settings.register!=='colloquial') return '';
  let sub=null;
  if(role==='2fp') sub='2mp';
  if(role==='3fp') sub='3mp';
  if(!sub) return '';
  const f=FORMS[prepId][sub];
  const tr=trText(f);
  return '<div class="colloq-note">'+t('colloqAlso')+' '+heFormHTML(prepId,sub,true,'practice')+(tr?' ('+tr+')':'')+'</div>';
}
function resultHTML(q,correct,extra){
  const f=FORMS[q.prep][q.role];
  let html='<div class="result-box '+(correct?'ok':'bad')+'">';
  html+='<div class="result-title">'+(correct?'✅ '+t('correct'):'❌ '+t('wrong'))+'</div>';
  html+='<div class="result-he">'+heFormHTML(q.prep,q.role,true,'practice')+'</div>';
  html+=trDiv(f,'result-translit');
  html+='<div class="result-gloss">'+glossOf(q.prep,q.role)+'</div>';
  html+=speakBtn(f.u);
  html+=colloquialNote(q.prep,q.role);
  if(extra) html+=extra;
  html+='</div>';
  return html;
}
function promptHeaderHTML(q){
  const p=PREPS[q.prep];
  let html='<div class="prompt-row"><div class="prompt-prep">'+prepIcon(q.prep)+'<div class="prep-name he" lang="he" dir="rtl">'+p.he+'</div><div class="prompt-sub">'+prepMeaning(p)+'</div></div><div class="prompt-role '+personClass(q.role)+'">'+roleIcon(q.role,44)+'<div class="role-label">'+roleLabel(q.role)+'</div></div></div>';
  if(q.type==='frame'){
    const fr=FRAMES_BY_ID[q.frame];
    html+='<div class="frame-box he" lang="he" dir="rtl">'+frameBlankHTML(fr.he)+'</div><div class="frame-gloss">'+(currentLang==='en'?fr.en:fr.ru)+'</div>';
  }
  return html;
}
function renderRole2Form(){
  let q=currentQ;
  if(!q){q=pickQuestion(buildPool());currentQ=q;}
  const area=document.getElementById('train-area');
  if(!q){area.innerHTML=emptyTrainHTML();return;}
  answered=false;hintShown=false;qStart=performance.now();
  let html='<div class="train-card">'+promptHeaderHTML(q);
  html+='<div id="hint-box" style="display:none;"></div>';
  html+='<input class="he-input" id="he-input" lang="he" dir="rtl" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="…">';
  html+='<div class="nikud-notice" id="nikud-notice"></div>';
  html+='<div class="action-row"><button class="btn-secondary" id="btn-hint" type="button">💡 '+t('hint')+'</button><button class="btn-primary" id="btn-check" type="button">'+t('check')+'</button></div>';
  html+='<div class="action-row"><button class="btn-ghost" id="btn-show" type="button">'+t('show')+'</button></div>';
  html+='<div id="result-box"></div></div>';
  area.innerHTML=html;
  const input=document.getElementById('he-input');
  activeInput=input;
  input.addEventListener('input',onTypingInput);
  input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();checkRole2Form(false);}});
  document.getElementById('btn-check').addEventListener('click',function(){checkRole2Form(false);});
  document.getElementById('btn-hint').addEventListener('click',function(){
    hintShown=true;
    const box=document.getElementById('hint-box');
    box.style.display='block';box.className='hint-box';box.innerHTML=hintHTML(q);
  });
  document.getElementById('btn-show').addEventListener('click',function(){checkRole2Form(true);});
}
function onTypingInput(){
  if(answered||!currentQ||!activeInput) return;
  const val=activeInput.value;
  if(!val){hideNikudNotice();return;}
  const acc=acceptedForms(currentQ.prep,currentQ.role);
  const pool=prepPoolForms(currentQ.prep,currentQ.role);
  const res=checkTyped(pool,acc,val,null);
  if(res.status==='correct'){hideNikudNotice();checkRole2Form(false);}
  else if(res.status==='ambiguous'){showNikudNotice(res);}
  else{hideNikudNotice();}
}
function checkRole2Form(showAnswer){
  if(answered||!currentQ) return;
  const q=currentQ;
  const input=document.getElementById('he-input');
  const val=input?input.value:'';
  const acc=acceptedForms(q.prep,q.role);
  const pool=prepPoolForms(q.prep,q.role);
  const res=showAnswer?{status:'wrong',reason:'',readings:[]}:checkTyped(pool,acc,val,null);
  if(res.status==='ambiguous'){showNikudNotice(res);return;}
  answered=true;
  const correct=res.status==='correct';
  const elapsed=performance.now()-qStart;
  recordAnswer(q.key,correct,elapsed,val,'type');
  if(!correct) noteWrong(q.key);
  if(input){input.readOnly=true;input.classList.toggle('shake',!correct);}
  const check=document.getElementById('btn-check');
  if(check) check.disabled=true;
  const resBox=document.getElementById('result-box');
  if(resBox){
    let extra='';
    if(!correct){
      extra='<div class="result-wrong-note">'+t('answerWas')+' '+heFormHTML(q.prep,q.role,true,'practice')+'</div>';
      if(val) extra+='<div class="result-wrong-note">'+t('youTyped')+' <span class="he" lang="he" dir="rtl">'+escHtml(val)+'</span></div>';
      if(res.reason==='nikud') extra+='<div class="colloq-note">'+t('nikudWrong')+'</div>';
      if(res.reason==='needNikud') extra+='<div class="colloq-note">'+t('nikudNeed')+'</div>';
    }
    resBox.innerHTML=resultHTML(q,correct,extra);
  }
  scheduleNext(correct?1100:2400);
}

function renderForm2Role(){
  let q=currentQ;
  if(!q){q=pickQuestion(buildPool());currentQ=q;}
  const area=document.getElementById('train-area');
  if(!q){area.innerHTML=emptyTrainHTML();return;}
  answered=false;hintShown=false;qStart=performance.now();
  const f=FORMS[q.prep][q.role];
  const nikud=settings.nikud==='always';
  const matching=(nikud&&effNikudCheck()!=='off')?matchingRolesExact(q.prep,f.p):matchingRoles(q.prep,f.u);
  let html='<div class="train-card">';
  html+='<div class="prompt-row"><div class="prompt-prep">'+prepIcon(q.prep)+'<div class="prep-name he" lang="he" dir="rtl">'+PREPS[q.prep].he+'</div><div class="prompt-sub">'+prepMeaning(PREPS[q.prep])+'</div></div></div>';
  html+='<div style="text-align:center;margin:4px 0 10px;"><div class="result-he" id="f2r-form">'+heFormHTML(q.prep,q.role,nikud,'practice')+'</div><div style="text-align:center;">'+speakBtn(f.u)+'</div></div>';
  html+='<div id="hint-box" style="display:none;"></div>';
  html+='<div class="section-intro" style="text-align:center;">'+t('roleQuestion')+'</div><div class="answer-grid" id="f2r-grid">';
  ROLE_IDS.forEach(function(role){
    html+='<button class="role-btn '+personClass(role)+'" type="button" data-role="'+role+'">'+roleIcon(role,30)+'<span class="role-label">'+roleLabel(role)+'</span></button>';
  });
  html+='</div>';
  if(settings.nikud==='hint') html+='<div class="action-row"><button class="btn-secondary" id="btn-f2r-hint" type="button">💡 '+t('hint')+'</button></div>';
  html+='<div id="result-box"></div></div>';
  area.innerHTML=html;
  const grid=document.getElementById('f2r-grid');
  grid.querySelectorAll('[data-role]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(answered) return;
      answered=true;
      const clicked=btn.dataset.role;
      const correct=matching.indexOf(clicked)>=0;
      const elapsed=performance.now()-qStart;
      recordAnswer(q.key,correct,elapsed,clicked,'choice');
      if(!correct) noteWrong(q.key);
      grid.querySelectorAll('[data-role]').forEach(function(b){
        if(matching.indexOf(b.dataset.role)>=0) b.classList.add('correct');
        else if(b===btn) b.classList.add('wrong');
        b.disabled=true;
      });
      const form=document.getElementById('f2r-form');
      if(form) form.innerHTML=heFormHTML(q.prep,q.role,true,'practice');
      let extra='';
      if(correct&&matching.length>1){
        extra='<div class="colloq-note">'+t('bothCorrect')+' '+matching.map(roleLabel).join(', ')+'</div>';
      }else if(correct){
        extra='<div class="colloq-note">'+matching.map(roleLabel).join(', ')+'</div>';
      }
      if(!correct){
        extra='<div class="result-wrong-note">'+t('answerWas')+' '+matching.map(roleLabel).join(', ')+'</div>';
      }
      const res=document.getElementById('result-box');
      if(res) res.innerHTML=resultHTML(q,correct,extra);
      scheduleNext(correct?1100:2400);
    });
  });
  const hb=document.getElementById('btn-f2r-hint');
  if(hb) hb.addEventListener('click',function(){
    const form=document.getElementById('f2r-form');
    if(form) form.innerHTML=heFormHTML(q.prep,q.role,true,'practice');
    const box=document.getElementById('hint-box');
    if(box){box.style.display='block';box.className='hint-box';box.innerHTML=hintHTML(q);}
  });
}

const ALL_STEMS=Array.from(new Set(PREP_DATA.map(function(p){return p.stem;})));
const ALL_ENDS=Array.from(new Set(PREP_DATA.reduce(function(acc,p){p.ends.forEach(function(e){if(e.charAt(0)!=='=')acc.push(e);});return acc;},[])));
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const tmp=arr[i];arr[i]=arr[j];arr[j]=tmp;}return arr;}
function makeStemOptions(correct){
  const opts=[correct];
  const pool=ALL_STEMS.filter(function(s){return s!==correct;});
  shuffle(pool);
  pool.forEach(function(s){if(opts.length<4&&opts.indexOf(s)<0)opts.push(s);});
  return shuffle(opts);
}
function makeEndOptions(correct){
  const conf=[];
  if(correct==='ך')conf.push('יך');
  if(correct==='יך')conf.push('ך');
  if(correct==='הם')conf.push('ם');
  if(correct==='ם')conf.push('הם');
  if(correct==='הן')conf.push('ן');
  if(correct==='ן')conf.push('הן');
  if(correct==='כם')conf.push('כן');
  if(correct==='כן')conf.push('כם');
  const opts=[correct];
  conf.forEach(function(c){if(c!==correct&&opts.indexOf(c)<0&&opts.length<4)opts.push(c);});
  const pool=ALL_ENDS.filter(function(e){return e!==correct;});
  shuffle(pool);
  pool.forEach(function(e){if(opts.length<4&&opts.indexOf(e)<0)opts.push(e);});
  return shuffle(opts);
}
function wholeFormOptions(q){
  const correct=FORMS[q.prep][q.role].u;
  const opts=[correct];
  const pool=[];
  PREP_DATA.forEach(function(p){ROLE_IDS.forEach(function(r){if(p.id===q.prep&&r===q.role)return;pool.push(FORMS[p.id][r].u);});});
  shuffle(pool);
  pool.forEach(function(u){if(opts.length<4&&!opts.some(function(o){return N(o)===N(u);}))opts.push(u);});
  return shuffle(opts);
}
function renderBuild(){
  let q=currentQ;
  if(!q){q=pickQuestion(buildPool());currentQ=q;}
  const area=document.getElementById('train-area');
  if(!q){area.innerHTML=emptyTrainHTML();return;}
  answered=false;hintShown=false;qStart=performance.now();
  const p=PREPS[q.prep];
  if(p.irregularRoles.indexOf(q.role)>=0){renderBuildWhole(q);return;}
  const parts=formParts(q.prep,q.role);
  const stems=makeStemOptions(p.stem);
  const ends=makeEndOptions(parts.end);
  let selStem=null,selEnd=null;
  let html='<div class="train-card">'+promptHeaderHTML(q);
  html+='<div class="section-intro" style="text-align:center;margin-bottom:6px;">'+t('buildQuestion')+'</div>';
  html+='<div class="assembly" lang="he" dir="rtl"><span class="asm-slot asm-placeholder" id="asm-stem">?</span><span class="asm-plus">+</span><span class="asm-slot asm-placeholder" id="asm-end">?</span></div>';
  html+='<div class="build-section"><div class="build-label">'+t('chooseStem')+'</div><div class="build-row" id="stem-row">';
  stems.forEach(function(s){html+='<button class="build-chip" type="button" lang="he" dir="rtl" data-stem="'+escAttr(s)+'">'+s+'</button>';});
  html+='</div></div>';
  html+='<div class="build-section"><div class="build-label">'+t('chooseEnd')+'</div><div class="build-row" id="end-row">';
  ends.forEach(function(e){html+='<button class="build-chip" type="button" lang="he" dir="rtl" data-end="'+escAttr(e)+'">'+e+'</button>';});
  html+='</div></div>';
  html+='<div class="action-row"><button class="btn-primary" id="build-check" type="button" disabled>'+t('check')+'</button></div>';
  html+='<div id="result-box"></div></div>';
  area.innerHTML=html;
  const asmStem=document.getElementById('asm-stem');
  const asmEnd=document.getElementById('asm-end');
  const check=document.getElementById('build-check');
  function updateAsm(){
    if(selStem!==null){asmStem.textContent=selStem;asmStem.classList.remove('asm-placeholder');}
    else{asmStem.textContent='?';asmStem.classList.add('asm-placeholder');}
    if(selEnd!==null){asmEnd.textContent=selEnd;asmEnd.classList.remove('asm-placeholder');asmEnd.setAttribute('data-endrole',ROLE_META[q.role].p);asmEnd.className='asm-slot '+((settings.endColors)?'he-end '+personClass(q.role):'end-plain');}
    else{asmEnd.textContent='?';asmEnd.className='asm-slot asm-placeholder';}
    check.disabled=!(selStem!==null&&selEnd!==null);
  }
  document.getElementById('stem-row').querySelectorAll('[data-stem]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(answered)return;
      selStem=btn.dataset.stem;
      document.getElementById('stem-row').querySelectorAll('[data-stem]').forEach(function(b){b.classList.toggle('active',b===btn);});
      updateAsm();
    });
  });
  document.getElementById('end-row').querySelectorAll('[data-end]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(answered)return;
      selEnd=btn.dataset.end;
      document.getElementById('end-row').querySelectorAll('[data-end]').forEach(function(b){b.classList.toggle('active',b===btn);});
      updateAsm();
    });
  });
  check.addEventListener('click',function(){
    if(answered||selStem===null||selEnd===null) return;
    answered=true;
    const correct=selStem===p.stem&&selEnd===parts.end;
    const elapsed=performance.now()-qStart;
    recordAnswer(q.key,correct,elapsed,selStem+selEnd,'choice');
    if(!correct) noteWrong(q.key);
    check.disabled=true;
    const res=document.getElementById('result-box');
    const extra=!correct?'<div class="result-wrong-note">'+t('answerWas')+' '+heFormHTML(q.prep,q.role,true,'practice')+'</div>':'';
    if(res) res.innerHTML=resultHTML(q,correct,extra);
    scheduleNext(correct?1100:2400);
  });
}
function renderBuildWhole(q){
  const area=document.getElementById('train-area');
  const opts=wholeFormOptions(q);
  let html='<div class="train-card">'+promptHeaderHTML(q);
  html+='<div class="section-intro" style="text-align:center;margin-bottom:6px;">'+t('wholeForm')+'</div>';
  html+='<div class="whole-options" id="whole-options">';
  opts.forEach(function(u){html+='<button class="whole-option" type="button" lang="he" dir="rtl" data-whole="'+escAttr(u)+'">'+u+'</button>';});
  html+='</div><div id="result-box"></div></div>';
  area.innerHTML=html;
  const correctNorm=N(FORMS[q.prep][q.role].u);
  document.getElementById('whole-options').querySelectorAll('[data-whole]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(answered)return;
      answered=true;
      const correct=N(btn.dataset.whole)===correctNorm;
      const elapsed=performance.now()-qStart;
      recordAnswer(q.key,correct,elapsed,btn.dataset.whole,'choice');
      if(!correct) noteWrong(q.key);
      document.getElementById('whole-options').querySelectorAll('[data-whole]').forEach(function(b){
        if(N(b.dataset.whole)===correctNorm) b.classList.add('correct');
        else if(b===btn) b.classList.add('wrong');
        b.disabled=true;
      });
      const res=document.getElementById('result-box');
      const extra=!correct?'<div class="result-wrong-note">'+t('answerWas')+' '+heFormHTML(q.prep,q.role,true,'practice')+'</div>':'';
      if(res) res.innerHTML=resultHTML(q,correct,extra);
      scheduleNext(correct?1100:2400);
    });
  });
}

function roleFromPerspective(speakerId,listenerId,targetId){
  const sp=PEOPLE[speakerId],li=PEOPLE[listenerId],ta=PEOPLE[targetId];
  if(targetId===speakerId) return sp.members.length>1?'1p':'1s';
  const spSet=new Set(sp.members),liSet=new Set(li.members),taSet=new Set(ta.members);
  const containsAll=function(a,b){return Array.from(b).every(function(x){return a.has(x);});};
  if(containsAll(taSet,spSet)) return '1p';
  if(targetId===listenerId) return li.g==='f'?'2fs':'2ms';
  if(containsAll(taSet,liSet)) return li.g==='f'?'2fp':'2mp';
  if(ta.members.length>1) return ta.members.some(function(m){return PEOPLE[m].g==='m';})?'3mp':'3fp';
  return ta.g==='f'?'3fs':'3ms';
}
function newPerspective(){
  const ids=Object.keys(PEOPLE);
  let s=ids[Math.floor(Math.random()*ids.length)];
  let l=ids[Math.floor(Math.random()*ids.length)];
  let guard=0;
  while(l===s&&guard<20){l=ids[Math.floor(Math.random()*ids.length)];guard++;}
  perspState={speaker:s,listener:l,count:0};
}
function nextPerspectiveQuestion(){
  if(!perspState.speaker||perspState.count>=3+Math.floor(Math.random()*2)) newPerspective();
  perspState.count++;
  const ids=Object.keys(PEOPLE);
  const preps=Array.from(trainFilter.preps);
  if(!preps.length) preps.push('l');
  let q=null;
  for(let attempt=0;attempt<30;attempt++){
    const target=ids[Math.floor(Math.random()*ids.length)];
    const role=roleFromPerspective(perspState.speaker,perspState.listener,target);
    if(!roleAllowed(role)) continue;
    const prep=preps[Math.floor(Math.random()*preps.length)];
    q={type:'prep',prep:prep,role:role,key:prep+':'+role,speaker:perspState.speaker,listener:perspState.listener,target:target};
    break;
  }
  if(!q){
    const target=ids[0];
    const role=roleFromPerspective(perspState.speaker,perspState.listener,target);
    const prep=preps[0];
    q={type:'prep',prep:prep,role:role,key:prep+':'+role,speaker:perspState.speaker,listener:perspState.listener,target:target};
  }
  return q;
}
function personHTML(id,role,cls,tag){
  const p=PEOPLE[id];
  const name=currentLang==='en'?p.en:p.ru;
  return '<div class="person '+cls+'">'+(tag?'<span class="person-tag">'+tag+'</span>':'')+'<div class="person-avatar">'+p.emoji+'</div><div class="person-name">'+name+'</div></div>';
}
function renderPerspective(){
  let q=currentQ;
  if(!q){q=nextPerspectiveQuestion();currentQ=q;}
  const area=document.getElementById('train-area');
  if(!q){area.innerHTML=emptyTrainHTML();return;}
  answered=false;hintShown=false;qStart=performance.now();
  const sp=PEOPLE[q.speaker],li=PEOPLE[q.listener],ta=PEOPLE[q.target];
  const spName=currentLang==='en'?sp.en:sp.ru;
  const liName=currentLang==='en'?li.en:li.ru;
  const taName=currentLang==='en'?ta.en:ta.ru;
  let html='<div class="train-card">';
  html+='<div class="section-intro" style="text-align:center;margin-bottom:6px;">'+t('perspectiveIntro')+'</div>';
  html+='<div class="perspective-scene">';
  Object.keys(PEOPLE).forEach(function(id){
    let cls='';
    let tag='';
    if(id===q.speaker){cls='speaker';tag='🗣️';}
    if(id===q.listener){cls=(cls?cls+' ':'')+'listener';tag=tag||'👂';}
    if(id===q.target){cls=(cls?cls+' ':'')+'target';tag='🎯';}
    html+=personHTML(id,null,cls,tag);
  });
  html+='</div>';
  html+='<div class="persp-line"><b>'+spName+'</b> '+t('speakerSays')+' <b>'+liName+'</b>: «<span class="he" lang="he" dir="rtl">'+PREPS[q.prep].he+'</span> ___»</div>';
  html+='<div class="target-badge">'+t('targetIs')+' <b>'+taName+'</b></div>';
  html+='<div id="hint-box" style="display:none;"></div>';
  html+='<input class="he-input" id="he-input" lang="he" dir="rtl" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="…">';
  html+='<div class="nikud-notice" id="nikud-notice"></div>';
  html+='<div class="action-row"><button class="btn-secondary" id="btn-hint" type="button">💡 '+t('hint')+'</button><button class="btn-primary" id="btn-check" type="button">'+t('check')+'</button></div>';
  html+='<div class="action-row"><button class="btn-ghost" id="btn-show" type="button">'+t('show')+'</button></div>';
  html+='<div id="result-box"></div></div>';
  area.innerHTML=html;
  const input=document.getElementById('he-input');
  activeInput=input;
  input.addEventListener('input',function(){
    if(answered) return;
    if(acceptedNorm(q.prep,q.role).indexOf(N(input.value))>=0) checkPerspective(false);
  });
  input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();checkPerspective(false);}});
  document.getElementById('btn-check').addEventListener('click',function(){checkPerspective(false);});
  document.getElementById('btn-hint').addEventListener('click',function(){
    const box=document.getElementById('hint-box');
    box.style.display='block';box.className='hint-box';box.innerHTML=hintHTML(q);
  });
  document.getElementById('btn-show').addEventListener('click',function(){checkPerspective(true);});
}
function checkPerspective(showAnswer){
  if(answered||!currentQ) return;
  const q=currentQ;
  const input=document.getElementById('he-input');
  const val=input?input.value:'';
  const acc=acceptedForms(q.prep,q.role);
  const pool=prepPoolForms(q.prep,q.role);
  const res=showAnswer?{status:'wrong',reason:'',readings:[]}:checkTyped(pool,acc,val,null);
  if(res.status==='ambiguous'){showNikudNotice(res);return;}
  answered=true;
  const correct=res.status==='correct';
  const elapsed=performance.now()-qStart;
  recordAnswer(q.key,correct,elapsed,val,'type');
  if(!correct) noteWrong(q.key);
  if(input){input.readOnly=true;input.classList.toggle('shake',!correct);}
  const check=document.getElementById('btn-check');if(check)check.disabled=true;
  const resBox=document.getElementById('result-box');
  let extra=correct?'<div class="colloq-note">'+roleLabel(q.role)+'</div>':'<div class="result-wrong-note">'+t('answerWas')+' '+roleLabel(q.role)+' · '+heFormHTML(q.prep,q.role,true,'practice')+'</div>';
  if(!correct&&val) extra+='<div class="result-wrong-note">'+t('youTyped')+' <span class="he" lang="he" dir="rtl">'+escHtml(val)+'</span></div>';
  if(!correct&&res.reason==='nikud') extra+='<div class="colloq-note">'+t('nikudWrong')+'</div>';
  if(!correct&&res.reason==='needNikud') extra+='<div class="colloq-note">'+t('nikudNeed')+'</div>';
  if(resBox) resBox.innerHTML=resultHTML(q,correct,extra);
  scheduleNext(correct?1100:2400);
}

function renderRun(){
  const area=document.getElementById('train-area');
  if(!runState||!runState.running){
    if(!runState) runState={frameId:FRAMES[0].id,running:false};
    let html='<div class="train-card"><div class="section-title">'+t('modeRun')+'</div><div class="section-intro">'+t('runChooseFrame')+'</div><div class="run-frames" id="run-frames">';
    FRAMES.forEach(function(f){
      html+='<button class="run-frame-chip'+(runState.frameId===f.id?' active':'')+'" type="button" lang="he" dir="rtl" data-runframe="'+f.id+'">'+f.he+'</button>';
    });
    html+='</div>';
    const best=bestTimes['run:'+runState.frameId];
    if(best) html+='<div class="stat-pill" style="margin-bottom:10px;">'+t('runBest')+': <b>'+best.toFixed(1)+'s</b></div>';
    html+='<button class="btn-primary" id="run-start" type="button">'+t('runStart')+'</button></div>';
    area.innerHTML=html;
    document.getElementById('run-frames').querySelectorAll('[data-runframe]').forEach(function(b){
      b.addEventListener('click',function(){
        runState.frameId=b.dataset.runframe;
        runState.running=false;
        renderRun();
      });
    });
    document.getElementById('run-start').addEventListener('click',startRun);
    return;
  }
  if(runState.idx>=ROLE_IDS.length){finishRun();return;}
  const role=runState.roles[runState.idx];
  const fr=FRAMES_BY_ID[runState.frameId];
  const q={type:'frame',frame:runState.frameId,prep:fr.prep,role:role,key:'frame:'+runState.frameId+':'+role};
  answered=false;qStart=performance.now();
  let html='<div class="train-card">';
  html+='<div class="run-status"><span>'+t('runTime')+': <b id="run-timer">0.0s</b></span><span>'+t('runErrors')+': <b>'+runState.errors+'</b></span><span>'+(runState.idx+1)+' / '+ROLE_IDS.length+'</span></div>';
  html+='<div class="frame-box he" lang="he" dir="rtl">'+frameBlankHTML(fr.he)+'</div><div class="frame-gloss">'+(currentLang==='en'?fr.en:fr.ru)+'</div>';
  html+='<div class="prompt-role '+personClass(role)+'" style="margin-bottom:8px;">'+roleIcon(role,40)+'<div class="role-label">'+roleLabel(role)+'</div></div>';
  html+='<input class="he-input" id="he-input" lang="he" dir="rtl" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="…">';
  html+='<div class="nikud-notice" id="nikud-notice"></div>';
  html+='<div class="action-row"><button class="btn-primary" id="btn-check" type="button">'+t('check')+'</button></div>';
  html+='<div id="result-box"></div></div>';
  area.innerHTML=html;
  const input=document.getElementById('he-input');
  activeInput=input;
  input.addEventListener('input',function(){
    if(answered) return;
    if(acceptedNorm(q.prep,q.role).indexOf(N(input.value))>=0) checkRunAnswer(false);
  });
  input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();checkRunAnswer(false);}});
  document.getElementById('btn-check').addEventListener('click',function(){checkRunAnswer(false);});
  if(!runState.interval){
    runState.interval=setInterval(function(){
      const el=document.getElementById('run-timer');
      if(el&&runState.running) el.textContent=((performance.now()-runState.start)/1000).toFixed(1)+'s';
    },100);
  }
}
function startRun(){
  if(!runState) return;
  runState.running=true;runState.idx=0;runState.errors=0;runState.roles=ROLE_IDS.slice();runState.start=performance.now();
  if(runState.interval) clearInterval(runState.interval);
  runState.interval=null;
  renderRun();
}
function checkRunAnswer(showAnswer){
  if(answered||!runState||!runState.running) return;
  const role=runState.roles[runState.idx];
  const fr=FRAMES_BY_ID[runState.frameId];
  const q={type:'frame',frame:runState.frameId,prep:fr.prep,role:role,key:'frame:'+runState.frameId+':'+role};
  const input=document.getElementById('he-input');
  const val=input?input.value:'';
  const acc=acceptedForms(q.prep,q.role);
  const pool=prepPoolForms(q.prep,q.role);
  const res=showAnswer?{status:'wrong',reason:'',readings:[]}:checkTyped(pool,acc,val,null);
  if(res.status==='ambiguous'){showNikudNotice(res);return;}
  answered=true;
  const correct=res.status==='correct';
  const elapsed=performance.now()-qStart;
  recordAnswer(q.key,correct,elapsed,val,'type');
  if(!correct){runState.errors++;noteWrong(q.key);}
  if(input) input.readOnly=true;
  const resBox=document.getElementById('result-box');
  let extra=!correct?'<div class="result-wrong-note">'+t('answerWas')+' '+heFormHTML(q.prep,q.role,true,'practice')+'</div>':'';
  if(!correct&&val) extra+='<div class="result-wrong-note">'+t('youTyped')+' <span class="he" lang="he" dir="rtl">'+escHtml(val)+'</span></div>';
  if(!correct&&res.reason==='nikud') extra+='<div class="colloq-note">'+t('nikudWrong')+'</div>';
  if(!correct&&res.reason==='needNikud') extra+='<div class="colloq-note">'+t('nikudNeed')+'</div>';
  if(resBox) resBox.innerHTML=resultHTML(q,correct,extra);
  runState.idx++;
  advanceTimer=setTimeout(function(){
    advanceTimer=null;
    if(runState&&runState.running) renderRun();
  },correct?650:1400);
}
function finishRun(){
  if(!runState) return;
  if(runState.interval){clearInterval(runState.interval);runState.interval=null;}
  runState.running=false;
  const elapsed=(performance.now()-runState.start)/1000;
  const key='run:'+runState.frameId;
  const best=bestTimes[key];
  const isNew=!best||elapsed<best;
  if(isNew){bestTimes[key]=elapsed;saveBest();}
  const area=document.getElementById('train-area');
  area.innerHTML='<div class="train-card"><div class="section-title">'+t('runDone')+'</div>'+
    '<div class="modal-stats"><div>'+t('runTime')+': <b>'+elapsed.toFixed(1)+'s</b></div><div>'+t('runErrors')+': <b>'+runState.errors+'</b></div><div>'+t('runBest')+': <b>'+bestTimes[key].toFixed(1)+'s</b></div></div>'+
    (isNew?'<div class="colloq-note" style="text-align:center;">🏆 '+t('runNewRecord')+'</div>':'')+
    '<div class="action-row"><button class="btn-primary" id="run-again" type="button">'+t('again')+'</button></div></div>';
  document.getElementById('run-again').addEventListener('click',function(){runState=null;renderTrainArea();});
  activeInput=null;
}

function speedOptions(q){
  const correct=FORMS[q.prep][q.role].u;
  const opts=[correct];
  const pool=[];
  PREP_DATA.forEach(function(p){ROLE_IDS.forEach(function(r){if(p.id===q.prep&&r===q.role)return;pool.push(FORMS[p.id][r].u);});});
  shuffle(pool);
  pool.forEach(function(u){if(opts.length<4&&!opts.some(function(o){return N(o)===N(u);}))opts.push(u);});
  return shuffle(opts);
}
function renderSpeed(){
  const area=document.getElementById('train-area');
  if(!speedState||!speedState.running){
    if(!speedState) speedState={running:false,correct:0};
    const best=bestTimes.speed||0;
    let html='<div class="train-card"><div class="section-title">'+t('modeSpeed')+'</div>';
    if(best) html+='<div class="stat-pill" style="margin-bottom:10px;">'+t('speedBest')+': <b>'+best+'</b></div>';
    html+='<button class="btn-primary" id="speed-start" type="button">'+t('speedStart')+'</button></div>';
    area.innerHTML=html;
    document.getElementById('speed-start').addEventListener('click',startSpeed);
    return;
  }
  const q=speedState.q;
  if(!q){finishSpeed();return;}
  const opts=speedOptions(q);
  const left=Math.max(0,Math.ceil((speedState.duration-(performance.now()-speedState.start))/1000));
  let html='<div class="train-card">';
  html+='<div class="speed-stats"><span>⏱ <b id="speed-left">'+left+'</b>s</span><span>✅ <b id="speed-correct">'+speedState.correct+'</b></span></div>';
  html+='<div class="speed-bar"><div class="speed-fill" id="speed-fill" style="width:'+Math.max(0,Math.min(100,(speedState.duration-(performance.now()-speedState.start))/speedState.duration*100))+'%"></div></div>';
  html+=promptHeaderHTML(q);
  html+='<div class="section-intro" style="text-align:center;margin-bottom:6px;">'+t('chooseForm')+'</div><div class="whole-options" id="speed-options">';
  opts.forEach(function(u){html+='<button class="whole-option" type="button" lang="he" dir="rtl" data-speedopt="'+escAttr(u)+'">'+u+'</button>';});
  html+='</div></div>';
  area.innerHTML=html;
  const correctNorm=N(FORMS[q.prep][q.role].u);
  document.getElementById('speed-options').querySelectorAll('[data-speedopt]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(!speedState||!speedState.running) return;
      const correct=N(btn.dataset.speedopt)===correctNorm;
      const elapsed=performance.now()-speedState.qStart;
      recordAnswer(q.key,correct,elapsed,btn.dataset.speedopt,'choice');
      if(correct) speedState.correct++;
      else noteWrong(q.key);
      speedState.q=pickQuestion(buildPool());
      speedState.qStart=performance.now();
      if(!speedState.q){finishSpeed();return;}
      renderSpeed();
    });
  });
}
function startSpeed(){
  if(!speedState) speedState={};
  speedState.running=true;speedState.correct=0;speedState.duration=60000;speedState.start=performance.now();
  speedState.q=pickQuestion(buildPool());
  speedState.qStart=performance.now();
  if(speedState.interval) clearInterval(speedState.interval);
  speedState.interval=setInterval(function(){
    if(!speedState||!speedState.running) return;
    const remain=speedState.duration-(performance.now()-speedState.start);
    const leftEl=document.getElementById('speed-left');
    const fillEl=document.getElementById('speed-fill');
    if(leftEl) leftEl.textContent=Math.max(0,Math.ceil(remain/1000));
    if(fillEl) fillEl.style.width=Math.max(0,Math.min(100,remain/speedState.duration*100))+'%';
    if(remain<=0) finishSpeed();
  },100);
  renderSpeed();
}
function finishSpeed(){
  if(!speedState) return;
  if(speedState.interval){clearInterval(speedState.interval);speedState.interval=null;}
  speedState.running=false;
  const score=speedState.correct;
  const best=bestTimes.speed||0;
  const isNew=score>best;
  if(isNew){bestTimes.speed=score;saveBest();}
  const area=document.getElementById('train-area');
  area.innerHTML='<div class="train-card"><div class="section-title">'+t('speedDone')+'</div><div class="modal-stats"><div>'+t('speedCorrect')+': <b>'+score+'</b></div><div>'+t('speedBest')+': <b>'+bestTimes.speed+'</b></div></div>'+(isNew?'<div class="colloq-note" style="text-align:center;">🏆 '+t('speedNewRecord')+'</div>':'')+'<div class="action-row"><button class="btn-primary" id="speed-again" type="button">'+t('again')+'</button></div></div>';
  document.getElementById('speed-again').addEventListener('click',function(){speedState=null;renderTrainArea();});
  activeInput=null;
}

