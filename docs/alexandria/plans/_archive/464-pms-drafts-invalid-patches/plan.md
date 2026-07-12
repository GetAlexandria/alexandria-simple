# PMS-Drafts Invalid Patch Tolerance Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#464`
- Parent story: `#446` PMS-Drafts overlay
- Blocking dependency: `#460` PMS-Drafts overlay must be present on the target
  branch before implementation starts.
- Sibling follow-up noted in issue comments: `#465` typed-links coverage is a
  separate `tier:could` slice and is not part of this plan.
- Run ID: `01KWAJDCWSRAWRJX9JQKRG8BZG`
- Plan path:
  `docs/alexandria/plans/464-pms-drafts-invalid-patches/plan.md`
- Related plan:
  `docs/alexandria/plans/446-pms-drafts/plan.md`

## Goal

Make the read-only `/library/pms-drafts` overlay tolerate malformed individual
patch entries in a valid patch-log array. The loader should apply every valid
patch in log order, skip invalid entries, and expose those invalid entries in
`draftOverlay.invalidPatches`. Only log-level structural failures should still
fail the catalog load and make `/api/library/catalog` return `400`.

This keeps the director-facing Drafts tab useful when one generated or
hand-authored patch is bad, while preserving hard failure for an unusable patch
log file.

## Scope

- Change the read-only Drafts overlay load path in `packages/ax`.
- Keep the mutation path for `applyFrontOfHousePatch` hard-fail-on-invalid.
- Add `draftOverlay.invalidPatches` to AX catalog types and Viewer runtime
  schemas.
- Render an "Invalid patches" summary block in the Viewer only when invalid
  patches are present.
- Preserve missing-card behavior as `draftOverlay.unresolvedUpdates`.
- Preserve path-safety checks for `draftPatchLog` and `libraryRoot`.
- Fold in the co-located path containment cleanup by reusing
  `isPathInsideRoot(root, path)` from `packages/ax/src/domain/paths.ts`.
- Cover the named issue acceptance matrix in AX domain tests, runtime-server API
  tests, and Viewer unit/e2e coverage.

## Non-Goals

- Do not touch `front-of-house-walk`.
- Do not change plugin skills, plugin workflows, or product agent behavior.
- Do not change the bundle applier semantics in `applyFrontOfHousePatch`; it
  must continue rejecting malformed mutation input.
- Do not add confirm, edit, retry, or approval affordances to PMS-Drafts.
- Do not write under `studio/sweeps/playmaker-studio/`.
- Do not implement the sibling typed-links coverage issue `#465`.
- Do not write to `docs/alexandria/library/`.

## Linked Product-Plan Summary

The parent PMS-Drafts plan creates a read-only overlay:

- Back catalog root:
  `studio/sweeps/playmaker-studio`
- Draft patch log:
  `studio/drafts/playmaker-studio/patches.json`
- Runtime request shape:
  `GET /api/library/catalog?libraryRoot=...&draftPatchLog=...`
- Overlay behavior: project valid Front-of-House patches over Back markdown in
  memory, then build the catalog from the projected files.
- Missing-card references are already non-fatal and appear in
  `draftOverlay.unresolvedUpdates`.

Issue `#464` narrows one follow-up gap: malformed patch entries currently abort
the entire Drafts catalog load, even though missing-card updates already degrade
gracefully.

## Current Implementation Gap

Current relevant shape on the `#460` overlay path:

- `packages/ax/src/domain/library-front-of-house.ts`
  - `parsePatchObject` validates one `FrontOfHousePatch`.
  - `parseFrontOfHousePatch` returns one patch or `Error`.
  - `parseFrontOfHousePatchLog` parses JSON, requires a top-level array, then
    validates every entry.
  - If any entry fails validation, it returns a single `Error` containing all
    entry errors.
- `packages/ax/src/domain/library-draft-overlay.ts`
  - `applyLibraryDraftOverlay` treats any `parseFrontOfHousePatchLog` error as
    fatal: `Invalid draft patch log ...`.
  - Missing card paths are already skipped into `unresolvedUpdates`.
  - It has a local `pathInsideRoot` helper.
