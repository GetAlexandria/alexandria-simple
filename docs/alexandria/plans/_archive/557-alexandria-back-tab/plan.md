# Alexandria Back Tab Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#557`
- Run ID: `01KWGAE0ZEQMNT3B8JGFA2WD7Z`
- Plan path: `docs/alexandria/plans/557-alexandria-back-tab/plan.md`
- Goal: add an **Alexandria Back** library tab in the viewer that renders the
  Back-of-House sweep bundle at `studio/sweeps/alexandria-product/` with the
  same read-only catalog surface as PMS-Back.
- Linked product plan: none provided. The user-supplied issue body is the
  product source for this slice.
- Related source material:
  - `docs/alexandria/plans/pms-library-handoff/pms-back-plan.md`
  - `docs/alexandria/plans/446-pms-drafts/plan.md`
  - `docs/alexandria/plans/rebuilding-the-library/plan.md`
  - `packages/viewer/README.md`
- Source limitation: `gh` is not installed in this workspace, and unauthenticated
  GitHub API access to the private issue returned `404`. This plan uses the
  complete issue body supplied in the execution prompt; no issue comments were
  available during planning.

## Scope

- Add a viewer route and library tab for `/library/alexandria-back`.
- Label the tab `Alexandria Back`.
- Load the catalog through the existing runtime request shape with
  `libraryRoot=studio/sweeps/alexandria-product`.
- Reuse the same read-only `EmptyLibraryView` render path used by PMS-Back and
  PMS-Drafts: no confirm, edit, refresh, or mutation affordances.
- Keep PMS-Back rooted only at `studio/sweeps/playmaker-studio`.
- Keep PMS-Drafts rooted at `studio/sweeps/playmaker-studio` plus
  `studio/drafts/playmaker-studio/patches.json`.
- Add an honest blank state for read-only Back surfaces that names the expected
  root path when the loaded catalog has no cards, gaps, or areas.
- Add deterministic viewer tests for the Alexandria Back fixture load, missing
  or empty bundle blank state, and PMS-Back root regression.

## Non-Goals

- Do not build an Alexandria Drafts, Final, FoH overlay, or patch-log surface.
- Do not write to or synthesize content under `studio/sweeps/alexandria-product/`.
- Do not edit `studio/sweeps/playmaker-studio/`.
- Do not change PMS-Back or PMS-Drafts behavior except for refactoring shared
  mode configuration in a way that keeps their observable behavior pinned by
  tests.
- Do not change plugin skills, plugin workflows, hosted product operations, or
  public CLI behavior.
- Do not add a new renderer for Alexandria-specific library cards, reports,
  threads, or diagrams.

## Current Gap

The viewer currently has read-only PMS library modes but no Alexandria Back
mode:

- `packages/viewer/src/components/library/types.ts` defines `LibraryViewMode`
  with `pms-back` and `pms-drafts`, but no Alexandria mode.
- `packages/viewer/src/components/library/viewer-routes.ts` parses and
  serializes `/library/pms-back` and `/library/pms-drafts`, but not
  `/library/alexandria-back`.
- `packages/viewer/src/components/library/LibraryBrowserShell.tsx` hardcodes
  the library tab buttons.
- `packages/viewer/src/components/library/LibraryBrowserApp.tsx` hardcodes the
  PMS root constants and branches on PMS modes in `catalogRequestForRoute`,
  `needsCatalog`, mode changes, and read-only rendering.
- `packages/viewer/src/components/library/EmptyLibraryView.tsx` has a generic
  blank catalog message. It does not name the root that was expected to contain
  the bundle, so a missing Alexandria bundle would look like a generic empty
  catalog.
- `packages/ax/src/effects/library-graph-loader.ts` already treats a missing
  explicit `libraryRoot` as an empty catalog through `readDirectoryIfPresent`.
  The viewer needs to expose that honestly rather than masking it or falling
  back to PMS data.

## Architectural Boundaries

- The bundle root is data. Represent read-only Back surfaces with a typed config
  entry that carries mode, label, route, `libraryRoot`, and optional
  `draftPatchLog`.
- The React render path stays shared. Alexandria Back should enter
  `EmptyLibraryView` through the same read-only branch as PMS-Back, with a
  different root value.
- The AX runtime API already supports `GET /api/library/catalog?libraryRoot=...`.
  Do not add an Alexandria-specific API endpoint.
- Prefer passing a viewer-known `sourcePath` or `emptyStatePath` prop to
  `EmptyLibraryView` for the blank-state copy. Avoid broad catalog schema
  changes just to print the route's configured root.
- Preserve the viewer README's Effect boundary: if runtime client behavior
  changes, keep it in `src/app/runtime/*`; pure visual components should receive
  ordinary props.
- Keep Back surfaces read-only by omitting `runtimeClient` and
  `onCatalogRefresh` from `EmptyLibraryView`.
