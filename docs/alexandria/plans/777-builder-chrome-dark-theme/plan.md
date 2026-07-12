# Issue 777 Technical Plan - Builder Chrome Dark Theme Reskin

**Status:** Ready for implementation planning (2026-07-09)

**Issue:** `GetAlexandria/alexandria-internal#777` - Re-skin the Builder
chrome - Drafts, Notepad, bundle selector - onto the canonical dark theme.

**Blocked by:** `#776`

**Blocks:** none

**Linked product plan:** none. The GitHub issue body is the product-level
source for this slice.

## Goal

Re-skin the Builder-specific Library chrome so the Builder section reads as the
same canonical dark Alexandria product surface as the viewer reading body:

- `/library/builder/alexandria-back`
- `/library/builder/alexandria-drafts`
- `/library/builder/empty`
- `/library/builder/notepad`

This is a styling-only slice. Draft-log reading, catalog requests, routing,
bundle selection semantics, Notepad filtering, peek behavior, component props,
and existing `data-testid` values must not change.

## Sources Checked

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- `skills/maintainer/technical-planning/plan-template.md`
- `packages/viewer/README.md`
- `EVALS.md`
- GitHub issue `#777` body provided in the stage prompt
- GitHub issue `#777` comments via connector:
  - one comment only, "Fabro local run submitted" for run
    `01KX4EQB3WJK7V8VR8PT1P6944`; no added product constraints
- Blocking and precedent plans:
  - `docs/alexandria/plans/776-library-reading-body-dark-theme/plan.md`
  - `docs/alexandria/plans/659-engine-view-dark-theme/plan.md`
- Current HEAD context:
  - `afe02b2` is `origin/main` and includes merge PR `#780`, the `#776`
    implementation run
  - the `#776` reading-body files now contain `--viewer-*` dark token usage
    and no longer show the old light roots in the targeted preflight search
- Theme and reference surfaces:
  - `packages/viewer/src/styles/global.css`
  - `packages/viewer/src/components/library/RavenKnowledgeBankStatus.tsx`
- Current implementation surface:
  - `packages/viewer/src/components/library/DraftsView.tsx`
  - `packages/viewer/src/components/library/DraftOverlayViews.tsx`
  - `packages/viewer/src/components/library/NotepadView.tsx`
  - `packages/viewer/src/components/library/BuilderNotepadView.tsx`
  - `packages/viewer/src/components/library/BuilderBundleSelector.tsx`
  - `packages/viewer/src/components/library/notepad-view-model.ts`
  - `packages/viewer/src/components/library/LibraryBrowserShell.tsx`
  - `packages/viewer/src/components/library/LibraryBrowserApp.tsx`
- Current tests:
  - `packages/viewer/src/components/library/DraftsView.test.tsx`
  - `packages/viewer/src/components/library/NotepadView.test.tsx`
  - `packages/viewer/src/components/library/notepad-view-model.test.ts`
  - `packages/viewer/src/components/library/BuilderBundleSelector.test.tsx`
  - `packages/viewer/src/components/library/LibraryBrowserApp.test.tsx`
  - `packages/viewer/tests/library-browser.spec.ts`

No `packages/viewer/CLAUDE.md` exists in this checkout, so
`packages/viewer/README.md` is the package-local guidance for this slice.

## Scope

- Re-skin the five Builder chrome files named by the issue:
  - `packages/viewer/src/components/library/DraftsView.tsx`
  - `packages/viewer/src/components/library/DraftOverlayViews.tsx`
  - `packages/viewer/src/components/library/NotepadView.tsx`
  - `packages/viewer/src/components/library/BuilderNotepadView.tsx`
  - `packages/viewer/src/components/library/BuilderBundleSelector.tsx`
- Re-skin the Notepad's shared visual class helpers only as needed:
  - `packages/viewer/src/components/library/notepad-view-model.ts`
