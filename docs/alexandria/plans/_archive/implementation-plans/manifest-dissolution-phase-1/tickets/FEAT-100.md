---
id: FEAT-100
title: "Migrate lint-manifest.ts Sweep 4 inventory reads to ax cards list --json"
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-096]
blocks: []
cards: [Capability - Linting, System - Knowledge Graph]
---

## Motivation

`packages/ax/src/tools/lint-manifest.ts` Sweep 4 currently scans every
`manifest*.md` file with regex (`/^manifest.*\.md$/i`) and parses inventory
tables to produce three checks: `manifest_missing_on_disk`,
`manifest_missing_on_manifest`, and `manifest_cross_reference`.

This is brittle — the regex assumes a specific filename pattern, and the
table parsing breaks when manifest formatting drifts. Routing the on-disk
side of those checks through `ax cards list --json` removes the regex and
the table parser for inventory queries. The expected-cards side keeps its
manifest.md parse path until Phase 2 introduces a data-layer-driven
replacement.

## Description

Refactor `lint-manifest.ts` so that Sweep 4's "what cards exist on disk"
half consumes the JSON output of `ax cards list --json`. The "what cards
the manifest claims should exist" half continues to parse `manifest.md`
inventory tables via existing `parseInventoryManifests()` logic.

Specifically:

- `manifest_missing_on_disk`: card listed in manifest expected-cards but
  not present in `ax cards list` output → flag
- `manifest_missing_on_manifest`: card present in `ax cards list` but not
  in manifest expected-cards → flag (or downgrade to warning, since some
  emergent cards may not yet be enrolled)
- `manifest_cross_reference`: existing cross-check logic stays; refactor
  to use the JSON inventory as the disk side

`parseInventoryManifests()` and the `manifest*.md` regex remain in place —
they are NOT deleted in this ticket.

## Context

Reference cards:

- `[[Capability - Linting]]` — WHEN section records the inventory-source shift
- `[[System - Knowledge Graph]]` — the inventory source

Existing test suite: `packages/ax/src/tools/lint.test.ts` and
`lint-terminology.test.ts`. Add or extend a Sweep-4-specific test that
exercises the migrated path against a fixture library.

Anti-pattern: do not shell out to the `ax cards list` binary in production
code paths. Import the underlying function from `cards.ts` (or equivalent)
directly so the lint tool stays in-process. Shelling out is fine for
integration tests but not for the runtime path.

## Acceptance Criteria

- [ ] Sweep 4 inventory reads use the in-process `cards.list()` function (or equivalent), not `ax cards list` shelled out
- [ ] All three Sweep 4 check IDs (`manifest_missing_on_disk`, `manifest_missing_on_manifest`, `manifest_cross_reference`) continue to fire on the same conditions
- [ ] No behavioral regression on existing lint integration tests
- [ ] New test verifies migration: change a card on disk, run lint, confirm Sweep 4 picks up the new state via the CLI inventory path
- [ ] `parseInventoryManifests()` is still imported and used for the expected-cards side of Sweep 4
- [ ] `bun test` passes
- [ ] `bun run check` passes

## Implementation Notes

Refactor strategy: introduce a `getInventoryFromDisk()` helper that wraps
the cards.list() call. Sweep 4 calls that helper for the disk side and
`parseInventoryManifests()` for the manifest side. Diff the two sets to
produce the existing check IDs.

Keep the manifest.md parse path intact. Phase 2 will delete it once the
data layer is ready; Phase 1 narrows its role from "everything" to
"expected cards plus judgment notes" but does not remove it.

Run lint against the live library after refactoring to confirm no new
false positives. Compare Sweep 4 output before-and-after on the current
branch.
