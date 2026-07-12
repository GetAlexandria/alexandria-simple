# Technical plan — Slice B: story chips + shared type legend

## Header

- Issue: [#637](https://github.com/GetAlexandria/alexandria-internal/issues/637) —
  "Story chips: name-first + tooltip + shared type legend (library legibility
  Slice B)"
- Goal: story-prose chips show the referenced card's own name (not the raw
  `Type - Name` wikilink key), carry a tooltip naming their type and its
  definition, and a shared legend teaches what each present color means —
  visible on every Library-viewer tab and in the Engine view.
- Linked product plan: `docs/alexandria/plans/library-word-legibility/plan.md`
  (Part B). Read-only input; this technical plan is the separate per-issue
  artifact.

## Scope

- Fix `EmptyLibraryView.tsx`'s `StoryParagraph` to render `piece.prefLabel`
  for a resolved wikilink, falling back to `segment.label` unchanged for an
  unresolved one.
- Add a `title` tooltip (`"<Type label> — <definition>"`) to resolved chips.
- Extract a shared, low-level presentational primitive (swatch + label,
  optional tooltip) that both the Engine view's existing `TypeFilterButton`
  and a new passive `TypeLegend` consume — "defined once" at the visual
  layer, not by forcing one interactive component into two behaviors.
- Add `TypeLegend`: a compact, non-interactive list of the types **present in
  the current catalog**, each showing swatch + label, with the definition on
  the same tooltip convention as the chips.
- Mount `TypeLegend` in `EmptyLibraryView.tsx`'s existing sticky header (which
  already renders outside the per-tab branch — the "filled card / explicit
  gap / confidence" mini-legend lives there today, same pattern) so it's
  visible regardless of active tab, and in `EngineLibraryView.tsx`'s header
  (additive, alongside the existing interactive filter row).

## Non-Goals

- No change to `FunctionalDiagram`'s connector chips, `WorkflowCardRef`, or
  `LibraryPeek`'s "contains" chips — confirmed (via reading their data
  source, not inspection) that they already render resolved display names,
  not raw keys.
- No change to `graph-utils.ts`, `ConstellationView.tsx`, or any
  constellation/Engine-model-merge work — that's Slice C, a separate issue.
- No new palette entries or copy — reuses `ENGINE_TYPE_ICON_SET`/
  `typeDescriptor` exactly as shipped in #636.
- `TypeFilterButton`'s own interactive click-to-filter behavior is untouched;
  the shared primitive is extracted underneath it, not a replacement for it.

## Current Gap

`StoryParagraph` (`EmptyLibraryView.tsx:~628`) resolves a wikilink to its
`LibraryCatalogCard` via `resolvePiece`, then renders `segment.label` (the raw
key, e.g. `Entity - Source`) instead of the resolved `piece.prefLabel`
(`Source`) it already has in hand. No tooltip exists on any chip. No legend
exists anywhere in the viewer — a reader has no way to look up what a color
means short of asking someone. The Engine view's `TypeFilterButton` renders a
swatch + label for present types, but only as an interactive filter control,
with no definition and no non-interactive counterpart for `EmptyLibraryView`
(which has no equivalent filter/legend row at all).

## Architectural Boundaries

- The palette (color/icon/definition) stays owned by `engine-view-model.ts`
  (`ENGINE_TYPE_ICON_SET`, `typeDescriptor`) — this slice only *consumes* it,
  never redefines or duplicates copy.
- The new shared swatch primitive is presentational only (no data fetching,
  no catalog awareness) — it takes an `EngineTypeDescriptor` and renders
  swatch/label/tooltip; callers (`TypeFilterButton`, `TypeLegend`) own
  interactivity and data selection.
