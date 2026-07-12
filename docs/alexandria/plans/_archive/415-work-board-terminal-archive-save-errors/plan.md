# Issue 415 - Work Board terminal-card lifecycle and save-failure reasons

Status: draft for approval
Issue: https://github.com/GetAlexandria/alexandria-internal/issues/415
Run ID: 01KVZ9D24HD4D4EM6D4XH40XEG
Project: Studio Work Board
Phase: Phase-2 walk W4 plus integration sweep
Tier: must
Related: #400, #401, #405, #406, #347

Linked plans and decisions:

- `docs/alexandria/plans/400-work-board-data-model/plan.md`
- `docs/alexandria/plans/401-work-board-rebuild/plan.md`
- `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`
- `docs/alexandria/plans/studio-fixes/board-surface-decision.md`
- `docs/alexandria/plans/studio-fixes/board-data-model.md`
- `docs/alexandria/plans/studio-fixes/board-project-plan.md`

Planning note: issue #415 names `docs/alexandria/plans/studio-fixes/phase-2-walk/honeydo.md`
as the Phase-2 W4 source. That path is not present in this checkout at planning time. This
plan uses the issue body, the current code, and the existing #400/#401 plans as the available
source set. If the Phase-2 walk file lands before implementation starts, reconcile this plan
against it before editing implementation files.

## Goal

Repair the Studio Work Board terminal-card and archive lifecycle in one coordinated slice:

- board-save failures shown in the viewer must surface the server's real reason
- pure stage, ready, or graduation saves must not fail because pre-existing cards violate the
  Testing-card invariant
- graduated play archive entries must have a persisted date so the Archive Date filter works
- terminal work-order cards must archive after the 7-day window using a live refresh clock
- canonical checked-in terminal work-order cards must carry `terminalAt`, with legacy fallback
  handling for any card that still lacks it

This is the foundation that #347's advanced board work assumes. Land this before re-running
#347 because both slices edit `StudioApp.tsx` and the archive projection contract.

## Sources Of Truth

- Root `CLAUDE.md` and `README.md` define the monorepo boundaries and state that the viewer
  `/studio` tab is the canonical Studio product surface.
- `studio/README.md` defines `studio/plays/board-state.json` as the shared Studio Board store
  read by the viewer and edited by agents.
- `packages/viewer/README.md` defines the viewer runtime boundary: local `/api/*` fetch,
  Schema decode, typed Effect errors, and React hook adapters.
- `packages/ax/CLAUDE.md` and `packages/ax/README.md` define AX as the deterministic
  TypeScript/Effect runtime API surface, with black-box tests for stable behavior.
- `skills/maintainer/technical-planning/SKILL.md` defines this planning format.
- `EVALS.md` defines when eval-harness reruns are required.
- Issue #415 defines the four defects, proposed contracts, acceptance criteria, and #347
  sequencing requirement.
- Current implementation files confirm the gaps:
  `packages/viewer/src/components/studio/StudioApp.tsx`,
  `packages/viewer/src/components/studio/boardModel.ts`,
  `packages/viewer/src/app/runtime/studio.ts`,
  `packages/ax/src/effects/studio-api.ts`,
  `studio/plays/board-model.js`,
  `studio/tools/check-board-state.mjs`,
  and `studio/plays/board-state.json`.

## Scope

- Update the viewer Work Board save path so rejected board saves display the server reason
  carried by `ViewerHttpError.body`, not the fixed string `board save failed`.
- Update the AX `/api/studio/board` POST handler so `body.cards === undefined` preserves
  existing cards without re-running `requireTesting` validation. Submitted `cards` bodies must
  still validate and fail with the real reason when invalid.
- Add persisted board-level `graduatedAt: Record<string, string>` date-only metadata while
  keeping `graduated: string[]` as the explicit graduated slug list.
- Stamp `graduatedAt[slug]` when a play enters `graduated`, preserve it on idempotent saves,
  and remove stale dates when a play is restored or otherwise absent from `graduated`.
