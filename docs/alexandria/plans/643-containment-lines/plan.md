# Technical plan — Slice C2: containment lines + retire dead code

## Header

- Issue: [#643](https://github.com/GetAlexandria/alexandria-internal/issues/643)
  — "Constellation: containment lines + retire the now-dead pre-catalog
  code"
- Goal: within-region containment lines in the Constellation view, hover
  brightens them; delete the pre-catalog Constellation code Slice C1 left
  behind in `graph-utils.ts`.
- Linked product plan: `docs/alexandria/plans/library-word-legibility/plan.md`
  (Part C, second half of the C1/C2 split). Read-only input.

## Scope

- `constellation-view-model.ts`: per region, compute containment lines
  (`engineEdgeClass(edge.type) === "containment"`) between two stars in the
  **same** region only.
- `ConstellationView.tsx`: render lines faintly by default; brighten the
  lines touching the hovered star.
- `graph-utils.ts`: delete `CLUSTER_CENTERS`, `TERRITORY_COLORS`,
  `TERRITORY_BACKGROUNDS`, `PositionedCard`, `PositionedLibraryGraph`,
  `buildPositionedGraph`, `cardsById`, `connectedCardIds`, and the private
  `buildClusterCenters` helper — confirmed via grep (not assumed) that none
  has a remaining caller anywhere in `packages/viewer` post-#642.

## Non-Goals

- Cross-region lines of any kind (containment or otherwise) — explicitly
  dropped per the product plan ("drop the cross-container relationship
  spaghetti"); C1 already renders none, this issue must not introduce any.
- `FolderLibraryView.tsx`, `CardDrawer.tsx`, `groupCards`, `clusterKey`,
  `compareCards`, `spacingFor`, `GOLDEN_ANGLE`, `fallbackClusterCenter` — all
  confirmed to have real callers, untouched.
- Retiring `library-graph.ts` (ax) or its endpoint — blocked on Folders/
  CardDrawer migrating too, a further follow-up beyond this issue.

## Current Gap

Confirmed via `grep -rln` across `packages/viewer/src`, `tests`, and
`.storybook` for each symbol individually: `CLUSTER_CENTERS`,
`TERRITORY_COLORS`, `TERRITORY_BACKGROUNDS`, `buildPositionedGraph`,
`PositionedCard`, `PositionedLibraryGraph` have zero references outside
`graph-utils.ts` itself. `cardsById`/`connectedCardIds` name-collide with
unrelated local variables/fields elsewhere (checked precisely via "imports
from `./graph-utils`", not the bare identifier) — also zero real importers.
Constellation currently renders no lines at all (C1's deliberate interim
state).

## Architectural Boundaries

- Containment classification stays owned by `engineEdgeClass`
  (`engine-view-model.ts`) — this issue consumes it, never duplicates the
  edge-type set.
- Line computation is per-region and pure (no cross-region lookups) —
  mirrors the plan's "trace each container's shape," not a global graph
  layout.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Line computation | `constellation-view-model.ts` | Add within-region containment-line computation to `buildConstellationLayout`. |
| Rendering | `ConstellationView.tsx` | Render lines faintly; brighten on hover of a touching star. |
| Cleanup | `graph-utils.ts` | Delete the eight dead exports/helper listed above. |

## Agent / Skill Behavior Changes

None. Pure viewer presentation + dead-code removal.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| viewer unit/component tests | `bun test src/components/library/constellation-view-model.test.ts` (expanded) | Cover in-region line inclusion, cross-region exclusion, non-containment exclusion, single-star and zero-edge cases. |
| viewer typecheck | `pnpm exec astro check` | Also catches any stray reference to a deleted `graph-utils.ts` export. |
| viewer full test script | `bun run test` | Regression pass, including Folders'/CardDrawer's existing tests, to prove the cleanup didn't touch their dependencies. |
| viewer e2e | `pnpm exec playwright test` | Constellation-visual + Folders-unaffected confirmation, per the #641 lesson that unit tests alone can miss a live-browser regression. |
| repo format | `pnpm run format:check` | Prettier gate. |

## Eval Impact

None — no agent/skill/plugin behavior touched.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Reintroducing cross-region "relationship spaghetti" by accident (the exact complaint the whole plan started from). | Explicit unit test asserting a cross-region containment edge produces zero lines; manual visual check against the real bundle. |
| Deleting a `graph-utils.ts` export that turns out to have a caller I missed. | Grepped each symbol individually before writing the issue (recorded in "Current Gap" above); typecheck will also fail loudly on any missed reference. |
| Folders regresses from an unrelated edit slipping into the same file during cleanup. | Touch only the confirmed-dead symbols; run Folders' own tests (part of the full suite) before opening the PR, not just Constellation-scoped ones. |

## Implementation Steps

1. `constellation-view-model.ts`: add containment-line computation to each
   region (in-region containment edges only), exposed on the region/layout
   result.
2. `ConstellationView.tsx`: render the lines (faint default, brightened on
   hover of a touching star).
3. `graph-utils.ts`: delete the eight confirmed-dead symbols.
4. Expand `constellation-view-model.test.ts` with the line-computation cases
   above.
5. Run deterministic verification (table above); fix fallout.
6. Manually verify against the real `alexandria-product` bundle.
7. Local review pass against this plan + the issue's acceptance criteria.
8. Open the PR against `main`.

## Acceptance / Exit Criteria

Mirrors issue #643's acceptance criteria directly (see issue for full text):
in-region containment lines render; cross-region and non-containment edges
never render lines; hover brightens touching lines only; the eight dead
symbols are gone from `graph-utils.ts` with everything else unchanged;
Folders/CardDrawer unaffected; single-star and zero-edge cases don't crash.

## Found during manual verification, not a defect in this slice

Against the real `alexandria-product` bundle, zero containment lines render
— confirmed this is correct, not a bug: the bundle's actual edge `type`
values are prose-extracted free text (`related`, and one-off narrative
phrases like `the-environment-refracts-into-the-product-bets-on-this-shelf`),
not the canonical `contains`/`part-of`-style vocabulary
`engineEdgeClass`/`CONTAINMENT_EDGE_TYPES` checks for. Verified the **Engine
view's own pre-existing edge classification** (same classifier, shipped
since #376, untouched by this issue) shows the identical result for this
bundle — 197 relationship, 0 containment. This is a pre-existing
data/extraction characteristic shared identically by both views, not
something this slice introduces or is scoped to fix. The mechanism itself is
proven correct via unit tests with synthetic containment-typed edges; it
will render lines automatically, no further code change needed, once/if the
bundle's edge-type vocabulary is normalized.

## Deferred Follow-Ups

1. Fully retiring `library-graph.ts`/its endpoint — blocked on Folders and
   `CardDrawer` migrating off it too, out of scope here.
2. Normalizing the bundle's edge-type vocabulary onto canonical
   relationship/containment strings — a data/extraction-pipeline concern,
   not a viewer-presentation one; would make containment lines (and the
   Engine view's own containment/relationship split) visible without any
   further Constellation code change.
