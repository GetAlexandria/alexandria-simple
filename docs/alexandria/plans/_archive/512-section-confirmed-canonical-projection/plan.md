# Issue 512 Technical Plan: Canonical Section Confirmed Projection

Issue: GitHub #512, "One canonical projection of the section_confirmed payload shape"
Date: 2026-07-01
Status: Ready for implementation after prerequisite check

## Goal

Consolidate the TypeScript projection of
`library.front_of_house.section_confirmed` into one canonical event reader.

The implementation should expose one schema-aligned projection type and one
`parseSectionConfirmed(event)` helper owned next to the event schema in
`packages/ax/src/domain/state-events.ts`. The Front-of-House readback and EL5
section-summary consumer should call that helper instead of maintaining their
own field-by-field payload readers.

This is a pure refactor for schema-valid events. The stored event payload shape,
state-event schema descriptor, Front-of-House run filter, EL5 run-scoped
selection, CLI output behavior, and prompt semantics stay unchanged.

## Ordering And Preconditions

This issue must land after the EL5 run-scoping fix from #500. The inspected
checkout already has the run-scoped selector
`latestAtomicCardSectionSummaryInputsByRunAndContextKey(events, playRunId)`.
Implementation should verify that helper is present before starting. If the
target branch still has a context-only selector, stop and land #500 first.

The issue text expects `AtomicCardSectionSummaryInput` to carry `playRunId`
after #500. The inspected checkout is run-scoped but the materialized
`atomic-card-section-summary.v1` JSON still omits `playRunId`. To preserve the
pure-refactor contract in this checkout, do not add `playRunId` to the
materialized EL5 prompt-input file as part of #512. If the implementation branch
already includes `playRunId` in that input, define the EL5 type as the canonical
projection plus `schemaVersion`. If it still omits `playRunId`, define it as
`Omit<FrontOfHouseSectionConfirmation, "playRunId">` plus `schemaVersion` and
record the `playRunId` prompt-input decision as a separate #500 follow-up.

## Scope

In scope:

- AX event schema module type and projection helper for
  `library.front_of_house.section_confirmed`.
- AX Front-of-House domain readback through
  `frontOfHouseSectionConfirmations(events, playRunId)`.
- AX EL5 section-summary projection through
  `atomicCardSectionSummaryInputForEvent(event)` and
  `latestAtomicCardSectionSummaryInputsByRunAndContextKey(events, playRunId)`.
- Type aliases or derived types that keep existing exported names available
  while removing duplicated field declarations.
- Deterministic tests proving both consumers still return the same values over
  populated, no-`scope`, wrong-run, and malformed fixtures.
- Event schema descriptor and Effect decode coverage proving the wire contract
  is unchanged.

Out of scope:

- Changing the `library.front_of_house.section_confirmed` stored payload shape.
- Adding, renaming, or removing any event payload field.
- Changing `scope` optionality.
- Changing `ax cards execute-plan` selection semantics beyond using the shared
  parser.
- Reintroducing a context-only EL5 selector.
- Changing Front-of-House command behavior, idempotency, or event emission.
- Changing `build-atomic-card` prompts, shipped plugin skills, eval cases, or
  Viewer behavior.
- Writing to `docs/alexandria/library`.

## Sources Read

- Root `CLAUDE.md` and `README.md`.
- `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md`.
- `EVALS.md`.
- Related plans:
  - `docs/alexandria/plans/500-el5-section-summary-run-scope/plan.md`
  - `docs/alexandria/plans/508-confirm-section-provenance-idempotency/plan.md`
  - `docs/alexandria/plans/503-front-of-house-context-casing/plan.md`
  - `docs/alexandria/plans/506-foh-agenda-fail-loudly/plan.md`
  - `docs/alexandria/plans/484-foh-held-back/plan.md`
- Current implementation and tests:
  - `packages/ax/src/domain/state-events.ts`
  - `packages/ax/src/domain/library-front-of-house.ts`
  - `packages/ax/src/domain/atomic-cards.ts`
  - `packages/ax/src/commands/cards.ts`
  - `packages/ax/src/commands/front-of-house.ts`
  - `packages/ax/tests/events.test.ts`
  - `packages/ax/tests/library-front-of-house.test.ts`
  - `packages/ax/tests/cards.test.ts`

## Product Plan Summary

There is no separate linked product-level plan. The GitHub issue is the product
contract for this refactor.

