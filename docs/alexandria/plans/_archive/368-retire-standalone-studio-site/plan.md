# Issue 368 - Retire Standalone Studio Site

Status: draft for approval
Issue: https://github.com/GetAlexandria/alexandria-internal/issues/368
Run ID: 01KVVDS43S6NS17SMW7NS2922B
Project: Studio Surface
Phase: surface correction
Tier: should

Linked plans and decisions:

- `docs/alexandria/plans/studio-fixes/issue-plan.md`
- `docs/alexandria/plans/studio-fixes/board-surface-decision.md`
- `docs/alexandria/plans/366-studio-catalog-viewer/plan.md`
- `docs/alexandria/plans/367-studio-board-viewer/plan.md`

## Goal

Remove the retired standalone Studio static site and Python persistence server
after the Catalog and Board have a viewer home.

After this slice, the only live Studio surface is the viewer's `/studio` tab
served through `ax start viewer` on port `4321`. The shared Studio data remains
under `studio/plays/`, and the Studio data validators remain under
`studio/tools/`.

## Sources Of Truth

- Root `CLAUDE.md` and `README.md` define the viewer as the shipped product
  surface and identify `studio/` as shared data plus validator tooling.
- `packages/viewer/README.md` defines the viewer runtime boundary: browser code
  calls local `/api/*` endpoints and does not read workspace files directly.
- `packages/ax/CLAUDE.md` and `packages/ax/README.md` define AX as the
  deterministic TypeScript/Effect CLI and runtime API surface, with black-box
  tests for stable behavior.
- `skills/maintainer/technical-planning/SKILL.md` defines this plan format.
- `EVALS.md` defines when eval-harness reruns are required.
- Issue #368 names the retired files, acceptance criteria, and replacement
  validation requirements.
- GitHub issue comments checked: the connector returned only the Fabro local
  run link, with no extra technical feedback beyond the issue text.
- `studio-fixes/issue-plan.md` records the surface-correction sequence:
  #366 Catalog to viewer, #367 Board to viewer, then #368 retire `:8778`.
- `board-surface-decision.md` resolves that the viewer `/studio` tab is
  canonical and the standalone `studio/*.html` plus `site-server.py` surface is
  retired.

## Scope

- Delete the retired surface files:
  - `studio/index.html`
  - `studio/plays/registry.html`
  - `studio/plays/board.html`
  - `studio/plays/board-ui.js`
  - `studio/site-server.py`
  - `studio/tools/board-server.test.py`
- Update `studio/tools/check.sh` so it remains the data-level Studio guard but
  no longer compiles or tests the deleted server or deleted UI helper.
- Keep and continue running the shared data validators:
  - `studio/tools/check-catalog.mjs`
  - `studio/tools/check-board-state.mjs`
  - `studio/tools/check-make-a-play-graph.mjs`
  - `studio/tools/board-model.test.mjs`
  - the JSON syntax check for `studio/plays/board-state.json`
  - the syntax check for `studio/plays/board-model.js`
  - the syntax check for `studio/tools/play-resync.py`
- Remove live code and test dependencies on `studio/site-server.py`, especially
  the AX Play Re-sync test helper that copies and starts the Python server.
- Sweep live instructions and live code references to `site-server.py`, `:8778`,
  `board.html`, `registry.html`, and `/api/board-state`, replacing them with
  viewer `/studio` and `/api/studio/board` references where the text is still
  operational.
- Leave dated historical records in place when they are clearly archival, such
  as older migration notes and old implementation plans. Do not rewrite history
  solely to erase retired names.

## Non-Goals

- Do not change the Studio Catalog or Board viewer behavior from #366 or #367.
- Do not change the `/api/studio/board` contract except where tests need to stop
  depending on the deleted Python server.
- Do not delete or semantically change `studio/plays/registry.js`,
  `studio/plays/board-state.json`, or `studio/plays/board-model.js`.
- Do not delete the play library under `studio/plays/`, except for the retired
  HTML/JS surface files explicitly listed in scope.
- Do not write to `docs/alexandria/library/`.
- Do not change bundled Alexandria plugin agents, skills, workflows, or eval
  harness behavior.
- Do not add a new Studio surface, fallback server, or compatibility shim for
  `:8778`.

## Resolved Input Conflicts

- `board-model.js` stays. The issue text has one stale phrase saying that
  deleting `board-model.js` would sweep in-flight `:8778` tails, but the same
  issue's decisions and acceptance criteria say to keep `board-model.js` and
  `board-model.test.mjs` as the data-validator model. Follow the acceptance
  criteria: delete `board-ui.js`, not `board-model.js`.
