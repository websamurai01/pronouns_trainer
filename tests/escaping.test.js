const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');

test('escHtml escapes markup', () => {
  const app = loadApp();
  assert.strictEqual(app.run('escHtml("<b>x</b>")'), '&lt;b&gt;x&lt;/b&gt;');
  assert.strictEqual(app.run('escHtml("a & b")'), 'a &amp; b');
});

test('escAttr escapes quotes and markup', () => {
  const app = loadApp();
  assert.strictEqual(app.run("escAttr('a\"b')"), 'a&quot;b');
  assert.strictEqual(app.run("escAttr('<i>&')"), '&lt;i&gt;&amp;');
});

test('a typed answer is shown as text, not as markup', () => {
  const app = loadApp();
  app.run(`(function () {
    switchTab('train');
    currentMode = 'role2form';
    currentQ = { type: 'prep', prep: 'l', role: '1s', key: 'l:1s' };
    renderTrainArea();
    document.getElementById('he-input').value = '<b>bold</b>';
    document.getElementById('btn-check').click();
  })()`);

  const box = app.document.getElementById('result-box');
  assert.match(box.textContent, /ты ввёл/);
  assert.strictEqual(box.querySelector('b'), null, 'typed markup must not become an element');
});
