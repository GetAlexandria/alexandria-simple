# Issue 577: Library Notepad Durable Resolution Projection

Status: implementation-ready technical plan. This is a planning-only slice;
implementation files are intentionally untouched by this stage.

## Header

- Issue: GitHub #577, "Library Notepad N1: durable per-thread resolution
  projection from the Ledger"
- Goal: derive a durable, per-thread Library Notepad resolution projection from
  Ledger events so thread resolution survives play-run relaunches without
  rewriting `threads.json`.
- Linked product plan:
  `docs/alexandria/plans/library-notepad-surface/plan.md`, section 3, slice N1,
  from branch `danversfleury/frame-ruling-cascade-plan`.
- Run ID: `01KWHWX4NSKV1AAB411GJEW68Q`

## Source Review Notes

- Required guidance read: `CLAUDE.md`, `README.md`,
  `skills/maintainer/technical-planning/SKILL.md`,
  `skills/maintainer/technical-planning/plan-template.md`,
  `packages/ax/CLAUDE.md`, `packages/ax/README.md`,
  `packages/ax/docs/cli-design-principles.md`,
  `packages/viewer/README.md`, `packages/alexandria-plugin/CLAUDE.md`,
  `packages/alexandria-plugin/README.md`, and `EVALS.md`.
- GitHub issue #577 and its comments were read through the GitHub connector.
  The only issue comment is the Fabro local run link for this run id.
- The linked product plan is not present in the local checkout and the branch is
  not a local Git object. It was read through the GitHub connector and is
  treated as read-only product-plan input, per the technical-planning skill.
- No existing issue-specific technical plan for #577 was present. This plan uses
  the required per-issue directory instead of overwriting the linked product
  plan path.
- Relevant prior plans read:
  `docs/alexandria/plans/library-notepad/plan.md`,
  `docs/alexandria/plans/505-threads-json-ledger-derived-lifecycle/plan.md`,
  and
  `docs/alexandria/plans/502-library-notepad-thread-peek-empty-plane-context/plan.md`.

## Scope

This slice lands primarily in `packages/ax`, with a narrow viewer runtime schema
update so existing viewer catalog clients can decode the new optional resolution
metadata.

In scope:

1. Add a pure Library Notepad thread-resolution projection from Ledger events.
2. Project resolution for authored threads from a bundle or library root's
   `threads.json` without rewriting that file or creating any new stored state.
3. Expose the projection through the existing library catalog loader and
   `/api/library/catalog` response path. There is no parallel Notepad loader.
4. Preserve the existing coarse `LibraryCatalogThread.status` compatibility
   field while adding explicit durable resolution metadata for the new closed
   state set.
5. Keep `resolvedAgendaItemIds` and the rest of Front-of-House lifecycle
   derivation scoped to a play run.
6. Add deterministic tests for all resolution states, open default,
   relaunch-persistence separation, `threads.json` immutability, replay
   determinism, unrecognized process fallback, and loader/runtime regressions.
7. Update the viewer runtime schema and decoder tests to accept the optional
   resolution object. No viewer Notepad UI is implemented in this slice.

## Non-Goals

1. Do not edit the product-level `library-notepad-surface` plan.
2. Do not implement the viewer Notepad tab, lenses, badges, styling, or
   provenance links. That is issue #578.
3. Do not add cascade or triage producers. Until the companion cascade plan
   ships those producers, this slice covers their states with fixture Ledger
   events only.
4. Do not introduce new Ledger event types or mutate existing event schemas for
   `answer_recorded`, `residual_gap_recorded`, or `bundle_patch_applied`.
5. Do not rewrite `threads.json`, create a runtime projection file, or add
   per-feature JSON state.
6. Do not change `ax internal front-of-house ...` command semantics, stdout,
   stderr, or exit codes.
7. Do not change shipped plugin skills or workflows unless implementation
   discovers an actual guidance mismatch.
