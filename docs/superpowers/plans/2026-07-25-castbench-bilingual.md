# CastBench Bilingual Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing CastBench leaderboard into a complete Chinese-English experience with a persistent language switch and localized static, dynamic, SEO, and accessibility content.

**Architecture:** Keep `cast-bench/index.html` as the single source of truth. Static elements use declarative translation keys, while dynamic leaderboard strings and model descriptions use the same in-page locale dictionary. Language resolution follows URL query, saved preference, then browser locale, and updates the current URL without losing the active section hash.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js built-in test runner.

---

### Task 1: Add bilingual regression coverage

**Files:**
- Modify: `tests/cast-bench.test.mjs`

- [ ] **Step 1: Add a failing language-control test**

Assert the page contains `id="language-switch"`, two `data-language` buttons, `aria-pressed`, URL language parsing, storage persistence, and `document.documentElement.lang` updates.

- [ ] **Step 2: Add a failing content-coverage test**

Assert the English dictionary contains representative Hero, Leaderboard, Dataset, Metrics, Protocol, Submission, dialog, empty-state, comparison, and disclaimer copy.

- [ ] **Step 3: Add a failing model-copy test**

Count 12 `strengthEn` and 12 `cautionEn` properties so every displayed model has an English capability interpretation.

- [ ] **Step 4: Run the focused test**

Run:

```bash
node --test tests/cast-bench.test.mjs
```

Expected: the new bilingual tests fail because no language switch or locale system exists.

### Task 2: Add the language switch and international metadata

**Files:**
- Modify: `cast-bench/index.html`

- [ ] **Step 1: Add alternate-language metadata**

Add `hreflang="zh-CN"`, `hreflang="en"`, and `hreflang="x-default"` links. Give mutable description and social metadata stable IDs.

- [ ] **Step 2: Add accessible language controls**

Add:

```html
<div class="language-switch" id="language-switch" role="group" aria-label="语言 / Language">
  <button type="button" data-language="zh-CN" aria-pressed="true">中文</button>
  <button type="button" data-language="en" aria-pressed="false">EN</button>
</div>
```

- [ ] **Step 3: Style desktop, touch, focus, and narrow-screen states**

Reuse the site palette, provide a visible selected state, maintain a 40px minimum touch target, and allow the navigation row to scroll without clipping the control.

### Task 3: Localize all static page content

**Files:**
- Modify: `cast-bench/index.html`

- [ ] **Step 1: Mark static copy**

Add translation keys to the skip link, Hero, navigation, notices, filters, table headings, Dataset, Metrics, Protocol, Submission, footer, and dialog shell.

- [ ] **Step 2: Define the locale dictionary**

Define `translations['zh-CN']` and `translations.en` with complete matching keys. Keep metric abbreviations, model names, organization names, and protocol status names unchanged where they are international proper nouns.

- [ ] **Step 3: Translate content and attributes**

Implement helpers for text, trusted inline markup, placeholders, labels, title, descriptions, and social metadata.

### Task 4: Localize dynamic leaderboard behavior

**Files:**
- Modify: `cast-bench/index.html`

- [ ] **Step 1: Localize model explanations**

Add `strengthEn` and `cautionEn` to all 12 model records.

- [ ] **Step 2: Localize computed UI**

Use locale-aware metric/domain maps and translations in rows, podium cards, status text, comparison grid, empty state, and model dialog.

- [ ] **Step 3: Resolve and persist language**

Resolve `?lang=en` or `?lang=zh-CN`, then `castbench-language`, then `navigator.language`. Wrap storage access in `try/catch`, update the query string with `history.replaceState`, preserve the hash, and rerender after every switch.

- [ ] **Step 4: Verify focused tests turn green**

Run:

```bash
node --test tests/cast-bench.test.mjs
```

Expected: all CastBench tests pass.

### Task 5: Verify the complete site

**Files:**
- Verify: `cast-bench/index.html`
- Verify: `tests/*.test.mjs`

- [ ] **Step 1: Check inline script syntax and local references**

Use the existing CastBench regression test and the local-reference checker.

- [ ] **Step 2: Run the full test suite**

Run:

```bash
node --test tests/*.test.mjs
```

Expected: zero failures.

- [ ] **Step 3: Check diff hygiene**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.
