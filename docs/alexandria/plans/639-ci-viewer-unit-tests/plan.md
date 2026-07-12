# Technical plan — CI gap: viewer unit tests never run

## Header

- Issue: [#639](https://github.com/GetAlexandria/alexandria-internal/issues/639)
  — "check-viewer never runs packages/viewer's unit test suite"
- Goal: `check-viewer` actually runs `packages/viewer`'s unit/component tests,
  not just typecheck/format/build/storybook.
- Linked product plan: none — this is a CI-infrastructure gap found while
  shipping `library-word-legibility` Slices A/B (#636, #638), not part of
  that plan itself.

## Scope

Add one step (`pnpm --filter @alexandria/viewer run test`) to `check-viewer`
in `.github/workflows/validate-plugin.yml`, positioned to match `check-ax`'s
existing lint/format/typecheck/test/build ordering.

## Non-Goals

- No change to `test-viewer-e2e`, `check-ax`, or any other job.
- No change to what `packages/viewer`'s `test` script itself runs.
- No retroactive fix for #636/#638 — this only affects CI runs from here on.

## Current Gap

`check-viewer` runs typecheck, format:check, build, and Storybook build —
never the package's own unit test script. `check-ax`'s equivalent job already
has the correct shape (lint → format:check → typecheck → test), confirming
this is a one-off omission on the viewer job, not a deliberate policy.

## Architectural Boundaries

Pure CI configuration. No application code, no test-script content change.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| CI | `.github/workflows/validate-plugin.yml`, `check-viewer` job | Adds a `Test viewer` step running the existing `test` script. |

## Agent / Skill Behavior Changes

None.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Local dry-run | `pnpm --filter @alexandria/viewer run test` | Confirm the command this step adds actually passes today (274 pass, 0 fail as of #638). |
| Real PR | `gh pr checks <this PR>` | Confirm `check-viewer`'s logs show the new step executing, not just typecheck/build. |

## Eval Impact

None — no agent/skill/plugin behavior touched.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The viewer unit suite could be slower or flakier than expected once run in CI (untested there before). | Ran locally immediately before filing (274 pass, 0 fail, ~250ms) — fast and clean; low risk. Watch the first real CI run. |

## Implementation Steps

1. Add the `Test viewer` step to `check-viewer` in
   `.github/workflows/validate-plugin.yml`.
2. Open the PR and confirm `check-viewer`'s CI logs show it running.

## Acceptance / Exit Criteria

`check-viewer` runs `pnpm --filter @alexandria/viewer run test` as a visible
step in its CI logs on the PR that ships this change; no other job changes.

## Deferred Follow-Ups

None.