- `packages/ax/src/effects/library-graph-loader.ts`
  - validates `libraryRoot` and `draftPatchLog` containment inline.
  - has a local `isPathContainedBy` helper.
  - maps draft patch-log errors to runtime API `400` through
    `libraryGateHttpStatus`.
- `packages/ax/src/domain/library-catalog.ts`
  - `LibraryCatalogDraftOverlay` has `appliedPatchCount`,
    `appliedUpdateCount`, `patchLogPath`, and `unresolvedUpdates`.
  - There is no invalid patch response type.
- `packages/viewer/src/app/runtime/schemas.ts`
  - decodes unresolved updates but not invalid patches.
- `packages/viewer/src/components/library/EmptyLibraryView.tsx`
  - `DraftOverlaySummary` renders unresolved updates but not invalid patches.

The smallest fix is to change the patch-log parser contract from
all-or-nothing to "structural error or partial parse result" and thread the
invalid entries through the existing overlay summary.

## Architectural Boundaries

- The resilience belongs in the AX domain overlay path, not in React.
- The parser should distinguish:
  - structural log errors: invalid JSON or top-level value is not an array;
  - patch-level validation errors: one array entry fails `FrontOfHousePatch`
    validation.
- Valid patches must keep applying in original log order after invalid entries
  are dropped.
- Invalid entries must not create `draftTrail`, must not count toward
  `appliedPatchCount`, and must not count toward `appliedUpdateCount`.
- `unresolvedUpdates` remains only for valid patches whose card update cannot be
  resolved or applied to an existing Back card.
- `invalidPatches` is part of `draftOverlay` only when `draftOverlay` exists.
  Back catalogs and missing/empty patch-log cases should continue omitting the
  entire `draftOverlay` object.
- Viewer schemas should remain narrow browser-facing decoders; AX remains the
  canonical response contract owner.
- Path containment should use `isPathInsideRoot(root, path)` instead of local
  implementations, without relaxing path-safety behavior.

## Response Contract

Extend the catalog overlay shape:

```ts
interface LibraryCatalogDraftInvalidPatch {
  patchIndex: number;
  reason: string;
}

interface LibraryCatalogDraftOverlay {
  appliedPatchCount: number;
  appliedUpdateCount: number;
  invalidPatches: LibraryCatalogDraftInvalidPatch[];
  patchLogPath: string;
  unresolvedUpdates: LibraryCatalogDraftUnresolvedUpdate[];
}
```

Rules:

- `patchIndex` is the zero-based position in the patch-log array.
- `reason` carries the existing single-patch validation message without adding a
  `patches[index]:` prefix.
- `invalidPatches` is present, possibly empty, whenever `draftOverlay` is
  present.
- `draftOverlay` remains absent for PMS-Back and for missing or empty Drafts
  logs.
- A valid JSON array whose every entry is invalid returns `200`, with the Back
  catalog unmodified, `appliedPatchCount: 0`, `appliedUpdateCount: 0`, and every
  bad entry listed in `invalidPatches`.
- Invalid JSON and top-level non-array values still fail the loader and return
  `400` from `/api/library/catalog`.

## Parser Contract

Change only the patch-log parser used by the Drafts overlay. Keep
`parseFrontOfHousePatch` and the mutation applier behavior unchanged.

Suggested type:

```ts
export interface FrontOfHousePatchLogInvalidPatch {
  patchIndex: number;
  reason: string;
}

export interface FrontOfHousePatchLogParseResult {
  invalidPatches: FrontOfHousePatchLogInvalidPatch[];
  patches: FrontOfHousePatch[];
}

export function parseFrontOfHousePatchLog(
  content: string,
): FrontOfHousePatchLogParseResult | Error
```

Implementation detail:

- JSON parse failure returns `Error`.
- Parsed non-array returns `Error("Front-of-house patch log must be a JSON array.")`.
- Each array entry is validated with the existing single-entry logic.
- A valid entry is appended to `patches`.
- An invalid entry is appended to `invalidPatches` as
  `{ patchIndex: index, reason: patch.message }`.
- The parser does not decide whether to omit `draftOverlay`; that remains the
  overlay helper's job.

