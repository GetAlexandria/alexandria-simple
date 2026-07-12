# Technical Plan: Issue 248 Dashboard Overview Page With Library Metrics

- Issue reference: `#248` - `[FEAT-008] Dashboard overview page with library metrics`
- Goal: replace the viewer landing-page smoke screen with a real dashboard that surfaces library-wide structural metrics from the shared graph parser, highlights health status clearly, and links maintainers from summary cards into actionable detail sections
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/outcomes/O-4.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-008.md`

## Scope

- Add the repo-specific technical plan for issue `#248`
- Build the viewer landing page from `Library.toDict()` plus existing graph-parser helpers so the dashboard uses the same library scan the CLI already trusts
- Replace the placeholder parser-smoke content at `packages/viewer/src/pages/index.astro` with a dashboard that shows total cards, broken links, orphan cards, link density, type distribution, and layer distribution
- Add linked detail sections on the landing page for actionable metric drill-down, including broken-link rows with source card and target name plus orphan-card listings
- Reuse the existing viewer route helpers so detail rows can link into card pages where appropriate
- Extend black-box viewer tests to cover dashboard metrics, severity states, distribution sorting, and detail navigation in both served and static-build flows

## Non-Goals

- Add search, graph visualization, filtering, or client-side dashboard interactivity beyond same-page anchor navigation
- Rework the shared graph parser formulas or introduce a viewer-only metric data model separate from `Library.toDict()`
- Implement the plans section from `FEAT-009` and `FEAT-010`
- Change product-facing agents, skills, setup flows, release/version files, or the card-page rendering contract
- Convert the viewer home page into a SPA or add a heavyweight chart dependency for this slice

## Linked Product-Plan Summary

- The upstream ticket expects the viewer home page to become the dashboard rather than a placeholder.
- Structural health should be prominent: broken links and orphan cards need clear severity treatment instead of being buried in raw dumps.
- Type and layer breadth should be visible from the landing page, with type counts sorted descending.
- Summary metrics should lead maintainers to detail views, but the detail affordance can stay within the same dashboard page for this repo slice.

## Current Gap

- `packages/viewer/src/pages/index.astro` still renders a FEAT-003 parser-import smoke page rather than a maintainers' dashboard.
- The viewer already imports `Library` and computes the needed counts, but it does not use `Library.toDict()` or expose the broader metric set described in FEAT-008.
- There are no detail views for broken links or orphan cards, so the current landing page is not actionable when structural problems exist.
- Existing viewer tests assert the smoke-page copy and a handful of sample parser values, but they do not cover dashboard severity states, sorted distributions, or detail navigation.

## Architectural Boundaries

