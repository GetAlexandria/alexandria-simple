# Issue 305 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#305`
- Goal: add `alxndr lint grades <path>` so Nit can reconcile Conan's dimension grades against countable card evidence
- Linked product plan: [FEAT-029](../../implementation-plans/nit-cli-hardening/tickets/FEAT-029.md), [O-1](../../implementation-plans/nit-cli-hardening/outcomes/O-1.md), [nit-cli-hardening release](../../implementation-plans/nit-cli-hardening/release.md)

## Scope

- Add a new `grades` lint target under `alxndr lint` for library-root inputs.
- Discover structured grade data from the library when available, using the existing `alxndr grade` input shape (`cards[].dimensions`) and card-frontmatter equivalents as the supported sources in this slice.
- Compare grade claims against deterministic card evidence for:
  - missing H2 dimension sections
  - `WHERE` A-range grades vs. contextualized WHERE-link counts
  - `HOW` A-range grades vs. example / anti-example counts
  - 700+ word cards vs. explicit atomicity-note metadata in the grade data
- Emit note-severity findings (`info` in the CLI schema) for discrepancies.
- Extend deterministic CLI tests and router/help coverage for the new target and its inclusion in `alxndr lint all`.

## Non-Goals

- Parsing free-form Conan prose grade reports or inventing a markdown-report parser in this slice.
- Changing `alxndr grade` storage behavior or requiring Conan to emit a new artifact format.
- Implementing the other sweep 6 families still tracked under the nit hardening plan (`paths`, `wizard`, `counts`, `briefings`, broader regression detection).
- Expanding the rubric into full mechanical grading; this slice only catches contradictions between recorded grade claims and countable evidence.

## Current Gap

- `src/tools/lint-core.ts` currently exposes `plans` as the only implemented sweep-6-style named target; there is no `grades` target.
- The shared lint engine has no grade-data discovery, no structured parser for per-card dimension claims, and no grade/evidence reconciliation logic.
- `src/tools/grade.ts` consumes structured dimension data but does not persist or expose a reusable reader for sweep 6.
- `src/tools/lint.test.ts` and `src/cli/main.test.ts` have no coverage for grade reconciliation behavior.

## Architectural Boundaries

- Keep grade-data discovery and reconciliation logic in a small dedicated helper module rather than continuing to grow `lint-core.ts` inline.
- Reuse the shared `Library` graph/card model for mechanical evidence rather than reparsing card markdown ad hoc.
- Treat this as a deterministic CLI slice: read existing structured grade data when present, report contradictions, and stay read-only.
- Support only structured grade claims that can be mapped reliably to cards and dimensions. Do not infer per-dimension grades from narrative grade reports in this issue.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Unified CLI | `src/cli/lint.ts`, `src/cli/main.test.ts` | `alxndr lint --help` lists `grades`, router dispatch accepts the new target, and `all` continues to aggregate the full implemented surface |
| Shared lint engine | `src/tools/lint-core.ts`, new helper such as `src/tools/lint-grades.ts` | The lint target registry gains `grades`; library-target execution can run grade reconciliation and include it in `all` |
| Grade-data parsing | new helper in `src/tools/` plus `src/lib/frontmatter.ts` usage | The repo can discover structured per-card dimension claims from `grades.json`-style files and card frontmatter |
| Deterministic CLI coverage | `src/tools/lint.test.ts`, `src/cli/main.test.ts` | Black-box tests cover discrepancy findings, no-grade-data no-op behavior, and router/help wiring |
| Repo planning docs | `docs/alexandria/plans/305-lint-grades-reconciliation/plan.md` | Records repo-specific scope, risks, and verification for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| CLI tools | `alxndr lint grades <path>` becomes a new deterministic target for sweep-6 grade/evidence checks | Update CLI tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Grade-target CLI coverage | `bun test src/tools/lint.test.ts` | Verifies grade-data discovery and reconciliation findings through the executable lint surface |
| Router/help coverage | `bun test src/cli/main.test.ts` | Confirms `grades` is listed and dispatch works through the top-level CLI |
| Repo quality gate | `bun run check` | Covers formatting, markdown, shell, linting, and typecheck for the touched slice |
| Regression suite | `bun test` | Confirms the new target does not regress the wider Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr lint` CLI | No product-skill or agent eval coverage applies to this deterministic CLI slice | No eval rerun needed | N/A |
| Agents / product skills | Not changed | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Grade data has no stable persisted schema in the repo yet | Limit support to the one concrete structured schema already implied by `src/tools/grade.ts` plus conservative frontmatter aliases, and make the target a clean no-op when no usable grade data exists |
| Reconciliation could overclaim beyond what mechanics can prove | Encode only contradiction-style checks from FEAT-029 (missing section, A-range evidence thresholds, atomicity note presence) and emit notes rather than warnings/errors |
| `all` target semantics could drift if sweep-6 library checks and repo-root plan checks are merged inconsistently | Keep target registration centralized in `lint-core.ts` and add black-box coverage proving `all` includes both plan and grade findings when both contexts are present |
| Example / anti-example counting could be brittle across markdown styles | Count only clearly structured subsection content already used by the repo fixtures and avoid pretending to understand arbitrary prose examples in this slice |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/305-lint-grades-reconciliation/`.
2. Introduce a focused helper that discovers structured grade data from the library, normalizes per-card grade claims, and compares them against `Library` card evidence.
3. Extend the shared lint target registry and execution flow to support `grades` and include it in `all`.
4. Add deterministic black-box tests for each discrepancy rule, for frontmatter / file discovery, and for the no-grade-data case.
5. Update router/help coverage for the new target.
6. Run targeted tests, then `bun run check`, then `bun test`, and review the diff before PR handoff.

## Acceptance / Exit Criteria

1. `alxndr lint grades <path>` runs against a library root and exits successfully when only note-severity discrepancies are found.
2. A card with a missing dimension section but a non-`F` / non-`FAIL` grade for that dimension produces a sweep-6 discrepancy finding.
3. A card with an A-range `WHERE` grade but fewer than 3 contextualized WHERE links produces a discrepancy finding.
4. A card with an A-range `HOW` grade but fewer than 2 examples or fewer than 1 anti-example produces a discrepancy finding.
5. A card over 700 words without a structured atomicity note in the grade data produces a discrepancy finding.
6. Running `alxndr lint grades` with no usable grade data emits no grade-only findings and does not fail.
7. `alxndr lint --help` lists `grades`, and `alxndr lint all <path>` includes grade findings when grade data is present.

## Deferred Follow-Ups

1. Add support for Conan-persisted markdown grade reports if the product standardizes a deterministic grade-report artifact format later.
2. Broaden sweep 6 to cover the remaining cross-system targets tracked in FEAT-025 through FEAT-030.
3. Consider extracting shared grade-data normalization if `health-check` or future Conan tooling needs the same persisted assessment format.
