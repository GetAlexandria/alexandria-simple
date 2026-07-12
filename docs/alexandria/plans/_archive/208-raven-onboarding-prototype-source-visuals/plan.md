# GitHub Issue #208: FEAT-010 Prototype-Source Raven Onboarding Visual Elements

- Issue: GitHub #208, `[FEAT-010] Prototype-source all Raven onboarding visual elements`
- Run ID: `01KSY3CSHHB1W58VJ15Z23SGS3`
- Product plan: `raven-onboarding-experience`
- Primary prototype source:
  `docs/alexandria/plans/canvas-library-spike/prototype/product-library/`
- Primary package: `packages/viewer-next`
- Guardrail packages: `packages/ax-next`, `packages/alexandria-next-plugin`
- Plan path:
  `docs/alexandria/plans/208-raven-onboarding-prototype-source-visuals/plan.md`

## Source Context

This plan is based on the issue body supplied in the run prompt, the current
Viewer Next implementation, the #200 baseline visual-alignment plan, the
FEAT-007 and FEAT-008 Raven banking/Knowledge Bank plans, and the canvas
prototype design sources named by the issue. The prompt supplied the full issue
body; no additional GitHub comments were available in this planning pass.

An existing directory named
`docs/alexandria/plans/208-sync-tickets-skill-wrapper/` already exists, but it
belongs to a different historical issue. This plan intentionally uses a new
stable slug instead of editing that unrelated plan.

Required repo guidance read for this plan:

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- `skills/maintainer/technical-planning/plan-template.md`
- `packages/viewer-next/README.md`
- `packages/ax-next/CLAUDE.md`
- `packages/ax-next/docs/cli-design-principles.md`
- `packages/alexandria-next-plugin/CLAUDE.md`
- `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md`
- `EVALS.md`

Design and implementation context read for this plan:

- `docs/alexandria/plans/200-raven-onboarding-visual-alignment/plan.md`
- `docs/alexandria/plans/feat-007-bank-vision/plan.md`
- `docs/alexandria/plans/feat-008-knowledge-bank-banked-vision/plan.md`
- `docs/alexandria/plans/raven-onboarding-experience/plan.md`
- `docs/alexandria/plans/canvas-library-spike/prototype/docs/design/brand.md`
- `docs/alexandria/plans/canvas-library-spike/prototype/docs/design/canvas-patterns.md`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/vision-builder.html`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/css/raven.css`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/css/vision-onboarding.css`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/css/vision-builder.css`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/js/raven.js`
- `packages/viewer-next/src/components/library/AlexandriaHome.tsx`
- `packages/viewer-next/src/components/library/RavenBench.tsx`
- `packages/viewer-next/src/components/library/RavenKnowledgeBankStatus.tsx`
- `packages/viewer-next/src/components/library/VisionOnboardingView.tsx`
- `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`
- `packages/viewer-next/src/app/runtime/schemas.ts`
- `packages/viewer-next/src/styles/global.css`
- `packages/viewer-next/tests/library-browser.spec.ts`
- `packages/viewer-next/tests/serve-viewer-fixture.ts`

## Goal

Complete the Raven onboarding visual-system pass after FEAT-007 and FEAT-008 so
every visible Raven onboarding UI element in Viewer Next has a traceable basis
in the canvas prototype visual system. The implementation should make the
production flow read as a simplified prototype surface, not as generic admin UI
with similar colors.

Jess's added product direction is the governing visual standard for this slice:
the canvas-library-spike prototype is the source of truth for visible Raven
onboarding shapes, assets, spacing, controls, status markers, surface
materials, and Raven-specific affordances. The production flow can stay
simpler than the prototype, but visible elements should be simplified
prototype elements rather than newly invented admin cards, pills, panels, or
buttons. Any visible production element that intentionally deviates from the
prototype must be called out explicitly in the implementation result with the
reason.

This is a visual-only slice. It must preserve AX2 reducer behavior, Vision slot
semantics, source item state, banking behavior, Knowledge Bank projection,
runtime API contracts, CLI output contracts, and ledger events.

## Scope

In scope:

1. Raven Knowledge Bank visual polish before Vision banking and after Vision
   banking.
2. Subject rows/cards, locked state, available/in-progress/banked state,
   Source of Truth metadata, board layout, and side/status region in
   `RavenKnowledgeBankStatus.tsx`.
3. Vision banked/completed visual state after `Bank Vision`, including the
   disabled `Banked` control state and post-bank Knowledge Bank landing.
4. A drift audit of already-polished Home, Raven Bench, Raven Quick Bar, Vision
   source intake, Vision source strip, and Vision slot-review states.
5. Empty, locked, disabled, loading, error, busy, conflict, synced, and status
   states inside the Raven onboarding flow.
6. A visible-element traceability audit across every Raven onboarding surface:
   each visible shape, control, panel, card, marker, asset, and status state
   should map to a prototype element or an explicit deviation.
7. A durable Viewer Next Raven visual vocabulary in `global.css`, including
   prototype-derived Knowledge Bank board/band/subject/status classes.
8. Viewer browser tests and screenshot capture for desktop and mobile Home,
   Quick Bar, Vision onboarding, source intake, Knowledge Bank before banking,
   and Knowledge Bank after banking.
9. Manual and automated guardrails proving visual-only navigation does not
   change `ax2 inspect state --json` output or append ledger events.

Out of scope:

1. Alexandria 1 plugin, CLI, or viewer changes.
2. AX2 reducer changes, new CLI commands, runtime route changes, state schema
   changes, event schema changes, source item model changes, or banking
   behavior changes.
3. New Raven plays, autonomous Raven behavior, skill wording changes, or
   eval-backed prompt behavior.
4. Reintroducing the prototype phase rail, source sliders, logo upload
   dependency, Build/Tune/Approved slider model, one-source-per-line source
   textarea, or overlay-as-home navigation.
5. Writing directly to `docs/alexandria/library/`.
6. Generalizing Knowledge Bank subjects beyond the FEAT-008 projected manifest.

## Linked Product-Plan Summary

The Raven onboarding product plan keeps the useful prototype elements: Raven's
coin, bottom bench, Quick Bar, source handoff, Vision slot review, Vision
banking, and Knowledge Bank progression. It intentionally simplifies the
prototype by removing the phase rail, source sliders, logo upload dependency,
overlay-as-home model, and prototype playbook/filtering mechanics.

#200 aligned the already-landed Home, Raven Bench, Quick Bar, source intake,
and Vision slot review surfaces with the canvas prototype. FEAT-007 then made
Vision banking real and FEAT-008 made Knowledge Bank render banked Vision plus
locked future subjects from AX2 projection. This issue is the follow-up visual
audit for the surfaces added or changed after #200, especially the Knowledge
Bank and banked/completed states.

The production result should keep the simplified product decisions while using
prototype-derived visual elements: warm walnut canvas, slate plates, amber/gold
stone controls, compact status pips/dots, Raven coin/bench affordances, muted
locked treatment, calm banked treatment, and prototype-derived type and
spacing. Similar palette alone is not sufficient. If the prototype already has
a usable visual element for the need, production should adapt that element
rather than introduce a generic admin card, filled status pill, success panel,
or ordinary app button.

## Current Gap

Current Viewer Next already includes the main behavioral foundation:

1. `LibraryBrowserApp.tsx` opens Knowledge Bank from Raven's Quick Bar and
   routes to Knowledge Bank after successful Vision banking.
2. `RavenKnowledgeBankStatus.tsx` renders the manifest-backed AX2 Knowledge
   Bank projection, including Vision, locked future subjects, and Source of
   Truth path/hash after banking.
3. `VisionOnboardingView.tsx` uses prototype-derived classes for the source
   panel, source chips, slot cards, compact pips, and Bank Vision button.
4. `RavenBench.tsx` uses Raven coin assets, brass plates, locked future seats,
   and a coin-attached Quick Bar.
5. `global.css` contains #200-era Raven tokens and classes for canvas ground,
   buttons, status pips, source strips, slot cards, Quick Bar, and responsive
   layout.
6. `library-browser.spec.ts` already contains visual-contract assertions and
   screenshots from #200 plus basic Knowledge Bank before/after banking checks.

The remaining gaps are visual-system consistency and traceability:

1. Knowledge Bank still reads more like a custom status page than a simplified
   prototype Knowledge Bank board. Its page ground, subject articles, side
   status panel, and Source of Truth metadata need to map directly to
   `raven.css` Knowledge Bank sheet/band/subject/status patterns and
   `vision-onboarding.css` vision-only banked treatment.
2. Knowledge Bank subject rows currently use broad card blocks and text status
   labels; they should become compact prototype-derived subject rows or bands
   with a small status pip/dot, locked texture, and calm banked treatment.
3. The side/status region uses a filled connected/disconnected panel. Prototype
   guidance says status should be a slate pill with dot state, with metadata in
   a quiet slate plate rather than a large filled success/admin card.
4. Source of Truth metadata is rendered as bare small text. It should become a
   prototype-derived metadata plate or etched row that preserves path/hash
   truncation and does not imply Library cards were generated.
5. Vision banked/completed state currently depends mostly on the disabled
   `Banked` button and Knowledge Bank route. The plan should prevent future
   implementation from adding generic success panels or large success pills.
6. Some Viewer CSS still uses the `--viewer-font-ui` fallback beginning with
   `Avenir Next`; the prototype body font source of truth is Inter. The visual
   pass should either add Inter to Viewer Next or explicitly document a
   production deviation.
7. Screenshot names and visual assertions still mostly reference issue #200.
   This issue needs explicit #208 before/after-banking screenshot artifacts and
   Knowledge Bank visual-contract assertions.

## Prototype-Derived Visual Contract

Implementation must be able to point every visible Raven onboarding element to
one of these prototype sources or to an intentional production simplification
listed below. "Visible element" includes not only major sections but also
microstates: disabled controls, empty states, loading text, error notes, status
markers, lock cues, metadata blocks, source chips, slot sync markers, Quick Bar
actions, and bench affordances.

The prototype is the source of truth for:

1. Shapes and silhouettes, including slate plates, compact rows, brass plates,
   stone controls, coin sockets, pips, dots, lock marks, and inset editors.
2. Assets and Raven-specific affordances, including the Raven coin imagery,
   lit/unlit layers, tails assets for locked seats, bench plinth, and tray
   relationship.
3. Spacing and density, especially compact Knowledge Bank rows, source handoff
   bands, slot card rhythm, and stable mobile constraints.
4. Controls and hierarchy, including amber primary pips, ghost pills, quiet
   utility pills, stone/tray actions, and disabled states.
5. Status markers, with state carried by a small dot, row marker, lock texture,
   or calm banked label instead of a large filled badge.
6. Surface material, including warm walnut canvas, slate cards/plates,
   amber-tinted borders, brass name plates, and inset dark editors.

Do not introduce generic admin UI when a prototype-derived Raven/canvas element
is available. Examples to avoid include generic dashboard cards, broad filled
success panels, unrelated pill badges, default form panels, and ordinary app
buttons. If an implementation keeps one for production reasons, it must be
listed in the deviation notes with the reason.

| Production element | Prototype basis | Production translation |
|--------------------|-----------------|------------------------|
| Page/canvas ground | `brand.md` warm-walnut tokens, `canvas-patterns.md` slate plate/card, `vision-builder.css` `body` and `.vb-wrap` | Keep warm walnut/dark canvas ground; no white/parchment/admin panels |
| Knowledge Bank board | `raven.css` `#raven-surface-knowledge-bank .sheet`, `.bands-column`, `.band`, `.band-header` | Render a simplified single production board or band stack, not the full prototype playbook/filter grid |
| Knowledge Bank subjects | `raven.css` `.subject`, `.subject-text`, `.subject-name`, `.subject-desc`, `.core-mark`, `.lock-icon`, `.status` | Use compact rows/cards with slate material, muted descriptions, compact status, and explicit locked/banked states |
| Locked subjects | `raven.css` `.subject.locked`, `.mini-bar.locked`, `.legend-swatch.locked`, `.lock-icon` | Use dimmed locked rows with a lock cue and textured/slate treatment; avoid generic disabled gray cards |
| Banked subject | `vision-onboarding.css` `body.subject-banked-vision ... .subject[data-subject="vision"]` | Use calm completed slate/amber treatment and small `Banked` marker; no large success panel |
| Active/available Vision | `vision-onboarding.css` `body.kb-mode-vision-only[data-active-subject="vision"] ...` | Before banking, Vision can be the available/active row, but without prototype pulse if it competes with production simplicity |
| Source of Truth metadata | `raven.css` `.kb-beacon`, `.band-seal-note`, `.status`, `canvas-patterns.md` etched note | Show path/hash/updatedAt as compact metadata in a slate/etched region with truncation |
| Side/status region | `raven.css` `.kb-playbook` material only as side-plate inspiration, `canvas-patterns.md` status pip | Keep side region as a production status plate, not prototype Playbook; use compact pips and quiet metadata |
| Controls | `canvas-patterns.md` `.tfs-btn-primary`, `.tfs-btn-ghost`, `.tfs-btn-quiet`, `vision-builder.css` `.vb-bank-btn`, `.vb-sources-hand` | Keep amber primary, amber ghost, and quiet utility hierarchy; one local amber primary per surface |
| Status | `brand.md` status dot rule, `canvas-patterns.md` `#live-pip` style | Status is carried by the dot color inside a slate pill, not by large filled badges |
| Raven coin/bench | `raven.css` `.bench-seat`, `.bench-role-plate`, `#raven-tray-zone`, `.raven-sub-btn-action`, coin state selectors | Preserve coin, plinth, tray, locked seats, and compact bench affordances |
| Source intake | `vision-builder.css` `.vb-sources`, `.vb-source-chip`, `.vb-sources-hand`, `canvas-patterns.md` dropzone | Keep one-at-a-time production source intake while styling it as source-review handoff |
| Vision slots | `vision-builder.css` `.vb-section`, `.vb-sec-num`, `.vb-input`, `.vb-belowbar`, `.vb-saved-flash` | Keep current slot semantics while preserving slate section card, number pip, editor, and quiet control language |

