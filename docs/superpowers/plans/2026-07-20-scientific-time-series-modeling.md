# Scientific Time Series Modeling Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a discoverable “科学时序数据建模” research page that explains data characteristics, core problems, technical routes, and application domains.

**Architecture:** Keep the repository’s dependency-free static HTML architecture. Add one self-contained research page, expose it through the homepage research grid and every existing research dropdown, and protect the duplicated navigation/content contracts with Node’s built-in test runner.

**Tech Stack:** HTML5, embedded CSS, vanilla JavaScript, Node.js `node:test`, Python static HTTP server for browser verification.

---

## File Map

- Create `scientific-time-series/index.html`: standalone research direction page and its responsive styles/interactions.
- Create `tests/scientific-time-series.test.mjs`: content, navigation, and responsive-contract tests.
- Modify `index.html`: homepage research card and root-relative dropdown entry.
- Modify `forecasting/index.html`, `classification-anomaly/index.html`, `applications/index.html`, `open-source/index.html`, `papers/index.html`, `star-cast/index.html`, `systems/index.html`: add the sibling research-page dropdown entry.
- Modify `forecasting/load-forecasting/index.html`: add the two-level relative dropdown entry.

### Task 1: Define the new page and navigation contracts

**Files:**
- Create: `tests/scientific-time-series.test.mjs`

- [ ] **Step 1: Write the failing tests**

```js
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const detailUrl = new URL('scientific-time-series/index.html', root);
const detail = await readFile(detailUrl, 'utf8').catch(() => '');
const homepage = await readFile(new URL('index.html', root), 'utf8');

const siblingNavigationPages = [
  'forecasting/index.html',
  'classification-anomaly/index.html',
  'applications/index.html',
  'open-source/index.html',
  'papers/index.html',
  'star-cast/index.html',
  'systems/index.html',
];

test('scientific time series detail page exists and exposes the four-part research story', async () => {
  await access(detailUrl);
  for (const heading of [
    '科学时序数据的特点',
    '核心科学问题',
    '技术路线',
    '应用领域',
  ]) {
    assert.ok(detail.includes(heading), `Missing section: ${heading}`);
  }
  assert.ok(detail.includes('Scientific Time Series Modeling'));
  assert.ok(detail.includes('科学观测'));
  assert.ok(detail.includes('科学发现与决策'));
});

test('homepage links the scientific time series research card and dropdown', () => {
  assert.ok(homepage.includes('<h3>科学时序数据建模</h3>'));
  assert.ok(homepage.includes('href="scientific-time-series/"'));
});

test('all one-level pages expose the scientific time series dropdown entry', async () => {
  for (const path of siblingNavigationPages) {
    const page = await readFile(new URL(path, root), 'utf8');
    assert.ok(
      page.includes('href="../scientific-time-series/" role="menuitem">科学时序数据建模</a>'),
      `Missing dropdown entry in ${path}`,
    );
  }
});

test('the nested load forecasting page uses a valid two-level path', async () => {
  const page = await readFile(new URL('forecasting/load-forecasting/index.html', root), 'utf8');
  assert.ok(page.includes('href="../../scientific-time-series/" role="menuitem">科学时序数据建模</a>'));
});

test('detail page marks the new research menu item as current and supports narrow screens', () => {
  assert.ok(detail.includes('href="../scientific-time-series/" role="menuitem" aria-current="page"'));
  assert.ok(detail.includes('@media (max-width: 720px)'));
  assert.ok(detail.includes('grid-template-columns: 1fr;'));
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/scientific-time-series.test.mjs`

Expected: FAIL because `scientific-time-series/index.html` and the new navigation/card strings do not exist.

- [ ] **Step 3: Commit the red test**

```bash
git add tests/scientific-time-series.test.mjs
git commit -m "test: define scientific time series page contracts"
```

### Task 2: Build the independent research direction page

**Files:**
- Create: `scientific-time-series/index.html`
- Test: `tests/scientific-time-series.test.mjs`

- [ ] **Step 1: Create the page shell**

Use the existing research-page navigation and footer contracts. The new page head and hero must contain:

```html
<title>科学时序数据建模 | USTC-AGI Time Series</title>
<meta name="description" content="USTC-AGI 科学时序数据建模研究方向：科学数据特点、核心问题、技术路线与应用领域。" />
<link rel="icon" href="../asset/ts_mark.svg" type="image/svg+xml" sizes="any" />

<header id="hero-header" role="button" tabindex="0" aria-label="刷新当前页面">
  <div class="container">
    <p class="eyebrow">Scientific Time Series Modeling</p>
    <h1>科学时序数据建模</h1>
    <p class="header-sub">面向自然、工程与生命系统中的动态观测，融合数据驱动学习、结构归纳偏置与科学机理，形成可预测、可解释、可迁移的时序模型。</p>
    <div class="hero-highlights" aria-label="研究方向概览">
      <span>复杂科学观测</span><span>机理与数据融合</span><span>预测反演与发现</span>
    </div>
  </div>
</header>
```

