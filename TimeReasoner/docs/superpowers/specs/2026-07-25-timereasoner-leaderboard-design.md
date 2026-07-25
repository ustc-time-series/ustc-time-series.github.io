# TimeReasoner Filterable Leaderboard Design

## Goal

Add a public `/leaderboard` page to the existing TimeReasoner project site. The page lets readers compare all models reported in Table 2 of the paper under a selected metric and dataset scope, while preserving the current PaperArena-inspired visual system.

## Source of truth

- Scores come only from Table 2 of `public/TimeReasoner.pdf`.
- The matrix contains 11 models, 10 datasets, and two lower-is-better metrics: MSE and MAE.
- Dataset domains come from Table 1.
- Forecast horizons follow Section 5.3: `H=36` for NASDAQ, `H=200` for VitalDB, and `H=96` for all other datasets.
- Displayed values retain the four decimal places reported in the paper.

## Interaction model

The page provides two controls:

1. **Metric:** switch between MSE and MAE.
2. **Dataset scope:** choose all datasets or one of the five domains, then refine the active set with individual dataset chips.

Changing a domain preset selects every dataset in that preset. Manually toggling a dataset changes the scope to `Custom`. Selecting no datasets shows an explanatory empty state instead of a ranking.

The default view uses MSE across all ten datasets.

## Ranking method

Raw errors cannot be averaged across datasets because their units and scales differ substantially. The leaderboard therefore:

1. ranks every model independently on each selected dataset, with lower values ranked higher;
2. gives equal reported values the same competition rank;
3. averages those per-dataset ranks for each model;
4. sorts by average rank, then by first-place count, then alphabetically.

The table exposes the raw reported value and per-dataset rank, so the aggregate is auditable. A methodology note explains that the aggregate is a comparison aid, not an additional result claimed by the paper.

## Page structure

1. Compact PaperArena-style header with TimeReasoner identity, page title, Home, Paper, and Code links.
2. Introductory copy naming Table 2 and the lower-is-better convention.
3. White filter panel containing metric controls, scope presets, and dataset chips.
4. Live summary showing selected dataset count and the current leading model.
5. Responsive ranking table with:
   - overall rank;
   - model and model family;
   - average rank;
   - first-place count;
   - one raw-score column for each selected dataset.
6. Methodology and evaluation-protocol notes.

The table scrolls horizontally on narrow screens. The TimeReasoner row receives a restrained blue tint; no charts, decorative dashboard widgets, or new visual language are introduced.

## Architecture

- `app/data/leaderboard.ts`: typed paper data, dataset metadata, score formatting, and pure ranking logic.
- `app/leaderboard/LeaderboardExplorer.tsx`: client-side filter state and accessible controls.
- `app/leaderboard/page.tsx`: route metadata, page shell, explanatory copy, and resource links.
- `app/globals.css`: leaderboard styles using the existing colors, typography, cards, and responsive breakpoint.
- `app/page.tsx`: add a direct Leaderboard entry without changing the homepage section structure.

No database, authentication, network request, or new package is required.

## Accessibility and failure handling

- Metric and dataset buttons expose pressed state.
- Controls have fieldset legends and descriptive labels.
- Ranking updates are announced through a polite live region.
- The table remains keyboard-scrollable.
- The empty dataset selection has a clear recovery action.
- The page remains fully usable without JavaScript for its initial all-dataset server-rendered content.

## Verification

- Unit tests confirm all 220 reported scores are present, selected anchor values match Table 2, and ranking/tie behavior is deterministic.
- Render tests confirm `/leaderboard` returns a complete page with all controls, datasets, models, and methodology copy.
- Existing homepage tests remain green and confirm the new entry link.
- Build, lint, responsive source checks, and public deployment complete before handoff.
