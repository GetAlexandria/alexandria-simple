---
id: FEAT-013
title: "Rewrite eval CLI in TypeScript"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-018]
cards: [System - Eval Harness]
---

## Motivation

The eval CLI (658 lines bash) manages eval runs, results, comparison. 267
lines of existing tests are the safety net.

## Description

Rewrite `bin/alexandria-eval` in TypeScript at `src/tools/eval-cli.ts`.
All 7 subcommands: list, status, run, running, results, compare, history.

## Acceptance Criteria

- [ ] All eval CLI tests pass against TypeScript implementation
- [ ] eval-cli.test.ts updated to call TS executable
- [ ] Background process spawning and PID tracking work

## Implementation Notes

Swap executable path in test. Uses `Bun.spawn` for background eval runs.
