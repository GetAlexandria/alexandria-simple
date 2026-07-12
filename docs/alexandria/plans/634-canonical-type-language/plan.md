# Technical plan — Slice A: canonical type language

## Header

- Issue: [#634](https://github.com/GetAlexandria/alexandria-internal/issues/634) —
  "Reconcile card-type canon onto one source + bundle-level type mapping (library
  legibility Slice A)"
- Goal: make `atomic-card-categories.ts`'s ten ruled categories the single source
  that gates both diagram-eligibility and viewer color/legend, and let a bundle
  teach the viewer its own per-product type vocabulary (e.g. `Bet`/`Principle` →
  `Rationale`) as data, with zero `ax`/viewer code change per product.
- Linked product plan: `docs/alexandria/plans/library-word-legibility/plan.md`
  (Part A + "The layer model, grounded" under "Process gap caught" — read-only
  input; this technical plan is the separate per-issue artifact).

## Scope

- Add a `cardType` field to `AtomicCardCategory` (the exact singular, Title-case
  string a card's `type:` frontmatter carries) for all ten ruled categories.
- Add `LibraryCatalogTypeMappingEntry` / `LibraryCatalogTypeMappingDisposition` to
  `library-catalog.ts`, homed alongside `LibraryCatalogExplicitArea` in the
  `gaps.json`-sourced `LibraryCatalogExtras` shape (not the walk-transient
  `draftOverlay`/`containerMapping` shape — verified absent from the confirmed
  `alexandria-product` catalog).
- Add a `resolveCardCategory(rawType, typeMapping)` read-time resolver (identity
  match against the ten `cardType` values, else last-matching `rename`/`merge`
  `typeMapping` entry, else `undefined`).
- Retire `library-catalog-links.ts`'s independent `CANONICAL_CARD_TYPES` array;
  route `isCanonicalCardType`/`diagramForCatalogCard`'s canonical branch through
  `resolveCardCategory`.
- Extend `engine-view-model.ts`'s `ENGINE_TYPE_ICON_SET` to the ten ruled
  categories (+ `definition`/`differsFrom`); export a shared `typeDescriptor`
  that resolves through `resolveCardCategory` before falling back to
  `UNKNOWN_TYPE`.
- Fold `notepad-view-model.ts`'s `roleStyle` into a thin adapter over the same
  descriptor, preserving its exact signature/output for existing callers.
- Seed `docs/alexandria/sweeps/alexandria-product/gaps.json` (new file) with the
  two locked entries: `Bet → Rationale`, `Principle → Rationale`.

## Non-Goals

- No new viewer UI (story chips, legend rendering, Constellation merge) — that's
  Slices B/C of the product plan, depend on this, not built here.
- No write-time validating turn/UI for authoring `typeMapping` entries (reject
  duplicate/unknown sources, dangling targets, Ledger event) — that's the
  taxonomy-lock capstone (product-plan workstream C), a separate later piece.
- No retyping of live cards (`Reference`, `Concept`) — individual card-content
  fixes are a separate workstream, not this issue.
- No change to `graph-utils.ts` (`TERRITORY_COLORS`/`CLUSTER_CENTERS`) or
  `ConstellationView.tsx`.
- No change to the ten ruled category *names* themselves (`atomic-card-categories.ts`'s
  `id`/`label`/`order`/`folderName` stay as-is) — only new fields and consumers.

## Current Gap

Three live, disagreeing type→behavior gates exist: `library-catalog-links.ts`'s
`CANONICAL_CARD_TYPES` (gates diagram rendering, canonizes off-canon
`Component`/`Economy`/`Reference`), `engine-view-model.ts`'s `ENGINE_TYPE_ICON_SET`
(gates Engine-view color, an older DDD vocabulary overlapping the ruled ten on
only 3 entries), and `notepad-view-model.ts`'s `roleStyle` (gates story-chip
color, overlaps on 1). `atomic-card-categories.ts` — the one *ruled* list — gates
nothing live. No mechanism exists for a bundle to map its own vocabulary
(`Bet`, `Principle`) onto a ruled category; the only precedent for "a bundle
teaches the viewer something without code," `LibraryCatalogExplicitArea` in
`gaps.json`, exists for containers/areas, not types.

## Architectural Boundaries

- Category *identity* (the ten `id`/`label`/`cardType` values) is framework data
  in `packages/ax/src/domain/atomic-card-categories.ts` — stable across every
  product's library, never edited per product.
