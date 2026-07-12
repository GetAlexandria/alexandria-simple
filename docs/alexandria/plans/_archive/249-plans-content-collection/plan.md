# Technical Plan: Issue 249 Plans Content Collection And Routing

- Issue reference: `#249` - `[FEAT-009] Plans content collection and routing`
- Goal: teach the Alexandria viewer to discover implementation plans from `docs/alexandria/implementation-plans/`, parse each plan's release/outcome/ticket markdown into a typed collection, and emit stable `/plans/...` routes that FEAT-010 can build on
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/outcomes/O-5.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-009.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-010.md`

## Scope

- Add the repo-specific technical plan for issue `#249`
- Introduce a viewer-side content collection for implementation plans alongside the existing library card collection
- Build a custom loader that scans `docs/alexandria/implementation-plans/*/`, reads `release.md`, discovers `outcomes/O-*.md`, and discovers `tickets/*.md`
- Normalize plan, outcome, and ticket markdown plus frontmatter into typed collection data that later plan-detail UI can consume without re-walking the filesystem
- Add route helpers and Astro pages for `/plans/[name]/`, `/plans/[name]/outcomes/[id]/`, and `/plans/[name]/tickets/[id]/`
- Render the discovered markdown on those routes with minimal presentational chrome sufficient to prove routing and content loading
- Extend the black-box viewer tests to cover plan discovery, plan route output, outcome route output, and ticket route output in served and built flows

## Non-Goals

- Implement the richer plan-detail panels, tier badges, dependency tables, or outcome-to-ticket traceability UI defined by `FEAT-010`
- Add shared viewer-shell navigation between the dashboard, library pages, and plans pages unless required for route correctness
- Rework existing library card collection code except where a shared markdown/route helper is clearly reusable
- Change product-facing agents, skills, setup flows, release/version files, or implementation-plan authoring format
- Invent viewer-only plan metadata that is not derivable from checked-in plan files

## Linked Product-Plan Summary

- The upstream ticket treats implementation plans as a separate content family from library cards because plans are directory-shaped artifacts rather than one-file cards.
- Each plan entry must be rooted in `release.md` and include its discovered `outcomes/` and `tickets/` children with parsed frontmatter and markdown content.
- The route contract is explicit: `/plans/<name>/`, `/plans/<name>/outcomes/<id>/`, and `/plans/<name>/tickets/<id>/`.
- FEAT-009 is the data and routing foundation for FEAT-010, not the full relationship-rich plan presentation.

## Current Gap

- `packages/viewer/src/content.config.ts` exposes only the `libraryCards` collection.
- The viewer currently has no helper that resolves the implementation-plans root, no loader that groups per-plan markdown files, and no route helpers for `/plans/...`.
- `packages/viewer/src/pages/` contains only the dashboard and `/library/[...slug]` card route, so plan URLs do not exist yet.
- `src/tools/viewer.test.ts` exercises dashboard and card rendering only; there is no black-box coverage for plan discovery or plan routes.

## Architectural Boundaries

