# Issue 509: `record-turn` Re-Presentation Fabro Linkage

Status: implementation plan, 2026-07-01.

## Header

- Issue: GitHub #509, "`record-turn` must not drop a new `fabroRunId` on
  re-presentation".
- Goal: make a repeated Front-of-House presentation of the same agenda item
  record the new Fabro/question linkage exactly once, while preserving
  idempotency for an accidental duplicate call for the same presentation.
- Linked product plan: none separate from the issue body. The issue body is the
  binding product contract for this slice.
- GitHub issue comments reviewed: the only comment is the Fabro local run link
  for `01KWEM7ZQH9F15HC1QXQS6CGRB`; it adds no extra technical contract.

## Scope

This slice lands in the canonical AX/Viewer product line, with implementation
expected primarily in `packages/ax`.

In scope:

1. Change `ax internal front-of-house record-turn` so its idempotency identity
   includes the presentation identity:
   `playRunId`, `agendaItemId`, `fabroRunId`, and `questionId`.
2. Preserve exact-duplicate idempotency for the same item, Fabro run, and
   question. The JSON and human stdout status should still report the existing
   event as `already_appended`.
3. Add or refine a pure Front-of-House event projection that derives the latest
   `library.front_of_house.turn_recorded` per `(playRunId, agendaItemId)` from
   replay order.
4. Wire any tracker or tracker-adjacent consumer that resolves "the current
   Fabro run for agenda item I" through that latest-turn projection, so the
   newest presentation wins.
5. Add deterministic AX tests for new-presentation append, exact duplicate
   no-op, latest-wins selection, single-presentation regression, and replay
   idempotency.
6. Run Viewer validation only if the implementation changes viewer source,
   runtime schemas, or tracker API contracts consumed by the viewer.

## Non-Goals

1. Do not change the `library.front_of_house.turn_recorded` event payload shape.
2. Do not change `record-turn` flags, help usage, exit codes, or command name.
3. Do not mutate or rewrite previous Ledger events; re-presentations are new
   immutable facts.
4. Do not change `confirm-section`, `stage-next`, answer recording,
   residual recording, or bundle patch idempotency except where tests need
   fixtures.
5. Do not introduce a materialized "current turn" file. Current linkage remains
   a read-time derivation from Ledger events.
6. Do not edit `docs/alexandria/library/`.
7. Do not edit vendored repositories under `repos/`.

## Current Gap

`packages/ax/src/commands/front-of-house.ts` currently appends
`library.front_of_house.turn_recorded` in `runRecordTurn` with this idempotency
key:

```ts
`foh:turn:${current.playRunId}:${current.agendaItem.id}`
```

The event payload already carries the presentation-specific fields
`fabroRunId` and `questionId`, but the idempotency key ignores both. The JSONL
state store returns an existing event when the key, type, actor, and payload
match; it raises an idempotency conflict when the same key is reused with a
different payload. With the current key, a legitimate re-presentation of the
same item under a new Fabro run/question cannot append a new turn fact. It is
either swallowed by the old item key or conflicts before the new linkage reaches
the Ledger, depending on the exact store path.

The current checkout has no broad consumer of `turn_recorded` outside schema and
FoH command tests. The tracker surface is Fabro-run keyed through Studio APIs,
and active runs derive from `ProjectState.playRuns`. Issue #509 still requires a
single AX selector for item-level turn linkage: consumers that need "current
Fabro run for agenda item I" must select the latest matching turn event, not the
first.

## Architectural Boundaries

`packages/ax` owns the deterministic command, event-store interaction, and
read-time Ledger projection. Keep the command as an `Effect` program returning a
stable `CliResult`; command data stays on stdout and diagnostics stay on stderr.

The write-time boundary is narrow:

1. Compute the new idempotency key from all four required presentation fields:
   `foh:turn:<playRunId>:<agendaItemId>:<fabroRunId>:<questionId>`.
2. Let the state store continue enforcing payload equality for a reused key.
   If the same presentation key is reused with a materially different payload,
   preserve the existing idempotency-conflict behavior instead of silently
   accepting drift.
3. To avoid migration-induced duplicate events in ledgers that already contain
   the old coarse key, first check existing `turn_recorded` events for an exact
   presentation identity match. If found, return that event as
   `already_appended` without appending a duplicate.

The read-time boundary belongs in `packages/ax/src/domain/library-front-of-house.ts`
near the existing FoH projection helpers. Add a helper such as:

```ts
export interface FrontOfHouseTurnPresentation {
  agendaItemId: string;
  agendaItemKind: FrontOfHouseAgendaItemKind;
  eventId: string;
  fabroRunId: string;
  playRunId: string;
  questionId: string;
}

export function latestFrontOfHouseTurnsByAgendaItem(
  events: readonly AlexandriaStateEvent[],
  playRunId: string,
): Map<string, FrontOfHouseTurnPresentation>;
```

