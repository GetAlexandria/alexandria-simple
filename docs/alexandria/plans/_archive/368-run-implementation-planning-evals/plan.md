# Issue 368 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#368`
- Goal: rerun the implementation-planning eval-backed coverage after recent `skills/implementation-planning/*` updates, compare the results to the stale 2026-03-29 and 2026-04-01 baselines, and either refresh checked-in eval artifacts or make the smallest prompt-level fix required to recover an honest non-regressing rerun
- Linked product plan: [implementation-planning project plan](../implementation-planning/plan.md)

## Scope

- Add the issue-specific repo technical plan for the implementation-planning eval refresh slice.
- Rerun the executable implementation-planning coverage that maps to the changed planning skill surface: `implementation-planning/taskflow-realtime` and `ticket-writer/standard-format`.
- Review structural and judge deltas against the current checked-in baselines before accepting any updated artifacts.
- Refresh checked-in eval artifacts under `tests/evals/implementation-planning/` and `tests/evals/ticket-writer/` if the reruns hold or improve.
- Make the smallest honest fix to the planning skill, ticket-writer helper, or eval harness only if the rerun exposes a concrete regression that must be corrected before handoff.
- Repair the implementation-planning prompt if the fresh rerun shows degraded conversation quality, weaker end-to-end sequencing, or oversized ticket slicing relative to the checked-in baseline.

## Non-Goals

- Rewriting the implementation-planning workflow spec speculatively without an eval-backed regression.
- Creating brand-new implementation-planning or ticket-writer eval cases unless the rerun reveals a real product-facing coverage gap that blocks honest acceptance.
- Running unrelated agent or skill eval suites outside the implementation-planning surface.
- Treating the judge-calibration fixture files under `tests/eval-cases/implementation-planning/calibration/` as if they were executable `all` cases when the CLI currently excludes `calibration/` directories from `list`, `status`, and `run <skill>/all`.

## Current Gap

- `skills/implementation-planning/SKILL.md` and helper files under `skills/implementation-planning/` changed after the current eval baselines were recorded.
- `bin/alexandria-eval status` shows `implementation-planning/taskflow-realtime` as stale from 2026-04-01 and `ticket-writer/standard-format` as last run on 2026-03-29.
- The repo already maps `skills/implementation-planning/*` changes to `implementation-planning/all` and `ticket-writer/all`, but the implementation-planning suite currently has one executable case (`taskflow-realtime`) plus judge-calibration fixtures under `calibration/` that are intentionally skipped by the CLI's `all` traversal.
- This issue requires fresh evidence that the planning skill still produces the expected plan bundle after the recent Step 1 and Step 7 wording updates, and that ticket formatting remains acceptable after the helper-file changes.
- The first honest 2026-04-11 rerun kept `ticket-writer/standard-format` at `10/10`, but `implementation-planning/taskflow-realtime` dropped from `59/60` to `55/60`, with judge feedback pointing at weaker end-to-end sequencing, larger ticket slices, and shallower conversation behavior.
- A later direct rerun hit the Claude CLI quota limit before completion, so the remaining work is prompt remediation plus a post-reset rerun to confirm the regression is actually fixed.

## Architectural Boundaries

