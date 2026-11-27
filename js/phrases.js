function makeKeyMiniQuestion(){
  const dirs=['end2role','role2end','pron2role','role2pron'];
  const dir=dirs[Math.floor(Math.random()*dirs.length)];
  if(dir==='pron2role'){
    const role=ROLE_IDS[Math.floor(Math.random()*ROLE_IDS.length)];
    const pron=PRON_BY_ROLE[role];
    const pn=N(pron.u);
    const correctRoles=ROLE_IDS.filter(function(r){return pronAccepted(r).map(N).indexOf(pn)>=0;});
    const opts=[];
    correctRoles.forEach(function(r){if(opts.length<4)opts.push(r);});
    const pool=ROLE_IDS.filter(function(r){return opts.indexOf(r)<0;});
    shuffle(pool);
    pool.forEach(function(r){if(opts.length<4)opts.push(r);});
    return {dir:dir,role:role,pron:pron,correctRoles:correctRoles,options:shuffle(opts)};
  }
  if(dir==='role2pron'){
    const role=ROLE_IDS[Math.floor(Math.random()*ROLE_IDS.length)];
    const correct=pronAccepted(role);
    const opts=correct.slice();
    const pool=ROLE_IDS.filter(function(r){return r!==role;}).map(function(r){return PRON_BY_ROLE[r].u;});
    shuffle(pool);
    pool.forEach(function(u){if(opts.length<4&&!opts.some(function(o){return N(o)===N(u);}))opts.push(u);});
    return {dir:dir,role:role,correct:correct,options:shuffle(opts)};
  }
  const role=ROLE_IDS[Math.floor(Math.random()*ROLE_IDS.length)];
  const endings=KEY_ENDINGS[role];
  const ending=endings[Math.floor(Math.random()*endings.length)];
  if(dir==='end2role'){
    const correctRoles=ROLE_IDS.filter(function(r){return KEY_ENDINGS[r].indexOf(ending)>=0;});
    const opts=[];
    correctRoles.forEach(function(r){if(opts.length<4)opts.push(r);});
    const pool=ROLE_IDS.filter(function(r){return opts.indexOf(r)<0;});
    shuffle(pool);
    pool.forEach(function(r){if(opts.length<4)opts.push(r);});
    return {dir:dir,role:role,ending:ending,correctRoles:correctRoles,options:shuffle(opts)};
  }
  const opts=endings.slice();
  const pool=Array.from(new Set([].concat.apply([],ROLE_IDS.map(function(r){return KEY_ENDINGS[r];})))).filter(function(e){return opts.indexOf(e)<0;});
  shuffle(pool);
  pool.forEach(function(e){if(opts.length<4)opts.push(e);});
  return {dir:dir,role:role,ending:ending,options:shuffle(opts)};
}
function renderKeyMini(){
  if(!keyMiniQ){keyMiniQ=makeKeyMiniQuestion();}
  const q=keyMiniQ;
  const area=document.getElementById('train-area');
  answered=false;qStart=performance.now();
  let html='<div class="train-card"><div class="section-title" style="text-align:center;">'+t('modeKeyMini')+'</div>';
  if(q.dir==='end2role'){
    html+='<div class="section-intro" style="text-align:center;">'+t('roleQuestion')+'</div><div class="ending-big" lang="he" dir="rtl">'+q.ending+'</div>';
    html+='<div class="answer-grid" id="km-options">';
    q.options.forEach(function(role){html+='<button class="role-btn '+personClass(role)+'" type="button" data-kmrole="'+role+'">'+roleIcon(role,30)+'<span class="role-label">'+roleLabel(role)+'</span></button>';});
    html+='</div>';
  }else if(q.dir==='role2end'){
    html+='<div class="section-intro" style="text-align:center;">'+t('endingQuestion')+'</div><div class="prompt-role '+personClass(q.role)+'" style="margin-bottom:8px;">'+roleIcon(q.role,44)+'<div class="role-label">'+roleLabel(q.role)+'</div></div>';
    html+='<div class="whole-options" id="km-options">';
    q.options.forEach(function(e){html+='<button class="whole-option" type="button" lang="he" dir="rtl" data-kmend="'+escAttr(e)+'">'+e+'</button>';});
    html+='</div>';
  }else if(q.dir==='pron2role'){
    html+='<div class="section-intro" style="text-align:center;">'+t('roleQuestion')+'</div><div class="ending-big he" lang="he" dir="rtl" style="font-size:44px;">'+q.pron.u+'</div>';
    html+='<div class="answer-grid" id="km-options">';
    q.options.forEach(function(role){html+='<button class="role-btn '+personClass(role)+'" type="button" data-kmrole="'+role+'">'+roleIcon(role,30)+'<span class="role-label">'+roleLabel(role)+'</span></button>';});
    html+='</div>';
  }else{
    html+='<div class="section-intro" style="text-align:center;">'+t('pronQuestion')+'</div><div class="prompt-role '+personClass(q.role)+'" style="margin-bottom:8px;">'+roleIcon(q.role,44)+'<div class="role-label">'+roleLabel(q.role)+'</div></div>';
    html+='<div class="whole-options" id="km-options">';
    q.options.forEach(function(u){html+='<button class="whole-option he" lang="he" dir="rtl" type="button" data-kmpron="'+escAttr(u)+'">'+u+'</button>';});
    html+='</div>';
  }
  html+='<div id="result-box"></div></div>';
  area.innerHTML=html;
  if(q.dir==='end2role'||q.dir==='pron2role'){
    const isPron=q.dir==='pron2role';
    const key=isPron?'pron:'+q.role:'end:'+q.role;
    const correctRoles=q.correctRoles;
    document.getElementById('km-options').querySelectorAll('[data-kmrole]').forEach(function(btn){
      btn.addEventListener('click',function(){
        if(answered)return;
        answered=true;
        const clicked=btn.dataset.kmrole;
        const correct=correctRoles.indexOf(clicked)>=0;
        const elapsed=performance.now()-qStart;
        recordAnswer(key,correct,elapsed,clicked,'choice');
        if(!correct) noteWrong(key);
        document.getElementById('km-options').querySelectorAll('[data-kmrole]').forEach(function(b){
          if(correctRoles.indexOf(b.dataset.kmrole)>=0) b.classList.add('correct');
          else if(b===btn) b.classList.add('wrong');
          b.disabled=true;
        });
        const res=document.getElementById('result-box');
        const note=correctRoles.length>1?t('bothCorrect')+' '+correctRoles.map(roleLabel).join(', '):t('answerWas')+' '+correctRoles.map(roleLabel).join(', ');
        res.innerHTML='<div class="result-box '+(correct?'ok':'bad')+'"><div class="result-title">'+(correct?'✅ '+t('correct'):'❌ '+t('wrong'))+'</div><div class="result-gloss">'+note+'</div></div>';
        advanceTimer=setTimeout(function(){advanceTimer=null;keyMiniQ=null;renderTrainArea();},correct?900:2000);
      });
    });
  }else if(q.dir==='role2end'){
    document.getElementById('km-options').querySelectorAll('[data-kmend]').forEach(function(btn){
      btn.addEventListener('click',function(){
        if(answered)return;
        answered=true;
        const clicked=btn.dataset.kmend;
        const correct=KEY_ENDINGS[q.role].indexOf(clicked)>=0;
        const elapsed=performance.now()-qStart;
        recordAnswer('end:'+q.role,correct,elapsed,clicked,'choice');
        if(!correct) noteWrong('end:'+q.role);
        document.getElementById('km-options').querySelectorAll('[data-kmend]').forEach(function(b){
          if(KEY_ENDINGS[q.role].indexOf(b.dataset.kmend)>=0) b.classList.add('correct');
          else if(b===btn) b.classList.add('wrong');
          b.disabled=true;
        });
        const res=document.getElementById('result-box');
        res.innerHTML='<div class="result-box '+(correct?'ok':'bad')+'"><div class="result-title">'+(correct?'✅ '+t('correct'):'❌ '+t('wrong'))+'</div><div class="result-gloss">'+t('answerWas')+' '+KEY_ENDINGS[q.role].join(' / ')+'</div></div>';
        advanceTimer=setTimeout(function(){advanceTimer=null;keyMiniQ=null;renderTrainArea();},correct?900:2000);
      });
    });
  }else{
    const correctNorm=q.correct.map(N);
    document.getElementById('km-options').querySelectorAll('[data-kmpron]').forEach(function(btn){
      btn.addEventListener('click',function(){
        if(answered)return;
        answered=true;
        const clicked=btn.dataset.kmpron;
        const correct=correctNorm.indexOf(N(clicked))>=0;
        const elapsed=performance.now()-qStart;
        recordAnswer('pron:'+q.role,correct,elapsed,clicked,'choice');
        if(!correct) noteWrong('pron:'+q.role);
        document.getElementById('km-options').querySelectorAll('[data-kmpron]').forEach(function(b){
          if(correctNorm.indexOf(N(b.dataset.kmpron))>=0) b.classList.add('correct');
          else if(b===btn) b.classList.add('wrong');
          b.disabled=true;
        });
        const res=document.getElementById('result-box');
        res.innerHTML='<div class="result-box '+(correct?'ok':'bad')+'"><div class="result-title">'+(correct?'✅ '+t('correct'):'❌ '+t('wrong'))+'</div><div class="result-gloss">'+t('answerWas')+' '+q.correct.join(' / ')+'</div></div>';
        advanceTimer=setTimeout(function(){advanceTimer=null;keyMiniQ=null;renderTrainArea();},correct?900:2000);
      });
    });
  }
}

