# Prediction Intelligence Forecasting Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Rebuild `/forecasting/` as a concise research-vision page that defines time-series forecasting as prediction intelligence while preserving the group's research and application entry points.

**Architecture:** Keep the repository's dependency-free static-page architecture. Encode the narrative as semantic HTML sections with CSS-only diagrams and responsive cards, preserve the existing global navigation script, and protect the content contract with Node's built-in test runner.

**Tech Stack:** HTML5, embedded CSS, vanilla JavaScript, Node.js `node:test`

---

### Task 1: Add the forecasting-page content contract

**Files:**
- Create: `tests/forecasting-vision.test.mjs`
- Test: `tests/forecasting-vision.test.mjs`

- [x] **Step 1: Write the failing semantic contract test**

Create a test that reads `forecasting/index.html` and asserts the following exact contract:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const page = await readFile(new URL('forecasting/index.html', root), 'utf8');

test('defines forecasting as prediction intelligence for dynamic systems', () => {
  assert.ok(page.includes('面向动态复杂系统的未来认知'));
  assert.ok(page.includes('不是“普通回归加上一条时间轴”'));
  for (const concept of ['状态认知', '未来推断', '决策支持']) {
    assert.ok(page.includes(concept), `Missing core forecasting problem: ${concept}`);
  }
});

test('presents value, distinctive properties, and scientific challenges', () => {
  for (const value of ['资源配置', '风险预警', '动态控制', '系统韧性', '科学认知']) {
    assert.ok(page.includes(value), `Missing forecasting value: ${value}`);
  }
  assert.equal(page.match(/class="feature-card"/g)?.length, 6);
  assert.equal(page.match(/class="challenge-card"/g)?.length, 6);
});

