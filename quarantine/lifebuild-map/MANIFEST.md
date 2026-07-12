# Lifebuild map — vendored source manifest

Source repo: `github.com/sociotechnica-org/lifebuild` (local clone:
`~/conductor/repos/lifebuild`). Every file below is a byte-identical copy of
`git show <sha>:<source path>` — verified with `cmp` at vendoring time. See
`quarantine/README.md` for the quarantine rules; dispositions follow plan
`docs/alexandria/plans/map-tab/plan.md` §2.

## Source commits

| Ref | Short SHA | Full SHA |
| --- | --- | --- |
| `origin/main` (head) | `bf183a3` | `bf183a3e65b54894a787d81d3a2b500a95ed74db` |
| `ralph/r3-planting-season` S7 ("system hex tile") | `eeaf23c` | `eeaf23cf7894ec3da227d63af68425df6520c728` |
| `ralph/r3-planting-season` S11 ("smoke signals") | `e4918c9` | `e4918c9fec4e01a0ee8f9b8343c9938960562673` |

Branch `ralph/r3-planting-season` head is `1a6df97`
(`1a6df978324a7014dae39a6af6b14a9ea73c2cf6`); the two R3 commits above are
ancestors of it and are the specific states named by the plan.

## Filename suffix scheme

Files kept in more than one variant, and every file sourced from the R3
branch, carry a suffix inserted before the extension:
`<Name>.<variant>-<short sha>.<ext>`, where `<variant>` is `main`
(from `origin/main`) or `r3` (from `ralph/r3-planting-season`). Examples:
`HexTile.main-bf183a3.tsx` and `HexTile.r3-e4918c9.tsx` are the same source
file at two commits; `SystemHexTile.r3-eeaf23c.tsx` and
`SystemHexTile.r3-e4918c9.tsx` are the pre- and post-smoke-signal versions.
Unsuffixed files are from `bf183a3` at their original path. All quarantine
paths below are relative to `quarantine/lifebuild-map/` and otherwise mirror
the source path.

Note: `CandleFlicker` (plan §2) is not a standalone file — it is a helper
component defined inside the `e4918c9` versions of `HexTile.tsx` and
`SystemHexTile.tsx`. No `SystemHexTile.test.tsx` exists at either R3 commit
(only stories); no `.test`/`.stories` files exist for `FixedBuilding`,
`LandmarkSprite`, or `ProjectSprite` at `bf183a3` beyond the shared
`Landmarks.stories.tsx`.

## Hex math (`packages/shared`)

| Quarantine path | Source path | SHA | Disposition |
| --- | --- | --- | --- |
| `packages/shared/src/hex/types.ts` | same | `bf183a3` | port |
| `packages/shared/src/hex/math.ts` | same | `bf183a3` | port |
| `packages/shared/src/hex/grid.ts` | same | `bf183a3` | port |
| `packages/shared/src/hex/index.ts` | same | `bf183a3` | port |
| `packages/shared/tests/hex/math.test.ts` | same | `bf183a3` | port |
| `packages/shared/tests/hex/grid.test.ts` | same | `bf183a3` | port |

## Presentational components (`packages/web/src/components/hex-map`)

Source directory `packages/web/src/components/hex-map/` at `bf183a3` unless
suffixed; quarantine paths mirror it.

| Quarantine path (basename) | Source path (basename) | SHA | Disposition |
| --- | --- | --- | --- |
| `HexMap.tsx` | same | `bf183a3` | port+simplify |
| `HexMap.test.tsx` | same | `bf183a3` | port+simplify |
| `HexMap.stories.tsx` | same | `bf183a3` | port+simplify |
| `HexGrid.tsx` | same | `bf183a3` | port+simplify |
| `HexGrid.test.tsx` | same | `bf183a3` | port+simplify |
| `HexTile.main-bf183a3.tsx` | `HexTile.tsx` | `bf183a3` | port+simplify |
| `HexTile.test.tsx` | same | `bf183a3` | port+simplify |
| `HexTile.stories.tsx` | same | `bf183a3` | port+simplify |
| `HexCell.tsx` | same | `bf183a3` | port+simplify |
| `HexCell.stories.tsx` | same | `bf183a3` | port+simplify |
| `CameraRig.tsx` | same | `bf183a3` | port+simplify |
| `CameraRig.test.tsx` | same | `bf183a3` | port+simplify |
| `FixedBuilding.tsx` | same | `bf183a3` | port+simplify |
| `LandmarkSprite.tsx` | same | `bf183a3` | port+simplify |
| `Landmarks.stories.tsx` | same | `bf183a3` | port+simplify |
| `ProjectSprite.tsx` | same | `bf183a3` | port+simplify |
| `BackgroundPlane.tsx` | same | `bf183a3` | port+simplify |
| `BackgroundPlane.test.ts` | same | `bf183a3` | port+simplify |
| `BackgroundPlane.stories.tsx` | same | `bf183a3` | port+simplify |
| `placementRules.ts` | same | `bf183a3` | port+simplify |
| `placementRules.test.ts` | same | `bf183a3` | port+simplify |
| `shaders/parchmentShader.ts` | same | `bf183a3` | port |

