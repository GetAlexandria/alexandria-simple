# Issue 338 - Studio Board Work-Order Cards

Status: draft for approval
Issue: https://github.com/GetAlexandria/alexandria-internal/issues/338
Run ID: 01KVTTEJZ4W76JSCSRCZKWQVBC
Project: The Board
Phase: 1
Tier: must

Linked product/design plans:

- `docs/alexandria/plans/studio-fixes/board-data-model.md`
- `docs/alexandria/plans/studio-fixes/board-project-plan.md`
- `docs/alexandria/plans/studio-fixes/studio-data-model.md`
- `docs/alexandria/plans/studio-fixes/org-model.md`

## Goal

Implement the Phase 1 Studio Board work-order model: the Board has Play cards
for lifecycle stage and Work-order cards for Testing, Improvement, and Bug work.
A work-order card carries its own `open / in-progress / done` status, independent
of the play's `Backlog / Sourced / Designed / Built / Proven / Live` stage.

The director must be able to create, edit, move, and close work-order cards from
the Board; filter the Board to one play; seed Improvement cards from the existing
`improvements.md` backlog; and rely on server-side validation for the new
`cards[]` shape.

## Sources Of Truth

- Root `CLAUDE.md`, `README.md`, and `studio/README.md` define repo and Studio
  boundaries.
- `skills/maintainer/technical-planning/SKILL.md` defines this planning format.
- Issue #338 defines the frozen base work-order contract and acceptance tests.
- GitHub issue comments currently only add Fabro run links; there is no extra
  human review text beyond the issue body.
- `studio/plays/README.md` defines the six play stages and the Board as the
  production-progress source of truth.
- `studio/plays/registry.js` is the catalog identity and division/function source
  consumed by the static Studio pages.
- `studio/plays/board-state.json` is the mutable Board state file shared by the
  browser and agents.

## Scope

- Keep the work inside `studio/` plus this plan. No `packages/ax`,
  `packages/viewer`, `packages/alexandria-plugin`, or hosted product instance
  behavior changes are planned.
- Migrate the play-stage ladder's first stage from the visible label `Empty` to
  `Backlog`. Prefer canonical storage key `backlog`, with a compatibility read
  path for existing `empty` state so old files do not break immediately.
- Extend `studio/plays/board-state.json` with `cards[]` work-order records.
- Enforce the required base card fields on every work-order card:
  `id`, `type`, `status`, `division`, `function`, optional `play`, `priority`,
  `source`, and `created`.
- Allow only the type-specific payload needed by Phase 1:
  `checklist` on `type: "testing"` cards, plus a small human-readable title/body
  payload if implementation confirms the Board cannot present seeded
  `improvements.md` work without it. The required frozen fields remain mandatory.
- Require Testing cards to link a play and enforce exactly one Testing card per
  board-visible play. System-level cards are allowed for Bug and Improvement
  only in this slice.
- Render and edit Work-order cards from `studio/plays/board.html` without adding
  a build step.
- Add a per-play view as a Board projection, for example
  `board.html?play=frame-the-problem`, with optional `type` and `status` facets
  for the small view.
- Seed Improvement cards from `studio/plays/frame-the-problem/improvements.md`
  and seed one Testing checklist card for every play currently appearing on the
  Board.
- Update Studio docs that describe the Board state file and first column label.

## Non-Goals

- Do not build advanced swimlanes, tiers, dependency connections, or cross-card
  graph views.
- Do not emit Ledger events for card create/move/close.
- Do not implement Play Re-sync automatic Catch-to-Bug creation in this slice.
  The schema should not block it later.
- Do not implement a general issue tracker, comments, assignees, due dates, or
  notifications.
- Do not introduce package tooling for the static Studio site.
- Do not write to `docs/alexandria/library/`.
- Do not change reusable plugin agent, product skill, CLI, or Viewer behavior.

## Current Gap

The live Studio Board is still primarily a play-stage kanban:

