# Issue #725: Single product-card mode and Drafts from Ledger

Status: implementation-ready technical plan. This is a planning-only artifact;
implementation files are intentionally untouched in this stage.

## Header

- Issue: GitHub #725, "Single product-card mode: retire library.json; Drafts
  tab projects from ledger events"
- Goal: delete the product library's `library.json` sidecar, keep product-card
  catalog behavior through the config-resolved product library identity, and
  make product Drafts a Ledger projection instead of a
  `studio/drafts/<bundle>/patches.json` file projection.
- Linked product plan:
  `docs/alexandria/plans/library-migration/plan.md` sections 2.1, 2.4, 2.5,
  and Slice 4d.
- Rulings in force: the Builder registry is Builder-only (2026-07-07);
  projections are rebuildable caches only, not authoritative state (event
  sourced plan, Core Decision 10).
- Blocked by: #704, now merged per issue prompt.
- Blocks: Slice 4e path lint and frontmatter strip, still deferred.

## Source Review

- Read repository guidance: `CLAUDE.md`, `README.md`.
- Read planning guidance:
  `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- Read package guidance for affected surfaces:
  `packages/ax/CLAUDE.md`, `packages/ax/README.md`,
  `packages/viewer/README.md`, `packages/alexandria-plugin/CLAUDE.md`,
  and `packages/pms/CLAUDE.md`.
- Read `EVALS.md`. This slice should not change shipped plugin skills or
  agents, so eval-harness reruns are not required unless implementation expands
  into plugin files.
- Read the linked library migration plan and the adjacent issue plans for
  #683, #686, #697, and #704.
- Fetched GitHub issue comments for #725. The only comment is the Fabro local
  run link for run `01KX1RH6EWDF5MJH6PE2V1Z1E3`; it adds no extra technical
  constraints.
- Inspected current code in `packages/ax/src/effects/library-graph-loader.ts`,
  `packages/ax/src/domain/library-catalog.ts`,
  `packages/ax/src/domain/library-draft-overlay.ts`,
  `packages/ax/src/domain/state-events.ts`,
  `packages/ax/src/commands/front-of-house.ts`,
  `packages/viewer/src/components/library/library-mode-config.ts`,
  `packages/viewer/src/components/library/library-bundle-registry.ts`, and
  `packages/viewer/src/components/library/LibraryBrowserApp.tsx`.

## Scope

In scope:

1. Delete `docs/alexandria/library/library.json`. This is the only planned
   edit under `docs/alexandria/library/`; do not edit card content.
2. Treat a catalog root as product-card when either:
   - the root has a compatible `library.json` manifest, preserving QA and
     Builder bundle compatibility; or
   - the resolved root is the config-resolved product library root.
3. Preserve `LIBRARY_CATALOG_MANIFEST_FILE` parsing for non-product bundles.
   The manifest parser survives as compatibility, not as the product library's
   source of truth.
4. Replace the product-root draft overlay file source with a Ledger projection
   from `library.card_patch_applied`, `library.answer_recorded`, and
   `library.section_confirmed` events, while retaining old-spelling
   `library.front_of_house.*` read aliases for frozen history.
5. Make `draftPatchLog` query params inert for the product library root:
   product-root catalog, graph, and card-detail reads must not validate or read
   a draft patch-log file. Non-product reads with an explicit `draftPatchLog`
   keep the existing file-overlay compatibility path.
6. Change `ax internal front-of-house apply-patch --draft-log` and
   `apply-patch-step --draft-log` so accepted patches append the durable event
   and do not write a draft-log file. The CLI flag remains accepted for
   workflow compatibility.
7. Carry enough patch detail in the durable event for the Drafts projection to
   rebuild the same ruling cards, draft trails, container mapping, and
   proposed index-card information that the patch-log file used to provide.
8. Update the Alexandria viewer so the product viewer section no longer sends a
   default `draftPatchLog`; the product Drafts tab renders from the catalog's
   event-sourced `draftOverlay`.
9. Keep Builder empty-library and QA bundle behavior intact: a fixture bundle
   with its own `library.json` and explicit draft log must behave as it does
   today.
10. Update deterministic tests and route-level acceptance checks for product
    root without manifest, QA bundle with manifest, Drafts from events, inert
    no-file draft params, front-of-house event-only output, and full suite
    coverage.

## Non-Goals

1. Do not edit `.github/workflows`.
2. Do not edit product card markdown content.
3. Do not implement Slice 4e: path identity lint, frontmatter identity strip,
   `rulings:` / `proposed_by:` removal, or `source_evidence:` to `evidence:`.
4. Do not remove product-card manifest compatibility for QA or Builder bundles.
5. Do not fold `docs/alexandria/library-bundles.json` into config. The registry
   remains Builder-only.
6. Do not remove the `draftPatchLog` request field from public AX/viewer
   request types in this slice. Make it inert for product-root reads and keep
   it functional for non-product compatibility.
7. Do not update shipped plugin prompts or skills in this slice. The product
   plan's Slice 5 owns Back-of-House and Front-of-House play/skill prose.
8. Do not migrate PMS state or make PMS depend on Alexandria's Ledger. PMS has
   a copied viewer and its own boundary rule; only touch PMS copied strings if
   implementation needs a non-behavioral cleanup for the literal grep gate.

## Product-Plan Summary

The library migration plan reduces library state to four homes: config, card
files, Ledger events, and rebuildable projections. Section 2.1 retires
`library.json` for the real product library because legacy mode no longer
needs to be opted out of; product-card is the only product mode. Section 2.4
says Drafts is a projection of mutation events not yet applied to files.
Section 2.5 names `patches.json` and `library.json` as sidecars to dissolve.
Slice 4d is the implementation slice for these two retirements.

The issue narrows that plan:

- `library.json` compatibility remains for QA bundles.
- The product library keeps product-card behavior through the resolved config
  identity, not through a checked-in manifest.
- The registry remains Builder-only and its product bundle `draftPatchLog`
  field becomes inert.
- `--draft-log` remains a workflow-compatible flag, but the accepted patch is
  represented by the Ledger event only.
- The merge result will be live-gated against main's no-param
  `/api/library/catalog` output, with byte-parity on `threads` and
  `workflows`.

## Current Gap

Current main still depends on the two sidecar concepts this issue retires:

- `docs/alexandria/library/library.json` exists and is the only JSON sidecar
  at the live product library root.
- `catalogSchemaFromManifestContent` returns `"legacy"` when no manifest is
  present. `loadLibraryCatalogRoot` only selects product-card parsing from
  that manifest.
- `resolveOverlaidLibraryFiles` accepts `draftPatchLog`, validates it as a file
  path, reads the file when present, and calls `applyLibraryDraftOverlay`.
- `draftOverlayEventsProjection` only enriches a file-derived draft overlay
  with answer excerpts and section confirmations. It does not create the
  overlay from events.
- Product viewer-section reads still include the default
  `studio/drafts/alexandria-product/patches.json` request param when no
  `?libraryRoot=` override is present.
- `docs/alexandria/library-bundles.json` still gives the product Builder
  bundle a required `draftPatchLog` string.
- `ax internal front-of-house apply-patch --draft-log` validates and writes the
  patch-log file, then appends a minimal patch-applied event. That event is not
  currently sufficient to rebuild the full draft overlay by itself.
- Existing tests assert patch-log file writes, required registry
  `draftPatchLog`, and route behavior that reads `drafts/patches.json`.

## Architectural Boundaries

1. AX owns catalog schema selection, path validation, event replay, draft
   overlay projection, and deterministic CLI behavior.
2. The viewer must stay a runtime API consumer. It should choose request
   params, not read workspace files or Ledger JSONL directly.
3. Product-root identity must come from the same resolved root as #683:
   request root or no request root resolved against process override,
   `library.root`, then `<workspace>/library`. Do not hard-code the product
   path as the authoritative state check.
4. Event projections must not depend on projection files or registry fields.
   Registry data can select a Builder bundle, but it cannot be the product
   Drafts source of truth.
5. Product-root `draftPatchLog` inertness must happen before draft-log path
   validation. A stale or missing product draft-log path must not produce a
   400 or attempt a file read.
6. Non-product compatibility remains path-validated. A QA bundle with a
   manifest and explicit draft log should still get the current file-overlay
   behavior, including invalid-patch and unresolved-update reporting.
7. Front-of-House accepted patch events must be self-contained enough for
   replay. File writes to cards remain the sink for non-draft `apply-patch`;
   `--draft-log` becomes an event-only staging sink.
8. PMS is a separate product boundary. PMS copied `patches.json` references are
   not evidence that Alexandria product Drafts still uses a sidecar; avoid
   behavioral PMS changes unless a separate PMS ruling is made.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| Live product library | `docs/alexandria/library/library.json` | Delete the manifest so `ls docs/alexandria/library/*.json` is empty. Do not edit cards. |
| Catalog mode selection | `packages/ax/src/effects/library-graph-loader.ts`, possibly a small helper near `library-root.ts` | Select product-card mode when the resolved root is the config/product root even without a manifest; keep manifest mode for QA roots. |
| Draft overlay domain | `packages/ax/src/domain/library-draft-overlay.ts` or a new adjacent event projection module | Add event-sourced overlay projection from patch/answer/section events; keep file overlay for non-product compatibility. |
| AX event schema and parsers | `packages/ax/src/domain/state-events.ts`, `packages/ax/tests/events.test.ts` | Ensure `library.card_patch_applied` can represent live Front-of-House patch details; keep old-spelling aliases and parse helpers. |
| AX loaders and routes | `packages/ax/src/effects/library-graph-loader.ts`, `packages/ax/src/effects/runtime-server.ts`, `packages/ax/tests/runtime-server.test.ts`, `packages/ax/src/effects/library-graph-loader.test.ts` | Product-root reads ignore `draftPatchLog` files and catalog Drafts derives from events; non-product manifest/draft-log fixtures stay compatible. |
| Front-of-House CLI | `packages/ax/src/commands/front-of-house.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts`, related CLI tests | `--draft-log` accepted patches append self-contained events and do not create/update `patches.json`; idempotent retries remain deterministic. |
| Viewer request shaping | `packages/viewer/src/components/library/library-mode-config.ts`, `LibraryBrowserApp.tsx`, `library-mode-config.test.ts`, `LibraryBrowserApp.test.tsx`, `hooks/cardDetailLoader.test.ts`, `src/app/runtime/client.test.ts` | Product viewer section stops sending default `draftPatchLog`; Builder bundle requests include it only for compat bundles that still define it. |
| Builder registry | `docs/alexandria/library-bundles.json`, `packages/viewer/src/components/library/library-bundle-registry.ts`, registry tests | Make `draftPatchLog` optional or inert for the product bundle while preserving explicit compat entries for QA bundles. |
| Viewer Drafts rendering | `packages/viewer/src/components/library/DraftsView.tsx`, `DraftsView.test.tsx`, Playwright fixtures/specs | Product Drafts empty state no longer names an expected patch-log file; rendered rulings come from catalog `draftOverlay`. |
| Studio tools grep fallout | `studio/tools/**` only if live `patches.json` references exist | The issue's literal grep must leave only approved Builder/registry compat references or none. Do not invent a new Studio sidecar. |
| PMS copied viewer | `packages/pms/**` only if non-behavioral grep cleanup is required | Preserve PMS boundary; do not route PMS Drafts through Alexandria product Ledger in this issue. |
| Technical plan | `docs/alexandria/plans/725-single-product-card-drafts-from-ledger/plan.md` | This handoff document. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Shipped agents | None planned. | No agent eval rerun. |
| Shipped plugin skills/workflows | None planned in this slice. Slice 5 owns play/skill copy that stops saying Back-of-House emits `library.json`. | If implementation unexpectedly edits `packages/alexandria-plugin`, run `claude plugin validate ./packages/alexandria-plugin` and the targeted eval action below. |
| AX CLI/internal tools | `front-of-house apply-patch --draft-log` changes from file write plus event to event-only staging. Output must not claim a file append happened. | Update black-box tests for exit codes, JSON fields, idempotency, and file absence. |
| Viewer | Product Drafts consumes event-projected catalog data and stops sending a product draft-log param. | Update viewer unit tests, Playwright request assertions, build, and browser checks. |
| Builder/QA registry | `draftPatchLog` is compat data, not product source of truth. | Registry tests must cover product bundle without a draft log and QA bundle with one. |
| Eval harness | No reusable product skill behavior changes planned. | No eval-harness rerun required unless plugin files are edited. |

## Detailed Behavior Contract

### Product-card mode selection

1. A root is product-card when its manifest parses as
   `{"schemaVersion":"product-card.v1"}`.
2. A root is also product-card when its resolved absolute path matches the
   config-resolved product library root. Use the same normalization strategy as
   root validation, including realpath tolerance where symlinks are already
   handled.
3. A missing, malformed, or non-product manifest still means legacy mode for
   non-product roots.
4. `loadLibraryCatalog` should pass product-root identity into
   `loadLibraryCatalogRoot`; direct tests of `loadLibraryCatalogRoot` should be
   updated to declare the product root explicitly when no manifest is present.
5. Product-root no-manifest output must be byte-equivalent to current main's
   product-root manifest output for card count, metadata issues, `threads`, and
   `workflows`.

### Draft overlay source selection

1. Product-root catalog reads ignore `draftPatchLog` and derive
   `draftOverlay` from Ledger events.
2. Product-root graph and card-detail reads also ignore `draftPatchLog` as a
   file source. If they do not need draft projection, they may read base files;
   they must not validate or read the patch-log path.
3. Non-product reads with an explicit `draftPatchLog` keep the existing
   `applyLibraryDraftOverlay` file path.
4. Non-product reads without `draftPatchLog` get no draft overlay.
5. A `?draftPatchLog=` request param with no file present is inert for the
   product root and still path-validated for non-product roots.

### Event-sourced Drafts projection

1. The product projection reads normalized `library.card_patch_applied` events,
   including existing `library.front_of_house.bundle_patch_applied` aliases.
2. The projection joins `library.answer_recorded` events by `answerEventId` to
   fill `agendaItemId`, `rulingExcerpt`, and play-run context. Old-spelling
   `library.front_of_house.answer_recorded` aliases must continue to work.
3. The projection scopes patch events to the product root. Prefer the current
   event `bundlePath` match when it is present and valid; do not use
   `backfill.bundle` as a state filter. If a real historical product patch
   event carries a stale moved path, follow #697's identity-scoped pattern and
   cover that case with a regression.
4. New live patch-applied events emitted by `--draft-log` must include enough
   information to rebuild the old patch-log projection: `agendaItemId`,
   `answerEventId`, `patchId`, `resolution`, `cardUpdates`,
   `containerMapping`, optional `keystoneDraft`, `touchedCardPaths`,
   `contentHash`, `playRunId`, and `bundlePath`.
5. Events with full `cardUpdates` apply those updates over collected markdown
   files using the same `applyFrontOfHouseCardUpdateToContent` path as the
   file overlay.
6. Events without full update details do not crash replay. They may appear as
   zero-update rulings when `agendaItemId` can be recovered from the answer
   event; they cannot create draft trails or patched card content.
7. Section confirmations are projected from the latest
   `library.section_confirmed` event for play runs selected by the product
   draft projection, matching the current `draftOverlayEventsProjection`
   sorting and stale-section filtering behavior.
8. The catalog wire shape may keep `draftOverlay.patchLogPath` temporarily for
   compatibility, but product event projections should use a non-file value
   such as `ledger:library.card_patch_applied`. Viewer copy must not describe
   it as an expected file for product Drafts.

### Front-of-House event-only staging

1. `--draft-log` remains parsed by `apply-patch` and `apply-patch-step` so
   existing workflow invocations do not fail.
2. When `--draft-log` is present, the command validates the patch against the
   bundle and computes the same derived updates/content hash as today, but it
   does not write card files, refresh bundle manifests, or write a draft-log
   file.
3. The durable sink is the appended patch-applied event. Prefer the flat
   `library.card_patch_applied` type for new appends; keep read-side and
   idempotency compatibility with old-spelling events already in a Ledger.
4. The output should use an honest event-only sink/status. Do not report
   `draftLogStatus: appended` unless a compatibility file was actually written.
5. Re-running the same command with the same idempotency key returns
   `already_appended` without creating a file or a second event.
6. Non-draft `apply-patch` remains the direct bundle mutation path and keeps
   its manifest/version behavior.

### Viewer and registry behavior

1. Viewer-section catalog/graph/card-detail requests omit `draftPatchLog` by
   default. Explicit `?libraryRoot=` remains the raw-root escape hatch and also
   omits forced draft overlay.
2. Builder Back/Drafts/Notepad/Confirm stay registry-scoped.
3. The registry parser should accept product bundles without `draftPatchLog`.
   For compat QA bundles that define `draftPatchLog`, request shaping should
   continue to send it.
4. The real checked-in product registry entry should not make the product
   Drafts tab depend on `studio/drafts/alexandria-product/patches.json`.
5. Product Drafts empty state should not display "Expected draft log" for the
   retired product sidecar.

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| Product sidecar inventory | `find docs/alexandria/library -maxdepth 1 -type f -name '*.json' -print` and `ls docs/alexandria/library/*.json` | Proves the live product library has zero root JSON sidecars after deleting `library.json`. |
| Manifest/product-root loader tests | `pnpm --filter @alexandria/ax exec bun test src/effects/library-graph-loader.test.ts src/domain/library-catalog.test.ts` | Covers product-root without manifest, QA bundle with manifest, legacy fallback for non-product roots, and unchanged catalog semantics. |
| Draft overlay domain | `pnpm --filter @alexandria/ax exec bun test src/domain/library-draft-overlay.test.ts` | Covers event-sourced overlay, zero-update rulings, answer excerpts, section confirmations, unresolved updates, and non-product file-overlay compatibility. |
| Event schema | `pnpm --filter @alexandria/ax exec bun test tests/events.test.ts` | Proves append/validate schemas for live `library.card_patch_applied`, read aliases, and malformed payload handling. |
| Runtime route | `pnpm --filter @alexandria/ax exec bun test tests/runtime-server.test.ts` | Proves `/api/library/catalog` no-param behavior, inert product `draftPatchLog`, Drafts from events with no file, and non-product bad-path validation. |
| Front-of-House CLI | `pnpm --filter @alexandria/ax exec bun test tests/library-front-of-house-bundle.test.ts tests/library-front-of-house.test.ts tests/front-of-house-answer-banking.test.ts` | Proves event-only `--draft-log`, idempotency, no file writes, no card mutation, and unchanged non-draft apply behavior. |
| AX CLI black-box fallout | `pnpm --filter @alexandria/ax exec bun test tests/cli.test.ts tests/viewer.test.ts tests/library-catalog-threads.test.ts tests/library-confirmation.test.ts tests/library-confirmation-cli.test.ts` | Covers help/output contracts, viewer route/catalog fixtures, threads parity, and Builder confirmation compatibility. |
| AX package checks | `pnpm --filter @alexandria/ax run typecheck && pnpm --filter @alexandria/ax run lint && pnpm --filter @alexandria/ax run format:check` | Full AX type/lint/format validation. |
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Covers request shaping, registry optional draft logs, Drafts rendering, card-detail query params, and runtime client query construction. |
| Viewer static/browser checks | `pnpm --filter @alexandria/viewer run check && pnpm --filter @alexandria/viewer run build && pnpm --filter @alexandria/viewer run test:e2e` | Required because product Library and Drafts viewer behavior changes. |
| Studio guard | `sh studio/tools/check.sh` | Ensures Studio/library semantic guards still pass after sidecar deletion and grep cleanup. |
| PMS boundary check, if touched | `pnpm --filter @alexandria/pms run typecheck && pnpm --filter @alexandria/pms run test && pnpm --filter @alexandria/pms-viewer run typecheck && pnpm --filter @alexandria/pms-viewer run test && pnpm --filter @alexandria/pms-viewer run build` | Only required if implementation changes PMS copied viewer files for grep cleanup. |
| Literal cleanup gate | `rg 'patches\\.json' packages studio/tools` and `rg 'library\\.json' packages/ax packages/viewer studio/tools` | Confirms retired sidecar references are gone or limited to approved Builder/registry/non-product manifest compatibility. |
| Live no-param route parity | Restart `ax start viewer`, fetch `/api/library/catalog` with no params before and after the merge result, and compare `meta.cardCount`, `meta.metadataIssues`, `threads`, and `workflows`. | Issue acceptance: same card count, zero metadata issues, and byte-parity for `threads` and `workflows` arrays. |
| Full repo gates | `pnpm run check && pnpm run test` | Final regression pass after targeted fixes. |

For live parity, derive counts from the target branch's real output. Do not use
counts from the issue body. The orchestrator should verify the merge result
against main's route output after restarting the runtime, per the execution-log
stale-server lesson.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| AX catalog/runtime/CLI | Bun unit and black-box route/CLI tests. | Add/update deterministic coverage; no eval harness. | Commands in Deterministic Verification. |
| Viewer Library/Drafts | Viewer unit, build, and Playwright coverage. | Update request/render tests; no eval harness. | Viewer commands above. |
| Shipped plugin agents/skills | No planned behavior change. | No eval rerun required. If implementation edits plugin prompts or skills, run plugin validation and list/rerun the smallest relevant eval set. | `claude plugin validate ./packages/alexandria-plugin`; then `pnpm eval -- list` and relevant Front-of-House/Back-of-House cases if present. |
| Maintainer planning skill | Used to create this plan only. | No eval-harness coverage required. | None. |
| PMS copied viewer | Out of scope unless non-behavioral cleanup is needed. | No eval harness; run PMS deterministic commands if touched. | PMS commands above, if touched. |

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Deleting `library.json` accidentally puts the product catalog into legacy mode. | Product-root identity must be an explicit input to catalog schema selection; add product-root-without-manifest route and loader tests before deleting the file. |
| Manifest compatibility for QA bundles is broken while retiring the product manifest. | Keep `catalogSchemaFromManifestContent` or an equivalent helper for non-product roots; add a fixture with its own manifest and unchanged expected catalog. |
| Product `draftPatchLog` is still validated before being ignored, so a missing or stale file can fail Drafts. | Decide product-root identity first, drop the draft-log option for product roots before path validation, and test `?draftPatchLog=studio/drafts/alexandria-product/patches.json` with no file. |
| Event-sourced Drafts lacks the full patch operations that the old patch log stored. | Make new patch-applied events self-contained with `cardUpdates`, `containerMapping`, and optional `keystoneDraft`; add projection tests that assert draft trails and ruling cards without any file. |
| Existing old-spelling minimal events conflict with the new flat event type on idempotent retries. | In the existing-event pre-scan, normalize event type aliases and compare the payload subset produced by `parseBundlePatchApplied`; do not call `appendEvent` when an equivalent old event already exists. |
| A new CLI output claims a draft log was appended even though no file was written. | Introduce or reuse an event-only sink/status and update black-box tests to assert honest JSON fields plus file absence. |
| Product event scoping repeats #697's path-literal bug. | Scope product inclusion to the config-resolved product root and use `bundlePath` only as a current patch-event discriminator, never `backfill.bundle`; add a stale-path regression if real events require it. |
| Builder bundle Drafts loses file-overlay compatibility. | Keep file overlay for non-product roots with explicit draft logs and add a Builder/QA fixture test with manifest plus patch log. |
| The literal `patches.json` grep is ambiguous because PMS has a copied PMS-Drafts surface. | Keep PMS behavior out of scope; if touched only for cleanup, run PMS checks. In PR evidence, classify any remaining PMS or Builder references explicitly against the boundary ruling, or file a PMS follow-up if the acceptance owner wants the grep to be absolute. |
| Route parity is checked against a stale runtime. | Restart `ax start viewer` before live parity checks and verify the merge result, not only the feature branch tip. |

## Implementation Steps

1. Record the branch baseline before edits:
   - current `find docs/alexandria/library -maxdepth 1 -type f -name '*.json' -print`;
   - no-param `/api/library/catalog` `meta.cardCount`,
     `meta.metadataIssues`, `threads`, and `workflows`;
   - current `rg 'patches\\.json' packages studio/tools` and
     `rg 'library\\.json' packages/ax packages/viewer studio/tools`.
2. Add tests for product-root catalog mode without `library.json`, and keep a
   non-product fixture with manifest proving QA/Builder manifest compatibility.
3. Refactor catalog schema selection so `loadLibraryCatalog` computes the
   product root once and `loadLibraryCatalogRoot` can select product-card mode
   from either manifest content or product-root identity.
4. Add event-to-draft-overlay projection. Reuse the existing patch application
   and ruling-entry helpers where possible instead of duplicating patch logic.
5. Expand `draftOverlayEventsProjection` into the only product Drafts source:
   selected patch events produce rulings/trails, answer events enrich excerpts,
   and latest section-confirmation events attach to the selected play runs.
6. Preserve the existing file overlay path for non-product explicit
   `draftPatchLog` reads. Keep its invalid-patch, unresolved-update, and
   section-confirmation tests.
7. Update runtime route option plumbing so product-root catalog/graph/card
   detail reads ignore `draftPatchLog` before file path validation.
8. Update state event append/replay schemas and parse helpers so new live
   `library.card_patch_applied` events can carry full patch detail without a
   historical `backfill` object, while old ledgers continue to parse.
9. Update `front-of-house apply-patch` and `apply-patch-step`:
   - keep `--draft-log` accepted;
   - stop calling the patch-log file append helper for product event-only
     staging;
   - append the self-contained event;
   - keep idempotent retry behavior across old and new event spellings;
   - keep non-draft apply behavior unchanged.
10. Update viewer request shaping:
    - product viewer reads no longer include default `draftPatchLog`;
    - product Drafts renders from catalog event overlay;
    - Builder registry `draftPatchLog` is optional or inert for the product
      bundle;
    - compat bundles with an explicit patch log still send it.
11. Update checked-in `docs/alexandria/library-bundles.json` so the product
    bundle no longer acts as the product Drafts source of truth. Keep or add
    test fixtures for compat bundles with `draftPatchLog`.
12. Delete `docs/alexandria/library/library.json`.
13. Remove or reclassify live `patches.json` references in `packages` and
    `studio/tools` according to the Builder/PMS compatibility boundary.
14. Run the targeted verification matrix, fix in-scope failures, then run full
    repo gates.
15. Restart the runtime and perform live `/api/library/catalog` parity against
    main's no-param output before merge.

## Acceptance / Exit Criteria

1. `docs/alexandria/library/library.json` is deleted.
2. `ls docs/alexandria/library/*.json` is empty after the change.
3. Live `GET /api/library/catalog` with no params matches current main for:
   - same `meta.cardCount`;
   - `meta.metadataIssues` remains zero;
   - `threads` array byte-parity;
   - `workflows` array byte-parity.
4. The product root loads as product-card with no manifest.
5. A QA/Builder fixture root with its own `library.json` still loads as
   product-card and preserves its existing manifest/draft-log compatibility
   behavior.
6. The product Drafts tab renders rulings from Ledger events with no
   patch-log file present.
7. A seeded `library.card_patch_applied` event plus matching
   `library.answer_recorded` event appears in `catalog.draftOverlay.rulings`
   without any `patches.json` file.
8. Product-root `?draftPatchLog=` is inert: it does not require the file, does
   not validate the path as a file source, and does not change product Drafts
   away from the event projection.
9. Non-product bad `draftPatchLog` paths still return deterministic client
   errors.
10. `ax internal front-of-house apply-patch --draft-log` and
    `apply-patch-step --draft-log` leave bundle cards frozen, create no
    draft-log file, append one self-contained patch event, and retry
    idempotently.
11. The event-only patch projection can rebuild draft trails, container mapping
    rulings, zero-update rulings, section confirmations, and proposed
    index-card rulings from events.
12. `rg 'patches\\.json' packages studio/tools` returns only references
    explicitly classified as Builder/registry/PMS compatibility by this plan,
    or none.
13. No `.github/workflows` files are changed.
14. No product card markdown content is changed.
15. AX targeted tests, Viewer unit/build/browser checks, Studio guard, any
    touched PMS checks, literal grep gates, live route parity, and full repo
    gates pass or have documented pre-existing failures proven unchanged.

## Deferred Follow-Ups

1. Slice 4e: product-card v2 frontmatter cleanup, path identity lint,
   reserved-name lint, globally unique stems, and source-evidence rename.
2. Slice 5: shipped plugin play/skill/prompt updates so Back-of-House stops
   emitting `library.json` and play prose names Ledger projections instead of
   sidecar files.
3. A future API cleanup can rename `draftOverlay.patchLogPath` to a neutral
   source field once non-product patch-log compatibility is retired.
4. A future Builder registry migration can remove `draftPatchLog` entirely
   after QA bundles no longer use file overlays.
5. PMS Drafts needs its own decision if the project wants to retire PMS
   `studio/drafts/playmaker-studio/patches.json`; this issue must not blur the
   PMS/Alexandria Ledger boundary.
