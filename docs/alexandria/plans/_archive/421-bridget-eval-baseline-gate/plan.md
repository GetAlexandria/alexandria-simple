# Technical Plan

## Header

- Issue reference: `#421` — `[FEAT-067] Confirm Bridget eval baseline is reproducible and gate works`
- Goal: Turn the existing Bridget eval baseline into a verified regression gate by proving the checked-in `bridget/assembly` baseline can still be reproduced and by making the eval CLI comparison path fail when regressions are detected.
- Linked product plan: No checked-in product-level `plan.md` link was provided in the issue handoff. Implementation is based on the sanitized issue summary plus checked-in repo behavior.

## Scope

- Confirm the current Bridget eval baseline can be rerun on the current branch without regressions.
- Make the eval CLI comparison path suitable for gating by surfacing regressions through process exit status.
- Add deterministic test coverage for the compare-path behavior so the gate itself is protected by `bun test`.
- Keep eval workflow documentation aligned with the actual compare/gate behavior.

## Non-Goals

- Running all evals in CI or introducing remote-model execution into GitHub Actions.
- Creating new Bridget eval cases or changing Bridget’s prompt behavior.
- Redesigning the broader eval harness workflow beyond what is needed for comparison gating.
- Rebaselining unrelated stale eval suites shown by `alexandria-eval status`.

## Linked Product-Plan Summary

- Bridget already has a checked-in baseline under `tests/evals/bridget/assembly/`.
- FEAT-069 depends on this issue to provide a trustworthy anchor for an eval gate.
- “Measure Before Promoting” requires more than the existence of files in git; the baseline needs to be reproducible and comparison must be able to fail a regression path.

## Current Implementation Gap

- The checked-in Bridget baseline exists and currently reports as non-stale, but the repo does not yet treat that baseline as a proven reproducibility contract.
- `src/tools/eval-cli.ts` implements `compare` as a report-only command; it prints deltas but does not exit nonzero when results regress, so it cannot act as a gate.
- `src/tools/eval-cli.test.ts` only smoke-tests that `compare` prints something for a known case. It does not protect regression exit behavior.
- There is no issue-local plan documenting the repo-specific verification boundary for Bridget baseline reproducibility.

## Architectural Boundaries

- Keep the behavior change in the eval tooling layer (`src/tools/eval-cli.ts`) and its deterministic tests.
- Use the existing eval harness comparison logic as the source of truth for “what counts as a regression”; do not invent a second incompatible policy.
- Treat the Bridget eval baseline as data to verify, not as a prompt-editing excuse.
- Limit docs updates to the eval workflow surfaces that describe compare/gating behavior.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Eval CLI gate behavior | `src/tools/eval-cli.ts` | `alexandria-eval compare <skill>/<case>` becomes suitable for gating by exiting nonzero when it detects regressions |
| Eval CLI deterministic coverage | `src/tools/eval-cli.test.ts` | Tests cover both no-regression and regression exit behavior rather than only smoke-testing output |
| Eval workflow docs | `EVALS.md` | Compare/gate usage matches the actual CLI semantics |
| Bridget eval baseline evidence | `tests/evals/bridget/assembly/*` if rerun output changes | Checked-in Bridget results continue to represent the accepted reproducible baseline |
| Repo planning docs | `docs/alexandria/plans/421-bridget-eval-baseline-gate/plan.md` | Captures the repo-specific scope, risks, and verification boundary for this issue |

## Changed Behavior Surfaces

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Eval CLI `compare` | Regression comparison becomes machine-enforceable through exit status, not just human-readable output | Update CLI tests and `EVALS.md` so callers know it can be used as a gate |
| Bridget baseline verification | The repo records a fresh real run confirming `bridget/assembly` reproduces against its checked-in baseline | Rerun Bridget eval coverage and check in artifacts only if the accepted baseline changes |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Eval CLI coverage | `bun test src/tools/eval-cli.test.ts` | Directly covers the compare/gate behavior added in this slice |
| Repo formatting/lint/typecheck gate | `bun run check` | Required repo baseline for TypeScript and Markdown changes |
| Deterministic integration suite | `bun test` | Required repo baseline; ensures the wider executable surface still passes |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Bridget agent / context-briefing behavior | Existing `tests/eval-cases/bridget/assembly` with checked-in results under `tests/evals/bridget/assembly/` | Rerun the existing Bridget eval to confirm the baseline still reproduces on this branch | `bun run src/tools/eval-harness.ts bridget/assembly --compare` |
| Eval CLI gate behavior | Deterministic coverage only; not a product-facing skill surface | Add/expand deterministic tests instead of new eval-harness coverage | `bun test src/tools/eval-cli.test.ts` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Changing `compare` exit behavior could surprise callers that used it only for manual inspection | Keep the human-readable report intact and document the nonzero exit as intended gate behavior |
| CLI comparison logic could drift from eval-harness comparison semantics | Reuse the same regression rules already enforced by `src/tools/eval-harness.ts` rather than defining a second policy |
| Bridget reproducibility rerun could differ due to expected model variation | Use the harness’ existing compare rules, which already allow non-regressing variation and focus on structural/judge regressions |
| The real Bridget rerun could change accepted outputs unexpectedly | Inspect results before staging; only update baseline artifacts if the rerun is accepted and still satisfies the issue goal |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/421-bridget-eval-baseline-gate/`.
2. Update `src/tools/eval-cli.ts` so `compare` exits nonzero when it detects regressions while preserving the existing comparison report output.
3. Expand `src/tools/eval-cli.test.ts` to cover both a clean comparison and a deliberate regression case.
4. Update `EVALS.md` so the compare command is documented as usable for gating.
5. Run the real Bridget eval with `--compare` to confirm the checked-in baseline reproduces on the current branch.
6. Run the relevant deterministic checks and review the diff for documentation/tooling drift.

## Acceptance And Exit Criteria

1. `alexandria-eval compare <skill>/<case>` exits nonzero when the current results regress against the git baseline.
2. Deterministic tests cover both passing and failing compare outcomes.
3. The Bridget eval baseline is rerun on the current branch and the comparison reports no regressions.
4. `bun run check` and `bun test` pass after the tooling/docs changes.
5. Any Bridget eval artifacts changed by the accepted rerun are reviewed and checked in; otherwise the baseline remains unchanged with fresh reproducibility evidence recorded in the PR summary.

## Deferred Follow-Ups

1. Add a dedicated multi-case gate command if future work needs one command to fail on any stale or regressed eval across a selected skill set.
2. Decide in FEAT-069 whether CI should call the eval harness directly, the CLI compare command, or a future wrapper once the exact gate surface is defined.