## File And Subsystem Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Plan artifact | `docs/alexandria/plans/464-pms-drafts-invalid-patches/plan.md` | Defines the narrow implementation slice |
| AX FoH parser | `packages/ax/src/domain/library-front-of-house.ts` | `parseFrontOfHousePatchLog` returns valid patches plus indexed invalid entries; structural errors remain `Error` |
| AX Drafts overlay | `packages/ax/src/domain/library-draft-overlay.ts` | Applies valid patches only, exposes `invalidPatches`, and uses shared path containment helper |
| AX catalog types | `packages/ax/src/domain/library-catalog.ts` | Adds `LibraryCatalogDraftInvalidPatch` and `invalidPatches` on `LibraryCatalogDraftOverlay` |
| AX catalog loader | `packages/ax/src/effects/library-graph-loader.ts` | Uses `isPathInsideRoot` for project-root and not-under-`libraryRoot` validation |
| AX runtime API | `packages/ax/src/effects/runtime-server.ts` | Keeps structural patch-log failures mapped to `400`; no special status for per-entry invalid patches because they return `200` |
| Viewer runtime schema | `packages/viewer/src/app/runtime/schemas.ts` | Decodes `draftOverlay.invalidPatches` |
| Viewer summary | `packages/viewer/src/components/library/EmptyLibraryView.tsx` | Renders invalid patch summary block when non-empty |
| Viewer/e2e fixtures | `packages/viewer/tests/serve-viewer-fixture.ts` and related browser tests | Provide invalid patch summary data for render coverage |
| Tests | AX domain/runtime tests and Viewer unit/e2e tests | Covers the required degradation and structural failure matrix |

## Changed Behavior Surfaces

| Surface | Behavior shift | Downstream updates |
| --- | --- | --- |
| AX Drafts overlay domain | A single malformed patch entry no longer fails the overlay projection | Domain tests for mixed, all-invalid, missing-card distinction, and purity |
| AX runtime catalog API | Valid patch-log arrays with invalid entries return `200`; invalid JSON/non-array still return `400` | Runtime-server API tests for status and response shape |
| Viewer runtime client/schema | Catalog responses may include `draftOverlay.invalidPatches` | Schema decode tests |
| Viewer library summary | Shows invalid patch diagnostics beside unresolved updates, with no mutation controls | Component and browser tests |
| Product skills and agents | No behavior change | No skill docs or eval baselines required |
| Plugin workflows | No behavior change | `front-of-house-walk` remains untouched |
| Public CLI commands | No behavior change | No CLI black-box exit-code tests required for this slice |

## Deterministic Test Matrix

Cover the issue's named cases:

1. **Mixed valid plus invalid log.**
   - A valid JSON array with one valid patch and one invalid patch containing
     `set.altitude`.
   - Expected: `200`, valid patch applies, `invalidPatches` includes
     `{ patchIndex: 1, reason: "cardUpdates[0].set.altitude is not allowed." }`.
2. **Other patch-level validation errors.**
   - Missing `patchId`, wrong `schemaVersion`, and bad `relationships` key each
     land in `invalidPatches`.
   - Expected: no failed catalog load.
3. **All-invalid log.**
   - Every array entry is invalid.
   - Expected: `200`, unmodified Back catalog, zero applied counts, all entries
     listed in `invalidPatches`.
4. **Not-an-array structural failure.**
   - JSON object or other non-array top-level value.
   - Expected: loader failure and runtime API `400`.
5. **Not-JSON structural failure.**
   - Malformed JSON content.
   - Expected: loader failure and runtime API `400`.
6. **Missing-card versus invalid-patch distinction.**
   - A valid patch targeting a nonexistent card remains in `unresolvedUpdates`.
   - Expected: it does not appear in `invalidPatches`.
7. **Path-safety rejections.**
   - `draftPatchLog` outside project root returns `400`.
   - `draftPatchLog` under resolved `libraryRoot` returns `400`.
   - Shared `isPathInsideRoot` cleanup must not loosen either case.
8. **Sweep byte-purity.**
   - Hash or byte-compare `studio/sweeps/playmaker-studio/` before and after a
     Drafts catalog load.
   - Expected: byte-identical.
