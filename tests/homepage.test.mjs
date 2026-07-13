import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('homepage labels the context-aware forecasting research track', () => {
  assert.ok(
    page.includes('<h2>情境感知的时间序列分析（Context-aware Time Series Forecasting）</h2>'),
    'Context-aware research heading should include its English label',
  );
});
