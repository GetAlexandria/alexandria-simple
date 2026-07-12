# Technical Plan: Issue 411 Play Tracker Runtime Error Copy

- Issue reference: `#411` — `[viewer] Play Tracker shows a human error message, never "[object Object]"`
- Goal: make the Viewer Studio Play Tracker render human-readable runtime failure copy for active-run and run-events fetch failures, using the existing typed-error-aware library helper instead of `String(cause)`
- Linked product plan: `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md` L1, plus the issue's Phase-2 walk request for the Play Tracker error-copy sweep

## Scope

- Extend `packages/viewer/src/components/library/runtime-error-copy.ts` so it also covers the Studio tracker surfaces `studio-runs` and `run-events`
- Preserve the four existing Library helper call sites and their current copy for `card-detail`, `catalog`, `graph`, and `ledger`
- Route both Play Tracker runtime fetch failures through the helper:
  active-runs polling in `useActiveRuns` and specific run-events loading in `loadRun`
- Render the frozen tracker panel copy:
  `Couldn't load active play runs — <message>. Retrying…`
  and `Couldn't load run <id> — <message>.`
- Add unit coverage for typed runtime errors, plain `Error`, and unknown causes so no tracker error path can produce `[object Object]` or an empty string
- Add Viewer browser coverage for the landing error panel and a specific run-load error panel

## Non-Goals

- Do not change `/api/studio/runs` behavior, 503 classification, or the ledger-absent failure itself; that belongs to `#410`
- Do not change the Play Tracker polling cadence, run-status model, StepRail rendering, or active-run/run-events schemas
- Do not change server-side `inspectError` strings returned by run-events responses
- Do not sweep every Studio `String(cause)` site in this slice; only the two Play Tracker runtime fetch failures are in scope
- Do not change CLI, plugin, hosted deployment, or eval-harness behavior

## Current Gap

- `packages/viewer/src/app/runtime/errors.ts` defines typed runtime errors with `_tag` fields and `message` getters, but no `toString()`
- `packages/viewer/src/components/studio/PlayTrackerTab.tsx` currently stores `String(cause)` for active-run failures and run-events failures
- Because the typed errors are plain objects, `String(cause)` falls through to `Object.prototype.toString` and renders `[object Object]`
- `packages/viewer/src/components/library/runtime-error-copy.ts` already centralizes safe Library runtime error copy, but its surface union only covers Library views and its current Library copy intentionally does not expose the typed `.message`
- The Play Tracker error panels render the stored string directly, so the adapter layer must produce safe copy before state is set

## Architectural Boundaries

- Keep runtime error construction in `src/app/runtime/*`; do not add `toString()` to the error classes or change the Effect runtime boundary
- Keep UI-facing runtime error copy centralized in `runtime-error-copy.ts`; Studio tracker adapters should bind a surface and optional run id, not invent a parallel extractor
- Preserve existing Library behavior by leaving the function name `libraryRuntimeErrorMessage` and the four current call sites unchanged
- It is acceptable to rename or alias the exported surface type to a neutral `RuntimeErrorSurface`, as long as `LibraryRuntimeErrorSurface` remains available for existing imports and tests
- Tracker-specific copy may use the typed error `.message`; Library-specific copy should continue to use the existing allowlisted copy
- Keep browser fixture changes confined to `packages/viewer/tests/serve-viewer-fixture.ts` and test-only cookies/routes

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Viewer runtime error copy | `packages/viewer/src/components/library/runtime-error-copy.ts` | Adds `studio-runs` and `run-events` surfaces, a safe message extractor for typed runtime errors and unknown causes, and exact tracker panel strings |
| Library runtime error regression tests | `packages/viewer/src/components/library/runtime-error-copy.test.ts` | Adds exact-copy regression assertions for `card-detail`, `catalog`, `graph`, and `ledger`; adds tracker typed-error and fallback assertions |
| Play Tracker adapters | `packages/viewer/src/components/studio/PlayTrackerTab.tsx` | Replaces the two `String(cause)` rejection handlers with helper-backed messages; specific run load includes the requested run id |
| Play Tracker unit tests | `packages/viewer/src/components/studio/PlayTrackerTab.test.tsx` | Covers the tracker-bound error helpers or equivalent pure path for active runs and run-events without relying on React effects |
| Viewer browser fixture | `packages/viewer/tests/serve-viewer-fixture.ts` | Adds deterministic failure modes for `/api/studio/runs` and `/api/studio/runs/:id/events` |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Verifies `/studio?tab=tracker` and `/studio?tab=tracker&run=<id>` show human copy and never render `[object Object]` |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | No agent prompts, roles, or routing behavior change |
| Skills | None | No product or maintainer skill behavior change |
| Templates | None | No template changes |
| CLI tools | None | No `packages/ax` behavior or deterministic CLI output changes |
| Viewer UI | Play Tracker error panels now show typed runtime messages or readable fallback copy | Add Viewer unit, build, and browser validation in this slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Covers runtime error copy, Play Tracker helper path, and existing viewer model/runtime regressions |
| Viewer type/check | `pnpm --filter @alexandria/viewer run check` | Validates Astro/TypeScript after extending helper types and component imports |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Confirms the shipped static Viewer still builds |
| Targeted browser regression | `pnpm --filter @alexandria/viewer exec playwright test tests/library-browser.spec.ts -g "Play Tracker"` | Verifies the rendered DOM for tracker landing/run failures and existing tracker happy path |
| Optional full browser sweep before merge | `pnpm --filter @alexandria/viewer run test:e2e` | Runs the whole Viewer browser suite if time/CI budget allows after fixture changes |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer Play Tracker | No eval-harness coverage; it is a deterministic browser/UI surface | Add unit and Playwright coverage instead of eval cases | `pnpm --filter @alexandria/viewer run test`; targeted Playwright command above |
| Alexandria product skills | Not impacted | No eval rerun required because no shipped skill, agent, workflow, or prompt behavior changes | none |
| Maintainer planning skill | Not impacted by implementation | No eval rerun required | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Extending the helper could accidentally change Library copy from the safe #396 wording | Keep existing Library call sites unchanged and add exact regression assertions for the four Library surfaces |
| Reading `.message` could leak noisy internals for unrecognized objects | Only trust known runtime errors, plain `Error`, and non-empty strings; otherwise return a generic readable fallback and test that `[object Object]` is absent |
| `run-events` copy could lose the run id if the helper signature is too generic | Use a typed context or small Play Tracker wrapper that requires `runId` at the call site |
| Repeated polling could reintroduce `[object Object]` on later failures | Ensure both initial refresh and interval refresh use the same helper-backed adapter; add a browser assertion after repeated failure or explicit refresh |
| Browser fixture failure modes could make unrelated tests flaky | Gate the new behavior behind test cookies or an equally narrow fixture switch and reset it with the existing fixture reset flow |
| Other Studio surfaces still have `String(cause)` | Name them as deferred follow-up work and keep this issue focused on Play Tracker runs and run-events |

