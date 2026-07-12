# Issue 366 Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#366`
- Goal: add a Catalog tab to the viewer's `/studio` surface that renders the shared Studio registry as `Division -> Function -> Play`, deriving each division face from the registry's `DIVISIONS` map.
- Run id: `01KVV6RK1FFCMVNDDVMZR96J3B`
- Linked product plans and rulings:
  - `docs/alexandria/plans/studio-fixes/issue-plan.md`
  - `docs/alexandria/plans/studio-fixes/org-model.md`
  - `docs/alexandria/plans/studio-fixes/board-surface-decision.md`
- GitHub issue comments checked: the connector returned only the Fabro local run link; no extra technical feedback beyond the issue text.

## Scope

- Extend `GET /api/studio/registry` so it returns the org model from `studio/plays/registry.js`:
  - `divisions` from `DIVISIONS`
  - existing `rungs` from `RUNGS`
  - existing `board` payload unchanged
- Extend the viewer Studio runtime schema so registry rows retain `division`, `function`, and `tier`, and the registry response retains `divisions`.
- Add a new `Catalog` tab in `/studio`, distinct from the existing `Raven` tab.
- Render divisions from the endpoint, not from a viewer-side hardcoded list.
- Render each division's declared functions in the declared order, including empty functions with a compact "no plays yet" row.
- Render all registry rows in the Catalog, including rows excluded from the Board by `appearsOnBoard()`.
- Derive the face label from `divisions[division].face`; ignore any retired play-level `job`, `face`, or `agent` fields for face rendering.
- Flag mis-filed rows with a terse inline `⚠` marker without dropping them or adding explanatory validation prose.
- Add deterministic API, runtime/UI, and browser coverage for the new response shape and tab.

## Non-Goals

- Do not edit `studio/plays/registry.js` data in this slice.
- Do not port the Studio Board work-order cards, card authoring, or advanced Board features.
- Do not retire `studio/site-server.py`, `studio/plays/registry.html`, or the `:8778` site in this slice.
- Do not implement William's coin, William onboarding, or PlaymakerStudio spin-out mechanics.
- Do not add built-by/provenance fields to registry rows; provenance continues to ride the ledger work tracked outside this issue.
- Do not change plugin payloads, product skills, agents, or `PLAY_MANIFEST`.
- Do not write to `docs/alexandria/library/`.
- Do not add data-model rationale, validation-banner copy, or "contract valid / N records" style UI.

## Linked Product-Plan Summary

`org-model.md` rules the catalog spine as `Company -> Division -> Function -> Play` for `Alexandria_Prime`. Product is fronted by Raven and declares nine functions: `Insight`, `Strategy`, `Definition`, `Delivery`, `Launch`, `Analytics`, `Communication`, `Operations`, and `Library Operations`. PlaymakerStudio is fronted by William and declares four functions: `Production`, `Proving`, `Operations`, and `Library Operations`. The face agent is a derived view over the division and must not be stored or read from individual play rows.

`issue-plan.md` records that the earlier catalog-home work made the Division/Function registry data real. Issue #366 is the surface correction: expose that already-shared registry in the viewer `/studio` surface where the director works.

The issue text states the Board surface decision is resolved to the viewer for this product surface. The checked-in `board-surface-decision.md` still has stale "open decision" wording, so this plan treats the issue text as the current ruling for the Catalog tab while leaving Board parity and `:8778` retirement out of scope.

## Current Gap

- `studio/plays/registry.js` already defines `DIVISIONS`, `RUNGS`, `groupCatalogByDivision()`, `appearsOnBoard()`, and validation helpers.
- `packages/ax/src/effects/studio-api.ts` currently evaluates `registry.js` only to return `RUNGS`, so `/api/studio/registry` returns `{ board, rungs }` and drops `DIVISIONS`.
- `packages/viewer/src/app/runtime/studio.ts` currently decodes `StudioRegistry` without `divisions` and decodes `StudioRung` without `division`, `function`, or `tier`.
- `packages/viewer/src/components/studio/StudioApp.tsx` has tabs for `raven`, `damien`, `board`, `play`, `runs`, and `tracker`; it has no Catalog tab.
- The existing `Raven` tab is a working view, not the org-model catalog of all plays.
- The viewer already has a friendly Studio-unavailable state for registry load failures; the Catalog should use that path rather than introducing a raw error display.