Front-of-House emits `library.front_of_house.section_confirmed` as the durable
handoff from the director-confirmed section walk to EL5 atomic-card drafting.
The event payload carries `playRunId`, `context`, `plane`, `prefLabel`,
`summary`, `cards`, `unknowns`, `answerEventId`, and optional `scope`.

Today that one shape is maintained in multiple places: the Effect payload
schema, Front-of-House TypeScript structs, EL5 prompt-input structs, and local
extractor bodies. The product goal is to keep the Effect schema as the wire
source of truth and derive all TypeScript consumers from one shared projection.

## Current Gap

`packages/ax/src/domain/state-events.ts` defines
`FrontOfHouseSectionConfirmedPayloadSchema`, but it is currently a private
`const`. The event schema descriptor and append/replay validation use it, but
domain consumers cannot derive a named TypeScript projection from it.

`packages/ax/src/domain/library-front-of-house.ts` declares
`FrontOfHouseSectionConfirmationPayload` and
`FrontOfHouseSectionConfirmed`. The reader
`frontOfHouseSectionConfirmations(events, playRunId)` filters events by type and
`playRunId`, then manually reads `context`, `plane`, `prefLabel`, `summary`,
`answerEventId`, `cards`, `unknowns`, and optional `scope`.

`packages/ax/src/domain/atomic-cards.ts` declares
`AtomicCardSectionSummaryInput` with a duplicate field set plus
`schemaVersion`. Its `atomicCardSectionSummaryInputForEvent(event)` manually
reads the same event fields, and
`latestAtomicCardSectionSummaryInputsByRunAndContextKey(events, playRunId)`
adds run-scoped latest-wins selection by canonical context key.

The two local readers are now close but not identical. In this checkout, the
EL5 reader strictly rejects missing or invalid `cards` and `unknowns` arrays,
while the Front-of-House helper filters array values and can coerce missing or
malformed arrays to empty arrays. Because the wire schema requires arrays of
strings, the canonical parser should be schema-aligned for valid events and the
tests should explicitly cover malformed missing required fields. If preserving
invalid-ledger array leniency is required, that decision must be made before
implementation because one canonical parser cannot preserve two divergent
invalid-event behaviors.

## Architectural Boundaries

- `state-events.ts` owns the wire schema and should own the canonical
  `section_confirmed` event projection type and parser.
- The canonical type should be derived from
  `FrontOfHouseSectionConfirmedPayloadSchema` with
  `Schema.Schema.Type<typeof FrontOfHouseSectionConfirmedPayloadSchema>`, then
  extended with `eventId`.
- `state-events.ts` must not import from `library-front-of-house.ts` or
  `atomic-cards.ts`; those modules may import the canonical type and parser.
  This preserves the current one-way dependency and avoids a domain import
  cycle.
- `frontOfHouseSectionConfirmations` keeps the Front-of-House run filter. The
  shared parser should not decide which run is relevant.
- `latestAtomicCardSectionSummaryInputsByRunAndContextKey` keeps the #500
  run-scoped selection and latest-wins map behavior. The shared parser should
  only project one event.
- The event schema descriptor returned by `ax inspect events schema --json`
  stays byte-for-byte equivalent for `section_confirmed`.
- Command execution remains deterministic Effect-based AX behavior. This slice
  should not introduce prompts, flags, new state files, or runtime migrations.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX state event domain | `packages/ax/src/domain/state-events.ts` | Export `FrontOfHouseSectionConfirmedPayloadSchema`, derive a payload type from it, define canonical `FrontOfHouseSectionConfirmation`, and add `parseSectionConfirmed(event)`. Stored schema and descriptors remain unchanged. |
