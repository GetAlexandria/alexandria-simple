# Issue 503 - Front-of-House Context Casing Canonicalization

Status: implementation plan, 2026-07-01.

Issue: GitHub #503, "Canonicalize Front-of-House context casing in the data
model".

Run ID: `01KWDR515M5J5KATN1PQ3S8A21`.

Goal: give Front-of-House `context` one derived canonical matcher key while
preserving the authored context string on agenda items and
`library.front_of_house.section_confirmed` events. `confirm-section` and the EL5
section-summary lookup must compare canonical keys, so a director can relay the
displayed lowercased container name and EL5 still receives the prior when casing
or edge whitespace drift.

Linked product-plan summary: this is a root-cause fix for the
Front-of-House methodology reshape in
`docs/alexandria/plans/front-of-house-walk-reshape/plan.md` and `walk-spec.md`.
The reshape made `context` the section/container unit, added the headline
container view, and made `section_confirmed` the human-language prior EL5
inherits. Prior slices #480, #482, #484, #485, and #493 left a split-brain
contract: headline/container rendering normalizes names with
`normalizeFrontOfHouseHeadlineName(value.trim().toLowerCase())`, while
confirmation and EL5 match raw authored strings.

## Scope

This slice is a deterministic `packages/ax` data-model and CLI behavior change.

In scope:

1. Define a single Front-of-House context canonicalization helper:
   `context.trim().toLowerCase()`. Do not normalize internal whitespace, do not
   fold punctuation, and do not introduce fuzzy matching.
2. Add an explicit derived context identity to the Front-of-House agenda model:
   the authored `context`, a canonical matcher key, and a display label.
3. Keep authored context strings in stored source data and Ledger events. The
   derived key is not a replacement for `context`, and no new
   `section_confirmed` event payload field is added.
4. Update `sectionAgendaItemsForContext` and the public section helpers
   (`deriveSectionPlaneForContext`, `deriveSectionCardsForContext`,
   `deriveSectionUnknownsForContext`) so they resolve an input context to the
   canonical agenda group once and then operate on that group.
5. Update `ax internal front-of-house confirm-section` so `--context` is
   canonicalized on input, resolves to the agenda's authored context group, and
   stores/returns the resolved authored context while using the canonical key for
   duplicate detection and idempotency.
6. Update EL5 section-summary selection so
   `latestAtomicCardSectionSummaryInputsByRunAndContext` keys summaries by the
   canonical context key derived from the event payload, and `cards execute-plan`
   looks up the target card by the canonical key derived from
   `contract.targetCard.context`.
7. Add deterministic unit and black-box CLI coverage for the full #503 matrix:
   uppercase-authored context confirmed via displayed lowercase, authored vs
   display case both resolve, EL5 case drift, EL5 trailing-whitespace drift,
   genuinely distinct names do not match, idempotent re-fold, and already
   lowercase regression.

## Non-Goals

1. Do not change the `library.front_of_house.section_confirmed` event schema or
   add a `contextKey` event payload field.
2. Do not migrate or rewrite existing Ledger events.
3. Do not replace authored `context` values on agenda items, section summary
   inputs, atomic card contracts, or card frontmatter with lowercased values.
4. Do not collapse internal whitespace. `Library Operations` and
   `Library  Operations` remain distinct canonical keys.
5. Do not change `plane` validation, plane sentinels, or placement-state
   modeling; those are separate follow-ups called out by the issue.
6. Do not change shipped plugin prompts, Raven skill wording, or workflow graph
   in this slice.
7. Do not write to `docs/alexandria/library/`.

## Current Gap

`packages/ax/src/domain/library-front-of-house.ts` already exports
`normalizeFrontOfHouseHeadlineName(value)`, which trims and lowercases. It is
used by the headline/container path:

1. `containerRowsFromCards` lowercases `card.context` and `card.plane`.
2. `selectFrontOfHouseKeystone` and `namedContainersFromKeystoneMarkdown`
   lowercase keystone context, altitude, plane, and wikilink targets.
3. `renderFrontOfHouseHeadlineMarkdown` therefore shows lowercased container
   names that are natural to copy back into the CLI.

The matcher paths do not use that identity:

1. `sectionAgendaItemsForContext(agenda, context)` filters with
   `item.context === context`.
2. `deriveSectionPlaneForContext`, `deriveSectionCardsForContext`, and
   `deriveSectionUnknownsForContext` all inherit that raw equality.
3. `runConfirmSection` passes `options.context` directly to those helpers,
   stores `options.context` in the event payload, checks existing confirmations
   with `section.context === options.context`, and builds the idempotency key from
   raw input.
4. `latestAtomicCardSectionSummaryInputsByRunAndContext` stores summaries in a
   `Map` keyed by raw `input.context`.
5. `cards execute-plan` reads with
   `sectionSummariesByContext.get(contract.targetCard.context)`.

That means an authored agenda context `Library Operations` can render in the
headline as `library operations`, but `confirm-section --context "library
operations"` returns "Unknown front-of-house context". EL5 similarly drops a
valid prior when the section event and target card context differ only by case or
leading/trailing whitespace.

## Architectural Boundaries

`packages/ax` owns this slice. Keep command execution deterministic,
non-interactive, and modeled as `Effect` programs returning `CliResult`.

The canonical key belongs in the Front-of-House context data model, not as an
ad hoc lowercase at every call site. Implement one helper and one identity shape
near the existing FoH agenda types:

```ts
export type FrontOfHouseContextKey = string;

export interface FrontOfHouseContextIdentity {
  context: string; // authored source value
  contextKey: FrontOfHouseContextKey;
  contextDisplayLabel: string;
}
```

The helper contract:

1. `canonicalFrontOfHouseContextKey(value)` returns `value.trim().toLowerCase()`.
2. `frontOfHouseContextDisplayLabel(value)` returns the same lowercased form for
   contexts rendered by the current headline/container path, preserving today's
   visible headline strings.
3. `frontOfHouseContextIdentity(context)` returns the authored `context` plus the
   two derived fields.
4. `normalizeFrontOfHouseHeadlineName` should either be renamed to this helper
   with a compatibility export, or call into it, so the headline display path and
   matcher key cannot drift.

Projection and parse boundaries should populate derived fields:

1. `buildFrontOfHouseAgenda` derives `contextKey` and `contextDisplayLabel` from
   each agenda item's authored placement context.
2. `parseFrontOfHouseAgenda` derives the fields for legacy agenda JSON that lacks
   them, and validates present fields against the single helper. A mismatch
   should fail parsing rather than silently trusting stale derived data.
3. `parseFrontOfHouseCurrentItem` inherits the same parser behavior because it
   parses the embedded agenda item through `parseFrontOfHouseAgenda`.
4. Headline container projection should carry an explicit key/display pair too.
   Keep existing headline/container rendered strings unchanged; if the existing
   serialized `headline.containers[].context` remains lowercased for backward
   compatibility, add `contextKey` and `contextDisplayLabel` additively and make
   renderers consume the display label.

Section matching should have one resolver:

1. Add a helper such as `resolveSectionAgendaContext(agenda, inputContext)` that
   canonicalizes the input once, groups agenda items by `item.contextKey`, and
   returns `{ contextKey, context, contextDisplayLabel, items }`.
2. `context` in that result is the stable authored context to persist in
   `section_confirmed`. Use the first agenda item in agenda order for that group;
   if multiple authored spellings collapse to one key, keep the first stable
   value and test that the result is deterministic.
3. Unknown-context errors should list display labels or authored labels grouped
   by canonical key, sorted deterministically. The error remains exit code `2`
   in the CLI.
4. Ambiguous-plane detection still works after canonical grouping: if a canonical
   context group spans multiple planes, return the current ambiguity error.

`confirm-section` should resolve once and then use the resolved group:

1. Validate `summary-file`, `scope-file`, agenda run id, and user answer event as
   it does today.
2. Resolve `options.context` through `resolveSectionAgendaContext`.
3. Use the resolved `context` when writing the event payload and CLI JSON output,
   so a displayed lowercase input still stores the authored agenda context.
4. Detect existing confirmations by canonical key, not raw `section.context`.
5. Use the canonical key in the idempotency key, for example
   `foh:section-confirmed:${run}:${contextKey}`, so authored-case and
   display-case retries converge on the same event.
