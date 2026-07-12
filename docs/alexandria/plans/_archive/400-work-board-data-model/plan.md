# Issue 400 - Work Board Data Model: wont-do, Archive, Graduate

Status: draft for approval
Issue: https://github.com/GetAlexandria/alexandria-internal/issues/400
Run ID: 01KVXMJGBKEZJQBAC8QKX91V1T
Project: Studio Work Board
Phase: L6a of L6
Tier: should
Blocked by: none
Blocks: L6b Work Board rebuild

Linked plans and decisions:

- `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`
- `docs/alexandria/plans/studio-fixes/board-surface-decision.md`
- `docs/alexandria/plans/studio-fixes/board-data-model.md`
- `docs/alexandria/plans/studio-fixes/board-project-plan.md`
- `docs/alexandria/plans/338-studio-board-work-orders/plan.md`
- `docs/alexandria/plans/367-studio-board-viewer/plan.md`

Planning note: issue #400 names `docs/alexandria/plans/studio-fixes/work-board-redesign.md`
as the ruled spec. That file is not present in this checkout at planning time. This plan uses
the issue body, the GitHub issue comments, and the adjacent Studio Board plans above as the
available source set. If `work-board-redesign.md` lands before implementation starts, reconcile
this plan against it before editing implementation files.

## Goal

Freeze the L6a data contract for the Studio Work Board before the L6b UI rebuild.

The Board must be able to represent dismissed terminal work with `status: "wont-do"`, track
when cards enter or leave terminal status through `terminalAt`, derive one searchable archive
for terminal work and graduated plays, and persist repeated board writes idempotently. The
archive boundary is computed from data at read time; there is no sweep job and no stored
archive lane.

## Sources Of Truth

- Root `CLAUDE.md` and `README.md` define the monorepo boundaries and state that the viewer
  `/studio` tab is the canonical Studio product surface.
- `studio/README.md` defines `studio/plays/board-state.json` as the data the viewer and
  agents share for play stage, ready flags, and work-order cards.
- `packages/ax/CLAUDE.md` and `packages/ax/README.md` define AX as the deterministic
  TypeScript/Effect runtime API surface, with black-box tests for stable behavior.
- `packages/viewer/README.md` defines the viewer runtime boundary:
  local `/api/*` fetch, Schema decode, typed Effect errors, and React adapters.
- `skills/maintainer/technical-planning/SKILL.md` defines this planning format.
- `EVALS.md` defines when eval-harness reruns are required.
- Issue #400 defines the L6a contract and acceptance criteria. The only GitHub issue comment
  at planning time is the Fabro local run link for this run, with no additional human
  plan-review text.
- `phase-2-build-plan.md` defines L6 as the single-owner Work Board lane and explicitly asks
  to spec the model, statuses, archive, and naming before the rebuild.
- `board-surface-decision.md` resolves the surface question: the viewer is canonical, retired
  `studio/*.html` and `site-server.py` must not be revived.
- Prior plans #338 and #367 show the existing work-order card contract and the viewer/AX port
  that already shipped `cards[]`, `backlog`, and merge-by-id semantics.

## Scope

- Extend the work-order card status enum from `open | in-progress | done` to
  `open | in-progress | done | wont-do`.
- Add optional card fields:
  - `terminalAt`: `YYYY-MM-DD`, set when a card enters `done` or `wont-do`, cleared when it
    leaves terminal status.
  - `archived`: boolean override that forces the card into the derived archive.
  - `pinned`: boolean override that exempts the card from automatic age-based archive.
- Add optional board field `graduated: string[]` for play slugs explicitly graduated out of
  active stages.
- Add pure Board model helpers for terminal status, status transition normalization,
  archive derivation, archive partitioning, card merge by id, play graduation, and restore.
- Update AX `/api/studio/board` validation and persistence so it accepts the new fields,
  normalizes terminal timestamps on card status changes, preserves or normalizes `graduated`,
  keeps `cards[]` unique by id, and prevents a slug from appearing in both `stages` and
  `graduated`.
- Update the viewer Studio runtime schema so `/api/studio/registry` can decode boards that
  include `wont-do`, the new card fields, and `graduated`.
- Update Studio validators and tests under `studio/tools/` so direct file edits of
  `studio/plays/board-state.json` are checked against the new contract.
- Update `studio/plays/board-state.json` only for contract documentation and safe additive
  shape, for example the top-level comment and an empty `graduated` list if chosen during
  implementation.

## Non-Goals

