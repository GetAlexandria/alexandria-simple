# Technical Plan: Issue 408 First-Session Initialize Job

- Issue reference: `#408` — `[FEAT-062] Build first-session Initialize job with Task orchestration and restored ritual beats`
- Goal: replace the temporary first-session `/library` stub with a real Raven-led initialize ritual that restores the ordered fresh-session beats, uses Claude Code Task primitives when available, falls back cleanly to prose when they are not, and re-establishes end-to-end `/library` initialization coverage on a fresh project
- Linked product plan: `docs/alexandria/implementation-plans/initialize-ritual-restoration/tickets/FEAT-062.md`, `docs/alexandria/implementation-plans/initialize-ritual-restoration/release.md`, `docs/alexandria/implementation-plans/initialize-ritual-restoration/CONTEXT_BRIEFING.md`

## Scope

- Add a repo technical plan for issue `#408`
- Replace `skills/raven/job-first-session.md` with the real first-session procedure
- Restore the nine required ritual beats in order:
  opening, scan consent, noun dialogue, configuration with confirmation gate, engine run,
  gap analysis, starter cards, scoreboard, Conan handoff
- Define the Task-orchestration layer inside the first-session job:
  explicit task list, beat ordering via `blockedBy` / `blocks`, and status transitions
- Define the prose fallback contract when Task primitives are unavailable in the host
- Keep `/library` as the only user-facing entry point while updating any live runtime text
  that still describes first-session as a stub
- Fix any directly blocking scoreboard-tool contract issue uncovered while wiring the
  first-session beat, but do not broaden into unrelated CLI redesign
- Add or update deterministic and eval coverage for the restored first-session `/library`
  flow, including the new `initialize/first-session-empty-project` case required by the
  upstream acceptance criteria

## Non-Goals

- Returning-session room-open behavior from FEAT-064
- Solicitation depth-restoration work from FEAT-063 beyond what is already present in the
  checked-in initialize reference files
- FEAT-065 cleanup such as removing `assessment.md`, pruning `session_notes`, or deleting
  stale initialize helper files
- FEAT-066 ADR and eval-harness lifecycle assertions beyond the minimum test/eval updates
  needed to land this ticket honestly
- Rewriting the initialize engine, scoreboard derivation math, or scanner heuristics unless
  implementation reveals a blocking defect in the existing shipped tools

## Linked Product-Plan Summary

- FEAT-062 is the first demoable post-split `/library` milestone: a fresh room should now
  complete end-to-end rather than exit with `BLOCKED`.
- The first-session procedure must be linear and structurally ordered; Task primitives are
  an execution aid that enforces beat ordering, not a user-facing surface.
- The ritual must explicitly reattach the scanner and noun dialogue before configuration,
  restore the configuration confirmation gate, run gap analysis as an actual beat, and
  render a real scoreboard derived from checked-in config + library state.
- The task layer must degrade gracefully when Task tools are unavailable. The prose
  procedure remains canonical.

## Current Gap

- `skills/raven/job-first-session.md` is still a FEAT-061 placeholder that stops with
  `BLOCKED` instead of running initialize.
- The live `/library` room copy still warns that first-session may route into a temporary
  stub, which becomes false once FEAT-062 lands.
- Initialize eval coverage still targets the pre-split conversational flow and has no case
  asserting the new first-session ritual on an empty project.
- The repo has shipped scanner, initialize, and scoreboard CLIs plus helper reference files,
  but the first-session Raven job does not yet connect them into one ordered procedure.

## Architectural Boundaries

- Keep `/library` as the sole user-facing entry point. The orchestration belongs inside the
  first-session Raven job, not in `skills/library/SKILL.md`.
- Keep Task primitives as invisible mechanics. The human should see progress and outcomes,
  not a tool tutorial or implementation-detail dump.
- Reuse the existing initialize helper files (`opening.md`, `configuration-questions.md`,
  `noun-dialogue.md`, `gap-analysis-flow.md`, `output-formats.md`, `scanner.md`) instead of
  re-embedding their full content into the job file.
- Preserve Raven's role boundaries: Raven can write initialize artifacts inside `/library`,
  but Sam still owns starter card drafting and Conan still owns grading / source assessment
  handoff.
