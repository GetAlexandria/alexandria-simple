# Issue 179 Technical Plan

- Issue reference: `#179` `[FEAT-002] Migrate compiled binaries and state to ${CLAUDE_PLUGIN_DATA}`
- Goal: make compiled CLI binaries and persistent state prefer `${CLAUDE_PLUGIN_DATA}` while preserving the current fallback behavior for non-Claude and local-development environments
- Linked product plan: `docs/plans/plugin-distribution/tickets/FEAT-002.md`

## Scope

- Update shell-side path resolution so `./setup` writes compiled binaries to `${CLAUDE_PLUGIN_DATA}/bin/.compiled/` when available.
- Update wrapper-side path resolution so public `bin/alexandria-*` entrypoints load compiled binaries from `${CLAUDE_PLUGIN_DATA}` first, then preserve the existing compatibility fallbacks.
- Update TypeScript tooling that resolves plugin state or plugin root so cache/state prefers `${CLAUDE_PLUGIN_DATA}` and version lookup still works when binaries run outside the repo root.
- Extend deterministic coverage for setup, wrappers, update-check, and version behavior under both `CLAUDE_PLUGIN_DATA` and legacy fallback paths.
- Update user-facing docs only where the setup/runtime behavior description changes.

## Non-Goals

- Changing the release packaging or tarball contents from `FEAT-001`.
- Introducing a new install flow or `install.sh` behavior from `FEAT-003`.
- Changing product-facing agents, skills, templates, wizard behavior, or eval harness behavior.
- Removing `CONTEXT_LIBRARY_COMPILED_DIR` or `CONTEXT_LIBRARY_STATE_DIR` compatibility paths.

## Current Gap

- `setup` currently writes compiled artifacts to `${CONTEXT_LIBRARY_COMPILED_DIR:-$SCRIPT_DIR/bin/.compiled}`, which is lost when Claude updates the plugin directory.
- Wrapper execution currently resolves compiled binaries from the repo-local `bin/.compiled` path unless `CONTEXT_LIBRARY_COMPILED_DIR` is set.
- `src/tools/update-check.ts` stores cache under `${CONTEXT_LIBRARY_STATE_DIR:-~/.context-library}` and does not prefer Claude’s persistent plugin data directory.
- `src/tools/version.ts` resolves `VERSION` from `CONTEXT_LIBRARY_PLUGIN_ROOT` or a repo-relative path and does not account for compiled binaries running from `${CLAUDE_PLUGIN_DATA}` while the plugin root remains elsewhere.

## Architectural Boundaries

- Shell path selection belongs in `setup` and the shared wrapper helper, not duplicated across each wrapper script.
- TypeScript environment resolution belongs in the affected CLI tools or shared helpers if the same logic is needed in more than one tool.
- This slice should not change the product skill surface or introduce Claude-host-specific assumptions outside the documented env fallback chain.
- Tests should stay integration-oriented: execute the real shell entrypoints and CLI code with controlled environment variables instead of mocking internal path helpers.

## Symphony Layer Mapping

