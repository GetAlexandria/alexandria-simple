# Technical Plan: Issue 233 Implement Session-Start Procedure

- Issue reference: `#233` — `[LIB2-006] Implement session-start procedure`
- Goal: turn Raven's wizard-mode job from a placeholder boundary into a concrete session-start procedure that lets `/library` distinguish first-time and returning sessions, reconstruct current state from disk, and speak honestly about deltas without inventing unsupported runtime machinery
- Linked product plan: `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-006.md`, `docs/alexandria/implementation-plans/library-phase-2/outcomes/O-4.md`, `docs/wizard/scoreboard-derivation.md`

## Scope

- Add the repo-specific technical plan for issue `#233`
- Replace the `LIB2-006` placeholder boundary in `skills/raven/job-wizard-mode.md` with a real session-start procedure section
- Make the procedure explicit about current repo paths, first-time vs returning-session flow, session notes usage, delta surfacing, and regression handling
- Keep the wizard-mode procedure aligned with the already-landed derivation spec and scoreboard renderer without pretending a shared runtime state tool exists yet

## Non-Goals

- Implementing a new TypeScript derivation engine or a reusable state-reconstruction CLI
- Changing `src/tools/scoreboard.ts` or redefining the scoreboard derivation contract from `docs/wizard/scoreboard-derivation.md`
- Implementing Raven→Sam artifact delegation details from `LIB2-007`
- Implementing the greenfield-to-brownfield transition heuristics owned by `LIB2-008`
- Creating a new wizard-mode eval harness or smoke-test workflow before Phase 2's later validation slices

## Linked Product-Plan Summary

- Outcome `O-4` requires `/library` to feel like a persistent room: Raven reads `wizard-config.json`, checks the current library state, renders the current scoreboard when possible, and resumes from the latest real state rather than conversation memory.
- `LIB2-006` is defined as a procedure change in `skills/raven/job-wizard-mode.md`, not as a standalone executable system.
- The Phase 2 release plan is explicit that scoreboard state stays derived from `wizard-config.json` plus live library evidence and that Raven should surface deltas instead of trusting stale memory.
- The upstream ticket still uses legacy `docs/context-library/` paths, so this repo slice must translate them to the active `docs/alexandria/` layout.

## Current Gap

- `skills/raven/job-wizard-mode.md` currently says the session-start procedure will land later, but it does not yet tell Raven how to begin a `/library` session.
- The repo has the derivation spec (`#229`), renderer (`#230`), and wizard-mode job (`#231`), but no checked-in procedure that ties those pieces together into first-time vs returning-session behavior.
- The current wizard-mode text references delta surfacing and state reconstruction at a high level only, which leaves too much ambiguity around what Raven reads, what she treats as advisory, and what she should do when the renderer or derivation machinery is unavailable in the build.
- No existing deterministic test directly exercises this prompt-only procedural boundary; quality for this slice depends on keeping the job file precise, path-aligned, and consistent with the broader Phase 2 plan.

## Architectural Boundaries

