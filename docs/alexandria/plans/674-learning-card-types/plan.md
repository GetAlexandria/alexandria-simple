# Issue 674 Technical Plan: Learning Card Types

## Header

Issue reference: GitHub #674, `[F2a] Register Experiment and Measure as first-class card types`.

Goal: make `Experiment` and `Measure` first-class ruled card types beside the already-registered
`Research` type, so Learning-plane cards scan, catalog, and render with real type identity instead of
falling through to Unknown.

Linked product plan inputs:

- `docs/alexandria/plans/learning-plane/design-log.md`, especially consolidated D1:
  `Research · Experiment · Measure`.
- `docs/alexandria/plans/learning-plane/card-contract.md`, especially the product-card.v2 notes and
  the "Every card: `plane: learning`" requirement.
- `docs/alexandria/plans/learning-plane/launch-plan.md`, F2a.
- `docs/alexandria/plans/library-migration/plan.md` §2.2, the `product-card.v2` contract text.
- The checked-in #662-shaped code/tests for Bet and Principle registration in
  `atomic-card-categories.ts`, `library-catalog-links.ts`, `engine-view-model.ts`, and
  `EmptyLibraryView.tsx`.

Dependency note: this issue was queued behind the library-migration loader slices. The current checkout
already includes the library move/config/flow slices through #691/#692, but implementation should still
start by confirming the base branch includes those migrations. If the implementation base regresses to a
pre-migration branch, hold the path-lint/v2 portion until the loader slice lands.

## Scope

This slice lands:

- Add `experiment` and `measure` to `ATOMIC_CARD_CATEGORY_IDS` and `ATOMIC_CARD_CATEGORIES`.
- Use cardTypes `Experiment` and `Measure`, folderNames `experiments` and `measures`, ordered directly
  after `research`; renumber later category `order` values while preserving their relative order.
- Update AX canonical type resolution/tests that derive from `ATOMIC_CARD_CATEGORIES`.
- Add viewer engine palette descriptors for `Experiment` and `Measure`, ordered with `Research`.
- Update `EmptyLibraryView`'s card-row glyph map so `Experiment` and `Measure` have distinct glyphs
  instead of the generic `C`.
- Update the Research descriptor wording that still says the Learning plane is unbuilt.
- Keep `learning` valid anywhere product-card.v2 plane vocabulary is encoded in docs or loader/path lint.
- Add deterministic unit coverage for scan/catalog classification, engine type grouping, legend/palette
  rendering, and row glyph rendering.

## Non-Goals

- No Learning-plane vitals parsing or rendering. `kind`, `grade`, `state`, `stop`, `guardrails`,
  `target`, `trend`, and biography-WHEN belong to #675/F2b.
- No live product-library card edits under `docs/alexandria/library/`.
- No new `Research`, `Experiment`, or `Measure` content cards.
- No retirement or remapping of existing categories; `rationale` stays retired/legacy-only.
- No new plugin prompt, workflow, or skill behavior.
- No new roadmap/release/plane-specific viewer surface.
- No structured `tests` / `informs` link sockets.

## Current Gap

`packages/ax/src/domain/atomic-card-categories.ts` currently has eleven live categories:
`bet`, `principle`, `research`, then the existing product vocabulary. `Research` is registered, but
`Experiment` and `Measure` are not. Consumers that derive canonical card types from this list do not
recognize those two Learning-plane types by identity.

`packages/viewer/src/components/library/engine-view-model.ts` also has eleven descriptors. It includes
`Research`, but its definition says the Learning plane is unbuilt and there are no descriptors for
`Experiment` or `Measure`, so those card types resolve to Unknown in the Engine and TypeLegend.

`packages/viewer/src/components/library/EmptyLibraryView.tsx` has distinct row glyphs only for `Bet`
and `Principle`; every other type gets the generic `C`. That means Learning cards would not have the
engine-palette identity requested by the issue.

