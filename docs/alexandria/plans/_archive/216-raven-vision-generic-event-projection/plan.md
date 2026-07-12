# Issue 216: Raven Vision Generic Event Projection

- Issue: GitHub #216,
  `Update Raven Vision projection when events are appended through the runtime`
- Run ID: `01KT4YMMEAZFD2D759W13W602P`
- Product plan: related to `raven-onboarding-experience`
- Product-plan anchor:
  `docs/alexandria/plans/raven-onboarding-experience/plan.md`
- Primary surface: `packages/ax-next`
- Guardrail surface: `packages/viewer-next`

## Source Context

This plan is based on the GitHub issue body, the single issue comment pointing
to the Fabro run, and the local implementation. No additional issue-review
feedback was present in comments.

Required repo guidance read for this plan:

1. `CLAUDE.md`
2. `README.md`
3. `skills/maintainer/technical-planning/SKILL.md`
4. `skills/maintainer/technical-planning/plan-template.md`
5. `packages/ax-next/CLAUDE.md`
6. `packages/ax-next/README.md`
7. `packages/ax-next/docs/cli-design-principles.md`
8. `packages/viewer-next/README.md`
9. `EVALS.md`

Relevant implementation and plan context read:

1. `packages/ax-next/src/effects/runtime-server.ts`
2. `packages/ax-next/src/domain/raven-vision.ts`
3. `packages/ax-next/src/domain/project-state.ts`
4. `packages/ax-next/src/domain/state-events.ts`
5. `packages/ax-next/src/effects/project-state-loader.ts`
6. `packages/ax-next/src/effects/jsonl-state-store.ts`
7. `packages/ax-next/tests/runtime-server.test.ts`
8. `packages/ax-next/tests/raven-vision.test.ts`
9. `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`
10. `packages/viewer-next/src/app/runtime/schemas.ts`
11. `packages/viewer-next/src/app/runtime/event-stream.ts`
12. `docs/alexandria/plans/feat-005-raven-slot-collaboration/plan.md`
13. `docs/alexandria/plans/feat-007-bank-vision/plan.md`
14. `docs/alexandria/plans/feat-008-knowledge-bank-banked-vision/plan.md`
15. `docs/alexandria/plans/raven-onboarding-experience/plan.md`

## Goal

Make the generic runtime event append endpoint preserve Raven Vision projected
state for accepted stateful Raven events.

When a valid `POST /api/events` request appends
`raven.vision.slot.approved` or `raven.vision.slot.skipped`, the runtime must
reduce that event into the persisted Raven config before it reloads project
state and broadcasts `project-state`. A Viewer already subscribed to
`/api/events-stream` must receive a `project-state` payload whose
`raven.vision.slots` reflect the new status without a manual refresh.

## Scope

In scope:

1. Update the AX2 runtime generic append path in `appendEventResponse`.
2. Reuse existing Raven reducer helpers so generic append and dedicated Viewer
   Vision routes share projection semantics.
3. Reduce accepted stateful Raven events into
   `.alexandria-next/alexandria-config.json` before
   `loadAlexandriaProjectState` runs for the broadcast payload.
4. Account for currently modeled stateful Raven event types:
   `raven.vision.started`, `raven.vision.source_attached`,
   `raven.vision.slot.updated`, `raven.vision.slot.approved`,
   `raven.vision.slot.skipped`, `raven.source_of_truth.updated`, and
   `raven.vision.banked`.
5. Add runtime tests for generic `raven.vision.slot.approved` and
   `raven.vision.slot.skipped`.
6. Add an SSE assertion proving the emitted `project-state` message contains
   the reduced Raven Vision status.
7. Add idempotency coverage proving duplicate generic appends do not duplicate
   ledger events or regress projected Vision state.

## Non-Goals

Out of scope:

1. Replacing config-backed Raven projection with a full event-stream replay
   projection.
2. Backfilling already-stale configs from historical generic Raven events.
   That belongs to the deferred replay/projection-cache repair work.
3. Adding new event types. `raven.vision.drafting_requested` is named in the
   issue, but it is not currently present in `ALEXANDRIA_STATE_EVENT_TYPES` or
   the Raven reducer; adding it would be a separate schema/reducer slice.