function renderListen(){
  const area=document.getElementById('train-area');
  if(!speechAvailable()){
    area.innerHTML='<div class="empty-train">'+t('listenUnavailable')+'</div>';
    return;
  }
  let q=currentQ;
  if(!q){q=pickQuestion(buildPool());currentQ=q;}
  if(!q){area.innerHTML=emptyTrainHTML();return;}
  answered=false;qStart=performance.now();
  const f=FORMS[q.prep][q.role];
  const matching=matchingRoles(q.prep,f.u);
  const opts=[];
  matching.forEach(function(r){if(opts.length<4)opts.push(r);});
  const pool=ROLE_IDS.filter(function(r){return opts.indexOf(r)<0;});
  shuffle(pool);
  pool.forEach(function(r){if(opts.length<4)opts.push(r);});
  shuffle(opts);
  let html='<div class="train-card"><div class="section-title" style="text-align:center;">'+t('modeListen')+'</div>';
  html+='<div class="section-intro" style="text-align:center;">'+t('listenQuestion')+'</div>';
  html+='<button class="listen-play" id="listen-play" type="button">🔊 '+t('listenReplay')+'</button>';
  html+='<div class="answer-grid" id="listen-options">';
  opts.forEach(function(role){
    html+='<button class="role-btn '+personClass(role)+'" type="button" data-lrole="'+role+'">'+roleIcon(role,30)+'<span class="role-label">'+roleLabel(role)+'</span></button>';
  });
  html+='</div><div id="result-box"></div></div>';
  area.innerHTML=html;
  document.getElementById('listen-play').addEventListener('click',function(){speakHebrew(f.u);});
  document.getElementById('listen-options').querySelectorAll('[data-lrole]').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(answered)return;
      answered=true;
      const clicked=btn.dataset.lrole;
      const correct=matching.indexOf(clicked)>=0;
      const elapsed=performance.now()-qStart;
      recordAnswer(q.key,correct,elapsed,clicked,'choice');
      if(!correct) noteWrong(q.key);
      document.getElementById('listen-options').querySelectorAll('[data-lrole]').forEach(function(b){
        if(matching.indexOf(b.dataset.lrole)>=0) b.classList.add('correct');
        else if(b===btn) b.classList.add('wrong');
        b.disabled=true;
      });
      const res=document.getElementById('result-box');
      res.innerHTML=resultHTML(q,correct,'');
      scheduleNext(correct?1100:2400);
    });
  });
}