- Do not touch `packages/viewer/src/components/studio/StudioApp.tsx`, `BoardView`, or other
  Work Board UI in this issue. L6b owns the rebuild.
- Do not add a visible archive view, archive lane, graduate button, restore button, status
  control, or other UI.
- Do not add a scheduled job, timer, cron, background process, or write-time sweep for archive.
- Do not create a second persisted archive file or persist an archive partition. `graduated`
  is stored because it is an explicit play disposition; card archive membership is derived.
- Do not emit Ledger events for card disposition or graduation in this issue.
- Do not change bundled Alexandria plugin skills, agents, or workflows.
- Do not write to `docs/alexandria/library/`.
- Do not change unrelated L1-L5 Studio surfaces.

## Linked Product-Plan Summary

L6 in `phase-2-build-plan.md` says the Work Board needs one model pass before the UI rebuild:

- Work-order status changes currently duplicate cards instead of moving them.
- There is no dismissed terminal state distinct from `done`.
- Live plays accumulate forever and need a graduate-out-of-board path.
- Done or dismissed work should leave the active board into an archive instead of living
  forever in active views.
- The Director ruling is one archive, disposition as a label, and automatic archive after a
  week by derivation rather than by a background sweep.

This L6a slice freezes the store and helper behavior that L6b can render. It intentionally
does not redesign the Work Board screen.

## Current Implementation Gap

- `packages/viewer/src/app/runtime/studio.ts` defines `StudioBoardCardSchema.status` as
  `open | in-progress | done` and rejects `wont-do`. It has no schema fields for
  `terminalAt`, `archived`, `pinned`, or `graduated`.
- `packages/ax/src/effects/studio-api.ts` defines `WORK_ORDER_CARD_STATUSES` as
  `open | in-progress | done`; `ALLOWED_CARD_FIELDS` rejects the new fields; the board write
  path has no terminal timestamp logic and no `graduated` handling.
- AX already merges cards by id, but there is no regression case proving a status change and
  repeated persist produce exactly one card with that id under the new lifecycle fields.
- `studio/plays/board-model.js` has pure helpers for stage normalization, filtering, status
  update, and testing-card seeding, but no terminal/disposition helpers, archive derivation,
  graduate, restore, or idempotent board normalization helper.
- `studio/tools/check-board-state.mjs` and `studio/tools/board-model.test.mjs` validate the
  current base model only. They reject or ignore the new contract.
- `studio/plays/board-state.json` documents `open/in-progress/done` work-order status and has
  no `graduated` field.

## Architectural Boundaries

- `studio/plays/registry.js` remains the source of truth for play identity and division/function
  filing. Graduated plays stay in the registry.
- `studio/plays/board-state.json` remains the mutable Board store for active play stages, ready
  flags, explicit graduated play slugs, and work-order card records.
- AX owns the `/api/studio/board` write contract. The viewer reads and writes Board data only
  through AX runtime APIs.
- Viewer runtime schemas stay narrow and browser-facing. AX and `studio/tools/` enforce the
  stricter store contract.
- A play stage and a work-order status remain independent axes.
- Archive membership for cards is a projection, not stored state. The only stored archive-like
  play field is `graduated` because graduation is an explicit Director action.
- Date math must be deterministic. Treat date-only values as UTC calendar dates and allow pure
  helpers to receive a fixed `now` for tests.
- The archive window is one configurable value with default `7` days. It is not a per-card
  field.

## Data Contract

Work-order card additions:

```json
{
  "id": "wo-frame-the-problem-testing",
  "type": "testing",
  "status": "wont-do",
  "terminalAt": "2026-06-24",
  "archived": false,
  "pinned": false,
  "division": "Product",
  "function": "Insight",
  "play": "frame-the-problem",
  "priority": 15,
  "source": "board:director",
  "created": "2026-06-24"
}
```

Board additions:

```json
{
  "ready": ["back-of-house-walk"],
  "stages": {
    "backlog": [],
    "sourced": [],
    "designed": [],
    "built": [],
    "proven": [],
    "live": []
  },
  "graduated": ["frame-the-problem"],
  "cards": [],
  "updated": "2026-06-24"
}
```

Validation rules:

- `status` is one of `open`, `in-progress`, `done`, or `wont-do`.
- `done` and `wont-do` are terminal. `open` and `in-progress` are non-terminal.
- `terminalAt`, when present, is `YYYY-MM-DD`.
- `archived`, when present, is boolean.
- `pinned`, when present, is boolean.
- Missing `terminalAt` is valid and means the card is not auto-archived by age.
- Missing `archived` and missing `pinned` behave as `false`.
- `graduated`, when present, is an array of unique non-empty slug strings.
- A slug must not persist in both any `stages.*` list and `graduated`.
- `ready` remains a marker only for active staged slugs; graduating a slug removes its ready
  marker.

