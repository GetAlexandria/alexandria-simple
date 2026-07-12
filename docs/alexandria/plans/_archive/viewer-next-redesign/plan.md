# Technical Plan: Viewer Next Redesign

- Issue reference: none yet
- Goal: define the production architecture for `packages/viewer-next` as the
  robust Alexandria Next interface, reset the temporary viewer content back to
  a clean shell, and specify the exact first visual copy from the reference
  prototype: the top-level navigation strip.
- Linked product/reference plans:
  - `docs/alexandria/plans/canvas-library-spike/README.md`
  - `docs/alexandria/plans/canvas-library-spike/plan.md`
  - `docs/alexandria/plans/canvas-library-spike/prototype/product-library/product-library-v0.1.html`
  - `docs/alexandria/plans/canvas-library-spike/prototype/docs/design/brand.md`
  - `docs/alexandria/plans/canvas-library-spike/prototype/docs/design/canvas-patterns.md`
  - `docs/alexandria/plans/canvas-library-spike/prototype/docs/design/voice.md`
  - `docs/alexandria/plans/ax2-state-contract-storage/plan.md`
- Effect implementation references:
  - `repos/effect/packages/effect/src/Stream.ts`
  - `packages/ax-next/src/effects/runtime-client.ts`
  - `packages/ax-next/src/effects/viewer-server.ts`
  - `packages/ax-next/src/domain/state-events.ts`

## Implementation Status

Implemented in the first architecture pass:

- `packages/viewer-next` now serves a single `/` Astro route with a React shell.
- The temporary dashboard, `/events`, and `/plays` routes have been removed.
- The top-level navigation assets are copied under
  `packages/viewer-next/src/assets/navigation/`.
- Runtime API access is isolated under `src/app/runtime/*` with Effect,
  `Schema` decoding, typed errors, a service tag, and an EventSource stream
  wrapper.
- Storybook and Playwright scaffolding are in place for the shell and
  navigation.

## Scope

This plan covers the next implementation pass for Viewer Next.

In scope for that pass:

- Preserve `packages/viewer-next` as an Astro, React, Tailwind, and TypeScript
  package.
- Delete the temporary dashboard, plays, and events UI currently checked into
  `packages/viewer-next`.
- Keep a buildable viewer shell and route only `/` for now.
- Port the reference top-level navigation exactly into React and Tailwind:
  Alexandria home label, Library tab, locked Playbook tab, Info Hub tab, locked
  Ledger tab, and compact Cmd-K search trigger.
- Copy the required stone PNG assets from the reference prototype into
  `viewer-next` with their credit metadata carried forward.
- Match the reference visual treatment first. Do not reinterpret, rebrand,
  simplify, or innovate on the top navigation design during this pass.
- Add front-end architecture boundaries for runtime API access, state
  subscriptions, presentational components, fixtures, stories, and tests.
- Use Effect deliberately at runtime boundaries: API calls, response decoding,
  typed failures, and server-sent event subscription cleanup.
- Add package-local `packages/viewer-next/README.md` guidance documenting the
  viewer's Effect boundary so future UI work does not put Effect into pure
  presentational components or bypass the runtime client.
- Add Storybook for component-state development and Playwright for browser
  verification.
- Update `packages/ax-next` viewer tests and serving assumptions to match the
  new single-route shell and new visible text.
- Use browser visual inspection of the running reference prototype as a required
  reference step before and during the port.

Deferred from the first architecture pass:

- Full runtime data rendering beyond the typed client boundary.
- Command palette implementation behind the Cmd-K trigger.
- Additional routes or workflow surfaces beyond `/`.

## Non-Goals

- Do not preserve or migrate the current `viewer-next` dashboard, event log,
  plays page, inline DOM scripts, or temporary copy.
- Do not keep `/plays` or `/events` as viewer routes for now.
- Do not port the full reference prototype.
- Do not port Today's Frame, phase rail, drawers, Raven overlays, practice cave,
  library graph, or gameplay/workflow surfaces in this pass.
