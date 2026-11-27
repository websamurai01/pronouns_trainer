const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');

const ARTICLE_ITEM = "PFX_ITEMS.find(it => it.prefix === 'ה' && it.art)";

test('an article prefix decompiles into ה plus the word only once', () => {
  const app = loadApp();
  assert.strictEqual(app.run(`pfxDecomp(${ARTICLE_ITEM}).key`), 'ה|בית');
});

test('the parse drill never offers a doubled article', () => {
  const app = loadApp();
  const keys = app.run(`pfxParseOptions(${ARTICLE_ITEM}).map(o => o.key)`);
  assert.ok(keys.includes('ה|בית'), 'the correct parsing is offered');
  keys.forEach((key) => {
    assert.ok(!/\|ה\|ה\|/.test(key), `doubled article in "${key}"`);
  });
});

test('the build drill shows the article tile once', () => {
  const app = loadApp();
  const tiles = app.run(`(function () {
    switchTab('prefix');
    currentPrefixSub = 'train';
    renderPrefix();
    pfxMode = 'build';
    pfxQ = ${ARTICLE_ITEM};
    renderPfxArea();
    return document.querySelector('.pfx-build-tiles').textContent.replace(/\\s+/g, '');
  })()`);
  assert.strictEqual(tiles, 'ה+בַּיִת');
});
