# Technical Plan: Issue 381 Raven Writes Config Artifacts Directly

- Issue reference: `#381` — `[FEAT-056] Raven writes config artifacts directly (skip Sam intermediary)`
- Goal: remove the unnecessary Raven→Sam round trip for initialize artifacts so Raven writes the persisted initialize outputs directly after user confirmation, while preserving Sam as the writer for actual library cards and card-like source artifacts
- Linked product plan: `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-007.md`, `docs/alexandria/implementation-plans/library-phase-2/outcomes/O-3.md`, `docs/alexandria/sources/vision-wizard-becomes-raven.md`

## Scope

- Update the Raven initialize job so artifact production is split by artifact class instead of routing every persisted output through Sam
- Have Raven write `docs/alexandria/alexandria-config.json` directly once the human confirms configuration
- Have Raven write `docs/alexandria/initialize-output.md` directly once the human confirms the initialized library shape
- Have Raven write `docs/alexandria/assessment.md` directly once Raven has synthesized and the human has confirmed the assessment
- Keep Sam as the writer for starter source artifacts and actual library cards
- Tighten eval coverage for initialize behavior so the changed writer boundary is visible in the judged transcript, not just in file existence
- Add the repo technical plan for issue `#381`

## Non-Goals

- Reworking Raven's product-conversation job or her non-initialize boundaries
- Replacing Sam's card-writing role or Conan's card-quality gate
- Reopening the broader Phase 2 architecture around async orchestration, scoreboard derivation, or session-start behavior
- Retrofitting historical source documents that intentionally preserve the earlier design discussion

## Linked Product-Plan Summary

- The original Phase 2 plan routed all wizard-mode artifact production through Sam to keep Raven purely conversational.
- The current issue narrows that boundary: initialize artifacts do not benefit from Sam's intermediary, while card production still does.
- Implementation evidence from the checked-in initialize eval surface shows `initialize-output.md` belongs with the same direct-write boundary: the `/library` eval path exercises Raven with file tools but no agent-dispatch tool, and the artifact is not card-like.
- The resulting architecture should be: Raven confirms synthesis and writes initialize artifacts directly; Raven still calls Sam when the output is card-like and benefits from Sam's structure and Conan's later grading loop.

## Current Gap

- `skills/raven/job-initialize.md` previously treated `initialize-output.md` as Sam-owned even after moving the other initialize artifacts to Raven direct writes.
- A fresh initialize eval run on this branch showed Raven writing `initialize-output.md` directly anyway, because the checked-in `/library` eval path has no agent-dispatch tool and the artifact is not a card.
- `agents/raven.md` still documented the initialize exception as Raven writing only two of the three initialize artifacts directly.
- The existing initialize eval suite verifies that the required files exist, but it does not currently judge whether Raven used the intended writer boundary in the transcript.
- Several checked-in planning docs for Phase 2 still describe the older "Sam writes every artifact" behavior, so the implementation slice needs at least the live agent/skill/docs that define current runtime behavior to stay aligned.

## Architectural Boundaries