function trapForPrep(prepId){
  if(prepId==='l') return [0,4];
  if(prepId==='min') return [1];
  if(prepId==='el'||prepId==='al') return [2];
  if(prepId==='etsel') return [3];
  if(prepId==='et') return [6];
  return [];
}
function renderPhrases(){
  const scr=document.getElementById('screen-phrases');
  if(!scr) return;
  if(!phraseQueue.length){
    phraseQueue=SENTENCES.map(function(s,i){return i;});
    shuffle(phraseQueue);
    phrasePos=0;
  }
  const s=SENTENCES[phraseQueue[phrasePos%phraseQueue.length]];
  if(!phraseAnswered) s._start=performance.now();
  const f=FORMS[s.prep][s.role];
  const parts=s.he.split('___');
  let html='<div class="section-title">'+t('phrasesTitle')+'</div>'+practiceTogglesHTML(true);
  html+='<div class="subtabs" style="margin-bottom:12px;"><div class="subtab '+(currentPhraseMode==='choice'?'active':'')+'" data-pmode="choice">'+t('phraseModeChoice')+'</div><div class="subtab '+(currentPhraseMode==='type'?'active':'')+'" data-pmode="type">'+t('phraseModeType')+'</div></div>';
  html+='<div class="phrase-card">';
  html+='<div class="phrase-role '+personClass(s.role)+'">'+roleIcon(s.role,30)+'<span>'+roleLabel(s.role)+'</span><span style="color:var(--muted);font-weight:600;">·</span><span class="he" lang="he" dir="rtl">'+PREPS[s.prep].he+'</span></div>';
  html+='<div class="phrase-he he" lang="he" dir="rtl">'+parts[0]+'<span class="phrase-blank" id="phrase-blank">____</span>'+(parts[1]||'')+'</div>';
  html+='<div class="action-row" style="margin-top:0;margin-bottom:10px;"><button class="btn-secondary" id="phrase-hint" type="button">💡 '+t('phraseHint')+'</button>'+(speechAvailable()?'<button class="btn-secondary" id="phrase-read" type="button">🔊 '+t('phraseRead')+'</button>':'')+'</div>';
  html+='<div id="phrase-hint-box" style="display:none;"></div>';
  if(currentPhraseMode==='choice'){
    const opts=phraseOptions(s);
    html+='<div class="phrase-options" id="phrase-options">';
    opts.forEach(function(u){html+='<button class="phrase-option" type="button" lang="he" dir="rtl" data-popt="'+escAttr(u)+'">'+u+'</button>';});
    html+='</div>';
  }else{
    html+='<input class="he-input" id="phrase-input" lang="he" dir="rtl" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="…">';
    html+='<div class="nikud-notice" id="nikud-notice"></div>';
    html+='<div class="action-row"><button class="btn-primary" id="phrase-check" type="button">'+t('check')+'</button></div>';
  }
  html+='<div id="phrase-result"></div>';
  html+='<div class="action-row"><button class="btn-ghost" id="phrase-next" type="button" style="display:none;">'+t('phraseNext')+' →</button></div>';
  html+='</div>';
  scr.innerHTML=html;
  scr.querySelectorAll('[data-pmode]').forEach(function(b){
    b.addEventListener('click',function(){
      currentPhraseMode=b.dataset.pmode;
      phraseAnswered=false;phraseHintShown=false;
      renderPhrases();
    });
  });
  const hintBox=document.getElementById('phrase-hint-box');
  document.getElementById('phrase-hint').addEventListener('click',function(){
    phraseHintShown=true;
    hintBox.style.display='block';hintBox.className='hint-box';
    const tr=trText(f);
    hintBox.innerHTML='<div class="hint-gloss">'+(currentLang==='en'?s.en:s.ru)+'</div>'+(settings.nikud==='hint'?'<div class="hint-form">'+heFormHTML(s.prep,s.role,true,'practice')+(tr?' <span class="hint-translit">'+tr+'</span>':'')+'</div>':'');
  });
  const readBtn=document.getElementById('phrase-read');
  if(readBtn) readBtn.addEventListener('click',function(){speakHebrew(s.he.replace('___',f.u));});
  if(currentPhraseMode==='choice'){
    document.getElementById('phrase-options').querySelectorAll('[data-popt]').forEach(function(btn){
      btn.addEventListener('click',function(){
        if(phraseAnswered) return;
        phraseAnswered=true;
        const correct=N(btn.dataset.popt)===N(f.u);
        finishPhrase(s,f,correct,btn.dataset.popt);
        document.getElementById('phrase-options').querySelectorAll('[data-popt]').forEach(function(b){
          if(N(b.dataset.popt)===N(f.u)) b.classList.add('correct');
          else if(b===btn) b.classList.add('wrong');
          b.disabled=true;
        });
      });
    });
  }else{
    const input=document.getElementById('phrase-input');
    activeInput=input;
    const acc=acceptedForms(s.prep,s.role);
    const pool=prepPoolForms(s.prep,s.role);
    function doPhraseCheck(){
      if(phraseAnswered) return;
      const res=checkTyped(pool,acc,input.value,null);
      if(res.status==='ambiguous'){showNikudNotice(res);return;}
      phraseAnswered=true;
      finishPhrase(s,f,res.status==='correct',input.value,res.reason);
      input.readOnly=true;
    }
    document.getElementById('phrase-check').addEventListener('click',doPhraseCheck);
    input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doPhraseCheck();}});
    input.addEventListener('input',function(){
      if(phraseAnswered) return;
      const res=checkTyped(pool,acc,input.value,null);
      if(res.status==='correct'){phraseAnswered=true;finishPhrase(s,f,true,input.value,'');input.readOnly=true;}
      else if(res.status==='ambiguous'){showNikudNotice(res);}
      else{hideNikudNotice();}
    });
  }
  document.getElementById('phrase-next').addEventListener('click',function(){
    phrasePos=(phrasePos+1)%phraseQueue.length;
    phraseAnswered=false;phraseHintShown=false;
    renderPhrases();
  });
  syncKeyboard();
}
function phraseOptions(s){
  const correct=FORMS[s.prep][s.role].u;
  const opts=[correct];
  const otherPreps=PREP_DATA.filter(function(p){return p.id!==s.prep;});
  let guard=0;
  while(opts.length<4&&guard<60){
    guard++;
    let cand;
    if(opts.length===1){
      const p=otherPreps[Math.floor(Math.random()*otherPreps.length)];
      cand=FORMS[p.id][s.role].u;
    }else{
      const p=PREP_DATA[Math.floor(Math.random()*PREP_DATA.length)];
      const r=ROLE_IDS[Math.floor(Math.random()*ROLE_IDS.length)];
      cand=FORMS[p.id][r].u;
    }
    if(!opts.some(function(o){return N(o)===N(cand);})) opts.push(cand);
  }
  return shuffle(opts);
}
function finishPhrase(s,f,correct,given,reason){
  const elapsed=performance.now()-(s._start||performance.now());
  recordAnswer(s.prep+':'+s.role,correct,elapsed,given,currentPhraseMode==='choice'?'choice':'type');
  if(!correct) noteWrong(s.prep+':'+s.role);
  const blank=document.getElementById('phrase-blank');
  if(blank) blank.textContent=f.u;
  const res=document.getElementById('phrase-result');
  let html='<div class="result-box '+(correct?'ok':'bad')+'"><div class="result-title">'+(correct?'✅ '+t('correct'):'❌ '+t('wrong'))+'</div>';
  html+='<div class="result-he">'+heFormHTML(s.prep,s.role,true,'practice')+'</div>'+trDiv(f,'result-translit')+'<div class="result-gloss">'+glossOf(s.prep,s.role)+'</div>';
  if(!correct){
    html+='<div class="result-wrong-note">'+t('answerWas')+' '+heFormHTML(s.prep,s.role,true,'practice')+'</div>';
    if(given) html+='<div class="result-wrong-note">'+t('youTyped')+' <span class="he" lang="he" dir="rtl">'+escHtml(given)+'</span></div>';
    if(reason==='nikud') html+='<div class="colloq-note">'+t('nikudWrong')+'</div>';
    if(reason==='needNikud') html+='<div class="colloq-note">'+t('nikudNeed')+'</div>';
  }
  if(settings.register==='colloquial'&&(s.role==='2fp'||s.role==='3fp')){
    const sub=s.role==='2fp'?'2mp':'3mp';
    html+='<div class="colloq-note">'+t('colloqAlso')+' '+heFormHTML(s.prep,sub,true,'practice')+'</div>';
  }
  html+=speakBtn(f.u);
  html+='</div>';
  if(s.trap){
    const ids=trapForPrep(s.prep);
    const tr=TRAPS[ids[0]!==undefined?ids[0]:0];
    html+='<div class="trap-card"><div class="trap-title">'+t('phraseTrap')+'</div><div class="trap-text">'+(currentLang==='en'?tr.en:tr.ru)+'</div></div>';
  }
  if(res) res.innerHTML=html;
  const next=document.getElementById('phrase-next');
  if(next) next.style.display='inline-block';
  activeInput=null;
  syncKeyboard();
}

