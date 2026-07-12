# Issue 578: Library Notepad Tab

Status: implementation-ready technical plan. This is a planning-only slice;
implementation files are intentionally untouched by this stage.

## Header

- Issue: GitHub #578, "Library Notepad N2: the Notepad tab - three lenses and
  a real burndown"
- Run ID: `01KWJ04CBHQFRC8774WP048NF5`
- Goal: add a top-level, read-only Notepad surface to the PMS viewer that
  renders the projected Library Notepad dataset as Generated, Resolved, and
  Open lenses with a durable open-count badge.
- Plan path: `docs/alexandria/plans/578-library-notepad-tab/plan.md`
- Linked product plan:
  `docs/alexandria/plans/library-notepad-surface/plan.md`, sections 2-3,
  slice N2. That product/design plan is read-only input for this technical
  plan.
- Dependency: issue #577, durable resolution projection. In this checkout the
  AX projection is present in
  `packages/ax/src/domain/library-thread-resolution.ts`, and the product
  viewer schema already decodes `thread.resolution`. The PMS viewer schema has
  not yet been mirrored.

## Source Review Notes

- Required guidance read: `CLAUDE.md`, `README.md`, `EVALS.md`,
  `skills/maintainer/technical-planning/SKILL.md`,
  `skills/maintainer/technical-planning/plan-template.md`, and
  `packages/pms/CLAUDE.md`.
- The GitHub issue body was supplied in the task and is treated as the issue
  source for this plan.
- Product-plan input read:
  `docs/alexandria/plans/library-notepad-surface/plan.md`.
- Dependency plan and implementation read:
  `docs/alexandria/plans/577-library-notepad-resolution-projection/plan.md`,
  `packages/ax/src/domain/library-thread-resolution.ts`,
  `packages/ax/src/domain/library-catalog.ts`,
  `packages/ax/tests/library-thread-resolution.test.ts`, and
  `packages/ax/tests/runtime-server.test.ts`.
- Prior nested-Notepad context read:
  `docs/alexandria/plans/library-notepad/plan.md`,
  `docs/alexandria/plans/502-library-notepad-thread-peek-empty-plane-context/plan.md`,
  and the current `EmptyLibraryView` thread worklist/peek implementation.
- PMS viewer implementation read:
  `packages/pms/viewer/src/app/PmsApp.tsx`,
  `packages/pms/viewer/src/app/runtime/client.ts`,
  `packages/pms/viewer/src/app/runtime/schemas.ts`,
  `packages/pms/viewer/src/components/library/DraftsView.tsx`,
  `packages/pms/viewer/src/components/library/DraftOverlayViews.tsx`,
  `packages/pms/viewer/src/components/library/EmptyLibraryView.tsx`,
  `packages/pms/viewer/src/components/library/hooks/useLibraryCatalog.ts`,
  `packages/pms/viewer/src/components/library/library-peek-view-model.ts`,
  `packages/pms/viewer/src/components/library/sample-catalog.ts`,
  `packages/pms/viewer/src/components/library/types.ts`, and the existing PMS
  viewer/package tests.
- PMS server boundary read:
  `packages/pms/src/server/alexandria-proxy.ts` and
  `packages/pms/tests/alexandria-proxy.test.ts`.
- The current checkout contains the Alexandria product sweep at
  `docs/alexandria/sweeps/alexandria-product/`, including `threads.json`.

## Scope

In scope:

1. Add a top-level PMS viewer tab labeled `Notepad`, sibling to the existing
   `Studio`, `PMS-Back`, and `PMS-Drafts` tabs.
2. Point the initial Notepad surface at the Alexandria product bundle root:
   `docs/alexandria/sweeps/alexandria-product`.
3. Keep the Notepad view root-parameterized through the same
   `LibraryCatalogRequest` shape as existing fixed library tabs. This slice
   renders one bundle root at a time; it must not merge PMS and Alexandria
   threads.
4. Read one projected catalog dataset from `/api/library/catalog`. The viewer
   must not rederive resolution from raw Ledger events and must not read
   `threads.json` directly.
5. Mirror the #577 optional `LibraryCatalogThreadResolution` schema into the PMS
   viewer runtime schema so the PMS viewer can decode the projected dataset.
