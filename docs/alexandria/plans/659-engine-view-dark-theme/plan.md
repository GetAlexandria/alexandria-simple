# Issue 659 Technical Plan - Engine View Dark Theme Reskin

**Status:** Ready for implementation planning (2026-07-09)

## Goal

Re-skin the Library viewer's Engine View surface onto the canonical Alexandria
dark viewer theme without changing Engine View data projection, grouping,
filtering, drawer navigation, route selection, or component props.

The work closes GitHub issue
`GetAlexandria/alexandria-internal#659`: `EngineLibraryView`,
`EngineCardDrawer`, `TypeLegend`, `TypeSwatch`, and the color descriptors in
`engine-view-model.ts` currently render a light cream/parchment surface inside
the otherwise dark viewer shell. The implementation should make that surface
read as part of the same dark product UI already used by Raven, the agent
bench, the viewer shell, and PMS Studio.

## Sources Checked

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- `packages/viewer/README.md`
- GitHub issue comments for #659: one Fabro local run link for
  `01KX3RY9GC4KXWDKGM2M5SD8DE`; no added product constraints
- `docs/alexandria/plans/library-visual-build/plan.md`, especially the
  original VB2 Engine View technical plan
- `docs/alexandria/plans/learning-plane/handoff-to-main.md`, which names #659
  as a pre-existing open visual defect
- `packages/viewer/src/styles/global.css`
- `packages/viewer/src/components/library/RavenKnowledgeBankStatus.tsx`
- `packages/pms/viewer/src/components/studio/PlayPage.tsx`
- Current Engine View implementation and tests:
  - `packages/viewer/src/components/library/EngineLibraryView.tsx`
  - `packages/viewer/src/components/library/EngineCardDrawer.tsx`
  - `packages/viewer/src/components/library/TypeLegend.tsx`
  - `packages/viewer/src/components/library/TypeSwatch.tsx`
  - `packages/viewer/src/components/library/engine-view-model.ts`
  - `packages/viewer/src/components/library/EngineLibraryView.stories.tsx`
  - `packages/viewer/src/components/library/engine-view-model.test.ts`
  - `packages/viewer/src/components/library/TypeLegend.test.tsx`
  - `packages/viewer/src/components/library/EngineCardDrawer.test.tsx`
  - `packages/viewer/tests/library-browser.spec.ts`

No `packages/viewer/CLAUDE.md` exists in this checkout, so
`packages/viewer/README.md` is the package-local guidance for this slice.
The issue references
`docs/alexandria/plans/library-viewer-brand-alignment/plan.md`, but that path
is not present in this checkout. Per the technical-planning skill, this
per-issue plan is a separate artifact and does not overwrite any product-level
plan path.

## Scope

- Restyle only the Engine View surface and its shared type legend/swatch:
  - `EngineLibraryView.tsx`
  - `EngineCardDrawer.tsx`
  - `TypeLegend.tsx`
  - `TypeSwatch.tsx`
  - `engine-view-model.ts` color descriptor literals
- Use the existing dark theme vocabulary in `packages/viewer/src/styles/global.css`:
  `--viewer-*`, `.raven-*`, `.raven-kb-*`, and `.raven-etched-note*`.
- Add `--viewer-*` color tokens only where the existing tokens cannot preserve
  per-type or per-zone distinguishability. If new viewer tokens are added,
  mirror the same token block in `packages/pms/viewer/src/styles/global.css`
  to preserve the documented viewer/PMS theme parity.
- Preserve every `data-testid` that exists today.
- Preserve current route behavior. Current main routes Engine at
  `/library/viewer/engine`; `/library` currently redirects to the Viewer
  Index after issue #611. Issue #659's visual fix should apply wherever
  `EngineLibraryView` is mounted, but should not alter route defaults.
- Preserve the existing current type taxonomy coverage. The issue text says
  "10 catalog types plus default", but current main has fourteen ruled
  `ENGINE_TYPE_ICON_SET` descriptors plus `UNKNOWN_TYPE`. The dark palette
  must keep all current descriptors visually distinguishable.