4. Changing Alexandria 1 packages.
5. Changing AX2 CLI command contracts or adding new approve/skip CLI commands.
6. Changing Alexandria Next plugin skills or guided Raven play behavior.
7. Writing to `docs/alexandria/library/`.
8. Changing Viewer React subscription behavior unless implementation discovers
   the current `project-state` handling no longer decodes the runtime payload.

## Linked Product-Plan Summary

The Raven onboarding product plan says the ledger is the source of truth for
state changes and config/JSONL files are current-state projections rewritten by
reducers after events are appended.

The relevant Raven reducer contract is:

1. `raven.vision.started` initializes the nine slots and marks Vision
   `in_progress`.
2. `raven.vision.source_attached` appends a source ID to Vision onboarding.
3. `raven.vision.slot.updated` writes slot text and marks the slot
   `needs_review`.
4. `raven.vision.slot.approved` marks the slot `approved`.
5. `raven.vision.slot.skipped` clears slot text and marks the slot `skipped`.
6. `raven.source_of_truth.updated` updates Raven Source of Truth metadata.
7. `raven.vision.banked` requires ready Vision and matching Source of Truth
   metadata, then marks Vision and Knowledge Bank `vision` as banked.

FEAT-005 already called out the current gap: generic event append can append
validated Raven events, but it does not reduce `raven.vision.*` events into
config-backed Vision state. This issue narrows that previously deferred gap to
the runtime projection path.

## Current Gap

Current implementation shape:

1. `packages/ax-next/src/effects/runtime-server.ts` has dedicated Vision
   mutation routes for start, source attach, slot update, approve, skip, and
   bank.
2. Those dedicated routes append a Raven event, call the relevant Raven config
   reducer, write project config, reload project state, then broadcast
   `state-event` and `project-state`.
3. `appendEventResponse` for `POST /api/events` appends the event and reloads
   project state immediately.
4. `deriveProjectState` derives `state.raven.vision` from
   `config.agents.raven.onboarding.vision`, not by replaying the ledger.
5. Therefore a generic append of `raven.vision.slot.approved` reaches the
   ledger, but the reloaded project state still sees stale config and the
   broadcast `project-state` payload is stale.
6. Viewer Next already listens to `/api/events-stream` in
   `LibraryBrowserApp.tsx`, decodes `project-state`, and updates local Vision
   state from `projectState.raven.vision`. The primary bug is the runtime
   payload, not the browser subscription.

## Architectural Boundaries

AX2 runtime owns this fix. Keep the mutation inside
`packages/ax-next/src/effects/runtime-server.ts`, under the existing
`mutationSemaphore`, and continue using Effect plus `loadProjectStorage`,
`writeProjectConfig`, and `loadAlexandriaProjectState`.

Do not introduce a second Raven projection model in Viewer. Viewer should
continue treating runtime `project-state` as canonical.

Do not broaden the generic event store. `jsonl-state-store.ts` should remain
responsible for append-only ledger semantics and idempotency. Runtime-specific
projection cache updates belong in the runtime append response path for this
short-term slice.

Do not write product behavior into CLI commands or plugin skills. Agents may
still append through the generic event surface, but this issue is about making
runtime projection coherent after such accepted events.