| AX Front-of-House domain | `packages/ax/src/domain/library-front-of-house.ts` | Replace local `section_confirmed` payload interfaces with aliases to the canonical projection and replace the field-by-field extractor body with `parseSectionConfirmed`, retaining the `playRunId` filter. |
| AX atomic-card domain | `packages/ax/src/domain/atomic-cards.ts` | Derive `AtomicCardSectionSummaryInput` from the canonical projection plus `schemaVersion` or from an explicit `Omit<..., "playRunId">` if preserving the current prompt-input shape. Replace `atomicCardSectionSummaryInputForEvent` field reads with `parseSectionConfirmed`. |
| AX cards command | `packages/ax/src/commands/cards.ts` | No intended behavior change. Existing `execute-plan` calls the run-scoped selector and should keep the same JSON output, summary file path, and `SECTION_SUMMARY` binding behavior. |
| AX Front-of-House command | `packages/ax/src/commands/front-of-house.ts` | No intended behavior change. Existing imports of `FrontOfHouseSectionConfirmed` should continue to compile through the alias. |
| AX tests | `packages/ax/tests/events.test.ts`, `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/tests/cards.test.ts`, or a focused new domain test | Add shared-projection and no-wire-change coverage. Preserve existing command tests. |
| Plugin and Viewer | No intended file changes | No product skill, workflow prompt, or Viewer behavior changes. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `ax internal front-of-house confirm-section` and FoH readback | No command contract change. Confirmed sections are read through the shared parser but keep the same run-scoped values for schema-valid events. | Keep or add domain tests for confirmed-section readback. No plugin validation unless plugin files are touched unexpectedly. |
| `ax cards execute-plan` | No CLI contract change. EL5 section summaries are selected by the existing run-scoped helper and projected through the shared parser. | Existing black-box cards tests must stay green; add focused tests only if current coverage does not assert the shared-projection matrix. |
| Shipped Alexandria plugin skills and workflows | No behavior change. | No eval-harness rerun required unless implementation unexpectedly edits `packages/alexandria-plugin`. |
| Viewer | No behavior change. | No Viewer validation required. |

## Behavior Contract

Add a single exported helper with this effective contract:

```ts
export type FrontOfHouseSectionConfirmedPayload =
  Schema.Schema.Type<typeof FrontOfHouseSectionConfirmedPayloadSchema>;

export interface FrontOfHouseSectionConfirmation
  extends FrontOfHouseSectionConfirmedPayload {
  eventId: string;
}

export function parseSectionConfirmed(
  event: AlexandriaStateEvent,
): FrontOfHouseSectionConfirmation | null;
```

The helper should:

1. return `null` when `event.type` is not
   `library.front_of_house.section_confirmed`;
2. read all required payload fields from the event payload;
3. require non-empty strings for the existing required string fields, matching
   current reader behavior;
4. require `cards` and `unknowns` to be arrays of strings for schema-aligned
   projection;
5. include `scope` only when it is a non-empty string, matching current reader
   output shape;
6. return `eventId: event.id` plus the payload fields, including `playRunId`;
7. avoid adding `schemaVersion`; EL5 adds that decoration itself.

Implementation may use `Schema.decodeUnknownEither` for the payload if it
proves the runtime behavior above remains compatible. Do not blindly replace
the current reader with Effect decoding if it changes empty-string or optional
`scope` handling.

Front-of-House should then be mechanically simple:

```ts
const parsed = parseSectionConfirmed(event);
return parsed != null && parsed.playRunId === playRunId ? [parsed] : [];
```

EL5 should decorate the same parsed projection:

```ts
const parsed = parseSectionConfirmed(event);
return parsed == null
  ? null
  : { ...projectedFields, schemaVersion: ATOMIC_CARD_SECTION_SUMMARY_SCHEMA_VERSION };
```

If the current branch still omits `playRunId` from
`atomic-card-section-summary.v1`, `projectedFields` should intentionally omit it
to avoid changing prompt-input JSON in this refactor.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Event schema and decode tests | `cd packages/ax && bun test tests/events.test.ts` | Proves `section_confirmed` schema descriptor, append validation, and Effect decode behavior remain stable. |
| Front-of-House projection tests | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Proves run-scoped FoH readback still returns the same confirmed section structs. |
| EL5 selector and prompt-input tests | `cd packages/ax && bun test tests/cards.test.ts` | Proves run-scoped EL5 selection, latest-wins behavior, `schemaVersion`, output JSON, and summary file side effects remain stable. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches alias/export mistakes across domain and command imports. |
| AX format check | `pnpm --filter @alexandria/ax run format:check` | Ensures TypeScript and test edits match repo formatting. |

Recommended broader regression if implementation touches more than the three
domain/test files:

```bash
pnpm --filter @alexandria/ax run test
pnpm --filter @alexandria/ax run lint
```

No Viewer validation is required unless files under `packages/viewer` change.
No plugin validation is required unless files under `packages/alexandria-plugin`
change.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX `section_confirmed` projection | Deterministic Bun tests cover event schemas, FoH readback, and EL5 summary materialization. | Add/adjust Bun tests; no LLM eval harness case required. | `cd packages/ax && bun test tests/events.test.ts tests/library-front-of-house.test.ts tests/cards.test.ts` |
| Shipped plugin skills and workflows | EL5 structural evals exist, but this slice should not change plugin prompts or skills. | No eval rerun required if plugin files are untouched. | None. |
| `build-atomic-card` prompt behavior | Existing eval cases can smoke prompt behavior, but the prompt input contract should not change here. | If implementation unexpectedly edits plugin workflow or prompt files, rerun EL5 evals. | `pnpm eval -- run atomic-card-creation/all` and `pnpm eval -- run build-atomic-card/all` |