## Non-Goals

- No changes to `LibraryBrowserApp.tsx`, `viewer-routes.ts`,
  `library-mode-config.ts`, or mode/default-route policy.
- No changes to `LibraryCatalog`, AX-side catalog code, runtime API shapes, or
  Engine view-model grouping/filtering behavior.
- No edits to `EmptyLibraryView.tsx`, `DraftsView.tsx`, `NotepadView.tsx`,
  `ConstellationView.tsx`, or other Library surfaces.
- No freehand edits under `docs/alexandria/library/`.
- No plugin, agent, skill, workflow, CLI, ledger, or hosted-instance behavior
  changes.
- No Storybook fixture or test assertion rewrites to accommodate the reskin.
  Existing tests should pass as-is unless a test only locks the old light
  palette, which none of the named tests currently appear to do.

## Linked Product-Plan Summary

The original `library-visual-build` plan defines Engine View as the
director-facing, part-first view of the Product plane: context zones, typed
cards, and a card drawer over catalog data. That plan focused on structure and
interaction, not final theme alignment. Since then, the viewer shell and Raven
surfaces have standardized on a dark visual vocabulary in `global.css`, while
Engine View retained hardcoded light colors. Issue #659 is therefore a narrow
brand-alignment slice over an already shipped Engine View, not a new Engine
projection.

## Current Implementation Gap

- `EngineLibraryView.tsx` sets a light root
  `bg-[#faf8f4] text-[#1f1d18]`, a light toolbar, light zone hulls, light card
  buttons, and light warning/empty boxes.
- `EngineCardDrawer.tsx` uses a light drawer background, light section panels,
  light typed-link buttons, and light confidence/horizon chips.
- `TypeLegend.tsx` uses light text and `font-mono` for ordinary UI labels.
- `TypeSwatch.tsx` renders the descriptor palette directly, so the light
  descriptor colors leak into every consumer.
- `engine-view-model.ts` hardcodes light descriptor triples for all current
  type descriptors and `UNKNOWN_TYPE`.
- `EngineLibraryView.tsx` also owns context-zone tones and a neutral fallback
  using light pastel RGBA fills.
- `font-mono` is used for ordinary labels, counts, controls, field names,
  status pills, and drawer metadata. The only genuinely monospace content in
  this surface is the provenance source-ref list.

## Architectural Boundaries

- Keep the Engine view-model pure and deterministic. Only color descriptor
  values should change in `engine-view-model.ts`; `buildEngineViewModel`,
  `engineTypeDescriptor`, `buildTypeDescriptors`, `zone` grouping behavior,
  edge classification, plane selection, and drawer link derivation must remain
  behaviorally unchanged.
- Keep component prop contracts unchanged:
  - `EngineLibraryView({ catalog, initialSelectedPlane, initialSelectedType })`
  - `EngineCardDrawer({ card, links, onClose, onNavigate })`
  - `TypeLegend({ catalog, className })`
  - `TypeSwatch({ descriptor })`
- Keep `zoneTone()`, `confidenceClass()`, and descriptor functions with their
  current signatures and return shapes. The implementation may change the
  returned strings from literal light colors to dark-safe CSS variable
  references.
- Prefer dark theme classes already present in `global.css`. Use Tailwind
  arbitrary values only with CSS variables, not literal hex values.
- Do not introduce local component CSS files or one-off local tokens. If a new
  reusable value is genuinely needed, make it a `--viewer-*` token.
- Do not use `@repos/` code as an import source. No vendored repo update is
  needed for this visual-only slice.

## Touch Map

