# Technical Plan: Issue 243 Graph Parser Viewer Import

- Issue reference: `#243` - `[FEAT-003] Wire graph parser import from src/lib/ into viewer workspace`
- Goal: let the Astro viewer workspace import and execute the existing graph parser from `src/lib/graph.ts` so viewer code can reuse `Library`, `Card`, `WikiLink`, and graph metrics without duplicating parser logic
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-003.md`

## Scope

- Add the repo-specific technical plan for issue `#243`
- Configure the viewer workspace so Astro and TypeScript resolve imports from the repo-root `src/lib/` directory through a stable alias
- Add a viewer-side server/data module that imports the graph parser and exposes a small graph snapshot built from the Alexandria library
- Use that graph snapshot from the Astro page so the viewer proves the parser works in Astro component/page execution
- Add a lightweight Astro `content.config.ts` smoke path that imports the same viewer graph module so cross-workspace resolution is exercised from Astro's content-config context before `FEAT-004`
- Extend deterministic verification so the viewer page proves real parser output from `docs/alexandria/library/`

## Non-Goals

- Implement Astro content collections for cards, routes, or slugs from `FEAT-004`
- Render real card detail pages, wikilink HTML, sidebar navigation, dashboard UI, or plans UI from later viewer tickets
- Move graph parser logic out of `src/lib/` or create a duplicate JSON/data-export layer
- Change plugin manifests, release/version files, or setup/distribution behavior unrelated to the viewer workspace import boundary

## Linked Product-Plan Summary

- The product plan chose direct TypeScript imports from the existing graph parser rather than duplicating parsing logic.
- `packages/viewer/` must be able to import `Library.fromDirectory()`, `Card`, `WikiLink`, and graph metrics from `src/lib/graph.ts`.
- Acceptance focuses on two contexts: Astro-rendered code and Astro content-script code paths.
- The viewer should prove it can parse the actual library under `docs/alexandria/library/` and expose card counts, type distribution, broken-link counts, orphan counts, and wikilink shape.

## Current Gap

- The repo already has `packages/viewer/`, but its TypeScript config does not expose a cross-workspace alias into `src/lib/`.
- The Astro page is still placeholder-only and does not import or execute the shared graph parser.
- The viewer package does not yet have any Astro content-config file, so there is no proof that the same import path works in Astro's content collection context.
- Existing viewer tests only prove the page boots and the static build succeeds; they do not verify that viewer code can parse the real Alexandria library through the shared parser.

## Architectural Boundaries

