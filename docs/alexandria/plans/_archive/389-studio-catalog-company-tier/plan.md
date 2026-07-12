# Issue 389 Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#389`
- Goal: surface the Studio Catalog Company tier so the visible spine reads
  `Company -> Division -> Function -> Play`, with `Alexandria_Prime` rendered
  once above the existing Division sections.
- Run id: `01KVXAGAFZR33PY73ARQXPN52N`
- Lane: L2 from `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`
  (`parallel-safe`, small).
- Linked product plans and rulings:
  - `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`
  - `docs/alexandria/plans/studio-fixes/org-model.md`
  - Prior catalog foundation:
    `docs/alexandria/plans/366-studio-catalog-viewer/plan.md`
- GitHub issue comments checked: one comment, recording the Fabro local run URL
  already present in the prompt; no extra technical feedback.

## Goal

Add the missing Company tier to the Studio registry payload and Catalog render.
The current registry source already declares `COMPANY = 'Alexandria_Prime'`;
this slice exposes that value as a name-only top-level `company` object and
renders a single quiet Company header above all Division sections.

## Scope

- Extend `GET /api/studio/registry` to include:

  ```json
  "company": { "name": "Alexandria_Prime" }
  ```

- Source the value from `studio/plays/registry.js`'s `COMPANY` constant.
- Keep `company` top-level, sibling to `board`, `divisions`, and `rungs`.
- Keep the payload shape name-only. Do not add `face`, ownership, metadata, or
  persistence.
- Extend the viewer Studio registry schema so the proper company payload
  decodes and missing or blank company data does not make the Catalog unusable.
- Render one Company header in `CatalogTab` above the existing Division sections
  when the decoded company name is non-empty.
- Leave Division, Function, and Play grouping, ordering, links, warning markers,
  and empty-function rows unchanged.
- Add focused deterministic coverage for the API payload, viewer schema/decode
  path, Catalog header placement, unchanged nested Catalog behavior, and
  missing-company degradation.

## Non-Goals

- Do not change `studio/plays/registry.js` data beyond reading the existing
  `COMPANY` constant.
- Do not add a Company face agent. The org model says Company has no face agent.
- Do not add Company persistence, config, multi-company support, tenant
  selection, spin-out mechanics, or origin-model behavior.
- Do not change Division, Function, Play, Board, rung, run-tracker, ledger, or
  play-overview behavior.
- Do not re-file plays or modify the `DIVISIONS` or `RUNGS` contents.
- Do not add explanatory product copy such as data-model rationale, validation
  status, breadcrumbs, or admin banner text.
- Do not change plugin payloads, product skills, agents, or eval harness cases.
- Do not write to `docs/alexandria/library/`.

## Linked Product-Plan Summary

`org-model.md` rules the Studio filing spine as
`Company -> Division -> Function -> Play`. There is one Company for this repo
instance: `Alexandria_Prime`. Product is a Division fronted by Raven, and
PlaymakerStudio is a Division fronted by William. Functions are declared per
Division, and plays file under Company, then Division, then Function.

The phase-2 build plan's L2 lane identifies the current product gap: the
Catalog renders Division headers directly and `/api/studio/registry` omits
`company`, so the Company root is invisible even though the registry data
declares it.

The prior #366 Catalog plan and implementation already established the
Division -> Function -> Play surface and the `/api/studio/registry` transport.
Issue #389 is a narrow continuation of that contract, not a new Catalog model.

## Current Implementation Gap

- `studio/plays/registry.js` defines `const COMPANY='Alexandria_Prime'` and
  exports it through `module.exports`.
- `packages/ax/src/effects/studio-api.ts` has `parseRegistry()` evaluate
  `registry.js` and return only `{ divisions, rungs }`; `COMPANY` is not
  projected.
- `registryResponse()` returns `{ board, divisions, rungs }` and decorates rungs
  with ledger-derived `builtBy` data. It does not include `company`.
- `packages/viewer/src/app/runtime/studio.ts` defines `StudioRegistrySchema`
  with `board`, optional `divisions`, and `rungs`, but no `company` field.
- `packages/viewer/src/components/studio/CatalogTab.tsx` renders the Catalog
  from decoded registry data as Division sections at the top level.
- Existing Playwright coverage in `packages/viewer/tests/library-browser.spec.ts`
  checks Division, Function, Play, misfiled-row, retired-field, and negative
  copy behavior, but has no Company assertions.

## Architectural Boundaries

- `studio/plays/registry.js` remains the source of truth for `COMPANY`,
  `DIVISIONS`, and `RUNGS`.
- `packages/ax` is the API boundary. It may evaluate `registry.js` and project
  plain JSON, but must not define a second hardcoded Company value.
- `packages/viewer/src/app/runtime/studio.ts` remains the browser decode
  boundary. Keep the schema narrow and tolerant: model only a company name and
  allow absent or empty company data to flow to the UI as an omitted header
  rather than a broken Studio state.
