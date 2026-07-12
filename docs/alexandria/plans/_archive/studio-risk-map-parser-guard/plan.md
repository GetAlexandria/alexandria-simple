# Technical Plan: Studio Risk-Map Guard Reuses The Viewer Parser

- Issue reference: `#412` — `[studio] Risk-map PR guard reuses the viewer's real parser (close the #384-class gate)`
- Goal: make the Studio at-PR risk-map guard reject exactly the malformed `risk-map.md` files that the viewer's `parseRiskMap` rejects, while preserving the existing canonical-family banding check and no-risk-map behavior.
- Primary surfaces: `studio/tools/check-risk-maps.mjs`, `studio/tools/check.sh`, focused Studio guard fixtures/tests, and the existing viewer parser contract in `packages/viewer/src/components/studio/evalPlan.ts`.

## Scope

- Replace the coarse parser inside `studio/tools/check-risk-maps.mjs` with direct use of `parseRiskMap`, `riskFamily`, and `FAMILY_BY_PREFIX` from `packages/viewer/src/components/studio/evalPlan.ts`.
- Switch only the risk-map check invocation in `studio/tools/check.sh` from `node` to `bun`, because Bun can import the viewer `.ts` module directly.
- Add a deterministic bad-map fixture corpus covering each viewer parser throw condition named in the issue, plus the missing-separator structural divergence.
- Add focused guard tests that exercise the fixture corpus, all current `studio/plays/**/risk-map.md` files, a well-formed map, a directory containing a play with no `risk-map.md`, and a parity case that the old coarse mirror would have accepted.
- Preserve the existing recursive discovery of risk maps under `studio/plays/` and the existing nonzero exit when no risk maps are discovered at all.

## Non-Goals

- Do not change `parseRiskMap`, `riskFamily`, `FAMILY_BY_PREFIX`, `riskMapConformance.test.ts`, or viewer rendering behavior.
- Do not introduce a shared package, transpile step, or build artifact for the parser in this slice.
- Do not wire the guard into GitHub CI beyond the existing `studio/tools/check.sh` path; CI lane work remains the sibling `#413`.
- Do not edit production play records, `studio/plays/**/risk-map.md`, `studio/plays/research/testing/RISKS.md`, or `docs/alexandria/library/`.
- Do not broaden Studio validation outside the risk-map guard.

## Source Context

- The issue names `docs/alexandria/plans/studio-fixes/phase-2-walk/honeydo.md`, but that path is not present in this checkout. The available nearby context is `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`, `studio-operations-quality-plan.md`, and `play-re-sync.md`.
- `studio-operations-quality-plan.md` treats conformance gates, including risk-map drift, as the enforcement layer that catches skipped Studio maintenance steps.
- `play-re-sync.md` names risk-map drift detection as the mechanical guard for E7, while keeping risk re-authoring itself as authored work.
- The viewer package README defines the viewer as the canonical Studio surface; this slice changes only a data guard that protects that surface.

## Current Gap

`studio/tools/check-risk-maps.mjs` currently has its own Markdown table parser and first-cell prefix matcher. It checks that a Coverage table and Eval-plan table exist and that the first cell of each row carries a prefix found in `RISKS.md`.

The viewer's real parser in `packages/viewer/src/components/studio/evalPlan.ts` is stricter. It also rejects malformed coverage states, coverage risk cells with an id but no name, unknown eval scopes, unknown eval types, unparseable targets, non-yes/no `built` values, non-integer `runs`, and tables without a real Markdown separator row. A play-only PR can therefore pass `studio/tools/check.sh` and later fail when a viewer-touching PR runs `riskMapConformance.test.ts`.

The existing viewer conformance test already imports the real parser and verifies every current per-play risk map parses and bands into canonical families. The Studio guard should consume the same parser rather than maintaining a mirror.

## Architectural Boundaries

