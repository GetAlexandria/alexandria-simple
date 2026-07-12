# Issue 401 - Work Board Rebuild: One Trello Model Across Play Making And Work Orders

Status: draft for approval
Issue: https://github.com/GetAlexandria/alexandria-internal/issues/401
Run ID: 01KVXXA693SDY50T1DG1EGW95Q
Project: Studio Work Board
Phase: L6b of L6
Tier: should
Blocked by: L6a / issue #400, Work Board data model
Blocks: none

Linked plans and decisions:

- `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`
- `docs/alexandria/plans/400-work-board-data-model/plan.md`
- `docs/alexandria/plans/studio-fixes/board-surface-decision.md`
- `docs/alexandria/plans/studio-fixes/board-project-plan.md`
- `docs/alexandria/plans/studio-fixes/board-data-model.md`
- `docs/alexandria/plans/studio-fixes/F4-board-interactivity.md`

Planning note: issue #401 names `docs/alexandria/plans/studio-fixes/work-board-redesign.md`
as the ruled spec. That file is not present in this checkout at planning time. This plan uses
the issue body, the available GitHub comments, the L6 phase plan, and the implemented L6a
contract as the source set. If `work-board-redesign.md` lands before implementation starts,
reconcile this plan against it before editing implementation files.

GitHub issue comments checked: the only comment available at planning time is the Fabro local
run link for `01KVXXA693SDY50T1DG1EGW95Q`; no extra human plan-review feedback was present.

## Goal

Rebuild the viewer Studio Board UI around one Trello-like model shared by both halves:

- Play Making: play cards move through stage lanes, click through to their play page, and LIVE
  plays can graduate into the archive after Director confirmation.
- Work Orders: Testing, Improvement, and Bug cards move through status lanes, click through to
  the existing detail overlay, support real editing, and leave the active board through the
  unified archive projection.
- Archive: one hidden-by-default, searchable/filterable pile containing graduated plays and
  archived terminal work-order cards, with restore actions.

The implementation consumes the L6a data contract rather than changing it: `wont-do`,
`terminalAt`, `archived`, `pinned`, `graduated`, idempotent card persistence, and the derived
archive rule are already owned by issue #400.

## Sources Of Truth

- Root `CLAUDE.md` and `README.md` define the monorepo boundary and state that the viewer
  `/studio` tab is the canonical Studio product surface.
- `packages/viewer/README.md` defines the viewer as an Astro/React/Tailwind browser app that
  talks to local AX runtime APIs; it should not read workspace files directly at runtime.
- `studio/README.md` defines `/studio?tab=board` as the Board surface and
  `studio/plays/board-state.json` as the shared Board state.
- `skills/maintainer/technical-planning/SKILL.md` defines this planning format.
- `EVALS.md` defines when eval-harness coverage is required.
- Issue #401 defines the L6b product acceptance criteria and scope fence.
- Issue #400 / `docs/alexandria/plans/400-work-board-data-model/plan.md` defines the frozen
  data and persistence contract L6b must consume.
- `studio/plays/board-model.js` currently exposes the L6a helper semantics:
  `inArchive()`, `partitionCardsByArchive()`, `graduatePlay()`, `restoreGraduatedPlay()`,
  `mergeCardsById()`, and terminal status normalization.
- `packages/viewer/src/app/runtime/studio.ts` already decodes and saves the L6a fields.
- `packages/viewer/src/components/studio/StudioApp.tsx` contains `BoardView`, the only
  production UI surface in scope.

## Scope

- Rename the Board panel and internal headings:
  - area title: `Work Board`
  - top half: `Play Making`
  - bottom half: `Work Orders`
- Remove the old Board explainer line under the play-stage columns.
- Rework Play Making cards inside `BoardView`:
  - use the same card chrome family as work-order cards
  - make the card face a link to the play route
  - preserve plain-click in-place behavior through `onOpenPlay(slug)`
  - allow cmd/ctrl-click and middle-click to open the play route in a new tab
  - remove the stage badge from the card face
  - keep `ready` as a labelled toggle
  - remove the `Work` button
  - keep ▸ advance and ◂ rework controls, with event propagation stopped
  - add a Director-confirmed `Graduate` action only for LIVE cards
- Rework Work Order lanes inside `BoardView`:
  - active lanes remain exactly `Open`, `In Progress`, and `Done`
  - `wont-do` appears as a disposition tag inside the Done lane, not as a lane
  - status/disposition controls move the card by updating the existing card by id
  - terminal cards offer `Archive now` and `Keep on board` overrides
  - terminal cards inside the 7-day window remain in Done
  - terminal cards past the 7-day window render in the archive, not in Done
  - reopening a terminal card that is still active returns it to `in-progress`
