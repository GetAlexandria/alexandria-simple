# Technical Plan: /revise-plan Skill

- Issue reference: `#54` `/revise-plan` skill
- Goal: Add a product-facing `/revise-plan` skill that performs a mid-flight plan revision when re-planning triggers fire by reviewing the existing implementation plan, checking completed enablers and their findings, identifying dependent tickets that need changes, and updating the affected planning artifacts in place.
- Linked product plan: [docs/alexandria/plans/implementation-planning/plan.md](/Users/jessmartin/Documents/code/alexandria/.tmp/workspaces/sociotechnica-org_alexandria_54/docs/alexandria/plans/implementation-planning/plan.md)

## Scope

- Add a new `skills/revise-plan/SKILL.md` product skill with a concrete workflow for revising an existing implementation plan after an enabler or milestone changes the execution picture.
- Define the revision contract around existing plan artifacts: `release.md` as the control document, plus affected `tickets/*.md` and `outcomes/*.md` when scope or sequencing changes require it.
- Add eval coverage for the new skill, including structural checks and at least one runnable case that proves the skill updates the plan artifacts instead of only describing changes.
- Align the implementation-planning lifecycle docs and references that still use the older `/reassess-plan` placeholder name.

## Non-Goals

- Closing out completed work; `/complete-plan` remains the close-out step.
- Syncing ticket state from GitHub, Linear, or repository commit history.
- Reworking the implementation-planning artifact format beyond the revision metadata and artifact updates this skill owns.
- Automating re-planning trigger detection outside the skill prompt itself.

## Current Gap

- The implementation-planning plan and release doc format already reserve space for re-planning triggers, but there is no executable product skill that acts on them.
- Older checked-in docs still describe the companion step as `/reassess-plan`, which creates naming drift against the issue and the intended skill surface.
- There is no eval coverage for mid-flight revision behavior, so regressions in artifact-updating behavior would not be caught.

## Architectural Boundaries

- The new behavior belongs in a standalone product skill under `skills/`, not in contributor workflows or a CLI tool.
- `/revise-plan` updates planning artifacts only. It should not write implementation code, open issues, or mutate context-library cards directly.
- The skill should reason from checked-in plan artifacts plus user-provided execution evidence. It should not assume external tracker integration or repo-specific ticket taxonomies beyond the existing implementation-plan file structure.
- Revision should be additive and surgical: update the existing plan bundle in place rather than creating a parallel plan or rewrite artifact.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Product skill | `skills/revise-plan/SKILL.md` | Adds the mid-flight revision workflow and output contract |
| Planning lifecycle docs | `README.md`, `docs/alexandria/plans/implementation-planning/plan.md`, relevant library docs under `docs/alexandria/library/product/` | Renames `/reassess-plan` references and documents `/revise-plan` as the active companion skill |
| Eval guidance | `EVALS.md` | Adds the new skill to the skill-to-eval rerun map |
| Eval cases | `tests/eval-cases/revise-plan/*` | Adds structural and judge coverage for reusable revision behavior |
| Eval discovery smoke | `src/tools/eval-cli.test.ts` if needed | Keeps eval discovery expectations aligned if a hard-coded skill list exists |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `revise-plan` | Reads an existing implementation plan, evaluates fired re-planning triggers against execution evidence, and updates the release doc plus affected plan files in place | Add eval case, structural checks, README/EVALS references |
| `implementation-planning` lifecycle docs | Re-planning triggers now point to `/revise-plan` instead of the older placeholder name | Keep lifecycle documentation and product library references consistent |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Required repo baseline for changed docs, tests, and skill files |
| Test suite | `bun test` | Covers eval discovery and any touched TypeScript structural-check helpers/tests |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/revise-plan/*` | None | Create new eval coverage in this slice | New case under `tests/eval-cases/revise-plan/` |
| `revise-plan` skill after implementation | New coverage created by this slice | Run the new skill eval and review results/baseline | `bin/alexandria-eval run revise-plan/all` |
| Renamed lifecycle docs | N/A | No extra eval beyond the skill rerun | Covered by doc updates plus deterministic checks |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The skill could speak about needed revisions without actually updating the affected plan files | Add an explicit mandatory write transition and structural checks that require in-place plan artifact modification |
| The skill could overfit to Alexandria’s own ticket naming or release-doc phrasing | Keep the instructions grounded in generic implementation-plan concepts and use generic fixture content in the eval case |
| Renaming `/reassess-plan` references could miss one of the lifecycle docs and leave the product story inconsistent | Search all checked-in references, update only the lifecycle-relevant ones in this slice, and verify with repo-wide checks |
| Revision logic could sprawl into tracker automation or execution close-out responsibilities | State explicit non-goals in the skill and keep the workflow focused on plan revision after re-planning triggers |

## Implementation Steps

1. Create `skills/revise-plan/SKILL.md` with a concrete workflow and explicit in-place artifact update contract.
2. Update lifecycle docs and product references from `/reassess-plan` to `/revise-plan` where they describe the companion skill.
3. Add a `revise-plan` eval suite with fixture plan artifacts, structural checks, judge criteria, and a runnable case.
4. Adjust any eval discovery tests only if the new eval surface requires it.
5. Run deterministic checks, run the targeted `revise-plan` eval, and review the diff for missing artifact alignment.

## Acceptance / Exit Criteria

1. `skills/revise-plan/SKILL.md` exists and clearly instructs how to revise an implementation plan in place.
2. Checked-in lifecycle docs no longer advertise `/reassess-plan` as the active companion skill where `/revise-plan` is intended.
3. There is runnable eval coverage for `revise-plan`, with baseline artifacts checked in.
4. `bun run check`, `bun test`, and the targeted `revise-plan` eval succeed.

## Deferred Follow-Ups

1. Future automation can connect re-planning triggers to tracker or CI signals once the product defines a stable integration contract.
2. A later slice can decide whether the historical implementation-planning archive should preserve `/reassess-plan` wording as historical record or be comprehensively renamed.
