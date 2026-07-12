# Technical Plan: Issue 411 Initialize Cleanup

- Issue reference: `#411` — `[FEAT-065] Cleanup: kill assessment.md, strike session_notes, remove dead refs`
- Goal: finish the remaining live-surface cleanup for the retired `assessment.md`
  initialize artifact and the never-implemented `session_notes` schema field, then refresh
  initialize eval fixtures and baselines so the repo no longer carries stale evidence of
  either surface in active `/library` behavior
- Linked product plan:
  `docs/alexandria/implementation-plans/initialize-ritual-restoration/tickets/FEAT-065.md`,
  `docs/alexandria/implementation-plans/initialize-ritual-restoration/release.md`,
  `docs/alexandria/implementation-plans/initialize-ritual-restoration/outcomes/O-6.md`

## Scope

- Keep this repo technical plan aligned with the actual remaining `#411` slice on the issue
  branch
- Remove the last live first-session wording that still implies a third persisted initialize
  artifact
- Verify the already-landed runtime cleanup remains true:
  `skills/initialize/assessment-generation.md` stays absent, `skills/initialize/output-formats.md`
  stays free of the assessment template, and active initialize docs stay free of live
  `session_notes` guidance
- Remove the stale `assessment.md` fixture from the returning-session initialize eval case
- Refresh initialize eval baselines so the checked-in transcript and structural results match
  the retired-artifact contract
- Sweep live skills / agents / docs for stale `/wizard` or `skills/wizard/` references only
  where they still affect the current shipped runtime

## Non-Goals

- Reworking the overall first-session beat structure from FEAT-062 beyond correcting the
  stale artifact wording
- Changing returning-session room-open behavior from FEAT-064 beyond removing the stale
  fixture artifact from eval coverage
- Rewriting the initialize engine, gap-analysis algorithm, or noun-dialogue logic
- Cleaning historical implementation plans, scratchpads, source notes, archived docs, or
  checked-in transcripts that intentionally preserve earlier design history outside the
  initialize baselines being refreshed here
- Broadening the slice into new artifact design for conversation excerpts, event logs, or
  additional persistence

## Linked Product-Plan Summary

- FEAT-065 is explicit surface-area reduction: `assessment.md` should stop existing as a
  persisted initialize artifact, and `session_notes` should be struck because it was never
  actually implemented.
- The cleanup is concentrated around first-session wording, initialize reference surfaces,
  and stale eval evidence, so the repo should land it as one narrow slice instead of
  reopening the same surfaces later.
- The product plan also calls for a stale-reference sweep: live `/wizard` naming should be
  gone from active runtime surfaces, while historical references may remain in archived
  planning or decision records.

## Current Gap

- The branch already removed the live `assessment.md` write path, deleted
  `skills/initialize/assessment-generation.md`, and pruned the assessment template from
  `skills/initialize/output-formats.md`, but `skills/raven/job-first-session.md` still says
  the flow produces "three persisted initialize artifacts."
- The returning-session initialize eval fixture still includes a pre-existing
  `docs/alexandria/assessment.md`, and the checked-in returning-session transcript /
  structural baseline still reflects that stale artifact.
- Repo history still contains `assessment.md`, `session_notes`, and `/wizard` references in
  archived plans and transcripts, so this issue needs an explicit live-surface boundary
  rather than a repo-wide historical rewrite.

## Architectural Boundaries

- Keep `/library` as the user-facing entry point. The remaining cleanup belongs in Raven job
  files, initialize eval fixtures, and their baselines rather than inventing a new entry
  surface.
- Preserve Raven's initialize exception, narrowed to the surviving artifacts:
  `alexandria-config.json` and `initialize-output.md`. Do not repurpose the removed
  assessment step into a new persisted artifact in this slice.
- Keep historical planning material intact unless it is an active shipped runtime surface or
  the checked-in initialize eval baseline that now enforces current behavior.
- Treat eval changes as behavior alignment, not optional cleanup. Since initialize is a
  product-facing skill surface, the eval contract must move with the artifact contract.
