# Library Notepad Thread Peek Empty Plane/Context

Issue: `GetAlexandria/alexandria-internal#502`, "Library notepad thread
peek must treat empty plane/context like absent"

Status: implementation-ready technical plan. This is a planning-only slice;
implementation files are intentionally untouched by this stage.

## Goal

Make the viewer's Library Notepad thread peek treat empty-string and
whitespace-only concern `plane` / `context` values the same way it treats absent
values. A thread concern only has a present plane or context when the value is a
non-empty, non-whitespace string.

The visible result should match the existing absent-value path:

- a thread concern with absent `plane` and absent `context` renders
  `Notepad / Notepad` in the peek header;
- an absent plane or context never creates a blank label;
- concern-chip labels join only present parts and never render leading or
  trailing ` / ` separators.

## Source Review Notes

- Required repo guidance read: `CLAUDE.md`, `README.md`,
  `skills/maintainer/technical-planning/SKILL.md`,
  `skills/maintainer/technical-planning/plan-template.md`,
  `packages/viewer/README.md`, and `EVALS.md`.
- `packages/viewer/CLAUDE.md` does not exist in this checkout, so
  `packages/viewer/README.md` is the package-local guidance for this slice.
- The planning skill body references
  `contributor-skills/technical-planning/plan-template.md`, but the template is
  present at `skills/maintainer/technical-planning/plan-template.md`.
- The issue body supplied in the task is the available GitHub issue source.
  `gh issue view 502 --repo GetAlexandria/alexandria-internal --comments` could
  not run because `gh` is not installed in this environment.
- Related prior context read:
  `docs/alexandria/plans/library-notepad/plan.md`, which introduced the viewer
  thread peek for the Library Notepad.
- No existing per-issue plan directory for issue #502 was present.

## Scope

In scope:

- Update the Library Notepad thread peek view model in
  `packages/viewer/src/components/library/library-peek-view-model.ts`.
- Centralize the thread concern presence test so `null`, `undefined`, `""`, and
  whitespace-only strings are absent at every affected call site.
- Apply that presence test to:
  - context-concern label construction;
  - `threadConcernPlane`;
  - `threadConcernContext`;
  - anchored concern selection for the thread peek header.
- Preserve the existing `Notepad` fallback string for absent header
  `plane` / `contextLabel`.
- Add focused regression coverage for empty-string, whitespace-only, null,
  fully-populated, and one-part-absent concern cases.
- Run viewer unit, check, build, and browser validation for the viewer behavior
  change.

## Non-Goals

- No change to thread data files, scanner output, event records, or runtime
  producer behavior.
- No change to `/api/library/catalog` response shape or viewer runtime schemas.
- No change to AX CLI behavior, exit codes, or output fields.
- No change to `packages/alexandria-plugin/**`.
- No write to `docs/alexandria/library/**`.
- No broad rework of Library Notepad layout, filters, status labels, or thread
  lifecycle behavior.
- No change to card or context peek behavior outside the shared thread concern
  helpers.

## Product-Plan Summary

No separate product-level plan is linked for issue #502. The relevant product
context is the Library Notepad viewer work from issue #474:

- thread records are already projected into the viewer catalog;
- the viewer builds a read-only thread peek from those records;
- the thread peek is a director-facing surface and should degrade cleanly for
  sparse or runtime-originated records.

Issue #502 is a narrow polish/regression slice on that existing viewer
consumer. It does not introduce new product workflow or new persisted thread
state.

## Current Gap

Verified against the checkout on 2026-06-30:

- `LibraryCatalogThreadConcernSchema` in
  `packages/viewer/src/app/runtime/schemas.ts` accepts optional string
  `plane`, `context`, and `label` fields. The schema is not the right place for
  this change because the issue is display normalization, not a data contract
  change.
- `threadConcernLabel` in
  `packages/viewer/src/components/library/library-peek-view-model.ts` filters
  context-concern label parts with `part != null`. Empty strings and
  whitespace-only strings pass through and can produce `" / "`,
  `"product / "`, or `" / context"`.
- `threadConcernPlane` and `threadConcernContext` use nullish coalescing. An
  empty string on the concern wins over a resolvable card fallback and then
  flows into the peek model as a present value.
- `buildThreadPeek` selects `anchoredConcern` with
  `concern.plane != null && concern.context != null`. After empty strings have
  flowed into the normalized concern model, they satisfy the anchor predicate.
- The header render path in `EmptyLibraryView.tsx` already uses the model's
  `plane` and `contextLabel` fields. The renderer should not need a special
  case if the view model normalizes absence correctly.
