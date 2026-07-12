# Issue 575 Technical Plan: Drafts Renders Frame Rulings

## Header

- Issue reference: `GetAlexandria/alexandria-internal#575`
- Issue title: "Frame-ruling cascade S4: Drafts surface renders rulings, not
  only card diffs"
- Run ID: `01KWHWX6Z6VYYQ2VHBFWRARWF5`
- Date: 2026-07-02
- Plan path:
  `docs/alexandria/plans/575-frame-ruling-cascade-s4-drafts-rulings/plan.md`
- Linked product plan:
  `docs/alexandria/plans/frame-ruling-cascade/plan.md` on branch
  `danversfleury/frame-ruling-cascade-plan`
- Product-plan section: `frame-ruling-cascade` section 4.5, slice S4

## Sources Read

- Root guidance: `CLAUDE.md`, `README.md`, and `EVALS.md`.
- Planning guidance:
  `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- Package guidance:
  - `packages/ax/CLAUDE.md`
  - `packages/ax/README.md`
  - `packages/pms/CLAUDE.md`
  - `packages/viewer/README.md`
- Linked product plan through the GitHub connector:
  - branch `danversfleury/frame-ruling-cascade-plan`
  - path `docs/alexandria/plans/frame-ruling-cascade/plan.md`
- Related local plans:
  - `docs/alexandria/plans/446-pms-drafts/plan.md`
  - `docs/alexandria/plans/540-pms-drafts-live-foh-draft/plan.md`
  - `docs/alexandria/plans/566-alexandria-drafts-tab/plan.md`
  - `docs/alexandria/plans/512-section-confirmed-canonical-projection/plan.md`
- Current implementation and tests:
  - `packages/ax/src/domain/library-draft-overlay.ts`
  - `packages/ax/src/domain/library-draft-overlay.test.ts`
  - `packages/ax/src/domain/library-front-of-house.ts`
  - `packages/ax/src/domain/library-catalog.ts`
  - `packages/ax/src/domain/state-events.ts`
  - `packages/ax/src/effects/library-graph-loader.ts`
  - `packages/ax/tests/runtime-server.test.ts`
  - `packages/pms/viewer/src/app/PmsApp.tsx`
  - `packages/pms/viewer/src/app/runtime/schemas.ts`
  - `packages/pms/viewer/src/components/library/DraftsView.tsx`
  - `packages/pms/viewer/src/components/library/DraftsView.test.tsx`
  - `packages/pms/viewer/src/components/library/DraftOverlayViews.tsx`
  - matching Drafts files under `packages/viewer/src/components/library/`
    where the shipped Alexandria Drafts tab reuses the same copied component

The live Alexandria product draft log named by the issue,
`studio/drafts/alexandria-product/patches.json`, is not present in this
checkout. The plan therefore requires deterministic fixtures instead of
depending on that live specimen being checked in.

## Goal

Make the Drafts surface render Front-of-House decisions as first-class draft
entries, not only card-file diffs.

A valid resolved patch with `cardUpdates: []` must still appear with its agenda
item, resolution, and an excerpt of the director's ruling prose. When present,
`containerMapping` renders as a map delta and `keystoneDraft` renders as the
proposed index card. Section confirmations for the same walk render from
`library.front_of_house.section_confirmed` events even when the walk has no
applied card-touching patch.

## Scope

In scope:

- Extend the AX Drafts overlay projection so every valid resolved patch-log
  entry becomes visible overlay data, including zero-card patches.
- Preserve enough raw patch-log display fields for S4 to render
  `containerMapping` and `keystoneDraft` when those producer slices land.
- Resolve ruling prose excerpts from `library.front_of_house.answer_recorded`
  events keyed by `answerEventId`.
- Fix the loader's section-confirmation scoping so run ids can come from
  patch answer events, not only from card-touching `bundle_patch_applied`
  events.
- Extend AX catalog response types and viewer runtime schemas with the new
  Drafts ruling-entry shape.
- Update the Drafts view to render:
  - ruling entries even when no cards changed
  - confirmation-only sections
  - container map deltas
  - proposed keystone drafts
  - existing card-diff sections unchanged
- Add deterministic AX and viewer tests for the issue acceptance matrix.
- Keep PMS viewer and the shipped Alexandria viewer Drafts copies aligned when
  both copies exist in this checkout.

## Non-Goals

- Do not change patch-apply behavior or card-file writes.
- Do not implement S1 mechanical fan-out, S2 agenda re-projection, S3
  keystone generation, S5 ruling-aware triage, or Notepad behavior.
- Do not change Front-of-House agenda staging or residual-gap behavior.
- Do not write to a base bundle or to `docs/alexandria/library/`.
- Do not add a new runtime endpoint; use the existing library catalog response.
- Do not add edit, approval, bank, retry, or materialization controls to
  Drafts.
- Do not change plugin skills or workflows.
- Do not edit vendored repositories under `repos/`.

## Linked Product-Plan Summary

The `frame-ruling-cascade` product plan defines the "lodestone" contract:
a frame-gate ruling is not disposable prose. It is a banked director decision
whose structured mapping can deterministically re-project downstream surfaces.

For S4, the frozen product decisions are:

- Every patch in the draft log renders an entry, even when `cardUpdates` is
  empty.
- A `containerMapping` entry renders each container disposition:
  `keep`, `rename`, `merge`, `demote`, or `hold`, with the planner-provided
  `basis` quote.
- A `keystoneDraft` entry renders as the proposed index card.
- Section confirmations render whenever their
  `library.front_of_house.section_confirmed` events exist for the walk,
  independent of card updates.

This slice is a display and loader-scope slice. The plan explicitly leaves
mapping production, mechanical fan-out, agenda effects, and keystone production
to the other frame-ruling cascade slices.

## Current Gap

AX already has a Drafts overlay path:

- `parseFrontOfHousePatchLog()` accepts valid resolved patches with
  `cardUpdates: []`.
- `applyLibraryDraftOverlay()` returns a projection when a patch log has valid
  patches, but it only records `appliedPatches` inside the card-update loop.
- `draftTrail` metadata is attached only to cards whose markdown was virtually
  changed.
- `library-graph-loader.ts` only reads `section_confirmed` events when
  `draftOverlayProjection.appliedPatches.length > 0`.
- `latestDraftSectionConfirmations()` derives play run ids from
  `bundle_patch_applied` events matching those applied card patches.

The PMS Drafts view then renders sections by scanning cards with `draftTrail`.
If a patch has no card updates, there is no card trail, so the view falls back
to the empty state. Confirmation-only sections are also dropped because no
draft card seeds their section group.

That is the live bug from 2026-07-02: the largest frame ruling can be banked in
the patch log and Ledger, yet Drafts renders a blank panel.

## Architectural Boundaries

- AX owns the projection from patch log plus Ledger events to catalog response.
  React should render typed catalog data and must not read patch logs or Ledger
  files directly.
- Keep the existing `/api/library/catalog` request path. The additional fields
  are optional response data under `draftOverlay`.
- The patch log remains the source for visible ruling entries. Ledger events
  enrich entries with walk run ids and ruling prose excerpts.
- Determine walk scope for section confirmations from valid patch-log entries:
  - prefer the matching `library.front_of_house.answer_recorded` event by
    `answerEventId`;
  - fall back to existing matching `bundle_patch_applied` events for legacy
    card-diff cases when needed;
  - never render `section_confirmed` events from unrelated play runs.
- Empty or missing draft logs continue to return the base catalog with no
  `draftOverlay`.
- Invalid patch entries may still surface as diagnostics, but they must not
  create false ruling entries or walk scope.
- Existing card-diff rendering stays in place. Ruling entries are additive and
  should not remove `draftTrail`, changed-field displays, unresolved update
  diagnostics, or invalid patch diagnostics.
- The viewer should not render raw schema or validation field names as the new
  product UI. Use product copy such as "Map ruling", "Proposed index card",
  "Resolved", and disposition labels instead of `containerMapping`,
  `keystoneDraft`, or `cardUpdates`.
- The copied Drafts components in `packages/pms/viewer` and `packages/viewer`
  should stay behaviorally aligned. Do not introduce a broad shared-package
  refactor in this slice.

## Response Contract

Extend `LibraryCatalogDraftOverlay` with visible ruling entries. Suggested
shape:

```ts
interface LibraryCatalogDraftRulingEntry {
  agendaItemId: string;
  answerEventId: string;
  cardUpdateCount: number;
  containerMapping: LibraryCatalogDraftContainerMappingEntry[];
  keystoneDraft?: LibraryCatalogDraftKeystoneDraft;
  patchId: string;
  playRunId?: string;
  resolution: "resolved";
  rulingExcerpt?: string;
}

