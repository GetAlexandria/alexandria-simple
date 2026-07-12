# Technical Plan

## Header

- Issue reference: `#380` — `[FEAT-055] Scoreboard derivation CLI`
- Goal: Add a deterministic `alxndr` subcommand that reads checked-in Alexandria state, derives per-area scoreboard fills from an explicit knowledge-area mapping table, and emits JSON that the existing ASCII scoreboard renderer can consume directly.
- Linked product plan: `docs/initialize/scoreboard-derivation.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-002.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-006.md`

## Scope

- Add an `alxndr scoreboard` CLI surface with a derivation mode that outputs renderer-compatible JSON.
- Read `alexandria-config.json` plus the current library tree from disk and compute fill values for every active area in the config.
- Check in the repo-owned knowledge-area mapping table that translates initialize areas into deterministic card matchers.
- Keep the existing ASCII renderer in `src/tools/scoreboard.ts` as a separate formatting primitive and make the new derivation code produce its input shape.
- Add deterministic coverage for CLI help/errors, derivation output, and the runtime budget on a fixture-sized library.

## Non-Goals

- Wiring the derivation CLI into Raven or `/library` session-start behavior.
- Replacing the derivation spec in `docs/initialize/scoreboard-derivation.md` with the full richer source/grade/question model from `LIB2-002`.
- Adding LLM eval coverage; this slice is deterministic CLI work only.
- Redesigning the renderer output format or moving the existing renderer under the `alxndr` router.
- Solving the entire long-term vocabulary mismatch between knowledge areas, card types, and retrieval profiles beyond the explicit mapping table needed for this command.

## Linked Product-Plan Summary

- The checked-in derivation spec says the scoreboard is derived from `alexandria-config.json` plus live library state rather than persisted conversation state.
- The issue narrows that general direction into a software-first slice: count library coverage deterministically from the filesystem, no LLM calls, under `50ms`.
- The architecture-review scratch pad already calls out the missing knowledge-area to card-type mapping as a confusion source; this issue turns that gap into code instead of leaving it agentic.

## Current Gap

- The repo has a standalone ASCII renderer in `src/tools/scoreboard.ts`, but nothing in the shipped `alxndr` CLI computes the JSON it expects.
- Knowledge-area coverage is still inferred conversationally by Raven or Conan; there is no deterministic CLI path for deriving it from checked-in state.
- The repo has no checked-in canonical mapping from initialize knowledge areas to library card shapes, and several areas do not map cleanly to a single card type.
- Existing fixtures span both the current `docs/alexandria/library/` layout and older `docs/alexandria/cards/` layouts, so the new command needs a clear path-resolution boundary instead of assuming one exact caller context.

## Architectural Boundaries

