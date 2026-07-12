# Learning-plane integration branch: `flight/learning-plane`

## Why

Main is Jess's modernization lane; even harmless-looking landings there create
speed bumps. The learning-plane wave doesn't need to land properly right now —
it needs to be **assembled and seen**, so the collisions between the new plane
and the existing library/machinery surface before they're paid for on main.
The fix is a long-lived integration branch that carries the whole wave,
leaving main untouched.

## The branch

- Name: `flight/learning-plane` (matches the existing `flight/l*` convention).
- Cut from current `origin/main` (`6f46bdb6`, which already includes L1 #699).
- Pushed to origin. **GitHub's default branch stays `main`** — this branch is
  the director's primary working base, not the repo's.
- Conductor workspaces for this wave should set their target branch to
  `flight/learning-plane`.

## Phase 0+1 — assemble the open wave (agent-executed)

Retarget each open PR's base to `flight/learning-plane`, then merge its head
into the branch with `git merge --no-ff` (a true merge, not squash: GitHub
then marks each retargeted PR as merged, and per-flight merge commits keep a
later re-split possible). Order:

1. **#698** [F2a] Register Experiment and Measure card types — the foundation
   ("squared" onto the branch first, per director intent; --no-ff instead of
   squash so the PR records as merged rather than closed-with-comment).
2. **#701** [F1] Require WHY in product-card fill readiness (draft → ready).
3. **#700** [F3] Complete altitude ranking, warn on unknown values (draft → ready).
4. **#703** [L2] Measurement shelf.
5. **#705** [L3] Research shelf.
6. **#702** [L4] Experiments shelf.

Known conflict surface (the three fabro runs were built concurrently against
main without each other): `packages/ax/src/domain/library-catalog.ts`,
`library-catalog.test.ts`, `library-catalog-story.ts`, and
`packages/ax/tests/viewer.test.ts`. Resolve by keeping **both** behaviors —
these are additive gates (new card types + WHY requirement + altitude
ranking), not competing designs. Shelf merges (4–6) are disjoint content and
should be clean.

After each code merge, run the touched test files directly (not the full
local suite — it's known flaky under contention):
`packages/ax/src/domain/*.test.ts` touched by the PRs,
`packages/ax/tests/viewer.test.ts`, `library-catalog-story-lint.test.ts`,
`runtime-server.test.ts`, and the viewer package tests for touched components
(note: `packages/viewer`'s test script is a file whitelist).

Bookkeeping after the final push:

- Comment on flight board #672: the wave now assembles on
  `flight/learning-plane`; sub-flights branch off it and base their PRs on it;
  main receives nothing until the landing decision.

## Phase 2 — remaining flights as sub-branches

All new work branches off `flight/learning-plane` and opens PRs based on it:

- **#675** [F2b] learning-card vitals parsing + WHEN required on learning cards.
- **#704** Apply the Concept→Entity taxonomy ruling to card files; retire
  `gaps.json`.
- Post-session flights from #672's "Then" section (A3 WHY fill, evidence-map
  linking, altitude-map application, session→play capture) as they activate.

Factory constraint: Fabro builds against main and opens PRs against main.
For factory-built flights, keep dispatching as usual, then salvage the passing
`fabro/run/<ULID>` branch by retargeting its PR to `flight/learning-plane`
and `--no-ff` merging it (the same move as #698/#700/#701 above). Expect the
run to have been tested against main's context, so re-run touched tests on
the branch after the merge.

## Phase 3 — the viewing surface

Check out `flight/learning-plane` in a workspace, build, and run the viewer
from that workspace's own checkout (`bun packages/ax/src/cli/main.ts start
viewer`, :4321) so the learning plane renders with the new types, gates, and
shelves all present. The first QA pass is explicitly a **collision report**:
gate failures the WHY/altitude gates now surface across the existing library,
rendering/legend behavior for the two new card types, and anything the shelf
cards break in the Index/context pages.

## Sync and exit

- `main → flight/learning-plane` merges happen deliberately, on director
  command (e.g. after Jess lands a modernization chunk) — never automatic,
  never rebase (the branch is shared with agents/PRs).
- Exit, when the plane is proven on the surface: either one reviewed
  `flight/learning-plane → main` PR, or a re-split into landing PRs — the
  per-flight merge commits keep both options open. Decide then, not now.
