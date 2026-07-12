# Technical Plan: Issue 236 End-to-End Smoke Test

- Issue reference: `#236` - `[LIB2-009] End-to-end smoke test`
- Goal: run the Phase 2 `/library` flow end to end in real local Claude Code sessions, validate the produced artifacts and room behavior against the checked-in acceptance criteria, and check in a durable smoke-test record without folding any discovered defects into this same slice
- Linked product plan: `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-009.md`, `docs/alexandria/plans/233-implement-session-start-procedure/plan.md`, `docs/alexandria/plans/234-raven-sam-artifact-delegation/plan.md`, `docs/alexandria/plans/235-greenfield-brownfield-transition/plan.md`

## Scope

- Add the repo-specific technical plan for issue `#236`
- Run at least two real `/library` sessions with the checked-in plugin:
  - Scenario 1: greenfield initialization in a clean local git repo
  - Scenario 2: returning session using the state created in Scenario 1
- Inspect the resulting `docs/alexandria/wizard-config.json`, `docs/alexandria/assessment.md`, and visible scoreboard/session behavior against the issue acceptance criteria
- Check in `docs/alexandria/implementation-plans/library-phase-2/smoke-test-results.md` with concrete notes on what worked, what felt off, and any distinct follow-up issues
- Open follow-up GitHub issues only if the smoke runs expose distinct product defects that should be fixed in separate slices

## Non-Goals

- Modifying Raven, Sam, wizard-engine, scoreboard derivation, or renderer behavior in this ticket unless an absolute blocker makes the smoke run impossible
- Inventing automated wizard-mode eval coverage before the smoke test establishes the interaction shape worth hardening
- Converting the smoke test into a synthetic fixture or replacing the human judgment layer with only deterministic checks
- Quietly fixing issues discovered during the smoke test instead of documenting them and spinning separate follow-up work

## Current Gap

- The Phase 2 release plan and upstream ticket both require a human-run validation pass and a checked-in results document, but `docs/alexandria/implementation-plans/library-phase-2/smoke-test-results.md` does not exist yet.
- The preceding implementation tickets established the `/library` entry point, Raven wizard-mode behavior, session-start flow, delegation protocol, and greenfield-to-brownfield branch, but the repo has no checked-in evidence that those pieces work together in a real conversation.
- Existing wizard and Raven evals cover adjacent behavior, but they do not satisfy the ticket's manual-experience questions: whether Raven feels like a guide, whether the scoreboard feels trustworthy, and whether the stopping-point call lands well.
- The local Claude host may also be a hard dependency risk for this issue. If the authenticated `claude` session is quota-blocked, the smoke run cannot be completed honestly in the current environment and the blocker itself must be recorded rather than hidden.

## Architectural Boundaries

- Keep the primary product behavior unchanged in this slice. The smoke test should validate the current build, not mix validation with prompt or runtime refactors.
- Treat the smoke-test record as the product artifact for this issue. It should capture environment, scenarios, verification method, findings, and next steps clearly enough that later hardening work can build from it.
- Reuse existing validation surfaces where they already exist:
  - `bun run check` and `bun test` for repo-wide deterministic safety
  - the existing wizard structural expectations for `wizard-config.json` and `assessment.md` shape
  - direct manual inspection for conversational quality, scoreboard trustworthiness, and stopping-point usefulness