interface LibraryCatalogDraftContainerMappingEntry {
  basis: string;
  disposition: "keep" | "rename" | "merge" | "demote" | "hold";
  from: string;
  to?: string;
}

interface LibraryCatalogDraftKeystoneDraft {
  body: string;
  context?: string;
  plane?: string;
  prefLabel?: string;
  status?: string;
}
```

Implementation may adjust field names to match local conventions, but the
behavioral contract is fixed:

- one ruling entry per valid resolved patch-log entry;
- `cardUpdateCount` can be zero;
- `rulingExcerpt` comes from the matching answer event's `answerText`;
- `containerMapping` preserves every supplied mapping item in log order;
- `keystoneDraft` preserves the proposed card content needed for rendering;
- absent optional producer fields render no map or keystone block;
- invalid patch-log entries do not produce ruling entries.

Keep `appliedUpdateCount` as the count of card updates that actually apply.
If `appliedPatchCount` remains in the public overlay shape, redefine or
supplement it so zero-card valid patches are represented without breaking
existing card-diff diagnostics. A clearer additive field such as `rulingCount`
or `visiblePatchCount` is acceptable if preserving old count semantics is
safer.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Plan artifact | `docs/alexandria/plans/575-frame-ruling-cascade-s4-drafts-rulings/plan.md` | Defines this implementation slice. |
| AX patch-log parsing/projection | `packages/ax/src/domain/library-draft-overlay.ts` | Preserve one visible ruling entry per valid patch, including zero-card patches, and carry raw display-only `containerMapping` / `keystoneDraft` data. |
| AX catalog contract | `packages/ax/src/domain/library-catalog.ts` | Add optional typed Drafts ruling-entry, container-mapping, and keystone-draft response shapes. |
| AX event parsing | `packages/ax/src/domain/state-events.ts` or a focused helper near the loader | Add a typed helper for `library.front_of_house.answer_recorded` if needed, mirroring `parseBundlePatchApplied` and `parseSectionConfirmed`. |
| AX loader scoping | `packages/ax/src/effects/library-graph-loader.ts` | Load Ledger events when a draft overlay has visible patch entries; derive walk run ids from answer events and card patch events; attach section confirmations even without card diffs. |
| AX runtime API | Existing `/api/library/catalog` in `packages/ax/src/effects/runtime-server.ts` | No endpoint change; response includes the extended overlay fields. |
| PMS viewer schemas | `packages/pms/viewer/src/app/runtime/schemas.ts` | Decode the extended `draftOverlay` response. |
| PMS Drafts view | `packages/pms/viewer/src/components/library/DraftsView.tsx` and `DraftOverlayViews.tsx` if useful | Render ruling entries, map deltas, proposed index cards, and confirmation-only sections without changing card-diff rendering. |
| PMS viewer tests | `packages/pms/viewer/src/components/library/DraftsView.test.tsx` | Cover zero-card rulings, section-only confirmations, mapping, keystone, card-diff regression, empty state, and no raw schema labels. |
| Alexandria viewer copy | Matching files under `packages/viewer/src/app/runtime/` and `packages/viewer/src/components/library/` if present | Keep the shipped Alexandria Drafts tab behavior aligned with the PMS Drafts component. |
| AX tests | `packages/ax/src/domain/library-draft-overlay.test.ts`, `packages/ax/tests/runtime-server.test.ts` | Cover projection and runtime catalog behavior for zero-card patch entries and section confirmations. |
| Fixtures | Test-local fixtures under AX and viewer tests | Add fixture patch logs with zero-card patch, `containerMapping`, `keystoneDraft`, matching answer event, matching section confirmation, card-diff regression, and no-walk empty case. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| AX catalog runtime | Adds visible Drafts ruling metadata and fixes walk scoping for `section_confirmed` projection. | AX domain/runtime tests and viewer schema decode updates. |
| PMS Drafts viewer | Renders decisions even without card diffs and renders confirmation-only sections. | PMS viewer unit tests, typecheck, and build. |
| Alexandria viewer Drafts copy | If touched, mirrors the PMS Drafts behavior for the shipped Alexandria Drafts tab. | Alexandria viewer unit/build/browser validation. |
| CLI commands | No CLI command, exit code, or stdout/stderr contract changes intended. | No CLI black-box tests required unless implementation changes a CLI command. |
| Plugin agents/skills/workflows | No behavior changes. | No plugin validation or eval rerun required. |
| Eval harness | No reusable agent, skill, prompt, or eval-backed behavior changes. | No eval-harness case or baseline change required. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX Drafts overlay domain | `pnpm --filter @alexandria/ax test -- src/domain/library-draft-overlay.test.ts` | Proves zero-card patches become visible ruling entries, mapping/keystone fields survive projection, and card-diff behavior remains intact. |
| AX runtime catalog | `pnpm --filter @alexandria/ax test -- tests/runtime-server.test.ts` | Proves `/api/library/catalog` returns ruling entries and section confirmations for a walk with no card-touching patches, while empty logs stay empty. |
| PMS viewer unit tests | `pnpm --filter @alexandria/pms-viewer run test` | Covers Drafts rendering behavior and schema decode through component fixtures. |
| PMS viewer typecheck | `pnpm --filter @alexandria/pms-viewer run typecheck` | Verifies the extended runtime schema and React props compile. |
| PMS viewer build | `pnpm --filter @alexandria/pms-viewer run build` | Confirms `pms start` can serve the built Drafts surface. |
| Alexandria viewer unit/check/build, if touched | `pnpm --filter @alexandria/viewer run test`; `pnpm --filter @alexandria/viewer run check`; `pnpm --filter @alexandria/viewer run build` | Required if the copied shipped viewer Drafts files or schemas change. |
| Alexandria viewer browser validation, if touched | `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` | Required browser validation for the shipped viewer Drafts route if implementation changes it. |
| Manual PMS smoke | `pms start`, open `http://127.0.0.1:4322/?surface=pms-drafts` | Confirms the built PMS Drafts tab renders through the pms server proxy. |

