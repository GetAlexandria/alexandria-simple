# Technical Plan: Issue 229 AX2 Viewer Routes And URL-Backed Library State

## Header

- Issue reference: GitHub issue `GetAlexandria/alexandria-internal#229`, "Add AX2 viewer routes and URL-backed library state".
- Goal: make Alexandria Next viewer surfaces and Library folder workspace state addressable through durable browser URLs while preserving the existing React presentation.
- Linked product plan: no separate checked-in product plan was available from the provided issue context.
- Source note: the issue body supplied in the run request is the source of truth for this plan. Direct GitHub comment inspection was attempted, but `gh` is not installed in this environment and the private issue page was not accessible through browser fetch.

## Scope

This slice lands first-class client-side routes for `packages/viewer-next` and the server fallback needed for those routes to load directly.

In scope:

- Add a typed, pure viewer route module for Alexandria Next viewer paths and query state.
- Make top-level viewer navigation URL-backed instead of only storing `activeView` in React state.
- Support direct loads and in-app navigation for this route contract:

  ```text
  /                         -> home
  /library                  -> library, constellation mode
  /library/folders          -> library, folder mode
  /playbook                 -> playbook
  /info                     -> Info Hub placeholder
  /ledger                   -> Ledger disabled/placeholder route
  /raven/knowledge-bank     -> Raven Knowledge Bank
  /raven/vision             -> Vision onboarding
  ```

- Make Library folder state URL-backed at `/library/folders` with repeated `open=` params and one `card=` param:

  ```text
  /library/folders?open=product%2Fagents&open=rationale%2Fstandards&card=product%2Fagents%2FAgent%20-%20Raven
  ```

- Support multiple open folders in the folder view.
- Resolve a direct card URL to the existing card drawer presentation.
- Automatically open the selected card's containing folder as effective UI state even when the containing folder is not present in `open=`.
- Remove only `card=` when the card drawer closes, preserving all `open=` params and unrelated query state.
- Update the Playwright fixture server so all non-API deep-link paths serve the viewer app rather than returning 404.
- Add deterministic unit and browser coverage for route parsing, direct deep links, in-app navigation, back/forward behavior, open folder restoration, and direct card drawer restoration.
- Add or preserve AX2 viewer-server black-box coverage proving `ax2 start viewer` serves deep-link paths through the static viewer app.

## Non-Goals

- Do not change Alexandria 1 viewer code under `packages/viewer`.
- Do not migrate, rename, delete, or replace Alexandria 1 surfaces.
- Do not add a new router framework unless the local implementation becomes harder to maintain than the dependency. A small typed browser route module is sufficient for this route set.
- Do not URL-back the Library search box in this slice.
- Do not add editing, card creation, or workspace mutation from the viewer.
- Do not change the AX2 runtime API contract except for tests that preserve existing static serving behavior.
- Do not move route parsing into Effect. Effect remains limited to runtime API calls and decoding boundaries already present in `packages/viewer-next/src/app/runtime/*`.
- Do not write directly to `docs/alexandria/library/`.
- Do not change `packages/alexandria-next-plugin` skills or play behavior unless implementation discovers a hard dependency. This plan assumes no plugin payload change.

## Current Gap

`packages/viewer-next` currently renders a single static Astro page at `/` and mounts `LibraryBrowserApp` as a client-only React app. Inside that app:

- `LibraryBrowserApp.tsx` stores `activeView` and Library `mode` in local React state.
- `StoneTopBar.tsx` and `LibraryBrowserShell.tsx` use callbacks that only mutate local React state.
- `FolderLibraryView.tsx` stores `openFolder` as a single `string | null`, so only one subfolder can be open.
- `FolderLibraryView.tsx` stores `selectedCard` locally, so the card drawer cannot be restored from a URL.
- The search box is local state, which is correct for this first pass.

The production AX2 runtime server already has the right broad behavior: non-API paths in viewer mode fall back to `index.html`. The Playwright fixture does not match it yet. `packages/viewer-next/tests/serve-viewer-fixture.ts` currently tries to serve the exact requested static file and returns 404 when `/playbook`, `/library`, or `/library/folders` is requested directly.

