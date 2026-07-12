# Issue 297 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#297`
- Goal: migrate the grade CLI behind `alxndr grade` while preserving the existing grading behavior and output contracts.
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-021.md` and `docs/alexandria/implementation-plans/nit-cli-hardening/outcomes/O-4.md`

## Scope

- Add a real `grade` subcommand handler under `src/cli/`
- Refactor the existing grade CLI so its behavior can be invoked from both the legacy grade wrapper and `alxndr grade`
- Support the new positional library path form: `alxndr grade <path>`
- Add black-box coverage for the new `alxndr grade` surface, including help and parity with the legacy entry point

## Non-Goals

- Deleting the legacy grade wrappers
- Updating every repo reference from the legacy grade command to `alxndr grade`
- Changing grade computation, text formatting, JSON schema, exit codes, or pre-gate rules
- Migrating any other `alxndr` subcommand in this slice

## Current Gap

- `src/cli/main.ts` still routes `grade` to a placeholder error.
- `src/tools/grade.ts` only runs as a standalone process and cannot be reused cleanly from the unified router.
- The product plan requires `alxndr grade <path>` to behave like the legacy `--library <path>` entry style, but no adapter exists yet.

## Architectural Boundaries

- Keep grade computation and legacy CLI behavior owned by `src/tools/grade.ts`.
- Add a thin `src/cli/grade.ts` adapter that only translates the `alxndr` command shape into grade-tool arguments and delegates execution.
- Keep the top-level router in `src/cli/main.ts` focused on subcommand dispatch rather than reimplementing grade parsing.
- Do not touch agents, skills, templates, or unrelated docs in this slice because the legacy wrapper remains in place until FEAT-024.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| `alxndr` grade adapter | `src/cli/grade.ts`, `src/cli/main.ts` | Replaces the `grade` placeholder with a real handler and accepts a positional library path under the unified CLI |
| Grade CLI entrypoint reuse | `src/tools/grade.ts` | Exposes callable grade CLI execution so both the legacy wrapper and `alxndr grade` share the same implementation |
| Deterministic CLI coverage | `src/cli/main.test.ts`, `src/tools/grade.test.ts` | Adds black-box verification for help, positional-path adaptation, and parity with the legacy command surface |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | `alxndr grade` becomes functional while the legacy wrapper remains supported | Broader repo command-reference updates stay deferred to FEAT-024 |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Unified CLI router | `bun test src/cli/main.test.ts` | Verifies `alxndr grade` help, dispatch, and legacy-parity behavior |
| Grade tool | `bun test src/tools/grade.test.ts` | Confirms the shared grade implementation still preserves existing grading behavior |
| Repo quality gate | `bun run check` | Covers lint, shell checks, formatting, markdown audit, and typecheck for touched files |
| Regression sweep | `bun test` | Confirms the CLI refactor does not break adjacent suites |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Unified CLI / grade tool | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are sufficient because no reusable product-facing agent or skill behavior changes |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The new adapter changes grade output instead of only changing the entry point | Route both entry points through the same grade CLI implementation and add parity assertions against the legacy surface |
| Positional-path support collides with existing flags like `--input` or `--help` | Keep the adapter translation narrow: only map the first positional argument to `--library` and pass the remaining flags through unchanged |
| Refactoring `src/tools/grade.ts` into a reusable entrypoint accidentally breaks the standalone wrapper | Preserve the current standalone entrypoint behind `if (import.meta.main)` and keep the existing wrapper tests passing |

## Implementation Steps

1. Add the issue-specific technical plan for FEAT-021.
2. Refactor `src/tools/grade.ts` so the CLI execution is callable without relying on top-level `process.exit`.
3. Create `src/cli/grade.ts` to translate `alxndr grade <path>` into the shared grade CLI arguments.
4. Replace the `grade` placeholder in `src/cli/main.ts` with the real adapter.
5. Expand black-box tests for the router and grade CLI, then run the relevant deterministic checks.

## Acceptance / Exit Criteria

1. `alxndr grade <path>` behaves like `alxndr grade --library <path>`.
2. `alxndr grade --help` exits `0` and prints grade-specific usage.
3. Existing grade behavior remains available through the legacy wrapper during this migration slice.
4. `bun run check` and `bun test` pass locally.
5. A PR against `main` exists for `symphony/297` and is ready for review unless blocked by external CI or review state.

## Deferred Follow-Ups

1. FEAT-024 will delete the legacy grade wrapper and update broader command references after the rest of the CLI migrations land.
2. Any future doc sweep that switches user-facing command examples to `alxndr` belongs with the legacy-wrapper removal slice, not this one.
