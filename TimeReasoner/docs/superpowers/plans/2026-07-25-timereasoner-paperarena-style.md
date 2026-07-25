# TimeReasoner PaperArena-Style Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the TimeReasoner homepage with the measured layout, typography, color, section rhythm, and component styling of the PaperArena homepage.

**Architecture:** Preserve the existing single-route vinext application, publication constants, metadata, paper assets, JSON-LD, and BibTeX client control. Replace the page hierarchy with PaperArena's hero and seven-section sequence, and replace the stylesheet with a direct local implementation of PaperArena's measured visual rules.

**Tech Stack:** React, TypeScript, vinext, CSS, Node test runner, Sites hosting.

---

### Task 1: Define the PaperArena rendering contract

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Test: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Replace the minimal-layout test**

Use one rendered-page test that requires the PaperArena mapping and rejects the
previous custom layout:

```js
test("renders the PaperArena-style academic page structure", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /class="paperarena-hero"/);
  assert.match(html, /class="gradient-title"/);
  assert.match(html, /class="[^"]*pill-button/);
  assert.match(html, /class="resources-control"/);
  assert.match(html, /class="feature-grid"/);

  const headings = [
    "💪 Performance",
    "📖 Abstract",
    "✨ Motivation",
    "⚙️ Key Features",
    "🌟 Analysis &amp; Limitations",
    "🔖 BibTeX",
  ];
  let cursor = -1;
  for (const heading of headings) {
    const next = html.indexOf(heading);
    assert.ok(next > cursor, `${heading} should appear in order`);
    cursor = next;
  }

  assert.doesNotMatch(
    html,
    /site-header|primary-nav|study-facts|process-list/,
  );
});
```

- [ ] **Step 2: Replace conflicting minimalist CSS assertions**

Require the measured PaperArena tokens and components:

```js
assert.match(css, /--primary-color:\s*#2563eb/i);
assert.match(css, /--background-secondary:\s*#f8fafc/i);
assert.match(css, /width:\s*min\(1152px,/);
assert.match(css, /\.gradient-title\s*\{[\s\S]*linear-gradient/s);
assert.match(css, /\.pill-button\s*\{[^}]*border-radius:\s*9999px/s);
assert.match(css, /\.feature-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
```

Remove assertions prohibiting gradients and shadows because those are explicit
PaperArena traits.

- [ ] **Step 3: Run the test and confirm RED**

Run:

```bash
npm test
```

Expected: failure because the existing page has the minimal editorial hierarchy
and lacks the PaperArena hero, heading order, gradient title, and pill buttons.

- [ ] **Step 4: Commit the failing contract**

```bash
git add tests/rendered-html.test.mjs
git commit -m "test: define PaperArena-style page contract"
```

### Task 2: Rebuild the page hierarchy

**Files:**
- Modify: `app/page.tsx`
- Modify: `public/favicon.svg`
- Test: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Keep publication data and simplify view data**

Retain `PAPER_URL`, `CODE_URL`, `DOI_URL`, authors, benchmark rows,
capabilities, failure modes, BibTeX, and JSON-LD. Remove the previous
`navLinks`, metrics, process-step, finding, and strategy view structures that
do not map to PaperArena.

- [ ] **Step 2: Implement the PaperArena hero**

Use this hierarchy:

```tsx
<section className="paperarena-hero" id="top">
  <div className="hero-body">
    <div className="wide-container hero-content">
      <h1 className="project-wordmark">
        <img src="/favicon.svg" alt="" aria-hidden="true" />
        <span className="gradient-title">TimeReasoner</span>
      </h1>
      <h2>Can Slow-Thinking LLMs Reason Over Time?</h2>
      <p className="paper-subtitle">
        Empirical Studies in Time Series Forecasting
      </p>
      {/* authors, affiliation, and four dark pill links */}
    </div>
  </div>
</section>
```

The four pill links are Paper, Code, DOI, and BibTeX.

- [ ] **Step 3: Implement the fixed resources control**

Use a native `details` element:

