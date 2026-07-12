# Issue 508 Technical Plan: Confirm-Section Provenance And Idempotency

Issue: GitHub #508, "Harden confirm-section provenance and idempotency"
Date: 2026-07-01
Status: Ready for implementation

## Goal

Harden `ax internal front-of-house confirm-section` so the
`library.front_of_house.section_confirmed` event is truthful and retry-safe.

The command must:

- reject an answer event whose `agendaItemId` belongs to another
  Front-of-House section, even when the event has the requested play run id;
- keep the existing rejection for an already-confirmed section when the new
  invocation supplies a different `answerEventId`;
- treat an identical repeat confirmation as a real idempotent no-op;
- append a new immutable `section_confirmed` event with status `superseded`
  when the director reuses the same answer event but changes the summary,
  human label, or scope;
- leave EL5's current latest-by-`(playRunId, context)` selection intact so the
  corrected event becomes the current section prior.

There is no separate linked product-level plan for this issue. The issue text
and the existing Front-of-House reshape plans are the product contract for this
slice.

## Scope

In scope:

- AX Front-of-House domain validation for answer-event section membership.
- AX `confirm-section` command behavior, JSON status strings, exit code `2`
  invalid-input failures, and append idempotency.
- Deterministic black-box tests for `confirm-section` success, rejection,
  idempotent replay, and supersession.
- Focused regression coverage that EL5's existing latest selector resolves the
  superseded section to the later event.
- Documentation of eval impact for this AX-only deterministic change.

Out of scope:

- Changing the `library.front_of_house.section_confirmed` event payload shape.
- Mutating or deleting prior `section_confirmed` events.
- Loosening the existing different-answer-event rejection.
- Changing Front-of-House play choreography, Raven mediation prompts, or
  shipped plugin skill behavior.
- Changing EL5 prompt semantics or prompt-input JSON shape.
- Viewer changes.
- Writing to `docs/alexandria/library`.

## Non-Goals

- Do not introduce a manual "replace confirmation" command.
- Do not add a new CLI flag for supersession.
- Do not make EL5 choose a non-latest confirmation.
- Do not rely on process guidance alone for provenance correctness. The CLI must
  enforce the section-membership rule.
- Do not change generic state-store idempotency behavior. This slice should
  choose a better idempotency key for `section_confirmed`.

## Sources Read

- Root `CLAUDE.md` and `README.md`.
- `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md`.
- `EVALS.md`.
- Related plans:
  - `docs/alexandria/plans/front-of-house-walk-reshape/plan.md`
  - `docs/alexandria/plans/504-foh-explicit-placement-state/plan.md`
  - `docs/alexandria/plans/500-el5-section-summary-run-scope/plan.md`
- Current implementation and tests:
  - `packages/ax/src/domain/library-front-of-house.ts`
  - `packages/ax/src/commands/front-of-house.ts`
  - `packages/ax/src/effects/jsonl-state-store.ts`
  - `packages/ax/src/domain/atomic-cards.ts`
  - `packages/ax/src/commands/cards.ts`
  - `packages/ax/tests/library-front-of-house.test.ts`
  - `packages/ax/tests/library-front-of-house-bundle.test.ts`
  - `packages/ax/tests/cards.test.ts`

## Product Plan Summary

The Front-of-House reshape introduced
`library.front_of_house.section_confirmed` as the durable EL3-to-EL5 handoff for
director-approved section language. The event is process-authored but must cite
a backing user-authored `library.front_of_house.answer_recorded` event. EL5 then
uses the latest matching section confirmation as a human-language prior while
drafting card bodies.

Issue #508 closes two residual correctness gaps in that handoff:

1. Provenance must be section-local. A section for context `A` must not cite a
   user answer to an agenda item in context `B`.
2. Retrying with corrected director text must not silently return the old event.
   The audit trail should preserve the first event and append a later
   confirmation that EL5 will select.

## Current Gap

`runConfirmSection` in `packages/ax/src/commands/front-of-house.ts` currently
loads the agenda, event log, summary file, and optional scope file, then calls
`findFrontOfHouseAnswerEventForRun` before it resolves the requested section.
That helper verifies:

- the event exists;
- the event type is `library.front_of_house.answer_recorded`;
- `actor.kind` is `user`;
- `payload.playRunId` equals `--run`.