`plane: learning` is already valid in runtime code: `PRODUCT_CARD_PLANES` in
`packages/ax/src/domain/library-catalog.ts`, `LibraryPlaneSchema` in
`packages/viewer/src/app/runtime/schemas.ts`, and `SCHEMA_INDEX_PLANES` in `EmptyLibraryView.tsx`.
However, `docs/alexandria/plans/library-migration/plan.md` still shows the v2 plane comment as
`product | strategy`, and `learning-plane/card-contract.md` explicitly says #674 must fix that. Any
new v2 path lint must preserve `learning` as a valid value.

## Architectural Boundaries

- AX owns the canonical ruled category list and deterministic catalog/type resolution.
- The viewer owns color/icon/label presentation for catalog and Engine surfaces; keep changes in pure view
  model/component code and tests.
- product-card.v2 docs and any loader/path lint may be touched only to keep `plane: learning` and the new
  type/folder vocabulary coherent.
- The plugin remains untouched unless implementation discovers prompt/workflow text that directly embeds the
  old eleven-category vocabulary.
- The live library remains read-only for this slice. Use synthetic test fixtures rather than editing
  `docs/alexandria/library`.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| AX ruled category roster | `packages/ax/src/domain/atomic-card-categories.ts` and `.test.ts` | Add `experiment` / `measure`; orders become `research=3`, `experiment=4`, `measure=5`, existing later categories shift to 6-13. |
