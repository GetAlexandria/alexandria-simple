# Issue 440 Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#440` — "Library index
  altitude: a top-level planes-to-contexts map that drills into the context
  view"
- Plan path: `docs/alexandria/plans/preliminary-library-build/plan.md`
- Goal: add the schema-aware library index altitude so a director can land on a
  product's planes, see each plane's contexts with card/fillable counts, and
  drill into the already-shipped context view.
- Linked product plan: `preliminary-library-build`
- Run: `01KW5T226TRGHZAHQRQN0PGVP5`
- Dependencies:
  - #430 is merged and introduced the context altitude in the Viewer Empty
    Library surface.
  - #434 is merged and introduced the Product-card `links` contract used by the
    context story/diagram view.
  - The current repo state also has schema-gated `fillReadiness` and
    body-only fillability, so this slice should consume the existing
    `catalog.areas` and `catalog.fillReadiness.areas` payloads rather than
    introducing a new derivation.

## Source And Dependency Note

This path is the ongoing implementation-plan record for the
`preliminary-library-build` product line. It previously held the #438
fill-readiness correction plan; that slice is no longer the active request and
is replaced here by the #440 index-altitude plan.

The issue body in the run prompt supplies the product scope. The GitHub comment
thread currently adds only the Fabro local run URL for
`01KW5T226TRGHZAHQRQN0PGVP5`; it does not add implementation scope beyond the
issue text.

The linked review note
`docs/alexandria/plans/rebuilding-the-library/review-page-and-next-steps.md`
defines the three altitudes as index -> context -> card. It records the index
altitude as not built, the context altitude as built, and the next work order as
the appendix/index view that drills into the context page.

## Scope

- Add a schema-aware index altitude to the Viewer Empty Library surface for
  catalog payloads that include `fillReadiness`.
- Render the canonical planes in order: `strategy`, `product`, `learning`.
  Unexpected planes, if any, render after the canonical set in stable
  alphabetical order.
- Within each plane section, render each `LibraryCatalogArea` as a
  folder-like context item.
- Show context counts from `catalog.fillReadiness.areas`, keyed by `areaId`:
  `cardCount` and `fillableCount` are the contract for the index count labels.
- Drill a context item into the existing context-altitude renderer by reusing
  the `CatalogAreaTree` / `ContextStory` path that already renders lead story,
  what-it-does / how-it-does-it buckets, diagram, pieces, and card rows.
- Keep the old catalog card list available as a regression/control surface for
  schema-aware catalogs, because the issue explicitly calls out the catalog
  card list.
- Preserve legacy behavior for catalogs without the `product-card.v1` opt-in:
  no index default, no `fillReadiness` assumptions, and no changed runtime API
  requirements.
- Keep the change additive in the Viewer and test fixtures. AX catalog/runtime
  changes should be limited to test assertions unless implementation exposes a
  real data-contract gap.

## Non-Goals

- Do not add a product-level authored story body or Pillar narrative. The index
  renders the contexts map, not a product narrative.
- Do not build the atomic-card altitude.
- Do not change the Card contract, Product-card frontmatter contract, or link
  contract.
- Do not change the walk, BoH/FoH pipelines, confirm gate, or atomizer.
- Do not add a public `ax` command or change CLI syntax, exit codes, or JSON
  output contracts.
- Do not write to `docs/alexandria/library`.
- Do not edit vendored files under `repos/`.
- Do not use Effect inside pure visual components; keep Effect at the existing
  Viewer runtime API boundary.

## Linked Product-Plan Summary

The preliminary-library-build line is proving Alexandria's Product-card library
surface through three recursive altitudes:

1. Index: product planes and their contexts.
2. Context: one bounded context with lead story, diagram, and pieces.
3. Card: the atomic card's own body.

#430/#434 shipped the context altitude and its links-backed story/diagram. #440
adds the missing top altitude. The data already exists in the catalog:
`areas` identify plane x context, while `fillReadiness.areas` supplies the
per-context card and fillable counts. The implementation should compose that
data for navigation, not create a new library model.

## Current Gap

- `EmptyLibraryView` treats schema-aware catalogs as a fill-readiness workbench
  by default. For `libraryRoot=studio/library`, the first screen is currently
  readiness, not the product's top-level shape.
- The current context renderer exists inside `CatalogAreaTree`: it can render a
  selected area with a lead story, diagram, pieces, card rows, gaps, and empty
  area state.