- Keep and polish the existing work-order detail overlay:
  - card face opens the overlay
  - overlay close behavior remains
  - overlay `View play` still opens the linked play
- Make in-card `Edit` visibly enter the existing editable form path and persist:
  - prefill title, detail, type, priority, play, division/function, and checklist
  - focus or scroll the form so the action is not perceived as a no-op
  - save replaces the existing card by id
- Add the unified archive view:
  - hidden by default behind a `Show archived` toggle
  - contains archived work-order cards and graduated plays
  - supports text search
  - supports filters for disposition label, type, play, and date where the L6a data provides
    a date
  - supports `Restore` for both archived work-order cards and graduated plays
- Update viewer tests and fixtures needed to prove the UI behavior.

## Non-Goals

- Do not change AX persistence, validators, or `studio/plays/board-state.json` schema.
- Do not change the L6a archive derivation or invent a stored archive list.
- Do not add a scheduler, timer job, background process, or write-time sweep.
- Do not backfill `terminalAt` for existing historical `done` cards.
- Do not add Ledger events for board lifecycle actions.
- Do not change bundled Alexandria plugin skills, agents, workflows, or prompts.
- Do not write to `docs/alexandria/library/`.
- Do not revive the retired standalone `studio/*.html` or `studio/site-server.py` surface.
- Do not touch L1-L5 viewer surfaces except for unavoidable shared test fixture updates.
- Do not redesign the Playbook, Catalog, Raven, Damien, Runs, or Play Tracker tabs.

## Linked Product-Plan Summary

L6 in `phase-2-build-plan.md` says the Work Board should stop feeling like two different
products. The ruled behavior in issue #401 settles the IA and interaction model:

- the area is `Work Board`
- the halves are `Play Making` and `Work Orders`
- play cards open play pages and no longer show redundant stage badges
- `ready` stays, `Work` goes away
- LIVE plays can graduate into the archive after Director confirmation
- work-order status changes move cards rather than cloning them
- work-order `Edit` must be a real editable path
- `wont-do` is a terminal disposition in Done, not its own lane
- archive membership is derived from `terminalAt` and override fields, with no background job
- one archive is searchable/filterable and supports restore

L6a has supplied the data contract for that behavior. L6b is the visible Board rebuild.

## Current Gap

`BoardView` in `packages/viewer/src/components/studio/StudioApp.tsx` already renders both
halves, but it still carries the old model:

- the panel title is `The Board - the Director's confirm-flow`, not `Work Board`
- the play-stage half has no `Play Making` heading
- play cards are not clickable as cards
- play cards still render a stage badge even though the column names the stage
- play cards still have a `Work` button that only filters the Work Orders panel
- there is no Graduate action for LIVE plays
- there is an explainer line under the play columns that issue #401 removes
- Work Orders only lane over `open`, `in-progress`, and `done`; `wont-do` is labelled but not
  integrated into active lane projection
- current UI does not hide age-archived terminal cards from Done
- current UI has no archive toggle, archive list, search, filters, or restore controls
- current terminal controls do not expose `Archive now`, `Keep on board`, or `wont-do`
- the existing `Edit` button sets form state, but the form sits below the lanes; the user can
  miss that anything happened
- browser coverage proves basic work-order rendering and creation, but not the L6b acceptance
  matrix

## Architectural Boundaries

- `BoardView` is the production UI owner for this slice. Keep production UI edits in
  `packages/viewer/src/components/studio/StudioApp.tsx`.
- `packages/viewer/src/app/runtime/studio.ts` is already L6a-compatible. Avoid runtime schema
  changes unless implementation discovers a decode/save bug directly blocking this UI.
- The viewer continues to persist Board edits through `saveStudioBoard()`. It must not read
  `studio/plays/board-state.json` directly.
- The active board projection is local UI state derived from `props.board`, `props.rungs`, and
  the L6a lifecycle fields.
- Card updates should always post full `cards` arrays with one object per id. Do not build UI
  logic that appends a card into a target lane.
- Play graduation should post `stages`, `ready`, and `graduated`, leaving registry identity and
  work-order cards intact.
- Work-order restore should clear `archived` and `pinned` as needed, then return terminal cards
  to the appropriate active status:
  - default restore for archived `done`/`wont-do`: keep terminal status if the card should
    appear in Done because the override was the only archive reason
  - if a card is age-archived, `Restore` should set `pinned: true` so it remains visible on
    board without changing the Director's terminal disposition
  - explicit `Reopen` should set `status: "in-progress"` and rely on L6a persistence to clear
    `terminalAt`