The dropdown must mark the new item as current:

```html
<div class="nav-dropdown-menu" role="menu">
  <a href="../forecasting/" role="menuitem">时间序列预测</a>
  <a href="../classification-anomaly/" role="menuitem">时间序列分类与异常检测</a>
  <a class="nav-active" href="../scientific-time-series/" role="menuitem" aria-current="page">科学时序数据建模</a>
</div>
```

- [ ] **Step 2: Add the four content sections and research flow**

Use semantic sections with the exact headings required by the tests:

```html
<section class="section-card" id="data-characteristics">
  <h2>科学时序数据的特点</h2>
  <div class="feature-grid">
    <article class="feature-card"><span>01</span><h3>多尺度与非平稳</h3><p>动态过程跨越不同时间尺度，并随环境、阶段或实验条件发生分布变化。</p></article>
    <article class="feature-card"><span>02</span><h3>多变量与强耦合</h3><p>多个物理量、生物量或系统状态通过复杂依赖共同演化。</p></article>
    <article class="feature-card"><span>03</span><h3>稀疏与不规则观测</h3><p>采样频率、传感器覆盖和观测质量受实验与设备条件限制。</p></article>
    <article class="feature-card"><span>04</span><h3>机理与约束并存</h3><p>守恒律、边界条件、因果结构和领域规律限制可能的演化路径。</p></article>
  </div>
</section>

<section class="section-card" id="core-problems">
  <h2>核心科学问题</h2>
  <div class="process-grid">
    <article><strong>表征</strong><p>统一编码异构变量、不同采样粒度与多源观测。</p></article>
    <article><strong>预测</strong><p>刻画长期演化、突变事件与预测不确定性。</p></article>
    <article><strong>反演</strong><p>从观测序列估计隐状态、未知参数与驱动因素。</p></article>
    <article><strong>发现</strong><p>识别稳定规律、关键机制与可验证的科学假设。</p></article>
  </div>
</section>

<section class="section-card" id="technical-routes">
  <h2>技术路线</h2>
  <div class="route-grid">
    <article><h3>数据驱动时序学习</h3><p>自监督表征、时空依赖、多任务学习与基础模型。</p></article>
    <article><h3>科学机理融合</h3><p>物理约束、结构先验、微分方程与模拟数据协同。</p></article>
    <article><h3>可信与可迁移建模</h3><p>不确定性量化、分布外泛化、跨系统迁移与可解释分析。</p></article>
  </div>
  <div class="research-flow" aria-label="科学时序数据建模研究链路">
    <span>科学观测</span><b>→</b><span>多源时序表征</span><b>→</b><span>动态规律建模</span><b>→</b><span>可信预测与反演</span><b>→</b><span>科学发现与决策</span>
  </div>
</section>

<section class="section-card" id="domains">
  <h2>应用领域</h2>
  <div class="domain-grid">
    <article><h3>气象与地球系统</h3><p>天气、气候、海洋、水文与生态观测中的多尺度演化建模。</p></article>
    <article><h3>能源与工程系统</h3><p>能源供需、设备状态与复杂工程过程的预测、诊断和控制。</p></article>
    <article><h3>生命与健康科学</h3><p>生理信号、疾病进展与实验观测中的个体化动态建模。</p></article>
    <article><h3>材料与实验科学</h3><p>材料表征、反应过程与实验序列中的规律识别和参数反演。</p></article>
  </div>
  <div class="btn-row">
    <a class="page-btn page-btn-primary" href="../index.html#research-tracks">返回首页研究方向</a>
    <a class="page-btn page-btn-secondary" href="../papers/">查看论文列表</a>
  </div>
</section>
```

- [ ] **Step 3: Add responsive styles and existing dropdown/hero interactions**

The layout must include desktop grids and an explicit narrow-screen collapse:

```css
.feature-grid, .process-grid, .domain-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
.route-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
.research-flow { display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:10px; }
@media (max-width: 960px) {
  .feature-grid, .process-grid, .domain-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width: 720px) {
  .feature-grid, .process-grid, .route-grid, .domain-grid { grid-template-columns:1fr; }
  .research-flow b { transform:rotate(90deg); }
}
```

Add the dependency-free dropdown and hero interaction:

