const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');

// Math.random picks the drill direction first, so a fixed first value forces
// the direction we want to inspect.
const FORCE_DIRECTION = (value) => `(function () {
  switchTab('train');
  currentMode = 'keymini';
  const real = Math.random;
  let first = true;
  Math.random = function () { if (first) { first = false; return ${value}; } return 0.25; };
  keyMiniQ = null;
  currentQ = null;
  renderTrainArea();
  Math.random = real;
  return {
    dir: keyMiniQ.dir,
    intro: document.querySelector('#train-area .section-intro').textContent,
    prompt: (document.querySelector('.prompt-role') || document.querySelector('.ending-big')).textContent,
  };
})()`;

test('the role to pronoun drill asks for a pronoun', () => {
  const app = loadApp();
  const shown = app.run(FORCE_DIRECTION(0.9));
  assert.strictEqual(shown.dir, 'role2pron');
  assert.strictEqual(shown.intro, app.run("t('pronQuestion')"));
  assert.notStrictEqual(shown.intro, app.run("t('roleQuestion')"));
});

test('the other key drill directions keep their own question', () => {
  const app = loadApp();
  assert.strictEqual(app.run(FORCE_DIRECTION(0.1)).intro, app.run("t('roleQuestion')"));
  assert.strictEqual(app.run(FORCE_DIRECTION(0.4)).intro, app.run("t('endingQuestion')"));
  assert.strictEqual(app.run(FORCE_DIRECTION(0.6)).intro, app.run("t('roleQuestion')"));
});

test('both dictionaries name the pronoun question', () => {
  const app = loadApp();
  assert.strictEqual(app.run('I18N.ru.pronQuestion'), 'Какое местоимение?');
  assert.strictEqual(app.run('I18N.en.pronQuestion'), 'Which pronoun?');
});

test('every dictionary key exists in both languages', () => {
  const app = loadApp();
  const missing = app.run(
    "Object.keys(I18N.ru).filter(function (k) { return !(k in I18N.en); })" +
      ".concat(Object.keys(I18N.en).filter(function (k) { return !(k in I18N.ru); }))"
  );
  assert.deepStrictEqual([...missing], []);
});
