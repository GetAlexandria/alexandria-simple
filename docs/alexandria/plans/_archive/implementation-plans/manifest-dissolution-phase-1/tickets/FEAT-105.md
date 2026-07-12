---
id: FEAT-105
title: "Add drift-lint check: frontmatter area: vs folder consistency"
outcome: O-5
tier: should
enabler: false
blocked-by: [FEAT-103]
blocks: []
cards: [Capability - Linting, Standard - Card Frontmatter Schema]
---

## Motivation

After FEAT-103 populates `area:` on every card and FEAT-104 switches the
scoreboard to read it, drift becomes possible: a card moves folders but
its `area:` stays wrong, or someone adds a new card with an `area:` that
doesn't match where they put it.

Plan.md (lines 198-199) flags this directly: "A drift-lint check would
compare card frontmatter (`type:`, `area:`) against filename and folder,
surfacing mismatches."

This ticket adds that check, closing the loop on area-binding integrity.

## Description

Extend `packages/ax/src/tools/lint-manifest.ts` (or a peer lint module)
with a new check that compares each card's `area:` and `type:` against
its filesystem location and filename:

- `type:` should match the prefix of the filename (`Standard - Foo.md` →
  `type: Standard`)
- `area:` should be plausible given the card's folder location (e.g., a
  card in `docs/alexandria/library/rationale/standards/` should have a
  rationale-layer area, not a temporal-layer one)

The folder-vs-area mapping is heuristic (folders are organized by layer,
not by area). The check flags clear contradictions, not every weak
correlation.

## Context

Reference cards:

- `[[Capability - Linting]]` — WHEN section records the new check
- `[[Standard - Card Frontmatter Schema]]` — defines the canonical fields the check validates

The check belongs in the existing lint surface (`ax lint`) so it runs
in CI. New check ID: `frontmatter_area_drift` (or similar — match the
existing naming convention in `lint-core.ts`).

Anti-pattern: do not be too strict. Some cards legitimately span layers
or have ambiguous area assignments. The check should flag clear
mismatches (rationale folder + temporal area, e.g.) and let the gray
cases pass. Tune the strictness during implementation against the live
library.

## Acceptance Criteria

- [ ] New lint check exists and runs as part of `ax lint`
- [ ] Check fires when card's `type:` frontmatter does not match the filename prefix
- [ ] Check fires when card's layer (derived from `type:`) does not match its folder location
- [ ] Check does NOT fire for the live library after FEAT-103 — i.e., FEAT-103's population is consistent with folder layout (run as a smoke test)
- [ ] Test fixture exercises both passing and failing cases
- [ ] `bun test` passes
- [ ] `bun run check` passes

## Implementation Notes

Layer-to-folder mapping: rationale → `rationale/`, product → `product/`,
experience → `experience/`, temporal → `temporal/`. Cards whose folder
location does not match their derived layer are the clearest mismatch
signal.

For area-vs-folder: looser. Areas group by domain (Vision & Strategy,
Architecture & Nouns, etc.), and the layer/folder structure does not map
1:1 onto areas. A rationale-layer Standard might inform multiple areas;
that's expected. The check only fires if the area is in a wholly
inappropriate domain (e.g., a Standard in `rationale/standards/` with
`area: 5.3 Roadmap`).

Calibrate the strictness during the review of the first lint run against
the live library. Adjust the heuristic if it produces too many false
positives.
