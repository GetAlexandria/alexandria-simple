# Issue 367 - Studio Board Viewer Work-Order Cards

Status: draft for approval
Issue: https://github.com/GetAlexandria/alexandria-internal/issues/367
Run ID: 01KVV6TFM7WYNJQ73P46TRR76E
Project: The Board
Phase: surface correction
Tier: must

Linked plans and decisions:

- `docs/alexandria/plans/studio-fixes/issue-plan.md`
- `docs/alexandria/plans/studio-fixes/board-surface-decision.md`
- `docs/alexandria/plans/studio-fixes/org-model.md`
- `docs/alexandria/plans/338-studio-board-work-orders/plan.md`

## Goal

Move the Phase 1 Studio Board work-order behavior from the retired `:8778`
surface into the canonical viewer `/studio` Board tab.

The viewer Board must render the six play lifecycle stages with `backlog` as the
first stage, show and author Testing, Improvement, and Bug work-order cards, and
persist those card changes through `POST /api/studio/board` into
`studio/plays/board-state.json`. Work-order `status` remains independent from a
play's lifecycle `stage`.

## Sources Of Truth

- Root `CLAUDE.md` and `README.md` define the canonical package map and state
  that `/studio` in the viewer is the product surface.
- `packages/ax/CLAUDE.md` and `packages/ax/README.md` define AX as the
  deterministic TypeScript/Effect CLI/runtime API surface, with black-box tests
  for stable behavior.
- `packages/viewer/README.md` defines the viewer runtime boundary:
  `/api/*` fetch, Schema decode, typed runtime errors, React hook/component
  adapters.
- `skills/maintainer/technical-planning/SKILL.md` defines this plan format.
- `EVALS.md` defines when eval-harness reruns are required.
- Issue #367 freezes the card contract and acceptance criteria. The only
  GitHub issue comment at planning time is the Fabro run link, with no extra
  human review feedback.
- `board-surface-decision.md` resolves the surface question: the viewer is
  canonical; `studio/*.html` and `site-server.py` are retired and should be used
  only as porting reference until #368 deletes them.
- `studio/plays/board-state.json` is the single mutable store for play stages,
  ready flags, and `cards[]` work orders.

## Scope

- Update `packages/ax/src/effects/studio-api.ts` so `/api/studio/board` accepts
  canonical `backlog` stages, accepts legacy `empty` as an alias for `backlog`,
  validates `cards[]`, merges posted cards by id over on-disk cards, and writes
  atomically.
- Extend `packages/ax/tests/studio-api.test.ts` with the card validation,
  merge, stale-tab preservation, duplicate Testing, malformed-card, stage-only
  preservation, and `empty` alias cases previously covered only around
  `studio/site-server.py`.
- Extend the viewer Studio runtime schema and save operation in
  `packages/viewer/src/app/runtime/studio.ts` so `cards[]` is decoded and
  optionally posted.
- Update `packages/viewer/src/components/studio/StudioApp.tsx`, or a narrowly
  extracted board component/helper next to it, so the Board tab renders and
  edits work-order cards in the viewer.
- Keep the first Board column labeled `Backlog` and make current backlog plays
  visible in it.
- Add a per-play work-order view in the Board tab. The view filters a play's
  Testing, Improvement, and Bug cards and groups them by card status.
- Add viewer browser coverage using the existing fixture server for backlog
  rendering, work-order render, card authoring, status move, reload
  persistence, and duplicate Testing UI prevention.
- Use the retired `studio/plays/board.html`, `board-ui.js`,
  `board-model.js`, and `site-server.py` only as behavioral and visual
  references. Do not serve `:8778` as verification for this slice.

## Non-Goals

- Do not implement #347 Board-advanced behavior: swimlanes, tiers,
  connections, graph views, or ledger-backed cards.
- Do not delete retired `:8778` files. That is #368 after #366 and #367 merge.
- Do not write to `docs/alexandria/library/`.
- Do not change bundled Alexandria plugin skills, agents, play workflows, or
  plugin validation behavior.
- Do not turn the Board into a generic issue tracker with comments, assignees,
  due dates, or notifications.
- Do not collapse work-order status into play stage, or infer one axis from the
  other.
