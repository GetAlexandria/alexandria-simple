# Technical Plan: Issue 230 Scoreboard ASCII Renderer

- Issue reference: `#230` — `[LIB2-003] Implement scoreboard ASCII renderer`
- Goal: add a deterministic scoreboard renderer that turns pre-derived bucket and area fill data into legible terminal output for the Phase 2 `/library` room
- Linked product plan: `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-003.md`, `docs/alexandria/implementation-plans/library-phase-2/outcomes/O-2.md`, `docs/wizard/scoreboard-derivation.md`

## Scope

- Add the repo-specific technical plan for issue `#230`
- Implement `src/tools/scoreboard.ts` as the canonical renderer for Phase 2 scoreboard output
- Keep the renderer narrowly scoped to formatting a pre-derived scoreboard view model into terminal-friendly text
- Add deterministic coverage for bar fill states, bucket framing, clearance/lock message placement, and representative narrow and wide bucket shapes

## Non-Goals

- Implementing the scoreboard derivation algorithm from live library state beyond the already checked-in spec in `docs/wizard/scoreboard-derivation.md`
- Implementing Raven wizard-mode job logic, session-start orchestration, or conversational copy
- Reading `docs/alexandria/wizard-config.json`, source files, cards, grades, or queues directly in this ticket
- Adding a new persisted scoreboard artifact or changing the wizard engine
- Reworking `/library` or `/wizard` skill text before the renderer is consumed by a later session-start ticket

## Current Gap

- The repo has a checked-in derivation spec from `#229`, but no runtime renderer that turns fill states into the shared scoreboard artifact described in the Phase 2 plan.
- No current tool exposes the Foundation/Core/Amplifier box layout, fill bars, or bucket status messages that Raven is expected to reference.
- The existing `src/tools/wizard.ts` computes tier assignments only; it does not yet have a scoreboard formatting primitive to call once derivation exists.
- Without a deterministic renderer now, later tickets would have to mix terminal layout decisions with state derivation or Raven job work.

## Architectural Boundaries

- The renderer belongs in `src/tools/` as a small TypeScript module with explicit input types and pure formatting helpers.
- This slice should accept pre-derived scoreboard inputs rather than re-implementing the derivation ladder from `docs/wizard/scoreboard-derivation.md`.
- Bucket message text can be rendered, but the logic that decides which message applies should remain simple and view-model-driven rather than recreating Raven procedure logic.
- Tests should prove terminal rendering behavior directly and should not require a full `/library` session or agent invocation.
- Avoid widening the slice into new bin wrappers, setup changes, or user-facing docs unless the implementation makes them necessary.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/230-scoreboard-ascii-renderer/plan.md` | Captures repo-specific scope, boundaries, verification, and eval impact for the issue |
| Scoreboard rendering tool | `src/tools/scoreboard.ts` | Adds the reusable terminal renderer for Foundation/Core/Amplifier scoreboard output |
| Deterministic renderer coverage | `src/tools/scoreboard.test.ts` | Verifies fill-state rendering, bucket layout, message placement, and representative configuration shapes |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Scoreboard rendering primitive | New TypeScript renderer produces the ASCII scoreboard Raven and later session-start work can display | Add deterministic tests that cover representative output shapes and edge cases |
| `library` / Raven wizard-mode behavior | No direct runtime behavior change in this slice; later tickets can call the renderer once derivation/session-start land | Defer agent and skill updates to `LIB2-004` and `LIB2-006` |
| Wizard derivation contract | No change; renderer consumes the derivation contract defined in `docs/wizard/scoreboard-derivation.md` | Keep the renderer input model aligned with the spec without re-deciding fill semantics |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates formatting, type safety, and markdown after adding the plan and renderer code |
| Full deterministic suite | `bun test` | Confirms the renderer and its new tests do not regress existing CLI or fixture behavior |
| Renderer coverage | `bun test src/tools/scoreboard.test.ts` | Fast focused pass while iterating on box layout and bar rendering |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Scoreboard renderer tool | No eval-harness coverage; this is not yet a product skill or agent surface | No eval rerun in this slice | none |
| `library` skill / Raven wizard-mode | Future eval-backed behavior, but not changed here | Do not rerun until a later ticket actually wires the renderer into product behavior | defer to later Phase 2 tickets |
| `wizard` skill | Existing eval coverage, untouched in this slice | No rerun if skill files remain unchanged | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The renderer could quietly re-implement derivation or clearance logic and drift from the checked-in spec | Keep the input model explicitly pre-derived and review the code for formatting-only responsibilities |
| Wide area names or large buckets could produce unreadable line wrapping in the terminal | Add explicit truncation and width handling, then cover both small and large representative shapes in tests |
| The output could look correct for one example but break for some fill states or bucket combinations | Add deterministic assertions for all five lifecycle fills and for Foundation/Core/Amplifier rendering paths |
| The ticket could sprawl into CLI packaging or Raven procedure work because the renderer is intended for those later surfaces | Keep later integration points out of scope and limit this slice to the reusable rendering primitive plus tests |

## Implementation Steps

1. Write this repo-specific plan for issue `#230`.
2. Implement `src/tools/scoreboard.ts` with explicit types, bar rendering helpers, bucket framing, and message placement.
3. Keep the renderer input contract pre-derived so future session-start work can call it without changing its formatting responsibilities.
4. Add `src/tools/scoreboard.test.ts` with representative narrow and wide configuration cases plus edge coverage for `0/25/50/75/100`.
5. Run `bun test src/tools/scoreboard.test.ts`.
6. Run `bun run check`.
7. Run `bun test`.
8. Do a local review pass against the issue, the derivation spec, and the final diff to catch any scope creep.
9. Update or open the PR against `main` from `symphony/230`.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/230-scoreboard-ascii-renderer/plan.md` exists and reflects the renderer-only slice.
2. `src/tools/scoreboard.ts` renders Foundation, Core, and Amplifier buckets into legible terminal output.
3. The renderer covers the five fill states with the expected bar widths and labels.
4. Bucket status messages render beneath the correct bucket and support locked and unlocked states.
5. Deterministic coverage includes at least two representative configuration shapes, including a long-name or large-bucket case.
6. `bun run check` passes.
7. `bun test` passes.

## Deferred Follow-Ups

1. Wire the renderer into Raven wizard-mode and session-start once `LIB2-004` and `LIB2-006` land.
2. Add live-state derivation inputs and any needed adapters for Conan/Sam evidence in later Phase 2 tickets.
3. Add any product-surface eval coverage only when the renderer becomes part of a runnable `/library` behavior rather than a standalone tool.
