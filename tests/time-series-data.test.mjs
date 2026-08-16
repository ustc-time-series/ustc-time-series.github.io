import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const detailUrl = new URL('time-series-data/index.html', root);
const detail = await readFile(detailUrl, 'utf8').catch(() => '');
const homepage = await readFile(new URL('index.html', root), 'utf8');

const oneLevelNavigationPages = [
  'applications/index.html',
  'classification-anomaly/index.html',
  'cog-cast/index.html',
  'context-cast/index.html',
  'forecasting/index.html',
  'hydrological-forecasting/index.html',
  'open-source/index.html',
  'papers/index.html',
  'power-forecasting/index.html',
  'scientific-time-series/index.html',
  'star-cast/index.html',
  'systems/index.html',
];

test('time series data detail page exists with canonical metadata', async () => {
  await access(detailUrl);
  assert.ok(
    detail.includes('<title>时间序列数据与样本 | USTC-AGI Time Series</title>'),
  );
  assert.ok(
    detail.includes(
      '<link rel="canonical" href="https://ustc-time-series.github.io/time-series-data/" />',
    ),
  );
  assert.ok(
    detail.includes(
      '<meta property="og:url" content="https://ustc-time-series.github.io/time-series-data/" />',
    ),
  );
});

test('page defines time series as measured system evolution rather than symbol continuation', () => {
  assert.ok(detail.includes('动态系统随时间演化后形成的测量记录'));
  assert.ok(detail.includes('不是按顺序排列的一串数'));
  assert.ok(detail.includes('时间序列不是文本的数字版'));
  assert.ok(detail.includes('记录的是谁、何时、以什么尺度、在什么条件下发生了什么'));
});