- Treat `evalPlan.ts` as the parser owner. The Studio guard may import its exported parser and taxonomy helpers, but it must not duplicate the table parser, cell parser, or prefix taxonomy.
- Keep `studio/tools/check-risk-maps.mjs` as the Studio data guard entry point. It should stay a small file-walker and reporter around the viewer parser.
- Use `FAMILY_BY_PREFIX` / `riskFamily` for canonical-family banding. Do not parse `RISKS.md` in the Studio guard as another source of truth; the existing viewer conformance test remains the three-home taxonomy equivalence gate.
- Preserve the shell-runner contract: `sh studio/tools/check.sh` remains the one-shot local Studio data check.
- Keep fixture data outside `studio/plays/` so negative fixtures cannot be mistaken for authored play records.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| Technical plan | `docs/alexandria/plans/studio-risk-map-parser-guard/plan.md` | Records this issue's repo-specific implementation and validation plan without colliding with the unrelated existing `412-...` plan directory. |
| Studio risk-map guard | `studio/tools/check-risk-maps.mjs` | Imports the viewer parser and taxonomy helpers, reports parser errors verbatim, and keeps canonical-family banding via `riskFamily`. |
| Studio check runner | `studio/tools/check.sh` | Runs the risk-map guard and its focused fixture tests under `bun`; other checks stay on their current runtimes. |
| Guard regression fixtures | new `studio/tools/fixtures/risk-maps/**` or equivalent focused fixture area | Provides one known-bad map per viewer parser throw condition, a missing-separator map, a good map, and a no-risk-map directory fixture. |
| Guard regression tests | new `studio/tools/check-risk-maps.test.mjs` or equivalent | Proves the Studio guard and the viewer parser agree on accepted/rejected maps and that old coarse-mirror misses are now caught. |

## Affected Behavior Surfaces

| Surface | Behavior change | Downstream docs/tests/evals |
|---|---|---|
| Studio data guard | Play-only PR validation now fails on the same risk-map parser errors that would fail the viewer conformance suite. | Add focused guard fixtures/tests and run `sh studio/tools/check.sh`. |
| Studio check runner | The risk-map step runs with Bun so the guard can import `.ts` directly. | Keep other `check.sh` steps unchanged; add a runner-level assertion through `check.sh`. |
| Viewer parser contract | No behavior change; the parser becomes a shared runtime dependency for the Studio guard. | Run focused viewer parser/conformance tests to prove the imported contract still passes current maps. |

No reusable product agents, shipped plugin skills, templates, CLI behavior, or eval harness behavior changes in this slice.

## Implementation Plan

1. Refactor `studio/tools/check-risk-maps.mjs` to import `parseRiskMap`, `riskFamily`, and `FAMILY_BY_PREFIX` from `../../packages/viewer/src/components/studio/evalPlan.ts`.
2. Remove the local `parseTables`, `ID_PREFIX`, and `spinePrefixes` parser/taxonomy mirror from the guard.
3. Keep the recursive `findRiskMaps` walk under `studio/plays/`, but make it exportable or otherwise testable without running the CLI main path.
4. Implement the guard validation as:
   - read each discovered map;
   - call `parseRiskMap(text)`;
   - if it throws, add `error.message` unchanged to that file's errors;
   - if it parses, check every `coverage[].id` and every distinct `evals[].risk` with `riskFamily`;
   - report non-canonical ids using canonical prefixes from `Object.keys(FAMILY_BY_PREFIX).sort()`.
5. Keep the existing failure shape: print `FAIL <relative path>`, bullet the errors, print the failed-map count, and exit `1`; keep the "no maps found" path as exit `2`.
6. Change the risk-map guard shebang and `studio/tools/check.sh` invocation for this guard from Node to Bun.
7. Add focused fixtures for:
   - bad coverage state;
   - coverage id without a name;
   - unknown scope;
   - unknown test type;
   - unparseable target;
   - non-yes/no `built`;
   - non-integer `runs`;
   - missing Markdown separator row;
   - non-canonical family prefix;
   - a well-formed map;
   - a directory containing a play with no `risk-map.md`.