| AX canonical card types | `packages/ax/src/domain/library-catalog-links.test.ts` | `CANONICAL_CARD_TYPES`, `isCanonicalCardType`, and `resolveCardCategory` recognize `Experiment` and `Measure` by identity. |
| AX scan/catalog fixtures | `packages/ax/src/domain/library-catalog.test.ts` | A `plane: learning` fixture with `type: Experiment` / `type: Measure` loads with no metadata issue and groups into learning areas. |
| product-card.v2 contract/lint | `docs/alexandria/plans/library-migration/plan.md`, `docs/alexandria/plans/learning-plane/card-contract.md`, and any current v2 path-lint files if present | Contract text and validation allow `plane: learning`; path/type checks do not encode only product/strategy. |
| Viewer type palette | `packages/viewer/src/components/library/engine-view-model.ts` and `.test.ts` | `Experiment` and `Measure` descriptors resolve as first-class types, appear between Research and Role in type grouping, and do not collide with existing icons/colors. |
| Viewer catalog glyphs | `packages/viewer/src/components/library/EmptyLibraryView.tsx` and `.test.tsx` | Catalog card rows render distinct glyphs for `Experiment` and `Measure`. Recommended glyphs: `X` for Experiment, `#` for Measure. |
| Viewer passive legend | `packages/viewer/src/components/library/TypeLegend.test.tsx` | Plain `Experiment` and `Measure` cards get typed legend rows, not Unknown. |
| Viewer test script whitelist | `packages/viewer/package.json` | If new viewer test files are created, append them to the explicit `test` script. Prefer updating existing whitelisted files when sufficient. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Alexandria plugin agents/skills | None intended. This is deterministic category/catalog/viewer work. | No plugin validation or eval rerun required unless implementation edits files under `packages/alexandria-plugin`. |
| AX CLI behavior | No new command, flag, output mode, or exit code. Catalog internals recognize two more canonical types. | No CLI black-box exit-code test required unless a command-level loader/path lint is changed. If so, add a command test for success on `plane: learning` and rejection messaging for invalid planes. |
| Viewer product surface | Learning card types render with stable palette/glyph identity. | Viewer unit/build/browser validation required. |
| Maintainer planning docs | product-card.v2 contract text stops teaching a product/strategy-only plane enum. | Markdown lint required for changed docs. |

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| AX focused unit tests | `pnpm --filter @alexandria/ax exec bun test src/domain/atomic-card-categories.test.ts src/domain/library-catalog-links.test.ts src/domain/library-catalog.test.ts` | Proves category roster, canonical type resolution, and learning-plane scan fixtures. |
| AX full package tests | `pnpm --filter @alexandria/ax run test` | Catches indirect catalog/link/story regressions. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches union/type drift from the expanded category set. |
| Viewer focused unit tests | `pnpm --filter @alexandria/viewer exec bun test src/components/library/engine-view-model.test.ts src/components/library/EmptyLibraryView.test.tsx src/components/library/TypeLegend.test.tsx src/app/runtime/client.test.ts` | Proves descriptors, grouping, glyphs, legend rows, and existing `learning` plane schema support. |
| Viewer whitelisted unit suite | `pnpm --filter @alexandria/viewer run test` | Ensures any new/changed viewer tests are included in the package script and not silently skipped. |
| Viewer check | `pnpm --filter @alexandria/viewer run check` | Astro/TypeScript validation for the product surface. |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Confirms the static viewer builds with the expanded palette. |
| Viewer browser suite | `pnpm --filter @alexandria/viewer run test:e2e` | Browser-level guard for the Library viewer after palette/glyph changes. |
| Markdown/docs | `pnpm run lint:markdown` | Required if product-card.v2 or Learning-plane contract docs change. |
| Repo guard | `git diff -- docs/alexandria/library` | Must be empty; this slice must not freehand-edit the live library. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| AX category/catalog code | Deterministic Bun tests cover the behavior. | No eval-harness coverage required. | Use the AX tests above. |
| Viewer Library surface | Deterministic unit/build/browser validation covers this slice. | No eval-harness coverage required. | Use the viewer commands above. |
| Alexandria plugin skills/workflows | Not touched. | No eval rerun. If implementation touches atomic-card workflows or `atomic-card-production`, rerun the relevant product evals. | Conditional only: `pnpm eval -- run atomic-card-planning/all`, `pnpm eval -- run atomic-card-creation/all`, `pnpm eval -- run build-atomic-card/all`. |
| Maintainer technical-planning skill | This plan is maintainer workflow output, not product behavior. | No eval-harness coverage required. | None. |

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| AX and viewer maintain separate category/descriptor lists, so one can be updated without the other. | Update both in the same slice and pin expected thirteen-type sets in AX and viewer tests. |
| Existing tests and comments say "eleven"; leaving stale wording would hide future drift. | Rename tests/comments to "thirteen ruled categories" where they assert the live roster. |
| The issue freezes `folderName: measures`, while older Learning-plane docs use a `measurement` shelf. | Treat #674 as authoritative for category metadata: use `measures`. If implementation touches v2 path/folder contract text, update it so docs and code do not teach conflicting folder vocabulary. Do not move live cards. |
| `plane: learning` already works in runtime code, but stale v2 docs or new path lint could reintroduce a product/strategy-only enum. | Update `product-card.v2` contract text and add/keep a regression test wherever plane validation lives. Existing `PRODUCT_CARD_PLANES` and viewer schema tests should stay green. |
| New viewer tests can silently skip because the package script enumerates files. | Prefer editing existing whitelisted test files. If adding a new test file, update `packages/viewer/package.json` in the same commit and prove it through `pnpm --filter @alexandria/viewer run test`. |
| Palette/glyph collisions make new types visually indistinct. | Keep descriptor `accent` and `icon` uniqueness assertions; choose glyphs distinct from existing entries (`X`, `#` recommended). |
| Scope creep into Learning vitals or content cards would collide with sibling issues. | Do not parse/surface vitals and do not edit `docs/alexandria/library`; record any discovered vitals needs for F2b/#675. |

## Implementation Steps

1. Reconfirm the base branch includes the library-migration loader slices. If the code around
   `library-catalog.ts` or path-derived v2 lint has changed since this plan, adapt tests to the current
   loader shape while preserving the acceptance criteria.
2. Update `packages/ax/src/domain/atomic-card-categories.ts`:
   add `experiment` and `measure` after `research`; add category objects with labels `Experiments` and
   `Measures`, folderNames `experiments` and `measures`, cardTypes `Experiment` and `Measure`; renumber
   later `order` values to 6-13.