Status transition rules:

- Non-terminal -> terminal sets `terminalAt` to today's `YYYY-MM-DD` unless the posted card
  already carries a valid `terminalAt`.
- Terminal -> terminal preserves existing `terminalAt` when present. Changing `done` to
  `wont-do`, or the reverse, changes disposition without resetting archive age.
- Terminal -> non-terminal clears `terminalAt`.
- New cards created directly in a terminal status receive `terminalAt` unless already supplied.
- Existing back-compat terminal cards with absent `terminalAt` stay valid and are not
  age-archived unless a later transition supplies a timestamp.

## Derived Archive Rule

Add a pure helper with this behavior:

```text
isTerminal(card) = card.status === "done" || card.status === "wont-do"
inArchive(card) = card.archived === true
                || (isTerminal(card)
                    && card.pinned !== true
                    && card.terminalAt exists
                    && ageInDays(now, card.terminalAt) >= windowDays)
windowDays default = 7
```

Rules and edge cases:

- `archived: true` forces archive membership regardless of age or `pinned`.
- `pinned: true` only exempts the automatic age-based sweep. It does not override
  `archived: true`.
- Missing or invalid `terminalAt` is treated as not age-archived by the derivation. Invalid
  `terminalAt` is still rejected by validators when present.
- Age is computed from date-only UTC days, not local wall-clock hours.
- Tests must pass a fixed `now`.

The "one archive" projection for L6b should be derived as:

- archived cards: `cards.filter(inArchive)`
- archived plays: `graduated` slugs joined to `registry.js`

No `archive` array is added to `board-state.json`.

## Graduation Contract

Graduating a play:

- removes the slug from every `stages` column
- removes the slug from `ready`
- adds the slug to `graduated` once
- leaves the play in `registry.js`
- leaves work-order cards linked to that play intact

Restoring a play:

- removes the slug from `graduated`
- inserts the slug into `stages.live` by default
- remains idempotent if repeated
- does not recreate or remove work-order cards

Persistence normalization should preserve existing `graduated` when a POST omits it. When a POST
includes `graduated`, that list is authoritative after de-duplication and stage cleanup.

## Touch Map

| Surface | Files / areas | Planned behavior change |
| --- | --- | --- |
| Studio Board model helpers | `studio/plays/board-model.js` | Add status constants, terminal helpers, status transition normalization, archive derivation, archive partition, merge-by-id normalization, graduate, and restore helpers. |
| Studio model tests | `studio/tools/board-model.test.mjs` | Add deterministic tests for `wont-do`, `terminalAt` set/clear, fixed-now archive derivation, archived/pinned overrides, idempotent merge, graduate, and restore. |
| Studio state validator | `studio/tools/check-board-state.mjs` | Accept and validate new card fields and `graduated`; reject duplicate card ids and staged/graduated slug overlap; verify graduated slugs resolve in `registry.js`. |
| Persisted board data | `studio/plays/board-state.json` | Update the comment and, if implementation chooses, add `graduated: []` to make the new optional board field explicit. Preserve current active board content. |
| AX Studio API | `packages/ax/src/effects/studio-api.ts` | Accept `wont-do`, optional card lifecycle fields, and `graduated`; normalize status transitions; keep merge-by-id idempotent; prevent slug overlap between `stages` and `graduated`; preserve top-level compatibility fields. |
| AX endpoint tests | `packages/ax/tests/studio-api.test.ts` | Add endpoint coverage for schema acceptance, terminal timestamp lifecycle, idempotent card persist, graduated normalize/restore, and back-compat boards. |
| Viewer Studio runtime | `packages/viewer/src/app/runtime/studio.ts` | Decode `wont-do`, optional card lifecycle fields, and `graduated`; keep `saveStudioBoard()` compatible with existing callers. |
| Viewer runtime tests | New or existing test near `packages/viewer/src/app/runtime/studio.test.ts` | Decode back-compat board and new board shape; verify save payload can include new fields without UI work. |
| Viewer browser fixture | `packages/viewer/tests/serve-viewer-fixture.ts` | Allow fixture board payloads with new fields so existing `/studio?tab=board` browser smoke does not regress decode/persist. |
| Work Board UI | `packages/viewer/src/components/studio/StudioApp.tsx` | Out of scope. Do not edit in L6a. |

