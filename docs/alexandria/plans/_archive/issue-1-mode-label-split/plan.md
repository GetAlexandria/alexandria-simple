# Issue 1 Plan: Separate Build-Pipeline Autonomy From Product-Decision Autonomy

## Goal

Fix the `/library` initialize flow so users with autonomous build infrastructure
but human-held product decision authority are not mislabeled by the mode framing.

## Scope

- keep the initialize engine's existing mode tiers as the product-decision
  autonomy input
- capture build-pipeline autonomy as a separate recorded context value
- surface that split in initialize conversation guidance and written artifacts
- add initialize eval coverage for the "autonomous pipeline + Pair Programmer"
  case
- absorb the first-session completion bug surfaced by the initialize reruns:
  Raven must not treat generic readiness language as a confirmed configuration,
  and Raven should stop first-session work at the honest work-completion boundary
  rather than the starter-handoff ritual boundary when agent dispatch is
  available

## Non-Goals

- do not change the engine's tier tables in this slice
- do not rename the engine mode keys in `alexandria-config.json`

## Validation

- `pnpm eval -- run initialize/all`
- `bun run check`
