# Issue 484 - Front-of-House Walk Held-Back Hot Spots

Status: implementation plan, 2026-06-30.

Issue: GitHub #484, "Front-of-House walk: hold hot-spots to a trailing movement
(global held-back, after the comprehension pass)".

Run ID: `01KWCCYNPPY5BWDKFSQX1XWXH9`.

Goal: change `ax internal front-of-house prepare-agenda` so the deterministic
Front-of-House agenda presents the search frame first, then every comprehension
item, then every `hot_spot` item as one trailing held-back movement.

Linked product plan: the issue references
`docs/alexandria/plans/front-of-house-walk-reshape/plan.md` section 6 D5,
section 8 slice B, plus `walk-spec.md` "Turn N+1". Those files were not present
in this checkout before this plan was created, so this document records the
technical implementation handoff for that methodology ruling. The predecessor
technical plan is `docs/alexandria/plans/480-front-of-house-table-agenda/plan.md`;
its deferred follow-up explicitly names held-back hot-spots as the EL3
methodology reshape. Issue comments checked: the only current comment records
Fabro local run `01KWCCYNPPY5BWDKFSQX1XWXH9` and adds no extra technical
requirements.

## Scope

This slice is a narrow `packages/ax` deterministic agenda-ordering change.

In scope:

1. Change the agenda comparator in
   `packages/ax/src/domain/library-front-of-house.ts` so `kind === "hot_spot"`
   items sort after all non-`hot_spot` items globally.
2. Preserve frame-first behavior for `origin === "frame"` ahead of both
   movements.
3. Preserve existing placement and tie-break order inside each movement:
   canonical plane order, context `localeCompare`, unfiled last within that
   movement, severity, thread kind, title, id, and original index.
4. Update deterministic unit tests for mixed-kind ordering, frame-first,
   unfiled-within-movement behavior, and idempotent ordering.
5. Update black-box Front-of-House bundle tests so `prepare-agenda` and
   `stage-next` prove the comprehension movement drains before the held-back
   `hot_spot` movement.
6. Add or refine PMS-bundle assertions so all `stage2_question` items precede
   every `hot_spot` item in `agenda.json`.

## Non-Goals

1. Do not change `threads.json`, `library-threads.v1`, or Back-of-House
   producers.
2. Do not change the `FrontOfHouseAgendaItem` data model. The #482 fields
   `confidence`, `origin`, `basis`, `context`, `plane`, and `concerns` are
   already present and remain unchanged.
3. Do not change the shipped plugin workflow graph or Raven skill wording in
   this slice.
4. Do not add Raven's spoken transition copy for the held-back movement. The
   prompt-layer framing ("now that we have walked the sections...") is deferred
   to the methodology prompt/capstone work.
5. Do not change Ledger event schemas, answer recording, patch validation,
   residual accounting, or thread lifecycle write-back.
6. Do not write to `docs/alexandria/library/`.

## Current Gap

Issue #482 shipped the agenda table data model and an agenda comparator in
`packages/ax/src/domain/library-front-of-house.ts`. The current comparator:

1. Groups `origin === "frame"` first.
2. Groups filed items before unfiled items.
3. Orders filed items by plane, then context.
4. Uses severity and `agendaFamilyRank` as local tie-breakers, where
   `stage2_question` ranks before `hot_spot`.

That means the current behavior only prefers questions over hot spots inside a
local placement group. A high-severity `hot_spot` in an earlier plane/context can
still appear before a later `stage2_question`, and a context that contains both
kinds can interleave the problem immediately after that context's questions.

The required behavior is a two-movement agenda:

1. `frame` items first.
2. Comprehension movement: every non-`hot_spot` item, filed by plane/context,
   then unfiled.
3. Held-back movement: every `hot_spot` item, filed by plane/context, then
   unfiled.

`stage-next` already reads `agenda.json` in order and selects the first
unanswered/non-residual item. No separate `stage-next` sorter exists, so the
runtime walk changes when `prepare-agenda` writes the new order.

## Architectural Boundaries

`packages/ax` owns this slice. Keep the CLI deterministic, non-interactive, and
artifact-driven.

The ordering rule belongs in the pure domain projection:
`compareAgendaProjections` and its small helper functions in
`library-front-of-house.ts`. `runPrepareAgenda` should continue to build the
resolver, call `buildFrontOfHouseAgenda`, and write the same runtime files.

The implementation should model movement explicitly rather than overloading
severity or local family tie-breaks:

1. `origin === "frame"` has absolute rank 0.
2. Non-frame, non-`hot_spot` items are movement rank 1.
3. Non-frame `hot_spot` items are movement rank 2.
4. Within each non-frame movement, filed items sort before unfiled items.
5. For filed items within a movement, keep the existing plane/context ordering.
6. Then apply deterministic item tie-breakers: severity, `threadKind`, title,
   id, and original index.

The existing `FRONT_OF_HOUSE_AGENDA_ITEM_KINDS` closed set stays
`stage2_question | hot_spot`. If `agendaFamilyRank` remains in code, it must not
be the mechanism that decides the comprehension-vs-problem arc; the movement
rank must be the first non-frame discriminator.

The shipped plugin workflow already loops
`prepare_agenda -> stage_next -> director_review -> plan_bundle_patch ->
apply_bundle_patch -> stage_next`. Because `stage-next` advances through
`agenda.items[]`, no workflow or plugin prompt edit is required for this slice.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| FoH agenda domain | `packages/ax/src/domain/library-front-of-house.ts` | Comparator groups all `hot_spot` items into a trailing held-back movement while preserving frame-first and per-movement plane/context ordering |
| FoH domain tests | `packages/ax/tests/library-front-of-house.test.ts` | Unit coverage for global question-before-hot-spot order, context-with-both-kinds behavior, frame-first, unfiled-in-movement placement, and stable tie-breaks |
| FoH CLI black-box tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | `prepare-agenda` output and `stage-next` advancement prove comprehension items drain before held-back hot spots; PMS fixture asserts global order and idempotency |
| FoH CLI command wrapper | `packages/ax/src/commands/front-of-house.ts` | No intended behavior change; covered as a regression because `stage-next` consumes the prepared order |
| Shipped plugin workflow/skill | `packages/alexandria-plugin/workflows/front-of-house-walk/*`, `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` | No file changes; workflow continues staging one item at a time from `agenda.json` |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Raven Front-of-House runtime input | Raven will receive all comprehension items before the first held-back `hot_spot`, because `current-item.*` and `for-raven.md` are generated from reordered `agenda.items[]` | Deterministic tests assert staged order; no prompt copy change in this slice |
| Shipped `front-of-house-walk` skill | No instruction or workflow change | No plugin validation required for changed files; skill evals are not required until prompt/workflow behavior changes |
| CLI artifact contract | `agenda.json` item fields and schema version stay unchanged; only item order changes | Black-box tests assert stable fields plus new order |
| Ledger/event behavior | No change | Existing event and residual tests remain regression coverage only |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| FoH domain tests | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Proves the pure agenda comparator and renderer/residual regressions |
| FoH bundle CLI tests | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Proves `prepare-agenda`, `stage-next`, PMS fixture order, idempotency, exit codes, and important output fields |
| Related confirmation CLI regression | `cd packages/ax && bun test tests/library-confirmation-cli.test.ts` | Guards the surrounding answer/confirmation path that shares runtime artifacts |
| Event schema regression | `cd packages/ax && bun test tests/events.test.ts` | Proves the closed agenda item kind schema is unchanged |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches comparator/test type drift |
| AX format check | `pnpm --filter @alexandria/ax run format:check` | Keeps touched TypeScript in package style |

If implementation time is constrained, the first two test commands are the
minimum required gate. Any skipped wider checks must be named in the handoff.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| `packages/ax` deterministic CLI and domain projection | Covered by Bun unit and black-box bundle tests | Add/adjust deterministic tests in this slice | Commands listed above |
| Shipped `front-of-house-walk` skill/workflow | FoH stochastic/adversarial eval rows are owed by broader proof work, but this slice does not edit skill prompts or workflow graph | No eval-harness rerun required for #484 | None |
| Contributor planning workflow | This plan used the maintainer planning skill only | No eval-harness coverage required | None |