| Area | Files | Planned behavior |
| --- | --- | --- |
| Engine root and controls | `packages/viewer/src/components/library/EngineLibraryView.tsx` | Replace light root, toolbar, filter buttons, group-by buttons, plane buttons, zone hulls, card buttons, status pills, and warning/empty states with dark theme tokens/classes. Preserve React state, handlers, test ids, and grouping/filtering behavior. |
| Engine card drawer | `packages/viewer/src/components/library/EngineCardDrawer.tsx` | Replace light drawer, metadata panels, provenance/vitals/typed-link sections, confidence chip, and horizon chip with dark theme tokens/classes. Keep drawer open/close and typed-link navigation unchanged. |
| Type legend | `packages/viewer/src/components/library/TypeLegend.tsx` | Change ordinary legend text to dark theme UI typography and `font-sans`; keep row computation, tooltip content, role, and test ids unchanged. |
| Shared swatch | `packages/viewer/src/components/library/TypeSwatch.tsx` | Render the same descriptor-driven color signal against dark backgrounds. Because this primitive is shared, do not edit `EmptyLibraryView.tsx` or `ConstellationView.tsx`; make the swatch itself dark-safe. |
| Engine palette descriptors | `packages/viewer/src/components/library/engine-view-model.ts` | Move `ENGINE_TYPE_ICON_SET` and `UNKNOWN_TYPE` color values from light hex triples to dark-safe token references while preserving descriptor order, labels, definitions, icons, type keys, and fallback resolution. |
| Theme tokens, conditional | `packages/viewer/src/styles/global.css` and, if touched, `packages/pms/viewer/src/styles/global.css` | Add a compact `--viewer-engine-*` token block only if existing `--viewer-*` values are insufficient for the required fourteen-type plus Unknown palette and context-zone palette. Mirror PMS if touched. |

## Detailed Implementation Plan

1. Preflight the current styling surface.
   - Run a targeted search over the five primary files for:
     `font-mono`, `bg-white`, `bg-[#`, `text-[#`, `border-[#`, six/eight-digit
     hex literals, and light RGBA fills.
   - Record the current `data-testid` strings and verify the implementation
     does not rename them.

2. Establish the dark palette source.
   - Use existing surface tokens for general shell/panel text and borders:
     `--viewer-canvas-bg`, `--viewer-canvas-fg`,
     `--viewer-canvas-fg-bright`, `--viewer-canvas-fg-dim`,
     `--viewer-canvas-fg-dimmer`, `--viewer-canvas-slate`,
     `--viewer-canvas-slate-2`, `--viewer-canvas-slate-3`,
     `--viewer-canvas-rule`, `--viewer-canvas-panel-bd`,
     `--viewer-canvas-amber`, `--viewer-canvas-amber-dim`,
     `--viewer-canvas-amber-glow`, `--viewer-canvas-danger`,
     `--viewer-canvas-success`, `--viewer-raven-core`,
     `--viewer-raven-core-soft`, and `--viewer-panel-bd`.
   - Use `.raven-etched-note` and `.raven-etched-note-danger` for the
     metadata-issue and empty/no-product treatments, or a token-equivalent dark
     treatment if the exact class cannot fit the layout.
   - For per-type and per-context colors, prefer new named viewer tokens such
     as `--viewer-engine-type-bet-accent`,
     `--viewer-engine-type-bet-bg`, `--viewer-engine-type-bet-border`, and
     matching zone tokens if existing tokens are not enough. The model should
     reference those variables, not raw light hex.
   - Do not flatten all types or zones to one accent. Distinct type/color
     identity is a required signal.

3. Update `engine-view-model.ts` color descriptors only.
   - Preserve every descriptor's `type`, `label`, `icon`, `definition`,
     `differsFrom`, and `order`.
   - Change `accent`, `background`, and `border` values for all fourteen
     descriptors and `UNKNOWN_TYPE` to dark-safe values, preferably
     `var(--viewer-engine-type-...)` references.
   - Keep `engineTypeDescriptor`, `buildTypeDescriptors`, and all grouping
     helpers unchanged apart from consuming the new values.

