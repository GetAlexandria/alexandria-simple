# Issue 343 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#343`
- Goal: replace Nit dispatch and handoff instructions in plays, agents, and related workflow docs with explicit `bin/alxndr lint ...` CLI calls that preserve the same mechanical check scope
- Linked product plan: [FEAT-043](../../implementation-plans/architecture-review-hardening/tickets/FEAT-043.md), [O-1](../../implementation-plans/architecture-review-hardening/outcomes/O-1.md), [architecture-review-hardening release](../../implementation-plans/architecture-review-hardening/release.md)

## Scope

- Add a repo-specific plan for the FEAT-043 doc-and-prompt migration slice.
- Update `docs/design/playbook.md` so every play step that previously dispatched Nit now tells the acting agent to run the matching `bin/alxndr lint <target> ...` command directly.
- Update agent files that still describe Nit as the mechanical-check delegate so they instead describe direct CLI usage at the appropriate stage.
- Update shared skills and README workflow text that still describe Nit sweeps as the operational path.
- Keep the check coverage identical to the prior intent: only the execution surface changes from agent dispatch to deterministic CLI invocation.

## Non-Goals

- Retiring the Nit agent file itself or deleting Nit-specific skills; that belongs to FEAT-046.
- Changing `alxndr lint` implementation, target coverage, help text, or deterministic behavior.
- Reworking play ordering, grading policy, or non-mechanical agent responsibilities beyond the minimum wording changes needed to route checks through the CLI.
- Broad prompt cleanup unrelated to Nit-dispatch wording.

## Current Gap

- The lint CLI now covers the deterministic check families that FEAT-043 depends on, but the playbook and several agent/skill prompts still talk about handing work off to Nit.
- Those stale references blur responsibility boundaries: agents are told not to run mechanical checks even though the intended execution model is now direct CLI invocation.
- README and shared orchestration docs still present Nit as the active operational route for structural verification, which conflicts with the current product-plan outcome.

## Architectural Boundaries

