const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');

const CYRILLIC = '/[\\u0400-\\u04FF]/';

test('every prefix item has a latin transliteration', () => {
  const app = loadApp();
  const nonLatin = app.run(`PFX_ITEMS.filter(it => ${CYRILLIC}.test(it.trEn || '')).map(it => it.p)`);
  assert.deepStrictEqual([...nonLatin], []);
  assert.strictEqual(app.run('PFX_ITEMS.every(it => typeof it.trEn === "string" && it.trEn.length > 0)'), true);
});

test('english screens never fall back to cyrillic transliteration', () => {
  const app = loadApp();
  const bad = app.run(`(function () {
    setLang('en');
    const out = [];
    switchTab('prefix');
    currentPrefixSub = 'ref';
    renderPrefix();
    if (${CYRILLIC}.test(document.getElementById('prefix-body').textContent)) out.push('ref');
    currentPrefixSub = 'train';
    renderPrefix();
    ['letter', 'build', 'form', 'parse', 'phrases'].forEach(function (mode) {
      pfxMode = mode;
      pfxQ = null;
      pfxPhraseQueue = [];
      renderPfxArea();
      if (${CYRILLIC}.test(document.getElementById('pfx-area').textContent)) out.push(mode);
    });
    pfxMode = 'build';
    pfxQ = null;
    renderPfxArea();
    document.getElementById('pfx-input').value = pfxQ.u;
    document.getElementById('pfx-input').dispatchEvent(new Event('input', { bubbles: true }));
    if (${CYRILLIC}.test(document.getElementById('pfx-result').textContent)) out.push('build-result');
    openPrefixModal('מ');
    if (${CYRILLIC}.test(document.getElementById('modal-body').textContent)) out.push('modal');
    closeModal();
    currentPrefixSub = 'map';
    renderPrefix();
    openPfxHeat('מ', 'article');
    if (${CYRILLIC}.test(document.getElementById('modal-body').textContent)) out.push('heat');
    closeModal();
    return out;
  })()`);
  assert.deepStrictEqual([...bad], []);
});

test('russian mode keeps the russian transliteration', () => {
  const app = loadApp();
  const text = app.run(`(function () {
    setLang('ru');
    switchTab('prefix');
    currentPrefixSub = 'ref';
    renderPrefix();
    return document.querySelector('.pfx-example span:nth-child(2)').textContent;
  })()`);
  assert.match(text, /[\u0400-\u04FF]/);
});
