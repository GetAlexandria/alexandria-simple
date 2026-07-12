# Technical Plan: Issue 410 Returning-Session Drift Detection

- Issue reference: `#410` — `[FEAT-064] Build returning-session job with git-log drift detection`
- Goal: replace the temporary returning-session `/library` stub with a real Raven-led room-open procedure that reconstructs library state, renders the current scoreboard, detects product drift via git history, surfaces completed-plan nudges, and hands the room back to normal conversation without reviving the old heuristic-heavy session-start flow
- Linked product plan: `docs/alexandria/implementation-plans/initialize-ritual-restoration/tickets/FEAT-064.md`, `docs/alexandria/implementation-plans/initialize-ritual-restoration/CONTEXT_BRIEFING.md`, `docs/alexandria/implementation-plans/initialize-ritual-restoration/library-updates.md`

## Scope

- Add a repo technical plan for issue `#410`
- Replace `skills/raven/job-returning-session.md` with the real returning-session room-open procedure
- Define the six required beats in the job file:
  read config and library state, render scoreboard, run git-log drift detection,
  check completed implementation plans, deliver a concierge opening, and dispatch based
  on the human's next request
- Keep the procedure compact and explicitly grounded in shipped repo surfaces such as
  `bin/alxndr scoreboard derive` / `render`
- Align any live runtime copy that still says returning-session is intentionally stubbed
- Add initialize eval coverage for a returning-session project with post-config git drift,
  plus structural/judge assertions that the room-open nudge is surfaced honestly

## Non-Goals

- First-session ritual changes from FEAT-062 except where shared `/library` copy must stay accurate
- FEAT-065 cleanup work such as removing `assessment.md`, pruning `session_notes`, or rewriting
  initialize helper docs that are still intentionally transitional in this branch
- Building a new generalized drift-detection CLI in this slice if the existing shell invocation
  inside the job file is enough to satisfy the acceptance criteria
- Reworking implementation-plan storage or release-status semantics beyond a lightweight
  returning-session check
- Expanding the concierge opening into a new multi-file Raven framework beyond the inline
  pattern required by FEAT-064

## Linked Product-Plan Summary

- Returning-session must stand as its own Raven job, not as a branch of first-session.
- The old greenfield-to-brownfield session-start logic is too long and too specific; the
  replacement is `git log --since=<config date>` as a general drift signal.
- The room-open experience should be state-driven: read current config and library state,
  show the scoreboard, surface the highest-value nudge, then invite the human to continue.
- The job should also notice when in-progress implementation plans have completed work and
  nudge the human toward `/complete-plan` when relevant.

## Current Gap

- `skills/raven/job-returning-session.md` is still a FEAT-061 placeholder that exits with
  `BLOCKED`.
- `skills/library/SKILL.md` still warns that returning-session may be a temporary stub.
- Initialize eval coverage has no case for a config-present `/library` return visit with real
  git history since the config was written.
- Current initialize structural and judge expectations are first-session-oriented and do not
  assert returning-session drift detection or concierge nudges.

## Architectural Boundaries

- Keep `/library` as the only user-facing entry point. Returning-session orchestration belongs
  in `skills/raven/job-returning-session.md`, not in the thin entry skill.
- Reuse shipped repo primitives instead of inventing new prompt-only state: config on disk,
  library files on disk, scoreboard CLI output, git history, and checked-in implementation-plan
  artifacts.
- Keep drift detection honest. The job should say when git metadata is unavailable or when no
  post-config changes exist instead of fabricating a delta summary.
- Keep completed-plan detection lightweight and file-system-based. This slice should not become
  a GitHub API integration.
