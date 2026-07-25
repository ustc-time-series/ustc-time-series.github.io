/* eslint-disable @next/next/no-img-element -- paper figures are pre-cropped static assets and do not need a runtime image optimizer */
import Link from "next/link";
import { CopyBibtex } from "./components/CopyBibtex";

const PAPER_URL = "/TimeReasoner.pdf";
const CODE_URL = "https://github.com/realwangjiahao/TimeReasoner";
const DOI_URL = "https://doi.org/10.1145/3773966.3777931";

const authors = [
  "Mingyue Cheng",
  "Jiahao Wang",
  "Daoyu Wang",
  "Xiaoyu Tao",
  "Qi Liu",
  "Enhong Chen",
];

const benchmarkRows = [
  {
    dataset: "ETTh1",
    domain: "Electricity",
    ours: "5.4469",
    baseline: "6.8152",
    delta: "20.1%",
  },
  {
    dataset: "ETTh2",
    domain: "Electricity",
    ours: "8.6020",
    baseline: "9.7156",
    delta: "11.5%",
  },
  {
    dataset: "AQWan",
    domain: "Environment",
    ours: "11,305.6345",
    baseline: "12,528.5571",
    delta: "9.8%",
  },
  {
    dataset: "AQShunyi",
    domain: "Environment",
    ours: "12,874.9412",
    baseline: "15,596.0312",
    delta: "17.4%",
  },
  {
    dataset: "Wind",
    domain: "Energy",
    ours: "1,556.5316",
    baseline: "1,600.0376",
    delta: "2.7%",
  },
];

const capabilities = [
  {
    icon: "🧩",
    title: "Hybrid Instruction",
    text: "Task directives, timestamps, raw sequential values, and optional context are combined into one structured prompt.",
  },
  {
    icon: "🧠",
    title: "Slow-Thinking Reasoning",
    text: "A pretrained reasoning LLM inspects trends, seasonality, shifts, and anomalies without changing its weights.",
  },
  {
    icon: "🔀",
    title: "Multiple Strategies",
    text: "One-shot, decoupled, and rollout strategies trade deliberation depth against iterative error accumulation.",
  },
  {
    icon: "🔍",
    title: "Reasoning Exploration",
    text: "Iteration, reflection, backtracking, and repeated generations expose a rationale together with uncertainty.",
  },
];

const failureModes = [
  "Peak clipping",
  "Phase-shift error",
  "Copy-paste repeat",
  "Constant collapse",
];

