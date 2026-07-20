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

---

## Enhancement Phase: Ground the Page in the Time Series for Science Discipline Plan

The following tasks refine the existing page using `时序数据分析驱动的学科规划.md` v0.3. They supersede the original page-body content in Task 2 while preserving the page path, navigation, footer, dependency-free architecture, and responsive requirements.

### Task 5: Define discipline-plan content contracts

**Files:**
- Modify: `tests/scientific-time-series.test.mjs`

- [ ] **Step 1: Add failing tests for the research framework**

```js
test('detail page states the scientific foundation-model transfer goal without claiming release', () => {
  assert.ok(detail.includes('跨系统、跨尺度表征与适配能力'));
  assert.ok(detail.includes('研究规划 · Benchmark Framework'));
  assert.ok(detail.includes('尚未冻结的数据产品'));
});

test('detail page presents the three-dimensional benchmark framework', () => {
  for (const axis of ['科学系统维度', '物理描述尺度维度', '适配预算维度']) {
    assert.ok(detail.includes(axis), `Missing benchmark axis: ${axis}`);
  }
  for (const scale of ['L0 电子/量子', 'L1 原子/分子', 'L2 介观/动理学', 'L3 连续介质/场', 'L4 系统/工程动力学']) {
    assert.ok(detail.includes(scale), `Missing physical scale: ${scale}`);
  }
  assert.ok(detail.includes('真实观测与实验主赛道'));
  assert.ok(detail.includes('计算模拟辅助赛道'));
});

test('detail page covers four systems and eight complementary task packages', () => {
  for (const taskPackage of [
    '受控等离子体与核聚变',
    '时域天文观测',
    '大气—环境耦合',
    '水文与水循环',
    '地震与固体地球事件',
    '生理—神经调节',
    '化学反应与分子动力',
    '材料演化与服役退化',
  ]) {
    assert.ok(detail.includes(taskPackage), `Missing task package: ${taskPackage}`);
  }
});

test('detail page exposes seven task families and the entity-counted transfer curve', () => {
  for (const taskFamily of [
    '动力学预测',
    '状态重建与逆问题',
    '事件与变化检测',
    '缺失与传感器鲁棒性',
    '退化与剩余寿命',
    '表征学习与跨领域适配',
    '跨尺度桥接与闭合学习',
  ]) {
    assert.ok(detail.includes(taskFamily), `Missing task family: ${taskFamily}`);
  }
  for (const budget of ['零样本', '1%', '5%', '10%', '全量微调']) {
    assert.ok(detail.includes(budget), `Missing adaptation budget: ${budget}`);
  }
  assert.ok(detail.includes('独立科学实体'));
  assert.ok(detail.includes('负迁移'));
  assert.ok(detail.includes('物理一致性'));
});

test('homepage card reflects the cross-system and cross-scale research direction', () => {
  const card = homepage.match(/id="track-scientific-time-series"[\s\S]*?<\/div>\n      <\/div>\n    <\/div>/)?.[0] ?? '';
  assert.ok(card.includes('科学时序基础模型'));
  assert.ok(card.includes('跨系统'));
  assert.ok(card.includes('跨尺度'));
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test tests/scientific-time-series.test.mjs`

Expected: the original navigation and responsive tests pass; the five new discipline-plan tests fail because the page still contains the initial generic four-section story.

- [ ] **Step 3: Commit the red tests**

```bash
git add tests/scientific-time-series.test.mjs
git commit -m "test: define scientific time series benchmark content"
```

### Task 6: Rebuild the page body around the benchmark framework

**Files:**
- Modify: `scientific-time-series/index.html`
- Test: `tests/scientific-time-series.test.mjs`

- [ ] **Step 1: Refine the hero and add the planning boundary**

Use this content contract in the existing hero:

```html
<p class="eyebrow">Scientific Time Series Modeling</p>
<h1>科学时序数据建模</h1>
<p class="header-sub">面向复杂科学动力系统，研究科学时序基础模型如何跨系统、跨尺度学习动态规律，并以零样本、少样本或全量数据适配新的科学对象。</p>
<div class="hero-highlights" aria-label="研究方向概览">
  <span>跨系统动力学</span>
  <span>跨尺度科学建模</span>
  <span>零样本到全量适配</span>
</div>
<div class="planning-note">
  <strong>研究规划 · Benchmark Framework</strong>
  <span>当前页面展示研究方向与评测框架，不代表已经正式发布或尚未冻结的数据产品。</span>
</div>
```

- [ ] **Step 2: Replace the generic definition section**

