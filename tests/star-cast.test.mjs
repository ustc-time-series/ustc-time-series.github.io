import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../star-cast/index.html', import.meta.url), 'utf8');
const includes = (snippet) => assert.ok(page.includes(snippet), `Missing: ${snippet}`);
const hero = page.match(/<header id="hero-header">[\s\S]*?<\/header>/)?.[0] ?? '';

test('StarCast keeps the ecosystem flow without a hero action module', () => {
  assert.ok(!page.includes('class="hero-actions"'), 'Hero action module should not be present');
  includes('id="ecosystem-flow"');
  includes('模型底座');
  includes('训练与评测');
});

test('StarCast cards expose project stage and available evidence links', () => {
  includes('Research Preview');
  includes('https://github.com/Xiaoyu-Tao/Cast-R1-TS');
  includes('https://github.com/ustc-time-series/CastClaw');
  includes('https://github.com/ustc-time-series/CastFactory');
  includes('https://github.com/ustc-time-series/Future-Cast');
});

test('StarCast hero omits the ecosystem update badge', () => {
  assert.ok(!page.includes('StarCast Ecosystem · 最近更新：2026-07'), 'Update badge should not be present');
});

test('StarCast hero introduces 星辰 as the forecasting agent', () => {
  assert.ok(hero.includes('星辰推演未来之势'), 'Hero should describe 星辰 as the forecasting agent');
});

test('StarCast labels its agentic forecasting system', () => {
  includes('<h2 id="systems-title">时间序列推演智能体系统（Agentic TSF）</h2>');
});

test('StarCast omits the auxiliary autonomous research pipeline', () => {
  assert.ok(!page.includes('aria-label="自主研究链路"'), 'Autonomous research pipeline should not be present');
});

test('StarCast omits the auxiliary open-source pipeline', () => {
  assert.ok(!page.includes('aria-label="开源工具链"'), 'Open-source pipeline should not be present');
});

test('StarCast system introductions use Chinese justified text', () => {
  const introTextRule = page.match(/\.intro-copy p \{[^}]*\}/)?.[0] ?? '';
  const soloIntroRule = page.match(/\.systems-intro > \.intro-copy:only-child \{[^}]*\}/)?.[0] ?? '';

  assert.ok(introTextRule.includes('text-align: justify;'), 'Introduction text should be justified');
  assert.ok(introTextRule.includes('text-justify: inter-ideograph;'), 'Introduction text should use Chinese justification');
  assert.ok(soloIntroRule.includes('grid-column: 1 / -1;'), 'A standalone introduction should span the full section width');
});

test('StarCast ecosystem description uses Chinese justified text', () => {
  const ecosystemHeadingRule = page.match(/\.ecosystem-heading \{[^}]*\}/)?.[0] ?? '';
  const ecosystemTextRule = page.match(/\.ecosystem-heading p \{[^}]*\}/)?.[0] ?? '';

  assert.ok(ecosystemHeadingRule.includes('max-width: none;'), 'Ecosystem description should span the full map width');
  assert.ok(ecosystemTextRule.includes('text-align: justify;'), 'Ecosystem description should be justified');
  assert.ok(ecosystemTextRule.includes('text-justify: inter-ideograph;'), 'Ecosystem description should use Chinese justification');
});

test('StarCast ecosystem support copy uses Chinese justified text', () => {
  const flowTextRule = page.match(/\.flow-stage span:not\(\.flow-index\) \{[^}]*\}/)?.[0] ?? '';
  const feedbackRule = page.match(/\.ecosystem-feedback \{[^}]*\}/)?.[0] ?? '';

  assert.ok(flowTextRule.includes('text-align: justify;'), 'Flow card copy should be justified');
  assert.ok(flowTextRule.includes('text-justify: inter-ideograph;'), 'Flow card copy should use Chinese justification');
  assert.ok(feedbackRule.includes('text-align: justify;'), 'Ecosystem feedback should be justified');
  assert.ok(feedbackRule.includes('text-justify: inter-ideograph;'), 'Ecosystem feedback should use Chinese justification');
});

test('StarCast supports sharing and exposes an accessible research menu', () => {
  includes('rel="canonical" href="https://ustc-time-series.github.io/star-cast/"');
  includes('property="og:title"');
  includes('name="twitter:card" content="summary"');
  includes('aria-controls="research-menu"');
  includes('id="research-menu" role="menu"');
  includes('role="menuitem"');
});
