# Issue #392 - Ledger Viewer Event Stream

## Header

- Issue: [#392](https://github.com/GetAlexandria/alexandria-internal/issues/392), "L5 - Ledger viewer: event-stream surface from /api/events"
- Run ID: `01KVXHJSSP7J45MCM3PYQ5BE3A`
- Goal: enable the Ledger top-navigation tab and replace the placeholder with a read-only event-stream view over `GET /api/events` so the Director can inspect provenance and confirm `play.*` narration from #381.
- Linked product plan: [`docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`](../studio-fixes/phase-2-build-plan.md), lane L5.
- Issue comments checked: the private GitHub issue could not be fetched in this environment because browser access returned no issue content and `gh` is not installed. This plan uses the full issue body supplied in the run prompt, the linked phase-2 plan, and the repository context read locally.
- Package guidance: root `CLAUDE.md`, root `README.md`, `skills/maintainer/technical-planning/SKILL.md`, `skills/maintainer/technical-planning/plan-template.md`, `packages/viewer/README.md`, and the relevant Viewer/runtime files were read. No package-local `packages/viewer/CLAUDE.md` exists.

## Scope

This slice is Viewer-only:

1. Enable the existing `ledger` top-navigation tab by changing the fixture entry from disabled to enabled.
2. Replace `LedgerPlaceholder` with a product Ledger view mounted at the existing `/ledger` route.
3. Fetch the default page from `runtimeClient.listEvents(100)`, which already calls `GET /api/events?limit=100`.
4. Render the returned page read-only, newest first, with columns for `type`, compact `actor`, localized `at`, and a one-line payload summary.
5. Show `No events yet.` when the endpoint returns an empty `events` array.
6. Show a graceful runtime error panel with Retry when the request fails or cannot be decoded, never raw JSON or raw `_tag` text.
7. Show a count line that respects `returnedCount`, `totalCount`, `limit`, and `truncated`; if `truncated` is true, indicate that more events exist beyond the rendered page.
8. Add focused Viewer tests and fixture support for enabled navigation, event rendering, ordering, empty state, error state, and `play.*` visibility.

## Non-Goals

1. Do not add, remove, or change `/api/events`, its query parameters, or the AX state-store contract.
2. Do not add search, filtering, infinite scroll, cursor pagination, export, or per-event detail drill-down.
3. Do not write events from the Ledger view. The surface is read-only.
4. Do not change `packages/ax` CLI behavior, exit codes, runtime bridge behavior, or ledger event schemas.
5. Do not change Alexandria plugin agents, skills, workflows, templates, or eval harness behavior.
6. Do not edit `docs/alexandria/library/`.
7. Do not touch `packages/viewer/src/components/studio/StudioApp.tsx`; lane L6 owns that file.
8. Do not update vendored repositories under `repos/`.

## Linked Product-Plan Summary

Phase 2 lane L5 says the Ledger tab is currently disabled/stubbed, which prevents the Director from confirming whether #381 narrated the correct `play.*` events into this project ledger. The required first pass is a simple read-only viewer surface: enable the tab, consume the already-shipped `GET /api/events` endpoint, and list events as `type / actor / at / payload summary`. The visual treatment should follow the Playbook Runs table and Factory Runs lens: uppercase small-cap headers, compact rows, status pips, localized timestamps, and no validation/spec text on screen.

## Current Gap

The endpoint and route foundations already exist, but the shipped surface is not the requested product behavior:

1. `packages/ax/src/effects/runtime-server.ts` already serves `GET /api/events` through `listEventsResponse`, and the JSONL store returns a page with `events`, `returnedCount`, `totalCount`, `limit`, and `truncated`.
2. `packages/viewer/src/app/runtime/schemas.ts` already defines `RuntimeEventSchema` and `RuntimeEventPageSchema` for `id`, `type`, `at`, `actor`, `payload`, `schemaVersion`, `idempotencyKey`, `causationId`, and `correlationId`.
3. `packages/viewer/src/app/runtime/client.ts` already exposes `runtimeClient.listEvents(limit)`.
4. `/ledger` already parses in `packages/viewer/src/components/library/viewer-routes.ts` and is switched in `LibraryBrowserApp.tsx`.
5. The top navigation entry in `packages/viewer/src/app/navigation/top-navigation.fixtures.ts` has `enabled: false`, so the tab renders locked and cannot open the route through primary navigation.
6. `packages/viewer/src/components/library/SurfacePlaceholders.tsx` has a minimal `LedgerPlaceholder` that fetches events, reverses the page, and renders a list, but it does not meet the table, payload-summary, empty-copy, truncation, or graceful-error requirements.
7. `packages/viewer/tests/library-browser.spec.ts` currently asserts the Ledger tab is disabled, so tests must move from lock-state coverage to enabled route/render coverage.
8. The Viewer fixture server already supports `GET /api/events`, but it needs small test-only controls for seeded events and failure modes so ordering, empty, error, and `play.*` cases are deterministic.

## Architectural Boundaries

1. The runtime/API boundary stays in `packages/viewer/src/app/runtime/*`. Keep `RuntimeEventPageSchema` narrow and do not duplicate AX domain models beyond what the viewer renders.
2. `packages/ax` remains the owner of event creation, storage, filtering, and endpoint semantics. The Viewer only reads and formats the page it receives.
3. React hooks are the adapter layer for running runtime Effects. Prefer a small `useLedgerEvents` hook over running `Effect.runPromise` directly in a presentational table component.
4. Keep the Ledger rendering pure and read-only. No buttons or forms should call `POST /api/events`.
5. The displayed order must be newest first. Since the JSONL store and fixture return the most recent `limit` events in append order, the Viewer should sort the rendered page by `at` descending with a stable fallback such as original page index or `id`.
6. Payload summary must be allowlisted and one-line. Prefer salient keys such as `playId`, `status`, `fabroRunId`, `playRunId`, `agentId`, `routeToPlayId`, `bundlePath`, `product`, and `libraryVersion`; fall back to a compact key list or `event.id`, not a raw JSON blob.
7. Actor summary should prefer `actor.name` when present, otherwise join non-empty `kind`, `host`, and `process` with a compact separator.
8. Error presentation should reuse the L1-style `RuntimeUnavailablePanel` and safe runtime-error copy. Do not render `error.body`, raw serialized JSON, `_tag`, or `String(object)` output.
9. Visual styling should source from `PlaybookView` and the Factory Runs lens: `vision-source-panel`, table markup, small uppercase headers, compact `raven-status-pip` treatment, striped or bordered rows, and localized timestamps.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Top navigation fixture | `packages/viewer/src/app/navigation/top-navigation.fixtures.ts` | Enables the Ledger tab so it is clickable and no longer renders the lock state |
| Ledger route content | `packages/viewer/src/components/library/LibraryBrowserApp.tsx`, `packages/viewer/src/components/library/SurfacePlaceholders.tsx`, new `packages/viewer/src/components/library/LedgerView.tsx` | Replaces the placeholder branch with a real read-only Ledger event table |
| Ledger data hook | New `packages/viewer/src/components/library/hooks/useLedgerEvents.ts` | Runs `runtimeClient.listEvents(100)`, tracks loading/error/page state, exposes Retry, and keeps Effect at the hook boundary |
| Ledger view model helpers | New `packages/viewer/src/components/library/ledger-event-view-model.ts` or colocated pure helpers | Sorts events newest first, formats actor summaries, formats localized timestamps, chooses status-pip classes, and builds one-line payload summaries |
| Runtime error copy | `packages/viewer/src/components/library/runtime-error-copy.ts` | Adds a `ledger` surface label or a nearby Ledger-specific safe message helper for request/decode failures |
| Shared error panel | `packages/viewer/src/components/library/RuntimeUnavailablePanel.tsx` | Reused as-is unless a compact prop is needed; Ledger failures render it with Retry and safe copy |
| Viewer fixture server | `packages/viewer/tests/serve-viewer-fixture.ts` | Adds test-only event seed/failure controls while keeping production `/api/events` read-only in the Ledger UI |
| Browser tests | `packages/viewer/tests/library-browser.spec.ts` | Updates the disabled-tab assertion and adds Ledger route, render, ordering, empty, error, and `play.*` assertions |
| Viewer unit tests | New focused helper test such as `packages/viewer/src/components/library/ledger-event-view-model.test.ts`, plus `packages/viewer/package.json` if the explicit test list needs the new file | Locks event ordering and summary behavior without relying only on Playwright |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | None | No CLI black-box or exit-code tests required |
| Setup or distribution workflow | None | None |
| Viewer product UI | Ledger becomes a navigable read-only event-stream surface backed by `/api/events` | Viewer unit, check/build, and browser validation required |
| Eval harness or eval cases | None | No eval reruns or new eval cases required |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Ledger helper/unit coverage | `pnpm --filter @alexandria/viewer run test` | Covers pure ordering, actor summary, payload summary, timestamp fallback, and existing runtime client decode coverage |
| Viewer type/Astro check | `pnpm --filter @alexandria/viewer run check` | Confirms React props, hooks, Effect usage, and Astro integration compile |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Required build validation for the shipped Viewer surface |
| Viewer browser tests | `pnpm --filter @alexandria/viewer run test:e2e` | Exercises navigation, `/ledger` rendering, empty/error states, and seeded event rows in a browser |
| Formatting | `pnpm --filter @alexandria/viewer run format:check` | Confirms Prettier-covered TS/TSX/test files stay formatted |
| Markdown lint | `pnpm run lint:markdown` | Confirms this plan document satisfies repo markdown checks |

Targeted browser assertions to add:

1. The Home navigation shows `Ledger` enabled, without the lock, and clicking it navigates to `/ledger`.
2. Direct loading `/ledger` renders the Ledger heading/table and does not alter Library, Playbook, Info Hub, Studio, or home routing.
3. A seeded event page renders rows newest first, with visible `type`, actor summary, localized timestamp, and one-line payload summary for every row.
4. A seeded `play.started` or related `play.*` event with `playId`, `fabroRunId`, and `status` is visible in the Ledger, proving the #381 confirmation path at the UI level.
5. An empty event page renders exactly `No events yet.` and does not render raw JSON.
6. A forced `/api/events` HTTP failure renders `RuntimeUnavailablePanel` with Retry and does not render `_tag`, `ViewerHttpError`, or raw JSON.
7. A failed request recovers after the fixture switches back to success and Retry is clicked.
8. A truncated seeded page renders only the endpoint page and shows count copy indicating more events exist; it does not attempt infinite scroll or cursor pagination.
9. The table remains readable on desktop and mobile widths, with no horizontal page overflow from long payload values or IDs.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer Ledger UI | No eval-harness coverage applies; behavior is product UI and is covered by deterministic Viewer tests | Add/extend Viewer unit and Playwright tests | `pnpm --filter @alexandria/viewer run test` and `pnpm --filter @alexandria/viewer run test:e2e` |
| AX runtime endpoint | Existing AX runtime/server tests cover endpoint availability; endpoint is not changing | No new AX eval or endpoint test required unless implementation unexpectedly touches AX | None expected |
| Alexandria plugin agents/skills | Not touched | No eval-harness rerun required | None |
| CLI behavior | Not touched | No CLI black-box coverage required | None |

No eval-harness coverage is required because this slice changes Viewer presentation only. It does not alter reusable agent, skill, prompt, workflow, or CLI behavior.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The view displays the last page in append order instead of newest first | Sort the rendered events by parsed `at` descending in a pure helper and test that order with non-sorted fixture data |
| The payload summary drifts into raw JSON blobs and overwhelms the table | Use an allowlisted summary helper with a short fallback; test salient `play.*` and library event payloads plus unknown payloads |
| API failures reintroduce raw `_tag` or serialized `ViewerHttpError` text | Reuse `RuntimeUnavailablePanel` and safe copy; add Playwright assertions that raw runtime strings are absent |
| The Ledger hook accidentally writes events while trying to seed or refresh | Production code only calls `runtimeClient.listEvents`; any event seeding belongs only in `serve-viewer-fixture.ts` test helpers |
| Enabling the tab changes unrelated route behavior | Keep route parsing unchanged and update existing navigation/history tests to assert other tabs still open as before |
| The UI duplicates endpoint schema logic or starts depending on AX-only event types | Keep schemas in `src/app/runtime/schemas.ts` as the contract and summary helpers generic over unknown payload keys |
| Long IDs, actor values, or payload values cause table overflow on small screens | Use truncation/wrapping constraints in the table cells and add browser overflow assertions |
| `truncated` copy implies pagination exists | Show count-only copy such as "Showing 100 of 134 events. More events exist." with no load-more control in this pass |
| Fixture event state leaks across browser tests | Reset fixture state before each Ledger test and use explicit seed/failure controls scoped by request cookie/header or test endpoint |

## Implementation Steps

1. Add a pure Ledger view-model helper for newest-first ordering, actor summary, localized timestamp formatting, status-pip classification, and payload summary.
2. Add focused unit tests for the helper, including `play.*` payloads, actor `name` precedence, missing actor fields, invalid timestamps, unknown payloads, and stable newest-first sorting.
3. Add `useLedgerEvents(runtimeClient, limit)` to load `runtimeClient.listEvents(100)`, store the decoded page, expose `refresh`, and translate failures into safe UI state.
4. Create `LedgerView.tsx` using the Playbook Runs table treatment, `RuntimeUnavailablePanel`, the helper output, `No events yet.`, and count/truncation copy.
5. Replace the `LibraryBrowserApp.tsx` Ledger branch to render `LedgerView`, and remove or stop exporting the old `LedgerPlaceholder`.
6. Flip the `ledger` entry in `top-navigation.fixtures.ts` to `enabled: true`; leave the existing `/ledger` route parser unchanged.
7. Extend `runtime-error-copy.ts` or add a Ledger-local safe message so `/api/events` failures get plain copy and Retry without raw technical details.
8. Extend `serve-viewer-fixture.ts` with deterministic Ledger test controls: reset/seed event pages, force `/api/events` failures, and force truncated pages. Keep these controls test-only.
9. Update `library-browser.spec.ts`: change the current disabled-tab assertion, add Ledger navigation/direct-route tests, and cover seeded rows, newest-first ordering, empty state, error/retry, truncation copy, and `play.*` visibility.
10. Run the deterministic verification commands. If the full Playwright suite is too slow during implementation, run the new Ledger-focused tests first, then the full `test:e2e` before handoff.

## Acceptance / Exit Criteria

1. The Ledger top-navigation tab is enabled, clickable, and shows no lock.
2. `/ledger` opens through direct load and through the top nav without regressing other top-nav routes.
3. The Ledger view reads from `GET /api/events` through `runtimeClient.listEvents(100)` and does not write events.
4. Rendered rows are newest first and show `type`, compact `actor`, localized `at`, and one-line payload summary.
5. `play.*` events containing `playId`, `fabroRunId`, and `status` are readable in the table, satisfying the UI confirmation path for #381 narration.
6. Empty events render `No events yet.` with no crash and no raw JSON.
7. Runtime/API/decode failures render a graceful panel with Retry and no raw `_tag`, `ViewerHttpError`, or JSON blob.
8. If `truncated` is true, the view indicates that more events exist while rendering only the endpoint page.
9. Viewer unit, check/build, browser, format, and markdown validation from this plan pass or any failures are documented with a concrete reason.

## Deferred Follow-Ups

1. Add filtering/search by event type, actor, and payload keys.
2. Add cursor pagination or a Load More control using `/api/events?cursor=...` if the Director needs deeper history.
3. Add per-event detail drill-down for full payload and correlation/causation fields.
4. Add live updates from `/api/events-stream` after the first read-only page is stable.
5. Consider sharing Ledger table primitives with future provenance surfaces if another Viewer area needs the same event-row treatment.
