/* eslint-disable @next/next/no-img-element -- the project mark is a small local static asset */
import type { Metadata } from "next";
import Link from "next/link";
import { LeaderboardExplorer } from "./LeaderboardExplorer";

const PAPER_URL = "/TimeReasoner.pdf";
const CODE_URL = "https://github.com/realwangjiahao/TimeReasoner";

export const metadata: Metadata = {
  title: "TimeReasoner Benchmark Leaderboard",
  description:
    "Filter and compare the model performance reported in Table 2 of the TimeReasoner paper.",
};

export default function LeaderboardPage() {
  return (
    <>
      <a className="skip-link" href="#leaderboard-main">
        Skip to leaderboard
      </a>

      <details className="resources-control">
        <summary>
          <span aria-hidden="true">⚗</span>
          Resources
          <span className="dropdown-arrow" aria-hidden="true">
            ⌄
          </span>
        </summary>
        <nav className="resources-menu" aria-label="Leaderboard resources">
          <Link href="/">Home</Link>
          <a href={PAPER_URL}>Paper</a>
          <a href={CODE_URL} target="_blank" rel="noreferrer">
            Code
          </a>
        </nav>
      </details>

      <main id="leaderboard-main">
        <section className="paperarena-hero" id="top">
          <div className="hero-body">
            <div className="wide-container hero-content">
              <h1 className="project-wordmark">
                <img src="/favicon.svg" alt="" aria-hidden="true" />
                <span className="gradient-title">TimeReasoner</span>
              </h1>

              <h2>Benchmark Leaderboard</h2>
              <p className="paper-subtitle">
                Compare model performance across the datasets reported in Table
                2.
              </p>

              <p className="publication-venue">Table 2 · WSDM 2026</p>

              <div
                className="publication-links"
                aria-label="Leaderboard resources"
              >
                <Link className="resource-button pill-button" href="/">
                  <span aria-hidden="true">←</span>
                  <span>Home</span>
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
              </div>
            </div>
          </div>
        </section>

        <section
          className="paper-section light-section"
          id="model-performance"
        >
          <div className="wide-container">
            <h2 className="section-title">💪 Model Performance</h2>
            <p className="leaderboard-section-intro">
              Select a metric and any combination of domains or datasets. Raw
              values are the published results; lower is better.
            </p>
            <LeaderboardExplorer />
          </div>
        </section>

        <section
          className="paper-section leaderboard-method"
          id="ranking-method"
        >
          <div className="wide-container">
            <h2 className="section-title">📖 Ranking Method</h2>
            <div className="justified-content">
              <p>
                Error scales differ substantially across datasets, so raw MSE
                or MAE values are not averaged directly. Each model is ranked
                independently on every selected dataset, and the leaderboard
                sorts models by their average per-dataset rank. Equal reported
                values receive the same rank. First-place counts break equal
                average ranks.
              </p>
              <p>
                This aggregate ranking is an interactive comparison aid derived
                from Table 2, not an additional experimental claim in the
                paper. The original evaluation uses forecast horizon H=36 for
                NASDAQ, H=200 for VitalDB, and H=96 for all other datasets.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wide-container footer-content">
          <p>TimeReasoner benchmark results · Table 2 · WSDM 2026</p>
          <p>
            <Link href="/">Return to the project homepage</Link>
          </p>
        </div>
      </footer>
    </>
  );
}