Rationale: #484 changes deterministic `agenda.json` ordering and therefore the
runtime sequence of staged artifacts. It does not change reusable agent/skill
instructions. A later prompt-layer slice that adds held-back movement spoken
framing should decide and run the relevant FoH walk evals.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The implementation leaves `agendaFamilyRank` as an early tie-breaker and only fixes one test fixture | Add a movement rank helper and assert a high-severity early-context `hot_spot` trails a later-context `stage2_question` |
| Frame items accidentally join the comprehension movement because their kind is `stage2_question` | Keep `origin === "frame"` as the first comparator discriminator and test frame-first with hot spots present |
| Unfiled `stage2_question` items move after filed `hot_spot` items | Rank movement before filed/unfiled grouping, and test an unfiled question before a filed hot spot |
| `stage-next` still appears green because existing fixtures have only one question before one hot spot | Add or extend a black-box fixture with multiple questions across later contexts plus earlier hot spots, then assert successive `stage-next` ids |
| PMS fixture count tests pass while order regresses | Add explicit PMS assertions for `max(stage2_question index) < min(hot_spot index)` and stable re-run output |
| Triage/card-link regressions hide inside an ordering-only change | Keep current field assertions in bundle tests and add order assertions without weakening field checks |
| Re-running `prepare-agenda` changes order because a tie-breaker is unstable | Preserve final deterministic tie-breakers and compare `agenda.json` before/after a second prepare run |

## Implementation Steps

1. In `library-front-of-house.ts`, replace the current frame/filed/unfiled
   grouping with an explicit movement-aware comparator helper. A clear shape is:
   frame rank, held-back rank (`kind === "hot_spot"`), filed rank, plane/context
   ordering for filed items, then deterministic tie-breakers.
2. Keep `isUnfiledAgendaItem` semantics unchanged: any non-frame item whose
   `context` or `plane` is `unfiled` sorts as unfiled within its movement.
3. Keep `compareAgendaPlanes` and `orderProductCardPlanes` reuse unchanged.
   Unknown non-unfiled planes should continue sorting after canonical planes but
   before explicit Unfiled.
4. Remove `agendaFamilyRank` from the observable ordering path, or leave it only
   after the movement discriminator where it cannot interleave hot spots with
   comprehension items. For the current closed kind set, the effective
   per-movement tie-breakers should be severity, thread kind, title, id, and
   original index.
5. Update `packages/ax/tests/library-front-of-house.test.ts`:
   - revise the existing ordering test so a high-severity early-context
     `hot_spot` trails all `stage2_question` items;
   - add a same-context mixed-kind case proving that context's `hot_spot` trails
     later-context questions, not only its own context's questions;
   - add or include unfiled question and unfiled hot-spot cases proving unfiled
     is last within each movement.
6. Update `packages/ax/tests/library-front-of-house-bundle.test.ts`:
   - extend the frame-first plane/context table test with hot spots, or add a
     focused new black-box fixture for the two-movement order;
   - assert `agenda.json` order directly;
   - call `stage-next`, answer or residual staged questions as needed, and
     assert no `hot_spot` is staged until all unresolved `stage2_question` items
     have been handled.
7. Strengthen the PMS fixture test:
   - keep the count and field assertions;
   - assert every `stage2_question` index is lower than every `hot_spot` index;
   - assert the stage2 movement and hot-spot movement each preserve
     plane/context order for their resolved placements;
   - re-run `prepare-agenda` and compare `agenda.json` byte-for-byte for
     idempotency.
8. Run the deterministic verification commands and report any skipped wider
   checks explicitly.

## Acceptance / Exit Criteria

1. On the PMS bundle, every `stage2_question` item precedes every `hot_spot`
   item in `runtime/front-of-house/agenda.json`; frame items, when present, are
   still first.
2. The comprehension movement orders filed items by
   `strategy -> product -> learning`, then context `localeCompare`, then
   severity, thread kind, title, id, and original index; unfiled comprehension
   items come after filed comprehension items.
3. The held-back movement uses the same internal order and places unfiled
   `hot_spot` items after filed `hot_spot` items.
4. A context with both a `stage2_question` and `hot_spot` no longer presents the
   hot spot immediately after that context's questions when later contexts still
   have comprehension questions.
5. `for-raven.md` and `current-item.md` still render exactly one staged item at
   a time.
6. `stage-next` advances through all unresolved comprehension items before
   staging any held-back `hot_spot` item.
7. Negative: no `hot_spot` item is presented before any unresolved
   `stage2_question` item.
8. Re-running `prepare-agenda` on the same bundle yields identical
   `agenda.json` order.
9. Regression: triage fields (`confidence`, `origin`, `basis`), card links,
   frame-first behavior, parser compatibility, patch validation, residual
   accounting, and the #482 resolver behavior remain unchanged.
10. The verification commands in this plan pass, or skipped non-minimum checks
    are explicitly named with the reason.

## Deferred Follow-Ups

1. Raven prompt/capstone wording for the held-back movement transition.
2. A visible movement label in generated runtime markdown, if later methodology
   work wants Raven to see "comprehension" versus "held-back" explicitly.
3. Library Notepad or Viewer mirroring of the same two-movement agenda grouping,
   if the product surface later displays FoH agenda sequence before staging.
4. FoH walk eval additions/reruns when plugin prompts or workflow behavior
   change.

---

# Issue 485 - Front-of-House Section Confirmed Event

Status: implementation plan, 2026-06-30.

Issue: GitHub #485, "Front-of-House walk: add the section_confirmed event +
confirm-section command (human summary -> Ledger)".

Goal: add a durable Front-of-House Ledger fact for the director-confirmed human
summary of a walked section. The new command banks the summary after Raven has
proposed it and the director has confirmed it through an existing
`library.front_of_house.answer_recorded` event. The event is the human-language
record EL5 will later consume; this slice does not write card bodies.

Plan path: `docs/alexandria/plans/front-of-house-walk-reshape/plan.md`.

Linked product plan: issue #485 cites `front-of-house-walk-reshape` §11 and the
`walk-spec.md` "section close" contract. That plan/spec directory was not
present in this checkout before this artifact was created; the issue text and
the current Front-of-House implementation are therefore the controlling sources
for this technical handoff.

Run context from request: `01KWCCYKA8DF9R30D8E7WRYSXD`.

## Scope

This slice changes the deterministic `packages/ax` Front-of-House support only.

In scope:

1. Add event type `library.front_of_house.section_confirmed` to
   `ALEXANDRIA_STATE_EVENT_TYPES`, payload schemas, event schema descriptors, and
   state-event parser/append validation.
2. Add
   `ax internal front-of-house confirm-section --bundle <path> --run <id> --context <context> --pref-label <human> --summary-file <md> --answer-event <eventId> [--scope-file <md>] [--json]`.
3. Enforce the provenance gate: `--answer-event` must name a
   `library.front_of_house.answer_recorded` event with `actor.kind = user` whose
   payload `playRunId` equals `--run`.
4. Derive `plane`, `cards`, and `unknowns` from the existing agenda and Ledger
   state for `--context`; the caller passes only context, label, summary,
   answer event, and optional scope.
5. Make section confirmation single-valued per `(run, context)` and retry-safe
   for repeated banking of the same confirmation.
6. Extend Front-of-House readback so final run accounting notes which contexts
   have `section_confirmed` facts.
7. Add focused unit and black-box CLI coverage for the issue acceptance matrix.

The event payload should include the issue's fields plus the run id required by
the existing Front-of-House event pattern:

```json
{
  "playRunId": "<run id>",
  "context": "proving",
  "plane": "product",
  "prefLabel": "Proving a Play",
  "summary": "<director-confirmed human summary>",
  "cards": ["proving/Economy - Pass Rate.md"],
  "unknowns": ["<residual agenda item id>"],
  "answerEventId": "<backing answer_recorded event id>",
  "scope": "<optional in/out fence for this section>"
}
```

`scope` is optional. The command reads `--scope-file` when the flag is present,
errors if that file is unreadable, and omits the field when the flag is absent
or the file trims to an empty string.

## Non-Goals

1. Do not change the Front-of-House plugin workflow, Raven skill, or prompts in
   this slice. Raven drafting the section summary belongs to the methodology
   layer that rides the capstone.
2. Do not implement EL5/D2 consumption of `section_confirmed`.
3. Do not write, generate, or modify card bodies. This command banks prose only
   into the Ledger event.
4. Do not write directly to `docs/alexandria/library/`.
5. Do not add a new Viewer surface.
6. Do not add a broad prose-quality validator for `summary`. The deterministic
   command should reject missing or empty summary text, but Raven/methodology
   owns the "human summary; no code refs or internal slugs" authoring rule.
