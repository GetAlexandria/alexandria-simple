# Issue 468 Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#468`
- Goal: polish the Viewer Workflow lens row layout so dense workflows remain
  readable: row separators start at the activity-label gutter edge, redundant
  gutter activation prose is removed, and each row clips its own activity
  identity content inside a taller row band.
- Linked product plan: no separate product-level plan is linked. The issue body
  is the product contract for this slice. GitHub comments add only the Fabro
  local run link
  <https://jessmacstudio.chimp-velociraptor.ts.net/runs/01KWAT5X9DS1KXHGZ2A5GFTY1R>.

## Linked Product Plan / Prior Plan Summary

- Issue `#445` established `workflows.json`, `catalog.workflows`, and the Viewer
  Workflow lens as the diagonal, cross-context work-thread renderer.
- The current issue is a presentation-only follow-up to that shipped lens. It
  does not reopen the `library-workflows.v1` contract, catalog loading, step
  ordering, activation derivation, or card-ref behavior.
- The intended reading model is unchanged: the left gutter identifies the
  activity through title plus state/doer/cardRef pills, while the diagram region
  carries relationships in motion through activation ticks and labels.

## Scope

- Update `WorkflowMatrix` in
  `packages/viewer/src/components/library/EmptyLibraryView.tsx`.
- Start horizontal row separator lines at `WORKFLOW_LEFT_GUTTER` instead of SVG
  origin `0`.
- Remove the per-row gutter text block with test ids
  `workflow-step-activations-*`; keep the SVG activation ticks and labels.
- Increase the workflow row band from the current `WORKFLOW_ROW_HEIGHT = 88` to
  a height that comfortably holds an activity title wrapping to roughly three
  lines plus the state/doer/cardRef pill row.
- Add row-band clipping so overlong gutter content cannot visually overlap the
  adjacent row. Clipping should not use ellipsis and must not mutate workflow
  data.
- Update Viewer unit and browser tests for the changed row behavior, including a
  dense PMS-derived workflow case.
- Keep changes limited to Viewer presentation and Viewer test fixtures/tests.

## Non-Goals

- Do not change `library-workflows.v1`, `catalog.workflows`, or AX catalog
  parsing/loading behavior.
- Do not change workflow step sorting, context-column derivation, card-ref
  resolution, gate rendering, polyline rendering, or activation computation.
- Do not change `deriveStepActivations` behavior in
  `library-peek-view-model.ts`.
- Do not remove SVG activation ticks or their `workflow-activation-*` test ids.
- Do not change `workflow-row-*`, `workflow-node-*`, `workflow-gate-*`, or
  `workflow-cardref-*` test ids.
- Do not alter Catalog, Coverage, Gaps, Issues, Index, Readiness, or legacy
  library tab behavior.
- Do not edit `studio/sweeps/playmaker-studio/workflows.json` or anything under
  `docs/alexandria/library/`.
- Do not change Alexandria plugin, skill, agent, CLI, runtime API, or eval
  harness behavior.

## Current Gap

- `WorkflowMatrix` draws horizontal row separators with `x1={0}` and
  `x2={width}`, so each separator crosses the activity title area in the left
  gutter.
- `WorkflowMatrix` derives `activationsByStep` for SVG activation ticks, then
  also renders a gutter text line:
  `data-testid="workflow-step-activations-<workflow>-<step>"` with text like
  `activates derived from brief`. This duplicates the diagram labels and can add
  an extra text line to already dense rows.
- `WORKFLOW_ROW_HEIGHT` is currently `88`, and the row label container does not
  clip overflowing gutter content. A long wrapped activity title plus pills plus
  activation prose can spill into the next row.
- Existing `EmptyLibraryView.test.tsx` coverage currently expects the activation
  story line to exist. That expectation must invert while preserving tick
  coverage.
- Existing Playwright workflow coverage uses a short four-step fixture for
  geometry and click-through behavior. It does not catch the dense PMS
  multi-context overflow case from
  `/library/empty?libraryRoot=studio/sweeps/playmaker-studio`.

## Architectural Boundaries

- This is a pure React presentation change in the Viewer component layer. Do not
  introduce Effect code; the viewer README reserves Effect for browser runtime
  boundaries.
- The workflow data model remains server-owned and already decoded by the
  Viewer runtime schema. No schema or AX contract changes belong in this slice.
- `activationsByStep` remains necessary for the SVG tick/label layer. The slice
  removes only the redundant gutter prose that serializes those activations as
  text.
- Geometry should continue to be driven by the existing constants:
  `WORKFLOW_LEFT_GUTTER`, `WORKFLOW_COLUMN_WIDTH`, `WORKFLOW_HEADER_HEIGHT`, and
  `WORKFLOW_ROW_HEIGHT`.
- Row clipping belongs to the left-gutter row container or an inner identity
  wrapper, not to the whole matrix. Nodes, activation ticks, column guides, and
  polylines must remain visible in the diagram region.
- If tests need a stable selector for row separator lines, adding a new
  `workflow-row-separator-*` test id is acceptable. Existing workflow test ids
  must not be renamed or repurposed.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/468-workflow-lens-row-polish/plan.md` | Captures the repo-specific implementation plan for issue `#468` |
