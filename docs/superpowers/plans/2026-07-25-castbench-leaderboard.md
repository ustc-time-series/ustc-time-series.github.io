# CastBench Leaderboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a discoverable CastBench page that demonstrates a multidimensional time-series model leaderboard and documents its benchmark datasets, metrics, protocol, and reproducibility workflow.

**Architecture:** Preserve the repository’s dependency-free static HTML architecture. One self-contained page owns semantic markup, embedded CSS, a local model-result dataset, and vanilla JavaScript for filtering, sorting, details, and comparison; Node’s built-in test runner protects content and interaction contracts.

**Tech Stack:** HTML5, embedded CSS, vanilla JavaScript, Node.js `node:test`.

---

## File Map

- Create `tests/cast-bench.test.mjs`: page, data, accessibility, interaction, protocol, responsive, and entry-point contracts.
- Create `cast-bench/index.html`: complete CastBench page and client-side leaderboard.
- Modify `index.html`: add a `CastBench 排行榜` link beside the existing CastMind homepage button.
- Modify `cast-mind/index.html`: add a `CastBench 排行榜` link to the project-page navigation while preserving existing uncommitted content edits.
- Modify `tests/subpage-theme.test.mjs`: include CastBench in the shared palette audit.

### Task 1: Define the CastBench product contract

**Files:**
- Create: `tests/cast-bench.test.mjs`

- [ ] **Step 1: Write the failing page and content tests**

```js
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const pageUrl = new URL('cast-bench/index.html', root);
const page = await readFile(pageUrl, 'utf8').catch(() => '');
const homepage = await readFile(new URL('index.html', root), 'utf8');
const castMind = await readFile(new URL('cast-mind/index.html', root), 'utf8');

test('CastBench page exists and leads with the multidimensional leaderboard', async () => {
  await access(pageUrl);
  assert.ok(page.includes('<h1><span>CastBench</span>'));
  for (const section of ['Leaderboard', 'Benchmark Dataset', '评测维度', '评测协议', '提交与复现']) {
    assert.ok(page.includes(section), `Missing section: ${section}`);
  }
});

test('CastBench labels every current score as protocol demo data', () => {
  assert.ok(page.includes('协议演示数据'));
  assert.ok(page.includes('不构成任何模型的正式性能声明'));
  assert.ok(page.includes('data-result-status="demo"'));
  assert.ok(!page.includes('Official Result'));
});

test('leaderboard exposes accessible filters, sortable columns, details, and comparison', () => {
  for (const hook of [
    'id="model-search"',
    'id="domain-filter"',
    'id="family-filter"',
    'id="metric-filter"',
    'data-sort-key="overall"',
    'id="leaderboard-status" aria-live="polite"',
    'id="model-dialog"',
    'id="comparison-panel"',
  ]) {
    assert.ok(page.includes(hook), `Missing interaction hook: ${hook}`);
  }
  assert.ok(page.includes('event.key === "Escape"'));
  assert.ok(page.includes('MAX_COMPARE = 3'));
});

test('leaderboard data covers representative model families and six dimensions', () => {
  for (const family of ['Reasoning TSFM', 'Foundation Model', 'Deep Forecasting', 'Statistical']) {
    assert.ok(page.includes(family), `Missing model family: ${family}`);
  }
  for (const metric of ['accuracy', 'probabilistic', 'trend', 'context', 'robustness', 'efficiency']) {
    assert.match(page, new RegExp(`${metric}:\\s*\\d`), `Missing metric data: ${metric}`);
  }
  const modelNames = [...page.matchAll(/name:\s*'([^']+)'/g)].map(([, name]) => name);
  assert.ok(modelNames.length >= 10, 'Leaderboard should include at least ten models');
});

test('dataset and protocol sections expose the planned benchmark structure', () => {
  for (const suite of ['General Forecasting Suite', 'FutureCast Context Suite', 'Stress Test Suite']) {
    assert.ok(page.includes(suite), `Missing suite: ${suite}`);
  }
  for (const domain of ['能源与电力', '交通与出行', '气象与环境', '金融与零售', '医疗与运营', '跨域困难集']) {
    assert.ok(page.includes(domain), `Missing domain: ${domain}`);
  }
  assert.ok(page.includes('Overall = 30% Accuracy + 15% Probabilistic + 15% Trend + 20% Context + 15% Robustness + 5% Efficiency'));
  assert.ok(page.includes('时间顺序切分'));
  assert.ok(page.includes('Demo → Submitted → Reproduced → Verified'));
});

test('inline scripts are syntactically valid', () => {
  const scripts = [...page.matchAll(/<script>([\s\S]*?)<\\/script>/g)].map(([, source]) => source);
  assert.ok(scripts.length > 0, 'Missing inline script');
  scripts.forEach((source, index) => {
    assert.doesNotThrow(() => new vm.Script(source), `Inline script ${index + 1} should parse`);
  });
});

test('homepage and CastMind page link to CastBench', () => {
  assert.ok(homepage.includes('href="cast-bench/">CastBench 排行榜</a>'));
  assert.ok(castMind.includes('href="../cast-bench/">CastBench 排行榜</a>'));
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/cast-bench.test.mjs`

