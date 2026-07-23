import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../NeoResearch/index.html', import.meta.url), 'utf8');
const framework = await readFile(new URL('../NeoResearch/assets/framework.svg', import.meta.url), 'utf8');

test('NeoResearch presents three evidence sources for autonomous research', () => {
  for (const evidence of ['Literature Evidence', 'Data Evidence', 'Experimental Evidence']) {
    assert.ok(page.includes(evidence), `Missing evidence source: ${evidence}`);
  }
  assert.ok(framework.includes('Evidence &amp; Cognition Layer'));
  assert.ok(framework.includes('Memory &amp; Evolution Layer'));
});

test('NeoResearch positions time-series forecasting as the first validation scenario', () => {
  assert.ok(page.includes('Autonomous Data Science Research Agent'));
  assert.ok(page.includes('被选为首个验证场景，而不是 NeoResearch 的能力边界'));
  assert.ok(page.includes('时序预测验证：CandidateRecipe 配方搜索'));
  for (const stalePositioning of [
    'Forecast Research Operating System',
    '不是“会聊天的时序助手”',
    '不做开放式文献综述 Agent',
  ]) {
    assert.ok(!page.includes(stalePositioning), `Stale positioning remains: ${stalePositioning}`);
  }
});

test('NeoResearch renders responsive outer and inner research loops', () => {
  assert.ok(
    page.includes('.outer-research-loop {\n      display: grid;\n      grid-template-columns: repeat(2, minmax(0, 1fr));'),
    'The seven-stage outer loop should use a readable two-column desktop layout',
  );
  assert.ok(
    page.includes('.pipeline.inner-experiment-cycle { grid-template-columns: repeat(5, 1fr); }'),
    'The rapid experiment loop should show five desktop columns',
  );
  assert.ok(
    page.includes('.outer-research-loop { grid-template-columns: 1fr; }'),
    'The outer loop should collapse to one column on narrow screens',
  );
  assert.ok(
    page.includes('.pipeline.inner-experiment-cycle { grid-template-columns: 1fr; }'),
    'The inner loop should collapse to one ordered column on narrow screens',
  );
  assert.ok(page.includes('content: "↓";'), 'The mobile inner loop should retain a visible sequence cue');
});

test('NeoResearch exposes the ordered seven-stage outer loop and five-step inner loop', () => {
  const outerLoop = page.match(/<ol class="outer-research-loop"[\s\S]*?<\/ol>/)?.[0] ?? '';
  assert.equal(outerLoop.match(/<li class="research-stage">/g)?.length, 7);
  assert.deepEqual(
    [...outerLoop.matchAll(/<strong>([^<]+)<\/strong>/g)].map(([, stage]) => stage),
    [
      '0. 人机交互与意图对齐',
      '1/A. 研究问题理解',
      '2/B. 文献调研与研究态势建模',
      '3/C. 数据认知与任务画像',
      '4/D. 假设生成',
      '6/F. 自主实验与评估',
      '7/G. 诊断、反思与模型演化',
    ],
  );
  const innerLoop = page.match(/<ol class="pipeline inner-experiment-cycle"[\s\S]*?<\/ol>/)?.[0] ?? '';
  assert.equal(innerLoop.match(/<li class="pipeline-step">/g)?.length, 5);
  assert.deepEqual(
    [...innerLoop.matchAll(/<strong>([^<]+)<\/strong>/g)].map(([, stage]) => stage),
    ['模型设计', '代码实现', '训练执行', '评估', '修正'],
  );
});