```html
<section class="section-card" id="definition">
  <div class="section-heading">
    <div><span class="section-kicker">Definition</span><h2>什么是科学时序数据</h2></div>
    <p class="section-lead">科学时序不是任意排列的数值向量，而是科学系统在特定尺度下，经由观测过程形成的动态记录。</p>
  </div>
  <div class="definition-principles">
    <article><strong>真实过程语义</strong><p>时间轴对应物理、生物、化学、材料状态或实验循环的真实演化。</p></article>
    <article><strong>有效描述尺度</strong><p>每条序列声明目标状态所在尺度、被忽略的自由度及其有效模型。</p></article>
    <article><strong>观测过程可追溯</strong><p>记录仪器、传感器或观测算子如何把目标状态映射为实际观测。</p></article>
  </div>
  <div class="boundary-grid">
    <article class="boundary-card boundary-yes"><h3>典型科学时序</h3><p>多变量传感器、波形、空间场、时序光谱、控制轨迹与实验循环。</p></article>
    <article class="boundary-card boundary-no"><h3>不能仅凭一维横轴认定</h3><p>静态谱图、静态性质表、任意排序样本，以及只有最终标签而无过程记录的数据。</p></article>
  </div>
</section>
```

- [ ] **Step 3: Add the three-axis benchmark framework**

```html
<section class="section-card" id="benchmark-framework">
  <div class="section-heading">
    <div><span class="section-kicker">Benchmark Cube</span><h2>三维研究与评测框架</h2></div>
    <p class="section-lead">用“科学系统 × 物理描述尺度 × 适配预算”组织跨领域和跨尺度研究。</p>
  </div>
  <div class="axis-grid">
    <article class="axis-card"><span>Axis 01</span><h3>科学系统维度</h3><p>物理与宇宙 · 地球 · 生命 · 分子与材料</p></article>
    <article class="axis-card"><span>Axis 02</span><h3>物理描述尺度维度</h3><p>从电子/量子到系统/工程动力学的有效描述层级</p></article>
    <article class="axis-card"><span>Axis 03</span><h3>适配预算维度</h3><p>零样本 · 少样本 · 全量微调</p></article>
  </div>
  <div class="scale-strip" aria-label="物理描述尺度">
    <span><b>L0</b>电子/量子</span><span><b>L1</b>原子/分子</span><span><b>L2</b>介观/动理学</span><span><b>L3</b>连续介质/场</span><span><b>L4</b>系统/工程动力学</span>
  </div>
  <div class="track-split">
    <article><strong>真实观测与实验主赛道</strong><p>跨系统主结果必须建立在真实科学数据上。</p></article>
    <article><strong>计算模拟辅助赛道</strong><p>服务跨尺度与模拟到真实迁移，但不替代真实数据主结果。</p></article>
  </div>
</section>
```

- [ ] **Step 4: Add the four-system, eight-package map**

```html
<section class="section-card" id="scientific-systems">
  <div class="section-heading">
    <div><span class="section-kicker">Scientific Systems</span><h2>四类科学系统与八个任务包</h2></div>
    <p class="section-lead">以最小但互补的任务包覆盖不同控制方式、动力学机制、观测拓扑和迁移边界。</p>
  </div>
  <div class="system-grid">
    <article class="system-card"><span>01</span><h3>物理与宇宙系统</h3><p>强非线性控制、被动稀疏观测与瞬变动力学。</p><div class="package-list"><span>受控等离子体与核聚变</span><span>时域天文观测</span></div></article>
    <article class="system-card"><span>02</span><h3>地球系统</h3><p>开放时空场、外部驱动、长记忆与波传播。</p><div class="package-list"><span>大气—环境耦合</span><span>水文与水循环</span><span>地震与固体地球事件</span></div></article>
    <article class="system-card"><span>03</span><h3>生命系统</h3><p>稳态调节、个体差异、状态切换与强非平稳性。</p><div class="package-list"><span>生理—神经调节</span></div></article>
    <article class="system-card"><span>04</span><h3>分子与材料系统</h3><p>反应、状态转化、结构演化与不可逆退化。</p><div class="package-list"><span>化学反应与分子动力</span><span>材料演化与服役退化</span></div></article>
  </div>
</section>
```

- [ ] **Step 5: Add the seven task families and evaluation protocol**

