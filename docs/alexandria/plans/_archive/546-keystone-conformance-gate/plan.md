# Issue 546: Keystone Conformance Gate

## Header

- Issue: [#546](https://github.com/GetAlexandria/alexandria-internal/issues/546)
- Goal: add a deterministic Studio data-validator gate that proves a swept bundle's keystone story uses every big-box container word, and only existing big-box container words.
- Linked product plan: none linked in the issue body. The issue body plus Director ruling from 2026-07-01 are the product contract.
- Issue comments checked: the GitHub issue currently has only the Fabro run link comment; no additional technical clarification.

## Scope

This slice lands the deterministic conformance check and wires it into the existing Studio data-validator path:

1. Add `studio/tools/check-keystone.ts` as the bundle-level validator invoked as `bun studio/tools/check-keystone.ts <bundle-root>`.
2. Add focused fixtures and `bun:test` coverage for the pure checker and the CLI output/exit-code behavior.
3. Wire the check into `studio/tools/check.sh` so changed `studio/**` data runs it with the other Studio guards in `scripts/fabro-validate-impacted-if-changed`.
4. Add an explicit grandfather entry for `studio/sweeps/playmaker-studio` so the new gate lands green while preserving an executable regression that fails with the grandfather removed.
5. Update the Back-of-House Walk Studio play contract so `check_bundle` runs this deterministic keystone check before PASS, and nonconforming output routes to REPAIR/FREEZE instead of shipping.

## Non-Goals

1. Do not rewrite `studio/sweeps/playmaker-studio/_index/Concept - Playmaker's Studio.md` or remove the out-of-scope `runs` container in this slice.
2. Do not change `docs/alexandria/library/`.
3. Do not introduce a viewer UI change. The viewer already exposes the drift; this issue prevents bad data from merging.
4. Do not create a new public `ax` command unless implementation discovers an existing deterministic Back-of-House emitter path that needs the check as a reusable package function.
5. Do not broaden Back-of-House into a shipped plugin workflow; it is currently a Studio play record, not `packages/alexandria-plugin` payload.

## Current Gap

The current repo has two related mechanisms but no blocking gate:

1. `packages/ax/src/domain/library-front-of-house.ts` extracts keystone wikilinks and computes `headlineDrift`, but it is presentation data for the front-of-house agenda, not a failing validator.
2. `packages/ax/src/domain/library-catalog-story.ts` and `@alexandria/library-card-resolver` own wikilink extraction and normalization used by AX and the viewer.
3. `studio/tools/check.sh` runs deterministic Studio guards for catalog, board, risk maps, workflows, threads, and search prior, but has no keystone story/container conformance check.
4. `studio/sweeps/playmaker-studio` is known nonconforming:
   - named-but-empty: `brief`, `make-a-play`, `operations`, `production-line`, `workflow`
   - unnamed: `authoring`, `production-ladder`, `runs`
5. Back-of-House `check_bundle` currently asks the agent to cold-read for many consistency failures, but does not name or run a deterministic keystone container set-equality gate.

One issue-body acceptance criterion conflicts with the current checkout: `studio/plays/front-of-house-walk/fixtures/small-el2/bundle/_index/Concept - Small EL2 Product.md` links `[[director-review]]`, `[[raven-ops]]`, and `[[empty-room]]`, while the fixture has card-bearing containers `director-review`, `raven-ops`, and `runtime-boundary` under the product bundle. Existing AX tests intentionally expect `namedButEmpty: ["empty-room"]` and `presentButUnnamed: ["runtime-boundary"]`. Under the issue's set-equality rule, unchanged `small-el2` does not pass. Implementation must resolve this before final merge by either:

1. getting the issue amended,
2. repairing the fixture in the implementation slice with an explicit note that the original acceptance text was stale, or
3. choosing a documented interpretation of "container" that makes `small-el2` pass without weakening the Playmaker Studio gate.

Do not hide this by adding `small-el2` to the grandfather list.

## Architectural Boundaries

1. The validator belongs in `studio/tools` with the other data guards because it validates checked-in Studio bundle data, including `studio/sweeps/**`.
2. Link parsing and normalization must reuse the shared catalog/link primitives:
   - `extractCatalogWikilinks` and `stripLeadingFrontmatter` from `packages/ax/src/domain/library-catalog-story.ts`
   - `normalizeResolverKey` and `normalizeWikilinkTarget` from `@alexandria/library-card-resolver`
3. The validator should not create a second ad-hoc wikilink parser. Its only local parsing should be filesystem traversal and report formatting.
4. Container discovery must follow the issue contract: exclude `_index`, ignore `runtime/`, `library.json`, `threads.json`, `workflows.json`, report files, and any directory containing no `.md` card files. Sort all discovered names and violations with `localeCompare` or an equivalent stable comparator.
5. The grandfather mechanism must be narrow and auditable: pin the exact bundle path and exact expected violation list. A changed violation set should fail the gate instead of silently accepting broader drift.
6. Back-of-House changes belong in `studio/plays/back-of-house-walk/brief.md`, `moves.md`, and possibly `risk-map.md`. Plugin validation is only needed if implementation touches `packages/alexandria-plugin`, which this plan does not require.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Studio keystone validator | `studio/tools/check-keystone.ts` | New deterministic CLI validates one bundle root and returns stable exit codes/output for conformance failures. |
| Studio validator fixtures | `studio/tools/fixtures/keystone/**` | Adds conforming and failing mini-bundles for both violation directions, dangling links, empty/non-card directories, slug/case aliases, missing keystone, and deterministic output. |
| Studio validator tests | `studio/tools/check-keystone.test.ts` | Black-box and pure-function tests cover accepted fixtures, all violation directions, grandfather behavior, and unchanged behavior of sibling validators. |
| Studio check runner | `studio/tools/check.sh` | Runs keystone validator and its tests with the existing Studio data checks. |
| Playmaker Studio sweep grandfather | likely `studio/tools/keystone-grandfather.json` or an exported constant in `check-keystone.ts` | Allows the known `studio/sweeps/playmaker-studio` mismatch only when the exact eight expected violations are present. |
| Back-of-House Studio play contract | `studio/plays/back-of-house-walk/brief.md`, `studio/plays/back-of-house-walk/moves.md`, possibly `studio/plays/back-of-house-walk/risk-map.md` | `check_bundle` must run the deterministic keystone command before PASS and treat nonconformance as failed sweep output. |
| Impacted validation script tests | `packages/factory/src/fabro-validate-impacted-if-changed.test.ts` only if needed | Existing script already runs `sh studio/tools/check.sh` for `studio/**`; update tests only if command expectations need to include the new keystone check explicitly. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Back-of-House Walk Studio play | `check_bundle` gains a deterministic command gate: `bun studio/tools/check-keystone.ts <output_path>` must pass before the bundle can ship. | Update `brief.md` and `moves.md`; run `node studio/tools/check-play-conformance.mjs studio/plays/back-of-house-walk` if those files change. |
| Alexandria plugin skills | No required change. Back-of-House is not currently packaged under `packages/alexandria-plugin`; `front-of-house-walk` skill remains unchanged. | No plugin validation unless implementation touches plugin files. |
| Viewer | No behavior change; it continues to render catalog/headline drift from AX projections. | No viewer build/browser validation required unless implementation touches viewer files. |
| AX public CLI | No public command change planned. The validator is a Studio tool, not an `ax` command. | No CLI help or public CLI docs update unless implementation intentionally extracts this into AX. |

## Validator Design

The implementation should expose small pure helpers from `check-keystone.ts` and keep `main()` as a thin CLI wrapper.

1. Resolve the bundle root to an absolute path and a repo-relative label for output.
2. Locate the keystone card:
   - Prefer loading the bundle with `loadLibraryCatalogRoot(bundleRoot, bundleRoot)` and `selectFrontOfHouseKeystone` so selection matches the current catalog/front-of-house behavior.
   - Read the selected keystone markdown from `selected.cardPath`.
   - If no keystone exists, fail with a stable diagnostic such as `missing-keystone: <bundle>`.
3. Extract keystone names:
   - Strip leading frontmatter with `stripLeadingFrontmatter`.
   - Extract wikilinks with `extractCatalogWikilinks`.
   - Normalize each target with `normalizeWikilinkTarget` then `normalizeResolverKey`.
   - Preserve a display slug for reporting, preferably the normalized slug-like target used in the story.
   - Deduplicate in first-seen order, then sort only in the final report if needed.
4. Discover existing containers:
   - Treat `_index` as reserved and ignore it.
   - Ignore known non-card artifacts and reserved runtime output.
   - Count only directories that contain at least one `.md` card file under the bundle's card layout.
   - Use the issue's top-level-container definition unless the `small-el2` conflict is resolved differently; document the chosen interpretation in code comments and tests.
5. Compare normalized sets:
   - `named-but-empty`: story link names that do not resolve to a card-bearing container.
   - `unnamed`: card-bearing containers not named by the story.
6. Format deterministic output:
   - On pass: one stable success line naming the bundle and count.
   - On failure: one header plus one line per violation, sorted by direction then normalized name, exactly shaped for tests, for example `named-but-empty: workflow` and `unnamed: authoring`.
   - Exit `0` on pass or exact grandfather match; exit `1` on conformance failures; exit `2` for usage/input errors such as missing path or missing keystone.
7. Grandfather behavior:
   - Default Studio-wide check may accept the exact known `studio/sweeps/playmaker-studio` violation list.
   - The standalone checker should make the grandfather visible in output, for example `grandfathered: studio/sweeps/playmaker-studio`.
   - Tests must prove that when the grandfather entry is absent or disabled, the same bundle fails and names all eight violations.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Keystone validator unit/CLI tests | `bun test studio/tools/check-keystone.test.ts` | Covers set comparison, output, exit codes, deterministic reruns, grandfather pinning, and fixtures. |
| Standalone conforming fixture | `bun studio/tools/check-keystone.ts studio/plays/front-of-house-walk/fixtures/small-el2/bundle` | Required by the issue, but currently blocked by the fixture conflict noted above. |
| Playmaker Studio grandfather path | `bun studio/tools/check-keystone.ts studio/sweeps/playmaker-studio` | Must pass only because the exact grandfather pin matches; removing/disabling the pin must fail with all eight violations. |
| Studio full guard | `sh studio/tools/check.sh` | Ensures the new gate runs in the same Studio CI path and sibling validators still pass. |
| AX tests affected by reused helpers | `pnpm --filter @alexandria/ax run test -- library-front-of-house.test.ts library-front-of-house-bundle.test.ts` | Ensures shared keystone/link helpers still preserve existing front-of-house behavior. |
| Library-card resolver parity | `pnpm --filter @alexandria/library-card-resolver run test` | Guards slug/case/alias normalization if implementation changes or adds resolver helpers. |
| Back-of-House play conformance | `node studio/tools/check-play-conformance.mjs studio/plays/back-of-house-walk` | Run if `brief.md`, `moves.md`, or `risk-map.md` change. |
| Impacted validation script | `pnpm --filter @alexandria/factory run test -- fabro-validate-impacted-if-changed.test.ts` | Run only if implementation updates impacted-validation tests or script behavior. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Studio deterministic validators | Covered by `studio/tools/*.test.*` and `sh studio/tools/check.sh`, not eval harness. | Add deterministic tests; no LLM eval required. | `bun test studio/tools/check-keystone.test.ts`; `sh studio/tools/check.sh`. |
| Back-of-House Walk play | Risk map says Back-of-House statistical fixtures are owed and the play is not packaged/proven. This slice changes the authored play contract, but not a shipped skill. | No eval-harness rerun required for this deterministic gate. Update risk-map coverage if the contract claims the gate is covered. | No `pnpm eval` command. Run `node studio/tools/check-play-conformance.mjs studio/plays/back-of-house-walk` for authored contract consistency. |
| Alexandria plugin skills | No plugin skill files change in the planned slice. | No plugin eval rerun. | None. |
| AX public CLI | No public CLI behavior change. | No CLI eval harness; use black-box deterministic tests only if implementation adds an AX command. | If AX command is added contrary to the base plan, add black-box tests for output and exit codes under `packages/ax/tests`. |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The validator drifts from viewer/AX link resolution by inventing its own parser. | Import `extractCatalogWikilinks`, `stripLeadingFrontmatter`, `normalizeWikilinkTarget`, and `normalizeResolverKey`; add slug/case/alias tests. |
| The grandfather becomes a broad skip and hides future Playmaker Studio drift. | Pin exact path plus exact violation names/directions; fail if the violation list changes. |
| The `small-el2` acceptance criterion is impossible against the current checkout. | Treat this as an explicit implementation-stage decision. Do not add a skip. Resolve by issue amendment, fixture repair, or documented container interpretation before final merge. |
| Empty or artifact-only directories become false containers. | Add fixtures with directories containing only `.json`, `.md` reports outside card layout, and `runtime/`; assert they do not count. |
| CI repeats the older trap by only running on viewer changes. | Wire into `studio/tools/check.sh`; `scripts/fabro-validate-impacted-if-changed` already runs that for `studio/**`. Add/keep test coverage for Studio-only changes. |
| Back-of-House prose claims deterministic enforcement but the command is not actually run. | Update both `brief.md` and `moves.md` to name the exact command in `check_bundle`, and run `check-play-conformance` after edits. |
| Sorting differs across platforms or repeated runs. | Normalize names once, sort with stable string comparison, and add a test that invokes the CLI twice and compares stdout/stderr/exit code byte-for-byte. |

## Implementation Steps

1. Add `studio/tools/check-keystone.ts` with pure helpers for keystone selection, wikilink extraction, container discovery, set comparison, formatting, CLI argument parsing, and grandfather matching.
2. Add `studio/tools/fixtures/keystone/` mini-bundles:
   - `good/`
   - `bad-named-but-empty/`
   - `bad-unnamed/`
   - `bad-both-directions/`
   - `empty-non-card-dir/`
   - `slug-case-alias/`
   - `missing-keystone/`
3. Add `studio/tools/check-keystone.test.ts` covering pure helper behavior and black-box CLI behavior through `Bun.spawnSync` or equivalent.
4. Add a regression test for `studio/sweeps/playmaker-studio` that:
   - verifies the default/check.sh path is green due to exact grandfather,
   - verifies the ungrandfathered mode fails,
   - asserts all eight expected lines appear: five `named-but-empty` and three `unnamed`.
5. Resolve the `small-el2` conflict explicitly. Preferred implementation-stage action is to pause for clarification if the issue owner still requires "unchanged"; otherwise repair the fixture and update existing tests that currently expect `empty-room`/`runtime-boundary` drift.
6. Wire `bun tools/check-keystone.ts` and `bun test tools/check-keystone.test.ts` into `studio/tools/check.sh`.
7. Update Back-of-House `brief.md` and `moves.md` so `check_bundle` includes the exact keystone command before PASS and treats failure as REPAIR/FREEZE. Update `risk-map.md` only if making a new coverage claim.
8. Run the deterministic verification commands listed above. If any command cannot run in the environment, capture the reason in the implementation handoff.

## Acceptance / Exit Criteria

1. `bun studio/tools/check-keystone.ts <bundle-root>` exists and has deterministic stdout/stderr and exit codes.
2. Conforming fixture bundles pass; failing fixtures report violations by direction and name.
3. A dangling `[[link]]` in only keystone prose fails the Studio data guard.
4. A container directory with only non-card files does not count as a container.
5. Slug/case/alias matching agrees with the shared resolver normalization.
6. Running the validator twice on the same input produces byte-identical output and the same exit code.
7. `studio/sweeps/playmaker-studio` is grandfathered only by exact violation pin; disabling/removing the entry fails with:
   - `named-but-empty: brief`
   - `named-but-empty: make-a-play`
   - `named-but-empty: operations`
   - `named-but-empty: production-line`
   - `named-but-empty: workflow`
   - `unnamed: authoring`
   - `unnamed: production-ladder`
   - `unnamed: runs`
8. The `small-el2` acceptance criterion is either satisfied by an explicitly documented implementation decision or the issue is updated to match the repository fixture reality.
9. `sh studio/tools/check.sh` passes, proving sibling Studio validators are unchanged.
10. Back-of-House `check_bundle` documentation names the deterministic keystone gate and nonconforming output cannot be described as a shippable bundle.

## Deferred Follow-Ups

1. Remove the Playmaker Studio grandfather entry when a conforming re-emit lands, likely alongside the #547 cleanup that removes the out-of-scope `runs` container.
2. Consider extracting the checker into a shared AX domain module only if another deterministic command needs the same bundle validation outside Studio tooling.
3. Add a dedicated Back-of-House golden eval/fixture once the play is packaged and proven; this slice only adds deterministic validation.
4. Consider making front-of-house agenda preparation fail on keystone conformance after the grandfather is removed. For now, this issue gates Studio data and Back-of-House output, while existing front-of-house drift projection remains diagnostic.