- Do not build Alexandria workflow semantics inside the viewer.
- Do not let the browser app read project files directly.
- Do not add a new frontend backend or replace Astro with Next.js, Remix, or a
  client-only Vite app.
- Do not change Alexandria 1 `packages/viewer`.
- Do not change Alexandria Next plugin skill behavior.
- Do not write library maintenance content under `docs/alexandria/library/`.

## Current Gap

`packages/viewer-next` is currently a temporary Astro app with:

- `/` rendering a local collaboration dashboard.
- `/plays` rendering a source-assessment workflow placeholder and latest run
  list.
- `/events` rendering a filterable event log.
- Inline browser scripts in `.astro` files that call runtime endpoints and
  mutate the DOM manually.
- A small Tailwind theme using `paper`, `ink`, `line`, and `accent`, which does
  not match the reference prototype.

This was useful as a bootstrap but is now architectural noise. It establishes
surfaces and visual language that the real Viewer Next should not inherit.

The target Viewer Next needs a clean architecture:

```text
Astro static shell
  -> React app and routed UI
    -> typed runtime client
      -> local AX2 runtime APIs
        -> state projection and append-only event store
```

The AX2 runtime server already owns the important server boundary:

- `GET /api/health`
- `GET /api/state`
- `GET /api/events`
- `POST /api/events`
- `GET /api/events-stream`
- compatibility endpoints such as `/api/alexandria/ledger`

Viewer Next should consume that contract, not duplicate it.

## Effect Assessment

This repository already uses Effect in `packages/ax-next` for command
orchestration, runtime server lifecycle, the filesystem service, runtime client
calls, and state-store operations. The useful pattern is not "put Effect in
every React component." The useful pattern is:

```text
external boundary -> Schema decode -> typed Effect errors -> React hook adapter
```

Effect belongs in Viewer Next where the browser crosses a runtime boundary:

- fetching `/api/health`, `/api/state`, `/api/events`, and append endpoints
- decoding unknown JSON responses into typed viewer models
- representing expected network, HTTP, decode, and subscription failures
- acquiring and releasing `EventSource` subscriptions
- making runtime API behavior replaceable in tests and stories

Effect should not be used for:

- pure presentational components such as `TopNavigation`
- local hover, active-tab, or command-palette UI state
- Tailwind/CSS styling decisions
- route rendering that Astro or React already owns cleanly

The first implementation pass is mostly visual, but the runtime package shape
should still establish the right boundary so later stateful viewer work does
not grow ad hoc `fetch` and `try/catch` logic.

## Reference Findings

The reference prototype was visually inspected by serving:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

from:

```text
docs/alexandria/plans/canvas-library-spike/prototype/product-library/
```

and opening:

```text
http://127.0.0.1:8765/product-library-v0.1.html
```

The browser-visible top navigation target is:

- A fixed dark walnut horizontal strip, 84px tall.
- Alexandria wordmark/home label on the left.
- Four centered image-backed stone tabs:
  - Library, using `journal-stone.png` and `journal-stone-active.png`
  - Playbook, locked, using `strategy-stone.png` and
    `strategy-stone-active.png`
  - Info Hub, using `microscope-stone.png` and
    `microscope-stone-active.png`
  - Ledger, locked, using `ledger-stone.png` for both dormant and active
    layers
- Compact Cmd-K search pill on the right.
- Stone tabs show image-first affordance with a bottom label band that appears
  on hover/active.
- Locked tabs remain visible, dimmed, and non-navigating.

Reference implementation points:

- Markup source:
  `docs/alexandria/plans/canvas-library-spike/prototype/product-library/product-library-v0.1.html`
  lines 15-60.
- Top bar styles:
  `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/css/raven.css`
  lines 1120-1435.
- Cmd-K hint styles:
  `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/css/product-library.css`
  lines 2284-2299.
- Brand tokens:
  `docs/alexandria/plans/canvas-library-spike/prototype/docs/design/brand.md`.
- Pattern and voice constraints:
  the pattern and voice files in the same design directory.