This is a deterministic AX refactor, not a reusable agent or product-skill
behavior change. The correct quality gate is typecheck plus focused Bun tests.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The shared parser accidentally changes the stored event wire contract. | Do not edit schema fields or descriptors except to export the existing schema. Keep `events.test.ts` descriptor assertions and add an Effect decode round-trip for populated and no-`scope` payloads. |
| EL5 loses #500 run scoping during consolidation. | Keep the run filter in `latestAtomicCardSectionSummaryInputsByRunAndContextKey`; add tests where another run has a later same-context event and must not win. |
| Front-of-House loses its run filter because parsing moves to `state-events.ts`. | Keep `playRunId` comparison in `frontOfHouseSectionConfirmations`; test wrong-run events are ignored. |
| Type aliases break command imports that expect `FrontOfHouseSectionConfirmed`. | Preserve exported names in `library-front-of-house.ts` as type aliases to the canonical projection and run AX typecheck. |
| Adding `playRunId` to the materialized EL5 prompt-input JSON creates a behavior change. | Follow the precondition above. If the target branch already has that field, preserve it. If it does not, omit it from EL5 serialization in #512 and handle the product decision separately. |
| Strict schema-aligned array parsing changes behavior for legacy invalid ledgers that FoH previously coerced to empty arrays. | Tests should cover valid events and missing required fields. If invalid array compatibility is required, decide it explicitly before implementation because the current FoH and EL5 invalid-event semantics diverge. |
| Direct Effect decoding changes empty-string or optional `scope` behavior. | Either keep explicit runtime guards in `parseSectionConfirmed` or add characterization tests before switching to decoder-only parsing. |
| A second field-by-field extractor remains after the refactor. | Search for direct reads of `context`, `plane`, `prefLabel`, `summary`, `answerEventId`, `cards`, `unknowns`, and `scope` on `section_confirmed` events; replace consumer copies with `parseSectionConfirmed`. |

## Implementation Steps

1. Confirm the #500 precondition:
   - `packages/ax/src/domain/atomic-cards.ts` exports
     `latestAtomicCardSectionSummaryInputsByRunAndContextKey`;
   - `packages/ax/src/commands/cards.ts` passes a trusted
     `sectionSummaryPlayRunId`;
   - no context-only EL5 helper is used by `execute-plan`.

2. In `packages/ax/src/domain/state-events.ts`:
   - change `FrontOfHouseSectionConfirmedPayloadSchema` from private `const` to
     exported `const`;
   - add `FrontOfHouseSectionConfirmedPayload` derived with
     `Schema.Schema.Type<typeof FrontOfHouseSectionConfirmedPayloadSchema>`;
   - add canonical `FrontOfHouseSectionConfirmation` with `eventId`;
   - add `parseSectionConfirmed(event)`;
   - keep `STATE_EVENT_PAYLOAD_SCHEMAS` and `EVENT_SCHEMA_DESCRIPTORS`
     otherwise unchanged.

3. Implement `parseSectionConfirmed` with explicit guards unless decoder-only
   parsing is proven equivalent:
   - wrong event type returns `null`;
   - required strings must be non-empty strings;
   - `cards` and `unknowns` must be string arrays;
   - optional `scope` is omitted unless a non-empty string;
   - the returned object includes `playRunId` and `eventId`.

4. In `packages/ax/src/domain/library-front-of-house.ts`:
   - import `parseSectionConfirmed` and the canonical type from
     `state-events.ts`;
   - replace the local field declarations with type aliases, for example
     `export type FrontOfHouseSectionConfirmed = FrontOfHouseSectionConfirmation`;
   - keep `FrontOfHouseSectionConfirmationPayload` only as an alias to the
     schema-derived payload type if external code still imports the name;
   - rewrite `frontOfHouseSectionConfirmations` to call
     `parseSectionConfirmed(event)` and filter by `parsed.playRunId ===
     playRunId`;
   - leave unrelated payload helper functions in place for other FoH event
     readers.

