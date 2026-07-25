import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const detail = await readFile(new URL('context-cast/index.html', root), 'utf8');
const siblingNavigationPages = [
  'forecasting/index.html',
  'classification-anomaly/index.html',
  'applications/index.html',
  'open-source/index.html',
  'papers/index.html',
  'scientific-time-series/index.html',
  'star-cast/index.html',
  'systems/index.html',
];

test('context-aware forecasting page exposes canonical research metadata', () => {
  assert.ok(
    detail.includes('<title>情境感知的时间序列预测 | USTC-AGI Time Series</title>'),
  );
  assert.ok(
    detail.includes(
      '<link rel="canonical" href="https://ustc-time-series.github.io/context-cast/" />',
    ),
  );
  assert.ok(
    detail.includes(
      '<meta property="og:url" content="https://ustc-time-series.github.io/context-cast/" />',
    ),
  );
});

test('all research dropdowns link to context-aware forecasting', async () => {
  for (const path of siblingNavigationPages) {
    const page = await readFile(new URL(path, root), 'utf8');
    assert.ok(
      page.includes(
        'href="../context-cast/" role="menuitem">情境感知的时间序列预测</a>',
      ),
      `Missing context-aware forecasting dropdown entry in ${path}`,
    );
  }

  const nestedPage = await readFile(
    new URL('forecasting/load-forecasting/index.html', root),
    'utf8',
  );
  assert.ok(
    nestedPage.includes(
      'href="../../context-cast/" role="menuitem">情境感知的时间序列预测</a>',
    ),
    'Nested forecasting page should use the two-level context-aware link',
  );
});

test('page presents four context-aware forecasting capabilities as a closed loop', () => {
  const capabilitySection = detail.match(
    /<section class="section-card" id="capabilities">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  for (const capability of ['情境理解', '情境推理', '情境自主获取', '情境推演']) {
    assert.ok(
      capabilitySection.includes(`<h3>${capability}</h3>`),
      `Missing capability: ${capability}`,
    );
  }
  assert.equal(
    capabilitySection.match(/<article class="capability-card"/g)?.length,
    4,
  );
  assert.ok(capabilitySection.includes('理解 → 推理 → 获取 → 推演 → 反馈更新'));
});

test('page explains the ordered context-aware forecasting research loop', () => {
  const architectureSection = detail.match(
    /<section class="section-card" id="architecture">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  assert.ok(architectureSection.includes('<h2>闭环研究架构</h2>'));
  for (const stage of [
    '数值基线',
    '情境检索与对齐',
    '机制推理',
    '多情景推演',
    '验证与更新',
  ]) {
    assert.ok(architectureSection.includes(stage), `Missing loop stage: ${stage}`);
  }
  assert.equal(
    architectureSection.match(/<article class="process-card">/g)?.length,
    5,
  );
});

test('page covers core tasks and representative application settings', () => {
  for (const heading of ['核心研究任务', '典型应用场景']) {
    assert.ok(detail.includes(`<h2>${heading}</h2>`), `Missing section: ${heading}`);
  }
  for (const taskName of [
    '条件化预测',
    '事件冲击与反事实',
    '开放世界情境获取',
    '漂移下动态更新',
    '多情景轨迹生成',
    '证据化解释',
  ]) {
    assert.ok(detail.includes(`<h3>${taskName}</h3>`), `Missing task: ${taskName}`);
  }
  for (const domain of ['能源与电力', '交通与城市', '云服务与工业', '医疗健康']) {
    assert.ok(detail.includes(`<h3>${domain}</h3>`), `Missing domain: ${domain}`);
  }
});

test('page publishes a leakage-safe evaluation protocol', () => {
  const evaluationSection = detail.match(
    /<section class="section-card" id="evaluation">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  assert.ok(evaluationSection.includes('<h2>评测协议</h2>'));
  assert.ok(evaluationSection.includes('预测时点之后'));
  assert.ok(evaluationSection.includes('未来信息泄漏'));
  for (const setting of ['无情境', '给定情境', '自主获取']) {
    assert.ok(evaluationSection.includes(setting), `Missing evaluation setting: ${setting}`);
  }
  for (const dimension of [
    '预测质量',
    '情境利用',
    '推理可信度',
    '获取效率',
    '推演可靠性',
  ]) {
    assert.ok(evaluationSection.includes(dimension), `Missing metric dimension: ${dimension}`);
  }
});

test('page matches the shared responsive research-page shell', () => {
  assert.ok(detail.includes('<meta name="theme-color" content="#f4f7f9" />'));
  assert.ok(detail.includes('--accent: #091f44;'));
  assert.ok(detail.includes('--text-strong: #091f44;'));
  assert.ok(detail.includes('--text: #17324d;'));
  assert.ok(detail.includes('--line: #d5e3eb;'));
  assert.ok(detail.includes('--bg: #f4f7f9;'));
  assert.ok(detail.includes('<link rel="stylesheet" href="../asset/site-responsive.css" />'));
  assert.ok(detail.includes('@media (max-width: 960px)'));
  assert.ok(detail.includes('@media (max-width: 720px)'));
  assert.match(
    detail,
    /@media \(max-width: 720px\)[\s\S]*?\.capability-grid,[\s\S]*?grid-template-columns:\s*1fr;/,
  );
});

test('inline scripts remain syntactically valid', () => {
  for (const [, script] of detail.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new Function(script));
  }
});