- Populate graduated archive entry dates from `board.graduatedAt[slug]` and keep the Date
  filter as a real exact-date filter.
- Replace the BoardView mount-pinned `now` clock with a refresh-scoped clock so archive
  projection recomputes after board refreshes without a full page reload.
- Update work-order archive derivation in both board model copies so age archive uses
  `terminalAt` when present and falls back to date-only `created` when `terminalAt` is absent.
- Backfill the checked-in shipped terminal cards in `studio/plays/board-state.json` with
  `terminalAt: "2026-06-11"` and update canonical validation so terminal cards in the checked-in
  state carry `terminalAt`.
- Update viewer fixtures and browser tests for graduated date filtering, save-error surfacing,
  live-clock recomputation, and legacy terminal fallback.

## Non-Goals

- Do not change the Catalog, Play Tracker, Ledger, Raven, Damien, Runs, or Play page behavior.
- Do not add a stored archive lane, archive array, scheduler, background sweep, or write-time
  archive materialization. Archive membership remains derived.
- Do not change bundled Alexandria plugin skills, agents, workflows, or prompts.
- Do not change public CLI commands or their stdout/stderr contracts.
- Do not write to `docs/alexandria/library/`.
- Do not revive the retired standalone `studio/*.html` or `studio/site-server.py` surface.
- Do not implement #347 swimlanes, play connections, or ledger-backed cards in this slice.
- Do not extract a shared board-contract package yet; this slice keeps the current duplicated
  contract copies aligned and records extraction as follow-up.

## Linked Product-Plan Summary

The W4 sweep found four defects on one Work Board surface:

- The viewer discards the server body on save failure and shows only `board save failed`.
- Graduated play archive entries have `date: null`, so setting any Archive Date filter hides
  every graduated play.
- Auto-archive does not fire reliably because BoardView pins `now` for the whole mount while
  refreshes update the `board` prop in place.
- Seeded and migrated terminal cards lack `terminalAt`, and both archive helper copies refuse
  to age-archive a terminal card without it.

Earlier plans #400 and #401 intentionally deferred `graduatedAt` and terminal backfill. Issue
#415 reopens those exact decisions because the shipped L6/L6a archive UI now depends on them.

## Current Gap

- `BoardView.saveBoard()` and `BoardView.saveCards()` ignore their rejection cause and set
  `saveError` to `board save failed`.
- `ViewerHttpError` already stores the response body, and the Studio API already returns
  JSON such as `{ "error": "invalid board state: play <slug> must have exactly one testing card" }`,
  but the Work Board UI does not parse or display it.
- `boardWriteResponse()` validates existing cards with `requireTesting: true` when a POST omits
  `cards`, so a pure stage, ready, or graduation save can fail because of old card state that
  the request did not change.
- `StudioBoardSchema` has `graduated` but no `graduatedAt`; `StudioApp.tsx` builds
  `PlayArchiveEntry.date` as `null`.
- `filteredArchiveEntries` applies the Date filter uniformly, so null-dated graduated entries
  disappear under any non-empty date filter.
- `BoardView` uses `useMemo(() => new Date(), [])`; registry refreshes call `setRegistry()` but
  do not remount `BoardView`, so archive projection can stay stale for the session.
- `studio/plays/board-model.js` and `packages/viewer/src/components/studio/boardModel.ts`
  both require valid `terminalAt` before age archive and do not fall back to `created`.
- `studio/plays/board-state.json` currently has three `done` shipped work-order cards with no
  `terminalAt`, all dated in their detail text as shipped on `2026-06-11`.

## Architectural Boundaries

- `studio/plays/board-state.json` remains the mutable Board store for stages, ready flags,
  graduated play slugs, per-graduated-play dates, and work-order cards.
- AX owns the `/api/studio/board` write contract. The viewer continues to persist Board edits
  only through `saveStudioBoard()`.
- Viewer runtime schemas stay browser-facing and narrow. They must decode the new optional
  `graduatedAt` field, but AX and `studio/tools/` remain the stricter store validators.
