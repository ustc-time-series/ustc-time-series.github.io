import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../papers/index.html', import.meta.url), 'utf8');

const alphaCastTitle =
  'AlphaCast: A Human Wisdom-LLM Intelligence Co-Reasoning Framework for Interactive Time Series Forecasting';
const alphaCastAuthors =
  'Xiaohan Zhang, Tian Gao, Mingyue Cheng*, Bokai Pan, Ze Guo, Yaguo Liu, Xiaoyu Tao, Qi Liu,';
const timeR1Title =
  'Time Series Forecasting as Reasoning: A Slow-Thinking Approach with Reinforced LLMs';
const timeR1Authors =
  'Yitong Zhou, Yucong Luo, Mingyue Cheng*, Qi Liu, Jiahao Wang, Daoyu Wang, Enhong Chen,';
const coGenCastTitle =
  'CoGenCast: A Coupled Autoregressive-Flow Generative Framework for Time Series Forecasting';
const coGenCastAuthors =
  'Yaguo Liu, Mingyue Cheng*, Daoyu Wang, Xiaoyu Tao, Qi Liu,';
const geoDeciderTitle =
  'GeoDecider: An Evidence-Grounded Agent for Geological Interpretation via Deliberative Reasoning';
const geoDeciderAuthors =
  'Xiaoyu Tao, Mingyue Cheng, Jiahao Wang, Yitong Zhou, Qingyang Mao, Yimin Dou, Qi Liu, Shijin Wang, Enhong Chen,';
const castFsrTitle =
  'CastFSR: A Fast--Slow--Reflect Agentic Reasoning Framework for Context-Aware Time Series Forecasting';
const oneCastTitle =
  'OneCast: Structured Decomposition and Modular Generation for Cross-Domain Time Series Forecasting';
const disenTsTitle =
  'DisenTS: Disentangled Channel Evolving Pattern Modeling for Multivariate Time Series Forecasting';

test('papers page lists AlphaCast with the requested CIKM author order', () => {
  const preprints = page.match(
    /<h3 class="pub-year-heading">📘 Preprint<\/h3>([\s\S]*?)<h3 class="pub-year-heading">📘 Released Survey<\/h3>/,
  )?.[1] ?? '';
  const papers2026 = page.match(
    /<h3 class="pub-year-heading">🐎 Year of the Fire Horse \(Bing Wu Year, 2026\)<\/h3>([\s\S]*?)<h3 class="pub-year-heading">🐍 Year of the Wood Snake \(Yi Si Year, 2025\)<\/h3>/,
  )?.[1] ?? '';
  const entries2026 = papers2026.match(/<li>[\s\S]*?<\/li>/g) ?? [];

  assert.ok(!preprints.includes(alphaCastTitle));
  const alphaCastEntry = entries2026.find((entry) => entry.includes(alphaCastTitle)) ?? '';

  assert.ok(alphaCastEntry, `${alphaCastTitle} should appear in the 2026 publications section`);
  assert.ok(alphaCastEntry.includes('<em>ACM CIKM 2026 Accepted</em>'));
  assert.ok(alphaCastEntry.startsWith(`<li>${alphaCastAuthors} <strong>${alphaCastTitle}</strong>`));
});

test('papers page lists Time-R1 with the requested CIKM metadata', () => {
  const preprints = page.match(
    /<h3 class="pub-year-heading">📘 Preprint<\/h3>([\s\S]*?)<h3 class="pub-year-heading">📘 Released Survey<\/h3>/,
  )?.[1] ?? '';
  const papers2026 = page.match(
    /<h3 class="pub-year-heading">🐎 Year of the Fire Horse \(Bing Wu Year, 2026\)<\/h3>([\s\S]*?)<h3 class="pub-year-heading">🐍 Year of the Wood Snake \(Yi Si Year, 2025\)<\/h3>/,
  )?.[1] ?? '';
  const entries2026 = papers2026.match(/<li>[\s\S]*?<\/li>/g) ?? [];
  const timeR1Entry = entries2026.find((entry) => entry.includes(timeR1Title)) ?? '';

  assert.ok(!preprints.includes(timeR1Title));
  assert.ok(timeR1Entry, `${timeR1Title} should appear in the 2026 publications section`);
  assert.ok(timeR1Entry.includes('<em>ACM CIKM 2026 Accepted</em>'));
  assert.ok(timeR1Entry.startsWith(`<li>${timeR1Authors} <strong>${timeR1Title}</strong>`));
  assert.ok(timeR1Entry.includes('https://www.arxiv.org/pdf/2508.09191'));
  assert.ok(!timeR1Entry.includes('2506.10630'));
});

