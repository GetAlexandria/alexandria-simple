# Issue #384: Play Page Modular Plays

Issue: GitHub #384, "Play page (viewer): render modular/composed plays so a Built play reads as built (make-a-play)"
Goal: make the viewer Play page detect modular plays from `studio/plays/<slug>/modules/*/workflow.fabro` and render their composed module sequence, tracker legs, and Director gates without changing single-play rendering.
Linked product plan: `docs/alexandria/plans/play-page-redesign/plan.md`.

## Scope

This is a narrow Studio viewer surface correction. It lands only the modular/composed Play page branch needed for `make-a-play`:

1. Detect a modular play from disk when one or more records match `modules/<module>/workflow.fabro`.
2. Derive module order and structure from `studio/plays/<slug>/modules/*`, `PLAY_MANIFEST` entries such as `make-a-play:design`, and each module's `legs.json`.
3. Render `make-a-play` as Design -> Build -> Prove, with each module showing its workflow graph and tracker legs.
4. Render `gates/*` as Director gate records between modules when the gate filename can be placed, and in a gates block otherwise.
5. Keep plays with no `modules/*/workflow.fabro` on the current single-play code path.
6. Add deterministic tests and browser coverage for modular detection, `make-a-play` rendering, and single-play no-regression.

## Non-Goals

1. Do not change play stages, Board state, registry filing, ready flags, or `make-a-play` maturity.
2. Do not generate fixtures, dry-runs, `story.md`, `synopsis.md`, `risk-map.md`, or `diagram.svg` for `make-a-play`.
3. Do not rework the broader Play page information architecture from `play-page-redesign`, including tab/nav restructuring, synopsis authoring, explainer copy, or diagram theming.
4. Do not generalize authoring rules for every future modular play beyond the data-derived module contract in this issue.
5. Do not touch plugin play behavior, guided skills, live agent prompts, or eval harness behavior.
6. Do not write to `docs/alexandria/library`.

## Linked Product-Plan Summary

`play-page-redesign/plan.md` owns the larger Play page redesign. Several parts of that plan are already shipped or intentionally deferred: Overview/Explainer, diagram theming, and the Director's left-nav decision are not part of this slice.

This issue jumps ahead only to correct a data-shape blind spot: the current Play page assumes a single play has top-level derived surfaces such as `story.md`, `diagram.svg`, fixtures, dry-runs, and `risk-map.md`. `make-a-play` is built as a composed play instead: `modules/design`, `modules/build`, `modules/prove`, plus `gates/` and `held-queue.json`. The page must show that real structure rather than reading the absence of single-play surfaces as "stub".

## Current Gap

Today `packages/viewer/src/components/studio/PlayPage.tsx` computes first-class rendered sections from single-play records:

1. Overview uses `synopsis.md`, `diagram.svg`, and `story.md` when present.
2. Play Walk appears only when fixtures/dry-runs or parsed `story.md` moves exist.
3. Play Testing appears only when `risk-map.md` exists.
4. Design history groups top-level research, brief, hardening, lint, and similar records.

`make-a-play` has `brief.md`, `hardening.md`, `research/grounding.md`, `held-queue.json`, `gates/*`, and `modules/{design,build,prove}/{workflow.fabro,legs.json}`. Because it has no top-level `story.md`, `diagram.svg`, fixtures/dry-runs, or `risk-map.md`, the Play Walk and Testing views hide. The page therefore shows a sparse Design/file view even though the built module workflows exist.

The AX runtime already knows the module play ids in `packages/ax/src/domain/plays.ts` (`make-a-play:design`, `make-a-play:build`, `make-a-play:prove`) and can derive moves, transitions, and tracker legs through `derivePlaybook`.

## Architectural Boundaries