Expected: FAIL because `cast-bench/index.html` and the two entry links do not exist.

### Task 2: Build the semantic page and static product story

**Files:**
- Create: `cast-bench/index.html`
- Test: `tests/cast-bench.test.mjs`

- [ ] **Step 1: Add document metadata, hero, navigation, and demo disclaimer**

The page head must set the shared theme and descriptive metadata:

```html
<meta name="theme-color" content="#f4f7f9" />
<title>CastBench — 多维时间序列模型评测与公开排行榜</title>
<meta name="description" content="CastBench 是面向时间序列基础模型、深度预测模型与情境推理模型的多维评测与公开排行榜，覆盖预测准确性、概率质量、趋势判断、情境理解、鲁棒性与效率。" />
<link rel="canonical" href="https://ustc-time-series.github.io/cast-bench/" />
```

The hero and status copy must contain:

```html
<h1><span>CastBench</span><small>多维时间序列基础模型评测与公开排行榜</small></h1>
<p>不只比较一个误差数字。CastBench 在统一协议下评估数值预测、概率校准、趋势与转折、情境证据利用、跨域鲁棒性和推理效率。</p>
<aside class="demo-notice" data-result-status="demo">
  <strong>Protocol Preview · 协议演示数据</strong>
  <span>当前分数用于展示评测协议和榜单交互，不构成任何模型的正式性能声明。</span>
</aside>
```

- [ ] **Step 2: Add the Leaderboard shell and accessible controls**

```html
<section id="leaderboard" aria-labelledby="leaderboard-title">
  <div class="filter-grid" role="search" aria-label="筛选排行榜">
    <label for="model-search">搜索模型<input id="model-search" type="search" autocomplete="off" /></label>
    <label for="domain-filter">数据领域<select id="domain-filter"></select></label>
    <label for="family-filter">模型类型<select id="family-filter"></select></label>
    <label for="metric-filter">排名维度<select id="metric-filter"></select></label>
    <button id="reset-filters" type="button">重置</button>
  </div>
  <p id="leaderboard-status" aria-live="polite"></p>
  <div class="table-scroll" tabindex="0" aria-label="CastBench 排行榜，可横向滚动">
    <table id="leaderboard-table">
      <thead><tr>
        <th scope="col">排名</th>
        <th scope="col">模型</th>
        <th scope="col" aria-sort="descending"><button data-sort-key="overall">综合分</button></th>
        <th scope="col"><button data-sort-key="accuracy">点预测</button></th>
        <th scope="col"><button data-sort-key="probabilistic">概率</button></th>
        <th scope="col"><button data-sort-key="trend">趋势</button></th>
        <th scope="col"><button data-sort-key="context">情境</button></th>
        <th scope="col"><button data-sort-key="robustness">鲁棒性</button></th>
        <th scope="col"><button data-sort-key="efficiency">效率</button></th>
        <th scope="col">状态 / 操作</th>
      </tr></thead>
      <tbody id="leaderboard-body"></tbody>
    </table>
  </div>
</section>
```

- [ ] **Step 3: Add the Dataset, metrics, protocol, and submission sections**

Use semantic cards for the exact three suites, six domains, six dimensions, formula, leakage controls, result-state pipeline, and four submission steps required by the tests. Use `href="../future-cast/"` for the FutureCast link and `href="../"` for the site-home link.

- [ ] **Step 4: Add responsive and accessibility styles**

The embedded CSS must:

```css
:root {
  --accent: #091f44;
  --accent-dark: #06162e;
  --accent-soft: #edf7fc;
  --text-strong: #091f44;
  --text: #17324d;
  --text-muted: #4c6176;
  --line: #d5e3eb;
  --bg: #f4f7f9;
}
.table-scroll { overflow-x: auto; }
:focus-visible { outline: 3px solid rgba(11, 95, 198, .35); outline-offset: 3px; }
@media (max-width: 720px) {
  .hero-stats, .podium-grid, .suite-grid, .domain-grid, .metric-grid, .protocol-grid, .submission-steps { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/cast-bench.test.mjs`

Expected: content and structure tests PASS; data, interaction, and entry-link tests still FAIL.

### Task 3: Implement the leaderboard data and interaction

**Files:**
- Modify: `cast-bench/index.html`
- Test: `tests/cast-bench.test.mjs`

