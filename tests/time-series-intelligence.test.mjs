import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const detailUrl = new URL('time-series-intelligence/index.html', root);
const detail = await readFile(detailUrl, 'utf8').catch(() => '');
const homepage = await readFile(new URL('index.html', root), 'utf8');

test('time series intelligence vision page exists with canonical metadata', async () => {
  await access(detailUrl);
  assert.ok(
    detail.includes('<title>时间序列预测智能 | USTC-AGI Time Series</title>'),
  );
  assert.ok(
    detail.includes(
      '<link rel="canonical" href="https://ustc-time-series.github.io/time-series-intelligence/" />',
    ),
  );
  assert.ok(
    detail.includes(
      '<meta property="og:url" content="https://ustc-time-series.github.io/time-series-intelligence/" />',
    ),
  );
});

test('homepage exposes the vision link outside the refreshable hero control', () => {
  const hero = homepage.match(
    /<header id="hero-header"[\s\S]*?<\/header>/,
  )?.[0] ?? '';
  const entry = homepage.match(
    /<div class="hero-vision-entry"[\s\S]*?<\/div>/,
  )?.[0] ?? '';

  assert.ok(!hero.includes('hero-vision-link'));
  assert.ok(entry.includes('href="time-series-intelligence/"'));
  assert.ok(entry.includes('了解研究愿景'));
  assert.ok(homepage.indexOf('</header>') < homepage.indexOf('class="hero-vision-entry"'));
  assert.match(
    homepage,
    /\.hero-vision-link:hover\s*\{[^}]*border-color:\s*var\(--blue-muted\);/,
  );
});

test('hero states the interface and bridge thesis', () => {
  assert.ok(detail.includes('时间序列是人工智能认识复杂动态系统的重要接口'));
  assert.ok(detail.includes('预测则是连接系统认知与未来决策的关键桥梁'));
  assert.ok(detail.includes('闭环预测智能'));
});

test('page exposes a compact chapter navigator for the long-form research story', () => {
  const navigation = detail.match(
    /<nav class="section-nav" aria-label="页面章节导航">([\s\S]*?)<\/nav>/,
  )?.[1] ?? '';
  const chapters = [
    ['#positioning', '研究定位'],
    ['#research-shift', '范式跃迁'],
    ['#closed-loop', '闭环架构'],
    ['#capability-engines', '能力引擎'],
    ['#research-agenda', '研究问题'],
    ['#decision-value', '价值评测'],
  ];

  for (const [href, label] of chapters) {
    assert.ok(
      navigation.includes(`<a href="${href}">${label}</a>`),
      `Missing chapter link: ${label}`,
    );
    assert.ok(detail.includes(`id="${href.slice(1)}"`), `Missing chapter target: ${href}`);
  }
  for (let index = 1; index < chapters.length; index += 1) {
    assert.ok(
      navigation.indexOf(chapters[index - 1][0]) < navigation.indexOf(chapters[index][0]),
      `${chapters[index - 1][1]} should precede ${chapters[index][1]}`,
    );
  }
  assert.match(detail, /\.section-nav\s*\{[^}]*position:\s*sticky;[^}]*top:\s*64px;/);
  assert.match(detail, /main section\[id\]\s*\{[^}]*scroll-margin-top:\s*132px;/);
  assert.match(
    detail,
    /@media \(max-width: 960px\)[\s\S]*?\.section-nav\s*\{[^}]*position:\s*static;/,
  );
});