- The current catalog tab can show areas by a selected plane, but it is not an
  index altitude: it uses a side plane selector, expands area trees directly,
  and does not present all planes as top-level sections with folder-like
  context items.
- `catalog.meta.planes` is schema-aware and canonically ordered by AX, but it
  only includes planes present in the payload. The index needs an honest empty
  state for canonical planes with no contexts, so the Viewer should render the
  canonical schema planes even when a plane has no areas.
- The Viewer does not receive an explicit `schemaVersion`; schema-aware UI is
  currently inferred from the presence of `fillReadiness`. This should remain
  the gate for the index unless AX adds a schema-mode field in a separate
  contract slice.

## Architectural Boundaries

- AX remains the authority for scanning Product cards, producing `areas`,
  deriving threads, and projecting `fillReadiness`.
- The Viewer consumes the AX runtime catalog payload. It should not parse card
  Markdown or derive fillability from raw bodies.
- The index is a rendering and navigation layer over `catalog.areas` plus
  `catalog.fillReadiness.areas`.
- Count display must use `fillReadiness.areas` for schema-aware catalogs. Do
  not recompute fillable counts from `fillReadiness.cards` in the component.
- Use `area.id` / `fillReadiness.areaId` as the drill and count key so duplicate
  context names in different planes do not collide.
- Keep legacy catalog paths controlled by `catalog.fillReadiness == null`.
- Keep runtime API fetching and decoding in `packages/viewer/src/app/runtime/*`;
  new index helpers/components should be ordinary React/TypeScript.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Viewer Empty Library surface | `packages/viewer/src/components/library/EmptyLibraryView.tsx` and, if the component grows too much, a new adjacent `LibraryIndexView.tsx` / view-model helper | Schema-aware catalogs land on an index altitude; context tiles drill into a focused context view; legacy catalogs keep the old default. |
| Viewer library helpers | `packages/viewer/src/components/library/plane.ts` or a new local helper | Add canonical schema plane ordering for index sections and stable unexpected-plane fallback. |
| Viewer sample catalog | `packages/viewer/src/components/library/sample-catalog.ts` | Ensure schema-aware fixtures include Product `board` and `readiness-fixture` contexts with matching readiness counts, a multi-plane fixture, and a schema-aware empty/empty-plane case. |
| Viewer fixture server | `packages/viewer/tests/serve-viewer-fixture.ts` | Expose fixture modes needed by the browser matrix without changing production runtime behavior. |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Add index landing, count, drill, canonical order, empty state, legacy-control, and regression assertions. Update existing schema-aware context/readiness tests for the new default index landing. |
| Viewer runtime schema/client tests | `packages/viewer/src/app/runtime/schemas.ts`, `packages/viewer/src/app/runtime/client.test.ts` | No schema change expected. Keep back-compat tests proving catalogs without `fillReadiness` decode and render through the legacy path. |
| AX catalog/runtime tests | `packages/ax/src/domain/library-catalog.test.ts`, `packages/ax/tests/runtime-server.test.ts` | No AX source change expected. Add or tighten assertions that `studio/library` exposes the Product-plane `board` and `readiness-fixture` areas with matching `fillReadiness.areas` counts. |
| Viewer stories | `packages/viewer/src/components/library/EmptyLibraryView.stories.tsx` | Update schema-aware story defaults so Storybook reflects index-first behavior rather than readiness-first behavior. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product plugin agents | None expected. | No plugin validation unless implementation unexpectedly edits `packages/alexandria-plugin/agents`. |
| Product plugin skills/workflows | None expected. | No eval-harness rerun unless implementation edits bundled skills or workflows. If that happens, revise this plan first and use `EVALS.md` to select evals. |
| Maintainer skills | None. | This plan uses `skills/maintainer/technical-planning/SKILL.md` but does not change it. |
| Public CLI | No command syntax, exit-code, or JSON contract change. | No black-box CLI test is required for syntax. Runtime tests cover the catalog payload consumed by the Viewer. |
| AX runtime catalog API | No response shape change expected. | Keep runtime tests for `areas` / `fillReadiness.areas` alignment. |
| Viewer product surface | Yes. Schema-aware library browsing lands on an index altitude and drills into a context altitude. | Update Viewer unit/story/browser coverage. |

## Implementation Steps

