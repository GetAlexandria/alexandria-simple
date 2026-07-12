# Issue 505: Ledger-Derived `threads.json` Lifecycle

## Header

- Issue: GitHub #505, "Treat threads.json as Ledger-derived/operational state, not a hash-only carve-out"
- Goal: make Front-of-House thread lifecycle state derive from Ledger events, stop mutating reviewed `threads.json` for lifecycle bookkeeping, and restore confirmation dirty detection for reviewed thread content.
- Linked product plan: none separate from the issue body. The issue's "Proposed contract" is the product contract for this technical slice.

## Scope

This slice lands in `packages/ax`:

1. Remove the root `threads.json` hash-only confirmation carve-out from `packages/ax/src/domain/library-confirmation.ts`.
2. Keep only `isOperationalEmptyLibraryBundlePath` as the confirmation hash exclusion mechanism for runtime state and operational report markdown.
3. Derive Front-of-House item lifecycle from `library.front_of_house.answer_recorded`, `library.front_of_house.bundle_patch_applied`, and `library.front_of_house.residual_gap_recorded` events instead of relying on `thread.status` written back into `threads.json`.
4. Stop resolve/residual paths from writing lifecycle status and `resolvingEventId` back into `threads.json`.
5. Keep observable stderr diagnostics for malformed `threads.json` and missing agenda-thread cases on retained lifecycle validation/skip paths, while keeping genuinely missing `threads.json` warning-free.
6. Update deterministic domain and black-box CLI tests for hash behavior, lifecycle derivation, warning behavior, operational exclusions, and idempotency.

## Non-Goals

1. Do not change `library-threads.v1` schema or require Back-of-House to emit a different thread shape.
2. Do not introduce a new operational lifecycle projection file under `runtime/`; the current need is read-time derivation from Ledger events.
3. Do not add another per-file or field-level confirmation hash allowlist.
4. Do not change EL5 `section_confirmed` behavior, atomization planning, or the Issue A1/A2 surfaces.
5. Do not edit `packages/alexandria-plugin` skills or workflows unless implementation discovers a real shipped guidance mismatch. Current workflow text already describes Ledger-derived skips.
6. Do not write to `docs/alexandria/library`.

## Current Gap

`packages/ax/src/domain/library-confirmation.ts` currently defines `EMPTY_LIBRARY_CONFIRMATION_HASH_ONLY_EXCLUDED_PATHS = ["threads.json"]` and `shouldHashFile` excludes that file in addition to operational paths. This prevents lifecycle churn from dirtying an approved bundle, but it also hides director edits to reviewed thread fields such as `reason`, `concerns`, `cardId`, `context`, and `plane`.

`packages/ax/src/commands/front-of-house.ts` currently has `writeThreadLifecycleBack`, called from the `apply-patch` resolved and unresolved branches. It mutates `threads.json` by setting `status` and `resolvingEventId`. Its malformed-file and missing-thread validity gates return `{ changed: false }` without a warning. Only read/write exceptions surface diagnostics.

Front-of-House already has most lifecycle information in the Ledger:

- `library.front_of_house.answer_recorded` records a director answer for an agenda item.
- `library.front_of_house.bundle_patch_applied` records the applied resolved patch and carries `answerEventId`, which can be joined back to the answer event's `agendaItemId`.
- `library.front_of_house.residual_gap_recorded` records a residual item.

The command path is only partially derived today. `stage-next` skips `answer_recorded` and `residual_gap_recorded` events, but `prepare-agenda` still projects only threads whose on-disk `thread.status === "open"`, so stale `threads.json` lifecycle status can hide or re-present items depending on which path reads it.

## Architectural Boundaries