It does not verify the event's `payload.agendaItemId` against the section being
confirmed. The stricter sibling `findFrontOfHouseAnswerEvent` checks an exact
agenda item id, but `confirm-section` confirms a whole context rather than one
item.

The command also looks for an existing section confirmation with:

```ts
frontOfHouseSectionConfirmations(eventPage.events, options.run).find(
  (confirmed) => canonicalFrontOfHouseContextKey(confirmed.context) === section.contextKey,
);
```

If an existing event has the same answer event id, the command returns
`status: "already_appended"` immediately and returns the old event fields. It
does not compare the incoming `summary`, `prefLabel`, or `scope`, so corrected
director text is discarded with exit code `0`.

The state store's idempotency layer is also relevant. `jsonl-state-store`
returns `already_appended` only when the same idempotency key has the same event
type, actor, and payload. With the current key
`foh:section-confirmed:<run>:<contextKey>`, a superseding payload would either
be hidden by the command's early return or conflict at the store. Supersession
therefore needs a key that represents the issue's definition of "same
confirmation."

## Architectural Boundaries

- AX owns deterministic validation, event projection, state-store appends, CLI
  JSON output, and exit codes.
- The event log remains append-only. Supersession appends a later event; it does
  not mutate prior events.
- `section_confirmed` payload fields stay unchanged.
- `frontOfHouseSectionConfirmations` may continue to expose valid stored events
  in ledger order. Prefer a small latest-selection helper for command decisions
  over changing that projection globally unless tests prove global latest-only
  behavior is intended.
- EL5 already has a latest-by-run-and-context selector in
  `latestAtomicCardSectionSummaryInputsByRunAndContextKey`. This slice should
  reuse or test that behavior, not redesign it.
- Command execution remains an Effect program returning `CliResult`, with data
  on stdout and diagnostics on stderr.
- Expected user/input failures become stable invalid-input results with exit
  code `2`.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX Front-of-House domain | `packages/ax/src/domain/library-front-of-house.ts` | Add or refine a helper that validates a user answer event against both `playRunId` and membership in the resolved section's agenda items. In the current checkout, the existing equivalent of the issue's `sectionAgendaItemsForContext` wording is `resolveSectionAgendaContext(...).items`. |
| AX Front-of-House command | `packages/ax/src/commands/front-of-house.ts` | Resolve the section before accepting the answer event, reject cross-section events with exit code `2`, compare incoming explicit confirmation fields against the latest existing confirmation, append `superseded` events when those fields change, and keep identical repeats as `already_appended`. |
| AX state append idempotency use | `packages/ax/src/commands/front-of-house.ts` and any small helper it introduces | Replace the single natural key `foh:section-confirmed:<run>:<contextKey>` for new appends with a deterministic confirmation-signature key that includes `run`, canonical context, `answerEventId`, `summary`, `prefLabel`, and `scope`. Do not change the generic state store. |
| AX Front-of-House tests | `packages/ax/tests/library-front-of-house.test.ts` and `packages/ax/tests/library-front-of-house-bundle.test.ts` | Add domain coverage for section membership and black-box CLI coverage for cross-section rejection, in-section success, identical replay, changed summary/pref-label/scope supersession, different-answer rejection, and no log growth on identical replay. |
| AX EL5 selector tests | `packages/ax/tests/cards.test.ts` or a focused domain test near `atomic-cards.ts` coverage | Assert that two same-run same-context `section_confirmed` events resolve to the later summary, preserving the acceptance criterion that EL5 sees v2. No EL5 production change is expected unless the current helper is missing or regresses. |
| Plugin and Viewer | No intended file changes | No Front-of-House skill, build-atomic-card prompt, workflow metadata, or Viewer behavior changes. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `ax internal front-of-house confirm-section` | CLI now enforces that the cited answer event belongs to the requested section and reports `superseded` when a corrected same-answer confirmation is appended. | Update black-box tests for stdout JSON status, stderr diagnostics, exit codes, and ledger events. |
| Shipped `front-of-house-walk` skill | No intended behavior change. The skill already calls `confirm-section` after a director answer event exists. | No plugin validation is required unless implementation edits `packages/alexandria-plugin`. If plugin files are touched unexpectedly, run the package's validation and relevant Front-of-House structural evals. |
| EL5 `build-atomic-card` workflow | No prompt behavior change. EL5 continues consuming the latest matching section summary prompt input. | Add or preserve deterministic selector coverage; no LLM eval required for unchanged prompt behavior. |
| Viewer | No change. | No Viewer unit/build/browser validation required. |