test('papers page preserves the requested CoGenCast author order', () => {
  const papers2026 = page.match(
    /<h3 class="pub-year-heading">🐎 Year of the Fire Horse \(Bing Wu Year, 2026\)<\/h3>([\s\S]*?)<h3 class="pub-year-heading">🐍 Year of the Wood Snake \(Yi Si Year, 2025\)<\/h3>/,
  )?.[1] ?? '';
  const entries = papers2026.match(/<li>[\s\S]*?<\/li>/g) ?? [];
  const entry = entries.find((candidate) => candidate.includes(coGenCastTitle)) ?? '';

  assert.ok(entry, 'CoGenCast should appear in the 2026 publications section');
  assert.ok(entry.startsWith(`<li>${coGenCastAuthors} <strong>${coGenCastTitle}</strong>`));
  assert.ok(entry.includes('<em>ICML2026 Accepted</em>'));
  assert.ok(entry.includes('https://arxiv.org/pdf/2602.03564'));
});

test('papers page includes GeoDecider in the preprint section', () => {
  const preprints = page.match(
    /<h3 class="pub-year-heading">📘 Preprint<\/h3>([\s\S]*?)<h3 class="pub-year-heading">📘 Released Survey<\/h3>/,
  )?.[1] ?? '';
  const entries = preprints.match(/<li>[\s\S]*?<\/li>/g) ?? [];
  const entry = entries.find((candidate) => candidate.includes(geoDeciderTitle)) ?? '';

  assert.ok(entry, 'GeoDecider should appear in the preprint section');
  assert.ok(entry.startsWith(`<li>${geoDeciderAuthors} <strong>${geoDeciderTitle}</strong>`));
  assert.ok(entry.includes('(Preprint)'));
  assert.ok(entry.includes('https://arxiv.org/pdf/2605.03383'));
  assert.ok(entry.includes('https://github.com/Xiaoyu-Tao/GeoDecider'));
});

test('papers page includes CastFSR in the preprint section', () => {
  const preprints = page.match(
    /<h3 class="pub-year-heading">📘 Preprint<\/h3>([\s\S]*?)<h3 class="pub-year-heading">📘 Released Survey<\/h3>/,
  )?.[1] ?? '';
  const entries = preprints.match(/<li>[\s\S]*?<\/li>/g) ?? [];
  const entry = entries.find((candidate) => candidate.includes(castFsrTitle)) ?? '';

  assert.ok(entry, 'CastFSR should appear in the preprint section');
  assert.ok(entry.includes('(Preprint)'));
  assert.ok(entry.includes('https://arxiv.org/abs/2608.03031'));
  assert.ok(entry.includes('https://github.com/Xiaoyu-Tao/CastFSR'));
});

test('papers page includes OneCast and DisenTS in the 2026 accepted section', () => {
  const papers2026 = page.match(
    /<h3 class="pub-year-heading">🐎 Year of the Fire Horse \(Bing Wu Year, 2026\)<\/h3>([\s\S]*?)<h3 class="pub-year-heading">🐍 Year of the Wood Snake \(Yi Si Year, 2025\)<\/h3>/,
  )?.[1] ?? '';
  const entries = papers2026.match(/<li>[\s\S]*?<\/li>/g) ?? [];
  const oneCastEntry = entries.find((entry) => entry.includes(oneCastTitle)) ?? '';
  const disenTsEntry = entries.find((entry) => entry.includes(disenTsTitle)) ?? '';

  assert.ok(oneCastEntry, 'OneCast should appear in the 2026 publications section');
  assert.ok(oneCastEntry.includes('<em>ACM TKDD Accepted</em>'));
  assert.ok(oneCastEntry.includes('https://arxiv.org/pdf/2510.24028'));
  assert.ok(oneCastEntry.includes('https://github.com/pty12345/OneCast'));

  assert.ok(disenTsEntry, 'DisenTS should appear in the 2026 publications section');
  assert.ok(disenTsEntry.includes('<em>IEEE TPAMI Accepted</em>'));
  assert.ok(disenTsEntry.includes('https://arxiv.org/pdf/2410.22981'));
});
