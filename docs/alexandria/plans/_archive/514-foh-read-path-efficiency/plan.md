# Issue 514 Technical Plan: Front-of-House Read-Path Efficiency

Issue: GitHub `#514`, "Front-of-House read-path efficiency: resolve section items once, select keystone once, index residual mapping"
Date: 2026-07-01
Status: Ready for implementation

## Goal

Refactor three deterministic AX Front-of-House read paths so they reuse work
already available in memory:

1. `confirm-section` resolves the requested section once, derives plane/cards
   from that resolved section, and derives unknowns from a precomputed residual
   id set.
2. `prepare-agenda` selects the Front-of-House keystone once and threads that
   selection into headline construction.
3. `finalize` indexes agenda items once by id before mapping historical
   residual events.

This is a pure efficiency refactor. Command outputs, event payloads, file
contents, stdout/stderr, exit codes, and error precedence must remain
byte-for-byte compatible with current behavior.

Linked product plan: none separate from the issue body. The issue text and its
acceptance criteria are the product contract for this slice. The only issue
comment retrieved from GitHub records the Fabro local run
`01KWF1819MT9MR5EDVS3CBZ3PP` and adds no technical requirements.

## Scope

In scope:

- `packages/ax/src/domain/library-front-of-house.ts`
  - Add shared-slice section derivation helpers that accept an already-resolved
    `FrontOfHouseResolvedSectionAgendaContext` or its `items`.
  - Keep the existing public `deriveSectionPlaneForContext`,
    `deriveSectionCardsForContext`, and `deriveSectionUnknownsForContext`
    signatures as wrappers for existing callers and tests.
  - Extend `buildFrontOfHouseHeadline` with an optional preselected keystone
    parameter that can represent either a selected keystone or a known
    no-keystone result.
- `packages/ax/src/commands/front-of-house.ts`
  - Update `runConfirmSection` to use the already-resolved section and a single
    residual-id set.
  - Update `loadAgendaProjectionInput` to pass its single keystone selection
    into `buildFrontOfHouseHeadline`.
  - Update `runFinalize` to use a `Map` from agenda item id to agenda item
    inside residual event rendering.
- Deterministic AX tests covering unchanged behavior and the new helper
  contracts where useful.
- This plan file and normal implementation closeout notes.

Out of scope:

- Event schema changes.
- CLI flags, command names, help text, JSON field names, or status strings.
- Changes to `agenda.json`, `current-item.*`, `for-raven.md`, or
  `RESIDUAL-GAPS.md` formats.
- Changes to Front-of-House play choreography, Raven prompts, plugin skills, or
  EL5 atomic-card prompt behavior.
- Correctness issues tracked by neighboring FoH issues, including context
  casing semantics, explicit placement state, empty-card refusal, provenance
  hardening, and run-scoped section summaries.
- Performance benchmarking infrastructure. Existing deterministic tests and
  code review are sufficient for this refactor.
- Writing to `docs/alexandria/library/`.

## Sources Read

- Root `CLAUDE.md` and `README.md`.
- `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md`.
- `EVALS.md`.
- GitHub issue comments for `GetAlexandria/alexandria-internal#514`.
- Related plans:
  - `docs/alexandria/plans/504-foh-explicit-placement-state/plan.md`
  - `docs/alexandria/plans/506-foh-agenda-fail-loudly/plan.md`
  - `docs/alexandria/plans/508-confirm-section-provenance-idempotency/plan.md`
- Current implementation:
  - `packages/ax/src/commands/front-of-house.ts`
  - `packages/ax/src/domain/library-front-of-house.ts`
- Current tests:
  - `packages/ax/tests/library-front-of-house.test.ts`
  - `packages/ax/tests/library-front-of-house-bundle.test.ts`
  - adjacent finalize coverage in `packages/ax/tests/library-confirmation-cli.test.ts`
    and `packages/ax/tests/runtime-server.test.ts`

## Product Contract Summary

The issue identifies repeat work on the director-interactive EL3
Front-of-House path:

- `confirm-section` has already loaded the event page and currently resolves
  the section through each section derivation helper. The unknowns helper also
  recomputes the run residual set from the event store.
- `prepare-agenda` selects a keystone before reading the keystone markdown, then
  `buildFrontOfHouseHeadline` selects the same keystone again from the same
  catalog card set.
- `finalize` performs an `agenda.items.find(...)` for each residual event while
  scanning the ledger.

The required contract is compute-once/index-once with unchanged observable
behavior.

