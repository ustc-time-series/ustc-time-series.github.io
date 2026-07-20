import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const detailUrl = new URL('scientific-time-series/index.html', root);
const detail = await readFile(detailUrl, 'utf8').catch(() => '');
const homepage = await readFile(new URL('index.html', root), 'utf8');

const siblingNavigationPages = [
  'forecasting/index.html',
  'classification-anomaly/index.html',
  'applications/index.html',
  'open-source/index.html',
  'papers/index.html',
  'star-cast/index.html',
  'systems/index.html',
];

test('scientific time series detail page exists and exposes the four-part research story', async () => {
  await access(detailUrl);
  for (const heading of [
    '科学时序数据的特点',
    '核心科学问题',
    '技术路线',
    '应用领域',
  ]) {
    assert.ok(detail.includes(heading), `Missing section: ${heading}`);
  }
  assert.ok(detail.includes('Scientific Time Series Modeling'));
  assert.ok(detail.includes('科学观测'));
  assert.ok(detail.includes('科学发现与决策'));
});

test('detail page states the scientific foundation-model transfer goal without claiming release', () => {
  assert.ok(detail.includes('跨系统、跨尺度表征与适配能力'));
  assert.ok(detail.includes('研究规划 · Benchmark Framework'));
  assert.ok(detail.includes('尚未冻结'));
});

test('detail page presents the three-dimensional benchmark framework', () => {
  for (const axis of ['科学系统维度', '物理描述尺度维度', '适配预算维度']) {
    assert.ok(detail.includes(axis), `Missing benchmark axis: ${axis}`);
  }
  for (const scale of [
    'L0 电子/量子',
    'L1 原子/分子',
    'L2 介观/动理学',
    'L3 连续介质/场',
    'L4 系统/工程动力学',
  ]) {
    assert.ok(detail.includes(scale), `Missing physical scale: ${scale}`);
  }
  assert.ok(detail.includes('真实观测与实验主赛道'));
  assert.ok(detail.includes('计算模拟辅助赛道'));
});

test('detail page covers four systems and eight complementary task packages', () => {
  for (const taskPackage of [
    '受控等离子体与核聚变',
    '时域天文观测',
    '大气—环境耦合',
    '水文与水循环',
    '地震与固体地球事件',
    '生理—神经调节',
    '化学反应与分子动力',
    '材料演化与服役退化',
  ]) {
    assert.ok(detail.includes(taskPackage), `Missing task package: ${taskPackage}`);
  }
});

test('detail page exposes seven task families and the entity-counted transfer curve', () => {
  for (const taskFamily of [
    '动力学预测',
    '状态重建与逆问题',
    '事件与变化检测',
    '缺失与传感器鲁棒性',
    '退化与剩余寿命',
    '表征学习与跨领域适配',
    '跨尺度桥接与闭合学习',
  ]) {
    assert.ok(detail.includes(taskFamily), `Missing task family: ${taskFamily}`);
  }
  for (const budget of ['零样本', '1%', '5%', '10%', '全量微调']) {
    assert.ok(detail.includes(budget), `Missing adaptation budget: ${budget}`);
  }
  assert.ok(detail.includes('独立科学实体'));
  assert.ok(detail.includes('负迁移'));
  assert.ok(detail.includes('物理一致性'));
});

test('homepage links the scientific time series research card and dropdown', () => {
  assert.ok(homepage.includes('<h3>科学时序数据建模</h3>'));
  assert.ok(homepage.includes('href="scientific-time-series/"'));
});

test('homepage card reflects the cross-system and cross-scale research direction', () => {
  const cardStart = homepage.indexOf('id="track-scientific-time-series"');
  const card = cardStart >= 0 ? homepage.slice(cardStart, cardStart + 2600) : '';

  assert.ok(card.includes('科学时序基础模型'));
  assert.ok(card.includes('跨系统'));
  assert.ok(card.includes('跨尺度'));
});

test('homepage mobile research dropdown is not clipped by the navigation row', () => {
  const mobileNavRule = homepage.match(
    /@media \(max-width: 640px\) \{[\s\S]*?\.nav-links \{([\s\S]*?)\n      \}/,
  )?.[1] ?? '';

  assert.ok(mobileNavRule.includes('flex-wrap: wrap;'));
  assert.ok(mobileNavRule.includes('overflow-x: visible;'));
  assert.ok(!mobileNavRule.includes('overflow-x: auto;'));
});

test('all one-level pages expose the scientific time series dropdown entry', async () => {
  for (const path of siblingNavigationPages) {
    const page = await readFile(new URL(path, root), 'utf8');
    assert.ok(
      page.includes('href="../scientific-time-series/" role="menuitem">科学时序数据建模</a>'),
      `Missing dropdown entry in ${path}`,
    );
  }
});

test('the nested load forecasting page uses a valid two-level path', async () => {
  const page = await readFile(new URL('forecasting/load-forecasting/index.html', root), 'utf8');
  assert.ok(page.includes('href="../../scientific-time-series/" role="menuitem">科学时序数据建模</a>'));
});

test('detail page marks the new research menu item as current and supports narrow screens', () => {
  assert.ok(detail.includes('href="../scientific-time-series/" role="menuitem" aria-current="page"'));
  assert.ok(detail.includes('@media (max-width: 720px)'));
  assert.ok(detail.includes('grid-template-columns: 1fr;'));
});