## Architectural Boundaries

- `packages/viewer-next` owns browser route parsing, browser history updates, and mapping routes to React view state.
- Route parsing and URL mutation should be ordinary TypeScript using `URL`, `URLSearchParams`, `window.history`, and `popstate`.
- `packages/viewer-next/src/app/runtime/*` remains the Effect boundary for local `/api/*` calls, Schema decoding, typed runtime errors, and SSE cleanup.
- Pure visual components should continue to receive ordinary props and callbacks. They should not import Effect or call runtime APIs unless they already own that boundary.
- `packages/ax-next` owns serving the viewer and runtime APIs. This slice should only adjust server code if tests expose a real production mismatch; current inspection indicates only tests should be needed there.
- `packages/alexandria-next-plugin` owns guided play behavior. This route slice should not alter plugin skills, agents, manifests, or eval-backed behavior.

## Proposed Route Model

Add a small typed route module in `packages/viewer-next`, for example:

```text
packages/viewer-next/src/components/library/viewer-routes.ts
```

The module should expose route types and pure helpers similar to:

```ts
type ViewerRoute =
  | { surface: "home" }
  | { surface: "library"; mode: "constellation" }
  | {
      surface: "library";
      mode: "folders";
      openFolders: string[];
      selectedCardPath: string | null;
    }
  | { surface: "playbook" }
  | { surface: "info" }
  | { surface: "ledger" }
  | { surface: "raven-knowledge-bank" }
  | { surface: "raven-vision" }
  | { surface: "not-found"; path: string };
```

Expected helper responsibilities:

- Parse `window.location.pathname` and `window.location.search` into `ViewerRoute`.
- Serialize a `ViewerRoute` back to a path plus query string.
- Build folder keys as `territory/subfolder`.
- Build card paths as `territory/subfolder/card.id`.
- Use `URLSearchParams` for encoding and repeated `open=` params rather than manual string concatenation.
- Preserve unknown query params when updating owned Library folder state.
- Deduplicate repeated `open=` values while keeping serialized output stable, preferably sorted by folder key.
- Treat malformed or unknown routes defensively without throwing during initial render.

`LibraryBrowserApp` should become the route owner:

- Initialize its route state from `window.location`.
- Register one `popstate` listener to re-parse the route for browser back/forward.
- Use a single navigation helper around `history.pushState` and `history.replaceState`.
- Map route state to the existing rendered surfaces.
- Keep API state loading and SSE handling unchanged.

Navigation rules:

- Top-level user navigation uses `pushState`.
- Library mode buttons navigate to `/library` and `/library/folders`.
- Opening or closing a folder updates repeated `open=` params and uses `pushState`.
- Selecting a card sets `card=` and uses `pushState`.
- Closing the card drawer deletes only `card=` and uses `pushState`.
- If implementation chooses to normalize an invalid route or an internal startup state, use `replaceState` so it does not add unwanted back-stack entries.

## Library Folder URL Contract

Folder keys:

- A folder key is exactly `${territory}/${subfolder}` from the runtime Library graph.
- `open=` values are folder keys.
- Multiple open folders are represented by repeated `open=` params.

Card paths:

- A card path is exactly `${territory}/${subfolder}/${card.id}` from the runtime Library graph.
- The value is stored in one `card=` param.
- The card path is resolved against the loaded graph before fetching card detail.
- If the graph has not loaded yet, the route state is retained and the drawer waits for a matching card.
- If no card matches, render folder mode without the drawer and avoid calling the card-detail API for a nonexistent card.

Effective open folders:

- The explicit open set comes from `open=` query params.
- When `card=` resolves to a graph card, the selected card's containing folder is added to the effective open set for rendering.
- The implicit folder does not need to be written back to the URL during initial direct-load restoration.
- Closing the drawer removes only `card=`, so an implicitly opened folder closes unless it is also present in `open=`.

State preservation:

- Updating open folders deletes and rewrites only the `open=` params.
- Closing the drawer deletes only `card=`.
- Unknown query params should be preserved for future route extensions.
- The Library search input remains local React state and is not read from or written to the URL.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical plan | `docs/alexandria/plans/229-ax2-viewer-routes-url-library-state/plan.md` | Captures the approved implementation scope and verification plan |
| Viewer route layer | `packages/viewer-next/src/components/library/viewer-routes.ts`, likely `viewer-routes.test.ts` | Adds typed parsing/serialization for surface routes and Library folder query state |
| Viewer app route owner | `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx` | Replaces local `activeView` and `mode` as the navigation source of truth with URL-derived route state |
| Viewer shell/navigation | `packages/viewer-next/src/components/library/LibraryBrowserShell.tsx`, `StoneTopBar.tsx`, `types.ts` | Top nav, Library mode controls, Info, Ledger, Raven Knowledge Bank, and Vision use route navigation |
| Folder Library view | `packages/viewer-next/src/components/library/FolderLibraryView.tsx`, `graph-utils.ts` if helper reuse fits | Supports multiple open folders and controlled selected-card state from the route |
| Placeholder surfaces | Existing or small new components under `packages/viewer-next/src/components/library/` | Renders Info Hub and Ledger route placeholders without inventing new product behavior |
| Playwright fixture server | `packages/viewer-next/tests/serve-viewer-fixture.ts` | Matches production viewer fallback by serving `index.html` for non-API deep-link paths |
| Viewer e2e tests | `packages/viewer-next/tests/library-browser.spec.ts` | Covers direct routes, navigation URL updates, browser history, open folder restoration, and direct card drawer restoration |
| AX2 viewer server tests | `packages/ax-next/tests/viewer.test.ts` | Black-box assertions that `ax2 start viewer` serves deep-link paths and still keeps unknown `/api/*` paths out of static fallback |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents | None expected | None |
| Product skills | None expected | None |
| `ax-next-start` skill | No wording change expected; it may continue to refer users to the Viewer generally | No plugin validation or eval rerun required unless implementation edits `packages/alexandria-next-plugin` |
| AX2 CLI command contract | No new CLI flags, modes, exit codes, or stdout fields | Preserve existing `ax2 start viewer` help and startup tests; add HTTP-level deep-link assertions |
| Viewer UI | Viewer surfaces become URL-addressable and restore folder/card state from the browser URL | Update viewer unit and Playwright tests |
| Viewer fixture | Fixture server handles deep-link paths like production | Existing Playwright web server can test direct deep links without 404s |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Route unit tests | `pnpm --filter @alexandria/viewer-next run test` | Covers parser/serializer edge cases for paths, repeated `open=`, `card=`, encoding, dedupe, and state preservation after updating the package test script |
| Viewer type/static check | `pnpm --filter @alexandria/viewer-next run check` | Validates Astro, React, and TypeScript integration after route-state refactors |
| Viewer build | `pnpm --filter @alexandria/viewer-next run build` | Confirms static output still builds and contains the client app served for deep links |
| Viewer browser coverage | `pnpm --filter @alexandria/viewer-next run test:e2e` | Exercises direct loads, navigation clicks, back/forward, folder query restoration, and card drawer restoration through the fixture server |
| AX2 viewer black-box coverage | `pnpm --filter @alexandria/ax-next exec bun test tests/viewer.test.ts` | Confirms `ax2 start viewer` serves direct deep-link paths and preserves API/static routing boundaries |
| AX2 lint/typecheck if AX2 test or server code changes | `pnpm --filter @alexandria/ax-next run lint` and `pnpm --filter @alexandria/ax-next run typecheck` | Keeps AX2 deterministic package checks honest if the slice touches the package |
| Markdown plan/checks | `pnpm run lint:markdown` | Validates the plan document and changed Markdown |
| Next plugin validation | `claude plugin validate ./packages/alexandria-next-plugin` only if implementation touches the Next plugin | Required by plugin guidance when plugin payload changes; not expected for this route slice |

