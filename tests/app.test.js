const test = require('node:test');
const assert = require('node:assert');
const { loadApp } = require('./harness');

test('the page boots and renders the role map', () => {
  const app = loadApp();
  assert.strictEqual(app.run('currentTab'), 'map');
  const roles = app.document.querySelectorAll('.role-card');
  assert.strictEqual(roles.length, 10);
  assert.match(app.document.getElementById('progress-text').textContent, /^\d+ \/ 110$/);
});

test('progress counts every preposition role and every pronoun', () => {
  const app = loadApp();
  assert.strictEqual(app.run('progressKeys().length'), 110);
});
