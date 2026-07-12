# Technical Plan — #426 Work Board: priority legible on the card + sort/sift by priority

Status: 2026-06-25. Repo-specific plan translating issue #426 (product intent) into
viewer implementation. Builds on the flat "Trello" Work Board restored by #425
(revert of #347 swimlanes). Product source: the round-2 Studio walkthrough +
`docs/alexandria/plans/studio-fixes/work-board-redesign.md` (L6 rework).

## Scope

On the flat Work Board (viewer `/studio?tab=board`, `BoardView`):

1. **Legible priority on every work-order card** — replace the cryptic `P10` chip
   with a quiet but readable rank indicator (`Priority 10`), in the existing card
   chrome family (type pill / status pip). Same change on the detail overlay.
2. **Sort control** — order the work-order lanes by priority, most-urgent-first by
   default (lower number = more urgent, matching the stored list-position
   semantics); a toggle reverses the direction.
3. **Sift control** — narrow the board to a priority band (`Priority ≤ N`).
4. Sort and sift **compose** with the existing Play / Type / Status filters and are
   **derived views only** — they never rewrite stored `priority`.
5. QoL (Director follow-up): the work-order **card face is a glance summary**. The
   prose `detail` and the full checklist now show **only in the click-to-open
   overlay**; the card keeps a compact `✓ N/M steps` count for testing cards.

## Non-goals

- No swimlanes (do not reintroduce #347).
- No new priority data model — `priority` is the existing stored number.
- No archive-ordering change — the sort control governs the active lanes only.

## Architectural boundaries

- Pure, testable logic lands in `packages/viewer/src/components/studio/boardModel.ts`
  (the browser-safe Work Board model, pinned by `boardModel.test.ts`):
  - `priorityRank(card)` — the stored number, or `+Infinity` when missing/non-finite
    (sorts last, consistently, in both directions).
  - `hasPriority(card)` / `priorityLabel(card)` — render helpers (`Priority N` /
    `No priority`).
  - `sortCardsByPriority(cards, direction)` — stable comparator; unprioritized cards
    always last regardless of direction; `created` then `id` as tiebreakers. The
    canonical (urgent-first) call replaces the old in-file `sortCards`.
  - `passesPrioritySift(card, ceiling)` — the `Priority ≤ N` predicate. An
    unprioritized card is **never dropped** by the sift — it is parked at the bottom
    (via the sort), not lost. A null ceiling means no sift; the UI also maps a blank
    or negative ceiling to null so a stray value can't empty the board.
- UI wiring (state, filter-row controls, lane ordering, card/overlay copy) stays in
  `StudioApp.tsx` `BoardView` — single owner, no cross-package change.

## Touched files

- `packages/viewer/src/components/studio/boardModel.ts` — new priority helpers.
- `packages/viewer/src/components/studio/StudioApp.tsx` — import helpers; drop the
  local `sortCards`; legible card + overlay priority; add `prioritySort` +
  `maxPriority` state, the sort/sift controls in the filter row, the sift predicate
  in `filteredCards`, and the direction-aware lane ordering.
- `packages/viewer/src/components/studio/boardModel.test.ts` — unit coverage.
- `packages/viewer/tests/library-browser.spec.ts` — e2e: legible priority, sort
  toggle reorders, sift narrows, composition with a filter.

## Behavior surfaces

No agent/skill/template/eval behavior changes — this is a viewer display + derived
view change only. Stored `board-state.json` priorities are untouched by sort/sift.

## Deterministic tests

- `boardModel.test.ts`: `priorityRank` (finite / missing), `priorityLabel`,
  `sortCardsByPriority` both directions, missing-priority sorts last in both
  directions, tiebreakers, input not mutated.
- `library-browser.spec.ts`: card shows `Priority N`; sort toggle reorders the Open
  lane (bug P10 / testing P15); `Priority ≤ 10` sift drops the P15 card; sift
  composes with the Type filter; stored priorities unchanged after sorting.

Run: `bun test src/components/studio/boardModel.test.ts` + `bun run check`; e2e via
the viewer Playwright spec.

## Evals

None impacted — no agent/skill/template/eval-backed behavior changes.

## Risks & mitigations

- **`Infinity − Infinity = NaN`** would corrupt the comparator for two unprioritized
  cards → partition on `hasPriority` before the numeric compare; unprioritized always
  last.
- **Sort must not mutate stored order** → `sortCardsByPriority` copies its input; the
  persisted `cards` order stays canonical (urgent-first); direction is applied only to
  the derived lane view.
- **Composition** → the sift lives inside `filteredCards` (alongside Play/Type/Status);
  the direction re-sorts that filtered set, so both stack on the existing filters.

## Deferred follow-ups

- A two-sided band (min + max) if the Director wants it; this slice ships the
  one-sided `Priority ≤ N` sift the issue calls for.
