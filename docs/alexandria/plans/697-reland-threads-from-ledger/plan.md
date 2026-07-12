# Issue 697: Re-land threads from Ledger

Status: implementation-ready technical plan. This is a planning-only artifact;
implementation files are intentionally untouched in this stage.

## Header

- Issue: GitHub #697, "Re-land threads-from-ledger: project-scoped events,
  derived threads preserved"
- Goal: make the Library Notepad project authored threads from
  `library.thread_opened` minus `library.thread_resolved` Ledger events, retire
  `threads.json` as a catalog input, delete the live sidecar, and preserve the
  current derived-thread projection exactly.
- Linked product plan:
  `docs/alexandria/plans/library-migration/plan.md`, section 2.3/2.4,
  Slice 4b.
- Reference implementation: reverted commit `9bb9e07bf` from PR #694. It is
  reference material only; PR #695 reverted it for the two defects named below.

## Source Review

- Read repository guidance: `CLAUDE.md`, `README.md`.
- Read planning guidance:
  `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- Read package guidance for affected surfaces:
  `packages/ax/CLAUDE.md`, `packages/ax/README.md`,
  `packages/viewer/README.md`, `packages/alexandria-plugin/CLAUDE.md`,
  `packages/alexandria-plugin/README.md`, and `packages/pms/CLAUDE.md`.
  `packages/viewer/CLAUDE.md` is not present in this checkout.
- Read `EVALS.md` because this slice updates shipped plugin workflow/skill
  text as part of removing live `threads.json` references.
- Read linked plan section 2.3/2.4 and Slice 4b in
  `docs/alexandria/plans/library-migration/plan.md`.
- Fetched GitHub issue comments for #697. The only comment available through
  the connector is the Fabro local run link for run
  `01KX140R54924J5P5V4BBDA867`.
- Checked PR #694 and PR #695 discussion through the connector; no comments
  were returned.
- Inspected current code and the reverted commit for:
  `packages/ax/src/domain/library-catalog.ts`,
  `packages/ax/src/domain/library-thread-resolution.ts`,
  `packages/ax/src/domain/state-events.ts`,
  `packages/ax/src/effects/library-graph-loader.ts`,
  `packages/ax/src/effects/runtime-server.ts`,
  `packages/ax/src/commands/front-of-house.ts`,
  `packages/ax/src/commands/library.ts`, `studio/tools/check-threads.mjs`,
  and the reverted `packages/ax/src/domain/library-thread-events.ts`.
- Current checkout note: `docs/alexandria/ledger/` is ignored by `.gitignore`
  and no tracked `docs/alexandria/ledger/events.jsonl` exists in this working
  tree. Route-level acceptance on the "real ledger" must therefore be verified
  against the local/runtime ledger state, not a committed ledger file.

## Scope

In scope:

1. Add or restore the AX event schema and parse helpers for
   `library.thread_opened` and `library.thread_resolved`.
2. Project product-library authored Notepad threads from Ledger events instead
   of `docs/alexandria/library/threads.json`.
3. Scope authored thread events by product-library identity:
   - include authored thread events only when the requested catalog root resolves
     to the config-resolved product library root (`library.root`, or the
     default `<workspace>/library`);
   - ignore `payload.backfill.bundle` for product catalog inclusion;
   - return zero product-authored threads for Builder `bundlePath` reads and
     explicit non-product `libraryRoot` reads.
4. Preserve derived-thread computation byte-for-byte relative to current main.
   `missingFillSections`, `deriveLibraryCatalogThreads`, `CANONICAL_FILL_SECTIONS`,
   fill-readiness construction, and derived-thread sorting are out of bounds
   except for call-site wiring needed to merge authored threads.
5. Delete the live product sidecar `docs/alexandria/library/threads.json`.
   This is the only planned edit under `docs/alexandria/library`; do not edit
   cards or other live library content in this slice.
6. Remove `threads.json` parsing, constants, fixtures, tests, and live
   references from `packages/**` and `studio/tools/**`.
7. Retarget `studio/tools/check-threads.mjs` from the sidecar schema to
   committed `library.thread_opened` / `library.thread_resolved` event fixtures
   and embedded plugin workflow examples.
8. Update shipped plugin workflow/skill copy that currently tells plays to
   emit or read `threads.json`, so the play contract says Ledger thread events
   instead.
9. Keep HTTP route coverage for `/api/library/catalog` as the acceptance
   surface for real-root projection and Builder negative scoping.
10. Keep existing Front-of-House lifecycle behavior deterministic while removing
    sidecar references. If an agenda path still needs authored thread input, it
    must read the same validated Ledger event contract and must not reintroduce
    `threads.json`.

## Non-Goals

1. Do not refactor `missingFillSections`, `deriveLibraryCatalogThreads`, or the
   derived missing-card/missing-material rules.
2. Do not move, rewrite, or normalize product card files under
   `docs/alexandria/library`.
3. Do not retire `workflows.json`, `gaps.json`, `library.json`, or draft patch
   concepts in this slice; those are separate Slice 4 items.
4. Do not change Viewer Notepad rendering semantics except as required by the
   catalog response no longer containing sidecar-backed threads.
5. Do not add a new checked-in source of truth for authored threads. Ledger
   events are the source of truth; test fixtures are only verification inputs.
6. Do not write Ledger JSONL directly. Backfill or verification events must go
   through AX append/backfill paths.
7. Do not use `backfill.bundle` as a product-catalog filter key. It is
   provenance for historical events whose paths can be stale after library
   moves.
8. Do not add a read-side alias for event types that never shipped. Preserve
   existing `library.front_of_house.*` aliases for existing old-spelling events;
   add only aliases needed by real historical ledgers.

## Product-Plan Summary

The library migration plan says sidecar state must dissolve into four homes:
config, card files, Ledger events, and rebuildable projections. In section 2.3,
the plan adds `library.thread_opened` and `library.thread_resolved` as Ledger
facts replacing `threads.json` definitions and implicit resolution state. In
section 2.4, Notepad becomes a projection of opened threads minus resolved
threads. Slice 4b is the implementation slice for that move.

The issue narrows the re-land:

- PR #694's event projection, `thread_resolved` schema, and event-fixture
  `check-threads` guard are the right architecture.
- Defect 1 from PR #694 must be fixed: product authored-thread events are scoped
  to the product library identity, not to the historical path recorded in
  `backfill.bundle`.
- Defect 2 from PR #694 must be fixed: derived-thread logic must not be changed.
  The previous refactor dropped `CANONICAL_FILL_SECTIONS` handling and took the
  real library's derived missing-material threads from 22 to 0.

## Current Gap

Current main after the revert still reads authored threads from
`threads.json`:

- `packages/ax/src/domain/library-catalog.ts` exports
  `LIBRARY_CATALOG_THREADS_FILE`, `LIBRARY_CATALOG_THREADS_SCHEMA_VERSION`, and
  `parseLibraryCatalogThreads`.
- `packages/ax/src/effects/library-graph-loader.ts` reads
  `<resolvedLibraryRoot>/threads.json`, parses it, then passes those records
  through `projectLibraryCatalogThreadResolutions`.
- `packages/ax/src/domain/library-thread-resolution.ts` projects legacy
  front-of-house answer/patch/residual/reopen events over sidecar-sourced
  threads.
- `packages/ax/src/domain/state-events.ts` currently contains a partial
  `library.thread_opened` schema entry but no `library.thread_resolved` type or
  exported parse helpers.
- `studio/tools/check-threads.mjs` validates `library-threads.v1` JSON examples
  and committed `threads.json` files.
- Plugin workflow and skill files still instruct Back-of-House and
  Front-of-House to emit or consume `threads.json`.
- `rg -n "threads\\.json" packages studio/tools` currently returns live
  references across AX code/tests, Viewer/PMS sample catalogs, plugin workflow
  text, and Studio guards.

The live product sidecar at `docs/alexandria/library/threads.json` has 25
records today, but the target authored product events for this slice are the
three product-library authored gaps named in the issue:

- `gap-living-business-plan`
- `gap-operating-plane-category`
- `gap-federation-mechanism`

The implementation must verify the route-level total against the current
derived-thread baseline before and after the change. The issue states the
expected route total today is 25 after combining the three authored Ledger
threads with the unchanged derived set.

## Defect Contracts

| Contract | Implementation consequence | Required proof |
|---|---|---|
| Product thread events are identity-scoped, not path-scoped. | The product catalog projection checks whether the requested root is the config-resolved product root. It does not compare `payload.backfill.bundle` to the current root. | A product route test uses thread events whose `backfill.bundle` is the old pre-move path and still returns the three authored threads. |
| Builder bundles and explicit non-product roots get zero product-authored threads. | `bundlePath` route reads and non-product `libraryRoot` route reads suppress the product authored-thread projection even when the Ledger contains product thread events. | A `/api/library/catalog?bundlePath=<empty-library fixture>` test with the same Ledger events returns no authored threads. |
| Derived threads are untouched. | No edits to `missingFillSections`, `deriveLibraryCatalogThreads`, or their constants except mechanical imports if unavoidable. | A before/after fixture or snapshot asserts the exact derived thread ids and missing-section payloads for the real library. |
| `library.thread_resolved` is state, not sidecar metadata. | `sourceStatus`, `sourceResolution`, and `sourceResolvingEventId` on backfilled open events are provenance only. Only `library.thread_resolved` removes a thread from the open authored set. | A route or projection test appends `thread_resolved` for one of the three ids and observes that the open authored set drops by one. |
| Duplicate opens are idempotent. | Replay keeps one thread per `threadId`; duplicate `thread_opened` events do not duplicate output. | A projection test emits duplicate opens and asserts one authored thread. |
| Old-spelling front-of-house events still parse. | Existing `normalizeLibraryStateEventType` aliases remain effective for answer/patch/residual/reopen/section events. | A regression test compares old `library.front_of_house.*` and flat `library.*` resolution projection where those historical types exist. |

## Architectural Boundaries

1. AX owns event schemas, Ledger replay, catalog projection, route behavior, and
   deterministic CLI behavior.
2. Viewer and PMS viewer are consumers of `/api/library/catalog`; they should
   not read Ledger JSONL or library files directly.
3. Plugin workflows own guided play instructions. When the deterministic
   contract changes from sidecar JSON to Ledger events, plugin guidance must
   move in the same slice.
4. Studio tools are CI-style drift guards. `check-threads.mjs` should validate
   the same event parser AX uses, not a parallel schema.
5. Product catalog authored-thread projection is separate from any
   Front-of-House agenda projection. The product catalog must suppress authored
   threads for Builder bundle snapshots; Front-of-House code must still avoid
   `threads.json` without weakening that HTTP negative case.
6. Backfilled event provenance fields are preserved for auditability but do not
   define current state.
7. The ignored real ledger is operational state. Tests should use fixtures and
   temp projects; local pre-merge verification should use the real runtime
   ledger through AX commands.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| AX event vocabulary | `packages/ax/src/domain/state-events.ts`, `packages/ax/tests/events.test.ts` | Add `library.thread_resolved`, exported `LibraryThreadOpenedPayload` / `LibraryThreadResolvedPayload` types, parse helpers, schema-document entries, append/validate tests, and any real old-spelling aliases. Tighten `thread_opened.concerns` to the catalog concern union used by the reverted commit unless compatibility requires a broader replay schema. |
| AX authored thread projection | New or restored `packages/ax/src/domain/library-thread-events.ts`, plus focused tests such as `packages/ax/tests/library-catalog-threads.test.ts` | Project open authored threads from Ledger replay with first-open idempotency, `thread_resolved` subtraction, product-root identity scoping, old-path provenance tolerance, and Builder/non-product negative behavior. |
| AX catalog domain | `packages/ax/src/domain/library-catalog.ts`, `packages/ax/src/domain/library-catalog.test.ts` | Remove sidecar file constants/parser as live catalog input; keep thread types and derived-thread helpers unchanged; merge derived threads with Ledger-authored open threads without changing derived output. Update tests that currently call `parseLibraryCatalogThreads` to event fixtures or derived-only fixtures. |
| AX loader and route | `packages/ax/src/effects/library-graph-loader.ts`, `packages/ax/src/effects/runtime-server.ts`, `packages/ax/tests/runtime-server.test.ts` | Stop reading `<libraryRoot>/threads.json`; pass events and product-root identity into the catalog projection; assert `/api/library/catalog` no-param product route, explicit product-root route, Builder `bundlePath` negative route, and resolved-thread subtraction through HTTP. |
| AX Front-of-House / library commands | `packages/ax/src/commands/front-of-house.ts`, `packages/ax/src/commands/library.ts`, related tests | Remove sidecar wording and parsing. If agenda preparation still needs thread input, source it from validated Ledger event projection without using product catalog Builder output as proof of product-authored threads. Remove or replace backfill collection from `threads.json`; keep answer/taxonomy/patch backfill behavior scoped to existing plan slices. |
| AX confirmation and fixtures | `packages/ax/src/domain/library-confirmation.ts`, `packages/ax/tests/library-confirmation*.test.ts`, `packages/ax/tests/fixtures/**` | Remove fixture dependence on `threads.json`; keep confirmation hashing behavior from issue #505 unless a test fixture must be renamed to event input. Delete or rewrite thread-sidecar fixtures to `thread-events.jsonl`. |
| Viewer sample data | `packages/viewer/src/components/library/sample-catalog.ts` and tests if needed | Replace sample provenance strings that name `threads.json` with Ledger event/source wording so `rg` has no live package references. No behavior change to Viewer runtime schemas unless the response shape changes. |
| PMS viewer sample data | `packages/pms/viewer/src/components/library/sample-catalog.ts`, `notepad-test-fixtures.ts` | Replace stale `threads.json` wording in copied sample fixtures. No PMS server or Alexandria proxy behavior change is intended. |
| Plugin play contract | `packages/alexandria-plugin/workflows/back-of-house-walk/**`, `packages/alexandria-plugin/workflows/front-of-house-walk/**`, `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`, possibly `packages/alexandria-plugin/skills/alexandria-event-log/SKILL.md` | Change emitted/consumed thread contract from `threads.json` to Ledger `library.thread_opened` / `library.thread_resolved` events. Keep reusable wording generic and avoid product-specific examples except fixtures. |
| Studio guard | `studio/tools/check-threads.mjs`, `studio/tools/check-threads.test.mjs`, `studio/tools/fixtures/threads/**`, `studio/tools/check.sh` comments | Validate embedded event JSON and `thread-events.jsonl` fixtures through `validateAlexandriaStateEvent`, `parseLibraryThreadOpened`, and `parseLibraryThreadResolved`. Delete sidecar-shaped fixtures. |
| Live product library | `docs/alexandria/library/threads.json` | Delete the retired sidecar only after the real ledger is seeded/verified with the three open thread events. Do not edit card files. |
| Technical plan | `docs/alexandria/plans/697-reland-threads-from-ledger/plan.md` | This handoff document for the implementation stage. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Back-of-House workflow | It no longer promises a `threads.json` sidecar. It documents or emits `library.thread_opened` event objects / event receipts for thread findings. | Update workflow prompt examples and retarget `studio/tools/check-threads.mjs`; run plugin validation and the eval action below. |
| Front-of-House workflow | It no longer says AX reads `threads.json` from a bundle. It should describe agenda state as Ledger-thread-event derived. | Update workflow legs and skill text; update AX front-of-house tests that asserted sidecar file paths. |
| Alexandria event-log skill | If it lists event families, include `library.thread_opened` and `library.thread_resolved` and preserve old-spelling alias guidance for existing historical front-of-house events. | Run plugin validation; rerun relevant evals if this product skill changes. |
| AX CLI/internal behavior | Catalog and related internal commands stop consuming `threads.json`. Exit-code behavior for existing commands must remain deterministic. | Add/update black-box tests for CLI commands whose output or diagnostics change. |
| Viewer/PMS UI | No intended interaction change beyond response data source. Notepad receives the same thread shape from the catalog route. | Viewer/PMS tests/builds as validation; no direct file or Ledger reads in UI. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Event schema | `cd packages/ax && bun test tests/events.test.ts` | Proves append/validate schema, parse helpers, malformed concern rejection, `thread_resolved`, and old-spelling alias behavior. |
| Thread projection domain | `cd packages/ax && bun test tests/library-catalog-threads.test.ts` | Proves product-root identity scoping, old `backfill.bundle` tolerance, Builder/non-product negative projection, idempotency, and resolved subtraction. |
| Catalog domain regression | `cd packages/ax && bun test src/domain/library-catalog.test.ts` | Proves derived-thread and fill-readiness behavior remain unchanged after removing sidecar parsing. |
| Runtime HTTP route | `cd packages/ax && bun test tests/runtime-server.test.ts` | Proves `/api/library/catalog` no-param real-root projection, Builder `bundlePath` negative case, and route-level resolved subtraction. |
| Front-of-House/library command fallout | `cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts tests/front-of-house-answer-banking.test.ts tests/library-backfill-cli.test.ts tests/library-confirmation.test.ts tests/library-confirmation-cli.test.ts tests/fixtures.test.ts` | Updates the command and fixture surfaces that currently mention or read `threads.json`; preserves deterministic exit codes and stdout/stderr contracts. |
| AX package checks | `pnpm --filter @alexandria/ax run typecheck && pnpm --filter @alexandria/ax run lint && pnpm --filter @alexandria/ax run format:check` | Full package-level TypeScript, lint, and format validation for the main implementation surface. |
| Viewer checks | `pnpm --filter @alexandria/viewer run check && pnpm --filter @alexandria/viewer run test && pnpm --filter @alexandria/viewer run build && pnpm --filter @alexandria/viewer run test:e2e` | Covers catalog consumer fixtures, unit behavior, build, and browser route behavior. |
| Studio checks | `sh studio/tools/check.sh` | Runs the retargeted `check-threads` guard with the rest of Studio data validation. |
| PMS checks | `pnpm --filter @alexandria/pms run typecheck && pnpm --filter @alexandria/pms run test && pnpm --filter @alexandria/pms-viewer run typecheck && pnpm --filter @alexandria/pms-viewer run test && pnpm --filter @alexandria/pms-viewer run build` | Ensures copied PMS viewer fixtures and Alexandria proxy consumers still pass. |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Required when shipped plugin workflow/skill files change. |
| Reference cleanup | `rg 'threads\\.json' packages studio/tools` | Acceptance guard: no live package or Studio-tool references remain. |
| Repo checks | `pnpm run check && pnpm test` | Full repo validation after targeted fixes. |
| Live route verification | Start `ax start viewer` or the AX runtime server against this checkout, then request `GET /api/library/catalog` with no params and with Builder `bundlePath` params. | Final operator/orchestrator proof against the real library root and real runtime ledger, not only test fixtures. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| AX deterministic catalog/event behavior | Bun domain and route tests are the direct coverage. | Add/adjust deterministic tests; no eval-harness case required for AX-only code. | Commands in Deterministic Verification. |
| Back-of-House and Front-of-House plugin workflows/skills | Product workflow/skill behavior changes from sidecar thread contract to Ledger event contract. `EVALS.md` says skill changes require relevant evals. | Rerun the smallest honest workflow eval set available in this checkout. If the historical live eval harness is still absent, document that and rely on plugin validation plus deterministic workflow/guard tests. | `pnpm eval -- list`, then run relevant `front-of-house-walk` / `back-of-house-walk` / atomic-card workflow evals if listed. |
| Alexandria event-log skill | If edited, it is a product skill. | Rerun the relevant skill eval if the harness lists one; otherwise document no current harness coverage. | `pnpm eval -- list` and the matching case, if present. |
| Viewer/PMS UI | No reusable agent/skill behavior. | No eval-harness run required. | Viewer/PMS deterministic commands above. |
| Maintainer planning skill | Used only to create this plan. | No eval-harness coverage required for contributor workflow use. | None. |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Product events disappear again after the library move because scoping compares event provenance paths to the current root. | Product projection checks the queried root against `resolveDefaultLibraryRoot` / runtime `defaultLibraryRoot`; tests use events whose `backfill.bundle` is the old `docs/alexandria/sweeps/alexandria-product` path. |
| Builder snapshots show product authored threads. | Route code carries a request-source/product-root flag into projection and suppresses product-authored threads for `bundlePath` and explicit non-product roots; add the empty-library bundle route test. |
| Derived missing-material threads regress again. | Do not edit `missingFillSections` or `deriveLibraryCatalogThreads`; take a pre-change derived-thread fixture from current main and assert exact ids/missing sections after the change. |
| The ignored real ledger is missing the three open events, so the live route passes tests but fails operator verification. | Before deleting the sidecar in implementation, verify or append the three `library.thread_opened` events through AX using stable idempotency keys. Record the local verification command/output in the PR. Do not commit ignored ledger state. |
| `sourceStatus` or `sourceResolution` from the old sidecar is mistaken for current state, causing the three required authored threads to be hidden. | Treat those fields as provenance only; only `library.thread_resolved` closes an authored thread. Add an explicit test with `sourceStatus: "answered"` and no `thread_resolved` event. |
| Removing `threads.json` breaks Front-of-House agenda preparation. | Replace sidecar reads with a Ledger event projection covered by existing front-of-house black-box tests, while keeping product catalog Builder reads authored-thread-free. If the required scoping data is absent from the event payload, stop and add a narrow event-contract decision rather than reusing `backfill.bundle` as a product filter. |
| Event parser compatibility becomes too strict for historical ledgers. | Use strict schemas for append mode, but preserve replay compatibility where historical events exist. Add tests for real old-spelling `library.front_of_house.*` aliases. |
| `rg 'threads\\.json' packages studio/tools` passes by deleting useful guard coverage. | Retarget `check-threads` to event fixtures and embedded event examples; require the guard to fail when no event contract examples exist. |
| Plugin copy drifts from deterministic AX behavior. | Update plugin workflow/skill text in the same slice and validate with `claude plugin validate`; run evals if the harness exposes relevant cases. |

## Implementation Steps

1. Before editing implementation files, capture the current derived-thread
   baseline from main for the real product library:
   - run the catalog loader or HTTP route with no authored Ledger thread events;
   - store the exact derived thread ids and relevant payload fields
     (`kind`, `family`, `missingSections`, concern ids) in a test fixture;
   - confirm the issue's expected total math: current derived count plus the
     three authored Ledger threads should equal 25 today. If it does not,
     pause and investigate before changing code.
2. Verify the real local Ledger state:
   - check whether `docs/alexandria/ledger/events.jsonl` exists in the working
     tree's operational state;
   - if the three required `library.thread_opened` events are absent, append
     them through AX before deleting `docs/alexandria/library/threads.json`;
   - use stable idempotency keys such as
     `library-thread-opened:<threadId>:slice-4b`;
   - keep `backfill.bundle` as provenance, and include at least one test event
     using the old pre-move path.
3. In `state-events.ts`, complete the thread event vocabulary:
   - add `library.thread_resolved` to `ALEXANDRIA_STATE_EVENT_TYPES`;
   - restore/export `LibraryThreadConcernPayload`,
     `LibraryThreadOpenedPayload`, and `LibraryThreadResolvedPayload`;
   - export `parseLibraryThreadOpened` and `parseLibraryThreadResolved`;
   - add append schema-document entries and payload validation;
   - keep existing old-spelling aliases for real historical front-of-house
     event types.
4. Add or restore `library-thread-events.ts` for authored-thread replay:
   - inputs include events, project root, requested/resolved catalog root,
     config-resolved product root, and request source (`default`, explicit
     product root, explicit non-product root, or Builder bundle);
   - include events only for product-root requests;
   - ignore `payload.backfill.bundle` for product-root inclusion;
   - normalize `kind` for stable display, copy concern/source arrays, and set
     `source: "authored"`, `status: "open"`;
   - first `thread_opened` wins on duplicate `threadId`;
   - `thread_resolved` closes the open authored thread by removing it from the
     open projection; keep resolution parse helpers available for future audit
     surfaces if needed.
5. Update `library-graph-loader.ts`:
   - remove imports and reads for `LIBRARY_CATALOG_THREADS_FILE` and
     `parseLibraryCatalogThreads`;
   - compute whether the current catalog request is the product library root;
   - call the Ledger authored-thread projection with the request source;
   - pass those authored threads into `buildLibraryCatalog`.
6. Update `library-catalog.ts` without touching derived logic:
   - remove sidecar constants and parser exports only after callers/tests move;
   - preserve `LibraryCatalogThread` and related types;
   - keep `missingFillSections`, `CANONICAL_FILL_SECTIONS`,
     `deriveLibraryCatalogThreads`, and fill-readiness logic unchanged;
   - merge derived threads and authored threads with existing deterministic
     sorting/deduping behavior.
7. Add route-level runtime tests in `runtime-server.test.ts`:
   - temp project uses real or fixture-copied `docs/alexandria/library` and a
     seeded Ledger with the three product thread events;
   - no-param `GET /api/library/catalog` returns the three authored ids and
     the exact derived baseline;
   - explicit `?libraryRoot=docs/alexandria/library` behaves like product root;
   - `?bundlePath=<empty-library bundle fixture>` returns zero authored
     product threads;
   - appending `library.thread_resolved` for one id removes it from the open
     authored set through the HTTP route.
8. Update domain tests:
   - product-root projection tolerates old `backfill.bundle`;
   - non-product root and Builder request source return no product authored
     threads;
   - duplicate opens are idempotent;
   - `sourceStatus: "answered"` without `thread_resolved` remains open;
   - old-spelling front-of-house answer/patch/residual aliases still project
     the same as flat names where those events are used by resolution code;
   - derived-thread fixture matches exactly.
9. Retire `threads.json` inputs from AX command code:
   - remove `collectThreads` / sidecar backfill from `library.ts` or replace it
     with event-fixture/backfill behavior that does not read `threads.json`;
   - update help text from "threads.json" to Ledger thread events;
   - remove sidecar reads from `front-of-house.ts`; if agenda preparation needs
     unresolved authored threads, source them from the thread event projection
     and cover with CLI tests;
   - preserve CLI exit-code and stdout/stderr stability.
10. Rewrite AX tests and fixtures that mention `threads.json`:
    - replace sidecar fixtures with `thread-events.jsonl` event fixtures;
    - delete parse tests for `library-threads.v1`;
    - update confirmation/front-of-house tests to assert Ledger-derived behavior
      and no sidecar file reads;
    - update `fixtures.test.ts` expectations.
11. Retarget Studio `check-threads`:
    - import `validateAlexandriaStateEvent`, `parseLibraryThreadOpened`, and
      `parseLibraryThreadResolved`;
    - extract embedded event JSON blocks from play briefs;
    - read committed `thread-events.jsonl` fixtures instead of `threads.json`;
    - require at least one event contract example;
    - update guard tests and fixtures for good open, good resolved, malformed
      concern, and bad schema/version cases.
12. Update plugin workflows and skills:
    - Back-of-House prompt examples emit `library.thread_opened` events or
      receipts instead of a sidecar file;
    - Front-of-House skill/legs say AX prepares agendas from Ledger thread
      events;
    - event-log skill lists `library.thread_opened` and
      `library.thread_resolved` if it is the shipped event vocabulary index;
    - keep wording generic and avoid Alexandria-product-specific examples in
      reusable plugin guidance.
13. Update Viewer/PMS sample fixtures and any copied Notepad fixture prose so
    no package reference points at `threads.json`.
14. Delete `docs/alexandria/library/threads.json` after the real local Ledger
    open events are verified/seeded.
15. Run `rg 'threads\\.json' packages studio/tools` and remove any remaining
    live references. If a historical archive needs to keep the string, it must
    live outside the acceptance search paths.
16. Run the targeted and full deterministic verification matrix above. If the
    eval harness exposes relevant plugin workflow cases, run them; otherwise
    document the harness limitation and plugin validation result.
17. Perform the live route verification against the real checkout:
    - no-param `/api/library/catalog` returns the three authored thread ids and
      the exact derived baseline;
    - Builder `bundlePath` route returns zero authored threads;
    - appending a `library.thread_resolved` event through AX removes one thread
      from the open authored set.

## Acceptance / Exit Criteria

1. `GET /api/library/catalog` with no params, against the real repository and
   real product library root, returns the three authored Ledger thread ids
   named in the issue and the unchanged derived-thread set. The expected total
   today is 25 per the issue.
2. The same HTTP route with a Builder `bundlePath` pointing at the
   empty-library bundle fixture returns zero product-authored threads.
3. Appending `library.thread_resolved` for one authored thread removes it from
   the open authored set on the HTTP route.
4. Duplicate `library.thread_opened` events for the same `threadId` produce one
   authored thread.
5. `sourceStatus`, `sourceResolution`, and `sourceResolvingEventId` on an open
   backfill event do not close the thread.
6. Existing old-spelling `library.front_of_house.*` events project identically
   to their flat aliases where those historical aliases exist.
7. The derived-thread fixture for the real library is byte-identical before and
   after this change.
8. `docs/alexandria/library/threads.json` is deleted, and no implementation
   code reads a replacement sidecar for Notepad authored threads.
9. `rg 'threads\\.json' packages studio/tools` returns no live references.
10. `studio/tools/check-threads.mjs` validates thread event fixtures and
    embedded workflow examples through AX's shipped event parser.
11. Plugin workflow/skill guidance no longer instructs plays to emit or read
    `threads.json`.
12. The targeted AX, Viewer, Studio, PMS, plugin validation, and full repo check
    commands listed in Deterministic Verification pass, or any unavailable eval
    harness limitation is explicitly documented with the deterministic coverage
    that replaced it.

## Deferred Follow-Ups

1. Slice 4c: taxonomy/gaps dissolution remains separate.
2. Slice 4d: `library.json` and draft patch concept retirement remains
   separate.
3. Slice 4e: product-card v2 frontmatter cleanup remains separate.
4. A future audit surface may show resolved authored thread history, including
   `thread_resolved` reason/ruling metadata. This slice only needs the open
   Notepad projection.
5. If Front-of-House needs richer per-play or per-bundle thread scoping after
   `threads.json` disappears, add an explicit event-contract field in a
   follow-up rather than overloading `backfill.bundle` as a state filter for the
   product catalog.
