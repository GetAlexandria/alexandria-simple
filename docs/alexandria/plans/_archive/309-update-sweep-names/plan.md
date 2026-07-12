# Issue 309 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#309`
- Goal: replace bare numeric Nit sweep references in active product surfaces with the named lint targets and named cross-system check families now used by `alxndr lint`, while matching the CLI's actual sweep-6 coverage
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-033.md`

## Scope

- Update active agent and skill files that still say only `sweep 1`, `sweep 2`, and similar numeric labels.
- Update active design docs that reusable skills load directly, especially `docs/design/playbook.md`, so they use the same named-target vocabulary.
- Update Alexandria library cards that describe Nit’s workflow so they use target names such as `lines`, `cards`, `graph`, `layers`, `library`, `plans`, `wizard`, and `grades`, or pair those names with the legacy numeric wording where historical continuity is still useful.
- Keep Nit's conceptual six-level model intact while making the operator-facing wording match the current named-target CLI and the named sweep-6 families already documented in repo plans.
- If required Nit eval execution is blocked by a repo-local maintainer workflow defect discovered during verification, allow the smallest runner fix needed to execute or fail that eval deterministically.

## Non-Goals

- Rewriting historical issue plans under `docs/alexandria/plans/` just to modernize old wording.
- Changing lint behavior, CLI routing, rule semantics, or adding new lint targets.
- Retconning every historical mention of numeric sweeps in archived transcripts, eval outputs, or implementation-plan artifacts.
- Editing contributor-skill workflow docs unless they are part of the active product surface that users or agents load directly.

## Current Gap

- `alxndr lint` now exposes human-readable targets, but several checked-in agent, skill, and library-card surfaces still instruct users and agents to think in terms of only `sweep 1` through `sweep 6`.
- The remaining numeric-only wording is inconsistent with the CLI help and with newer nit-cli-hardening plans that already refer to named targets like `plans`, `wizard`, and `grades`.
- `docs/design/playbook.md` is still an active canonical coordination document loaded by shared skills, and it contains many bare numeric sweep references that drift from the newer target names.
- `agents/nit.md` still implies all sweep-6 work is manual, even though the shipped CLI now supports the `grades`, `plans`, and `wizard` targets directly while `paths`, `counts`, and `briefings` remain manual families.
- Some product docs still need the numeric mapping for continuity, so a pure delete/replace pass would risk making older concepts harder to trace.

## Architectural Boundaries

- Keep the change strictly in prompt/docs/library wording unless the eval runner needs the minimal timeout fix required for deterministic eval completion.
- Preserve generic reusable language for agents and skills; do not add repo-specific operational jargon beyond the checked-in target names.
- Treat library cards as product knowledge that should stay coherent with the agent and skill surfaces in the same slice.
- Ground sweep-6 wording in the shipped CLI surface: `grades`, `plans`, and `wizard` are implemented CLI targets; `paths`, `counts`, and `briefings` remain manual named families.
- Prefer wording that introduces the target name first, then optionally keeps the old numeric sweep reference in parentheses where that helps bridge existing mental models.
- The only non-prompt code allowed in this slice is a minimal eval-runner reliability fix directly required to run the impacted Nit evals. Do not broaden into general eval-harness refactors.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Nit agent guidance | `agents/nit.md` | Nit’s operating instructions refer to named targets and named cross-system families instead of bare numeric sweep labels |
| Other agent guidance | `agents/sam.md` | Sam hands work to Nit using named targets rather than only `sweeps 1-4` |
| Nit skill definitions | `skills/nit/sweeps.md` | Sweep headings and descriptions introduce the target names as the primary labels |
| Shared design playbook | `docs/design/playbook.md` | Canonical play definitions name Nit targets and sweep-6 families instead of bare sweep numbers |
| Conan grading skill | `skills/conan/job-grade.md` | Structural pre-gate wording matches the `cards` target instead of numeric-only wording |
| Raven wizard-mode skill | `skills/raven/job-wizard-mode.md` | Raven dispatches Nit using named target language instead of bare numeric sweep ranges |
| Shared play docs | `skills/shared/play-protocol.md`, the former shared orchestration reference doc under `skills/shared/` | Cross-system Nit checks are named more precisely in active reusable team workflow docs |
| Library cards | `docs/alexandria/library/**` cards that mention Nit sweep numbers | Product knowledge cards align with the named target vocabulary while preserving the conceptual model where useful |
| Eval runner | `src/tools/eval-harness.ts` | Required Nit evals fail deterministically on timeout instead of hanging silently |
| Eval harness tests | `tests/eval-runner.test.ts` | Repo test coverage locks in timeout behavior for future eval runs |
| Repo planning docs | `docs/alexandria/plans/309-update-sweep-names/plan.md` | Records scope, boundaries, tests, and eval obligations for this wording migration |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `agents/nit.md` | Nit describes checks using target names (`lines`, `cards`, `graph`, `layers`, `library`) and named sweep-6 families where applicable | Rerun Nit evals and keep library-card wording aligned |
| `agents/sam.md` | Sam hands off to Nit using named target language instead of bare numeric sweep ranges | Rerun Sam evals because agent instructions changed |
| `skills/nit/sweeps.md` | The canonical sweep reference doc presents names as the operator-facing labels | Rerun Nit evals and ensure library-card terminology matches |
| `docs/design/playbook.md` | Play steps and trigger rules refer to named targets plus the correct sweep-6 CLI/manual split | Manual review plus downstream agent evals that consume shared play docs |
| `skills/conan/job-grade.md` | Conan’s structural pre-gate points at `alxndr lint cards` semantics rather than numeric-only wording | Rerun Conan evals because a product skill changed |
| `skills/shared/*` touched in this slice | Shared orchestration wording refers to named cross-system checks | Manual review plus impacted agent evals; no dedicated shared-skill eval suite is currently defined |
| Library cards | Product-library descriptions of Nit reflect the named-target vocabulary | No eval suite directly targets library cards; verify by review and deterministic repo checks |
| `src/tools/eval-harness.ts` | Case-level timeouts are enforced so required evals terminate with artifacts instead of hanging indefinitely | Run `tests/eval-runner.test.ts` plus the impacted Nit eval commands |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo quality gate | `bun run check` | Validates markdown, formatting, shell checks, linting, and typecheck for the docs/prompt slice |
| Eval runner regression | `bun test tests/eval-runner.test.ts` | Verifies the minimal timeout-enforcement fix for required eval execution |
| Wider regression suite | `bun test` | Confirms the wording-only changes do not accidentally break the Bun-native test suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Nit agent / skill surfaces | `nit/all` coverage exists | Rerun | `bin/alexandria-eval run nit/all` |
| Sam agent surface | `sam/all` coverage exists | Rerun if `agents/sam.md` changes | `bin/alexandria-eval run sam/all` |
| Conan skill surface | `conan/all` coverage exists | Rerun if `skills/conan/job-grade.md` changes | `bin/alexandria-eval run conan/all` |
| Raven skill surface | `raven/all` coverage exists | Rerun if `skills/raven/job-wizard-mode.md` changes | `bin/alexandria-eval run raven/all` |
| Shared skill docs | No dedicated eval suite documented | Manual review only unless a downstream eval shows fallout | N/A |
| Library cards | No eval-harness coverage | Manual review plus repo checks | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Numeric sweep wording is removed too aggressively and readers lose the mapping to the six-level Nit model | Use target names as the primary label, but keep parenthetical numeric references where the conceptual ladder still matters |
| Sweep-6 wording drifts from what the repo has actually implemented vs. only planned | Ground the wording in checked-in repo docs and local code: use implemented names like `grades`, `plans`, and `wizard`, and only use other named families where checked-in planning docs already define them |
| Active playbook prose keeps instructing agents with outdated numeric-only terminology | Bring `docs/design/playbook.md` into the same slice as the agent and shared-skill wording so the reusable orchestration docs stay coherent |
| Required eval reruns cannot be completed because the harness ignores case timeouts and hangs silently | Add only the smallest timeout-enforcement change needed for deterministic eval completion and lock it with a focused regression test |
| Historical implementation plans get pulled into the cleanup and create noisy unrelated churn | Keep this slice focused on active agents, skills, and library cards; leave historical plan docs untouched |
| A prompt-only wording change regresses an eval-backed agent behavior unexpectedly | Rerun the impacted agent/skill eval suites after the doc updates and fix any regression before handoff |

## Implementation Steps

1. Add the issue-specific technical plan under `docs/alexandria/plans/309-update-sweep-names/`.
2. Update `agents/` and `skills/` files that still use bare numeric sweep references.
3. Update active shared docs, including `docs/design/playbook.md`, so the named-target mapping is consistent in the coordination layer.
4. Update library cards that describe Nit’s checks so they use the same named vocabulary.
5. Review the diff for wording consistency and make sure the named-target mapping stays coherent across all touched surfaces.
6. Run `bun run check`, `bun test`, and the impacted eval suites.

## Acceptance / Exit Criteria

1. No touched agent or skill file refers to `sweep N` without also naming the target or check family.
2. `skills/nit/sweeps.md` uses named target labels in every sweep section.
3. `docs/design/playbook.md` uses named targets or named sweep-6 families instead of bare numeric sweep references.
4. `agents/nit.md` reflects the actual CLI/manual split for sweep-6 checks.
5. Active library cards that describe Nit’s work use the named target vocabulary consistently.
6. Historical plan docs remain out of scope unless needed as direct supporting context.
7. `bun run check` and `bun test` pass locally.
8. Impacted eval suites hold or improve relative to baseline.

## Deferred Follow-Ups

1. A later cleanup can modernize archived implementation-plan wording if the team decides the historical docs should also adopt the named vocabulary.
2. When additional sweep-6 families become implemented in the CLI, recheck active product docs for any wording drift between planned names and shipped target names.
