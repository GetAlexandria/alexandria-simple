# Technical Plan: Issue 244 Astro Card Content Collection

- Issue reference: `#244` - `[FEAT-004] Astro content collection for library cards`
- Goal: define a real Astro content collection over `docs/alexandria/library/` and generate stable `/library/...` card routes so later viewer tickets can render card detail layouts, wikilinks, and sidebar navigation from typed collection entries
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-004.md`

## Scope

- Add the repo-specific technical plan for issue `#244`
- Replace the current content-config smoke stub with a real `libraryCards` Astro collection sourced from `docs/alexandria/library/`
- Parse markdown files recursively, skip non-card files using the graph parser `SKIP_FILES` contract, and expose card metadata plus raw markdown/frontmatter for each entry
- Generate static `/library/...` routes whose path mirrors the on-disk layer/type-folder hierarchy and slugged card name
- Add deterministic viewer coverage proving collection discovery, route generation, and card-content availability through Astro build output

## Non-Goals

- Implement the five-dimension card layout from `FEAT-005`
- Implement wikilink HTML transformation from `FEAT-006`
- Implement the sidebar tree from `FEAT-007`
- Reorganize library cards, alter the taxonomy, or change the graph parser’s card format rules
- Introduce product-facing agent, skill, setup, or distribution workflow changes outside the viewer package and tests

## Linked Product-Plan Summary

- The product ticket defines a collection over `docs/alexandria/library/` with one entry per card markdown file.
- Entry URLs must mirror the folder hierarchy: `library/{layer}/{type-folder}/{slugged-card-name}`.
- Cards may or may not include YAML frontmatter, so the loader must preserve parsed frontmatter when present without requiring it.
- The collection is the shared data layer that later viewer tickets consume for card page layout, wikilink rendering, and sidebar navigation.

## Current Gap

- `packages/viewer/src/content.config.ts` currently only provides a parser-import smoke object and exports no actual collections.
- The viewer has no collection-backed card routes, so no `/library/...` pages are generated during build.
- Existing viewer tests assert the graph-parser smoke homepage only; they do not verify card discovery, slug generation, or rendered card-page output.
- The current Astro app can parse the library through `src/lib/graph.ts`, but it cannot yet query cards through Astro’s content APIs.

## Architectural Boundaries

- Keep library-card discovery and content-layer metadata in the viewer workspace. Do not move parsing or card-format authority out of `src/lib/graph.ts`.
- Reuse existing repo contracts where possible, especially `SKIP_FILES`, so the viewer and CLI parser stay aligned on what is and is not a card file.
- Limit the new card route to minimal collection-backed rendering that proves content availability. Detailed section rendering belongs to `FEAT-005`.
- Keep the route structure derived from the real filesystem layout rather than inventing a viewer-only taxonomy or grouping.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/244-astro-card-content-collection/plan.md` | Captures repo-specific scope, boundaries, verification, and follow-ups for FEAT-004 |
| Viewer content collection | `packages/viewer/src/content.config.ts`, supporting viewer lib files if needed | Astro loads one collection entry per card markdown file under `docs/alexandria/library/`, preserving frontmatter, raw markdown, and route metadata |
| Viewer card routes | `packages/viewer/src/pages/library/**/*` and any minimal supporting layout/util files | Static `/library/...` pages are generated from collection entries with URLs that mirror folder structure and slugged card names |
| Deterministic verification | `src/tools/viewer.test.ts` and any needed helpers | Viewer tests assert card-route generation, card content availability, and collection-backed build output rather than homepage smoke only |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Viewer implementation now depends on Astro content collections rather than only direct graph-parser smoke data | Keep future viewer tickets and tests aligned with the `libraryCards` collection contract |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer package content/type check | `bun --cwd packages/viewer astro check` | Exercises Astro’s content-config loading, generated content types, and collection-backed route code |
| Viewer static build | `bun --cwd packages/viewer astro build` | Confirms the collection discovers the real library and emits static `/library/...` pages |
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Verifies the viewer serves and builds collection-backed card pages with the expected URLs and content |
| Repo baseline checks | `bun run check` | Ensures TypeScript, Markdown, shell, and formatting surfaces remain green after the new plan and viewer changes |
| Repo deterministic suite | `bun test` | Confirms the viewer collection slice does not regress existing CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable product-facing agent and skill behavior only | No eval reruns required if the final diff stays limited to viewer package code, tests, and plan docs | none |
| Viewer content collection and routes | No eval-backed viewer behavior exists yet | Deterministic Astro and viewer CLI verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Astro’s content layer could accept the external loader but fail to materialize stable entry IDs and routes from files outside `src/content/` | Use a simple build-time loader over the real library tree and assert both route generation and representative card-page output in `astro build` and black-box viewer tests |
| Route generation could drift from the filesystem hierarchy if slug logic is implemented ad hoc in multiple places | Centralize route/slug derivation in a small viewer utility and test against a known library card path |
| Cards without frontmatter could fail schema validation or require unsafe optional access in page code | Use a schema that treats frontmatter as optional/unknown while always exposing normalized route metadata and raw markdown |
| This slice could accidentally absorb FEAT-005 by building a full presentational layout | Keep the card page intentionally minimal and collection-focused, proving route and content availability without implementing five-dimension UI treatment |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#244`.
2. Add viewer-side helpers for discovering card files, deriving collection entry IDs, and producing route metadata from the library filesystem.
3. Replace the content-config smoke stub with a real `libraryCards` collection that reads markdown files under `docs/alexandria/library/`, skips `SKIP_FILES`, parses frontmatter, and preserves raw/body markdown plus route metadata for each entry.
4. Add a minimal dynamic route under `packages/viewer/src/pages/library/` that uses the collection entry ID for `getStaticPaths()` and renders collection metadata plus raw markdown at the filesystem-mirroring URL.
5. Update viewer black-box tests to assert a representative card route exists and includes the expected title/content from the real library.
6. Run `bun install` if needed for the viewer workspace dependencies, then `bun --cwd packages/viewer astro check`, `bun --cwd packages/viewer astro build`, `bun test src/tools/viewer.test.ts`, `bun run check`, and `bun test`.
7. Perform a local diff review against this plan, then open or update the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/244-astro-card-content-collection/plan.md` exists and matches the FEAT-004 repo slice.
2. `packages/viewer/src/content.config.ts` exports a real card collection instead of an empty placeholder.
3. Every non-skipped markdown file under `docs/alexandria/library/` produces a collection entry with layer/type-folder/file metadata.
4. A representative card such as `docs/alexandria/library/product/systems/System - Knowledge Graph.md` is emitted at `/library/product/systems/system-knowledge-graph/`.
5. Card entries expose parsed frontmatter when present and raw markdown content for later rendering/layout work.
6. The viewer can render collection-backed card pages during Astro build and through `alexandria-viewer`.
7. `bun --cwd packages/viewer astro check` passes.
8. `bun --cwd packages/viewer astro build` passes.
9. `bun run check` passes.
10. `bun test` passes.
11. A PR for `symphony/244` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Implement the five-dimension card layout in `FEAT-005`.
2. Transform wikilinks into clickable HTML in `FEAT-006`.
3. Build the sidebar tree from the same collection metadata in `FEAT-007`.
4. Add external-library watch invalidation for content changes in `FEAT-012`.
