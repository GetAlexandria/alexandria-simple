# Issue 500 Technical Plan: EL5 Section Summary Run Scope

Issue: GitHub #500, "EL5 section-summary prior must be scoped to the play run"
Date: 2026-06-30
Status: Ready for implementation

## Goal

Scope EL5 section-summary prior selection to the Front-of-House play run that
produced the confirmed library being atomized. `ax cards execute-plan` must
select a `library.front_of_house.section_confirmed` prior by
`(playRunId, context)`, not by `context` alone, so a later section confirmation
from a different Front-of-House run cannot contaminate an unrelated card build.

The CLI contract stays deterministic and non-interactive:

- no new CLI argument;
- no new `section_confirmed` event field;
- no context-only fallback;
- source-only degraded drafting stays successful when this run has no matching
  section summary.

## Scope

In scope:

- AX atomic-card section-summary event projection and lookup logic.
- `ax cards execute-plan` materialization of the optional
  `SECTION_SUMMARY` prompt-input file.
- Black-box tests for `execute-plan` output, exit code, and file side effects.
- Focused regression tests for the run-scoped selector.

Out of scope:

- Changing the Front-of-House producer command or the
  `library.front_of_house.section_confirmed` payload schema.
- Changing `library.confirmed` event schema.
- Adding bundle/product fields to `section_confirmed`.
- Adding a new EL5 CLI flag to pass a run id.
- Changing `build-atomic-card` prompt semantics. The prompt already treats
  `SECTION_SUMMARY` as an optional prior.
- Viewer changes.
- Writing to `docs/alexandria/library`.

## Sources Read

