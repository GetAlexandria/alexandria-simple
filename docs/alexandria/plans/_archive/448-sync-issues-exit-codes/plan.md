# Issue 448 Technical Plan: sync-issues Exit Codes

## Header

- Issue reference: `#448`
- Goal: clarify `alexandria-sync-issues` exit codes so dry-run no-op outcomes are machine-readable success while malformed inputs remain real failures
- Linked product plan: none; implementation intent comes directly from [issue #448](https://github.com/sociotechnica-org/alexandria/issues/448)

## Scope

- Define and implement an explicit exit-code contract for `alexandria-sync-issues`
- Treat dry-run no-op outcomes as exit `0`
- Treat dry-run paths with pending creates, updates, or relationship rewires as exit `3`
- Treat malformed plan inputs and CLI usage errors as exit `2`, including under `--dry-run`
- Prevalidate non-dry-run plan batches before any GitHub writes so exit `2` stays a true invalid-input outcome
- Extend deterministic coverage for invalid-plan dry-runs and already-aligned dry-runs
- Update the checked-in CLI documentation that describes `sync-issues` exit semantics

## Non-Goals

- Redesigning `sync-issues` output formatting beyond what is needed to clarify the new contract
- Changing GitHub issue matching, label sync, or dependency reconciliation semantics beyond their impact on exit-code classification
- Adding product-surface skill or agent changes
- Adding eval-harness coverage; this slice is CLI behavior only

## Current Gap

- On `main`, `alexandria-sync-issues --dry-run` exits `3` unconditionally after processing plan directories
- That masks the difference between informational dry-run drift and invalid plan inputs such as a missing `tickets/` directory or malformed ticket frontmatter
- It also prevents maintainers from distinguishing "already aligned" dry-runs from "would mutate" dry-runs in automation
- Existing coverage exercises dry-run output, but it does not fully lock in the new maintainer-facing exit semantics for invalid-input and no-op cases

## Architectural Boundaries

- The exit-code contract belongs in `src/tools/sync-issues.ts` because that CLI owns plan parsing, GitHub sync execution, and dry-run reporting
- Dry-run change detection should remain derived from the existing ticket-sync and relationship-sync rows, not from a second pass or new state file
- Documentation changes should stay focused on the `sync-issues` contract and maintainer-facing CLI report, not broader planning workflow prose
- This slice should not alter reusable product skills or contributor-skill procedures beyond keeping them aligned with the CLI contract they already wrap

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| CLI tool | `src/tools/sync-issues.ts` | Exit codes become explicit: `0` for success or dry-run no-op, `1` for runtime sync failure, `2` for invalid input/malformed plans, `3` for dry-runs with pending changes |
| CLI tests | `src/tools/sync-issues.test.ts` | Add regression coverage for invalid-input dry-runs, non-dry-run batch prevalidation, and dry-run no-op behavior when relationships are already aligned |
| Public smoke coverage | `tests/cli-smoke.test.ts` | Lock in the wrapper-level missing-`tickets/` failure contract as invalid input rather than informational dry-run |
| Maintainer docs | `docs/alexandria/cli-report.md`, `docs/alexandria/plans/factory-release-intake/plan.md` | Document the new exit-code semantics maintainers should rely on |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `alexandria-sync-issues` CLI contract | Maintainer automation can now distinguish dry-run no-op, dry-run drift, runtime failure, and invalid input | Keep the CLI report and internal sync-plan docs aligned with the new exit-code table |
| Product agents / skills | No behavior change in this slice | No agent/skill doc edits or eval reruns required |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| sync-issues regression coverage | `bun test src/tools/sync-issues.test.ts tests/cli-smoke.test.ts` | Exercises the changed exit-code logic at both tool-local and wrapper-smoke levels |
| repo lint/type gate | `bun run check` | Required repo build standard for touched TypeScript and Markdown files |
| full deterministic suite | `bun test` | Required repo build standard before PR handoff/update |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `src/tools/sync-issues.ts` CLI behavior | Deterministic Bun tests only | No eval reruns required | none |
| Agents / skills | No impacted reusable product behavior | No eval action | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Dry-run change detection could miss relationship-only drift and incorrectly return `0` | Track whether each row represents either ticket-level or relationship-level mutation and cover the relationship-only no-op/drift cases in tests |
| Invalid plan inputs could still be reported as dry-run informational success if exit aggregation stays unconditional | Aggregate invalid-input rows separately from runtime failures and dry-run changes, then exit in priority order: invalid input, runtime failure, dry-run changes, success |
| Non-dry-run batches could create labels or issues before a later malformed plan forces exit `2` | Prevalidate every requested plan directory before `gh` auth, label creation, or issue mutation, and add a regression test that asserts zero GitHub writes when any plan is invalid |
| Maintainer docs could continue advertising the legacy unconditional dry-run exit `3` contract | Update the checked-in CLI report and internal `sync-issues` plan text in the same slice as the code/tests |

## Implementation Steps

1. Add explicit named exit-code constants and update the CLI help text to advertise the contract.
2. Track whether each sync row reflects an actual pending mutation, including relationship-only drift.
3. Prevalidate non-dry-run plan batches before any GitHub writes so malformed plans exit `2` without partial sync side effects.
4. Change final exit aggregation so invalid input and runtime failures are preserved under `--dry-run`, while dry-run no-op cases return `0`.
5. Extend `src/tools/sync-issues.test.ts` with invalid-input dry-run regressions, a non-dry-run batch-prevalidation regression, and a dry-run no-op case for already-aligned relationships.
6. Update wrapper smoke coverage and checked-in maintainer docs to match the new contract.
7. Run focused deterministic coverage, then the repo-required `bun run check` and `bun test` gates.

## Acceptance / Exit Criteria

1. `alexandria-sync-issues --dry-run` exits `0` when a plan is already aligned and no ticket or relationship mutations are pending.
2. `alexandria-sync-issues --dry-run` exits `3` when it would create, update, or rewire issues.
3. Invalid input or malformed plan cases exit `2` even under `--dry-run`.
4. Non-dry-run runtime sync failures still exit `1`.
5. Non-dry-run batch sync aborts before any GitHub writes when one or more requested plans are malformed.
6. `bun run check` and `bun test` pass locally.
7. The existing PR against `main` can cite the plan path and verification results without further contract ambiguity.

## Deferred Follow-Ups

1. Consider a future machine-readable `--format json` mode for `sync-issues` if maintainers need structured automation output beyond exit codes.
2. Consider documenting exit-code conventions across other Alexandria maintainer CLIs if more commands adopt informational non-zero statuses.