6. Keep the human text output stable except for printing the resolved context
   where the raw input used to appear.

EL5 should use the same key helper without changing stored event data:

1. `atomicCardSectionSummaryInputForEvent` keeps returning the authored
   `context` from the event payload.
2. Rename or clearly document
   `latestAtomicCardSectionSummaryInputsByRunAndContext` so the `Map` key is the
   canonical Front-of-House context key, not the raw context string. A clearer
   name such as `latestAtomicCardSectionSummaryInputsByRunAndContextKey` is
   preferred if the call sites are local.
3. Inside that function, derive the key from `input.context` with the shared FoH
   helper.
4. In `cards execute-plan`, derive `targetContextKey` from
   `contract.targetCard.context` with the same helper and read the map with that
   key.
5. Preserve latest-wins behavior inside one run after canonicalization: two
   events in the same run whose contexts differ only by case or edge whitespace
   are the same logical section, and the later event wins.
6. Preserve run scoping. This issue composes with run scoping; it does not
   replace it.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| FoH context identity | `packages/ax/src/domain/library-front-of-house.ts` | Introduce the canonical context key/display label helper and data-model fields; make headline normalization call the same helper |
| FoH agenda parser/projection | `packages/ax/src/domain/library-front-of-house.ts` | Fresh agendas carry derived context identity; legacy agendas derive it at parse time; malformed derived keys fail loudly |
| FoH section helpers | `packages/ax/src/domain/library-front-of-house.ts` | Context lookups resolve canonical-to-canonical instead of raw `===` |
| FoH CLI | `packages/ax/src/commands/front-of-house.ts` | `confirm-section --context` accepts displayed lowercase, authored case, and edge-whitespace variants; output/event use resolved authored context; duplicate/idempotency checks use canonical key |
| EL5 section summary domain | `packages/ax/src/domain/atomic-cards.ts` | Section summary maps are keyed by canonical FoH context key while summary payloads keep authored context |
| EL5 execute-plan command | `packages/ax/src/commands/cards.ts` | Target card context is looked up by canonical key so case/edge-whitespace drift still materializes `SECTION_SUMMARY` |
| FoH unit tests | `packages/ax/tests/library-front-of-house.test.ts` | Cover canonical key idempotency, edge trim, internal-whitespace negative, section helper resolution, parser derivation/validation, and all-lowercase regression |
| FoH black-box CLI tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Cover `confirm-section` displayed-name success, authored/display retry idempotency, duplicate conflict by canonical key, unknown distinct context exit code, and unchanged stored authored context |
| EL5 command tests | `packages/ax/tests/cards.test.ts` | Cover case-drift prior, trailing-whitespace prior, canonical latest-wins, distinct-context negative, and existing source-only regression |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Shipped `front-of-house-walk` skill | No prompt, workflow, or skill file change | No plugin validation or FoH skill eval rerun required unless implementation expands scope into plugin files |
| Raven FoH runtime inputs | Generated agenda/current-item data gains explicit context identity; headline/container visible strings should remain unchanged | Deterministic AX tests assert the generated JSON/markdown behavior |
| `confirm-section` CLI | Same command and options; `--context` now resolves case-insensitively after trimming edge whitespace | Black-box tests assert exit code `0` for authored/display case and exit code `2` for genuinely distinct names |
| EL5 `cards execute-plan` | `SECTION_SUMMARY` is materialized when context drift is only case or edge whitespace | Existing fake-Fabro black-box tests in `cards.test.ts` assert output fields and generated section-summary file |
| Ledger events | No schema change; event payload `context` remains authored | Event schema tests remain regression-only |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| FoH domain tests | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Proves canonical helper, agenda identity projection/parser behavior, section helper matching, negative internal-whitespace behavior, and all-lowercase regression |
| FoH CLI black-box tests | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Proves `confirm-section` exit codes, important JSON output fields, idempotency, event payload preservation, and no bundle card writes |
| EL5 cards tests | `cd packages/ax && bun test tests/cards.test.ts` | Proves `execute-plan` materializes or omits `SECTION_SUMMARY` with canonical context matching, run scoping, latest-wins, and source-only regression |
| Event schema regression | `cd packages/ax && bun test tests/events.test.ts` | Confirms `library.front_of_house.section_confirmed` payload schema did not gain a persisted key |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches interface changes across commands/domain/tests |
| AX format check | `pnpm --filter @alexandria/ax run format:check` | Keeps changed TypeScript in package style |