- Keep this slice in markdown behavior surfaces only: playbook, agent prompts, skills, and user-facing workflow docs.
- Use explicit `bin/alxndr lint ...` commands in the checked-in wording so the execution path is concrete and testable, not implied.
- Preserve the underlying quality boundaries: Sam still builds, Conan still grades, Bridget still assembles, Raven still orchestrates. The change is that those agents may invoke deterministic lint commands directly instead of dispatching Nit.
- Do not remove Nit-specific assets that still support the current plugin surface until the dedicated retirement issue lands.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo planning docs | `docs/alexandria/plans/343-alxndr-lint-play-references/plan.md` | Captures repo-specific scope, verification, eval impact, and risks for FEAT-043 |
| Play definitions | `docs/design/playbook.md` | Play steps and play summaries call concrete `bin/alxndr lint` targets instead of dispatching Nit |
| Agent prompts | `agents/conan.md`, `agents/sam.md`, `agents/bridget.md`, `agents/raven.md`, `agents/solomon.md` | Division-of-labor and workflow text stop routing structural checks through Nit and describe direct CLI usage instead |
| Shared workflow skills | `skills/shared/play-protocol.md`, the former shared orchestration reference doc under `skills/shared/`, `skills/sam/rules.md`, `skills/conan/job-grade.md`, `skills/raven/job-wizard-mode.md` | Orchestration guidance and reusable workflow wording shift from Nit dispatch to `bin/alxndr lint` commands |
| User-facing repo docs | `README.md` | Team and workflow overview stay aligned with the new deterministic execution path |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Conan | Conan prompt stops treating mechanical checks as Nit-only and instead frames `bin/alxndr lint` as Conan's deterministic pre/post-grade gate | Rerun Conan evals; keep playbook and shared orchestration wording aligned |
| Sam | Sam prompt and rules replace Nit handoffs with direct structural lint/regression commands before Conan review | Rerun Sam evals; keep README and playbook workflow text aligned |
| Bridget | Bridget prompt no longer frames briefing validation as Nit-owned work; briefing compliance is expressed as `bin/alxndr lint briefings ...` | Rerun Bridget evals; keep service-play wording aligned |
| Raven | Raven prompt and wizard-mode skill stop dispatching Nit and instead route structural checks through CLI commands | Rerun Raven evals; keep orchestration skill wording aligned |
| Solomon | Solomon prompt removes stale Nit ownership wording from division-of-labor boundaries | No eval coverage currently listed; verify with deterministic gates only |
| Shared workflow docs | Orchestration and play-protocol guidance describe CLI calls as the mechanical-check path | Covered indirectly by impacted agent evals plus deterministic repo checks |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo structural lint surface | `bin/alxndr lint all . --json` | Validates that the updated repo wording still passes the deterministic lint CLI through the real executable surface |
| Repo quality gate | `bun run check` | Required markdown, shell, formatting, lint, and typecheck gate for touched files |
| Regression suite | `bun test` | Repo-required deterministic coverage before PR handoff |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Conan agent behavior | `agents/conan.md` is eval-backed | Rerun existing coverage after prompt wording changes | `bin/alexandria-eval run conan/all` |
| Sam agent behavior | `agents/sam.md` and Sam workflow wording are eval-backed | Rerun existing coverage after handoff wording changes | `bin/alexandria-eval run sam/all` |
| Bridget agent behavior | `agents/bridget.md` is eval-backed | Rerun existing coverage after briefing-validation wording changes | `bin/alexandria-eval run bridget/all` |
| Raven agent behavior | `agents/raven.md` and `skills/raven/job-wizard-mode.md` are eval-backed | Rerun existing coverage after orchestration wording changes | `bin/alexandria-eval run raven/all` |
| Solomon agent behavior | No explicit eval suite is listed in `EVALS.md` | No eval rerun available; rely on deterministic repo checks | N/A |
| Shared workflow docs | Covered through the impacted agents above rather than their own eval suites | No separate new case planned in this slice | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Playbook wording could change the scope of checks instead of only the execution surface | Map each Nit reference to the exact existing lint target family and keep the same sequencing in the rewritten steps |
| Agent prompts could drift into saying agents now perform qualitative lint judgment | Phrase the change narrowly: agents invoke deterministic CLI checks directly, but judgment responsibilities stay unchanged |
| Shared docs may become inconsistent if only the main playbook is updated | Update agent prompts, shared skills, and README in the same slice, then grep for remaining dispatch wording before verification |
| Prompt-only changes can still regress eval behavior by changing how agents narrate or sequence handoffs | Rerun the impacted eval suites after deterministic review and fix any behavioral regressions before PR handoff |
| FEAT-046 retirement work could get pulled into this issue | Leave Nit-specific files in place and avoid deleting or renaming the Nit surface in this slice |

## Implementation Steps

1. Add the issue plan under `docs/alexandria/plans/343-alxndr-lint-play-references/`.
2. Build a reference-to-command mapping from the current playbook, agent prompts, and shared skills so each Nit dispatch becomes the correct `bin/alxndr lint` target set.
3. Update `docs/design/playbook.md` to replace Nit-agent steps, triggers, and summaries with CLI-driven wording while preserving play ownership and check ordering.
4. Update the affected agent files, shared skills, and README text so their responsibilities match the new CLI execution model.
5. Grep for remaining Nit-dispatch wording in the touched surfaces and resolve any stale references that still imply handoff to Nit.
6. Run deterministic checks, rerun the impacted eval suites, review the diff, and prepare the PR summary from the verified results.

## Acceptance / Exit Criteria

1. Playbook steps that previously dispatched Nit now call explicit `bin/alxndr lint` targets with equivalent scope.
2. Agent and skill files no longer instruct users or agents to hand work off to Nit for mechanical checks.
3. Division-of-labor sections in the touched agent files stop using Nit as the default structural-check executor and instead point to direct CLI usage where relevant.
4. README workflow text matches the updated deterministic lint execution model.
5. `bin/alxndr lint all . --json`, `bun run check`, and `bun test` pass locally.
6. The impacted eval suites (`conan/all`, `sam/all`, `bridget/all`, `raven/all`) are rerun and do not regress.

## Deferred Follow-Ups

1. Delete or retire the Nit agent and Nit-specific product wording in FEAT-046 once all dispatch references are gone.
2. Revisit whether any remaining Nit-only docs should be converted into generic lint-reference docs after retirement lands.
