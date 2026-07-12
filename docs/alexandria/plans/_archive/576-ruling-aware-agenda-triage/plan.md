# Issue #576 - Ruling-Aware Agenda Triage

Issue reference: GitHub #576, "Frame-ruling cascade S5: ruling-aware
agenda triage - stop re-asking what rulings already settle"

Goal: after a banked Front-of-House ruling, run an additive judgment pass over
remaining, not-yet-staged agenda items so the walk does not ask the director to
repeat decisions already settled by prior rulings.

Linked product plan: `docs/alexandria/plans/frame-ruling-cascade/plan.md`,
slice S5. That shared product plan is read-only input for this issue.

## Scope

This slice implements the S5 producer and runtime contract for ruling-aware
agenda triage:

1. Add deterministic AX support for triage input preparation, triage output
   validation/application, and reopening triage-settled items.
2. Add an ACP prompt and workflow leg that perform the judgment pass after the
   frame-cascade patch path and after subsequent banked section-close rulings.
3. Reuse `library.front_of_house.residual_gap_recorded` for triage settlements,
   with `actor.kind = "process"` and reason prefix
   `settled by triage: generalized from ruling(s) `.
4. Preserve original agenda wording when an item is reframed, while staging only
   the rewritten ask for Raven.
5. Keep degraded behavior additive: if the ACP triage pass is absent, fails, or
   emits invalid output, the walk routes to `stage-next` exactly as it does
   today.
6. Add black-box CLI and domain tests for answered, unaffected, reframed,
   reopen, provenance distinctness, degraded, and no-rulings cases.

## Non-Goals

1. Do not edit the shared `frame-ruling-cascade` product plan.
2. Do not write to `docs/alexandria/library/`.
3. Do not add Viewer or PMS Notepad UI changes in this slice. The producer must
   emit distinct state for those surfaces to render later.
4. Do not edit cards, patches, container mappings, draft logs, or base bundle
   files from the triage pass. Triage may only rewrite runtime agenda state and
   append Ledger events.
5. Do not replace S2 deterministic frame-ruling cascade behavior. S5 is a
   separate judgment tier with distinct provenance.
6. Do not make triage a blocking quality gate for the Front-of-House walk.

## Linked Product-Plan Summary

The product plan splits the "lodestone" behavior into tiers:

1. S1/S2 deterministically replay approved frame mappings into card draft
   updates and agenda projection.
2. S5 is different: it asks an ACP pass to generalize from all banked rulings in
   the walk and classify each remaining agenda item as:
   - `unaffected`: leave the item to stage normally.
   - `answered`: auto-resolve it as settled by triage, citing the ruling event
     ids it generalized from.
   - `reframed`: keep the item in the agenda but rewrite the ask so Raven does
     not re-ask what the rulings already state; preserve the original question
     verbatim.

The safety contract is distinctness: every triage settlement is visibly
machine-made, provenance-linked, and reopenable. Over-generalization must be
auditable, not silent.

## Current Gap

The current repo has the S1/S2 foundation but not the S5 producer:

1. `packages/ax/src/domain/library-thread-resolution.ts` already classifies
   residual reasons starting with `settled by triage` as
   `settled-by-triage`, but no command emits those events.
2. `packages/ax/src/domain/library-front-of-house.ts` can project agenda items
   through container mappings and can record frame-ruling settlements, but it
   has no triage decision model, no original-question preservation for
   reframes, and no reopen-aware lifecycle.
3. `packages/ax/src/commands/front-of-house.ts` supports
   `prepare-agenda`, `stage-next`, patch application, section confirmation, and
   residual accounting, but it has no `prepare-triage`, `apply-triage`, or
   `reopen` subcommand.
4. `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro`
   routes successful patch handling directly back to `stage_next`; there is no
   additive ACP triage leg and no degraded edge.
5. `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` tells Raven
   never to self-answer a question, which remains correct, but it does not yet
   explain how process-authored triage settlements and reopened items appear.

## Architectural Boundaries

AX owns deterministic support:

1. Build triage inputs from `agenda.json` plus Ledger events.
2. Validate ACP triage output against a closed schema.
3. Append process-authored residual events for `answered` decisions.
4. Rewrite only runtime agenda items for `reframed` decisions.
5. Append reopen audit events and make lifecycle projection honor them.
6. Keep command output stable, parseable, and non-interactive.

The plugin owns judgment and guided behavior:

1. The ACP prompt decides `unaffected`, `answered`, or `reframed`.
2. The workflow decides when to attempt the pass and how to degrade when ACP
   fails.
