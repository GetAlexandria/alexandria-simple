# Technical Plan: Viewer Next Library Browser

## Goal

Port the Library browser experience from `docs/alexandria/plans/canvas-library-spike`
into `packages/viewer-next`, preserving the reference UI and behavior while
moving data access behind the local runtime server exposed by `ax2 start`.

The viewer must not read or write workspace markdown files directly. It should
fetch a server-provided library graph and render that data in the copied
canvas-style browser.

## Scope

In scope:

- Replace the current `viewer-next` dashboard-first root experience with the
  canvas Library browser surface from the spike.
- Port the reference styling to Tailwind classes and viewer-local components
  instead of copying the spike CSS wholesale.
- Keep the visual composition identical to the spike for the Library surface:
  dark stone wall, top Alexandria rail, stone tabs, `library` overlay title,
  Constellation and `2.5D Folder` modes, bottom Raven bench, and minimized
  phase rail gap.
- Add server APIs under the `ax2 start viewer` runtime for library graph data.
- Build the UI from small React components and add Storybook stories for the
  shell, navigation, Constellation view, Folder view, card drawer, and Raven
  bench.
- Create a test project with a real `docs/alexandria/library` tree, run it with
  `ax2 start`, and compare the result visually against the running spike in the
  browser.

Out of scope:

- Migrating Alexandria 1 viewer pages or changing `packages/viewer`.
- Writing markdown from the viewer.
- Implementing the broader canvas onboarding flow, playbook, queue, or Raven
  execution loop beyond the Library browser chrome needed to match the visual
  reference.
- Reworking library card semantics or inventing new visual hierarchy.
- Editing `docs/alexandria/library/` as implementation work.

## Linked Spike Summary

The spike demonstrates a canvas-first Library surface with two browser modes:

- `Constellation`: a dark SVG sky, clustered by territory/subfolder, with
  stars, connection lines, hover detail, and a territory summary panel.
- `2.5D Folder`: stacked golden folder cards grouped by territory/subfolder,
  search, open-folder state, and a card-detail drawer.

The browser pass against the spike confirmed the target first viewport:

- `http://127.0.0.1:4323/` shows the top Alexandria stone rail, the stage frame,
  and bottom Raven bench.
- Clicking the Library stone tab opens the `library` overlay with
  Constellation active.
- Clicking `2.5D Folder` shows the search bar and folder stacks while retaining
  the same top rail and Raven bench.

## Current Gap

`packages/viewer-next` currently serves a utilitarian dashboard, events page,
and plays page. It already uses Astro, React, Tailwind, and runtime fetches to
`/api/*`, but it has no Library browser and no component/story structure.

`packages/ax-next` already owns the runtime server used by `ax2 start viewer`.
It exposes health, state, event, connection, orchestration, and workflow graph
APIs, but no Library graph endpoint.

## Architectural Boundaries

- `packages/viewer-next` is presentation only. It fetches JSON from local
  runtime APIs and never imports Node filesystem modules or markdown loaders.
- `packages/ax-next` owns workspace reads through Effect programs and runtime
  APIs. It may parse `docs/alexandria/library` markdown to produce the graph
  projection consumed by the viewer.
- Shared server data models should use Effect Schema at HTTP and persisted-data
  boundaries where practical, following the repo's existing Effect style:
  `Effect.gen` for runtime workflows, services/layers at server boundaries, and
  precise typed errors for operational failures.
- Spike assets may be copied into `viewer-next` only when needed to match the
  visual reference. Do not hotlink to the plan directory at runtime.

## Touch Map

- `docs/alexandria/plans/viewer-next-library-browser/plan.md`: this plan.
- `packages/ax-next/src/domain/*`: library graph projection and schema/types.
- `packages/ax-next/src/effects/runtime-server.ts`: `GET /api/library/graph`
  and error handling.
- `packages/ax-next/tests/viewer.test.ts` or focused runtime tests: API and
  served-viewer coverage.
- `packages/viewer-next/src/components/*`: canvas shell, stone nav, browser
  tabs, Constellation, folder browser, drawer, Raven bench.
- `packages/viewer-next/src/pages/index.astro`: render the Library browser app.
- `packages/viewer-next/src/styles/global.css` and `tailwind.config.mjs`:
  Tailwind theme tokens for the spike palette and typography.