- `TypeLegend` computes "types present" the same way `buildTypeDescriptors`
  already does for the Engine view (dedupe by resolved category across the
  catalog's cards) — reuse that function/pattern rather than re-deriving
  presence differently in two places.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Story chips | `packages/viewer/src/components/library/EmptyLibraryView.tsx` (`StoryParagraph`) | Render `piece.prefLabel` for resolved pieces; add a `title` tooltip. Unresolved pieces unchanged. |
| Shared swatch primitive | `packages/viewer/src/components/library/engine-view-model.ts` or a new small co-located file | Extract swatch+label(+tooltip) rendering used by both `TypeFilterButton` and `TypeLegend`. |
| Engine view | `packages/viewer/src/components/library/EngineLibraryView.tsx` | `TypeFilterButton` gains a tooltip (via the shared primitive); mount `TypeLegend` additively in the header. |
| New legend component | `packages/viewer/src/components/library/TypeLegend.tsx` (new) | Non-interactive list of present-type swatch+label+tooltip rows; renders nothing for an empty catalog. |
| Legend mount point | `EmptyLibraryView.tsx`'s sticky header (~line 2677-2738, outside the per-tab branch) | Add `TypeLegend`, visible on every tab. |

## Agent / Skill Behavior Changes

None. Pure viewer presentation change — no plugin workflow, skill prompt, or
agent-facing behavior changes.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| viewer unit/component tests | `bun test src/components/library/EmptyLibraryView.test.tsx src/components/library/engine-view-model.test.ts` (new `TypeLegend.test.tsx` added) | Cover the chip fix, tooltip content, and legend presence/row-set logic. |
| viewer typecheck | `pnpm exec astro check` | Repo-standard gate. |
| viewer full test script | `bun run test` | Regression pass across the whole package. |
| viewer e2e | `pnpm exec playwright test` | Confirm the legend/chip render correctly in a real browser and no existing e2e assertion (e.g. chip text content) regresses. |
| repo format | `pnpm run format:check` | Prettier gate (learned the hard way in #636 that this catches real drift). |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Agent/skill/plugin behavior | N/A — no `packages/alexandria-plugin` workflow, skill, or prompt touched | None | No eval rerun. |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Cramming full-sentence definitions inline into an already-dense sticky header could overflow/crowd the UI, especially with up to ten present types. | Definitions ride the same tooltip (`title`) convention as the story chips themselves — swatch + label stay compact and always visible; the definition is one hover away, consistent everywhere in this plan rather than only on the legend. |
| Reusing `TypeFilterButton` wholesale (rather than extracting a primitive) would force the Engine view's *interactive* component into `EmptyLibraryView`'s *passive* context, or duplicate the swatch markup in two places (violating the issue's "single shared implementation" AC). | Extract the swatch-rendering primitive under both `TypeFilterButton` and the new `TypeLegend` — same visual code path, different interaction wrappers. |
| An existing e2e test could assert exact story-chip text content (the raw key) and break once `StoryParagraph` renders `prefLabel` instead. | Confirmed via research: no existing test in `EmptyLibraryView.test.tsx` asserts chip text content today — this is new coverage, not a fixture fight (unlike #636's `sample-catalog.ts` fallout). Still run the full e2e suite before opening the PR, per #636's lesson that unit tests alone missed a live-browser regression. |
| "Types present in the catalog" could double-count or disagree between the legend and the Engine view's own filter row if computed two different ways. | Reuse `buildTypeDescriptors`'s exact presence logic (or export/share it) rather than re-deriving a second "distinct types" computation. |

## Implementation Steps

1. `engine-view-model.ts` (or a new small file): extract the shared swatch
   primitive (swatch square + label, optional `title`) from `TypeFilterButton`.
2. `EngineLibraryView.tsx`: `TypeFilterButton` consumes the shared primitive
   and gains a tooltip; mount a new `TypeLegend` in the header, additive to
   the existing filter row.
3. `TypeLegend.tsx` (new): non-interactive component, takes the catalog (or a
   pre-computed present-types list) and renders one swatch+label+tooltip row
   per type present, nothing for an empty catalog.
4. `EmptyLibraryView.tsx`: fix `StoryParagraph` to render `piece.prefLabel`
   with a tooltip for resolved pieces, unchanged fallback for unresolved;
   mount `TypeLegend` in the sticky header (outside the per-tab branch).
5. Tests: `StoryParagraph` prefLabel-vs-fallback rendering + tooltip content;
   `TypeLegend` row set for a multi-type catalog, an `Unknown`-typed card, and
   an empty catalog; Engine view still filters correctly with the extracted
   primitive.
6. Run deterministic verification (table above); fix fallout.
7. Local review pass against this plan + the issue's acceptance criteria.
8. Open the PR against `main`.

## Acceptance / Exit Criteria

Mirrors issue #637's acceptance criteria directly (see issue for full text):
resolved chips show `prefLabel`; unresolved chips are unchanged (negative
case); every resolved chip has a `"<Type> — <definition>"` tooltip; a shared
`TypeLegend` lists only types present in the catalog, visible on every
Empty-Library tab and in the Engine view, with zero rows for an empty
catalog and a row for `Unknown` when present; the legend is one shared
implementation, not two independent renderings.

## Found during implementation, deliberately not fixed here

`roleStyle`'s callers throughout `EmptyLibraryView.tsx` (`StoryParagraph` and
the three sibling chip sites) never pass `typeMapping`, so they default to
`[]` — meaning a `Bet`/`Principle` card mentioned in a story's prose renders
grey/Unknown even though the Engine view correctly colors the same card
`Rationale` via the `alexandria-product` bundle's `gaps.json`. This predates
this slice (Slice A/#636 shipped `roleStyle`'s `typeMapping` parameter but no
caller in this file was updated to pass it), so it isn't a regression this
slice introduces — but it is a real, visible inconsistency between two
surfaces showing the same card. Threading `typeMapping` correctly touches
`StoryParagraph`, `StoryProse`, `StoryBucket`, `ProductCardStory` (three call
sites), `FunctionalDiagram`, and the `LibraryPeek` "contains" renderer — a
genuinely separate, mechanical prop-threading pass, not something to fold
into "story chips + legend." Recommend its own small follow-up issue.

## Deferred Follow-Ups

1. Slice C (Engine × Constellation merge) — separate issue, unblocked by this
   slice, not started here.
2. Thread `catalog.typeMapping` through every `roleStyle` call site in
   `EmptyLibraryView.tsx` — see "Found during implementation" above.
3. Whether the legend should ever become interactive (e.g. click-to-filter
   from `EmptyLibraryView`, mirroring the Engine view) — not asked for here;
   flag if it comes up in review.