- "Untouched data" means no semantic changes to the kept data/model files.
  If the required reference scan still flags non-archival comments in kept files
  such as `registry.js`, implementation may make comment-only reference cleanup
  and must leave exported data, board state, and model behavior unchanged.
- Old plans and dated migration/session records may still mention the former
  surface when the text is clearly historical. Live instructions, live tests,
  and live runtime code may not.

## Linked Product-Plan Summary

The surface-correction track says the Phase 1 Catalog and Board logic were
sound but rendered into the wrong surface. The correction is:

1. #366 ports the Catalog to `/studio`.
2. #367 ports the Board and work-order authoring to `/studio` and
   `/api/studio/board`.
3. #368 deletes the standalone `:8778` site and its Python server test, while
   keeping the shared Studio data and data validators.

The current branch already shows the #366 and #367 replacement surfaces in the
expected places:

- `packages/ax/src/effects/studio-api.ts` returns registry `divisions`, accepts
  canonical `backlog` stages, validates and merges `cards[]`, preserves stale
  client writes, and writes board state atomically.
- `packages/viewer/src/app/runtime/studio.ts` decodes `divisions` and
  `cards[]`, and posts board saves to `/api/studio/board`.
- `packages/viewer/tests/library-browser.spec.ts` has Catalog and Board browser
  coverage for `/studio?tab=catalog` and `/studio?tab=board`.

Implementation should still verify those surfaces before and after deletion.

## Current Implementation Gap

- The retired files still exist in the tree.
- `studio/tools/check.sh` still compiles `site-server.py`, checks
  `plays/board-ui.js`, and runs `tools/board-server.test.py`.
- `packages/ax/tests/play-resync.test.ts` still copies `studio/site-server.py`,
  starts it in a temp repo, polls `plays/board-state.json`, and posts to
  `/api/board-state`.
- `studio/README.md` still tells maintainers to run
  `python3 site-server.py 8778` and to use `/plays/board.html` and
  `/plays/registry.html`.
- `studio/plays/README.md`, `studio/plays/HANDOFF.md`,
  `studio/STUDIO-MIGRATION.md`, `studio/plays/CLOSEOUT.md`, generated static
  workshop pages, and some play records still contain references to the retired
  Board, registry, server, or endpoint.
- Historical docs under `docs/alexandria/plans/**` also mention the retired
  surface. Those are archival unless they present current instructions.

## Architectural Boundaries

- The viewer `/studio` tab is the only live Studio UI.
- AX owns the local HTTP APIs used by the viewer, including
  `/api/studio/registry` and `/api/studio/board`.
- `studio/plays/registry.js` remains the source of truth for play identity and
  Catalog filing.
- `studio/plays/board-state.json` remains the source of truth for play stages,
  ready flags, and work-order cards.
- `studio/plays/board-model.js` remains the shared data-validator model used by
  Studio checks. It is not a shipped browser surface in this slice.
- `studio/tools/` remains maintainer tooling for validating Studio data.
- The retired static server is not replaced by another Python, Bun, or
  `http.server` route.

## Touch Map

| Surface | Files / areas | Planned behavior change |
| --- | --- | --- |
| Retired standalone Studio site | `studio/index.html`, `studio/plays/registry.html`, `studio/plays/board.html`, `studio/plays/board-ui.js`, `studio/site-server.py` | Remove the non-canonical UI and writer so it cannot be served or used accidentally. |
| Retired server test | `studio/tools/board-server.test.py` | Delete Python coverage for the deleted server. Equivalent endpoint coverage now belongs to AX `/api/studio/board` tests. |
| Studio data check runner | `studio/tools/check.sh` | Drop deleted server/UI steps; keep catalog, board-state, board-model, make-a-play graph, JSON, and play-resync checks. |
| AX Play Re-sync tests | `packages/ax/tests/play-resync.test.ts` | Remove temp `site-server.py` copy/spawn and `/api/board-state` use; keep Play Re-sync behavior covered with direct data assertions or the AX Studio API endpoint. |
| AX Studio API tests | `packages/ax/tests/studio-api.test.ts` | No required code change if #367 coverage is already present; run it as replacement proof for the deleted Python server test. Add only focused coverage if the deleted server test reveals a missing `/api/studio/board` case. |
| Viewer Studio tests | `packages/viewer/tests/library-browser.spec.ts`, `packages/viewer/tests/serve-viewer-fixture.ts` | No intended behavior change; run Catalog and Board tests to prove the replacement surface still works. |
| Live Studio docs | `CLAUDE.md`, `studio/README.md`, `studio/plays/README.md`, active sections of `studio/plays/HANDOFF.md`, `studio/STUDIO-MIGRATION.md`, and any non-archival matches from the acceptance scan | Replace run instructions and live entry points with `ax start viewer` and `http://127.0.0.1:4321/studio`. |
| Static workshop/navigation leftovers | `studio/plays/**/index.html`, `studio/plays/doc.html`, and other static-site-only generated pages if still present in the scan | Remove or rewrite live navigation to deleted `board.html` and `registry.html` without changing play Markdown records or data semantics. |