- Test the configured root explicitly so `/library/alexandria-back` cannot
  accidentally reuse `studio/sweeps/playmaker-studio`.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Viewer route model | `packages/viewer/src/components/library/types.ts`, `viewer-routes.ts`, `viewer-routes.test.ts` | Add `alexandria-back` mode, parse `/library/alexandria-back`, serialize it, and expose a route helper. |
| Viewer library mode configuration | `packages/viewer/src/components/library/LibraryBrowserApp.tsx`, optionally a new small config file under `components/library/` | Centralize read-only Back surface data so PMS-Back, Alexandria Back, and PMS-Drafts share request/render logic with different roots. |
| Viewer tab strip | `packages/viewer/src/components/library/LibraryBrowserShell.tsx` | Show an `Alexandria Back` tab alongside existing library tabs. Prefer deriving repeated tab buttons from data to avoid more hardcoded button divergence. |
| Viewer blank state | `packages/viewer/src/components/library/EmptyLibraryView.tsx`, `EmptyLibraryView.test.tsx` | When a read-only catalog is blank and a source path is supplied, show the expected path, including `studio/sweeps/alexandria-product`. |
| Viewer fixture server and browser tests | `packages/viewer/tests/serve-viewer-fixture.ts`, `packages/viewer/tests/library-browser.spec.ts` | Add Alexandria Back fixture coverage, missing or empty root coverage, and PMS-Back exact-root regression. |
| Optional AX regression | `packages/ax/src/domain/library-catalog.test.ts` or a nearby loader test | If no current test pins it, add a test-only regression that a missing explicit `libraryRoot` returns an empty catalog rather than an error. No AX implementation change is expected. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Product plugin skills | None | No plugin docs, skill prompts, or plugin validation changes are required. |
| Maintainer skills | None | No contributor skill behavior changes are required. |
| CLI tools | None | No CLI contract, exit code, or output-field changes are required. |
| Viewer product surface | Adds the Alexandria Back QA surface | Viewer unit, build, and browser validation are required. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Viewer type and Astro checks | `pnpm --filter @alexandria/viewer run check` | Verifies route/type changes and React prop changes compile under the package-local check. |
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Runs route serialization, runtime client, and `EmptyLibraryView` tests after the new mode and blank state. |
| Viewer browser tests | `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` | Exercises the real viewer shell, tabs, catalog rendering, and no-overflow checks around the library surface. |
| Viewer production build | `pnpm --filter @alexandria/viewer run build` | Confirms the shipped static viewer builds after the route and component changes. |
| Optional AX loader regression | `pnpm --filter @alexandria/ax run test -- src/domain/library-catalog.test.ts` or the existing AX test command for the touched file | Only needed if adding the missing-explicit-root regression in AX tests. |

During local iteration, a targeted Playwright grep for the new tests is fine,
but the full viewer `test:e2e -- tests/library-browser.spec.ts` should run
before implementation exit.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Viewer library navigation and catalog rendering | Viewer unit tests and Playwright tests cover route parsing, tab behavior, and catalog rendering. | Add deterministic tests in the viewer suites; no eval-harness rerun required. | `pnpm --filter @alexandria/viewer run test`; `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` |
| Plugin agents and skills | No reusable agent or skill behavior changes in this slice. | No eval-harness coverage required. | None |
| CLI behavior | No CLI behavior changes in this slice. | No CLI black-box tests required beyond optional AX loader regression if the implementation adds that test. | None |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Alexandria Back accidentally falls back to PMS data because both surfaces use the same renderer. | Put the roots in explicit typed data and add browser or fixture assertions that `/library/alexandria-back` requests exactly `studio/sweeps/alexandria-product` while `/library/pms-back` requests exactly `studio/sweeps/playmaker-studio`. |
| The new tab forks PMS-Back rendering and drifts later. | Share the read-only Back surface branch and only vary mode config. Do not create an Alexandria-specific component. |
| Missing or empty bundle state looks like a generic empty catalog and hides the path Jess should check. | Pass the configured root to the blank state and assert the rendered empty state contains `studio/sweeps/alexandria-product`. |
| Refactoring tab buttons changes PMS tab behavior or route serialization. | Add route unit tests for PMS-Back, PMS-Drafts, and Alexandria Back; keep PMS browser regression coverage. |
| The wider tab strip causes cramped or overflowing library navigation. | Keep the existing wrapping tab layout, and include a browser no-horizontal-overflow assertion after opening the Alexandria Back tab. |
| The fixture test renders a sample catalog even when the request root is wrong. | Make the Alexandria fixture mode validate the `libraryRoot` query before returning the Alexandria catalog; return an error or root-specific empty catalog for mismatches. |
| Real Alexandria bundle content may not exist yet or may be incomplete during implementation. | Do not depend on live bundle contents for the core tests. Use fixture catalogs for rendering and rely on the loader's existing missing-directory behavior for the empty state. |

