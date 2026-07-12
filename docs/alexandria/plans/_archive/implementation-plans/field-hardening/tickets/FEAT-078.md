---
id: FEAT-078
title: "Linter validates card types against KNOWN_TYPES"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-076]
blocks: [FEAT-095]
cards: [Artifact - Type Taxonomy]
---

## Motivation

Bryan reported: "The linter doesn't recognize 'Anti-Pattern' as a canonical type." This is the linter side of the same drift bug FEAT-076 fixes in the scoreboard. The linter must validate against the same `KNOWN_TYPES` source — not a local list.

## Description

Audit `packages/ax/src/tools/lint*.ts` for any local type list. Replace with `KNOWN_TYPES` import. Confirm lint errors for unknown types are accurate after the FEAT-076 reconciliation.

## Context

See [[Artifact - Type Taxonomy]]. Related tests at `packages/ax/src/tools/lint*.test.ts`.

## Acceptance Criteria

- [ ] Linter imports types from `KNOWN_TYPES`.
- [ ] `ax lint` on a library containing `Anti-Pattern` cards produces no unknown-type errors.
- [ ] `bun test` passes for lint suites.
- [ ] No local copy of the type list survives in lint code.

## Implementation Notes

Look for `KNOWN_TYPES`-shaped arrays in `lint.ts`, `lint-terminology.ts`, and any helper modules they import.
