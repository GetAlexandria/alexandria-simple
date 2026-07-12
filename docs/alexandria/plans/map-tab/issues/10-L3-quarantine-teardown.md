# L3: Quarantine teardown and regression pass

**Flight:** 4 — Life · **Depends on:** L1, L2 (all promotions complete) ·
**Plan:** `docs/alexandria/plans/map-tab/plan.md` §3 Gate 4

## Context

Every piece has been promoted or rewritten; the vendored originals have served their
purpose. Gate 4 closes: delete the quarantine, keep the provenance, prove nothing regressed.

## Scope

- Verify every MANIFEST entry is dispositioned: promoted (where to), rewritten-from-reference
  (what replaced it), or dropped (why). Update the manifest to its final state.
- Delete `quarantine/lifebuild-map/` source and sprites-no-longer-referenced; move the final
  `MANIFEST.md` to `docs/alexandria/plans/map-tab/port-manifest.md` (the durable pointer
  back to Lifebuild SHAs).
- Regression pass: dev fixtures route renders all promoted pieces; full test suite; viewer
  build; a manual sweep of the QA scripts from P1, V1/V2, S1, S2, L1, L2 recorded as a
  checklist in the PR body.
- Remove any quarantine-related build/lint exclusions.

## Acceptance criteria

- [ ] `quarantine/` is gone; `port-manifest.md` accounts for every originally vendored file.
- [ ] Build, lint, tests green; dev route and Map tab visually intact.
- [ ] No source file references `quarantine` anywhere.

## QA script

1. `ls quarantine` → nothing. Open `port-manifest.md` → every file accounted for.
2. Open `/dev/map` and the Map tab; run two spot checks from earlier QA scripts.

## Out of scope

New features. This PR only removes and verifies.
