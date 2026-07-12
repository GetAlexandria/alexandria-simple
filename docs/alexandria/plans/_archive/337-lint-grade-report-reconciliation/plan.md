# Issue 337 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#337`
- Goal: let `alxndr lint grades <path>` reconcile grade claims when `<path>` is an explicit structured grades report file, not only a library root
- Linked product plan: issue summary references `architecture-review-hardening` outcome `O-2`; related historical repo slice: [FEAT-029](../../implementation-plans/nit-cli-hardening/tickets/FEAT-029.md), [O-1](../../implementation-plans/nit-cli-hardening/outcomes/O-1.md), and existing repo plan [305-lint-grades-reconciliation](../305-lint-grades-reconciliation/plan.md)

## Scope

- Preserve the existing grade-evidence reconciliation rules and note-severity findings.
- Extend `alxndr lint grades` so it accepts either:
  - a library/repo directory, preserving current grade-claim discovery behavior
  - an explicit structured JSON grades-report file whose claims should be reconciled against the nearest resolvable Alexandria library
- Keep the named-target CLI and `alxndr lint all` behavior stable for existing directory inputs.
- Add deterministic coverage for explicit report-file validation and execution.

## Non-Goals

- Reworking the grade reconciliation rubric or adding new discrepancy rules.
- Parsing free-form markdown grade reports or Conan prose output.
- Changing `alxndr grade` output format or introducing a new persisted report schema.
- Broadening file-path support for unrelated lint targets that still require directory inputs.

## Current Gap

- `src/tools/lint-grades.ts` can discover claims from card frontmatter and a small set of default JSON filenames under the library root, but it cannot consume an arbitrary report file passed as the lint target input.
- `src/tools/lint-core.ts` currently rejects file inputs for `grades` because `validateLintTargetPath()` requires directories and `maybeResolveLibraryRoot()` only resolves from directories.
- The current deterministic tests prove directory-based grade reconciliation, but not the explicit report-file contract described by issue `#337`.

## Architectural Boundaries

- Keep the reconciliation logic in `src/tools/lint-grades.ts`; only path/context resolution should change in `lint-core.ts`.
- Limit the new behavior to the `grades` target. Do not make `lines`, `cards`, `graph`, `layers`, `library`, or `all` accept file inputs unless their own contracts require it later.
- Reuse the existing structured-claim schema already supported by the grade lint helper; do not invent a second parser format in this slice.
- Resolve the nearest Alexandria library conservatively from the explicit report-file path rather than scanning the whole repo for unrelated libraries.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Shared lint engine | `src/tools/lint-core.ts` | `grades` path validation and execution can resolve context from an explicit report file while keeping other targets directory-only |
| Grade reconciliation helper | `src/tools/lint-grades.ts` | Grade claims can be loaded from an explicitly selected report file in addition to current library-root discovery |
| Deterministic CLI coverage | `src/tools/lint.test.ts`, `src/cli/main.test.ts` | Black-box tests cover explicit report-file input, nearest-library resolution, and unchanged router behavior |
| Repo planning docs | `docs/alexandria/plans/337-lint-grade-report-reconciliation/plan.md` | Records the issue-337 repo slice and its verification contract |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| CLI tools | `alxndr lint grades <path>` accepts explicit structured report files and reconciles them against the nearest library | Update deterministic CLI tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Grade-target CLI coverage | `bun test src/tools/lint.test.ts src/cli/main.test.ts` | Verifies explicit report-file support and router dispatch end-to-end |
| Repo quality gate | `bun run check` | Covers formatting, markdown, shell, linting, and typecheck for the touched slice |
| Regression suite | `bun test` | Confirms the grade-path hardening does not regress the wider deterministic suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr lint` CLI | No product-skill or agent eval coverage applies to this deterministic CLI slice | No eval rerun needed | N/A |
| Agents / product skills | Not changed | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| File-path support accidentally leaks into other lint targets | Keep the file-resolution path grades-specific and add tests proving router behavior only changes for `grades` |
| An explicit report file could resolve to the wrong library when nested under a repo | Walk ancestors and stop at the nearest resolvable Alexandria library instead of using broad repo-global discovery |
| Explicit report-file loading could change current directory-based merge semantics | Preserve current directory behavior and add a separate explicit-file code path rather than replacing discovery wholesale |
| Invalid or unsupported report files could silently bypass reconciliation | Reuse the existing structured parser path and cover the valid explicit-file flow with black-box tests; deeper invalid-report diagnostics stay out of scope for this issue |

## Implementation Steps

1. Add the issue-337 technical plan under `docs/alexandria/plans/337-lint-grade-report-reconciliation/`.
2. Extend grade-claim discovery so the lint helper can optionally read one explicit report file.
3. Add grades-specific library-root resolution from file inputs in the shared lint engine.
4. Add deterministic tests for explicit file-path validation and router execution.
5. Run targeted tests, then `bun run check`, then `bun test`, and review the final diff.

## Acceptance / Exit Criteria

1. `alxndr lint grades <directory>` continues to work with the current library-root discovery behavior.
2. `alxndr lint grades <report-file>` accepts a structured JSON grades report file and reconciles its claims against the nearest Alexandria library.
3. An explicit report-file run produces the same discrepancy findings as an equivalent default-library discovery case.
4. Unrelated lint targets still reject file inputs when their contract requires directories.
5. Deterministic tests cover the explicit report-file path and router dispatch.

## Deferred Follow-Ups

1. Add dedicated diagnostics for invalid or unsupported explicit grade-report files if health-check consumers need stronger operator feedback later.
2. Add support for standardized Conan-persisted markdown grade reports if the product defines a deterministic artifact format.
3. Revisit whether `alxndr lint all` should discover non-default external grade-report files when a later issue requires repo-wide report aggregation.