- Do not depend on the full Catalog viewer work from #366 being present. Use
  available rung `division`/`function` data and gracefully consume a future
  `divisions` payload if it exists.

## Linked Product-Plan Summary

The surface-correction track in `studio-fixes/issue-plan.md` says Phase 1's
Catalog and Board data/logic were sound but rendered into the wrong surface.
For #367, the port target is the viewer `/studio` Board tab:

- render work-order cards in the viewer Board tab
- add card authoring to `/api/studio/board`
- port `merge_cards` and `validate_cards` semantics from `site-server.py`
- fix the old `empty` stage vocabulary by making `backlog` canonical

`board-surface-decision.md` is resolved: the viewer is canonical, the retired
HTML/Python surface is not a product surface, and #368 will delete it after the
viewer ports land.

## Current Implementation Gap

AX endpoint:

- `packages/ax/src/effects/studio-api.ts` still declares
  `STUDIO_BOARD_STAGES = ["empty", "sourced", "designed", "built", "proven",
  "live"]`.
- `boardWriteResponse()` validates only `stages` and optional `ready`, then
  writes `{ ...existing, stages, ready, updated }`.
- It preserves on-disk `cards` only accidentally through the spread. It cannot
  author cards, validate cards, merge stale card payloads, or return card
  validation errors.
- It writes directly with `writeFile`, while the reference server writes through
  a temp file and replace.

Viewer runtime and UI:

- `StudioBoardSchema` decodes `ready`, `stages`, and `updated`, but drops
  `cards`.
- `saveStudioBoard()` posts only `{ ready, stages }`.
- `StudioApp.tsx` uses `STAGE_ORDER = ["empty", ...]`, labels the first column
  `Empty`, and builds `cloneStages()` from that old vocabulary.
- The Board tab renders only play-stage cards and ready markers. There is no
  work-order roll-up, per-play work view, card create/edit form, status move, or
  close-to-done action.

Retired reference surface:

- `studio/site-server.py` already has the desired `normalize_stages()`,
  `validate_cards()`, and `merge_cards()` behavior for the retired endpoint.
- `studio/plays/board-ui.js` shows the desired functional treatment:
  status lanes, type badge, priority chip, scope line, checklist for Testing,
  status buttons, edit button, and duplicate Testing UI prevention.
- These files are reference only. Implementation belongs in AX and viewer.

## Architectural Boundaries

- `studio/plays/board-state.json` remains the single store for Board state.
- AX owns the local HTTP write contract for `/api/studio/board`.
- The viewer reads and writes Board state only through AX runtime APIs. It must
  not read or write workspace files directly.
- Viewer schemas stay narrow and browser-facing. AX remains canonical for the
  endpoint/store contract.
- The Board has two card kinds:
  - Play cards carry lifecycle `stage`: `backlog`, `sourced`, `designed`,
    `built`, `proven`, `live`.
  - Work-order cards carry their own `status`: `open`, `in-progress`, `done`.
- Stage and status are independent axes. A stage move must preserve all card
  statuses; a card status move must preserve all stages.
- `cards` is optional on POST. If omitted, on-disk cards are preserved
  unchanged. If present, posted ids win and unknown on-disk ids are kept.
- Card deletion is not in this slice. "Close" means setting `status: "done"`.

## Card Contract

Work-order card shape:

```json
{
  "id": "wo-frame-the-problem-testing",
  "type": "testing",
  "status": "open",
  "division": "Product",
  "function": "Insight",
  "play": "frame-the-problem",
  "priority": 15,
  "source": "seed:issue-338-testing-card",
  "created": "2026-06-23",
  "title": "Testing campaign",
  "detail": "Priority-ordered checklist to raise this play past its first smoke.",
  "checklist": [{ "text": "Run the golden path.", "done": false }]
}
```

Validation rules to port:

- `cards` must be an array when present.
- Each card must be an object with no unknown fields.
- Required fields are `id`, `type`, `status`, `division`, `function`,
  `priority`, `source`, and `created`.
- `id`, `division`, `function`, and `source` are non-empty strings.
- `type` is one of `testing`, `improvement`, or `bug`.
- `status` is one of `open`, `in-progress`, or `done`.
- `priority` is an integer.
- `created` is `YYYY-MM-DD`.
- Optional `title`, when present, is a non-empty string.
- Optional `detail`, when present, is a string.
- Optional `play`, when present, is a non-empty string and must be a slug on the
  submitted board.
