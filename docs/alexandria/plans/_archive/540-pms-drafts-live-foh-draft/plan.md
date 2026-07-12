# Issue 540 Technical Plan: PMS-Drafts Live Front-of-House Draft

## Header

- Issue reference: `GetAlexandria/alexandria-internal#540`
- Issue title: "PMS-Drafts tab renders the live Front-of-House draft: blank start, fills section by section during a walk"
- Run ID: `01KWGAC42MW16DAYJAEBS19E7H`
- Date: 2026-07-02
- Plan path: `docs/alexandria/plans/540-pms-drafts-live-foh-draft/plan.md`
- Status: Ready for implementation after confirming the #539 writer slice is present on the implementation branch

## Goal

Make `/library/pms-drafts` a live read-only window onto Raven's
Front-of-House draft for the Play Maker's Studio sweep.

Before a walk writes any valid draft patches, the tab must render the exact
empty state:

> No drafts yet — run a Front-of-House walk to start Raven's draft.

During a walk, valid resolved patch-log entries should appear in the already
open tab within 5 seconds, grouped section by section. Confirmed sections should
show the director-confirmed `prefLabel` and `summary` from
`library.front_of_house.section_confirmed`; unconfirmed sections should show
their context without inventing a summary.

## Linked Product-Plan Summary

There is no separate linked product-level plan. The GitHub issue body is the
product contract.

Related local plans and shipped context:

- `docs/alexandria/plans/446-pms-drafts/plan.md` added the read-only Drafts
  overlay on top of `studio/sweeps/playmaker-studio`.
- `docs/alexandria/plans/464-pms-drafts-invalid-patches/plan.md` made malformed
  individual patch entries non-fatal for the Drafts read path.
- `docs/alexandria/plans/512-section-confirmed-canonical-projection/plan.md` is
  reflected in this checkout: `parseSectionConfirmed(event)` exists in
  `packages/ax/src/domain/state-events.ts` and should be reused for section
  headers.
- `docs/alexandria/plans/539-foh-durable-draft-patch-log/plan.md` is the writer
  prerequisite. This issue assumes resolved Front-of-House rulings append to
  `studio/drafts/playmaker-studio/patches.json` and emit
  `library.front_of_house.bundle_patch_applied`.

## Sources Read

- Root `CLAUDE.md`, `README.md`, and `EVALS.md`.
- `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- `packages/viewer/README.md`.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md`.
- `packages/alexandria-plugin/CLAUDE.md` and
  `packages/alexandria-plugin/README.md`.
- `studio/README.md`.
- Existing plans for #446, #464, #512, and #539.
- Current implementation and tests:
  - `packages/viewer/src/components/library/LibraryBrowserApp.tsx`
  - `packages/viewer/src/components/library/LibraryBrowserShell.tsx`
  - `packages/viewer/src/components/library/EmptyLibraryView.tsx`
  - `packages/viewer/src/components/library/hooks/useLibraryCatalog.ts`
  - `packages/viewer/src/components/library/viewer-routes.ts`
  - `packages/viewer/src/app/runtime/client.ts`
  - `packages/viewer/src/app/runtime/event-stream.ts`
  - `packages/viewer/src/app/runtime/schemas.ts`
  - `packages/viewer/tests/serve-viewer-fixture.ts`
  - `packages/viewer/tests/library-browser.spec.ts`
  - `packages/ax/src/effects/library-graph-loader.ts`
  - `packages/ax/src/effects/runtime-server.ts`
  - `packages/ax/src/domain/library-catalog.ts`
  - `packages/ax/src/domain/library-draft-overlay.ts`
  - `packages/ax/src/domain/state-events.ts`
  - `packages/ax/src/commands/front-of-house.ts`
  - `studio/drafts/playmaker-studio/patches.json`

## Scope

In scope:

- Replace the shipped PMS-Drafts patch-log fixture with an empty JSON array at
  `studio/drafts/playmaker-studio/patches.json`.
- Keep `/library/pms-back` rendering the frozen Back-of-House sweep exactly as
  it does now.
- Change `/library/pms-drafts` from "Back catalog plus overlay summary" to a
  Drafts-specific read-only view that renders only overlay-touched cards.
- Show the exact empty state when the patch log has no valid applied draft
  cards.
