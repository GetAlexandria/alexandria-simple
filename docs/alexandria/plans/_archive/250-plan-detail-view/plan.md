# Technical Plan: Issue 250 Plan Detail View With Linked Outcomes And Tickets

- Issue reference: `#250` - `[FEAT-010] Plan detail view with linked outcomes and tickets`
- Goal: turn the viewer's minimal plan overview into a real plan detail page that keeps `release.md` as the primary document while exposing linked outcomes, ticket status and dependency context, and clear outcome-to-ticket traceability
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/outcomes/O-5.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-010.md`, `docs/alexandria/plans/249-plans-content-collection/plan.md`

## Scope

- Add the repo-specific technical plan for issue `#250`
- Build a richer plan overview layout at `packages/viewer/src/pages/plans/[name].astro` on top of the existing `implementationPlans` collection from `#249`
- Add shared viewer helpers for plan-detail presentation concerns such as tier badges, status labels, and outcome-to-ticket grouping without rescanning the filesystem
- Keep `release.md` rendered as the main content area while adding linked outcome and ticket sections that surface tier, status, enabler, and dependency data already present in plan files
- Make ticket and outcome relationships navigable from the plan overview and preserve the existing dedicated outcome and ticket detail routes
- Extend black-box viewer tests to assert the richer plan overview content in both served and built flows

## Non-Goals

- Change the implementation-plan authoring format or introduce viewer-only metadata not derivable from checked-in plan files
- Replace the dedicated `/plans/[name]/outcomes/[id]/` or `/plans/[name]/tickets/[id]/` routes with client-side drill-down interactions
- Add search, filtering, sorting controls, charts, or a plan dependency graph beyond the static relationship summaries scoped by FEAT-010
- Change product-facing agents, skills, setup/distribution workflows, or eval-backed product behavior
- Revisit the FEAT-009 loader shape except where small typed helper additions are needed for presentation

## Linked Product-Plan Summary

- The upstream ticket defines the plan page as a hierarchy view: `release.md` remains the main narrative, and linked outcomes and tickets provide the structural context below it.
- Outcome cards need visible tier treatment and direct links to their outcome pages.
- Ticket summaries need status, tier, outcome linkage, and dependency context so a reader can understand sequencing without opening each ticket first.
- Outcome-to-ticket traceability should be explicit on the plan page rather than implied only by the raw release tables.

## Current Gap

- `packages/viewer/src/pages/plans/[name].astro` currently proves collection wiring but only lists outcome IDs and ticket IDs with titles.
- The current plan overview does not highlight plan status, does not show outcome tiers, and does not expose ticket blocked-by or blocks relationships.
- Outcome-to-ticket mapping exists implicitly in ticket frontmatter, but the overview page does not assemble or render that traceability.
- Existing viewer tests cover the existence of plan routes, but not the richer FEAT-010 presentation contract.

## Architectural Boundaries