- Testing cards must link a play.
- Exactly one Testing card is allowed per play in the final merged card set.
- `checklist` is required for Testing cards and allowed only on Testing cards.
- Checklist items must contain only `text` and `done`; `text` is non-empty and
  `done` is boolean.

Priority convention:

- Preserve the existing Board model ordering where lower numeric priority sorts
  first.
- Bug defaults must sort ahead of Improvement defaults. If keeping the retired
  defaults, Bug remains `10`, Testing `15`, and Improvement `20`.

## Touch Map

| Surface | Files / areas | Planned behavior change |
| --- | --- | --- |
| AX Studio API | `packages/ax/src/effects/studio-api.ts` | Canonical `backlog` stages, legacy `empty` alias, card validation, card merge, card-preserving stage-only writes, atomic board-state writes, terse 400 errors. |
| AX endpoint tests | `packages/ax/tests/studio-api.test.ts` | Port card merge/validation tests from the Python server into the `/api/studio/board` endpoint tests while keeping existing stage/ready cases. |
| Viewer Studio runtime | `packages/viewer/src/app/runtime/studio.ts` | Decode `cards[]`, define typed card/checklist schemas, preserve narrow runtime boundary, and allow optional card payloads in `saveStudioBoard()`. |
| Viewer Board UI | `packages/viewer/src/components/studio/StudioApp.tsx` and optionally extracted `StudioBoard*.tsx` / helper tests | Render Backlog, play-stage columns, work-order roll-up, per-play work view, create/edit form, status buttons, close-to-done, and duplicate Testing UI guard. |
| Viewer fixture and browser tests | `packages/viewer/tests/serve-viewer-fixture.ts`, `packages/viewer/tests/library-browser.spec.ts` | Add board payload with backlog and cards, add POST handling for fixture persistence, and cover the visible `/studio?tab=board` workflow. |
| Studio shared data | `studio/plays/board-state.json` | No required data rewrite is expected because it already uses `backlog` and `cards[]`; implementation must preserve this shape. Only touch if tests or manual verification reveal stale data. |
| Retired reference files | `studio/site-server.py`, `studio/plays/board*.{html,js}` | Read-only reference for semantics and visual treatment. Do not extend or serve them in this slice. |

## Affected Behavior Surfaces

| Surface | Behavior shift | Downstream docs/tests/evals |
| --- | --- | --- |
| AX local runtime API | `/api/studio/board` becomes the authoring endpoint for work-order cards, not just stage/ready writes. | Extend `packages/ax/tests/studio-api.test.ts`; no CLI command output changes. |
| Viewer `/studio` Board tab | The Board shows Backlog correctly and becomes the director's card authoring surface. | Add viewer unit/browser validation and update fixture payloads. |
| Reusable plugin agents and skills | None. | No plugin validation or eval rerun. |
| Maintainer skills | None. | This plan uses the planning skill but does not change it. |
| CLI commands | No public CLI command contract changes. | No black-box exit-code tests beyond endpoint tests. |

## Implementation Steps

1. Normalize stage vocabulary in AX.
   - Replace `empty` with canonical `backlog` in `STUDIO_BOARD_STAGES`.
   - Add a stage-key normalizer that maps `empty` to `backlog`.
   - Reject duplicated canonical keys, for example a payload containing both
     `empty` and `backlog`.
   - Write canonical `backlog` in `board-state.json`.

2. Port card validation helpers into AX.
   - Add local types/constants for card types, statuses, required fields,
     allowed fields, and checklist fields.
   - Implement `validateBoardCards(cards, boardSlugs, options)` with the same
     requirements as `site-server.py`.
   - Keep error messages terse and stable enough for tests, without exposing
     long spec rationale to the viewer.

3. Port merge semantics into AX.
   - Read existing `cards` from disk before writing.
   - If request omits `cards`, preserve existing cards unchanged.
   - If request includes `cards`, validate existing and posted cards with
     relaxed Testing completeness, merge by `id`, append new ids after existing
     ids, then validate the final set for duplicate/missing Testing cards.
   - Ensure a stale posted list cannot drop on-disk cards it did not know about.