6. Add a pure Notepad view model over catalog threads that computes:
   - Generated: every authored `threads.json` thread in the loaded bundle;
   - Resolved: every generated thread with `thread.resolution`, grouped by
     `resolution.state`, with `invalidated` shown only in a Misses rollup;
   - Open: generated threads with no `thread.resolution`;
   - tab badge count: Open count.
7. Render the three lenses read-only, grouped by `emittingMove` and `kind`
   where thread rows are shown.
8. Render exact state labels:
   - `director-ruled`: `Ruled by the director`
   - `settled-by-cascade`: `Settled by the frame ruling`
   - `settled-by-triage`: `Settled by triage`
   - `deferred-residual`: `Deferred to residuals`
9. Render `invalidated` only in a Misses rollup, not as a director agenda row.
10. Render provenance from the projected metadata:
    - question/thread row;
    - ruling text or reason when available;
    - `resolvingEventId`;
    - patch event and patch id chips when `resolution.patches` exists.
11. Add deterministic PMS viewer tests for lens counts, exact labels,
    distinct-state rendering, Generated immutability, provenance, empty-ledger
    state, tab badge count, existing tab regressions, and read-only behavior.
12. Include PMS viewer build and browser/manual validation instructions.

## Non-Goals

1. Do not edit `docs/alexandria/plans/library-notepad-surface/plan.md`.
2. Do not change AX projection logic, event classification, event schemas,
   runtime endpoints, or CLI behavior. #577 owns the projection.
3. Do not add cascade, triage, or invalidation producers. N2 renders those
   states when the projected catalog contains them.
4. Do not add a write path, answer form, resolve button, status mutation,
   thread-edit affordance, or patch application control.
5. Do not write to or mutate `threads.json`, sweep bundles, draft logs, or
   `docs/alexandria/library/**`.
6. Do not broaden the PMS server proxy to `/api/events`; provenance must come
   from the projected catalog thread metadata.
7. Do not implement the N2 lens inside `EmptyLibraryView` or `DraftsView`. The
   canonical N2 surface is top-level. Existing Back/Drafts render paths remain
   regression surfaces.
8. Do not globally merge notepad threads across products or bundle roots.
9. Do not change shipped plugin skills, plugin workflows, maintainer skills, or
   eval harness behavior.

## Product-Plan Summary

The product plan separates two concepts that used to blur together:

1. Run-scoped agenda state can reset when a Front-of-House play run is
   relaunched.
2. Durable thread resolution is projected from Ledger events by thread id and
   survives relaunches.

N2 is the viewer consumer of the durable projection. It gives the Notepad its
own top-level surface because the thread set is generated by Back-of-House,
burned down by Front-of-House, carried through residuals and confirmation, and
later regrown by living updates. It is not a Back or Drafts sub-tab.

The visible contract is one projected dataset, three read-only lenses:

- Generated is the immutable baseline from `threads.json`.
- Resolved is the set of generated threads with projected resolution
  provenance, visibly separating director rulings from machine settlements and
  deferrals.
- Open is the true remaining set. This count is the top-level tab badge.

`invalidated` threads are not director agenda items. They belong only in the
Misses rollup so process-improvement review can see where the scan was wrong.

## Current Gap

Verified against this checkout on 2026-07-02:

- `packages/pms/viewer/src/app/PmsApp.tsx` has three top-level surfaces:
  `studio`, `pms-back`, and `pms-drafts`.
- PMS-Back and PMS-Drafts both read the fixed PMS root
  `studio/sweeps/playmaker-studio`. There is no top-level Notepad surface and
  no fixed PMS viewer surface for the Alexandria product sweep.
- The nested `EmptyLibraryView` readiness tab is already labeled `Notepad`, but
  it is not the N2 surface: it is inside the Back catalog workbench, uses coarse
  `status`, and does not provide Generated/Resolved/Open lenses or a top-level
  burndown badge.
- `packages/pms/viewer/src/app/runtime/schemas.ts` decodes
  `resolvingEventId` and coarse `status`, but it does not decode the #577
  `resolution` object or the five durable resolution states.
