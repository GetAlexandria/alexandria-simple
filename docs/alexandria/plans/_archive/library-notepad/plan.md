# Library Notepad Slice 4 - Director Burndown Notepad

Issue: `GetAlexandria/alexandria-internal#474`, "Library notepad slice 4 -
Repurpose Fill readiness into the director's burndown (question · status ·
provenance + thread peek, read-only)"

Ticket: `LIBNOTEPAD-004`

Run ID: `01KWB2SXZPBZKFW7HXSMG4ESS9`

Status: implementation-ready technical plan. This is a planning-only slice;
implementation files are intentionally untouched by this stage.

## Goal

Repurpose the viewer's existing `Fill readiness` tab into the director-facing
Library Notepad: one read-only burndown of the Back-of-House walk's open
threads, where each thread is readable as a director question with lifecycle
status and provenance.

The implemented view should keep the existing per-context presence readout, but
the thread worklist should become the burndown:

- thread rows lead with `question`, not the builder-register `reason`;
- rows show display-only `status`, `emittingMove`, and source-evidence count;
- the worklist header shows `N open · M answered · K residual`;
- a status filter joins the existing family, kind, and severity filters;
- clicking a row opens a thread case of the shared `LibraryPeek`.

## Source Review Notes

- Required repo guidance read: `CLAUDE.md`, `README.md`,
  `skills/maintainer/technical-planning/SKILL.md`,
  `skills/maintainer/technical-planning/plan-template.md`,
  `packages/viewer/README.md`, and `EVALS.md`.
- `packages/viewer/CLAUDE.md` does not exist in this checkout.
- The issue body provided in the task is the available GitHub issue source.
  `gh` is not installed in this environment, so no additional issue comments
  were available through the CLI.
- The issue references
  `docs/alexandria/plans/rebuilding-the-library/gaps-and-issues-upgrade.md`,
  but that file is not present in this checkout. The local viewer basis is the
  existing Empty Library plan and implementation:
  `docs/alexandria/plans/340-library-viewer-empty-library-view/plan.md`,
  `packages/viewer/src/components/library/EmptyLibraryView.tsx`, and
  `packages/viewer/src/components/library/library-peek-view-model.ts`.

## Scope

In scope:

- Rename the fill-readiness tab label to `Notepad` for fill-readiness bundles.
- Keep the `PRESENCE` section in `FillReadinessView` unchanged in purpose:
  per-context `fillable / gaps / hot spots`.
- Upgrade the `THREADS` worklist in `FillReadinessView` into the Notepad
  burndown.
- Render `LibraryCatalogThread.question` as each row's headline. If an older
  thread lacks a question, render a neutral missing-question headline rather
  than leaking `reason` into the row.
- Move the builder-register `reason` into the peek only.
- Render a display-only status chip for every row. Canonical statuses are
  `open`, `answered`, and `residual`; unknown status strings render as their raw
  lowercased value.
- Add a canonical status summary at the worklist header:
  `N open · M answered · K residual`.
- Add a status filter with `all`, `open`, `answered`, and `residual`, while
  keeping the existing family, kind, and severity filters and test ids.
- Show row provenance compactly: `via <emittingMove> · N refs`, or
  `via unknown move · no evidence` when fields are absent or empty.
- Add a `thread` case to `PeekSubject`, the peek model builder, and
  `LibraryPeek`.
- In the thread peek, show the question, reason, clickable card concerns,
  non-card concerns as labels, full provenance, and the existing
  `open in Catalog →` affordance.
- Add or update viewer fixtures and tests so the PMS-style bundle has the 12
  open-thread burndown and an empty-evidence case.

Out of scope:

- No answer, resolve, edit, or status mutation control in the viewer.
- No new runtime endpoint.
- No `/api/library/catalog` schema or AX domain model change.
- No `threads.json` write-back. Slice 3 owns lifecycle writes through Raven /
  Front-of-House.
- No changes to the legacy `coverage`, `gaps`, or `issues` tabs for catalogs
  without `fillReadiness`.