- Archive-now sets `archived: true` on terminal work-order cards.
- Keep-on-board sets `pinned: true` and clears `archived` if the card is terminal.
- Wont-do sets `status: "wont-do"` and relies on L6a persistence to set or preserve
  `terminalAt`.
- The UI must use the current time only for projection. It must not write archive membership
  because of age.
- Tests should freeze browser time when proving the derived auto-archive projection.

## Touch Map

| Surface | Files / areas | Planned behavior change |
| --- | --- | --- |
| Studio Board UI | `packages/viewer/src/components/studio/StudioApp.tsx` | Rename IA, rebuild Play Making and Work Orders around one card model, add play links, graduate, terminal controls, archive toggle/list/filters/restore, and edit affordance polish. |
| Viewer browser fixture | `packages/viewer/tests/serve-viewer-fixture.ts` | Add fixture cards and graduated plays needed for L6b browser tests, including in-window terminal, past-window terminal, forced archive, pinned terminal, and graduated play cases. |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Extend Studio Board e2e coverage for the issue #401 acceptance matrix. |
| Viewer runtime schema | `packages/viewer/src/app/runtime/studio.ts` | No planned production change; already supports L6a fields. Touch only if a blocking UI test reveals a runtime incompatibility. |
| AX Studio API | `packages/ax/src/effects/studio-api.ts` and tests | No planned change. L6a owns persistence and idempotent merge behavior. |
| Studio validators/model | `studio/plays/board-model.js`, `studio/tools/*` | No planned change. Use as the contract source; do not reopen L6a. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Bundled plugin agents and skills | None. | No plugin validation or eval rerun. |
| Maintainer skills | None. This plan uses `skills/maintainer/technical-planning/SKILL.md` but does not modify it. | No eval rerun. |
| Viewer Studio surface | Human-facing Work Board behavior changes in the browser. | Viewer unit/check/build/browser validation. |
| CLI / AX commands | No public CLI command behavior changes. | No CLI black-box test additions beyond existing AX L6a coverage. |

## Data And UI Projection Rules

Work-order active lane mapping:

| Stored status | Active lane | Label |
| --- | --- | --- |
| `open` | Open | Open |
| `in-progress` | In Progress | In Progress |
| `done` | Done | Done |
| `wont-do` | Done | Won't Do |

Archive projection for work-order cards follows the L6a rule:

```text
inArchive(card) = card.archived === true
                || (terminal(card)
                    && card.pinned !== true
                    && card.terminalAt exists
                    && ageInDays(now, card.terminalAt) >= 7)
terminal(card) = card.status === "done" || card.status === "wont-do"
```

Archive projection for plays:

- Active play cards come from `board.stages`.
- Archived play cards come from `board.graduated` joined against `props.rungs`.
- Restoring a graduated play removes it from `graduated` and places it in `stages.live`.

Date filter caveat:

- L6a stores per-card `terminalAt`, so archived work-order date filtering can use that date.
- L6a stores graduated plays as a slug set without `graduatedAt`. L6b must not invent a
  persisted date. The archive should include graduated plays in search, disposition, type, and
  play filters; date filtering can only include graduated plays when the chosen behavior is
  "date unknown passes when no date filter is set." A full per-play graduation date filter is
  deferred unless the Director reopens L6a.

## Implementation Steps

1. Create BoardView projection helpers inside `StudioApp.tsx`.
   - Add lane-mapping helpers for active work-order lanes.
   - Add archive membership projection using the L6a formula.
   - Add helpers to partition cards into active and archived lists.
   - Add helpers to build archive entries for cards and graduated plays.
   - Keep helpers pure and small enough to test indirectly through browser behavior.

2. Update Board IA and layout.
   - Change the `PanelFrame` title to `Work Board`.
   - Add `Play Making` heading above stage lanes.
   - Keep `Work Orders` heading for the lower half.
   - Remove the old explanatory paragraph under the stage columns.
   - Reuse the existing dark Studio board visual language and work-order card treatment.

3. Rebuild Play Making cards.
   - Convert the card face into an anchor with an href for `/studio?tab=play&slug=<slug>`.
   - On plain left-click, prevent default and call `props.onOpenPlay(slug)`.
   - Let meta/ctrl/middle-click use the anchor default so a new tab opens.
   - Stop propagation/default behavior from ▸, ◂, ready, and Graduate controls.
   - Remove the stage badge.
   - Keep the `ready` toggle as visible labelled text.
   - Delete the `Work` button.

