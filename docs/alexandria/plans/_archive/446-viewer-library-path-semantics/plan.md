# Issue 446 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#446`
- Goal: align `alexandria-viewer --library` with the viewer help text and the Alexandria layouts maintainers actually have on disk so docs-root and legacy `cards/` inputs resolve cleanly.
- Linked product plan: issue summary only; no separate checked-in product plan was linked from the provided issue context.

## Scope

- Normalize the viewer CLI `--library` input so it accepts Alexandria docs roots and real library directory layouts used in fixtures and installed copies.
- Preserve the viewer’s default behavior when no override is provided.
- Update the viewer workspace path helpers/config so legacy `docs/alexandria/cards` layouts resolve to the actual graph root instead of incorrectly appending `/library`.
- Add black-box regression coverage for the broken invocation shapes from this issue.
- Update checked-in CLI contract notes if needed so docs stay aligned with runtime behavior.

## Non-Goals

- Reworking viewer page rendering, file watching, or static-output structure beyond the path-resolution layer.
- Broadly normalizing every viewer-adjacent path surface to the full repo-root contract used by other `alxndr` commands unless the implementation naturally reuses shared logic.
- Changing Alexandria library migration policy between legacy `cards/` and canonical `library/` layouts.
- Agent, skill, or eval-harness changes.

## Current Gap

- `src/tools/viewer.ts` forwards `--library` directly into the viewer env and advertises it as an Alexandria docs-root override.
- `packages/viewer/astro.config.mjs` and `packages/viewer/src/lib/alexandria-paths.ts` only treat `library/` as the canonical graph leaf, so docs roots that contain legacy `cards/` still resolve to a nonexistent `docs/alexandria/library`.
- Real fixture layouts in `tests/fixtures/taskflow-healthy/docs/alexandria/` and related fixtures still use `cards/`, so realistic `alexandria-viewer build --library <docs-root>` invocations fail even though the CLI help says they should work.
- Existing viewer tests cover docs roots and explicit `library/` env inputs, but they do not lock in the legacy `cards/` contract or the broken `--library <docs-root>` path from the issue.

## Architectural Boundaries

- Keep the public `--library` contract at the viewer CLI boundary and shared viewer path helpers, not scattered across Astro pages or collection loaders.
- Preserve the viewer package’s ownership of “docs root vs graph root vs plans root” derivation; the CLI should validate and normalize inputs, not hardcode viewer collection internals.
- Reuse the repo’s Alexandria path semantics where they fit, but avoid widening this slice into unrelated `alxndr` command behavior.
- Keep support for both canonical `library/` and legacy `cards/` layouts deterministic and read-only.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/446-viewer-library-path-semantics/plan.md` | Captures the repo-specific scope, coverage, and risks for issue `#446` |
| Viewer CLI contract | `src/tools/viewer.ts` | `--library` accepts Alexandria docs roots and real library directory layouts with explicit validation/guidance instead of blindly forwarding a path |
| Viewer workspace path helpers | `packages/viewer/src/lib/alexandria-paths.ts`, `packages/viewer/astro.config.mjs` | The viewer resolves canonical `library/` and legacy `cards/` graph roots correctly from the configured docs-root/library input |
| Deterministic coverage | `src/tools/viewer.test.ts` | Black-box tests cover docs-root overrides and legacy `cards/` layouts for the real viewer CLI |
| CLI documentation note | `docs/alexandria/cli-report.md` if updated | The checked-in CLI path report includes the viewer contract if this slice changes user-visible semantics |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| Viewer CLI | `alexandria-viewer --library` matches real Alexandria layouts instead of assuming a canonical `library/` leaf under every docs root | Keep viewer CLI tests and any CLI contract notes aligned |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Covers the real wrapper/runtime behavior for docs-root and legacy `cards/` overrides |
| Repo quality gate | `bun run check` | Validates formatting, TypeScript, markdown, and shell state for the touched slice |
| Wider regression coverage | `bun test` | Confirms the viewer path fix does not regress the broader deterministic suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer CLI path handling | Deterministic CLI coverage only | No eval rerun needed | N/A |
| Agents / skills | Not changed in this issue | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Fixing docs-root overrides only in the CLI could still leave direct env-based viewer launches broken on legacy `cards/` layouts | Update the viewer workspace path helpers/config as part of the same slice and add coverage for env-driven legacy-library inputs |
| Broadening input handling could accidentally accept arbitrary directories that are not real Alexandria layouts | Resolve inputs through Alexandria-aware checks and fail with explicit guidance when neither a docs root nor a library root can be inferred |
| Viewer tests could pass only against temporary `library/` fixtures and miss the real legacy layout that motivated the issue | Add a regression that uses `tests/fixtures/taskflow-healthy/docs/alexandria` and/or its `cards/` directory directly |
| Documentation could drift again if runtime behavior changes but the CLI report still describes only the earlier path-normalization slice | Update the checked-in CLI report if the final command contract needs to name viewer-specific accepted path forms |

## Implementation Steps

1. Add this issue-specific plan under `docs/alexandria/plans/446-viewer-library-path-semantics/`.
2. Reproduce the failing viewer invocation against the real `taskflow-healthy` fixture to confirm the current regression.
3. Update `src/tools/viewer.ts` to resolve and validate `--library` through Alexandria-aware path semantics instead of forwarding raw input blindly.
4. Update viewer workspace path helpers/config to recognize legacy `cards/` graph roots in addition to canonical `library/`.
5. Add or extend viewer black-box tests to cover docs-root overrides and legacy `cards/` inputs.
6. Update `docs/alexandria/cli-report.md` if the checked-in path contract needs to mention the viewer.
7. Run targeted viewer tests, then `bun run check`, then `bun test`.
8. Perform a local review pass against this plan before PR handoff.

## Acceptance / Exit Criteria

1. `alexandria-viewer build --library <docs-root>` works for fixture/install layouts that still store cards under `docs/alexandria/cards`.
2. `alexandria-viewer build --library <library-root>` works for both canonical `library/` and legacy `cards/` directory inputs.
3. Invalid viewer `--library` inputs fail with concrete guidance instead of a downstream ENOENT on an invented `/library` path.
4. Viewer deterministic tests cover the accepted path shapes and pass locally.
5. `bun run check` passes locally.
6. `bun test` passes locally.

## Deferred Follow-Ups

1. If additional viewer entry points or docs expose this path contract later, centralize the wording so help text and docs cannot drift.
2. If the repo eventually fully migrates away from legacy `cards/` layouts, remove the fallback deliberately in a dedicated compatibility-removal slice rather than incidentally here.
