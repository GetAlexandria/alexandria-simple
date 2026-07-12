# Issue 445 Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#445`
- Goal: add the app-side contract, catalog projection, validation, strict client
  decode, and Viewer lens for `workflows.json` as the library's first-class
  work-thread surface.
- Linked product plan: the issue describes this as Move C of "Capture the Work".
  The referenced `docs/alexandria/plans/capture-the-work/` files are not present
  in this checkout, so the supplied issue body is the product contract for this
  slice. GitHub comments only add the Fabro local run link
  `01KW7PPEWFJW4WZQKRESGJQT18`.

## Scope

- Add a top-level product-card library file contract:
  `workflows.json` with `schemaVersion: "library-workflows.v1"`.
- Parse valid workflow files into `catalog.workflows` for product-card roots,
  sorted by workflow `id`, with each workflow's `steps` sorted by numeric
  `order`.
- Convert malformed workflow files into catalog `metadataIssues` without failing
  catalog load.
- Validate workflow coverage during catalog assembly: unknown step contexts and
  unresolved `cardRefs` become `metadataIssues` and are not silently dropped.
- Extend the Viewer runtime schema and component types so strict
  `errors: "all"` decode accepts optional `catalog.workflows` while catalogs
  without it still decode.
- Add a new schema-aware library sub-view labelled `Workflow`, rendered only
  when `catalog.workflows` is non-empty.
- Render the workflow diagonal: contexts as columns in first-appearance order,
  ordered steps as rows, nodes at each step/context intersection, a connecting
  SVG polyline, gate rings, and card-ref click-through to the existing catalog
  card selection affordance.
- Add deterministic AX parser/loader tests, Viewer runtime decode tests, Viewer
  browser tests, and back-compat coverage for no-`workflows.json` libraries.

## Non-Goals

- Do not build the sweep or producer that emits `workflows.json`; that is Move S.
- Do not add temporal link keys such as `hands_off_to` or `precedes`.
- Do not change the per-card `LibraryCatalogDiagram` union, typed-link keys,
  story rendering, thread schema, gaps schema, or fill-readiness derivation.
- Do not hand-edit `studio/sweeps/playmaker-studio/` or write to
  `docs/alexandria/library/`.
- Do not change Alexandria plugin, agent, skill, or Fabro workflow behavior.
- Do not introduce a second product surface; the Viewer remains the shipped
  Alexandria surface.

## Current Gap

- `packages/ax/src/domain/library-catalog.ts` defines `threads.json` constants,
  types, parser, reference validation, and product-card-only catalog assembly,
  but there is no workflow file contract or `catalog.workflows` field.
- `packages/ax/src/effects/library-graph-loader.ts` reads `threads.json` only
  for `product-card.v1` library roots. It does not look for `workflows.json`.
- `packages/viewer/src/app/runtime/schemas.ts` strictly decodes catalog payloads
  and currently rejects any emitted `workflows` field unless the schema is
  extended.
- `packages/viewer/src/components/library/EmptyLibraryView.tsx` has schema-aware
  `Index`, `Fill readiness`, and `Catalog` tabs, and legacy tabs, but no workflow
  lens.
- PMS-Back (`/library/pms-back`, fixed root `studio/sweeps/playmaker-studio/`)
  is a product-card root with no `workflows.json`; it must continue to render
  through the current read-only empty-library surface with no new tab or markup.

## Architectural Boundaries

- AX owns the catalog contract. Define workflow domain types, parser, sort order,
  product-card root gating, and reference validation in the catalog domain and
  loader, mirroring the existing threads pattern.
- The loader should read `workflows.json` only when
  `catalogSchema === PRODUCT_CARD_SCHEMA_VERSION`. Legacy roots ignore the file
  and keep their current catalog shape.
- Treat absent, invalid, and empty workflow data as an empty optional surface.
  The catalog should omit `workflows` when there are no valid workflows; Viewer
  code should read `catalog.workflows ?? []`.
- Workflow parser errors are data-quality issues, not operational failures.
  Bad JSON, wrong schema version, non-array `workflows`, duplicate workflow ids,
  malformed workflows, or malformed steps should return `metadataIssues` and the
  valid subset, following `parseLibraryCatalogThreads`.
- Catalog assembly validates references after cards and areas are built, because
  card and context resolution depends on the full catalog. Validation reports
  issues but keeps the workflow rows visible.
- Viewer runtime schemas stay narrow and browser-facing. Do not copy broad AX
  internals into the Viewer beyond the workflow response shape.
