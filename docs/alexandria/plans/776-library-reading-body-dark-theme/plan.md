# Issue 776 Technical Plan - Library Reading Body Dark Theme Reskin

**Status:** Ready for implementation planning (2026-07-09)

**Issue:** `GetAlexandria/alexandria-internal#776` - Re-skin the Library
reading body - Index, Catalog, Workflow - onto the canonical dark theme.

**Blocked by:** none

**Blocks:** `#777`

**Linked product plan:** none. The GitHub issue body is the product-level
source for this slice.

## Goal

Re-skin the Library viewer reading surfaces so `/library`,
`/library/viewer/index`, `/library/viewer/catalog`, and
`/library/viewer/workflow` render on Alexandria's canonical dark viewer theme.
This is a styling-only change: projection data, routing, component signatures,
state, interactions, and test ids must remain unchanged.

The reason for this slice is that issue `#770` darkened Engine View, but issue
`#611` made Index the viewer section's landing mode. Directors therefore still
land on a parchment reading body inside the dark viewer shell.

## Sources Checked

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- `skills/maintainer/technical-planning/plan-template.md`
- `packages/viewer/README.md`
- `EVALS.md`
- GitHub issue `#776` body provided in the stage prompt
- GitHub issue `#776` comments via connector:
  - one comment only, "Fabro local run submitted" for run
    `01KX43B3GRS0WM005B1C9GRZE2`; no added product constraints
- Precedent technical plan:
  - `docs/alexandria/plans/659-engine-view-dark-theme/plan.md`
- Theme and reference surfaces:
  - `packages/viewer/src/styles/global.css`
  - `packages/viewer/src/components/library/RavenKnowledgeBankStatus.tsx`
- Current implementation surface:
  - `packages/viewer/src/components/library/EmptyLibraryView.tsx`
  - `packages/viewer/src/components/library/IndexView.tsx`
  - `packages/viewer/src/components/library/CatalogView.tsx`
  - `packages/viewer/src/components/library/WorkflowView.tsx`
  - `packages/viewer/src/components/library/PlaneSidebar.tsx`
  - `packages/viewer/src/components/library/LibraryBrowserApp.tsx`
  - `packages/viewer/src/components/library/viewer-routes.ts`
  - `packages/viewer/src/components/library/library-mode-config.ts`
  - `packages/viewer/src/components/library/IndexView.test.tsx`
  - `packages/viewer/src/components/library/CatalogView.test.tsx`
  - `packages/viewer/src/components/library/WorkflowView.test.tsx`
  - `packages/viewer/src/components/library/EmptyLibraryView.test.tsx`
  - `packages/viewer/src/components/library/LibraryBrowserApp.test.tsx`
  - `packages/viewer/tests/library-browser.spec.ts`

No `packages/viewer/CLAUDE.md` exists in this checkout, so
`packages/viewer/README.md` is the package-local guidance for this slice.

## Scope

- Re-skin the shared reading body used by:
  - viewer Index mode
  - viewer Catalog mode
  - viewer Workflow mode
  - `EmptyLibraryView` internals reused by Builder modes
- Primary implementation files:
  - `packages/viewer/src/components/library/EmptyLibraryView.tsx`
  - `packages/viewer/src/components/library/IndexView.tsx`
  - `packages/viewer/src/components/library/CatalogView.tsx`
  - `packages/viewer/src/components/library/WorkflowView.tsx`
  - `packages/viewer/src/components/library/PlaneSidebar.tsx`
- Conditional implementation files:
  - `packages/viewer/src/styles/global.css`
  - `packages/pms/viewer/src/styles/global.css`
- Use existing dark theme vocabulary first:
  - `--viewer-canvas-*`
  - `--viewer-raven-*`
  - `--viewer-panel-bd`
  - existing `--viewer-engine-*` tokens where they fit the same semantic job
  - `.raven-canvas-section`
  - `.raven-kb-*`
  - `.raven-etched-note`
  - `.raven-etched-note-danger`
- Add a new `--viewer-*` token only for a genuinely reusable dark-theme value
  that cannot be expressed with the existing vocabulary. If viewer tokens are
  added, mirror the same token additions in
  `packages/pms/viewer/src/styles/global.css` to preserve the documented
  viewer/PMS theme parity.