## Architectural Boundaries

- `studio/plays/registry.js` remains the single source of truth for Studio play identity, Division/Function filing, and division face metadata.
- `packages/ax` is the transport boundary. It should evaluate `registry.js` once and return plain JSON for `divisions` and `rungs`; it should not define a second org model.
- `packages/viewer/src/app/runtime/studio.ts` owns the browser-side Effect fetch and Schema decode boundary. Keep schemas narrow and tolerant, but carry the fields this surface renders.
- React components should receive decoded data and perform pure grouping/rendering. Do not put Effect fetches or registry evaluation logic inside visual components.
- The Catalog grouping belongs in the viewer for presentation, driven by endpoint data. The viewer must not import or execute `studio/plays/registry.js` directly.
- Board behavior remains separate. Catalog must not call `appearsOnBoard()` or filter by board state.
- Catalog links should be viewer links to `/studio?tab=play&slug=<slug>` for rows with a slug. Static-site helpers such as `playHrefFromRoot()` remain untouched for the retired standalone pages.
- If a row names a known division but an undeclared function, render it after the declared functions for that division and mark the row with `⚠`. If a row names an unknown or missing division, keep it visible in a compact fallback section and mark the row; do not drop it silently.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Studio registry API | `packages/ax/src/effects/studio-api.ts` | `parseRegistry` returns both `DIVISIONS` and `RUNGS`; `registryResponse` returns `{ divisions, rungs, board }` while preserving current board behavior and error handling |
| Studio API tests | `packages/ax/tests/studio-api.test.ts` | Add registry endpoint tests for `divisions.Product.face`, PlaymakerStudio function order/length, rung `division`/`function`/`tier`, and unchanged board passthrough |
| Viewer runtime schema | `packages/viewer/src/app/runtime/studio.ts` | Add `StudioDivisionSchema`, `StudioDivisions` type, `divisions` on `StudioRegistrySchema`, and optional/tolerant `division`, `function`, `tier` fields on `StudioRungSchema` |
| Viewer Studio UI | `packages/viewer/src/components/studio/StudioApp.tsx` and likely a new `packages/viewer/src/components/studio/CatalogTab.tsx` | Add `catalog` tab routing, tab button, and catalog rendering with existing warm dark Studio visual language |
| Viewer browser fixture | `packages/viewer/tests/serve-viewer-fixture.ts` | Return a registry payload with Product/Raven, PlaymakerStudio/William, ordered function arrays, all relevant rung fields, a `prio: "studio"` PlaymakerStudio play, and a deliberately mis-filed row for warning coverage |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Add `/studio?tab=catalog` coverage for division/function order, Frame the Problem, Make a Play, negative copy checks, retired field immunity, warning marker behavior, degraded registry failure, and basic tab regression |
| Studio catalog conformance | `studio/tools/check-catalog.mjs` | No expected code change, but run it to prove existing registry data still satisfies the org contract the viewer now renders |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents | None | No agent prompt or product agent behavior changes |
| Product skills | None | No product-skill eval rerun required |
| Contributor skills | None | The technical-planning skill is used only for this plan; no skill file changes expected |
| CLI commands | None | `ax start viewer` serves an enriched HTTP payload, but no CLI command syntax, stdout/stderr contract, or exit code changes |
| Viewer product surface | `/studio` gains a Catalog tab backed by `/api/studio/registry.divisions` | Add viewer schema, UI, and browser coverage in the same slice |
| Studio registry API | `/api/studio/registry` includes `divisions` | Add AX unit coverage and keep existing board/play/runs/tracker endpoints untouched |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Studio catalog source contract | `node studio/tools/check-catalog.mjs` | Confirms the shared registry's Division/Function data is valid and retired fields remain rejected at the source |
| AX Studio API unit tests | `cd packages/ax && bun test tests/studio-api.test.ts` | Verifies the registry endpoint returns `divisions` plus the existing board payload |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches TypeScript regressions in the API change |
| Viewer type/schema check | `pnpm --filter @alexandria/viewer run check` | Verifies Astro/TypeScript and runtime schema usage |
| Viewer unit suite | `pnpm --filter @alexandria/viewer run test` | Runs the Studio viewer unit/conformance tests after schema and component changes |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Confirms the static viewer build still compiles |
| Viewer browser suite | `pnpm --filter @alexandria/viewer run test:e2e` | Exercises `/studio?tab=catalog` plus existing Studio route regressions in Playwright |
| Product smoke | `ax start viewer` then open `http://127.0.0.1:4321/studio?tab=catalog` | Manual confirmation that the shipped viewer surface renders the real registry |
| API smoke | `curl -s http://127.0.0.1:4321/api/studio/registry` | Confirm `divisions.Product.face == "Raven"` and `divisions.PlaymakerStudio.functions.length == 4` against the running server |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer `/studio` Catalog tab | No eval-harness coverage; viewer behavior is covered by TypeScript, unit tests, build, and Playwright | No LLM eval rerun | Add deterministic browser coverage instead |
| AX Studio HTTP API | No eval-harness coverage; deterministic Bun tests cover the endpoint | No LLM eval rerun | Add/extend `packages/ax/tests/studio-api.test.ts` |
| Product agents and skills | Existing evals cover shipped plugin agents/skills, which are untouched | No eval rerun | N/A |
| Maintainer technical-planning skill | Used to create this plan only; not modified | No eval rerun | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The viewer re-encodes the division/function list and drifts from `registry.js` | Require `/api/studio/registry.divisions` and render from it; add browser fixture tests that fail if the tab hardcodes only the current rows |
| Catalog accidentally becomes a Board projection and hides `parked` or `studio` plays | Keep Catalog grouping independent of board state and `appearsOnBoard()`; assert Make a Play appears despite `prio: "studio"` |
| Face rendering reads retired play-level `agent` or `face` fields | Do not add those fields to rendering logic; include fixture data with a bogus play-level agent and assert the displayed face still comes from `divisions` |
| Mis-filed rows disappear because there is no declared function bucket | Add an invalid-function path that appends those rows visibly and marks only the row with `⚠`; cover it in Playwright |
| Spec-as-copy leaks onto the screen | Keep copy to labels, names, faces, links, and "no plays yet"; add negative browser assertions for rationale and validation-banner phrases |
| Existing Studio tabs regress while adding a tab union member | Keep Catalog in a separate component and leave existing tab branches intact; run the existing Playwright Studio tracker and tab coverage |
| API response shape breaks older board/play consumers | Preserve `board` and `rungs` keys exactly and only add `divisions`; add an API test for board passthrough |
| Static-site link semantics bleed into the viewer | Use viewer `/studio?tab=play&slug=...` anchors in the Catalog; leave `registry.html` helpers unchanged |
| The stale checked-in Board decision doc confuses the scope | Treat the issue text as the Catalog-surface ruling and explicitly defer Board parity and `:8778` retirement |
| Warm Studio visual language degrades into a generic admin table | Implement titled division sections, function groups, and compact play rows using the existing Studio colors, borders, glyph/name treatment, and no table chrome |