- `packages/viewer/src/app/runtime/schemas.ts` already has the target
  resolution schema. PMS viewer should copy the shape rather than invent a
  second contract.
- `packages/pms/src/server/alexandria-proxy.ts` already forwards GET
  `/api/library/catalog` with query strings after identity-checking the
  Alexandria runtime. No PMS server route change is expected.
- `packages/pms/viewer/src/components/library/sample-catalog.ts` contains PMS
  notepad sample threads, but no fixture exercises all five durable resolution
  states or the Misses rollup.
- There is no PMS viewer test that pins top-level library surface tab requests,
  Notepad lens counts, durable badge behavior, or absence of mutation controls.

## Architectural Boundaries

1. PMS viewer owns the tab, lens model, and rendering. AX owns projection and
   runtime API data. PMS server only proxies the existing public catalog GET.
2. The Notepad component receives a `LibraryCatalog` and optional display root;
   it does not fetch raw files, parse `threads.json`, replay events, or mutate
   catalog data.
3. The Notepad model should use generated baseline threads from
   `catalog.threads` where `thread.source === "authored"`. AX marks parsed
   `threads.json` records as `authored`; synthetic fill-readiness rows are
   `derived` and are not part of this N2 baseline.
4. Count Open by absence of `thread.resolution`, not by coarse `thread.status`.
   Count Resolved by presence of `thread.resolution`, including `invalidated`
   for burndown math even though invalidated rows render only in Misses.
5. Generated must never shrink. Adding or removing resolution metadata changes
   Resolved/Open, not Generated.
6. The top-level badge is the model's Open count for the configured Notepad
   root. It may be absent while loading or on catalog error, but once data is
   loaded it must not read run-scoped agenda state.
7. Empty-ledger state means no generated thread has `resolution`. In that case
   the Notepad surface shows the Generated lens only, while the top-level badge
   still reflects the open count.
8. State styling must make machine-made settlements visually distinct from
   `director-ruled`. Cascade and triage may share a machine-made family only if
   they still carry separate labels and testable state markers.
9. Provenance links are in-surface links or disclosure controls over projected
   metadata. Do not add `/api/events` or depend on event-log browsing to satisfy
   this slice.
10. Keep product-copy discipline: UI may use lens names, state labels, Misses,
    questions, reasons, evidence, event ids, and patch ids. It must not render
    acceptance criteria, data-model explanations, or planning/spec language.
11. Existing PMS-Back and PMS-Drafts requests and render paths are regression
    surfaces. Add the top-level Notepad without changing their observable
    behavior.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| PMS top-level surface config | `packages/pms/viewer/src/app/PmsApp.tsx`, optionally a new small `src/app/pms-surfaces.ts` | Add `surface=notepad`, label `Notepad`, configured root `docs/alexandria/sweeps/alexandria-product`, auto-refresh for live burndown, and badge display from the Notepad model. Keep existing Studio/PMS-Back/PMS-Drafts labels and requests pinned. |
| PMS runtime schema | `packages/pms/viewer/src/app/runtime/schemas.ts`, new or existing runtime client/schema tests | Decode optional `thread.resolution` with states `director-ruled`, `settled-by-cascade`, `settled-by-triage`, `deferred-residual`, and `invalidated`, plus optional `answerText`, `reason`, and `patches`. Preserve older catalogs without `resolution`. |
| Notepad view model | New `packages/pms/viewer/src/components/library/notepad-view-model.ts` or equivalent | Purely derive generated/resolved/open/misses groups, counts, lens availability, labels, and provenance rows from a `LibraryCatalog`. This is the main deterministic test seam. |
| Notepad component | New `packages/pms/viewer/src/components/library/NotepadView.tsx` and `NotepadView.test.tsx` | Render lens controls, grouped thread rows, exact state labels, Misses rollup, provenance disclosures/links, empty states, and no mutation controls. |
| Fixtures | `packages/pms/viewer/src/components/library/sample-catalog.ts` or a focused test fixture file beside Notepad tests | Add a durable-resolution fixture with every state, patches, answer text, residual/machine reasons, generated-only empty-ledger data, and a generated baseline that stays constant across variants. |
| Existing library helpers | `packages/pms/viewer/src/components/library/DraftOverlayViews.tsx`, `library-peek-view-model.ts`, `types.ts` only if useful | Reuse `testIdPart`, thread question fallback, and type exports where practical. Avoid broad `EmptyLibraryView` refactors unless needed for shared helpers. |
| PMS proxy regression | `packages/pms/tests/alexandria-proxy.test.ts` only if implementation touches proxy behavior | No route change expected. If touched, prove `/api/library/catalog?libraryRoot=docs/alexandria/sweeps/alexandria-product` forwards as GET and non-GET requests remain rejected. |

