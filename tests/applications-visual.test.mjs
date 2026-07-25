import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(
  new URL('../applications/index.html', import.meta.url),
  'utf8',
);

const focusSection = page.match(
  /<section class="section-card focus-section">([\s\S]*?)<\/section>\s*<\/div>\s*<\/div>\s*<\/main>/,
)?.[1] ?? '';

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