- `studio/plays/board.html` renders six stage columns using the storage key
  `empty` and visible title `Empty`.
- `studio/plays/board-state.json` stores `stages`, `ready`, and an empty
  `cards` array.
- `studio/site-server.py` already preserves a loose `cards` array across
  stage-only POSTs, but it only validates `id` and a couple optional string
  fields. It does not enforce the issue #338 card contract, status enum,
  division/function fields, one Testing card per play, or stage/status
  separation.
- `board.html` loads `cards` but does not render, edit, move, close, or persist
  work-order card changes.
- The browser `persist()` path posts only `stages` and `ready`, relying on the
  server's preservation merge rather than treating work orders as first-class
  Board state.
- Per-play work views do not exist.
- `studio/plays/frame-the-problem/improvements.md` is still a separate backlog,
  so Improvement work remains outside the Board.

## Architectural Boundaries

- `registry.js` owns catalog identity and division/function declarations.
- `board-state.json` owns mutable Board state: play stage, ready flags,
  work-order status, and work-order priority.
- A Play card's stage and a Work-order card's status are separate axes. Moving a
  work order to `done` must never advance a play stage. Advancing a play stage
  must never close or reopen its work-order cards.
- Keep `site-server.py` as the only persistence endpoint for the static Studio
  Board.
- The server should validate the wire/store shape and enums. Because Python
  should not parse arbitrary `registry.js`, add deterministic Node validation
  that loads `StudioCatalog` and checks that card division/function/play links
  match the catalog.
- Prefer small pure helpers for card normalization, filtering, duplicate Testing
  detection, default priority, and stage-key normalization so they can be tested
  outside the browser.

## Card Contract

Every work-order card must include these required base fields:

```json
{
  "id": "wo-frame-the-problem-001",
  "type": "improvement",
  "status": "open",
  "division": "Product",
  "function": "Insight",
  "play": "frame-the-problem",
  "priority": 20,
  "source": "migrated:studio/plays/frame-the-problem/improvements.md",
  "created": "2026-06-23"
}
```

Rules:

- `type` is one of `testing`, `improvement`, or `bug`.
- `status` is one of `open`, `in-progress`, or `done`.
- `play` is optional for Bug and Improvement, allowing system-level work scoped
  to `division` plus `function`.
- `play` is required for Testing in Phase 1.
- There is exactly one Testing card per play.
- Bug creation defaults to a higher priority than Improvement creation in the
  same play or system scope.
- Migrated `improvements.md` bullets become `type: "improvement"`, never Bug.

Schema note for approval: the issue freezes the base fields above, but it also
requires Testing to be a checklist and Improvements to be seeded from
human-readable markdown bullets. The implementation should keep the base fields
mandatory and allow only narrow payload fields needed to render and edit that
work, such as `checklist` for Testing and a title/body field for visible card
text. Unknown extra fields should be rejected so the shape does not drift.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Board persistence server | `studio/site-server.py` | Accept canonical `backlog` stages, normalize legacy `empty`, validate work-order cards, reject duplicate Testing cards, and persist `cards[]` atomically with stages and ready flags. |
| Board state | `studio/plays/board-state.json` | Store canonical six stages plus seeded `cards[]` with Testing and migrated Improvement cards. |
| Board UI | `studio/plays/board.html` and optional small helper JS | Rename first stage to Backlog; render a Work Orders area; create/edit cards; drag or otherwise move work-order status and priority; close cards as `done`; filter per play/type/status. |
| Catalog/state validation | `studio/tools/check-catalog.mjs`, new `studio/tools/check-board-state.mjs`, optional tests | Validate card links against `StudioCatalog`, enforce one Testing card per board-visible play, validate canonical stage keys and negative fixtures. |
| Existing backlog migration | `studio/plays/frame-the-problem/improvements.md` | Seed its bullets into Improvement cards; leave a pointer/tombstone or otherwise prevent reseeding from stale markdown. |
| Studio docs | `studio/README.md`, `studio/plays/README.md` | Describe Backlog, work-order cards, status vs stage, the per-play view, and the Board state shape. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Bundled Alexandria plugin skills | None | No plugin validation or skill eval rerun required. |
| Maintainer skills | None | This plan uses the planning skill but does not change it. |
| CLI behavior | None | No `packages/ax` black-box CLI tests required. |
| Viewer behavior | None | The Studio static site changes; no `packages/viewer` unit/build/browser validation is required. |
| Studio static Board | Work-order behavior becomes browser-editable and persisted | Add Studio-specific deterministic checks and browser/manual verification. |