test('publishes the nine-stage prediction-intelligence loop', () => {
  const chain = page.match(/<section[^>]+id="capability-chain"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.equal(chain.match(/class="chain-step"/g)?.length, 9);
  for (const stage of [
    '任务与决策定义', '数据感知', '快速预测', '可预测性诊断', '情境与工具',
    '机制推理', '场景生成', '校准与拒答', '决策与反馈',
  ]) {
    assert.ok(chain.includes(stage), `Missing capability stage: ${stage}`);
  }
});

test('shows six paradigm shifts and keeps research/application routes', () => {
  assert.equal(page.match(/class="shift-card"/g)?.length, 6);
  for (const work of ['ConvTimeNet', 'TimeMAE', 'TokenCast', 'TimeReasoner', 'AlphaCast']) {
    assert.ok(page.includes(work), `Missing representative work: ${work}`);
  }
  for (const route of ['./load-forecasting/', '../power-forecasting/', '../hydrological-forecasting/']) {
    assert.ok(page.includes(`href="${route}"`), `Missing application route: ${route}`);
  }
});
```

- [x] **Step 2: Run the test and verify RED**

Run: `node --test tests/forecasting-vision.test.mjs`

Expected: failures for the missing research-vision title, six-card sections, nine-stage chain, six shifts, and two new application routes.

### Task 2: Rebuild the page narrative and visual hierarchy

**Files:**
- Modify: `forecasting/index.html`
- Test: `tests/forecasting-vision.test.mjs`

- [x] **Step 1: Replace the generic hero with the prediction-intelligence hero**

Use the exact section label and heading:

```html
<p class="eyebrow">Prediction Intelligence · 预测智能</p>
<h1>时间序列预测：<span class="highlight">面向动态复杂系统的未来认知</span></h1>
```

Add a semantic CSS flow with three elements: `输入证据`, `认知过程`, and `输出与行动`. Include three `.question-card` elements for `状态认知`, `未来推断`, and `决策支持`.

- [x] **Step 2: Add the seven-section anchor navigation**

Insert links to `#essence`, `#value`, `#features`, `#challenges`, `#capability-chain`, `#paradigm-shifts`, and `#research-map`. Give every target `scroll-margin-top: 132px` and make `.section-nav-list` horizontally scrollable on compact screens.

- [x] **Step 3: Add the essence, value, feature, and challenge sections**

Use these exact section IDs and content contracts:

- `#essence`: the headings `状态认知`, `未来推断`, and `决策支持`.
- `#value`: the labels `资源配置`, `风险预警`, `动态控制`, `系统韧性`, and `科学认知`.
- `#features`: exactly six `article.feature-card` elements headed `目标尚未发生`, `部分观测`, `历史规律会失效`, `未来是一条联合轨迹`, `情境部分已知`, and `不确定性属于答案`.
- `#challenges`: exactly six `article.challenge-card` elements headed `可预测性边界`, `状态与机制重建`, `时序结构认知`, `非平稳与长尾`, `联合一致性`, and `可信评测与决策价值`.

- [x] **Step 4: Add the nine-stage capability loop and six paradigm shifts**

Render the capability loop as exactly nine `.chain-step` articles in this order:

```text
任务与决策定义 → 数据感知 → 快速预测 → 可预测性诊断 → 情境与工具 →
机制推理 → 场景生成 → 校准与拒答 → 决策与反馈
```

Render exactly six `.shift-card` articles with these transitions:

```text
预测值 → 认识可预测性
模式外推 → 状态—机制—情境认知
单点准确 → 概率、场景和风险
单模型映射 → 多阶段自主交互
模型中心 → 系统级预测智能
平均预测精度 → 最终决策价值
```

- [x] **Step 5: Run the focused test and verify GREEN**

Run: `node --test tests/forecasting-vision.test.mjs`

Expected: all focused tests pass.

### Task 3: Preserve the research portfolio and complete application routes

**Files:**
- Modify: `forecasting/index.html`
- Test: `tests/forecasting-vision.test.mjs`

- [x] **Step 1: Retain all six technical tracks and representative-work groups**

Keep the existing work names and map the cards after the conceptual sections: `ConvTimeNet`, `Slice-level Adaptive Normalization`, `TimeMAE`, `TimeDART`, `GPHT`, `TokenCast`, `CoGenCast`, `TimeReasoner`, `Time-R1`, `MemCast`, `AlphaCast`, `Cast-R1`, and `CastClaw`.

- [x] **Step 2: Expand application research to three cards**

Add exact route targets:

```html
<a href="./load-forecasting/">电力负荷预测</a>
<a href="../power-forecasting/">新能源功率预测</a>
<a href="../hydrological-forecasting/">水文预测</a>
```

Describe these as application pages or interactive demonstrations; do not present simulated values as experimental evidence.

- [x] **Step 3: Re-run focused tests**

Run: `node --test tests/forecasting-vision.test.mjs`

Expected: all tests pass with the existing work and three application routes present.

### Task 4: Responsive and repository-wide verification

**Files:**
- Modify: `forecasting/index.html`
- Test: `tests/forecasting-vision.test.mjs`

- [x] **Step 1: Add responsive rules**

At 960px, reduce three-column grids to two columns and stack the hero flow. At 720px, reduce all narrative grids to one column and keep the section navigation scrollable. At 480px, reduce card padding and typography without shrinking touch targets below 42px.

- [x] **Step 2: Validate inline scripts and the shared visual system**

Run:

```bash
node --test tests/forecasting-vision.test.mjs tests/subpage-theme.test.mjs tests/site-responsive-theme.test.mjs
```

Expected: all focused and shell tests pass.

- [x] **Step 3: Run the full parent suite**

Run: `node --test tests/*.test.mjs`

Expected: zero failures. If unrelated pre-existing failures appear, record them without weakening forecasting-page assertions.

- [x] **Step 4: Check whitespace and review the scoped diff**

Run:

```bash
git diff --check
git diff -- forecasting/index.html tests/forecasting-vision.test.mjs docs/superpowers/specs/2026-08-16-prediction-intelligence-forecasting-page-design.md docs/superpowers/plans/2026-08-16-prediction-intelligence-forecasting-page.md
```

Expected: no whitespace errors; the diff contains only the intended forecasting page, its focused test, and its design/plan notes.

- [x] **Step 5: Verify rendered desktop and mobile states**

Serve the repository locally, open `/forecasting/`, and verify at desktop and mobile widths: no horizontal document overflow, anchor links land on their sections, dropdown navigation opens and closes, and all three application links resolve.

This plan intentionally leaves the changes uncommitted because the current worktree already contains unrelated user edits and the user did not request a commit or push.

## Execution note

Implemented on 2026-08-16. The focused forecasting contract passed 8/8, the shared shell checks passed, and the final unfiltered repository suite passed 219/219. An intermediate run briefly exposed seven failures in the independently edited time-series-intelligence draft; those files were left untouched, and the final fresh run confirmed the complete worktree test suite was green.