test('page gives readers a three-level map from system to record to sample', () => {
  const section = detail.match(
    /<section class="section-card" id="core-view">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';
  const map = section.match(/<div class="reading-map"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';

  assert.ok(map.includes('真实系统'));
  assert.ok(map.includes('单条记录'));
  assert.ok(map.includes('预测样本'));
  assert.equal(map.match(/<article class="reading-step">/g)?.length, 3);
  assert.equal(map.match(/class="reading-arrow"/g)?.length, 2);
  assert.ok(map.indexOf('真实系统') < map.indexOf('单条记录'));
  assert.ok(map.indexOf('单条记录') < map.indexOf('预测样本'));
});

test('page presents representative time series as observable traces of complex systems', () => {
  const section = detail.match(
    /<section class="section-card" id="system-observation">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  assert.ok(section.includes('<h2>时间序列是复杂系统留下的动态轨迹</h2>'));
  for (const [system, observation] of [
    ['电力系统', '负荷曲线'],
    ['水文系统', '径流与水位'],
    ['气象系统', '温度、降雨与风速'],
    ['新能源系统', '光伏与风电功率'],
    ['交通系统', '交通流量'],
    ['工业系统', '设备传感器信号'],
    ['金融系统', '价格、交易量与需求变化'],
  ]) {
    assert.ok(section.includes(`<strong>${system}</strong>`), `Missing system: ${system}`);
    assert.ok(section.includes(observation), `Missing observation: ${observation}`);
  }
  assert.equal(section.match(/<article class="system-trace">/g)?.length, 7);
  assert.ok(section.includes('可观测投影'));
});

test('page separates latent state evolution from the observation channel', () => {
  const section = detail.match(
    /<section class="section-card" id="system-observation">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  assert.ok(
    section.includes(
      'S<sub>t+1</sub> = F(S<sub>t</sub>, C<sub>t</sub>, A<sub>t</sub>, ε<sub>t</sub>)',
    ),
  );
  assert.ok(section.includes('X<sub>t</sub> = G(S<sub>t</sub>) + η<sub>t</sub>'));
  for (const meaning of [
    '复杂系统内部的潜在状态',
    '天气、政策、环境与事件等外部情境',
    '系统运行者或决策者采取的行动',
    '实际能够观测到的时间序列',
    '系统真实但通常未知的演化机制',
    '从系统状态到观测数据的映射',
  ]) {
    assert.ok(section.includes(meaning), `Missing state-space meaning: ${meaning}`);
  }
  assert.equal(section.match(/<li class="notation-item">/g)?.length, 6);
});

test('page concludes that observations are a dynamic interface rather than the system itself', () => {
  assert.ok(detail.includes('我们看到的 X<sub>t</sub> 并不是系统本身'));
  assert.ok(detail.includes('而是系统的一个动态接口'));
  assert.ok(
    detail.includes('时间序列是连接人工智能模型与真实复杂系统的动态观测通道'),
  );
  assert.ok(detail.includes('状态、结构、机制、变化与未来'));
});

test('page explains the six parts of an individual time series record', () => {
  const section = detail.match(
    /<section class="section-card" id="record-anatomy">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  for (const part of [
    '观测对象',
    '数值、类型与单位',
    '时间坐标',
    '采样规则',
    '关联变量与情境',
    '数据质量与状态',
  ]) {
    assert.ok(section.includes(`<h3>${part}</h3>`), `Missing record part: ${part}`);
  }
  assert.equal(section.match(/<article class="record-part">/g)?.length, 6);
});

test('page makes a forecasting sample boundary and its seven parts explicit', () => {
  const section = detail.match(
    /<section class="section-card" id="sample-anatomy">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  for (const part of [
    '预测对象',
    '预测时点',
    '历史窗口',
    '未来范围',
    '当时可用的信息',
    '未来真实结果',
    '样本身份',
  ]) {
    assert.ok(section.includes(part), `Missing sample part: ${part}`);
  }
  assert.equal(section.match(/<li class="sample-part">/g)?.length, 7);
  assert.ok(section.includes('输入边界'));
  assert.ok(section.includes('答案边界'));
});

test('page distinguishes occurrence, availability, and forecast clocks to prevent leakage', () => {
  const section = detail.match(
    /<section class="section-card" id="information-boundary">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  for (const clock of ['发生时间', '可获得时间', '预测时点']) {
    assert.ok(section.includes(`<h3>${clock}</h3>`), `Missing clock: ${clock}`);
  }
  assert.ok(section.includes('预测时点之后才获得'));
  assert.ok(section.includes('不能作为这个样本的输入'));
});

test('page shows how one long series becomes multiple rolling samples', () => {
  const section = detail.match(
    /<section class="section-card" id="windowing">([\s\S]*?)<\/section>/,
  )?.[1] ?? '';

  assert.equal(section.match(/<article class="sample-window">/g)?.length, 3);
  assert.ok(section.includes('样本 A'));
  assert.ok(section.includes('样本 B'));
  assert.ok(section.includes('样本 C'));
  assert.ok(section.includes('相邻窗口高度重叠'));
});

test('page states sample splitting and representativeness principles without model discussion', () => {
  for (const principle of [
    '按时间顺序划分训练、验证与测试阶段',
    '按独立实体分组',
    '保留缺失、异常与极端时期的标记',
    '普通时期与稀有时期的代表性',
  ]) {
    assert.ok(detail.includes(principle), `Missing sample principle: ${principle}`);
  }

  for (const outOfScopeTerm of [
    'Transformer',
    'LLM',
    '大模型',
    '技术路线',
    '模型架构',
    '工具调用',
  ]) {
    assert.ok(!detail.includes(outOfScopeTerm), `Page should not discuss ${outOfScopeTerm}`);
  }
});

test('research dropdowns expose the data and samples page with correct relative paths', async () => {
  assert.ok(
    homepage.includes(
      '<a href="time-series-data/" role="menuitem">时间序列数据与样本</a>',
    ),
  );

  for (const path of oneLevelNavigationPages) {
    const page = await readFile(new URL(path, root), 'utf8');
    assert.ok(
      page.includes(
        '<a href="../time-series-data/" role="menuitem">时间序列数据与样本</a>',
      ),
      `Missing time-series data dropdown entry in ${path}`,
    );
  }

  const nestedPage = await readFile(
    new URL('forecasting/load-forecasting/index.html', root),
    'utf8',
  );
  assert.ok(
    nestedPage.includes(
      '<a href="../../time-series-data/" role="menuitem">时间序列数据与样本</a>',
    ),
  );
});

test('long page exposes an accessible section navigator for its reading path', () => {
  const nav = detail.match(
    /<nav class="section-nav" aria-label="页面章节导航">([\s\S]*?)<\/nav>/,
  )?.[1] ?? '';
  const anchors = [
    ['#core-view', '核心判断'],
    ['#system-observation', '系统与观测'],
    ['#record-anatomy', '记录构成'],
    ['#sample-anatomy', '样本构成'],
    ['#information-boundary', '信息边界'],
    ['#windowing', '滚动样本'],
    ['#sample-organization', '样本质量'],
  ];

  let previousIndex = -1;
  for (const [href, label] of anchors) {
    const link = `<a href="${href}">${label}</a>`;
    const index = nav.indexOf(link);
    assert.ok(index >= 0, `Missing section link: ${label}`);
    assert.ok(index > previousIndex, `Section link is out of order: ${label}`);
    previousIndex = index;
  }
  assert.ok(detail.indexOf('<nav class="section-nav"') < detail.indexOf('<main id="main-content">'));
  assert.match(detail, /\.section-nav\s*\{[^}]*position:\s*sticky;[^}]*top:\s*64px;/);
  assert.match(detail, /@media \(max-width: 960px\)[\s\S]*?\.section-nav\s*\{\s*position:\s*static;/);
  assert.match(detail, /@media \(max-width: 720px\)[\s\S]*?\.section-nav a\s*\{[^}]*min-height:\s*44px;/);
});

test('page uses semantic hero content and provides a keyboard skip link', () => {
  assert.ok(detail.includes('<a class="skip-link" href="#main-content">跳到主要内容</a>'));
  assert.ok(detail.includes('<header id="hero-header">'));
  assert.ok(detail.includes('<main id="main-content">'));
  assert.ok(!detail.includes('aria-label="刷新当前页面"'));
  assert.ok(!detail.includes('window.location.reload()'));
  assert.ok(!detail.includes("document.querySelector('#hero-header')"));
  assert.match(detail, /\.skip-link\s*\{[^}]*position:\s*fixed;/);
  assert.match(detail, /\.skip-link:focus\s*\{[^}]*transform:\s*translateY\(0\);/);
});

test('detail page uses the shared research shell and marks its navigation item current', () => {
  assert.ok(detail.includes('<meta name="theme-color" content="#f4f7f9" />'));
  assert.ok(detail.includes('--accent: #091f44;'));
  assert.ok(detail.includes('--text-strong: #091f44;'));
  assert.ok(detail.includes('--text: #17324d;'));
  assert.ok(detail.includes('--line: #d5e3eb;'));
  assert.ok(detail.includes('--bg: #f4f7f9;'));
  assert.ok(detail.includes('<link rel="stylesheet" href="../asset/site-responsive.css" />'));
  assert.ok(
    detail.includes(
      'class="nav-active" href="../time-series-data/" role="menuitem" aria-current="page"',
    ),
  );
  assert.ok(detail.includes('@media (max-width: 960px)'));
  assert.ok(detail.includes('@media (max-width: 720px)'));
});

test('inline scripts remain syntactically valid', () => {
  for (const [, script] of detail.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new Function(script));
  }
});
