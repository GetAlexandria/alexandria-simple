# Technical Plan

## Header

- Issue reference: `#423` — `[FEAT-069] Wire Bridget step 6 to alxndr retrieve and pass eval gate`
- Goal: Route Bridget's mechanical retrieval step through the shipped `alxndr retrieve` subcommand, preserve the agentic-deterministic-agentic boundary in the Bridget docs, and prove the wired behavior holds against the existing Bridget eval gate.
- Linked product plan: `docs/alexandria/implementation-plans/bridget-cli-traversal/tickets/FEAT-069.md` within the checked-in `bridget-cli-traversal` plan.

## Scope

- Add a real `retrieve` subcommand to the unified `alxndr` router while keeping the standalone `alexandria-retrieve` wrapper working.
- Update Bridget's agent/protocol/task-modifier docs so step 6 calls `bin/alxndr retrieve` via Bash instead of the legacy standalone wrapper name.
- Make the fallback rule concrete: when required categories are missing after the CLI result, Bridget may do targeted follow-up, but must log the missing category, action taken, and reason in `provenance-log.md`.
- Add deterministic CLI coverage for the new router path.
- Rerun the Bridget eval gate and check in any accepted baseline changes in the same slice.
- Record the repo-specific implementation, test, and eval boundaries for this issue.

## Non-Goals

- Changing retrieval algorithms, profiles, budgets, or position ordering in `src/tools/retrieve.ts`.
- Reintroducing manual hop-by-hop traversal as a normal Bridget path.
- Adding new retrieve CLI knobs beyond the existing `--seeds`, `--profile`, `--complexity`, `--library`, and `--format` surface.
- Retiring the legacy `alexandria-retrieve` wrapper or sweeping every historical reference in old plans and scratch docs.
- Expanding this issue into broader multi-agent retrieval unification work.

## Current Gap

- Bridget's current prompt/docs still reference `bin/alexandria-retrieve`, not the unified `alxndr retrieve` surface called for by FEAT-069.
- `src/cli/main.ts` does not currently expose a `retrieve` subcommand, so the desired routed command does not actually exist.
- `src/tools/retrieve.ts` is implemented as a standalone script path, not as a reusable CLI function the router can call directly.
- The current Bridget protocol says targeted follow-up happens when mandatory categories are missing, but it does not explicitly require provenance entries naming the missing category, fallback action, and rationale.
- The current deterministic CLI suite covers the standalone retrieve tool, but not the routed `alxndr retrieve` entry point or router help output.

## Architectural Boundaries