1. Add an index view model.
   - Build a helper that groups `catalog.areas` by plane and preserves each
     area as the unit of navigation.
   - For schema-aware catalogs, start the plane list with
     `strategy`, `product`, `learning`, then append any unexpected planes in
     stable alphabetical order.
   - Build a `Map<string, LibraryCatalogFillReadinessArea>` keyed by
     `areaId`.
   - For each context item, display `readinessArea.cardCount` and
     `readinessArea.fillableCount`. If a readiness row is missing, render an
     honest unknown/zero-count fallback without throwing, and cover the normal
     matched case in tests.

2. Add the index altitude UI.
   - Add an `Index` workbench view for schema-aware catalogs and make it the
     default when `catalog.fillReadiness != null`.
   - Render each plane as a labeled section.
   - Render contexts as folder-like buttons/cards inside their plane section.
   - Keep visible text limited to labels and counts. Do not add explanatory
     rationale, validation prose, or a generic file tree.
   - Render an empty-plane state when a canonical plane has no contexts.
   - Render an honest whole-index empty state when no contexts exist at all.

3. Wire context drill-down.
   - Track a selected `areaId` for the context altitude.
   - On context-item click, set the selected `areaId` and render a focused
     context view using the existing `CatalogAreaTree` path for that single
     area.
   - Include a compact way back to the index.
   - Leave the existing `Catalog` workbench view available and still rendering
     the full area/card list by selected plane.
   - Preserve readiness thread interactions: selecting a card from readiness
     should still open the catalog/card detail path as it does today.

4. Preserve legacy behavior.
   - Keep `LEGACY_CATALOG_TABS` and legacy default tab behavior for catalogs
     without `fillReadiness`.
   - Ensure legacy empty catalogs still show the current empty/gap state and do
     not render the schema-aware index controls.
   - Keep `catalogRequestForRoute` and runtime client behavior unchanged unless
     implementation discovers a real route bug.

5. Update fixtures and stories.
   - Ensure the readiness fixture includes Product contexts `board` and
     `readiness-fixture` with the current expected counts: `board` has 8 cards
     / 8 fillable, and `readiness-fixture` has 1 card / 0 fillable.
   - Ensure the multi-plane contract fixture can prove `strategy`, `product`,
     and `learning` render in canonical order and that a non-product context
     remains under its own plane.
   - Add or adapt a schema-aware empty fixture to cover an empty plane and/or a
     whole schema-aware catalog with no contexts.
   - Update `EmptyLibraryView` stories so schema-aware examples open on the
     index, with separate story states for drilled context and readiness if
     useful.

6. Update deterministic tests.
   - Browser: `/library/empty?libraryRoot=studio/library` lands on the index.
   - Browser: the Product section shows `board` and `readiness-fixture` context
     items with card and fillable counts sourced from readiness.
   - Browser: clicking `board` opens the context story view and existing
     Product-card story/diagram assertions still pass.
   - Browser: canonical plane order is `Strategy`, `Product`, `Learning`, and
     fixture non-product contexts render under their own sections.
   - Browser: empty plane/empty schema-aware catalog renders a visible empty
     state rather than throwing.
   - Browser/client: legacy catalog without `fillReadiness` remains on the
     existing catalog path and has no index default.
   - AX runtime/domain: `areas` and `fillReadiness.areas` agree for
     `studio/library` contexts and counts.

7. Run verification and fix regressions within scope.
   - Run the targeted AX and Viewer commands listed below.
   - Run the broader format/check gates before handing implementation to
     review.
   - If implementation unexpectedly touches plugin agents, plugin skills, or
     workflows, stop and revise this plan with eval and plugin validation before
     proceeding.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX catalog/runtime data | `pnpm --filter @alexandria/ax run test -- src/domain/library-catalog.test.ts tests/runtime-server.test.ts` | Verifies `areas` and `fillReadiness.areas` expose the contexts and counts the index consumes. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches accidental catalog type drift if AX tests are touched. |