- Conditional theme-token files:
  - `packages/viewer/src/styles/global.css`
  - `packages/pms/viewer/src/styles/global.css`, only if viewer token changes
    are genuinely required
- Use the existing dark vocabulary first:
  - `--viewer-canvas-bg`
  - `--viewer-canvas-fg`
  - `--viewer-canvas-fg-bright`
  - `--viewer-canvas-fg-dim`
  - `--viewer-canvas-fg-dimmer`
  - `--viewer-canvas-slate`
  - `--viewer-canvas-slate-2`
  - `--viewer-canvas-slate-3`
  - `--viewer-canvas-rule`
  - `--viewer-canvas-panel-bd`
  - `--viewer-canvas-success`
  - `--viewer-canvas-amber`
  - `--viewer-canvas-amber-dim`
  - `--viewer-canvas-amber-glow`
  - `--viewer-canvas-danger`
  - `--viewer-raven-core`
  - `--viewer-raven-core-soft`
  - existing `--viewer-engine-*` type and confidence tokens where Notepad type
    chips already depend on the Engine descriptor palette
  - `.raven-canvas-section`
  - `.raven-slate-card`
  - `.raven-kb-*`
  - `.raven-etched-note`
  - `.raven-etched-note-danger`
  - `.raven-status-pip*`
- Preserve all exported function and component signatures.
- Preserve every existing `data-testid`.
- Preserve per-status distinguishability for draft, ruling, readiness, thread,
  confidence, family, and concern/type accents.
- Preserve typography intent:
  - headings use `font-display`
  - labels, buttons, counts, filters, and ordinary UI copy use `font-sans`
  - `font-mono` is reserved for identifier/path/source-ref shaped content
    such as draft IDs, patch IDs, agenda/thread IDs, answer event IDs,
    bundle IDs when shown as bad input, paths, and source refs

## Non-Goals

- No route changes:
  - no `viewer-routes.ts` changes
  - no `library-mode-config.ts` changes
  - no route default, redirect, mode-tab, or history behavior changes
- No catalog, draft overlay, Notepad, bundle registry, or AX runtime data shape
  changes.
- No draft-log reading/writing changes and no overlay apply pipeline changes.
- No changes to the EL4 Confirm gate behavior or Ledger mutation behavior.
- No plugin, agent, skill, workflow, CLI, hosted-instance, or eval-harness
  behavior changes.
- No freehand edits under `docs/alexandria/library/`.
- No edits to the #776 reading-body files or already-dark Library surfaces:
  - `packages/viewer/src/components/library/EmptyLibraryView.tsx`
  - `packages/viewer/src/components/library/IndexView.tsx`
  - `packages/viewer/src/components/library/CatalogView.tsx`
  - `packages/viewer/src/components/library/WorkflowView.tsx`
  - `packages/viewer/src/components/library/PlaneSidebar.tsx`
  - `ConstellationView.tsx`
  - `FolderLibraryView.tsx`
  - `FolderStack.tsx`
  - `CardDrawer.tsx`
  - `LedgerView.tsx`
  - `PlaybookView.tsx`
  - Engine View files and type legend/swatch files
- No test rewrites to accommodate the reskin. The issue's named tests are
  regression signals and should pass unmodified.

## Linked Product-Plan Summary

There is no separate linked product plan. Issue `#777` is the product brief:
after `#776` darkened the shared reading body used by Index, Catalog, Workflow,
and Builder internals, the Builder wrapper chrome still showed the old light
parchment palette. The remaining work is to darken the Builder-specific chrome:
Drafts ledger cards, draft-overlay diagnostics/provenance blocks, Notepad
presence/thread panels, the Builder Notepad wrapper, and bundle selector/error
states.

The issue explicitly depends on `#776`. Current `main` includes the `#776`
implementation merge, so this plan is unblocked in this checkout. The
implementation stage should still start with a quick preflight because this
slice is only valid on top of the dark shared reading body.

## Current Gap