Intentional production simplifications that must remain:

1. No phase rail.
2. No source sliders or Build/Tune/Approved slider model.
3. No logo upload dependency.
4. No one-source-per-line source textarea.
5. No overlay-as-home navigation.
6. No prototype Playbook side column or play filtering in Knowledge Bank.
7. Textareas remain for manual Vision review because they are production
   behavior, but they should continue to look like inset slate editors.
8. Knowledge Bank remains a Raven capability/status surface, not a Library card
   grid and not source atomization.

## Required Deviation Notes

The implementation result must include a short visible-element deviation list.
The list may be empty, but if any visible Raven onboarding element is not
prototype-derived it must name:

1. the production element,
2. the prototype element that was considered,
3. why the production element intentionally differs, and
4. how the deviation still preserves the simplified Raven flow.

Expected deviations that are already approved by product direction:

1. The production flow omits the phase rail.
2. The production flow omits source sliders and the Build/Tune/Approved slider
   model.
3. The production flow omits logo-upload gating.
4. Source intake stays one source at a time instead of a one-source-per-line
   prototype textarea.
5. Knowledge Bank omits the prototype Playbook side column and play filtering.
6. Vision slots keep textareas for manual review, styled as inset prototype
   editors.

## Architectural Boundaries

Viewer Next owns this work. The implementation should stay in React visual
components, Viewer Next CSS, Viewer Next stories, Viewer runtime test fixtures
only if needed for visual states, and Viewer Playwright tests.

