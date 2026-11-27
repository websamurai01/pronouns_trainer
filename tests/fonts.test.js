const test = require('node:test');
const assert = require('node:assert');
const { readSource } = require('./harness');

const HEBREW_FAMILIES = ['Noto Serif Hebrew', 'Frank Ruhl Libre', 'David Libre', 'Noto Sans Hebrew'];

test('the base font stack can draw hebrew', () => {
  const css = readSource('css/style.css');
  const hebrew = css.match(/--hebrew:([^;]+);/)[1];
  HEBREW_FAMILIES.forEach((family) => {
    assert.ok(hebrew.includes(family), `--hebrew lost ${family}`);
  });

  // Hebrew letters appear inside plain labels (prefix tags, traps, mnemonics).
  // Those carry no .he class, so the fallback stack has to reach the same font.
  const base = css.match(/html,body\{[^}]*font-family:([^;]+);/)[1];
  HEBREW_FAMILIES.forEach((family) => {
    assert.ok(base.includes(family), `the base stack cannot draw ${family}`);
  });
});
