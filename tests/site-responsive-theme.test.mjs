import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePaths = [
  'index.html',
  'applications/index.html',
  'CastStar/index.html',
  'cast-bench/index.html',
  'cast-claw/docs/en.html',
  'cast-claw/docs/index.html',
  'cast-claw/index.html',
  'cog-cast/index.html',
  'cast-embedding/index.html',
  'cast-factory/index.html',
  'cast-mind/index.html',
  'classification-anomaly/index.html',
  'context-cast/index.html',
  'forecasting/index.html',
  'forecasting/load-forecasting/index.html',
  'future-cast/index.html',
  'NeoResearch/index.html',
  'open-source/index.html',
  'papers/index.html',
  'power-forecasting/index.html',
  'scientific-time-series/index.html',
  'star-cast/index.html',
  'systems/index.html',
];

const pages = await Promise.all(
  pagePaths.map(async (path) => ({
    path,
    html: await readFile(new URL(`../${path}`, import.meta.url), 'utf8'),
  })),
);

const responsiveCss = await readFile(
  new URL('../asset/site-responsive.css', import.meta.url),
  'utf8',
).catch(() => '');

test('every page uses the supplied deep navy as its primary accent', () => {
  for (const { path, html } of pages) {
    assert.match(html, /--accent:\s*#091f44;/, `${path} should use the deep navy accent`);
    assert.ok(!html.toLowerCase().includes('#0b5fc6'), `${path} retains the bright blue accent`);
    assert.ok(!html.toLowerCase().includes('#0b78c4'), `${path} retains the bright secondary blue`);
    assert.ok(!html.toLowerCase().includes('#1c5fc3'), `${path} retains the sampled light blue`);
  }
});

test('every page loads the shared responsive hardening layer', () => {
  for (const { path, html } of pages) {
    assert.match(
      html,
      /<link rel="stylesheet" href="(?:\.\.\/){0,2}asset\/site-responsive\.css"\s*\/>/,
      `${path} should load the shared responsive stylesheet`,
    );
  }
});

test('shared responsive CSS covers fluid media, navigation, grids, and compact screens', () => {
  assert.match(responsiveCss, /img,\s*video,\s*canvas,\s*svg\s*\{[^}]*max-width:\s*100%/);
  assert.match(responsiveCss, /\.top-nav \.nav-links[\s\S]*overflow-x:\s*auto/);
  assert.match(responsiveCss, /\.nav-bar \.container[\s\S]*overflow-x:\s*auto/);
  assert.match(responsiveCss, /@media \(max-width:\s*960px\)/);
  assert.match(responsiveCss, /@media \(max-width:\s*720px\)/);
  assert.match(responsiveCss, /@media \(max-width:\s*480px\)/);
  assert.match(responsiveCss, /--topbar:\s*84px/);
  assert.match(responsiveCss, /\.topbar-inner[\s\S]*flex-wrap:\s*wrap/);
  assert.match(responsiveCss, /\.topbar-right[\s\S]*overflow-x:\s*auto/);
  assert.match(responsiveCss, /grid-template-columns:\s*1fr/);
  assert.match(responsiveCss, /overflow-wrap:\s*anywhere/);
}
);