1. Confirmation hashing belongs in `packages/ax/src/domain/library-confirmation.ts`; it should exclude operational state by kind through `isOperationalEmptyLibraryBundlePath`, not by a reviewed filename.
2. Front-of-House lifecycle derivation belongs in `packages/ax/src/domain/library-front-of-house.ts` as pure event projection helpers, with command code in `packages/ax/src/commands/front-of-house.ts` responsible for loading events and emitting stderr diagnostics.
3. `threads.json` remains reviewed bundle input. The walk may read it to build agenda content and to diagnose malformed/missing-thread cases, but resolve/residual paths must not write mirrored lifecycle state into it.
4. Runtime walk files under `runtime/` and operational report markdown remain operational and excluded from the confirmation hash exactly as today.
5. CLI command data stays on stdout; warnings and diagnostics stay on stderr; successful lifecycle warnings keep exit code `0` and JSON stdout stable.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Confirmation hash domain | `packages/ax/src/domain/library-confirmation.ts` | Remove `EMPTY_LIBRARY_CONFIRMATION_HASH_ONLY_EXCLUDED_PATHS` and `isEmptyLibraryConfirmationHashExcludedPath`; hash root `threads.json` like other reviewed files; keep operational exclusions unchanged. |
| Front-of-House lifecycle domain | `packages/ax/src/domain/library-front-of-house.ts` | Add or refine a pure lifecycle projection helper that derives answered/residual item ids from Ledger events, including `bundle_patch_applied` via `answerEventId` to `answer_recorded`. Use deterministic replay order for effective status. |
| Front-of-House CLI command | `packages/ax/src/commands/front-of-house.ts` | Load Ledger events for lifecycle reads where needed, pass derived lifecycle into agenda/stage/finalize decisions, remove lifecycle write-back mutation, and replace retained write/skip logic with non-mutating stderr diagnostics for malformed or missing-thread `threads.json`. |
| Confirmation domain tests | `packages/ax/tests/library-confirmation.test.ts` | Replace the old "ignore `threads.json` lifecycle churn" assertion with reviewed-field dirty coverage and operational-path exclusion regression coverage. |
| Confirmation CLI tests | `packages/ax/tests/library-confirmation-cli.test.ts` | Add/adjust black-box coverage showing reviewed `threads.json` edits produce `dirty: true`, `readyToConfirm: false`, and `status: "not_ready"`, while lifecycle-only Ledger events leave an approved bundle clean. |
| Front-of-House domain tests | `packages/ax/tests/library-front-of-house.test.ts` | Cover lifecycle projection from answer, bundle-patch, and residual events, stale disk status override rules, replay determinism, and idempotent duplicate events. |
| Front-of-House black-box CLI tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Update old write-back assertions to prove `threads.json` is unchanged; add malformed-thread warning, missing-thread warning, missing-file silent no-op, derived lifecycle versus stale disk, and idempotent re-resolve coverage. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `ax internal library-confirm ...` | Reviewed thread content participates in dirty detection again. JSON status fields remain the same, but `threads.json` edits now produce `not_ready`. | Update `packages/ax` tests. No plugin guidance change unless implementation finds a shipped prompt promising lifecycle write-back. |
| `ax internal front-of-house prepare-agenda` / `stage-next` / `finalize` | Lifecycle reads are Ledger-derived. Stale on-disk `thread.status` no longer decides whether the current walk treats an item as answered or residual. | Update `packages/ax` tests. Existing front-of-house workflow text already says skips are based on Ledger events. |
| `ax internal front-of-house apply-patch` / `record-residual` | Successful resolve/residual no longer rewrites `threads.json`; malformed or missing-thread validation cases warn on stderr without failing the already-recorded Ledger event. | Update black-box CLI tests for stdout/stderr/exit code. |
| Shipped `front-of-house-walk` skill/workflow | No intended file change. The workflow already calls AX commands and describes answer/residual state as Ledger-driven. | No plugin validation required unless plugin files are touched during implementation. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Confirmation domain | `cd packages/ax && bun test tests/library-confirmation.test.ts` | Proves `threads.json` is hashed and operational paths remain excluded. |
| Confirmation CLI | `cd packages/ax && bun test tests/library-confirmation-cli.test.ts` | Proves dirty/not-ready JSON fields, approved clean lifecycle-only events, exit codes, and stderr behavior. |
| Front-of-House domain | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Proves pure lifecycle derivation, replay determinism, and stale status handling. |
| Front-of-House CLI flow | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Proves no `threads.json` mutation, warning diagnostics, missing-file negative, stage-next/finalize lifecycle behavior, and idempotency. |
| Event schema regression | `cd packages/ax && bun test tests/events.test.ts` | Ensures the existing lifecycle event schemas still expose the fields the derivation helper relies on. |
| Package typecheck | `cd packages/ax && pnpm run typecheck` | Catches signature drift in Effect command code and domain helper exports. |
| Package lint/format | `cd packages/ax && pnpm run lint && pnpm run format:check` | Keeps the changed TypeScript within package standards. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| AX deterministic CLI/domain behavior | Bun tests cover the affected behavior directly. | Add/update Bun tests in this slice; no eval-harness run required for AX-only deterministic code. | Commands listed in Deterministic Verification. |
| Shipped `front-of-house-walk` skill/workflow | Existing eval cases exist under `packages/ax/tests/eval-cases/front-of-house-walk`, but this slice does not edit the skill/workflow prompts. | No eval rerun required unless implementation touches `packages/alexandria-plugin/skills/front-of-house-walk` or workflow files. | If plugin files are touched, run the relevant front-of-house eval case(s) listed by `pnpm eval -- list`. |
| Maintainer planning skill | Used only to create this plan. | No eval-harness coverage required for contributor workflow use. | None. |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| `prepare-agenda` keeps honoring stale `thread.status`, so old write-back state still hides items. | Pass a Ledger-derived lifecycle projection into agenda construction and add a black-box test with stale disk statuses that disagree with events. |
| Removing the hash carve-out makes normal resolve/residual walks dirty because some write path still mutates `threads.json`. | Delete or retire `writeThreadLifecycleBack`, assert `threads.json` bytes are unchanged after resolved and residual paths, and verify confirmation status remains approved after lifecycle-only Ledger events. |
| `bundle_patch_applied` cannot directly identify an agenda item because its payload currently carries `answerEventId`, not `agendaItemId`. | Join `bundle_patch_applied.payload.answerEventId` to a same-run `answer_recorded` event and document/test that projection. Do not change the event schema in this slice unless implementation finds no reliable join. |
| Warning diagnostics become noisy on idempotent retries. | Emit malformed/missing-thread lifecycle diagnostics only when a lifecycle event is newly appended, not when append returns `already_appended`; add an idempotent re-resolve test. |
| Missing `threads.json` starts warning in legitimate empty/missing-thread setup paths. | Treat `isMissingFileError` as an expected no-op with empty stderr and add a negative black-box test. |
| Operational report/runtime exclusions regress while removing the special allowlist. | Keep `isOperationalEmptyLibraryBundlePath` unchanged and add/retain tests proving `runtime/`, `HOT-SPOTS.md`, `READ-COHERENCE.md`, `RESIDUAL-GAPS.md`, and `STAGE-2-BRIEF.md` do not affect the hash. |
| A field-level normalization approach accidentally drops reviewed thread content from the hash again. | Do not normalize `threads.json` for hashing in this slice; hash the file as content unless it qualifies through the operational-path rule. |