8. Do not write to `docs/alexandria/library/**`.

## Product-Plan Summary

The product plan separates two different shrinking concepts that have been
blurred:

1. Run-scoped agenda state: `resolvedAgendaItemIds` are scoped to one
   Front-of-House play run and reset when the play is relaunched.
2. Durable thread resolution: a question from `threads.json` can be settled by a
   ruling forever across play runs.

The N1 product contract is projection-only:

- the generated baseline is the authored thread set in `threads.json`;
- Ledger replay derives whether each thread has a durable resolution;
- no stored state is added;
- `threads.json` is never rewritten;
- matching is by `agendaItemId === thread.id`, not by current play run;
- a thread with no matching resolution event is `open`;
- process-actor machine settlements must never masquerade as director rulings.

The closed durable states for this slice are:

- `director-ruled`
- `settled-by-cascade`
- `settled-by-triage`
- `deferred-residual`
- `invalidated`

`invalidated` is a miss record rather than a director resolution, but it still
needs durable projection so the next viewer slice can render it outside the
open agenda.

## Current Gap

Verified against this checkout on 2026-07-02:

- `packages/ax/src/domain/library-catalog.ts` defines
  `LibraryCatalogThread.status` and optional `resolvingEventId`, and
  `parseLibraryCatalogThreads` preserves those fields when they are authored in
  `threads.json`.
- The catalog parser does not replay Ledger events, and authored lifecycle
  fields are not a durable projection.
- `packages/ax/src/effects/library-graph-loader.ts` parses `threads.json` and
  passes authored threads into `buildLibraryCatalog`. The loader only reads
  Ledger events today for bundle confirmation gates and draft-overlay section
  confirmations.
- `packages/ax/src/domain/library-front-of-house.ts` already derives
  `resolvedAgendaItemIds` from Ledger events, but that helper requires a
  `playRunId` and intentionally resets on relaunch.
- `library.front_of_house.answer_recorded`,
  `library.front_of_house.residual_gap_recorded`, and
  `library.front_of_house.bundle_patch_applied` event schemas already expose the
  payload fields needed for N1. No state-event schema change is required.
- `packages/viewer/src/app/runtime/schemas.ts` decodes `resolvingEventId` and a
  string `status`, but it does not know about durable resolution state metadata.
- Existing viewer Notepad rows still rely on coarse `status`; #578 should read
  the new resolution metadata rather than inventing a separate loader.

## Architectural Boundaries

1. Put durable Notepad resolution derivation in a pure AX domain helper, such as
   `packages/ax/src/domain/library-thread-resolution.ts`. Do not put this logic
   in React, runtime-server routing, or plugin prompts.
2. Keep `deriveFrontOfHouseLifecycle` play-run-scoped. N1 may share small event
   accessor helpers, but it must not make `resolvedAgendaItemIds` durable.
3. The catalog loader is the integration point. It should load Ledger events
   once in `loadLibraryCatalog`, use the same event list for gate metadata,
   draft-overlay section confirmations, and thread-resolution projection, then
   pass projected authored threads to `loadLibraryCatalogRoot` or a helper.
4. Preserve direct `loadLibraryCatalogRoot(projectRoot, libraryRoot)` behavior
   for tests and raw library browsing that intentionally do not load project
   storage. Add an optional `events` input rather than making every direct root
   load require a configured Ledger.
5. Project only from the loaded root's authored `threads.json` records. Derived
   fill-readiness threads remain open unless a future slice explicitly defines
   durable resolution for derived ids.
6. Use `bundlePath` when an event provides it, especially for
   `residual_gap_recorded` and `bundle_patch_applied`. For
   `answer_recorded`, the current schema has no `bundlePath`, so N1 must follow
   the issue contract and match by thread id.
7. Keep `LibraryCatalogThread.status` as a coarse compatibility field:
   `open` when no durable resolution exists, `residual` for
   `deferred-residual`, and non-open compatibility status for the other durable
   states. The precise state lives in the new resolution metadata and is what
   #578 should consume.
