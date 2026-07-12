# Technical Plan: Issue 246 Wikilink Remark Plugin

- Issue reference: `#246` - `[FEAT-006] Wikilink remark plugin for clickable navigation`
- Goal: render `[[Type - Name]]` references inside viewer card sections as clickable links to the correct `/library/...` card routes, keep the surrounding markdown structure intact, show context phrases inline, and visually distinguish broken links without making them clickable
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-006.md`

## Scope

- Add the repo-specific technical plan for issue `#246`
- Introduce a viewer-side markdown plugin or equivalent markdown-processing hook that rewrites wikilink syntax into link or broken-link HTML during card section rendering
- Build a stable card-name-to-route lookup from the existing `libraryCards` collection contract so wikilinks resolve to the same URLs the viewer already emits
- Preserve ordinary markdown rendering for lists, code blocks, and nested headings while supporting multiple wikilinks in one paragraph or list item
- Add styling for resolved and broken wikilinks plus deterministic black-box tests that prove navigation output in served and built viewer pages

## Non-Goals

- Build sidebar navigation, reverse-link panels, or other browsing affordances from later viewer tickets
- Change the graph parser's wikilink extraction contract or card authoring format
- Introduce browser-side interaction, client-side routing, or tooltip behavior for link context
- Rework the overall card page layout from `FEAT-005` beyond the styling needed for wikilink states
- Modify product-facing agents, skills, setup flows, or release/version files

## Linked Product-Plan Summary

- The upstream ticket defines wikilinks as `[[Type - Name]]` with optional inline context that should remain visible in the rendered card page.
- Resolved links must point at the existing collection-backed `/library/{layer}/{type-folder}/{slug}/` URLs.
- Broken links should be visually distinct and not clickable.
- The issue explicitly calls for consistency with the shared graph parser's `WIKILINK_RE` contract and coverage for multiple links in one line.

## Current Gap

- `packages/viewer/src/lib/card-sections.ts` currently renders each card section through Astro's markdown processor with no wikilink-specific transformation.
- The card page route already exists, but the viewer has no reusable helper that maps a card name like `System - Knowledge Graph` to the emitted route path for that card.
- As a result, built and served card pages show raw `[[Type - Name]]` text rather than navigable viewer links, and broken links are indistinguishable from resolved ones.
- Existing viewer tests prove card layout and collection-backed routing, but they do not assert resolved-link anchors, broken-link styling, or multiple wikilinks in one rendered block.

## Architectural Boundaries

- Keep route derivation and wikilink resolution inside the viewer workspace as presentation-layer behavior that builds on the existing collection metadata and route contract from `#244`.
- Reuse the shared graph parser's `WIKILINK_RE` so viewer rendering stays aligned with the parser's understanding of wikilink syntax.
- Apply the transformation within the server-side markdown rendering path so dev-server output and static build output stay identical.
- Limit the slice to outgoing card-link rendering inside markdown content. Do not expand into graph traversal widgets, link validation tooling, or collection-shape changes unrelated to route lookup.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/246-wikilink-remark-plugin/plan.md` | Captures repo-specific scope, verification, and boundaries for FEAT-006 |
| Viewer route metadata helpers | `packages/viewer/src/lib/*`, `packages/viewer/src/content.config.ts` if needed | Card collection entries expose or derive a stable route path so wikilinks can resolve by card name without duplicating URL logic across pages and tests |
| Viewer markdown rendering | `packages/viewer/src/lib/card-sections.ts`, new plugin/helper files under `packages/viewer/src/lib/` or `packages/viewer/src/plugins/` | Card markdown transforms `[[Type - Name]]` into anchors for known cards and non-clickable broken-link markup for missing targets while preserving surrounding markdown output |
| Viewer card presentation | `packages/viewer/src/layouts/CardLayout.astro`, `packages/viewer/src/styles/global.css` | Resolved and broken wikilinks render with distinct visual treatment appropriate to the Alexandrian viewer style |
| Deterministic verification | `src/tools/viewer.test.ts` and any needed fixtures/helpers | Viewer tests assert resolved-link hrefs, inline context display, broken-link styling, and multiple-link rendering through the real CLI/build workflow |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Viewer issue work now has a concrete wikilink-rendering contract tied to collection routes and server-side markdown processing | Later viewer tickets should reuse the same route helper instead of inventing additional card URL derivation paths |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer package type/content check | `bun --cwd packages/viewer astro check` | Verifies the new markdown transformation, route helper, and card route code compile under Astro |
| Viewer static build | `bun --cwd packages/viewer astro build` | Confirms wikilink rewriting works in the full static build output |
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Proves served and built card pages render resolved links, broken links, and multiple wikilinks correctly through the actual CLI entry point |
| Repo baseline checks | `bun run check` | Ensures TypeScript, Markdown, shell, and formatting surfaces remain green after the viewer change |
| Repo deterministic suite | `bun test` | Confirms the wikilink-rendering slice does not regress existing CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable product-facing agent and skill behavior, not the viewer UI | No eval reruns required if the final diff stays limited to viewer code, tests, and plan docs | none |
| Viewer wikilink rendering | No eval-backed viewer behavior exists yet | Deterministic Astro and CLI verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Wikilink rewriting could break ordinary markdown rendering if it replaces text too early or too broadly | Run the transform inside the markdown processor using explicit wikilink pattern matching and keep coverage on real list-item and paragraph rendering |
| Route lookup could drift from the actual emitted card URLs if card-name-to-path mapping is reconstructed differently from the collection route | Centralize route derivation in a shared viewer helper and use it for both collection entries and wikilink resolution |
| Broken-link markup could accidentally remain clickable or visually blend into normal prose | Emit different HTML for unresolved targets and assert on both absent anchor behavior and distinct CSS classes in black-box tests |
| Context phrases and adjacent prose could be mangled when multiple wikilinks occur in one line | Add coverage for multiple links in one list item or paragraph and keep the transform limited to the matched wikilink token rather than whole-line replacement |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#246`.
2. Add a small viewer helper that derives stable viewer card routes from collection metadata and/or card names.
3. Implement the wikilink markdown transform using the shared `WIKILINK_RE` contract and route lookup map.
4. Thread the transform into card section rendering so section markdown emits resolved anchors and broken-link markup.
5. Add viewer styling for resolved and broken wikilinks that fits the existing card layout.
6. Extend `src/tools/viewer.test.ts` to assert resolved `href` output, broken-link markup, inline context visibility, and multiple-link rendering.
7. Run `bun --cwd packages/viewer astro check`, `bun --cwd packages/viewer astro build`, `bun test src/tools/viewer.test.ts`, `bun run check`, and `bun test`.
8. Perform a local review pass against this plan and the diff, then update or open the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/246-wikilink-remark-plugin/plan.md` exists and matches the FEAT-006 repo slice.
2. Card pages no longer render raw `[[Type - Name]]` syntax for resolvable links.
3. Resolved wikilinks render as clickable anchors to the correct `/library/...` card page.
4. Broken wikilinks render with distinct non-clickable markup.
5. Inline context phrases remain visible after the rendered link.
6. Multiple wikilinks in one line render as separate links without corrupting surrounding markdown.
7. `bun --cwd packages/viewer astro check` passes.
8. `bun --cwd packages/viewer astro build` passes.
9. `bun run check` passes.
10. `bun test` passes.
11. A PR for `symphony/246` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Expose reverse-link or related-card affordances in later viewer tickets rather than overloading this markdown transform.
2. Reuse the same route helper for sidebar and plans/library cross-linking work where appropriate.
3. Add richer broken-link diagnostics to dashboard surfaces if future viewer tickets need them.
