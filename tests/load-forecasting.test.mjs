import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const detailUrl = new URL('forecasting/load-forecasting/index.html', root);
const moduleUrl = new URL(
  'forecasting/load-forecasting/load-forecasting.mjs',
  root,
);
const demoCssUrl = new URL(
  'forecasting/load-forecasting/load-forecasting-demo.css',
  root,
);
const detail = await readFile(detailUrl, 'utf8');
const applications = await readFile(
  new URL('applications/index.html', root),
  'utf8',
);
const demoCss = await readFile(demoCssUrl, 'utf8').catch(() => '');

test('load forecasting page exposes canonical sharing metadata', () => {
  assert.ok(
    detail.includes(
      '<link rel="canonical" href="https://ustc-time-series.github.io/forecasting/load-forecasting/" />',
    ),
  );
  assert.ok(
    detail.includes(
      '<meta property="og:url" content="https://ustc-time-series.github.io/forecasting/load-forecasting/" />',
    ),
  );
  assert.ok(
    detail.includes(
      '<meta property="og:title" content="电力负荷预测 | USTC-AGI Time Series" />',
    ),
  );
});

test('load forecasting page explains the path from signals to decisions', () => {
  const overview = detail.match(
    /<section class="section-card forecast-overview" id="overview">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  assert.ok(overview.includes('<h2>从负荷曲线到调度决策</h2>'));
  for (const stage of [
    '明确预测任务',
    '融合多源驱动',
    '建模未来负荷',
    '评估风险与价值',
  ]) {
    assert.ok(overview.includes(`<h3>${stage}</h3>`), `Missing stage: ${stage}`);
  }
  for (const signal of ['历史负荷', '气象条件', '日历事件', '运行约束']) {
    assert.ok(overview.includes(`<strong>${signal}</strong>`), `Missing signal: ${signal}`);
  }
});

test('load forecasting page covers accuracy, uncertainty, and decision metrics', () => {
  const evaluation = detail.match(
    /<div class="evaluation-grid"[\s\S]*?<\/div>\s*<\/section>/,
  )?.[0] ?? '';

  for (const dimension of ['点预测误差', '概率预测质量', '峰谷与爬坡', '业务决策价值']) {
    assert.ok(evaluation.includes(`<h3>${dimension}</h3>`), `Missing dimension: ${dimension}`);
  }
  assert.ok(evaluation.includes('MAE / RMSE'));
  assert.ok(evaluation.includes('Pinball Loss'));
});

test('application research page links the power-load scenario to its detail page', () => {
  const powerScenario = applications.match(
    /<article class="scenario-card">([\s\S]*?)<\/article>/,
  )?.[1] ?? '';

  assert.ok(powerScenario.includes('城市电力负荷'));
  assert.ok(
    powerScenario.includes('href="../forecasting/load-forecasting/"'),
  );
  assert.ok(powerScenario.includes('查看电力负荷预测专题'));
});

test('long-form page exposes a compact section navigator', () => {
  const sectionNav = detail.match(
    /<nav class="section-nav"[\s\S]*?<\/nav>/,
  )?.[0] ?? '';

  for (const [href, label] of [
    ['#value', '价值意义'],
    ['#overview', '研究闭环'],
    ['#task-types', '任务分类'],
    ['#dataset-map', '数据地图'],
    ['#dataset-details', '重点数据'],
    ['#dataset-comparison', '横向对比'],
    ['#dataset-recommendations', '场景推荐'],
  ]) {
    assert.ok(
      sectionNav.includes(`href="${href}"`),
      `Missing section link: ${href}`,
    );
    assert.ok(sectionNav.includes(label), `Missing section label: ${label}`);
    assert.ok(detail.includes(`id="${href.slice(1)}"`), `Missing target: ${href}`);
  }
});

test('page explains the practical value and research significance of load forecasting', () => {
  const valueSection = detail.match(
    /<section class="section-card value-section" id="value"[\s\S]*?<\/section>/,
  )?.[0] ?? '';

  assert.ok(valueSection.includes('<h2 id="value-title">电力负荷预测的价值与意义</h2>'));
  for (const dimension of [
    '保障电网安全稳定',
    '提升调度与市场效率',
    '促进新能源消纳与低碳转型',
    '支撑需求响应与城市韧性',
  ]) {
    assert.ok(valueSection.includes(`<h3>${dimension}</h3>`), `Missing value: ${dimension}`);
  }
  assert.equal(
    valueSection.match(/<article class="value-card"/g)?.length,
    4,
  );
  for (const shift of [
    '历史拟合走向多源情境理解',
    '点预测走向概率与情景预测',
    '平均误差走向峰谷风险与决策价值',
  ]) {
    assert.ok(valueSection.includes(shift), `Missing research shift: ${shift}`);
  }
});

test('dataset scope distinguishes electricity load from generic time-series controls', () => {
  const scopeNote = detail.match(
    /<aside class="scope-note"[\s\S]*?<\/aside>/,
  )?.[0] ?? '';

  assert.ok(scopeNote.includes('负荷数据与通用时序对照'));
  assert.ok(scopeNote.includes('ISO-NE、AEMO、PJM、ECL'));
  assert.ok(scopeNote.includes('ETT、Traffic、Weather'));
  assert.ok(scopeNote.includes('不能混写为电力负荷数据'));
  assert.ok(!detail.includes('ETT</strong> — 唯一广泛使用的中国大陆电网公开数据'));
  assert.ok(detail.includes('ETT</strong> — 变压器温度时序基准'));
});

test('page hero behaves as content rather than an accidental refresh button', () => {
  const hero = detail.match(/<header id="hero-header"[\s\S]*?<\/header>/)?.[0] ?? '';

  assert.ok(hero.startsWith('<header id="hero-header">'));
  assert.ok(!hero.includes('role="button"'));
  assert.ok(!hero.includes('tabindex="0"'));
  assert.ok(!detail.includes('刷新当前页面'));
  assert.ok(!detail.includes('window.location.reload'));
  assert.ok(!detail.includes('.is-refreshing'));
});

test('load page exposes the interactive forecast console and simulation boundary', () => {
  assert.ok(
    detail.includes('交互演示 · 页面数值为模拟数据，不代表真实实验结果'),
  );
  assert.ok(detail.includes('本页演示数据不构成模型性能或业务效果结论'));
  assert.ok(detail.includes('<section class="section-card load-demo-card" id="load-demo"'));
  assert.ok(detail.includes('href="#load-demo">预测演示</a>'));
  assert.ok(
    detail.includes(
      '<link rel="stylesheet" href="./load-forecasting-demo.css" />',
    ),
  );
  assert.ok(
    detail.includes(
      '<script type="module" src="./load-forecasting.mjs"></script>',
    ),
  );
});

test('load forecast console provides accessible controls, chart, and metrics', () => {
  for (const id of [
    'load-scope-select',
    'load-scenario-select',
    'load-horizon-select',
    'load-forecast-chart',
    'load-metric-peak',
    'load-metric-time',
    'load-metric-ramp',
    'load-metric-width',
    'load-chart-summary',
  ]) {
    assert.ok(detail.includes(`id="${id}"`), `Missing load demo ID: ${id}`);
  }

  for (const [value, label] of [
    ['urban', '城市电网'],
    ['industrial', '产业园区'],
    ['commercial', '商业建筑'],
  ]) {
    assert.ok(detail.includes(`<option value="${value}">${label}</option>`));
  }

  for (const horizon of ['6', '12', '24']) {
    assert.ok(detail.includes(`<option value="${horizon}"`));
  }

  assert.ok(detail.includes('aria-label="用电负荷预测演示曲线"'));
  assert.ok(detail.includes('aria-live="polite"'));
});

test('load forecasting demo stylesheet matches the power-page responsive system', async () => {
  await access(demoCssUrl);
  assert.ok(demoCss.includes('.load-forecast-console'));
  assert.ok(demoCss.includes('var(--accent)'));
  assert.match(demoCss, /@media \(max-width:\s*960px\)/);
  assert.match(demoCss, /@media \(max-width:\s*720px\)/);
  assert.match(demoCss, /min-height:\s*44px/);
  assert.match(
    demoCss,
    /@media \(max-width:\s*960px\)[\s\S]*?\.load-forecast-console\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
  );
});

test('mobile section navigation keeps a 44px touch target', () => {
  assert.match(
    detail,
    /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.section-nav a\s*\{[^}]*min-height:\s*44px/,
  );
});

test('load module generates deterministic bounded series for every scenario', async () => {
  const {
    LOAD_SCOPES,
    LOAD_SCENARIOS,
    buildLoadForecastSeries,
  } = await import(moduleUrl);

  assert.equal(Object.keys(LOAD_SCOPES).length, 3);
  for (const scope of Object.keys(LOAD_SCOPES)) {
    assert.equal(Object.keys(LOAD_SCENARIOS[scope]).length, 3);
    for (const scenario of Object.keys(LOAD_SCENARIOS[scope])) {
      for (const horizon of [6, 12, 24]) {
        const options = { scope, scenario, horizon };
        const first = buildLoadForecastSeries(options);
        const second = buildLoadForecastSeries(options);

        assert.deepEqual(first, second);
        assert.equal(first.length, 12 + horizon);
        assert.equal(first.filter((point) => point.actual !== null).length, 12);
        for (const point of first) {
          assert.ok(point.actual === null || point.actual >= 0);
          assert.ok(
            point.actual === null ||
            point.actual <= LOAD_SCOPES[scope].capacity,
          );
          assert.ok(point.p10 >= 0);
          assert.ok(point.p10 <= point.forecast);
          assert.ok(point.forecast <= point.p90);
          assert.ok(point.p90 <= LOAD_SCOPES[scope].capacity);
        }
      }
    }
  }
});

test('load forecast horizons preserve their overlapping trajectory', async () => {
  const { buildLoadForecastSeries } = await import(moduleUrl);
  const short = buildLoadForecastSeries({
    scope: 'urban',
    scenario: 'heatwave',
    horizon: 6,
  }).filter((point) => point.isFuture);
  const long = buildLoadForecastSeries({
    scope: 'urban',
    scenario: 'heatwave',
    horizon: 24,
  }).filter((point) => point.isFuture).slice(0, 6);

  assert.deepEqual(short, long);
});

test('load forecast summary and chart dimensions expose stable outputs', async () => {
  const {
    buildLoadForecastSeries,
    summarizeLoadForecast,
    getLoadChartDimensions,
  } = await import(moduleUrl);
  const series = buildLoadForecastSeries({
    scope: 'commercial',
    scenario: 'hot_traffic',
    horizon: 24,
  });
  const summary = summarizeLoadForecast(series);

  assert.ok(summary.peak > 0);
  assert.match(summary.peakLabel, /^\d{2}:00$/);
  assert.ok(summary.maxRamp >= 0);
  assert.ok(summary.meanIntervalWidth > 0);
  assert.deepEqual(
    getLoadChartDimensions(642, true),
    { width: 642, height: 310 },
  );
  assert.deepEqual(
    getLoadChartDimensions(760, false),
    { width: 760, height: 380 },
  );
});

test('load page scripts remain syntactically valid and local assets resolve', async () => {
  for (const [, script] of detail.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new Function(script));
  }

  await access(moduleUrl);
  const moduleSource = await readFile(moduleUrl, 'utf8');
  assert.ok(moduleSource.includes('export function buildLoadForecastSeries'));
  assert.ok(moduleSource.includes('export function summarizeLoadForecast'));
});