Files and areas that should not change:

- `packages/ax/**`, unless a true #577 regression is discovered.
- `packages/alexandria-plugin/**`.
- `docs/alexandria/library/**`.
- `repos/**`.
- `docs/alexandria/plans/library-notepad-surface/**`.

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Product agents | None | No agent prompt or agent file changes. |
| Product skills | None | No plugin skill edits and no skill eval reruns. |
| Maintainer skills | None | The technical-planning skill is used for this artifact only. |
| CLI tools | None | No CLI behavior, stdout/stderr, exit code, or black-box CLI tests required. |
| PMS viewer | Adds a read-only top-level Notepad QA surface | PMS viewer unit, typecheck, build, and browser/manual validation. |
| PMS server proxy | No intended behavior change | Existing proxy tests remain sufficient unless implementation touches the proxy. |

## Data And Lens Contract

Use a pure model helper so the core behavior can be tested without rendering:

```ts
type NotepadLens = "generated" | "resolved" | "open";

interface NotepadModel {
  counts: {
    generated: number;
    open: number;
    resolved: number;
    misses: number;
    byState: Record<LibraryCatalogThreadResolutionState, number>;
  };
  availableLenses: NotepadLens[];
  generatedGroups: NotepadThreadGroup[];
  openGroups: NotepadThreadGroup[];
  resolvedGroups: NotepadResolvedStateGroup[];
  misses: NotepadResolvedThread[];
}
```

Implementation can choose a different internal shape, but it must preserve these
semantics:

1. `generatedThreads = catalog.threads.filter((thread) => thread.source === "authored")`.
2. `resolvedThreads = generatedThreads.filter((thread) => thread.resolution != null)`.
3. `openThreads = generatedThreads.filter((thread) => thread.resolution == null)`.
4. `counts.generated = generatedThreads.length`.
5. `counts.resolved = resolvedThreads.length`.
6. `counts.open = generatedThreads.length - resolvedThreads.length`.
7. `counts.misses = resolvedThreads.filter((thread) => thread.resolution.state === "invalidated").length`.
8. Generated and Open thread rows group by `emittingMove` and then `kind`,
   using the existing neutral fallback for absent moves.
9. Resolved row groups are state-first, then `emittingMove`/`kind` within each
   state group if needed for scanability.
10. `invalidated` threads are excluded from ordinary resolved row groups and
    appear only under Misses.
11. `availableLenses` is `["generated"]` when `counts.resolved === 0`; otherwise
    it is `["generated", "resolved", "open"]`.

## Implementation Steps

1. Mirror #577 resolution schema into the PMS viewer runtime schema.
   - Copy the state literal set and optional fields from
     `packages/viewer/src/app/runtime/schemas.ts`.
   - Add a PMS viewer runtime test that decodes every resolution state,
     `answerText`, `reason`, `patches`, top-level `resolvingEventId`, and an
     older catalog without `resolution`.
   - Keep `status` as `Schema.String`; N2 does not narrow coarse status.

2. Add a fixed root/config entry for the Notepad surface.
   - Define `ALEXANDRIA_PRODUCT_NOTEPAD_ROOT =
     "docs/alexandria/sweeps/alexandria-product"`.
   - Add `notepad` (or `pms-notepad` if implementation keeps the `PmsSurface`
     prefix style) to the surface union.
   - Add a `Notepad` tab to `SURFACE_TABS`.
   - Keep `PMS-Back` and `PMS-Drafts` request construction unchanged.
   - Prefer a small data config for fixed library surfaces if it reduces
     branching in `PmsApp.tsx`.

