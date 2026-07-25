# TimeReasoner Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a responsive academic project page for the WSDM 2026 TimeReasoner paper, grounded in the supplied paper and inspired by PaperArena’s information architecture.

**Architecture:** A single Vinext/React route server-renders all research content. One focused client component adds the forecast canvas, strategy switching, mobile navigation, and copy feedback while leaving the complete page usable without JavaScript.

**Tech Stack:** Vinext, React 19, TypeScript, CSS, Node’s built-in test runner, Cloudflare Workers via Sites

---

### Task 1: Replace the starter acceptance contract

**Files:**
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Write the failing server-rendered homepage tests**

Replace the starter-only tests with assertions for the required research-page behavior:

```js
test("server-renders the TimeReasoner research page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<title>TimeReasoner \| Slow-Thinking Time Series Forecasting<\/title>/i);
  assert.match(html, /Can Slow-Thinking LLMs Reason Over Time\?/);
  assert.match(html, /WSDM ’26/);
  assert.match(html, /Training-free/);
  assert.match(html, /10 benchmarks/);
  assert.match(html, /One-Shot/);
  assert.match(html, /Decoupled/);
  assert.match(html, /Rollout/);
  assert.match(html, /Peak clipping/);
  assert.match(html, /Phase-shift error/);
  assert.match(html, /Copy-paste repeat/);
  assert.match(html, /Constant collapse/);
});

test("exposes official resources and accessible landmarks", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /href="\/time-reasoner-paper\.pdf"/);
  assert.match(html, /href="https:\/\/github\.com\/realwangjiahao\/TimeReasoner"/);
  assert.match(html, /href="https:\/\/doi\.org\/10\.1145\/3773966\.3777931"/);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /id="results"/);
  assert.match(html, /id="method"/);
  assert.match(html, /id="findings"/);
  assert.match(html, /id="limitations"/);
  assert.match(html, /id="citation"/);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/);
});
```

- [ ] **Step 2: Run the test and verify the expected RED state**

Run:

```bash
npm test
```

Expected: failure because the starter title, content, anchors, and links do not satisfy the TimeReasoner contract.

- [ ] **Step 3: Commit the test contract**

```bash
git add tests/rendered-html.test.mjs
git commit -m "test: define TimeReasoner homepage contract"
```

### Task 2: Add official research assets and metadata

**Files:**
- Create: `public/time-reasoner-paper.pdf`
- Create: `public/images/time-reasoner-framework.png`
- Create: `public/images/time-reasoner-motivation.png`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Copy the supplied paper and fetch the official repository figures**

```bash
cp "../相关Paper/TimeReasoner Can Slow-Thinking LLMs Reason Over Time? Empirical Studies in Time Series Forecasting.pdf" public/time-reasoner-paper.pdf
curl -fsSL "https://raw.githubusercontent.com/realwangjiahao/TimeReasoner/main/fig/main.png" -o public/images/time-reasoner-framework.png
curl -fsSL "https://raw.githubusercontent.com/realwangjiahao/TimeReasoner/main/fig/motivation.png" -o public/images/time-reasoner-motivation.png
```

Verify each file using `file`, `pdfinfo`, and image dimensions.

- [ ] **Step 2: Set finished scholarly metadata**

Use this metadata in `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://timereasoner.openai.app"),
  title: "TimeReasoner | Slow-Thinking Time Series Forecasting",
  description:
    "A training-free empirical study of inference-time temporal reasoning with slow-thinking LLMs, accepted at WSDM 2026.",
  authors: [
    { name: "Mingyue Cheng" },
    { name: "Jiahao Wang" },
    { name: "Daoyu Wang" },
    { name: "Xiaoyu Tao" },
    { name: "Qi Liu" },
    { name: "Enhong Chen" },
  ],
  openGraph: {
    type: "article",
    title: "TimeReasoner: Can Slow-Thinking LLMs Reason Over Time?",
    description:
      "Training-free, inference-time reasoning for time series forecasting.",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
```

- [ ] **Step 3: Remove starter-only page metadata**

Delete the `codex-preview` marker and the `SkeletonPreview` import from `app/page.tsx`.

- [ ] **Step 4: Run the test to confirm it still fails only on missing page content**

Run:

```bash
npm test
```

Expected: metadata assertions can pass after the build, while research-content assertions still fail.

