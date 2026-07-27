import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const pageUrl = new URL('power-forecasting/index.html', root);
const moduleUrl = new URL('power-forecasting/power-forecasting.mjs', root);
const applicationsUrl = new URL('applications/index.html', root);

const page = await readFile(pageUrl, 'utf8').catch(() => '');
const applications = await readFile(applicationsUrl, 'utf8');

test('power forecasting page exposes canonical metadata and the shared shell', () => {
  assert.ok(
    page.includes('<title>发电功率预测 | USTC-AGI Time Series</title>'),
  );
  assert.ok(
    page.includes(
      '<link rel="canonical" href="https://ustc-time-series.github.io/power-forecasting/" />',
    ),
  );
  assert.ok(page.includes('<meta name="theme-color" content="#f4f7f9" />'));
  assert.ok(page.includes('--accent: #091f44;'));
  assert.ok(
    page.includes('<link rel="stylesheet" href="../asset/site-responsive.css" />'),
  );
  assert.ok(page.includes('href="../applications/" aria-current="page"'));
});

test('power forecasting page labels every forecast as demonstration data', () => {
  assert.ok(page.includes('交互演示 · 页面数值为模拟数据，不代表真实实验结果'));
  assert.ok(page.includes('本页演示数据不构成模型性能或业务效果结论'));
  assert.ok(!page.includes('实时预测'));
  assert.ok(!page.includes('真实预测结果'));
});

test('forecast console exposes accessible controls, chart, and metric outputs', () => {
  for (const id of [
    'station-select',
    'scenario-select',
    'horizon-select',
    'forecast-chart',
    'metric-peak',
    'metric-time',
    'metric-ramp',
    'metric-width',
    'chart-summary',
  ]) {
    assert.ok(page.includes(`id="${id}"`), `Missing forecast console ID: ${id}`);
  }

  assert.ok(page.includes('aria-label="发电功率预测演示曲线"'));
  assert.ok(page.includes('<option value="solar">光伏电站</option>'));
  assert.ok(page.includes('<option value="wind">风电场</option>'));
  for (const horizon of ['6', '12', '24']) {
    assert.ok(
      page.includes(`<option value="${horizon}"`),
      `Missing horizon option: ${horizon}`,
    );
  }
});

test('page explains the research loop and leakage-safe evaluation boundary', () => {
  for (const heading of ['关键研究问题', '预测方法闭环', '评测与可信边界']) {
    assert.ok(page.includes(`>${heading}</h2>`), `Missing section: ${heading}`);
  }

  for (const stage of ['数据对齐', '多源表征', '点与区间预测', '调度反馈']) {
    assert.ok(page.includes(`<h3>${stage}</h3>`), `Missing workflow stage: ${stage}`);
  }

  for (const concept of [
    '预测时点可获得',
    '未来信息泄漏',
    'MAE',
    'RMSE',
    'nMAE',
    '区间覆盖率',
    '平均区间宽度',
    '爬坡事件',
  ]) {
    assert.ok(page.includes(concept), `Missing evaluation concept: ${concept}`);
  }
});

test('power page exposes a complete section navigator', () => {
  for (const [target, label] of [
    ['forecast-demo', '预测演示'],
    ['value', '价值意义'],
    ['research-questions', '研究问题'],
    ['workflow', '方法闭环'],
    ['evaluation', '可信评测'],
  ]) {
    assert.ok(
      page.includes(`href="#${target}">${label}</a>`),
      `Missing section navigation link: ${label}`,
    );
    assert.ok(page.includes(`id="${target}"`), `Missing section ID: ${target}`);
  }
});

test('power page explains practical value and research significance', () => {
  assert.ok(page.includes('发电功率预测的价值与意义'));
  for (const heading of [
    '保障新能源并网安全',
    '提升新能源消纳能力',
    '协同储能与灵活性资源',
    '支撑电力交易与场站运营',
  ]) {
    assert.ok(page.includes(`<h3>${heading}</h3>`), `Missing value: ${heading}`);
  }
  for (const shift of [
    '历史拟合走向气象与物理约束融合',
    '点预测走向概率与多情景预测',
    '平均误差走向爬坡风险与决策价值',
  ]) {
    assert.ok(page.includes(shift), `Missing research shift: ${shift}`);
  }
});