## Affected Behavior Surfaces

| Surface | Behavior shift | Downstream docs/tests/evals |
| --- | --- | --- |
| AX local runtime API | `/api/studio/board` accepts and normalizes the L6a data contract. | Extend `packages/ax/tests/studio-api.test.ts`; no public CLI command output changes. |
| Viewer Studio runtime schema | The viewer can decode boards with `wont-do`, card lifecycle fields, and `graduated`. | Add/extend runtime schema tests and run Viewer check/build. |
| Studio file validators | Direct edits to `board-state.json` are checked against the new contract. | Extend `studio/tools/board-model.test.mjs` and `check-board-state.mjs`. |
| Viewer Work Board UI | No intentional behavior change in L6a. | Existing browser smoke may run to catch decode regressions; UI rebuild deferred to L6b. |
| Bundled plugin agents and skills | None. | No plugin validation or eval rerun. |
| CLI commands | No command contract changes. | No CLI black-box exit-code tests beyond AX endpoint tests. |

## Implementation Steps

1. Update `studio/plays/board-model.js`.
   - Add `wont-do` to `STATUS_DEFS` / `STATUS_KEYS`.
   - Add `TERMINAL_STATUS_KEYS` and `DEFAULT_ARCHIVE_WINDOW_DAYS`.
   - Add `isTerminalStatus()`, `isTerminalCard()`, `normalizeCardStatusTransition()`,
     `inArchive()`, `partitionCardsByArchive()`, `mergeCardsById()`, `graduatePlay()`, and
     `restoreGraduatedPlay()`.
   - Keep helper inputs plain JSON so validators, AX tests, and future L6b UI can reuse the
     rules without React coupling.

2. Add focused model tests in `studio/tools/board-model.test.mjs`.
   - Validate `wont-do` is accepted.
   - Validate terminal timestamp set/clear behavior.
   - Validate `inArchive()` using fixed `now` for inside-window, past-window, `archived: true`,
     and `pinned: true`.
   - Validate merge-by-id replaces a changed card rather than appending a duplicate, and is a
     no-op when repeated.
   - Validate graduate removes from all stages and ready, adds one `graduated` entry, and restore
     moves the slug back to `live`.

3. Update AX board validation and persistence.
   - Extend status and allowed-field constants.
   - Validate optional `terminalAt`, `archived`, and `pinned`.
   - Add `graduated` normalization with duplicate rejection or deterministic de-duplication.
   - Normalize `ready` after graduation so a graduated slug cannot retain a ready marker.
   - During card merge, compare existing and posted status by id and apply terminal timestamp
     rules.
   - Keep current stale-tab behavior: posted card ids win, unknown on-disk card ids are kept,
     and repeated writes produce the same single card per id.

4. Update AX endpoint tests.
   - Cover new schema acceptance and back-compat boards without new fields.
   - Cover `done` and `wont-do` timestamp set, reopen clear, terminal-to-terminal preserve.
   - Cover archive fields are validated but not materialized into a stored archive list.
   - Cover status-change persist has exactly one card with that id, including a repeated POST.
   - Cover graduate and restore through whole-board POSTs.
   - Cover no slug can persist in both `stages` and `graduated`.

5. Update viewer runtime schema and tests.
   - Extend `StudioBoardCardSchema` and `StudioBoardSchema`.
   - Keep `graduated` optional for back-compat.
   - Add a runtime schema test for old boards and new boards.
   - Keep `saveStudioBoard()` source-compatible; only extend its accepted payload type if needed.

6. Update Studio state validation and sample board state.
   - Update `check-board-state.mjs` to validate new card fields and `graduated`.
   - Verify graduated slugs are present in `registry.js`, even though they are absent from stages.
   - Update `board-state.json` comment to document `wont-do`, terminal fields, archive derivation,
     and `graduated`.
   - Avoid changing active board content except for safe additive contract fields.

7. Run validation and fix regressions inside the data/model slice only.
   - If a test failure points at `StudioApp.tsx` UI assumptions, prefer schema/model compatibility
     over UI edits and record remaining UI work for L6b.

## Deterministic Verification

Required commands for implementation:

```bash
node --test studio/tools/board-model.test.mjs
node studio/tools/check-board-state.mjs
bun test packages/ax/tests/studio-api.test.ts
bun test packages/viewer/src/app/runtime/studio.test.ts
pnpm --filter @alexandria/ax run typecheck
pnpm --filter @alexandria/viewer run check
pnpm --filter @alexandria/viewer run build
```