## Implementation Steps

1. Extend `runtime-error-copy.ts` with a neutral `RuntimeErrorSurface` union while retaining `LibraryRuntimeErrorSurface` for existing imports.
2. Add `studio-runs` and `run-events` handling to `libraryRuntimeErrorMessage`; keep current Library branches byte-for-byte equivalent from the caller perspective.
3. Add a safe detail extractor that returns known typed runtime error `.message`, a plain `Error.message`, a non-empty string cause, or a generic fallback such as `Unknown viewer runtime error`.
4. Add TypeScript overloads or a context type so `run-events` receives `{ runId }` and renders `Couldn't load run <id> — <message>.`.
5. In `PlayTrackerTab.tsx`, replace `setError(String(cause))` and `setLoadError({ message: String(cause), runId: id })` with helper-backed messages.
6. If needed for focused unit tests, add tiny exported Play Tracker adapter functions that bind `studio-runs` and `run-events` to `libraryRuntimeErrorMessage`; keep the actual copy source in `runtime-error-copy.ts`.
7. Expand `runtime-error-copy.test.ts` to cover `ViewerHttpError(503, "Service Unavailable", ...)`, `ViewerNetworkError(...)`, plain `Error`, unknown object, and exact Library regression strings.
8. Expand `PlayTrackerTab.test.tsx` to assert the tracker-bound active-runs and run-events messages include the typed message/run id and never include `[object Object]`.
9. Add fixture failure modes for `/api/studio/runs` and `/api/studio/runs/:id/events`.
10. Add a Playwright test that opens `/studio?tab=tracker` with active-runs failure, then a direct run with run-events failure, and asserts the rendered DOM contains the human copy and not `[object Object]`.
11. Run the deterministic Viewer validation commands and record any unrun commands or environmental blockers in the implementation handoff.

## Acceptance / Exit Criteria

1. `/studio?tab=tracker` with `/api/studio/runs` failing renders `Couldn't load active play runs — Viewer runtime responded with 503 Service Unavailable. Retrying…`.
2. `/studio?tab=tracker&run=<id>` with run-events failing renders `Couldn't load run <id> — Viewer runtime responded with 503 Service Unavailable.`.
3. The rendered DOM for both failure paths never contains `[object Object]`.
4. Plain `Error`, string, and unknown-object causes produce non-empty readable tracker copy and never produce `[object Object]`.
5. Existing Library surfaces still return their current #396 copy for `card-detail`, `catalog`, `graph`, and `ledger`, with unchanged call sites.
6. Success-path Play Tracker behavior, polling cadence, status rendering, and server-side `inspectError` rendering are unchanged.
7. Viewer unit, type/check, build, and targeted browser validation pass, or any environmental blocker is documented explicitly.

## Deferred Follow-Ups

1. `#410`: fix the ledger-absent `/api/studio/runs` 503 classification/source behavior.
2. Broader Studio graceful-error sweep for the remaining `String(cause)` sites in `StudioApp.tsx`, `PlayPage.tsx`, `PlayTesting.tsx`, `RavenTab.tsx`, and `DiagramOverlay.tsx`.
3. Consider renaming `libraryRuntimeErrorMessage` to a neutral exported name once more non-Library surfaces consume it; keep a compatibility alias if that happens.
4. Consider extracting a reusable runtime error panel component only if multiple Viewer surfaces converge on the same UI structure.
