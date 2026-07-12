# GitHub Issue #200: FEAT-009 Raven Onboarding Visual Alignment

- Issue: GitHub #200, `[FEAT-009] Align Raven onboarding visuals with canvas prototype`
- Run ID: `01KSXFQHPQN0JGXRJPXRAESHWW`
- Product plan: `raven-onboarding-experience`
- Primary prototype source:
  `docs/alexandria/plans/canvas-library-spike/prototype/product-library/`
- Primary packages: `packages/viewer-next`
- Guardrail packages: `packages/ax-next`, `packages/alexandria-next-plugin`

## Source Context

This plan is based on the issue text supplied in the run prompt, the existing
Raven onboarding product and implementation plans, the canvas prototype visual
sources, the current Viewer Next implementation, and the restart scope steer
that the canvas spike is the visual source of truth rather than loose
inspiration. A live GitHub issue fetch was attempted, but the browser tool
returned no issue body and the local environment does not have `gh` installed,
so no additional issue comments were available during this planning pass.

Required repo guidance read for this plan:

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- `packages/ax-next/CLAUDE.md`
- `packages/ax-next/docs/cli-design-principles.md`
- `packages/alexandria-next-plugin/CLAUDE.md`
- `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md`
- `EVALS.md`
- `packages/viewer-next/README.md`

Prototype sources read for this plan:

- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/product-library-v0.1.html`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/vision-builder.html`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/css/raven.css`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/css/vision-onboarding.css`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/css/vision-builder.css`
- `docs/alexandria/plans/canvas-library-spike/prototype/docs/design/brand.md`
- `docs/alexandria/plans/canvas-library-spike/prototype/docs/design/canvas-patterns.md`

## Goal

Polish the already-landed Raven onboarding surfaces as a visual-only slice so
the visible production UI reads as a simplified version of the canvas
prototype, not as generic admin UI. The canvas spike is the source of truth for
visual language, and each changed surface should trace to actual prototype
files/selectors. Preserve the current production behavior: Home connection
state, the coin-attached Raven Quick Bar, manual Vision slot review,
one-at-a-time source intake, reducer-driven Vision state, and current
CLI/runtime contracts.

## Scope

In scope:

1. Viewer Next Home visual polish for the Raven connection CTA, status, warm
   canvas ground, and Raven coin treatment.
2. Raven Bench visual polish for the plinth, coin seats, locked seats, status
   line, and minimize affordance.
3. Raven Quick Bar visual and responsive polish so it remains attached to the
   Raven coin/bench and never clips off-screen at desktop or mobile widths.
4. Vision onboarding visual polish for the header, source intake, source strip,
   slot cards, slot editors, status pips, remote-update/conflict indicators,
   approve/skip controls, and Bank Vision control.
5. A small, durable Viewer Next visual vocabulary derived from
   `brand.md` and `canvas-patterns.md`, likely in
   `packages/viewer-next/src/styles/global.css` plus focused component usage.
6. Viewer tests and screenshot capture for Home, Quick Bar, Vision onboarding,
   and source intake at desktop and mobile widths.
7. Verification that this visual pass does not change AX2 state projection,
   ledger events, Vision reducer behavior, source item state, or plugin guided
   behavior.

Out of scope:

1. Alexandria 1 plugin, CLI, or viewer changes.
2. New AX2 commands, state schemas, reducer semantics, runtime routes, event
   types, ledger writes, source item fields, or config branches.
3. Raven guided play changes, skill changes, agent prompt changes, or eval case
   changes.
4. Reintroducing the prototype phase rail, source sliders, logo upload
   dependency, overlay-as-home navigation, one-source-per-line textarea, or
   Build/Tune/Approved slider model.
5. Knowledge Bank FEAT-008 behavior beyond preserving the current Quick Bar
   route if nearby styles are touched.
6. Writes to `docs/alexandria/library/`.

## Linked Product-Plan Summary

The Raven onboarding release plan keeps the useful prototype ideas - Raven's
coin, bottom agent shelf, Knowledge Bank progression, and slot-based Vision
builder - while removing confusing prototype-only mechanics: the phase rail,
overlay-as-home navigation, source sliders, and logo upload dependency.

FEAT-001 through FEAT-004 landed the simplified production behavior:

1. Home renders Raven connection state and routes connected users to Vision.
2. Raven's coin opens a Quick Bar from the bottom shelf without making Raven
   top-level navigation.
3. Vision onboarding renders nine reducer-backed slots with manual edit,
   approve, skip, reopen, and Bank Vision availability behavior.
4. Vision source intake creates shared source items one at a time and attaches
   them to Vision without changing slot state.

Issue #200 corrects visual drift in those landed surfaces. The production UI
should not merely share a palette with the prototype. Every visible element
introduced or changed by this polish should have a clear prototype-derived
basis, or the implementation result should name why production intentionally
simplifies the prototype.

## Current Implementation Gap

Current Viewer Next files already contain many prototype cues:

- `AlexandriaHome.tsx` uses a warm dark ground, Raven coin assets, and a bottom
  agent bench.
- `RavenBench.tsx` uses prototype Raven coin assets, brass name plates, locked
  coin seats, and a fixed bottom plinth.
- `VisionOnboardingView.tsx` has a top source area, Raven coin cue, source
  chips, status dots, nine slots, and no source sliders or one-per-line source
  textarea.
- `global.css` already carries some canvas stone-top-bar and agent-bench
  vocabulary.

The gaps are visual-system consistency and responsive polish:

1. Home status and CTA styling still rely on large filled state treatments,
   especially teal connected states, instead of the prototype's compact
   slate-pip status and amber button hierarchy.
2. The Quick Bar is an absolute mini dialog above the Raven seat. It can read
   as a floating modal and needs viewport clamping or a tray-style anchored
   layout to avoid clipping at narrow widths.
3. Vision slot cards use a three-column admin-card rhythm with large status
   badges and textarea tiles. They need to feel like simplified
   `vision-builder.css` section cards: slate cards, amber number pips,
   inset editors, compact status pips, and quiet/ghost/primary controls.
4. Source intake is close to the prototype but still mixes ordinary form
   controls with prototype elements. Mode controls, dropzone, source cards, and
   source status should map more directly to the source-review language in
   `vision-builder.css`.
5. Several visible states use large filled pills where the prototype rule says
   status should be carried by a compact dot inside a slate pill.
6. Hardcoded color and font decisions are spread across component Tailwind
   class strings, making future prototype drift likely.

## Prototype-Derived Visual Contract

Use these prototype patterns as the source of truth for changed elements. This
is a traceability requirement, not a loose mood board: the implementation
should be able to point each changed visual element back to a prototype
file/selector or to one of the explicit production simplifications below.

| Production element | Prototype basis | Production rule |
|--------------------|-----------------|-----------------|
| Page ground | `brand.md` warm-walnut canvas tokens and `product-library-v0.1.html` smart-wall bed | Keep warm dark walnut/canvas backgrounds; avoid generic gray admin surfaces |
| Raised panels | `canvas-patterns.md` `.tfs-card`, `vision-builder.css` `.vb-section` and `.vb-sources` | Use slate plates/cards with amber-tinted borders and small radii |
| Primary action | `canvas-patterns.md` `.tfs-btn-primary`, `vision-builder.css` `.vb-bank-btn` and `.vb-sources-hand` | One amber primary per local surface; slate text on amber fill |
| Secondary action | `canvas-patterns.md` `.tfs-btn-ghost` | Amber outline/transparent fill for secondary actions |
| Utility action | `canvas-patterns.md` `.tfs-btn-quiet` | Quiet slate/amber outline for skip, close, and card utilities |
| Status | `canvas-patterns.md` status pip and `vision-builder.css` progress chips | Compact slate pill with dot color carrying state; avoid large filled status badges |
| Raven coin | `raven.css` coin slot, medallion, lit layer, and coin state vocabulary | Keep Raven image assets and coin-slot material; connection/open/review states glow rather than becoming flat buttons |
| Bench | `raven.css` five-seat stone plinth and brass role plates | Preserve the bottom plinth/seat metaphor and locked future teammates |
| Quick Bar | `raven.css` `#raven-tray-zone` and `.raven-sub-btn` | Attach actions to the Raven seat/tray, not to the page center as a modal |
| Source intake | `vision-builder.css` `.vb-sources`, `.vb-source-chip`, `.vb-sources-hand` | One-at-a-time production intake styled as a simplified source-review band |
| Slot review | `vision-builder.css` `.vb-section`, `.vb-sec-num`, `.vb-input`, `.vb-scratch`, remote flash | Keep production statuses but restyle each slot as a prototype section card |
| Embedded Vision | `vision-onboarding.css` Vision takeover rules | Vision should feel like a focused builder in the canvas with the bench still present |