3. Build the pure Notepad model.
   - Create a focused helper under `components/library/`.
   - Filter to authored threads.
   - Derive generated/resolved/open/misses and counts from `thread.resolution`.
   - Add exact state-label mapping for the four visible resolution states.
   - Add state metadata for classes or test ids so distinct styling is
     testable without snapshot brittleness.
   - Preserve generated order where reasonable; within groups use stable
     sorting by move, kind, and question/id.

4. Add durable-resolution fixtures for PMS viewer tests.
   - Include at least seven generated threads:
     - one open;
     - one `director-ruled` with `answerText` and one patch;
     - one `settled-by-cascade` with machine reason;
     - one `settled-by-triage` with machine reason;
     - one `deferred-residual` with residual reason;
     - one `invalidated` miss;
     - one additional generated thread to prove grouping by
       `emittingMove`/`kind`.
   - Include at least one `source: "derived"` thread and assert it is excluded
     from all N2 counts.
   - Include an empty-ledger fixture by removing only `resolution` and
     projected `resolvingEventId` from the same generated baseline.

5. Implement `NotepadView`.
   - Render a compact header with counts and lens controls.
   - Default to Generated.
   - When only Generated is available, do not render disabled or duplicate
     Open/Resolved lens controls.
   - Render Generated rows for every generated thread, regardless of resolution.
   - Render Resolved rows for non-invalidated resolved threads with exact labels
     and visually distinct state styling.
   - Render `invalidated` threads only in a Misses rollup.
   - Render Open rows from `openThreads`.
   - Render question, builder reason, source evidence, resolving event id,
     ruling text/reason, and patch provenance through row details or in-surface
     links. Use projected metadata only.
   - Do not render controls whose labels or roles imply answering, resolving,
     editing, saving, applying, or writing.
   - Do not render planning/spec copy such as "Generated minus Resolved",
     "immutable baseline", "acceptance criteria", or data-model explanations.

6. Wire the top-level surface and badge.
   - Load the Notepad catalog through `useLibraryCatalog` with
     `{ libraryRoot: ALEXANDRIA_PRODUCT_NOTEPAD_ROOT }`.
   - Use a short auto-refresh interval, matching the existing Drafts 2-second
     interval, so live Front-of-House rulings update the badge without a page
     reload.
   - Compute the badge from the same Notepad model used by `NotepadView`.
   - Render no badge while loading or on catalog error; render `0` when loaded
     and fully burned down.
   - Reuse the loaded catalog for the Notepad surface so the badge and panel
     cannot diverge.
   - Ensure changing or relaunching a play run cannot change the count unless
     `/api/library/catalog` changes projected thread resolutions.

7. Preserve existing surfaces.
   - Keep the `Studio` tab and `StudioApp` path unchanged.
   - Keep PMS-Back rendering `EmptyLibraryView` with
     `studio/sweeps/playmaker-studio`.
   - Keep PMS-Drafts rendering `DraftsView` with
     `studio/sweeps/playmaker-studio` plus
     `studio/drafts/playmaker-studio/patches.json` and existing polling.
   - Do not move the N2 lenses into PMS-Back or PMS-Drafts.

8. Add deterministic tests.
   - Add Notepad model tests for counts, state grouping, derived-thread
     exclusion, Generated immutability, empty-ledger lens availability, and
     relaunch-resistant counting over a catalog clone with changed run-scoped
     non-thread data.
   - Add Notepad render tests for exact labels, distinct state markers/classes,
     Misses-only invalidated rendering, provenance details, absence of mutation
     controls, and absence of spec/validation copy.
   - Add PMS app/surface tests for tab labels, Notepad badge count, surface
     parsing, request construction, and existing PMS-Back/PMS-Drafts request
     regression.
   - Add or retain proxy tests only if implementation changes
     `alexandria-proxy.ts`.

9. Run verification and manual browser validation.
   - Run focused PMS viewer tests while iterating.
   - Run the full PMS viewer unit suite, typecheck, format check, and build.
   - Build the PMS viewer, start `pms start`, and verify the top-level Notepad
     at `http://127.0.0.1:4322/?surface=notepad` against the Alexandria product
     bundle with the Alexandria runtime available.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| PMS runtime schema focus | `cd packages/pms/viewer && bun test src/app/runtime/client.test.ts` | Verifies PMS viewer catalog decoding accepts #577 resolution metadata and older catalogs without it. Use the actual test filename chosen during implementation if different. |
