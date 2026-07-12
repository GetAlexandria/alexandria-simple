# Issue 347 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#347`
- Goal: standardize the five remaining agent definition files around one canonical section order, preserve each agent's unique instructions inside a consistent template, and document that template for future agent work
- Linked product plan: [FEAT-047](../../implementation-plans/architecture-review-hardening/tickets/FEAT-047.md), [O-5](../../implementation-plans/architecture-review-hardening/outcomes/O-5.md), [architecture-review-hardening release](../../implementation-plans/architecture-review-hardening/release.md)

## Scope

- Add the issue-specific repo plan for the agent-format slice.
- Audit the current five active agent files and derive one canonical top-level section order.
- Update `agents/conan.md`, `agents/sam.md`, `agents/bridget.md`, `agents/raven.md`, and `agents/solomon.md` so they use the same top-level section names and ordering while preserving each agent's actual behavioral instructions.
- Document the canonical template in a maintainer-facing design doc for future agent creation and refactors.
- Align eval guidance docs with the real impacted surfaces if existing coverage docs are missing one of the changed agents.

## Non-Goals

- Rewriting the actual job logic, role boundaries, or substantive behavior of the five agents beyond the structural prompt reshaping needed for consistency.
- Changing the Claude Code plugin registration model, agent frontmatter schema, or model routing decisions.
- Broadly rewriting historical design/library content about the retired Nit agent beyond what is necessary to document the current template and verification workflow.
- Creating a general-purpose generator or scaffolding CLI for new agents.

## Current Gap

- The five active agent files use inconsistent section names and ordering, which makes the prompt shape harder to compare and maintain.
- Some agent-specific instructions live in bespoke top-level sections (`Assembly Procedure`, `Mental Model`, `What You Read That Others Don't`, `Mandatory First Response`) rather than inside a shared template slot.
- The repo does not currently have a checked-in canonical template doc that says what sections an Alexandria agent file should contain and in what order.
- The checked-in eval guidance documents omit Solomon even though Solomon already has eval cases and baselines, so the current QA instructions are incomplete for this slice.

## Architectural Boundaries