## Required Prototype Selector Mapping

Implementation should map the production surfaces below to these prototype
files/selectors. It may rename classes in production, but the visible result
should preserve the prototype material, spacing, and hierarchy unless the
production simplification is named here.

| Production surface | Prototype files/selectors to mirror | Production files / expected translation |
|--------------------|-------------------------------------|-----------------------------------------|
| Home canvas ground | `product-library-v0.1.html` canvas root tokens and canvas bed, `brand.md` warm-walnut interpretation, `canvas-patterns.md` `.tfs-plate` / `.tfs-card` | `AlexandriaHome.tsx`, `LibraryBrowserShell.tsx`, `global.css`; use warm walnut/dark canvas ground and slate plates, not a generic hero or admin card surface |
| Home Raven coin | `raven.css` `.raven-coin-slot`, `#raven-coin`, `.raven-medallion`, `.raven-img-unlit`, `.raven-img-lit`, coin glow states under `#raven-coin[data-state="..."]` | `AlexandriaHome.tsx`, `RavenBench.tsx`; keep Raven assets inside a stone coin setting and express connected/open/review states through glow and lit image layers |
| Agent bench | `raven.css` `#raven-bench`, `#raven-plinth`, `.bench-seat`, `.bench-seat-raven`, `.raven-coin-plate`, `.bench-role-plate`, `.bench-raven-plate`, `.bench-status-line`, `.bench-minimize-btn` | `RavenBench.tsx`, `global.css`; preserve bottom stone plinth, brass role plates, locked future teammate seats, and a compact bench status/minimize affordance |
| Raven Quick Bar | `raven.css` `#raven-tray-zone`, `#raven-sub-buttons`, `.raven-sub-btn`, `.raven-sub-btn-action` | `RavenBench.tsx`, optionally `RavenQuickBar.tsx`; actions should visually rise from or attach to the Raven seat/tray, not appear as a centered modal or unrelated dialog |
| Vision builder shell | `vision-onboarding.css` `body.vision-embedded`, `#tfs-body.has-vision-embed`, `.vision-embed-frame`, `.vision-embed-back`; `vision-builder.css` `.vb-wrap`, `.vb-header`, `.vb-title-block`, `.vb-progress`, `.vb-prog-chip` | `VisionOnboardingView.tsx`; present Vision as a focused canvas builder with compact progress/status, while production keeps the current route instead of an iframe embed |
| Vision slot review | `vision-builder.css` `.vb-section`, `.vb-section.is-approved`, `.vb-sec-head`, `.vb-sec-num`, `.vb-sec-title-block`, `.vb-sec-title`, `.vb-sec-subtitle`, `.vb-input`, `.vb-belowbar`, `.vb-saved-flash`, `@keyframes vb-remote-write-flash` | `VisionOnboardingView.tsx`; restyle slots as slate section cards with amber number pips, inset editors, compact status pips, quiet controls, and subtle remote-update/approved states |
| Source intake | `vision-builder.css` `.vb-sources`, `.vb-sources-head`, `.vb-sources-title`, `.vb-sources-eyebrow`, `.vb-sources-sub`, `.vb-sources-row`, `.vb-source-chip`, `.vb-sources-hand`, `.vb-sources-status`; `canvas-patterns.md` dropzone and button hierarchy | `VisionOnboardingView.tsx`; preserve file/URL/note one-at-a-time intake while styling it as a source-review band with stone/ghost mode controls, amber primary add, source chips/cards, and compact status pips |
| Buttons and status | `canvas-patterns.md` `.tfs-btn-primary`, `.tfs-btn-ghost`, `.tfs-btn-quiet`, `#live-pip` style, `.tfs-label`, `.welcome-cta`; `vision-builder.css` `.vb-bank-btn`, `.vb-utility-link` | Shared Viewer classes in `global.css` plus component usage; primary/secondary/utility hierarchy and compact dot-driven status should replace large filled state badges where applicable |

