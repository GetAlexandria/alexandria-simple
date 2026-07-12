# Issue #683: Config Owns The Library Root

- Issue: [#683](https://github.com/GetAlexandria/alexandria-internal/issues/683), "Config owns the library root: library.root in alexandria-config, server-resolved viewer default, --library-root override"
- Goal: make `.alexandria/alexandria-config.json` the single source of truth for the product Library section's default root, with explicit `?libraryRoot=` and process-level `--library-root` overrides for QA.
- Linked product plan: `docs/alexandria/plans/library-migration/plan.md` §2.1 and §3 Slice 3.
- Issue comments checked: the only issue comment is the Fabro local run link for `01KWZA3CPS61WQ5050BCSEEXYM`; it adds no extra technical constraints.

## Scope

- Add optional `library.root` support to the AX config model while preserving absent-key behavior.
- Resolve the default library root through AX loaders in this precedence order: request `?libraryRoot=` where applicable, process `--library-root`, config `library.root`, then derived `<workspace>/library`.
- Extend the existing runtime health/metadata surface with the resolved default library root; do not add a second config endpoint.
- Change the viewer Library section so its default root comes from the runtime/server default instead of `docs/alexandria/library-bundles.json`.
- Keep `docs/alexandria/library-bundles.json` alive as the Builder bundle registry for Back, Drafts, Notepad, and Confirm.
- Add black-box CLI/runtime tests for config absent, config set, process flag set, query param set, all sources stacked, invalid config, and Builder registry regression.
- Update this repo's `.alexandria/alexandria-config.json` with explicit `"library": { "root": "docs/alexandria/library" }`.

## Non-Goals

- Do not edit card content, sidecar JSONs under the library, draft-overlay data, or `docs/alexandria/library/`.
- Do not delete or fold `docs/alexandria/library-bundles.json`; it remains Builder-only.
- Do not change `.github/workflows`.
- Do not redesign `bundlePath`, `draftPatchLog`, empty-library confirmation, or draft-overlay semantics.
- Do not change Alexandria plugin skills, agents, or reusable play contracts in this slice.

## Linked Product-Plan Summary

The library migration plan establishes config, card files, ledger, and projections as the four homes for library data. Section 2.1 adds `library.root` to config and rules that the viewer gets its default root from the runtime server, not the checked-in bundle registry. Section 3 Slice 3 names this implementation slice: add the config field, have loaders resolve config before the derived default, expose the resolved root from the runtime server, add `ax start --library-root`, demote `library-bundles.json` to Builder-only, and update the repo config. Ruling 4 keeps the registry as the Builder QA bundle list only.

## Current Gap

- `packages/ax/src/domain/config.ts` has no `library` config model; unknown top-level keys are preserved, but there is no typed `library.root`.
- `packages/ax/src/effects/library-graph-loader.ts` derives no-override roots from `resolve(storage.workspacePath, "library")` in graph, catalog, and card-detail loaders.
- `packages/ax/src/effects/runtime-server.ts` forwards only request query params into the loaders and `/api/health` exposes project/workspace metadata, not the resolved library root.
- `packages/ax/src/commands/viewer.ts` and `packages/ax/src/commands/start.ts` do not parse `--library-root`.
- `packages/viewer/src/components/library/library-mode-config.ts` derives `ALEXANDRIA_PRODUCT_LIBRARY_ROOT` from `library-bundle-registry.ts`, coupling the Library section's default root to the Builder registry.
- Viewer tests currently pin the registry-derived default root; they need to pin server/default-root behavior while preserving Builder registry behavior.

## Architectural Boundaries

- AX config parsing owns shape normalization and excess-property preservation. Project-root containment validation for `library.root` belongs in a resolver that has `projectRoot`, not in raw JSON parsing alone.
- Loader-level root resolution owns the default root for AX reads. Runtime route handlers should pass a process default separately from request query params so `?libraryRoot=` remains the only request-level override.
- Runtime health is the existing metadata/config surface to extend. The viewer must not read workspace files or import config JSON directly.
- Viewer Library-section reads should omit `libraryRoot` unless the route has an explicit `?libraryRoot=` override, allowing no-query runtime routes to exercise the server default. If implementation must retain the existing default draft overlay request for byte-identical no-key behavior, keep only the draft-overlay parameter and do not source any root from the registry.
- Builder remains registry-driven: bundle selection, Drafts pairing, Notepad badge, and Confirm bundle reads continue to use `library-bundles.json`.
- `ax start server` is the Fabro orchestration server today and does not serve library routes. Accept and validate `--library-root` there for CLI contract consistency with the issue text, but document and test that the served-library effect is only observable in `ax start viewer` and `ax start all`.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| Config schema | `packages/ax/src/domain/config.ts` | Add optional `library.root`; preserve unknown `library` subkeys; absent key normalizes to current behavior. |
| Path/root resolution | `packages/ax/src/domain/paths.ts` or a small new AX domain helper | Centralize root resolution and project-root containment errors naming `library.root` or `--library-root`. |
| Project storage / loaders | `packages/ax/src/effects/project-state-loader.ts`, `packages/ax/src/effects/library-graph-loader.ts` | Default graph/catalog/card roots come from config before `<workspace>/library`; process defaults can override config without being treated as request params. |
| Runtime server | `packages/ax/src/effects/runtime-server.ts`, `packages/ax/src/domain/runtime-server.ts` | Startup validates the resolved default; `/api/health` returns it; no-query library routes use process/config/default precedence. |
| CLI start | `packages/ax/src/commands/viewer.ts`, `packages/ax/src/commands/start.ts`, help tests | Parse `--library-root`; include it in help; return stable invalid-input results for missing, empty, or outside-root values. |
| Viewer runtime client | `packages/viewer/src/app/runtime/schemas.ts`, `packages/viewer/src/app/runtime/client.ts` | Decode the runtime health `libraryRoot` field. |
| Viewer Library section | `packages/viewer/src/components/library/library-mode-config.ts`, `LibraryBrowserApp.tsx`, related tests | Stop deriving the Library-section default root from `library-bundle-registry`; keep explicit `?libraryRoot=` override and carry behavior. |
| Builder registry | `packages/viewer/src/components/library/library-bundle-registry.ts`, Builder selector/tests | Preserve registry parsing and bundle-scoped Builder reads. |
| Repo config | `.alexandria/alexandria-config.json` | Add explicit default `library.root` matching current derived root. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Agents | None planned. | No agent prompt or eval update. |
| Skills | None planned. | No skill eval rerun. If implementation unexpectedly changes packaged `packages/alexandria-plugin/skills/ax-start`, run the corresponding plugin validation and note it in the PR. |
| CLI tools | `ax start viewer` and `ax start all` gain `--library-root`; `ax` loaders gain config-owned defaults. | Update help text and black-box CLI tests for output, exit codes, and important fields. |
| Viewer | Library section default root becomes runtime/server-owned; Builder remains registry-owned. | Update viewer unit tests, runtime client schema tests, build/check, and browser validation. |
| Eval harness | No reusable agent/skill behavior changes. | No eval-harness rerun required for this slice. |

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| AX targeted tests | `pnpm --filter @alexandria/ax exec bun test tests/cli.test.ts tests/state.test.ts tests/runtime-server.test.ts tests/viewer.test.ts` | Covers CLI parsing/help, config validation, runtime no-query routes, precedence, and start viewer/all behavior. |
| AX full package | `pnpm --filter @alexandria/ax run typecheck` and `pnpm --filter @alexandria/ax run lint` | Ensures Effect/types and lint rules hold after shared resolver changes. |
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Covers runtime health decoding, Library request selection, explicit query override, and Builder registry regression. |
| Viewer static validation | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Verifies Astro/React build and JSON import changes. |
| Browser validation | `pnpm --filter @alexandria/viewer run test:e2e` | Required because the Library viewer surface changes runtime data loading. |
| Manual smoke, if time allows | `ax start viewer --library-root <in-repo-alt-root> --json`, then fetch `/api/health` and `/api/library/catalog` with and without `?libraryRoot=` | Confirms the shipped CLI/server path matches the test matrix. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| AX CLI/runtime | Deterministic Bun tests, no eval harness. | Add/update black-box tests; no eval. | Covered by AX targeted/full tests above. |
| Viewer Library | Deterministic Bun component/runtime tests and Playwright e2e. | Add/update unit tests and browser validation; no eval. | Covered by viewer test/check/build/e2e above. |
| Agents/skills/plugin | Not touched. | No eval rerun. | None. |

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Process `--library-root` is accidentally passed as `libraryRoot` request input, causing no-query server errors to be classified like bad client params. | Add a separate loader option for process/default root and keep `rootAware` based only on request query params. |
| Config validation needs `projectRoot`, but `parseConfig` only sees JSON. | Keep schema validation in `parseConfig`; perform containment in a shared resolver used by `loadProjectStorage`, loaders, and start commands. |
| Viewer fetches the old registry root before runtime metadata/default resolution is available. | Default viewer reads should omit `libraryRoot` unless the URL has `?libraryRoot=`, letting the server default answer immediately; tests should assert no registry root is used for Library-section defaults. |
| Builder loses its bundle selector while removing registry coupling from the Library section. | Keep `library-bundle-registry.ts` and Builder request tests; add a regression asserting Back/Drafts/Notepad/Confirm still read the selected registry bundle. |
| Existing stale runtime metadata files fail to parse after adding a new metadata field. | Make persisted metadata parsing backward-tolerant if needed, while new `/api/health` responses include the resolved `libraryRoot`. |
| `bundlePath` confirmation reads get conflated with `libraryRoot` precedence. | Preserve existing catalog `bundlePath` gate behavior; apply the issue's precedence table to root selection when no `bundlePath` source is in play. |
| Fresh `ax init` output churns many tests even though absent config must remain supported. | Do not change `ax init` defaults in this slice unless implementation finds a hard requirement; update only this repo's checked-in `.alexandria/alexandria-config.json`. |

## Implementation Steps

1. Add `AlexandriaLibraryConfig` to `packages/ax/src/domain/config.ts` with optional `root`, existing optional/null normalization style, and preservation of unknown `library` subkeys.
2. Add a shared resolver for default library roots. It should return the absolute resolved root plus source (`process`, `config`, or `derived`) and fail with messages naming `--library-root` or `library.root` when a value resolves outside the project root.
3. Update `loadProjectStorage` or adjacent AX storage helpers so loaded config exposes a validated default library root without changing existing workspace/source validation behavior.
4. Update `loadLibraryGraph`, `loadLibraryCatalog`, and `loadLibraryCardDetail` so no request override uses process default, then config `library.root`, then `<workspace>/library`. Keep existing `?libraryRoot=` validation and `bundlePath` catalog behavior.
5. Add `libraryRoot` process/default support to `AlexandriaRuntimeServerOptions`, runtime startup, and library route handlers. Extend `/api/health` and runtime metadata/domain types with the resolved default root.
6. Update `parseViewerArgs`, `formatViewerHelp`, `parseStartAllArgs`, `formatStartAllHelp`, `parseStartServerArgs`, and `formatStartServerHelp` for `--library-root`. Pass it through `runViewer` into the runtime server for viewer/all modes; in server mode, validate it and keep it as a documented no-op because that mode starts only Fabro today.
7. Update viewer runtime schemas/client tests to decode `libraryRoot` from health.
8. Split Library-section default-root selection away from `library-bundle-registry`. Viewer Library reads should use the server default when no `?libraryRoot=` exists and preserve explicit override carry-over across viewer modes.
9. Keep Builder registry wiring intact: `resolvedBuilderBundleForRoute`, fixed Builder modes, Notepad badge, and Confirm continue to use the registry's selected bundle root/draft pair.
10. Update `.alexandria/alexandria-config.json` with explicit `"library": { "root": "docs/alexandria/library" }`.
11. Add the test matrix: config absent, config set to alternate in-repo root, process flag override, query param override, all sources stacked, invalid config outside root, and Builder registry regression.
12. Run deterministic verification and include Director QA required in the PR body.

## Acceptance / Exit Criteria

1. With no `library` key, no-query library graph/catalog/card behavior matches the current `<workspace>/library` default and Builder tabs still resolve from the registry.
2. With config `library.root` set to a valid alternate in-repo path, `/api/library/catalog` with no query returns that root's cards, and AX loaders use that root by default.
3. `ax start viewer --library-root <path>` and `ax start all --library-root <path>` override config for no-query runtime library routes.
4. `?libraryRoot=` overrides process/config/default roots for graph, catalog, and card-detail reads.
5. The stacked case holds: request param wins over process flag, which wins over config, which wins over `<workspace>/library`.
6. A config `library.root` outside the project root fails as a structured CLI/config error naming `library.root`, not as a crash or generic filesystem failure.
7. Unknown `library` subkeys survive parse/serialize normalization and are ignored by root resolution.
8. The Builder bundle selector still lists `docs/alexandria/library-bundles.json` bundles and Back/Drafts/Notepad/Confirm read the selected bundle after the Library section stops using the registry for its default root.
9. This repo's `.alexandria/alexandria-config.json` declares the default `library.root`.
10. No `.github/workflows`, card content, sidecar JSONs, draft-overlay mechanism, or `docs/alexandria/library/` files are changed.

## Deferred Follow-Ups

1. Sidecar dissolution slices from the library migration plan: flows, threads, taxonomy, and draft/cache retirement.
2. Potential future fold of the Builder bundle registry into config, explicitly deferred by Ruling 4.
3. Plugin or `ax-start` skill documentation updates only if a later product decision makes `--library-root` a user-facing documented workflow rather than a QA/testing override.