7. Do not change existing `answer_recorded`, `bundle_patch_applied`, or
   `residual_gap_recorded` payload shapes except through additive tests proving
   they still round-trip.

## Current Gap

Current AX state:

1. `packages/ax/src/domain/state-events.ts` defines Front-of-House event types
   for `turn_recorded`, `answer_recorded`, `bundle_patch_applied`, and
   `residual_gap_recorded`, but not `section_confirmed`.
2. `packages/ax/src/commands/play-answer.ts` banks director answers as
   `library.front_of_house.answer_recorded` with `actor.kind = user` before
   resuming the Fabro human gate.
3. `packages/ax/src/domain/library-front-of-house.ts` already has the agenda
   projection added by the table-agenda work: agenda items carry `context`,
   `plane`, `confidence`, `origin`, `basis`, `concerns`, and evidence refs.
4. `packages/ax/src/commands/front-of-house.ts` has the sibling command pattern:
   parse options, load bundle agenda, list events, append process events through
   the store, use idempotency keys, and return stable `CliResult` exit codes.
5. `apply-patch` already refuses director-attributed card writes without a
   matching user answer event, but that helper currently validates by agenda
   item id rather than the run-level gate needed for `confirm-section`.
6. `finalize` writes `RESIDUAL-GAPS.md` from agenda plus residual events, but it
   does not mention director-confirmed section summaries.

What the issue requires:

1. A durable process event carrying the director-confirmed human summary for a
   section.
2. A deterministic bank command that cites the backing director answer and
   derives card/unknown sets.
3. Idempotent behavior so retries do not duplicate section confirmation facts.
4. Readback that makes confirmed contexts visible to the run operator.

## Architectural Boundaries

`packages/ax` owns this slice. The command remains non-interactive and
deterministic.

State-event schema work belongs in `packages/ax/src/domain/state-events.ts`:

1. Add the new literal to `ALEXANDRIA_STATE_EVENT_TYPES`.
2. Add `FrontOfHouseSectionConfirmedPayloadSchema`.
3. Add an event schema descriptor so `ax inspect events schema --json` exposes
   the payload contract.
4. Add the payload schema to `STATE_EVENT_PAYLOAD_SCHEMAS` so parser and append
   validation round-trip the new type.

Front-of-House domain work belongs in
`packages/ax/src/domain/library-front-of-house.ts`:

1. Add types/helpers for `FrontOfHouseSectionConfirmed` and
   `FrontOfHouseSectionConfirmationPayload`.
2. Add a run-level answer lookup helper, for example
   `findFrontOfHouseAnswerEventForRun({ answerEventId, playRunId, events })`,
   rather than overloading the patch helper that validates agenda item id.
3. Add pure derivation helpers:
   `deriveSectionCardsForContext(agenda, context)`,
   `deriveSectionUnknownsForContext({ agenda, events, playRunId, context })`,
   and `deriveSectionPlaneForContext(agenda, context)`.
4. Add a projection helper for confirmed section events used by readback.

Command work belongs in `packages/ax/src/commands/front-of-house.ts`:

1. Add parsing/help for `confirm-section`.
2. Read `agenda.json`, the summary file, optional scope file, and the Ledger.
3. Validate the answer-event provenance gate before any append.
4. Append `library.front_of_house.section_confirmed` with `actor:
   DEFAULT_AX_ACTOR`.
5. Use a stable idempotency key such as
   `foh:section-confirmed:<playRunId>:<context>` and pre-check existing
   `section_confirmed` events for the same `(playRunId, context)`.

The idempotency rule should be:

1. If an existing `section_confirmed` event has the same `playRunId`, `context`,
   and `answerEventId`, return success with status `already_appended` and the
   existing event id; append nothing.
2. If an existing event has the same `playRunId` and `context` but a different
   `answerEventId`, return invalid input and append nothing. A context is
   single-valued per run.
3. Otherwise append a new event. The store idempotency key remains a second-line
   protection against concurrent retries.

Derivation rules:

1. Match section agenda items by exact `agendaItem.context === --context`.
2. Reject an unknown context when no agenda item matches; include known contexts
   in the error. A context with matching agenda items but no residual events is
   valid and emits `unknowns: []`.
3. Derive `plane` from the matched items. If all matched items agree, use that
   value. If multiple planes appear, reject as ambiguous because the event has a
   single `plane` field.
4. Derive `cards` from matched agenda items' resolved concern links:
   `agendaItem.concerns[].cardPath`, de-duped in agenda/concern order. Orphaned
   concerns without `cardPath` do not fail the command and are omitted from the
   card set.
5. Derive `unknowns` from `library.front_of_house.residual_gap_recorded` events
   for the same `playRunId` whose `agendaItemId` maps to a matched agenda item,
   de-duped in agenda order.
6. Read `summary` from `--summary-file`, trim surrounding whitespace, and reject
   empty content. Do not generate, rewrite, or summarize prose in the command.