- Existing tests cover ordinary thread peek data and older absent fields, but
  they do not cover empty-string, whitespace-only, null, or one-part-absent
  concern labels.

## Architectural Boundaries

- The viewer remains a client of the catalog runtime. Do not make the viewer
  read source thread files directly.
- Keep this as a pure view-model normalization fix. Do not introduce Effect into
  `library-peek-view-model.ts`; viewer README guidance reserves Effect for
  browser runtime boundaries.
- Normalize at the shared helper boundary before building `PeekThreadConcern`
  objects. That keeps anchor selection, header labels, and chip labels aligned.
- Do not broaden runtime schemas to accept `null` unless implementation finds an
  existing decode requirement. The model helper can still accept
  `string | null | undefined` so direct or legacy callers get consistent
  fallback behavior.
- Preserve non-empty real values. If implementation trims returned values, it
  should do so consistently for concern display parts and should not change
  already-populated catalog fixtures beyond removing incidental surrounding
  whitespace from labels.
- Keep the fallback copy `Notepad` unchanged.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Viewer library peek model | `packages/viewer/src/components/library/library-peek-view-model.ts` | Add a shared thread concern text-presence helper and use it for concern label parts, plane/context derivation, and anchor selection |
| Viewer thread peek model tests | `packages/viewer/src/components/library/library-peek-view-model.test.ts` | Add the issue #502 matrix: empty string, whitespace-only, null, fully populated, and one-part-absent chip cases |
| Viewer thread peek render tests | `packages/viewer/src/components/library/EmptyLibraryView.test.tsx` | Add or extend a focused render assertion only if model tests alone do not prove the final header/chip markup |

Files that should not change:

- `packages/viewer/src/app/runtime/schemas.ts`
- `packages/ax/**`
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
| Viewer UI | Thread peek labels normalize empty/whitespace concern plane/context values as absent | Viewer unit/build/browser validation |

No reusable agent, skill, template, workflow, or CLI behavior changes in this
slice.

## Implementation Steps

1. Add a small helper in `library-peek-view-model.ts`, close to the existing
   thread helper functions:
   - proposed shape: `function presentThreadConcernPart(value: string | null | undefined): string | undefined`;
   - return `undefined` when `value == null || value.trim() === ""`;
   - otherwise return the trimmed string, so display and anchor selection use
     the same normalized value.

2. Update `threadConcernLabel`.
   - Keep explicit non-empty `concern.label` as the first preference, using the
     same presence helper.
   - Keep resolvable card labels and unresolved `cardId` labels unchanged.
   - For `type === "context"`, build the label from
     `[presentPlane, presentContext]`.
   - Join only present parts with `" / "`.
   - If neither part is present, render `Notepad` for the context concern
     rather than an empty chip.
   - Keep the existing final fallback `uncarded noun` for non-context,
     non-card concerns.

3. Update `threadConcernPlane` and `threadConcernContext`.
   - Prefer a present concern value.
   - If the concern value is absent and `cardId` resolves, fall back to the
     resolved card's plane/context, normalized through the same helper.
   - Return `undefined` when neither source has a present value.

4. Update `buildThreadPeek` concern construction.
   - Continue omitting `plane` and `context` from `PeekThreadConcern` when the
     helper returns `undefined`.
   - Keep `cardId`, `label`, and `type` behavior unchanged except for the
     context concern label cleanup.

5. Update anchor selection.
   - Select the first concern whose normalized `plane` and normalized `context`
     are both present.
   - If no such concern exists, keep the existing fallback to the first concern.
   - Preserve header fallbacks:
     - model `plane`: `anchoredConcern?.plane ?? "Notepad"`;
     - model `contextLabel`: `anchoredConcern?.context ?? "Notepad"`;
     - model `context`: `anchoredConcern?.context ?? "threads"`.

6. Add focused model tests in `library-peek-view-model.test.ts`.
   - Empty-string context concern:
     - input `plane: ""`, `context: ""`;
     - expect model `plane` to be `Notepad`;
     - expect `contextLabel` to be `Notepad`;
     - expect the concern not to carry empty `plane` or `context`;
     - expect the context-concern label not to contain `" / "`.
   - Whitespace-only context concern:
     - input `plane: "   "`, `context: "\t"`;
     - expect the same model behavior as the empty-string case.
   - Null regression:
     - use a narrow test cast if needed because runtime schemas expose optional
       strings rather than nullable strings;
     - expect the existing Notepad fallback behavior to remain.
   - Fully-populated concern:
     - input real plane/context;
     - expect model `plane`, `contextLabel`, and context concern label to match
       the existing populated behavior.
   - One-part-absent chip:
     - e.g. `plane: ""`, `context: "brief"`;
     - expect the concern label to be `"brief"`, with no leading/trailing
       separator.
     - mirror with present plane and absent context if the implementation can
       add it without making the test noisy.

