# Q1: Quarantine the Lifebuild map source

**Flight:** 1 — Quarantine + first light · **Depends on:** nothing (parallel with M1) ·
**Plan:** `docs/alexandria/plans/map-tab/plan.md` §2–3

## Context

We port Lifebuild's map renderer as salvage, not gospel (plan §3). Gate 1: the source lands
verbatim in quarantine — outside the build graph, never imported — so every later promotion
is a deliberate, reviewed act. Precedent: alexandria-internal's
`studio/inheritance/quarantine/`.

## Scope

- `quarantine/lifebuild-map/` at repo root containing verbatim copies from
  `~/conductor/repos/lifebuild`:
  - `origin/main` (@ `bf183a3`): `packages/shared/src/hex/*`; the presentational components
    under `packages/web/src/components/hex-map/` listed in plan §2 (incl.
    `shaders/parchmentShader.ts`, `placementRules.ts`) plus their `.test.tsx` and
    `.stories.tsx` files.
  - Branch `ralph/r3-planting-season` (@ `1a6df97`): `SystemHexTile.tsx` (+ stories/tests)
    and the S11 smoke-signal versions of `SystemHexTile.tsx`/`HexTile.tsx` (commits
    `eeaf23c`, `e4918c9`) — keep both main and R3 variants of `HexTile.tsx`, suffixed.
  - Sprites: `packages/hex-grid-prototype/public/sprites/` (trees, houses, statue, sanctuary,
    well, crop plots, campfire frames).
- `quarantine/lifebuild-map/MANIFEST.md`: per file — source repo, source path, commit SHA,
  intended disposition (port / port+simplify / rewrite-reference / asset).
- `quarantine/README.md`: "not load-bearing until promoted; never import from here."
- Exclusions: quarantine out of tsconfig/lint/test/build globs; CI proves the build is
  byte-identical with quarantine present.

## Acceptance criteria

- [ ] All files listed in plan §2 present verbatim (spot-diff vs `git show <sha>:<path>`).
- [ ] MANIFEST covers every file with SHA + disposition.
- [ ] `grep -r "quarantine" packages/` finds no imports; build/lint/test output unchanged.

## QA script

1. Open `MANIFEST.md`; spot-check two files against the source SHAs.
2. Run the viewer build; confirm no size/output change.
3. Confirm lint and tests don't touch `quarantine/`.

## Out of scope

Any modification of the vendored files beyond path layout; any promotion; any imports.