4. Update `EngineLibraryView.tsx`.
   - Replace the root light background/text classes with dark viewer ground,
     using `raven-canvas-section`, `raven-kb-surface`, or token-equivalent
     classes.
   - Rework the toolbar as a dark header/control band. Filter/group buttons
     should use `font-sans`, dark borders, and clear active/inactive states
     keyed to existing amber/Raven-core tokens.
   - Recompute `DEFAULT_ZONE_TONE` and the `context` branch of `zoneTone()`
     as dark translucent tints. Keep `groupBy === "type"` using
     `engineTypeDescriptor(zoneKey)` and keep `groupBy !== "context"` using
     the neutral fallback.
   - Re-skin `TypeIcon`, zone counts/status pills, empty-zone text, and
     `EngineCardButton` without changing dimensions, positioning, click
     behavior, or test ids.
   - Convert every non-heading `font-mono` in this file to `font-sans`. Keep
     existing `font-display` headings.
   - Replace the projected-metadata warning and the "No Product cards
     projected" empty state with dark etched-note treatments.

5. Update `EngineCardDrawer.tsx`.
   - Re-skin the drawer as a dark panel. `raven-kb-side-plate` and
     `raven-kb-band` are good shape references, but use them only where their
     layout rules fit the sticky bottom drawer.
   - Change `confidenceClass()` so `high`, `medium`, and `low` are visibly
     distinct and sourced from `--viewer-canvas-success`,
     `--viewer-canvas-amber`, and `--viewer-canvas-danger`.
   - Tokenize the future horizon chip as well; it currently contains light
     purple hex values and must not remain as arbitrary hex.
   - Convert ordinary drawer metadata labels, vitals, section headings, close
     button, and typed-link rows from `font-mono` to `font-sans`.
   - Keep `sourceList()` list items as `font-mono`; this is the provenance
     path/identifier-shaped content. The empty source-ref message should be
     dark UI text, not monospace path styling.
   - Preserve the drawer test ids, typed-link button data attributes, and
     `onNavigate` behavior.

6. Update `TypeLegend.tsx` and `TypeSwatch.tsx`.
   - Keep `buildTypeDescriptors()` use, row order, role/list markup,
     tooltips, and `data-testid` strings unchanged.
   - Change the legend wrapper typography to `font-sans` and dark theme text.
   - Ensure the swatch remains visible on dark backgrounds, including the
     passive legend, filter buttons, and card icons.

7. Static cleanup pass.
   - Verify the five primary files contain no `bg-white`, no `bg-[#...]`,
     `text-[#...]`, or `border-[#...]` Tailwind arbitrary hex classes, and no
     remaining six/eight-digit hex color literals in TS/TSX style data.
   - Verify `font-mono` remains only on the provenance source-ref list in
     `EngineCardDrawer.tsx`.
   - Verify all issue-listed `data-testid` strings still exist.

8. Deterministic and visual verification.
   - Run the targeted viewer unit tests and the existing Engine Playwright
     coverage without modifying their assertions.
   - Build Storybook or at least render the named stories to confirm
     `MultiContext`, `DenseContext`, `SurfaceFilter`, and `UnfiledZone` still
     mount.
   - Start the viewer and capture desktop/mobile screenshots of
     `/library/viewer/engine`. If a local branch still maps `/library` to
     Engine in a deployment target, verify that alias too, but do not change
     route logic in this issue.

## Deterministic Verification

Run these from the repo root unless noted otherwise:

| Area | Command | Purpose |
| --- | --- | --- |
| Focused model and component tests | `pnpm --filter @alexandria/viewer exec bun test src/components/library/engine-view-model.test.ts src/components/library/TypeLegend.test.tsx src/components/library/EngineCardDrawer.test.tsx` | Confirms model behavior, type legend behavior, and drawer conditional rendering remain unchanged. |
| Full viewer unit suite | `pnpm --filter @alexandria/viewer run test` | Catches shared `TypeSwatch`/theme side effects across Library viewer components. |
| Viewer static check | `pnpm --filter @alexandria/viewer run check` | Confirms Astro/TypeScript integration. |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Confirms the static viewer compiles with any token changes. |
| Storybook build | `pnpm --filter @alexandria/viewer run storybook:build` | Confirms the named Engine stories mount in isolation. |
| Engine browser regression | `pnpm --filter @alexandria/viewer exec playwright test tests/library-browser.spec.ts` | Confirms grouping, type filter, drawer navigation, no-visible-cards state, no link-layer regression, and current deep-link route behavior. |