- [ ] **Step 5: Commit assets and metadata**

```bash
git add public/time-reasoner-paper.pdf public/images app/layout.tsx app/page.tsx
git commit -m "feat: add TimeReasoner research assets and metadata"
```

### Task 3: Build the complete server-rendered research page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add grounded data constants**

Define exact author, evidence, result, method, research-question, and failure-mode data:

```tsx
const evidence = [
  { value: "10", label: "benchmarks" },
  { value: "6", label: "research questions" },
  { value: "3", label: "reasoning strategies" },
  { value: "0", label: "task-specific training" },
];

const leadingResults = [
  { dataset: "ETTh1", domain: "Electricity", mse: "5.4469" },
  { dataset: "ETTh2", domain: "Electricity", mse: "8.6020" },
  { dataset: "AQWan", domain: "Environment", mse: "11,305.6345" },
  { dataset: "AQShunyi", domain: "Environment", mse: "12,874.9412" },
  { dataset: "Wind", domain: "Energy", mse: "1,556.5316" },
];

const failureModes = [
  ["Peak clipping", "Extrema are flattened or mis-scaled."],
  ["Phase-shift error", "The right shape arrives at the wrong time."],
  ["Copy-paste repeat", "A historical segment is repeated without adaptation."],
  ["Constant collapse", "The forecast degenerates toward a flat line."],
];
```

- [ ] **Step 2: Add the semantic page shell**

The root must include:

```tsx
<>
  <a className="skip-link" href="#main-content">Skip to content</a>
  <header className="site-header">{/* brand, anchors, venue */}</header>
  <main id="main-content">
    <section className="hero-section">{/* title, authors, resources, demo */}</section>
    <section className="evidence-strip">{/* four evidence items */}</section>
    <section id="results">{/* exact results */}</section>
    <section id="abstract">{/* abstract and motivation */}</section>
    <section id="method">{/* four-stage method and framework */}</section>
    <section id="findings">{/* six grounded findings */}</section>
    <section id="limitations">{/* trustworthiness and failure modes */}</section>
    <section id="citation">{/* BibTeX */}</section>
  </main>
  <footer>{/* official resource links and license */}</footer>
</>
```

- [ ] **Step 3: Add official links and complete copy**

Use:

```tsx
const resources = [
  { label: "Paper", href: "/time-reasoner-paper.pdf" },
  { label: "Code", href: "https://github.com/realwangjiahao/TimeReasoner" },
  { label: "DOI", href: "https://doi.org/10.1145/3773966.3777931" },
  { label: "Citation", href: "#citation" },
];
```

The abstract, findings, and limitations must be paraphrased from the supplied paper and must not imply that TimeReasoner wins all ten datasets.

- [ ] **Step 4: Run tests and verify GREEN server-rendered content**

Run:

```bash
npm test
```

Expected: all rendered HTML assertions pass.

- [ ] **Step 5: Commit the page content**

```bash
git add app/page.tsx
git commit -m "feat: build TimeReasoner research narrative"
```

### Task 4: Add focused client-side interactions

**Files:**
- Create: `app/interactive.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Add a failing source contract for client interactions**

Extend the test to assert that the server-rendered HTML exposes three strategy buttons with `aria-pressed`, a labeled chart region, and a citation copy control.

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test
```

Expected: failure on the newly added interaction contract.

- [ ] **Step 3: Implement the client component**

Use a typed strategy model:

```tsx
type Strategy = "one-shot" | "decoupled" | "rollout";

const strategies = {
  "one-shot": {
    label: "One-Shot",
    horizon: "Balanced across horizons",
    trace: ["Inspect trend + seasonality", "Select a forecasting rule", "Verify continuity"],
  },
  decoupled: {
    label: "Decoupled",
    horizon: "Strongest at longer horizons",
    trace: ["Generate a hypothesis", "Reflect on contradictions", "Revise the forecast"],
  },
  rollout: {
    label: "Rollout",
    horizon: "Strongest at shorter horizons",
    trace: ["Forecast the next block", "Feed it back as context", "Continue with caution"],
  },
} satisfies Record<Strategy, {
  label: string;
  horizon: string;
  trace: string[];
}>;
```

Implement:

- A canvas chart using deterministic observed, forecast, and uncertainty arrays.
- Three strategy buttons using `aria-pressed`.
- A mobile navigation button using `aria-expanded`.
- A citation copy button with success feedback and a selection fallback.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test
```

Expected: all interaction contract assertions pass.

- [ ] **Step 5: Commit interactions**

```bash
git add app/interactive.tsx app/page.tsx tests/rendered-html.test.mjs
git commit -m "feat: add temporal reasoning interactions"
```

### Task 5: Apply the visual system and responsive behavior

**Files:**
- Modify: `app/globals.css`
- Create: `public/favicon.svg`
- Delete: `app/_sites-preview/SkeletonPreview.tsx`
- Delete: `app/_sites-preview/preview.css`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add a failing source contract for responsive and accessible CSS**

Assert that `app/globals.css` includes:

```css
@media (max-width: 760px)
@media (prefers-reduced-motion: reduce)
:focus-visible
```

Also assert the starter preview directory and `react-loading-skeleton` dependency are absent.

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test
```

Expected: failure because the starter CSS and dependency remain.

- [ ] **Step 3: Implement the complete visual system**

Use these root tokens:

```css
:root {
  --paper: #fbfaf6;
  --surface: #ffffff;
  --surface-cool: #f2f7fb;
  --ink: #10243e;
  --muted: #60728a;
  --line: #d9e4ee;
  --cyan: #0aa6c7;
  --violet: #7458d8;
  --coral: #ef6f61;
  --lime: #95bf4f;
  --shadow: 0 24px 64px rgba(16, 36, 62, 0.11);
  --radius: 24px;
}
```

Implement:

- A sticky translucent navigation bar.
- A two-column hero with a paper-like forecast card.
- Alternating white and blue-gray research sections.
- Responsive result cards, method flow, finding cards, failure-mode cards, and citation panel.
- Visible focus states, reduced motion, mobile navigation, and print rules.

- [ ] **Step 4: Remove the starter preview and dependency**

```bash
npm uninstall react-loading-skeleton
```

Remove `app/_sites-preview`.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npm test
npm run lint
```

Expected: all tests pass and lint exits successfully with no errors.

- [ ] **Step 6: Commit the finished interface**

```bash
git add app public/favicon.svg package.json package-lock.json tests
git commit -m "feat: finish responsive TimeReasoner interface"
```

### Task 6: Generate the social card, validate, and publish

**Files:**
- Create: `public/og.png`
- Modify: `app/layout.tsx`
- Modify: `.openai/hosting.json`

- [ ] **Step 1: Generate one TimeReasoner-specific social card**

The card brief is:

> 1200×630 landscape academic research card. Warm paper background, ink-navy typography, electric-cyan observed time-series trace transitioning into a coral forecast with a violet reasoning path. Exact text: “TimeReasoner” and “Can Slow-Thinking LLMs Reason Over Time?”. Small badge: “WSDM ’26”. Sophisticated, minimal, crisp, no logos, no extra words.

Inspect the generated text before using it.

- [ ] **Step 2: Add the social image metadata**

```tsx
openGraph: {
  type: "article",
  title: "TimeReasoner: Can Slow-Thinking LLMs Reason Over Time?",
  description: "Training-free, inference-time reasoning for time series forecasting.",
  images: [{ url: "/og.png", width: 1200, height: 630, alt: "TimeReasoner research preview" }],
},
twitter: {
  card: "summary_large_image",
  title: "TimeReasoner",
  description: "Can slow-thinking LLMs reason over time?",
  images: ["/og.png"],
},
```

- [ ] **Step 3: Run full validation**

```bash
npm test
npm run lint
npm run build
```

Verify in the browser at desktop and 390 px mobile widths:

- No horizontal scrolling
- Hero, navigation, result cards, method flow, and citation remain readable
- Strategy switching changes the visible trace
- Citation copy feedback appears
- Console contains no errors

- [ ] **Step 4: Commit the exact validated source**

```bash
git add .
git commit -m "feat: complete TimeReasoner project site"
```

- [ ] **Step 5: Create or reuse the Sites project, push the exact source, save a version, and deploy privately**

Persist the returned opaque project ID in `.openai/hosting.json`, package the exact built commit, save one version, deploy the saved version, and poll until deployment succeeds.

- [ ] **Step 6: Open and return the deployed production URL**

Open the exact successful deployment URL in Codex and provide it as the primary deliverable.