## Implementation Steps

1. Add a registry API unit test that builds a temporary `studio/plays/registry.js` with `DIVISIONS` and `RUNGS`, calls `handleStudioRequest()` for `/api/studio/registry`, and asserts the expected `divisions`, `rungs`, and `board` shape.
2. Update `packages/ax/src/effects/studio-api.ts` so `parseRegistry()` evaluates `registry.js` and returns `{ divisions: DIVISIONS, rungs: RUNGS }`; keep the existing 404/500 behavior for missing or invalid registry files.
3. Update `registryResponse()` to return `Response.json({ board, divisions, rungs })` without changing board parsing or other Studio endpoints.
4. Extend `packages/viewer/src/app/runtime/studio.ts` with division schemas and rung fields:
   - `divisions: Record<string, { face: string; functions: string[] }>`
   - `division?: string`
   - `function?: string`
   - `tier?: string`
5. Add the Catalog tab to the `StudioTab` union, `isStudioTab()`, tab list, and render branch. Keep the default tab as `raven`.
6. Implement a focused Catalog component that:
   - iterates `Object.entries(registry.divisions)` for division order;
   - renders the division name and derived face;
   - renders each declared function in `functions` order even when empty;
   - groups all `registry.rungs` by their declared `division` and `function`;
   - appends invalid-function rows after declared functions for their division and marks the play row with `⚠`;
   - keeps unknown/missing-division rows visible in a fallback section and marks the row;
   - renders glyph, play name, and an anchor to `/studio?tab=play&slug=<slug>`.
