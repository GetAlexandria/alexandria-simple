---
id: FEAT-077
title: "Scoreboard matchers derive type names from KNOWN_TYPES"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-076]
blocks: []
cards: [Artifact - Type Taxonomy]
---

## Motivation

After FEAT-076 reconciles the taxonomy, the matcher table still hard-codes type strings. A future type rename will drift again unless the matchers import from `KNOWN_TYPES` by reference.

## Description

Refactor `packages/ax/src/tools/scoreboard-derive-matchers.ts` to import types from `KNOWN_TYPES`. Replace literal strings with named-type constants. Add a type-level check (TypeScript or runtime assertion) that every matcher's `types` array is a subset of `KNOWN_TYPES`.

## Context

Matchers today: `{ id: "primitives", types: ["Primitive", "Product Entities"] }` — string literals with no compile-time protection against drift. See [[Artifact - Type Taxonomy]].

## Acceptance Criteria

- [ ] Scoreboard matcher code references `KNOWN_TYPES`-derived values, not string literals.
- [ ] A type-level or startup assertion fails if a matcher references a type not in `KNOWN_TYPES`.
- [ ] Existing scoreboard behavior unchanged for valid libraries; `bun test` passes.

## Implementation Notes

TypeScript `as const` on `KNOWN_TYPES` plus a union type gives compile-time protection. Alternative: runtime assertion at module load. Prefer compile-time.
