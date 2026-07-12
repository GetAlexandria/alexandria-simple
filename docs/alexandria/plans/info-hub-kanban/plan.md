# Info Hub Kanban Board — prototype plan

Port the PlayMaker Studio Work Board (the bottom half of the Studio Board —
work orders, not the play tracker) into the Alexandria viewer's Info Hub tab.
Prototype branch: `danversfleury/alexandria-kanban-board`, to share with Jess.

## Scope

**In:** the work-order kanban only — cards with open / in-progress / done
lanes, checklists, priorities, an archive shelf, a card detail modal, and an
add/edit form; a board-state file agents read and edit directly; GET/POST API
on the ax viewer server; the board mounted at the Info Hub tab (`/info`).

**Out (for now):** the play tracker (`stages`/`ready`/`graduated` — Alexandria
has no plays), the future library-operations flow board, drag-and-drop (the
PMS board uses discrete move buttons; keep that), SSE live updates, a
standalone CI validator script.

## Source material (PMS)

- Data: `studio/plays/board-state.json` — the `cards` array only.
- Browser model: `packages/pms/viewer/src/components/studio/boardModel.ts`
  (terminal-status rules, 7-day archive window, priority sort/sift) —
  work-order-only already, portable nearly verbatim, with its test file
  `boardModel.test.ts`.
- UI: the "Work Orders" section of
  `packages/pms/viewer/src/components/studio/StudioApp.tsx` (~1079–1348),
  card detail modal (~987–1078), add/edit form (~1536+).
- Server validation: `packages/pms/src/server/studio-api.ts` —
  `validateBoardCards`, `mergeBoardCards`, `normalizeCardStatusTransition`,
  `writeJsonAtomic` (~673–875).

## Data contract

File: `docs/alexandria/info-hub/board-state.json` — **git-tracked shared
state**, exactly like the PMS board ("Agents edit this file directly; the
Board page persists here" goes in its `comment` field). It is workspace data,
not per-machine runtime state (`.runtime/`) and not config (`.alexandria/`),
and it never touches the Ledger or `docs/alexandria/library/`.

```json
{
  "comment": "Info Hub work board … agents edit this file directly; the Info Hub board page persists here.",
  "updated": "YYYY-MM-DD",
  "cards": [
    {
      "id": "wo-<slug>",
      "type": "task | improvement | bug | testing",
      "status": "open | in-progress | done | wont-do",
      "area": "optional free-form string (e.g. library, viewer, runtime, ops)",
      "priority": 15,
      "source": "board:director | agent:<name> | seed:<ref>",
      "created": "YYYY-MM-DD",
      "title": "…",
      "detail": "…",
      "checklist": [{ "done": false, "text": "…" }],
      "terminalAt": "YYYY-MM-DD",
      "archived": false,
      "pinned": false
    }
  ]
}
```

Deltas from PMS: no `play` field and no one-testing-card-per-play invariant
(no plays); `division`/`function` replaced by one optional `area` string
(Alexandria has no org catalog); new `task` type; `checklist` allowed on any
type. Kept: lower priority = more urgent (defaults bug 10, task/testing 15,
improvement 20); `terminalAt` auto-set on done/wont-do; 7-day archive window
with `archived`/`pinned` overrides; lanes open / in-progress / done with
wont-do folded into the done lane.

## Lane A — ax server (packages/ax)

- `src/domain/paths.ts`: `infoHubDirForWorkspacePath` /
  `infoHubBoardPathForWorkspacePath` → `<workspace>/info-hub/board-state.json`.
- New module `src/effects/info-hub-board.ts`: card validation (allowed
  fields, required fields, id uniqueness, enums, date patterns, checklist
  shape), merge-by-id with status-transition normalization, default empty
  board when the file is missing, atomic write (tmp + rename).
- `src/effects/runtime-server.ts`: `GET /api/info-hub/board` and
  `POST /api/info-hub/board` in the existing if-chain, POST guarded by the
  shared `mutationSemaphore`, modeled on the `/api/sources` handlers.
- Merge semantics (same as PMS): POST body `{ cards }` merges into the
  on-disk set by `id`; cards not posted are preserved; removal is
  wont-do + archive, not deletion.
- Tests following existing runtime-server/effect test conventions in
  `packages/ax` (temp dirs must `realpathSync` on macOS).

## Lane B — viewer UI (packages/viewer)

- `src/app/runtime/`: schemas + client fns `getInfoHubBoard` /
  `saveInfoHubBoard` in the existing Effect-boundary style (Effect stays in
  `src/app/runtime/*`; components get plain props/callbacks via a hook,
  e.g. `hooks/useInfoHubBoard.ts`).
- `src/components/library/infohub/`: `boardModel.ts` (port of the PMS one,
  minus play coupling) + `boardModel.test.ts`; `InfoHubBoardView.tsx` with
  three lanes, type/status/priority filters, card detail modal, add/edit
  form, archive shelf; discrete status buttons (Start / Close / Won't do /
  Reopen / Archive now / Keep on board / Edit), no drag-and-drop.
- Mount: replace `<InfoHubPlaceholder />` at `LibraryBrowserApp.tsx:787`;
  keep a runtime-unavailable fallback state.
- Styling: the viewer's dark cave/amber brand — `--viewer-canvas-*` tokens,
  `font-display` serif titles, `raven-kb-*` band/subject precedent in
  `global.css` — **not** the PMS hex palette.
- Append every new test file to the enumerated `test` script in
  `packages/viewer/package.json` (whitelist; new files are silently skipped
  otherwise).

## Seed data

Populate `docs/alexandria/info-hub/board-state.json` with ~8 real Alexandria
work cards spread across lanes so the shared prototype renders a live-looking
board.

## Verification

Build the viewer (`pnpm --filter @alexandria/viewer run build`), run the ax
server from this checkout (`bun packages/ax/src/cli/main.ts start viewer`),
exercise GET/POST `/api/info-hub/board`, drive the Info Hub tab in a browser,
and confirm an agent-side direct file edit shows up on reload.

## Follow-ups (explicitly not in this slice)

Library-operations flow board; a play-tracker-equivalent top board when
Alexandria has play-like units; a `check-board-state`-style repo validator;
SSE push so the board updates without reload; extracting one shared board
model instead of the PMS/Alexandria twin copies.
