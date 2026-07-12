# PMS Card Detail Typed Links Coverage Plan

- Issue: [#465](https://github.com/GetAlexandria/alexandria-internal/issues/465)
- Goal: lock the global card-detail typed-links behavior introduced by #460 with non-Draft coverage, and record why the Empty/PMS renderer remains separate from the Engine drawer renderer.
- Linked product plan: none. The GitHub issue is the product and technical source for this slice.

## Scope

This slice is limited to the viewer library card-detail surface:

1. Add builder-facing context at `EmptyLibraryView`'s typed-links renderer explaining that it intentionally renders raw `card.links` as static labels.
2. Add deterministic browser coverage proving typed links render on `/library/pms-back`, not only `/library/pms-drafts`.
3. Add negative coverage proving cards with no effective links do not show an empty "Typed links" block.
4. Keep the existing PMS-Drafts draft trail plus typed-links e2e passing.
5. Add invisible test ids needed for durable assertions. Do not change visible product copy.

## Non-Goals

1. Do not converge `EmptyLibraryView` typed links with `EngineCardDrawer`.
2. Do not add navigation to the Empty/PMS card-detail typed-links block.
3. Do not add target resolution to the Empty/PMS surface.
4. Do not change AX runtime, routes, schemas, catalog loading, or card frontmatter parsing.
5. Do not edit `docs/alexandria/library/`.
6. Do not change plugin skills, agents, workflows, or eval harness behavior.

## Linked Product-Plan Summary

There is no separate product plan. Issue #465 freezes this decision:

1. Typed links in card detail are global library behavior for empty-library, PMS-Back, and PMS-Drafts surfaces.
2. Link visibility must not depend on Drafts mode, draft trails, or whether a card was patched.
3. `EngineCardDrawer` and `EmptyLibraryView` have intentionally different renderers:
   - Engine renders projected graph edges with resolved `otherCard` data and navigation.
   - Empty/PMS renders raw `card.links` frontmatter as static wikilink labels.
4. Shared key labels must continue to flow through `humanizeLinkKey` from `library-peek-view-model`.

## Current Gap

`packages/viewer/src/components/library/EmptyLibraryView.tsx` already has a local `TypedLinks` renderer. It walks `card.links`, skips empty value arrays, humanizes keys with `humanizeLinkKey`, and renders comma-joined `wikilinkLabel` values. It returns `null` when there are no entries.

The gap is coverage and maintainability:

1. The browser test that currently observes the block is the PMS-Drafts test, where `fixtureDraftCatalog()` patches `Surface - Library` with `links.related_to`.
2. `/library/pms-back` currently has no typed-links assertion, so a future Drafts gate or accidental removal would not be caught.
3. There is no code comment explaining why this renderer is separate from `EngineCardDrawer`, so a future refactor could merge incompatible data sources.

## Architectural Boundaries

The Empty/PMS renderer should stay local to `EmptyLibraryView` because it receives raw catalog cards and does not have the Engine view's projected drawer link model.

The Engine drawer should stay unchanged. It receives `EngineDrawerLink[]`, including resolved `otherCard` details and `onNavigate`. Reusing it for Empty/PMS would either remove Engine navigation or require new target resolution plumbing that is out of scope.

The shared behavior boundary is only the human-readable relationship key:

```text
raw key -> humanizeLinkKey -> visible label
```

Do not fork this label logic.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| Empty/PMS card detail | `packages/viewer/src/components/library/EmptyLibraryView.tsx` | Add a code comment at `TypedLinks`; pass the card id into `TypedLinks` to add a stable `data-testid` for the block |
| Engine drawer | `packages/viewer/src/components/library/EngineCardDrawer.tsx` | No behavior change; named only in the comment as the navigable edge-projected counterpart |
| Viewer browser fixtures | `packages/viewer/tests/serve-viewer-fixture.ts`; existing `samplePeekLibraryCatalog` from `sample-catalog.ts` | Add a test-only catalog mode, for example `typed-links`, that serves a non-Draft catalog with linked and no-link cards |
| Viewer e2e | `packages/viewer/tests/library-browser.spec.ts` | Add PMS-Back typed-links positive and negative assertions; scope the existing PMS-Drafts assertion to the typed-links block |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | None | None |
| Viewer UI | Raw typed links remain visible globally in Empty/PMS card detail | Viewer tests only |
| Eval harness | None | None |

## Implementation Steps

1. Confirm #460 is present on the branch by checking that `EmptyLibraryView.tsx` contains the local `TypedLinks` renderer. If it is missing, stop and rebase onto the branch that contains #460 rather than recreating that work.
2. In `EmptyLibraryView.tsx`, add a short code comment immediately above `TypedLinks`:
   - state that this renderer intentionally displays raw `card.links` from frontmatter as static labels;
   - state that it has no resolved targets and no navigation;
   - point to `EngineCardDrawer` as the navigable edge-projected counterpart.
3. Add a stable invisible test target to the typed-links block for robust browser assertions. Preferred shape:
   - change `TypedLinks` props from `{ links }` to `{ cardId, links }`;
   - render `data-testid={`catalog-card-typed-links-${testIdPart(cardId)}`}` on the block wrapper;
   - update the call site to `<TypedLinks cardId={card.id} links={card.links} />`.
4. Add a test-only catalog fixture mode in `packages/viewer/tests/serve-viewer-fixture.ts`:
   - import `samplePeekLibraryCatalog`;
   - allow cookie/header mode `typed-links`;
   - return a cloned catalog based on `samplePeekLibraryCatalog`;
   - omit or empty `workflows` in this fixture so PMS-Back stays a no-workflow surface;
   - keep `Capability - Grade Play` as the positive card with `contains`, `derived_from`, and `operates_on`;
   - patch `Value - Loose End` to `links: { related_to: [] }` so the negative case covers an empty effective link map while `Value - Rubric` still covers an absent `links` map.
5. Update `useCatalogFixture()` in `library-browser.spec.ts` to accept the new `typed-links` mode.
6. Add a PMS-Back browser test:
   - `await useCatalogFixture(page, "typed-links")`;
   - `await page.goto("/library/pms-back")`;
   - assert `empty-library-view` is visible;
   - assert there is no Draft overlay summary and no Workflow tab;
   - open the `Catalog` tab;
   - click `catalog-card-capability-grade-play`;
   - assert `catalog-card-typed-links-capability-grade-play` is visible and contains `contains`, `Rubric`, `derived from`, `Brief`, `operates on`, and `Play`;
   - assert there is no `catalog-draft-trail-capability-grade-play`.
7. In the same PMS-Back test, click both no-link cards:
   - `catalog-card-value-rubric` for absent `links`;
   - `catalog-card-value-loose-end` for empty effective links;
   - assert their typed-links test ids have count `0`;
   - assert the prior positive block is no longer present, so the negative check cannot pass because stale selected-card detail remained mounted.
8. Add or extend an Empty Library route assertion with the same fixture:
   - load `/library/empty?libraryRoot=studio/library`;
   - open the `Catalog` tab;
   - click `catalog-card-capability-grade-play`;
   - assert the typed-links block renders. This locks that the global behavior is not restricted to PMS routes.
9. Tighten the existing PMS-Drafts test:
   - keep the draft trail assertions;
   - replace broad `emptyView` text checks for typed links with a scoped assertion on `catalog-card-typed-links-surface-library`;
   - assert the block contains `related to` and `Card Drawer`.
10. Do not touch `EngineCardDrawer` beyond the comment reference from `EmptyLibraryView`.

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| Viewer unit/component suite | `pnpm --filter @alexandria/viewer run test` | Catches TypeScript/runtime regressions in existing viewer component and view-model tests |
| Viewer typecheck | `pnpm --filter @alexandria/viewer run check` | Ensures the new fixture mode, props, and test ids typecheck under Astro/TS |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Confirms the shipped static viewer still builds |
| Browser regression coverage | `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` | Runs the PMS-Back, PMS-Drafts, and Empty Library browser tests that exercise the card-detail block |

If the full browser spec is too slow during local iteration, first run a grep-targeted Playwright pass for the new PMS-Back test and the existing PMS-Drafts test, then run the full command above before exit.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| Viewer card-detail UI | Covered by deterministic viewer browser tests, not eval harness | Add/adjust Playwright assertions | `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` |
| Alexandria plugin skills/agents | Not touched | No eval rerun required | None |
| CLI behavior | Not touched | No eval or CLI black-box tests required | None |

No `pnpm eval` run is required for this slice because no reusable agent, skill, template, or eval-backed plugin behavior changes.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| A future change gates typed links behind PMS-Drafts or `draftTrail` | Add `/library/pms-back` coverage using a non-Draft catalog with links and assert there is no draft trail |
| A future change removes typed links from the generic Empty Library route while preserving PMS routes | Add an Empty Library route assertion using the same non-Draft typed-links fixture |
| Browser tests pass by finding unrelated "Typed links" text elsewhere | Add a card-keyed `data-testid` on the typed-links block and assert inside that block |
| Negative coverage passes while the old selected card detail is still mounted | After selecting a no-link card, assert the prior linked card's typed-links test id is gone |
| A future refactor merges the raw-links renderer with `EngineCardDrawer` and breaks one interaction model | Add the explicit code comment at `TypedLinks` documenting raw static links vs navigable edge projection |
| Adding a linked fixture accidentally changes PMS-Back's no-workflow expectations | Make the `typed-links` test fixture omit or empty `workflows`, and keep the existing PMS-Back no-workflow test passing |

## Acceptance / Exit Criteria

1. A PMS-Back card-detail test proves a card with raw `card.links` renders the typed-links block outside Drafts.
2. A card with no effective links renders no typed-links block and no empty "Typed links" heading.
3. The Empty Library route still renders typed links for cards with `links`.
4. The PMS-Drafts draft trail plus typed-links browser test still passes and asserts the typed-links block in a scoped way.
5. `EmptyLibraryView` contains a builder-facing comment documenting that its typed-links renderer is intentionally raw/static and distinct from `EngineCardDrawer`.
6. `humanizeLinkKey` remains the shared key-label source.
7. No AX runtime, route, schema, plugin, or CLI files change.
8. Viewer unit, check, build, and browser validation pass or any inability to run them is explicitly recorded in the implementation handoff.

## Deferred Follow-Ups

1. If Empty/PMS card detail should become navigable later, create a separate issue to plumb resolved edge projection into that surface.
2. If more card-detail metadata blocks accumulate, consider a small local test harness for selected-card detail rendering, but do not export private UI solely for this issue unless browser coverage becomes too brittle.
3. If the real PMS-Back sweep gains a stable lightweight fixture path in the browser server, replace the synthetic `typed-links` fixture with that production-shaped fixture.