Readback should remain Ledger-derived. Extend `runFinalize` to collect
`section_confirmed` events for the run and pass them into the residual readback
renderer. `RESIDUAL-GAPS.md` should gain a concise `Confirmed Sections` section
that lists each confirmed context, pref label, plane, backing answer event id,
card count, unknown count, optional scope, and summary. This satisfies the
readback requirement without adding a new product surface.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX state event schema | `packages/ax/src/domain/state-events.ts` | Adds validated `library.front_of_house.section_confirmed` event type and schema descriptor |
| FoH domain helpers | `packages/ax/src/domain/library-front-of-house.ts` | Adds section confirmation types, run-level answer provenance lookup, card/unknown/plane derivation, and readback projection |
| FoH CLI command | `packages/ax/src/commands/front-of-house.ts` | Adds `confirm-section` parser/help/runner, summary/scope file reads, provenance gate, idempotent append, JSON/human output |
| FoH tests | `packages/ax/tests/library-front-of-house.test.ts` | Covers pure derivation, parser/projection helpers, empty unknowns, ambiguous or missing context errors |
| FoH black-box CLI tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Covers command success, exit codes, no card writes, idempotent retry, missing user answer rejection, readback |
| Event schema tests | `packages/ax/tests/events.test.ts` | Asserts inspect schema output and parser/append round-trip for the new event type |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Shipped Front-of-House Raven skill | None in this slice | No plugin file changes, plugin validation, or Front-of-House eval rerun required |
| Raven methodology/prompt layer | Deferred | A later capstone/methodology slice should teach Raven when to draft the section summary and call `confirm-section` |
| CLI JSON artifact | `confirm-section --json` returns status, event id, run id, context, plane, cards, unknowns, and answer event id | Black-box CLI tests assert important output fields |
| Ledger schema | New process event type is additive | `events.test.ts` and state-event parser validation cover schema visibility and round-trip |
| Run readback | `RESIDUAL-GAPS.md` lists confirmed sections during finalize | Existing finalize tests extend assertions without adding Viewer or plugin behavior |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| FoH domain tests | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Proves pure derivation of section cards, unknowns, plane, event projection, and degraded empty unknowns behavior |
| FoH CLI black-box tests | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Proves command parsing, exit codes, Ledger appends, no card writes, idempotency, readback, and negative provenance behavior |
| Event schema tests | `cd packages/ax && bun test tests/events.test.ts` | Proves inspect schema includes the new event and parser/append validation round-trips it |
| Existing answer/patch/residual regression | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts tests/library-front-of-house.test.ts` | Keeps the sibling answer/patch/residual flow unchanged while extending the same files |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches event union/schema/type updates across commands/tests |
| AX format check | `pnpm --filter @alexandria/ax run format:check` | Keeps changed TypeScript in package style |

If implementation time is constrained, the first three rows are the minimum
handoff gate; skipped package-wide checks must be named in the implementation
handoff.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| `packages/ax` deterministic CLI and Ledger schema | Covered by Bun unit and black-box CLI tests | Add deterministic tests in this slice | Commands listed above |
| Shipped `front-of-house-walk` skill/workflow | Product eval coverage belongs to slices that edit the skill/workflow prompts | No eval-harness run required because this slice does not change plugin skills, agents, prompts, or workflows | None |
| EL5/D2 consumption | Not implemented in this slice | Defer eval decisions to D2 when it consumes `section_confirmed` | None |
| Contributor planning skill | Used only for this handoff | No eval-harness coverage required | None |

Rationale: this is an additive deterministic AX command and Ledger schema
change. It gives Raven a new command surface later methodology work can call,
but it does not change Raven's reusable instructions in this slice.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The new event cannot be reliably filtered by run if `playRunId` is omitted | Include `playRunId` as a required payload field, matching existing Front-of-House event shapes |
| The provenance gate accepts a real answer from the wrong run | Validate `answerEventId` by id, type, `actor.kind = user`, and payload `playRunId === --run` before append |
| Re-running after residual state changes creates duplicate or conflicting section facts | Pre-check existing `section_confirmed` by `(playRunId, context)` and append nothing for same answer event; reject a different answer event for an already confirmed context |
| Card derivation misses orphaned concerns or crashes on missing card paths | Derive cards only from resolved `concerns[].cardPath`; omit unresolved concerns and cover the behavior in unit tests |
| A context spans multiple planes but the event has one plane field | Reject ambiguous matched planes with a clear invalid-input error instead of choosing silently |
| The command appears to certify prose quality it cannot check deterministically | Keep summary generation/quality out of AX; AX only rejects empty summary files and records the supplied text with provenance |
| Readback drifts from Ledger truth | Render confirmed sections from `section_confirmed` events during `finalize` rather than maintaining a separate mutable file |
| Existing answer/patch/residual commands regress while adding the sibling command | Keep changes additive, reuse existing command patterns, and rerun existing FoH test files |

## Implementation Steps

1. Add `library.front_of_house.section_confirmed` to state events:
   update `ALEXANDRIA_STATE_EVENT_TYPES`, add the Schema payload with required
   `playRunId`, `context`, `plane`, `prefLabel`, `summary`, `cards`,
   `unknowns`, `answerEventId`, optional `scope`, add the schema descriptor, and
   wire `STATE_EVENT_PAYLOAD_SCHEMAS`.

2. Add event schema tests:
   extend `packages/ax/tests/events.test.ts` to assert the new event appears in
   `ax inspect events schema --json` with the expected required/optional fields,
   arrays, and `additionalProperties: false`; add or extend parser/append
   round-trip coverage for the new type.

3. Add FoH domain types and helpers in `library-front-of-house.ts`:
   define a section confirmation projection type; add a payload-string helper
   if needed; implement `findFrontOfHouseAnswerEventForRun`; implement pure
   `deriveSectionPlaneForContext`, `deriveSectionCardsForContext`, and
   `deriveSectionUnknownsForContext`.

4. Add domain tests:
   cover happy-path derivation from agenda concerns and residual events, empty
   unknowns, unknown context rejection, ambiguous plane rejection, de-duping in
   agenda order, and run-level answer provenance rejection for missing, wrong
   type, wrong actor, and wrong run events.

5. Add `confirm-section` command parsing and help:
   update `FrontOfHouseOptions`, `formatFrontOfHouseHelp`, a new
   `formatConfirmSectionHelp`, option parsing for `--bundle`, `--run`,
   `--context`, `--pref-label`, `--summary-file`, `--answer-event`,
   optional `--scope-file`, and `--json`, and dispatch in
   `runFrontOfHouseCli`.

6. Implement `runConfirmSection`:
   resolve bundle and file paths relative to `cwd`, read agenda and Ledger,
   read and validate summary/scope text, run the provenance gate, derive
   `plane`, `cards`, and `unknowns`, check existing `section_confirmed` events,
   and append the process event with idempotency key
   `foh:section-confirmed:<run>:<context>`.

7. Define command output:
   for `--json`, return at least `status`, `eventId`, `playRunId`, `context`,
   `plane`, `prefLabel`, `answerEventId`, `cards`, and `unknowns`. Human output
   should be concise, for example
   `appended section confirmation <context>.` Expected validation failures use
   exit code `2` and stderr with a recoverable message plus subcommand help
   where argument parsing failed.

8. Extend readback:
   add a renderer input for confirmed sections and update `runFinalize` to pass
   all `section_confirmed` events for `agenda.playRunId` into
   `renderResidualGapsMarkdown`. Add the `Confirmed Sections` block while
   preserving the existing residual gap content and zero-gap behavior.

9. Add black-box CLI tests in `library-front-of-house-bundle.test.ts`:
   create or reuse a bundle fixture; prepare agenda; bank a user answer through
   the existing path or append a valid answer event; write a summary file; run
   `confirm-section`; inspect Ledger and JSON output; assert card files are
   unchanged.

10. Complete the acceptance matrix tests:
    missing/wrong-user answer rejection appends nothing and exits non-zero;
    identical retry does not append a duplicate; context with no residual events
    emits `unknowns: []`; finalize readback lists confirmed contexts; existing
    answer/patch/residual tests still pass.

11. Run the deterministic verification commands and record any skipped checks in
    the implementation handoff.

## Acceptance / Exit Criteria

1. `ax inspect events schema --json` exposes
   `library.front_of_house.section_confirmed` with required fields
   `playRunId`, `context`, `plane`, `prefLabel`, `summary`, `cards`,
   `unknowns`, and `answerEventId`, optional `scope`, and no additional payload
   properties.
2. Given a prepared agenda and a matching user
   `library.front_of_house.answer_recorded` for the run, `confirm-section`
   appends exactly one process `section_confirmed` event with derived `plane`,
   `cards`, and `unknowns`.
3. The command rejects a missing, wrong-type, wrong-actor, or wrong-run
   `--answer-event` with exit code `2` and appends nothing.
4. The command rejects an unknown context and an ambiguous multi-plane context
   with exit code `2` and appends nothing.
5. Re-running the same `(run, context, answerEventId)` returns success without
   appending a duplicate.
6. Attempting to confirm an already confirmed `(run, context)` with a different
   answer event refuses and appends nothing.
7. A context with matching agenda items and no residual events emits
   `unknowns: []`.
8. The command writes or modifies no card file; tests assert before/after card
   content is identical.
9. `RESIDUAL-GAPS.md` generated by `finalize` includes a `Confirmed Sections`
   readback for confirmed contexts while preserving existing residual gap
   output.
10. Existing answer, patch, residual, and finalize behavior remains unchanged;
    the existing Front-of-House tests pass after the additive work.

## Deferred Follow-Ups

1. Update the Front-of-House Raven skill/workflow or methodology prompts so
   Raven drafts section summaries and calls `confirm-section` at the section
   close. That work should include plugin validation and Front-of-House eval
   planning.
2. Implement D2/EL5 consumption of `library.front_of_house.section_confirmed`
   when atomization inherits human-language section summaries.
3. Decide whether a future section readback deserves its own runtime artifact
   beyond the `RESIDUAL-GAPS.md` final accounting section.
4. Consider structured summary linting only if repeated misuse shows AX needs a
   deterministic guardrail; do not block this slice on unreliable prose checks.

---

# Issue 489 - Front-of-House Headline Opener

Status: implementation plan, 2026-06-30.

Issue: GitHub #489, "Front-of-House walk: Raven's headline opener - present
the container set + drift as a human comprehension turn".

Run ID: `01KWCPJ0VYKYXZADP3PRG1NN3P`.

Goal: teach the shipped Front-of-House Raven skill to open the walk with a
human comprehension-check turn over the deterministic `## Product Containers`
headline from #483: product thesis, major containers, keystone drift, and the
search-frame assumption. The opener must use the existing
`turn_recorded -> answer_recorded -> apply_bundle_patch` loop and must not add
new event, patch, agenda, or card-body semantics.

Linked product plan: the issue cites `front-of-house-walk-reshape` section 4
Turn 0, section 8 slice C2, and `walk-spec.md` Turn 0. No checked-in
`walk-spec.md` exists in this checkout, and this file's earlier sections are
technical handoffs for prior reshape issues. For #489, the issue text and the
current #483 AX headline contract are the controlling spec.

## Scope

This slice is a prompt/skill-layer change in the shipped Alexandria plugin.

In scope:

1. Update `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` so
   Raven treats the first frame-origin wake as the headline opener before any
   section walk.
2. In that opener, Raven must read the `## Product Containers` block from
   `runtime/front-of-house/for-raven.md` or `current-item.md`, then present it
   in human language:
   - thesis from `### Keystone Thesis` (`label` plus `names containers`);
   - "your major pieces are..." from `### Container Set`;
   - uncertainty from `### Keystone Drift` (`named but empty` and
     `present but unnamed`);
   - degraded fallback when `- keystone: none found` appears.