8. Add a focused Bun test for the guard that asserts each bad fixture fails with the viewer parser's own message, the well-formed map passes, the no-risk-map sibling is ignored when at least one valid map exists, current `studio/plays/**/risk-map.md` files pass, and a previously coarse-mirror-passing map now fails.
9. Wire the focused guard test into `studio/tools/check.sh` with `bun test`, matching the existing pattern where the runner executes `tools/board-model.test.mjs`.
10. Run the validation commands below and fix only issues inside this slice.

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| Studio one-shot guard | `sh studio/tools/check.sh` | Exercises the updated guard through the same entry point used for Studio data validation, including the bad-map fixture corpus. |
| Focused guard tests | `bun test studio/tools/check-risk-maps.test.mjs` | Proves every known-bad fixture produces the expected viewer parser message and good/no-risk-map cases still pass. |
| Viewer parser parity | `bun test packages/viewer/src/components/studio/evalPlan.test.ts packages/viewer/src/components/studio/riskMapConformance.test.ts` | Confirms the parser contract and existing all-current-maps conformance gate still agree with the Studio guard. |
| Viewer suite, if time permits | `pnpm --filter @alexandria/viewer run test` | Broader regression pass for the viewer Studio tests that already include risk-map conformance. |
| Syntax / formatting scope | `pnpm --filter @alexandria/viewer run format:check` and shell formatting/lint only if `check.sh` formatting changes are nontrivial | Viewer formatting covers touched TS only if needed; shell formatting/lint catches runner edits. |

No viewer build or browser validation is required because this slice does not change viewer runtime rendering. No CLI black-box tests are required because no CLI behavior changes. No plugin validation is required because shipped plugin files are untouched.

## Eval Impact

- No product-facing reusable agent, skill, template, or eval-backed behavior changes.
- No eval-harness rerun is required for this slice.
- The quality gate is deterministic Studio validation plus viewer parser/conformance tests. This is the correct coverage because the issue is a file-format guard, not an LLM behavior change.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Bun import behavior becomes an implicit dependency of `check.sh`. | Limit the runtime switch to the risk-map guard, document it in the script comments if needed, and prove it through `sh studio/tools/check.sh`. |
| The guard could wrap parser errors so tightly that the viewer parser message is no longer visible. | Store and print `error.message` unchanged; fixture tests assert the exact message substring for every parser throw condition. |
| Removing the `RISKS.md` scan could look like weaker taxonomy enforcement. | Use `riskFamily` / `FAMILY_BY_PREFIX` for the guard and keep `riskMapConformance.test.ts` as the spine-vs-viewer equivalence gate; run that test in verification. |
| Negative fixtures could accidentally enter the production play walk. | Keep them outside `studio/plays/`; tests load them by explicit path. |
| Exporting internals for tests could turn the guard into a wider API than intended. | Export only narrow validation helpers, or keep them clearly test-only within the module; preserve the CLI as the supported user-facing entry point. |
| A future change to `parseRiskMap` could intentionally alter accepted syntax and break Studio guard fixtures. | That is desirable parity. Update fixtures in the same change as parser behavior so the Studio guard remains byte-identical to the viewer parser. |

## Acceptance / Exit Criteria

1. `studio/tools/check-risk-maps.mjs` imports and calls `parseRiskMap`, `riskFamily`, and `FAMILY_BY_PREFIX`; it no longer contains a second Markdown table parser or prefix taxonomy.
2. `studio/tools/check.sh` invokes the risk-map guard with `bun` and still runs the other Studio checks as before.
3. The bad-map corpus includes one fixture for each named viewer parser throw condition plus the missing-separator case, and each failure surfaces the viewer parser's own error message.
4. All current `studio/plays/**/risk-map.md` files pass the Studio guard.
5. The guard still rejects non-canonical family prefixes in both Coverage and Eval-plan rows.
6. A well-formed risk map passes, and a play directory with no `risk-map.md` is ignored exactly as before when other maps exist.
7. A map that would have passed the old coarse mirror due to valid first-cell prefixes but invalid non-first-cell content now fails.
8. `sh studio/tools/check.sh` passes on the checked-in repo state.
9. Focused viewer parser/conformance tests pass, demonstrating parity with `riskMapConformance.test.ts`.

## Deferred Follow-Ups

- `#413`: wire the Studio guard lane into GitHub CI so this protection runs automatically on the relevant PR paths.
- Consider a shared parser package only if another non-Bun runtime needs to consume `parseRiskMap`; this slice deliberately avoids that extra packaging work.
- Keep Play Re-sync runtime risk-map mutation work separate; it may need row-preserving rewrite logic, but this guard should remain parse-and-validate only.
- If more Studio validators begin importing viewer TypeScript, consider a small documented convention for Bun-backed Studio tool tests.