The local environment used for this plan has a broken read-only sandbox, so the
implementation stage should run the commands in its own working environment and
report any skipped command explicitly.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX Drafts catalog projection | Deterministic Bun tests cover overlay projection and runtime catalog responses. | Add/adjust deterministic tests only. | `pnpm --filter @alexandria/ax test -- src/domain/library-draft-overlay.test.ts tests/runtime-server.test.ts` |
| PMS Drafts UI | Component tests cover empty state, draft cards, confirmations, and diagnostics. | Extend component tests for ruling entries, map deltas, keystone drafts, and empty negative. | `pnpm --filter @alexandria/pms-viewer run test` |
| Alexandria viewer Drafts UI | Viewer unit/e2e coverage exists for fixed Drafts routes. | Run and update deterministic viewer tests if implementation touches the shipped viewer copy. | Viewer test/check/build/browser commands above |
| Product plugin agents and skills | No product skill or workflow behavior changes. | No eval-harness rerun required. | None |
| CLI commands | No CLI behavior changes. | No CLI black-box test requirement. | None |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Section confirmations from a different walk appear in the current Drafts panel. | Derive candidate play run ids only from patch-log entries in the requested draft log, using answer events and matching bundle patch events; keep latest-wins grouping within that scoped run set. |
| Zero-card patches still look empty because the viewer only groups by cards. | Add a top-level ruling-entry render path and seed section groups from confirmations before adding cards. Tests must use a catalog with no `draftTrail` cards. |
| S4 accidentally invents a producer contract for `containerMapping` or `keystoneDraft`. | Treat these as display-only fields from the frozen frame-ruling plan; do not generate or mutate them in S4. Fixtures should match the product-plan shapes and later S1/S3 producer tests. |
| Raw JSON/schema labels leak into the UI. | Render product copy and disposition labels only; add component assertions that markup does not contain `containerMapping`, `keystoneDraft`, or `cardUpdates` in the new ruling blocks. |
| Existing card-diff rendering regresses while adding ruling entries. | Keep `draftTrail` and card section rendering intact; include a regression fixture with a normal card update and existing changed-field/relationship assertions. |
| Empty or absent logs create a false rulings panel. | Preserve the current `null` overlay behavior for absent/empty logs and add negative runtime and component tests. |
| Invalid patch entries become visible as director rulings. | Continue routing invalid entries only to diagnostics; ruling entries are built only from valid resolved patches. |
| Polling the Drafts catalog every 2 seconds becomes more expensive because the loader reads events more often. | Read Ledger events only when the patch log yields visible patch entries or diagnostics that require enrichment; keep missing/inaccessible event store behavior fail-soft as today. |
| PMS viewer and shipped Alexandria viewer copies drift. | Update both copied Drafts/schema files if both are present and touched, and run the relevant package tests. Defer any extraction/refactor to a separate slice. |