- Keep implementation-plan discovery and parsing in the FEAT-009 collection layer. This ticket should consume that data shape rather than adding a second plan-loading path.
- Keep FEAT-010 mostly server-rendered in Astro with lightweight shared helpers. There is no need for React hydration just to render badges, summary cards, or traceability lists.
- Confine the richer presentation to the plan surfaces. Outcome and ticket detail pages can gain small consistency improvements, but they should stay document-first rather than duplicating the full overview UI.
- Derive all status, tier, and dependency displays from existing frontmatter and release metadata so the viewer remains an honest presentation of checked-in plan artifacts.
- Preserve the existing visual language of the viewer rather than introducing a separate app shell for plan pages.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/250-plan-detail-view/plan.md` | Captures repo-specific FEAT-010 scope, boundaries, verification, and follow-up split |
| Viewer plan-detail helpers | `packages/viewer/src/lib/implementation-plans.ts`, new or updated helper files under `packages/viewer/src/lib/` | The plan collection exposes presentation-ready relationship data such as grouped tickets, normalized tier labels, and status styling inputs without changing the filesystem contract |
| Viewer plan layouts/pages | `packages/viewer/src/pages/plans/[name].astro`, `packages/viewer/src/layouts/PlanDocumentLayout.astro`, related plan pages if small consistency updates are needed | Plan overview pages render richer status, tier, dependency, and traceability sections while keeping `release.md` as the primary content |
| Viewer styling | `packages/viewer/src/styles/global.css` | Plan surfaces gain dedicated badge, summary-card, and relationship styling consistent with the existing Alexandrian theme |
| Deterministic verification | `src/tools/viewer.test.ts` | Viewer tests assert the richer plan overview sections and relationship rendering through the real CLI serve/build workflows |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Viewer issue work gains a concrete FEAT-010 presentation contract layered on top of the FEAT-009 collection contract | Later viewer work should reuse the same plan helper outputs rather than hand-assembling tiers or dependencies in multiple pages |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer package type/content check | `bun --cwd packages/viewer astro check` | Verifies the richer plan pages, helper types, and linked routes compile cleanly under Astro |
| Viewer static build | `bun --cwd packages/viewer astro build` | Confirms all plan overview, outcome, and ticket pages still build with the richer plan-detail presentation |
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Exercises served and built FEAT-010 behavior through the actual `alexandria-viewer` CLI |
| Repo baseline checks | `bun run check` | Ensures formatting, markdown, shell, and TypeScript surfaces remain green after the viewer changes |
| Repo deterministic suite | `bun test` | Confirms the plan-detail slice does not regress broader CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable product-facing agents and skills, not the viewer UI | No eval reruns required if the final diff stays limited to viewer code, tests, and plan docs | none |
| Viewer plan-detail behavior | No eval-backed viewer behavior exists yet | Deterministic Astro and CLI verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| FEAT-010 could accidentally fork plan relationship logic away from FEAT-009 by recomputing mappings ad hoc in page files | Add small shared helpers over the existing collection data and reuse them across the overview and detail pages |
| Richer plan chrome could drown out the actual `release.md` narrative, violating the ticket's "release as main content" requirement | Keep the release document as the first large content block and place derived overview panels after or alongside it as supporting navigation |
| Ticket dependency output could become noisy or misleading if empty relationships are rendered the same way as populated ones | Normalize missing arrays to explicit "none" states and visually distinguish blocked and unblocked tickets in tests and styling |
| Tier/status styling could drift from real plan metadata if labels are inferred inconsistently across pages | Centralize normalization for tiers and statuses and assert representative must/should and pending states in viewer tests |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#250`.
2. Add a small helper layer for plan-detail presentation data: normalized plan status, outcome-to-ticket grouping, and reusable tier/dependency display inputs.
3. Replace the minimal overview lists in `packages/viewer/src/pages/plans/[name].astro` with a document-first layout that highlights plan status, outcome tiers, ticket summaries, and traceability.
4. Update supporting plan pages or layout styling only where needed to keep outcome/ticket detail pages aligned with the richer overview.
5. Extend `src/tools/viewer.test.ts` so served and built output assert the new plan overview sections, tier/status labels, dependency summaries, and traceability links.
6. Run `bun --cwd packages/viewer astro check`, `bun --cwd packages/viewer astro build`, `bun test src/tools/viewer.test.ts`, `bun run check`, and `bun test`.
7. Perform a local review pass against the diff and plan, then update or open the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/250-plan-detail-view/plan.md` exists and matches the FEAT-010 repo slice.
2. `/plans/library-viewer/` keeps `release.md` rendered as the primary content.
3. The plan overview prominently displays plan status derived from release frontmatter.
4. The outcomes section shows each outcome with its title, tier, and linked ticket IDs, and each outcome links to its detail page.
5. The tickets section shows each ticket's ID, title, tier, outcome, and dependency context with links to the ticket detail page.
6. Outcome-to-ticket traceability is visible on the plan overview page without requiring the user to inspect raw release tables.
7. `bun --cwd packages/viewer astro check` passes.
8. `bun --cwd packages/viewer astro build` passes.
9. `bun run check` passes.
10. `bun test` passes.
11. A PR for `symphony/250` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Add filtering, sorting controls, or search across plans only if a later ticket explicitly scopes that interactivity.
2. Revisit richer dependency visualization or phase-aware ticket grouping separately if the viewer later needs a more analytic planning surface.
3. Consider surfacing optional plan artifacts such as `library-updates.md` or `CONTEXT_BRIEFING.md` from the viewer only when a later ticket requires them.