## Behavior Contract

### Answer-Event Section Membership

For `confirm-section --context C --answer-event E`:

1. Resolve `C` with `resolveSectionAgendaContext`.
2. Resolve `E` as a user-authored Front-of-House answer for `--run`.
3. Read `E.payload.agendaItemId`.
4. Find that agenda item in the loaded agenda.
5. Require that item to belong to the resolved section. Use the section's
   canonical context key for comparison so existing case-insensitive context
   behavior keeps working.

If the answer event is missing `agendaItemId`, references an agenda item not in
the agenda, references an item with no section context, or references an item
whose canonical context differs from `C`, return invalid input with exit code
`2` and append nothing.

The cross-section error message should include:

- the answer event id;
- the answer event's agenda item id;
- the agenda item's context, or `(none)` if it has no context;
- the requested section context.

Example shape:

```text
Answer event <eventId> belongs to agenda item <itemId> in context "Runtime"; cannot confirm context "Framing".
```

### Confirmation Idempotency And Supersession

Normalize incoming explicit fields once:

- `summary` is `summaryFile` content trimmed, as today;
- `scope` is trimmed optional text, with blank scope treated as `undefined`, as
  today;
- `prefLabel` uses the value the parser currently accepts and stores;
- `answerEventId`, `run`, and resolved section context come from the command
  options and agenda resolution.

Define "same confirmation" as:

```text
(run, canonical context, answerEventId, summary, prefLabel, scope)
```

Do not include derived `cards` or `unknowns` in this equality definition.

When any existing confirmation exists for `(run, canonical context)`:

- if its latest event's `answerEventId` differs from the incoming answer event,
  reject with invalid input as today;
- if `answerEventId`, `summary`, `prefLabel`, and `scope` are identical to the
  latest event, return `status: "already_appended"` with that latest event id
  and append nothing;
- if the answer event is the same but `summary`, `prefLabel`, or `scope` differ,
  append a new `section_confirmed` event carrying the incoming fields and return
  `status: "superseded"` with the new event id.

When no existing confirmation exists for `(run, canonical context)`, append the
first event and keep the existing first-write status behavior (`appended`).

For new appends, use a deterministic idempotency key based on the same
definition, for example:

```text
foh:section-confirmed:<run>:<contextKey>:<sha256-of-confirmation-signature>
```

The signature should be stable across object key ordering. Use an existing
stable-stringify or hashing pattern if one is already available in the touched
area; otherwise build the signature from a fixed ordered tuple. Include only:

- `run`;
- `contextKey`;
- `answerEventId`;
- `summary`;
- `prefLabel`;
- `scope ?? null`.

This lets:

- identical first-write retries dedupe at the store;
- identical command replays return `already_appended` before append;
- changed same-answer confirmations append as a distinct immutable event;
- old events written with the previous natural key remain valid without
  migration.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX Front-of-House domain | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house.test.ts` | Covers helper-level answer-event validation, projection, latest selection if added there, and replay/idempotency invariants. |
| AX black-box Front-of-House CLI | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house-bundle.test.ts` | Exercises real `confirm-section` command parsing, exit code `2`, stdout JSON, stderr diagnostics, event log mutations, and final readback regressions. |
| AX EL5 selector regression | `pnpm --filter @alexandria/ax test -- tests/cards.test.ts` | Proves the later same-run section confirmation is what EL5 materializes or selects for `SECTION_SUMMARY`. |
| Focused fallback if package-filter invocation is unavailable | `cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts tests/cards.test.ts` | Equivalent local package test command used by neighboring Front-of-House plans. |

Implementation should add or update black-box cases for:

- cross-section answer event rejected, exit code `2`, stderr names both
  contexts, and no `section_confirmed` event is banked;
- in-section answer event accepted, exit code `0`, status `appended`, and the
  section event is banked;
- identical same-answer re-run returns `already_appended` and the event count
  stays unchanged;
