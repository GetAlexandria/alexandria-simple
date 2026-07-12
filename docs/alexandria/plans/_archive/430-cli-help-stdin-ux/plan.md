# Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#430` — `[FEAT-071] Make CLI help, bare invocation, and stdin UX consistent`
- Goal: Make the shipped CLI entry points behave intentionally when invoked with `--help`, with no required arguments, or with empty stdin so users see usage guidance instead of parser explosions.
- Linked product plan: No separate checked-in product-level `plan.md` was linked from the issue. This plan is derived from the issue body plus checked-in CLI behavior and tests.

## Scope

- Add a consistent help/usage pattern for the affected CLI entry points in the current seam:
  - `bin/alexandria-initialize`
  - `bin/alexandria-retrieve`
  - `bin/alexandria-tensions`
  - `bin/alxndr grade`
- Make stdin-driven commands explain empty stdin before attempting JSON parsing.
- Keep bare invocation behavior intentional by returning usage or targeted missing-argument errors with usage attached.
- Add or update black-box Bun tests that cover `--help`, bare invocation, and empty-stdin behavior for the touched tools.
- Create `docs/alexandria/cli-report.md` with the audited commands and pre-fix/post-fix UX notes required by the issue.

## Non-Goals

- Root-resolution fixes, wrapper path redesign, or distribution changes.
- Migrating more standalone tools behind `alxndr`.
- Redesigning payload schemas or changing the core grading, retrieve, tensions, or initialize business logic.
- Broad CLI wording cleanup outside the commands audited in this issue.
- Agent, skill, or template behavior changes.

## Current Gap

- `src/tools/initialize.ts` is a top-level script that validates required flags before it checks for `--help`, so `alexandria-initialize --help` exits non-zero with a required-args error.
- `src/tools/grade.ts` and `src/tools/tensions.ts` unconditionally read stdin and try to `JSON.parse` it, so empty stdin produces raw EOF parse failures instead of an explanation of the expected input.
- `src/tools/retrieve.ts` already has a structured help path, but this issue still needs to confirm and document its behavior as part of the audited command set.
- The repo does not yet have the required checked-in CLI audit report at `docs/alexandria/cli-report.md`.

## Architectural Boundaries

- Keep the behavior change in CLI-facing helpers and tool entry points, not in the graph/grading/initialize engines themselves.
- Prefer a shared CLI helper pattern for help and stdin handling where it actually reduces duplication.
- Preserve existing shell wrappers; the fix belongs in the TypeScript command implementations they invoke.
- Keep the changes deterministic and integration-tested through the shipped entry points or Bun-run CLI scripts.
- Do not introduce eval work: this slice changes CLI UX only and does not alter product-facing reusable skill or agent behavior.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Shared CLI helpers | `src/lib/cli.ts` | Adds reusable helpers for help detection and stdin-driven JSON input handling so commands can share one UX pattern |
| Initialize CLI | `src/tools/initialize.ts`, `src/tools/initialize-cli.test.ts` | `--help` exits `0` with usage; bare invocation returns intentional guidance instead of immediately failing on required flags |
| Retrieve CLI | `src/tools/retrieve.ts`, `src/tools/retrieve.test.ts` | Verified or adjusted to keep `--help` and bare-invocation behavior aligned with the shared pattern |
| Grade CLI | `src/tools/grade.ts`, `src/tools/grade.test.ts`, `src/cli/main.test.ts` | Empty stdin and missing input explain the expected JSON input instead of surfacing raw EOF parse errors |
| Tensions CLI | `src/tools/tensions.ts`, `src/tools/tensions.test.ts` | Empty stdin and missing input explain the expected JSON input instead of surfacing raw EOF parse errors |
| CLI audit docs | `docs/alexandria/cli-report.md` | Records commands audited, pre-fix vs post-fix behavior, and any intentionally strict commands that remain |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | Help, bare invocation, and empty-stdin UX becomes consistent across the audited command seam | Keep integration tests and `docs/alexandria/cli-report.md` aligned with the actual command behavior |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Initialize CLI slice | `bun test src/tools/initialize-cli.test.ts` | Verifies help and bare-invocation behavior for the initialize entry point |
| Retrieve CLI slice | `bun test src/tools/retrieve.test.ts` | Verifies help and missing-argument behavior for the retrieve entry point |
| Grade CLI slice | `bun test src/tools/grade.test.ts src/cli/main.test.ts` | Verifies stdin-driven grade behavior directly and via `alxndr grade` |
| Tensions CLI slice | `bun test src/tools/tensions.test.ts` | Verifies empty-stdin and malformed-stdin behavior for tensions |
| Repo quality gate | `bun run check` | Required repo baseline for formatting, shell linting, markdown checks, and typecheck |
| Regression sweep | `bun test` | Confirms the help/stdin UX fixes do not regress other CLI behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI UX only | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are sufficient because no eval-backed reusable prompt surface changes |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Help and empty-stdin handling diverge again because each tool keeps custom logic | Move the common detection and messaging into shared CLI helpers where practical and cover each tool with black-box tests |
| Empty stdin and malformed non-empty stdin collapse into the same error path | Distinguish empty input from malformed JSON explicitly and keep raw parse errors only for non-empty malformed payloads |
| Fixing standalone tools but not the routed `alxndr grade` surface leaves user-visible inconsistency | Keep router-level `alxndr grade` assertions in `src/cli/main.test.ts` alongside direct tool tests |
| Documentation drifts from actual command behavior | Write the CLI report after implementation and base it on the observed command/test results rather than anticipated wording |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/430-cli-help-stdin-ux/`.
2. Add shared CLI helpers for detecting help flags and for reading stdin-driven JSON input with explicit empty-input handling.
3. Refactor `initialize`, `grade`, and `tensions` to use the shared pattern while keeping their existing command contracts intact.
4. Confirm whether `retrieve` already matches the desired pattern; only adjust it if local tests show a mismatch.
5. Add or update targeted integration tests for `--help`, bare invocation, and empty stdin across the touched tools and routed `alxndr grade`.
6. Write `docs/alexandria/cli-report.md` with the audited commands and pre-fix/post-fix behavior summary required by the issue.
7. Run the targeted tests, then `bun run check` and `bun test`, and review the final diff for consistency.

## Acceptance / Exit Criteria

1. `alexandria-initialize --help` prints usage information and exits successfully.
2. `alexandria-retrieve --help` and bare missing-argument behavior remain intentional and covered by tests.
3. `printf '' | bin/alxndr grade` explains the expected JSON input shape or usage instead of surfacing a raw EOF parse error.
4. `printf '' | bin/alexandria-tensions` explains the expected JSON input shape or usage instead of surfacing a raw EOF parse error.
5. The touched commands print usage or targeted missing-argument guidance on bare invocation rather than parser explosions.
6. `docs/alexandria/cli-report.md` exists and records the required audit summary.
7. Targeted CLI tests, `bun run check`, and `bun test` pass locally.

## Deferred Follow-Ups

1. Extend the same CLI UX audit to other shipped entry points if additional inconsistent help/stdin behavior is found outside this issue's seam.
2. Consider a broader CLI contract helper layer if more standalone tools need aligned usage rendering in future tickets.
