# Technical Plan: Issue 251 Alexandrian Tailwind Theme With Palette And Typography

- Issue reference: `#251` - `[FEAT-011] Alexandrian Tailwind theme with palette and typography`
- Goal: turn the viewer's already warm but ad hoc styling into a reusable Alexandrian theme defined in Tailwind, with explicit palette, typography, surface, and component tokens that keep dashboard, card, sidebar, and plan pages visually consistent
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/outcomes/O-1.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-011.md`, `docs/alexandria/plans/241-astro-viewer-workspace/plan.md`, `docs/alexandria/plans/245-card-page-layout/plan.md`, `docs/alexandria/plans/248-dashboard-overview-page/plan.md`, `docs/alexandria/plans/250-plan-detail-view/plan.md`

## Scope

- Add the repo-specific technical plan for issue `#251`
- Extend `packages/viewer/tailwind.config.mjs` with Alexandria-specific color scales, typography families, box shadows, radii, spacing aliases, and background-image tokens that express the theme directly
- Refactor the viewer shell, shared surfaces, and key page chrome to consume the new theme tokens instead of repeating long `stone`/`amber` class strings and raw CSS colors
- Keep the existing viewer information architecture intact while making the dashboard, sidebar, card pages, and plan pages clearly part of one visual system
- Add deterministic verification that the built/served viewer output reflects the new theme vocabulary rather than relying only on visual inspection

## Non-Goals

- Redesign the viewer's page structure, routing, or content hierarchy beyond theme-driven markup cleanup
- Introduce a new runtime theming system, dark mode, user theme preferences, or client-side style toggles
- Add external UI libraries, charting libraries, or a design-token build pipeline
- Change product-facing agents, skills, setup/distribution flows, or eval-backed product behavior
- Rework the markdown rendering contract, library parsing logic, or plan data model outside the small class and component adjustments needed for consistent presentation

## Linked Product-Plan Summary

- The upstream ticket asks for an Alexandrian aesthetic: parchment backgrounds, ink-like text, serif headings, clean body copy, and consistent accent colors.
- The viewer should feel like a well-run library: orderly, professional, and quiet rather than flashy.
- Theme consistency matters more than novelty. The dashboard, sidebar, card pages, and plan pages should look like one system instead of several adjacent slices.
- The implementation notes explicitly call for the Tailwind config and `global.css` to define reusable theme primitives and component patterns.

## Current Gap

- `packages/viewer/tailwind.config.mjs` is effectively empty, so the viewer has no named Alexandrian theme tokens despite already depending on Tailwind.
- The current viewer aesthetic is split between long inline class strings in Astro/React templates and raw color values in `packages/viewer/src/styles/global.css`.
- Shared surfaces such as page shells, cards, badges, section panels, and navigation use similar but separately authored styling, which makes consistency fragile as new viewer tickets land.
- Existing viewer tests confirm routing and content rendering, but they do not verify the presence of explicit theme-driven classes or tokenized visual structure.

## Architectural Boundaries

