# Appendix: discovery-sweep inventories (2026-07-07)

Raw reference inventories behind `plan.md` §3. Line numbers are as of commit
`a19fe331` — re-verify before editing; treat as a work-list, not gospel.
Spot-checked after `ebee12d9` (#664) and `7da8ee40` (#665): the cited lines
in `library-catalog.ts` (:26,:35) and `check-machine-language.mjs` (:32-34)
are unshifted; #665 rewrote 40 card BODIES only (no frontmatter, no links) —
no inventory impact.

## A. Legacy-corpus references (`docs/alexandria/library`)

Deleted corpus: ~208 cards. DO NOT confuse with the *URL-shape* "legacy path"
code (`isLegacyLibraryPath` / `LEGACY_LIBRARY_PATH_MODE` /
`canonicalizeLegacyLibraryPath` in `viewer-routes.ts:236-304`,
`useViewerRoute.ts`) — that predates the section tier (#610/#611) and is
unrelated: leave alone.

### Code (the "Legacy reference" feature, issues #613/#647 — retire whole)
- `packages/viewer/src/components/library/LibraryBrowserApp.tsx:74`
  `LEGACY_LIBRARY_ROOT` const; used :204, :736; legacy logic at 71, 190-244,
  325-361, 477-566, 728-736
- `packages/viewer/src/components/library/LegacyLibraryReferenceView.tsx` (whole file)
- `packages/viewer/src/components/library/library-mode-config.ts:128-130,158-176,240-251` (`legacy` mode)
- `packages/viewer/src/components/library/LibraryBrowserShell.tsx:13,18,46` (tab)
- `packages/viewer/src/components/library/viewer-routes.ts:11-13,46,443-444,476`
  (`libraryLegacyRoute`, `BUILDER_ONLY_MODE_IDS`)

### Tests — migration-blocking
- `packages/ax/tests/viewer.test.ts:200,561` — `cpSync` of the REAL legacy dir (fails on delete)
- `packages/ax/src/effects/claude-md-library-package-map.test.ts:21,23,28` — guards
  CLAUDE.md keeps the legacy lines; rewrite with the CLAUDE.md edit
- `packages/factory/src/fabro-verification-workflow.test.ts:112` — asserts Fabro
  prompt forbids writes to the path (reword, rationale flips)
- `packages/ax/tests/runtime-server.test.ts:2158,3766` — fixtures

### Tests — fixture literals (update, non-blocking)
`library-catalog.test.ts` (14 hits: 209,228,291,303,314,327,344,356,390,407,1983,2002,2061,2073) ·
`library-graph-loader.test.ts:33,63` · `events.test.ts:1097,1116,1154` ·
`state.test.ts:1299,1351` · `EmptyLibraryView.test.tsx:182-202` ·
`LegacyLibraryReferenceView.test.tsx` (delete with feature) ·
`LibraryBrowserApp.test.tsx:204,207,224` · `library-mode-config.test.ts:19,22,38` ·
`viewer-routes.test.ts:633,655,656` · `viewer/tests/library-browser.spec.ts:859,1007,1222,1918-1931` (Playwright)
- Eval snapshots (recorded runs, leave): `packages/ax/tests/evals/**`

### Prompts/skills
- `packages/alexandria-plugin/skills/ax-start/SKILL.md:133`,
  `skills/front-of-house-walk/SKILL.md:358` (+ installed-plugin mirrors — sync via release)
- `.fabro/workflows/ax-feature/prompts/{implement.md:17,review.md:13,scope.md:28}`

### Docs
- `CLAUDE.md:25,27,111` (guarded by claude-md test above)
- `docs/alexandria/sweeps/alexandria-product/runtime/{manifest.md:24,source-ladder.md:8,76}` (archived with runtime/)
- `studio/plays/research/library-elicitation/grounding.md:182`
- Non-archived plans (opportunistic): rebuilding-the-library/*,
  pms-alexandria-boundary-migration, library-tidy, library-visual-build,
  rationale-taxonomy-fix, strategy-plane-rebuild, capture-the-work,
  event-sourced-data-model, alexandria-product-hosting, build-a-raven-onboarding;
  ~60 vocabulary cards under plans/library-population-playbook/vocabulary/**;
  older docs/alexandria/implementation-plans/** and docs/alexandria/lab/
- `docs/alexandria/plans/_archive/**` (~75 files): historical, leave

## B. Sweep-path references (`docs/alexandria/sweeps/alexandria-product`)

### Code literals (repoint in the move commit, lockstep)
- `docs/alexandria/library-bundles.json:4` — registry `libraryRoot` + `draftPatchLog`
- `packages/viewer/src/components/library/library-mode-config.ts:66-68` — fallback consts
- `packages/pms/viewer/src/app/pms-surfaces.ts:7` — `ALEXANDRIA_PRODUCT_NOTEPAD_ROOT`
- `studio/tools/check.sh:44,46` — CI gate args
- `studio/tools/check-machine-language.mjs:32-34` — `DEFAULT_ROOTS` auto-scan
  (⚠ silently stops covering a moved dir; add new root)
- `.github/workflows/validate-plugin.yml:120` — `docs/alexandria/sweeps/**`
  path filter (⚠ SILENT-SKIP: Studio-data CI job stops triggering if missed;
  bug class called out at #627/#649 comment in the workflow)

### Tests with the literal
`library-graph-loader.test.ts:34-35` · `library-catalog.test.ts:649,688` ·
`ax runtime-server.test.ts:11,18,30,70` · `claude-md-library-package-map.test.ts:15` ·
`viewer client.test.ts:880-881,1544-1546` · `library-bundle-registry.test.ts:13-203` ·
`LibraryBrowserApp.test.tsx:29-249` · `BuilderBundleSelector.test.tsx:9,12` ·
`LibraryBrowserShell.stories.tsx:9,12` · `EmptyLibraryView.test.tsx:153,158` ·
`cardDetailLoader.test.ts:143-154` · `viewer/tests/serve-viewer-fixture.ts:826` ·
`pms DraftsView.test.tsx:204,209` · (indirect via pms-surfaces: `PmsApp.test.tsx`, `NotepadView.test.tsx`)

### Self-referential paths inside the sweep
- `threads.json:218` → `runtime/manifest.md` (runtime/ archives; fix or moot after 4b)
- `runtime/{source-ladder.md:4-5,EVENTS.md:4-5}` — self-absolute paths (archived)
- `runtime/front-of-house/{current-item.json:25,agenda.json:2,276}` — hardcoded
  `/Users/danvers/conductor/...` machine path (captured scan artifact; archived)
- `knowledge-organization/Concept/{Concept - Altitude.md:13,Concept - Library.md:14}`
  — `source_evidence` self-paths (fix in Slice 0)

### Docs
- `CLAUDE.md:22-24` (guarded); `studio/plays/back-of-house-walk/{brief.md:569,1123,risk-map.md:158}`;
  active plans list as in §A (633-when-horizon, 628-strategy-card-fields,
  rationale-taxonomy-fix, 634-canonical-type-language, strategy-plane-rebuild,
  library-tidy, library-word-legibility, pms-alexandria-boundary-migration)
- zero references in packages/alexandria-plugin/ or skills/ (sweep is not
  referenced by shipped plugin content)

## C. Library-root resolution map (pre-migration state)

- ax loaders default: `<workspace>/library` — `library-graph-loader.ts:482,634-635,671`;
  no `library*` key in `AlexandriaNextConfigSchema` (`config.ts:199-214`;
  excess keys preserved but unread, `config.ts:271,80`)
- runtime-server `?libraryRoot=` param: `runtime-server.ts:2044-2051` (graph),
  `:2143-2149` (catalog), `:3178-3189` (card detail); empty-string guard `:278`
- viewer default: build-time import of `docs/alexandria/library-bundles.json`
  (`library-bundle-registry.ts:26`) → `library-mode-config.ts:65-68` consts →
  `viewerSectionLibraryRootRequest` `:131-141`; param read `viewer-routes.ts:479-485`;
  client serialization `app/runtime/client.ts:123-124,150-151,177-178`
- plugin prompts: config/workspace-driven, no hardcoded roots
  (`raven-resources/library-model.md:8-19,69`; `raven.md:46`)
- catalog sidecar constants: `library-catalog.ts:26-35`
  (gaps/threads/workflows/manifest), `library-search-prior.ts:1-2`
- operational exclusions: `library-confirmation.ts:38-44` (5 report basenames),
  `:52-58` (`runtime/` wholesale)
- draft overlay: `applyLibraryDraftOverlay` (`library-draft-overlay.ts`),
  `resolveOverlaidLibraryFiles` (`library-graph-loader.ts:412-465`; patchLog
  must be outside libraryRoot `:438`); writer
  `appendFrontOfHouseDraftPatchLog` (`front-of-house.ts:2155`, flow `:2481-2497`,
  CLI `ax internal front-of-house apply-patch --draft-log`)
- backfill sources: `runtime/front-of-house/answers/*.json` (25 receipts),
  `agenda.json`, `patch.json`, `threads.json`, `gaps.json`

## D. Sweep-dir file audit (2026-07-07, all verdicts ruled)

- 126 visible cards, 12 contexts + `_index` → MOVE
- 5 sidecar JSONs → dissolve per plan §2.5 (ride the move first, dissolve in Slice 4)
- 5 root reports + `runtime/` (incl. stale FoH agenda naming pre-reorg
  containers) → ARCHIVE after backfill
- `runtime/Capability/Capability - Inspect State.md` → RE-HOME (only-ever
  card under runtime/; added #627; invisible since birth; proposed `ledger/`)
- duplicate `library-search-prior.json` (root + runtime/) → both archived