7. Add a render-level regression in `EmptyLibraryView.test.tsx` if needed.
   - Render `buildThreadPeek` through the existing peek renderer.
   - Assert the header contains `Notepad / Notepad` for the empty-string case.
   - Assert no rendered concern chip contains a leading, trailing, or standalone
     ` / `.

8. Run deterministic validation.
   - Start with the focused model/render tests while iterating.
   - Finish with the viewer package test, check, build, and browser validation
     commands listed below.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Focused thread peek tests | `pnpm --filter @alexandria/viewer exec bun test src/components/library/library-peek-view-model.test.ts src/components/library/EmptyLibraryView.test.tsx` | Verifies the exact view-model and rendered peek regression surface |
| Viewer full unit suite | `pnpm --filter @alexandria/viewer run test` | Catches related viewer regressions across library, runtime, and Studio tests |
| Viewer static check | `pnpm --filter @alexandria/viewer run check` | Runs Astro/TypeScript validation for the changed viewer code |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Proves the static viewer still builds |
| Viewer browser suite | `pnpm --filter @alexandria/viewer run test:e2e` | Satisfies viewer browser validation for a visible peek behavior change |

No AX CLI black-box tests are required because this slice does not change CLI
behavior, exit codes, runtime endpoints, or AX domain parsing.

Plugin validation is not required because this slice does not change
`packages/alexandria-plugin/**`.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer library peek | Deterministic viewer unit/build/browser coverage | Add focused deterministic tests; no eval harness rerun | N/A |
| AX CLI/runtime | Not changed | No eval or CLI black-box rerun required | N/A |
| Agents/product skills/plugin workflows | Not changed | No eval rerun required | N/A |

No eval-harness coverage is required for this slice because it changes a viewer
display model only. `EVALS.md` requires eval reruns for reusable product
skills, agents, plugin workflows, and harness behavior; none of those surfaces
change here.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Normalization is applied at only one call site and anchor selection drifts from chip labeling | Use one shared helper for label parts, plane/context derivation, and anchor selection; cover all three with the test matrix |
| A context concern with both parts absent could still render as an empty chip | Add an explicit `Notepad` fallback for context-concern labels when no present parts remain |
| A card concern with an empty authored plane/context could stop falling back to the resolved card | In `threadConcernPlane` and `threadConcernContext`, treat authored empty/whitespace as absent before consulting `cardsById` |
| Null regression coverage may fight the TypeScript schema type | Keep runtime schemas unchanged and use a narrow test cast to exercise the model helper's legacy/null tolerance |
| Trimming present values could be seen as a display change for unusual fixtures | Limit trimming to thread concern display/anchor parts and add a fully-populated regression test showing ordinary values render unchanged |
| Browser validation could be slow for a small model fix | Still include the browser command in exit validation because the issue is a visible viewer rendering defect |

## Acceptance / Exit Criteria

1. A context concern with `plane: ""` and `context: ""` does not become the
   anchored concern by virtue of empty strings and renders `Notepad / Notepad`
   in the peek header.
2. A context concern with whitespace-only `plane` and `context` behaves the same
   as the empty-string case.
3. A context concern with `null` or absent `plane` and `context` continues to
   render the existing `Notepad` header fallback.
4. A concern chip with one absent part shows the present part only, with no
   leading or trailing ` / `.
5. Fully-populated concerns still render the same plane/context header and
   `"plane / context"` chip label as before.
6. Card concerns still resolve `plane`, `context`, and label from `cardsById`
   when available.
7. Focused viewer tests pass.
8. Full viewer unit, check, build, and browser validation are run or any
   inability to run them is documented in the implementation handoff.

## Deferred Follow-Ups

1. Consider a broader viewer text-normalization helper only if another surface
   repeats this exact absent-string bug.
2. Consider runtime schema nullability only if real `/api/library/catalog`
   responses are observed carrying JSON `null` for concern `plane` or
   `context`. Do not broaden the schema as part of this display-only fix.
3. Add a Playwright fixture dedicated to malformed/sparse Notepad threads only
   if similar rendering defects recur beyond this unit-testable view-model
   boundary.
