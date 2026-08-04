import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(
  new URL('../applications/index.html', import.meta.url),
  'utf8',
);

const focusSection = page.match(
  /<section class="section-card focus-section"[^>]*>([\s\S]*?)<\/section>/,
)?.[1] ?? '';

const forecastDecisionSection = page.match(
  /<section class="section-card forecast-decision-section"[\s\S]*?<\/section>/,
)?.[0] ?? '';

const scenarioHeadingIndex = page.indexOf('<h3>应用研究场景</h3>');
const focusSectionIndex = page.indexOf(
  '<section class="section-card focus-section"',
);

test('applications page publishes canonical sharing metadata', () => {
  assert.ok(
    page.includes(
      '<link rel="canonical" href="https://ustc-time-series.github.io/applications/" />',
    ),
  );
  assert.ok(page.includes('<meta property="og:type" content="website" />'));
  assert.ok(
    page.includes(
      '<meta property="og:url" content="https://ustc-time-series.github.io/applications/" />',
    ),
  );
  assert.ok(page.includes('<meta property="og:title" content="应用研究 | USTC-AGI Time Series" />'));
  assert.ok(page.includes('<meta property="og:description"'));
  assert.ok(page.includes('<meta property="og:image" content="https://ustc-time-series.github.io/asset/ts_logo.png" />'));
  assert.ok(page.includes('<meta name="twitter:card" content="summary_large_image" />'));
});

test('applications page inline scripts remain syntactically valid', () => {
  const scripts = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, source]) => source,
  );

  assert.ok(scripts.length > 0, 'The page should contain its navigation script');
  scripts.forEach((source) => assert.doesNotThrow(() => new Function(source)));
});

test('application hero behaves as semantic content rather than a refresh control', () => {
  const hero = page.match(/<header id="hero-header"[\s\S]*?<\/header>/)?.[0] ?? '';

  assert.ok(hero, 'The page hero should exist');
  assert.ok(!hero.includes('role="button"'));
  assert.ok(!hero.includes('tabindex="0"'));
  assert.ok(!hero.includes('aria-label="刷新当前页面"'));
  assert.ok(!page.includes('window.location.reload()'));
  assert.ok(!page.includes("classList.contains('is-refreshing')"));
  assert.doesNotMatch(page, /header\s*\{[^}]*cursor:\s*pointer/);
});