- Keep derivation logic in a dedicated tool/helper module and keep `src/tools/scoreboard.ts` focused on rendering only.
- Treat the mapping table as explicit repo-owned software configuration: area ID -> ordered matcher slots. Do not reintroduce agentic inference or fuzzy judgment.
- Allow the CLI input path to be either a repo root or `docs/alexandria/`, then resolve the config and library roots from there.
- Prefer current canonical path `docs/alexandria/library/`; support legacy `docs/alexandria/cards/` only as a fallback when the canonical library root is absent so existing fixture/test conventions remain usable.
- Use deterministic slot coverage to derive `0 | 25 | 50 | 75 | 100`; do not attempt to reproduce the richer future grade/source/question model from the Phase 2 spec in this ticket.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo planning docs | `docs/alexandria/plans/380-scoreboard-derivation-cli/plan.md` | Captures the repo-specific boundary, mapping approach, verification, and runtime target for the issue |
| CLI router | `src/cli/main.ts`, new `src/cli/scoreboard.ts` | Adds a shipped `alxndr scoreboard` surface with help/error handling and derivation output |
| Scoreboard derivation tool | `src/tools/scoreboard-derive.ts`, `src/tools/scoreboard-derive-matchers.ts`, `src/tools/scoreboard-derive-types.ts` | Keeps filesystem derivation logic separate from the repo-owned matcher configuration while preserving the same renderer-compatible JSON contract |
| Scoreboard renderer types | `src/tools/scoreboard.ts` | Reuses the existing renderer input/output contract without broadening it into filesystem derivation |
| Deterministic tests | `src/cli/main.test.ts`, new `src/tools/scoreboard-derive.test.ts` | Covers CLI behavior, output shape, fill derivation, legacy path resolution, and runtime budget |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| CLI tools | New deterministic `alxndr scoreboard derive <path>` path computes scoreboard JSON from checked-in repo state | Keep CLI help and integration tests aligned with the final command surface |
| Scoreboard derivation behavior | Area coverage is computed from an explicit matcher table instead of Raven inferring coverage conversationally | Keep the derivation helper and tests aligned with the checked-in mapping decisions |
| Raven `/library` workflow | No direct prompt/job change in this slice; later work can call the CLI instead of recomputing ad hoc | Defer Raven/session-start integration to later tickets |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Focused derivation coverage | `bun test src/tools/scoreboard-derive.test.ts src/cli/main.test.ts` | Fast iteration loop for mapping logic, CLI help/errors, and runtime assertions |
| Repo formatting/lint/typecheck gate | `bun run check` | Required repo baseline after adding new TypeScript and markdown plan content |
| Full deterministic suite | `bun test` | Required repo baseline; proves the new CLI surface does not regress the existing suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI derivation tool | No eval-harness coverage; deterministic software surface only | No eval rerun needed | none |
| Renderer tool | Existing deterministic tests only | Covered by deterministic test updates if types/helpers move | none |
| Raven / `/library` product behavior | Eval-backed later behavior, untouched in this slice | Do not rerun until a later issue actually wires the CLI into user-facing agent behavior | defer |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The mapping table could be too fuzzy and let unrelated Artifact cards fill multiple knowledge areas | Use explicit matcher slots with type/folder constraints and optional title keywords for artifact-heavy areas, then cover representative distinctions in tests |
| The command could silently depend on only the current `library/` layout and fail against existing repo fixtures or transitional projects | Resolve repo root vs Alexandria root explicitly and support `cards/` only as a fallback when `library/` is absent |
| The derivation algorithm could drift into a partial rewrite of the richer Phase 2 spec and expand scope | Keep this slice limited to filesystem card coverage and 25-point fill increments; defer source/grade/question evidence to later work |
| Runtime assertions could be flaky if they include full process startup overhead | Measure the derivation helper directly for the strict runtime budget, while keeping separate black-box CLI tests for behavior |
| Bucket messages could become an unreviewed mini-copywriting project | Keep messages mechanical and deterministic, just rich enough for renderer compatibility |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/380-scoreboard-derivation-cli/`.
2. Implement a derivation helper module that resolves input paths, parses `alexandria-config.json`, scans the library tree, and computes coverage from an explicit area matcher table.
3. Add a new `src/cli/scoreboard.ts` subcommand and wire it into `src/cli/main.ts`.
4. Reuse the existing renderer input types so derivation output can be piped directly into `src/tools/scoreboard.ts`.
5. Add deterministic tests for help/error handling, fill derivation on fixture-sized libraries, renderer-compatible JSON shape, legacy path fallback, and the `<50ms` runtime target.
6. Run focused tests, then `bun run check`, then `bun test`.
7. Do a local review pass against the issue, the derivation spec, and the final diff to catch mapping-table drift or scope creep.
8. Update or open the PR against `main` from `symphony/380`.

## Acceptance / Exit Criteria

1. `alxndr scoreboard derive <path>` exists and is discoverable through CLI help.
2. The command reads config + library state from disk and emits JSON compatible with `src/tools/scoreboard.ts`.
3. Coverage is derived from an explicit checked-in mapping table rather than agentic inference.
4. Deterministic tests cover the command output and the runtime budget.
5. `bun run check` passes.
6. `bun test` passes.

## Deferred Follow-Ups

1. Replace or augment slot-based fill derivation with the richer source/grade/question evidence model from `docs/initialize/scoreboard-derivation.md` when Raven session-start is implemented.
2. Decide whether the renderer itself should gain an `alxndr scoreboard render` wrapper once there is a real end-to-end scoreboard workflow.
3. Revisit the wider knowledge-area/card-type vocabulary mismatch as a broader design slice instead of overloading this issue with taxonomy cleanup.
