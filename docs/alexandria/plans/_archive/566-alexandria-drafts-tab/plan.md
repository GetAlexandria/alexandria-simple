# Alexandria Drafts Tab Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#566`
- Issue title: "Alexandria Drafts tab: the live draft window pointed at the Alexandria bundle"
- Issue URL: <https://github.com/GetAlexandria/alexandria-internal/issues/566>
- Run ID: `01KWH6A41TN4V37FCGB4B4NDWT`
- Date: 2026-07-02
- Plan path: `docs/alexandria/plans/566-alexandria-drafts-tab/plan.md`
- Goal: add an **Alexandria Drafts** library tab that uses the shipped #562
  fixed-mode Drafts architecture, but points it at Alexandria's Back-of-House
  bundle:
  - `libraryRoot: studio/sweeps/alexandria-product`
  - `draftPatchLog: studio/drafts/alexandria-product/patches.json`
  - `autoRefreshIntervalMs: 2000`
  - renderer: `PmsDraftsView`
- Linked product plan: none provided. The GitHub issue body is the product
  contract. The single issue comment only records the Fabro run URL.

## Sources Read

- Root `CLAUDE.md`, `README.md`, and `EVALS.md`.
- `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- GitHub Issue `#566` and its comments through the GitHub connector.
- Package-local viewer guidance: `packages/viewer/README.md`.
- Related local plans:
  - `docs/alexandria/plans/557-alexandria-back-tab/plan.md`
  - `docs/alexandria/plans/540-pms-drafts-live-foh-draft/plan.md`
- Current viewer implementation and tests:
  - `packages/viewer/src/components/library/library-mode-config.ts`
  - `packages/viewer/src/components/library/viewer-routes.ts`
  - `packages/viewer/src/components/library/types.ts`
  - `packages/viewer/src/components/library/LibraryBrowserApp.tsx`
  - `packages/viewer/src/components/library/LibraryBrowserShell.tsx`
  - `packages/viewer/src/components/library/PmsDraftsView.tsx`
  - `packages/viewer/src/components/library/DraftOverlayViews.tsx`
  - `packages/viewer/src/components/library/hooks/useLibraryCatalog.ts`
  - `packages/viewer/src/app/runtime/client.ts`
  - `packages/viewer/src/app/runtime/schemas.ts`
  - `packages/viewer/src/components/library/viewer-routes.test.ts`
  - `packages/viewer/tests/library-browser.spec.ts`
  - `packages/viewer/tests/serve-viewer-fixture.ts`
- Relevant runtime behavior:
  - `packages/ax/src/effects/library-graph-loader.ts`
  - `packages/ax/src/domain/library-draft-overlay.ts`
  - `packages/ax/src/domain/library-draft-overlay.test.ts`
- Repository state checked during planning:
  - `studio/sweeps/alexandria-product/` exists in this checkout.
  - `studio/drafts/alexandria-product/patches.json` is absent in this checkout.
    That absence is part of the empty-state acceptance path, not a blocker.

## Scope

- Add a new fixed library mode for `alexandria-drafts`.
- Add a viewer route for `/library/alexandria-drafts`.
- Add a library tab labeled `Alexandria Drafts`.
- Point the new fixed mode at:
  - base bundle root `studio/sweeps/alexandria-product`
  - draft overlay log `studio/drafts/alexandria-product/patches.json`
- Use the existing `PmsDraftsView` render path for fixed modes that carry a
  `draftPatchLog`.
- Use the existing `useLibraryCatalog` auto-refresh behavior with a 2-second
  interval.
- Add or update viewer tests for:
  - route parsing and serialization
  - mode-config request data
  - tab rendering against an Alexandria fixture bundle plus draft log
  - absent or empty Alexandria draft log empty state that names the expected log
    path
  - PMS-Drafts, PMS-Back, and Alexandria Back request isolation
  - no `mode === "alexandria-drafts"` special-case branches outside config and
    route dispatch

## Non-Goals

- Do not change `PmsDraftsView`'s draft grouping, card filtering, section
  rendering, diagnostics rendering, or live behavior.
- Do not change `useLibraryCatalog` polling, visibility handling, response
  caching, or request behavior.
- Do not change the existing PMS-Drafts fixed mode, PMS-Back fixed mode, or
  Alexandria Back fixed mode except where shared type/config plumbing must admit
  a second Drafts consumer.
- Do not add Alexandria-specific renderer branches or a new
  `AlexandriaDraftsView`.