test('long application page exposes an accessible section navigator', () => {
  const sectionNav = page.match(
    /<nav class="section-nav" aria-label="页面章节导航">([\s\S]*?)<\/nav>/,
  )?.[1] ?? '';

  assert.ok(page.includes('<a class="skip-link" href="#main-content">跳到主要内容</a>'));
  assert.ok(page.includes('<main id="main-content">'));
  assert.ok(sectionNav, 'The section navigator should exist below the hero');

  const expectedLinks = [
    ['#research-map', '研究地图'],
    ['#forecast-decision', '预测与决策'],
    ['#research-loop', '研究闭环'],
    ['#cog-cast-framework', 'CogCast 框架'],
    ['#application-scenarios', '应用场景'],
  ];

  for (const [href, label] of expectedLinks) {
    assert.ok(sectionNav.includes(`href="${href}"`), `Missing ${href}`);
    assert.ok(sectionNav.includes(`>${label}</a>`), `Missing ${label}`);
    assert.ok(page.includes(`id="${href.slice(1)}"`), `Missing target ${href}`);
  }

  assert.match(page, /\.section-nav\s*\{[\s\S]*?position:\s*sticky/);
  assert.match(page, /main section\[id\]\s*\{\s*scroll-margin-top:/);
  assert.match(
    page,
    /@media \(max-width: 640px\)[\s\S]*?\.section-nav a\s*\{\s*min-height:\s*44px/,
  );
});

test('research map links problem, method, and system to concrete destinations', () => {
  const researchMap = page.match(
    /<section class="section-card" id="research-map">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  assert.ok(researchMap, 'The research map should exist');
  assert.ok(researchMap.includes('href="#application-scenarios">查看应用场景 →</a>'));
  assert.ok(researchMap.includes('href="#research-loop">查看研究闭环 →</a>'));
  assert.ok(researchMap.includes('href="../cast-claw/">进入 CastClaw →</a>'));
  assert.equal(
    (researchMap.match(/class="overview-link"/g) ?? []).length,
    3,
    'Each research-map card should provide one destination',
  );
  assert.match(page, /\.overview-link\s*\{[\s\S]*?min-height:\s*44px/);
});

test('applications page explains why forecasting must represent uncertainty', () => {
  assert.ok(
    forecastDecisionSection,
    'The forecast-to-decision section should exist',
  );
  assert.ok(forecastDecisionSection.includes('未来具有不确定性'));
  assert.ok(forecastDecisionSection.includes('不确定性预测'));

  for (const concept of ['预测区间', '分位数', '情景概率']) {
    assert.ok(
      forecastDecisionSection.includes(concept),
      `Missing uncertainty concept: ${concept}`,
    );
  }
});

test('applications page connects forecast distributions to business decisions', () => {
  assert.ok(forecastDecisionSection.includes('预测需要服务并支撑决策'));

  for (const concept of ['预测分布', '风险与成本', '业务约束', '决策行动']) {
    assert.ok(
      forecastDecisionSection.includes(concept),
      `Missing decision concept: ${concept}`,
    );
  }

  assert.ok(forecastDecisionSection.includes('data-visual="uncertainty"'));
  assert.ok(forecastDecisionSection.includes('data-visual="decision"'));
  assert.equal(
    (forecastDecisionSection.match(/class="forecast-decision-visual"/g) ?? [])
      .length,
    2,
    'The two ideas should each have a dedicated visual',
  );
});

test('applications page defines a four-gate evidence boundary', () => {
  const evidenceSection = page.match(
    /<section class="section-card evidence-section"[\s\S]*?<\/section>/,
  )?.[0] ?? '';

  assert.ok(evidenceSection, 'The evidence boundary section should exist');
  assert.ok(evidenceSection.includes('应用结论必须经过四道证据门'));

  for (const gate of ['时间切分', '基线对照', '不确定性校准', '决策效用']) {
    assert.ok(evidenceSection.includes(gate), `Missing evidence gate: ${gate}`);
  }

  assert.equal(
    (evidenceSection.match(/class="evidence-card"/g) ?? []).length,
    4,
    'The evidence boundary should expose four concrete gates',
  );
  assert.ok(evidenceSection.includes('演示数据不等同于实验结果'));
  assert.ok(evidenceSection.includes('不构成生产部署承诺'));
  assert.match(
    page,
    /\.evidence-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/,
  );
  assert.match(
    page,
    /@media \(max-width: 640px\)[\s\S]*?\.evidence-grid\s*\{\s*grid-template-columns:\s*1fr/,
  );
});

test('forecast-to-decision module adapts from two columns to one', () => {
  assert.match(
    page,
    /\.forecast-decision-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  );
  assert.match(
    page,
    /@media \(max-width: 640px\)[\s\S]*?\.forecast-decision-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
  );
});

test('applications page omits the redundant standalone research workflow module', () => {
  assert.doesNotMatch(
    page,
    /<section class="section-card">\s*<h3>研究流程<\/h3>/,
  );
  assert.ok(!page.includes('class="workflow-steps"'));
  assert.doesNotMatch(page, /^\s*\.workflow-steps\s*\{/m);
  assert.doesNotMatch(page, /^\s*\.workflow-step(?:\s|:|\.)/m);
});

test('application scenarios are the final content module', () => {
  assert.ok(
    scenarioHeadingIndex > focusSectionIndex,
    'The application scenarios should follow the research-loop module',
  );
  assert.match(
    page.slice(scenarioHeadingIndex),
    /<h3>应用研究场景<\/h3>[\s\S]*?<\/section>\s*<\/div>\s*<\/div>\s*<\/main>/,
  );
});

test('application research loop uses four distinct stage visuals', () => {
  assert.ok(focusSection, 'The enhanced focus section should exist');

  for (const visual of ['diagnosis', 'fusion', 'collaboration', 'evolution']) {
    assert.ok(
      focusSection.includes(`data-visual="${visual}"`),
      `Missing distinct ${visual} visual`,
    );
  }

  assert.equal(
    (focusSection.match(/class="focus-visual /g) ?? []).length,
    4,
    'Each research stage should have one dedicated visual',
  );
  assert.equal(
    (focusSection.match(/class="focus-visual [^"]+"[^>]*>\s*<svg /g) ?? []).length,
    4,
    'Stage visuals should be lightweight inline SVGs',
  );
  assert.ok(
    !focusSection.includes('diagnosis-loop.svg'),
    'The same diagnosis diagram should not be repeated across all four stages',
  );
});

test('application research loop exposes an ordered and closed sequence', () => {
  assert.ok(focusSection.includes('aria-label="四阶段应用研究闭环"'));

  for (const step of ['01', '02', '03', '04']) {
    assert.ok(
      focusSection.includes(`data-step="${step}"`),
      `Missing ordered stage ${step}`,
    );
  }

  assert.ok(focusSection.includes('class="focus-loop-return"'));
  assert.ok(focusSection.includes('结果诊断'));
  assert.ok(focusSection.includes('研究记忆'));
});

test('application research loop provides desktop, tablet, and mobile flow cues', () => {
  assert.match(page, /\.focus-card:not\(:last-child\)::after/);
  assert.match(page, /@media \(min-width: 961px\)/);
  assert.match(page, /@media \(min-width: 641px\) and \(max-width: 960px\)/);
  assert.match(
    page,
    /@media \(min-width: 641px\) and \(max-width: 960px\)[\s\S]*?\.focus-section \.focus-grid\s*\{\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  );
  assert.match(
    page,
    /@media \(max-width: 640px\)[\s\S]*?\.focus-section \.focus-grid\s*\{\s*grid-template-columns:\s*1fr/,
  );
  assert.match(page, /@media \(max-width: 640px\)[\s\S]*\.focus-card:not\(:last-child\)::after/);
  assert.match(page, /\.focus-visual\s*\{[\s\S]*aspect-ratio:/);
});