- Viewer visual code stays in pure React components. Effect remains only in
  `src/app/runtime/*` decode/fetch boundaries.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/445-library-workflow-lens/plan.md` | Captures the repo-specific implementation plan for issue `#445` |
| AX catalog domain | `packages/ax/src/domain/library-catalog.ts` | Adds workflow constants, types, parser, sorted optional `catalog.workflows`, and metadata validation for workflow contexts/card refs |
| AX catalog loader | `packages/ax/src/effects/library-graph-loader.ts` | Reads `workflows.json` beside `threads.json` for `product-card.v1` roots only and passes parsed workflows/issues into catalog assembly |
| AX tests | `packages/ax/src/domain/library-catalog.test.ts`, `packages/ax/tests/runtime-server.test.ts` and/or `packages/ax/tests/viewer.test.ts` | Covers parse failures, sorting, reference validation, loader gating, and no-file back-compat through the runtime catalog path |
| Viewer runtime schema | `packages/viewer/src/app/runtime/schemas.ts`, `packages/viewer/src/app/runtime/client.test.ts` | Strict catalog decode accepts optional workflows and still accepts catalogs without workflows |
| Viewer library types | `packages/viewer/src/components/library/types.ts` | Re-exports workflow types from runtime schemas for visual components |
| Viewer sample fixtures | `packages/viewer/src/components/library/sample-catalog.ts`, `packages/viewer/tests/serve-viewer-fixture.ts` | Adds a workflow catalog fixture for browser tests without requiring a sweep producer |
| Viewer library surface | `packages/viewer/src/components/library/EmptyLibraryView.tsx` | Adds the conditional `Workflow` tab and diagonal renderer with card click-through |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Covers tab visibility, columns, rows, polyline, recurring context revisit, gate ring, cardRef click-through, and no-workflow back-compat |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| AX runtime catalog API | Catalog payloads may include optional `workflows` for schema-aware product-card roots | Keep AX domain tests, runtime API tests, and Viewer strict decode aligned |
| Viewer library surface | Schema-aware libraries with workflows gain a new `Workflow` sub-view | Add browser coverage and fixture data; no plugin/eval prompt updates |

## Implementation Details

1. Add AX contract types:
   `LibraryCatalogWorkflow` and `LibraryCatalogWorkflowStep`.
2. Add constants:
   `LIBRARY_CATALOG_WORKFLOWS_FILE = "workflows.json"` and
   `LIBRARY_CATALOG_WORKFLOWS_SCHEMA_VERSION = "library-workflows.v1"`.
3. Implement `parseLibraryCatalogWorkflows(content)` using the
   `parseLibraryCatalogThreads` shape:
   - JSON parse failures produce
     `Invalid workflows.json: <message>`.
   - Non-object roots produce `Invalid workflows.json: expected object`.
   - Wrong `schemaVersion` produces a metadata issue and zero workflows.
   - `workflows` must be an array when present.
   - A workflow requires non-empty `id`, non-empty `unit`, and `steps` array.
   - A step requires numeric `order`, non-empty `activity`, and non-empty
     `context`.
   - Optional step fields are `doer`, `stateBefore`, `stateAfter`, `gate`,
     `cardRefs`, and `evidence`; malformed optional fields should reject that
     step/workflow with a metadata issue rather than coerce silently.
   - Duplicate workflow ids should be reported and the first workflow kept.
   - Workflows sort by `id`; steps sort by `order` with original index as the
     deterministic tie-breaker.
4. Extend `buildLibraryCatalog` input with `workflows?: LibraryCatalogWorkflow[]`.
   For product-card schema mode, validate each workflow step after areas/cards
   are known:
   - A step `context` must match at least one catalog area `context`.
   - Each `cardRef` must resolve through `createCatalogCardResolver(cards)`.
   - Validation emits `Invalid workflows.json: workflow "<id>" step <order> ...`
     metadata issues and does not remove the step.
5. Return `workflows` only when the valid workflow list is non-empty. Existing
   catalog consumers should continue to treat missing and empty as the same
   state.
6. In `loadLibraryCatalogRoot`, read `workflows.json` under the same
   `product-card.v1` gate as `threads.json`, parse it, and merge workflow
   metadata issues with extras/thread issues.
7. In Viewer schemas, add `LibraryCatalogWorkflowStepSchema`,
   `LibraryCatalogWorkflowSchema`, exported types, and optional
   `workflows: Schema.Array(...)` on `LibraryCatalogSchema`.
8. In `EmptyLibraryView`, add a `workflow` tab id only when
   `catalog.workflows?.length > 0` and `fillReadiness` is present. Keep legacy
   tab generation unchanged.