9. **Back unaffected and empty/missing logs.**
   - PMS-Back and missing/empty Drafts logs carry no `draftOverlay` and no
     `invalidPatches` key.
10. **Viewer summary render.**
    - Non-empty `invalidPatches` renders a block with
      `data-testid="draft-overlay-invalid"`.
    - Empty or omitted `invalidPatches` renders no invalid block.
    - No confirm/edit affordances appear.

## Suggested Test Files And Commands

Add or extend:

- `packages/ax/tests/library-front-of-house.test.ts`
  - parser contract: mixed valid/invalid, all invalid, not JSON, not array,
    missing `patchId`, wrong `schemaVersion`, bad relationship key.
- `packages/ax/src/domain/library-draft-overlay.test.ts`
  - overlay response shape, missing-card distinction, all-invalid unmodified
    catalog, applied counts, sweep byte-purity, Back unaffected.
- `packages/ax/tests/runtime-server.test.ts`
  - `/api/library/catalog` statuses: mixed valid/invalid `200`, all-invalid
    `200`, not-JSON `400`, not-array `400`, path-safety `400`.
- `packages/viewer/src/app/runtime/client.test.ts`
  - schema decodes `invalidPatches`.
- `packages/viewer/src/components/library/EmptyLibraryView.test.tsx`
  - invalid summary block appears only when non-empty and has no confirm/edit
    affordances.
- `packages/viewer/tests/serve-viewer-fixture.ts`
  - add fixture response with invalid patches for e2e.
- `packages/viewer/tests/library-browser.spec.ts`
  - browser assertion for `draft-overlay-invalid` on PMS-Drafts and absence when
    the array is empty or omitted.

Targeted validation commands:

```bash
bun test packages/ax/tests/library-front-of-house.test.ts packages/ax/src/domain/library-draft-overlay.test.ts packages/ax/tests/runtime-server.test.ts
pnpm --filter @alexandria/viewer run test
pnpm --filter @alexandria/viewer run test:e2e
pnpm --filter @alexandria/viewer run check
pnpm --filter @alexandria/viewer run build
pnpm --filter @alexandria/ax run typecheck
pnpm run format:check
```

Broader validation before merge:

```bash
pnpm run check
bun test
```

## Eval Impact

No eval-harness rerun is required for this slice.

Reasoning:

- No product agent behavior changes.
- No product skill files change.
- `front-of-house-walk` does not change.
- Plugin workflows do not change.
- Public CLI commands and exit-code behavior do not change.
- The behavior is deterministic AX catalog projection and Viewer rendering,
  covered by unit, runtime API, build, and browser validation.

If a later slice changes `front-of-house-walk` to generate these patch logs, that
slice must revisit Raven or Front-of-House eval coverage.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Structural patch-log errors accidentally start returning `200` | Keep JSON parse and top-level array validation as the only `Error` return path from `parseFrontOfHousePatchLog`; add runtime-server `400` tests for not-JSON and not-array logs |
| Per-entry validation reasons drift from existing parser messages | Reuse `parsePatchObject` and store `patch.message` verbatim, without adding a `patches[index]:` prefix |
| Invalid patches affect applied counts or trails | Build `appliedPatchCount`, `appliedUpdateCount`, and `draftTrail` only from successfully applied valid patches; assert all-invalid zero counts |
| Missing-card updates get misclassified as invalid patches | Validate patch entries before resolution; only valid patches can produce `unresolvedUpdates`; cover both in one test |
| `invalidPatches: []` leaks into Back or missing/empty log responses | Continue returning `null` projection for empty logs and skipping overlay construction for missing logs; assert `draftOverlay` is absent |
| Path helper cleanup loosens containment on Windows-style or sibling paths | Replace local helpers with `isPathInsideRoot` at the named call sites and keep path-safety runtime tests |
| Viewer renders diagnostics as an actionable workflow | Render text-only diagnostics in the existing summary area, with no confirm/edit controls; component test asserts absence of confirm gate |
| The overlay writes to the Back sweep while handling invalid entries | Keep projection over in-memory `LibraryMarkdownFile` copies and retain sweep byte-hash regression coverage |