- Refresh the PMS-Drafts catalog automatically while the tab is open often
  enough to show real patch-log appends within 5 seconds.
- Extend the AX catalog response for Drafts overlays with confirmed-section
  metadata derived from `section_confirmed` events.
- Render drafted cards grouped by section, with card-level draft attribution and
  section context.
- Preserve malformed-entry tolerance: invalid patch entries are surfaced as
  diagnostics while remaining valid entries render.
- Ensure residual/hold events do not create Drafts content.
- Add focused AX and Viewer tests for the acceptance matrix.

## Non-Goals

- Do not implement draft-to-base materialization, banking, approval, or merge
  behavior.
- Do not add editing, retry, approval, or confirm affordances to PMS-Drafts.
- Do not change `front-of-house-walk` play prompts, shipped plugin skills, or
  plugin workflow semantics in this slice.
- Do not change the `FrontOfHousePatch` schema or
  `library.front_of_house.section_confirmed` event payload shape.
- Do not require the viewer to read workspace files or Ledger JSONL directly.
- Do not make PMS-Back aware of draft logs or section confirmations.
- Do not write to `docs/alexandria/library/`.
- Do not edit vendored repositories under `repos/`.

## Current Gap

Today `/library/pms-drafts` is static after the initial catalog request:

- `LibraryBrowserApp.tsx` maps `pms-drafts` to
  `/api/library/catalog?draftPatchLog=studio/drafts/playmaker-studio/patches.json&libraryRoot=studio/sweeps/playmaker-studio`.
- `useLibraryCatalog` fetches once and only reloads on manual `refresh`.
- `pms-back` and `pms-drafts` both render `EmptyLibraryView`; Drafts therefore
  still exposes the full Back catalog instead of a blank/live draft window.
- `studio/drafts/playmaker-studio/patches.json` still contains two fixture
  patches from the overlay buildout.
- The existing overlay metadata has patch and invalid-entry diagnostics, but no
  confirmed-section header data from the Ledger.
- Existing browser fixture coverage asserts the old fixture overlay, including
  sample patch content and invalid patch text.

The issue requires the opposite director-facing behavior: empty before a real
walk, live as the patch log changes, section headers from real
`section_confirmed` events, and no fixture/sample fallback.

## Architectural Boundaries

- AX remains the runtime API owner. The viewer should continue to request
  `/api/library/catalog`; it must not read `studio/drafts/...` or Ledger files
  directly.
- The Drafts overlay projection remains an AX domain concern. React receives a
  decoded catalog response and renders it.
- Polling is the durable live-update mechanism for this slice. Existing SSE
  broadcasts only cover events appended through the runtime server, while a
  Front-of-House walk or CLI process can append the patch log and Ledger outside
  the viewer process. A 2-second catalog poll while `/library/pms-drafts` is
  active satisfies the 5-second contract without relying on writer locality.
- The catalog response should use the canonical `parseSectionConfirmed(event)`
  helper from `state-events.ts`; do not add another field-by-field
  `section_confirmed` parser.
- Section confirmations should be scoped to the current draft log where
  possible: derive applied patch ids from the overlay projection, match them to
  `bundle_patch_applied` events for the same library root, then select latest
  `section_confirmed` events for those `playRunId`s by `plane + context`.
- If no matching `bundle_patch_applied` event is available yet, render the draft
  cards without a confirmed summary. A later poll can attach the confirmation
  when the event exists.
- PMS-Drafts is a read-only view. Do not pass `runtimeClient` mutation props or
  confirmation callbacks into it.
- PMS-Back must not pass `draftPatchLog`, must not poll for Drafts changes, and
  must not render draft metadata.

## Response Contract

Extend the Drafts overlay response with confirmed-section metadata. Suggested
AX/viewer shape:

```ts
interface LibraryCatalogDraftSectionConfirmation {
  answerEventId: string;
  cards: string[];
  context: string;
  eventId: string;
  plane: string;
  playRunId: string;
  prefLabel: string;
  summary: string;
  unknowns: string[];
  scope?: string;
}

interface LibraryCatalogDraftOverlay {
  appliedPatchCount: number;
  appliedUpdateCount: number;
  invalidPatches: LibraryCatalogDraftInvalidPatch[];
  patchLogPath: string;
  sectionConfirmations: LibraryCatalogDraftSectionConfirmation[];
  unresolvedUpdates: LibraryCatalogDraftUnresolvedUpdate[];
}
```