3. The Front-of-House skill explains how Raven should treat reframed and
   reopened items without turning triage into Raven self-answering.

State and provenance contracts:

1. Triage settlements reuse
   `library.front_of_house.residual_gap_recorded`; no new settlement event type
   is introduced.
2. Triage settlement actor is `DEFAULT_AX_ACTOR`
   (`{ kind: "process", host: "ax", process: "cli" }`).
3. Triage settlement reason starts exactly with
   `settled by triage: generalized from ruling(s) ` and includes the cited
   ruling event ids.
4. Cascade settlements keep the existing
   `settled by frame ruling <answerEventId>` reason shape.
5. Director-ruled resolutions remain user-authored
   `library.front_of_house.answer_recorded` events.
6. Reopen cannot be represented by `residual_gap_recorded`, because that event
   resolves an item. Add a small append-only event,
   `library.front_of_house.item_reopened`, for reopen audit and lifecycle
   projection.

Proposed reopen event payload:

```json
{
  "playRunId": "front-of-house play run id",
  "bundlePath": "/absolute/path/to/bundle",
  "agendaItemId": "thread-or-frame-item-id",
  "reopenedSettlementEventId": "residual_gap_recorded event id",
  "reason": "director requested reopen"
}
```

The frozen CLI path is:

```bash
ax internal front-of-house reopen --item <agendaItemId>
```

The exact command works when the item has a unique latest triage settlement in
the project event log. Optional `--run` and `--bundle` flags may be added for
disambiguation, but the acceptance path must not require them.

## Runtime Triage Contract

Add runtime artifacts under `runtime/front-of-house/`:

1. `triage-input.json`: deterministic input written by AX for the ACP pass.
2. `triage.json`: ACP output validated and applied by AX.

`prepare-triage` should write `triage-input.json` only when there is at least
one banked ruling and at least one candidate item. Otherwise it exits 0 with a
stable `TRIAGE_SKIPPED` marker and does not route to ACP.

Triage input should include:

1. `schemaVersion: 1`.
2. `playRunId` and `bundlePath`.
3. The full ruling corpus for the walk: user-authored
   `library.front_of_house.answer_recorded` events for the same `playRunId`,
   carrying `eventId`, `agendaItemId`, `agendaItemKind`, and `answerText`.
4. Section-close context from `library.front_of_house.section_confirmed`
   events for the same `playRunId`; when a triage decision relies on a section
   close, the cited ruling id should be that section event's `answerEventId`.
5. Candidate agenda items that are not currently resolved and have not already
   been staged after their latest reopen.

Triage output shape:

```json
{
  "schemaVersion": 1,
  "playRunId": "front-of-house play run id",
  "decisions": [
    {
      "agendaItemId": "thread:a",
      "classification": "unaffected"
    },
    {
      "agendaItemId": "thread:b",
      "classification": "answered",
      "rulingEventIds": ["event:director-answer-1"],
      "rationale": "The ruling directly answered this question."
    },
    {
      "agendaItemId": "thread:c",
      "classification": "reframed",
      "rulingEventIds": ["event:director-answer-1", "event:director-answer-2"],
      "rewrittenTitle": "Ask the remaining unresolved part",
      "rewrittenText": "Only ask the still-open portion.",
      "rationale": "The original wording included already-settled material."
    }
  ]
}
```

Validation rules:

1. `classification` is a closed set: `unaffected`, `answered`, `reframed`.
2. Output must classify every candidate exactly once. Missing or duplicate
   decisions make the pass invalid and skipped.
3. `answered` and `reframed` decisions require non-empty `rulingEventIds`, and
   every id must be present in the prepared ruling corpus.
4. `reframed` requires non-empty `rewrittenText`; it should usually provide
   `rewrittenTitle` as well.
5. Invalid ACP output is not a workflow failure. `apply-triage` should exit 0
   with a stable `TRIAGE_SKIPPED` marker and a diagnostic on stderr.

Agenda item preservation for `reframed`:

1. Store the rewritten ask in `title` and `text`, so existing staging and Raven
   rendering use the revised question.
2. Add optional agenda-item metadata, for example:

   ```json
   {
     "triage": {
       "classification": "reframed",
       "originalTitle": "verbatim original title",
       "originalText": "verbatim original text",
       "rulingEventIds": ["event:director-answer-1"],
       "rationale": "short machine rationale"
     }
   }
   ```

3. Preserve and parse this metadata in `agenda.json`, `current-item.json`, and
   `current-item.md`.