3. Fold the search-frame confirmation from the staged frame-origin item into
   the same director-facing turn: "we assumed X, fenced out Y - right?" using
   the current agenda item's text, basis, origin, and evidence as context.
4. Keep event banking unchanged: Raven calls `record-turn` before presenting
   the opener, and the director confirmation returns through `ax raven answer`
   so the existing `library.front_of_house.answer_recorded` event is written
   with `actor.kind = user`.
5. Update the Front-of-House patch-planning prompt so a director-confirmed
   container rename is expressed only through allowed bundle patch fields,
   especially `context`, with no new patch type.
6. Refresh shipped play metadata or Studio proof notes only where they describe
   the opening human turn and would otherwise contradict the new behavior.
7. Add a lightweight structural eval/contract check for the prompt text because
   this checkout has no Front-of-House LLM eval harness.

## Non-Goals

1. Do not change the #483 deterministic headline projection or renderer in
   `packages/ax/src/domain/library-front-of-house.ts`.
2. Do not add a headline agenda item, thread item, event type, runtime flag, or
   patch schema.
3. Do not change `agenda.json`, `current-item.json`, `for-raven.md`, or
   `current-item.md` shapes.
4. Do not implement per-section comprehension framing, held-back hot-spot
   spoken framing, or the capstone movement.
5. Do not implement or change `section_confirmed`; #489 only uses the existing
   answer and bundle patch loop.
6. Do not write card bodies, synthesize card-body prose, or rewrite the
   keystone card body. EL3 remains structure-only.
7. Do not write directly to `docs/alexandria/library/`.
8. Do not add Viewer behavior.

## Current Gap

#483 already computes the headline and renders it ahead of every staged item:

1. `FrontOfHouseHeadline` contains `keystone`, `containers`, and `drift`.
2. `renderFrontOfHouseHeadlineMarkdown` renders `## Product Containers` with
   `### Container Set`, `### Keystone Thesis`, and `### Keystone Drift`.
3. `prepare-agenda` writes that block into `for-raven.md` and
   `current-item.md`.
4. AX tests assert the block appears before the current agenda item and that
   the keystone card body is unchanged.

The shipped `front-of-house-walk` skill currently tells Raven to read the
staged item, record the turn, and riff at section/shape altitude. It does not
say that the headline block is a first-turn comprehension map, does not tell
Raven how to translate the raw markdown into a human opener, and does not
distinguish the frame-origin first turn from later section turns. As a result,
Raven can skip the highest-leverage map check, read the raw markdown at the
director, or treat drift as an ordinary agenda item instead of a global
container reconciliation.

The patch-planning prompt already forbids body edits and allows `context`, but
it does not explicitly connect headline container renames to that existing
field. Without that reminder, the agent may over-invent a new rename mechanism
or try to rewrite the keystone body.

## Architectural Boundaries

`packages/alexandria-plugin` owns this slice because the requested behavior is
Raven's guided play behavior, not deterministic AX computation.

The skill should use the AX headline block as an input contract, but AX remains
the source of deterministic truth. Implementation should not parse or mutate
headline data in AX, and it should not add new persisted state to remember that
the opener happened. The opener is tied to the first staged frame-origin item:
Raven records that staged turn, speaks the headline map plus search frame, and
banks the director's response through the normal answer path.

The practical framing rule belongs in `front-of-house-walk/SKILL.md`:

1. After `record-turn`, read `current-item.json`, `current-item.md`, and
   `for-raven.md`.
2. If the current agenda item has `origin: "frame"`, present the headline
   opener before drilling into sections.
3. Treat `## Product Containers` as source material, not copy to recite.
4. Translate slug-like container names into readable names where obvious, while
   preserving the canonical value when asking for renames.
5. Ask the director to confirm, merge, or rename the container set and search
   frame in one response.
6. On later non-frame turns, use the headline only as background context and do
   not repeat the opener.

The patch planner remains a narrow adapter from director answer to existing
bundle patch:

1. A container rename maps to `set.context` on specific card updates when the
   answer and staged evidence identify the affected cards.
2. If the director confirms the map but no card update is needed or safely
   identifiable, write a valid empty patch.
3. If the director cannot decide, use the existing unresolved patch path.
4. Never rewrite card bodies or the keystone body.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Shipped FoH Raven skill | `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` | Adds Turn 0 headline opener instructions: transform the headline into human thesis/container/drift/search-frame confirmation before any section item |
| FoH patch planner prompt | `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md` | Clarifies that container renames use existing `context` patch fields only, and that the keystone/card bodies remain untouched |
| FoH workflow metadata | `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json` and, only if needed, `studio/plays/front-of-house-walk/brief.md` or `risk-map.md` | Keeps the human-gate description aligned with the new first-turn opener without changing the workflow graph |
| Prompt contract eval | `packages/ax/tests/eval-cases/front-of-house-walk/headline-opener-contract/config.json` | Adds a structural guard that the shipped skill/prompt keep the headline opener rules present while no FoH LLM harness exists |
| AX headline renderer | `packages/ax/src/domain/library-front-of-house.ts` | No intended file change; remains the source of `Product Containers` input |
| AX FoH tests | `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts` | No intended test edits; rerun as regression if implementation touches AX or needs to prove the headline block is still available |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Raven director-facing opener | First frame-origin wake becomes a global comprehension check: thesis, major containers, drift, and search-frame assumptions, phrased conversationally | Update `front-of-house-walk/SKILL.md`; structural eval checks the rule exists |
| Raven event discipline | Raven still records the presented turn through `record-turn` before speaking, and director confirmation still goes through `ax raven answer` | Skill wording must preserve the command order; no event schema change |
| Raven answer semantics | Director can confirm, merge, or rename canonical containers in the answer for the staged frame item | Patch prompt maps safe renames to `context`; unresolved/empty patch paths stay available |
| Bundle patch planning | Container rename means an allowed structure update, not a new rename event or body rewrite | Update `plan_bundle_patch.md`; existing AX validator remains the hard boundary |
| Later section turns | Raven should not repeat the headline opener on every item | Skill gates the opener on `origin: "frame"` and treats later headline blocks as background |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Plugin structure | `claude plugin validate ./packages/alexandria-plugin` | Required validation for shipped plugin skill/workflow prompt changes |
| Markdown lint | `pnpm run lint:markdown` | Catches Markdown regressions in changed skill, workflow prompt, plan, or Studio prose |
| Front-of-House prompt contract | `pnpm eval -- run front-of-house-walk/headline-opener-contract` | Structural substitute check for the opener rules while no FoH LLM eval harness exists |
| AX headline regression | `cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts` | Confirms #483 headline render, turn recording, answer, patch, and no-body-write invariants still hold if any AX-adjacent file changes |
| Plugin package tests | `pnpm --filter @alexandria/plugin test` | Lightweight regression for plugin package tests; expected to be unchanged but cheap when touching plugin files |

If implementation changes only Markdown prompt/skill files and the new eval
config, the first three rows are the minimum gate. If implementation touches
TypeScript or AX fixtures, include the AX headline regression row.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Shipped `front-of-house-walk` skill | No checked-in Front-of-House LLM eval harness exists; the play risk map explicitly marks Raven-mediation stochastic rows as owed | Add a structural prompt-contract eval for this slice so the headline opener requirements are at least guarded in CI-like evaluation | New `packages/ax/tests/eval-cases/front-of-house-walk/headline-opener-contract/config.json`; run `pnpm eval -- run front-of-house-walk/headline-opener-contract` |
| Raven mediation quality | Not covered by the current eval runner | Do not claim stochastic proof in #489; record as deferred follow-up | Future adaptive FoH eval case covering Turn 0 faithfulness, drift uncertainty, no raw markdown, and no body-fill pressure |
| AX deterministic headline | Covered by Bun domain and bundle tests | Rerun only as regression unless AX code changes | `cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts` |