Selectors that must not be restored in production:

1. `#phase-rail` and phase-step navigation as the onboarding spine.
2. `vision-builder.css` `.vb-slider`, `.vb-slider-block`, and
   Build/Tune/Approved slider state controls.
3. Prototype logo-drop dependency selectors such as the Vision onboarding
   `body[data-step="1.1"]` logo drop target as a required start step.
4. Overlay-as-home behavior from `#raven-surface-overlay`.
5. One-source-per-line source textarea behavior from the prototype source
   input.

Production simplifications that should stay explicit:

1. No phase rail: production uses Home plus the agent shelf because Raven is not
   top-level app navigation.
2. No source sliders: production source intake creates durable shared source
   items one at a time.
3. No logo upload dependency: Raven onboarding starts from connection and Vision
   state, not a logo drop requirement.
4. No overlay-as-home behavior: Quick Bar is transient; Home/Library state stays
   stable.
5. No Build/Tune/Approved slider: production reducer statuses are
   `empty`, `needs_review`, `approved`, and `skipped`. The UI should translate
   those statuses into prototype-derived compact pips, not restore sliders.
6. Textareas remain because manual slot editing is a production requirement,
   but they should be styled as inset slate editors inside slot-review cards.

## Architectural Boundaries

Viewer Next owns this visual polish. The work should stay in visual components,
component-local helpers, Viewer Next styles, stories, and Viewer Next tests.
No AX2 implementation file should be edited for this ticket as scoped.

AX2 owns deterministic runtime state, ledger, source items, and Vision reducer
semantics. This ticket should not change AX2 implementation files except if a
test command needs no-op fixture adjustment. Existing AX2 tests should continue
to pass unchanged.

The Alexandria Next plugin owns guided play behavior. This ticket should not
change plugin skills or agents. If implementation unexpectedly touches
`packages/alexandria-next-plugin`, run plugin validation and revise the eval
impact section before merge.

Effect remains at Viewer runtime boundaries only. Pure visual components should
receive ordinary props and callbacks; they should not introduce Effect code.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Viewer visual tokens/classes | `packages/viewer-next/src/styles/global.css`, possibly `tailwind.config.mjs` and package font imports | Add prototype-derived Raven/canvas utility classes or tokens for slate cards, pips, buttons, source chips, and slot cards |
| Viewer Home | `packages/viewer-next/src/components/library/AlexandriaHome.tsx` | Visual-only polish for ground, connection pip, CTA hierarchy, Raven coin setting, error note |
| Raven Bench and Quick Bar | `packages/viewer-next/src/components/library/RavenBench.tsx`, optionally a new nearby `RavenQuickBar.tsx` | Visual-only polish; Quick Bar remains coin-attached, close/outside/Escape behavior unchanged, viewport clipping fixed |
| Vision onboarding | `packages/viewer-next/src/components/library/VisionOnboardingView.tsx`, optionally small nearby presentational helpers | Restyle source band, source strip, slot-review cards, status pips, editor surfaces, and controls while preserving runtime calls |
| Knowledge Bank status | No change expected; `RavenKnowledgeBankStatus.tsx` only if shared status/control classes require a small consistency pass | Preserve current navigation and status behavior |
| Viewer tests | `packages/viewer-next/tests/library-browser.spec.ts`, `packages/viewer-next/tests/serve-viewer-fixture.ts` only if screenshot fixtures need support | Add responsive and visual-contract assertions plus screenshot capture |
| Viewer stories | `packages/viewer-next/src/components/library/*.stories.tsx` | Add or update connected/disconnected, Quick Bar, and Vision states if useful for review |
| AX2 runtime/CLI | No implementation files expected | No behavior change; rerun existing tests and inspect state for guardrail verification |
| Next plugin | No files expected | No guided behavior change; validation only if touched |

