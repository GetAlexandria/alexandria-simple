# Eval Harness TypeScript Port — Plan

**Issue:** #120 / FEAT-011
**Date:** 2026-03-31
**Status:** In progress
**Related plan:** `docs/implementation-plans/bun-typescript-migration/tickets/FEAT-011.md`

---

## Context

`tests/run-eval.sh` is still the active eval harness. It owns the three eval
execution modes, transcript generation, output capture, metadata, structural
checks, judge execution, and baseline comparison. The FEAT-011 ticket also
depends on FEAT-012, but the current branch still has only shell-based
structural check scripts under `tests/eval-cases/*/structural-checks.sh`.

This ticket therefore needs to land both:

1. A Bun/TypeScript implementation of the eval harness
2. A TypeScript structural-check layer that the harness can import directly

The acceptance bar is behavioral compatibility, not just a successful rewrite.

---

## Scope

### In scope

- Create `src/tools/eval-harness.ts` as the TypeScript implementation of the
  eval runner
- Keep `tests/run-eval.sh` as a thin wrapper that delegates to the TypeScript
  tool so existing entrypoints continue to work
- Preserve all three execution modes:
  - single-prompt
  - multi-turn with session resume
  - adaptive LLM-as-user with personas and completion detection
- Preserve transcript structure, metadata fields, output copying, history
  snapshots, and compare behavior
- Port all 9 structural check scripts to TypeScript and colocate them with the
  eval cases
- Run structural checks from imported TS functions rather than sourcing shell
  files
- Keep judge execution working from the new harness
- Update deterministic tests so they validate the TS-backed runner
- Run the real eval cases and compare them against checked-in baselines

### Out of scope

- Rewriting the judge system to TypeScript
- Changing eval transcript format beyond compatibility-preserving fixes
- Changing score criteria or baseline expectations except where the port itself
  requires baseline refresh

---

## Implementation Plan

### 1. Establish the TypeScript harness surface

- Implement `src/tools/eval-harness.ts` with the same CLI contract as
  `tests/run-eval.sh`
- Keep target resolution and `--compare` behavior identical
- Move shared helpers into typed functions:
  - config loading
  - mode detection
  - hashing and metadata
  - fixture copy and output diffing
  - transcript rendering
  - baseline comparison

### 2. Preserve process behavior safely in Bun

- Use `Bun.spawn` / `await proc.exited` for long-running CLI processes per
  SPIKE-001
- Avoid shell `eval`; construct argument arrays directly
- Preserve Claude CLI behavior for:
  - first-turn session establishment
  - `--resume` reuse
  - JSON output parsing in multi-turn and adaptive modes
  - persona-side user LLM calls

### 3. Port structural checks first-class into TypeScript

- Define a shared `StructuralResult` type and helper library
- Add per-skill `structural-checks.ts` modules alongside the existing eval cases
- Port the 9 shell scripts without changing their pass/fail semantics:
  - implementation-planning
  - wizard
  - ticket-writer
  - conan
  - sam
  - raven
  - nit
  - bridget
  - solomon
- Call CLI tools from TypeScript where needed for DAG validation

### 4. Maintain compatibility around outputs

- Keep transcript headings and file sections unchanged
- Keep `run-metadata.json` keys unchanged
- Keep `structural-results.json` schema unchanged
- Preserve historical run snapshots under `tests/evals/<skill>/<case>/runs/`
- Preserve baseline compare reporting semantics closely enough that existing
  workflows still work

### 5. Verify the port incrementally

- First get `tests/eval-runner.test.ts` green against the TS-backed runner
- Then run `./tests/test-eval-runner.sh`
- Then run all deterministic suites directly affected by the harness:
  - `./tests/test-eval-runner.sh all`
  - `bun test tests/eval-runner.test.ts`
  - `./tests/test-eval-cli.sh all`
  - `./tests/test-eval-runner.sh all`
- Then run additional repo checks if touched files require them:
  - `bun run typecheck`
  - `bun run lint`

---

## Real Eval Verification

The ticket requires actual eval execution and baseline comparison, not just mock
tests. After the deterministic suite is green, run:

- `bin/alexandria-eval run implementation-planning/taskflow-realtime`
- `bin/alexandria-eval results implementation-planning/taskflow-realtime`
- `bin/alexandria-eval compare implementation-planning/taskflow-realtime`

Because the harness is shared infrastructure, also run representative cases that
exercise the other execution modes:

- One single-prompt case
- One multi-turn scripted case
- One adaptive case

For each run:

- confirm the run succeeds end-to-end
- inspect transcript and metadata for compatibility
- compare against the checked-in baseline
- update baselines only if behavior is equivalent or improved with no
  regressions

---

## Risks

### Process invocation drift

The shell harness relies on shell quoting and `eval`. Replacing this with direct
argument arrays is safer, but it can change how `allowed_tools`, empty strings,
or persona calls are passed. The tests need explicit coverage here.

### Transcript compatibility

Small formatting drift can break downstream judge/comparison expectations. The
port should keep the transcript sections byte-stable where practical.

### Structural-check parity

The shell scripts use `find`, `grep`, `wc`, and frontmatter heuristics. Porting
them by interpretation rather than line-for-line behavior risks subtle score
changes. Port skill by skill and validate against existing checked-in baselines.

### Live eval runtime cost

The required real eval runs may be slow and model-dependent. They need to happen
after the deterministic layer is stable so time is spent on validation, not
debugging obvious harness failures.

---

## Definition Of Done

- `src/tools/eval-harness.ts` is the active implementation
- `tests/run-eval.sh` is a wrapper, not the core logic
- All 9 structural check suites have TypeScript implementations wired into the
  harness
- `tests/eval-runner.test.ts` passes against the TypeScript-backed runner
- Relevant deterministic suites pass locally
- Required real eval runs succeed and compare cleanly to baseline, or updated
  baselines are checked in with justified changes
- A PR is opened against `main`
