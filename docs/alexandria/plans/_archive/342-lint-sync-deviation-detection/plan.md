# Issue 342 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#342`
- Goal: add a `sync` target to `alxndr lint` that deterministically reports downstream-sync drift between the canonical Alexandria reference and the checked-in meta-files that describe library structure
- Linked product plan: [FEAT-042](../../implementation-plans/architecture-review-hardening/tickets/FEAT-042.md), [O-2](../../implementation-plans/architecture-review-hardening/outcomes/O-2.md)

## Scope

- Add a new sweep-6 `sync` lint target and wire it into the named-target CLI surface.
- Resolve the canonical reference source for this repo and downstream library installs:
  - prefer `docs/alexandria/reference.md` when linting an Alexandria library/repo that contains it
  - fall back to `templates/reference.md` when linting this plugin repository, where the checked-in reference source currently lives there
- Read `skills/conan/job-downstream-sync.md` as the checked-in source of truth for which downstream-sync targets should be audited, instead of hardcoding a stale file count from the product ticket text.
- Parse enough canonical structure from the reference to support deterministic detection for the deviation families called out by FEAT-042.
- Add black-box CLI tests that exercise the new target and cover the supported deviation types against controlled fixtures.

## Non-Goals

- Automatically fixing downstream-sync drift; Conan remains responsible for judgment-bearing edits.
- Rewriting `skills/conan/job-downstream-sync.md` to resolve the current "13 files" wording mismatch.
- Broad natural-language understanding of every prose statement inside the audited meta-files.
- Changing existing layer/library/path lint behavior outside the minimum routing needed to add `sync`.

## Current Gap

- `src/tools/lint-core.ts` exposes sweep-6 targets for `paths`, `grades`, `plans`, `counts`, `briefings`, and `wizard`, but there is no `sync` target.
- The deterministic lint engine already parses manifests and conformance tables, but it has no helper for comparing the canonical reference against downstream meta-files.
- FEAT-042 requires downstream-sync deviation detection, yet the current repo still relies on Conan's prose job file and manual review to spot drift.
- The product ticket assumes `docs/alexandria/reference.md`, while this repository currently keeps the checked-in reference source at `templates/reference.md`; the implementation must translate that mismatch explicitly.

## Architectural Boundaries

- Keep the new logic in dedicated lint helpers plus `lint-core` routing rather than embedding ad hoc downstream-sync parsing directly inside the CLI wrapper.
- Treat `skills/conan/job-downstream-sync.md` as configuration for target discovery, but keep the deviation detectors deterministic and code-driven.
- Restrict this slice to mechanical comparisons that can be anchored to explicit tables, bullet lists, folder paths, file references, and known terminology mappings.
- Do not couple the new check to agent execution or mutate skill/agent prompts in this issue.
- Do not force the plugin repo to synthesize a missing `docs/alexandria/reference.md`; handle the current repo layout intentionally.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Shared lint engine | `src/tools/lint-core.ts` | Adds `sync` target validation, routing, and inclusion in the named-target surface |
| Downstream-sync lint helper | `src/tools/lint-sync.ts` (new) and any supporting parser helpers | Parses canonical reference + downstream-sync target list and emits deviation findings |
| Deterministic CLI coverage | `src/tools/lint.test.ts`, `src/cli/main.test.ts` | Black-box coverage for `alxndr lint sync`, help/target routing, and representative deviation findings |
| Repo planning docs | `docs/alexandria/plans/342-lint-sync-deviation-detection/plan.md` | Records the repo-specific contract, reference fallback, and verification |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| CLI tools | `alxndr lint sync <repo-path>` reports downstream-sync drift against the canonical reference and manifest-file list from Conan's downstream-sync job | Add deterministic CLI tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Sync-target CLI coverage | `bun test src/tools/lint.test.ts src/cli/main.test.ts` | Verifies the new target, output contract, and router/help behavior end-to-end |
| Repo quality gate | `bun run check` | Covers formatting, markdown, shell, linting, and typecheck for the touched TypeScript and plan doc |
| Regression suite | `bun test` | Confirms the new sweep-6 target does not regress the wider deterministic suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr lint` CLI | Deterministic CLI surface; no product-skill or agent eval coverage applies | No eval rerun needed | N/A |
| Agents / product skills | Not changed | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The checked-in downstream-sync skill no longer matches the ticket's stale "13 files" count | Derive the target file list from the live checked-in skill and record the count mismatch in the plan rather than freezing an outdated number into code |
| Prose-heavy files could make deviation detection noisy or brittle | Limit the first slice to explicit anchors already present in the docs: file tables, type names, known terminology map, folder paths, and retrieval-profile headings/examples |
| The missing `docs/alexandria/reference.md` in this repo could make the target unusable locally | Implement explicit reference-source resolution with a documented fallback to `templates/reference.md` for this repository |
| A broad all-files scan could produce low-signal findings from files that are not real downstream-sync targets | Only audit files enumerated by `skills/conan/job-downstream-sync.md` and skip targets that do not exist in the current checkout |

## Implementation Steps

1. Add the issue-342 technical plan under `docs/alexandria/plans/342-lint-sync-deviation-detection/`.
2. Implement a downstream-sync helper that:
   - resolves the canonical reference file
   - extracts canonical type names, terminology mappings, and folder-path expectations
   - reads the downstream-sync target list from `skills/conan/job-downstream-sync.md`
   - audits each target file for the supported deterministic deviation families
3. Add `sync` to the lint target enums, descriptions, validation, help text, and execution path in `src/tools/lint-core.ts`.
4. Add deterministic fixtures/tests for representative missing-type, stale-type, stale-terminology, missing-folder-path, missing-retrieval-profile, wrong-example, and stale-section-header findings.
5. Run targeted tests, then `bun run check`, then `bun test`, and review the final diff against the plan.

## Acceptance / Exit Criteria

1. `alxndr lint sync <repo-path>` is a valid named target and emits sweep-6 findings in the existing lint output format.
2. The sync target audits the live downstream-sync target list defined by `skills/conan/job-downstream-sync.md` rather than a hardcoded stale count.
3. The sync target resolves the canonical reference from `docs/alexandria/reference.md` when present and from `templates/reference.md` for this repo's checked-in development layout.
4. The implementation reports supported downstream-sync deviation findings with file, line, rule, message, and fix suggestion.
5. Deterministic CLI tests cover the new target and each supported deviation family.

## Deferred Follow-Ups

1. Narrow or expand the audited target set if the downstream-sync job file is cleaned up to restore an intentional fixed count.
2. Add richer section-template comparison if future issues require full template-header validation beyond the explicit anchors supported in this slice.
3. Consider optional auto-fix generation once the detection-only contract has proven stable.
