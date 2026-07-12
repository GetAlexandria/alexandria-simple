# Technical Plan: Issue 231 Raven Wizard-Mode Job

- Issue reference: `#231` — `[LIB2-004] Add wizard-mode job to Raven's agent definition`
- Goal: add Raven's second job for `/library` sessions, define the wizard-mode procedure boundary, and keep the implementation aligned with the Phase 2 room model without pulling later scoreboard or delegation tickets forward
- Linked product plan: `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-004.md`, `docs/alexandria/implementation-plans/library-phase-2/outcomes/O-1.md`

## Scope

- Update `agents/raven.md` so Raven advertises wizard-mode as Job 2 alongside Product Conversation
- Align Raven's agent-level model with wizard-mode's current opus requirement while agent frontmatter remains the runtime source of truth
- Add `skills/raven/job-wizard-mode.md` as the procedure file Raven follows when invoked via `/library`
- Update Raven's reference-skill table and division-of-labor language for the wizard-mode exception where Raven directs Sam but still does not write files directly
- Add deterministic coverage for the new product runtime asset where practical

## Non-Goals

- Implementing the expert-calibration reference skill itself (`LIB2-005`)
- Implementing scoreboard derivation, renderer logic, or full session-start runtime behavior from `LIB2-006`
- Implementing the full Raven→Sam handoff mechanics from `LIB2-007`
- Changing `/wizard`, wizard-engine YAML, or downstream agent behavior outside the Raven wizard-mode boundary
- Inventing dedicated wizard-mode eval cases before the Phase 2 smoke-test flow exists

## Linked Product-Plan Summary

- Phase 2 turns `/library` into a persistent Raven-led room rather than a thin alias for the procedural wizard.
- `LIB2-004` requires two deliverables: a new wizard-mode entry in Raven's job dispatch table and a `skills/raven/job-wizard-mode.md` procedure file.
- The new job must cover the goal, session-start reference, conversational configuration flow, Sam delegation pattern, and round-closing stopping-point logic while keeping scoreboard/session-start details delegated to later tickets.

## Current Gap

- `skills/library/SKILL.md` already routes to `skills/raven/job-wizard-mode.md`, but that file does not exist yet.
- `agents/raven.md` still exposes only Product Conversation, so `/library` has no checked-in Raven procedure to follow.
- Raven's current docs say Sam writes artifacts, but they do not yet describe the wizard-mode exception where Raven directs Sam sequentially during library configuration.
- Packaging tests do not currently assert that a wizard-mode Raven job file ships in the runtime tarball.

## Architectural Boundaries