## Affected Behavior Surfaces

| Surface | Behavior shift | Downstream docs/tests/evals |
|---------|----------------|-----------------------------|
| Viewer user behavior | Raven onboarding reads as a prototype-derived canvas workflow across Home, bench, Quick Bar, source intake, and Vision slot review | Extend Viewer Playwright coverage and screenshot capture |
| AX2 CLI/runtime | No intended behavior shift | Rerun existing state, Raven Vision, runtime, and CLI tests as guardrails |
| Alexandria Next plugin skills | No intended behavior shift | No eval rerun or plugin validation unless plugin files are touched |
| Reusable agents/skills/templates | None | No eval-harness coverage required for this slice |

## Implementation Plan

1. Add a small Raven/canvas visual vocabulary in Viewer Next styles.
   Define reusable classes or CSS variables for warm walnut page ground, slate
   card, amber primary pill, amber ghost pill, quiet utility pill, compact
   status pip, source chip, and slot section. Prefer prototype token names and
   values from `brand.md`, `canvas-patterns.md`, `raven.css`, and
   `vision-builder.css`, and keep the selector mapping above visible in code
   review notes. Add an Inter font import/dependency if needed so body controls
   can use the prototype Inter/Cormorant split instead of relying on a system
   fallback.

2. Polish Home without changing routing.
   Keep `Connect Raven` and `Power up Raven: Vision` behavior unchanged. Restyle
   status as a compact slate pip with a dot, use amber primary/ghost hierarchy
   for the CTA, keep the Raven coin image treatment, and ensure the first screen
   stays warm-canvas rather than a generic hero/card layout.

3. Polish Raven Bench and extract Quick Bar if it reduces complexity.
   Preserve localStorage minimize behavior, locked-seat interactions,
   click-outside close, Escape close, and Knowledge Bank routing. Make the
   Quick Bar visually rise from or attach to the Raven seat using the prototype
   tray/sub-button language. Add viewport clamping or responsive placement so
   the Quick Bar bounding box stays inside the viewport on desktop and mobile.

4. Restyle source intake as a source-review band.
   Keep file, URL, and typed-note one-at-a-time modes. Restyle the mode controls
   as stone/ghost segmented controls, the file dropzone as the amber dashed
   dropzone pattern, the add action as the single local primary button, source
   rows as `vb-source-chip`-derived chips/cards, and source statuses as compact
   pips. Do not add sliders or a one-per-line textarea.

5. Restyle Vision slots as prototype slot-review cards.
   Keep all nine runtime-manifest slots, current autosave behavior,
   approve/skip behavior, conflict handling, and remote flash timing. Change the
   visual structure toward `vision-builder.css`: slate section cards, amber
   number pips, compact status pip in the header, helper copy as muted review
   prompt, inset slate editor, quiet utility controls, and subtle approved or
   remote-update borders.

6. Apply prototype button hierarchy consistently.
   `Bank Vision` is the page-level primary action when available. Source Add is
   the source-band primary. Approve should be the slot-local positive action but
   not a large competing filled teal button; use ghost/quiet hierarchy plus
   status pip feedback. Skip is quiet utility. Close is quiet utility.

