# Issue 445 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#445`
- Goal: make `alxndr dag --format json` remain machine-readable when the selected plan directory contains no tickets, including the common `plan.md`-only plan shape.
- Linked product plan: issue summary only; no separate checked-in product plan was linked from the provided issue context.

## Scope

- Fix the DAG CLI empty-plan branch so JSON mode returns JSON instead of plain text.
- Keep `--validate --format json` behavior consistent across empty and non-empty plans so JSON mode remains machine-readable on the full validation path.
- Preserve the existing human-readable behavior for text mode and the current exit-code semantics for validate vs. non-validate flows.
- Add black-box tests for the empty-plan shapes maintainers actually hit: empty `tickets/` directories and plan roots with only `plan.md`.

## Non-Goals

- Changing the normal non-empty DAG JSON schema beyond what is needed to represent the empty-plan condition.
- Reworking text-mode messaging, Mermaid output, cycle detection, or DAG phase computation.
- Updating agents, skills, or broader docs beyond this repo technical plan; the existing CLI docs already state that `--format json` is machine-readable.

## Current Gap

- `src/tools/dag.ts` checks `tickets.size === 0` before honoring `--format json`.
- On that edge path, `alxndr dag <plan-dir> --format json` prints plain text such as `No tickets found in ...`, which breaks automation expecting parseable JSON.
- The current DAG tests only assert part of the JSON contract. The new empty-plan fix also introduces a review-discovered asymmetry where `--validate --format json` returns JSON for empty plans but text for non-empty plans.

## Architectural Boundaries

- Keep the empty-plan contract inside `src/tools/dag.ts`; the router should continue delegating to the shared DAG entrypoint without format-specific logic.
- Keep the JSON fix compatible with the existing DAG report shape so automation can keep reading the same top-level fields.
- Preserve the current text-mode and validation UX unless JSON mode is explicitly requested.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| DAG CLI tool | `src/tools/dag.ts` | Empty-plan JSON requests return machine-readable output instead of plain text, and validation-mode JSON stays consistent on non-empty plans |
| Deterministic DAG coverage | `src/tools/dag.test.ts` | Black-box tests lock in empty-plan JSON behavior plus `--validate --format json` behavior for valid, invalid, and strict validation paths |
| Repo technical plan | `docs/alexandria/plans/445-alxndr-dag-json-empty-plan/plan.md` | Records scope, risks, and verification for this CLI contract fix |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| CLI tools | `alxndr dag --format json` stays parseable when a plan has zero tickets | Update deterministic DAG tests in this slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| DAG empty-plan contract | `bun test src/tools/dag.test.ts` | Covers the standalone and unified DAG entrypoints across the new empty-plan JSON edge cases |
| Repo quality gate | `bun run check` | Required lint/type/format/shell validation for the touched files |
| Wider regression coverage | `bun test` | Confirms the DAG CLI contract fix does not regress the broader Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI tool behavior | Deterministic CLI coverage only; no agent/skill eval surface changes | No eval rerun needed | N/A |
| Agents / skills | Not changed in this issue | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The empty-plan fix could invent a one-off JSON shape that diverges from the normal DAG report contract | Reuse the existing report fields (`phases`, `critical_path`, counts, `validation`) and add only the minimum explicit empty-plan signal needed |
| Adjusting the empty-plan branch could accidentally change text-mode output or exit codes that existing scripts rely on | Keep the non-JSON branch behavior unchanged and add targeted tests for JSON mode rather than broad refactors |
| The bug could remain partially fixed if only empty `tickets/` directories are tested | Add coverage for both empty directory structures and the `plan.md`-only plan root shape called out in the issue summary |

## Implementation Steps

1. Add this issue-specific plan under `docs/alexandria/plans/445-alxndr-dag-json-empty-plan/`.
2. Update `src/tools/dag.ts` so the no-ticket branch emits JSON when `--format json` is requested, and make validation-mode JSON consistent for non-empty plans too.
3. Add black-box DAG tests for empty `tickets/` directories, `plan.md`-only plan roots, and non-empty `--validate --format json` cases, including strict validation.
4. Run targeted DAG tests, then `bun run check`, then the full `bun test` suite.
5. Review the final diff for scope control and contract clarity before PR follow-through.

## Acceptance / Exit Criteria

1. `alxndr dag <plan-dir> --format json` returns valid JSON when the selected plan contains zero tickets.
2. `alxndr dag <plan-dir> --validate --format json` also returns valid JSON and a non-zero exit code on the same edge path.
3. `alxndr dag <plan-dir> --validate --format json` stays machine-readable for non-empty valid and invalid plans as well.
4. The same empty-plan JSON behavior is covered through the standalone DAG executable path.
5. Text-mode empty-plan output remains human-readable and unchanged.
6. `bun test src/tools/dag.test.ts`, `bun run check`, and `bun test` pass locally.

## Deferred Follow-Ups

1. Audit other CLI tools for similar format-contract drift on low-data or empty-input edge cases if related issues appear.