- Keep implementation-plan discovery in the viewer workspace as a content-loading concern. The shared repo CLI tools such as `src/tools/dag.ts` remain the source of truth for validation workflows, not the viewer.
- Model each plan as one collection entry with nested `outcomes` and `tickets` arrays so FEAT-010 can assemble overview/detail UIs without separately rescanning the filesystem.
- Keep route derivation centralized in viewer helpers rather than concatenating `/plans/...` strings ad hoc across pages and tests.
- Keep this slice server-rendered in Astro. There is no need for React hydration or client-side fetching for plan content discovery.
- Limit the initial page rendering to honest content presentation. Rich plan navigation, status callouts, and dependency visualization belong to FEAT-010.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/249-plans-content-collection/plan.md` | Captures repo-specific scope, routing boundary, verification, and follow-up split for FEAT-009 |
| Viewer path and route helpers | `packages/viewer/src/lib/alexandria-paths.ts`, new or updated route helper files under `packages/viewer/src/lib/` | The viewer can resolve the implementation-plans root and derive stable plan, outcome, and ticket routes |
| Viewer implementation-plan collection | `packages/viewer/src/content.config.ts`, new loader/helper files under `packages/viewer/src/lib/` | Astro can discover plan directories and expose typed release/outcome/ticket content as collection entries |
| Viewer plan pages | `packages/viewer/src/pages/plans/**`, shared markdown/layout helpers if needed | `/plans/...` routes render release, outcome, and ticket markdown from the new collection |
| Deterministic verification | `src/tools/viewer.test.ts` | Viewer tests assert plan route discovery and rendered content through the real CLI serve/build workflows |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Viewer issue work gains a concrete implementation-plan content contract and route surface that later FEAT-010 work must reuse instead of building its own filesystem scan | Later viewer plan-detail work should consume the same collection entry shape rather than duplicating loader logic |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer package type/content check | `bun --cwd packages/viewer astro check` | Verifies the new collection schema, route pages, and helper types compile under Astro |
| Viewer static build | `bun --cwd packages/viewer astro build` | Confirms all discovered `/plans/...` pages build to static output |
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Exercises served and built plan routes through the actual `alexandria-viewer` CLI |
| Repo baseline checks | `bun run check` | Ensures formatting, markdown, shell, and TypeScript surfaces remain green after the viewer changes |
| Repo deterministic suite | `bun test` | Confirms the plan-routing slice does not regress existing CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable product-facing agents and skills, not the viewer UI | No eval reruns required if the final diff stays limited to viewer code, tests, and plan docs | none |
| Viewer implementation-plan routes | No eval-backed viewer behavior exists yet | Deterministic Astro and CLI verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Plan loading could drift from the real filesystem contract if the loader assumes only `FEAT-*` tickets or ignores optional plan files | Discover all markdown files under `tickets/` and `outcomes/` by directory/extension pattern, then rely on frontmatter fields for IDs and titles rather than hardcoding one ticket prefix |
| FEAT-009 could accidentally absorb FEAT-010 by embedding too much relational UI in the first route implementation | Keep page rendering minimal and content-first, and treat richer outcomes/tickets summaries as a separate follow-up surface |
| Route building could diverge between pages, tests, and future links if `/plans/...` URLs are hand-assembled in multiple places | Centralize plan route derivation in shared helpers and reuse them in collection shaping, Astro pages, and tests |
| Markdown rendering could fork from card rendering and create inconsistent HTML behavior | Reuse Astro markdown rendering helpers where practical instead of inventing a second markdown stack |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#249`.
2. Add a viewer helper that resolves `docs/alexandria/implementation-plans/` and loads each plan directory into a typed collection entry with nested release, outcomes, and tickets data.
3. Extend `packages/viewer/src/content.config.ts` with an implementation-plan collection schema.
4. Add shared route helpers for plan overview, outcome, and ticket URLs.
5. Create Astro pages under `packages/viewer/src/pages/plans/` that statically generate routes from the new collection and render the underlying markdown content.
6. Extend `src/tools/viewer.test.ts` to assert served and built `/plans/library-viewer/`, `/plans/library-viewer/outcomes/O-5/`, and `/plans/library-viewer/tickets/FEAT-009/` output.
7. Run `bun --cwd packages/viewer astro check`, `bun --cwd packages/viewer astro build`, `bun test src/tools/viewer.test.ts`, `bun run check`, and `bun test`.
8. Perform a local review pass against the diff and this plan, then update or open the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/249-plans-content-collection/plan.md` exists and matches the FEAT-009 repo slice.
2. `packages/viewer/src/content.config.ts` exposes a typed implementation-plan collection in addition to `libraryCards`.
3. The viewer discovers each implementation-plan directory from `docs/alexandria/implementation-plans/` through a custom loader rooted in `release.md`.
4. A plan collection entry exposes parsed release markdown plus discovered outcome and ticket entries with frontmatter and content.
5. `/plans/library-viewer/` renders the `library-viewer/release.md` content.
6. `/plans/library-viewer/outcomes/O-5/` renders the corresponding outcome content.
7. `/plans/library-viewer/tickets/FEAT-009/` renders the corresponding ticket content.
8. `bun --cwd packages/viewer astro check` passes.
9. `bun --cwd packages/viewer astro build` passes.
10. `bun run check` passes.
11. `bun test` passes.
12. A PR for `symphony/249` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Implement the richer FEAT-010 plan overview layout, ticket/outcome relationship panels, and tier/status presentation on top of the new collection shape.
2. Add shared viewer navigation between dashboard, library, and plans surfaces only if a later ticket explicitly scopes that shell work.
3. Consider rendering optional plan artifacts such as `CONTEXT_BRIEFING.md` and `library-updates.md` only when a future ticket needs them in the viewer.