The port should start from these observed and source-backed details. It should
not infer an alternative nav from memory or from a generic dark dashboard
pattern.

## Architectural Boundaries

### Astro Boundary

Astro remains the static packaging and document shell.

Responsibilities:

- Build static assets into `packages/viewer-next/dist`.
- Own page entrypoint(s), initially only `/`.
- Mount the React app.
- Import global CSS and Tailwind layers.
- Keep the app compatible with the existing AX2 static asset serving model.

Astro should not own live stateful viewer behavior.

### React Boundary

React owns the interface.

Responsibilities:

- Top-level app composition.
- Navigation state.
- Runtime data hooks.
- SSE subscriptions.
- Command palette state.
- Presentational components.
- Storybook-renderable component states.

The current inline DOM manipulation in `.astro` pages should be deleted rather
than migrated line by line.

### Tailwind And CSS Boundary

Tailwind should be used for component structure, spacing, typography utilities,
and repeatable classes where it improves readability.

Exact reference behavior may still need CSS variables and scoped CSS for:

- top bar fixed height and gradient
- image cross-fades
- stone socket pseudo-elements
- label-band hover/active behavior
- lock affordance
- text shadows and drop shadows

The implementation should prefer a small design-token layer over scattered hex
literals. If hex or rgba literals are required to match the reference exactly, they
belong in one token/style module first, not copied ad hoc through components.

### Runtime API Boundary

Viewer Next reads and writes through local runtime APIs, with Effect owning the
boundary work.

Responsibilities:

- `src/app/runtime/schemas.ts` defines the viewer-facing response schemas for
  the local API payloads the browser actually consumes.
- `src/app/runtime/errors.ts` defines typed runtime errors for network failures,
  non-OK HTTP responses, invalid JSON, schema decode failures, and subscription
  failures.
- `src/app/runtime/client.ts` exposes reusable operations with `Effect.fn`.
- `fetch` boundaries use `Effect.tryPromise`.
- Unknown JSON response bodies are decoded with `Schema.decodeUnknownEither` or
  `Schema.decodeUnknownEffect`.
- Runtime methods return `Effect.Effect<Success, RuntimeError>` instead of
  throwing.
- A `ViewerRuntimeClient` service may be defined with `Context.Tag` when the
  code needs dependency replacement. Use `Layer.succeed` for a pure live
  implementation and Storybook/test doubles. Use `Layer.effect` only if
  constructing the service becomes effectful.
- Hooks such as `useRuntimeState` and `useRuntimeStream` are the React boundary:
  they run the relevant Effect programs and adapt results into React state.
- The server-sent events integration should be modeled as an Effect `Stream`
  when it becomes stateful, with scoped acquisition/release so `EventSource`
  always closes on unmount.

Viewer Next must not:

- read project files directly
- parse `docs/alexandria/ledger/events.jsonl`
- implement independent projection rules
- write JSONL files
- own workflow semantics that belong to the Alexandria Next plugin

Schema ownership rule:

- Prefer AX2's existing runtime contract as the source of truth.
- Do not import Node/Bun-heavy AX2 runtime modules into the browser bundle just
  to reuse a type.
- A viewer schema is acceptable only when it represents a browser-facing view of
  the runtime contract. Keep those schemas narrow and name them as viewer API
  response models.
- If response schemas start duplicating large AX2 domain models, extract a
  shared contract package in a follow-up rather than copying more shapes into
  the browser app.

### Storybook Boundary

Storybook should exercise UI states with fixtures, not a real AX2 server.

Initial stories should cover:

- top navigation default state
- Library active
- Info Hub active
- locked Playbook and Ledger state
- hover/active visual states where practical
- Cmd-K trigger
- narrow viewport layout behavior

### Playwright Boundary

Playwright should verify the built app in a browser, preferably through the same
serving path users use:

```text
pnpm --filter @alexandria/viewer-next run build
ax2 start viewer
```

Tests should assert visible behavior and layout contracts, not implementation
details such as React component names.