4. `for-raven.md` should make the rewritten ask primary and include only enough
   internal provenance for Raven to avoid re-asking settled material.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX domain - agenda and lifecycle | `packages/ax/src/domain/library-front-of-house.ts` | Add triage decision types, input/output parsers, apply helpers, reframed agenda metadata, staging-history filtering, and reopen-aware lifecycle projection. |
| AX domain - catalog resolution | `packages/ax/src/domain/library-thread-resolution.ts`, `packages/ax/src/domain/library-catalog.ts` | Keep `settled-by-triage` distinct from `settled-by-cascade`; honor `item_reopened` so reopened triage settlements project open until a later resolution. |
| AX events | `packages/ax/src/domain/state-events.ts` | Add `library.front_of_house.item_reopened` schema and event introspection. Keep triage settlement on `residual_gap_recorded`. |
| AX CLI | `packages/ax/src/commands/front-of-house.ts` | Add `prepare-triage`, `apply-triage`, and `reopen`; stable JSON/human markers, exit codes, idempotency, and diagnostics. |
| AX tests | `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts`, `packages/ax/tests/library-thread-resolution.test.ts`, `packages/ax/tests/events.test.ts`, `packages/ax/tests/orchestration.test.ts` | Cover domain behavior, black-box CLI behavior, event schema, distinctness, workflow routing, degraded path, and no-rulings regression. |
| Plugin workflow | `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro`, `legs.json` | Insert prepare/ACP/apply triage nodes between ruling application and `stage_next`; ACP failure and invalid output route to `stage_next`. |
| Plugin prompt | New `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/triage_agenda.md` | Instruct the ACP pass to classify candidates conservatively, cite ruling ids, and write only `triage.json`. |
| Plugin skills | `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`, `packages/alexandria-plugin/skills/alexandria-event-log/SKILL.md` | Explain triage-settled and reopened items, and document the new reopen audit event for event-log interpretation. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `front-of-house-walk` skill | Raven still never self-answers. It should recognize that AX process-authored triage settlements may skip already-answered items, and that reopened items should be presented normally on the next wake. | Update skill prose near "On Human Input", "Section Comprehension", and "Never". |
| Front-of-House workflow ACP prompt | New judgment pass reads the prepared triage input and writes a closed JSON decision file. It never edits cards, patches, mappings, or draft logs. | Add prompt validation through plugin validation and workflow orchestration tests. |
| `alexandria-event-log` skill | Add `library.front_of_house.item_reopened` to the EL3 audit event list and keep `residual_gap_recorded` as the settlement event. | No eval harness coverage exists in this branch; use plugin validation and markdown lint. |

## CLI Contract

Add these internal subcommands:

```bash
ax internal front-of-house prepare-triage --bundle <path> [--json]
ax internal front-of-house apply-triage --bundle <path> [--triage <path>] [--json]
ax internal front-of-house reopen --item <agendaItemId> [--run <playRunId>] [--bundle <path>] [--json]
```

Expected command behavior:

1. `prepare-triage` exits 0 with `TRIAGE_READY` when it wrote
   `triage-input.json`; JSON includes `status`, `candidateCount`,
   `rulingCount`, and `triageInputPath`.
2. `prepare-triage` exits 0 with `TRIAGE_SKIPPED` when there are no banked
   rulings or no candidates; JSON includes `status: "skipped"` and `reason`.
3. `apply-triage` exits 0 with `TRIAGE_APPLIED` when it appends at least one
   settlement or rewrites at least one agenda item; JSON includes
   `answeredAgendaItemIds`, `reframedAgendaItemIds`, `unaffectedAgendaItemIds`,
   `settlementEventIds`, and `agendaPath`.
4. `apply-triage` exits 0 with `TRIAGE_SKIPPED` for missing or invalid ACP
   output, with diagnostics on stderr and no state mutation.
5. `reopen --item` exits 0 when it appends or finds the reopen record; JSON
   includes `agendaItemId`, `playRunId`, `bundlePath`, `settlementEventId`,
   `eventId`, and `status`.
6. `reopen --item` exits 2 for unknown item, no triage settlement, or ambiguous
   match without `--run`/`--bundle`; stderr must list the valid disambiguation
   fields.

Idempotency details:

1. Existing ordinary residual paths can keep their current item-level
   idempotency.
2. Triage settlement idempotency must include a decision identity, for example
   `foh:triage-settlement:<playRunId>:<agendaItemId>:<hash>`, so a later
   reopen can be followed by a later settlement event.
3. Reopen idempotency should use the reopened settlement event id:
   `foh:reopen:<playRunId>:<agendaItemId>:<settlementEventId>`.

