# Issue Execution Skills — Project Plan

**Goal:** Add repo-maintainer skills for executing GitHub issues end-to-end in Alexandria, with a repo-specific technical planning step and a targeted eval gate that reruns only impacted agent/skill evals.

## Why This Exists

The repo already has `skills/implementation-planning`, but that skill stops at planning
artifacts and is intentionally not an execution workflow. The missing workflow is:

1. accept a GitHub issue reference (`#123` or full issue URL)
2. read the issue and its linked product-level `plan.md`
3. write a repo-specific technical plan
4. implement the work against repo boundaries
5. run local review and fix findings
6. run only the evals whose behavior surfaces changed
7. open/update the PR and carry the review loop to a clean state

## Scope

Add these repo-maintainer skills:

1. `contributor-skills/issue-execution/SKILL.md`
2. `contributor-skills/technical-planning/SKILL.md`
3. `contributor-skills/targeted-evals/SKILL.md`

Add supporting reference files when they reduce prompt size:

1. `contributor-skills/technical-planning/plan-template.md`
2. `contributor-skills/targeted-evals/impact-matrix.md`

Keep repo docs aligned where the new workflow creates durable expectations.

## Non-Goals

1. Do not replace the existing `implementation-planning` skill.
2. Do not introduce Symphony-specific abstraction levels or human review stations that
   are not already repo policy here.
3. Do not require blanket eval runs.
4. Do not create a generic GitHub automation framework.
5. Do not merge planning, implementation, and library-maintenance responsibilities into
   one undifferentiated skill.

## Architectural Boundaries To Preserve

### Planning vs execution

`technical-planning` writes or updates `docs/plans/<feature>/plan.md`. It does not
implement code, edit cards, or post-hoc justify implementation drift.

### Execution vs library maintenance

The execution workflow may note affected agents, skills, docs, tests, and evals, but it
must preserve existing repo boundaries such as Conan/Sam/Nit separation and the rule that
planning artifacts are not implementation artifacts.

### Eval selection vs eval execution

The targeted eval step must decide what to run from changed behavior surfaces, not from a
blanket "run all evals" rule. It should use `EVALS.md` and the actual diff as inputs.

### Repo-native process

The new skills should adopt the useful parts of `../symphony-ts/WORKFLOW.md`:

1. issue intake from tracker references
2. branch + plan before substantial implementation
3. self-review before PR
4. full PR follow-through

But they should stay native to Alexandria policy from `CLAUDE.md`, especially:

1. small files and explicit interfaces
2. docs/tests/skills alignment
3. integration-style testing preference
4. targeted skill/agent eval reruns with baseline comparison

## Skill Design

### `issue-execution`

Primary orchestration skill. Lives under `contributor-skills/` so it is available for
repo maintainers without becoming part of the product skill surface. Accepts `#123` or
full GitHub issue URLs. Reads the issue, extracts the linked product-level plan,
creates/reuses a branch, invokes `technical-planning`, implements, runs local review,
invokes `targeted-evals`, opens or updates the PR, and carries CI/review follow-through.

### `technical-planning`

Repo-specific technical planning skill. Lives under `contributor-skills/`. Produces a plan
that explicitly calls out:

1. scope and non-goals
2. touched files and boundaries
3. which agents or skills have changed behavior
4. deterministic tests to run
5. evals to rerun or create
6. concrete risks and mitigations
7. what is deferred

### `targeted-evals`

Post-review eval gate. Lives under `contributor-skills/`. Uses the final diff plus
`EVALS.md` to build an impact matrix, reruns only affected evals, compares results to
baselines, and prepares a PR-ready eval summary. It should explicitly call out when new
eval cases must be created because a new skill or behavior has no meaningful coverage yet.

## Risks And Mitigations

| Risk | Why it matters | Mitigation |
|------|----------------|------------|
| Workflow becomes too Symphony-shaped | This repo has different policy and architecture | Import process shape, not Symphony-specific contracts or layers |
| One giant skill becomes brittle | Harder to maintain and harder to eval | Split into orchestration, planning, and targeted-eval skills |
| Targeted eval rules are too file-based | Shared files can change behavior in multiple skills | Require behavior-surface reasoning, not just path matching |
| New skills ship without enough verification | Repo expects real validation for new workflows | Add at least one eval-backed planning slice if practical; otherwise document the gap explicitly |
| Issue intake is ambiguous | `#123` could refer to another repo in some contexts | Resolve against current repo by default and require explicit override when needed |

## Validation Plan

1. Validate skill structure with `scripts` available in-repo where applicable.
2. Run deterministic tests relevant to touched docs/tooling.
3. Sanity-check that the contributor workflow does not accidentally become a product-skill
   eval-harness surface.
4. Sanity-check that the new workflow does not contradict `CLAUDE.md` or `EVALS.md`.

## Deferred

1. Any automated GitHub comment or PR-template tooling beyond what the skill text itself
   requires.
2. Any future decision to promote contributor workflows into product-facing skills with
   eval-harness coverage.
