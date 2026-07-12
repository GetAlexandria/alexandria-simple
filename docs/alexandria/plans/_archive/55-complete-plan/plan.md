# Technical Plan: /complete-plan Skill

- Issue reference: `#55` `/complete-plan` skill
- Goal: Add a product-facing `/complete-plan` skill that closes out an existing implementation plan by updating its `release.md` with completion status, shipped vs deferred scope, execution-time decisions, and retrospective learnings.
- Linked product plan: [docs/alexandria/plans/implementation-planning/plan.md](/Users/jessmartin/Documents/code/alexandria/.tmp/workspaces/sociotechnica-org_alexandria_55/docs/alexandria/plans/implementation-planning/plan.md)

## Scope

- Add a new `skills/complete-plan/SKILL.md` product skill with a concrete close-out workflow.
- Define the close-out contract around updating an existing `docs/alexandria/implementation-plans/*/release.md`.
- Add eval coverage for the new skill, including structural checks and at least one runnable case.
- Update repo docs that describe the implementation-planning lifecycle and eval expectations.

## Non-Goals

- Building `/revise-plan`.
- Automating issue tracker inspection or GitHub ticket status syncing inside the skill.
- Reworking the implementation-planning artifact format beyond the close-out fields this skill owns.
- Adding contributor-skill workflow changes unrelated to the new product skill.

## Current Gap

- The implementation-planning plan defines `/complete-plan` conceptually, and release docs already reserve a `Deferred` section, but no executable skill exists.
- There is no reusable prompt contract telling the model how to determine shipped vs deferred work, how to capture execution decisions, or how to write the retrospective back into `release.md`.
- There is no eval coverage for this behavior, so regressions would be invisible once the skill is added.

## Architectural Boundaries

- The new behavior belongs in a standalone product skill under `skills/`, not in contributor workflows.
- The skill should update planning artifacts only, primarily `release.md`; it should not write implementation code or mutate library cards directly.
- Determining what shipped should rely on plan artifacts and user-provided execution context, not on implicit repository state or GitHub-only assumptions.
- The close-out format must stay generic across products and plans; no repo-specific ticket taxonomy beyond existing plan artifacts.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Product skill | `skills/complete-plan/SKILL.md` | Adds the new close-out workflow and output contract |
| Planning lifecycle docs | `README.md`, `docs/alexandria/plans/implementation-planning/plan.md` | Documents `/complete-plan` as a concrete lifecycle step rather than a placeholder |
| Eval guidance | `EVALS.md` | Adds the new skill to the skill-to-eval mapping |
| Eval cases | `tests/eval-cases/complete-plan/*` | Adds structural and judge coverage for the new reusable behavior |
| Eval discovery smoke | `src/tools/eval-cli.test.ts` | Ensures the eval CLI surfaces the new skill/case |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `complete-plan` | Reads an existing implementation plan and rewrites `release.md` into a completed close-out artifact | Add eval case, structural checks, README/EVALS references |
| `implementation-planning` lifecycle docs | Prior plan `Deferred` placeholder becomes paired with an actual close-out skill | Keep lifecycle documentation consistent with the new skill |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Required repo baseline for changed docs, tests, and skill files |
| Test suite | `bun test` | Covers eval CLI discovery and any touched TypeScript helpers/tests |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/complete-plan/*` | None | Create new eval coverage in this slice | New case under `tests/eval-cases/complete-plan/` |
| `complete-plan` skill after implementation | New coverage created by this slice | Run the new skill eval and review results/baseline | `bin/alexandria-eval run complete-plan/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The skill could overfit to Alexandria’s own release docs rather than general implementation plans | Phrase the skill around generic plan/ticket/outcome concepts and use generic fixture content in the eval case |
| Close-out instructions could be too loose, leading the model to chat instead of editing `release.md` | Add an explicit mandatory write/update transition and structural checks that fail if the release doc is not updated to a completed state |
| The new skill may silently conflict with the original implementation-planning release template | Keep the contract additive: completion metadata plus execution sections layered onto the existing `release.md` structure |

## Implementation Steps

1. Create the `/complete-plan` skill with a concrete step-by-step workflow and release-doc update contract.
2. Update lifecycle documentation and eval guidance to reference the new skill.
3. Add a `complete-plan` eval suite with fixture plan artifacts, structural checks, judge criteria, and a runnable case.
4. Run deterministic checks, then run the new targeted eval and review results.

## Acceptance / Exit Criteria

1. `skills/complete-plan/SKILL.md` exists and clearly instructs how to close out a plan.
2. The implementation-planning lifecycle docs no longer treat `/complete-plan` as an undefined future step.
3. There is runnable eval coverage for `complete-plan`, with baseline artifacts checked in.
4. `bun run check`, `bun test`, and the targeted `complete-plan` eval succeed.

## Deferred Follow-Ups

1. `/revise-plan` remains a separate slice.
2. Future automation can integrate ticket tracker state if the product later defines a stable connector-backed contract.
