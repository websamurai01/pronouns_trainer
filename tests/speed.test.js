const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');

const times = (text, needle) => text.split(needle).length - 1;

test('the speed screen states its rule once', () => {
  const app = loadApp();
  const label = app.run("t('speedStart')");
  const text = app.run(`(function () {
    switchTab('train');
    currentMode = 'speed';
    speedState = null;
    renderTrainArea();
    return document.getElementById('train-area').textContent;
  })()`);
  assert.strictEqual(times(text, label), 1, `"${label}" appears more than once`);
});

test('the prefix speed screen states its rule once', () => {
  const app = loadApp();
  const label = app.run("t('pfxSpeedStart')");
  const text = app.run(`(function () {
    switchTab('prefix');
    currentPrefixSub = 'train';
    renderPrefix();
    pfxMode = 'speed';
    pfxSpeedState = null;
    renderPfxArea();
    return document.getElementById('pfx-area').textContent;
  })()`);
  assert.strictEqual(times(text, label), 1, `"${label}" appears more than once`);
});