- Keep the slice reviewable. If the current engine / scanner / scoreboard tools already
  satisfy the beat requirements, consume them from the prompt layer instead of rewriting the
  toolchain.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/408-first-session-initialize/plan.md` | Captures the repo-specific scope, verification, and eval decisions for FEAT-062 |
| First-session Raven job | `skills/raven/job-first-session.md` | Replaces the placeholder stub with the ordered first-session initialize procedure, Task fallback contract, beat dependencies, and output expectations |
| `/library` entry point copy | `skills/library/SKILL.md` | Removes or narrows the temporary stub warning so the active runtime text matches shipped first-session behavior |
| Raven agent contract | `agents/raven.md` if needed | Keeps any first-session-specific responsibility text aligned if the new flow relies on wording that no longer matches the shipped runtime |
| Scoreboard CLI contract | `src/cli/scoreboard.ts`, `src/tools/scoreboard-derive.ts`, related tests | Supports rendering a freshly initialized zero-card room honestly so Beat 8 can run on a true first session without requiring pre-existing library files |
| Initialize eval suite | `tests/eval-cases/initialize/*`, `tests/evals/initialize/*`, `tests/eval-cases/initialize/structural-checks.ts`, related harness-facing files as needed | Restores meaningful `/library` first-session coverage after the FEAT-061 split and adds a case for the empty-project ritual |
| Deterministic coverage | Existing tests under `src/`, `tests/`, and any new targeted tests added in this slice | Verifies any helper logic or runtime text changes needed to support the restored flow |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/raven/job-first-session.md` | First-session now completes the full initialize ritual instead of failing with `BLOCKED`; it explicitly loads opening, scanner, noun-dialogue, configuration, gap-analysis, and output-format references, creates ordered Tasks when available, and falls back to prose when not | Keep beat order, artifact writes, and Raven/Sam/Conan division of labor aligned with initialize helper docs and FEAT-062 acceptance criteria |
| `skills/library/SKILL.md` | `/library` no longer describes first-session as a generic temporary blocked stub once config is absent | Keep the entry-point doc thin and make clear that only returning-session may still be a later-ticket placeholder |
| Initialize eval surface (`skill: "library"` cases under `tests/eval-cases/initialize/`) | Eval coverage shifts from the old monolithic initialize shape to the post-split first-session ritual, including explicit confirmation of the restored fresh-session path | Add or update the case config, persona, structural checks, and checked-in baselines so the suite exercises the new behavior honestly |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, YAML/JSON/TS formatting, and lint rules after prompt/doc/test edits |
| Full deterministic suite | `bun test` | Confirms the skill/doc/test slice does not regress the checked-in deterministic suites, including initialize, scan, scoreboard, packaging, and eval-runner coverage |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `/library` initialize flow | Yes, via `initialize/*` eval cases using `skill: "library"` | Rerun the initialize suite because FEAT-062 restores the real first-session behavior on the user-facing `/library` entry point | `bin/alexandria-eval run initialize/all` |
| Empty-project first-session ritual | No dedicated case today | Add a new case that exercises a fresh project through the restored nine-beat first-session path and confirms the required artifacts / structural flow | create `tests/eval-cases/initialize/first-session-empty-project/` and check in `tests/evals/initialize/first-session-empty-project/` |
| Raven product-conversation surface | Existing Raven evals do not cover `/library` first-session behavior directly | Do not rerun `raven/all` by default in this slice unless edits spread beyond the first-session initialize surface into shared Raven behavior; document this as an intentional behavior-based exception to the path heuristic | none unless implementation broadens |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The first-session job could reintroduce a long prose blob that looks ordered but still lets beats get skipped under model load | Make the beat structure explicit in the job file, mirror it into task dependencies when available, and add eval coverage for the restored empty-project path |
| Task primitives may not be present in every harness running the plugin | Document a capability check and a prose fallback path inside the job so missing Task tools degrade cleanly instead of producing user-visible failure |
| The job could drift into FEAT-063 by rewriting all solicitation content inline | Reuse the checked-in initialize helper files for the conversational content and keep this slice focused on orchestration + beat restoration |
| The scoreboard beat could become agentically faked instead of derived from disk state | Require `alxndr scoreboard derive <path>` plus the shipped renderer path in the job instructions and verify this expectation through review and eval artifacts |
| Eval coverage could still miss the new fresh-session path if only legacy initialize cases are rerun | Add the dedicated `first-session-empty-project` case in the same slice rather than relying only on historical cases |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#408`.
2. Replace the placeholder `skills/raven/job-first-session.md` with the real first-session
   procedure, including beat ordering, Task dependency guidance, fallback behavior, and
   explicit helper-file loads.
3. Update `skills/library/SKILL.md` and any other live runtime-facing copy that still
   describes the first-session path as a temporary blocked stub.
4. Add or update any deterministic tests needed if implementation introduces new helper
   logic beyond prompt-only changes.
5. Add `tests/eval-cases/initialize/first-session-empty-project/` plus any needed
   structural-check updates so the eval suite covers the restored fresh-session path.
6. Run `bun run check`.
7. Run `bun test`.
8. Run `bin/alexandria-eval run initialize/all`, inspect results with
   `bin/alexandria-eval results ...` / `compare ...`, and check in updated baselines if
   scores hold or improve.
9. Perform a manual local review against the issue, plan, and final diff.
10. Update or open the PR against `main`, then carry CI / review to a clean mergeable
    state per repo policy.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/408-first-session-initialize/plan.md` exists and matches the
   repo slice.
2. `skills/raven/job-first-session.md` no longer exits as a stub and instead defines the
   real ordered first-session initialize flow.
3. The job explicitly includes all nine required beats and states the configuration
   confirmation gate.
4. The job defines Task-based ordering with explicit dependency guidance and a prose
   fallback when Task primitives are unavailable.
5. Live `/library` runtime text no longer falsely claims the first-session path is still a
   temporary blocked stub.
6. Relevant deterministic checks pass locally.
7. `initialize/all` is rerun and the new `initialize/first-session-empty-project` coverage
   is present with no blocking regression.

## Deferred Follow-Ups

1. FEAT-063 depth-restoration pass for richer solicitation and opening content.
2. FEAT-064 returning-session room-open implementation and shared scoreboard reuse there.
3. FEAT-065 cleanup of `assessment.md`, session-note remnants, and other transitional
   initialize artifacts.
4. FEAT-066 ADR + stronger eval assertions for Task lifecycle semantics across supported
   harnesses.