- changed summary same-answer re-run returns `superseded`, event count grows by
  one, and the new event payload carries v2 summary;
- changed `--pref-label` same-answer re-run returns `superseded`;
- changed `--scope-file` same-answer re-run returns `superseded`;
- different answer event for an already-confirmed section still exits `2` and
  appends nothing;
- replaying the event log or rerunning the identical latest confirmation keeps
  the latest event stable and does not grow the log;
- EL5 latest selection resolves to the superseded v2 event rather than v1.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX deterministic CLI/domain behavior | Covered by Bun tests in `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts`, and `packages/ax/tests/cards.test.ts`. | Add deterministic tests in this slice. No eval-harness rerun is required for pure CLI/domain behavior. | Commands listed in Deterministic Verification. |
| Shipped `front-of-house-walk` skill | Front-of-House structural eval metadata exists in `packages/ax/tests/eval-cases/front-of-house-walk/*`, but this slice should not edit skill text. | No eval rerun if plugin files stay untouched. If implementation changes `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`, update the structural contract as needed and run the available Front-of-House eval case if listed. | `pnpm eval -- list`; if the relevant case is listed, run the touched Front-of-House case. |
| EL5 atomic-card prompt behavior | Current behavior is deterministic prompt-input selection; prompt files are not expected to change. | No LLM eval required. If `packages/alexandria-plugin/workflows/build-atomic-card/*` or `atomic-card-production` skill files are edited unexpectedly, follow `EVALS.md` for atomic-card reruns. | Only if plugin workflow or skill files change: `pnpm eval -- run atomic-card-planning/all`, `pnpm eval -- run atomic-card-creation/all`, and `pnpm eval -- run build-atomic-card/all`. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The section-membership check accidentally rejects valid case-insensitive context invocations like `--context runtime` for agenda context `Runtime`. | Compare canonical context keys while reporting the stored display contexts in diagnostics. Add a positive CLI test with case variation. |
| The command keeps using `.find`, so after a supersession it compares future invocations to v1 instead of the latest event. | Select the latest matching confirmation for `(run, context)` by iterating ledger order and keeping the last match, or by reversing the projected list. Add a test that v2 replay is `already_appended` and does not append v3. |
| The new superseded append reuses the old idempotency key and hits a store conflict. | Use a confirmation-signature key for new appends. Add a test that changed summary appends a second event and that repeating v2 does not grow the log. |
| The signature includes derived `cards` or `unknowns`, causing residual-accounting changes to create unexpected supersessions. | Match the issue's idempotency definition exactly: run, canonical context, answer event, summary, pref label, and scope. Cover the explicit changed-field cases only. |
| Cross-section diagnostics are too vague for agents to recover. | Assert stderr contains the answer event id, actual item context, and requested context in the negative black-box test. |
| Supersession works in FoH but EL5 still reads v1. | Keep or add a selector test that passes two same-run same-context events to EL5's latest-by-run helper and asserts v2 is selected. Do not change EL5 selection away from latest-wins. |
| Old event logs with the previous `foh:section-confirmed:<run>:<contextKey>` idempotency key behave differently. | Branch on existing confirmations before appending. Old events still return `already_appended` for identical input and can be superseded with the new signature key when explicit fields change. No migration required. |

## Implementation Steps

1. Add a domain helper or command-local helper for answer-event membership:
   - resolve the user answer event with existing type, actor, and run checks;
   - extract `payload.agendaItemId`;
   - find the agenda item in `agenda.items`;
   - require the item's canonical context key to match the resolved section's
     `contextKey`;
   - return precise `Error` messages for missing agenda item id, unknown item,
     no-context item, and cross-context item.

2. Reorder `runConfirmSection` validation:
   - read and validate the agenda and summary as today;
   - resolve the requested section before accepting the answer event;
   - validate the answer event against both run and section membership;
   - keep existing plane, cards, and unknown derivation after section
     resolution.

3. Add a small latest-confirmation selector for command decisions:
   - use `frontOfHouseSectionConfirmations(eventPage.events, options.run)`;
   - filter by canonical context key;
   - choose the last matching event, not the first;
   - keep older events in the log for audit.

