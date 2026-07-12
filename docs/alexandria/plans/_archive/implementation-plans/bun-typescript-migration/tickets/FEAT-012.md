---
id: FEAT-012
title: "Migrate structural checks to TypeScript"
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-011, FEAT-018]
cards: [System - Eval Harness, Artifact - Decision 31: Sampling for Judgment, Exhaustive for Mechanics]
---

## Motivation

9 per-skill structural check scripts (1,546 lines) are the "exhaustive
mechanics" half of the eval system. Porting to TypeScript lets the eval
harness import and call them directly.

## Description

Port all 9 structural check scripts to TypeScript. Each exports:

```typescript
export function structuralChecks(outputDir: string): StructuralResult[]
```

Files: implementation-planning, wizard, ticket-writer, conan, sam, raven,
nit, bridget, solomon.

## Acceptance Criteria

- [ ] All 9 scripts ported
- [ ] Running against existing eval baselines produces identical results
- [ ] Each exports typed function returning `StructuralResult[]`
- [ ] Files remain colocated with eval cases

## Implementation Notes

Uses shared graph library for frontmatter validation. Port one skill first
(implementation-planning, most complex at 197 lines) to establish pattern.

## Status Note (2026-03-30)

Factory run result:

- issue `#135` failed after 2 attempts
- no PR was opened
- both attempts ended in watchdog `workspace-stall`

Current reconciliation stance:

- keep this ticket open and unqueued
- do not advance it again until the release prerequisite chain is restored
