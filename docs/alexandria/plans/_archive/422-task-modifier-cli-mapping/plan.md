# Technical Plan

## Header

- Issue reference: `#422` — `[FEAT-068] Document task-modifier to CLI-flag mapping table in task-modifiers.md`
- Goal: Make Bridget's task-modifier guidance explicitly state how task-type decisions map onto the current `bin/alexandria-retrieve` flag surface so future runtime wiring does not infer unsupported or incorrect CLI arguments.
- Linked product plan: No checked-in product-level `plan.md` link was provided in the issue handoff. Implementation is based on the sanitized issue summary plus checked-in Bridget docs and retrieve CLI behavior.

## Scope

- Add an issue-specific technical plan for this documentation slice.
- Update `skills/context-briefing/task-modifiers.md` with a concrete mapping table from task type to retrieve CLI usage.
- Clarify which parts of task-modifier behavior are represented by `--profile` and `--complexity`, and which parts remain Bridget judgment after the CLI returns candidates.
- Keep the modifier prose aligned with the currently shipped `bin/alexandria-retrieve` interface.

## Non-Goals

- Changing `src/tools/retrieve.ts` behavior, adding new retrieve flags, or altering traversal algorithms.
- Reworking Bridget's broader protocol, retrieval profiles, or traversal guide beyond what is necessary to keep the mapping accurate.
- Introducing a new deterministic test suite just for this documentation table.
- Changing non-Bridget skills, agents, or downstream automation for FEAT-069 in this slice.

## Current Gap

- `skills/context-briefing/task-modifiers.md` explains retrieval shifts in prose terms like "expand upstream" or "prioritize temporal context" without naming the retrieve CLI flags that exist today.
- The shipped retrieve CLI currently exposes `--seeds`, `--profile`, `--complexity`, `--library`, and `--format`; it does not expose task-type-specific flags for temporal, lateral, or WHY-chain emphasis.
- Without an explicit mapping, follow-on runtime work could incorrectly treat task modifiers as direct traversal flags instead of a mix of `--complexity`, target-type profile selection, and post-retrieval manual follow-up.

## Architectural Boundaries

- Keep this slice in the Bridget skill documentation layer.
- Treat `src/tools/retrieve.ts` as the source of truth for the available CLI flags and budget tiers.
- Preserve the separation between target-type retrieval profiles and task-type modifiers: profiles control structural traversal defaults, modifiers tune complexity selection and follow-up emphasis.
- Do not broaden this issue into CLI feature work or protocol refactoring.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical plan | `docs/alexandria/plans/422-task-modifier-cli-mapping/plan.md` | Captures repo-specific scope, risks, and verification for the issue |
| Bridget task-modifier guidance | `skills/context-briefing/task-modifiers.md` | Documents the explicit mapping from task type to the current retrieve CLI flags and clarifies what remains manual follow-up |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Bridget task classification guidance | Task modifiers explicitly state that `--profile` still comes from target type, while task type mainly informs `--complexity` defaults and required follow-up checks | Rerun Bridget evals because a product-facing skill file changed |
| Bridget retrieval expectations | The doc now makes clear that "temporal," "upstream," and "lateral" emphasis are not separate retrieve flags in the current CLI | Keep the wording grounded in `src/tools/retrieve.ts` so future runtime work has a stable reference |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo formatting/lint/typecheck gate | `bun run check` | Required repo baseline for markdown changes |
| Deterministic integration suite | `bun test` | Required repo baseline to catch unrelated regressions before PR handoff |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Bridget agent + context-briefing skill | `tests/eval-cases/bridget/*`, baselines under `tests/evals/bridget/*` | Rerun existing Bridget coverage because `skills/context-briefing/task-modifiers.md` is a product-facing Bridget skill file | `bin/alexandria-eval run bridget/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The new table could imply retrieve flags that do not actually exist | Derive every mapped flag from `src/tools/retrieve.ts` and explicitly call out unsupported dimensions as follow-up judgment instead of CLI switches |
| The docs could blur target-type profiles and task-type modifiers | State plainly that `--profile` comes from target classification, not from task type |
| A task-type-to-complexity table could overpromise rigid automation where scope still matters | Present the mapping as the Bridget runtime default and note that unusually small or large tasks may still require overriding the complexity tier honestly |
| Doc-only skill changes could still affect Bridget eval behavior | Rerun `bridget/all` before PR handoff, even if no baseline updates are ultimately needed |

## Implementation Steps

1. Add the issue-specific technical plan under `docs/alexandria/plans/422-task-modifier-cli-mapping/`.
2. Update `skills/context-briefing/task-modifiers.md` with an explicit retrieve-CLI mapping section.
3. Make the mapping explain the current division of labor between `--profile`, `--complexity`, and post-retrieve manual follow-up.
4. Review the edited docs against `skills/context-briefing/protocol.md` and `src/tools/retrieve.ts` for drift.
5. Run `bun run check`, `bun test`, and `bin/alexandria-eval run bridget/all`.

## Acceptance / Exit Criteria

1. `task-modifiers.md` contains a readable mapping table from task types to the current retrieve CLI flags.
2. The doc explicitly states that target type drives `--profile`, not task type.
3. The doc explicitly states that temporal, upstream, and lateral emphasis are not separate CLI flags in the current implementation.
4. The repo-specific plan is checked in.
5. `bun run check`, `bun test`, and `bin/alexandria-eval run bridget/all` complete without unresolved regressions.

## Deferred Follow-Ups

1. If FEAT-069 needs richer runtime control than `--complexity` plus target-type `--profile`, add new retrieve CLI flags in a separate slice rather than smuggling them into docs first.
2. Consider moving task-modifier defaults into a machine-readable config if Bridget runtime automation starts consuming them directly.