- Do not change AX draft-overlay semantics unless implementation discovers an
  uncovered regression around absent logs. The current AX contract returns the
  base catalog with no `draftOverlay` when a draft log is absent or empty.
- Do not create or seed `studio/drafts/alexandria-product/patches.json` as part
  of this slice.
- Do not write to `docs/alexandria/library/`.
- Do not edit vendored repositories under `repos/`.
- Do not change plugin skills, plugin workflows, hosted product operations, or
  public CLI behavior.

## Linked Product-Plan Summary

There is no separate product plan. Issue `#566` asks for the second consumer of
the #562 fixed-mode Drafts architecture:

- PMS-Drafts already proves a live Drafts window over
  `studio/sweeps/playmaker-studio` plus
  `studio/drafts/playmaker-studio/patches.json`.
- Alexandria Drafts should be the same surface pointed at Alexandria's current
  Back-of-House bundle and draft log.
- The intended implementation is data-first: add a `FixedLibraryModeConfig`
  entry plus route/tab exposure, not new renderer logic.
- Issue `#563` may later relocate the Alexandria bundle path. This slice should
  build against the current path and keep any later re-point to one config-line
  change.

## Current Gap

The shipped viewer already has most of the architecture needed:

- `LibraryBrowserShell.tsx` builds fixed tabs from
  `FIXED_LIBRARY_MODE_CONFIGS`.
- `LibraryBrowserApp.tsx` asks `fixedLibraryModeConfig(route.mode)` for the
  request and auto-refresh interval.
- `LibraryBrowserApp.tsx` renders `PmsDraftsView` for any fixed config whose
  `draftPatchLog` is present.
- `useLibraryCatalog` already supports `autoRefreshIntervalMs`, skips hidden-tab
  polling, and reloads through the runtime API.
- `library-mode-config.ts` currently has fixed entries for `pms-back`,
  `alexandria-back`, and `pms-drafts`.

The missing pieces are:

- `LibraryViewMode` has no `alexandria-drafts` value.
- `ViewerRoute` does not parse, serialize, or construct
  `/library/alexandria-drafts`.
- `FixedLibraryMode` and `FIXED_LIBRARY_MODE_CONFIGS` do not include an
  Alexandria Drafts entry.
- `fixedLibraryModeConfig()` currently has a hardcoded list of fixed modes. The
  implementation should avoid spreading another mode-specific check beyond this
  config/dispatch layer.
- The browser fixture server returns `fixtureDraftCatalog()` for any
  `draftPatchLog`, without validating the requested `libraryRoot` or log path.
  That is too weak to prove Alexandria Drafts points at Alexandria data.
- Current PMS-Drafts tests cover PMS live refresh and PMS-Back isolation, but no
  Alexandria Drafts tab, route, fixture, or empty-log path copy.
- The current `PmsDraftsView` empty copy does not name a patch-log path. Because
  changing `PmsDraftsView` behavior is out of scope, the path-specific empty
  state should be supplied by config-driven wrapper/adjacent UI in the fixed
  Drafts dispatch, or by another data-driven route that does not change the
  shared Drafts component's core rendering.

## Architectural Boundaries

- Viewer owns route selection, tab labels, and runtime request construction.
- AX/runtime owns catalog and draft-overlay projection. The viewer must still
  fetch `/api/library/catalog`; it must not read workspace files or JSON logs
  directly.
- `FixedLibraryModeConfig` is the source of truth for fixed Back/Drafts modes:
  label, route helper, root, optional patch log, optional refresh interval, and
  any display-only empty-state path note.
- `PmsDraftsView` remains the Drafts renderer. Do not fork it for Alexandria.
- The new tab should be a second Drafts consumer because `draftPatchLog` exists
  in config, not because `LibraryBrowserApp` learns an Alexandria-specific
  condition.
- Existing route parsing/serialization is the allowed dispatch layer for a new
  path. Keep `mode === "alexandria-drafts"` checks confined to
  `viewer-routes.ts`, type tests, or `library-mode-config.ts` if a literal is
  unavoidable.
- The empty-log path requirement should not change PMS-Drafts. If wrapper UI is
  needed to name `studio/drafts/alexandria-product/patches.json`, gate it by
  config data, not by a `mode === "alexandria-drafts"` branch.
- Keep read-only Back surfaces read-only: no confirmation, edit, or mutation
  props on PMS-Back or Alexandria Back.
- Keep Drafts surfaces read-only windows: no edit, approval, confirmation, or
  materialization affordances.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Viewer route model | `packages/viewer/src/components/library/types.ts`, `packages/viewer/src/components/library/viewer-routes.ts`, `packages/viewer/src/components/library/viewer-routes.test.ts` | Add `alexandria-drafts` as a library mode, parse `/library/alexandria-drafts`, serialize it, and expose a route helper. |