7. Tighten responsive layout.
   Verify no text overlap or overflow at representative desktop and mobile
   widths. Prefer stable dimensions, `minmax(0, 1fr)`, `overflow-hidden`,
   `text-overflow`, and wrapping where needed. Quick Bar should remain attached
   to Raven's affordance while fitting small screens.

8. Update tests for visual contracts without overfitting pixels.
   Extend Playwright tests to assert no forbidden controls, compact pip shapes,
   button hierarchy, slot card material, and Quick Bar viewport bounds. Capture
   desktop and mobile screenshots for Home, Quick Bar, Vision onboarding, and
   source intake.

9. Run guardrail verification.
   Run Viewer type/static checks, runtime client tests, and e2e tests. Run
   existing AX2 Raven Vision/state/runtime/CLI tests to prove state output and
   reducer behavior did not change. Compare `ax2 inspect state --json` and
   ledger event counts before and after visual-only Viewer interactions when
   using a local project.

## Deterministic Verification

Automated verification:

| Area | Command | Purpose |
|------|---------|---------|
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro/React/TypeScript and class usage drift |
| Viewer runtime client | `cd packages/viewer-next && pnpm run test` | Confirms runtime client behavior remains unchanged |
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Covers Home, Quick Bar, Vision onboarding, source intake, responsive bounds, and screenshots |
| AX2 Vision reducer | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Proves slot/source reducer semantics remain unchanged |
| AX2 state projection | `cd packages/ax-next && bun test tests/state.test.ts` | Proves `ax2 inspect state --json` output fields remain stable |
| AX2 runtime APIs | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves runtime endpoints used by Viewer still behave |
| AX2 CLI black-box | `cd packages/ax-next && bun test tests/cli.test.ts` | Guardrail for stable CLI exit/output behavior |
| Plugin validation | `cd packages/alexandria-next-plugin && claude plugin validate .` only if plugin files change | Required only for unexpected plugin package changes |

Playwright additions should include:

1. Desktop Home screenshot with Raven bench visible.
2. Mobile Home screenshot with Raven bench visible and no text overlap.
3. Desktop Quick Bar screenshot after opening from the Raven coin.
4. Mobile Quick Bar screenshot after opening from the Raven coin.
5. Desktop Vision onboarding screenshot with source intake and slots visible.
6. Mobile Vision onboarding screenshot with source intake and a slot card
   visible.
7. Desktop source intake screenshot after at least one attached source is
   present.
8. Mobile source intake screenshot after at least one attached source is
   present.
9. Bounding-box assertions that `raven-quick-bar` has `x >= 0`,
   `x + width <= viewportWidth`, `y >= 0`, and
   `y + height <= viewportHeight` for tested viewports.
10. Assertions that the Vision view still has no phase rail, no source sliders,
   and no one-source-per-line source textarea.
11. Assertions that status elements use compact dot/pip styling rather than
   large filled state pills where applicable.

Manual verification:

1. Compare Home against the canvas prototype and verify warm canvas, Raven
   coin, connected glow, CTA hierarchy, compact status, and bottom bench.
2. Open Raven Quick Bar from the coin on desktop and mobile; verify it is not
   clipped and remains visually attached to the bench affordance.
3. Open Vision onboarding and compare slot cards against
   `vision-builder.html` / `vision-builder.css`.
4. Add file, URL, and note sources; verify the source band and source strip
   look prototype-derived and the flow remains one source at a time.
5. Run `ax2 inspect state --json` before and after opening/closing Home,
   Quick Bar, and visual-only navigation; verify no visual action changes
   Raven onboarding state or ledger-derived fields.
6. Record the ledger event count before and after the same visual-only actions;
   verify it is unchanged. Source intake may still emit its already-existing
   source events when the user intentionally adds a source, but this ticket must
   not add or reshape those events.

## Eval Impact

No eval-harness rerun is required as scoped. This ticket changes deterministic
Viewer Next presentation and browser tests, not reusable agent behavior, plugin
skills, guided Raven play behavior, or eval-backed prompt surfaces.

