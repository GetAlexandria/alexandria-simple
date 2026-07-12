# Scope

Create or refine a durable technical implementation plan for the requested
Alexandria feature. Do not edit implementation files in this stage.

Read and obey:

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- Package-local `CLAUDE.md`, README, and guidance files for packages or
  surfaces named by the issue or relevant existing plans.
- `EVALS.md` if the requested feature changes reusable agent, skill, or
  eval-backed behavior

Planning rules:

- Follow `skills/maintainer/technical-planning/SKILL.md` as the planning
  standard for this stage.
- Write the plan to
  `docs/alexandria/plans/<stable-feature-slug>/plan.md`.
- If a relevant plan already exists, refine it instead of creating a duplicate.
- Keep work scoped to the canonical Alexandria packages and surfaces named by
  the issue.
- Keep deterministic CLI behavior in `packages/ax` when CLI behavior changes.
- Keep guided play behavior in `packages/alexandria-plugin` when plugin
  behavior changes.
- Do not freehand-edit `docs/alexandria/library`; it is the live product
  library. Only touch that path when the approved plan explicitly owns a
  library migration or generated card update.
- Use Effect patterns already present in touched Effect packages and
  `repos/effect`.
- Include black-box tests for CLI behavior, exit codes, and important output
  fields when the CLI changes.
- Include plugin validation when the plugin changes.
- Include Viewer unit/build/browser validation when Viewer behavior changes.
- Include an eval impact section that names specific eval reruns or explains
  why no eval-harness coverage is required for the slice.
- Include risks, mitigations, acceptance criteria, and deferred follow-ups.

Implementation handoff output:

- After writing or refining the plan, read the plan file back from disk.
- Your final response is what the implementation stage receives. It must show
  the real plan document, not a summary.
- Start with `Plan ready for implementation: <plan-path>`.
- Then paste the complete Markdown contents of the plan file between these exact
  markers:

```text
--- BEGIN PLAN DOC ---
<complete contents of docs/alexandria/plans/<stable-feature-slug>/plan.md>
--- END PLAN DOC ---
```

- Do not summarize, paraphrase, omit sections, or replace the plan with a status
  report.
- If the plan has risks or open questions that need attention before
  implementation, they must be present in the plan document itself.
