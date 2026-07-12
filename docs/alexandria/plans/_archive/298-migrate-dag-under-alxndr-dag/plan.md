# Issue #298 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#298`
- Goal: migrate DAG execution under `alxndr dag` while preserving the existing DAG CLI behavior and flags
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-022.md`

## Scope

- Add a real `dag` subcommand to the unified `alxndr` router.
- Extract the DAG CLI logic into a reusable result-returning entrypoint that both `src/tools/dag.ts` and `alxndr dag` can call.
- Add a thin adapter at `src/cli/dag.ts` as requested by the upstream implementation note.
- Update deterministic CLI coverage so the migrated surface is exercised through `alxndr dag`.

## Non-Goals

- Deleting the legacy DAG wrappers in this slice.
- Migrating any other placeholder `alxndr` subcommands.
- Updating broader library docs that are explicitly deferred to the cleanup/removal follow-up (`FEAT-024`).

## Current Gap

- `src/cli/main.ts` reserves `dag` but still dispatches to a placeholder error.
- `src/tools/dag.ts` is only usable as a standalone executable with top-level process I/O and exits, so the router cannot reuse it directly.
- Existing DAG tests exercise the standalone tool path, but issue acceptance requires the migrated `alxndr dag` surface to match it.
- Review follow-up for PR `#315`: the migrated shared entrypoint still needs explicit coverage for `--help`, legacy handling for unknown `--format` values, and text-output newline parity with the legacy executable contract.

## Architectural Boundaries

- The DAG computation and output contract stay in `src/tools/dag.ts`; this issue should not duplicate that logic in the CLI router.
- `src/cli/dag.ts` should remain a thin adapter from `alxndr` subcommand args into the DAG tool entrypoint.
- Legacy wrappers remain intact in this slice so host/plugin workflows do not regress before the later removal ticket lands.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Unified CLI router | `src/cli/main.ts`, `src/cli/dag.ts` | `alxndr dag` becomes a real subcommand instead of a placeholder |
| DAG CLI tool | `src/tools/dag.ts` | DAG behavior becomes reusable from another caller without changing output or exit semantics |
| Deterministic CLI coverage | `src/cli/main.test.ts`, `src/tools/dag.test.ts` | Tests assert migrated `alxndr dag` behavior and parity with the legacy entrypoint |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| CLI tools | `alxndr dag` becomes the supported unified subcommand for DAG execution | Update CLI tests in this slice; broader repository-wide command reference cleanup stays deferred to `FEAT-024` |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Unified CLI router and DAG migration | `bun test src/cli/main.test.ts src/tools/dag.test.ts` | Covers the new router path plus existing DAG behavior exercised through the migrated surface |
| Type/lint/format baseline for touched files | `bun run check` | Repo-required validation for TypeScript and docs touched in this slice |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI tools | No eval-harness coverage required for this internal CLI routing slice | No eval rerun needed | None |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Refactoring `src/tools/dag.ts` could change stdout/stderr or exit-code behavior | Keep one shared entrypoint for both call sites and add parity assertions against `bin/alxndr` and the legacy wrapper |
| Importing the DAG tool from the router could accidentally execute top-level process code on import | Move process I/O behind an explicit exported function and guard the executable path with `import.meta.main` |
| CLI migration could blur the boundary between router glue and DAG logic | Keep `src/cli/dag.ts` as a thin adapter and leave graph computation/formatting in `src/tools/dag.ts` |

## Implementation Steps

1. Refactor `src/tools/dag.ts` to expose a reusable CLI entrypoint that returns stdout, stderr, and exit code instead of always printing/exiting directly.
2. Add `src/cli/dag.ts` as a thin adapter from `alxndr dag` arguments into the DAG entrypoint.
3. Wire `src/cli/main.ts` to dispatch `dag` through the new adapter.
4. Update deterministic tests to cover `alxndr dag` output and validation behavior while keeping legacy wrapper parity checks where useful.
5. Preserve CLI edge-case contract details discovered in review: keep unknown `--format` values aligned with the legacy silent fallback and keep text output/newline behavior aligned with the legacy executable path.
6. Run targeted local verification and review the diff for output-contract regressions.

## Acceptance / Exit Criteria

1. `alxndr dag <path>` produces the same output contract as the existing DAG tool for the covered cases.
2. `alxndr dag <path> --validate` returns the expected validation exit codes.
3. `src/cli/main.test.ts` and `src/tools/dag.test.ts` pass with the migrated routing in place.
4. `bun run check` passes for the touched files.
5. Review-reported edge cases are covered by deterministic tests (`--help`, legacy unsupported `--format` fallback, and text output newline contract).

## Deferred Follow-Ups

1. Delete the legacy DAG wrappers in the follow-up removal ticket (`FEAT-024`).
2. Update broader repo docs, tests, and eval references to the canonical `alxndr dag` surface when the remaining CLI migrations are complete.