Rationale: the product behavior changes in a shipped skill, so an eval impact is
required. This checkout's `pnpm eval` runner is a structural substitute, not the
historical live Claude conversation harness. The honest gate for #489 is
plugin validation plus a structural contract check; a real adaptive
Front-of-House opener eval remains owed before calling the play proven.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Raven reads the raw `## Product Containers` markdown instead of making a human comprehension turn | Skill instructions explicitly say the block is source material and provide the thesis/container/drift/search-frame transformation |
| Raven repeats the headline on every staged item because the block appears in every `for-raven.md` | Gate the opener on the current item having `origin: "frame"`; later turns use the block only as background |
| A missing keystone causes the opener to stall or apologize instead of proceeding | Add a degraded rule for `- keystone: none found`: present the Container Set, say no single thesis card was found, and continue the confirmation |
| Drift is presented as fact rather than uncertainty | Require conversational uncertainty language for `named but empty` and `present but unnamed`, and ask the director to confirm or reconcile names |
| The search-frame item gets handled as a separate ordinary question after the headline | Skill folds the frame-origin item's text/basis into the same opener and asks for one confirmation response |
| Container rename pressure causes a new patch/event mechanism | Patch prompt states renames use existing `context` updates or an empty/unresolved patch; no schema change |
| The agent rewrites card bodies or the keystone body to "fix" the thesis | Skill and patch prompt repeat the EL3 structure-only boundary; existing AX patch validation rejects body writes |
| Structural eval gives false confidence about live conversational quality | Eval section names it as a contract guard only and defers adaptive FoH mediation evals as proof work |

## Implementation Steps

1. Update `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`:
   add a "Headline Opener" subsection under "On Human Input" after the
   `record-turn` command and file reads.
2. In that subsection, instruct Raven to inspect `current-item.json`. When the
   current agenda item has `origin: "frame"`, she must make the first
   director-facing turn the global opener before section drill-down.
3. Define the opener transformation:
   - use `Keystone Thesis` label plus named containers as the product thesis;
   - render `Container Set` as major pieces in human-readable names;
   - render `Keystone Drift` as uncertainty, separating named-but-empty from
     present-but-unnamed;
   - if the keystone line says `none found`, skip thesis certainty and still
     present the container set;
   - fold the frame-origin agenda item into the same turn as the search-frame
     confirmation.
4. Add negative wording to the skill: do not recite raw markdown, do not call
   the headline a thread item, do not fill bodies, do not rewrite the keystone
   body, and do not infer director confirmation from silence.
5. Update the normal later-turn instructions so the repeated headline block in
   `for-raven.md` is background context after the frame-origin opener, not a
   repeated speech pattern.
6. Update `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md`:
   state that director-confirmed container renames are represented by existing
   `context` updates on specific `cardUpdates`; if no safe card update is
   needed, write an empty patch; if unresolved, use the existing unresolved
   patch shape.
7. If `legs.json`, the Studio play brief, or the risk map still imply the first
   human gate is only a single Stage-2 question/Hot Spot, update that prose to
   name the headline opener while preserving the workflow graph.
8. Add
   `packages/ax/tests/eval-cases/front-of-house-walk/headline-opener-contract/config.json`
   with structural checks that the skill/prompt mention the Product Containers
   source, Keystone Thesis, Container Set, Keystone Drift, frame-origin opener,
   `record-turn` before presenting, existing `context` patch path, and the
   no-card-body/no-keystone-body boundary.
9. Run the deterministic verification commands listed above and record any
   skipped checks in the implementation handoff.

## Acceptance / Exit Criteria

1. On the first frame-origin Front-of-House wake, Raven calls
   `ax internal front-of-house record-turn` and banks a
   `library.front_of_house.turn_recorded` event with `actor.kind = agent`
   before presenting the opener.
2. Raven's first director-facing turn presents the #483 headline as human
   comprehension: product thesis from the keystone label and named containers,
   the major container set, and both drift lists.
3. The opener includes the search-frame confirmation from the staged
   frame-origin agenda item in the same turn.
4. The opener does not read the raw markdown, does not present the headline as
   a thread item, and does not start with a per-section agenda item before the
   global map check.
5. The director confirmation is sent through `ax raven answer`, producing the
   existing `library.front_of_house.answer_recorded` event with
   `actor.kind = user`.
6. Confirmed container renames flow through the existing patch loop as allowed
   `context` updates when card updates are safely identifiable; otherwise the
   existing empty or unresolved patch paths are used.
7. Negative: the opener and patch planner write no card body and do not rewrite
   the keystone body.
8. Degraded: when the headline block says `- keystone: none found`, Raven still
   presents the Container Set, states that no single thesis card was found, and
   proceeds with the search-frame confirmation.
9. Later non-frame turns do not repeat the headline opener.
10. `claude plugin validate ./packages/alexandria-plugin`, Markdown lint, and
    the new structural prompt-contract eval pass, or any skipped non-minimum
    checks are explicitly named with the reason.

## Deferred Follow-Ups

1. Build a real adaptive Front-of-House LLM eval for Turn 0 that judges
   conversational faithfulness, drift uncertainty, no raw markdown recitation,
   and resistance to body-fill pressure.
2. Implement the per-section comprehension framing and held-back/capstone
   spoken framing in their own slices.
3. Consider adding a first-class runtime marker for headline-opener completion
   only if future workflow changes need replay-safe machine state; #489 should
   not add it.
4. Consider richer deterministic rename support only if repeated real walks
   show that global container renames cannot be safely handled through the
   existing `context` patch path.

---

# Issue 490 - EL5 Section Summary Prior For Atomic Cards

Status: implementation plan, 2026-06-30.

Issue: GitHub #490, "EL5 atomizer: consume section_confirmed as the
human-language prior for card bodies".

Goal: make EL5 card drafting use the latest
`library.front_of_house.section_confirmed` event whose `context` exactly matches
the card contract's `targetCard.context`, so Raven frames card bodies from the
director-confirmed human section summary instead of regurgitating source-code
paths, internal slugs, or implementation variable names.

Plan path: `docs/alexandria/plans/front-of-house-walk-reshape/plan.md`.

Linked product plan: issue #490 cites this plan's section 11 "EL5 read",
Buildability, and `walk-spec.md` "section close". `walk-spec.md` is not present
in this checkout; the controlling local sources for this slice are the issue
text supplied with run `01KWCVND2YCFSXEVK2BWTXHNK7`, the existing #485
`section_confirmed` implementation in AX, and the shipped EL5 atomic-card
workflows. A live GitHub issue/comment fetch was attempted with `gh issue view
490`, but `gh` is not installed in this environment.

## Scope

This slice changes the EL5 atomizer input and prompt contract. It reads the
already shipped #485 event; it does not modify Front-of-House event emission.

In scope:

1. Add AX deterministic helpers that resolve the latest
   `library.front_of_house.section_confirmed` event by exact `context` match for
   an `AtomicCardContract`.
2. During `ax cards execute-plan`, materialize a per-contract section-summary
   prompt input file beside the contract file when a matching event exists.
3. Pass the section-summary input path into each `build-atomic-card` child run
   as `SECTION_SUMMARY`; when no match exists, bind `SECTION_SUMMARY` to an
   empty value and write no summary file.
4. Update `build-atomic-card` drafting guidance so the section summary is a
   human-language prior for register, framing, and product terms, while the
   source ranges remain the authority for facts.
5. Keep the existing grade schema and candidate validation requirements:
   `WHAT`, `WHERE`, `WHY`, `WHEN`, and `HOW` must still be present and
   source-grounded.
6. Add deterministic tests for matching summary resolution, no-match fallback,
   latest-wins behavior, child-run input wiring, and existing grade/candidate
   validation.
7. Add or update EL5 structural eval coverage for the changed prompt/workflow
   contract and rerun the EL5 eval groups named by `EVALS.md`.

## Non-Goals

1. Do not change the shape, writer, actor, or validation semantics of
   `library.front_of_house.section_confirmed`.
2. Do not make `section_confirmed` required for EL5. Cards without a matching
   event must run source-only as they do today.
3. Do not change the atomic-card build-plan schema unless implementation finds
   a local validator already requires the new field. The existing contract has
   `targetCard.context`, which is enough for deterministic matching.
4. Do not let the summary override source ranges. It controls human register and
   framing only; factual claims still need source support.
5. Do not add deterministic prose linting for "computer-ese" in this slice. The
   guard is prompt/eval-level; AX should not reject a candidate based on brittle
   natural-language heuristics.
6. Do not write directly to `docs/alexandria/library/`.
7. Do not change Viewer behavior.
8. Do not update Front-of-House methodology prompts for drafting or banking
   section summaries; #485 already shipped the command/event surface.

## Current Gap

Current AX and plugin state:

1. `packages/ax/src/domain/state-events.ts` already includes
   `library.front_of_house.section_confirmed` with `playRunId`, `context`,
   `plane`, `prefLabel`, `summary`, `cards`, `unknowns`, `answerEventId`, and
   optional `scope`.