- Treat this issue as an eval-maintenance slice first. The expected shipped changes are the issue plan plus refreshed eval artifacts, unless the rerun proves a behavior regression.
- Preserve the product boundary: fixes belong in `skills/implementation-planning/*` or eval infrastructure only when directly supported by rerun evidence.
- Keep the behavior-to-eval mapping truthful: executable coverage is `implementation-planning/taskflow-realtime` plus `ticket-writer/standard-format`; the calibration fixture JSON files inform judge calibration but are not currently run by `implementation-planning/all`.
- If a rerun regresses, keep remediation narrow and rerun only the impacted implementation-planning surface before moving on to repo checks.
- Keep fixes generalizable across products: improve planning behavior with stronger conversation and decomposition rules, not TaskFlow-specific wording or eval-targeted heuristics.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo planning docs | `docs/alexandria/plans/368-run-implementation-planning-evals/plan.md` | Records the repo-specific rerun scope, executable coverage boundary, and acceptance criteria for issue 368 |
| Implementation-planning eval baselines | `tests/evals/implementation-planning/taskflow-realtime/*` | Refreshes checked-in transcript, output bundle, metadata, structural results, and judge results for the current implementation-planning behavior if the rerun is acceptable |
| Ticket-writer eval baselines | `tests/evals/ticket-writer/standard-format/*` | Refreshes checked-in evidence for the standard ticket-format output used by Step 7 if the rerun is acceptable |
| Planning skill or eval harness, only if needed | `skills/implementation-planning/SKILL.md`, `skills/implementation-planning/ticket-formats.md`, `skills/implementation-planning/ticket-writer.md`, related eval tooling | Small corrective fix only if the rerun shows a concrete regression tied to current planning behavior or execution |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Implementation-planning skill | Tighten the Step 1 and Step 5 instructions so the planner reuses user-provided scope, asks sharper follow-up questions, and prefers a smaller demoable end-to-end slice before deeper layering | Rerun `implementation-planning/taskflow-realtime`, review `results` and `compare`, and keep the fix limited to the planning-surface guidance supported by the judge feedback |
| Ticket-writer helper surface | No intended behavior change in this slice; this rerun verifies that standard-format ticket artifacts still satisfy structural and judge expectations | Review `results` and `compare` output for `ticket-writer/standard-format` before refreshing baselines |
| Implementation-planning judge calibration fixtures | No executable behavior change; these files remain calibration references for judge quality rather than runnable `all` cases | Call out the CLI boundary in the final summary so reviewers do not assume `implementation-planning/all` executed the calibration directory |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Eval status / staleness check | `bin/alexandria-eval status` | Confirms the current baseline age and identifies the stale implementation-planning surfaces before rerun |
| Repo quality gate | `bun run check` | Required repo gate for this docs + eval-artifact slice, and for any prompt or tool fixes if needed |
| Regression suite | `bun test` | Confirms deterministic coverage still passes after any tracked changes in this slice |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Implementation-planning end-to-end plan generation | `tests/eval-cases/implementation-planning/taskflow-realtime` | Rerun and compare against the stale 2026-04-01 baseline because `skills/implementation-planning/*` changed; after the first 2026-04-11 rerun regressed, make a narrow prompt fix and rerun the same case again | `bin/alexandria-eval run implementation-planning/all --parallel`, `bin/alexandria-eval results implementation-planning/taskflow-realtime`, `bin/alexandria-eval compare implementation-planning/taskflow-realtime` |
| Ticket writer standard formatting | `tests/eval-cases/ticket-writer/standard-format` | Rerun and compare against the stale 2026-03-29 baseline because Step 7 delegates format writing to the ticket writer helper | `bin/alexandria-eval run ticket-writer/all --parallel`, `bin/alexandria-eval results ticket-writer/standard-format`, `bin/alexandria-eval compare ticket-writer/standard-format` |
| Implementation-planning judge calibration fixtures | `tests/eval-cases/implementation-planning/calibration/good-plan-judge-results.json`, `mediocre-plan-judge-results.json` | Do not treat these as executable cases unless the CLI changes in this issue; instead, note that `implementation-planning/all` does not currently run them | No runnable case planned in this slice |
| New implementation-planning behavior coverage | Existing coverage should be sufficient for this refresh issue | Add a new eval case only if the rerun reveals an uncovered behavior gap that blocks an honest accept/reject call | None planned by default |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The stale baselines may hide a planning regression introduced by recent wording changes around finite-choice prompts or Step 7 file writing | Inspect `results`, `compare`, and transcripts for both impacted cases instead of accepting run success alone |
| The adaptive implementation-planning rerun may fluctuate even after a prompt fix | Base acceptance on an honest rerun from the current branch state, and use the judge feedback categories to keep the fix focused on decomposition and conversation behavior rather than broad prompt churn |
| Reviewers may overclaim coverage and assume `implementation-planning/all` executes the `calibration/` fixtures | State the CLI boundary explicitly in the plan and final handoff |
| A regression in one planning case could tempt a broad rewrite of the planning prompt | Keep any remediation focused on the failing behavior and rerun only the impacted implementation-planning surfaces before widening scope |
| Full deterministic checks may fail for reasons unrelated to this eval refresh | Leave the workspace inspectable, report failing commands exactly, and avoid discarding refreshed eval artifacts or partial diagnostics |
| Claude CLI quota limits can block immediate reruns after a failed attempt | Land the narrow prompt fix, keep the workspace inspectable, and rerun the impacted eval as soon as quota resets rather than fabricating a baseline from incomplete runs |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/368-run-implementation-planning-evals/`.
2. Run `bin/alexandria-eval run implementation-planning/all --parallel` and `bin/alexandria-eval run ticket-writer/all --parallel`.
3. Review `results` and `compare` output for `implementation-planning/taskflow-realtime` and `ticket-writer/standard-format`.
4. If either rerun regresses, inspect transcripts and outputs, update this plan, and make the smallest planning-surface or eval-harness fix required.
5. Rerun only the impacted evals after the prompt fix, then keep refreshed artifacts only if the repaired behavior holds or improves relative to baseline.
6. Run `bun run check` and `bun test`.
7. Perform a local review of the final diff for baseline integrity, coverage-boundary honesty, and plan alignment, then prepare the PR update with the eval summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/368-run-implementation-planning-evals/plan.md` exists and matches the final slice.
2. The executable implementation-planning and ticket-writer eval cases have been rerun from the current branch state.
3. `results` and `compare` have been reviewed for `implementation-planning/taskflow-realtime` and `ticket-writer/standard-format`.
4. Any refreshed eval artifacts under `tests/evals/implementation-planning/` or `tests/evals/ticket-writer/` correspond to reruns whose scores held or improve.
5. Any regression exposed by the rerun is fixed and verified before handoff.
6. `bun run check` and `bun test` pass locally, or any failure is reported with the workspace left intact.
7. The final summary states clearly that implementation-planning judge-calibration fixtures remain non-executable coverage unless that boundary changes in this issue.

## Deferred Follow-Ups

1. If maintainers want executable judge-calibration coverage for implementation planning, add a first-class calibration command or case type in a separate slice rather than overloading `run <skill>/all`.
2. If the ticket-writer surface continues to share implementation-planning regressions, consider whether the targeted-evals guidance should spell out the executable case names in addition to the suite names.