8. Ignore stale authored lifecycle state for the projection. A thread with no
   matching Ledger event is open even if old `threads.json` content contains
   `status` or `resolvingEventId`.
9. Do not broaden state-event schemas or introduce new event types. Add typed
   parser/accessor helpers only if they reduce duplicated payload-string reads.

## Resolution Contract

Add an explicit catalog-thread resolution shape in AX and mirror it in the
viewer runtime schema:

```ts
type LibraryCatalogThreadResolutionState =
  | "director-ruled"
  | "settled-by-cascade"
  | "settled-by-triage"
  | "deferred-residual"
  | "invalidated";

interface LibraryCatalogThreadResolution {
  state: LibraryCatalogThreadResolutionState;
  resolvingEventId: string;
  reason?: string;
  answerText?: string;
  patches?: Array<{ eventId: string; patchId: string }>;
}
```

Implementation may keep the shape narrower if no fixture can honestly populate a
field, but it must include at least `state`, `resolvingEventId`, and raw
`reason` for residual or machine-settlement events. Keep the existing top-level
`resolvingEventId` populated for compatibility.

Classifier precedence:

1. Consider only events whose non-empty `agendaItemId` matches an authored
   thread id in the loaded bundle/root.
2. `answer_recorded` with `actor.kind === "user"` projects
   `director-ruled`. Include `answerText` and any patch provenance found by
   joining `bundle_patch_applied.payload.answerEventId` to the answer event id.
3. `residual_gap_recorded` with reason prefix `invalidated by ruling ` projects
   `invalidated`. Preserve the full reason text.
4. `residual_gap_recorded` with reason prefix `settled by triage` projects
   `settled-by-triage`. The raw reason (which cites the ruling event ids) is
   preserved for #578; a structured cited-ids field arrives with the real
   triage producer (cascade plan S5), not before.
5. `residual_gap_recorded` with reason prefix
   `settled by frame ruling ` projects `settled-by-cascade`.
6. Ordinary `residual_gap_recorded` events that carry an item to
   `RESIDUAL-GAPS.md` project `deferred-residual`.
7. A process-actor machine-settlement reason that does not match a recognized
   prefix falls back to `settled-by-cascade`, never `director-ruled`. The
   negative test should use a process event with an intentionally unrecognized
   machine-settlement reason and assert the raw reason is preserved.
8. If multiple matching events exist for one thread, replay Ledger order and let
   the latest matching event win. Replaying the same event list twice must
   produce byte-for-byte equivalent JSON-serializable projection objects.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Thread-resolution domain | New `packages/ax/src/domain/library-thread-resolution.ts` or a tightly scoped addition near `library-catalog.ts` | Adds the pure projection helper, closed state constants, classifier, patch join, and coarse status mapping. |