| PMS Notepad model/render focus | `cd packages/pms/viewer && bun test src/components/library/NotepadView.test.tsx` | Verifies lens counts, labels, distinct states, Generated immutability, provenance, empty-ledger behavior, read-only negative checks, and no spec copy. |
| PMS app surface focus | `cd packages/pms/viewer && bun test src/app/PmsApp.test.tsx` | Verifies the top-level Notepad tab, badge count, request construction, and existing tab regressions. Use a small extracted pure surface helper if testing `PmsApp` directly is awkward. |
| PMS viewer full unit suite | `cd packages/pms/viewer && pnpm run test` | Catches regressions across Drafts, runtime schemas, and library/studio component tests. |
| PMS viewer typecheck | `cd packages/pms/viewer && pnpm run typecheck` | Confirms React, schema, and model types compile. |
| PMS viewer format check | `cd packages/pms/viewer && pnpm run format:check` | Confirms Prettier formatting for touched TS/TSX files. |
| PMS viewer build | `cd packages/pms/viewer && pnpm run build` | Confirms the Astro/React viewer builds for `pms start`. |
| PMS proxy regression if touched | `cd packages/pms && bun test tests/alexandria-proxy.test.ts` | Only required if proxy code changes; verifies GET-only catalog forwarding and identity guard behavior. |
| Manual browser validation | `pms start`, then open `http://127.0.0.1:4322/?surface=notepad` | Confirms the real PMS viewer shows top-level Notepad, the open badge, Generated/Resolved/Open behavior, and no overlap or broken styling. |

No AX CLI black-box tests are required unless implementation changes AX code.
No plugin validation is required unless implementation changes
`packages/alexandria-plugin/**`.

## Browser Validation Notes

`@alexandria/pms-viewer` currently has no Playwright script in its package
scripts. The required browser validation for this slice is therefore:

1. Build the PMS viewer with `cd packages/pms/viewer && pnpm run build`.
2. Start the PMS server with `pms start` from the repo root.
3. Start or point PMS at the Alexandria runtime for this checkout so the PMS
   proxy can serve `/api/library/catalog`.
4. Open `http://127.0.0.1:4322/?surface=notepad`.
5. Verify the Notepad tab is top-level, the badge equals the Open count, the
   Generated lens contains the full authored thread baseline, Resolved shows
   projected resolutions and provenance, Open shows only unresolved threads,
   Misses contains invalidated threads, and PMS-Back/PMS-Drafts still render.

If a PMS viewer browser harness is introduced before implementation, add the
same checks to that harness instead of leaving them manual-only.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| PMS viewer Notepad UI | No existing N2-specific tests. Existing PMS viewer tests cover Drafts and runtime/studio basics. | Add deterministic model/render/app tests and run PMS viewer build/manual browser validation. | Commands in Deterministic Verification. |
| AX projection/API | #577 has deterministic AX projection and runtime-server coverage. | No eval-harness rerun and no AX test changes unless AX code is touched. | If AX is touched unexpectedly, run the relevant #577 tests such as `cd packages/ax && bun test tests/library-thread-resolution.test.ts tests/runtime-server.test.ts`. |
| Product skills/workflows | Not changed. | No eval-harness rerun required under `EVALS.md`. | None. |
| CLI behavior | Not changed. | No CLI black-box tests required. | None. |
| Maintainer planning skill | Used only to produce this plan. | Contributor workflow use does not require eval-harness coverage. | None. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The top-level badge recreates the 25 -> 12 -> 25 illusion by reading run-scoped agenda state or coarse `status`. | Compute the badge only from authored catalog threads and `thread.resolution`; add model tests that changing run-scoped non-thread data does not alter counts. |
| Generated shrinks when resolutions exist because the component filters it through Open. | Use separate generated/resolved/open arrays in the model and add an immutability test where the same baseline gains resolutions but Generated count and rows remain unchanged. |
| Machine-made settlements visually collapse into director rulings. | Map each state to exact labels and testable state markers/classes; add render tests proving cascade and triage do not use the director marker. |
| `invalidated` appears as an ordinary resolved agenda row. | Keep invalidated in `counts.resolved` for burndown math but render it only under Misses; add a test that the invalidated question is absent from ordinary resolved groups. |
| PMS viewer decode rejects #577 catalog responses because only the product viewer schema was updated. | Mirror the schema before building the Notepad UI and add a decode test covering all five states. |
| The Notepad component accidentally includes derived fill-readiness threads. | Filter to `source === "authored"` and include a derived-thread fixture that must not affect counts or rows. |
| Provenance links tempt the implementation to add an event proxy. | Use projected `answerText`, `reason`, `resolvingEventId`, and `patches` only; keep `/api/events` out of PMS proxy scope. |
| Existing PMS-Back or PMS-Drafts request behavior regresses while adding surface config. | Pin request construction in tests: PMS-Back remains PMS root only, PMS-Drafts remains PMS root plus PMS draft log, Notepad uses Alexandria product root only. |
| Product/spec language leaks onto the surface. | Add render tests that representative forbidden phrases from the issue/plan do not appear; keep UI copy to lens names, labels, data, and compact empty states. |
| The PMS viewer lacks automated browser coverage for layout and interaction. | Use static/component tests for behavior, build validation for integration, and explicit manual browser validation through `pms start`; upgrade to Playwright if a PMS harness exists by implementation time. |
| The fixed Alexandria product root changes in a future bundle relocation. | Keep the root centralized in one Notepad surface config constant so the future change is a one-line request/config update plus expected test updates. |