4. Add LIVE play graduation.
   - Render `Graduate` only in the Live column.
   - Use a Director confirmation before saving.
   - Save `graduated`, `stages`, and `ready` through `saveStudioBoard()`.
   - Remove the slug from every active stage and from `ready`.
   - Do not remove the play from `props.rungs` or linked work-order cards.

5. Rework work-order lane rendering.
   - Render exactly three active lanes: `Open`, `In Progress`, `Done`.
   - Map `wont-do` cards into Done with a disposition tag.
   - Exclude cards whose archive projection is true.
   - Keep card face click-to-detail overlay.
   - Add terminal controls: `Archive now`, `Keep on board`, and `Reopen`.
   - Add status/disposition controls: `Start`, `Close`, `Won't do`, and appropriate reopen
     controls without duplicating card ids.
   - Ensure every control inside a clickable card stops propagation.

6. Make editing unmistakable and persistent.
   - Keep the existing edit form path where practical.
   - When `Edit` is clicked, set editing state, prefill fields, close any overlay, and move
     focus or scroll to the form.
   - The submit path replaces the existing card by id and preserves fields not owned by the
     form, including lifecycle override fields unless the edit intentionally changes status.
   - Add a small editing heading/state so the user sees which card is being edited.

7. Add unified archive UI.
   - Add `Show archived` toggle, default off.
   - When on, render one archive section containing both archived cards and graduated plays.
   - Add text search over title/name, detail, id/slug, play name, and filing.
   - Add filters for disposition, item type, play, and date.
   - Label dispositions as `done`, `wont-do`, or `graduated`.
   - Add `Restore` for work-order cards and graduated plays.
   - Keep archive UI compact and in the same visual family; do not add spec/tutorial copy.

8. Update viewer fixtures for browser coverage.
   - Add fixture board records for a LIVE play that can graduate.
   - Add a recent terminal card that remains in Done at fixed `now`.
   - Add an old terminal card that appears only in archive at fixed `now`.
   - Add a forced `archived: true` card and a pinned old terminal card.
   - Add at least one graduated play slug.
   - Ensure fixture POST handling preserves `cards`, `graduated`, `ready`, and `stages`.

9. Extend browser tests.
   - Cover IA strings and removed strings.
   - Cover play-card click and meta-click route behavior.
   - Cover no stage badge and no `Work` button.
   - Cover Graduate confirmation and archive appearance.
   - Cover work-order status movement with exactly one card matching the id.
   - Cover Edit prefill, save, and persistence across reload.
   - Cover `wont-do` in Done with no separate lane.
   - Cover fixed-now auto-archive, Archive-now, Keep-on-board, archive filters, and Restore.
   - Cover overlay still opens and closes.
   - Keep regression checks for ▸/◂, `ready`, per-play filter, and play-page navigation.

10. Run validation and fix regressions inside the L6b scope fence.
    - Prefer localized `BoardView` fixes over shared runtime changes.
    - If a failure requires changing L6a data/persistence behavior, stop and re-scope rather
      than smuggling model changes into L6b.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Viewer unit/runtime coverage | `pnpm --filter @alexandria/viewer run test` | Ensures existing viewer runtime and Studio model tests still pass after `StudioApp.tsx` changes. |
| Viewer type/build check | `pnpm --filter @alexandria/viewer run check` | Catches TypeScript/Astro/React issues in the modified viewer surface. |
| Viewer production build | `pnpm --filter @alexandria/viewer run build` | Confirms the static viewer build still compiles. |
| Studio Board browser coverage | `pnpm --filter @alexandria/viewer run test:e2e -- --grep "Studio Board"` | Exercises the user-facing Board interactions against the local fixture host. |
| L6a model guard | `node --test studio/tools/board-model.test.mjs` | Confirms L6b did not drift from the data-model helper contract. |
| Board state validator | `node studio/tools/check-board-state.mjs` | Confirms current checked-in board data remains valid. |

No new CLI command behavior is introduced, so no additional CLI black-box exit-code test is
required. No plugin behavior is introduced, so no plugin validation command is required.

## Eval Impact

