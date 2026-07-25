import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "https://timereasoner.example/"), {
      headers: { accept: "text/html", host: "timereasoner.example" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete TimeReasoner academic project page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  assert.match(
    html,
    /<title>TimeReasoner \| Slow-Thinking Time Series Forecasting<\/title>/i,
  );
  assert.match(html, /Can Slow-Thinking LLMs Reason Over Time\?/);
  assert.match(html, /WSDM(?:\s|&nbsp;|<!-- -->)*2026/i);
  for (const author of [
    "Mingyue Cheng",
    "Jiahao Wang",
    "Daoyu Wang",
    "Xiaoyu Tao",
    "Qi Liu",
    "Enhong Chen",
  ]) {
    assert.match(html, new RegExp(author));
  }

  assert.match(html, /href="\/TimeReasoner\.pdf"/);
  assert.match(
    html,
    /href="https:\/\/github\.com\/realwangjiahao\/TimeReasoner"/,
  );
  assert.match(
    html,
    /href="https:\/\/doi\.org\/10\.1145\/3773966\.3777931"/,
  );
  assert.match(html, /href="\/leaderboard"/);
  assert.match(html, />Leaderboard</);
  assert.match(html, /href="#BibTeX"/);
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/timereasoner\.example\/og\.png"/i,
  );
  assert.match(
    html,
    /<meta name="twitter:image" content="https:\/\/timereasoner\.example\/og\.png"/i,
  );

  for (const section of [
    "performance",
    "abstract",
    "motivation",
    "features",
    "analysis",
    "BibTeX",
  ]) {
    assert.match(html, new RegExp(`id="${section}"`));
  }

  assert.match(
    html,
    /0(?:<!-- -->|\s|<[^>]+>)*task-specific training/i,
  );
  assert.match(html, /10(?:<!-- -->|\s|<[^>]+>)*datasets/i);
  assert.match(html, /5(?:<!-- -->|\s|<[^>]+>)*real-world domains/i);
  assert.match(
    html,
    /3(?:<!-- -->|\s|<[^>]+>)*reasoning strategies/i,
  );
  assert.match(html, /Peak clipping/i);
  assert.match(html, /Phase-shift error/i);
  assert.match(html, /Copy-paste repeat/i);
  assert.match(html, /Constant collapse/i);
  assert.match(html, /Copy BibTeX/i);
  assert.match(html, /aria-live="polite"/i);

  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
  assert.doesNotMatch(
    html,
    /Your site is taking shape|Your first version will appear here/i,
  );
});

test("server-renders the filterable benchmark leaderboard", async () => {
  const response = await render("/leaderboard");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  assert.match(html, /TimeReasoner Benchmark Leaderboard/);
  assert.match(html, /Benchmark Leaderboard/);
  assert.match(html, /class="paperarena-hero"/);
  assert.match(html, /class="project-wordmark"/);
  assert.match(html, /class="resources-control"/);
  assert.match(html, /class="[^"]*resource-button[^"]*pill-button/);
  assert.match(html, /💪 Model Performance/);
  assert.match(html, /📖 Ranking Method/);
  assert.match(html, /Table 2/);
  assert.match(html, /Average rank/);
  assert.match(html, /Dataset scope/);
  assert.match(html, />MSE</);
  assert.match(html, />MAE</);
  assert.match(html, /TimeReasoner/);
  assert.match(html, /DLinear/);
  assert.match(html, /ETTh1/);
  assert.match(html, /VitalDB/);
  assert.match(html, /Lower is better/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/TimeReasoner\.pdf"/);
  assert.doesNotMatch(
    html,
    /leaderboard-site-header|leaderboard-nav|leaderboard-brand|leaderboard-hero/,
  );
});

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

test("ships accessible leaderboard filtering and responsive styles", async () => {
  const [explorer, css] = await Promise.all([
    readFile(
      new URL("../app/leaderboard/LeaderboardExplorer.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(explorer, /useState/);
  assert.match(explorer, /setMetric/);
  assert.match(explorer, /setSelectedDatasetIds/);
  assert.match(explorer, /rankModels\(metric,\s*selectedDatasetIds\)/);
  assert.match(explorer, /aria-pressed=/);
  assert.match(explorer, /No datasets selected/);
  assert.match(explorer, /Select all datasets/);
  assert.match(explorer, /aria-live="polite"/);

  assert.match(css, /\.leaderboard-filter-panel\s*\{/);
  assert.match(css, /\.leaderboard-table\s*\{/);
  assert.match(css, /\.dataset-chip\[aria-pressed="true"\]/);
  assert.match(css, /\.timereasoner-row/);
  assert.match(css, /@media[^{]*\(max-width:\s*768px\)/);
});

test("ships publication assets and accessible responsive source", async () => {
  const [
    page,
    layout,
    css,
    packageJson,
    paperStats,
    frameworkStats,
    caseStats,
    failureStats,
    socialCardStats,
  ] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    stat(new URL("../public/TimeReasoner.pdf", import.meta.url)),
    stat(new URL("../public/framework.png", import.meta.url)),
    stat(new URL("../public/reasoning-case.png", import.meta.url)),
    stat(new URL("../public/failure-modes.png", import.meta.url)),
    stat(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.ok(paperStats.size > 1_000_000);
  assert.ok(frameworkStats.size > 25_000);
  assert.ok(caseStats.size > 20_000);
  assert.ok(failureStats.size > 20_000);
  assert.ok(socialCardStats.size > 100_000);

  assert.match(page, /href="#main-content"/);
  assert.match(page, /aria-label="Publication resources"/);
  assert.match(page, /<main[^>]+id="main-content"/);
  assert.match(page, /alt="TimeReasoner framework:/);
  assert.match(page, /alt="Representative TimeReasoner reasoning case:/);
  assert.match(page, /alt="Four representative TimeReasoner failure modes:/);
  assert.match(page, /<figure/);

  assert.match(layout, /const metadataBase = new URL/);
  assert.match(layout, /return\s*\{[\s\S]*metadataBase,/);
  assert.match(layout, /openGraph:/);
  assert.match(layout, /twitter:/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/i);

  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media[^{]*\(max-width:\s*768px\)/);
  assert.match(css, /\.table-scroll\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /--primary-color:\s*#2563eb/i);
  assert.match(css, /--background-secondary:\s*#f8fafc/i);
  assert.match(css, /width:\s*min\(1152px,/);
  assert.match(css, /\.gradient-title\s*\{[\s\S]*linear-gradient/s);
  assert.match(
    css,
    /\.pill-button\s*\{[^}]*border-radius:\s*9999px/s,
  );
  assert.match(
    css,
    /\.feature-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s,
  );

  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(
    access(new URL("../app/_sites-preview", import.meta.url)),
  );
  await access(new URL("public/TimeReasoner.pdf", projectRoot));
});