AX2 owns state projection, source item state, ledger events, Vision reducers,
banking, and CLI output. No AX2 implementation file should change for this
ticket. AX2 tests and manual CLI checks are guardrails only.

The Alexandria Next plugin owns guided play behavior. No plugin skill or agent
file should change for this ticket. If implementation unexpectedly touches
`packages/alexandria-next-plugin`, revise this plan's eval section before
merge and run plugin validation.

Effect remains at Viewer runtime boundaries only. Pure visual components should
receive plain props and callbacks; this visual pass should not introduce Effect
inside presentation components.

Alexandria 1 is not part of this slice.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Technical plan | `docs/alexandria/plans/208-raven-onboarding-prototype-source-visuals/plan.md` | Captures repo-specific scope, traceability, verification, and exit criteria |
| Viewer visual vocabulary | `packages/viewer-next/src/styles/global.css`, possibly `packages/viewer-next/package.json` and lockfile if Inter is added | Adds or tightens prototype-derived Knowledge Bank board/subject/metadata/status classes and aligns body UI font with prototype |
| Knowledge Bank UI | `packages/viewer-next/src/components/library/RavenKnowledgeBankStatus.tsx` | Visual-only restyle of board, subject rows/cards, locked/banked status, Source of Truth metadata, empty/loading copy, and side/status region |
| Vision onboarding UI | `packages/viewer-next/src/components/library/VisionOnboardingView.tsx` | Visual-only audit and small polish for banked/completed, loading, error, disabled, busy, conflict, source, and slot states |
| Raven Bench / Quick Bar | `packages/viewer-next/src/components/library/RavenBench.tsx` | Drift audit and visual-only tweaks if current tray/coin/locked-seat states no longer match the prototype or clip |
| Home | `packages/viewer-next/src/components/library/AlexandriaHome.tsx` | Drift audit and small visual-only tweaks if status/CTA/coin states regressed after #200 |
| Viewer app shell | `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`, `LibraryBrowserShell.tsx` only if visual state hooks/data attributes are needed | No routing behavior change; only visual state wiring if needed |
| Viewer stories | `packages/viewer-next/src/components/library/*.stories.tsx` | Optional story states for Knowledge Bank pre-bank, banked, locked, loading, and source/slot status review |
| Viewer tests/fixtures | `packages/viewer-next/tests/library-browser.spec.ts`, `serve-viewer-fixture.ts` only if fixture support is needed | Adds #208 visual-contract assertions and screenshot artifacts without changing runtime contracts |
| AX2 guardrails | `packages/ax-next/tests/state.test.ts`, `raven-vision.test.ts`, `runtime-server.test.ts`, `cli.test.ts` | No edits expected; run existing tests as proof semantics did not change |
| Next plugin guardrails | `packages/alexandria-next-plugin` | No edits expected; validate only if touched |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Viewer user behavior | Raven onboarding and Knowledge Bank become more visually traceable to the prototype without changing navigation or mutations | Add Viewer e2e visual-contract assertions and screenshots |
| AX2 CLI/runtime behavior | No behavior change; `ax2 inspect state --json` and ledger event counts must remain unchanged for visual-only interactions | Run existing AX2 tests and manual before/after CLI checks |
| Alexandria Next plugin skills/agents | No intended behavior change | No eval rerun; run `pnpm run validate` in the plugin only if plugin files are touched |
| Reusable Alexandria 1 skills/agents/templates | None | No eval-harness coverage required |

