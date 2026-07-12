---
name: alexandria-dev-targeted-evals
description: >
  Determine and run only Alexandria evals that are impacted by a change. Uses
  the final diff, the technical plan, and EVALS.md to identify changed behavior surfaces,
  rerun the relevant evals, decide when new eval cases must be created, compare results to
  baselines, and prepare a PR-ready eval summary.
  Use after implementation and local review for agent, skill, template, initialize, or
  eval-backed behavior changes in this repo.
---

# Targeted Evals

Run the smallest honest eval set for the change.

This skill is contributor workflow guidance for this repository. It is not a product skill
for downstream Alexandria users.

The goal is not just "rerun whatever files match a glob." The goal is to identify changed
behavior surfaces, rerun the evals that cover those surfaces, and create new coverage when
the change introduces a behavior with no meaningful eval safety net.

Read `contributor-skills/targeted-evals/impact-matrix.md` alongside `EVALS.md`.

## Inputs

Use these inputs together:

1. the final diff
2. the technical plan
3. `EVALS.md`
4. the changed files list
5. any new or modified eval-case files

## Workflow

### Step 1: Build the behavior impact table

Do not start from commands. Start from changed behavior.

For each touched surface, record:

1. what behavior changed
2. which reusable agent or skill owns that behavior
3. whether coverage already exists
4. whether deterministic tests are enough or evals are also required

This table should drive the commands, not the other way around.

### Step 2: Decide rerun vs create

Use these rules:

1. if existing eval coverage clearly matches the changed behavior, rerun it
2. if the change affects shared prompt behavior that flows into an eval-backed skill,
   rerun that skill even if the edited file is not under the skill directory
3. if a new product-facing reusable behavior has no meaningful coverage, create at least
   one eval case in the same slice unless the user explicitly scopes that work out
4. if the change is purely mechanical and provably does not affect modeled behavior, note
   why eval reruns are unnecessary

Do not default to `all`. Contributor-skill changes do not require eval-harness coverage by
default unless they also change a product-facing reusable surface.

### Step 3: Run the selected evals

Use the exact commands from `EVALS.md` when coverage already exists.

Typical loop:

```bash
pnpm eval -- run <skill>/all
pnpm eval -- results <skill>/<case>
pnpm eval -- compare <skill>/<case>
```

If a skill has multiple cases, check whether `all` is the right boundary or whether one
or two cases are the real impacted surface.

### Step 4: Evaluate the outcome

For each case run, record:

1. structural pass/fail
2. judge score delta vs baseline
3. whether the baseline is now stale
4. whether new baseline files must be checked in

If scores regress, stop and fix the underlying behavior before handoff.

If scores hold or improve:

1. check in the updated baselines
2. note the baseline paths in the PR

### Step 5: Write the PR-ready summary

Prepare a concise summary with:

1. changed behavior surfaces
2. evals rerun
3. new evals added, if any
4. structural results
5. judge delta
6. baseline files staged
7. any remaining known gaps

## Anti-Patterns

1. Running all evals because several surfaces changed
2. Relying only on changed-file globs when a shared helper changed downstream behavior
3. Ignoring new-skill coverage gaps because no rule exists in `EVALS.md` yet
4. Checking in baselines without reviewing `results` and `compare`