## Current Gap

Current HEAD already includes earlier Front-of-House hardening from Issues
`#504`, `#506`, and `#508`. The relevant current names differ slightly from
the issue's older line-number notes:

- `runConfirmSection` already calls `resolveSectionAgendaContext(agenda,
  options.context)` once before answer-event validation. That resolved section
  contains the shared `items` slice the command needs.
- The command then calls `deriveSectionPlaneForContext(agenda,
  section.contextKey)`, `deriveSectionCardsForContext(agenda,
  section.contextKey)`, and `deriveSectionUnknownsForContext({ agenda,
  context: section.contextKey, events: eventPage.events, playRunId:
  options.run })`.
- Each of those domain helpers calls `resolveSectionAgendaContext` again. That
  scans `agenda.items` and rebuilds context groups. `deriveSectionUnknownsForContext`
  also calls `residualAgendaItemIds(input.events, input.playRunId)`, which
  derives lifecycle from the already-loaded event page.
- `loadAgendaProjectionInput` calls `selectFrontOfHouseKeystone(catalog.cards)`
  to decide which card markdown to read, then passes only `cards` and
  `keystoneMarkdown` into `buildFrontOfHouseHeadline`. The headline helper
  calls `selectFrontOfHouseKeystone(input.cards)` again.
- `runFinalize` constructs historical residual output with
  `eventPage.events.flatMap(...)` and performs `agenda.items.find(...)` inside
  the loop. This is O(events x items) for that mapping.

Existing tests already cover the important behavior paths: `confirm-section`
happy path, idempotent replay, supersession, wrong answer actor,
cross-section answer rejection, empty unknowns, empty-card refusal,
unfiled-only refusal, same-context unfiled item success, multi-plane failure,
and finalize residual rendering. This slice should preserve those assertions
and add only focused helper or regression coverage for the refactor contract.

## Architectural Boundaries

- AX owns deterministic Front-of-House CLI behavior, domain projection helpers,
  event-log reads, and runtime artifact writes.
- The domain layer should expose pure shared-slice helpers. The command layer
  should decide when to resolve sections, read events, and reuse derived sets.
- Existing public helper signatures stay valid. Other callers and tests should
  not be forced to resolve sections manually.
- The new shared-slice helpers must preserve current error text and error
  precedence when reached through the existing wrappers.
- `runConfirmSection` should still resolve the requested section before answer
  validation, as current HEAD does. The unknown-context error must still fire
  once, before answer-event, plane, cards, or unknowns work.
- `deriveSectionPlaneForContext` must keep filed-item-only plane semantics from
  Issue `#504`, including the same no-filed-plane and multi-plane messages.
- `deriveSectionCardsForContext` must preserve agenda-order card collection and
  first-seen de-duplication.
- Unknown derivation must preserve section item order and include only item ids
  present in the precomputed residual set.
- `buildFrontOfHouseHeadline` must preserve standalone behavior when no
  preselected keystone parameter is supplied.
- In `buildFrontOfHouseHeadline`, `undefined` should mean "fallback to selecting
  from `cards`." A supplied `null` must mean "the caller already selected and
  found no keystone," so the helper must not re-select in that case.
- `runFinalize` should add a lookup index only. It must not de-duplicate,
  re-sort, or otherwise change `allResiduals`.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| FoH section derivation helpers | `packages/ax/src/domain/library-front-of-house.ts` | Add pure helpers that derive plane, cards, and unknowns from a resolved section/items slice and precomputed residual ids. Existing context-based helpers become wrappers. |