- No changes to Index, Workflow, or Catalog behavior except that `open in
  Catalog →` from a thread peek can focus the catalog on the best matching
  concern.
- No changes under `packages/alexandria-plugin/**`.
- No writes to `docs/alexandria/library/**`.

## Product-Plan Summary

The library-notepad series made threads the durable elicitation record:

- #466 made `LibraryCatalogThread` lifecycle-aware.
- #470 made the Back-of-House sweep emit the notepad fields.
- #471 made the Front-of-House agenda derive from `threads.json` and write
  resolution lifecycle back to the matching thread.

This slice is the viewer consumer. It does not create new data and does not
mutate thread lifecycle. It reflects the thread fields already arriving on
`/api/library/catalog`: `status`, `question`, `emittingMove`, `sourceEvidence`,
`family`, `kind`, `concerns`, `reason`, and `severity`.

The director-facing interpretation is:

- Presence answers "what is captured or missing by context?"
- Threads answer "what decisions, confusions, or residuals still need
  attention?"
- The Notepad tab is the single place to drain those threads in conversation
  with Raven.

## Current Gap

Verified against the checkout on 2026-06-30:

- `packages/viewer/src/app/runtime/schemas.ts` already decodes the needed
  thread fields:
  `question`, `status`, `emittingMove`, `sourceEvidence`, and
  `resolvingEventId`.
- The browser schema intentionally keeps `kind` and `status` as strings, so
  unknown future values do not break decode.
- `packages/ax/src/domain/library-catalog.ts` already defines the canonical
  thread data model. No AX model work is needed for this slice.
- `studio/sweeps/playmaker-studio/threads.json` contains 12 open threads with
  director-facing `question` text. One thread has empty `sourceEvidence`, which
  should exercise the `no evidence` row and peek state.
- `EmptyLibraryView.tsx` still labels the tab `Fill readiness`.
- `FillReadinessView` currently renders thread rows with:
  `family`, `kind`, concern links, `reason`, and `severity`.
- The current thread row does not show `question`, `status`, `emittingMove`, or
  `sourceEvidence`.
- The current filters are family, kind, and severity only.
- `PeekSubject` and `LibraryPeek` only support `card` and `context`.
- The existing browser test
  `Empty Library view renders fill-readiness presence and Thread worklist`
  asserts the old builder-register row behavior and should be updated rather
  than duplicated.
- The viewer fixture server does not currently expose a dedicated PMS Notepad
  fixture for the 12-thread acceptance case.

## Architectural Boundaries

- The viewer remains a client of `/api/library/catalog`. It must not read
  `threads.json` directly from the workspace.
- Effect stays at browser runtime boundaries. This slice should not introduce
  Effect into pure React rendering code.
- `LibraryCatalogThread.status` is display data in this slice. No status
  transition is initiated by the viewer.
- The existing shared in-place peek remains the only peek framework. Add a
  `thread` case to the existing model and component instead of introducing a
  second drawer.
- The `question` is director-register display text. The `reason` is
  builder-register explanation and belongs in the thread peek.
- The Notepad status summary counts the three canonical statuses. Unknown
  statuses remain visible under `all` with a raw chip, but they do not create a
  new filter option in this slice.
- `sourceEvidence` is a compact row count and a full peek list. Empty evidence
  is a valid state, rendered as `no evidence`.
- Concern-to-card links in the thread peek should reuse the existing card peek
  path. They should not navigate directly away from the Notepad.
- `open in Catalog →` from a thread peek is best-effort:
  first focus a resolvable card concern, otherwise focus a matching context,
  otherwise switch to Catalog without a selected item.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Viewer Notepad tab | `packages/viewer/src/components/library/EmptyLibraryView.tsx` | Rename the fill-readiness tab to `Notepad`; upgrade the thread worklist rows, summary, status filter, and row click handling while preserving the presence section |
