---
id: FEAT-010
title: "Rewrite sync-issues in TypeScript"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-018]
cards: []
---

## Motivation

The sync-issues tool (551 lines Python) syncs ticket files to GitHub issues.
32 existing tests are the safety net.

## Description

Rewrite `bin/alexandria-sync-issues` in TypeScript at `src/tools/sync-issues.ts`.
Uses shared frontmatter parser and `Bun.spawn` for `gh` CLI invocation.

## Acceptance Criteria

- [ ] All 32 sync-issues tests pass against the TypeScript implementation
- [ ] sync-issues.test.ts updated to call TS executable
- [ ] Uses shared frontmatter parser
- [ ] Priority label mapping and dry-run mode preserved

## Implementation Notes

Swap executable path in test. If all tests pass, done.

## Status Note (2026-03-30)

Factory run result:

- issue `#119` failed after 3 attempts
- PR `#150` was opened during the run
- terminal failure was a watchdog `pr-stall`

Current reconciliation stance:

- keep this ticket open and unqueued
- do not retry it until the prerequisite chain is trustworthy again and the watchdog-stall root cause is addressed
