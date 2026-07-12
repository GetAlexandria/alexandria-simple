# Issue 271 Technical Plan

- Issue reference:
  [#271](https://github.com/GetAlexandria/alexandria-internal/issues/271)
- Goal: make `ax start all` from an installed Alexandria `0.12.x` project
  launch Fabro, the Viewer, and the managed Codex substrate without requiring an
  Alexandria source checkout.
- Linked product plan: no product-level plan is linked from #271. Related
  context is
  `docs/alexandria/plans/ax2-codex-managed-session/plan.md`,
  `docs/alexandria/plans/plugin-distribution/release.md`, and
  `docs/alexandria/plans/178-dist-tarball/plan.md`.

## Scope

- Update the AX Codex plugin marketplace discovery path so it supports the
  installed/release payload shape as the primary product path, not only the
  monorepo checkout shape.
- Keep `ax start all` deterministic: Codex-enabled startup either starts the
  managed Codex app-server or returns a structured operational failure with a
  specific recovery instruction.
- Ensure the released plugin payload includes Codex marketplace metadata that can
  be registered from the installed plugin root.
- Add black-box regression coverage for an installed compiled `ax` binary plus
  installed Alexandria plugin payload, with no monorepo marketplace dependency.
- Add black-box error coverage that distinguishes a missing Codex CLI from
  missing Alexandria Codex marketplace metadata.
- Update #178 before closing #271 so #178 covers the broader post-0.12
  distribution/packaging framing and links #271 as the immediate shipped-runtime
  fix.

## Non-Goals

- Do not redesign the full Alexandria distribution model from #178 in this
  slice.
- Do not introduce npm-based plugin installation, official marketplace
  publishing, or automatic Codex plugin updates.
- Do not change guided play behavior, Raven wording, or the
  `packages/alexandria-plugin/skills/ax-start/SKILL.md` greeting flow unless a
  failing test proves the skill instructions are wrong.
- Do not change the meaning of `--no-codex`; it remains the explicit way to
  start Fabro and the Viewer without the managed Codex substrate.
- Do not write to `docs/alexandria/library/`.

## Linked Product-Plan Summary

- `ax2-codex-managed-session` established the intended local supervisor shape:
  `ax start all` starts Fabro, the Viewer/runtime API, a Codex app-server, and
  the internal Codex host supervisor unless Codex is disabled.
- `plugin-distribution/release.md` treated Codex plugin compatibility as
  deferred before the 0.12 line shipped. #271 is the narrow shipped-runtime fix
  now that Codex is on the default `ax start all` path.
- `178-dist-tarball` is stale for current `main`: it references older
  repository names and pre-0.12 packaging assumptions. It should be reframed as
  the broader distribution follow-up, while #271 fixes the immediate installed
  runtime failure.

## Current Gap

- `packages/ax/src/domain/codex-plugin.ts` currently accepts only this source
  checkout shape:
  `.agents/plugins/marketplace.json` plus
  `packages/alexandria-plugin/.codex-plugin/plugin.json`.
- The installer and upgrade flow install the plugin payload under
  `.claude/plugins/alexandria`, while the compiled `ax` binary and Viewer assets
  live under the AX install directory. The current resolver walks near the AX
  source/module path and executable path, so it misses the installed plugin
  target.
- The release asset builder already synthesizes an archive-local Claude
  marketplace, but the tests do not currently assert a scoped Codex marketplace
  in the plugin archive.
- `packages/ax/tests/viewer.test.ts` has a managed Codex start test, but its
  fake Codex accepts all plugin commands and the test runs from the development
  checkout. It does not prove that an installed compiled binary can discover the
  released plugin payload.
- Spawn failures from the `codex` command and marketplace discovery failures can
  collapse into operational errors that do not clearly tell the user whether
  Codex itself is missing or Alexandria marketplace metadata is missing.

## Architectural Boundaries

- AX owns deterministic discovery, process startup, error classification, exit
  codes, and stdout/stderr contracts for `ax start all`.
- The Alexandria plugin package owns plugin payload metadata, skills, workflows,
  and manifests. This slice may add or package Codex marketplace metadata, but it
  should not change skill behavior.
- Release and public-repo tooling own the installed artifact shape. If the
  installed plugin root needs a scoped Codex marketplace, generate or preserve it
  in the release payload rather than relying on a monorepo-only root file.
- The Codex CLI remains an external dependency. Tests should use fake Codex
  binaries for deterministic command assertions and only use a real Codex CLI as
  optional manual smoke coverage.
- Keep the failure mode explicit. This plan does not silently downgrade a
  Codex-enabled `ax start all` to Codex-disabled success; it returns a clear
  operational failure that names `ax start all --no-codex` as the recovery path.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| AX Codex marketplace resolver | `packages/ax/src/domain/codex-plugin.ts` | Resolve a marketplace from installed plugin roots, public/source roots, and validated marketplace manifests instead of hard-coding the monorepo package path |
| AX Codex app-server startup | `packages/ax/src/effects/codex-app-server.ts` | Pass project/env context into plugin installation and surface typed Codex plugin install failures |
| `ax start all` CLI output | `packages/ax/src/commands/start.ts` if needed | Preserve existing JSON/human success output; ensure Codex startup failures return stable exit `1` with precise stderr and no command data on stdout |
| Release plugin payload | `packages/deploy/src/build-release-assets.ts`, `packages/deploy/src/build-release-assets.test.ts` | Ensure the plugin archive contains `.codex-plugin/plugin.json` and a scoped `.agents/plugins/marketplace.json` whose Alexandria plugin source resolves to the archive root |
| Public repo sync / local release harness | `packages/plugin-runtime/src/sync-public-repo.ts`, `packages/plugin-runtime/src/sync-public-repo.test.ts`, `packages/ax/e2e/fabro-product/run.ts` if needed | Keep generated public and local E2E release payloads aligned with the Codex marketplace shape used by the installer |
| AX black-box tests | `packages/ax/tests/viewer.test.ts` and/or a focused `packages/ax/tests/codex-plugin.test.ts` | Cover compiled installed-layout startup, missing marketplace, missing Codex CLI, exit codes, stderr, and important JSON fields |
| Issue tracking | GitHub issue #178 | Reframe #178 around post-0.12 distribution and link #271 as the immediate runtime fix |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `ax-start` skill | No intended text or workflow change. The deterministic `ax start all` command it depends on becomes usable with the installed Codex substrate. | No skill eval rerun unless the skill file changes. |
| Codex-backed host behavior | Codex sessions launched from installed projects can load the Alexandria Codex plugin and receive managed wake delivery. | Covered by AX black-box tests with a fake Codex app-server. |
| Plugin packaging | Installed Alexandria plugin payload gains or preserves Codex marketplace metadata. | Validate package metadata when plugin files change and update release payload tests. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX targeted tests | `pnpm --filter @alexandria/ax run test -- tests/viewer.test.ts` | Covers `ax start all`, compiled binary layout, Viewer/Fabro/Codex JSON fields, and missing-dependency error behavior |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Ensures resolver and Effect boundary changes stay typed |
| AX lint | `pnpm --filter @alexandria/ax run lint` | Keeps package style and imports clean |
| Release payload tests | `bun test packages/deploy/src/build-release-assets.test.ts` | Verifies the release plugin archive contains scoped Codex marketplace metadata and the expected plugin manifest |
| Public sync tests | `bun test packages/plugin-runtime/src/sync-public-repo.test.ts` if public sync changes | Ensures generated public repo metadata still contains the correct root marketplace and plugin payload metadata |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` if `packages/alexandria-plugin` metadata changes | Confirms plugin structure remains valid after payload metadata edits |
| Broad regression gate | `pnpm run check` and `pnpm test` before merge when practical | Catches cross-package lint, type, formatting, and test regressions after the targeted suite is green |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `ax start all` CLI behavior | Deterministic AX tests | Add black-box installed-layout tests; no eval harness coverage required | `pnpm --filter @alexandria/ax run test -- tests/viewer.test.ts` |
| Plugin packaging metadata | Deterministic deploy and sync tests | Add archive assertions; no eval harness coverage required | `bun test packages/deploy/src/build-release-assets.test.ts` |
| `ax-start` skill | Product skill exists, but the skill text is not changing | No eval rerun unless the skill file is edited | None for this slice |
| Reusable agent behavior | No agent prompt changes intended | No eval action | None |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| A test can pass by accidentally finding the monorepo `.agents/plugins/marketplace.json` instead of the installed payload | Add a compiled-binary black-box test that runs from temporary install/project directories and asserts the fake Codex command receives the installed plugin marketplace root |
| Hard-coding the marketplace name keeps working in source but fails for public or release metadata with a different name | Parse the marketplace manifest and pass the discovered marketplace name to `codex plugin add`; keep the existing name only as compatibility data in generated metadata |
| Installed project-local and global plugin targets diverge | Search in deterministic priority order: explicit test/support override if added, project-local `.claude/plugins/alexandria`, user-global `.claude/plugins/alexandria`, Claude cache roots already used for workflow lookup, then source/public ancestor candidates |
| Missing Codex CLI errors get reported as missing Alexandria metadata, or vice versa | Use typed install failures or clearly classified error messages; add separate black-box tests for missing Codex binary and missing marketplace metadata |
| Release tooling ships `.codex-plugin/plugin.json` but not a marketplace file Codex can register | Add release archive assertions for both files and for a marketplace source that resolves to the plugin archive root |
| Codex plugin CLI behavior changes across Codex versions | Keep deterministic fake-CLI tests for AX's command contract, preserve real Codex stderr on command failure, and run a manual real-Codex smoke before closing when a local authenticated Codex CLI is available |
| `ax start all` can start Fabro before Codex installation fails, leaving partial runtime state | Keep the exit non-zero, make stderr clear that Codex startup failed, and include the `ax start all --no-codex` recovery command. Do not report overall success when Codex was requested and did not start. |

## Implementation Steps

1. Refactor `packages/ax/src/domain/codex-plugin.ts` around a small resolved
   marketplace value: marketplace root, marketplace name, plugin name, and
   resolved plugin root.
2. Replace `sourceRootHasAlexandriaCodexPlugin()` with manifest-backed
   validation: a candidate root must have `.agents/plugins/marketplace.json`,
   contain the `alexandria` plugin, and point to a local plugin root containing
   `.codex-plugin/plugin.json`.
3. Add candidate roots for installed payloads:
   project-local `.claude/plugins/alexandria`, user-global
   `$HOME/.claude/plugins/alexandria`, relevant Claude plugin cache roots, and
   existing source/public ancestor shapes.
4. Pass `projectRoot` and environment context from
   `packages/ax/src/effects/codex-app-server.ts` into
   `ensureAlexandriaCodexPluginInstalled()` so discovery is based on the project
   being started, not only the AX executable location.
5. Classify Codex plugin installation failures so missing Codex CLI, missing
   Alexandria marketplace metadata, and non-zero `codex plugin ...` exits produce
   distinct stderr text and stable operational exit code `1`.
6. Update release payload generation so the installed plugin archive includes a
   scoped Codex marketplace at `.agents/plugins/marketplace.json` with the
   Alexandria plugin source resolving to `./`, alongside
   `.codex-plugin/plugin.json`.
7. Update release/public sync tests and any local E2E release harness fixture so
   they reflect the scoped Codex marketplace shape.
8. Add or extend AX black-box tests:
   - compiled installed `ax` plus installed plugin payload starts
     `ax start all --json` with fake Fabro and fake Codex,
   - fake Codex logs `plugin marketplace add <installed-plugin-root>` and
     `plugin add alexandria --marketplace <manifest-name>`,
   - JSON output includes `status: "running"`, Viewer status, server status, and
     Codex `status: "running"`,
   - missing Codex CLI exits `1` with a Codex CLI-specific message,
   - missing Alexandria marketplace exits `1` with a marketplace-specific
     message,
   - `ax start all --no-codex --json` still reports Codex disabled and exits `0`.
9. Run targeted verification, then the broader check/test gate when practical.
10. Update GitHub issue #178 before closing #271. The update should remove stale
    `tmp`/obsolete-path framing, describe the post-0.12 distribution problem
    across the plugin payload, AX binary, Fabro sidecar, and Codex marketplace
    metadata, and link #271 as the immediate installed-runtime fix.

## Acceptance / Exit Criteria

1. A fresh installed-layout test project using release-shaped `0.12.x` artifacts
   can run `ax start all --json` and start Fabro, the Viewer, and the managed
   Codex app-server without `--no-codex`.
2. Codex marketplace discovery no longer requires
   `packages/alexandria-plugin/.codex-plugin/plugin.json` under a monorepo source
   checkout.
3. The release plugin archive contains the Codex plugin manifest and a scoped
   Codex marketplace that can be registered from the installed plugin root.
4. Missing Codex CLI and missing Alexandria Codex marketplace metadata produce
   distinct operational failures with stable exit code `1`, empty stdout, and
   actionable stderr.
5. `ax start all --no-codex --json` remains a working explicit fallback and
   reports Codex as disabled.
6. Regression tests cover installed/release payload shape, exit codes, stderr,
   and important JSON output fields.
7. Plugin validation is run if plugin package metadata changes.
8. #178 is updated to reflect the broader post-0.12 packaging/distribution
   framing and links #271 as the immediate shipped-runtime fix.

## Deferred Follow-Ups

1. The broader #178 distribution design: official marketplace strategy,
   auto-update behavior, release artifact topology, and long-term Codex plugin
   compatibility policy.
2. A soft-degraded `ax start all` mode that keeps the Viewer running when Codex
   installation fails, if product decides non-zero fail-fast is too strict.
3. Real-Codex nightly or maintainer smoke coverage that exercises current Codex
   plugin commands against authenticated Codex installations.
4. Public documentation updates beyond the #178 issue reframing, unless the
   implementation changes user-facing install or start instructions.