## Deterministic Verification

Automated verification:

| Area | Command | Why |
|------|---------|-----|
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro, React, TypeScript, and CSS integration drift |
| Viewer runtime client | `cd packages/viewer-next && pnpm run test` | Confirms runtime schema/client behavior remains unchanged |
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Covers Home, Quick Bar, Vision onboarding, source intake, Knowledge Bank pre-bank, Knowledge Bank banked, responsive bounds, and screenshots |
| Viewer build | `cd packages/viewer-next && pnpm run build` | Confirms the static Viewer bundle still builds |
| AX2 Vision reducer | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Guardrail that Vision slot/source/banking semantics did not change |
| AX2 state projection | `cd packages/ax-next && bun test tests/state.test.ts` | Guardrail that `ax2 inspect state --json` projection remains stable |
| AX2 runtime APIs | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Guardrail that Viewer-facing runtime behavior and banking remain stable |
| AX2 CLI black-box | `cd packages/ax-next && bun test tests/cli.test.ts` | Guardrail for CLI exit codes and important JSON output fields |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Guardrail if shared types are touched unexpectedly |
| Plugin validation | `cd packages/alexandria-next-plugin && pnpm run validate` only if plugin files are touched | Required only for unexpected plugin package changes |

Viewer e2e additions or updates should include:

1. Desktop Home screenshot for #208 with Raven bench visible.
2. Mobile Home screenshot for #208 with Raven bench visible and no horizontal
   overflow.
3. Desktop Quick Bar screenshot for #208 after opening from Raven's coin.
4. Mobile Quick Bar screenshot for #208 with viewport-bound assertion.
5. Desktop Vision onboarding screenshot for #208 with source intake and slots.
6. Mobile Vision onboarding screenshot for #208 with source intake and at least
   one slot.
7. Desktop source intake screenshot for #208 after one attached source exists.
8. Mobile source intake screenshot for #208 after one attached source exists.
9. Desktop Knowledge Bank before-banking screenshot for #208.
10. Mobile Knowledge Bank before-banking screenshot for #208.
11. Desktop Knowledge Bank after-banking screenshot for #208.
12. Mobile Knowledge Bank after-banking screenshot for #208.
13. Assertions that Knowledge Bank subject statuses use compact pips/dots or
    quiet row markers rather than large filled badges.
14. Assertions that Source of Truth path/hash metadata truncates inside its
    parent and does not create horizontal overflow.
15. Assertions that locked Knowledge Bank subjects are visibly disabled,
    `aria-disabled`, and prototype-derived.
16. Assertions that no phase rail, source sliders, logo upload step,
    one-source-per-line textarea, overlay-as-home behavior, Library card grid,
    or Playbook side column appears in the Raven onboarding flow.
17. Bounding-box assertions for Raven Quick Bar, Knowledge Bank board, source
    strip, slot cards, and action controls at tested desktop/mobile widths.

Manual verification:

1. Compare Knowledge Bank before banking against the prototype Knowledge Bank
   language in `raven.css` and the vision-only simplification in
   `vision-onboarding.css`.
2. Bank Vision and compare the banked Knowledge Bank state against the
   prototype banked subject treatment.
3. Recheck Home, Raven Bench, Quick Bar, Vision source intake, Vision slots,
   and Vision completed state for drift from #200.
4. Run `ax2 inspect state --json` before and after opening Home, Quick Bar,
   and Knowledge Bank through visual-only navigation. Verify the output is
   unchanged.
5. Run `ax2 inspect events list --json --limit 20` or equivalent event-count
   inspection before and after the same visual-only navigation. Verify no new
   ledger events are emitted.
6. Source addition and Vision banking may still emit their already-existing
   source and banking events when intentionally invoked; this ticket must not
   add, remove, or reshape those events.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| Viewer Next Raven onboarding visuals | Playwright coverage exists for Home, Quick Bar, source intake, Vision slots, bank Vision route, and basic Knowledge Bank state | Extend deterministic Viewer e2e assertions and screenshots; no LLM eval needed | `cd packages/viewer-next && pnpm run test && pnpm run test:e2e` |
| AX2 state/CLI/runtime | Bun tests cover reducers, runtime APIs, state projection, and CLI behavior | Rerun as guardrails only; no implementation change expected | `cd packages/ax-next && bun test tests/raven-vision.test.ts tests/state.test.ts tests/runtime-server.test.ts tests/cli.test.ts` |
| Alexandria Next plugin skills/agents | Plugin validation exists; current eval harness guidance applies when product skills or agents change | No action as scoped | `cd packages/alexandria-next-plugin && pnpm run validate` only if touched |
| Alexandria 1 eval-backed skills | Existing eval suite covers the shipped plugin line | No rerun because Alexandria 1 is untouched | None |

