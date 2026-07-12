# Technical Plan: Issue 241 Astro Viewer Workspace

- Issue reference: `#241` - `[FEAT-001] Initialize Astro workspace package with Bun, React, and Tailwind`
- Goal: establish `packages/viewer/` as a Bun workspace package with a minimal Astro app and the React/Tailwind integrations that later viewer tickets depend on
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-001.md`

## Scope

- Add the repo-specific technical plan for issue `#241`
- Add Bun workspaces configuration at the repo root for `packages/*`
- Create `packages/viewer/` with a minimal Astro package manifest, config, TypeScript setup, and placeholder page
- Wire Astro's React and Tailwind integrations so later tickets can build on an existing, runnable viewer package
- Update dependency lock state through `bun install`

## Non-Goals

- Implement the viewer CLI entry point, file watching, graph imports, content collections, sidebar, dashboard, or plans pages
- Define the final Alexandrian Tailwind theme from `FEAT-011`
- Expand repo-wide lint/typecheck coverage to all workspace packages beyond what this issue needs to verify honestly
- Introduce product-specific viewer content beyond a generic placeholder page

## Current Gap

- The repository currently has no `packages/` directory, no Bun workspace configuration, and no Astro runtime dependencies.
- The library-viewer release plan assumes `packages/viewer/` exists as the foundation for all subsequent viewer tickets, but the repo cannot currently install, serve, or build a viewer package.
- Root deterministic checks currently focus on the existing Bun CLI/plugin surfaces under `src/`, so this slice needs package-local verification in addition to the repo baseline checks.

## Architectural Boundaries

- Keep the viewer isolated in `packages/viewer/` with its own dependencies and Astro-specific configuration rather than mixing viewer runtime code into the plugin CLI sources under `src/`.
- Limit this slice to scaffolding and integration enablement. Later tickets should own real viewer behavior such as graph imports, content loading, and theming.
- Preserve existing Claude Code plugin behavior by avoiding changes to plugin manifests, setup flows, or runtime wrappers in this foundational package ticket.
- Use a minimal placeholder page that proves the Astro app boots with React and Tailwind without implying finished product UX.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/241-astro-viewer-workspace/plan.md` | Captures the repo-specific scope, boundaries, and verification plan for FEAT-001 |
| Bun workspace root | `package.json`, `bun.lock`, `tsconfig.json` | Root install now recognizes `packages/viewer/` as a workspace package, installs the viewer dependencies, and keeps Bun type resolution stable in clean environments |
| Viewer package scaffold | `packages/viewer/package.json`, `packages/viewer/astro.config.mjs`, `packages/viewer/tsconfig.json`, `packages/viewer/src/**/*` | Adds a runnable Astro workspace with React and Tailwind enabled plus a placeholder page |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Claude Code plugin agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Repo now contains a viewer workspace package that later implementation tickets can target | Subsequent viewer-ticket docs and PRs can refer to `packages/viewer/` without rescoping the foundation |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Workspace install | `bun install` | Confirms the root workspace link is valid and records dependency lock updates |
| Viewer dev startup | `bun --cwd packages/viewer astro dev --host 127.0.0.1` | Verifies the new Astro package boots successfully in development mode |
| Viewer static build | `bun --cwd packages/viewer astro build` | Verifies the minimal site builds to static output |
| Repo baseline checks | `bun run check` | Ensures root formatting, markdown, shell, and TypeScript surfaces still pass after the plan and workspace changes |
| Repo deterministic suite | `bun test` | Confirms the new workspace slice does not regress existing tested CLI/plugin behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Agents and product skills | Existing eval coverage targets product-facing agents and skills only | No eval reruns required if the final diff stays limited to workspace/package scaffolding and docs | none |
| Viewer package scaffold | No eval-backed viewer surface exists yet | Deterministic install/dev/build verification is sufficient for this foundational package ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Astro, React, and Tailwind package versions could be wired incompatibly and fail at install or runtime | Use the official Astro integration packages named in the upstream ticket and verify with `bun install`, `astro dev`, and `astro build` before handoff |
| Root repo checks may not automatically typecheck or lint the new workspace package | Add package-local Astro/TypeScript configuration and treat the viewer dev/build commands as required verification for this slice |
| Early viewer scaffolding could accidentally imply finished visual direction or content structure | Keep the page intentionally minimal and generic, leaving real theme and content work to the follow-on tickets |
| Adding workspaces at the root could disturb existing Bun lock resolution | Regenerate the lockfile with a clean `bun install` and rerun the repo baseline checks to catch regressions immediately |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#241`.
2. Update the root `package.json` with Bun workspace configuration for `packages/*`.
3. Create `packages/viewer/` with a minimal `package.json`, Astro config, TypeScript config, Tailwind stylesheet, and placeholder page.
4. Install dependencies from the repo root so the workspace is linked and `bun.lock` reflects the new package.
5. Run the viewer-local verification commands (`astro dev`, `astro build`).
6. Run `bun run check`.
7. Run `bun test`.
8. Review the diff against the issue scope, then open or update the PR against `main` and carry CI/review follow-through.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/241-astro-viewer-workspace/plan.md` exists and matches the FEAT-001 repo slice.
2. Root `package.json` declares the workspace so `packages/viewer/` is installed through `bun install`.
3. `packages/viewer/` contains a minimal Astro app with React and Tailwind integrations configured.
4. `bun install` succeeds from the repo root and updates the lockfile accordingly.
5. `bun --cwd packages/viewer astro dev --host 127.0.0.1` starts successfully.
6. `bun --cwd packages/viewer astro build` completes and produces static output.
7. `bun run check` passes.
8. `bun test` passes.
9. A PR for `symphony/241` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Add the viewer CLI wrapper and file-watching workflow in `FEAT-002` and `FEAT-012`.
2. Wire graph imports and content collections in `FEAT-003` and `FEAT-004`.
3. Implement the Alexandrian visual theme in `FEAT-011` rather than overloading this scaffold ticket.