## Affected Behavior Surfaces

| Surface | Behavior shift | Downstream docs/tests/evals |
| --- | --- | --- |
| Studio operator workflow | Operators no longer have a `:8778` server path; they open the viewer `/studio` surface. | Update live docs and run viewer validation. |
| Studio data validation | `studio/tools/check.sh` becomes a data-validator runner only, not a static-site/server validator. | Run `sh studio/tools/check.sh`; ensure deleted steps are absent. |
| AX test harness | Tests stop depending on the retired Python server fixture. | Run `cd packages/ax && bun test tests/studio-api.test.ts tests/play-resync.test.ts`. |
| Viewer product surface | No intended behavior change; it is the replacement surface being protected. | Run viewer unit/check/build/browser validation for Studio Catalog and Board. |
| Product agents and skills | None. | No plugin validation or eval rerun required. |
| CLI command contract | No public command syntax, stdout/stderr, or exit-code change. | No new CLI black-box tests beyond existing AX endpoint/unit tests. |

## Implementation Steps

1. Confirm the predecessor gate is satisfied on the implementation branch.
   - Verify #366/#367 behavior is present in AX and viewer source.
   - Run or plan to run the AX Studio API and viewer Studio tests before
     relying on the viewer as the only surface.

2. Delete only the retired files listed in scope.
   - Do not delete `studio/plays/board-model.js`.
   - Do not edit `studio/plays/board-state.json` or registry data.

3. Update `studio/tools/check.sh`.
   - Remove `python3 -m py_compile site-server.py`.
   - Remove `node --check plays/board-ui.js`.
   - Remove `python3 tools/board-server.test.py`.
   - Keep the JSON, catalog, board-state, make-a-play graph, board-model, and
     play-resync checks.
   - Update the header comment so it describes data validation, not server/UI
     validation.

4. Remove live test dependencies on the Python server.
   - Stop copying `studio/site-server.py` into AX Play Re-sync temp repos.
   - Remove helper code that starts or polls `site-server.py`.
   - Replace the stale-client preservation assertion with one of:
     - a direct call to `handleStudioRequest()` for `/api/studio/board`, if the
       Play Re-sync scenario still needs endpoint coverage; or
     - reliance on `packages/ax/tests/studio-api.test.ts` if that file already
       covers stale `cards[]` preservation, with the Play Re-sync test reduced
       to Play Re-sync behavior only.

5. Sweep live docs and instructions.
   - Rewrite `studio/README.md` to say the Studio is viewed with
     `ax start viewer` at `http://127.0.0.1:4321/studio`.
   - Update live entry points to viewer tabs such as `/studio?tab=catalog` and
     `/studio?tab=board`.
   - Update `studio/plays/README.md` layout text so `registry.js`,
     `board-state.json`, and `board-model.js` are data/model files rendered by
     the viewer, not by deleted HTML pages.
   - Update active sections of `studio/plays/HANDOFF.md` so session startup no
     longer boots the retired server.
   - Update `CLAUDE.md` only as needed to say the retired standalone surface has
     been deleted and the viewer is canonical.
   - Keep clearly dated migration history in `studio/STUDIO-MIGRATION.md` and
     `HANDOFF.md`, but remove any current action item that tells someone to
     start or use `:8778`.

6. Run the acceptance reference scan and classify matches.
   - Live code, tests, docs, or comments that still instruct use of the retired
     server/page must be removed or rewritten.
   - Dated historical records may remain if they are plainly archival.
   - Old implementation plans under `docs/alexandria/plans/**` should usually
     remain as history.

7. Review the data boundary.
   - Confirm `studio/plays/board-state.json` is unchanged.
   - Confirm `studio/plays/board-model.js` behavior is unchanged.
   - Confirm `studio/plays/registry.js` data entries are unchanged. If only
     comments changed to satisfy the scan, call that out explicitly.

8. Run deterministic validation and fix only regressions in this slice.

## Deterministic Tests And Validation

Deletion and reference scan:

```bash
test ! -e studio/index.html
test ! -e studio/plays/registry.html
test ! -e studio/plays/board.html
test ! -e studio/plays/board-ui.js
test ! -e studio/site-server.py
test ! -e studio/tools/board-server.test.py
rg -n "site-server\.py|:8778|board\.html|registry\.html|/api/board-state"
git diff --exit-code -- studio/plays/board-state.json studio/plays/board-model.js
```