The implementation should be explicit about the transaction limitation:
ledger append and config write are not currently a single atomic transaction.
For this slice, reduce only recognized stateful Raven events after successful
append and before broadcast. If a semantic reducer failure is possible for a
generic Raven event, return a structured error and do not broadcast a stale
`project-state`; defer full pre-append semantic admission or replay repair to
follow-up work.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 runtime generic events | `packages/ax-next/src/effects/runtime-server.ts` | `POST /api/events` reduces recognized stateful Raven events into config before loading and broadcasting projected state |
| AX2 Raven reducer integration | Existing helpers in `runtime-server.ts`, plus imports from `domain/raven-vision.ts` if needed | Generic append reuses `reduceVisionOrFail`, `reduceSourceOfTruthOrFail`, and `reduceVisionBankedOrFail` semantics instead of inventing a parallel reducer |
| AX2 runtime tests | `packages/ax-next/tests/runtime-server.test.ts` | Adds generic append approval/skip, idempotency, and SSE `project-state` assertions |
| Viewer runtime guardrail | `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`, `packages/viewer-next/src/app/runtime/schemas.ts` | No expected code change; existing subscription should update once runtime emits coherent `project-state` |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Alexandria Next plugin skills | No behavior change in this slice | No plugin validation required unless implementation edits `packages/alexandria-next-plugin` |
| Alexandria 1 agents/skills | No behavior change | No eval rerun required |
| AX2 generic runtime event append | Agents that append accepted Raven Vision events through `/api/events` now cause coherent projected state | Cover with deterministic runtime tests rather than prompt/eval changes |
| Viewer users | Open Viewer screens receive a correct projected state payload for generic Raven approval/skip events | Covered by runtime SSE payload tests; browser e2e only if Viewer code changes |

## Implementation Steps

1. Add a small helper in `packages/ax-next/src/effects/runtime-server.ts` that
   detects stateful Raven projection events from appended
   `AlexandriaStateEvent` values.
2. Route event types through existing reducer helpers:
   `raven.source_of_truth.updated` to `reduceSourceOfTruthOrFail`,
   `raven.vision.banked` to `reduceVisionBankedOrFail`, and other
   `isRavenVisionEventType` values to `reduceVisionOrFail`.
3. Update `appendEventResponse` so the serialized mutation flow is:
   load storage, append event, reduce/write config when
   `append.status === "appended"` and the event is stateful Raven, reload
   project state, return append metadata.
4. Preserve existing generic append behavior for non-Raven events.
5. Preserve idempotency behavior: when append returns `already_appended`, do
   not reapply an old event out of ledger order and do not broadcast. Load and
   return current state as the existing path does.
6. If reducer handling fails for an appended Raven event, return a structured
   `RuntimeRequestError` status and do not send `state-event` or
   `project-state`. Keep this visible as a risk until a later transaction or
   replay design removes the append/write split.
7. Add a runtime test that starts Vision, writes text to a slot, opens
   `/api/events-stream`, appends `raven.vision.slot.approved` through
   `POST /api/events`, and asserts the next `project-state` SSE payload shows
   that slot as `approved`.
8. Add a runtime test that appends `raven.vision.slot.skipped` through
   `POST /api/events` and asserts projected state shows the slot as
   `skipped` with empty text.
9. Add duplicate/idempotency coverage with a repeated generic Raven event
   append. Assert one ledger event for the idempotency key and no projection
   regression.
10. Keep Viewer code unchanged unless tests or schema decoding prove a payload
    issue. If Viewer code changes, run Viewer tests and update this plan's
    verification before implementation approval is considered complete.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 runtime server | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves generic Raven append reduces config before project-state broadcast, covers approval, skip, SSE payload, and idempotency |
| AX2 Raven reducer | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Confirms the reused reducer still handles approved/skipped transitions and status recomputation |
| AX2 event schemas | `cd packages/ax-next && bun test tests/events.test.ts` | Confirms accepted Raven event schemas remain stable and no unsupported event type was accidentally added |
| AX2 state projection | `cd packages/ax-next && bun test tests/state.test.ts` | Confirms project-state derivation from config remains coherent |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches runtime/domain type drift |
| Viewer runtime guardrail, only if touched | `cd packages/viewer-next && pnpm run test` | Confirms Viewer runtime schema/client decoding still accepts `project-state` payloads |
| Viewer check, only if touched | `cd packages/viewer-next && pnpm run check` | Catches React/Astro/TypeScript issues if Viewer code changes |

Manual verification:

1. Initialize an Alexandria Next project.
2. Start the AX2 runtime and open Viewer Next.
3. Start Raven Vision and enter text for one slot.
4. From another client, append `raven.vision.slot.approved` through
   `POST /api/events` or `ax2 inspect events append`.
5. Verify the open Viewer slot changes to `approved` without reload.
6. Repeat with a slot skip and verify the text clears and status becomes
   `skipped`.