- Keep the deterministic retrieval logic in the retrieve tool layer and expose it through the unified router; do not duplicate traversal logic inside Bridget docs.
- Keep Bridget's outer agentic layer limited to task classification, target/profile choice, seed identification, and framing.
- Keep the deterministic middle layer limited to the CLI call and its returned ordering scaffold.
- Keep Bridget's inner agentic layer limited to reading returned cards, verifying mandatory categories, doing narrowly justified fallback searches, logging provenance/gaps, and assembling the briefing.
- Do not patch around missing CLI capabilities by telling Bridget to resume routine manual traversal. If a genuine knob is missing, document the root cause and defer it as follow-on CLI work.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Unified CLI router | `src/cli/main.ts`, new `src/cli/retrieve.ts` | `alxndr retrieve` becomes a real top-level subcommand discoverable via help |
| Retrieve CLI implementation | `src/tools/retrieve.ts` | Retrieve logic becomes reusable from both the legacy wrapper and the unified router without changing its flag contract |
| CLI deterministic coverage | `src/cli/main.test.ts` | Router tests cover help text and routed retrieve execution |
| Bridget agent contract | `agents/bridget.md` | Step 6 and surrounding rules point to `bin/alxndr retrieve`, use CLI positions directly, and make fallback logging explicit |
| Context briefing protocol | `skills/context-briefing/protocol.md` | The default assembly path becomes `bin/alxndr retrieve`, and provenance logging requirements for missing-category fallback are hardened |
| Bridget task-modifier guidance | `skills/context-briefing/task-modifiers.md` | Mapping examples reference the routed CLI surface that FEAT-069 expects |
| Bridget eval baselines | `tests/evals/bridget/assembly/*` if outputs change | Baseline continues to represent the accepted wired behavior after rerun/compare |
| Repo planning docs | `docs/alexandria/plans/423-bridget-alxndr-retrieve/plan.md` | Captures the repo-specific scope, risk, and verification contract for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Bridget agent behavior | Step 6 now instructs Bridget to invoke `bin/alxndr retrieve` with the FEAT-068 mapping rather than the legacy standalone wrapper name | Rerun Bridget eval coverage and keep prompt/protocol wording aligned |
| Bridget fallback behavior | Missing mandatory categories now require explicit provenance entries naming the gap, the targeted fallback action, and why Bridget used it | Ensure eval artifacts and protocol prose reflect the stricter logging contract |
| Bridget ordering guidance | Bridget is told to use the CLI's returned `beginning` / `middle` / `end` positions directly rather than re-ranking the card set | Verify the agent/protocol wording preserves the attention-shape rationale without re-implementing it in prose |
| Unified CLI surface | `alxndr retrieve` becomes a stable routed command alongside the existing standalone wrapper | Update help tests and examples in the touched Bridget docs to the routed form |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Retrieve tool coverage | `bun test src/tools/retrieve.test.ts` | Confirms the standalone retrieve surface still behaves after refactoring |
| Unified CLI coverage | `bun test src/cli/main.test.ts` | Protects the new routed subcommand and help output |
| Repo formatting/lint/typecheck gate | `bun run check` | Required repo baseline for TypeScript and Markdown prompt updates |
| Deterministic integration suite | `bun test` | Required repo baseline; catches cross-surface regressions |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Bridget agent + context-briefing skill | `tests/eval-cases/bridget/assembly` with baselines under `tests/evals/bridget/assembly/` | Rerun the existing Bridget eval and compare against the FEAT-067 baseline after wiring | `bin/alexandria-eval run bridget/assembly` then `bin/alexandria-eval compare bridget/assembly` |
| Unified CLI router | Deterministic coverage only | Add/update router tests rather than eval coverage | `bun test src/cli/main.test.ts` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Refactoring `src/tools/retrieve.ts` for router reuse could break the legacy standalone wrapper | Keep the legacy entrypoint behavior intact and cover both the tool test suite and routed CLI tests |
| Bridget docs could say `alxndr retrieve` exists before the router actually does | Land the routed subcommand and the doc updates in the same slice |
| Hardening fallback logging could be described vaguely enough that review cannot tell whether the boundary is preserved | Make the provenance requirements explicit in both agent and protocol wording: missing category, fallback action, and reason |
| The Bridget eval could regress on retrieval-profile adherence after switching command surfaces | Use the existing compare gate, inspect results immediately, and only accept baseline updates if scores hold or improve |
| The change could accidentally drift from FEAT-068's mapping contract | Keep task-modifier examples tied to the existing flag mapping and avoid inventing new CLI flags in prompt prose |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/423-bridget-alxndr-retrieve/`.
2. Refactor `src/tools/retrieve.ts` into a reusable CLI function with help/error handling that still supports the legacy standalone executable.
3. Add a router wrapper for `alxndr retrieve` and register it in `src/cli/main.ts`.
4. Extend deterministic CLI tests to cover `alxndr --help` listing `retrieve` and routed retrieve execution.
5. Update `agents/bridget.md`, `skills/context-briefing/protocol.md`, and `skills/context-briefing/task-modifiers.md` to reference `bin/alxndr retrieve`, direct use of CLI positions, and the provenance-logged missing-category fallback rule.
6. Run a local review pass over the diff to check for prompt/protocol/router drift.
7. Run the targeted Bridget eval gate plus the relevant deterministic repo checks.

## Acceptance / Exit Criteria

1. `alxndr retrieve` exists as a routed command and preserves the current retrieve flag contract.
2. Bridget's updated agent/protocol docs identify the three layers clearly: agentic framing, deterministic CLI retrieval, agentic verification/assembly.
3. Bridget's touched docs reference `bin/alxndr retrieve` rather than the standalone wrapper for step 6.
4. The missing-mandatory-category fallback rule explicitly requires provenance entries naming the category, action, and reason.
5. `bun test src/tools/retrieve.test.ts`, `bun test src/cli/main.test.ts`, `bun run check`, and `bun test` pass locally.
6. `bin/alexandria-eval run bridget/assembly` and `bin/alexandria-eval compare bridget/assembly` complete without unresolved regressions, including criterion 7.

## Deferred Follow-Ups

1. If the eval shows a real retrieval-profile mismatch caused by a missing CLI knob, file a dedicated CLI follow-on instead of restoring manual traversal in Bridget.
2. Later, decide whether the standalone `alexandria-retrieve` wrapper should be retired once all checked-in product-facing surfaces have migrated to `alxndr retrieve`.