2. `packages/ax/src/commands/front-of-house.ts` writes that event through
   `confirm-section`; existing tests prove idempotency and final readback.
3. `packages/ax/src/domain/library-front-of-house.ts` has
   `frontOfHouseSectionConfirmations(events, playRunId)`, but that projection
   is run-scoped and used for Front-of-House readback, not EL5 planning.
4. `packages/ax/src/domain/atomic-cards.ts` already carries
   `targetCard.context` on each `write_new` contract and validates it against
   the confirmed stub.
5. `packages/ax/src/commands/cards.ts` already lists project Ledger events for
   `validate-plan`, `coverage-audit`, and `publish`, but `execute-plan` only
   writes the child contract file and passes the existing build inputs.
6. `packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md`
   currently says "Read only: contract, source ranges, confirmed stub,
   candidate, grade report" and declares the raw source ranges as the only
   authority. It has no way to read the director-confirmed section summary.
7. `packages/alexandria-plugin/workflows/build-atomic-card/prompts/grade.md`
   validates the existing five-section/shelf/source contract and does not need a
   schema change for this slice.

The required behavior is:

1. For each card contract, find the latest valid `section_confirmed` event whose
   payload `context` exactly equals `contract.targetCard.context`.
2. If found, write a structured prompt-input file containing the event's
   `summary`, `prefLabel`, optional `scope`, and provenance fields.
3. Teach Raven to frame `WHAT` from that human summary, render `WHERE` in
   product terms rather than source paths, and avoid leaking internal slugs into
   `HOW`, while staying inside the event `scope` and source ranges.
4. If no event matches, do not write a summary file and do not fail the build.

## Architectural Boundaries

`packages/ax` owns deterministic event resolution, prompt-input file creation,
child-run inputs, JSON output fields, and black-box CLI behavior.

`packages/alexandria-plugin` owns the guided EL5 play behavior. The prompt
should explain how to use the section summary as a prior, but it must not invent
new facts or weaken the source-range contract.

The resolver should live with the atomic-card domain or a small AX helper near
it, not in the plugin prompt:

1. Read from the same project Ledger page that `execute-plan` already loads
   through `loadProjectStorage`.
2. Filter events by type `library.front_of_house.section_confirmed` and valid
   payload fields. Do not require `actor.kind = "user"`: the supported
   `confirm-section` command writes the event as a process event after checking
   the backing user answer.
3. Match by exact string equality:
   `contract.targetCard.context === event.payload.context`.
4. If multiple valid events match a context, latest wins by event order in the
   Ledger page. This supports re-runs across Front-of-House sessions without
   changing the #485 event.
5. If no event matches, return no summary. This is a normal degraded path, not
   an error.

Materialized summary file contract:

```json
{
  "schemaVersion": "atomic-card-section-summary.v1",
  "eventId": "<section_confirmed event id>",
  "context": "<matching context>",
  "plane": "<section plane>",
  "prefLabel": "<human section label>",
  "summary": "<director-confirmed human summary>",
  "scope": "<optional in/out fence>",
  "cards": ["<event cards>"],
  "unknowns": ["<event unknowns>"],
  "answerEventId": "<backing Front-of-House answer event id>"
}
```

Recommended path: beside the per-contract JSON under the candidate directory,
for example
`<candidate-dir>/contracts/<safe-contract-id>.section-summary.json`.

Buildability note: the workflow renderer treats every `__AX_INPUT_*__`
placeholder in prompt files as required. Because #490 requires no-match cards
to have no summary file and still run, `execute-plan` should pass
`SECTION_SUMMARY` for every child run. For a match, the value is the summary
file path. For no match, the value is the empty string and no file is created.
The drafting prompt must say that an empty `SECTION_SUMMARY` value means "no
section summary input exists; use the source-only fallback." Direct
`ax run build-atomic-card` callers can use `--input section_summary=` for the
same fallback.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX atomic-card domain | `packages/ax/src/domain/atomic-cards.ts` or a focused sibling module | Adds section-summary event projection/resolution, exact context matching, latest-wins selection, and structured prompt-input rendering |
| AX cards command | `packages/ax/src/commands/cards.ts` | `execute-plan` writes matched summary files, binds `SECTION_SUMMARY` for child `build-atomic-card` runs, and reports summary-path/event metadata in JSON output |
| AX cards tests | `packages/ax/tests/cards.test.ts` and possibly a focused atomic-card domain test | Covers matching summary, no-match fallback, latest-wins, summary-file shape, child-run input wiring, stable exit codes, and existing source-only behavior |
| Workflow input/render regression | `packages/ax/tests/orchestration.test.ts` or `packages/ax/tests/play-run-input.test.ts` if needed | Proves an empty optional `SECTION_SUMMARY` binding renders without unresolved placeholders |
| Build-card drafting prompt | `packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md` | Adds optional section summary to read-only inputs and instructs Raven to use it as register/framing prior for `WHAT`, product `WHERE`, and non-sluggy `HOW` |
| Build-card workflow | `packages/alexandria-plugin/workflows/build-atomic-card/workflow.fabro` only if implementation needs a visible node/input note | No graph routing change expected; the prompt placeholder is enough once AX binds `SECTION_SUMMARY` |
| Atomic-card planning prompt | `packages/alexandria-plugin/workflows/atomic-card-planning/prompts/triage.md` | Optional small wording update: preserve confirmed stub `context` exactly because AX uses it to attach section summaries |
| Atomic-card creation workflow | `packages/alexandria-plugin/workflows/atomic-card-creation/workflow.fabro` | No command-line shape change expected because `ax cards execute-plan` owns child input resolution |
| EL5 eval configs | `packages/ax/tests/eval-cases/build-atomic-card/*`, possibly `atomic-card-planning/*` | Adds structural checks that the prompt requires the section summary prior and source-grounding boundaries |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Raven `build-atomic-card` drafter | When `SECTION_SUMMARY` points to a file, Raven reads it before drafting and uses `summary`/`prefLabel`/`scope` to choose human-facing framing. Source ranges still ground facts | Update prompt and EL5 structural eval coverage; run plugin validation |
| Raven source-only fallback | When `SECTION_SUMMARY` is empty, Raven follows the current source-only drafting contract | Add no-match deterministic test; prompt must explicitly describe the fallback |
| AX `cards execute-plan` | Child build runs receive a new `SECTION_SUMMARY` input value and may have a summary file written beside the contract | Black-box tests assert JSON output fields, file contents, no-match no-file behavior, and latest-wins |
| Atomic-card production skill | No required change unless implementation wants discoverable operator guidance for the new automatic prior | If touched, run the same EL5 eval groups and plugin validation |
| Front-of-House walk skill/event | No behavior change | No Front-of-House eval rerun required for this slice beyond existing deterministic regression tests |
| Viewer | No behavior change | No Viewer validation required |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX cards black-box tests | `cd packages/ax && bun test tests/cards.test.ts` | Proves `execute-plan` summary resolution, matched/no-match/latest-wins behavior, child inputs, JSON output, and existing publish/grade regressions |
| AX event schema regression | `cd packages/ax && bun test tests/events.test.ts` | Confirms the #485 event still parses and validates while EL5 reads it |
| Front-of-House section event regression | `cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts` | Guards the event writer/projection that EL5 now depends on |
| Workflow input regression | `cd packages/ax && bun test tests/orchestration.test.ts tests/play-run-input.test.ts` | Guards placeholder substitution and empty optional child input behavior if touched |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches domain/command/test type drift |
| AX format check | `pnpm --filter @alexandria/ax run format:check` | Keeps touched TypeScript in package style |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Required because shipped workflow prompt behavior changes |
| Markdown/prose lint | Run the repo markdown lint command for changed prompt/plan files if available in package scripts | Keeps changed markdown prompts and plan text conforming |

Minimum gate for implementation handoff: `tests/cards.test.ts`,
`tests/events.test.ts`, plugin validation, AX typecheck, and the EL5 eval
commands below. If broader Front-of-House or workflow-input regressions are
skipped, the implementation handoff must name the reason.

## Eval Impact