## Acceptance / Exit Criteria

1. `pms start` serves a top-level tab labeled `Notepad` next to existing
   top-level PMS viewer tabs.
2. The Notepad surface requests the configured Alexandria product bundle root
   through `/api/library/catalog` and does not read raw files in the browser.
3. The Notepad tab badge equals the Open count from the Notepad model.
4. Lens counts against the durable-resolution fixture are correct:
   Generated = N authored threads, Resolved = all threads with
   `resolution` grouped by state, Misses = invalidated count, Open =
   N - Resolved.
5. Generated renders every generated thread and remains unchanged when
   resolution metadata exists.
6. Resolved renders the exact labels:
   `Ruled by the director`, `Settled by the frame ruling`,
   `Settled by triage`, and `Deferred to residuals`.
7. Cascade and triage rows are visually/testably distinct from director-ruled
   rows.
8. Invalidated threads appear only in Misses, not in ordinary Resolved or Open
   rows.
9. Open renders only generated threads without `resolution`.
10. A relaunch-like change to run-scoped non-thread data does not alter the
    badge or Resolved lens for the same projected catalog threads.
11. Resolved thread provenance reaches the ruling text or reason, the resolving
    event id, and patch ids/event ids when present.
12. With an empty-ledger catalog, the surface shows the Generated lens only.
13. Existing PMS-Back and PMS-Drafts top-level tabs still render and keep their
    request roots/logs.
14. The surface exposes no answer, resolve, edit, save, apply, or write
    controls.
15. The surface does not render data-model, acceptance, or validation/spec text.
16. No implementation writes to `threads.json`, sweep bundles, draft logs, or
    `docs/alexandria/library/**`.
17. PMS viewer focused tests, full unit tests, typecheck, format check, and
    build pass.
18. Manual browser validation through `pms start` passes, or equivalent PMS
    viewer browser automation is added and passes.

## Deferred Follow-Ups

1. Add real producer coverage for `settled-by-cascade`,
   `settled-by-triage`, and `invalidated` when the frame-ruling cascade and
   triage slices ship their producers.
2. Add a PMS Notepad fixed-root entry later if directors need a separate
   PlayMaker Studio notepad; do not merge it into the Alexandria product
   Notepad.
3. Add a dedicated PMS viewer Playwright suite if more top-level PMS surfaces
   require browser-level regression coverage.
4. Add richer patch-detail navigation only if the projected catalog grows patch
   detail beyond `{eventId, patchId}`. Do not add raw event-log browsing for N2.
5. Revisit the legacy nested `EmptyLibraryView` readiness Notepad label in a
   separate product-cleanup slice if the director wants only one visible
   "Notepad" word in the PMS viewer.