- [ ] **Step 1: Add the local demo model data**

Each of at least ten entries must use this complete shape:

```js
{
  id: 'castmind-agentic',
  name: 'CastMind-Agentic',
  organization: 'USTC AGI',
  family: 'Reasoning TSFM',
  mode: 'Context + Agentic',
  parameters: 'Research preview',
  openness: 'Planned',
  overall: 87.6,
  accuracy: 84.9,
  probabilistic: 82.4,
  trend: 91.2,
  context: 94.6,
  robustness: 87.8,
  efficiency: 64.1,
  domains: { energy: 91.2, traffic: 88.7, weather: 84.3, finance: 86.1, health: 82.4, hard: 78.8 },
  strength: '情境证据利用、趋势转折判断与获得新信息后的预测修正。',
  caution: '当前为研究预览，效率和完整公开复现链路仍需验证。',
}
```

The remaining entries cover `Foundation Model`, `Deep Forecasting`, and `Statistical` families, and all values remain protocol-demo data.

- [ ] **Step 2: Add state, filtering, and sorting**

```js
const MAX_COMPARE = 3;
const state = { search: '', domain: 'all', family: 'all', metric: 'overall', sortKey: 'overall', sortDirection: 'desc', selected: [] };

const filteredModels = () => models
  .filter((model) => model.name.toLowerCase().includes(state.search) || model.organization.toLowerCase().includes(state.search))
  .filter((model) => state.family === 'all' || model.family === state.family)
  .sort((a, b) => {
    const aValue = state.domain === 'all' ? a[state.sortKey] : a.domains[state.domain];
    const bValue = state.domain === 'all' ? b[state.sortKey] : b.domains[state.domain];
    return state.sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
  });
```

The render function derives ranks after filtering, updates `#leaderboard-status`, renders the table and podium, and uses escaped text-only interpolation for model-supplied strings.

- [ ] **Step 3: Add model details and comparison**

Use `<dialog id="model-dialog">` with a labelled title and close button. `openModel(id)` renders six domain bars and the model metadata. `toggleCompare(id)` enforces `MAX_COMPARE = 3`, updates the checkboxes, exposes a polite limit message, and renders six metric rows in `#comparison-panel`.

- [ ] **Step 4: Add keyboard and control behavior**

- Search updates on `input`.
- Selects update on `change`.
- Sort buttons toggle ascending/descending and update `aria-sort`.
- Reset returns to default state.
- `Escape` clears a nonempty search; otherwise it closes the dialog.
- Event delegation handles row details and compare controls.
- The page initializes by calling `render()`.

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/cast-bench.test.mjs`

Expected: page, data, interaction, syntax, dataset, and protocol tests PASS; entry-link test still FAIL.

### Task 4: Add discoverable entry points and theme coverage

**Files:**
- Modify: `index.html`
- Modify: `cast-mind/index.html`
- Modify: `tests/subpage-theme.test.mjs`
- Test: `tests/cast-bench.test.mjs`

- [ ] **Step 1: Add the homepage CastMind-card link**

Insert beside the existing CastMind homepage button:

```html
<a class="card-btn btn-outline" href="cast-bench/">CastBench 排行榜</a>
```

- [ ] **Step 2: Add the CastMind project navigation link**

Insert after the home link without altering any existing user-edited copy:

```html
<a href="../cast-bench/">CastBench 排行榜</a>
```

- [ ] **Step 3: Include CastBench in the shared theme audit**

Add `'cast-bench/index.html'` to `subpagePaths` in `tests/subpage-theme.test.mjs`.

- [ ] **Step 4: Run all tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS with zero failures.

### Task 5: Verify the finished static site

**Files:**
- Verify: `cast-bench/index.html`
- Verify: `index.html`
- Verify: `cast-mind/index.html`
- Verify: `tests/cast-bench.test.mjs`
- Verify: `tests/subpage-theme.test.mjs`

- [ ] **Step 1: Check inline JavaScript and all regression tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS.

- [ ] **Step 2: Check HTML tags and local links**

Run a Node verification script that confirms:

- one `<html>`, `<head>`, and `<body>` pair;
- every section navigation fragment exists;
- `../`, `../future-cast/`, and `../asset/ts_mark.svg` resolve locally;
- all external links include `rel="noopener"`;
- model IDs are unique;
- the page contains no `TODO` or `TBD`.

Expected: `CastBench structural checks passed`.

- [ ] **Step 3: Check repository diff integrity**

Run: `git diff --check`

Expected: no output.

Run: `git status --short`

Expected: only the CastBench implementation/docs/tests plus the user-owned pre-existing `cast-mind/index.html` modification and `cast-claw/assets/logo2_副本.png`; the image remains untouched.
