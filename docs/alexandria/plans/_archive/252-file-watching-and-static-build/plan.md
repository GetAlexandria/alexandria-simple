# Technical Plan: Issue 252 File Watching Configuration And Static Build Mode

- Issue reference: `#252` - `[FEAT-012] File watching configuration and static build mode`
- Goal: make the Alexandria viewer react to markdown changes under `docs/alexandria/` during `alexandria-viewer serve` and prove `alexandria-viewer build` emits a self-contained static site with resolvable internal links
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/outcomes/O-2.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-012.md`, `docs/alexandria/plans/242-viewer-cli-entry-point/plan.md`, `docs/alexandria/plans/244-astro-card-content-collection/plan.md`, `docs/alexandria/plans/249-plans-content-collection/plan.md`

## Scope

- Add the repo-specific technical plan for issue `#252`
- Teach the viewer content-collection loaders to refresh when markdown files in the configured Alexandria docs roots are created, edited, or deleted during Astro dev
- Keep the viewer rooted in the checked-in filesystem contract: `docs/alexandria/library/` for cards and `docs/alexandria/implementation-plans/` for plans
- Tighten viewer-side watch configuration so Vite can observe those external directories without violating the existing repo boundary
- Extend the black-box viewer tests to exercise live reload behavior against temporary docs roots and to verify built HTML links resolve inside `packages/viewer/dist/`

## Non-Goals

- Add browser-side editing, polling, search, or any new viewer runtime beyond the existing Astro dev/build flows
- Change the CLI surface beyond what is needed to preserve the existing `serve` and `build` behavior
- Rework viewer page layouts, routing structure, plan schemas, or library parsing logic outside the narrow watch/verification slice
- Change product-facing agents, skills, templates, setup flow, or release/version files
- Add eval coverage for the viewer; this remains deterministic CLI/UI verification work

## Linked Product-Plan Summary

- The upstream ticket explicitly requires file watching for both `docs/alexandria/library/` and `docs/alexandria/implementation-plans/`.
- The dev server must handle create, edit, and delete events, not just edits to already-loaded files.
- Static build mode is part of the feature contract: the generated site should contain all dashboard, card, and plan pages with internal links resolving locally.
- The release plan already identifies external-directory content loaders as the likely risk area for this ticket.

## Current Gap

- `packages/viewer/src/content.config.ts` currently uses one-shot async loader functions, which load external markdown but do not explicitly subscribe to file-system events for ongoing dev refresh.
- `packages/viewer/astro.config.mjs` allows Vite to serve the external docs roots, but it does not yet define the watch behavior needed to make the content collections reliably refresh when those files change.
- `src/tools/viewer.test.ts` verifies serve/build output and route rendering, but it does not currently prove that the live dev server notices created, edited, or deleted markdown files.
- The build test asserts representative pages exist, but it does not yet verify that internal HTML links across the built site resolve to generated files.

## Architectural Boundaries

- Keep file watching in the viewer workspace and content-loader layer. The shared parser and markdown utilities under `src/lib/` remain pure filesystem readers, not long-lived watchers.
- Reuse Astro's content-loader watcher mechanism instead of adding an ad hoc standalone watcher process in the CLI.
- Keep the CLI wrapper in `src/tools/viewer.ts` thin. It should continue delegating to Astro dev/build rather than implementing viewer-specific rebuild orchestration.
- Verify the static-site contract through the existing black-box CLI tests instead of adding a second bespoke checker script.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/252-file-watching-and-static-build/plan.md` | Captures the repo-specific FEAT-012 scope, boundaries, verification, and follow-ups |
| Viewer watch configuration | `packages/viewer/astro.config.mjs`, `packages/viewer/src/content.config.ts`, watcher-aware helpers under `packages/viewer/src/lib/` | The Astro dev server watches the configured external Alexandria docs roots and refreshes library/plan collections when files change |
| Viewer collection loaders | `packages/viewer/src/lib/library-cards.ts`, `packages/viewer/src/lib/implementation-plans.ts`, any new shared watcher helper | Library card and implementation-plan entries refresh on create/edit/delete instead of only on initial load |
| Deterministic verification | `src/tools/viewer.test.ts` | Black-box viewer tests prove live refresh behavior and static-build link completeness through the real CLI |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Viewer development gains explicit coverage for live docs watching and self-contained build output | Future viewer tickets should preserve the same external-docs watcher contract rather than introducing separate watch logic |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer package type/content check | `bun --cwd packages/viewer astro check` | Verifies watcher-aware loader changes and route pages still compile under Astro |
| Viewer static build | `bun --cwd packages/viewer astro build` | Confirms the viewer still produces a static site after the loader/watch changes |
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Exercises create/edit/delete refresh behavior and built-link completeness through `alexandria-viewer` |
| Repo baseline checks | `bun run check` | Ensures formatting, markdown, shell, and TypeScript surfaces remain green |
| Repo deterministic suite | `bun test` | Confirms the FEAT-012 slice does not regress broader CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable prompt behavior, not the viewer | No eval reruns required if the final diff stays limited to viewer code, tests, and plan docs | none |
| Viewer dev/build behavior | No eval-backed viewer surface exists yet | Deterministic Astro/build/CLI verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Astro may allow serving external docs roots but still fail to invalidate content collections on create/delete events | Move the collection loaders to watcher-aware object loaders and subscribe to add/change/unlink events for the specific external roots |
| Watch logic could become duplicated between library and implementation-plan loaders | Add a small shared watcher helper or consistent pattern so both loaders use the same refresh contract |
| Dev-time watch support could accidentally destabilize static builds | Keep load behavior shared between dev and build, and prove build output with `astro build` plus CLI black-box assertions |
| Static build verification could miss broken internal links hidden outside the representative sample pages | Traverse generated HTML and assert that local `href` targets map to generated files within `dist/` |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#252`.
2. Convert the viewer content collections to watcher-aware loaders rooted in the external Alexandria docs directories.
3. Update `packages/viewer/astro.config.mjs` only as needed so Vite can watch and serve the configured docs roots cleanly.
4. Extend `src/tools/viewer.test.ts` with live dev-server checks for file create, edit, and delete flows against temporary docs roots.
5. Extend the build assertions to verify internal links resolve within `packages/viewer/dist/`.
6. Run `bun --cwd packages/viewer astro check`, `bun --cwd packages/viewer astro build`, `bun test src/tools/viewer.test.ts`, `bun run check`, and `bun test`.
7. Perform a local review pass against the diff and plan, then update or open the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/252-file-watching-and-static-build/plan.md` exists and matches the FEAT-012 repo slice.
2. `alexandria-viewer serve` refreshes library-card routes when card files are created, edited, or deleted under the configured docs root.
3. `alexandria-viewer serve` refreshes plan routes when implementation-plan files change under the configured docs root.
4. The watcher implementation remains confined to the viewer package and does not add a separate long-lived watcher outside Astro.
5. `alexandria-viewer build` still emits dashboard, card, and plan pages into `packages/viewer/dist/`.
6. Built internal links resolve to generated files inside `packages/viewer/dist/`.
7. `bun --cwd packages/viewer astro check` passes.
8. `bun --cwd packages/viewer astro build` passes.
9. `bun run check` passes.
10. `bun test` passes.
11. A PR for `symphony/252` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Add a dedicated browser-open UX refinement only if a later ticket explicitly scopes CLI ergonomics beyond the existing `--open` support.
2. Revisit hosted/static publishing workflows separately if the viewer later needs deployment-specific asset or base-path behavior.
3. Add broader viewer smoke coverage only if future tickets make the serve/build matrix materially more complex than the current CLI routes.