- Keep the authoritative behavior in `skills/raven/job-initialize.md`; `/library` stays a thin entry point.
- Preserve the main role boundary: Raven still never writes library cards. Card authorship remains Sam's job.
- Treat `alexandria-config.json`, `initialize-output.md`, and `assessment.md` as initialize artifacts, not as card-like deliverables needing Sam's quality gate.
- Keep confirmation-before-write as the invariant for both direct writes and Sam handoffs. The writer changes; the conversational safety gate does not.
- Keep Sam scoped to starter source artifacts and actual library cards; do not weaken the broader card-authorship boundary.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/381-raven-writes-config-artifacts-directly/plan.md` | Captures the repo-specific scope, verification, and eval impact for the issue |
| Raven initialize procedure | `skills/raven/job-initialize.md` | Raven writes the three persisted initialize artifacts directly after confirmation instead of routing them through Sam; Sam remains the writer for card-like artifacts |
| Raven agent boundary text | `agents/raven.md` | The initialize exception is rewritten to reflect "Raven writes initialize artifacts directly; Sam writes cards/source artifacts" |
| Initialize eval coverage | `tests/eval-cases/initialize/judge-criteria.json` | Eval judging explicitly checks the changed writer boundary instead of only output-file completeness |
| Supporting docs | relevant checked-in runtime docs that describe the live initialize boundary | Current docs stop claiming Sam writes all initialize artifacts where that would now be false |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/raven/job-initialize.md` | Step 5 becomes a split writer policy: Sam for starter source artifacts/cards, Raven for `alexandria-config.json`, `initialize-output.md`, and `assessment.md` | Keep the artifact patterns, required-artifact floor, and "do not" rules consistent with the new split |
| `agents/raven.md` | Initialize exception now grants Raven direct-write authority for all persisted initialize artifacts | Keep the global "never write library cards" boundary intact and scoped exceptions explicit |
| `/library` initialize flow | Users should experience fewer mode switches when configuration or assessment becomes a file on disk | Rerun initialize evals because the user-facing transcript and artifact-production boundary changed |
| Raven eval-backed behavior | Raven prompt wording changes in a reusable product surface | Rerun Raven evals even though the change is initialize-specific because `skills/raven/*` is an eval-backed surface |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, formatting, shell checks, and typed surfaces after prompt/doc/eval edits |
| Full deterministic suite | `bun test` | Confirms the prompt/doc/eval slice does not regress the checked-in deterministic coverage |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/raven/job-initialize.md` | Yes, via Raven evals and initialize evals | Rerun Raven evals because a Raven product-facing skill changed | `bin/alexandria-eval run raven/all` |
| `/library` initialize flow | Yes, via `tests/eval-cases/initialize/*` | Rerun initialize evals because the user-facing artifact-production flow changed | `bin/alexandria-eval run initialize/all` |
| Initialize writer-boundary behavior | Partial only; files are checked but writer identity is not judged explicitly | Extend existing initialize judge criteria in this slice rather than adding a brand-new case | update `tests/eval-cases/initialize/judge-criteria.json` and rerun `initialize/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Raven's direct-write exception could leak beyond initialize artifacts and weaken the clean role boundary | Scope the agent and job language narrowly: Raven writes only the persisted initialize artifacts in Job 2; cards remain Sam-owned |
| The repo could keep an impossible split between live eval/tooling behavior and checked-in prompt guidance | Align the direct-write boundary with the actual `/library` tool surface and explicitly reserve Sam for source/card artifacts only |
| Existing evals could continue passing without noticing the wrong writer behavior | Add initialize judge criteria for the writer boundary and rerun `initialize/all` after implementation |
| Phase 2 planning docs may still describe the superseded model and confuse future contributors | Update the live runtime-facing docs touched by the implementation and note any remaining historical-doc drift in the final review/PR summary |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#381`.
2. Update `skills/raven/job-initialize.md` so persisted initialize artifacts are direct Raven writes while source/card artifacts still route through Sam.
3. Update `agents/raven.md` so the initialize exception reflects the new split writer boundary.
4. Update any directly relevant checked-in docs that would otherwise still describe the old runtime behavior.
5. Strengthen `tests/eval-cases/initialize/judge-criteria.json` so initialize evals can detect whether Raven kept Sam only for card-like outputs.
6. Run `bun run check`.
7. Run `bun test`.
8. Run `bin/alexandria-eval run raven/all`, inspect results, and compare against baselines if needed.
9. Run `bin/alexandria-eval run initialize/all`, inspect results, and compare against baselines if needed.
10. Perform a local review pass against the issue, plan, and final diff, then update the PR against `main`.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/381-raven-writes-config-artifacts-directly/plan.md` exists and matches the repo slice.
2. Raven's initialize job tells Raven to write `docs/alexandria/alexandria-config.json` directly after human confirmation.
3. Raven's initialize job tells Raven to write `docs/alexandria/initialize-output.md` directly after human confirmation of the initialized library shape.
4. Raven's initialize job tells Raven to write `docs/alexandria/assessment.md` directly after human confirmation.
5. Sam remains the writer for starter source artifacts and actual library cards.
6. `agents/raven.md` reflects the new initialize exception without weakening the general card-authorship boundary.
7. Initialize eval coverage includes the changed writer-boundary expectation.
8. `bun run check` passes.
9. `bun test` passes.
10. `bin/alexandria-eval run raven/all` and `bin/alexandria-eval run initialize/all` complete without a blocking regression.

## Deferred Follow-Ups

1. Reconcile the broader Phase 2 historical planning docs if the team wants all upstream narrative sources to reflect the post-issue writer boundary instead of preserving the original design state.
2. Add more explicit initialize transcript checks if future regressions show the judge criteria alone are not reliable enough.