| Shared peek model | `packages/viewer/src/components/library/library-peek-view-model.ts` | Extend `LibraryPeekModel` with a `thread` kind and thread-specific fields, preferably through a pure `buildThreadPeek` helper |
| Shared peek rendering | `packages/viewer/src/components/library/EmptyLibraryView.tsx` | Render thread peek sections for question, reason, concerns, and provenance; keep close and `open in Catalog →` behavior |
| Viewer fixtures | `packages/viewer/src/components/library/sample-catalog.ts`, `packages/viewer/tests/serve-viewer-fixture.ts` | Add or update a PMS-style Notepad fixture with 12 open threads, lifecycle fields, and an empty-evidence thread |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Update old fill-readiness worklist coverage and add PMS Notepad acceptance coverage |
| Viewer unit tests | `packages/viewer/src/components/library/EmptyLibraryView.test.tsx`, `packages/viewer/src/components/library/library-peek-view-model.test.ts` | Cover thread peek rendering, reason placement, provenance formatting, and graceful missing/unknown values |
| Viewer runtime decode tests | `packages/viewer/src/app/runtime/client.test.ts` | Keep existing lifecycle decode coverage; add only if fixture changes expose an uncovered decode regression |

Files that should not change:

- `packages/ax/src/domain/library-catalog.ts`
- `packages/ax/src/effects/runtime-server.ts`
- `packages/alexandria-plugin/**`
- `docs/alexandria/library/**`
- `repos/**`

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| Plugin workflows | None | None |
| CLI behavior | None | None |

No reusable agent, skill, template, workflow, or CLI behavior changes in this
slice. The director answers threads through Raven / Front-of-House; the viewer
only displays the current projection.

## Implementation Steps

1. Add small display helpers in `EmptyLibraryView.tsx`.
   - Define canonical statuses: `open`, `answered`, `residual`.
   - Add status label/class helpers that accept any string and render unknown
     values as lowercased raw labels.
   - Add a question-headline helper that uses a non-empty `question` and falls
     back to a neutral missing-question string.
   - Add provenance helpers for `emittingMove` and `sourceEvidence` count.
   - Add status-count summary construction over all threads, not just filtered
     threads.

2. Rename the tab in the fill-readiness tab set.
   - Change the visible label from `Fill readiness` to `Notepad` only for the
     `hasFillReadiness` tab set.
   - Keep the tab id as `readiness` so route/state behavior and internal tab
     logic stay narrow.
   - Update tests that click the tab by label.

3. Upgrade `FillReadinessView`.
   - Add local `statusFilter` state with values
     `all | open | answered | residual`.
   - Include `statusFilter` in `filteredThreads`.
   - Keep `thread-filter-family`, `thread-filter-kind`, and
     `thread-filter-severity` test ids intact.
   - Add `thread-filter-status` beside the existing filters.
   - Render the status summary near the `Threads` heading.
   - Render each row as a clickable thread target, while preserving clickable
     concern card links where they remain in the row.
   - Make the row headline the question text and remove row-level rendering of
     `reason`.
   - Render row chips for status, family, kind, severity, and compact
     provenance.
   - Render a clear empty state when filters produce no rows, including
     `answered` on the PMS fixture.

4. Add a thread peek model.
   - Extend `LibraryPeekModel.kind` to include `thread`.
   - Add thread-specific model fields for `threadId`, `status`, `question`,
     `reason`, `concerns`, `emittingMove`, and `sourceEvidence`.
   - Prefer a pure `buildThreadPeek(thread, options)` helper in
     `library-peek-view-model.ts` so formatting and fallback behavior can be
     unit-tested outside React.
   - For plane/context labels, derive from the first concern with plane/context
     when present; otherwise use neutral Notepad labels.

5. Wire thread subjects through `EmptyLibraryView`.
   - Extend `PeekSubject` with `{ kind: "thread"; threadId: string }`.
   - Build the thread peek by looking up `catalog.threads`.
   - Pass an `onSelectThread` callback into `FillReadinessView`.
   - Add `openThreadPeek(thread.id)` and keep card/context peek helpers
     unchanged.
   - Reset thread peeks on catalog refresh the same way card/context peeks are
     reset today.