- Archive membership is still a read-time projection. `terminalAt`, `created`, `archived`,
  `pinned`, `graduated`, `graduatedAt`, and a live `now` produce the projection.
- Date-only values are interpreted as UTC calendar days for archive math.
- `graduatedAt` is stored because it records an explicit Director action date. The derived
  archive set is not stored.
- A no-cards board save is a stage/ready/graduation mutation only. It may normalize stage,
  ready, `graduated`, and `graduatedAt`, but must carry existing cards forward untouched.
- A cards-submitting save is the only path that revalidates and normalizes card lifecycle
  fields.

## Data And Behavior Contract

### Board Save Errors

- Add a small error-formatting helper for Studio board save failures.
- If the cause is a `ViewerHttpError`, parse `body` as JSON and prefer `error` or `message`
  when either is a string.
- If JSON parsing fails, show the trimmed response body.
- Fall back to the typed runtime error `message`, then `String(cause)`.
- The UI must not expose the fixed string `board save failed` for server 400s.

### No-Cards Board POST

When `body.cards === undefined`:

- read existing `cards` from `board-state.json`
- preserve that value as-is, defaulting to `[]` when absent
- do not call `validateBoardCards()` with `requireTesting: true`
- do not normalize `terminalAt` or other card fields
- still validate the submitted `stages`, `ready`, `graduated`, and `graduatedAt` fields

When `body.cards` is present:

- validate the submitted cards
- merge by id with existing cards
- apply terminal timestamp normalization
- require exactly one Testing card for each active staged play
- return HTTP 400 with the precise validation reason when invalid

### Terminal Work-Order Archive Dates

- `terminalAt` remains the canonical terminal transition date for terminal work orders.
- Entering `done` or `wont-do` from a non-terminal status stamps today's date-only value unless
  the submitted card already carries a valid `terminalAt`.
- Terminal-to-terminal changes preserve the existing valid `terminalAt`.
- Reopening to `open` or `in-progress` clears `terminalAt`, `archived`, and `pinned` through the
  existing viewer helper behavior.
- A submitted terminal card that still lacks `terminalAt` after merge should receive a date-only
  value from existing valid `terminalAt`, then valid `created`, then today, in that order.
- `inArchive()` and the viewer mirror must age a terminal card from `terminalAt` when present,
  else from date-only `created` when `terminalAt` is absent.
- `pinned: true` still blocks only the age-based archive path. `archived: true` still forces
  archive membership.

### Graduated Play Dates

Keep `graduated` as an array of slugs and add:

```json
{
  "graduated": ["make-a-play"],
  "graduatedAt": {
    "make-a-play": "2026-06-24"
  }
}
```

Rules:

- `graduatedAt` is optional for backward decode but canonical state should include a date for
  every slug in `graduated`.
- `graduatedAt` values must be `YYYY-MM-DD`.
- When a slug is newly added to `graduated`, AX stamps `graduatedAt[slug]` with today's
  date-only value unless a valid date already exists.
- Re-saving an already graduated slug preserves its date.
- Restoring a slug removes it from `graduated` and prunes its `graduatedAt` entry.
- `graduatedAt` keys that are not in `graduated` are pruned during POST normalization and
  rejected by the checked-in state validator.
- Viewer archive entries for graduated plays use `board.graduatedAt?.[slug] ?? null` as their
  date. A legitimate graduated play should therefore match its date filter and hide under a
  different date.

### Live Archive Clock

- Replace the mount-stable `now` with a refresh-scoped value, for example
  `useMemo(() => new Date(), [props.board])`.
- All active/archive partition memos and restore decisions should depend on that value.
- The code comment should state that the clock is refreshed when the registry/board payload is
  refreshed, not that the component remounts.

## Touch Map

