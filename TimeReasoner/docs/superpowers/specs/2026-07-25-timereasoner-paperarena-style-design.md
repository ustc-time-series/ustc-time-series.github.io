# TimeReasoner PaperArena-Style Redesign

## Goal

Restyle the TimeReasoner paper homepage to follow the current PaperArena
homepage as closely as possible. PaperArena is the sole visual reference. The
redesign must not introduce a separate TimeReasoner design system, novel
layouts, decorative motifs, or additional product-style components.

## Reference measurements

The following values were measured from the live PaperArena homepage on
2026-07-25 and are the implementation source of truth:

- font stack: Inter, Segoe UI, system sans-serif;
- maximum content width: 1152px;
- body text: 16px, `#1e293b`, line-height 1.6;
- primary blue: `#2563eb`;
- secondary text: `#64748b`;
- light section background: `#f8fafc`;
- border: `#e2e8f0`;
- project wordmark: 56px, weight 800, purple-to-pink gradient;
- paper title: 25.6px, weight 600, `#4a5568`;
- section padding: 48px 24px;
- section headings: centered, 32px, weight 700;
- resource buttons: dark `#1e293b`, white text, fully rounded, 40px tall;
- feature boxes: two columns, white background, 20px padding, 6px radius,
  subtle Bulma-style shadow;
- BibTeX surface: `#f1f5f9`, 12px radius, 24px padding.

## Page mapping

The page follows the PaperArena order rather than the previous TimeReasoner
information architecture:

1. **Hero** — a small TimeReasoner mark beside a purple gradient
   “TimeReasoner” wordmark; full paper title; authors in PaperArena blue;
   affiliation in muted gray; dark pill links for Paper, Code, DOI, and BibTeX.
2. **Performance** — a light section headed `💪 Performance`; a wide
   PaperArena-style table containing the five datasets on which TimeReasoner
   reports the best MSE, followed by a short, justified results note.
3. **Abstract** — a second light section headed `📖 Abstract`; one centered
   four-fifths-width justified paragraph with selected bold phrases.
4. **Motivation** — a white section headed `✨ Motivation`; the supplied
   framework figure and a centered italic caption.
5. **Key Features** — a light section headed `⚙️ Key Features`; the supplied
   reasoning-case figure followed by four two-column white feature boxes.
6. **Analysis & Limitations** — a white section headed
   `🌟 Analysis & Limitations`; the supplied failure-mode figure and a
   justified bullet list covering uncertainty, horizon-aware strategies, and
   documented failure patterns.
7. **BibTeX** — a white section headed `🔖 BibTeX`; the existing copy control
   presented in the PaperArena code-block style.
8. **Footer** — a light, centered footer with the paper venue and license.

## Interaction mapping

- A fixed top-right `Resources` control copies PaperArena's `More Works`
  placement, border, radius, and shadow. It opens a compact list of Paper,
  Code, DOI, and BibTeX links.
- Resource buttons reproduce PaperArena's dark pill hover behavior.
- The existing BibTeX copy action remains, with visible copied feedback and
  an assistive-technology announcement.
- A small fixed scroll-to-top button follows PaperArena's placement and color.
- No sticky navigation bar is used because PaperArena does not use one.

## Content and asset constraints

- Keep all paper facts, authors, affiliation, benchmark values, PDF, GitHub
  URL, DOI, BibTeX, JSON-LD, metadata, and three supplied paper figures.
- Do not copy PaperArena's mascot, text, benchmark data, or research claims.
- Use simple text or Unicode marks for icons; do not add a new icon library.
- Preserve responsive table scrolling, keyboard focus, reduced-motion
  handling, semantic sections, descriptive image alternatives, and the skip
  link.
- Retain the current public URL and public access setting.

## Acceptance criteria

- Rendered HTML follows the seven PaperArena section headings and order.
- Source contains a gradient TimeReasoner wordmark, fixed resources control,
  dark pill links, alternating light sections, two-column feature boxes, and a
  PaperArena-style BibTeX block.
- The previous minimal sticky header, ruled fact grid, process list, and custom
  editorial section layout are absent.
- Production build, lint, and rendered-HTML tests pass.
- The updated version is published at the existing public URL without login.