- Preserve reusable wording. The room-open language must stay generic to downstream products and
  avoid Alexandria-repo-specific examples in the shipped skill text.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/410-returning-session-drift/plan.md` | Captures the repo-specific scope, verification, and eval decisions for FEAT-064 |
| Returning-session Raven job | `skills/raven/job-returning-session.md` | Replaces the placeholder stub with the six-beat room-open procedure and explicit git-log / completed-plan logic |
| `/library` entry-point copy | `skills/library/SKILL.md` | Removes the now-stale warning that returning-session may still stop at a stub |
| Initialize eval cases | `tests/eval-cases/initialize/*`, `tests/evals/initialize/*`, `tests/eval-cases/initialize/structural-checks.ts`, `tests/eval-cases/initialize/judge-criteria.json` | Adds coverage and scoring expectations for config-present `/library` returns with git drift and concierge nudges |
| Raven agent contract | `agents/raven.md` only if implementation exposes a direct mismatch in job description or boundaries | Keeps runtime-facing Raven job descriptions aligned if the shipped job behavior now contradicts the agent contract |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/raven/job-returning-session.md` | Returning-session now opens the room instead of failing: Raven reconstructs state from disk, derives and renders the scoreboard, checks git drift since config date, looks for completed-plan nudges, gives a concise concierge opening, and routes the next step | Keep the beat order compact, preserve honest fallback behavior, and make the opening match the FEAT-064 acceptance criteria |
| `skills/library/SKILL.md` | `/library` no longer describes the config-present path as a temporary blocked stub | Keep the entry skill thin and accurate without duplicating the returning-session procedure |
| Initialize eval surface (`skill: "library"` cases under `tests/eval-cases/initialize/`) | Eval coverage expands beyond first-session to include returning-session room-open behavior with real git drift | Add a new case, update structural checks, and extend judge criteria so the new behavior is testable and baseline-backed |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, JSON/TS formatting, and linting after prompt/doc/eval edits |
| Full deterministic suite | `bun test` | Confirms the changed skill/eval slice does not regress the repo’s deterministic coverage, including eval harness plumbing |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `/library` initialize flow | Yes, via `initialize/*` eval cases using `skill: "library"` | Rerun the initialize suite because returning-session changes the user-facing `/library` behavior when config is present | `bin/alexandria-eval run initialize/all` |
| Returning-session with drift | No dedicated case today | Add a new case that starts from an initialized project fixture with committed post-config changes and expects drift + top-1 nudge surfacing | create `tests/eval-cases/initialize/returning-session-with-drift/` and check in `tests/evals/initialize/returning-session-with-drift/` |
| Raven product-conversation surface | Raven evals exist, but this behavior change is scoped to `/library` initialize routing rather than the general Raven conversation job | Do not rerun `raven/all` unless the implementation broadens into shared Raven behavior outside `/library`; document this as a behavior-scoped eval decision | none unless scope widens |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The new room-open job could grow back into the long monolithic session-start blob FEAT-064 is trying to replace | Keep the job to the six explicit beats, reference shipped tools where possible, and review the final file length / structure against the stub and old session-start intent |
| Git drift detection could be described vaguely enough that Raven hallucinates a delta instead of using repo evidence | Require a concrete `git log --since=<config date>` invocation path with an honest fallback when git or dates are unavailable, and cover the behavior with a dedicated eval fixture |
| Completed-plan nudges could become repo-specific or overpromise GitHub state the job cannot actually inspect locally | Limit the check to checked-in implementation-plan files plus observable local git evidence and keep the nudge phrasing lightweight and conditional |
| Eval coverage could remain first-session-biased even after the prompt change lands | Add the returning-session eval case in the same slice and update structural/judge logic rather than relying only on historical initialize cases |
| Updating `/library` copy without touching any other runtime text could leave a contradictory stub reference elsewhere | Review the touched Raven and `/library` surfaces locally after implementation and patch only direct mismatches that affect the shipped path |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#410`.
2. Replace the placeholder `skills/raven/job-returning-session.md` with the real six-beat
   returning-session procedure, including honest git-log drift detection and completed-plan
   checks.
3. Update `skills/library/SKILL.md` and any directly conflicting runtime-facing copy so the
   config-present `/library` path is described accurately.
4. Add the `initialize/returning-session-with-drift` eval case plus any structural/judge
   updates required to verify the new behavior.
5. Run `bun run check`.
6. Run `bun test`.
7. Run `bin/alexandria-eval run initialize/all`, inspect results with `results` / `compare`,
   and check in updated baselines if scores hold or improve.
8. Perform a manual local review against the issue, plan, and final diff.
9. Update or open the PR against `main`, then carry CI / review to a clean mergeable state
   per repo policy.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/410-returning-session-drift/plan.md` exists and matches the repo slice.
2. `skills/raven/job-returning-session.md` no longer exits as a placeholder and instead defines
   the six returning-session beats.
3. The job uses `git log --since=<config date>` rather than directory heuristics for drift
   detection and describes honest fallback behavior.
4. The scoreboard beat requires a real derived scoreboard rather than a narrated placeholder.
5. The room-open flow includes a completed-plan nudge path and a concise concierge opening.
6. Relevant deterministic checks pass locally.
7. `initialize/all` is rerun and the new `initialize/returning-session-with-drift` coverage is
   present with no blocking regression.

## Deferred Follow-Ups

1. FEAT-065 cleanup of `assessment.md`, `session_notes`, and other transitional initialize
   artifacts still referenced elsewhere in the repo.
2. FEAT-066 ADR and eval-harness work for broader host-specific primitive contracts and
   returning-session lifecycle assertions beyond this narrow room-open case.
3. Any later generalized drift-detection tool that unifies Raven returning-session and Conan
   source-alignment behavior behind one shared implementation.