4. Add explicit confirmation comparison:
   - compare latest `answerEventId`;
   - reject different answer ids with the existing invalid-input class and a
     message containing `already confirmed`;
   - compare `summary`, `prefLabel`, and normalized `scope`;
   - return `already_appended` only when all explicit fields match.

5. Add the confirmation-signature idempotency key:
   - build a deterministic signature from `(run, contextKey, answerEventId,
     summary, prefLabel, scope ?? null)`;
   - hash it using an existing SHA-256 helper or a local fixed-order hash;
   - use the signature key for new first writes and superseded writes;
   - do not change historical events or the generic state store.

6. Append superseded events:
   - reuse the existing `section_confirmed` payload shape;
   - include current derived `plane`, `cards`, and `unknowns`;
   - include `scope` only when defined, as today;
   - translate a changed-field append into JSON `status: "superseded"` rather
     than exposing the store's `appended` status;
   - return the new event id and the same output fields the command currently
     returns.

7. Preserve first-write behavior:
   - first confirmation still returns `status: "appended"` when the store
     appends a new event;
   - if implementation reaches a store-level `already_appended` for the exact
     new signature during a retry, return an idempotent result rather than a
     conflict.

8. Update `packages/ax/tests/library-front-of-house.test.ts`:
   - cover the helper's positive in-section case;
   - cover wrong-run, non-user, wrong-type regressions already present;
   - add wrong-context and missing/unknown agenda item id cases if the helper
     lives in the domain.

9. Update `packages/ax/tests/library-front-of-house-bundle.test.ts`:
   - extend the existing `banks a director-confirmed section summary` flow or
     split it into focused tests for the acceptance matrix;
   - use `appendFrontOfHouseAnswer` with an alternate `agendaItemId` in another
     context to prove cross-section rejection;
   - write v1/v2 summary, pref-label, and scope files and assert ledger payloads;
   - assert event counts after each command.

10. Update EL5 selector coverage:
    - either add a focused test for
      `latestAtomicCardSectionSummaryInputsByRunAndContextKey` with v1 then v2
      same-run events, or update the existing `cards.test.ts` latest-selection
      case to assert v2 summary and event id;
    - do not change EL5 production code unless the test reveals the latest
      selector is missing or broken in the implementation branch.

11. Run deterministic verification:
    - Front-of-House domain tests;
    - Front-of-House black-box bundle tests;
    - cards/EL5 selector tests.

## Acceptance / Exit Criteria

1. `confirm-section --context A` citing an answer event whose agenda item is in
   context `B` exits `2`, names the answer event and both contexts in stderr,
   emits no stdout in the invalid-input path, and appends no
   `section_confirmed` event.
2. `confirm-section --context A` citing an answer event whose agenda item is in
   context `A` exits `0`, returns status `appended`, and banks the section.
3. Re-confirming with the same answer event and identical summary, pref-label,
   and scope returns `already_appended`, returns the latest matching event id,
   and appends no new event.
4. Re-confirming with the same answer event and changed summary returns
   `superseded`, appends a new `section_confirmed` event carrying v2, and a
   repeat of v2 returns `already_appended` without growing the log.
5. Re-confirming with changed `--pref-label` or changed `--scope-file` also
   returns `superseded` and appends a new event carrying the changed field.
6. Re-confirming an already-confirmed section with a different answer event
   still exits `2`, reports the existing confirmation conflict, and appends
   nothing.
7. EL5's latest section-summary selection resolves to the superseded v2 event
   for the same `(playRunId, context)`.
8. Replaying the event log yields the same latest confirmation for a section,
   and identical command replays do not grow the ledger.
9. No `section_confirmed` payload schema change is introduced.
10. No plugin, Viewer, or `docs/alexandria/library` files are changed unless a
    documented implementation discovery makes that necessary.
11. The deterministic verification commands pass, or any unavailable command is
    documented with the exact failure reason in the implementation closeout.

## Deferred Follow-Ups

1. If future work wants an explicit operator-facing history view, add a
   dedicated command or Viewer affordance for all `section_confirmed`
   supersession events. Do not overload this slice.
2. If Front-of-House skill wording is later updated to mention supersession,
   pair that prompt change with the relevant structural eval update.
3. Consider a small reusable "latest by run and canonical context" utility if a
   third caller needs the same section-confirmation projection. This slice can
   stay local to avoid broad refactors.