| Surface | Files / areas | Planned behavior change |
| --- | --- | --- |
| Plan artifact | `docs/alexandria/plans/415-work-board-terminal-archive-save-errors/plan.md` | Records the implementation contract and validation scope for issue #415. |
| Viewer Board UI | `packages/viewer/src/components/studio/StudioApp.tsx` | Surface real save errors, consume `graduatedAt`, use dated graduated archive entries, keep Date filtering exact, and recompute archive `now` on board refresh. |
| Viewer board helper mirror | `packages/viewer/src/components/studio/boardModel.ts` | Add terminal archive-date fallback from `created` and keep pinned/archived precedence unchanged. |
| Viewer runtime schema and errors | `packages/viewer/src/app/runtime/studio.ts`, `packages/viewer/src/app/runtime/errors.ts` or local helper near `StudioApp.tsx` | Decode optional `graduatedAt`; provide or use a tested helper that extracts useful HTTP error body text. |
| Viewer runtime/model tests | `packages/viewer/src/app/runtime/studio.test.ts`, `packages/viewer/src/components/studio/boardModel.test.ts` | Cover `graduatedAt` decode/save shape, error body extraction, and `created` fallback archive math. |
| Viewer browser fixture | `packages/viewer/tests/serve-viewer-fixture.ts` | Add `graduatedAt` to fixture board data, support a board-save failure mode with a real body, and make POST handling stamp/prune dates enough for browser tests. |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Cover save-error reason, graduated Date filter match/hide/clear, live-clock refresh, and legacy terminal fallback. |
| AX Studio API | `packages/ax/src/effects/studio-api.ts` | Preserve cards untouched on no-cards saves; normalize and persist `graduatedAt`; keep submitted invalid card bodies failing with precise reasons; stamp/backfill terminal dates on card-submitting saves. |
| AX endpoint tests | `packages/ax/tests/studio-api.test.ts` | Add no-cards success with missing Testing card, submitted invalid cards 400 with reason, `graduatedAt` stamp/preserve/prune, and terminal date idempotency coverage. |
| Studio board model | `studio/plays/board-model.js` | Add `graduatedAt` normalization helpers if useful for validators, terminal archive-date fallback, and tests for fallback/pinned behavior. |
| Studio model and state validation | `studio/tools/board-model.test.mjs`, `studio/tools/check-board-state.mjs` | Pin fallback archive math and enforce canonical `board-state.json` terminal/graduation date completeness. |
| Persisted board data | `studio/plays/board-state.json` | Backfill `terminalAt: "2026-06-11"` on the three shipped `done` cards and update the comment to mention `graduatedAt`. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Bundled plugin agents and skills | None. This slice does not change product skills, prompts, agents, or workflows. | No plugin validation or eval rerun. |
| Maintainer skills | None. The technical-planning skill is used, not modified. | No eval rerun. |
| Studio Board data edited by agents | Canonical `board-state.json` now expects terminal cards to carry `terminalAt` and graduated slugs to carry `graduatedAt`. | `studio/tools/check-board-state.mjs` becomes the deterministic guard; no reusable skill text changes in this slice. |
| AX local runtime API | `/api/studio/board` no longer revalidates cards on no-cards saves and now persists `graduatedAt`. | Extend endpoint tests; no public CLI command contract changes. |
| Viewer Studio surface | Save errors and archive filtering/projection behavior change in the browser. | Viewer unit, build, and browser validation. |

## Implementation Steps

1. Update the duplicated board data contract.
   - Add optional `graduatedAt` to the viewer runtime schema and fixture board type.
   - Add a `graduatedAt` normalizer in AX and, if useful for direct-state validation, in
     `studio/plays/board-model.js`.
   - Keep `graduated` as the slug array to avoid breaking existing callers.

2. Fix AX board POST semantics.
   - Split the `body.cards === undefined` branch from the cards-submitting branch.
   - Preserve existing cards untouched on no-cards saves.
   - Keep `mergeBoardCards()` and `validateBoardCards(... requireTesting: true)` for submitted
     `cards` bodies.
   - Normalize `graduatedAt` by stamping new graduated slugs, preserving existing dates, and
     pruning restored slugs.
   - Ensure invalid submitted card bodies still return HTTP 400 with the validation message.