If implementation unexpectedly changes files under
`packages/alexandria-next-plugin/skills`, `packages/alexandria-next-plugin/agents`,
or another reusable guided behavior surface, revise this section before merge,
run `claude plugin validate ./packages/alexandria-next-plugin`, and use
`EVALS.md` to choose the smallest honest eval rerun set.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Implementation treats the canvas spike as loose inspiration | Require selector-level traceability using the mapping in this plan and document any production simplification in the implementation result |
| Visual polish accidentally changes Raven reducer, source, or ledger semantics | Keep implementation in Viewer Next presentation files; run AX2 guardrail tests and before/after `ax2 inspect state --json` |
| Quick Bar still reads as a modal | Anchor it to the Raven seat/tray, use prototype stone-sub-button language, and test Home/Library state stability |
| Quick Bar clips on small screens | Add viewport-aware placement and Playwright bounding-box assertions for desktop and mobile |
| Slot cards remain generic textarea tiles | Use `vision-builder.css` section-card structure: number pip, slate card, inset editor, compact status pip, quiet controls |
| Status indicators become noisy competing fills | Centralize compact status pip styling and use dot color for state |
| Prototype controls are reintroduced too literally | Keep explicit non-goals in tests: no phase rail, no source sliders, no logo upload dependency, no overlay-as-home |
| Adding shared styles causes broad visual regressions | Scope classes to Raven/Vision surfaces and avoid rewriting unrelated Library surfaces |
| Font alignment causes dependency churn | Add Inter deliberately for Viewer Next if needed, and keep package/version changes limited to the viewer package |
| Screenshots become brittle | Use screenshots as review artifacts; keep automated assertions focused on layout bounds and semantic visual contracts |

## Acceptance Criteria

1. Home, Raven Bench, Raven Quick Bar, and Vision onboarding use the prototype
   visual vocabulary consistently: warm-walnut/dark canvas, slate plates/cards,
   amber/gold stone controls, Raven coin states, compact status pips, and
   prototype-derived spacing/type/color.
2. Every visible UI element introduced or changed by this polish has a clear
   prototype-derived basis documented in this plan or in the implementation
   result.
3. Any production simplification from the prototype is explicitly justified by
   the production behavior: no phase rail, no source sliders, no logo upload,
   no overlay-as-home, no Build/Tune slider, text editors remain for manual
   review.
4. Raven Quick Bar does not clip off-screen at tested desktop or mobile widths.
5. Raven Quick Bar remains visually attached to the Raven coin/bench affordance
   and does not read as an unrelated modal.
6. Vision slot cards read as simplified prototype slot-review elements, not
   generic admin cards or textarea tiles.
7. Source intake and source strip retain the one-at-a-time production flow while
   using prototype source-review styling.
8. Primary, secondary, and utility controls follow the prototype button
   hierarchy where applicable.
9. Status styling uses compact pips/dots instead of large competing filled
   pills where applicable.
10. The UI remains responsive with no text overlap or overflow at desktop and
    mobile widths covered by tests.
11. No phase rail, source sliders, logo upload step, one-source-per-line
    textarea, or overlay-as-home behavior is added.
12. `ax2 inspect state --json` output, Raven Vision reducer semantics, source
    item state, ledger events, and plugin guided behavior are unchanged.
13. Desktop and mobile screenshots are captured for Home, Quick Bar, Vision
    onboarding, and source intake.

## Deferred Follow-Ups

1. FEAT-005 and later Raven slot collaboration visuals if new Raven-authored
   states need additional animation or attribution.
2. FEAT-007/FEAT-008 banking and Knowledge Bank visual polish after those
   product behaviors land.
3. A broader Viewer Next design-token cleanup outside Raven onboarding.
4. Source-processing, source summaries, source-to-slot attribution, and richer
   source cards.
5. Multi-agent bench unlock visuals beyond the current locked future teammate
   affordance.
