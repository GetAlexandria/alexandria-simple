# Technical Plan: Move Plans into docs/alexandria/

- Issue: sociotechnica-org/alexandria#186
- Goal: Move `docs/plans/` and `docs/implementation-plans/` into the context library directory under `docs/alexandria/`, making them first-class persistent library artifacts.

## Scope

- Move `docs/plans/` → `docs/alexandria/plans/`
- Move `docs/implementation-plans/` → `docs/alexandria/implementation-plans/`
- Update all hardcoded path references across source, skills, contributor-skills, tests, and docs

## Non-Goals

- Reorganizing the contents of plans or implementation plans
- Changing plan file formats or naming conventions
- Moving `docs/adrs/`, `docs/design/`, `docs/wizard/`, or `docs/releases/`

## Current Gap

`docs/plans/` sits at repo root level alongside `docs/alexandria/`, `docs/design/`, and `docs/adrs/`. Plans are persistent artifacts documenting product decisions, execution history, and deferred work — they belong inside the library directory alongside the cards they reference. Same for `docs/implementation-plans/`, which holds skill-produced execution artifacts.

## Architectural Boundaries

- Both directories move as atomic units; no file contents change
- `git mv` preserves history
- All consumer references (tools, skills, tests, docs) update to new paths in the same slice

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| CLI tool | `src/tools/sync-issues.ts` | Default `--root` changes from `docs/plans` to `docs/alexandria/plans` |
| Build test | `tests/build-tarball.test.ts` | Path assertion updated |
| Top-level docs | `README.md`, `CLAUDE.md`, `WORKFLOW.md` | Path references updated |
| Contributor skills | `contributor-skills/technical-planning/plan-template.md`, `contributor-skills/technical-planning/SKILL.md`, `contributor-skills/issue-execution/SKILL.md` | Output paths updated |
| Product skills | `skills/implementation-planning/SKILL.md`, `skills/implementation-planning/ticket-writer.md` | Output directory paths updated |
| Eval cases | `tests/eval-cases/ticket-writer/standard-format/inputs.md`, `tests/eval-cases/implementation-planning/taskflow-realtime/persona.md` | Example/default paths updated |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `implementation-planning` skill | Output dir changes to `docs/alexandria/implementation-plans/<name>/` | `ticket-writer.md`, eval case inputs and persona |
| `technical-planning` contributor skill | Plan output path changes to `docs/alexandria/plans/<issue>/plan.md` | `plan-template.md`, `SKILL.md`, `issue-execution/SKILL.md` |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| All checks | `bun run check` | Linting, type-check, markdown audit |
| All tests | `bun test` | Includes build-tarball test and sync-issues test |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `implementation-planning` | Yes — `implementation-planning/all`, `ticket-writer/all` | Update eval case inputs/persona paths only; no behavior change | Confirm evals still pass after path update |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Internal cross-references within plan docs become stale | Plans reference each other by path; those are historical docs and will move together, so relative links within the plans dir remain correct |
| Tarball test asserts specific plan path | Update the assertion to the new path |
| Eval transcripts contain old paths | Transcripts are historical snapshots; leave them as-is unless they fail an eval assertion |

## Implementation Steps

1. Write this plan doc (done)
2. `git mv docs/plans docs/alexandria/plans` — moves all 38+ plan dirs including this plan
3. `git mv docs/implementation-plans docs/alexandria/implementation-plans`
4. Update `src/tools/sync-issues.ts` — 3 comment occurrences + 1 default value
5. Update `tests/build-tarball.test.ts` — 1 path assertion
6. Update `README.md` — 1 path example
7. Update `CLAUDE.md` — 2 path references
8. Update `WORKFLOW.md` — 2 path references
9. Update `contributor-skills/technical-planning/plan-template.md` — 1 path reference
10. Update `contributor-skills/technical-planning/SKILL.md` — 2 path references
11. Update `contributor-skills/issue-execution/SKILL.md` — 1 path reference
12. Update `skills/implementation-planning/SKILL.md` — 7 path references
13. Update `skills/implementation-planning/ticket-writer.md` — 1 default output dir
14. Update `tests/eval-cases/ticket-writer/standard-format/inputs.md` — 1 output dir
15. Update `tests/eval-cases/implementation-planning/taskflow-realtime/persona.md` — 1 path reference
16. Run `bun run check && bun test`
17. Open PR

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/` exists with all prior plan directories
2. `docs/alexandria/implementation-plans/` exists with all prior implementation plan directories
3. `docs/plans/` and `docs/implementation-plans/` no longer exist at repo root
4. `bun run check && bun test` passes
5. PR opened against main

## Deferred Follow-Ups

1. Eval transcript files in `tests/evals/` contain old paths in historical snapshots — these are non-functional and can be updated in a follow-up if desired
2. Internal cross-references within plan docs themselves (e.g. one plan referencing another) can be updated in a dedicated cleanup pass