## Proposed Package Shape

Target layout:

```text
packages/viewer-next/
  package.json
  astro.config.mjs
  tailwind.config.mjs
  tsconfig.json
  playwright.config.ts
  .storybook/
    main.ts
    preview.ts
  src/
    pages/
      index.astro
    styles/
      global.css
      tokens.css
    app/
      ViewerApp.tsx
      shell/
        ViewerShell.tsx
      navigation/
        TopNavigation.tsx
        top-navigation.fixtures.ts
        TopNavigation.stories.tsx
      runtime/
        client.ts
        errors.ts
        event-stream.ts
        schemas.ts
        service.ts
        useRuntimeState.ts
        useRuntimeStream.ts
      fixtures/
        runtime-fixtures.ts
      test/
        runtime-client.test.ts
        viewer-shell.spec.ts
    assets/
      navigation/
        CREDITS.md
        journal-stone.png
        journal-stone-active.png
        strategy-stone.png
        strategy-stone-active.png
        microscope-stone.png
        microscope-stone-active.png
        ledger-stone.png
```

Notes:

- The exact directory names can change during implementation if the codebase
  suggests a cleaner local convention.
- The architectural boundary should not change: shell, navigation, runtime,
  fixtures, stories, and tests should remain distinct.
- Only the assets needed for the top navigation should be copied initially.

## Runtime Effect Shape

The runtime module should use the same style already present in AX2:

- Define service contracts with `Context.Tag` if a service is needed.
- Construct pure implementations with `Layer.succeed`.
- Construct effectful implementations with `Layer.effect`.
- Wrap browser APIs with `Effect.tryPromise`.
- Validate boundary data with `Schema`.
- Convert expected failures into tagged runtime errors.
- Run effects only at React hook boundaries or test boundaries.

Illustrative shape:

```ts
class ViewerRuntimeClient extends Context.Tag("ViewerRuntimeClient")<
  ViewerRuntimeClient,
  {
    readonly getHealth: Effect.Effect<ViewerHealth, ViewerRuntimeError>;
    readonly getState: Effect.Effect<ViewerProjectState, ViewerRuntimeError>;
    readonly listEvents: (
      query: ViewerEventQuery,
    ) => Effect.Effect<ViewerEventPage, ViewerRuntimeError>;
  }
>() {}
```

This should stay a real dependency boundary, not a thin wrapper around every
component. `TopNavigation` should receive ordinary props and callbacks. Runtime
hooks can depend on the service when they need server data.

Runtime error model:

- `ViewerNetworkError` for failed browser fetches or aborted requests.
- `ViewerHttpError` for non-OK responses with status and message.
- `ViewerJsonError` for invalid JSON response bodies.
- `ViewerDecodeError` for schema-invalid runtime payloads.
- `ViewerSubscriptionError` for event-stream setup or message parse failures.

Use schema-backed tagged errors when the installed Effect version and local
code style make that straightforward. If the implementation follows current
AX2 error classes for consistency, keep the tags stable and keep all foreign
errors wrapped before they cross the runtime module boundary.

Runtime stream model:

- Represent the local SSE endpoint as an Effect `Stream` once it is wired.
- Acquire `EventSource` inside a scoped Effect.
- Close `EventSource` in the release/finalizer path.
- Decode each `state-event` and `project-state` payload through schemas before
  exposing it to React.
- Keep React hooks responsible for subscribing/unsubscribing and setting React
  state; do not expose raw `EventSource` instances to components.

## Route Contract

For now:

```text
/
```

Only `/` should exist as a viewer route.

Remove:

```text
/plays
/events
```

Implementation must update `packages/ax-next/tests/viewer.test.ts` so it no
longer asserts `/plays`, `/events`, `Product Orchestration`, or `Event Log`.

The AX2 static server may still serve `404` for missing viewer files; the
implementation should not add compatibility pages just to satisfy old tests.

## Visual Port Contract

The first visible target is exact top navigation parity, not a redesigned
approximation.

Required copy:

- Left brand/home button:
  - visible text: `Alexandria`
  - `title`: `Home - return to Alexandria`
  - `aria-label`: `Home - Alexandria`
- Center tablist:
  - `aria-label`: `Alexandria navigation`
  - Library tab:
    - key: `library`
    - visible label: `Library`
    - title: `The Library - banked atomic cards`
    - enabled
  - Playbook tab:
    - key: `playbook`
    - visible label: `Playbook`
    - locked
    - `aria-disabled="true"`
    - title: `Unlocks when Raven has enough to be useful - fill four areas first.`
  - Info Hub tab:
    - key: `station`
    - visible label: `Info Hub`
    - title: `Info Hub - information flow across stages`
    - enabled
  - Ledger tab:
    - key: `ledger`
    - visible label: `Ledger`
    - locked
    - `aria-disabled="true"`
    - title: `Unlocks once Alexandria starts recording activity - your audit trail of every change, decision, and atomization.`
- Right command trigger:
  - visible text should match the reference's compact `Cmd-K Search` behavior
    using accessible text that does not depend on the macOS glyph for tests.
  - title: `Search the lab`

Required behavior:

- Clicking Alexandria returns to the shell home state and clears active tab
  selection.
- Clicking enabled tabs sets `aria-selected="true"` and active visual state.
- Clicking locked tabs does not navigate or set active state.
- Cmd-K trigger can initially be inert or open a minimal placeholder palette,
  but its visual and accessibility contract should be present.

Required visual treatment:

- Top bar height and fixed placement should match the reference.
- Dark walnut gradient, hairline border, and shadow should match the reference.
- Stone tab image dimensions, recessed socket, hover cross-fade, active
  press-down state, and label band should match the reference.
- Locked tabs should remain visible and dimmed with the lock affordance.
- No new colors, gradients, rounded-card treatments, or dashboard chrome should
  be introduced in the top nav.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Technical plan | `docs/alexandria/plans/viewer-next-redesign/plan.md` | Defines the architecture and exact top-nav reference before implementation |
| Viewer package shell | `packages/viewer-next/src/pages/index.astro`, `src/app/**/*`, `src/styles/**/*` | Replaces temporary multi-page inline-script UI with a React-owned shell on `/` |
| Viewer route removal | `packages/viewer-next/src/pages/events.astro`, `packages/viewer-next/src/pages/plays/index.astro` | Deletes temporary `/events` and `/plays` pages |
| Navigation assets | `packages/viewer-next/src/assets/navigation/*` or equivalent public asset path | Ships the stone art required by the copied top navigation |
| Viewer package README | `packages/viewer-next/README.md` | Documents the local viewer architecture and where Effect belongs in the browser codebase |
| Runtime Effect boundary | `packages/viewer-next/src/app/runtime/{client,errors,event-stream,schemas,service}.ts` | Establishes typed local API access with Effect operations, Schema decoding, typed errors, and scoped SSE lifecycle |
| Viewer package tooling | `packages/viewer-next/package.json`, Storybook config, Playwright config | Adds story and browser verification scripts |
| Tailwind/theme | `tailwind.config.mjs`, `src/styles/tokens.css`, `src/styles/global.css` | Replaces paper dashboard tokens with production navigation tokens and exact nav styles |
| Viewer runtime tests | `packages/viewer-next/src/app/runtime/*.test.ts` or equivalent | Verifies schema decoding and runtime-client error mapping without requiring a live AX2 server |
| AX2 viewer tests | `packages/ax-next/tests/viewer.test.ts` | Updates expected viewer routes and visible text after the reset |
| Release/deploy tests | `packages/deploy/src/build-release-assets.test.ts`, `packages/ax-next/e2e/*` if route assertions exist | Keeps bundled viewer asset packaging compatible with the shell-only route |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Alexandria Next plugin skills | No guided skill behavior changes | None |
| Alexandria 1 plugin skills | No behavior changes | None |
| AX2 CLI user behavior | `ax2 start viewer` opens a new shell visual instead of the temporary dashboard, and only `/` is a supported viewer route | Update AX2 viewer tests and any user-facing docs that mention `/events` or `/plays` if they exist |
| Maintainer workflow | Viewer work now requires Storybook and Playwright visual checks, including comparison against the reference prototype | Document commands in the plan and package scripts |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer type/content check | `pnpm --filter @alexandria/viewer-next run check` | Verifies Astro and TypeScript compile after the shell reset |
| Viewer static build | `pnpm --filter @alexandria/viewer-next run build` | Verifies the static app builds for AX2 packaging |
| Viewer runtime unit tests | `pnpm --filter @alexandria/viewer-next run test:unit` | Verifies Effect runtime-client schemas, typed errors, and fetch/decode behavior without a browser |
| Viewer Storybook build | `pnpm --filter @alexandria/viewer-next run storybook:build` | Verifies stories compile without requiring a runtime server |
| Viewer Playwright tests | `pnpm --filter @alexandria/viewer-next run test:e2e` | Verifies top navigation behavior and visual smoke states in a browser |
| AX2 viewer tests | `cd packages/ax-next && bun test tests/viewer.test.ts` | Verifies `ax2 start viewer` still serves bundled assets and the expected shell |
| AX2 full tests | `cd packages/ax-next && bun test` | Catches regressions in runtime serving, packaging assumptions, and CLI behavior |
| Root lint/format as needed | `pnpm run lint:workspace && pnpm run format:check:prettier` | Verifies repo workspace checks still accept the new package setup |