Rules:

1. `sectionConfirmations` is present whenever `draftOverlay` is present and may
   be empty.
2. The stored Ledger event shape does not change.
3. Only schema-valid `section_confirmed` events returned by
   `parseSectionConfirmed(event)` participate.
4. Latest event wins per `plane + context` within the matching draft run ids.
5. Invalid patch entries do not create sections or cards.
6. Residual events do not create sections or cards.
7. Empty or missing draft logs still omit `draftOverlay` from the catalog
   response, preserving the #446 read contract for base catalog loading.

## Viewer Behavior Contract

`/library/pms-drafts` should render a dedicated Drafts view, not the full
`EmptyLibraryView` catalog.

Behavior:

- Compute `draftCards = catalog.cards.filter(card => card.draftTrail?.length)`.
- If `draftCards.length === 0`, show only the exact empty state copy and any
  non-card diagnostics that matter, such as invalid patch entries. Do not show
  Back cards as draft cards.
- Group draft cards by `plane + context`.
- For each group, render a section header:
  - if `draftOverlay.sectionConfirmations` has a matching confirmation, show
    its `prefLabel` and `summary`;
  - otherwise show the raw context/plane and omit the summary area entirely.
- Each rendered card must visibly say it is a draft change and show its section
  context. The existing `draftTrail` patch/agenda/answer/changed details can be
  reused or moved into the new Drafts view.
- Keep invalid patch and unresolved update diagnostics available without
  turning them into draft cards.
- Do not render empty-library confirm controls, edit controls, or mutation
  affordances.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Plan artifact | `docs/alexandria/plans/540-pms-drafts-live-foh-draft/plan.md` | Defines this implementation slice. |
