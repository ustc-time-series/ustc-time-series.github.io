import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('homepage labels the context-aware forecasting research track', () => {
  assert.ok(
    page.includes('<h2>情境感知的时间序列分析（Context-aware Time Series Forecasting）</h2>'),
    'Context-aware research heading should include its English label',
  );
});

test('homepage navigation places applied research before the paper list', () => {
  const nav = page.match(/<nav class="top-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
  const applicationsIndex = nav.indexOf('<a href="applications/">应用研究</a>');
  const papersIndex = nav.indexOf('<a href="papers/">论文列表</a>');

  assert.ok(applicationsIndex >= 0, 'Applied research link should remain in the top navigation');
  assert.ok(papersIndex >= 0, 'Paper list link should remain in the top navigation');
  assert.ok(applicationsIndex < papersIndex, 'Applied research should appear before the paper list');
});

test('homepage top navigation omits the GitHub shortcut', () => {
  const nav = page.match(/<nav class="top-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';

  assert.ok(!nav.includes('https://github.com/ustc-time-series/'));
  assert.doesNotMatch(nav, />\s*GitHub\s*</);
});

test('homepage brand uses the blue-gray research palette', () => {
  assert.match(page, /\.nav-brand\s*\{[^}]*color:\s*#061f45;/);
  assert.match(page, /\.nav-brand span\s*\{\s*color:\s*#0b5fc6;\s*\}/);
});

test('homepage defines the shared AI for Science color system', () => {
  assert.match(page, /<meta name="theme-color" content="#f4f7f9"\s*\/>/);
  assert.match(page, /--accent:\s*#0b5fc6;/);
  assert.match(page, /--accent-dark:\s*#083f7f;/);
  assert.match(page, /--accent-soft:\s*#edf7fc;/);
  assert.match(page, /--text-strong:\s*#061f45;/);
  assert.match(page, /--text:\s*#17324d;/);
  assert.match(page, /--line:\s*#d5e3eb;/);
  assert.match(page, /--bg:\s*#f4f7f9;/);
});

test('homepage contains no legacy teal theme colors', () => {
  const legacyThemeTokens = [
    '#0f766e',
    '#279d91',
    '#8ed4ca',
    '#9bded5',
    '#f0fdf9',
    '#99e6d8',
    '#c2e8e3',
    '#e6fbf7',
    '#0a3d38',
    '#3d6860',
    '#5ecfc6',
    'rgba(15, 118, 110',
  ];

  for (const token of legacyThemeTokens) {
    assert.ok(!page.includes(token), `Legacy theme token should be removed: ${token}`);
  }
});

test('homepage recolors the hero artwork to the blue visual system', () => {
  assert.match(page, /\.hero-logo\s*\{[^}]*hue-rotate\(218deg\)/);
});
