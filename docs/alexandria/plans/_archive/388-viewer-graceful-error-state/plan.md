# Issue #388 - Viewer Graceful Runtime Error State

## Header

- Issue: [#388](https://github.com/GetAlexandria/alexandria-internal/issues/388), "L1 - Viewer: graceful error state instead of raw ViewerHttpError JSON"
- Run ID: `01KVXA6YZ4KSNEN3CSQKX2T9NQ`
- Goal: replace raw serialized runtime/API failures on viewer library/data surfaces with a product-grade error panel that gives a plain-language message and a Retry action.
- Linked product plan: [`docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`](../studio-fixes/phase-2-build-plan.md), lane L1.
- Issue comments checked: the issue thread only contains Fabro local run links; no additional technical constraints beyond the issue body.

## Scope

This slice is viewer-only and applies to runtime-client-backed library/data surfaces:

1. Library catalog surfaces: `/library` Engine view and `/library/empty`.
2. Library graph surfaces: `/library/folders` and `/library/constellation`.
3. Card-detail drawer content fetches inside Folder fallback.
4. Viewer browser fixtures and tests needed to force runtime/API failures and prove Retry recovery.
5. A small UI-safe error presentation helper or component in `packages/viewer/src/components/library/`.

## Non-Goals

1. Do not change `ViewerHttpError`, `ViewerRuntimeError`, runtime client fetch behavior, schemas, or any `/api/*` response contract.
2. Do not change AX CLI behavior.
3. Do not change Alexandria plugin skills, agents, workflows, or eval harness behavior.
4. Do not write to `docs/alexandria/library/`.
5. Do not redesign library surfaces or introduce a new panel style.
6. Do not refactor Studio board/view code in this lane. `StudioApp.tsx` is a visual reference only so L1 stays parallel-safe with the Studio work-board lane.

## Linked Product-Plan Summary

Phase 2 lane L1 says runtime/API failures currently surface raw `{"_tag":"ViewerHttpError",...}` JSON in the viewer. The required behavior is a graceful error state: a bordered panel, plain-language copy, and Retry. The existing Studio unavailable state is the reference treatment. Verification requires forcing a backend error and confirming the panel appears instead of raw JSON.

## Current Gap

The viewer already keeps Effect at the runtime boundary, which is the right architecture, but the library UI collapses runtime failures into strings too early and renders those strings directly:

1. `packages/viewer/src/components/library/error-message.ts` returns `error.message` or `String(error)`. Unknown object failures can become raw serialized object text.
2. `useLibraryCatalog` stores `error: string | null` and exposes `refresh`, but `refresh` currently throws on failure instead of turning Retry failures back into stable UI state.
3. `useLibraryGraph` stores `error: string | null` but has no `refresh`/Retry entry point.
4. `useLibraryCardDetail` stores `error: string | null` but has no `refresh`/Retry entry point.
5. `LibraryBrowserApp.tsx` renders catalog and graph failures as a bare red `<div>{error}</div>`.
6. `CardDrawer.tsx` renders card-detail failures as a small red paragraph with the raw error string and no Retry.

The Studio sibling panel, `StudioUnavailable`, already shows the desired product posture, but its implementation includes a technical-details block. For the library surfaces in this issue, raw `_tag` / `ViewerHttpError` text must not appear in rendered DOM, so the library panel should match the treatment while omitting raw technical details.

## Architectural Boundaries

1. Runtime boundary stays in `packages/viewer/src/app/runtime/*`: fetch, decode, and typed Effect errors remain unchanged.
2. React hooks remain the adapter layer: they run runtime Effects, translate failures into ordinary UI state, and expose Retry callbacks.
3. Visual components receive ordinary props: no Effect code inside the error panel or card drawer.
4. Error presentation must be allowlisted, not stringified. Known runtime failures can influence a plain message, but `error.body`, `_tag`, serialized objects, stack traces, and `String(object)` output must not be rendered.
5. Retry should call the same fetch owner that failed. It should clear stale error state on success, preserve a single panel on repeated failures, and avoid stacking or growing messages.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Library runtime error copy | `packages/viewer/src/components/library/error-message.ts` or a new nearby helper such as `runtime-error-copy.ts` | Provide UI-safe, plain-language copy for catalog, graph, and card-detail failures without rendering serialized runtime objects |
| Shared library error panel | New `packages/viewer/src/components/library/RuntimeUnavailablePanel.tsx` or similar | Render a Studio-matching bordered panel with message and Retry, without raw technical details |
| Catalog hook | `packages/viewer/src/components/library/hooks/useLibraryCatalog.ts` | Make `refresh` catch failures and update stable error state so Retry is idempotent |
| Graph hook | `packages/viewer/src/components/library/hooks/useLibraryGraph.ts` | Add a `refresh` callback that re-runs `getLibraryGraph` and updates error/loading state |
| Card-detail hook | `packages/viewer/src/components/library/hooks/useLibraryCardDetail.ts` | Add a retry callback for the selected card fetch and keep card-change reset behavior |
| Library app rendering | `packages/viewer/src/components/library/LibraryBrowserApp.tsx` | Replace bare catalog/graph error divs with the graceful panel and wire Retry to the right hook |
| Folder/card drawer rendering | `packages/viewer/src/components/library/FolderLibraryView.tsx`, `packages/viewer/src/components/library/CardDrawer.tsx` | Pass card-detail retry into the drawer and replace the raw error paragraph with the panel treatment sized for drawer content |
| Viewer browser fixtures | `packages/viewer/tests/serve-viewer-fixture.ts` | Add deterministic fixture modes for catalog, graph, and card-detail 4xx/5xx failures and one unexpected malformed/invalid response |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Prove panel/no-raw-DOM/retry-to-recovery/repeated-retry behavior for catalog, graph, and card detail |
| Viewer unit tests | New focused test if a helper is added; `packages/viewer/package.json` test script if needed | Lock the safe-copy helper so unknown object errors do not stringify raw tags into UI text |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Alexandria plugin agents | None | No plugin validation required for this slice |
| Alexandria plugin skills | None | No skill eval reruns required |
| Maintainer skills | None | The technical-planning skill guided this plan only; no behavior change |
| CLI tools | None | No CLI black-box or exit-code tests required |
| Viewer product UI | Library/data surfaces fail gracefully and expose Retry | Viewer unit, build/check, and browser validation required |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Covers any new helper/hook test and guards existing runtime/client and library model behavior |
| Viewer type/Astro check | `pnpm --filter @alexandria/viewer run check` | Confirms React props, hooks, and Astro integration compile |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Required viewer build validation for shipped product surface |
| Viewer browser tests | `pnpm --filter @alexandria/viewer run test:e2e` | Exercises forced catalog, graph, and card-detail failures in the actual browser DOM |
| Formatting | `pnpm --filter @alexandria/viewer run format:check` | Confirms TypeScript/TSX formatting remains repo-standard |

Targeted browser assertions to add:

1. Catalog 500 on `/library` shows one error panel, a Retry button, no `_tag`, no `ViewerHttpError`, no raw JSON, and recovers after the fixture switches back to success.
2. Catalog 404 on `/library/empty` shows the same graceful panel and remains stable across repeated Retry clicks while still failing.
3. Graph 500 on `/library/folders` or `/library/constellation` shows the panel, not the folder/graph loading state forever, and recovers on Retry.
4. Graph 404 covers the second HTTP error class for graph fetches.
5. Card-detail 500 after opening a folder card shows the panel inside the drawer content section, keeps drawer close/resize controls functional, and recovers on Retry.
6. Card-detail 404 covers the second HTTP error class for card-detail fetches.
7. An unexpected response such as invalid JSON or schema-invalid payload on one library endpoint still renders the panel and never renders raw object text.
8. Success-path loads for Engine, Empty Library, Folder fallback, Constellation, and card detail show no error panel.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer library UI | Covered by deterministic unit and Playwright browser tests, not by the agent eval harness | Add/extend viewer tests only | `pnpm --filter @alexandria/viewer run test` and `pnpm --filter @alexandria/viewer run test:e2e` |
| Plugin skills/agents | Not touched | No eval-harness rerun required | None |
| CLI behavior | Not touched | No eval-harness or CLI black-box coverage required | None |

No eval-harness coverage is required because this slice changes viewer presentation only. It does not alter reusable agent, skill, prompt, workflow, or CLI behavior.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The fix accidentally hides useful typed runtime errors by changing `ViewerHttpError` or the runtime client | Keep all runtime types and client APIs unchanged; translate failures only in library hooks/UI |
| The library panel drifts visually from Studio | Copy the panel treatment from `StudioUnavailable` for border, background, spacing, typography, and Retry styling; avoid inventing a new visual style |
| Reusing Studio's details block would violate the no-raw-DOM contract | Do not render technical details in the library panel for this issue; log details only if needed for debugging |
| Retry works for catalog but not graph/card detail because only catalog currently exposes `refresh` | Add explicit refresh/retry callbacks to graph and card-detail hooks and wire tests to each endpoint |
| Repeated failed retries create stacked panels or growing error strings | Store one error state per hook and replace it on each failure; assert a single panel after multiple retries |
| Browser tests become flaky if failure mode state leaks between tests | Prefer explicit fixture cookies/headers or reset endpoints per test; clear or overwrite fixture mode before success-path assertions |
| Changing card drawer props breaks stories or successful drawer behavior | Keep prop changes narrow, update affected stories if TypeScript requires it, and preserve existing resize/close browser assertions |

## Implementation Steps

1. Add a UI-safe runtime error copy helper near the library components. It should return plain copy for catalog, graph, card-detail, HTTP, network, JSON/decode, and unknown failures without rendering `_tag`, `ViewerHttpError`, `body`, raw JSON, or `String(object)`.
2. Add a library runtime unavailable panel component that mirrors the Studio unavailable treatment: bordered panel, short heading, plain message, and Retry button. Do not include technical details in this library panel.
3. Refactor `useLibraryCatalog` so both initial load and `refresh` use the same load path, set loading/error state consistently, catch failures, and clear error on success.
4. Refactor `useLibraryGraph` to expose `refresh`, use the safe copy helper, clear error on success, and keep the initial-load behavior unchanged when `initialGraph` is supplied.
5. Refactor `useLibraryCardDetail` to expose a retry callback for the current selected card, preserve reset-on-card-change behavior, and avoid stale detail/error when the selection changes.
6. Replace the catalog and graph bare error divs in `LibraryBrowserApp.tsx` with the panel and wire Retry to `refreshCatalog` or `refreshGraph`.
7. Pass the card-detail retry callback through `FolderLibraryView.tsx` into `CardDrawer.tsx`, then render the panel in the drawer content section when detail loading fails.
8. Extend `serve-viewer-fixture.ts` with deterministic failure modes for `/api/library/catalog`, `/api/library/graph`, and `/api/library/cards/*`. Failure bodies should intentionally include `_tag` / `ViewerHttpError` text in at least one mode so tests prove the UI does not render it.
9. Extend `library-browser.spec.ts` with the forced HTTP 4xx/5xx, repeated retry, retry-to-recovery, unexpected error, no-raw-DOM, and success-path checks listed above.
10. Add or update focused unit coverage for the safe-copy helper if it is a standalone module, and include it in the viewer `test` script if the script remains an explicit file list.
11. Run the deterministic verification commands and fix only issues in this slice.

## Acceptance / Exit Criteria

1. For catalog, graph, and card-detail runtime/API failures, the viewer renders a graceful panel with a plain-language message and Retry.
2. The strings `_tag` and `ViewerHttpError` do not appear in rendered DOM text for the affected library/data surfaces, including fixture bodies that contain those strings.
3. Retry re-runs the same failed fetch and successful recovery replaces the panel with the normal surface.
4. Repeated retries while still failing keep one stable panel; there is no crash, no duplicate panel stack, and no growing error text.
5. Successful catalog, graph, and card-detail loads show no error panel.
6. Existing successful render behavior for Engine, Empty Library, Folder fallback, Constellation, and card detail remains unchanged.
7. Effect remains at the runtime API boundary; presentation stays in ordinary React UI code.
8. Viewer unit/check/build/browser validation passes, or any failure is documented as unrelated with concrete evidence.

## Deferred Follow-Ups

1. After concurrent Studio board work is complete, consider extracting Studio and library unavailable panels into one shared viewer component if duplication becomes a maintenance problem.
2. Consider adding graceful panels for other runtime-backed surfaces such as Ledger, Raven Vision, or source intake in separate issues; this issue is scoped to catalog, graph, and card-detail surfaces.
3. Consider a non-DOM debug channel for raw runtime error details if maintainers need inspection without exposing raw objects to Directors.
