import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../cast-mind/index.html', import.meta.url), 'utf8');
const section = page.match(
  /<section id="forecast-evolution"[\s\S]*?<\/section>/,
)?.[0] ?? '';

test('CastMind ends with a three-stage evolution module before the footer', () => {
  const evaluationIndex = page.indexOf('<section id="eval">');
  const evolutionIndex = page.indexOf('<section id="forecast-evolution"');
  const footerIndex = page.indexOf('<footer>');

  assert.ok(evaluationIndex >= 0, 'Missing evaluation section');
  assert.ok(evolutionIndex > evaluationIndex, 'Evolution module should follow evaluation');
  assert.ok(footerIndex > evolutionIndex, 'Evolution module should precede the footer');
  assert.doesNotMatch(page, /<section class="closing-section"/);
  assert.doesNotMatch(page, /CastMind 借鉴大模型慢思考推理范式/);
  assert.match(section, /<h2 class="section-title">从时间序列预测到时序预测推演<\/h2>/);
  assert.equal(section.match(/<article class="evolution-card"/g)?.length, 3);
});

test('the evolution module distinguishes fitting, context, and reasoning stages', () => {
  for (const stage of [
    '数据拟合智能',
    '情境理解智能',
    '认知推演智能',
  ]) {
    assert.ok(section.includes(stage), `Missing evolution stage: ${stage}`);
  }

  for (const question of [
    'What will happen?',
    'What will happen under this context?',
    'Why? What if? What should we do?',
  ]) {
    assert.ok(section.includes(question), `Missing capability question: ${question}`);
  }
});

test('the evolution module presents the unified CastMind reasoning path', () => {
  assert.ok(
    section.includes(
      '历史序列预测 → 情境条件预测 → 机制推理与多情景推演 → 不确定性评估 → 决策辅助',
    ),
  );
  assert.ok(section.includes('CastMind 以数值预测为基础锚点'));
  assert.match(page, /\.evolution-grid\s*\{/);
  assert.match(page, /@media \(max-width: 860px\)[\s\S]*?\.evolution-grid\s*\{/);
});

test('the evolution module ends with an electricity-load forecasting example', () => {
  assert.match(section, /<aside class="evolution-example"/);
  assert.match(section, /示例：电力负荷预测如何走向时序预测推演/);
  assert.equal(section.match(/<div class="example-step"/g)?.length, 3);

  for (const detail of [
    '历史负荷曲线',
    '气温、工作日、节假日和大型活动',
    '需求响应与储能调度',
    '方法示意',
  ]) {
    assert.ok(section.includes(detail), `Missing load example detail: ${detail}`);
  }
});

test('the electricity-load example includes explanatory visual cues', () => {
  assert.match(section, /<div class="example-load-visual"/);
  assert.equal(section.match(/<span class="load-bar/g)?.length, 24);
  assert.equal(section.match(/<span class="example-step-icon"/g)?.length, 3);

  for (const cue of ['持续高温', '工作日', '大型活动', '晚高峰关注']) {
    assert.ok(section.includes(cue), `Missing visual cue: ${cue}`);
  }

  assert.match(page, /\.example-step:not\(:last-child\)::after/);
  assert.doesNotMatch(section, /<svg/);
});

test('the evaluation overview uses Chinese justified typography', () => {
  assert.match(page, /<p class="section-lead eval-intro">/);
  assert.match(
    page,
    /\.eval-intro\s*\{[^}]*text-align:\s*justify;[^}]*text-justify:\s*inter-ideograph;[^}]*text-align-last:\s*left;/,
  );
});

test('the time-series reasoning input appears before the technical pathway', () => {
  const introIndex = page.indexOf('<section id="intro"');
  const techIndex = page.indexOf('<section id="tech"');
  const featuresIndex = page.indexOf('<section id="features"');
  const trainingIndex = page.indexOf('<section id="training"');

  assert.ok(introIndex < techIndex, 'The input section should follow the introduction');
  assert.ok(techIndex < featuresIndex, 'The input section should precede the technical pathway');
  assert.ok(featuresIndex < trainingIndex, 'The technical pathway should precede training');
  assert.match(
    page,
    /<a href="#intro">简介<\/a>[\s\S]*?<a href="#tech">核心技术<\/a>[\s\S]*?<a href="#features">关键技术路径<\/a>/,
  );
});

test('every project-introduction stage explains its task and concrete output', () => {
  const intro = page.match(/<section id="intro"[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.equal(intro.match(/<div class="intro-step-outcome">/g)?.length, 5);
  for (const detail of [
    '区分稳定结构、短期扰动与异常噪声',
    '判断不同条件对基础趋势的增强、削弱、偏移或反转作用',
    '形成条件化的多情景未来状态空间',
    '识别风险来源、敏感因素和模型适用边界',
    '比较不同干预方案的影响与代价',
  ]) {
    assert.ok(intro.includes(detail), `Missing introduction-stage detail: ${detail}`);
  }
});

test('the CastMind navigation omits the CastBench leaderboard button', () => {
  const nav = page.match(/<nav class="nav-bar">[\s\S]*?<\/nav>/)?.[0] ?? '';

  assert.ok(nav, 'Missing CastMind navigation');
  assert.ok(!nav.includes('CastBench 排行榜'));
  assert.ok(!nav.includes('../cast-bench/'));
});

test('the technical pathway contains only Backbone, SFT, and RLVR', () => {
  const features = page.match(/<section id="features"[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.equal(features.match(/<article class="path-card">/g)?.length, 3);
  assert.doesNotMatch(features, /数据质量评估与调度优化/);
  assert.doesNotMatch(features, /Q<sub>i<\/sub>/);
});