## Workflow Integration

Insert triage routing after every successful banked-ruling path that currently
returns to `stage_next`:

1. `apply_bundle_patch -> prepare_agenda_triage` on `PATCH_APPLIED`.
2. `apply_replanned_bundle_patch -> prepare_agenda_triage` on `PATCH_APPLIED`.
3. `record_patch_rejection_residual -> prepare_agenda_triage` after the
   residual is recorded, because the director answer may still settle later
   agenda items even when patch planning failed.

New workflow shape:

1. `prepare_agenda_triage` runs
   `ax internal front-of-house prepare-triage --bundle '__AX_INPUT_BUNDLE__'`.
2. `prepare_agenda_triage -> plan_agenda_triage` on `TRIAGE_READY`.
3. `prepare_agenda_triage -> stage_next` on `TRIAGE_SKIPPED`.
4. `plan_agenda_triage` is an ACP node using `prompts/triage_agenda.md`.
5. `plan_agenda_triage -> apply_agenda_triage` on success.
6. `plan_agenda_triage -> stage_next` on ACP failure.
7. `apply_agenda_triage -> stage_next` on `TRIAGE_APPLIED` or
   `TRIAGE_SKIPPED`.
8. Deterministic AX failures such as unreadable agenda or project storage
   failure should still route to `foh_internal_failed`.

For section close, keep `confirm-section` deterministic. The skill should bank
the `section_confirmed` process event promptly after the section-close answer;
the next workflow triage leg reads that event and the cited answer event as
part of the full ruling corpus.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Focused AX domain and CLI tests | `bun test packages/ax/tests/library-front-of-house.test.ts packages/ax/tests/library-front-of-house-bundle.test.ts packages/ax/tests/library-thread-resolution.test.ts packages/ax/tests/events.test.ts packages/ax/tests/orchestration.test.ts` | Covers triage classification application, black-box CLI output and exit codes, reopen projection, event schemas, and workflow routing. |
| Full AX package tests | `pnpm --filter @alexandria/ax test` | Catches regressions in event projection, runtime server, play reactions, and existing Front-of-House behavior. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Validates new event, agenda, and command types. |
| AX lint/format | `pnpm --filter @alexandria/ax run lint` and `pnpm --filter @alexandria/ax run format:check` | Keeps TypeScript and formatting aligned with package rules. |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Validates workflow, prompt, and skill package structure. |
| Markdown lint | `pnpm run lint:markdown` | Covers changed plan, prompt, and skill Markdown. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Front-of-House workflow prompt | No `tests/eval-cases` directory exists in this checkout. `EVALS.md` says the historical live Claude eval harness is not present; `pnpm eval` is currently wired to the EL5 atomic-card structural substitute. | No eval-harness rerun is required or available for this slice. Use deterministic CLI tests plus plugin validation. | Deferred case when the full harness returns: `front-of-house-walk/ruling-aware-agenda-triage`. |
| `front-of-house-walk` skill | No listed eval mapping in `EVALS.md` for this skill, and no eval case tree is present. | Validate with markdown lint and plugin validation. | Deferred adaptive eval should cover Raven receiving a reframed item and a reopened triage-settled item. |
| `alexandria-event-log` skill | No current event-log eval mapping in `EVALS.md`. | Validate with markdown lint and plugin validation. | No rerun required in this branch. |

## Test Coverage Requirements

Domain tests:

1. `answered`: a candidate whose original ask is answered verbatim by a prior
   ruling becomes a process-authored residual settlement with reason
   `settled by triage: generalized from ruling(s) <eventId>`.
2. `unaffected`: an orthogonal item remains byte-equivalent in `agenda.json`
   and stages normally.
3. `reframed`: the staged item uses the rewritten ask and carries verbatim
   `originalTitle` and `originalText`.
4. Invalid triage output is skipped without agenda or event mutation.
5. No banked rulings produces no candidate ACP pass and leaves stage order
   unchanged.
6. Reopen clears the lifecycle resolution only for triage-settled items and
   only until a later answer or residual event resolves the item again.

Black-box CLI tests:

1. `prepare-triage --json` returns `TRIAGE_SKIPPED` with no rulings.
2. `apply-triage --json` appends triage settlements with the correct actor,
   reason prefix, cited ids, and output fields.
3. `stage-next --json` skips triage-settled items and stages unaffected or
   reframed items.
4. `reopen --item <id> --json` appends an audit event, then the next
   `stage-next` re-stages the item.