4. Make AX board writes atomic.
   - Write the next JSON payload to a temp file in the board-state directory.
   - Rename/replace the temp file over `board-state.json`.
   - Preserve existing unrelated top-level fields when appropriate, but ensure
     `stages`, `ready`, `cards`, and `updated` are authoritative in the next
     payload.

5. Expand AX tests.
   - Update helpers from `empty` to `backlog`, with a separate legacy `empty`
     helper for alias tests.
   - Keep existing stage/ready behavior covered.
   - Add tests for card create/write, stage-only card preservation, stale-tab
     merge preservation, duplicate Testing rejection, malformed-card rejection,
     checklist restrictions, `empty` -> `backlog` acceptance, and axes
     independence.

6. Extend viewer runtime schemas.
   - Add `StudioBoardCardSchema` and `StudioChecklistItemSchema`.
   - Include optional `cards` on `StudioBoardSchema`.
   - Add optional `division`, `function`, and `tier` fields to `StudioRungSchema`
     if not already present when implementing, so play-scoped card defaults can
     come from registry data.
   - Allow `saveStudioBoard()` to accept optional `cards`; omit the field for
     stage-only moves.

7. Normalize stage vocabulary in the viewer.
   - Change `STAGE_ORDER` first key to `backlog`.
   - Change labels and gates from `Empty` to `Backlog`.
   - Add a small normalization helper so a legacy `empty` board payload still
     renders under Backlog until the first save writes canonical stages.
   - Ensure `RavenTab` and `PlayPage` stage labels continue to work for Backlog.

8. Build the viewer work-order UI.
   - Keep play-stage columns as the top Board view.
   - Add a Work Orders area below or beside the columns using the existing warm
     dark Studio panel style.
   - Render type badge, priority chip, title, status, scope line, detail, and
     Testing checklist.
   - Group cards by `open`, `in-progress`, and `done`.
   - Add a play filter/per-play view, type filter, and status filter without
     adding on-screen schema rationale.
   - Add card actions: create, edit, move status, and close-to-done.
   - Add a "Work" affordance on play cards, or an equivalent play selector, that
     filters to that play's cards.

9. Implement viewer card authoring behavior.
   - For a play-scoped card, default `division` and `function` from the selected
     rung.
   - For a system-level card, require `division` and `function` inputs.
   - Default new card `status` to `open`.
   - Default priorities so Bug sorts ahead of Improvement.
   - Generate deterministic-enough client ids from scope, type, title, and a
     suffix when needed to avoid collision.
   - For Testing, require a play and checklist; block submit if the selected
     play already has a different Testing card.
   - For Improvement and Bug, omit `checklist`.
   - On save failure, show a terse message such as `board save failed`.

10. Wire viewer saves safely.
    - Stage moves and ready toggles post only `stages` and `ready`, so they
      exercise the server card-preservation path.
    - Card changes post `stages`, `ready`, and `cards`.
    - Refresh registry/board state after successful saves so stale merged cards
      appear in the UI.

11. Add viewer tests.
    - Extend the fixture Studio board payload to use `backlog` and include one
      Testing card plus at least one Improvement or Bug card.
    - Add fixture POST handling for `/api/studio/board` sufficient to persist
      UI saves across reload in browser tests.
    - Add Playwright coverage for Backlog rendering, card render, per-play
      filtering, Improvement creation, status move, reload persistence, and
      duplicate Testing prevention.
    - Add lightweight unit coverage for any extracted pure helpers if they are
      non-trivial.

12. Run validation and adjust only within scope.

## Deterministic Tests And Validation

AX:

```bash
cd packages/ax
bun test tests/studio-api.test.ts
bun test
pnpm run typecheck
```

Viewer:

```bash
pnpm --filter @alexandria/viewer run test
pnpm --filter @alexandria/viewer run check
pnpm --filter @alexandria/viewer run build
pnpm --filter @alexandria/viewer run test:e2e -- --grep "Studio Board"
```

Repo-level sanity:

```bash
bun test
```

Manual product check after implementation:

```bash
ax start viewer
```

Then open `http://127.0.0.1:4321/studio?tab=board` and verify:

- first column reads Backlog and contains current backlog plays
- create an Improvement card on a play
- move it from `open` to `in-progress`
- reload and confirm it persists in the per-play view and roll-up
- attempt a second Testing card for that play and confirm the UI blocks it
- stage a play forward and confirm card statuses do not change
- move a card status and confirm the play stage does not change