7. Repeat the same append with the same idempotency key and verify the ledger
   and projected state do not change unexpectedly.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 runtime projection | Deterministic Bun tests cover runtime APIs, event append, SSE, state projection, and Raven reducer behavior | Add focused deterministic tests; no LLM eval needed | `cd packages/ax-next && bun test tests/runtime-server.test.ts tests/raven-vision.test.ts tests/events.test.ts tests/state.test.ts` |
| Viewer runtime subscription | Existing Viewer code already listens to `project-state`; this slice should not change Viewer behavior | No eval-harness action. Run Viewer deterministic tests only if Viewer code changes | `cd packages/viewer-next && pnpm run test` if touched |
| Alexandria plugin agents/skills | No plugin guidance or shipped skill behavior changes planned | No eval rerun required | None |

No eval-harness coverage is required for this slice as scoped. The behavior is
deterministic runtime projection/cache maintenance, not reusable prompt,
agent, or skill behavior. If implementation changes product-facing Raven
skills or autonomous guided play behavior, revise this section before merge and
run the relevant plugin validation/eval path.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Generic append writes the ledger but config reduction fails afterward | Do not broadcast stale `project-state`; return a structured error; keep the implementation focused on valid accepted events; defer full atomic append/projection or replay repair |
| Reapplying an idempotent old event out of ledger order regresses newer slot state | On `already_appended`, do not reduce again; load current state and do not broadcast |
| The helper misses a currently modeled stateful Raven event | Use explicit event-type routing for all accepted Raven projection events in `state-events.ts`: Vision start/source/slot events, Source of Truth update, and Vision banked |
| `raven.vision.banked` needs both Vision and Knowledge Bank reducers | Route banked events through `reduceVisionBankedOrFail`, not the narrower Vision-only reducer |
| Viewer remains stale despite runtime fix | Add an SSE test asserting the actual `project-state` payload includes reduced `raven.vision`; Viewer already applies that payload, and Viewer tests can be run if code changes |
| Unsupported `raven.vision.drafting_requested` is accidentally treated as supported | Do not add the event in this slice. If a future slice accepts it, add schema, reducer semantics, and tests together |
| Broader replay work is hidden inside a prototype fix | Keep this slice limited to short-term config projection update and list replay as a deferred follow-up |
| Source attachment through generic append references a missing source item | Preserve current reducer semantics for this slice; if stricter source existence admission is needed, plan a separate generic event semantic validation change |

## Acceptance / Exit Criteria

1. Appending `raven.vision.slot.approved` through `POST /api/events` after
   Vision has started updates persisted Raven Vision config before project
   state is reloaded.
2. The `project-state` SSE payload emitted for that append contains
   `raven.vision.slots[*].status === "approved"` for the target slot.
3. An already-open Viewer can apply that `project-state` payload without a
   manual refresh.
4. Appending `raven.vision.slot.skipped` through `POST /api/events` updates
   projected state to `skipped` and clears the target slot text.
5. Duplicate/idempotent generic appends do not duplicate ledger events and do
   not regress projected Raven Vision state.
6. Non-Raven generic event append behavior remains unchanged.
7. Tests cover generic runtime append for at least
   `raven.vision.slot.approved` and `raven.vision.slot.skipped`.
8. Tests confirm the SSE `project-state` payload reflects the reduced Raven
   Vision state.
9. `cd packages/ax-next && bun test tests/runtime-server.test.ts` passes.
10. AX2 typecheck passes, and any additional touched package tests listed in
    deterministic verification pass.

## Deferred Follow-Ups

1. Replace config-backed Raven projection cache with replay-derived Raven
   projection or add a repair command that replays Raven ledger events into
   config in order.
2. Design transactional semantics for append-plus-projection-cache writes, or
   pre-append semantic admission for stateful events, so invalid semantic Raven
   events cannot ever reach the ledger without projection.
3. Add first-class CLI approve/skip commands if agents need a deterministic
   command surface instead of generic event append.
4. Add `raven.vision.drafting_requested` only if a future product slice defines
   its payload schema, reducer effect, projection fields, and tests.
5. Add stricter semantic validation for generic
   `raven.vision.source_attached` if source existence must be guaranteed for
   all append clients, not only dedicated Viewer source routes.
