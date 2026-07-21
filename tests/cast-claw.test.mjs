import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const page = await readFile(new URL('cast-claw/index.html', root), 'utf8');

test('CastClaw citation lists Enhong Chen as the final co-author', () => {
  const citation = page.match(/@article\{tao2026castclaw,[\s\S]*?\n\}/)?.[0] ?? '';

  assert.ok(citation.includes('and Wang, Shijin and Chen, Enhong}'));
});

test('CastClaw related-project section omits the redundant footer links', () => {
  const related = page.match(/<section id="related"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.ok(related, 'Missing related-project section');
  assert.ok(!related.includes('>更多论文</a>'));
  assert.ok(!related.includes('← 返回主页'));
});

test('CastClaw paper cards show the accepted conference venues', () => {
  assert.ok(
    page.includes('<span class="paper-meta">ICML 2026 · Experience &amp; Memory</span>'),
  );
  assert.ok(
    page.includes('<span class="paper-meta">WSDM 2026 · Reasoning Over Time</span>'),
  );
});

test('CastClaw related-project introduction keeps only the research-line positioning', () => {
  const related = page.match(/<section id="related"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';
  const introduction = related.match(/<p>\s*([\s\S]*?)\s*<\/p>/)?.[1] ?? '';

  assert.ok(introduction.includes('CastClaw 所在的研究线并不局限于单一项目'));
  assert.ok(!introduction.includes('下面列出几篇与 CastClaw 关系最紧密的工作'));
  assert.ok(!introduction.includes('mingyue-cheng.github.io'));
});

test('CastZoo card names time-series small-model orchestration and integration', () => {
  assert.ok(
    page.includes(
      '<h4 class="toolbox-card-title">CastZoo Plugin: 时序小模型编排与集成</h4>',
    ),
  );
  assert.ok(!page.includes('CastZoo Plugin: 模型编排与调用'));
});
