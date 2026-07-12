# Issue 364 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#364`
- Goal: rerun the existing Conan eval suite after the architecture-review-hardening changes, review the deltas against the 2026-04-08 baselines, and check in refreshed Conan baselines if scores hold or improve
- Linked product plan: [architecture-review-hardening release](../../implementation-plans/architecture-review-hardening/release.md), [Issue 347 plan](../347-agent-file-format/plan.md), [Issue 307 plan](../307-alxndr-health-check-json/plan.md)

## Scope

- Add the issue-specific repo plan for the Conan eval refresh slice.
- Rerun the checked-in `conan/all` eval suite (`grade`, `inventory`, `surgery`) against the current `main` / `symphony/364` state.
- Review `results` and `compare` output for each Conan case against the 2026-04-08 baseline.
- Update the checked-in Conan eval baselines under `tests/evals/conan/` if the rerun holds or improves.
- Record any uncovered behavior risk that the existing Conan suite still does not exercise.

## Non-Goals

- Rewriting `agents/conan.md` or any `skills/conan/*` prompt files in this slice unless the rerun reveals a concrete regression that must be fixed before merge.
- Creating a brand-new Conan eval case unless the current rerun shows the existing suite is insufficient to judge the slice honestly.
- Running unrelated agent eval suites just because the architecture-review-hardening program touched multiple surfaces.
- Performing release-version updates or unrelated docs cleanup.

## Current Gap

- The checked-in Conan baselines were last refreshed on 2026-04-08 at git SHA `cfbe3d3`, before the architecture-review-hardening changes called out in the issue.
- Conan's eval-backed surface has changed since then through agent-format standardization and prompt updates in `agents/conan.md`, `skills/conan/job-grade.md`, and `skills/conan/job-health-check.md`.
- The repo has existing Conan eval coverage for `grade`, `inventory`, and `surgery`, but no dedicated `health-check` eval case on disk, so the rerun can only validate the existing covered behaviors plus any indirect prompt drift.

## Architectural Boundaries

- Treat this issue as an eval-validation slice, not a feature slice. The primary shipped changes should be the plan doc plus refreshed Conan baselines if the rerun is healthy.
- Preserve the existing behavior-to-eval mapping in `EVALS.md`: `agents/conan.md` and `skills/conan/*` map to `bin/alexandria-eval run conan/all`.
- Do not claim that `conan/all` directly validates the new health-check CLI pre-flight behavior when no `health-check` eval case exists; document that coverage boundary explicitly.
- Keep any remediation tightly scoped if a regression appears: fix only the behavior proven by eval evidence, then rerun the impacted Conan cases.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo planning docs | `docs/alexandria/plans/364-run-conan-evals/plan.md` | Records the repo-specific eval rerun scope, verification, and coverage boundary for issue 364 |
| Conan eval baselines | `tests/evals/conan/grade/*`, `tests/evals/conan/inventory/*`, `tests/evals/conan/surgery/*` | Refreshes checked-in transcripts, metadata, structural results, and judge results to the current Conan behavior if scores hold or improve |
| PR / issue QA summary | PR description or follow-up summary for issue 364 | States which Conan behaviors were rerun, whether scores changed, and that `job-health-check` still has no dedicated eval case |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Conan eval-backed surface | No new intended behavior change in this slice; this issue validates already-landed behavior from architecture-review-hardening work | Review `results` and `compare` output before accepting any baseline refresh |
| Conan health-check coverage boundary | No direct eval case exists for `skills/conan/job-health-check.md`; the rerun only provides indirect signal via shared prompt context | Call out the missing direct coverage in the final issue/PR summary and defer a dedicated case if still needed |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo quality gate | `bun run check` | Required repo gate for the touched docs/baseline slice |
| Regression suite | `bun test` | Confirms the wider deterministic suite still passes before PR handoff |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Conan agent + shared Conan skills | `tests/eval-cases/conan/grade`, `tests/eval-cases/conan/inventory`, `tests/eval-cases/conan/surgery` | Rerun the existing Conan suite because `agents/conan.md` and `skills/conan/*` changed since the current baseline | `bin/alexandria-eval run conan/all --parallel` |
| Conan `grade` behavior | Direct existing coverage | Review `results` and `compare`; refresh baseline only if scores hold or improve | `bin/alexandria-eval results conan/grade`, `bin/alexandria-eval compare conan/grade` |
| Conan `inventory` behavior | Direct existing coverage | Review `results` and `compare`; refresh baseline only if scores hold or improve | `bin/alexandria-eval results conan/inventory`, `bin/alexandria-eval compare conan/inventory` |
| Conan `surgery` behavior | Direct existing coverage | Review `results` and `compare`; refresh baseline only if scores hold or improve | `bin/alexandria-eval results conan/surgery`, `bin/alexandria-eval compare conan/surgery` |
| Conan `health-check` behavior | No dedicated eval case in `tests/eval-cases/conan/` | Do not invent coverage implicitly; note the gap explicitly unless the rerun proves a blocking blind spot | Deferred follow-up, no new case in this issue by default |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The current Conan baselines may hide a regression introduced by prompt restructuring or grade-job clarifications | Inspect per-case `results` and `compare` output, not just run success, before refreshing baselines |
| `conan/all` may appear to validate `job-health-check.md` even though no direct case exists | State the coverage gap plainly in the plan and final handoff instead of overclaiming |
| A regression in one Conan case could tempt a broad prompt rewrite | Keep remediation focused on the concrete failing behavior, then rerun only the impacted Conan suite until it holds |
| Full-repo deterministic checks may fail for reasons unrelated to Conan eval refresh | Leave the workspace inspectable, report the failing command exactly, and do not discard generated eval artifacts |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/364-run-conan-evals/`.
2. Run `bin/alexandria-eval run conan/all --parallel`.
3. Review `bin/alexandria-eval results` and `compare` output for `conan/grade`, `conan/inventory`, and `conan/surgery`.
4. If scores hold or improve, keep the refreshed `tests/evals/conan/*` outputs; if a case regresses, diagnose the concrete behavior before changing baselines.
5. Run `bun run check` and `bun test`.
6. Review the final diff for baseline integrity, coverage-boundary honesty, and plan alignment.
7. Commit the plan plus any refreshed Conan baselines, then open or update the PR against `main`.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/364-run-conan-evals/plan.md` exists and reflects the repo-specific rerun scope for issue 364.
2. `bin/alexandria-eval run conan/all --parallel` completes for the checked-in Conan cases.
3. `results` and `compare` have been reviewed for `conan/grade`, `conan/inventory`, and `conan/surgery`.
4. Any updated Conan baselines under `tests/evals/conan/` correspond to runs whose scores held or improved.
5. `bun run check` and `bun test` pass locally, or any failure is reported with the workspace left intact for inspection.
6. The final handoff states clearly that Conan health-check behavior still lacks a dedicated eval case if that remains true after the slice.

## Deferred Follow-Ups

1. Add a dedicated Conan `health-check` eval case if maintainers want direct coverage of the CLI pre-flight + LLM-judgment split introduced in `skills/conan/job-health-check.md`.
2. If the Conan suite starts covering more job routes, update `EVALS.md` and the targeted-evals guidance so the coverage map stays truthful.