| Viewer runtime/unit tests | `pnpm --filter @alexandria/viewer run test` | Verifies runtime decoding, helper/view-model behavior, route tests, and unchanged legacy client compatibility. |
| Viewer static checks | `pnpm --filter @alexandria/viewer run check` | Required for the touched React/Astro surface. |
| Viewer production build | `pnpm --filter @alexandria/viewer run build` | Verifies the shipped Viewer still builds. |
| Viewer browser matrix | `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` | Proves index landing, context drill, canonical order, empty state, legacy control, and existing context/card regressions in a browser. |
| Repo formatting/check gate | `pnpm run format:check` and `pnpm run check` | Keeps TypeScript/JSON/YAML formatting, markdown, shell, lint, and workspace checks coherent. |

Manual smoke after implementation:

1. Run `ax start viewer`.
2. Open `/library/empty?libraryRoot=studio/library`.
3. Confirm the first view is the index.
4. Confirm Product contains `board` and `readiness-fixture` with matching counts.
5. Click `board` and confirm the existing context view opens.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer index/context navigation | Deterministic Viewer unit and Playwright browser tests. | Add browser coverage; add pure helper tests only if view-model logic is extracted. | `pnpm --filter @alexandria/viewer run test` and targeted Playwright command above. |
| AX catalog data consumed by index | Deterministic AX domain/runtime tests. | Tighten assertions for area/readiness count alignment; no eval harness. | `pnpm --filter @alexandria/ax run test -- src/domain/library-catalog.test.ts tests/runtime-server.test.ts`. |
| Product plugin agents/skills/workflows | Not changed by this slice. | No eval rerun required. | None. |

No eval-harness rerun is required because this slice does not change bundled
agents, skills, reusable plugin workflows, prompts, or eval-backed behavior.
`EVALS.md` only requires evals when those product-facing reusable surfaces
change. If implementation unexpectedly edits `packages/alexandria-plugin`, stop
and revise this plan with the targeted eval list before merging.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The index could accidentally derive fillable counts from cards instead of using the catalog projection. | Build the index count map from `catalog.fillReadiness.areas` and assert the displayed counts match fixture readiness rows. |
| Context names may collide across planes. | Key drill state and readiness lookup by `area.id` / `areaId`, not by context label alone. |
| Empty canonical planes could disappear because `catalog.meta.planes` only includes present planes. | For schema-aware index rendering, start from the canonical plane list and then append unexpected payload planes. |
| Adding an index default could regress the existing readiness and catalog tests. | Keep `Fill readiness` and `Catalog` as explicit workbench views and update tests to assert those views still render. |
| Legacy catalogs could get schema-aware UI by accident. | Gate index behavior on `catalog.fillReadiness != null` and keep a browser/client legacy-control test. |
| A focused context view could fork the context renderer and drift from the shipped context altitude. | Reuse `CatalogAreaTree` / `ContextStory` rather than creating a second context renderer. |
| Folder-like index cards could become a generic file tree or explanatory page. | Keep the UI to plane headings, context labels, and counts; avoid rationale/validation text on screen. |
| The already-large `EmptyLibraryView.tsx` could become harder to maintain. | Extract `LibraryIndexView` and any pure grouping helper if the patch would otherwise make the file materially harder to review. |

## Acceptance / Exit Criteria

1. `/library/empty?libraryRoot=studio/library` lands on an index altitude for
   the schema-aware Studio library.
2. The index renders canonical plane sections in order:
   `Strategy`, `Product`, `Learning`.
3. The Product section includes clickable `board` and `readiness-fixture`
   contexts.
4. Each context item displays its card count and fillable count from
   `fillReadiness.areas`.
5. Clicking `board` drills into the existing context view and shows the current
   Work Board story, diagram, and pieces.
6. A multi-plane fixture proves non-product contexts render under their own
   canonical plane sections rather than under Product.
7. Empty planes and a whole schema-aware library with no contexts render
   visible empty states and do not crash.
8. A legacy catalog without the schema opt-in / without `fillReadiness` keeps
   the existing legacy path and does not land on the index.
9. The existing catalog card list and existing context/card story interactions
   still render.
10. Targeted AX tests, Viewer unit/check/build, Viewer browser tests, and repo
    format/check gates pass.

## Deferred Follow-Ups

1. Add the product-level authored story body / Pillar narrative after the index
   map is proven.
2. Build the atomic-card altitude.
3. Prove and polish full index -> context -> card recursion, including any
   direct deep-link URL semantics if directors need shareable context links.
4. Re-point BoH/FoH walks to produce these review pages only after all three
   altitudes connect.
5. Add live lints for R1-R7, parity, and orphan checks after the surface flow is
   proven end to end.