- Keep the session-start implementation inside `skills/raven/job-wizard-mode.md`, because the upstream ticket defines this as Raven procedure text rather than a new code path.
- Keep scoreboard math, evidence normalization, and ASCII layout delegated to the checked-in derivation spec and renderer; the job file should invoke those surfaces conceptually, not restate their internals.
- Keep the procedure honest about build capability: if the current runtime cannot derive or render the scoreboard, Raven should say so and continue from visible state rather than fabricating continuity.
- Keep `session_notes` advisory. The procedure can read them for context, but they must never override the re-derived library state.
- Do not widen the slice into wizard-config schema edits or new persistence files. If Sam later writes `session_notes`, this procedure should already know how to use them when present.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/233-implement-session-start-procedure/plan.md` | Captures repo-specific scope, verification, eval expectations, and deferred work for `LIB2-006` |
| Raven wizard-mode procedure | `skills/raven/job-wizard-mode.md` | Raven gets an explicit session-start procedure for first-time vs returning `/library` sessions, including disk reads, scoreboard-or-honest-fallback behavior, delta surfacing, and regression handling |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/raven/job-wizard-mode.md` | Wizard-mode now includes a concrete session-start section instead of a placeholder boundary | Rerun Raven evals because a product-facing Raven skill changed |
| `/library` room behavior | Returning sessions now have explicit guidance for how Raven reconstructs state and how she avoids re-asking settled configuration questions | Keep later `LIB2-008` work aligned with this procedure rather than redefining first-time vs returning semantics |
| Scoreboard/session continuity contract | Wizard-mode now explicitly references `docs/alexandria/` paths and the derivation/renderer contract | No code changes in this slice, but later runtime work must follow the prompt boundary set here |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown and repo formatting/lint rules after adding the plan and editing the Raven job file |
| Full deterministic suite | `bun test` | Confirms the prompt-only change does not regress packaging, routing, or other existing deterministic surfaces |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/raven/*` | Yes (`tests/eval-cases/raven/*`) | Rerun Raven evals because wizard-mode behavior changed | `bin/alexandria-eval run raven/all` |
| `/library` session-start specifically | No dedicated eval coverage yet | Do not create a new eval case in this slice because session-start is still a prompt-level procedure boundary without a stable dedicated runtime surface; note the coverage gap and rely on later smoke-test work to harden it | defer to later Phase 2 validation |
| Scoreboard renderer / derivation docs | Deterministic coverage and docs already exist from prior tickets | No additional eval rerun beyond Raven because those surfaces are not changed here | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The job file could restate or subtly override the derivation spec, creating later drift between Raven's instructions and the scoreboard contract | Keep the procedure at the orchestration level and point back to the derivation and renderer surfaces instead of reproducing fill-state rules |
| Legacy `docs/context-library/` paths from the upstream ticket could leak into the checked-in prompt and break the real plugin workflow | Normalize every referenced path to `docs/alexandria/` in the implementation and review for path drift explicitly |
| Existing projects may still expose card files under the older `docs/alexandria/cards/` layout, so Raven could misread a populated library as empty | Tell Raven to treat the older cards path as legacy evidence during session-start while keeping `docs/alexandria/library/` as the active Phase 2 path |
| The procedure could imply scoreboard availability even when the runtime cannot actually derive or render it yet | Add explicit fallback guidance that Raven must stay honest and continue from visible library state rather than claiming unsupported scoreboard output |
| Session notes could be treated as authoritative and mask real regressions in card quality or source coverage | State clearly that `session_notes` are advisory context only and that current on-disk library evidence wins |

## Implementation Steps

1. Write this repo-specific plan for issue `#233`.
2. Update `skills/raven/job-wizard-mode.md` so Step 2 points to a concrete session-start section rather than a future placeholder.
3. Add a dedicated session-start section that covers: reading `docs/alexandria/wizard-config.json`, reading current library state, invoking the derivation/renderer surfaces when available, first-time vs returning orientation, delta surfacing, regression handling, and the "do not re-ask settled questions" rule.
4. Keep the procedure explicit about `docs/alexandria/` paths and about honest fallback behavior when the current build lacks live session-start machinery.
5. Run `bun run check`.
6. Run `bun test`.
7. Perform a local diff review against the issue, Phase 2 release plan, and the updated wizard-mode job file.
8. Run `bin/alexandria-eval run raven/all`, inspect results, and compare against baselines.
9. Update or open the PR against `main` from `symphony/233`.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/233-implement-session-start-procedure/plan.md` exists and matches the repo's technical slice.
2. `skills/raven/job-wizard-mode.md` contains a concrete session-start procedure rather than a deferred placeholder.
3. The procedure clearly distinguishes first-time vs returning sessions and references the active `docs/alexandria/` paths.
4. The returning-session path covers scoreboard rendering when available, meaningful delta surfacing, and regression handling.
5. The procedure says not to re-ask settled configuration questions unless the user initiates reconfiguration.
6. `bun run check` passes.
7. `bun test` passes.
8. `bin/alexandria-eval run raven/all` completes without an unacceptable regression.

## Deferred Follow-Ups

1. Implement the greenfield-to-brownfield transition details in `LIB2-008`.
2. Add wizard-mode/session-start-specific eval coverage once the `/library` runtime path is stable enough to evaluate directly.
3. If later tickets add a shared derivation/state-reconstruction tool, keep it aligned with the prompt boundary established here instead of silently changing Raven's procedure.
