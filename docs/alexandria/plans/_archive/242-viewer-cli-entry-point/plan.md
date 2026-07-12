# Technical Plan: Issue 242 Viewer CLI Entry Point

- Issue reference: `#242` - `[FEAT-002] Create CLI entry point for the viewer`
- Goal: add `alexandria-viewer` as a first-class Alexandria CLI that can start the viewer dev server by default and run a static viewer build through the existing wrapper/install workflow
- Linked product plan: `docs/alexandria/implementation-plans/library-viewer/release.md`, `docs/alexandria/implementation-plans/library-viewer/tickets/FEAT-002.md`

## Scope

- Add the repo-specific technical plan for issue `#242`
- Create `bin/alexandria-viewer` following the existing shell-wrapper pattern
- Add the TypeScript viewer CLI entry point under `src/tools/` with default `serve` behavior and explicit `build` support
- Thread the viewer CLI into setup so compiled installs include the new command
- Add black-box deterministic tests for the viewer CLI and update setup coverage for the new compiled target
- Keep the viewer package configuration aligned so the CLI can pass the Alexandria library root into the Astro workspace

## Non-Goals

- Implement external-library file watching from `docs/alexandria/` beyond the CLI wiring required here; that remains `FEAT-012`
- Build graph imports, content collections, sidebar navigation, dashboard metrics, plan pages, or visual theme work from later viewer tickets
- Change plugin manifests, release versioning files, or unrelated CLI behavior
- Introduce new product-facing agent or skill behavior

## Linked Product-Plan Summary

- The product ticket defines `alexandria-viewer` as the single command users run for viewer work.
- The CLI must support `serve` and `build`, with `serve` as the default when no subcommand is provided.
- The implementation should follow the existing Alexandria wrapper pattern and pass the library path into the viewer runtime so later viewer tickets can load repo content from `docs/alexandria/`.

## Current Gap

- The repository already has `packages/viewer/` from `FEAT-001`, but no top-level Alexandria command targets it.
- Setup currently compiles and installs every Alexandria CLI except a viewer command, so packaged installs have no viewer entry point.
- There is no deterministic black-box coverage proving the viewer can boot through a repo-standard wrapper or build static output via a single Alexandria command.

## Architectural Boundaries