| FoH `confirm-section` command | `packages/ax/src/commands/front-of-house.ts` | Reuse the `resolveSectionAgendaContext` result already computed by the command; compute residual ids once before unknown derivation; keep command output and failure precedence unchanged. |
| FoH headline helper | `packages/ax/src/domain/library-front-of-house.ts` | Add `selectedKeystone?: FrontOfHouseSelectedKeystone | null` to `buildFrontOfHouseHeadline` input, with `undefined` as the only fallback-to-select signal. |
| FoH `prepare-agenda` loader | `packages/ax/src/commands/front-of-house.ts` | Pass the single `selectedKeystone` from `loadAgendaProjectionInput` into `buildFrontOfHouseHeadline`, avoiding the second selection. |
| FoH `finalize` command | `packages/ax/src/commands/front-of-house.ts` | Build `const agendaItemById = new Map(agenda.items.map((item) => [item.id, item]))` once and use `get` inside the event scan. |
| AX tests | `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts` | Preserve existing assertions and add focused checks for supplied-keystone behavior and zero/one/many residual rendering if not already covered clearly enough. |
| Plugin / Viewer | No intended file changes | No behavior change. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `ax internal front-of-house confirm-section` | No user-observable behavior change. The command reuses a resolved section slice and residual id set internally. | Existing black-box CLI tests should continue passing with unchanged assertions. Add focused regression coverage only where useful. |
| `ax internal front-of-house prepare-agenda` | No output change. The command avoids selecting the same keystone twice. | Existing `prepare-agenda` tests for keystone/no-keystone headline output must pass unchanged. |
| `ax internal front-of-house finalize` | No output change. Residual event mapping uses a `Map` instead of repeated `find`. | Existing residual markdown and JSON status tests must pass unchanged; add zero/one/many residual coverage if needed. |
| Shipped `front-of-house-walk` skill | No prompt or workflow behavior change. | No plugin validation or eval rerun required unless implementation unexpectedly edits plugin files. |
| Viewer | No change. | No Viewer validation required. |

## Implementation Details

### Section Shared-Slice Helpers

Add helper variants near the existing section derivation functions. Names are
implementation-choice, but keep their contracts explicit. One acceptable shape:

```ts
export function deriveSectionPlaneFromResolvedContext(
  section: FrontOfHouseResolvedSectionAgendaContext,
): string | Error;

export function deriveSectionCardsFromResolvedContext(
  section: FrontOfHouseResolvedSectionAgendaContext,
): string[];

export function deriveSectionUnknownsFromResolvedContext(input: {
  section: FrontOfHouseResolvedSectionAgendaContext;
  residualIds: ReadonlySet<string>;
}): string[];
```

Then make the existing wrappers thin:

```ts
export function deriveSectionPlaneForContext(agenda, context) {
  const section = resolveSectionAgendaContext(agenda, context);
  return section instanceof Error ? section : deriveSectionPlaneFromResolvedContext(section);
}
```

The cards and unknowns wrappers should follow the same pattern. The unknowns
wrapper remains responsible for deriving residual ids from `events` for
standalone callers.

`runConfirmSection` should use:

1. the existing `section` returned by `resolveSectionAgendaContext`;
2. the new plane helper on that `section`;
3. the new cards helper on that `section`;
4. `const residualIds = residualAgendaItemIds(eventPage.events, options.run)`
   or `deriveFrontOfHouseLifecycle(...).residualAgendaItemIds` exactly once;
5. the new unknowns helper on `{ section, residualIds }`.

Compute the residual id set after plane/cards and the empty-cards guard so
error paths that currently fail before unknown derivation do not do extra work.

### Keystone Selection Threading

Change `buildFrontOfHouseHeadline` input to:

```ts
export function buildFrontOfHouseHeadline(input: {
  cards: readonly LibraryCatalogCard[];
  keystoneMarkdown?: string | null;
  selectedKeystone?: FrontOfHouseSelectedKeystone | null;
}): FrontOfHouseHeadline
```

Inside the helper:

```ts
const selected =
  input.selectedKeystone === undefined
    ? selectFrontOfHouseKeystone(input.cards)
    : input.selectedKeystone;
```

This preserves standalone behavior while allowing `loadAgendaProjectionInput`
to pass the selected result, including `null`, without a second scan/sort.

### Finalize Residual Index

In `runFinalize`, build an index once after `agenda` is read:

```ts
const agendaItemById = new Map(agenda.items.map((item) => [item.id, item]));
```

Use:

```ts
const item = agendaItemById.get(eventPayloadString(event, "agendaItemId"));
```

inside the existing `eventPage.events.flatMap(...)`. Keep the rest of the
condition, residual object shape, lifecycle status check, and ordering exactly
as they are.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| FoH domain tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house.test.ts` | Covers pure headline, section derivation, lifecycle, and residual helpers. Add focused helper-contract tests here. |
| FoH black-box CLI tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house-bundle.test.ts` | Covers `prepare-agenda`, `confirm-section`, `finalize`, stdout/stderr, exit codes, event appends, and runtime artifact output. |
| Adjacent finalize integration checks | `pnpm --filter @alexandria/ax test -- tests/library-confirmation-cli.test.ts tests/runtime-server.test.ts` | Keeps broader finalize consumers green if touched behavior changes unexpectedly. |
| AX type safety | `pnpm --filter @alexandria/ax run typecheck` | Catches helper signature/import drift. |
| AX lint/format | `pnpm --filter @alexandria/ax run lint` and `pnpm --filter @alexandria/ax run format:check` | Keeps changed TypeScript/tests in package style. |
| Markdown lint | `pnpm run lint:markdown` | Validates this plan and any implementation notes if Markdown changes are included. |