The shared Library body is now dark, but these Builder-specific surfaces still
carry hardcoded light palette and broad monospace typography:

- `DraftsView.tsx`
  - ruling/map/keystone panels use `bg-[#fffdf8]`, `bg-[#f5faf7]`,
    `bg-[#fbf9ff]`, `bg-white`, cream borders, and dark ink
  - drafted card and section headers use parchment panels
  - empty state uses `bg-[#fffdf8]`
  - `font-mono` is used for ordinary labels, headings, and status badges
- `DraftOverlayViews.tsx`
  - diagnostics and draft trail blocks use amber-on-cream panels
  - unresolved/invalid blocks do not use the dark etched warning treatment
  - `font-mono` wraps broad UI copy rather than only draft identifiers
- `NotepadView.tsx`
  - Presence and Threads sections use parchment cards, cream filter controls,
    light rows, and light concern chips
  - status/family/readiness/severity badges use light green/amber/wine fills
  - `font-mono` is used for labels, headings, filters, counts, and row chrome
- `BuilderNotepadView.tsx`
  - the standalone Builder Notepad root is still `bg-[#f3efe6] text-[#20242b]`
- `BuilderBundleSelector.tsx`
  - the selector strip is already dark-ish but uses arbitrary hex literals
    instead of the canonical `--viewer-*` tokens
  - unknown-bundle and unavailable-registry states still use light danger
    panels
  - headings use `font-mono`
- `notepad-view-model.ts`
  - `threadStatusClass`, `confidenceClass`, and legacy `roleStyle` branches
    return light class strings; those leak into `NotepadView` and any shared
    reading-body Notepad/peek usage of the same helpers

## Architectural Boundaries

- Keep this presentational. The implementation may change Tailwind class names
  and CSS variable references, but not data derivation, filtering, event
  handlers, route serialization, catalog request construction, or component
  state transitions.
- Keep component contracts unchanged:
  - `DraftsView({ catalog, emptyStatePatchLogPath })`
  - `DraftOverlaySummary({ catalog, className, hideWhenNoIssues })`
  - `DraftTrail({ card })`
  - `NotepadView({ catalog, cardsById, onSelectCard, onSelectThread })`
  - `BuilderNotepadView({ catalog, onOpenInCatalog })`
  - `BuilderBundleSelector({ bundles, onSelect, selectedBundleId, unknownBundleId })`
  - `BuilderUnknownBundleEmptyState({ bundleId })`
  - `BuilderRegistryUnavailable({ message })`
- Keep `notepad-view-model.ts` pure. Only the returned class strings may
  change; helpers such as `normalizedThreadStatus`, `threadStatusCounts`,
  `readinessAreaState`, and `notepadBadgeCountForCatalog` must remain
  behaviorally unchanged.
- Use existing CSS-variable Tailwind patterns from `EmptyLibraryView.tsx`, for
  example `bg-[color:var(--viewer-canvas-slate)]`,
  `border-[color:var(--viewer-canvas-rule)]`, and
  `text-[color:var(--viewer-canvas-fg-dim)]`.
- Avoid new dynamic arbitrary Tailwind strings unless they already exist and
  are known to work. Prefer static string literals for helper-returned badge
  classes so Tailwind can see them.
- Reuse `.raven-kb-band`, `.raven-slate-card`, `.raven-etched-note`, and
  `.raven-status-pip*` when their layout fits. If a global class carries grid,
  sticky, or sizing behavior that does not fit the local component, copy only
  the underlying token treatment through local Tailwind classes.
- Add no arbitrary hex literals in touched files. If a color cannot be
  represented by the existing tokens, add a small reusable `--viewer-*` token
  in `packages/viewer/src/styles/global.css` and mirror the same token in
  `packages/pms/viewer/src/styles/global.css`.