- Per-product vocabulary (`Bet → Rationale`) is bundle data in that bundle's own
  `gaps.json` — never framework code. This is the layer boundary the product
  plan's "layer model" names; this slice is what gives layer 2 (framework
  vocabulary) an actual, single home instead of leaking into per-product code
  edits.
- `resolveCardCategory` is the one function both `packages/ax` (diagram
  eligibility) and `packages/viewer` (palette) call — no parallel "is canonical"
  logic anywhere else after this slice.
- `gaps.json` parsing stays inside `packages/ax`'s existing `LibraryCatalogExtras`
  load path; the viewer never reads bundle files directly, it consumes the
  already-merged `LibraryCatalog`.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Category data | `packages/ax/src/domain/atomic-card-categories.ts` | Add `cardType` field to `AtomicCardCategory` + all ten entries. No id/label/order/folderName change. |
| Catalog extras | `packages/ax/src/domain/library-catalog.ts` | Add `LibraryCatalogTypeMappingEntry`/`Disposition`; add `typeMapping` to `LibraryCatalogExtras` (parsed from `gaps.json`, defaults to `[]`); surface it on the merged `LibraryCatalog`. |
| Canonical resolver | `packages/ax/src/domain/library-catalog-links.ts` | Retire standalone `CANONICAL_CARD_TYPES`; add `resolveCardCategory(rawType, typeMapping)`; `isCanonicalCardType` becomes a thin wrapper (or is replaced at call sites) around it. |
| Diagram eligibility | `packages/ax/src/domain/library-catalog-story.ts` | `diagramForCatalogCard` (and its one call site, same file) threads `typeMapping` through and resolves via `resolveCardCategory` instead of the old array-membership check. `Reference` cards lose diagram eligibility (intended); `Bet`/`Principle` gain hub diagrams. |
| Engine palette | `packages/viewer/src/components/library/engine-view-model.ts` | Replace `ENGINE_TYPE_ICON_SET` content with the ten ruled categories + `definition`/`differsFrom`; export `typeDescriptor(type, typeMapping)`; `engineTypeDescriptor` resolves via `resolveCardCategory` before `UNKNOWN_TYPE`. |
| Notepad/story color | `packages/viewer/src/components/library/notepad-view-model.ts` | `roleStyle(type)` becomes a thin adapter over `typeDescriptor`, same signature/output for its 5 existing lowercase cases. |
| Bundle seed | `docs/alexandria/sweeps/alexandria-product/gaps.json` (new) | Adds the two locked `typeMapping` entries for this bundle only. |

## Agent / Skill Behavior Changes