const bibtex = `@inproceedings{cheng2026timereasoner,
  title     = {Can Slow-Thinking LLMs Reason Over Time?
               Empirical Studies in Time Series Forecasting},
  author    = {Cheng, Mingyue and Wang, Jiahao and Wang, Daoyu
               and Tao, Xiaoyu and Liu, Qi and Chen, Enhong},
  booktitle = {Proceedings of the Nineteenth ACM International
               Conference on Web Search and Data Mining},
  series    = {WSDM '26},
  year      = {2026},
  pages     = {99--110},
  doi       = {10.1145/3773966.3777931}
}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  headline:
    "Can Slow-Thinking LLMs Reason Over Time? Empirical Studies in Time Series Forecasting",
  name: "TimeReasoner",
  author: authors.map((name) => ({ "@type": "Person", name })),
  datePublished: "2026",
  isPartOf: {
    "@type": "PublicationIssue",
    name: "WSDM 2026",
  },
  sameAs: [DOI_URL, CODE_URL],
  about: [
    "Time series forecasting",
    "Large language models",
    "Inference-time reasoning",
  ],
};

function ResourceLinks() {
  return (
    <div className="publication-links" aria-label="Publication resources">
      <Link className="resource-button pill-button" href="/leaderboard">
        <span aria-hidden="true">▦</span>
        <span>Leaderboard</span>
      </Link>
      <a className="resource-button pill-button" href={PAPER_URL}>
        <span aria-hidden="true">▤</span>
        <span>Paper</span>
      </a>
      <a
        className="resource-button pill-button"
        href={CODE_URL}
        target="_blank"
        rel="noreferrer"
      >
        <span aria-hidden="true">◉</span>
        <span>Code</span>
      </a>
      <a
        className="resource-button pill-button"
        href={DOI_URL}
        target="_blank"
        rel="noreferrer"
      >
        <span aria-hidden="true">↗</span>
        <span>DOI</span>
      </a>
      <a className="resource-button pill-button" href="#BibTeX">
        <span aria-hidden="true">@</span>
        <span>BibTeX</span>
      </a>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <details className="resources-control">
        <summary>
          <span aria-hidden="true">⚗</span>
          Resources
          <span className="dropdown-arrow" aria-hidden="true">
            ⌄
          </span>
        </summary>
        <nav className="resources-menu" aria-label="Publication resources">
          <Link href="/leaderboard">Leaderboard</Link>
          <a href={PAPER_URL}>Paper</a>
          <a href={CODE_URL} target="_blank" rel="noreferrer">
            Code
          </a>
          <a href={DOI_URL} target="_blank" rel="noreferrer">
            DOI
          </a>
          <a href="#BibTeX">BibTeX</a>
        </nav>
      </details>

      <main id="main-content">
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

              <p className="publication-venue">WSDM 2026</p>

              <p className="publication-authors" aria-label="Authors">
                {authors.map((author, index) => (
                  <span className="author-block" key={author}>
                    <span className="author-name">{author}</span>
                    <sup>1</sup>
                    {index < authors.length - 1 ? "," : ""}
                  </span>
                ))}
              </p>

              <p className="affiliation">
                <sup>1</sup>State Key Laboratory of Cognitive Intelligence,
                University of Science and Technology of China, Hefei, China
              </p>

              <ResourceLinks />
            </div>
          </div>
        </section>

        <section
          className="paper-section light-section"
          id="performance"
        >
          <div className="wide-container">
            <h2 className="section-title">💪 Performance</h2>

            <div
              className="table-scroll"
              role="region"
              aria-label="TimeReasoner benchmark highlights"
              tabIndex={0}
            >
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Dataset</th>
                    <th>Domain</th>
                    <th>TimeReasoner MSE</th>
                    <th>Best Listed Baseline</th>
                    <th>Lower By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="summary-row">
                    <td>🏆</td>
                    <td colSpan={2}>
                      <strong>Best MSE on 5 of 10 datasets</strong>
                    </td>
                    <td>
                      <strong>Training-free</strong>
                    </td>
                    <td>Table 2</td>
                    <td>Lower is better</td>
                  </tr>
                  {benchmarkRows.map((row, index) => (
                    <tr className="win-row" key={row.dataset}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{row.dataset}</strong>
                      </td>
                      <td>{row.domain}</td>
                      <td className="best-value">{row.ours}</td>
                      <td>{row.baseline}</td>
                      <td className="best-value">↓ {row.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="justified-content performance-note">
              <p>
                TimeReasoner evaluates slow-thinking language models with{" "}
                <strong>0 task-specific training</strong> across{" "}
                <strong>10 datasets</strong>, <strong>5 real-world domains</strong>,
                and <strong>3 reasoning strategies</strong>. It reports the
                lowest MSE among the listed baselines on the five datasets
                above while remaining competitive on the others. The table
                reproduces values from Table 2 of the paper and does not imply
                universal superiority at every horizon.
              </p>
            </div>
          </div>
        </section>

        <section className="paper-section light-section" id="abstract">
          <div className="wide-container">
            <div className="centered-copy">
              <h2 className="section-title">📖 Abstract</h2>
              <div className="justified-content">
                <p>
                  Time series forecasting traditionally relies on fast-thinking
                  paradigms that map historical observations directly to future
                  sequences. <strong>TimeReasoner</strong> instead reformulates
                  forecasting as <strong>conditional reasoning</strong>{" "}
                  performed entirely at inference time. It combines task
                  directives, timestamps, sequential values, and optional
                  context to induce multi-step temporal reasoning in pretrained
                  slow-thinking LLMs. Across diverse benchmarks, these models
                  outperform prior baselines on several complex datasets or
                  achieve competitive training-free performance. The study also
                  analyzes prompt construction, strategies, uncertainty,
                  reasoning traces, and recurring failure modes, showing both
                  the promise and limits of reasoning-centric forecasting.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="paper-section" id="motivation">
          <div className="wide-container">
            <h2 className="section-title">✨ Motivation</h2>
            <figure className="centered-figure">
              <img
                src="/framework.png"
                width="1695"
                height="760"
                loading="lazy"
                decoding="async"
                alt="TimeReasoner framework: hybrid instructions enter a slow-thinking LLM, which uses one-shot, decoupled, or rollout reasoning to produce a forecast and reasoning trajectory"
              />
              <figcaption>
                Figure 1: TimeReasoner reframes time series forecasting as
                inference-time reasoning rather than direct pattern matching.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="paper-section light-section" id="features">
          <div className="wide-container">
            <h2 className="section-title">⚙️ Key Features</h2>

            <figure className="centered-figure feature-figure">
              <img
                src="/reasoning-case.png"
                width="1690"
                height="390"
                loading="lazy"
                decoding="async"
                alt="Representative TimeReasoner reasoning case: the model identifies patterns and seasonality, considers a forecasting method, revisits recent data, and produces a seasonal forecast"
              />
              <figcaption>
                Figure 2: A representative diagnostic–select–verify reasoning
                trajectory for a 96-step forecast.
              </figcaption>
            </figure>

            <div className="feature-grid">
              {capabilities.map((capability) => (
                <article className="feature-card" key={capability.title}>
                  <h3>
                    <span aria-hidden="true">{capability.icon}</span>{" "}
                    {capability.title}
                  </h3>
                  <p>{capability.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="paper-section" id="analysis">
          <div className="wide-container">
            <h2 className="section-title">
              🌟 Analysis &amp; Limitations
            </h2>

            <figure className="centered-figure">
              <img
                src="/failure-modes.png"
                width="1690"
                height="360"
                loading="lazy"
                decoding="async"
                alt="Four representative TimeReasoner failure modes: peak clipping, phase-shift error, copy-paste repeat, and constant collapse"
              />
              <figcaption>
                Figure 3: Representative failure patterns documented in the
                TimeReasoner study.
              </figcaption>
            </figure>

            <div className="justified-content analysis-copy">
              <p>
                The paper complements its accuracy results with controlled
                studies of the reasoning process:
              </p>
              <ul>
                <li>
                  <strong>Uncertainty.</strong> Repeating inference over 50
                  independent generations exposes a reported 80% prediction
                  interval that generally widens with the forecast horizon.
                </li>
                <li>
                  <strong>Horizon-aware strategies.</strong> Rollout performs
                  best at shorter horizons, decoupled reflection becomes
                  stronger at longer horizons, and one-shot remains a robust
                  default across settings.
                </li>
                <li>
                  <strong>Failure modes.</strong> Manual inspection identifies{" "}
                  {failureModes.map((mode, index) => (
                    <span key={mode}>
                      <strong>{mode}</strong>
                      {index < failureModes.length - 1 ? ", " : "."}
                    </span>
                  ))}
                </li>
                <li>
                  <strong>Reasoning depth.</strong> Longer chains of thought are
                  not automatically better; calibrated reasoning is more useful
                  than maximal verbosity.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="paper-section" id="BibTeX">
          <div className="wide-container">
            <h2 className="section-title bibtex-title">🔖 BibTeX</h2>
            <CopyBibtex bibtex={bibtex} />
          </div>
        </section>
      </main>

      <footer>
        <div className="wide-container footer-content">
          <p>
            TimeReasoner · WSDM 2026 · Paper content © the authors under CC BY
            4.0.
          </p>
          <p>
            Homepage style follows{" "}
            <a
              href="https://paperarena-ai.github.io/"
              target="_blank"
              rel="noreferrer"
            >
              PaperArena
            </a>
            .
          </p>
        </div>
      </footer>

      <a className="scroll-to-top" href="#top" aria-label="Back to top">
        ↑
      </a>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
