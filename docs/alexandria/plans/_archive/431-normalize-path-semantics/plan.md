# Issue 431 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#431`
- Goal: normalize Alexandria CLI path semantics so path-taking commands coherently accept repo roots, `docs/alexandria`, and `docs/alexandria/library` where appropriate, and explain failures with concrete guidance.
- Linked product plan: issue summary only; no separate checked-in product plan was linked from the provided issue context.

## Scope

- Introduce a shared resolver for the Alexandria path forms that maintainers actually use:
  repo root, `docs/alexandria`, and `docs/alexandria/library`.
- Apply that resolver to the path-taking CLI surfaces most exposed in day-to-day repo/library work:
  `alxndr health-check`, `alxndr lint`, `alxndr scoreboard`, `alxndr retrieve`, and `alxndr grade`'s `--library` / positional pre-gate path.
- Update help and error text so each command says what path forms it accepts instead of emitting generic "could not find" failures.
- Add black-box tests that exercise the accepted path forms and the improved failure guidance.

## Non-Goals

- Expanding path semantics for commands that are not Alexandria-library aware, such as generic repo scanners.
- Reworking lint output schemas, scoreboard derivation logic, retrieve budgets, or grade computation beyond the path-resolution layer they depend on.
- Broad documentation rewrites outside the minimum command-surface guidance needed to keep user-facing behavior aligned.
- Agent or skill prompt changes; this is a deterministic CLI slice.

## Current Gap

- `alxndr health-check docs/alexandria` currently fails from the repo root even though `docs/alexandria` is the intuitive project-level root.
- `alxndr scoreboard` already advertises repo-root and `docs/alexandria` support, but other CLI surfaces either require stricter path forms or do not explain their accepted forms clearly.
- `alxndr retrieve` and `alxndr grade --library` still treat their path input as a direct library-directory requirement instead of auto-discovering the canonical library root from the broader Alexandria path forms.
- `lint-core` validation currently mixes public-path semantics with internal execution roots, which makes guidance inconsistent across commands and leaves room for misleading acceptance/failure behavior.

## Architectural Boundaries

- Keep path normalization in shared TypeScript helpers rather than duplicating command-specific heuristics.
- Separate public path semantics from internal execution roots: commands may accept repo root or `docs/alexandria`, then resolve to the canonical `docs/alexandria/library` path internally when needed.
- Preserve deterministic CLI behavior and keep the slice read-only; no command should start mutating repo or library state.
- Do not widen the accepted forms beyond paths that mechanically map to the checked-in Alexandria layout.
- Keep help/error guidance concrete and command-local; avoid burying accepted path rules only in tests or code comments.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Shared path resolution | New shared helper module plus `lint-core` integration | Alexandria-aware CLIs resolve repo root, `docs/alexandria`, and `docs/alexandria/library` through one consistent path contract |
| `alxndr health-check` | `src/cli/health-check.ts`, `src/tools/health-check.ts` | Health-check accepts `docs/alexandria` in addition to repo root and library root, and names accepted forms in help/errors |
| `alxndr lint` | `src/cli/lint.ts`, `src/tools/lint-core.ts` | Lint validation and guidance describe accepted path forms coherently for library-aware targets without changing the lint feature surface |
| `alxndr scoreboard` | `src/cli/scoreboard.ts`, `src/tools/scoreboard-derive.ts` if needed | Help text matches actual accepted path forms, including the direct library-root path when supported |
| `alxndr retrieve` | `src/tools/retrieve.ts`, router coverage in `src/cli/main.test.ts` and/or `src/tools/retrieve.test.ts` | `--library` accepts Alexandria root forms and resolves them to the canonical library directory |
| `alxndr grade` pre-gate | `src/tools/grade.ts`, related tests | `--library` / positional pre-gate path accepts Alexandria root forms and errors with explicit guidance when resolution fails |
| Deterministic coverage | `src/cli/main.test.ts`, `src/tools/retrieve.test.ts`, `src/tools/grade.test.ts`, and any new focused helper tests | Black-box coverage locks in the accepted path matrix and new error guidance |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| CLI tools | Daily-maintainer CLIs share one Alexandria-path contract and clearer error text | Update deterministic CLI tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Router-level CLI behavior | `bun test src/cli/main.test.ts` | Covers routed subcommands, help text, and the `health-check`/`scoreboard`/`retrieve` dispatch surfaces |
| Retrieve path semantics | `bun test src/tools/retrieve.test.ts` | Verifies `--library` auto-discovery and failure guidance through the real CLI surface |
| Grade pre-gate path semantics | `bun test src/tools/grade.test.ts` | Verifies `--library` / positional path handling for structural pre-gate resolution |
| Repo quality gate | `bun run check` | Covers formatting, TypeScript, shell, and markdown checks for the touched slice |
| Wider regression coverage | `bun test` | Confirms the shared resolver does not regress the broader Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI path behavior | Deterministic CLI behavior only; no product-skill or agent eval coverage applies | No eval rerun needed | N/A |
| Agents / skills | Not changed in this issue | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Tightening path validation could break existing command invocations that accidentally relied on over-permissive directory acceptance | Limit accepted forms to the documented Alexandria layout used in current tests and maintainer workflows, then cover each supported form with black-box tests |
| Shared helpers could blur Alexandria docs-root semantics with canonical library-root semantics and break commands that need sibling files like config or signal queue | Return both Alexandria root and canonical library root from the shared resolver so commands can use the right one for their data access pattern |
| Help text could drift from actual behavior again if each command keeps its own wording | Centralize the path-shape language in shared formatting helpers where practical and assert on it in router tests |
| Normalizing one path surface could accidentally change lint output paths or other user-visible report details beyond the issue scope | Keep the refactor focused on validation and input resolution; avoid changing finding schemas or report-relative file formatting unless a test proves it is required |

## Implementation Steps

1. Add this issue-specific plan under `docs/alexandria/plans/431-normalize-path-semantics/`.
2. Introduce a shared Alexandria-path resolver that can distinguish repo root, Alexandria root, and canonical library root.
3. Refactor `health-check` to use the shared resolver and accept `docs/alexandria`.
4. Update `lint` validation/guidance, `scoreboard` help text, `retrieve --library`, and `grade --library` / positional pre-gate handling to use the normalized path contract.
5. Add or update black-box tests for accepted path forms and improved errors.
6. Run targeted deterministic tests, then `bun run check`, then `bun test`.
7. Review the final diff for scope control, guidance clarity, and path-contract consistency before PR follow-through.

## Acceptance / Exit Criteria

1. `alxndr health-check` succeeds when invoked with repo root, `docs/alexandria`, or `docs/alexandria/library`.
2. `alxndr retrieve --library` accepts the same Alexandria root forms and resolves them to the canonical library directory.
3. `alxndr grade --library` and positional library shortcut accept the same Alexandria root forms for structural pre-gate resolution.
4. `alxndr lint` and `alxndr scoreboard` help/error guidance clearly states the accepted path forms for their Alexandria-aware path inputs.
5. Invalid path failures explain what form the command expects instead of only saying it could not find a library.
6. Targeted deterministic tests cover the normalized path matrix and pass locally.
7. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. Audit additional path-taking tools beyond this slice if future issue work shows more divergence.
2. If path guidance expands into end-user docs later, add a dedicated CLI usage section instead of scattering examples across unrelated docs.
