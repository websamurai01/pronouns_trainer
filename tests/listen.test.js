const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');

const RENDER_LISTEN = `(function () {
  const realAvailable = speechAvailable;
  const realSpeak = speakHebrew;
  const spoken = [];
  speechAvailable = function () { return true; };
  speakHebrew = function (text) { spoken.push(text); };
  switchTab('train');
  currentMode = 'listen';
  currentQ = { type: 'prep', prep: 'l', role: '2ms', key: 'l:2ms' };
  renderTrainArea();
  speechAvailable = realAvailable;
  speakHebrew = realSpeak;
  return {
    spoken: spoken,
    hasReplay: !!document.getElementById('listen-play'),
    options: document.querySelectorAll('[data-lrole]').length,
  };
})()`;

test('the listening drill plays the form by itself', () => {
  const app = loadApp();
  const shown = app.run(RENDER_LISTEN);
  assert.deepStrictEqual([...shown.spoken], ['לך']);
  assert.strictEqual(shown.hasReplay, true, 'a replay button stays available');
  assert.strictEqual(shown.options, 4);
});

test('the listening drill stays silent when there is no voice', () => {
  const app = loadApp();
  const spoken = app.run(`(function () {
    const realAvailable = speechAvailable;
    const realSpeak = speakHebrew;
    const heard = [];
    speechAvailable = function () { return false; };
    speakHebrew = function (text) { heard.push(text); };
    switchTab('train');
    currentMode = 'listen';
    currentQ = null;
    renderTrainArea();
    speechAvailable = realAvailable;
    speakHebrew = realSpeak;
    return heard;
  })()`);
  assert.deepStrictEqual([...spoken], []);
});