| Shipped draft log | `studio/drafts/playmaker-studio/patches.json` | Replace fixture patches with `[]`. |
| AX draft overlay projection | `packages/ax/src/domain/library-draft-overlay.ts` | Carry applied patch ids internally so the loader can resolve matching run ids; keep tolerant invalid-entry behavior. |
| AX catalog response types | `packages/ax/src/domain/library-catalog.ts` | Add `LibraryCatalogDraftSectionConfirmation` and `draftOverlay.sectionConfirmations`. |
| AX catalog loader | `packages/ax/src/effects/library-graph-loader.ts` | When loading a Drafts overlay, read relevant Ledger events, parse section confirmations with `parseSectionConfirmed`, match them to applied draft run ids, and attach latest section metadata. |
| AX runtime catalog API | `packages/ax/src/effects/runtime-server.ts` | No new endpoint expected; existing `/api/library/catalog` returns the extended catalog shape. |
| Viewer runtime schemas | `packages/viewer/src/app/runtime/schemas.ts` | Decode `draftOverlay.sectionConfirmations`. |
| Viewer runtime client / hooks | `packages/viewer/src/app/runtime/client.ts`, `packages/viewer/src/components/library/hooks/useLibraryCatalog.ts` | Keep request serialization stable; add optional auto-refresh interval support for catalog requests. |
| Viewer app routing/rendering | `packages/viewer/src/components/library/LibraryBrowserApp.tsx` | Pass a 2-second auto-refresh interval only for `pms-drafts`; render a dedicated PMS-Drafts component for that mode. |
| Viewer Drafts component | New `packages/viewer/src/components/library/PmsDraftsView.tsx` or a focused module near `EmptyLibraryView.tsx` | Render empty state, section groups, confirmed headers, draft-card attribution, and diagnostics without edit affordances. |
| Viewer fixtures | `packages/viewer/tests/serve-viewer-fixture.ts` | Replace fixed fixture Drafts catalog with controllable empty/valid/invalid/residual states for live browser tests. |
| Tests | AX domain/runtime tests and Viewer unit/e2e tests | Cover empty state, live append, section headers, malformed-entry tolerance, hold/residual no-op, and Back isolation. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Viewer PMS-Drafts | Changes from static fixture-backed Back+overlay rendering to a live read-only draft window showing only drafted cards. | Viewer unit, build, and Playwright validation. |
| AX catalog runtime | Adds confirmed-section metadata to the existing Drafts catalog response. | AX runtime/domain tests and viewer schema decode tests. |
| Front-of-House CLI writer | No intended behavior change in this issue. The plan depends on #539's durable patch-log writer. | No new CLI black-box tests unless implementation discovers #539 is absent and must be completed first. |
| Shipped plugin skills/workflows | No intended behavior change. | No plugin validation or eval rerun required unless implementation unexpectedly edits `packages/alexandria-plugin`. |
| Product eval surfaces | No reusable agent or skill behavior changes. | No eval-harness rerun required for this slice. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX draft overlay/domain tests | `pnpm --filter @alexandria/ax test -- src/domain/library-draft-overlay.test.ts` | Guards empty log behavior, valid plus malformed entries, and internal applied patch id projection without changing Back files. |
| AX runtime catalog tests | `pnpm --filter @alexandria/ax test -- tests/runtime-server.test.ts` | Proves `/api/library/catalog` returns section confirmations for matching draft patches, omits stale/wrong-run confirmations, tolerates malformed entries, and keeps PMS-Back requests clean. |
| AX event projection regression | `pnpm --filter @alexandria/ax test -- tests/events.test.ts` | Confirms `section_confirmed` parsing/schema behavior remains stable while reused by the catalog loader. |
| Viewer runtime client/schema tests | `pnpm --filter @alexandria/viewer test -- src/app/runtime/client.test.ts` | Verifies `sectionConfirmations` decode and existing `draftPatchLog` request serialization. |
| Viewer Drafts component tests | `pnpm --filter @alexandria/viewer test -- src/components/library/EmptyLibraryView.test.tsx` plus a new focused `PmsDraftsView.test.tsx` if split out | Covers exact empty copy, no overlay cards, confirmed header rendering, unconfirmed no-summary rendering, invalid diagnostics, and no edit affordances. |
| Viewer route tests | `pnpm --filter @alexandria/viewer test -- src/components/library/viewer-routes.test.ts` | Keeps `/library/pms-drafts` routing stable. |
| Viewer browser tests | `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` | Covers live append appearing in an open tab, Back-tab isolation, and residual/hold no-op through the fixture server. |
| Viewer type/build checks | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Catches Astro/React/schema integration errors. |
| AX typecheck/lint if AX changes | `pnpm --filter @alexandria/ax run typecheck` and `pnpm --filter @alexandria/ax run lint` | Required because catalog domain/runtime types change. |
| Viewer format check | `pnpm --filter @alexandria/viewer run format:check` | Ensures touched TS/TSX/JSON formatting is stable. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Viewer PMS-Drafts | Covered by deterministic Viewer unit and Playwright tests, not LLM evals. | Add/adjust deterministic tests only. | No `pnpm eval` command. |
| AX catalog runtime | Covered by Bun runtime/domain tests. | Add focused catalog response tests for section confirmations and isolation. | No eval-harness case. |
| Front-of-House skill/workflow | Not changed by this issue. | No rerun required. If implementation edits `packages/alexandria-plugin/skills/front-of-house-walk` or workflow files unexpectedly, rerun the relevant Front-of-House eval/validation set before merge. | Not applicable for the planned slice. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Polling every 2 seconds adds runtime load while the tab is open. | Limit polling to active `/library/pms-drafts` requests, reuse the existing catalog endpoint, abort in-flight requests on unmount/route change, and do not poll PMS-Back. |
| Stale `section_confirmed` events from an older walk could label a new draft section incorrectly. | Resolve run ids through matching `bundle_patch_applied` events for applied patch ids and the same library root before selecting latest `section_confirmed` by `plane + context`. |
| A patch log append can be visible before the corresponding Ledger event. | Render draft cards immediately without a confirmed summary; later polls attach the section header once the event appears. |
| The dedicated Drafts view could accidentally show Back cards and violate the blank-start requirement. | Filter rendered cards strictly to `card.draftTrail?.length > 0`; add unit and browser tests asserting zero draft cards for an empty log. |
| Malformed patch handling could regress while adding section metadata. | Keep `parseFrontOfHousePatchLog` tolerant for the read path and add mixed valid/invalid runtime and viewer tests. |
| Back-tab isolation could regress if polling/request options are shared too broadly. | Keep `pms-back` request as `{ libraryRoot: PMS_LIBRARY_ROOT }`, pass auto-refresh only in `pms-drafts`, and add browser assertions that Back has no draft summary/cards before and after Drafts state changes. |
| The checked-in empty `patches.json` could weaken existing overlay fixture tests. | Move fixture patch data into tests or fixture-server state instead of relying on shipped product data. |

