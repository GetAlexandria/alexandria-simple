# Issue 461 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#461`
- Goal: make `alexandria-viewer build` quiet and graceful when it targets a normal full Alexandria docs root or a partial docs root that omits implementation-plan content.
- Linked product plan: issue summary only; no separate checked-in product plan was linked from the provided issue context.

## Scope

- Eliminate repeated Shiki singleton warnings from successful viewer builds.
- Eliminate empty-collection warnings when a docs root has cards but no `implementation-plans/` content.
- Preserve the viewer's successful static-build behavior and current route contracts for cards, plans, outcomes, and tickets.
- Add deterministic black-box coverage for the quiet-build contract on both the checked-in docs root and the partial `taskflow-healthy` fixture docs root.

## Non-Goals

- Reworking the viewer's page layouts, plan-detail presentation, or build output structure.
- Broadly changing Astro content-collection usage outside the viewer plan pages.
- Adding synthetic placeholder plan pages for libraries that do not define implementation plans.
- Agent, skill, template, or eval-harness changes.

## Linked Product-Plan Summary

- The issue summary describes two noisy-but-successful cases on current `main`:
  - `./bin/alexandria-viewer build --library docs/alexandria` succeeds but emits repeated Shiki singleton warnings.
  - `./bin/alexandria-viewer build --library tests/fixtures/taskflow-healthy/docs/alexandria` succeeds but emits `implementationPlans` collection warnings because that docs root does not carry plan content.
- The intended outcome is a viewer build that still serves partial libraries honestly, without treating absent optional content as a warning-worthy failure.

## Current Implementation Gap

- `packages/viewer/src/lib/card-sections.ts` caches markdown processors by `routeLookup` object identity via `WeakMap`.
- `packages/viewer/src/pages/library/[...slug].astro` recreates an equivalent `routeLookup` map for every generated card page, so the build repeatedly creates markdown processors and downstream Shiki highlighters.
- The three plan page modules call `getCollection("implementationPlans")` unconditionally. Astro treats an empty collection as warnable, so docs roots without plan files print the same warning once per plan surface even though the build completes successfully.
- Existing viewer tests assert successful builds and rendered output, but they do not lock in a clean stderr contract for these two common success cases.

## Architectural Boundaries

- Keep the Shiki fix in the viewer markdown/rendering layer; do not paper over the warning by filtering stderr at the CLI boundary.
- Keep the partial-content fix at the implementation-plan collection boundary; absent implementation plans should still yield zero static paths, but without bypassing Astro's collection validation or content-store wiring.
- Preserve the viewer package's ownership of docs-root and content discovery semantics.
- Keep this slice deterministic and build-focused; do not widen it into viewer serve-mode redesign or general Astro infrastructure changes.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/461-viewer-quiet-partial-docs-root-builds/plan.md` | Captures repo-specific scope, coverage, and risk for issue `#461` |
| Viewer card markdown rendering | `packages/viewer/src/lib/card-sections.ts`, possibly `packages/viewer/src/lib/library-routes.ts` or a neighboring helper | Equivalent route maps reuse a stable markdown processor/highlighter instead of creating a new Shiki-backed processor per card page |
| Viewer plan-page data loading | `packages/viewer/src/content.config.ts`, `packages/viewer/src/pages/plans/[name].astro`, `packages/viewer/src/pages/plans/[name]/outcomes/[id].astro`, `packages/viewer/src/pages/plans/[name]/tickets/[id].astro`, `packages/viewer/src/lib/implementation-plans.ts` | Docs roots with no plan files build cleanly with zero plan routes and no empty-collection warnings while the plan pages keep using the Astro collection surface |
| Deterministic coverage | `src/tools/viewer.test.ts` | Black-box viewer-build tests assert successful builds stay quiet for the checked-in docs root and the partial fixture docs root |
| Maintainer-facing CLI notes | `docs/alexandria/cli-report.md` | Record the product conclusion and shipped quiet-build contract required by issue acceptance |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| Viewer CLI | Successful `alexandria-viewer build` runs no longer emit avoidable warning noise for full docs roots or docs roots that omit implementation plans | Keep viewer CLI tests aligned and update the CLI report with the shipped quiet-build contract |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer CLI black-box tests | `bun test src/tools/viewer.test.ts` | Covers the real wrapper/runtime build behavior and asserts quiet success for the two issue paths |
| Repo quality gate | `bun run check` | Validates TypeScript, markdown, shell, and formatting for the touched slice, including the required CLI-report update |
| Wider regression coverage | `bun test` | Confirms the viewer changes do not regress the broader deterministic suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer CLI build behavior | Deterministic CLI coverage only | No eval rerun needed | N/A |
| Agents / skills | Not changed in this issue | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Reusing markdown processors too aggressively could stale-route wikilinks after library changes during `serve` mode or retain every historical route signature | Cache by a stable route-lookup signature and bound the cache size so changed library entries can still refresh to a new processor without unbounded processor retention during long `serve` sessions |
| Synthesizing an empty implementation-plan entry could leak a fake route into the viewer | Mark the sentinel entry explicitly and filter it out in every plan `getStaticPaths()` call so Astro still sees a non-empty collection while users still see zero plan routes |
| Quiet-build assertions could accidentally hide legitimate build failures if the tests only grep stderr | Keep success-exit and output-page assertions alongside stderr assertions so the tests still prove the build genuinely completed |
| The full checked-in docs-root build could remain noisy because one warning path is fixed while another remains | Reproduce both issue scenarios before and after the patch and assert the specific noisy substrings stay absent in the black-box tests |
| The runtime fix can land while the issue stays open if the maintainer-facing contract doc is not updated | Treat the CLI report update as required acceptance scope instead of optional polish and verify it through the markdown/check gate |

## Implementation Steps

1. Add this issue-specific plan under `docs/alexandria/plans/461-viewer-quiet-partial-docs-root-builds/`.
2. Reproduce the current noisy builds for `docs/alexandria` and `tests/fixtures/taskflow-healthy/docs/alexandria`.
3. Refactor the card markdown processor cache so equivalent route lookups reuse one processor/highlighter lifecycle during build.
4. Refactor the implementation-plan collection to stay non-empty with a filtered sentinel entry so the plan pages can keep using `getCollection()` without emitting empty-collection warnings.
5. Extend `src/tools/viewer.test.ts` with black-box assertions for quiet successful builds on both issue paths.
6. Update `docs/alexandria/cli-report.md` with the product conclusion and final quiet-build contract for full docs roots and partial docs roots without implementation plans.
7. Run targeted viewer tests, then `bun run check`, then `bun test`.
8. Perform a local review pass against the diff and this plan before PR handoff.

## Acceptance / Exit Criteria

1. `bin/alexandria-viewer build --library docs/alexandria` succeeds without repeated Shiki singleton warnings.
2. `bin/alexandria-viewer build --library tests/fixtures/taskflow-healthy/docs/alexandria` succeeds without `implementationPlans` empty-collection warnings.
3. The viewer still builds the expected card and index routes for both issue scenarios.
4. `src/tools/viewer.test.ts` covers the quiet-success contract and passes locally.
5. `bun run check` passes locally.
6. `bun test` passes locally.
7. `docs/alexandria/cli-report.md` explicitly records the shipped quiet-build contract required by the issue.

## Deferred Follow-Ups

1. If other viewer renderers instantiate markdown processors per request, consolidate them behind a shared helper in a follow-up slice.
2. If maintainer docs need a broader statement about optional viewer content surfaces, document that separately instead of widening this issue beyond build-noise hardening.