The helper should scan events in Ledger replay order and overwrite the map entry
for each valid matching `turn_recorded`. "Latest" means last matching event in
the replayed log, not lexicographically greatest `at` timestamp. This keeps
selection deterministic under replay, fixtures with repeated timestamps, and
manual log inspection.

If an item-level tracker consumer exists by implementation time after the Wave 1
FoH-domain refactors land, replace its first-match or item-only lookup with this
helper. If no such consumer exists in the implementation checkout, do not invent
a Viewer UI or API only for this issue; land the AX selector and tests so the
tracker linkage has one correct source when consumed.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| FoH record-turn CLI | `packages/ax/src/commands/front-of-house.ts` | `record-turn` appends one turn per distinct presentation identity and returns `already_appended` for exact duplicates. |
| FoH turn projection domain | `packages/ax/src/domain/library-front-of-house.ts` | Add latest-turn selector keyed by `(playRunId, agendaItemId)` where later turn events win. |
| State event schema | `packages/ax/src/domain/state-events.ts` | No intended shape change; schema tests should prove `turn_recorded` still requires `fabroRunId` and `questionId`. |
| AX FoH CLI tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Add black-box tests for re-presentation append, duplicate no-op, stdout fields, and event-log size. |
| AX FoH domain tests | `packages/ax/tests/library-front-of-house.test.ts` | Add pure projection tests for latest-wins, single-presentation regression, and replay order. |
| AX state/tracker tests | `packages/ax/tests/state.test.ts`, `packages/ax/tests/studio-api.test.ts` if touched | Add coverage only if the latest-turn selector is wired into project-state or Studio tracker APIs in this slice. |
| Viewer tracker | `packages/viewer/src/**` only if touched | Preserve current viewer runtime contract unless tracker API/schema wiring requires a viewer change. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `ax internal front-of-house record-turn` | Same CLI flags and output shape, but the mutation boundary changes from one event per agenda item to one event per distinct presentation. | Update AX black-box tests for exit code `0`, JSON `status`, `eventId`, and Ledger event count. |
| Tracker/item linkage selector | Consumers resolving the current Fabro run for an agenda item use the latest matching turn event. | Update the consumer test if one exists; otherwise add domain-level selector coverage. |
| Shipped `front-of-house-walk` skill | No intended prompt or workflow change. The skill already passes `--fabro-run-id` and `--question`; this slice changes AX semantics underneath the same command. | No plugin validation or eval rerun required unless implementation edits `packages/alexandria-plugin`. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| FoH domain projection | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Proves latest-wins selection, stale-first negative case, single-presentation regression, and replay determinism. |
| FoH CLI black-box behavior | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Proves `record-turn` appends a second event for a new Fabro/question, preserves exact duplicate no-op, keeps stdout/stderr/exit code stable, and does not grow the log on retries. |
| Event schema regression | `cd packages/ax && bun test tests/events.test.ts` | Confirms `turn_recorded` event shape is unchanged and still requires the fields used by the new identity. |
| State/tracker API, if touched | `cd packages/ax && bun test tests/state.test.ts tests/studio-api.test.ts` | Required if the latest-turn selector is exposed through project state or Studio tracker APIs. |
| AX package typecheck | `cd packages/ax && pnpm run typecheck` | Catches signature drift in Effect command and domain helper exports. |
| AX lint and format | `cd packages/ax && pnpm run lint && pnpm run format:check` | Keeps changed TypeScript within package standards. |
| Viewer unit/build, only if viewer code changes | `cd packages/viewer && pnpm run test && pnpm run check && pnpm run build` | Required if runtime schemas, tracker components, or viewer API clients change. |
| Viewer browser tracker, only if viewer tracker behavior changes | `cd packages/viewer && pnpm run test:e2e -- tests/library-browser.spec.ts` | Required if the browser-visible tracker linkage changes. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| AX deterministic CLI/domain behavior | Bun tests cover the command and projection behavior directly. | Add/update Bun tests in this slice; no eval-harness run is required for AX-only deterministic code. | Commands listed in Deterministic Verification. |
| Shipped `front-of-house-walk` skill | Existing structural eval fixtures mention `record-turn`, but the skill text and command flags do not change. | No eval rerun required unless implementation edits `packages/alexandria-plugin/skills/front-of-house-walk` or workflow files. | If plugin files are touched, run the relevant front-of-house eval case(s) listed by `pnpm eval -- list`. |
| Viewer tracker | Covered by Viewer unit/build/browser tests when viewer behavior changes. | No eval-harness coverage required; use deterministic Viewer validation if touched. | Conditional commands listed above. |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Including only `fabroRunId` in the new key misses a same-run/new-question re-presentation. | Include both `fabroRunId` and `questionId` in the key because both flags are required and together represent the presentation identity. |
| Old ledgers with coarse `foh:turn:<playRunId>:<agendaItemId>` keys grow a duplicate on the first retry after this change. | Before append, scan existing turn events for the exact presentation identity and return the existing event as `already_appended` when found. |
| A same-key but different-payload retry is silently accepted. | Do not bypass state-store conflict behavior for new keys. Only the legacy pre-check may return an existing event, and only when the stored event's presentation identity matches the submitted one. |
| The tracker or a future consumer still selects the first turn event for an item. | Centralize latest-turn selection in `library-front-of-house.ts`, wire consumers to that helper, and add a negative test where the first event is stale. |
| "Latest" is implemented by timestamp sorting and becomes nondeterministic for manual fixtures or clock collisions. | Define and test latest as last matching event in replay order. |
| Re-presentation history is flattened into an update. | Keep append-only semantics; never mutate prior `turn_recorded` events. |
| Viewer work expands the slice into a UI redesign. | Only touch Viewer if the tracker API/schema contract currently consumed by Viewer changes; otherwise keep this as an AX behavior and projection fix. |