```html
<section class="section-card" id="task-system">
  <div class="section-heading"><div><span class="section-kicker">Task System</span><h2>统一任务体系</h2></div></div>
  <div class="task-grid">
    <article><span>01</span><h3>动力学预测</h3></article>
    <article><span>02</span><h3>状态重建与逆问题</h3></article>
    <article><span>03</span><h3>事件与变化检测</h3></article>
    <article><span>04</span><h3>缺失与传感器鲁棒性</h3></article>
    <article><span>05</span><h3>退化与剩余寿命</h3></article>
    <article><span>06</span><h3>表征学习与跨领域适配</h3></article>
    <article><span>07</span><h3>跨尺度桥接与闭合学习</h3></article>
  </div>
</section>

<section class="section-card" id="evaluation">
  <div class="section-heading">
    <div><span class="section-kicker">Transfer & Reliability</span><h2>迁移与科学有效性评测</h2></div>
    <p class="section-lead">结果不是一个孤立平均误差，而是目标领域数据量—模型性能迁移曲线。</p>
  </div>
  <div class="adaptation-curve" aria-label="适配预算">
    <span>零样本</span><b>→</b><span>1%</span><b>→</b><span>5%</span><b>→</b><span>10%</span><b>→</b><span>全量微调</span>
  </div>
  <p class="entity-note">少样本预算按独立科学实体计算，而不是按高度重叠的时间窗口计算。</p>
  <div class="evaluation-grid">
    <article><h3>任务性能</h3><p>预测、概率、事件、重建与寿命任务指标。</p></article>
    <article><h3>科学有效性</h3><p>物理一致性、不确定性校准、极端事件与长期稳定性。</p></article>
    <article><h3>迁移与效率</h3><p>数据效率、负迁移、最差领域表现与计算成本。</p></article>
  </div>
  <div class="migration-types"><span>同尺度跨系统</span><span>同系统跨尺度</span><span>跨系统且跨尺度</span></div>
</section>
```

- [ ] **Step 6: Add responsive component styles**

Define desktop grids and collapse every new multi-column component at the existing breakpoints:

```css
.definition-principles, .axis-grid, .evaluation-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
.boundary-grid, .system-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
.task-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
.scale-strip, .adaptation-curve, .migration-types { display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:10px; }
@media (max-width: 960px) {
  .definition-principles, .axis-grid, .evaluation-grid, .task-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width: 720px) {
  .definition-principles, .boundary-grid, .axis-grid, .system-grid, .task-grid, .evaluation-grid { grid-template-columns:1fr; }
  .scale-strip, .adaptation-curve { flex-direction:column; align-items:stretch; text-align:center; }
  .adaptation-curve b { transform:rotate(90deg); }
}
```

- [ ] **Step 7: Run focused tests and commit the page**

Run: `node --test tests/scientific-time-series.test.mjs`

Expected: all scientific-time-series tests PASS.

```bash
git add scientific-time-series/index.html
git commit -m "feat: ground scientific time series page in benchmark plan"
```

### Task 7: Align the homepage summary and verify the enhancement

**Files:**
- Modify: `index.html`
- Test: `tests/scientific-time-series.test.mjs`

- [ ] **Step 1: Refine the homepage card copy**

Use the following research-direction summary while preserving the existing card structure and link:

```html
<p class="card-desc">
  面向物理、地球、生命、分子与材料等科学动力系统，研究科学时序基础模型的跨系统、跨尺度表征、预测、重建与适配能力。
</p>
<div class="card-meta">
  <div class="meta-row"><span class="meta-icon">🔭</span><span>科学系统：四类科学系统 · 八个互补领域任务包</span></div>
  <div class="meta-row"><span class="meta-icon">🧭</span><span>描述尺度：L0 电子/量子 → L4 系统/工程动力学</span></div>
  <div class="meta-row"><span class="meta-icon">⚙️</span><span>核心任务：动力学预测 · 状态重建 · 事件检测 · 跨尺度桥接</span></div>
  <div class="meta-row"><span class="meta-icon">📈</span><span>迁移评测：零样本 · 少样本 · 全量微调 · 物理一致性</span></div>
</div>
```

- [ ] **Step 2: Run the complete test suite**

Run: `node --test tests/*.test.mjs`

Expected: all homepage, StarCast, and scientific-time-series tests PASS.

- [ ] **Step 3: Commit the homepage alignment and tests**

```bash
git add index.html tests/scientific-time-series.test.mjs
git commit -m "feat: align homepage with scientific benchmark framework"
```

- [ ] **Step 4: Verify browser behavior**

At desktop width, verify the five core sections appear in order and the page console contains no errors. At 390 × 844, verify all new grids collapse to one column, the transfer curve remains readable, and `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

- [ ] **Step 5: Verify repository scope**

Run: `git diff --check`

Expected: no output.

Run: `git status --short`

Expected in the isolated worktree: no output. After merging back to the main worktree, `cast-claw/assets/logo2_副本.png` remains untracked and untouched.
