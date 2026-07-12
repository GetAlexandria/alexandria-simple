# Issue 111 Plan: Port Remaining Test Suites to Bun Test

## Goal

Port the remaining 8 bash test scripts to bun `.test.ts` files so that
`bun test` runs all tests from a single command, completing FEAT-002.

## Scope

In scope:

- port 5 remaining `test-*.sh` scripts to `.test.ts` files
- port 3 remaining `qa-*.sh` scripts to `.test.ts` files
- add `"test": "bun test"` to `package.json` scripts
- verify all ported tests pass against existing Python/bash executables
- verify total test count >= 170

Out of scope:

- deleting old bash scripts (deferred to FEAT-018)
- rewriting Python tools in TypeScript (deferred to FEAT-003+)
- CI configuration changes beyond adding `bun test`
- modifying existing ported `.test.ts` files

## Non-Goals

- changing the testing philosophy (tests remain black-box integration tests)
- adding new test coverage beyond what the bash scripts already test
- refactoring the tools under test

## Current State

11 `.test.ts` files exist, covering 8 of the 16 bash scripts plus 3 core
module test files (`cli.test.ts`, `frontmatter.test.ts`, `graph.test.ts`,
`markdown.test.ts`).

**Already ported (8/16):**
- `test-dag.sh` -> `src/tools/dag.test.ts`
- `test-eval-cli.sh` -> `src/tools/eval-cli.test.ts`
- `test-grade.sh` -> `src/tools/grade.test.ts`
- `test-lint.sh` -> `src/tools/lint.test.ts`
- `test-retrieve.sh` -> `src/tools/retrieve.test.ts`
- `test-route.sh` -> `src/tools/route.test.ts`
- `test-wizard-cli.sh` -> `src/tools/wizard-cli.test.ts`
- `test-graph.sh` -> `src/graph.test.ts` (calls Python via `Bun.spawn`)

**Remaining (8/16):**
1. `test-tensions.sh` (211 lines, 13 tests) - calls `bin/alexandria-tensions`
2. `test-sync-issues.sh` (582 lines) - calls `bin/alexandria-sync-issues`
3. `test-setup.sh` (400 lines) - tests setup script behavior
4. `test-update-check.sh` (402 lines) - mocks HTTP server for version check
5. `test-eval-runner.sh` - calls `tests/run-eval.sh`
6. `qa-wizard.sh` (614 lines) - wizard configuration engine
7. `qa-gap-analysis.sh` (586 lines) - gap analysis engine
8. `qa-solicitation.sh` (563 lines) - solicitation and output layer

## Symphony Layer Mapping

This is a target-repo (context-library) issue, not a symphony-ts orchestration
issue. The Symphony layer mapping is minimal:

- **Policy:** unchanged
- **Configuration:** unchanged
- **Coordination:** unchanged
- **Execution:** the worker runs in the context-library workspace and must
  complete within the watchdog stall threshold
- **Integration:** unchanged
- **Observability:** unchanged

## Architecture Boundaries

The work stays entirely within the context-library test layer:

- new `.test.ts` files go alongside the code they test (e.g.,
  `src/tools/tensions.test.ts`) or in `tests/` for QA suites
- each test file calls the existing tool executable via `Bun.spawnSync` or
  `Bun.spawn` and asserts on output/exit codes
- no changes to the tools under test
- no changes to the build pipeline beyond adding `bun test` script

What does not belong here:

- tool implementation changes
- agent or skill changes
- plugin manifest changes

## Implementation Steps

Follow the established pattern from `src/tools/dag.test.ts`:
- `import { test, expect, describe, beforeEach, afterEach } from "bun:test"`
- `Bun.spawnSync` for subprocess testing
- `mkdtempSync`/`rmSync` for temp directory lifecycle
- `fileURLToPath(import.meta.url)` for ESM path resolution

### Step 1: Port straightforward tool tests

These follow the same pattern as already-ported files:

1. `test-tensions.sh` -> `src/tools/tensions.test.ts`
   - Calls `bin/alexandria-tensions` via `Bun.spawnSync`
   - 13 tests covering T1 contradiction, T5 echo detection

2. `test-sync-issues.sh` -> `src/tools/sync-issues.test.ts`
   - Calls `bin/alexandria-sync-issues` via `Bun.spawnSync`
   - Largest remaining script, tests issue sync functionality

3. `test-eval-runner.sh` -> `tests/eval-runner.test.ts`
   - Calls `tests/run-eval.sh` via `Bun.spawn`
   - Tests eval harness behavior

### Step 2: Port scripts with special requirements

4. `test-setup.sh` -> `tests/setup.test.ts`
   - Tests setup script behavior (symlinks, plugin structure)
   - May need careful temp directory isolation

5. `test-update-check.sh` -> `tests/update-check.test.ts`
   - Requires HTTP server mocking for version check
   - Use `Bun.serve` to create a local mock HTTP server in `beforeEach`

### Step 3: Port QA test suites

6. `qa-wizard.sh` -> `tests/qa-wizard.test.ts`
   - Wizard configuration engine validation
   - Self-contained YAML/markdown processing

7. `qa-gap-analysis.sh` -> `tests/qa-gap-analysis.test.ts`
   - Gap analysis engine tests
   - Self-contained data validation

8. `qa-solicitation.sh` -> `tests/qa-solicitation.test.ts`
   - Solicitation layer tests
   - Self-contained data validation

### Step 4: Integration

9. Add `"test": "bun test"` to `package.json` scripts
10. Run `bun test` and verify all tests pass
11. Verify total test count >= 170
12. Run `bun run check` (lint + format + typecheck)

## Tests and Acceptance Scenarios

- **Scenario: full-suite-single-command** - `bun test` runs all test suites
  from a single command and all pass
- **Scenario: test-count-threshold** - total test count >= 170
- **Scenario: tensions-parity** - `tensions.test.ts` covers all 13 tests from
  `test-tensions.sh`
- **Scenario: sync-issues-parity** - `sync-issues.test.ts` covers all tests
  from `test-sync-issues.sh`
- **Scenario: setup-parity** - `setup.test.ts` covers all tests from
  `test-setup.sh`
- **Scenario: update-check-parity** - `update-check.test.ts` covers all tests
  from `test-update-check.sh` including HTTP mock
- **Scenario: eval-runner-parity** - `eval-runner.test.ts` covers all tests
  from `test-eval-runner.sh`
- **Scenario: qa-parity** - all three QA `.test.ts` files cover their
  respective bash scripts
- **Scenario: existing-tests-unbroken** - all 11 existing `.test.ts` files
  still pass

## Exit Criteria

- all 16 bash test scripts have `.test.ts` counterparts
- `bun test` runs all tests and all pass
- total test count >= 170
- `bun run check` passes (lint, format, typecheck)
- old bash scripts are kept (not deleted)
- PR is green with CI and Devin Review addressed

## Slice Strategy and PR Seam

This fits in one PR because all changes are additive test files plus one
`package.json` edit. No existing code is modified. The review surface is
narrow: new `.test.ts` files that mirror existing `.sh` scripts 1:1.

If the PR becomes too large, a natural split point is:
- PR 1: tool test ports (steps 1-2, items 1-5)
- PR 2: QA test ports (step 3, items 6-8) + integration (step 4)

## Deferred

- deleting old bash test scripts (FEAT-018)
- rewriting Python tools in TypeScript (FEAT-003+)
- CI pipeline changes beyond `bun test` script
- eval harness improvements