Browser visual verification is required in addition to command success:

1. Serve the reference prototype locally and inspect
   `product-library-v0.1.html`.
2. Build and serve Viewer Next.
3. Capture desktop and narrow viewport screenshots.
4. Compare the copied top nav against the reference before accepting the
   implementation.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| Product-facing agents and skills | Eval coverage targets reusable product behavior, not the viewer shell | No eval-harness rerun required if implementation stays limited to viewer UI, AX2 tests, and packaging | none |
| Viewer Next UI | No eval-backed UI harness exists | Use deterministic Storybook, Playwright, Astro, Effect runtime unit tests, and AX2 tests | `pnpm --filter @alexandria/viewer-next run test:unit`, `pnpm --filter @alexandria/viewer-next run test:e2e`, plus AX2 viewer tests |
| AX2 runtime/CLI | Black-box Bun tests exist | Update viewer tests for the shell route and visible text | `cd packages/ax-next && bun test tests/viewer.test.ts` |

If the implementation expands into Alexandria Next plugin skill behavior,
guided play semantics, or host wake behavior, this eval assessment must be
reopened before merge.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The top nav becomes an inspired redesign instead of a faithful port | Require browser inspection of the reference prototype, copy only the named nav surface, and compare screenshots before accepting |
| Temporary viewer content survives and keeps shaping architecture | Delete `/events`, `/plays`, and inline DOM scripts in the same implementation pass that adds the shell |
| React components duplicate AX2 projection logic | Keep all project state access behind a typed runtime client that calls local APIs |
| Effect usage leaks into presentational components and makes UI work harder | Keep Effect in `src/app/runtime/*` and hook adapters; pass plain props into visual components |
| Viewer response schemas drift from AX2 runtime contracts | Keep schemas narrow, test decode behavior, and extract a shared contract package if duplication grows |
| Runtime hooks scatter `Effect.runPromise` calls through components | Centralize Effect execution inside runtime hooks or a small browser runtime adapter |
| SSE subscriptions leak browser resources | Model EventSource acquisition/release with scoped Effect/Stream cleanup and assert unmount closes subscriptions |
| Tailwind utilities flatten the reference's nuanced image/socket treatment | Allow scoped CSS and CSS variables for exact copied behavior instead of forcing every detail into utility classes |
| Copied assets lose provenance | Copy `CREDITS.md` with the stone assets and preserve the author-owned/source notes |
| External font dependency makes the shipped viewer fragile | Prefer bundled or system-safe font handling; if external fonts are used during parity work, document the production replacement before ship |
| Removing `/plays` and `/events` breaks existing tests or packaged smoke flows | Update AX2 and deploy/e2e assertions in the same implementation pass; do not keep dummy routes solely for old tests |
| Storybook and Playwright add tooling drift across packages | Add package-local scripts and keep root checks focused on existing workspace conventions |
| Cmd-K glyph creates brittle tests across platforms | Test accessible text and button role rather than relying on the macOS command symbol |