```tsx
<details className="resources-control">
  <summary>⚗ Resources <span aria-hidden="true">⌄</span></summary>
  <div className="resources-menu">
    <a href={PAPER_URL}>Paper</a>
    <a href={CODE_URL}>Code</a>
    <a href={DOI_URL}>DOI</a>
    <a href="#BibTeX">BibTeX</a>
  </div>
</details>
```

- [ ] **Step 4: Render sections in PaperArena order**

Render:

```tsx
<section className="paper-section light-section" id="performance">
  <h2>💪 Performance</h2>
  {/* benchmark table and note */}
</section>
<section className="paper-section light-section" id="abstract">
  <h2>📖 Abstract</h2>
  {/* one justified paragraph */}
</section>
<section className="paper-section" id="motivation">
  <h2>✨ Motivation</h2>
  {/* framework figure */}
</section>
<section className="paper-section light-section" id="features">
  <h2>⚙️ Key Features</h2>
  {/* reasoning figure and four boxes */}
</section>
<section className="paper-section" id="analysis">
  <h2>🌟 Analysis &amp; Limitations</h2>
  {/* failure figure and bullet list */}
</section>
<section className="paper-section" id="BibTeX">
  <h2>🔖 BibTeX</h2>
  <CopyBibtex bibtex={bibtex} />
</section>
```

- [ ] **Step 5: Replace the starter favicon**

Use the existing TimeReasoner mark already present in the repository history:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="17" fill="#10243e"/>
  <path d="M9 39 22 34 35 38 55 24" fill="none" stroke="#0aa6c7"
        stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/>
  <path d="m34 38 9-7 12-7" fill="none" stroke="#ef6f61"
        stroke-linecap="round" stroke-width="4"/>
  <circle cx="55" cy="24" r="3.5" fill="#7458d8"/>
</svg>
```

### Task 3: Match PaperArena's visual rules

**Files:**
- Modify: `app/globals.css`
- Test: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Define measured design tokens**

Use:

```css
:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --background-primary: #ffffff;
  --background-secondary: #f8fafc;
  --background-accent: #f1f5f9;
  --border-color: #e2e8f0;
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -2px rgb(0 0 0 / 10%);
}
```

- [ ] **Step 2: Reproduce hero and resource styles**

Use a 1152px container, a 56px gradient wordmark, a 25.6px paper title,
PaperArena-blue authors, muted affiliation, and dark pill buttons with the
same radius, padding, shadow, and blue hover.

- [ ] **Step 3: Reproduce section, table, and box styles**

Use 48px by 24px section padding, white and `#f8fafc` alternating sections,
32px centered headings, a PaperArena-style green performance table, centered
figures, two 564px-equivalent feature columns, and white boxes with 20px
padding and subtle shadow.

- [ ] **Step 4: Reproduce BibTeX, footer, and mobile behavior**

Use the reference BibTeX surface and toolbar, a centered light footer, a fixed
resources control on desktop and bottom-right on mobile, horizontally
scrollable performance data, full-width mobile pills, visible keyboard focus,
and reduced-motion fallbacks.

- [ ] **Step 5: Run GREEN verification**

Run:

```bash
npm test
```

Expected: all rendered-HTML and source assertions pass.

- [ ] **Step 6: Commit the implementation**

```bash
git add app/page.tsx app/globals.css public/favicon.svg
git commit -m "feat: match PaperArena homepage style"
```

### Task 4: Validate, integrate, and publish

**Files:**
- Verify: `app/page.tsx`
- Verify: `app/globals.css`
- Verify: `app/layout.tsx`
- Verify: `.openai/hosting.json`

- [ ] **Step 1: Run complete local verification**

```bash
npm test
npm run lint
git diff --check
```

Expected: all commands exit 0, with three rendered-page tests passing.

- [ ] **Step 2: Merge the isolated branch**

Fast-forward the validated feature branch into `main`, rerun the complete local
verification on `main`, then remove the temporary worktree and feature branch.

- [ ] **Step 3: Push and save the exact source**

Push the exact current `main` commit to the existing Sites source repository,
package the matching validated build, and save one new site version.

- [ ] **Step 4: Deploy with the existing public access**

Deploy the saved version to the already-public project and poll until Sites
reports `succeeded`.

- [ ] **Step 5: Confirm the unchanged public URL**

Confirm the live project reports access mode `public` and the same production
URL.