- Preserve all exported function and component signatures in the primary
  files.
- Preserve every existing `data-testid`.
- Preserve the issue's decided shared-internals consequence: Builder modes that
  render `EmptyLibraryView` internals inherit the dark shared body, while
  Builder-specific chrome may remain light until the follow-up issue.

## Non-Goals

- No changes to route defaults, route parsing, mode selection, or tab
  membership:
  - no `LibraryBrowserApp.tsx` routing changes
  - no `viewer-routes.ts` changes
  - no `library-mode-config.ts` changes
- No changes to catalog, graph, fill-readiness, workflow, notepad, or peek
  view-model data shapes.
- No AX-side catalog or CLI changes.
- No plugin, agent, skill, workflow, ledger, hosted-instance, or eval-harness
  behavior changes.
- No freehand edits under `docs/alexandria/library/`.
- No test rewrites. The named unit tests and Playwright spec are regression
  signals and must pass unmodified.
- Do not touch Builder-specific chrome files:
  - `packages/viewer/src/components/library/DraftsView.tsx`
  - `packages/viewer/src/components/library/DraftOverlayViews.tsx`
  - `packages/viewer/src/components/library/NotepadView.tsx`
  - `packages/viewer/src/components/library/BuilderNotepadView.tsx`
  - `packages/viewer/src/components/library/BuilderBundleSelector.tsx`
- Do not touch already-dark or intentionally separate Library surfaces:
  - `ConstellationView.tsx`
  - `FolderLibraryView.tsx`
  - `FolderStack.tsx`
  - `CardDrawer.tsx`
  - `LedgerView.tsx`
  - `PlaybookView.tsx`
  - all `Engine*` files
  - `TypeLegend.tsx`
  - `TypeSwatch.tsx`
  - `engine-view-model.ts`
- Do not normalize the Builder interim mixed look by expanding scope into the
  excluded files.

## Current Gap

The viewer shell and Engine View now use dark theme tokens, but the promoted
reading modes still render a hardcoded light parchment palette:

- `IndexView.tsx`, `CatalogView.tsx`, and `WorkflowView.tsx` set their mode
  roots to `bg-[#f3efe6] text-[#20242b]`.
- `PlaneSidebar.tsx` renders a light sidebar and light blank-catalog error
  panel.
- `EmptyLibraryView.tsx` contains nearly all shared reading internals and
  still has many light grounds and inks:
  - roots/header/sidebar: `#f3efe6`, `#fffdf8`, `#e9e1d2`
  - cards/panels/rows: `#fffdf8`, `#f6f1e8`, `#fff8f8`
  - borders: `#d9d2c2`, `#e5dece`, `#cfc7b6`
  - ink: `#20242b`, `#34302a`, `#6b665b`
  - semantic light palette: green, amber, wine, and gray literals
- `EmptyLibraryView.tsx` uses `font-mono` broadly for UI labels, headings,
  buttons, counts, and status text. The issue reserves monospace for
  identifier/path-shaped content only.
- The workflow renderer includes SVG `stroke` and `fill` hex literals, so a
  class-only search would miss some light-mode remnants.

## Architectural Boundaries

- Keep this as a presentational re-skin. The implementation may change class
  names, CSS variable references, and inline SVG color values, but not data
  derivation or UI state transitions.
- Keep the exported contracts unchanged:
  - `IndexView({ catalog, onOpenInCatalog })`
  - `CatalogView({ catalog })`
  - `WorkflowView({ catalog, onOpenInCatalog })`
  - `LibraryIndexView(...)`
  - `LibraryPeek(...)`
  - `CatalogAreaTree(...)`
  - `MetadataIssues(...)`
  - `PlaneButton(...)`
  - `PlaneSidebar(...)`
  - `BlankCatalogState(...)`
- Keep all `data-testid` strings and dynamic test-id construction unchanged.
- Keep the 4-state area status signal distinct:
  - `filled`: success token
  - `partial`: amber token
  - `gap`: danger token
  - `empty`: neutral token
- Prefer component classes already defined in `global.css` when they fit the
  layout. If a `.raven-kb-*` class carries layout constraints that do not fit
  an existing grid, drawer, or matrix, use the same tokens directly in Tailwind
  classes with CSS variables.