Minimum handoff gate: the three focused AX test files
`library-front-of-house.test.ts`, `library-front-of-house-bundle.test.ts`, and
`cards.test.ts`. Any skipped wider checks must be named with the reason.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| `packages/ax` deterministic FoH and EL5 behavior | Covered by Bun unit and black-box CLI tests | Add deterministic tests in this slice | Commands listed above |
| Shipped `front-of-house-walk` skill/workflow | Eval cases exist under `packages/ax/tests/eval-cases/front-of-house-walk`, but this slice does not edit plugin prompts or workflow graph | No eval-harness rerun required for #503 | None |
| Shipped `build-atomic-card` workflow/skill | Existing eval case expects optional `__AX_INPUT_SECTION_SUMMARY__`, but this slice changes deterministic materialization, not prompt instructions | No eval-harness rerun required unless implementation edits `packages/alexandria-plugin/workflows/build-atomic-card/*` or `skills/atomic-card-production/*` | None |
| Contributor planning skill | Used to produce this plan only | No eval-harness coverage required | None |

Rationale: the behavior change is deterministic AX data projection and command
matching. It changes whether existing generated inputs are present, but it does
not change reusable agent or skill instructions. If implementation discovers a
needed plugin prompt or workflow edit, the scope must be updated and the relevant
FoH or atomic-card eval rerun must be added before merge.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The fix becomes scattered lowercase calls instead of a data-model key | Add one exported helper plus agenda identity fields; make matchers read `contextKey` and tests assert parser validation of mismatched derived keys |
| Confirming with display case stores the display/lowercase string in the event, losing authored source identity | Resolve the canonical group first and persist the resolved agenda `context`; black-box tests assert event payload context remains authored |
| Authored-case retry and display-case retry append duplicate `section_confirmed` events | Existing-confirmation lookup and idempotency key both use canonical key; tests confirm one event after both invocations |
| Canonical grouping hides a real ambiguity when two planes share the same context key | Keep the existing ambiguous-plane error after canonical grouping and add a unit test |
| Internal whitespace is accidentally collapsed by reusing `normalizeLabel` from atomic cards | Do not use the atomic-card label normalizer; add a negative test for `Library Operations` vs `Library  Operations` |
| Headline/container visible strings drift while adding display-label fields | Route `normalizeFrontOfHouseHeadlineName` through the new helper and keep direct markdown/render tests for existing lowercased output |
| EL5 case-drift tests fail before lookup because plan validation requires the confirmed stub and target card to match exactly | Build fixtures where the confirmed stub and plan agree with each other while the FoH event uses different case/edge whitespace; leave stub/plan exact-match validation intact |
| Later same-run events with case variants stop being latest-wins | Key the latest map by canonical key and add a same-run case-variant latest-wins test |
| Event schema is accidentally expanded with `contextKey` | Do not touch state event schemas except tests; run `tests/events.test.ts` as a regression gate |

## Implementation Steps

1. Add the context identity helper in `library-front-of-house.ts` near the
   existing agenda types. Keep `normalizeFrontOfHouseHeadlineName` as a
   compatibility export that delegates to the new canonical/display helper.

2. Extend Front-of-House agenda types:
   add `contextKey` and `contextDisplayLabel` to `FrontOfHouseAgendaItem`, and
   add equivalent key/display fields to `FrontOfHouseHeadlineContainer` if the
   headline container shape is serialized. Keep existing `context` fields
   authored or backward-compatible as appropriate; never replace event payload
   `context`.

3. Populate derived identity at projection boundaries:
   update `buildFrontOfHouseAgenda`, `containerRowsFromCards`, and any helper
   that constructs headline containers or agenda items. Keep headline rendering
   byte-for-byte compatible for current lowercase output.