7. Update the viewer fixture registry payload to include Product and PlaymakerStudio divisions, `Frame the Problem` under Product/Insight, `Make a Play` under PlaymakerStudio/Production, all row filing fields, and a deliberately invalid function row for warning coverage.
8. Add Playwright coverage for:
   - Catalog tab selection from `/studio?tab=catalog`;
   - Product/Raven and PlaymakerStudio/William sections;
   - declared function order;
   - Frame the Problem under Product/Insight;
   - Make a Play under PlaymakerStudio/Production;
   - no rationale lede or validation banner;
   - bogus play-level face/agent ignored;
   - invalid function row shows `⚠`;
   - registry fetch failure shows `StudioUnavailable`;
   - board/play/tracker navigation still renders.
9. Run the deterministic verification commands and fix only regressions related to the touched API/viewer surfaces.
10. Perform the manual `ax start viewer` and `curl` smoke checks against the real registry before handoff.

## Acceptance / Exit Criteria

1. `/studio?tab=catalog` renders a Catalog tab without changing the default Raven tab.
2. The Catalog shows Product with face Raven and all nine Product functions in declared order.
3. The Catalog shows PlaymakerStudio with face William and all four PlaymakerStudio functions in declared order.
4. Empty functions still render with a compact "no plays yet" row.
5. Frame the Problem appears under Product / Insight / Raven.
6. Make a Play appears under PlaymakerStudio / Production / William.
7. Catalog rows render glyph, play name, and a link to the viewer Play tab.
8. `/api/studio/registry` returns `divisions.Product.face == "Raven"` and `divisions.PlaymakerStudio.functions.length == 4`.
9. Catalog rendering is driven by `registry.divisions`; the viewer contains no hardcoded Product or PlaymakerStudio function lists.
10. Catalog includes all `RUNGS`, including `parked` and `studio` priority rows.
11. Mis-filed rows are visible and marked with a terse inline `⚠`.
12. Retired play-level `job`, `face`, or `agent` fields do not affect face rendering.
13. The screen contains no data-model rationale text and no "contract valid / N records" banner.
14. Existing board, play, runs, tracker, raven, and damien tabs continue to render.
15. When the registry cannot be reached, `/studio` shows the existing Studio-unavailable empty state instead of a raw error dump.
16. All deterministic verification commands listed for this slice pass, or any skipped command is explicitly documented with the reason.

## Deferred Follow-Ups

1. Port work-order Board parity into the viewer and retire the `:8778` site only under the separate Board issue.
2. William's coin, onboarding, and PlaymakerStudio library power-up.
3. Ledger-backed built-by/provenance projection from #344.
4. Any future registry data re-filing or catalog restructuring beyond the already-ruled `DIVISIONS` and `RUNGS` model.
5. A shared typed contract package if the viewer and AX begin duplicating a larger Studio domain model.
6. Static `registry.html` cleanup or removal after the viewer Catalog and Board replacement decisions are fully complete.