| Fixed library mode config | `packages/viewer/src/components/library/library-mode-config.ts` and focused tests if added | Add constants for the Alexandria draft patch log and a `FixedLibraryModeConfig` entry labeled `Alexandria Drafts` with the Alexandria root, patch log, route, and `autoRefreshIntervalMs: 2000`. Prefer map-driven lookup over expanding hardcoded mode checks. |
| Viewer app dispatch | `packages/viewer/src/components/library/LibraryBrowserApp.tsx` | Continue deriving catalog request, polling interval, and Drafts rendering from fixed config. If path-specific empty copy is needed, add it through generic config-driven Drafts wrapper data, not a mode-specific branch. |
| Viewer tab strip | `packages/viewer/src/components/library/LibraryBrowserShell.tsx` | The tab should appear automatically from `FIXED_LIBRARY_MODE_CONFIGS`; adjust only if width/order/layout needs a data entry. |
| Viewer runtime request serialization | `packages/viewer/src/app/runtime/client.test.ts` if a new request serialization test is useful | Optionally add a test proving `draftPatchLog=studio/drafts/alexandria-product/patches.json` and `libraryRoot=studio/sweeps/alexandria-product` serialize together. No runtime implementation change is expected. |
| Browser fixture server | `packages/viewer/tests/serve-viewer-fixture.ts` | Make Drafts fixture responses validate the requested root and patch log, and provide an Alexandria Drafts fixture catalog/log state separate from PMS state or parameterized by requested paths. |
| Browser tests | `packages/viewer/tests/library-browser.spec.ts` | Add Alexandria Drafts fixture rendering, empty-log state, and four-surface request isolation assertions covering PMS-Drafts, PMS-Back, Alexandria Back, and Alexandria Drafts. |
| Optional AX regression | `packages/ax/src/domain/library-draft-overlay.test.ts` or loader tests | Only if needed, add a narrow regression that absent or empty Alexandria patch logs do not error and do not mutate the Back catalog. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Product plugin skills | None | No plugin docs, skill prompts, or plugin validation changes are required. |
| Maintainer skills | None | No contributor skill behavior changes are required. |
| CLI tools | None | No CLI contract, exit code, or output-field changes are required. |
| Viewer product surface | Adds a new Alexandria Drafts tab and route using existing Drafts behavior | Viewer unit, build, and browser validation are required. |
| Eval harness | None | No eval case or baseline changes are required for this viewer-only slice. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Viewer type and Astro checks | `pnpm --filter @alexandria/viewer run check` | Verifies route, type, React, and config changes compile under package-local checks. |
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Runs route, runtime-client, component, and any fixed-mode config/source-scan tests. |
| Viewer browser tests | `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` | Exercises the real tab strip, route navigation, catalog requests, live refresh, fixture rendering, empty state, and regression assertions. |
| Viewer production build | `pnpm --filter @alexandria/viewer run build` | Confirms the shipped static viewer builds after adding the tab and route. |
| Static no-branch check | Add a Bun/source-scan test or run `rg -n 'mode === "alexandria-drafts"|mode !== "alexandria-drafts"|case "alexandria-drafts"' packages/viewer/src/components/library -g '!viewer-routes.ts' -g '!library-mode-config.ts'` | Proves Alexandria Drafts did not become a special-case branch outside config/route dispatch. If implemented as a command rather than a test, document the output in the implementation handoff. |
| Optional AX regression | Existing AX test command for the touched AX test file | Only needed if implementation touches AX to pin absent-log behavior. |

