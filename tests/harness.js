// Loads the real page and its scripts into jsdom, so tests exercise the code
// that ships.
//
// The app is a set of classic scripts whose top-level bindings are `let`,
// `const` and `function`. Those live in the lexical scope of a script and are
// not reachable through a later independent eval, so the harness loads all
// scripts as one program and keeps a direct-eval bridge into that scope. That
// bridge is what `run()` calls: names resolve exactly as they would in the
// browser, and assignment reaches the same objects the app uses.
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

const SCRIPTS = [
  'data.js',
  'core.js',
  'map.js',
  'train.js',
  'phrases.js',
  'prefixes.js',
  'keyboard.js',
  'boot.js',
];

const BRIDGE = '\n;window.__eval = function (code) { return eval(code); };';

function loadApp(options) {
  const html = fs
    .readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    .replace(/<link[^>]*fonts\.(googleapis|gstatic)[^>]*>/g, '');

  const dom = new JSDOM(html, {
    url: 'https://app.test/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });

  const { window } = dom;
  window.eval('localStorage.clear()');

  if (!(options && options.skipInit)) {
    const program = SCRIPTS.map((name) => fs.readFileSync(path.join(ROOT, 'js', name), 'utf8'));
    window.eval(program.join('\n;\n') + BRIDGE);
  } else {
    // Only the data layer, for checks that must not touch the DOM.
    window.eval(fs.readFileSync(path.join(ROOT, 'js', 'data.js'), 'utf8') + BRIDGE);
  }

  return {
    dom,
    window,
    document: window.document,
    run: (code) => window.__eval(code),
  };
}

function readSource(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

module.exports = { loadApp, readSource, ROOT };