6. Extend `LibraryPeek` rendering.
   - Keep the shell, close button, backdrop, Escape handling, and
     `library-peek-open-catalog` test id.
   - For `kind === "thread"`, render:
     - the question as the title and/or first section;
     - a display-only status chip;
     - `reason` in a builder-detail section;
     - concerns as clickable card buttons when `cardId` resolves;
     - non-card concerns as compact labels;
     - provenance with `emittingMove` and every `sourceEvidence` ref, or
       `no evidence`.
   - Ensure the thread peek does not render answer, resolve, edit, form, save,
     or mutation controls.

7. Implement `open in Catalog →` for thread peeks.
   - If a thread concern has a resolvable `cardId`, call the existing
     `selectCardInCatalog`.
   - Otherwise, if a concern has `plane` and `context`, find the matching area
     and call `openContextInCatalog`.
   - Otherwise, switch to the Catalog tab and close the peek without selecting
     an item.

8. Update fixtures.
   - Update `sampleProductCardReadinessCatalog` so its threads include
     `question`, `emittingMove`, and `sourceEvidence`.
   - Include at least one `answered` and one `residual` thread in a small unit
     or browser fixture so the status filter can be tested without depending
     only on synthetic DOM setup.
   - Add a PMS-style Notepad fixture with the 12 open threads from
     `studio/sweeps/playmaker-studio/threads.json`, including the empty
     `sourceEvidence` thread.
   - Expose the PMS fixture through `serve-viewer-fixture.ts` with an explicit
     fixture mode rather than depending on the fixture server to read local
     workspace files.

9. Update deterministic tests.
   - Update the existing fill-readiness browser test to use the `Notepad` label,
     question headlines, status chips, provenance, and thread peek behavior.
   - Add browser coverage for the PMS 12-open summary, empty-evidence row,
     `answered` empty state, and family/kind/severity filters.
   - Add browser coverage that row click opens a thread peek, close returns to
     the worklist, concern card click opens that card's peek, and
     `open in Catalog →` switches to Catalog.
   - Add unit coverage for `buildThreadPeek` and `LibraryPeek` thread rendering.
   - Keep or update the existing runtime decode test proving unknown statuses
     decode and render without crashing.

10. Run verification.
    - Run focused viewer unit tests while iterating.
    - Run the full viewer test, check, build, and Playwright suites before
      handoff.
    - Manually verify `ax start viewer` at
      `/library/empty?libraryRoot=studio/sweeps/playmaker-studio` if the local
      runtime is available.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Focused viewer unit tests | `pnpm --filter @alexandria/viewer exec bun test src/components/library/EmptyLibraryView.test.tsx src/components/library/library-peek-view-model.test.ts src/app/runtime/client.test.ts` | Verifies thread peek model/rendering and preserves lifecycle decode behavior |
| Viewer full unit suite | `pnpm --filter @alexandria/viewer run test` | Catches regressions across Empty Library, workflow, routes, runtime, and related component helpers |
| Viewer static check | `pnpm --filter @alexandria/viewer run check` | Runs Astro/TypeScript validation for the viewer |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Proves the static viewer builds with the updated component and fixtures |
| Viewer browser suite | `pnpm --filter @alexandria/viewer run test:e2e` | Verifies Notepad behavior in the browser, including filters, empty states, peeks, and no overflow |
| Manual product check | `ax start viewer`, then open `/library/empty?libraryRoot=studio/sweeps/playmaker-studio` | Confirms the real PMS bundle shows 12 open rows, the expected summary, provenance, and peek behavior |

No AX CLI black-box tests are required because this slice does not change CLI
behavior, exit codes, runtime endpoints, or AX domain parsing.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer UI | Deterministic unit, build, and Playwright coverage | Add/update deterministic viewer tests; no eval-harness rerun | N/A |
| Viewer runtime decode | Existing `client.test.ts` lifecycle field coverage | Preserve and extend only if implementation changes decode assumptions | N/A |
| AX runtime/API | Existing AX tests from slices 1-3 cover catalog thread production and serving | No AX eval or test change required unless implementation unexpectedly touches AX | N/A |
| Agents / product skills | Not changed | No eval rerun | N/A |
| Plugin payload | Not changed | Plugin validation not required | N/A |

