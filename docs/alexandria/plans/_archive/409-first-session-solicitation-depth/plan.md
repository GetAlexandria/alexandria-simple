# Technical Plan: Issue 409 First-Session Solicitation Depth

- Issue reference: `#409` — `[FEAT-063] Restore first-session solicitation prompt depth to pre-FEAT-045 wizard baseline`
- Goal: restore the conversational depth of the first `/library` session so Raven explicitly uses the old wizard's calibration discipline during noun dialogue and configuration, and make the initialize evals judge that depth against a checked-in pre-split reference instead of only structural completeness
- Linked product plan: `docs/alexandria/implementation-plans/initialize-ritual-restoration/tickets/FEAT-063.md`, `docs/alexandria/implementation-plans/initialize-ritual-restoration/outcomes/O-4.md`, `docs/alexandria/implementation-plans/initialize-ritual-restoration/CONTEXT_BRIEFING.md`

## Scope

- Add a repo technical plan for issue `#409`
- Tighten `skills/raven/job-first-session.md` so the noun-dialogue and configuration beats explicitly invoke the calibration heuristics that FEAT-045 thinned out
- Strengthen the checked-in initialize helper guidance where needed so the job can quote operationally grounded prompts instead of generic labels
- Extend initialize eval judging so it can read a checked-in reference and score first-session transcripts on calibration depth, mismatch handling, inference hedging, and framing richness
- Update the initialize eval reference material / baselines that cover the first-session flow

## Non-Goals

- Reworking the nine-beat first-session orchestration from FEAT-062
- Returning-session `/library` behavior from FEAT-064
- Reworking the initialize artifact format changes from `#411` beyond keeping the
  first-session depth behavior aligned to the current two-artifact flow
- Broad Raven-agent prompt redesign outside the `/library` first-session initialize surface
- General eval-harness redesign beyond the minimum reference-loading support needed for this judge flow

## Linked Product-Plan Summary

- FEAT-063 is the content-depth complement to FEAT-062: the ritual order now exists, but the user-facing questioning still feels thinner than the pre-split wizard
- The regression is specifically about Raven failing to explicitly use the old calibration procedure at the right moments, not about missing reference files on disk
- The restored behavior must cover richer AI-mode / novelty / complexity framing, inference-before-asking hedges, and mismatch detection when the user's framing conflicts with an inferred read
- Acceptance requires eval criteria that judge the new first-session transcripts against the old wizard baseline rather than merely checking that the flow completes

## Current Gap

- `skills/raven/job-first-session.md` loads `expert-calibration.md` on entry, but the beat instructions do not force the model to apply its specific heuristics during noun dialogue or configuration
- The current first-session initialize transcript can still drift into invented mode labels (`Copilot`) and shallow framing because the procedure allows a freehand summary instead of an explicit operational prompt sequence
- `tests/eval-cases/initialize/judge-criteria.json` still emphasizes structural initialize quality and does not separately judge calibration depth against the old wizard baseline
- `src/tools/eval-harness.ts` already accepts a `reference` field in some criteria files by convention, but does not currently load that file into the judge prompt, so baseline comparison material cannot actually influence scoring

## Architectural Boundaries