None. This slice is `packages/ax` domain code + `packages/viewer` presentation
data + one bundle config file. No plugin workflow, skill prompt, or agent-facing
behavior changes.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| ax domain unit tests | `bun test packages/ax/src/domain/library-catalog-links.test.ts packages/ax/src/domain/library-catalog.test.ts packages/ax/src/domain/library-catalog-story.test.ts` | Cover `resolveCardCategory`, `LibraryCatalogExtras`/`gaps.json` parsing, `diagramForCatalogCard`. |
| ax full domain suite | `bun test packages/ax` | Catch fallout in any other consumer of `CANONICAL_CARD_TYPES`/`isCanonicalCardType` or `LibraryCatalogExtras`. |
| viewer unit tests | `bun test packages/viewer/src/components/library/engine-view-model.test.ts packages/viewer/src/components/library/notepad-view-model.test.ts` (or equivalent existing test files) | Cover the ten-category descriptor set, `typeDescriptor`, `roleStyle` regression. |
| repo-wide check | `bun run check` | Repo-standard lint/typecheck gate (prettier, markdownlint where relevant, TS). |
| targeted full test | `bun test` (ax + viewer only, not the known-flaky full local suite per `ax-full-suite-local-flakiness`) | Final regression pass before PR; run `packages/ax` and `packages/viewer` scoped, not the whole monorepo, to avoid the documented local parallel-contention flakiness. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Agent/skill/plugin behavior | N/A — this slice touches no `packages/alexandria-plugin` workflow, skill, or prompt | None | No eval rerun; `contributor-skills`/`EVALS.md` harness is scoped to agent-facing behavior, which this slice does not change |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Removing `CANONICAL_CARD_TYPES` silently changes which cards get a diagram beyond the intended `Reference` regression (e.g. an unnoticed consumer keyed off the old 9-item list). | Grep all call sites of `isCanonicalCardType`/`CANONICAL_CARD_TYPES` before removal (confirmed today: only `library-catalog-story.ts`); add an explicit before/after diagram-count assertion in acceptance, not just unit coverage of the resolver in isolation. |
| `cardType` singular/plural mismatch reintroduces silently in a future category edit (e.g. someone adds an 11th category and only sets `label`, not `cardType`). | Add a unit test asserting every entry in `ATOMIC_CARD_CATEGORIES` has a non-empty `cardType`, so a future omission fails the build rather than silently rendering Unknown. |
| `gaps.json` is a new, optional file — a typo'd key (`"typeMaping"`) would silently no-op rather than error, defeating the seed. | Mirror `areas`'s existing tolerant-parse pattern (`Array.isArray(parsed.typeMapping) ? ... : []`) for consistency, but add a metadataIssue-style warning (matching the existing `metadataIssues` convention already used for malformed `areas`/`gaps`) when the raw JSON has an unrecognized top-level key shape, so a malformed seed is visible rather than silent. |
| `Bet`/`Principle` cards flowing through `diagramForCatalogCard` for the first time as a "canonical" category could hit an untested code path (they were never canonical before). | Explicit acceptance criterion + test: `Bet`/`Principle` resolve to `Rationale` and get a hub diagram (not lifecycle — `Rationale` isn't in `CANONICAL_LIFECYCLE_CARD_TYPES`), run against real cards in the `alexandria-product` bundle, not just synthetic fixtures. |
| Local full `bun test` run flags unrelated failures (documented parallel-contention flakiness) and masks a real regression. | Scope test runs to `packages/ax` and `packages/viewer` (per Deterministic Verification above); re-run any red test individually before treating it as a real regression. |

## Implementation Steps

1. `atomic-card-categories.ts`: add `cardType: string` to `AtomicCardCategory` and
   populate all ten entries (`Rationale, Research, Role, Domain, Surface, Entity,
   Capability, Mechanism, Pattern, Economy`). Add the "every entry has a
   non-empty `cardType`" unit test.
2. `library-catalog.ts`: add `LibraryCatalogTypeMappingDisposition`/`Entry` types;
   add `typeMapping` to `LibraryCatalogExtras`, parsed from `gaps.json` alongside
   `areas`/`gaps` with the same tolerant-default behavior; surface it on the
   merged `LibraryCatalog`.
3. `library-catalog-links.ts`: implement `resolveCardCategory(rawType,
   typeMapping)` (identity → mapping → undefined, case/whitespace-normalized,
   last-match-wins on duplicate `from`); remove the standalone
   `CANONICAL_CARD_TYPES` array; update `isCanonicalCardType` (or its call sites)
   to route through the new resolver.
4. `library-catalog-story.ts`: thread `typeMapping` into `diagramForCatalogCard`
   and its one call site; replace the old array-membership check with
   `resolveCardCategory`.
5. `engine-view-model.ts`: replace `ENGINE_TYPE_ICON_SET` with the ten ruled
   categories + `definition`/`differsFrom` (six from the product plan's existing
   table, four newly grounded here per the issue: Rationale, Domains, Roles,
   Research); export `typeDescriptor(type, typeMapping)`; update
   `engineTypeDescriptor` to resolve via `resolveCardCategory` before
   `UNKNOWN_TYPE`.
6. `notepad-view-model.ts`: rewrite `roleStyle` as a thin adapter over
   `typeDescriptor`, preserving its exact input/output contract for existing
   callers; add the regression test asserting byte-identical output for its five
   pre-existing cases.
7. Add `docs/alexandria/sweeps/alexandria-product/gaps.json` with the two seed
   `typeMapping` entries.
8. Run deterministic verification (table above); fix fallout.
9. Local review pass against this plan + the issue's acceptance criteria.
10. Open the PR against `main`.

## Acceptance / Exit Criteria

Mirrors issue #634's acceptance criteria directly:

1. `library-catalog-links.ts` has no independent `CANONICAL_CARD_TYPES` array;
   diagram-eligibility and viewer color resolve through one function.
2. `typeDescriptor`/`engineTypeDescriptor` returns a distinct, non-Unknown,
   defined descriptor for all ten ruled categories.
3. `typeDescriptor("Bet")`/`typeDescriptor("Principle")` resolve to `Rationale`
   against the seeded `alexandria-product` bundle; resolve to Unknown with no
   `typeMapping` present.
4. `typeDescriptor("Reference")`/`typeDescriptor("Component")` always resolve to
   Unknown (never silently mapped by this slice).
5. `Reference` cards lose diagram eligibility (the one intended regression,
   covered by an explicit test); `Bet`/`Principle` gain hub diagrams.
6. `roleStyle` preserves its five legacy lowercase cases byte-for-byte; every
   other type resolves through the shared descriptor instead of the old beige
   default (corrected from the original AC — see "Corrections" below).
7. `resolveCardCategory` handles duplicate `from` (last wins) and `hold`
   (unresolved) without throwing.
8. All Deterministic Verification commands pass.

## Corrections made during implementation (noted on issue #634)

Two design points from the frozen issue turned out to be wrong once actually
built; both are corrected here rather than followed blindly, since either
would have shipped a slice that misses its own point.

1. **`typeMapping` lives in `gaps.json`, not `containerMapping`'s home.** The
   issue's design mirrored `LibraryCatalogDraftContainerMappingEntry`
   (`library-catalog.ts:302`), which lives under `LibraryCatalogDraftOverlay` —
   **walk-transient state that only exists during an active Front-of-House
   draft.** Verified the confirmed `alexandria-product` catalog carries no
   `draftOverlay` at all (`library.json` is just `{"schemaVersion": ...}`), so
   nesting `typeMapping` there would make it invisible for any already-confirmed
   library. The correct precedent is `LibraryCatalogExplicitArea`
   (`library-catalog.ts:357`) parsed from `gaps.json` — genuinely at-rest,
   bundle-level, non-card config, present regardless of walk state. `typeMapping`
   is a sibling field in that same file/shape.
2. **`roleStyle`'s "byte-identical... plus its unmatched default" AC was
   over-literal and contradicted the issue's own motivation.** Honoring it
   verbatim would mean Entity/Surface/Mechanism/Pattern/Economy/etc. — exactly
   the types the issue's Motivation section names as "collapse to the same
   beige default... exactly why the prose has no usable color signal today" —
   would keep collapsing to that same beige forever, since they don't match
   any of the five explicitly-tested legacy cases. Corrected to: the five named
   lowercase DDD-vocabulary cases (`aggregate, read-model, value, component,
   capability`) keep their exact bespoke colors (zero regression risk — nothing
   in the live bundle even uses them, but story-fixture/storybook consumers
   might), and the **default** branch now resolves through `typeDescriptor`
   instead of the hardcoded beige — which is the actual fix.

A third thing was discovered, not corrected (out of scope for this slice, flagged
for Slice B): **`EmptyLibraryView.tsx`'s `cardTypeIcon()` function (line ~111) is
a fifth drifting type→icon system**, added in #631 as a stopgap, giving `Bet`→"B"
and `Principle`→"P" distinct glyphs while every other type (including all real
canonical categories) falls to a generic "C". Left untouched here because Slice B
already owns touching `EmptyLibraryView.tsx`'s per-card visual treatment
(name-first chips, per plan.md); folding `cardTypeIcon` into `typeDescriptor` is a
natural Slice B task, noted so it isn't lost. (Its own test,
`EmptyLibraryView.test.tsx`'s "distinct Bet/Principle type icons," needed only a
`typeMapping: []` fixture fix here, not a behavior change — Bet and Principle
correctly still show separate "B"/"P" glyphs today; that test's *assertion* will
need to change when Slice B migrates this function, since Bet/Principle will then
share Rationale's single icon like any other category member.)

## Deferred Follow-Ups

1. The taxonomy-lock capstone (product-plan workstream C): a write-time,
   validating `typeMapping` authoring turn (reject duplicate/unknown
   sources/dangling targets, a Ledger event, competing-word threads) —
   `resolveFrontOfHouseContainerMapping`-style strictness, applied to types.
2. Individually retype the live bundle's `Reference` (6) and `Concept` (3) cards
   into ruled categories — card-content work, not code.
3. Slice B (story chips + legend) and Slice C (Engine × Constellation merge) —
   both consume `typeDescriptor`/`resolveCardCategory` from this slice. Slice B
   should also fold `EmptyLibraryView.tsx`'s `cardTypeIcon()` (a fifth drifting
   icon system, found during this slice's implementation) into `typeDescriptor`.
4. `graph-utils.ts`'s `TERRITORY_COLORS`/`CLUSTER_CENTERS` legacy rot — untouched
   here, in scope for Slice C.
