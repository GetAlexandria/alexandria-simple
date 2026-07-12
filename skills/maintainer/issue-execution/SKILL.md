---
name: alexandria-dev-issue-execution
description: >
  Execute an Alexandria GitHub issue end-to-end. Accepts issue references as `#123`
  or a full GitHub issue URL, reads the linked product-level plan.md, creates or reuses
  the issue branch, writes a repo-specific technical plan, implements the change, runs
  local review, runs only the impacted evals, and carries the PR to a clean passing
  review state.
  Use when asked to implement or finish a GitHub issue in this repo.
---

# Issue Execution

Run the full Alexandria implementation workflow for a GitHub issue.

This skill is maintainer workflow guidance for this repository. It is not part of the
Alexandria product surface for downstream users.

It uses:

1. `technical-planning` before substantial implementation
2. `targeted-evals` after local review and before final PR handoff

## Inputs

Accept either of these issue references:

1. `#123`
2. `https://github.com/<owner>/<repo>/issues/123`

Treat the current repository as the default tracker repo unless the user explicitly says
otherwise. If the issue text or comments link to a product-level `plan.md`, read it and
treat it as upstream product intent, not as the repo's technical plan.

## Workflow

### Step 1: Resolve the issue

1. Parse the issue reference.
2. Fetch the issue title, summary, labels, and comments.
3. Find any linked `plan.md` files in the issue body or comments.
4. Build a short normalized handoff:
   - issue number and title
   - linked product plan path or URL
   - explicit acceptance or constraints from the issue
   - open questions or missing links

If the issue does not include a usable product-level plan and the work is substantial,
surface that gap immediately.

### Step 2: Prepare the repo

1. Read `CLAUDE.md`, `README.md`, and the most relevant docs or existing plans.
2. Inspect the current branch and working tree.
3. If you are already inside a Symphony-prepared issue workspace or branch, reuse that
   branch exactly as prepared. Do not rename it or replace it with a different local
   branch convention.
4. If the work is tied to a numbered issue and no Symphony-prepared issue branch already
   exists, create or reuse an issue branch named `issue-<number>-<slug>`.
5. Do not overwrite unrelated local changes.

### Step 3: Write the repo technical plan

Before substantial code changes, read `contributor-skills/technical-planning/SKILL.md` and
write or update:

`docs/plans/<issue-number>-<task-name>/plan.md`

The plan must translate the product-level issue into repo-specific implementation work.
At minimum, it must cover:

1. scope and non-goals
2. architectural boundaries
3. touched files or subsystems
4. changed behavior surfaces for agents and skills
5. deterministic tests to run
6. evals to rerun or create
7. risks and mitigations
8. deferred follow-ups

If material scope changes are discovered later, update the plan and note the change on the
issue before continuing.

### Step 4: Implement the smallest honest slice

Implement the issue in the narrowest reviewable slice that still completes the assigned
work. Preserve repo boundaries:

1. keep agents, skills, templates, docs, and tests aligned
2. avoid product-specific examples in reusable agent or skill text
3. keep files small and interfaces explicit
4. do not collapse planning, grading, writing, and linting responsibilities into one path

### Step 5: Run deterministic verification

Run all locally relevant deterministic checks for the touched surfaces. Prefer the narrow
set that actually covers the change, but honor repo policy:

1. `bun run check`
2. `bun test`
3. any narrower targeted command that is more appropriate for the changed subsystem

If the change modifies docs or skills in a way that needs more than a generic test pass,
run the directly relevant suites in addition to the baseline checks.

### Step 6: Run a local review pass

Before PR handoff, perform a local review pass and fix findings.

At minimum, review for:

1. behavioral regressions
2. missing docs or plan updates
3. missing tests
4. architectural boundary leaks
5. stale examples or references
6. eval fallout that the raw diff makes obvious

If a reliable local review tool is available, use it. Otherwise do a manual code-review
pass against the diff and plan.

### Step 7: Run targeted evals

After local review findings are fixed, read `contributor-skills/targeted-evals/SKILL.md`.

This is a hard gate for behavior-changing agent or skill work:

1. identify which evals are actually impacted
2. rerun only those evals
3. compare against baselines
4. create new eval cases when the change introduces a new product-facing reusable behavior
   with no meaningful coverage
5. if scores regress, fix the behavior before proceeding
6. if scores hold or improve, check in the new baselines with the PR

Do not run all evals just because the repo supports it. Contributor-skill changes do not
themselves imply new eval-harness coverage unless they also create a product-facing
surface.

### Step 8: Open or update the PR

Open or update one PR against `main` for the issue branch.

The PR should include:

1. the issue reference
2. the plan path
3. the main implementation summary
4. deterministic checks run
5. targeted evals run
6. baseline files added or updated, if any

### Step 9: Carry the review loop through completion

Do not stop at "PR opened."

Monitor:

1. CI until all required checks pass
2. Devin Review until it completes
3. actionable review comments until they are addressed

If new scope is discovered during review:

1. update the plan
2. note the scope change on the issue or PR
3. continue from the updated plan

The default finish line is a clean, passing, mergeable PR state.

## Anti-Patterns

1. Starting implementation from the product-level issue alone without writing the repo
   technical plan
2. Treating the linked `plan.md` as if it already contains repo-specific file, test, and
   eval impacts
3. Running all evals because targeted selection feels hard
4. Opening a PR before local review and eval follow-through
5. Treating "PR opened" or "tests pass locally" as completion