- Do not edit `@repos/` or import from vendored repositories.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Drafts ledger | `DraftsView.tsx` | Replace light ruling, card, section, map-delta, keystone, status, and empty-state treatments with dark viewer panels and semantic tokens. Preserve draft grouping, sorting, rendered copy, and test ids. |
| Draft overlay diagnostics and provenance | `DraftOverlayViews.tsx` | Replace cream diagnostics/trail blocks with dark etched note/provenance treatments. Invalid patches should use the danger treatment; unresolved updates should remain visually distinct from ordinary metadata. Preserve overlay counts, patch-log path display, and test ids. |
| Notepad panels and controls | `NotepadView.tsx` | Replace light Presence and Threads sheets, area cards, filter controls, thread rows, family/status/kind chips, concern chips, and empty state with dark surfaces. Preserve filters, click/keyboard thread opening, card concern selection, and test ids. |
| Notepad visual helpers | `notepad-view-model.ts` | Convert status, confidence, and legacy role class strings from light hardcoded colors to static CSS-variable classes using `--viewer-canvas-*` and existing `--viewer-engine-*` tokens. Preserve all helper return semantics except visual classes. |
| Builder Notepad wrapper | `BuilderNotepadView.tsx` | Replace the light wrapper root with a dark Builder section ground. Preserve peek wiring and "open in Catalog" behavior. |
| Bundle selector and Builder error states | `BuilderBundleSelector.tsx` | Replace arbitrary-hex selector strip with canonical dark control tokens. Convert unknown-bundle and registry-unavailable empty states to dark danger/etched treatments. Preserve controlled select behavior and option values. |
| Theme tokens, conditional | `packages/viewer/src/styles/global.css`, maybe `packages/pms/viewer/src/styles/global.css` | Add no tokens unless an existing semantic token cannot express a required distinct status. If added, keep the token reusable and mirror PMS. |
| Excluded shared reading body | `EmptyLibraryView.tsx`, `IndexView.tsx`, `CatalogView.tsx`, `WorkflowView.tsx`, `PlaneSidebar.tsx` | No file diff. These remain the already-dark `#776` surfaces. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Agents | None. | None. |
| Skills | None. | None. |
| Templates/workflows | None. | None. |
| CLI/runtime/API | None. | None. |
| Viewer UI | Visual theme and typography only for Builder chrome. | Viewer unit, check/build, browser, static no-light/no-hex guards, no-diff guard for excluded files, and visual screenshots listed below. |

## Implementation Steps

1. Preflight the branch.
   - Confirm `#776` is present by searching the reading-body files for the old
     light roots and by checking recent git history for the `#776` merge.
   - Confirm the worktree is clean or that any dirty files are unrelated user
     changes.
   - Record current `data-testid` strings in the in-scope files and treat them
     as immutable.

2. Establish reusable local class constants where they reduce repetition.
   - Prefer constants similar to `EmptyLibraryView.tsx`:
     panel, muted panel, label, heading, id text, success/amber/danger badge.
   - Keep constants in the local component file unless a value is already
     shared through `global.css`; do not create a new abstraction module for
     this visual-only slice.

3. Re-skin `DraftOverlayViews.tsx`.
   - Convert `DraftOverlaySummary` to a dark diagnostic block.
   - Use a danger treatment for invalid patches and an amber/review treatment
     for unresolved updates.
   - Convert `DraftTrail` to a dark provenance block with labels in `font-sans`
     and IDs/paths in `font-mono`.
   - Keep `testIdPart` and all rendered data unchanged.

4. Re-skin `DraftsView.tsx`.
   - Replace `DraftRuling`, `DraftCard`, and `DraftSectionView` cream panels
     with dark panel/band treatments.
   - Keep rulings, draft cards, confirmed sections, map deltas, and keystone
     drafts visually distinct using semantic dark tokens.
   - Use success token treatment for resolved/applied states and amber/review
     treatment for draft/ruling labels.
   - Move ordinary headings and labels off `font-mono`; keep IDs and source-like
     refs in `font-mono`.
   - Preserve draft ordering, grouping, empty-state copy, and all test ids.