test('power demo exposes an immediate simulation boundary', () => {
  const consoleSection =
    page.match(
      /<section[^>]+id="forecast-demo"[\s\S]*?<\/section>/,
    )?.[0] ?? '';

  assert.ok(consoleSection.includes('固定公式生成'));
  assert.ok(consoleSection.includes('不构成模型性能或业务效果结论'));
});

test('power section navigation is sticky and touch friendly', () => {
  assert.match(page, /\.section-nav\s*\{[\s\S]*?position:\s*sticky/);
  assert.match(
    page,
    /\.section-nav \.container\s*\{[^}]*overflow-x:\s*auto/,
  );
  assert.match(page, /\.section-nav a\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(
    page,
    /@media \(max-width:\s*720px\)[\s\S]*?\.section-nav-links\s*\{[\s\S]*?min-width:\s*max-content/,
  );
});

test('power value cards adapt from four columns to two and one', () => {
  assert.match(
    page,
    /\.value-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/,
  );
  assert.match(
    page,
    /@media \(max-width:\s*960px\)[\s\S]*?\.value-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  );
  assert.match(
    page,
    /@media \(max-width:\s*720px\)[\s\S]*?\.value-grid,[\s\S]*?grid-template-columns:\s*1fr/,
  );
});

test('page defines desktop, tablet, mobile, focus, and reduced-motion behavior', () => {
  const navTargetRule = page.match(
    /\.nav-links a,\s*\.nav-dropdown-toggle\s*\{([^}]*)\}/,
  )?.[1] ?? '';
  const menuTargetRule = page.match(
    /\.nav-dropdown-menu a\s*\{([^}]*)\}/,
  )?.[1] ?? '';

  assert.match(page, /@media \(max-width:\s*960px\)/);
  assert.match(page, /@media \(max-width:\s*720px\)/);
  assert.match(page, /@media \(max-width:\s*480px\)/);
  assert.match(page, /:focus-visible/);
  assert.match(page, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(
    page,
    /@media \(max-width:\s*960px\)[\s\S]*?\.forecast-console\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
  );
  assert.match(navTargetRule, /min-height:\s*44px;/);
  assert.match(menuTargetRule, /min-height:\s*44px;/);
  assert.match(
    page,
    /@media \(max-width:\s*720px\)[\s\S]*?body \.top-nav \.nav-links > a,[\s\S]*?body \.top-nav \.nav-dropdown-toggle\s*\{[\s\S]*?min-height:\s*44px;/,
  );
});

test('applications page links its renewable-energy card to the new page', async () => {
  const renewableCard =
    applications.match(
      /<article class="scenario-card">[\s\S]*?<span class="scenario-tag">新能源发电<\/span>[\s\S]*?<\/article>/,
    )?.[0] ?? '';

  assert.ok(renewableCard, 'The renewable-energy scenario card should exist');
  assert.ok(
    renewableCard.includes(
      '<a class="scenario-link" href="../power-forecasting/">进入发电功率预测页面 →</a>',
    ),
  );
  await access(pageUrl);
});

test('application scenario links share one responsive button style', () => {
  assert.equal(
    (applications.match(/^\s*\.scenario-link\s*\{/gm) ?? []).length,
    1,
    'Scenario links should share one base style definition',
  );
  assert.ok(applications.includes('.scenario-link:focus-visible'));
  assert.match(
    applications,
    /\.scenario-link\s*\{[\s\S]*?min-height:\s*44px;/,
  );
});

test('forecast module generates bounded deterministic solar and wind series', async () => {
  const {
    STATIONS,
    SCENARIOS,
    buildForecastSeries,
  } = await import(moduleUrl);

  assert.equal(STATIONS.solar.capacity, 100);
  assert.equal(STATIONS.wind.capacity, 120);
  assert.equal(Object.keys(SCENARIOS.solar).length, 3);
  assert.equal(Object.keys(SCENARIOS.wind).length, 3);

  for (const station of ['solar', 'wind']) {
    const scenario = Object.keys(SCENARIOS[station])[0];
    const options = { station, scenario, horizon: 24 };
    const first = buildForecastSeries(options);
    const second = buildForecastSeries(options);

    assert.deepEqual(first, second, `${station} series must be deterministic`);
    assert.equal(first.length, 36);
    assert.equal(first.filter((point) => point.actual !== null).length, 12);

    for (const point of first) {
      assert.ok(point.actual === null || point.actual >= 0);
      assert.ok(point.actual === null || point.actual <= STATIONS[station].capacity);
      assert.ok(point.p10 >= 0);
      assert.ok(point.p10 <= point.forecast);
      assert.ok(point.forecast <= point.p90);
      assert.ok(point.p90 <= STATIONS[station].capacity);
    }
  }
});

test('forecast scenarios and horizons produce meaningful distinct outputs', async () => {
  const { SCENARIOS, buildForecastSeries } = await import(moduleUrl);

  const solarScenarioKeys = Object.keys(SCENARIOS.solar);
  const clear = buildForecastSeries({
    station: 'solar',
    scenario: solarScenarioKeys[0],
    horizon: 12,
  });
  const alternate = buildForecastSeries({
    station: 'solar',
    scenario: solarScenarioKeys[1],
    horizon: 12,
  });
  const short = buildForecastSeries({
    station: 'solar',
    scenario: solarScenarioKeys[0],
    horizon: 6,
  });

  assert.equal(clear.length, 24);
  assert.equal(short.length, 18);
  assert.notDeepEqual(
    clear.map(({ forecast }) => forecast),
    alternate.map(({ forecast }) => forecast),
  );
});

test('horizon choices preserve their overlapping forecast trajectory', async () => {
  const { buildForecastSeries } = await import(moduleUrl);
  const short = buildForecastSeries({
    station: 'wind',
    scenario: 'stable',
    horizon: 6,
  }).filter((point) => point.isFuture);
  const long = buildForecastSeries({
    station: 'wind',
    scenario: 'stable',
    horizon: 24,
  }).filter((point) => point.isFuture).slice(0, 6);

  assert.deepEqual(
    short.map(({ label, forecast, p10, p90 }) => ({ label, forecast, p10, p90 })),
    long.map(({ label, forecast, p10, p90 }) => ({ label, forecast, p10, p90 })),
  );
});

test('solar forecast interval remains zero outside daylight hours', async () => {
  const { buildForecastSeries } = await import(moduleUrl);
  const series = buildForecastSeries({
    station: 'solar',
    scenario: 'clear',
    horizon: 24,
  });
  const darkFuturePoints = series.filter(
    (point) => point.isFuture && ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00'].includes(point.label),
  );

  assert.ok(darkFuturePoints.length > 0);
  assert.ok(
    darkFuturePoints.every(
      (point) => point.forecast === 0 && point.p10 === 0 && point.p90 === 0,
    ),
  );
});

test('chart dimensions use the actual narrow container width', async () => {
  const { getChartDimensions } = await import(moduleUrl);

  assert.deepEqual(getChartDimensions(258), { width: 258, height: 310 });
  assert.deepEqual(getChartDimensions(760), { width: 760, height: 380 });
  assert.deepEqual(
    getChartDimensions(642, true),
    { width: 642, height: 310 },
  );
  assert.deepEqual(getChartDimensions(0), { width: 760, height: 380 });
});

test('forecast summary reports peak, ramp, and interval-width metrics', async () => {
  const { buildForecastSeries, summarizeForecast } = await import(moduleUrl);
  const series = buildForecastSeries({
    station: 'wind',
    scenario: 'gusty',
    horizon: 24,
  });
  const summary = summarizeForecast(series);

  assert.ok(summary.peak > 0);
  assert.match(summary.peakLabel, /^\d{2}:00$/);
  assert.ok(summary.maxRamp >= 0);
  assert.ok(summary.meanIntervalWidth > 0);
});

test('inline and module scripts remain syntactically valid', async () => {
  for (const [, script] of page.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new Function(script));
  }

  const moduleSource = await readFile(moduleUrl, 'utf8');
  assert.ok(moduleSource.includes('export function buildForecastSeries'));
  assert.ok(moduleSource.includes('export function summarizeForecast'));
});