- Keep the slice small. Only fix live `/wizard` references that still influence active
  shipped docs, skills, agents, or eval fixtures.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/411-initialize-cleanup/plan.md` | Captures the repo-specific scope, verification, and eval decisions for FEAT-065 as the branch stands now |
| First-session Raven job | `skills/raven/job-first-session.md` | Removes the last live wording that implies a third persisted initialize artifact |
| Initialize helper docs | `skills/initialize/output-formats.md`, `skills/initialize/opening.md`, deleted `skills/initialize/assessment-generation.md` | Stay as the cleaned runtime reference surface; this slice verifies they remain aligned |
| Deterministic fixtures | `tests/fixtures/structural-check-parity.json` only if needed | Keeps repo assertions aligned if the refreshed eval baseline changes structural check naming |
| Initialize eval suite | `tests/eval-cases/initialize/returning-session-with-drift/fixture/`, `tests/evals/initialize/*`, `tests/eval-cases/initialize/structural-checks.ts`, `tests/eval-cases/initialize/judge-criteria.json` | Removes the leftover returning-session `assessment.md` fixture and refreshes baselines so the eval suite validates the post-cleanup `/library` behavior |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/raven/job-first-session.md` | The first-session goal and artifact framing now name only the two surviving persisted initialize artifacts plus the Sam/Conan handoffs | Keep the beat numbering, artifact outputs, and Conan/Sam handoffs consistent with the current initialize contract |
| Initialize eval surface (`skill: "library"` under `tests/eval-cases/initialize/`) | Eval completion and judging continue to validate `alexandria-config.json` and `initialize-output.md` plus the conversational handoff, with no leftover pre-existing `assessment.md` fixture in the returning-session case | Update the fixture and checked-in baselines together |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, JSON/TS formatting, and linting after prompt/doc/test edits plus the fixture deletion |
| Full deterministic suite | `bun test` | Confirms the changed skill/doc/test slice does not regress packaging, lint, initialize QA, or eval-harness plumbing |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `/library` initialize flow | Yes, via `initialize/*` eval cases using `skill: "library"` | Rerun the initialize suite because the first-session wording and returning-session fixture still need to align with the retired-artifact contract | `bin/alexandria-eval run initialize/all` |
| Initialize structural checks | Yes, current checks already forbid `assessment.md` writes | Keep the structural checks as-is and refresh the stale returning-session fixture / baselines so they match the contract | remove `tests/eval-cases/initialize/returning-session-with-drift/fixture/docs/alexandria/assessment.md` and rerun the suite |
| Raven general conversation evals | Raven evals exist, but this change is scoped to `/library` initialize behavior and live initialize docs | Do not rerun `raven/all` unless implementation broadens beyond the initialize-specific surfaces listed here | none unless scope widens |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The branch already contains most of FEAT-065, so a stale repo plan could overstate the actual work and make the diff look inconsistent | Update the repo plan before editing so the documented slice matches the real remaining changes |
| The first-session cleanup could leave beat wording inconsistent, making the ritual harder to follow | Review the full Beat 7/8/9 sequence after editing and keep the surrounding status language internally consistent |
| Eval coverage could fail for the wrong reason because the returning-session fixture still carries a historical `assessment.md` file | Remove the stale fixture file before rerunning baselines so the suite tests the intended contract directly |
| A broad `/wizard` grep could pull historical planning documents into scope and bloat the PR | Limit code changes to live shipped surfaces and leave archived planning/history references untouched unless they directly affect runtime behavior |
| Removing `session_notes` references incompletely could leave stale schema guidance in a live file | Grep for `session_notes` after implementation and treat any remaining live reference outside archived history as a blocker before finishing |

## Implementation Steps

1. Update this repo-specific technical plan for issue `#411` so it matches the branch's
   actual remaining scope.
2. Update `skills/raven/job-first-session.md` so the first-session goal names only the two
   surviving persisted initialize artifacts.
3. Confirm the active initialize helper docs and Raven contract files remain free of live
   `assessment.md`, `session_notes`, and `/wizard` references.
4. Remove the stale `assessment.md` file from the
   `initialize/returning-session-with-drift` eval fixture.
5. Refresh initialize eval baselines to the new fixture and skill wording.
6. Update any deterministic fixture metadata only if the rerun changes structural check
   names or contract text.
7. Run `bun run check`.
8. Run `bun test`.
9. Run `bin/alexandria-eval run initialize/all`, inspect results with
   `bin/alexandria-eval results ...` / `compare ...`, and check in updated baselines if
   scores hold or improve.
10. Perform a manual local review against the issue, plan, and final diff.
11. Update or open the PR against `main`, then carry CI / review to a clean mergeable
    state per repo policy.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/411-initialize-cleanup/plan.md` exists and matches the repo slice.
2. `skills/raven/job-first-session.md` no longer implies a third persisted initialize
   artifact.
3. `skills/initialize/assessment-generation.md` remains absent and no live runtime surface
   still references it.
4. `skills/initialize/output-formats.md` still preserves the surviving templates without an
   assessment template or summary copy.
5. Live `session_notes` references remain absent from active schema / initialize guidance.
6. Relevant deterministic checks pass locally.
7. `initialize/all` is rerun against the updated fixture and wording with no blocking
   regression.

## Deferred Follow-Ups

1. Historical implementation plans, archived design records, and old transcripts that still
   mention `assessment.md` or `session_notes`.
2. Any later product decision record that formalizes "assessment as conversational turn" in
   the library itself, as suggested by the upstream feedback queue.
3. Broader cleanup of stale `/wizard` terminology in archived planning/history documents if
   the team later decides those should be normalized too.
