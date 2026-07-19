import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const detailUrl = new URL('scientific-time-series/index.html', root);
const detail = await readFile(detailUrl, 'utf8').catch(() => '');
const homepage = await readFile(new URL('index.html', root), 'utf8');

const siblingNavigationPages = [
  'forecasting/index.html',
  'classification-anomaly/index.html',
  'applications/index.html',
  'open-source/index.html',
  'papers/index.html',
  'star-cast/index.html',
  'systems/index.html',
];

test('scientific time series detail page exists and exposes the four-part research story', async () => {
  await access(detailUrl);
  for (const heading of [
    '科学时序数据的特点',
    '核心科学问题',
    '技术路线',
    '应用领域',
  ]) {
    assert.ok(detail.includes(heading), `Missing section: ${heading}`);
  }
  assert.ok(detail.includes('Scientific Time Series Modeling'));
  assert.ok(detail.includes('科学观测'));
  assert.ok(detail.includes('科学发现与决策'));
});

test('homepage links the scientific time series research card and dropdown', () => {
  assert.ok(homepage.includes('<h3>科学时序数据建模</h3>'));
  assert.ok(homepage.includes('href="scientific-time-series/"'));
});

test('homepage mobile research dropdown is not clipped by the navigation row', () => {
  const mobileNavRule = homepage.match(
    /@media \(max-width: 640px\) \{[\s\S]*?\.nav-links \{([\s\S]*?)\n      \}/,
  )?.[1] ?? '';

  assert.ok(mobileNavRule.includes('flex-wrap: wrap;'));
  assert.ok(mobileNavRule.includes('overflow-x: visible;'));
  assert.ok(!mobileNavRule.includes('overflow-x: auto;'));
});

test('all one-level pages expose the scientific time series dropdown entry', async () => {
  for (const path of siblingNavigationPages) {
    const page = await readFile(new URL(path, root), 'utf8');
    assert.ok(
      page.includes('href="../scientific-time-series/" role="menuitem">科学时序数据建模</a>'),
      `Missing dropdown entry in ${path}`,
    );
  }
});

test('the nested load forecasting page uses a valid two-level path', async () => {
  const page = await readFile(new URL('forecasting/load-forecasting/index.html', root), 'utf8');
  assert.ok(page.includes('href="../../scientific-time-series/" role="menuitem">科学时序数据建模</a>'));
});

test('detail page marks the new research menu item as current and supports narrow screens', () => {
  assert.ok(detail.includes('href="../scientific-time-series/" role="menuitem" aria-current="page"'));
  assert.ok(detail.includes('@media (max-width: 720px)'));
  assert.ok(detail.includes('grid-template-columns: 1fr;'));
});