- Keep the viewer runtime owned by `packages/viewer/`; the CLI in `src/tools/` should orchestrate that workspace rather than moving Astro application logic into the plugin shell wrappers.
- Preserve the existing Alexandria CLI contract: thin shell wrapper in `bin/`, runtime logic in TypeScript, setup-managed compiled binary, and compatibility with symlinked/plugin-root installs.
- Limit viewer-specific config changes to what the CLI needs to locate the library root. Hot-reload behavior for external docs paths belongs to `FEAT-012`, not this slice.
- Do not widen this slice into viewer UX work or into generic setup refactors unrelated to the new command.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/242-viewer-cli-entry-point/plan.md` | Captures repo-specific scope, verification, and follow-up boundaries for FEAT-002 |
| CLI wrapper surface | `bin/alexandria-viewer`, `bin/context-library-viewer`, `bin/_alexandria-wrapper-lib.sh` usage | Adds a repo-standard Alexandria entry point for viewer workflows and optional legacy compatibility alias |
| Viewer CLI runtime | `src/tools/viewer.ts` | Parses viewer subcommands, resolves plugin-relative paths, invokes viewer serve/build behavior, passes library-root configuration into the Astro workspace, and launches the viewer workspace through Bun's Astro CLI instead of importing Astro directly into the compiled binary |
| Viewer workspace config and tooling | `packages/viewer/astro.config.mjs` and related package-local config/tooling if needed | Accepts the CLI-provided library-root configuration and keeps Astro runtime ownership inside the viewer workspace without yet implementing the later file-watching/content-loading tickets |
| Setup / distribution workflow | `setup`, `tests/setup.test.ts` | Compiled installs now build and install the viewer command alongside existing Alexandria CLIs |
| Deterministic CLI verification | `src/tools/viewer.test.ts` and any needed fixtures/helpers | Adds end-to-end coverage for default serve, explicit serve, build, and argument forwarding behavior |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents and skills | No product-facing agent or skill behavior changes in this slice | None |
| Contributor workflow | Repo setup now provisions a viewer CLI binary in compiled installs | Setup coverage and issue/PR summaries should mention the new command |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Verifies `alexandria-viewer` serves by default, honors explicit subcommands/flags, and builds static output through the wrapper/runtime entry point |
| Setup regression coverage | `bun test tests/setup.test.ts` | Confirms setup compiles and installs the new viewer binary with existing wrapper semantics |
| Repo baseline checks | `bun run check` | Ensures shell, TypeScript, Markdown, and formatting surfaces remain valid after the new CLI and plan land |
| Repo deterministic suite | `bun test` | Confirms the new command does not regress other tested plugin/setup behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents and skills | Existing eval coverage targets reusable product-facing agent and skill behavior only | No eval reruns required if the final diff stays limited to CLI/setup/viewer workspace wiring | none |
| Viewer CLI | No eval-backed viewer behavior exists yet | Deterministic CLI and setup verification is sufficient for this ticket | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The new viewer CLI could bypass the repo’s standard compiled-wrapper/install path and behave differently from other Alexandria tools | Reuse the existing `bin/` wrapper convention, add the viewer target to `setup`, and extend setup tests so the command is exercised through the same lifecycle as other CLIs |
| Viewer runtime invocation could depend on environment assumptions that break symlinked plugin installs or packaged plugin roots | Resolve the plugin root through existing helper patterns, derive `packages/viewer/` and `docs/alexandria/` paths relative to that root inside the TypeScript entry point, and add compiled-binary verification that proves the setup-installed workspace runtime works end to end |
| Serve-mode verification could be flaky if tests rely on manual timing or fixed ports | Use black-box tests that allocate a disposable port, wait for concrete readiness output, and shut the process down cleanly after asserting the startup contract |
| This slice could accidentally absorb `FEAT-012` file-watching work because both tickets touch viewer runtime/config | Keep config changes limited to CLI-required library-root wiring and defer external watch behavior explicitly in the plan and implementation review |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#242`.
2. Add `bin/alexandria-viewer` and, if maintained for symmetry, `bin/context-library-viewer` using the established wrapper pattern.
3. Implement `src/tools/viewer.ts` to parse `serve` and `build`, default to `serve`, resolve the plugin/viewer/library paths, and invoke the viewer workspace accordingly.
4. Update `packages/viewer/` config only as needed to consume the CLI-provided library-root configuration.
5. Add the viewer binary to setup build targets and extend setup tests to cover the new compiled command.
6. Add black-box deterministic tests for the viewer CLI.
7. Run the targeted viewer/setup verification, then `bun run check`, then `bun test`.
8. Perform a local diff review against this plan, then commit, push, and open or update the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/242-viewer-cli-entry-point/plan.md` exists and matches the FEAT-002 repo slice.
2. `bin/alexandria-viewer` exists and follows the repo’s standard wrapper pattern.
3. `src/tools/viewer.ts` supports default `serve`, explicit `serve`, and `build`.
4. The viewer CLI resolves the repo’s viewer workspace and library root from the plugin root rather than assuming the current working directory.
5. Setup compiles and installs `alexandria-viewer` with the rest of the Alexandria binaries.
6. Deterministic tests cover viewer serve/build behavior and setup integration.
7. `bun run check` passes.
8. `bun test` passes.
9. A PR for `symphony/242` exists or is updated against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Add external docs watching and refresh behavior in `FEAT-012`.
2. Wire graph imports and content collections in `FEAT-003`, `FEAT-004`, and later viewer tickets.
3. Document the viewer in broader user-facing docs once the viewer renders real library content rather than only the foundational workspace.