During local iteration, a targeted Playwright grep for the new Alexandria Drafts
tests is acceptable. Before implementation exit, run the full viewer
`test:e2e -- tests/library-browser.spec.ts` command.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Viewer library navigation and Drafts rendering | Viewer unit tests and Playwright tests cover route parsing, fixed tabs, Drafts rendering, and catalog requests. | Add deterministic tests only. | `pnpm --filter @alexandria/viewer run test`; `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` |
| Plugin agents and skills | No reusable product agent or skill behavior changes. | No eval-harness rerun required. | None |
| CLI behavior | No CLI behavior changes. | No CLI black-box tests required. | None |
| AX draft overlay | Existing deterministic AX tests cover empty PMS logs and overlay projection. | No eval-harness coverage. Add a deterministic AX regression only if AX code changes. | Optional touched-file AX test command |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Alexandria Drafts accidentally reuses PMS root or PMS draft log because both Drafts tabs render the same component. | Put root and patch-log paths in explicit config constants and assert the exact request query params for both PMS-Drafts and Alexandria Drafts in browser tests. |
| Adding the new mode creates `mode === "alexandria-drafts"` branches in app rendering, weakening the config-as-data proof. | Keep app behavior keyed on `fixedConfig` and `fixedConfig.draftPatchLog`; add a source-scan assertion that no Alexandria Drafts mode checks exist outside route/config dispatch. |
| The fixture server accepts any `draftPatchLog`, so tests pass even when the real route points at the wrong bundle. | Make the fixture response validate both `libraryRoot` and `draftPatchLog`; return a mismatch response when either value is wrong. |
| The current `PmsDraftsView` empty copy does not name the expected log path, but changing it would affect PMS-Drafts. | Add path naming through config-driven wrapper/adjacent empty-state UI for Alexandria Drafts only, or another data-driven display field that does not change `PmsDraftsView` internals or PMS-Drafts output. |
| AX omits `draftOverlay` for absent or empty logs, so the viewer cannot rely on `draftOverlay.patchLogPath` to name the empty log. | Use the fixed config's `draftPatchLog` as the source for empty-state path copy. Keep AX behavior unchanged unless a deterministic absent-log bug is found. |
| Alexandria Back regresses while adding adjacent Alexandria Drafts route/config. | Preserve existing Alexandria Back config and add request assertions proving `/library/alexandria-back` still requests only `studio/sweeps/alexandria-product` and no `draftPatchLog`. |
| PMS-Drafts live behavior regresses because the fixture state is generalized for Alexandria. | Keep PMS-Drafts tests intact and add assertions that PMS-Drafts still requests `studio/sweeps/playmaker-studio` plus `studio/drafts/playmaker-studio/patches.json`, still starts empty, and still live-refreshes within 5 seconds. |
| Tab strip grows wider and causes horizontal overflow. | Use the existing wrapping tab layout and include no-horizontal-overflow browser assertions on the new tab path. |
| Issue #563 relocates the Alexandria bundle path during or after implementation. | Keep paths centralized in `library-mode-config.ts`; if #563 lands first, update the one config constant and expected test values. |

## Implementation Steps

1. Update `LibraryViewMode` in `types.ts` to include `alexandria-drafts`.
2. Update `ViewerRoute` in `viewer-routes.ts`:
   - add the `alexandria-drafts` library route variant
   - parse `/library/alexandria-drafts`
   - serialize `/library/alexandria-drafts`
   - add `libraryAlexandriaDraftsRoute()`
3. Update `viewer-routes.test.ts` to cover parsing and serializing
   `/library/alexandria-drafts`.
4. Update `library-mode-config.ts`:
   - add `ALEXANDRIA_DRAFT_PATCH_LOG =
     "studio/drafts/alexandria-product/patches.json"`
   - include `alexandria-drafts` in `FixedLibraryMode`
   - import `libraryAlexandriaDraftsRoute`
   - add a config entry:
     - `label: "Alexandria Drafts"`
     - `libraryRoot: ALEXANDRIA_PRODUCT_LIBRARY_ROOT`
     - `draftPatchLog: ALEXANDRIA_DRAFT_PATCH_LOG`
     - `autoRefreshIntervalMs: 2000`
     - a route helper pointing at `/library/alexandria-drafts`
   - keep PMS-Drafts, PMS-Back, and Alexandria Back config values unchanged.
5. Refine `fixedLibraryModeConfig()` so adding future fixed modes does not
   require another chain of mode literals. A map lookup with a narrow typed cast
   is preferable to another hardcoded `mode === ...` disjunction.
6. Confirm `LibraryBrowserShell.tsx` picks up the new tab from
   `FIXED_LIBRARY_MODE_CONFIGS`. Adjust only `minWidthClass` or ordering if the
   new label needs it.
7. Keep `LibraryBrowserApp.tsx` generic:
   - request data should come from `fixedLibraryCatalogRequest(fixedConfig)`
   - auto-refresh should come from `fixedConfig.autoRefreshIntervalMs`
   - Drafts rendering should continue to be selected by
     `fixedConfig.draftPatchLog != null`
   - no `mode === "alexandria-drafts"` checks should be introduced
8. Add config-driven empty-log path copy if the existing UI would not name
   `studio/drafts/alexandria-product/patches.json` when the log is absent or
   empty. Keep this outside `PmsDraftsView` internals if possible, and do not
   change PMS-Drafts output.