test('page clarifies the shift from an isolated forecast task to predictive intelligence', () => {
  const section = detail.match(
    /<section class="section-card shift-section" id="research-shift">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  assert.ok(section.includes('<h2>从孤立预测任务到闭环预测智能</h2>'));
  assert.ok(section.includes('<caption class="sr-only">孤立预测任务与闭环预测智能对比</caption>'));
  assert.equal(section.match(/<tr>/g)?.length, 6);
  for (const axis of ['观测对象', '推理方式', '预测表达', '优化目标', '系统边界']) {
    assert.ok(section.includes(`<th scope="row">${axis}</th>`), `Missing shift axis: ${axis}`);
  }
  for (const phrase of [
    '数值、事件、环境、知识与反馈',
    '感知—推理—交互的迭代过程',
    '多情景、概率、不确定性与依据',
    '预测质量、认知可信度、风险与决策效用',
    '决策后由真实反馈继续更新',
  ]) {
    assert.ok(section.includes(phrase), `Missing predictive-intelligence boundary: ${phrase}`);
  }
  assert.ok(section.includes('不是替代数值预测'));
});

test('page presents the five-stage predictive intelligence loop in order', () => {
  const section = detail.match(
    /<section class="section-card loop-section" id="closed-loop">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';
  const stages = ['系统观测', '状态认知', '未来预测', '价值导向决策', '反馈更新'];

  assert.equal(section.match(/<article class="loop-stage"/g)?.length, 5);
  for (const stage of stages) {
    assert.ok(section.includes(`<h3>${stage}</h3>`), `Missing loop stage: ${stage}`);
  }
  for (let index = 1; index < stages.length; index += 1) {
    assert.ok(
      section.indexOf(stages[index - 1]) < section.indexOf(stages[index]),
      `${stages[index - 1]} should precede ${stages[index]}`,
    );
  }
});

test('page explains the three capability engines behind the loop', () => {
  const section = detail.match(
    /<section class="section-card" id="capability-engines">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  for (const capability of ['数值与情境感知', '慢思考推理', '自主交互']) {
    assert.ok(section.includes(`<h3>${capability}</h3>`), `Missing capability: ${capability}`);
  }
  assert.equal(section.match(/<article class="capability-card"/g)?.length, 3);
  const map = section.match(
    /<div class="capability-map" role="list" aria-label="能力与闭环阶段映射" aria-describedby="capability-map-note">([\s\S]*?)<\/div>/,
  )?.[1] ?? '';
  assert.equal(map.match(/<article class="capability-link" role="listitem">/g)?.length, 3);
  for (const relation of ['观测 → 认知', '认知 → 预测', '证据补全 → 反馈更新']) {
    assert.ok(map.includes(`<strong>${relation}</strong>`), `Missing capability relation: ${relation}`);
  }
  assert.ok(
    section.includes(
      '<p class="capability-map-note" id="capability-map-note">三类能力并非一次通过的串行流水线',
    ),
  );
  assert.ok(!section.includes('aria-hidden="true"'));
});

test('page defines value-oriented prediction beyond average error', () => {
  const section = detail.match(
    /<section class="section-card" id="decision-value">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  for (const criterion of [
    '预测质量',
    '认知可信度',
    '风险与不确定性',
    '决策效用',
  ]) {
    assert.ok(section.includes(`<h3>${criterion}</h3>`), `Missing criterion: ${criterion}`);
  }
  assert.ok(section.includes('不是终点'));
  assert.ok(section.includes('能否支持更好的行动'));
});

test('vision page follows the shared responsive and accessible research shell', () => {
  assert.ok(detail.includes('<meta name="theme-color" content="#f4f7f9" />'));
  assert.ok(detail.includes('--accent: #091f44;'));
  assert.ok(detail.includes('--text-strong: #091f44;'));
  assert.ok(detail.includes('--text: #17324d;'));
  assert.ok(detail.includes('--line: #d5e3eb;'));
  assert.ok(detail.includes('--bg: #f4f7f9;'));
  assert.ok(detail.includes('<link rel="stylesheet" href="../asset/site-responsive.css" />'));
  assert.ok(detail.includes('<a class="skip-link" href="#main-content">跳到主要内容</a>'));
  assert.ok(detail.includes('@media (max-width: 960px)'));
  assert.ok(detail.includes('@media (max-width: 720px)'));
  assert.match(
    detail,
    /@media \(max-width: 720px\)[\s\S]*?\.loop-grid,[\s\S]*?grid-template-columns:\s*1fr;/,
  );
  assert.match(
    detail,
    /@media \(max-width: 720px\)[\s\S]*?\.nav-dropdown\s*\{[^}]*position:\s*static;/,
  );
  assert.match(
    detail,
    /@media \(max-width: 720px\)[\s\S]*?\.nav-dropdown-menu\s*\{[^}]*left:\s*0;[^}]*right:\s*0;[^}]*min-width:\s*0;/,
  );
  assert.ok(detail.includes('@media (prefers-reduced-motion: reduce)'));
});

test('vision page scripts are valid and local assets resolve', async () => {
  for (const [, script] of detail.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new Function(script));
  }

  for (const href of detail.matchAll(/(?:href|src)="(\.\.\/[^"#?]+)"/g)) {
    await access(new URL(href[1], detailUrl));
  }
});

test('research navigation uses disclosure semantics and restores focus on Escape', () => {
  assert.ok(
    detail.includes(
      '<button class="nav-dropdown-toggle" type="button" aria-expanded="false" aria-controls="research-menu">研究方向</button>',
    ),
  );
  assert.ok(detail.includes('<div class="nav-dropdown-menu" id="research-menu">'));
  assert.ok(!detail.includes('role="menu"'));
  assert.ok(!detail.includes('role="menuitem"'));

  const script = detail.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';
  assert.ok(script.includes('const activeElement = document.activeElement;'));
  assert.ok(script.includes('dropdown.contains(activeElement)'));
  assert.ok(script.includes('toggle.focus();'));
  assert.ok(script.includes("if (event.key === 'Escape') closeAll(true);"));
});