- `packages/viewer-next/.storybook/*` and `*.stories.tsx`: Storybook setup and
  component stories.
- `packages/viewer-next/public/*`: copied stone and Raven bitmap assets.

## Behavior Surfaces

- CLI/runtime server: `ax2 start viewer` gains a read-only Library graph API.
- Viewer UI: root page becomes the Library browser experience instead of the
  current Local Collaboration dashboard.
- Storybook: new maintainer/developer surface for inspecting Library browser
  components against fixed graph fixtures.

No product skill, agent, or template behavior changes in this slice.

## Data Contract

Add a read-only endpoint:

```text
GET /api/library/graph
```

Response shape should match the spike data closely enough for a direct visual
port:

- `meta.cardCount`
- `meta.edgeCount`
- `meta.territories`
- `meta.subfolders`
- `cards[]`: `id`, `title`, `type`, `territory`, `subfolder`, and `outbound`
- `edges[]`: `from`, `to`

The server projection should derive `territory` and `subfolder` from
`docs/alexandria/library/<territory>/<subfolder>/<card>.md` and wikilinks from
markdown body content. The viewer consumes this projection only.

## Tests

Deterministic checks:

- `pnpm --filter @alexandria/viewer-next run check`
- `pnpm --filter @alexandria/viewer-next run build`
- `pnpm --filter @alexandria/ax-next run test`
- Focused assertions that `GET /api/library/graph` returns the expected card
  and edge counts for a fixture project.
- Storybook build or smoke command after Storybook is added.

Browser verification:

- Run the spike server from `docs/alexandria/plans/canvas-library-spike`.
- Create a real test project, initialize it with `ax2 init`, copy in a fixture
  `docs/alexandria/library`, build `viewer-next`, and run `ax2 start viewer`.
- Compare screenshots for the spike and viewer-next at desktop viewport:
  initial Library/Constellation and `2.5D Folder`.
- Inspect the viewer through browser automation for loaded assets, nonblank SVG
  constellation, folder stack counts, and absence of console/runtime errors.

## Eval Impact

No reusable agent or product skill behavior changes are expected. No eval rerun
is required unless implementation touches `packages/alexandria-next-plugin`
skills, agents, or initialize/library behavior. If that boundary changes, rerun
the relevant Alexandria Next skill evals before merge.

## Risks And Mitigations

- Visual drift from the spike: mitigate by running the spike and viewer side by
  side in the browser and treating screenshot parity as the exit gate.
- Data boundary regression: mitigate by keeping filesystem reads inside
  `ax-next` runtime code and adding tests that the static viewer fetches
  `/api/library/graph`.
- Over-porting the prototype: mitigate by limiting scope to the Library browser
  surface and required chrome, not the whole onboarding/play loop.
- Asset path drift in packaged builds: mitigate by serving copied assets from
  `viewer-next` static output and extending packaged-layout tests.
- Storybook dependency churn: mitigate by adding the minimum Storybook setup for
  React components and keeping production viewer code independent of Storybook.

## Implementation Steps

1. Add the Library graph projection in `ax-next` with Effect-backed file reads,
   tests, and `GET /api/library/graph`.
2. Copy the required spike bitmap assets into `viewer-next/public` and extend
   Tailwind tokens for the spike palette, typography, shadows, and wall texture.
3. Build React components for the shell and Library modes using fixed fixture
   data first.
4. Wire `src/pages/index.astro` to load the React app and fetch
   `/api/library/graph`.
5. Add Storybook and stories using the same graph fixture.
6. Build and test the packages.
7. Create the real test project, run the spike and `viewer-next` through the
   browser, compare screenshots, and iterate until the Library browser matches.

## Acceptance Criteria

- The viewer root served by `ax2 start viewer` renders the spike Library browser
  surface, not the old dashboard.
- Viewer code does not read or write markdown files directly.
- `/api/library/graph` is served by the local `ax2 start` runtime.
- Constellation and `2.5D Folder` views visually match the spike at the tested
  desktop viewport.
- Component stories exist for each meaningful piece of the browser.
- Package checks and focused tests pass.

## Deferred Follow-Ups

- Mobile parity beyond avoiding broken layout.
- Full canvas onboarding, queue, playbook, and Raven execution workflow.
- Live filesystem watching/SSE for library changes.
- Editing or authoring cards from the browser.