- Keep the depth restoration inside the `/library` first-session prompt layer and its initialize helper references; do not move this behavior into unrelated CLIs or agent-global prose
- Preserve the checked-in initialize helper split: `job-first-session.md` owns beat procedure and invocation timing, while `skills/initialize/*.md` own reusable question framing and output guidance
- Keep the eval change narrow: support checked-in judge reference material in the harness and wire it into initialize eval judging, rather than inventing a separate one-off comparison script
- Preserve generic wording. The restored prompts must improve calibration for any product, not only the current finance-ops eval fixture

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/409-first-session-solicitation-depth/plan.md` | Captures the repo-specific implementation, verification, and eval scope for FEAT-063 |
| First-session Raven procedure | `skills/raven/job-first-session.md` | Forces explicit use of calibration heuristics, mismatch surfacing, and operationally grounded framing during noun dialogue and configuration |
| Initialize questioning helpers | `skills/initialize/configuration-questions.md`, `skills/initialize/noun-dialogue.md` if needed | Keeps the reusable question language aligned with the richer first-session procedure and the old wizard baseline |
| Initialize eval judging | `tests/eval-cases/initialize/judge-criteria.json`, new reference material under `tests/eval-cases/initialize/` | Adds criteria for calibration depth and provides the old-wizard comparison reference the judge should use |
| Eval harness | `src/tools/eval-harness.ts`, `tests/eval-runner.test.ts` | Makes the `reference` field in judge criteria real so the QA judge can read checked-in baseline guidance |
| Initialize eval baselines | `tests/evals/initialize/*` for impacted cases | Refreshes transcripts / judge results after the prompt-depth restoration lands |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/raven/job-first-session.md` | Raven must explicitly run the Frankenstein / mismatch / hedge discipline during the noun-dialogue and configuration beats rather than only "having" the calibration file loaded in the background | Keep the helper references and initialize evals aligned so the conversation judged in evals matches the shipped procedure |
| `skills/initialize/configuration-questions.md` | Configuration prompts must ground each value operationally, preserve the canonical mode names, and include confidence-hedged inference wording Raven can quote or adapt directly | Ensure judge criteria reward this richer framing and that first-session personas still answer cleanly |
| `src/tools/eval-harness.ts` + initialize judge files | The judge can evaluate transcripts against a checked-in old-wizard reference instead of only the criteria descriptions | Add deterministic coverage for the reference-loading path and keep initialize judge artifacts updated after reruns |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates Markdown / TypeScript formatting and linting after prompt, plan, and eval-harness changes |
| Eval harness regression coverage | `bun test tests/eval-runner.test.ts` | Verifies the new judge-reference loading logic without needing live LLM calls |
| Full deterministic suite | `bun test` | Confirms the prompt + harness changes do not regress existing initialize or eval tooling behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `/library` initialize first-session behavior | Yes, via `initialize/all`, including `first-session-empty-project` | Rerun the initialize suite because the user-facing first-session conversation changes | `bin/alexandria-eval run initialize/all` |
| Old-wizard depth comparison | No meaningful checked-in reference is currently fed into initialize judging | Add a reference file under `tests/eval-cases/initialize/` and update the judge criteria to score against it | new `tests/eval-cases/initialize/judge-reference.md` |
| Shared Raven behavior outside `/library` | Raven has separate eval coverage, but this slice targets the library first-session route file directly | Do not rerun `raven/all` unless implementation broadens into shared Raven prompt behavior beyond the initialize surface | none unless scope expands |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The fix could add more prose without actually constraining Raven's behavior, leaving the same thin transcript failure modes intact | Put the critical heuristics directly into the beat instructions with explicit wording / anti-pattern boundaries, then verify through the first-session eval transcript |
| Restoring depth could accidentally reintroduce old wizard terminology or mode labels that no longer match Alexandria's current surface | Anchor all configuration wording to the checked-in initialize helpers and explicitly forbid invented / retired labels in the procedure |
| Judge-reference support could broaden the eval harness more than needed | Limit the harness change to loading one optional reference file into the judge prompt and cover that path with a focused deterministic test |
| Updated judge criteria could cause noisy score movement across all initialize cases | Keep the new criteria focused on the configuration / noun-dialogue behavior that every initialize case already exercises, then inspect per-case deltas before accepting new baselines |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#409`.
2. Update `skills/raven/job-first-session.md` so the noun-dialogue and configuration beats explicitly invoke the relevant `expert-calibration.md` heuristics and richer prompt framing.
3. Update `skills/initialize/configuration-questions.md` and only the minimal additional initialize helper text needed to support the restored depth without freehand drift.
4. Add initialize judge reference material and extend `tests/eval-cases/initialize/judge-criteria.json` with the new depth-focused criteria.
5. Update `src/tools/eval-harness.ts` to load optional judge reference material, and add deterministic coverage in `tests/eval-runner.test.ts`.
6. Run `bun run check`.
7. Run `bun test tests/eval-runner.test.ts`.
8. Run `bun test`.
9. Run `bin/alexandria-eval run initialize/all`, then inspect with `bin/alexandria-eval results ...` and `compare ...`.
10. Perform a local review pass against the issue, plan, and diff, then update or open the PR against `main`.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/409-first-session-solicitation-depth/plan.md` exists and matches the repo slice.
2. `skills/raven/job-first-session.md` explicitly instructs Raven when and how to apply the relevant calibration heuristics during noun dialogue and configuration.
3. The first-session procedure preserves the canonical current mode names and operationally grounded framing for AI mode, novelty, and complexity.
4. The procedure documents mismatch detection and inference-confidence hedging rather than relying on Raven to remember them implicitly.
5. Initialize judge criteria include depth-oriented criteria and have access to a checked-in old-wizard reference.
6. The eval harness can load that reference material and deterministic coverage passes locally.
7. Relevant initialize evals are rerun with no blocking regression versus the checked-in baseline.

## Deferred Follow-Ups

1. FEAT-064 returning-session depth and continuity work.
2. FEAT-066 ADR / lifecycle assertions that build on the restored first-session depth behavior.
3. Any broader eval-harness feature work beyond reference-file loading if future skills need richer judge context.
