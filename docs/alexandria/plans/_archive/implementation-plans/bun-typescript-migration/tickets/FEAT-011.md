---
id: FEAT-011
title: "Migrate eval harness to TypeScript"
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-003, FEAT-012]
blocks: [FEAT-018]
cards: [System - Eval Harness, Principle - Measure Before Promoting]
---

## Motivation

The eval harness (1,000 lines bash) is the most complex and critical migration
target. Three execution modes, Claude CLI session management, LLM-as-Judge.
Depends on structural checks (FEAT-012) being in TypeScript first.

## Description

Rewrite `tests/run-eval.sh` in TypeScript at `src/tools/eval-harness.ts`.
All three modes must work identically:

1. **Single-prompt** — all inputs in one invocation
2. **Multi-turn** — resume sessions with `--resume`
3. **Adaptive LLM-as-user** — persona-based Claude plays user

Key subsystems: project setup, Claude CLI session management (per SPIKE-001
findings: `await proc.exited`), transcript recording, structural check runner,
LLM-as-Judge, baseline comparison, `expected_files` completion detection.

## Acceptance Criteria

- [ ] All three execution modes produce identical results to bash harness
- [ ] eval-runner.test.ts passes against TypeScript implementation
- [ ] Structural checks imported as TS functions from FEAT-012
- [ ] Transcript format unchanged
- [ ] `await proc.exited` pattern used throughout

## Implementation Notes

Migrate incrementally: single-prompt first, then multi-turn, then adaptive.
Keep bash harness available until all three modes verified side-by-side.

## Status Note (2026-03-30)

Factory run result:

- issue `#120` failed after 2 attempts
- no PR was opened
- both attempts ended in watchdog `workspace-stall`

Current reconciliation stance:

- keep this ticket open and unqueued
- treat it as blocked by both prerequisite recovery and the broader third-party watchdog problem