Static guard commands for implementation review:

```bash
rg -n -e 'bg-white|bg-\[#|text-\[#|border-\[#|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}' \
  packages/viewer/src/components/library/EngineLibraryView.tsx \
  packages/viewer/src/components/library/EngineCardDrawer.tsx \
  packages/viewer/src/components/library/TypeLegend.tsx \
  packages/viewer/src/components/library/TypeSwatch.tsx \
  packages/viewer/src/components/library/engine-view-model.ts

rg -n -e 'font-mono' \
  packages/viewer/src/components/library/EngineLibraryView.tsx \
  packages/viewer/src/components/library/EngineCardDrawer.tsx \
  packages/viewer/src/components/library/TypeLegend.tsx \
  packages/viewer/src/components/library/TypeSwatch.tsx
```

The first command should return no disallowed light/arbitrary hex matches. The
second should return only the provenance source-ref list in
`EngineCardDrawer.tsx`.

## Visual Verification

This issue is visual, so deterministic tests are necessary but not sufficient.
After implementation:

- Start the viewer using the repo-standard viewer path, for example
  `ax start viewer` or the package dev server when appropriate.
- Open `/library/viewer/engine` against the Engine fixture or a populated local
  catalog.
- Capture and inspect desktop and mobile screenshots.
- Exercise:
  - default context grouping
  - group by Type, Altitude, and Status
  - type filter that leaves a zone with `0 visible`
  - drawer open/close
  - typed-link navigation from the drawer
  - metadata-issue warning state
  - no-product-cards empty state
- Confirm the surface is dark, type/zone colors remain distinguishable, text
  is legible, controls do not overlap, and the sticky bottom drawer does not
  obscure content incoherently on mobile.

## Affected Behavior Surfaces

| Surface | Behavior change | Downstream docs/tests/evals |
| --- | --- | --- |
| Viewer Engine UI | Visual theme and typography only. Data projection, grouping, filtering, route behavior, and drawer navigation remain the same. | Viewer unit/build/browser/Storybook verification listed above. |
| Shared type swatch/legend | The shared type palette renders dark-safe colors. This may visually affect any consumer of `TypeSwatch`, but no other consumer files are edited. | Full viewer unit suite and visual check of Engine stories. |
| Agents | None. | None. |
| Skills | None. | None. |
| Templates/workflows | None. | None. |
| CLI/runtime/API | None. | None. |

## Eval Impact

No eval-harness rerun is required for this slice. The change does not alter
product-facing agents, skills, templates, guided play behavior, plugin
workflows, CLI behavior, runtime contracts, or eval cases. The quality gate is
the deterministic Viewer test/build/browser matrix plus visual screenshot
inspection.

No plugin validation is required because `packages/alexandria-plugin` is not
touched.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Per-type color coding could be flattened by overusing only the small semantic token set. | Preserve all current fourteen descriptors plus `UNKNOWN_TYPE`; add named `--viewer-engine-type-*` tokens if needed and verify legend, filter buttons, and card icons against the current type set. |
| Context-zone colors could become too subtle on the dark canvas. | Use translucent dark-safe tints with visible borders and accents; inspect context grouping and type grouping screenshots. |
| Adding palette values directly to TSX/model files could recreate the hardcoded-palette problem with different literals. | Put genuinely new color values in `--viewer-*` tokens and reference them from descriptors/classes; keep the five primary files free of arbitrary hex classes and color literals. |
| Reusing `.raven-kb-*` classes wholesale could impose layout rules that do not fit the absolute-positioned Engine board or sticky bottom drawer. | Use those classes where the shape fits; otherwise use the same tokens with local Tailwind layout classes while preserving existing board dimensions. |
| `TypeSwatch` is shared outside Engine View, so a swatch reskin could make Empty Library or Constellation chips less legible. | Do not edit those files, but run the full viewer unit suite and keep the swatch simple: descriptor background plus border/accent that works on both dark panels and mixed contexts. |
| The issue text says `/library` is Engine, but current main routes `/library` to Index. | Treat this as a known product-text drift. Do not change routing in this issue; verify the current Engine route `/library/viewer/engine` and note any route request as a separate follow-up. |
| `font-mono` cleanup could remove monospace from actual source refs. | Keep monospace only on provenance source-ref list items; use the static `font-mono` guard after implementation. |
| Light warning or empty boxes could remain in rare states. | Explicitly test/render metadata-issue and no-product-cards states and apply etched-note dark treatments to both branches. |
| Data test ids could be changed accidentally during class rewrites. | Use a before/after search and rely on existing Playwright selectors for `engine-*`, `type-legend*`, and drawer-link ids. |

