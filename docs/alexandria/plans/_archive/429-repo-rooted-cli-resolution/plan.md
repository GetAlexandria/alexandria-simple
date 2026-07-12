# Issue 429 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#429`
- Goal: make repo-rooted and real-layout compiled CLI entrypoints resolve the Alexandria plugin root correctly so repo-local command data and subprocess paths work without requiring wrapper-provided env vars.
- Linked product plan: no separate checked-in product `plan.md` was linked from the sanitized issue context; the issue summary itself is the upstream intent for this slice.

## Scope

- Fix shared plugin-root discovery for TypeScript-backed CLIs when they run from a real compiled layout such as `<plugin-root>/bin/.compiled/<tool>`
- Start with `alexandria-eval` and extend the fix to other command surfaces that clearly share the same root-resolution seam
- Add deterministic coverage that exercises direct compiled execution and compiled `alxndr` command discovery against a realistic temp plugin layout

## Non-Goals

- Migrating additional tools under `alxndr`
- Changing the eval CLI feature set beyond making its existing repo-local data discovery reliable
- Reworking setup, install, or wrapper contracts that already function when `ALEXANDRIA_PLUGIN_ROOT` is explicitly exported
- Adding eval-harness coverage, since no product skill or agent behavior changes in this slice

## Current Gap

- `src/lib/plugin-paths.ts` currently resolves the plugin root from env vars or from `__dirname`.
- That fallback works for Bun source execution but fails for directly executed compiled binaries, where the runtime script directory is not the checked-in plugin layout.
- The failure is user-visible in tools like `alexandria-eval`, which then looks for `tests/eval-cases` under the wrong root and reports that no eval cases exist.
- The same seam also affects other compiled entrypoints that rely on `resolvePluginRoot`, including `alxndr` command discovery for `update-check` and direct version resolution from compiled layout.

## Architectural Boundaries

- Keep the fix centralized in shared plugin-root resolution rather than scattering command-specific repo-root heuristics across individual tools.
- Preserve the existing precedence of explicit environment configuration from wrappers and hosts.
- Limit downstream changes to call sites or tests that need to expose the new compiled-layout behavior; do not redesign the CLI architecture.
- Keep contributor workflow behavior repo-generic: no assumptions that only this repository layout matters beyond the existing Alexandria plugin structure markers.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Shared plugin-root resolver | `src/lib/plugin-paths.ts` | Adds fallback discovery from real compiled executable layout so direct compiled CLIs can locate the plugin root without wrapper-exported env vars |
| Eval CLI | `src/tools/eval-cli.ts`, potentially `src/tools/eval-harness.ts` if call-site plumbing changes are needed | `alexandria-eval` resolves `tests/eval-cases`, `tests/evals`, and related repo-local files correctly when run as a compiled binary |
| Unified CLI router / update-check dispatch | `src/cli/main.ts`, `src/tools/update-check.ts`, `src/tools/version.ts` if signatures need plumbing | `alxndr` subcommands that rely on plugin-root-relative file paths or spawned tool entrypoints continue to work from compiled layout |
| Deterministic coverage | `src/tools/eval-cli.test.ts`, new or existing resolver tests under `src/lib/`, and CLI tests as needed | Adds direct compiled-layout regression coverage for the shared seam rather than only env-configured execution |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | Compiled binaries can discover their plugin root from the installed filesystem layout when env configuration is absent | Update deterministic tests for direct compiled execution and command discovery |
| Setup / distribution workflow | No behavior change to setup itself; compiled artifacts now behave more like real installed commands when invoked directly | None beyond test coverage |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Shared root-resolution seam | `bun test src/tools/eval-cli.test.ts src/cli/main.test.ts src/lib/plugin-paths.test.ts` | Verifies direct compiled eval execution, compiled `alxndr` command discovery, and resolver edge cases |
| Repo quality gate | `bun run check` | Covers shell, TypeScript, markdown, formatting, and typecheck on the touched surfaces |
| Regression sweep | `bun test` | Confirms the broader deterministic suite still passes after the shared resolver change |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI root resolution and command discovery | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI coverage is the quality gate |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| A resolver tweak could break existing wrapper- or host-configured plugin roots | Keep env vars highest priority and add targeted tests that assert configured roots still win |
| A compiled-layout heuristic could over-match unrelated executable paths and point at the wrong directory | Anchor fallback detection on Alexandria plugin markers such as `.claude-plugin/plugin.json` and known executable layout segments instead of raw parent traversal alone |
| Fixing only `eval-cli` could leave the same seam broken for router-driven commands | Cover at least one additional compiled command path (`alxndr update-check` and/or version) in tests before considering the slice complete |

## Implementation Steps

1. Add the issue-specific plan doc for issue 429.
2. Refactor shared plugin-root resolution so it can fall back through compiled executable layout in addition to env and source-directory resolution.
3. Update any affected CLI call sites to use the shared resolver signature without changing existing wrapper behavior.
4. Add deterministic tests for direct compiled `alexandria-eval` execution and compiled `alxndr` command discovery from a realistic temp plugin root.
5. Run targeted tests, then `bun run check` and `bun test`.

## Acceptance / Exit Criteria

1. Direct compiled `alexandria-eval` can discover repo-local eval cases from a realistic `<plugin-root>/bin/.compiled/` layout without `ALEXANDRIA_PLUGIN_ROOT`.
2. At least one additional command surface sharing the seam is covered and verified from compiled layout.
3. Explicit env-based plugin-root configuration still overrides fallback discovery.
4. Targeted deterministic tests, `bun run check`, and `bun test` pass locally.

## Deferred Follow-Ups

1. Audit whether any remaining compiled or host-invoked tools should use additional direct real-layout smoke coverage beyond the commands covered here.
2. If future distribution changes introduce a different compiled layout, extend the shared resolver in one place rather than adding tool-local path logic.
