# Technical Plan: Issue 247 Sidebar Directory Tree

- Issue reference: `#247` - `[FEAT-007] Sidebar directory tree component`
- Goal: add a persistent, collection-backed sidebar tree to the viewer card pages so users can browse the library by layer, type folder, and card, with the current card highlighted and folder expansion preserved during navigation
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-007.md`

## Scope

- Add the repo-specific technical plan for issue `#247`
- Build a viewer-side tree model from the existing `libraryCards` collection entries and shared route metadata
- Add a React sidebar component that renders layers, type folders, and card links as an expandable tree
- Persist expanded folder state across full-page navigation so the sidebar stays open on the same branches after visiting another card
- Integrate the sidebar into the card-page layout while preserving the existing five-dimension content surface
- Extend black-box viewer coverage so served and built card pages prove the sidebar hierarchy, active-card highlighting, and persisted expansion state

## Non-Goals

- Rework the graph parser, the `libraryCards` collection schema, or the filesystem-derived route contract from `#244`
- Add search, reverse links, breadcrumb trails, dashboard navigation, or plans navigation
- Introduce client-side routing or convert the viewer into a SPA
- Change the Alexandrian theme beyond the styling needed to support the sidebar tree cleanly
- Modify product-facing agents, skills, setup flows, or release/version files

## Current Gap

- Viewer card pages currently render only the main article surface; there is no persistent navigation tree on `/library/...` routes.
- The viewer already knows every card's `layer`, `typeFolder`, `cardName`, and `routePath`, but it does not aggregate that metadata into a reusable directory-tree model.
- There is no browser-side state for expanded folders, so navigation cannot preserve browsing context between page loads.
- Existing viewer tests cover card layout and wikilink rendering, but they do not assert sidebar hierarchy, active-link treatment, or persisted expansion behavior.

## Architectural Boundaries

- Keep the source of truth for tree contents in the existing `libraryCards` collection and route helpers. Do not re-walk the filesystem separately from the collection layer inside the React component.
- Keep interactivity narrowly scoped to the sidebar component. The card route should still be static and server-rendered, with React only hydrating the navigation shell needed for expand/collapse persistence.
- Pass compact tree data and current-route props from Astro into the React component rather than teaching the client to rediscover card metadata at runtime.
- Limit this slice to card pages, where navigation is immediately useful. Broader viewer-shell unification for the home page, dashboard, or plans surfaces belongs to later tickets.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/247-sidebar-directory-tree/plan.md` | Captures repo-specific scope, verification, and boundaries for FEAT-007 |
| Viewer library tree data | `packages/viewer/src/lib/*` | Collection entries can be grouped into a deterministic layer -> type folder -> card tree without duplicating route logic |
| Viewer sidebar component | `packages/viewer/src/components/*` | Card pages render a client-hydrated expandable navigation tree with active-card styling and persisted expansion state |
| Viewer card layout | `packages/viewer/src/layouts/CardLayout.astro`, `packages/viewer/src/pages/library/[...slug].astro`, `packages/viewer/src/styles/global.css` | Card pages include the sidebar alongside the existing five-dimension article and expose the current route to the sidebar |
| Deterministic verification | `src/tools/viewer.test.ts` | Viewer tests assert tree rendering, active highlighting, and expansion-state persistence through the real CLI/build workflow |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Viewer issue work gains a concrete sidebar-navigation contract built on top of the shared collection metadata | Later viewer tickets should reuse the same tree helper for any adjacent navigation surfaces instead of rebuilding grouping logic ad hoc |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer package type/content check | `bun --cwd packages/viewer astro check` | Verifies the new Astro-to-React props flow, sidebar component typing, and collection-backed card route code compile correctly |
| Viewer static build | `bun --cwd packages/viewer astro build` | Confirms every card page can build with the sidebar tree embedded and linked |
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Exercises served and built card pages for sidebar hierarchy, active state, and persisted expansion through the actual CLI entry point |
| Repo baseline checks | `bun run check` | Ensures formatting, markdown, shell, and TypeScript surfaces remain green after the viewer changes |
| Repo deterministic suite | `bun test` | Confirms the sidebar slice does not regress existing CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable product-facing agents and skills, not the viewer UI | No eval reruns required if the final diff stays limited to viewer code, tests, and plan docs | none |
| Viewer sidebar navigation | No eval-backed viewer behavior exists yet | Deterministic Astro and CLI verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Tree grouping could drift from emitted routes if it reconstructs URLs differently from the existing route helper | Build the tree from collection entries that already include `routePath` and keep route derivation centralized in the existing helper |
| Hydrated sidebar state could reset on every page load if the persisted expansion key is unstable | Persist explicit layer/type-folder node keys derived from collection metadata and assert state carry-over in a served-browser test |
| Adding a client component could accidentally wrap too much of the card page and regress static readability or build output | Restrict hydration to the sidebar only and keep the article layout server-rendered in Astro |
| The sidebar could overfit to current library contents and skip valid folders or future layers | Build grouping logic from generic collection fields and cover it with the real library plus fixture-based assertions where needed |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#247`.
2. Add a small viewer helper that groups `libraryCards` collection entries into a stable tree shape keyed by layer and type folder.
3. Create a React sidebar component that renders tree nodes, toggles layer/type visibility, stores expanded keys in `localStorage`, and highlights the current card route.
4. Update the card page route and layout to pass tree data plus current-route metadata into the sidebar and render the sidebar/article split.
5. Extend `src/tools/viewer.test.ts` to assert sidebar hierarchy and active state in static build output, and to exercise expansion-state persistence in a served page flow.
6. Run `bun --cwd packages/viewer astro check`, `bun --cwd packages/viewer astro build`, `bun test src/tools/viewer.test.ts`, `bun run check`, and `bun test`.
7. Perform a local review pass against the diff and plan, then update or open the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/247-sidebar-directory-tree/plan.md` exists and matches the FEAT-007 repo slice.
2. Card pages render a sidebar tree whose top-level groups correspond to library layers.
3. Expanding a layer reveals its type-folder groups, and expanding a type folder reveals individual card links.
4. Clicking a card link navigates to the correct `/library/...` route.
5. The current card is visually highlighted in the sidebar.
6. Expanded folders remain expanded after navigating between card pages.
7. `bun --cwd packages/viewer astro check` passes.
8. `bun --cwd packages/viewer astro build` passes.
9. `bun run check` passes.
10. `bun test` passes.
11. A PR for `symphony/247` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Add broader viewer-shell navigation for non-card routes in the dashboard and plans tickets instead of expanding this card-page slice.
2. Consider breadcrumb or related-card affordances separately if later navigation tickets need them.
3. Reuse the same tree model for search indexing or keyboard navigation only if a future ticket explicitly scopes that work.
