---
id: FEAT-098
title: "Add --summary mode to ax cards list"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-096]
blocks: [FEAT-102]
cards: [Capability - Inventory, System - Knowledge Graph]
---

## Motivation

The downstream consumer migrations (FEAT-100, FEAT-101) need the stable JSON
inventory shipped in FEAT-096. This ticket adds the remaining generated summary
view that replaces the manifest.md Summary table — a hand-maintained count tally
that has churned every time cards land or retire.

## Description

Add `--summary` to `ax cards list`.

`--summary` emits a count summary grouped by `type` and a total. Default
rendering is a table; `--summary --json` emits a structured summary object with
the same data.

Filters from FEAT-096 (`--type`, `--layer`) compose with summary mode. Future
filters such as FEAT-097's `--area` should reuse the same summary pipeline when
their horizontal slices land.

## Context

Reference cards:

- `[[Capability - Inventory]]` — WHEN section records the JSON contract
- `[[System - Knowledge Graph]]` — the inventory source

The summary replaces the manifest.md "Summary" section (lines 467-502 in
the current manifest), which had a hand-tracked total and per-type counts.
With `--summary`, that table is generated on demand.

## Acceptance Criteria

- [ ] `ax cards list --summary` emits a count table grouped by `type` plus a total
- [ ] `ax cards list --summary --json` emits a structured summary object
- [ ] Filters compose with summary mode: `ax cards list --type Standard --summary` summarizes only Standards
- [ ] Black-box integration tests cover summary mode plus filter composition
- [ ] `bun run check` passes

## Implementation Notes

Summary mode: the count groupBy logic should be a pure function over the
card array, easy to unit-test. The renderer (table vs JSON) wraps the
function — keep them separate.

Performance note: at 138 cards the cost is trivial. Don't pre-optimize. If
the library grows past 1000 cards, revisit.

Coordinate with FEAT-100 and FEAT-101 — they consume the JSON contract.
Lock the field set before they start to avoid churn.
