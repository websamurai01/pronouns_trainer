function isCoarsePointer(){return !!(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches);}
function focusNoScroll(el){if(!el)return;try{el.focus({preventScroll:true});}catch(e){try{el.focus();}catch(err){}}}
function focusEnd(input){if(!input)return;if(document.activeElement!==input)focusNoScroll(input);const len=input.value.length;try{input.setSelectionRange(len,len);}catch(e){}}
function prefixTypingMode(){
  return currentPrefixSub==='train'&&(pfxMode==='build'||(pfxMode==='phrases'&&pfxPhraseMode==='type'));
}
function kbContextOK(){
  if(currentTab==='train') return currentMode==='role2form'||currentMode==='perspective'||currentMode==='run';
  if(currentTab==='phrases') return currentPhraseMode==='type';
  if(currentTab==='prefix') return prefixTypingMode();
  return false;
}
const NIKUD_MARKS=[
  {ch:'\u05B7',key:'nikudPatah'},{ch:'\u05B8',key:'nikudQamats'},{ch:'\u05B5',key:'nikudTsere'},
  {ch:'\u05B6',key:'nikudSegol'},{ch:'\u05B4',key:'nikudHiriq'},{ch:'\u05B9',key:'nikudHolam'},
  {ch:'\u05BB',key:'nikudQubuts'},{ch:'\u05B0',key:'nikudShva'},{ch:'\u05B2',key:'nikudHatafPatah'},
  {ch:'\u05B1',key:'nikudHatafSegol'},{ch:'\u05B3',key:'nikudHatafQamats'},{ch:'\u05BC',key:'nikudDagesh'}
];
function buildNikudRow(){
  const row=document.getElementById('keyboard-nikud');
  if(!row) return;
  row.innerHTML='';
  NIKUD_MARKS.forEach(function(m){
    const b=document.createElement('button');
    b.type='button';b.className='key-nikud';b.textContent='◌'+m.ch;b.setAttribute('aria-label',t(m.key));
    bindKeyAction(b,function(){kbInsert(m.ch);});
    row.appendChild(b);
  });
}
function nikudRowNeeded(){
  if(currentTab==='prefix'&&prefixTypingMode()) return true;
  return effNikudCheck()!=='off';
}
function syncNikudRow(){
  const show=keyboardOpen&&kbContextOK()&&nikudRowNeeded();
  const row=document.getElementById('keyboard-nikud');
  if(row) row.style.display=show?'flex':'none';
  document.body.classList.toggle('nikud-row-open',show);
}
function applyKbGuard(){
  const active=keyboardOpen&&kbContextOK();
  const block=active&&isCoarsePointer();
  document.querySelectorAll('.he-input').forEach(function(inp){
    if(active) inp.setAttribute('inputmode','none'); else inp.removeAttribute('inputmode');
    inp.readOnly=block;
  });
}
function kbTarget(){
  const ae=document.activeElement;
  if(ae&&ae.classList&&ae.classList.contains('he-input')) return ae;
  if(activeInput&&document.body.contains(activeInput)) return activeInput;
  return null;
}
function kbInsert(ch){
  const target=kbTarget();
  if(!target) return;
  target.value=(target.value||'')+ch;
  focusEnd(target);
  target.dispatchEvent(new Event('input',{bubbles:true}));
}
function kbBackspace(){
  const target=kbTarget();
  if(!target) return;
  target.value=Array.from(target.value||'').slice(0,-1).join('');
  focusEnd(target);
  target.dispatchEvent(new Event('input',{bubbles:true}));
}
function buildKeyboard(){
  const grid=document.getElementById('keyboard-grid');
  if(!grid) return;
  grid.innerHTML='';
  HE_KEYS.forEach(function(ch){
    const b=document.createElement('button');
    b.type='button';b.className='key-btn';b.textContent=ch;b.setAttribute('aria-label',ch);
    bindKeyAction(b,function(){kbInsert(ch);});
    grid.appendChild(b);
  });
  const space=document.createElement('button');
  space.type='button';space.className='key-btn key-space';space.textContent='␣';space.setAttribute('aria-label','Space');
  bindKeyAction(space,function(){kbInsert(' ');});
  grid.appendChild(space);
  const back=document.createElement('button');
  back.type='button';back.className='key-btn key-back';back.textContent='⌫';back.setAttribute('aria-label','Backspace');
  bindKeyAction(back,kbBackspace);
  grid.appendChild(back);
}
function bindKeyAction(el,action){
  if(window.PointerEvent){
    el.addEventListener('pointerdown',function(e){
      if(e.pointerType==='mouse'&&e.button!==0) return;
      e.preventDefault();action();
    });
  }else{
    el.addEventListener('mousedown',function(e){if(e.button!==0)return;e.preventDefault();action();});
    el.addEventListener('touchstart',function(e){e.preventDefault();action();},{passive:false});
  }
  el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}});
}
function syncKeyboard(){
  const show=keyboardOpen&&kbContextOK();
  document.body.classList.toggle('kb-open',show);
  const kb=document.getElementById('keyboard');
  if(kb) kb.setAttribute('aria-hidden',show?'false':'true');
  const btn=document.getElementById('btn-keyboard');
  if(btn) btn.classList.toggle('active',show);
  applyKbGuard();
  syncNikudRow();
}
function setKeyboardOpen(open){
  keyboardOpen=open;saveKeyboard();
  if(open&&isCoarsePointer()){
    const ae=document.activeElement;
    if(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA')){try{ae.blur();}catch(e){}}
  }
  syncKeyboard();
  if(open&&!isCoarsePointer()){const target=kbTarget();if(target)focusNoScroll(target);}
}
function onKeyboardToggle(){
  if(!kbContextOK()){
    if(currentTab==='phrases'){currentPhraseMode='type';renderPhrases();}
    else{currentTab='train';currentMode='role2form';currentQ=null;switchTab('train');}
    setKeyboardOpen(true);
    return;
  }
  setKeyboardOpen(!keyboardOpen);
}

