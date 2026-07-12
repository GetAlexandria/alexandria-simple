---
id: FEAT-103
title: "Populate area: on all 141 library cards (per-layer commit batches)"
outcome: O-5
tier: must
enabler: false
blocked-by: [FEAT-097]
blocks: [FEAT-104, FEAT-105]
cards: [Section - Card Repository, Standard - Card Frontmatter Schema, Artifact - Type Taxonomy]
---

## Motivation

Cards do not yet self-declare their knowledge area. FEAT-097 teaches the CLI
and parser how to read `area:`, but the live feature remains empty until cards
actually carry that field. The scoreboard infers
area attribution via the `getAreaMatchers` path-based heuristic table,
which plan.md analysis showed misfiles ~5/24 sampled cards (every Principle
and Standard is forced into area 1.2 regardless of content).

Until cards have `area:` populated in frontmatter, the scoreboard cannot
be switched to a frontmatter-driven attribution mechanism (FEAT-104), and
the matcher table cannot retire. This ticket pays off the area-binding
work that has been "future" for months.

This is the user-visible value the plan delivers: cards consistently
categorized.

## Description

Through the Conan/Sam library-update loop, populate the `area:` field in YAML frontmatter on every card under
`docs/alexandria/library/`. Each card declares the single primary area it
serves, using IDs from `alexandria-config.json` (`1.1` through `5.3`,
plus `5.2+5.4`).

This is judgment-heavy library work and must not be done by raw
implementation-side edits to `docs/alexandria/library/`. Sam writes the values
through the library workflow, but the human reviewer (you) confirms ambiguous
calls. Plan.md's analysis on 24 cards showed ~17 are dead-clear single-area
assignments and ~7 require judgment. Multi-area cross-references stay as graph
edges, not as multi-area membership.

Ship as four separate commits, one per layer, for review tractability:

1. **rationale layer** — Standards, Principles, Product Theses (~28 cards)
2. **product layer** — Domains, Sections, Governance, Primitives, Templates, Components, Artifacts, Systems, Agents, Prompts, Capabilities (~75 cards)
3. **experience layer** — Experience Goals, Forces, Loops, Journeys (~22 cards)
4. **temporal layer** — Decisions, Initiatives, Futures (~16 cards)

Each commit references this ticket and includes a short rationale for any
non-obvious area assignments.

## Context

Reference cards:

- `[[Section - Card Repository]]` — the location all cards live; WHEN section will record the area-binding migration
- `[[Standard - Card Frontmatter Schema]]` — defines what `area:` looks like
- `[[Artifact - Type Taxonomy]]` — companion taxonomy reference

Plan.md notes (lines 60-72): "One primary area per card holds up cleanly.
~17/24 are dead-clear single-area assignments. Multi-area
cross-references belong as graph edges, not as area membership."

Anti-pattern: do not let area attribution rely on filename or folder
heuristics. Read the card content, decide which area it primarily
informs, write the explicit `area:` value.

For cards where two areas seem equally valid, prefer the area named by
the card's WHY section (the strategic rationale) over the area named by
its WHERE section (where it shows up in product). When in doubt, ask the
human.

## Acceptance Criteria

- [ ] Every card under `docs/alexandria/library/` has an `area:` field in YAML frontmatter
- [ ] Every `area:` value is a valid area ID from `alexandria-config.json`
- [ ] No card has multiple `area:` values; cross-area references remain in contextualized `WHERE` wikilinks until the future graph-edge schema defines a machine-readable form
- [ ] Four library-update batches, one per layer, each with a short rationale paragraph for non-obvious assignments
- [ ] After all commits land, `parseCardFrontmatter` reads `area:` on every card without errors
- [ ] After all commits land, `ax cards list --area 1.1` returns a non-empty list (proves the filter works end-to-end)
- [ ] `bun run check` passes after each layer commit
- [ ] Sam writes the populations through the Conan/Sam loop; the human reviewer signs off on each layer batch before the next starts

## Implementation Notes

Workflow: ask Conan to review the per-layer task and dispatch Sam. Sam reads the
existing card content, proposes an area, writes the frontmatter edit through the
library workflow, and opens a review.
The human reviews and either approves or asks for re-judgment. Move to
the next layer only after the current one is approved.

For ambiguous cases (~7 of 24 from plan.md's sample, projecting to ~40
of 141 across the full library), Sam should flag the card with a
proposed area plus a one-sentence rationale and surface to the human for
judgment.

Do not use multi-area membership to express cross-area relevance. Until the
future graph-edge schema lands, keep cross-area relevance in contextualized
`WHERE` wikilinks using the best prose relationship verb.

This ticket is the most labor-intensive in Phase 1. Plan for ~1-2 days
of focused human review across the four batches. Do not rush — incorrect
area assignments would corrupt the scoreboard accuracy gain that
FEAT-104 delivers.
