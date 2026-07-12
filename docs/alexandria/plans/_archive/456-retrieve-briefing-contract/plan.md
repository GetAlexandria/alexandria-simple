# Technical Plan

## Header

- Issue reference: `#456` — `[FEAT] Product-validate alxndr retrieve against Bridget's real briefing contract`
- Goal: Validate `bin/alxndr retrieve` against the real Bridget briefing contract using the checked-in TaskFlow fixture, and tighten retrieval prioritization so contract-critical categories are surfaced deterministically instead of being displaced by alphabetical tie-breaks.
- Linked product plan: No checked-in product-level `plan.md` link was provided in the issue handoff. Implementation is based on the sanitized issue summary, Bridget's checked-in protocol, the existing Bridget eval baseline, and the shipped retrieve CLI behavior.

## Scope

- Add issue-specific deterministic coverage that exercises `src/tools/retrieve.ts` against the richer `tests/fixtures/taskflow-healthy/` library rather than the minimal graph fixture.
- Encode a realistic Bridget assembly scenario based on the existing Board View keyboard-shortcuts briefing contract.
- Adjust retrieve candidate prioritization so profile-relevant category types win over alphabetical spillover when budgets are tight.
- Keep the CLI surface and output schema unchanged while improving which cards land in the returned set.
- Record the repo-specific behavior, risks, and verification gates for this issue.

## Non-Goals

- Rewriting Bridget's prompt, protocol, or retrieval-profile docs.
- Changing CLI flags, output fields, or the routed command surface.
- Making `retrieve` solve all of Bridget's final judgment work; Bridget still verifies gaps and chooses how to present the returned set.
- Replacing the Bridget eval gate with deterministic tests.
- Introducing product-specific heuristics tied to TaskFlow card names or one-off card IDs.

## Linked Product-Plan Summary

- The sanitized issue summary says the current `retrieve` coverage proves graph-traversal determinism more than the actual briefing contract Bridget and Raven depend on.
- The repo already has Bridget contract documents and a checked-in TaskFlow eval baseline that express a real assembly job: Board View keyboard shortcuts with Workflow Engine constraints and governing WHY cards.
- This issue translates that product intent into a repo slice that hardens deterministic coverage and, if needed, corrects the selector behavior those tests expose.

## Current Implementation Gap

- `src/tools/retrieve.test.ts` currently focuses on small-fixture traversal shape, budgets, and help text rather than a real briefing contract.
- The current ranking in `src/tools/retrieve.ts` breaks ties mostly by distance and card name, which can drop contract-critical categories like parent domains or experience rationale cards from the returned budget.
- The richer `tests/fixtures/taskflow-healthy/` fixture already contains the same cards and rationale chain used by Bridget's TaskFlow assembly baseline, but retrieve does not use that fixture in its deterministic coverage.
- The current tests would not catch regressions where `retrieve` still returns a stable list but no longer gives Bridget the right category mix for a real task.

## Architectural Boundaries

- Keep traversal and ranking logic in `src/tools/retrieve.ts`; do not duplicate Bridget assembly logic in tests or docs.
- Keep the retrieve CLI schema stable so routed and standalone callers continue to work unchanged.
- Use generic card-type categories derived from Bridget's checked-in profile contract, not TaskFlow-specific card names, when refining prioritization.
- Let Bridget retain the final agentic responsibilities: task framing, mandatory-category verification, gap honesty, and final briefing assembly.
- Keep the deterministic validation black-box: invoke the retrieve CLI as shipped rather than unit-testing internals only.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Retrieve selection logic | `src/tools/retrieve.ts` | Non-architectural candidates are prioritized by profile-relevant category types instead of pure distance-plus-name ordering when budgets are tight |
| Retrieve deterministic coverage | `src/tools/retrieve.test.ts` | Adds a TaskFlow-backed contract test for a Bridget-relevant Section briefing scenario |
| Repo planning docs | `docs/alexandria/plans/456-retrieve-briefing-contract/plan.md` | Captures the repo-specific intent, coverage, and boundaries for this issue |

## Changed Behavior Surfaces

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Retrieve CLI output composition | Returned cards for real briefing scenarios should preserve contract-critical category coverage more reliably under budget pressure | Extend retrieve tests so the improved composition is pinned to a real fixture |
| Bridget-adjacent deterministic validation | Retrieve is now tested against a real briefing contract rather than only synthetic traversal properties | Keep the test scenario aligned with the existing Bridget TaskFlow contract if that fixture evolves |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Retrieve tool coverage | `bun test src/tools/retrieve.test.ts` | Covers the new real-fixture contract test and existing retrieve CLI behavior |
| Repo formatting/lint/typecheck gate | `bun run check` | Required repo baseline for TypeScript and Markdown changes |
| Deterministic integration suite | `bun test` | Required repo baseline; catches broader regressions from retrieval ranking changes |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Bridget agent + context-briefing skill | Existing eval coverage under `tests/eval-cases/bridget/assembly` and baselines under `tests/evals/bridget/assembly/` | No prompt or skill wording change is planned; use the existing Bridget baseline as the contract reference for the deterministic test design, but do not rerun Bridget evals unless implementation expands into agent/skill files | None planned for this slice |
| Retrieve CLI | Deterministic coverage only | Add real-fixture black-box coverage in `src/tools/retrieve.test.ts` | `bun test src/tools/retrieve.test.ts` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| A ranking tweak could overfit to the TaskFlow fixture instead of general briefing categories | Encode priorities by generic card types and profile categories, not by fixture-specific card names |
| Retrieve could preserve the new contract scenario while regressing simpler fixture behavior | Keep the existing retrieve test coverage alongside the new contract test and run the full retrieve suite |
| The deterministic test could accidentally assert Bridget's final assembly judgment rather than retrieve's selection responsibility | Scope assertions to retrieved category coverage and ordering roles, not full briefing prose |
| Improving category prioritization could silently change routed CLI output in ways review cannot see | Review the before/after real-fixture output directly during the local review pass and keep the schema unchanged |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/456-retrieve-briefing-contract/`.
2. Inspect the TaskFlow fixture and Bridget assembly baseline to identify the category mix a real Section briefing needs from retrieve.
3. Refine `src/tools/retrieve.ts` ranking so profile-relevant categories are favored over alphabetical spillover when non-architectural budgets are applied.
4. Extend `src/tools/retrieve.test.ts` with a black-box CLI test against `tests/fixtures/taskflow-healthy/docs/alexandria/cards`.
5. Run retrieve-focused verification first, then the repo baseline checks.
6. Perform a local diff review to confirm the new ranking change stays inside the retrieve boundary.

## Acceptance / Exit Criteria

1. `src/tools/retrieve.test.ts` contains a real-fixture contract test tied to Bridget's Board View keyboard-shortcuts scenario.
2. The retrieve output for that scenario includes the contract-critical category mix Bridget needs: target section, hard dependency system, parent-domain context, governing WHY chain, and experience rationale.
3. The retrieve CLI output schema and command-line surface remain unchanged.
4. `bun test src/tools/retrieve.test.ts`, `bun run check`, and `bun test` pass locally.
5. The implementation avoids TaskFlow-specific card-name heuristics in the selection logic itself.

## Deferred Follow-Ups

1. If other profiles show similar contract gaps after this slice, add dedicated real-fixture contract tests for those profiles rather than expanding this issue into a full retrieve rewrite.
2. If Bridget evals later expose a remaining mismatch between selector output and final briefing quality, file a follow-up issue for profile-specific ranking refinements or richer retrieve output metadata.
