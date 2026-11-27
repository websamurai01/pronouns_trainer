const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');

const gloss = (app, pointed) => {
  const found = app.run(
    `PFX_ITEMS.filter(it => it.p === ${JSON.stringify(pointed)}).map(it => it.glossRu + ' | ' + it.glossEn)[0]`
  );
  assert.ok(found, `no item for ${pointed}`);
  return found;
};

test('russian glosses use the case the preposition needs', () => {
  const app = loadApp();
  assert.strictEqual(gloss(app, 'מִבַּיִת'), 'из дома | from a house');
  assert.strictEqual(gloss(app, 'בְּבַיִת'), 'в доме | in a house');
  assert.strictEqual(gloss(app, 'לְבַיִת'), 'к дому | to a house');
  assert.strictEqual(gloss(app, 'כְּבַיִת'), 'как дом | like a house');
  assert.strictEqual(gloss(app, 'וּבַיִת'), 'и дом | and a house');
});

test('definite forms read as definite in both languages', () => {
  const app = loadApp();
  assert.strictEqual(gloss(app, 'בַּבַּיִת'), 'в доме | in the house');
  assert.strictEqual(gloss(app, 'לַסֵּפֶר'), 'к книге | to the book');
  assert.strictEqual(gloss(app, 'כַּיֶּלֶד'), 'как ребёнок | like the child');
  assert.strictEqual(gloss(app, 'מֵהָעִיר'), 'из города | from the city');
  assert.strictEqual(gloss(app, 'הַיֶּלֶד'), 'определённый артикль: ребёнок | the child');
});

test('every russian gloss is a case form, never a bare nominative', () => {
  const app = loadApp();
  const bad = app.run(`PFX_ITEMS.map(it => it.glossRu).filter(g => /^(из|в|к) (дом|книга|ребёнок|цветок|государство|страна|человек|город)$/.test(g))`);
  assert.deepStrictEqual([...bad], []);
});

test('every english gloss has an article', () => {
  const app = loadApp();
  const bad = app.run(
    `PFX_ITEMS.map(it => it.glossEn).filter(g => /^(in|from|to|like|and) (house|book|child|flower|country|city|person)$/.test(g))`
  );
  assert.deepStrictEqual([...bad], []);
});
