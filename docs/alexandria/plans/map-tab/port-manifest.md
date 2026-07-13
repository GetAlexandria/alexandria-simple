# Lifebuild map — port manifest (provenance of record)

This is the durable provenance record for the Map tab port. The ported source
once lived verbatim in `quarantine/lifebuild-map/` (Gate 1 of the plan,
`docs/alexandria/plans/map-tab/plan.md` §3). That quarantine tree was deleted
in issue L3 (Gate 4) once every vendored file had been promoted, rewritten
from reference, or dropped. This file is the pointer that survives it: the
commit SHAs below tie every piece back to Lifebuild source, and the **Final
disposition** column records where each vendored file ended up.

Source repo: `github.com/sociotechnica-org/lifebuild` (local clone:
`~/conductor/repos/lifebuild`). Every vendored file was a byte-identical copy
of `git show <sha>:<source path>` — verified with `cmp` at vendoring time.

Accounting: **70 vendored files — 43 promoted, 8 rewritten-from-reference,
19 dropped.** Product paths below are relative to `packages/viewer/`
(`src/components/map/` for code, `public/map/sprites/` for assets).

## Source commits

| Ref | Short SHA | Full SHA |
| --- | --- | --- |
| `origin/main` (head) | `bf183a3` | `bf183a3e65b54894a787d81d3a2b500a95ed74db` |
| `ralph/r3-planting-season` S7 ("system hex tile") | `eeaf23c` | `eeaf23cf7894ec3da227d63af68425df6520c728` |
| `ralph/r3-planting-season` S11 ("smoke signals") | `e4918c9` | `e4918c9fec4e01a0ee8f9b8343c9938960562673` |

Branch `ralph/r3-planting-season` head is `1a6df97`
(`1a6df978324a7014dae39a6af6b14a9ea73c2cf6`); the two R3 commits above are
ancestors of it and are the specific states named by the plan.

## Vendored filename scheme (historical)

While in quarantine, files kept in more than one variant — and every file
sourced from the R3 branch — carried a suffix inserted before the extension:
`<Name>.<variant>-<short sha>.<ext>`, where `<variant>` was `main` (from
`origin/main`) or `r3` (from `ralph/r3-planting-season`). So
`HexTile.main-bf183a3.tsx` and `HexTile.r3-e4918c9.tsx` were the same source
file at two commits; `SystemHexTile.r3-eeaf23c.tsx` and
`SystemHexTile.r3-e4918c9.tsx` were the pre- and post-smoke-signal versions.
Unsuffixed files were from `bf183a3` at their original path. The **Vendored
file** column below uses those names; the **Source path** column gives the
real Lifebuild path.

`CandleFlicker` was never a standalone Lifebuild file — it was a helper
component defined inside the `e4918c9` versions of `HexTile.tsx` and
`SystemHexTile.tsx`, extracted into its own module at promotion.

## Hex math (`packages/shared`)

| Vendored file | Source path | SHA | Final disposition |
| --- | --- | --- | --- |
| `packages/shared/src/hex/types.ts` | same | `bf183a3` | **promoted** → `src/components/map/hex/types.ts` |
| `packages/shared/src/hex/math.ts` | same | `bf183a3` | **promoted** → `src/components/map/hex/math.ts` |
| `packages/shared/src/hex/grid.ts` | same | `bf183a3` | **promoted** → `src/components/map/hex/grid.ts` |
| `packages/shared/src/hex/index.ts` | same | `bf183a3` | **promoted** → `src/components/map/hex/index.ts` |
| `packages/shared/tests/hex/math.test.ts` | same | `bf183a3` | **promoted** → `src/components/map/hex/math.test.ts` (vitest → bun:test) |
| `packages/shared/tests/hex/grid.test.ts` | same | `bf183a3` | **promoted** → `src/components/map/hex/grid.test.ts` (vitest → bun:test) |

## Presentational components (`packages/web/src/components/hex-map`)

