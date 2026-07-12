---
id: FEAT-076
title: "Reconcile KNOWN_TYPES as the canonical type taxonomy source"
outcome: O-1
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-077, FEAT-078, FEAT-079, FEAT-095]
cards: [Artifact - Type Taxonomy]
---

## Motivation

Scoreboard matchers and tests reference types (`Primitive`, `Product Entities`, `Anti-Pattern`) that are not in `packages/ax/src/lib/graph.ts` `KNOWN_TYPES`. This produces false zeros on both Jess's and Bryan's scoreboards and "unknown type" lint errors on cards the library has intentionally accepted. This ticket is the demoable first slice: after this ticket lands, Jess runs `ax scoreboard render .` and sees accurate coverage for Product Entities, and `ax lint` accepts `Anti-Pattern`.

## Description

Audit every type string referenced by the scoreboard matchers (`packages/ax/src/tools/scoreboard-derive-matchers.ts`), linter, initialize engine, and their tests against `KNOWN_TYPES`. For each orphan: decide whether the type is legitimate (add to `KNOWN_TYPES`) or stale (remove from callers). Apply the decision; make `KNOWN_TYPES` the single export that every caller imports.

## Context

`packages/ax/src/lib/graph.ts:38-60` holds `KNOWN_TYPES`. Matcher at `scoreboard-derive-matchers.ts:82-89` references `Primitive` and `Product Entities`; matcher at `:129` references `Anti-Pattern`. See [[Artifact - Type Taxonomy]]. This is the canonical-source decision (D-3) applied — typed code wins.

## Acceptance Criteria

- [ ] Every type string referenced by scoreboard matchers and the linter resolves to `KNOWN_TYPES`.
- [ ] `ax scoreboard render .` on Jess's repo shows non-zero coverage for Product Entities.
- [ ] `ax lint` accepts `Anti-Pattern` (or the type is confirmed deprecated and removed from matchers).
- [ ] Existing tests pass; new tests cover the reconciliation.
- [ ] A single exported `KNOWN_TYPES` is the only source of type-name strings in scoreboard + linter code.

## Implementation Notes

Start by listing every orphan. Walk each orphan with Jess before deleting — `Anti-Pattern` is clearly legitimate (library uses it), `Primitive` and `Product Entities` likely need to be collapsed into existing types. The decision log for this lives in `library-updates.md`.