## Deterministic Verification

Add and run:

| Area | Command | Why |
|------|---------|-----|
| Board JSON syntax | `python3 -m json.tool studio/plays/board-state.json >/tmp/studio-board-state.json` | Confirms the state file remains valid JSON. |
| Server syntax | `python3 -m py_compile studio/site-server.py` | Catches Python syntax errors in the persistence endpoint. |
| Board page syntax | `node --check studio/plays/board.html` if JS is extracted, otherwise `node --check` on the extracted helper file | Catches plain JavaScript syntax errors where practical. |
| Catalog contract | `node studio/tools/check-catalog.mjs` | Keeps division/function catalog validation green. |
| Board state contract | `node studio/tools/check-board-state.mjs` | Validates canonical stages, card required fields, enums, unique ids, catalog links, one Testing card per play, and migrated Improvement cards. |
| Model unit checks | `node --test studio/tools/board-model.test.mjs` or equivalent | Tests pure helpers for duplicate Testing prevention, status changes not touching stages, default Bug vs Improvement priority, and facet filtering. |

Add negative checks:

- Duplicate `type: "testing"` cards with the same `play` are rejected.
- A Testing card without `play` is rejected.
- A Bug/Improvement card without `play` but with valid `division` and `function`
  is accepted.
- A work-order status change does not mutate `stages`.
- A play stage move does not mutate any work-order `status`.
- Migrating `improvements.md` creates Improvement cards, not Bug cards.
- The first stage is canonical `backlog`; legacy `empty` can be read only for
  migration compatibility and is not written back.

Black-box Studio verification:

```bash
cd studio
python3 site-server.py 8778
```

Then verify in the browser at `http://127.0.0.1:8778/plays/board.html`:

- The first stage column reads Backlog.
- Create an Improvement card for `frame-the-problem`.
- Move it from `open` to `in-progress`.
- Confirm it appears in the cross-studio Board view.
- Open the per-play view for `frame-the-problem` and confirm the same card
  appears there.
- Apply a type/status facet and confirm the small view filters correctly.
- Try to create a second Testing card for `frame-the-problem` and confirm the UI
  prevents it.
- Confirm a server POST with a duplicate Testing card returns HTTP 400.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|--------------------|
| Studio static Board | No eval-harness coverage; current verification is static-site and state-file based | Add deterministic Studio checks and manual browser verification | Commands listed above. |
| Bundled plugin skills/agents | Not touched | No eval rerun | None. |
| CLI | Not touched | No CLI eval or black-box exit-code test | None. |
| Viewer package | Not touched | No Viewer unit/build/browser validation | None. |

No Alexandria eval-harness rerun is required because this slice changes an
internal static Studio management surface, not a bundled plugin skill, agent
prompt, reusable runtime behavior, CLI command, or Viewer package feature.

