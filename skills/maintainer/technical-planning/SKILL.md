---
name: alexandria-dev-technical-planning
description: >
  Create or refine an Alexandria technical implementation plan for a GitHub issue,
  especially when the issue links to a product-level plan.md. Produces
  `docs/plans/<issue-number>-<task-name>/plan.md` with repo-specific scope, architectural
  boundaries, touched behavior surfaces, deterministic test coverage, eval rerun/create
  requirements, concrete risks, and deferred work.
  Use before substantial implementation on an issue in this repo.
---

# Technical Planning

Write a repo-specific implementation plan for Alexandria issue work.

This skill is contributor workflow guidance for this repository. It is not a product skill
for downstream Alexandria users.

The product-level issue or linked `plan.md` explains what should happen. This skill
translates that into a technical slice for this repository.

## Sources Of Truth

Read only what is needed, but do not plan blind.

Required sources:

1. `CLAUDE.md`
2. `README.md`
3. the GitHub issue and relevant comments
4. the linked product-level `plan.md`, if present
5. relevant docs or existing plans under `docs/`
6. the touched implementation area
7. `EVALS.md` if agents, skills, or eval-backed behavior may change

## Planning Standard

Every substantial plan should cover:

1. goal
2. scope
3. non-goals
4. linked product-plan summary
5. current implementation gap
6. architectural boundaries
7. file or subsystem touch map
8. changed behavior surfaces for agents and skills
9. deterministic tests to run
10. evals to rerun or create
11. risks and mitigations
12. implementation steps
13. acceptance and exit criteria
14. deferred follow-ups

Use the outline in `contributor-skills/technical-planning/plan-template.md`.

## Repo-Specific Boundaries

Plans in this repo must preserve these boundaries:

1. keep agents, skills, templates, docs, and tests aligned in the same slice when
   behavior changes
2. preserve reusable/generic skill and agent wording; avoid product-specific examples
3. keep planning distinct from implementation and from library maintenance work
4. prefer small files and explicit interfaces over broad prompt-only guidance
5. prefer integration-style verification when a real workflow can be exercised
6. treat skill or agent evals as a quality gate, not as optional polish

When relevant, call out what does **not** belong in the current slice.

## Affected Behavior Surfaces

Plans must explicitly name which reusable surfaces change behavior because of this work.

For each touched surface, record:

1. surface name
2. files likely to change
3. behavior that changes
4. downstream docs/tests/evals that must move with it

Surfaces to consider:

1. agents
2. skills
3. templates
4. initialize runtime docs
5. CLI tools
6. setup or distribution workflow
7. eval harness or eval cases

Do not stop at "files to edit." Name the behavior shift.

## Eval Planning

Every plan must include an eval impact section.

For each impacted behavior surface, state:

1. whether existing eval coverage already exists
2. which evals must be rerun
3. whether a new eval case must be created before merge
4. what baseline paths are likely to change

Examples:

1. changing `skills/library/SKILL.md` or `skills/initialize/*` means `initialize/all`
2. changing `skills/implementation-planning/*` means `implementation-planning/all` and
   `ticket-writer/all`
3. changing a new product-facing reusable behavior with no eval coverage usually means the
   issue should include creating at least one eval case in the same slice

Do not assume contributor-skill changes themselves need eval-harness coverage. Treat
`contributor-skills/` as maintainer workflow unless the work introduces a real product
surface that users of the plugin will rely on.

## Risk Planning

Do not write generic risks like "tests may fail."

Prefer risks that identify:

1. where behavior could drift
2. what boundary could get blurred
3. what coverage might miss the regression
4. how the slice reduces that risk

Every risk should include a mitigation.

## Output

Write the plan to a **per-issue** directory:

`docs/plans/<issue-number>-<task-name>/plan.md`

If the work is not tied to a numbered issue, use a stable descriptive directory name
**distinct from any existing plan directory**.

**Never write to the linked product-level plan's path or directory.** When the issue's
`Plan:` line points at an existing `docs/plans/<feature>/plan.md`, that file
and its directory are **read-only input** — the technical plan is a separate per-issue
artifact. Reusing the feature path overwrites the product/design plan (this has happened:
several issues that shared one feature slug each clobbered the product `plan.md` in turn).
If a per-issue plan would collide with an existing file, choose a different directory
name; do not overwrite.

Before implementation starts:

1. sanity-check the plan against the issue and linked product plan
2. make sure the affected agents/skills section is concrete
3. make sure the eval section names specific reruns or specific new eval work
4. make sure risks and mitigations are not placeholders

## Anti-Patterns

1. Copying the product-level plan into `docs/plans/` without translating it into repo
   boundaries
2. **Writing the technical plan to the linked product-level plan's path or directory**, overwriting
   it — that path is read-only input; always use a distinct per-issue directory
3. Naming tests but not evals when reusable agent or skill behavior changes
4. Listing file edits without naming the behaviors that change
5. Deferring all risk thinking to code review