## Implementation Steps

1. Confirm the implementation branch has the #539 writer behavior:
   `apply-patch` can append to a draft log and emits
   `library.front_of_house.bundle_patch_applied`. If it does not, stop and land
   #539 first.
2. Replace `studio/drafts/playmaker-studio/patches.json` contents with `[]`.
3. Extend AX catalog types with `LibraryCatalogDraftSectionConfirmation` and
   `draftOverlay.sectionConfirmations`.
4. Extend `LibraryDraftOverlayProjection` with internal applied patch ids, and
   keep those ids out of the serialized response unless they are needed for a
   documented test helper.
5. In `loadLibraryCatalog`, when `draftPatchLog` is present and an overlay
   projection exists:
   - list `bundle_patch_applied` and `section_confirmed` events;
   - match applied patch ids to events for the resolved library root;
   - collect matching `playRunId`s;
   - parse section confirmations with `parseSectionConfirmed`;
   - select latest confirmation per `plane + context`;
   - attach them to `draftOverlay.sectionConfirmations`.
6. Update viewer runtime schemas and decode tests for the extended overlay
   shape.
7. Add optional auto-refresh interval support to `useLibraryCatalog`. Use a
   2-second interval, avoid overlapping requests, abort on cleanup, and surface
   errors through the existing error state.
8. Update `LibraryBrowserApp.tsx` so only `pms-drafts` passes the auto-refresh
   interval and only `pms-drafts` renders the new Drafts view.
9. Implement the Drafts view:
   - exact empty state when no `draftTrail` cards exist;
   - section grouping by `plane + context`;
   - confirmed headers from `sectionConfirmations`;
   - context-only headers with no summary for unconfirmed sections;
   - card-level "draft change" attribution and section context;
   - invalid/unresolved diagnostics;
   - no edit or confirm controls.
10. Update the viewer fixture server so Drafts catalog state can start empty and
    be changed during a Playwright test. Keep this under `__fixture/*` routes
    only.
11. Replace the old fixture-content PMS-Drafts browser test with acceptance
    tests for empty start, live append, section header, residual no-op, malformed
    tolerance, and Back isolation.
12. Run the deterministic verification commands above and fix any regressions.

## Acceptance / Exit Criteria

1. `studio/drafts/playmaker-studio/patches.json` ships as an empty JSON array.
2. With the empty log, `/library/pms-drafts` shows
   `No drafts yet — run a Front-of-House walk to start Raven's draft.` and no
   draft cards.
3. With the tab already open, a valid resolved patch appended to the log appears
   without manual reload within 5 seconds.
4. A confirmed section shows the director-confirmed `prefLabel` and `summary`
   from `library.front_of_house.section_confirmed`.
5. A section with drafted cards but no matching `section_confirmed` event renders
   with context only and no invented summary.
6. A residual/hold event without a valid draft-log patch adds no Drafts card.
7. A malformed patch entry does not block valid entries from rendering and still
   surfaces invalid patch diagnostics.
8. `/library/pms-back` shows the frozen base before, during, and after Drafts
   changes: no draft cards, no draft summary, no draft polling requirement.
9. PMS-Drafts has no edit, confirm, approval, or materialization affordances.
10. The focused AX and Viewer tests listed in this plan pass.

## Deferred Follow-Ups

1. Draft-to-base materialization / banking / approval flow for PMS-Final.
2. Event-driven Drafts refresh through a durable runtime file watcher if the
   runtime later owns cross-process Ledger tailing.
3. A richer section timeline showing answer turns and residuals beside draft
   cards.
4. Operator documentation for clearing or archiving
   `studio/drafts/playmaker-studio/patches.json` between formal walks, if that
   becomes part of the Studio operating model.