- Keep the metric source of truth in the shared graph parser. The viewer should format and present library data, not duplicate parsing or recompute different formulas.
- Keep the dashboard build-time and server-rendered in Astro. This slice does not need React-driven charts or client-side fetching.
- Prefer lightweight, reviewable HTML/CSS visualizations such as stacked bars or proportional rows over adding a charting dependency for one overview page.
- Keep detail navigation local to the dashboard page through anchors and card links. Dedicated multi-page metric reports belong to later viewer tickets if they are ever scoped.
- Preserve the existing card-page route and sidebar behavior; the home page should add overview/navigation value without changing the card-page contract.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/248-dashboard-overview-page/plan.md` | Captures repo-specific scope, verification, and boundaries for FEAT-008 |
| Viewer dashboard data shaping | `packages/viewer/src/lib/*` | Shared graph-parser output is normalized into presentation-ready metric groupings and drill-down rows without forking parser logic |
| Viewer landing page | `packages/viewer/src/pages/index.astro`, `packages/viewer/src/styles/global.css` | The home page becomes a real dashboard with health cards, breadth/distribution sections, and linked detail anchors |
| Shared viewer navigation helpers | `packages/viewer/src/lib/library-routes.ts`, related helpers if needed | Dashboard detail rows can link from metric summaries into existing `/library/...` card routes |
| Deterministic verification | `src/tools/viewer.test.ts` | Viewer tests assert dashboard metric rendering, severity state treatment, sorted distributions, and broken-link/orphan detail navigation through the real CLI/build workflow |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Viewer issue work gains a concrete dashboard contract for the landing page instead of the earlier parser-smoke placeholder | Later viewer tickets should build on the same landing-page shell rather than reintroducing placeholder diagnostics |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer package type/content check | `bun --cwd packages/viewer astro check` | Verifies the dashboard page, helper types, and route-link integration compile cleanly under Astro |
| Viewer static build | `bun --cwd packages/viewer astro build` | Confirms the real library dashboard and linked detail anchors build to static output |
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Exercises served and built dashboard behavior through the actual `alexandria-viewer` CLI |
| Repo baseline checks | `bun run check` | Ensures formatting, markdown, shell, and TypeScript surfaces remain green after the viewer/dashboard changes |
| Repo deterministic suite | `bun test` | Confirms the dashboard slice does not regress existing CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable product-facing agents and skills, not the viewer UI | No eval reruns required if the final diff stays limited to viewer code, tests, and plan docs | none |
| Viewer dashboard behavior | No eval-backed viewer behavior exists yet | Deterministic Astro and CLI verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Dashboard helpers could drift from the shared parser if they recompute counts ad hoc instead of consuming `Library.toDict()` | Use `Library.toDict()` as the summary source and only derive presentation-specific sorting, percentages, and rows on top of that data |
| Same-page detail navigation could become a disguised raw-data dump that violates the issue's "actionable metrics" guidance | Keep the overview prominent, collapse detail into clearly named sections, and show only the rows needed to act on structural issues |
| Route links in broken-link details could go stale if the dashboard rebuilds paths differently from collection-backed card pages | Reuse the existing viewer route helper to derive source-card routes from card paths or names instead of hand-assembling URLs inline |
| A healthy-library state could still look alarming if the visual treatment is tied only to metric labels | Encode explicit positive/attention/critical severity styling from metric values and assert the healthy fixture state in viewer tests |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#248`.
2. Add a small viewer helper layer that turns `Library.toDict()`, `library.brokenLinks()`, and `library.orphans()` into presentation-ready summary cards, sorted distributions, and detail rows with card-route links.
3. Replace the existing parser-smoke landing page in `packages/viewer/src/pages/index.astro` with a dashboard layout that emphasizes health metrics first and exposes detail anchors for drill-down.
4. Extend viewer styles only where needed for dashboard cards, severity badges, proportional distribution rows, and detail tables while preserving the established Alexandrian look.
5. Update `src/tools/viewer.test.ts` so served and built output assert the new metric headings, severity states, sorted type distribution, and detail navigation content for both the real library and a healthy fixture library.
6. Run `bun --cwd packages/viewer astro check`, `bun --cwd packages/viewer astro build`, `bun test src/tools/viewer.test.ts`, `bun run check`, and `bun test`.
7. Perform a local review pass against the diff and plan, then update or open the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/248-dashboard-overview-page/plan.md` exists and matches the FEAT-008 repo slice.
2. The viewer landing page shows total card count, broken link count, orphan card count, link density, type distribution, and layer distribution from the shared graph parser.
3. Broken links and orphan cards use clear severity styling that distinguishes healthy and unhealthy states.
4. Type distribution is sorted by count descending.
5. Dashboard summary metrics link to actionable detail sections on the page.
6. Broken-link detail rows show the source card and target name, and source-card rows link into the existing `/library/...` route when the source card exists in the library.
7. `bun --cwd packages/viewer astro check` passes.
8. `bun --cwd packages/viewer astro build` passes.
9. `bun run check` passes.
10. `bun test` passes.
11. A PR for `symphony/248` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Add dedicated multi-page metric reports only if a future ticket explicitly needs drill-down beyond same-page detail sections.
2. Consider richer visualizations or trend/history views separately if the viewer later gains time-based metrics.
3. Revisit landing-page integration with the future plans section once `FEAT-009` and `FEAT-010` define how overview navigation should connect across viewer surfaces.
