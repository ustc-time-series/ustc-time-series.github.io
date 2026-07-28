import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const detail = await readFile(new URL('cog-cast/index.html', root), 'utf8').catch(
  () => '',
);
const applications = await readFile(
  new URL('applications/index.html', root),
  'utf8',
);
const homepage = await readFile(new URL('index.html', root), 'utf8');
const nestedLoadPage = await readFile(
  new URL('forecasting/load-forecasting/index.html', root),
  'utf8',
);
const oneLevelNavigationPaths = [
  'applications/index.html',
  'classification-anomaly/index.html',
  'cog-cast/index.html',
  'context-cast/index.html',
  'forecasting/index.html',
  'open-source/index.html',
  'papers/index.html',
  'power-forecasting/index.html',
  'scientific-time-series/index.html',
  'star-cast/index.html',
  'systems/index.html',
];
const oneLevelNavigationPages = await Promise.all(
  oneLevelNavigationPaths.map(async (path) => ({
    path,
    html: await readFile(new URL(path, root), 'utf8'),
  })),
);

test('applications page links to the CogCast research framework', () => {
  assert.ok(
    applications.includes('href="../cog-cast/"'),
    'Applications should expose the CogCast subpage',
  );
  assert.ok(
    applications.includes('可预测性认知驱动的自适应情境感知时序研究框架'),
  );
  assert.ok(applications.includes('查看完整研究框架'));
});

test('CogCast page publishes canonical research metadata', () => {
  assert.ok(
    detail.includes(
      '<title>可预测性认知驱动的自适应情境感知时序研究框架 | USTC-AGI Time Series</title>',
    ),
  );
  assert.ok(
    detail.includes(
      '<link rel="canonical" href="https://ustc-time-series.github.io/cog-cast/" />',
    ),
  );
  assert.ok(
    detail.includes(
      '<meta property="og:url" content="https://ustc-time-series.github.io/cog-cast/" />',
    ),
  );
});

test('all research dropdowns expose predictive cognition in the shared order', () => {
  const homepageMenu =
    homepage.match(
      /<div class="nav-dropdown-menu"[^>]*>([\s\S]*?)<\/div>/,
    )?.[1] ?? '';
  assert.ok(
    homepageMenu.includes(
      '<a href="cog-cast/" role="menuitem">预测认知</a>',
    ),
    'Homepage should link to predictive cognition',
  );

  for (const { path, html } of oneLevelNavigationPages) {
    const menu =
      html.match(
        /<div class="nav-dropdown-menu"[^>]*>([\s\S]*?)<\/div>/,
      )?.[1] ?? '';
    const expectedLink =
      path === 'cog-cast/index.html'
        ? '<a class="nav-active" href="../cog-cast/" role="menuitem" aria-current="page">预测认知</a>'
        : '<a href="../cog-cast/" role="menuitem">预测认知</a>';

    assert.ok(menu.includes(expectedLink), `${path} should link to predictive cognition`);
    assert.ok(
      menu.indexOf('情境感知的时间序列预测') < menu.indexOf('预测认知'),
      `${path} should place predictive cognition after context-aware forecasting`,
    );
    assert.ok(
      menu.indexOf('预测认知') < menu.indexOf('时间序列分类与异常检测'),
      `${path} should place predictive cognition before classification`,
    );
  }

  assert.ok(
    nestedLoadPage.includes(
      '<a href="../../cog-cast/" role="menuitem">预测认知</a>',
    ),
    'Nested load page should use the two-level predictive cognition link',
  );
});

test('CogCast marks predictive cognition as the current research direction', () => {
  assert.ok(
    detail.includes(
      '<button class="nav-dropdown-toggle nav-active" type="button" aria-expanded="false">研究方向</button>',
    ),
  );
  assert.ok(
    !detail.includes(
      '<a class="nav-active" href="../applications/" aria-current="page">应用研究</a>',
    ),
  );
});

test('CogCast page frames the research program around five cognitive questions', () => {
  for (const question of [
    '什么样的序列、实例和情境是可预测的？',
    '预测困难来自噪声、稀缺样本、机制变化，还是情境缺失？',
    '面对大量外部信息，哪些情境真正影响未来？',
    '情境以何种方向、时滞、持续时间和强度改变未来轨迹？',
    '考虑价值和成本后，应使用多复杂的模型、情境、计算和人工？',
  ]) {
    assert.ok(detail.includes(question), `Missing cognitive question: ${question}`);
  }

  assert.ok(
    detail.includes(
      'Predictability → Causality and Context → Adaptive Intelligence → Decision Utility',
    ),
  );
});

test('CogCast page presents the four-stage adaptive predictability loop', () => {
  for (const stage of [
    '可预测性分析',
    '可预测性诊断',
    '可预测性增强',
    '可预测性校准',
  ]) {
    assert.ok(detail.includes(`<h2>${stage}</h2>`), `Missing stage: ${stage}`);
  }

  assert.equal(
    (detail.match(/class="loop-card /g) ?? []).length,
    4,
    'The framework should expose four ordered loop cards',
  );
  assert.ok(detail.includes('Forecast Difficulty → Cause Attribution'));
  assert.ok(detail.includes('Predicted Uncertainty ≈ Actual Forecast Risk'));
});

test('CogCast page defines credible forecasting beyond average error', () => {
  for (const dimension of ['准确性', '稳定性', '可解释性']) {
    assert.ok(
      detail.includes(`<h3>${dimension}</h3>`),
      `Missing credibility dimension: ${dimension}`,
    );
  }

  assert.ok(detail.includes('对无关扰动保持稳定，对真实变化保持敏感'));
  assert.ok(detail.includes('证据驱动的预测解释链'));
});

test('CogCast page follows the shared responsive research-page shell', () => {
  assert.ok(detail.includes('<meta name="theme-color" content="#f4f7f9" />'));
  assert.ok(detail.includes('--accent: #091f44;'));
  assert.ok(detail.includes('--text-strong: #091f44;'));
  assert.ok(detail.includes('--text: #17324d;'));
  assert.ok(detail.includes('--line: #d5e3eb;'));
  assert.ok(detail.includes('--bg: #f4f7f9;'));
  assert.ok(
    detail.includes('<link rel="stylesheet" href="../asset/site-responsive.css" />'),
  );
  assert.ok(detail.includes('@media (max-width: 960px)'));
  assert.ok(detail.includes('@media (max-width: 720px)'));
  assert.match(
    detail,
    /@media \(max-width: 720px\)[\s\S]*?\.loop-grid[\s\S]*?grid-template-columns:\s*1fr;/,
  );
});

test('CogCast inline scripts remain syntactically valid', () => {
  for (const [, script] of detail.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new Function(script));
  }
});
