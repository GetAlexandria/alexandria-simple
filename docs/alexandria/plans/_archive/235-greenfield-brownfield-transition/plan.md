# Technical Plan: Issue 235 Greenfield-to-Brownfield Transition

- Issue reference: `#235` — `[LIB2-008] Handle greenfield-to-brownfield transition`
- Goal: extend Raven's `/library` session-start procedure so returning users who have moved from an initial greenfield setup into a real codebase are recognized explicitly, kept on their existing configuration, and offered a scanner-style next step rather than being re-onboarded or silently treated as an ordinary returning session
- Linked product plan: `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-008.md`, `docs/alexandria/implementation-plans/library-phase-2/outcomes/O-4.md`, `docs/alexandria/plans/233-implement-session-start-procedure/plan.md`, `docs/alexandria/sources/vision-wizard-becomes-raven.md`

## Scope

- Add the repo-specific technical plan for issue `#235`
- Update `skills/raven/job-wizard-mode.md` so session-start distinguishes three paths:
  - first-time greenfield
  - standard returning session
  - returning session with a likely greenfield-to-brownfield transition
- Make the transition path explicit about what evidence Raven may inspect from disk, what counts as a tentative transition signal, how Raven confirms the observation with the human, and how she offers the scanner-or-tell-me-about-it branch
- Keep the transition path aligned with the existing scoreboard/session-start contract from `LIB2-006` instead of redefining room reconstruction from scratch

## Non-Goals

- Implementing a new scanner CLI, codebase-ingestion runtime, or TypeScript transition detector
- Changing `docs/wizard/scoreboard-derivation.md`, `src/tools/scoreboard.ts`, or the wizard config schema
- Re-eliciting AI mode, novelty, or complexity just because a codebase now exists
- Creating dedicated wizard-mode eval cases in this slice, because the Phase 2 release plan still defers automated wizard-mode eval hardening until after smoke-test work
- Expanding the slice into `LIB2-009` smoke-test documentation or broader codebase-discovery architecture

## Current Gap

- `docs/alexandria/plans/233-implement-session-start-procedure/plan.md` explicitly deferred `LIB2-008`, so the current checked-in Raven procedure can tell first-time from returning sessions but does not yet describe what to do when the project has materially changed between sessions.
- `skills/raven/job-wizard-mode.md` currently reconstructs state, surfaces deltas, and avoids re-asking settled configuration questions, but it treats all returning sessions as one class.
- The upstream ticket requires a hybrid path: Raven should preserve prior configuration, acknowledge that the project now appears to have shipped or gained a real codebase, offer a scanner-style discovery path, and continue as a returning session rather than restarting initialization.
- No deterministic test directly exercises this prompt-only transition boundary, so the slice has to be precise about what Raven can verify, what remains heuristic, and how she should stay honest when scanner support is unavailable.

## Architectural Boundaries