- Tailwind arbitrary values are acceptable only when referencing CSS variables,
  for example `bg-[var(--viewer-canvas-slate)]`. Do not add literal arbitrary
  hex classes like `bg-[#...]`, `text-[#...]`, or `border-[#...]`.
- If `global.css` is touched for token additions, keep additions reusable and
  mirror the token block in PMS. Do not add component-specific one-off CSS.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Viewer mode roots | `IndexView.tsx`, `CatalogView.tsx`, `WorkflowView.tsx` | Replace parchment roots with dark viewer ground. Keep route-level test ids and props unchanged. |
| Shared reading internals | `EmptyLibraryView.tsx` | Re-skin Index cards, plane lead stories, context stories, prose chips, catalog rows/details, workflow cards/matrix, metadata panels, blank states, and legacy Empty tab shell. |
| Peek sheet | `EmptyLibraryView.tsx` `LibraryPeek` | Replace cream right drawer and header with dark sheet treatment, preserving close, Escape handling, in-peek navigation, and "open in Catalog" behavior. |
| Catalog and workflow plane sidebar | `PlaneSidebar.tsx`, `EmptyLibraryView.tsx` embedded aside | Replace light sidebar, plane buttons, and blank-catalog error panel with dark treatments. |
| Area/status semantics | `EmptyLibraryView.tsx` helpers such as `statusClass`, confidence/readiness/gap treatments | Source success/amber/danger/neutral states from viewer semantic tokens while keeping filled/partial/gap/empty visually distinct. |
| Workflow diagram | `EmptyLibraryView.tsx` `WorkflowMatrix`, `WorkflowNode`, `WorkflowCardRef` | Replace SVG strokes/fills and workflow node/card/chip colors with dark-safe token references. Preserve matrix geometry and click behavior. |
| Legacy Empty/Builder shared body | `EmptyLibraryView.tsx` `WorkbenchTabButton`, `GatePanel`, `CoverageTab`, `GapsTab`, blank states | Remove light backgrounds from the shared body because acceptance targets the whole file. Do not edit Builder-specific chrome files. |
| Theme vocabulary, conditional | `packages/viewer/src/styles/global.css`, maybe `packages/pms/viewer/src/styles/global.css` | Add only reusable `--viewer-*` tokens/classes if existing tokens cannot express the needed dark treatment. Mirror PMS if touched. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Agents | None. | None. |
| Skills | None. | None. |
| Templates/workflows | None. | None. |
| CLI/runtime/API | None. | None. |
| Viewer UI | Visual theme and typography only for Library reading body. | Viewer unit, build/check, browser, static guard, and visual verification listed below. |

## Implementation Steps

1. Preflight the current styling surface.
   - Run a targeted search for light palette remnants and broad monospace use
     in the five primary component files.
   - Capture the current `data-testid` list from the same files and treat it as
     immutable.
   - Confirm no excluded files are already dirty before editing.

2. Establish the dark palette source.
   - Use `--viewer-canvas-bg`, `--viewer-canvas-fg`,
     `--viewer-canvas-fg-bright`, `--viewer-canvas-fg-dim`,
     `--viewer-canvas-fg-dimmer`, `--viewer-canvas-slate`,
     `--viewer-canvas-slate-2`, `--viewer-canvas-slate-3`,
     `--viewer-canvas-rule`, `--viewer-canvas-panel-bd`,
     `--viewer-canvas-success`, `--viewer-canvas-amber`,
     `--viewer-canvas-amber-dim`, `--viewer-canvas-amber-glow`,
     `--viewer-canvas-danger`, `--viewer-raven-core`,
     `--viewer-raven-core-soft`, and `--viewer-panel-bd` for most of the
     re-skin.
   - Use `.raven-etched-note` and `.raven-etched-note-danger` for metadata,
     runtime/error/warning, no-context, no-workflow, no-areas, blank-catalog,
     and gap warning states where the layout fits.
   - Use `.raven-kb-band`, `.raven-kb-side-plate`, `.raven-kb-source-meta`, and
     neighboring `.raven-kb-*` classes as shape references. Apply them directly
     only when their layout rules fit the existing component structure.
   - Keep area statuses distinct with semantic tokens. Do not collapse
     `filled`, `partial`, `gap`, and `empty` to a single accent.