## Implementation Steps

1. Re-run the reference prototype locally and capture the top navigation in
   Browser.
2. Reset `packages/viewer-next/src/pages` to a single `index.astro` route that
   mounts a React app shell.
3. Delete the temporary `/events` and `/plays` pages and their inline scripts.
4. Add the React app structure: shell, navigation, runtime boundary, fixtures,
   and shared style/token files.
5. Add or update `packages/viewer-next/README.md` with the package-local Effect
   boundary and runtime-client guidance.
6. Add runtime schemas, typed runtime errors, and Effect client operations for
   the local APIs the viewer shell is expected to consume later.
7. Add unit coverage for schema decoding and runtime-client error mapping.
8. Copy only the required top-nav stone assets and `CREDITS.md` into the viewer
   asset tree.
9. Port the exact top navigation markup and behavior into React components.
10. Port the exact top navigation visual treatment into Tailwind plus scoped CSS
   variables/styles.
11. Add Storybook configuration and stories for top navigation states.
12. Add Playwright configuration and tests for `/` rendering, enabled/locked tab
   behavior, Cmd-K trigger presence, and screenshot-backed smoke checks.
13. Update `packages/viewer-next/package.json` scripts for unit tests,
    Storybook, and Playwright.
14. Update AX2 viewer tests to expect only `/` and the new shell/nav visible
    content.
15. Update any deploy/e2e tests that assert old `/plays` or `/events` assets.
16. Run viewer check/build/unit/storybook/playwright verification.
17. Run focused AX2 viewer tests and any impacted packaging tests.
18. Review screenshots against the reference and adjust until the nav matches before
    expanding to other viewer surfaces.

## Acceptance / Exit Criteria

1. `packages/viewer-next` keeps Astro, React, Tailwind, and TypeScript.
2. `/` is the only supported viewer route.
3. Current temporary dashboard, events, and plays UI is deleted.
4. The viewer shell builds and mounts a React app.
5. The top navigation visually matches the reference top bar: same structure,
   stone assets, dark walnut strip, hover/active/locked treatment, and Cmd-K
   placement.
6. Library and Info Hub tabs are enabled and update active state.
7. Playbook and Ledger tabs are visible, locked, and non-navigating.
8. Alexandria home label clears active tab state and returns to shell home.
9. Storybook stories exist for the top navigation states and build
   successfully.
10. Runtime boundary code uses Effect operations, Schema decoding, typed
    errors, and no raw component-level `fetch` calls.
11. `packages/viewer-next/README.md` documents the Effect boundary for future
    viewer work.
12. Unit tests cover runtime schema decoding and error mapping.
13. Playwright tests cover route rendering and top navigation behavior.
14. AX2 viewer tests pass with updated shell route expectations.
15. Copied assets include provenance notes from the reference `CREDITS.md`.
16. Browser screenshots from the reference and Viewer Next are compared before the
    implementation is considered done.

## Deferred Follow-Ups

1. Today's Frame React architecture and visual port.
2. Phase rail React architecture and visual port.
3. Command palette functionality beyond the initial trigger.
4. Runtime-backed state dashboard.
5. Event ledger interface after the new shell is stable.
6. Plays/workflow surfaces once their product semantics are ready.
7. Source assessment and product-nouns work surfaces.
8. Host/session wake visualization.
9. Accessibility pass across the full viewer, beyond the copied top nav.
10. Shared runtime contract extraction if viewer schemas begin duplicating AX2
    domain models.
11. Font bundling and production asset optimization if not completed during the
    first implementation pass.
