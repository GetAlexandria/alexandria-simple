# Issue #670: library migration Slices 1 and 2

## Header

- Issue: [#670](https://github.com/GetAlexandria/alexandria-internal/issues/670)
- Goal: delete the retired legacy corpus at `docs/alexandria/library`, retire the Viewer
  "Legacy reference" feature, and promote
  `docs/alexandria/sweeps/alexandria-product` to `docs/alexandria/library`.
- Linked product plan: `docs/alexandria/plans/library-migration/plan.md`,
  Section 3 Slices 1 and 2.
- Inventory appendix: `docs/alexandria/plans/library-migration/plan-appendix-inventories.md`,
  Sections A and B.
- Blockers: assumes #667 has merged and Slice 0 / #669 has already removed the
  walk archive from the live sweep bundle.
- Issue source checked: the full issue contract supplied in the planning prompt,
  the linked local product plan, and the local inventory appendix. The private
  GitHub issue page was not fetchable from this environment.

## Scope

This is one implementation PR because the path transition is not coherent if
the delete and move are split:

1. Remove the retired legacy corpus from `docs/alexandria/library`.
2. Move the product bundle from `docs/alexandria/sweeps/alexandria-product` to
   `docs/alexandria/library` with `git mv`.
3. Repoint checked-in registry, fallback constants, PMS, Studio gates, CI path
   filters, and local Fabro validation filters to the new live-library path.
4. Retire the Viewer "Legacy reference" Builder feature: route helper, mode,
   tab, component, request helper, tests, and e2e coverage.
5. Rewrite the root `CLAUDE.md` Package Map and its doc guard so the new live
   library path is pinned and the old legacy-oracle description cannot return.
6. Reword Fabro factory prompts and their guard test so `docs/alexandria/library`
   remains protected as the live library, while this planned migration is not
   mistaken for an invalid freehand card edit.
7. Rebuild tests and fixtures that used the real legacy corpus so they exercise
   the promoted product library or a small synthetic override root instead.

## Non-Goals

- Do not perform Slice 3 config unification. `library-bundles.json` remains in
  place as the Builder bundle registry and is only repointed.
- Do not dissolve `library.json`, `threads.json`, `workflows.json`, or
  `gaps.json`. Move those sidecars unchanged with the bundle.
- Do not edit card content, sidecar JSON contents, or Studio play prose.
- Do not change `studio/plays/` content.
- Do not edit eval snapshots under `packages/ax/tests/evals/**`.
- Do not touch the URL-shape legacy-path code:
  `isLegacyLibraryPath`, `LEGACY_LIBRARY_PATH_MODE`, or
  `canonicalizeLegacyLibraryPath` behavior in Viewer routing.
- Do not change product plugin play behavior in this slice unless a stale prompt
  line is directly caused by this migration. If plugin assets are touched, run
  plugin validation.
- Do not update non-archived historical plan prose except this technical plan.
  Broader prose cleanup is a later slice.

## Linked Product-Plan Summary

The migration plan has a settled data-model direction, but Issue #670 is only
the path and feature-retirement slice. Slice 1 deletes the retained legacy
corpus and removes the Viewer surface that intentionally pointed at it. Slice 2
moves the working product bundle into the default ax location. The runtime
already treats `<workspace>/library` as the default root, so the observable
promotion is that requests without `libraryRoot` now read the product bundle.

The plan also rules that the Builder registry survives for now. Config
unification, sidecar dissolution, ledger-only Notepad/Drafts projections, and
frontmatter v2 are later slices.

## Current Gap

- The root package map still says `docs/alexandria/sweeps/alexandria-product`
  is the working library and `docs/alexandria/library` is a retained legacy
  oracle.
- `docs/alexandria/library-bundles.json` points the Builder registry at the
  sweep path.
- Viewer constants in `library-mode-config.ts` fall back to the sweep path and
  still define a `legacy` Builder mode.
- Viewer routes include `legacy` as a Builder-only mode and expose
  `libraryLegacyRoute()`.
- Viewer UI renders a "Legacy reference" tab and
  `LegacyLibraryReferenceView`.
- Ax, Viewer, PMS, Studio, factory, and doc-guard tests contain literals for
  the legacy corpus and sweep path.
- `packages/ax/tests/viewer.test.ts` copies the real legacy directory to prove
  "serve a real library"; that fixture must copy the promoted product library
  after the move.
- Studio validation and GitHub CI path filters still watch
  `docs/alexandria/sweeps/**`; after the move, this would silently skip card
  changes unless repointed to `docs/alexandria/library/**`.
- `scripts/fabro-validate-impacted-if-changed` has the same local validation
  skip risk and should be repointed with the workflow.
- Current product bundle shape, after Slice 0, is 127 Markdown card files under
  the product context directories including `_index`, plus
  `library.json`, `threads.json`, `workflows.json`, and `gaps.json`.

## Architectural Boundaries

- `packages/ax` owns default library-root runtime behavior and black-box CLI
  tests. The default remains `<workspace>/library`; the filesystem move makes
  that default point at the product bundle.
- `packages/viewer` owns the Library and Builder browser surface. Remove only
  the legacy-reference feature; preserve Viewer section modes, Builder Back /
  Drafts / Notepad modes, and the `?libraryRoot=` QA override.
- `packages/pms/viewer` owns the PMS Notepad hardcoded product root. Repoint
  the constant, keep PMS state isolated from Alexandria's Ledger, and keep PMS
  catalog reads going through the PMS proxy.
- `studio/tools` owns data guards. Repoint guard inputs so moved product cards
  still run through machine-language and story-lint checks.
- `.github/workflows/validate-plugin.yml` and
  `scripts/fabro-validate-impacted-if-changed` own CI/local impacted-file
  routing. Repoint sweeps filters to the live library path.
- `.fabro/workflows/ax-feature` owns maintainer factory prompts. Preserve the
  live-library protection, but make the wording compatible with planned
  migrations that explicitly touch the live library path.
- Root `CLAUDE.md` remains the package-map source of truth for repository
  guidance and must move with its guard test.
- Do not import from `repos/`; no Effect implementation pattern changes are
  needed unless tests uncover a runtime helper change.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| Filesystem library move | `docs/alexandria/library`, `docs/alexandria/sweeps/alexandria-product` | Retired corpus is deleted; product bundle is promoted to the ax default path. |
| Bundle registry | `docs/alexandria/library-bundles.json` | Bundle `alexandria-product` uses `docs/alexandria/library`; draft patch log remains unchanged. |
| Ax runtime and tests | `packages/ax/src/effects/*`, `packages/ax/tests/viewer.test.ts`, `packages/ax/src/effects/*test.ts`, `packages/ax/src/domain/*test.ts` | No-param catalog/graph/card requests read the promoted product bundle; explicit override roots still work. |
| Viewer Library / Builder | `packages/viewer/src/components/library/*`, `packages/viewer/src/app/runtime/*`, `packages/viewer/tests/*` | Legacy reference mode disappears; Builder Back reads the same bundle through the registry; Viewer section default and override behavior continue. |
| PMS viewer | `packages/pms/viewer/src/app/pms-surfaces.ts`, PMS viewer tests | Alexandria Notepad reads `docs/alexandria/library`. |
| Studio guards | `studio/tools/check.sh`, `studio/tools/check-machine-language.mjs` | Product library checks scan the moved live library. |
| CI and Fabro validation routing | `.github/workflows/validate-plugin.yml`, `scripts/fabro-validate-impacted-if-changed` | Studio-data validation triggers on `docs/alexandria/library/**` changes. |
| Root docs guard | `CLAUDE.md`, `packages/ax/src/effects/claude-md-library-package-map.test.ts` | Package map names the new live library path and rejects legacy-oracle wording. |
| Fabro prompt guard | `.fabro/workflows/ax-feature/prompts/{implement,review,scope}.md`, `packages/factory/src/fabro-verification-workflow.test.ts` | Prompts protect the live library against freehand edits without flagging this planned path migration as invalid. |
| Shipped plugin prompts | `packages/alexandria-plugin/skills/*` only if stale migration wording is discovered | Prefer no plugin change in this slice; if touched, run plugin validation and markdown lint. |

## Behavior Surfaces

| Surface | Behavior change | Required coverage |
|---|---|---|
| CLI/runtime APIs | `/api/library/catalog`, `/api/library/graph`, and card detail with no `libraryRoot` now resolve the product bundle because it lives at `<workspace>/library`. | Ax runtime-server and loader tests, plus a black-box `ax start viewer` real-library fixture. |
| Viewer Library section | Viewer section renders the product library through the default root with zero `metadataIssues`; `?libraryRoot=` still overrides to arbitrary in-repo roots. | Viewer unit tests and Playwright tests for default root and override root. |
| Viewer Builder section | Back / Drafts read the repointed registry bundle; Notepad remains bundle-scoped; Legacy reference is gone. | Builder unit tests and browser tab/route tests. |
| Viewer routing | `/library/builder/legacy` becomes `not-found` under the existing removed-mode behavior. Flat legacy URL-shape canonicalization is unchanged. | Delete legacy feature tests; keep existing `viewer-routes.test.ts` flat-path cases unmodified except path literals required by the move. |
| PMS Notepad | PMS Notepad reads the promoted product library root through the PMS proxy. | PMS viewer unit tests around `catalogRequestFor("notepad")`. |
| Studio data gates | Machine-language and story-lint gates cover moved cards. | `sh studio/tools/check.sh` and targeted script tests if assertions are added. |
| Fabro workflow prompts | Implementation/review/scope prompts keep live-library write protection with migration-aware wording. | `packages/factory/src/fabro-verification-workflow.test.ts`. |
| Agents and skills | No reusable agent behavior change expected. Plugin skills keep their "do not freehand library cards" guard unless directly stale. | No eval harness rerun unless plugin assets change; plugin validation if they do. |

## Move Contract

Implementation should perform the destructive path transition atomically in the
same PR, preferably the same commit as the literal repoints:

```bash
git rm -r docs/alexandria/library
git mv docs/alexandria/sweeps/alexandria-product docs/alexandria/library
```

After the move:

- `docs/alexandria/library` contains the product cards plus
  `library.json`, `threads.json`, `workflows.json`, and `gaps.json`.
- `docs/alexandria/sweeps` is removed if it has no remaining children.
- The sidecar JSON contents are byte-preserved by the move.
- The draft patch log path remains
  `studio/drafts/alexandria-product/patches.json`.

## Repoint Contract

Required literal repoints:

| Site | New value |
|---|---|
| `docs/alexandria/library-bundles.json` bundle 0 `libraryRoot` | `docs/alexandria/library` |
| `packages/viewer/src/components/library/library-mode-config.ts` fallback root | `docs/alexandria/library` |
| `packages/pms/viewer/src/app/pms-surfaces.ts` `ALEXANDRIA_PRODUCT_NOTEPAD_ROOT` | `docs/alexandria/library` |
| `studio/tools/check.sh` product-library gate args | `docs/alexandria/library` |
| `studio/tools/check-machine-language.mjs` `DEFAULT_ROOTS` | include `docs/alexandria/library` instead of `docs/alexandria/sweeps` for the Alexandria product bundle |
| `.github/workflows/validate-plugin.yml` Studio path filter | `docs/alexandria/library/**` |
| `scripts/fabro-validate-impacted-if-changed` Studio data trigger | `docs/alexandria/library/` |

After implementation, this search should have no active code/config hits
outside historical prose:

```bash
rg 'docs/alexandria/sweeps/alexandria-product'
```

Allowed hits are only under `docs/alexandria/plans/` including `_archive/` and
`studio/plays/` prose. There should be zero hits in `packages/`, `.github/`,
`.fabro/`, `studio/tools/`, or root guidance/config.

## Test Plan

Focused tests to update or add:

1. `packages/ax/src/effects/library-graph-loader.test.ts`: no-param graph and
   card-detail defaults read the promoted product library; explicit override
   roots do not fall back to the default.
2. `packages/ax/src/domain/library-catalog.test.ts`: real product bundle load
   from `docs/alexandria/library` returns 127 cards and
   `metadataIssues: []`.
3. `packages/ax/src/effects/runtime-server.test.ts`: catalog, graph, and card
   detail no-param requests observe the product bundle; bad override-root
   status behavior remains covered.
4. `packages/ax/tests/viewer.test.ts`: copy the real promoted product library
   for the "serves bundled viewer" fixture.
5. `packages/viewer/src/components/library/library-bundle-registry.test.ts`:
   checked-in registry first bundle points at `docs/alexandria/library`.
6. `packages/viewer/src/components/library/library-mode-config.test.ts`:
   fallback/default constants use the new path; `?libraryRoot=` override still
   suppresses draft overlay.
7. `packages/viewer/src/components/library/LibraryBrowserApp.test.tsx`:
   remove `legacyGraphRequestForRoute` coverage; keep Builder Back / Drafts /
   Notepad bundle-scoped request coverage.
8. `packages/viewer/src/components/library/viewer-routes.test.ts`: remove
   `libraryLegacyRoute` and `legacy` mode expectations; add or keep a test
   that `/library/builder/legacy` parses as `not-found`; leave flat legacy URL
   shape regression cases intact.
9. Delete `packages/viewer/src/components/library/LegacyLibraryReferenceView.test.tsx`
   with the component.
10. `packages/viewer/tests/library-browser.spec.ts`: remove Legacy reference
    tab and rendering tests; assert Builder tab order excludes it and removed
    route does not render a legacy view; keep Viewer override tests with a
    synthetic or existing non-default root.
11. `packages/pms/viewer/src/app/PmsApp.test.tsx` and any indirect PMS viewer
    tests: Notepad requests `docs/alexandria/library`.
12. `packages/ax/src/effects/claude-md-library-package-map.test.ts`: pin the
    new Package Map line and assert legacy-oracle wording and the sweep path do
    not reappear.
13. `packages/factory/src/fabro-verification-workflow.test.ts`: update the
    prompt assertion to the new live-library protection language.

## Deterministic Verification

Run focused checks first, then the full suites named by the issue:

| Area | Command | Why |
|---|---|---|
| Product bundle inventory | `find docs/alexandria/library -name '*.md' | wc -l` and sidecar listing | Confirms the promoted bundle shape before higher-level tests. |
| Ax focused tests | `pnpm --filter @alexandria/ax exec bun test src/effects/library-graph-loader.test.ts src/domain/library-catalog.test.ts src/effects/runtime-server.test.ts src/effects/claude-md-library-package-map.test.ts tests/viewer.test.ts` | Covers default-root promotion, override roots, doc guard, and real viewer fixture. |
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Covers mode config, registry, route removal, and component regressions. |
| Viewer build/check | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Catches route/type/component deletion fallout. |
| Viewer browser tests | `pnpm --filter @alexandria/viewer run test:e2e` | Verifies Library and Builder behavior in the browser. |
| PMS viewer | `pnpm --filter @alexandria/pms-viewer run test` and `pnpm --filter @alexandria/pms-viewer run build` | Verifies Notepad root and build surface. |
| Factory prompt guard | `pnpm --filter @alexandria/factory run test` | Verifies Fabro prompt wording contract. |
| Studio data gate | `sh studio/tools/check.sh` | Ensures moved cards still run through Studio data checks. |
| Root search guard | `rg 'docs/alexandria/sweeps/alexandria-product'` | Confirms active code/config no longer points at the old sweep. |
| Full CI-equivalent suites | `check-ax`, `check-viewer`, `test-viewer-e2e`, `check-pms`, `check-studio` in CI, or their package-command equivalents locally | Matches the issue's required matrix. |

If plugin assets change, also run:

```bash
claude plugin validate ./packages/alexandria-plugin
pnpm run lint:markdown
```

## Eval Impact

No eval-harness rerun is required if the implementation stays within the
planned path move, Viewer feature retirement, deterministic runtime tests,
Studio gates, root guidance, and Fabro maintainer prompts. The change does not
alter shipped agent behavior, play execution, or reusable product skill
contracts.

If implementation touches `packages/alexandria-plugin/skills/*`, treat that as
a plugin-surface change: run plugin validation and markdown lint, then decide
whether the touched skill has existing eval coverage. No new eval case is
planned for Issue #670 unless shipped skill behavior changes beyond wording
that preserves the existing no-freehand-library-card guard.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| The move leaves a window where `docs/alexandria/library` is missing or still means the legacy corpus. | Keep delete, move, and literal repoints in one PR and preferably one commit; do not merge a partial path state. |
| Product bundle sidecar files are edited while moving. | Use `git mv`; verify sidecar filenames and avoid content edits. |
| Viewer legacy-route removal accidentally changes unrelated flat-path canonicalization. | Do not edit `LEGACY_LIBRARY_PATH_MODE` except path literals forced by tests; keep existing flat-path tests passing. |
| `?libraryRoot=` override regresses while deleting legacy-reference code. | Add/keep Viewer and runtime tests using an arbitrary in-repo root such as `studio/library` or a synthetic fixture root. |
| Studio-data CI silently stops running on card changes. | Repoint both `.github/workflows/validate-plugin.yml` and `scripts/fabro-validate-impacted-if-changed`, then run `sh studio/tools/check.sh`. |
| Search-and-replace damages historical plan/archive prose or eval snapshots. | Limit active-code repoints manually; leave `docs/alexandria/plans/_archive/**`, relevant plan prose, `studio/plays/`, and `packages/ax/tests/evals/**` alone. |
| Fabro prompts continue to forbid this planned migration or become too permissive for future card edits. | Reword to protect the live library against freehand edits except when an approved plan explicitly calls for a library migration; update the guard test to pin that intent. |
| The real product bundle has metadata issues once served as the default root. | Run catalog tests and `sh studio/tools/check.sh`; treat any `metadataIssues` as blockers unless they are pre-existing and explicitly ruled out of scope. |
| Package-local validation misses PMS viewer because the root `check-pms` job covers two packages. | Run both `@alexandria/pms` and `@alexandria/pms-viewer` checks where local commands are used. |

## Implementation Steps

1. Confirm the branch includes Slice 0 / #669: the sweep contains only cards
   plus `library.json`, `threads.json`, `workflows.json`, and `gaps.json`.
2. Remove the legacy-reference Viewer surface:
   - delete `LegacyLibraryReferenceView.tsx` and its test
   - remove `LEGACY_LIBRARY_ROOT` and `legacyGraphRequestForRoute`
   - remove `legacy` from `BUILDER_ONLY_MODE_IDS`, `LIBRARY_MODE_SECTION`,
     mode config, tab config, and route helpers
   - update route and app tests so `/library/builder/legacy` is `not-found`
3. Delete the legacy corpus and move the product bundle:
   `git rm -r docs/alexandria/library` then
   `git mv docs/alexandria/sweeps/alexandria-product docs/alexandria/library`.
4. Repoint `library-bundles.json`, Viewer fallback constants, PMS Notepad root,
   Studio gates, GitHub workflow filter, and local Fabro validation helper.
5. Rewrite root `CLAUDE.md` Package Map:
   - name `docs/alexandria/library` as Alexandria's working product library
   - remove the retained legacy-oracle language
   - remove the inaccurate draft-overlay-from-`patches.json` description
   - keep the no-freehand-library-edits rule with live-library rationale
6. Update `claude-md-library-package-map.test.ts` to assert the new path and
   reject the old sweep path and legacy-oracle language.
7. Reword `.fabro/workflows/ax-feature` prompts and update
   `fabro-verification-workflow.test.ts`.
8. Rebuild ax runtime and viewer fixtures:
   - real-library copies point at `docs/alexandria/library`
   - override-root tests use `studio/library` or a local synthetic root
   - old sweep literals become the new path unless the file is historical prose
9. Update PMS viewer tests for `ALEXANDRIA_PRODUCT_NOTEPAD_ROOT`.
10. Run focused tests and the deterministic verification matrix.
11. Run the root search guard and inspect `git diff --stat` to confirm the diff
    contains the intended delete/move/repoint/test changes only.

## Acceptance / Exit Criteria

1. `docs/alexandria/library/` contains the product bundle: 127 Markdown cards
   across the ruled context set including `_index`, plus
   `library.json`, `threads.json`, `workflows.json`, and `gaps.json`.
2. `docs/alexandria/sweeps/` is gone if empty, and no active code/config points
   at `docs/alexandria/sweeps/alexandria-product`.
3. Viewer Library section renders the promoted library with
   `metadataIssues: []`.
4. Builder Back reads the same bundle through `library-bundles.json`.
5. A catalog request with no `libraryRoot` override returns the product bundle
   through the ax `<workspace>/library` default.
6. `?libraryRoot=` override still works for an arbitrary in-repo root and does
   not force the Alexandria draft overlay.
7. No "Legacy reference" tab renders; `LegacyLibraryReferenceView` and its tests
   are deleted; `/library/builder/legacy` follows the same `not-found` behavior
   as other removed modes.
8. URL-shape legacy-path canonicalization tests remain green and semantically
   unchanged.
9. `studio/tools/check.sh` passes against `docs/alexandria/library`.
10. `.github/workflows/validate-plugin.yml` and
    `scripts/fabro-validate-impacted-if-changed` trigger Studio validation on
    `docs/alexandria/library/**`.
11. Root `CLAUDE.md` names `docs/alexandria/library` as the working product
    library, and `claude-md-library-package-map.test.ts` fails if the old
    sweep path or legacy-oracle wording reappears.
12. Fabro prompt guard tests pass with the new live-library protection wording.
13. Focused and full validation suites for ax, viewer, PMS, factory prompt
    guard, Studio data, and Viewer e2e pass or have documented environment
    failures with rerun instructions.

## Deferred Follow-Ups

- Slice 3: config unification so Viewer defaults come from runtime/config
  instead of the checked-in Builder registry.
- Slice 4: dissolve sidecar JSON files into card `flow:`, ledger events, and
  runtime projections.
- Slice 5: update Studio plays and shipped plugin skills when the production
  process changes its emitted bundle shape.
- Slice 6: broader prose sweep for old library/sweep language outside active
  code and guidance.