3. Fix terminal archive-date logic.
   - Add a helper equivalent to `archiveDateForTerminalCard(card)` in both board model copies.
   - Use `terminalAt` first and `created` second for age archive.
   - Preserve `archived` and `pinned` precedence exactly as #400/#401 documented.
   - Update card-submitting persistence normalization so terminal cards saved through the API do
     not remain without `terminalAt`.

4. Fix viewer save-error display.
   - Replace `void cause; setSaveError("board save failed")` in both save paths.
   - Use a tested formatter that extracts the Studio API `error` string from `ViewerHttpError.body`.
   - Keep fallback behavior sane for non-HTTP runtime errors.

5. Fix viewer archive projection.
   - Build `PlayArchiveEntry.date` from `props.board?.graduatedAt?.[slug] ?? null`.
   - Keep the Date filter predicate exact; with valid `graduatedAt`, graduated plays now match
     their date instead of disappearing under every date.
   - Replace the frozen mount clock with a refresh-scoped clock and wire all active/archive
     projections and restore decisions to it.

6. Backfill canonical data and fixtures.
   - Add `terminalAt: "2026-06-11"` to the three shipped `done` cards in
     `studio/plays/board-state.json`.
   - Update the board-state comment to mention `graduatedAt`.
   - Add `graduatedAt` to the viewer fixture's graduated `make-a-play` entry.
   - Add fixture support for a deliberate board-save 400 body and for the live-clock crossing
     case.

7. Extend deterministic tests.
   - Add AX endpoint tests for no-cards saves, invalid cards bodies, `graduatedAt`, terminal
     date idempotency, and precise response bodies.
   - Add board model tests for `terminalAt` archive, `created` fallback archive, and pinned
     never auto-archive.
   - Add viewer runtime/model tests for `graduatedAt` and error formatting.
   - Add browser tests for save-error surfacing, graduated Date filtering, live-clock refresh,
     and the regression controls called out in the issue.

8. Run validation and keep the scope fence.
   - If implementation discovers a broader board-contract sharing problem, keep extraction as a
     follow-up unless it is required for this issue's tests to pass.
   - Do not start #347 work until this slice is merged.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Studio board model | `node --test studio/tools/board-model.test.mjs` | Pins terminal fallback archive math and graduated-date helper behavior. |
| Checked-in Studio board data | `node studio/tools/check-board-state.mjs` | Proves canonical seeded terminal cards carry `terminalAt` and `graduatedAt` is aligned with `graduated`. |
| AX Studio API endpoint | `bun test packages/ax/tests/studio-api.test.ts` | Covers no-cards saves, invalid cards 400s, terminal stamps, and `graduatedAt` persistence. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches TypeScript drift in the Effect runtime API. |
| Viewer unit/runtime/model | `pnpm --filter @alexandria/viewer run test` | Covers runtime decode/save shape, error formatting, and board helper mirror behavior. |
| Viewer type/build check | `pnpm --filter @alexandria/viewer run check` | Catches Astro/React/TypeScript issues in `StudioApp.tsx` and runtime schemas. |
| Viewer production build | `pnpm --filter @alexandria/viewer run build` | Confirms the shipped static viewer still compiles. |
| Studio Board browser behavior | `pnpm --filter @alexandria/viewer run test:e2e -- --grep "Studio Board"` | Exercises save-error surfacing, graduated Date filtering, live-clock refresh, archive controls, and existing Work Board regressions. |

No new public CLI command behavior is introduced, so no additional CLI black-box exit-code test
is required beyond the AX endpoint tests. No plugin behavior is introduced, so no plugin
validation command is required.

## Eval Impact

| Surface | Existing coverage | Action | Command / case |
| --- | --- | --- | --- |
| Bundled plugin skills and agents | Eval harness covers product skills and agents, but this slice does not touch them. | No eval rerun required. | None. |
| Maintainer skills | The technical-planning skill is used, not modified. | No eval rerun required. | None. |
| AX local runtime API | Covered by deterministic Bun endpoint tests, not eval harness. | Extend endpoint tests. | `bun test packages/ax/tests/studio-api.test.ts` |
| Viewer Work Board | Covered by viewer unit/check/build and Playwright browser tests, not eval harness. | Extend deterministic and browser coverage. | Viewer commands above. |
| Studio board-state validators | Covered by Node tests and validator command, not eval harness. | Extend model/state guards. | `node --test studio/tools/board-model.test.mjs`; `node studio/tools/check-board-state.mjs` |