3. Re-skin the promoted mode roots.
   - In `IndexView.tsx`, `CatalogView.tsx`, and `WorkflowView.tsx`, replace the
     light root classes with dark viewer ground and foreground token classes.
   - Keep `data-testid="library-index-mode"`,
     `data-testid="library-catalog-mode"`, and
     `data-testid="library-workflow-mode"` unchanged.
   - Keep `onOpenInCatalog` route calls unchanged.

4. Re-skin shared status, chip, and typography helpers in
   `EmptyLibraryView.tsx`.
   - Convert `statusClass()` to semantic token-based treatments:
     success/amber/danger/neutral.
   - Convert `VITALS_CHIP_CLASS`, confidence/readiness/gate status chips,
     external noun chips, role-style consumers, and transfer/gap chips to
     dark-safe tokenized colors.
   - Convert ordinary helper labels from `font-mono` to `font-sans` or
     `font-display`.
   - Preserve `font-mono` only on identifier/path-shaped content:
     source refs, source evidence refs, provenance values, catalog field
     values, bundle paths/event ids, and typed-edge ids.

5. Re-skin Catalog rows and detail panes.
   - Update `CardDetail` and `GapDetail` to dark panels. Preserve story
     rendering, typed links, risks, draft trail, and source lists.
   - Update `CardRow`, `GapRow`, and `EmptyAreaGap` to dark rows with readable
     success/danger/amber accents.
   - Update `CatalogAreaTree` to a dark section with dark header row, area
     status pill, and unchanged collapse/select behavior.
   - Keep all catalog test ids unchanged, including `catalog-area-*`,
     `catalog-card-*`, `catalog-gap-*`,
     `catalog-card-typed-links-*`, `catalog-card-edges-*`, and
     `catalog-metadata-issues`.

6. Re-skin Index sections and story/prose renderers.
   - Update `LibraryIndexView` sections to dark band/card treatments.
   - Update plane lead and context story cards to dark panels.
   - Update context tiles to dark interactive tiles with stable dimensions and
     no layout-shifting hover state.
   - Update story paragraph text, inline noun chips, diagram labels, connector
     targets, and lifecycle chips to dark-safe tokenized treatments.
   - Keep `library-index-view`, `library-index-plane-*`,
     `library-index-context-*`, and `library-index-context-counts-*` unchanged.

7. Re-skin metadata, blank, and error panels.
   - Update `MetadataIssues` to render as dark etched-note success/empty or
     danger treatments.
   - Update `BlankCatalogState` in `PlaneSidebar.tsx` and the duplicate
     blank-catalog branches in `EmptyLibraryView.tsx` to use dark etched-note
     danger treatments.
   - Update `CatalogView.tsx` no-areas panel and `WorkflowView.tsx`
     `workflow-lens-empty` panel to dark note treatments.
   - Preserve copy and metadata-issue count behavior exactly.

8. Re-skin the Workflow renderer.
   - Update `WorkflowLensView` and `WorkflowMatrix` cards, headers, no-steps
     states, context headings, row labels, state/doer chips, card refs, nodes,
     gate rings, and activation labels to dark-safe colors.
   - Replace SVG `stroke` and `fill` hex literals with CSS variable references
     or currentColor/token-derived values.
   - Preserve matrix constants, geometry, row/column derivation,
     activation derivation, and click behavior.
   - Keep all workflow test ids unchanged, including `workflow-lens-view`,
     `workflow-card-*`, `workflow-scroll-*`, `workflow-node-*`,
     `workflow-cardref-*`, `workflow-gate-*`, and activation ids.

9. Re-skin `LibraryPeek`.
   - Replace the parchment overlay/drawer/header with a dark side sheet
     treatment similar to `raven-kb-side-plate`, while preserving full-height
     fixed positioning.
   - Keep close overlay, close button, Escape close behavior, `onPeekCard`,
     and `onOpenInCatalog` behavior unchanged.
   - Preserve all `library-peek` and `library-peek-*` test ids.
   - Keep provenance/source evidence refs monospace; convert ordinary headings,
     labels, buttons, and prose to sans/display as appropriate.

