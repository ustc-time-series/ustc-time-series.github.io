import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('homepage omits the standalone context-aware forecasting module', () => {
  assert.ok(!page.includes('id="context-aware"'));
  assert.ok(
    !page.includes('<h2>情境感知的时间序列预测（Context-Aware Time Series Forecasting）</h2>'),
  );
});

test('homepage research navigation links to context-aware forecasting', () => {
  const menu = page.match(
    /<div class="nav-dropdown-menu" role="menu">([\s\S]*?)<\/div>/,
  )?.[1] ?? '';
  const forecastingIndex = menu.indexOf(
    '<a href="forecasting/" role="menuitem">时间序列预测</a>',
  );
  const contextAwareIndex = menu.indexOf(
    '<a href="context-cast/" role="menuitem">情境感知的时间序列预测</a>',
  );
  const classificationIndex = menu.indexOf(
    '<a href="classification-anomaly/" role="menuitem">时间序列分类与异常检测</a>',
  );

  assert.ok(forecastingIndex >= 0, 'Forecasting should remain in the research menu');
  assert.ok(contextAwareIndex >= 0, 'Context-aware forecasting should appear in the research menu');
  assert.ok(classificationIndex >= 0, 'Classification and anomaly detection should remain in the research menu');
  assert.ok(forecastingIndex < contextAwareIndex);
  assert.ok(contextAwareIndex < classificationIndex);
});

test('homepage names the context-cognitive forecasting foundation model', () => {
  const section = page.match(
    /<div class="section-intro section-anchor" id="cognitive-llm">([\s\S]*?)<\/div>/,
  )?.[1] ?? '';

  assert.ok(section.includes('<h2>情境认知推演驱动的时间序列预测基础模型</h2>'));
  assert.ok(
    !section.includes(
      '<h2>情境认知驱动的时间序列推演基础模型（Time Series Foundation Model）</h2>',
    ),
  );
});

test('homepage names the autonomous-interaction forecasting agent', () => {
  const section = page.match(
    /<div class="section-intro section-anchor" id="system-integration">([\s\S]*?)<\/div>/,
  )?.[1] ?? '';

  assert.ok(section.includes('<h2>自主交互驱动的时间序列预测智能体</h2>'));
  assert.ok(!section.includes('<h2>基于自主交互的时序预测智能体（Agentic TSF）</h2>'));
});

test('homepage foundation-model card links to the CastMind homepage', () => {
  const card = page.match(
    /<!-- Foundation Models -->([\s\S]*?)<!-- ── Applied Research ── -->/,
  )?.[1] ?? '';

  assert.ok(card.includes('<h3>时间序列基础模型</h3>'));
  assert.ok(
    card.includes(
      '<a class="card-btn btn-enter-foundation" href="https://ustc-time-series.github.io/cast-mind/" target="_blank" rel="noopener">查看主页 →</a>',
    ),
  );
  assert.ok(!card.includes('CastMind Coming Soon'));
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
  assert.match(page, /\.nav-brand\s*\{[^}]*color:\s*#091f44;/);
  assert.match(page, /\.nav-brand span\s*\{\s*color:\s*#091f44;\s*\}/);
});

test('homepage defines the shared AI for Science color system', () => {
  assert.match(page, /<meta name="theme-color" content="#f4f7f9"\s*\/>/);
  assert.match(page, /--accent:\s*#091f44;/);
  assert.match(page, /--accent-dark:\s*#06162e;/);
  assert.match(page, /--accent-soft:\s*#edf7fc;/);
  assert.match(page, /--text-strong:\s*#091f44;/);
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