Browser smoke:

```bash
pnpm --filter @alexandria/viewer run test:e2e -- --grep "Studio Board renders and persists work-order cards"
```

The browser smoke is not for new UI behavior; it catches accidental decode or fixture regressions
caused by the data contract change. If Playwright is unavailable in the implementation
environment, record that and keep the unit/API/model checks as the merge gate.

No new CLI command behavior is introduced, so no additional CLI black-box exit-code test is
required beyond the AX endpoint tests.

## Eval Impact

| Surface | Existing coverage | Action | Command / case |
| --- | --- | --- | --- |
| Bundled plugin skills and agents | Eval harness exists for product skills and agents, but this slice does not touch them. | No eval rerun required. | None. |
| Maintainer skills | This plan uses the technical-planning skill but does not change it. | No eval rerun required. | None. |
| AX runtime API | Covered by deterministic Bun tests, not eval harness. | Extend endpoint tests. | `bun test packages/ax/tests/studio-api.test.ts` |
| Viewer runtime schema | Covered by deterministic unit/check/build and browser smoke. | Add schema tests. | Viewer commands above. |
| Studio file validators | Covered by Node tests and validator command. | Extend tests. | `node --test studio/tools/board-model.test.mjs`; `node studio/tools/check-board-state.mjs` |

No Alexandria eval-harness coverage is required because L6a changes an internal Studio data
model, local runtime API validation, and viewer decode contract. It does not change reusable
product skills, agents, prompts, workflows, or eval-backed behavior.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The missing `work-board-redesign.md` contains an extra ruling not present in issue #400. | Reconcile this plan against that file if it appears before implementation. Keep this plan explicit about assumptions from the issue body. |
| Timestamp normalization mutates old `done` cards that intentionally lack `terminalAt`. | Only set `terminalAt` when a posted/new card enters terminal status. Preserve stage-only posts and existing terminal cards without timestamps. |
| `pinned` and `archived` precedence is ambiguous. | Encode the documented formula exactly: `archived: true` wins; `pinned` only blocks automatic age-based archive. Add tests for both. |
| Whole-board POSTs can create disagreement between `stages`, `ready`, and `graduated`. | Centralize board normalization in helpers and endpoint tests: graduated slugs are removed from stages and ready; restore removes from `graduated` and adds to `live`. |
| Merge-by-id fixes duplication in AX but future UI code reintroduces duplication. | Put idempotency in pure helpers and AX endpoint tests so L6b reuses a tested contract instead of hand-rolling card relocation. |
| Viewer runtime becomes stricter than direct board-state compatibility. | Keep new fields optional and add explicit back-compat decode tests. |
| Archive derivation uses local time and flakes around midnight or DST. | Treat `YYYY-MM-DD` as UTC date-only and pass fixed `now` in tests. |
| L6a leaks into UI rebuild work. | Keep `StudioApp.tsx` out of the touch map. Any visible controls, archive lists, or layout changes are deferred to L6b. |

## Acceptance And Exit Criteria

- Viewer and AX schemas validate `status: "wont-do"`, optional `terminalAt`, optional
  `archived`, optional `pinned`, and optional board `graduated`.
- A board with none of the new fields still validates and decodes.
- Setting a card to `done` or `wont-do` records `terminalAt`; moving it back to `open` or
  `in-progress` clears `terminalAt`.
- `inArchive()` matches the documented rule at a fixed `now`, including inside-window,
  past-window, `archived: true`, and `pinned: true` cases.
- Persisting a status change yields exactly one card with that id; persisting the same board
  again remains a no-op for duplicates.
- Graduating a play removes its slug from every stage and from `ready`, adds it once to
  `graduated`, and leaves it resolvable through `registry.js`.
- Restoring a play removes it from `graduated` and places it in `stages.live`.
- No slug persists in both `stages` and `graduated`.
- Existing `open`, `in-progress`, and `done` flows remain valid.
- No Work Board UI ships in this issue.
- All required deterministic verification commands either pass or any environment-only skips are
  recorded with the reason.

## Deferred Follow-Ups

- L6b renders active vs archive projections, status/disposition labels, archive controls,
  graduate/restore controls, and the rebuilt Work Board interaction model.
- Ledger events for board card lifecycle and play graduation remain future work.
- A future migration may backfill `terminalAt` for old `done` cards if the Director wants old
  terminal work to age into the archive; L6a intentionally avoids implicit historical sweeps.
- A future config surface may expose the archive window. L6a provides a single defaulted helper
  option rather than a UI or per-card setting.