| Layer | In scope for this slice | What does not belong in this layer for issue `#179` |
|-------|--------------------------|-----------------------------------------------------|
| Policy | Preserve and document the env precedence contract for compiled binaries and state: `CLAUDE_PLUGIN_DATA` first, legacy env overrides second, current defaults last. | No release-policy changes, host-support expansion, semver/versioning policy changes, or new product-surface guarantees beyond the stated fallback order. |
| Configuration | Environment-variable resolution and path selection rules in shell and TypeScript entrypoints. | No new config files, wizard inputs, user prompts, or persistent settings formats. |
| Coordination | Keep path-precedence decisions centralized in the shared shell wrapper helper and the affected CLI resolution helpers rather than re-encoding them in each wrapper. | No agent orchestration changes, no contributor-workflow changes, and no new multi-step install choreography such as the upcoming `install.sh` work. |
| Execution | `setup` writes compiled binaries into the resolved compiled directory; public wrappers execute the resolved compiled binary or fall back to `bun run`; CLI tools resolve state/version paths under the new precedence chain. | No feature work in agents, skills, templates, wizard runtime, or release packaging behavior. |
| Integration | Verify the Claude-host environment contract end-to-end across shell wrappers, compiled binaries, `VERSION` lookup, and update-check cache/state behavior. | No new external service integrations, release workflow changes, or cross-repo distribution mechanics. |
| Observability | Integration tests and the manual setup check provide evidence that the precedence chain behaves correctly under Claude and fallback environments. | No new telemetry, metrics, logging schema, or monitoring pipeline work. |

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Setup / distribution workflow | `setup` | Compiled binaries build into `${CLAUDE_PLUGIN_DATA}/bin/.compiled/` when Claude provides a persistent data dir; otherwise current behavior remains intact. |
| CLI wrapper execution | `bin/_alexandria-wrapper-lib.sh`, `bin/alexandria-*` | Wrappers resolve compiled binaries from Claude plugin data first, then legacy overrides and repo-local fallback. |
| Version / update CLI tools | `src/tools/update-check.ts`, `src/tools/version.ts`, `src/lib/version.ts` if needed | Update-check cache prefers `${CLAUDE_PLUGIN_DATA}` and version resolution remains correct when binaries execute from outside the repo tree. |
| Deterministic integration tests | `tests/setup.test.ts`, `tests/update-check.test.ts` | Coverage proves both Claude plugin data behavior and the fallback chain. |
| User-facing docs | `README.md` and/or release-plan docs only if runtime behavior text becomes stale | Docs match the persistent binary/state behavior. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| CLI setup/distribution workflow | Runtime path selection changes for compiled binaries and cache/state | Keep tests and any setup/runtime docs aligned with the new fallback order. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Setup + wrapper integration | `bun test tests/setup.test.ts` | Covers compiled output location, wrapper resolution order, and shell behavior. |
| Update-check + version integration | `bun test tests/update-check.test.ts` | Covers state/cache location and version resolution under env overrides. |
| Repo TS/shell/docs gates | `bun run check` | Runs shellcheck, shfmt, TypeScript, linting, and docs formatting gates for touched files. |
| Full deterministic suite | `bun test` | Repo build standard for merge readiness. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Setup / wrappers / update-check infrastructure | No product-skill eval coverage; this is maintainer/runtime infrastructure | No eval rerun planned | Deterministic tests are sufficient because no product-facing reusable skill or agent behavior changes. |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Wrapper and setup logic drift apart on path precedence | Centralize precedence in the shared shell helper where possible and add tests for both setup output and wrapper lookup order. |
| Compiled binaries run from `${CLAUDE_PLUGIN_DATA}` but fail to find the checked-in `VERSION` file | Keep plugin-root resolution explicit and test version lookup separately from compiled-binary directory selection. |
| Local development or non-Claude installs regress when `CLAUDE_PLUGIN_DATA` is unset | Preserve current fallback order exactly and add explicit fallback tests. |
| Docs drift from actual runtime behavior | Update any setup/runtime wording in the same slice if the current text claims binaries always live under repo-local `bin/.compiled/`. |

## Implementation Steps

1. Add a shared shell resolution path for compiled binaries that prefers `CLAUDE_PLUGIN_DATA`, then update setup to build into the same resolved directory.
2. Adjust TypeScript config resolution in update-check and version tooling so state prefers `CLAUDE_PLUGIN_DATA` and version lookup still follows plugin root correctly.
3. Extend setup and update-check integration tests for Claude-plugin-data behavior and unchanged fallback behavior.
4. Review touched docs for stale runtime-path statements and update only the directly affected text.
5. Run targeted deterministic tests, then `bun run check` and `bun test`, followed by a manual diff review.

## Acceptance / Exit Criteria

1. `./setup` writes compiled artifacts under `${CLAUDE_PLUGIN_DATA}/bin/.compiled/` when `CLAUDE_PLUGIN_DATA` is set.
2. Wrappers load compiled binaries from `${CLAUDE_PLUGIN_DATA}/bin/.compiled/` before legacy override and repo-local fallback paths.
3. `update-check` stores cache in `${CLAUDE_PLUGIN_DATA}` when set and falls back cleanly when unset.
4. Version lookup still resolves the checked-in `VERSION` file correctly in repo-local and symlinked execution paths.
5. Relevant deterministic tests pass, followed by `bun run check` and `bun test`.

## Deferred Follow-Ups

1. Verify the same persistent-data contract in the forthcoming `install.sh` flow under `FEAT-003`.
2. Consider extracting shared env/path resolution helpers if additional CLI tools start depending on `${CLAUDE_PLUGIN_DATA}` beyond update-check and version.