## Implementation Steps

1. Add a small helper in `front-of-house.ts` or `library-front-of-house.ts` to
   compute the presentation idempotency key:
   `foh:turn:${playRunId}:${agendaItemId}:${fabroRunId}:${questionId}`.
2. Add a pure helper in `library-front-of-house.ts` to parse valid
   `library.front_of_house.turn_recorded` events into turn-presentation records.
   Ignore events with missing or non-string required payload fields rather than
   throwing from the projection helper.
3. Add `latestFrontOfHouseTurnsByAgendaItem(events, playRunId)` using replay
   order. Export it for command and tracker consumers.
4. In `runRecordTurn`, load existing events before append only for the narrow
   duplicate-preservation check. If an existing turn has the same `playRunId`,
   `agendaItemId`, `fabroRunId`, and `questionId`, return its event id with
   status `already_appended`.
5. Replace the append idempotency key in `runRecordTurn` with the new
   presentation key. Keep the payload, actor, event type, stdout JSON fields,
   and human message shape unchanged.
6. Find any item-level tracker or consumer code that reads
   `library.front_of_house.turn_recorded` and replace first-match or item-only
   selection with `latestFrontOfHouseTurnsByAgendaItem`. In the current checkout
   no such consumer was found; if still true during implementation, do not add
   a new Viewer/API surface solely for this issue.
7. Add domain tests in `library-front-of-house.test.ts`:
   - one turn selects its Fabro/question ids;
   - two turns for the same `(playRunId, agendaItemId)` select the second;
   - a first/stale event is not selected after a later event;
   - turns for other play runs or agenda items do not affect the selection;
   - replaying the same event list produces the same map.
8. Add black-box CLI tests in `library-front-of-house-bundle.test.ts`:
   - prepare/stage an item, call `record-turn` with `F1/Q1`, then call again
     for the same item with `F2/Q2`; assert two `turn_recorded` events and the
     second payload carries `F2/Q2`;
   - call `record-turn` twice with the exact same `F2/Q2`; assert the second
     result is `already_appended` and event count does not increase;
   - assert existing single-presentation behavior still appends exactly one
     event with `actor.kind = "agent"` and the same payload fields;
   - if a tracker consumer is wired, assert it resolves the agenda item to
     `F2`, not `F1`.
9. Add or adjust `state.test.ts` / `studio-api.test.ts` only if implementation
   exposes latest-turn linkage through project state or Studio tracker APIs.
10. Run the deterministic verification commands and keep failures scoped to the
    files named in this plan.

## Acceptance / Exit Criteria

1. Re-presenting the same agenda item with a new `--fabro-run-id` and
   `--question` appends a second `library.front_of_house.turn_recorded` event
   carrying the new ids.
2. An exact duplicate `record-turn` call for the same item, Fabro run, and
   question appends no new event and returns the existing event with status
   `already_appended`.
3. The latest-turn selector resolves `(playRunId, agendaItemId)` to the newest
   matching turn in replay order; the first/stale event is not selected after a
   later re-presentation.
4. A single presentation still behaves as today: one event, same payload shape,
   same actor kind, same command flags, same exit code, and same important JSON
   output fields.
5. Replaying the event log reproduces the same latest-turn selection, and
   identical re-calls do not grow the log.
6. Any tracker or item-linkage consumer present in the implementation checkout
   uses the latest-turn selector, so the agenda item points at the new
   `fabroRunId` after re-presentation.
7. `library.front_of_house.turn_recorded` schema and `record-turn` CLI usage are
   unchanged.
8. The deterministic verification commands required for the touched surfaces
   pass.

## Deferred Follow-Ups

1. If the Viewer later needs to display agenda-item turn history, add a
   deliberate runtime API contract for the derived turn list rather than reading
   Ledger JSONL directly in the browser.
2. If old coarse-key `turn_recorded` events need a one-time cleanup report, build
   an operator diagnostic in a separate slice; do not rewrite the Ledger here.
3. If a future product contract treats `fabroRunId` alone as sufficient
   presentation identity, revisit the key shape then. This slice intentionally
   uses both required presentation ids to avoid same-run/new-question loss.
