# PMS-Drafts Overlay Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#446`
- Run ID: `01KWA89H1F4KJEKX7M0FR63W28`
- Pipeline: **PMS-Back (#443, merged) -> PMS-Drafts (this slice) -> PMS-Final (#447)**
- Plan path: `docs/alexandria/plans/446-pms-drafts/plan.md`
- Existing context:
  - `docs/alexandria/plans/pms-library-handoff/HANDOFF.md`
  - `docs/alexandria/plans/pms-library-handoff/pms-back-plan.md`
  - `docs/alexandria/plans/pms-library-handoff/tab-2-pms-drafts-issue.md`
- Note: `docs/alexandria/plans/446-viewer-library-path-semantics/plan.md` is an
  unrelated older plan for `sociotechnica-org/alexandria#446`; leave it
  untouched.

## Goal

Add a read-only `/library/pms-drafts` library tab that renders the same Back
library as `/library/pms-back`, then overlays Raven Front-of-House patch-log
updates in memory at load time. The Back sweep at
`studio/sweeps/playmaker-studio/` must remain byte-pure; the only durable Drafts
state for this slice is the patch log at
`studio/drafts/playmaker-studio/patches.json`.

The result should make the three states visible and distinct:

- PMS-Back: the read-only Back sweep.
- PMS-Drafts: Back plus an inspectable FoH patch overlay.
- PMS-Final: separate future approval surface, not implemented here.

## Scope

- Add the viewer route and tab for `/library/pms-drafts`.
- Reuse the existing library catalog surface mounted by PMS-Back
  (`EmptyLibraryView` without runtime mutation props).
- Load the Back catalog from the fixed root `studio/sweeps/playmaker-studio`.
- Read the durable patch log from the fixed path
  `studio/drafts/playmaker-studio/patches.json`.
- Compose `Back markdown files + FrontOfHousePatch[] -> Drafts catalog` in memory.
- Surface per-card patch trail with `patchId`, `agendaItemId`,
  `answerEventId`, changed fields, relationship keys, and card path.
- Surface unresolved patch updates, especially missing-card references, without
  failing the catalog load.
- Add a fixture patch log outside the sweep directory.
- Cover the issue's required test matrix with deterministic AX and Viewer tests.

## Non-Goals

- Do not run, adapt, or modify the `front-of-house-walk` play.
- Do not generate patches from threads or director answers in this slice.
- Do not add confirm/edit affordances to PMS-Drafts.
- Do not implement PMS-Final or the director approval gate.
- Do not write under `studio/sweeps/playmaker-studio/`.
- Do not address diagrams, the category-vocabulary work, or §5b sweep
  refinement.
- Do not change plugin skills, plugin workflows, or public CLI behavior.

## Product Context Summary

The PMS library pipeline has three pure states:

1. Back: a Back-of-House sweep output in `studio/sweeps/playmaker-studio/`.
2. Drafts: Raven's Front-of-House working layer over Back.
3. Final: the later director-approved state.

PMS-Back already proved the Back library can be rendered through the existing
catalog surface from the fixed sweep root. PMS-Drafts should not fork or mutate
that root. It should instead read a durable, content-bearing patch log and
project those updates over Back at load time.

The frozen patch shape is the existing `FrontOfHousePatch` /
`FrontOfHouseCardUpdate` contract:

```ts
interface FrontOfHousePatch {
  schemaVersion: 1;
  patchId: string;
  agendaItemId: string;
  answerEventId: string;
  resolution: "resolved";
  cardUpdates: FrontOfHouseCardUpdate[];
}

interface FrontOfHouseCardUpdate {
  cardPath: string;
  set?: Partial<Record<"prefLabel" | "context" | "plane" | "status", string>>;
  relationships?: Record<string, string[]>;
}
```

The Drafts patch log is a JSON array of `FrontOfHousePatch` objects at
`studio/drafts/playmaker-studio/patches.json`.

## Current Implementation Gap

- `LibraryBrowserApp.tsx` has a fixed `PMS_BACK_LIBRARY_ROOT` and routes
  `pms-back` to `loadLibraryCatalog` with `libraryRoot`.
- `viewer-routes.ts`, `types.ts`, and `LibraryBrowserShell.tsx` only know
  `pms-back`; there is no `pms-drafts` mode or route.
- `loadLibraryCatalogRoot` can build a catalog from a library root, but it has
  no patch-log input and no derived Drafts projection.
- `library-front-of-house.ts` validates `FrontOfHousePatch` and applies patches
  to bundle files for the EL3 play, but that applier validates Ledger events and
  returns file writes. PMS-Drafts needs the same patch shape and frontmatter
  update semantics without writing files and without requiring the play runtime.
- `LibraryCatalogCard` has no place for per-card draft trail metadata, and the
  viewer has no optional trail rendering.
- No `studio/drafts/playmaker-studio/patches.json` fixture exists yet.

## Architectural Boundaries

- The overlay belongs in the AX catalog loading path, not in the React component.
  React should receive a fully projected Drafts catalog and render it.
- Apply the overlay to virtual markdown files before `buildLibraryCatalog` runs,
  or rebuild all derived catalog state after patching. This avoids stale areas,
  planes, `links`, workflows, and fill-readiness data when `context`, `plane`,
  `status`, or relationships change.
- Keep all path resolution project-contained. `libraryRoot` and `draftPatchLog`
  must resolve inside the project root.
- Enforce the Back purity boundary: a Drafts patch log must not live under the
  Back sweep root, and the loader must never write to the sweep.
- Keep `front-of-house-walk` behavior unchanged. This slice consumes patch logs;
  a later Studio-ladder slice can make the play produce them.
- Keep PMS-Drafts read-only in the viewer by rendering `EmptyLibraryView` without
  `runtimeClient` and without `onCatalogRefresh`.

## Proposed Loader Contract

Extend the catalog request path with an optional draft patch-log path:

```ts
interface LoadLibraryCatalogOptions {
  bundlePath?: string;
  libraryRoot?: string;
  libraryVersion?: number;
  product?: string;
  draftPatchLog?: string;
}
```

Runtime API:

- `GET /api/library/catalog?libraryRoot=...&draftPatchLog=...`
- `draftPatchLog` is optional and ignored unless present.
- Missing `draftPatchLog` file is valid and returns exactly the Back catalog.
- A present empty array returns exactly the Back catalog, with no empty Drafts
  scaffold in the response.
- A path outside the project root is a request error.
- A path under the resolved `libraryRoot` is a request error for Drafts, because
  the patch log must remain outside the Back sweep.

Viewer route constants:

```ts
const PMS_LIBRARY_ROOT = "studio/sweeps/playmaker-studio";
const PMS_DRAFT_PATCH_LOG = "studio/drafts/playmaker-studio/patches.json";
```

`/library/pms-back` should pass only `libraryRoot: PMS_LIBRARY_ROOT`.
`/library/pms-drafts` should pass both `libraryRoot: PMS_LIBRARY_ROOT` and
`draftPatchLog: PMS_DRAFT_PATCH_LOG`.

## Overlay Semantics

Create a pure domain helper, for example
`packages/ax/src/domain/library-draft-overlay.ts`, that accepts collected Back
markdown files, the resolved library root, and patch-log content.

Required behavior:

1. Parse the patch log as a JSON array of `FrontOfHousePatch`.
2. Validate each entry with the shipped Front-of-House patch parser or an
   extracted shared parser.
3. Resolve every `cardPath` relative to the Back library root.
4. Skip unresolved or missing card paths without failing the load.
5. Apply valid updates in log order to an in-memory copy of the card markdown.
6. Later patches to the same `cardPath + field` win.
7. Later patches to the same `cardPath + relationship key` replace that
   relationship list.
8. Reapplying the same patch is idempotent because fields and relationship keys
   are set, not appended.
9. Preserve markdown bodies, `type`, `altitude`, story sections, diagrams, and
   all fields outside the allowed FoH surface.
10. Map `relationships` onto product-card `links` using the existing canonical
    typed-link keys.
11. Reject or skip fields the product-card schema does not own, including
    `body`, `type`, `altitude`, story fields, and arbitrary unknown `set` keys.

The existing `applyFrontOfHousePatch` should not be called directly for Drafts
because it is bundle-file oriented and validates answer events against the
Ledger. Extract the common card-update/frontmatter function from
`library-front-of-house.ts`, or expose a new pure helper there, then reuse that
from the Drafts overlay.

## Draft Trail Shape

Extend the catalog domain and viewer runtime schema with optional draft metadata
that is absent for Back and absent for zero/empty patch logs.

Suggested catalog additions:

```ts
interface LibraryCatalogDraftTrailEntry {
  agendaItemId: string;
  answerEventId: string;
  cardPath: string;
  fields: Array<"prefLabel" | "context" | "plane" | "status">;
  patchId: string;
  relationships: string[];
}

interface LibraryCatalogDraftUnresolvedUpdate {
  agendaItemId: string;
  answerEventId: string;
  cardPath: string;
  patchId: string;
  reason: string;
}

interface LibraryCatalogDraftOverlay {
  appliedPatchCount: number;
  appliedUpdateCount: number;
  patchLogPath: string;
  unresolvedUpdates: LibraryCatalogDraftUnresolvedUpdate[];
}

interface LibraryCatalogCard {
  draftTrail?: LibraryCatalogDraftTrailEntry[];
}

interface LibraryCatalog {
  draftOverlay?: LibraryCatalogDraftOverlay;
}
```

Attach `draftTrail` after `buildLibraryCatalog` by matching projected cards back
to their relative `card.path` or normalized source path. Keep trail entries in
patch-log order.

Viewer rendering:

- Add an optional "Draft overlay" block in `CardDetail` when
  `card.draftTrail?.length` is nonzero.
- Show changed scalar fields, changed relationship keys, `patchId`,
  `agendaItemId`, and `answerEventId`.
- Add an optional Draft overlay summary near metadata issues or the catalog
  header when `catalog.draftOverlay` exists.
- Show unresolved updates from `catalog.draftOverlay.unresolvedUpdates`.
- Do not show any Draft overlay UI for PMS-Back or for Drafts with no patch log.

## File And Subsystem Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Plan artifact | `docs/alexandria/plans/446-pms-drafts/plan.md` | Defines the implementation slice and validation gates |
| Draft fixture data | `studio/drafts/playmaker-studio/patches.json` | Adds durable fixture patch log outside the Back sweep |
| AX FoH patch domain | `packages/ax/src/domain/library-front-of-house.ts` | Exposes shared patch-log parsing or pure card-update helpers without changing play behavior |
| AX Drafts projection | new `packages/ax/src/domain/library-draft-overlay.ts` or equivalent | Composes Back markdown and `FrontOfHousePatch[]` into virtual markdown plus trail metadata |
| AX catalog types | `packages/ax/src/domain/library-catalog.ts` | Adds optional draft trail metadata to catalog response types |
| AX catalog loader | `packages/ax/src/effects/library-graph-loader.ts` | Reads optional patch log, validates paths, applies overlay before catalog build |
| AX runtime API | `packages/ax/src/effects/runtime-server.ts` | Accepts `draftPatchLog` on `/api/library/catalog` |
| Viewer runtime client | `packages/viewer/src/app/runtime/client.ts` | Sends `draftPatchLog` for PMS-Drafts catalog requests |
| Viewer runtime schemas | `packages/viewer/src/app/runtime/schemas.ts` | Decodes optional draft trail and overlay metadata |
| Viewer route state | `packages/viewer/src/components/library/viewer-routes.ts`, `types.ts` | Adds `pms-drafts` mode and `/library/pms-drafts` parse/serialize/helper support |
| Viewer app mount | `packages/viewer/src/components/library/LibraryBrowserApp.tsx` | Routes PMS-Drafts to the fixed Back root plus fixed patch log, read-only |
| Viewer shell | `packages/viewer/src/components/library/LibraryBrowserShell.tsx` | Adds the PMS-Drafts tab button |
| Viewer catalog surface | `packages/viewer/src/components/library/EmptyLibraryView.tsx` | Renders optional per-card and unresolved Draft overlay trail |
| Tests | AX domain/runtime tests and Viewer unit/e2e tests | Covers the required acceptance matrix |

## Changed Behavior Surfaces

| Surface | Behavior shift | Downstream updates |
| --- | --- | --- |
| Viewer library navigation | A new `PMS-Drafts` tab and route are available at `/library/pms-drafts` | Route unit tests and browser tests |
| Viewer catalog rendering | Product-card details can show optional Draft overlay trail when the catalog includes it | Runtime schemas and component tests |
| AX runtime catalog API | Catalog loads can accept a read-only patch-log overlay path | Runtime-server tests and path-containment coverage |
| AX catalog loader | Can derive a Drafts catalog from Back plus patch log without writing files | Domain tests for overlay semantics and byte-purity |
| Product skills and agents | No behavior change | No skill docs or eval baselines required |
| Plugin workflows | No behavior change | `front-of-house-walk` remains untouched |
| Public CLI | No behavior change | No CLI black-box exit-code tests required for this slice |

## Deterministic Test Matrix

Cover these cases directly:

1. **Drafts equals Back with no log.**
   Load `studio/sweeps/playmaker-studio` with `draftPatchLog` pointing to a
   missing file and assert deep equality with the Back catalog.
2. **Drafts equals Back with empty log.**
   Use a temp `patches.json` containing `[]` and assert deep equality.
3. **Drafts reflects fixture patch.**
   Use `studio/drafts/playmaker-studio/patches.json` and assert patched scalar
   fields and `links` appear in the Drafts catalog.
4. **Back unchanged by overlay.**
   Load PMS-Back after Drafts and assert it has original field values and no
   `draftOverlay` or `draftTrail`.
5. **Last-write-wins.**
   Use a temp log with two patches updating the same card field and relationship
   key; assert the later value is the only projected value.
6. **Missing-card patch skipped.**
   Use a patch targeting a nonexistent relative card path; assert the catalog
   load succeeds and `draftOverlay.unresolvedUpdates` names the missing card,
   patch, agenda item, and answer event.
7. **Sweep byte-identical.**
   Hash every file under `studio/sweeps/playmaker-studio/`, load Drafts, hash
   the directory again, and assert equality.
8. **Product-card field mapping, allowed fields only.**
   Assert `prefLabel`, `context`, `plane`, `status`, and typed `relationships`
   map correctly, while `type`, `altitude`, body/story fields, and unknown fields
   are rejected or ignored and do not alter the catalog.
9. **Route and read-only render.**
   `/library/pms-drafts` renders through `EmptyLibraryView`, has no confirm/edit
   affordances, and carries the same peek/workflow/readiness behavior as
   PMS-Back.

## Suggested Test Files And Commands

Add or extend:

- `packages/ax/src/domain/library-draft-overlay.test.ts`
- `packages/ax/tests/runtime-server.test.ts`
- `packages/viewer/src/components/library/viewer-routes.test.ts`
- `packages/viewer/src/components/library/EmptyLibraryView.test.tsx`
- `packages/viewer/tests/serve-viewer-fixture.ts`
- `packages/viewer/tests/library-browser.spec.ts`

Targeted validation commands:

```bash
bun test packages/ax/src/domain/library-draft-overlay.test.ts packages/ax/src/domain/library-front-of-house.test.ts packages/ax/src/domain/library-catalog.test.ts packages/ax/tests/runtime-server.test.ts
pnpm --filter @alexandria/viewer run test
pnpm --filter @alexandria/viewer run test:e2e
pnpm --filter @alexandria/viewer run check
pnpm --filter @alexandria/viewer run build
pnpm --filter @alexandria/ax run typecheck
pnpm run format:check
```

Full repo validation before merge:

```bash
pnpm run check
bun test
```

## Eval Impact

No eval-harness rerun is required for this slice.

Reasoning:

- Product agents do not change.
- Product skills do not change.
- `front-of-house-walk` does not change.
- Plugin workflows do not change.
- Public CLI behavior does not change.
- The behavior is deterministic catalog projection plus viewer rendering, covered
  by AX unit/runtime tests and Viewer unit/build/browser validation.

If a later slice changes Raven's `front-of-house-walk` skill or workflow to
produce this patch log, that later slice must revisit eval coverage for the
Front-of-House guided behavior.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Applying patches after catalog build leaves derived areas, planes, links, or readiness stale | Apply patches to virtual markdown before `buildLibraryCatalog`, then attach trail metadata after projection |
| The Drafts loader accidentally writes to the Back sweep | Keep the overlay helper pure; add byte-hash regression coverage over `studio/sweeps/playmaker-studio/` |
| The patch log drifts into the sweep root | Validate `draftPatchLog` is project-contained and not under the resolved `libraryRoot`; keep the fixture under `studio/drafts/playmaker-studio/` |
| Invalid or missing card paths make the whole Drafts tab unusable | Skip per-update failures, surface them in `draftOverlay.unresolvedUpdates`, and continue applying valid updates |
| Field mapping silently accepts non-FoH fields | Reuse the existing `FrontOfHousePatch` validation and add explicit tests for rejected `body`, `type`, `altitude`, story, and unknown fields |
| Relationship overlay does not show up in the product-card model | Test `relationships -> links` directly at the catalog object level and render changed relationship keys in the Draft overlay trail |
| Optional Draft trail metadata leaks into PMS-Back or generic library modes | Only pass `draftPatchLog` from the `pms-drafts` route and omit `draftOverlay` entirely for missing/empty logs |
| Fixture patch data makes the running app differ from Back in this repo | This is intentional for the fixture. Tests must also cover the missing-log path, which proves deployments without a log render Drafts exactly as Back |

## Implementation Steps

1. Create `studio/drafts/playmaker-studio/patches.json` outside the sweep with a
   small fixture log. Use real Back card paths, at least one scalar update, at
   least one typed relationship update, and optionally one missing-card update
   to prove unresolved surfacing.
2. Extract or expose pure Front-of-House card-update helpers from
   `library-front-of-house.ts`, keeping the existing bundle applier behavior and
   tests intact.
3. Add the pure Draft overlay domain helper. It should parse the patch log,
   apply updates to virtual markdown files in log order, collect trail entries,
   and collect unresolved updates.
4. Extend `LibraryCatalogCard` and `LibraryCatalog` with optional Draft trail
   types.
5. Update `loadLibraryCatalog` / `loadLibraryCatalogRoot` so `draftPatchLog`
   reads the patch log if present, applies the overlay before catalog build, and
   returns the unmodified Back catalog for missing or empty logs.
6. Update the runtime server catalog endpoint to accept and validate the
   `draftPatchLog` query parameter.
7. Update the viewer runtime client and schemas for the optional request
   parameter and optional Draft metadata.
8. Add `pms-drafts` to the viewer route union, parser, serializer, route helper,
   library mode type, and shell tab.
9. Update `LibraryBrowserApp` so `/library/pms-drafts` uses the fixed Back root
   and fixed patch-log path, includes the mode in `needsCatalog`, and renders
   `EmptyLibraryView` read-only.
10. Add optional Draft overlay trail rendering to `EmptyLibraryView`.
11. Add AX tests for the overlay test matrix.
12. Add Viewer route, component, fixture-server, and browser tests for the new
   tab and trail rendering.
13. Run targeted validation, then the broader repo checks listed above.
14. Review the final diff to confirm there are no writes under
   `studio/sweeps/playmaker-studio/` and no plugin workflow or skill changes.

## Acceptance And Exit Criteria

1. `/library/pms-drafts` renders the same contexts and cards as `/library/pms-back`
   when the patch log is absent or empty.
2. With `studio/drafts/playmaker-studio/patches.json` present, Drafts reflects
   each valid patch in scalar card fields and typed `links`.
3. `/library/pms-back` remains unchanged by the overlay.
4. Patched cards show an inspectable Draft trail with patch id, agenda item id,
   answer event id, fields, relationship keys, and card path.
5. Missing-card patch updates are skipped, do not fail the load, and are visible
   as unresolved overlay entries.
6. Applying the same patch log repeatedly yields the same Drafts catalog.
7. Later patches to the same card field or relationship key win deterministically.
8. `studio/sweeps/playmaker-studio/` is byte-identical before and after a
   Drafts load.
9. No confirm/edit affordances appear in PMS-Drafts.
10. PMS-Back, PMS-Drafts, and the future PMS-Final surface remain conceptually
    separate; this slice only implements Drafts.
11. Viewer unit/build/browser validation and AX deterministic tests pass.

## Deferred Follow-Ups

- Adapt `front-of-house-walk` to produce overlay patch logs from agenda threads
  instead of applying in-place bundle edits.
- Implement PMS-Final (#447) as the director approval/confirm state.
- Reconcile diagrams and §5b category vocabulary in the separate sweep-refinement
  track.
- Decide whether a live director-facing Drafts refresh loop is needed during FoH.
- Remove or replace the fixture patch log when real FoH patch generation becomes
  the source of Drafts data for this dogfood instance.