| Vendored file | Source path (basename) | SHA | Final disposition |
| --- | --- | --- | --- |
| `HexMap.tsx` | `HexMap.tsx` | `bf183a3` | **rewritten-from-reference** → `MapScene.tsx` (fresh P1 container reading our schema) |
| `HexMap.test.tsx` | same | `bf183a3` | **dropped** — the LiveStore-era container test was not ported; the container is covered by e2e (`tests/map-tab.spec.ts`) and `dev-map-fixture.test.ts` |
| `HexMap.stories.tsx` | same | `bf183a3` | **dropped** — the viewer keeps no Storybook stories for map components |
| `HexGrid.tsx` | same | `bf183a3` | **promoted** → `HexGrid.tsx` (simplified: placement/debug-sprite machinery removed) |
| `HexGrid.test.tsx` | same | `bf183a3` | **dropped** — grid rendering is exercised by e2e + `dev-map-fixture.test.ts` |
| `HexTile.main-bf183a3.tsx` | `HexTile.tsx` | `bf183a3` | **promoted** → `HexTile.tsx` (project-tile base) |
| `HexTile.test.tsx` | same | `bf183a3` | **dropped** — interaction coverage rewritten as e2e in `tests/map-tab.spec.ts` (hover affordance, completed tiles stay clickable) |
| `HexTile.stories.tsx` | same | `bf183a3` | **dropped** — no stories |
| `HexCell.tsx` | same | `bf183a3` | **promoted** → `HexCell.tsx` |
| `HexCell.stories.tsx` | same | `bf183a3` | **dropped** — no stories |
| `CameraRig.tsx` | same | `bf183a3` | **promoted** → `CameraRig.tsx` |
| `CameraRig.test.tsx` | same | `bf183a3` | **dropped** — camera math covered by `BackgroundPlane.test.ts` and the e2e steady-state pose recompute |
| `FixedBuilding.tsx` | same | `bf183a3` | **promoted** → `FixedBuilding.tsx` (theme re-keyed to Owner-view landmark vocabulary) |
| `LandmarkSprite.tsx` | same | `bf183a3` | **promoted** → `LandmarkSprite.tsx` (and `MapSprite.tsx`, a renamed adaptation for stray-pile plots) |
| `Landmarks.stories.tsx` | same | `bf183a3` | **dropped** — no stories |
| `ProjectSprite.tsx` | same | `bf183a3` | **promoted** → `ProjectSprite.tsx` |
| `BackgroundPlane.tsx` | same | `bf183a3` | **promoted** → `BackgroundPlane.tsx` |
| `BackgroundPlane.test.ts` | same | `bf183a3` | **promoted** → `BackgroundPlane.test.ts` |
| `BackgroundPlane.stories.tsx` | same | `bf183a3` | **dropped** — no stories |
| `placementRules.ts` | same | `bf183a3` | **rewritten-from-reference** → `placement.ts` (+ the ax map-state validator, `packages/ax/src/effects/map-state.ts`) |
| `placementRules.test.ts` | same | `bf183a3` | **rewritten-from-reference** → `placement.test.ts` |
| `shaders/parchmentShader.ts` | same | `bf183a3` | **promoted** → `shaders/parchmentShader.ts` |

## R3 branch variants (`packages/web/src/components/hex-map`)

| Vendored file | Source path (basename) | SHA | Final disposition |
| --- | --- | --- | --- |
| `SystemHexTile.r3-eeaf23c.tsx` | `SystemHexTile.tsx` | `eeaf23c` | **promoted** → `SystemHexTile.tsx` (system-tile base: health dots, hibernating dim) |
| `SystemHexTile.stories.r3-eeaf23c.tsx` | `SystemHexTile.stories.tsx` | `eeaf23c` | **dropped** — no stories |
| `SystemHexTile.r3-e4918c9.tsx` | `SystemHexTile.tsx` | `e4918c9` | **promoted** — smoke-signal delta → `CandleFlicker.tsx` + the signal palette in `colors.ts` (+ `signals.ts` wiring) |
| `HexTile.r3-e4918c9.tsx` | `HexTile.tsx` | `e4918c9` | **promoted** — smoke-signal delta → `CandleFlicker.tsx` + the signal palette in `colors.ts` |

## Rewrite references (never promoted as-is)

| Vendored file | Source path | SHA | Final disposition |
| --- | --- | --- | --- |
| `packages/web/src/components/life-map/LifeMap.tsx` | same | `bf183a3` | **rewritten-from-reference** → `MapScene.tsx` / `MapTabView.tsx` (fresh container) + `webgl.ts` (the `supportsWebGL` probe) |
| `packages/web/src/components/hex-map/hexPositionCommands.ts` | same | `bf183a3` | **rewritten-from-reference** → `placement.ts` |
| `packages/web/src/components/hex-map/hexPositionCommands.test.ts` | same | `bf183a3` | **rewritten-from-reference** → `placement.test.ts` |
| `packages/web/src/components/hex-map/PlacementContext.tsx` | same | `bf183a3` | **rewritten-from-reference** → `placement.ts` |
| `packages/web/src/components/hex-map/PlacementContext.test.tsx` | same | `bf183a3` | **rewritten-from-reference** → `placement.test.ts` |

## Sprites (`packages/hex-grid-prototype/public/sprites`, all `bf183a3`)

**Promoted (24)** → `public/map/sprites/` (basename preserved):

| Vendored file(s) | Final disposition |
| --- | --- |
| `campfire/flame-00.png` … `campfire/flame-14.png` (15 frames) | **promoted** → `public/map/sprites/campfire/` |
| `campfire/logs.png` | **promoted** → `public/map/sprites/campfire/logs.png` |
| `crop-plot1.png`, `crop-plot2.png`, `crop-plot3.png` | **promoted** → `public/map/sprites/` (stray-pile growth stages) |
| `house1.png`, `house2.png`, `house3.png` | **promoted** → `public/map/sprites/` |
| `sanctuary.png` | **promoted** → `public/map/sprites/sanctuary.png` |
| `statue.png` | **promoted** → `public/map/sprites/statue.png` |

**Dropped (9)** — not referenced by the promoted map surface:

| Vendored file(s) | Final disposition |
| --- | --- |
| `tree1.png` … `tree7.png` (7) | **dropped** — Lifebuild's decorative tree scatter was not ported |
| `wall.png` | **dropped** — not referenced |
| `well.png` | **dropped** — not referenced |