## Implementation Steps

1. Confirm the target branch includes the `#460` PMS-Drafts overlay files and
   tests. If `parseFrontOfHousePatchLog` or `/library/pms-drafts` is absent,
   stop and rebase/merge `#460` first.
2. Add parser result types in
   `packages/ax/src/domain/library-front-of-house.ts`.
3. Change `parseFrontOfHousePatchLog` to return valid patches plus
   `invalidPatches`, while keeping JSON parse and non-array errors fatal.
4. Add or update Front-of-House parser tests for mixed valid/invalid entries,
   all-invalid entries, missing `patchId`, wrong `schemaVersion`, bad
   relationship keys, not JSON, and not array.
5. Add `LibraryCatalogDraftInvalidPatch` and
   `LibraryCatalogDraftOverlay.invalidPatches` in
   `packages/ax/src/domain/library-catalog.ts`.
6. Update `applyLibraryDraftOverlay` to consume the new parser result, apply only
   valid patches, and include `invalidPatches` in `draftOverlay`.
7. Ensure a non-empty log with zero valid patches still returns a projection with
   unchanged files, zero applied counts, and collected invalid entries.
8. Replace the local overlay `pathInsideRoot` helper with
   `isPathInsideRoot`.
9. Replace `library-graph-loader.ts` project-root containment checks and
   `isPathContainedBy` usage with `isPathInsideRoot`, preserving current error
   messages where tests assert them.
10. Extend AX overlay and runtime-server tests for the full issue matrix,
    including path-safety and sweep byte-purity.
11. Extend Viewer runtime schemas and schema tests for `invalidPatches`.
12. Update `DraftOverlaySummary` to render an invalid patch block with
    `data-testid="draft-overlay-invalid"` only when the array is non-empty.
13. Extend Viewer component and e2e fixtures/tests for the invalid block and
    absence states.
14. Run the targeted validation commands, then broader checks as time allows.
15. Review the final diff to verify no implementation changes touched
    `packages/alexandria-plugin`, `front-of-house-walk`, or
    `studio/sweeps/playmaker-studio/`.

## Acceptance And Exit Criteria

- A valid JSON array with one valid patch and one disallowed `set.altitude`
  patch returns `200`, applies the valid patch, and lists the invalid entry by
  `patchIndex` with the existing `... is not allowed.` reason.
- A patch missing `patchId`, a patch with wrong `schemaVersion`, and a patch
  with a bad relationship key land in `invalidPatches` instead of failing the
  load.
- Not-JSON and top-level not-array patch logs still fail the catalog load and
  return `400` from `/api/library/catalog`.
- A log where every patch is invalid returns `200`, keeps the Back catalog
  unmodified, reports zero applied counts, and surfaces every invalid entry.
- A valid patch targeting a nonexistent card still appears in
  `unresolvedUpdates`, not `invalidPatches`.
- `draftPatchLog` outside the project root and `draftPatchLog` under
  `libraryRoot` still return `400`.
- Loading the same log twice yields the same catalog.
- `studio/sweeps/playmaker-studio/` is byte-identical before and after Drafts
  loads.
- PMS-Back and missing/empty Drafts logs have no `draftOverlay` and no
  `invalidPatches` key.
- The Viewer renders an "Invalid patches" summary block with
  `draft-overlay-invalid` when invalid patches are non-empty.
- The invalid block is absent when `invalidPatches` is empty or omitted.
- Viewer invalid-patch diagnostics provide no confirm/edit affordances.
- AX domain tests, runtime-server API tests, Viewer unit tests, Viewer e2e
  tests, Viewer build/check, AX typecheck, and format check pass or any
  skipped command is explicitly recorded with the blocker.

## Deferred Follow-Ups

- `#465` typed-links coverage for the PMS-Drafts overlay.
- A later Studio-ladder slice that makes `front-of-house-walk` generate the
  patch log consumed by this overlay.
- PMS-Final director approval and mutation flow from parent story `#447`.
- Any richer director tooling for filtering, copying, or exporting invalid
  patches after the basic diagnostic block is proven useful.