- Keep `/library` thin. The product skill should continue to point at Raven's wizard-mode procedure instead of duplicating it.
- Keep wizard-mode as procedural guidance in natural language, not executable logic or checklist text Raven would read to the user verbatim.
- Keep scoreboard derivation and session-start mechanics referenced, not reimplemented. `LIB2-006` owns the detailed session-start algorithm.
- Keep expert calibration referenced by the planned file path from `LIB2-005` without absorbing that issue's content into this slice.
- Preserve the role boundary: Raven conducts and synthesizes; Sam writes artifacts. This issue can document the exception without implementing full orchestration plumbing.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Raven agent dispatch | `agents/raven.md` | Raven can enter wizard-mode as a distinct job when `/library` invokes her |
| Raven runtime model metadata | `agents/raven.md`, `skills/shared/play-protocol.md`, the former shared orchestration reference doc under `skills/shared/` | Shared docs and agent frontmatter agree that Raven is currently pinned to opus so wizard-mode's runtime behavior matches its declared routing intent |
| Raven wizard-mode procedure | `skills/raven/job-wizard-mode.md` | Raven gets explicit guidance for library configuration sessions: first-five-minutes opening, conversational inference, Sam handoff pattern, and stopping-point closes |
| Raven reference skill loading | `agents/raven.md` | Wizard-mode names the future expert-calibration reference skill as load-on-entry context |
| Runtime packaging | `tests/build-tarball.test.ts` | Tarball coverage proves the new wizard-mode job file ships in the distributable plugin |
| Capability routing metadata | `src/tools/route.test.ts` | Route coverage proves the new wizard-mode job file has valid `requires:` metadata |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `raven` agent definition | Adds wizard-mode as Job 2 and documents that directing Sam is allowed in wizard-mode only | Keep reference-skill table and division-of-labor copy aligned with the new job |
| Raven/shared orchestration metadata | Pins Raven to opus for now because runtime still honors agent frontmatter rather than per-job routing | Keep shared model tables aligned so orchestrators pass the same model Raven's agent definition now declares |
| `skills/raven/job-wizard-mode.md` | New product-facing reusable job procedure for `/library` sessions | Run Raven evals because Raven behavior surfaces changed; keep `/library` thin and unchanged |
| `library` skill | No direct procedural change in this slice | Validate that its forward reference now resolves to a real file |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Routing metadata | `bun test src/tools/route.test.ts` | Confirms the new wizard-mode job file has parseable capability metadata |
| Runtime packaging | `bun test tests/build-tarball.test.ts` | Confirms the new Raven job file ships in the runtime tarball |
| Repo checks | `bun run check` | Validates markdown, formatting, and typed surfaces after agent/skill/test edits |
| Full deterministic suite | `bun test` | Confirms the additive Raven job work does not regress the existing plugin/test surface |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `agents/raven.md` and `skills/raven/*` | Yes (`tests/eval-cases/raven/*`) | Rerun Raven evals because the agent and Raven skill surface changed | `bin/alexandria-eval run raven/all` |
| Wizard-mode itself | No dedicated eval coverage yet | Do not invent a new eval case in this slice; note the explicit Phase 2 defer until smoke-test/hardening work | defer to later Phase 2 tickets |
| `skills/wizard/*` | Existing wizard eval coverage | No rerun if wizard files remain untouched | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The new wizard-mode procedure could accidentally absorb `LIB2-006` or `LIB2-007` implementation details, making later tickets harder to land cleanly | Keep session-start and Sam delegation sections at the procedure-boundary level and explicitly reference the later tickets for detailed mechanics |
| Referencing `skills/raven/expert-calibration.md` before `LIB2-005` lands could create a misleading impression that the file already exists | Name it as a planned reference skill path and keep the job copy clear that Raven loads it when present as the wizard-mode calibration source |
| Raven's general product-conversation rules could be weakened unintentionally when adding the wizard-mode exception | Scope the Sam-direction exception to wizard-mode only and leave product-conversation boundaries intact |
| Raven's wizard-mode capability routing could disagree with real runtime behavior while agent-level model selection remains authoritative | Pin Raven's agent frontmatter to opus for now and update shared orchestration docs so runtime behavior matches the Phase 2 plan until per-skill runtime routing exists |
| The new job file could be added locally but omitted from the packaged runtime | Add a tarball assertion for `skills/raven/job-wizard-mode.md` |

## Implementation Steps

1. Write this repo-specific plan for issue `#231`.
2. Update `agents/raven.md` to add Job 2, the wizard-mode reference skill entry, the wizard-mode-specific Sam delegation exception, and the current opus runtime pin needed while agent frontmatter remains authoritative.
3. Update shared orchestration references so any agent launching Raven passes the same model Raven now declares.
4. Create `skills/raven/job-wizard-mode.md` with the required goal, trigger, inputs, session-start reference, conversational configuration flow, Sam delegation protocol summary, and exit/stopping-point guidance.
5. Add deterministic assertions for routing metadata and packaged runtime inclusion.
6. Run targeted deterministic tests for route/build-tarball.
7. Run `bun run check`.
8. Run `bun test`.
9. Run `bin/alexandria-eval run raven/all`, inspect results, and compare against baselines.
10. Perform a local diff review, then update or open the PR from `symphony/231`.

## Acceptance / Exit Criteria

1. `agents/raven.md` includes wizard-mode as Job 2 with the expected file path.
2. `skills/raven/job-wizard-mode.md` exists and covers the required procedure sections without embedding later-ticket logic.
3. Raven's division-of-labor and reference-skill tables reflect the wizard-mode exception and future expert-calibration dependency accurately.
4. Deterministic coverage proves the new job file routes cleanly and ships in the runtime package.
5. `bun run check` passes.
6. `bun test` passes.
7. `bin/alexandria-eval run raven/all` completes without an unacceptable regression.

## Deferred Follow-Ups

1. Land `skills/raven/expert-calibration.md` in `LIB2-005`.
2. Implement full session-start reconstruction and scoreboard rendering in `LIB2-006`.
3. Implement the concrete Raven→Sam artifact handoff mechanics in `LIB2-007`.
4. Add wizard-mode-specific eval cases after the Phase 2 smoke-test work establishes the real interaction shape.