5. In `packages/ax/src/domain/atomic-cards.ts`:
   - import `parseSectionConfirmed` and the canonical type;
   - redefine `AtomicCardSectionSummaryInput` from the canonical projection plus
     `schemaVersion`, or from an explicit `Omit<..., "playRunId">` plus
     `schemaVersion` if preserving current prompt-input JSON;
   - rewrite `atomicCardSectionSummaryInputForEvent` to call
     `parseSectionConfirmed(event)` and add `schemaVersion`;
   - keep `latestAtomicCardSectionSummaryInputsByRunAndContextKey` filtering by
     the requested `playRunId` before or after parsing, but ensure wrong-run
     events never enter the map;
   - preserve canonical context-key latest-wins behavior.

6. Update or add tests:
   - `events.test.ts`: assert the `section_confirmed` descriptor still lists the
     same required fields, optional `scope`, and `additionalProperties: false`;
     add Effect decode round-trip coverage for a payload with all fields and a
     payload without `scope`;
   - `library-front-of-house.test.ts`: assert
     `frontOfHouseSectionConfirmations` returns the same struct for a populated
     event, returns the same struct when `scope` is absent, ignores wrong-run
     events, and rejects a malformed event missing a required field;
   - `cards.test.ts` or a focused domain test: assert
     `atomicCardSectionSummaryInputForEvent` returns the same struct for a
     populated event, returns the same struct when `scope` is absent, rejects a
     malformed event missing a required field, and the latest-by-run-and-context
     helper preserves same-run latest-wins while ignoring other runs;
   - keep the existing `execute-plan` black-box summary tests green.

7. Search for leftover duplicated extraction:
   - use `rg` for `atomicCardSectionSummaryInputForEvent`,
     `frontOfHouseSectionConfirmations`, direct `section_confirmed` payload
     field reads, and local payload array/string helpers;
   - remove only the duplicate `section_confirmed` extraction logic, not helper
     functions still used by other event readers.

8. Run deterministic verification:
   - `cd packages/ax && bun test tests/events.test.ts`;
   - `cd packages/ax && bun test tests/library-front-of-house.test.ts`;
   - `cd packages/ax && bun test tests/cards.test.ts`;
   - `pnpm --filter @alexandria/ax run typecheck`;
   - `pnpm --filter @alexandria/ax run format:check`.

9. If any plugin files were touched unexpectedly, run:
   - `claude plugin validate ./packages/alexandria-plugin`;
   - `pnpm eval -- run atomic-card-creation/all`;
   - `pnpm eval -- run build-atomic-card/all`.

## Acceptance / Exit Criteria

1. `state-events.ts` exports one canonical schema-derived
   `section_confirmed` payload type, one canonical
   `FrontOfHouseSectionConfirmation` projection, and one
   `parseSectionConfirmed(event)` helper.
2. `FrontOfHouseSectionConfirmed` and `AtomicCardSectionSummaryInput` are
   derived from or explicitly alias the canonical projection instead of
   redeclaring every event field by hand.
3. `frontOfHouseSectionConfirmations` and
   `atomicCardSectionSummaryInputForEvent` both extract event fields through
   `parseSectionConfirmed`; no second field-by-field implementation remains.
4. The Effect wire schema and `ax inspect events schema --json` descriptor for
   `library.front_of_house.section_confirmed` are unchanged: same required
   fields, optional `scope`, and no additional properties.
5. Front-of-House confirmed-section readback remains run-scoped by `playRunId`.
6. EL5 section-summary selection remains run-scoped by `playRunId` and
   latest-wins by canonical context key within that run.
7. EL5 prompt-input files keep the same `schemaVersion` and field shape as the
   target branch before this refactor, unless the prerequisite branch already
   intentionally added `playRunId`.
8. Populated events, no-`scope` events, wrong-run events, and malformed events
   missing required fields produce the same FoH and EL5 results as the target
   branch before this refactor.
9. Focused AX tests and typecheck pass.

## Deferred Follow-Ups

1. Resolve the product-level `playRunId` prompt-input decision if #500's final
   implementation and #512's issue text remain out of sync.
2. If legacy invalid ledgers with malformed `cards` or `unknowns` must be
   supported, open a separate compatibility issue to define one accepted
   invalid-event behavior across FoH and EL5.
3. Consider a broader state-event projection helper pattern only after this
   narrow consolidation proves useful; do not generalize every event schema in
   this slice.
4. Add eval coverage only if a future change modifies shipped plugin prompt
   behavior around `SECTION_SUMMARY`; deterministic tests are sufficient for
   this refactor.
