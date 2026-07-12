# Issue #365 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#365`
- Goal: Re-run Sam's eval-backed coverage after recent `agents/sam.md` and `skills/sam/rules.md` changes, confirm no regressions, and refresh checked-in baselines if the results hold or improve.
- Linked product plan: None. The GitHub issue itself is the product-level intent for this slice.

## Scope

- Run the impacted Sam eval cases: `sam/create-cards` and `sam/fix-cards`.
- Review structural and judge results against the 2026-04-08 checked-in baselines.
- Update checked-in baseline artifacts under `tests/evals/sam/` if scores hold or improve.
- If the rerun exposes a regression, make the smallest Sam or eval-runner fix required and rerun the impacted evals before handoff.

## Non-Goals

- Changing Sam behavior speculatively without an eval-backed regression.
- Broad eval-harness changes or new Sam eval-case creation unless the rerun reveals an uncovered behavior gap.
- Running unrelated repo-wide eval suites.
- Version bumps, release prep, or unrelated cleanup.

## Current Gap

- The repository already has Sam eval coverage and checked-in baselines from 2026-04-08.
- Since that baseline, `agents/sam.md` and `skills/sam/rules.md` changed across recent PRs.
- Issue #365 requires a targeted rerun so the repo has current evidence that Sam's reusable create/fix behavior still holds after those updates.
- During implementation, the rerun exposed a harness gap: multi-turn evals were not invoking `@sam` on turn 1, so the Sam evals were not reliably exercising the Sam agent contract. This slice must fix that before trusting refreshed baselines.

## Architectural Boundaries

- This slice belongs to eval maintenance for an existing product-facing agent surface.
- Baseline updates belong under `tests/evals/sam/`; behavior fixes, if needed, belong only in the Sam agent or Sam skill files that caused the regression.
- This slice does not introduce new product workflows, change non-Sam agents, or alter the general eval harness unless the rerun proves the harness itself is the blocker.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Technical planning | `docs/alexandria/plans/365-run-sam-evals/plan.md` | Records repo-specific scope, verification, and exit criteria for the eval refresh. |
| Eval harness | `src/tools/eval-harness.ts`, `tests/eval-runner.test.ts` | Ensures multi-turn evals actually invoke the targeted skill/agent on turn 1 before resuming the session. |
| Sam eval baselines | `tests/evals/sam/create-cards/`, `tests/evals/sam/fix-cards/` | Refreshes checked-in evidence for existing Sam create/fix behavior if reruns hold or improve. |
| Sam prompt surfaces, only if needed | `agents/sam.md`, `skills/sam/*.md` | Small corrective fix if rerun exposes a real Sam regression tied to recent agent/rules changes. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Multi-turn eval runner | Prefixes the first multi-turn turn with `@<skill>` so routed evals actually exercise the target agent/skill before session resume. | Add deterministic coverage in `tests/eval-runner.test.ts`; rerun impacted Sam evals; refresh baselines after the corrected runner is in place. |
| `sam` agent eval coverage | No intended behavior change in this slice; the goal is to verify current create/fix behavior still matches expectations after recent prompt edits. | Update `tests/evals/sam/*` artifacts if the rerun is acceptable. |
| `agents/sam.md` or `skills/sam/*` | Only changes if a rerun shows a regression that must be corrected before baseline refresh. | Re-run impacted Sam evals, update baselines, and include the fix in PR summary if applicable. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Sam eval CLI path | `bin/alexandria-eval status` | Confirms current baseline state and last-run metadata before rerun. |
| Eval harness regression coverage | `bun test tests/eval-runner.test.ts` | Verifies multi-turn evals invoke the targeted skill on turn 1 and preserves existing runner behavior. |
| Repo checks, only if tracked files beyond baselines or prompt files change | `bun run check` | Required if this slice changes docs/prompt files or code beyond pure eval baseline artifacts. |
| Repo tests, only if tracked files beyond baselines or prompt files change | `bun test` | Required if this slice changes docs/prompt files or code beyond pure eval baseline artifacts. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Multi-turn eval invocation | `tests/eval-runner.test.ts` covers harness mechanics but did not cover first-turn skill invocation for multi-turn mode. | Add targeted deterministic coverage and rerun it before trusting Sam results. | `bun test tests/eval-runner.test.ts` |
| Sam create-card behavior | Yes: `sam/create-cards` | Rerun and compare to baseline. Update baseline if acceptable. | `bin/alexandria-eval run sam/all --parallel`, `bin/alexandria-eval results sam/create-cards`, `bin/alexandria-eval compare sam/create-cards` |
| Sam fix-card behavior | Yes: `sam/fix-cards` | Rerun and compare to baseline. Update baseline if acceptable. | `bin/alexandria-eval run sam/all --parallel`, `bin/alexandria-eval results sam/fix-cards`, `bin/alexandria-eval compare sam/fix-cards` |
| New Sam behavior coverage | Existing coverage should be sufficient for this issue. | No new eval case unless the rerun reveals a changed behavior that current cases miss. | None planned |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Agent-format standardization subtly changes how Sam follows job boundaries or closeout rules. | Inspect transcripts and judge deltas for both cases, not just structural pass/fail, before accepting new baselines. |
| The eval runner may be measuring generic Claude behavior instead of the targeted Sam agent in multi-turn mode. | Add a deterministic runner test for first-turn `@<skill>` invocation and rerun Sam evals only after that harness behavior is fixed. |
| Rule tightening changes fix-card or create-card behavior in a way the existing baseline scores expose. | Stop baseline refresh, patch only the responsible Sam prompt/rules text, and rerun the impacted evals before handoff. |
| This issue drifts into repo-wide verification without a real need. | Keep the rerun set to `sam/all` and only widen deterministic checks if tracked files beyond eval artifacts change. |

## Implementation Steps

1. Confirm the current Sam baseline state and issue branch status.
2. Run `bin/alexandria-eval run sam/all --parallel`.
3. Review `results` and `compare` output for `sam/create-cards` and `sam/fix-cards`.
4. If a regression suggests the eval runner is not targeting Sam correctly, fix the runner and add deterministic coverage before rerunning Sam.
5. If both corrected cases hold or improve, stage the updated `tests/evals/sam/` artifacts.
6. If a corrected case still regresses, inspect transcripts and fix the smallest Sam prompt/rules issue, then rerun the impacted evals.
7. Run deterministic repo checks for changed files (`bun run check`, `bun test tests/eval-runner.test.ts`), and note any broader environment-limited `bun test` failures separately.
8. Perform a local review of the final diff, then open or update the issue PR with plan path, eval summary, harness/test changes, and any baseline updates.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/365-run-sam-evals/plan.md` exists and matches the final slice.
2. `sam/create-cards` and `sam/fix-cards` have been rerun from the current branch state.
3. If the rerun uncovered eval-runner correctness issues, the harness fix and deterministic coverage are in place before baseline acceptance.
4. Structural and judge results have been reviewed against the 2026-04-08 baseline artifacts.
5. Updated `tests/evals/sam/` artifacts are checked in if the results hold or improve.
6. Any regression found during the rerun is fixed and verified before PR handoff.
7. The branch has an open or updated PR against `main` with the eval summary.

## Deferred Follow-Ups

1. Add new Sam eval cases only if the rerun shows a meaningful behavior gap not covered by `create-cards` or `fix-cards`.
2. Investigate broader eval-status staleness outside Sam in separate issues, not in this slice.
