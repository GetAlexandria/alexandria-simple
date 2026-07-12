# Technical Plan: Issue 412 Task-Primitives ADR And Eval Lifecycle Coverage

- Issue reference: `#412` — `[FEAT-066] ADR for Task primitives + eval harness updates for Task lifecycle and depth parity`
- Goal: codify Alexandria's host-specific primitive contract in an ADR, link that decision from the shipped first-session guidance, and strengthen initialize eval coverage so the harness can distinguish real Task-orchestrated runs from prose fallback runs while preserving the already-landed first-session depth and returning-session behavior
- Linked product plan: `docs/alexandria/implementation-plans/initialize-ritual-restoration/tickets/FEAT-066.md`, `docs/alexandria/implementation-plans/initialize-ritual-restoration/release.md`, `docs/alexandria/implementation-plans/initialize-ritual-restoration/outcomes/O-3.md`, `docs/alexandria/implementation-plans/initialize-ritual-restoration/outcomes/O-4.md`

## Scope

- Add the repo technical plan for issue `#412`
- Write the next ADR under `docs/adrs/` covering host-specific primitives as execution aids with explicit fallback contracts
- Link that ADR from the first-session Raven job and the repo development guidance where host portability is already described
- Extend the eval harness so it can persist enough Claude session metadata for structural checks to assert tool lifecycle behavior, not just transcript prose
- Tighten initialize eval coverage so at least one first-session case is expected to use Task primitives when the host exposes them, and at least one case explicitly verifies the prose fallback path when Task tools are unavailable
- Keep the already-landed first-session depth criteria and returning-session eval coverage aligned with the new lifecycle assertions

## Non-Goals

- Rewriting the first-session or returning-session Raven procedures beyond the minimal ADR link / fallback wording needed to keep shipped guidance accurate
- Broadening Task orchestration beyond `/library` first-session initialize into other agents or skills
- Reworking initialize judge depth criteria from FEAT-063 beyond any minimal edits needed to keep criteria honest after case split / fallback additions
- Replacing the eval harness transcript or baseline format wholesale; this slice should add the smallest artifact needed for lifecycle assertions
- Depending on raw GitHub issue text over the checked-in repo docs and plan artifacts

## Current Gap

- The branch already includes the FEAT-062/063/064 prompt work: `job-first-session.md`, `job-returning-session.md`, `initialize/first-session-empty-project`, `initialize/returning-session-with-drift`, and judge-reference depth criteria are all present
- What is still missing is the governing ADR itself, plus the explicit repo references to that decision
- Initialize structural checks currently assert transcript beat cues and returning-session concierge cues, but they do not prove whether Task primitives were actually used, whether they were created in the documented order, or whether prose fallback was exercised intentionally
- The eval runner records `session_id` but does not currently persist the underlying Claude session JSONL or any derived tool trace into eval artifacts, so structural checks cannot inspect tool usage deterministically
- Existing initialize case configs still only exercise the no-Task path in this environment, so the fallback contract is happening accidentally rather than being named and tested as a first-class behavior

## Architectural Boundaries