No Alexandria eval-harness coverage is required because #415 changes internal Studio Board data,
local runtime API validation, and viewer behavior. It does not change reusable product skills,
agents, prompts, workflows, or eval-backed behavior.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The missing Phase-2 W4 honeydo file contains an extra ruling not in issue #415. | Reconcile if the file appears before implementation. Keep this plan explicit about the source gap. |
| The board contract drifts across AX, viewer, and `studio/plays/board-model.js`. | Update all three copies in the same slice and add matching tests for fallback archive dates and `graduatedAt`. |
| Preserving existing cards on no-cards saves can carry forward bad historical card state. | Limit this behavior to requests that do not submit `cards`; keep submitted card bodies strict and keep `check-board-state.mjs` as the canonical data guard. |
| `graduatedAt` becomes inconsistent with `graduated`. | Normalize on POST, prune stale keys, and make the checked-in state validator reject missing or extra keys. |
| Backfill dates are inferred incorrectly. | Only use the explicit shipped date `2026-06-11` for the three known shipped cards named in the issue; use `created` fallback only for generic legacy archive projection. |
| The live clock still does not move because the dependency is too stable. | Key the clock to the refreshed `board` payload, and prove with a browser test that changes the page clock, triggers a board refresh, and observes archive movement without a full page reload. |
| Error formatting shows raw JSON or hides useful details. | Parse `ViewerHttpError.body` for `error`/`message`, test JSON and plain-text bodies, and fall back to the typed runtime message only when needed. |
| #347 conflicts with this slice on `StudioApp.tsx`. | Land #415 first, then re-run or rebase #347 onto the fixed archive lifecycle. |

## Acceptance And Exit Criteria

- A server-rejected board save shows the server's actual reason, such as
  `invalid board state: play <slug> must have exactly one testing card`, not
  `board save failed`.
- A pure stage, ready, or graduation save with no `cards` in the POST body succeeds even when
  existing active card state is missing a Testing card.
- A submitted invalid `cards` body still returns HTTP 400 and the viewer surfaces the reason.
- `graduatedAt` is persisted as date-only metadata for graduated plays.
- Setting the Archive Date filter to a graduated play's `graduatedAt` shows that play; setting
  another date hides it; clearing the filter shows it again.
- A graduated play is never hidden merely because it is graduated.
- A terminal card whose `terminalAt` is at least 7 days old is in archive, not the live Done lane.
- A terminal card with absent `terminalAt` but date-only `created` at least 7 days old is also
  age-archived by fallback.
- The seeded shipped `done` cards in `studio/plays/board-state.json` carry
  `terminalAt: "2026-06-11"` and archive out of the live Done lane.
- After a board refresh without a full page reload, a card that crossed its 7-day boundary moves
  from Done to archive.
- Newly completed cards get `terminalAt`; re-saving already terminal cards preserves their
  existing `terminalAt`.
- Pinned cards never auto-archive by age.
- `Show archived`, `Reopen`, `Archive now`, `Keep on board`, `Graduate`, and `Restore` continue
  to work.
- Non-terminal cards are not changed by archive derivation.
- All required deterministic verification commands either pass or any environment-only skip is
  recorded with the reason.

## Deferred Follow-Ups

- Extract one shared board contract/helper package to remove the hand-duplicated rules across
  `studio/plays/board-model.js`, `packages/viewer/src/components/studio/boardModel.ts`, and
  `packages/ax/src/effects/studio-api.ts`.
- Add Ledger events for board card lifecycle, archive overrides, graduation, and restore.
- Add a broader historical migration if more old terminal work needs human-reviewed dates.
- Re-run #347 after #415 lands so swimlanes and play-connections consume a working archive
  lifecycle.