## Implementation Steps

1. Extend AX Drafts overlay types in `library-catalog.ts` with ruling-entry,
   container-mapping, and keystone-draft response shapes.
2. Update `library-draft-overlay.ts` to build visible patch/ruling entries
   while parsing the patch log:
   - include valid patches with `cardUpdates: []`;
   - preserve `agendaItemId`, `answerEventId`, normalized `patchId`,
     `resolution`, and `cardUpdateCount`;
   - copy display-only `containerMapping` entries when present and valid enough
     to render;
   - copy display-only `keystoneDraft` content when present;
   - keep invalid patch entries out of the ruling list.
3. Keep virtual card patching unchanged for `cardUpdates`, including unresolved
   update diagnostics and `draftTrail` attachment.
4. Add or reuse a typed `answer_recorded` parser that extracts `playRunId`,
   `agendaItemId`, and `answerText` from matching answer events.
5. Refactor `library-graph-loader.ts` section-confirmation scoping:
   - load events whenever a draft overlay has visible patch entries;
   - enrich ruling entries with `playRunId` and `rulingExcerpt` from matching
     answer events;
   - derive section-confirmation run ids from matching answer events first;
   - preserve the existing `bundle_patch_applied` matching path for card-diff
     overlays;
   - attach latest `section_confirmed` events by `plane + context` for those
     run ids even when no card update was applied.