9. Update the viewer fixture server:
   - add constants for the Alexandria Drafts root and patch log
   - make Drafts catalog fixture responses validate both `libraryRoot` and
     `draftPatchLog`
   - either parameterize `fixtureDraftCatalog()` by requested product/root or
     add an Alexandria-specific fixture draft catalog that uses Alexandria card
     ids, paths, contexts, and section-confirmation text
   - keep PMS fixture state and controls working for existing PMS-Drafts tests
10. Add an Alexandria Drafts browser test:
    - open `/library/alexandria-drafts`
    - assert the `Alexandria Drafts` tab is active
    - assert the first catalog request has
      `libraryRoot=studio/sweeps/alexandria-product`
    - assert the request has
      `draftPatchLog=studio/drafts/alexandria-product/patches.json`
    - start from an empty fixture state and assert the empty state names the
      expected log path
    - apply a fixture draft patch and assert a draft card appears within 5
      seconds with a section header derived from the fixture
      `section_confirmed` metadata
    - assert `PmsDraftsView` test ids still render the Drafts surface
11. Add or extend empty-log coverage:
    - absent log and empty log may both be represented by fixture state, but the
      user-facing assertion must include
      `studio/drafts/alexandria-product/patches.json`
    - assert there are no draft cards before a valid patch lands
12. Add or extend regression coverage for fixed surfaces:
    - PMS-Drafts requests exactly `studio/sweeps/playmaker-studio` plus
      `studio/drafts/playmaker-studio/patches.json`
    - PMS-Back requests exactly `studio/sweeps/playmaker-studio` and no
      `draftPatchLog`
    - Alexandria Back requests exactly `studio/sweeps/alexandria-product` and no
      `draftPatchLog`
    - Alexandria Drafts requests exactly `studio/sweeps/alexandria-product` plus
      `studio/drafts/alexandria-product/patches.json`
13. Add a source-scan assertion, preferably as a Bun test, that
    `mode === "alexandria-drafts"` special cases do not appear outside
    `viewer-routes.ts` and `library-mode-config.ts`.
14. Optionally add a runtime-client request serialization unit test for the new
    Alexandria Drafts request shape if the browser request assertions are not
    considered sufficient.
15. Run the deterministic verification commands.

## Acceptance / Exit Criteria

1. The viewer shows a tab labeled `Alexandria Drafts`.
2. Opening `/library/alexandria-drafts` routes correctly and keeps the
   Alexandria Drafts tab active.
3. The Alexandria Drafts catalog request includes exactly:
   - `libraryRoot=studio/sweeps/alexandria-product`
   - `draftPatchLog=studio/drafts/alexandria-product/patches.json`
4. Alexandria Drafts uses the shipped Drafts behavior:
   - blank before valid patches
   - auto-refresh while open
   - valid fixture patch appears within 5 seconds
   - section header/summary renders from `section_confirmed` fixture metadata
   - draft cards render through `PmsDraftsView`
5. With the Alexandria draft log absent or empty, the tab shows an honest empty
   state naming `studio/drafts/alexandria-product/patches.json`.
6. PMS-Drafts is unchanged:
   - route remains `/library/pms-drafts`
   - request remains PMS root plus PMS draft log
   - live-refresh and empty-start browser coverage still pass
7. PMS-Back is unchanged:
   - request remains only `studio/sweeps/playmaker-studio`
   - no `draftPatchLog`
   - read-only Back surface still renders
8. Alexandria Back is unchanged:
   - route remains `/library/alexandria-back`
   - request remains only `studio/sweeps/alexandria-product`
   - no `draftPatchLog`
   - read-only Back surface still renders
9. No Alexandria Drafts renderer fork exists.
10. No `mode === "alexandria-drafts"` special case exists outside
    config/route dispatch.
11. Viewer unit, build, check, and browser validation pass.

## Deferred Follow-Ups

1. If Issue `#563` relocates the Alexandria bundle path, update the centralized
   config constant and expected tests in a separate slice.
2. If the Alexandria Front-of-House walk needs richer fixture data, add it to
   browser fixtures separately from this route/config proof.
3. Consider a future generic name for `PmsDraftsView` only when more consumers
   make the PMS-specific component name materially confusing. Do not rename it
   in this issue.
4. Event-driven Drafts refresh can be reconsidered later if polling becomes too
   expensive. This slice should keep #562's 2-second polling contract.
5. Hosted product navigation or operator docs can be updated only if the hosted
   Alexandria instance needs this tab surfaced outside the local viewer workflow.