If implementation expands into `packages/alexandria-plugin`, agents, product
skills, registered workflows, or `packages/ax`, rerun the targeted evals or
black-box CLI tests required by `EVALS.md` before merge.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The frozen base card fields are too narrow to render meaningful migrated Improvement work or a Testing checklist. | Keep the base fields mandatory, document the narrow allowed payload fields, and reject unknown extras. Approval of this plan approves that reconciliation. |
| Stage and status axes get collapsed because both look like board columns. | Render Work-order status lanes separately from Play stage columns; add tests that status changes do not mutate stages and stage moves do not mutate statuses. |
| The `empty` to `backlog` migration breaks older state files or stale browser tabs. | Normalize legacy `empty` on load/POST, then write canonical `backlog`; keep this compatibility path narrowly scoped. |
| Direct JSON edits bypass browser duplicate-Testing prevention. | Enforce duplicate Testing rejection in `site-server.py` and in `check-board-state.mjs`. |
| Server-side division/function validation drifts from `registry.js`. | Let the server enforce shape/enums and let the Node checker load `StudioCatalog` for strict catalog-link validation. Do not create a second source of truth in Python unless a generated artifact is added. |
| Migration from `improvements.md` creates duplicate cards if rerun. | Use stable deterministic ids derived from play/type/source heading/title and tombstone or mark the source file after migration. |
| Bug default priority could make Improvements look like Bugs. | Type is explicit and never inferred from priority. Migration maps all `improvements.md` bullets to Improvement. Add a negative check for this. |
| The Board UI grows too large for a static page. | Keep Phase 1 controls simple: form/modal, status lanes, and query-string filters. Defer advanced tiers and graph views. |

## Implementation Steps

1. Add or extract pure Board model helpers for stage normalization, card
   validation, duplicate Testing detection, default priority, and card filtering.
2. Update `studio/site-server.py` to accept canonical `backlog` stages, normalize
   legacy `empty`, validate the required work-order base fields, reject duplicate
   Testing cards, and persist `cards[]` alongside `stages` and `ready`.
3. Add `studio/tools/check-board-state.mjs` and focused model tests covering the
   contract and negative cases.
4. Migrate `studio/plays/board-state.json` to canonical `backlog` and seed one
   Testing card per board-visible play.
5. Convert `studio/plays/frame-the-problem/improvements.md` into seeded
   Improvement cards with stable ids and status mapping:
   `Backlog -> open`, `In progress -> in-progress`, `Shipped -> done`.
6. Add a tombstone or pointer to `improvements.md` so the Board is the live
   source after migration.
7. Update `studio/plays/board.html` to render Backlog, a Work Orders section,
   create/edit controls, status moves, close-to-done behavior, and per-play
   plus type/status filters.
8. Ensure `persist()` includes the current `cards[]` payload and handles server
   validation errors visibly.
9. Update Studio docs that describe the Board, the state file, and the per-play
   work view.
10. Run deterministic checks and the browser verification flow.

## Acceptance / Exit Criteria

1. A director can create, edit, move, and close Testing, Improvement, and Bug
   work-order cards from the Board.
2. Every board-visible play has exactly one Testing card.
3. Creating a second Testing card for the same play is prevented in the UI and
   rejected by the server.
4. Work-order `status` is persisted independently from play `stage`.
5. Moving a work-order card does not change its play's stage.
6. Moving a Play card between stages does not change any work-order status.
7. A per-play Board view filters all cards to one play.
8. The per-play small view supports `type` and `status` facets.
9. Existing `frame-the-problem/improvements.md` content is seeded as
   Improvement cards, not Bug cards.
10. Bug creation defaults above Improvement creation in priority ordering.
11. System-level Bug and Improvement cards can exist with `division` plus
    `function` and no `play`.
12. The first play-stage column reads Backlog, not Empty.
13. `board-state.json` persists `cards[]` with the required frozen base fields.
14. `site-server.py` accepts the new shape, rejects invalid card payloads, and
    accepts the canonical six stages.
15. Deterministic checks and the Studio browser verification flow pass.

## Deferred Follow-Ups

1. Advanced work-order swimlanes, tiers, dependency connections, and graph views.
2. Ledger events for card creation, edit, move, and close.
3. Play Re-sync Catch-to-Bug auto-logging.
4. Generated Testing checklist seeding from `risk-map.md` and fixture state.
5. A generated catalog contract artifact if server-side Python must strictly
   validate division/function without duplicating `registry.js`.
6. Wider migration or deletion of retired Improvement backlog files if more are
   added later.
7. Hosted-product integration or Viewer package integration for the Studio Board.