- Keep the ADR short and decision-shaped. It should document the portability contract and test obligation, not restate the entire initialize ritual design
- Keep the canonical procedure in `skills/raven/job-first-session.md`. The ADR governs when host-specific primitives are allowed; it does not replace the prompt as the first-session spec
- Keep lifecycle verification inside the eval system. Production skill files should describe the fallback contract; the harness and structural checks should prove it
- Persist only the minimum eval artifact needed for deterministic lifecycle checks. Prefer a normalized task/tool trace or captured session-log copy scoped to the eval output over direct dependence on transient files in `~/.claude/projects`
- Preserve generic wording. The ADR and skill text must describe a reusable Alexandria rule, not a one-off repo-specific exception

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/412-task-primitives-adr-eval-lifecycle/plan.md` | Captures the repo-specific FEAT-066 slice, verification, and eval decisions |
| ADR set | `docs/adrs/004-*.md` | Alexandria formally allows host-specific primitives only as execution aids with explicit fallback and test obligations |
| Repo guidance | `CLAUDE.md`, `EVALS.md` if needed | Development guidance points maintainers at the new ADR when host-specific primitive usage is introduced or updated |
| First-session Raven job | `skills/raven/job-first-session.md` | The Task-orchestration section links to the ADR and keeps the prose-fallback contract explicit in the shipped skill |
| Eval harness | `src/tools/eval-harness.ts`, `tests/eval-runner.test.ts` | Eval runs can capture session-level tool evidence needed for lifecycle structural checks and fallback assertions |
| Initialize eval surface | `tests/eval-cases/initialize/*`, `tests/eval-cases/initialize/structural-checks.ts`, checked-in baselines under `tests/evals/initialize/*` | First-session coverage distinguishes Task-enabled lifecycle expectations from explicit prose-fallback expectations without regressing depth or returning-session assertions |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/raven/job-first-session.md` | The Task-orchestration section explicitly points to the governing ADR for why Tasks are allowed and how fallback must be declared | Keep the in-file fallback contract and beat graph aligned with the ADR language so docs and behavior do not drift |
| Initialize eval behavior | Structural checks can assert whether a first-session run used Task primitives in the documented order or intentionally stayed on the prose path | Keep case configs, baselines, and any captured eval artifacts aligned so the assertions reflect the real host behavior exercised by each case |
| `src/tools/eval-harness.ts` | The harness preserves enough session evidence for deterministic post-run verification of tool usage | Add focused deterministic coverage rather than relying on live Claude behavior to test the new artifact path |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates Markdown, JSON, and TypeScript formatting / linting after ADR, prompt, and harness edits |
| Eval harness regression coverage | `bun test tests/eval-runner.test.ts` | Verifies session-log capture / lifecycle artifact logic without live LLM dependence |
| Full deterministic suite | `bun test` | Confirms the prompt, eval-case, and harness changes do not regress broader repo behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `/library` initialize first-session depth + composition | Yes, via `initialize/all`, including `first-session-empty-project` and the existing judge-reference depth criteria | Rerun the initialize suite after lifecycle assertions land because the case set / structural checks change | `bin/alexandria-eval run initialize/all` |
| First-session Task lifecycle | No deterministic assertion exists today | Update one first-session case to allow Task tools when the host supports them and add structural checks that verify `TaskCreate` / `TaskUpdate` order from captured session evidence | likely update `tests/eval-cases/initialize/first-session-empty-project/` plus checked-in baseline |
| First-session prose fallback | Current cases happen to run without Task tools, but that fallback is not named as a distinct contract | Add or rename a case/config that intentionally disables Task tools and asserts the same ritual completes without lifecycle events | likely add `tests/eval-cases/initialize/first-session-empty-project-prose-fallback/` plus baseline |
| Returning-session room-open | Yes, via `initialize/returning-session-with-drift` | Keep this case in the rerun set because `initialize/all` is the honest affected boundary, but do not broaden the returning-session prompt unless required | `bin/alexandria-eval run initialize/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The ADR could drift into a manifesto and duplicate prompt-level procedure details | Keep the decision record scoped to principle, rule, first instance, and test obligation; push implementation specifics back into `job-first-session.md` |
| Lifecycle checks could depend on ephemeral `~/.claude/projects` files that are unavailable once the run ends | Persist a stable eval artifact during the run so structural checks read from checked-in eval output rather than ambient host state |
| Local Claude SDK eval runs in this environment may not expose Task tools, making live lifecycle reruns incomplete | Build deterministic harness coverage for the trace pipeline, keep the prose-fallback case runnable locally, and note any host-level limitation explicitly if a live Task-enabled rerun cannot be completed here |
| Splitting task-mode and fallback coverage could accidentally duplicate or stale the depth criteria work from FEAT-063 | Reuse the existing initialize judge criteria and reference material where possible, and only fork criteria/config when the behavior under test truly differs |
| New structural checks could become overly coupled to transcript wording instead of real behavior | Prefer session-derived tool assertions for lifecycle semantics and keep transcript checks focused on user-visible ritual beats |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#412`.
2. Add the next ADR under `docs/adrs/` for host-specific primitives as execution aids with fallback contracts, linking back to ADR 001 as the portability constraint.
3. Update `skills/raven/job-first-session.md` and `CLAUDE.md` to reference the ADR where host-specific primitive usage is described.
4. Extend `src/tools/eval-harness.ts` to persist session-level tool evidence for eval runs when a `session_id` is available, and cover that path in `tests/eval-runner.test.ts`.
5. Update initialize eval configs / structural checks so one case expects Task lifecycle evidence and one case explicitly asserts the prose fallback path.
6. Refresh any directly affected initialize baseline artifacts if live reruns are possible in this environment.
7. Run `bun run check`.
8. Run `bun test tests/eval-runner.test.ts`.
9. Run `bun test`.
10. Run the targeted initialize eval reruns that match the final behavior impact, inspect results with `bin/alexandria-eval results ...` and `compare ...`, and stage updated baselines when scores hold or improve.
11. Perform a local review pass against the issue, the technical plan, and the final diff.
12. Update or open the PR against `main`, then follow CI / review as far as the available environment permits.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/412-task-primitives-adr-eval-lifecycle/plan.md` exists and matches the repo slice.
2. A new ADR exists under `docs/adrs/` with clear principle, rule, first-instance, and test-obligation sections for host-specific primitives.
3. `skills/raven/job-first-session.md` and `CLAUDE.md` link or point maintainers to that ADR where the Task / portability contract is relevant.
4. The eval harness persists deterministic session/tool evidence that initialize structural checks can consume.
5. Initialize structural checks can distinguish Task lifecycle success from explicit prose fallback.
6. Relevant deterministic checks pass locally.
7. Targeted initialize evals are rerun if the host can exercise them honestly; otherwise the local limitation is documented alongside the deterministic coverage added in this slice.

## Deferred Follow-Ups

1. Extending the same ADR-governed primitive contract to other host-specific capabilities beyond first-session initialize.
2. Any broader eval-harness UX work around session-log browsing or generic tool-trace reporting outside the needs of FEAT-066.
3. Future tightening of first-session depth baselines if the current reference material proves too loose after several more eval iterations.