5. The original `residual_gap_recorded` settlement event remains in
   `events.jsonl` after reopen.
6. `reopen` refuses non-triage residuals, cascade settlements, director-ruled
   items, and ambiguous item ids with exit code 2.

Workflow/plugin tests:

1. Workflow rendering includes triage nodes and degraded ACP failure edges.
2. `legs.json` describes the new triage command, agent, and apply legs.
3. Plugin validation passes with the new prompt and skill updates.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The ACP pass over-generalizes and erases a real question. | Use a conservative prompt, closed schema, required cited ruling ids, process actor, visible reason prefix, and reopen CLI. Add tests for orthogonal items and reopen. |
| S5 blurs into S2 cascade behavior. | Keep different reason prefixes, no container mapping edits, no card/draft-log writes, and separate tests for `settled by frame ruling` versus `settled by triage`. |
| ACP unavailability blocks the walk. | Add workflow failure edges to `stage_next`; make invalid or missing triage output a `TRIAGE_SKIPPED` result instead of a hard failure. |
| Reopen cannot overcome existing residual idempotency. | Give triage settlements their own decision-scoped idempotency key and add an `item_reopened` event that lifecycle projection understands. |
| Reopen accidentally reopens director or cascade decisions. | Validate that the latest matching settlement is `residual_gap_recorded` with the triage reason prefix and process actor. Refuse all other states. |
| Reframed metadata breaks existing runtime agenda files. | Keep the metadata optional and parser-preserved. If the implementation chooses to bump `FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION`, include a migration or compatibility path for active v2 runtime files. |
| Section-close triage runs before the section event is banked. | Update the Front-of-House skill to bank `confirm-section` promptly after the section-close answer, before the next staging turn. The triage input reads all events present for the play run. |

## Implementation Steps

1. Add event support for `library.front_of_house.item_reopened` in
   `state-events.ts`, event schema introspection, and event tests.
2. Extend Front-of-House domain types with triage input/output models,
   validation helpers, optional agenda-item triage metadata, and render support.
3. Extend lifecycle projection to account for staged history and reopen events:
   a reopened triage settlement is no longer resolved until a later answer or
   residual event occurs.
4. Add `prepare-triage` to build the ruling corpus and candidate list from
   `agenda.json` plus Ledger events.
5. Add `apply-triage` to validate `triage.json`, append triage residual
   settlements, rewrite reframed agenda items, and skip safely on invalid ACP
   output.
6. Add `reopen --item` with unique-match lookup, optional disambiguation flags,
   triage-only validation, append-only audit event, and black-box output.
7. Insert triage nodes and degraded routing in the Front-of-House workflow and
   update `legs.json`.
8. Add `prompts/triage_agenda.md` with conservative classification rules,
   closed output schema, and strict file-write target.
9. Update `front-of-house-walk` and `alexandria-event-log` skills to describe
   triage and reopen behavior without weakening the "Raven never self-answers"
   rule.
10. Add the required domain, black-box CLI, event, and workflow tests.
11. Run focused validation, then full AX/package validation and plugin
    validation.

## Acceptance / Exit Criteria

1. An item answered by a prior ruling settles through
   `library.front_of_house.residual_gap_recorded` with process actor and reason
   `settled by triage: generalized from ruling(s) <eventId>`.
2. An orthogonal item is classified `unaffected`, is not mutated, and stages
   normally.
3. A `reframed` item stages with the rewritten ask and preserves the original
   title/text verbatim in agenda/current-item metadata.
4. `ax internal front-of-house reopen --item <id>` re-stages a triage-settled
   item on the next `stage-next`.
5. Reopen appends an audit event; the original triage settlement event remains
   in the Ledger.
6. Triage settlements are distinguishable from director-ruled and cascade
   resolutions by actor plus reason prefix.
7. If the ACP triage pass fails, is unavailable, or emits invalid JSON, the
   workflow proceeds to `stage-next` without mutation.
8. A walk with no banked rulings skips triage and preserves current staging
   behavior.
9. Focused tests, AX validation, plugin validation, and markdown lint pass.

## Deferred Follow-Ups

1. Add Viewer/Notepad reopen controls and visible triage provenance in the
   `library-notepad-surface` workstream.
2. Add structured cited-ruling-id projection to catalog/runtime viewer schemas
   if Notepad needs machine-readable ids beyond the reason string.
3. Add an adaptive eval case for `front-of-house-walk` triage once the broader
   eval harness returns to this branch.
4. Consider surfacing triage skip diagnostics in run summaries after there is a
   product surface for Front-of-House operator QA.