- Keep the behavior change inside `skills/raven/job-wizard-mode.md`. The upstream ticket defines this as a session-start procedure extension, not as a new runtime subsystem.
- Keep transition detection heuristic and conversational. Raven may inspect timestamps, code directories, and library/source growth as evidence, but she must surface the observation as tentative and confirm it with the human before acting on it.
- Keep the scoreboard contract unchanged. Raven should show the currently reconstructed scoreboard first, then optionally re-orient around a scanner path if the human confirms the transition.
- Keep existing configuration sticky. A likely post-ship transition changes available evidence, not the user's AI mode, novelty, or complexity settings by itself.
- Keep scanner handling honest. Raven may offer the scanner path because the product plan names it, but if the current build cannot actually invoke or inspect scanner output, she must say so and fall back to "tell me what changed."

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/235-greenfield-brownfield-transition/plan.md` | Captures the repo-specific implementation, verification, eval posture, and boundaries for `LIB2-008` |
| Raven wizard-mode session-start | `skills/raven/job-wizard-mode.md` | Returning sessions gain an explicit greenfield-to-brownfield detection and handling branch that preserves configuration, acknowledges the changed project state, and offers a scanner-style next step |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/raven/job-wizard-mode.md` | Session-start now distinguishes ordinary returning sessions from likely post-ship transitions and tells Raven how to handle each path | Rerun Raven evals because a product-facing Raven skill changed |
| `/library` room continuity | Users who now have code after an earlier greenfield session get an explicit acknowledgement and a scanner-or-conversation branch instead of being treated as first-time or silently standard-returning | Keep later smoke-test work aligned with this branch rather than inventing a different transition pattern |
| Scoreboard/session continuity contract | Scoreboard remains the shared reference artifact across the transition; scanner discovery updates are additive, not a reset | No renderer or derivation changes in this slice; later runtime scanner work must follow the prompt boundary set here |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, formatting, and repo rules after adding the plan and editing the Raven job file |
| Full deterministic suite | `bun test` | Confirms the prompt-only behavior change does not regress existing packaging, routing, or other deterministic surfaces |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/raven/*` | Yes (`tests/eval-cases/raven/*`) | Rerun Raven evals because Raven's product-facing behavior changed | `bin/alexandria-eval run raven/all` |
| Greenfield-to-brownfield `/library` transition specifically | No dedicated wizard-mode eval coverage yet | Do not add a new eval case in this slice because the checked-in Phase 2 plan still defers wizard-mode-specific automated eval hardening until after smoke testing; note the gap explicitly and rely on the existing Raven suite plus deterministic checks for this ticket | defer to later Phase 2 validation |
| Scoreboard derivation / renderer | Existing deterministic/doc coverage from prior tickets | No additional eval rerun because those surfaces are unchanged here | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Raven could treat heuristic evidence as authoritative and tell the user they definitely shipped or definitely have a usable codebase | Make the transition signal explicitly tentative and require a confirmation question before Raven commits to the transition path |
| The transition branch could quietly reopen settled configuration questions, undermining the continuity work from `LIB2-006` | State plainly that AI mode, novelty, and complexity remain preserved unless the human wants to reconfigure or the disk evidence makes the old configuration clearly suspect |
| The prompt could imply a functioning scanner even when the current build cannot invoke one | Keep the scanner path framed as an offer contingent on actual build capability, with a required fallback to asking the human what changed |
| The transition logic could duplicate or contradict the session-start contract from `LIB2-006` | Extend the existing returning-session logic in place rather than replacing it, and keep scoreboard reconstruction/delta surfacing in the same contract language |
| Raven could use weak project heuristics such as any `src/` directory and misclassify template repos or docs-only projects as brownfield | Use multiple signals where possible: prior sparse state, new code presence, timestamps, and material growth, then ask the user to confirm instead of acting silently |

## Implementation Steps

1. Write this repo-specific plan for issue `#235`.
2. Update `skills/raven/job-wizard-mode.md` to add transition detection guidance to session-start without redefining the broader `/library` procedure.
3. Specify the transition evidence Raven may inspect: prior wizard-config presence, earlier sparse library state, new code presence or code directories, source-material growth, and timestamp-based hints when visible.
4. Add the distinct returning-with-transition opening: show the current scoreboard or honest state summary, name the likely change, ask the human to confirm it, then offer scanner-path vs "tell me what changed."
5. Keep the no-transition returning path and the first-time path intact, and restate that existing configuration is preserved across the transition unless the human chooses reconfiguration.
6. Make the scanner-path fallback explicit when the current build cannot actually scan or when no scanner output is available.
7. Run `bun run check`.
8. Run `bun test`.
9. Perform a local review pass against the issue, the Phase 2 release plan, and the updated Raven prompt.
10. Run `bin/alexandria-eval run raven/all`, inspect results, and compare against baselines.
11. Update or open the PR against `main` from `symphony/235`.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/235-greenfield-brownfield-transition/plan.md` exists and matches the repo's technical slice for `LIB2-008`.
2. `skills/raven/job-wizard-mode.md` contains explicit greenfield-to-brownfield detection and handling guidance inside session-start.
3. The returning-with-transition path is distinct from both first-time and ordinary returning openings.
4. The prompt tells Raven to acknowledge the transition explicitly rather than silently applying ordinary returning logic.
5. The prompt preserves prior configuration across the transition unless the human opts to reconfigure.
6. The scanner-style path and its honest fallback are both specified.
7. `bun run check` passes.
8. `bun test` passes.
9. `bin/alexandria-eval run raven/all` completes without an unacceptable regression.

## Deferred Follow-Ups

1. Add dedicated wizard-mode or `/library` eval coverage once Phase 2 smoke-test work establishes the stable interaction shape for session continuity and transition handling.
2. If a real scanner/codebase-discovery tool lands later, keep its invocation and scoreboard integration aligned with the prompt-level contract set here.
3. Validate the transition branch end to end in `LIB2-009` smoke testing, including scanner-available and scanner-unavailable scenarios.