Implementation should rely on existing black-box expectations for byte-for-byte
behavior where possible. Add or preserve tests for this matrix:

- `confirm-section` happy path with residual unknowns.
- `confirm-section` unknown-context exit `2`.
- `confirm-section` multi-plane exit `2`.
- `confirm-section` idempotent `already_appended` rerun.
- `prepare-agenda` with a keystone card.
- `prepare-agenda` without a keystone card.
- `finalize` with zero residual events.
- `finalize` with one residual event.
- `finalize` with many residual events, preserving markdown order.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX deterministic CLI/domain behavior | Covered by Bun tests in `packages/ax/tests/library-front-of-house.test.ts` and `packages/ax/tests/library-front-of-house-bundle.test.ts`; adjacent finalize coverage exists in `library-confirmation-cli.test.ts` and `runtime-server.test.ts`. | Add deterministic tests only as needed for the new helper contracts and residual-count matrix. No LLM eval harness coverage is required for pure CLI/domain refactoring. | Commands listed in Deterministic Verification. |
| Shipped `front-of-house-walk` skill | Structural eval metadata exists under `packages/ax/tests/eval-cases/front-of-house-walk/*`, but this slice should not edit plugin skill text or workflow prompts. | No eval rerun required if plugin files stay untouched. | None. |
| Plugin package integrity | Not affected unless implementation unexpectedly edits `packages/alexandria-plugin`. | If plugin files are touched unexpectedly, run plugin validation and check available FoH eval cases before merge. | `claude plugin validate ./packages/alexandria-plugin`; `pnpm eval -- list`; run any listed touched FoH eval case. |
| Viewer | No behavior change. | No Viewer validation required. | None. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The new shared-slice helpers subtly change section error text or which error wins. | Keep existing context-based helpers as wrappers around `resolveSectionAgendaContext`; in `runConfirmSection`, keep the current order: agenda run check, section resolve, answer event validation, plane, cards, empty-card guard, unknowns. Existing unknown-context and multi-plane black-box tests must pass unchanged. |
| `buildFrontOfHouseHeadline` treats supplied `null` like absence and reselects anyway. | Use `input.selectedKeystone === undefined` as the fallback check. Add a unit test proving a supplied keystone/null controls the helper instead of reselecting. |
| The command still imports only the old section derivation helpers, so the redundant scans remain despite new helpers. | Update `runConfirmSection` imports and calls in the same slice. Use code review/static search for `deriveSection*ForContext(agenda, section.contextKey)` in `front-of-house.ts`. |
| Residual ids are computed before earlier validation failures, adding unnecessary work or changing observable failure timing if a future residual helper can fail. | Compute residual ids only immediately before unknown derivation, after plane/cards and empty-card validation. The current helper is pure, but this preserves the current command shape. |
| The `finalize` `Map` changes residual ordering by accidentally iterating the map. | Build the map only for lookup. Continue iterating `eventPage.events.flatMap(...)` for historical residuals and keep `allResiduals = [...gaps, ...historicalResiduals]`. Add a many-residual markdown-order assertion. |
| Tests become implementation-count brittle. | Prefer helper-contract tests and static review over monkey-patching call counts. The critical acceptance is the code path structure plus unchanged outputs. |
| A previous FoH issue's helper names or placement semantics are accidentally reverted. | Base implementation on current HEAD names: `resolveSectionAgendaContext`, `FrontOfHouseResolvedSectionAgendaContext`, `isFiledAgendaItem`, `findFrontOfHouseAnswerEventForSection`, and latest section confirmation helpers. Do not reintroduce older sentinel/string-filter behavior. |

## Implementation Steps

1. In `packages/ax/src/domain/library-front-of-house.ts`, add pure helpers that
   accept a resolved section/items slice for plane and card derivation.
   Preserve:
   - filed-item-only plane derivation;
   - no-filed-plane error text;
   - multi-plane error text and sorted plane list;
   - agenda-order card collection;
   - first-seen card-path de-duplication.

2. Add a pure unknowns helper that accepts a resolved section/items slice and a
   `ReadonlySet<string>` of residual ids. It should return item ids in section
   item order.

