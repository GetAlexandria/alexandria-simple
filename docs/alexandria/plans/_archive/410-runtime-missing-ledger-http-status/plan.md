# Issue #410 - Runtime Missing Ledger HTTP Status

## Header

- Issue: [#410](https://github.com/GetAlexandria/alexandria-internal/issues/410),
  "[runtime] Missing/absent ledger returns an operational HTTP status, not 500"
- Run ID: `01KVZ9F5TKPSCJ68086BABAEND`
- Goal: make ledger-backed AX runtime read routes return a stable operational
  `503 Service Unavailable` response with `code: "ledger_unavailable"` when the
  configured project has no readable ledger, while preserving existing statuses
  for other known state-store errors and keeping unknown failures at 500.
- Linked product plan: the issue points at
  `docs/alexandria/plans/studio-fixes/phase-2-walk/honeydo.md` W1 plus the
  integration sweep. That `phase-2-walk/` path is not present in this checkout.
  The available local context is
  [`docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`](../studio-fixes/phase-2-build-plan.md),
  especially L1 graceful errors and L5 Ledger viewer, plus the related plans
  [`docs/alexandria/plans/388-viewer-graceful-error-state/plan.md`](../388-viewer-graceful-error-state/plan.md)
  and
  [`docs/alexandria/plans/392-ledger-viewer-event-stream/plan.md`](../392-ledger-viewer-event-stream/plan.md).
- Issue comments checked: `gh` is not installed in this environment, so private
  issue comments could not be fetched. This plan uses the complete issue body
  supplied in the run prompt and the local repository context.

## Scope

- Update AX runtime HTTP classification for state-store access failures:
  `StateLogAccessError` and `StateCursorAccessError` map to 503.
- Add the stable JSON error code `ledger_unavailable` for those 503 access
  failures while preserving the existing message:
  `State log file is missing. Run \`ax init\` to repair it.`
- Apply that classification consistently to these ledger-backed read routes:
  `GET /api/state`, `GET /api/events`, `GET /api/events?cursor=...`,
  `GET /api/events-stream`, and `GET /api/alexandria/ledger`.
- Preserve typed `StateStoreError` instances through `loadAlexandriaProjectState`
  and `loadLibraryCatalog` so the HTTP boundary can see `_tag` / class identity.
- Add focused AX runtime tests for absent ledger, cursor/non-cursor parity,
  SSE preflight status, legacy ledger status, idempotency, happy path after the
  ledger exists, typed-error preservation through loaders, and negative
  no-over-broadening behavior.
- Add or adjust Viewer test coverage only as confirmation that `/ledger` still
  renders the existing "Ledger unavailable" panel when `/api/events` returns 503.

## Non-Goals

- Do not change `ax init` semantics.
- Do not auto-create or repair the ledger from read handlers.
- Do not change the state-store domain contract or add HTTP concepts to
  `packages/ax/src/domain/state-store.ts` or
  `packages/ax/src/effects/jsonl-state-store.ts`.
- Do not redesign the Ledger viewer, change on-screen copy, or alter event table
  behavior beyond a 503 fixture/test if needed.
- Do not change plugin agents, product skills, workflows, templates, or eval
  cases.
- Do not change write-route semantics except where shared status helpers are
  reused without broadening behavior.
- Do not write to `docs/alexandria/library/`.

## Linked Product-Plan Summary

Phase 2 L5 introduced the Ledger viewer as a read-only event-stream surface over
`GET /api/events`, and Phase 2 L1 made runtime/API failures render as a graceful
panel with Retry instead of raw JSON. W1 from the missing Phase-2 walk found the
server-side sibling of those viewer fixes: a configured project can lack
`docs/alexandria/ledger/events.jsonl`, causing runtime reads to report 500 even
though the condition is operational and operator-fixable.

The product contract for this slice is server-side: a missing, absent, or locked
ledger is unavailable, not a server defect. The runtime must return 503 with a
stable body code so the Ledger viewer and event polling can distinguish this
known degraded state from a true unknown failure.

## Current Gap

The store already constructs the right typed error. In
`packages/ax/src/effects/jsonl-state-store.ts`, missing
`events.jsonl` becomes `StateLogAccessError` with the message
`State log file is missing. Run \`ax init\` to repair it.` The HTTP layer loses or
misclassifies it in several places:

- `packages/ax/src/effects/runtime-server.ts` maps idempotency conflicts,
  cursor conflicts, invalid cursors, and invalid logs, but not
  `StateLogAccessError`; it includes `StateCursorAccessError` in the predicate
  but gives it no status branch, so it falls through to 500.
- `GET /api/events?cursor=...` is closest to correct because it runs
  `listEventsAfterCursor` inside `Effect.either` and calls
  `statusForStateStoreError`, but the access-error status is still missing.
- Non-cursor `GET /api/events` calls `listEvents` outside that `Effect.either`
  guard and relies on the catch path. Since `StateLogAccessError` is omitted
  from `isStateStoreHttpError`, it becomes 500.
- `GET /api/state` catches loader failures and calls `statusForUnknownError`
  directly, so even preserved store errors would not be classified there.
- `GET /api/alexandria/ledger` catches `listEvents` failures and calls
  `statusForUnknownError` directly.
- `GET /api/events-stream` currently constructs a 200 SSE response before the
  initial `loadAlexandriaProjectState` finishes. Once headers are sent, a
  missing ledger can only become an SSE `error` event, not the required HTTP
  503 response.
- `loadAlexandriaProjectState` flattens `storage.store.listEvents({})` failures
  with `Effect.mapError((error) => new Error(error.message))`, erasing the
  state-store class instance before `/api/state` can classify it.
- `loadLibraryCatalog` has the same flattening pattern when bundle gate metadata
  reads the ledger. Its HTTP path already uses `libraryGateHttpStatus`, so it
  will inherit the fixed classification once the typed error survives.

## Architectural Boundaries

- The state store owns domain failures only. Keep `StateLogAccessError`,
  `StateCursorAccessError`, `StateLogInvalidError`, cursor conflict/invalid, and
  idempotency errors as store-level types without HTTP status or response-code
  fields.
- The AX runtime HTTP boundary owns HTTP status and JSON body shape. Centralize
  access-error status and code mapping near the existing runtime-server
  classifier instead of copying per-route ad hoc checks.
- Preserve actual error instances through Effect programs. Removing
  `new Error(error.message)` wrappers is more important than widening static
  TypeScript unions; runtime classification depends on the object identity or
  `_tag` still being present.
- Keep existing known-error statuses stable:
  idempotency conflict 409, cursor conflict 409, cursor invalid 400, log invalid
  422.
- Keep unknown errors at 500. Do not match arbitrary messages such as
  "missing", "ledger", or filesystem strings to decide 503.
- For `/api/events-stream`, perform the initial project-state load before
  returning the stream response. If that preflight fails with a recognized
  state-store access error, return JSON 503. If it succeeds, register the SSE
  subscriber and send the existing `ready` event with that preloaded state.
- The Viewer already treats `ViewerHttpError(503)` as a safe Ledger unavailable
  state. The implementation should not add Viewer product logic unless tests
  need an explicit 503 fixture.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| AX runtime state-store classifier | `packages/ax/src/effects/runtime-server.ts` | Classifies `StateLogAccessError` and `StateCursorAccessError` as 503 and attaches `code: "ledger_unavailable"` to their JSON error bodies |
| AX runtime route handlers | `packages/ax/src/effects/runtime-server.ts` | `/api/state`, `/api/events` cursor and non-cursor branches, `/api/events-stream`, and `/api/alexandria/ledger` use the same state-store error mapping |
| AX project-state loader | `packages/ax/src/effects/project-state-loader.ts` | Preserves the original `StateStoreError` from `listEvents({})` instead of flattening it to a generic `Error` |
| AX library catalog loader | `packages/ax/src/effects/library-graph-loader.ts` | Preserves the original `StateStoreError` for bundle gate event reads so `libraryGateHttpStatus` can classify access failures |
| AX runtime tests | `packages/ax/tests/runtime-server.test.ts` and possibly a focused loader test file | Adds missing-ledger status/body parity, no-mutation idempotency, happy-path, typed-error preservation, and unknown-error regression coverage |
| Viewer Ledger confirmation tests | `packages/viewer/tests/serve-viewer-fixture.ts`, `packages/viewer/tests/library-browser.spec.ts`, possibly `packages/viewer/src/components/library/runtime-error-copy.test.ts` | Confirms the existing `/ledger` graceful panel handles a 503 response from `/api/events` |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | No agent files or evals change |
| Skills | None | No product skill files or skill evals change |
| Templates | None | None |
| CLI tools | No CLI command behavior changes; `ax init` remains the repair path | No new CLI black-box exit-code coverage required beyond existing `init` repair tests |
| AX runtime API | Ledger-backed read routes return operational 503 with stable code for state-store access errors | Runtime server tests must lock route status, body shape, parity, and negative behavior |
| Viewer product UI | Existing Ledger unavailable panel is confirmed against HTTP 503 | Viewer browser/unit validation only if test fixtures are touched |
| Eval harness or eval cases | None | No eval rerun required |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Focused AX runtime tests | `pnpm --filter @alexandria/ax exec bun test tests/runtime-server.test.ts` | Proves the changed HTTP routes, SSE preflight, status/body shape, cursor parity, idempotency, happy path, and unknown-error regression |
| AX state/events regression | `pnpm --filter @alexandria/ax exec bun test tests/state.test.ts tests/events.test.ts tests/init.test.ts` | Guards state projection, event-store behavior, and the existing `ax init` missing-ledger repair path |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches Effect error-type fallout after preserving `StateStoreError` through loaders |
| AX lint/format | `pnpm --filter @alexandria/ax run lint` and `pnpm --filter @alexandria/ax run format:check` | Keeps the touched TypeScript and tests repo-standard |
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Confirms safe runtime error copy still covers Ledger 503 if Viewer tests are touched |
| Viewer browser tests | `pnpm --filter @alexandria/viewer run test:e2e` | Confirms `/ledger` renders "Ledger unavailable" with Retry on a 503 events response |
| Viewer check/build | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Required only if Viewer source or browser fixture changes beyond tests; safe to run as guardrail |
| Markdown lint | `pnpm run lint:markdown` | Confirms this plan document remains lint-clean |

Targeted AX runtime assertions to add:

1. After `ax init`, delete `docs/alexandria/ledger/events.jsonl`, start the API
   server, and assert `GET /api/state` returns status 503 with
   `error.message` preserved and `error.code === "ledger_unavailable"`.
2. Under the same absent-ledger setup, assert non-cursor `GET /api/events?limit=5`
   returns the same 503 body.
3. Assert cursor `GET /api/events?cursor=test:cursor&limit=5` returns the same
   503 body, proving cursor/non-cursor parity.
4. Assert `GET /api/events-stream` returns HTTP 503 JSON instead of opening a
   200 SSE stream when the initial state load hits the missing ledger.
5. Assert `GET /api/alexandria/ledger` returns the same 503 body.
6. Repeat at least one absent-ledger route twice and assert the ledger file is
   still absent afterward, proving the read path has no partial-init side effect.
7. Run the happy path with the ledger present and assert `/api/state`,
   `/api/events`, cursor `/api/events`, `/api/events-stream`, and
   `/api/alexandria/ledger` still return 200.
8. Assert malformed JSONL still returns the existing known error status, 422,
   rather than 503.
9. Assert a generic non-store failure still returns 500. A malformed config file
   or a focused pure classifier test is acceptable; do not use message matching
   that would make arbitrary errors look like ledger unavailability.
10. Assert `loadAlexandriaProjectState` and `loadLibraryCatalog` preserve the
    typed state-store access error. The test should inspect `_tag` or
    `instanceof StateLogAccessError` on the failure, not just the message.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| AX runtime HTTP API | Deterministic Bun tests cover runtime endpoints, events, cursors, SSE, and init repair | Extend deterministic tests; no LLM eval needed | `pnpm --filter @alexandria/ax exec bun test tests/runtime-server.test.ts` plus state/events/init regressions |
| Viewer Ledger unavailable UI | Deterministic Viewer unit and Playwright tests cover safe runtime copy and Ledger API failures | Add or adjust a 503 fixture/browser assertion if current coverage only forces 500 | `pnpm --filter @alexandria/viewer run test` and `pnpm --filter @alexandria/viewer run test:e2e` |
| Plugin agents/skills | Not touched | No eval-harness rerun required | None |
| CLI skill or initialize flows | Not touched | No eval-harness rerun required | None |

No eval-harness coverage is required because this slice changes deterministic
runtime HTTP classification and test fixtures only. It does not alter reusable
agent, skill, prompt, workflow, or LLM-mediated behavior.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The fix maps too many failures to 503 by matching messages instead of typed errors | Classify only `StateLogAccessError`, `StateCursorAccessError`, or their exact `_tag` strings; add generic-error and malformed-log tests |
| Removing `mapError((error) => new Error(error.message))` changes Effect error inference in shared loaders | Let TypeScript guide the minimal type updates, keep other loader failures as `Error`, and run AX typecheck |
| Cursor and non-cursor `/api/events` drift again because they use different control flow | Route both branches through the same state-store response helper or shared catch/classifier, then add parity tests |
| `/api/events-stream` loses its initial `ready` payload while moving state load before stream creation | Preload state once, return 503 on preflight failure, and send the existing `ready` event with the preloaded state immediately after subscriber registration on success |
| The stable `ledger_unavailable` code leaks onto unrelated errors | Add code only through a state-store access-error helper and assert other 4xx/5xx responses do not receive it unless intentionally classified |
| Read routes accidentally repair or create the missing ledger while handling 503 | Tests should delete the ledger, call routes repeatedly, and assert the file remains absent |
| Library catalog bundle gate still flattens state-store errors even after the main runtime routes are fixed | Remove the catalog-loader flattening and add a loader-level typed-error preservation assertion |
| Viewer confirmation overfits to a 500 fixture and misses the actual 503 contract | Add a 503 `/api/events` fixture mode or update the Ledger failure test to use status 503 |

## Implementation Steps

1. Add a small runtime-server helper for state-store HTTP error metadata, for
   example status plus optional code. It should return 503 and
   `ledger_unavailable` for `StateLogAccessError` and `StateCursorAccessError`,
   keep existing statuses for other known state-store errors, and return no
   match for unknown errors.
2. Update `jsonError` or add a sibling helper so classified access failures can
   return `{ "error": { "message": "...", "code": "ledger_unavailable" } }`
   without changing every existing error response.
3. Include `StateLogAccessError` in `isStateStoreHttpError`, add explicit 503
   branches for both access-error classes/tags in `statusForStateStoreError`,
   and keep invalid-log/idempotency/cursor statuses unchanged.
4. Refactor `listEventsResponse` so cursor and non-cursor reads share the same
   classified error response path. Preserve existing validation for unknown
   event type and invalid `limit`.
5. Update `stateResponse` to classify preserved state-store errors before
   falling back to `statusForUnknownError`.
6. Update `legacyLedgerResponse` to classify state-store errors before falling
   back to unknown-error handling.
7. Change `eventsStreamResponse` to await the initial
   `loadAlexandriaProjectState` before returning the stream. On recognized
   state-store access failure, return the same JSON 503 body as `/api/state`; on
   success, create the stream and emit the existing `ready` event with the
   preloaded state.
8. Remove the `new Error(error.message)` wrapping from
   `loadAlexandriaProjectState` around `storage.store.listEvents({})`.
9. Remove the same wrapping from `loadLibraryCatalog` around its bundle gate
   `storage.store.listEvents({})` read.
10. Add AX runtime tests for the targeted assertions listed above, using the
    existing temp-project helpers and deleting only the test project's
    `events.jsonl`.
11. Add a loader-level typed-error preservation test if that assertion is too
    awkward to prove only through HTTP route tests.
12. Add or update a Viewer fixture/browser test so `/ledger` receives a 503
    `/api/events` failure and still renders the existing graceful panel with
    Retry and no raw runtime JSON.
13. Run the deterministic verification commands and fix only issues in this
    slice.

## Acceptance / Exit Criteria

1. With `.alexandria/alexandria-config.json` present and
   `docs/alexandria/ledger/events.jsonl` absent, `GET /api/state` returns 503
   with `error.code === "ledger_unavailable"` and the existing missing-ledger
   message.
2. With the ledger absent, non-cursor `GET /api/events`, cursor
   `GET /api/events?cursor=...`, `GET /api/events-stream`, and
   `GET /api/alexandria/ledger` all return 503, not 500.
3. Cursor and non-cursor `/api/events` return the same status and stable body for
   the same absent-ledger condition.
4. When the ledger exists, `/api/state`, `/api/events`, cursor `/api/events`,
   `/api/events-stream`, and `/api/alexandria/ledger` still return 200.
5. `StateLogInvalidError` still returns 422, idempotency conflicts still return
   409, cursor invalid still returns 400, and cursor conflict still returns 409.
6. A truly unknown non-store failure still returns 500.
7. `loadAlexandriaProjectState` and `loadLibraryCatalog` preserve the original
   typed state-store access error rather than flattening it to a generic `Error`.
8. Repeated absent-ledger reads are idempotent and do not create
   `docs/alexandria/ledger/events.jsonl` or any partial initialization artifact.
9. `/ledger` renders its existing "Ledger unavailable" panel with Retry when
   `/api/events` returns 503.
10. The deterministic AX and Viewer verification commands in this plan pass, or
    any non-blocking failure is documented with concrete evidence that it is
    unrelated to this slice.

## Deferred Follow-Ups

1. Boot-time or `ax start viewer` repair that creates a missing ledger before
   reads. This issue intentionally reports the operational state instead.
2. A broader audit of other mutation paths that locally wrap state-store errors,
   such as library confirmation or host-supervisor paths, unless they affect the
   read-route contract in this issue.
3. Additional stable machine-readable error codes for other known runtime errors.
   This slice only freezes `ledger_unavailable`.
4. Cursor pagination, live Ledger viewer updates, or event-stream UI changes from
   the Ledger viewer roadmap.
