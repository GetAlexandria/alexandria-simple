---
id: FEAT-014
title: "Rewrite version + update-check in TypeScript"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-018]
cards: []
---

## Motivation

Simplest tools (15 + 165 lines bash). Quick wins.

## Description

- **version.ts** — Read VERSION file, print it.
- **update-check.ts** — Check GitHub releases API via `fetch()`, compare semver.

## Acceptance Criteria

- [ ] update-check.test.ts passes against TypeScript implementation
- [ ] No external dependencies (Bun built-in fetch)

## Implementation Notes

Swap executable path in test. Trivial rewrites.

## Status Note (2026-03-30)

Factory run result:

- issue `#137` failed after 2 attempts
- no PR was opened
- both attempts ended in watchdog `workspace-stall`

Current reconciliation stance:

- keep this ticket open and unqueued
- resume only after earlier prerequisites and the stall behavior are reconciled