function openSettings(){
  const html='<div class="modal-title">'+t('settingsTitle')+'</div>'+
    '<div class="settings-score">'+t('score')+': <b>'+settings.score+'</b> · '+t('streak')+': <b>'+settings.streak+'</b> · '+t('best')+': <b>'+settings.bestStreak+'</b></div>'+
    '<div class="settings-row"><span class="settings-label">'+t('nikudLabel')+'</span><select class="settings-select" id="set-nikud"><option value="always">'+t('nikudAlways')+'</option><option value="hint">'+t('nikudHint')+'</option><option value="off">'+t('nikudOff')+'</option></select></div>'+
    '<div class="settings-row"><span class="settings-label">'+t('translitLabel')+'</span><input class="settings-check" type="checkbox" id="set-translit"></div>'+
    '<div class="settings-row"><span class="settings-label">'+t('registerLabel')+'</span><select class="settings-select" id="set-register"><option value="colloquial">'+t('registerColloq')+'</option><option value="strict">'+t('registerStrict')+'</option></select></div>'+
    '<div class="settings-row"><span class="settings-label">'+t('soundLabel')+'</span><input class="settings-check" type="checkbox" id="set-sound"></div>'+
    '<div class="settings-row"><span class="settings-label">'+t('strictPathLabel')+'</span><input class="settings-check" type="checkbox" id="set-strictpath"></div>'+
    '<div class="settings-row"><span class="settings-label">'+t('endColorsLabel')+'</span><input class="settings-check" type="checkbox" id="set-endcolors"></div>'+
    '<div class="settings-row"><span class="settings-label">'+t('nikudCheckLabel')+'</span><select class="settings-select" id="set-nikudcheck"><option value="auto">'+t('nikudCheckAuto')+'</option><option value="off">'+t('nikudCheckOff')+'</option><option value="smart">'+t('nikudCheckSmart')+'</option><option value="full">'+t('nikudCheckFull')+'</option></select></div>'+
    '<div class="toggle-note" style="margin:-4px 0 8px;">'+t('nikudCheckAutoNote')+'</div>'+
    '<div class="settings-actions">'+
      '<button class="btn-secondary" id="set-export" type="button">'+t('exportLabel')+'</button>'+
      '<button class="btn-secondary" id="set-import" type="button">'+t('importLabel')+'</button>'+
      '<button class="btn-secondary" id="set-reset" type="button" style="color:var(--danger);">'+t('resetLabel')+'</button>'+
      '<button class="btn-primary" id="set-close" type="button">'+t('close')+'</button>'+
      '<input type="file" id="set-file" accept="application/json" style="display:none;">'+
    '</div>';
  openModal(html,true);
  const nikud=document.getElementById('set-nikud');nikud.value=settings.nikud;
  document.getElementById('set-translit').checked=!!settings.translit;
  document.getElementById('set-register').value=settings.register;
  document.getElementById('set-sound').checked=!!settings.sound;
  document.getElementById('set-strictpath').checked=!!settings.strictPath;
  document.getElementById('set-endcolors').checked=!!settings.endColors;
  document.getElementById('set-nikudcheck').value=settings.nikudCheck;
  nikud.addEventListener('change',function(){settings.nikud=nikud.value;saveSettings();applyNikudCheckSetting();renderCurrent();showToast(t('settingsSaved'));});
  document.getElementById('set-translit').addEventListener('change',function(e){settings.translit=e.target.checked;saveSettings();renderCurrent();});
  document.getElementById('set-register').addEventListener('change',function(e){settings.register=e.target.value;saveSettings();currentQ=null;renderCurrent();});
  document.getElementById('set-sound').addEventListener('change',function(e){settings.sound=e.target.checked;saveSettings();});
  document.getElementById('set-strictpath').addEventListener('change',function(e){settings.strictPath=e.target.checked;saveSettings();renderCurrent();});
  document.getElementById('set-endcolors').addEventListener('change',function(e){settings.endColors=e.target.checked;saveSettings();applyEndColorsSetting();});
  document.getElementById('set-nikudcheck').addEventListener('change',function(e){settings.nikudCheck=e.target.value;saveSettings();applyNikudCheckSetting();});
  document.getElementById('set-export').addEventListener('click',exportProgress);
  document.getElementById('set-import').addEventListener('click',function(){document.getElementById('set-file').click();});
  document.getElementById('set-file').addEventListener('change',importProgress);
  document.getElementById('set-reset').addEventListener('click',resetProgress);
  document.getElementById('set-close').addEventListener('click',closeModal);
}
function exportProgress(){
  const data={version:1,stats:stats,settings:settings,best:bestTimes};
  try{
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='hebrew_pronouns_progress.json';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    showToast(t('exported'));
  }catch(e){showToast(t('exportError'));}
}
function importProgress(e){
  const file=e.target.files&&e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(){
    try{
      const data=JSON.parse(reader.result);
      if(data&&data.stats&&typeof data.stats==='object'){
        stats=data.stats;
        if(data.settings&&typeof data.settings==='object'){
          const base={nikud:'hint',translit:true,register:'colloquial',sound:true,strictPath:false,score:0,streak:0,bestStreak:0,endColors:true,nikudCheck:'auto',pfxFilter:{prefixes:[],tags:[],forms:[],weak:false,notAuto:false}};
          settings=Object.assign(base,data.settings);
          if(['always','hint','off'].indexOf(settings.nikud)<0) settings.nikud='hint';
          if(['colloquial','strict'].indexOf(settings.register)<0) settings.register='colloquial';
          if(typeof settings.endColors!=='boolean') settings.endColors=true;
          if(['auto','off','smart','full'].indexOf(settings.nikudCheck)<0) settings.nikudCheck='auto';
          if(!settings.pfxFilter||typeof settings.pfxFilter!=='object') settings.pfxFilter={prefixes:[],tags:[],forms:[],weak:false,notAuto:false};
          if(!Array.isArray(settings.pfxFilter.prefixes)) settings.pfxFilter.prefixes=[];
          if(!Array.isArray(settings.pfxFilter.tags)) settings.pfxFilter.tags=[];
          if(!Array.isArray(settings.pfxFilter.forms)) settings.pfxFilter.forms=[];
          if(typeof settings.pfxFilter.weak!=='boolean') settings.pfxFilter.weak=false;
          if(typeof settings.pfxFilter.notAuto!=='boolean') settings.pfxFilter.notAuto=false;
        }
        if(data.best&&typeof data.best==='object') bestTimes=data.best;
        saveStats();saveSettings();saveBest();updateProgress();applyEndColorsSetting();applyNikudCheckSetting();renderCurrent();closeModal();
        showToast(t('imported'));
      }else{
        showToast(t('importError'));
      }
    }catch(err){showToast(t('importError'));}
  };
  reader.readAsText(file);
}
function resetProgress(){
  if(!confirm(t('resetConfirm'))) return;
  stats={};
  bestTimes={};
  settings.score=0;settings.streak=0;settings.bestStreak=0;
  saveStats();saveBest();saveSettings();
  recentWrong=[];history=[];currentQ=null;keyMiniQ=null;runState=null;speedState=null;
  pfxQ=null;pfxHistory=[];pfxSpeedState=null;pfxPhraseAnswered=false;
  updateProgress();renderCurrent();closeModal();
  showToast(t('resetDone'));
}

const PFX_RULES=[
  {tag:'plain',ru:'Обычная форма приставки.',en:'Default form of the prefix.'},
  {tag:'article',ru:'С артиклем ה: ה исчезает, гласная остаётся.',en:'With the article ה: ה disappears, its vowel stays.'},
  {tag:'sheva',ru:'Перед буквой со шва.',en:'Before a letter with shva.'},
  {tag:'yod',ru:'Перед י со шва.',en:'Before י with shva.'},
  {tag:'guttural',ru:'Перед א/ע: מ → מֵ, артикль → הָ.',en:'Before א/ע: מ → מֵ, the article → הָ.'},
  {tag:'u',ru:'ו → וּ перед ב, מ, פ или шва.',en:'ו → וּ before ב, מ, פ or shva.'}
];
