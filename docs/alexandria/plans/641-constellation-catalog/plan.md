# Technical plan — Slice C1: Constellation off the stale graph model

## Header

- Issue: [#641](https://github.com/GetAlexandria/alexandria-internal/issues/641)
  — "Constellation: drive stars from the live catalog, not the stale graph
  model"
- Goal: `ConstellationView` renders named, type-colored stars grouped into
  labeled constellations by the library's real contexts, driven by the same
  `LibraryCatalog` the Engine view uses — not the separate, stale
  `LibraryGraph` model.
- Linked product plan: `docs/alexandria/plans/library-word-legibility/plan.md`
  (Part C). Read-only input; this is the separate per-issue artifact.

## Scope

- New catalog-driven positioning in `graph-utils.ts`: containers (contexts,
  reusing `buildEngineViewModel`'s container derivation/order) placed via
  golden-angle-spiral (no hardcoded centers — none of the real bundle's old
  cluster keys ever matched `CLUSTER_CENTERS` anyway); cards within a
  container placed via the existing per-cluster spiral math, reused as-is.
- Rewrite `ConstellationView.tsx`: takes `catalog: LibraryCatalog`; stars
  colored via `typeDescriptor`; one "key star" per constellation (highest
  out-degree among that container's members, ties broken by `prefLabel`)
  always labeled; other stars labeled on hover; hover/glow/connection-fade
  preserved, re-sourced from `catalog.edges`; sidebar swaps the old
  territory-count legend for a context-count summary + the shared
  `TypeLegend` (issue #637).
- `library-mode-config.ts`: flip `constellation`'s `dataNeed` from `"graph"`
  to `"catalog"` (a one-line change in the existing dispatch table).
- `LibraryBrowserApp.tsx`: move the `mode === "constellation"` render branch
  from the graph-gated block into the catalog-gated block (alongside
  engine/index/etc.), passing `catalog` instead of `graph`.
- Update the e2e tests whose premise the migration invalidates (see "Current
  Gap" — precise line numbers already confirmed by reading the file, not
  guessed).

## Non-Goals

- `FolderLibraryView.tsx`, `CardDrawer.tsx`, `groupCards`, `clusterKey`,
  `cardsById` — untouched. Folders keeps reading `LibraryGraph` exactly as
  today.
- No containment lines between stars — that's C2 (a separate, later issue).
- No deletion of `CLUSTER_CENTERS`/`TERRITORY_COLORS`/`TERRITORY_BACKGROUNDS`/
  `buildPositionedGraph`/`PositionedLibraryGraph` from `graph-utils.ts` — they
  become unused by Constellation but stay in the file until C2 removes them
  (keeps this diff reviewable as "new model works," separate from cleanup).
- No change to `library-graph.ts` (ax) or its endpoint — still serves Folders.

## Current Gap

`ConstellationView.tsx` takes `graph: LibraryGraph`, positions cards via
`buildPositionedGraph` (hardcoded `CLUSTER_CENTERS`, none of which match the
real bundle — confirmed by reading the bundle's actual context set, all 13
of which fall to the golden-angle-spiral fallback already), colors stars via
`TERRITORY_COLORS` (4 legacy keys — `experience/product/rationale/temporal`
— matching none of the real bundle's contexts, so every star renders the
same default amber). It has no "key star" concept and shows only the
cluster's *type-folder* label (`clusterKey(cards[0]).split("/")[1]`), never
an individual card's name, on the canvas.

**E2E blast radius, confirmed by reading the actual spec file (not
assumed):**
- `tests/library-browser.spec.ts:612-618` ("Deep link: Constellation") —
  navigates and checks visibility only; likely survives unchanged, verify.
- `tests/library-browser.spec.ts:1787-1796` ("Library graph 404 renders the
  graceful panel on the Constellation surface") — uses
  `useLibraryFailureFixture(page, "graph-404")`. Once Constellation no
  longer fetches the graph, a graph 404 has zero effect on it — **this
  test's premise is invalidated and must be repointed to `catalog-404`**
  (that failure mode already exists, used elsewhere at line 1748).
- `tests/library-browser.spec.ts:1860-1878` ("Viewer Constellation reads the
  draft graph with an explicit root") — asserts a `/api/library/graph`
  request with `libraryRoot`/`draftPatchLog` params, then asserts the old
  "Territories" aside contains `"product"` / `"3 cards"` from
  `sampleLibraryGraph`. **Must rewrite**: assert a `/api/library/catalog`
  request instead, and rewrite the "proof of rendering" assertion against
  the new sidebar content (context-count summary / `TypeLegend`), not the
  retired Territories legend.
- `tests/library-browser.spec.ts:1917-1927` ("the graph-backed views carry
  the override too") — this assertion is against **Folders**, not
  Constellation. Unaffected.
- `tests/library-browser.spec.ts:1940-1942` (part of "Library runtime
  success paths...") — visibility + no-error-panel check only; likely
  survives unchanged, verify.

## Architectural Boundaries

- `graph-utils.ts` keeps serving Folders (`groupCards`, `clusterKey`,
  `cardsById`) unchanged; the new Constellation positioning logic is
  additive, not a replacement of those functions.
- Container derivation/order is owned by `engine-view-model.ts`
  (`buildEngineViewModel`/`buildZoneDrafts`) — Constellation consumes it,
  never re-derives contexts or their order a second way.
- Star color is owned by `typeDescriptor`/`engineTypeDescriptor` — never a
  new or duplicated palette.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Positioning | `packages/viewer/src/components/library/graph-utils.ts` | New catalog-driven container+star positioning, additive alongside the existing (now Constellation-unused, still Folders-used) functions. |
| Constellation | `packages/viewer/src/components/library/ConstellationView.tsx` | Takes `catalog`, not `graph`; type-colored stars; key-star labeling; context-count + `TypeLegend` sidebar. |
| Mode config | `packages/viewer/src/components/library/library-mode-config.ts` | `constellation`'s `dataNeed` flips `"graph"` → `"catalog"`. |
| App shell | `packages/viewer/src/components/library/LibraryBrowserApp.tsx` | Moves the constellation render branch into the catalog-gated block. |
| E2E | `packages/viewer/tests/library-browser.spec.ts` | Repoint the graph-404 and draft-root tests to catalog, per "Current Gap" above. |

## Agent / Skill Behavior Changes

None. Pure viewer presentation + data-source change.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| viewer unit/component tests (new) | `bun test src/components/library/ConstellationView.test.tsx src/components/library/graph-utils.test.ts` (new files) + `library-mode-config.test.ts` | Cover container derivation parity with the Engine view, star color resolution, key-star selection, empty-catalog handling, the `dataNeed` flip. |
| viewer typecheck | `pnpm exec astro check` | Repo-standard gate. |
| viewer full test script | `bun run test` (adding the new test files to `package.json`, per the CI-gap lesson from #640) | Regression pass. |
| viewer e2e | `pnpm exec playwright test` | The graph-404/draft-root tests specifically exercise this migration; a repeat of #638's lesson (unit tests alone missed a live-browser regression). |
| repo format | `pnpm run format:check` | Prettier gate. |

## Eval Impact

None — no agent/skill/plugin behavior touched.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Missing an e2e test whose premise silently breaks (a graph-model assumption baked into an assertion that still happens to pass, for the wrong reason). | Read the full e2e spec file for every `constellation`/`Constellation` reference before writing code (done — five sites found, three need changes, two don't); run the *full* e2e suite before opening the PR, not just the obviously-affected tests. |
| `FolderLibraryView`/`CardDrawer` regress because a shared `graph-utils.ts` helper gets touched by accident. | Scope fence: only add new functions; do not modify `groupCards`, `clusterKey`, `cardsById`, or their call sites. Run the full test suite, not just Constellation-scoped tests. |
| The real bundle's 13 constellations render as visual clutter or overlap badly (untested at this density before). | Manually verify against the live `alexandria-product` bundle, not just synthetic test fixtures, before opening the PR. |
| Key-star selection (highest out-degree, tie-break by `prefLabel`) has no existing precedent to copy exactly right. | Unit-test it directly and explicitly, including a tie case, before wiring it into the render. |

## Implementation Steps

1. `graph-utils.ts`: add catalog-driven positioning (containers from
   `buildEngineViewModel`'s zones, golden-angle-spiral centers, per-card
   spiral placement reusing the existing spacing math) as new, additive
   exports — existing Folders-serving functions untouched.
2. Add key-star selection (per container: highest out-degree among member
   cards, computed from `catalog.edges`; ties broken by `prefLabel`).
3. Rewrite `ConstellationView.tsx`: new props (`catalog`), new rendering
   (context regions, type-colored stars, key-star always-labeled, hover
   dims/highlights via `catalog.edges` connectivity), new sidebar (context
   counts + `TypeLegend`).
4. `library-mode-config.ts`: flip `constellation`'s `dataNeed`.
5. `LibraryBrowserApp.tsx`: move the constellation branch into the
   catalog-gated block.
6. Update the three e2e tests identified above; leave the two unaffected
   ones alone (verify, don't blind-edit).
7. Add new unit tests (positioning, color, key-star selection, empty
   catalog) and add the new test file(s) to `package.json`'s `test` script.
8. Run deterministic verification (table above); fix fallout.
9. Manually verify against the real `alexandria-product` bundle (13
   contexts as of this writing).
10. Local review pass against this plan + the issue's acceptance criteria.
11. Open the PR against `main`.

## Acceptance / Exit Criteria

Mirrors issue #641's acceptance criteria directly (see issue for full text):
one region per real context, matching the Engine view's container set; no
hardcoded per-container position; star color matches `typeDescriptor`
exactly, including `typeMapping`-resolved cases; exactly one always-labeled
key star per constellation, others on hover; hover dims/highlights via
catalog edges; Folders/CardDrawer completely unaffected; `graph-utils.ts`'s
old constants no longer read by Constellation (deletion deferred to C2); an
empty catalog renders without crashing.

## Deferred Follow-Ups

1. Slice C2: containment lines between stars + delete the now-fully-dead
   `CLUSTER_CENTERS`/`TERRITORY_COLORS`/`TERRITORY_BACKGROUNDS`/
   `buildPositionedGraph`/`PositionedLibraryGraph` from `graph-utils.ts`.
2. Fully retiring `library-graph.ts`/its endpoint — blocked on Folders and
   `CardDrawer` migrating too, out of scope beyond even C2.