test('NeoResearch embeds the supplied AI-for-AI workflow as an expandable overview', async () => {
  const workflowImage = await readFile(
    new URL('../NeoResearch/assets/neoresearch-ai-for-ai-workflow.png', import.meta.url),
  );
  assert.deepEqual([...workflowImage.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(workflowImage.readUInt32BE(16), 1672);
  assert.equal(workflowImage.readUInt32BE(20), 941);
  assert.ok(
    page.includes('src="assets/neoresearch-ai-for-ai-workflow.png?v=20260722-loop-v1"'),
    'The page should use a cache-busted copy of the supplied workflow image',
  );
  assert.ok(page.includes('alt="NeoResearch 面向 AI for AI 的双层自主数据科学研究闭环"'));
  assert.ok(page.includes('width="1672" height="941"'));
  assert.ok(page.includes('class="workflow-diagram-link"'));
});

test('NeoResearch names the six research infrastructure capabilities and four outputs', () => {
  for (const capability of [
    '科学文献语料库',
    '数据集与特征工具',
    '模型与代码库',
    '训练与评测环境',
    '研究记忆',
    '计算资源',
  ]) {
    assert.ok(page.includes(capability), `Missing infrastructure capability: ${capability}`);
  }
  for (const output of ['更优模型', '新算法', '可靠发现', '可复用研究经验']) {
    assert.ok(page.includes(output), `Missing research output: ${output}`);
  }
  for (const staleLoop of ['五步最小研究闭环', '三类证据进入同一认知层，五步研究循环']) {
    assert.ok(!page.includes(staleLoop), `Stale loop positioning remains: ${staleLoop}`);
  }
});

test('NeoResearch distinguishes the double-loop lifecycle from the five-action engineering view', () => {
  assert.match(
    page,
    /<meta name="description" content="[^"]*双层自主研究闭环[^"]*"/,
  );
  assert.ok(page.includes('src="assets/framework.svg?v=20260723-blue-v1"'));
  assert.ok(framework.includes('Evidence-Grounded Action Cycle'));
  assert.ok(framework.includes('Five auditable research actions'));
  assert.ok(!framework.includes('five-stage autonomous data-science research loop'));
});

test('NeoResearch architecture keeps layer titles separate from their detail column', () => {
  assert.equal(
    framework.match(/x="440" y="\d+" font-size="15" fill="#4c6176"/g)?.length,
    7,
    'All seven layer descriptions should use the dedicated detail column and compact type size',
  );
  assert.ok(!framework.includes('x="392"'), 'The legacy detail-column position causes long labels to collide');
});

test('NeoResearch uses readable secondary text colors in the hero and footer', () => {
  assert.ok(page.includes('color: var(--text-faint);\n      letter-spacing: 0.02em;'));
  assert.match(page, /\.footer-note\s*\{[^}]*color:\s*var\(--footer-faint\);/);
  assert.ok(page.includes('<p class="footer-note">'));
});

test('NeoResearch hero omits the redundant shortcut button group', () => {
  assert.ok(!page.includes('<div class="btn-row">'));
  assert.ok(!page.includes('.btn-row {'));
  assert.ok(!page.includes('.btn-secondary'));
  assert.ok(page.includes('<nav class="nav-bar">'), 'The primary navigation must remain available');
});

test('NeoResearch follows the USTC AGI blue-gray visual system', () => {
  for (const token of [
    '--accent: #0b5fc6;',
    '--accent-dark: #083f7f;',
    '--accent-soft: #edf7fc;',
    '--text-strong: #061f45;',
    '--text: #17324d;',
    '--text-muted: #4c6176;',
    '--text-faint: #5b7187;',
    '--line: #d5e3eb;',
    '--line-soft: #e6f0f5;',
    '--bg: #f4f7f9;',
    '--surface-soft: #f8fbfd;',
    '--footer-text: #a9c7db;',
    '--footer-faint: #8eb4cc;',
    '--footer-link: #8fd9ff;',
  ]) {
    assert.ok(page.includes(token), `Missing design token: ${token}`);
  }

  for (const staleColor of [
    '#c0392b',
    '#a93226',
    '#fff8f7',
    '#fdf9f9',
    '#e87b6e',
    'background: #1c1c1c',
  ]) {
    assert.ok(!page.includes(staleColor), `Warm legacy theme color remains: ${staleColor}`);
  }

  for (const staleDiagramColor of ['#c0392b', '#b9770e', '#e67e22', '#6c4aa1']) {
    assert.ok(!framework.includes(staleDiagramColor), `Legacy diagram color remains: ${staleDiagramColor}`);
  }
  assert.ok(framework.includes('#0b5fc6'), 'The framework diagram should share the page accent');
  assert.ok(framework.includes('#061f45'), 'The framework diagram should share the page title color');
});