- Keep the theme inside the viewer package. This ticket should not introduce styling concerns into the shared CLI/parser layers under `src/`.
- Use Tailwind as the source of truth for palette, typography, spacing, radii, and shadow tokens; use `global.css` for base styles and reusable component classes layered on top of those tokens.
- Preserve server-rendered Astro pages and the existing lightweight React sidebar. This slice is about shared visual language, not UI architecture changes.
- Prefer a small vocabulary of shared surface classes over duplicating long utility strings page by page.
- Keep the look aligned with the current Alexandrian direction rather than replacing it with a radically different art direction that would invalidate earlier viewer tickets.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/251-alexandrian-tailwind-theme/plan.md` | Captures the repo-specific FEAT-011 scope, boundaries, verification, and follow-ups |
| Viewer Tailwind theme | `packages/viewer/tailwind.config.mjs` | The viewer gains named palette, typography, spacing, radius, shadow, and background tokens for the Alexandrian aesthetic |
| Shared viewer styling | `packages/viewer/src/styles/global.css` | Base typography, shell styling, markdown defaults, and reusable component classes are rebuilt on top of the Tailwind theme instead of raw hard-coded values |
| Viewer layouts and pages | `packages/viewer/src/layouts/CardLayout.astro`, `packages/viewer/src/layouts/PlanDocumentLayout.astro`, `packages/viewer/src/pages/index.astro`, plan detail pages, and `packages/viewer/src/components/SidebarTree.tsx` | Dashboard, sidebar, card, and plan surfaces adopt the same tokenized theme classes and component patterns |
| Deterministic verification | `src/tools/viewer.test.ts` | Viewer CLI tests assert the presence of the shared theme shell and representative theme classes in served and built HTML output |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Viewer feature work gains an explicit expectation that future UI slices reuse the FEAT-011 theme tokens and shared surface classes | Later viewer tickets should extend the shared theme vocabulary instead of reintroducing one-off `stone`/`amber` styling |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer package type/content check | `cd packages/viewer && bun run check` | Verifies the refactored layouts, shared classes, and theme-driven page markup compile cleanly under Astro |
| Viewer static build | `cd packages/viewer && bun run build` | Confirms the viewer still produces static output with the new theme configuration and shared CSS |
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Exercises served and built viewer output through the real `alexandria-viewer` CLI and asserts representative theme markup |
| Repo baseline checks | `bun run check` | Ensures formatting, markdown, shell, and TypeScript surfaces remain green after the viewer styling refactor |
| Repo deterministic suite | `bun test` | Confirms the theme slice does not regress broader CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable product-facing prompt behavior, not the viewer UI | No eval reruns required if the final diff stays limited to viewer code, tests, and plan docs | none |
| Viewer theme behavior | No eval-backed viewer behavior exists yet | Deterministic Astro/build/CLI verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| FEAT-011 could become a cosmetic patch that still leaves theme values scattered across templates and CSS | Move the palette, typography, shadows, radii, and background patterns into Tailwind and collapse repeated surface styling into shared classes |
| Refactoring to shared classes could accidentally change page semantics or break existing tests that depend on specific viewer content | Keep the content structure intact and extend viewer tests with theme assertions instead of rewriting route behavior |
| Introducing remote font dependencies could make the local viewer fragile in offline or restricted environments | Prefer robust font stacks and only use font declarations that degrade cleanly without requiring runtime asset downloads |
| The theme could drift into decorative flourish rather than the "well-run franchise" direction from the product plan | Keep accents restrained, favor warm paper and ink tones, and reuse one consistent visual language across dashboard, card, sidebar, and plan surfaces |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#251`.
2. Extend `packages/viewer/tailwind.config.mjs` with Alexandrian colors, fonts, spacing aliases, radii, shadows, and background-image tokens.
3. Refactor `packages/viewer/src/styles/global.css` into base/component layers that define the shared viewer shell, surface cards, pills, headings, markdown treatments, and section gradients using the theme tokens.
4. Update the viewer layouts, dashboard, plan pages, and sidebar to consume the shared theme classes instead of repeated ad hoc color strings.
5. Extend `src/tools/viewer.test.ts` so served and built HTML assert the new theme shell and representative classes on dashboard and card pages.
6. Run `cd packages/viewer && bun run check`, `cd packages/viewer && bun run build`, `bun test src/tools/viewer.test.ts`, `bun run check`, and `bun test`.
7. Perform a local review pass against the diff and plan, then update or open the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/251-alexandrian-tailwind-theme/plan.md` exists and matches the FEAT-011 repo slice.
2. `packages/viewer/tailwind.config.mjs` defines Alexandrian palette and typography tokens rather than leaving the theme empty.
3. The viewer shell uses warm parchment-like backgrounds, deep ink-like text, and one consistent accent family across dashboard, card, sidebar, and plan pages.
4. Headings use the designated display serif family while body copy uses the designated sans/body family.
5. Shared surfaces such as cards, pills, navigation, and section panels reuse common spacing, border, and shadow conventions rather than one-off styling.
6. `cd packages/viewer && bun run check` passes.
7. `cd packages/viewer && bun run build` passes.
8. `bun run check` passes.
9. `bun test` passes.
10. A PR for `symphony/251` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Add richer motion, texture, or illustration work only if a later ticket explicitly scopes more expressive visual polish.
2. Revisit typography asset loading separately if the viewer later needs self-hosted font files or stricter offline guarantees.
3. Extract a broader design-token convention only if future viewer or plugin surfaces need to share the same theme outside `packages/viewer`.