10. Re-skin the legacy `EmptyLibraryView` shell and shared Builder body.
    - Replace the `empty-library-view` root, sticky header, tab buttons,
      header counts, legend row, embedded plane sidebar, gate panel, coverage
      tab, and gaps tab light colors with dark tokens.
    - Do not edit `NotepadView.tsx` or other Builder-specific chrome files
      even if a nested tab remains visually mixed. That mixed Builder chrome is
      accepted for this issue and owned by the follow-up.
    - Keep confirm/reject gate behavior, form state, runtime calls, and refresh
      behavior unchanged.

11. Re-skin `PlaneSidebar.tsx`.
    - Replace the sidebar light ground and "Planes" label typography.
    - Rely on the shared `PlaneButton` exported from `EmptyLibraryView.tsx` for
      button styling, preserving the shared behavior for Catalog and Workflow.
    - Update `BlankCatalogState` only as a dark visual treatment.

12. Static cleanup and scope guards.
    - Ensure the five primary component files contain no remaining
      `bg-white`, `bg-[#...]`, `text-[#...]`, `border-[#...]`, `stroke="#..."`,
      `fill="#..."`, or six/eight-digit color hex literals.
    - Inspect every remaining `font-mono` occurrence in the primary files and
      confirm each one is identifier/path-shaped content allowed by the issue.
    - Confirm excluded files have zero diff.
    - Confirm tests were not modified.

13. Deterministic and visual verification.
    - Run the focused unit tests and full viewer test/build matrix below.
    - Run the Playwright Library browser spec unmodified.
    - Start the viewer and visually inspect `/library`,
      `/library/viewer/index`, `/library/viewer/catalog`, and
      `/library/viewer/workflow` at desktop and mobile widths.
    - Also smoke the Builder modes that reuse shared internals:
      `alexandria-back`, `alexandria-drafts`, `empty`, and `notepad`.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Focused reading-mode unit tests | `pnpm --filter @alexandria/viewer exec bun test src/components/library/IndexView.test.tsx src/components/library/CatalogView.test.tsx src/components/library/WorkflowView.test.tsx src/components/library/EmptyLibraryView.test.tsx src/components/library/LibraryBrowserApp.test.tsx` | Confirms the promoted modes, shared internals, and app route mounting still behave as before. |
| Full viewer unit suite | `pnpm --filter @alexandria/viewer run test` | Catches shared `EmptyLibraryView`, Builder, Notepad, Engine, and other Library side effects. |
| Viewer type/static check | `pnpm --filter @alexandria/viewer run check` | Confirms Astro/TypeScript integration after class/token changes. |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Confirms the static viewer compiles with any token changes. |
| Library Playwright regression | `pnpm --filter @alexandria/viewer exec playwright test tests/library-browser.spec.ts` | Confirms index tile -> peek -> open in Catalog, workflow refs, plane selection, peek close, metadata issues, and route behavior. |
| Optional full e2e | `pnpm --filter @alexandria/viewer run test:e2e` | Broader browser confidence if time allows. |

Static guard commands for implementation review:

```bash
rg -n -e 'bg-white|bg-\[#|text-\[#|border-\[#|stroke="#|fill="#|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}' \
  packages/viewer/src/components/library/EmptyLibraryView.tsx \
  packages/viewer/src/components/library/IndexView.tsx \
  packages/viewer/src/components/library/CatalogView.tsx \
  packages/viewer/src/components/library/WorkflowView.tsx \
  packages/viewer/src/components/library/PlaneSidebar.tsx

rg -n -e 'font-mono' \
  packages/viewer/src/components/library/EmptyLibraryView.tsx \
  packages/viewer/src/components/library/IndexView.tsx \
  packages/viewer/src/components/library/CatalogView.tsx \
  packages/viewer/src/components/library/WorkflowView.tsx \
  packages/viewer/src/components/library/PlaneSidebar.tsx

git diff --name-only -- \
  packages/viewer/src/components/library/DraftsView.tsx \
  packages/viewer/src/components/library/DraftOverlayViews.tsx \
  packages/viewer/src/components/library/NotepadView.tsx \
  packages/viewer/src/components/library/BuilderNotepadView.tsx \
  packages/viewer/src/components/library/BuilderBundleSelector.tsx \
  packages/viewer/src/components/library/ConstellationView.tsx \
  packages/viewer/src/components/library/FolderLibraryView.tsx \
  packages/viewer/src/components/library/FolderStack.tsx \
  packages/viewer/src/components/library/CardDrawer.tsx \
  packages/viewer/src/components/library/LedgerView.tsx \
  packages/viewer/src/components/library/PlaybookView.tsx \
  packages/viewer/src/components/library/EngineLibraryView.tsx \
  packages/viewer/src/components/library/EngineCardDrawer.tsx \
  packages/viewer/src/components/library/engine-view-model.ts \
  packages/viewer/src/components/library/TypeLegend.tsx \
  packages/viewer/src/components/library/TypeSwatch.tsx
```