9. Add `WorkflowLensView` and small pure helpers:
   - Sort/render steps by server order defensively.
   - Derive context columns by first appearance in ordered steps.
   - Build a card resolver index using existing catalog cards.
   - Use a horizontally scrollable matrix with stable row/column dimensions and
     an SVG overlay. Coordinates should be deterministic:
     `x = leftGutter + columnIndex * columnWidth + columnWidth / 2`,
     `y = headerHeight + rowIndex * rowHeight + rowHeight / 2`.
   - Draw one `<polyline>` per workflow through all node points. Repeated
     contexts naturally reuse the same column x-coordinate on later rows.
   - Render gate steps with a visible ring marker.
   - Make the node or first resolved card-ref chip a button that calls a shared
     `selectCardInCatalog(card)` helper, switching to the `Catalog` tab and
     opening the selected card through the existing affordance.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX catalog parser/domain | `pnpm --filter @alexandria/ax exec bun test src/domain/library-catalog.test.ts` | Covers valid parse, wrong schema, malformed step, sorting, duplicate ids, product-card assembly, context/cardRef validation |
| AX runtime catalog path | `pnpm --filter @alexandria/ax exec bun test tests/runtime-server.test.ts tests/viewer.test.ts` | Confirms loader/API behavior for real catalog roots, no-file back-compat, and metadata issue surfacing |
| Viewer strict decode | `pnpm --filter @alexandria/viewer exec bun test src/app/runtime/client.test.ts` | Proves strict `errors: "all"` decode accepts catalogs with and without optional workflows |
| Viewer browser behavior | `pnpm --filter @alexandria/viewer exec playwright test tests/library-browser.spec.ts` | Covers Workflow tab rendering, columns, rows, polyline, recurring-context revisit, gate ring, card click-through, and no-workflow absence |
| Viewer static/build validation | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Required Viewer validation for schema/component changes |
| AX type/lint validation | `pnpm --filter @alexandria/ax run typecheck` and `pnpm --filter @alexandria/ax run lint` | Validates TypeScript and lint for touched AX files |
| Repo-level guard | `pnpm run check` | Final formatting, lint, typecheck, markdown, and shell guard after targeted tests |

## Test Matrix

| Requirement | Planned coverage |
|-------------|------------------|
| Valid `workflows.json` loads | AX domain test and runtime loader/API test with product-card manifest |
| Wrong schema version | AX parser test asserts metadata issue and no workflows |
| Malformed JSON / malformed step | AX parser tests assert metadata issue and no valid workflow for the malformed entry |
| Workflow sort by `id` / steps by `order` | AX parser/domain test |
| Unknown context metadata issue | AX build test with a workflow step whose context is absent from catalog areas |
| Unresolved `cardRef` metadata issue | AX build test using an unknown card reference |
| Strict client decode with workflows | Viewer runtime client test adds workflows to `catalogPayload` |
| Strict client decode without workflows | Existing back-compat test extends assertion to `workflows` undefined |
| Workflow tab appears only when non-empty | Viewer browser fixture mode with workflows; no-workflow fixture and PMS-Back route assert no `Workflow` button |
| Columns in first-appearance order | Browser test reads workflow column headers |
| Rows by step order | Browser test reads row labels/order |
| Polyline through nodes | Browser test asserts workflow polyline exists with expected point count |
| Recurring context revisit visible | Browser test uses two steps with the same context and asserts nodes share the same x-position on different rows, with the polyline returning to that column |
| Gate ring | Browser test asserts gate node marker/ring for `gate: true` |
| CardRef click-through | Browser test clicks a resolvable card ref and asserts the Catalog tab opens the referenced card |
| Existing sub-views unchanged | Existing Index / Fill readiness / Catalog browser tests continue to pass |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| AX catalog/runtime API | Deterministic unit and runtime tests cover catalog contracts | Add deterministic tests; no eval rerun | N/A |
| Viewer library surface | Playwright/browser fixtures cover shipped UI behavior | Add workflow fixture and browser tests; no eval rerun | N/A |
| Product agents / skills / plugin workflows | Not touched | No eval-harness coverage required | N/A |

