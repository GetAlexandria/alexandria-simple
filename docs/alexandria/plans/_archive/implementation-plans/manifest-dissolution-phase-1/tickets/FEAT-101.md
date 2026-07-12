---
id: FEAT-101
title: "Migrate health-check.ts inventory reads to ax cards list --json"
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-096]
blocks: []
cards: [Capability - Health Check, System - Knowledge Graph]
---

## Motivation

`packages/ax/src/tools/health-check.ts` calls `parseInventoryManifests()`
on `manifest.md` to assemble the inventory used in completeness scoring.
The expectation_source field is set to `inventory_manifests` to mark this
data path.

Like FEAT-100, this couples the health-check tool to manifest.md
formatting. Routing the on-disk side through `ax cards list --json`
removes that coupling. The expectation_source can stay as
`inventory_manifests` for the gap half (still manifest-driven) until
Phase 2.

## Description

Refactor `health-check.ts` so the on-disk inventory half consumes the
in-process `cards.list()` function (the same one FEAT-100 introduces).
The expected-cards half continues to call `parseInventoryManifests()`.

Specifically, the inventory section of the health report (today emits
`manifest_count`, `missing_cards`, `unexpected_cards`) is computed by
combining:

- on-disk: `cards.list()` (new path)
- expected: `parseInventoryManifests()` (unchanged)
- diff: same logic as today

Coordinate with FEAT-100 — both refactors should reuse the same
`getInventoryFromDisk()` helper. Do not duplicate the call.

## Context

Reference cards:

- `[[Capability - Health Check]]` — WHEN section records the inventory-source shift
- `[[System - Knowledge Graph]]` — the inventory source

Existing tests: search `packages/ax/src/tools/` for health-check tests.
Run them before and after the refactor to confirm no regression.

Anti-pattern: same as FEAT-100 — do not shell out. Import the function.

## Acceptance Criteria

- [ ] Health-check inventory section uses the in-process `cards.list()` function
- [ ] `manifest_count`, `missing_cards`, `unexpected_cards` continue to fire on the same conditions
- [ ] expectation_source remains `inventory_manifests` (Phase 1 does not change the field)
- [ ] No behavioral regression on existing health-check tests
- [ ] New test verifies migration: change a card on disk, run health-check, confirm the inventory section reflects the new state via the CLI inventory path
- [ ] `parseInventoryManifests()` is still imported and used for the expected-cards side
- [ ] `bun test` passes
- [ ] `bun run check` passes

## Implementation Notes

Reuse the `getInventoryFromDisk()` helper introduced by FEAT-100. If
FEAT-100 lands first, this ticket is a small refactor; if they land in
parallel, coordinate the helper location (likely
`packages/ax/src/lib/inventory.ts` or similar shared location).

Do not change the shape of the health-check report output in this ticket.
Surface refactoring is internal; report consumers continue to see the
same structure. Phase 2 will revisit the report shape when the data layer
arrives.

Run health-check against the live library after refactoring to confirm
no false positives. Compare report output before-and-after.
