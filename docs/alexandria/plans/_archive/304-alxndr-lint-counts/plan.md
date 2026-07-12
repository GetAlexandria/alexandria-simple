# Issue 304 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#304`
- Goal: add `alxndr lint counts <path>` so Nit can verify prose count claims in key repo docs and skills, including `README.md`, against the source-of-truth data they describe.
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-028.md` and `docs/alexandria/implementation-plans/nit-cli-hardening/release.md`

## Scope

- Add a new `counts` lint target under `alxndr lint`.
- Treat the `<path>` argument as the repository root for this target and scan a deterministic set of repo docs and skills, including `README.md`, for recognized numeric count claims.
- Start with the explicitly requested patterns: `N knowledge areas` and `N card types`.
- Resolve those claims against real repo data sources: the wizard catalog in `docs/wizard/wizard-engine.yaml` and the canonical type taxonomy in `src/lib/graph.ts`.
- Emit warning findings when a prose claim disagrees with the actual count, and add black-box tests for matching and mismatching cases.

## Non-Goals

- General natural-language fact checking across arbitrary prose.
- Auto-rewriting docs or skills to fix stale claims.
- Implementing other sweep 6 targets such as `paths`, `wizard`, `grades`, or `briefings` in this slice.
- Expanding beyond the first count-claim patterns unless the implementation naturally needs a small amount of shared scaffolding.

## Current Gap

- `skills/nit/sweeps.md` defines design-doc count verification in sweep 6, but the CLI has no `counts` target yet.
- The shared lint engine currently supports `plans` as the only repo-root sweep 6 target.
- Count claims such as `22 knowledge areas` and `18 card types` are hard-coded in multiple docs and skills, but there is no deterministic check that they stay aligned with `docs/wizard/wizard-engine.yaml` and `KNOWN_TYPES`.
- Existing lint tests cover line, card, graph, layer, library, and plan-status behavior, but not count-claim reconciliation.

## Architectural Boundaries

- Keep count-claim discovery and source-of-truth counting in a focused helper module, parallel to `lint-plans.ts`, rather than embedding repo-root scanning logic directly into card-library sweeps.
- Keep the initial rule set explicit and source-controlled: recognized phrases map to specific count providers, not to fuzzy NLP.
- Preserve current library-root validation for card/library targets while making `counts` another explicit repo-root target alongside `plans`.
- Limit this slice to reporting drift. No mutation, no doc generation, and no broad audit of every markdown file in the repository.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Unified CLI | `src/cli/lint.ts`, `src/cli/main.test.ts` | `alxndr lint --help` lists `counts` with README-inclusive scope text, and the router accepts a repo-root path for that target |
| Shared lint engine | `src/tools/lint-core.ts`, new helper such as `src/tools/lint-counts.ts` | The lint target registry gains `counts`; target-specific execution and repo-root validation support deterministic count-claim verification |
| Count data sources | `docs/wizard/wizard-engine.yaml`, `src/lib/graph.ts` | The new target reads these as sources of truth for knowledge-area and card-type counts |
| Deterministic CLI coverage | `src/tools/lint.test.ts`, fixture helpers under the test file | Black-box tests cover mismatching claims, matching claims, and `all` target inclusion |
| Repo planning docs | `docs/alexandria/plans/304-alxndr-lint-counts/plan.md` | Captures repo-specific scope, risks, and verification for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | `skills/nit/sweeps.md` remains the source policy the CLI now implements; keep its example wording generic so the skill does not hard-code framework counts that can drift | Rerun Nit evals if the skill text changes in this slice |
| Contributor skills | None | None |
| CLI tools | `alxndr lint counts <repo-root>` becomes a new user-facing deterministic target; `alxndr lint all` also includes it | Update CLI tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Count-target CLI coverage | `bun test src/tools/lint.test.ts` | Verifies the new target through the real executable surface with fixture repos and real repo sources of truth |
| Router/help coverage | `bun test src/cli/main.test.ts` | Confirms `counts` appears in help and dispatch works via the top-level router |
| Repo quality gate | `bun run check` | Covers formatting, markdown, shell checks, linting, and typecheck for the touched slice |
| Regression sweep | `bun test` | Confirms the new target does not regress the wider Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Lint CLI behavior | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are sufficient because this slice changes repo CLI behavior only |
| Nit sweep wording | `skills/nit/sweeps.md` has eval coverage | Rerun existing coverage if the sweep examples are edited for repo-policy alignment | `bin/alexandria-eval run nit/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Count-pattern matching is too loose and flags unrelated prose | Keep the initial matcher limited to a small explicit phrase table (`knowledge areas`, `card types`) and cover false-positive-sensitive fixture cases |
| Source-of-truth counting drifts because the helper duplicates taxonomy logic incorrectly | Read the real wizard engine file for area counting and import `KNOWN_TYPES` for card types rather than maintaining duplicate constants |
| Repo-root target behavior becomes inconsistent across `plans`, `counts`, and `all` | Keep repo-root validation centralized in `lint-core.ts` and assert `all` includes count findings in black-box tests |
| Scanning too much content creates noisy findings from generated outputs or test snapshots | Restrict the target to deterministic checked-in docs/skills paths and skip fixture/eval output trees in the implementation |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/304-alxndr-lint-counts/`.
2. Introduce a focused helper for discovering relevant markdown files, extracting recognized count claims, computing actual counts, and producing findings.
3. Extend the shared lint target registry and execution flow to support `counts` and include it in `all`.
4. Add target-specific path validation so `counts` accepts a repo root while existing library targets keep current validation.
5. Add black-box tests for matching and mismatching count claims plus router/help updates.
6. Run targeted tests, then `bun run check`, then `bun test`, and review the diff before PR handoff.

## Acceptance / Exit Criteria

1. `alxndr lint counts <repo-root>` scans key repo docs and skills, including `README.md`, for recognized numeric count claims.
2. A stale `N knowledge areas` claim emits a warning finding with claimed and actual values.
3. A stale `N card types` claim emits a warning finding with claimed and actual values.
4. Matching claims do not emit findings.
5. `alxndr lint --help` lists `counts`, and `alxndr lint all <path>` includes count findings.
6. Deterministic CLI tests cover the new behavior.
7. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. Later sweep-6 slices can add more recognized count patterns if the repo accumulates other stable numeric claims worth checking.
2. FEAT-031 can consume `counts` findings when `alxndr health-check` aggregates cross-system checks.