| State-event accessors | `packages/ax/src/domain/state-events.ts` only if useful | Optional typed parsers for `answer_recorded` and `residual_gap_recorded`; no event type or schema changes. |
| Catalog domain model | `packages/ax/src/domain/library-catalog.ts` | Adds optional `resolution` metadata to `LibraryCatalogThread`, keeps top-level `resolvingEventId`, and documents that authored lifecycle fields are not the durable source of truth. |
| Catalog loader | `packages/ax/src/effects/library-graph-loader.ts` | Loads Ledger events for `loadLibraryCatalog`, applies projection to authored threads, preserves direct root loads without event storage, and avoids duplicate event reads. |
| Runtime API regression | `packages/ax/tests/runtime-server.test.ts` | Proves `/api/library/catalog` returns projected resolution and does not mutate `threads.json`. |
| AX domain tests | New or existing `packages/ax/tests/*thread-resolution*.test.ts`, plus focused `library-catalog.test.ts` updates if needed | Covers every state, open default, stale authored status ignored, relaunch separation, determinism, and process fallback. |
| Front-of-House lifecycle tests | `packages/ax/tests/library-front-of-house.test.ts` | Adds or retains an explicit regression that `resolvedAgendaItemIds` remains run-scoped while durable thread projection is cross-run. |
| Viewer runtime schema | `packages/viewer/src/app/runtime/schemas.ts` and `packages/viewer/src/app/runtime/client.test.ts` | Decodes optional resolution metadata so #578 can consume the one catalog dataset. No Notepad UI behavior changes in N1. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| AX catalog/runtime API | Existing catalog responses may now include `thread.resolution` and a projected `resolvingEventId`; coarse `status` is derived from Ledger projection rather than stale authored lifecycle fields. | Add AX domain and runtime API tests; update viewer runtime decoder tests. |
| `ax internal front-of-house ...` commands | No intended command behavior change. `resolvedAgendaItemIds` stays scoped to the active `playRunId`. | Keep or add tests proving relaunch resets run-scoped agenda state. No CLI help, output, or exit-code updates required. |
| Shipped `front-of-house-walk` skill/workflow | No intended file change. Current guidance already says director answers bank as Ledger events and residuals are carried forward. | No plugin validation required unless implementation edits plugin files. If plugin files are touched, run plugin validation and the relevant Front-of-House evals. |
| Viewer Notepad UI | No N1 UI change. The next slice reads the new metadata from the existing catalog dataset. | No browser Notepad lens tests in N1 unless implementation touches UI components. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX thread-resolution domain | `cd packages/ax && bun test tests/library-thread-resolution.test.ts` | Proves every state, open default, stale authored fields ignored, replay determinism, and fallback classification. Use the actual test filename chosen during implementation. |
| AX catalog loader/runtime | `cd packages/ax && bun test tests/runtime-server.test.ts` | Proves `/api/library/catalog` exposes the projection, handles bundle/root parameters, and leaves `threads.json` byte-identical. |
| AX catalog model regression | `cd packages/ax && bun test tests/library-catalog.test.ts tests/library-catalog-threads.test.ts` | Proves parser/back-compat behavior and authored thread loading still work. |
| Front-of-House run-scoped lifecycle | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Proves `resolvedAgendaItemIds` still resets by `playRunId` while durable thread projection remains cross-run. |
| Event schema regression | `cd packages/ax && bun test tests/events.test.ts` | Confirms the existing event schemas still expose the fields the projection relies on. |
| AX typecheck/lint/format | `cd packages/ax && pnpm run typecheck && pnpm run lint && pnpm run format:check` | Catches TypeScript, Effect, lint, and formatting regressions in the AX package. |
| Viewer runtime decoder | `cd packages/viewer && bun test src/app/runtime/client.test.ts` | Proves the viewer client accepts the new optional resolution metadata. |
| Viewer package validation | `cd packages/viewer && pnpm run check && pnpm run build` | Catches schema/type drift in the viewer package. |
| Viewer browser regression if UI is touched | `cd packages/viewer && pnpm run test:e2e -- library-browser.spec.ts` | Only required if implementation edits viewer UI components; N1 should not need this. |
| Plugin validation if plugin is touched | `claude plugin validate ./packages/alexandria-plugin` | Only required if implementation edits shipped plugin files; N1 should not need this. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| AX deterministic catalog/runtime behavior | Covered by Bun domain and runtime tests, not by the agent eval harness. | Add deterministic tests in this slice; no eval-harness rerun required. | Commands listed in Deterministic Verification. |
| Viewer runtime decode | Covered by viewer unit tests, not eval harness. | Update `client.test.ts`; no eval-harness rerun required. | `cd packages/viewer && bun test src/app/runtime/client.test.ts` |
| Shipped Front-of-House skill/workflow | Existing eval guidance applies only if the shipped skill/workflow changes. | No eval rerun required unless implementation edits `packages/alexandria-plugin/skills/front-of-house-walk/**` or workflow files. | If plugin files are touched, use `pnpm eval -- list` to identify Front-of-House cases and run the relevant case(s); also run plugin validation. |
| Maintainer planning skill | Used only for this planning artifact. | No eval-harness coverage required for contributor workflow use. | None. |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Durable projection accidentally reuses run-scoped `resolvedAgendaItemIds`, recreating the relaunch reset bug. | Implement a separate thread-id projection helper with tests that compare `deriveFrontOfHouseLifecycle(events, newRunId)` against the durable projection for the same thread. |
| Stale authored `status` or `resolvingEventId` in `threads.json` keeps driving open/resolved state. | Overlay projection after parsing and test that a thread with stale authored lifecycle fields but no matching Ledger event projects open with no durable resolution. |
| Machine settlements are flattened into `director-ruled`, hiding agent/process decisions from QA. | Classify `director-ruled` only from `answer_recorded` with `actor.kind === "user"`; add a negative process-actor fallback test. |
| Existing ordinary residual events are misclassified as cascade settlements because AX records them with a process actor. | Use reason-marker precedence and explicitly classify ordinary `residual_gap_recorded` events as `deferred-residual`; reserve the cascade fallback for unrecognized machine-settlement reasons. |
| Duplicate thread ids across bundle roots could over-project an `answer_recorded` event because that event lacks `bundlePath`. | Scope projection to the loaded authored thread set, use `bundlePath` filters for event types that provide it, and document the remaining `answer_recorded` limitation. Do not introduce a new event schema in N1. |
| Loading events in `loadLibraryCatalogRoot` breaks raw root catalog tests that do not have project storage. | Keep direct root loading storage-free by default; pass events from `loadLibraryCatalog` through an optional parameter. |
| Event reads are duplicated for gate metadata, draft overlays, and resolution projection. | Load the event page once in `loadLibraryCatalog` and thread the array through the needed helpers. |
| The new resolution object breaks viewer decode or older consumers. | Make `resolution` optional, keep `status` and top-level `resolvingEventId`, update viewer runtime schemas and client tests. |
| `threads.json` immutability is only assumed, not proven. | Add a runtime or loader test that reads the exact bytes before and after catalog load and asserts equality. |