5. Re-skin Notepad helpers and `NotepadView.tsx`.
   - Update `threadStatusClass`:
     - open -> danger token treatment
     - answered -> success token treatment
     - residual -> amber token treatment
     - unknown/default -> neutral token treatment
   - Update `confidenceClass` to reuse the same high/medium/low dark confidence
     classes already used by the #776 reading body.
   - Update legacy `roleStyle` special cases to CSS-variable classes without
     arbitrary hex; keep the default `typeDescriptor` branch intact unless it
     still emits light or uncompiled classes.
   - Replace Notepad section, area, filter, row, family, kind, concern, and
     empty-state classes with dark token classes.
   - Preserve filter state, derived counts, row click/keyboard handlers, and
     concern click behavior.

6. Re-skin Builder wrapper and selector states.
   - Change `BuilderNotepadView` root to the dark Builder section ground.
   - Convert `BuilderBundleSelector` label and select to canonical dark control
     tokens and `font-sans`.
   - Convert `BuilderUnknownBundleEmptyState` and
     `BuilderRegistryUnavailable` to dark danger/etched panels; show the bad
     bundle id as identifier-shaped content.
   - Preserve `value`, `onChange`, placeholder option, disabled option, and
     test ids.

7. Avoid token additions unless necessary.
   - If implementation can express all states through existing `--viewer-*`
     and `--viewer-engine-*` tokens, do not touch `global.css`.
   - If a new token is unavoidable, add it under the viewer token block, mirror
     the exact token addition in PMS `global.css`, and document why existing
     tokens were insufficient in the implementation handoff.

8. Run static and deterministic verification.
   - Run the focused unit tests first.
   - Run the full viewer test/check/build/browser matrix.
   - Run static searches for light backgrounds, arbitrary hex, broad
     `font-mono`, and no-diff scope boundaries.

9. Visually verify the running viewer.
   - Capture screenshots for desktop and mobile of:
     - `/library/builder/alexandria-back`
     - `/library/builder/alexandria-drafts` empty state
     - `/library/builder/alexandria-drafts` after fixture draft append
     - `/library/builder/notepad` with readiness fixture
     - `/library/builder/empty`
     - `/library/builder/alexandria-back?bundle=no-such-bundle`
   - Check that the bundle selector, Drafts ledger, draft overlay diagnostics,
     Notepad panels, and Builder error states are fully dark and readable.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Focused unit regressions | `pnpm --filter @alexandria/viewer exec bun test src/components/library/DraftsView.test.tsx src/components/library/NotepadView.test.tsx src/components/library/notepad-view-model.test.ts src/components/library/BuilderBundleSelector.test.tsx src/components/library/LibraryBrowserApp.test.tsx` | Covers Drafts rendering, Notepad rendering/helpers, bundle selector controlled behavior, bundle routing/request behavior, and Notepad badge behavior. |
