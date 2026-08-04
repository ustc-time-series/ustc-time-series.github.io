import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const pageUrl = new URL('hydrological-forecasting/index.html', root);
const styleUrl = new URL(
  'hydrological-forecasting/hydrological-forecasting.css',
  root,
);
const moduleUrl = new URL(
  'hydrological-forecasting/hydrological-forecasting.mjs',
  root,
);
const applicationsUrl = new URL('applications/index.html', root);

const page = await readFile(pageUrl, 'utf8').catch(() => '');
const styles = await readFile(styleUrl, 'utf8').catch(() => '');
const applications = await readFile(applicationsUrl, 'utf8');

test('hydrological page exposes canonical metadata and the shared shell', () => {
  assert.ok(
    page.includes('<title>水文时序预测 | USTC-AGI Time Series</title>'),
  );
  assert.ok(
    page.includes(
      '<link rel="canonical" href="https://ustc-time-series.github.io/hydrological-forecasting/" />',
    ),
  );
  assert.ok(page.includes('<meta name="theme-color" content="#f4f7f9" />'));
  assert.ok(page.includes('--accent: #091f44;'));
  assert.ok(
    page.includes('<link rel="stylesheet" href="../asset/site-responsive.css" />'),
  );
  assert.ok(
    page.includes(
      '<link rel="stylesheet" href="./hydrological-forecasting.css" />',
    ),
  );
  assert.ok(page.includes('href="../applications/" aria-current="page"'));
});

test('page labels the complete experience as deterministic simulation data', () => {
  assert.ok(
    page.includes(
      '交互演示 · 页面数值为模拟数据，不代表真实监测或实验结果',
    ),
  );
  assert.ok(page.includes('本页演示不构成真实流域预报、预警或业务效果结论'));
  assert.ok(page.includes('固定公式生成'));
  assert.ok(!page.includes('实时监测'));
  assert.ok(!page.includes('真实预测结果'));
});

test('forecast console exposes accessible controls, chart and outputs', () => {
  for (const id of [
    'basin-select',
    'scenario-select',
    'horizon-select',
    'update-forecast',
    'hydro-chart',
    'metric-peak',
    'metric-time',
    'metric-rise',
    'metric-risk',
    'scenario-summary',
    'chart-summary',
  ]) {
    assert.ok(page.includes(`id="${id}"`), `Missing forecast console ID: ${id}`);
  }

  assert.ok(page.includes('aria-label="水文时序预测演示图"'));
  assert.ok(page.includes('<option value="mountain">山地流域</option>'));
  assert.ok(page.includes('<option value="plain">湿润平原流域</option>'));
  assert.ok(page.includes('<option value="urban">城市河网</option>'));
  assert.ok(page.includes('<option value="normal">常态降雨</option>'));
  assert.ok(page.includes('<option value="persistent">持续降雨</option>'));
  assert.ok(page.includes('<option value="storm">短时暴雨</option>'));
  for (const horizon of ['6', '12', '24']) {
    assert.ok(
      page.includes(`<option value="${horizon}"`),
      `Missing horizon option: ${horizon}`,
    );
  }
});

test('page provides complete section navigation and hydrology research content', () => {
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

  for (const heading of [
    '水文预测的价值与意义',
    '关键研究问题',
    '预测方法闭环',
    '评测与可信边界',
  ]) {
    assert.ok(page.includes(`>${heading}</h2>`), `Missing section: ${heading}`);
  }

  for (const concept of [
    '降雨—径流',
    '前期土壤湿度',
    '流域汇流',
    '洪峰流量',
    '峰现时间',
    '物理一致性',
    '预测起点可获得',
    '未来信息泄漏',
    'MAE',
    'RMSE',
    'NSE',
    'KGE',
    '区间覆盖率',
  ]) {
    assert.ok(page.includes(concept), `Missing hydrology concept: ${concept}`);
  }
});

test('page explains the decision value and four-stage research loop', () => {
  for (const heading of [
    '增强洪水预警提前量',
    '支撑水库与水资源调度',
    '服务干旱与生态流量管理',
    '提升气候变化适应能力',
  ]) {
    assert.ok(page.includes(`<h3>${heading}</h3>`), `Missing value: ${heading}`);
  }

  for (const stage of [
    '数据与时间对齐',
    '流域状态表征',
    '物理约束概率预测',
    '风险反馈与更新',
  ]) {
    assert.ok(page.includes(`<h3>${stage}</h3>`), `Missing workflow stage: ${stage}`);
  }
});

test('page styles cover sticky navigation, responsive grids and accessibility', () => {
  assert.match(styles, /\.section-nav\s*\{[\s\S]*?position:\s*sticky/);
  assert.match(styles, /\.control-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/);
  assert.match(styles, /\.value-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,/);
  assert.match(styles, /@media \(max-width:\s*960px\)/);
  assert.match(styles, /@media \(max-width:\s*720px\)/);
  assert.match(
    styles,
    /@media \(max-width:\s*960px\)[\s\S]*?\.forecast-console\s*\{[^}]*grid-template-columns:\s*1fr/,
  );
  assert.match(
    styles,
    /@media \(max-width:\s*720px\)[\s\S]*?\.value-grid,[\s\S]*?grid-template-columns:\s*1fr/,
  );
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)/);
});

test('page styles override shared mobile defaults without shrinking touch targets', () => {
  const sharedStyleIndex = page.indexOf('../asset/site-responsive.css');
  const pageStyleIndex = page.indexOf('./hydrological-forecasting.css');

  assert.ok(sharedStyleIndex >= 0, 'The shared responsive layer should load');
  assert.ok(pageStyleIndex >= 0, 'The hydrological stylesheet should load');
  assert.ok(
    sharedStyleIndex < pageStyleIndex,
    'Page-specific 44px controls must load after the shared 40px mobile fallback',
  );
});