## Eval Impact

No eval-harness rerun is required for this slice.

Reasoning:

- No bundled Alexandria plugin skills, product agents, workflows, or prompt
  contracts change.
- No reusable skill behavior changes.
- No eval harness behavior changes.
- The changed surfaces are deterministic AX endpoint behavior and viewer UI
  behavior, covered by unit, endpoint, build, and browser validation.

If implementation expands into `packages/alexandria-plugin`, product skills,
agents, or eval-backed workflow behavior, rerun the targeted eval set required
by `EVALS.md` before merge.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Stage vocabulary drifts between AX, viewer, `board-state.json`, and older clients. | Centralize the canonical stage list in each touched layer, normalize legacy `empty` only at boundaries, write `backlog`, and add endpoint plus browser tests. |
| A stale viewer tab drops a card created by another writer. | Port merge-by-id semantics, test stale-tab preservation against `/api/studio/board`, and refresh after card saves. |
| Stage-only saves accidentally rewrite cards from stale viewer state. | Stage moves and ready toggles must omit `cards`; tests assert cards survive stage-only POSTs. |
| Duplicate Testing prevention exists only in the UI. | Enforce duplicate Testing rejection in AX after merge and test the negative case. |
| The viewer leaks the card contract as explanatory copy. | Keep schema rationale in code/tests/docs only; render cards and terse save errors in the UI. Add browser assertions against known validation-banner/spec-copy phrases if implementation introduces risk. |
| #366 Catalog payload shape lands before or during this work. | Treat `divisions` as optional. Prefer rung-level `division`/`function` for play-scoped defaults and consume `divisions` only for better system-level selects. |
| Card validation becomes stricter than existing AX stage bootstrap tests. | Keep existing stage/ready tests, but seed canonical cards in fixtures where the scenario represents an existing board. For no-card bootstrap scenarios, preserve current behavior unless product review explicitly requires rejecting stage-only writes without Testing cards. |
| Direct edits to `board-state.json` can still produce invalid cards. | Endpoint tests cover server writes; `studio/tools/check-board-state.mjs` remains the file-level guard for shared data if already present. If gaps are found, add a focused validator update only if it stays within #367. |
| Atomic write implementation leaves temp files on failure. | Write temp files in the same directory with a unique suffix and clean up best-effort on error. |

## Acceptance Criteria

- `/studio?tab=board` shows six stage columns with the first labeled Backlog.
- Current backlog plays from `studio/plays/board-state.json` are visible in the
  Backlog column.
- Work-order cards render in the Board tab with type, title, status, priority,
  scope, detail, and Testing checklist where applicable.
- The Board has a per-play view that filters to one play's Testing,
  Improvement, and Bug cards.
- The director can create, edit, move status, and close Testing, Improvement,
  and Bug cards from the viewer.
- Card changes persist to `board-state.json` through `/api/studio/board` and
  survive reload.
- Adding a second Testing card to the same play is blocked in the UI and
  rejected by the server.
- Changing a card status does not change the play's stage.
- Advancing a play stage does not change any card status.
- A stage-only POST without `cards` preserves on-disk cards.
- A stale `cards` POST does not drop on-disk cards it did not know about.
- An `empty`-keyed stage POST is accepted and written back as `backlog`.
- Invalid card edits surface as terse save errors, not as on-screen card-shape
  rationale or validation banners.
- `packages/ax/tests/studio-api.test.ts` covers the migrated validation and
  merge behavior plus existing stage/ready cases.
- Viewer unit/check/build/browser validation passes for the changed surface.

## Deferred Follow-Ups

- #347 Board-advanced: swimlanes, tiers, dependency connections, graph views,
  and ledger-backed cards.
- #368 deletion of retired `studio/*.html`, `board-ui.js`, `board-model.js`,
  `site-server.py`, and the Python server test after #366 and #367 merge.
- Catalog-driven division/function picker improvements if #366 exposes richer
  `DIVISIONS` data after this slice.
- Ledger events for card create/edit/status changes.
- Play Re-sync Catch-to-Bug auto-logging.
- Generated Testing checklist refresh from risk maps, fixtures, or future proof
  state.