| Full viewer unit suite | `pnpm --filter @alexandria/viewer run test` | Catches regressions in shared reading-body usage of Notepad helpers and Library app wiring. |
| Type/Astro check | `pnpm --filter @alexandria/viewer run check` | Verifies TypeScript/Astro integration after class/helper edits. |
| Static build | `pnpm --filter @alexandria/viewer run build` | Verifies Tailwind can see required classes and the static viewer build succeeds. |
| Browser regression | `pnpm --filter @alexandria/viewer exec playwright test tests/library-browser.spec.ts` | Exercises direct Builder routes, Drafts live refresh, Notepad thread open/peek/deep-dive, bundle selection, unknown bundle states, and Confirm behavior. |
| Formatting/diff hygiene | `git diff --check` | Catches whitespace and patch hygiene issues. |
| Light/hex static guard | `rg -n 'bg-white|bg-\[#f|bg-\[#F|#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{8}\b' packages/viewer/src/components/library/DraftsView.tsx packages/viewer/src/components/library/DraftOverlayViews.tsx packages/viewer/src/components/library/NotepadView.tsx packages/viewer/src/components/library/BuilderNotepadView.tsx packages/viewer/src/components/library/BuilderBundleSelector.tsx packages/viewer/src/components/library/notepad-view-model.ts` | Should return no matches after implementation. Guards against remaining light backgrounds and arbitrary hex in touched files. |
| Monospace review | `rg -n 'font-mono' packages/viewer/src/components/library/DraftsView.tsx packages/viewer/src/components/library/DraftOverlayViews.tsx packages/viewer/src/components/library/NotepadView.tsx packages/viewer/src/components/library/BuilderNotepadView.tsx packages/viewer/src/components/library/BuilderBundleSelector.tsx packages/viewer/src/components/library/notepad-view-model.ts` | Manually verify every remaining `font-mono` is identifier/path/source-ref shaped. |
| Scope fence | `git diff --exit-code -- packages/viewer/src/components/library/EmptyLibraryView.tsx packages/viewer/src/components/library/IndexView.tsx packages/viewer/src/components/library/CatalogView.tsx packages/viewer/src/components/library/WorkflowView.tsx packages/viewer/src/components/library/PlaneSidebar.tsx` | Enforces the negative acceptance criterion for #776 reading-body files. |
| Token mirror, conditional | If `packages/viewer/src/styles/global.css` changes, inspect and mirror the same `--viewer-*` additions in `packages/pms/viewer/src/styles/global.css`; otherwise run `git diff --exit-code -- packages/viewer/src/styles/global.css packages/pms/viewer/src/styles/global.css` if no token changes were intended. | Preserves viewer/PMS token parity and prevents accidental global theme drift. |
| Visual verification | Run the viewer (`ax start viewer` or the package dev server if the implementation environment uses it) and attach screenshots of the routes listed in Implementation Step 9. | The requested change is visual; screenshots catch mixed-light panels that unit tests do not assert. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Agents | No behavior change. | No eval rerun required. | None. |
| Skills | No behavior change. | No eval rerun required. | None. |
| CLI/runtime/API | No behavior change. | No eval rerun required. | None. |
| Viewer UI | Covered by deterministic viewer unit/browser/build checks, not the Claude eval harness. | Do not create or rerun eval cases for this visual-only slice. | Use the viewer verification matrix above. |

This slice does not modify product-facing reusable agents, skills, workflows,
or eval-backed behavior. `pnpm eval` is not required.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| `notepad-view-model.ts` is shared by Builder Notepad and the shared reading-body Notepad/peek usage, so helper class changes can alter already-dark #776 surfaces indirectly. | Keep changes to class strings only; run the full viewer unit suite and browser spec; run the no-diff guard for `EmptyLibraryView.tsx` and visually spot-check Notepad in both Builder and legacy shared-body contexts. |
| Reusing `.raven-kb-*` classes too literally could import layout constraints that do not fit the Drafts or Notepad grids. | Use `.raven-kb-*` classes only where their layout matches; otherwise reuse the same tokens directly through local Tailwind classes. |
| Tailwind may not generate classes hidden behind newly introduced dynamic arbitrary strings. | Prefer static string literals with `bg-[color:var(...)]`, `border-[color:var(...)]`, and `text-[color:var(...)]`; run the static build and inspect visual screenshots. |
| Removing broad `font-mono` could make true identifiers less scannable. | Run the `font-mono` search and manually confirm remaining monospace usage covers patch IDs, agenda/thread IDs, answer IDs, paths, bundle IDs, and source refs. |
| Visual-only tests can pass while a light panel remains on a less-common state such as unknown bundle, invalid patch, or no matching threads. | Include static no-light/no-hex searches and visual routes/states for unknown bundle, Drafts empty and populated, Notepad readiness, and thread empty/filter states. |
| Adding a new viewer token without PMS mirroring would break documented theme parity. | Avoid token additions; if one is unavoidable, mirror the token in PMS `global.css` in the same slice and include that in verification. |
| Scope creep into the already-dark reading body would blur the #776/#777 boundary. | Keep the explicit `git diff --exit-code` guard over `EmptyLibraryView.tsx`, `IndexView.tsx`, `CatalogView.tsx`, `WorkflowView.tsx`, and `PlaneSidebar.tsx`. |