- `CatalogTab` should stay a pure render/grouping component. Do not add fetches,
  registry evaluation, or board-derived logic there.
- Catalog grouping remains Division-driven beneath the Company header. The
  Company tier is a visual/root tier, not a new grouping pass over plays.
- The viewer must not import `studio/plays/registry.js` directly.
- The Catalog must not filter by Board stage, `appearsOnBoard()`, `prio`, or
  provenance. It should continue rendering every registry rung it already
  rendered before this slice.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Studio registry API | `packages/ax/src/effects/studio-api.ts` | `parseRegistry()` projects `COMPANY` into a name-only company object; `registryResponse()` returns `company` with existing `board`, `divisions`, and decorated `rungs` unchanged |
| Studio API tests | `packages/ax/tests/studio-api.test.ts` | Registry endpoint tests assert `company` equals `{ name: "Alexandria_Prime" }`; legacy/missing-`COMPANY` tolerance keeps divisions and rungs working |
| Viewer runtime schema | `packages/viewer/src/app/runtime/studio.ts` | Add a narrow `company` field to `StudioRegistrySchema`; tolerate missing or empty company data while accepting the proper `{ name }` contract |
| Viewer Catalog UI | `packages/viewer/src/components/studio/CatalogTab.tsx` | Render one Company header above Division sections when `registry.company.name.trim()` is non-empty; keep Division/Function/Play rendering unchanged |
| Viewer browser fixture | `packages/viewer/tests/serve-viewer-fixture.ts` | Add `company: { name: "Alexandria_Prime" }` to the normal registry fixture and add a fixture mode for missing or empty company data |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Assert one Company header, DOM/visual order before divisions, unchanged division/function/play behavior, and graceful missing-company rendering |

## Affected Behavior Surfaces

| Surface | Files likely to change | Behavior that changes | Tests / docs / evals that move with it |
| --- | --- | --- | --- |
| AX Studio HTTP API | `packages/ax/src/effects/studio-api.ts`, `packages/ax/tests/studio-api.test.ts` | `/api/studio/registry` includes top-level `company` when `COMPANY` exists | Add/extend Bun API tests for payload shape and legacy tolerance |
| Viewer Studio runtime | `packages/viewer/src/app/runtime/studio.ts` | Decoded `StudioRegistry` carries optional Company data | Covered by browser fixture decode and, if implemented as a focused unit, direct schema decode coverage |
| Viewer Catalog product surface | `packages/viewer/src/components/studio/CatalogTab.tsx`, `packages/viewer/tests/serve-viewer-fixture.ts`, `packages/viewer/tests/library-browser.spec.ts` | `/studio?tab=catalog` shows `Alexandria_Prime` once above all divisions | Extend Playwright Catalog spec |
| CLI commands | None expected | `ax start viewer` serves an enriched HTTP payload, but command syntax, stdout/stderr, and exit codes do not change | No CLI black-box command test required beyond existing API/unit coverage |
| Product agents and skills | None | No reusable agent or product skill behavior changes | No eval-harness rerun required |

## Implementation Steps

1. In `packages/ax/src/effects/studio-api.ts`, extend
   `ParsedStudioRegistry` with a `company` field.
2. Update `parseRegistry()` so the evaluated factory returns `company` from
   `COMPANY` when present. Preserve the existing tolerance for older registry
   files by not throwing solely because `COMPANY` is absent.
3. Shape the API projection as name-only: `{ name: COMPANY }` for a non-empty
   string value. Do not pass through other registry globals or add fallback
   metadata.
4. Update `registryResponse()` to include `company` in the top-level JSON
   response while leaving `board`, `divisions`, and
   `decorateRungsWithBuiltBy()` behavior unchanged.
5. Extend `packages/ax/tests/studio-api.test.ts`:
   - Add `const COMPANY = "Alexandria_Prime";` to the normal registry fixture.
   - Assert the response body has `company` exactly equal to
     `{ name: "Alexandria_Prime" }`.
   - Keep the existing board, division, rung, and built-by assertions.
   - Extend or add a legacy fixture without `COMPANY` to assert the endpoint
     still returns `200` with divisions and rungs.
6. In `packages/viewer/src/app/runtime/studio.ts`, add a narrow Company schema
   and optional `company` field to `StudioRegistrySchema`. Model only `name`;
   handle missing, null, empty object, or blank-name data as degraded input that
   can render without a Company header.
7. In `CatalogTab.tsx`, derive `companyName` from
   `props.registry.company?.name?.trim()` and render the Company header only
   when the derived name is non-empty.
8. Style the Company header from the existing Division header treatment:
   quiet, top of Catalog, not a banner, not a breadcrumb, no face label, and no
   explanatory copy. Add a stable test id such as `studio-catalog-company`.
9. Keep the existing `buildCatalog()` function and Division/Function/Play JSX
   behavior unchanged except for being nested after the optional Company header.