| Viewer Workflow lens | `packages/viewer/src/components/library/EmptyLibraryView.tsx` | Row separators start at the gutter edge; gutter renders activity identity only; rows are taller and clip overflow |
| Viewer unit tests | `packages/viewer/src/components/library/EmptyLibraryView.test.tsx` | Preserve activation tick assertions, invert the gutter activation prose expectation, and assert row separator origin in static markup if feasible |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Add dense workflow layout coverage for row-line origin, no activation prose DOM, and non-overlapping clipped rows |
| Viewer browser fixtures, if needed | `packages/viewer/src/components/library/sample-catalog.ts`, `packages/viewer/tests/serve-viewer-fixture.ts` | Add a test-only dense workflow fixture derived from the PMS workflow shape if the fixture server cannot exercise the real PMS bundle deterministically |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| AX CLI/runtime catalog API | None | None |
| Viewer library surface | Workflow lens row presentation changes only | Viewer unit/build/browser validation; no prompt, skill, plugin, or eval updates |

## Implementation Details

1. In `WorkflowMatrix`, change horizontal row separator lines from `x1={0}` to
   `x1={WORKFLOW_LEFT_GUTTER}`. Keep `x2={width}` and existing y-coordinate
   derivation so row alignment with nodes remains unchanged.
2. Remove the gutter activation prose block:
   `workflow-step-activations-${testIdPart(workflow.id)}-${stepIndex}`.
   Continue to compute `activationsByStep` for the SVG tick layer.
3. Increase `WORKFLOW_ROW_HEIGHT` from `88` to the smallest value that supports
   the target PMS dense workflow at normal desktop and narrow scrollable
   viewports. Expect a value in the `120` to `136` range, then verify in
   browser.
4. Add `overflow-hidden` or equivalent clipping to the left-gutter row band.
   The activity title should wrap naturally and clip inside the row band, with
   no ellipsis and no data mutation.
5. Adjust row gutter spacing as needed after the height change:
   - keep the order number visible;
   - keep activity title, state, doer, and cardRef pills as the only gutter
     content;
   - keep the row container at `width: WORKFLOW_LEFT_GUTTER`;
   - avoid changing node coordinates except through the row-height constant.
6. Preserve all existing workflow diagram behavior:
   - `workflow-polyline-*`;
   - `workflow-node-*`;
   - `workflow-gate-*`;
   - `workflow-cardref-*`;
   - `workflow-activation-*`;
   - first-appearance context columns;
   - ordered workflow rows.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer focused unit coverage | `pnpm --filter @alexandria/viewer exec bun test src/components/library/EmptyLibraryView.test.tsx` | Confirms activation ticks still render, activation prose is gone, and static row/separator markup matches the contract |
| Viewer full unit suite | `pnpm --filter @alexandria/viewer run test` | Catches regressions in related library peek/workflow view-model tests |
| Viewer browser workflow coverage | `pnpm --filter @alexandria/viewer exec playwright test tests/library-browser.spec.ts -g "Workflow lens"` | Verifies browser geometry, row clipping, card click-through, and absence of redundant activation prose |
| Viewer browser regression file | `pnpm --filter @alexandria/viewer exec playwright test tests/library-browser.spec.ts` | Ensures Catalog / Coverage / Gaps / Issues / Index / Readiness and existing library routes still pass |
| Viewer type/static validation | `pnpm --filter @alexandria/viewer run check` | Validates Astro/TypeScript after component and test fixture changes |
| Viewer production build | `pnpm --filter @alexandria/viewer run build` | Confirms the shipped static Viewer builds with the changed Workflow lens |
| Repo-level guard, if time allows | `pnpm run check` | Final repo formatting/lint/type guard after the targeted Viewer slice |

## Test Matrix

| Requirement | Planned coverage |
|-------------|------------------|
| Row separators start at the gutter edge | Unit or browser assertion reads each row separator `x1` and expects `WORKFLOW_LEFT_GUTTER` (`230` unless the constant changes), never `0` |
| Activity titles are not crossed by row separators | Browser coverage checks separators begin to the right of the row label bounding boxes |
| No gutter activation prose renders | Unit and browser assertions confirm no `workflow-step-activations-*` element exists and the Workflow lens does not render the `activates ...` text line |
| SVG activation ticks still render | Existing relationships-in-motion assertions continue to expect `workflow-activation-make-a-play-1-derived_from-brief` and `workflow-activation-make-a-play-1-operates_on-play` |
| Dense PMS rows do not visually overlap | Browser coverage uses `/library/empty?libraryRoot=studio/sweeps/playmaker-studio` when deterministic, or a `workflow-dense` fixture derived from `studio/sweeps/playmaker-studio/workflows.json`; assertions check row rect ordering and clipping style |
| Wrapped title remains data-faithful | Unit/browser coverage verifies long activity text is present in the DOM, wraps/clips visually, and is not ellipsized or rewritten |
| Workflow node rendering unchanged | Existing Playwright test for nodes, polyline point count, context revisit alignment, gate ring, and cardRef click-through continues to pass |
| Step ordering unchanged | Existing row `data-workflow-order` assertions continue to pass |
| Other library tabs unaffected | Existing `library-browser.spec.ts` coverage for Catalog / Coverage / Gaps / Issues / Index / Readiness continues to pass |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer Workflow lens | Deterministic React unit tests and Playwright browser tests cover the shipped UI behavior | Add/update deterministic tests; no eval harness rerun | N/A |
| Product agents / skills / plugin workflows | Not touched | No eval-harness coverage required | N/A |
| AX CLI/runtime behavior | Not touched | No CLI black-box tests or eval reruns required | N/A |

