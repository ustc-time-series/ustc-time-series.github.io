import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const pageUrl = new URL('cast-bench/index.html', root);
const page = await readFile(pageUrl, 'utf8').catch(() => '');
const ogImage = await readFile(new URL('cast-bench/assets/og.png', root)).catch(
  () => Buffer.alloc(0),
);
const homepage = await readFile(new URL('index.html', root), 'utf8');
const castMind = await readFile(new URL('cast-mind/index.html', root), 'utf8');

test('CastBench page exists and leads with the multidimensional leaderboard', async () => {
  await access(pageUrl);
  assert.ok(page.includes('<h1><span>CastBench</span>'));
  for (const section of [
    'Leaderboard',
    'Benchmark Dataset',
    '评测维度',
    '评测协议',
    '提交与复现',
  ]) {
    assert.ok(page.includes(section), `Missing section: ${section}`);
  }
});

test('CastBench metadata and colors match the shared research site', () => {
  assert.ok(
    page.includes('<title>CastBench — 多维时间序列模型评测与公开排行榜</title>'),
  );
  assert.ok(
    page.includes(
      '<link rel="canonical" href="https://ustc-time-series.github.io/cast-bench/" />',
    ),
  );
  for (const token of [
    '<meta name="theme-color" content="#f4f7f9" />',
    '--accent: #091f44;',
    '--accent-dark: #06162e;',
    '--accent-soft: #edf7fc;',
    '--text-strong: #091f44;',
    '--text: #17324d;',
    '--line: #d5e3eb;',
    '--bg: #f4f7f9;',
    '<link rel="stylesheet" href="../asset/site-responsive.css" />',
  ]) {
    assert.ok(page.includes(token), `Missing shared theme token: ${token}`);
  }
  for (const retiredColor of ['#0b5fc6', '#0b78c4', '#1c5fc3']) {
    assert.ok(
      !page.toLowerCase().includes(retiredColor),
      `CastBench should not use retired bright-blue token: ${retiredColor}`,
    );
  }
});

test('CastBench exposes a valid 1200 by 630 social preview image', () => {
  assert.ok(
    page.includes(
      '<meta property="og:image" content="https://ustc-time-series.github.io/cast-bench/assets/og.png" />',
    ),
    'Open Graph metadata should reference the CastBench social card',
  );
  assert.ok(
    page.includes(
      '<meta name="twitter:image" content="https://ustc-time-series.github.io/cast-bench/assets/og.png" />',
    ),
    'X metadata should reference the CastBench social card',
  );
  assert.deepEqual([...ogImage.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(ogImage.readUInt32BE(16), 1200);
  assert.equal(ogImage.readUInt32BE(20), 630);
});

test('CastBench labels every current score as protocol demo data', () => {
  assert.ok(page.includes('协议演示数据'));
  assert.ok(page.includes('不构成任何模型的正式性能声明'));
  assert.ok(page.includes('data-result-status="demo"'));
  assert.ok(!page.includes('Official Result'));
  assert.ok(!page.includes('正式榜单已发布'));
});

test('leaderboard exposes accessible filters, sortable columns, details, and comparison', () => {
  for (const hook of [
    'id="model-search"',
    'id="domain-filter"',
    'id="family-filter"',
    'id="metric-filter"',
    'data-sort-key="overall"',
    'id="leaderboard-status" aria-live="polite"',
    'id="model-dialog"',
    'id="comparison-panel"',
  ]) {
    assert.ok(page.includes(hook), `Missing interaction hook: ${hook}`);
  }
  assert.ok(page.includes('event.key === "Escape"'));
  assert.ok(page.includes('MAX_COMPARE = 3'));
  assert.ok(page.includes('aria-sort="descending"'));
});

test('leaderboard data covers representative model families and six dimensions', () => {
  for (const family of [
    'Reasoning TSFM',
    'Foundation Model',
    'Deep Forecasting',
    'Statistical',
  ]) {
    assert.ok(page.includes(family), `Missing model family: ${family}`);
  }
  for (const metric of [
    'accuracy',
    'probabilistic',
    'trend',
    'context',
    'robustness',
    'efficiency',
  ]) {
    assert.match(page, new RegExp(`${metric}:\\s*\\d`), `Missing metric data: ${metric}`);
  }
  const modelNames = [...page.matchAll(/name:\s*'([^']+)'/g)].map(([, name]) => name);
  const modelIds = [...page.matchAll(/id:\s*'([^']+)'/g)].map(([, id]) => id);
  assert.ok(modelNames.length >= 10, 'Leaderboard should include at least ten models');
  assert.equal(new Set(modelIds).size, modelIds.length, 'Model IDs should be unique');
});

test('dataset section exposes three suites and six evaluation domains', () => {
  for (const suite of [
    'General Forecasting Suite',
    'FutureCast Context Suite',
    'Stress Test Suite',
  ]) {
    assert.ok(page.includes(suite), `Missing suite: ${suite}`);
  }
  for (const domain of [
    '能源与电力',
    '交通与出行',
    '气象与环境',
    '金融与零售',
    '医疗与运营',
    '跨域困难集',
  ]) {
    assert.ok(page.includes(domain), `Missing domain: ${domain}`);
  }
  assert.ok(page.includes('首期规划'));
  assert.ok(page.includes('不虚构尚未冻结的数据规模'));
});

test('metric section publishes score direction and the complete weighting formula', () => {
  assert.ok(
    page.includes(
      'Overall = 30% Accuracy + 15% Probabilistic + 15% Trend + 20% Context + 15% Robustness + 5% Efficiency',
    ),
  );
  for (const metric of [
    '点预测准确性',
    '概率预测质量',
    '趋势与转折判断',
    '情境理解与证据利用',
    '跨域鲁棒性',
    '推理效率',
  ]) {
    assert.ok(page.includes(metric), `Missing evaluation dimension: ${metric}`);
  }
  assert.ok(page.includes('越低越好'));
  assert.ok(page.includes('统一映射为 0–100'));
});

test('protocol and submission sections make leakage and result states explicit', () => {
  for (const protocol of [
    '时间顺序切分',
    '未见实体与事件',
    '统一推理预算',
    '最差数据域',
    '预测文件与运行日志',
  ]) {
    assert.ok(page.includes(protocol), `Missing protocol rule: ${protocol}`);
  }
  assert.ok(page.includes('Demo → Submitted → Reproduced → Verified'));
  assert.ok(page.includes('提交入口筹备中'));
  assert.ok(page.includes('href="../future-cast/"'));
});

test('inline scripts are syntactically valid', () => {
  const scripts = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, source]) => source,
  );
  assert.ok(scripts.length > 0, 'Missing inline script');
  scripts.forEach((source, index) => {
    assert.doesNotThrow(
      () => new vm.Script(source),
      `Inline script ${index + 1} should parse`,
    );
  });
});