## Implementation Steps

1. Add `alexandria-back` to `LibraryViewMode` and `ViewerRoute`.
2. Add `/library/alexandria-back` parsing, serialization, and a
   `libraryAlexandriaBackRoute()` helper in `viewer-routes.ts`; update
   `viewer-routes.test.ts`.
3. Introduce a small typed configuration for library modes that need fixed
   catalog requests. Include:
   - `pms-back`: label `PMS-Back`, root `studio/sweeps/playmaker-studio`
   - `alexandria-back`: label `Alexandria Back`, root
     `studio/sweeps/alexandria-product`
   - `pms-drafts`: label `PMS-Drafts`, root `studio/sweeps/playmaker-studio`,
     draft patch log `studio/drafts/playmaker-studio/patches.json`
4. Update `LibraryBrowserApp.tsx` to derive catalog requests, catalog loading
   need, read-only rendering, and mode navigation from that config instead of
   one-off PMS branches.
5. Update `LibraryBrowserShell.tsx` to render the Alexandria Back tab. If
   practical, extract the repeated library mode button markup into a local
   helper or data-driven map while preserving labels and styling.
6. Add an optional `emptyStatePath` or similarly named prop to
   `EmptyLibraryView`. When `blankCatalog` is true and the prop is present,
   render copy that names the expected root path. Keep existing generic blank
   copy for callers without a source path.
7. Pass `studio/sweeps/alexandria-product` as the blank-state path for
   Alexandria Back. Passing the same prop for PMS-Back is acceptable, but the
   required assertion is for Alexandria Back.
8. Extend the Playwright fixture server with an Alexandria Back catalog fixture
   that includes at least one context/card, one thread or Notepad row, and one
   diagram-bearing card or existing diagram fixture equivalent. The fixture
   should only return this catalog when the incoming `libraryRoot` equals
   `studio/sweeps/alexandria-product`.
9. Add an empty Alexandria fixture mode that returns a blank catalog only for
   `libraryRoot=studio/sweeps/alexandria-product`; assert the rendered empty
   state names that path and does not contain PMS-specific data.
10. Add or update browser tests:
    - `Alexandria Back renders a fixture bundle` opens
      `/library/alexandria-back`, confirms the tab is visible/active, and checks
      context/card/thread/report or diagram signals from the Alexandria fixture.
    - `Alexandria Back missing bundle shows expected-path empty state` opens
      `/library/alexandria-back` with the empty fixture and checks
      `studio/sweeps/alexandria-product`.
    - `PMS-Back still requests the PMS root` opens `/library/pms-back` with a
      root-validating fixture and checks the request root is
      `studio/sweeps/playmaker-studio`, with no Alexandria content.
11. If there is no AX test for missing explicit roots, add a narrow test around
    `loadLibraryCatalogRoot` or `loadLibraryCatalog` proving a missing
    `studio/sweeps/alexandria-product` root returns a zero-count catalog.
12. Run the deterministic verification commands listed above.

## Acceptance / Exit Criteria

1. The viewer shows a tab labeled `Alexandria Back` alongside the existing
   library tabs.
2. Opening `/library/alexandria-back` requests
   `/api/library/catalog?libraryRoot=studio%2Fsweeps%2Falexandria-product`
   and renders through `EmptyLibraryView`.
3. A fixture Alexandria bundle renders the same categories of information as
   PMS-Back: contexts, cards, threads/Notepad, reports or metadata diagnostics,
   and diagrams when present in the catalog.
4. With a missing or empty Alexandria bundle, the tab renders a blank state that
   names `studio/sweeps/alexandria-product`, does not error, and does not show
   PMS data.
5. PMS-Back continues to request only
   `studio/sweeps/playmaker-studio` and has no Alexandria root, label, or
   content in its regression test.
6. PMS-Drafts continues to request the PMS root plus
   `studio/drafts/playmaker-studio/patches.json`.
7. Alexandria Back, PMS-Back, and PMS-Drafts share the same catalog request and
   read-only render plumbing, with root and draft-log differences represented
   as data.
8. Viewer unit, build, and browser validation pass.

## Deferred Follow-Ups

1. Add an Alexandria Drafts or Final surface only after the PMS FoH/Drafts motion
   in issues `#539` and `#540` proves the pattern.
2. Re-sweep or repair the actual `studio/sweeps/alexandria-product/` bundle in a
   separate bundle-content issue if it is missing, incomplete, or malformed.
3. Improve diagram rendering generally if the Alexandria bundle exposes gaps in
   the existing diagram renderer; do not solve that by special-casing
   Alexandria Back.
4. Add hosted product navigation or operator docs only if the hosted Alexandria
   instance needs this tab surfaced outside the local viewer workflow.
