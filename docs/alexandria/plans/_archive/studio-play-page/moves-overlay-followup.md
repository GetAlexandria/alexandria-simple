# Follow-up — enforce the `moves.md` overlay guard in GitHub CI

Status: PROPOSED — follow-up to PR #260
Date: 2026-06-15
Owner: Director (Danvers), drafted by orchestrator
Parent: `docs/alexandria/plans/studio-play-page/plan.md`

---

## What shipped in #260 (context)

The "Inside the play" section is now an authored prose overlay (`moves.md`) on
the derived move spine: a clean-English golden path plus the off-path
"problems happen" branch stories, rendered with the same parsers the viewer
uses. Its supporting pieces:

- `packages/viewer-next/src/components/studio/playMoves.ts` — parser +
  `bindBranches` (the shared branch↔route binder).
- `…/moveCoverage.ts` — `checkMoveCoverage`, the pure coverage check (reuses the
  viewer's parsers; "passes" == "renders right").
- `studio/tools/check-moves.ts` — the bun runner over a play dir.
- Unit tests: `playMoves.test.ts`, `moveCoverage.test.ts`.

And the **in-flow wiring** (also in #260): `derive-views.sh` runs the check
**advisory** at Derive, the README "loop" names it a **Lint gate** (rung 5),
and `AUTHORING-moves.md` is the AI-draft recipe. So inside the play-writing
loop, the guard fires.

## The gap this follow-up closes

The guard is enforced *in the play-writing loop* but **not in GitHub CI** —
a PR that edits a play's logic and leaves its `moves.md` stale would still go
green. Three concrete reasons:

1. **CI doesn't run the viewer-next tests.** `check-viewer-next`
   (`.github/workflows/validate-plugin.yml`) runs `run check` (astro typecheck)
   and `format:check` — but **not `run test`**. The existing `moveCoverage` /
   `playMoves` unit tests never execute on CI.
2. **No data-driven test over real plays.** Coverage is unit-tested against
   inline fixtures; nothing asserts that the *actual* `studio/plays/*/moves.md`
   files cover their `story.md`.
3. **The change filter misses play edits.** The `viewer_next` filter only
   watches `packages/viewer-next/**`. Editing `studio/plays/<slug>/moves.md`
   (or a brief that re-derives `story.md`) wouldn't trigger the job at all.

## Scope

1. **Run viewer-next tests in CI.** Add `pnpm --filter @alexandria/viewer-next
   run test` to the `check-viewer-next` job. (Confirm cost; bun tests are fast.)
2. **Add a plays-coverage test** —
   `packages/viewer-next/src/components/studio/moveCoverage.plays.test.ts`:
   read `studio/plays/*/`, and for every dir that has both `story.md` and
   `moves.md`, assert `checkMoveCoverage` returns **no `error`-level** problems.
   Warnings logged, not failed (an uncovered exit is a nudge, a missing block
   is a break). Add `moves.md` to `package.json`'s `test` list if a separate
   file path is needed, or rely on `bun test <dir>`.
3. **Widen the trigger.** Extend the `viewer_next` path filter (or add a
   `studio_plays` filter feeding the same job) to include `studio/plays/**`, so
   authoring or re-deriving a play runs the guard.
4. **(Optional, the reviewer's nice-to-have) a Play Walk e2e.** A Playwright
   spec over the Play Walk view that asserts the moves render — golden beats,
   `↳` branch boxes, and the `→ target` chips. Heavier (needs the studio backend
   behind the dev proxy); keep it a separate, optional job, not a merge gate.

## Notes / risks

- **Intentional coupling.** The plays-coverage test makes CI depend on
  `studio/plays` data. That's the point — it's the same coupling the viewer
  already has, and the reason the check uses the viewer's own parsers.
- **Path-filter widening** means `studio/plays/**` edits run the viewer-next
  job. Acceptable: the job is fast and it's exactly the surface we want guarded.
- This is repo-CI plumbing, deliberately **out of scope for #260** (which is the
  feature + its in-loop guard). Keep it a small, independent PR off `main`.

## Acceptance

A PR that makes any play's `moves.md` stale (drops a move's block, or adds a
move/route the overlay doesn't cover) **fails CI** on `check-viewer-next`,
naming the move and the gap.