- Keep parsing and graph metrics owned by `src/lib/graph.ts`; the viewer only consumes that API.
- Limit viewer-side additions to import wiring and a small data adapter for presentation/smoke verification. Do not start implementing full card-page or collection behavior in this slice.
- Keep Astro-specific aliasing inside `packages/viewer/` config rather than changing the root plugin runtime or repackaging `src/lib/` prematurely.
- Use a content-config smoke import only to validate the shared import path. Leave real content loader ownership to `FEAT-004`.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/243-graph-parser-viewer-import/plan.md` | Captures the repo-specific scope, verification, and boundaries for FEAT-003 |
| Viewer workspace import resolution | `packages/viewer/tsconfig.json`, `packages/viewer/astro.config.mjs` | Astro/Vite and TypeScript can resolve a stable alias from `packages/viewer/` into repo-root `src/lib/` modules |
| Viewer graph adapter | `packages/viewer/src/lib/*` | Viewer code can load the real library via `Library.fromDirectory()`, preserve `Card` and `WikiLink` typing, and expose parser metrics for later viewer features |
| Astro page smoke surface | `packages/viewer/src/pages/index.astro` and any supporting component files | The viewer homepage renders data derived from the real library through the shared parser instead of only placeholder copy |
| Astro content-config smoke surface | `packages/viewer/src/content.config.ts` | Astro's content-config execution path imports the shared viewer graph adapter, proving the parser import resolves in that context ahead of FEAT-004 |
| Deterministic verification | `src/tools/viewer.test.ts` and any needed package-local checks | Tests assert that the viewer serves/builds with parser-backed library metrics and exposes wikilink-derived data from the real library |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Viewer verification now depends on the shared graph parser import path staying valid | Keep viewer checks/tests aligned with any future changes to `src/lib/graph.ts` or viewer workspace config |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer package type/content check | `bun --cwd packages/viewer astro check` | Exercises Astro's TypeScript and content-config loading so cross-workspace imports fail early if aliasing is wrong |
| Viewer static build | `bun --cwd packages/viewer astro build` | Confirms the shared parser import works in the full Astro build pipeline |
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Verifies the served page and static build expose parser-backed library metrics from the real library |
| Repo baseline checks | `bun run check` | Keeps repo formatting, shell, Markdown, and TypeScript surfaces green after plan and viewer config changes |
| Repo deterministic suite | `bun test` | Confirms the viewer-import slice does not regress existing CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable product-facing agents and skills only | No eval reruns required if the final diff stays limited to viewer workspace config, page rendering, and deterministic tests | none |
| Viewer workspace graph import | No eval-backed viewer behavior exists yet | Deterministic Astro and viewer CLI verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| TypeScript path aliases may typecheck in the editor but fail in Astro/Vite runtime resolution | Configure both `tsconfig` paths and Astro/Vite alias resolution, then verify with `astro check`, `astro build`, and viewer CLI tests |
| A smoke `content.config.ts` could accidentally turn into a partial `FEAT-004` implementation and blur ticket ownership | Keep the config minimal, avoid defining the real card collection, and restrict it to import-resolution verification only |
| Rendering the full parsed library on the placeholder page could create unnecessary coupling or noisy UI | Expose only a compact graph snapshot with a few metrics and sample data needed to prove the shared parser contract |
| Future changes to `src/lib/graph.ts` could silently break the viewer import path because the root `tsc` config does not cover `packages/viewer/` | Treat `packages/viewer astro check/build` and `src/tools/viewer.test.ts` as required verification for any future viewer/parser integration changes |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#243`.
2. Add viewer-workspace alias resolution for repo-root `src/lib/` in `packages/viewer/tsconfig.json` and `packages/viewer/astro.config.mjs`.
3. Create a viewer-side graph adapter that imports `Library`, `Card`, and `WikiLink` from `src/lib/graph.ts`, resolves the real library root, and derives a small parser snapshot.
4. Update the Astro page to render parser-backed metrics and sample card/link data from that adapter.
5. Add a minimal `packages/viewer/src/content.config.ts` that imports the same adapter so Astro's content-config path exercises the cross-workspace import.
6. Extend `src/tools/viewer.test.ts` to assert the served page and static build include parser-backed values from `docs/alexandria/library/`.
7. Run `bun --cwd packages/viewer astro check`, `bun --cwd packages/viewer astro build`, `bun test src/tools/viewer.test.ts`, `bun run check`, and `bun test`.
8. Perform a local diff review against this plan, then update or open the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/243-graph-parser-viewer-import/plan.md` exists and matches the FEAT-003 repo slice.
2. `packages/viewer/` can resolve repo-root `src/lib/*` imports in both Astro/Vite runtime and TypeScript tooling.
3. Viewer code imports and executes `Library.fromDirectory()` against `docs/alexandria/library/` without duplicating parser logic.
4. The Astro page renders parser-backed library metrics and sample wikilink data.
5. Astro's content-config path imports the shared viewer graph adapter successfully.
6. Deterministic tests cover viewer output derived from the real library graph.
7. `bun --cwd packages/viewer astro check` passes.
8. `bun --cwd packages/viewer astro build` passes.
9. `bun run check` passes.
10. `bun test` passes.
11. A PR for `symphony/243` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Implement the real external card content collection and URL mapping in `FEAT-004`.
2. Use the shared graph adapter for wikilink rendering and link resolution in `FEAT-006`.
3. Reuse the parser-backed metrics in the dashboard surface for `FEAT-008`.