## Acceptance And Exit Criteria

1. The Engine View root renders on dark viewer ground wherever the Engine route
   is mounted.
2. `EngineLibraryView.tsx`, `EngineCardDrawer.tsx`, `TypeLegend.tsx`, and
   `TypeSwatch.tsx` contain no `bg-white`, light `bg-[#f...]` or
   `bg-[#fff...]` classes, and no equivalent light inline fill.
3. The five primary files contain no new arbitrary hex classes
   (`bg-[#...]`, `text-[#...]`, `border-[#...]`) and no six/eight-digit color
   hex literals in style data.
4. `ENGINE_TYPE_ICON_SET` and `UNKNOWN_TYPE` keep their keys, labels,
   definitions, icons, order, and taxonomy coverage, but no longer use the old
   light palette values.
5. All current type descriptors, currently fourteen ruled categories plus
   Unknown, remain visually distinguishable in the legend, type filter, and
   card icons.
6. Context, type, altitude, and status grouping behavior is unchanged.
7. The type filter behavior is unchanged, including the "no visible cards in
   this zone" state.
8. Drawer open/close and typed-link navigation behavior is unchanged.
9. `confidenceClass()` still returns three visually distinct treatments for
   `high`, `medium`, and `low`, sourced from
   `--viewer-canvas-success`, `--viewer-canvas-amber`, and
   `--viewer-canvas-danger`.
10. The projected-metadata warning and no-product-cards empty state render as
    dark warning/empty treatments, not light boxes.
11. `font-mono` appears only on the provenance source-ref list in these four
    TSX files. Existing `font-display` headings remain display type.
12. All existing issue-listed test ids remain unchanged:
    `engine-library-view`, `engine-zone-*`, `engine-card-*`,
    `engine-card-icon-*`, `engine-type-filter-*`, `engine-group-by-*`,
    `engine-card-drawer`, `engine-drawer-link-*`, `type-legend`, and
    `type-legend-item-*`.
13. The named Storybook stories still mount without story logic changes:
    `MultiContext`, `DenseContext`, `SurfaceFilter`, and `UnfiledZone`.
14. `engine-view-model.test.ts`, `TypeLegend.test.tsx`,
    `EngineCardDrawer.test.tsx`, and
    `packages/viewer/tests/library-browser.spec.ts` pass without assertion
    changes.
15. Desktop and mobile screenshots of the running Engine route show a dark,
    legible, on-brand surface with no incoherent overlaps.

## Deferred Follow-Ups

- Resolve product copy/route drift around whether `/library` should land on
  Index or Engine. That is route policy and is intentionally out of scope for
  issue #659.
- Apply the same canonical dark-theme alignment to other Library surfaces
  named in the broader brand-alignment effort: Empty Library, Drafts, Notepad,
  Constellation, and any remaining light pockets.
- Consider extracting shared dark Library control/button classes if subsequent
  Library bricks repeat the same tokenized controls.
- Add a visual regression screenshot assertion only if the repo adopts a stable
  image-diff workflow; for this slice, existing Playwright screenshots plus
  human inspection are the visual gate.