- Preserve the active five-agent runtime surface exactly as Claude Code expects: frontmatter stays intact and the files remain the auto-discovered source of truth.
- Treat this as a structural legibility change, not a role redesign. If wording must move between sections, the underlying capability boundaries and output contracts must remain unchanged.
- Keep the canonical template documentation maintainers can actually use when creating or reviewing agent files; do not bury the standard only in issue-specific prose.
- Keep eval guidance aligned with the agent surfaces modified here so the repo's "modify agent -> rerun the right evals" contract stays truthful.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo planning docs | `docs/alexandria/plans/347-agent-file-format/plan.md` | Records repo-specific scope, verification, and eval boundaries for FEAT-047 |
| Agent runtime surface | `agents/conan.md`, `agents/sam.md`, `agents/bridget.md`, `agents/raven.md`, `agents/solomon.md` | All five agent prompts share one canonical top-level structure while preserving agent-specific instructions |
| Maintainer design docs | `docs/design/agent-file-format.md` | Documents the required section order and how unique instructions should be placed in future agent files |
| Eval guidance | `EVALS.md`, `contributor-skills/targeted-evals/impact-matrix.md` | QA docs correctly describe the impacted agent eval suites, including Solomon coverage that already exists on disk |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Conan agent | Reorganize existing instructions into the canonical section order and place Conan-only heuristics in the agent-specific slot | Rerun Conan evals and keep output-rule wording intact |
| Sam agent | Reframe existing workflow/rules into the shared template and add the missing shared sections from current prompt content | Rerun Sam evals and preserve "Sam is the only card writer" boundary |
| Bridget agent | Convert the current assembly procedure/output contract into the shared template without changing briefing requirements | Rerun Bridget evals and preserve the exact `CONTEXT_BRIEFING.md` contract |
| Raven agent | Move bespoke read/produce notes and handoff-format rules into the shared template while preserving the handoff block requirements | Rerun Raven evals and preserve the terminal `## Raven Handoff` contract |
| Solomon agent | Fold the tension brief / settledness instructions into the shared template while preserving the first-response contract | Rerun Solomon evals and update eval guidance docs that currently omit this surface |
| Maintainer docs | Add a canonical template reference for future agent authoring | Keep the documentation aligned with the actual section order shipped in `agents/*.md` |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Active lint surface | `bin/alxndr lint all . --json` | Confirms the repo still passes the shipped lint CLI after agent/doc edits |
| Repo quality gate | `bun run check` | Required formatting, markdown, shell, lint, and typecheck gate for touched agent/docs surfaces |
| Regression suite | `bun test` | Ensures the broader repo test suite still passes after prompt/doc restructuring |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Conan agent | `tests/eval-cases/conan/*`, `tests/evals/conan/*` | Rerun because `agents/conan.md` changes prompt structure and output-rule placement | `bin/alexandria-eval run conan/all` |
| Bridget agent | `tests/eval-cases/bridget/*`, `tests/evals/bridget/*` | Rerun because `agents/bridget.md` changes prompt structure around briefing assembly/output rules | `bin/alexandria-eval run bridget/all` |
| Sam agent | `tests/eval-cases/sam/*`, `tests/evals/sam/*` | Rerun because `agents/sam.md` changes prompt structure and shared section ordering | `bin/alexandria-eval run sam/all` |
| Raven agent | `tests/eval-cases/raven/*`, `tests/evals/raven/*` | Rerun because `agents/raven.md` changes prompt structure around handoff and response rules | `bin/alexandria-eval run raven/all` |
| Solomon agent | `tests/eval-cases/solomon/*`, `tests/evals/solomon/*` | Rerun because `agents/solomon.md` changes prompt structure; also fix docs to acknowledge existing coverage | `bin/alexandria-eval run solomon/all` |
| Eval guidance docs | `EVALS.md`, `contributor-skills/targeted-evals/impact-matrix.md` currently omit Solomon coverage | Update the docs in the same slice; no new eval case required | Covered by deterministic checks plus Solomon rerun above |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Structural cleanup could accidentally weaken a hard prompt contract by moving or renaming a critical section | Preserve the actual rule text, keep agent-specific mandates explicit, and review each file against its prior behavioral obligations before testing |
| A single canonical order could flatten useful agent-specific context | Reserve an explicit agent-specific slot at the end of the template so unique heuristics survive without forcing bespoke top-level structure |
| QA docs could remain out of sync with the real eval coverage | Update `EVALS.md` and the targeted-evals impact matrix in the same slice and verify the listed suites exist on disk |
| Prompt reshaping may cause subtle eval regressions even if the content is semantically similar | Rerun the impacted agent eval suites, inspect results/compare output, and update baselines only when scores hold or improve |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/347-agent-file-format/`.
2. Define the canonical top-level section order based on the current majority pattern and the FEAT-047 implementation note about preserving unique sections in an agent-specific slot.
3. Add a maintainer-facing template doc describing the canonical section order, required vs. optional content, and where agent-specific instructions belong.
4. Update the five active agent files to use the canonical headings/order while preserving their actual job, rule, and output contracts.
5. Update eval guidance docs so the impacted rerun instructions include Solomon's existing coverage.
6. Perform a local diff review for behavioral drift, then run `bin/alxndr lint all . --json`, `bun run check`, `bun test`, and the targeted agent eval suites.
7. If eval scores hold or improve, stage any updated baselines, commit the slice, push the issue branch, and open or update the PR against `main`.

## Acceptance / Exit Criteria

1. A checked-in canonical agent file template exists and matches the structure actually used by the five active agent files.
2. `agents/conan.md`, `agents/sam.md`, `agents/bridget.md`, `agents/raven.md`, and `agents/solomon.md` use the same top-level section names and order.
3. Each agent still preserves its unique required behavior and output contract after the structural rewrite.
4. Eval guidance docs accurately name the impacted agent suites, including Solomon.
5. `bin/alxndr lint all . --json`, `bun run check`, `bun test`, and the targeted agent eval suites pass locally.

## Deferred Follow-Ups

1. If maintainers later want scaffold generation for new agents, that should be a separate workflow/tooling ticket rather than folded into this structural standardization slice.
2. If the product library needs a first-class `Standard - Agent File Format` card in addition to the maintainer design doc, that can land as a follow-up once the prompt template has stabilized in practice.