```html
<script>
  (() => {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    const closeAll = () => {
      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove('open');
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    };

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      const menuLinks = dropdown.querySelectorAll('.nav-dropdown-menu a');
      if (!toggle) return;
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const willOpen = !dropdown.classList.contains('open');
        closeAll();
        dropdown.classList.toggle('open', willOpen);
        toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
      menuLinks.forEach((link) => link.addEventListener('click', closeAll));
    });

    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAll();
    });

    const heroHeader = document.querySelector('#hero-header');
    const refreshPage = () => {
      if (!heroHeader || heroHeader.classList.contains('is-refreshing')) return;
      heroHeader.classList.add('is-refreshing');
      window.setTimeout(() => window.location.reload(), 160);
    };
    heroHeader?.addEventListener('click', (event) => {
      if (!event.target.closest('a, button')) refreshPage();
    });
    heroHeader?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      refreshPage();
    });
  })();
</script>
```

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/scientific-time-series.test.mjs`

Expected: detail-page assertions PASS; homepage and duplicated navigation assertions still FAIL.

- [ ] **Step 5: Commit the new page**

```bash
git add scientific-time-series/index.html
git commit -m "feat: add scientific time series research page"
```

### Task 3: Add the homepage research card and synchronize navigation

**Files:**
- Modify: `index.html`
- Modify: `forecasting/index.html`
- Modify: `classification-anomaly/index.html`
- Modify: `applications/index.html`
- Modify: `open-source/index.html`
- Modify: `papers/index.html`
- Modify: `star-cast/index.html`
- Modify: `systems/index.html`
- Modify: `forecasting/load-forecasting/index.html`
- Test: `tests/scientific-time-series.test.mjs`

- [ ] **Step 1: Add the homepage dropdown entry**

Insert after the classification/anomaly item:

```html
<a href="scientific-time-series/" role="menuitem">科学时序数据建模</a>
```

- [ ] **Step 2: Add the homepage full-width research card**

Insert after the “时间序列基础模型” card and before the research-grid closing tag:

```html
<div class="project-card project-card-wide" id="track-scientific-time-series">
  <div class="card-accent accent-evaluation"></div>
  <div class="card-body">
    <h3>科学时序数据建模</h3>
    <p class="card-desc">面向自然、工程与生命系统中的复杂动态观测，研究多尺度、强耦合、非平稳、稀疏或不规则采样以及机理约束下的统一时序建模方法。</p>
    <div class="card-meta">
      <div class="meta-row"><span class="meta-icon">🔭</span><span>数据特点：多尺度 · 强耦合 · 非平稳 · 稀疏与不规则观测</span></div>
      <div class="meta-row"><span class="meta-icon">🧭</span><span>核心问题：多源表征 · 长期预测 · 状态反演 · 科学规律发现</span></div>
      <div class="meta-row"><span class="meta-icon">⚙️</span><span>技术路线：数据驱动学习 · 科学机理融合 · 可信与可迁移建模</span></div>
      <div class="meta-row"><span class="meta-icon">🌍</span><span>应用领域：气象地球 · 能源工程 · 生命健康 · 材料实验</span></div>
    </div>
    <div class="card-links">
      <a class="card-btn btn-enter-context" href="scientific-time-series/">查看主页 →</a>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Synchronize one-level navigation pages**

Insert after the classification/anomaly menu item in each one-level page:

```html
<a href="../scientific-time-series/" role="menuitem">科学时序数据建模</a>
```

- [ ] **Step 4: Synchronize the nested load-forecasting page**

Insert the correctly nested path:

```html
<a href="../../scientific-time-series/" role="menuitem">科学时序数据建模</a>
```

- [ ] **Step 5: Run all tests**

Run: `node --test tests/*.test.mjs`

Expected: all homepage, StarCast, and scientific-time-series tests PASS.

- [ ] **Step 6: Commit homepage and navigation integration**

```bash
git add index.html forecasting/index.html forecasting/load-forecasting/index.html classification-anomaly/index.html applications/index.html open-source/index.html papers/index.html star-cast/index.html systems/index.html tests/scientific-time-series.test.mjs
git commit -m "feat: surface scientific time series research direction"
```

### Task 4: Verify content, responsive behavior, and repository scope

**Files:**
- Verify: all files changed in Tasks 1–3

- [ ] **Step 1: Run structural checks**

Run: `git diff --check HEAD~3..HEAD`

Expected: no output.

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Serve and inspect the homepage**

Run: `python3 -m http.server 8765 --bind 127.0.0.1`

Open `http://127.0.0.1:8765/`, verify the new full-width card appears under “研究方向”, then open its “查看主页” button.

- [ ] **Step 3: Inspect the detail page at desktop width**

Verify:

- hero title and subtitle are legible;
- four information sections appear in the intended order;
- research flow wraps cleanly;
- new dropdown item is marked current;
- browser console contains no errors.

- [ ] **Step 4: Inspect the detail page at mobile width**

Set a 390 × 844 viewport and verify:

- all multi-column grids collapse to one column;
- navigation wraps without horizontal overflow;
- buttons remain readable and tappable;
- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

- [ ] **Step 5: Confirm the user-owned untracked image remains untouched**

Run: `git status --short`

Expected: `cast-claw/assets/logo2_副本.png` remains untracked and is not staged; feature files are clean after commits.