No eval-harness coverage is required for this slice because no reusable
product-facing agent, skill, template, or plugin workflow behavior changes. The
quality gate is deterministic Viewer validation plus the manual PMS Notepad
check.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The worklist could still read like a builder diagnostics table if `reason` remains visible in rows | Make `question` the only row headline; add tests asserting PMS row questions are visible and representative reasons are absent from rows but present in the peek |
| Unknown thread statuses could break rendering or filtering | Keep status as a free string, render unknown chips as raw lowercased labels, and only expose canonical filter options |
| The status summary could become misleading when filters are active | Compute summary from all threads, not `filteredThreads`, so it remains the burndown read |
| Empty `sourceEvidence` could produce awkward punctuation or layout gaps | Centralize provenance formatting and test the PMS empty-evidence thread for `no evidence` in both row and peek |
| Row click and concern-card click could fight each other | Stop propagation on concern buttons or structure the row with an explicit row button target; browser-test concern click opens the card peek |
| Thread `open in Catalog →` may not have an obvious target for noun-only concerns | Use best-effort card, then context, then plain Catalog fallback; test at least the card-concern path |
| The shared peek model could become a loose union with many optional fields | Add a discriminated `thread` model branch and pure builder tests instead of scattering thread rendering assumptions through JSX |
| A fixture copied from PMS threads could drift from the real PMS bundle | Name the fixture PMS-style and keep the manual `ax start viewer` check as the real-bundle verification |
| The viewer could accidentally grow mutation controls for answering/resolving | Keep this slice display-only and add negative tests that no answer/resolve/edit controls appear in the Notepad or thread peek |
| Legacy non-fill-readiness tabs could regress while the shared component changes | Keep `LEGACY_CATALOG_TABS` unchanged and preserve the existing legacy browser regression |

## Acceptance / Exit Criteria

1. On `/library/empty?libraryRoot=studio/sweeps/playmaker-studio`, the
   repurposed tab is labeled `Notepad`.
2. The `Presence` section still shows per-context `fillable / gaps / hot spots`.
3. The Notepad worklist shows 12 PMS thread rows.
4. Each PMS row leads with its `question`.
5. The builder `reason` does not appear in PMS rows.
6. The worklist header reads `12 open · 0 answered · 0 residual` for the PMS
   bundle.
7. Each row shows a display-only status chip.
8. Each row shows `emittingMove` and a `sourceEvidence` count.
9. The PMS thread with empty `sourceEvidence` shows `no evidence` and does not
   break the row layout.
10. The status filter supports `all`, `open`, `answered`, and `residual`.
11. Selecting `answered` on the PMS fixture yields an empty worklist message and
    no crash.
12. Family, kind, and severity filters still work, and existing
    `thread-filter-*` test ids continue to work.
13. Clicking a thread row opens a shared `LibraryPeek` thread peek.
14. The thread peek shows the question, builder reason, concern card links,
    full provenance, and `open in Catalog →`.
15. Clicking a concern card in the thread peek opens that card's peek.
16. Closing the peek returns to the Notepad worklist.
17. `open in Catalog →` from a thread peek switches to the Catalog tab and
    focuses the best matching concern when one exists.
18. The Notepad and thread peek expose no answer, resolve, edit, save, or status
    mutation controls.
19. Index, Workflow, and Catalog tabs still pass their existing browser
    regressions.
20. Legacy non-`fillReadiness` catalogs still show the existing
    `Catalog / Coverage / Gaps / Issues` tabs unchanged.

## Deferred Follow-Ups

1. Director-facing burndown glow-up after the read-only Notepad behavior is
   stable.
2. Richer grouping or ordering for large thread lists, if real walks exceed the
   current compact worklist scale.
3. Optional display affordances for `resolvingEventId` once directors need to
   audit which Raven answer flipped a thread.
4. Any answer or resolve workflow remains Raven / Front-of-House work, not a
   viewer control, unless a later director ruling changes that boundary.
