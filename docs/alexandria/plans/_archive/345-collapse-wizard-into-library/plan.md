# Technical Plan: Issue 345 Collapse /wizard Into /library

- Issue reference: `#345` — `[FEAT-045] Collapse /wizard into /library and rename wizard → initialize`
- Goal: finish the rename/collapse pass so `/library` is the only live entry point, `initialize` is the active runtime name, and the repo's docs, tests, and eval metadata no longer describe the old `wizard` surface as current behavior
- Linked product plan: issue `#345`, `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/updates/2026-04-10-architecture-review-scratchpad.md`

## Scope

- Preserve `/library` as the sole product-facing library entry point
- Clean up remaining live `wizard` terminology in active docs and skill guidance where it still refers to the current initialization flow
- Align smoke-test and initialize eval metadata with the current route (`skills/library/SKILL.md`) and current artifact names (`alexandria-config.json`, `initialize-output.md`)
- Keep deterministic and eval verification aligned with the already-renamed runtime files

## Non-Goals

- Reworking the initialize algorithm, engine tables, or Raven room flow beyond terminology/metadata cleanup
- Editing frozen historical artifacts whose value depends on preserving past wording or past outputs
- Introducing a separate `/initialize` slash command; `initialize` remains an internal runtime name behind `/library`
- Rerunning unrelated skill suites just to refresh old baseline wording outside the touched surfaces

## Linked Product-Plan Summary

- The user should no longer have to choose between `/wizard` and `/library`
- "Wizard" is legacy naming and should be scrubbed from the active setup experience
- First-time setup belongs inside the persistent `/library` room, not as a second front door

## Current Implementation Gap

- The branch already removed the standalone `skills/wizard/` product surface and already renamed the live Raven job/config artifacts to initialize naming
- Remaining repo drift is concentrated in active design/reference docs, smoke/eval metadata, and a few shared guidance files that still describe the live flow as `wizard`
- Some checked-in initialize eval outputs still carry legacy metadata (`skill: "wizard"`, old transcript titles, old artifact names), which weakens the verification story for the renamed flow

## Architectural Boundaries

- `/library` remains the only discoverable user entry point for library setup and return visits
- `skills/initialize/*` remain support/reference materials loaded by Raven, not a top-level slash command
- Active runtime docs, active skill guidance, deterministic tests, and initialize eval metadata must agree on the same route and artifact names
- Imported design-history docs such as `docs/design/system-story.md` may retain original Wizard-era terminology when the file is explicitly serving as a preserved design record
- Historical transcripts, release artifacts, source-material docs, and library content may retain `wizard` wording when they are evidence rather than live runtime guidance

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Technical plan | `docs/alexandria/plans/345-collapse-wizard-into-library/plan.md` | Plan reflects the branch's actual mid-migration state instead of a from-scratch collapse |
| Product entry point and routing metadata | `skills/library/SKILL.md`, `tests/eval-cases/_smoke-test/*`, initialize eval case configs | Verification surfaces consistently point at `/library` as the active route |
| Initialize support and shared guidance | `skills/shared/play-protocol.md`, related active docs | Live documentation refers to initialize/library terminology instead of wizard terminology for the current flow |
| Eval infrastructure | `src/tools/eval-harness.ts`, `src/tools/eval-cli.ts`, `tests/eval-runner.test.ts` | Routed eval cases hash the actual skill file they execute so staleness detection works after the rename |
| Active design/runtime docs | `README.md`, non-historical `docs/design/*`, `docs/initialize/*` live references | Active documentation stops presenting wizard as the current setup surface where initialize/library is the real surface |
| Historical design docs | `docs/design/system-story.md` and similar imported design records | Preserve original terminology when it documents the historical design logic rather than the current runtime surface |
| Initialize eval baselines | `tests/evals/initialize/*` | Baseline metadata and transcript language match the renamed initialize flow and current artifact names |

## Changed Behavior Surfaces For Agents And Skills

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `library` | Remains the sole live setup entry point | Keep eval route files, smoke tests, and active docs aligned with `/library` |
| Initialize support references | Same behavior, but live guidance should call it initialize rather than wizard | Update shared guidance and active design/runtime docs that still describe the current flow with legacy terminology |
| Initialize eval coverage | Coverage already exists, but some checked-in outputs still describe the old skill/artifact names | Update the eval-facing metadata/baselines that belong to the initialize suite and rerun initialize evals |

## Deterministic Tests To Run

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, shell, formatting, and typed surfaces after the doc/test cleanup |
| Full deterministic suite | `bun test` | Covers setup, packaging, CLI routing, linting, and any path-sensitive tests touched by the rename cleanup |

## Eval Impact

| Surface | Existing coverage | Action | Command |
|--------|-------------------|--------|---------|
| `/library` initialize flow | Yes, initialize eval cases already route through `skills/library/SKILL.md` | Rerun initialize evals because the touched skill/docs/eval metadata all describe that flow | `bin/alexandria-eval run initialize/all` |
| Raven initialization guidance | Raven has eval coverage, but the current slice is terminology cleanup rather than a logic change inside `skills/raven/job-initialize.md` | No separate Raven rerun unless the implementation ends up modifying Raven job behavior directly | none unless Raven files change |
| Contributor workflow skills | No product-surface eval requirement | No eval rerun needed | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Cleaning terminology too broadly could rewrite historical evidence that should stay frozen | Limit edits to live docs, shared guidance, test inputs, and initialize eval outputs directly tied to the active flow |
| Active docs could drift away from the actual `/library` route if wording changes are only cosmetic | Prefer wording that explicitly anchors the flow to `/library`, `initialize-output.md`, and `alexandria-config.json` |
| Refreshing initialize eval baselines could hide a real behavioral regression if only metadata is reviewed | Run the suite, inspect structural/judge results, and compare against baseline instead of staging blind output churn |
| Shared docs may still mention `wizard` in design-history contexts where the term is intentional | Keep historical/product-architecture references that are clearly about past design work or generic UX examples out of scope, and add explicit historical notes when needed so review does not treat them as live-surface drift |

## Implementation Steps

1. Update this repo-specific plan to match the branch's actual state.
2. Patch active docs and shared guidance that still describe the current setup flow as `wizard`, while preserving imported design-history terminology that is intentionally archival.
3. Fix smoke-test and initialize eval metadata/inputs so they reflect `/library`, `initialize`, `alexandria-config.json`, and `initialize-output.md`.
4. Run `bun run check`.
5. Run `bun test`.
6. Run `bin/alexandria-eval run initialize/all`.
7. Review the impacted eval structural/judge results and compare against baseline before staging any refreshed outputs.
8. Perform a local review pass focused on stale live `wizard` wording and route/path drift.

## Acceptance And Exit Criteria

1. `/library` remains the only live entry point described by active product/runtime docs and eval routing metadata.
2. Active live docs and shared guidance use `initialize` for the current runtime instead of `wizard` where the reference is about the present system.
3. Smoke-test and initialize eval artifacts describe the renamed flow and current output files.
4. Relevant deterministic checks pass.
5. The initialize eval suite passes after the cleanup.

## Deferred Follow-Ups

1. Refresh additional downstream eval baselines that still mention `wizard-config.json` if a future issue explicitly scopes broader baseline hygiene.
2. Audit deeper design-history docs if the team later decides archival terminology should also be normalized.
