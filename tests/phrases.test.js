const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');

// performance.now is stubbed so the test controls the clock and does not depend
// on how long the renders take.
const OPEN_QUESTION = `(function () {
  let clock = 1000;
  const realNow = performance.now;
  performance.now = function () { return clock; };
  const tick = function (value) { clock = value; };
  switchTab('phrases');
  currentPhraseMode = 'choice';
  phraseAnswered = false;
  phraseQueue = [0, 1];
  phrasePos = 0;
  renderPhrases();
  const first = phraseStart;
  tick(5000);
  renderPhrases();
  const afterRerender = phraseStart;
  setLang('en');
  const afterLanguage = phraseStart;
  document.getElementById('phrase-next').click();
  const afterNext = phraseStart;
  performance.now = realNow;
  return { first, afterRerender, afterLanguage, afterNext };
})()`;

test('a re-render does not restart the phrase timer', () => {
  const app = loadApp();
  const shown = app.run(OPEN_QUESTION);
  assert.strictEqual(shown.first, 1000);
  assert.strictEqual(shown.afterRerender, 1000, 'plain re-render restarted the clock');
  assert.strictEqual(shown.afterLanguage, 1000, 'language switch restarted the clock');
});

test('a new phrase starts a new attempt', () => {
  const app = loadApp();
  const shown = app.run(OPEN_QUESTION);
  assert.strictEqual(shown.afterNext, 5000, 'next phrase kept the old start time');
});

test('the recorded answer time comes from the attempt start', () => {
  const app = loadApp();
  const elapsed = app.run(`(function () {
    let clock = 1000;
    const realNow = performance.now;
    performance.now = function () { return clock; };
    switchTab('phrases');
    currentPhraseMode = 'choice';
    phraseAnswered = false;
    phraseQueue = [0, 1];
    phrasePos = 0;
    renderPhrases();
    clock = 3500;
    const s = SENTENCES[0];
    const correct = FORMS[s.prep][s.role].u;
    const button = Array.from(document.querySelectorAll('[data-popt]'))
      .find(function (b) { return N(b.dataset.popt) === N(correct); });
    button.click();
    performance.now = realNow;
    return stats[s.prep + ':' + s.role].ms;
  })()`);
  assert.strictEqual(elapsed, 2500);
});
