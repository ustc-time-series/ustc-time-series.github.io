# TimeReasoner Filterable Leaderboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public, PaperArena-style leaderboard page that ranks all Table 2 models under a user-selected metric and dataset scope.

**Architecture:** Keep the paper matrix and pure ranking functions in one typed data module. Server-render the route shell and initial all-dataset ranking, then use a focused client component for metric, domain, and dataset selection. Reuse the existing global design tokens and deployment flow.

**Tech Stack:** Next.js-compatible Vinext, React 19, TypeScript, CSS, Node test runner, OpenAI Sites.

---

### Task 1: Paper data and ranking logic

**Files:**
- Create: `app/data/leaderboard.ts`
- Create: `tests/leaderboard-data.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing data-contract tests**

Create tests that import `DATASETS`, `MODEL_RESULTS`, `rankModels`, and `formatScore`, then assert:

```js
assert.equal(DATASETS.length, 10);
assert.equal(MODEL_RESULTS.length, 11);
assert.equal(
  MODEL_RESULTS.flatMap((model) =>
    Object.values(model.scores).flat(),
  ).length,
  220,
);
assert.equal(timeReasoner.scores.MSE[0], 5.4469);
assert.equal(timeReasoner.scores.MAE[9], 6.9735);
assert.equal(patchTST.scores.MSE[5], 12528.5571);
assert.equal(rankModels("MSE", ["ETTh1"])[0].model.name, "TimeReasoner");
assert.equal(rankModels("MSE", ["NASDAQ"])[0].datasetRanks.NASDAQ, 1);
assert.equal(formatScore(0.0008), "0.0008");
```

Add `tests/leaderboard-data.test.mjs` to the existing `node --test` command.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test tests/leaderboard-data.test.mjs
```

Expected: fail because `app/data/leaderboard.ts` does not exist.

- [ ] **Step 3: Implement the typed Table 2 matrix**

Define:

```ts
export type Metric = "MSE" | "MAE";

export type Dataset = {
  id: string;
  label: string;
  domain: "Electricity" | "Environment" | "Economy" | "Energy" | "Healthcare";
  horizon: number;
};

export type ModelResult = {
  name: string;
  family: string;
  scores: Record<Metric, readonly number[]>;
};
```

Enter all 11 model rows and both 10-value metric arrays exactly as reported in Table 2. Define the ten dataset records in table order and attach the horizons reported in Section 5.3.

- [ ] **Step 4: Implement deterministic ranking**

For every selected dataset, assign competition ranks in ascending score order. Build each model’s selected values, per-dataset ranks, mean rank, and first-place count. Sort by:

```ts
a.meanRank - b.meanRank ||
b.wins - a.wins ||
a.model.name.localeCompare(b.model.name)
```

Return an empty array when no valid dataset IDs are selected. Format every raw score with `value.toFixed(4)`.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test tests/leaderboard-data.test.mjs
npm test
```

Expected: all data and existing page tests pass.

Commit:

```bash
git add app/data/leaderboard.ts tests/leaderboard-data.test.mjs package.json
git commit -m "feat: add paper leaderboard data"
```

### Task 2: Server-rendered leaderboard route

**Files:**
- Create: `app/leaderboard/page.tsx`
- Create: `app/leaderboard/LeaderboardExplorer.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Write the failing route contract**

Generalize the render helper to accept a pathname and add a `/leaderboard` test asserting:

```js
assert.equal(response.status, 200);
assert.match(html, /Benchmark Leaderboard/);
assert.match(html, /Table 2/);
assert.match(html, /Average rank/);
assert.match(html, /Dataset scope/);
assert.match(html, /MSE/);
assert.match(html, /MAE/);
assert.match(html, /TimeReasoner/);
assert.match(html, /DLinear/);
assert.match(html, /VitalDB/);
assert.match(html, /Lower is better/);
assert.match(html, /aria-live="polite"/);
```

- [ ] **Step 2: Run the route test and verify RED**

Run:

```bash
npm test
```

Expected: `/leaderboard` does not render the required page.

- [ ] **Step 3: Add the server page shell**

Create page metadata titled `TimeReasoner Benchmark Leaderboard`. Render:

- a skip link;
- compact TimeReasoner wordmark;
- Home, Paper, and Code pill links;
- `Benchmark Leaderboard` heading and Table 2 explanation;
- `<LeaderboardExplorer />`;
- ranking-method and evaluation-protocol notes;
- footer.

- [ ] **Step 4: Add initial client component markup**

Mark the component `"use client"`. Initialize:

```ts
const [metric, setMetric] = useState<Metric>("MSE");
const [selectedDatasetIds, setSelectedDatasetIds] = useState(
  DATASETS.map((dataset) => dataset.id),
);
```

Render accessible metric buttons, scope buttons, dataset buttons, live summary, and the complete initial ranking table.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm test
```

Expected: all route and data tests pass.

Commit:

```bash
git add app/leaderboard tests/rendered-html.test.mjs
git commit -m "feat: add leaderboard route"
```

### Task 3: Filtering behavior and PaperArena styling

**Files:**
- Modify: `app/leaderboard/LeaderboardExplorer.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Write failing source-contract tests**

Require the source to contain:

```js
assert.match(explorer, /aria-pressed=/);
assert.match(explorer, /setSelectedDatasetIds/);
assert.match(explorer, /rankModels\(metric, selectedDatasetIds\)/);
assert.match(explorer, /No datasets selected/);
assert.match(css, /\.leaderboard-filter-panel/);
assert.match(css, /\.leaderboard-table/);
assert.match(css, /\.dataset-chip\[aria-pressed="true"\]/);
assert.match(css, /@media[^{]*\(max-width:\s*768px\)/);
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npm test
```

Expected: fail because the complete filtering and style contracts are absent.

- [ ] **Step 3: Complete filter behavior**

Provide presets for `All`, `Electricity`, `Environment`, `Economy`, `Energy`, and `Healthcare`. A preset replaces the selected dataset array with that group. Dataset buttons toggle one ID and make the visible preset label `Custom`. Add `Select all` and `Clear` actions.

Recompute:

```ts
const rankedModels = rankModels(metric, selectedDatasetIds);
const selectedDatasets = DATASETS.filter((dataset) =>
  selectedDatasetIds.includes(dataset.id),
);
```

When the array is empty, render an explanatory empty state and a `Select all datasets` button.

- [ ] **Step 4: Add restrained matching styles**

Use the existing `--primary-color`, `--background-secondary`, border, card-shadow, 1152px container, 32px headings, dark pill buttons, and 768px breakpoint. Keep the filter panel white, dataset chips compact, the table horizontally scrollable, and the TimeReasoner row pale blue.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
npm test
npm run lint
git diff --check
```

Expected: all checks pass.

Commit:

```bash
git add app/leaderboard/LeaderboardExplorer.tsx app/globals.css tests/rendered-html.test.mjs
git commit -m "feat: add leaderboard filters"
```

### Task 4: Homepage entry and final validation

**Files:**
- Modify: `app/page.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Write the failing homepage-link assertion**

Add:

```js
assert.match(html, /href="\/leaderboard"/);
assert.match(html, />Leaderboard</);
```

- [ ] **Step 2: Run and verify RED**

Run:

```bash
npm test
```

Expected: fail because the homepage has no leaderboard link.

- [ ] **Step 3: Add the entry**

Add `Leaderboard` to the hero resource pills and fixed resource menu without changing the homepage section order.

- [ ] **Step 4: Run full verification**

Run:

```bash
npm test
npm run lint
git diff --check
git status --short
```

Expected: all tests pass, lint has no errors, and only intended files are committed.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx tests/rendered-html.test.mjs
git commit -m "feat: link benchmark leaderboard"
```

### Task 5: Integrate and publish

**Files:**
- No additional source files.

- [ ] **Step 1: Merge the feature branch into `main`**

Use a fast-forward merge and preserve the unrelated `feature/timereasoner-homepage` worktree.

- [ ] **Step 2: Verify the merged source**

Run:

```bash
npm test
npm run lint
git diff --check
```

- [ ] **Step 3: Publish the exact validated commit**

Push the `main` commit to the existing Sites source repository, package the matching `dist` build, save one new version, and deploy it to the existing public project in `.openai/hosting.json`.

- [ ] **Step 4: Confirm production**

Poll until the deployment succeeds. Confirm the site remains `public` and `/leaderboard` opens without a login gate.