test('mobile section navigation does not overlap the wrapped top navigation', () => {
  assert.match(
    styles,
    /@media \(max-width:\s*720px\)[\s\S]*?\.section-nav\s*\{\s*position:\s*static;\s*top:\s*auto;/,
  );
});

test('applications page exposes a dedicated hydrological scenario entry', async () => {
  const hydroCard =
    applications.match(
      /<article class="scenario-card[^"]*">[\s\S]*?<span class="scenario-tag">水文时序预测<\/span>[\s\S]*?<\/article>/,
    )?.[0] ?? '';

  assert.ok(hydroCard, 'The hydrological scenario card should exist');
  assert.ok(hydroCard.includes('降雨—径流'));
  assert.ok(hydroCard.includes('洪峰'));
  assert.ok(
    hydroCard.includes(
      '<a class="scenario-link" href="../hydrological-forecasting/">进入水文时序预测页面 →</a>',
    ),
  );
  await access(pageUrl);
});

test('hydrological model generates bounded deterministic series', async () => {
  const { BASINS, SCENARIOS, buildHydroSeries } = await import(moduleUrl);

  assert.deepEqual(Object.keys(BASINS), ['mountain', 'plain', 'urban']);
  assert.deepEqual(Object.keys(SCENARIOS), ['normal', 'persistent', 'storm']);

  for (const basin of Object.keys(BASINS)) {
    for (const scenario of Object.keys(SCENARIOS)) {
      const options = { basin, scenario, horizon: 24 };
      const first = buildHydroSeries(options);
      const second = buildHydroSeries(options);

      assert.deepEqual(first, second, `${basin}/${scenario} must be deterministic`);
      assert.equal(first.length, 36);
      assert.equal(first.filter((point) => point.actual !== null).length, 12);
      assert.equal(first.filter((point) => point.isFuture).length, 24);

      for (const point of first) {
        assert.ok(point.rainfall >= 0);
        assert.ok(point.forecast >= 0);
        assert.ok(point.actual === null || point.actual >= 0);
        assert.ok(point.p10 >= 0);
        assert.ok(point.p10 <= point.forecast);
        assert.ok(point.forecast <= point.p90);
        if (!point.isFuture) {
          assert.equal(point.p10, point.forecast);
          assert.equal(point.p90, point.forecast);
        }
      }
    }
  }
});

test('rainfall scenarios and horizons change output without rewriting overlap', async () => {
  const { buildHydroSeries } = await import(moduleUrl);
  const normal = buildHydroSeries({
    basin: 'mountain',
    scenario: 'normal',
    horizon: 24,
  });
  const storm = buildHydroSeries({
    basin: 'mountain',
    scenario: 'storm',
    horizon: 24,
  });
  const short = buildHydroSeries({
    basin: 'mountain',
    scenario: 'storm',
    horizon: 6,
  });

  const futureRain = (series) =>
    series.filter((point) => point.isFuture).reduce((sum, point) => sum + point.rainfall, 0);
  const futurePeak = (series) =>
    Math.max(...series.filter((point) => point.isFuture).map((point) => point.forecast));

  assert.ok(futureRain(storm) > futureRain(normal));
  assert.ok(futurePeak(storm) > futurePeak(normal));
  assert.equal(short.length, 18);
  assert.deepEqual(short, storm.slice(0, 18));
});

test('summary reports peak, rise, interval and risk-window metrics', async () => {
  const { buildHydroSeries, summarizeHydroForecast } = await import(moduleUrl);
  const series = buildHydroSeries({
    basin: 'urban',
    scenario: 'storm',
    horizon: 24,
  });
  const summary = summarizeHydroForecast(series, 'urban');

  assert.ok(summary.peakFlow > 0);
  assert.match(summary.peakLabel, /^\+\d{2}h$/);
  assert.ok(summary.maxRise > 0);
  assert.ok(summary.totalRainfall > 0);
  assert.ok(summary.meanIntervalWidth > 0);
  assert.ok(summary.riskHours > 0);
  assert.match(summary.riskWindow, /^\+\d{2}h–\+\d{2}h$/);
});

test('canvas sizing preserves the real width of narrow containers', async () => {
  const { resolveCanvasWidth } = await import(moduleUrl);

  assert.equal(resolveCanvasWidth(272), 272);
  assert.equal(resolveCanvasWidth(319.6), 320);
  assert.equal(resolveCanvasWidth(0), 760);
  assert.equal(resolveCanvasWidth(Number.NaN), 760);
});

test('module validates invalid basin, scenario and horizon inputs', async () => {
  const { buildHydroSeries, summarizeHydroForecast } = await import(moduleUrl);

  assert.throws(
    () => buildHydroSeries({ basin: 'missing', scenario: 'storm', horizon: 12 }),
    /Unknown basin/,
  );
  assert.throws(
    () => buildHydroSeries({ basin: 'urban', scenario: 'missing', horizon: 12 }),
    /Unknown scenario/,
  );
  assert.throws(
    () => buildHydroSeries({ basin: 'urban', scenario: 'storm', horizon: 8 }),
    /Unsupported horizon/,
  );
  assert.throws(() => summarizeHydroForecast([], 'urban'), /future points/);
});

test('local styles and module resolve and browser script stays syntactically valid', async () => {
  await Promise.all([access(styleUrl), access(moduleUrl)]);
  assert.ok(page.includes('<script type="module" src="./hydrological-forecasting.mjs"></script>'));

  const moduleSource = await readFile(moduleUrl, 'utf8');
  assert.ok(moduleSource.includes('export const BASINS'));
  assert.ok(moduleSource.includes('export function buildHydroSeries'));
  assert.ok(moduleSource.includes('export function summarizeHydroForecast'));
});
