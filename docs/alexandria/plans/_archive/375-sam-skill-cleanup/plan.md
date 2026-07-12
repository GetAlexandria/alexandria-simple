# Issue #375 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#375`
- Goal: Clean up Sam's skill surfaces by removing the redundant `rules.md` file, deleting stale human time estimates from the remaining Sam procedures, and replacing outdated `zone` / `room` taxonomy wording with current `domain` / `section` terminology where this slice touches active Sam guidance.
- Linked product plan: None. The GitHub issue itself is the product-level intent for this slice.

## Scope

- Delete `skills/sam/rules.md` because its guidance is already represented in Sam's active prompt and other Sam skill files.
- Remove time-estimate language from `skills/sam/card-creation.md` and `skills/sam/self-check.md`.
- Replace the stale `zone` / `room` taxonomy wording in `skills/sam/decomposition.md`.
- Update active checked-in docs that describe Sam's current skill set so they no longer claim `rules.md` is an active Sam skill.
- Update any directly touched active Sam prompt wording that still uses the stale `zone` shorthand for create-card dispatch.

## Non-Goals

- Broad refactoring of Sam's overlapping skill content beyond the targeted cleanup in this issue.
- Historical release notes, archived update scratchpads, or older plan docs that intentionally preserve prior repo state.
- Changes to Conan, Bridget, Raven, Solomon, CLI behavior, or Alexandria version metadata.
- New eval cases or taxonomy redesign work outside the stale terminology already identified in this issue.

## Current Gap

- `skills/sam/rules.md` still ships as a standalone file even though its rules are already embedded in `agents/sam.md` and overlapping Sam guidance.
- `skills/sam/card-creation.md` and `skills/sam/self-check.md` still contain human checklist duration estimates that are not useful prompt instructions.
- `skills/sam/decomposition.md` still uses retired `zone` / `room` terminology in its extraction guidance.
- Active docs still describe Sam as having six skills including `rules.md`, which becomes inaccurate once the file is removed.

## Architectural Boundaries

- This slice is prompt-and-doc cleanup for the Sam agent surface and its active repo documentation.
- Behavior changes belong only in Sam's agent/skill wording and current descriptive docs that must stay aligned with the shipped prompt surface.
- Historical records under release notes, archived updates, and older plans should stay unchanged unless they block current behavior, because they document past states.
- This slice should not introduce new workflow rules, change library taxonomy beyond the stale terms already identified, or widen into a larger Sam prompt consolidation effort.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Technical planning | `docs/alexandria/plans/375-sam-skill-cleanup/plan.md` | Records the repo-specific cleanup scope, verification, and exit criteria for issue #375. |
| Sam skill files | `skills/sam/card-creation.md`, `skills/sam/self-check.md`, `skills/sam/decomposition.md`, `skills/sam/rules.md` | Removes redundant prompt surface, strips stale human time estimates, and restores current taxonomy wording in active Sam guidance. |
| Sam agent prompt | `agents/sam.md` | Keeps create-card dispatch wording aligned with the current `domain` / `section` taxonomy used by the remaining Sam skills. |
| Active design and library docs | `docs/design/org-chart.md`, `docs/alexandria/library/product/agents/Agent - Sam the Scribe.md` | Keeps the documented Sam skill inventory aligned with the shipped prompt surface after `rules.md` is removed. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Sam skill set | `rules.md` is retired as a separate Sam skill because its operational rules are already represented elsewhere in Sam's prompt surface. | Update active docs that enumerate Sam skills; rerun Sam eval coverage because `skills/sam/*` changed. |
| Sam card creation + self-check procedures | Removes human-oriented duration estimates so the procedures stay instruction-focused rather than checklist-timed. | Verify no stale timing text remains; rerun Sam eval coverage. |
| Sam taxonomy wording | Replaces stale `zone` / `room` card-type terminology with `domain` / `section` wording in active Sam guidance touched by this slice. | Verify the stale terms are gone from the intended active surfaces; rerun Sam eval coverage. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Required repo gate for markdown/prompt/doc changes. |
| Repo tests | `bun test` | Required deterministic gate from `CLAUDE.md` for touched product-facing prompt files. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Sam agent + skills | Yes: `sam/create-cards` and `sam/fix-cards` via `sam/all` | Rerun the existing Sam suite because active files under `skills/sam/*` and `agents/sam.md` change behavior wording. | `bin/alexandria-eval run sam/all`, `bin/alexandria-eval results sam/create-cards`, `bin/alexandria-eval compare sam/create-cards`, `bin/alexandria-eval results sam/fix-cards`, `bin/alexandria-eval compare sam/fix-cards` |
| New coverage needs | Existing Sam coverage should be sufficient because this issue removes redundancy and stale wording rather than adding a new reusable behavior. | No new eval case planned unless the rerun exposes an uncovered regression. | None planned |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Removing `rules.md` leaves active docs or prompt references describing a Sam skill that no longer ships. | Update the active docs that enumerate Sam's skills and search for remaining active references before finishing. |
| A mechanical cleanup changes wording that Sam evals rely on for create/fix behavior. | Rerun `sam/all`, inspect results and compare output, and only accept the slice if scores hold or improve. |
| Historical docs or plans get edited unnecessarily, making the slice noisy and harder to review. | Limit edits to active prompt/doc surfaces and leave archived release notes, updates, and old plans untouched. |

## Implementation Steps

1. Add the issue plan under `docs/alexandria/plans/375-sam-skill-cleanup/plan.md`.
2. Update active Sam prompt/doc surfaces to remove stale `zone` / `room` wording where this slice touches them.
3. Remove time estimates from `skills/sam/card-creation.md` and `skills/sam/self-check.md`.
4. Delete `skills/sam/rules.md`.
5. Update active docs that still list `rules.md` as part of Sam's shipped skill set.
6. Search the touched active surfaces to confirm the targeted stale wording and deleted-skill references are gone.
7. Run `bun run check`, `bun test`, and the targeted Sam eval suite.
8. Review the final diff, then open or update the PR with plan path, verification, and eval summary.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/375-sam-skill-cleanup/plan.md` exists and matches the final slice.
2. `skills/sam/rules.md` is removed.
3. No time-estimate wording remains in `skills/sam/card-creation.md` or `skills/sam/self-check.md`.
4. The stale `zone` / `room` card-type wording targeted by this issue is removed from `skills/sam/decomposition.md`, and active touched Sam guidance stays aligned with current taxonomy.
5. Active docs no longer claim Sam ships `rules.md` as a current skill.
6. `bun run check`, `bun test`, and the targeted Sam eval rerun complete successfully, or any environment blocker is explicitly documented.
7. The branch has an open or updated PR against `main` with the plan path and verification summary.

## Deferred Follow-Ups

1. Consider a larger Sam prompt deduplication pass separately if the remaining overlap across `card-creation.md`, `self-check.md`, `decomposition.md`, and `link-patterns.md` still causes maintenance cost.
2. If future Sam cleanup removes additional active prompt surfaces, revisit whether the Sam agent card and org-chart docs need a broader simplification update.