## R3 branch variants (`packages/web/src/components/hex-map`)

| Quarantine path (basename) | Source path (basename) | SHA | Disposition |
| --- | --- | --- | --- |
| `SystemHexTile.r3-eeaf23c.tsx` | `SystemHexTile.tsx` | `eeaf23c` | port+simplify |
| `SystemHexTile.stories.r3-eeaf23c.tsx` | `SystemHexTile.stories.tsx` | `eeaf23c` | port+simplify |
| `SystemHexTile.r3-e4918c9.tsx` | `SystemHexTile.tsx` | `e4918c9` | port+simplify |
| `HexTile.r3-e4918c9.tsx` | `HexTile.tsx` | `e4918c9` | port+simplify |

## Rewrite references

Kept only as reference for the fresh rewrites named in plan §2; never
promoted as-is.

| Quarantine path | Source path | SHA | Disposition |
| --- | --- | --- | --- |
| `packages/web/src/components/life-map/LifeMap.tsx` | same | `bf183a3` | rewrite-reference |
| `packages/web/src/components/hex-map/hexPositionCommands.ts` | same | `bf183a3` | rewrite-reference |
| `packages/web/src/components/hex-map/hexPositionCommands.test.ts` | same | `bf183a3` | rewrite-reference |
| `packages/web/src/components/hex-map/PlacementContext.tsx` | same | `bf183a3` | rewrite-reference |
| `packages/web/src/components/hex-map/PlacementContext.test.tsx` | same | `bf183a3` | rewrite-reference |

## Sprites (`packages/hex-grid-prototype/public/sprites`)

All 33 files under `packages/hex-grid-prototype/public/sprites/` at
`bf183a3`, copied binary-safe; quarantine paths mirror source paths.
Disposition for every row: asset.

| Quarantine/source path (basename) | SHA | Disposition |
| --- | --- | --- |
| `campfire/flame-00.png` | `bf183a3` | asset |
| `campfire/flame-01.png` | `bf183a3` | asset |
| `campfire/flame-02.png` | `bf183a3` | asset |
| `campfire/flame-03.png` | `bf183a3` | asset |
| `campfire/flame-04.png` | `bf183a3` | asset |
| `campfire/flame-05.png` | `bf183a3` | asset |
| `campfire/flame-06.png` | `bf183a3` | asset |
| `campfire/flame-07.png` | `bf183a3` | asset |
| `campfire/flame-08.png` | `bf183a3` | asset |
| `campfire/flame-09.png` | `bf183a3` | asset |
| `campfire/flame-10.png` | `bf183a3` | asset |
| `campfire/flame-11.png` | `bf183a3` | asset |
| `campfire/flame-12.png` | `bf183a3` | asset |
| `campfire/flame-13.png` | `bf183a3` | asset |
| `campfire/flame-14.png` | `bf183a3` | asset |
| `campfire/logs.png` | `bf183a3` | asset |
| `crop-plot1.png` | `bf183a3` | asset |
| `crop-plot2.png` | `bf183a3` | asset |
| `crop-plot3.png` | `bf183a3` | asset |
| `house1.png` | `bf183a3` | asset |
| `house2.png` | `bf183a3` | asset |
| `house3.png` | `bf183a3` | asset |
| `sanctuary.png` | `bf183a3` | asset |
| `statue.png` | `bf183a3` | asset |
| `tree1.png` | `bf183a3` | asset |
| `tree2.png` | `bf183a3` | asset |
| `tree3.png` | `bf183a3` | asset |
| `tree4.png` | `bf183a3` | asset |
| `tree5.png` | `bf183a3` | asset |
| `tree6.png` | `bf183a3` | asset |
| `tree7.png` | `bf183a3` | asset |
| `wall.png` | `bf183a3` | asset |
| `well.png` | `bf183a3` | asset |
