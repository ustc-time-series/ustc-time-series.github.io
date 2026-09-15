import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const page = await readFile(new URL('forecasting/index.html', root), 'utf8');

test('defines forecasting as prediction intelligence for dynamic systems', () => {
  assert.ok(page.includes('面向动态复杂系统的未来认知'));
  assert.ok(page.includes('不是“普通回归加上一条时间轴”'));
  assert.ok(page.includes('Prediction Intelligence · 预测智能'));

  for (const concept of ['状态认知', '未来推断', '决策支持']) {
    assert.ok(page.includes(concept), `Missing core forecasting problem: ${concept}`);
  }
  assert.equal(page.match(/class="question-card"/g)?.length, 3);
});

test('organizes the argument with a complete section navigation', () => {
  for (const target of [
    'essence',
    'value',
    'features',
    'challenges',
    'capability-chain',
    'paradigm-shifts',
    'research-map',
  ]) {
    assert.ok(page.includes(`href="#${target}"`), `Missing section link: ${target}`);
    assert.match(page, new RegExp(`<section[^>]+id="${target}"`));
  }
});

test('presents five kinds of forecasting value', () => {
  const valueSection = page.match(
    /<section[^>]+id="value"[\s\S]*?<\/section>/,
  )?.[0] ?? '';

  assert.equal(valueSection.match(/class="value-item"/g)?.length, 5);
  for (const value of ['资源配置', '风险预警', '动态控制', '系统韧性', '科学认知']) {
    assert.ok(valueSection.includes(value), `Missing forecasting value: ${value}`);
  }
  assert.ok(valueSection.includes('预测提前量'));
  assert.ok(valueSection.includes('行动准备时间'));
});

test('summarizes six distinctive properties and six scientific challenges', () => {
  const featureSection = page.match(
    /<section[^>]+id="features"[\s\S]*?<\/section>/,
  )?.[0] ?? '';
  const challengeSection = page.match(
    /<section[^>]+id="challenges"[\s\S]*?<\/section>/,
  )?.[0] ?? '';

  assert.equal(featureSection.match(/class="feature-card"/g)?.length, 6);
  for (const heading of [
    '目标尚未发生',
    '部分观测',
    '历史规律会失效',
    '未来是一条联合轨迹',
    '情境部分已知',
    '不确定性属于答案',
  ]) {
    assert.ok(featureSection.includes(heading), `Missing distinctive property: ${heading}`);
  }

  assert.equal(challengeSection.match(/class="challenge-card"/g)?.length, 6);
  for (const heading of [
    '可预测性边界',
    '状态与机制重建',
    '时序结构认知',
    '非平稳与长尾',
    '联合一致性',
    '可信评测与决策价值',
  ]) {
    assert.ok(challengeSection.includes(heading), `Missing scientific challenge: ${heading}`);
  }
});

test('publishes the nine-stage prediction-intelligence loop', () => {
  const chain = page.match(
    /<section[^>]+id="capability-chain"[\s\S]*?<\/section>/,
  )?.[0] ?? '';

  assert.equal(chain.match(/class="chain-step"/g)?.length, 9);
  for (const stage of [
    '任务与决策定义',
    '数据感知',
    '快速预测',
    '可预测性诊断',
    '情境与工具',
    '机制推理',
    '场景生成',
    '校准与拒答',
    '决策与反馈',
  ]) {
    assert.ok(chain.includes(stage), `Missing capability stage: ${stage}`);
  }
  for (const route of ['Fast Path', 'Slow Path', 'Decision Loop']) {
    assert.ok(chain.includes(route), `Missing capability route: ${route}`);
  }
});

test('shows the six paradigm shifts from forecasting models to prediction intelligence', () => {
  const shiftSection = page.match(
    /<section[^>]+id="paradigm-shifts"[\s\S]*?<\/section>/,
  )?.[0] ?? '';

  assert.equal(shiftSection.match(/class="shift-card"/g)?.length, 6);
  for (const destination of [
    '认识可预测性',
    '状态—机制—情境认知',
    '概率、场景和风险',
    '多阶段自主交互',
    '系统级预测智能',
    '最终决策价值',
  ]) {
    assert.ok(shiftSection.includes(destination), `Missing paradigm destination: ${destination}`);
  }
});

test('keeps representative work and completes the application routes', () => {
  for (const work of [
    'ConvTimeNet',
    'TimeMAE',
    'TokenCast',
    'TimeReasoner',
    'AlphaCast',
  ]) {
    assert.ok(page.includes(work), `Missing representative work: ${work}`);
  }

  const applicationSection = page.match(
    /<section[^>]+id="applications"[\s\S]*?<\/section>/,
  )?.[0] ?? '';
  for (const route of [
    './load-forecasting/',
    '../power-forecasting/',
    '../hydrological-forecasting/',
  ]) {
    assert.ok(applicationSection.includes(`href="${route}"`), `Missing application route: ${route}`);
  }
  assert.equal(applicationSection.match(/class="application-card"/g)?.length, 3);
});

test('retains the shared responsive shell and valid inline scripts', () => {
  assert.ok(page.includes('<meta name="theme-color" content="#f4f7f9" />'));
  assert.ok(page.includes('--accent: #091f44;'));
  assert.ok(page.includes('<link rel="stylesheet" href="../asset/site-responsive.css" />'));
  assert.ok(page.includes('@media (max-width: 960px)'));
  assert.ok(page.includes('@media (max-width: 720px)'));
  assert.ok(page.includes('@media (max-width: 480px)'));
  assert.match(
    page,
    /@media \(max-width: 720px\)[\s\S]*?\.section-nav\s*\{\s*position:\s*static;/,
    'The secondary section navigation should stop sticking when the shared mobile nav wraps',
  );
  assert.match(
    page,
    /@media \(max-width: 720px\)[\s\S]*?section\[id\]\s*\{\s*scroll-margin-top:\s*164px;/,
    'Mobile anchors should clear the wrapped primary navigation',
  );
  assert.match(
    page,
    /@media \(max-width: 720px\)[\s\S]*?\.nav-dropdown-menu\s*\{\s*position:\s*absolute;\s*top:\s*calc\(100% \+ 8px\);\s*left:\s*0;\s*right:\s*auto;/,
    'The mobile research menu should stay anchored below its toggle',
  );

  for (const [, script] of page.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new Function(script));
  }
});