## Implementation Steps

1. In `library-confirmation.ts`, remove `EMPTY_LIBRARY_CONFIRMATION_HASH_ONLY_EXCLUDED_PATHS` and `isEmptyLibraryConfirmationHashExcludedPath`, and simplify `shouldHashFile` to exclude only operational paths and dot-paths.
2. Update confirmation domain tests:
   - change the old lifecycle-churn hash test into a reviewed-field edit test that mutates `reason` and at least one concern field and expects the hash to change;
   - keep `threads.json is not an operational empty-library path`;
   - add/retain operational exclusion checks for `runtime/` and the named report markdown.
3. Add a pure lifecycle projection in `library-front-of-house.ts`, for example `deriveFrontOfHouseLifecycle(events, playRunId)`, that returns answered ids, residual ids, and an effective status map:
   - `answer_recorded` with matching `playRunId` and non-empty `agendaItemId` marks the item answered;
   - `bundle_patch_applied` with matching `playRunId` marks the item answered by resolving `answerEventId` through the matching answer event;
   - `residual_gap_recorded` with matching `playRunId` and non-empty `agendaItemId` marks the item residual;
   - replay order is deterministic, with later lifecycle events winning the effective status while all non-open statuses count as resolved for skip purposes.
4. Refactor existing helpers such as `answeredAgendaItemIds`, `residualAgendaItemIds`, and `unresolvedFrontOfHouseGaps` to share the projection where that reduces drift, while preserving existing exports needed by callers.
5. Update `buildFrontOfHouseAgenda` to accept a derived lifecycle input, or pre-filter/normalize threads in `runPrepareAgenda`, so the CLI agenda ignores stale on-disk lifecycle status and excludes only Ledger-resolved items for the requested `playRunId`.
6. Update `runPrepareAgenda` to load project storage events and pass derived lifecycle into agenda construction. Missing `threads.json` continues to produce an empty agenda; malformed `threads.json` remains exit code `2`.
7. Update `runStageNext` and `runFinalize` to use the same lifecycle projection helper instead of ad hoc answered/residual set construction.
8. Replace `writeThreadLifecycleBack` in `front-of-house.ts` with a non-mutating diagnostic helper, for example `diagnoseThreadLifecycleSurface`, that:
   - reads `threads.json` best-effort;
   - returns no warning for a genuinely missing file;
   - returns no warning for the current accepted empty-file behavior unless implementation deliberately classifies blank as malformed;
   - warns when `parseLibraryCatalogThreads` reports metadata issues;
   - warns when parsing succeeds but no thread id matches the agenda item;
   - never writes `threads.json`.