## Required Test Cases

Add focused unit coverage for the route module:

1. `/`, `/library`, `/library/folders`, `/playbook`, `/info`, `/ledger`, `/raven/knowledge-bank`, and `/raven/vision` parse to the expected typed route.
2. `/library/folders?open=product%2Fagents&open=rationale%2Fstandards&card=product%2Fagents%2FAgent%20-%20Raven` round-trips with repeated `open=` params and one `card=`.
3. Duplicate `open=` params are deduplicated.
4. Updating open folders preserves `card=` and unrelated query params.
5. Closing the card drawer removes only `card=`.
6. Card paths and folder keys with spaces, slashes, and punctuation are encoded through `URLSearchParams`.

Extend `packages/viewer-next/tests/library-browser.spec.ts` with browser coverage:

1. Direct `page.goto("/playbook")` renders the Playbook surface.
2. Direct `page.goto("/library")` renders Library in Constellation mode.
3. Direct `page.goto("/library/folders")` renders Library in folder mode.
4. Clicking top navigation updates the URL to `/playbook`, `/library`, `/info`, and back to `/`.
5. Browser `goBack()` and `goForward()` restore the expected surface after top navigation clicks.
6. Clicking the Library mode controls updates the URL between `/library` and `/library/folders`.
7. Opening multiple folders produces repeated `open=` params and renders multiple open folders.
8. Direct `/library/folders?open=experience%2Fexperience-goals&open=product%2Fagents` restores both open folders.
9. Direct `/library/folders?card=product%2Fagents%2FAgent%20-%20Raven%20the%20Maven` opens the folder view, opens the containing folder, and shows the existing card drawer.
10. Closing that drawer removes only `card=` and preserves any existing `open=` params.
11. Selecting a card from an open folder sets `card=` without clearing existing `open=` params.

Extend `packages/ax-next/tests/viewer.test.ts`:

1. Start `ax2 start viewer` against a real initialized project as the existing test already does.
2. Fetch `/playbook`, `/library`, and `/library/folders?open=product%2Fagents` from the running server.
3. Assert each returns HTTP 200 with HTML containing the viewer shell, not `Not found`.
4. Assert an unknown `/api/...` path still returns 404 rather than falling through to `index.html`.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer route and Library state behavior | No eval harness coverage; deterministic unit and Playwright coverage are the right fit | Add deterministic tests, no eval rerun required | `pnpm --filter @alexandria/viewer-next run test`, `pnpm --filter @alexandria/viewer-next run test:e2e` |
| AX2 viewer server behavior | Existing deterministic AX2 viewer tests cover startup, health, API, and static serving | Extend black-box test, no eval rerun required | `pnpm --filter @alexandria/ax-next exec bun test tests/viewer.test.ts` |
| Product agents and skills | Eval harness applies to product-facing reusable skills/agents; this slice should not change them | No eval rerun required | N/A |
| Alexandria Next plugin payload | Not expected to change | If implementation unexpectedly edits plugin skills/agents, run plugin validation and identify the targeted eval set before merge | `claude plugin validate ./packages/alexandria-next-plugin`; targeted eval command to be selected based on the touched skill |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| URL state and React state could become competing sources of truth | Make `LibraryBrowserApp` the single route owner and derive surface/mode/folder/card props from the parsed route |
| Browser history could become noisy or fail to restore state | Centralize `pushState`/`replaceState`, listen to `popstate`, and cover navigation plus back/forward in Playwright |
| Repeated `open=` params could be lost when selecting or closing a card | Use route helper functions that preserve non-owned query params and add unit tests for each mutation |
| Direct card links could fail because `card=` contains a display id with spaces or punctuation | Define card paths from graph fields, encode only through `URLSearchParams`, and test fixture cards such as `Agent - Raven the Maven` |
| Direct card links may reference stale or missing graph cards | Resolve the card against the loaded graph before fetching detail; render folder mode without a drawer if no match and avoid destructive URL rewrites |
| Automatically opening a card's containing folder could unexpectedly persist implicit state | Treat the containing folder as effective render state, not necessarily explicit URL state, and test drawer close behavior with and without explicit `open=` |
| Fixture and production static serving could drift again | Make the fixture fallback mirror production behavior: non-API misses serve `index.html`, API misses stay 404; lock both paths with tests |
| Effect usage could leak into route and history code | Keep the route module pure and testable without runtime client mocks; leave Effect only in existing runtime API code |
| Info and Ledger routes could imply product functionality that does not exist yet | Render explicit placeholder/disabled surfaces and keep Ledger navigation disabled if that is the current product posture |

