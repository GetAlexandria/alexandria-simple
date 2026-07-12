---
id: FEAT-104
title: "Switch scoreboard-derive.ts from getAreaMatchers to frontmatter area: attribution"
outcome: O-5
tier: must
enabler: false
blocked-by: [FEAT-103]
blocks: [FEAT-106]
cards: [Capability - Inventory, Artifact - Type Taxonomy]
---

## Motivation

The scoreboard renders areas as filled or unfilled based on what cards
attribute to them. Today that attribution comes from `getAreaMatchers` —
a path-based heuristic table that misfiles roughly 20% of sampled cards
according to plan.md analysis.

After FEAT-103 lands, every card has `area:` populated in frontmatter.
This ticket switches the scoreboard from the matcher table to reading
frontmatter directly. The scoreboard becomes accurate.

## Description

Refactor `packages/ax/src/tools/scoreboard-derive.ts` so that
`attributedAreaIds` on each `LibraryCardRecord` comes from the card's
frontmatter `area:` field, not from `getAreaMatchers`.

The matcher table in `scoreboard-derive-matchers.ts` becomes either:

- **Option A**: deleted entirely (clean break)
- **Option B**: kept as a fallback for cards without `area:` populated, emitting a warning when invoked

Recommendation is **Option B** — the warning surfaces drift if any card
loses its `area:` field, and the fallback prevents catastrophic
regressions during Phase 2 work. Decide during implementation review.

## Context

Reference cards:

- `[[Capability - Inventory]]` — WHEN section records the attribution-mechanism shift
- `[[Artifact - Type Taxonomy]]` — companion reference; existing matcher-related notes update to point at the new mechanism

Existing test: `packages/ax/src/tools/scoreboard-derive.test.ts` (and any
related tests in the scoreboard family). Run before and after to confirm
no regression on the area-attribution side.

Anti-pattern: do not silently swallow cards without `area:`. If a card
slips through FEAT-103 without an area, surface it visibly — either as
an error, a warning, or a lint check (FEAT-105). Silent default
attribution is what the matcher table did wrong.

## Acceptance Criteria

- [ ] `scoreboard-derive.ts` reads `attributedAreaIds` from frontmatter `area:` on every card with the field populated
- [ ] If a card lacks `area:`, the chosen behavior (Option A or B) is implemented and tested
- [ ] If Option B is chosen: warning is emitted to stderr listing every card that triggers the fallback
- [ ] Existing scoreboard-derive tests pass with updated expectations reflecting the new attribution
- [ ] New test: scoreboard rendered against the live library after FEAT-103 shows zero of the original 24 sample cards misfiled (the ~5 that were misfiled by the matcher are now correctly placed)
- [ ] `scoreboard-derivation.md` spec updated to describe the frontmatter-driven mechanism (replacing the matcher description)
- [ ] `bun test` passes
- [ ] `bun run check` passes

## Implementation Notes

The refactor is small but consequential — every scoreboard render after
this ticket reflects the new attribution. Stage the change behind a
feature gate during local testing if helpful, but ship it unconditionally
once tests pass.

Capture before/after scoreboard renderings in the PR description. The
visual shift (5 cards moving to correct areas) is the proof point that
the migration delivered the user-visible value.

For Option B fallback: the warning should be one line per card, formatted
like `[scoreboard] card X has no area; using path-based fallback` —
loud enough to notice in CI, quiet enough not to drown signal.

Coordinate with FEAT-105 — the drift-lint check is the longer-term
guard against `area:` regressions. FEAT-104 ships first, FEAT-105 closes
the gap.
