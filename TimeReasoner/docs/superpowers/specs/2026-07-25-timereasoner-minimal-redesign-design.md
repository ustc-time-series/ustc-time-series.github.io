# TimeReasoner Minimal Redesign

## Goal

Refine the existing TimeReasoner project page into a restrained academic
homepage. Preserve the paper facts, downloadable assets, benchmark evidence,
accessibility, and public URL while removing visual elements that make the
current page feel like a product landing page.

## Approved direction

The user explicitly requested a simpler design and previously asked the work
to proceed without clarification. The redesign therefore uses a conventional
academic-paper visual language:

- white page with charcoal text;
- one muted blue accent for links and small labels;
- a narrow centered reading column with wider figures and tables;
- thin rules instead of cards, shadows, gradients, glowing backgrounds, or
  decorative illustrations;
- compact typography and generous whitespace;
- quiet, text-first navigation and resource links.

## Page structure

1. **Header** — a small TimeReasoner wordmark and plain anchor links.
2. **Publication hero** — venue, paper title, subtitle, authors, affiliation,
   and four simple resource buttons. The decorative signal illustration is
   removed.
3. **Study summary** — the research question followed by four inline study
   statistics and a three-step Observe / Deliberate / Forecast sequence.
4. **Method** — short introduction, the original framework figure, and four
   compact method descriptions separated by rules.
5. **Results** — the five highlighted benchmark results in a readable table.
6. **Findings** — four ablation findings and three horizon strategies rendered
   as simple numbered rows.
7. **Limitations** — uncertainty summary, the reasoning and failure figures,
   and the four documented failure modes on the same white canvas.
8. **Abstract and citation** — concise paper summary and copyable BibTeX.

## Visual constraints

- No gradients, blurred backgrounds, decorative grids, floating orbs, rotated
  panels, dark full-width sections, or hover translation effects.
- No box shadows and no large pill-shaped containers.
- Use borders only where they improve scanning: navigation, resource buttons,
  figures, table rows, and section dividers.
- Keep section widths and type sizes responsive. On mobile, navigation may
  wrap, columns become one column, and the benchmark table remains horizontally
  scrollable.
- Preserve visible keyboard focus, reduced-motion support, a skip link,
  semantic headings, descriptive figure alternatives, and 44-pixel touch
  targets.

## Content constraints

All publication facts, links, author names, reported metrics, benchmark values,
failure modes, the supplied paper PDF, paper figures, metadata, JSON-LD, and
BibTeX remain intact. The redesign changes presentation and trims duplicated
marketing copy; it does not change the paper's claims.

## Acceptance criteria

- The first viewport is text-first and contains no decorative signal panel.
- The stylesheet contains no gradients, backdrop filters, box shadows, or
  rotation effects.
- Every existing publication link and required content section remains present.
- The production build, lint, and rendered-HTML tests pass.
- The validated revision replaces the existing public deployment at the same
  URL and remains accessible without sign-in.