## Implementation Steps

1. Add the AX resolution state constants, type, and pure projection helper. Keep
   it independent from Front-of-House run-scoped lifecycle helpers.
2. Implement event extraction for:
   - `answer_recorded`: `event.id`, `actor.kind`, `agendaItemId`, `answerText`;
   - `residual_gap_recorded`: `event.id`, `actor.kind`, `agendaItemId`,
     `bundlePath`, `reason`;
   - `bundle_patch_applied`: `event.id`, `answerEventId`, `patchId`,
     `bundlePath`, `touchedCardPaths`.
3. Implement classifier precedence from the Resolution Contract. Preserve raw
   residual/machine reason text.
4. Join `bundle_patch_applied` events to `director-ruled` answers by
   `answerEventId` and include patch ids/event ids in the resolution metadata.
5. Add a helper that overlays projected resolution onto authored
   `LibraryCatalogThread` records:
   - no matching event yields `status: "open"` and no `resolution` or
     projected `resolvingEventId`;
   - a match sets `resolution`, top-level `resolvingEventId`, and the coarse
     compatibility `status`;
   - existing non-projection fields such as `question`, `reason`,
     `emittingMove`, `sourceEvidence`, `concerns`, and `missingSections` are
     preserved.
6. Refactor `loadLibraryCatalog` so it obtains Ledger events once when project
   storage is available and passes them into catalog root loading, gate status,
   draft overlay confirmation derivation, and thread projection.
7. Keep `loadLibraryCatalogRoot` usable without project storage by accepting an
   optional `events` argument that defaults to `[]`.