The first command should return no component-level light/arbitrary hex matches.
The second command may return matches, but each match must be an allowed
identifier/path-shaped value. The third command should return no files.

If `global.css` is touched, also review:

```bash
git diff -- packages/viewer/src/styles/global.css packages/pms/viewer/src/styles/global.css
```

The viewer and PMS token additions should stay mirrored when tokens are added.

## Visual Verification

This is a visual bug, so deterministic tests are necessary but not sufficient.
After implementation:

- Start the viewer through the repo-standard path, for example `ax start viewer`
  or the package dev server when appropriate.
- Capture desktop and mobile screenshots for:
  - `/library`
  - `/library/viewer/index`
  - `/library/viewer/catalog`
  - `/library/viewer/workflow`
- Exercise and inspect:
  - index tile grid
  - index tile -> context peek
  - card peek
  - "open in Catalog" navigation
  - catalog plane selection
  - catalog card row expansion
  - catalog gap row expansion
  - metadata issues
  - workflow empty state
  - workflow step card refs
  - workflow step card ref -> peek
  - peek close via button and Escape
  - Builder modes that reuse shared internals
- Confirm the reading body is dark, the shell/body no longer reads as two
  products, status colors remain distinct, text is legible, and no content
  overlaps at mobile or desktop widths.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Viewer reading UI | Unit tests and Playwright browser tests; no eval-harness coverage expected for visual viewer styling. | Run deterministic and visual verification above. | No eval command. |
| Agents | Not affected. | No eval rerun. | None. |
| Skills | Not affected. | No eval rerun. | None. |
| Plugin workflows | Not affected. | No plugin validation or eval rerun. | None. |
| CLI/runtime/API | Not affected. | No CLI black-box tests beyond viewer app regression. | None. |

No eval-harness rerun is required. The change does not alter reusable agents,
product skills, templates, guided play behavior, plugin workflows, CLI
behavior, runtime contracts, or eval cases. The quality gate is viewer
unit/build/browser coverage plus visual screenshot inspection.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Shared `EmptyLibraryView` internals affect Builder modes, causing unexpected errors in Builder while the implementation focuses on viewer routes. | Treat Builder shared-body rendering as in scope for smoke testing, but enforce zero diff on Builder-specific chrome files. |
| The 4-state area status signal could be flattened by overusing one accent. | Map `filled`, `partial`, `gap`, and `empty` to success, amber, danger, and neutral token treatments; visually inspect all four. |
| SVG workflow colors could remain light because they are not Tailwind classes. | Include `stroke="#` and `fill="#` in static guards and specifically update `WorkflowMatrix` SVG elements. |
| Typography cleanup could remove monospace from real identifiers or leave it on ordinary UI labels. | Audit every remaining `font-mono` match and keep it only for source refs, provenance values, catalog field values, bundle/event/path values, and typed-edge ids. |
| Reusing `.raven-kb-*` classes wholesale could impose layout rules that do not fit the existing reading grids, matrix, or fixed peek sheet. | Use those classes directly only where layout fits; otherwise use the same tokens with existing local layout classes. |
| New token work could drift viewer and PMS global CSS out of parity. | Prefer existing tokens; if new tokens are unavoidable, update both `global.css` files in the same patch and review their diff together. |
| The implementation could accidentally touch Engine or Builder chrome to make the whole page look uniformly dark. | Use the explicit no-diff guard for excluded files before finalizing. |
| Tests may pass while the result is still off-brand or low contrast. | Require manual screenshot inspection of the four viewer routes plus key peek/catalog/workflow interactions. |
| Mixed Builder Notepad/Drafts chrome may look unfinished after the shared body goes dark. | Document this as expected for issue `#776`; follow-up issue owns Builder-specific chrome. |