This slice changes `packages/alexandria-plugin/workflows/build-atomic-card/*`
and likely `atomic-card-planning/*`, which `EVALS.md` maps to the EL5 eval
runner.

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| `build-atomic-card` drafting prompt | Existing structural case `build-atomic-card/draft-against-confirmed-stub` checks confirmed stub, five sections, and no invented card | Add a new structural case such as `build-atomic-card/section-summary-prior`, or extend the existing case, to require `SECTION_SUMMARY`, "prior, not override", `WHAT` from summary, product-term `WHERE`, no raw source path leakage, and no internal slugs in `HOW` | `pnpm eval -- run build-atomic-card/all` |
| `atomic-card-planning` prompt | Existing structural case checks confirmed stubs, lexicon names, and gap reports | If the prompt is touched to mention exact `context` preservation, update the structural case to include that wording | `pnpm eval -- run atomic-card-planning/all` |
| `atomic-card-creation` workflow | Existing structural case checks child build loop through `ax cards execute-plan` | Rerun because `execute-plan` child inputs change, even if the workflow text does not | `pnpm eval -- run atomic-card-creation/all` |
| AX deterministic resolver | Covered by Bun tests, not the eval harness | No eval case needed for pure latest-wins/event matching logic | `cd packages/ax && bun test tests/cards.test.ts` |

Expected eval gate:

```bash
pnpm eval -- run atomic-card-planning/all
pnpm eval -- run atomic-card-creation/all
pnpm eval -- run build-atomic-card/all
```

The current `pnpm eval` runner is the EL5 structural substitute described in
`EVALS.md`; it does not provide live model judge coverage. That is acceptable
for this slice if the structural cases prove the prompt/workflow contract and
the deterministic tests prove the input files and degraded behavior.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Adding `__AX_INPUT_SECTION_SUMMARY__` makes direct or no-match `build-atomic-card` runs fail with "Missing workflow inputs" | Have `execute-plan` always bind `SECTION_SUMMARY`; use a real file path only for matches and an empty string for no-match fallback. Add a workflow-input regression test and document direct-run fallback as `--input section_summary=` |
| The resolver accidentally scopes to the #485 `playRunId` and misses useful section summaries from reruns | Match only on exact `context` as the issue decides, and choose latest by Ledger order. Tests should include two events for the same context with different run ids |
| A stale section summary from a different bundle with the same context is selected because the #485 event has no `bundlePath` | Keep to the issue's matching key for this slice, include event id/context in the summary file for auditability, and defer stronger bundle scoping until the event model changes |
| Process-authored `section_confirmed` events are ignored by copying the `library.confirmed` actor filter | Do not require `actor.kind = "user"` for this read path; the supported #485 writer is process-authored after validating a backing user answer |
| The section summary becomes an ungrounded fact source | Prompt wording must say the summary controls register/framing only and source ranges remain the factual authority; existing validate/grade flow still runs |
| The body still leaks raw source paths or implementation slugs despite the prior | Add explicit prompt instructions and structural eval checks; do not pretend deterministic AX can reliably lint prose quality in this slice |
| Latest-wins implementation depends on event sort behavior that is not guaranteed by a map | Iterate the Ledger page in order and overwrite the context entry as events are seen; add a latest-wins test with two same-context events |
| Summary files leak into publish output or confirmed stubs | Write files only under the candidate/runtime directory beside contracts; publish still extracts only candidate body and appends to the stub |
| Existing source-only cards regress because the prompt over-requires the summary | Add a no-match `execute-plan` test that writes no summary file, completes with the fake child runner, and leaves current source-only behavior unchanged |

## Implementation Steps

1. Add a small section-summary input type and renderer in the AX atomic-card
   domain:
   - constant `ATOMIC_CARD_SECTION_SUMMARY_SCHEMA_VERSION`;
   - interface for the rendered prompt-input file;
   - helper to parse a valid `library.front_of_house.section_confirmed` event
     into the prompt-input shape;
   - helper to build a latest-by-context map from Ledger events.

2. Add exact context matching:
   implement a function such as
   `resolveSectionSummaryForContract({ contract, events })` that returns the
   latest matching summary input or `null`. It should ignore malformed payloads,
   match exact strings only, and not require a particular actor kind.

3. Add summary path helpers in `packages/ax/src/commands/cards.ts`:
   create `sectionSummaryPathForContract(candidateDir, contractId)` beside
   `contractPathForContract`, for example
   `contracts/<safe-contract-id>.section-summary.json`.

4. Update `runExecutePlan`:
   - load the Ledger events it already gets through `validatePlanWithStorage`;
   - for each contract, resolve a section summary by context;
   - write the summary JSON file only when a match exists;
   - pass `SECTION_SUMMARY: sectionSummaryPath` into `runPlay` when matched;
   - pass `SECTION_SUMMARY: ""` into `runPlay` when unmatched;
   - include `sectionSummaryPath` and `sectionSummaryEventId` (or `null`) in
     each JSON result item for black-box observability.

5. Update `draft_or_repair.md`:
   - add optional section summary to "Read only";
   - state that an empty path means no section summary is available;
   - require the drafter to use `summary`/`prefLabel`/`scope` as a prior for
     human-facing framing only;
   - frame `WHAT` from the section summary when present;
   - render `WHERE` in product terms and avoid raw source paths unless the
     confirmed summary/scope explicitly sanctions them;
   - keep `HOW` free of internal slugs and variable names unless they are the
     user-facing product terms;
   - preserve the existing source-grounding, confirmed-stub, lexicon name,
     wikilink, and candidate validation instructions.

6. Optionally update `atomic-card-planning/prompts/triage.md` with one narrow
   instruction to preserve confirmed stub `context` exactly, because AX uses the
   contract context to attach section summaries later. Do not add a new summary
   input to the planning workflow.

7. Add deterministic tests in `packages/ax/tests/cards.test.ts`:
   - matching `section_confirmed` event writes the summary JSON file with the
     expected `summary`, `prefLabel`, `scope`, `context`, and `eventId`;
   - child run succeeds with fake Fabro and output includes
     `sectionSummaryPath`/`sectionSummaryEventId`;
   - no matching event writes no summary file, returns null summary metadata,
     and the child run still succeeds;
   - two same-context events choose the latest by Ledger order;
   - existing `validate-candidate`, `grade-candidate`, and `publish` tests still
     pass with the unchanged five-section contract.

8. Add workflow-input regression coverage if needed:
   prove the rendered `build-atomic-card` prompt does not leave an unresolved
   `SECTION_SUMMARY` placeholder when AX binds the empty fallback value.

9. Update EL5 structural eval configs:
   add or extend the build-card prompt eval to assert the summary-prior
   instructions and fallback wording; update planning eval only if the triage
   prompt changes.

10. Run the deterministic verification and eval commands, plus plugin
    validation. Record any skipped non-minimum checks in the implementation
    handoff.

## Acceptance / Exit Criteria

1. For a contract whose `targetCard.context` has at least one
   `library.front_of_house.section_confirmed` event, `ax cards execute-plan`
   writes a sibling section-summary prompt input file and passes its path as
   `SECTION_SUMMARY` to the `build-atomic-card` child run.
2. The summary file includes the matched event id, exact context, plane,
   `prefLabel`, `summary`, optional `scope`, `cards`, `unknowns`, and
   `answerEventId`.
3. If multiple `section_confirmed` events have the same context, the latest in
   Ledger event order is used.
4. If no `section_confirmed` event matches the contract context, no summary
   file is created, `SECTION_SUMMARY` is bound to an empty value, and the child
   build runs source-only without an error.
5. The drafting prompt instructs Raven to use the confirmed summary/label/scope
   as a prior, not an override, and to keep source ranges as the only factual
   authority.
6. The drafting prompt specifically directs `WHAT` through the human summary,
   `WHERE` through product terms rather than unsanctioned raw source paths, and
   `HOW` away from internal slugs and variable names.
7. Candidate validation and grade routing still require non-empty
   `WHAT`/`WHERE`/`WHY`/`WHEN`/`HOW` sections and pass existing source-only
   regression tests.
8. `section_confirmed` event emission, Front-of-House readback, and Ledger event
   schemas remain unchanged.
9. The deterministic tests and EL5 eval reruns named in this plan pass, or any
   skipped non-minimum checks are explicitly recorded with reasons.

## Deferred Follow-Ups

1. Add stronger deterministic prose-quality checks only after repeated failures
   show a reliable rule that does not reject valid human language.
2. Add bundle/product scoping to section-summary matching only if a future event
   version carries bundle identity or the product accepts a migration.
3. Add live model eval/judge coverage for the quality of `WHAT`/`WHERE`/`HOW`
   once the full eval harness is restored.
4. Surface section-summary provenance in an atomization run viewer if VB5/live
   atomization work needs operator visibility into the prior used per card.