8. Ensure projection is applied only to authored `threads.json` records before
   `buildLibraryCatalog` dedupes and combines authored and derived threads.
9. Update AX domain tests:
   - one fixture each for `director-ruled`, `settled-by-cascade`,
     `settled-by-triage`, `deferred-residual`, and `invalidated`;
   - open default for no matching event;
   - process actor unrecognized machine-settlement reason falls back to
     `settled-by-cascade` and not `director-ruled`;
   - stale authored lifecycle fields are ignored without a matching event;
   - replaying the same ledger twice returns identical projection;
   - later matching events win deterministically.
10. Update Front-of-House lifecycle tests or add an integration-style test that
    demonstrates relaunch separation: an old answer event still projects the
    thread as durably resolved, while `resolvedAgendaItemIds(events, newRunId)`
    is empty for the relaunched run.
11. Update runtime/API tests by creating a temporary initialized project with a
    schema-declaring bundle, fixture `threads.json`, and fixture Ledger events.
    Assert `/api/library/catalog` returns the resolution states/event ids and
    that `threads.json` bytes before and after the request are identical.
12. Update viewer runtime schemas with optional resolution metadata and add a
    `client.test.ts` case that decodes every resolution state plus an older
    catalog without `resolution`.
13. Run the deterministic verification commands. If implementation touches
    viewer UI or plugin files despite the plan, run the conditional browser or
    plugin validation commands too.

## Acceptance / Exit Criteria

1. A thread with a matching `library.front_of_house.answer_recorded` event whose
   actor is `user` projects `resolution.state === "director-ruled"` and
   `resolvingEventId` equal to that event id.
2. Threads with matching process/machine fixture events project
   `settled-by-cascade`, `settled-by-triage`, and `invalidated` according to the
   documented reason prefixes.
3. A thread carried to `RESIDUAL-GAPS.md` by an ordinary residual event projects
   `deferred-residual`.
4. A thread with no matching Ledger event projects open, even if stale authored
   lifecycle fields exist in `threads.json`.
5. Relaunching a Front-of-House play run still resets
   `resolvedAgendaItemIds` for the new `playRunId`, while the catalog thread
   resolution projection remains settled by the old thread-id-matching Ledger
   event.
6. Loading or serving the catalog leaves `threads.json` byte-for-byte identical.
7. Replaying the same Ledger event list twice yields identical projected thread
   resolution output.
8. A process-actor event with an unrecognized machine-settlement reason never
   projects `director-ruled`; it falls back to `settled-by-cascade` and carries
   the raw reason text.
9. `/api/library/catalog` remains the single dataset for thread data and
   includes optional resolution metadata without requiring a new Notepad loader.
10. Existing catalog loader consumers still pass their regression tests, and the
    viewer runtime client decodes both old catalogs without `resolution` and new
    catalogs with it.
11. No implementation writes to `docs/alexandria/library/**`, no new stored
    projection file is created, and no plugin files are changed unless a real
    mismatch is found and validated.

## Deferred Follow-Ups

1. Issue #578: build the viewer Notepad tab, Generated/Resolved/Open lenses,
   burndown badge, and provenance links from the catalog thread dataset produced
   by N1.
2. Frame-ruling cascade S2: add the real producer for
   `settled-by-cascade` events using the `settled by frame ruling <eventId>`
   reason contract.
3. Frame-ruling cascade S5: add the real producer for
   `settled-by-triage` events and standardize how generalized ruling ids appear
   in the reason or payload.
4. Future invalidation producer: emit the reserved `invalidated by ruling
   <eventId>` reason marker and add process-improvement rollups for misses.
5. Consider a future additive event-schema migration that includes `bundlePath`
   on `answer_recorded`; N1 should not block on that because the issue contract
   is thread-id matching.
6. If derived fill-readiness thread ids need durable resolution later, define a
   separate contract for generated derived ids instead of silently including
   them in the authored `threads.json` projection.
