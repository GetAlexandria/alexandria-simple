# Issue 25 Plan

## Goal

Move the deterministic initialize engine logic out of prose-only specs and into
executable TypeScript that both tooling and skills can treat as the source of
truth.

## Scope

- Promote the existing initialize configuration computation into a proper
  `packages/ax/src/engine/initialize/` module with typed inputs and outputs.
- Port the deleted deterministic helpers for gap-analysis scoring and
  solicitation/output selection into the same engine module.
- Replace the dirty-mirror QA coverage removed in `#24` with real tests against
  the extracted engine functions.
- Keep the YAML/markdown docs as human-readable reference material, but make
  them point at the TS engine and routed CLI path as the preferred execution
  path where available.

## Expected Outcome

- Deterministic initialize configuration, gap-analysis, and solicitation helpers
  live in TypeScript under `packages/ax/src/engine/initialize/`.
- Existing initialize tooling (`initialize.ts`, lint checks, CLI tests) reuses
  that shared engine instead of owning the logic directly.
- Raven's first-session initialize instructions reference the TS/CLI engine path
  for the configuration computation instead of treating `engine.md` as the only
  executable source.
- `bun run check` and `bun test` pass with real test coverage for the extracted
  engine logic.