No eval-harness rerun is required as scoped because this ticket changes
deterministic Viewer Next presentation and browser tests, not reusable agent
behavior, plugin skills, guided Raven play behavior, or eval-backed prompt
surfaces. If implementation changes files under
`packages/alexandria-next-plugin/skills`,
`packages/alexandria-next-plugin/agents`, or any eval-backed product behavior,
revise this section before merge and use `EVALS.md` to choose the smallest
honest eval rerun set.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Knowledge Bank stays visually generic despite color tweaks | Require selector-level mapping to `raven.css` Knowledge Bank bands/subjects and `vision-onboarding.css` banked treatment |
| The implementation copies too much prototype behavior | Keep explicit absence checks for phase rail, source sliders, logo upload, one-source-per-line textarea, overlay-as-home, Playbook side column, and Library card grid |
| Visual-only work changes state or ledger behavior | Keep edits in Viewer presentation/style files; run AX2 reducer/runtime/state/CLI guardrails and manual before/after inspect checks |
| Banked Vision gets a large generic success panel | Use calm banked subject row and Source of Truth metadata plate; assert compact status styling |
| Locked future subjects imply available flows | Render locked rows as disabled capability status with lock cue and concise locked reason; do not make them actionable |
| Source of Truth metadata overflows on mobile | Use stable grid/flex constraints, truncation, and Playwright mobile overflow assertions |
| Quick Bar or bench clips after nearby CSS changes | Keep existing viewport and horizontal-alignment assertions; add regression screenshots |
| Shared CSS changes regress unrelated Library surfaces | Scope new classes to Raven/Knowledge Bank/Vision selectors and avoid broad element-level rewrites |
| Font alignment creates package churn | Prefer adding Inter deliberately to Viewer Next; if not added, document the Avenir/system fallback as an intentional implementation deviation |
| Screenshots become brittle | Use screenshots as review artifacts and keep automated pass/fail focused on bounds, class contracts, absence checks, and compact status dimensions |

## Implementation Steps

1. Audit the current Raven onboarding UI against the selector mapping in this
   plan, starting with `RavenKnowledgeBankStatus.tsx`.
2. Create a visible-element traceability checklist for implementation review:
   board, rows/cards, metadata, side region, controls, statuses, source strip,
   slot cards, Quick Bar, bench, Home coin, loading/error/empty/disabled states,
   and mobile layouts.
3. Add or tighten Viewer Next CSS tokens/classes for Knowledge Bank board,
   band/row material, compact status pips, locked texture, banked Vision, and
   Source of Truth metadata. Keep them scoped to Raven surfaces.
4. Align `--viewer-font-ui` with the prototype Inter body font by adding
   `@fontsource/inter` to Viewer Next, or explicitly document why that
   deviation remains.
5. Restyle Knowledge Bank page ground and layout so it reads as a simplified
   prototype Knowledge Bank board rather than a generic status page.
6. Restyle subject rows/cards using prototype-derived subject structure:
   compact name/description, small status marker, locked lock cue, and calm
   banked treatment.
7. Restyle Source of Truth path/hash/updatedAt as a compact metadata plate or
   etched row with truncation and no Library-card implication.
8. Restyle the side/status region as a quiet slate status plate with compact
   pips instead of a large filled connected/disconnected block.
9. Audit `VisionOnboardingView.tsx` banked/completed, disabled, busy, conflict,
   error, loading, source-empty, and source-card states. Make visual-only
   polish where states have drifted from the #200 prototype contract.
10. Audit `RavenBench.tsx` and `AlexandriaHome.tsx` for drift from #200. Keep
   changes minimal and visual-only.