10. Update the viewer registry fixture with `company:
    { name: "Alexandria_Prime" }`. Add a fixture mode such as `no-company` or
    `empty-company` for degraded-state coverage.
11. Extend the Playwright Catalog test:
    - Assert `Alexandria_Prime` appears exactly once.
    - Assert the Company header appears before Product and PlaymakerStudio.
    - Preserve existing assertions for Product/Raven, PlaymakerStudio/William,
      function order, play links, empty functions, misfiled marker, and negative
      copy.
    - Add a missing-company case that still renders divisions and does not show
      a Company header or Studio-unavailable state.
12. Run the deterministic validation matrix below.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX Studio API focused test | `cd packages/ax && bun test tests/studio-api.test.ts` | Verifies `/api/studio/registry` includes `company`, preserves board/divisions/rungs, and tolerates legacy missing `COMPANY` |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches TypeScript contract drift in the API change |
| Viewer type/schema check | `pnpm --filter @alexandria/viewer run check` | Verifies Astro/TypeScript and the updated Studio registry type |
| Viewer unit suite | `pnpm --filter @alexandria/viewer run test` | Runs existing Studio/viewer unit coverage after schema changes |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Confirms the shipped static viewer still compiles |
| Viewer browser suite | `pnpm --filter @alexandria/viewer run test:e2e` | Exercises `/studio?tab=catalog` header placement, unchanged nested rendering, and degraded-state fixture |
| Studio catalog source contract | `node studio/tools/check-catalog.mjs` | Confirms the underlying registry data still satisfies the org-model catalog rules |
| Product smoke | `ax start viewer`, then open `http://127.0.0.1:4321/studio?tab=catalog` | Manual confirmation on the shipped viewer surface |
| API smoke | `curl -s http://127.0.0.1:4321/api/studio/registry` | Confirm real runtime response has `company.name == "Alexandria_Prime"` |

No new CLI command syntax or exit-code behavior is introduced. The API-focused
Bun test is the black-box check for the changed local HTTP behavior.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX Studio registry API | Covered by deterministic Bun tests, not eval harness | No LLM eval rerun | Extend `packages/ax/tests/studio-api.test.ts` |
| Viewer `/studio` Catalog | Covered by Playwright browser tests and viewer build/check, not eval harness | No LLM eval rerun | Extend `packages/viewer/tests/library-browser.spec.ts` |
| Product agents and skills | Not touched | No eval rerun | N/A |
| Maintainer technical-planning skill | Used to produce this plan but not modified | No eval rerun | N/A |

This slice changes product UI and a deterministic local API shape. It does not
change reusable agent, skill, prompt, workflow, or eval-backed behavior, so
eval-harness coverage is not required.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| `Alexandria_Prime` gets hardcoded in the viewer and drifts from `registry.js` | Source the payload from `COMPANY` in `studio-api.ts`; render only decoded API data in `CatalogTab` |
| The Company tier becomes a banner, breadcrumb, or explanatory product-copy block | Use the existing Division header treatment and render only the company name |
| Adding `company` makes older or malformed registry payloads decode as a full Studio failure | Keep the viewer schema tolerant and add missing/empty-company browser coverage |
| Division/Function/Play rendering changes while adding a wrapper/header | Keep `buildCatalog()` and existing mapped sections intact; preserve the current Playwright assertions for division/function order, links, and warnings |
| API projection accidentally adds fields beyond the ruled name-only contract | API test asserts exact company object; implementation maps only `COMPANY` to `{ name }` |
| Built-by decoration or board passthrough regresses during the API edit | Keep existing `studio-api.test.ts` assertions for board payload and built-by decorated rungs |

## Acceptance And Exit Criteria

- `GET /api/studio/registry` returns a top-level `company` object exactly equal
  to `{ "name": "Alexandria_Prime" }` for the real current registry.
- The viewer registry schema accepts the `company` payload and does not fail the
  Studio Catalog when `company` is missing or empty.
- The Catalog renders exactly one Company header showing `Alexandria_Prime`.
- The Company header appears above all Division sections.
- Product and PlaymakerStudio Division headers still render once each, in the
  same order as before.
- Existing Function groups, empty-function rows, Play rows, Play links, misfiled
  warnings, and retired-field immunity behave as before.
- When `company` is absent or empty, the Catalog omits the Company header and
  still renders Division sections without showing the Studio-unavailable state.
- The deterministic validation matrix passes, or any skipped command is recorded
  with a concrete blocker.

## Deferred Follow-Ups

- Multi-company support, tenant switching, and spin-out mechanics remain
  deferred behind the org-model boundary.
- Company metadata beyond name, including a face agent, remains out of scope
  unless the org model is explicitly revised.
- Deeper Catalog content, play-overview copy, and make-a-play maturity work
  remain held by the phase-2 plan's later lanes.
- Board, Ledger, F7 StepRail, run-bridge scoping, and viewer error-state lanes
  remain separate phase-2 work.