1. AX studio API owns filesystem access and manifest-aware derivation. The viewer must not import `packages/ax/src/*` directly or read files outside `/api/studio/*`.
2. Viewer runtime code owns narrow schemas and Effect-backed fetches, matching `packages/viewer/README.md`: local runtime API -> Schema decode -> typed Effect errors -> React hook adapter.
3. Visual React components receive typed module data and render it. They should not parse arbitrary repo files or duplicate the manifest.
4. Single-play rendering stays on the current `groupPlayRecords` + `WalkThrough` path. The modular branch is selected only when derived module composition has at least one module.
5. Module source files stay canonical. The implementation reads `workflow.fabro`, `legs.json`, and `gates/*`; it does not author or cache a module list.
6. The Play page may render a workflow graph from derived `Move`/transition data, but it must not assert proof quality or run status.
7. `packages/alexandria-plugin` is out of scope unless a test reveals an existing import/runtime error. No plugin validation is required for the intended slice.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| AX Studio API | `packages/ax/src/effects/studio-api.ts` plus a small helper module if useful | Add a read-only composition derivation for `/api/studio/plays/<slug>` data: scan `modules/*/workflow.fabro`, match known `${slug}:${module}` manifest entries in manifest declaration order, load valid `legs.json`, and return typed module/gate records. Existing records/file endpoints remain unchanged. |
| AX play derivation | `packages/ax/src/domain/plays.ts` | Reuse existing `PLAY_MANIFEST`, `derivePlaybook`, and `parseTrackerLegsJson`. Only add exports/helpers if needed; do not change play ids, surfaced flags, workflow targets, or CLI behavior. |
| Viewer runtime | `packages/viewer/src/app/runtime/studio.ts` | Add a narrow schema and client call for the play composition endpoint, including module name, label, play id, workflow path, moves, transitions, tracker legs, and gate records. |
| Viewer Play page model | `packages/viewer/src/components/studio/playRecords.ts` or new `playModules.ts` | Add pure helpers for modular detection, gate grouping, and UI ordering. Unit-test these helpers with synthetic records and real `make-a-play` paths. |
| Viewer Play page UI | `packages/viewer/src/components/studio/PlayPage.tsx` and small extracted components if needed | When composition modules exist, make Play Walk visible and render a composed sequence: module card, workflow graph, tracker legs, gate separator. When no modules exist, keep current single-play rendering untouched. |
| Viewer browser fixture | `packages/viewer/tests/serve-viewer-fixture.ts` and `packages/viewer/tests/library-browser.spec.ts` | Extend test fixture handling enough for Play page record/file/composition endpoints, or route the relevant browser test through the real AX viewer server. Add assertions for `make-a-play` modules and `frame-the-problem` no-regression. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents | None | No prompt, agent, or play invocation behavior changes. |
| Product skills | None | No skill files change; no skill eval rerun is required. |
| Maintainer skills | None | This plan uses the maintainer planning skill but does not change it. |
| CLI behavior | None | No `ax` command contract, stdout/stderr, or exit code changes. |
| Viewer behavior | Play page can display modular Studio records | Add deterministic unit/browser coverage; no eval-harness coverage. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX unit/API tests | `pnpm --filter @alexandria/ax run test` | Covers the composition derivation and guards manifest/order/legs behavior without changing CLI contracts. |
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Covers modular detection, gate grouping, render model helpers, and existing Studio helper regressions. |
| Viewer type/build checks | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Proves the Astro/React viewer compiles after runtime schema and component changes. |
| Browser smoke | `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts --grep "Studio Play"` | Verifies `/studio?tab=play&slug=make-a-play` shows Design, Build, Prove modules, module graph/legs, and gates; verifies `frame-the-problem` still shows the current single-play surface. |
| Manual viewer check | `ax start viewer`, then open `http://127.0.0.1:4321/studio?tab=play&slug=make-a-play` and `http://127.0.0.1:4321/studio?tab=play&slug=frame-the-problem` | Confirms the shipped product surface reads correctly in a browser against real repo data. |

If the implementation does not touch AX API code after all, the AX test command can be reduced to the specific viewer commands above, but the plan should be updated before approval if that scope changes.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer Play page | Deterministic unit tests and Playwright browser tests, no LLM eval harness | Extend viewer unit/e2e coverage. No eval-harness rerun required. | `pnpm --filter @alexandria/viewer run test`; `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts --grep "Studio Play"` |
| AX Studio API derivation | Bun tests in `packages/ax` | Add/extend deterministic tests for composition derivation if a backend endpoint/helper is added. No CLI black-box tests because no CLI command changes. | `pnpm --filter @alexandria/ax run test` |
| Agents/skills/plugin | Not impacted | No eval cases added or rerun. | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Single-play rendering regresses while adding modular support | Gate the modular path strictly on derived `modules/*/workflow.fabro` presence. Avoid moving/styling existing `WalkThrough`, `presentSections`, and single-play nav logic except for the explicit branch. Add `frame-the-problem` browser no-regression assertions. |
| Module order becomes filesystem order (`build`, `design`, `prove`) instead of declared play order | Prefer `PLAY_MANIFEST` declaration order for known `${slug}:${module}` ids; append any unknown disk modules in stable path order with a clear fallback label. Cover `make-a-play` order in tests. |
| Viewer duplicates AX graph/leg derivation and drifts | Keep manifest-aware derivation in AX or a shared AX helper. Viewer consumes typed module data and only renders. If any browser-side helper is added, keep it presentation-only. |
| A malformed `legs.json` hides the whole module view | Match existing project-state behavior: invalid legs degrade to no tracker legs for that module and can surface a small warning, while the workflow graph still renders from `workflow.fabro`. Cover the fallback in unit tests. |
| Gate placement becomes hand-authored | Derive gate placement from sorted `gates/gate-<n>.*` filenames: place `gate-1` after module index 1 when possible, otherwise render in an unplaced gates block. Do not add a hard-coded `make-a-play` gate map. |
| The modular graph reads as a generic file accordion | Render module cards as a composed sequence with visible module names, graph visualization, legs, and gate separators. Keep file-open chips secondary. Add browser assertions for visible module/gate text rather than only file links. |
| Browser tests become brittle if they depend on local AX server state | Prefer extending `serve-viewer-fixture.ts` with read-only Studio records/file/composition handlers rooted at the repo for deterministic e2e. If using `ax start viewer` manually, keep that as manual verification, not the automated Playwright dependency. |