test('page exposes skip navigation, focus styles, reduced motion, and narrow-screen layouts', () => {
  assert.ok(page.includes('class="skip-link"'));
  assert.ok(page.includes('href="#main-content"'));
  assert.ok(page.includes(':focus-visible'));
  assert.ok(page.includes('@media (prefers-reduced-motion: reduce)'));
  assert.ok(page.includes('@media (max-width: 720px)'));
  assert.ok(page.includes('.table-scroll'));
  assert.ok(page.includes('overflow-x: auto;'));
});

test('model dialog sections reset the page-level section spacing', () => {
  const dialogSectionRule = page.match(/\.dialog-section\s*\{[^}]*\}/)?.[0] ?? '';

  assert.ok(dialogSectionRule, 'Missing model-dialog section rule');
  assert.ok(
    dialogSectionRule.includes('padding: 0;'),
    'Nested dialog sections should not inherit the 84px page-section padding',
  );
});

test('comparison panel ranks selected models within each metric', () => {
  assert.ok(
    page.includes('const metricRanks = new Map('),
    'Comparison rows should derive a fresh rank map for each metric',
  );
  assert.ok(
    page.includes('metricRanks.get(model.id)'),
    'Each comparison value should show its metric-specific rank',
  );
  assert.ok(
    !page.includes('<span>#${index + 1}</span>'),
    'Selection order must not be presented as metric rank',
  );
});

test('homepage links to CastBench while CastMind omits the leaderboard shortcut', () => {
  assert.ok(homepage.includes('href="cast-bench/">CastBench 排行榜</a>'));
  assert.ok(!castMind.includes('href="../cast-bench/">CastBench 排行榜</a>'));
});

test('CastBench exposes an accessible Chinese-English language switch', () => {
  for (const hook of [
    'id="language-switch"',
    'data-language="zh-CN"',
    'data-language="en"',
    'aria-pressed="true"',
    'aria-pressed="false"',
  ]) {
    assert.ok(page.includes(hook), `Missing language-control hook: ${hook}`);
  }
  assert.ok(page.includes('aria-label="语言 / Language"'));
  assert.ok(page.includes('hreflang="zh-CN"'));
  assert.ok(page.includes('hreflang="en"'));
  assert.ok(page.includes('hreflang="x-default"'));
});

test('language selection supports deep links, persistence, metadata, and rerendering', () => {
  for (const behavior of [
    "URLSearchParams(window.location.search).get('lang')",
    "localStorage.getItem(LANGUAGE_STORAGE_KEY)",
    "localStorage.setItem(LANGUAGE_STORAGE_KEY, language)",
    'document.documentElement.lang = language;',
    'history.replaceState',
    'applyTranslations(language);',
    'render();',
  ]) {
    assert.ok(page.includes(behavior), `Missing language behavior: ${behavior}`);
  }
  for (const metadataHook of [
    'id="meta-description"',
    'id="meta-og-title"',
    'id="meta-og-description"',
    'id="meta-twitter-title"',
    'id="meta-twitter-description"',
  ]) {
    assert.ok(page.includes(metadataHook), `Missing mutable metadata hook: ${metadataHook}`);
  }
});

test('English copy covers every major CastBench section and dynamic state', () => {
  for (const phrase of [
    'Multidimensional Time-Series Model Evaluation and Open Leaderboard',
    'Model Capability Leaderboard',
    'Three benchmark tracks for real-world forecasting challenges',
    'Six dimensions—not a single error metric—define what “best” means',
    'Reproducibility matters more than a polished score',
    'Submit once, retain a complete reproducibility trail',
    'No matching models',
    'Add to comparison',
    'Model Capability Profile',
    'Protocol Demo data',
    'does not constitute an official performance claim',
  ]) {
    assert.ok(page.includes(phrase), `Missing English content: ${phrase}`);
  }
  const translationHooks = [
    ...page.matchAll(/data-i18n(?:-html|-placeholder|-aria-label)?=/g),
  ];
  assert.ok(
    translationHooks.length >= 80,
    `Expected broad static translation coverage, found ${translationHooks.length} hooks`,
  );
});

test('all leaderboard models provide English strengths and cautions', () => {
  const modelNames = [...page.matchAll(/name:\s*'([^']+)'/g)].map(([, name]) => name);
  const strengths = [...page.matchAll(/strengthEn:\s*'([^']+)'/g)];
  const cautions = [...page.matchAll(/cautionEn:\s*'([^']+)'/g)];

  assert.equal(strengths.length, modelNames.length);
  assert.equal(cautions.length, modelNames.length);
  assert.equal(modelNames.length, 12);
});