This slice changes deterministic application behavior, not reusable agent or
skill behavior. `EVALS.md` does not require a `pnpm eval` rerun unless product
skills, agents, plugin workflows, or the eval harness change.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| AX emits `workflows` before Viewer strict decode knows the shape, causing catalog fetch failures | Land Viewer schema additions in the same slice before or with AX emission, and add strict decode tests with workflows |
| Parser behavior drifts from the frozen issue contract | Keep constants, parser tests, and schema field names literal: `workflows.json`, `library-workflows.v1`, `order`, `activity`, `context`, `doer`, `stateBefore`, `stateAfter`, `gate`, `cardRefs`, `evidence` |
| Workflow validation becomes too destructive and hides useful work-thread data | Report unknown contexts/cardRefs as metadata issues but keep valid parsed workflow rows visible |
| Context matching is ambiguous across planes because workflow steps name only `context` | Validate only zero matches as an issue; allow one or more matching areas because the contract intentionally uses context as the place/column |
| CardRef click-through resolves differently in AX and Viewer | Reuse the existing resolver style in both places: AX validates with `createCatalogCardResolver`; Viewer resolves against catalog cards by id/prefLabel/type-prefixed labels like existing story links |
| The Workflow tab appears for no-file libraries and changes PMS-Back | Omit `catalog.workflows` when empty and build the tab list only from non-empty workflows; add a PMS-Back/no-workflow browser assertion |
| SVG/polyline geometry breaks on narrow screens or overlapping text | Use fixed row/column dimensions inside a horizontal overflow container, stable left gutter, and browser tests including overflow checks |
| The workflow lens accidentally changes Index / Fill readiness / Catalog behavior | Keep workflow rendering in a new branch, reuse existing card-selection helper, and run the existing browser tests for all current sub-views |

## Implementation Steps

1. Add this issue-specific plan under
   `docs/alexandria/plans/445-library-workflow-lens/plan.md`.
2. Add AX workflow constants, types, parser helpers, and export
   `parseLibraryCatalogWorkflows`.
3. Extend AX catalog assembly to accept parsed workflows, sort/omit them as
   described, and emit metadata issues for unknown contexts and unresolved
   cardRefs.
4. Extend `loadLibraryCatalogRoot` to read `workflows.json` beside
   `threads.json` under the existing `product-card.v1` gate.
5. Add AX parser/domain tests for valid, invalid, sorting, duplicate, and
   validation cases.
6. Add AX runtime/API tests proving product-card loader behavior and no-file
   back-compat.
7. Extend Viewer runtime schemas/types and strict decode tests for with/without
   workflows.
8. Add a workflow sample catalog and fixture-server mode for browser tests.
9. Add `Workflow` tab wiring and `WorkflowLensView` to `EmptyLibraryView`,
   reusing existing catalog card selection for click-through.
10. Add Playwright coverage for rendering, revisit geometry, gate ring, cardRef
    click-through, and no-workflow/PMS-Back absence.
11. Run targeted AX and Viewer tests, then Viewer check/build, then repo-level
    `pnpm run check`.
12. Review the final diff against the scope fences: no sweep producer, no plugin
    behavior, no per-card diagram/link/thread schema changes, and no edits under
    `docs/alexandria/library/`.

## Acceptance / Exit Criteria

1. A product-card library root with valid `workflows.json` loads with
   `catalog.workflows` populated, workflows sorted by `id`, and steps sorted by
   `order`.
2. Wrong schema version, malformed JSON, and steps missing `order`, `activity`,
   or `context` produce `metadataIssues` without hard catalog-load failure.
3. Unknown workflow contexts and unresolved `cardRefs` produce
   `metadataIssues` while preserving visible workflow data.
4. Catalogs without `workflows.json` decode and render as they do today; PMS-Back
   shows no `Workflow` tab.
5. Viewer strict decode accepts catalogs with optional workflows and catalogs
   without workflows.
6. The Workflow lens renders context columns in first-appearance order, one row
   per ordered step, and a connecting polyline through all nodes.
7. A workflow that revisits a context visibly returns to that column.
8. `gate: true` renders a ring marker.
9. A resolvable `cardRef` is click-through and opens the existing Catalog card
   detail/selection.
10. Existing Index, Fill readiness, Catalog, threads, gaps, links, and per-card
    diagram behavior remain covered by existing tests and do not regress.
11. Targeted AX tests, Viewer strict decode tests, Viewer browser tests, Viewer
    check/build, and repo-level check pass before implementation handoff.

## Deferred Follow-Ups

1. Move S: the sweep/producer that emits `workflows.json`.
2. Temporal link keys or derived workflow relationships between cards.
3. Rich workflow filtering, multiple-workflow comparison, or saved lens state in
   the Viewer.
4. Broader docs or library updates after the capability lands; do not write
   directly to `docs/alexandria/library/` in this slice.
5. If workflow fixtures prove useful beyond browser tests, promote them into a
   shared test fixture in a separate cleanup slice.
