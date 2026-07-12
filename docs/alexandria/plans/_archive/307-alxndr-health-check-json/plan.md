# Issue 307 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#307`
- Goal: implement `alxndr health-check <path>` as a deterministic JSON pre-flight for Conan's health-check workflow, aggregating existing lint targets plus inventory and standards-health summaries without treating findings as CLI failures
- Linked product plan: [FEAT-031](../../implementation-plans/nit-cli-hardening/tickets/FEAT-031.md), [O-2](../../implementation-plans/nit-cli-hardening/outcomes/O-2.md), [nit-cli-hardening release](../../implementation-plans/nit-cli-hardening/release.md)

## Scope

- Replace the placeholder `health-check` router entry with a real subcommand implementation.
- Add a focused health-check aggregation module that:
  - reuses the existing lint target execution surface
  - computes deterministic `inventory`, `standards_health`, `metrics`, and target-grouped `findings`
  - preserves deterministic ordering for stable diffs
- Support repo-root invocation while requiring direct library paths to resolve to the canonical `docs/alexandria/library` location.
- Add black-box CLI tests for help text, success semantics, grouped findings, and schema stability on a fixture library.

## Non-Goals

- Refactoring `skills/conan/job-health-check.md`; FEAT-032 owns the Conan-side protocol change.
- Adding new lint rules or changing existing lint severities.
- Inventing a new persisted artifact format for inventory or grade data beyond the manifests and grade inputs the repo already supports.
- Turning health-check findings into failing exit codes. Findings are report data in this slice, not command failures.
- Adding eval coverage. This is a deterministic CLI slice only.

## Current Gap

- `src/cli/main.ts` still routes `health-check` to a placeholder error.
- `alxndr lint` can already compute the underlying mechanical findings and library metrics, but there is no higher-level JSON document organized for Conan's health-check flow.
- Inventory expectations live implicitly in existing manifest parsing helpers, and standards structural checks are spread across library parsing plus lint helpers rather than exposed as a dedicated health-check view.
- Current router tests only verify that `health-check` is unimplemented.

## Architectural Boundaries

- Keep the new behavior in CLI/tool code, not in agent or skill files. The output contract lands here; Conan consumes it in the next issue.
- Reuse `Library`, lint-target execution, and manifest/conformance helpers rather than reparsing cards in a separate ad hoc path.
- Keep health-check read-only. It reports deterministic substrate for Conan's phases; it does not mutate cards, manifests, plans, or grade artifacts.
- Keep direct-path validation stricter than `alxndr lint`: repo roots may resolve through the shared helper, but direct library paths must be canonical Alexandria library roots.
- Treat repo-only lint targets as best-effort from the provided input path. If a target is not applicable from the given root, record that deterministically instead of failing the whole health check.
- Do not overclaim judgment. Standards health in this slice is limited to mechanical checks (WHY-link presence, HOW-spec presence, anti-example presence, conforming-card presence).

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Unified CLI router | `src/cli/main.ts`, new `src/cli/health-check.ts`, `src/cli/main.test.ts` | `alxndr health-check` becomes a working top-level subcommand with JSON output and non-failing findings semantics |
| Health-check aggregation | new `src/tools/health-check.ts`, `src/tools/health-check.test.ts` | Aggregates lint-target reports into stable `inventory`, `standards_health`, `metrics`, and grouped `findings` sections while degrading target-level runtime failures into deterministic unavailable entries |
| Shared lint integration | `src/tools/lint-core.ts` exports reused by the new health-check module | Existing target validation and execution are reused rather than duplicated |
| Deterministic CLI coverage | `src/tools/lint.test.ts` and/or `src/cli/main.test.ts` | Black-box tests assert schema shape, deterministic ordering, and success behavior |
| Repo planning docs | `docs/alexandria/plans/307-alxndr-health-check-json/plan.md` | Records the repo-specific implementation and verification contract for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None in this slice | FEAT-032 updates Conan's health-check workflow to consume the new JSON |
| Product skills | None in this slice | FEAT-032 updates `skills/conan/job-health-check.md` |
| Contributor skills | None | None |
| CLI tools | `alxndr health-check <path>` becomes the structured JSON health-report surface for Conan pre-flight | Add deterministic CLI tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Health-check target error handling | `bun test src/tools/health-check.test.ts` | Verifies unexpected lint-target failures degrade into deterministic unavailable report groups |
| Health-check router and CLI behavior | `bun test src/cli/main.test.ts` | Verifies help text, dispatch, and top-level success semantics |
| Health-check aggregation | `bun test src/tools/lint.test.ts` | Exercises the real executable surface against fixture libraries and validates grouped JSON output |
| Repo quality gate | `bun run check` | Covers formatting, markdown, shell, linting, and typecheck for the touched slice |
| Regression suite | `bun test` | Confirms the new subcommand does not regress the wider Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr` CLI health-check behavior | No product-skill or agent eval coverage applies to this deterministic CLI slice | No eval rerun needed | N/A |
| Conan skill / product-facing prompt behavior | Not changed in this issue | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The health-check schema could drift from what FEAT-032 needs | Keep the schema explicitly aligned with the checked-in FEAT-031 contract (`inventory`, `standards_health`, `metrics`, `findings`) and the current Conan phase names, without folding the skill refactor into this slice |
| Inventory expectations may be unavailable when no manifest exists | Make manifest-backed expectation data explicit in the JSON and degrade gracefully instead of inventing missing/unexpected counts from nothing |
| Standards structural checks could blur into Conan judgment | Limit the report to countable checks only and keep content-quality assessment out of this issue |
| Re-running all lint targets could accidentally propagate lint exit semantics into health-check | Implement health-check success semantics separately: exit `0` on successful report generation regardless of findings, `1` only for invalid invocation or internal errors |
| Repo-root-only lint targets may not apply when the command is run against a library root | Validate each target independently and record unavailable targets deterministically in the grouped findings payload |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/307-alxndr-health-check-json/`.
2. Implement a dedicated health-check aggregation module that reuses `Library`, manifest helpers, and lint-target execution.
3. Add a CLI subcommand handler for `alxndr health-check <path>` and replace the router placeholder.
4. Add black-box tests covering JSON schema, grouped findings, target availability handling, and exit-code behavior.
5. Run the targeted deterministic tests, then `bun run check`, then `bun test`.
6. Review the final diff for schema clarity, ordering stability, and FEAT-032 handoff readiness.

## Acceptance / Exit Criteria

1. `alxndr health-check <path>` emits valid JSON to stdout.
2. The JSON includes `inventory`, `standards_health`, `metrics`, and `findings` top-level sections.
3. Findings are grouped by lint target with deterministic ordering.
4. Standards health reports one entry per Standard card with mechanical checks for WHY links, HOW-spec presence, anti-example presence, and conforming product cards.
5. Inventory data reports actual counts plus manifest-backed expectation data when available, without failing when manifests are absent.
6. The command exits `0` when report generation succeeds even if findings exist, and exits `1` only for invalid input or internal failure.
7. Targeted deterministic tests cover router dispatch and the health-check JSON schema.
8. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. FEAT-032 will update `skills/conan/job-health-check.md` to call `alxndr health-check` and consume the JSON for phases 2-3.
2. If Conan needs richer source-alignment substrate during FEAT-032, extend the schema deliberately there rather than guessing in this issue.
3. If health-check and lint start sharing more aggregation helpers, extract those helpers only after the JSON contract proves stable.
