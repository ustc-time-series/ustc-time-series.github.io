# TimeReasoner Minimal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the decorative TimeReasoner landing-page treatment with a restrained, text-first academic homepage while preserving all publication content and links.

**Architecture:** Keep the existing single-route vinext application, server-rendered publication data, metadata, paper assets, and client-side BibTeX control. Simplify `app/page.tsx` into semantic publication sections and replace `app/globals.css` with one compact monochrome stylesheet using a single blue accent.

**Tech Stack:** React, TypeScript, vinext, CSS, Node test runner, Sites hosting.

---

### Task 1: Establish the minimal visual contract

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Test: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Add a failing rendered-page test**

Add a test that requires the new semantic marker and rejects the decorative
hero implementation:

```js
test("renders a restrained text-first academic layout", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /class="publication-hero"/);
  assert.match(html, /class="study-facts"/);
  assert.doesNotMatch(html, /signal-card|hero-grid|hero-orb|resource-popover/);
});
```

- [ ] **Step 2: Add a failing stylesheet test**

Extend the source test with:

```js
assert.doesNotMatch(css, /(?:linear|radial)-gradient/);
assert.doesNotMatch(css, /backdrop-filter|box-shadow|rotate\(/);
assert.match(css, /--accent:\s*#[0-9a-f]{6}/i);
```

- [ ] **Step 3: Run the test and confirm RED**

Run:

```bash
npm test
```

Expected: failure because the existing page still renders `signal-card` and
the existing stylesheet contains gradients, shadows, blur, and rotations.

- [ ] **Step 4: Commit the test contract**

```bash
git add tests/rendered-html.test.mjs
git commit -m "test: define minimal academic layout contract"
```

### Task 2: Simplify the publication page

**Files:**
- Modify: `app/page.tsx`
- Test: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Remove decorative-only data and helpers**

Delete `CSSProperties`, `historyTrace`, `forecastTrace`, and `traceStyle`.
Keep the publication URLs, authors, metrics, benchmark values, findings,
strategies, failure modes, BibTeX, and JSON-LD unchanged.

- [ ] **Step 2: Replace the header and hero**

Render a plain header and a centered publication hero:

```tsx
<header className="site-header">
  <div className="container nav-shell">
    <a className="nav-brand" href="#top">TimeReasoner</a>
    <nav aria-label="Primary navigation">{/* existing anchors */}</nav>
  </div>
</header>

<section className="publication-hero" id="top">
  <div className="reading-column">
    <p className="venue">WSDM 2026</p>
    <h1>Can Slow-Thinking LLMs Reason Over Time?</h1>
    {/* subtitle, authors, affiliation, and publication links */}
  </div>
</section>
```

- [ ] **Step 3: Convert card grids to ruled rows**

Use `study-facts`, `process-list`, `detail-list`, `finding-list`,
`strategy-list`, and `failure-list` containers. Keep all facts and explanations
but remove decorative icons, badges, color variants, and duplicated callouts.

- [ ] **Step 4: Keep paper figures, table, abstract, and citation**

Preserve the three existing `<figure>` elements with the same sources, sizes,
lazy-loading behavior, and alternative text. Preserve the benchmark table,
`CopyBibtex`, citation links, skip link, section IDs, and JSON-LD.

- [ ] **Step 5: Run the page tests**

Run:

```bash
npm test
```

Expected: the new HTML assertions pass; the stylesheet assertions remain red
until Task 3.

### Task 3: Replace the visual system

**Files:**
- Modify: `app/globals.css`
- Test: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Define a restrained palette and layout**

Use:

```css
:root {
  --background: #ffffff;
  --surface: #f7f8fa;
  --text: #17191d;
  --muted: #656b76;
  --line: #dfe2e7;
  --accent: #315ea8;
}

.container {
  width: min(1080px, calc(100% - 40px));
  margin-inline: auto;
}

.reading-column {
  width: min(820px, calc(100% - 40px));
  margin-inline: auto;
}
```

- [ ] **Step 2: Style sections with whitespace and rules**

Use white backgrounds, 1-pixel borders, modest 4–8 pixel corner radii only
where needed, no shadows or gradients, and no positional hover movement.
Figures use a thin border; rows use top borders; the limitations section stays
on the white canvas.

- [ ] **Step 3: Preserve responsive and accessibility behavior**

Keep `.table-scroll { overflow-x: auto; }`, `:focus-visible`,
`@media (max-width: 760px)`, a 44-pixel minimum interactive target, and
`@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 4: Run GREEN verification**

Run:

```bash
npm test
```

Expected: all tests pass with zero failures.

### Task 4: Validate the finished revision

**Files:**
- Verify: `app/page.tsx`
- Verify: `app/globals.css`
- Verify: `app/layout.tsx`
- Verify: `public/*`

- [ ] **Step 1: Run the production build**

```bash
npm run build
```

Expected: exit code 0 and `dist/server/index.js` produced.

- [ ] **Step 2: Run lint and whitespace checks**

```bash
npm run lint
git diff --check
```

Expected: both exit 0 with no errors.

- [ ] **Step 3: Re-run the full test suite**

```bash
npm test
```

Expected: all tests pass with zero failures.

- [ ] **Step 4: Commit the validated redesign**

```bash
git add app/page.tsx app/globals.css tests/rendered-html.test.mjs
git commit -m "feat: simplify TimeReasoner academic homepage"
```

### Task 5: Publish the existing public site

**Files:**
- Verify: `.openai/hosting.json`

- [ ] **Step 1: Push the exact validated commit**

Obtain a short-lived source repository credential for the existing Sites
project and push the current `main` head without persisting credentials.

- [ ] **Step 2: Package and save one site version**

Run the Sites package helper against the project root, save the resulting
archive with the exact pushed commit SHA, and retain the returned version.

- [ ] **Step 3: Deploy to the existing public access level**

Deploy the saved version to the already-public project and poll until the
deployment reports `succeeded`.

- [ ] **Step 4: Confirm the unchanged public URL**

Verify an unauthenticated request returns HTTP 200 and includes the
TimeReasoner title rather than a sign-in page.