`EVALS.md` requires eval reruns when skill, agent, plugin workflow, or eval
harness behavior changes. This slice changes only Viewer presentation and is
covered by deterministic Viewer tests.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Row-height changes shift node/polyline geometry unexpectedly | Keep coordinate formulas unchanged and let only `WORKFLOW_ROW_HEIGHT` alter y positions; run existing Playwright geometry checks |
| Removing gutter activation prose accidentally reduces relationship coverage | Preserve `deriveStepActivations` and the SVG `workflow-activation-*` tick/label layer; keep unit tests for those ticks |
| Row clipping hides more identity content than intended | Increase row height for a three-line activity title plus pills, then verify against the dense PMS workflow in browser |
| Clipping affects focus visibility for clickable cardRef pills | Keep focusable pills inside the clipped row band and verify cardRef click-through still works in the Workflow lens browser test |
| Row separator tests become brittle if they rely on SVG child order | Prefer a stable row separator test id if needed; otherwise assert by line attributes scoped to the workflow card |
| Dense PMS browser coverage depends on live repo data that may be hard for the fixture server to serve | Use the real `/library/empty?libraryRoot=studio/sweeps/playmaker-studio` path when available; otherwise add a test-only dense fixture derived from the PMS workflow file without editing the source data |
| Other schema-aware tabs regress through shared `EmptyLibraryView` edits | Keep the change localized to `WorkflowMatrix` and run the existing library browser regression file |

## Implementation Steps

1. Update `WorkflowMatrix` row separator lines to start at
   `WORKFLOW_LEFT_GUTTER`.
2. Remove the gutter activation prose block and its
   `workflow-step-activations-*` test id from `EmptyLibraryView.tsx`.
3. Increase `WORKFLOW_ROW_HEIGHT` and add clipping to the row gutter container
   or inner identity wrapper.
4. Manually review the row layout in the component to confirm the gutter now
   contains only order, activity, state/doer/cardRef pills, and no activation
   prose.
5. Update `EmptyLibraryView.test.tsx`:
   - keep assertions for SVG activation ticks;
   - remove expectations for `workflow-step-activations-*`;
   - assert those test ids are absent;
   - assert row separator origin is the gutter offset if practical in static
     markup.
6. Update `library-browser.spec.ts`:
   - preserve the existing workflow geometry and cardRef click-through test;
   - add assertions that row separator `x1` is the gutter offset;
   - assert no `workflow-step-activations-*` element exists;
   - add dense PMS row overlap/clipping coverage.
7. If the existing fixture server cannot exercise the real PMS bundle
   deterministically, add a test-only dense workflow fixture mode based on
   `studio/sweeps/playmaker-studio/workflows.json`.
8. Run the targeted unit test and workflow browser test.
9. Run the full Viewer unit suite, full library browser spec, Viewer `check`,
   and Viewer `build`.
10. Review the final diff against scope: no AX, plugin, skill, CLI, workflow
    contract, activation-computation, or `docs/alexandria/library/` edits.

## Acceptance / Exit Criteria

1. Every Workflow lens horizontal row separator starts at the activity-label
   gutter edge (`WORKFLOW_LEFT_GUTTER`) and does not cross activity titles.
2. No row renders a textual `activates ...` line in the gutter.
3. No `workflow-step-activations-*` element appears in the rendered DOM.
4. SVG activation ticks and labels still render through `workflow-activation-*`
   elements where cross-context cardRef links support them.
5. A workflow step with a wrapped multi-line activity title does not visually
   overlap the adjacent row; overflow is clipped to its row band.
6. The activity title remains present in the DOM and is not ellipsized or
   rewritten.
7. Workflow node rendering, activation ticks, gate rings, cardRef click-through,
   step ordering, context-column derivation, and `workflow-row-*` test ids are
   unchanged.
8. Catalog / Coverage / Gaps / Issues / Index / Readiness tabs are unaffected by
   the slice.
9. The dense PMS workflow case renders with non-overlapping rows.
10. Targeted Viewer unit/browser tests, full Viewer unit tests, Viewer check,
    and Viewer build pass before implementation handoff.

## Deferred Follow-Ups

1. Add a visual regression screenshot for the dense PMS Workflow lens if the
   team wants image-based guardrails around `workflow-fixed.png`.
2. Add an explicit "show full activity title" affordance for clipped labels if
   real workflows need it; do not add that interaction in this polish slice.
3. Broader Workflow lens filtering, row density controls, or responsive redesign.
4. Any changes to `library-workflows.v1`, workflow producer behavior, or
   activation derivation.
