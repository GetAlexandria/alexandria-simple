# Issue 302 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#302`
- Goal: add `alxndr lint plans <path>` so Nit can verify that implementation-plan checkbox steps and the file outputs they claim stay in sync.
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-026.md` and `docs/alexandria/implementation-plans/nit-cli-hardening/release.md`

## Scope

- Add a new `plans` lint target under `alxndr lint`.
- Treat the `<path>` argument as the repository root for this target and scan `docs/alexandria/implementation-plans/**/release.md` plus ticket files under `docs/alexandria/implementation-plans/**/tickets/*.md`.
- Parse checkbox acceptance/validation lines that reference file-like outputs and compare checkbox state against on-disk existence.
- Emit warning findings when `[x]` items reference missing outputs and info findings when `[ ]` items reference outputs that already exist.
- Add deterministic black-box tests that exercise positive, negative, and no-op cases with fixture implementation-plan repositories.

## Non-Goals

- Implementing the other sweep 6 targets (`paths`, `wizard`, `counts`, `grades`, `briefings`) in this slice.
- Validating prose-only acceptance criteria that do not reference a path-like output.
- Rewriting checked-in implementation plans to fix inconsistencies automatically.
- Broad documentation or terminology updates outside the minimum command-surface changes caused by adding the `plans` target.

## Linked Product-Plan Summary

- FEAT-026 defines a sweep 6 cross-system check for implementation plans.
- The mechanical rule is: checkbox items that claim to produce files must match reality on disk.
- A completed checkbox with a missing output is a warning.
- An incomplete checkbox with an existing output is a note/info finding.

## Current Gap

- `src/tools/lint-core.ts` only exposes the sweep 1-5 targets (`lines`, `cards`, `graph`, `layers`, `library`, `all`).
- `alxndr lint` currently validates directory-backed library paths only, which does not fit repo-root implementation-plan scanning.
- No plan-file parser or output-reconciliation helper exists today.
- `src/tools/lint.test.ts` and `src/cli/main.test.ts` have no coverage for a `plans` target or for repo-root sweep 6 behavior.

## Architectural Boundaries

- Keep the new plan-status parsing and file-reference extraction in a small dedicated helper module rather than further expanding unrelated sweep logic inline.
- Preserve the shared lint-engine contract so both `alxndr lint` and any remaining compatibility entry point can use the same finding and formatter pipeline.
- Scope this target to deterministic file-output checks only. Do not infer semantic completion from prose, frontmatter status, or human judgment.
- Keep the implementation read-only: lint reports drift but does not mutate plans or generated outputs.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Unified CLI | `src/cli/lint.ts`, possibly `src/cli/main.test.ts` | `alxndr lint --help` includes `plans`, and the router accepts a repo-root path for that target |
| Shared lint engine | `src/tools/lint-core.ts`, new helper such as `src/tools/lint-plans.ts` | The lint target registry gains `plans`; target-specific execution and path validation support repo-root plan scanning |
| Deterministic CLI coverage | `src/tools/lint.test.ts`, `src/cli/main.test.ts`, new fixtures if needed | Black-box tests cover missing-output warnings, already-exists info findings, and `all` target inclusion |
| Repo planning docs | `docs/alexandria/plans/302-alxndr-lint-plans/plan.md` | Captures repo-specific scope, risks, and verification for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| CLI tools | `alxndr lint plans <repo-root>` becomes a new user-facing deterministic target; `alxndr lint all` also includes it | Update CLI tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Plan-target CLI coverage | `bun test src/tools/lint.test.ts` | Verifies the new target through the real executable surface with fixture repos |
| Router/help coverage | `bun test src/cli/main.test.ts` | Confirms `plans` appears in help and dispatch works via the top-level router |
| Repo quality gate | `bun run check` | Covers formatting, markdown, shell checks, linting, and typecheck for the touched slice |
| Regression sweep | `bun test` | Confirms the new target does not regress the wider Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Lint CLI behavior | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are sufficient because this slice changes repo CLI behavior only |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Path extraction is too broad and treats prose fragments as outputs | Limit matching to checkbox lines plus explicit path-like tokens in code spans or markdown link/code-style text, and cover false-positive-sensitive cases in tests |
| Repo-root vs library-root behavior becomes inconsistent across lint targets | Keep `plans` target path handling explicit and target-specific, and document it in help/tests rather than weakening existing library-target validation |
| `all` target semantics drift if the new target is omitted or double-counted | Keep target-to-sweep/runner registration centralized and assert `all` output includes the new target’s findings in black-box coverage |
| Existing plan files use both relative and repo-rooted paths | Resolve extracted paths relative to the repository root and normalize leading `./` or surrounding punctuation in one helper |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/302-alxndr-lint-plans/`.
2. Introduce a focused helper for discovering implementation-plan markdown files, parsing checkbox lines, extracting file references, and producing findings.
3. Extend the shared lint target registry and execution flow to support `plans` and include it in `all`.
4. Add target-specific path validation so `plans` accepts a repo root while existing library targets keep directory-backed library validation.
5. Add black-box tests for warning, info, and no-finding scenarios plus router/help updates.
6. Run targeted tests, then `bun run check`, then `bun test`, and review the diff before PR handoff.

## Acceptance / Exit Criteria

1. `alxndr lint plans <repo-root>` scans `release.md` and ticket files under `docs/alexandria/implementation-plans/`.
2. A checkbox item marked `[x]` that references a missing output emits a warning finding.
3. A checkbox item marked `[ ]` that references an existing output emits an info finding.
4. Checkbox items without recognizable file outputs do not produce plan-status findings.
5. `alxndr lint --help` lists `plans`, and `alxndr lint all <path>` includes plan findings.
6. Deterministic CLI tests cover the new behavior.
7. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. FEAT-031 can consume the `plans` findings when `alxndr health-check` aggregates cross-system checks.
2. A later slice can broaden file-reference extraction if implementation plans standardize additional path-markup patterns beyond the initial deterministic set.