## Implementation Steps

1. Add this plan under `docs/alexandria/plans/229-ax2-viewer-routes-url-library-state/`.
2. Add the pure typed route module and unit tests in `packages/viewer-next`.
3. Update the viewer package `test` script if needed so route unit tests run through `pnpm --filter @alexandria/viewer-next run test`.
4. Refactor `LibraryBrowserApp` to parse the initial route, own the current route state, listen for `popstate`, and expose route navigation helpers to child components.
5. Extend `LibraryBrowserView` types and rendering to include Info, Ledger, Raven Knowledge Bank, and Raven Vision route surfaces.
6. Update `StoneTopBar` and `LibraryBrowserShell` so top nav and Library mode controls navigate to route paths and mark active tabs from route state.
7. Refactor `FolderLibraryView` so open folders and selected card are controlled from route-derived props while search, fetched card detail, and drawer width remain local UI state.
8. Add card/folder path helpers and ensure the selected card drawer fetches detail only after the `card=` path resolves to a graph card.
9. Update `serve-viewer-fixture.ts` so non-API static misses serve `dist/index.html`, while missing `/api/*` requests still return 404.
10. Extend Playwright coverage in `library-browser.spec.ts` for direct loads, navigation, back/forward, multiple open folders, direct card restoration, card selection, and drawer close URL updates.
11. Extend `packages/ax-next/tests/viewer.test.ts` to fetch deep-link paths from a real `ax2 start viewer` process and assert they serve the viewer app.
12. Run the deterministic verification commands above and fix any regressions within the route slice.
13. Review the final diff against this plan to confirm no implementation files outside the planned surfaces were changed.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/229-ax2-viewer-routes-url-library-state/plan.md` exists and matches the approved route scope.
2. Direct loads of `/playbook`, `/library`, and `/library/folders` render the expected Alexandria Next viewer surfaces.
3. `/info`, `/ledger`, `/raven/knowledge-bank`, and `/raven/vision` are recognized by the typed route layer and render the intended placeholder or existing surface.
4. Top navigation and Library mode navigation update the URL without a full page reload.
5. Browser back and forward restore the correct viewer surface after navigation clicks.
6. Folder view supports more than one open folder.
7. Opening and closing Library folders updates repeated `open=` params without dropping `card=` or unrelated query params.
8. Direct Library card URLs open folder mode, open the card's containing folder, and show the existing card drawer/sidebar.
9. Selecting a card from the folder view sets `card=` in the URL.
10. Closing the card drawer removes only `card=` and preserves explicit `open=` params.
11. The Library search box remains local state and is not serialized into the URL.
12. The Playwright fixture serves non-API deep-link paths through the viewer app instead of returning 404.
13. `ax2 start viewer` serves deep-link paths through the viewer app and does not fall back unknown `/api/*` paths to HTML.
14. Required viewer and AX2 tests pass locally, or any inability to run them is documented with the blocker.
15. No Alexandria 1 package and no `docs/alexandria/library/` content are changed.

## Deferred Follow-Ups

1. URL-back Library search once there is a clear query contract for search terms, filters, and drawer interactions.
2. Add richer route-level 404 UX if unknown viewer paths need a deliberate product surface.
3. Add dedicated routes for individual Playbook plays, play runs, ledger events, and source items after those surfaces have stable state contracts.
4. Consider extracting route helpers if more viewer route groups make the local module too large.
5. Add visual regression screenshots for route restoration once the viewer has a stable screenshot baseline pipeline.