3. Update AX category tests:
   add expected `cardType` entries; assert ids/categories remain in sync; assert the live id order is
   `bet`, `principle`, `research`, `experiment`, `measure`, then the existing product categories.
4. Update canonical type tests in `library-catalog-links.test.ts`:
   expected set becomes thirteen; `Experiment` and `Measure` resolve by identity; off-canon retired types
   still do not resolve.
5. Add a catalog fixture in `library-catalog.test.ts` with `plane: learning`, `type: Experiment`, and
   `type: Measure`. Assert no metadata issues, the cards preserve their types, `meta.planes` includes
   `learning`, and areas/grouping are deterministic. If v2 path lint exists on the implementation base, add
   the equivalent path-derived fixture and ensure `plane: learning` is accepted there too.
6. Update product-card.v2 contract text:
   change the library-migration plan's plane comment from `product | strategy` to
   `product | strategy | learning`; update the Learning-plane card contract sentence that says #674 still
   needs to add `learning`. If folder vocabulary is mentioned in the same contract area, align it with this
   issue's `measures` category folder decision or explicitly leave content-shelf naming out of scope.
7. Update `packages/viewer/src/components/library/engine-view-model.ts`:
   add `Experiment` and `Measure` descriptors adjacent to `Research`; update the introductory comment and
   Research definition so it says the Learning plane is being built, not unbuilt. Keep existing type order
   relative to one another.
8. Update `engine-view-model.test.ts`:
   `RULED_CATEGORIES` has thirteen entries; descriptor uniqueness still holds; Bet/Principle identity tests
   are joined by Experiment/Measure identity tests if useful; type grouping pre-seeds `Research`,
   `Experiment`, `Measure`, then the existing categories, plus Unknown.
9. Update `EmptyLibraryView.tsx` `cardTypeIcon`:
   add `Experiment -> "X"` and `Measure -> "#"`, and revise comments that say only Bet/Principle have
   distinct icons.
10. Update viewer tests:
    add catalog row glyph assertions for Experiment/Measure in `EmptyLibraryView.test.tsx`; add TypeLegend
    assertions that plain Experiment/Measure cards produce typed rows; keep any new files in the
    `packages/viewer/package.json` test whitelist.
11. Run the deterministic verification matrix. Fix only in-scope failures. Confirm `git diff` has no changes
    under `docs/alexandria/library`.

## Acceptance / Exit Criteria

1. `ATOMIC_CARD_CATEGORY_IDS` contains thirteen live ids with `experiment` and `measure` directly after
   `research`.
2. `ATOMIC_CARD_CATEGORIES` has cardTypes `Experiment` and `Measure`, folderNames `experiments` and
   `measures`, and stable relative order for the pre-existing categories.
3. `Experiment` and `Measure` resolve as canonical categories in AX and no longer require `typeMapping`.
4. A fixture card with `type: Experiment` or `type: Measure` and `plane: learning` scans into the catalog,
   groups into the expected learning areas, and reports no Unknown-type drift.
5. Engine type grouping includes `Research`, `Experiment`, and `Measure` as first-class zones before the
   existing product-category zones.
6. TypeLegend and EmptyLibraryView render distinct Experiment/Measure palette/glyph identity.
7. product-card.v2 contract text and any active path lint accept `plane: learning`.
8. Existing eleven categories keep unchanged behavior aside from order numbers shifting after the inserted
   Learning types.
9. Viewer package tests are not silently skipped by the explicit test-script whitelist.
10. No implementation edits land under `docs/alexandria/library`.

## Deferred Follow-Ups

1. F2b/#675: parse and render Learning-plane vitals, including Experiment `stop`/`guardrails` and Measure
   `target`/`trend`.
2. Learning-plane content build: scaffold/author Research, Experiment, and Measure cards under the live
   library through the approved content workflow.
3. Structured evidence sockets (`tests`, `informs`) and evidence-map linking.
4. Roadmap/release views over milestones, horizons, measures, and experiments.
5. Plane-level visual distinction in the viewer beyond type palette identity.
