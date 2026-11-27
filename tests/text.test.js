const test = require('node:test');
const assert = require('node:assert');
const { loadApp, readSource } = require('./harness');

test('the trap about ל does not teach broken russian', () => {
  const app = loadApp();
  const traps = app.run('TRAPS.map(function (tr) { return tr.ru; })');
  const verbs = traps.filter((text) => /помогать\s+кого/.test(text));
  assert.deepStrictEqual([...verbs], []);
  assert.ok(
    traps.some((text) => /помогать\s+кому/.test(text)),
    'the helping verb is still mentioned, in the right case'
  );
});

test('the window sentence asks instead of denying', () => {
  const app = loadApp();
  const sentence = app.run('SENTENCES.filter(function (s) { return s.he.indexOf("חלון") >= 0; })[0]');
  assert.strictEqual(sentence.ru, 'Ты (м.) не против, если я открою окно?');
  assert.strictEqual(sentence.en, 'Do you (m.) mind if I open a window?');
});

test('the page lets the reader zoom', () => {
  const html = readSource('index.html');
  const viewport = html.match(/<meta name="viewport" content="([^"]+)"/)[1];
  assert.ok(!/user-scalable=no/.test(viewport), 'zoom is blocked');
  assert.ok(!/maximum-scale=1/.test(viewport), 'zoom is capped at 1x');
});