## Acceptance / Exit Criteria

1. `/library`, `/library/viewer/index`, `/library/viewer/catalog`, and
   `/library/viewer/workflow` render on a dark viewer ground.
2. No `bg-white` or `bg-[#f...]`-family light background remains in
   `EmptyLibraryView.tsx`, `IndexView.tsx`, `CatalogView.tsx`,
   `WorkflowView.tsx`, or `PlaneSidebar.tsx`.
3. The five primary component files contain no literal arbitrary hex Tailwind
   color classes and no leftover SVG `stroke`/`fill` hex literals.
4. The four area statuses remain visually distinct:
   `filled`, `partial`, `gap`, and `empty`.
5. The area status treatments are sourced from
   `--viewer-canvas-success`, `--viewer-canvas-amber`,
   `--viewer-canvas-danger`, and a neutral viewer token.
6. `library-peek` renders as a dark sheet, with readable wine/green/amber
   accents and unchanged close/navigation behavior.
7. Catalog card detail panes and gap detail panes render dark, with readable
   provenance, catalog field, typed-edge, risk, and typed-link sections.
8. Runtime/error, metadata-issue, blank-catalog, no-areas, no-context, and
   workflow-empty panels render as dark etched-note treatments or equivalent
   dark tokenized notes.
9. `font-mono` appears only on allowed identifier/path-shaped content in the
   touched files: source refs, source evidence refs, provenance values,
   catalog field values, bundle/event/path values, and typed-edge ids.
10. Ordinary UI labels, tab/plane buttons, counts, status labels, headings, and
    body copy use `font-sans` or `font-display` as appropriate.
11. No exported function/component signatures in the primary files change.
12. Every existing `data-testid` in the primary files remains unchanged.
13. No tests are modified.
14. Excluded Builder chrome files have zero diff:
    `DraftsView.tsx`, `DraftOverlayViews.tsx`, `NotepadView.tsx`,
    `BuilderNotepadView.tsx`, and `BuilderBundleSelector.tsx`.
15. Already-dark or intentionally separate Library files have zero diff:
    `ConstellationView.tsx`, `FolderLibraryView.tsx`, `FolderStack.tsx`,
    `CardDrawer.tsx`, `LedgerView.tsx`, `PlaybookView.tsx`, all `Engine*`
    files, `TypeLegend.tsx`, `TypeSwatch.tsx`, and `engine-view-model.ts`.
16. Builder modes `alexandria-back`, `alexandria-drafts`, `empty`, and
    `notepad` still render without error; shared body areas now render dark,
    while Builder-specific chrome may remain light.
17. Regression behavior is unchanged for:
    index tile -> context peek -> card peek -> "open in Catalog" navigation,
    workflow step card refs, plane selection, peek close, and metadata-issue
    counts.
18. Focused tests pass unmodified:
    `IndexView.test.tsx`, `CatalogView.test.tsx`,
    `WorkflowView.test.tsx`, `EmptyLibraryView.test.tsx`, and
    `LibraryBrowserApp.test.tsx`.
19. `packages/viewer/tests/library-browser.spec.ts` passes unmodified.
20. Visual screenshots show a dark, legible, on-brand reading body at desktop
    and mobile widths.

## Deferred Follow-Ups

1. Re-skin Builder-specific chrome in the follow-up issue:
   `DraftsView.tsx`, `DraftOverlayViews.tsx`, `NotepadView.tsx`,
   `BuilderNotepadView.tsx`, and `BuilderBundleSelector.tsx`.
2. Consider extracting shared dark Library control/panel classes only after
   this and the Builder follow-up reveal stable repeated patterns.
3. Add visual regression image assertions only if the repo adopts a stable
   screenshot-diff workflow. For this slice, Playwright behavior coverage plus
   human screenshot inspection is the visual gate.