## Implementation Steps

1. Add a pure composition derivation in AX:
   - Scan `studio/plays/<slug>/modules/*/workflow.fabro`.
   - Derive each module's play id as `${slug}:${module}` when it exists in `PLAY_MANIFEST`.
   - Load `workflow.fabro` and optional `legs.json`.
   - Use `derivePlaybook` and `parseTrackerLegsJson` so moves, transitions, and legs match runtime semantics.
   - Order known modules by `PLAY_MANIFEST`; append unknown modules by path.
   - Collect `gates/*` records, pairing `.json` and review `.md` files by gate stem.
2. Expose the derived composition through the Studio API using the existing path safety patterns in `studio-api.ts`. Return an empty module list for single plays; do not change `recordsResponse` or `fileResponse` behavior.
3. Add AX tests for the composition helper:
   - `make-a-play`-shaped fixture returns Design -> Build -> Prove.
   - Removing/renaming a module changes the derived module list.
   - Invalid/mismatched `legs.json` drops legs without dropping the module.
   - A single-play fixture returns no modules.
4. Add viewer runtime schema/client support for the composition response. Keep the schema narrow and tolerate optional fields only where the API can legitimately omit them.
5. Add viewer helpers/components:
   - A modular detection/render model helper that treats non-empty composition modules as modular.
   - A `ComposedPlayWalk` component that renders each module's name, workflow graph from derived moves/transitions, tracker legs from `legs.json`, and secondary open-file chips for `workflow.fabro`/`legs.json`.
   - A `GateSeparator` or gates block that renders `gates/gate-*.json` decision fields and review markdown through existing markdown/file rendering.
6. Wire `PlayPage.tsx` additively:
   - Fetch composition alongside records.
   - Reset composition state on slug change.
   - If composition has modules, mark Play Walk present even when `story.md` and fixtures are absent.
   - Render `ComposedPlayWalk` for modular Play Walk.
   - Leave Overview, Design, Testing, raw file selection, and the single-play `WalkThrough` path unchanged for non-modular plays.
7. Extend viewer tests:
   - Unit-test modular detection/order/gate grouping.
   - Add or update Playwright fixture handlers for Studio play records/files/composition.
   - Assert `make-a-play` shows Design, Build, Prove, each module has graph and legs, and Gate 1 appears.
   - Assert `frame-the-problem` still exposes the current Overview and Play Walk flow.
8. Run the deterministic verification commands and record any unavailable command or environment blocker in the implementation close-out.

## Acceptance / Exit Criteria

1. `http://127.0.0.1:4321/studio?tab=play&slug=make-a-play` shows a composed Play Walk with Design, Build, and Prove in that order.
2. Each `make-a-play` module shows a rendered workflow graph derived from its `workflow.fabro`.
3. Each `make-a-play` module shows tracker legs derived from its `legs.json`; no tracker legs are hand-authored in React.
4. `gates/gate-1.json` and `gates/gate-1-review.md` are surfaced as Director gate material, not hidden under a generic other-file list.
5. The module structure changes when module files are removed or renamed in tests, proving it is disk-derived.
6. `frame-the-problem` and any play without `modules/*/workflow.fabro` render on the existing single-play path.
7. No play stage, registry status, fixtures, dry-runs, synopsis, risk map, plugin workflow, or library document is changed by this slice.
8. Viewer unit/build/browser validation passes, or any blocked command is explicitly reported with the blocker.

## Deferred Follow-Ups

1. The broader `play-page-redesign` tab/nav restructuring remains deferred to its parent plan.
2. Synopsis/explainer authoring for modular plays remains deferred.
3. Generating persistent `diagram.svg` and `story.md` for each module is deferred; this slice renders from existing module workflows and legs.
4. The F7 StepRail legs wiring remains a separate Board item.
5. General modular-play authoring conventions beyond the current disk/manifest contract can be documented later if another composed play appears.