## Acceptance / Exit Criteria

1. `/library/builder/alexandria-back`, `/library/builder/alexandria-drafts`,
   `/library/builder/empty`, and `/library/builder/notepad` render fully dark.
2. No `bg-white`, `bg-[#f...]`, or equivalent light parchment background
   remains in:
   - `DraftsView.tsx`
   - `DraftOverlayViews.tsx`
   - `NotepadView.tsx`
   - `BuilderNotepadView.tsx`
   - `BuilderBundleSelector.tsx`
3. No hardcoded arbitrary hex literals remain in the touched Builder chrome
   files or `notepad-view-model.ts`.
4. Draft status, ruling, map-delta, keystone, invalid patch, unresolved update,
   readiness, thread status, thread family, severity/confidence, and concern
   chips remain visually distinct on dark backgrounds.
5. Semantic status accents are sourced from `--viewer-canvas-success`,
   `--viewer-canvas-amber*`, `--viewer-canvas-danger`, neutral canvas tokens,
   or existing `--viewer-engine-*` type/confidence tokens.
6. `font-mono` appears only on identifier/path/source-ref shaped content in
   touched files.
7. All exported signatures are unchanged.
8. Every `data-testid` present before the slice is unchanged:
   - `builder-notepad-mode`
   - `builder-bundle-selector`
   - `builder-unknown-bundle`
   - `builder-registry-unavailable`
   - `draft-overlay-summary`
   - `draft-overlay-unresolved`
   - `draft-overlay-invalid`
   - `catalog-draft-trail-*`
   - `fill-readiness-view`
   - `fill-readiness-presence`
   - `fill-readiness-area-*`
   - `thread-worklist`
   - `thread-status-summary`
   - `thread-filter-status`
   - `thread-filter-family`
   - `thread-filter-kind`
   - `thread-filter-severity`
   - `thread-worklist-empty`
   - `thread-row-*`
   - `thread-status-*`
   - `drafts-ruling-*`
   - `drafts-card-*`
   - `drafts-section-*`
   - `drafts-section-*-summary`
   - `drafts-view`
   - `drafts-empty`
   - `drafts-empty-log-path`
   - `drafts-rulings`
9. Draft selection/display, overlay apply-state display, Notepad thread
   open/close, Notepad card/thread peek, "open in Catalog", and bundle
   switching behave exactly as before.
10. `EmptyLibraryView.tsx`, `IndexView.tsx`, `CatalogView.tsx`,
    `WorkflowView.tsx`, `PlaneSidebar.tsx`, and already-dark Library files have
    zero diff.
11. The issue's named tests pass unmodified:
    - `DraftsView.test.tsx`
    - `NotepadView.test.tsx`
    - `BuilderBundleSelector.test.tsx`
    - `LibraryBrowserApp.test.tsx`
    - `packages/viewer/tests/library-browser.spec.ts`
12. Additional helper coverage passes if `notepad-view-model.ts` is touched:
    - `notepad-view-model.test.ts`
13. Viewer `check`, `build`, full unit tests, static guards, and visual
    screenshots complete successfully.

## Deferred Follow-Ups

1. Add committed visual-regression assertions only if the project adopts a
   screenshot baseline workflow; for this slice, screenshots are verification
   evidence rather than new committed tests.
2. Consolidate repeated dark panel class constants across Library components
   only if future slices reveal meaningful duplication. Do not introduce that
   abstraction in this visual-only issue.
3. Consider a future cleanup of remaining legacy flat `/library/...` route
   comments after the route migration settles; route/comment cleanup is outside
   this styling slice.
