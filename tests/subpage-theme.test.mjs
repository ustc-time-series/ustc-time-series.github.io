import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const subpagePaths = [
  'applications/index.html',
  'CastStar/index.html',
  'cast-claw/docs/en.html',
  'cast-claw/docs/index.html',
  'cast-claw/index.html',
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
  'scientific-time-series/index.html',
  'star-cast/index.html',
  'systems/index.html',
];

const pages = await Promise.all(
  subpagePaths.map(async (path) => ({
    path,
    html: await readFile(new URL(`../${path}`, import.meta.url), 'utf8'),
  })),
);

test('every subpage exposes the shared AI for Science palette', () => {
  for (const { path, html } of pages) {
    assert.match(
      html,
      /<meta name="theme-color" content="#f4f7f9"\s*\/>/,
      `${path} should set the shared browser theme color`,
    );
    assert.match(html, /--accent:\s*#0b5fc6;/, `${path} should define the shared accent`);
    assert.match(html, /--text-strong:\s*#061f45;/, `${path} should define strong text`);
    assert.match(html, /--text:\s*#17324d;/, `${path} should define body text`);
    assert.match(html, /--line:\s*#d5e3eb;/, `${path} should define borders`);
    assert.match(html, /--bg:\s*#f4f7f9;/, `${path} should define the page canvas`);
  }
});

test('subpages contain no legacy teal interface tokens', () => {
  const legacyTokens = [
    '#087466',
    '#0b5e58',
    '#0b5f59',
    '#0c4a44',
    '#0f766e',
    '#14b8a6',
    '#2dd4bf',
    '#42c6b7',
    '#5ecfc6',
    '#5eead4',
    '#99e6d8',
    '#b2e8d8',
    '#b8e7dc',
    '#b9e8df',
    '#bde7de',
    '#bee5dc',
    '#cae7e1',
    '#cce7e1',
    '#cce8e2',
    '#cde9e3',
    '#d7f7ee',
    '#d8eee9',
    '#d9eee9',
    '#dce7e2',
    '#dcebe6',
    '#dfeee9',
    '#e0ebe7',
    '#e3ebe7',
    '#e6fbf7',
    '#e6fbf8',
    '#e7faf6',
    '#ecfdf7',
    '#ecfdf9',
    '#edf3f0',
    '#edf7f3',
    '#eefaf7',
    '#eefbf8',
    '#effcf8',
    '#effdf9',
    '#f0fdf9',
    '#f0fdfb',
    '#f1faf7',
    '#f2fcf8',
    '#f2fcfa',
    '#f3fdf9',
    '#f5fdfa',
    '#f5fffc',
    '#f6fffc',
    '#f7faf8',
    '#f7fffc',
    '#f8fbf9',
    '#f8fffd',
    '#fafdfa',
    '#fbfdfb',
    '#fbfdfc',
    '#fcfffe',
    '#fdffff',
    'rgba(15, 118, 110',
    'rgba(20, 184, 166',
    'rgba(45, 212, 191',
  ];

  for (const { path, html } of pages) {
    for (const token of legacyTokens) {
      assert.ok(!html.includes(token), `${path} retains legacy interface token ${token}`);
    }
  }
});

test('CastClaw recolors its legacy red hero artwork to the blue visual system', () => {
  const castClaw = pages.find(({ path }) => path === 'cast-claw/index.html')?.html ?? '';
  const docs = pages.filter(({ path }) => path.startsWith('cast-claw/docs/'));

  assert.match(castClaw, /\.header-logo\s*\{[^}]*hue-rotate\(218deg\)/);
  assert.match(castClaw, /header h1 \.hl\s*\{\s*color:\s*var\(--accent\)/);
  for (const { path, html } of docs) {
    assert.match(
      html,
      /\.slogan-item\s*\{[^}]*color:\s*var\(--accent-dark\)/,
      `${path} should use the shared blue slogan accent`,
    );
  }
});

test('shared subpage navigation matches the homepage order and omits GitHub', () => {
  const globalNavPaths = [
    'applications/index.html',
    'classification-anomaly/index.html',
    'forecasting/index.html',
    'forecasting/load-forecasting/index.html',
    'open-source/index.html',
    'papers/index.html',
    'scientific-time-series/index.html',
    'star-cast/index.html',
    'systems/index.html',
  ];

  for (const path of globalNavPaths) {
    const html = pages.find((page) => page.path === path)?.html ?? '';
    const nav = html.match(/<nav class="top-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';

    assert.ok(nav, `${path} should expose the shared top navigation`);
    assert.ok(!nav.includes('GitHub'), `${path} should omit the top GitHub shortcut`);
    assert.ok(
      nav.indexOf('应用研究') < nav.indexOf('论文列表'),
      `${path} should place applied research before the paper list`,
    );
  }
});