3. Rewrite the existing `deriveSectionPlaneForContext`,
   `deriveSectionCardsForContext`, and `deriveSectionUnknownsForContext`
   functions as wrappers:
   - resolve the section once inside each wrapper for existing standalone
     callers;
   - return the same `Error` objects/messages on unknown context;
   - in the unknowns wrapper, derive residual ids once and pass the set to the
     shared helper.

4. Update `runConfirmSection` in
   `packages/ax/src/commands/front-of-house.ts`:
   - keep the existing single `resolveSectionAgendaContext` call;
   - use the new shared-slice plane and cards helpers with `section`;
   - keep the empty-card refusal after cards derivation;
   - compute the residual id set once after the empty-card guard;
   - use the new shared-slice unknowns helper;
   - preserve existing JSON output construction, event payload, idempotency,
     `already_appended` branch, `superseded` branch, and diagnostics.

5. Extend `buildFrontOfHouseHeadline` with `selectedKeystone?: ... | null`.
   Use an explicit `undefined` check for fallback selection.

6. Update `loadAgendaProjectionInput`:
   - keep the current first `selectFrontOfHouseKeystone(catalog.cards)`;
   - keep reading markdown from `selectedKeystone.cardPath` when present;
   - pass `selectedKeystone` into `buildFrontOfHouseHeadline`;
   - preserve the current catch-to-empty-string behavior for keystone markdown
     read failure.

7. Update `runFinalize`:
   - create `agendaItemById` once from `agenda.items`;
   - replace only the inner `agenda.items.find(...)` with `agendaItemById.get(...)`;
   - keep the lifecycle status check and residual object projection unchanged.

8. Update domain tests:
   - preserve existing section derivation tests unchanged where possible;
   - add direct tests for the shared-slice helpers only if exported;
   - add a headline test proving supplied `selectedKeystone` is used without
     reselecting, and a supplied `null` does not reselect.

9. Update bundle tests only where coverage is missing:
   - keep existing `confirm-section` happy, unknown-context, multi-plane,
     and `already_appended` assertions unchanged;
   - ensure `prepare-agenda` with and without keystone still writes identical
     headline output;
   - add or refine finalize coverage for zero, one, and many residual events,
     checking `residualGapCount` and `RESIDUAL-GAPS.md` ordering/content.

10. Run deterministic verification. If any command is unavailable for
    environment reasons, record the exact command and blocker in the
    implementation closeout.

## Acceptance / Exit Criteria

1. `runConfirmSection` calls `resolveSectionAgendaContext` for the requested
   context once and passes the resulting section/items slice to plane, cards,
   and unknown derivation.
2. `runConfirmSection` computes the run residual-id set once for unknown
   derivation and does not call the context-based unknowns wrapper with
   `eventPage.events`.
3. Existing context-based section helper exports remain available and keep
   current behavior for standalone callers and tests.
4. Unknown-context, no-filed-plane, multi-plane, empty-card, cross-section
   answer, and idempotent `already_appended` behavior match current outputs and
   exit codes.
5. `prepare-agenda` calls `selectFrontOfHouseKeystone(catalog.cards)` once in
   `loadAgendaProjectionInput`, and `buildFrontOfHouseHeadline` does not
   reselect when `selectedKeystone` is supplied, including supplied `null`.
6. `buildFrontOfHouseHeadline` still selects internally when called without
   `selectedKeystone`.
7. `runFinalize` builds an agenda item `Map` and performs no
   `agenda.items.find` inside the residual event `flatMap`.
8. `RESIDUAL-GAPS.md` content and ordering are unchanged for zero, one, and
   many residual events.
9. `section_confirmed` payloads, `prepare-agenda` runtime files, finalize JSON
   output, stdout/stderr, and exit codes are unchanged.
10. No plugin, Viewer, event schema, or `docs/alexandria/library` files are
    changed.
11. Deterministic verification passes, or environment-only blockers are
    documented with exact command output.

## Deferred Follow-Ups

1. If another command later needs section plane/cards/unknowns from a resolved
   section, reuse the new shared-slice helpers rather than adding more
   context-based wrappers.
2. If future performance work needs measurable budgets for FoH command latency,
   add a separate benchmark or fixture-scale regression issue. This slice is
   intentionally structural and behavior-preserving.
3. If plugin guidance is later changed to describe these internal efficiencies,
   pair that prompt change with the relevant Front-of-House structural eval
   review. No plugin wording is needed for this refactor.
