function bindEvents(){
  document.querySelectorAll('.flag-btn').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.lang);});});
  document.getElementById('btn-theme').addEventListener('click',toggleTheme);
  document.getElementById('btn-keyboard').addEventListener('click',onKeyboardToggle);
  document.getElementById('btn-settings').addEventListener('click',openSettings);
  document.getElementById('btn-keyboard-close').addEventListener('click',function(){setKeyboardOpen(false);});
  document.getElementById('modal-close').addEventListener('click',closeModal);
  document.getElementById('modal').addEventListener('click',function(e){if(e.target===document.getElementById('modal'))closeModal();});
  document.getElementById('tabs').addEventListener('click',function(e){
    const tab=e.target.closest('.tab');
    if(tab) switchTab(tab.dataset.tab);
  });
  document.getElementById('map-subtabs').addEventListener('click',function(e){
    const st=e.target.closest('.subtab');
    if(!st) return;
    currentMapSub=st.dataset.sub;
    document.querySelectorAll('#map-subtabs .subtab').forEach(function(x){x.classList.toggle('active',x===st);});
    renderMap();
  });
  document.getElementById('map-body').addEventListener('click',function(e){
    const cell=e.target.closest('[data-heat]');
    if(cell){const arr=cell.dataset.heat.split('|');openHeat(arr[0],arr[1]);}
  });
  document.getElementById('screen-path').addEventListener('click',function(e){
    const card=e.target.closest('[data-level]');
    if(card&&!card.classList.contains('locked')) startLevel(parseInt(card.dataset.level,10));
  });
  document.getElementById('screen-train').addEventListener('click',function(e){
    const fp=e.target.closest('[data-fprep]');
    if(fp){if(trainFilter.preps.has(fp.dataset.fprep)){if(trainFilter.preps.size>1)trainFilter.preps.delete(fp.dataset.fprep);}else trainFilter.preps.add(fp.dataset.fprep);onFilterChange();return;}
    const fg=e.target.closest('[data-fgroup]');
    if(fg){toggleFrameGroup(fg.dataset.fgroup);onFilterChange();return;}
    const fperson=e.target.closest('[data-fperson]');
    if(fperson){toggleSetValue(trainFilter.persons,parseInt(fperson.dataset.fperson,10));onFilterChange();return;}
    const fnum=e.target.closest('[data-fnum]');
    if(fnum){toggleSetValue(trainFilter.nums,fnum.dataset.fnum);onFilterChange();return;}
    const fgen=e.target.closest('[data-fgen]');
    if(fgen){toggleSetValue(trainFilter.gens,fgen.dataset.fgen);onFilterChange();return;}
    const fweak=e.target.closest('[data-fweak]');
    if(fweak){trainFilter.weak=!trainFilter.weak;onFilterChange();return;}
    const fna=e.target.closest('[data-fnotauto]');
    if(fna){trainFilter.notAuto=!trainFilter.notAuto;onFilterChange();return;}
    const freset=e.target.closest('[data-freset]');
    if(freset){initTrainFilter();onFilterChange();return;}
    const mode=e.target.closest('[data-mode]');
    if(mode){stopTimers();currentMode=mode.dataset.mode;currentQ=null;keyMiniQ=null;runState=null;speedState=null;renderModePills();renderTrainArea();return;}
  });
  document.addEventListener('click',function(e){
    const ec=e.target.closest('[data-endcolors-chip]');
    if(ec){toggleEndColors();return;}
    const nc=e.target.closest('[data-nikudchip]');
    if(nc){cycleNikudCheck();return;}
  });
  function togglePfxFilter(key,val){
    const arr=settings.pfxFilter[key];
    const i=arr.indexOf(val);
    if(i>=0) arr.splice(i,1); else arr.push(val);
    saveSettings();renderPfxFilters();pfxQ=null;renderPfxArea();
  }
  document.getElementById('screen-prefix').addEventListener('click',function(e){
    const sub=e.target.closest('[data-psub]');
    if(sub){stopTimers();currentPrefixSub=sub.dataset.psub;renderPrefix();return;}
    const letter=e.target.closest('[data-pfxletter]');
    if(letter){openPrefixModal(letter.dataset.pfxletter);return;}
    const heat=e.target.closest('[data-pfxheat]');
    if(heat){const a=heat.dataset.pfxheat.split('|');openPfxHeat(a[0],a[1]);return;}
    const pref=e.target.closest('[data-pfxpref]');
    if(pref){togglePfxFilter('prefixes',pref.dataset.pfxpref);return;}
    const tag=e.target.closest('[data-pfxtag]');
    if(tag){togglePfxFilter('tags',tag.dataset.pfxtag);return;}
    const form=e.target.closest('[data-pfxformfilter]');
    if(form){togglePfxFilter('forms',form.dataset.pfxformfilter);return;}
    const weak=e.target.closest('[data-pfxweak]');
    if(weak){settings.pfxFilter.weak=!settings.pfxFilter.weak;saveSettings();renderPfxFilters();pfxQ=null;renderPfxArea();return;}
    const na=e.target.closest('[data-pfxnotauto]');
    if(na){settings.pfxFilter.notAuto=!settings.pfxFilter.notAuto;saveSettings();renderPfxFilters();pfxQ=null;renderPfxArea();return;}
    const reset=e.target.closest('[data-pfxreset]');
    if(reset){settings.pfxFilter={prefixes:[],tags:[],forms:[],weak:false,notAuto:false};saveSettings();renderPfxFilters();pfxQ=null;renderPfxArea();return;}
    const mode=e.target.closest('[data-pfxmode]');
    if(mode){stopTimers();pfxMode=mode.dataset.pfxmode;pfxQ=null;pfxAnswered=false;pfxHintShown=false;pfxPhraseAnswered=false;pfxPhraseHintShown=false;pfxSpeedState=null;renderPfxModes();renderPfxArea();return;}
    const dir=e.target.closest('[data-pfxdir]');
    if(dir){pfxLetterDir=dir.dataset.pfxdir;pfxQ=null;renderPfxArea();return;}
    const pmode=e.target.closest('[data-pfxpmode]');
    if(pmode){pfxPhraseMode=pmode.dataset.pfxpmode;pfxPhraseAnswered=false;pfxPhraseHintShown=false;renderPfxArea();return;}
  });
  document.addEventListener('click',function(e){
    const sp=e.target.closest('[data-say]');
    if(sp){e.preventDefault();speakHebrew(sp.getAttribute('data-say'));}
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Enter'){
      const ae=document.activeElement;
      if(ae&&ae.id==='phrase-input'){e.preventDefault();const btn=document.getElementById('phrase-check');if(btn)btn.click();}
    }
  });
}

let lastTouchEnd=0;
document.addEventListener('touchend',function(e){
  const now=Date.now();
  if(now-lastTouchEnd<=300) e.preventDefault();
  lastTouchEnd=now;
},{passive:false});

function init(){
  currentLang=loadLang();
  currentTheme=document.documentElement.getAttribute('data-theme')==='dark'?'dark':'light';
  settings=loadSettings();
  stats=loadStats();
  bestTimes=loadBest();
  keyboardOpen=loadKeyboard();
  initTrainFilter();
  applyTheme(currentTheme,false);
  buildKeyboard();
  buildNikudRow();
  bindEvents();
  applyEndColorsSetting();
  applyLanguage();
  applyNikudCheckSetting();
  updateProgress();
  renderCurrent();
  syncKeyboard();
}

init();
