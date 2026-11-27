const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');

const CYRILLIC = '/[\\u0400-\\u04FF]/';

// Renders every screen in English, then reports the labels that stayed
// Russian. The language switch itself is the one place that names Russian.
const SCAN = `(function () {
  setLang('en');
  const out = [];
  const scan = function (where) {
    document.querySelectorAll('[title], [aria-label]').forEach(function (el) {
      if (el.closest('#lang-switch')) return;
      ['title', 'aria-label'].forEach(function (attr) {
        const value = el.getAttribute(attr);
        if (value && ${CYRILLIC}.test(value)) out.push(where + ' ' + attr + '=' + value);
      });
    });
  };
  ['map', 'path', 'train', 'phrases', 'prefix'].forEach(function (tab) {
    switchTab(tab);
    scan(tab);
  });
  // an irregular form carries its own label
  switchTab('map');
  currentMapSub = 'preps';
  renderMap();
  scan('preps');
  // settings dialog and progress badge
  openSettings();
  scan('settings');
  closeModal();
  return out;
})()`;

test('english screens keep no russian labels', () => {
  const app = loadApp();
  assert.deepStrictEqual([...app.run(SCAN)], []);
});

test('the irregular marker speaks english', () => {
  const app = loadApp();
  assert.strictEqual(app.run('I18N.en.irregularForm'), 'irregular form');
  assert.strictEqual(app.run('I18N.ru.irregularForm'), 'нерегулярная форма');
  const title = app.run(`(function () {
    setLang('en');
    const holder = document.createElement('div');
    holder.innerHTML = heFormHTML('min', '1s', false);
    return holder.querySelector('.irreg-mark').getAttribute('title');
  })()`);
  assert.strictEqual(title, 'irregular form');
});

test('the progress badge tooltip follows the language', () => {
  const app = loadApp();
  const tooltip = app.run(`(function () {
    setLang('en');
    return document.getElementById('auto-badge').title;
  })()`);
  assert.strictEqual(tooltip, 'automatic: 0');
});

test('resetting progress says so, and a failed export does not blame a file', () => {
  const app = loadApp();
  const said = app.run(`(function () {
    window.confirm = function () { return true; };
    resetProgress();
    const afterReset = document.getElementById('toast').textContent;
    const realCreate = URL.createObjectURL;
    URL.createObjectURL = function () { throw new Error('boom'); };
    exportProgress();
    const afterExport = document.getElementById('toast').textContent;
    URL.createObjectURL = realCreate;
    return { afterReset, afterExport };
  })()`);
  assert.strictEqual(said.afterReset, app.run("t('resetDone')"));
  assert.notStrictEqual(said.afterReset, app.run("t('saved')"));
  assert.strictEqual(said.afterExport, app.run("t('exportError')"));
});