11. Ensure all Raven controls follow the prototype hierarchy: one local amber
    primary, ghost secondary actions, quiet utility actions, compact pips for
    status.
12. Confirm responsive constraints for Quick Bar, Knowledge Bank, source
    strip, slot cards, metadata, and action controls at mobile and desktop
    widths.
13. Update Viewer Playwright tests with #208 screenshot attachments and visual
    contract assertions for Knowledge Bank before/after banking and the drift
    audit surfaces.
14. Add or update stories for Knowledge Bank pre-bank/banked/locked states if
    they help visual review without duplicating e2e fixture logic.
15. Run Viewer static, runtime, build, and e2e verification.
16. Run AX2 guardrail tests and manual before/after `ax2 inspect state --json`
    plus ledger event-count checks for visual-only navigation.
17. In the implementation result, explicitly list any visible element that
    intentionally deviates from the prototype and why.

## Acceptance / Exit Criteria

1. Raven Knowledge Bank uses prototype-derived visual elements for its board,
   subject rows/cards, locked/banked status, Source of Truth metadata, and
   side/status region.
2. Vision banked/completed states use the prototype visual language and do not
   introduce generic success panels, generic filled success pills, or generic
   admin cards.
3. All visible Raven onboarding controls follow the prototype button/control
   hierarchy where applicable: amber/gold stone controls, ghost controls, quiet
   utility controls, compact pips/dots, Raven coin/bench affordances, and
   prototype-derived spacing/type/color.
4. All visible Raven onboarding shapes, assets, spacing, controls, status
   markers, surface materials, and Raven-specific affordances are sourced from
   the canvas-library-spike prototype unless explicitly listed as a production
   deviation.
5. No generic admin cards, broad filled pills, generic success panels, default
   form panels, or ordinary app buttons remain where a prototype-derived
   Raven/canvas element is available.
6. Status styling is compact and legible, with status carried by a dot or
   quiet row marker rather than a large filled badge unless a documented
   prototype-derived reason exists.
7. The simplified production flow remains intact: no phase rail, no source
   sliders, no logo upload dependency, no one-per-line source textarea, and no
   overlay-as-home navigation.
8. No prototype Playbook side column, play filtering, or Library-card grid is
   added to the production Knowledge Bank.
9. Desktop and mobile layouts do not clip the Raven Quick Bar, Knowledge Bank
   board, source strip, slot cards, metadata, or action controls.
10. Source of Truth path/hash metadata remains readable or truncated inside its
   container on mobile and desktop.
11. Knowledge Bank before banking shows Vision as not banked and future
   subjects as locked using prototype-derived treatment.
12. Knowledge Bank after banking shows Vision as banked with Source of Truth
    metadata using calm prototype-derived treatment.
13. Home, Raven Bench, Quick Bar, Vision source intake, Vision source strip,
    Vision slots, and Vision completed state show no visual drift from the #200
    prototype contract.
14. `ax2 inspect state --json` output is unchanged by visual-only Home, Quick
    Bar, and Knowledge Bank navigation.
15. No new ledger events are emitted from visual-only Home, Quick Bar, or
    Knowledge Bank navigation.
16. Existing AX2 runtime/reducer/CLI tests continue to pass unchanged.
17. Existing Viewer Next runtime and e2e coverage continues to pass, with added
    #208 visual-contract assertions and screenshots where practical.
18. The implementation result explicitly calls out every visible element that
    intentionally deviates from the prototype and explains why.

## Deferred Follow-Ups

1. Playbook UI and play unlock visuals after a product plan defines those
   production flows.
2. Future Knowledge Bank subject builders for Vocabulary, Bets, Guardrails,
   and User Research.
3. Re-banking/staleness UX after post-bank Vision edits.
4. Rich Source of Truth inspection, citations, summaries, or handoff to Library
   card atomization.
5. Broader Viewer Next design-token cleanup outside Raven onboarding.
6. Consolidating older unused agent bench/app-shell paths if a later issue
   chooses to remove duplicated visual vocabulary.
