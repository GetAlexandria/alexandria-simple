# Issue 338 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#338`
- Goal: make the sweep-6 briefing compliance check cover current Alexandria plan directories, not just legacy implementation-plan bundles
- Linked product-plan summary: issue summary references `architecture-review-hardening`, outcome `O-2`, and describes moving briefing compliance from agent judgment into deterministic software checks; no checked-in product-level `plan.md` link was provided in the issue handoff

## Goal

- Extend the existing `alxndr lint briefings <path>` target so it scans `CONTEXT_BRIEFING.md` artifacts under current `docs/alexandria/plans/**/` directories in addition to legacy `docs/alexandria/implementation-plans/**/`.
- Preserve the existing deterministic checks: mandatory-category coverage, card-budget enforcement, provenance presence/match rules, and card-reference resolution.
- Keep the change narrow to sweep-6 briefing discovery and path validation rather than reopening unrelated sweep-6 targets.

## Scope

- Update briefing lint path resolution so repository-root and `docs/alexandria/library/` inputs accept repos that store briefings under `docs/alexandria/plans/`.
- Discover `CONTEXT_BRIEFING.md` files recursively from both supported plan roots when they exist.
- Add deterministic tests for modern `plans/` fixtures while retaining the current legacy `implementation-plans/` coverage.
- Update CLI router coverage so `alxndr lint briefings <repo-root>` is exercised against the modern layout.

## Non-Goals

- Changing the legacy `bun run src/tools/lint.ts --sweep 6` contract; legacy sweep handling remains unchanged.
- Reworking `lint plans`, plan-status semantics, or other sweep-6 families.
- Formalizing new provenance schemas or adding automatic provenance generation for plan directories.
- Rewriting existing checked-in briefing artifacts to make the repository lint-clean.

## Current Implementation Gap

- `src/tools/lint-briefings.ts` only resolves a valid context when both `docs/alexandria/library/` and `docs/alexandria/implementation-plans/` exist.
- The repository now contains real `CONTEXT_BRIEFING.md` artifacts under `docs/alexandria/plans/`, but the briefing linter never discovers them.
- Existing test helpers and CLI fixtures only model the legacy implementation-plan layout, so current-plan behavior has no deterministic coverage.

## Architectural Boundaries

- Keep the change inside the focused briefing-lint helper and its black-box tests; do not spread plan-root heuristics across unrelated sweep-6 modules.
- Continue using `Library.fromDirectory(...)` for card existence checks instead of inventing a new card-resolution path.
- Treat modern and legacy plan roots as alternate briefing-discovery locations for the same lint family; do not branch the rule logic by directory flavor.
- Keep provenance behavior read-only and warning-level; if a modern plan directory lacks provenance, that remains a lint finding rather than a mutation step.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Briefing lint helper | `src/tools/lint-briefings.ts` | Repository-root briefing lint accepts modern `docs/alexandria/plans/` directories and scans briefings from both modern and legacy plan roots |
| Lint CLI black-box coverage | `src/tools/lint.test.ts` | Adds sweep-6 fixture coverage proving briefings under `docs/alexandria/plans/` are discovered and linted |
| Top-level CLI routing | `src/cli/main.test.ts` | Confirms `alxndr lint briefings <repo-root>` works when the repo uses the modern `plans/` layout |
| Repo planning docs | `docs/alexandria/plans/338-briefing-compliance-l6/plan.md` | Records the repo-specific scope, risks, and verification boundary for issue `#338` |

## Changed Behavior Surfaces

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| CLI tools | `alxndr lint briefings <path>` and `alxndr lint all <path>` pick up briefings from current plan directories as part of sweep 6 | Update deterministic CLI tests in the same slice |
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| Templates / docs | None beyond this technical plan | None |

## Deterministic Tests To Run

| Area | Command | Why |
|------|---------|-----|
| Briefing lint coverage | `bun test src/tools/lint.test.ts` | Covers new sweep-6 discovery behavior and regression risk in the briefing rule set |
| CLI router coverage | `bun test src/cli/main.test.ts` | Proves modern-layout repo roots route correctly through `alxndr lint briefings` |
| Repo quality gate | `bun run check` | Ensures formatting, types, and linting remain clean |
| Full deterministic regression suite | `bun test` | Confirms the path-discovery change does not regress broader CLI behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr lint` deterministic CLI | No product-skill or agent eval applies to this helper-only sweep-6 change | No eval rerun needed | N/A |
| Agents / skills / templates | Not changed | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Scanning both plan roots could duplicate findings or change ordering when both legacy and modern roots exist | Centralize discovery in one helper, de-duplicate paths deterministically, and assert stable behavior in tests |
| Relaxing path validation too far could make `briefings` run in repos that lack a usable library root | Continue requiring `docs/alexandria/library/`, and only broaden the accepted plan-root set |
| Modern plan briefings may be older or less structured than current protocol output, producing more warnings than before | Keep findings warning-level and deterministic; the slice expands visibility rather than silently suppressing real non-compliance |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/338-briefing-compliance-l6/`.
2. Refactor briefing lint context resolution to track one or more supported briefing roots instead of a single legacy implementation-plan root.
3. Update recursive briefing discovery to scan both `docs/alexandria/plans/` and `docs/alexandria/implementation-plans/` when present.
4. Extend `src/tools/lint.test.ts` and `src/cli/main.test.ts` with modern-layout fixtures and assertions.
5. Run targeted tests, then repo-wide deterministic gates, then review the diff before PR work.

## Acceptance And Exit Criteria

1. `alxndr lint briefings <repo-root>` accepts repositories that store briefings under `docs/alexandria/plans/`.
2. Sweep-6 briefing lint discovers `CONTEXT_BRIEFING.md` recursively under both supported plan roots when present.
3. The existing briefing checks still run unchanged once a briefing is discovered.
4. Deterministic tests cover the modern `plans/` layout without dropping legacy layout coverage.
5. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. Align `lint plans` and other repo-root sweep-6 helpers if the repository fully migrates away from `docs/alexandria/implementation-plans/`.
2. Decide whether current checked-in plan briefings should gain provenance artifacts or be intentionally excluded from future repo-wide lint workflows.