9. Call the diagnostic helper after successful newly-appended lifecycle events in resolved apply-patch, unresolved apply-patch, and direct `record-residual` if that command remains a lifecycle recording path. Attach any warning to stderr while preserving JSON stdout and exit code `0`.
10. Update `library-front-of-house-bundle.test.ts`:
    - change resolved and residual apply-patch assertions from "thread status changed" to "`threads.json` bytes unchanged";
    - assert missing agenda thread produces stderr warning and no write;
    - add malformed `threads.json` warning coverage by preparing with valid threads, corrupting the file, then resolving/residualing;
    - add missing-file silent no-op coverage;
    - add stale-disk versus Ledger-derived lifecycle coverage for prepare/stage-next;
    - add idempotent re-resolve coverage with no duplicate warning.
11. Update `library-confirmation-cli.test.ts`:
    - after confirmation, edit a reviewed thread field and expect `dirty: true`, `readyToConfirm: false`, `approved: false`, and `status: "not_ready"`;
    - after confirmation, append/record lifecycle-only Ledger events without changing reviewed content and expect the bundle to remain approved;
    - keep operational-file change regression coverage approved.
12. Run the deterministic verification commands listed above and fix any regressions within the scoped files.

## Acceptance / Exit Criteria

1. Editing reviewed `threads.json` fields such as `reason`, `concerns[].cardId`, `concerns[].context`, `concerns[].plane`, or `sourceEvidence` changes the confirmation hash and makes `ax internal library-confirm status --json` report `dirty: true`, `readyToConfirm: false`, and `status: "not_ready"` for a previously approved bundle.
2. Resolve/residual lifecycle events that do not change reviewed bundle content do not dirty an approved bundle.
3. Resolve/residual command paths leave `threads.json` byte-for-byte unchanged.
4. `EMPTY_LIBRARY_CONFIRMATION_HASH_ONLY_EXCLUDED_PATHS` and its helper are gone; there is no replacement per-file allowlist for `threads.json`.
5. Operational files under `runtime/` and the named report markdown remain excluded from the hash exactly as before.
6. The walk's "already answered/residual" checks derive from Ledger events and agree with those events even when on-disk `thread.status` is stale or contradictory.
7. Malformed `threads.json` and missing agenda-thread cases on retained lifecycle diagnostic paths emit stderr warnings without failing an already-successful lifecycle event.
8. A genuinely missing `threads.json` on the lifecycle diagnostic path remains warning-free.
9. Re-running a resolve/residual for an already-recorded item does not rewrite reviewed content, does not flip the confirmation dirty state, and does not emit duplicate warning churn.
10. The package tests, typecheck, lint, and format checks listed in Deterministic Verification pass.

## Deferred Follow-Ups

1. If a future UI or operator workflow needs a materialized lifecycle projection, add it under `runtime/` as operational state and keep it covered by `isOperationalEmptyLibraryBundlePath`.
2. Consider adding `agendaItemId` directly to future `library.front_of_house.bundle_patch_applied` payloads only as a separate event-schema migration; this slice should use the existing `answerEventId` join.
3. Audit any downstream viewer surfaces that display thread lifecycle from `threads.json`; if found, migrate them to Ledger-derived state in a separate Viewer-scoped plan.