| Surface | Existing coverage | Action | Command / case |
| --- | --- | --- | --- |
| Bundled plugin skills and agents | Eval harness covers product skills and agents, but this slice does not touch them. | No eval rerun required. | None. |
| Maintainer skills | The technical-planning skill is used, not modified. | No eval rerun required. | None. |
| Viewer Work Board | Covered by deterministic viewer tests and browser e2e, not eval harness. | Extend browser coverage. | `pnpm --filter @alexandria/viewer run test:e2e -- --grep "Studio Board"` |
| AX / CLI runtime | L6a endpoint behavior is already covered by deterministic tests. | No L6b eval action. | Existing AX tests only if implementation unexpectedly touches AX. |

No Alexandria eval-harness coverage is required because L6b changes an internal viewer UI
surface. It does not change reusable product skills, agents, prompts, workflows, or
eval-backed behavior.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The missing `work-board-redesign.md` contains rulings not present in issue #401. | Reconcile before implementation if the file appears. Keep this plan explicit about the source gap. |
| The UI duplicates L6a archive logic and drifts from the model helper. | Treat the documented L6a formula as the contract, keep the projection helper minimal, and prove the same edge cases in browser tests with fixed time plus `studio/tools/board-model.test.mjs`. |
| `graduated` lacks per-play timestamps, but archive date filtering is requested. | Do not invent persisted data in L6b. Implement date filtering for work-order archive dates and keep graduated plays date-filterable only as "unknown date" unless L6a is reopened. |
| A clickable play card swallows ▸/◂, ready, or Graduate controls. | Make controls explicit buttons that stop propagation/default behavior; test the controls after play-card link tests. |
| Work-order status controls reintroduce move-as-clone. | Always replace cards by id in the full `cards` array and assert the id appears once after moves. Rely on L6a merge-by-id at persistence. |
| Archive-now and Keep-on-board precedence becomes ambiguous. | Encode L6a precedence in UI copy and updates: `archived: true` forces archive; `pinned: true` only blocks age archive; Archive-now clears no disposition; Keep-on-board clears `archived` and sets `pinned`. |
| Edit still feels like a no-op because the form is below the lanes. | Scroll/focus to the edit form and add an editing state label; browser-test field prefill and save. |
| The archive grows into a second board. | Keep it hidden by default and render as a compact searchable pile, not another lane set. |
| L1-L5 surfaces regress because `StudioApp.tsx` also owns tab routing. | Keep edits inside `BoardView` and the Board panel title; run existing viewer tests and the Studio tab reachability browser test. |

## Acceptance And Exit Criteria

- The Board panel title reads `Work Board`.
- The top half reads `Play Making`; the lower half reads `Work Orders`.
- The old explainer line under the play columns is gone.
- Clicking a Play card face opens that play's page in place.
- Cmd/ctrl-clicking or middle-clicking a Play card link opens the play route in a new tab.
- Play cards show no stage badge.
- `ready` remains a labelled toggle and still persists.
- The `Work` button is absent.
- A LIVE play offers `Graduate` behind a Director confirmation.
- Graduating a LIVE play removes it from active columns, adds it to archive as `graduated`,
  and leaves it available as a live play in the playbook/registry.
- Work-order status/disposition changes move the card; the card id appears exactly once.
- In-card `Edit` opens an editable form, prefilled from the card, and persists title, detail,
  type, priority, play, and checklist changes.
- `wont-do` is available as a terminal disposition and renders in the Done lane with a tag.
- There is no separate `wont-do` lane.
- With fixed browser time, a terminal card less than 7 days old appears in Done.
- With fixed browser time, a terminal card at least 7 days old appears in archive, not Done.
- Reopening an active Done card returns it to In Progress.
- `Archive now` moves a terminal card to archive immediately.
- `Keep on board` exempts a terminal card from age-based archive.
- `Show archived` is off by default and reveals the unified archive when enabled.
- Archive search and filters work for disposition label, type, play, and work-order date.
- `Restore` returns archived work-order cards and graduated plays to active views.
- The work-order click-to-detail overlay still opens and closes.
- Regression coverage passes for ▸/◂ stage moves, `ready`, per-play filter, and play-page
  navigation.
- Required deterministic verification either passes or any environment-only skip is recorded
  with the reason.

## Deferred Follow-Ups

- Add persisted `graduatedAt` if the Director wants full date filtering for graduated plays.
- Add Ledger events for card lifecycle, archive overrides, play graduation, and restore.
- Extract a browser-safe shared Board model package if future slices need the same L6a helper
  semantics in multiple production packages.
- Add drag-and-drop reordering for both Play Making and Work Orders if the Director wants full
  Trello parity beyond the button-based move model in this issue.
- Backfill `terminalAt` for old historical `done` cards only if a future migration is explicitly
  approved.