6. Update runtime schemas in PMS viewer, and in the shipped viewer copy if it
   consumes the same catalog fields.
7. Update `DraftsView` to render:
   - a ruling list whenever `draftOverlay.rulings` is non-empty;
   - the agenda item, resolved status, and director-prose excerpt;
   - a map-delta block for `containerMapping`;
   - a proposed-index-card block for `keystoneDraft`;
   - confirmation-only sections with header and summary even when `cards` is
     empty;
   - existing card sections and `DraftTrail` unchanged.
8. Update `DraftOverlaySummary` only if count/copy changes are needed. Avoid
   showing validation/schema labels in the new ruling-entry UI.
9. Add AX domain fixtures for:
   - zero-card patch;
   - zero-card patch plus mapping;
   - zero-card patch plus keystone draft;
   - normal card-diff patch regression;
   - empty log negative;
   - invalid-only log diagnostic behavior.
10. Add AX runtime fixture coverage for:
    - zero-card patch with matching `answer_recorded` and
      `section_confirmed`;
    - stale `section_confirmed` from another run is ignored;
    - existing card-diff section confirmation behavior remains intact;
    - absent or empty patch log returns the existing empty/base catalog shape.
11. Add PMS viewer component tests for:
    - zero-card ruling entry renders;
    - confirmation-only section renders;
    - map delta renders every disposition with basis;
    - keystone draft renders as proposed index card;
    - card-diff regression remains visible;
    - empty state remains for no walk data;
    - raw schema names are absent from ruling-entry markup.
12. Mirror schema/component/test changes into `packages/viewer` if the shipped
    Alexandria Drafts copy is present and would otherwise diverge.
13. Run the deterministic verification commands and record any environment
    limitations.

## Acceptance / Exit Criteria

1. A valid patch with `cardUpdates: []` renders a Drafts ruling entry with
   agenda item, resolved status, and a director-prose excerpt.
2. The frame-ruling specimen shape represented by
   `patch-frame-search-space` no longer produces a blank Drafts panel when a
   fixture supplies the matching patch log and answer event.
3. A `section_confirmed` event for the same walk renders its section header and
   summary even when no card-touching patch exists.
4. A fixture `containerMapping` renders every mapping item with disposition and
   `basis`.
5. A fixture `keystoneDraft` renders as the proposed index card.
6. Existing card-diff rendering remains visible and unchanged for drafted
   cards with `draftTrail`.
7. A bundle with no walk data, absent draft log, or empty draft log renders the
   existing empty state and no false ruling panel.
8. Invalid patch entries remain diagnostics only and do not create ruling
   entries.
9. New ruling-entry UI does not expose raw schema/validation labels such as
   `containerMapping`, `keystoneDraft`, or `cardUpdates`.
10. AX, PMS viewer, and any touched shipped viewer tests/builds listed in
    deterministic verification pass, or any skipped command is explicitly
    justified in the implementation handoff.

## Deferred Follow-Ups

1. S1: produce and validate `containerMapping`, then mechanically fan out
   mapping effects to card-context draft updates.
2. S2: re-project agenda items and auto-resolve demoted items through existing
   residual machinery.
3. S3: generate and approve the proposed keystone draft, then later bank it
   through the deliberate draft-to-base path.
4. S5: add ruling-aware agenda triage with machine-attributed settlements and
   reopen behavior.
5. Future cleanup: consider extracting the duplicated Drafts viewer components
   after PMS and shipped Alexandria Drafts have converged behaviorally.
