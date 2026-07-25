# TimeReasoner Academic Project Page Design

## Goal

Create a polished, single-page academic homepage for the WSDM 2026 paper
“Can Slow-Thinking LLMs Reason Over Time? Empirical Studies in Time Series
Forecasting.” The page should let a reviewer, researcher, or practitioner
understand the paper’s question, method, evidence, and limitations within one
minute, while keeping the paper and code one click away.

## Source of truth

Page claims and numbers come from the supplied 12-page paper. The reference
site, PaperArena, supplies the overall academic-project-page rhythm: a centered
publication hero, prominent resource buttons, evidence near the top, clear
paper sections, full-width figures, BibTeX, and attribution. TimeReasoner will
use its own visual identity and information hierarchy rather than copying the
reference site’s mascot, color treatment, leaderboard, or component styling.

## Visual direction

The page uses a bright editorial canvas with deep ink, electric indigo, cyan,
and warm amber. A subtle time grid and a CSS-built signal trace make temporal
reasoning visible without relying on decorative stock imagery. Large,
high-contrast typography and restrained rounded cards keep the page credible
as a research artifact. The visual motif is a sequence moving from observed
history to a deliberation zone and then to a forecast horizon.

The first viewport contains:

- a compact sticky navigation bar;
- a WSDM 2026 venue badge;
- the full paper title, authors, affiliation, and resource actions;
- a CSS-only “Observe → Deliberate → Forecast” signal panel;
- a short thesis statement that distinguishes conditional reasoning from
  direct sequence mapping.

## Content architecture

1. **Hero** — venue, title, authors, affiliation, Paper, Code, DOI, and Cite.
2. **Research thesis** — TimeReasoner reframes forecasting as training-free
   conditional reasoning performed at inference time.
3. **At a glance** — 0 task-specific training, 10 datasets, 5 domains, and
   3 reasoning strategies.
4. **Method** — the supplied framework figure and four concise capability
   cards: hybrid instruction, slow-thinking inference, reasoning strategies,
   and reasoning exploration.
5. **Evidence** — a compact benchmark table highlighting the five datasets on
   which TimeReasoner reports the best MSE in Table 2, plus careful explanatory
   copy that avoids implying universal dominance.
6. **What the study reveals** — timestamps matter, raw values outperform the
   tested normalization variants, reasoning strategy depends on horizon, and
   longer reasoning is not automatically better.
7. **Trustworthiness** — uncertainty and representative reasoning visuals,
   followed by the four documented failure modes: peak clipping, phase shift,
   copy-paste repetition, and constant collapse.
8. **Abstract and citation** — paper abstract, copyable BibTeX, license and
   project-page attribution.

## Interaction design

- Sticky navigation links scroll to major sections.
- Resource links expose clear hover and keyboard focus states.
- “Cite” scrolls to BibTeX; “Copy BibTeX” copies the citation and provides a
  visible success state announced to assistive technology.
- “More” uses the native `details` element, avoiding fragile navigation state.
- Signal-line motion and reveal effects stop when the user prefers reduced
  motion.
- The page remains fully useful without client-side JavaScript apart from the
  copy convenience.

## Responsive and accessibility requirements

- The hero, figures, cards, and data table collapse cleanly below 760px.
- The benchmark table gets an explicit horizontal scroll container on narrow
  screens.
- The page has a skip link, semantic landmarks, descriptive figure text,
  sufficient contrast, visible focus rings, and touch targets at least 44px
  tall.
- Decorative time-grid and signal elements are hidden from assistive
  technology.

## Assets

- `public/TimeReasoner.pdf`: the supplied paper.
- `public/framework.png`: Figure 1 cropped from the supplied paper.
- `public/reasoning-case.png`: Figure 9 cropped from the supplied paper.
- `public/failure-modes.png`: Figure 10 cropped from the supplied paper.
- `public/og.png`: one bespoke social card matching the finished visual system,
  generated only after the page copy and palette are stable.

## Acceptance criteria

- The production build and rendered-HTML tests pass with no starter preview
  metadata or starter dependency.
- The page contains every section above and all publication facts match the
  supplied paper.
- Paper, code, DOI, in-page navigation, and BibTeX controls have valid targets.
- No content overflows at the defined responsive breakpoints.
- The exact validated source is saved and deployed as an owner-only Sites
  production version.
