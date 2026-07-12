# S2: Card ↔ entity join, stray piles, and the tile overlay

**Flight:** 3 — Real state · **Depends on:** S1 ·
**Plan:** `docs/alexandria/plans/map-tab/plan.md` §1.1, §1.3

## Context

The work layer meets the map: board cards join to projects/systems via `entityId` (or hang
loose in a context via `contextId` only), stray piles derive from the loose ones, and
clicking a tile opens the work behind it — Lifebuild's overlay grammar, the map stays
mounted behind.

## Scope

- Entity create/edit on the Map tab (name, kind, context, lifecycle; cadence + colleague for
  systems) writing through `POST /api/map/state`.
- Card join UI: on the Info Hub card form/modal, optional context + entity pickers
  (populated from map state). "Promote card to project" action: creates the entity from the
  card's title/detail, joins the card, leaves the entity unplaced.
- Stray pile derivation in the map container: cards with `contextId`, no `entityId`, not
  terminal → pile per context; pile sprite size steps with count.
- Tile click → overlay (map mounted and dimmed behind): entity header (kind, lifecycle,
  context), joined cards reusing the existing Info Hub card list/detail components,
  status changes flowing through the existing board save path. Pile click → same overlay
  listing the context's loose cards.
- Completed projects grey but remain clickable read-only ("victories stay visible");
  uprooted systems leave the map (positions removed).

## Acceptance criteria

- [ ] A card joined to an entity appears in that tile's overlay; a context-only card lands
      in the pile; pile size updates on refresh.
- [ ] Promote-card-to-project round-trips: card → entity → visible in unplaced panel →
      placeable.
- [ ] Board tab and Map tab show consistent card state (same file, both lenses).
- [ ] All writes remain valid documents (M1 validators pass on every save).

## QA script

1. Join two cards to a project via the board UI; click its tile; see them in the overlay.
2. Add a context-only card; watch the pile appear/grow.
3. Promote a card; place the new project; complete it via lifecycle; confirm grey-but-visible.
4. `git diff` both JSON files after the session — small and readable.

## Out of scope

Signals (L1), colleague landmark overlays (L2).