Studio data checks:

```bash
sh studio/tools/check.sh
```

AX replacement endpoint and touched tests:

```bash
cd packages/ax
bun test tests/studio-api.test.ts tests/play-resync.test.ts
pnpm run typecheck
```

Viewer replacement surface:

```bash
pnpm --filter @alexandria/viewer run test
pnpm --filter @alexandria/viewer run check
pnpm --filter @alexandria/viewer run build
pnpm --filter @alexandria/viewer run test:e2e -- --grep "Studio"
```

Manual product smoke if time and environment allow:

```bash
ax start viewer
```

Then open:

- `http://127.0.0.1:4321/studio?tab=catalog`
- `http://127.0.0.1:4321/studio?tab=board`

Verify the Catalog renders Division -> Function -> Play, the Board renders
Backlog and work-order cards, and card edits save through `/api/studio/board`.

## Eval Impact

No eval-harness rerun is required for this slice.

Reasoning:

- No bundled Alexandria plugin skills, product agents, workflows, prompts, or
  eval harness behavior change.
- The retired surface is deterministic local HTML/Python infrastructure, not an
  LLM-facing behavior surface.
- The replacement surfaces are deterministic AX endpoint and viewer UI behavior,
  covered by Bun tests, typecheck, viewer build, and Playwright browser tests.

If implementation expands into `packages/alexandria-plugin`, product skills,
agents, or eval-backed workflow behavior, rerun the targeted eval set required
by `EVALS.md` before merge.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The implementation deletes `board-model.js` because one issue note names it as a `:8778` tail. | Treat the acceptance criteria as authoritative: keep `board-model.js` and `board-model.test.mjs`; add a diff check for the file. |
| A live test still starts `site-server.py`, causing CI to fail after deletion. | Sweep `packages/ax/tests/play-resync.test.ts` and run it with `tests/studio-api.test.ts`. |
| The reference scan exposes matches in generated static workshop pages or comments inside kept files. | Remove or rewrite only live navigation/instruction text; avoid data-object changes; classify old dated records as archival. |
| The repository keeps two Board writers through a forgotten `/api/board-state` path. | Require the acceptance scan to show no live `/api/board-state` code and rely on `/api/studio/board` tests. |
| Docs over-cleaning erases migration provenance. | Keep dated historical records when they are clearly archival; update only current instructions. |
| The viewer replacement regresses while the retired fallback is removed. | Run AX Studio API tests plus viewer unit/check/build/browser Studio validation before handoff. |
| `studio/tools/check.sh` becomes too narrow and stops guarding data drift. | Keep catalog, board-state, make-a-play graph, board-model, JSON, and play-resync checks; remove only deleted server/UI checks. |
| Manual smoke cannot run in automation. | Treat the deterministic AX/viewer suites as required; report any skipped manual smoke with the environment reason. |

## Acceptance And Exit Criteria

1. `studio/index.html`, `studio/plays/registry.html`,
   `studio/plays/board.html`, `studio/plays/board-ui.js`,
   `studio/site-server.py`, and `studio/tools/board-server.test.py` do not
   exist.
2. `studio/tools/check.sh` no longer references `site-server.py`,
   `board-ui.js`, or `board-server.test.py`.
3. `sh studio/tools/check.sh` passes and still runs the kept Studio data
   validators.
4. `rg -n "site-server\.py|:8778|board\.html|registry\.html|/api/board-state"`
   returns only clearly historical or dated archive matches, with no live
   instructions, live tests, or live runtime code.
5. `packages/ax/tests/studio-api.test.ts` passes and covers the
   `/api/studio/board` replacement behavior formerly covered by the Python
   server test.
6. Any touched AX Play Re-sync tests pass without copying, spawning, or posting
   to `site-server.py`.
7. Viewer Studio Catalog and Board validation passes for `/studio`, including
   `/api/studio/board` authoring through the fixture or real API.
8. `studio/plays/board-state.json`, `studio/plays/board-model.js`, and the data
   entries in `studio/plays/registry.js` are unchanged.
9. No files under `docs/alexandria/library/` change.
10. Final implementation notes identify any remaining scan matches as
    historical and state which validation commands passed or were skipped.

## Deferred Follow-Ups

1. Broader cleanup of old historical plans and dated Studio migration records,
   if maintainers later decide the archaeology is no longer useful.
2. Deletion or regeneration of remaining per-play static workshop HTML if a
   future issue retires those generated renderings entirely in favor of viewer
   Play pages.
3. A shared typed Studio Board contract if AX and viewer card schemas keep
   growing in parallel.
4. Ledger-backed work-order events and #347 Board-advanced behavior remain
   separate viewer Board work.
