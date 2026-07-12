# P1: First light — hex math promoted, parchment grid on a dev route

**Flight:** 1 — Quarantine + first light · **Depends on:** M1, Q1 ·
**Plan:** `docs/alexandria/plans/map-tab/plan.md` §2–3

## Context

Gate 2/3 for the foundation pieces: promote the pure hex math and the minimal render stack
(cells, camera, parchment shader) out of quarantine, prove the whole toolchain — React 19 +
`@react-three/fiber` v9 + Astro client-only island + bundle budget + WebGL fallback — against
fixture data on a dev-only route. This route later becomes the map's permanent regression
harness.

## Scope

- Promote `hex/{types,math,grid}.ts` with their unit tests into the viewer (or a shared
  module), adapted to house TS config. `/simplify` + `/code-review` run on promoted code.
- Promote `HexCell`, `CameraRig`, `BackgroundPlane`, `parchmentShader` through the
  era-modernization checklist (plan §3 Gate 3): R3F v9 APIs, client-only island guard,
  color-token consolidation, local fonts, zero LiveStore residue.
- New deps in `packages/viewer`: `three`, `@react-three/fiber`, `@react-three/drei`
  (lazy-loaded island only; measure and record bundle impact in the PR).
- Dev-only route (e.g. `/dev/map`) rendering a fixture grid (radius ≥ 5): parchment cells,
  wheel zoom, arrow-key pan, hover highlight. Fixture data lives beside the route and is
  shaped exactly like M1's schema.
- WebGL feature-check with plain fallback message (ported behavior).

## Acceptance criteria

- [ ] Dev route renders the parchment hex grid; pan/zoom work; hover highlights.
- [ ] Promoted files import nothing from `quarantine/`; quarantine untouched.
- [ ] Hex math tests pass under the house test runner.
- [ ] Main bundle unaffected (island lazy-loads); impact number recorded in PR body.
- [ ] `/simplify` and `/code-review` findings addressed or explicitly waived in the PR.

## QA script

1. `ax start viewer`, open `/dev/map`: see parchment hexes; wheel-zoom; arrow-pan.
2. Open any normal tab; confirm no regression and no three.js in its network waterfall.
3. Disable WebGL (or force the check false) and confirm the graceful message.

## Out of scope

Tiles, regions, views, real data, the Map tab itself.