- Keep any temporary smoke-project directories uncommitted and local to `.tmp/`; the durable checked-in output for this issue is the plan plus the results document.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/236-end-to-end-smoke-test/plan.md` | Captures the repo-specific validation slice, verification method, and follow-through requirements for `LIB2-009` |
| Phase 2 validation record | `docs/alexandria/implementation-plans/library-phase-2/smoke-test-results.md` | Adds the checked-in human-run evidence for the `/library` experience, findings, and follow-up disposition |
| Temporary local smoke workspace | `.tmp/...` local-only repos and transcripts | Provides the real-session execution environment used to gather evidence; not committed |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `/library` smoke-test evidence | No product behavior changes are intended; this slice validates the current integrated behavior end to end | If defects are found, capture them in the results doc and open separate follow-up issues rather than fixing them here |
| Repo workflow documentation | The Phase 2 plan gains a concrete smoke-test results artifact that later eval-hardening work can cite | Keep any follow-up issue links and acceptance mapping explicit in the results doc |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, formatting, and repo policy after adding the plan and smoke-test results document |
| Full deterministic suite | `bun test` | Confirms the doc slice does not regress existing deterministic surfaces and honors the repo's build standard |
| Smoke artifact validation | existing wizard structural expectations applied to the Scenario 1 outputs | Verifies `wizard-config.json` is valid JSON and `assessment.md` exists and is structurally complete without pretending that manual conversation quality is fully automatable |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product-facing agents and skills | Existing Raven and wizard eval coverage exists, but no product behavior change is planned in this slice | No eval rerun if the final diff stays documentation-only and the smoke test does not require prompt changes | none |
| Wizard-mode smoke-test behavior | Deliberately not yet covered by dedicated evals per the Phase 2 release plan | Use the smoke-test record to inform later eval creation rather than inventing new evals here | defer to post-smoke-test hardening |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The smoke run could drift into fixing defects inline, blurring validation and implementation | Treat the results document as the deliverable, and open follow-up issues for distinct defects instead of editing product prompts in this slice |
| A temporary local repo could accidentally look like a test fixture rather than a real Claude Code session | Run the actual `claude` CLI with the checked-in plugin in a real git repo under `.tmp/`, record the environment and commands used, and document limitations honestly |
| Manual observations could become vague or non-actionable | Record exact scenario setup, observed behavior, artifact paths, validation checks, and concrete findings in the checked-in results document |
| The smoke conversation could fail partway through, leaving no durable evidence | Save transcripts or concise session notes during execution and leave the workspace intact so the failure mode can still be documented honestly |
| The smoke run could be blocked by Anthropic usage limits before `/library` starts | Record the exact failing command, timestamp, and reset window in the results doc, note the blocker on the GitHub issue, and leave the prepared smoke workspace intact for the rerun after quota reset |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#236`.
2. Prepare a local smoke workspace under `.tmp/` for a real greenfield Claude Code session using the checked-in plugin via `--plugin-dir`.
3. Run Scenario 1 manually through `/library`, capturing the conversation outcome, generated artifacts, and any notable deviations from the ticket's expectations.
4. Validate the Scenario 1 outputs: confirm `docs/alexandria/wizard-config.json` exists and parses as JSON, confirm `docs/alexandria/assessment.md` exists and is structurally complete, and note whether the scoreboard rendered and whether Raven avoided step-number/form behavior.
5. Re-enter the same project for Scenario 2 as a returning session, note scoreboard continuity and delta handling, and confirm Raven does not re-ask settled configuration questions.
6. If distinct defects appear, open separate follow-up GitHub issues and record them in the smoke-test results.
7. If the live run is blocked before Scenario 1 can start, write `docs/alexandria/implementation-plans/library-phase-2/smoke-test-results.md` as a blocker record with the exact command, failure output, timestamp, and rerun instructions instead of inventing scenario results.
8. Write `docs/alexandria/implementation-plans/library-phase-2/smoke-test-results.md` with scenario setup, observations, validations, and follow-up disposition.
9. Run `bun run check`.
10. Run `bun test`.
11. Perform a local review pass against the issue, this plan, and the checked-in smoke-test results.
12. Open or update the PR against `main`, then carry CI and review follow-through until the PR is clean when the smoke run itself has been completed successfully.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/236-end-to-end-smoke-test/plan.md` exists and reflects the repo's technical slice for `LIB2-009`.
2. Scenario 1 is completed in a real local `/library` session and documented.
3. Scenario 2 is completed in a real local `/library` session and documented.
4. `docs/alexandria/implementation-plans/library-phase-2/smoke-test-results.md` records what worked, what broke, what felt off, and the validation method.
5. Scenario 1 produced a `docs/alexandria/wizard-config.json` that parses as valid JSON.
6. Scenario 1 produced a `docs/alexandria/assessment.md` that exists and is structurally complete.
7. Any distinct issues discovered during the smoke run are opened as separate follow-up tickets or explicitly noted as "none found."
8. `bun run check` passes.
9. `bun test` passes.

## Deferred Follow-Ups

1. Create dedicated wizard-mode eval coverage after the smoke-test record shows which conversational behaviors and failure modes are worth hardening.
2. Address any follow-up defects found during the smoke test in separate issue slices rather than retrofitting them here.
3. Revisit whether future smoke runs need a more formal runbook or transcript capture helper once Phase 2 moves from initial validation into regression checking.
