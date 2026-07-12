# Technical Plan: Issue 245 Card Page Layout With Five Dimensions

- Issue reference: `#245` - `[FEAT-005] Card page layout with five-dimension sections`
- Goal: replace the collection-backed placeholder card page with a real five-dimension viewer layout that renders card sections as HTML, preserves nested markdown under each dimension, and omits missing dimensions without empty placeholders
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-005.md`

## Scope

- Add the repo-specific technical plan for issue `#245`
- Parse each card entry's markdown body into canonical WHAT, WHERE, WHY, WHEN, and HOW sections while preserving the original section headers and markdown content
- Add a dedicated viewer card layout that renders the card header plus visually distinct dimension sections
- Render markdown section bodies as HTML so lists, inline emphasis, code blocks, and nested `###` subsections display correctly
- Add deterministic viewer coverage for a complete real-library card and a temporary missing-dimension fixture card

## Non-Goals

- Implement wikilink-to-anchor transformation from `FEAT-006`
- Build sidebar navigation or plans pages from collection metadata
- Change the graph parser's canonical section rules or the library card authoring contract
- Add browser-side editing, collapse interactions, or other interactive card affordances
- Introduce product-facing agent, skill, or setup workflow changes outside the viewer package and tests

## Linked Product-Plan Summary

- The upstream ticket expects card pages to render the five-dimension pattern faithfully for human browsing.
- The page header should separate card type from card name and keep the structure scannable.
- Missing dimensions should simply be absent from the page rather than represented by empty containers.
- Nested markdown inside a dimension, including `### Examples` and `### Anti-Examples` under HOW, must render as real markdown output.

## Current Gap

- `packages/viewer/src/pages/library/[...slug].astro` still renders a FEAT-004 placeholder page showing raw markdown and frontmatter diagnostics instead of the actual card layout.
- The viewer does not currently parse section boundaries from collection entry content, so it cannot render dimension-level structure or omit only the missing sections.
- Existing black-box viewer tests only assert the placeholder card diagnostics and do not cover missing-dimension behavior.

## Architectural Boundaries

- Keep card-section parsing in the viewer workspace as presentation support for collection entries. Do not move card-format authority away from the shared graph parser.
- Reuse the collection-backed card route added in `#244`; this slice should upgrade presentation, not replace the content-loading path.
- Keep markdown rendering server-side inside Astro so the static build and dev server produce the same card HTML without introducing a separate client runtime.
- Limit the styling slice to clear visual hierarchy for card dimensions. Broader navigation or theme expansion belongs to the other viewer tickets.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/245-card-page-layout/plan.md` | Captures repo-specific scope, verification, and risks for FEAT-005 |
| Viewer card parsing helpers | `packages/viewer/src/lib/*` | Collection entry markdown can be split into canonical card dimensions with preserved headers and per-section markdown bodies |
| Viewer card layout | `packages/viewer/src/layouts/CardLayout.astro`, `packages/viewer/src/pages/library/[...slug].astro`, `packages/viewer/src/styles/global.css` | Card pages render type/name header plus visually distinct WHAT/WHERE/WHY/WHEN/HOW sections as HTML, omitting absent dimensions |
| Deterministic verification | `src/tools/viewer.test.ts` | Viewer tests assert complete-card rendering, missing-dimension absence, and nested HOW markdown output through the real CLI/build workflow |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Viewer issue work now has a concrete card-page presentation contract beyond content collection smoke coverage | Later viewer tickets should build on the parsed section helper rather than re-splitting markdown ad hoc |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer package card/type check | `bun --cwd packages/viewer astro check` | Verifies the new layout, markdown rendering, and collection-backed route types compile under Astro |
| Viewer static build | `bun --cwd packages/viewer astro build` | Confirms the real library builds with the new card layout and server-side markdown rendering |
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Exercises serve/build behavior, complete-card output, and missing-dimension handling through the actual CLI entry point |
| Repo baseline checks | `bun run check` | Ensures formatting, markdown, shell, and TypeScript surfaces remain green |
| Repo deterministic suite | `bun test` | Confirms the viewer slice does not regress existing CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable agent and skill behavior, not the viewer UI | No eval reruns required if the final diff stays limited to viewer code, tests, and plan docs | none |
| Viewer card presentation | No eval-backed viewer behavior exists yet | Deterministic Astro and CLI verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Markdown section splitting could drift from the canonical WHAT/WHERE/WHY/WHEN/HOW boundaries if the viewer uses looser heading matching than the parser | Normalize section names with the same first-token logic as the graph parser and cover it with a real card render plus a missing-dimension fixture |
| Rendering raw markdown strings could produce escaped text or strip nested subsections such as HOW examples | Use Astro's server-side markdown rendering path for each dimension and assert on rendered subsection headings and list/code output in viewer tests |
| Styling changes could overfit to one card shape and accidentally render empty shells for absent sections | Generate the rendered section list from present parsed dimensions only and verify absence with a fixture missing WHEN |
| The placeholder diagnostics removed by this ticket could silently drop route metadata needed by later tickets | Keep the route and collection contract unchanged, and confine the presentation change to a dedicated layout fed by the existing entry metadata |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#245`.
2. Add a small viewer helper that parses collection entry markdown into canonical card dimensions with preserved headers and markdown bodies.
3. Create `packages/viewer/src/layouts/CardLayout.astro` to render the card header and the present dimensions with distinct section treatments.
4. Replace the placeholder content in `packages/viewer/src/pages/library/[...slug].astro` with the new card layout.
5. Add or extend viewer tests so the real library sample card proves complete rendering and a temporary fixture library proves missing-dimension behavior.
6. Run `bun install` if the viewer dependencies are not yet installed, then `bun --cwd packages/viewer astro check`, `bun --cwd packages/viewer astro build`, `bun test src/tools/viewer.test.ts`, `bun run check`, and `bun test`.
7. Perform a local review pass against the diff and plan, then update the issue branch PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/245-card-page-layout/plan.md` exists and matches the FEAT-005 repo slice.
2. Card pages render the card type and card label or name prominently in the header.
3. WHAT, WHERE, WHY, WHEN, and HOW sections render only when present in the source card.
4. Section markdown renders as HTML rather than escaped raw markdown text.
5. Nested HOW subsections such as `### Examples` and `### Anti-Examples` appear in the rendered output.
6. A card missing WHEN renders without a WHEN section and without an empty placeholder.
7. `bun --cwd packages/viewer astro check` passes.
8. `bun --cwd packages/viewer astro build` passes.
9. `bun run check` passes.
10. `bun test` passes.
11. A PR for `symphony/245` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Turn wikilinks into clickable anchors in `FEAT-006`.
2. Build sidebar navigation from the same collection metadata in `FEAT-007`.
3. Add richer navigation affordances and plan/library cross-linking in later viewer tickets.
