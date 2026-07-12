---
id: FEAT-002
title: "Port all test suites to bun test (calling existing Python/bash tools)"
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-003]
cards: [System - Eval Harness, System - DAG Engine]
---

## Motivation

This is the strategic keystone of the migration. By porting all 16 bash test
scripts to bun test FIRST — while they still call the existing Python and bash
executables — we create a comprehensive safety net. Every subsequent tool rewrite
simply swaps the executable path in its test. If the test passes against Python
and then passes against TypeScript, behavioral equivalence is proven.

## Description

Port all test scripts to `.test.ts` files under `tests/`:

**Python tool tests (call Python executables via Bun.spawn):**
- `test-graph.sh` → `graph.test.ts` (43 tests, calls `python3 -c` for lib)
- `test-dag.sh` → `dag.test.ts` (calls `bin/alxndr dag`)
- `test-grade.sh` → `grade.test.ts` (calls `bin/alxndr grade`)
- `test-lint.sh` → `lint.test.ts` (calls `bin/alxndr lint`)
- `test-retrieve.sh` → `retrieve.test.ts` (calls `bin/alexandria-retrieve`)
- `test-tensions.sh` → `tensions.test.ts` (calls `bin/alexandria-tensions`)
- `test-wizard-cli.sh` → `wizard-cli.test.ts` (calls `bin/alexandria-initialize`)
- `test-sync-issues.sh` → `sync-issues.test.ts` (calls `bin/alexandria-sync-issues`)

**Bash tool tests (call bash executables via Bun.spawn):**
- `test-eval-cli.sh` → `eval-cli.test.ts` (calls `bin/alexandria-eval`)
- `test-eval-runner.sh` → `eval-runner.test.ts` (calls `tests/run-eval.sh`)
- `test-update-check.sh` → `update-check.test.ts`
- `test-setup.sh` → `setup.test.ts`
- `test-route.sh` → `route.test.ts`

**QA tests (no external tool dependency):**
- `qa-wizard.sh` → `qa-wizard.test.ts`
- `qa-gap-analysis.sh` → `qa-gap-analysis.test.ts`
- `qa-solicitation.sh` → `qa-solicitation.test.ts`

Translation pattern:
- `assert_eq "$actual" "$expected" "desc"` → `expect(actual).toBe(expected)`
- `assert_contains "$output" "text" "desc"` → `expect(output).toContain("text")`
- Temp dir setup → `beforeEach`/`afterEach` hooks
- Tool invocation → `Bun.spawn` with `await proc.exited`

## Context

The existing tests are already integration-style — they call tools as black-box
executables and assert on output/exit codes. This makes them ideal for porting:
the TS test files call the same executables, just through `Bun.spawn` instead
of bash subshells.

The graph library tests (`test-graph.sh`) are the exception — they call Python
functions directly via `python3 -c`. These tests should initially call Python
the same way, then switch to importing TS modules after FEAT-003.

SPIKE-001 validated that `Bun.spawn` works for subprocess testing and that
`bun test` handles temp dirs and file assertions.

## Acceptance Criteria

- [ ] All 16 test scripts ported to `.test.ts` files
- [ ] `bun test` runs all tests from a single command
- [ ] All tests pass against existing Python/bash executables
- [ ] Test count ≥ 170 (current total)
- [ ] graph.test.ts calls Python functions via `Bun.spawn` (temporary)
- [ ] CI updated to run `bun test`
- [ ] Old bash test scripts kept (not deleted yet — FEAT-018 handles cleanup)

## Implementation Notes

Port one test file first (suggest `test-dag.sh` — well-structured, 24 tests)
to establish the pattern. Then port the rest. The QA tests (wizard, gap analysis,
solicitation) are self-contained YAML/markdown processing — they may need
a small TS helper for the wizard engine YAML parsing.

Use `Bun.spawn` with `await proc.exited` per SPIKE-001 findings.

## Status Note (2026-03-30)

Factory run result:

- issue `#111` failed after 2 attempts
- no PR was opened
- both attempts ended in watchdog `workspace-stall`

Release impact:

- this is the first failed prerequisite in the release
- the release should have stopped here, but downstream work still ran

Current reconciliation stance:

- keep this ticket open
- treat it as the true restart point for the migration once prerequisite handling is repaired