4. Update parsers:
   `parseFrontOfHouseAgenda` derives missing context identity for legacy agenda
   files and validates provided `contextKey` / `contextDisplayLabel` against the
   helper. `parseFrontOfHouseCurrentItem` should need no separate logic beyond
   the agenda parser path.

5. Replace raw section matching:
   introduce `resolveSectionAgendaContext` and make
   `deriveSectionPlaneForContext`, `deriveSectionCardsForContext`, and
   `deriveSectionUnknownsForContext` use it. Preserve current cards/unknowns
   ordering after the group is resolved.

6. Update `runConfirmSection`:
   resolve `options.context` once, use the resolved authored context for
   payload/output, compare existing confirmations by canonical key, and build the
   append idempotency key from the canonical key.

7. Update EL5 summary selection:
   import or otherwise reuse the single FoH context-key helper in
   `atomic-cards.ts` and `cards.ts`; key latest summaries by canonical key and
   look up each contract with the canonical target-card key. Preserve
   `AtomicCardSectionSummaryInput.context` as the authored event value.

8. Add focused unit tests in `library-front-of-house.test.ts`:
   canonical helper idempotency, trim-only edge whitespace, internal-whitespace
   negative, uppercase agenda context resolved by lowercase input, authored and
   display case returning the same plane/cards/unknowns, ambiguous planes after
   canonical grouping, parser derivation for legacy agenda items, parser failure
   for mismatched provided keys, and all-lowercase regression.

9. Add black-box `confirm-section` tests in
   `library-front-of-house-bundle.test.ts`:
   confirm an authored uppercase context using the displayed lowercased name;
   retry with authored case and assert `already_appended`; attempt the same
   canonical section with a different answer event and assert exit code `2`;
   pass a genuinely distinct context and assert the existing unknown-context
   failure with no event appended; assert bundle card bytes stay unchanged.

10. Add `cards.test.ts` EL5 cases:
    materialize the prior when the event context is `Library Operations` and the
    target card context is lowercase; materialize the prior when the event
    context has leading/trailing whitespace; keep source-only behavior for a
    genuinely different context; keep latest-wins inside the same run when event
    contexts differ only by case; keep other-run isolation.

11. Run the deterministic verification commands and report any skipped
    non-minimum checks explicitly.

## Acceptance / Exit Criteria

1. `confirm-section --context "library operations"` succeeds for an agenda whose
   authored context is `Library Operations`, and it does not emit "Unknown
   front-of-house context".
2. `confirm-section` resolves the same section for authored case, displayed
   lowercase, and leading/trailing whitespace variants.
3. A display-case confirmation stores the resolved authored context in the
   `section_confirmed` event payload and in JSON output.
4. Authored-case and display-case retries are idempotent: one logical section
   confirmation event exists, and a conflicting answer event for the same
   canonical context is rejected with exit code `2`.
5. EL5 `cards execute-plan` materializes `SECTION_SUMMARY` when
   `contract.targetCard.context` differs from the FoH-confirmed context only by
   case.
6. EL5 materializes `SECTION_SUMMARY` when the FoH-confirmed context has leading
   or trailing whitespace relative to the target-card context.
7. Negative: a genuinely different context does not match in FoH confirmation or
   EL5 prior selection.
8. Negative: an internal-whitespace difference remains distinct.
9. Idempotency: canonicalizing an already canonical key returns the same string,
   and replaying the same event log selects the same prior every time.
10. Regression: a fully lowercase, already trimmed project confirms and
    materializes exactly the section/prior it does today.
11. Regression: headline/container display strings are unchanged.
12. Regression: `library.front_of_house.section_confirmed` event schema remains
    unchanged; no persisted `contextKey` field is introduced.
13. The focused AX tests pass, or any skipped wider verification command is
    explicitly named with a reason.

## Deferred Follow-Ups

1. Placement-state model / plane sentinel work from the related A1 issue.
2. EL5 run-scoping key work from C2, if additional isolation beyond the current
   play-run scope is required.
3. Plugin/Raven wording updates if a later methodology slice wants to expose the
   distinction between authored context, display label, and matcher key in the
   guided conversation.
4. Viewer display updates if the Viewer later renders FoH agenda context groups
   directly and needs the same display-label field.