- Root `CLAUDE.md` and `README.md`.
- `skills/maintainer/technical-planning/SKILL.md`.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md`.
- `EVALS.md`.
- Prior EL5 and Front-of-House plans:
  - `docs/alexandria/plans/front-of-house-walk-reshape/plan.md`
  - `docs/alexandria/plans/front-of-house-walk-reshape/issue-slice-d2-el5-consume.md`
  - `docs/alexandria/plans/484-foh-held-back/plan.md`
  - `docs/alexandria/plans/350-el5-atomizer-repoint/plan.md`
  - `docs/alexandria/plans/rebuilding-the-library/el5-migration-spec.md`
- Current implementation files:
  - `packages/ax/src/domain/atomic-cards.ts`
  - `packages/ax/src/commands/cards.ts`
  - `packages/ax/src/domain/library-front-of-house.ts`
  - `packages/ax/src/domain/library-confirmation.ts`
  - `packages/ax/src/domain/state-events.ts`
  - `packages/ax/tests/cards.test.ts`
  - `packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md`

## Product Plan Summary

The Front-of-House reshape introduced
`library.front_of_house.section_confirmed` as the durable handoff from EL3 to
EL5. The event carries `playRunId`, `context`, `plane`, `prefLabel`,
`summary`, optional `scope`, `cards`, `unknowns`, and `answerEventId`.

The prior #490/#484 EL5 consumption plan chose exact `context` matching and
latest-wins event replay. Issue #500 corrects that contract: latest-wins still
applies only within one Front-of-House run, but the selection key is now
`(playRunId, context)`. A summary from another run with the same context is not
a degraded fallback; it is wrong data and must be ignored.

## Current Implementation Gap

`packages/ax/src/domain/atomic-cards.ts` currently exposes
`latestAtomicCardSectionSummaryInputsByContext(events)`. It projects valid
`section_confirmed` events and overwrites a `Map` by `context` only. The
projection reads no `playRunId`.

`packages/ax/src/commands/cards.ts` currently does this in `runExecutePlan`:

1. validates the plan and loads project events;
2. builds `sectionSummariesByContext`;
3. looks up `sectionSummariesByContext.get(contract.targetCard.context)`;
4. writes `<contract>.section-summary.json` and passes its path as
   `SECTION_SUMMARY` when a match exists.

Because the event replay is project-wide, a later event from another
Front-of-House run with the same `context` wins and is materialized into the
unrelated child `build-atomic-card` run.

The working sibling is
`frontOfHouseSectionConfirmations(events, playRunId)` in
`packages/ax/src/domain/library-front-of-house.ts`, which filters
`section_confirmed` events by `playRunId` before projecting them.

## Run Source

Use the run identity already attached to the confirmed Front-of-House bundle,
not a new CLI argument.

In the current checkout, the confirmed-library event itself does not carry
`playRunId`; `library.confirmed` only records product, bundle path, and library
version. The existing bundle-local run source is
`runtime/front-of-house/agenda.json` under `plan.confirmedLibrary.bundlePath`.
`parseFrontOfHouseAgenda()` already validates that file and returns
`agenda.playRunId`.

Implementation should derive the EL5 section-summary run id from that agenda:

- resolve `plan.confirmedLibrary.bundlePath`;
- read `runtime/front-of-house/agenda.json`;
- parse it with the existing Front-of-House parser;
- require `agenda.bundlePath` to resolve to the same bundle path the plan uses;
- use `agenda.playRunId` as the run id for section-summary lookup.

If the agenda is absent or invalid, `execute-plan` must not fall back to a
context-only match. Treat the section-summary prior as absent for every
contract, bind `SECTION_SUMMARY` to the empty string, and continue source-only.
That preserves the degraded path while avoiding cross-run contamination.

If implementation discovers an existing, stricter plan-level run id in a newer
branch, it may use that as the run source instead of the agenda, but it must
still enforce the same `(playRunId, context)` selector and must not add a CLI
flag.

## Architectural Boundaries

- AX owns deterministic event projection, run lookup, prompt-input file
  materialization, JSON output, and exit codes.
- The shipped plugin owns drafting behavior. This slice should not edit
  `build-atomic-card` prompts unless implementation finds a real mismatch.
- Front-of-House owns event emission and agenda generation. This slice reads
  those artifacts but does not change their writer contract.
- The event log remains the stored source of truth. The run-scoped summary map
  is derived during `execute-plan`; do not persist a new index.
- Keep existing Effect patterns in `packages/ax`: command execution remains an
  `Effect` program returning `CliResult`, with data on stdout and diagnostics
  on stderr.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX atomic-card domain | `packages/ax/src/domain/atomic-cards.ts` | Replace or supersede latest-by-context summary lookup with a run-scoped helper that filters `section_confirmed` by `playRunId` and then latest-wins by `context`. The materialized summary file shape should stay compatible with `atomic-card-section-summary.v1`; use `playRunId` for selection, not as a required new prompt-input field. |
| AX cards command | `packages/ax/src/commands/cards.ts` | `execute-plan` resolves the Front-of-House run id from the confirmed bundle agenda, uses the run-scoped selector, writes a summary file only for same-run matches, and keeps null summary metadata for no-match/source-only cases. |
| Front-of-House domain reader | `packages/ax/src/domain/library-front-of-house.ts` | Prefer existing exports (`FRONT_OF_HOUSE_AGENDA_FILE`, `parseFrontOfHouseAgenda`). Add a tiny reader/helper only if it avoids duplicating path or parser logic. No producer behavior change. |
| AX tests | `packages/ax/tests/cards.test.ts` and possibly a focused domain test | Add the issue #500 matrix: two-runs-same-context, other-run-only, no-summary, within-run-double-confirm, single-run regression, and idempotent replay. |
| Plugin workflows/prompts | No intended changes | Existing `draft_or_repair.md` already describes `SECTION_SUMMARY` as optional and source-only fallback when empty. |
| Event schemas | No intended changes | `section_confirmed` already requires `playRunId`; `library.confirmed` stays unchanged. |

## Behavior Surfaces

| Surface | Changed behavior | Downstream updates |
| --- | --- | --- |
| `ax cards execute-plan` | Optional section-summary prior is selected only from the Front-of-House run associated with the confirmed bundle. Other-run summaries with the same context are ignored. | Black-box tests assert stdout JSON fields, exit code `0`, no stderr, summary file presence/absence, and fake child run input behavior. |
| EL5 `build-atomic-card` child runs | Child runs see the same `SECTION_SUMMARY` contract as today: file path for a same-run match, empty string for no match. | No prompt update expected. Run EL5 structural evals only if plugin files are touched, or as a smoke rerun if desired. |
| Front-of-House section confirmations | No producer change. Existing events remain valid. | Regression tests may rerun Front-of-House tests, but no new FoH eval is required. |
| Viewer | No behavior change. | No Viewer unit/build/browser validation required. |

## Implementation Steps

1. Add or refactor the section-summary projection in
   `packages/ax/src/domain/atomic-cards.ts`:
   - parse `playRunId` from valid `library.front_of_house.section_confirmed`
     events;
   - ignore malformed events, matching current projection behavior;
   - add a helper such as
     `latestAtomicCardSectionSummaryInputsByRunAndContext(events, playRunId)`;
   - iterate events in ledger order and overwrite by `context`, preserving
     latest-wins within the selected run;
   - remove `runExecutePlan` use of the context-only helper.

2. Keep the prompt-input JSON shape stable:
   - do not require `playRunId` in `atomic-card-section-summary.v1`;
   - if a private parsed record includes `playRunId`, render only the existing
     fields unless implementation deliberately updates tests and documents the
     compatible extra metadata.

3. Add a small run-source resolver for `execute-plan`:
   - read `<confirmed bundle>/runtime/front-of-house/agenda.json`;
   - parse via `parseFrontOfHouseAgenda`;
   - verify the agenda bundle path matches `plan.confirmedLibrary.bundlePath`
     after path resolution;
   - return `playRunId` when valid;
   - return `null` for missing or invalid agenda only if the command can safely
     continue source-only without hiding a hard plan-validation error.

4. Update `runExecutePlan` in `packages/ax/src/commands/cards.ts`:
   - call the run-source resolver after `validatePlanWithStorage`;
   - if a run id is present, build the latest-by-run-and-context map;
   - if no run id is present, use an empty map;
   - for each contract, look up by exact `contract.targetCard.context`;
   - write the summary file only for a same-run match;
   - keep passing `SECTION_SUMMARY: sectionSummaryPath ?? ""`;
   - keep returning `sectionSummaryEventId` and `sectionSummaryPath` as today,
     with `null` for absent priors.

5. Update existing tests in `packages/ax/tests/cards.test.ts`:
   - teach the EL5 fixture to write a minimal
     `runtime/front-of-house/agenda.json` with `playRunId: "foh-run-1"` when a
     test needs a section summary;
   - preserve existing tests that assert no summary file is written when no
     matching same-run summary exists.

6. Replace the current "latest matching section summary" test with
   run-scoped cases:
   - `R1` and later `R2` events with the same context, plan bundle agenda says
     `R1`, selected prior is `R1`;
   - only `R2` exists for the same context while agenda says `R1`, no summary
     file is written and the command exits successfully;
   - no `section_confirmed` exists for `R1`, no summary file is written and the
     command exits successfully;
   - two `R1` events for the same context choose the later `R1` event;
   - single-run regression with one `R1` event materializes the same prior
     fields as before.

7. Add idempotency coverage:
   - either pure domain coverage that replaying the same ordered event array
     returns the same event id, or a black-box `execute-plan` repeat with the
     same ledger and fake Fabro proving the selected summary metadata is stable.

8. Add a missing-run-source regression if implementation degrades instead of
   failing:
   - no agenda file plus an other-run same-context summary must not materialize
     a prior;
   - command should still complete source-only with `sectionSummaryEventId:
     null`.

9. Run the deterministic verification commands below. If implementation touches
   plugin workflow or prompt files unexpectedly, run plugin validation and the
   EL5 eval reruns named below.

## Deterministic Verification

Minimum required checks for this slice:

```bash
cd packages/ax && bun test tests/cards.test.ts
pnpm --filter @alexandria/ax run typecheck
```

Recommended regression checks:

```bash
cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts tests/events.test.ts
pnpm --filter @alexandria/ax run format:check
```

If plugin files are touched, also run:

```bash
claude plugin validate ./packages/alexandria-plugin
```

No Viewer validation is required unless implementation touches
`packages/viewer`.

## Eval Impact

This issue changes deterministic AX selection logic, not reusable agent,
skill, or prompt behavior. No new eval-harness case is required for the
run-scoped selector; the selector must be proven by Bun tests because the
current EL5 eval runner is a structural file-content substitute and does not
execute `ax cards execute-plan` against event logs.

If implementation does not touch `packages/alexandria-plugin`, eval reruns are
not required. As an optional EL5 smoke check, or as a required check if any EL5
workflow/prompt/eval config is touched, run:

```bash
pnpm eval -- run atomic-card-creation/all
pnpm eval -- run build-atomic-card/all
```

`atomic-card-planning/all` is only required if implementation changes the
planning prompt, workflow, or build-plan contract.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The implementation cannot find a run id because the current build-plan schema does not store one. | Use the existing Front-of-House agenda under the confirmed bundle as the run source. If it is missing, fail closed to no prior rather than context-only fallback. |
| Missing or stale agenda metadata silently suppresses useful same-run priors. | Add a targeted missing-agenda test and keep JSON result metadata explicit (`sectionSummaryEventId: null`). Consider stderr diagnostics only if existing CLI result patterns support non-fatal diagnostics cleanly. |
| A developer preserves the context-only helper for compatibility and accidentally keeps using it in `execute-plan`. | Rename or deprecate the helper, update imports, and add the other-run-only negative test that fails under context-only matching. |
| Within-run latest-wins behavior regresses while fixing cross-run dedup. | Add a same-run double-confirm test where the later `R1` event wins. |
| The materialized prompt-input file changes shape and breaks prompt/eval assumptions. | Keep `atomic-card-section-summary.v1` output fields stable. Use `playRunId` internally for selection unless a separate compatibility decision is made. |
| Treating missing run source as an operational error would break the accepted source-only degraded path. | Continue successfully with no prior when no trustworthy run source exists, while never falling back to another run. |
| Event order assumptions are unclear. | Iterate the ledger page in returned order and document latest-wins as ledger replay order. Idempotency test replays the same ordered log. |
| Front-of-House producer behavior is accidentally changed. | Keep changes out of `commands/front-of-house.ts` except imports/tests if unavoidable; rerun FoH deterministic tests when touched. |

## Acceptance Criteria

- With `section_confirmed` events for the same context from `R1` and later
  `R2`, an EL5 build whose confirmed bundle agenda belongs to `R1`
  materializes `R1`'s summary, never `R2`'s.
- A `section_confirmed` from a different run for the same context does not
  appear as the prior for this run's contract.
- With no `section_confirmed` for this run's context, `execute-plan` binds
  `SECTION_SUMMARY` to the empty string, writes no summary file, runs the child
  build, and exits successfully.
- Replaying the same event log in the same order yields the same selected
  summary event id.
- A single-run project with one matching `section_confirmed` per context
  materializes the same prior fields as before.
- Within one run, if two confirmations exist for the same context, the later
  event in ledger order still wins.
- The `section_confirmed` event schema and Front-of-House producer behavior are
  unchanged.
- Deterministic AX tests for the matrix above pass, with black-box assertions
  on exit code, stderr, JSON fields, and summary file side effects.

## Deferred Follow-Ups

- Add bundle/product scoping to section-summary matching only if a future event
  version carries bundle identity or the product accepts an event migration.
- Surface selected section-summary provenance in a viewer or run artifact if
  live atomization needs operator visibility beyond `execute-plan` JSON output.
- Add live model eval coverage for summary-prior prose quality when the full
  eval harness is restored; do not use that as a substitute for deterministic
  run-scoping tests.
